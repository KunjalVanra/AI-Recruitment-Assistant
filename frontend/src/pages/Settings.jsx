import React, { useState, useEffect } from "react";
import { User, Shield, Server, Database, Cpu, CheckCircle2, LogOut } from "lucide-react";
import api from "../services/api";
import { useToast } from "../context/ToastContext";

function Settings() {
  const [recruiter, setRecruiter] = useState(null);
  const [backendStatus, setBackendStatus] = useState("Checking...");
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.recruiter) {
          setRecruiter(parsed.recruiter);
        }
      }
    } catch (e) {
      console.error(e);
    }

    // Ping backend root
    api
      .get("/")
      .then((res) => {
        setBackendStatus(res.data?.message || "Connected");
      })
      .catch((err) => {
        setBackendStatus("Connecting or Offline");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    showToast("Logged out successfully.", "info");
    window.location.href = "/login";
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)", marginBottom: "4px" }}>
          Recruiter Settings & System Health
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Manage your recruitment credentials, inspect system status, and configure environment connections
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
        {/* Recruiter Profile Card */}
        <div className="card card-padding">
          <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "var(--primary)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: "18px",
              }}
            >
              {recruiter?.name ? recruiter.name.charAt(0).toUpperCase() : "R"}
            </div>
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: 700 }}>
                {recruiter?.name || "Active Recruiter"}
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                {recruiter?.email || "recruiter@company.com"}
              </p>
            </div>
          </div>

          <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "16px 0" }} />

          <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "13.5px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Role:</span>
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>Technical Recruiter</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Recruiter ID:</span>
              <span style={{ fontWeight: 600, color: "var(--text-main)" }}>#{recruiter?.id || "1"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--text-muted)" }}>Authentication:</span>
              <span className="badge badge-green">JWT Bearer Active</span>
            </div>
          </div>

          <div style={{ marginTop: "24px" }}>
            <button onClick={handleLogout} className="btn btn-danger-outline btn-sm" style={{ width: "100%" }}>
              <LogOut size={15} />
              <span>Sign Out Current Session</span>
            </button>
          </div>
        </div>

        {/* System & Architecture Status */}
        <div className="card card-padding">
          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Server size={18} color="var(--primary)" />
            <span>Infrastructure & AI Services</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px", fontSize: "13.5px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Server size={17} color="#2563eb" />
                <div>
                  <div style={{ fontWeight: 600 }}>FastAPI Backend (Render)</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>https://ai-recruitment-assistant-3bir.onrender.com</div>
                </div>
              </div>
              <span className="badge badge-green" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <CheckCircle2 size={12} /> {backendStatus}
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Database size={17} color="#059669" />
                <div>
                  <div style={{ fontWeight: 600 }}>Railway MySQL Database</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Tables: Candidates, Jobs, Rankings, Applications, Recruiters</div>
                </div>
              </div>
              <span className="badge badge-blue">Connected</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <Cpu size={17} color="#8b5cf6" />
                <div>
                  <div style={{ fontWeight: 600 }}>Groq AI LLM Engine</div>
                  <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>Model: openai/gpt-oss-20b & Llama 3.3 Versatile</div>
                </div>
              </div>
              <span className="badge badge-purple">Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
