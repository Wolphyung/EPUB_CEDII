import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Row, Col, Badge, Alert } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

const EvenementMembre = () => {
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);

  // Liste des événements
  const [evenements, setEvenements] = useState([
    { 
      id: 1, 
      titre: "Hackathon Innovation 2025", 
      lieu: "Antananarivo", 
      date: "2025-10-05", 
      heure: "08:00",
      description: "Concours de développement collaboratif pour créer des solutions innovantes 🚀", 
      participants: 45,
      statut: "actif",
      type: "compétition",
      image: null
    },
    { 
      id: 2, 
      titre: "Conférence Intelligence Artificielle", 
      lieu: "Fianarantsoa", 
      date: "2025-11-12", 
      heure: "14:00",
      description: "Présentation sur l'avenir de l'IA et ses applications dans l'industrie 4.0 🤖", 
      participants: 120,
      statut: "actif",
      type: "conférence",
      image: null
    },
    { 
      id: 3, 
      titre: "Workshop Développement Web", 
      lieu: "Antsirabe", 
      date: "2025-09-28", 
      heure: "09:30",
      description: "Atelier pratique sur les dernières technologies web et bonnes pratiques 💻", 
      participants: 25,
      statut: "terminé",
      type: "formation",
      image: null
    }
  ]);

  const [nouvelEvenement, setNouvelEvenement] = useState({
    titre: "",
    lieu: "",
    description: "",
    date: "",
    heure: "09:00",
    type: "conférence",
    participants: 0,
    statut: "actif",
    image: null
  });

  // Gérer l'état de la sidebar
  const handleSidebarCollapse = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  // Afficher une alerte
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ ...alert, show: false }), 4000);
  };

  // Ouvrir modal d'ajout
  const handleShowAdd = () => {
    setEditMode(false);
    setCurrentEvent(null);
    setNouvelEvenement({
      titre: "",
      lieu: "",
      description: "",
      date: "",
      heure: "09:00",
      type: "conférence",
      participants: 0,
      statut: "actif",
      image: null
    });
    setShowModal(true);
  };

  // Ouvrir modal d'édition
  const handleShowEdit = (event) => {
    setEditMode(true);
    setCurrentEvent(event);
    setNouvelEvenement(event);
    setShowModal(true);
  };

  // Fermer modal
  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentEvent(null);
  };

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setNouvelEvenement({ ...nouvelEvenement, image: files[0] });
    } else {
      setNouvelEvenement({ ...nouvelEvenement, [name]: value });
    }
  };

  // Ajouter un événement
  const handleAdd = () => {
    if (!nouvelEvenement.titre || !nouvelEvenement.lieu || !nouvelEvenement.date) {
      showAlert("Veuillez remplir tous les champs obligatoires", "warning");
      return;
    }

    const nouvelEvt = {
      ...nouvelEvenement,
      id: evenements.length + 1,
      image: nouvelEvenement.image ? URL.createObjectURL(nouvelEvenement.image) : null
    };

    setEvenements([nouvelEvt, ...evenements]);
    showAlert("Événement créé avec succès !", "success");
    handleClose();
  };

  // Modifier un événement
  const handleEdit = () => {
    if (!nouvelEvenement.titre || !nouvelEvenement.lieu || !nouvelEvenement.date) {
      showAlert("Veuillez remplir tous les champs obligatoires", "warning");
      return;
    }

    const updatedEvents = evenements.map(evt =>
      evt.id === currentEvent.id ? { ...nouvelEvenement, image: nouvelEvenement.image || evt.image } : evt
    );

    setEvenements(updatedEvents);
    showAlert("Événement modifié avec succès !", "success");
    handleClose();
  };

  // Supprimer un événement
  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) {
      setEvenements(evenements.filter(evt => evt.id !== id));
      showAlert("Événement supprimé avec succès !", "success");
    }
  };

  // Badge de statut
  const getStatusBadge = (statut) => {
    const statusConfig = {
      actif: { variant: "success", text: "Actif", icon: "fa-play-circle" },
      terminé: { variant: "secondary", text: "Terminé", icon: "fa-check-circle" },
      annulé: { variant: "danger", text: "Annulé", icon: "fa-times-circle" }
    };
    
    const config = statusConfig[statut] || statusConfig.actif;
    return (
      <Badge 
        bg={config.variant} 
        className="d-inline-flex align-items-center px-3 py-2"
        style={{ borderRadius: "15px", fontSize: "0.8rem" }}
      >
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };

  // Badge de type
  const getTypeBadge = (type) => {
    const typeColors = {
      "conférence": "primary",
      "compétition": "warning",
      "formation": "info",
      "réseautage": "success",
      "atelier": "dark"
    };
    
    return (
      <Badge 
        bg={typeColors[type] || "secondary"}
        className="px-3 py-2"
        style={{ borderRadius: "15px", fontSize: "0.8rem" }}
      >
        <i className={`fas ${getTypeIcon(type)} me-1`}></i>
        {type}
      </Badge>
    );
  };

  // Icône selon le type
  const getTypeIcon = (type) => {
    const icons = {
      "conférence": "fa-chalkboard-teacher",
      "compétition": "fa-trophy",
      "formation": "fa-graduation-cap",
      "réseautage": "fa-users",
      "atelier": "fa-tools"
    };
    return icons[type] || "fa-calendar";
  };

  // Formater la date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

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
        {/* Alert */}
        {alert.show && (
          <Alert 
            variant={alert.type} 
            dismissible 
            onClose={() => setAlert({ ...alert, show: false })}
            className="mb-4 border-0 shadow"
            style={{ borderRadius: "15px" }}
          >
            <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
            {alert.message}
          </Alert>
        )}

        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-2" style={{ 
              color: "#2c3e50",
              fontSize: "2.2rem"
            }}>
              🎉 Mes Événements
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
              Gérez et organisez vos événements
            </p>
          </div>
          <Button 
            variant="success" 
            onClick={handleShowAdd}
            className="rounded-pill px-4 py-2"
            style={{
              background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "1rem"
            }}
          >
            <i className="fas fa-plus-circle me-2"></i>
            Nouvel Événement
          </Button>
        </div>

        {/* Statistiques rapides */}
        <Row className="mb-5">
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-calendar-alt text-primary fs-4"></i>
              </div>
              <h3 className="fw-bold text-primary">{evenements.length}</h3>
              <p className="text-muted mb-0">Événements total</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-play-circle text-success fs-4"></i>
              </div>
              <h3 className="fw-bold text-success">{evenements.filter(e => e.statut === 'actif').length}</h3>
              <p className="text-muted mb-0">Événements actifs</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-users text-warning fs-4"></i>
              </div>
              <h3 className="fw-bold text-warning">{evenements.reduce((acc, evt) => acc + evt.participants, 0)}</h3>
              <p className="text-muted mb-0">Participants total</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-chart-line text-info fs-4"></i>
              </div>
              <h3 className="fw-bold text-info">{evenements.filter(e => e.statut === 'terminé').length}</h3>
              <p className="text-muted mb-0">Événements terminés</p>
            </Card>
          </Col>
        </Row>

        {/* Liste des événements */}
        <Row>
          {evenements.map((evt) => (
            <Col xl={4} lg={6} className="mb-4" key={evt.id}>
              <Card 
                className="shadow-lg border-0 h-100"
                style={{ 
                  borderRadius: "20px",
                  transition: "all 0.3s ease",
                  overflow: "hidden"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
                }}
              >
                {evt.image && (
                  <Card.Img
                    variant="top"
                    src={evt.image}
                    style={{ 
                      height: "200px", 
                      objectFit: "cover",
                      borderTopLeftRadius: "20px",
                      borderTopRightRadius: "20px"
                    }}
                  />
                )}
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    {getTypeBadge(evt.type)}
                    {getStatusBadge(evt.statut)}
                  </div>
                  
                  <Card.Title 
                    className="fw-bold mb-3"
                    style={{ 
                      color: "#2c3e50",
                      fontSize: "1.3rem",
                      lineHeight: "1.4"
                    }}
                  >
                    {evt.titre}
                  </Card.Title>
                  
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-map-marker-alt text-danger me-2"></i>
                      <span className="fw-semibold">{evt.lieu}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-calendar text-primary me-2"></i>
                      <span>{formatDate(evt.date)}</span>
                    </div>
                    <div className="d-flex align-items-center mb-3">
                      <i className="fas fa-clock text-warning me-2"></i>
                      <span>{evt.heure}</span>
                    </div>
                  </div>

                  <Card.Text 
                    className="text-muted mb-4"
                    style={{ 
                      lineHeight: "1.6",
                      fontSize: "0.95rem"
                    }}
                  >
                    {evt.description}
                  </Card.Text>

                  {/* Métriques */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-users text-info me-2"></i>
                      <span className="fw-semibold">{evt.participants} participants</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleShowEdit(evt)}
                      className="rounded-pill flex-grow-1"
                    >
                      <i className="fas fa-edit me-1"></i>
                      Modifier
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(evt.id)}
                      className="rounded-pill"
                      style={{ width: "45px" }}
                    >
                      <i className="fas fa-trash"></i>
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Modal d'ajout/modification */}
        <Modal 
          show={showModal} 
          onHide={handleClose} 
          centered
          size="lg"
          className="modern-modal"
        >
          <Modal.Header 
            className="border-0"
            style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px"
            }}
          >
            <Modal.Title className="fw-bold">
              <i className="fas fa-calendar-plus me-2"></i>
              {editMode ? "Modifier l'événement" : "Créer un nouvel événement"}
            </Modal.Title>
            <Button 
              variant="link" 
              onClick={handleClose}
              className="text-white p-0"
              style={{ fontSize: "1.5rem" }}
            >
              <i className="fas fa-times"></i>
            </Button>
          </Modal.Header>
          
          <Modal.Body className="p-4">
            <Form>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-heading me-2 text-primary"></i>
                      Titre de l'événement *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={nouvelEvenement.titre}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Donnez un titre attractif..."
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-tag me-2 text-success"></i>
                      Type
                    </Form.Label>
                    <Form.Select
                      name="type"
                      value={nouvelEvenement.type}
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    >
                      <option value="conférence">Conférence</option>
                      <option value="compétition">Compétition</option>
                      <option value="formation">Formation</option>
                      <option value="atelier">Atelier</option>
                      <option value="réseautage">Réseautage</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                      Lieu *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lieu"
                      value={nouvelEvenement.lieu}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Lieu de l'événement..."
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-calendar me-2 text-primary"></i>
                      Date *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={nouvelEvenement.date}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-clock me-2 text-warning"></i>
                      Heure
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="heure"
                      value={nouvelEvenement.heure}
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-align-left me-2 text-info"></i>
                  Description *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={nouvelEvenement.description}
                  onChange={handleChange}
                  required
                  className="border-0 shadow-sm rounded-3 py-3"
                  placeholder="Décrivez votre événement..."
                  style={{ background: "#f8f9fa", resize: "none" }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-image me-2 text-warning"></i>
                  Image illustrative
                </Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="border-0 shadow-sm rounded-3 py-3"
                  style={{ background: "#f8f9fa" }}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              className="rounded-pill px-4 py-2"
              style={{ fontWeight: "600" }}
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button 
              variant="success" 
              onClick={editMode ? handleEdit : handleAdd}
              className="rounded-pill px-4 py-2"
              style={{
                background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
                border: "none",
                fontWeight: "600"
              }}
            >
              <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'} me-2`}></i>
              {editMode ? "Modifier" : "Créer"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Styles CSS supplémentaires */}
      <style>
        {`
          .modern-modal .modal-content {
            border-radius: 20px !important;
            border: none !important;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2) !important;
          }

          .form-control:focus, .form-select:focus {
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
            border-color: #667eea !important;
            background: #fff !important;
          }

          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .btn {
            transition: all 0.3s ease;
          }

          .btn:hover {
            transform: translateY(-2px);
          }
        `}
      </style>
    </div>
  );
};

export default EvenementMembre;