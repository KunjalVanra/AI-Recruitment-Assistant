import { Link } from "react-router-dom";

function Navbar(){

return(

<nav style={nav}>

<h2 style={{
color:"white"
}}>
AI Recruitment
</h2>

<div>

<Link style={link} to="/">Dashboard</Link>

<Link style={link} to="/jobs">Jobs</Link>

<Link style={link} to="/candidates">Candidates</Link>

<Link style={link} to="/applications">Applications</Link>

<Link style={link} to="/rankings">Rankings</Link>

</div>

</nav>

)

}

const nav={

display:"flex",
justifyContent:"space-between",
alignItems:"center",
padding:"20px 40px",
background:"#1976d2"

}

const link={

marginLeft:"20px",
color:"white",
textDecoration:"none",
fontWeight:"bold"

}

export default Navbar;