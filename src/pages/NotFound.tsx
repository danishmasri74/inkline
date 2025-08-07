import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-6">
      <Sparkles className="w-10 h-10 text-muted-foreground animate-bounce-slow" />
      <h1 className="text-5xl font-extrabold text-foreground tracking-tight">
        Lost in your thoughts?
      </h1>
      <p className="max-w-md text-muted-foreground text-lg">
        This page doesn’t exist—or maybe it was just a fleeting idea.
      </p>

      <Button asChild variant="default">
        <Link to="/">Back to your notes</Link>
      </Button>

      <style>
        {`
          @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }

          .animate-bounce-slow {
            animation: bounce-slow 2s infinite;
          }
        `}
      </style>
    </div>
  );
}
