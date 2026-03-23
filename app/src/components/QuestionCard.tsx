import { ArrowBigUp, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

interface QuestionCardProps {
  id: string;
  question: string;
  upvotes: number;
  status: "answered" | "unanswered";
  onUpvote?: (id: string) => void;
  isUpvoted?: boolean;
}

export function QuestionCard({
  id,
  question,
  upvotes,
  status,
  onUpvote,
  isUpvoted = false,
}: QuestionCardProps) {
  return (
    <Link to={`/question/${id}`} className="block">
      <Card className="border-border p-4 transition-shadow duration-200 hover:shadow-md">
        <div className="flex gap-3">
          <div className="shrink-0">
            <div className="bg-secondary/10 flex h-10 w-10 items-center justify-center rounded-full">
              <User className="text-secondary h-5 w-5" />
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-foreground mb-2 break-words">{question}</p>

            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={status === "answered" ? "default" : "secondary"}
                className={
                  status === "answered"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted text-muted-foreground"
                }
              >
                {status === "answered" ? "Answered" : "Unanswered"}
              </Badge>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className={`h-8 w-8 p-0 ${
                isUpvoted ? "text-primary" : "text-muted-foreground"
              } hover:text-primary`}
              onClick={(e) => {
                e.preventDefault();
                onUpvote?.(id);
              }}
            >
              <ArrowBigUp
                className="h-5 w-5"
                fill={isUpvoted ? "currentColor" : "none"}
              />
            </Button>
            <span className="text-muted-foreground text-sm">{upvotes}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
