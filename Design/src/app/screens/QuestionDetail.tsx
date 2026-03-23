import { useState } from "react";
import { ArrowLeft, ArrowBigUp, User } from "lucide-react";
import { Link, useParams } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

// Mock data
const questionData: Record<
  string,
  {
    id: string;
    question: string;
    upvotes: number;
    status: "answered" | "unanswered";
    topic?: string;
    answer?: string;
    answeredBy?: string;
  }
> = {
  "1": {
    id: "1",
    question: "Can you explain the difference between TCP and UDP protocols?",
    upvotes: 12,
    status: "answered",
    topic: "Networking",
    answer:
      "TCP (Transmission Control Protocol) is a connection-oriented protocol that ensures reliable, ordered delivery of data. It establishes a connection before transmitting data and includes error-checking mechanisms. UDP (User Datagram Protocol) is connectionless and faster, but doesn't guarantee delivery or order. TCP is used for applications like web browsing and email, while UDP is preferred for real-time applications like video streaming and online gaming.",
    answeredBy: "Dr. Smith",
  },
  "2": {
    id: "2",
    question: "What is the purpose of the OSI model in networking?",
    upvotes: 8,
    status: "unanswered",
    topic: "Networking",
  },
  "3": {
    id: "3",
    question: "How does DNS resolution work in practice?",
    upvotes: 15,
    status: "answered",
    topic: "Networking",
    answer:
      "DNS (Domain Name System) resolution converts human-readable domain names into IP addresses. When you type a URL, your computer first checks its local cache. If not found, it queries a DNS resolver (usually your ISP's), which may check its cache or query authoritative DNS servers in a hierarchical manner, starting from root servers down to the specific domain's nameserver. The IP address is then returned and cached for future use.",
    answeredBy: "Dr. Smith",
  },
  "4": {
    id: "4",
    question: "Could you provide more examples of subnetting calculations?",
    upvotes: 5,
    status: "unanswered",
    topic: "Networking",
  },
  "5": {
    id: "5",
    question: "What are the main differences between IPv4 and IPv6?",
    upvotes: 10,
    status: "answered",
    topic: "Networking",
    answer:
      "IPv4 uses 32-bit addresses (about 4.3 billion unique addresses) in dotted decimal notation (e.g., 192.168.1.1), while IPv6 uses 128-bit addresses (vastly more addresses) in hexadecimal notation. IPv6 was developed to address IPv4 address exhaustion and includes built-in security features (IPsec), simplified header structure for better routing efficiency, and eliminates the need for NAT in most cases. IPv6 also supports better multicast routing and mobility features.",
    answeredBy: "Dr. Smith",
  },
};

export function QuestionDetail() {
  const { id } = useParams<{ id: string }>();
  const question = id ? questionData[id] : null;
  const [isUpvoted, setIsUpvoted] = useState(false);
  const [upvotes, setUpvotes] = useState(question?.upvotes || 0);

  const handleUpvote = () => {
    if (isUpvoted) {
      setUpvotes(upvotes - 1);
    } else {
      setUpvotes(upvotes + 1);
    }
    setIsUpvoted(!isUpvoted);
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Question not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link to="/">
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h2 className="text-foreground">Question Details</h2>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Question Card */}
        <Card className="p-5 border border-border">
          <div className="flex gap-3 mb-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                <User className="w-6 h-6 text-secondary" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-foreground mb-3">{question.question}</p>
              <div className="flex items-center gap-2 flex-wrap">
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
                {question.topic && (
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    Topic: {question.topic}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Upvote Section */}
          <div className="flex items-center gap-2 pt-3 border-t border-border">
            <Button
              size="sm"
              variant={isUpvoted ? "default" : "outline"}
              className={
                isUpvoted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "border-border hover:border-primary/50"
              }
              onClick={handleUpvote}
            >
              <ArrowBigUp
                className="w-4 h-4 mr-1"
                fill={isUpvoted ? "currentColor" : "none"}
              />
              {isUpvoted ? "Upvoted" : "Upvote"}
            </Button>
            <span className="text-sm text-muted-foreground">
              {upvotes} {upvotes === 1 ? "upvote" : "upvotes"}
            </span>
          </div>
        </Card>

        {/* Answer Section */}
        <div className="space-y-3">
          <h3 className="text-foreground">Answer from Lecturer</h3>
          {question.answer ? (
            <Card className="p-5 border border-border bg-secondary/5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">
                    {question.answeredBy}
                  </p>
                </div>
              </div>
              <p className="text-foreground leading-relaxed">{question.answer}</p>
            </Card>
          ) : (
            <Card className="p-8 border border-dashed border-border bg-muted/20">
              <p className="text-center text-muted-foreground">
                This question hasn't been answered yet. The lecturer will respond soon.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
