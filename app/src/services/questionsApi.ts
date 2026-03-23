import axios from "axios";
import type { Question } from "../types/question";

const apiClient = axios.create({
  baseURL: "/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

interface QuestionsResponse {
  questions: Question[];
}

interface QuestionResponse {
  question: Question;
  warning?: string;
}

export interface CreateQuestionResult {
  question: Question;
  warning?: string;
}

export async function getQuestions(): Promise<Question[]> {
  const { data } = await apiClient.get<QuestionsResponse | { error?: string }>(
    "/questions",
  );

  if (
    typeof data === "object" &&
    data !== null &&
    "questions" in data &&
    Array.isArray(data.questions)
  ) {
    return data.questions;
  }

  if (typeof data === "object" && data !== null && "error" in data) {
    throw new Error(data.error ?? "Failed to load questions");
  }

  throw new Error(
    "Unexpected response when loading questions. Ensure the /api/questions endpoint is running.",
  );
}

export async function getQuestion(id: string): Promise<Question> {
  const { data } = await apiClient.get<QuestionResponse>(`/questions/${id}`);
  return data.question;
}

export async function createQuestion(question: string): Promise<CreateQuestionResult> {
  const { data } = await apiClient.post<QuestionResponse>("/questions", { question });
  return {
    question: data.question,
    warning: data.warning,
  };
}

export async function upvoteQuestion(id: string): Promise<Question> {
  const { data } = await apiClient.post<QuestionResponse>(`/questions/${id}/upvote`);
  return data.question;
}
