import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("loggedIn");
    navigate("/login");
  };

  return (
    <nav style={nav}>
      <h2 style={{ color: "white" }}>
        AI Recruitment
      </h2>

      <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
        <Link style={link} to="/dashboard">Dashboard</Link>

        <Link style={link} to="/jobs">Jobs</Link>

        <Link style={link} to="/candidates">Candidates</Link>

        <Link style={link} to="/applications">Applications</Link>

        <Link style={link} to="/rankings">Rankings</Link>

        <button onClick={logout} style={logoutBtn}>
          Logout
        </button>
      </div>
    </nav>
  );
}

const nav = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "20px 40px",
  background: "#1976d2",
};

const link = {
  color: "white",
  textDecoration: "none",
  fontWeight: "bold",
};

const logoutBtn = {
  padding: "8px 16px",
  background: "#f44336",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  fontWeight: "bold",
};

export default Navbar;