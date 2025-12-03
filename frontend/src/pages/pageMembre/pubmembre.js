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
  ListGroup
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import LanguageSwitcher from "../../components/LanguageSwitcher";
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
  FaSearch
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000/api";

const PubMembre = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  /* -------------------------- STATE -------------------------- */
  const [showModal, setShowModal] = useState(false);
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

  const canUserSeePublication = (publication) => {
    if (!currentUser) return false;
    if (currentUser.type === 'admin') return true;
    return isUserAuthor(publication);
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

  const handleDeletePublication = async (id) => {
    if (!window.confirm(t("delete_confirmation"))) return;
    
    try {
      await apiClient.delete(`/publications/${id}`);
      setPublications((prev) => prev.filter((p) => p.id !== id));
      showAlert(t("success_delete"), "success");
    } catch (err) {
      console.error('Erreur suppression publication:', err);
      if (err.response?.status === 401) {
        showAlert(t("session_expired"), "danger");
      } else {
        showAlert(t("error_delete"), "danger");
      }
    }
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
        className="d-inline-flex align-items-center px-3 py-2"
        style={{ borderRadius: "15px", fontSize: "0.8rem" }}
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
        style={{ borderRadius: "10px", fontSize: "0.7rem" }}
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

  /* -------------------------- STATISTIQUES -------------------------- */
  const stats = [
    {
      icon: FaNewspaper,
      color: C.primary,
      bg: "rgba(102, 126, 234, 0.1)",
      count: publications.length,
      label: t("my_publications"),
    },
    {
      icon: FaCheckCircle,
      color: C.success,
      bg: "rgba(40, 167, 69, 0.1)",
      count: publications.filter((p) => p.statut === "validé").length,
      label: t("validated_publications"),
    },
    {
      icon: FaClock,
      color: C.warning,
      bg: "rgba(255, 193, 7, 0.1)",
      count: publications.filter((p) => p.statut === "en_attente").length,
      label: t("pending_publications"),
    },
    {
      icon: FaTimesCircle,
      color: C.danger,
      bg: "rgba(220, 53, 69, 0.1)",
      count: publications.filter((p) => p.statut === "rejeté").length,
      label: t("rejected_publications"),
    },
  ];

  const engagementStats = [
    {
      icon: FaHeart,
      color: "#E91E63",
      bg: "rgba(233, 30, 99, 0.1)",
      count: publications.reduce((sum, pub) => sum + (pub.total_reactions || 0), 0),
      label: t("total_reactions"),
    },
    {
      icon: FaEye,
      color: "#2196F3",
      bg: "rgba(33, 150, 243, 0.1)",
      count: publications.reduce((sum, pub) => sum + (pub.vues || 0), 0),
      label: t("total_views"),
    },
    {
      icon: FaChartLine,
      color: "#4CAF50",
      bg: "rgba(76, 175, 80, 0.1)",
      count: publications.filter(pub => pub.statut === "validé").length,
      label: t("active_publications"),
    },
    {
      icon: FaUsers,
      color: "#FF9800",
      bg: "rgba(255, 152, 0, 0.1)",
      count: [...new Set(publications.map(pub => pub.auteur))].length,
      label: t("unique_authors"),
    }
  ];

  /* -------------------------- FILTRAGE -------------------------- */
  const filteredPublications = publications.filter(pub => {
    const matchesSearch = pub.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pub.contenu.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || pub.statut === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
              {currentUser.type === 'admin' ? t("publication_management_title") : t("my_publications")}
            </h1>
            <p style={{ color: C.gray, fontSize: "1rem", margin: 0 }}>
              {currentUser.type === 'admin' 
                ? t("publication_management_subtitle") 
                : t("manage_your_publications")}
            </p>
          </div>
          <Button
            onClick={handleShow}
            className="shadow-lg rounded-pill px-4 px-lg-5 py-2 py-lg-3"
            style={{
              background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "1rem",
              minWidth: "200px"
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
            style={{ borderRadius: "15px" }}
          >
            <i
              className={`fas ${
                alert.type === "success" 
                  ? "fa-check-circle" 
                  : alert.type === "warning"
                  ? "fa-exclamation-triangle"
                  : "fa-exclamation-circle"
              } me-2`}
            ></i>
            {alert.message}
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">{t("loading_publications")}</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Search and Filters */}
            <Card className="shadow-sm border-0 mb-4" style={{ borderRadius: "18px", background: C.cardBg }}>
              <Card.Body className="p-4">
                <Row className="g-3">
                  <Col md={8}>
                    <div className="position-relative">
                      <FaSearch 
                        style={{ 
                          position: "absolute", 
                          left: "15px", 
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
                          borderRadius: "12px",
                          padding: "0.75rem 1rem 0.75rem 45px",
                          border: "1px solid #e9ecef",
                          fontSize: "0.95rem"
                        }}
                      />
                    </div>
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
                      <option value="all">{t("all_status")}</option>
                      <option value="validé">{t("Validé")}</option>
                      <option value="en_attente">{t("En attente")}</option>
                      <option value="rejeté">{t("Rejeté")}</option>
                      <option value="brouillon">{t("Brouillon")}</option>
                    </Form.Select>
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* STATS CARDS - PUBLICATIONS */}
            <Row className="mb-4 g-4">
              {stats.map((s, i) => (
                <Col xl={3} lg={6} md={6} key={i}>
                  <Card
                    className="border-0 shadow-sm text-center p-4 h-100"
                    style={{
                      borderRadius: "18px",
                      background: C.cardBg,
                      cursor: "pointer",
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
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "70px",
                        height: "70px",
                        background: s.bg,
                        border: `3px solid ${s.color}`,
                      }}
                    >
                      <s.icon size={28} style={{ color: s.color }} />
                    </div>
                    <h3 style={{ 
                      fontWeight: "bold", 
                      color: "#2c3e50", 
                      fontSize: "2rem",
                      margin: 0 
                    }}>
                      {s.count}
                    </h3>
                    <p style={{ 
                      fontWeight: "600", 
                      color: C.gray, 
                      margin: 0,
                      fontSize: "0.9rem"
                    }}>
                      {s.label}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* STATS CARDS - ENGAGEMENT */}
            <Row className="mb-5 g-4">
              {engagementStats.map((s, i) => (
                <Col xl={3} lg={6} md={6} key={i}>
                  <Card
                    className="border-0 shadow-sm text-center p-4 h-100"
                    style={{
                      borderRadius: "18px",
                      background: C.cardBg,
                      cursor: "pointer",
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
                    <div
                      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                      style={{
                        width: "70px",
                        height: "70px",
                        background: s.bg,
                        border: `3px solid ${s.color}`,
                      }}
                    >
                      <s.icon size={28} style={{ color: s.color }} />
                    </div>
                    <h3 style={{ 
                      fontWeight: "bold", 
                      color: "#2c3e50", 
                      fontSize: "2rem",
                      margin: 0 
                    }}>
                      {s.count}
                    </h3>
                    <p style={{ 
                      fontWeight: "600", 
                      color: C.gray, 
                      margin: 0,
                      fontSize: "0.9rem"
                    }}>
                      {s.label}
                    </p>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Publications List */}
            {filteredPublications.length === 0 ? (
              <Card className="text-center border-0 shadow-sm p-5" style={{ borderRadius: "20px", minHeight: "300px" }}>
                <div className="d-flex flex-column justify-content-center align-items-center h-100">
                  <FaNewspaper size={80} className="text-muted mb-4" />
                  <h3 className="text-dark mb-3">{t("no_publications_found")}</h3>
                  <p className="text-muted mb-4">
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
                      border: "none"
                    }}
                  >
                    <FaPlusCircle className="me-2" />
                    {t("create_publication")}
                  </Button>
                </div>
              </Card>
            ) : (
              <Row className="g-4">
                {filteredPublications.map((pub) => {
                  const fileUrl = pub.fichier_url;
                  const isImage = pub.type_fichier === "image";
                  const isVideo = pub.type_fichier === "video";
                  const userIsAuthor = isUserAuthor(pub);

                  return (
                    <Col xl={4} lg={6} md={6} key={pub.id}>
                      <Card
                        className="border-0 shadow-sm h-100"
                        style={{
                          borderRadius: "18px",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
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
                        {fileUrl && (isImage || isVideo) && (
                          isImage ? (
                            <Card.Img 
                              variant="top" 
                              src={fileUrl} 
                              style={{ 
                                height: "200px", 
                                objectFit: "cover",
                                cursor: 'pointer'
                              }}
                              onClick={() => window.open(fileUrl, '_blank')}
                            />
                          ) : (
                            <div style={{ height: "200px", background: "#000" }}>
                              <video 
                                src={fileUrl} 
                                controls 
                                style={{ 
                                  width: "100%", 
                                  height: "100%", 
                                  objectFit: "contain" 
                                }} 
                              />
                            </div>
                          )
                        )}

                        <Card.Body className="p-4 d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center flex-wrap gap-1">
                              {getCategoryBadge(pub.categorie)}
                              {userIsAuthor && (
                                <Badge 
                                  bg="info" 
                                  className="ms-2 d-inline-flex align-items-center px-2 py-1"
                                  style={{ borderRadius: "10px", fontSize: "0.6rem" }}
                                >
                                  <FaUser size={10} className="me-1" />
                                  {t("your_publication")}
                                </Badge>
                              )}
                              {pub.auteur === "Anonyme" && (
                                <Badge 
                                  bg="secondary" 
                                  className="ms-2 d-inline-flex align-items-center px-2 py-1"
                                  style={{ borderRadius: "10px", fontSize: "0.6rem" }}
                                >
                                  <FaUser size={10} className="me-1" />
                                  {t("anonymous")}
                                </Badge>
                              )}
                            </div>
                            {getStatusBadge(pub.statut)}
                          </div>

                          <Card.Title 
                            className="fw-bold mb-2" 
                            style={{ fontSize: "1.2rem", color: "#2c3e50", minHeight: "60px" }}
                          >
                            {pub.titre}
                          </Card.Title>

                          <Card.Text 
                            className="text-muted small mb-3 flex-grow-1" 
                            style={{ lineHeight: "1.6" }}
                          >
                            {pub.contenu.length > 120 ? `${pub.contenu.substring(0, 120)}...` : pub.contenu}
                          </Card.Text>

                          {/* ENGAGEMENT STATISTICS */}
                          {pub.statut === "validé" && (
                            <div className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded"
                              style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
                              <div className="text-center">
                                <div className="d-flex align-items-center justify-content-center mb-1">
                                  <FaHeart className="text-danger me-2" />
                                  <span className="fw-bold" style={{ color: "#E91E63" }}>
                                    {pub.total_reactions || 0}
                                  </span>
                                </div>
                                <small className="text-muted">{t("reactions")}</small>
                              </div>
                              <div className="text-center">
                                <div className="d-flex align-items-center justify-content-center mb-1">
                                  <FaEye className="text-primary me-2" />
                                  <span className="fw-bold" style={{ color: "#2196F3" }}>
                                    {pub.vues || 0}
                                  </span>
                                </div>
                                <small className="text-muted">{t("views")}</small>
                              </div>
                              <div className="text-center">
                                <div className="d-flex align-items-center justify-content-center mb-1">
                                  <FaChartLine className="text-success me-2" />
                                  <span className="fw-bold" style={{ color: "#4CAF50" }}>
                                    {pub.vues > 0 ? Math.round(((pub.total_reactions || 0) / pub.vues) * 100) : 0}%
                                  </span>
                                </div>
                                <small className="text-muted">{t("engagement")}</small>
                              </div>
                            </div>
                          )}

                          {fileUrl && pub.type_fichier === "document" && (
                            <div className="d-flex align-items-center p-3 border rounded mb-3" style={{ background: "#f8f9fa" }}>
                              {getFileIcon(pub.nom_fichier_original)}
                              <span className="small text-truncate ms-2 me-2 flex-grow-1" style={{ maxWidth: "160px" }}>
                                {pub.nom_fichier_original}
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                onClick={() => handleDownload(fileUrl, pub.nom_fichier_original)}
                                className="rounded-circle"
                                style={{ width: '32px', height: '32px' }}
                              >
                                <FaDownload size={14} />
                              </Button>
                            </div>
                          )}

                          <div className="d-flex justify-content-between text-muted small mb-3">
                            <span><FaCalendar className="me-1" />{pub.date}</span>
                            <span><FaUser className="me-1" />{pub.auteur}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="d-flex justify-content-end gap-2">
                            {userIsAuthor ? (
                              <>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="rounded-pill px-3" 
                                  onClick={() => handleShowEdit(pub)}
                                  disabled={pub.statut === "validé" && currentUser.type === 'membre'}
                                >
                                  <FaEdit className="me-1" />
                                  {t("edit")}
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  className="rounded-pill px-3" 
                                  onClick={() => handleDeletePublication(pub.id)}
                                >
                                  <FaTrash className="me-1" />
                                  {t("delete")}
                                </Button>
                              </>
                            ) : (
                              <Badge bg="secondary" className="px-3 py-2">
                                <FaEye className="me-1" />
                                {t("read_only")}
                              </Badge>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
            )}
          </>
        )}
      </div>

      {/* MODAL - PUBLICATION FORM */}
      <Modal show={showModal} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderTopLeftRadius: "18px",
          borderTopRightRadius: "18px",
          padding: "1.5rem 2rem",
          border: 'none'
        }}>
          <Modal.Title className="fw-bold d-flex align-items-center">
            {editingPub ? <FaEdit className="me-2" /> : <FaPlusCircle className="me-2" />}
            {editingPub ? t("edit_publication_modal") : t("add_publication_modal")}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4 p-md-5" style={{ background: "#f8f9fa" }}>
          <Form>
            <Row className="g-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-3" style={{ color: C.primary }}>
                    <FaNewspaper className="me-2" />{t("publication_title")}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="titre"
                    value={newPub.titre}
                    onChange={handleChange}
                    required
                    className="shadow-sm"
                    style={{
                      borderRadius: "12px",
                      padding: "0.75rem 1rem",
                      fontSize: "1rem",
                    }}
                    placeholder={t("title_placeholder")}
                  />
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-3" style={{ color: C.secondary }}>
                    <FaEdit className="me-2" />{t("category_label")}
                  </Form.Label>
                  <Form.Select
                    name="categorie"
                    value={newPub.categorie}
                    onChange={handleChange}
                    className="shadow-sm"
                    style={{
                      borderRadius: "12px",
                      padding: "0.75rem 1rem",
                    }}
                  >
                    <option value="Actualité">{t("Actualité")}</option>
                    <option value="Événement">{t("Événement")}</option>
                    <option value="Offre d'emploi">{t("Offre d'emploi")}</option>
                    <option value="Formation">{t("Formation")}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mt-4">
              <Form.Label className="fw-semibold mb-3" style={{ color: C.accent }}>
                <FaFileAlt className="me-2" />{t("content_label")}
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                name="contenu"
                value={newPub.contenu}
                onChange={handleChange}
                required
                className="shadow-sm"
                style={{
                  borderRadius: "12px",
                  padding: "1rem",
                  resize: "none",
                }}
                placeholder={t("content_placeholder")}
                maxLength={2000}
              />
              <Form.Text className="text-muted d-block text-end mt-2">
                {newPub.contenu.length}/2000 {t("characters")}
              </Form.Text>
            </Form.Group>

            <Form.Group className="mt-4">
              <Form.Label className="fw-semibold mb-3" style={{ color: C.gray }}>
                <FaPaperclip className="me-2" />{t("file_type_label")}
              </Form.Label>
              <div className="d-flex gap-2 flex-wrap">
                {["image", "video", "document"].map((t) => (
                  <Button
                    key={t}
                    variant={newPub.type_fichier === t ? "primary" : "outline-secondary"}
                    size="sm"
                    onClick={() => handleFileTypeChange(t)}
                    className="rounded-pill px-3"
                    style={{
                      fontWeight: "600",
                      border: newPub.type_fichier === t ? "none" : "2px solid #ced4da",
                      background: newPub.type_fichier === t ? "linear-gradient(135deg, #667eea, #764ba2)" : "white",
                      color: newPub.type_fichier === t ? "white" : "#5E5E5E",
                    }}
                  >
                    {t === "image" ? <FaFileImage className="me-1" /> : 
                     t === "video" ? <FaFileVideo className="me-1" /> : 
                     <FaFileAlt className="me-1" />}
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </Button>
                ))}
              </div>
            </Form.Group>

            <Row className="g-4 mt-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-3" style={{ color: C.primary }}>
                    <FaArrowUp className="me-2" />
                    {newPub.type_fichier === 'image' ? t("image") : 
                     newPub.type_fichier === 'video' ? t("video") : 
                     t("document")}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="fichier"
                    onChange={handleChange}
                    accept={
                      newPub.type_fichier === "image"
                        ? "image/*"
                        : newPub.type_fichier === "video"
                        ? "video/*"
                        : ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                    }
                    className="shadow-sm"
                    style={{
                      borderRadius: "12px",
                      padding: "0.75rem 1rem",
                    }}
                  />
                  {editingPub?.nom_fichier_original && !newPub.fichier && (
                    <div className="mt-2">
                      <small className="text-muted">
                        <FaPaperclip className="me-1" />
                        {t("current_file")}: {editingPub.nom_fichier_original}
                      </small>
                    </div>
                  )}
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold mb-3" style={{ color: C.secondary }}>
                    <FaCalendar className="me-2" />{t("publication_date")}
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={newPub.date}
                    onChange={handleChange}
                    className="shadow-sm"
                    style={{
                      borderRadius: "12px",
                      padding: "0.75rem 1rem",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {previewFile && (
              <div
                className="mt-4 p-4 border-0 rounded shadow-sm"
                style={{
                  background: "white",
                  borderRadius: "15px",
                }}
              >
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0" style={{ color: C.primary }}>
                    <FaEye className="me-2" />{t("file_preview")}
                  </h6>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={handleRemoveFile}
                    className="rounded-circle"
                    style={{ width: '32px', height: '32px' }}
                  >
                    <FaTimesCircle />
                  </Button>
                </div>
                <div className="text-center">
                  {previewFile.type.startsWith("image/") ? (
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
                  ) : previewFile.type.startsWith("video/") ? (
                    <video
                      src={previewFile.url}
                      controls
                      className="w-100"
                      style={{
                        maxHeight: "220px",
                        borderRadius: "12px",
                        boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
                      }}
                    />
                  ) : (
                    <div className="p-4 text-center">
                      {getFileIcon(previewFile.name)}
                      <p className="fw-semibold text-break mt-3">{previewFile.name}</p>
                      <small className="text-muted">{t("document_to_download")}</small>
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
            <FaTimesCircle className="me-2" />{t("cancel_button")}
          </Button>
          <Button
            variant="primary"
            onClick={handleSavePublication}
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
                {t("sending")}
              </>
            ) : (
              <>
                {editingPub ? <FaEdit className="me-2" /> : <FaRocket className="me-2" />}
                {editingPub ? t("save_button") : t("publish_button")}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Language Switcher in Footer */}
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
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2) !important;
        }
        .form-control:focus,
        .form-select:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25) !important;
        }
      `}</style>
    </div>
  );
};

export default PubMembre;