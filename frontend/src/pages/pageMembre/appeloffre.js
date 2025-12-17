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
  InputGroup,
  ProgressBar,
  ButtonGroup,
  OverlayTrigger,
  Tooltip,
  ListGroup
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
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
  FaImage,
  FaInfoCircle,
  FaSync,
  FaExclamationCircle,
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

// === COMPOSANTS RÉUTILISABLES ===
const StatsCard = ({ icon: Icon, value, label, color, onClick }) => (
  <Card 
    className="border-0 shadow-sm text-center p-3 h-100"
    style={{
      borderRadius: "12px",
      background: COLORS.white,
      transition: "all 0.3s ease",
      cursor: "pointer"
    }}
    onClick={onClick}
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
        background: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.1)`,
        border: `2px solid ${color}`,
      }}
    >
      <Icon size={20} style={{ color }} />
    </div>
    <h4 style={{ 
      fontWeight: "bold", 
      color: "#2c3e50", 
      fontSize: "1.5rem",
      margin: 0 
    }}>
      {value}
    </h4>
    <p style={{ 
      fontWeight: "600", 
      color: COLORS.gray, 
      margin: 0,
      fontSize: "0.8rem",
      marginTop: "0.25rem"
    }}>
      {label}
    </p>
  </Card>
);

const FilePreview = ({ filePath, fileName, size = "normal" }) => {
  const { t } = useTranslation();
  const getFileUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http://') || path.startsWith('https://')) return path;
    return `http://127.0.0.1:8000${path.startsWith('/') ? path : `/${path}`}`;
  };

  const fileUrl = getFileUrl(filePath);
  const fileExt = fileName?.split('.').pop().toLowerCase() || '';
  const isSmall = size === "small";
  
  const isImage = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(fileExt);
  
  const getFileIcon = () => {
    switch (fileExt) {
      case 'pdf': return <FaFilePdf className="text-danger" size={isSmall ? 16 : 20} />;
      case 'doc':
      case 'docx': return <FaFileWord className="text-primary" size={isSmall ? 16 : 20} />;
      case 'xls':
      case 'xlsx': return <FaFileExcel className="text-success" size={isSmall ? 16 : 20} />;
      case 'ppt':
      case 'pptx': return <FaFileAlt className="text-warning" size={isSmall ? 16 : 20} />;
      case 'zip':
      case 'rar':
      case '7z': return <FaFileArchive className="text-secondary" size={isSmall ? 16 : 20} />;
      case 'txt': return <FaFileAlt className="text-dark" size={isSmall ? 16 : 20} />;
      default: return <FaFileAlt className="text-secondary" size={isSmall ? 16 : 20} />;
    }
  };

  return (
    <div className={`p-${isSmall ? '2' : '3'} border rounded`} style={{ 
      background: "#f8f9fa", 
      borderRadius: isSmall ? "8px" : "10px",
      fontSize: isSmall ? "0.8rem" : "0.9rem"
    }}>
      <div className="d-flex align-items-center mb-2">
        {isImage ? (
          <div className="position-relative me-2">
            <img 
              src={fileUrl} 
              alt="Preview" 
              style={{ 
                width: isSmall ? "30px" : "40px", 
                height: isSmall ? "30px" : "40px", 
                objectFit: "cover",
                borderRadius: "4px",
                border: "1px solid #dee2e6"
              }}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = `<div style="width:${isSmall ? '30px' : '40px'};height:${isSmall ? '30px' : '40px'};background:#f8f9fa;border-radius:4px;display:flex;align-items:center;justify-content:center;">
                  <FaFileImage className="text-info" size=${isSmall ? '14' : '16'} />
                </div>`;
              }}
            />
          </div>
        ) : getFileIcon()}
        <span className="ms-2 fw-semibold text-truncate" style={{ maxWidth: isSmall ? "100px" : "150px" }}>
          {fileName || filePath?.split('/').pop() || "Fichier"}
        </span>
      </div>
      <div className="d-flex gap-1">
        <Button 
          variant="outline-primary" 
          size={isSmall ? "sm" : "sm"}
          className="rounded-pill"
          href={fileUrl} 
          target="_blank"
          style={{ fontSize: isSmall ? "0.7rem" : "0.8rem", padding: isSmall ? "0.25rem 0.5rem" : "0.375rem 0.75rem" }}
        >
          <FaExternalLinkAlt className="me-1" size={isSmall ? 10 : 12} />
          {isImage ? t("view_image", "Voir") : fileExt === 'pdf' ? t("view", "Voir") : t("open", "Ouvrir")}
        </Button>
        <Button 
          variant="outline-secondary" 
          size={isSmall ? "sm" : "sm"}
          className="rounded-pill"
          href={fileUrl} 
          download
          style={{ fontSize: isSmall ? "0.7rem" : "0.8rem", padding: isSmall ? "0.25rem 0.5rem" : "0.375rem 0.75rem" }}
        >
          <FaDownload className="me-1" size={isSmall ? 10 : 12} />
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
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
  
  // === NOUVEAUX ÉTATS ===
  const [displayMode, setDisplayMode] = useState("grid"); // "grid" ou "list"
  const [currentPage, setCurrentPage] = useState(0);
  const [cardSize, setCardSize] = useState("normal"); // "small", "normal", "large"
  const [sortBy, setSortBy] = useState("date_cloture"); // "date_cloture", "intitule", "statut"
  const [sortOrder, setSortOrder] = useState("asc"); // "asc" ou "desc"
  
  const [apiError, setApiError] = useState({
    show: false,
    title: "",
    message: "",
    type: "error",
    retryAction: null
  });
  const [formErrors, setFormErrors] = useState({});

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

  // === GESTIONNAIRE D'ERREURS API ===
  const handleApiError = useCallback((error, context = "opération", retryCallback = null) => {
    console.error(`Erreur ${context}:`, error);
    
    let errorTitle = t("error_title", "Erreur");
    let errorMessage = t("unknown_error", "Une erreur inconnue est survenue");
    let errorType = "error";
    
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const data = error.response?.data;
      
      switch (status) {
        case 400:
          errorTitle = t("bad_request", "Requête invalide");
          errorMessage = data?.message || t("invalid_data_format", "Les données envoyées sont invalides");
          break;
        case 401:
          errorTitle = t("unauthorized", "Non autorisé");
          errorMessage = t("login_expired", "Votre session a expiré, veuillez vous reconnecter");
          setTimeout(() => {
            window.location.href = '/login';
          }, 3000);
          break;
        case 403:
          errorTitle = t("forbidden", "Accès refusé");
          errorMessage = t("no_permission", "Vous n'avez pas la permission d'effectuer cette action");
          break;
        case 404:
          errorTitle = t("not_found", "Ressource non trouvée");
          errorMessage = t("resource_not_found", "La ressource demandée n'existe pas");
          break;
        case 413:
          errorTitle = t("file_too_large", "Fichier trop volumineux");
          errorMessage = t("max_file_size_exceeded", "Le fichier dépasse la taille maximale autorisée (10MB)");
          break;
        case 415:
          errorTitle = t("unsupported_format", "Format non supporté");
          errorMessage = t("file_format_not_supported", "Le format du fichier n'est pas supporté");
          break;
        case 422:
          errorTitle = t("validation_error", "Erreur de validation");
          errorMessage = data?.errors 
            ? Object.values(data.errors).flat().join(', ')
            : t("data_validation_failed", "La validation des données a échoué");
          break;
        case 429:
          errorTitle = t("too_many_requests", "Trop de requêtes");
          errorMessage = t("rate_limit_exceeded", "Vous avez dépassé le nombre maximum de requêtes. Veuillez patienter.");
          errorType = "warning";
          break;
        case 500:
          errorTitle = t("server_error", "Erreur serveur");
          errorMessage = t("internal_server_error", "Une erreur interne est survenue sur le serveur");
          break;
        case 502:
        case 503:
        case 504:
          errorTitle = t("service_unavailable", "Service indisponible");
          errorMessage = t("server_temporarily_unavailable", "Le serveur est temporairement indisponible. Veuillez réessayer plus tard.");
          errorType = "warning";
          break;
        default:
          if (error.message === "Network Error") {
            errorTitle = t("network_error", "Erreur réseau");
            errorMessage = t("check_internet_connection", "Vérifiez votre connexion internet et réessayez");
            errorType = "warning";
          } else if (error.code === "ECONNABORTED") {
            errorTitle = t("timeout", "Timeout");
            errorMessage = t("request_timed_out", "La requête a expiré. Veuillez réessayer");
            errorType = "warning";
          }
      }
    }
    
    setApiError({
      show: true,
      title: errorTitle,
      message: errorMessage,
      type: errorType,
      retryAction: retryCallback
    });
    
    setTimeout(() => {
      setApiError(prev => ({ ...prev, show: false }));
    }, 8000);
  }, [t]);

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
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
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
    setFormErrors({});
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
    setFormErrors({});
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
    setFormErrors({});
    setShowModal(true);
  };

  const isUserAuthor = (offre) => {
    if (!currentUser) return false;
    if (currentUser.type === 'admin') return true;
    
    if (offre.membre_id && currentUser.id) {
      return offre.membre_id === currentUser.id;
    }
    
    return offre.membre === currentUser.nom_complete || 
           offre.membre === currentUser.nom || 
           offre.membre === currentUser.email;
  };

  // === VALIDATION DES CHAMPS ===
  const validateField = (name, value) => {
    const errors = {};
    
    switch (name) {
      case 'intitule':
        if (!value.trim()) {
          errors.intitule = t("title_required", "Le titre est requis");
        } else if (value.length > 200) {
          errors.intitule = t("title_too_long", "Le titre ne peut pas dépasser 200 caractères");
        }
        break;
        
      case 'description':
        if (!value.trim()) {
          errors.description = t("description_required", "La description est requise");
        } else if (value.length > 2000) {
          errors.description = t("description_too_long", "La description ne peut pas dépasser 2000 caractères");
        }
        break;
        
      case 'date_cloture':
        if (!value) {
          errors.date_cloture = t("closing_date_required", "La date de clôture est requise");
        } else if (new Date(value) < new Date()) {
          errors.date_cloture = t("closing_date_past", "La date de clôture ne peut pas être dans le passé");
        }
        break;
        
      case 'localisation':
        if (value && value.length > 100) {
          errors.localisation = t("location_too_long", "La localisation ne peut pas dépasser 100 caractères");
        }
        break;
        
      case 'salaire_remuneration':
        if (value && value.length > 50) {
          errors.salaire_remuneration = t("salary_too_long", "Le salaire ne peut pas dépasser 50 caractères");
        }
        break;
    }
    
    setFormErrors(prev => ({ ...prev, ...errors }));
    return errors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    // Validation en temps réel
    if (type !== 'file' && name !== 'est_urgent') {
      validateField(name, value);
    }
    
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

  // === COMPOSANTS DE BADGES ===
  const StatusBadge = ({ statut, size = "normal" }) => {
    const config = {
      "Validé": { color: "success", icon: FaCheckCircle, text: t("Validé", "Validé") },
      "En attente": { color: "warning", icon: FaClock, text: t("En attente", "En attente") },
      "Rejeté": { color: "danger", icon: FaExclamationTriangle, text: t("Rejeté", "Rejeté") },
      "Actif": { color: "primary", icon: FaBriefcase, text: t("Actif", "Actif") },
      "Clôturé": { color: "secondary", icon: FaCheckCircle, text: t("Clôturé", "Clôturé") }
    };
    
    const cfg = config[statut] || config["En attente"];
    const Icon = cfg.icon;
    const isSmall = size === "small";
    
    return (
      <Badge 
        bg={cfg.color} 
        className="d-flex align-items-center px-2 py-1" 
        style={{ 
          borderRadius: "10px", 
          fontSize: isSmall ? "0.65rem" : "0.7rem"
        }}
      >
        <Icon size={isSmall ? 10 : 12} className="me-1" />
        {cfg.text}
      </Badge>
    );
  };

  const TypeBadge = ({ type, size = "normal" }) => {
    const colors = {
      "CDI": "success",
      "CDD": "warning",
      "Stage": "info",
      "Freelance": "primary",
      "Alternance": "dark"
    };
    const isSmall = size === "small";
    
    return (
      <Badge 
        bg={colors[type] || "secondary"}
        className="px-2 py-1"
        style={{ 
          borderRadius: "8px", 
          fontSize: isSmall ? "0.6rem" : "0.65rem" 
        }}
      >
        {type}
      </Badge>
    );
  };

  const UserBadge = ({ offre, size = "normal" }) => {
    if (isUserAuthor(offre)) {
      const isSmall = size === "small";
      return (
        <Badge bg="info" className="ms-1 px-1 py-1" style={{ 
          fontSize: isSmall ? "0.6rem" : "0.65rem", 
          borderRadius: "6px" 
        }}>
          <FaUserTie size={isSmall ? 8 : 10} className="me-1" />
          {t("your_offer", "Votre offre")}
        </Badge>
      );
    }
    return null;
  };

  const UrgentBadge = ({ size = "normal" }) => {
    const isSmall = size === "small";
    return (
      <Badge bg="danger" className="ms-1 px-2 py-1" style={{ 
        fontSize: isSmall ? "0.6rem" : "0.65rem", 
        borderRadius: "8px" 
      }}>
        <FaExclamationTriangle size={isSmall ? 8 : 10} className="me-1" />
        {t("urgent", "Urgent")}
      </Badge>
    );
  };

  // === FONCTIONS API ===
  const fetchOffres = useCallback(async () => {
    setError(null);
    setLoading(true);
    
    try {
      const response = await axios.get(API_URL, {
        timeout: 15000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      const offresWithStats = await Promise.all(
        response.data.map(async (offre) => {
          if (offre.statut === "Validé") {
            try {
              const statsResponse = await axios.get(`${API_URL}/${offre.id}/stats`, {
                timeout: 10000
              });
              return {
                ...offre,
                stats: statsResponse.data.stats || {
                  total_views: 0,
                  total_reactions: 0,
                  reactions_by_type: {}
                }
              };
            } catch (statsError) {
              console.warn(`Erreur stats offre ${offre.id}:`, statsError);
              return {
                ...offre,
                stats: { total_views: 0, total_reactions: 0, reactions_by_type: {} }
              };
            }
          }
          return offre;
        })
      );

      let filteredOffres = offresWithStats;
      if (currentUser && currentUser.type === 'membre') {
        filteredOffres = offresWithStats.filter(offre => 
          offre.membre_id === currentUser.id || 
          offre.membre === currentUser.nom_complete ||
          offre.membre === currentUser.nom ||
          offre.membre === currentUser.email
        );
      }
      
      setOffres(filteredOffres);
      
    } catch (err) {
      handleApiError(err, "chargement des offres", fetchOffres);
      setError(t("error_load_offers", "Erreur lors du chargement des offres"));
    } finally {
      setLoading(false);
    }
  }, [currentUser, t, handleApiError]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    const requiredFields = {
      intitule: t("offer_title", "Titre de l'offre"),
      description: t("description", "Description"),
      date_cloture: t("closing_date", "Date de clôture")
    };
    
    const missingFields = Object.entries(requiredFields)
      .filter(([key]) => !nouvelleOffre[key]?.toString().trim())
      .map(([, label]) => label);
    
    if (missingFields.length > 0) {
      showAlert(
        `${t("missing_fields", "Champs obligatoires manquants")}: ${missingFields.join(', ')}`,
        "warning"
      );
      return;
    }
    
    // Validation de la date de clôture
    const today = new Date().setHours(0, 0, 0, 0);
    const closingDate = new Date(nouvelleOffre.date_cloture).setHours(0, 0, 0, 0);
    if (closingDate < today) {
      showAlert(t("invalid_closing_date", "La date de clôture ne peut pas être dans le passé"), "warning");
      return;
    }
    
    // Validation de l'ouverture vs clôture
    if (nouvelleOffre.date_ouverture) {
      const openingDate = new Date(nouvelleOffre.date_ouverture).setHours(0, 0, 0, 0);
      if (closingDate < openingDate) {
        showAlert(
          t("invalid_dates", "La date de clôture ne peut pas être antérieure à la date d'ouverture"),
          "warning"
        );
        return;
      }
    }
    
    // Validation de la description
    if (nouvelleOffre.description.length > 2000) {
      showAlert(
        t("description_too_long", "La description ne peut pas dépasser 2000 caractères"),
        "warning"
      );
      return;
    }
    
    if (!localStorage.getItem('token')) {
      showAlert(t("login_required", "Vous devez être connecté pour effectuer cette action"), "danger");
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
      return;
    }

    setIsSubmitting(true);
    setIsUploading(!!nouvelleOffre.fichier);
    setUploadProgress(0);

    const formData = new FormData();
    
    let finalStatut = nouvelleOffre.statut;
    if (!editMode && currentUser?.type !== 'admin') {
      finalStatut = "En attente";
    }

    const data = {
      intitule: nouvelleOffre.intitule.trim(),
      description: nouvelleOffre.description.trim(),
      date_cloture: nouvelleOffre.date_cloture,
      date_ouverture: nouvelleOffre.date_ouverture,
      membre: nouvelleOffre.membre.trim(),
      statut: finalStatut,
      type_contrat: nouvelleOffre.type_contrat,
      localisation: nouvelleOffre.localisation?.trim(),
      salaire_remuneration: nouvelleOffre.salaire_remuneration?.trim(),
      est_urgent: nouvelleOffre.est_urgent ? 1 : 0
    };

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value || "");
    });

    if (nouvelleOffre.fichier) {
      formData.append("fichier", nouvelleOffre.fichier);
    }

    try {
      const config = {
        headers: { 
          "Content-Type": "multipart/form-data",
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 30000,
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
      
      if (nouvelleOffre.fichier_preview) {
        URL.revokeObjectURL(nouvelleOffre.fichier_preview);
      }
      
      handleClose();
      fetchOffres();
    } catch (err) {
      handleApiError(err, editMode ? "modification de l'offre" : "création de l'offre", null);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const confirmDelete = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteTarget}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        },
        timeout: 10000
      });
      showAlert(t("success_delete_offer", "Offre supprimée avec succès"), "success");
      fetchOffres();
    } catch (err) {
      handleApiError(err, "suppression de l'offre", null);
    }
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  // === FILTRAGE ET TRI ===
  const filteredOffres = offres
    .filter(offre => {
      const matchesSearch = offre.intitule.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           offre.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           offre.membre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "all" || offre.statut === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "date_cloture":
          comparison = new Date(a.date_cloture) - new Date(b.date_cloture);
          break;
        case "intitule":
          comparison = a.intitule.localeCompare(b.intitule);
          break;
        case "statut":
          const statusOrder = { "Validé": 1, "En attente": 2, "Rejeté": 3, "Clôturé": 4 };
          comparison = (statusOrder[a.statut] || 5) - (statusOrder[b.statut] || 5);
          break;
        default:
          comparison = new Date(a.date_cloture) - new Date(b.date_cloture);
      }
      return sortOrder === "asc" ? comparison : -comparison;
    });

  // === PAGINATION ===
  const cardsPerPage = CARDS_PER_PAGE[displayMode][cardSize];
  const totalPages = Math.ceil(filteredOffres.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = Math.min(startIndex + cardsPerPage, filteredOffres.length);
  const currentOffres = filteredOffres.slice(startIndex, endIndex);

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
      setSortOrder("asc");
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
              Page {currentPage + 1} sur {totalPages} ({filteredOffres.length} offres)
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
        {currentOffres.map(offre => {
          const userIsAuthor = isUserAuthor(offre);
          const isUrgent = offre.est_urgent || 
            (offre.date_cloture && 
             new Date(offre.date_cloture).setHours(0,0,0,0) - new Date().setHours(0,0,0,0) <= 7 * 86400000);
          
          return (
            <div key={offre.id} className={CARD_SIZE_CLASSES[cardSize]}>
              <Card className="border-0 shadow-sm h-100 offer-card"
                style={{ 
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  borderLeft: `4px solid ${
                    isUrgent ? "#ff6b6b" : 
                    offre.statut === "Validé" ? "#28a745" : 
                    offre.statut === "En attente" ? "#ffc107" : 
                    offre.statut === "Rejeté" ? "#dc3545" : "#6c757d"
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
              >
                <Card.Body className="p-3 d-flex flex-column">
                  {/* Header avec badges */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="d-flex flex-wrap gap-1">
                      <StatusBadge statut={offre.statut} size={cardSize} />
                      {isUrgent && <UrgentBadge size={cardSize} />}
                    </div>
                    {offre.type_contrat && <TypeBadge type={offre.type_contrat} size={cardSize} />}
                  </div>

                  {/* Titre */}
                  <Card.Title 
                    className="fw-bold mb-2" 
                    style={{ 
                      fontSize: cardSize === "small" ? "0.85rem" : cardSize === "normal" ? "0.95rem" : "1rem", 
                      color: COLORS.dark,
                      lineHeight: "1.3",
                      height: cardSize === "small" ? "40px" : cardSize === "normal" ? "50px" : "60px",
                      overflow: "hidden"
                    }}
                  >
                    {offre.intitule}
                    {userIsAuthor && <UserBadge offre={offre} size={cardSize} />}
                  </Card.Title>

                  {/* Description réduite */}
                  <Card.Text 
                    className="text-muted small flex-grow-1" 
                    style={{ 
                      fontSize: cardSize === "small" ? "0.7rem" : cardSize === "normal" ? "0.8rem" : "0.85rem",
                      lineHeight: "1.4",
                      height: cardSize === "small" ? "40px" : cardSize === "normal" ? "60px" : "80px",
                      overflow: "hidden"
                    }}
                  >
                    {offre.description.length > (cardSize === "small" ? 60 : cardSize === "normal" ? 80 : 120) 
                      ? `${offre.description.substring(0, cardSize === "small" ? 60 : cardSize === "normal" ? 80 : 120)}...` 
                      : offre.description}
                  </Card.Text>

                  {/* Informations clés */}
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-1" style={{ fontSize: cardSize === "small" ? "0.7rem" : "0.8rem" }}>
                      <FaMapMarkerAlt className="me-2 text-danger" size={cardSize === "small" ? 10 : 12} />
                      <span className="text-truncate">{offre.localisation || t("not_specified", "Non spécifié")}</span>
                    </div>
                    <div className="d-flex align-items-center mb-1" style={{ fontSize: cardSize === "small" ? "0.7rem" : "0.8rem" }}>
                      <FaMoneyBillWave className="me-2 text-success" size={cardSize === "small" ? 10 : 12} />
                      <span className="fw-semibold text-truncate">{offre.salaire_remuneration || t("negotiable", "Négociable")}</span>
                    </div>
                    <div className="d-flex align-items-center" style={{ fontSize: cardSize === "small" ? "0.65rem" : "0.7rem" }}>
                      <FaUserTie className="me-2 text-primary" size={cardSize === "small" ? 10 : 12} />
                      <small className="text-truncate" style={{ maxWidth: "120px" }}>{offre.membre || "NC"}</small>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="d-flex justify-content-between text-muted mb-3"
                    style={{ fontSize: cardSize === "small" ? "0.65rem" : "0.7rem" }}>
                    <div>
                      <small>
                        <FaCalendarAlt className="me-1" />
                        {new Date(offre.date_cloture).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                      </small>
                    </div>
                    {isUrgent && (
                      <small className="fw-semibold text-danger">
                        <FaExclamationTriangle className="me-1" />
                        {t("closes_soon", "Clôture bientôt")}
                      </small>
                    )}
                  </div>

                  {/* Fichier joint réduit */}
                  {offre.fichier && (
                    <div className="mb-3">
                      <FilePreview 
                        filePath={offre.fichier} 
                        fileName={offre.fichier.split('/').pop()} 
                        size={cardSize}
                      />
                    </div>
                  )}

                  {/* Statistiques (uniquement pour offres validées) */}
                  {offre.statut === "Validé" && offre.stats && cardSize !== "small" && (
                    <div className="border-top pt-3 mt-3">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center text-muted">
                            <FaEye className="me-1" size={cardSize === "normal" ? 12 : 14} />
                            <small className="fw-semibold">{offre.stats.total_views || 0}</small>
                          </div>
                          
                          {offre.stats.total_reactions > 0 && (
                            <div className="d-flex align-items-center gap-1">
                              <div className="d-flex align-items-center text-primary">
                                <i className="fas fa-thumbs-up me-1"></i>
                                <small className="fw-semibold">{offre.stats.reactions_by_type.like || 0}</small>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Message pour offres en attente */}
                  {offre.statut === "En attente" && cardSize !== "small" && (
                    <Alert variant="warning" className="py-2 mb-3" style={{ 
                      borderRadius: "6px",
                      fontSize: cardSize === "normal" ? "0.75rem" : "0.8rem",
                      margin: 0
                    }}>
                      <FaClock className="me-2" />
                      <small>{t("pending_validation", "En attente de validation")}</small>
                    </Alert>
                  )}

                  {/* Actions */}
                  <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                    <div className="d-flex align-items-center">
                      {userIsAuthor ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`edit-tooltip-${offre.id}`}>Modifier</Tooltip>}
                        >
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleShowEdit(offre)}
                            className="rounded-circle"
                            style={{ 
                              width: cardSize === "small" ? '28px' : '32px', 
                              height: cardSize === "small" ? '28px' : '32px',
                              padding: 0
                            }}
                          >
                            <FaEdit size={cardSize === "small" ? 12 : 14} />
                          </Button>
                        </OverlayTrigger>
                      ) : (
                        <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: "0.7rem" }}>
                          <FaEye className="me-1" />
                          {t("read_only", "Lecture seule")}
                        </Badge>
                      )}
                    </div>
                    <div className="d-flex gap-1">
                      {userIsAuthor && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`delete-tooltip-${offre.id}`}>Supprimer</Tooltip>}
                        >
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => confirmDelete(offre.id)}
                            className="rounded-circle"
                            style={{ 
                              width: cardSize === "small" ? '28px' : '32px', 
                              height: cardSize === "small" ? '28px' : '32px',
                              padding: 0
                            }}
                          >
                            <FaTrash size={cardSize === "small" ? 12 : 14} />
                          </Button>
                        </OverlayTrigger>
                      )}
                    </div>
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
        <h6 className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
          {filteredOffres.length} offre(s) trouvée(s)
        </h6>
      </div>
      
      <ListGroup variant="flush">
        {currentOffres.map((offre) => {
          const userIsAuthor = isUserAuthor(offre);
          const isUrgent = offre.est_urgent || 
            (offre.date_cloture && 
             new Date(offre.date_cloture).setHours(0,0,0,0) - new Date().setHours(0,0,0,0) <= 7 * 86400000);

          return (
            <ListGroup.Item 
              key={offre.id}
              className="mb-3 border-0 shadow-sm rounded-3 list-view-item"
              style={{ 
                background: 'white',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                borderLeft: `4px solid ${
                  isUrgent ? "#ff6b6b" : 
                  offre.statut === "Validé" ? "#28a745" : 
                  offre.statut === "En attente" ? "#ffc107" : 
                  offre.statut === "Rejeté" ? "#dc3545" : "#6c757d"
                }`
              }}
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
                {/* Colonne gauche : Statut et badges */}
                <div className="flex-shrink-0 me-3" style={{ width: '120px' }}>
                  <div className="mb-2">
                    <StatusBadge statut={offre.statut} />
                  </div>
                  <div className="d-flex flex-wrap gap-1">
                    {isUrgent && <UrgentBadge />}
                    {offre.type_contrat && <TypeBadge type={offre.type_contrat} />}
                  </div>
                </div>

                {/* Colonne centrale : Contenu */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{offre.intitule}</h6>
                      {userIsAuthor && <UserBadge offre={offre} />}
                    </div>
                    <div className="text-muted small text-end">
                      <div>
                        <FaCalendarAlt className="me-1" />
                        {new Date(offre.date_cloture).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    <FaMapMarkerAlt className="me-2" size={12} />
                    <span className="me-4">{offre.localisation || t("not_specified", "Non spécifié")}</span>
                    <FaMoneyBillWave className="me-2" size={12} />
                    <span>{offre.salaire_remuneration || t("negotiable", "Négociable")}</span>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    {offre.description.length > 100 ? `${offre.description.substring(0, 100)}...` : offre.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex gap-3 text-muted small">
                      <span>
                        <FaUserTie className="me-1" size={12} />
                        {offre.membre}
                      </span>
                      {offre.fichier && (
                        <span 
                          className="text-primary" 
                          style={{ cursor: 'pointer' }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FaFileAlt className="me-1" size={12} />
                          {t("attached_file", "Fichier joint")}
                        </span>
                      )}
                      {offre.statut === "Validé" && offre.stats && (
                        <>
                          <span>
                            <FaEye className="me-1" size={12} />
                            {offre.stats.total_views || 0} {t("views", "vues")}
                          </span>
                          {offre.stats.total_reactions > 0 && (
                            <span>
                              <i className="fas fa-thumbs-up me-1"></i>
                              {offre.stats.total_reactions} {t("reactions", "réactions")}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                    
                    <div className="d-flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {userIsAuthor && (
                        <>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`edit-list-tooltip-${offre.id}`}>Modifier</Tooltip>}
                          >
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleShowEdit(offre)}
                              style={{ borderRadius: "6px", padding: "4px 8px" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`delete-list-tooltip-${offre.id}`}>Supprimer</Tooltip>}
                          >
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => confirmDelete(offre.id)}
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

  // === COMPOSANTS D'ERREUR ===
  const ErrorModal = () => {
    if (!apiError.show) return null;
    
    const getIcon = () => {
      switch (apiError.type) {
        case "warning": return <FaExclamationTriangle className="text-warning" size={48} />;
        case "info": return <FaInfoCircle className="text-info" size={48} />;
        default: return <FaExclamationTriangle className="text-danger" size={48} />;
      }
    };
    
    const getVariant = () => {
      switch (apiError.type) {
        case "warning": return "warning";
        case "info": return "info";
        default: return "danger";
      }
    };
    
    return (
      <Modal 
        show={apiError.show} 
        onHide={() => setApiError(prev => ({ ...prev, show: false }))} 
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className={`bg-${getVariant()} bg-opacity-10`}>
          <Modal.Title className={`text-${getVariant()} fw-bold`}>
            {getIcon()}
            <span className="ms-2">{apiError.title}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="mb-4">{apiError.message}</p>
          
          <div className="mt-4">
            <h6 className="fw-semibold mb-3">{t("troubleshooting", "Dépannage")}:</h6>
            <ul className="list-unstyled text-muted">
              <li className="mb-2">• {t("check_internet", "Vérifiez votre connexion Internet")}</li>
              <li className="mb-2">• {t("verify_permissions", "Vérifiez vos permissions")}</li>
              <li className="mb-2">• {t("try_again_later", "Réessayez dans quelques minutes")}</li>
              <li>• {t("contact_support", "Contactez le support si le problème persiste")}</li>
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer className="border-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setApiError(prev => ({ ...prev, show: false }))}
            className="rounded-pill px-4"
          >
            {t("close", "Fermer")}
          </Button>
          {apiError.retryAction && (
            <Button 
              variant={`outline-${getVariant()}`} 
              onClick={() => {
                setApiError(prev => ({ ...prev, show: false }));
                apiError.retryAction();
              }}
              className="rounded-pill px-4"
            >
              {t("retry", "Réessayer")}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    );
  };

  const GlobalErrorAlert = () => {
    if (!error || apiError.show) return null;
    
    return (
      <Alert 
        variant="danger" 
        dismissible 
        onClose={() => setError(null)}
        className="position-fixed bottom-0 end-0 m-3 shadow-lg"
        style={{ 
          zIndex: 9998, 
          maxWidth: '400px',
          borderRadius: '15px'
        }}
      >
        <div className="d-flex align-items-center">
          <FaExclamationTriangle className="me-3 flex-shrink-0" size={24} />
          <div className="flex-grow-1">
            <h6 className="fw-bold mb-1">{t("loading_error", "Erreur de chargement")}</h6>
            <p className="mb-2 small">{error}</p>
            <Button 
              variant="outline-danger" 
              size="sm" 
              onClick={fetchOffres}
              className="rounded-pill"
            >
              <FaSync className="me-1" />
              {t("retry", "Réessayer")}
            </Button>
          </div>
        </div>
      </Alert>
    );
  };

  // === EFFECTS ===
  useEffect(() => {
    if (currentUser) {
      fetchOffres();
    }
  }, [currentUser, fetchOffres]);

  useEffect(() => {
    return () => {
      if (nouvelleOffre.fichier_preview) {
        URL.revokeObjectURL(nouvelleOffre.fichier_preview);
      }
    };
  }, [nouvelleOffre.fichier_preview]);

  // === STATISTIQUES ===
  const statsCards = [
    {
      icon: FaBriefcase,
      value: offres.length,
      label: t("total_offers", "Total des offres"),
      color: COLORS.primary,
      onClick: () => setStatusFilter("all")
    },
    {
      icon: FaCheckCircle,
      value: offres.filter(o => o.statut === "Validé").length,
      label: t("validated_offers", "Offres validées"),
      color: COLORS.success,
      onClick: () => setStatusFilter("Validé")
    },
    {
      icon: FaClock,
      value: offres.filter(o => o.statut === "En attente").length,
      label: t("pending_offers", "Offres en attente"),
      color: COLORS.warning,
      onClick: () => setStatusFilter("En attente")
    },
    {
      icon: FaExclamationTriangle,
      value: offres.filter(o => o.est_urgent).length,
      label: t("urgent_offers", "Offres urgentes"),
      color: COLORS.danger,
      onClick: () => {}
    },
    {
      icon: FaEye,
      value: offres.reduce((total, o) => total + (o.stats?.total_views || 0), 0),
      label: t("total_views", "Total des vues"),
      color: COLORS.info,
      onClick: () => {}
    },
    {
      icon: FaHeart,
      value: offres.reduce((total, o) => total + (o.stats?.total_reactions || 0), 0),
      label: t("total_reactions", "Total des réactions"),
      color: COLORS.secondary,
      onClick: () => {}
    }
  ];

  // === RENDU PRINCIPAL ===
  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />
      
      {/* Composants d'erreur */}
      <ErrorModal />
      <GlobalErrorAlert />
      
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
              {currentUser?.type === 'admin' 
                ? t("offer_management_title", "Gestion des appels d'offres") 
                : t("my_offers", "Mes appels d'offres")}
            </h1>
            <p style={{ color: COLORS.gray, fontSize: "0.9rem", margin: 0 }}>
              {currentUser?.type === 'admin' 
                ? t("offer_management_subtitle", "Gérez toutes les offres du système") 
                : t("manage_your_offers", "Gérez vos appels d'offres et postulez")}
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
                    placeholder={t("search_offers_placeholder", "Rechercher des offres...")}
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
                  <option value="all">{t("all_status", "Tous les statuts")}</option>
                  <option value="Validé">{t("Validé", "Validé")}</option>
                  <option value="En attente">{t("En attente", "En attente")}</option>
                  <option value="Rejeté">{t("Rejeté", "Rejeté")}</option>
                  <option value="Clôturé">{t("Clôturé", "Clôturé")}</option>
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
                      onClick={() => handleSortChange("date_cloture")}
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
                      onClick={fetchOffres}
                      style={{ borderRadius: "8px" }}
                    >
                      <FaSync size={14} />
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
              <StatsCard {...stat} />
            </Col>
          ))}
        </Row>

        {/* Info pour les membres */}
        {currentUser?.type === 'membre' && offres.some(o => o.statut === "En attente") && (
          <Alert variant="info" className="mb-4" style={{ borderRadius: "10px", fontSize: "0.85rem" }}>
            <FaInfoCircle className="me-2" />
            <strong>{t("information", "Information")}:</strong> {t("pending_offers_info", "Vos offres sont en attente de validation par l'administrateur.")}
          </Alert>
        )}

        {/* Liste des offres */}
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
            <p className="mt-3 text-muted">{t("loading_offers", "Chargement des offres...")}</p>
          </div>
        ) : filteredOffres.length === 0 ? (
          <Card className="text-center border-0 shadow-sm p-5" style={{ borderRadius: "15px", minHeight: "300px" }}>
            <div className="d-flex flex-column justify-content-center align-items-center h-100">
              <FaBriefcase size={60} className="text-muted mb-3" />
              <h5 className="text-dark mb-3">{t("no_offers_found", "Aucune offre trouvée")}</h5>
              <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
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
                  border: "none",
                  fontSize: "0.9rem"
                }}
              >
                <FaPlusCircle className="me-2" />
                {t("create_offer", "Créer une offre")}
              </Button>
            </div>
          </Card>
        ) : (
          <>
            {/* En-tête avec compteur */}
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h6 className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                  Affichage {startIndex + 1} à {endIndex} sur {filteredOffres.length} offres
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
      <Modal show={showModal} onHide={handleClose} centered size="lg">
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
            {editMode 
              ? t("edit_offer_modal", "Modifier l'appel d'offres") 
              : t("add_offer_modal", "Nouvel appel d'offres")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {/* Erreurs de formulaire */}
          {Object.keys(formErrors).length > 0 && (
            <Alert variant="danger" className="mb-4" style={{ borderRadius: "10px", fontSize: "0.9rem" }}>
              <FaExclamationCircle className="me-2" />
              <strong>{t("form_errors", "Erreurs dans le formulaire")}:</strong>
              <ul className="mb-0 mt-2" style={{ fontSize: "0.85rem" }}>
                {Object.entries(formErrors).map(([field, error]) => (
                  <li key={field}>{error}</li>
                ))}
              </ul>
            </Alert>
          )}

          {/* Info pour nouvelles offres */}
          {!editMode && currentUser?.type !== 'admin' && (
            <Alert variant="info" className="mb-4" style={{ borderRadius: "10px", fontSize: "0.9rem" }}>
              <FaInfoCircle className="me-2" />
              {t("offer_pending_info", "Votre offre sera soumise pour validation par l'administrateur.")}
            </Alert>
          )}

          {/* Barre de progression pour l'upload */}
          {isUploading && (
            <div className="mb-4">
              <div className="d-flex justify-content-between mb-2">
                <small className="fw-semibold" style={{ fontSize: "0.9rem" }}>
                  {t("uploading_file", "Téléchargement du fichier")}
                </small>
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
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                    <FaBriefcase className="me-2" style={{ color: COLORS.primary }} />
                    {t("offer_title", "Titre de l'offre")} *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="intitule"
                    value={nouvelleOffre.intitule}
                    onChange={handleChange}
                    required
                    isInvalid={!!formErrors.intitule}
                    style={{ 
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                      borderColor: formErrors.intitule ? '#dc3545' : (nouvelleOffre.intitule ? '#28a745' : '#e0e6ef')
                    }}
                    placeholder={t("offer_title_placeholder", "Ex: Développeur Full Stack")}
                    maxLength={200}
                  />
                  {formErrors.intitule && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.intitule}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                    <FaTag className="me-2" style={{ color: COLORS.success }} />
                    {t("contract_type", "Type de contrat")}
                  </Form.Label>
                  <Form.Select
                    name="type_contrat"
                    value={nouvelleOffre.type_contrat}
                    onChange={handleChange}
                    style={{
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                      border: "1.5px solid #e0e6ef"
                    }}
                  >
                    {["CDI", "CDD", "Stage", "Freelance", "Alternance"].map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                    <FaUserTie className="me-2" style={{ color: COLORS.info }} />
                    {t("issuing_member", "Membre émetteur")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="membre"
                    value={nouvelleOffre.membre}
                    onChange={handleChange}
                    style={{
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                      border: "1.5px solid #e0e6ef"
                    }}
                    placeholder={t("issuing_member_placeholder", "Nom du membre")}
                    readOnly={currentUser?.type === 'membre'}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                    <FaMapMarkerAlt className="me-2" style={{ color: COLORS.danger }} />
                    {t("location", "Localisation")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="localisation"
                    value={nouvelleOffre.localisation}
                    onChange={handleChange}
                    isInvalid={!!formErrors.localisation}
                    style={{ 
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                      borderColor: formErrors.localisation ? '#dc3545' : '#e0e6ef'
                    }}
                    placeholder={t("select_location", "Ex: Paris, France")}
                    maxLength={100}
                  />
                  {formErrors.localisation && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.localisation}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                    <FaMoneyBillWave className="me-2" style={{ color: COLORS.success }} />
                    {t("salary", "Salaire/Rémunération")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="salaire_remuneration"
                    value={nouvelleOffre.salaire_remuneration}
                    onChange={handleChange}
                    isInvalid={!!formErrors.salaire_remuneration}
                    style={{ 
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                      borderColor: formErrors.salaire_remuneration ? '#dc3545' : '#e0e6ef'
                    }}
                    placeholder={t("salary_placeholder", "Ex: 45K€ - 55K€ annuels")}
                    maxLength={50}
                  />
                  {formErrors.salaire_remuneration && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.salaire_remuneration}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                    <FaFileUpload className="me-2" style={{ color: COLORS.warning }} />
                    {t("file_label", "Fichier joint")}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="fichier"
                    onChange={handleChange}
                    style={{
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                      border: "1.5px solid #e0e6ef"
                    }}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.7z,.jpg,.jpeg,.png,.gif,.bmp,.webp,.svg"
                  />
                  <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
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
                          width: "40px", 
                          height: "40px", 
                          objectFit: "cover",
                          borderRadius: "6px",
                          marginRight: "10px"
                        }}
                      />
                    ) : (
                      <FaFileAlt className="me-3" size={20} style={{ color: COLORS.primary }} />
                    )}
                    <div>
                      <div className="fw-semibold" style={{ fontSize: "0.9rem" }}>{nouvelleOffre.fichier.name}</div>
                      <small className="text-muted" style={{ fontSize: "0.8rem" }}>
                        {(nouvelleOffre.fichier.size / 1024 / 1024).toFixed(2)} MB • {nouvelleOffre.fichier.type}
                      </small>
                    </div>
                  </div>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={removeFile}
                    className="rounded-circle"
                    style={{ width: "28px", height: "28px", padding: 0 }}
                  >
                    <FaTimes size={14} />
                  </Button>
                </div>
              </Alert>
            )}

            {/* Fichier actuel (en mode édition) */}
            {editMode && currentOffre?.fichier && !nouvelleOffre.fichier && (
              <Alert variant="info" className="mt-3 p-3" style={{ borderRadius: "10px", fontSize: "0.9rem" }}>
                <div className="d-flex align-items-center">
                  <FaFileAlt className="me-3" size={20} />
                  <div>
                    <div className="fw-semibold">{t("current_file", "Fichier actuel")}:</div>
                    <small style={{ fontSize: "0.8rem" }}>{currentOffre.fichier.split('/').pop()}</small>
                  </div>
                </div>
              </Alert>
            )}

            <Row className="g-3 mt-2">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                    <FaCalendarAlt className="me-2" style={{ color: COLORS.info }} />
                    {t("opening_date", "Date d'ouverture")}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="date_ouverture"
                    value={nouvelleOffre.date_ouverture}
                    onChange={handleChange}
                    style={{
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                      border: "1.5px solid #e0e6ef"
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                    <FaCalendarAlt className="me-2" style={{ color: COLORS.danger }} />
                    {t("closing_date", "Date de clôture")} *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="date_cloture"
                    value={nouvelleOffre.date_cloture}
                    onChange={handleChange}
                    required
                    isInvalid={!!formErrors.date_cloture}
                    style={{ 
                      borderRadius: "10px",
                      padding: "0.6rem 1rem",
                      fontSize: "0.9rem",
                      borderColor: formErrors.date_cloture ? '#dc3545' : (nouvelleOffre.date_cloture && 
                        new Date(nouvelleOffre.date_cloture) >= new Date(nouvelleOffre.date_ouverture || new Date()) 
                        ? '#28a745' 
                        : '#e0e6ef')
                    }}
                    min={nouvelleOffre.date_ouverture || new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.date_cloture && (
                    <Form.Control.Feedback type="invalid">
                      {formErrors.date_cloture}
                    </Form.Control.Feedback>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-3">
              <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
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
                isInvalid={!!formErrors.description}
                style={{ 
                  borderRadius: "10px",
                  padding: "0.6rem 1rem",
                  fontSize: "0.9rem",
                  resize: "none",
                  borderColor: formErrors.description ? '#dc3545' : (nouvelleOffre.description ? '#28a745' : '#e0e6ef')
                }}
                placeholder={t("description_placeholder", "Décrivez en détail l'appel d'offres...")}
                maxLength={2000}
              />
              {formErrors.description && (
                <Form.Control.Feedback type="invalid">
                  {formErrors.description}
                </Form.Control.Feedback>
              )}
              <Form.Text className="text-muted d-block text-end mt-2" style={{ fontSize: "0.8rem" }}>
                {nouvelleOffre.description.length}/2000 {t("characters", "caractères")}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mt-3">
              <Form.Check
                type="checkbox"
                name="est_urgent"
                label={<span className="fw-semibold" style={{ fontSize: "0.9rem" }}>{t("mark_as_urgent", "Marquer comme urgent")}</span>}
                checked={nouvelleOffre.est_urgent}
                onChange={handleChange}
              />
              <Form.Text className="text-muted" style={{ fontSize: "0.8rem" }}>
                {t("urgent_note", "Les offres urgentes seront mises en avant et marquées d'un badge spécial.")}
              </Form.Text>
            </Form.Group>

            {/* Statut (admin seulement) */}
            {currentUser?.type === 'admin' && (
              <Form.Group className="mt-3">
                <Form.Label className="fw-semibold mb-2" style={{ fontSize: "0.9rem" }}>
                  <FaCheckCircle className="me-2" style={{ color: COLORS.success }} />
                  {t("status", "Statut")}
                </Form.Label>
                <Form.Select
                  name="statut"
                  value={nouvelleOffre.statut}
                  onChange={handleChange}
                  style={{
                    borderRadius: "10px",
                    padding: "0.6rem 1rem",
                    fontSize: "0.9rem",
                    border: "1.5px solid #e0e6ef"
                  }}
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

        <Modal.Footer className="border-0 p-3">
          <Button 
            variant="outline-secondary" 
            onClick={handleClose} 
            className="rounded-pill px-4 py-2" 
            disabled={isSubmitting}
            style={{ fontSize: "0.9rem", minWidth: "100px" }}
          >
            <FaTimes className="me-2" />
            {t("cancel_button", "Annuler")}
          </Button>
          <Button
            type="submit"
            variant="primary"
            onClick={handleSave}
            disabled={isSubmitting || Object.keys(formErrors).length > 0}
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
            {t("confirm_delete", "Confirmation de suppression")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4 text-center">
          <div className="mb-4">
            <FaExclamationTriangle size={48} className="text-danger mb-3" />
            <h5 className="fw-bold mb-2">{t("delete_offer_title", "Supprimer cette offre ?")}</h5>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              {t("delete_offer_message", "Cette action est irréversible. Toutes les données associées seront définitivement supprimées.")}
            </p>
            <p className="text-danger small mt-2">
              <strong>{t("irreversible_action", "Cette action ne peut pas être annulée")}</strong>
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
            {t("cancel_button", "Annuler")}
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
                {t("deleting", "Suppression...")}
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                {t("delete", "Supprimer")}
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
        
        .offer-card {
          transition: all 0.3s ease;
        }
        
        .offer-card:hover {
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

export default AppelOffreMembre;