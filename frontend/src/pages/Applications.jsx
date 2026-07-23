import { useEffect, useState } from "react";
import api from "../services/api";

function Applications() {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    api
      .get("/applications")
      .then((res) => setApplications(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={container}>
      <div style={card}>
        <h1 style={title}>Applications</h1>

        <table style={tableStyle}>
          <thead>
            <tr style={headerRow}>
              <th style={headerCell}>ID</th>
              <th style={headerCell}>Candidate</th>
              <th style={headerCell}>Job</th>
              <th style={headerCell}>Status</th>
            </tr>
          </thead>

          <tbody>
            {applications.map((app) => (
              <tr key={app.application_id} style={rowStyle}>
                <td style={cellStyle}>{app.application_id}</td>

                <td style={cellStyle}>{app.candidate_name}</td>

                <td style={cellStyle}>{app.job_title}</td>

                <td style={cellStyle}>
                  <span
                    style={{
                      ...badgeStyle,
                      backgroundColor:
                        app.status === "Shortlisted"
                          ? "#4CAF50"
                          : app.status === "Applied"
                          ? "#2196F3"
                          : app.status === "Rejected"
                          ? "#f44336"
                          : "#757575",
                    }}
                  >
                    {app.status}
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
  background: "#f4f6f9",
  minHeight: "100vh",
  padding: "30px",
};

const card = {
  background: "#fff",
  borderRadius: "12px",
  padding: "25px",
  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
};

const title = {
  marginBottom: "20px",
  color: "#333",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
};

const headerRow = {
  backgroundColor: "#1976d2",
};

const headerCell = {
  color: "white",
  padding: "14px",
  textAlign: "left",
};

const rowStyle = {
  borderBottom: "1px solid #ddd",
};

const cellStyle = {
  padding: "14px",
};

const badgeStyle = {
  color: "white",
  padding: "6px 14px",
  borderRadius: "20px",
  fontWeight: "bold",
  fontSize: "14px",
};

export default Applications;