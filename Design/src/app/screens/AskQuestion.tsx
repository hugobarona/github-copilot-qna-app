import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Textarea } from "../components/ui/textarea";

export function AskQuestion() {
  const [question, setQuestion] = useState("");
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (question.trim()) {
      // In a real app, this would send the question to a backend
      console.log("Submitting question:", question);
      // Navigate back to home
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="text-foreground">Ask a Question</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 py-6 flex flex-col">
        <div className="flex-1 flex flex-col gap-6">
          <div className="space-y-2">
            <label htmlFor="question" className="text-foreground">
              Your Question
            </label>
            <Textarea
              id="question"
              placeholder="Type your question…"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="min-h-[200px] resize-none bg-card border-border focus-visible:ring-primary text-base"
            />
            <p className="text-sm text-muted-foreground">
              Your question will be posted anonymously
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            onClick={handleSubmit}
            disabled={!question.trim()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12"
          >
            Submit Question
          </Button>
        </div>
      </div>
    </div>
  );
}
