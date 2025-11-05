import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Modal, Form, Row, Col, Badge, Alert, Spinner } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

// 🚀 URL API CORRIGÉE
const BASE_API_URL = "http://127.0.0.1:8000/api"; 
const EVENEMENTS_API_URL = `${BASE_API_URL}/evenements`;

const EvenementMembre = () => {
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const [evenements, setEvenements] = useState([]); 

  const [nouvelEvenement, setNouvelEvenement] = useState({
    titre: "",
    lieu: "",
    description: "",
    date: "",
    heure: "09:00",
    type: "Présentiel", 
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

  // --- Fonctions d'affichage (Badges, Formatage) ---
  const getStatusBadge = (statut) => {
    const statusConfig = {
      'Validé': { variant: "success", text: "Validé", icon: "fa-check-circle" },
      'En attente': { variant: "warning", text: "En attente", icon: "fa-clock" },
      'Rejeté': { variant: "danger", text: "Rejeté", icon: "fa-times-circle" }
    };
    const config = statusConfig[statut] || statusConfig['En attente'];
    return (
      <Badge bg={config.variant} className="d-inline-flex align-items-center px-3 py-2" style={{ borderRadius: "15px", fontSize: "0.8rem" }}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </Badge>
    );
  };
  
  const getTypeIcon = (type) => {
    const icons = {
      "Présentiel": "fa-building",
      "En ligne": "fa-globe",
      "Hybride": "fa-exchange-alt",
    };
    return icons[type] || "fa-calendar";
  };
  
  const getTypeBadge = (type) => {
    const typeColors = {
      "Présentiel": "primary",
      "En ligne": "info",
      "Hybride": "warning",
    };
    return (
      <Badge bg={typeColors[type] || "secondary"} className="px-3 py-2" style={{ borderRadius: "15px", fontSize: "0.8rem" }}>
        <i className={`fas ${getTypeIcon(type)} me-1`}></i>
        {type}
      </Badge>
    );
  };

  const formatDate = (dateString) => {
    // Utilisation de toLocaleDateString pour éviter les problèmes de fuseau horaire si possible
    try {
        const date = new Date(dateString);
        // Si la date est valide et n'est pas l'epoch time (01/01/1970)
        if (date.getTime() > 0) { 
            return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
        }
    } catch (e) {
        // En cas d'erreur de parsing, retourner la chaîne originale ou vide
        return dateString.split(' ')[0] || '';
    }
    return '';
  };
  // --- Fin Fonctions d'affichage ---


  // 🔄 Fonction pour charger les événements
  const fetchEvenements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(EVENEMENTS_API_URL, {
        method: 'GET',
        headers: {
          // 'Authorization': 'Bearer VOTRE_TOKEN_JWT', // À décommenter si besoin
          'Accept': 'application/json',
        }
      });
      
      if (!response.ok) {
        throw new Error("Échec du chargement des événements.");
      }

      const data = await response.json();
      
      const formattedData = data.map(evt => {
        // La date et l'heure sont séparées du champ date_heure pour le formulaire React
        const datePart = evt.date_heure ? evt.date_heure.split(' ')[0] : '';
        const timePart = evt.date_heure ? evt.date_heure.split(' ')[1]?.substring(0, 5) : '09:00';

        return {
          ...evt,
          date: datePart,
          heure: timePart,
        }
      });

      setEvenements(formattedData);

    } catch (error) {
      showAlert(`Erreur de chargement: ${error.message}`, "danger");
      setEvenements([]); 
    } finally {
      setLoading(false);
    }
  }, []); 

  // 🚀 Charger les événements au montage
  useEffect(() => {
    fetchEvenements();
  }, [fetchEvenements]);
  
  // Ouvrir modal d'ajout
  const handleShowAdd = () => {
    setEditMode(false);
    setCurrentEvent(null);
    setNouvelEvenement({
      titre: "", lieu: "", description: "", date: "", heure: "09:00", 
      type: "Présentiel", image: null
    });
    setShowModal(true);
  };

  // Ouvrir modal d'édition
  const handleShowEdit = (event) => {
    setEditMode(true);
    setCurrentEvent(event);
    setNouvelEvenement({
        ...event,
        image: null // Réinitialiser le champ fichier pour la modification
    });
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

  // 🚀 API : Ajouter un événement (CORRECTION 422 APPLIQUÉE)
  const handleAdd = async () => {
    if (!nouvelEvenement.titre || !nouvelEvenement.lieu || !nouvelEvenement.date || !nouvelEvenement.description) {
      showAlert("Veuillez remplir tous les champs obligatoires", "warning");
      return;
    }

    const dateHeure = `${nouvelEvenement.date} ${nouvelEvenement.heure}:00`;

    const formData = new FormData();
    formData.append('titre', nouvelEvenement.titre);
    formData.append('description', nouvelEvenement.description);
    formData.append('date_heure', dateHeure); 
    formData.append('lieu', nouvelEvenement.lieu);
    formData.append('type', nouvelEvenement.type);
    
    // 🔥 CORRECTION : AJOUT DU STATUT PAR DÉFAUT REQUIS PAR LE BACKEND
    formData.append('statut', 'En attente');
    
    if (nouvelEvenement.image) {
      formData.append('fichier', nouvelEvenement.image); 
    }
    
    setLoading(true);
    try {
        const response = await fetch(EVENEMENTS_API_URL, { 
            method: 'POST',
            body: formData,
            // Headers nécessaires pour l'authentification si vous en utilisez
        });

        const data = await response.json();

        if (response.ok) {
            showAlert(`Événement créé avec succès ! Statut: ${data.statut || 'En attente'}`, "success");
            fetchEvenements(); 
        } else {
            const errorMessages = data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'La création a échoué.');
            showAlert(`Erreur: ${errorMessages}`, "danger");
        }
    } catch (error) {
        showAlert("Erreur de connexion au serveur ou problème réseau.", "danger");
    } finally {
        setLoading(false);
        handleClose();
    }
  };

  // 🚀 API : Modifier un événement (Statut actuel envoyé, requis par le backend)
  const handleEdit = async () => {
    if (!nouvelEvenement.titre || !nouvelEvenement.lieu || !nouvelEvenement.date || !nouvelEvenement.description) {
      showAlert("Veuillez remplir tous les champs obligatoires", "warning");
      return;
    }
    
    const dateHeure = `${nouvelEvenement.date} ${nouvelEvenement.heure}:00`;

    const formData = new FormData();
    formData.append('_method', 'PUT'); // Indiquer à Laravel que c'est une requête PUT/PATCH
    formData.append('titre', nouvelEvenement.titre);
    formData.append('description', nouvelEvenement.description);
    formData.append('date_heure', dateHeure); 
    formData.append('lieu', nouvelEvenement.lieu);
    formData.append('type', nouvelEvenement.type);
    
    // 🔥 ESSENTIEL : Renvoyer le statut actuel (requis par la validation du backend pour update)
    formData.append('statut', currentEvent.statut); 

    if (nouvelEvenement.image) {
      formData.append('fichier', nouvelEvenement.image); 
    }
    
    setLoading(true);
    try {
        const response = await fetch(`${EVENEMENTS_API_URL}/${currentEvent.id}`, { 
            method: 'POST', // Utiliser POST avec _method=PUT pour FormData
            body: formData,
            // Headers pour l'authentification
        });

        const data = await response.json();

        if (response.ok) {
            showAlert("Événement modifié avec succès !", "success");
            fetchEvenements(); // Recharger la liste
        } else {
            const errorMessages = data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'La modification a échoué.');
            showAlert(`Erreur: ${errorMessages}`, "danger");
        }
    } catch (error) {
        showAlert("Erreur de connexion au serveur ou problème réseau.", "danger");
    } finally {
        setLoading(false);
        handleClose();
    }
  };

  // 🚀 API : Supprimer un événement
  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;

    setLoading(true);
    try {
        const response = await fetch(`${EVENEMENTS_API_URL}/${id}`, {
            method: 'DELETE',
            // Headers pour l'authentification
        });

        if (response.ok || response.status === 204) {
            showAlert("Événement supprimé avec succès !", "success");
            fetchEvenements(); // Recharger la liste
        } else {
            const data = await response.json();
            showAlert(`Erreur: ${data.message || 'La suppression a échoué.'}`, "danger");
        }

    } catch (error) {
        showAlert("Erreur de connexion au serveur ou problème réseau.", "danger");
    } finally {
        setLoading(false);
    }
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
              Géerez et organisez vos événements (en attente de validation Admin)
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
            disabled={loading}
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
                <i className="fas fa-check-circle text-success fs-4"></i>
              </div>
              <h3 className="fw-bold text-success">{evenements.filter(e => e.statut === 'Validé').length}</h3>
              <p className="text-muted mb-0">Événements Validés</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-clock text-warning fs-4"></i>
              </div>
              <h3 className="fw-bold text-warning">{evenements.filter(e => e.statut === 'En attente').length}</h3>
              <p className="text-muted mb-0">Événements En attente</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-times-circle text-danger fs-4"></i>
              </div>
              <h3 className="fw-bold text-danger">{evenements.filter(e => e.statut === 'Rejeté').length}</h3>
              <p className="text-muted mb-0">Événements Rejetés</p>
            </Card>
          </Col>
        </Row>

        {/* ⏳ Affichage de chargement */}
        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" role="status" />
            <p className="mt-2 text-primary fw-semibold">Chargement des événements...</p>
          </div>
        )}

        {/* ❌ Événements vides */}
        {!loading && evenements.length === 0 && (
            <Alert variant="info" className="text-center my-5 border-0 shadow" style={{ borderRadius: "15px" }}>
                <i className="fas fa-info-circle me-2"></i>
                Aucun événement trouvé. Créez-en un pour commencer !
            </Alert>
        )}

        {/* ✅ Liste des événements */}
        {!loading && evenements.length > 0 && (
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
                    {/* Le chemin de l'image devra être ajusté pour pointer vers /storage */}
                    {evt.fichier && ( 
                      <Card.Img
                        variant="top"
                        // Assurez-vous que Laravel sert les fichiers depuis storage/app/public/evenements
                        // Le chemin d'accès correct devrait être :
                        src={`${BASE_API_URL}/storage/${evt.fichier}`} 
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

                      {/* Actions */}
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowEdit(evt)}
                          className="rounded-pill flex-grow-1"
                          disabled={evt.statut !== 'En attente' || loading} // ⚠️ Seul le statut 'En attente' est éditable par le membre
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
                          disabled={loading}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
        )}

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
              {editMode ? "Modifier l'événement" : "Créer un nouvel événement (Envoi en attente)"}
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
                      <option value="Présentiel">Présentiel</option>
                      <option value="En ligne">En ligne</option>
                      <option value="Hybride">Hybride</option>
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
              disabled={loading}
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
              disabled={loading}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              ) : (
                <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'} me-2`}></i>
              )}
              {editMode ? "Sauvegarder" : "Créer et Envoyer"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
      <style>{`/* Styles CSS inchangés */`}</style>
    </div>
  );
};

export default EvenementMembre;