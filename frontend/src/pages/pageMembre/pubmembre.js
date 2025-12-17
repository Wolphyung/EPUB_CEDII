// src/pages/membre/PubMembre.jsx

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
  Container,
  ListGroup,
  ButtonGroup,
  InputGroup,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import { useTranslation } from 'react-i18next';
import {
  FaNewspaper,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaHeart,
  FaEye,
  FaChartLine,
  FaUsers,
  FaPlusCircle,
  FaEdit,
  FaTrash,
  FaCalendar,
  FaUser,
  FaDownload,
  FaRocket,
  FaPaperclip,
  FaFileImage,
  FaFileVideo,
  FaFileAlt,
  FaArrowUp,
  FaSearch,
  FaThLarge,
  FaList,
  FaChevronLeft,
  FaChevronRight,
  FaTh,
  FaInfoCircle,
  FaWindowMinimize,
  FaUpload,
  FaExclamationCircle
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

const PubMembre = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  /* -------------------------- STATE -------------------------- */
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [publications, setPublications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPub, setEditingPub] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState("grid"); // "grid" ou "list"
  const [currentPage, setCurrentPage] = useState(0);
  const [cardSize, setCardSize] = useState("normal"); // "small", "normal", "large"

  const [newPub, setNewPub] = useState({
    titre: "",
    contenu: "",
    fichier: null,
    type_fichier: "image",
    date: new Date().toISOString().split("T")[0],
    categorie: "Actualité",
  });

  /* -------------------------- COULEURS -------------------------- */
  const C = {
    primary: "#667eea",
    secondary: "#764ba2",
    accent: "#4facfe",
    neon: "#00f2fe",
    gray: "#6c757d",
    white: "#FFFFFF",
    bg: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    cardBg: "#FFFFFF",
    success: "#28a745",
    warning: "#ffc107",
    danger: "#dc3545",
    info: "#17a2b8"
  };

  /* -------------------------- CONFIGURATION -------------------------- */
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

  /* -------------------------- INITIALISATION -------------------------- */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  /* -------------------------- CONFIGURATION AXIOS -------------------------- */
  const apiClient = axios.create({
    baseURL: API_URL,
    timeout: 15000,
  });

  apiClient.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  /* -------------------------- FONCTIONS UTILITAIRES -------------------------- */
  const isUserAuthor = (publication) => {
    if (!currentUser) return false;
    if (currentUser.type === 'admin') return true;
    
    if (publication.membre_id && currentUser.id) {
      return publication.membre_id === currentUser.id;
    }
    
    return publication.auteur === currentUser.nom_complet || 
           publication.auteur === currentUser.nom || 
           publication.auteur === currentUser.email;
  };

  /* -------------------------- CLEANUP -------------------------- */
  useEffect(() => {
    return () => {
      if (previewFile?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  /* -------------------------- FETCH PUBLICATIONS -------------------------- */
  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/publications');
      
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const adapted = response.data.data.map((pub) => ({
          id: pub.id_publication,
          titre: pub.titre,
          contenu: pub.contenu,
          fichier_url: pub.fichier_url,
          nom_fichier_original: pub.nom_fichier_original,
          type_fichier: pub.type_fichier,
          date: pub.date_publication
            ? new Date(pub.date_publication).toISOString().split("T")[0]
            : new Date().toISOString().split("T")[0],
          auteur: pub.auteur || t("anonymous"),
          statut: (pub.statut || "En attente").toLowerCase().replace(/\s+/g, "_"),
          categorie: pub.categorie || "Actualité",
          membre_id: pub.membre_id,
          total_reactions: pub.total_reactions || 0,
          vues: pub.vues || 0
        }));
        
        let filteredPublications = adapted;
        if (currentUser && currentUser.type === 'membre') {
          filteredPublications = adapted.filter(pub => 
            pub.membre_id === currentUser.id || 
            pub.auteur === currentUser.nom_complet ||
            pub.auteur === currentUser.nom ||
            pub.auteur === currentUser.email
          );
        }
        
        setPublications(filteredPublications.reverse());
      } else {
        console.error('Structure de réponse inattendue:', response.data);
        showAlert(t("error_load"), "danger");
      }
    } catch (err) {
      console.error('Erreur fetch publications:', err);
      if (err.response?.status === 401) {
        showAlert(t("session_expired"), "danger");
      } else {
        showAlert(t("error_load"), "danger");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser, t]);

  useEffect(() => {
    if (currentUser) {
      fetchPublications();
    }
  }, [currentUser, fetchPublications]);

  /* -------------------------- CRUD OPERATIONS -------------------------- */
  const createFormData = () => {
    const fd = new FormData();
    fd.append("titre", newPub.titre);
    fd.append("contenu", newPub.contenu);
    fd.append("categorie", newPub.categorie);
    fd.append(
      "type",
      newPub.categorie === "Offre d'emploi"
        ? "Offre"
        : newPub.categorie === "Événement"
        ? "Evenement"
        : "Article"
    );
    fd.append("date_publication", newPub.date);
    fd.append("type_fichier", newPub.type_fichier);
    if (newPub.fichier) fd.append("fichier", newPub.fichier);
    return fd;
  };

  const handleAddPublication = async () => {
    setIsSubmitting(true);
    try {
      const formData = createFormData();
      await apiClient.post('/publications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await fetchPublications();
      showAlert(t("success_add"), "success");
      handleClose();
    } catch (err) {
      console.error('Erreur création publication:', err);
      if (err.response?.status === 401) {
        showAlert(t("session_expired"), "danger");
      } else {
        showAlert(`${t("error_add")}: ${err.response?.data?.message || err.message}`, "danger");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdatePublication = async () => {
    setIsSubmitting(true);
    try {
      const formData = createFormData();
      formData.append("_method", "PUT");
      
      await apiClient.post(`/publications/${editingPub.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      await fetchPublications();
      showAlert(t("success_edit"), "success");
      handleClose();
    } catch (err) {
      console.error('Erreur modification publication:', err);
      if (err.response?.status === 401) {
        showAlert(t("session_expired"), "danger");
      } else {
        showAlert(`${t("error_edit")}: ${err.response?.data?.message || err.message}`, "danger");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePublication = async () => {
    if (!deleteTarget) return;
    
    try {
      await apiClient.delete(`/publications/${deleteTarget}`);
      setPublications((prev) => prev.filter((p) => p.id !== deleteTarget));
      showAlert(t("success_delete"), "success");
      setShowDeleteModal(false);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Erreur suppression publication:', err);
      if (err.response?.status === 401) {
        showAlert(t("session_expired"), "danger");
      } else {
        showAlert(t("error_delete"), "danger");
      }
    }
  };

  const confirmDelete = (id) => {
    setDeleteTarget(id);
    setShowDeleteModal(true);
  };

  const handleSavePublication = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert(t("login_required"), "warning");
      return;
    }

    if (!newPub.titre.trim()) {
      showAlert(t("title_required"), "warning");
      return;
    }

    if (!newPub.contenu.trim()) {
      showAlert(t("content_required"), "warning");
      return;
    }

    editingPub ? handleUpdatePublication() : handleAddPublication();
  };

  /* -------------------------- MODAL MANAGEMENT -------------------------- */
  const handleShow = () => {
    setEditingPub(null);
    setNewPub({
      titre: "",
      contenu: "",
      fichier: null,
      type_fichier: "image",
      date: new Date().toISOString().split("T")[0],
      categorie: "Actualité",
    });
    setPreviewFile(null);
    setShowModal(true);
  };

  const handleShowEdit = (pub) => {
    if (!isUserAuthor(pub)) {
      showAlert(t("unauthorized_edit"), "warning");
      return;
    }
    
    setEditingPub(pub);
    setNewPub({
      titre: pub.titre,
      contenu: pub.contenu,
      fichier: null,
      type_fichier: pub.type_fichier,
      date: pub.date,
      categorie: pub.categorie,
    });
    setPreviewFile(null);
    setShowModal(true);
  };

  const handleClose = () => {
    setShowModal(false);
    setEditingPub(null);
    setPreviewFile(null);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "fichier") {
      const file = files[0];
      setNewPub((prev) => ({ ...prev, fichier: file }));
      if (file) {
        const url = URL.createObjectURL(file);
        setPreviewFile({ url, name: file.name, type: file.type });
        const type = file.type.startsWith("image/")
          ? "image"
          : file.type.startsWith("video/")
          ? "video"
          : "document";
        setNewPub((prev) => ({ ...prev, type_fichier: type }));
      } else {
        setPreviewFile(null);
      }
    } else {
      setNewPub((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleFileTypeChange = (type) => {
    setNewPub((prev) => ({ ...prev, type_fichier: type, fichier: null }));
    setPreviewFile(null);
  };

  /* -------------------------- UI HELPERS -------------------------- */
  const showAlert = (msg, type) => {
    setAlert({ show: true, message: msg, type });
    setTimeout(() => setAlert({ ...alert, show: false }), 5000);
  };

  const getStatusBadge = (statut) => {
    const cfg = {
      validé: { v: "success", t: t("Validé"), i: <FaCheckCircle /> },
      en_attente: { v: "warning", t: t("En attente"), i: <FaClock /> },
      brouillon: { v: "secondary", t: t("Brouillon"), i: <FaEdit /> },
      rejeté: { v: "danger", t: t("Rejeté"), i: <FaTimesCircle /> },
    };
    const c = cfg[statut] || cfg.en_attente;
    return (
      <Badge
        bg={c.v}
        className="d-inline-flex align-items-center px-2 py-1"
        style={{ borderRadius: "12px", fontSize: "0.7rem" }}
      >
        {c.i}
        <span className="ms-1">{c.t}</span>
      </Badge>
    );
  };

  const getCategoryBadge = (cat) => {
    const colors = {
      "Offre d'emploi": "primary",
      "Événement": "success",
      "Actualité": "info",
      "Formation": "warning",
    };
    return (
      <Badge
        bg={colors[cat] || "secondary"}
        className="px-2 py-1"
        style={{ borderRadius: "8px", fontSize: "0.65rem" }}
      >
        {cat}
      </Badge>
    );
  };

  const getFileIcon = (name) => {
    if (!name) return <FaFileAlt />;
    const ext = name.split(".").pop().toLowerCase();
    const map = {
      pdf: <FaFileAlt className="text-danger" />,
      doc: <FaFileAlt className="text-primary" />,
      docx: <FaFileAlt className="text-primary" />,
      xls: <FaFileAlt className="text-success" />,
      xlsx: <FaFileAlt className="text-success" />,
      jpg: <FaFileImage className="text-info" />,
      jpeg: <FaFileImage className="text-info" />,
      png: <FaFileImage className="text-info" />,
      gif: <FaFileImage className="text-info" />,
      mp4: <FaFileVideo className="text-warning" />,
      avi: <FaFileVideo className="text-warning" />,
      mov: <FaFileVideo className="text-warning" />,
      zip: <FaFileAlt className="text-secondary" />,
      rar: <FaFileAlt className="text-secondary" />,
    };
    return map[ext] || <FaFileAlt />;
  };

  const handleDownload = (url, name) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = name || "fichier";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleRemoveFile = () => {
    setNewPub((prev) => ({ ...prev, fichier: null }));
    setPreviewFile(null);
  };

  /* -------------------------- FILTRAGE & PAGINATION -------------------------- */
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.contenu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pub.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const cardsPerPage = CARDS_PER_PAGE[viewMode][cardSize];
  const totalPages = Math.ceil(filteredPublications.length / cardsPerPage);
  const startIndex = currentPage * cardsPerPage;
  const endIndex = Math.min(startIndex + cardsPerPage, filteredPublications.length);
  const currentPublications = filteredPublications.slice(startIndex, endIndex);

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

  /* -------------------------- COMPOSANTS D'AFFICHAGE -------------------------- */
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
              Page {currentPage + 1} sur {totalPages} ({filteredPublications.length} publications)
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
        {currentPublications.map((pub) => (
          <div key={pub.id} className={CARD_SIZE_CLASSES[cardSize]}>
            <Card className="border-0 shadow-sm h-100 publication-card"
              style={{ 
                borderRadius: "15px",
                transition: "all 0.3s ease",
                cursor: "pointer"
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
              {/* Image/Video preview */}
              {pub.fichier_url && pub.type_fichier === "image" && (
                <div style={{ position: "relative", height: cardSize === "small" ? "120px" : "160px", overflow: "hidden" }}>
                  <Card.Img 
                    variant="top" 
                    src={pub.fichier_url} 
                    style={{ 
                      height: "100%", 
                      objectFit: "cover",
                      cursor: 'pointer'
                    }}
                    onClick={() => window.open(pub.fichier_url, '_blank')}
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    {getStatusBadge(pub.statut)}
                  </div>
                </div>
              )}

              {pub.fichier_url && pub.type_fichier === "video" && (
                <div style={{ 
                  height: cardSize === "small" ? "120px" : "160px", 
                  background: "#000",
                  position: "relative"
                }}>
                  <video 
                    src={pub.fichier_url} 
                    controls 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "contain" 
                    }} 
                  />
                  <div className="position-absolute top-0 end-0 m-2">
                    {getStatusBadge(pub.statut)}
                  </div>
                </div>
              )}

              {(!pub.fichier_url || pub.type_fichier === "document") && (
                <div style={{ 
                  height: cardSize === "small" ? "120px" : "160px",
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative"
                }}>
                  {getFileIcon(pub.nom_fichier_original)}
                  <div className="position-absolute top-0 end-0 m-2">
                    {getStatusBadge(pub.statut)}
                  </div>
                </div>
              )}

              <Card.Body className="p-3 d-flex flex-column">
                {/* Catégorie et badge utilisateur */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div className="d-flex flex-wrap gap-1">
                    {getCategoryBadge(pub.categorie)}
                    {isUserAuthor(pub) && (
                      <Badge 
                        bg="info" 
                        className="ms-1 d-inline-flex align-items-center px-1 py-1"
                        style={{ borderRadius: "6px", fontSize: "0.55rem" }}
                      >
                        <FaUser size={8} className="me-1" />
                        {t("your_publication")}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Titre */}
                <Card.Title 
                  className="fw-bold mb-2" 
                  style={{ 
                    fontSize: cardSize === "small" ? "0.9rem" : "1rem", 
                    color: "#2c3e50",
                    lineHeight: "1.3",
                    height: cardSize === "small" ? "40px" : "50px",
                    overflow: "hidden"
                  }}
                >
                  {pub.titre}
                </Card.Title>

                {/* Contenu réduit */}
                <Card.Text 
                  className="text-muted small flex-grow-1" 
                  style={{ 
                    fontSize: cardSize === "small" ? "0.75rem" : "0.85rem",
                    lineHeight: "1.4",
                    height: cardSize === "small" ? "40px" : "60px",
                    overflow: "hidden"
                  }}
                >
                  {pub.contenu.length > (cardSize === "small" ? 60 : 80) 
                    ? `${pub.contenu.substring(0, cardSize === "small" ? 60 : 80)}...` 
                    : pub.contenu}
                </Card.Text>

                {/* Statistiques d'engagement réduites */}
                {pub.statut === "validé" && (
                  <div className="d-flex justify-content-around align-items-center mb-3 p-2 border rounded"
                    style={{ 
                      background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
                      fontSize: cardSize === "small" ? "0.7rem" : "0.8rem"
                    }}>
                    <div className="text-center">
                      <div className="d-flex align-items-center justify-content-center mb-1">
                        <FaHeart className="text-danger me-1" size={cardSize === "small" ? 10 : 12} />
                        <span className="fw-bold" style={{ color: "#E91E63" }}>
                          {pub.total_reactions || 0}
                        </span>
                      </div>
                      <small className="text-muted">{t("reactions")}</small>
                    </div>
                    <div className="text-center">
                      <div className="d-flex align-items-center justify-content-center mb-1">
                        <FaEye className="text-primary me-1" size={cardSize === "small" ? 10 : 12} />
                        <span className="fw-bold" style={{ color: "#2196F3" }}>
                          {pub.vues || 0}
                        </span>
                      </div>
                      <small className="text-muted">{t("views")}</small>
                    </div>
                  </div>
                )}

                {/* Document téléchargeable */}
                {pub.fichier_url && pub.type_fichier === "document" && (
                  <div className="d-flex align-items-center p-2 border rounded mb-3" 
                    style={{ 
                      background: "#f8f9fa",
                      fontSize: cardSize === "small" ? "0.7rem" : "0.8rem"
                    }}>
                    {getFileIcon(pub.nom_fichier_original)}
                    <span className="text-truncate ms-2 me-2 flex-grow-1" style={{ maxWidth: "100px" }}>
                      {pub.nom_fichier_original}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline-primary" 
                      onClick={() => handleDownload(pub.fichier_url, pub.nom_fichier_original)}
                      className="rounded-circle"
                      style={{ width: cardSize === "small" ? '24px' : '28px', height: cardSize === "small" ? '24px' : '28px' }}
                    >
                      <FaDownload size={cardSize === "small" ? 10 : 12} />
                    </Button>
                  </div>
                )}

                {/* Date et auteur */}
                <div className="d-flex justify-content-between text-muted small mb-3"
                  style={{ fontSize: cardSize === "small" ? "0.7rem" : "0.8rem" }}>
                  <span><FaCalendar className="me-1" />{pub.date}</span>
                  <span><FaUser className="me-1" />{pub.auteur}</span>
                </div>

                {/* Actions */}
                <div className="d-flex justify-content-end gap-1 mt-auto">
                  {isUserAuthor(pub) ? (
                    <>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`edit-tooltip-${pub.id}`}>Modifier</Tooltip>}
                      >
                        <Button 
                          variant="outline-primary" 
                          size="sm" 
                          className="rounded-circle"
                          onClick={() => handleShowEdit(pub)}
                          disabled={pub.statut === "validé" && currentUser.type === 'membre'}
                          style={{ 
                            width: cardSize === "small" ? '28px' : '32px', 
                            height: cardSize === "small" ? '28px' : '32px',
                            padding: 0
                          }}
                        >
                          <FaEdit size={cardSize === "small" ? 12 : 14} />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id={`delete-tooltip-${pub.id}`}>Supprimer</Tooltip>}
                      >
                        <Button 
                          variant="outline-danger" 
                          size="sm" 
                          className="rounded-circle"
                          onClick={() => confirmDelete(pub.id)}
                          style={{ 
                            width: cardSize === "small" ? '28px' : '32px', 
                            height: cardSize === "small" ? '28px' : '32px',
                            padding: 0
                          }}
                        >
                          <FaTrash size={cardSize === "small" ? 12 : 14} />
                        </Button>
                      </OverlayTrigger>
                    </>
                  ) : (
                    <Badge bg="secondary" className="px-2 py-1" style={{ fontSize: "0.7rem" }}>
                      <FaEye className="me-1" />
                      {t("read_only")}
                    </Badge>
                  )}
                </div>
              </Card.Body>
            </Card>
          </div>
        ))}
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
          {filteredPublications.length} publication(s) trouvée(s)
        </h6>
      </div>
      
      <ListGroup variant="flush">
        {currentPublications.map((pub) => {
          const userIsAuthor = isUserAuthor(pub);

          return (
            <ListGroup.Item 
              key={pub.id}
              className="mb-3 border-0 shadow-sm rounded-3 list-view-item"
              style={{ 
                background: 'white',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
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
                {/* Colonne gauche : Image/Icone */}
                <div className="flex-shrink-0 me-3" style={{ width: '100px' }}>
                  {pub.fichier_url && pub.type_fichier === "image" ? (
                    <img 
                      src={pub.fichier_url} 
                      alt={pub.titre}
                      className="rounded-2"
                      style={{ width: '100px', height: '80px', objectFit: 'cover' }}
                    />
                  ) : pub.fichier_url && pub.type_fichier === "video" ? (
                    <div className="d-flex align-items-center justify-content-center rounded-2 bg-dark"
                      style={{ width: '100px', height: '80px' }}>
                      <FaFileVideo className="text-white" size={24} />
                    </div>
                  ) : (
                    <div className="d-flex align-items-center justify-content-center rounded-2"
                      style={{ 
                        width: '100px', 
                        height: '80px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      }}>
                      {getFileIcon(pub.nom_fichier_original)}
                    </div>
                  )}
                </div>

                {/* Colonne centrale : Contenu */}
                <div className="flex-grow-1">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <div>
                      <h6 className="fw-bold mb-1" style={{ fontSize: '0.95rem' }}>{pub.titre}</h6>
                      <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                        {getCategoryBadge(pub.categorie)}
                        {getStatusBadge(pub.statut)}
                        {userIsAuthor && (
                          <Badge 
                            bg="info" 
                            className="d-inline-flex align-items-center px-2 py-1"
                            style={{ borderRadius: "6px", fontSize: "0.6rem" }}
                          >
                            <FaUser size={10} className="me-1" />
                            {t("your_publication")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-muted small text-end">
                      <div><FaCalendar className="me-1" />{pub.date}</div>
                      <div><FaUser className="me-1" />{pub.auteur}</div>
                    </div>
                  </div>

                  <p className="text-muted mb-2" style={{ fontSize: '0.85rem' }}>
                    {pub.contenu?.length > 150 ? `${pub.contenu.substring(0, 150)}...` : pub.contenu}
                  </p>

                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <div className="d-flex gap-3 text-muted small">
                      <span title="Réactions">
                        <FaHeart className="me-1 text-danger" size={12} />
                        {pub.total_reactions || 0}
                      </span>
                      <span title="Vues">
                        <FaEye className="me-1 text-primary" size={12} />
                        {pub.vues || 0}
                      </span>
                      {pub.fichier_url && (
                        <span 
                          className="text-primary" 
                          style={{ cursor: 'pointer' }} 
                          onClick={() => handleDownload(pub.fichier_url, pub.nom_fichier_original)}
                        >
                          <FaDownload className="me-1" size={12} />
                          Télécharger
                        </span>
                      )}
                    </div>
                    
                    <div className="d-flex gap-1">
                      {userIsAuthor && (
                        <>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`edit-list-tooltip-${pub.id}`}>Modifier</Tooltip>}
                          >
                            <Button 
                              variant="outline-primary" 
                              size="sm" 
                              onClick={() => handleShowEdit(pub)}
                              disabled={pub.statut === "validé" && currentUser.type === 'membre'}
                              style={{ borderRadius: "8px", padding: "4px 8px" }}
                            >
                              <FaEdit size={12} />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`delete-list-tooltip-${pub.id}`}>Supprimer</Tooltip>}
                          >
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => confirmDelete(pub.id)}
                              style={{ borderRadius: "8px", padding: "4px 8px" }}
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

  /* -------------------------- RENDER -------------------------- */
  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: C.bg }}>
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
              {currentUser.type === 'admin' ? t("publication_management_title") : t("my_publications")}
            </h1>
            <p style={{ color: C.gray, fontSize: "0.9rem", margin: 0 }}>
              {currentUser.type === 'admin' 
                ? t("publication_management_subtitle") 
                : t("manage_your_publications")}
            </p>
          </div>
          <Button
            onClick={handleShow}
            className="shadow-lg rounded-pill px-4 py-2"
            style={{
              background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "0.9rem",
              minWidth: "180px"
            }}
          >
            <FaPlusCircle className="me-2" />
            {t("new_publication_button")}
          </Button>
        </div>

        {/* Alert */}
        {alert.show && (
          <Alert
            variant={alert.type}
            dismissible
            onClose={() => setAlert({ ...alert, show: false })}
            className="shadow-sm border-0 mb-4"
            style={{ borderRadius: "12px", fontSize: "0.9rem" }}
          >
            {alert.message}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '2.5rem', height: '2.5rem' }} />
            <p className="mt-3 text-muted">{t("loading_publications")}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Barre de contrôle : Recherche, filtres, vues */}
            <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "15px", background: C.cardBg }}>
              <Card.Body className="p-3">
                <Row className="g-3 align-items-center">
                  <Col md={5}>
                    <div className="position-relative">
                      <FaSearch 
                        style={{ 
                          position: "absolute", 
                          left: "12px", 
                          top: "50%", 
                          transform: "translateY(-50%)", 
                          color: C.gray 
                        }} 
                      />
                      <Form.Control
                        type="text"
                        placeholder={t("search_placeholder")}
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
                      onChange={(e) => setStatusFilter(e.target.value)}
                      style={{
                        borderRadius: "10px",
                        padding: "0.6rem 1rem",
                        border: "1px solid #e9ecef",
                        fontSize: "0.9rem"
                      }}
                    >
                      <option value="all">{t("all_status")}</option>
                      <option value="validé">{t("Validé")}</option>
                      <option value="en_attente">{t("En attente")}</option>
                      <option value="rejeté">{t("Rejeté")}</option>
                      <option value="brouillon">{t("Brouillon")}</option>
                    </Form.Select>
                  </Col>
                  <Col md={4}>
                    <div className="d-flex justify-content-end align-items-center gap-3">
                      {/* Sélecteur de vue */}
                      <ButtonGroup>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip id="tooltip-grid">Vue grille</Tooltip>}
                        >
                          <Button
                            variant={viewMode === "grid" ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => {
                              setViewMode("grid");
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
                            variant={viewMode === "list" ? "primary" : "outline-secondary"}
                            size="sm"
                            onClick={() => {
                              setViewMode("list");
                              setCurrentPage(0);
                            }}
                            style={{ borderRadius: "0 8px 8px 0" }}
                          >
                            <FaList size={14} />
                          </Button>
                        </OverlayTrigger>
                      </ButtonGroup>

                      {/* Sélecteur de taille des cartes (uniquement en mode grille) */}
                      {viewMode === "grid" && (
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

                      {/* Bouton rafraîchir */}
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip id="tooltip-refresh">Rafraîchir</Tooltip>}
                      >
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={fetchPublications}
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

            {/* Affichage des publications */}
            {filteredPublications.length === 0 ? (
              <Card className="text-center border-0 shadow-sm p-5" style={{ borderRadius: "15px", minHeight: "300px" }}>
                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                  <FaNewspaper size={60} className="text-muted mb-3" />
                  <h5 className="text-dark mb-3">{t("no_publications_found")}</h5>
                  <p className="text-muted mb-4" style={{ fontSize: "0.9rem" }}>
                    {searchTerm || statusFilter !== "all" 
                      ? t("no_publications_match")
                      : currentUser.type === 'admin' 
                        ? t("no_publications_system")
                        : t("start_first_publication")}
                  </p>
                  <Button 
                    onClick={handleShow}
                    className="rounded-pill px-4 py-2"
                    style={{
                      background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
                      border: "none",
                      fontSize: "0.9rem"
                    }}
                  >
                    <FaPlusCircle className="me-2" />
                    {t("create_publication")}
                  </Button>
                </div>
              </Card>
            ) : (
              <>
                {/* En-tête avec compteur */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <h6 className="text-muted mb-0">
                      Affichage {startIndex + 1} à {endIndex} sur {filteredPublications.length} publications
                    </h6>
                  </div>
                  <div className="text-muted small">
                    Page {currentPage + 1} sur {totalPages}
                  </div>
                </div>

                {/* Vue sélectionnée */}
                {viewMode === "grid" ? <GridView /> : <ListView />}
              </>
            )}
          </>
        )}
      </div>

      {/* MODAL - PUBLICATION FORM */}
<Modal show={showModal} onHide={handleClose} centered size="lg">
  <Modal.Header closeButton style={{
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    borderTopLeftRadius: "15px",
    borderTopRightRadius: "15px",
    padding: "1.5rem 1.5rem",
    border: 'none'
  }}>
    <Modal.Title className="fw-bold d-flex align-items-center" style={{ fontSize: "1.2rem" }}>
      {editingPub ? 
        <><FaEdit className="me-3" size={22} /> {t("edit_publication_modal")}</> : 
        <><FaPlusCircle className="me-3" size={22} /> {t("add_publication_modal")}</>
      }
    </Modal.Title>
  </Modal.Header>

  <Modal.Body className="p-4" style={{ 
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    minHeight: "500px"
  }}>
    <div className="position-relative">
      {/* Indicateur d'étape */}
      <div className="d-flex justify-content-center mb-4">
        <div className="d-flex align-items-center" style={{ gap: "4px" }}>
          <div className="text-center">
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
            }}>
              1
            </div>
            <small className="text-primary fw-bold mt-1" style={{ fontSize: "0.7rem" }}>Infos</small>
          </div>
          <div style={{ 
            width: "40px", 
            height: "2px", 
            background: "#e2e8f0",
            marginTop: "-10px"
          }}></div>
          <div className="text-center">
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d",
              fontWeight: "bold"
            }}>
              2
            </div>
            <small className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>Contenu</small>
          </div>
          <div style={{ 
            width: "40px", 
            height: "2px", 
            background: "#e2e8f0",
            marginTop: "-10px"
          }}></div>
          <div className="text-center">
            <div style={{
              width: "36px",
              height: "36px",
              borderRadius: "50%",
              background: "#e2e8f0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#6c757d",
              fontWeight: "bold"
            }}>
              3
            </div>
            <small className="text-muted mt-1" style={{ fontSize: "0.7rem" }}>Fichier</small>
          </div>
        </div>
      </div>

      <Form>
        {/* SECTION 1 : Informations de base */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              color: "white"
            }}>
              <FaNewspaper size={16} />
            </div>
            <h6 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>Informations de la publication</h6>
          </div>

          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="formTitre">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <span className="me-2" style={{ color: "#667eea" }}>📝</span>
                  Titre <span className="text-danger ms-1">*</span>
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ 
                    background: "white", 
                    borderRight: "none",
                    borderColor: "#e2e8f0"
                  }}>
                    <FaNewspaper className="text-primary" />
                  </InputGroup.Text>
                  <Form.Control
                    type="text"
                    name="titre"
                    value={newPub.titre}
                    onChange={handleChange}
                    placeholder="Ex: Nouvelle offre d'emploi"
                    required
                    style={{
                      borderRadius: "0 8px 8px 0",
                      borderLeft: "none",
                      borderColor: "#e2e8f0",
                      fontSize: "0.9rem",
                      padding: "0.75rem"
                    }}
                  />
                </InputGroup>
                <small className="text-muted d-flex align-items-center mt-1">
                  <FaInfoCircle className="me-1" size={10} />
                  50-200 caractères recommandés
                </small>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formCategorie">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <span className="me-2" style={{ color: "#667eea" }}>🏷️</span>
                  Catégorie
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ 
                    background: "white", 
                    borderRight: "none",
                    borderColor: "#e2e8f0"
                  }}>
                    <i className="fas fa-tag text-primary"></i>
                  </InputGroup.Text>
                  <Form.Select
                    name="categorie"
                    value={newPub.categorie}
                    onChange={handleChange}
                    style={{
                      borderRadius: "0 8px 8px 0",
                      borderLeft: "none",
                      borderColor: "#e2e8f0",
                      fontSize: "0.9rem",
                      padding: "0.75rem"
                    }}
                  >
                    <option value="Actualité">📰 Actualité</option>
                    <option value="Offre d'emploi">💼 Offre d'emploi</option>
                    <option value="Événement">🎉 Événement</option>
                    <option value="Formation">🎓 Formation</option>
                    <option value="Rapport">📊 Rapport</option>
                    <option value="Annonce">📢 Annonce</option>
                  </Form.Select>
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formDate">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <span className="me-2" style={{ color: "#667eea" }}>📅</span>
                  Date de publication
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ 
                    background: "white", 
                    borderRight: "none",
                    borderColor: "#e2e8f0"
                  }}>
                    <FaCalendar className="text-primary" />
                  </InputGroup.Text>
                  <Form.Control
                    type="date"
                    name="date"
                    value={newPub.date}
                    onChange={handleChange}
                    style={{
                      borderRadius: "0 8px 8px 0",
                      borderLeft: "none",
                      borderColor: "#e2e8f0",
                      fontSize: "0.9rem",
                      padding: "0.75rem"
                    }}
                  />
                </InputGroup>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="formStatut">
                <Form.Label className="fw-semibold d-flex align-items-center">
                  <span className="me-2" style={{ color: "#667eea" }}>⚡</span>
                  Statut initial
                </Form.Label>
                <InputGroup>
                  <InputGroup.Text style={{ 
                    background: "white", 
                    borderRight: "none",
                    borderColor: "#e2e8f0"
                  }}>
                    <FaClock className="text-warning" />
                  </InputGroup.Text>
                  <Form.Control
                    value="En attente"
                    readOnly
                    disabled
                    style={{
                      borderRadius: "0 8px 8px 0",
                      borderLeft: "none",
                      borderColor: "#e2e8f0",
                      fontSize: "0.9rem",
                      padding: "0.75rem",
                      background: "#f8f9fa"
                    }}
                  />
                </InputGroup>
                <small className="text-warning d-flex align-items-center mt-1">
                  <FaClock className="me-1" size={10} />
                  La publication sera soumise pour validation
                </small>
              </Form.Group>
            </Col>
          </Row>
        </div>

        {/* SECTION 2 : Contenu */}
        <div className="mb-4">
          <div className="d-flex align-items-center mb-3">
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              color: "white"
            }}>
              <FaFileAlt size={16} />
            </div>
            <h6 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>Contenu détaillé</h6>
          </div>

          <Form.Group controlId="formContenu">
            <Form.Label className="fw-semibold d-flex align-items-center">
              <span className="me-2" style={{ color: "#4facfe" }}>📄</span>
              Contenu <span className="text-danger ms-1">*</span>
            </Form.Label>
            <div style={{ position: "relative" }}>
              <Form.Control
                as="textarea"
                name="contenu"
                value={newPub.contenu}
                onChange={handleChange}
                rows={6}
                placeholder="Décrivez votre publication en détail..."
                required
                style={{
                  borderRadius: "12px",
                  borderColor: "#e2e8f0",
                  fontSize: "0.9rem",
                  padding: "1rem",
                  resize: "vertical",
                  minHeight: "150px"
                }}
              />
              <div className="position-absolute bottom-0 end-0 m-3">
                <small className={`small ${newPub.contenu.length > 1000 ? 'text-danger' : 'text-muted'}`}>
                  {newPub.contenu.length}/2000 caractères
                </small>
              </div>
            </div>
            <div className="mt-2">
              <small className="text-muted d-flex align-items-center">
                <FaInfoCircle className="me-1" size={10} />
                Utilisez des paragraphes clairs et des listes pour améliorer la lisibilité
              </small>
            </div>
          </Form.Group>

          {/* Conseils d'écriture */}
          <div className="mt-3 p-3 border rounded" style={{ background: "#f0f7ff" }}>
            <div className="d-flex align-items-start mb-2">
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: "#4facfe",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "10px",
                flexShrink: 0,
                color: "white",
                fontSize: "0.8rem"
              }}>
                💡
              </div>
              <div>
                <small className="fw-bold d-block mb-1" style={{ color: "#2c3e50" }}>
                  Conseils pour un bon contenu :
                </small>
                <small className="text-muted d-block">
                  • Soyez précis et concis<br/>
                  • Structurez avec des titres<br/>
                  • Incluez des informations clés<br/>
                  • Relisez avant publication
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3 : Fichiers joints */}
        <div>
          <div className="d-flex align-items-center mb-3">
            <div style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "12px",
              color: "white"
            }}>
              <FaPaperclip size={16} />
            </div>
            <h6 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>Fichiers joints</h6>
          </div>

          {/* Sélecteur de type de fichier */}
          <div className="mb-4">
            <Form.Label className="fw-semibold d-flex align-items-center mb-3">
              <span className="me-2" style={{ color: "#48bb78" }}>📎</span>
              Type de fichier
            </Form.Label>
            <div className="d-flex flex-wrap gap-2">
              {[
                { type: "image", icon: "🖼️", label: "Image", color: "#667eea", iconComp: <FaFileImage /> },
                { type: "video", icon: "🎬", label: "Vidéo", color: "#ed8936", iconComp: <FaFileVideo /> },
                { type: "document", icon: "📄", label: "Document", color: "#48bb78", iconComp: <FaFileAlt /> }
              ].map((item) => (
                <Button
                  key={item.type}
                  variant="outline-primary"
                  onClick={() => handleFileTypeChange(item.type)}
                  className={`d-flex flex-column align-items-center justify-content-center p-3 rounded-3 ${newPub.type_fichier === item.type ? 'active' : ''}`}
                  style={{
                    width: "100px",
                    height: "100px",
                    border: `2px solid ${newPub.type_fichier === item.type ? item.color : '#e2e8f0'}`,
                    background: newPub.type_fichier === item.type ? `${item.color}15` : 'white',
                    color: newPub.type_fichier === item.type ? item.color : '#6c757d',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>
                    {item.iconComp}
                  </div>
                  <small className="fw-semibold" style={{ fontSize: "0.8rem" }}>
                    {item.label}
                  </small>
                </Button>
              ))}
            </div>
          </div>

          {/* Upload de fichier */}
          <div className="mb-3">
            <Form.Label className="fw-semibold d-flex align-items-center">
              <span className="me-2" style={{ color: "#48bb78" }}>📤</span>
              Sélectionnez un fichier
            </Form.Label>
            <div
              style={{
                border: "2px dashed #e2e8f0",
                borderRadius: "12px",
                padding: "2rem",
                textAlign: "center",
                background: "#f8f9fa",
                cursor: "pointer",
                transition: "all 0.3s ease",
                position: "relative",
                minHeight: "120px"
              }}
              onClick={() => document.getElementById('fileInput').click()}
              onDragOver={(e) => {
                e.preventDefault();
                e.currentTarget.style.borderColor = "#667eea";
                e.currentTarget.style.background = "#f0f7ff";
              }}
              onDragLeave={(e) => {
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#f8f9fa";
              }}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files[0];
                if (file) {
                  const event = { target: { name: "fichier", files: [file] } };
                  handleChange(event);
                }
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.background = "#f8f9fa";
              }}
            >
              {previewFile ? (
                <div className="position-relative">
                  {newPub.type_fichier === "image" ? (
                    <div className="text-center">
                      <img
                        src={previewFile.url}
                        alt="Preview"
                        style={{
                          maxWidth: "200px",
                          maxHeight: "150px",
                          borderRadius: "8px",
                          marginBottom: "1rem",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
                        }}
                      />
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span className="text-success fw-semibold">
                          <FaCheckCircle className="me-2" />
                          {previewFile.name}
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                          className="rounded-pill px-3"
                        >
                          <FaTimesCircle className="me-1" />
                          Retirer
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "12px",
                        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                        color: "white",
                        fontSize: "32px"
                      }}>
                        {newPub.type_fichier === "video" ? "🎬" : "📄"}
                      </div>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <span className="text-primary fw-semibold">
                          <FaCheckCircle className="me-2" />
                          {previewFile.name}
                        </span>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFile();
                          }}
                          className="rounded-pill px-3"
                        >
                          <FaTimesCircle className="me-1" />
                          Retirer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <div style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "12px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 1rem",
                    color: "white"
                  }}>
                    <FaUpload size={24} />
                  </div>
                  <h6 className="text-dark fw-semibold mb-2">
                    Glissez-déposez ou cliquez pour uploader
                  </h6>
                  <p className="text-muted small mb-3">
                    Formats supportés: {newPub.type_fichier === "image" 
                      ? "JPG, PNG, GIF (max 5MB)" 
                      : newPub.type_fichier === "video" 
                        ? "MP4, AVI, MOV (max 50MB)" 
                        : "PDF, DOC, XLS (max 10MB)"}
                  </p>
                  <Button
                    variant="outline-primary"
                    className="rounded-pill px-4"
                  >
                    <FaSearch className="me-2" />
                    Parcourir les fichiers
                  </Button>
                </>
              )}
              <input
                id="fileInput"
                type="file"
                name="fichier"
                onChange={handleChange}
                accept={newPub.type_fichier === "image" 
                  ? "image/*" 
                  : newPub.type_fichier === "video" 
                    ? "video/*" 
                    : ".pdf,.doc,.docx,.xls,.xlsx"}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Résumé des limitations */}
          <div className="p-3 border rounded" style={{ background: "#fff8e1" }}>
            <div className="d-flex align-items-start">
              <div style={{
                width: "24px",
                height: "24px",
                borderRadius: "6px",
                background: "#ffc107",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginRight: "10px",
                flexShrink: 0,
                color: "white",
                fontSize: "0.8rem"
              }}>
                ⚠️
              </div>
              <div>
                <small className="fw-bold d-block mb-1" style={{ color: "#2c3e50" }}>
                  Limitations techniques :
                </small>
                <small className="text-muted d-block">
                  • Images: Max 5MB, JPG/PNG/GIF<br/>
                  • Vidéos: Max 50MB, MP4/AVI/MOV<br/>
                  • Documents: Max 10MB, PDF/DOC/XLS<br/>
                  • Taille totale: Max 50MB par publication
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Validation des champs obligatoires */}
        <div className="mt-4 p-3 border rounded" style={{ 
          background: newPub.titre && newPub.contenu ? "#e8f5e9" : "#fff3cd",
          borderColor: newPub.titre && newPub.contenu ? "#c8e6c9" : "#ffeaa7"
        }}>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              {newPub.titre && newPub.contenu ? (
                <FaCheckCircle className="text-success me-2" size={20} />
              ) : (
                <FaExclamationCircle className="text-warning me-2" size={20} />
              )}
              <div>
                <small className="fw-bold d-block" style={{ color: "#2c3e50" }}>
                  {newPub.titre && newPub.contenu ? "Prêt à publier !" : "Champs requis manquants"}
                </small>
                <small className="text-muted d-block">
                  {newPub.titre && newPub.contenu 
                    ? "Tous les champs obligatoires sont remplis." 
                    : "Veuillez remplir le titre et le contenu."}
                </small>
              </div>
            </div>
            <div className="text-end">
              <small className={`fw-bold ${newPub.titre && newPub.contenu ? 'text-success' : 'text-warning'}`}>
                {newPub.titre && newPub.contenu ? "✓" : "!"}
              </small>
            </div>
          </div>
        </div>
      </Form>
    </div>
  </Modal.Body>

  <Modal.Footer className="border-0 p-4" style={{ 
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)", 
    borderBottomLeftRadius: "15px", 
    borderBottomRightRadius: "15px" 
  }}>
    <Button 
      variant="outline-secondary" 
      onClick={handleClose} 
      className="rounded-pill px-4 py-2 d-flex align-items-center" 
      disabled={isSubmitting}
      style={{ 
        fontSize: "0.9rem",
        minWidth: "120px",
        borderColor: "#cbd5e1"
      }}
    >
      <FaTimesCircle className="me-2" size={16} />
      {t("cancel_button")}
    </Button>
    
    <div style={{ flex: 1 }}></div>
    
    <Button
      variant={newPub.titre && newPub.contenu ? "success" : "secondary"}
      onClick={handleSavePublication}
      disabled={isSubmitting || !newPub.titre || !newPub.contenu}
      className="rounded-pill px-4 py-2 d-flex align-items-center shadow-lg"
      style={{
        background: newPub.titre && newPub.contenu 
          ? "linear-gradient(135deg, #48bb78 0%, #38a169 100%)" 
          : "linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)",
        border: "none",
        fontWeight: "600",
        fontSize: "0.9rem",
        minWidth: "160px"
      }}
    >
      {isSubmitting ? (
        <>
          <Spinner animation="border" size="sm" className="me-2" />
          {t("sending")}
        </>
      ) : (
        <>
          {editingPub ? 
            <><FaEdit className="me-2" size={16} /> {t("save_button")}</> : 
            <><FaRocket className="me-2" size={16} /> {t("publish_button")}</>
          }
        </>
      )}
    </Button>
  </Modal.Footer>
</Modal>

      {/* MODAL DE CONFIRMATION DE SUPPRESSION */}
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
            <FaTrash className="me-2" />
            {t("confirm_delete")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4 text-center">
          <div className="mb-4">
            <FaTrash size={48} className="text-danger mb-3" />
            <h5 className="fw-bold mb-2">{t("delete_publication_title")}</h5>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
              {t("delete_publication_message")}
            </p>
            <p className="text-danger small mt-2">
              <strong>{t("irreversible_action")}</strong>
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
          >
            {t("cancel_button")}
          </Button>
          <Button
            variant="danger"
            onClick={handleDeletePublication}
            className="rounded-pill px-4 py-2 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #dc3545 0%, #c82333 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "0.9rem",
              minWidth: "100px"
            }}
          >
            <FaTrash className="me-2" />
            {t("delete_button")}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Styles CSS pour les animations */}
      <style jsx>{`
        .modal-content {
          border-radius: 15px !important;
          border: none !important;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
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
        .publication-card {
          transition: all 0.3s ease;
        }
        .publication-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
        }
        .list-view-item {
          transition: all 0.2s ease;
        }
        .list-view-item:hover {
          background-color: #f8f9fa;
        }
        .modal-content {
          border-radius: 15px !important;
          border: none !important;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
        }

        .form-control:focus, .form-select:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.3rem rgba(102, 126, 234, 0.2) !important;
        }

        /* Animation pour les boutons de type de fichier */
        .file-type-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3) !important;
        }

        .file-type-btn.active {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3) !important;
        }

        /* Style pour la zone de drag & drop */
        .drop-zone:hover {
          border-color: #667eea !important;
          background: #f0f7ff !important;
        }
      `}</style>
    </div>
  );
};

export default PubMembre;