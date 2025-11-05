import React, { useState, useEffect } from "react";
import { Card, Button, ListGroup, Row, Col, Badge, Alert, Dropdown } from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const NotificationAdmin = () => {
  const [notifications, setNotifications] = useState([]);
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

  // CORRECTION : Utiliser la bonne URL sans "/admin"
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      console.log("Tentative de chargement des notifications...");
      const res = await axios.get(`${API_URL}/notifications`);
      console.log("Réponse reçue:", res.data);
      setNotifications(res.data.data || res.data || []);
    } catch (err) {
      console.error("Erreur détaillée:", err.response?.data || err.message);
      
      // Données mockées en attendant
      const mockNotifications = [
        { 
          id: 1, 
          type: "publication", 
          message: "Nouvelle publication créée : 'Guide des bonnes pratiques' - En attente de validation", 
          organisation_name: "Entreprise ABC",
          created_at: new Date().toISOString(),
          read: false
        },
        { 
          id: 2, 
          type: "evenement", 
          message: "Nouvel événement créé : 'Conférence annuelle 2024' - En attente de validation", 
          organisation_name: "Société XYZ",
          created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false
        },
        { 
          id: 3, 
          type: "appel_offre", 
          message: "Nouvel appel d'offre créé : 'Développement application mobile' - En attente de validation", 
          organisation_name: "Startup Innov",
          created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true
        }
      ];
      
      setNotifications(mockNotifications);
      showNotification("warning", "Mode démo : Données de test affichées");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // Fonctions mockées pour le moment
  const markAsRead = async (id) => {
    try {
      await axios.put(`${API_URL}/notifications/${id}/read`);
    } catch (err) {
      console.log("API non disponible, mise à jour locale");
    }
    
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      await axios.put(`${API_URL}/notifications/mark-all-read`);
    } catch (err) {
      console.log("API non disponible, mise à jour locale");
    }
    
    setTimeout(() => {
      setNotifications(notifications.map(notif => ({ ...notif, read: true })));
      setLoading(false);
      showNotification("success", "✅ Toutes les notifications marquées comme lues");
    }, 500);
  };

  const clearNotifications = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/notifications/clear`);
    } catch (err) {
      console.log("API non disponible, mise à jour locale");
    }
    
    setTimeout(() => {
      setNotifications([]);
      setLoading(false);
      showNotification("success", "✅ Toutes les notifications ont été supprimées");
    }, 500);
  };

  const deleteNotification = async (id) => {
    try {
      await axios.delete(`${API_URL}/notifications/${id}`);
    } catch (err) {
      console.log("API non disponible, mise à jour locale");
    }
    
    setNotifications(notifications.filter(notif => notif.id !== id));
    showNotification("success", "✅ Notification supprimée");
  };

  // ... le reste de votre code reste inchangé
  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    switch(notification.type) {
      case "publication":
        window.location.href = `/admin/publications`;
        break;
      case "evenement":
        window.location.href = `/admin/evenements`;
        break;
      case "appel_offre":
        window.location.href = `/admin/appels-offre`;
        break;
      case "membre":
        window.location.href = `/admin/membres`;
        break;
      default:
        break;
    }
  };

  const getTypeVariant = (type) => {
    switch(type) {
      case "publication": return "info";
      case "evenement": return "warning";
      case "appel_offre": return "primary";
      case "membre": return "success";
      default: return "secondary";
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "publication": return "fa-file-alt";
      case "evenement": return "fa-calendar-alt";
      case "appel_offre": return "fa-gavel";
      case "membre": return "fa-user-plus";
      default: return "fa-bell";
    }
  };

  const getTypeLabel = (type) => {
    switch(type) {
      case "publication": return "PUBLICATION";
      case "evenement": return "ÉVÉNEMENT";
      case "appel_offre": return "APPEL D'OFFRE";
      case "membre": return "MEMBRE";
      default: return type.toUpperCase();
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
    publication: notifications.filter(n => n.type === "publication").length,
    evenement: notifications.filter(n => n.type === "evenement").length,
    appel_offre: notifications.filter(n => n.type === "appel_offre").length,
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* Alert Notification */}
        {showAlert.show && (
          <Alert 
            variant={showAlert.type === "success" ? "success" : showAlert.type === "warning" ? "warning" : "danger"}
            className="d-flex align-items-center"
          >
            <i className={`fas ${
              showAlert.type === "success" ? "fa-check-circle" : 
              showAlert.type === "warning" ? "fa-exclamation-triangle" : "fa-exclamation-triangle"
            } me-2`}></i>
            {showAlert.message}
          </Alert>
        )}

        {/* En-tête de page */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2">Centre de Notifications</h2>
            <p className="text-muted mb-0">
              <i className="fas fa-bell me-2"></i>
              Restez informé des activités de votre plateforme
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {unreadCount > 0 && (
              <Badge bg="danger" className="fs-6">
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Dropdown>
              <Dropdown.Toggle variant="outline-primary">
                <i className="fas fa-sliders-h me-2"></i>
                Actions
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={markAllAsRead} disabled={unreadCount === 0}>
                  <i className="fas fa-check-double me-2 text-success"></i>
                  Tout marquer comme lu
                </Dropdown.Item>
                <Dropdown.Item onClick={clearNotifications} disabled={notifications.length === 0}>
                  <i className="fas fa-trash me-2 text-danger"></i>
                  Tout supprimer
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <i className="fas fa-bell fs-1 text-primary mb-2"></i>
                <h3>{stats.total}</h3>
                <p className="text-muted mb-0">Total</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <i className="fas fa-envelope fs-1 text-warning mb-2"></i>
                <h3>{stats.unread}</h3>
                <p className="text-muted mb-0">Non lus</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <i className="fas fa-file-alt fs-1 text-info mb-2"></i>
                <h3>{stats.publication}</h3>
                <p className="text-muted mb-0">Publications</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} className="mb-3">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <i className="fas fa-calendar-alt fs-1 text-success mb-2"></i>
                <h3>{stats.evenement}</h3>
                <p className="text-muted mb-0">Événements</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
        <Card className="border-0 shadow-sm mb-4">
          <Card.Body>
            <div className="d-flex gap-2 flex-wrap">
              <Button 
                variant={filterType === "Tous" ? "primary" : "outline-primary"}
                onClick={() => setFilterType("Tous")}
              >
                Tous
              </Button>
              <Button 
                variant={filterType === "publication" ? "info" : "outline-info"}
                onClick={() => setFilterType("publication")}
              >
                Publications
              </Button>
              <Button 
                variant={filterType === "evenement" ? "warning" : "outline-warning"}
                onClick={() => setFilterType("evenement")}
              >
                Événements
              </Button>
              <Button 
                variant={filterType === "appel_offre" ? "primary" : "outline-primary"}
                onClick={() => setFilterType("appel_offre")}
              >
                Appels d'offre
              </Button>
            </div>
          </Card.Body>
        </Card>

        {/* Liste des notifications */}
        <Card className="border-0 shadow-sm">
          <Card.Body className="p-0">
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                <p className="text-muted">Chargement des notifications...</p>
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                <ListGroup variant="flush">
                  {filteredNotifications.map((notif) => (
                    <ListGroup.Item
                      key={notif.id}
                      className="border-0"
                      style={{
                        background: notif.read ? "#f8f9fa" : "#e7f1ff",
                        borderLeft: notif.read ? "none" : "4px solid #007bff",
                        cursor: "pointer"
                      }}
                      onClick={() => handleNotificationClick(notif)}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="d-flex align-items-start flex-grow-1">
                          <div className="me-3">
                            <i className={`fas ${getTypeIcon(notif.type)} fa-2x text-${getTypeVariant(notif.type)}`}></i>
                          </div>
                          
                          <div className="flex-grow-1">
                            <div className="d-flex align-items-center mb-2">
                              <Badge bg={getTypeVariant(notif.type)} className="me-2">
                                {getTypeLabel(notif.type)}
                              </Badge>
                              {!notif.read && (
                                <span className="badge bg-success">Nouveau</span>
                              )}
                            </div>
                            
                            <p className="mb-1 fw-semibold">{notif.message}</p>
                            
                            {notif.organisation_name && (
                              <p className="mb-1 small text-muted">
                                <i className="fas fa-building me-1"></i>
                                {notif.organisation_name}
                              </p>
                            )}
                            
                            <small className="text-muted">
                              <i className="fas fa-clock me-1"></i>
                              {formatDateTime(notif.created_at)}
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
                <i className="fas fa-bell-slash fs-1 text-muted mb-3"></i>
                <h5 className="text-muted mb-2">Aucune notification</h5>
                <p className="text-muted">
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