import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4 p-4 border rounded shadow">
      <h1 className="text-2xl font-semibold">Login to InkLine</h1>
      <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <Button onClick={handleLogin} disabled={loading}>
        {loading ? 'Logging in...' : 'Log In'}
      </Button>
      <div className="text-sm text-gray-500">
        No account? <Link to="/signup" className="underline">Sign up</Link>
        <br />
        <Link to="/reset-password" className="underline">Forgot password?</Link>
      </div>
    </div>
  )
}
