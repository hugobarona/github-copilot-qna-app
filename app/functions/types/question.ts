export type QuestionStatus = "answered" | "unanswered";

export interface StoredQuestion {
  id: string;
  question: string;
  upvotes: number;
  status: QuestionStatus;
  answer?: string;
  answeredBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveQuestionInput {
  id?: string;
  question: string;
  createdAt?: string;
}

export interface SaveAnswerInput {
  answer: string;
  answeredBy?: string;
}
