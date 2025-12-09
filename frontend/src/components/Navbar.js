// src/components/Navbar.js
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
import { useTranslation } from 'react-i18next'; // Import de useTranslation
import LanguageSwitcherCompact from "./LanguageSwitcher"; // Import du commutateur compact
import "./Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Utiliser le hook de traduction
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
                <span>{t('menu_publication')}</span> {/* Traduction */}
              </Link>
              <Link className="nav-link" to="/eventvisiteur" onClick={closeMenu}>
                <FiCalendar className="nav-icon" />
                <span>{t('menu_event')}</span> {/* Traduction */}
              </Link>
              <Link className="nav-link" to="/appeloffrevisiteur" onClick={closeMenu}>
                <FiBriefcase className="nav-icon" />
                <span>{t('menu_call_for_tender')}</span> {/* Traduction */}
              </Link>
              <Link className="nav-link" to="/messagevisiteur" onClick={closeMenu}>
                <FiMessageSquare className="nav-icon" />
                <span>{t('menu_messages')}</span> {/* Traduction */}
              </Link>
              <Link className="nav-link" to="/profilvisiteur" onClick={closeMenu}>
                <FiUser className="nav-icon" />
                <span>{t('menu_profile')}</span> {/* Traduction */}
              </Link>
            </div>

            <div className="nav-user-section">
              {/* Commutateur de langue */}
              <div className="language-switcher-wrapper">
                <LanguageSwitcherCompact />
              </div>
              
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
                    <span>{t('logout_button')}</span> {/* Traduction */}
                  </button>
                </div>
              ) : (
                <div className="auth-buttons">
                  <Link className="signup-btn" to="/signup" onClick={closeMenu}>
                    {t('signup_button')} {/* Traduction */}
                  </Link>
                  <Link className="login-btn" to="/login" onClick={closeMenu}>
                    {t('login_button')} {/* Traduction */}
                  </Link>
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
            
            <h2 className="modal-title">{t('logout_modal_title')}</h2> {/* Traduction */}
            
            <p className="modal-message">
              {t('logout_modal_message')} {/* Traduction */}
            </p>
            
            <div className="modal-buttons">
              <button 
                className="modal-btn modal-btn-cancel"
                onClick={() => setShowLogoutModal(false)}
              >
                {t('cancel_button')} {/* Traduction */}
              </button>
              <button 
                className="modal-btn modal-btn-confirm"
                onClick={handleLogoutConfirm}
              >
                {t('logout_button')} {/* Traduction */}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;