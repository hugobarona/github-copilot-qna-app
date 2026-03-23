import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getQuestionById } from "../../../functions/services/redisService.js";
import { toQuestionResponse } from "../../shared/mappers.js";

function json(body: unknown, status = 200): HttpResponseInit {
  return {
    status,
    jsonBody: body,
  };
}

export async function getQuestionByIdHandler(
  request: HttpRequest,
  _context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const questionId = request.params.id;
    const question = await getQuestionById(questionId);

    if (!question) {
      return json({ error: "Question not found" }, 404);
    }

    return json({ question: toQuestionResponse(question) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load question";
    return json({ error: message }, 500);
  }
}

app.http("question-by-id-get", {
  route: "questions/{id}",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getQuestionByIdHandler,
});
