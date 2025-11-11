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
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import axios from "axios";

const API_URL = "http://localhost:8000/api/publications";

const PubMembre = () => {
  /* -------------------------- STATE -------------------------- */
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [publications, setPublications] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPub, setEditingPub] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const [newPub, setNewPub] = useState({
    titre: "",
    contenu: "",
    fichier: null,
    type_fichier: "image",
    date: new Date().toISOString().split("T")[0],
    categorie: "Actualité",
  });

  /* -------------------------- CONFIGURATION AXIOS -------------------------- */
  // Fonction pour obtenir les headers avec le token
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'multipart/form-data',
      'Authorization': token ? `Bearer ${token}` : '',
      'Accept': 'application/json'
    };
  };

  // Instance axios configurée
  const apiClient = axios.create({
    baseURL: 'http://localhost:8000/api',
    timeout: 10000,
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

  /* -------------------------- CLEANUP -------------------------- */
  useEffect(() => {
    return () => {
      if (previewFile?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  /* -------------------------- FETCH -------------------------- */
  const fetchPublications = useCallback(async () => {
    try {
      const { data } = await apiClient.get('/publications');
      const adapted = data.map((pub) => ({
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
      }));
      setPublications(adapted.reverse());
    } catch (err) {
      console.error('Erreur fetch publications:', err);
      if (err.response?.status === 401) {
        showAlert("Session expirée. Veuillez vous reconnecter.", "danger");
      } else {
        showAlert("Erreur de chargement des publications.", "danger");
      }
    }
  }, []);

  useEffect(() => {
    fetchPublications();
  }, [fetchPublications]);

  /* -------------------------- CRUD -------------------------- */
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
      await apiClient.post('/publications', createFormData());
      await fetchPublications();
      showAlert("Créée ! En attente de validation.", "success");
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
      const fd = createFormData();
      fd.append("_method", "PUT");
      await apiClient.post(`/publications/${editingPub.id}`, fd);
      await fetchPublications();
      showAlert("Modifiée avec succès !", "success");
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
    if (!window.confirm("Supprimer cette publication ?")) return;
    try {
      await apiClient.delete(`/publications/${id}`);
      setPublications((prev) => prev.filter((p) => p.id !== id));
      showAlert("Supprimée.", "success");
    } catch (err) {
      console.error('Erreur suppression publication:', err);
      if (err.response?.status === 401) {
        showAlert("Session expirée. Veuillez vous reconnecter.", "danger");
      } else {
        showAlert("Erreur de suppression.", "danger");
      }
    }
  };

  const handleSavePublication = () => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert("Vous devez être connecté pour publier.", "warning");
      return;
    }

    if (!newPub.titre || !newPub.contenu) {
      showAlert("Titre et contenu obligatoires.", "warning");
      return;
    }
    editingPub ? handleUpdatePublication() : handleAddPublication();
  };

  /* -------------------------- MODAL -------------------------- */
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
    setTimeout(() => setAlert({ ...alert, show: false }), 4000);
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
      Événement: "success",
      Actualité: "info",
      Formation: "warning",
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
    a.click();
  };

  /* -------------------------- STATS - CEDII 2025 -------------------------- */
  const stats = [
    {
      icon: "fa-building",
      color: "#5B11EE",
      bg: "rgba(91, 17, 238, 0.1)",
      count: publications.length,
      label: "Publications total",
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

  /* -------------------------- RENDER -------------------------- */
  return (
    <div
      className="d-flex min-vh-100"
      style={{
        background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)",
        fontFamily: "'Segoe UI', sans-serif",
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

      {/* Main */}
      <div className="flex-grow-1 p-4 p-md-5">
        {/* Alert */}
        {alert.show && (
          <Alert
            variant={alert.type}
            dismissible
            onClose={() => setAlert({ ...alert, show: false })}
            className="shadow-sm border-0"
            style={{ borderRadius: "15px" }}
          >
            <i
              className={`fas ${
                alert.type === "success" ? "fa-check-circle" : "fa-exclamation-triangle"
              } me-2`}
            ></i>
            {alert.message}
          </Alert>
        )}

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 className="fw-bold mb-2" style={{ color: "#02061E", fontSize: "2.3rem" }}>
              Gestion des Publications
            </h1>
            <p className="text-muted">Gérez et publiez du contenu avec fichiers</p>
          </div>
          <Button
            onClick={handleShow}
            className="shadow-lg rounded-pill px-5 py-3"
            style={{
              background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "1.1rem",
            }}
          >
            <i className="fas fa-plus-circle me-2"></i>Nouvelle Publication
          </Button>
        </div>

        {/* STATS CARDS */}
        <Row className="mb-5 g-4">
          {stats.map((s, i) => (
            <Col xl={3} lg={6} key={i}>
              <Card
                className="border-0 shadow-sm text-center p-4 h-100 position-relative overflow-hidden"
                style={{
                  borderRadius: "20px",
                  background: "white",
                  transition: "all 0.3s ease",
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
                  <i className={`fas ${s.icon} fs-3`} style={{ color: s.color }}></i>
                </div>
                <h3 className="fw-bold mb-1" style={{ color: s.color, fontSize: "1.8rem" }}>
                  {s.count}
                </h3>
                <p className="text-muted small mb-0">{s.label}</p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Publications */}
        <Row className="g-4">
          {publications.map((pub) => {
            const fileUrl = pub.fichier_url;
            const isImage = pub.type_fichier === "image";
            const isVideo = pub.type_fichier === "video";

            return (
              <Col xl={4} lg={6} key={pub.id}>
                <Card
                  className="border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "20px",
                    overflow: "hidden",
                    transition: "0.3s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-10px)")}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
                >
                  {fileUrl && (isImage || isVideo) && (
                    isImage ? (
                      <Card.Img variant="top" src={fileUrl} style={{ height: "200px", objectFit: "cover" }} />
                    ) : (
                      <div style={{ height: "200px", background: "#000" }}>
                        <video src={fileUrl} controls style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                      </div>
                    )
                  )}

                  <Card.Body className="p-4">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      {getCategoryBadge(pub.categorie)}
                      {getStatusBadge(pub.statut)}
                    </div>

                    <Card.Title className="fw-bold mb-2" style={{ fontSize: "1.2rem", color: "#02061E" }}>
                      {pub.titre}
                    </Card.Title>

                    <Card.Text className="text-muted small mb-3" style={{ lineHeight: "1.6" }}>
                      {pub.contenu.length > 100 ? `${pub.contenu.substring(0, 100)}...` : pub.contenu}
                    </Card.Text>

                    {fileUrl && pub.type_fichier === "document" && (
                      <div className="d-flex align-items-center p-3 border rounded mb-3" style={{ background: "#f8f9fa" }}>
                        <i className={`fas ${getFileIcon(pub.nom_fichier_original)} me-2 text-primary fs-5`}></i>
                        <span className="small text-truncate me-2" style={{ maxWidth: "160px" }}>
                          {pub.nom_fichier_original}
                        </span>
                        <Button size="sm" variant="outline-primary" onClick={() => handleDownload(fileUrl, pub.nom_fichier_original)}>
                          <i className="fas fa-download"></i>
                        </Button>
                      </div>
                    )}

                    <div className="d-flex justify-content-between text-muted small mb-3">
                      <span><i className="fas fa-calendar me-1"></i>{pub.date}</span>
                      <span><i className="fas fa-user me-1"></i>{pub.auteur}</span>
                    </div>

                    <div className="d-flex justify-content-end gap-2">
                      <Button variant="outline-primary" size="sm" className="rounded-pill" onClick={() => handleShowEdit(pub)}>
                        <i className="fas fa-edit"></i>
                      </Button>
                      <Button variant="outline-danger" size="sm" className="rounded-pill" onClick={() => handleDeletePublication(pub.id)}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* MODAL - FORMULAIRE COMPLET */}
        <Modal show={showModal} onHide={handleClose} centered size="lg" className="modern-modal">
          <Modal.Header closeButton style={{
            background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
            color: "white",
            borderTopLeftRadius: "20px",
            borderTopRightRadius: "20px",
            padding: "1.5rem 2rem"
          }}>
            <Modal.Title className="fw-bold">
              <i className={`fas ${editingPub ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
              {editingPub ? "Modifier la publication" : "Nouvelle publication"}
            </Modal.Title>
          </Modal.Header>

          <Modal.Body className="p-5" style={{ background: "#f8f9fa" }}>
            <Form>
              <Row className="g-4">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ color: "#5B11EE" }}>
                      <i className="fas fa-heading me-2"></i>Titre *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={newPub.titre}
                      onChange={handleChange}
                      required
                      className="shadow-sm"
                      style={{
                        borderRadius: "15px",
                        border: "2px solid #e9ecef",
                        padding: "0.75rem 1rem",
                        background: "white",
                        fontSize: "1rem",
                        transition: "all 0.2s",
                      }}
                      placeholder="Titre accrocheur"
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ color: "#0405BF" }}>
                      <i className="fas fa-tag me-2"></i>Catégorie
                    </Form.Label>
                    <Form.Select
                      name="categorie"
                      value={newPub.categorie}
                      onChange={handleChange}
                      className="shadow-sm"
                      style={{
                        borderRadius: "15px",
                        border: "2px solid #e9ecef",
                        padding: "0.75rem 1rem",
                        background: "white",
                      }}
                    >
                      <option>Actualité</option>
                      <option>Événement</option>
                      <option>Offre d'emploi</option>
                      <option>Formation</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mt-4">
                <Form.Label className="fw-semibold" style={{ color: "#0671B6" }}>
                  <i className="fas fa-align-left me-2"></i>Contenu *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="contenu"
                  value={newPub.contenu}
                  onChange={handleChange}
                  required
                  className="shadow-sm"
                  style={{
                    borderRadius: "15px",
                    border: "2px solid #e9ecef",
                    padding: "1rem",
                    background: "white",
                    resize: "none",
                    transition: "all 0.2s",
                  }}
                  placeholder="Rédigez votre contenu..."
                  maxLength={1000}
                />
                <Form.Text className="text-muted d-block text-end">
                  {newPub.contenu.length}/1000
                </Form.Text>
              </Form.Group>

              <Form.Group className="mt-4">
                <Form.Label className="fw-semibold" style={{ color: "#5E5E5E" }}>
                  <i className="fas fa-paperclip me-2"></i>Type de fichier
                </Form.Label>
                <div className="d-flex gap-2">
                  {["image", "video", "document"].map((t) => (
                    <Button
                      key={t}
                      variant={newPub.type_fichier === t ? "primary" : "outline-secondary"}
                      size="sm"
                      onClick={() => handleFileTypeChange(t)}
                      className="rounded-pill px-4"
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
                    <Form.Label className="fw-semibold" style={{ color: "#5B11EE" }}>
                      <i className="fas fa-upload me-2"></i>Fichier
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
                          : ".pdf,.doc,.docx,.xls,.xlsx"
                      }
                      className="shadow-sm"
                      style={{
                        borderRadius: "15px",
                        border: "2px solid #e9ecef",
                        padding: "0.75rem 1rem",
                        background: "white",
                      }}
                    />
                    {editingPub?.nom_fichier_original && !newPub.fichier && (
                      <small className="text-muted d-block mt-1">
                        <i className="fas fa-check text-success me-1"></i>
                        Actuel : {editingPub.nom_fichier_original}
                      </small>
                    )}
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold" style={{ color: "#0405BF" }}>
                      <i className="fas fa-calendar me-2"></i>Date de publication
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={newPub.date}
                      onChange={handleChange}
                      className="shadow-sm"
                      style={{
                        borderRadius: "15px",
                        border: "2px solid #e9ecef",
                        padding: "0.75rem 1rem",
                        background: "white",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {previewFile && (
                <div
                  className="mt-4 p-4 border rounded shadow-sm"
                  style={{
                    background: "white",
                    borderRadius: "15px",
                    border: "2px solid #e9ecef",
                  }}
                >
                  <h6 className="fw-bold mb-3" style={{ color: "#5B11EE" }}>
                    <i className="fas fa-eye me-2"></i>Aperçu du fichier
                  </h6>
                  <div className="text-center">
                    {previewFile.type.startsWith("image/") ? (
                      <img
                        src={previewFile.url}
                        alt="Aperçu"
                        style={{
                          maxHeight: "220px",
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
                      <div className="p-4">
                        <i
                          className={`fas ${getFileIcon(previewFile.name)} fa-4x mb-3`}
                          style={{ color: "#0671B6" }}
                        ></i>
                        <p className="fw-semibold">{previewFile.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Form>
          </Modal.Body>

          <Modal.Footer className="border-0 p-4" style={{ background: "#f8f9fa", borderBottomLeftRadius: "20px", borderBottomRightRadius: "20px" }}>
            <Button variant="outline-secondary" onClick={handleClose} className="rounded-pill px-5 py-2" disabled={isSubmitting}>
              <i className="fas fa-times me-2"></i>Annuler
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePublication}
              disabled={isSubmitting}
              className="rounded-pill px-5 py-2 shadow-lg"
              style={{
                background: "linear-gradient(135deg, #5B11EE 0%, #0405BF 100%)",
                border: "none",
                fontWeight: "600"
              }}
            >
              <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} me-2`}></i>
              {isSubmitting ? "Envoi..." : editingPub ? "Sauvegarder" : "Publier"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>

      {/* CSS CEDII 2025 */}
      <style jsx>{`
        :root {
          --cedii-purple: #5B11EE;
          --cedii-blue: #0405BF;
          --cedii-dark: #02061E;
          --cedii-cyan: #0671B6;
          --cedii-gray: #5E5E5E;
        }
        .modern-modal .modal-content {
          border-radius: 20px !important;
          border: none !important;
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2) !important;
          overflow: hidden;
        }
        .form-control:focus,
        .form-select:focus {
          border-color: var(--cedii-purple) !important;
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
        .btn:hover {
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default PubMembre;