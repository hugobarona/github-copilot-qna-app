import { useEffect } from "react";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { QuestionCard } from "../components/QuestionCard";
import { Button } from "../components/ui/button";
import { useQuestions } from "../context/QuestionsContext";

export function QuestionFeed() {
  const { questions, toggleUpvote, isLoading, error, loadQuestions } = useQuestions();

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  const sortedQuestions = [...questions].sort((a, b) => b.upvotes - a.upvotes);

  return (
    <div className="bg-background min-h-screen pb-20">
      <div className="bg-card border-border sticky top-0 z-10 border-b">
        <div className="mx-auto max-w-2xl space-y-3 px-4 py-4">
          <h1 className="text-foreground">GitHub Copilot + GPT LLM Q&A</h1>

          <div className="bg-muted/30 border-border overflow-hidden rounded-xl border">
            <img
              src="/github-copilot-dev-days.png"
              alt="GitHub Copilot Dev Days"
              className="h-auto w-full object-cover"
              loading="eager"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl space-y-3 px-4 py-4">
        {isLoading ? (
          <div className="bg-card border-border rounded-xl border p-10 text-center">
            <p className="text-muted-foreground text-sm">Loading questions...</p>
          </div>
        ) : null}

        {error ? (
          <div className="bg-card border-border rounded-xl border p-6 text-center">
            <p className="text-destructive mb-3 text-sm">{error}</p>
            <Button variant="outline" onClick={() => void loadQuestions()}>
              Retry
            </Button>
          </div>
        ) : null}

        {!isLoading && !error && sortedQuestions.length === 0 ? (
          <div className="bg-card border-border rounded-xl border p-10 text-center">
            <h2 className="text-foreground mb-2">No questions yet</h2>
            <p className="text-muted-foreground text-sm">
              Be the first to ask something for your class.
            </p>
          </div>
        ) : null}

        {!isLoading && !error
          ? (
          sortedQuestions.map((item) => (
            <QuestionCard
              key={item.id}
              id={item.id}
              question={item.question}
              upvotes={item.upvotes}
              status={item.status}
              isUpvoted={item.upvotedByUser}
              onUpvote={(id) => {
                void toggleUpvote(id);
              }}
            />
          ))
            )
          : null}
      </div>

      <Link to="/ask" className="fixed right-6 bottom-6">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full bg-secondary text-secondary-foreground shadow-lg hover:bg-secondary/80"
          aria-label="Ask a question"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </Link>
    </div>
  );
}
