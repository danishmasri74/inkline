import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function NotFound() {
  const fullText = "Maybe I wrote it down... or maybe...";
  const [typed, setTyped] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setTyped((prev) => prev + fullText.charAt(index));
        setIndex(index + 1);
      }, 80); // adjust typing speed here
      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center space-y-6">
      <Sparkles className="w-10 h-10 text-muted-foreground animate-bounce-slow" />

      <h1 className="text-5xl font-extrabold text-foreground tracking-tight">
        Lost in your thoughts?
      </h1>

      <p className="max-w-md text-muted-foreground text-lg font-mono min-h-[3rem]">
        {typed}
        {index < fullText.length && <span className="animate-blink">|</span>}
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

          @keyframes blink {
            0%, 50%, 100% { opacity: 1; }
            25%, 75% { opacity: 0; }
          }

          .animate-blink {
            display: inline-block;
            width: 1ch;
            animation: blink 1s step-end infinite;
          }
        `}
      </style>
    </div>
  );
}
