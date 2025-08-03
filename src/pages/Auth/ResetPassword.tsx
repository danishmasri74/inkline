import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { Link } from "react-router-dom"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

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
    <div className="max-w-md mx-auto mt-20 space-y-4 p-4 border rounded shadow-sm">
      <h1 className="text-2xl font-semibold">Reset your password</h1>
      <Input
        placeholder="Enter your email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button onClick={handleReset} disabled={loading}>
        {loading ? "Sending..." : "Send Reset Email"}
      </Button>
      <p className="text-sm text-gray-500">
        <Link to="/login" className="underline">Back to login</Link>
      </p>
    </div>
  )
}
