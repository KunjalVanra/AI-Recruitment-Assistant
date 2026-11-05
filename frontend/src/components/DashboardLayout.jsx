import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recruiter, setRecruiter] = useState(null);
  const location = useLocation();

  useEffect(() => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsed = JSON.parse(userData);
        if (parsed.recruiter) {
          setRecruiter(parsed.recruiter);
        }
      }
    } catch (e) {
      console.error("Failed to parse recruiter details", e);
    }
  }, []);

  // Close sidebar on mobile navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div style={layoutWrapper}>
      {/* Reusable Left Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        recruiter={recruiter}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div style={contentWrapper}>
        {/* Reusable Top Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          recruiter={recruiter}
          onLogout={handleLogout}
        />

        {/* Viewport content */}
        <main style={mainContentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}

const layoutWrapper = {
  display: "flex",
  minHeight: "100vh",
  background: "#f8fafc",
  position: "relative",
};

const contentWrapper = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minWidth: 0,
  minHeight: "100vh",
};

const mainContentArea = {
  flex: 1,
  padding: "28px",
  background: "#f8fafc",
};

export default DashboardLayout;
