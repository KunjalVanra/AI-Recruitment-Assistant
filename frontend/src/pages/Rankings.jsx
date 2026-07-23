import { useEffect, useState } from "react";
import api from "../services/api";

function Rankings() {
  const [rankings, setRankings] = useState([]);

  useEffect(() => {
    api
      .get("/ai/rankings")
      .then((res) => setRankings(res.data))
      .catch(console.error);
  }, []);

  const badgeColor = (recommendation) => {
    switch (recommendation) {
      case "Strong Candidate":
        return "#16a34a";
      case "Good Candidate":
        return "#2563eb";
      case "Average Candidate":
        return "#f59e0b";
      default:
        return "#ef4444";
    }
  };

  return (
    <div style={container}>
      <h1 style={heading}>🏆 Candidate Rankings</h1>
      <p style={subHeading}>
        AI Generated Candidate Ranking & Recommendation
      </p>

      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr style={headerRow}>
              <th style={th}>Rank</th>
              <th style={th}>Candidate</th>
              <th style={th}>Overall Score</th>
              <th style={th}>Recommendation</th>
            </tr>
          </thead>

          <tbody>
            {rankings.map((candidate, index) => (
              <tr key={candidate.id} style={row}>
                <td style={td}>
                  {index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : index + 1}
                </td>

                <td style={td}>{candidate.name}</td>

                <td style={td}>
                  <b>{candidate.overall_score}%</b>
                </td>

                <td style={td}>
                  <span
                    style={{
                      background: badgeColor(candidate.recommendation),
                      color: "#fff",
                      padding: "6px 14px",
                      borderRadius: "20px",
                      fontSize: "13px",
                      fontWeight: "bold",
                    }}
                  >
                    {candidate.recommendation}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const container = {
  padding: "30px",
  background: "#f5f7fb",
  minHeight: "100vh",
};

const heading = {
  fontSize: "32px",
  marginBottom: "8px",
};

const subHeading = {
  color: "#666",
  marginBottom: "25px",
};

const tableContainer = {
  background: "#fff",
  borderRadius: "15px",
  overflow: "hidden",
  boxShadow: "0 5px 20px rgba(0,0,0,0.1)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const headerRow = {
  background: "#2563eb",
  color: "#fff",
};

const th = {
  padding: "18px",
  textAlign: "left",
};

const td = {
  padding: "18px",
  borderBottom: "1px solid #eee",
};

const row = {
  transition: "0.3s",
};

export default Rankings;