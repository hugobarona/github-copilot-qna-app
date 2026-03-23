import { useState } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router";
import { QuestionCard } from "../components/QuestionCard";
import { Button } from "../components/ui/button";

interface Question {
  id: string;
  question: string;
  upvotes: number;
  status: "answered" | "unanswered";
  upvotedByUser: boolean;
}

const initialQuestions: Question[] = [
  {
    id: "1",
    question: "Can you explain the difference between TCP and UDP protocols?",
    upvotes: 12,
    status: "answered",
    upvotedByUser: false,
  },
  {
    id: "2",
    question: "What is the purpose of the OSI model in networking?",
    upvotes: 8,
    status: "unanswered",
    upvotedByUser: false,
  },
  {
    id: "3",
    question: "How does DNS resolution work in practice?",
    upvotes: 15,
    status: "answered",
    upvotedByUser: true,
  },
  {
    id: "4",
    question:
      "Could you provide more examples of subnetting calculations?",
    upvotes: 5,
    status: "unanswered",
    upvotedByUser: false,
  },
  {
    id: "5",
    question: "What are the main differences between IPv4 and IPv6?",
    upvotes: 10,
    status: "answered",
    upvotedByUser: false,
  },
];

export function QuestionFeed() {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);

  const handleUpvote = (id: string) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          return {
            ...q,
            upvotes: q.upvotedByUser ? q.upvotes - 1 : q.upvotes + 1,
            upvotedByUser: !q.upvotedByUser,
          };
        }
        return q;
      })
    );
  };

  // Sort by upvotes
  const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <h1 className="text-foreground">GitHub Copilot + GPT LLM Q&A</h1>
        </div>
      </div>

      {/* Question List */}
      <div className="max-w-2xl mx-auto px-4 py-4 space-y-3">
        {sortedQuestions.map((question) => (
          <QuestionCard
            key={question.id}
            {...question}
            onUpvote={handleUpvote}
            isUpvoted={question.upvotedByUser}
          />
        ))}
      </div>

      {/* Floating Action Button */}
      <Link to="/ask" className="fixed bottom-6 right-6">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </Link>
    </div>
  );
}
