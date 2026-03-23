import { incrementUpvote } from "../../../../functions/services/redisService";
import { toQuestionResponse } from "../../../shared/mappers";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await context.params;
    const question = await incrementUpvote(id);
    return Response.json({ question: toQuestionResponse(question) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upvote question";
    const status = message.includes("not found") ? 404 : 500;
    return Response.json({ error: message }, { status });
  }
}
