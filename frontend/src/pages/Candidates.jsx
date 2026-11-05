import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  FileText,
  Sparkles,
  ExternalLink,
  Briefcase,
  GraduationCap,
  X,
  PlusCircle,
  AlertCircle,
  FileSearch,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Skeleton from "../components/Skeleton";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";

function Candidates() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("");

  // Modals
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Selected candidate
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidateProfileData, setCandidateProfileData] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);

  // Edit form state
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phone: "",
    skills: "",
    education: "",
    experience: "",
  });
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Check URL query params for initial search filter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const nameParam = params.get("name");
    if (nameParam) {
      setSearchQuery(nameParam);
    }
    fetchCandidates();
  }, [location.search]);

  const fetchCandidates = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/candidates/");
      setCandidates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch candidates:", err);
      setError("Failed to load candidates from database. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Open Candidate Profile Modal
  const handleOpenProfile = async (cand) => {
    setSelectedCandidate(cand);
    setShowProfileModal(true);
    setLoadingProfile(true);

    try {
      const res = await api.get(`/candidates/${cand.id}`);
      setCandidateProfileData(res.data);
    } catch (err) {
      console.error("Fetch candidate profile error:", err);
      setCandidateProfileData(cand); // Fallback to list object
    } finally {
      setLoadingProfile(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (cand) => {
    setSelectedCandidate(cand);
    setEditFormData({
      name: cand.name || "",
      email: cand.email || "",
      phone: cand.phone || "",
      skills: cand.skills || "",
      education: cand.education || "",
      experience: cand.experience || "",
    });
    setShowEditModal(true);
  };

  // Submit Candidate Edit Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmittingEdit(true);
      await api.put(`/candidates/${selectedCandidate.id}`, editFormData);
      showToast("Candidate information updated successfully!", "success");
      setShowEditModal(false);
      fetchCandidates();
    } catch (err) {
      console.error("Edit candidate error:", err);
      showToast(err.response?.data?.detail || "Failed to update candidate.", "error");
    } finally {
      setSubmittingEdit(false);
    }
  };

  // Prompt Delete
  const handlePromptDelete = (cand) => {
    setSelectedCandidate(cand);
    setDeleteConfirmOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!selectedCandidate) return;
    try {
      setDeleting(true);
      await api.delete(`/candidates/${selectedCandidate.id}`);
      showToast(`Candidate "${selectedCandidate.name}" deleted successfully.`, "success");
      setDeleteConfirmOpen(false);
      fetchCandidates();
    } catch (err) {
      console.error("Delete candidate error:", err);
      showToast(err.response?.data?.detail || "Failed to delete candidate.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Helper safe parser for JSON fields
  const parseJsonSafe = (raw) => {
    if (!raw) return [];
    if (typeof raw === "object") return Array.isArray(raw) ? raw : [raw];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  };

  // Unique skills for filtering
  const allUniqueSkills = Array.from(
    new Set(
      candidates.flatMap((c) =>
        (c.skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    )
  ).sort();

  // Filtered candidate list
  const filteredCandidates = candidates.filter((c) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      (c.name || "").toLowerCase().includes(query) ||
      (c.email || "").toLowerCase().includes(query) ||
      (c.skills || "").toLowerCase().includes(query) ||
      (c.experience || "").toLowerCase().includes(query);

    const matchesSkill = selectedSkillFilter
      ? (c.skills || "").toLowerCase().includes(selectedSkillFilter.toLowerCase())
      : true;

    return matchesSearch && matchesSkill;
  });

  return (
    <div>
      {/* Title & Actions Bar */}
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
            Candidate Talent Directory
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Browse and manage all registered candidates parsed from PDF resumes.
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/screening")}
        >
          <FileSearch size={16} />
          <span>Screen New Resume</span>
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      <div
        className="card"
        style={{
          padding: "16px 20px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: 1, minWidth: "240px", display: "flex", alignItems: "center", position: "relative" }}>
          <Search size={16} color="#94a3b8" style={{ position: "absolute", left: "12px" }} />
          <input
            type="text"
            className="form-control"
            style={{ paddingLeft: "36px" }}
            placeholder="Search candidates by name, email, skills, or experience..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "200px" }}>
          <Filter size={16} color="#64748b" />
          <select
            className="form-control"
            value={selectedSkillFilter}
            onChange={(e) => setSelectedSkillFilter(e.target.value)}
          >
            <option value="">Filter by Skill</option>
            {allUniqueSkills.map((skill) => (
              <option key={skill} value={skill}>
                {skill}
              </option>
            ))}
          </select>
        </div>

        {(searchQuery || selectedSkillFilter) && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              setSearchQuery("");
              setSelectedSkillFilter("");
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

      {/* Candidates Table Card */}
      <Card padding={false}>
        {loading ? (
          <div style={{ padding: "24px" }}>
            <Skeleton height="35px" style={{ marginBottom: "12px" }} />
            <Skeleton height="35px" style={{ marginBottom: "12px" }} />
            <Skeleton height="35px" style={{ marginBottom: "12px" }} />
            <Skeleton height="35px" />
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div style={{ textAlign: "center", padding: "50px 20px" }}>
            <Users size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
              No Candidates Found
            </h3>
            <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
              {searchQuery || selectedSkillFilter
                ? "No candidates match your active search filters."
                : "No candidate records registered in database yet. Upload resumes to populate candidate data."}
            </p>
            <button className="btn btn-primary" onClick={() => navigate("/screening")}>
              <FileSearch size={15} />
              <span>Screen Candidate Resume</span>
            </button>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table className="saas-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Candidate</th>
                  <th>Contact Info</th>
                  <th>Extracted Skills</th>
                  <th>Applications</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCandidates.map((c) => {
                  const skills = (c.skills || "")
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);

                  return (
                    <tr key={c.id}>
                      <td style={{ fontWeight: 600, color: "var(--text-muted)" }}>
                        #{c.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, color: "var(--text-main)", fontSize: "14px" }}>
                          {c.name}
                        </div>
                        {c.resume_file && (
                          <span style={{ fontSize: "11px", color: "var(--primary)", display: "flex", alignItems: "center", gap: "3px" }}>
                            <FileText size={11} /> {c.resume_file}
                          </span>
                        )}
                      </td>
                      <td>
                        <div style={{ fontSize: "13px", color: "var(--text-main)" }}>
                          {c.email}
                        </div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {c.phone || "—"}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", maxWidth: "340px" }}>
                          {skills.slice(0, 4).map((s, idx) => (
                            <span key={idx} className="badge badge-blue" style={{ fontSize: "11px" }}>
                              {s}
                            </span>
                          ))}
                          {skills.length > 4 && (
                            <span className="badge badge-gray" title={skills.slice(4).join(", ")} style={{ fontSize: "11px" }}>
                              +{skills.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className="badge badge-green">
                          {c.applications_count || 0} applied
                        </span>
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                          <button
                            className="btn-icon"
                            title="View Candidate Profile"
                            onClick={() => handleOpenProfile(c)}
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            title="Edit Candidate"
                            onClick={() => handleOpenEdit(c)}
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className="btn-icon"
                            title="Delete Candidate"
                            onClick={() => handlePromptDelete(c)}
                            style={{ color: "var(--danger)" }}
                          >
                            <Trash2 size={16} />
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
          CANDIDATE PROFILE VIEW MODAL
      ============================================================ */}
      {showProfileModal && selectedCandidate && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" style={{ maxWidth: "720px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: "18px",
                  }}
                >
                  {selectedCandidate.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 800 }}>{selectedCandidate.name}</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-muted)", margin: 0 }}>
                    Candidate ID #{selectedCandidate.id}
                  </p>
                </div>
              </div>
              <button className="btn-icon" onClick={() => setShowProfileModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              {loadingProfile ? (
                <div>
                  <Skeleton height="35px" style={{ marginBottom: "12px" }} />
                  <Skeleton height="80px" style={{ marginBottom: "12px" }} />
                  <Skeleton height="80px" />
                </div>
              ) : (
                <>
                  {/* Contact Details */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "20px" }}>
                    <div style={{ padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: "8px", fontSize: "13px" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "11.5px" }}>Email Address</span>
                      <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "2px", wordBreak: "break-all" }}>
                        {selectedCandidate.email}
                      </div>
                    </div>
                    <div style={{ padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: "8px", fontSize: "13px" }}>
                      <span style={{ color: "var(--text-muted)", fontSize: "11.5px" }}>Phone Number</span>
                      <div style={{ fontWeight: 600, color: "var(--text-main)", marginTop: "2px" }}>
                        {selectedCandidate.phone || "Not provided"}
                      </div>
                    </div>
                  </div>

                  {/* Skills Section */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "8px", color: "var(--primary)" }}>
                      Skills & Technologies
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {(selectedCandidate.skills || "")
                        .split(",")
                        .map((s, idx) => (
                          <span key={idx} className="badge badge-blue">
                            {s.trim()}
                          </span>
                        ))}
                    </div>
                  </div>

                  {/* Experience Section */}
                  <div style={{ marginBottom: "20px" }}>
                    <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "8px", color: "var(--primary)" }}>
                      Work & Project Experience
                    </h4>
                    {parseJsonSafe(candidateProfileData?.experience || selectedCandidate.experience).length > 0 ? (
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {parseJsonSafe(candidateProfileData?.experience || selectedCandidate.experience).map((exp, idx) => (
                          <div key={idx} style={{ padding: "10px 14px", background: "var(--bg-subtle)", borderRadius: "8px", fontSize: "13px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600 }}>
                              <span>{exp.Role || exp.role || "Experience"}</span>
                              <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                                {exp.Duration || exp.duration || exp.Years || ""}
                              </span>
                            </div>
                            <div style={{ color: "var(--text-muted)", fontSize: "12px", marginTop: "2px" }}>
                              {exp.Company || exp.company}
                            </div>
                            {exp.Description && (
                              <div style={{ fontSize: "12px", color: "var(--text-main)", marginTop: "4px" }}>
                                {exp.Description}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                        {selectedCandidate.experience || "No experience details recorded."}
                      </p>
                    )}
                  </div>

                  {/* Applications History */}
                  {candidateProfileData?.applications && candidateProfileData.applications.length > 0 && (
                    <div>
                      <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "8px", color: "var(--primary)" }}>
                        Applications Pipeline ({candidateProfileData.applications.length})
                      </h4>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {candidateProfileData.applications.map((app) => (
                          <div
                            key={app.application_id}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "8px 12px",
                              border: "1px solid var(--border)",
                              borderRadius: "6px",
                              fontSize: "13px",
                            }}
                          >
                            <span style={{ fontWeight: 600 }}>{app.job_title}</span>
                            <span className="badge badge-green">{app.status}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowProfileModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowProfileModal(false);
                  navigate(`/rankings`);
                }}
              >
                <Sparkles size={14} />
                <span>Match Candidate</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          EDIT CANDIDATE MODAL
      ============================================================ */}
      {showEditModal && selectedCandidate && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Edit Candidate #{selectedCandidate.id}</h3>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <input
                    type="email"
                    className="form-control"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Skills (Comma-separated)</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={editFormData.skills}
                    onChange={(e) => setEditFormData({ ...editFormData, skills: e.target.value })}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowEditModal(false)}
                  disabled={submittingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submittingEdit}
                >
                  {submittingEdit ? "Saving..." : "Save Candidate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Candidate Record?"
        message={`Are you sure you want to permanently delete "${selectedCandidate?.name}"? All associated rankings and job applications will be safely removed.`}
        confirmText="Delete Candidate"
        isDanger={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}

export default Candidates;