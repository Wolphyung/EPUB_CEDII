import React, { useState, useEffect, useRef } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { 
  Modal, 
  Button, 
  Form, 
  Card, 
  Row, 
  Col, 
  Badge, 
  Alert, 
  InputGroup,
  ListGroup,
  ButtonGroup,
  Tooltip,
  OverlayTrigger
} from "react-bootstrap";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const API_URL = "http://127.0.0.1:8000/api";

// Composant FilePreviewCard
const FilePreviewCard = ({ fichier, fileName, onDownload }) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  if (!fichier) return null;

  const getFileUrl = (fichier) => {
    if (!fichier) return null;
    
    if (typeof fichier === 'string') {
      if (fichier.startsWith('http')) return fichier;
      return `${API_URL.replace('/api', '')}/storage/${fichier}`;
    }
    
    if (fichier instanceof File) {
      return URL.createObjectURL(fichier);
    }
    
    return null;
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'fa-file-pdf';
      case 'doc': case 'docx': return 'fa-file-word';
      case 'xls': case 'xlsx': return 'fa-file-excel';
      case 'ppt': case 'pptx': return 'fa-file-powerpoint';
      case 'jpg': case 'jpeg': case 'png': case 'gif': case 'bmp': return 'fa-file-image';
      case 'mp4': case 'avi': case 'mov': return 'fa-file-video';
      case 'mp3': case 'wav': return 'fa-file-audio';
      case 'zip': case 'rar': return 'fa-file-archive';
      default: return 'fa-file';
    }
  };

  const getFileBadgeVariant = (fileName) => {
    if (!fileName) return 'secondary';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'danger';
      case 'doc': case 'docx': return 'primary';
      case 'xls': case 'xlsx': return 'success';
      case 'jpg': case 'jpeg': case 'png': case 'gif': return 'info';
      default: return 'secondary';
    }
  };

  const fileUrl = getFileUrl(fichier);
  const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);

  return (
    <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex align-items-center">
          <i className={`fas ${getFileIcon(fileName)} text-${getFileBadgeVariant(fileName)} me-2`}></i>
          <span className="small fw-semibold">{t('attached_document')}:</span>
        </div>
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{t('download')}</Tooltip>}
        >
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => onDownload(fichier, fileName)}
            className="d-flex align-items-center download-btn"
            style={{ borderRadius: "6px", fontSize: "0.7rem" }}
          >
            <i className="fas fa-download me-1"></i>
            {t('download')}
          </Button>
        </OverlayTrigger>
      </div>
      <p className="small text-muted mb-2">{fileName}</p>
      
      {/* Aperçu du fichier existant */}
      {fileUrl && (
        <div className="text-center">
          {isImage && !imageError ? (
            <img 
              src={fileUrl} 
              alt={t('preview')}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '150px', 
                objectFit: 'contain',
                borderRadius: '6px',
                border: '1px solid #dee2e6'
              }}
              onError={() => setImageError(true)}
              onLoad={() => setImageError(false)}
            />
          ) : (
            <div className="py-2">
              <i className={`fas ${getFileIcon(fileName)} fa-3x text-${getFileBadgeVariant(fileName)} mb-2`}></i>
              <p className="small text-muted mb-0">
                {isImage && imageError ? t('image_not_available') : t('click_to_download')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Composant Pagination amélioré
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const { t } = useTranslation();
  
  const pages = [];
  const maxVisible = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
  
  if (endPage - startPage + 1 < maxVisible) {
    startPage = Math.max(1, endPage - maxVisible + 1);
  }
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  const handleClick = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  return (
    <nav aria-label="Event pagination" className="mt-4">
      <ul className="pagination justify-content-center">
        {/* Flèche gauche */}
        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('previous_page')}</Tooltip>}
          >
            <button
              className="page-link page-btn"
              onClick={() => handleClick(currentPage - 1)}
              disabled={currentPage === 1}
              style={{ 
                borderRadius: '8px',
                margin: '0 2px'
              }}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
          </OverlayTrigger>
        </li>
        
        {/* Première page */}
        {startPage > 1 && (
          <>
            <li className="page-item">
              <button
                className="page-link page-btn"
                onClick={() => handleClick(1)}
                style={{ 
                  borderRadius: '8px',
                  margin: '0 2px'
                }}
              >
                1
              </button>
            </li>
            {startPage > 2 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
          </>
        )}
        
        {/* Pages numérotées */}
        {pages.map(page => (
          <li 
            key={page} 
            className={`page-item ${currentPage === page ? 'active' : ''}`}
          >
            <button
              className="page-link page-btn"
              onClick={() => handleClick(page)}
              style={{ 
                borderRadius: '8px',
                margin: '0 2px',
                fontWeight: currentPage === page ? 'bold' : 'normal',
                transform: currentPage === page ? 'scale(1.1)' : 'scale(1)',
                zIndex: currentPage === page ? 3 : 1,
                boxShadow: currentPage === page ? '0 4px 8px rgba(0, 0, 0, 0.1)' : 'none'
              }}
            >
              {page}
              {currentPage === page && (
                <span className="visually-hidden">{t('current_page')}</span>
              )}
            </button>
          </li>
        ))}
        
        {/* Dernière page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <li className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            )}
            <li className="page-item">
              <button
                className="page-link page-btn"
                onClick={() => handleClick(totalPages)}
                style={{ 
                  borderRadius: '8px',
                  margin: '0 2px'
                }}
              >
                {totalPages}
              </button>
            </li>
          </>
        )}
        
        {/* Flèche droite */}
        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <OverlayTrigger
            placement="top"
            overlay={<Tooltip>{t('next_page')}</Tooltip>}
          >
            <button
              className="page-link page-btn"
              onClick={() => handleClick(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{ 
                borderRadius: '8px',
                margin: '0 2px'
              }}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </OverlayTrigger>
        </li>
      </ul>
      
      {/* Indicateur de page active */}
      <div className="text-center mt-2">
        <small className="text-muted">
          {t('page')} {currentPage} {t('of')} {totalPages}
          <span className="ms-3">
            <i className="fas fa-circle text-primary ms-1" style={{ 
              fontSize: '0.5rem',
              opacity: currentPage === 1 ? 1 : 0.3 
            }}></i>
            <i className="fas fa-circle text-primary ms-1" style={{ 
              fontSize: '0.5rem',
              opacity: currentPage === 2 ? 1 : 0.3 
            }}></i>
            <i className="fas fa-circle text-primary ms-1" style={{ 
              fontSize: '0.5rem',
              opacity: currentPage === 3 ? 1 : 0.3 
            }}></i>
          </span>
        </small>
      </div>
    </nav>
  );
};

// Composant principal Evenement avec toutes les fonctionnalités de Publication
const Evenement = () => {
  const { t } = useTranslation();
  
  const [evenements, setEvenements] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // "grid" ou "list"
  const [currentPage, setCurrentPage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Référence pour le conteneur de défilement
  const scrollContainerRef = useRef(null);
  const modalRef = useRef(null);

  // Types d'événements avec traductions
  const eventTypes = [
    t('presentiel'), 
    t('online'), 
    t('hybrid')
  ];

  // Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // FORMAT DATE POUR <input type="datetime-local">
  const formatDateTimeForInput = (dateTimeString) => {
    if (!dateTimeString) return "";
    try {
      const date = new Date(dateTimeString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().slice(0, 16);
    } catch (e) {
      return dateTimeString.replace(' ', 'T').slice(0, 16) || "";
    }
  };

  // Vérifier si une date est valide et pas dans le passé
  const isValidDate = (dateTimeString) => {
    if (!dateTimeString) return false;
    try {
      const selectedDate = new Date(dateTimeString);
      const now = new Date();
      return selectedDate >= now;
    } catch (e) {
      return false;
    }
  };

  const [newEvent, setNewEvent] = useState({
    titre: "",
    description: "",
    date_heure: getTodayDate() + "T00:00",
    lieu: "",
    type: "Présentiel",
    statut: "Validé",
    fichier: null,
    type_fichier: "image",
    auteur: "Admin"
  });

  useEffect(() => {
    loadEvenements();
  }, []);

  useEffect(() => {
    return () => {
      if (previewFile?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(previewFile.url);
      }
      evenements.forEach(event => {
        if (event.fichier_url?.startsWith('blob:')) {
          URL.revokeObjectURL(event.fichier_url);
        }
      });
    };
  }, [previewFile, evenements]);

  // CHARGEMENT SÉCURISÉ DES ÉVÉNEMENTS
  const loadEvenements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/evenements`);

      // Assurez-vous que nous avons un tableau
      const events = Array.isArray(res.data)
        ? res.data
        : (res.data?.data || []);

      const validEvents = events
        .filter(event => event && event.id && typeof event.id === 'number')
        .map(event => ({
          ...event,
          id: event.id,
          titre: event.titre || "",
          description: event.description || "",
          date_heure: event.date_heure || "",
          lieu: event.lieu || "",
          type: event.type || "Présentiel",
          statut: event.statut || "Validé",
          type_fichier: event.type_fichier || "image",
          fichier_url: event.fichier_url || event.fichier || null,
          nom_fichier_original: event.nom_fichier_original || event.fichier?.split('/').pop() || null,
          auteur: event.auteur || "Admin",
          total_reactions: event.total_reactions || 0,
          vues: event.vues || 0,
          commentaires_count: event.commentaires_count || 0,
          stats: event.stats || {
            total_reactions: 0,
            total_views: 0,
            reactions_by_type: {}
          }
        }));

      setEvenements(validEvents);
    } catch (err) {
      console.error("Erreur chargement événements:", err);
      showNotification("error", t('error_load_events'));
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: "", message: "" }), 4000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('date_not_defined');
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "date_heure") {
      if (value && !isValidDate(value)) {
        showNotification("error", t('date_cannot_be_in_past'));
        return;
      }
      setNewEvent({ ...newEvent, [name]: value });
    } else if (name === "fichier") {
      const file = files[0];
      setNewEvent({ ...newEvent, fichier: file });

      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({ url: fileURL, name: file.name, type: file.type });
        const fileType = getFileTypeFromFile(file);
        setNewEvent(prev => ({ ...prev, type_fichier: fileType }));
      } else {
        setPreviewFile(null);
      }
    } else {
      setNewEvent({ ...newEvent, [name]: value });
    }
  };

  const handleFileTypeChange = (type) => {
    setNewEvent({ ...newEvent, type_fichier: type, fichier: null });
    setPreviewFile(null);
  };

  const getFileTypeFromFile = (file) => {
    if (!file) return 'image';
    const fileType = file.type;
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
  };

  // Fonction avec animation pour ajouter un événement
  const handleAddEvent = async () => {
    if (!isValidDate(newEvent.date_heure)) {
      showNotification("error", t('date_cannot_be_in_past'));
      return;
    }

    if (!newEvent.titre || !newEvent.description || !newEvent.lieu) {
      showNotification("error", t('fill_all_fields'));
      return;
    }

    try {
      setIsAdding(true);
      
      // Animation du bouton
      const publishBtn = document.querySelector('.add-event-btn');
      if (publishBtn) {
        publishBtn.classList.add('clicked');
        setTimeout(() => {
          publishBtn.classList.remove('clicked');
        }, 300);
      }

      const formData = new FormData();
      formData.append("titre", newEvent.titre);
      formData.append("description", newEvent.description);
      formData.append("date_heure", newEvent.date_heure.replace('T', ' ') + ':00');
      formData.append("lieu", newEvent.lieu);
      formData.append("type", newEvent.type);
      formData.append("statut", "Validé");
      formData.append("auteur", newEvent.auteur);
      formData.append("type_fichier", newEvent.type_fichier);

      if (newEvent.fichier) formData.append("fichier", newEvent.fichier);

      const res = await axios.post(`${API_URL}/evenements`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const eventData = res.data?.data || res.data;
      const addedEvent = {
        ...eventData,
        titre: newEvent.titre,
        description: newEvent.description,
        type: newEvent.type,
        lieu: newEvent.lieu,
        statut: "Validé",
        auteur: "Admin",
        date_heure: newEvent.date_heure,
        total_reactions: 0,
        vues: 0,
        commentaires_count: 0,
        fichier_url: newEvent.fichier ? URL.createObjectURL(newEvent.fichier) : eventData.fichier_url,
        nom_fichier_original: newEvent.fichier?.name || eventData.nom_fichier_original,
        stats: {
          total_reactions: 0,
          total_views: 0,
          reactions_by_type: {}
        }
      };

      // Animation d'ajout réussie
      setEvenements(prev => [addedEvent, ...prev]);
      
      // Réinitialiser le formulaire
      setNewEvent({
        titre: "",
        description: "",
        date_heure: getTodayDate() + "T00:00",
        lieu: "",
        type: "Présentiel",
        statut: "Validé",
        fichier: null,
        type_fichier: "image",
        auteur: "Admin"
      });
      setPreviewFile(null);
      
      // Fermer le modal
      setShowAddModal(false);
      setIsAdding(false);
      
      showNotification("success", t('success_add_event'));

    } catch (err) {
      console.error("Erreur ajout:", err.response?.data || err);
      showNotification("error", t('error_add_event') + ": " + (err.response?.data?.message || err.message));
      setIsAdding(false);
    }
  };

  // Fonction avec animation pour supprimer
  const handleDeleteEvent = async (id) => {
    if (!window.confirm(t('delete_event_confirmation'))) return;
    
    try {
      setIsDeleting(true);
      
      // Trouver l'élément à supprimer
      const cardToDelete = document.querySelector(`[data-event-id="${id}"]`);
      if (cardToDelete) {
        cardToDelete.style.transition = 'all 0.3s ease';
        cardToDelete.style.opacity = '0.5';
        cardToDelete.style.transform = 'scale(0.95)';
        
        // Attendre l'animation
        setTimeout(async () => {
          await axios.delete(`${API_URL}/evenements/${id}`);
          setEvenements(prev => prev.filter(event => event.id !== id));
          showNotification("success", t('success_delete_event'));
          setIsDeleting(false);
        }, 300);
      } else {
        await axios.delete(`${API_URL}/evenements/${id}`);
        setEvenements(prev => prev.filter(event => event.id !== id));
        showNotification("success", t('success_delete_event'));
        setIsDeleting(false);
      }
    } catch (err) {
      showNotification("error", t('error_delete_event'));
      setIsDeleting(false);
    }
  };

  const handleChangeStatus = async (id, newStatus) => {
    try {
      const validateBtn = document.querySelector(`[data-validate-id="${id}"]`);
      if (validateBtn) {
        validateBtn.classList.add('clicked');
        setTimeout(() => {
          validateBtn.classList.remove('clicked');
        }, 300);
      }
      
      await axios.post(`${API_URL}/evenements/${id}/status`, {
        statut: newStatus
      });

      loadEvenements();
      showNotification("success", t('success_change_status', { status: newStatus }));
    } catch (err) {
      showNotification("error", t('error_change_status'));
    }
  };

  const handleShowEditModal = (event) => {
    if (!event || !event.id) {
      showNotification("error", t('invalid_event'));
      return;
    }
    
    const eventDateTime = event.date_heure ? formatDateTimeForInput(event.date_heure) : getTodayDate() + "T00:00";
    
    setSelectedEvent({
      ...event,
      date_heure: eventDateTime,
      type_fichier: event.type_fichier || "image",
      fichier_url: event.fichier_url || event.fichier || null,
      nom_fichier_original: event.nom_fichier_original || event.fichier?.split('/').pop() || null
    });
    setShowEditModal(true);
    setPreviewFile(null);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "date_heure") {
      if (value && !isValidDate(value)) {
        showNotification("error", t('date_cannot_be_in_past'));
        return;
      }
      setSelectedEvent({ ...selectedEvent, [name]: value });
    } else if (name === "fichier") {
      const file = files[0];
      setSelectedEvent({ ...selectedEvent, fichier: file });

      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({ url: fileURL, name: file.name, type: file.type });
        const fileType = getFileTypeFromFile(file);
        setSelectedEvent(prev => ({ ...prev, type_fichier: fileType }));
      } else {
        setPreviewFile(null);
      }
    } else {
      setSelectedEvent({ ...selectedEvent, [name]: value });
    }
  };

  const handleEditFileTypeChange = (type) => {
    setSelectedEvent({ ...selectedEvent, type_fichier: type, fichier: null });
    setPreviewFile(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedEvent?.id) {
      showNotification("error", t('missing_event_id'));
      return;
    }

    if (!isValidDate(selectedEvent.date_heure)) {
      showNotification("error", t('date_cannot_be_in_past'));
      return;
    }

    try {
      setIsEditing(true);
      
      const saveBtn = document.querySelector('.save-event-btn');
      if (saveBtn) {
        saveBtn.classList.add('clicked');
        setTimeout(() => {
          saveBtn.classList.remove('clicked');
        }, 300);
      }

      const formData = new FormData();
      formData.append("titre", selectedEvent.titre);
      formData.append("description", selectedEvent.description);
      formData.append("date_heure", selectedEvent.date_heure.replace('T', ' ') + ':00');
      formData.append("lieu", selectedEvent.lieu);
      formData.append("type", selectedEvent.type);
      formData.append("statut", selectedEvent.statut || "Validé");
      formData.append("auteur", selectedEvent.auteur || "Admin");
      formData.append("type_fichier", selectedEvent.type_fichier || "image");

      if (selectedEvent.fichier && selectedEvent.fichier instanceof File) {
        formData.append("fichier", selectedEvent.fichier);
      }

      const res = await axios.post(`${API_URL}/evenements/${selectedEvent.id}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const eventData = res.data?.data || res.data;
      const updatedEvent = {
        ...eventData,
        id: selectedEvent.id,
        titre: selectedEvent.titre,
        description: selectedEvent.description,
        type: selectedEvent.type,
        lieu: selectedEvent.lieu,
        type_fichier: selectedEvent.type_fichier,
        fichier_url: selectedEvent.fichier instanceof File
          ? URL.createObjectURL(selectedEvent.fichier)
          : selectedEvent.fichier_url,
        nom_fichier_original: selectedEvent.fichier?.name || selectedEvent.nom_fichier_original,
        date_heure: selectedEvent.date_heure,
        total_reactions: eventData.total_reactions || selectedEvent.total_reactions || 0,
        vues: eventData.vues || selectedEvent.vues || 0,
        commentaires_count: eventData.commentaires_count || selectedEvent.commentaires_count || 0,
        stats: eventData.stats || selectedEvent.stats || {
          total_reactions: 0,
          total_views: 0,
          reactions_by_type: {}
        }
      };

      // Mettre à jour l'événement
      setEvenements(prev => prev.map(event =>
        event.id === selectedEvent.id ? updatedEvent : event
      ));

      setShowEditModal(false);
      setPreviewFile(null);
      setIsEditing(false);
      showNotification("success", t('success_edit_event'));
      
    } catch (err) {
      console.error("Erreur modification:", err.response || err);
      showNotification("error", t('error_edit_event') + ": " + (err.response?.data?.message || err.message));
      setIsEditing(false);
    }
  };

  const getStatusVariant = (statut) => {
    switch (statut) {
      case "Validé": return "success";
      case "En attente": return "warning";
      case "Brouillon": return "secondary";
      case "Rejeté": return "danger";
      default: return "primary";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Présentiel": return "fa-building";
      case "En ligne": return "fa-video";
      case "Hybride": return "fa-blender-phone";
      default: return "fa-calendar";
    }
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case "Validé": return "fa-check-circle";
      case "En attente": return "fa-clock";
      case "Brouillon": return "fa-edit";
      case "Rejeté": return "fa-times-circle";
      default: return "fa-info-circle";
    }
  };

  const displayFile = (event) => {
    if (!event) return null;
    if (event.fichier_url && event.fichier_url.startsWith('blob:')) return event.fichier_url;
    if (event.fichier_url && typeof event.fichier_url === 'string') return event.fichier_url;
    if (event.fichier && typeof event.fichier === 'string') {
      if (event.fichier.startsWith('http')) return event.fichier;
      return `${API_URL.replace('/api', '')}/storage/${event.fichier}`;
    }
    return null;
  };

  const getFileType = (event) => {
    if (!event) return 'document';
    if (event.type_fichier) return event.type_fichier;
    const fileUrl = displayFile(event);
    if (!fileUrl) return 'document';
    if (/\.(jpe?g|png|gif|bmp|webp)$/i.test(fileUrl)) return 'image';
    if (/\.(mp4|webm|ogg)$/i.test(fileUrl)) return 'video';
    return 'document';
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons = {
      pdf: 'fa-file-pdf', doc: 'fa-file-word', docx: 'fa-file-word',
      xls: 'fa-file-excel', xlsx: 'fa-file-excel',
      ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint',
      jpg: 'fa-file-image', jpeg: 'fa-file-image', png: 'fa-file-image',
      gif: 'fa-file-image', bmp: 'fa-file-image',
      mp4: 'fa-file-video', avi: 'fa-file-video', mov: 'fa-file-video',
      zip: 'fa-file-archive', rar: 'fa-file-archive',
      txt: 'fa-file-alt'
    };
    return icons[ext] || 'fa-file';
  };

  const getFileBadgeVariant = (fileName) => {
    if (!fileName) return 'secondary';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const variants = { pdf: 'danger', doc: 'primary', docx: 'primary', xls: 'success', xlsx: 'success' };
    return variants[ext] || 'secondary';
  };

  const handleDownloadFile = async (event) => {
    try {
      const fileUrl = displayFile(event);
      if (!fileUrl) throw new Error("URL manquante");

      if (fileUrl.startsWith('blob:') || fileUrl.startsWith('http')) {
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = event.nom_fichier_original || 'fichier';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = event.nom_fichier_original || 'fichier';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      
      showNotification("success", t('success_download'));
    } catch (error) {
      showNotification("error", t('error_download'));
    }
  };

  const FilePreview = ({ file }) => {
    const { t } = useTranslation();
    
    if (!file) return null;
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <h6 className="mb-3">
          <i className="fas fa-eye me-2"></i>
          {t('file_preview')}
        </h6>
        {isImage ? (
          <div className="text-center">
            <img 
              src={file.url} 
              alt={t('preview')}
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
              title="PDF"
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
            <p className="small text-muted">{t('preview_not_available')}</p>
          </div>
        )}
      </div>
    );
  };

  const filteredEvenements = evenements.filter((event) => {
    const matchesSearch = event.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.lieu?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatut = filterStatut === "Tous" || event.statut === filterStatut;
    const matchesType = filterType === "Tous" || event.type === filterType;
    return matchesSearch && matchesStatut && matchesType;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatut("Tous");
    setFilterType("Tous");
    setCurrentPage(0);
  };

  // Calculer les variables pour la pagination
  const cardsPerPage = 4;
  const totalPages = Math.ceil(filteredEvenements.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentEvents = filteredEvenements.slice(startIndex, endIndex);

  // Fonctions pour la navigation avec animations
  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      const nextBtn = document.querySelector('.next-page-btn');
      if (nextBtn) {
        nextBtn.classList.add('clicked');
        setTimeout(() => {
          nextBtn.classList.remove('clicked');
        }, 300);
      }
      
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      const prevBtn = document.querySelector('.prev-page-btn');
      if (prevBtn) {
        prevBtn.classList.add('clicked');
        setTimeout(() => {
          prevBtn.classList.remove('clicked');
        }, 300);
      }
      
      setCurrentPage(prev => prev - 1);
    }
  };

  const scrollToContainer = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  };

  // Réinitialiser la page quand les filtres changent
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, filterStatut, filterType]);

  // Fonction pour ouvrir le modal avec animation
  const openAddModal = () => {
    setShowAddModal(true);
    // Réinitialiser le formulaire
    setNewEvent({
      titre: "",
      description: "",
      date_heure: getTodayDate() + "T00:00",
      lieu: "",
      type: "Présentiel",
      statut: "Validé",
      fichier: null,
      type_fichier: "image",
      auteur: "Admin"
    });
    setPreviewFile(null);
  };

  // Composant pour l'affichage en mode grille avec pagination
  const GridView = () => (
    <div ref={scrollContainerRef}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h6 className="text-muted mb-0">
            Affichage {startIndex + 1} à {Math.min(endIndex, filteredEvenements.length)} sur {filteredEvenements.length} événements
          </h6>
        </div>
        <div className="d-flex align-items-center gap-3">
          <Button 
            variant="outline-primary" 
            onClick={handlePrevPage}
            disabled={currentPage === 0}
            className="d-flex align-items-center prev-page-btn"
            style={{ borderRadius: "50%", width: "50px", height: "50px" }}
          >
            <i className="fas fa-chevron-left"></i>
          </Button>
          
          <div className="d-flex align-items-center gap-2">
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index}
                variant={currentPage === index ? "primary" : "outline-primary"}
                size="sm"
                onClick={() => {
                  // Animation du bouton de page
                  const pageBtn = document.querySelector(`[data-page="${index}"]`);
                  if (pageBtn) {
                    pageBtn.classList.add('clicked');
                    setTimeout(() => {
                      pageBtn.classList.remove('clicked');
                    }, 300);
                  }
                  
                  setCurrentPage(index);
                  scrollToContainer();
                }}
                data-page={index}
                style={{ 
                  width: "35px", 
                  height: "35px", 
                  borderRadius: "50%",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          
          <Button 
            variant="outline-primary" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages - 1}
            className="d-flex align-items-center next-page-btn"
            style={{ borderRadius: "50%", width: "50px", height: "50px" }}
          >
            <i className="fas fa-chevron-right"></i>
          </Button>
        </div>
      </div>

      <Row className="g-4">
        {currentEvents.map((event) => {
          const fileUrl = displayFile(event);
          const fileType = getFileType(event);

          return (
            <Col md={3} key={event.id} className="mb-4">
              <Card 
                className="border-0 shadow-sm h-100 event-card"
                style={{ borderRadius: "20px" }}
                data-event-id={event.id}
              >
                {fileUrl ? (
                  <div style={{ position: "relative" }}>
                    {fileType === 'image' ? (
                      <Card.Img 
                        variant="top" 
                        src={fileUrl} 
                        style={{ 
                          height: "200px", 
                          objectFit: "cover", 
                          borderTopLeftRadius: "20px", 
                          borderTopRightRadius: "20px" 
                        }}
                        onError={(e) => { e.target.style.display = 'none'; }} 
                      />
                    ) : fileType === 'video' ? (
                      <div style={{ 
                        height: "200px", 
                        background: "#000", 
                        borderTopLeftRadius: "20px", 
                        borderTopRightRadius: "20px", 
                        overflow: "hidden", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center" 
                      }}>
                        <video 
                          src={fileUrl} 
                          style={{ 
                            maxHeight: "100%", 
                            maxWidth: "100%", 
                            objectFit: "contain" 
                          }} 
                          controls 
                          muted 
                        />
                      </div>
                    ) : (
                      <div style={{ 
                        height: "200px", 
                        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", 
                        borderTopLeftRadius: "20px", 
                        borderTopRightRadius: "20px", 
                        display: "flex", 
                        flexDirection: "column", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        padding: "20px" 
                      }}>
                        <i className={`fas ${getFileIcon(event.nom_fichier_original)} fa-4x text-muted mb-3`}></i>
                        <p className="small text-muted text-center">{event.nom_fichier_original || "Document"}</p>
                        <Badge bg="secondary" className="mt-2">PDF</Badge>
                      </div>
                    )}
                    <Badge 
                      bg={getStatusVariant(event.statut)} 
                      className="position-absolute top-0 end-0 m-3" 
                      style={{ 
                        borderRadius: "20px", 
                        padding: "6px 12px" 
                      }}
                    >
                      <i className={`fas ${getStatusIcon(event.statut)} me-1`}></i>
                      {t(event.statut)}
                    </Badge>
                  </div>
                ) : (
                  <div style={{ 
                    height: "200px", 
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", 
                    borderTopLeftRadius: "20px", 
                    borderTopRightRadius: "20px", 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    position: "relative" 
                  }}>
                    <div className="text-center text-white">
                      <i className={`fas ${getTypeIcon(event.type)} fs-1 mb-2 d-block`}></i>
                      <small>{t('no_file')}</small>
                    </div>
                    <Badge 
                      bg={getStatusVariant(event.statut)} 
                      className="position-absolute top-0 end-0 m-3" 
                      style={{ 
                        borderRadius: "20px", 
                        padding: "6px 12px" 
                      }}
                    >
                      <i className={`fas ${getStatusIcon(event.statut)} me-1`}></i>
                      {t(event.statut)}
                    </Badge>
                  </div>
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className={`fas ${getTypeIcon(event.type)} text-primary me-2`}></i>
                      <Badge 
                        bg="light" 
                        text="dark" 
                        style={{ 
                          borderRadius: "15px", 
                          fontSize: "0.7rem" 
                        }}
                      >
                        {t(event.type.toLowerCase())}
                      </Badge>
                    </div>
                    <Card.Title className="h5 fw-bold">{event.titre}</Card.Title>
                  </div>
                  <Card.Text className="text-muted flex-grow-1">
                    {event.description?.length > 120 ? `${event.description.substring(0, 120)}...` : event.description}
                  </Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                      <div>
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(event.date_heure)}
                        {!isValidDate(event.date_heure) && (
                          <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: "0.6rem" }}>
                            <i className="fas fa-clock me-1"></i>Passé
                          </Badge>
                        )}
                      </div>
                      <div>
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {event.lieu}
                      </div>
                    </div>
                    
                    {fileUrl && (
                      <div className="mb-3 p-2 border rounded" style={{ background: '#f8f9fa' }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <i className={`fas ${getFileIcon(event.nom_fichier_original)} text-${getFileBadgeVariant(event.nom_fichier_original)} me-2`}></i>
                            <span className="small">{event.nom_fichier_original || t('attached_file')}</span>
                          </div>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleDownloadFile(event)} 
                            style={{ borderRadius: "6px", fontSize: "0.7rem" }}
                            className="download-btn"
                          >
                            <i className="fas fa-download me-1"></i>{t('download')}
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-3 text-muted small">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-heart-${event.id}`}>Réactions</Tooltip>}
                        >
                          <span>
                            <i className="fas fa-heart me-1 text-danger"></i>
                            {event.stats?.total_reactions || event.total_reactions || 0}
                          </span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-eye-${event.id}`}>Vues</Tooltip>}
                        >
                          <span>
                            <i className="fas fa-eye me-1 text-primary"></i>
                            {event.stats?.total_views || event.vues || 0}
                          </span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-comment-${event.id}`}>Commentaires</Tooltip>}
                        >
                          <span>
                            <i className="fas fa-comment me-1 text-success"></i>
                            {event.commentaires_count || 0}
                          </span>
                        </OverlayTrigger>
                      </div>
                      
                      <div className="d-flex gap-1">
                        {event.statut === "En attente" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-validate-${event.id}`}>Valider</Tooltip>}
                          >
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => handleChangeStatus(event.id, "Validé")} 
                              style={{ borderRadius: "8px" }}
                              data-validate-id={event.id}
                              className="action-btn"
                            >
                              <i className="fas fa-check"></i>
                            </Button>
                          </OverlayTrigger>
                        )}
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-edit-${event.id}`}>Modifier</Tooltip>}
                        >
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            onClick={() => handleShowEditModal(event)} 
                            style={{ borderRadius: "8px" }}
                            className="action-btn"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-delete-${event.id}`}>Supprimer</Tooltip>}
                        >
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDeleteEvent(event.id)} 
                            style={{ borderRadius: "8px" }}
                            className="action-btn"
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* Pagination inférieure */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <div className="d-flex align-items-center gap-4">
            <Button 
              variant={currentPage === 0 ? "outline-secondary" : "outline-primary"}
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="d-flex align-items-center page-btn"
              style={{ borderRadius: "10px", padding: "8px 20px" }}
            >
              <i className="fas fa-chevron-left me-2"></i>
              Précédent
            </Button>
            
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted">Page</span>
              <div className="d-flex gap-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  let pageIndex;
                  if (totalPages <= 5) {
                    pageIndex = i;
                  } else if (currentPage < 3) {
                    pageIndex = i;
                  } else if (currentPage > totalPages - 4) {
                    pageIndex = totalPages - 5 + i;
                  } else {
                    pageIndex = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={pageIndex}
                      variant={currentPage === pageIndex ? "primary" : "outline-primary"}
                      size="sm"
                      onClick={() => {
                        setCurrentPage(pageIndex);
                        scrollToContainer();
                      }}
                      style={{ 
                        minWidth: "40px", 
                        height: "40px", 
                        borderRadius: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                })}
              </div>
              <span className="text-muted">sur {totalPages}</span>
            </div>
            
            <Button 
              variant={currentPage === totalPages - 1 ? "outline-secondary" : "outline-primary"}
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="d-flex align-items-center page-btn"
              style={{ borderRadius: "10px", padding: "8px 20px" }}
            >
              Suivant
              <i className="fas fa-chevron-right ms-2"></i>
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  // Composant pour l'affichage en mode liste
  const ListView = () => (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h6 className="text-muted mb-0">
          {filteredEvenements.length} événement(s) trouvé(s)
        </h6>
      </div>
      
      <ListGroup variant="flush">
        {filteredEvenements.map((event) => {
          const fileUrl = displayFile(event);
          const fileType = getFileType(event);

          return (
            <ListGroup.Item 
              key={event.id}
              className="mb-3 border-0 shadow-sm rounded-3 list-view-item"
              style={{ background: 'white' }}
            >
              <div className="d-flex">
                {/* Colonne gauche : Image/Icone */}
                <div className="flex-shrink-0 me-3" style={{ width: '120px' }}>
                  {fileUrl ? (
                    fileType === 'image' ? (
                      <img 
                        src={fileUrl} 
                        alt={event.titre}
                        className="rounded-2"
                        style={{ width: '120px', height: '90px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center rounded-2 bg-light"
                        style={{ width: '120px', height: '90px' }}>
                        <i className={`fas ${getFileIcon(event.nom_fichier_original)} fa-2x text-muted`}></i>
                      </div>
                    )
                  ) : (
                    <div className="d-flex align-items-center justify-content-center rounded-2"
                      style={{ 
                        width: '120px', 
                        height: '90px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                      <i className={`fas ${getTypeIcon(event.type)} fa-2x text-white`}></i>
                    </div>
                  )}
                </div>

                {/* Colonne centrale : Contenu */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{event.titre}</h5>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg="light" text="dark" className="py-1 px-2" style={{ fontSize: '0.7rem' }}>
                          <i className={`fas ${getTypeIcon(event.type)} me-1`}></i>
                          {t(event.type.toLowerCase())}
                        </Badge>
                        <Badge bg={getStatusVariant(event.statut)} className="py-1 px-2" style={{ fontSize: '0.7rem' }}>
                          <i className={`fas ${getStatusIcon(event.statut)} me-1`}></i>
                          {t(event.statut)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-muted small text-end">
                      <div><i className="fas fa-calendar me-1"></i>{formatDate(event.date_heure)}</div>
                      <div><i className="fas fa-map-marker-alt me-1"></i>{event.lieu}</div>
                    </div>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                    {event.description?.length > 200 ? `${event.description.substring(0, 200)}...` : event.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex gap-3 text-muted small">
                      <span title="Réactions">
                        <i className="fas fa-heart me-1 text-danger"></i>
                        {event.stats?.total_reactions || event.total_reactions || 0}
                      </span>
                      <span title="Vues">
                        <i className="fas fa-eye me-1 text-primary"></i>
                        {event.stats?.total_views || event.vues || 0}
                      </span>
                      <span title="Commentaires">
                        <i className="fas fa-comment me-1 text-success"></i>
                        {event.commentaires_count || 0}
                      </span>
                      {fileUrl && (
                        <span 
                          className="text-primary" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => handleDownloadFile(event)}
                          role="button"
                        >
                          <i className="fas fa-download me-1"></i>{t('download')}
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex gap-1">
                      {event.statut === "En attente" && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-validate-list-${event.id}`}>Valider</Tooltip>}
                        >
                          <Button 
                            variant="success" 
                            size="sm" 
                            onClick={() => handleChangeStatus(event.id, "Validé")} 
                            style={{ borderRadius: "8px" }}
                          >
                            <i className="fas fa-check"></i>
                          </Button>
                        </OverlayTrigger>
                      )}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-edit-list-${event.id}`}>Modifier</Tooltip>}
                      >
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          onClick={() => handleShowEditModal(event)} 
                          style={{ borderRadius: "8px" }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-delete-list-${event.id}`}>Supprimer</Tooltip>}
                      >
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleDeleteEvent(event.id)} 
                          style={{ borderRadius: "8px" }}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </div>
                </div>
              </div>
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {showAlert.show && (
          <Alert 
            variant={showAlert.type === "success" ? "success" : "danger"}
            className="d-flex align-items-center shadow-lg border-0 notification-slide"
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
                {showAlert.type === "success" ? t('success') : t('error')}
              </strong>
              <span className="text-muted">{showAlert.message}</span>
            </div>
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ 
              background: "linear-gradient(135deg, #2c3e50, #34495e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {t('event_management_title')}
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-calendar-alt me-2"></i>
              {t('event_management_subtitle')}
            </p>
          </div>
          <Button 
            variant="success" 
            onClick={openAddModal} 
            className="d-flex align-items-center shadow-sm add-event-main-btn"
            style={{
              background: "linear-gradient(135deg, #00b09b, #96c93d)",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontWeight: "600"
            }}
          >
            <i className="fas fa-plus me-2"></i>
            {t('new_event_button')}
          </Button>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          {[
            { 
              title: "total_events", 
              count: evenements.length, 
              icon: "fa-calendar-alt", 
              color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            { 
              title: "upcoming_events", 
              count: evenements.filter(ev => isValidDate(ev.date_heure)).length, 
              icon: "fa-clock", 
              color: "linear-gradient(135deg, #00b09b, #96c93d)"
            },
            { 
              title: "total_views", 
              count: evenements.reduce((sum, ev) => sum + (ev.stats?.total_views || ev.vues || 0), 0), 
              icon: "fa-eye", 
              color: "linear-gradient(135deg, #4facfe, #00f2fe)"
            },
            { 
              title: "total_reactions", 
              count: evenements.reduce((sum, ev) => sum + (ev.stats?.total_reactions || ev.total_reactions || 0), 0), 
              icon: "fa-heart", 
              color: "linear-gradient(135deg, #f093fb, #f5576c)"
            }
          ].map((stat, index) => (
            <Col md={3} key={index} className="mb-3">
              <Card className="border-0 shadow-sm h-100 hover-card" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2">{t(stat.title)}</h6>
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
        <Card className="border-0 shadow-sm mb-4 hover-card" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-search me-2"></i>
                    {t('search')}
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
                      placeholder={t('search_event_placeholder')}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      style={{ borderRadius: "0 10px 10px 0" }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-filter me-2"></i>
                    {t('status_filter')}
                  </Form.Label>
                  <Form.Select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="Tous">{t('all_status')}</option>
                    <option value="Validé">{t('Validé')}</option>
                    <option value="En attente">{t('En attente')}</option>
                    <option value="Rejeté">{t('Rejeté')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-tag me-2"></i>
                    {t('type_filter')}
                  </Form.Label>
                  <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="Tous">{t('all_types')}</option>
                    <option value="Présentiel">{t('presentiel')}</option>
                    <option value="En ligne">{t('online')}</option>
                    <option value="Hybride">{t('hybrid')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2}>
                <div className="d-flex gap-2 justify-content-end">
                  <ButtonGroup>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="tooltip-grid">Mode grille (4 par page)</Tooltip>}
                    >
                      <Button 
                        variant={viewMode === "grid" ? "primary" : "outline-primary"}
                        onClick={() => setViewMode("grid")}
                        size="sm"
                        style={{ borderRadius: "10px 0 0 10px" }}
                      >
                        <i className="fas fa-th-large"></i>
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip id="tooltip-list">Mode liste (toutes)</Tooltip>}
                    >
                      <Button 
                        variant={viewMode === "list" ? "primary" : "outline-primary"}
                        onClick={() => setViewMode("list")}
                        size="sm"
                        style={{ borderRadius: "0 10px 10px 0" }}
                      >
                        <i className="fas fa-list"></i>
                      </Button>
                    </OverlayTrigger>
                  </ButtonGroup>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      onClick={loadEvenements}
                      style={{ borderRadius: "10px" }}
                    >
                      <i className="fas fa-refresh"></i>
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={clearFilters}
                      style={{ borderRadius: "10px" }}
                    >
                      <i className="fas fa-times"></i>
                    </Button>
                  </div>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">{t('loading')}...</span>
            </div>
            <p className="text-muted fw-semibold">{t('loading_events')}</p>
          </div>
        ) : filteredEvenements.length > 0 ? (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                  <i className={`fas ${viewMode === 'grid' ? 'fa-th-large' : 'fa-list'} me-2`}></i>
                  {viewMode === 'grid' ? t('grid_view') : t('list_view')}
                  <Badge bg="primary" className="ms-2">{filteredEvenements.length}</Badge>
                </h5>
              </div>
              {viewMode === 'grid' && filteredEvenements.length > 4 && (
                <div className="d-flex align-items-center gap-3 text-muted small">
                  <i className="fas fa-info-circle"></i>
                  <span>Affichage de 4 événements par page - Utilisez les flèches pour naviguer</span>
                </div>
              )}
            </div>

            {viewMode === "grid" ? <GridView /> : <ListView />}
          </div>
        ) : (
          <Card className="border-0 shadow-sm text-center" style={{ borderRadius: "20px" }}>
            <Card.Body className="py-5">
              <i className="fas fa-calendar-times fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
              <h5 className="text-muted mb-2">{t('no_events_found')}</h5>
              <Button 
                variant="primary" 
                onClick={clearFilters} 
                className="d-flex align-items-center mx-auto"
              >
                <i className="fas fa-times me-2"></i>{t('clear_filters')}
              </Button>
            </Card.Body>
          </Card>
        )}

        {/* Modal Ajout d'Événement */}
        <Modal 
          show={showAddModal} 
          onHide={() => { 
            setShowAddModal(false); 
            setPreviewFile(null); 
          }} 
          size="lg" 
          centered
          ref={modalRef}
          className="modal-animation"
        >
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
              {t('add_event_modal')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-heading me-2 text-primary"></i>
                      {t('event_title')} *
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="titre" 
                      value={newEvent.titre} 
                      onChange={handleChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder={t('event_title_placeholder')}
                    />
                    {!newEvent.titre && <Form.Text className="text-danger">{t('field_required')}</Form.Text>}
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-chart-line me-2 text-primary"></i>
                      {t('status_label')}
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      value={t('Validé')} 
                      disabled 
                      style={{ borderRadius: "10px", padding: "12px", background: "#e9ecef" }} 
                    />
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      {t('admin_event_note')}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-align-left me-2 text-primary"></i>
                  {t('description_label')} *
                </Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={4} 
                  name="description" 
                  value={newEvent.description} 
                  onChange={handleChange} 
                  required 
                  style={{ borderRadius: "10px", padding: "12px" }}
                  placeholder={t('description_placeholder')}
                />
                {!newEvent.description && <Form.Text className="text-danger">{t('field_required')}</Form.Text>}
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-calendar me-2 text-primary"></i>
                      {t('date_time_label')} *
                    </Form.Label>
                    <Form.Control 
                      type="datetime-local" 
                      name="date_heure" 
                      value={newEvent.date_heure} 
                      onChange={handleChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                    {newEvent.date_heure && !isValidDate(newEvent.date_heure) && (
                      <Form.Text className="text-danger">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {t('date_cannot_be_in_past')}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                      {t('location_label')} *
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="lieu" 
                      value={newEvent.lieu} 
                      onChange={handleChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder={t('location_placeholder')}
                    />
                    {!newEvent.lieu && <Form.Text className="text-danger">{t('field_required')}</Form.Text>}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-tag me-2 text-primary"></i>
                      {t('type_label')} *
                    </Form.Label>
                    <Form.Select 
                      name="type" 
                      value={newEvent.type} 
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="Présentiel">{t('presentiel')}</option>
                      <option value="En ligne">{t('online')}</option>
                      <option value="Hybride">{t('hybrid')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-paperclip me-2 text-primary"></i>
                      {t('file_type_label')}
                    </Form.Label>
                    <div className="d-flex gap-2">
                      {['image', 'video', 'document'].map(fileType => (
                        <Button
                          key={fileType}
                          variant={newEvent.type_fichier === fileType ? 'primary' : 'outline-primary'}
                          onClick={() => handleFileTypeChange(fileType)}
                          className="d-flex align-items-center"
                          style={{ borderRadius: "10px" }}
                        >
                          <i className={`fas fa-${fileType === 'video' ? 'video' : fileType === 'document' ? 'file' : 'image'} me-2`}></i>
                          {fileType === 'image' ? t('image') : fileType === 'video' ? t('video') : t('document')}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className={`fas ${newEvent.type_fichier === 'video' ? 'fa-video' : newEvent.type_fichier === 'document' ? 'fa-file' : 'fa-image'} me-2 text-primary`}></i>
                  {t('file_label')} {newEvent.type_fichier === 'video' ? t('video') : newEvent.type_fichier === 'document' ? t('document') : t('image')}
                </Form.Label>
                <Form.Control
                  type="file"
                  name="fichier"
                  accept={newEvent.type_fichier === 'video' ? "video/*" : newEvent.type_fichier === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" : "image/*"}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", padding: "12px" }}
                />
                <Form.Text className="text-muted small d-block mt-1">
                  <i className="fas fa-info-circle me-1"></i>
                  {t('event_file_formats')}
                </Form.Text>
              </Form.Group>

              <FilePreview file={previewFile} />

              <div className="alert alert-info d-flex align-items-center" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                <div>
                  <strong>{t('note')}:</strong> {t('required_fields_note')}
                  {t('date_validation_info')}
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={() => { setShowAddModal(false); setPreviewFile(null); }} 
              style={{ borderRadius: "10px", padding: "10px 20px" }}
              disabled={isAdding}
            >
              <i className="fas fa-times me-2"></i>{t('cancel_button')}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddEvent} 
              disabled={!isValidDate(newEvent.date_heure) || !newEvent.titre || !newEvent.description || !newEvent.lieu || isAdding}
              style={{ 
                borderRadius: "10px", 
                padding: "10px 20px", 
                background: "linear-gradient(135deg, #667eea, #764ba2)", 
                border: "none" 
              }}
              className="add-event-btn"
            >
              {isAdding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('creating_event')}
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>{t('create_event_button')}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Modifier */}
        {selectedEvent && (
          <Modal 
            show={showEditModal} 
            onHide={() => { 
              setShowEditModal(false); 
              setPreviewFile(null); 
            }} 
            size="lg" 
            centered
            className="modal-animation"
          >
            <Modal.Header 
              closeButton 
              className="border-0"
              style={{ 
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white"
              }}
            >
              <Modal.Title className="d-flex align-items-center fw-bold">
                <i className="fas fa-edit me-2"></i>
                {t('edit_event_modal')}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Form>
                <Row>
                  <Col md={8}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-heading me-2 text-primary"></i>
                        {t('event_title')} *
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="titre" 
                        value={selectedEvent.titre} 
                        onChange={handleEditChange} 
                        required 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-chart-line me-2 text-primary"></i>
                        {t('status_label')}
                      </Form.Label>
                      <Form.Select 
                        name="statut" 
                        value={selectedEvent.statut} 
                        onChange={handleEditChange}
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value="Validé">{t('Validé')}</option>
                        <option value="En attente">{t('En attente')}</option>
                        <option value="Rejeté">{t('Rejeté')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className="fas fa-align-left me-2 text-primary"></i>
                    {t('description_label')} *
                  </Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={4} 
                    name="description" 
                    value={selectedEvent.description} 
                    onChange={handleEditChange} 
                    required 
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-calendar me-2 text-primary"></i>
                        {t('date_time_label')} *
                      </Form.Label>
                      <Form.Control 
                        type="datetime-local" 
                        name="date_heure" 
                        value={selectedEvent.date_heure} 
                        onChange={handleEditChange} 
                        required 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                      {selectedEvent.date_heure && !isValidDate(selectedEvent.date_heure) && (
                        <Form.Text className="text-danger">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {t('date_cannot_be_in_past')}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-map-marker-alt me-2 text-primary"></i>
                        {t('location_label')} *
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="lieu" 
                        value={selectedEvent.lieu} 
                        onChange={handleEditChange} 
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
                        <i className="fas fa-tag me-2 text-primary"></i>
                        {t('type_label')} *
                      </Form.Label>
                      <Form.Select 
                        name="type" 
                        value={selectedEvent.type} 
                        onChange={handleEditChange}
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value="Présentiel">{t('presentiel')}</option>
                        <option value="En ligne">{t('online')}</option>
                        <option value="Hybride">{t('hybrid')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-paperclip me-2 text-primary"></i>
                        {t('file_type_label')}
                      </Form.Label>
                      <div className="d-flex gap-2">
                        {['image', 'video', 'document'].map(fileType => (
                          <Button
                            key={fileType}
                            variant={selectedEvent.type_fichier === fileType ? 'primary' : 'outline-primary'}
                            onClick={() => handleEditFileTypeChange(fileType)}
                            className="d-flex align-items-center"
                            style={{ borderRadius: "10px" }}
                          >
                            <i className={`fas fa-${fileType === 'video' ? 'video' : fileType === 'document' ? 'file' : 'image'} me-2`}></i>
                            {fileType === 'image' ? t('image') : fileType === 'video' ? t('video') : t('document')}
                          </Button>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className={`fas ${selectedEvent.type_fichier === 'video' ? 'fa-video' : selectedEvent.type_fichier === 'document' ? 'fa-file' : 'fa-image'} me-2 text-primary`}></i>
                    {t('file_label')} {selectedEvent.type_fichier === 'video' ? t('video') : selectedEvent.type_fichier === 'document' ? t('document') : t('image')}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="fichier"
                    accept={selectedEvent.type_fichier === 'video' ? "video/*" : selectedEvent.type_fichier === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" : "image/*"}
                    onChange={handleEditChange}
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                  {selectedEvent.fichier_url && !previewFile && (
                    <div className="mt-2">
                      <small className="text-muted d-block">
                        <i className="fas fa-file me-1"></i>
                        {t('current_file')}: {selectedEvent.nom_fichier_original || t('attached_file')}
                      </small>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleDownloadFile(selectedEvent)}
                        style={{ borderRadius: "6px", fontSize: "0.7rem" }}
                        className="download-btn mt-1"
                      >
                        <i className="fas fa-download me-1"></i>{t('download')}
                      </Button>
                    </div>
                  )}
                </Form.Group>

                <FilePreview file={previewFile} />
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button 
                variant="outline-secondary" 
                onClick={() => { setShowEditModal(false); setPreviewFile(null); }}
                style={{ borderRadius: "10px", padding: "10px 20px" }}
                disabled={isEditing}
              >
                <i className="fas fa-times me-2"></i>{t('cancel_button')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveEdit} 
                disabled={!isValidDate(selectedEvent.date_heure) || !selectedEvent.titre || !selectedEvent.description || !selectedEvent.lieu || isEditing}
                style={{ 
                  borderRadius: "10px", 
                  padding: "10px 20px", 
                  background: "linear-gradient(135deg, #667eea, #764ba2)", 
                  border: "none" 
                }}
                className="save-event-btn"
              >
                {isEditing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>{t('save_button')}
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        )}

        {/* CSS pour les animations */}
        <style>{`
          /* Animations pour les clics */
          .clicked {
            animation: clickAnimation 0.3s ease;
            transform: scale(0.95);
          }
          
          @keyframes clickAnimation {
            0% { transform: scale(1); }
            50% { transform: scale(0.95); }
            100% { transform: scale(1); }
          }
          
          /* Animation pour le modal */
          .modal-animation.fade .modal-dialog {
            transform: translateY(-50px);
            opacity: 0;
            transition: all 0.3s ease-out;
          }
          
          .modal-animation.show .modal-dialog {
            transform: translateY(0);
            opacity: 1;
          }
          
          /* Animation pour les cartes */
          .event-card {
            transition: all 0.3s ease;
          }
          
          .event-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          }
          
          .hover-card {
            transition: all 0.3s ease;
          }
          
          .hover-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0,0,0,0.1);
          }
          
          /* Animation pour les boutons d'action */
          .action-btn:active {
            animation: buttonClick 0.2s ease;
          }
          
          @keyframes buttonClick {
            0% { transform: scale(1); }
            50% { transform: scale(0.9); }
            100% { transform: scale(1); }
          }
          
          /* Animation pour le bouton d'ajout principal */
          .add-event-main-btn:hover {
            animation: pulse 1s infinite;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          /* Animation pour les items de liste */
          .list-view-item {
            transition: all 0.2s ease;
          }
          
          .list-view-item:hover {
            background-color: #f8f9fa;
            transform: translateX(5px);
          }
          
          /* Animation pour les boutons de page */
          .page-btn {
            transition: all 0.2s ease;
          }
          
          .page-btn:hover:not(:disabled) {
            transform: scale(1.05);
          }
          
          /* Animation pour les téléchargements */
          .download-btn:active {
            animation: downloadClick 0.3s ease;
          }
          
          @keyframes downloadClick {
            0% { transform: translateY(0); }
            50% { transform: translateY(2px); }
            100% { transform: translateY(0); }
          }
          
          /* Validation visuelle des champs */
          .form-control:focus {
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
            border-color: #667eea;
          }
          
          .form-control.is-invalid {
            border-color: #dc3545;
            animation: shake 0.5s ease;
          }
          
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
          
          /* Animation pour les notifications */
          .notification-slide {
            animation: slideIn 0.3s ease;
          }
          
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          
          /* Animation pour les badges de statut */
          .badge-success {
            animation: pulseBadge 2s infinite;
          }
          
          .badge-warning {
            animation: pulseBadge 2s infinite 0.5s;
          }
          
          .badge-danger {
            animation: pulseBadge 2s infinite 1s;
          }
          
          @keyframes pulseBadge {
            0% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(40, 167, 69, 0); }
            100% { box-shadow: 0 0 0 0 rgba(40, 167, 69, 0); }
          }
          
          /* Animation pour le changement de page */
          .page-transition-enter {
            opacity: 0;
            transform: translateY(20px);
          }
          
          .page-transition-enter-active {
            opacity: 1;
            transform: translateY(0);
            transition: opacity 300ms, transform 300ms;
          }
          
          .page-transition-exit {
            opacity: 1;
          }
          
          .page-transition-exit-active {
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 300ms, transform 300ms;
          }
          
          /* Animation pour les statistiques */
          .stat-card {
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-5px) scale(1.02);
          }
        `}</style>
      </div>
    </div>
  );
};

export default Evenement;