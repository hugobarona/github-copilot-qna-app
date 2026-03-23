import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv } from "vite";
import {
  getAllQuestions,
  getQuestionById,
  incrementUpvote,
} from "./functions/services/redisService";
import { submitQuestion } from "./functions/services/questionSubmissionService";

function sendJson(
  res: import("node:http").ServerResponse,
  statusCode: number,
  payload: unknown,
): void {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

async function readJsonBody(
  req: import("node:http").IncomingMessage,
): Promise<Record<string, unknown>> {
  const chunks: Uint8Array[] = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf-8").trim();
  if (!raw) {
    return {};
  }

  return JSON.parse(raw) as Record<string, unknown>;
}

function toQuestionResponse(
  question: Awaited<ReturnType<typeof getQuestionById>> extends infer T
    ? Exclude<T, null>
    : never,
) {
  return {
    ...question,
    upvotedByUser: false,
  };
}

function redisApiDevPlugin() {
  return {
    name: "redis-api-dev-plugin",
    configureServer(server: import("vite").ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const method = req.method ?? "GET";
        const url = req.url ?? "";
        const pathname = url.split("?")[0] ?? "";

        if (!pathname.startsWith("/api/questions")) {
          next();
          return;
        }

        try {
          if (method === "GET" && pathname === "/api/questions") {
            const questions = await getAllQuestions();
            sendJson(res, 200, {
              questions: questions.map((item) => ({
                ...item,
                upvotedByUser: false,
              })),
            });
            return;
          }

          if (method === "POST" && pathname === "/api/questions") {
            const body = await readJsonBody(req);
            const questionValue =
              typeof body.question === "string" ? body.question : "";

            if (!questionValue.trim()) {
              sendJson(res, 400, { error: "question is required" });
              return;
            }

            const result = await submitQuestion(questionValue);
            sendJson(res, 201, {
              question: toQuestionResponse(result.question),
              warning: result.answerGenerationError,
            });
            return;
          }

          const upvoteMatch = pathname.match(
            /^\/api\/questions\/([^/]+)\/upvote$/,
          );
          if (method === "POST" && upvoteMatch) {
            const questionId = decodeURIComponent(upvoteMatch[1] ?? "");
            const updated = await incrementUpvote(questionId);
            sendJson(res, 200, { question: toQuestionResponse(updated) });
            return;
          }

          const questionMatch = pathname.match(/^\/api\/questions\/([^/]+)$/);
          if (method === "GET" && questionMatch) {
            const questionId = decodeURIComponent(questionMatch[1] ?? "");
            const question = await getQuestionById(questionId);

            if (!question) {
              sendJson(res, 404, { error: "Question not found" });
              return;
            }

            sendJson(res, 200, { question: toQuestionResponse(question) });
            return;
          }

          sendJson(res, 404, { error: "Route not found" });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "Internal server error";
          const statusCode = message.includes("not found") ? 404 : 500;
          sendJson(res, statusCode, { error: message });
        }
      });
    },
  } satisfies import("vite").Plugin;
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Make non-VITE_* env vars (e.g. AZURE_REDIS_HOST/KEY) available to Node-side services.
  Object.assign(process.env, loadEnv(mode, process.cwd(), ""));

  return {
    plugins: [react(), tailwindcss(), redisApiDevPlugin()],
  };
});
