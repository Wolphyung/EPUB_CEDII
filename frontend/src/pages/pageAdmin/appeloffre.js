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
  Spinner
} from "react-bootstrap";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const AppelOffreAdmin = () => {
  const [appelOffres, setAppelOffres] = useState([]);
  const [membres, setMembres] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [editOffre, setEditOffre] = useState(null);
  const [errors, setErrors] = useState({});
  const [statsLoading, setStatsLoading] = useState({});
  const [actionLoading, setActionLoading] = useState(null);

  const [newOffre, setNewOffre] = useState({
    intitule: "",
    type: "",
    membre: "",
    localisation: "",
    salaire: "",
    date_ouverture: "",
    date_cloture: "",
    description: "",
    fichier: null,
    statut: "Validé",
    urgent: false
  });

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

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: "", message: "" }), 5000);
  };

  // Fonction pour charger les statistiques d'une offre
  const fetchOffreStats = async (offreId) => {
    setStatsLoading(prev => ({ ...prev, [offreId]: true }));
    try {
      const response = await axios.get(`${API_URL}/appeloffres/${offreId}/stats`);
      return response.data.stats || {
        total_views: 0,
        total_reactions: 0,
        reactions_by_type: {}
      };
    } catch (error) {
      console.warn(`Stats non disponibles pour l'offre ${offreId}:`, error.message);
      return {
        total_views: 0,
        total_reactions: 0,
        reactions_by_type: {}
      };
    } finally {
      setStatsLoading(prev => ({ ...prev, [offreId]: false }));
    }
  };

  const fetchAppelOffres = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/appeloffres`);
      const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
      
      // Charger les statistiques pour chaque offre validée
      const offresWithStats = await Promise.all(
        data.map(async (offre) => {
          if (offre.statut === "Validé") {
            const stats = await fetchOffreStats(offre.id);
            return {
              ...offre,
              stats
            };
          }
          return offre;
        })
      );
      
      setAppelOffres(offresWithStats);
    } catch (err) {
      showNotification("error", "Erreur lors du chargement des offres");
    } finally {
      setLoading(false);
    }
  };

  const fetchMembres = async () => {
    try {
      const res = await axios.get(`${API_URL}/membres`);
      setMembres(res.data.data || res.data || []);
    } catch (err) {
      // Fallback si l'API membres n'est pas disponible
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

  const handleCloseAdd = () => {
    setShowAddModal(false);
    resetNewOffre();
    setPreviewFile(null);
    setErrors({});
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditOffre(null);
    setPreviewFile(null);
    setErrors({});
  };

  const resetNewOffre = () => {
    setNewOffre({
      intitule: "",
      type: "",
      membre: "",
      localisation: "",
      salaire: "",
      date_ouverture: "",
      date_cloture: "",
      description: "",
      fichier: null,
      statut: "Validé",
      urgent: false
    });
    setErrors({});
  };

  const handleChange = (e, isEdit = false) => {
    const { name, value, files, type, checked } = e.target;
    const setState = isEdit ? setEditOffre : setNewOffre;
    const current = isEdit ? editOffre : newOffre;

    if (type === 'file') {
      const file = files[0];
      setState({ ...current, fichier: file });
      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({ url: fileURL, name: file.name, type: file.type });
      } else {
        setPreviewFile(null);
      }
    } else if (type === 'checkbox') {
      setState({ ...current, [name]: checked });
    } else {
      setState({ ...current, [name]: value || "" });
    }
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.intitule.trim()) newErrors.intitule = "Le titre est obligatoire";
    if (!data.membre.trim()) newErrors.membre = "Le membre émetteur est obligatoire";
    if (!data.date_cloture) newErrors.date_cloture = "La date de clôture est obligatoire";
    if (!data.description.trim()) newErrors.description = "La description est obligatoire";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddOffre = async (e) => {
    e.preventDefault();
    if (!validateForm(newOffre)) {
      showNotification("error", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(newOffre).forEach(key => {
        if (key === 'fichier' && newOffre.fichier) {
          formData.append(key, newOffre.fichier);
        } else if (key === 'urgent') {
          formData.append(key, newOffre.urgent ? "1" : "0");
        } else if (newOffre[key] !== null && newOffre[key] !== undefined && newOffre[key] !== '') {
          formData.append(key, newOffre[key]);
        }
      });

      const res = await axios.post(`${API_URL}/appeloffres`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setAppelOffres(prev => [res.data.data || res.data, ...prev]);
      showNotification("success", "Appel d'offre ajouté avec succès");
      handleCloseAdd();
    } catch (err) {
      console.error(err.response?.data);
      showNotification("error", "Erreur lors de l'ajout");
    } finally {
      setLoading(false);
    }
  };

  const handleEditShow = async (offre) => {
    setEditOffre({
      id: offre.id,
      intitule: offre.intitule || "",
      type: offre.type || "",
      membre: offre.membre || "",
      localisation: offre.localisation || "",
      salaire: offre.salaire || "",
      date_ouverture: offre.date_ouverture?.split('T')[0] || "",
      date_cloture: offre.date_cloture?.split('T')[0] || "",
      description: offre.description || "",
      fichier: offre.fichier || null,
      statut: offre.statut || "Validé",
      urgent: Boolean(offre.urgent),
      stats: offre.stats || {
        total_views: 0,
        total_reactions: 0,
        reactions_by_type: {}
      }
    });
    setShowEditModal(true);
    setPreviewFile(null);
    setErrors({});
  };

  const handleSaveEdit = async () => {
    if (!editOffre?.id) return;
    if (!validateForm(editOffre)) {
      showNotification("error", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      Object.keys(editOffre).forEach(key => {
        if (key === 'fichier' && editOffre.fichier instanceof File) {
          formData.append(key, editOffre.fichier);
        } 
        else if (key !== 'fichier' && editOffre[key] !== null && editOffre[key] !== undefined && editOffre[key] !== '') {
          formData.append(key, editOffre[key]);
        }
      });
      formData.append('urgent', editOffre.urgent ? "1" : "0");
      formData.append("_method", "PUT");

      const res = await axios.post(`${API_URL}/appeloffres/${editOffre.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const updated = res.data.data || res.data;
      setAppelOffres(prev => prev.map(o => o.id === editOffre.id ? updated : o));
      showNotification("success", "Appel d'offre modifié avec succès");
      handleCloseEdit();
    } catch (err) {
      console.error(err.response?.data);
      showNotification("error", "Erreur lors de la modification");
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NOUVELLE FONCTION : Valider ou rejeter une offre
  const handleValidateOffre = async (id, newStatus) => {
    setActionLoading(id);
    try {
      const formData = new FormData();
      formData.append("statut", newStatus);
      formData.append("_method", "PUT");
      
      const res = await axios.post(`${API_URL}/appeloffres/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      const updatedOffre = res.data.data || res.data;
      
      // Recharger les stats si le statut devient "Validé"
      if (newStatus === "Validé") {
        const stats = await fetchOffreStats(id);
        updatedOffre.stats = stats;
      }
      
      setAppelOffres(prev => prev.map(o => o.id === id ? updatedOffre : o));
      
      const message = newStatus === "Validé" 
        ? "Offre validée avec succès !" 
        : "Offre rejetée avec succès !";
      
      showNotification("success", message);
    } catch (err) {
      showNotification("error", "Erreur lors du changement de statut");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Confirmer la suppression ?")) return;
    try {
      await axios.delete(`${API_URL}/appeloffres/${id}`);
      setAppelOffres(prev => prev.filter(o => o.id !== id));
      showNotification("success", "Appel d'offre supprimé");
    } catch (err) {
      showNotification("error", "Erreur lors de la suppression");
    }
  };

  const getFileUrl = (fichier) => {
    if (!fichier) return null;
    if (typeof fichier === 'string') {
      if (fichier.startsWith('http')) return fichier;
      return `${API_URL}/${fichier.replace(/^\//, '')}`;
    }
    return null;
  };

  const handleDownloadFile = async (fichier, fileName) => {
    try {
      const fileUrl = getFileUrl(fichier);
      if (!fileUrl) throw new Error("URL manquante");
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification("success", "Téléchargement démarré");
    } catch (error) {
      showNotification("error", "Erreur de téléchargement");
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons = { 
      pdf: 'fa-file-pdf', 
      doc: 'fa-file-word', 
      docx: 'fa-file-word', 
      xls: 'fa-file-excel', 
      xlsx: 'fa-file-excel', 
      jpg: 'fa-file-image', 
      jpeg: 'fa-file-image', 
      png: 'fa-file-image', 
      zip: 'fa-file-archive' 
    };
    return icons[ext] || 'fa-file';
  };

  const getFileBadgeVariant = (fileName) => {
    if (!fileName) return 'secondary';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const variants = { 
      pdf: 'danger', 
      doc: 'primary', 
      docx: 'primary', 
      xls: 'success', 
      xlsx: 'success' 
    };
    return variants[ext] || 'secondary';
  };

  // Composant pour afficher les statistiques
  const StatsDisplay = ({ stats, offreId, statut }) => {
    if (!stats || statut !== "Validé") return null;

    const { total_views, total_reactions, reactions_by_type } = stats;

    return (
      <div className="stats-container mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <h6 className="mb-3 d-flex align-items-center">
          <i className="fas fa-chart-bar me-2 text-primary"></i>
          Statistiques d'engagement
          {statsLoading[offreId] && (
            <div className="spinner-border spinner-border-sm text-primary ms-2" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
          )}
        </h6>
        
        <div className="row text-center">
          {/* Vues */}
          <div className="col-4">
            <div className="d-flex flex-column align-items-center">
              <div className="stats-icon mb-1">
                <i className="fas fa-eye text-info fs-5"></i>
              </div>
              <div className="stats-number fw-bold text-dark">{total_views || 0}</div>
              <div className="stats-label small text-muted">Vues</div>
            </div>
          </div>
          
          {/* Réactions totales */}
          <div className="col-4">
            <div className="d-flex flex-column align-items-center">
              <div className="stats-icon mb-1">
                <i className="fas fa-heart text-danger fs-5"></i>
              </div>
              <div className="stats-number fw-bold text-dark">{total_reactions || 0}</div>
              <div className="stats-label small text-muted">Réactions</div>
            </div>
          </div>
          
          {/* Taux d'engagement */}
          <div className="col-4">
            <div className="d-flex flex-column align-items-center">
              <div className="stats-icon mb-1">
                <i className="fas fa-chart-line text-success fs-5"></i>
              </div>
              <div className="stats-number fw-bold text-dark">
                {total_views > 0 ? Math.round((total_reactions / total_views) * 100) : 0}%
              </div>
              <div className="stats-label small text-muted">Engagement</div>
            </div>
          </div>
        </div>

        {/* Détail des réactions */}
        {total_reactions > 0 && (
          <div className="mt-3 pt-3 border-top">
            <div className="d-flex justify-content-center gap-3">
              {/* Like */}
              {reactions_by_type.like > 0 && (
                <div className="d-flex align-items-center text-primary reaction-item">
                  <i className="fas fa-thumbs-up me-1"></i>
                  <span className="fw-semibold">{reactions_by_type.like}</span>
                </div>
              )}
              
              {/* Love */}
              {reactions_by_type.love > 0 && (
                <div className="d-flex align-items-center text-danger reaction-item">
                  <i className="fas fa-heart me-1"></i>
                  <span className="fw-semibold">{reactions_by_type.love}</span>
                </div>
              )}
              
              {/* Wow */}
              {reactions_by_type.wow > 0 && (
                <div className="d-flex align-items-center text-warning reaction-item">
                  <i className="fas fa-surprise me-1"></i>
                  <span className="fw-semibold">{reactions_by_type.wow}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const FilePreview = ({ file }) => {
    if (!file) return null;
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <h6 className="mb-3"><i className="fas fa-eye me-2"></i>Aperçu du fichier</h6>
        {isImage ? (
          <div className="text-center">
            <img src={file.url} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
            <p className="mt-2 mb-0 small text-muted">{file.name}</p>
          </div>
        ) : isPDF ? (
          <div className="text-center">
            <iframe src={file.url} title="PDF" style={{ width: '100%', height: '300px', border: 'none', borderRadius: '8px' }} />
            <p className="mt-2 mb-0 small text-muted">{file.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <i className={`fas ${getFileIcon(file.name)} fa-3x text-${getFileBadgeVariant(file.name)} mb-2`}></i>
            <p className="mb-0 small text-muted">{file.name}</p>
            <p className="small text-muted">Aperçu non disponible</p>
          </div>
        )}
      </div>
    );
  };

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
    const map = { 
      "Validé": "success", 
      "En attente": "warning", 
      "Rejeté": "danger", 
      "Actif": "primary", 
      "Clôturé": "secondary" 
    };
    return map[statut] || "secondary";
  };

  const getStatusIcon = (statut) => {
    const map = { 
      "Validé": "fa-check-circle", 
      "En attente": "fa-clock", 
      "Rejeté": "fa-times-circle", 
      "Actif": "fa-play-circle", 
      "Clôturé": "fa-flag-checkered" 
    };
    return map[statut] || "fa-question-circle";
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
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

  const getMembreDisplayName = (membre) => {
    if (!membre) return 'Non assigné';
    const found = membres.find(m => m.id == membre);
    return found ? (found.nom_entreprise || found.nom_contact || found.name || `Membre ${membre}`) : membre;
  };

  // Calcul des statistiques globales
  const totalVues = appelOffres.reduce((sum, offre) => sum + (offre.stats?.total_views || 0), 0);
  const totalReactions = appelOffres.reduce((sum, offre) => sum + (offre.stats?.total_reactions || 0), 0);

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {showAlert.show && (
          <Alert variant={showAlert.type === "success" ? "success" : "danger"}
            className="d-flex align-items-center shadow-lg border-0"
            style={{
              position: "fixed", top: "20px", right: "20px", zIndex: 1050,
              minWidth: "350px", borderRadius: "15px",
              borderLeft: `4px solid ${showAlert.type === "success" ? "#28a745" : "#dc3545"}`,
              backdropFilter: "blur(10px)", backgroundColor: "rgba(255, 255, 255, 0.95)"
            }}>
            <i className={`fas ${showAlert.type === "success" ? "fa-check-circle text-success" : "fa-exclamation-triangle text-danger"} me-3 fs-5`}></i>
            <div>
              <strong className="d-block">{showAlert.type === "success" ? "Succès" : "Erreur"}</strong>
              <span className="text-muted">{showAlert.message}</span>
            </div>
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ background: "linear-gradient(135deg, #2c3e50, #34495e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Gestion des Appels d'Offre
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-file-contract me-2"></i>
              Validez, rejetez et gérez les appels d'offre des membres
            </p>
          </div>
          <Button variant="success" onClick={() => setShowAddModal(true)} className="d-flex align-items-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #00b09b, #96c93d)", border: "none", borderRadius: "12px", padding: "12px 24px", fontWeight: "600" }}>
            <i className="fas fa-plus me-2"></i>Nouvel appel d'offre
          </Button>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          {[
            { title: "Total", count: appelOffres.length, icon: "fa-file-contract", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
            { title: "En attente", count: appelOffres.filter(o => o.statut === "En attente").length, icon: "fa-clock", color: "linear-gradient(135deg, #00b09b, #96c93d)" },
            { title: "Validés", count: appelOffres.filter(o => o.statut === "Validé").length, icon: "fa-check-circle", color: "linear-gradient(135deg, #4facfe, #00f2fe)" },
            { title: "Rejetés", count: appelOffres.filter(o => o.statut === "Rejeté").length, icon: "fa-times-circle", color: "linear-gradient(135deg, #f093fb, #f5576c)" },
            { title: "Urgents", count: appelOffres.filter(o => o.urgent).length, icon: "fa-exclamation-triangle", color: "linear-gradient(135deg, #ff9a9e, #fecfef)" },
            { title: "Vues totales", count: totalVues, icon: "fa-eye", color: "linear-gradient(135deg, #a8edea, #fed6e3)" }
          ].map((stat, i) => (
            <Col md={4} lg={2} key={i} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2 small">{stat.title}</h6>
                      <h4 className="fw-bold mb-0" style={{ background: stat.color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {stat.count}
                      </h4>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "45px", height: "45px", background: stat.color }}>
                      <i className={`fas ${stat.icon} text-white`}></i>
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
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-search me-2"></i>Recherche</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", color: "white" }}><i className="fas fa-search"></i></InputGroup.Text>
                    <Form.Control type="text" placeholder="Rechercher par titre ou description..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ borderRadius: "0 10px 10px 0" }} />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-filter me-2"></i>Statut</Form.Label>
                  <Form.Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} style={{ borderRadius: "10px" }}>
                    <option value="Tous">Tous</option>
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
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-sort me-2"></i>Trier par</Form.Label>
                  <Form.Select style={{ borderRadius: "10px" }}>
                    <option>Date d'ouverture</option>
                    <option>Date de clôture</option>
                    <option>Titre</option>
                    <option>Statut</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" onClick={fetchAppelOffres} style={{ borderRadius: "10px" }}><i className="fas fa-refresh"></i></Button>
                  <Button variant="outline-secondary" onClick={clearFilters} style={{ borderRadius: "10px" }}><i className="fas fa-times"></i></Button>
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
            <p className="text-muted fw-semibold">Chargement des offres...</p>
          </div>
        ) : (
          <Row>
            {filteredOffres.map((offre) => (
              <Col md={6} lg={4} key={offre.id} className="mb-4">
                <Card className="border-0 shadow-sm h-100" style={{ 
                  borderRadius: "20px", 
                  transition: "transform 0.2s",
                  borderLeft: `4px solid ${
                    offre.urgent ? "#ff6b6b" : 
                    offre.statut === "Validé" ? "#28a745" : 
                    offre.statut === "En attente" ? "#ffc107" : 
                    offre.statut === "Rejeté" ? "#dc3545" : "#6c757d"
                  }`
                }}>
                  <Card.Body className="d-flex flex-column p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="flex-grow-1">
                        <Card.Title className="h5 fw-bold mb-1" style={{ lineHeight: "1.3", color: "#2c3e50" }}>
                          {offre.intitule}
                          {offre.urgent && <Badge bg="danger" className="ms-2"><i className="fas fa-exclamation-triangle me-1"></i>Urgent</Badge>}
                        </Card.Title>
                        {offre.type && <Badge bg="info" className="mb-2">{offre.type}</Badge>}
                      </div>
                      <Badge bg={getStatusVariant(offre.statut)} className="d-flex align-items-center" style={{ borderRadius: "20px", padding: "6px 12px", fontSize: "0.75rem", fontWeight: "600" }}>
                        <i className={`fas ${getStatusIcon(offre.statut)} me-1`}></i>{offre.statut}
                      </Badge>
                    </div>

                    <Card.Text className="text-muted flex-grow-1 mb-3" style={{ lineHeight: "1.5", fontSize: "0.9rem" }}>
                      {offre.description?.length > 120 ? `${offre.description.substring(0, 120)}...` : offre.description}
                    </Card.Text>

                    <div className="small text-muted mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-building text-primary me-2"></i>
                        <span>{getMembreDisplayName(offre.membre)}</span>
                      </div>
                      {offre.localisation && (
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-map-marker-alt text-primary me-2"></i>
                          <span>{offre.localisation}</span>
                        </div>
                      )}
                      {offre.salaire && (
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-money-bill-wave text-primary me-2"></i>
                          <span>{offre.salaire}</span>
                        </div>
                      )}
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-calendar-plus text-primary me-2"></i>
                        <span>Ouverture: {formatDate(offre.date_ouverture)}</span>
                      </div>
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-calendar-check text-primary me-2"></i>
                        <span>
                          Clôture: {formatDate(offre.date_cloture)}
                          {isDatePassed(offre.date_cloture) && (
                            <Badge bg="danger" className="ms-2" style={{ fontSize: "0.65rem" }}>Expiré</Badge>
                          )}
                        </span>
                      </div>

                      {offre.fichier && (
                        <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <div className="d-flex align-items-center">
                              <i className={`fas ${getFileIcon(getFileName(offre.fichier))} text-${getFileBadgeVariant(getFileName(offre.fichier))} me-2`}></i>
                              <span className="small fw-semibold">Document:</span>
                            </div>
                            <Button variant="outline-primary" size="sm" onClick={() => handleDownloadFile(offre.fichier, getFileName(offre.fichier))} style={{ borderRadius: "6px", fontSize: "0.7rem" }}>
                              <i className="fas fa-download me-1"></i>Télécharger
                            </Button>
                          </div>
                          <p className="small text-muted mb-2">{getFileName(offre.fichier)}</p>
                        </div>
                      )}
                    </div>

                    {/* Affichage des statistiques */}
                    <StatsDisplay stats={offre.stats} offreId={offre.id} statut={offre.statut} />

                    <div className="mt-auto pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        {/* Boutons de validation/rejet pour l'admin */}
                        <div className="d-flex gap-1">
                          {offre.statut === "En attente" && (
                            <>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => handleValidateOffre(offre.id, "Validé")} 
                                disabled={actionLoading === offre.id}
                                title="Valider cette offre"
                              >
                                {actionLoading === offre.id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <><i className="fas fa-check me-1"></i>Valider</>
                                )}
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => handleValidateOffre(offre.id, "Rejeté")} 
                                disabled={actionLoading === offre.id}
                                title="Rejeter cette offre"
                              >
                                {actionLoading === offre.id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <><i className="fas fa-times me-1"></i>Rejeter</>
                                )}
                              </Button>
                            </>
                          )}
                          
                          {offre.statut === "Rejeté" && (
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              onClick={() => handleValidateOffre(offre.id, "Validé")} 
                              disabled={actionLoading === offre.id}
                              title="Valider cette offre"
                            >
                              {actionLoading === offre.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <><i className="fas fa-check me-1"></i>Valider</>
                              )}
                            </Button>
                          )}
                          
                          {offre.statut === "Validé" && (
                            <Button 
                              variant="outline-warning" 
                              size="sm" 
                              onClick={() => handleValidateOffre(offre.id, "Rejeté")} 
                              disabled={actionLoading === offre.id}
                              title="Rejeter cette offre"
                            >
                              {actionLoading === offre.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <><i className="fas fa-times me-1"></i>Rejeter</>
                              )}
                            </Button>
                          )}
                        </div>

                        <div className="d-flex gap-1">
                          <Button variant="outline-warning" size="sm" onClick={() => handleEditShow(offre)} title="Modifier">
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button variant="outline-danger" size="sm" onClick={() => handleDelete(offre.id)} title="Supprimer">
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
                    <Button variant="primary" onClick={clearFilters} className="d-flex align-items-center mx-auto">
                      <i className="fas fa-times me-2"></i>Effacer les filtres
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* Modal Ajout */}
        <Modal show={showAddModal} onHide={handleCloseAdd} size="lg" centered scrollable>
          <Modal.Header closeButton className="border-0" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
            <Modal.Title className="d-flex align-items-center fw-bold"><i className="fas fa-plus me-2"></i>Ajouter un Appel d'Offre</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleAddOffre}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted"><i className="fas fa-heading me-2 text-primary"></i>Titre de l'offre *</Form.Label>
                <Form.Control type="text" name="intitule" value={newOffre.intitule} onChange={handleChange} isInvalid={!!errors.intitule} required style={{ borderRadius: "10px", padding: "12px" }} placeholder="Ex: Construction d'un pont à Toamasina" />
                <Form.Control.Feedback type="invalid">{errors.intitule}</Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-file-contract me-2 text-primary"></i>Type de contrat</Form.Label>
                    <Form.Select name="type" value={newOffre.type} onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }}>
                      <option value="">Sélectionner un type</option>
                      {typesContrat.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-chart-line me-2 text-primary"></i>Statut *</Form.Label>
                    <Form.Select name="statut" value={newOffre.statut} onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }}>
                      <option value="Validé">Validé</option>
                      <option value="En attente">En attente</option>
                      <option value="Rejeté">Rejeté</option>
                      <option value="Actif">Actif</option>
                      <option value="Clôturé">Clôturé</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted"><i className="fas fa-building me-2 text-primary"></i>Membre émetteur *</Form.Label>
                <Form.Control type="text" name="membre" value={newOffre.membre} onChange={handleChange} isInvalid={!!errors.membre} required style={{ borderRadius: "10px", padding: "12px" }} placeholder="Ex: Ministère des Travaux Publics" />
                <Form.Control.Feedback type="invalid">{errors.membre}</Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-map-marker-alt me-2 text-primary"></i>Localisation</Form.Label>
                    <Form.Select name="localisation" value={newOffre.localisation} onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }}>
                      <option value="">Sélectionner une localisation</option>
                      <optgroup label="Villes">{villesMadagascar.map((v, i) => <option key={`v-${i}`} value={v}>{v}</option>)}</optgroup>
                      <optgroup label="Régions">{regionsMadagascar.map((r, i) => <option key={`r-${i}`} value={r}>{r}</option>)}</optgroup>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-money-bill-wave me-2 text-primary"></i>Salaire / Rémunération</Form.Label>
                    <Form.Control type="text" name="salaire" value={newOffre.salaire} onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }} placeholder="Ex: 2 500 000 Ar" />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-calendar-plus me-2 text-primary"></i>Date d'ouverture</Form.Label>
                    <Form.Control type="date" name="date_ouverture" value={newOffre.date_ouverture} onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-calendar-check me-2 text-primary"></i>Date de clôture *</Form.Label>
                    <Form.Control type="date" name="date_cloture" value={newOffre.date_cloture} onChange={handleChange} isInvalid={!!errors.date_cloture} required style={{ borderRadius: "10px", padding: "12px" }} />
                    <Form.Control.Feedback type="invalid">{errors.date_cloture}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted"><i className="fas fa-paperclip me-2 text-primary"></i>Fichier joint</Form.Label>
                <Form.Control type="file" name="fichier" onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }} accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png" />
                <Form.Text className="text-muted"><i className="fas fa-info-circle me-1"></i>Formats acceptés : PDF, DOC, DOCX, ZIP, JPG, PNG</Form.Text>
              </Form.Group>

              <FilePreview file={previewFile} />

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted"><i className="fas fa-align-left me-2 text-primary"></i>Description *</Form.Label>
                <Form.Control as="textarea" rows={5} name="description" value={newOffre.description} onChange={handleChange} isInvalid={!!errors.description} required style={{ borderRadius: "10px", padding: "12px" }} placeholder="Décrivez l'appel d'offre en détail..." />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check type="checkbox" name="urgent" checked={newOffre.urgent} onChange={handleChange}
                  label={<span className="fw-semibold"><i className="fas fa-exclamation-triangle me-2 text-warning"></i>Marquer comme urgent</span>} />
                <Form.Text className="text-muted"><i className="fas fa-info-circle me-1"></i>Cet appel d'offre sera mis en avant</Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={handleCloseAdd} style={{ borderRadius: "10px", padding: "10px 20px" }}>
              <i className="fas fa-times me-2"></i>Annuler
            </Button>
            <Button variant="primary" onClick={handleAddOffre} disabled={loading} style={{ borderRadius: "10px", padding: "10px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none" }}>
              <i className="fas fa-save me-2"></i>{loading ? "Création..." : "Créer l'offre"}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Modification */}
        {editOffre && (
          <Modal show={showEditModal} onHide={handleCloseEdit} size="lg" centered scrollable>
            <Modal.Header closeButton className="border-0" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
              <Modal.Title className="d-flex align-items-center fw-bold"><i className="fas fa-edit me-2"></i>Modifier l'Appel d'Offre</Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted"><i className="fas fa-heading me-2 text-primary"></i>Titre de l'offre *</Form.Label>
                  <Form.Control type="text" name="intitule" value={editOffre.intitule} onChange={(e) => handleChange(e, true)} isInvalid={!!errors.intitule} required style={{ borderRadius: "10px", padding: "12px" }} />
                  <Form.Control.Feedback type="invalid">{errors.intitule}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-file-contract me-2 text-primary"></i>Type de contrat</Form.Label>
                      <Form.Select name="type" value={editOffre.type} onChange={(e) => handleChange(e, true)} style={{ borderRadius: "10px", padding: "12px" }}>
                        <option value="">Sélectionner un type</option>
                        {typesContrat.map((t, i) => <option key={i} value={t}>{t}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-chart-line me-2 text-primary"></i>Statut *</Form.Label>
                      <Form.Select name="statut" value={editOffre.statut} onChange={(e) => handleChange(e, true)} style={{ borderRadius: "10px", padding: "12px" }}>
                        <option value="Validé">Validé</option>
                        <option value="En attente">En attente</option>
                        <option value="Rejeté">Rejeté</option>
                        <option value="Actif">Actif</option>
                        <option value="Clôturé">Clôturé</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted"><i className="fas fa-building me-2 text-primary"></i>Membre émetteur *</Form.Label>
                  <Form.Control type="text" name="membre" value={editOffre.membre} onChange={(e) => handleChange(e, true)} isInvalid={!!errors.membre} required style={{ borderRadius: "10px", padding: "12px" }} />
                  <Form.Control.Feedback type="invalid">{errors.membre}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-map-marker-alt me-2 text-primary"></i>Localisation</Form.Label>
                      <Form.Select name="localisation" value={editOffre.localisation} onChange={(e) => handleChange(e, true)} style={{ borderRadius: "10px", padding: "12px" }}>
                        <option value="">Sélectionner une localisation</option>
                        <optgroup label="Villes">{villesMadagascar.map((v, i) => <option key={`v-${i}`} value={v}>{v}</option>)}</optgroup>
                        <optgroup label="Régions">{regionsMadagascar.map((r, i) => <option key={`r-${i}`} value={r}>{r}</option>)}</optgroup>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-money-bill-wave me-2 text-primary"></i>Salaire / Rémunération</Form.Label>
                    <Form.Control type="text" name="salaire" value={editOffre.salaire} onChange={(e) => handleChange(e, true)} style={{ borderRadius: "10px", padding: "12px" }} />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-calendar-plus me-2 text-primary"></i>Date d'ouverture</Form.Label>
                    <Form.Control type="date" name="date_ouverture" value={editOffre.date_ouverture} onChange={(e) => handleChange(e, true)} style={{ borderRadius: "10px", padding: "12px" }} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-calendar-check me-2 text-primary"></i>Date de clôture *</Form.Label>
                    <Form.Control type="date" name="date_cloture" value={editOffre.date_cloture} onChange={(e) => handleChange(e, true)} isInvalid={!!errors.date_cloture} required style={{ borderRadius: "10px", padding: "12px" }} />
                    <Form.Control.Feedback type="invalid">{errors.date_cloture}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted"><i className="fas fa-paperclip me-2 text-primary"></i>Fichier joint</Form.Label>
                  <Form.Control type="file" name="fichier" onChange={(e) => handleChange(e, true)} style={{ borderRadius: "10px", padding: "12px" }} accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png" />
                  {editOffre.fichier && typeof editOffre.fichier === 'string' && (
                    <div className="mt-2">
                      <small className="text-muted d-block"><i className="fas fa-file me-1"></i>Fichier actuel: {getFileName(editOffre.fichier)}</small>
                      <Button variant="outline-primary" size="sm" onClick={() => handleDownloadFile(editOffre.fichier, getFileName(editOffre.fichier))} style={{ borderRadius: "6px", fontSize: "0.7rem" }} className="mt-1">
                        <i className="fas fa-download me-1"></i>Télécharger
                      </Button>
                    </div>
                  )}
                </Form.Group>

                <FilePreview file={previewFile} />

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted"><i className="fas fa-align-left me-2 text-primary"></i>Description *</Form.Label>
                  <Form.Control as="textarea" rows={5} name="description" value={editOffre.description} onChange={(e) => handleChange(e, true)} isInvalid={!!errors.description} required style={{ borderRadius: "10px", padding: "12px" }} />
                  <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check type="checkbox" name="urgent" checked={editOffre.urgent} onChange={(e) => handleChange(e, true)}
                    label={<span className="fw-semibold"><i className="fas fa-exclamation-triangle me-2 text-warning"></i>Marquer comme urgent</span>} />
                </Form.Group>

                {/* Affichage des statistiques dans le modal d'édition */}
                {editOffre.statut === "Validé" && (
                  <StatsDisplay stats={editOffre.stats} offreId={editOffre.id} statut={editOffre.statut} />
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="outline-secondary" onClick={handleCloseEdit} style={{ borderRadius: "10px", padding: "10px 20px" }}>
                <i className="fas fa-times me-2"></i>Annuler
              </Button>
              <Button variant="primary" onClick={handleSaveEdit} disabled={loading} style={{ borderRadius: "10px", padding: "10px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none" }}>
                <i className="fas fa-save me-2"></i>{loading ? "Sauvegarde..." : "Enregistrer"}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>

      <style>{`
        .stats-container {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 12px;
          border: 1px solid #e9ecef;
        }
        .stats-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.8);
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .stats-number {
          font-size: 1.25rem;
          margin: 4px 0;
        }
        .stats-label {
          font-size: 0.75rem;
          opacity: 0.8;
        }
        .reaction-item {
          padding: 6px 12px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          font-size: 0.875rem;
        }
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default AppelOffreAdmin;