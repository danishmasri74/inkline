import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabaseClient"
import { Link, useNavigate } from "react-router-dom"

export default function SignUp() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSignUp = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      alert(error.message)
    } else {
      alert("Check your email for confirmation.")
      navigate("/login")
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4 p-4 border rounded shadow-sm">
      <h1 className="text-2xl font-semibold">Create your InkLine account</h1>
      <Input
        placeholder="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Input
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Button onClick={handleSignUp} disabled={loading}>
        {loading ? "Signing up..." : "Sign Up"}
      </Button>
      <p className="text-sm text-gray-500">
        Already have an account? <Link to="/login" className="underline">Log in</Link>
      </p>
    </div>
  )
}
