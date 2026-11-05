import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import ResumeScreening from "./pages/ResumeScreening";
import Rankings from "./pages/Rankings";
import Shortlisted from "./pages/Shortlisted";
import Applications from "./pages/Applications";
import RecruiterChatbot from "./pages/RecruiterChatbot";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  if (!loggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  return (
    <Routes>
      {/* Root redirect */}
      <Route
        path="/"
        element={
          loggedIn ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
        }
      />

      {/* Public Auth Routes */}
      <Route
        path="/login"
        element={loggedIn ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/register"
        element={loggedIn ? <Navigate to="/dashboard" replace /> : <Register />}
      />

      {/* Protected SaaS Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <Jobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/candidates"
        element={
          <ProtectedRoute>
            <Candidates />
          </ProtectedRoute>
        }
      />
      <Route
        path="/screening"
        element={
          <ProtectedRoute>
            <ResumeScreening />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rankings"
        element={
          <ProtectedRoute>
            <Rankings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/shortlisted"
        element={
          <ProtectedRoute>
            <Shortlisted />
          </ProtectedRoute>
        }
      />
      <Route
        path="/applications"
        element={
          <ProtectedRoute>
            <Applications />
          </ProtectedRoute>
        }
      />
      <Route
        path="/assistant"
        element={
          <ProtectedRoute>
            <RecruiterChatbot />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      {/* Catch-all fallback */}
      <Route
        path="*"
        element={<Navigate to={loggedIn ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}

export default App;