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
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 90);
      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f5f1e8] text-center px-6 font-typewriter">
      {/* Logo */}
      <motion.img
        src={InkLineIcon}
        alt="InkLine Logo"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-20 h-20 mb-6 rounded-md"
      />

      {/* Typewriter Title */}
      <h1 className="text-4xl md:text-5xl font-bold text-[#3b2f2f] mb-4 tracking-wide whitespace-nowrap">
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
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Where your thoughts flow like ink. A distraction-free space for writing
        and reflection — with the charm of old paper.
      </motion.p>

      {/* Random Quote */}
      <motion.p
        className="italic text-[#7c6f5b] text-sm md:text-base mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.8 }}
      >
        {randomQuote}
      </motion.p>

      <Separator className="w-32 border-[#ccc5b9] mb-8" />

      {/* CTA Buttons */}
      <motion.div
        className="flex gap-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Button
          onClick={() => navigate("/login")}
          className="bg-[#6f4e37] hover:bg-[#5a3c2b] text-white rounded-full px-6 transition-all duration-200"
        >
          Log In
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate("/signup")}
          className="border-[#6f4e37] text-[#6f4e37] hover:bg-[#ede8dd] rounded-full px-6 transition-all duration-200"
        >
          Sign Up
        </Button>
      </motion.div>
    </div>
  );
}
