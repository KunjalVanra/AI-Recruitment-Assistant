import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      showToast("Please enter both email and password.", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email: email.trim(),
        password,
      });

      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("user", JSON.stringify(res.data));
      showToast("Login successful! Welcome back.", "success");

      // Redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      console.error("Login Error:", err.response?.data || err);

      const errorData = err.response?.data;
      let errorMessage = "Invalid email or password.";

      if (typeof errorData?.detail === "string") {
        errorMessage = errorData.detail;
      } else if (Array.isArray(errorData?.detail)) {
        errorMessage = errorData.detail
          .map((item) => item.msg || "Invalid input")
          .join(", ");
      } else if (typeof errorData?.message === "string") {
        errorMessage = errorData.message;
      }

      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Top Brand Bar */}
      <header style={headerStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={logoIcon}>
            <Sparkles size={18} color="#ffffff" />
          </div>
          <div>
            <div style={brandName}>AI Recruitment Assistant</div>
            <div style={brandTagline}>Intelligent Candidate Screening & Matching</div>
          </div>
        </div>
        <div style={statusBadge}>
          <span style={greenPulse} />
          <span>Production API Online</span>
        </div>
      </header>

      {/* Main Content Card */}
      <main style={mainContentStyle}>
        <div style={authCardStyle}>
          <div style={{ textAlign: "center", marginBottom: "28px" }}>
            <div style={iconBadgeStyle}>
              <ShieldCheck size={26} color="#2563eb" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              Recruiter Sign In
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              Sign in to manage openings, screen resumes, and review AI rankings
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Work Email <span className="required">*</span>
              </label>
              <div style={inputContainer}>
                <Mail size={16} color="#94a3b8" style={inputIcon} />
                <input
                  id="login-email"
                  type="email"
                  className="form-control"
                  style={{ paddingLeft: "38px" }}
                  placeholder="recruiter@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: "24px" }}>
              <label className="form-label" htmlFor="login-password">
                Password <span className="required">*</span>
              </label>
              <div style={inputContainer}>
                <Lock size={16} color="#94a3b8" style={inputIcon} />
                <input
                  id="login-password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: "38px" }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "15px" }}
              disabled={loading}
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={dividerStyle}>
            <span>New to the platform?</span>
          </div>

          <Link
            to="/register"
            className="btn btn-secondary"
            style={{ width: "100%", padding: "11px", textAlign: "center" }}
          >
            Create Recruiter Account
          </Link>

          <div style={securityFooter}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Secure 256-bit JWT encrypted session</span>
          </div>
        </div>
      </main>
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fafc 0%, #eef2f6 100%)",
  display: "flex",
  flexDirection: "column",
};

const headerStyle = {
  height: "72px",
  padding: "0 36px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  borderBottom: "1px solid #e2e8f0",
  background: "#ffffff",
};

const logoIcon = {
  width: "34px",
  height: "34px",
  borderRadius: "9px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 2px 6px rgba(37, 99, 235, 0.3)",
};

const brandName = {
  fontSize: "16px",
  fontWeight: 800,
  color: "#0f172a",
};

const brandTagline = {
  fontSize: "12px",
  color: "#64748b",
};

const statusBadge = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  fontSize: "12.5px",
  color: "#059669",
  fontWeight: 600,
  background: "#ecfdf5",
  padding: "5px 12px",
  borderRadius: "20px",
  border: "1px solid #a7f3d0",
};

const greenPulse = {
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#10b981",
};

const mainContentStyle = {
  flex: 1,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "36px 20px",
};

const authCardStyle = {
  width: "100%",
  maxWidth: "420px",
  background: "#ffffff",
  borderRadius: "16px",
  padding: "36px 32px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)",
};

const iconBadgeStyle = {
  width: "52px",
  height: "52px",
  borderRadius: "50%",
  background: "#eff6ff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 16px",
  border: "1px solid #dbeafe",
};

const inputContainer = {
  position: "relative",
  display: "flex",
  alignItems: "center",
};

const inputIcon = {
  position: "absolute",
  left: "12px",
  pointerEvents: "none",
};

const dividerStyle = {
  textAlign: "center",
  margin: "24px 0 16px",
  fontSize: "13px",
  color: "#94a3b8",
  position: "relative",
};

const securityFooter = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "6px",
  marginTop: "24px",
  fontSize: "12px",
  color: "#64748b",
};

export default Login;