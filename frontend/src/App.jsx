import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Candidates from "./pages/Candidates";
import Applications from "./pages/Applications";
import Rankings from "./pages/Rankings";

function App() {
  const loggedIn = localStorage.getItem("loggedIn") === "true";

  return (
    <>
      {loggedIn && <Navbar />}

      <Routes>

        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        <Route
          path="/login"
          element={
            loggedIn
              ? <Navigate to="/dashboard" replace />
              : <Login />
          }
        />

        <Route
          path="/register"
          element={
            loggedIn
              ? <Navigate to="/dashboard" replace />
              : <Register />
          }
        />

        <Route
          path="/dashboard"
          element={
            loggedIn
              ? <Dashboard />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/jobs"
          element={
            loggedIn
              ? <Jobs />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/candidates"
          element={
            loggedIn
              ? <Candidates />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/applications"
          element={
            loggedIn
              ? <Applications />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="/rankings"
          element={
            loggedIn
              ? <Rankings />
              : <Navigate to="/login" replace />
          }
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </>
  );
}

export default App;