import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      alert("Please enter both email and password.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify(res.data));

      // Reload so App.jsx reads the updated login state
      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        "Invalid email or password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>

      {/* Header */}
      <div style={header}>
        <div style={logoBox}>🤖</div>

        <div>
          <h1 style={title}>AI Recruitment Assistant</h1>
          <p style={headerSubtitle}>
            AI Powered Resume Screening & Candidate Ranking System
          </p>
        </div>
      </div>

      {/* Login Card */}
      <div style={content}>

        <form onSubmit={handleLogin} style={card}>

          <div style={iconCircle}>
            👤
          </div>

          <h2 style={heading}>Welcome Back</h2>

          <p style={description}>
            Sign in to access your recruitment dashboard
          </p>

          {/* Email */}
          <label style={label}>
            Email Address
          </label>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={input}
          />

          {/* Password */}
          <label style={label}>
            Password
          </label>

          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          {/* Login */}
          <button
            type="submit"
            style={button}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div style={divider}>
            <span>Don't have an account?</span>
          </div>

          <Link to="/register" style={registerButton}>
            Create New Account
          </Link>

        </form>

      </div>

      {/* Footer */}
      <div style={footer}>
        AI Recruitment Assistant • Intelligent Hiring System
      </div>

    </div>
  );
}


/* ========================= */
/* Styles */
/* ========================= */

const page = {
  minHeight: "100vh",
  background: "#f5f7fb",
  fontFamily: "Arial, sans-serif",
};

const header = {
  height: "85px",
  background: "#1976d2",
  display: "flex",
  alignItems: "center",
  padding: "0 45px",
  color: "white",
  boxSizing: "border-box",
};

const logoBox = {
  width: "50px",
  height: "50px",
  borderRadius: "10px",
  background: "rgba(255,255,255,0.18)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "25px",
  marginRight: "15px",
};

const title = {
  margin: 0,
  fontSize: "24px",
};

const headerSubtitle = {
  margin: "5px 0 0",
  fontSize: "13px",
  opacity: 0.9,
};

const content = {
  minHeight: "calc(100vh - 145px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  padding: "40px 20px",
  boxSizing: "border-box",
};

const card = {
  width: "390px",
  background: "#ffffff",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
  boxSizing: "border-box",
};

const iconCircle = {
  width: "65px",
  height: "65px",
  borderRadius: "50%",
  background: "#e3f2fd",
  color: "#1976d2",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "28px",
  margin: "0 auto 20px",
};

const heading = {
  textAlign: "center",
  margin: "0 0 8px",
  color: "#222",
  fontSize: "26px",
};

const description = {
  textAlign: "center",
  color: "#777",
  fontSize: "14px",
  marginBottom: "30px",
};

const label = {
  display: "block",
  fontWeight: "600",
  fontSize: "14px",
  color: "#333",
  marginBottom: "7px",
  marginTop: "18px",
};

const input = {
  width: "100%",
  padding: "13px",
  border: "1px solid #d5d5d5",
  borderRadius: "7px",
  fontSize: "14px",
  boxSizing: "border-box",
  outline: "none",
};

const button = {
  width: "100%",
  padding: "13px",
  marginTop: "25px",
  background: "#1976d2",
  color: "white",
  border: "none",
  borderRadius: "7px",
  fontSize: "15px",
  fontWeight: "bold",
  cursor: "pointer",
};

const divider = {
  textAlign: "center",
  margin: "25px 0 15px",
  color: "#777",
  fontSize: "13px",
};

const registerButton = {
  display: "block",
  width: "100%",
  padding: "12px",
  textAlign: "center",
  border: "1px solid #1976d2",
  borderRadius: "7px",
  color: "#1976d2",
  textDecoration: "none",
  fontWeight: "bold",
  fontSize: "14px",
  boxSizing: "border-box",
};

const footer = {
  height: "60px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#888",
  fontSize: "12px",
  background: "#ffffff",
};

export default Login;