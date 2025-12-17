import React, { useState, useEffect, useRef } from "react";
import { Nav, Modal, Button } from "react-bootstrap";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const MembreSidebar = ({ onCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { i18n } = useTranslation();
  const [activeItem, setActiveItem] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [membreInfo, setMembreInfo] = useState({
    nom: "Membre",
    email: "membre@cedii.com",
    avatar: null
  });

  // Palette CEDII 2025
  const colors = {
    primary: "#5B11EE",
    secondary: "#0405BF",
    dark: "#02061E",
    accent: "#0671B6",
    neutral: "#5E5E5E"
  };

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
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/")) return `http://localhost:8000${avatar}`;
    return `http://localhost:8000/storage/${avatar}`;
  };

  const menuItems = [
    { path: "/dashMembre", icon: "fas fa-chart-line", label: "Dashboard" },
    { path: "/pubMembre", icon: "fas fa-newspaper", label: "Publications" },
    { path: "/evenementMembre", icon: "fas fa-calendar-alt", label: "Événements" },
    { path: "/appeloffreMembre", icon: "fas fa-briefcase", label: "Opportunités" },
    { path: "/profilMembre", icon: "fas fa-user-cog", label: "Profil" },
    { path: "/abonnementmembre", icon: "fas fa-crown", label: "Abonnement" },
    { path: "/messageMembre", icon: "fas fa-comment-dots", label: "Messages" },
  ];

  const sidebarWidth = isCollapsed && !isHovered ? "80px" : "280px";
  const shouldShowContent = !isCollapsed || isHovered;

  // Composant LanguageSwitcher intégré
  const LanguageSwitcher = () => {
    const [isLangOpen, setIsLangOpen] = useState(false);
    const langDropdownRef = useRef(null);

    const changeLanguage = (lng) => {
      i18n.changeLanguage(lng);
      localStorage.setItem('i18nextLng', lng);
      setIsLangOpen(false);
    };

    const getCurrentFlag = () => {
      switch (i18n.language) {
        case 'fr':
          return <span className="fi fi-fr" style={{ fontSize: '1.2rem' }}></span>;
        case 'en':
          return <span className="fi fi-us" style={{ fontSize: '1.2rem' }}></span>;
        case 'mg':
          return <span className="fi fi-mg" style={{ fontSize: '1.2rem' }}></span>;
        default:
          return <span className="fi fi-fr" style={{ fontSize: '1.2rem' }}></span>;
      }
    };

    // Fermer le dropdown en cliquant à l'extérieur
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (langDropdownRef.current && !langDropdownRef.current.contains(event.target)) {
          setIsLangOpen(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <div 
        ref={langDropdownRef}
        style={{ 
          position: 'relative', 
          display: 'inline-block',
          width: 'fit-content',
          margin: '0 auto',
        }}
      >
        <Button
          onClick={() => setIsLangOpen(!isLangOpen)}
          size="sm"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            minWidth: '60px',
            justifyContent: 'center',
            transition: 'all 0.3s ease',
          }}
          title="Changer la langue"
        >
          <span 
            className="fas fa-globe" 
            style={{
              color: 'white',
              fontSize: '0.9rem',
            }}
          ></span>
          <span style={{ color: 'white', fontSize: '1.2rem' }}>
            {getCurrentFlag()}
          </span>
          <span 
            className={`fas fa-chevron-${isLangOpen ? 'up' : 'down'}`}
            style={{
              color: 'white',
              fontSize: '0.7rem',
              marginLeft: '4px',
            }}
          ></span>
        </Button>

        {isLangOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '4px',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
              zIndex: 1000,
              minWidth: '60px',
              overflow: 'hidden',
            }}
          >
            {/* Option français */}
            <button
              onClick={() => changeLanguage('fr')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '10px 12px',
                backgroundColor: i18n.language === 'fr' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                color: 'white',
                border: 'none',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              title="Français"
            >
              <span className="fi fi-fr" style={{ fontSize: '1.2rem' }}></span>
            </button>

            {/* Option anglais */}
            <button
              onClick={() => changeLanguage('en')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '10px 12px',
                backgroundColor: i18n.language === 'en' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                color: 'white',
                border: 'none',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              title="English"
            >
              <span className="fi fi-us" style={{ fontSize: '1.2rem' }}></span>
            </button>

            {/* Option malgache */}
            <button
              onClick={() => changeLanguage('mg')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '10px 12px',
                backgroundColor: i18n.language === 'mg' ? 'rgba(102, 126, 234, 0.2)' : 'transparent',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
              }}
              title="Malagasy"
            >
              <span className="fi fi-mg" style={{ fontSize: '1.2rem' }}></span>
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className="vh-100 text-white position-fixed d-flex flex-column"
        style={{
          background: `linear-gradient(180deg, ${colors.dark} 0%, ${colors.secondary} 100%)`,
          boxShadow: "4px 0 24px rgba(0, 0, 0, 0.3)",
          transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
          width: sidebarWidth,
          zIndex: 1040,
          borderRight: `1px solid rgba(91, 17, 238, 0.1)`
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          setHoveredItem(null);
        }}
      >
        {/* Header */}
        <div 
          className="p-4" 
          style={{
            borderBottom: `1px solid rgba(91, 17, 238, 0.15)`,
            background: `linear-gradient(135deg, ${colors.primary}15 0%, transparent 100%)`
          }}
        >
          <div className="d-flex align-items-center justify-content-between mb-3">
            {shouldShowContent && (
              <div className="d-flex align-items-center gap-2">
                <span className="logo-text">
                  <img src="/images/logo.jpg" alt="Logo" className="logo-img" />
                </span>
                <div>
                  <div className="fw-bold" style={{ fontSize: "1.1rem", letterSpacing: "0.5px" }}>CEDII</div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>Espace Membre</div>
                </div>
              </div>
            )}
           
            <button
              className="btn btn-sm d-flex align-items-center justify-content-center"
              onClick={() => setIsCollapsed(!isCollapsed)}
              style={{
                background: "rgba(255, 255, 255, 0.05)",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "8px",
                width: "32px",
                height: "32px",
                color: "#FFF",
                transition: "all 0.3s ease"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
            >
              <i className="fas fa-bars" style={{ fontSize: "0.85rem" }}></i>
            </button>
          </div>

          {/* User Profile */}
          {shouldShowContent && (
            <div className="text-center mt-4">
              <div className="position-relative d-inline-block mb-3">
                {membreInfo.avatar ? (
                  <img
                    src={displayAvatar(membreInfo.avatar)}
                    alt={membreInfo.nom}
                    className="rounded-circle"
                    style={{
                      width: "72px",
                      height: "72px",
                      objectFit: "cover",
                      border: `3px solid ${colors.primary}`,
                      boxShadow: `0 8px 24px ${colors.primary}30`
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
                    width: "72px",
                    height: "72px",
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    border: `3px solid ${colors.primary}40`,
                    boxShadow: `0 8px 24px ${colors.primary}30`
                  }}
                >
                  <i className="fas fa-user text-white fs-4"></i>
                </div>
               
                {/* Status Badge */}
                <div
                  className="position-absolute d-flex align-items-center justify-content-center"
                  style={{
                    bottom: "2px",
                    right: "2px",
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "#10B981",
                    border: `3px solid ${colors.dark}`,
                    boxShadow: "0 0 12px rgba(16, 185, 129, 0.6)"
                  }}
                ></div>
              </div>
             
              <h6 className="fw-bold mb-1" style={{ fontSize: "1.05rem" }}>
                {membreInfo.nom}
              </h6>
              <div className="small mb-3" style={{ opacity: 0.7, fontSize: "0.85rem" }}>
                {membreInfo.email}
              </div>
              <div 
                className="d-inline-flex align-items-center px-3 py-1 rounded-pill"
                style={{
                  background: `${colors.primary}20`,
                  border: `1px solid ${colors.primary}40`,
                  fontSize: "0.8rem",
                  fontWeight: "500"
                }}
              >
                <i className="fas fa-star me-2" style={{ color: colors.primary, fontSize: "0.7rem" }}></i>
                Membre Premium
              </div>
            </div>
          )}
        </div>

        {/* Navigation Menu */}
        <div 
          className="flex-grow-1 p-3" 
          style={{ overflowY: "auto", overflowX: "hidden" }}
        >
          <Nav className="flex-column gap-1">
            {menuItems.map((item) => {
              const isActive = activeItem === item.path;
              return (
                <Nav.Item 
                  key={item.path}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                  style={{ position: "relative" }}
                >
                  <Link
                    className="nav-link text-decoration-none d-flex align-items-center"
                    to={item.path}
                    style={{
                      color: isActive ? "#FFFFFF" : "#CBD5E1",
                      background: isActive ? `${colors.primary}25` : "transparent",
                      border: isActive ? `1px solid ${colors.primary}40` : "1px solid transparent",
                      borderRadius: "10px",
                      padding: "12px 16px",
                      transition: "all 0.25s ease",
                      position: "relative"
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "rgba(255, 255, 255, 0.04)";
                        e.currentTarget.style.transform = "translateX(4px)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.transform = "translateX(0)";
                      }
                    }}
                  >
                    {/* Active Indicator */}
                    {isActive && (
                      <div
                        className="position-absolute"
                        style={{
                          left: "0",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "3px",
                          height: "20px",
                          background: colors.primary,
                          borderRadius: "0 2px 2px 0"
                        }}
                      ></div>
                    )}
                   
                    <i 
                      className={`${item.icon} ${shouldShowContent ? 'me-3' : ''}`} 
                      style={{
                        fontSize: "1rem",
                        color: isActive ? colors.primary : colors.neutral,
                        minWidth: "20px",
                        textAlign: "center"
                      }}
                    ></i>
                   
                    {shouldShowContent && (
                      <span className="fw-medium" style={{ fontSize: "0.92rem" }}>
                        {item.label}
                      </span>
                    )}
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {!shouldShowContent && hoveredItem === item.path && (
                    <div
                      className="position-absolute"
                      style={{
                        left: "90px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: colors.dark,
                        border: `1px solid ${colors.primary}40`,
                        borderRadius: "8px",
                        padding: "8px 16px",
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        whiteSpace: "nowrap",
                        zIndex: 1000,
                        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.3)"
                      }}
                    >
                      {item.label}
                    </div>
                  )}
                </Nav.Item>
              );
            })}
          </Nav>
        </div>

        {/* Footer */}
        <div 
          className="p-3 mt-auto" 
          style={{
            borderTop: `1px solid rgba(91, 17, 238, 0.15)`,
            background: "rgba(0, 0, 0, 0.2)"
          }}
        >
          {/* Bouton de traduction ajouté ici */}
          {shouldShowContent && (
            <div className="mb-3 d-flex justify-content-center">
              <LanguageSwitcher />
            </div>
          )}

          {shouldShowContent && (
            <div className="mb-3">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="small" style={{ opacity: 0.7, fontSize: "0.8rem" }}>Activité</span>
                <span className="small fw-medium" style={{ fontSize: "0.8rem" }}>78%</span>
              </div>
              <div 
                className="progress" 
                style={{
                  height: "4px",
                  background: "rgba(255, 255, 255, 0.08)",
                  borderRadius: "2px"
                }}
              >
                <div
                  className="progress-bar"
                  style={{
                    background: `linear-gradient(90deg, ${colors.primary}, ${colors.accent})`,
                    width: "78%",
                    transition: "width 1s ease"
                  }}
                ></div>
              </div>
            </div>
          )}
         
          <button
            onClick={() => setShowLogoutModal(true)}
            className="btn w-100 d-flex align-items-center justify-content-center"
            style={{
              background: "rgba(239, 68, 68, 0.1)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              borderRadius: "10px",
              padding: "12px",
              color: "#FCA5A5",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.2)";
              e.currentTarget.style.color = "#F87171";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.color = "#FCA5A5";
            }}
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            {shouldShowContent && <span className="fw-medium">Déconnexion</span>}
          </button>

          {shouldShowContent && (
            <div className="text-center mt-3 small" style={{ opacity: 0.5, fontSize: "0.75rem" }}>
              © 2025 CEDII • v2.1.0
            </div>
          )}
        </div>
      </div>

      {/* Logout Modal */}
      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
        backdrop="static"
      >
        <Modal.Body 
          className="p-0" 
          style={{
            background: `linear-gradient(135deg, ${colors.dark}, ${colors.secondary})`,
            borderRadius: "16px",
            color: "white"
          }}
        >
          <div className="p-5 text-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4"
              style={{
                width: "80px",
                height: "80px",
                background: "rgba(239, 68, 68, 0.15)",
                border: "2px solid rgba(239, 68, 68, 0.3)"
              }}
            >
              <i className="fas fa-door-open text-danger fs-2"></i>
            </div>
           
            <h4 className="fw-bold mb-3">Confirmer la déconnexion</h4>
            <p className="mb-4" style={{ opacity: 0.8 }}>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>

            <div className="d-flex gap-3">
              <Button
                variant="outline-light"
                onClick={() => setShowLogoutModal(false)}
                className="flex-fill py-2"
                style={{
                  borderRadius: "10px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                Annuler
              </Button>
             
              <Button
                onClick={handleLogoutConfirm}
                className="flex-fill py-2"
                style={{
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, #EF4444, #DC2626)",
                  border: "none",
                  transition: "all 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = "translateY(-2px)"}
                onMouseLeave={(e) => e.currentTarget.style.transform = "translateY(0)"}
              >
                Se déconnecter
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Custom Styles */}
      <style jsx="true">{`
        ::-webkit-scrollbar {
          width: 5px;
        }
       
        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
       
        ::-webkit-scrollbar-thumb {
          background: ${colors.primary}60;
          border-radius: 10px;
        }
       
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.primary};
        }

        .tooltip-inner {
          background: ${colors.dark} !important;
          border: 1px solid ${colors.primary}40;
          border-radius: 8px !important;
        }

        .nav-link {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
      `}</style>
    </>
  );
};

export default MembreSidebar;