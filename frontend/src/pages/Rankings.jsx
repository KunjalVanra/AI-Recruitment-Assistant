import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Sparkles,
  Award,
  Briefcase,
  Users,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Filter,
  CheckSquare,
  Square,
  Layers,
  GraduationCap,
  Clock,
  UserCheck,
  ChevronRight,
  X,
  AlertCircle,
  Scale,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import { useToast } from "../context/ToastContext";

function Rankings() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);

  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Shortlisting state
  const [shortlistingCandidateId, setShortlistingCandidateId] = useState(null);
  const [shortlistedSet, setShortlistedSet] = useState(new Set());

  // Comparison state
  const [selectedForComparison, setSelectedForComparison] = useState([]);
  const [showComparisonModal, setShowComparisonModal] = useState(false);

  // Explanation Modal
  const [explanationCandidate, setExplanationCandidate] = useState(null);
  const [showExplanationModal, setShowExplanationModal] = useState(false);

  // Load jobs list & check URL param
  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await api.get("/jobs/");
      const jobList = Array.isArray(res.data) ? res.data : [];
      setJobs(jobList);

      const params = new URLSearchParams(location.search);
      const urlJobId = params.get("job_id");

      if (urlJobId && jobList.some((j) => String(j.id) === String(urlJobId))) {
        setSelectedJobId(urlJobId);
      } else if (jobList.length > 0) {
        setSelectedJobId(String(jobList[0].id));
      }
    } catch (err) {
      console.error("Failed to load jobs:", err);
      setError("Unable to load jobs for candidate ranking.");
    }
  };

  // Whenever selectedJobId changes, load rankings
  useEffect(() => {
    if (selectedJobId) {
      const current = jobs.find((j) => String(j.id) === String(selectedJobId));
      setSelectedJob(current || null);
      fetchJobRankings(selectedJobId);
      fetchExistingShortlists(selectedJobId);
      setSelectedForComparison([]);
    }
  }, [selectedJobId, jobs]);

  const fetchJobRankings = async (jobId) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/jobs/${jobId}/rankings`);

      if (res.data && Array.isArray(res.data.rankings)) {
        setRankings(res.data.rankings);
      } else if (Array.isArray(res.data)) {
        setRankings(res.data);
      } else {
        setRankings([]);
      }
    } catch (err) {
      console.error("Fetch rankings error:", err);
      // Fallback: fetch default rankings
      try {
        const fallback = await api.get("/ai/rankings");
        setRankings(Array.isArray(fallback.data) ? fallback.data : []);
      } catch (e) {
        setRankings([]);
        setError("Failed to calculate AI candidate rankings.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingShortlists = async (jobId) => {
    try {
      const res = await api.get(`/jobs/${jobId}/applications`);
      const apps = res.data?.applications || (Array.isArray(res.data) ? res.data : []);
      const shortlistedIds = new Set();
      apps.forEach((a) => {
        if (a.status === "Shortlisted") {
          shortlistedIds.add(a.candidate_id);
        }
      });
      setShortlistedSet(shortlistedIds);
    } catch (e) {
      // Ignore
    }
  };

  // Shortlist Candidate Handler
  const handleShortlist = async (candidate) => {
    try {
      setShortlistingCandidateId(candidate.candidate_id);

      // Create or update application to Shortlisted
      const res = await api.post(`/applications?candidate_id=${candidate.candidate_id}&job_id=${selectedJobId}`);

      const appId = res.data?.application_id;
      if (appId) {
        await api.put(`/applications/${appId}?status=Shortlisted`);
      }

      setShortlistedSet((prev) => new Set(prev).add(candidate.candidate_id));
      showToast(`${candidate.name} has been shortlisted for ${selectedJob?.title || "this job"}!`, "success");
    } catch (err) {
      console.error("Shortlist error:", err);
      // Check if application exists
      try {
        const allApps = await api.get("/applications");
        const existing = allApps.data.find(
          (a) => a.candidate_id === candidate.candidate_id && String(a.job_id) === String(selectedJobId)
        );
        if (existing) {
          await api.put(`/applications/${existing.application_id}?status=Shortlisted`);
          setShortlistedSet((prev) => new Set(prev).add(candidate.candidate_id));
          showToast(`${candidate.name} is now marked as Shortlisted!`, "success");
        } else {
          showToast("Failed to shortlist candidate.", "error");
        }
      } catch (e) {
        showToast("Error updating candidate shortlist status.", "error");
      }
    } finally {
      setShortlistingCandidateId(null);
    }
  };

  // Toggle comparison selection
  const handleToggleComparison = (candidate) => {
    const isSelected = selectedForComparison.some((c) => c.candidate_id === candidate.candidate_id);
    if (isSelected) {
      setSelectedForComparison(selectedForComparison.filter((c) => c.candidate_id !== candidate.candidate_id));
    } else {
      if (selectedForComparison.length >= 3) {
        showToast("You can compare up to 3 candidates at a time.", "info");
        return;
      }
      setSelectedForComparison([...selectedForComparison, candidate]);
    }
  };

  // Open Explanation Modal
  const handleOpenExplanation = (candidate) => {
    setExplanationCandidate(candidate);
    setShowExplanationModal(true);
  };

  const getRecommendationBadge = (recommendation) => {
    switch (recommendation) {
      case "Strong Candidate":
        return <span className="badge badge-green">Strong Candidate</span>;
      case "Good Candidate":
        return <span className="badge badge-blue">Good Candidate</span>;
      case "Average Candidate":
        return <span className="badge badge-amber">Average Candidate</span>;
      default:
        return <span className="badge badge-red">Not Recommended</span>;
    }
  };

  return (
    <div>
      {/* Title & Job Selector Bar */}
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
            AI Candidate Matching & Ranking
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Evaluate candidate profiles against job requirements using 60% skills, 25% experience, and 15% education weighting.
          </p>
        </div>

        {/* Job Selector Dropdown */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "280px" }}>
          <Briefcase size={18} color="var(--primary)" />
          <select
            className="form-control"
            style={{ fontWeight: 600, fontSize: "14px" }}
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
          >
            {jobs.map((job) => (
              <option key={job.id} value={job.id}>
                {job.title} (#{job.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected Job Requirements Summary Card */}
      {selectedJob && (
        <div
          className="card"
          style={{
            padding: "20px 24px",
            marginBottom: "24px",
            background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "12px" }}>
            <div>
              <span className="badge badge-blue" style={{ marginBottom: "6px" }}>
                Target Position
              </span>
              <h3 style={{ fontSize: "18px", fontWeight: 800, color: "var(--text-main)" }}>
                {selectedJob.title}
              </h3>
            </div>

            {selectedForComparison.length > 0 && (
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowComparisonModal(true)}
              >
                <Scale size={15} />
                <span>Compare Selected ({selectedForComparison.length})</span>
              </button>
            )}
          </div>

          <div style={{ fontSize: "13px", color: "var(--text-muted)", marginBottom: "14px", lineHeight: "1.5" }}>
            {selectedJob.description}
          </div>

          {/* Target Skills & Requirements */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
              Target Skills:
            </span>
            {(selectedJob.required_skills || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((skill, idx) => (
                <span key={idx} className="badge badge-purple" style={{ fontSize: "12px" }}>
                  {skill}
                </span>
              ))}
          </div>
        </div>
      )}

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

      {/* Rankings List */}
      <Card
        title={`Ranked Candidates (${rankings.length})`}
        subtitle="Sorted by highest overall AI match score"
        padding={false}
      >
        {loading ? (
          <div style={{ padding: "24px" }}>
            <Skeleton height="50px" style={{ marginBottom: "14px" }} />
            <Skeleton height="50px" style={{ marginBottom: "14px" }} />
            <Skeleton height="50px" style={{ marginBottom: "14px" }} />
            <Skeleton height="50px" />
          </div>
        ) : rankings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <Award size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              No Candidates Ranked Yet
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
              Ensure candidates and resumes are uploaded in the talent database.
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/screening")}>
              Screen Resumes Now
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th style={{ width: "40px" }}>Compare</th>
                  <th style={{ width: "60px" }}>Rank</th>
                  <th>Candidate</th>
                  <th>Overall Match</th>
                  <th>Sub-Score Breakdown</th>
                  <th>Matched vs Missing Skills</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rankings.map((c, index) => {
                  const isChecked = selectedForComparison.some((item) => item.candidate_id === c.candidate_id);
                  const isShortlisted = shortlistedSet.has(c.candidate_id);
                  const overallScore = parseFloat(c.overall_score || 0);

                  const matched = c.matched_skills || [];
                  const missing = c.missing_skills || [];

                  return (
                    <tr
                      key={c.candidate_id || index}
                      style={{
                        background: isChecked ? "var(--primary-light)" : "transparent",
                      }}
                    >
                      {/* Comparison Checkbox */}
                      <td>
                        <button
                          type="button"
                          className="btn-icon"
                          onClick={() => handleToggleComparison(c)}
                          title="Select to compare side-by-side"
                        >
                          {isChecked ? (
                            <CheckSquare size={18} color="var(--primary)" />
                          ) : (
                            <Square size={18} color="#94a3b8" />
                          )}
                        </button>
                      </td>

                      {/* Rank Position */}
                      <td style={{ fontSize: "18px", fontWeight: 800 }}>
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `#${index + 1}`}
                      </td>

                      {/* Candidate Name & Recommendation */}
                      <td>
                        <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                          {c.name || c.candidate_name}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)", marginBottom: "4px" }}>
                          {c.email || `ID #${c.candidate_id}`}
                        </div>
                        {getRecommendationBadge(c.recommendation)}
                      </td>

                      {/* Overall Match Score */}
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              fontSize: "20px",
                              fontWeight: 800,
                              color:
                                overallScore >= 85
                                  ? "#10b981"
                                  : overallScore >= 70
                                  ? "#2563eb"
                                  : overallScore >= 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          >
                            {overallScore}%
                          </span>
                        </div>
                        <div style={{ width: "90px", height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden", marginTop: "4px" }}>
                          <div
                            style={{
                              width: `${overallScore}%`,
                              height: "100%",
                              background:
                                overallScore >= 85
                                  ? "#10b981"
                                  : overallScore >= 70
                                  ? "#2563eb"
                                  : overallScore >= 50
                                  ? "#f59e0b"
                                  : "#ef4444",
                            }}
                          />
                        </div>
                      </td>

                      {/* Sub-Score Breakdown (Skills 60%, Exp 25%, Edu 15%) */}
                      <td style={{ fontSize: "12px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Skills (60%): </span>
                            <span style={{ fontWeight: 700 }}>{c.skills_match ?? "—"}%</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Experience (25%): </span>
                            <span style={{ fontWeight: 700 }}>{c.experience_score ?? "—"} pts</span>
                          </div>
                          <div>
                            <span style={{ color: "var(--text-muted)" }}>Education (15%): </span>
                            <span style={{ fontWeight: 700 }}>{c.education_score ?? "—"} pts</span>
                          </div>
                        </div>
                      </td>

                      {/* Matched & Missing Skills */}
                      <td>
                        <div style={{ display: "flex", flexDirection: "column", gap: "4px", maxWidth: "260px" }}>
                          {matched.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {matched.slice(0, 3).map((m, idx) => (
                                <span key={idx} className="badge badge-green" style={{ fontSize: "11px" }}>
                                  ✓ {m}
                                </span>
                              ))}
                              {matched.length > 3 && (
                                <span className="badge badge-green" style={{ fontSize: "11px" }}>
                                  +{matched.length - 3}
                                </span>
                              )}
                            </div>
                          )}

                          {missing.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                              {missing.slice(0, 3).map((m, idx) => (
                                <span key={idx} className="badge badge-red" style={{ fontSize: "11px" }}>
                                  ✕ {m}
                                </span>
                              ))}
                              {missing.length > 3 && (
                                <span className="badge badge-red" style={{ fontSize: "11px" }}>
                                  +{missing.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button
                            className="btn btn-secondary btn-sm"
                            title="AI Match Analysis & Explanation"
                            onClick={() => handleOpenExplanation(c)}
                          >
                            <HelpCircle size={14} />
                            <span>Why Match?</span>
                          </button>

                          <button
                            className={`btn btn-sm ${isShortlisted ? "btn-secondary" : "btn-primary"}`}
                            disabled={isShortlisted || shortlistingCandidateId === c.candidate_id}
                            onClick={() => handleShortlist(c)}
                          >
                            <UserCheck size={14} />
                            <span>{isShortlisted ? "Shortlisted" : "Shortlist"}</span>
                          </button>
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

      {/* ============================================================
          AI MATCH EXPLANATION MODAL
      ============================================================ */}
      {showExplanationModal && explanationCandidate && (
        <div className="modal-overlay" onClick={() => setShowExplanationModal(false)}>
          <div className="modal-content" style={{ maxWidth: "600px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--primary)" }}>
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800 }}>AI Match Score Analysis</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                    {explanationCandidate.name} • {selectedJob?.title}
                  </p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowExplanationModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {/* Overall Score Highlight */}
              <div style={{ padding: "16px", background: "var(--bg-subtle)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Computed Overall Score</div>
                  <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--primary)" }}>
                    {explanationCandidate.overall_score}%
                  </div>
                </div>
                <div>{getRecommendationBadge(explanationCandidate.recommendation)}</div>
              </div>

              {/* Formula & Explanation */}
              <div style={{ marginBottom: "20px", fontSize: "13.5px", lineHeight: "1.6", color: "var(--text-main)" }}>
                <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "6px" }}>Evaluation Rationale</h4>
                <p>
                  This candidate scored <strong>{explanationCandidate.overall_score}%</strong> using the deterministic multi-factor recruitment model:
                </p>
                <ul style={{ paddingLeft: "20px", marginTop: "8px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  <li>
                    <strong>Skills Match (60% Weight):</strong> Scored {explanationCandidate.skills_match}%.
                    Matched skills include: <em>{(explanationCandidate.matched_skills || []).join(", ") || "None"}</em>.
                    Missing skills: <em>{(explanationCandidate.missing_skills || []).join(", ") || "None"}</em>.
                  </li>
                  <li>
                    <strong>Experience (25% Weight):</strong> Scored {explanationCandidate.experience_score} points based on {explanationCandidate.experience_years || 0} years of relevant experience.
                  </li>
                  <li>
                    <strong>Education (15% Weight):</strong> Scored {explanationCandidate.education_score} points for degree qualification.
                  </li>
                </ul>
              </div>

              {/* Matched and Missing Breakdown */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div style={{ padding: "12px", background: "var(--success-light)", border: "1px solid var(--success-border)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--success-text)", marginBottom: "6px" }}>
                    ✓ Matched Job Skills ({(explanationCandidate.matched_skills || []).length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {(explanationCandidate.matched_skills || []).map((s, idx) => (
                      <span key={idx} className="badge badge-green" style={{ fontSize: "11px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ padding: "12px", background: "var(--danger-light)", border: "1px solid var(--danger-border)", borderRadius: "8px" }}>
                  <div style={{ fontSize: "12.5px", fontWeight: 700, color: "var(--danger-text)", marginBottom: "6px" }}>
                    ✕ Missing Skills ({(explanationCandidate.missing_skills || []).length})
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                    {(explanationCandidate.missing_skills || []).map((s, idx) => (
                      <span key={idx} className="badge badge-red" style={{ fontSize: "11px" }}>
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowExplanationModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  handleShortlist(explanationCandidate);
                  setShowExplanationModal(false);
                }}
              >
                <UserCheck size={14} />
                <span>Shortlist Candidate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SIDE-BY-SIDE COMPARISON MODAL
      ============================================================ */}
      {showComparisonModal && selectedForComparison.length > 0 && (
        <div className="modal-overlay" onClick={() => setShowComparisonModal(false)}>
          <div className="modal-content" style={{ maxWidth: "860px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 800 }}>Side-by-Side Candidate Comparison</h3>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  Comparing against: <strong>{selectedJob?.title}</strong>
                </p>
              </div>
              <button className="btn-icon" onClick={() => setShowComparisonModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ overflowX: "auto" }}>
              <table className="saas-table">
                <thead>
                  <tr>
                    <th style={{ width: "160px" }}>Metric</th>
                    {selectedForComparison.map((cand) => (
                      <th key={cand.candidate_id}>
                        <div style={{ fontWeight: 800, fontSize: "14px", color: "var(--text-main)" }}>
                          {cand.name}
                        </div>
                        <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                          {cand.email}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Overall Score</td>
                    {selectedForComparison.map((cand) => (
                      <td key={cand.candidate_id}>
                        <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--primary)" }}>
                          {cand.overall_score}%
                        </span>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Recommendation</td>
                    {selectedForComparison.map((cand) => (
                      <td key={cand.candidate_id}>
                        {getRecommendationBadge(cand.recommendation)}
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Skills Match %</td>
                    {selectedForComparison.map((cand) => (
                      <td key={cand.candidate_id} style={{ fontWeight: 600 }}>
                        {cand.skills_match}%
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Experience Score</td>
                    {selectedForComparison.map((cand) => (
                      <td key={cand.candidate_id}>
                        {cand.experience_score} pts ({cand.experience_years || 0} yrs)
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Education Score</td>
                    {selectedForComparison.map((cand) => (
                      <td key={cand.candidate_id}>
                        {cand.education_score} pts
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Matched Skills</td>
                    {selectedForComparison.map((cand) => (
                      <td key={cand.candidate_id}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {(cand.matched_skills || []).map((m, idx) => (
                            <span key={idx} className="badge badge-green" style={{ fontSize: "10.5px" }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Missing Skills</td>
                    {selectedForComparison.map((cand) => (
                      <td key={cand.candidate_id}>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {(cand.missing_skills || []).map((m, idx) => (
                            <span key={idx} className="badge badge-red" style={{ fontSize: "10.5px" }}>
                              {m}
                            </span>
                          ))}
                        </div>
                      </td>
                    ))}
                  </tr>

                  <tr>
                    <td style={{ fontWeight: 600 }}>Shortlist Action</td>
                    {selectedForComparison.map((cand) => (
                      <td key={cand.candidate_id}>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={shortlistedSet.has(cand.candidate_id)}
                          onClick={() => handleShortlist(cand)}
                        >
                          <UserCheck size={14} />
                          <span>{shortlistedSet.has(cand.candidate_id) ? "Shortlisted" : "Shortlist"}</span>
                        </button>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowComparisonModal(false)}
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Rankings;