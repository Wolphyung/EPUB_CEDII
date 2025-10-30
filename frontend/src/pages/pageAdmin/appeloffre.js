import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { 
  Button, 
  Form, 
  Modal, 
  Card, 
  Row, 
  Col, 
  Badge, 
  Alert, 
  InputGroup,
  Dropdown
} from "react-bootstrap";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const AppelOffre = () => {
  const [appelOffres, setAppelOffres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [loading, setLoading] = useState(false);
  const [newOffre, setNewOffre] = useState({
    intitule: "",
    description: "",
    date_ouverture: "",
    date_cloture: "",
    membre: "",
    fichier: null,
    statut: "En attente"
  });

  // Afficher messages temporairement
  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: "", message: "" });
    }, 5000);
  };

  // Charger les appels d'offre
  const fetchAppelOffres = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/appeloffres`);
      setAppelOffres(res.data.data || res.data);
    } catch (err) {
      console.error("Erreur chargement appels d'offre:", err);
      showNotification("error", "Erreur lors du chargement des appels d'offre");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppelOffres();
  }, []);

  // Ouvrir modal
  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setNewOffre({
      intitule: "",
      description: "",
      date_ouverture: "",
      date_cloture: "",
      membre: "",
      fichier: null,
      statut: "En attente"
    });
  };

  // Changement de valeur des inputs
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "fichier") {
      setNewOffre({ ...newOffre, fichier: files[0] });
    } else {
      setNewOffre({ ...newOffre, [name]: value });
    }
  };

  // Ajouter un appel d'offre
  const handleAddOffre = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("intitule", newOffre.intitule);
    formData.append("description", newOffre.description);
    formData.append("date_ouverture", newOffre.date_ouverture);
    formData.append("date_cloture", newOffre.date_cloture);
    formData.append("membre", newOffre.membre);
    formData.append("statut", newOffre.statut);
    if (newOffre.fichier) {
      formData.append("fichier", newOffre.fichier);
    }

    try {
      const res = await axios.post(`${API_URL}/appeloffres`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setAppelOffres(prev => [res.data.data || res.data, ...prev]);
      showNotification("success", "✅ Appel d'offre ajouté avec succès !");
      handleClose();
    } catch (err) {
      console.error("Erreur ajout appel d'offre:", err);
      showNotification("error", "❌ Erreur lors de l'ajout de l'appel d'offre");
    } finally {
      setLoading(false);
    }
  };

  // Valider un appel d'offre
  const handleValidate = async (id) => {
    try {
      const formData = new FormData();
      formData.append("statut", "Validé");
      formData.append("_method", "PUT");
      
      const res = await axios.post(`${API_URL}/appeloffres/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setAppelOffres(prev => prev.map(offre => 
        offre.id === id ? (res.data.data || res.data) : offre
      ));
      showNotification("success", "✅ Appel d'offre validé avec succès !");
    } catch (err) {
      console.error("Erreur validation:", err);
      showNotification("error", "❌ Erreur lors de la validation");
    }
  };

  // Rejeter un appel d'offre
  const handleReject = async (id) => {
    try {
      const formData = new FormData();
      formData.append("statut", "Rejeté");
      formData.append("_method", "PUT");
      
      const res = await axios.post(`${API_URL}/appeloffres/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setAppelOffres(prev => prev.map(offre => 
        offre.id === id ? (res.data.data || res.data) : offre
      ));
      showNotification("success", "✅ Appel d'offre rejeté avec succès !");
    } catch (err) {
      console.error("Erreur rejet:", err);
      showNotification("error", "❌ Erreur lors du rejet");
    }
  };

  // Supprimer un appel d'offre
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cet appel d'offre ?")) return;
    
    try {
      await axios.delete(`${API_URL}/appeloffres/${id}`);
      setAppelOffres(prev => prev.filter(offre => offre.id !== id));
      showNotification("success", "✅ Appel d'offre supprimé avec succès !");
    } catch (err) {
      console.error("Erreur suppression:", err);
      showNotification("error", "❌ Erreur lors de la suppression");
    }
  };

  // Filtrer les appels d'offre
  const filteredOffres = appelOffres.filter((offre) => {
    const matchesSearch = offre.intitule?.toLowerCase().includes(search.toLowerCase()) ||
                         offre.description?.toLowerCase().includes(search.toLowerCase());
    const matchesStatut = filterStatut === "Tous" || offre.statut === filterStatut;
    
    return matchesSearch && matchesStatut;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterStatut("Tous");
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const isDatePassed = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  const getFileName = (fichier) => {
    if (!fichier) return '';
    if (typeof fichier === 'string') return fichier.split('/').pop() || 'Fichier joint';
    if (fichier instanceof File) return fichier.name;
    return 'Fichier joint';
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
              Gestion des Appels d'Offre
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-file-contract me-2"></i>
              Gérez les appels d'offre de votre plateforme
            </p>
          </div>
          <Button 
            variant="success" 
            onClick={handleShow} 
            className="d-flex align-items-center shadow-sm"
            style={{
              background: "linear-gradient(135deg, #00b09b, #96c93d)",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontWeight: "600"
            }}
          >
            <i className="fas fa-plus me-2"></i>
            Nouvel Appel d'Offre
          </Button>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          {[
            { 
              title: "Total Appels d'Offre", 
              count: appelOffres.length, 
              icon: "fa-file-contract", 
              color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            { 
              title: "En attente", 
              count: appelOffres.filter((offre) => offre.statut === "En attente").length, 
              icon: "fa-clock", 
              color: "linear-gradient(135deg, #00b09b, #96c93d)"
            },
            { 
              title: "Validés", 
              count: appelOffres.filter((offre) => offre.statut === "Validé").length, 
              icon: "fa-check-circle", 
              color: "linear-gradient(135deg, #4facfe, #00f2fe)"
            },
            { 
              title: "Rejetés", 
              count: appelOffres.filter((offre) => offre.statut === "Rejeté").length, 
              icon: "fa-times-circle", 
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

        {/* Barre de recherche et filtres */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-search me-2"></i>
                    Recherche
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      border: "none",
                      color: "white"
                    }}>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher par intitulé ou description..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ borderRadius: "0 10px 10px 0" }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-filter me-2"></i>
                    Statut
                  </Form.Label>
                  <Form.Select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="En attente">En attente</option>
                    <option value="Validé">Validé</option>
                    <option value="Rejeté">Rejeté</option>
                    <option value="Actif">Actif</option>
                    <option value="Clôturé">Clôturé</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-sort me-2"></i>
                    Trier par
                  </Form.Label>
                  <Form.Select style={{ borderRadius: "10px" }}>
                    <option>Date d'ouverture</option>
                    <option>Date de clôture</option>
                    <option>Intitulé</option>
                    <option>Statut</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    onClick={fetchAppelOffres}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-refresh"></i>
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Liste des appels d'offre */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted fw-semibold">Chargement des appels d'offre...</p>
          </div>
        ) : (
          <Row>
            {filteredOffres.map((offre) => (
              <Col md={6} lg={4} key={offre.id} className="mb-4">
                <Card 
                  className="border-0 shadow-sm h-100" 
                  style={{ 
                    borderRadius: "20px", 
                    transition: "transform 0.2s",
                    borderLeft: `4px solid ${
                      offre.statut === "Validé" ? "#28a745" :
                      offre.statut === "En attente" ? "#ffc107" :
                      offre.statut === "Rejeté" ? "#dc3545" :
                      "#6c757d"
                    }`
                  }}
                >
                  <Card.Body className="d-flex flex-column p-4">
                    {/* En-tête avec intitulé et statut */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Card.Title 
                        className="h5 fw-bold mb-0"
                        style={{ 
                          lineHeight: "1.3",
                          color: "#2c3e50"
                        }}
                      >
                        {offre.intitule}
                      </Card.Title>
                      <Badge 
                        bg={getStatusVariant(offre.statut)} 
                        className="d-flex align-items-center"
                        style={{ 
                          borderRadius: "20px", 
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                          fontWeight: "600"
                        }}
                      >
                        <i className={`fas ${getStatusIcon(offre.statut)} me-1`}></i>
                        {offre.statut}
                      </Badge>
                    </div>

                    {/* Description */}
                    <Card.Text 
                      className="text-muted flex-grow-1 mb-3" 
                      style={{ lineHeight: "1.5", fontSize: "0.9rem" }}
                    >
                      {offre.description?.length > 120 ? `${offre.description.substring(0, 120)}...` : offre.description}
                    </Card.Text>

                    {/* Informations détaillées */}
                    <div className="small text-muted mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-user text-primary me-2" style={{ width: "16px" }}></i>
                        <span>{offre.membre || "Non assigné"}</span>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-calendar-plus text-primary me-2" style={{ width: "16px" }}></i>
                        <span>Ouverture: {formatDate(offre.date_ouverture)}</span>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-calendar-check text-primary me-2" style={{ width: "16px" }}></i>
                        <span>
                          Clôture: {formatDate(offre.date_cloture)}
                          {isDatePassed(offre.date_cloture) && (
                            <Badge bg="danger" className="ms-2" style={{ fontSize: "0.65rem" }}>
                              Expiré
                            </Badge>
                          )}
                        </span>
                      </div>

                      {offre.fichier && (
                        <div className="d-flex align-items-center">
                          <i className="fas fa-paperclip text-primary me-2" style={{ width: "16px" }}></i>
                          <a 
                            href={offre.fichier} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-decoration-none text-primary small"
                          >
                            {getFileName(offre.fichier)}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-1">
                          {offre.statut === "En attente" && (
                            <>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => handleValidate(offre.id)}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "8px" }}
                                title="Valider"
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => handleReject(offre.id)}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "8px" }}
                                title="Rejeter"
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </>
                          )}
                          {(offre.statut === "Validé" || offre.statut === "Rejeté") && (
                            <Button 
                              variant="outline-warning" 
                              size="sm" 
                              onClick={() => handleValidate(offre.id)}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px" }}
                              title="Remettre en attente"
                            >
                              <i className="fas fa-redo"></i>
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
            ))}
            
            {filteredOffres.length === 0 && (
              <Col md={12}>
                <Card className="border-0 shadow-sm text-center" style={{ borderRadius: "20px" }}>
                  <Card.Body className="py-5">
                    <i className="fas fa-file-contract fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
                    <h5 className="text-muted mb-2">Aucun appel d'offre trouvé</h5>
                    <p className="text-muted mb-3">Aucun appel d'offre ne correspond à vos critères de recherche</p>
                    <Button 
                      variant="primary" 
                      onClick={clearFilters}
                      className="d-flex align-items-center mx-auto"
                    >
                      <i className="fas fa-times me-2"></i>
                      Effacer les filtres
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* Modal ajout appel d'offre */}
        <Modal show={showModal} onHide={handleClose} size="lg" centered>
          <Modal.Header 
            closeButton 
            className="border-0"
            style={{ 
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white"
            }}
          >
            <Modal.Title className="d-flex align-items-center fw-bold">
              <i className="fas fa-plus me-2"></i>
              Nouvel Appel d'Offre
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleAddOffre}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-heading me-2 text-primary"></i>
                      Intitulé *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="intitule"
                      value={newOffre.intitule}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Intitulé de l'appel d'offre"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-chart-line me-2 text-primary"></i>
                      Statut *
                    </Form.Label>
                    <Form.Select
                      name="statut"
                      value={newOffre.statut}
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="En attente">En attente</option>
                      <option value="Validé">Validé</option>
                      <option value="Actif">Actif</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-align-left me-2 text-primary"></i>
                  Description *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={newOffre.description}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: "10px", padding: "12px" }}
                  placeholder="Description détaillée de l'appel d'offre..."
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-calendar-plus me-2 text-primary"></i>
                      Date d'ouverture *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date_ouverture"
                      value={newOffre.date_ouverture}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-calendar-check me-2 text-primary"></i>
                      Date de clôture *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date_cloture"
                      value={newOffre.date_cloture}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-user me-2 text-primary"></i>
                      Membre *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="membre"
                      value={newOffre.membre}
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Nom du membre responsable"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-paperclip me-2 text-primary"></i>
                      Fichier joint
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="fichier"
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Formats acceptés: PDF, DOC, ZIP. Taille max: 10MB
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              className="d-flex align-items-center"
              style={{ borderRadius: "10px", padding: "10px 20px" }}
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              onClick={handleAddOffre}
              disabled={loading}
              className="d-flex align-items-center"
              style={{ 
                borderRadius: "10px", 
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none"
              }}
            >
              <i className="fas fa-save me-2"></i>
              {loading ? "Création..." : "Créer l'appel d'offre"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AppelOffre;