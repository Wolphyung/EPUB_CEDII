import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Row, Col, Badge, Alert } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

const AppelOffreMembre = () => {
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentOffre, setCurrentOffre] = useState(null);

  // Liste des offres
  const [offres, setOffres] = useState([
    { 
      id: 1, 
      titre: "Développeur Full Stack Senior", 
      entreprise: "TechCorp Madagascar", 
      date: "2025-10-15",
      description: "Nous recherchons un développeur full stack expérimenté pour rejoindre notre équipe technique. Technologies : React, Node.js, MongoDB, AWS.",
      type: "CDI",
      salaire: "À négocier",
      localisation: "Antananarivo",
      statut: "active",
      candidatures: 12,
      urgent: true
    },
    { 
      id: 2, 
      titre: "Stage en Marketing Digital", 
      entreprise: "MarketPlus", 
      date: "2025-09-30",
      description: "Stage de 6 mois en marketing digital pour étudiants en dernière année. Gestion des réseaux sociaux, SEO, campagnes publicitaires.",
      type: "Stage",
      salaire: "Indemnité de stage",
      localisation: "Antsirabe",
      statut: "active",
      candidatures: 8,
      urgent: false
    },
    { 
      id: 3, 
      titre: "Chef de Projet IT", 
      entreprise: "Innov Solutions", 
      date: "2025-09-20",
      description: "Poste de chef de projet pour piloter des projets digitaux innovants. Expérience en méthodologie Agile requise.",
      type: "CDI",
      salaire: "2 500 000 Ar",
      localisation: "Fianarantsoa",
      statut: "expirée",
      candidatures: 15,
      urgent: true
    },
    { 
      id: 4, 
      titre: "Data Analyst", 
      entreprise: "DataTech MG", 
      date: "2025-10-10",
      description: "Analyste de données pour traiter et interpréter des données complexes. Maîtrise de Python, SQL et Power BI nécessaire.",
      type: "CDD",
      salaire: "1 800 000 Ar",
      localisation: "Majunga",
      statut: "active",
      candidatures: 6,
      urgent: false
    }
  ]);

  const [nouvelleOffre, setNouvelleOffre] = useState({
    titre: "",
    entreprise: "",
    description: "",
    date: "",
    type: "CDI",
    salaire: "",
    localisation: "",
    statut: "active",
    candidatures: 0,
    urgent: false
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
    setCurrentOffre(null);
    setNouvelleOffre({
      titre: "",
      entreprise: "",
      description: "",
      date: "",
      type: "CDI",
      salaire: "",
      localisation: "",
      statut: "active",
      candidatures: 0,
      urgent: false
    });
    setShowModal(true);
  };

  // Ouvrir modal d'édition
  const handleShowEdit = (offre) => {
    setEditMode(true);
    setCurrentOffre(offre);
    setNouvelleOffre(offre);
    setShowModal(true);
  };

  // Fermer modal
  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentOffre(null);
  };

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNouvelleOffre(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Ajouter une offre
  const handleAdd = () => {
    if (!nouvelleOffre.titre || !nouvelleOffre.entreprise || !nouvelleOffre.date) {
      showAlert("Veuillez remplir tous les champs obligatoires", "warning");
      return;
    }

    const nouvelleOffreObj = {
      ...nouvelleOffre,
      id: offres.length + 1,
      candidatures: 0
    };

    setOffres([nouvelleOffreObj, ...offres]);
    showAlert("Offre créée avec succès !", "success");
    handleClose();
  };

  // Modifier une offre
  const handleEdit = () => {
    if (!nouvelleOffre.titre || !nouvelleOffre.entreprise || !nouvelleOffre.date) {
      showAlert("Veuillez remplir tous les champs obligatoires", "warning");
      return;
    }

    const updatedOffres = offres.map(offre =>
      offre.id === currentOffre.id ? nouvelleOffre : offre
    );

    setOffres(updatedOffres);
    showAlert("Offre modifiée avec succès !", "success");
    handleClose();
  };

  // Supprimer une offre
  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      setOffres(offres.filter(offre => offre.id !== id));
      showAlert("Offre supprimée avec succès !", "success");
    }
  };

  // Badge de statut
  const getStatusBadge = (statut) => {
    const statusConfig = {
      active: { variant: "success", text: "Active", icon: "fa-play-circle" },
      expirée: { variant: "secondary", text: "Expirée", icon: "fa-times-circle" },
      suspendue: { variant: "warning", text: "Suspendue", icon: "fa-pause-circle" }
    };
    
    const config = statusConfig[statut] || statusConfig.active;
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
      "CDI": "success",
      "CDD": "warning",
      "Stage": "info",
      "Freelance": "primary",
      "Alternance": "dark"
    };
    
    return (
      <Badge 
        bg={typeColors[type] || "secondary"}
        className="px-3 py-2"
        style={{ borderRadius: "15px", fontSize: "0.8rem" }}
      >
        {type}
      </Badge>
    );
  };

  // Formater la date
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Vérifier si une offre est urgente
  const isUrgent = (dateString) => {
    const today = new Date();
    const offerDate = new Date(dateString);
    const diffTime = offerDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
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
              📢 Appels d'Offre
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
              Gérez vos offres d'emploi et de stage
            </p>
          </div>
          <Button 
            variant="primary" 
            onClick={handleShowAdd}
            className="rounded-pill px-4 py-2"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "1rem"
            }}
          >
            <i className="fas fa-plus-circle me-2"></i>
            Nouvelle Offre
          </Button>
        </div>

        {/* Statistiques rapides */}
        <Row className="mb-5">
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-briefcase text-primary fs-4"></i>
              </div>
              <h3 className="fw-bold text-primary">{offres.length}</h3>
              <p className="text-muted mb-0">Offres totales</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-play-circle text-success fs-4"></i>
              </div>
              <h3 className="fw-bold text-success">{offres.filter(o => o.statut === 'active').length}</h3>
              <p className="text-muted mb-0">Offres actives</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-user-check text-warning fs-4"></i>
              </div>
              <h3 className="fw-bold text-warning">{offres.reduce((acc, offre) => acc + offre.candidatures, 0)}</h3>
              <p className="text-muted mb-0">Candidatures totales</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-clock text-danger fs-4"></i>
              </div>
              <h3 className="fw-bold text-danger">{offres.filter(o => isUrgent(o.date)).length}</h3>
              <p className="text-muted mb-0">Offres urgentes</p>
            </Card>
          </Col>
        </Row>

        {/* Liste des offres */}
        <Row>
          {offres.map((offre) => (
            <Col xl={6} lg={6} className="mb-4" key={offre.id}>
              <Card 
                className="shadow-lg border-0 h-100"
                style={{ 
                  borderRadius: "20px",
                  transition: "all 0.3s ease",
                  overflow: "hidden",
                  border: isUrgent(offre.date) ? "2px solid #ff6b6b" : "none"
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
                <Card.Body className="p-4">
                  {/* En-tête avec badges */}
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="d-flex gap-2">
                      {getTypeBadge(offre.type)}
                      {isUrgent(offre.date) && (
                        <Badge 
                          bg="danger" 
                          className="px-3 py-2"
                          style={{ borderRadius: "15px", fontSize: "0.8rem" }}
                        >
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          Urgent
                        </Badge>
                      )}
                    </div>
                    {getStatusBadge(offre.statut)}
                  </div>
                  
                  {/* Titre */}
                  <Card.Title 
                    className="fw-bold mb-3"
                    style={{ 
                      color: "#2c3e50",
                      fontSize: "1.3rem",
                      lineHeight: "1.4"
                    }}
                  >
                    {offre.titre}
                  </Card.Title>
                  
                  {/* Informations entreprise et localisation */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-building text-primary me-2"></i>
                      <span className="fw-semibold">{offre.entreprise}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-map-marker-alt text-danger me-2"></i>
                      <span>{offre.localisation}</span>
                    </div>
                    <div className="d-flex align-items-center mb-2">
                      <i className="fas fa-money-bill-wave text-success me-2"></i>
                      <span className="fw-semibold">{offre.salaire}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <Card.Text 
                    className="text-muted mb-4"
                    style={{ 
                      lineHeight: "1.6",
                      fontSize: "0.95rem"
                    }}
                  >
                    {offre.description.length > 120 ? `${offre.description.substring(0, 120)}...` : offre.description}
                  </Card.Text>

                  {/* Métriques et date */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-users text-info me-2"></i>
                      <span className="fw-semibold">{offre.candidatures} candidatures</span>
                    </div>
                    <div className="text-end">
                      <div className="fw-semibold" style={{ color: isUrgent(offre.date) ? "#ff6b6b" : "#6c757d" }}>
                        <i className="fas fa-clock me-1"></i>
                        {formatDate(offre.date)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={() => handleShowEdit(offre)}
                      className="rounded-pill flex-grow-1"
                    >
                      <i className="fas fa-edit me-1"></i>
                      Modifier
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDelete(offre.id)}
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
              <i className="fas fa-briefcase me-2"></i>
              {editMode ? "Modifier l'offre" : "Créer une nouvelle offre"}
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
                      Titre du poste *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={nouvelleOffre.titre}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Ex: Développeur Full Stack Senior"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-tag me-2 text-success"></i>
                      Type de contrat
                    </Form.Label>
                    <Form.Select
                      name="type"
                      value={nouvelleOffre.type}
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    >
                      <option value="CDI">CDI</option>
                      <option value="CDD">CDD</option>
                      <option value="Stage">Stage</option>
                      <option value="Freelance">Freelance</option>
                      <option value="Alternance">Alternance</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-building me-2 text-info"></i>
                      Entreprise *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="entreprise"
                      value={nouvelleOffre.entreprise}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Nom de l'entreprise"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                      Localisation *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="localisation"
                      value={nouvelleOffre.localisation}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Ville, Région"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-money-bill-wave me-2 text-success"></i>
                      Salaire / Rémunération
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="salaire"
                      value={nouvelleOffre.salaire}
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Ex: 1 500 000 Ar, À négocier"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-calendar me-2 text-warning"></i>
                      Date limite *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={nouvelleOffre.date}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-align-left me-2 text-info"></i>
                  Description du poste *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={nouvelleOffre.description}
                  onChange={handleChange}
                  required
                  className="border-0 shadow-sm rounded-3 py-3"
                  placeholder="Décrivez les missions, compétences requises, avantages..."
                  style={{ background: "#f8f9fa", resize: "none" }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  name="urgent"
                  label="Marquer comme offre urgente"
                  checked={nouvelleOffre.urgent}
                  onChange={handleChange}
                  className="fw-semibold"
                />
                <Form.Text className="text-muted">
                  Les offres urgentes seront mises en avant avec un badge spécial
                </Form.Text>
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
              variant="primary" 
              onClick={editMode ? handleEdit : handleAdd}
              className="rounded-pill px-4 py-2"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                fontWeight: "600"
              }}
            >
              <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'} me-2`}></i>
              {editMode ? "Modifier" : "Créer l'offre"}
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

export default AppelOffreMembre;