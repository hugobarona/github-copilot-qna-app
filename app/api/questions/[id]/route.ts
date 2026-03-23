import { getQuestionById } from "../../../functions/services/redisService";
import { toQuestionResponse } from "../../shared/mappers";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  try {
    const { id } = await context.params;
    const question = await getQuestionById(id);

    if (!question) {
      return Response.json({ error: "Question not found" }, { status: 404 });
    }

    return Response.json({ question: toQuestionResponse(question) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load question";
    return Response.json({ error: message }, { status: 500 });
  }
}
