import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    console.log("LOGIN RESPONSE:", data, error);

    if (error) {
      alert(error.message);
      return;
    }

    if (!data?.session) {
      alert("No session created");
      return;
    }

    // ✅ FORCE SESSION FLUSH (IMPORTANT FIX)
    await new Promise((r) => setTimeout(r, 300));

    // ✅ SAFE REDIRECT
    window.location.assign("/wallet");
  };

  return (
    <div style={container}>
      <form onSubmit={handleLogin} style={form}>
        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
          required
        />

        <button type="submit" disabled={loading} style={button}>
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

/* styles */
const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#0b0b0b",
  color: "white",
};

const form: React.CSSProperties = {
  width: 320,
  padding: 24,
  borderRadius: 12,
  background: "#151515",
  display: "flex",
  flexDirection: "column",
  gap: 12,
};

const input: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  background: "#000",
  color: "white",
  border: "1px solid #333",
};

const button: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  background: "lime",
  border: "none",
  fontWeight: "bold",
  cursor: "pointer",
};
