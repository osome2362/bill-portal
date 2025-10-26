import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-title" onClick={() => navigate("/")}>
        Shri Bhavani Cable Network
      </div>

      {/* Hamburger Button */}
      <button className="menu-toggle" onClick={toggleMenu}>
        ☰
      </button>

      {/* Navigation Links */}
      <ul className={`navbar-links ${menuOpen ? "active" : ""}`}>
        <li onClick={() => navigate("/")}>Home</li>
        <li onClick={() => navigate("/all-customers")}>All Customers</li>
        <li onClick={() => navigate("/reports")}>Reports</li>
        <li onClick={handleLogout}>Logout</li>
      </ul>
    </nav>
  );
};

export default Navbar;
