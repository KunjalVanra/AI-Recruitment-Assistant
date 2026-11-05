import React, { useState, useEffect, useRef } from "react";
import {
  Bot,
  Send,
  Sparkles,
  User,
  Briefcase,
  Users,
  RefreshCw,
  HelpCircle,
  Copy,
  Check,
  MessageSquare,
  ChevronDown,
  Layers,
} from "lucide-react";
import api from "../services/api";
import Card from "../components/Card";
import { useToast } from "../context/ToastContext";

function RecruiterChatbot() {
  const { showToast } = useToast();
  const chatEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am **TalentAI**, your intelligent recruitment assistant.\n\nI have real-time access to your candidate database, active job openings, and AI match rankings. How can I assist your hiring pipeline today?",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Context filters
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState("");
  const [selectedCandidateId, setSelectedCandidateId] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  // Suggested Prompts
  const suggestedPrompts = [
    "Which candidates are best suited for our Python Backend Developer role?",
    "Summarize Kunjal Vanra's resume, technical skills, and experience.",
    "Compare the top candidates for our active job postings.",
    "Generate 5 technical interview questions for a FastAPI & SQL role.",
    "Which candidates in our database have React and frontend experience?",
    "Recommend improvements to our job requirements.",
  ];

  useEffect(() => {
    fetchContextData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchContextData = async () => {
    try {
      const [jobsRes, candsRes] = await Promise.allSettled([
        api.get("/jobs/"),
        api.get("/candidates/"),
      ]);

      if (jobsRes.status === "fulfilled" && Array.isArray(jobsRes.value.data)) {
        setJobs(jobsRes.value.data);
      }
      if (candsRes.status === "fulfilled" && Array.isArray(candsRes.value.data)) {
        setCandidates(candsRes.value.data);
      }
    } catch (e) {
      console.error("Context fetch error:", e);
    }
  };

  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputMessage).trim();
    if (!query || loading) return;

    const userMsgId = Date.now().toString();
    const newMsg = {
      id: userMsgId,
      role: "user",
      content: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputMessage("");
    setLoading(true);

    try {
      // Build conversation history for context
      const historyPayload = messages
        .filter((m) => m.id !== "welcome")
        .slice(-6)
        .map((m) => ({ role: m.role, content: m.content }));

      const payload = {
        message: query,
        job_id: selectedJobId ? parseInt(selectedJobId, 10) : undefined,
        candidate_id: selectedCandidateId ? parseInt(selectedCandidateId, 10) : undefined,
        history: historyPayload,
      };

      const res = await api.post("/ai/chat", payload);

      const botReply = res.data?.reply || "I couldn't process that response. Please try rephrasing.";

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("Chatbot request error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            "I encountered an issue connecting to the AI assistant service. Please verify backend connectivity.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, id) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    showToast("Response copied to clipboard!", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Chat session cleared. How can I assist with your recruitment pipeline?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 128px)" }}>
      {/* Top Bar: Title & Focus Selectors */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "16px",
        }}
      >
        <div>
          <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--text-main)", marginBottom: "3px" }}>
            AI Recruiter Copilot
          </h2>
          <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>
            Conversational assistant powered by Groq LLM and live MySQL recruitment records.
          </p>
        </div>

        {/* Database Context Focus Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Focused Job */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Briefcase size={15} color="#2563eb" />
            <select
              className="form-control"
              style={{ fontSize: "12.5px", padding: "6px 10px", minWidth: "180px", maxWidth: "220px" }}
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
            >
              <option value="">Focus Job (All Jobs)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} (#{j.id})
                </option>
              ))}
            </select>
          </div>

          {/* Focused Candidate */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <Users size={15} color="#059669" />
            <select
              className="form-control"
              style={{ fontSize: "12.5px", padding: "6px 10px", minWidth: "180px", maxWidth: "220px" }}
              value={selectedCandidateId}
              onChange={(e) => setSelectedCandidateId(e.target.value)}
            >
              <option value="">Focus Candidate (All)</option>
              {candidates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} (#{c.id})
                </option>
              ))}
            </select>
          </div>

          <button
            className="btn btn-secondary btn-sm"
            onClick={handleClearChat}
            title="Clear conversation"
          >
            <RefreshCw size={13} />
            <span>Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Main Chat Container */}
      <div
        className="card"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          border: "1px solid var(--border)",
        }}
      >
        {/* Messages Stream */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            background: "#ffffff",
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "12px",
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: isUser ? "75%" : "85%",
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      flexShrink: 0,
                      boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
                    }}
                  >
                    <Sparkles size={17} />
                  </div>
                )}

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: isUser ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                      background: isUser ? "var(--primary)" : "#f8fafc",
                      color: isUser ? "#ffffff" : "var(--text-main)",
                      border: isUser ? "none" : "1px solid var(--border)",
                      fontSize: "14px",
                      lineHeight: "1.6",
                      whiteSpace: "pre-wrap",
                      boxShadow: isUser ? "var(--shadow-sm)" : "none",
                      position: "relative",
                    }}
                  >
                    {msg.content}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      fontSize: "11px",
                      color: "#94a3b8",
                      marginTop: "4px",
                      padding: "0 4px",
                    }}
                  >
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.content, msg.id)}
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "#94a3b8",
                          display: "flex",
                          alignItems: "center",
                          padding: "2px",
                        }}
                        title="Copy answer"
                      >
                        {copiedId === msg.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
                      </button>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div
                    style={{
                      width: "34px",
                      height: "34px",
                      borderRadius: "50%",
                      background: "#e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#475569",
                      flexShrink: 0,
                    }}
                  >
                    <User size={17} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", gap: "12px", alignSelf: "flex-start", alignItems: "center" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#ffffff",
                  flexShrink: 0,
                }}
              >
                <Sparkles size={17} />
              </div>
              <div
                style={{
                  padding: "12px 18px",
                  borderRadius: "14px 14px 14px 2px",
                  background: "#f8fafc",
                  border: "1px solid var(--border)",
                  fontSize: "13px",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    background: "var(--primary)",
                    display: "inline-block",
                    animation: "skeletonPulse 1s infinite",
                  }}
                />
                <span>Analyzing candidate records with Groq AI...</span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Suggested Quick Prompt Pills */}
        <div
          style={{
            padding: "10px 20px",
            background: "#f8fafc",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            overflowX: "auto",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-light)", textTransform: "uppercase" }}>
            Suggested:
          </span>
          {suggestedPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={loading}
              style={{
                fontSize: "12px",
                padding: "4px 10px",
                background: "#ffffff",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                color: "var(--text-muted)",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.color = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.color = "var(--text-muted)";
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Message Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          style={{
            padding: "16px 20px",
            background: "#ffffff",
            borderTop: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <input
            type="text"
            className="form-control"
            placeholder={
              selectedJobId
                ? `Ask about candidates for selected job...`
                : "Ask any question about candidate suitability, skills, or interview advice..."
            }
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={loading}
          />

          <button
            type="submit"
            className="btn btn-primary"
            style={{ padding: "10px 18px", flexShrink: 0 }}
            disabled={!inputMessage.trim() || loading}
          >
            <Send size={15} />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default RecruiterChatbot;
