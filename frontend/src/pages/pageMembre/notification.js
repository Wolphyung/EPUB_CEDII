import React, { useState, useEffect } from "react";
import { Card, Button, Badge, Alert, Row, Col } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

const NotificationMembre = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: "info", 
      icon: "fas fa-user-check",
      message: "Votre profil a été mis à jour avec succès", 
      description: "Vos informations personnelles ont été actualisées dans notre système",
      lu: false,
      date: "2025-01-15",
      time: "10:30"
    },
    { 
      id: 2, 
      type: "success", 
      icon: "fas fa-check-circle",
      message: "Nouvelle publication validée", 
      description: "Votre article 'Les tendances tech 2025' a été approuvé et publié",
      lu: false,
      date: "2025-01-15",
      time: "09:15"
    },
    { 
      id: 3, 
      type: "warning", 
      icon: "fas fa-exclamation-triangle",
      message: "Votre abonnement expire bientôt", 
      description: "Votre abonnement premium expire dans 7 jours. Renouvelez-le pour continuer à bénéficier de tous les avantages",
      lu: false,
      date: "2025-01-14",
      time: "16:45"
    },
    { 
      id: 4, 
      type: "danger", 
      icon: "fas fa-shield-alt",
      message: "Tentative de connexion suspecte", 
      description: "Une tentative de connexion depuis un nouvel appareil a été détectée. Si ce n'était pas vous, veuillez changer votre mot de passe",
      lu: false,
      date: "2025-01-14",
      time: "14:20"
    },
    { 
      id: 5, 
      type: "success", 
      icon: "fas fa-calendar-check",
      message: "Événement confirmé", 
      description: "Votre participation au 'Forum Innovation 2025' a été confirmée",
      lu: true,
      date: "2025-01-13",
      time: "11:00"
    },
    { 
      id: 6, 
      type: "info", 
      icon: "fas fa-bell",
      message: "Nouveau message reçu", 
      description: "Vous avez reçu un nouveau message de l'administrateur du système",
      lu: true,
      date: "2025-01-12",
      time: "15:30"
    }
  ]);

  // Gérer l'état de la sidebar
  const handleSidebarCollapse = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, lu: true } : notif
      )
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(
      notifications.map((notif) => ({ ...notif, lu: true }))
    );
  };

  const handleDelete = (id) => {
    setNotifications(notifications.filter((notif) => notif.id !== id));
  };

  const handleDeleteAllRead = () => {
    setNotifications(notifications.filter((notif) => !notif.lu));
  };

  const getNotificationStyle = (type) => {
    const styles = {
      info: {
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        border: "none",
        color: "white"
      },
      success: {
        background: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        border: "none",
        color: "white"
      },
      warning: {
        background: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        border: "none",
        color: "white"
      },
      danger: {
        background: "linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)",
        border: "none",
        color: "white"
      }
    };
    return styles[type] || styles.info;
  };

  const getNotificationIcon = (type) => {
    const icons = {
      info: "fas fa-info-circle",
      success: "fas fa-check-circle",
      warning: "fas fa-exclamation-triangle",
      danger: "fas fa-exclamation-circle"
    };
    return icons[type] || "fas fa-bell";
  };

  const formatDate = (dateString, timeString) => {
    const today = new Date().toDateString();
    const notificationDate = new Date(dateString).toDateString();
    
    if (today === notificationDate) {
      return `Aujourd'hui à ${timeString}`;
    }
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (yesterday.toDateString() === notificationDate) {
      return `Hier à ${timeString}`;
    }
    
    const options = { day: 'numeric', month: 'long' };
    return `${new Date(dateString).toLocaleDateString('fr-FR', options)} à ${timeString}`;
  };

  const unreadCount = notifications.filter(notif => !notif.lu).length;

  return (
    <div className="d-flex min-vh-100" style={{ 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarCollapsed ? "80px" : "280px",
        transition: "width 0.3s ease",
        flexShrink: 0
      }}>
        <MembreSidebar onCollapse={handleSidebarCollapse} />
      </div>

      {/* Contenu Principal */}
      <div className="flex-grow-1" style={{ 
        padding: "30px",
        marginLeft: "0",
        transition: "all 0.3s ease"
      }}>
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-2" style={{ 
              color: "#2c3e50",
              fontSize: "2.2rem"
            }}>
              🔔 Notifications
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
              Restez informé de toutes vos activités
            </p>
          </div>
          <div className="d-flex gap-3">
            <Badge 
              bg="primary" 
              className="px-3 py-2 d-flex align-items-center"
              style={{ 
                borderRadius: "20px",
                fontSize: "0.9rem"
              }}
            >
              <i className="fas fa-bell me-2"></i>
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </Badge>
            <Button 
              variant="outline-primary"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="rounded-pill px-4"
            >
              <i className="fas fa-check-double me-2"></i>
              Tout marquer comme lu
            </Button>
            <Button 
              variant="outline-danger"
              onClick={handleDeleteAllRead}
              className="rounded-pill px-4"
            >
              <i className="fas fa-trash me-2"></i>
              Supprimer les lues
            </Button>
          </div>
        </div>

        {/* Statistiques rapides */}
        <Row className="mb-5">
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-bell text-primary fs-4"></i>
              </div>
              <h3 className="fw-bold text-primary">{notifications.length}</h3>
              <p className="text-muted mb-0">Total notifications</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-envelope text-warning fs-4"></i>
              </div>
              <h3 className="fw-bold text-warning">{unreadCount}</h3>
              <p className="text-muted mb-0">Non lues</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-check-circle text-success fs-4"></i>
              </div>
              <h3 className="fw-bold text-success">{notifications.filter(n => n.lu).length}</h3>
              <p className="text-muted mb-0">Lues</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-history text-info fs-4"></i>
              </div>
              <h3 className="fw-bold text-info">{notifications.filter(n => n.type === 'warning' || n.type === 'danger').length}</h3>
              <p className="text-muted mb-0">Alertes importantes</p>
            </Card>
          </Col>
        </Row>

        {/* Liste des notifications */}
        <div className="row">
          <div className="col-12">
            {notifications.length === 0 ? (
              <Card 
                className="shadow-lg border-0 text-center p-5"
                style={{ borderRadius: "20px" }}
              >
                <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{ width: "80px", height: "80px" }}>
                  <i className="fas fa-bell-slash text-muted fs-2"></i>
                </div>
                <h4 className="fw-bold text-muted mb-3">Aucune notification</h4>
                <p className="text-muted mb-0">
                  Vous êtes à jour ! Aucune notification en attente.
                </p>
              </Card>
            ) : (
              <div className="d-flex flex-column gap-4">
                {notifications.map((notif) => (
                  <Card 
                    key={notif.id}
                    className={`shadow-lg border-0 ${notif.lu ? 'opacity-75' : ''}`}
                    style={{ 
                      borderRadius: "20px",
                      transition: "all 0.3s ease",
                      ...getNotificationStyle(notif.type)
                    }}
                    onMouseEnter={(e) => {
                      if (!notif.lu) {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.15)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!notif.lu) {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
                      }
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex align-items-start">
                        {/* Icône de notification */}
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-4 flex-shrink-0"
                          style={{
                            width: "60px",
                            height: "60px",
                            background: "rgba(255, 255, 255, 0.2)",
                            fontSize: "1.5rem"
                          }}
                        >
                          <i className={notif.icon}></i>
                        </div>

                        {/* Contenu de la notification */}
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h5 className="fw-bold mb-0">
                              {notif.message}
                            </h5>
                            {!notif.lu && (
                              <Badge 
                                bg="light" 
                                text="dark"
                                className="px-3 py-2"
                                style={{ borderRadius: "15px", fontSize: "0.8rem" }}
                              >
                                <i className="fas fa-circle me-1 text-primary" style={{ fontSize: "0.5rem" }}></i>
                                Nouveau
                              </Badge>
                            )}
                          </div>
                          
                          <p className="mb-3" style={{ opacity: 0.9, lineHeight: "1.5" }}>
                            {notif.description}
                          </p>

                          <div className="d-flex justify-content-between align-items-center">
                            <small style={{ opacity: 0.8 }}>
                              <i className="fas fa-clock me-1"></i>
                              {formatDate(notif.date, notif.time)}
                            </small>
                            
                            <div className="d-flex gap-2">
                              {!notif.lu && (
                                <Button 
                                  size="sm"
                                  variant="light"
                                  onClick={() => handleMarkAsRead(notif.id)}
                                  className="rounded-pill px-3"
                                >
                                  <i className="fas fa-check me-1"></i>
                                  Marquer comme lu
                                </Button>
                              )}
                              <Button 
                                size="sm"
                                variant="light"
                                onClick={() => handleDelete(notif.id)}
                                className="rounded-pill px-3"
                              >
                                <i className="fas fa-trash me-1"></i>
                                Supprimer
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Section d'information */}
        {unreadCount > 0 && (
          <Alert 
            variant="info" 
            className="mt-4 border-0 shadow"
            style={{ borderRadius: "15px" }}
          >
            <div className="d-flex align-items-center">
              <i className="fas fa-info-circle me-3 fs-4"></i>
              <div>
                <h6 className="fw-bold mb-1">Vous avez {unreadCount} notification{unreadCount > 1 ? 's' : ''} non lue{unreadCount > 1 ? 's' : ''}</h6>
                <p className="mb-0">Restez informé des dernières mises à jour et activités importantes.</p>
              </div>
            </div>
          </Alert>
        )}
      </div>

      {/* Styles CSS supplémentaires */}
      <style>
        {`
          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .btn {
            transition: all 0.3s ease;
          }
          
          .btn:hover {
            transform: translateY(-1px);
          }
          
          .opacity-75 {
            opacity: 0.75 !important;
          }
          
          /* Animation pour les nouvelles notifications */
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.02); }
            100% { transform: scale(1); }
          }
          
          .card:not(.opacity-75) {
            animation: pulse 2s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default NotificationMembre;