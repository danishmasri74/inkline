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

  useEffect(() => {
    if (index < fullText.length) {
      const char = fullText.charAt(index);
      const isPauseChar = /[.,]/.test(char);
      const isEllipsis = fullText.slice(index, index + 3) === "...";

      const delay = isEllipsis
        ? 500
        : isPauseChar
        ? 250
        : 50 + Math.random() * 100;

      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + char);
        setIndex((prev) => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [index]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#fdfaf4] text-center px-6 font-typewriter">
      {/* Logo */}
      <motion.img
        src={InkLineIcon}
        alt="InkLine Logo"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-20 h-20 mb-6 rounded-md shadow-sm"
      />

      {/* Typewriter Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-[#3e2e1e] mb-4 tracking-wide whitespace-nowrap">
        {typedText}
        <span
          className={`inline-block w-[1ch] ${
            index < fullText.length ? "animate-blink" : ""
          }`}
        >
          |
        </span>
      </h1>

      {/* Subheading */}
      <motion.p
        className="text-md md:text-lg text-[#5a4e3c] mb-8 max-w-xl leading-relaxed"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        A quiet space to think, write, and reflect — like journaling on paper,
        but with the rhythm of modern life.
      </motion.p>

      {/* Quote */}
      <motion.p
        className="italic text-[#7c6f5b] text-sm md:text-base mb-4 max-w-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 1.2 }}
      >
        {randomQuote}
      </motion.p>

      <Separator className="w-32 border-[#d8cfc2] mb-8" />

      {/* CTA Buttons */}
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5, duration: 0.6 }}
      >
        <Button
          onClick={() => navigate("/login")}
          className="bg-[#6f4e37] hover:bg-[#5a3c2b] text-white rounded-full px-6 text-base shadow-sm transition-all duration-200"
        >
          Log In
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/signup")}
          className="border-[#6f4e37] text-[#6f4e37] hover:bg-[#f1ece4] rounded-full px-6 text-base transition-all duration-200"
        >
          Sign Up
        </Button>
      </motion.div>

      {/* Cursor Animation */}
      <style>
        {`
          @keyframes blink {
            0%, 50%, 100% { opacity: 1; }
            25%, 75% { opacity: 0; }
          }

          .animate-blink {
            animation: blink 1s step-end infinite;
          }
        `}
      </style>
    </div>
  );
}
