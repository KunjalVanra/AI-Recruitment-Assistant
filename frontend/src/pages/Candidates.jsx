import { useEffect, useState } from "react";
import api from "../services/api";

function Candidates() {
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    api
      .get("/candidates")
      .then((res) => {
        setCandidates(res.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={container}>
      <h1 style={title}>👨‍💼 Candidates</h1>

      <p style={subtitle}>
        Registered candidates available for recruitment
      </p>

      <div style={tableContainer}>
        <table style={table}>
          <thead>
            <tr>
              <th style={th}>ID</th>
              <th style={th}>Name</th>
              <th style={th}>Email</th>
              <th style={th}>Phone</th>
              <th style={th}>Skills</th>
            </tr>
          </thead>

          <tbody>
            {candidates.map((c, index) => (
              <tr
                key={c.id}
                style={{
                  background: index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                }}
              >
                <td style={td}>{c.id}</td>
                <td style={td}>{c.name}</td>
                <td style={td}>{c.email}</td>
                <td style={td}>{c.phone}</td>
                <td style={td}>
                  <span style={skillBadge}>{c.skills}</span>
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
  padding: "35px",
  background: "#f4f7fc",
  minHeight: "100vh",
};

const title = {
  color: "#2c3e50",
  marginBottom: "10px",
};

const subtitle = {
  color: "#666",
  marginBottom: "25px",
};

const tableContainer = {
  background: "#fff",
  borderRadius: "15px",
  overflow: "hidden",
  boxShadow: "0 10px 25px rgba(0,0,0,0.08)",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
};

const th = {
  background: "#2563eb",
  color: "white",
  padding: "16px",
  textAlign: "left",
  fontSize: "16px",
};

const td = {
  padding: "15px",
  borderBottom: "1px solid #eee",
};

const skillBadge = {
  background: "#e8f5e9",
  color: "#2e7d32",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "14px",
  display: "inline-block",
};

export default Candidates;