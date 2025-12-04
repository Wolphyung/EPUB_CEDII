// src/pages/membre/AppelOffreMembre.jsx

import React, { useState, useEffect, useCallback } from "react";
import { 
  Card, 
  Button, 
  Modal, 
  Form, 
  Row, 
  Col, 
  Badge, 
  Alert, 
  Spinner,
  Container,
  InputGroup,
  ProgressBar
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import { 
  FaBriefcase, 
  FaCheckCircle, 
  FaClock, 
  FaExclamationTriangle, 
  FaEye,
  FaHeart,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUserTie,
  FaFileUpload,
  FaTag,
  FaSearch,
  FaDownload,
  FaExternalLinkAlt,
  FaFileAlt,
  FaFilePdf,
  FaRocket,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaTimes,
  FaUpload,
  FaImage
} from 'react-icons/fa';
import axios from "axios";

// === CONFIGURATION ===
const API_URL = "http://127.0.0.1:8000/api/appeloffres";

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
  info: "#17a2b8"
};

// === STYLES ===
const styles = {
  container: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: '100vh'
  },
  sidebarCollapsed: { width: '80px' },
  sidebarExpanded: { width: '280px' },
  
  card: {
    borderRadius: "18px",
    background: COLORS.white,
    border: "none",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease"
  },
  
  badge: {
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600"
  },
  
  input: {
    borderRadius: "12px",
    border: `1.5px solid ${COLORS.border}`,
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    transition: "all 0.2s ease"
  },
  
  modalHeader: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderTopLeftRadius: "18px",
    borderTopRightRadius: "18px"
  }
};

