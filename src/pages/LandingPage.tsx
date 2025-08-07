import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import InkLineIcon from "@/assets/InkLine.png";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  const fullText = "Welcome to InkLine";
  const [typedText, setTypedText] = useState("");
  const [index, setIndex] = useState(0);

  const quotes = [
    "“The palest ink is better than the best memory.” — Chinese proverb",
    "“Fill your paper with the breathings of your heart.” — William Wordsworth",
    "“Writing is the painting of the voice.” — Voltaire",
    "“The art of writing is the art of discovering what you believe.” — Gustave Flaubert",
    "“To write is human, to edit is divine.” — Stephen King",
    "“Ink is the blood of thought.” — Lord Byron",
    "“A writer is someone for whom writing is more difficult than it is for other people.” — Thomas Mann",
  ];

  const randomQuote = useMemo(() => {
    const index = Math.floor(Math.random() * quotes.length);
    return quotes[index];
  }, []);

  const [typedQuote, setTypedQuote] = useState("");
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Typewriter for title
  useEffect(() => {
    if (index < fullText.length) {
      const char = fullText.charAt(index);
      const isPause = /[.,]/.test(char);
      const delay =
        char === " "
          ? 60
          : isPause
          ? 280 + Math.random() * 100
          : 55 + Math.random() * 90;

      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + char);
        setIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [index]);

  // Typewriter for quote (after title ends)
  useEffect(() => {
    if (index >= fullText.length && quoteIndex < randomQuote.length) {
      const char = randomQuote.charAt(quoteIndex);
      const delay = char === " " ? 25 : 35 + Math.random() * 70;

      const timeout = setTimeout(() => {
        setTypedQuote((prev) => prev + char);
        setQuoteIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [index, quoteIndex, randomQuote]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f1e8] text-center px-6 font-typewriter relative overflow-hidden">
      {/* Logo */}
      <motion.img
        src={InkLineIcon}
        alt="InkLine Logo"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-20 h-20 mb-6 rounded-md"
      />

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-[#3b2f2f] mb-4 tracking-wide whitespace-nowrap">
        {typedText}
        {index < fullText.length && <span className="animate-blink">|</span>}
      </h1>

      {/* Subheading */}
      {index >= fullText.length && (
        <motion.p
          className="text-md md:text-lg text-[#5a4e3c] mb-6 max-w-xl leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          Where your thoughts flow like ink. A distraction-free space for
          writing and reflection — with the charm of old paper.
        </motion.p>
      )}

      {/* Quote */}
      {typedQuote && (
        <p className="italic text-[#7c6f5b] text-sm md:text-base mb-4 min-h-[3rem]">
          {typedQuote}
          <span className="animate-blink">|</span>
        </p>
      )}

      <Separator className="w-32 border-[#ccc5b9] mb-8" />

      {/* CTA Buttons */}
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: index >= fullText.length ? 1 : 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
      >
        <Button
          onClick={() => navigate("/login")}
          className="bg-[#6f4e37] hover:bg-[#5a3c2b] text-white rounded-full px-6 transition-all duration-300"
        >
          Log In
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/signup")}
          className="border-[#6f4e37] text-[#6f4e37] hover:bg-[#ede8dd] rounded-full px-6 transition-all duration-300"
        >
          Sign Up
        </Button>
      </motion.div>

      {/* Typewriter + Emotion CSS */}
      <style>{`
        @keyframes blink {
          0%, 50%, 100% { opacity: 1; }
          25%, 75% { opacity: 0; }
        }

        .animate-blink {
          display: inline-block;
          width: 1ch;
          animation: blink 1.1s step-end infinite;
        }
      `}</style>
    </div>
  );
}
