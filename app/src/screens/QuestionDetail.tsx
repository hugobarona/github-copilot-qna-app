import { useEffect, useState } from "react";
import { ArrowBigUp, ArrowLeft, User } from "lucide-react";
import { Link, useLocation, useParams } from "react-router-dom";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useQuestions } from "../context/QuestionsContext";

export function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const { getQuestionById, fetchQuestionById, toggleUpvote } = useQuestions();
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const submissionWarning =
    typeof location.state === "object" &&
    location.state !== null &&
    "submissionWarning" in location.state &&
    typeof location.state.submissionWarning === "string"
      ? location.state.submissionWarning
      : null;
  const question = id ? getQuestionById(id) : undefined;

  useEffect(() => {
    if (!id || question) {
      return;
    }

    setIsLoadingQuestion(true);
    setLoadError(null);

    void fetchQuestionById(id)
      .catch((error) => {
        const message =
          error instanceof Error ? error.message : "Failed to load question";
        setLoadError(message);
      })
      .finally(() => {
        setIsLoadingQuestion(false);
      });
  }, [id, question, fetchQuestionById]);

  const handleUpvote = async () => {
    if (!question) {
      return;
    }

    setIsUpvoting(true);
    try {
      await toggleUpvote(question.id);
    } finally {
      setIsUpvoting(false);
    }
  };

  if (isLoadingQuestion) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Loading question...</p>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="bg-background flex min-h-screen items-center justify-center">
        <Card className="mx-4 w-full max-w-md p-8 text-center">
          <h2 className="text-foreground mb-2">Question not found</h2>
          <p className="text-muted-foreground mb-4 text-sm">
            {loadError ?? "The question may not exist yet or this page was opened directly."}
          </p>
          <Button asChild>
            <Link to="/">Back to Questions</Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pb-8">
      <div className="bg-card border-border sticky top-0 z-10 border-b">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-foreground">Question Details</h2>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-6 px-4 py-6">
        <Card className="border-border p-5">
          <div className="mb-4 flex gap-3">
            <div className="shrink-0">
              <div className="bg-secondary/10 flex h-12 w-12 items-center justify-center rounded-full">
                <User className="text-secondary h-6 w-6" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-foreground mb-3">{question.question}</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant={question.status === "answered" ? "default" : "secondary"}
                  className={
                    question.status === "answered"
                      ? "bg-secondary text-secondary-foreground"
                      : "bg-muted text-muted-foreground"
                  }
                >
                  {question.status === "answered" ? "Answered" : "Unanswered"}
                </Badge>
              </div>
            </div>
          </div>

          <div className="border-border flex items-center gap-2 border-t pt-3">
            <Button
              size="sm"
              variant={question.upvotedByUser ? "default" : "outline"}
              disabled={isUpvoting}
              className={
                question.upvotedByUser
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border hover:border-primary/50"
              }
              onClick={() => {
                void handleUpvote();
              }}
            >
              <ArrowBigUp
                className="mr-1 h-4 w-4"
                fill={question.upvotedByUser ? "currentColor" : "none"}
              />
              {isUpvoting
                ? "Updating..."
                : question.upvotedByUser
                  ? "Upvoted"
                  : "Upvote"}
            </Button>
            <span className="text-muted-foreground text-sm">
              {question.upvotes} {question.upvotes === 1 ? "upvote" : "upvotes"}
            </span>
          </div>
        </Card>

        <div className="space-y-3">
          <h3 className="text-foreground">Answer from Lecturer</h3>
          {submissionWarning ? (
            <Card className="border-border bg-muted/30 p-4">
              <p className="text-muted-foreground text-sm">
                Your question was saved, but the automatic answer could not be generated yet.
              </p>
              <p className="text-muted-foreground mt-2 text-sm">{submissionWarning}</p>
            </Card>
          ) : null}
          {question.answer ? (
            <Card className="border-border bg-secondary/5 p-5">
              <div className="mb-3 flex items-start gap-3">
                <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                  <User className="text-primary h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground mb-1 text-sm">
                    {question.answeredBy ?? "Lecturer"}
                  </p>
                </div>
              </div>
              <p className="text-foreground leading-relaxed">{question.answer}</p>
            </Card>
          ) : (
            <Card className="border-border bg-muted/20 border-dashed p-8">
              <p className="text-muted-foreground text-center">
                This question has not been answered yet.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
