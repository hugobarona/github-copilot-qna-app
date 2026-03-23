import { submitQuestion } from "../../functions/services/questionSubmissionService";
import { getAllQuestions } from "../../functions/services/redisService";
import { toQuestionResponse } from "../shared/mappers";

export async function GET(): Promise<Response> {
  try {
    const questions = await getAllQuestions();
    return Response.json({ questions: questions.map(toQuestionResponse) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load questions";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const body = (await request.json()) as { question?: string };

    if (!body.question || !body.question.trim()) {
      return Response.json({ error: "question is required" }, { status: 400 });
    }

    const result = await submitQuestion(body.question);
    return Response.json(
      {
        question: toQuestionResponse(result.question),
        warning: result.answerGenerationError,
      },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save question";
    return Response.json({ error: message }, { status: 500 });
  }
}
