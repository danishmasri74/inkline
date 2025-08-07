import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const fullTitle = "Login to InkLine";
  const [typedTitle, setTypedTitle] = useState("");
  const [charIndex, setCharIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (charIndex < fullTitle.length) {
      const char = fullTitle[charIndex];
      const isPauseChar = /[,.]/.test(char);
      const delay = char === " " ? 50 : isPauseChar ? 250 : 60 + Math.random() * 90;

      const timeout = setTimeout(() => {
        setTypedTitle((prev) => prev + char);
        setCharIndex((prev) => prev + 1);
        if (charIndex === fullTitle.length - 1) {
          setFinished(true);
        }
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [charIndex]);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-8 rounded-lg border border-[#d7d2c4] shadow-md bg-[#fffefb] font-typewriter text-[#3b2f2f] relative overflow-hidden"
      >
        <h1 className="text-3xl font-bold mb-3 text-center tracking-wide whitespace-nowrap relative">
          <span className={finished ? "glow-text" : ""}>{typedTitle}</span>
          <span className="inline-block w-[1ch] animate-blink">|</span>
        </h1>

        {/* Emotional re-entry message */}
        <motion.p
          className="text-sm text-[#7a6b59] text-center mb-6 italic"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.7 }}
        >
          Welcome back. Let’s pick up where you left off, shall we?
        </motion.p>

        <div className="space-y-4">
          <Input
            placeholder="Email address"
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
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-[#6f4e37] hover:bg-[#5a3c2b] text-white rounded-full transition"
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </div>

        <div className="mt-6 text-sm text-center text-[#6c5c4c] space-y-1">
          <p>
            No account?{" "}
            <Link to="/signup" className="underline underline-offset-2">
              Sign up
            </Link>
          </p>
          <p>
            <Link to="/reset-password" className="underline underline-offset-2">
              Forgot password?
            </Link>
          </p>
          <p>
            <Link to="/" className="underline underline-offset-2">
              ← Back to Home
            </Link>
          </p>
        </div>

        {/* Flicker background warmth */}
        <div className="absolute inset-0 pointer-events-none z-0 animate-paper-warm" />

        {/* Styles */}
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
              0%, 100% { text-shadow: 0 0 0px rgba(111, 78, 55, 0.3); }
              50% { text-shadow: 0 0 6px rgba(111, 78, 55, 0.5); }
            }
            .glow-text {
              animation: glow 3s ease-in-out infinite;
            }

            @keyframes paperWarmth {
              0%, 100% { background-color: transparent; }
              50% { background-color: rgba(255, 249, 238, 0.015); }
            }
            .animate-paper-warm {
              animation: paperWarmth 10s ease-in-out infinite;
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
