import React, { useState, useEffect } from "react";
import { Nav, Modal, Button, OverlayTrigger, Tooltip } from "react-bootstrap";
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

  useEffect(() => {
    if (onCollapse) {
      onCollapse(isCollapsed && !isHovered);
    }
  }, [isCollapsed, isHovered, onCollapse]);

  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
    
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
    { path: "/dashMembre", icon: "fas fa-chart-line", label: "Dashboard", description: "Vue d'ensemble" },
    { path: "/pubMembre", icon: "fas fa-newspaper", label: "Publications", description: "Articles et posts" },
    { path: "/evenementMembre", icon: "fas fa-calendar-star", label: "Événements", description: "Agenda et réunions" },
    { path: "/appeloffreMembre", icon: "fas fa-briefcase", label: "Opportunités", description: "Offres et appels" },
    { path: "/profilMembre", icon: "fas fa-user-cog", label: "Profil", description: "Paramètres personnels" },
    { path: "/messageMembre", icon: "fas fa-comment-dots", label: "Messages", description: "Communications" },
    { path: "/notificationMembre", icon: "fas fa-bell", label: "Notifications", description: "Alertes et mises à jour" },
  ];

  const getTooltip = (label, description) => (
    <Tooltip id={`tooltip-${label}`}>
      <strong>{label}</strong>
      <div className="small">{description}</div>
    </Tooltip>
  );

  return (
    <>
      <div 
        className="vh-100 text-white position-fixed d-flex flex-column"
        style={{
          background: "linear-gradient(165deg, #0F172A 0%, #1E293B 100%)",
          boxShadow: "8px 0 30px rgba(0, 0, 0, 0.25)",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: isCollapsed && !isHovered ? "translateX(-85%)" : "translateX(0)",
          width: isCollapsed && !isHovered ? "85px" : "300px",
          zIndex: 1040,
          borderRight: "1px solid rgba(255, 255, 255, 0.08)"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* En-tête premium */}
        <div className="p-5 pb-4" style={{ 
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "linear-gradient(180deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.7) 100%)",
          position: "relative",
          overflow: "hidden"
        }}>
          {/* Background pattern */}
          <div style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "radial-gradient(circle at 20% 50%, rgba(56, 189, 248, 0.1) 0%, transparent 50%)",
            zIndex: 0
          }}></div>
          
          <div className="position-relative z-1">
            <div className="d-flex align-items-center justify-content-between mb-4">
              {(!isCollapsed || isHovered) ? (
                <div className="d-flex align-items-center">
                 
               
                </div>
              ) : (
                <div className="rounded-circle p-3 mx-auto" style={{
                  background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                  boxShadow: "0 4px 20px rgba(59, 130, 246, 0.3)"
                }}>
                  <i className="fas fa-user-tie text-white fs-4"></i>
                </div>
              )}
              
              <button
                className="btn btn-sm"
                onClick={() => setIsCollapsed(!isCollapsed)}
                style={{
                  background: "rgba(255, 255, 255, 0.08)",
                  border: "1px solid rgba(255, 255, 255, 0.12)",
                  borderRadius: "10px",
                  width: "36px",
                  height: "36px",
                  color: "#CBD5E1",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.15)";
                  e.target.style.transform = "rotate(90deg)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = "rgba(255, 255, 255, 0.08)";
                  e.target.style.transform = "rotate(0deg)";
                }}
              >
                <i className={`fas fa-chevron-${isCollapsed ? "right" : "left"}`}></i>
              </button>
            </div>

            {/* Profil utilisateur */}
            <div className="text-center">
              <div className="position-relative d-inline-block mb-3">
                <div className="position-relative">
                  {membreInfo.avatar ? (
                    <img
                      src={displayAvatar(membreInfo.avatar)}
                      alt={membreInfo.nom}
                      className="rounded-circle border-3 shadow-lg"
                      style={{
                        width: "90px",
                        height: "90px",
                        objectFit: "cover",
                        border: "3px solid rgba(255, 255, 255, 0.15)",
                        boxShadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
                        transition: "all 0.3s ease"
                      }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  
                  <div 
                    className={`rounded-circle d-flex align-items-center justify-content-center ${membreInfo.avatar ? 'd-none' : ''}`}
                    style={{ 
                      width: "90px", 
                      height: "90px",
                      background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                      margin: "0 auto",
                      border: "3px solid rgba(255, 255, 255, 0.15)",
                      boxShadow: "0 10px 40px rgba(59, 130, 246, 0.3)"
                    }}
                  >
                    <i className="fas fa-user-check text-white fs-3"></i>
                  </div>

                  {/* Badge de statut */}
                  <div 
                    className="position-absolute d-flex align-items-center justify-content-center"
                    style={{
                      bottom: "5px",
                      right: "5px",
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #10B981 0%, #34D399 100%)",
                      border: "3px solid #1E293B",
                      boxShadow: "0 0 20px rgba(16, 185, 129, 0.5)"
                    }}
                  >
                    <i className="fas fa-check text-white" style={{ fontSize: "0.6rem" }}></i>
                  </div>
                </div>
              </div>

              {(!isCollapsed || isHovered) && (
                <div>
                  <h5 
                    className="fw-bold mb-1"
                    style={{
                      color: "#FFFFFF",
                      fontSize: "1.2rem",
                      letterSpacing: "0.5px"
                    }}
                  >
                    {membreInfo.nom}
                  </h5>
                  <div className="text-slate-300 small mb-3" style={{ opacity: 0.8 }}>
                    <i className="fas fa-envelope me-2"></i>
                    {membreInfo.email}
                  </div>
                  <div className="d-inline-flex align-items-center px-3 py-2 rounded-pill"
                    style={{
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.3)",
                      color: "#10B981",
                      fontSize: "0.85rem",
                      fontWeight: "500"
                    }}
                  >
                    <div className="me-2" style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#10B981",
                      animation: "pulse 2s infinite"
                    }}></div>
                    Membre Premium
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Menu de navigation */}
        <div className="flex-grow-1 p-4" style={{ 
          overflowY: "auto",
          overflowX: "hidden"
        }}>
          <Nav className="flex-column gap-1">
            {menuItems.map((item) => {
              const isActive = activeItem === item.path;
              return (
                <Nav.Item key={item.path}>
                  <OverlayTrigger
                    placement="right"
                    overlay={getTooltip(item.label, item.description)}
                    show={isCollapsed && !isHovered ? undefined : false}
                  >
                    <Link
                      className="nav-link text-decoration-none position-relative"
                      to={item.path}
                      style={{
                        color: isActive ? "#FFFFFF" : "#CBD5E1",
                        background: isActive 
                          ? "linear-gradient(135deg, rgba(59, 130, 246, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)"
                          : "transparent",
                        border: isActive 
                          ? "1px solid rgba(59, 130, 246, 0.3)"
                          : "1px solid transparent",
                        borderRadius: "12px",
                        padding: "14px 18px",
                        margin: "4px 0",
                        transition: "all 0.3s ease",
                        position: "relative",
                        overflow: "hidden"
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
                          e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
                          e.currentTarget.style.transform = "translateX(5px)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.borderColor = "transparent";
                          e.currentTarget.style.transform = "translateX(0)";
                        }
                      }}
                    >
                      {/* Effet de fond au survol */}
                      <div className="position-absolute top-0 bottom-0 start-0 end-0"
                        style={{
                          background: "linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                          zIndex: 0
                        }}
                      ></div>
                      
                      <div className="position-relative z-1 d-flex align-items-center">
                        <div className="position-relative">
                          <i className={`${item.icon} me-3`} style={{ 
                            width: "24px", 
                            textAlign: "center",
                            fontSize: "1.1rem",
                            color: isActive ? "#60A5FA" : "#94A3B8"
                          }}></i>
                          {isActive && (
                            <div 
                              className="position-absolute"
                              style={{
                                top: "50%",
                                left: "-8px",
                                transform: "translateY(-50%)",
                                width: "4px",
                                height: "24px",
                                background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                                borderRadius: "2px"
                              }}
                            ></div>
                          )}
                        </div>
                        
                        {(!isCollapsed || isHovered) && (
                          <div className="flex-grow-1">
                            <div className="fw-medium" style={{ fontSize: "0.95rem" }}>
                              {item.label}
                            </div>
                            <div className="text-slate-400 small" style={{ 
                              fontSize: "0.8rem",
                              opacity: 0.8
                            }}>
                              {item.description}
                            </div>
                          </div>
                        )}
                        
                        {isActive && (
                          <div className="ms-2">
                            <div 
                              style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: "linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)",
                                boxShadow: "0 0 10px rgba(59, 130, 246, 0.5)"
                              }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </Link>
                  </OverlayTrigger>
                </Nav.Item>
              );
            })}
          </Nav>
        </div>

        {/* Section inférieure avec déconnexion */}
        <div className="p-4 mt-auto" style={{ 
          borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(15, 23, 42, 0.5)",
          backdropFilter: "blur(10px)"
        }}>
          {(!isCollapsed || isHovered) && (
            <div className="mb-4">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-slate-400 small">Progression mensuelle</span>
                <span className="text-slate-300 small fw-medium">65%</span>
              </div>
              <div className="progress" style={{
                height: "6px",
                background: "rgba(255, 255, 255, 0.05)",
                borderRadius: "3px",
                overflow: "hidden"
              }}>
                <div 
                  className="progress-bar"
                  style={{
                    background: "linear-gradient(90deg, #3B82F6 0%, #8B5CF6 100%)",
                    borderRadius: "3px",
                    width: "65%",
                    transition: "width 1s ease"
                  }}
                ></div>
              </div>
            </div>
          )}
          
          <button
            onClick={() => setShowLogoutModal(true)}
            className="btn w-100 d-flex align-items-center justify-content-center text-white position-relative overflow-hidden"
            style={{
              background: "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "12px",
              padding: "14px",
              transition: "all 0.3s ease",
              color: "#FCA5A5"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.3)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.color = "#F87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.1) 100%)";
              e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.color = "#FCA5A5";
            }}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            {(!isCollapsed || isHovered) && (
              <span className="fw-medium">Déconnexion</span>
            )}
          </button>

          {(!isCollapsed || isHovered) && (
            <div className="text-center mt-3">
              <div className="text-slate-500 small">
                <div className="d-flex align-items-center justify-content-center">
                  <i className="fas fa-shield-alt me-2 text-slate-400"></i>
                  <span>Sécurisé • v2.1.0</span>
                </div>
                <div className="mt-1" style={{ fontSize: "0.75rem", opacity: 0.6 }}>
                  © 2025 CEDII • Tous droits réservés
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal de déconnexion premium */}
      <Modal 
        show={showLogoutModal} 
        onHide={() => setShowLogoutModal(false)} 
        centered
        backdrop="static"
      >
        <Modal.Body className="p-0 overflow-hidden" style={{ borderRadius: "20px" }}>
          <div style={{
            background: "linear-gradient(135deg, #0F172A 0%, #1E293B 100%)",
            color: "white"
          }}>
            {/* En-tête du modal */}
            <div className="p-5 text-center position-relative overflow-hidden">
              <div style={{
                position: "absolute",
                top: "-50%",
                right: "-50%",
                width: "200%",
                height: "200%",
                background: "radial-gradient(circle at center, rgba(239, 68, 68, 0.1) 0%, transparent 70%)",
                zIndex: 0
              }}></div>
              
              <div className="position-relative z-1">
                <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
                  style={{
                    width: "100px",
                    height: "100px",
                    background: "linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%)",
                    border: "2px solid rgba(239, 68, 68, 0.3)",
                    boxShadow: "0 10px 40px rgba(239, 68, 68, 0.2)"
                  }}
                >
                  <i className="fas fa-door-open text-rose-400 fs-1"></i>
                </div>
                
                <h3 className="fw-bold mb-2" style={{ 
                  fontSize: "1.8rem",
                  background: "linear-gradient(135deg, #FFFFFF 0%, #FCA5A5 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Déconnexion
                </h3>
                
                <p className="text-slate-300 mb-0" style={{ lineHeight: "1.6", opacity: 0.9 }}>
                  Vous êtes sur le point de quitter votre espace sécurisé
                </p>
              </div>
            </div>

            {/* Contenu du modal */}
            <div className="p-5 pt-4" style={{ background: "rgba(255, 255, 255, 0.02)" }}>
              <div className="alert alert-dark border-slate-700 mb-4" role="alert" style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                color: "#CBD5E1"
              }}>
                <div className="d-flex">
                  <i className="fas fa-info-circle text-slate-400 me-3 mt-1"></i>
                  <div>
                    <strong>Information</strong>
                    <div className="small mt-1">
                      Votre session sera fermée et vous devrez vous reconnecter pour accéder à nouveau.
                    </div>
                  </div>
                </div>
              </div>

              <div className="d-flex flex-column gap-3">
                <Button
                  variant="outline-light"
                  onClick={() => setShowLogoutModal(false)}
                  className="d-flex align-items-center justify-content-center py-3"
                  style={{
                    borderRadius: "12px",
                    border: "2px solid rgba(255, 255, 255, 0.1)",
                    background: "transparent",
                    fontWeight: "600",
                    fontSize: "1rem",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "rgba(255, 255, 255, 0.05)";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "transparent";
                    e.target.style.borderColor = "rgba(255, 255, 255, 0.1)";
                  }}
                >
                  <i className="fas fa-times me-3"></i>
                  Annuler et rester connecté
                </Button>
                
                <Button
                  onClick={handleLogoutConfirm}
                  className="d-flex align-items-center justify-content-center py-3"
                  style={{
                    borderRadius: "12px",
                    border: "none",
                    background: "linear-gradient(135deg, #EF4444 0%, #DC2626 100%)",
                    fontWeight: "600",
                    fontSize: "1rem",
                    boxShadow: "0 4px 20px rgba(239, 68, 68, 0.3)",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "translateY(-2px)";
                    e.target.style.boxShadow = "0 6px 25px rgba(239, 68, 68, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "0 4px 20px rgba(239, 68, 68, 0.3)";
                  }}
                >
                  <i className="fas fa-sign-out-alt me-3"></i>
                  Se déconnecter maintenant
                </Button>
              </div>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Styles CSS globaux */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 1; }
            50% { transform: scale(1.2); opacity: 0.8; }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          .nav-item {
            animation: fadeIn 0.3s ease-out;
          }
          
          /* Scrollbar personnalisée */
          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.03);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(139, 92, 246, 0.5) 100%);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.8) 0%, rgba(139, 92, 246, 0.8) 100%);
          }
          
          /* Tooltip personnalisé */
          .tooltip {
            backdrop-filter: blur(10px);
            background: rgba(15, 23, 42, 0.95) !important;
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 10px !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
          }
          
          .tooltip-inner {
            background: transparent !important;
            padding: 10px 15px !important;
            text-align: left;
          }
          
          .tooltip.bs-tooltip-end .tooltip-arrow::before {
            border-right-color: rgba(15, 23, 42, 0.95) !important;
          }
          
          /* Animation de flottement */
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          
          .floating {
            animation: float 3s ease-in-out infinite;
          }
          
          /* Effet de verre (glassmorphism) */
          .glass {
            background: rgba(255, 255, 255, 0.05);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
          }
          
          /* Transition pour les liens */
          .nav-link {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          
          /* Effet de surbrillance */
          .highlight {
            position: relative;
          }
          
          .highlight::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%);
            border-radius: inherit;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 0;
          }
          
          .highlight:hover::before {
            opacity: 1;
          }
        `}
      </style>
    </>
  );
};

export default MembreSidebar;