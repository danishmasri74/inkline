import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fullTitle = "Create your InkLine account";
  const [typedTitle, setTypedTitle] = useState("");
  const [index, setIndex] = useState(0);
  const [doneTyping, setDoneTyping] = useState(false);

  useEffect(() => {
    if (index < fullTitle.length) {
      const char = fullTitle[index];
      const isPunctuation = /[.,]/.test(char);
      const delay = char === " " ? 50 : isPunctuation ? 250 : 60 + Math.random() * 90;

      const timeout = setTimeout(() => {
        setTypedTitle((prev) => prev + char);
        setIndex((prev) => prev + 1);
        if (index === fullTitle.length - 1) setDoneTyping(true);
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [index]);

  const handleSignUp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      alert(error.message);
    } else {
      alert("Check your email for confirmation.");
      navigate("/login");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-md w-full p-6 rounded-lg bg-[#fffefc] border border-[#e0ddd5] shadow-sm font-typewriter text-[#3b2f2f] relative overflow-hidden"
      >
        <h1 className="text-2xl font-semibold mb-4 text-center tracking-wide whitespace-nowrap relative">
          <span className={doneTyping ? "glow-title" : ""}>{typedTitle}</span>
          <span className="inline-block w-[1ch] animate-blink">|</span>
        </h1>

        <motion.p
          className="text-sm text-[#7c6f5b] text-center mb-6 italic"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Just a few keystrokes between you and the blank page. Ready?
        </motion.p>

        <div className="space-y-4">
          <Input
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-[#fdfaf6] border border-[#d7d2c4] focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#fdfaf6] border border-[#d7d2c4] focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <Button
            onClick={handleSignUp}
            disabled={loading}
            className="w-full mt-2 bg-[#6f4e37] hover:bg-[#5a3c2b] text-white rounded-full"
          >
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </div>

        <div className="mt-6 text-sm text-center text-[#6c5c4c] space-y-2">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="underline underline-offset-2">
              Log in
            </Link>
          </p>
          <p>
            <Link to="/" className="underline underline-offset-2">
              ← Back to Home
            </Link>
          </p>
        </div>

        {/* Warm ambient grain */}
        <div className="absolute inset-0 pointer-events-none z-0 animate-page-breathe" />

        {/* Custom styles */}
        <style>
          {`
            @keyframes blink {
              0%, 50%, 100% { opacity: 1; }
              25%, 75% { opacity: 0; }
            }
            .animate-blink {
              animation: blink 1s step-end infinite;
            }

            @keyframes glow {
              0%, 100% { text-shadow: 0 0 0 rgba(111, 78, 55, 0.3); }
              50% { text-shadow: 0 0 6px rgba(111, 78, 55, 0.5); }
            }
            .glow-title {
              animation: glow 3s ease-in-out infinite;
            }

            @keyframes breathe {
              0%, 100% { background-color: transparent; }
              50% { background-color: rgba(255, 250, 240, 0.02); }
            }
            .animate-page-breathe {
              animation: breathe 12s ease-in-out infinite;
              background-image: radial-gradient(rgba(0,0,0,0.015) 1px, transparent 1px);
              background-size: 4px 4px;
              border-radius: inherit;
            }
          `}
        </style>
      </motion.div>
    </div>
  );
}
