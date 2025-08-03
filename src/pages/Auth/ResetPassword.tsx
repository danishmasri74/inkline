import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const fullTitle = "Reset your password"
  const [typedTitle, setTypedTitle] = useState("")
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (index < fullTitle.length) {
      const timeout = setTimeout(() => {
        setTypedTitle((prev) => prev + fullTitle[index])
        setIndex((prev) => prev + 1)
      }, 80)
      return () => clearTimeout(timeout)
    }
  }, [index, fullTitle])

  const handleReset = async () => {
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email)
    if (error) {
      alert(error.message)
    } else {
      alert("Password reset email sent.")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full p-6 rounded-md bg-[#fffefc] border border-[#e0ddd5] shadow-sm font-typewriter text-[#3b2f2f]"
      >
        <h1 className="text-2xl font-semibold mb-6 text-center tracking-wide">
          {typedTitle}
          <span className="animate-pulse">|</span>
        </h1>

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
          className="w-full mt-4 bg-[#6f4e37] hover:bg-[#5a3c2b] text-white rounded-full"
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
      </motion.div>
    </div>
  )
}
