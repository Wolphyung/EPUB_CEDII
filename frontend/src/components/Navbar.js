import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiFileText, 
  FiCalendar, 
  FiBriefcase, 
  FiMessageSquare, 
  FiUser,
  FiLogOut,
  FiMail,
  FiX
} from "react-icons/fi";
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Votre palette de couleurs
  const colors = {
    primary: "#5B11EE",    // Violet principal
    primaryDark: "#0405BF", // Violet foncé
    primaryDarker: "#02061E", // Presque noir bleuté
    secondary: "#0671B6",   // Bleu
    neutral: "#5E5E5E",     // Gris
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
  };

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

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
    setIsMenuOpen(false);
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <>
      <nav className={`navbar-modern ${isScrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          <Link className="nav-logo" to="/dashvisiteur" onClick={closeMenu}>
            <span className="logo-text">
              <img src="/images/logo.jpg" alt="Logo" className="logo-img" />
            </span>
         
          </Link>

          <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
            <div className="nav-links">
              <Link className="nav-link" to="/pubvisiteur" onClick={closeMenu}>
                <FiFileText className="nav-icon" />
                <span>Publication</span>
              </Link>
              <Link className="nav-link" to="/eventvisiteur" onClick={closeMenu}>
                <FiCalendar className="nav-icon" />
                <span>Événement</span>
              </Link>
              <Link className="nav-link" to="/appeloffrevisiteur" onClick={closeMenu}>
                <FiBriefcase className="nav-icon" />
                <span>Appel d'offre</span>
              </Link>
              <Link className="nav-link" to="/messagevisiteur" onClick={closeMenu}>
                <FiMessageSquare className="nav-icon" />
                <span>Message</span>
              </Link>
              <Link className="nav-link" to="/profilvisiteur" onClick={closeMenu}>
                <FiUser className="nav-icon" />
                <span>Profil</span>
              </Link>
            </div>

            <div className="nav-user-section">
              {localStorage.getItem("token") ? (
                <div className="user-info">
                  <div className="user-email-container">
                    <FiMail className="email-icon" />
                    <span className="user-email" title={userEmail}>
                      {userEmail.length > 20 ? `${userEmail.substring(0, 20)}...` : userEmail}
                    </span>
                  </div>
                  <button className="logout-btn" onClick={handleLogoutClick}>
                    <FiLogOut className="logout-icon" />
                    <span>Déconnexion</span>
                  </button>
                </div>
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

      {/* Modal de confirmation de déconnexion */}
      {showLogoutModal && (
        <div className="logout-modal-overlay">
          <div className="logout-modal">
            <button 
              className="modal-close-btn" 
              onClick={() => setShowLogoutModal(false)}
            >
              <FiX />
            </button>
            
            <div className="modal-icon">
              <FiLogOut />
            </div>
            
            <h2 className="modal-title">Déconnexion</h2>
            
            <p className="modal-message">
              Êtes-vous sûr de vouloir vous déconnecter de votre compte ?
            </p>
            
            <div className="modal-buttons">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                Annuler
              </button>
              <button 
                className="modal-btn modal-btn-confirm"
                onClick={handleLogoutConfirm}
              >
                Oui, me déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;