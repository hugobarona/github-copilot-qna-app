import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { incrementUpvote } from "../../../functions/services/redisService.js";
import { toQuestionResponse } from "../../shared/mappers.js";

function json(body: unknown, status = 200): HttpResponseInit {
  return {
    status,
    jsonBody: body,
  };
}

export async function upvoteQuestionHandler(
  request: HttpRequest,
  _context: InvocationContext,
): Promise<HttpResponseInit> {
  try {
    const questionId = request.params.id;
    const question = await incrementUpvote(questionId);
    return json({ question: toQuestionResponse(question) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upvote question";
    const status = message.includes("not found") ? 404 : 500;
    return json({ error: message }, status);
  }
}

app.http("question-upvote-post", {
  route: "questions/{id}/upvote",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: upvoteQuestionHandler,
});