// === COMPOSANTS RÉUTILISABLES ===
const StatsCard = ({ icon: Icon, value, label, color }) => (
  <Card className="border-0 shadow-sm text-center p-4 h-100"
    style={{
      borderRadius: "18px",
      background: COLORS.white,
      transition: "all 0.3s ease",
      cursor: "pointer"
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
    <div
      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
      style={{
        width: "60px",
        height: "60px",
        background: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.1)`,
        border: `3px solid ${color}`,
      }}
    >
      <Icon size={24} style={{ color }} />
    </div>
    <h3 style={{ 
      fontWeight: "bold", 
      color: "#2c3e50", 
      fontSize: "1.8rem",
      margin: 0 
    }}>
      {value}
    </h3>
    <p style={{ 
      fontWeight: "600", 
      color: COLORS.gray, 
      margin: 0,
      fontSize: "0.9rem",
      marginTop: "0.5rem"
    }}>
      {label}
    </p>
  </Card>
);

const FilePreview = ({ filePath, fileName }) => {

  const { t } = useTranslation();
  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://127.0.0.1:8000${path.startsWith('/') ? path : `/${path}`}`;
  };

  const fileUrl = getFileUrl(filePath);
  const fileExt = fileName?.split('.').pop().toLowerCase() || '';
  
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExt);
  
  const getFileIcon = () => {
    switch (fileExt) {
      case 'pdf': return <FaFilePdf className="text-danger" size={24} />;
      case 'doc':
      case 'docx': return <FaFileWord className="text-primary" size={24} />;
      case 'xls':
      case 'xlsx': return <FaFileExcel className="text-success" size={24} />;
      case 'ppt':
      case 'pptx': return <FaFileAlt className="text-warning" size={24} />;
      case 'zip':
      case 'rar':
      case '7z': return <FaFileArchive className="text-secondary" size={24} />;
      case 'txt': return <FaFileAlt className="text-dark" size={24} />;
      default: return <FaFileAlt className="text-secondary" size={24} />;
    }
  };

  return (
    <div className="p-3 border rounded" style={{ background: "#f8f9fa", borderRadius: "12px" }}>
      <div className="d-flex align-items-center mb-2">
        {isImage ? (
          <div className="position-relative me-2">
            <img 
              src={fileUrl} 
              alt="Preview" 
              style={{ 
                width: "40px", 
                height: "40px", 
                objectFit: "cover",
                borderRadius: "6px",
                border: "1px solid #dee2e6"
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<div style="width:40px;height:40px;background:#f8f9fa;border-radius:6px;display:flex;align-items:center;justify-content:center;"><FaFileImage className="text-info" size={20} /></div>';
              }}
            />
          </div>
        ) : getFileIcon()}
        <span className="ms-2 fw-semibold text-truncate" style={{ maxWidth: "200px" }}>
          {fileName || filePath?.split('/').pop() || "Fichier"}
        </span>
      </div>
      <div className="d-flex gap-2">
        <Button 
          variant="outline-primary" 
          size="sm" 
          className="rounded-pill"
          href={fileUrl} 
          target="_blank"
        >
          <FaExternalLinkAlt className="me-1" size={12} />
          {isImage ? t("view_image", "Voir") : fileExt === 'pdf' ? t("view", "Voir") : t("open", "Ouvrir")}
        </Button>
        <Button 
          variant="outline-secondary" 
          size="sm" 
          className="rounded-pill"
          href={fileUrl} 
          download
        >
          <FaDownload className="me-1" size={12} />
          {t("download", "Télécharger")}
        </Button>
      </div>
    </div>
  );
};

// === COMPOSANT PRINCIPAL ===
const AppelOffreMembre = () => {
  const { t } = useTranslation();
  const [offres, setOffres] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentOffre, setCurrentOffre] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [nouvelleOffre, setNouvelleOffre] = useState({
    intitule: "", 
    description: "", 
    date_cloture: "", 
    date_ouverture: "", 
    membre: "", 
    fichier: null,
    fichier_preview: null,
    statut: "En attente", 
    type_contrat: "CDI", 
    localisation: "", 
    salaire_remuneration: "", 
    est_urgent: false
  });

  // === INTERCEPTEUR AXIOS ===
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // === CONFIGURATION UPLOAD ===
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_EXTENSIONS = [
    'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 
    'txt', 'zip', 'rar', '7z', 'jpg', 'jpeg', 'png', 
    'gif', 'bmp', 'webp', 'svg'
  ];

  // === INITIALISATION ===
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  // === FONCTIONS UTILITAIRES ===
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false }), 4000);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentOffre(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  const handleShowAdd = () => {
    const user = currentUser || JSON.parse(localStorage.getItem('user'));
    const membreName = user?.nom_complet || user?.nom || user?.email || t("anonymous_user", "Utilisateur anonyme");
    
    setEditMode(false);
    setCurrentOffre(null);
    setNouvelleOffre({
      intitule: "",
      description: "",
      date_cloture: "",
      date_ouverture: new Date().toISOString().split('T')[0],
      membre: membreName,
      fichier: null,
      fichier_preview: null,
      statut: "En attente",
      type_contrat: "CDI",
      localisation: "",
      salaire_remuneration: "",
      est_urgent: false
    });
    setShowModal(true);
  };

  const handleShowEdit = (offre) => {
    if (!isUserAuthor(offre)) {
      showAlert(t("unauthorized_edit", "Vous n'êtes pas autorisé à modifier cette offre"), "warning");
      return;
    }

    setEditMode(true);
    setCurrentOffre(offre);
    setNouvelleOffre({
      intitule: offre.intitule,
      description: offre.description,
      date_cloture: offre.date_cloture,
      date_ouverture: offre.date_ouverture,
      membre: offre.membre,
      fichier: null,
      fichier_preview: null,
      statut: offre.statut,
      type_contrat: offre.type_contrat || "CDI",
      localisation: offre.localisation || "",
      salaire_remuneration: offre.salaire_remuneration || "",
      est_urgent: !!offre.est_urgent
    });
    setShowModal(true);
  };

  const isUserAuthor = (offre) => {
    if (!currentUser) return false;
    if (currentUser.type === 'admin') return true;
    
    if (offre.membre_id && currentUser.id) {
      return offre.membre_id === currentUser.id;
    }
    
    return offre.membre === currentUser.nom_complet || 
           offre.membre === currentUser.nom || 
           offre.membre === currentUser.email;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === "file" && files[0]) {
      const file = files[0];
      const fileExt = file.name.split('.').pop().toLowerCase();
      
      // Validation de taille
      if (file.size > MAX_FILE_SIZE) {
        showAlert(
          t("file_too_large", "Le fichier est trop volumineux (maximum 10MB)"),
          "warning"
        );
        e.target.value = '';
        return;
      }
      
      // Validation du type
      if (!ALLOWED_EXTENSIONS.includes(fileExt)) {
        showAlert(
          t("invalid_file_type", "Type de fichier non supporté"),
          "warning"
        );
        e.target.value = '';
        return;
      }
      
      // Créer une prévisualisation pour les images
      let filePreview = null;
      if (file.type.startsWith('image/')) {
        filePreview = URL.createObjectURL(file);
      }
      
      setNouvelleOffre(prev => ({
        ...prev,
        fichier: file,
        fichier_preview: filePreview
      }));
    } else if (type === "checkbox") {
      setNouvelleOffre(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setNouvelleOffre(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const removeFile = () => {
    if (nouvelleOffre.fichier_preview) {
      URL.revokeObjectURL(nouvelleOffre.fichier_preview);
    }
    setNouvelleOffre(prev => ({
      ...prev,
      fichier: null,
      fichier_preview: null
    }));
  };

  // === BADGES ===
  const StatusBadge = ({ statut }) => {
    const config = {
      "Validé": { color: "success", icon: FaCheckCircle, text: t("Validé", "Validé") },
      "En attente": { color: "warning", icon: FaClock, text: t("En attente", "En attente") },
      "Rejeté": { color: "danger", icon: FaExclamationTriangle, text: t("Rejeté", "Rejeté") },
      "Actif": { color: "primary", icon: FaBriefcase, text: t("Actif", "Actif") },
      "Clôturé": { color: "secondary", icon: FaCheckCircle, text: t("Clôturé", "Clôturé") }
    };
    
    const cfg = config[statut] || config["En attente"];
    const Icon = cfg.icon;
    
    return (
      <Badge 
        bg={cfg.color} 
        className="d-flex align-items-center px-3 py-2" 
        style={{ ...styles.badge }}
      >
        <Icon size={14} className="me-1" />
        {cfg.text}
      </Badge>
    );
  };

  const TypeBadge = ({ type }) => {
    const colors = {
      "CDI": "success",
      "CDD": "warning",
      "Stage": "info",
      "Freelance": "primary",
      "Alternance": "dark"
    };
    
    return (
      <Badge 
        bg={colors[type] || "secondary"}
        className="px-3 py-2"
        style={{ ...styles.badge, fontSize: "0.7rem" }}
      >
        {type}
      </Badge>
    );
  };

  const UserBadge = ({ offre }) => {
    if (isUserAuthor(offre)) {
      return (
        <Badge bg="info" className="ms-1 px-2 py-1" style={{ fontSize: "0.7rem" }}>
          <FaUserTie size={10} className="me-1" />
          {t("your_offer", "Votre offre")}
        </Badge>
      );
    }
    return null;
  };

  // === API FUNCTIONS ===
  const fetchOffres = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      
      const offresWithStats = await Promise.all(
        response.data.map(async (offre) => {
          if (offre.statut === "Validé") {
            try {
              const statsResponse = await axios.get(`${API_URL}/${offre.id}/stats`);
              return {
                ...offre,
                stats: statsResponse.data.stats || {
                  total_views: 0,
                  total_reactions: 0,
                  reactions_by_type: {}
                }
              };
            } catch (error) {
              return {
                ...offre,
                stats: { total_views: 0, total_reactions: 0, reactions_by_type: {} }
              };
            }
          }
          return offre;
        })
      );

      // Filtrer selon le type d'utilisateur
      let filteredOffres = offresWithStats;
      if (currentUser && currentUser.type === 'membre') {
        filteredOffres = offresWithStats.filter(offre => 
          offre.membre_id === currentUser.id || 
          offre.membre === currentUser.nom_complet ||
          offre.membre === currentUser.nom ||
          offre.membre === currentUser.email
        );
      }
      
      setOffres(filteredOffres);
    } catch (err) {
      console.error("Erreur chargement offres:", err);
      setError(t("error_load_offers", "Erreur lors du chargement des offres"));
    } finally {
      setLoading(false);
    }
  }, [currentUser, t]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      showAlert(t("login_required", "Vous devez être connecté pour effectuer cette action"), "danger");
      return;
    }

    if (!nouvelleOffre.intitule || !nouvelleOffre.date_cloture || !nouvelleOffre.description) {
      showAlert(t("missing_required_fields", "Veuillez remplir tous les champs obligatoires"), "warning");
      return;
    }

    // Validation de la date de clôture
    const today = new Date().setHours(0, 0, 0, 0);
    const closingDate = new Date(nouvelleOffre.date_cloture).setHours(0, 0, 0, 0);
    if (closingDate < today) {
      showAlert(t("invalid_closing_date", "La date de clôture ne peut pas être dans le passé"), "warning");
      return;
    }

    setIsSubmitting(true);
    setIsUploading(!!nouvelleOffre.fichier);
    setUploadProgress(0);

    const formData = new FormData();
    
    // Statut final
    let finalStatut = nouvelleOffre.statut;
    if (!editMode && currentUser?.type !== 'admin') {
      finalStatut = "En attente";
    }

    const data = {
      intitule: nouvelleOffre.intitule,
      description: nouvelleOffre.description,
      date_cloture: nouvelleOffre.date_cloture,
      date_ouverture: nouvelleOffre.date_ouverture,
      membre: nouvelleOffre.membre,
      statut: finalStatut,
      type_contrat: nouvelleOffre.type_contrat,
      localisation: nouvelleOffre.localisation,
      salaire_remuneration: nouvelleOffre.salaire_remuneration,
      est_urgent: nouvelleOffre.est_urgent ? 1 : 0
    };

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value || "");
    });

    if (nouvelleOffre.fichier) {
      formData.append("fichier", nouvelleOffre.fichier);
      
      // Afficher un message pour les gros fichiers
      if (nouvelleOffre.fichier.size > 5 * 1024 * 1024) {
        showAlert(t("uploading_large_file", "Téléchargement du fichier volumineux en cours..."), "info");
      }
    }

    try {
      const config = {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      };

      if (editMode && currentOffre) {
        formData.append("_method", "PUT");
        await axios.post(`${API_URL}/${currentOffre.id}`, formData, config);
        showAlert(t("success_edit_offer", "Offre modifiée avec succès"), "success");
      } else {
        await axios.post(API_URL, formData, config);
        
        const message = finalStatut === "En attente" 
          ? t("offer_created_pending", "Offre créée avec succès, en attente de validation") 
          : t("success_add_offer", "Offre ajoutée avec succès");
        
        showAlert(message, "success");
      }
      
      // Nettoyer la prévisualisation
      if (nouvelleOffre.fichier_preview) {
        URL.revokeObjectURL(nouvelleOffre.fichier_preview);
      }
      
      handleClose();
      fetchOffres();
    } catch (err) {
      console.error("Erreur sauvegarde:", err);
      
      if (err.response?.status === 413) {
        showAlert(t("file_too_large_server", "Le fichier est trop volumineux pour le serveur"), "danger");
      } else if (err.response?.status === 415) {
        showAlert(t("unsupported_media_type", "Type de fichier non supporté par le serveur"), "danger");
      } else if (err.response?.status === 401) {
        showAlert(t("unauthorized_action", "Action non autorisée"), "danger");
      } else {
        showAlert(`${t("error_operation", "Erreur lors de l'opération")}: ${err.response?.data?.message || err.message}`, "danger");
      }
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });
      showAlert(t("success_delete_offer", "Offre supprimée avec succès"), "success");
      fetchOffres();
    } catch {
      showAlert(t("error_delete_offer", "Erreur lors de la suppression"), "danger");
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  // === EFFECTS ===
  useEffect(() => {
    if (currentUser) {
      fetchOffres();
    }
  }, [currentUser, fetchOffres]);

  // Nettoyage des URLs de prévisualisation
  useEffect(() => {
    return () => {
      if (nouvelleOffre.fichier_preview) {
        URL.revokeObjectURL(nouvelleOffre.fichier_preview);
      }
    };
  }, [nouvelleOffre.fichier_preview]);

  // === FILTRAGE ===
  const filteredOffres = offres.filter(offre => {
    const matchesSearch = offre.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offre.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         offre.membre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || offre.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // === STATISTIQUES ===
  const statsCards = [
    {
      icon: FaBriefcase,
      value: offres.length,
      label: t("total_offers", "Total des offres"),
      color: COLORS.primary
    },
    {
      icon: FaCheckCircle,
      value: offres.filter(o => o.statut === "Validé").length,
      label: t("validated_offers", "Offres validées"),
      color: COLORS.success
    },
    {
      icon: FaClock,
      value: offres.filter(o => o.statut === "En attente").length,
      label: t("pending_offers", "Offres en attente"),
      color: COLORS.warning
    },
    {
      icon: FaExclamationTriangle,
      value: offres.filter(o => o.est_urgent).length,
      label: t("urgent_offers", "Offres urgentes"),
      color: COLORS.danger
    },
    {
      icon: FaEye,
      value: offres.reduce((total, o) => total + (o.stats?.total_views || 0), 0),
      label: t("total_views", "Total des vues"),
      color: COLORS.info
    },
    {
      icon: FaHeart,
      value: offres.reduce((total, o) => total + (o.stats?.total_reactions || 0), 0),
      label: t("total_reactions", "Total des réactions"),
      color: COLORS.secondary
    }
  ];

  // === RENDU ===
  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger" className="shadow-lg p-4" style={{ borderRadius: "15px" }}>
          <FaExclamationTriangle className="me-2" />
          <h4>{t("api_error", "Erreur API")}</h4>
          <p>{error}</p>
          <Button 
            variant="outline-danger" 
            onClick={fetchOffres}
            className="mt-3 rounded-pill"
          >
            {t("retry", "Réessayer")}
          </Button>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={styles.container}>
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
              {currentUser?.type === 'admin' 
                ? t("offer_management_title", "Gestion des appels d'offres") 
                : t("my_offers", "Mes appels d'offres")}
            </h1>
            <p style={{ color: COLORS.gray, fontSize: "1rem", margin: 0 }}>
              {currentUser?.type === 'admin' 
                ? t("offer_management_subtitle", "Gérez toutes les offres du système") 
                : t("manage_your_offers", "Gérez vos appels d'offres et postulez")}
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
            {t("new_offer_button", "Nouvel appel d'offres")}
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
              <Col md={8}>
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
                    placeholder={t("search_offers_placeholder", "Rechercher des offres...")}
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
                  <option value="all">{t("all_status", "Tous les statuts")}</option>
                  <option value="Validé">{t("Validé", "Validé")}</option>
                  <option value="En attente">{t("En attente", "En attente")}</option>
                  <option value="Rejeté">{t("Rejeté", "Rejeté")}</option>
                  <option value="Clôturé">{t("Clôturé", "Clôturé")}</option>
                </Form.Select>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Stats Cards */}
        <Row className="mb-5 g-4">
          {statsCards.map((stat, index) => (
            <Col xl={4} lg={4} md={6} key={index}>
              <StatsCard {...stat} />
            </Col>
          ))}
        </Row>

        {/* Info pour les membres */}
        {currentUser?.type === 'membre' && offres.some(o => o.statut === "En attente") && (
          <Alert variant="info" className="mb-4" style={{ borderRadius: "12px" }}>
            <i className="fas fa-info-circle me-2"></i>
            <strong>{t("information", "Information")}:</strong> {t("pending_offers_info", "Vos offres sont en attente de validation par l'administrateur.")}
          </Alert>
        )}

        {/* Liste des offres */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">{t("loading_offers", "Chargement des offres...")}</p>
          </div>
        ) : filteredOffres.length === 0 ? (
          <Card className="text-center border-0 shadow-sm p-5" style={{ borderRadius: "20px", minHeight: "300px" }}>
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <FaBriefcase size={80} className="text-muted mb-4" />
              <h3 className="text-dark mb-3">{t("no_offers_found", "Aucune offre trouvée")}</h3>
              <p className="text-muted mb-4">
                {searchTerm || statusFilter !== "all" 
                  ? t("no_offers_match", "Aucune offre ne correspond à vos critères") 
                  : currentUser?.type === 'admin' 
                    ? t("no_offers_system", "Aucune offre dans le système") 
                    : t("start_first_offer", "Commencez par créer votre première offre")}
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
                {t("create_offer", "Créer une offre")}
              </Button>
            </div>
          </Card>
        ) : (
          <Row className="g-4">
            {filteredOffres.map(offre => {
              const userIsAuthor = isUserAuthor(offre);
              const isUrgent = offre.est_urgent || 
                (offre.date_cloture && 
                 new Date(offre.date_cloture).setHours(0,0,0,0) - new Date().setHours(0,0,0,0) <= 7 * 86400000);

              return (
                <Col key={offre.id} xl={6} lg={6} className="mb-4">
                  <Card
                    className="border-0 shadow-sm h-100"
                    style={{
                      borderRadius: "18px",
                      borderLeft: `4px solid ${
                        isUrgent ? "#ff6b6b" : 
                        offre.statut === "Validé" ? "#28a745" : 
                        offre.statut === "En attente" ? "#ffc107" : 
                        offre.statut === "Rejeté" ? "#dc3545" : "#6c757d"
                      }`,
                      transition: "all 0.3s ease"
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
                    <Card.Body className="p-4">
                      {/* Header */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <Card.Title className="h5 fw-bold mb-1" style={{ color: COLORS.dark }}>
                            {offre.intitule}
                            {isUrgent && (
                              <Badge bg="danger" className="ms-2">
                                <FaExclamationTriangle size={12} className="me-1" />
                                {t("urgent", "Urgent")}
                              </Badge>
                            )}
                          </Card.Title>
                          <div className="d-flex align-items-center flex-wrap gap-1 mt-2">
                            {offre.type_contrat && <TypeBadge type={offre.type_contrat} />}
                            <UserBadge offre={offre} />
                          </div>
                        </div>
                        <StatusBadge statut={offre.statut} />
                      </div>

                      {/* Informations */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <FaUserTie className="text-primary me-2" size={14} />
                          <span className="fw-semibold">{t("member", "Membre")}: {offre.membre || "NC"}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <FaMapMarkerAlt className="text-danger me-2" size={14} />
                          <span>{offre.localisation || t("not_specified", "Non spécifié")}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <FaMoneyBillWave className="text-success me-2" size={14} />
                          <span className="fw-semibold">{offre.salaire_remuneration || t("negotiable", "Négociable")}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <Card.Text className="text-muted mb-3" style={{ lineHeight: 1.6 }}>
                        {offre.description.length > 120 
                          ? `${offre.description.substring(0, 120)}...` 
                          : offre.description}
                      </Card.Text>

                      {/* Fichier */}
                      {offre.fichier && (
                        <div className="mb-3">
                          <FilePreview filePath={offre.fichier} fileName={offre.fichier.split('/').pop()} />
                        </div>
                      )}

                      {/* Dates */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div>
                          <small className="text-muted">
                            <FaCalendarAlt className="me-1" size={12} />
                            {t("opening", "Ouverture")}: {new Date(offre.date_ouverture).toLocaleDateString()}
                          </small>
                        </div>
                        <div>
                          <small className="fw-semibold" style={{ color: isUrgent ? "#ff6b6b" : COLORS.gray }}>
                            <FaCalendarAlt className="me-1" size={12} />
                            {t("closing", "Clôture")}: {new Date(offre.date_cloture).toLocaleDateString()}
                          </small>
                        </div>
                      </div>

                      {/* Statistiques */}
                      {offre.statut === "Validé" && offre.stats && (
                        <div className="border-top pt-3 mt-3">
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-3">
                              <div className="d-flex align-items-center text-muted">
                                <FaEye className="me-1" size={14} />
                                <small className="fw-semibold">{offre.stats.total_views || 0}</small>
                                <span className="ms-1">{t("views", "vues")}</span>
                              </div>
                              
                              {offre.stats.total_reactions > 0 && (
                                <div className="d-flex align-items-center gap-2">
                                  {offre.stats.reactions_by_type.like > 0 && (
                                    <div className="d-flex align-items-center text-primary">
                                      <i className="fas fa-thumbs-up me-1"></i>
                                      <small className="fw-semibold">{offre.stats.reactions_by_type.like}</small>
                                    </div>
                                  )}
                                  {offre.stats.reactions_by_type.love > 0 && (
                                    <div className="d-flex align-items-center text-danger">
                                      <i className="fas fa-heart me-1"></i>
                                      <small className="fw-semibold">{offre.stats.reactions_by_type.love}</small>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {offre.stats.total_reactions > 0 && (
                              <small className="text-muted fw-semibold">
                                {offre.stats.total_reactions} {t("reaction" + (offre.stats.total_reactions > 1 ? "s" : ""), "réaction(s)")}
                              </small>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Message pour offres en attente */}
                      {offre.statut === "En attente" && (
                        <Alert variant="warning" className="py-2 mb-3" style={{ borderRadius: "8px" }}>
                          <FaClock className="me-2" />
                          <small>{t("pending_validation", "En attente de validation par l'administrateur")}</small>
                        </Alert>
                      )}

                      {/* Actions */}
                      <div className="border-top pt-3 mt-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            {userIsAuthor ? (
                              <>
                                {(offre.statut === "En attente" || offre.statut === "Validé" || offre.statut === "Rejeté") && (
                                  <Button 
                                    variant={offre.statut === "En attente" ? "outline-warning" : "outline-primary"} 
                                    size="sm" 
                                    onClick={() => handleShowEdit(offre)}
                                    className="rounded-pill px-3 d-flex align-items-center"
                                  >
                                    <FaEdit className="me-1" size={12} />
                                    {t("edit", "Modifier")}
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Badge bg="secondary" className="px-3 py-2">
                                <FaEye className="me-1" />
                                {t("read_only", "Lecture seule")}
                              </Badge>
                            )}
                          </div>
                          <div>
                            {userIsAuthor && (
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => confirmDelete(offre.id)}
                                className="rounded-pill px-3 d-flex align-items-center"
                              >
                                <FaTrash className="me-1" size={12} />
                                {t("delete", "Supprimer")}
                              </Button>
                            )}
                          </div>
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
        <Modal show={showModal} onHide={handleClose} centered size="lg">
          <Modal.Header closeButton style={styles.modalHeader}>
            <Modal.Title className="fw-bold d-flex align-items-center">
              {editMode ? <FaEdit className="me-2" /> : <FaPlusCircle className="me-2" />}
              {editMode 
                ? t("edit_offer_modal", "Modifier l'appel d'offres") 
                : t("add_offer_modal", "Nouvel appel d'offres")}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4 p-md-5">
            {/* Info pour nouvelles offres */}
            {!editMode && currentUser?.type !== 'admin' && (
              <Alert variant="info" className="mb-4" style={{ borderRadius: "10px" }}>
                <i className="fas fa-info-circle me-2"></i>
                {t("offer_pending_info", "Votre offre sera soumise pour validation par l'administrateur.")}
              </Alert>
            )}

            {/* Barre de progression pour l'upload */}
            {isUploading && (
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <small className="fw-semibold">{t("uploading_file", "Téléchargement du fichier")}</small>
                  <small className="fw-bold">{uploadProgress}%</small>
                </div>
                <ProgressBar 
                  now={uploadProgress} 
                  variant="success" 
                  animated 
                  style={{ height: "8px", borderRadius: "4px" }}
                />
              </div>
            )}

            <Form onSubmit={handleSave}>
              <Row className="g-4">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2">
                      <FaBriefcase className="me-2" style={{ color: COLORS.primary }} />
                      {t("offer_title", "Titre de l'offre")} *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="intitule"
                      value={nouvelleOffre.intitule}
                      onChange={handleChange}
                      required
                      style={{ ...styles.input, borderColor: nouvelleOffre.intitule ? '#28a745' : styles.input.border }}
                      placeholder={t("offer_title_placeholder", "Ex: Développeur Full Stack")}
                    />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2">
                      <FaTag className="me-2" style={{ color: COLORS.success }} />
                      {t("contract_type", "Type de contrat")}
                    </Form.Label>
                    <Form.Select
                      name="type_contrat"
                      value={nouvelleOffre.type_contrat}
                      onChange={handleChange}
                      style={styles.input}
                    >
                      {["CDI", "CDD", "Stage", "Freelance", "Alternance"].map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-4 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2">
                      <FaUserTie className="me-2" style={{ color: COLORS.info }} />
                      {t("issuing_member", "Membre émetteur")}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="membre"
                      value={nouvelleOffre.membre}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder={t("issuing_member_placeholder", "Nom du membre")}
                      readOnly={currentUser?.type === 'membre'}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2">
                      <FaMapMarkerAlt className="me-2" style={{ color: COLORS.danger }} />
                      {t("location", "Localisation")}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="localisation"
                      value={nouvelleOffre.localisation}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder={t("select_location", "Ex: Paris, France")}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-4 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2">
                      <FaMoneyBillWave className="me-2" style={{ color: COLORS.success }} />
                      {t("salary", "Salaire/Rémunération")}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="salaire_remuneration"
                      value={nouvelleOffre.salaire_remuneration}
                      onChange={handleChange}
                      style={styles.input}
                      placeholder={t("salary_placeholder", "Ex: 45K€ - 55K€ annuels")}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2">
                      <FaFileUpload className="me-2" style={{ color: COLORS.warning }} />
                      {t("file_label", "Fichier joint")}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="fichier"
                      onChange={handleChange}
                      style={styles.input}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                    />
                    <Form.Text className="text-muted">
                      {t("supported_formats", "Formats acceptés")}: PDF, Word, Excel, Images (JPG, PNG, GIF), ZIP (max 10MB)
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Prévisualisation du fichier sélectionné */}
              {nouvelleOffre.fichier && (
                <Alert variant="light" className="mt-3 p-3" style={{ borderRadius: "10px", border: "1px dashed #dee2e6" }}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {nouvelleOffre.fichier.type.startsWith('image/') && nouvelleOffre.fichier_preview ? (
                        <img 
                          src={nouvelleOffre.fichier_preview} 
                          alt="Preview" 
                          style={{ 
                            width: "50px", 
                            height: "50px", 
                            objectFit: "cover",
                            borderRadius: "6px",
                            marginRight: "10px"
                          }}
                        />
                      ) : (
                        <FaFileAlt className="me-3" size={24} style={{ color: COLORS.primary }} />
                      )}
                      <div>
                        <div className="fw-semibold">{nouvelleOffre.fichier.name}</div>
                        <small className="text-muted">
                          {(nouvelleOffre.fichier.size / 1024 / 1024).toFixed(2)} MB • {nouvelleOffre.fichier.type}
                        </small>
                      </div>
                    </div>
                    <Button 
                      variant="outline-danger" 
                      size="sm" 
                      onClick={removeFile}
                      className="rounded-circle"
                      style={{ width: "32px", height: "32px", padding: 0 }}
                    >
                      <FaTimes size={14} />
                    </Button>
                  </div>
                </Alert>
              )}

              {/* Fichier actuel (en mode édition) */}
              {editMode && currentOffre?.fichier && !nouvelleOffre.fichier && (
                <Alert variant="info" className="mt-3 p-3" style={{ borderRadius: "10px" }}>
                  <div className="d-flex align-items-center">
                    <FaFileAlt className="me-3" size={24} />
                    <div>
                      <div className="fw-semibold">{t("current_file", "Fichier actuel")}:</div>
                      <small>{currentOffre.fichier.split('/').pop()}</small>
                    </div>
                  </div>
                </Alert>
              )}

              <Row className="g-4 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2">
                      <FaCalendarAlt className="me-2" style={{ color: COLORS.info }} />
                      {t("opening_date", "Date d'ouverture")}
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date_ouverture"
                      value={nouvelleOffre.date_ouverture}
                      onChange={handleChange}
                      style={styles.input}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-2">
                      <FaCalendarAlt className="me-2" style={{ color: COLORS.danger }} />
                      {t("closing_date", "Date de clôture")} *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date_cloture"
                      value={nouvelleOffre.date_cloture}
                      onChange={handleChange}
                      required
                      style={{ 
                        ...styles.input, 
                        borderColor: nouvelleOffre.date_cloture && 
                          new Date(nouvelleOffre.date_cloture) >= new Date(nouvelleOffre.date_ouverture || new Date()) 
                          ? '#28a745' 
                          : styles.input.border 
                      }}
                      min={nouvelleOffre.date_ouverture || new Date().toISOString().split('T')[0]}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-3">
                <Form.Label className="fw-semibold mb-2">
                  <FaBriefcase className="me-2" style={{ color: COLORS.info }} />
                  {t("description", "Description")} *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={nouvelleOffre.description}
                  onChange={handleChange}
                  required
                  style={{ 
                    ...styles.input, 
                    resize: "none",
                    borderColor: nouvelleOffre.description ? '#28a745' : styles.input.border 
                  }}
                  placeholder={t("description_placeholder", "Décrivez en détail l'appel d'offres...")}
                  maxLength={2000}
                />
                <Form.Text className="text-muted d-block text-end mt-2">
                  {nouvelleOffre.description.length}/2000 {t("characters", "caractères")}
                </Form.Text>
              </Form.Group>

              <Form.Group className="mt-3">
                <Form.Check
                  type="checkbox"
                  name="est_urgent"
                  label={<span className="fw-semibold">{t("mark_as_urgent", "Marquer comme urgent")}</span>}
                  checked={nouvelleOffre.est_urgent}
                  onChange={handleChange}
                />
                <Form.Text className="text-muted">
                  {t("urgent_note", "Les offres urgentes seront mises en avant et marquées d'un badge spécial.")}
                </Form.Text>
              </Form.Group>

              {/* Statut (admin seulement) */}
              {currentUser?.type === 'admin' && (
                <Form.Group className="mt-3">
                  <Form.Label className="fw-semibold mb-2">
                    <FaCheckCircle className="me-2" style={{ color: COLORS.success }} />
                    {t("status", "Statut")}
                  </Form.Label>
                  <Form.Select
                    name="statut"
                    value={nouvelleOffre.statut}
                    onChange={handleChange}
                    style={styles.input}
                  >
                    <option value="En attente">{t("En attente", "En attente")}</option>
                    <option value="Validé">{t("Validé", "Validé")}</option>
                    <option value="Rejeté">{t("Rejeté", "Rejeté")}</option>
                    <option value="Clôturé">{t("Clôturé", "Clôturé")}</option>
                  </Form.Select>
                </Form.Group>
              )}
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0 p-4">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose} 
              className="rounded-pill px-4 px-lg-5 py-2" 
              disabled={isSubmitting}
              style={{ minWidth: '120px' }}
            >
              <FaTimes className="me-2" />
              {t("cancel_button", "Annuler")}
            </Button>
            <Button
              type="submit"
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
                  {editMode 
                    ? t("saving", "Sauvegarde...") 
                    : t("creating", "Création...")}
                </>
              ) : (
                <>
                  {editMode ? <FaEdit className="me-2" /> : <FaRocket className="me-2" />}
                  {editMode 
                    ? t("save_button", "Enregistrer") 
                    : t("create_offer_button", "Créer l'offre")}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal de confirmation de suppression */}
        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">
              <FaExclamationTriangle className="me-2" />
              {t("confirm", "Confirmation")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <FaExclamationTriangle size={48} className="text-danger mb-3" />
            <p className="mb-0">{t("delete_confirmation", "Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.")}</p>
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowConfirm(false)} 
              className="px-4 rounded-pill"
              disabled={isSubmitting}
            >
              {t("cancel_button", "Annuler")}
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
                <FaTrash className="me-1" />
              )}
              {t("delete", "Supprimer")}
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
        
        .progress-bar {
          transition: width 0.3s ease;
        }
        
        .file-preview-img {
          transition: transform 0.3s ease;
        }
        
        .file-preview-img:hover {
          transform: scale(1.1);
        }
      `}</style>
    </div>
  );
};

export default AppelOffreMembre;