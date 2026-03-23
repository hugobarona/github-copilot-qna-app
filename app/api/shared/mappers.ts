import type { StoredQuestion } from "../../functions/types/question.js";

export function toQuestionResponse(question: StoredQuestion) {
  return {
    ...question,
    upvotedByUser: false,
  };
}
