// src/pages/membre/EvenementMembre.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Form,
  Modal,
  Card,
  Row,
  Col,
  Badge,
  Alert,
  Spinner,
  InputGroup
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaHeart,
  FaChartLine,
  FaUsers,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaMapMarkerAlt,
  FaUserTie,
  FaTag,
  FaSearch,
  FaDownload,
  FaTimes,
  FaVideo,
  FaGlobe,
  FaRegClock,
  FaFilter,
  FaCloudUploadAlt,
  FaCalendarDay,
  FaFileWord,
  FaFilePdf,
  FaFileImage,
  FaExternalLinkAlt,
  FaUser,
  FaCalendar
} from 'react-icons/fa';
import axios from "axios";

// === CONFIGURATION ===
const API_URL = "http://127.0.0.1:8000/api";

// === COULEURS ===
const COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  accent: "#4facfe",
  neon: "#00f2fe",
  dark: "#2c3e50",
  gray: "#6c757d",
  light: "#f5f7fa",
  white: "#ffffff",
  border: "#e0e6ef",
  success: "#28a745",
  warning: "#ffc107",
  danger: "#dc3545",
  info: "#17a2b8",
  purple: "#6f42c1",
  pink: "#e83e8c",
  teal: "#20c997"
};

const EvenementMembre = () => {
  const { t } = useTranslation();
  const [evenements, setEvenements] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentEvenement, setCurrentEvenement] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [typeFilter, setTypeFilter] = useState("Tous");
  const [viewMode, setViewMode] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [nouvelEvenement, setNouvelEvenement] = useState({
    titre: "",
    description: "",
    date_heure: "",
    lieu: "",
    type: "Présentiel",
    statut: "En attente",
    fichier: null,
    membre_id: ""
  });

  // === TYPES ET STATUTS ===
  const typesEvenement = [
    { value: "Présentiel", label: "Présentiel", icon: FaUsers, color: COLORS.primary },
    { value: "En ligne", label: "En ligne", icon: FaVideo, color: COLORS.success },
    { value: "Hybride", label: "Hybride", icon: FaGlobe, color: COLORS.warning }
  ];

  const statutsEvenement = [
    { value: "En attente", label: "En attente", icon: FaClock, color: COLORS.warning },
    { value: "Validé", label: "Validé", icon: FaCheckCircle, color: COLORS.success },
    { value: "Rejeté", label: "Rejeté", icon: FaExclamationTriangle, color: COLORS.danger }
  ];

  // === INITIALISATION ===
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
    fetchEvenements();
  }, []);

  // === FONCTIONS UTILITAIRES ===
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false }), 4000);
  };

  const handleClose = () => {
    setShowModal(false);
    setViewMode(false);
    setEditMode(false);
    setCurrentEvenement(null);
    setPreviewFile(null);
  };

  const handleShowAdd = () => {
    const user = currentUser || JSON.parse(localStorage.getItem('user'));
    
    setEditMode(false);
    setViewMode(false);
    setCurrentEvenement(null);
    setNouvelEvenement({
      titre: "",
      description: "",
      date_heure: "",
      lieu: "",
      type: "Présentiel",
      statut: "En attente",
      fichier: null,
      membre_id: user?.id || 1
    });
    setPreviewFile(null);
    setShowModal(true);
  };

  const handleShowEdit = (evenement) => {
    if (!isUserAuthor(evenement) && currentUser?.type !== 'admin') {
      showAlert("Vous n'êtes pas autorisé à modifier cet événement", "warning");
      return;
    }

    setEditMode(true);
    setViewMode(false);
    setCurrentEvenement(evenement);
    
    // Formater la date pour l'input datetime-local
    let formattedDate = "";
    if (evenement.date_heure) {
      const date = new Date(evenement.date_heure);
      formattedDate = date.toISOString().slice(0, 16);
    }
    
    setNouvelEvenement({
      titre: evenement.titre || "",
      description: evenement.description || "",
      date_heure: formattedDate,
      lieu: evenement.lieu || "",
      type: evenement.type || "Présentiel",
      statut: evenement.statut || "En attente",
      fichier: null,
      membre_id: evenement.membre_id || currentUser?.id || 1
    });
    setPreviewFile(null);
    setShowModal(true);
  };

  const handleShowView = (evenement) => {
    setViewMode(true);
    setEditMode(false);
    setCurrentEvenement(evenement);
    setShowModal(true);
  };

  const isUserAuthor = (evenement) => {
    if (!currentUser) return false;
    if (currentUser.type === 'admin') return true;
    return evenement.membre_id === currentUser.id;
  };

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    
    if (type === "file" && files[0]) {
      const file = files[0];
      setNouvelEvenement(prev => ({
        ...prev,
        fichier: file
      }));
      
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewFile({ url, name: file.name, type: file.type });
      } else {
        setPreviewFile(null);
      }
    } else {
      setNouvelEvenement(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleRemoveFile = () => {
    setNouvelEvenement(prev => ({ ...prev, fichier: null }));
    if (previewFile?.url?.startsWith("blob:")) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  // Cleanup des URLs blob
  useEffect(() => {
    return () => {
      if (previewFile?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  // === API FUNCTIONS ===
  const fetchEvenements = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      };
      
      const response = await axios.get(`${API_URL}/evenements`, config);
      
      let evenementsData = [];
      
      if (Array.isArray(response.data)) {
        evenementsData = response.data;
      } else if (response.data.data && Array.isArray(response.data.data)) {
        evenementsData = response.data.data;
      } else if (response.data.evenements && Array.isArray(response.data.evenements)) {
        evenementsData = response.data.evenements;
      }
      
      // Traiter les URLs des fichiers
      evenementsData = evenementsData.map(evenement => {
        // Si le fichier est un chemin relatif, construire l'URL complète
        if (evenement.fichier && !evenement.fichier.startsWith('http')) {
          evenement.fichier_url = `${API_URL}/storage/${evenement.fichier}`;
        } else {
          evenement.fichier_url = evenement.fichier;
        }
        
        // Déterminer le type de fichier basé sur l'extension
        if (evenement.fichier) {
          const extension = evenement.fichier.split('.').pop().toLowerCase();
          const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
          if (imageExtensions.includes(extension)) {
            evenement.fichier_type = 'image/' + (extension === 'jpg' ? 'jpeg' : extension);
          } else if (extension === 'pdf') {
            evenement.fichier_type = 'application/pdf';
          } else if (['doc', 'docx'].includes(extension)) {
            evenement.fichier_type = 'application/msword';
          }
        }
        
        return evenement;
      });
      
      // Filtrer selon le type d'utilisateur
      if (currentUser && currentUser.type === 'membre' && currentUser.type !== 'admin') {
        evenementsData = evenementsData.filter(evenement => 
          evenement.membre_id === currentUser.id
        );
      }
      
      setEvenements(evenementsData);
    } catch (err) {
      console.error("Erreur chargement événements:", err.response || err);
      setError(err.response?.data?.message || "Erreur lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const handleSave = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert("Vous devez être connecté", "danger");
      return;
    }

    if (!nouvelEvenement.titre || !nouvelEvenement.date_heure || !nouvelEvenement.lieu) {
      showAlert("Veuillez remplir tous les champs obligatoires", "warning");
      return;
    }

    setIsSubmitting(true);

    const formData = new FormData();
    
    // Ajouter les champs
    formData.append('titre', nouvelEvenement.titre);
    formData.append('description', nouvelEvenement.description);
    formData.append('date_heure', nouvelEvenement.date_heure);
    formData.append('lieu', nouvelEvenement.lieu);
    formData.append('type', nouvelEvenement.type);
    formData.append('statut', nouvelEvenement.statut);
    formData.append('membre_id', nouvelEvenement.membre_id || 1);
    
    if (nouvelEvenement.fichier) {
      formData.append('fichier', nouvelEvenement.fichier);
    }

    try {
      const config = {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      };

      if (editMode && currentEvenement) {
        // Pour la mise à jour
        formData.append('_method', 'PUT');
        await axios.post(`${API_URL}/evenements/${currentEvenement.id}`, formData, config);
        showAlert("Événement modifié avec succès", "success");
      } else {
        await axios.post(`${API_URL}/evenements`, formData, config);
        showAlert("Événement ajouté avec succès", "success");
      }
      
      handleClose();
      fetchEvenements();
    } catch (err) {
      console.error("Erreur sauvegarde:", err.response || err);
      showAlert(err.response?.data?.message || "Erreur lors de l'opération", "danger");
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const executeDelete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/evenements/${deleteId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Vérifier si la suppression a réussi
      if (response.data.success || response.status === 200 || response.status === 204) {
        showAlert("Événement supprimé avec succès", "success");
        
        // Mettre à jour la liste des événements
        setEvenements(prev => prev.filter(evenement => evenement.id !== deleteId));
      } else {
        showAlert("Erreur lors de la suppression", "danger");
      }
    } catch (err) {
      console.error("Erreur suppression:", err.response || err);
      
      // Messages d'erreur spécifiques
      if (err.response?.status === 404) {
        showAlert("Événement non trouvé", "warning");
        // Mettre quand même à jour l'interface si l'événement n'existe plus
        setEvenements(prev => prev.filter(evenement => evenement.id !== deleteId));
      } else if (err.response?.status === 401) {
        showAlert("Session expirée, veuillez vous reconnecter", "danger");
      } else if (err.response?.status === 403) {
        showAlert("Vous n'êtes pas autorisé à supprimer cet événement", "danger");
      } else {
        showAlert(err.response?.data?.message || "Erreur lors de la suppression", "danger");
      }
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  // === BADGES ===
  const StatusBadge = ({ statut }) => {
    const config = statutsEvenement.find(s => s.value === statut) || statutsEvenement[0];
    const Icon = config.icon;
    
    return (
      <Badge 
        bg={config.value === "Validé" ? "success" : 
            config.value === "En attente" ? "warning" : "danger"} 
        className="d-flex align-items-center px-3 py-2" 
        style={{ borderRadius: "15px", fontSize: "0.8rem" }}
      >
        <Icon size={14} className="me-1" />
        {config.label}
      </Badge>
    );
  };

  const TypeBadge = ({ type }) => {
    const config = typesEvenement.find(t => t.value === type) || typesEvenement[0];
    const Icon = config.icon;
    
    let bgColor = "primary";
    if (type === "En ligne") bgColor = "success";
    if (type === "Hybride") bgColor = "warning";
    
    return (
      <Badge 
        bg={bgColor}
        className="d-flex align-items-center px-3 py-2"
        style={{ borderRadius: "15px", fontSize: "0.8rem" }}
      >
        <Icon size={14} className="me-1" />
        {config.label}
      </Badge>
    );
  };

  const UserBadge = ({ evenement }) => {
    if (isUserAuthor(evenement)) {
      return (
        <Badge bg="info" className="ms-2 px-2 py-1" style={{ fontSize: "0.7rem", borderRadius: "10px" }}>
          <FaUserTie size={10} className="me-1" />
          Votre événement
        </Badge>
      );
    }
    return null;
  };

  // === FORMATAGE DES DATES ===
  const formatDate = (dateString) => {
    if (!dateString) return "Date non définie";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // === FILTRAGE ===
  const filteredEvenements = evenements.filter(evenement => {
    const matchesSearch = searchTerm === "" || 
      (evenement.titre && evenement.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (evenement.description && evenement.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (evenement.lieu && evenement.lieu.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === "Tous" || evenement.statut === statusFilter;
    const matchesType = typeFilter === "Tous" || evenement.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // === STATISTIQUES ===
  const statsCards = [
    {
      icon: FaCalendarAlt,
      color: COLORS.primary,
      bg: "rgba(102, 126, 234, 0.1)",
      count: evenements.length,
      label: "Total des événements",
      onClick: () => setStatusFilter("Tous")
    },
    {
      icon: FaCheckCircle,
      color: COLORS.success,
      bg: "rgba(40, 167, 69, 0.1)",
      count: evenements.filter(e => e.statut === "Validé").length,
      label: "Événements validés",
      onClick: () => setStatusFilter("Validé")
    },
    {
      icon: FaClock,
      color: COLORS.warning,
      bg: "rgba(255, 193, 7, 0.1)",
      count: evenements.filter(e => e.statut === "En attente").length,
      label: "Événements en attente",
      onClick: () => setStatusFilter("En attente")
    },
    {
      icon: FaExclamationTriangle,
      color: COLORS.danger,
      bg: "rgba(220, 53, 69, 0.1)",
      count: evenements.filter(e => e.statut === "Rejeté").length,
      label: "Événements rejetés",
      onClick: () => setStatusFilter("Rejeté")
    },
    {
      icon: FaUsers,
      color: COLORS.purple,
      bg: "rgba(111, 66, 193, 0.1)",
      count: evenements.filter(e => e.type === "Présentiel").length,
      label: "Événements présents",
      onClick: () => setTypeFilter("Présentiel")
    },
    {
      icon: FaVideo,
      color: COLORS.teal,
      bg: "rgba(32, 201, 151, 0.1)",
      count: evenements.filter(e => e.type === "En ligne").length,
      label: "Événements en ligne",
      onClick: () => setTypeFilter("En ligne")
    }
  ];

  // === ICÔNES DE FICHIERS ===
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileWord className="text-white" />;
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      return <FaFileImage className="text-white" />;
    } else if (ext === 'pdf') {
      return <FaFilePdf className="text-white" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FaFileWord className="text-white" />;
    }
    
    return <FaFileWord className="text-white" />;
  };

  // === RENDU ===
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger" className="shadow-lg p-4" style={{ borderRadius: "15px" }}>
          <FaExclamationTriangle className="me-2" />
          <h4>Erreur API</h4>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={fetchEvenements}
            className="mt-3"
          >
            Réessayer
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />

      <div 
        className="flex-grow-1"
        style={{ 
          marginLeft: sidebarCollapsed ? "80px" : "280px", 
          padding: "2rem", 
          transition: "margin 0.4s ease",
          minHeight: "calc(100vh - 80px)"
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 style={{ 
              color: "#2c3e50", 
              fontWeight: "bold", 
              fontSize: "2rem",
              marginBottom: "1rem"
            }}>
              <FaCalendarAlt className="me-3" style={{ color: COLORS.primary }} />
              {currentUser?.type === 'admin' ? "Gestion des événements" : "Mes événements"}
            </h1>
            <p style={{ color: COLORS.gray, fontSize: "1rem", margin: 0 }}>
              {currentUser?.type === 'admin' 
                ? "Gérez tous les événements du système" 
                : "Gérez vos événements et conférences"}
            </p>
          </div>
          <Button
            onClick={handleShowAdd}
            className="shadow-lg rounded-pill px-4 px-lg-5 py-2 py-lg-3 d-flex align-items-center"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "1rem",
              minWidth: "220px"
            }}
          >
            <FaPlusCircle className="me-2" />
            Nouvel événement
          </Button>
        </div>

        {/* Alert */}
        {alert.show && (
          <Alert
            variant={alert.type}
            dismissible
            onClose={() => setAlert({ show: false })}
            className="shadow-sm border-0 mb-4"
            style={{ borderRadius: "15px" }}
          >
            <i className={`fas ${
              alert.type === "success" ? "fa-check-circle" :
              alert.type === "warning" ? "fa-exclamation-triangle" :
              "fa-exclamation-circle"
            } me-2`}></i>
            {alert.message}
          </Alert>
        )}

        {/* Search and Filters */}
        <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "18px", background: COLORS.white }}>
          <Card.Body className="p-4">
            <Row className="g-3">
              <Col md={4}>
                <InputGroup>
                  <InputGroup.Text style={{ 
                    background: 'transparent', 
                    borderRight: 'none',
                    borderTopLeftRadius: '12px',
                    borderBottomLeftRadius: '12px'
                  }}>
                    <FaSearch size={14} style={{ color: COLORS.gray }} />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Rechercher des événements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderLeft: 'none',
                      borderRadius: '0 12px 12px 0',
                      padding: '0.75rem',
                      fontSize: '0.95rem'
                    }}
                    className="border-start-0"
                  />
                </InputGroup>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e9ecef",
                    fontSize: "0.95rem"
                  }}
                >
                  <option value="Tous">Tous les statuts</option>
                  {statutsEvenement.map(statut => (
                    <option key={statut.value} value={statut.value}>
                      {statut.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={4}>
                <Form.Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  style={{
                    borderRadius: "12px",
                    padding: "0.75rem 1rem",
                    border: "1px solid #e9ecef",
                    fontSize: "0.95rem"
                  }}
                >
                  <option value="Tous">Tous les types</option>
                  {typesEvenement.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Stats Cards */}
        <Row className="mb-5 g-4">
          {statsCards.map((stat, index) => (
            <Col xl={4} lg={4} md={6} key={index}>
              <Card 
                className="border-0 shadow-sm text-center p-4 h-100"
                style={{
                  borderRadius: "18px",
                  background: COLORS.white,
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onClick={stat.onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                }}
              >
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{
                    width: "70px",
                    height: "70px",
                    background: stat.bg,
                    border: `3px solid ${stat.color}`,
                  }}
                >
                  <stat.icon size={28} style={{ color: stat.color }} />
                </div>
                <h3 style={{ 
                  fontWeight: "bold", 
                  color: "#2c3e50", 
                  fontSize: "2rem",
                  margin: 0 
                }}>
                  {stat.count}
                </h3>
                <p style={{ 
                  fontWeight: "600", 
                  color: COLORS.gray, 
                  margin: 0,
                  fontSize: "0.9rem",
                  marginTop: "0.5rem"
                }}>
                  {stat.label}
                </p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Info pour les membres */}
        {currentUser?.type === 'membre' && evenements.some(e => e.statut === "En attente") && (
          <Alert variant="info" className="mb-4" style={{ borderRadius: "12px" }}>
            <i className="fas fa-info-circle me-2"></i>
            <strong>Information:</strong> Vos événements sont en attente de validation par l'administrateur.
          </Alert>
        )}

        {/* Liste des événements */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">Chargement des événements...</p>
          </div>
        ) : filteredEvenements.length === 0 ? (
          <Card className="text-center border-0 shadow-sm p-5" style={{ borderRadius: "20px", minHeight: "300px" }}>
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <FaCalendarAlt size={80} className="text-muted mb-4" />
              <h3 className="text-dark mb-3">Aucun événement trouvé</h3>
              <p className="text-muted mb-4">
                {searchTerm || statusFilter !== "Tous" || typeFilter !== "Tous"
                  ? "Aucun événement ne correspond à vos critères" 
                  : currentUser?.type === 'admin' 
                    ? "Aucun événement dans le système" 
                    : "Commencez par créer votre premier événement"}
              </p>
              <Button 
                onClick={handleShowAdd}
                className="rounded-pill px-4 py-2 shadow-sm"
                style={{
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  border: "none"
                }}
              >
                <FaPlusCircle className="me-2" />
                Créer un événement
              </Button>
            </div>
          </Card>
        ) : (
          <Row className="g-4">
            {filteredEvenements.map(evenement => {
              const userIsAuthor = isUserAuthor(evenement);
              const isPastEvent = new Date(evenement.date_heure) < new Date();
              
              return (
                <Col xl={4} lg={6} md={6} key={evenement.id}>
                  <Card
                    className="border-0 shadow-sm h-100"
                    style={{
                      borderRadius: "18px",
                      overflow: "hidden",
                      transition: "all 0.3s ease",
                      borderLeft: `4px solid ${
                        isPastEvent ? "#6c757d" : 
                        evenement.statut === "Validé" ? "#28a745" : 
                        evenement.statut === "En attente" ? "#ffc107" : 
                        "#dc3545"
                      }`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Card.Body className="p-4 d-flex flex-column">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="d-flex align-items-center flex-wrap gap-1">
                          <TypeBadge type={evenement.type} />
                          {userIsAuthor && <UserBadge evenement={evenement} />}
                        </div>
                        <StatusBadge statut={evenement.statut} />
                      </div>

                      <Card.Title 
                        className="fw-bold mb-2" 
                        style={{ fontSize: "1.3rem", color: "#2c3e50", minHeight: "60px" }}
                      >
                        {evenement.titre}
                      </Card.Title>

                      <Card.Text 
                        className="text-muted small mb-3 flex-grow-1" 
                        style={{ lineHeight: "1.6" }}
                      >
                        {evenement.description && evenement.description.length > 120 
                          ? `${evenement.description.substring(0, 120)}...` 
                          : evenement.description || "Pas de description"}
                      </Card.Text>

                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <FaRegClock className="me-2 text-primary" size={14} />
                          <span className={isPastEvent ? "text-muted" : "fw-semibold"}>
                            {formatDate(evenement.date_heure)}
                          </span>
                        </div>
                        <div className="d-flex align-items-center">
                          <FaMapMarkerAlt className="me-2 text-danger" size={14} />
                          <span>{evenement.lieu || "Non spécifié"}</span>
                        </div>
                      </div>

                      {evenement.fichier && (
                        <div className="mb-3">
                          <div className="d-flex align-items-center justify-content-between p-2 border rounded" style={{ background: "#f8f9fa" }}>
                            <div className="d-flex align-items-center">
                              {evenement.fichier_type && evenement.fichier_type.startsWith("image/") ? (
                                <img 
                                  src={evenement.fichier_url} 
                                  alt="Miniature"
                                  className="me-2"
                                  style={{ 
                                    width: "40px", 
                                    height: "40px", 
                                    objectFit: "cover",
                                    borderRadius: "6px"
                                  }}
                                />
                              ) : (
                                <div className="me-2" style={{ width: "40px", height: "40px", background: "#667eea", borderRadius: "6px" }}>
                                  {getFileIcon(evenement.fichier)}
                                </div>
                              )}
                              <span className="small text-truncate" style={{ maxWidth: "150px" }}>
                                {evenement.fichier.split('/').pop()}
                              </span>
                            </div>
                            <div className="d-flex gap-1">
                              {evenement.fichier_type && evenement.fichier_type.startsWith("image/") && (
                                <Button 
                                  size="sm" 
                                  variant="outline-info" 
                                  href={evenement.fichier_url} 
                                  target="_blank"
                                  className="rounded-circle"
                                  style={{ width: '32px', height: '32px' }}
                                  title="Voir l'image"
                                >
                                  <FaEye size={12} />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                href={evenement.fichier_url} 
                                target="_blank"
                                className="rounded-circle"
                                style={{ width: '32px', height: '32px' }}
                                title="Ouvrir"
                              >
                                <FaExternalLinkAlt size={12} />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline-secondary" 
                                href={evenement.fichier_url} 
                                download
                                className="rounded-circle"
                                style={{ width: '32px', height: '32px' }}
                                title="Télécharger"
                              >
                                <FaDownload size={12} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}


                      <div className="mt-auto">
                        <div className="d-flex justify-content-between text-muted small mb-3">
                          <span><FaUser className="me-1" />
                            {evenement.membre && typeof evenement.membre === 'object' 
                              ? evenement.membre.nom_complet || evenement.membre.email || "Non spécifié"
                              : evenement.membre || evenement.auteur || "Non spécifié"}
                          </span>
                          <span><FaCalendar className="me-1" />{new Date(evenement.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex justify-content-end gap-1">
                          <Button 
                            variant="outline-info" 
                            size="sm" 
                            className="rounded-circle" 
                            onClick={() => handleShowView(evenement)}
                            style={{ width: '36px', height: '36px' }}
                            title="Voir les détails"
                          >
                            <FaEye size={14} />
                          </Button>
                          
                          {userIsAuthor && (
                            <>
                              <Button 
                                variant="outline-primary" 
                                size="sm" 
                                className="rounded-circle" 
                                onClick={() => handleShowEdit(evenement)}
                                style={{ width: '36px', height: '36px' }}
                                title="Modifier"
                              >
                                <FaEdit size={14} />
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                className="rounded-circle" 
                                onClick={() => confirmDelete(evenement.id)}
                                style={{ width: '36px', height: '36px' }}
                                title="Supprimer"
                              >
                                <FaTrash size={14} />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Modal d'ajout/modification */}
        <Modal show={showModal && !viewMode} onHide={handleClose} centered size="lg">
          <Modal.Header closeButton style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            borderTopLeftRadius: "18px",
            borderTopRightRadius: "18px",
            padding: "1.5rem 2rem",
            border: 'none'
          }}>
            <Modal.Title className="fw-bold d-flex align-items-center">
              {editMode ? <FaEdit className="me-2" /> : <FaPlusCircle className="me-2" />}
              {editMode ? "Modifier l'événement" : "Nouvel événement"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4 p-md-5" style={{ background: "#f8f9fa" }}>
            <Form onSubmit={handleSave}>
              <Row className="g-4">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: COLORS.primary }}>
                      <FaCalendarDay className="me-2" />Titre de l'événement *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={nouvelEvenement.titre}
                      onChange={handleChange}
                      required
                      className="shadow-sm"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                        fontSize: "1rem",
                      }}
                      placeholder="Ex: Conférence sur l'IA"
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: COLORS.success }}>
                      <FaTag className="me-2" />Type d'événement *
                    </Form.Label>
                    <Form.Select
                      name="type"
                      value={nouvelEvenement.type}
                      onChange={handleChange}
                      required
                      className="shadow-sm"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                      }}
                    >
                      {typesEvenement.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-4 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: COLORS.info }}>
                      <FaRegClock className="me-2" />Date et Heure *
                    </Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="date_heure"
                      value={nouvelEvenement.date_heure}
                      onChange={handleChange}
                      required
                      className="shadow-sm"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                      }}
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: COLORS.danger }}>
                      <FaMapMarkerAlt className="me-2" />Lieu *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lieu"
                      value={nouvelEvenement.lieu}
                      onChange={handleChange}
                      required
                      className="shadow-sm"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                      }}
                      placeholder="Ex: Salle des conférences, Paris"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-4">
                <Form.Label className="fw-semibold mb-3" style={{ color: COLORS.accent }}>
                  <FaCalendarAlt className="me-2" />Description
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={nouvelEvenement.description}
                  onChange={handleChange}
                  className="shadow-sm"
                  style={{
                    borderRadius: "12px",
                    padding: "1rem",
                    resize: "none",
                  }}
                  placeholder="Décrivez en détail l'événement..."
                  maxLength={2000}
                />
                <Form.Text className="text-muted d-block text-end mt-2">
                  {nouvelEvenement.description.length}/2000 caractères
                </Form.Text>
              </Form.Group>

              <Row className="g-4 mt-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: COLORS.warning }}>
                      <FaCloudUploadAlt className="me-2" />Fichier joint (optionnel)
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="fichier"
                      onChange={handleChange}
                      className="shadow-sm"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                      }}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                    <Form.Text className="text-muted">
                      Formats acceptés: PDF, Word, Images (max 5MB)
                    </Form.Text>
                  </Form.Group>
                </Col>

                {currentUser?.type === 'admin' && (
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-semibold mb-3" style={{ color: COLORS.success }}>
                        <FaCheckCircle className="me-2" />Statut
                      </Form.Label>
                      <Form.Select
                        name="statut"
                        value={nouvelEvenement.statut}
                        onChange={handleChange}
                        className="shadow-sm"
                        style={{
                          borderRadius: "12px",
                          padding: "0.75rem 1rem",
                        }}
                      >
                        {statutsEvenement.map(statut => (
                          <option key={statut.value} value={statut.value}>
                            {statut.label}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}
              </Row>

              {previewFile && (
                <div className="mt-4 p-4 border-0 rounded shadow-sm" style={{ background: "white", borderRadius: "15px" }}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="fw-bold mb-0" style={{ color: COLORS.primary }}>
                      <FaEye className="me-2" />
                      {previewFile.type.startsWith("image/") ? "Aperçu de l'image" : "Aperçu du fichier"}
                    </h6>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="rounded-circle"
                      style={{ width: '32px', height: '32px' }}
                      title="Supprimer le fichier"
                    >
                      <FaTimes />
                    </Button>
                  </div>
                  <div className="text-center">
                    {previewFile.type.startsWith("image/") ? (
                      <div>
                        <img
                          src={previewFile.url}
                          alt="Aperçu"
                          style={{
                            maxHeight: "220px",
                            maxWidth: "100%",
                            borderRadius: "12px",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                          }}
                        />
                        <p className="mt-2 small text-muted">{previewFile.name}</p>
                      </div>
                    ) : (
                      <div className="p-4 text-center">
                        <div className="d-inline-flex align-items-center justify-content-center mb-3" 
                          style={{ 
                            width: "80px", 
                            height: "80px", 
                            background: COLORS.primary,
                            borderRadius: "12px" 
                          }}>
                          {getFileIcon(previewFile.name)}
                        </div>
                        <p className="fw-semibold text-break mb-1">{previewFile.name}</p>
                        <small className="text-muted">Document à télécharger</small>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0 p-4" style={{ 
            background: "#f8f9fa", 
            borderBottomLeftRadius: "18px", 
            borderBottomRightRadius: "18px" 
          }}>
            <Button 
              variant="outline-secondary" 
              onClick={handleClose} 
              className="rounded-pill px-4 px-lg-5 py-2" 
              disabled={isSubmitting}
              style={{ minWidth: '120px' }}
            >
              <FaTimes className="me-2" />Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={isSubmitting}
              className="rounded-pill px-4 px-lg-5 py-2 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                fontWeight: "600",
                minWidth: '150px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {editMode ? "Enregistrement..." : "Création..."}
                </>
              ) : (
                <>
                  {editMode ? <FaEdit className="me-2" /> : <FaCloudUploadAlt className="me-2" />}
                  {editMode ? "Enregistrer" : "Créer"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de visualisation */}
        <Modal show={showModal && viewMode} onHide={handleClose} centered size="lg">
          {currentEvenement && (
            <>
              <Modal.Header closeButton style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                borderTopLeftRadius: "18px",
                borderTopRightRadius: "18px",
                padding: "1.5rem 2rem",
                border: 'none'
              }}>
                <Modal.Title className="fw-bold d-flex align-items-center">
                  <FaEye className="me-2" />
                  Détails de l'événement
                </Modal.Title>
              </Modal.Header>

              <Modal.Body className="p-4 p-md-5">
                <Row className="mb-4">
                  <Col>
                    <h3 className="text-dark mb-3">{currentEvenement.titre}</h3>
                    <div className="d-flex flex-wrap gap-2 mb-3">
                      <TypeBadge type={currentEvenement.type} />
                      <StatusBadge statut={currentEvenement.statut} />
                      {isUserAuthor(currentEvenement) && <UserBadge evenement={currentEvenement} />}
                    </div>
                  </Col>
                </Row>

                <Row className="mb-4">
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <FaRegClock className="me-3 text-primary" size={20} />
                      <div>
                        <div className="fw-semibold">Date et Heure</div>
                        <div className="text-dark">{formatDate(currentEvenement.date_heure)}</div>
                      </div>
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="d-flex align-items-center mb-3">
                      <FaMapMarkerAlt className="me-3 text-danger" size={20} />
                      <div>
                        <div className="fw-semibold">Lieu</div>
                        <div className="text-dark">{currentEvenement.lieu}</div>
                      </div>
                    </div>
                  </Col>
                </Row>

                <div className="mb-4">
                  <h5 className="fw-semibold mb-2">Description</h5>
                  <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap' }}>
                    {currentEvenement.description || "Pas de description"}
                  </div>
                </div>

                <div className="mb-4">
                  <h5 className="fw-semibold mb-2">Organisateur</h5>
                  <div className="d-flex align-items-center">
                    <FaUserTie className="me-3 text-info" size={20} />
                    <div>
                      <div className="text-dark">
                        {currentEvenement.membre && typeof currentEvenement.membre === 'object'
                          ? currentEvenement.membre.nom_complet || currentEvenement.membre.email || "Non spécifié"
                          : currentEvenement.membre || currentEvenement.auteur || "Non spécifié"}
                      </div>
                      <small className="text-muted">Organisateur de l'événement</small>
                    </div>
                  </div>
                </div>

                {currentEvenement.fichier && (
                  <div className="mb-4">
                    <h5 className="fw-semibold mb-2">Fichier joint</h5>
                    <div className="p-3 border rounded" style={{ background: "#f8f9fa" }}>
                      <div className="d-flex align-items-center mb-3">
                        {currentEvenement.fichier_type && currentEvenement.fichier_type.startsWith("image/") ? (
                          <img 
                            src={currentEvenement.fichier_url} 
                            alt="Aperçu"
                            className="me-3"
                            style={{ 
                              width: "80px", 
                              height: "80px", 
                              objectFit: "cover",
                              borderRadius: "8px",
                              border: "2px solid #dee2e6"
                            }}
                          />
                        ) : (
                          <div className="me-3 p-3 text-center" style={{ width: "80px", height: "80px", background: "#667eea", borderRadius: "8px" }}>
                            {getFileIcon(currentEvenement.fichier)}
                          </div>
                        )}
                        <div className="flex-grow-1">
                          <div className="fw-semibold text-truncate">
                            {currentEvenement.fichier.split('/').pop()}
                          </div>
                          <small className="text-muted">
                            {currentEvenement.fichier_type || "Fichier"}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        {currentEvenement.fichier_type && currentEvenement.fichier_type.startsWith("image/") && (
                          <Button 
                            variant="outline-info" 
                            size="sm"
                            href={currentEvenement.fichier_url} 
                            target="_blank"
                            className="rounded-pill px-3"
                          >
                            <FaEye className="me-1" />
                            Voir l'image
                          </Button>
                        )}
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          href={currentEvenement.fichier_url} 
                          target="_blank"
                          className="rounded-pill px-3"
                        >
                          <FaExternalLinkAlt className="me-1" />
                          Ouvrir
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          href={currentEvenement.fichier_url} 
                          download
                          className="rounded-pill px-3"
                        >
                          <FaDownload className="me-1" />
                          Télécharger
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-top">
                  <small className="text-muted">
                    Créé le: {formatDate(currentEvenement.created_at)} • 
                    Mis à jour le: {formatDate(currentEvenement.updated_at)}
                  </small>
                </div>
              </Modal.Body>

              <Modal.Footer className="border-0 p-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClose} 
                  className="rounded-pill px-4 py-2"
                >
                  <FaTimes className="me-2" />
                  Fermer
                </Button>
                {isUserAuthor(currentEvenement) && (
                  <Button 
                    variant="primary" 
                    onClick={() => {
                      handleClose();
                      handleShowEdit(currentEvenement);
                    }}
                    className="rounded-pill px-4 py-2"
                  >
                    <FaEdit className="me-2" />
                    Modifier
                  </Button>
                )}
              </Modal.Footer>
            </>
          )}
        </Modal>

        {/* Modal de confirmation de suppression */}
        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">
              <FaExclamationTriangle className="me-2" />
              Confirmation
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <FaExclamationTriangle size={48} className="text-danger mb-3" />
            <p className="mb-0">Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.</p>
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowConfirm(false)} 
              className="px-4 rounded-pill"
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button 
              variant="danger" 
              onClick={executeDelete} 
              className="px-4 rounded-pill"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Spinner animation="border" size="sm" className="me-2" />
              ) : (
                <FaTrash className="me-2" />
              )}
              Supprimer
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Language Switcher */}
      <footer style={{ 
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.9)",
        padding: "10px",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <LanguageSwitcher />
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        .modal-content {
          border-radius: 18px !important;
          border: none !important;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2) !important;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25) !important;
        }
        
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0,0,0,0.15) !important;
        }
      `}</style>
    </div>
  );
};

export default EvenementMembre;