import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";
import { useQuestions } from "../context/QuestionsContext";

export function AskQuestion() {
  const [question, setQuestion] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { addQuestion } = useQuestions();

  const handleSubmit = async () => {
    const trimmed = question.trim();
    if (!trimmed) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const result = await addQuestion(trimmed);
      navigate(`/question/${result.question.id}`, {
        state: result.warning ? { submissionWarning: result.warning } : undefined,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to submit question";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background flex min-h-screen flex-col">
      <div className="bg-card border-border border-b">
        <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-foreground">Ask a Question</h2>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
        <div className="flex flex-1 flex-col gap-6">
          <div className="space-y-2">
            <label htmlFor="question" className="text-foreground">
              Your Question
            </label>
            <Textarea
              id="question"
              placeholder="Type your question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="bg-card border-border min-h-[200px] resize-none text-base focus-visible:ring-primary"
            />
            <p className="text-muted-foreground text-sm">
              Your question will be posted anonymously.
            </p>
            {submitError ? (
              <p className="text-destructive text-sm" role="alert">
                {submitError}
              </p>
            ) : null}
            {isSubmitting ? (
              <p className="text-muted-foreground text-sm">
                Saving your question and generating an answer...
              </p>
            ) : null}
          </div>
        </div>

        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!question.trim() || isSubmitting}
            className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {isSubmitting ? "Submitting Question..." : "Submit Question"}
          </Button>
        </div>
      </div>
    </div>
  );
}
