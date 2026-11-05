import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Filter,
  Search,
  User,
  Briefcase,
  Sparkles,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  UserCheck,
  XCircle,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";

function Applications() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedJobFilter, setSelectedJobFilter] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedAppToDelete, setSelectedAppToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState(null);

  const statusOptions = [
    "Applied",
    "Under Review",
    "Shortlisted",
    "Interview Scheduled",
    "Selected",
    "Rejected",
  ];

  useEffect(() => {
    // Read query params if routed from Jobs or Dashboard
    const params = new URLSearchParams(location.search);
    const jobParam = params.get("job_id");
    const statusParam = params.get("status");

    if (jobParam) setSelectedJobFilter(jobParam);
    if (statusParam) setSelectedStatusFilter(statusParam);

    fetchData();
  }, [location.search]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appsRes, jobsRes] = await Promise.allSettled([
        api.get("/applications"),
        api.get("/jobs/"),
      ]);

      if (appsRes.status === "fulfilled" && Array.isArray(appsRes.value.data)) {
        setApplications(appsRes.value.data);
      } else {
        setApplications([]);
      }

      if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data)) {
        setJobs(jobsRes.value.data);
      }
    } catch (err) {
      console.error("Fetch applications error:", err);
      setError("Failed to load recruitment applications.");
    } finally {
      setLoading(false);
    }
  };

  // Update Status handler
  const handleStatusChange = async (appId, newStatus) => {
    try {
      setUpdatingId(appId);
      await api.put(`/applications/${appId}?status=${encodeURIComponent(newStatus)}`);

      setApplications((prev) =>
        prev.map((app) =>
          app.application_id === appId ? { ...app, status: newStatus } : app
        )
      );

      showToast(`Application status updated to "${newStatus}"`, "success");
    } catch (err) {
      console.error("Update status error:", err);
      showToast("Failed to update application status.", "error");
    } finally {
      setUpdatingId(null);
    }
  };

  // Withdraw / Delete application
  const handlePromptDelete = (app) => {
    setSelectedAppToDelete(app);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAppToDelete) return;
    try {
      setDeleting(true);
      await api.delete(`/applications/${selectedAppToDelete.application_id}`);
      showToast("Application withdrawn successfully.", "success");
      setDeleteModalOpen(false);
      setApplications((prev) =>
        prev.filter((a) => a.application_id !== selectedAppToDelete.application_id)
      );
    } catch (err) {
      console.error("Delete application error:", err);
      showToast("Failed to withdraw application.", "error");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "Shortlisted":
        return "badge-green";
      case "Selected":
        return "badge-green";
      case "Interview Scheduled":
        return "badge-purple";
      case "Under Review":
        return "badge-amber";
      case "Rejected":
        return "badge-red";
      default:
        return "badge-blue";
    }
  };

  // Filtered applications
  const filteredApps = applications.filter((app) => {
    const matchesJob = selectedJobFilter ? String(app.job_id) === String(selectedJobFilter) : true;
    const matchesStatus = selectedStatusFilter ? app.status === selectedStatusFilter : true;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (app.candidate_name || "").toLowerCase().includes(query) ||
      (app.candidate_email || "").toLowerCase().includes(query) ||
      (app.job_title || "").toLowerCase().includes(query);

    return matchesJob && matchesStatus && matchesSearch;
  });

  return (
    <div>
      {/* Page Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", marginBottom: "4px" }}>
            Candidate Application Pipeline
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Manage active candidate applications across all job openings and track recruitment stages.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/rankings")}
        >
          <Sparkles size={16} />
          <span>Match Candidates</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "14px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "240px", display: "flex", alignItems: "center", position: "relative" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px" }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: "36px" }}
            placeholder="Search by candidate name, email, or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Job Filter */}
        <div style={{ minWidth: "180px" }}>
          <select
            className="form-control"
            value={selectedJobFilter}
            onChange={(e) => setSelectedJobFilter(e.target.value)}
          >
            <option value="">All Job Openings</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ minWidth: "180px" }}>
          <select
            className="form-control"
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
          >
            <option value="">All Pipeline Stages</option>
            {statusOptions.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedJobFilter || selectedStatusFilter) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedJobFilter("");
              setSelectedStatusFilter("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error alert */}
      {error && (
        <div
          style={{
            padding: "14px 18px",
            background: "var(--danger-light)",
            border: "1px solid var(--danger-border)",
            borderRadius: "var(--radius-md)",
            color: "var(--danger-text)",
            fontSize: "13.5px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            marginBottom: "24px",
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Applications Table Card */}
      <Card
        title={`All Applications (${filteredApps.length})`}
        subtitle="Live application records from MySQL database"
        padding={false}
      >
        {loading ? (
          <div style={{ padding: "24px" }}>
            <Skeleton height="35px" style={{ marginBottom: "12px" }} />
            <Skeleton height="35px" style={{ marginBottom: "12px" }} />
            <Skeleton height="35px" />
          </div>
        ) : filteredApps.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <ClipboardList size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              No Applications Found
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
              {selectedJobFilter || selectedStatusFilter || searchQuery
                ? "No applications match your selected filters."
                : "No candidates have applied to jobs yet. Match candidates from the AI Candidate Ranking module to populate the pipeline."}
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/rankings")}>
              <Sparkles size={15} />
              <span>Match Candidates & Jobs</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>App ID</th>
                  <th>Candidate</th>
                  <th>Job Opening</th>
                  <th>AI Match Score</th>
                  <th>Current Pipeline Stage</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map((app) => (
                  <tr key={app.application_id}>
                    <td style={{ fontWeight: 600, color: "var(--text-muted)" }}>
                      #{app.application_id}
                    </td>

                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "14px" }}>
                        {app.candidate_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {app.candidate_email}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "13.5px" }}>
                        {app.job_title}
                      </div>
                      <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                        Job #{app.job_id}
                      </span>
                    </td>

                    <td>
                      {app.overall_score !== null && app.overall_score !== undefined ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontWeight: 800, fontSize: "15px", color: "var(--primary)" }}>
                            {app.overall_score}%
                          </span>
                          <span className={`badge ${app.overall_score >= 85 ? "badge-green" : app.overall_score >= 70 ? "badge-blue" : "badge-amber"}`} style={{ fontSize: "10.5px" }}>
                            {app.recommendation || "Evaluated"}
                          </span>
                        </div>
                      ) : (
                        <button
                          className="btn btn-secondary btn-sm"
                          style={{ fontSize: "11.5px", padding: "3px 8px" }}
                          onClick={() => navigate(`/rankings?job_id=${app.job_id}`)}
                        >
                          <Sparkles size={12} />
                          <span>Evaluate Score</span>
                        </button>
                      )}
                    </td>

                    <td>
                      <select
                        className="form-control"
                        style={{
                          fontSize: "12.5px",
                          padding: "6px 10px",
                          width: "180px",
                          fontWeight: 600,
                        }}
                        value={app.status || "Applied"}
                        disabled={updatingId === app.application_id}
                        onChange={(e) => handleStatusChange(app.application_id, e.target.value)}
                      >
                        {statusOptions.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/candidates?name=${encodeURIComponent(app.candidate_name)}`)}
                          title="View Candidate Profile"
                        >
                          <User size={14} />
                          <span>Profile</span>
                        </button>

                        <button
                          className="btn-icon"
                          style={{ color: "var(--danger)" }}
                          onClick={() => handlePromptDelete(app)}
                          title="Withdraw Application"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirmation Modal for Delete/Withdraw Application */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        title="Withdraw Candidate Application?"
        message={`Are you sure you want to withdraw ${selectedAppToDelete?.candidate_name}'s application for ${selectedAppToDelete?.job_title}?`}
        confirmText="Withdraw Application"
        isDanger={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModalOpen(false)}
      />
    </div>
  );
}

export default Applications;