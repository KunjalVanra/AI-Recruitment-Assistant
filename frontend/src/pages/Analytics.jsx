import React, { useEffect, useState } from "react";
import {
  BarChart3,
  TrendingUp,
  Award,
  Users,
  Briefcase,
  ClipboardList,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  PieChart,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import { useToast } from "../context/ToastContext";

function Analytics() {
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [statsData, setStatsData] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);

      const [statsRes, jobsRes, candsRes, appsRes] = await Promise.allSettled([
        api.get("/dashboard/stats"),
        api.get("/jobs/"),
        api.get("/candidates/"),
        api.get("/applications"),
      ]);

      if (statsRes.status === "fulfilled") setStatsData(statsRes.value.data);
      if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data)) setJobs(jobsRes.value.data);
      if (candsRes.status === "fulfilled" && Array.isArray(candsRes.value.data)) setCandidates(candsRes.value.data);
      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value.data)) setApplications(appsRes.value.data);
    } catch (e) {
      console.error("Analytics fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  // Metrics computation from real database records
  const totalCandidates = candidates.length || statsData?.total_candidates || 0;
  const totalJobs = jobs.length || statsData?.total_jobs || 0;
  const totalApps = applications.length || statsData?.total_applications || 0;

  const shortlistedCount = applications.filter(
    (a) => a.status === "Shortlisted" || a.status === "Interview Scheduled" || a.status === "Selected"
  ).length;

  const selectedCount = applications.filter((a) => a.status === "Selected").length;
  const rejectedCount = applications.filter((a) => a.status === "Rejected").length;

  // Extracted skill frequencies
  const skillCounts = {};
  candidates.forEach((c) => {
    if (c.skills) {
      c.skills.split(",").forEach((s) => {
        const clean = s.trim();
        if (clean) skillCounts[clean] = (skillCounts[clean] || 0) + 1;
      });
    }
  });

  const topSkills = Object.entries(skillCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({
      skill,
      count,
      percentage: totalCandidates > 0 ? Math.round((count / totalCandidates) * 100) : 0,
    }));

  // Application stage distribution
  const stages = [
    { label: "Applied", color: "#2563eb", count: applications.filter((a) => a.status === "Applied" || !a.status).length },
    { label: "Under Review", color: "#f59e0b", count: applications.filter((a) => a.status === "Under Review").length },
    { label: "Shortlisted", color: "#10b981", count: applications.filter((a) => a.status === "Shortlisted").length },
    { label: "Interview Scheduled", color: "#8b5cf6", count: applications.filter((a) => a.status === "Interview Scheduled").length },
    { label: "Selected", color: "#059669", count: selectedCount },
    { label: "Rejected", color: "#ef4444", count: rejectedCount },
  ];

  // Job-wise application counts
  const jobDistribution = jobs.map((job) => {
    const count = applications.filter((a) => a.job_id === job.id).length;
    return {
      title: job.title,
      id: job.id,
      count,
    };
  });

  // Export Candidates to CSV
  const exportCandidatesCSV = () => {
    if (candidates.length === 0) {
      showToast("No candidate records available to export.", "warning");
      return;
    }

    const headers = ["ID", "Name", "Email", "Phone", "Skills", "Resume_File"];
    const rows = candidates.map((c) => [
      c.id,
      `"${(c.name || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.skills || "").replace(/"/g, '""')}"`,
      `"${(c.resume_file || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `candidates_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Candidates report exported to CSV successfully!", "success");
  };

  // Export Applications to CSV
  const exportApplicationsCSV = () => {
    if (applications.length === 0) {
      showToast("No application records available to export.", "warning");
      return;
    }

    const headers = ["Application_ID", "Candidate_ID", "Candidate_Name", "Candidate_Email", "Job_ID", "Job_Title", "Status", "Match_Score"];
    const rows = applications.map((a) => [
      a.application_id,
      a.candidate_id,
      `"${(a.candidate_name || "").replace(/"/g, '""')}"`,
      `"${(a.candidate_email || "").replace(/"/g, '""')}"`,
      a.job_id,
      `"${(a.job_title || "").replace(/"/g, '""')}"`,
      `"${(a.status || "Applied").replace(/"/g, '""')}"`,
      a.overall_score || "N/A",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `applications_pipeline_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Applications pipeline report exported to CSV!", "success");
  };

  return (
    <div>
      {/* Page Title & Export Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "26px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", marginBottom: "4px" }}>
            Recruitment Analytics & Insights
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Real-time pipeline metrics, conversion rates, and skill supply analytics.
          </p>
        </div>

        {/* CSV Export Buttons */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary btn-sm" onClick={exportCandidatesCSV}>
            <Download size={14} />
            <span>Export Candidates CSV</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={exportApplicationsCSV}>
            <Download size={14} />
            <span>Export Pipeline CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
          marginBottom: "26px",
        }}
      >
        <StatCard title="Total Candidates" value={totalCandidates} icon={Users} color="#2563eb" loading={loading} />
        <StatCard title="Active Jobs" value={totalJobs} icon={Briefcase} color="#059669" loading={loading} />
        <StatCard title="Applications" value={totalApps} icon={ClipboardList} color="#f59e0b" loading={loading} />
        <StatCard title="Shortlisted" value={shortlistedCount} icon={CheckCircle2} color="#10b981" loading={loading} />
        <StatCard title="Hired / Selected" value={selectedCount} icon={Award} color="#8b5cf6" loading={loading} />
        <StatCard title="Rejected" value={rejectedCount} icon={XCircle} color="#ef4444" loading={loading} />
      </div>

      {/* Analytics Visualizations Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(380px, 1fr))",
          gap: "24px",
          marginBottom: "26px",
        }}
      >
        {/* Pipeline Stage Distribution */}
        <Card
          title="Recruitment Pipeline Funnel"
          subtitle="Distribution of candidates across pipeline status stages"
        >
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Skeleton height="32px" />
              <Skeleton height="32px" />
              <Skeleton height="32px" />
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {stages.map((stage) => {
                const pct = totalApps > 0 ? Math.round((stage.count / totalApps) * 100) : 0;
                return (
                  <div key={stage.label}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>{stage.label}</span>
                      <span style={{ fontWeight: 700, color: stage.color }}>
                        {stage.count} ({pct}%)
                      </span>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--bg-subtle)", borderRadius: "4px", overflow: "hidden" }}>
                      <div
                        style={{
                          width: `${pct}%`,
                          height: "100%",
                          background: stage.color,
                          borderRadius: "4px",
                          transition: "width 0.5s ease",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Most Prevalent Extracted Candidate Skills */}
        <Card
          title="Most In-Demand Candidate Skills"
          subtitle="Top technical skills extracted from uploaded resumes in MySQL"
        >
          {loading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <Skeleton height="28px" />
              <Skeleton height="28px" />
              <Skeleton height="28px" />
            </div>
          ) : topSkills.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13.5px" }}>
              No candidate skills recorded yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {topSkills.map((item, idx) => (
                <div key={idx}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", marginBottom: "4px" }}>
                    <span style={{ fontWeight: 600 }}>{item.skill}</span>
                    <span style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                      {item.count} candidate{item.count > 1 ? "s" : ""} ({item.percentage}%)
                    </span>
                  </div>
                  <div style={{ width: "100%", height: "8px", background: "var(--bg-subtle)", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${item.percentage}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                        borderRadius: "4px",
                        transition: "width 0.5s ease",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Job-wise Application Volume */}
      <Card
        title="Job Opening Application Volume"
        subtitle="Distribution of applicants per active job opening"
        padding={false}
      >
        {loading ? (
          <div style={{ padding: "20px" }}>
            <Skeleton height="35px" style={{ marginBottom: "10px" }} />
            <Skeleton height="35px" />
          </div>
        ) : jobDistribution.length === 0 ? (
          <div style={{ textAlign: "center", padding: "30px", color: "var(--text-muted)", fontSize: "13.5px" }}>
            No active jobs in the system.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Job Title</th>
                  <th>Job ID</th>
                  <th>Applications Received</th>
                  <th>Share of Pipeline</th>
                </tr>
              </thead>
              <tbody>
                {jobDistribution.map((j) => {
                  const share = totalApps > 0 ? Math.round((j.count / totalApps) * 100) : 0;
                  return (
                    <tr key={j.id}>
                      <td style={{ fontWeight: 600 }}>{j.title}</td>
                      <td style={{ color: "var(--text-muted)" }}>Job #{j.id}</td>
                      <td>
                        <span className="badge badge-blue">
                          {j.count} applicant{j.count !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", width: "160px" }}>
                          <div style={{ flex: 1, height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                            <div
                              style={{
                                width: `${share}%`,
                                height: "100%",
                                background: "var(--primary)",
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                          <span style={{ fontSize: "12px", fontWeight: 700, minWidth: "35px" }}>{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, loading }) {
  return (
    <div
      className="card"
      style={{
        padding: "18px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ fontSize: "12.5px", fontWeight: 600, color: "var(--text-muted)", marginBottom: "4px" }}>
          {title}
        </div>
        {loading ? (
          <Skeleton height="28px" width="50px" />
        ) : (
          <div style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)" }}>
            {value}
          </div>
        )}
      </div>

      <div
        style={{
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
        }}
      >
        <Icon size={20} />
      </div>
    </div>
  );
}

export default Analytics;
