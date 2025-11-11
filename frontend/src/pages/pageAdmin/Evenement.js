import React, { useState, useEffect } from "react";
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
  InputGroup
} from "react-bootstrap";
import axios from "axios";
import { useTranslation } from 'react-i18next';

const API_URL = "http://127.0.0.1:8000/api";

// Composant FilePreviewCard séparé
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
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => onDownload(fichier, fileName)}
          className="d-flex align-items-center"
          style={{ borderRadius: "6px", fontSize: "0.7rem" }}
        >
          <i className="fas fa-download me-1"></i>
          {t('download')}
        </Button>
      </div>
      <p className="small text-muted mb-2">{fileName}</p>
      
      {/* Aperçu du fichier existant */}
      {fileUrl && (
        <div className="text-center">
          {isImage && !imageError ? (
            <img 
              src={fileUrl} 
              alt="Aperçu" 
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

// Composant FilePreviewModal séparé
const FilePreviewModal = ({ file }) => {
  const { t } = useTranslation();

  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';

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
            alt="Aperçu" 
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
            title="Aperçu PDF"
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

// Composant principal Evenement
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

  const [newEvent, setNewEvent] = useState({
    titre: "",
    description: "",
    date_heure: "",
    lieu: "",
    type: "Présentiel",
    statut: "En attente",
    fichier: null,
  });

  // Afficher messages temporairement
  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: "", message: "" });
    }, 5000);
  };

  // Charger les événements
  const fetchEvenements = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/evenements`);
      setEvenements(res.data.data || res.data);
    } catch (err) {
      console.error(err);
      showNotification("error", t('error_load_events'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvenements();
  }, []);

  // Recherche et filtres
  const filteredEvenements = evenements.filter(ev => {
    const matchesSearch = ev.titre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         ev.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatut = filterStatut === "Tous" || ev.statut === filterStatut;
    const matchesType = filterType === "Tous" || ev.type === filterType;
    
    return matchesSearch && matchesStatut && matchesType;
  });

  const clearFilters = () => {
    setSearchQuery("");
    setFilterStatut("Tous");
    setFilterType("Tous");
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setNewEvent({
      titre: "",
      description: "",
      date_heure: "",
      lieu: "",
      type: "Présentiel",
      statut: "En attente",
      fichier: null,
    });
    setPreviewFile(null);
  };

  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setPreviewFile(null);
  };

  // Fonction pour obtenir l'URL du fichier
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setNewEvent({ ...newEvent, fichier: file });
    
    // Prévisualisation du fichier
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPreviewFile({
        url: fileURL,
        name: file.name,
        type: file.type
      });
    } else {
      setPreviewFile(null);
    }
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedEvent({ ...selectedEvent, fichier: file });
    
    // Prévisualisation du fichier
    if (file) {
      const fileURL = URL.createObjectURL(file);
      setPreviewFile({
        url: fileURL,
        name: file.name,
        type: file.type
      });
    } else {
      setPreviewFile(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent(prev => ({ ...prev, [name]: value }));
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedEvent(prev => ({ ...prev, [name]: value }));
  };

  // Ajouter événement
  const handleAddEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData();
    Object.keys(newEvent).forEach(key => {
      if (newEvent[key] !== null) formData.append(key, newEvent[key]);
    });
    try {
      const res = await axios.post(`${API_URL}/evenements`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEvenements(prev => [res.data.data || res.data, ...prev]);
      showNotification("success", t('success_add_event'));
      handleCloseAddModal();
    } catch (err) {
      console.error(err);
      showNotification("error", err.response?.data?.message || t('error_add_event'));
    } finally {
      setLoading(false);
    }
  };

  // SOLUTION CORRIGÉE : Modifier événement avec POST uniquement
  const handleEditEvent = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const formData = new FormData();
      Object.keys(selectedEvent).forEach(key => {
        if (selectedEvent[key] !== null && key !== 'id') {
          formData.append(key, selectedEvent[key]);
        }
      });

      // Utiliser POST avec un endpoint spécifique pour la modification
      const res = await axios.post(`${API_URL}/evenements/${selectedEvent.id}/update`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setEvenements(prev => prev.map(ev => ev.id === selectedEvent.id ? (res.data.data || res.data) : ev));
      showNotification("success", t('success_edit_event'));
      handleCloseEditModal();
    } catch (err) {
      console.error('Erreur modification:', err);
      showNotification("error", err.response?.data?.message || t('error_edit_event'));
    } finally {
      setLoading(false);
    }
  };

  // Supprimer événement
  const handleDeleteEvent = async (id) => {
    if (!window.confirm(t('delete_event_confirmation'))) return;
    try {
      await axios.delete(`${API_URL}/evenements/${id}`);
      setEvenements(prev => prev.filter(ev => ev.id !== id));
      showNotification("success", t('success_delete_event'));
    } catch (err) {
      console.error(err);
      showNotification("error", t('error_delete_event'));
    }
  };

  // SOLUTION CORRIGÉE : Changer statut avec POST uniquement
  const handleChangeStatus = async (id, newStatus) => {
    try {
      // Utiliser POST avec un endpoint spécifique pour le changement de statut
      const res = await axios.post(`${API_URL}/evenements/${id}/status`, {
        statut: newStatus
      });
      
      setEvenements(prev => prev.map(ev => ev.id === id ? (res.data.data || res.data) : ev));
      showNotification("success", t('success_change_status', { status: newStatus }));
    } catch (err) {
      console.error('Erreur changement statut:', err);
      
      // Si l'endpoint spécifique n'existe pas, essayer avec l'endpoint général update
      try {
        const res = await axios.post(`${API_URL}/evenements/${id}/update`, {
          statut: newStatus
        });
        setEvenements(prev => prev.map(ev => ev.id === id ? (res.data.data || res.data) : ev));
        showNotification("success", t('success_change_status', { status: newStatus }));
      } catch (secondErr) {
        console.error('Erreur secondaire:', secondErr);
        showNotification("error", t('error_change_status'));
      }
    }
  };

  const handleShowEditModal = (event) => {
    setSelectedEvent({ ...event });
    setShowEditModal(true);
    setPreviewFile(null);
  };

  // Fonction pour télécharger le fichier
  const handleDownloadFile = async (fichier, fileName) => {
    try {
      const fileUrl = getFileUrl(fichier);
      if (!fileUrl) {
        showNotification("error", t('error_download'));
        return;
      }

      // Pour les fichiers stockés sur le serveur
      if (typeof fichier === 'string') {
        // Créer un lien de téléchargement direct
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName || 'fichier';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // Pour les nouveaux fichiers (File objects)
        const response = await fetch(fileUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'fichier';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
      
      showNotification("success", t('success_download'));
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      showNotification("error", t('error_download'));
    }
  };

  const getStatusVariant = (statut) => {
    switch(statut) {
      case "Validé": return "success";
      case "En attente": return "warning";
      case "Rejeté": return "danger";
      default: return "secondary";
    }
  };

  const getStatusIcon = (statut) => {
    switch(statut) {
      case "Validé": return "fa-check-circle";
      case "En attente": return "fa-clock";
      case "Rejeté": return "fa-times-circle";
      default: return "fa-question-circle";
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "Présentiel": return "fa-building";
      case "En ligne": return "fa-video";
      case "Hybride": return "fa-blender-phone";
      default: return "fa-calendar";
    }
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '';
    const date = new Date(dateTimeString);
    return date.toLocaleString('fr-FR', { 
      day: '2-digit', 
      month:'2-digit', 
      year:'numeric', 
      hour:'2-digit', 
      minute:'2-digit' 
    });
  };

  const getFileName = (fichier) => {
    if (!fichier) return '';
    if (typeof fichier === 'string') return fichier.split('/').pop() || t('attached_file');
    if (fichier instanceof File) return fichier.name;
    return t('attached_file');
  };

  const isUpcoming = (dateTimeString) => {
    if (!dateTimeString) return false;
    return new Date(dateTimeString) > new Date();
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* Alert Notification */}
        {showAlert.show && (
          <Alert 
            variant={showAlert.type === "success" ? "success" : "danger"}
            className="d-flex align-items-center shadow-lg border-0"
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

        {/* En-tête de page */}
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
            onClick={handleShowAddModal} 
            className="d-flex align-items-center shadow-sm"
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
              count: evenements.filter(ev => isUpcoming(ev.date_heure)).length, 
              icon: "fa-clock", 
              color: "linear-gradient(135deg, #00b09b, #96c93d)"
            },
            { 
              title: "validated_events", 
              count: evenements.filter((ev) => ev.statut === "Validé").length, 
              icon: "fa-check-circle", 
              color: "linear-gradient(135deg, #4facfe, #00f2fe)"
            },
            { 
              title: "with_files", 
              count: evenements.filter((ev) => ev.fichier).length, 
              icon: "fa-paperclip", 
              color: "linear-gradient(135deg, #f093fb, #f5576c)"
            }
          ].map((stat, index) => (
            <Col md={3} key={index} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
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
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
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
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    onClick={fetchEvenements}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-refresh"></i>
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Liste des événements */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">{t('loading')}...</span>
            </div>
            <p className="text-muted fw-semibold">{t('loading_events')}</p>
          </div>
        ) : (
          <Row>
            {filteredEvenements.map(ev => (
              <Col md={6} lg={4} key={ev.id} className="mb-4">
                <Card 
                  className="border-0 shadow-sm h-100" 
                  style={{ 
                    borderRadius: "20px", 
                    transition: "transform 0.2s",
                    borderLeft: `4px solid ${
                      ev.statut === "Validé" ? "#28a745" :
                      ev.statut === "En attente" ? "#ffc107" :
                      "#dc3545"
                    }`
                  }}
                >
                  <Card.Body className="d-flex flex-column p-4">
                    {/* En-tête avec titre et statut */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <Card.Title 
                        className="h5 fw-bold mb-0"
                        style={{ 
                          lineHeight: "1.3",
                          color: "#2c3e50"
                        }}
                      >
                        {ev.titre}
                      </Card.Title>
                      <Badge 
                        bg={getStatusVariant(ev.statut)} 
                        className="d-flex align-items-center"
                        style={{ 
                          borderRadius: "20px", 
                          padding: "6px 12px",
                          fontSize: "0.75rem",
                          fontWeight: "600"
                        }}
                      >
                        <i className={`fas ${getStatusIcon(ev.statut)} me-1`}></i>
                        {t(ev.statut)}
                      </Badge>
                    </div>

                    {/* Description */}
                    <Card.Text 
                      className="text-muted flex-grow-1 mb-3" 
                      style={{ lineHeight: "1.5", fontSize: "0.9rem" }}
                    >
                      {ev.description?.length > 120 ? `${ev.description.substring(0, 120)}...` : ev.description}
                    </Card.Text>

                    {/* Informations détaillées */}
                    <div className="small text-muted mb-3">
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-calendar text-primary me-2" style={{ width: "16px" }}></i>
                        <span>{formatDateTime(ev.date_heure)}</span>
                        {isUpcoming(ev.date_heure) && (
                          <Badge bg="info" className="ms-2" style={{ fontSize: "0.65rem" }}>
                            {t('upcoming')}
                          </Badge>
                        )}
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <i className="fas fa-map-marker-alt text-primary me-2" style={{ width: "16px" }}></i>
                        <span>{ev.lieu}</span>
                      </div>
                      
                      <div className="d-flex align-items-center mb-2">
                        <i className={`fas ${getTypeIcon(ev.type)} text-primary me-2`} style={{ width: "16px" }}></i>
                        <span>{t(ev.type.toLowerCase())}</span>
                      </div>

                      {/* Section Fichier avec aperçu VISUEL */}
                      {ev.fichier && (
                        <FilePreviewCard 
                          fichier={ev.fichier} 
                          fileName={getFileName(ev.fichier)}
                          onDownload={handleDownloadFile}
                        />
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-auto pt-3 border-top">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex gap-1">
                          {ev.statut === "En attente" && (
                            <>
                              <Button 
                                variant="outline-success" 
                                size="sm" 
                                onClick={() => handleChangeStatus(ev.id, "Validé")}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "8px" }}
                                title={t('validate')}
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => handleChangeStatus(ev.id, "Rejeté")}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "8px" }}
                                title={t('reject')}
                              >
                                <i className="fas fa-times"></i>
                              </Button>
                            </>
                          )}
                          {ev.statut === "Validé" && (
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handleChangeStatus(ev.id, "Rejeté")}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px" }}
                              title={t('reject')}
                            >
                              <i className="fas fa-times"></i>
                            </Button>
                          )}
                          {ev.statut === "Rejeté" && (
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              onClick={() => handleChangeStatus(ev.id, "Validé")}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px" }}
                              title={t('validate')}
                            >
                              <i className="fas fa-check"></i>
                            </Button>
                          )}
                        </div>
                        
                        <div className="d-flex gap-1">
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            onClick={() => handleShowEditModal(ev)}
                            className="d-flex align-items-center"
                            style={{ borderRadius: "8px" }}
                            title={t('edit')}
                          >
                            <i className="fas fa-edit"></i>
                          </Button>
                          <Button 
                            variant="outline-danger" 
                            size="sm" 
                            onClick={() => handleDeleteEvent(ev.id)}
                            className="d-flex align-items-center"
                            style={{ borderRadius: "8px" }}
                            title={t('delete')}
                          >
                            <i className="fas fa-trash"></i>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
            
            {filteredEvenements.length === 0 && (
              <Col md={12}>
                <Card className="border-0 shadow-sm text-center" style={{ borderRadius: "20px" }}>
                  <Card.Body className="py-5">
                    <i className="fas fa-calendar-times fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
                    <h5 className="text-muted mb-2">{t('no_events_found')}</h5>
                    <p className="text-muted mb-3">{t('no_events_match')}</p>
                    <Button 
                      variant="primary" 
                      onClick={clearFilters}
                      className="d-flex align-items-center mx-auto"
                    >
                      <i className="fas fa-times me-2"></i>
                      {t('clear_filters')}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* Modal Ajouter */}
        <Modal show={showAddModal} onHide={handleCloseAddModal} size="lg" centered>
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
            <Form onSubmit={handleAddEvent}>
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
                      onChange={handleInputChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder={t('event_title_placeholder')}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-chart-line me-2 text-primary"></i>
                      {t('status_label')} *
                    </Form.Label>
                    <Form.Select 
                      name="statut" 
                      value={newEvent.statut} 
                      onChange={handleInputChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="En attente">{t('En attente')}</option>
                      <option value="Validé">{t('Validé')}</option>
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
                  value={newEvent.description} 
                  onChange={handleInputChange} 
                  required 
                  style={{ borderRadius: "10px", padding: "12px" }}
                  placeholder={t('description_placeholder')}
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
                      value={newEvent.date_heure} 
                      onChange={handleInputChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
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
                      onChange={handleInputChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder={t('location_placeholder')}
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
                      value={newEvent.type} 
                      onChange={handleInputChange}
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
                      {t('file_label')}
                    </Form.Label>
                    <Form.Control 
                      type="file" 
                      onChange={handleFileChange} 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      {t('event_file_formats')}
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>

              {/* Aperçu du fichier sélectionné */}
              <FilePreviewModal file={previewFile} />
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={handleCloseAddModal}
              className="d-flex align-items-center"
              style={{ borderRadius: "10px", padding: "10px 20px" }}
            >
              <i className="fas fa-times me-2"></i>
              {t('cancel_button')}
            </Button>
            <Button 
              variant="primary" 
              type="submit"
              onClick={handleAddEvent}
              disabled={loading}
              className="d-flex align-items-center"
              style={{ 
                borderRadius: "10px", 
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none"
              }}
            >
              <i className="fas fa-save me-2"></i>
              {loading ? t('creating') : t('create_event_button')}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Modifier */}
        {selectedEvent && (
          <Modal show={showEditModal} onHide={handleCloseEditModal} size="lg" centered>
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
              <Form onSubmit={handleEditEvent}>
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
                        onChange={handleEditInputChange} 
                        required 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-chart-line me-2 text-primary"></i>
                        {t('status_label')} *
                      </Form.Label>
                      <Form.Select 
                        name="statut" 
                        value={selectedEvent.statut} 
                        onChange={handleEditInputChange}
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value="En attente">{t('En attente')}</option>
                        <option value="Validé">{t('Validé')}</option>
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
                    onChange={handleEditInputChange} 
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
                        onChange={handleEditInputChange} 
                        required 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
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
                        onChange={handleEditInputChange} 
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
                        onChange={handleEditInputChange}
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
                        {t('file_label')}
                      </Form.Label>
                      <Form.Control 
                        type="file" 
                        onChange={handleEditFileChange} 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                      {selectedEvent.fichier && !previewFile && (
                        <div className="mt-2">
                          <small className="text-muted d-block">
                            <i className="fas fa-file me-1"></i>
                            {t('current_file')}: {getFileName(selectedEvent.fichier)}
                          </small>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handleDownloadFile(selectedEvent.fichier, getFileName(selectedEvent.fichier))}
                            className="d-flex align-items-center mt-1"
                            style={{ borderRadius: "6px", fontSize: "0.7rem" }}
                          >
                            <i className="fas fa-download me-1"></i>
                            {t('download')}
                          </Button>
                        </div>
                      )}
                    </Form.Group>
                  </Col>
                </Row>

                {/* Aperçu du fichier sélectionné */}
                <FilePreviewModal file={previewFile} />
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button 
                variant="outline-secondary" 
                onClick={handleCloseEditModal}
                className="d-flex align-items-center"
                style={{ borderRadius: "10px", padding: "10px 20px" }}
              >
                <i className="fas fa-times me-2"></i>
                {t('cancel_button')}
              </Button>
              <Button 
                variant="primary" 
                type="submit"
                onClick={handleEditEvent}
                disabled={loading}
                className="d-flex align-items-center"
                style={{ 
                  borderRadius: "10px", 
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  border: "none"
                }}
              >
                <i className="fas fa-save me-2"></i>
                {loading ? t('modifying') : t('save_button')}
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Evenement;