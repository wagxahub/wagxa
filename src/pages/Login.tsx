import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log("🔄 LOGIN ATTEMPT...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    console.log("📦 LOGIN RESPONSE:", { data, error });

    // ❌ ERROR CASE
    if (error) {
      alert(error.message);
      return;
    }

    // ❌ NO SESSION CASE
    if (!data?.session) {
      alert("Login failed: No session returned");
      return;
    }

    // ✅ SUCCESS
    alert("Login successful");

    // 🔥 FORCE NAVIGATION (most reliable in your setup)
    window.location.href = "/wallet";
  };

  return (
    <div style={container}>
      <form onSubmit={handleLogin} style={form}>
        <h2 style={{ textAlign: "center" }}>Login</h2>

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

/* STYLES */
const container: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
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
  border: "1px solid #333",
  background: "#000",
  color: "white",
  outline: "none",
};

const button: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  border: "none",
  background: "lime",
  color: "black",
  fontWeight: "bold",
  cursor: "pointer",
};
