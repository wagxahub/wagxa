import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();

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

    // ❌ ERROR HANDLING
    if (error) {
      alert(error.message);
      console.log("LOGIN ERROR:", error);
      return;
    }

    console.log("LOGIN DATA:", data);

    // ❌ NO SESSION = STOP
    if (!data?.session) {
      alert("Login failed: no session created");
      return;
    }

    // ✅ SUCCESS
    alert("Login successful");

    // ✅ SAFE REDIRECT
    navigate("/wallet", { replace: true });
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
