export interface Question {
  id: string;
  question: string;
  upvotes: number;
  status: "answered" | "unanswered";
  upvotedByUser: boolean;
  answer?: string;
  answeredBy?: string;
  createdAt: string;
  updatedAt?: string;
}
