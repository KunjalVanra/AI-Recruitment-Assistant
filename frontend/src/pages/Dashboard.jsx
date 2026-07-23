import { useEffect, useState } from "react";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    total_candidates: 0,
    total_jobs: 0,
    strong_candidates: 0,
    good_candidates: 0,
    average_candidates: 0,
  });

  useEffect(() => {
    api
      .get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch(console.error);
  }, []);

  return (
    <div style={container}>
      {/* Header */}
      <div style={header}>
        <h1 style={title}>🤖 AI Recruitment Assistant</h1>
        <p style={subtitle}>
          AI Powered Resume Screening & Candidate Ranking System
        </p>
      </div>

      {/* Cards */}
      <div style={grid}>
        <Card
          title="Total Candidates"
          value={stats.total_candidates}
          color="#4CAF50"
          icon="👨‍💼"
        />

        <Card
          title="Total Jobs"
          value={stats.total_jobs}
          color="#2196F3"
          icon="💼"
        />

        <Card
          title="Strong Candidates"
          value={stats.strong_candidates}
          color="#8E44AD"
          icon="🏆"
        />

        <Card
          title="Good Candidates"
          value={stats.good_candidates}
          color="#F39C12"
          icon="⭐"
        />

        <Card
          title="Average Candidates"
          value={stats.average_candidates}
          color="#E74C3C"
          icon="📄"
        />
      </div>

      {/* Footer */}
      <div style={footer}>
        AI Recruitment Assistant © 2026
      </div>
    </div>
  );
}

function Card({ title, value, color, icon }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "18px",
        padding: "25px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.08)",
        borderLeft: `8px solid ${color}`,
        transition: "0.3s",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-8px)";
        e.currentTarget.style.boxShadow =
          "0 15px 30px rgba(0,0,0,0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow =
          "0 8px 20px rgba(0,0,0,0.08)";
      }}
    >
      <div
        style={{
          fontSize: "42px",
          textAlign: "right",
        }}
      >
        {icon}
      </div>

      <h3
        style={{
          marginBottom: "10px",
          color: "#444",
        }}
      >
        {title}
      </h3>

      <h1
        style={{
          color,
          fontSize: "48px",
          margin: 0,
        }}
      >
        {value}
      </h1>
    </div>
  );
}

const container = {
  minHeight: "100vh",
  background: "#f4f7fc",
  padding: "40px",
  fontFamily: "Arial, sans-serif",
};

const header = {
  marginBottom: "40px",
};

const title = {
  fontSize: "36px",
  marginBottom: "10px",
  color: "#2c3e50",
};

const subtitle = {
  color: "#666",
  fontSize: "18px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
  gap: "25px",
};

const footer = {
  marginTop: "50px",
  textAlign: "center",
  color: "#777",
  fontSize: "14px",
};

export default Dashboard;