import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Layers,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Eye,
  Info,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import Button from "../components/Button";
import { useToast } from "../context/ToastContext";

function ResumeScreening() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");

  const [screenResult, setScreenResult] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  // Drag handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file) => {
    // Validate file type
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("Please upload a valid PDF document (.pdf)", "warning");
      return;
    }

    // Validate size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("File size exceeds 10MB limit. Please upload a smaller PDF.", "warning");
      return;
    }

    setSelectedFile(file);
    setScreenResult(null);
    setIsDuplicate(false);
  };

  const handleUploadAndAnalyze = async () => {
    if (!selectedFile) {
      showToast("Please select a PDF resume first.", "warning");
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(20);
      setProcessingStep("Uploading PDF to server...");

      const formData = new FormData();
      formData.append("file", selectedFile);

      setUploadProgress(50);
      setProcessingStep("Extracting text and analyzing resume with Groq AI...");

      const res = await api.post("/ai/upload_resume", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setUploadProgress(100);
      setProcessingStep("Analysis complete!");

      const data = res.data;

      if (data.message && data.message.includes("already exists")) {
        setIsDuplicate(true);
        showToast("Candidate already exists in database. Profile retrieved.", "info");
      } else {
        setIsDuplicate(false);
        showToast("Resume parsed and candidate saved to database successfully!", "success");
      }

      setScreenResult(data);
    } catch (err) {
      console.error("Resume upload error:", err);
      const errorMsg =
        err.response?.data?.message ||
        err.response?.data?.detail ||
        "Failed to upload and screen resume. Please check API connection.";
      showToast(errorMsg, "error");
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setScreenResult(null);
    setIsDuplicate(false);
    setUploadProgress(0);
    setProcessingStep("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Helper for education rendering
  const parseJsonSafe = (raw) => {
    if (!raw) return [];
    if (typeof raw === "object") return Array.isArray(raw) ? raw : [raw];
    try {
      return JSON.parse(raw);
    } catch (e) {
      return [];
    }
  };

  const resumeAnalysis = screenResult?.resume_analysis || {};
  const extractedSkills = Array.isArray(resumeAnalysis.Skills)
    ? resumeAnalysis.Skills
    : (screenResult?.skills || "").split(",").map((s) => s.trim()).filter(Boolean);

  const educationList = parseJsonSafe(resumeAnalysis.Education);
  const experienceList = parseJsonSafe(resumeAnalysis.Experience);

  return (
    <div>
      {/* Top Header */}
      <div style={{ marginBottom: "26px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 800, color: "var(--text-main)", marginBottom: "4px" }}>
          AI Resume Screening & Extraction
        </h2>
        <p style={{ fontSize: "14px", color: "var(--text-muted)" }}>
          Upload PDF resumes to automatically extract candidate skills, experience, education, and match criteria using Groq AI.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: screenResult ? "1fr 1.3fr" : "1fr", gap: "28px" }}>
        {/* Left Column: Drag & Drop Upload Card */}
        <Card
          title="Upload Candidate Resume"
          subtitle="Supports PDF documents up to 10MB"
        >
          {/* Dropzone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${dragActive ? "var(--primary)" : "var(--border-strong)"}`,
              borderRadius: "14px",
              padding: "40px 20px",
              textAlign: "center",
              background: dragActive ? "var(--primary-light)" : "var(--bg-subtle)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "20px",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              style={{ display: "none" }}
              onChange={handleFileInputChange}
            />

            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 14px",
                boxShadow: "var(--shadow-sm)",
                color: "var(--primary)",
              }}
            >
              <UploadCloud size={28} />
            </div>

            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-main)", marginBottom: "4px" }}>
              Drag & Drop your resume PDF here
            </div>
            <p style={{ fontSize: "13px", color: "var(--text-muted)" }}>
              or <span style={{ color: "var(--primary)", textDecoration: "underline" }}>browse files from computer</span>
            </p>
          </div>

          {/* Selected File Details & Progress */}
          {selectedFile && (
            <div
              style={{
                padding: "14px 18px",
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <FileText size={22} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: "13.5px", fontWeight: 600, color: "var(--text-main)" }}>
                      {selectedFile.name}
                    </div>
                    <div style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • PDF Document
                    </div>
                  </div>
                </div>

                {!uploading && (
                  <button
                    className="btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReset();
                    }}
                    title="Remove file"
                  >
                    <RefreshCw size={15} />
                  </button>
                )}
              </div>

              {/* Progress bar during upload/extraction */}
              {uploading && (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                    <span style={{ color: "var(--primary)", fontWeight: 600 }}>{processingStep}</span>
                    <span style={{ fontWeight: 700 }}>{uploadProgress}%</span>
                  </div>
                  <div style={{ width: "100%", height: "6px", background: "var(--bg-subtle)", borderRadius: "3px", overflow: "hidden" }}>
                    <div
                      style={{
                        width: `${uploadProgress}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #2563eb, #3b82f6)",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px" }}>
            <button
              className="btn btn-primary"
              style={{ flex: 1, padding: "12px" }}
              onClick={handleUploadAndAnalyze}
              disabled={!selectedFile || uploading}
            >
              <Sparkles size={16} />
              <span>{uploading ? "Analyzing with Groq AI..." : "Start AI Resume Screening"}</span>
            </button>

            {selectedFile && (
              <button
                className="btn btn-secondary"
                onClick={handleReset}
                disabled={uploading}
              >
                Reset
              </button>
            )}
          </div>
        </Card>

        {/* Right Column: AI Extracted Candidate Details Preview */}
        {screenResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {/* Status Banner */}
            <div
              style={{
                padding: "16px 20px",
                borderRadius: "var(--radius-lg)",
                background: isDuplicate ? "var(--warning-light)" : "var(--success-light)",
                border: `1px solid ${isDuplicate ? "var(--warning-border)" : "var(--success-border)"}`,
                color: isDuplicate ? "var(--warning-text)" : "var(--success-text)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "14px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {isDuplicate ? <Info size={22} /> : <CheckCircle2 size={22} />}
                <div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>
                    {isDuplicate
                      ? "Candidate Already Exists in Database"
                      : "Candidate Successfully Extracted & Saved to Database"}
                  </div>
                  <div style={{ fontSize: "12px", opacity: 0.9 }}>
                    Candidate ID #{screenResult.candidate_id} • Registered under{" "}
                    <strong>{screenResult.candidate_name || resumeAnalysis.Name || "Applicant"}</strong>
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary btn-sm"
                onClick={() => navigate(`/candidates?name=${encodeURIComponent(screenResult.candidate_name || "")}`)}
              >
                <span>View In Database</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Extracted Details Card */}
            <Card title="AI-Extracted Information" subtitle="Structured data generated by Groq LLM">
              {/* Candidate Info Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "20px" }}>
                <div style={infoBox}>
                  <User size={16} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Full Name</div>
                    <div style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-main)" }}>
                      {resumeAnalysis.Name || screenResult.candidate_name || "Not detected"}
                    </div>
                  </div>
                </div>

                <div style={infoBox}>
                  <Mail size={16} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Email</div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)", wordBreak: "break-all" }}>
                      {resumeAnalysis.Email || "Not detected"}
                    </div>
                  </div>
                </div>

                <div style={infoBox}>
                  <Phone size={16} color="var(--primary)" />
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Phone</div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-main)" }}>
                      {resumeAnalysis.Phone || "Not detected"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Badges */}
              <div style={{ marginBottom: "22px" }}>
                <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Layers size={15} color="var(--primary)" />
                  <span>Extracted Skills ({extractedSkills.length})</span>
                </h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {extractedSkills.map((skill, idx) => (
                    <span key={idx} className="badge badge-blue">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Experience History */}
              {experienceList.length > 0 && (
                <div style={{ marginBottom: "22px" }}>
                  <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Briefcase size={15} color="var(--primary)" />
                    <span>Experience History</span>
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {experienceList.map((exp, idx) => (
                      <div key={idx} style={{ padding: "12px", background: "var(--bg-subtle)", borderRadius: "8px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontWeight: 700, fontSize: "13.5px" }}>{exp.Role || exp.role || "Role"}</span>
                          <span style={{ fontSize: "11.5px", color: "var(--text-muted)" }}>
                            {exp.Duration || exp.duration || exp.Years || ""}
                          </span>
                        </div>
                        <div style={{ fontSize: "12.5px", color: "var(--text-muted)", marginTop: "2px" }}>
                          {exp.Company || exp.company}
                        </div>
                        {exp.Description && (
                          <div style={{ fontSize: "12px", color: "var(--text-main)", marginTop: "6px" }}>
                            {exp.Description}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Education Breakdown */}
              {educationList.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "13.5px", fontWeight: 700, marginBottom: "10px", display: "flex", alignItems: "center", gap: "6px" }}>
                    <GraduationCap size={15} color="var(--primary)" />
                    <span>Education</span>
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {educationList.map((edu, idx) => (
                      <div key={idx} style={{ padding: "10px 12px", background: "var(--bg-subtle)", borderRadius: "8px", fontSize: "13px" }}>
                        <div style={{ fontWeight: 600 }}>{edu.Degree || edu.degree || "Degree"}</div>
                        <div style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                          {edu.Institution || edu.institution || edu.College || ""}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ marginTop: "24px", display: "flex", gap: "12px", borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleReset}
                >
                  Screen Another Resume
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => navigate(`/rankings`)}
                >
                  <Sparkles size={14} />
                  <span>Match Against Active Jobs</span>
                </button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

const infoBox = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "10px 12px",
  background: "var(--bg-subtle)",
  borderRadius: "8px",
};

export default ResumeScreening;
