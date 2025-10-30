import React, { useState, useEffect } from "react";
import { Card, Button, ListGroup, Row, Col, Badge, Alert, Dropdown } from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";

const NotificationAdmin = () => {
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      type: "info", 
      message: "Nouvel utilisateur inscrit : Marie Dubois", 
      date: "2025-09-20 14:30", 
      read: false,
      icon: "fa-user-plus"
    },
    { 
      id: 2, 
      type: "warning", 
      message: "Membre suspendu : Société B - Raison : Inactivité prolongée", 
      date: "2025-09-21 09:15", 
      read: true,
      icon: "fa-user-slash"
    },
    { 
      id: 3, 
      type: "success", 
      message: "Publication validée : 'Nouveaux équipements disponibles'", 
      date: "2025-09-22 11:45", 
      read: false,
      icon: "fa-check-circle"
    },
    { 
      id: 4, 
      type: "danger", 
      message: "Appel d'offre expiré : Développement plateforme web", 
      date: "2025-09-22 16:20", 
      read: false,
      icon: "fa-exclamation-triangle"
    },
    { 
      id: 5, 
      type: "primary", 
      message: "Nouveau message reçu de : Entreprise Tech Solutions", 
      date: "2025-09-23 08:30", 
      read: true,
      icon: "fa-envelope"
    },
    { 
      id: 6, 
      type: "success", 
      message: "Événement créé avec succès : Conférence annuelle 2025", 
      date: "2025-09-23 10:00", 
      read: false,
      icon: "fa-calendar-check"
    },
  ]);

  const [filterType, setFilterType] = useState("Tous");
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);

  // Afficher messages temporairement
  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: "", message: "" });
    }, 4000);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setLoading(false);
      showNotification("success", "✅ Toutes les notifications marquées comme lues");
    }, 500);
  };

  const clearNotifications = () => {
    setLoading(true);
    setTimeout(() => {
      setNotifications([]);
      setLoading(false);
      showNotification("success", "✅ Toutes les notifications ont été supprimées");
    }, 500);
  };

  const deleteNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
    showNotification("success", "✅ Notification supprimée");
  };

  const getTypeVariant = (type) => {
    switch(type) {
      case "success": return "success";
      case "warning": return "warning";
      case "danger": return "danger";
      case "info": return "info";
      case "primary": return "primary";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "success": return "fa-check-circle";
      case "warning": return "fa-exclamation-triangle";
      case "danger": return "fa-times-circle";
      case "info": return "fa-info-circle";
      case "primary": return "fa-bell";
      default: return "fa-bell";
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffHours < 24) return `Il y a ${diffHours} h`;
    if (diffDays < 7) return `Il y a ${diffDays} j`;
    
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notif => {
    return filterType === "Tous" || notif.type === filterType;
  });

  const unreadCount = notifications.filter(notif => !notif.read).length;

  // Statistiques par type
  const stats = {
    total: notifications.length,
    unread: unreadCount,
    success: notifications.filter(n => n.type === "success").length,
    warning: notifications.filter(n => n.type === "warning").length,
    danger: notifications.filter(n => n.type === "danger").length,
    info: notifications.filter(n => n.type === "info").length,
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* Alert Notification */}
        {showAlert.show && (
          <Alert 
            variant={showAlert.type === "success" ? "success" : "danger"}
            className="d-flex align-items-center shadow-lg border-0"
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1050,
              minWidth: "350px",
              borderRadius: "15px",
              borderLeft: `4px solid ${showAlert.type === "success" ? "#28a745" : "#dc3545"}`,
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.95)"
            }}
          >
            <i className={`fas ${
              showAlert.type === "success" ? "fa-check-circle text-success" : "fa-exclamation-triangle text-danger"
            } me-3 fs-5`}></i>
            <div>
              <strong className="d-block">
                {showAlert.type === "success" ? "Succès" : "Erreur"}
              </strong>
              <span className="text-muted">{showAlert.message}</span>
            </div>
          </Alert>
        )}

        {/* En-tête de page */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ 
              background: "linear-gradient(135deg, #2c3e50, #34495e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Centre de Notifications
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-bell me-2"></i>
              Restez informé des activités de votre plateforme
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {unreadCount > 0 && (
              <Badge 
                bg="danger" 
                className="d-flex align-items-center"
                style={{ 
                  borderRadius: "20px", 
                  padding: "8px 12px",
                  fontSize: "0.8rem"
                }}
              >
                <i className="fas fa-bell me-1"></i>
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Dropdown>
              <Dropdown.Toggle 
                variant="outline-primary" 
                className="d-flex align-items-center"
                style={{ borderRadius: "10px" }}
              >
                <i className="fas fa-sliders-h me-2"></i>
                Actions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={markAllAsRead}>
                  <i className="fas fa-check-double me-2 text-success"></i>
                  Tout marquer comme lu
                </Dropdown.Item>
                <Dropdown.Item onClick={clearNotifications}>
                  <i className="fas fa-trash me-2 text-danger"></i>
                  Tout supprimer
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          {[
            { 
              title: "Total Notifications", 
              count: stats.total, 
              icon: "fa-bell", 
              color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            { 
              title: "Non Lus", 
              count: stats.unread, 
              icon: "fa-envelope", 
              color: "linear-gradient(135deg, #00b09b, #96c93d)"
            },
            { 
              title: "Succès", 
              count: stats.success, 
              icon: "fa-check-circle", 
              color: "linear-gradient(135deg, #4facfe, #00f2fe)"
            },
            { 
              title: "Alertes", 
              count: stats.warning + stats.danger, 
              icon: "fa-exclamation-triangle", 
              color: "linear-gradient(135deg, #f093fb, #f5576c)"
            }
          ].map((stat, index) => (
            <Col md={3} key={index} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2">{stat.title}</h6>
                      <h2 className="fw-bold mb-0" style={{ 
                        background: stat.color,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}>
                        {stat.count}
                      </h2>
                    </div>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: "60px", 
                        height: "60px",
                        background: stat.color
                      }}
                    >
                      <i className={`fas ${stat.icon} text-white fs-4`}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filtres et actions */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <Row className="g-3 align-items-center">
              <Col md={6}>
                <div className="d-flex gap-2 flex-wrap">
                  <Button 
                    variant={filterType === "Tous" ? "primary" : "outline-primary"}
                    onClick={() => setFilterType("Tous")}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "20px" }}
                  >
                    <i className="fas fa-layer-group me-2"></i>
                    Tous
                  </Button>
                  <Button 
                    variant={filterType === "success" ? "success" : "outline-success"}
                    onClick={() => setFilterType("success")}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "20px" }}
                  >
                    <i className="fas fa-check-circle me-2"></i>
                    Succès
                  </Button>
                  <Button 
                    variant={filterType === "warning" ? "warning" : "outline-warning"}
                    onClick={() => setFilterType("warning")}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "20px" }}
                  >
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Avertissements
                  </Button>
                  <Button 
                    variant={filterType === "danger" ? "danger" : "outline-danger"}
                    onClick={() => setFilterType("danger")}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "20px" }}
                  >
                    <i className="fas fa-times-circle me-2"></i>
                    Alertes
                  </Button>
                  <Button 
                    variant={filterType === "info" ? "info" : "outline-info"}
                    onClick={() => setFilterType("info")}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "20px" }}
                  >
                    <i className="fas fa-info-circle me-2"></i>
                    Informations
                  </Button>
                </div>
              </Col>
              <Col md={6} className="text-end">
                <div className="d-flex gap-2 justify-content-end">
                  <Button 
                    variant="outline-success" 
                    onClick={markAllAsRead}
                    disabled={unreadCount === 0 || loading}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-check-double me-2"></i>
                    {loading ? "Traitement..." : "Tout marquer comme lu"}
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    onClick={clearNotifications}
                    disabled={notifications.length === 0 || loading}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-trash me-2"></i>
                    {loading ? "Suppression..." : "Tout supprimer"}
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Liste des notifications */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-0">
            <div className="p-4 border-bottom">
              <h5 className="fw-bold mb-0 d-flex align-items-center">
                <i className="fas fa-bell me-2 text-primary"></i>
                Notifications Récentes
                <Badge bg="primary" className="ms-2">
                  {filteredNotifications.length}
                </Badge>
              </h5>
            </div>
            
            {filteredNotifications.length > 0 ? (
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {filteredNotifications.map((notif) => (
                    <ListGroup.Item
                      key={notif.id}
                      className="border-0"
                      style={{
                        background: notif.read ? "var(--bg-secondary)" : "rgba(231, 241, 255, 0.5)",
                        borderLeft: notif.read ? "4px solid transparent" : "4px solid #007bff",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                        padding: "20px",
                        position: "relative"
                      }}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-start flex-grow-1">
                          <div 
                            className="rounded-circle d-flex align-items-center justify-content-center me-3 mt-1"
                            style={{ 
                              width: "40px", 
                              height: "40px",
                              background: `linear-gradient(135deg, var(--bs-${getTypeVariant(notif.type)}), #6c757d)`,
                              color: "white",
                              flexShrink: 0
                            }}
                          >
                            <i className={`fas ${notif.icon || getTypeIcon(notif.type)}`}></i>
                          </div>
                          
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <Badge 
                                bg={getTypeVariant(notif.type)}
                                className="d-flex align-items-center me-2"
                                style={{ 
                                  borderRadius: "15px",
                                  fontSize: "0.7rem",
                                  padding: "4px 8px"
                                }}
                              >
                                <i className={`fas ${getTypeIcon(notif.type)} me-1`}></i>
                                {notif.type.toUpperCase()}
                              </Badge>
                              {!notif.read && (
                                <div 
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: "#28a745",
                                    display: "inline-block"
                                  }}
                                ></div>
                              )}
                            </div>
                            
                            <p className="mb-2 fw-semibold" style={{ lineHeight: "1.4" }}>
                              {notif.message}
                            </p>
                            
                            <small className="text-muted d-flex align-items-center">
                              <i className="fas fa-clock me-1"></i>
                              {formatDateTime(notif.date)}
                            </small>
                          </div>
                        </div>
                        
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notif.id);
                          }}
                          className="d-flex align-items-center ms-2"
                          style={{ borderRadius: "8px", flexShrink: 0 }}
                        >
                          <i className="fas fa-times"></i>
                        </Button>
                      </div>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </div>
            ) : (
              <div className="text-center py-5">
                <i className="fas fa-bell-slash fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
                <h5 className="text-muted mb-2">Aucune notification</h5>
                <p className="text-muted mb-0">
                  {filterType === "Tous" 
                    ? "Toutes vos notifications sont à jour" 
                    : `Aucune notification de type ${filterType}`
                  }
                </p>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default NotificationAdmin;