import { QrCode } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";

export function Home() {
  return (
    <div className="bg-background flex min-h-screen items-center justify-center px-4 py-8">
      <Card className="border-border w-full max-w-xl space-y-5 p-6 text-center shadow-sm">
        <div className="space-y-2">
          <p className="text-muted-foreground inline-flex items-center gap-2 text-sm">
            <QrCode className="h-4 w-4" />
            Workshop quick access
          </p>
          <h1 className="text-foreground">GitHub Copilot + GPT LLM Q&A</h1>
          <p className="text-muted-foreground text-sm">
            Scan the QR code to open this app on your mobile device.
          </p>
        </div>

        <div className="bg-muted/30 border-border mx-auto w-full max-w-sm overflow-hidden rounded-xl border p-3">
          <img
            src="/qr-code.png"
            alt="QR code to open the GitHub Copilot Q&A app"
            className="h-auto w-full rounded-lg"
            loading="eager"
          />
        </div>

        <div className="pt-1">
          <Button asChild className="h-11 w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to="/questions">Start</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
