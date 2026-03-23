import { ArrowBigUp, User } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Link } from "react-router";

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
      <Card className="p-4 hover:shadow-md transition-shadow duration-200 border border-border">
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-secondary" />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-foreground mb-2 line-clamp-3">{question}</p>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Status Badge */}
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

          {/* Upvote Section */}
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
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
                className="w-5 h-5"
                fill={isUpvoted ? "currentColor" : "none"}
              />
            </Button>
            <span className="text-sm text-muted-foreground">{upvotes}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
