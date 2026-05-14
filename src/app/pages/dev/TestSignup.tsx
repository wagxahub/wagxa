import { signUp } from '@/lib/auth'

export default function TestSignup() {
  const test = async () => {
    const res = await signUp("test@example.com", "12345678")
    console.log(res)
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Dev: Test Signup</h2>

      <button onClick={test}>
        Test Signup
      </button>
    </div>
  )
}
