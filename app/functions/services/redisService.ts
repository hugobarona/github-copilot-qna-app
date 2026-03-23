import { randomUUID } from "node:crypto";
import { createClient } from "redis";
import type {
  SaveAnswerInput,
  SaveQuestionInput,
  StoredQuestion,
} from "../types/question.js";

const REDIS_QUESTIONS_TAG = "{questions}";
const QUESTION_KEY_PREFIX = `${REDIS_QUESTIONS_TAG}:question:`;
const QUESTIONS_BY_CREATED_KEY = `${REDIS_QUESTIONS_TAG}:byCreatedAt`;
const REDIS_OPERATION_TIMEOUT_MS = Number.parseInt(
  process.env.REDIS_OPERATION_TIMEOUT_MS ?? "10000",
  10,
);

type RedisConnection = ReturnType<typeof createClient>;

let redisClient: RedisConnection | undefined;
let connectPromise: Promise<RedisConnection> | undefined;
const memoryQuestions = new Map<string, StoredQuestion>();

function withTimeout<T>(promise: PromiseLike<T>, operation: string): Promise<T> {
  const timeoutMs = Number.isFinite(REDIS_OPERATION_TIMEOUT_MS)
    ? REDIS_OPERATION_TIMEOUT_MS
    : 10000;

  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Redis operation timed out (${operation}) after ${timeoutMs}ms`));
    }, timeoutMs);

    promise.then(
      (value) => {
        clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function isRedisConfigured(): boolean {
  return Boolean(
    process.env.REDIS_URL ||
      process.env.REDIS_CONNECTION_STRING ||
      (process.env.AZURE_REDIS_HOST && process.env.AZURE_REDIS_KEY),
  );
}

function toQuestionKey(id: string): string {
  return `${QUESTION_KEY_PREFIX}${id}`;
}

function buildRedisUrl(): string {
  if (process.env.REDIS_URL) {
    return process.env.REDIS_URL;
  }

  if (process.env.REDIS_CONNECTION_STRING) {
    return process.env.REDIS_CONNECTION_STRING;
  }

  const host = process.env.AZURE_REDIS_HOST;
  const key = process.env.AZURE_REDIS_KEY;
  const port = process.env.AZURE_REDIS_PORT ?? "6380";

  if (!host || !key) {
    throw new Error(
      "Redis connection is not configured. Set REDIS_URL, REDIS_CONNECTION_STRING, or AZURE_REDIS_HOST + AZURE_REDIS_KEY.",
    );
  }

  return `rediss://:${encodeURIComponent(key)}@${host}:${port}`;
}

function toHash(question: StoredQuestion): Record<string, string> {
  const base: Record<string, string> = {
    id: question.id,
    question: question.question,
    upvotes: String(question.upvotes),
    status: question.status,
    createdAt: question.createdAt,
    updatedAt: question.updatedAt,
  };

  if (question.answer) {
    base.answer = question.answer;
  }

  if (question.answeredBy) {
    base.answeredBy = question.answeredBy;
  }

  return base;
}

function fromHash(hash: Record<string, string>): StoredQuestion {
  return {
    id: hash.id,
    question: hash.question,
    upvotes: Number.parseInt(hash.upvotes ?? "0", 10),
    status: hash.status === "answered" ? "answered" : "unanswered",
    answer: hash.answer,
    answeredBy: hash.answeredBy,
    createdAt: hash.createdAt,
    updatedAt: hash.updatedAt,
  };
}

async function connectRedisClient(): Promise<RedisConnection> {
  const client = createClient({ url: buildRedisUrl() });

  client.on("error", (error) => {
    console.error("Redis client error", error);
  });

  await withTimeout(Promise.resolve(client.connect()).then(() => undefined), "connect");
  redisClient = client;
  return client;
}

async function getRedisClient(): Promise<RedisConnection> {
  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (!connectPromise) {
    connectPromise = connectRedisClient().finally(() => {
      connectPromise = undefined;
    });
  }

  return withTimeout(connectPromise, "getRedisClient");
}

