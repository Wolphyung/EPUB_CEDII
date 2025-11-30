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
  Spinner
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

const PubMembre = () => {
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

  const [newPub, setNewPub] = useState({
    titre: "",
    contenu: "",
    fichier: null,
    type_fichier: "image",
    date: new Date().toISOString().split("T")[0],
    categorie: "Actualité",
  });

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

  // Intercepteur pour ajouter le token automatiquement
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

  // Intercepteur pour les erreurs d'authentification
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
  
  // Vérifier si l'utilisateur est l'auteur de la publication
  const isUserAuthor = (publication) => {
    if (!currentUser) return false;
    
    // Si l'utilisateur est admin, il peut tout modifier
    if (currentUser.type === 'admin') return true;
    
    // Comparaison par membre_id
    if (publication.membre_id && currentUser.id) {
      return publication.membre_id === currentUser.id;
    }
    
    // Fallback: comparaison par nom d'auteur
    return publication.auteur === currentUser.nom_complet || 
           publication.auteur === currentUser.nom || 
           publication.auteur === currentUser.email;
  };

  // Vérifier si l'utilisateur peut voir la publication
  const canUserSeePublication = (publication) => {
    if (!currentUser) return false;
    
    // L'admin peut tout voir
    if (currentUser.type === 'admin') return true;
    
    // Les membres ne voient que leurs propres publications
    return isUserAuthor(publication);
  };

  // Badge indicateur "Votre publication"
  const getUserBadge = (publication) => {
    if (isUserAuthor(publication)) {
      return (
        <Badge 
          bg="info" 
          className="ms-2 d-inline-flex align-items-center px-2 py-1"
          style={{ borderRadius: "10px", fontSize: "0.6rem" }}
        >
          <i className="fas fa-user me-1"></i>Votre publication
        </Badge>
      );
    }
    return null;
  };

  // Badge pour les publications anonymes
  const getAnonymeBadge = (publication) => {
    if (publication.auteur === "Anonyme" || !publication.membre_id) {
      return (
        <Badge 
          bg="secondary" 
          className="ms-2 d-inline-flex align-items-center px-2 py-1"
          style={{ borderRadius: "10px", fontSize: "0.6rem" }}
        >
          <i className="fas fa-user-secret me-1"></i>Anonyme
        </Badge>
      );
    }
    return null;
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
          auteur: pub.auteur || "Anonyme",
          statut: (pub.statut || "En attente").toLowerCase().replace(/\s+/g, "_"),
          categorie: pub.categorie || "Actualité",
          membre_id: pub.membre_id,
          total_reactions: pub.total_reactions || 0,
          vues: pub.vues || 0
        }));
        
        // Filtrer les publications selon le type d'utilisateur
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
        showAlert("Erreur de format des données.", "danger");
      }
    } catch (err) {
      console.error('Erreur fetch publications:', err);
      if (err.response?.status === 401) {
        showAlert("Session expirée. Veuillez vous reconnecter.", "danger");
      } else {
        showAlert("Erreur de chargement des publications.", "danger");
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

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
      showAlert("Publication créée avec succès ! En attente de validation.", "success");
      handleClose();
    } catch (err) {
      console.error('Erreur création publication:', err);
      if (err.response?.status === 401) {
        showAlert("Session expirée. Veuillez vous reconnecter.", "danger");
      } else {
        showAlert(`Échec : ${err.response?.data?.message || err.message}`, "danger");
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
      showAlert("Publication modifiée avec succès !", "success");
      handleClose();
    } catch (err) {
      console.error('Erreur modification publication:', err);
      if (err.response?.status === 401) {
        showAlert("Session expirée. Veuillez vous reconnecter.", "danger");
      } else {
        showAlert(`Échec : ${err.response?.data?.message || err.message}`, "danger");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePublication = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) return;
    
    try {
      await apiClient.delete(`/publications/${id}`);
      setPublications((prev) => prev.filter((p) => p.id !== id));
      showAlert("Publication supprimée avec succès.", "success");
    } catch (err) {
      console.error('Erreur suppression publication:', err);
      if (err.response?.status === 401) {
        showAlert("Session expirée. Veuillez vous reconnecter.", "danger");
      } else {
        showAlert("Erreur lors de la suppression de la publication.", "danger");
      }
    }
  };

  const handleSavePublication = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert("Vous devez être connecté pour publier.", "warning");
      return;
    }

    if (!newPub.titre.trim()) {
      showAlert("Le titre est obligatoire.", "warning");
      return;
    }

    if (!newPub.contenu.trim()) {
      showAlert("Le contenu est obligatoire.", "warning");
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
      showAlert("Vous n'êtes pas autorisé à modifier cette publication.", "warning");
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
      validé: { v: "success", t: "Validé", i: "fa-check-circle" },
      en_attente: { v: "warning", t: "En attente", i: "fa-clock" },
      brouillon: { v: "secondary", t: "Brouillon", i: "fa-pencil-alt" },
      rejeté: { v: "danger", t: "Rejeté", i: "fa-times-circle" },
    };
    const c = cfg[statut] || cfg.en_attente;
    return (
      <Badge
        bg={c.v}
        className="d-inline-flex align-items-center px-3 py-2"
        style={{ borderRadius: "15px", fontSize: "0.8rem" }}
      >
        <i className={`fas ${c.i} me-1`}></i>
        {c.t}
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
    if (!name) return "fa-file";
    const ext = name.split(".").pop().toLowerCase();
    const map = {
      pdf: "fa-file-pdf",
      doc: "fa-file-word",
      docx: "fa-file-word",
      xls: "fa-file-excel",
      xlsx: "fa-file-excel",
      jpg: "fa-file-image",
      jpeg: "fa-file-image",
      png: "fa-file-image",
      gif: "fa-file-image",
      mp4: "fa-file-video",
      avi: "fa-file-video",
      mov: "fa-file-video",
      zip: "fa-file-archive",
      rar: "fa-file-archive",
    };
    return map[ext] || "fa-file";
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
      icon: "fa-newspaper",
      color: "#5B11EE",
      bg: "rgba(91, 17, 238, 0.1)",
      count: publications.length,
      label: "Mes publications",
    },
    {
      icon: "fa-check-circle",
      color: "#0671B6",
      bg: "rgba(6, 113, 182, 0.1)",
      count: publications.filter((p) => p.statut === "validé").length,
      label: "Publications Validées",
    },
    {
      icon: "fa-clock",
      color: "#0405BF",
      bg: "rgba(4, 5, 191, 0.1)",
      count: publications.filter((p) => p.statut === "en_attente").length,
      label: "Publications En attente",
    },
    {
      icon: "fa-times-circle",
      color: "#5E5E5E",
      bg: "rgba(94, 94, 94, 0.1)",
      count: publications.filter((p) => p.statut === "rejeté").length,
      label: "Publications Rejetées",
    },
  ];

  const engagementStats = [
    {
      icon: "fa-heart",
      color: "#E91E63",
      bg: "rgba(233, 30, 99, 0.1)",
      count: publications.reduce((sum, pub) => sum + (pub.total_reactions || 0), 0),
      label: "Total Réactions",
    },
    {
      icon: "fa-eye",
      color: "#2196F3",
      bg: "rgba(33, 150, 243, 0.1)",
      count: publications.reduce((sum, pub) => sum + (pub.vues || 0), 0),
      label: "Total Vues",
    },
    {
      icon: "fa-chart-line",
      color: "#4CAF50",
      bg: "rgba(76, 175, 80, 0.1)",
      count: publications.filter(pub => pub.statut === "validé").length,
      label: "Publications Actives",
    },
    {
      icon: "fa-users",
      color: "#FF9800",
      bg: "rgba(255, 152, 0, 0.1)",
      count: [...new Set(publications.map(pub => pub.auteur))].length,
      label: "Auteurs Uniques",
    }
  ];

  /* -------------------------- RENDER -------------------------- */
  if (!currentUser) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div
      className="d-flex min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: sidebarCollapsed ? "80px" : "280px",
          transition: "width 0.3s ease",
          flexShrink: 0,
        }}
      >
        <MembreSidebar onCollapse={setSidebarCollapsed} />
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4 p-md-5" style={{ overflowX: 'hidden' }}>
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

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold mb-2" style={{ color: "#02061E", fontSize: "2.3rem" }}>
              {currentUser.type === 'admin' ? 'Gestion des Publications' : 'Mes Publications'}
            </h1>
            <p className="text-muted mb-0">
              {currentUser.type === 'admin' 
                ? 'Gérez toutes les publications du système' 
                : 'Gérez et consultez vos publications'}
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
            <i className="fas fa-plus-circle me-2"></i>
            Nouvelle Publication
          </Button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" style={{ width: '3rem', height: '3rem' }} />
            <p className="mt-3 text-muted">Chargement des publications...</p>
          </div>
        )}

        {!loading && (
          <>
            {/* STATS CARDS - PUBLICATIONS */}
            <Row className="mb-4 g-4">
              {stats.map((s, i) => (
                <Col xl={3} lg={6} md={6} key={i}>
                  <Card
                    className="border-0 shadow-sm text-center p-4 h-100 position-relative overflow-hidden"
                    style={{
                      borderRadius: "20px",
                      background: "white",
                      transition: "all 0.3s ease",
                      minHeight: "180px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
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
                      <i className={`fas ${s.icon} fs-4`} style={{ color: s.color }}></i>
                    </div>
                    <h3 className="fw-bold mb-1" style={{ color: s.color, fontSize: "1.8rem" }}>
                      {s.count}
                    </h3>
                    <p className="text-muted small mb-0">{s.label}</p>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* STATS CARDS - ENGAGEMENT */}
            <Row className="mb-5 g-4">
              {engagementStats.map((s, i) => (
                <Col xl={3} lg={6} md={6} key={i}>
                  <Card
                    className="border-0 shadow-sm text-center p-4 h-100 position-relative overflow-hidden"
                    style={{
                      borderRadius: "20px",
                      background: "white",
                      transition: "all 0.3s ease",
                      minHeight: "180px"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 15px 30px rgba(0,0,0,0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 5px 15px rgba(0,0,0,0.05)";
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
                      <i className={`fas ${s.icon} fs-4`} style={{ color: s.color }}></i>
                    </div>
                    <h3 className="fw-bold mb-1" style={{ color: s.color, fontSize: "1.8rem" }}>
                      {s.count}
                    </h3>
                    <p className="text-muted small mb-0">{s.label}</p>
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Publications List */}
            <Row className="g-4">
              {publications.length === 0 ? (
                <Col xs={12}>
                  <Card className="text-center border-0 shadow-sm p-5" style={{ borderRadius: "20px", minHeight: "300px" }}>
                    <div className="d-flex flex-column justify-content-center align-items-center h-100">
                      <i className="fas fa-newspaper display-1 text-muted mb-4"></i>
                      <h3 className="text-dark mb-3">Aucune publication</h3>
                      <p className="text-muted mb-4">
                        {currentUser.type === 'admin' 
                          ? 'Aucune publication dans le système' 
                          : 'Commencez par créer votre première publication'}
                      </p>
                      <Button 
                        onClick={handleShow}
                        className="rounded-pill px-4 py-2"
                        style={{
                          background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
                          border: "none"
                        }}
                      >
                        <i className="fas fa-plus me-2"></i>
                        Créer une publication
                      </Button>
                    </div>
                  </Card>
                </Col>
              ) : (
                publications.map((pub) => {
                  const fileUrl = pub.fichier_url;
                  const isImage = pub.type_fichier === "image";
                  const isVideo = pub.type_fichier === "video";
                  const userIsAuthor = isUserAuthor(pub);

                  return (
                    <Col xl={4} lg={6} md={6} key={pub.id}>
                      <Card
                        className="border-0 shadow-sm h-100"
                        style={{
                          borderRadius: "20px",
                          overflow: "hidden",
                          transition: "all 0.3s ease",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-10px)")}
                        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
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
                              {getUserBadge(pub)}
                              {getAnonymeBadge(pub)}
                            </div>
                            {getStatusBadge(pub.statut)}
                          </div>

                          <Card.Title 
                            className="fw-bold mb-2 flex-grow-0" 
                            style={{ fontSize: "1.2rem", color: "#02061E", minHeight: "60px" }}
                          >
                            {pub.titre}
                          </Card.Title>

                          <Card.Text 
                            className="text-muted small mb-3 flex-grow-1" 
                            style={{ lineHeight: "1.6" }}
                          >
                            {pub.contenu.length > 120 ? `${pub.contenu.substring(0, 120)}...` : pub.contenu}
                          </Card.Text>

                          {/* STATISTIQUES D'ENGAGEMENT */}
                          {pub.statut === "validé" && (
                            <div className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded"
                              style={{ background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)" }}>
                              <div className="text-center">
                                <div className="d-flex align-items-center justify-content-center mb-1">
                                  <i className="fas fa-heart text-danger me-2"></i>
                                  <span className="fw-bold" style={{ color: "#E91E63" }}>
                                    {pub.total_reactions || 0}
                                  </span>
                                </div>
                                <small className="text-muted">Réactions</small>
                              </div>
                              <div className="text-center">
                                <div className="d-flex align-items-center justify-content-center mb-1">
                                  <i className="fas fa-eye text-primary me-2"></i>
                                  <span className="fw-bold" style={{ color: "#2196F3" }}>
                                    {pub.vues || 0}
                                  </span>
                                </div>
                                <small className="text-muted">Vues</small>
                              </div>
                              <div className="text-center">
                                <div className="d-flex align-items-center justify-content-center mb-1">
                                  <i className="fas fa-chart-line text-success me-2"></i>
                                  <span className="fw-bold" style={{ color: "#4CAF50" }}>
                                    {pub.vues > 0 ? Math.round(((pub.total_reactions || 0) / pub.vues) * 100) : 0}%
                                  </span>
                                </div>
                                <small className="text-muted">Engagement</small>
                              </div>
                            </div>
                          )}

                          {fileUrl && pub.type_fichier === "document" && (
                            <div className="d-flex align-items-center p-3 border rounded mb-3" style={{ background: "#f8f9fa" }}>
                              <i className={`fas ${getFileIcon(pub.nom_fichier_original)} me-2 text-primary fs-5`}></i>
                              <span className="small text-truncate me-2 flex-grow-1" style={{ maxWidth: "160px" }}>
                                {pub.nom_fichier_original}
                              </span>
                              <Button 
                                size="sm" 
                                variant="outline-primary" 
                                onClick={() => handleDownload(fileUrl, pub.nom_fichier_original)}
                                className="rounded-circle"
                                style={{ width: '32px', height: '32px' }}
                              >
                                <i className="fas fa-download"></i>
                              </Button>
                            </div>
                          )}

                          <div className="d-flex justify-content-between text-muted small mb-3 flex-grow-0">
                            <span><i className="fas fa-calendar me-1"></i>{pub.date}</span>
                            <span><i className="fas fa-user me-1"></i>{pub.auteur}</span>
                          </div>

                          {/* Boutons d'action */}
                          <div className="d-flex justify-content-end gap-2 flex-grow-0">
                            {userIsAuthor ? (
                              <>
                                <Button 
                                  variant="outline-primary" 
                                  size="sm" 
                                  className="rounded-pill px-3" 
                                  onClick={() => handleShowEdit(pub)}
                                  disabled={pub.statut === "validé" && currentUser.type === 'membre'}
                                >
                                  <i className="fas fa-edit me-1"></i>
                                  Modifier
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  className="rounded-pill px-3" 
                                  onClick={() => handleDeletePublication(pub.id)}
                                >
                                  <i className="fas fa-trash me-1"></i>
                                  Supprimer
                                </Button>
                              </>
                            ) : (
                              <Badge bg="secondary" className="px-3 py-2">
                                <i className="fas fa-eye me-1"></i>Lecture seule
                              </Badge>
                            )}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })
              )}
            </Row>
          </>
        )}

        {/* MODAL - FORMULAIRE DE PUBLICATION */}
        <Modal show={showModal} onHide={handleClose} centered size="lg" className="modern-modal">
          <Modal.Header closeButton style={{
            background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
            color: "white",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            padding: "1.5rem 2rem",
            border: 'none'
          }}>
            <Modal.Title className="fw-bold d-flex align-items-center">
              <i className={`fas ${editingPub ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
              {editingPub ? "Modifier la publication" : "Nouvelle publication"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-4 p-md-5" style={{ background: "#f8f9fa", maxHeight: '70vh', overflowY: 'auto' }}>
            <Form>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: "#5B11EE" }}>
                      <i className="fas fa-heading me-2"></i>Titre *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={newPub.titre}
                      onChange={handleChange}
                      required
                      className="shadow-sm border-0"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                        background: "white",
                        fontSize: "1rem",
                        transition: "all 0.2s",
                      }}
                      placeholder="Donnez un titre accrocheur à votre publication"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: "#0405BF" }}>
                      <i className="fas fa-tag me-2"></i>Catégorie
                    </Form.Label>
                    <Form.Select
                      name="categorie"
                      value={newPub.categorie}
                      onChange={handleChange}
                      className="shadow-sm border-0"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                        background: "white",
                      }}
                    >
                      <option value="Actualité">Actualité</option>
                      <option value="Événement">Événement</option>
                      <option value="Offre d'emploi">Offre d'emploi</option>
                      <option value="Formation">Formation</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-4">
                <Form.Label className="fw-semibold mb-3" style={{ color: "#0671B6" }}>
                  <i className="fas fa-align-left me-2"></i>Contenu *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={6}
                  name="contenu"
                  value={newPub.contenu}
                  onChange={handleChange}
                  required
                  className="shadow-sm border-0"
                  style={{
                    borderRadius: "12px",
                    padding: "1rem",
                    background: "white",
                    resize: "none",
                    transition: "all 0.2s",
                  }}
                  placeholder="Rédigez le contenu de votre publication..."
                  maxLength={2000}
                />
                <Form.Text className="text-muted d-block text-end mt-2">
                  {newPub.contenu.length}/2000 caractères
                </Form.Text>
              </Form.Group>

              <Form.Group className="mt-4">
                <Form.Label className="fw-semibold mb-3" style={{ color: "#5E5E5E" }}>
                  <i className="fas fa-paperclip me-2"></i>Type de fichier
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
                        background: newPub.type_fichier === t ? "linear-gradient(135deg, #5B11EE, #0405BF)" : "white",
                        color: newPub.type_fichier === t ? "white" : "#5E5E5E",
                      }}
                    >
                      <i
                        className={`fas fa-${
                          t === "image" ? "image" : t === "video" ? "video" : "file-alt"
                        } me-1`}
                      ></i>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Button>
                  ))}
                </div>
              </Form.Group>

              <Row className="g-4 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: "#5B11EE" }}>
                      <i className="fas fa-upload me-2"></i>
                      {newPub.type_fichier === 'image' ? 'Image' : newPub.type_fichier === 'video' ? 'Vidéo' : 'Document'}
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
                      className="shadow-sm border-0"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                        background: "white",
                      }}
                    />
                    {editingPub?.nom_fichier_original && !newPub.fichier && (
                      <div className="mt-2">
                        <small className="text-muted">
                          <i className="fas fa-paperclip me-1"></i>
                          Fichier actuel : {editingPub.nom_fichier_original}
                        </small>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold mb-3" style={{ color: "#0405BF" }}>
                      <i className="fas fa-calendar me-2"></i>Date de publication
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={newPub.date}
                      onChange={handleChange}
                      className="shadow-sm border-0"
                      style={{
                        borderRadius: "12px",
                        padding: "0.75rem 1rem",
                        background: "white",
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
                    <h6 className="fw-bold mb-0" style={{ color: "#5B11EE" }}>
                      <i className="fas fa-eye me-2"></i>Aperçu du fichier
                    </h6>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={handleRemoveFile}
                      className="rounded-circle"
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className="fas fa-times"></i>
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
                        <i
                          className={`fas ${getFileIcon(previewFile.name)} fa-4x mb-3`}
                          style={{ color: "#0671B6" }}
                        ></i>
                        <p className="fw-semibold text-break">{previewFile.name}</p>
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
            borderBottomLeftRadius: "20px", 
            borderBottomRightRadius: "20px" 
          }}>
            <Button 
              variant="outline-secondary" 
              onClick={handleClose} 
              className="rounded-pill px-4 px-lg-5 py-2" 
              disabled={isSubmitting}
              style={{ minWidth: '120px' }}
            >
              <i className="fas fa-times me-2"></i>Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePublication}
              disabled={isSubmitting}
              className="rounded-pill px-4 px-lg-5 py-2 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
                border: "none",
                fontWeight: "600",
                minWidth: '150px'
              }}
            >
              {isSubmitting ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Envoi...
                </>
              ) : (
                <>
                  <i className={`fas ${editingPub ? 'fa-save' : 'fa-paper-plane'} me-2`}></i>
                  {editingPub ? "Sauvegarder" : "Publier"}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* Custom Styles */}
      <style jsx>{`
        .modern-modal .modal-content {
          border-radius: 20px !important;
          border: none !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2) !important;
          overflow: hidden;
        }
        .form-control:focus,
        .form-select:focus {
          border-color: #5B11EE !important;
          box-shadow: 0 0 0 0.25rem rgba(91, 17, 238, 0.25) !important;
        }
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-10px);
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15) !important;
        }
        .btn {
          transition: all 0.2s ease;
        }
        .btn:hover:not(:disabled) {
          transform: translateY(-2px);
        }
        .badge {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
      `}</style>
    </div>
  );
};

export default PubMembre;