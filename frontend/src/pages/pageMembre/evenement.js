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
  InputGroup,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
  ListGroup
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
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
  FaCalendar,
  FaThLarge,
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaTh,
  FaWindowMinimize,
  FaSortAmountDown,
  FaSortAmountUp
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
  
  // === NOUVEAUX ÉTATS ===
  const [displayMode, setDisplayMode] = useState("grid"); // "grid" ou "list"
  const [currentPage, setCurrentPage] = useState(0);
  const [cardSize, setCardSize] = useState("normal"); // "small", "normal", "large"
  const [sortBy, setSortBy] = useState("date"); // "date", "title", "status"
  const [sortOrder, setSortOrder] = useState("desc"); // "asc" ou "desc"

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

  // === CONFIGURATION D'AFFICHAGE ===
  const CARDS_PER_PAGE = {
    grid: {
      small: 6,
      normal: 4,
      large: 3
    },
    list: {
      small: 8,
      normal: 6,
      large: 4
    }
  };

  const CARD_SIZE_CLASSES = {
    small: "col-xl-2 col-lg-3 col-md-4 col-sm-6",
    normal: "col-xl-3 col-lg-4 col-md-6",
    large: "col-xl-4 col-lg-6"
  };

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
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/evenements/${deleteTarget}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Vérifier si la suppression a réussi
      if (response.data.success || response.status === 200 || response.status === 204) {
        showAlert("Événement supprimé avec succès", "success");
        
        // Mettre à jour la liste des événements
        setEvenements(prev => prev.filter(evenement => evenement.id !== deleteTarget));
      } else {
        showAlert("Erreur lors de la suppression", "danger");
      }
    } catch (err) {
      console.error("Erreur suppression:", err.response || err);
      
      // Messages d'erreur spécifiques
      if (err.response?.status === 404) {
        showAlert("Événement non trouvé", "warning");
        // Mettre quand même à jour l'interface si l'événement n'existe plus
        setEvenements(prev => prev.filter(evenement => evenement.id !== deleteTarget));
      } else if (err.response?.status === 401) {
        showAlert("Session expirée, veuillez vous reconnecter", "danger");
      } else if (err.response?.status === 403) {
        showAlert("Vous n'êtes pas autorisé à supprimer cet événement", "danger");
      } else {
        showAlert(err.response?.data?.message || "Erreur lors de la suppression", "danger");
      }
    } finally {
      setIsSubmitting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
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
        className="d-flex align-items-center px-2 py-1" 
        style={{ borderRadius: "12px", fontSize: "0.7rem" }}
      >
        <Icon size={12} className="me-1" />
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
        className="d-flex align-items-center px-2 py-1"
        style={{ borderRadius: "12px", fontSize: "0.7rem" }}
      >
        <Icon size={12} className="me-1" />
        {config.label}
      </Badge>
    );
  };

  const UserBadge = ({ evenement }) => {
    if (isUserAuthor(evenement)) {
      return (
        <Badge bg="info" className="ms-1 px-1 py-1" style={{ fontSize: "0.65rem", borderRadius: "8px" }}>
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
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return dateString;
    }
  };

  // === FILTRAGE ET TRI ===
  const filteredEvenements = evenements
    .filter(evenement => {
      const matchesSearch = searchTerm === "" || 
        (evenement.titre && evenement.titre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evenement.description && evenement.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (evenement.lieu && evenement.lieu.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesStatus = statusFilter === "Tous" || evenement.statut === statusFilter;
      const matchesType = typeFilter === "Tous" || evenement.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date":
          comparison = new Date(b.date_heure) - new Date(a.date_heure);
          break;
        case "title":
          comparison = a.titre.localeCompare(b.titre);
          break;
        case "status":
          const statusOrder = { "Validé": 1, "En attente": 2, "Rejeté": 3 };
          comparison = (statusOrder[a.statut] || 4) - (statusOrder[b.statut] || 4);
          break;
        default:
          comparison = new Date(b.date_heure) - new Date(a.date_heure);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // === PAGINATION ===
  const cardsPerPage = CARDS_PER_PAGE[displayMode][cardSize];
  const totalPages = Math.ceil(filteredEvenements.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = Math.min(startIndex + cardsPerPage, filteredEvenements.length);
  const currentEvenements = filteredEvenements.slice(startIndex, endIndex);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  const handlePageClick = (pageIndex) => {
    setCurrentPage(pageIndex);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // === COMPOSANTS D'AFFICHAGE ===
  // Vue en grille avec cartes réduites
  const GridView = () => (
    <div className="position-relative">
      {/* Navigation par pages */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button
            variant="outline-primary"
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="d-flex align-items-center rounded-circle"
            style={{ width: "40px", height: "40px" }}
          >
            <FaChevronLeft />
          </Button>
          
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted small">
              Page {currentPage + 1} sur {totalPages} ({filteredEvenements.length} événements)
            </span>
            <div className="d-flex gap-1">
              {[...Array(totalPages)].map((_, index) => (
                <Button
                  key={index}
                  variant={currentPage === index ? "primary" : "outline-primary"}
                  size="sm"
                  onClick={() => handlePageClick(index)}
                  style={{
                    width: "30px",
                    height: "30px",
                    borderRadius: "50%",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.8rem"
                  }}
                >
                  {index + 1}
                </Button>
              ))}
            </div>
          </div>
          
          <Button
            variant="outline-primary"
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="d-flex align-items-center rounded-circle"
            style={{ width: "40px", height: "40px" }}
          >
            <FaChevronRight />
          </Button>
        </div>
      )}

      {/* Grille de cartes */}
      <Row className="g-3">
        {currentEvenements.map(evenement => {
          const userIsAuthor = isUserAuthor(evenement);
          const isPastEvent = new Date(evenement.date_heure) < new Date();
          
          return (
            <div key={evenement.id} className={CARD_SIZE_CLASSES[cardSize]}>
              <Card className="border-0 shadow-sm h-100 event-card"
                style={{ 
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  borderLeft: `4px solid ${
                    isPastEvent ? "#6c757d" : 
                    evenement.statut === "Validé" ? "#28a745" : 
                    evenement.statut === "En attente" ? "#ffc107" : 
                    "#dc3545"
                  }`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.05)";
                }}
                onClick={() => handleShowView(evenement)}
              >
                <Card.Body className="p-3 d-flex flex-column">
                  {/* En-tête avec badges */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex flex-wrap gap-1">
                      <TypeBadge type={evenement.type} />
                      {userIsAuthor && <UserBadge evenement={evenement} />}
                    </div>
                    <StatusBadge statut={evenement.statut} />
                  </div>

                  {/* Titre */}
                  <Card.Title 
                    className="fw-bold mb-2" 
                    style={{ 
                      fontSize: cardSize === "small" ? "0.85rem" : "1rem", 
                      color: "#2c3e50",
                      lineHeight: "1.3",
                      height: cardSize === "small" ? "40px" : "50px",
                      overflow: "hidden"
                    }}
                  >
                    {evenement.titre}
                  </Card.Title>

                  {/* Description réduite */}
                  <Card.Text 
                    className="text-muted small flex-grow-1" 
                    style={{ 
                      fontSize: cardSize === "small" ? "0.7rem" : "0.8rem",
                      lineHeight: "1.4",
                      height: cardSize === "small" ? "40px" : "60px",
                      overflow: "hidden"
                    }}
                  >
                    {evenement.description && evenement.description.length > (cardSize === "small" ? 60 : 80) 
                      ? `${evenement.description.substring(0, cardSize === "small" ? 60 : 80)}...` 
                      : evenement.description || "Pas de description"}
                  </Card.Text>

                  {/* Date et lieu */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-1" style={{ fontSize: cardSize === "small" ? "0.7rem" : "0.8rem" }}>
                      <FaRegClock className="me-2 text-primary" size={cardSize === "small" ? 10 : 12} />
                      <span className={isPastEvent ? "text-muted" : "fw-semibold"}>
                        {formatDate(evenement.date_heure)}
                      </span>
                    </div>
                    <div className="d-flex align-items-center" style={{ fontSize: cardSize === "small" ? "0.7rem" : "0.8rem" }}>
                      <FaMapMarkerAlt className="me-2 text-danger" size={cardSize === "small" ? 10 : 12} />
                      <span className="text-truncate">{evenement.lieu || "Non spécifié"}</span>
                    </div>
                  </div>

                  {/* Fichier joint réduit */}
                  {evenement.fichier && (
                    <div className="mb-3">
                      <div className="d-flex align-items-center justify-content-between p-2 border rounded" 
                        style={{ 
                          background: "#f8f9fa",
                          fontSize: cardSize === "small" ? "0.7rem" : "0.8rem"
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="d-flex align-items-center">
                          {evenement.fichier_type && evenement.fichier_type.startsWith("image/") ? (
                            <img 
                              src={evenement.fichier_url} 
                              alt="Miniature"
                              className="me-2"
                              style={{ 
                                width: "30px", 
                                height: "30px", 
                                objectFit: "cover",
                                borderRadius: "4px"
                              }}
                            />
                          ) : (
                            <div className="me-2 d-flex align-items-center justify-content-center" 
                              style={{ 
                                width: "30px", 
                                height: "30px", 
                                background: "#667eea", 
                                borderRadius: "4px" 
                              }}>
                              {getFileIcon(evenement.fichier)}
                            </div>
                          )}
                          <span className="text-truncate" style={{ maxWidth: "80px" }}>
                            {evenement.fichier.split('/').pop()}
                          </span>
                        </div>
                        <div className="d-flex gap-1">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`download-tooltip-${evenement.id}`}>Télécharger</Tooltip>}
                          >
                            <Button 
                              size="sm" 
                              variant="outline-primary" 
                              href={evenement.fichier_url} 
                              download
                              className="rounded-circle"
                              style={{ 
                                width: cardSize === "small" ? '24px' : '28px', 
                                height: cardSize === "small" ? '24px' : '28px'
                              }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <FaDownload size={cardSize === "small" ? 10 : 12} />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Informations utilisateur */}
                  <div className="d-flex justify-content-between text-muted small mb-3"
                    style={{ fontSize: cardSize === "small" ? "0.65rem" : "0.75rem" }}>
                    <span><FaUser className="me-1" />
                      {evenement.membre && typeof evenement.membre === 'object' 
                        ? evenement.membre.nom_complet || evenement.membre.email || "Non spécifié"
                        : evenement.membre || evenement.auteur || "Non spécifié"}
                    </span>
                    <span><FaCalendar className="me-1" />
                      {new Date(evenement.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="d-flex justify-content-end gap-1 mt-auto" onClick={(e) => e.stopPropagation()}>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id={`view-tooltip-${evenement.id}`}>Voir détails</Tooltip>}
                    >
                      <Button 
                        variant="outline-info" 
                        size="sm" 
                        className="rounded-circle"
                        onClick={() => handleShowView(evenement)}
                        style={{ 
                          width: cardSize === "small" ? '28px' : '32px', 
                          height: cardSize === "small" ? '28px' : '32px'
                        }}
                      >
                        <FaEye size={cardSize === "small" ? 12 : 14} />
                      </Button>
                    </OverlayTrigger>
                    
                    {userIsAuthor && (
                      <>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`edit-tooltip-${evenement.id}`}>Modifier</Tooltip>}
                        >
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="rounded-circle"
                            onClick={() => handleShowEdit(evenement)}
                            style={{ 
                              width: cardSize === "small" ? '28px' : '32px', 
                              height: cardSize === "small" ? '28px' : '32px'
                            }}
                          >
                            <FaEdit size={cardSize === "small" ? 12 : 14} />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`delete-tooltip-${evenement.id}`}>Supprimer</Tooltip>}
                        >
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            className="rounded-circle"
                            onClick={() => confirmDelete(evenement.id)}
                            style={{ 
                              width: cardSize === "small" ? '28px' : '32px', 
                              height: cardSize === "small" ? '28px' : '32px'
                            }}
                          >
                            <FaTrash size={cardSize === "small" ? 12 : 14} />
                          </Button>
                        </OverlayTrigger>
                      </>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </div>
          );
        })}
      </Row>

      {/* Pagination inférieure */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={handlePrevPage}>
                  <FaChevronLeft size={12} />
                </button>
              </li>
              {[...Array(Math.min(5, totalPages))].map((_, i) => {
                let pageIndex;
                if (totalPages <= 5) {
                  pageIndex = i;
                } else if (currentPage < 2) {
                  pageIndex = i;
                } else if (currentPage > totalPages - 3) {
                  pageIndex = totalPages - 5 + i;
                } else {
                  pageIndex = currentPage - 2 + i;
                }
                
                return (
                  <li key={pageIndex} className={`page-item ${currentPage === pageIndex ? 'active' : ''}`}>
                    <button className="page-link" onClick={() => handlePageClick(pageIndex)}>
                      {pageIndex + 1}
                    </button>
                  </li>
                );
              })}
              <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={handleNextPage}>
                  <FaChevronRight size={12} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );

  // Vue en liste
  const ListView = () => (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="text-muted mb-0">
          {filteredEvenements.length} événement(s) trouvé(s)
        </h6>
      </div>
      
      <ListGroup variant="flush">
        {currentEvenements.map((evenement) => {
          const userIsAuthor = isUserAuthor(evenement);
          const isPastEvent = new Date(evenement.date_heure) < new Date();

          return (
            <ListGroup.Item 
              key={evenement.id}
              className="mb-3 border-0 shadow-sm rounded-3 list-view-item"
              style={{ 
                background: 'white',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                borderLeft: `4px solid ${
                  isPastEvent ? "#6c757d" : 
                  evenement.statut === "Validé" ? "#28a745" : 
                  evenement.statut === "En attente" ? "#ffc107" : 
                  "#dc3545"
                }`
              }}
              onClick={() => handleShowView(evenement)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(5px)';
                e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.05)';
              }}
            >
              <div className="d-flex align-items-start">
                {/* Colonne gauche : Type */}
                <div className="flex-shrink-0 me-3" style={{ width: '80px' }}>
                  <TypeBadge type={evenement.type} />
                </div>

                {/* Colonne centrale : Contenu */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{evenement.titre}</h6>
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        <StatusBadge statut={evenement.statut} />
                        {userIsAuthor && <UserBadge evenement={evenement} />}
                      </div>
                    </div>
                    <div className="text-muted small text-end">
                      <div><FaCalendar className="me-1" />
                        {new Date(evenement.created_at).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    <FaRegClock className="me-2" size={12} />
                    <span className="me-4">{formatDate(evenement.date_heure)}</span>
                    <FaMapMarkerAlt className="me-2" size={12} />
                    <span>{evenement.lieu || "Non spécifié"}</span>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    {evenement.description?.length > 100 ? `${evenement.description.substring(0, 100)}...` : evenement.description || "Pas de description"}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex gap-3 text-muted small">
                      {evenement.fichier && (
                        <span 
                          className="text-primary" 
                          style={{ cursor: 'pointer' }} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(evenement.fichier_url, evenement.fichier.split('/').pop());
                          }}
                        >
                          <FaDownload className="me-1" size={12} />
                          Fichier joint
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`view-list-tooltip-${evenement.id}`}>Voir</Tooltip>}
                      >
                        <Button 
                          variant="outline-info" 
                          size="sm" 
                          onClick={() => handleShowView(evenement)}
                          style={{ borderRadius: "6px", padding: "4px 8px" }}
                        >
                          <FaEye size={12} />
                        </Button>
                      </OverlayTrigger>
                      {userIsAuthor && (
                        <>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`edit-list-tooltip-${evenement.id}`}>Modifier</Tooltip>}
                          >
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleShowEdit(evenement)}
                              style={{ borderRadius: "6px", padding: "4px 8px" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`delete-list-tooltip-${evenement.id}`}>Supprimer</Tooltip>}
                          >
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => confirmDelete(evenement.id)}
                              style={{ borderRadius: "6px", padding: "4px 8px" }}
                            >
                              <FaTrash size={12} />
                            </Button>
                          </OverlayTrigger>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>

      {/* Pagination pour la vue liste */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center mt-4">
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 0 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={handlePrevPage}>
                  <FaChevronLeft size={12} />
                </button>
              </li>
              {[...Array(totalPages)].map((_, index) => (
                <li key={index} className={`page-item ${currentPage === index ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => handlePageClick(index)}>
                    {index + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages - 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={handleNextPage}>
                  <FaChevronRight size={12} />
                </button>
              </li>
            </ul>
          </nav>
        </div>
      )}
    </div>
  );

  // === FONCTION DE TÉLÉCHARGEMENT ===
  const handleDownload = (url, filename) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'fichier';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // === ICÔNES DE FICHIERS ===
  const getFileIcon = (fileName) => {
    if (!fileName) return <FaFileWord size={16} className="text-white" />;
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
      return <FaFileImage size={16} className="text-white" />;
    } else if (ext === 'pdf') {
      return <FaFilePdf size={16} className="text-white" />;
    } else if (['doc', 'docx'].includes(ext)) {
      return <FaFileWord size={16} className="text-white" />;
    }
    
    return <FaFileWord size={16} className="text-white" />;
  };

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
          padding: "1.5rem", 
          transition: "margin 0.4s ease",
          minHeight: "calc(100vh - 80px)"
        }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 style={{ 
              color: "#2c3e50", 
              fontWeight: "bold", 
              fontSize: "1.75rem",
              marginBottom: "0.5rem"
            }}>
              <FaCalendarAlt className="me-3" style={{ color: COLORS.primary }} />
              {currentUser?.type === 'admin' ? "Gestion des événements" : "Mes événements"}
            </h1>
            <p style={{ color: COLORS.gray, fontSize: "0.9rem", margin: 0 }}>
              {currentUser?.type === 'admin' 
                ? "Gérez tous les événements du système" 
                : "Gérez vos événements et conférences"}
            </p>
          </div>
          <Button
            onClick={handleShowAdd}
            className="shadow-lg rounded-pill px-4 py-2 d-flex align-items-center"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "0.9rem",
              minWidth: "180px"
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
            style={{ borderRadius: "12px", fontSize: "0.9rem" }}
          >
            {alert.message}
          </Alert>
        )}

        {/* Barre de contrôle : Recherche, filtres, vues */}
        <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "15px", background: COLORS.white }}>
          <Card.Body className="p-3">
            <Row className="g-3 align-items-center">
              <Col md={4}>
                <div className="position-relative">
                  <FaSearch 
                    style={{ 
                      position: "absolute", 
                      left: "12px", 
                      top: "50%", 
                      transform: "translateY(-50%)", 
                      color: COLORS.gray 
                    }} 
                  />
                  <Form.Control
                    type="text"
                    placeholder="Rechercher des événements..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      borderRadius: "10px",
                      padding: "0.6rem 1rem 0.6rem 40px",
                      border: "1px solid #e9ecef",
                      fontSize: "0.9rem"
                    }}
                  />
                </div>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                  style={{
                    borderRadius: "10px",
                    padding: "0.6rem 1rem",
                    border: "1px solid #e9ecef",
                    fontSize: "0.9rem"
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
              <Col md={5}>
                <div className="d-flex justify-content-end align-items-center gap-3">
                  {/* Sélecteur de vue */}
                  <ButtonGroup>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="tooltip-grid">Vue grille</Tooltip>}
                    >
                      <Button
                        variant={displayMode === "grid" ? "primary" : "outline-secondary"}
                        size="sm"
                        onClick={() => {
                          setDisplayMode("grid");
                          setCurrentPage(0);
                        }}
                        style={{ borderRadius: "8px 0 0 8px" }}
                      >
                        <FaThLarge size={14} />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="tooltip-list">Vue liste</Tooltip>}
                    >
                      <Button
                        variant={displayMode === "list" ? "primary" : "outline-secondary"}
                        size="sm"
                        onClick={() => {
                          setDisplayMode("list");
                          setCurrentPage(0);
                        }}
                        style={{ borderRadius: "0 8px 8px 0" }}
                      >
                        <FaList size={14} />
                      </Button>
                    </OverlayTrigger>
                  </ButtonGroup>

                  {/* Sélecteur de taille des cartes (uniquement en mode grille) */}
                  {displayMode === "grid" && (
                    <ButtonGroup>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip-small">Petites cartes</Tooltip>}
                      >
                        <Button
                          variant={cardSize === "small" ? "primary" : "outline-secondary"}
                          size="sm"
                          onClick={() => setCardSize("small")}
                          style={{ borderRadius: "8px 0 0 8px" }}
                        >
                          <FaWindowMinimize size={12} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip-normal">Cartes normales</Tooltip>}
                      >
                        <Button
                          variant={cardSize === "normal" ? "primary" : "outline-secondary"}
                          size="sm"
                          onClick={() => setCardSize("normal")}
                          style={{ borderRadius: "0" }}
                        >
                          <FaTh size={12} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip-large">Grandes cartes</Tooltip>}
                      >
                        <Button
                          variant={cardSize === "large" ? "primary" : "outline-secondary"}
                          size="sm"
                          onClick={() => setCardSize("large")}
                          style={{ borderRadius: "0 8px 8px 0" }}
                        >
                          <FaThLarge size={14} />
                        </Button>
                      </OverlayTrigger>
                    </ButtonGroup>
                  )}

                  {/* Bouton de tri */}
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip-sort">Trier par date {sortOrder === "asc" ? "croissante" : "décroissante"}</Tooltip>}
                  >
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={() => handleSortChange("date")}
                      style={{ borderRadius: "8px" }}
                    >
                      {sortOrder === "asc" ? <FaSortAmountDown size={14} /> : <FaSortAmountUp size={14} />}
                    </Button>
                  </OverlayTrigger>

                  {/* Bouton rafraîchir */}
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip id="tooltip-refresh">Rafraîchir</Tooltip>}
                  >
                    <Button
                      variant="outline-primary"
                      size="sm"
                      onClick={fetchEvenements}
                      style={{ borderRadius: "8px" }}
                    >
                      <i className="fas fa-sync-alt"></i>
                    </Button>
                  </OverlayTrigger>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Stats Cards */}
        <Row className="mb-4 g-3">
          {statsCards.map((stat, index) => (
            <Col xl={2} lg={3} md={4} sm={6} key={index}>
              <Card 
                className="border-0 shadow-sm text-center p-3 h-100"
                style={{
                  borderRadius: "12px",
                  background: COLORS.white,
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onClick={stat.onClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                }}
              >
                <div
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-2"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: stat.bg,
                    border: `2px solid ${stat.color}`,
                  }}
                >
                  <stat.icon size={20} style={{ color: stat.color }} />
                </div>
                <h4 style={{ 
                  fontWeight: "bold", 
                  color: "#2c3e50", 
                  fontSize: "1.5rem",
                  margin: 0 
                }}>
                  {stat.count}
                </h4>
                <p style={{ 
                  fontWeight: "600", 
                  color: COLORS.gray, 
                  margin: 0,
                  fontSize: "0.8rem",
                  marginTop: "0.25rem"
                }}>
                  {stat.label}
                </p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Info pour les membres */}
        {currentUser?.type === 'membre' && evenements.some(e => e.statut === "En attente") && (
          <Alert variant="info" className="mb-4" style={{ borderRadius: "10px", fontSize: "0.85rem" }}>
            <i className="fas fa-info-circle me-2"></i>
            <strong>Information:</strong> Vos événements sont en attente de validation par l'administrateur.
          </Alert>
        )}

        {/* Liste des événements */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
            <p className="mt-3 text-muted">Chargement des événements...</p>
          </div>
        ) : filteredEvenements.length === 0 ? (
          <Card className="text-center border-0 shadow-sm p-5" style={{ borderRadius: "15px", minHeight: "300px" }}>
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <FaCalendarAlt size={60} className="text-muted mb-3" />
              <h5 className="text-dark mb-3">Aucun événement trouvé</h5>
              <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
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
                  border: "none",
                  fontSize: "0.9rem"
                }}
              >
                <FaPlusCircle className="me-2" />
                Créer un événement
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* En-tête avec compteur */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                  Affichage {startIndex + 1} à {endIndex} sur {filteredEvenements.length} événements
                </h6>
              </div>
              <div className="text-muted small">
                Page {currentPage + 1} sur {totalPages}
              </div>
            </div>

            {/* Vue sélectionnée */}
            {displayMode === "grid" ? <GridView /> : <ListView />}
          </>
        )}
      </div>

      {/* MODAL D'AJOUT/MODIFICATION */}
      <Modal show={showModal && !viewMode} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderTopLeftRadius: "15px",
          borderTopRightRadius: "15px",
          padding: "1.2rem 1.5rem",
          border: 'none'
        }}>
          <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: "1.1rem" }}>
            {editMode ? <FaEdit className="me-2" /> : <FaPlusCircle className="me-2" />}
            {editMode ? "Modifier l'événement" : "Nouvel événement"}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4" style={{ background: "#f8f9fa" }}>
          <Form onSubmit={handleSave}>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ color: COLORS.primary, fontSize: "0.9rem" }}>
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
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                    }}
                    placeholder="Ex: Conférence sur l'IA"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ color: COLORS.success, fontSize: "0.9rem" }}>
                    <FaTag className="me-2" />Type d'événement *
                  </Form.Label>
                  <Form.Select
                    name="type"
                    value={nouvelEvenement.type}
                    onChange={handleChange}
                    required
                    className="shadow-sm"
                    style={{
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem"
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

            <Row className="g-3 mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ color: COLORS.info, fontSize: "0.9rem" }}>
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
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem"
                    }}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ color: COLORS.danger, fontSize: "0.9rem" }}>
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
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem"
                    }}
                    placeholder="Ex: Salle des conférences, Paris"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label className="fw-semibold mb-2" style={{ color: COLORS.accent, fontSize: "0.9rem" }}>
                <FaCalendarAlt className="me-2" />Description
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                value={nouvelEvenement.description}
                onChange={handleChange}
                className="shadow-sm"
                style={{
                  borderRadius: "10px",
                  padding: "0.8rem",
                  resize: "none",
                  fontSize: "0.9rem"
                }}
                placeholder="Décrivez en détail l'événement..."
                maxLength={2000}
              />
              <Form.Text className="text-muted d-block text-end mt-2" style={{ fontSize: "0.8rem" }}>
                {nouvelEvenement.description.length}/2000 caractères
              </Form.Text>
            </Form.Group>

            <Row className="g-3 mt-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ color: COLORS.warning, fontSize: "0.9rem" }}>
                    <FaCloudUploadAlt className="me-2" />Fichier joint (optionnel)
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="fichier"
                    onChange={handleChange}
                    className="shadow-sm"
                    style={{
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem"
                    }}
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  />
                  <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
                    Formats acceptés: PDF, Word, Images (max 5MB)
                  </Form.Text>
                </Form.Group>
              </Col>

              {currentUser?.type === 'admin' && (
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2" style={{ color: COLORS.success, fontSize: "0.9rem" }}>
                      <FaCheckCircle className="me-2" />Statut
                    </Form.Label>
                    <Form.Select
                      name="statut"
                      value={nouvelEvenement.statut}
                      onChange={handleChange}
                      className="shadow-sm"
                      style={{
                        borderRadius: "10px",
                        padding: "0.6rem 1rem",
                        fontSize: "0.9rem"
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
              <div className="mt-3 p-3 border-0 rounded shadow-sm" style={{ background: "white", borderRadius: "12px" }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="fw-bold mb-0" style={{ color: COLORS.primary, fontSize: "0.9rem" }}>
                    <FaEye className="me-2" />
                    {previewFile.type.startsWith("image/") ? "Aperçu de l'image" : "Aperçu du fichier"}
                  </h6>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="rounded-circle"
                    style={{ width: '28px', height: '28px' }}
                    title="Supprimer le fichier"
                  >
                    <FaTimes size={12} />
                  </Button>
                </div>
                <div className="text-center">
                  {previewFile.type.startsWith("image/") ? (
                    <div>
                      <img
                        src={previewFile.url}
                        alt="Aperçu"
                        style={{
                          maxHeight: "180px",
                          maxWidth: "100%",
                          borderRadius: "10px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <p className="mt-2 small text-muted" style={{ fontSize: "0.8rem" }}>{previewFile.name}</p>
                    </div>
                  ) : (
                    <div className="p-3 text-center">
                      <div className="d-inline-flex align-items-center justify-content-center mb-2" 
                        style={{ 
                          width: "60px", 
                          height: "60px", 
                          background: COLORS.primary,
                          borderRadius: "10px" 
                        }}>
                        {getFileIcon(previewFile.name)}
                      </div>
                      <p className="fw-semibold text-break mb-1" style={{ fontSize: "0.85rem" }}>{previewFile.name}</p>
                      <small className="text-muted" style={{ fontSize: "0.8rem" }}>Document à télécharger</small>
                    </div>
                  )}
                </div>
              </div>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer className="border-0 p-3" style={{ 
          background: "#f8f9fa", 
          borderBottomLeftRadius: "15px", 
          borderBottomRightRadius: "15px" 
        }}>
          <Button 
            variant="outline-secondary" 
            onClick={handleClose} 
            className="rounded-pill px-4 py-2" 
            disabled={isSubmitting}
            style={{ fontSize: "0.9rem", minWidth: "100px" }}
          >
            <FaTimes className="me-2" />Annuler
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting}
            className="rounded-pill px-4 py-2 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "0.9rem",
              minWidth: "120px"
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

      {/* MODAL DE VISUALISATION */}
      <Modal show={showModal && viewMode} onHide={handleClose} centered size="lg">
        {currentEvenement && (
          <>
            <Modal.Header closeButton style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderTopLeftRadius: "15px",
              borderTopRightRadius: "15px",
              padding: "1.2rem 1.5rem",
              border: 'none'
            }}>
              <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: "1.1rem" }}>
                <FaEye className="me-2" />
                Détails de l'événement
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="p-4">
              <Row className="mb-4">
                <Col>
                  <h3 className="text-dark mb-3" style={{ fontSize: "1.3rem" }}>{currentEvenement.titre}</h3>
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
                    <FaRegClock className="me-3 text-primary" size={18} />
                    <div>
                      <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>Date et Heure</div>
                      <div className="text-dark" style={{ fontSize: "0.9rem" }}>{formatDate(currentEvenement.date_heure)}</div>
                    </div>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="d-flex align-items-center mb-3">
                    <FaMapMarkerAlt className="me-3 text-danger" size={18} />
                    <div>
                      <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>Lieu</div>
                      <div className="text-dark" style={{ fontSize: "0.9rem" }}>{currentEvenement.lieu}</div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className="mb-4">
                <h5 className="fw-semibold mb-2" style={{ fontSize: "1rem" }}>Description</h5>
                <div className="p-3 bg-light rounded" style={{ whiteSpace: 'pre-wrap', fontSize: "0.9rem" }}>
                  {currentEvenement.description || "Pas de description"}
                </div>
              </div>

              <div className="mb-4">
                <h5 className="fw-semibold mb-2" style={{ fontSize: "1rem" }}>Organisateur</h5>
                <div className="d-flex align-items-center">
                  <FaUserTie className="me-3 text-info" size={18} />
                  <div>
                    <div className="text-dark" style={{ fontSize: "0.9rem" }}>
                      {currentEvenement.membre && typeof currentEvenement.membre === 'object'
                        ? currentEvenement.membre.nom_complet || currentEvenement.membre.email || "Non spécifié"
                        : currentEvenement.membre || currentEvenement.auteur || "Non spécifié"}
                    </div>
                    <small className="text-muted" style={{ fontSize: "0.8rem" }}>Organisateur de l'événement</small>
                  </div>
                </div>
              </div>

              {currentEvenement.fichier && (
                <div className="mb-4">
                  <h5 className="fw-semibold mb-2" style={{ fontSize: "1rem" }}>Fichier joint</h5>
                  <div className="p-3 border rounded" style={{ background: "#f8f9fa" }}>
                    <div className="d-flex align-items-center mb-3">
                      {currentEvenement.fichier_type && currentEvenement.fichier_type.startsWith("image/") ? (
                        <img 
                          src={currentEvenement.fichier_url} 
                          alt="Aperçu"
                          className="me-3"
                          style={{ 
                            width: "60px", 
                            height: "60px", 
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "2px solid #dee2e6"
                          }}
                        />
                      ) : (
                        <div className="me-3 p-2 text-center" style={{ width: "60px", height: "60px", background: "#667eea", borderRadius: "6px" }}>
                          {getFileIcon(currentEvenement.fichier)}
                        </div>
                      )}
                      <div className="flex-grow-1">
                        <div className="fw-semibold text-truncate" style={{ fontSize: "0.9rem" }}>
                          {currentEvenement.fichier.split('/').pop()}
                        </div>
                        <small className="text-muted" style={{ fontSize: "0.8rem" }}>
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
                          style={{ fontSize: "0.85rem" }}
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
                        style={{ fontSize: "0.85rem" }}
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
                        style={{ fontSize: "0.85rem" }}
                      >
                        <FaDownload className="me-1" />
                        Télécharger
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-top">
                <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                  Créé le: {formatDate(currentEvenement.created_at)} • 
                  Mis à jour le: {formatDate(currentEvenement.updated_at)}
                </small>
              </div>
            </Modal.Body>

            <Modal.Footer className="border-0 p-3">
              <Button 
                variant="outline-secondary" 
                onClick={handleClose} 
                className="rounded-pill px-4 py-2"
                style={{ fontSize: "0.9rem" }}
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
                  style={{ fontSize: "0.9rem" }}
                >
                  <FaEdit className="me-2" />
                  Modifier
                </Button>
              )}
            </Modal.Footer>
          </>
        )}
      </Modal>

      {/* MODAL DE CONFIRMATION DE SUPPRESSION AMÉLIORÉ */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered size="sm">
        <Modal.Header closeButton style={{
          background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
          color: "white",
          borderTopLeftRadius: "15px",
          borderTopRightRadius: "15px",
          padding: "1.2rem 1.5rem",
          border: 'none'
        }}>
          <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: "1.1rem" }}>
            <FaExclamationTriangle className="me-2" />
            Confirmation de suppression
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4 text-center">
          <div className="mb-4">
            <FaExclamationTriangle size={48} className="text-danger mb-3" />
            <h5 className="fw-bold mb-2">Supprimer cet événement ?</h5>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              Cette action est irréversible. Toutes les données associées à cet événement seront définitivement supprimées.
            </p>
            <p className="text-danger small mt-2">
              <strong>Attention : Cette action ne peut pas être annulée</strong>
            </p>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-0 p-3 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setShowDeleteModal(false);
              setDeleteTarget(null);
            }}
            className="rounded-pill px-4 py-2"
            style={{ fontSize: "0.9rem", minWidth: "100px" }}
            disabled={isSubmitting}
          >
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={executeDelete}
            className="rounded-pill px-4 py-2 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "0.9rem",
              minWidth: "120px"
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Suppression...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Supprimer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Styles CSS */}
      <style jsx>{`
        .modal-content {
          border-radius: 15px !important;
          border: none !important;
          box-shadow: 0 15px 35px rgba(0,0,0,0.15) !important;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
        }
        
        .page-link {
          cursor: pointer;
        }
        
        .page-item.active .page-link {
          background-color: #667eea;
          border-color: #667eea;
        }
        
        .event-card {
          transition: all 0.3s ease;
        }
        
        .event-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        
        .list-view-item {
          transition: all 0.2s ease;
        }
        
        .list-view-item:hover {
          background-color: #f8f9fa;
        }
        
        .btn-outline-primary:hover {
          background-color: #667eea;
          border-color: #667eea;
        }
      `}</style>
    </div>
  );
};

export default EvenementMembre;