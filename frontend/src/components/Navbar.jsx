import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Menu,
  Bell,
  Search,
  ChevronRight,
  User,
  Settings,
  LogOut,
  Sparkles,
  FileSearch,
} from "lucide-react";

function Navbar({ onToggleSidebar, recruiter, onLogout }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotificationMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const pageTitles = {
    "/dashboard": "Dashboard",
    "/jobs": "Job Openings",
    "/screening": "AI Resume Screening",
    "/candidates": "Candidate Database",
    "/rankings": "AI Matching & Rankings",
    "/shortlisted": "Shortlisted Candidates",
    "/applications": "Application Pipeline",
    "/assistant": "AI Recruiter Assistant",
    "/analytics": "Recruitment Analytics",
    "/settings": "Recruiter Settings",
  };

  const getPageTitle = () => {
    return pageTitles[location.pathname] || "Recruitment Management";
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/candidates?name=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header style={topHeaderStyle}>
      {/* Left side: Hamburger & Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
        <button
          onClick={onToggleSidebar}
          style={menuToggleBtn}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 500 }}>
            TalentAI
          </span>
          <ChevronRight size={14} color="#94a3b8" />
          <h1 style={pageHeading}>{getPageTitle()}</h1>
        </div>
      </div>

      {/* Right side: Search, Action, Notifications, Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Quick Search */}
        <form onSubmit={handleSearchSubmit} style={searchBarContainer}>
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Search candidates or jobs..."
            style={searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Quick Action */}
        <button
          className="btn btn-primary btn-sm"
          onClick={() => navigate("/screening")}
          style={{ display: "flex", alignItems: "center", gap: "6px" }}
        >
          <FileSearch size={14} />
          <span>Screen Resume</span>
        </button>

        {/* Notifications Dropdown */}
        <div style={{ position: "relative" }} ref={notifRef}>
          <button
            className="btn-icon"
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            style={{ position: "relative" }}
            aria-label="Notifications"
          >
            <Bell size={19} color="#475569" />
            <span style={notificationDot} />
          </button>

          {showNotificationMenu && (
            <div style={dropdownMenu}>
              <div style={dropdownHeader}>
                <span style={{ fontWeight: 700, fontSize: "13.5px" }}>System Notifications</span>
                <span className="badge badge-blue">Live</span>
              </div>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)", fontSize: "13px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "2px" }}>
                  AI Engine Ready
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  Groq LLM resume parser and scoring model active.
                </div>
              </div>
              <div style={{ padding: "12px 16px", fontSize: "13px" }}>
                <div style={{ fontWeight: 600, color: "var(--text-main)", marginBottom: "2px" }}>
                  Database Online
                </div>
                <div style={{ color: "var(--text-muted)", fontSize: "12px" }}>
                  Connected to Railway MySQL repository.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Recruiter Profile Menu */}
        <div style={{ position: "relative" }} ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            style={profileBtn}
            aria-label="User profile menu"
          >
            <div style={avatarStyle}>
              {recruiter?.name ? recruiter.name.charAt(0).toUpperCase() : "R"}
            </div>
            <div style={profileInfo}>
              <span style={profileNameText}>
                {recruiter?.name || "Recruiter"}
              </span>
              <span style={profileRoleText}>Lead Recruiter</span>
            </div>
          </button>

          {showProfileMenu && (
            <div style={{ ...dropdownMenu, right: 0, width: "220px" }}>
              <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                <div style={{ fontWeight: 700, fontSize: "13.5px", color: "var(--text-main)" }}>
                  {recruiter?.name || "Recruiter"}
                </div>
                <div style={{ fontSize: "11.5px", color: "var(--text-muted)", wordBreak: "break-all" }}>
                  {recruiter?.email || "recruiter@company.com"}
                </div>
              </div>
              <div style={{ padding: "6px" }}>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}
                  style={dropdownItem}
                >
                  <Settings size={15} />
                  <span>Account Settings</span>
                </button>
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  style={{ ...dropdownItem, color: "var(--danger)" }}
                >
                  <LogOut size={15} />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const topHeaderStyle = {
  height: "70px",
  background: "#ffffff",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 28px",
  position: "sticky",
  top: 0,
  zIndex: 800,
};

const menuToggleBtn = {
  display: "none",
  background: "transparent",
  border: "1px solid #e2e8f0",
  borderRadius: "6px",
  padding: "6px",
  cursor: "pointer",
  color: "#475569",
};

const pageHeading = {
  fontSize: "17px",
  fontWeight: 700,
  color: "#0f172a",
  margin: 0,
};

const searchBarContainer = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "6px 12px",
  width: "260px",
};

const searchInput = {
  border: "none",
  outline: "none",
  background: "transparent",
  fontSize: "13px",
  fontFamily: "inherit",
  color: "#0f172a",
  width: "100%",
};

const notificationDot = {
  position: "absolute",
  top: "7px",
  right: "7px",
  width: "7px",
  height: "7px",
  borderRadius: "50%",
  background: "#ef4444",
};

const profileBtn = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "transparent",
  border: "none",
  cursor: "pointer",
  padding: "4px 8px",
  borderRadius: "8px",
  transition: "background 0.15s ease",
};

const avatarStyle = {
  width: "34px",
  height: "34px",
  borderRadius: "50%",
  background: "#2563eb",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "13px",
};

const profileInfo = {
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  lineHeight: 1.2,
};

const profileNameText = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#0f172a",
};

const profileRoleText = {
  fontSize: "11px",
  color: "#64748b",
};

const dropdownMenu = {
  position: "absolute",
  top: "calc(100% + 8px)",
  right: 0,
  width: "280px",
  background: "#ffffff",
  borderRadius: "12px",
  border: "1px solid #e2e8f0",
  boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
  zIndex: 1000,
  animation: "fadeIn 0.15s ease",
};

const dropdownHeader = {
  padding: "12px 16px",
  borderBottom: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};

const dropdownItem = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "9px 12px",
  background: "transparent",
  border: "none",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: 500,
  color: "#334155",
  cursor: "pointer",
  textAlign: "left",
  transition: "background 0.15s ease",
};

export default Navbar;