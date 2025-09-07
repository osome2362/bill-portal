import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Navbar.css"; // CSS below

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-title">Shri Bhavani Cable Network</div>
      <ul className="navbar-links">
        <li onClick={() => navigate("/")}>Home</li>
        <li onClick={() => navigate("/all-customers")}>All Customers</li>
        <li onClick={() => navigate("/reports")}>Reports</li>
        <li onClick={handleLogout}>Logout</li>
      </ul>
    </nav>
  );
};

export default Navbar;
