import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      alert("Please fill all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      alert("Please enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        name,
        email,
        password,
      });

      console.log(res.data);

      alert("Registration successful! Please login.");

      navigate("/login");

    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={page}>

      {/* Header */}
      <div style={header}>

        <div style={logoBox}>
          🤖
        </div>

        <div>
          <h1 style={title}>
            AI Recruitment Assistant
          </h1>

          <p style={headerSubtitle}>
            AI Powered Resume Screening & Candidate Ranking System
          </p>
        </div>

      </div>

      {/* Registration */}
      <div style={content}>

        <form
          onSubmit={handleRegister}
          style={card}
        >

          <div style={iconCircle}>
            👨‍💼
          </div>

          <h2 style={heading}>
            Create Account
          </h2>

          <p style={description}>
            Register as a recruiter to get started
          </p>

          {/* Name */}
          <label style={label}>
            Full Name
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={input}
          />

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
            placeholder="Create a password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={input}
          />

          <p style={passwordHint}>
            Password must contain at least 6 characters.
          </p>

          {/* Register */}
          <button
            type="submit"
            style={button}
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account"}
          </button>

          <div style={divider}>
            Already have an account?
          </div>

          <Link
            to="/login"
            style={loginButton}
          >
            Back to Login
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
  marginBottom: "25px",
};

const label = {
  display: "block",
  fontWeight: "600",
  fontSize: "14px",
  color: "#333",
  marginBottom: "7px",
  marginTop: "16px",
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

const passwordHint = {
  fontSize: "12px",
  color: "#888",
  marginTop: "7px",
};

const button = {
  width: "100%",
  padding: "13px",
  marginTop: "20px",
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
  margin: "23px 0 15px",
  color: "#777",
  fontSize: "13px",
};

const loginButton = {
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

export default Register;