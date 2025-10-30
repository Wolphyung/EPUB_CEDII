import React, { useState, useEffect } from "react";
import { Nav, Modal, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";

const MembreSidebar = ({ onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeItem, setActiveItem] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [membreInfo, setMembreInfo] = useState({
    nom: "Membre",
    email: "membre@cedii.com",
    avatar: null
  });

  // Ajoutez cet useEffect pour notifier le parent des changements
  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed && !isHovered);
    }
  }, [isCollapsed, isHovered, onCollapse]);

  // Déterminer l'élément actif basé sur l'URL et récupérer les infos du membre
  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
    
    // Récupérer les informations du membre depuis le localStorage
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setMembreInfo({
        nom: user.nom || "Membre",
        email: user.email || "membre@cedii.com",
        avatar: user.avatar || null
      });
    }
  }, [location]);

  const handleLogoutConfirm = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setShowLogoutModal(false);
    navigate("/login");
  };

  // Fonction pour afficher l'image correctement
  const displayAvatar = (avatar) => {
    if (!avatar) return null;
    
    if (avatar.startsWith("http")) {
      return avatar;
    } else if (avatar.startsWith("/")) {
      return `http://localhost:8000${avatar}`;
    } else {
      return `http://localhost:8000/storage/${avatar}`;
    }
  };

  const menuItems = [
    { path: "/dashMembre", icon: "fas fa-tachometer-alt", label: "Tableau de bord" },
    { path: "/pubMembre", icon: "fas fa-bullhorn", label: "Publication" },
    { path: "/evenementMembre", icon: "fas fa-calendar-alt", label: "Événement" },
    { path: "/appeloffreMembre", icon: "fas fa-briefcase", label: "Offre d'emploi" },
    { path: "/profilMembre", icon: "fas fa-user-circle", label: "Profil" },
    { path: "/messageMembre", icon: "fas fa-comments", label: "Messages" },
    { path: "/notificationMembre", icon: "fas fa-bell", label: "Notifications" },
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
      ? "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)" 
      : "transparent",
    border: "none",
    borderRadius: "12px",
    margin: "4px 0",
    padding: "14px 16px",
    transition: "all 0.3s ease",
    transform: activeItem === path ? "translateX(5px)" : "translateX(0)",
    boxShadow: activeItem === path 
      ? "0 4px 15px rgba(0, 176, 155, 0.3)" 
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
        {/* En-tête avec informations du membre */}
        <div className="p-4 border-bottom border-secondary" style={{ borderColor: "rgba(255,255,255,0.1) !important" }}>
          <div className="d-flex align-items-center justify-content-between">
            {(!isCollapsed || isHovered) && (
              <div className="text-center w-100">
                <div className="position-relative">
                  {/* Avatar du membre */}
                  <div className="position-relative mb-3" style={{ margin: "0 auto", width: "fit-content" }}>
                    {membreInfo.avatar ? (
                      <img
                        src={displayAvatar(membreInfo.avatar)}
                        alt={membreInfo.nom}
                        className="rounded-circle border-4 border-white shadow"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          border: "3px solid rgba(255, 255, 255, 0.3)"
                        }}
                        onError={(e) => {
                          // Si l'image ne charge pas, afficher l'icône par défaut
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    
                    {/* Avatar par défaut si pas d'image ou erreur */}
                    <div 
                      className={`rounded-circle d-flex align-items-center justify-content-center ${membreInfo.avatar ? 'd-none' : ''}`}
                      style={{ 
                        width: "80px", 
                        height: "80px",
                        background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
                        margin: "0 auto"
                      }}
                    >
                      <i className="fas fa-user text-white fs-3"></i>
                    </div>

                    {/* Indicateur de statut en ligne */}
                    <div 
                      className="position-absolute"
                      style={{
                        bottom: "5px",
                        right: "5px",
                        width: "16px",
                        height: "16px",
                        borderRadius: "50%",
                        backgroundColor: "#00d664",
                        border: "2px solid #2c3e50",
                        boxShadow: "0 0 10px #00d664"
                      }}
                    ></div>
                  </div>

                  {/* Informations du membre */}
                  <h4 
                    className="mb-1 fw-bold"
                    style={{
                      background: "linear-gradient(135deg, #fff, #a8ffd4)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      fontSize: "1.3rem"
                    }}
                  >
                    {membreInfo.nom}
                  </h4>
                  <p className="text-white-50 small mb-2" style={{ fontSize: "0.85rem" }}>
                    {membreInfo.email}
                  </p>
                  <span 
                    className="badge bg-success bg-opacity-20 text-success px-3 py-2"
                    style={{ 
                      borderRadius: "20px",
                      fontSize: "0.75rem",
                      border: "1px solid rgba(0, 176, 155, 0.3)"
                    }}
                  >
                    <i className="fas fa-circle me-1" style={{ fontSize: "0.5rem" }}></i>
                    Membre Actif
                  </span>
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
        <div className="p-3" style={{ height: "calc(100vh - 280px)", overflowY: "auto" }}>
          <Nav className="flex-column">
            {menuItems.map((item) => (
              <Nav.Item key={item.path} className="mb-2">
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
              </Nav.Item>
            ))}
          </Nav>
        </div>

        {/* Section Déconnexion */}
        <div className="p-3 border-top border-secondary" style={{ 
          borderColor: "rgba(255,255,255,0.1) !important",
          position: "absolute",
          bottom: "0",
          left: "0",
          right: "0"
        }}>
          <button
            onClick={() => setShowLogoutModal(true)}
            className="btn w-100 d-flex align-items-center justify-content-center text-white text-decoration-none"
            style={{
              background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
              border: "none",
              borderRadius: "12px",
              padding: "14px 16px",
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
                Membre v2.1.0
              </span>
            </div>
          )}
        </div>
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
            Êtes-vous sûr de vouloir vous déconnecter de votre espace membre ?
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

      {/* Styles CSS */}
      <style>
        {`
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
            background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #96c93d 0%, #00b09b 100%);
          }
          
          /* Animation d'entrée */
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: "translateX(0)";
            }
          }
          
          .nav-item {
            animation: slideIn 0.3s ease-out;
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

          /* Animation pour l'avatar */
          .rounded-circle {
            transition: all 0.3s ease;
          }

          .rounded-circle:hover {
            transform: scale(1.05);
          }
        `}
      </style>
    </>
  );
};

export default MembreSidebar;