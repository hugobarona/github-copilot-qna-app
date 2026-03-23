import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getAllQuestions } from "../../../functions/services/redisService.js";
import { submitQuestion } from "../../../functions/services/questionSubmissionService.js";
import { toQuestionResponse } from "../../shared/mappers.js";

function json(body: unknown, status = 200): HttpResponseInit {
  return {
    status,
    jsonBody: body,
  };
}

export async function getQuestionsHandler(
  _request: HttpRequest,
  _context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const questions = await getAllQuestions();
    return json({ questions: questions.map(toQuestionResponse) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load questions";
    return json({ error: message }, 500);
  }
}

export async function createQuestionHandler(
  request: HttpRequest,
  _context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const body = (await request.json()) as { question?: string };

    if (!body.question || !body.question.trim()) {
      return json({ error: "question is required" }, 400);
    }

    const result = await submitQuestion(body.question);
    return json(
      {
        question: toQuestionResponse(result.question),
        warning: result.answerGenerationError,
      },
      201,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save question";
    return json({ error: message }, 500);
  }
}

app.http("questions-get", {
  route: "questions",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getQuestionsHandler,
});

app.http("questions-post", {
  route: "questions",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: createQuestionHandler,
});
