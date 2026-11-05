import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Sparkles, User, Mail, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function Register() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!name.trim() || !email.trim() || !password.trim()) {
      showToast("Please fill in all required fields.", "warning");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showToast("Please enter a valid email address.", "warning");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters long.", "warning");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/register", {
        name: name.trim(),
        email: email.trim(),
        password,
      });

      console.log("Registered:", res.data);
      showToast("Registration successful! Please sign in with your credentials.", "success");
      navigate("/login");
    } catch (err) {
      console.error(err);
      const errorMsg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        "Registration failed. Email might already be in use.";
      showToast(typeof errorMsg === "string" ? errorMsg : "Registration failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      {/* Top Header */}
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

      {/* Main Registration Card */}
      <main style={mainContentStyle}>
        <div style={authCardStyle}>
          <div style={{ textAlign: "center", marginBottom: "26px" }}>
            <div style={iconBadgeStyle}>
              <User size={26} color="#2563eb" />
            </div>
            <h1 style={{ fontSize: "24px", fontWeight: 800, color: "#0f172a", marginBottom: "6px" }}>
              Create Recruiter Account
            </h1>
            <p style={{ fontSize: "14px", color: "#64748b" }}>
              Get started with automated AI resume screening and ranking
            </p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label" htmlFor="reg-name">
                Full Name <span className="required">*</span>
              </label>
              <div style={inputContainer}>
                <User size={16} color="#94a3b8" style={inputIcon} />
                <input
                  id="reg-name"
                  type="text"
                  className="form-control"
                  style={{ paddingLeft: "38px" }}
                  placeholder="e.g. Sarah Connor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Work Email <span className="required">*</span>
              </label>
              <div style={inputContainer}>
                <Mail size={16} color="#94a3b8" style={inputIcon} />
                <input
                  id="reg-email"
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
              <label className="form-label" htmlFor="reg-password">
                Password <span className="required">*</span>
              </label>
              <div style={inputContainer}>
                <Lock size={16} color="#94a3b8" style={inputIcon} />
                <input
                  id="reg-password"
                  type="password"
                  className="form-control"
                  style={{ paddingLeft: "38px" }}
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <p style={{ fontSize: "12px", color: "#94a3b8", marginTop: "4px" }}>
                Must be at least 6 characters long
              </p>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "12px", fontSize: "15px" }}
              disabled={loading}
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div style={dividerStyle}>
            <span>Already have an account?</span>
          </div>

          <Link
            to="/login"
            className="btn btn-secondary"
            style={{ width: "100%", padding: "11px", textAlign: "center" }}
          >
            Sign In Instead
          </Link>

          <div style={securityFooter}>
            <ShieldCheck size={14} color="#10b981" />
            <span>Secure Recruiter Credentials Protected</span>
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
  maxWidth: "430px",
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

export default Register;