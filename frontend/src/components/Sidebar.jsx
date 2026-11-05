import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Briefcase,
  FileSearch,
  Users,
  Sparkles,
  UserCheck,
  ClipboardList,
  Bot,
  BarChart3,
  Settings,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";

function Sidebar({ isOpen, onClose, recruiter, onLogout }) {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { name: "Jobs", path: "/jobs", icon: Briefcase },
    { name: "Resume Screening", path: "/screening", icon: FileSearch, badge: "AI" },
    { name: "Candidates", path: "/candidates", icon: Users },
    { name: "AI Matching & Rankings", path: "/rankings", icon: Sparkles },
    { name: "Shortlisted Candidates", path: "/shortlisted", icon: UserCheck },
    { name: "Applications", path: "/applications", icon: ClipboardList },
    { name: "AI Assistant", path: "/assistant", icon: Bot, badge: "New" },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={backdropStyle}
          aria-hidden="true"
        />
      )}

      <aside
        style={{
          ...sidebarStyle,
          transform: isOpen ? "translateX(0)" : "none",
        }}
        className={isOpen ? "sidebar-mobile-open" : ""}
      >
        {/* Brand Header */}
        <div style={brandHeader}>
          <div style={logoIcon}>
            <Sparkles size={20} color="#ffffff" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={brandTitle}>TalentAI</h2>
            <p style={brandSubtitle}>Recruitment SaaS</p>
          </div>
          <button
            onClick={onClose}
            style={closeMobileBtn}
            className="mobile-only-btn"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Recruiter Profile Snippet */}
        <div style={profileCard}>
          <div style={avatarCircle}>
            {recruiter?.name ? recruiter.name.charAt(0).toUpperCase() : "R"}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={profileName} title={recruiter?.name || "Senior Recruiter"}>
              {recruiter?.name || "Senior Recruiter"}
            </div>
            <div style={profileEmail} title={recruiter?.email || "recruiter@company.com"}>
              {recruiter?.email || "recruiter@company.com"}
            </div>
          </div>
          <span style={verifiedBadge} title="Authenticated Recruiter">
            <ShieldCheck size={14} color="#10b981" />
          </span>
        </div>

        {/* Navigation List */}
        <nav style={navContainer}>
          <div style={navSectionLabel}>NAVIGATION</div>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path} style={{ marginBottom: "3px" }}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    style={{
                      ...navLinkStyle,
                      background: isActive ? "#eff6ff" : "transparent",
                      color: isActive ? "#2563eb" : "#475569",
                      fontWeight: isActive ? 600 : 500,
                      borderLeft: isActive ? "3px solid #2563eb" : "3px solid transparent",
                    }}
                  >
                    <Icon
                      size={18}
                      color={isActive ? "#2563eb" : "#64748b"}
                      style={{ flexShrink: 0 }}
                    />
                    <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "10px",
                          background: item.badge === "AI" ? "#eff6ff" : "#ecfdf5",
                          color: item.badge === "AI" ? "#2563eb" : "#059669",
                          border: `1px solid ${item.badge === "AI" ? "#bfdbfe" : "#a7f3d0"}`
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / Logout */}
        <div style={sidebarFooter}>
          <button onClick={onLogout} style={logoutBtn}>
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.45)",
  backdropFilter: "blur(2px)",
  zIndex: 900,
};

const sidebarStyle = {
  width: "260px",
  background: "#ffffff",
  borderRight: "1px solid #e2e8f0",
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  position: "sticky",
  top: 0,
  zIndex: 950,
  flexShrink: 0,
  transition: "transform 0.25s ease-in-out",
};

const brandHeader = {
  height: "70px",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "0 20px",
  borderBottom: "1px solid #f1f5f9",
};

const logoIcon = {
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 4px 10px rgba(37, 99, 235, 0.3)",
};

const brandTitle = {
  fontSize: "17px",
  fontWeight: 800,
  color: "#0f172a",
  letterSpacing: "-0.02em",
  lineHeight: 1.2,
};

const brandSubtitle = {
  fontSize: "11px",
  color: "#64748b",
  fontWeight: 500,
};

const closeMobileBtn = {
  background: "transparent",
  border: "none",
  cursor: "pointer",
  color: "#64748b",
  padding: "4px",
  display: "none",
};

const profileCard = {
  margin: "14px 16px",
  padding: "10px 12px",
  background: "#f8fafc",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const avatarCircle = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  background: "#2563eb",
  color: "#ffffff",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 700,
  fontSize: "13px",
  flexShrink: 0,
};

const profileName = {
  fontSize: "13px",
  fontWeight: 600,
  color: "#0f172a",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const profileEmail = {
  fontSize: "11px",
  color: "#64748b",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
};

const verifiedBadge = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const navContainer = {
  flex: 1,
  overflowY: "auto",
  padding: "10px 12px",
};

const navSectionLabel = {
  fontSize: "10.5px",
  fontWeight: 700,
  letterSpacing: "0.08em",
  color: "#94a3b8",
  padding: "8px 12px 6px",
};

const navLinkStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  padding: "9px 12px",
  borderRadius: "8px",
  fontSize: "13.5px",
  textDecoration: "none",
  transition: "all 0.15s ease",
};

const sidebarFooter = {
  padding: "14px 16px",
  borderTop: "1px solid #f1f5f9",
};

const logoutBtn = {
  width: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  padding: "9px 14px",
  background: "#fef2f2",
  color: "#ef4444",
  border: "1px solid #fee2e2",
  borderRadius: "8px",
  fontSize: "13.5px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s ease",
};

export default Sidebar;
