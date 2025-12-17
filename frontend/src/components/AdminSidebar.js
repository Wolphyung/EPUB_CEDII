import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from 'react-i18next'; 
import LanguageSwitcher from "./LanguageSwitcher"; 

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation(); 
  
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeItem, setActiveItem] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredItem, setHoveredItem] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Palette CEDII 2025
  const colors = {
    primary: "#5B11EE",
    secondary: "#0405BF",
    dark: "#02061E",
    accent: "#0671B6",
    neutral: "#5E5E5E"
  };

  useEffect(() => {
    const path = location.pathname;
    setActiveItem(path);
  }, [location]);

  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const applyTheme = (darkMode) => {
    if (darkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.style.background = `linear-gradient(135deg, ${colors.dark} 0%, #1a1a2e 100%)`;
      document.body.style.color = "#ffffff";
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.body.style.background = "linear-gradient(135deg, #f5f7fa 0%, #e8ecf1 100%)";
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
    localStorage.removeItem("theme");
    localStorage.removeItem("i18nextLng");
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const menuItems = [
    { path: "/dashAdmin", icon: "fas fa-tachometer-alt", labelKey: "menu_dashboard" },
    { path: "/pubAdmin", icon: "fas fa-bullhorn", labelKey: "menu_publication" },
    { path: "/adminEv", icon: "fas fa-calendar-alt", labelKey: "menu_event" },
    { path: "/appeloffreAdmin", icon: "fas fa-file-contract", labelKey: "menu_call_for_tender" },
    { path: "/membreAdmin", icon: "fas fa-users", labelKey: "menu_member" },
    { path: "/abonnementAdmin", icon: "fas fa-crown", labelKey: "Abonnement" },
    { path: "/messageAdmin", icon: "fas fa-comments", labelKey: "menu_messages" },
  ];

  const sidebarWidth = isCollapsed && !isHovered ? "80px" : "280px";
  const shouldShowContent = !isCollapsed || isHovered;

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
            background: `linear-gradient(135deg, ${colors.primary}15 0%, transparent 100%)`,
            position: "relative"
          }}
        >
          {/* Status Indicator */}
          <div 
            className="position-absolute"
            style={{
              top: "20px",
              left: "15px",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#00d664",
              boxShadow: "0 0 12px #00d664",
              animation: "pulse 2s infinite"
            }}
          ></div>

          <div className="d-flex align-items-center justify-content-between mb-3">
            {shouldShowContent && (
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center overflow-hidden"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
                    boxShadow: `0 4px 16px ${colors.primary}40`,
                    padding: "2px"
                  }}
                >
                  <img 
                    src="/images/logo.jpg" 
                    alt="Logo" 
                    style={{
                      width: "100%",
                      height: "100%",
                      borderRadius: "50%"
                    }}
                  />
                </div>
                <div>
                  <div className="fw-bold" style={{ 
                    fontSize: "1.15rem", 
                    letterSpacing: "0.5px",
                    background: "linear-gradient(135deg, #fff, #a8c0ff)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent"
                  }}>
                    {t('admin_panel_title')}
                  </div>
                  <div style={{ fontSize: "0.7rem", opacity: 0.7 }}>
                    {t('admin_role_label')}
                  </div>
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
                transition: "all 0.3s ease",
                position: shouldShowContent ? "relative" : "absolute",
                top: shouldShowContent ? "auto" : "20px",
                right: shouldShowContent ? "auto" : "15px"
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"}
            >
              <i className={`fas fa-chevron-${isCollapsed ? "right" : "left"}`} style={{ fontSize: "0.85rem" }}></i>
            </button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div 
          className="flex-grow-1 p-3" 
          style={{ 
            overflowY: "auto", 
            overflowX: "hidden"
          }}
        >
          <ul className="nav flex-column" style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {menuItems.map((item, index) => {
              const isActive = activeItem === item.path;
              return (
                <li 
                  key={item.path} 
                  className="nav-item"
                  style={{ 
                    marginBottom: "4px",
                    position: "relative",
                    animation: `slideIn 0.3s ease-out ${index * 0.05}s backwards`
                  }}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Link
                    className="nav-link text-white d-flex align-items-center text-decoration-none"
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
                        {t(item.labelKey)}
                      </span>
                    )}

                    {/* Active dot indicator */}
                    {isActive && (
                      <div 
                        className="position-absolute"
                        style={{
                          right: "12px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          backgroundColor: colors.primary,
                          boxShadow: `0 0 10px ${colors.primary}`
                        }}
                      ></div>
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
                      {t(item.labelKey)}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer Section */}
        <div 
          className="p-3" 
          style={{
            borderTop: `1px solid rgba(91, 17, 238, 0.15)`,
            background: "rgba(0, 0, 0, 0.2)"
          }}
        >
          {/* Language Switcher */}
          <div className="mb-3 text-center">
            <LanguageSwitcher />
          </div>
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="btn w-100 d-flex align-items-center justify-content-center mb-3"
            style={{
              background: `linear-gradient(135deg, ${colors.accent}25, ${colors.primary}25)`,
              border: `1px solid ${colors.accent}40`,
              borderRadius: "10px",
              padding: "12px",
              color: "#FFF",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.accent}35, ${colors.primary}35)`;
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${colors.accent}25, ${colors.primary}25)`;
              e.currentTarget.style.transform = "translateY(0)";
            }}
            title={isDarkMode ? t('theme_light_mode') : t('theme_dark_mode')}
          >
            <i 
              className={`fas ${isDarkMode ? "fa-sun" : "fa-moon"}`} 
              style={{ 
                marginRight: shouldShowContent ? "8px" : "0", 
                fontSize: shouldShowContent ? "1rem" : "1.25rem"
              }}
            ></i>
            {shouldShowContent && (
              <span className="fw-medium" style={{ fontSize: "0.92rem" }}>
                {t(isDarkMode ? 'theme_light_mode' : 'theme_dark_mode')}
              </span>
            )}
          </button>

          {/* Logout Button */}
          <button
            onClick={handleLogoutClick}
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
              e.currentTarget.style.transform = "translateY(-2px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)";
              e.currentTarget.style.color = "#FCA5A5";
              e.currentTarget.style.transform = "translateY(0)";
            }}
            title={t('logout_button')}
          >
            <i 
              className="fas fa-sign-out-alt" 
              style={{
                marginRight: shouldShowContent ? "8px" : "0",
                fontSize: shouldShowContent ? "1rem" : "1.25rem"
              }}
            ></i>
            {shouldShowContent && (
              <span className="fw-medium" style={{ fontSize: "0.92rem" }}>
                {t('logout_button')}
              </span>
            )}
          </button>

          {/* Version Badge */}
          {shouldShowContent && (
            <div className="text-center mt-3">
              <span 
                className="badge px-3 py-2"
                style={{ 
                  background: "rgba(255, 255, 255, 0.05)",
                  color: "rgba(255, 255, 255, 0.5)",
                  borderRadius: "20px",
                  fontSize: "0.75rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)"
                }}
              >
                v2.1.0 • CEDII
              </span>
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
           
            <h4 className="fw-bold mb-2" style={{ 
              fontSize: "1.5rem",
              background: "linear-gradient(135deg, #FFFFFF 0%, #FCA5A5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {t('logout_modal_title')}
            </h4>
            
            <p className="mb-4" style={{ opacity: 0.8, lineHeight: "1.6" }}>
              {t('logout_modal_message')}
            </p>

            {/* Security Note */}
            <div 
              className="alert mb-4" 
              role="alert" 
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid rgba(255, 255, 255, 0.08)",
                borderRadius: "12px",
                color: "#CBD5E1",
                textAlign: "left"
              }}
            >
              <div className="d-flex">
                <i className="fas fa-shield-alt me-3 mt-1" style={{ opacity: 0.7 }}></i>
                <div>
                  <strong>{t('security_note')}</strong>
                  <div className="small mt-1" style={{ opacity: 0.8 }}>
                    {t('logout_security_warning')}
                  </div>
                </div>
              </div>
            </div>

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
                <i className="fas fa-times me-2"></i>
                {t('cancel_button')}
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
                <i className="fas fa-sign-out-alt me-2"></i>
                {t('logout_button')}
              </Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>

      {/* Custom Styles */}
      <style jsx="true">{`
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1); 
            opacity: 1; 
          }
          50% { 
            transform: scale(1.1); 
            opacity: 0.8; 
          }
        }

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

        .modal-content {
          border-radius: 20px !important;
          border: none !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2) !important;
        }

        .modal-backdrop {
          background-color: rgba(0, 0, 0, 0.5) !important;
        }

        body, .card, .form-control, .form-select, .table {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default AdminSidebar;