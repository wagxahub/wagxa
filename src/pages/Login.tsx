import { useState } from "react";
import { supabase } from "../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("LOGIN RESPONSE:", { data, error });

      setLoading(false);

      if (error) {
        alert(error.message);
        return;
      }

      if (!data?.session) {
        alert("Login failed: no session created");
        return;
      }

      alert("Login successful");

      // 🔥 FORCE REDIRECT (bypass router issues)
      window.location.href = "/wallet";
    } catch (err) {
      setLoading(false);
      console.log("UNEXPECTED ERROR:", err);
      alert("Something went wrong");
    }
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
