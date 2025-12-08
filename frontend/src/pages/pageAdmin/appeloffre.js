import React, { useState, useEffect, useRef } from "react";
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
  Spinner,
  ButtonGroup,
  Tooltip,
  OverlayTrigger,
  ListGroup
} from "react-bootstrap";
import { apiClient } from "../../services/api";
import { useTranslation } from "react-i18next";

const AppelOffreAdmin = () => {
  const { t } = useTranslation();

  const [appelOffres, setAppelOffres] = useState([]);
  const [membres, setMembres] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [search, setSearch] = useState("");
  const [filterStatut, setFilterStatut] = useState(t("all_status") || "Tous");
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [editOffre, setEditOffre] = useState(null);
  const [errors, setErrors] = useState({});
  const [statsLoading, setStatsLoading] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  
  // Nouvelles variables pour la pagination et le mode de vue
  const [viewMode, setViewMode] = useState("grid"); // "grid" ou "list"
  const [currentPage, setCurrentPage] = useState(0);
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Référence pour le conteneur de défilement
  const scrollContainerRef = useRef(null);
  const modalRef = useRef(null);

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
    statut: t("Validé") || "Validé",
    urgent: false,
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

  // Fonction pour obtenir la date d'aujourd'hui au format YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: "", message: "" }), 5000);
  };

  // Charger les statistiques d'une offre
  const fetchOffreStats = async (offreId) => {
    setStatsLoading((prev) => ({ ...prev, [offreId]: true }));
    try {
      const response = await apiClient.get(`/appeloffres/${offreId}/stats`);
      return response.data.stats || { total_views: 0, total_reactions: 0, reactions_by_type: {} };
    } catch (error) {
      console.warn(`Stats non disponibles pour l'offre ${offreId}`);
      return { total_views: 0, total_reactions: 0, reactions_by_type: {} };
    } finally {
      setStatsLoading((prev) => ({ ...prev, [offreId]: false }));
    }
  };

  // Charger toutes les offres
  const fetchAppelOffres = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get("/appeloffres");
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];

      const offresWithStats = await Promise.all(
        data.map(async (offre) => {
          if (offre.statut === t("Validé") || offre.statut === "Validé") {
            const stats = await fetchOffreStats(offre.id);
            return { ...offre, stats };
          }
          return offre;
        })
      );

      setAppelOffres(offresWithStats);
      setCurrentPage(0); // Réinitialiser la pagination après rechargement
    } catch (err) {
      showNotification("error", t("error_load"));
    } finally {
      setLoading(false);
    }
  };

  // Charger les membres
  const fetchMembres = async () => {
    try {
      const res = await apiClient.get("/membres");
      const membresData = res.data.data || res.data || [];
      setMembres(membresData);
      
      // Si aucun membre n'est trouvé, utiliser les membres par défaut
      if (membresData.length === 0) {
        setMembres([
          { id: 1, nom_entreprise: "Ministère du Transport", nom: "Admin", prenom: "Transport" },
          { id: 2, nom_entreprise: "Ministère de l'Éducation", nom: "Admin", prenom: "Education" },
          { id: 3, nom_entreprise: "Ministère de la Santé", nom: "Admin", prenom: "Santé" },
          { id: 4, nom_entreprise: "Commune Urbaine d'Antananarivo", nom: "Admin", prenom: "CUA" },
        ]);
      }
    } catch (err) {
      // Fallback en dur si API membres HS
      setMembres([
        { id: 1, nom_entreprise: "Ministère du Transport", nom: "Admin", prenom: "Transport" },
        { id: 2, nom_entreprise: "Ministère de l'Éducation", nom: "Admin", prenom: "Education" },
        { id: 3, nom_entreprise: "Ministère de la Santé", nom: "Admin", prenom: "Santé" },
        { id: 4, nom_entreprise: "Commune Urbaine d'Antananarivo", nom: "Admin", prenom: "CUA" },
      ]);
    }
  };

  useEffect(() => {
    fetchAppelOffres();
    fetchMembres();
  }, []);

  const handleCloseAdd = () => {
    setShowAddModal(false);
    setNewOffre({
      intitule: "", type: "", membre: "", localisation: "", salaire: "",
      date_ouverture: "", date_cloture: "", description: "", fichier: null,
      statut: t("Validé") || "Validé", urgent: false
    });
    setPreviewFile(null);
    setErrors({});
  };

  const handleCloseEdit = () => {
    setShowEditModal(false);
    setEditOffre(null);
    setPreviewFile(null);
    setErrors({});
  };

  const handleChange = (e, isEdit = false) => {
    const { name, value, files, type, checked } = e.target;
    const setState = isEdit ? setEditOffre : setNewOffre;
    const current = isEdit ? editOffre : newOffre;

    if (type === "file") {
      const file = files[0];
      setState({ ...current, fichier: file });
      if (file) {
        setPreviewFile({ url: URL.createObjectURL(file), name: file.name, type: file.type });
      } else {
        setPreviewFile(null);
      }
    } else if (type === "checkbox") {
      setState({ ...current, [name]: checked });
    } else {
      setState({ ...current, [name]: value });
    }

    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = (data) => {
    const newErrors = {};
    if (!data.intitule?.trim()) newErrors.intitule = t("title_required");
    if (!data.membre?.trim()) newErrors.membre = t("member_required");
    if (!data.date_cloture) newErrors.date_cloture = t("closing_date_required");
    if (!data.description?.trim()) newErrors.description = t("description_required");
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // AJOUT D'UNE OFFRE avec animation
  const handleAddOffre = async (e) => {
    e.preventDefault();
    if (!validateForm(newOffre)) {
      showNotification("error", t("fill_required_fields"));
      return;
    }

    setIsAdding(true);
    try {
      // Animation du bouton
      const addBtn = document.querySelector('.add-offre-btn');
      if (addBtn) {
        addBtn.classList.add('clicked');
        setTimeout(() => {
          addBtn.classList.remove('clicked');
        }, 300);
      }

      const formData = new FormData();
      Object.keys(newOffre).forEach((key) => {
        if (key === "fichier" && newOffre.fichier) {
          formData.append("fichier", newOffre.fichier);
        } else if (key === "urgent") {
          formData.append("urgent", newOffre.urgent ? "1" : "0");
        } else if (newOffre[key] !== null && newOffre[key] !== undefined && newOffre[key] !== "") {
          formData.append(key, newOffre[key]);
        }
      });

      const res = await apiClient.post("/appeloffres", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const addedOffre = res.data.data || res.data;
      
      // Ajouter l'offre avec animation
      setAppelOffres(prev => [addedOffre, ...prev]);
      showNotification("success", t("success_add"));
      handleCloseAdd();
    } catch (err) {
      showNotification("error", t("error_add"));
    } finally {
      setIsAdding(false);
    }
  };

  // OUVRIR MODAL ÉDITION
  const handleEditShow = (offre) => {
    setEditOffre({
      id: offre.id,
      intitule: offre.intitule || "",
      type: offre.type || "",
      membre: offre.membre || "",
      localisation: offre.localisation || "",
      salaire: offre.salaire || "",
      date_ouverture: offre.date_ouverture?.split("T")[0] || "",
      date_cloture: offre.date_cloture?.split("T")[0] || "",
      description: offre.description || "",
      fichier: offre.fichier || null,
      statut: offre.statut || t("Validé") || "Validé",
      urgent: Boolean(offre.urgent),
      stats: offre.stats || null,
      membre_nom: offre.membre_nom || "",
      membre_entreprise: offre.membre_entreprise || "",
    });
    setShowEditModal(true);
  };

  // SAUVEGARDER MODIFICATION avec animation
  const handleSaveEdit = async () => {
    if (!editOffre?.id || !validateForm(editOffre)) {
      showNotification("error", t("fix_errors"));
      return;
    }

    setIsEditing(true);
    try {
      // Animation du bouton
      const saveBtn = document.querySelector('.save-offre-btn');
      if (saveBtn) {
        saveBtn.classList.add('clicked');
        setTimeout(() => {
          saveBtn.classList.remove('clicked');
        }, 300);
      }

      const formData = new FormData();
      Object.keys(editOffre).forEach((key) => {
        if (key === "fichier" && editOffre.fichier instanceof File) {
          formData.append("fichier", editOffre.fichier);
        } else if (key !== "fichier" && key !== "stats" && key !== "id" && key !== "membre_nom" && key !== "membre_entreprise" && editOffre[key] !== null) {
          formData.append(key, editOffre[key]);
        }
      });
      formData.append("urgent", editOffre.urgent ? "1" : "0");
      formData.append("_method", "PUT");

      const res = await apiClient.post(`/appeloffres/${editOffre.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updated = res.data.data || res.data;
      setAppelOffres((prev) => prev.map((o) => (o.id === editOffre.id ? updated : o)));
      showNotification("success", t("success_edit"));
      handleCloseEdit();
    } catch (err) {
      showNotification("error", t("error_edit"));
    } finally {
      setIsEditing(false);
    }
  };

  // VALIDER / REJETER UNE OFFRE avec animation
  const handleValidateOffre = async (id, newStatus) => {
    setActionLoading(id);
    try {
      // Animation du bouton
      const actionBtn = document.querySelector(`[data-validate-id="${id}"]`);
      if (actionBtn) {
        actionBtn.classList.add('clicked');
        setTimeout(() => {
          actionBtn.classList.remove('clicked');
        }, 300);
      }

      const formData = new FormData();
      formData.append("statut", newStatus);
      formData.append("_method", "PUT");

      const res = await apiClient.post(`/appeloffres/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedOffre = res.data.data || res.data;

      if (newStatus === t("Validé") || newStatus === "Validé") {
        const stats = await fetchOffreStats(id);
        updatedOffre.stats = stats;
      }

      setAppelOffres((prev) => prev.map((o) => (o.id === id ? updatedOffre : o)));
      showNotification("success", newStatus === t("Validé") || newStatus === "Validé" ? t("success_validate") : t("offer_rejected"));
    } catch (err) {
      showNotification("error", t("action_failed"));
    } finally {
      setActionLoading(null);
    }
  };

  // SUPPRIMER avec animation
  const handleDelete = async (id) => {
    if (!window.confirm(t("delete_confirmation"))) return;
    
    try {
      setIsDeleting(true);
      
      // Trouver l'élément à supprimer
      const cardToDelete = document.querySelector(`[data-offre-id="${id}"]`);
      if (cardToDelete) {
        cardToDelete.style.transition = 'all 0.3s ease';
        cardToDelete.style.opacity = '0.5';
        cardToDelete.style.transform = 'scale(0.95)';
        
        // Attendre l'animation
        setTimeout(async () => {
          await apiClient.delete(`/appeloffres/${id}`);
          setAppelOffres((prev) => prev.filter((o) => o.id !== id));
          showNotification("success", t("success_delete"));
          setIsDeleting(false);
        }, 300);
      } else {
        await apiClient.delete(`/appeloffres/${id}`);
        setAppelOffres((prev) => prev.filter((o) => o.id !== id));
          showNotification("success", t("success_delete"));
          setIsDeleting(false);
      }
    } catch (err) {
      showNotification("error", t("error_delete"));
      setIsDeleting(false);
    }
  };

  // TÉLÉCHARGEMENT FICHIER
  const handleDownloadFile = async (fichierUrl, fileName) => {
    try {
      const downloadBtn = document.querySelector('.download-btn');
      if (downloadBtn) {
        downloadBtn.classList.add('clicked');
        setTimeout(() => {
          downloadBtn.classList.remove('clicked');
        }, 300);
      }

      const response = await fetch(fichierUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName || "document";
      a.click();
      window.URL.revokeObjectURL(url);
      showNotification("success", t("success_download"));
    } catch {
      showNotification("error", t("error_download"));
    }
  };

  // UTILITAIRES
  const getStatusVariant = (statut) => {
    const map = { 
      [t("Validé") || "Validé"]: "success", 
      [t("En attente") || "En attente"]: "warning", 
      [t("Rejeté") || "Rejeté"]: "danger" 
    };
    return map[statut] || "secondary";
  };

  const getStatusIcon = (statut) => {
    const map = { 
      [t("Validé") || "Validé"]: "fa-check-circle", 
      [t("En attente") || "En attente"]: "fa-clock", 
      [t("Rejeté") || "Rejeté"]: "fa-times-circle"
    };
    return map[statut] || "fa-question-circle";
  };

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString("fr-FR") : "-");

  const isExpired = (date) => date && new Date(date) < new Date();

  // Fonction pour obtenir le nom du membre
  const getMembreName = (membreId) => {
    if (!membreId) return t("administrator");
    
    const membre = membres.find((m) => m.id == membreId);
    if (membre) {
      if (membre.nom && membre.prenom) {
        return `${membre.prenom} ${membre.nom}`;
      } else if (membre.nom) {
        return membre.nom;
      } else if (membre.nom_entreprise) {
        return `${t("representative")} ${membre.nom_entreprise}`;
      } else if (membre.email) {
        return membre.email.split('@')[0];
      }
    }
    return `${t("member")} ${membreId}`;
  };

  // Fonction pour obtenir l'entreprise du membre
  const getMembreEntreprise = (membreId) => {
    if (!membreId) return t("system");
    
    const membre = membres.find((m) => m.id == membreId);
    if (membre) {
      return membre.nom_entreprise || t("no_member_found");
    }
    return t("system");
  };

  const getFileName = (url) => (url ? url.split("/").pop() : "");

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

  const totalVues = appelOffres.reduce((sum, o) => sum + (o.stats?.total_views || 0), 0);
  const totalReactions = appelOffres.reduce((sum, o) => sum + (o.stats?.total_reactions || 0), 0);

  const filteredOffres = appelOffres.filter((offre) => {
    const searchLower = search.toLowerCase();
    const matchesSearch =
      offre.intitule?.toLowerCase().includes(searchLower) ||
      offre.description?.toLowerCase().includes(searchLower) ||
      getMembreName(offre.membre)?.toLowerCase().includes(searchLower) ||
      getMembreEntreprise(offre.membre)?.toLowerCase().includes(searchLower);
    const matchesStatut = filterStatut === t("all_status") || filterStatut === "Tous" || offre.statut === filterStatut;
    return matchesSearch && matchesStatut;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterStatut(t("all_status") || "Tous");
    setCurrentPage(0);
  };

  // Toujours afficher exactement 4 offres par page (pas de pagination multiple)
  const cardsPerPage = 4;
  const totalPages = Math.ceil(filteredOffres.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = startIndex + cardsPerPage;
  const currentOffres = filteredOffres.slice(startIndex, endIndex);

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
      scrollToContainer();
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
      scrollToContainer();
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
  }, [search, filterStatut]);

  // Fonction pour ouvrir le modal avec animation
  const openAddModal = () => {
    setShowAddModal(true);
    // Réinitialiser le formulaire
    setNewOffre({
      intitule: "", type: "", membre: "", localisation: "", salaire: "",
      date_ouverture: "", date_cloture: "", description: "", fichier: null,
      statut: t("Validé") || "Validé", urgent: false
    });
    setPreviewFile(null);
  };

  // Composant pour l'affichage en mode grille avec 4 offres côte à côte
  const GridView = () => (
    <div ref={scrollContainerRef}>
      {/* Supprimer les informations de pagination du haut */}
      
      <Row className="g-3 mb-4" style={{ display: 'flex', flexWrap: 'nowrap', overflowX: 'auto' }}>
        {currentOffres.map((offre) => {
          const fileUrl = offre.fichier;
          const fileName = getFileName(offre.fichier);

          return (
            <Col xs={12} md={6} lg={3} key={offre.id} className="mb-0" style={{ flex: '1 0 25%', maxWidth: '25%' }}>
              <Card 
                className="border-0 shadow-sm offre-card"
                style={{ 
                  borderRadius: "20px",
                  transition: "transform 0.2s",
                  borderLeft: `4px solid ${
                    offre.urgent ? "#ff6b6b" : 
                    offre.statut === (t("Validé") || "Validé") ? "#28a745" : 
                    offre.statut === (t("En attente") || "En attente") ? "#ffc107" : 
                    offre.statut === (t("Rejeté") || "Rejeté") ? "#dc3545" : "#6c757d"
                  }`,
                  height: '100%',
                  minHeight: '550px',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                data-offre-id={offre.id}
              >
                <Card.Body className="d-flex flex-column p-3" style={{ flex: 1 }}>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div className="flex-grow-1">
                      <Card.Title className="h6 fw-bold mb-1" style={{ 
                        lineHeight: "1.3", 
                        color: "#2c3e50", 
                        fontSize: "0.9rem",
                        minHeight: "40px",
                        display: "-webkit-box",
                        WebkitLineClamp: "2",
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden"
                      }}>
                        {offre.intitule}
                        {offre.urgent && (
                          <Badge bg="danger" className="ms-1" style={{ fontSize: "0.6rem" }}>
                            <i className="fas fa-exclamation-triangle me-1"></i>{t("urgent")}
                          </Badge>
                        )}
                      </Card.Title>
                      {offre.type && (
                        <Badge bg="info" className="mb-1" style={{ fontSize: "0.65rem" }}>
                          {offre.type}
                        </Badge>
                      )}
                    </div>
                    <Badge 
                      bg={getStatusVariant(offre.statut)} 
                      className="d-flex align-items-center" 
                      style={{ 
                        borderRadius: "15px", 
                        padding: "4px 8px", 
                        fontSize: "0.6rem", 
                        fontWeight: "600",
                        flexShrink: 0
                      }}
                    >
                      <i className={`fas ${getStatusIcon(offre.statut)} me-1`}></i>
                      {offre.statut}
                    </Badge>
                  </div>

                  <Card.Text 
                    className="text-muted flex-grow-0 mb-2" 
                    style={{ 
                      lineHeight: "1.4", 
                      fontSize: "0.75rem",
                      minHeight: "60px",
                      maxHeight: "60px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: "3",
                      WebkitBoxOrient: "vertical"
                    }}
                  >
                    {offre.description}
                  </Card.Text>

                  <div className="small text-muted mb-2" style={{ flex: 1 }}>
                    {/* Section du créateur */}
                    <div className="mb-2 p-2 border rounded" style={{ 
                      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', 
                      fontSize: "0.7rem",
                      minHeight: "70px"
                    }}>
                      <div className="d-flex align-items-center mb-1">
                        <div className="rounded-circle d-flex align-items-center justify-content-center me-2" style={{ 
                          width: "28px", 
                          height: "28px", 
                          background: "linear-gradient(135deg, #667eea, #764ba2)",
                          flexShrink: 0
                        }}>
                          <i className="fas fa-user text-white" style={{ fontSize: "0.8rem" }}></i>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="fw-semibold text-dark" style={{ fontSize: "0.7rem" }}>{t("creator_section")}</div>
                          <div className="d-flex">
                            <Badge bg="primary" className="d-flex align-items-center text-truncate" style={{ 
                              fontSize: "0.6rem",
                              maxWidth: "100%"
                            }}>
                              <i className="fas fa-user me-1"></i>
                              <span className="text-truncate">{getMembreName(offre.membre)}</span>
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex align-items-center mt-1">
                        <i className="fas fa-calendar-alt me-1 text-muted" style={{ fontSize: "0.7rem" }}></i>
                        <span className="text-muted small" style={{ fontSize: "0.65rem" }}>
                          {t("publication_date")} {formatDate(offre.created_at || offre.date_creation || offre.date_ouverture)}
                        </span>
                      </div>
                    </div>
                    
                    <div style={{ minHeight: "120px" }}>
                      {offre.localisation && (
                        <div className="d-flex align-items-center mb-1" style={{ fontSize: "0.75rem", minHeight: "24px" }}>
                          <i className="fas fa-map-marker-alt text-primary me-1" style={{ fontSize: "0.8rem", width: "16px" }}></i>
                          <span className="text-truncate">{offre.localisation}</span>
                        </div>
                      )}
                      {offre.salaire && (
                        <div className="d-flex align-items-center mb-1" style={{ fontSize: "0.75rem", minHeight: "24px" }}>
                          <i className="fas fa-money-bill-wave text-primary me-1" style={{ fontSize: "0.8rem", width: "16px" }}></i>
                          <span className="text-truncate">{offre.salaire}</span>
                        </div>
                      )}
                      <div className="d-flex align-items-center mb-1" style={{ fontSize: "0.75rem", minHeight: "24px" }}>
                        <i className="fas fa-calendar-plus text-primary me-1" style={{ fontSize: "0.8rem", width: "16px" }}></i>
                        <span className="text-truncate">{t("opening")} {formatDate(offre.date_ouverture)}</span>
                      </div>
                      <div className="d-flex align-items-center mb-1" style={{ fontSize: "0.75rem", minHeight: "24px" }}>
                        <i className="fas fa-calendar-check text-primary me-1" style={{ fontSize: "0.8rem", width: "16px" }}></i>
                        <span className="text-truncate">
                          {t("closing")} {formatDate(offre.date_cloture)}
                          {isExpired(offre.date_cloture) && (
                            <Badge bg="danger" className="ms-1" style={{ fontSize: "0.55rem" }}>
                              {t("expired")}
                            </Badge>
                          )}
                        </span>
                      </div>
                    </div>

                    {fileUrl && (
                      <div className="mt-2 p-2 border rounded" style={{ 
                        background: '#f8f9fa', 
                        fontSize: "0.7rem",
                        minHeight: "70px"
                      }}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="d-flex align-items-center">
                            <i className={`fas ${getFileIcon(fileName)} text-${getFileBadgeVariant(fileName)} me-1`} style={{ fontSize: "0.8rem" }}></i>
                            <span className="small fw-semibold" style={{ fontSize: "0.7rem" }}>{t("document")}</span>
                          </div>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{t("download")}</Tooltip>}
                          >
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleDownloadFile(offre.fichier, fileName)} 
                              style={{ borderRadius: "6px", fontSize: "0.6rem", padding: "2px 6px" }}
                              className="download-btn"
                            >
                              <i className="fas fa-download me-1"></i>{t("download")}
                            </Button>
                          </OverlayTrigger>
                        </div>
                        <p className="small text-muted mb-1 text-truncate" style={{ fontSize: "0.65rem" }} title={fileName}>
                          {fileName}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Affichage des statistiques */}
                  {offre.stats && (
                    <div className="mt-2" style={{ flexShrink: 0 }}>
                      <div className="d-flex justify-content-between align-items-center small" style={{ fontSize: "0.7rem" }}>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-eye text-info me-1" style={{ fontSize: "0.8rem" }}></i>
                          <span className="fw-semibold">{offre.stats.total_views || 0}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-heart text-danger me-1" style={{ fontSize: "0.8rem" }}></i>
                          <span className="fw-semibold">{offre.stats.total_reactions || 0}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-chart-line text-success me-1" style={{ fontSize: "0.8rem" }}></i>
                          <span className="fw-semibold">
                            {offre.stats.total_views > 0 ? Math.round((offre.stats.total_reactions / offre.stats.total_views) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-2 border-top" style={{ flexShrink: 0 }}>
                    <div className="d-flex justify-content-between align-items-center">
                      {/* Boutons de validation/rejet pour l'admin */}
                      <div className="d-flex gap-1">
                        {offre.statut === (t("En attente") || "En attente") && (
                          <>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>{t("validate_offer")}</Tooltip>}
                            >
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => handleValidateOffre(offre.id, t("Validé") || "Validé")} 
                                disabled={actionLoading === offre.id}
                                data-validate-id={offre.id}
                                className="d-flex align-items-center justify-content-center action-btn"
                                style={{ width: "30px", height: "30px", fontSize: "0.7rem" }}
                              >
                                {actionLoading === offre.id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <i className="fas fa-check"></i>
                                )}
                              </Button>
                            </OverlayTrigger>
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>{t("reject_offer")}</Tooltip>}
                            >
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => handleValidateOffre(offre.id, t("Rejeté") || "Rejeté")} 
                                disabled={actionLoading === offre.id}
                                className="d-flex align-items-center justify-content-center action-btn"
                                style={{ width: "30px", height: "30px", fontSize: "0.7rem" }}
                              >
                                {actionLoading === offre.id ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <i className="fas fa-times"></i>
                                )}
                              </Button>
                            </OverlayTrigger>
                          </>
                        )}
                        
                        {offre.statut === (t("Rejeté") || "Rejeté") && (
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{t("validate_offer")}</Tooltip>}
                          >
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              onClick={() => handleValidateOffre(offre.id, t("Validé") || "Validé")} 
                              disabled={actionLoading === offre.id}
                              className="d-flex align-items-center justify-content-center action-btn"
                              style={{ width: "30px", height: "30px", fontSize: "0.7rem" }}
                            >
                              {actionLoading === offre.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </Button>
                          </OverlayTrigger>
                        )}
                        
                        {offre.statut === (t("Validé") || "Validé") && (
                          <div className="d-flex gap-1">
                            <OverlayTrigger
                              placement="top"
                              overlay={<Tooltip>{t("already_validated")}</Tooltip>}
                            >
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                disabled
                                className="d-flex align-items-center justify-content-center"
                                style={{ width: "30px", height: "30px", fontSize: "0.7rem", opacity: 0.6 }}
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                            </OverlayTrigger>
                          </div>
                        )}
                      </div>

                      {/* Boutons Modifier et Supprimer */}
                      <div className="d-flex gap-1">
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{t("edit")}</Tooltip>}
                        >
                          <Button 
                            variant="outline-warning" 
                            size="sm" 
                            onClick={() => handleEditShow(offre)} 
                            className="d-flex align-items-center justify-content-center action-btn"
                            style={{ width: "30px", height: "30px", fontSize: "0.7rem" }}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>{t("delete")}</Tooltip>}
                        >
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDelete(offre.id)} 
                            className="d-flex align-items-center justify-content-center action-btn"
                            style={{ width: "30px", height: "30px", fontSize: "0.7rem" }}
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
        
        {/* Cartes vides pour maintenir l'alignement quand il y a moins de 4 offres */}
        {currentOffres.length < 4 && (
          [...Array(4 - currentOffres.length)].map((_, index) => (
            <Col xs={12} md={6} lg={3} key={`empty-${index}`} className="mb-0" style={{ flex: '1 0 25%', maxWidth: '25%' }}>
              <Card 
                className="border-0 shadow-sm"
                style={{ 
                  borderRadius: "20px",
                  height: '100%',
                  minHeight: '550px',
                  background: 'transparent',
                  border: '2px dashed #dee2e6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Card.Body className="d-flex flex-column align-items-center justify-content-center p-4">
                  <i className="fas fa-file-contract fs-1 text-muted mb-3"></i>
                  <p className="text-muted small text-center mb-0">
                    Aucune offre à afficher
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Pagination simplifiée au bas seulement */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-center align-items-center mt-4">
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant={currentPage === 0 ? "outline-secondary" : "outline-primary"}
              onClick={handlePrevPage}
              disabled={currentPage === 0}
              className="d-flex align-items-center page-btn"
              style={{ borderRadius: "8px", padding: "6px 15px", fontSize: "0.9rem" }}
            >
              <i className="fas fa-chevron-left me-1"></i>
              Précédent
            </Button>
            
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted small">Page</span>
              <div className="d-flex gap-1">
                {[...Array(Math.min(3, totalPages))].map((_, i) => {
                  let pageIndex;
                  if (totalPages <= 3) {
                    pageIndex = i;
                  } else if (currentPage < 2) {
                    pageIndex = i;
                  } else if (currentPage > totalPages - 3) {
                    pageIndex = totalPages - 3 + i;
                  } else {
                    pageIndex = currentPage - 1 + i;
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
                        minWidth: "35px", 
                        height: "35px", 
                        borderRadius: "8px",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.9rem"
                      }}
                    >
                      {pageIndex + 1}
                    </Button>
                  );
                })}
              </div>
              <span className="text-muted small">sur {totalPages}</span>
            </div>
            
            <Button 
              variant={currentPage === totalPages - 1 ? "outline-secondary" : "outline-primary"}
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
              className="d-flex align-items-center page-btn"
              style={{ borderRadius: "8px", padding: "6px 15px", fontSize: "0.9rem" }}
            >
              Suivant
              <i className="fas fa-chevron-right ms-1"></i>
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
          {filteredOffres.length} offre(s) trouvée(s)
        </h6>
      </div>
      
      <ListGroup variant="flush">
        {filteredOffres.map((offre) => {
          const fileUrl = offre.fichier;
          const fileName = getFileName(offre.fichier);

          return (
            <ListGroup.Item 
              key={offre.id}
              className="mb-3 border-0 shadow-sm rounded-3 list-view-item"
              style={{ background: 'white' }}
            >
              <div className="d-flex">
                {/* Colonne gauche : Badge et icônes */}
                <div className="flex-shrink-0 me-3" style={{ width: '120px' }}>
                  <div className="d-flex flex-column align-items-center">
                    <Badge 
                      bg={getStatusVariant(offre.statut)} 
                      className="mb-3 px-3 py-2"
                      style={{ 
                        borderRadius: "15px",
                        fontSize: "0.8rem",
                        width: "100%",
                        textAlign: "center"
                      }}
                    >
                      <i className={`fas ${getStatusIcon(offre.statut)} me-1`}></i>
                      {offre.statut}
                    </Badge>
                    
                    {offre.urgent && (
                      <Badge bg="danger" className="mb-2 px-3 py-2" style={{ borderRadius: "15px", fontSize: "0.8rem", width: "100%", textAlign: "center" }}>
                        <i className="fas fa-exclamation-triangle me-1"></i>{t("urgent")}
                      </Badge>
                    )}
                    
                    {offre.type && (
                      <Badge bg="info" className="px-3 py-2" style={{ borderRadius: "15px", fontSize: "0.8rem", width: "100%", textAlign: "center" }}>
                        {offre.type}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Colonne centrale : Contenu */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h5 className="fw-bold mb-1" style={{ fontSize: '1rem' }}>{offre.intitule}</h5>
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <span className="text-muted small">
                          <i className="fas fa-user me-1"></i>
                          {getMembreName(offre.membre)}
                        </span>
                      </div>
                    </div>
                    <div className="text-muted small text-end">
                      <div>
                        <i className="fas fa-calendar-plus me-1"></i>
                        {t("opening")} {formatDate(offre.date_ouverture)}
                      </div>
                      <div>
                        <i className="fas fa-calendar-check me-1"></i>
                        {t("closing")} {formatDate(offre.date_cloture)}
                      </div>
                    </div>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: '0.9rem' }}>
                    {offre.description?.length > 200 ? `${offre.description.substring(0, 200)}...` : offre.description}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex gap-3 text-muted small">
                      {offre.stats && (
                        <>
                          <span title={t("views")}>
                            <i className="fas fa-eye me-1 text-primary"></i>
                            {offre.stats.total_views || 0}
                          </span>
                          <span title={t("reactions")}>
                            <i className="fas fa-heart me-1 text-danger"></i>
                            {offre.stats.total_reactions || 0}
                          </span>
                        </>
                      )}
                      {offre.localisation && (
                        <span>
                          <i className="fas fa-map-marker-alt me-1 text-success"></i>
                          {offre.localisation}
                        </span>
                      )}
                      {fileUrl && (
                        <span 
                          className="text-primary" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => handleDownloadFile(offre.fichier, fileName)}
                          role="button"
                        >
                          <i className="fas fa-download me-1"></i>{t("download")}
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex gap-1">
                      {offre.statut === (t("En attente") || "En attente") && (
                        <>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{t("validate_offer")}</Tooltip>}
                          >
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              onClick={() => handleValidateOffre(offre.id, t("Validé") || "Validé")} 
                              disabled={actionLoading === offre.id}
                              className="action-btn"
                              style={{ borderRadius: "8px" }}
                            >
                              {actionLoading === offre.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="fas fa-check"></i>
                              )}
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip>{t("reject_offer")}</Tooltip>}
                          >
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handleValidateOffre(offre.id, t("Rejeté") || "Rejeté")} 
                              disabled={actionLoading === offre.id}
                              className="action-btn"
                              style={{ borderRadius: "8px" }}
                            >
                              {actionLoading === offre.id ? (
                                <Spinner animation="border" size="sm" />
                              ) : (
                                <i className="fas fa-times"></i>
                              )}
                            </Button>
                          </OverlayTrigger>
                        </>
                      )}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{t("edit")}</Tooltip>}
                      >
                        <Button 
                          variant="outline-warning" 
                          size="sm" 
                          onClick={() => handleEditShow(offre)} 
                          className="action-btn"
                          style={{ borderRadius: "8px" }}
                        >
                          <i className="fas fa-edit"></i>
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{t("delete")}</Tooltip>}
                      >
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          onClick={() => handleDelete(offre.id)} 
                          className="action-btn"
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

  // Composant FilePreview pour les modals
  const FilePreview = ({ file }) => {
    if (!file) return null;
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <h6 className="mb-3"><i className="fas fa-eye me-2"></i>{t("file_preview")}</h6>
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
            <p className="small text-muted">{t("preview_not_available")}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* === ALERTES === */}
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
            <i className={`fas ${showAlert.type === "success" ? "fa-check-circle text-success" : "fa-exclamation-triangle text-danger"} me-3 fs-5`}></i>
            <div>
              <strong className="d-block">{showAlert.type === "success" ? t("success") : t("error")}</strong>
              <span className="text-muted">{showAlert.message}</span>
            </div>
          </Alert>
        )}

        {/* === HEADER === */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ 
              background: "linear-gradient(135deg, #2c3e50, #34495e)", 
              WebkitBackgroundClip: "text", 
              WebkitTextFillColor: "transparent" 
            }}>
              {t("offer_management_title")}
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-file-contract me-2"></i>
              {t("offer_management_subtitle")}
            </p>
          </div>
          <Button 
            variant="success" 
            onClick={openAddModal} 
            className="d-flex align-items-center shadow-sm add-offer-main-btn"
            style={{ 
              background: "linear-gradient(135deg, #00b09b, #96c93d)", 
              border: "none", 
              borderRadius: "12px", 
              padding: "12px 24px", 
              fontWeight: "600" 
            }}
          >
            <i className="fas fa-plus me-2"></i>{t("new_offer_button")}
          </Button>
        </div>

        {/* === CARTES STATISTIQUES === */}
        <Row className="mb-4">
          {[
            { title: "total", count: appelOffres.length, icon: "fa-file-contract", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
            { title: "pending", count: appelOffres.filter(o => o.statut === (t("En attente") || "En attente")).length, icon: "fa-clock", color: "linear-gradient(135deg, #00b09b, #96c93d)" },
            { title: "validated", count: appelOffres.filter(o => o.statut === (t("Validé") || "Validé")).length, icon: "fa-check-circle", color: "linear-gradient(135deg, #4facfe, #00f2fe)" },
            { title: "rejected", count: appelOffres.filter(o => o.statut === (t("Rejeté") || "Rejeté")).length, icon: "fa-times-circle", color: "linear-gradient(135deg, #f093fb, #f5576c)" },
            { title: "urgent", count: appelOffres.filter(o => o.urgent).length, icon: "fa-exclamation-triangle", color: "linear-gradient(135deg, #ff9a9e, #fecfef)" },
            { title: "total_views", count: totalVues, icon: "fa-eye", color: "linear-gradient(135deg, #a8edea, #fed6e3)" }
          ].map((stat, i) => (
            <Col md={4} lg={2} key={i} className="mb-3">
              <Card 
                className="border-0 shadow-sm h-100 stat-card"
                style={{ borderRadius: "20px" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px) scale(1.02)';
                  e.currentTarget.style.transition = 'all 0.3s ease';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <Card.Body className="p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2 small">{t(stat.title)}</h6>
                      <h4 className="fw-bold mb-0" style={{ 
                        background: stat.color, 
                        WebkitBackgroundClip: "text", 
                        WebkitTextFillColor: "transparent" 
                      }}>
                        {stat.count}
                      </h4>
                    </div>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center" 
                      style={{ width: "45px", height: "45px", background: stat.color }}
                    >
                      <i className={`fas ${stat.icon} text-white`}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* === BARRE DE RECHERCHE ET FILTRES === */}
        <Card 
          className="border-0 shadow-sm mb-4 hover-card" 
          style={{ borderRadius: "20px" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.transition = 'all 0.3s ease';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <Card.Body className="p-4">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-search me-2"></i>{t("search")}
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
                      placeholder={t("search_placeholder")} 
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
                    <i className="fas fa-filter me-2"></i>{t("status_filter")}
                  </Form.Label>
                  <Form.Select 
                    value={filterStatut} 
                    onChange={(e) => setFilterStatut(e.target.value)} 
                    style={{ borderRadius: "10px" }}
                  >
                    <option value={t("all_status") || "Tous"}>{t("all_status")}</option>
                    <option value={t("En attente") || "En attente"}>{t("En attente")}</option>
                    <option value={t("Validé") || "Validé"}>{t("Validé")}</option>
                    <option value={t("Rejeté") || "Rejeté"}>{t("Rejeté")}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-sort me-2"></i>{t("sort_by")}
                  </Form.Label>
                  <Form.Select style={{ borderRadius: "10px" }}>
                    <option>{t("opening_date")}</option>
                    <option>{t("closing_date")}</option>
                    <option>{t("title")}</option>
                    <option>{t("status")}</option>
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
                      onClick={fetchAppelOffres} 
                      style={{ borderRadius: "10px" }}
                    >
                      <i className="fas fa-refresh"></i>
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={clearFilters} 
                      style={{ borderRadius: "10px" }}
                    >
                      <i className="fas fa-times"></i>{t("clear_filters")}
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
              <span className="visually-hidden">{t("loading")}...</span>
            </div>
            <p className="text-muted fw-semibold">{t("loading_offers")}</p>
          </div>
        ) : filteredOffres.length > 0 ? (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h5 className="fw-bold mb-0" style={{ color: '#2c3e50' }}>
                  <i className={`fas ${viewMode === 'grid' ? 'fa-th-large' : 'fa-list'} me-2`}></i>
                  {viewMode === 'grid' ? t('grid_view') : t('list_view')}
                  <Badge bg="primary" className="ms-2">{filteredOffres.length}</Badge>
                </h5>
              </div>
              {viewMode === 'grid' && (
                <div className="d-flex align-items-center gap-3 text-muted small">
                  <i className="fas fa-info-circle"></i>
                  <span>Affichage de 4 offres côte à côte avec dimensions identiques</span>
                </div>
              )}
            </div>

            {viewMode === "grid" ? <GridView /> : <ListView />}
          </div>
        ) : (
          <Card className="border-0 shadow-sm text-center" style={{ borderRadius: "20px" }}>
            <Card.Body className="py-5">
              <i className="fas fa-file-contract fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
              <h5 className="text-muted mb-2">{t("no_offers_found")}</h5>
              <Button 
                variant="primary" 
                onClick={clearFilters} 
                className="d-flex align-items-center mx-auto"
              >
                <i className="fas fa-times me-2"></i>{t("clear_filters")}
              </Button>
            </Card.Body>
          </Card>
        )}

        {/* === MODAL AJOUT === */}
        <Modal 
          show={showAddModal} 
          onHide={handleCloseAdd} 
          size="lg" 
          centered 
          scrollable
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
              <i className="fas fa-plus me-2"></i>{t("add_offer_modal")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleAddOffre}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-heading me-2 text-primary"></i>{t("offer_title")}
                </Form.Label>
                <Form.Control 
                  type="text" 
                  name="intitule" 
                  value={newOffre.intitule} 
                  onChange={handleChange} 
                  isInvalid={!!errors.intitule} 
                  required 
                  style={{ borderRadius: "10px", padding: "12px" }} 
                  placeholder={t("offer_title_placeholder")} 
                />
                <Form.Control.Feedback type="invalid">{errors.intitule}</Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-file-contract me-2 text-primary"></i>{t("contract_type")}
                    </Form.Label>
                    <Form.Select 
                      name="type" 
                      value={newOffre.type} 
                      onChange={handleChange} 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="">{t("select_type")}</option>
                      {typesContrat.map((t, i) => <option key={i} value={t}>{t}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-chart-line me-2 text-primary"></i>{t("status")} *
                    </Form.Label>
                    <Form.Select 
                      name="statut" 
                      value={newOffre.statut} 
                      onChange={handleChange} 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value={t("Validé") || "Validé"}>{t("Validé")}</option>
                      <option value={t("En attente") || "En attente"}>{t("En attente")}</option>
                      <option value={t("Rejeté") || "Rejeté"}>{t("Rejeté")}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-user me-2 text-primary"></i>{t("issuing_member")}
                </Form.Label>
                <Form.Select 
                  name="membre" 
                  value={newOffre.membre} 
                  onChange={handleChange} 
                  isInvalid={!!errors.membre} 
                  required 
                  style={{ borderRadius: "10px", padding: "12px" }}
                >
                  <option value="">{t("select_member")}</option>
                  {membres.map((membre) => (
                    <option key={membre.id} value={membre.id}>
                      {membre.nom_entreprise || t("member")} - {membre.nom || t("administrator")}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">{errors.membre}</Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-map-marker-alt me-2 text-primary"></i>{t("location")}
                    </Form.Label>
                    <Form.Select 
                      name="localisation" 
                      value={newOffre.localisation} 
                      onChange={handleChange} 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="">{t("select_location")}</option>
                      <optgroup label={t("cities")}>
                        {villesMadagascar.map((v, i) => <option key={`v-${i}`} value={v}>{v}</option>)}
                      </optgroup>
                      <optgroup label={t("regions")}>
                        {regionsMadagascar.map((r, i) => <option key={`r-${i}`} value={r}>{r}</option>)}
                      </optgroup>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-money-bill-wave me-2 text-primary"></i>{t("salary")}
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="salaire" 
                      value={newOffre.salaire} 
                      onChange={handleChange} 
                      style={{ borderRadius: "10px", padding: "12px" }} 
                      placeholder={t("salary_placeholder")} 
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-calendar-plus me-2 text-primary"></i>{t("opening_date")}
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
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-calendar-check me-2 text-primary"></i>{t("closing_date")} *
                    </Form.Label>
                    <Form.Control 
                      type="date" 
                      name="date_cloture" 
                      value={newOffre.date_cloture} 
                      onChange={handleChange} 
                      isInvalid={!!errors.date_cloture} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }} 
                    />
                    <Form.Control.Feedback type="invalid">{errors.date_cloture}</Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-paperclip me-2 text-primary"></i>{t("file")}
                </Form.Label>
                <Form.Control 
                  type="file" 
                  name="fichier" 
                  onChange={handleChange} 
                  style={{ borderRadius: "10px", padding: "12px" }} 
                  accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png" 
                />
                <Form.Text className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>{t("accepted_formats")}
                </Form.Text>
              </Form.Group>

              <FilePreview file={previewFile} />

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-align-left me-2 text-primary"></i>{t("description")}
                </Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={5} 
                  name="description" 
                  value={newOffre.description} 
                  onChange={handleChange} 
                  isInvalid={!!errors.description} 
                  required 
                  style={{ borderRadius: "10px", padding: "12px" }} 
                  placeholder={t("description_placeholder")} 
                />
                <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check 
                  type="checkbox" 
                  name="urgent" 
                  checked={newOffre.urgent} 
                  onChange={handleChange}
                  label={
                    <span className="fw-semibold">
                      <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
                      {t("mark_as_urgent")}
                    </span>
                  } 
                />
                <Form.Text className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>{t("urgent_note")}
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={handleCloseAdd} 
              style={{ borderRadius: "10px", padding: "10px 20px" }}
              disabled={isAdding}
            >
              <i className="fas fa-times me-2"></i>{t("cancel_button")}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddOffre} 
              disabled={isAdding}
              style={{ 
                borderRadius: "10px", 
                padding: "10px 20px", 
                background: "linear-gradient(135deg, #667eea, #764ba2)", 
                border: "none" 
              }}
              className="add-offre-btn"
            >
              {isAdding ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t("creating")}
                </>
              ) : (
                <>
                  <i className="fas fa-save me-2"></i>{t("create_offer")}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* === MODAL ÉDITION === */}
        {editOffre && (
          <Modal 
            show={showEditModal} 
            onHide={handleCloseEdit} 
            size="lg" 
            centered 
            scrollable
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
                <i className="fas fa-edit me-2"></i>{t("edit_offer_modal")}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Form>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className="fas fa-heading me-2 text-primary"></i>{t("offer_title")}
                  </Form.Label>
                  <Form.Control 
                    type="text" 
                    name="intitule" 
                    value={editOffre.intitule} 
                    onChange={(e) => handleChange(e, true)} 
                    isInvalid={!!errors.intitule} 
                    required 
                    style={{ borderRadius: "10px", padding: "12px" }} 
                  />
                  <Form.Control.Feedback type="invalid">{errors.intitule}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-file-contract me-2 text-primary"></i>{t("contract_type")}
                      </Form.Label>
                      <Form.Select 
                        name="type" 
                        value={editOffre.type} 
                        onChange={(e) => handleChange(e, true)} 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value="">{t("select_type")}</option>
                        {typesContrat.map((t, i) => <option key={i} value={t}>{t}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-chart-line me-2 text-primary"></i>{t("status")} *
                      </Form.Label>
                      <Form.Select 
                        name="statut" 
                        value={editOffre.statut} 
                        onChange={(e) => handleChange(e, true)} 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value={t("Validé") || "Validé"}>{t("Validé")}</option>
                        <option value={t("En attente") || "En attente"}>{t("En attente")}</option>
                        <option value={t("Rejeté") || "Rejeté"}>{t("Rejeté")}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className="fas fa-user me-2 text-primary"></i>{t("issuing_member")}
                  </Form.Label>
                  <Form.Select 
                    name="membre" 
                    value={editOffre.membre} 
                    onChange={(e) => handleChange(e, true)} 
                    isInvalid={!!errors.membre} 
                    required 
                    style={{ borderRadius: "10px", padding: "12px" }}
                  >
                    <option value="">{t("select_member")}</option>
                    {membres.map((membre) => (
                      <option key={membre.id} value={membre.id}>
                        {membre.nom_entreprise || t("member")} - {membre.nom || t("administrator")}
                      </option>
                    ))}
                  </Form.Select>
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      {t("current_member")} {getMembreName(editOffre.membre)} ({getMembreEntreprise(editOffre.membre)})
                    </small>
                  </div>
                  <Form.Control.Feedback type="invalid">{errors.membre}</Form.Control.Feedback>
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-map-marker-alt me-2 text-primary"></i>{t("location")}
                      </Form.Label>
                      <Form.Select 
                        name="localisation" 
                        value={editOffre.localisation} 
                        onChange={(e) => handleChange(e, true)} 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value="">{t("select_location")}</option>
                        <optgroup label={t("cities")}>
                          {villesMadagascar.map((v, i) => <option key={`v-${i}`} value={v}>{v}</option>)}
                        </optgroup>
                        <optgroup label={t("regions")}>
                          {regionsMadagascar.map((r, i) => <option key={`r-${i}`} value={r}>{r}</option>)}
                        </optgroup>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-money-bill-wave me-2 text-primary"></i>{t("salary")}
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="salaire" 
                        value={editOffre.salaire} 
                        onChange={(e) => handleChange(e, true)} 
                        style={{ borderRadius: "10px", padding: "12px" }} 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-calendar-plus me-2 text-primary"></i>{t("opening_date")}
                      </Form.Label>
                      <Form.Control 
                        type="date" 
                        name="date_ouverture" 
                        value={editOffre.date_ouverture} 
                        onChange={(e) => handleChange(e, true)} 
                        style={{ borderRadius: "10px", padding: "12px" }} 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-calendar-check me-2 text-primary"></i>{t("closing_date")} *
                      </Form.Label>
                      <Form.Control 
                        type="date" 
                        name="date_cloture" 
                        value={editOffre.date_cloture} 
                        onChange={(e) => handleChange(e, true)} 
                        isInvalid={!!errors.date_cloture} 
                        required 
                        style={{ borderRadius: "10px", padding: "12px" }} 
                      />
                      <Form.Control.Feedback type="invalid">{errors.date_cloture}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className="fas fa-paperclip me-2 text-primary"></i>{t("file")}
                  </Form.Label>
                  <Form.Control 
                    type="file" 
                    name="fichier" 
                    onChange={(e) => handleChange(e, true)} 
                    style={{ borderRadius: "10px", padding: "12px" }} 
                    accept=".pdf,.doc,.docx,.zip,.jpg,.jpeg,.png" 
                  />
                  {editOffre.fichier && typeof editOffre.fichier === 'string' && (
                    <div className="mt-2">
                      <small className="text-muted d-block">
                        <i className="fas fa-file me-1"></i>{t("current_file")} {getFileName(editOffre.fichier)}
                      </small>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        onClick={() => handleDownloadFile(editOffre.fichier, getFileName(editOffre.fichier))} 
                        style={{ borderRadius: "6px", fontSize: "0.7rem" }} 
                        className="download-btn mt-1"
                      >
                        <i className="fas fa-download me-1"></i>{t("download")}
                      </Button>
                    </div>
                  )}
                </Form.Group>

                <FilePreview file={previewFile} />

                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className="fas fa-align-left me-2 text-primary"></i>{t("description")}
                  </Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={5} 
                    name="description" 
                    value={editOffre.description} 
                    onChange={(e) => handleChange(e, true)} 
                    isInvalid={!!errors.description} 
                    required 
                    style={{ borderRadius: "10px", padding: "12px" }} 
                  />
                  <Form.Control.Feedback type="invalid">{errors.description}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Check 
                    type="checkbox" 
                    name="urgent" 
                    checked={editOffre.urgent} 
                    onChange={(e) => handleChange(e, true)}
                    label={
                      <span className="fw-semibold">
                        <i className="fas fa-exclamation-triangle me-2 text-warning"></i>
                        {t("mark_as_urgent")}
                      </span>
                    } 
                  />
                </Form.Group>

                {/* Affichage des statistiques dans le modal d'édition */}
                {editOffre.stats && (
                  <div className="mt-3 p-3 border rounded stats-container">
                    <h6 className="mb-3">
                      <i className="fas fa-chart-bar me-2"></i>
                      {t("statistics")}
                    </h6>
                    <div className="d-flex justify-content-between align-items-center small">
                      <div className="d-flex align-items-center">
                        <i className="fas fa-eye text-info me-1"></i>
                        <span className="fw-semibold">{editOffre.stats.total_views || 0}</span>
                      </div>
                      <div className="d-flex align-items-center">
                        <i className="fas fa-heart text-danger me-1"></i>
                        <span className="fw-semibold">{editOffre.stats.total_reactions || 0}</span>
                      </div>
                    </div>
                  </div>
                )}
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button 
                variant="outline-secondary" 
                onClick={handleCloseEdit} 
                style={{ borderRadius: "10px", padding: "10px 20px" }}
                disabled={isEditing}
              >
                <i className="fas fa-times me-2"></i>{t("cancel_button")}
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveEdit} 
                disabled={isEditing}
                style={{ 
                  borderRadius: "10px", 
                  padding: "10px 20px", 
                  background: "linear-gradient(135deg, #667eea, #764ba2)", 
                  border: "none" 
                }}
                className="save-offre-btn"
              >
                {isEditing ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    {t("saving")}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-2"></i>{t("save_button")}
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
          .offre-card {
            transition: all 0.3s ease;
          }
          
          .offre-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 25px rgba(0,0,0,0.1) !important;
          }
          
          .hover-card {
            transition: all 0.3s ease;
          }
          
          .hover-card:hover {
            transform: translateY(-2px);
          }
          
          /* Animation pour les cartes de statistiques */
          .stat-card {
            transition: all 0.3s ease;
          }
          
          .stat-card:hover {
            transform: translateY(-5px) scale(1.02);
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
          .add-offer-main-btn:hover {
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
          
          /* Styles pour les statistiques */
          .stats-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border-radius: 12px;
            border: 1px solid #e9ecef;
          }
          
          /* Garantir que les cartes ont exactement la même taille */
          .offre-card {
            display: flex;
            flex-direction: column;
            height: 550px !important;
            min-height: 550px !important;
            max-height: 550px !important;
          }
          
          .offre-card .card-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          
          /* Forcer toutes les cartes à avoir exactement la même largeur */
          .row.g-3 > [class*="col-"] {
            flex: 1 0 25% !important;
            max-width: 25% !important;
            min-width: 25% !important;
          }
          
          /* S'assurer que les cartes restent alignées horizontalement */
          .row.g-3 {
            display: flex !important;
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
          }
          
          /* Masquer la scrollbar horizontale */
          .row.g-3::-webkit-scrollbar {
            display: none;
          }
          
          .row.g-3 {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
          
          /* Styles pour les textes tronqués */
          .text-truncate {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          
          /* Limiter le nombre de lignes pour les descriptions */
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          
          /* Cartes vides pour maintenir l'alignement */
          .empty-card {
            visibility: hidden;
          }
        `}</style>
      </div>
    </div>
  );
};

export default AppelOffreAdmin;