function requireNonEmpty(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${field} cannot be empty`);
  }

  return normalized;
}

export async function saveQuestion(input: SaveQuestionInput): Promise<StoredQuestion> {
  const questionText = requireNonEmpty(input.question, "question");
  const nowIso = input.createdAt ?? new Date().toISOString();

  const question: StoredQuestion = {
    id: input.id ?? randomUUID(),
    question: questionText,
    upvotes: 0,
    status: "unanswered",
    createdAt: nowIso,
    updatedAt: nowIso,
  };

  if (!isRedisConfigured()) {
    memoryQuestions.set(question.id, question);
    return question;
  }

  const client = await getRedisClient();
  const score = Number.isNaN(Date.parse(nowIso)) ? Date.now() : Date.parse(nowIso);

  await withTimeout(
    client.hSet(toQuestionKey(question.id), toHash(question)),
    "hSet(saveQuestion)",
  );
  await withTimeout(
    client.zAdd(QUESTIONS_BY_CREATED_KEY, { score, value: question.id }),
    "zAdd(saveQuestion)",
  );

  return question;
}

export async function getQuestionById(
  id: string,
): Promise<StoredQuestion | null> {
  if (!isRedisConfigured()) {
    return memoryQuestions.get(id) ?? null;
  }

  const client = await getRedisClient();
  const hash = await withTimeout(client.hGetAll(toQuestionKey(id)), "hGetAll");

  if (Object.keys(hash).length === 0) {
    return null;
  }

  return fromHash(hash);
}

export async function saveAnswer(
  questionId: string,
  input: SaveAnswerInput,
): Promise<StoredQuestion> {
  const answerText = requireNonEmpty(input.answer, "answer");
  const existing = await getQuestionById(questionId);

  if (!existing) {
    throw new Error(`Question ${questionId} was not found`);
  }

  const updatedAt = new Date().toISOString();
  const updates: Record<string, string> = {
    answer: answerText,
    status: "answered",
    updatedAt,
  };

  if (input.answeredBy?.trim()) {
    updates.answeredBy = input.answeredBy.trim();
  }

  if (!isRedisConfigured()) {
    const updatedQuestion: StoredQuestion = {
      ...existing,
      answer: answerText,
      status: "answered",
      answeredBy: updates.answeredBy ?? existing.answeredBy,
      updatedAt,
    };
    memoryQuestions.set(questionId, updatedQuestion);
    return updatedQuestion;
  }

  const client = await getRedisClient();
  await withTimeout(client.hSet(toQuestionKey(questionId), updates), "hSet(answer)");

  return {
    ...existing,
    answer: answerText,
    status: "answered",
    answeredBy: updates.answeredBy ?? existing.answeredBy,
    updatedAt,
  };
}

export async function incrementUpvote(
  questionId: string,
): Promise<StoredQuestion> {
  const existing = await getQuestionById(questionId);

  if (!existing) {
    throw new Error(`Question ${questionId} was not found`);
  }

  if (!isRedisConfigured()) {
    const updatedQuestion: StoredQuestion = {
      ...existing,
      upvotes: existing.upvotes + 1,
      updatedAt: new Date().toISOString(),
    };
    memoryQuestions.set(questionId, updatedQuestion);
    return updatedQuestion;
  }

  const client = await getRedisClient();
  await withTimeout(client.hIncrBy(toQuestionKey(questionId), "upvotes", 1), "hIncrBy(upvotes)");
  const updatedAt = new Date().toISOString();
  await withTimeout(client.hSet(toQuestionKey(questionId), { updatedAt }), "hSet(updatedAt)");

  return {
    ...existing,
    upvotes: existing.upvotes + 1,
    updatedAt,
  };
}

export async function getAllQuestions(): Promise<StoredQuestion[]> {
  if (!isRedisConfigured()) {
    return [...memoryQuestions.values()].sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );
  }

  const client = await getRedisClient();
  const ids = await withTimeout(
    client.zRange(QUESTIONS_BY_CREATED_KEY, 0, -1, {
      REV: true,
    }),
    "zRange(questions)",
  );

  if (ids.length === 0) {
    return [];
  }

  const records = await withTimeout(
    Promise.all(ids.map((id) => client.hGetAll(toQuestionKey(id)))),
    "hGetAll(questions)",
  );

  return records
    .filter((hash) => Object.keys(hash).length > 0)
    .map(fromHash)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function disconnectRedis(): Promise<void> {
  if (!isRedisConfigured()) {
    return;
  }

  if (!redisClient?.isOpen) {
    return;
  }

  await withTimeout(
    Promise.resolve(redisClient.quit()).then(() => undefined),
    "quit",
  );
  redisClient = undefined;
}
