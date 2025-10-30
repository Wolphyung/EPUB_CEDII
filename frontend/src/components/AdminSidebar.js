import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Déterminer l'élément actif basé sur l'URL
  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
  }, [location]);

  // Appliquer le thème au chargement
  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const applyTheme = (darkMode) => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.style.background = "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)";
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.style.background = "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)";
      document.body.style.color = "#333333";
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const menuItems = [
    { path: "/dashAdmin", icon: "fas fa-tachometer-alt", label: "Tableau de bord" },
    { path: "/pubAdmin", icon: "fas fa-bullhorn", label: "Publication" },
    { path: "/adminEv", icon: "fas fa-calendar-alt", label: "Événement" },
    { path: "/appeloffreAdmin", icon: "fas fa-file-contract", label: "Appel d'offre" },
    { path: "/membreAdmin", icon: "fas fa-users", label: "Membre" },
    { path: "/messageAdmin", icon: "fas fa-comments", label: "Messages" },
    { path: "/notificationAdmin", icon: "fas fa-bell", label: "Notifications" },
    { path: "/parametreAdmin", icon: "fas fa-cogs", label: "Paramètre" },
  ];

  const sidebarStyle = {
    background: "linear-gradient(180deg, #2c3e50 0%, #34495e 100%)",
    boxShadow: "4px 0 15px rgba(0, 0, 0, 0.1)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    transform: isCollapsed && !isHovered ? "translateX(-85%)" : "translateX(0)",
    width: isCollapsed && !isHovered ? "80px" : "280px",
    zIndex: 1040,
  };

  const linkStyle = (path) => ({
    background: activeItem === path 
      ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" 
      : "transparent",
    border: "none",
    borderRadius: "12px",
    margin: "4px 0",
    padding: "14px 16px",
    transition: "all 0.3s ease",
    transform: activeItem === path ? "translateX(5px)" : "translateX(0)",
    boxShadow: activeItem === path 
      ? "0 4px 15px rgba(102, 126, 234, 0.3)" 
      : "none",
    position: "relative",
    overflow: "hidden",
  });

  return (
    <>
      {/* Overlay pour mobile */}
      {isCollapsed && isHovered && (
        <div 
          className="d-lg-none"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1039,
          }}
          onClick={() => setIsHovered(false)}
        />
      )}

      <div 
        className="vh-100 text-white position-fixed"
        style={sidebarStyle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* En-tête avec bouton de toggle */}
        <div className="p-4 border-bottom border-secondary" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
          <div className="d-flex align-items-center justify-content-between">
            {(!isCollapsed || isHovered) && (
              <div className="text-center w-100">
                <div className="position-relative">
                  <div 
                    className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-2"
                    style={{ 
                      width: "50px", 
                      height: "50px",
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important"
                    }}
                  >
                    <i className="fas fa-user-shield text-white fs-5"></i>
                  </div>
                  <h4 
                    className="mb-0 fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #fff, #a8c0ff)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: "1.3rem"
                    }}
                  >
                    Admin Panel
                  </h4>
                  <span className="text-white-50 small d-block">Administrateur</span>
                </div>
              </div>
            )}
            <button
              className="btn btn-sm text-white position-absolute"
              style={{
                top: "20px",
                right: "15px",
                background: "rgba(255,255,255,0.1)",
                border: "none",
                borderRadius: "8px",
                width: "32px",
                height: "32px"
              }}
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <i className={`fas fa-chevron-${isCollapsed ? "right" : "left"}`}></i>
            </button>
          </div>
        </div>

        {/* Menu de navigation */}
        <div className="p-3" style={{ height: "calc(100vh - 240px)", overflowY: "auto" }}>
          <ul className="nav flex-column">
            {menuItems.map((item) => (
              <li key={item.path} className="nav-item">
                <Link
                  className="nav-link text-white d-flex align-items-center text-decoration-none"
                  to={item.path}
                  style={linkStyle(item.path)}
                  onMouseEnter={(e) => {
                    if (activeItem !== item.path) {
                      e.target.style.transform = "translateX(5px)";
                      e.target.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeItem !== item.path) {
                      e.target.style.transform = "translateX(0)";
                      e.target.style.backgroundColor = "transparent";
                    }
                  }}
                >
                  <i className={`${item.icon} me-3`} style={{ width: "20px", textAlign: "center" }}></i>
                  {(!isCollapsed || isHovered) && (
                    <span className="fw-medium">{item.label}</span>
                  )}
                  {activeItem === item.path && (
                    <div 
                      style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#fff",
                        boxShadow: "0 0 10px rgba(255,255,255,0.5)"
                      }}
                    ></div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Section Thème et Déconnexion */}
        <div className="p-3 border-top border-secondary" style={{ 
          borderColor: "rgba(255,255,255,0.1) !important",
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0"
        }}>
          {/* Bouton Thème */}
          <button
            onClick={toggleTheme}
            className="btn w-100 d-flex align-items-center justify-content-center text-white text-decoration-none mb-3"
            style={{
              background: "linear-gradient(135deg, #ffd700 0%, #ffa500 100%)",
              border: "none",
              borderRadius: "12px",
              padding: "12px 16px",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(255, 215, 0, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(255, 215, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(255, 215, 0, 0.3)";
            }}
          >
            <i className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"} me-2`}></i>
            {(!isCollapsed || isHovered) && (
              <span className="fw-medium">
                {isDarkMode ? "Mode Clair" : "Mode Sombre"}
              </span>
            )}
          </button>

          {/* Bouton Déconnexion */}
          <button
            onClick={handleLogoutClick}
            className="btn w-100 d-flex align-items-center justify-content-center text-white text-decoration-none"
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
              border: "none",
              borderRadius: "12px",
              padding: "12px 16px",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(255, 107, 107, 0.3)"
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(255, 107, 107, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 15px rgba(255, 107, 107, 0.3)";
            }}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            {(!isCollapsed || isHovered) && (
              <span className="fw-medium">Déconnexion</span>
            )}
          </button>

          {/* Version badge */}
          {(!isCollapsed || isHovered) && (
            <div className="text-center mt-3">
              <span 
                className="badge bg-dark bg-opacity-50 text-white-50 px-3 py-2"
                style={{ 
                  borderRadius: "20px",
                  fontSize: "0.75rem"
                }}
              >
                v2.1.0
              </span>
            </div>
          )}
        </div>

        {/* Indicateur de statut */}
        <div 
          className="position-absolute"
          style={{
            top: "20px",
            left: "15px",
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            backgroundColor: "#00d664",
            boxShadow: "0 0 10px #00d664"
          }}
        ></div>
      </div>

      {/* Modal de confirmation de déconnexion */}
      <Modal 
        show={showLogoutModal} 
        onHide={() => setShowLogoutModal(false)} 
        centered
        size="sm"
      >
        <Modal.Body className="text-center p-4" style={{ borderRadius: "20px" }}>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
              color: "white"
            }}
          >
            <i className="fas fa-sign-out-alt fs-2"></i>
          </div>
          
          <h4 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
            Déconnexion
          </h4>
          
          <p className="text-muted mb-4" style={{ lineHeight: "1.5" }}>
            Êtes-vous sûr de vouloir vous déconnecter de votre session administrateur ?
          </p>
          
          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={() => setShowLogoutModal(false)}
              className="d-flex align-items-center"
              style={{
                borderRadius: "12px",
                padding: "10px 20px",
                border: "2px solid #dee2e6",
                fontWeight: "600"
              }}
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={handleLogoutConfirm}
              className="d-flex align-items-center"
              style={{
                borderRadius: "12px",
                padding: "10px 20px",
                background: "linear-gradient(135deg, #ff6b6b, #ee5a52)",
                border: "none",
                fontWeight: "600"
              }}
            >
              <i className="fas fa-check me-2"></i>
              Se déconnecter
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Styles CSS pour le mode sombre */}
      <style>
        {`
          [data-theme="dark"] {
            --bg-primary: #1a1a1a;
            --bg-secondary: #2d2d2d;
            --text-primary: #ffffff;
            --text-secondary: #b0b0b0;
            --card-bg: #2d2d2d;
            --card-border: #404040;
            --input-bg: #2d2d2d;
            --input-border: #404040;
            --table-bg: #2d2d2d;
            --table-border: #404040;
          }

          [data-theme="light"] {
            --bg-primary: #ffffff;
            --bg-secondary: #f8f9fa;
            --text-primary: #333333;
            --text-secondary: #6c757d;
            --card-bg: #ffffff;
            --card-border: #dee2e6;
            --input-bg: #ffffff;
            --input-border: #ced4da;
            --table-bg: #ffffff;
            --table-border: #dee2e6;
          }

          /* Application du thème aux composants */
          .card {
            background-color: var(--card-bg) !important;
            border-color: var(--card-border) !important;
            color: var(--text-primary) !important;
          }

          .form-control {
            background-color: var(--input-bg) !important;
            border-color: var(--input-border) !important;
            color: var(--text-primary) !important;
          }

          .form-control::placeholder {
            color: var(--text-secondary) !important;
          }

          .form-select {
            background-color: var(--input-bg) !important;
            border-color: var(--input-border) !important;
            color: var(--text-primary) !important;
          }

          .table {
            background-color: var(--table-bg) !important;
            color: var(--text-primary) !important;
          }

          .table th,
          .table td {
            border-color: var(--table-border) !important;
          }

          .text-muted {
            color: var(--text-secondary) !important;
          }

          .nav-link:hover {
            color: #fff !important;
          }
          
          /* Scrollbar personnalisée */
          ::-webkit-scrollbar {
            width: 4px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
          }
          
          /* Animation d'entrée */
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          .nav-item {
            animation: slideIn 0.3s ease-out;
          }

          /* Transition douce pour le changement de thème */
          body, .card, .form-control, .form-select, .table {
            transition: all 0.3s ease-in-out;
          }

          /* Styles pour le modal de déconnexion */
          .modal-content {
            border-radius: 20px !important;
            border: none !important;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
          }

          .modal-backdrop {
            background-color: rgba(0, 0, 0, 0.5) !important;
          }
        `}
      </style>
    </>
  );
};

export default AdminSidebar;