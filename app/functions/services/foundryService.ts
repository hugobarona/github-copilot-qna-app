type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export interface GenerateAnswerInput {
  question: string;
  audience?: string;
  systemPrompt?: string;
}

export interface GeneratedAnswer {
  answer: string;
  answeredBy: string;
}

interface FoundryConfig {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
  timeoutMs: number;
  maxRetries: number;
}

interface ChatCompletionsChoice {
  message?: {
    content?: string | Array<{ type?: string; text?: string }>;
  };
}

interface ChatCompletionsResponse {
  choices?: ChatCompletionsChoice[];
  error?: {
    message?: string;
  };
}

const DEFAULT_API_VERSION = "2024-10-21";
const DEFAULT_TIMEOUT_MS = 15_000;
const DEFAULT_MAX_RETRIES = 2;
const DEFAULT_ANSWERED_BY = "Microsoft Foundry GPT";

function readEnv(...names: string[]): string | undefined {
  for (const name of names) {
    const value = process.env[name]?.trim();
    if (value) {
      return value;
    }
  }

  return undefined;
}

function parseNumberEnv(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getFoundryConfig(): FoundryConfig {
  const endpoint = readEnv(
    "FOUNDRY_ENDPOINT",
    "AI_FOUNDRY_ENDPOINT",
    "AZURE_OPENAI_ENDPOINT",
  );
  const apiKey = readEnv(
    "FOUNDRY_API_KEY",
    "AI_FOUNDRY_API_KEY",
    "AZURE_OPENAI_API_KEY",
  );
  const deployment = readEnv(
    "FOUNDRY_DEPLOYMENT",
    "AI_FOUNDRY_DEPLOYMENT",
    "AZURE_OPENAI_DEPLOYMENT",
  );

  if (!endpoint || !apiKey || !deployment) {
    throw new Error(
      "Foundry configuration is incomplete. Set endpoint, api key, and deployment using FOUNDRY_* or AZURE_OPENAI_* environment variables.",
    );
  }

  return {
    endpoint,
    apiKey,
    deployment,
    apiVersion: readEnv(
      "FOUNDRY_API_VERSION",
      "AI_FOUNDRY_API_VERSION",
      "AZURE_OPENAI_API_VERSION",
    ) ?? DEFAULT_API_VERSION,
    timeoutMs: parseNumberEnv(readEnv("FOUNDRY_TIMEOUT_MS"), DEFAULT_TIMEOUT_MS),
    maxRetries: parseNumberEnv(readEnv("FOUNDRY_MAX_RETRIES"), DEFAULT_MAX_RETRIES),
  };
}

function buildChatCompletionsUrl(config: FoundryConfig): string {
  const trimmedEndpoint = config.endpoint.replace(/\/+$/, "");

  if (trimmedEndpoint.includes("/chat/completions")) {
    return trimmedEndpoint.includes("api-version=")
      ? trimmedEndpoint
      : `${trimmedEndpoint}${trimmedEndpoint.includes("?") ? "&" : "?"}api-version=${encodeURIComponent(config.apiVersion)}`;
  }

  if (trimmedEndpoint.includes("/openai/deployments/")) {
    return `${trimmedEndpoint}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`;
  }

  return `${trimmedEndpoint}/openai/deployments/${encodeURIComponent(config.deployment)}/chat/completions?api-version=${encodeURIComponent(config.apiVersion)}`;
}

function buildMessages(input: GenerateAnswerInput): ChatMessage[] {
  const audience = input.audience?.trim() || "a classroom audience";

  return [
    {
      role: "system",
      content:
        input.systemPrompt?.trim() ||
        "You answer student questions clearly and accurately. Return only valid JSON with the shape {\"answer\": string, \"answeredBy\": string}.",
    },
    {
      role: "user",
      content: [
        `Answer this question for ${audience}.`,
        "Keep the answer concise, factual, and easy to understand.",
        `Question: ${input.question.trim()}`,
        `Set answeredBy to \"${DEFAULT_ANSWERED_BY}\" unless a more specific model label is provided.`,
      ].join("\n"),
    },
  ];
}

function extractMessageText(response: ChatCompletionsResponse): string {
  const content = response.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => item.text?.trim() ?? "")
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  throw new Error(response.error?.message ?? "Foundry response did not include any message content.");
}

function stripCodeFence(value: string): string {
  const trimmed = value.trim();
  const fencedMatch = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fencedMatch?.[1]?.trim() ?? trimmed;
}

function parseGeneratedAnswer(rawContent: string): GeneratedAnswer {
  const normalized = stripCodeFence(rawContent);
  let parsed: unknown;

  try {
    parsed = JSON.parse(normalized) as unknown;
  } catch {
    throw new Error(`Foundry response was not valid JSON: ${normalized}`);
  }

  if (
    typeof parsed !== "object" ||
    parsed === null ||
    typeof (parsed as { answer?: unknown }).answer !== "string"
  ) {
    throw new Error("Foundry response JSON must include an answer string.");
  }

  const answer = (parsed as { answer: string }).answer.trim();
  const answeredByValue =
    typeof (parsed as { answeredBy?: unknown }).answeredBy === "string"
      ? (parsed as { answeredBy: string }).answeredBy.trim()
      : DEFAULT_ANSWERED_BY;

  if (!answer) {
    throw new Error("Foundry response answer cannot be empty.");
  }

  return {
    answer,
    answeredBy: answeredByValue || DEFAULT_ANSWERED_BY,
  };
}

function shouldRetry(status: number | undefined, error: unknown): boolean {
  if (typeof status === "number") {
    return status === 408 || status === 429 || status >= 500;
  }

  return error instanceof Error;
}

async function delay(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function generateAnswer(
  input: GenerateAnswerInput,
): Promise<GeneratedAnswer> {
  const question = input.question.trim();
  if (!question) {
    throw new Error("question cannot be empty");
  }

  const config = getFoundryConfig();
  const url = buildChatCompletionsUrl(config);

  let lastError: unknown;

  for (let attempt = 0; attempt <= config.maxRetries; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-key": config.apiKey,
        },
        body: JSON.stringify({
          messages: buildMessages({ ...input, question }),
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
        signal: controller.signal,
      });

      const payload = (await response.json()) as ChatCompletionsResponse;

      if (!response.ok) {
        const message = payload.error?.message || `Foundry request failed with status ${response.status}`;
        const error = new Error(message);

        if (attempt < config.maxRetries && shouldRetry(response.status, error)) {
          await delay(300 * 2 ** attempt);
          lastError = error;
          continue;
        }

        throw error;
      }

      return parseGeneratedAnswer(extractMessageText(payload));
    } catch (error) {
      lastError = error;

      if (attempt < config.maxRetries && shouldRetry(undefined, error)) {
        await delay(300 * 2 ** attempt);
        continue;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Foundry request timed out after ${config.timeoutMs}ms`);
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Foundry request failed");
}