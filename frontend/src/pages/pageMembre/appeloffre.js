import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Row, Col, Badge, Alert } from "react-bootstrap";
// Assurez-vous que le chemin vers MembreSidebar est correct
import MembreSidebar from "../../components/MembreSidebar"; 
import axios from "axios";

// 🔗 URL de base de ton API Laravel
const API_URL = "http://127.0.0.1:8000/api/appeloffres";

const AppelOffreMembre = () => {
  // ⚙️ États de l'application
  const [offres, setOffres] = useState([]); 
  // ❌ SUPPRESSION de l'état 'loading' pour un chargement invisible
  const [error, setError] = useState(null);
  
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentOffre, setCurrentOffre] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Ajout pour désactiver le bouton pendant l'envoi

  // 🔄 État pour les données du formulaire, y compris les champs supplémentaires
  const [nouvelleOffre, setNouvelleOffre] = useState({
    intitule: "", 
    description: "",
    date_cloture: "", 
    date_ouverture: "",
    membre: "", 
    fichier: null, 
    statut: "En attente", // 🎯 Statut par défaut 'En attente'
    
    // Champs non persistants (pour l'affichage et l'UI seulement, pour l'instant)
    type: "CDI", 
    localisation: "",
    salaire: "",
    est_urgent: false, 
  });

  // --- Fonctions de l'API (CRUD) 🚀 ---

  const fetchOffres = async () => {
    // setLoading(true); // ❌ Retiré
    setError(null);
    try {
      const response = await axios.get(API_URL);
      setOffres(response.data);
      // setLoading(false); // ❌ Retiré
    } catch (err) {
      console.error("Erreur lors de la récupération des offres:", err);
      setError("Impossible de charger les appels d'offre. Veuillez vérifier la connexion à l'API.");
      // setLoading(false); // ❌ Retiré
    }
  };

  // 📝 Fonction unifiée pour l'ajout et la modification
  const handleSave = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 🛑 Validation simple côté client
    if (!nouvelleOffre.intitule || !nouvelleOffre.date_cloture || !nouvelleOffre.description) {
      showAlert("Veuillez remplir les champs Intitulé, Description et Date de clôture.", "warning");
      setIsSubmitting(false);
      return;
    }
    
    const formData = new FormData();

    // Ajout des champs PERSISTANTS (ceux gérés par Laravel)
    formData.append('intitule', nouvelleOffre.intitule);
    formData.append('description', nouvelleOffre.description);
    formData.append('date_cloture', nouvelleOffre.date_cloture || '');
    formData.append('date_ouverture', nouvelleOffre.date_ouverture || '');
    formData.append('membre', nouvelleOffre.membre || "Utilisateur Membre");
    formData.append('statut', nouvelleOffre.statut);
    
    // Ajout des champs NON PERSISTANTS (pour la validation côté contrôleur)
    formData.append('type_contrat', nouvelleOffre.type);
    formData.append('localisation', nouvelleOffre.localisation);
    formData.append('salaire_remuneration', nouvelleOffre.salaire);
    formData.append('est_urgent', nouvelleOffre.est_urgent ? 1 : 0); // Envoi comme 1 ou 0 pour le boolean Laravel

    if (nouvelleOffre.fichier instanceof File) {
      formData.append('fichier', nouvelleOffre.fichier);
    }

    try {
      if (editMode && currentOffre) {
        // Mode modification : Requête POST avec _method=PUT
        formData.append('_method', 'PUT'); 
        await axios.post(`${API_URL}/${currentOffre.id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showAlert("Appel d'offre modifié avec succès !", "success");
      } else {
        // Mode création : Requête POST
        await axios.post(API_URL, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        showAlert("Appel d'offre créé avec succès et mis 'en attente'!", "success");
      }
      
      handleClose();
      fetchOffres(); // Recharger les données

    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'offre:", err.response ? err.response.data : err);
      const errorMsg = err.response && err.response.data && err.response.data.message 
                     ? err.response.data.message 
                     : (editMode ? "Échec de la modification." : "Échec de la création.");
      showAlert(`Erreur API : ${errorMsg}`, "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🗑️ Supprimer une offre
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        showAlert("Offre supprimée avec succès !", "success");
        fetchOffres(); // Recharger la liste
      } catch (err) {
        console.error("Erreur lors de la suppression:", err);
        showAlert("Échec de la suppression de l'offre.", "danger");
      }
    }
  };

  // 🔄 Charger les données au montage du composant
  useEffect(() => {
    fetchOffres();
  }, []);

  // --- Fonctions de gestion de l'interface utilisateur (UI) ---

  // Gérer l'état de la sidebar
  const handleSidebarCollapse = (isCollapsed) => {
     setSidebarCollapsed(isCollapsed);
  };
 
  // Afficher une alerte
  const showAlert = (message, type) => {
     setAlert({ show: true, message, type });
     setTimeout(() => setAlert({ ...alert, show: false }), 4000);
  };
 
  // Fermer modal
  const handleClose = () => {
     setShowModal(false);
     setEditMode(false);
     setCurrentOffre(null);
  };
  
  // Ouvrir modal d'ajout (Réinitialise l'état avec les valeurs par défaut)
  const handleShowAdd = () => {
    setEditMode(false);
    setCurrentOffre(null);
    setNouvelleOffre({
      intitule: "",
      description: "",
      date_cloture: "",
      date_ouverture: "",
      membre: "",
      fichier: null,
      statut: "En attente", // Statut par défaut 'En attente'
      // Champs pour l'UI
      type: "CDI", 
      localisation: "",
      salaire: "",
      est_urgent: false, 
    });
    setShowModal(true);
  };

  // Ouvrir modal d'édition
  const handleShowEdit = (offre) => {
    setEditMode(true);
    setCurrentOffre(offre);
    // Charger les données existantes, en utilisant des valeurs par défaut pour les champs non persistants
    // (car ils ne seront pas retournés par l'API Laravel)
    setNouvelleOffre({
      intitule: offre.intitule,
      description: offre.description,
      date_cloture: offre.date_cloture,
      date_ouverture: offre.date_ouverture,
      membre: offre.membre,
      fichier: null, 
      statut: offre.statut,
      
      // Assigner des valeurs par défaut
      type: offre.type_contrat || "CDI", 
      localisation: offre.localisation || "",
      salaire: offre.salaire_remuneration || "",
      est_urgent: offre.est_urgent || false, 
    });
    setShowModal(true);
  };

  // Gérer les changements de formulaire
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'file') {
      setNouvelleOffre(prev => ({ ...prev, [name]: files[0] }));
    } else if (type === 'checkbox') {
      setNouvelleOffre(prev => ({ ...prev, [name]: checked }));
    } else {
      setNouvelleOffre(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusVariant = (statut) => {
    switch(statut) {
      case "Validé": return "success";
      case "En attente": return "warning";
      case "Rejeté": return "danger";
      case "Actif": return "primary";
      case "Clôturé": return "secondary";
      default: return "secondary";
    }
  };

  // Fonction pour obtenir l'icône du statut
  const getStatusIcon = (statut) => {
    switch(statut) {
      case "Validé": return "fa-check-circle";
      case "En attente": return "fa-clock";
      case "Rejeté": return "fa-times-circle";
      case "Actif": return "fa-play-circle";
      case "Clôturé": return "fa-flag-checkered";
      default: return "fa-question-circle";
    }
  };

  // Badge de statut
  const getStatusBadge = (statut) => {
    return (
      <Badge 
        bg={getStatusVariant(statut)} 
        className="d-flex align-items-center"
        style={{ 
          borderRadius: "20px", 
          padding: "6px 12px",
          fontSize: "0.75rem",
          fontWeight: "600"
        }}
      >
        <i className={`fas ${getStatusIcon(statut)} me-1`}></i>
        {statut}
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
    if (!dateString) return "Date NC";
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Vérifier si une offre est urgente (basé sur le champ 'est_urgent' du formulaire, ou la date)
  const isUrgent = (offre) => {
    // Utilise la propriété 'est_urgent' si elle est disponible (ou sa valeur par défaut)
    if (offre.est_urgent) return true; 

    if (offre.date_cloture) {
        const today = new Date();
        const offerDate = new Date(offre.date_cloture);
        today.setHours(0, 0, 0, 0); 
        offerDate.setHours(0, 0, 0, 0);
        const diffTime = offerDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
    }
    return false;
  };

  // Affiche l'erreur API si elle existe
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger" className="shadow-lg p-4" style={{ borderRadius: "15px" }}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          <h4 className="alert-heading">Erreur de connexion API</h4>
          <p>{error}</p>
          <hr />
          <p className="mb-0">Veuillez vous assurer que votre serveur Laravel est démarré (`php artisan serve`).</p>
        </Alert>
      </div>
    );
  }

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
              Gérez vos appels d'offre
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
            Nouvel Appel
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
                <i className="fas fa-check-circle text-success fs-4"></i>
              </div>
              <h3 className="fw-bold text-success">{offres.filter(o => o.statut === 'Validé').length}</h3>
              <p className="text-muted mb-0">Offres validées</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-clock text-warning fs-4"></i>
              </div>
              <h3 className="fw-bold text-warning">{offres.filter(o => o.statut === 'En attente').length}</h3>
              <p className="text-muted mb-0">En attente</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-exclamation-triangle text-danger fs-4"></i>
              </div>
              <h3 className="fw-bold text-danger">{offres.filter(o => isUrgent(o)).length}</h3>
              <p className="text-muted mb-0">Urgents</p>
            </Card>
          </Col>
        </Row>

        {/* Liste des offres */}
        <Row>
          {offres.length === 0 ? (
            <Alert variant="info" className="text-center w-100">
              <i className="fas fa-info-circle me-2"></i>
              Aucun appel d'offre trouvé.
            </Alert>
          ) : (
            offres.map((offre) => (
              <Col xl={6} lg={6} className="mb-4" key={offre.id}>
                <Card 
                  className="shadow-lg border-0 h-100"
                  style={{ 
                    borderRadius: "20px",
                    transition: "all 0.3s ease",
                    overflow: "hidden",
                    borderLeft: `4px solid ${
                      offre.est_urgent ? "#ff6b6b" :
                      offre.statut === "Validé" ? "#28a745" :
                      offre.statut === "En attente" ? "#ffc107" :
                      offre.statut === "Rejeté" ? "#dc3545" :
                      "#6c757d"
                    }`
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
                      <div className="flex-grow-1">
                        <Card.Title 
                          className="h5 fw-bold mb-1"
                          style={{ 
                            lineHeight: "1.3",
                            color: "#2c3e50"
                          }}
                        >
                          {offre.intitule}
                          {offre.est_urgent && (
                            <Badge bg="danger" className="ms-2">
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Urgent
                            </Badge>
                          )}
                        </Card.Title>
                        {offre.type_contrat && (
                          <Badge bg="info" className="mb-2">
                            {offre.type_contrat}
                          </Badge>
                        )}
                      </div>
                      {getStatusBadge(offre.statut)}
                    </div>
                    
                    {/* Titre (Utilise intitule) */}
                    <Card.Title 
                      className="fw-bold mb-3"
                      style={{ 
                        color: "#2c3e50",
                        fontSize: "1.3rem",
                        lineHeight: "1.4"
                      }}
                    >
                      {offre.intitule}
                    </Card.Title>
                    
                    {/* Informations membre et localisation */}
                    <div className="mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-user-tie text-primary me-2"></i>
                        <span className="fw-semibold">Membre: {offre.membre || "NC"}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-map-marker-alt text-danger me-2"></i>
                        <span>{offre.localisation || "Non spécifié"}</span> 
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-money-bill-wave text-success me-2"></i>
                        <span className="fw-semibold">{offre.salaire_remuneration || "À négocier"}</span> 
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

                    {/* Date de clôture */}
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div className="d-flex align-items-center">
                        {offre.fichier && (
                          <Button 
                            variant="link" 
                            size="sm"
                            href={offre.fichier}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-0 text-decoration-none fw-semibold"
                          >
                            <i className="fas fa-download me-1"></i>
                            Télécharger le fichier
                          </Button>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="fw-semibold" style={{ color: isUrgent(offre) ? "#ff6b6b" : "#6c757d" }}>
                          <i className="fas fa-clock me-1"></i>
                          Clôture: {formatDate(offre.date_cloture)}
                        </div>
                      </div>
                    </div>

                    {/* Actions - BOUTONS VALIDER/REJETER COMME DANS ADMIN */}
                    <div className="mt-auto pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-1">
                          {offre.statut === "En attente" && (
                            <>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => handleShowEdit(offre)}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "8px" }}
                                title="Modifier"
                              >
                                <i className="fas fa-edit"></i>
                              </Button>
                            </>
                          )}
                          {(offre.statut === "Validé" || offre.statut === "Rejeté") && (
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleShowEdit(offre)}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px" }}
                              title="Modifier"
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                          )}
                        </div>
                        
                        <div className="d-flex gap-1">
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDelete(offre.id)}
                            className="d-flex align-items-center"
                            style={{ borderRadius: "8px" }}
                            title="Supprimer"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          )}
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
              {editMode ? "Modifier l'appel d'offre" : "Créer un nouvel appel d'offre"}
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
            <Form onSubmit={handleSave}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-heading me-2 text-primary"></i>
                      Intitulé *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="intitule"
                      value={nouvelleOffre.intitule}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Ex: Construction de la nouvelle école"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-tag me-2 text-success"></i>
                      Type de Contrat (UI SEULEMENT)
                    </Form.Label>
                    <Form.Select
                      name="type" // 👈 Champ non persistant
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
                      <i className="fas fa-user-tie me-2 text-info"></i>
                      Membre émetteur
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="membre"
                      value={nouvelleOffre.membre}
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Ex: Ministère du Transport"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                      Localisation (UI SEULEMENT)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="localisation" // 👈 Champ non persistant
                      value={nouvelleOffre.localisation}
                      onChange={handleChange}
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
                      Salaire/Rémunération (UI SEULEMENT)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="salaire" // 👈 Champ non persistant
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
                      <i className="fas fa-file-upload me-2 text-warning"></i>
                      Fichier (PDF, Doc, max 10Mo)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="fichier"
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    />
                    {editMode && currentOffre?.fichier && !nouvelleOffre.fichier && (
                      <Form.Text className="text-muted">
                        Fichier actuel: <a href={currentOffre.fichier} target="_blank" rel="noopener noreferrer">Voir le fichier</a>
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-calendar-alt me-2 text-info"></i>
                      Date d'ouverture
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date_ouverture"
                      value={nouvelleOffre.date_ouverture}
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-calendar-times me-2 text-danger"></i>
                      Date de clôture *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date_cloture"
                      value={nouvelleOffre.date_cloture}
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
                  Description *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={nouvelleOffre.description}
                  onChange={handleChange}
                  required
                  className="border-0 shadow-sm rounded-3 py-3"
                  placeholder="Décrivez les détails de l'appel d'offre, les spécifications, etc."
                  style={{ background: "#f8f9fa", resize: "none" }}
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  name="est_urgent" // 👈 Champ non persistant
                  label="Marquer comme appel urgent (UI SEULEMENT)"
                  checked={nouvelleOffre.est_urgent}
                  onChange={handleChange}
                  className="fw-semibold"
                />
                <Form.Text className="text-muted">
                  Les offres urgentes seront mises en avant. (Note: ce champ n'est pas sauvegardé dans la BDD pour l'instant)
                </Form.Text>
              </Form.Group>
              
              <Modal.Footer className="border-0 p-0 pt-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClose}
                  className="rounded-pill px-4 py-2"
                  style={{ fontWeight: "600" }}
                  disabled={isSubmitting} // Désactiver pendant l'envoi
                >
                  <i className="fas fa-times me-2"></i>
                  Annuler
                </Button>
                <Button 
                  type="submit"
                  variant="primary" 
                  className="rounded-pill px-4 py-2"
                  style={{
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    border: "none",
                    fontWeight: "600"
                  }}
                  disabled={isSubmitting} // Désactiver pendant l'envoi
                >
                  <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'} me-2`}></i>
                  {isSubmitting ? 'Envoi...' : (editMode ? "Modifier l'appel" : "Créer l'appel")}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal>
        {/* Styles CSS inchangés */}
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
    </div>
  );
};

export default AppelOffreMembre;