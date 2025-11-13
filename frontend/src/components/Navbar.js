import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css"; // Fichier CSS séparé

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      setUserEmail(user.email || "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`navbar-modern ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        <Link className="nav-logo" to="/dashvisiteur" onClick={closeMenu}>
          <span className="logo-text">CEDII</span>
          <div className="logo-dot"></div>
        </Link>

        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <div className="nav-links">
            <Link className="nav-link" to="/pubvisiteur" onClick={closeMenu}>Publication</Link>
            <Link className="nav-link" to="/eventvisiteur" onClick={closeMenu}>Événement</Link>
            <Link className="nav-link" to="/appeloffrevisiteur" onClick={closeMenu}>Appel d'offre</Link>
            <Link className="nav-link" to="/messagevisiteur" onClick={closeMenu}>Message</Link>
            <Link className="nav-link" to="/profilvisiteur" onClick={closeMenu}>Profil</Link>
          </div>

          <div className="nav-auth">
            {localStorage.getItem("token") ? (
              <>
                <span className="user-email">{userEmail}</span>
                <button className="logout-btn" onClick={handleLogout}>
                  <span>Déconnexion</span>
                </button>
              </>
            ) : (
              <div className="auth-buttons">
                <Link className="signup-btn" to="/signup" onClick={closeMenu}>Inscription</Link>
                <Link className="login-btn" to="/login" onClick={closeMenu}>Connexion</Link>
              </div>
            )}
          </div>
        </div>

        <button className={`nav-toggle ${isMenuOpen ? "active" : ""}`} onClick={toggleMenu} aria-label="Toggle navigation">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;