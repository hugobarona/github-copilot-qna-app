import type { StoredQuestion } from "../types/question.js";
import { generateAnswer } from "./foundryService.js";
import { saveAnswer, saveQuestion } from "./redisService.js";

export interface SubmitQuestionResult {
  question: StoredQuestion;
  answerGenerationError?: string;
}

export async function submitQuestion(
  questionText: string,
): Promise<SubmitQuestionResult> {
  const createdQuestion = await saveQuestion({ question: questionText });

  try {
    const generatedAnswer = await generateAnswer({ question: questionText });
    const updatedQuestion = await saveAnswer(createdQuestion.id, generatedAnswer);

    return {
      question: updatedQuestion,
    };
  } catch (error) {
    return {
      question: createdQuestion,
      answerGenerationError:
        error instanceof Error
          ? error.message
          : "The question was saved, but generating the answer failed.",
    };
  }
}