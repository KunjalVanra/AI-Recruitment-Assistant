import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  PlusCircle,
  Search,
  Filter,
  Sparkles,
  Users,
  Eye,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Clock,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import Skeleton from "../components/Skeleton";
import ConfirmModal from "../components/ConfirmModal";
import { useToast } from "../context/ToastContext";

function Jobs() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSkillFilter, setSelectedSkillFilter] = useState("");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  // Selected job for view/edit/delete/applicants
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplicants, setJobApplicants] = useState([]);
  const [loadingApplicants, setLoadingApplicants] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    required_skills: "",
    experience_requirement: "",
    education_requirement: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/jobs/");
      setJobs(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch jobs:", err);
      setError("Failed to load job listings from server. Please check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  // Open Create Job Modal
  const handleOpenCreate = () => {
    setFormData({
      title: "",
      description: "",
      required_skills: "",
      experience_requirement: "",
      education_requirement: "",
    });
    setShowCreateModal(true);
  };

  // Submit Create Job Form
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast("Job title and description are required.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        required_skills: formData.required_skills.trim() || undefined,
        experience_requirement: formData.experience_requirement.trim() || undefined,
        education_requirement: formData.education_requirement.trim() || undefined,
      };

      const res = await api.post("/jobs/", payload);
      showToast("Job posting created successfully!", "success");
      setShowCreateModal(false);
      fetchJobs();
    } catch (err) {
      console.error("Create job error:", err);
      showToast(err.response?.data?.detail || "Failed to create job posting.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (job) => {
    setSelectedJob(job);
    setFormData({
      title: job.title || "",
      description: job.description || "",
      required_skills: job.required_skills || "",
      experience_requirement: job.experience_requirement || "",
      education_requirement: job.education_requirement || "",
    });
    setShowEditModal(true);
  };

  // Submit Edit Job Form
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      showToast("Job title and description are required.", "warning");
      return;
    }

    try {
      setSubmitting(true);
      await api.put(`/jobs/${selectedJob.id}`, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        required_skills: formData.required_skills.trim(),
        experience_requirement: formData.experience_requirement.trim(),
        education_requirement: formData.education_requirement.trim(),
      });

      showToast("Job updated successfully!", "success");
      setShowEditModal(false);
      fetchJobs();
    } catch (err) {
      console.error("Edit job error:", err);
      showToast(err.response?.data?.detail || "Failed to update job.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Open Details Modal
  const handleOpenDetails = (job) => {
    setSelectedJob(job);
    setShowDetailsModal(true);
  };

  // Open Applicants Modal
  const handleOpenApplicants = async (job) => {
    setSelectedJob(job);
    setShowApplicantsModal(true);
    setLoadingApplicants(true);
    try {
      const res = await api.get(`/jobs/${job.id}/applications`);
      if (res.data && Array.isArray(res.data.applications)) {
        setJobApplicants(res.data.applications);
      } else {
        setJobApplicants([]);
      }
    } catch (err) {
      console.error("Fetch job applications error:", err);
      // Fallback: fetch all applications and filter by job_id
      try {
        const allApps = await api.get("/applications");
        const filtered = allApps.data.filter((a) => a.job_id === job.id);
        setJobApplicants(filtered);
      } catch (e) {
        setJobApplicants([]);
      }
    } finally {
      setLoadingApplicants(false);
    }
  };

  // Prompt Delete
  const handlePromptDelete = (job) => {
    setSelectedJob(job);
    setDeleteConfirmOpen(true);
  };

  // Confirm Delete Job
  const handleConfirmDelete = async () => {
    if (!selectedJob) return;
    try {
      setDeleting(true);
      await api.delete(`/jobs/${selectedJob.id}`);
      showToast("Job and associated records deleted safely.", "success");
      setDeleteConfirmOpen(false);
      fetchJobs();
    } catch (err) {
      console.error("Delete job error:", err);
      showToast(err.response?.data?.detail || "Failed to delete job.", "error");
    } finally {
      setDeleting(false);
    }
  };

  // Extract all unique skills for filter dropdown
  const allUniqueSkills = Array.from(
    new Set(
      jobs.flatMap((j) =>
        (j.required_skills || "")
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      )
    )
  ).sort();

  // Filtered jobs list
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      (job.title || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.description || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.required_skills || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesSkill = selectedSkillFilter
      ? (job.required_skills || "").toLowerCase().includes(selectedSkillFilter.toLowerCase())
      : true;

    return matchesSearch && matchesSkill;
  });

  return (
    <div>
      {/* Page Title & Action Bar */}
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
            Job Openings Management
          </h2>
          <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
            Post requirements, view applicants, and rank candidates against real job descriptions.
          </p>
        </div>

        <button className="btn btn-primary" onClick={handleOpenCreate}>
          <PlusCircle size={16} />
          <span>Post New Job Opening</span>
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
            placeholder="Search by job title, requirements, or keyword..."
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
            <option value="">All Required Skills</option>
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

      {/* Jobs Grid View */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "24px" }}>
          <div className="card card-padding"><Skeleton height="24px" width="70%" /><Skeleton height="80px" style={{ margin: "14px 0" }} /><Skeleton height="30px" width="50%" /></div>
          <div className="card card-padding"><Skeleton height="24px" width="70%" /><Skeleton height="80px" style={{ margin: "14px 0" }} /><Skeleton height="30px" width="50%" /></div>
          <div className="card card-padding"><Skeleton height="24px" width="70%" /><Skeleton height="80px" style={{ margin: "14px 0" }} /><Skeleton height="30px" width="50%" /></div>
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="card card-padding" style={{ textAlign: "center", padding: "50px 20px" }}>
          <Briefcase size={40} color="#94a3b8" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--text-main)", marginBottom: "6px" }}>
            No Job Postings Found
          </h3>
          <p style={{ fontSize: "14px", color: "var(--text-muted)", marginBottom: "20px" }}>
            {searchQuery || selectedSkillFilter
              ? "No job openings match your current search criteria."
              : "No active openings in the system. Post your first job opening to start matching candidates."}
          </p>
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <PlusCircle size={15} />
            <span>Create New Job</span>
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(370px, 1fr))",
            gap: "24px",
          }}
        >
          {filteredJobs.map((job) => {
            const skillsList = (job.required_skills || "")
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);

            return (
              <div
                key={job.id}
                className="card card-hoverable"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "24px",
                  borderRadius: "var(--radius-lg)",
                }}
              >
                <div>
                  {/* Card Header: Title & ID badge */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "12px" }}>
                    <div>
                      <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
                        {job.title}
                      </h3>
                      <span className="badge badge-gray" style={{ fontSize: "11px" }}>
                        Job #{job.id}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <button
                        className="btn-icon"
                        title="View Details"
                        onClick={() => handleOpenDetails(job)}
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Edit Job"
                        onClick={() => handleOpenEdit(job)}
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="btn-icon"
                        title="Delete Job"
                        onClick={() => handlePromptDelete(job)}
                        style={{ color: "var(--danger)" }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Description Excerpt */}
                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "var(--text-muted)",
                      lineHeight: "1.5",
                      marginBottom: "16px",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {job.description}
                  </p>

                  {/* Required Skills Badges */}
                  <div style={{ marginBottom: "16px" }}>
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: "var(--text-light)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "8px" }}>
                      Required Skills
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {skillsList.slice(0, 5).map((skill, idx) => (
                        <span key={idx} className="badge badge-blue">
                          {skill}
                        </span>
                      ))}
                      {skillsList.length > 5 && (
                        <span className="badge badge-gray" title={skillsList.slice(5).join(", ")}>
                          +{skillsList.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Requirements details */}
                  <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "8px", fontSize: "12.5px", marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <Clock size={13} color="var(--text-muted)" />
                      <span style={{ color: "var(--text-muted)" }}>Exp:</span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {job.experience_requirement || "Not specified"}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <GraduationCap size={13} color="var(--text-muted)" />
                      <span style={{ color: "var(--text-muted)" }}>Edu:</span>
                      <span style={{ fontWeight: 600, color: "var(--text-main)" }}>
                        {job.education_requirement || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: "flex", gap: "10px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => handleOpenApplicants(job)}
                  >
                    <Users size={14} />
                    <span>View Applicants</span>
                  </button>

                  <button
                    className="btn btn-primary btn-sm"
                    style={{ flex: 1 }}
                    onClick={() => navigate(`/rankings?job_id=${job.id}`)}
                  >
                    <Sparkles size={14} />
                    <span>Rank Candidates</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ============================================================
          CREATE JOB MODAL
      ============================================================ */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Post New Job Opening</h3>
              <button className="btn-icon" onClick={() => setShowCreateModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label" htmlFor="job-title">
                    Job Title <span className="required">*</span>
                  </label>
                  <input
                    id="job-title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Senior Full Stack Engineer"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="job-desc">
                    Job Description <span className="required">*</span>
                  </label>
                  <textarea
                    id="job-desc"
                    className="form-control"
                    rows={5}
                    placeholder="Describe role responsibilities, required technical skills, and candidate profile. The Groq AI engine will automatically parse required skills and criteria from this text."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div style={{ padding: "10px 14px", background: "var(--primary-light)", border: "1px solid var(--primary-subtle)", borderRadius: "8px", marginBottom: "16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--primary)", fontWeight: 600 }}>
                    <Sparkles size={14} />
                    <span>AI Automatic Requirement Extraction Enabled</span>
                  </div>
                  <p style={{ fontSize: "11.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                    Leave the fields below blank to let Groq AI automatically extract required skills and qualifications from the description above, or specify them manually.
                  </p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="job-skills">
                    Required Skills (Optional Manual Override)
                  </label>
                  <input
                    id="job-skills"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Python, FastAPI, Docker, PostgreSQL (comma-separated)"
                    value={formData.required_skills}
                    onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="job-exp">
                      Experience Requirement
                    </label>
                    <input
                      id="job-exp"
                      type="text"
                      className="form-control"
                      placeholder="e.g. 2+ years"
                      value={formData.experience_requirement}
                      onChange={(e) => setFormData({ ...formData, experience_requirement: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="job-edu">
                      Education Requirement
                    </label>
                    <input
                      id="job-edu"
                      type="text"
                      className="form-control"
                      placeholder="e.g. Bachelor's in CS"
                      value={formData.education_requirement}
                      onChange={(e) => setFormData({ ...formData, education_requirement: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowCreateModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? "Analyzing & Posting..." : "Publish Job Opening"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          EDIT JOB MODAL
      ============================================================ */}
      {showEditModal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Edit Job #{selectedJob?.id}</h3>
              <button className="btn-icon" onClick={() => setShowEditModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Job Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Job Description</label>
                  <textarea
                    className="form-control"
                    rows={5}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Required Skills (Comma-separated)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.required_skills}
                    onChange={(e) => setFormData({ ...formData, required_skills: e.target.value })}
                  />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                  <div className="form-group">
                    <label className="form-label">Experience Requirement</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.experience_requirement}
                      onChange={(e) => setFormData({ ...formData, experience_requirement: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Education Requirement</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.education_requirement}
                      onChange={(e) => setFormData({ ...formData, education_requirement: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={submitting}
                >
                  {submitting ? "Saving Changes..." : "Save Job Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================
          VIEW JOB DETAILS MODAL
      ============================================================ */}
      {showDetailsModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content" style={{ maxWidth: "650px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge-blue" style={{ marginBottom: "6px" }}>
                  Job Opening #{selectedJob.id}
                </span>
                <h3 style={{ fontSize: "20px", fontWeight: 800 }}>{selectedJob.title}</h3>
              </div>
              <button className="btn-icon" onClick={() => setShowDetailsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--primary)" }}>
                Role Description
              </h4>
              <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--text-main)", whiteSpace: "pre-line", marginBottom: "20px" }}>
                {selectedJob.description}
              </p>

              <h4 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "8px", color: "var(--primary)" }}>
                Required Skills
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "20px" }}>
                {(selectedJob.required_skills || "")
                  .split(",")
                  .map((s, idx) => (
                    <span key={idx} className="badge badge-purple" style={{ fontSize: "12px", padding: "4px 10px" }}>
                      {s.trim()}
                    </span>
                  ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", padding: "14px", background: "var(--bg-subtle)", borderRadius: "8px" }}>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Experience Target</div>
                  <div style={{ fontWeight: 600, fontSize: "13.5px", marginTop: "2px" }}>
                    {selectedJob.experience_requirement || "Not specified"}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>Education Requirement</div>
                  <div style={{ fontWeight: 600, fontSize: "13.5px", marginTop: "2px" }}>
                    {selectedJob.education_requirement || "Not specified"}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleOpenApplicants(selectedJob)}
              >
                <Users size={14} />
                <span>View Applicants</span>
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowDetailsModal(false);
                  navigate(`/rankings?job_id=${selectedJob.id}`);
                }}
              >
                <Sparkles size={14} />
                <span>Match Candidates</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          VIEW APPLICANTS MODAL
      ============================================================ */}
      {showApplicantsModal && selectedJob && (
        <div className="modal-overlay" onClick={() => setShowApplicantsModal(false)}>
          <div className="modal-content" style={{ maxWidth: "700px" }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700 }}>
                  Applicants for: {selectedJob.title}
                </h3>
                <p style={{ fontSize: "12.5px", color: "var(--text-muted)", margin: "2px 0 0" }}>
                  {jobApplicants.length} registered candidate application{jobApplicants.length !== 1 ? "s" : ""}
                </p>
              </div>
              <button className="btn-icon" onClick={() => setShowApplicantsModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body" style={{ padding: 0 }}>
              {loadingApplicants ? (
                <div style={{ padding: "24px" }}>
                  <Skeleton height="35px" style={{ marginBottom: "10px" }} />
                  <Skeleton height="35px" style={{ marginBottom: "10px" }} />
                  <Skeleton height="35px" />
                </div>
              ) : jobApplicants.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-muted)" }}>
                  <Users size={32} color="#94a3b8" style={{ margin: "0 auto 8px" }} />
                  <p style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-main)" }}>No applicants yet</p>
                  <p style={{ fontSize: "12.5px", marginTop: "4px" }}>
                    Candidates have not applied to this role yet. You can evaluate and rank candidates from the AI Candidate Ranking page.
                  </p>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ marginTop: "14px" }}
                    onClick={() => {
                      setShowApplicantsModal(false);
                      navigate(`/rankings?job_id=${selectedJob.id}`);
                    }}
                  >
                    <Sparkles size={14} />
                    <span>Evaluate & Match Database Candidates</span>
                  </button>
                </div>
              ) : (
                <table className="saas-table">
                  <thead>
                    <tr>
                      <th>Candidate</th>
                      <th>Email</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {jobApplicants.map((app) => (
                      <tr key={app.application_id || app.candidate_id}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{app.candidate_name || app.name}</div>
                          <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>
                            App #{app.application_id || app.id}
                          </div>
                        </td>
                        <td style={{ fontSize: "13px", color: "var(--text-muted)" }}>
                          {app.candidate_email || app.email || "—"}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              app.status === "Shortlisted"
                                ? "badge-green"
                                : app.status === "Rejected"
                                ? "badge-red"
                                : app.status === "Interview Scheduled"
                                ? "badge-purple"
                                : "badge-blue"
                            }`}
                          >
                            {app.status || "Applied"}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setShowApplicantsModal(false);
                              navigate(`/candidates?name=${encodeURIComponent(app.candidate_name || "")}`);
                            }}
                          >
                            <span>View Profile</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            <div className="modal-footer">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowApplicantsModal(false)}
              >
                Close
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => {
                  setShowApplicantsModal(false);
                  navigate(`/applications?job_id=${selectedJob.id}`);
                }}
              >
                <span>Manage in Pipeline</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Deleting Job */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Delete Job Opening?"
        message={`Are you sure you want to delete "${selectedJob?.title}"? This will safely remove the job posting and its associated application rankings.`}
        confirmText="Delete Job"
        isDanger={true}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}

export default Jobs;