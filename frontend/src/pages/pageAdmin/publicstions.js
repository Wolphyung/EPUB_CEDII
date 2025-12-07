import React, { useState, useEffect, useRef } from "react";
import {
  Button,
  Form,
  Modal,
  Card,
  Row,
  Col,
  Badge,
  InputGroup,
  Alert,
  ListGroup,
  ButtonGroup,
  Tooltip,
  OverlayTrigger
} from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";
import {
  fetchPublications,
  addPublication,
  updatePublication,
  deletePublication,
  validatePublication
} from "../../services/api";
import { useTranslation } from 'react-i18next';

const Publication = () => {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPub, setSelectedPub] = useState({
    id_publication: null,
    titre: "",
    contenu: "",
    type: "Article",
    date_publication: "",
    source: "",
    categorie: "",
    statut: "Validé",
    fichier: null,
    type_fichier: "image",
    auteur: "Admin",
    id_utilisateur: null,
    fichier_url: null,
    nom_fichier_original: null
  });
  const [publications, setPublications] = useState([]);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Référence pour le conteneur de défilement
  const scrollContainerRef = useRef(null);
  const modalRef = useRef(null);

  // Définir les catégories avec les traductions
  const categories = [
    t('Technology'), t('Health'), t('Education'), t('Sports'), t('Culture'), 
    t('Economy'), t('Politics'), t('Environment'), t('Science'), t('Travel'), 
    t('Fashion'), t('Cuisine'), t('Automobile'), t('Real Estate'), t('Entertainment')
  ];

  // Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // FORMAT DATE POUR <input type="date">
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString.split('T')[0] || "";
    }
  };

  // FORMAT DATE POUR L'API
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return new Date().toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr.split('T')[0];
  };

  // Fonction pour vérifier si une date est valide et pas dans le passé
  const isValidDate = (dateString) => {
    if (!dateString) return false;
    try {
      const selectedDate = new Date(dateString);
      const today = new Date(getTodayDate());
      
      // Réinitialiser les heures pour comparer seulement les dates
      selectedDate.setHours(0, 0, 0, 0);
      today.setHours(0, 0, 0, 0);
      
      return selectedDate >= today;
    } catch (e) {
      return false;
    }
  };

  // Fonction pour obtenir la date minimale (aujourd'hui)
  const getMinDate = () => {
    return getTodayDate();
  };

  // Fonction pour obtenir la date maximale (1 an dans le futur)
  const getMaxDate = () => {
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    return nextYear.toISOString().split('T')[0];
  };

  const [newPub, setNewPub] = useState({
    titre: "",
    contenu: "",
    type: "Article",
    date_publication: getTodayDate(),
    source: "",
    categorie: "",
    statut: "Validé",
    fichier: null,
    type_fichier: "image",
    auteur: "Admin",
    id_utilisateur: null
  });

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    return () => {
      if (previewFile?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(previewFile.url);
      }
      publications.forEach(pub => {
        if (pub.fichier_url?.startsWith('blob:')) {
          URL.revokeObjectURL(pub.fichier_url);
        }
      });
    };
  }, [previewFile, publications]);

  // CHARGEMENT SÉCURISÉ DES PUBLICATIONS
  const loadPublications = async () => {
    try {
      setLoading(true);
      const res = await fetchPublications();

      // index() retourne un tableau, getPublicationsValidees() retourne { data: [...] }
      const pubs = Array.isArray(res.data)
        ? res.data
        : (res.data?.data || []);

      const validPubs = pubs
        .filter(pub => pub && pub.id_publication && typeof pub.id_publication === 'number')
        .map(pub => ({
          ...pub,
          date_publication: pub.date_publication || "",
          source: pub.source || "",
          categorie: pub.categorie || "",
          type_fichier: pub.type_fichier || "image",
          fichier_url: pub.fichier_url || null,
          nom_fichier_original: pub.nom_fichier_original || null,
          total_reactions: pub.total_reactions || 0,
          vues: pub.vues || 0,
          commentaires_count: pub.commentaires_count || 0
        }));

      setPublications(validPubs);
    } catch (err) {
      console.error("Erreur chargement publications:", err);
      showNotification("error", t('error_load'));
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
      const dateOnly = dateString.split(' ')[0];
      const date = new Date(dateOnly);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "date_publication") {
      if (value && !isValidDate(value)) {
        showNotification("error", t('date_cannot_be_in_past'));
        return;
      }
      setNewPub({ ...newPub, [name]: value });
    } else if (name === "fichier") {
      const file = files[0];
      setNewPub({ ...newPub, fichier: file });

      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({ url: fileURL, name: file.name, type: file.type });
        const fileType = getFileTypeFromFile(file);
        setNewPub(prev => ({ ...prev, type_fichier: fileType }));
      } else {
        setPreviewFile(null);
      }
    } else {
      setNewPub({ ...newPub, [name]: value });
    }
  };

  const handleFileTypeChange = (type) => {
    setNewPub({ ...newPub, type_fichier: type, fichier: null });
    setPreviewFile(null);
  };

  const getFileTypeFromFile = (file) => {
    if (!file) return 'image';
    const fileType = file.type;
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
  };

  // Fonction avec animation pour ajouter une publication
  const handleAddPublication = async () => {
    if (!isValidDate(newPub.date_publication)) {
      showNotification("error", t('date_cannot_be_in_past'));
      return;
    }

    if (!newPub.titre || !newPub.contenu || !newPub.categorie) {
      showNotification("error", t('fill_all_fields'));
      return;
    }

    try {
      setIsAdding(true);
      
      // Animation du bouton
      const publishBtn = document.querySelector('.publish-btn');
      if (publishBtn) {
        publishBtn.classList.add('clicked');
        setTimeout(() => {
          publishBtn.classList.remove('clicked');
        }, 300);
      }

      const formData = new FormData();
      formData.append("titre", newPub.titre);
      formData.append("contenu", newPub.contenu);
      formData.append("type", newPub.type);
      formData.append("date_publication", formatDateForAPI(newPub.date_publication));
      formData.append("source", newPub.source || "");
      formData.append("categorie", newPub.categorie || "");
      formData.append("statut", "Validé");
      formData.append("auteur", newPub.auteur);
      formData.append("id_utilisateur", newPub.id_utilisateur || "");
      formData.append("type_fichier", newPub.type_fichier);

      if (newPub.fichier) formData.append("fichier", newPub.fichier);

      const res = await addPublication(formData);

      const pubData = res.data?.data;
      if (!pubData?.id_publication) {
        throw new Error("ID de publication manquant dans la réponse");
      }

      const addedPub = {
        ...pubData,
        titre: newPub.titre,
        contenu: newPub.contenu,
        type: newPub.type,
        categorie: newPub.categorie,
        statut: "Validé",
        auteur: "Admin",
        date_publication: formatDateForAPI(newPub.date_publication),
        total_reactions: pubData.total_reactions || 0,
        vues: pubData.vues || 0,
        commentaires_count: pubData.commentaires_count || 0,
        fichier_url: newPub.fichier ? URL.createObjectURL(newPub.fichier) : pubData.fichier_url,
        nom_fichier_original: newPub.fichier?.name || pubData.nom_fichier_original
      };

      // Animation d'ajout réussie
      setPublications(prev => [addedPub, ...prev]);
      
      // Réinitialiser le formulaire
      setNewPub({
        titre: "", 
        contenu: "", 
        type: "Article", 
        date_publication: getTodayDate(),
        source: "", 
        categorie: "", 
        statut: "Validé", 
        fichier: null,
        type_fichier: "image", 
        auteur: "Admin", 
        id_utilisateur: null
      });
      setPreviewFile(null);
      
      // Fermer le modal
      setShowModal(false);
      setIsAdding(false);
      
      showNotification("success", t('success_add'));

    } catch (err) {
      console.error("Erreur ajout:", err.response?.data || err);
      showNotification("error", t('error_add') + ": " + (err.response?.data?.message || err.message));
      setIsAdding(false);
    }
  };

  // Fonction avec animation pour supprimer
  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirmation'))) return;
    
    try {
      setIsDeleting(true);
      
      // Trouver l'élément à supprimer
      const cardToDelete = document.querySelector(`[data-publication-id="${id}"]`);
      if (cardToDelete) {
        cardToDelete.style.transition = 'all 0.3s ease';
        cardToDelete.style.opacity = '0.5';
        cardToDelete.style.transform = 'scale(0.95)';
        
        // Attendre l'animation
        setTimeout(async () => {
          await deletePublication(id);
          setPublications(prev => prev.filter(pub => pub.id_publication !== id));
          showNotification("success", t('success_delete'));
          setIsDeleting(false);
        }, 300);
      } else {
        await deletePublication(id);
        setPublications(prev => prev.filter(pub => pub.id_publication !== id));
        showNotification("success", t('success_delete'));
        setIsDeleting(false);
      }
    } catch (err) {
      showNotification("error", t('error_delete'));
      setIsDeleting(false);
    }
  };

  const handleValidate = async (id) => {
    try {
      const validateBtn = document.querySelector(`[data-validate-id="${id}"]`);
      if (validateBtn) {
        validateBtn.classList.add('clicked');
        setTimeout(() => {
          validateBtn.classList.remove('clicked');
        }, 300);
      }
      
      await validatePublication(id);
      loadPublications();
      showNotification("success", t('success_validate'));
    } catch (err) {
      showNotification("error", t('error_validate'));
    }
  };

  const handleEditShow = (pub) => {
    if (!pub || !pub.id_publication || typeof pub.id_publication !== 'number') {
      showNotification("error", t('invalid_publication'));
      return;
    }
    
    const pubDate = pub.date_publication ? formatDateForInput(pub.date_publication) : getTodayDate();
    const shouldUseTodayDate = pubDate && !isValidDate(pubDate);
    
    setSelectedPub({
      ...pub,
      date_publication: shouldUseTodayDate ? getTodayDate() : pubDate,
      source: pub.source || "",
      categorie: pub.categorie || "",
      type_fichier: pub.type_fichier || "image",
      fichier_url: pub.fichier_url || null,
      nom_fichier_original: pub.nom_fichier_original || null
    });
    setEditModal(true);
    setPreviewFile(null);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === "date_publication") {
      if (value && !isValidDate(value)) {
        showNotification("error", t('date_cannot_be_in_past'));
        return;
      }
      setSelectedPub({ ...selectedPub, [name]: value });
    } else if (name === "fichier") {
      const file = files[0];
      setSelectedPub({ ...selectedPub, fichier: file });

      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({ url: fileURL, name: file.name, type: file.type });
        const fileType = getFileTypeFromFile(file);
        setSelectedPub(prev => ({ ...prev, type_fichier: fileType }));
      } else {
        setPreviewFile(null);
      }
    } else {
      setSelectedPub({ ...selectedPub, [name]: value });
    }
  };

  const handleEditFileTypeChange = (type) => {
    setSelectedPub({ ...selectedPub, type_fichier: type, fichier: null });
    setPreviewFile(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedPub?.id_publication) {
      showNotification("error", t('missing_publication_id'));
      return;
    }

    if (!isValidDate(selectedPub.date_publication)) {
      showNotification("error", t('date_cannot_be_in_past'));
      return;
    }

    try {
      setIsEditing(true);
      
      const saveBtn = document.querySelector('.save-btn');
      if (saveBtn) {
        saveBtn.classList.add('clicked');
        setTimeout(() => {
          saveBtn.classList.remove('clicked');
        }, 300);
      }

      const formData = new FormData();
      formData.append("titre", selectedPub.titre);
      formData.append("contenu", selectedPub.contenu);
      formData.append("type", selectedPub.type);
      formData.append("date_publication", formatDateForAPI(selectedPub.date_publication));
      formData.append("source", selectedPub.source || "");
      formData.append("categorie", selectedPub.categorie || "");
      formData.append("statut", "Validé");
      formData.append("auteur", selectedPub.auteur);
      formData.append("id_utilisateur", selectedPub.id_utilisateur || "");
      formData.append("type_fichier", selectedPub.type_fichier);

      if (selectedPub.fichier && selectedPub.fichier instanceof File) {
        formData.append("fichier", selectedPub.fichier);
      }

      const res = await updatePublication(selectedPub.id_publication, formData);

      const pubData = res.data?.data || res.data;
      const updatedPub = {
        ...pubData,
        id_publication: selectedPub.id_publication,
        titre: selectedPub.titre,
        contenu: selectedPub.contenu,
        type: selectedPub.type,
        categorie: selectedPub.categorie,
        type_fichier: selectedPub.type_fichier,
        fichier_url: selectedPub.fichier instanceof File
          ? URL.createObjectURL(selectedPub.fichier)
          : selectedPub.fichier_url,
        nom_fichier_original: selectedPub.fichier?.name || selectedPub.nom_fichier_original,
        date_publication: formatDateForInput(selectedPub.date_publication),
        total_reactions: pubData.total_reactions || selectedPub.total_reactions || 0,
        vues: pubData.vues || selectedPub.vues || 0,
        commentaires_count: pubData.commentaires_count || selectedPub.commentaires_count || 0
      };

      // Mettre à jour la publication
      setPublications(prev => prev.map(pub =>
        pub.id_publication === selectedPub.id_publication ? updatedPub : pub
      ));

      setEditModal(false);
      setPreviewFile(null);
      setIsEditing(false);
      showNotification("success", t('success_edit'));
      
    } catch (err) {
      console.error("Erreur modification:", err.response || err);
      showNotification("error", t('error_edit') + ": " + (err.response?.data?.message || err.message));
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
      case "Article": return "fa-file-alt";
      case "Annonce": return "fa-bullhorn";
      default: return "fa-file";
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

  const displayFile = (pub) => {
    if (!pub) return null;
    if (pub.fichier_url && pub.fichier_url.startsWith('blob:')) return pub.fichier_url;
    if (pub.fichier_url && typeof pub.fichier_url === 'string') return pub.fichier_url;
    if (pub.fichier && typeof pub.fichier === 'string') {
      if (pub.fichier.startsWith('http')) return pub.fichier;
      return `/storage/${pub.fichier}`;
    }
    return null;
  };

  const getFileType = (pub) => {
    if (!pub) return 'document';
    if (pub.type_fichier) return pub.type_fichier;
    const fileUrl = displayFile(pub);
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

  const handleDownloadFile = async (pub) => {
    try {
      const fileUrl = displayFile(pub);
      if (!fileUrl) throw new Error("URL manquante");

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pub.nom_fichier_original || 'fichier';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
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
        <h6 className="mb-3">{t('preview_file')}</h6>
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
            <p className="small text-muted">{t('preview_not_available')}</p>
          </div>
        )}
      </div>
    );
  };

  const filteredPubs = publications.filter((pub) => {
    const matchesSearch = pub.titre?.toLowerCase().includes(search.toLowerCase()) ||
                         pub.contenu?.toLowerCase().includes(search.toLowerCase()) ||
                         pub.categorie?.toLowerCase().includes(search.toLowerCase());
    const matchesStatut = filterStatut === "Tous" || pub.statut === filterStatut;
    const matchesType = filterType === "Tous" || pub.type === filterType;
    return matchesSearch && matchesStatut && matchesType;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterStatut("Tous");
    setFilterType("Tous");
    setCurrentPage(0);
  };

  // Calculer les variables pour la pagination
  const cardsPerPage = 4;
  const totalPages = Math.ceil(filteredPubs.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentPublications = filteredPubs.slice(startIndex, endIndex);

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
  }, [search, filterStatut, filterType]);

  // Fonction pour ouvrir le modal avec animation
  const openAddModal = () => {
    setShowModal(true);
    // Réinitialiser le formulaire
    setNewPub({
      titre: "",
      contenu: "",
      type: "Article",
      date_publication: getTodayDate(),
      source: "",
      categorie: "",
      statut: "Validé",
      fichier: null,
      type_fichier: "image",
      auteur: "Admin",
      id_utilisateur: null
    });
    setPreviewFile(null);
  };

  // Composant pour l'affichage en mode grille avec pagination
  const GridView = () => (
    <div ref={scrollContainerRef}>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h6 className="text-muted mb-0">
            Affichage {startIndex + 1} à {Math.min(endIndex, filteredPubs.length)} sur {filteredPubs.length} publications
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
        {currentPublications.map((pub) => {
          const fileUrl = displayFile(pub);
          const fileType = getFileType(pub);

          return (
            <Col md={3} key={pub.id_publication} className="mb-4">
              <Card 
                className="border-0 shadow-sm h-100 publication-card"
                style={{ borderRadius: "20px" }}
                data-publication-id={pub.id_publication}
              >
                {fileUrl ? (
                  <div style={{ position: "relative" }}>
                    {fileType === 'image' ? (
                      <Card.Img variant="top" src={fileUrl} style={{ height: "200px", objectFit: "cover", borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}
                        onError={(e) => { e.target.style.display = 'none'; }} />
                    ) : fileType === 'video' ? (
                      <div style={{ height: "200px", background: "#000", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <video src={fileUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} controls muted />
                      </div>
                    ) : (
                      <div style={{ height: "200px", background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                        <i className={`fas ${getFileIcon(pub.nom_fichier_original)} fa-4x text-muted mb-3`}></i>
                        <p className="small text-muted text-center">{pub.nom_fichier_original || "Document"}</p>
                        <Badge bg="secondary" className="mt-2">PDF</Badge>
                      </div>
                    )}
                    <Badge bg={getStatusVariant(pub.statut)} className="position-absolute top-0 end-0 m-3" style={{ borderRadius: "20px", padding: "6px 12px" }}>
                      <i className={`fas ${pub.statut === "Validé" ? "fa-check" : pub.statut === "En attente" ? "fa-clock" : pub.statut === "Brouillon" ? "fa-edit" : "fa-times"} me-1`}></i>
                      {t(pub.statut)}
                    </Badge>
                  </div>
                ) : (
                  <div style={{ height: "200px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                    <div className="text-center text-white">
                      <i className={`fas ${getTypeIcon(pub.type)} fs-1 mb-2 d-block`}></i>
                      <small>{t('no_file')}</small>
                    </div>
                    <Badge bg={getStatusVariant(pub.statut)} className="position-absolute top-0 end-0 m-3" style={{ borderRadius: "20px", padding: "6px 12px" }}>
                      <i className={`fas ${pub.statut === "Validé" ? "fa-check" : "fa-clock"} me-1`}></i>
                      {t(pub.statut)}
                    </Badge>
                  </div>
                )}
                <Card.Body className="d-flex flex-column">
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2">
                      <i className={`fas ${getTypeIcon(pub.type)} text-primary me-2`}></i>
                      <Badge bg="light" text="dark" style={{ borderRadius: "15px", fontSize: "0.7rem" }}>{t(pub.type.toLowerCase())}</Badge>
                      {pub.categorie && <Badge bg="outline-primary" text="primary" style={{ borderRadius: "15px", fontSize: "0.7rem", marginLeft: "5px" }}>{pub.categorie}</Badge>}
                    </div>
                    <Card.Title className="h5 fw-bold">{pub.titre}</Card.Title>
                  </div>
                  <Card.Text className="text-muted flex-grow-1">{pub.contenu?.length > 120 ? `${pub.contenu.substring(0, 120)}...` : pub.contenu}</Card.Text>
                  <div className="mt-auto">
                    <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                      <div>
                        <i className="fas fa-calendar me-1"></i>
                        {formatDate(pub.date_publication)}
                        {!isValidDate(pub.date_publication) && (
                          <Badge bg="warning" text="dark" className="ms-2" style={{ fontSize: "0.6rem" }}>
                            <i className="fas fa-clock me-1"></i>Passé
                          </Badge>
                        )}
                      </div>
                      <div><i className="fas fa-user me-1"></i>{pub.auteur || "Admin"}</div>
                    </div>
                    {fileUrl && (
                      <div className="mb-3 p-2 border rounded" style={{ background: '#f8f9fa' }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex align-items-center">
                            <i className={`fas ${getFileIcon(pub.nom_fichier_original)} text-${getFileBadgeVariant(pub.nom_fichier_original)} me-2`}></i>
                            <span className="small">{pub.nom_fichier_original || t('attached_file')}</span>
                          </div>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleDownloadFile(pub)} 
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
                          overlay={<Tooltip id={`tooltip-heart-${pub.id_publication}`}>Réactions</Tooltip>}
                        >
                          <span>
                            <i className="fas fa-heart me-1 text-danger"></i>{pub.total_reactions || 0}
                          </span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-eye-${pub.id_publication}`}>Vues</Tooltip>}
                        >
                          <span>
                            <i className="fas fa-eye me-1 text-primary"></i>{pub.vues || 0}
                          </span>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-comment-${pub.id_publication}`}>Commentaires</Tooltip>}
                        >
                          <span>
                            <i className="fas fa-comment me-1 text-success"></i>{pub.commentaires_count || 0}
                          </span>
                        </OverlayTrigger>
                      </div>
                      <div className="d-flex gap-1">
                        {pub.statut === "En attente" && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`tooltip-validate-${pub.id_publication}`}>Valider</Tooltip>}
                          >
                            <Button 
                              variant="success" 
                              size="sm" 
                              onClick={() => handleValidate(pub.id_publication)} 
                              style={{ borderRadius: "8px" }}
                              data-validate-id={pub.id_publication}
                              className="action-btn"
                            >
                              <i className="fas fa-check"></i>
                            </Button>
                          </OverlayTrigger>
                        )}
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-edit-${pub.id_publication}`}>Modifier</Tooltip>}
                        >
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            onClick={() => handleEditShow(pub)} 
                            style={{ borderRadius: "8px" }}
                            className="action-btn"
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-delete-${pub.id_publication}`}>Supprimer</Tooltip>}
                        >
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDelete(pub.id_publication)} 
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
              className="d-flex align-items-center"
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
              className="d-flex align-items-center"
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
          {filteredPubs.length} publication(s) trouvée(s)
        </h6>
      </div>
      
      <ListGroup variant="flush">
        {filteredPubs.map((pub) => {
          const fileUrl = displayFile(pub);
          const fileType = getFileType(pub);

          return (
            <ListGroup.Item 
              key={pub.id_publication}
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
                        alt={pub.titre}
                        className="rounded-2"
                        style={{ width: '120px', height: '90px', objectFit: 'cover' }}
                      />
                    ) : (
                      <div className="d-flex align-items-center justify-content-center rounded-2 bg-light"
                        style={{ width: '120px', height: '90px' }}>
                        <i className={`fas ${getFileIcon(pub.nom_fichier_original)} fa-2x text-muted`}></i>
                      </div>
                    )
                  ) : (
                    <div className="d-flex align-items-center justify-content-center rounded-2"
                      style={{ 
                        width: '120px', 
                        height: '90px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                      <i className={`fas ${getTypeIcon(pub.type)} fa-2x text-white`}></i>
                    </div>
                  )}
                </div>

                {/* Colonne centrale : Contenu */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{pub.titre}</h5>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <Badge bg="light" text="dark" className="py-1 px-2" style={{ fontSize: '0.7rem' }}>
                          <i className={`fas ${getTypeIcon(pub.type)} me-1`}></i>
                          {t(pub.type.toLowerCase())}
                        </Badge>
                        {pub.categorie && (
                          <Badge bg="outline-primary" text="primary" className="py-1 px-2" style={{ fontSize: '0.7rem' }}>
                            {pub.categorie}
                          </Badge>
                        )}
                        <Badge bg={getStatusVariant(pub.statut)} className="py-1 px-2" style={{ fontSize: '0.7rem' }}>
                          <i className={`fas ${getStatusIcon(pub.statut)} me-1`}></i>
                          {t(pub.statut)}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-muted small text-end">
                      <div><i className="fas fa-calendar me-1"></i>{formatDate(pub.date_publication)}</div>
                      <div><i className="fas fa-user me-1"></i>{pub.auteur || "Admin"}</div>
                    </div>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                    {pub.contenu?.length > 200 ? `${pub.contenu.substring(0, 200)}...` : pub.contenu}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex gap-3 text-muted small">
                      <span title="Réactions">
                        <i className="fas fa-heart me-1 text-danger"></i>{pub.total_reactions || 0}
                      </span>
                      <span title="Vues">
                        <i className="fas fa-eye me-1 text-primary"></i>{pub.vues || 0}
                      </span>
                      <span title="Commentaires">
                        <i className="fas fa-comment me-1 text-success"></i>{pub.commentaires_count || 0}
                      </span>
                      {fileUrl && (
                        <span 
                          className="text-primary" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => handleDownloadFile(pub)}
                          role="button"
                        >
                          <i className="fas fa-download me-1"></i>{t('download')}
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex gap-1">
                      {pub.statut === "En attente" && (
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id={`tooltip-validate-list-${pub.id_publication}`}>Valider</Tooltip>}
                        >
                          <Button variant="success" size="sm" onClick={() => handleValidate(pub.id_publication)} style={{ borderRadius: "8px" }}>
                            <i className="fas fa-check"></i>
                          </Button>
                        </OverlayTrigger>
                      )}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-edit-list-${pub.id_publication}`}>Modifier</Tooltip>}
                      >
                        <Button variant="outline-warning" size="sm" onClick={() => handleEditShow(pub)} style={{ borderRadius: "8px" }}>
                          <i className="fas fa-edit"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`tooltip-delete-list-${pub.id_publication}`}>Supprimer</Tooltip>}
                      >
                        <Button variant="outline-danger" size="sm" onClick={() => handleDelete(pub.id_publication)} style={{ borderRadius: "8px" }}>
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
          <Alert variant={showAlert.type === "success" ? "success" : "danger"} className="d-flex align-items-center shadow-lg border-0"
            style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, minWidth: "350px", borderRadius: "15px", borderLeft: `4px solid ${showAlert.type === "success" ? "#28a745" : "#dc3545"}`, backdropFilter: "blur(10px)", backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
            <i className={`fas ${showAlert.type === "success" ? "fa-check-circle text-success" : "fa-exclamation-triangle text-danger"} me-3 fs-5`}></i>
            <div>
              <strong className="d-block">{showAlert.type === "success" ? t('success') : t('error')}</strong>
              <span className="text-muted">{showAlert.message}</span>
            </div>
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ background: "linear-gradient(135deg, #2c3e50, #34495e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t('publication_management_title')}
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center"><i className="fas fa-newspaper me-2"></i>{t('publication_management_subtitle')}</p>
          </div>
          <Button 
            variant="success" 
            onClick={openAddModal} 
            className="d-flex align-items-center shadow-sm add-publication-btn"
            style={{ background: "linear-gradient(135deg, #00b09b, #96c93d)", border: "none", borderRadius: "12px", padding: "12px 24px", fontWeight: "600" }}
          >
            <i className="fas fa-plus me-2"></i>{t('new_publication_button')}
          </Button>
        </div>

        <Row className="mb-4">
          {[
            { id: "total", title: "total_publications", count: publications.length, icon: "fa-newspaper", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
            { id: "files", title: "with_files", count: publications.filter(p => displayFile(p)).length, icon: "fa-paperclip", color: "linear-gradient(135deg, #00b09b, #96c93d)" },
            { id: "videos", title: "videos", count: publications.filter(p => getFileType(p) === 'video').length, icon: "fa-video", color: "linear-gradient(135deg, #f093fb, #f5576c)" },
            { id: "images", title: "images", count: publications.filter(p => getFileType(p) === 'image').length, icon: "fa-image", color: "linear-gradient(135deg, #fd746c, #ff9068)" }
          ].map((stat) => (
            <Col md={3} key={stat.id} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2">{t(stat.title)}</h6>
                      <h2 className="fw-bold mb-0" style={{ background: stat.color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.count}</h2>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", background: stat.color }}>
                      <i className={`fas ${stat.icon} text-white fs-4`}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-search me-2"></i>{t('search')}</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", color: "white" }}><i className="fas fa-search"></i></InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      placeholder={t('search_placeholder')} 
                      value={search} 
                      onChange={(e) => setSearch(e.target.value)} 
                      style={{ borderRadius: "0 10px 10px 0" }} 
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-filter me-2"></i>{t('status_filter')}</Form.Label>
                  <Form.Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} style={{ borderRadius: "10px" }}>
                    <option value="Tous">{t('all_status')}</option>
                    <option value="Validé">{t('Validé')}</option>
                    <option value="En attente">{t('En attente')}</option>
                    <option value="Brouillon">{t('Brouillon')}</option>
                    <option value="Rejeté">{t('Rejeté')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-tag me-2"></i>{t('type_filter')}</Form.Label>
                  <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ borderRadius: "10px" }}>
                    <option value="Tous">{t('all_types')}</option>
                    <option value="Article">{t('article')}</option>
                    <option value="Annonce">{t('announcement')}</option>
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
                    <Button variant="outline-primary" onClick={loadPublications} style={{ borderRadius: "10px" }}><i className="fas fa-refresh"></i></Button>
                    <Button variant="outline-secondary" onClick={clearFilters} style={{ borderRadius: "10px" }}><i className="fas fa-times"></i></Button>
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
            <p className="text-muted fw-semibold">{t('loading_publications')}</p>
          </div>
        ) : filteredPubs.length > 0 ? (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                  <i className={`fas ${viewMode === 'grid' ? 'fa-th-large' : 'fa-list'} me-2`}></i>
                  {viewMode === 'grid' ? t('grid_view') : t('list_view')}
                  <Badge bg="primary" className="ms-2">{filteredPubs.length}</Badge>
                </h5>
              </div>
              {viewMode === 'grid' && filteredPubs.length > 4 && (
                <div className="d-flex align-items-center gap-3 text-muted small">
                  <i className="fas fa-info-circle"></i>
                  <span>Affichage de 4 publications par page - Utilisez les flèches pour naviguer</span>
                </div>
              )}
            </div>

            {viewMode === "grid" ? <GridView /> : <ListView />}
          </div>
        ) : (
          <Card className="border-0 shadow-sm text-center" style={{ borderRadius: "20px" }}>
            <Card.Body className="py-5">
              <i className="fas fa-newspaper fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
              <h5 className="text-muted mb-2">{t('no_publications_found')}</h5>
              <Button variant="primary" onClick={clearFilters} className="d-flex align-items-center mx-auto">
                <i className="fas fa-times me-2"></i>{t('clear_filters')}
              </Button>
            </Card.Body>
          </Card>
        )}

        {/* Modal Ajout de Publication - CORRIGÉ */}
        <Modal 
          show={showModal} 
          onHide={() => { 
            setShowModal(false); 
            setPreviewFile(null); 
          }} 
          size="lg" 
          centered
          ref={modalRef}
        >
          <Modal.Header closeButton className="border-0" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
            <Modal.Title className="d-flex align-items-center fw-bold">
              <i className="fas fa-plus me-2"></i>{t('add_publication_modal')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-heading me-2 text-primary"></i>{t('publication_title')} *</Form.Label>
                    <Form.Control 
                      type="text" 
                      name="titre" 
                      value={newPub.titre} 
                      onChange={handleChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }} 
                      placeholder={t('publication_title_placeholder')}
                    />
                    {!newPub.titre && <Form.Text className="text-danger">Ce champ est requis</Form.Text>}
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-chart-line me-2 text-primary"></i>{t('status_label')}</Form.Label>
                    <Form.Control 
                      type="text" 
                      value={t('Validé')} 
                      disabled 
                      style={{ borderRadius: "10px", padding: "12px", background: "#e9ecef" }} 
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted"><i className="fas fa-align-left me-2 text-primary"></i>{t('content_label')} *</Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={5} 
                  name="contenu" 
                  value={newPub.contenu} 
                  onChange={handleChange} 
                  required 
                  style={{ borderRadius: "10px", padding: "12px" }} 
                  placeholder={t('content_placeholder')}
                />
                {!newPub.contenu && <Form.Text className="text-danger">Ce champ est requis</Form.Text>}
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-tag me-2 text-primary"></i>{t('type_label')}</Form.Label>
                    <Form.Select 
                      name="type" 
                      value={newPub.type} 
                      onChange={handleChange} 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="Article">{t('article')}</option>
                      <option value="Annonce">{t('announcement')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-folder me-2 text-primary"></i>{t('category_label')} *</Form.Label>
                    <Form.Select 
                      name="categorie" 
                      value={newPub.categorie} 
                      onChange={handleChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="">{t('select_category')}</option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                    {!newPub.categorie && <Form.Text className="text-danger">Veuillez sélectionner une catégorie</Form.Text>}
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-paperclip me-2 text-primary"></i>{t('file_type_label')}
                    </Form.Label>
                    <div className="d-flex gap-2">
                      {['image', 'video', 'document'].map(fileType => (
                        <Button
                          key={fileType}
                          variant={newPub.type_fichier === fileType ? 'primary' : 'outline-primary'}
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
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-calendar me-2 text-primary"></i>
                      {t('publication_date')}
                    </Form.Label>
                    <Form.Control 
                      type="date" 
                      name="date_publication" 
                      value={newPub.date_publication} 
                      onChange={handleChange} 
                      min={getMinDate()}
                      max={getMaxDate()}
                      style={{ borderRadius: "10px", padding: "12px" }} 
                    />
                    <Form.Text className="text-muted small d-block mt-1">
                      <i className="fas fa-info-circle me-1"></i>
                      {t('date_validation_info')}
                    </Form.Text>
                    {newPub.date_publication && !isValidDate(newPub.date_publication) && (
                      <Form.Text className="text-danger small d-block mt-1">
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        {t('date_cannot_be_in_past')}
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className={`fas ${newPub.type_fichier === 'video' ? 'fa-video' : newPub.type_fichier === 'document' ? 'fa-file' : 'fa-image'} me-2 text-primary`}></i>
                  {t('file_label')} {newPub.type_fichier === 'video' ? t('video') : newPub.type_fichier === 'document' ? t('document') : t('image')}
                </Form.Label>
                <Form.Control
                  type="file"
                  name="fichier"
                  accept={newPub.type_fichier === 'video' ? "video/*" : newPub.type_fichier === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" : "image/*"}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", padding: "12px" }}
                />
                <Form.Text className="text-muted small d-block mt-1">
                  <i className="fas fa-info-circle me-1"></i>
                  Taille maximale : 10MB
                </Form.Text>
              </Form.Group>
              <FilePreview file={previewFile} />
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted"><i className="fas fa-link me-2 text-primary"></i>{t('source_label')}</Form.Label>
                <Form.Control 
                  type="text" 
                  name="source" 
                  value={newPub.source} 
                  onChange={handleChange} 
                  style={{ borderRadius: "10px", padding: "12px" }} 
                  placeholder={t('source_placeholder')}
                />
              </Form.Group>
              <div className="alert alert-info d-flex align-items-center" role="alert">
                <i className="fas fa-info-circle me-2"></i>
                <div>
                  <strong>Note :</strong> Les champs marqués d'un * sont obligatoires.
                  La date de publication doit être aujourd'hui ou une date future.
                </div>
              </div>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={() => { setShowModal(false); setPreviewFile(null); }} 
              style={{ borderRadius: "10px", padding: "10px 20px" }}
              disabled={isAdding}
            >
              <i className="fas fa-times me-2"></i>{t('cancel_button')}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddPublication} 
              disabled={!isValidDate(newPub.date_publication) || !newPub.titre || !newPub.contenu || !newPub.categorie || isAdding}
              style={{ borderRadius: "10px", padding: "10px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none" }}
              className="publish-btn"
            >
              {isAdding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Publication en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>{t('publish_button')}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Modifier */}
        {selectedPub && (
          <Modal show={editModal} onHide={() => { setEditModal(false); setPreviewFile(null); }} size="lg" centered>
            <Modal.Header closeButton className="border-0" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
              <Modal.Title className="d-flex align-items-center fw-bold">
                <i className="fas fa-edit me-2"></i>{t('edit_publication_modal')}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-heading me-2 text-primary"></i>{t('publication_title')} *</Form.Label>
                      <Form.Control type="text" name="titre" value={selectedPub.titre} onChange={handleEditChange} required style={{ borderRadius: "10px", padding: "12px" }} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-chart-line me-2 text-primary"></i>{t('status_label')}</Form.Label>
                      <Form.Control type="text" value={t('Validé')} disabled style={{ borderRadius: "10px", padding: "12px", background: "#e9ecef" }} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted"><i className="fas fa-align-left me-2 text-primary"></i>{t('content_label')} *</Form.Label>
                  <Form.Control as="textarea" rows={5} name="contenu" value={selectedPub.contenu} onChange={handleEditChange} required style={{ borderRadius: "10px", padding: "12px" }} />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-tag me-2 text-primary"></i>{t('type_label')}</Form.Label>
                      <Form.Select name="type" value={selectedPub.type} onChange={handleEditChange} style={{ borderRadius: "10px", padding: "12px" }}>
                        <option value="Article">{t('article')}</option>
                        <option value="Annonce">{t('announcement')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-folder me-2 text-primary"></i>{t('category_label')} *</Form.Label>
                      <Form.Select name="categorie" value={selectedPub.categorie} onChange={handleEditChange} required style={{ borderRadius: "10px", padding: "12px" }}>
                        <option value="">{t('select_category')}</option>
                        {categories.map((cat, i) => (
                          <option key={i} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-paperclip me-2 text-primary"></i>{t('file_type_label')}
                      </Form.Label>
                      <div className="d-flex gap-2">
                        {['image', 'video', 'document'].map(fileType => (
                          <Button
                            key={fileType}
                            variant={selectedPub.type_fichier === fileType ? 'primary' : 'outline-primary'}
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
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-calendar me-2 text-primary"></i>
                        {t('publication_date')}
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="date_publication"
                        value={formatDateForInput(selectedPub.date_publication)}
                        onChange={handleEditChange}
                        min={getMinDate()}
                        max={getMaxDate()}
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                      <Form.Text className="text-muted small d-block mt-1">
                        <i className="fas fa-info-circle me-1"></i>
                        {t('date_validation_info')}
                      </Form.Text>
                      {selectedPub.date_publication && !isValidDate(selectedPub.date_publication) && (
                        <Form.Text className="text-danger small d-block mt-1">
                          <i className="fas fa-exclamation-triangle me-1"></i>
                          {t('date_cannot_be_in_past')}
                        </Form.Text>
                      )}
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className={`fas ${selectedPub.type_fichier === 'video' ? 'fa-video' : selectedPub.type_fichier === 'document' ? 'fa-file' : 'fa-image'} me-2 text-primary`}></i>
                    {t('file_label')} {selectedPub.type_fichier === 'video' ? t('video') : selectedPub.type_fichier === 'document' ? t('document') : t('image')}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="fichier"
                    accept={selectedPub.type_fichier === 'video' ? "video/*" : selectedPub.type_fichier === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" : "image/*"}
                    onChange={handleEditChange}
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                  {selectedPub.fichier && !previewFile && (
                    <div className="mt-2">
                      <small className="text-muted d-block">
                        <i className="fas fa-file me-1"></i>{t('current_file')}: {selectedPub.nom_fichier_original || t('attached_file')}
                      </small>
                      <Button variant="outline-primary" size="sm" onClick={() => handleDownloadFile(selectedPub)} style={{ borderRadius: "6px", fontSize: "0.7rem" }} className="mt-1">
                        <i className="fas fa-download me-1"></i>{t('download')}
                      </Button>
                    </div>
                  )}
                </Form.Group>
                <FilePreview file={previewFile} />
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted"><i className="fas fa-link me-2 text-primary"></i>{t('source_label')}</Form.Label>
                  <Form.Control type="text" name="source" value={selectedPub.source} onChange={handleEditChange} style={{ borderRadius: "10px", padding: "12px" }} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="outline-secondary" onClick={() => { setEditModal(false); setPreviewFile(null); }} style={{ borderRadius: "10px", padding: "10px 20px" }}>
                <i className="fas fa-times me-2"></i>{t('cancel_button')}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveEdit} 
                disabled={!isValidDate(selectedPub.date_publication) || !selectedPub.titre || !selectedPub.contenu || !selectedPub.categorie || isEditing}
                style={{ borderRadius: "10px", padding: "10px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none" }}
                className="save-btn"
              >
                {isEditing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Enregistrement...
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
          
          /* Animation pour le modal de publication */
          .modal.fade .modal-dialog {
            transform: translateY(-50px);
            opacity: 0;
            transition: all 0.3s ease-out;
          }
          
          .modal.show .modal-dialog {
            transform: translateY(0);
            opacity: 1;
          }
          
          /* Animation pour les cartes */
          .publication-card {
            transition: all 0.3s ease;
          }
          
          .publication-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1);
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
          
          /* Animation pour le bouton d'ajout */
          .add-publication-btn:hover {
            animation: pulse 1s infinite;
          }
          
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          
          .list-view-item {
            transition: all 0.2s ease;
          }
          
          .list-view-item:hover {
            background-color: #f8f9fa;
          }
          
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
          .alert {
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
          
          /* Animation pour les pages */
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
        `}</style>

      </div>
    </div>
  );
};

export default Publication;