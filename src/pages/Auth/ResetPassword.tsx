import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const fullTitle = "Reset your password";
  const [typedTitle, setTypedTitle] = useState("");
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    if (index < fullTitle.length) {
      const char = fullTitle[index];
      const delay =
        char === " "
          ? 50
          : [",", "."].includes(char)
          ? 300
          : 60 + Math.random() * 100;

      const timeout = setTimeout(() => {
        setTypedTitle((prev) => prev + char);
        setIndex((prev) => prev + 1);
        if (index === fullTitle.length - 1) {
          setFinished(true);
        }
      }, delay);

      return () => clearTimeout(timeout);
    }
  }, [index]);

  const handleReset = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      alert(error.message);
    } else {
      alert("Password reset email sent.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-sm sm:max-w-md p-5 sm:p-6 rounded-md bg-[#fffefc] border border-[#e0ddd5] shadow-sm font-typewriter text-[#3b2f2f] relative overflow-hidden"
      >
        {/* Animated Title */}
        <h1 className="text-xl sm:text-2xl font-semibold mb-3 text-center tracking-wide break-words relative">
          <span className={finished ? "glow-text" : ""}>{typedTitle}</span>
          <span className="inline-block w-[1ch] animate-blink">|</span>
        </h1>

        {/* Soft subtitle */}
        <motion.p
          className="text-sm text-[#7a6b59] text-center mb-5 italic"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          It’s alright. We’ll help you find your way back.
        </motion.p>

        <Input
          placeholder="Enter your email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="bg-[#fdfaf6] border border-[#d7d2c4] focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        <Button
          onClick={handleReset}
          disabled={loading}
          className="w-full mt-4 bg-[#6f4e37] hover:bg-[#5a3c2b] text-white rounded-full py-2.5 text-base"
        >
          {loading ? "Sending..." : "Send Reset Email"}
        </Button>

        <div className="mt-6 text-sm text-center text-[#6c5c4c] space-y-2">
          <p>
            <Link to="/login" className="underline underline-offset-2">
              Back to login
            </Link>
          </p>
          <p>
            <Link to="/" className="underline underline-offset-2">
              ← Back to Home
            </Link>
          </p>
        </div>

        {/* Ambient flicker */}
        <div className="absolute inset-0 pointer-events-none z-0 animate-paper-warm" />

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
          0%, 100% {
            text-shadow: 0 0 0px rgba(111, 78, 55, 0.3);
          }
          50% {
            text-shadow: 0 0 5px rgba(111, 78, 55, 0.5);
          }
        }
        .glow-text {
          animation: glow 3s ease-in-out infinite;
        }

        @keyframes paperWarmth {
          0%, 100% { background-color: transparent; }
          50% { background-color: rgba(255, 249, 238, 0.02); }
        }
        .animate-paper-warm {
          animation: paperWarmth 8s ease-in-out infinite;
          background-image: radial-gradient(rgba(0,0,0,0.02) 1px, transparent 1px);
          background-size: 4px 4px;
          border-radius: inherit;
        }
      `}
        </style>
      </motion.div>
    </div>
  );
}
