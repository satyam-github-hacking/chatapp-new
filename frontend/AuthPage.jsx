import { useState, useContext } from "react";
import { AuthContext } from "./App";

const BG = "#111b21";
const SURFACE = "#202c33";
const GREEN = "#25d366";
const TEXT = "#e9edef";
const MUTED = "#8696a0";

export default function AuthPage() {
  const { login } = useContext(AuthContext);
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/login/" : "/api/register/";
      const body = { username, password };
      if (mode === "register") body.mobile_number = mobile;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        login(data.user, data.token);
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") submit();
  };

  const inp = {
    width: "100%",
    padding: "12px 14px",
    background: "#2a3942",
    border: "none",
    borderRadius: "8px",
    color: TEXT,
    fontSize: "15px",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: BG, height: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: SURFACE, borderRadius: "16px", padding: "40px 36px", width: "100%", maxWidth: "380px", boxShadow: "0 8px 40px rgba(0,0,0,0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>💬</div>
          <h1 style={{ color: TEXT, margin: "0 0 4px 0", fontSize: "24px" }}>ChatApp</h1>
          <p style={{ color: MUTED, margin: 0, fontSize: "14px" }}>
            {mode === "login" ? "Sign in to continue" : "Create your account"}
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <input
            style={inp}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKey}
            autoComplete="username"
          />

          {mode === "register" && (
            <input
              style={inp}
              placeholder="Mobile number (optional)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              onKeyDown={handleKey}
              type="tel"
            />
          )}

          <input
            style={inp}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKey}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          {error && (
            <div style={{ background: "#3d1515", border: "1px solid #7f1d1d", borderRadius: "8px", padding: "10px 14px", color: "#fca5a5", fontSize: "14px" }}>
              {error}
            </div>
          )}

          <button
            onClick={submit}
            disabled={loading}
            style={{
              padding: "13px",
              background: loading ? "#1a7a40" : GREEN,
              border: "none",
              borderRadius: "8px",
              color: "white",
              fontWeight: "600",
              fontSize: "16px",
              cursor: loading ? "not-allowed" : "pointer",
              marginTop: "4px",
              transition: "background 0.2s",
            }}
          >
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <span style={{ color: MUTED, fontSize: "14px" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          </span>
          <button
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
            style={{ background: "none", border: "none", color: GREEN, cursor: "pointer", fontSize: "14px", fontWeight: "600", padding: 0 }}
          >
            {mode === "login" ? "Register" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}
