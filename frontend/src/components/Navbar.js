import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className={`navbar-modern ${isScrolled ? "scrolled" : ""}`}>
      <div className="nav-container">
        {/* Logo */}
        <Link className="nav-logo" to="/" onClick={closeMenu}>
          <span className="logo-text">CEDII</span>
          <div className="logo-dot"></div>
        </Link>

        {/* Menu principal */}
        <div className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <div className="nav-links">
            <Link className="nav-link" to="/" onClick={closeMenu}>
              <span className="link-text">Accueil</span>
              <div className="link-underline"></div>
            </Link>
            <Link className="nav-link" to="/actualite" onClick={closeMenu}>
              <span className="link-text">Actualité</span>
              <div className="link-underline"></div>
            </Link>
            <Link className="nav-link" to="/evenement" onClick={closeMenu}>
              <span className="link-text">Événement</span>
              <div className="link-underline"></div>
            </Link>
            <Link className="nav-link" to="/publication" onClick={closeMenu}>
              <span className="link-text">Publication</span>
              <div className="link-underline"></div>
            </Link>
            <Link className="nav-link" to="/appeloffre" onClick={closeMenu}>
              <span className="link-text">Appel d'offre</span>
              <div className="link-underline"></div>
            </Link>
            <Link className="nav-link" to="/apropos" onClick={closeMenu}>
              <span className="link-text">À propos</span>
              <div className="link-underline"></div>
            </Link>
            <Link className="nav-link" to="/contact" onClick={closeMenu}>
              <span className="link-text">Contact</span>
              <div className="link-underline"></div>
            </Link>
          </div>

          {/* Boutons d'authentification */}
          <div className="nav-auth">
            {localStorage.getItem("token") ? (
              <button className="logout-btn" onClick={handleLogout}>
                <span>Déconnexion</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M17 16L21 12M21 12L17 8M21 12H7M13 16V17C13 18.6569 11.6569 20 10 20H6C4.34315 20 3 18.6569 3 17V7C3 5.34315 4.34315 4 6 4H10C11.6569 4 13 5.34315 13 7V8" 
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            ) : (
              <div className="auth-buttons">
                <Link className="signup-btn" to="/signup" onClick={closeMenu}>
                  Inscription
                </Link>
                <Link className="login-btn" to="/login" onClick={closeMenu}>
                  Connexion
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Bouton menu mobile */}
        <button 
          className={`nav-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Styles CSS */}
      <style jsx>{`
        .navbar-modern {
          position: fixed;
          top: 0;
          width: 100%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(0, 0, 0, 0.08);
          z-index: 1000;
          transition: all 0.3s ease;
        }

        .navbar-modern.scrolled {
          background: rgba(255, 255, 255, 0.98);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .nav-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 70px;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          text-decoration: none;
          font-weight: 700;
          font-size: 1.5rem;
          color: #2563eb;
          position: relative;
        }

        .logo-text {
          position: relative;
          z-index: 2;
        }

        .logo-dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          margin-left: 4px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .nav-menu {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-links {
          display: flex;
          gap: 1.5rem;
          align-items: center;
        }

        .nav-link {
          text-decoration: none;
          color: #374151;
          font-weight: 500;
          font-size: 0.95rem;
          position: relative;
          padding: 0.5rem 0;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: #2563eb;
        }

        .link-underline {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: #2563eb;
          transition: width 0.3s ease;
          border-radius: 2px;
        }

        .nav-link:hover .link-underline {
          width: 100%;
        }

        .nav-auth {
          display: flex;
          align-items: center;
          margin-left: 1rem;
        }

        .auth-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .login-btn, .signup-btn {
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 500;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .login-btn {
          background: #2563eb;
          color: white;
          border: 2px solid #2563eb;
        }

        .login-btn:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }

        .signup-btn {
          background: transparent;
          color: #2563eb;
          border: 2px solid #2563eb;
        }

        .signup-btn:hover {
          background: #2563eb;
          color: white;
          transform: translateY(-1px);
        }

        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1.25rem;
          border-radius: 8px;
          background: #ef4444;
          color: white;
          border: none;
          font-weight: 500;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .logout-btn:hover {
          background: #dc2626;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .nav-toggle {
          display: none;
          flex-direction: column;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
          gap: 4px;
        }

        .nav-toggle span {
          width: 25px;
          height: 2px;
          background: #374151;
          transition: all 0.3s ease;
          transform-origin: center;
        }

        .nav-toggle.active span:nth-child(1) {
          transform: rotate(45deg) translate(6px, 6px);
        }

        .nav-toggle.active span:nth-child(2) {
          opacity: 0;
        }

        .nav-toggle.active span:nth-child(3) {
          transform: rotate(-45deg) translate(6px, -6px);
        }

        /* Responsive */
        @media (max-width: 968px) {
          .nav-toggle {
            display: flex;
          }

          .nav-menu {
            position: fixed;
            top: 70px;
            left: 0;
            width: 100%;
            background: white;
            flex-direction: column;
            align-items: flex-start;
            padding: 2rem;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            transform: translateY(-100%);
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
          }

          .nav-menu.active {
            transform: translateY(0);
            opacity: 1;
            visibility: visible;
          }

          .nav-links {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
            width: 100%;
          }

          .nav-link {
            padding: 0.75rem 0;
            font-size: 1.1rem;
          }

          .nav-auth {
            margin-left: 0;
            margin-top: 1rem;
            width: 100%;
          }

          .auth-buttons {
            flex-direction: column;
            width: 100%;
            gap: 0.75rem;
          }

          .login-btn, .signup-btn, .logout-btn {
            width: 100%;
            text-align: center;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 0 1rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;