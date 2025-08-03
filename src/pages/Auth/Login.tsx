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

  useEffect(() => {
    if (charIndex < fullTitle.length) {
      const timeout = setTimeout(() => {
        setTypedTitle((prev) => prev + fullTitle[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 80);
      return () => clearTimeout(timeout);
    }
  }, [charIndex, fullTitle]);

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md p-8 rounded-lg border border-[#d7d2c4] shadow-md bg-[#fffefb] font-typewriter text-[#3b2f2f]"
      >
        <h1 className="text-3xl font-bold mb-6 text-center tracking-wide">
          {typedTitle}
          <span className="animate-pulse">|</span>
        </h1>

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
      </motion.div>
    </div>
  );
}
