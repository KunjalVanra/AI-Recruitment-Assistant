import { useEffect, useState } from "react";
import api from "../services/api";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    api
      .get("/jobs")
      .then((res) => {
        setJobs(res.data);
      })
      .catch(console.error);
  }, []);

  return (
    <div style={container}>
      <h1 style={title}>💼 Available Jobs</h1>

      <p style={subtitle}>
        Browse all active job openings in the recruitment system.
      </p>

      <div style={grid}>
        {jobs.map((job) => (
          <div key={job.id} style={card}>
            <div style={header}>
              <h2 style={{ margin: 0 }}>{job.title}</h2>
              <span style={idBadge}>Job #{job.id}</span>
            </div>

            <hr style={{ margin: "15px 0" }} />

            <h4 style={sectionTitle}>Description</h4>

            <p style={description}>{job.description}</p>

            <h4 style={sectionTitle}>Required Skills</h4>

            <div style={skillsContainer}>
              {job.required_skills
                .split(",")
                .map((skill, index) => (
                  <span key={index} style={skillBadge}>
                    {skill.trim()}
                  </span>
                ))}
            </div>

            <div style={{ marginTop: 20 }}>
              <p>
                <strong>Experience:</strong>{" "}
                {job.experience_requirement}
              </p>

              <p>
                <strong>Education:</strong>{" "}
                {job.education_requirement}
              </p>
            </div>
          </div>
        ))}
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
  marginBottom: "30px",
};

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit,minmax(380px,1fr))",
  gap: "25px",
};

const card = {
  background: "#fff",
  padding: "25px",
  borderRadius: "15px",
  boxShadow: "0 10px 25px rgba(0,0,0,.08)",
  transition: "0.3s",
};

const header = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const idBadge = {
  background: "#2563eb",
  color: "white",
  padding: "6px 12px",
  borderRadius: "20px",
  fontSize: "13px",
};

const sectionTitle = {
  color: "#2563eb",
  marginBottom: "8px",
};

const description = {
  color: "#555",
  lineHeight: "1.6",
};

const skillsContainer = {
  display: "flex",
  flexWrap: "wrap",
  gap: "10px",
  marginTop: "10px",
};

const skillBadge = {
  background: "#e3f2fd",
  color: "#1565c0",
  padding: "7px 14px",
  borderRadius: "20px",
  fontSize: "14px",
  fontWeight: "500",
};

export default Jobs;