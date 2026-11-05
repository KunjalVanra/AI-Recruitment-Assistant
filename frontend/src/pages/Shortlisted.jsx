import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UserCheck,
  Briefcase,
  Users,
  Search,
  Filter,
  Sparkles,
  Award,
  ChevronRight,
  UserX,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Phone,
  Mail,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";

function Shortlisted() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [shortlisted, setShortlisted] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter & Search
  const [selectedJobFilter, setSelectedJobFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Remove confirmation modal
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [selectedCandidateToRemove, setSelectedCandidateToRemove] = useState(null);
  const [removing, setRemoving] = useState(false);

  useEffect(() => {
    fetchShortlistedData();
  }, []);

  const fetchShortlistedData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [appsRes, jobsRes] = await Promise.allSettled([
        api.get("/applications"),
        api.get("/jobs/"),
      ]);

      const allApps = appsRes.status === "fulfilled" && Array.isArray(appsRes.value.data) ? appsRes.value.data : [];
      const allJobs = jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data) ? jobsRes.value.data : [];

      setJobs(allJobs);

      // Filter applications that are Shortlisted or progressing
      const shortlistedList = allApps.filter(
        (a) => a.status === "Shortlisted" || a.status === "Interview Scheduled" || a.status === "Selected"
      );

      setShortlisted(shortlistedList);
    } catch (err) {
      console.error("Fetch shortlisted error:", err);
      setError("Failed to load shortlisted candidates.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdvanceStatus = async (appId, nextStatus) => {
    try {
      await api.put(`/applications/${appId}?status=${encodeURIComponent(nextStatus)}`);
      showToast(`Candidate status updated to "${nextStatus}"!`, "success");
      fetchShortlistedData();
    } catch (err) {
      console.error("Advance status error:", err);
      showToast("Failed to update candidate status.", "error");
    }
  };

  const handlePromptRemove = (app) => {
    setSelectedCandidateToRemove(app);
    setRemoveModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedCandidateToRemove) return;
    try {
      setRemoving(true);
      await api.put(`/applications/${selectedCandidateToRemove.application_id}?status=Under%20Review`);
      showToast(`${selectedCandidateToRemove.candidate_name} removed from shortlist.`, "info");
      setRemoveModalOpen(false);
      fetchShortlistedData();
    } catch (err) {
      console.error("Remove from shortlist error:", err);
      showToast("Failed to remove candidate from shortlist.", "error");
    } finally {
      setRemoving(false);
    }
  };

  const filteredShortlisted = shortlisted.filter((app) => {
    const matchesJob = selectedJobFilter ? String(app.job_id) === String(selectedJobFilter) : true;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (app.candidate_name || "").toLowerCase().includes(query) ||
      (app.candidate_email || "").toLowerCase().includes(query) ||
      (app.job_title || "").toLowerCase().includes(query);

    return matchesJob && matchesSearch;
  });

  return (
    <div>
      {/* Title & Action Bar */}
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
            Shortlisted Talent Pool
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            High-potential candidates approved for technical interviews and evaluation.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/rankings")}
        >
          <Sparkles size={16} />
          <span>Shortlist More Candidates</span>
        </button>
      </div>

      {/* Filter Toolbar */}
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
            placeholder="Search shortlisted candidates or positions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ minWidth: "200px" }}>
          <select
            className="form-control"
            value={selectedJobFilter}
            onChange={(e) => setSelectedJobFilter(e.target.value)}
          >
            <option value="">All Job Positions</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.title}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedJobFilter) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedJobFilter("");
            }}
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error state */}
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

      {/* Shortlisted Candidates Grid / Table */}
      <Card
        title={`Shortlisted Candidates (${filteredShortlisted.length})`}
        subtitle="Candidates currently in Shortlisted, Interview, or Selected stages"
        padding={false}
      >
        {loading ? (
          <div style={{ padding: "24px" }}>
            <Skeleton height="35px" style={{ marginBottom: "12px" }} />
            <Skeleton height="35px" style={{ marginBottom: "12px" }} />
            <Skeleton height="35px" />
          </div>
        ) : filteredShortlisted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <UserCheck size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              No Shortlisted Candidates Yet
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
              {selectedJobFilter || searchQuery
                ? "No candidates match your current filter."
                : "Evaluate candidate match scores and shortlist qualified candidates to advance them through the hiring process."}
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/rankings")}>
              <Sparkles size={15} />
              <span>Go to AI Candidate Matching</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Target Job Opening</th>
                  <th>Match Score</th>
                  <th>Current Pipeline Stage</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShortlisted.map((item) => (
                  <tr key={item.application_id}>
                    <td>
                      <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "14px" }}>
                        {item.candidate_name}
                      </div>
                      <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                        {item.candidate_email}
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, color: "var(--text-main)", fontSize: "13.5px" }}>
                        {item.job_title}
                      </div>
                      <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                        Job #{item.job_id}
                      </span>
                    </td>

                    <td>
                      {item.overall_score ? (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "16px", fontWeight: 800, color: "var(--primary)" }}>
                            {item.overall_score}%
                          </span>
                          <span className="badge badge-green" style={{ fontSize: "10px" }}>
                            {item.recommendation || "Strong Match"}
                          </span>
                        </div>
                      ) : (
                        <span className="badge badge-green">Shortlisted</span>
                      )}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          item.status === "Selected"
                            ? "badge-green"
                            : item.status === "Interview Scheduled"
                            ? "badge-purple"
                            : "badge-blue"
                        }`}
                        style={{ fontSize: "12px", padding: "4px 10px" }}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                        {item.status === "Shortlisted" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAdvanceStatus(item.application_id, "Interview Scheduled")}
                            title="Schedule technical interview"
                          >
                            <Calendar size={13} />
                            <span>Schedule Interview</span>
                          </button>
                        )}

                        {item.status === "Interview Scheduled" && (
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAdvanceStatus(item.application_id, "Selected")}
                            title="Select for job offer"
                          >
                            <CheckCircle size={13} />
                            <span>Select for Offer</span>
                          </button>
                        )}

                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => handlePromptRemove(item)}
                          title="Remove from shortlist"
                        >
                          <UserX size={14} color="var(--danger)" />
                          <span>Remove</span>
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

      {/* Confirmation Modal to remove from shortlist */}
      <ConfirmModal
        isOpen={removeModalOpen}
        title="Remove from Shortlist?"
        message={`Are you sure you want to remove ${selectedCandidateToRemove?.candidate_name} from the shortlist? Their status will be set back to "Under Review".`}
        confirmText="Remove from Shortlist"
        isDanger={false}
        loading={removing}
        onConfirm={handleConfirmRemove}
        onCancel={() => setRemoveModalOpen(false)}
      />
    </div>
  );
}

export default Shortlisted;
