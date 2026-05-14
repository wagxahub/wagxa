import { supabase } from "../lib/supabase";

export default function LoginTest() {
  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: "test@example.com",
      password: "12345678",
    });

    console.log("LOGIN DATA:", data);
    console.log("LOGIN ERROR:", error);

    if (error) {
      alert(error.message);
    } else {
      alert("Login successful");
    }
  };

  return (
    <div
      style={{
        padding: 20,
        background: "#111",
        minHeight: "100vh",
        color: "white",
      }}
    >
      <h2>Login Test</h2>

      <button
        onClick={handleLogin}
        style={{
          padding: "12px 20px",
          background: "lime",
          color: "black",
          border: "none",
          borderRadius: "8px",
          marginTop: "20px",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Test Login
      </button>
    </div>
  );
}
