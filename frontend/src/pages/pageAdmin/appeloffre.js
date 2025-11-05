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
  const [membres, setMembres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [newOffre, setNewOffre] = useState({
    intitule: "",
    type_contrat: "",
    membre_emetteur: "",
    localisation: "",
    salaire_remuneration: "",
    date_ouverture: "",
    date_cloture: "",
    description: "",
    fichier: null,
    statut: "Validé",
    est_urgent: false
  });

  // Données pour les listes déroulantes
  const typesContrat = [
    "CDI", "CDD", "Freelance", "Stage", "Alternance", 
    "Consultant", "Prestation", "Service", "Travail temporaire"
  ];

  const villesMadagascar = [
    "Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa", "Mahajanga",
    "Toliara", "Antsiranana", "Ambositra", "Ambatondrazaka", "Moramanga",
    "Taolagnaro", "Morondava", "Sambava", "Maroantsetra", "Maintirano"
  ];

  const regionsMadagascar = [
    "Analamanga", "Vakinankaratra", "Itasy", "Bongolava", "Haute Matsiatra",
    "Amoron'i Mania", "Vatovavy", "Fitovinany", "Atsimo-Atsinanana", "Ihorombe",
    "Menabe", "Atsimo-Andrefana", "Androy", "Anosy", "Alaotra-Mangoro",
    "Atsinanana", "Analanjirofo", "Sofia", "Boeny", "Betsiboka",
    "Melaky", "Diana", "Sava"
  ];
  
  // Afficher messages temporairement
  const showNotification = ( type, message) => {
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

  // Charger les membres
  const fetchMembres = async () => {
    try {
      const res = await axios.get(`${API_URL}/membres`);
      setMembres(res.data.data || res.data || []);
    } catch (err) {
      console.error("Erreur chargement membres:", err);
      // Données fictives pour les membres émetteurs
      setMembres([
        { id: 1, nom_entreprise: "Ministère du Transport" },
        { id: 2, nom_entreprise: "Ministère de l'Éducation" },
        { id: 3, nom_entreprise: "Ministère de la Santé" },
        { id: 4, nom_entreprise: "Ministère des Travaux Publics" },
        { id: 5, nom_entreprise: "Commune Urbaine d'Antananarivo" },
        { id: 6, nom_entreprise: "Société Nationale d'Eau" },
        { id: 7, nom_entreprise: "Office des Routes" },
        { id: 8, nom_entreprise: "Entreprise Publique d'Énergie" }
      ]);
    }
  };

  useEffect(() => {
    fetchAppelOffres();
    fetchMembres();
  }, []);

  // Ouvrir modal
  const handleShow = () => setShowModal(true);
  const handleClose = () => {
    setShowModal(false);
    setNewOffre({
      intitule: "",
      type_contrat: "",
      membre_emetteur: "",
      localisation: "",
      salaire_remuneration: "",
      date_ouverture: "",
      date_cloture: "",
      description: "",
      fichier: null,
      statut: "Validé",
      est_urgent: false
    });
    setPreviewFile(null);
  };

  // Changement de valeur des inputs
  const handleChange = (e) => {
    const { name, value, files, type, checked } = e.target;
    
    if (type === 'file') {
      const file = files[0];
      setNewOffre({ ...newOffre, fichier: file });
      
      // Prévisualisation du fichier
      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({
          url: fileURL,
          name: file.name,
          type: file.type
        });
      } else {
        setPreviewFile(null);
      }
    } else if (type === 'checkbox') {
      setNewOffre({ ...newOffre, [name]: checked });
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
    formData.append("type_contrat", newOffre.type_contrat);
    formData.append("membre_emetteur", newOffre.membre_emetteur);
    formData.append("localisation", newOffre.localisation);
    formData.append("salaire_remuneration", newOffre.salaire_remuneration);
    formData.append("date_ouverture", newOffre.date_ouverture);
    formData.append("date_cloture", newOffre.date_cloture);
    formData.append("description", newOffre.description);
    formData.append("statut", newOffre.statut);
    formData.append("est_urgent", newOffre.est_urgent ? "1" : "0");
    
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


  // Fonction pour obtenir l'URL du fichier
  const getFileUrl = (fichier) => {
    if (!fichier) return null;
    if (typeof fichier === 'string') {
      if (fichier.startsWith('http')) return fichier;
      return `${API_URL}/${fichier.replace(/^\//, '')}`;
    }
    return null;
  };

  // Fonction pour télécharger le fichier
  const handleDownloadFile = async (fichier, fileName) => {
    try {
      const fileUrl = getFileUrl(fichier);
      if (!fileUrl) {
        showNotification("error", "❌ Fichier non disponible");
        return;
      }

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document-appel-offre';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification("success", "✅ Téléchargement commencé");
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      showNotification("error", "❌ Erreur lors du téléchargement");
    }
  };

  // Fonction pour obtenir l'icône du fichier
  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'fa-file-pdf';
      case 'doc': case 'docx': return 'fa-file-word';
      case 'xls': case 'xlsx': return 'fa-file-excel';
      case 'ppt': case 'pptx': return 'fa-file-powerpoint';
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': return 'fa-file-image';
      case 'zip': case 'rar': case '7z': return 'fa-file-archive';
      case 'txt': return 'fa-file-alt';
      default: return 'fa-file';
    }
  };

  // Fonction pour obtenir la couleur du badge fichier
  const getFileBadgeVariant = (fileName) => {
    if (!fileName) return 'secondary';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'danger';
      case 'doc': case 'docx': return 'primary';
      case 'xls': case 'xlsx': return 'success';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'info';
      case 'zip': case 'rar': return 'warning';
      default: return 'secondary';
    }
  };

  // Composant pour afficher la prévisualisation du fichier
  const FilePreview = ({ file }) => {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <h6 className="mb-3">
          <i className="fas fa-eye me-2"></i>
          Aperçu du fichier
        </h6>
        
        {isImage ? (
          <div className="text-center">
            <img 
              src={file.url} 
              alt="Aperçu" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px', 
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />
            <p className="mt-2 mb-0 small text-muted">{file.name}</p>
          </div>
        ) : isPDF ? (
          <div className="text-center">
            <iframe 
              src={file.url} 
              title="Aperçu PDF"
              style={{ 
                width: '100%', 
                height: '300px', 
                border: 'none',
                borderRadius: '8px'
              }}
            />
            <p className="mt-2 mb-0 small text-muted">{file.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <i className={`fas ${getFileIcon(file.name)} fa-3x text-${getFileBadgeVariant(file.name)} mb-2`}></i>
            <p className="mb-0 small text-muted">{file.name}</p>
            <p className="small text-muted">Aperçu non disponible pour ce type de fichier</p>
          </div>
        )}
      </div>
    );
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

  // Fonction pour obtenir le nom d'affichage du membre
  const getMembreDisplayName = (membreId) => {
    const membre = membres.find(m => m.id == membreId);
    if (membre) {
      return membre.nom_entreprise || membre.nom_contact || membre.name || `Membre ${membreId}`;
    }
    return membreId || "Non assigné";
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
              title: "Urgents", 
              count: appelOffres.filter((offre) => offre.est_urgent).length, 
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
                      offre.est_urgent ? "#ff6b6b" :
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
                        <i className="fas fa-building text-primary me-2" style={{ width: "16px" }}></i>
                        <span>{getMembreDisplayName(offre.membre_emetteur)}</span>
                      </div>
                      
                      {offre.localisation && (
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-map-marker-alt text-primary me-2" style={{ width: "16px" }}></i>
                          <span>{offre.localisation}</span>
                        </div>
                      )}
                      
                      {offre.salaire_remuneration && (
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-money-bill-wave text-primary me-2" style={{ width: "16px" }}></i>
                          <span>{offre.salaire_remuneration}</span>
                        </div>
                      )}
                      
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

                      {/* Section Fichier avec aperçu et téléchargement */}
                      {offre.fichier && (
                        <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center">
                              <i className={`fas ${getFileIcon(getFileName(offre.fichier))} text-${getFileBadgeVariant(getFileName(offre.fichier))} me-2`}></i>
                              <span className="small fw-semibold">Document:</span>
                            </div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleDownloadFile(offre.fichier, getFileName(offre.fichier))}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "6px", fontSize: "0.7rem" }}
                            >
                              <i className="fas fa-download me-1"></i>
                              Télécharger
                            </Button>
                          </div>
                          <p className="small text-muted mb-2">{getFileName(offre.fichier)}</p>
                          
                          {/* Aperçu du fichier existant */}
                          {typeof offre.fichier === 'string' && (
                            <div className="text-center">
                              {getFileName(offre.fichier).match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                <img 
                                  src={getFileUrl(offre.fichier)} 
                                  alt="Aperçu" 
                                  style={{ 
                                    maxWidth: '100%', 
                                    maxHeight: '100px', 
                                    objectFit: 'contain',
                                    borderRadius: '6px'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              ) : (
                                <div className="py-2">
                                  <i className={`fas ${getFileIcon(getFileName(offre.fichier))} fa-2x text-${getFileBadgeVariant(getFileName(offre.fichier))} mb-2`}></i>
                                  <p className="small text-muted mb-0">Cliquez sur "Télécharger" pour voir le document</p>
                                </div>
                              )}
                            </div>
                          )}
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
        <Modal show={showModal} onHide={handleClose} size="lg" centered scrollable>
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
              {/* Intitulé */}
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
                  placeholder="Ex: Construction de la nouvelle école"
                />
              </Form.Group>

              <Row>
                {/* Type de Contrat */}
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-file-contract me-2 text-primary"></i>
                      Type de Contrat (UI SEULEMENT)
                    </Form.Label>
                    <Form.Select
                      name="type_contrat"
                      value={newOffre.type_contrat}
                      onChange={handleChange}
                      style={{ 
                        borderRadius: "10px", 
                        padding: "12px",
                        maxHeight: "200px",
                        overflowY: "auto"
                      }}
                    >
                      <option value="">Sélectionnez un type de contrat</option>
                      {typesContrat.map((type, index) => (
                        <option key={index} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Statut */}
                <Col md={6}>
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
                      <option value="Validé">Validé</option>
                      <option value="En attente">En attente</option>
                      <option value="Actif">Actif</option>
                      <option value="Clôturé">Clôturé</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Membre émetteur */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-building me-2 text-primary"></i>
                  Membre émetteur *
                </Form.Label>
                <Form.Control
                  type="text"
                  name="membre_emetteur"
                  value={newOffre.membre_emetteur}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: "10px", padding: "12px" }}
                  placeholder="Ex: Ministère du Transport"
                />
              </Form.Group>

              <Row>
                {/* Localisation */}
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                      Localisation (UI SEULEMENT)
                    </Form.Label>
                    <Form.Select
                      name="localisation"
                      value={newOffre.localisation}
                      onChange={handleChange}
                      style={{ 
                        borderRadius: "10px", 
                        padding: "12px",
                        maxHeight: "200px",
                        overflowY: "auto"
                      }}
                    >
                      <option value="">Sélectionnez une localisation</option>
                      <optgroup label="Villes">
                        {villesMadagascar.map((ville, index) => (
                          <option key={`ville-${index}`} value={ville}>{ville}</option>
                        ))}
                      </optgroup>
                      <optgroup label="Régions">
                        {regionsMadagascar.map((region, index) => (
                          <option key={`region-${index}`} value={region}>{region}</option>
                        ))}
                      </optgroup>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {/* Salaire/Rémunération */}
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-money-bill-wave me-2 text-primary"></i>
                      Salaire/Rémunération (UI SEULEMENT)
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="salaire_remuneration"
                      value={newOffre.salaire_remuneration}
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Ex: 1 500 000 Ar, À négocier"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                {/* Date d'ouverture */}
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-calendar-plus me-2 text-primary"></i>
                      Date d'ouverture
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date_ouverture"
                      value={newOffre.date_ouverture}
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                  </Form.Group>
                </Col>

                {/* Date de clôture */}
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

              {/* Fichier */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-paperclip me-2 text-primary"></i>
                  Fichier (PDF, Doc, max 10Mo)
                </Form.Label>
                <Form.Control
                  type="file"
                  name="fichier"
                  onChange={handleChange}
                  style={{ borderRadius: "10px", padding: "12px" }}
                  accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png"
                />
                <Form.Text className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Formats acceptés: PDF, DOC, ZIP, Images. Taille max: 10MB
                </Form.Text>
              </Form.Group>

              {/* Aperçu du fichier sélectionné */}
              <FilePreview file={previewFile} />

              {/* Description */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-align-left me-2 text-primary"></i>
                  Description *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={newOffre.description}
                  onChange={handleChange}
                  required
                  style={{ borderRadius: "10px", padding: "12px" }}
                  placeholder="Décrivez les détails de l'appel d'offre, les spécifications, etc."
                />
              </Form.Group>

              {/* Marquer comme urgent */}
              <Form.Group className="mb-4">
                <Form.Check
                  type="checkbox"
                  name="est_urgent"
                  checked={newOffre.est_urgent}
                  onChange={handleChange}
                  label={
                    <span className="fw-semibold">
                      <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
                      Marquer comme appel urgent (UI SEULEMENT)
                    </span>
                  }
                />
                <Form.Text className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Les offres urgentes seront mises en avant. (Note: ce champ n'est pas sauvegardé dans la BDD pour l'instant)
                </Form.Text>
              </Form.Group>
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