import { signUp } from '@/lib/auth'
import { useState } from 'react'

export default function TestSignup() {
  const [loading, setLoading] = useState(false)

  const handleSignup = async () => {
    setLoading(true)

    const result = await signUp(
      "test@example.com",
      "12345678"
    )

    console.log("Signup result:", result)

    setLoading(false)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Auth Test Page</h2>

      <button onClick={handleSignup} disabled={loading}>
        {loading ? "Creating user..." : "Test Signup"}
      </button>
    </div>
  )
}
