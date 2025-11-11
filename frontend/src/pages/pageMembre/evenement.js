import React, { useState, useEffect, useCallback } from "react";
import { Card, Button, Modal, Form, Row, Col, Badge, Alert, Spinner } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

// 🚀 URL API CORRIGÉE
const BASE_API_URL = "http://127.0.0.1:8000/api"; 
const EVENEMENTS_API_URL = `${BASE_API_URL}/evenements`;

// Configuration axios pour l'authentification
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': token ? `Bearer ${token}` : '',
    'Accept': 'application/json'
  };
};

const EvenementMembre = () => {
  const [showModal, setShowModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  
  const [evenements, setEvenements] = useState([]); 

  const [nouvelEvenement, setNouvelEvenement] = useState({
    titre: "",
    lieu: "",
    description: "",
    date: "",
    heure: "09:00",
    type: "Présentiel", 
    image: null 
  });

  const handleSidebarCollapse = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ ...alert, show: false }), 4000);
  };

  const getFileUrl = (fichier) => {
    if (!fichier) return null;
    if (typeof fichier === 'string') {
      if (fichier.startsWith('http')) return fichier;
      return `${BASE_API_URL}/storage/${fichier.replace(/^\//, '')}`;
    }
    return null;
  };

  const handleDownloadFile = async (fichier, fileName) => {
    try {
      const fileUrl = getFileUrl(fichier);
      if (!fileUrl) {
        showAlert("❌ Fichier non disponible", "error");
        return;
      }
      
      const response = await fetch(fileUrl, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) throw new Error('Erreur de téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'fichier';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showAlert("✅ Téléchargement commencé", "success");
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      showAlert("❌ Erreur lors du téléchargement", "error");
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'fa-file-pdf';
      case 'doc':
      case 'docx': return 'fa-file-word';
      case 'xls':
      case 'xlsx': return 'fa-file-excel';
      case 'ppt':
      case 'pptx': return 'fa-file-powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp': return 'fa-file-image';
      case 'mp4':
      case 'avi':
      case 'mov': return 'fa-file-video';
      case 'mp3':
      case 'wav': return 'fa-file-audio';
      case 'zip':
      case 'rar': return 'fa-file-archive';
      default: return 'fa-file';
    }
  };

  const getFileBadgeVariant = (fileName) => {
    if (!fileName) return 'secondary';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'danger';
      case 'doc':
      case 'docx': return 'primary';
      case 'xls':
      case 'xlsx': return 'success';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'info';
      default: return 'secondary';
    }
  };

  const FilePreviewCard = ({ fichier, fileName }) => {
    if (!fichier) return null;
    const fileUrl = getFileUrl(fichier);
    const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i);
    const isPDF = fileName?.match(/\.pdf$/i);
    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center">
            <i className={`fas ${getFileIcon(fileName)} text-${getFileBadgeVariant(fileName)} me-2`}></i>
            <span className="small fw-semibold">Document joint:</span>
          </div>
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => handleDownloadFile(fichier, fileName)}
            className="d-flex align-items-center"
            style={{ borderRadius: "6px", fontSize: "0.7rem" }}
          >
            <i className="fas fa-download me-1"></i>
            Télécharger
          </Button>
        </div>
        <p className="small text-muted mb-2">{fileName}</p>
        {fileUrl && (
          <div className="text-center">
            {isImage ? (
              <img src={fileUrl} alt="Aperçu" style={{ maxWidth:'100%', maxHeight:'150px', objectFit:'contain', borderRadius:'6px', border:'1px solid #dee2e6' }} />
            ) : (
              <div className="py-2">
                <i className={`fas ${getFileIcon(fileName)} fa-3x text-${getFileBadgeVariant(fileName)} mb-2`}></i>
                <p className="small text-muted mb-0">Cliquez sur "Télécharger" pour voir le document</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const FilePreviewModal = ({ file }) => {
    if (!file) return null;
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';
    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <h6 className="mb-3"><i className="fas fa-eye me-2"></i>Aperçu du fichier</h6>
        {isImage ? (
          <div className="text-center">
            <img src={file.url} alt="Aperçu" style={{ maxWidth:'100%', maxHeight:'200px', objectFit:'contain', borderRadius:'8px' }} />
            <p className="mt-2 mb-0 small text-muted">{file.name}</p>
          </div>
        ) : isPDF ? (
          <div className="text-center">
            <iframe src={file.url} title="Aperçu PDF" style={{ width:'100%', height:'300px', border:'none', borderRadius:'8px' }} />
            <p className="mt-2 mb-0 small text-muted">{file.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <i className={`fas ${getFileIcon(file.name)} fa-3x text-${getFileBadgeVariant(file.name)} mb-2`}></i>
            <p className="mb-0 small text-muted">{file.name}</p>
            <p className="small text-muted">Aperçu non disponible pour ce type de fichier</p>
          </div>
        )}
      </div>
    );
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      'Validé': { variant: "success", text: "Validé", icon: "fa-check-circle" },
      'En attente': { variant: "warning", text: "En attente", icon: "fa-clock" },
      'Rejeté': { variant: "danger", text: "Rejeté", icon: "fa-times-circle" }
    };
    const config = statusConfig[statut] || statusConfig['En attente'];
    return <Badge bg={config.variant} className="d-inline-flex align-items-center px-3 py-2" style={{ borderRadius:"15px", fontSize:"0.8rem" }}><i className={`fas ${config.icon} me-1`}></i>{config.text}</Badge>;
  };

  const getTypeIcon = (type) => {
    const icons = {"Présentiel":"fa-building","En ligne":"fa-globe","Hybride":"fa-exchange-alt"};
    return icons[type] || "fa-calendar";
  };

  const getTypeBadge = (type) => {
    const typeColors = {"Présentiel":"primary","En ligne":"info","Hybride":"warning"};
    return <Badge bg={typeColors[type]||"secondary"} className="px-3 py-2" style={{ borderRadius:"15px", fontSize:"0.8rem" }}><i className={`fas ${getTypeIcon(type)} me-1`}></i>{type}</Badge>;
  };

  const formatDate = (dateString) => {
    try { 
      const date = new Date(dateString); 
      return date.getTime() > 0 ? date.toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'}) : dateString.split(' ')[0]; 
    } catch(e){ 
      return dateString.split(' ')[0] || ''; 
    }
  };

  const getFileName = (fichier) => {
    if (!fichier) return '';
    if (typeof fichier === 'string') return fichier.split('/').pop() || 'Fichier joint';
    if (fichier instanceof File) return fichier.name;
    return 'Fichier joint';
  };

  const fetchEvenements = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(EVENEMENTS_API_URL, {
        headers: getAuthHeaders()
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          showAlert("Session expirée. Veuillez vous reconnecter.", "danger");
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();

      // ✅ Gestion sécurisée de la réponse
      const eventsArray = Array.isArray(data) ? data : data.evenements || data.data || [];
      const formattedData = eventsArray.map(evt => ({
        ...evt,
        date: evt.date_heure ? evt.date_heure.split(' ')[0] : '',
        heure: evt.date_heure ? evt.date_heure.split(' ')[1]?.substring(0,5) : '09:00'
      }));

      setEvenements(formattedData);
    } catch (error) {
      console.error('Erreur fetch evenements:', error);
      showAlert(`Erreur de chargement: ${error.message}`, "danger");
      setEvenements([]);
    } finally { 
      setLoading(false); 
    }
  }, []);

  useEffect(() => { 
    fetchEvenements(); 
  }, [fetchEvenements]);

  const handleShowAdd = () => { 
    setEditMode(false); 
    setCurrentEvent(null); 
    setNouvelEvenement({ 
      titre:"", 
      lieu:"", 
      description:"", 
      date:"", 
      heure:"09:00", 
      type:"Présentiel", 
      image:null 
    }); 
    setPreviewFile(null); 
    setShowModal(true); 
  };

  const handleShowEdit = (event) => { 
    setEditMode(true); 
    setCurrentEvent(event); 
    setNouvelEvenement({ ...event, image:null }); 
    setPreviewFile(null); 
    setShowModal(true); 
  };

  const handleClose = () => { 
    setShowModal(false); 
    setEditMode(false); 
    setCurrentEvent(null); 
    setPreviewFile(null); 
  };

  const handleChange = (e) => { 
    const { name, value, files } = e.target; 
    if (name === "image") { 
      const file = files[0]; 
      setNouvelEvenement({ ...nouvelEvenement, image: file }); 
      if (file) { 
        setPreviewFile({ 
          url: URL.createObjectURL(file), 
          name: file.name, 
          type: file.type 
        }); 
      } else { 
        setPreviewFile(null); 
      } 
    } else { 
      setNouvelEvenement({ ...nouvelEvenement, [name]: value }); 
    } 
  };

  const handleAdd = async () => {
    // Vérifier l'authentification
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert("Vous devez être connecté pour créer un événement", "warning");
      return;
    }

    if (!nouvelEvenement.titre || !nouvelEvenement.lieu || !nouvelEvenement.date || !nouvelEvenement.description) { 
      showAlert("Veuillez remplir tous les champs obligatoires", "warning"); 
      return; 
    }

    const dateHeure = `${nouvelEvenement.date} ${nouvelEvenement.heure}:00`;
    const formData = new FormData();
    formData.append('titre', nouvelEvenement.titre);
    formData.append('description', nouvelEvenement.description);
    formData.append('date_heure', dateHeure);
    formData.append('lieu', nouvelEvenement.lieu);
    formData.append('type', nouvelEvenement.type);
    formData.append('statut', 'En attente');
    if (nouvelEvenement.image) formData.append('fichier', nouvelEvenement.image);
    
    setLoading(true);
    try {
      const response = await fetch(EVENEMENTS_API_URL, { 
        method: 'POST', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) { 
        showAlert(`Événement créé avec succès ! Statut: ${data.statut || 'En attente'}`, "success"); 
        fetchEvenements(); 
      } else { 
        const errorMessages = data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'La création a échoué.'); 
        showAlert(`Erreur: ${errorMessages}`, "danger"); 
      }
    } catch (error) { 
      console.error('Erreur création événement:', error);
      showAlert("Erreur de connexion au serveur ou problème réseau.", "danger"); 
    } finally { 
      setLoading(false); 
      handleClose(); 
    }
  };

  const handleEdit = async () => {
    // Vérifier l'authentification
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert("Vous devez être connecté pour modifier un événement", "warning");
      return;
    }

    if (!nouvelEvenement.titre || !nouvelEvenement.lieu || !nouvelEvenement.date || !nouvelEvenement.description) { 
      showAlert("Veuillez remplir tous les champs obligatoires", "warning"); 
      return; 
    }

    const dateHeure = `${nouvelEvenement.date} ${nouvelEvenement.heure}:00`;
    const formData = new FormData();
    formData.append('_method', 'PUT');
    formData.append('titre', nouvelEvenement.titre);
    formData.append('description', nouvelEvenement.description);
    formData.append('date_heure', dateHeure);
    formData.append('lieu', nouvelEvenement.lieu);
    formData.append('type', nouvelEvenement.type);
    formData.append('statut', currentEvent.statut);
    if (nouvelEvenement.image) formData.append('fichier', nouvelEvenement.image);
    
    setLoading(true);
    try {
      const response = await fetch(`${EVENEMENTS_API_URL}/${currentEvent.id}`, { 
        method: 'POST', 
        body: formData,
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (response.ok) { 
        showAlert("Événement modifié avec succès !", "success"); 
        fetchEvenements(); 
      } else { 
        const errorMessages = data.errors ? Object.values(data.errors).flat().join(' ') : (data.message || 'La modification a échoué.'); 
        showAlert(`Erreur: ${errorMessages}`, "danger"); 
      }
    } catch (error) { 
      console.error('Erreur modification événement:', error);
      showAlert("Erreur de connexion au serveur ou problème réseau.", "danger"); 
    } finally { 
      setLoading(false); 
      handleClose(); 
    }
  };

  const handleDelete = async (id) => {
    // Vérifier l'authentification
    const token = localStorage.getItem('token');
    if (!token) {
      showAlert("Vous devez être connecté pour supprimer un événement", "warning");
      return;
    }

    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet événement ?")) return;
    
    setLoading(true);
    try {
      const response = await fetch(`${EVENEMENTS_API_URL}/${id}`, { 
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok || response.status === 204) { 
        showAlert("Événement supprimé avec succès !", "success"); 
        fetchEvenements(); 
      } else { 
        const data = await response.json(); 
        showAlert(`Erreur: ${data.message || 'La suppression a échoué.'}`, "danger"); 
      }
    } catch (error) { 
      console.error('Erreur suppression événement:', error);
      showAlert("Erreur de connexion au serveur ou problème réseau.", "danger"); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarCollapsed ? "80px" : "280px",
        transition: "width 0.3s ease",
        flexShrink: 0
      }}>
        <MembreSidebar onCollapse={handleSidebarCollapse} />
      </div>

      {/* Contenu Principal */}
      <div className="flex-grow-1" style={{ 
        padding: "30px",
        marginLeft: "0",
        transition: "all 0.3s ease"
      }}>
        {/* Alert */}
        {alert.show && (
          <Alert 
            variant={alert.type} 
            dismissible 
            onClose={() => setAlert({ ...alert, show: false })}
            className="mb-4 border-0 shadow"
            style={{ borderRadius: "15px" }}
          >
            <i className={`fas ${alert.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'} me-2`}></i>
            {alert.message}
          </Alert>
        )}

        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-2" style={{ 
              color: "#2c3e50",
              fontSize: "2.2rem"
            }}>
              🎉 Mes Événements
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
              Gérez et organisez vos événements (en attente de validation Admin)
            </p>
          </div>
          <Button 
            variant="success" 
            onClick={handleShowAdd}
            className="rounded-pill px-4 py-2"
            style={{
              background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "1rem"
            }}
            disabled={loading}
          >
            <i className="fas fa-plus-circle me-2"></i>
            Nouvel Événement
          </Button>
        </div>

        {/* Statistiques rapides */}
        <Row className="mb-5">
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-calendar-alt text-primary fs-4"></i>
              </div>
              <h3 className="fw-bold text-primary">{evenements.length}</h3>
              <p className="text-muted mb-0">Événements total</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-check-circle text-success fs-4"></i>
              </div>
              <h3 className="fw-bold text-success">{evenements.filter(e => e.statut === 'Validé').length}</h3>
              <p className="text-muted mb-0">Événements Validés</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-clock text-warning fs-4"></i>
              </div>
              <h3 className="fw-bold text-warning">{evenements.filter(e => e.statut === 'En attente').length}</h3>
              <p className="text-muted mb-0">Événements En attente</p>
            </Card>
          </Col>
          <Col xl={3} lg={6} className="mb-4">
            <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
              <div className="bg-danger bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                <i className="fas fa-times-circle text-danger fs-4"></i>
              </div>
              <h3 className="fw-bold text-danger">{evenements.filter(e => e.statut === 'Rejeté').length}</h3>
              <p className="text-muted mb-0">Événements Rejetés</p>
            </Card>
          </Col>
        </Row>

        {/* ⏳ Affichage de chargement */}
        {loading && (
          <div className="text-center my-5">
            <Spinner animation="border" variant="primary" role="status" />
            <p className="mt-2 text-primary fw-semibold">Chargement des événements...</p>
          </div>
        )}

        {/* ❌ Événements vides */}
        {!loading && evenements.length === 0 && (
            <Alert variant="info" className="text-center my-5 border-0 shadow" style={{ borderRadius: "15px" }}>
                <i className="fas fa-info-circle me-2"></i>
                Aucun événement trouvé. Créez-en un pour commencer !
            </Alert>
        )}

        {/* ✅ Liste des événements */}
        {!loading && evenements.length > 0 && (
            <Row>
              {evenements.map((evt) => (
                <Col xl={4} lg={6} className="mb-4" key={evt.id}>
                  <Card 
                    className="shadow-lg border-0 h-100"
                    style={{ 
                      borderRadius: "20px",
                      transition: "all 0.3s ease",
                      overflow: "hidden",
                      borderLeft: `4px solid ${
                        evt.statut === "Validé" ? "#28a745" :
                        evt.statut === "En attente" ? "#ffc107" :
                        "#dc3545"
                      }`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 0, 0, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        {getTypeBadge(evt.type)}
                        {getStatusBadge(evt.statut)}
                      </div>
                      
                      <Card.Title 
                        className="fw-bold mb-3"
                        style={{ 
                          color: "#2c3e50",
                          fontSize: "1.3rem",
                          lineHeight: "1.4"
                        }}
                      >
                        {evt.titre}
                      </Card.Title>
                      
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-map-marker-alt text-danger me-2"></i>
                          <span className="fw-semibold">{evt.lieu}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-calendar text-primary me-2"></i>
                          <span>{formatDate(evt.date)}</span>
                        </div>
                        <div className="d-flex align-items-center mb-3">
                          <i className="fas fa-clock text-warning me-2"></i>
                          <span>{evt.heure}</span>
                        </div>
                      </div>

                      <Card.Text 
                        className="text-muted mb-4"
                        style={{ 
                          lineHeight: "1.6",
                          fontSize: "0.95rem"
                        }}
                      >
                        {evt.description?.length > 120 ? `${evt.description.substring(0, 120)}...` : evt.description}
                      </Card.Text>

                      {/* Section Fichier avec aperçu VISUEL - COMME DANS APPEL D'OFFRE */}
                      {evt.fichier && (
                        <FilePreviewCard 
                          fichier={evt.fichier} 
                          fileName={getFileName(evt.fichier)} 
                        />
                      )}

                      {/* Actions */}
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowEdit(evt)}
                          className="rounded-pill flex-grow-1"
                          disabled={evt.statut !== 'En attente' || loading}
                        >
                          <i className="fas fa-edit me-1"></i>
                          Modifier
                        </Button>
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => handleDelete(evt.id)}
                          className="rounded-pill"
                          style={{ width: "45px" }}
                          disabled={loading}
                        >
                          <i className="fas fa-trash"></i>
                        </Button>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
        )}

        {/* Modal d'ajout/modification */}
        <Modal 
          show={showModal} 
          onHide={handleClose} 
          centered
          size="lg"
          className="modern-modal"
        >
          <Modal.Header 
            className="border-0"
            style={{ 
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white",
              borderTopLeftRadius: "20px",
              borderTopRightRadius: "20px"
            }}
          >
            <Modal.Title className="fw-bold">
              <i className="fas fa-calendar-plus me-2"></i>
              {editMode ? "Modifier l'événement" : "Créer un nouvel événement (Envoi en attente)"}
            </Modal.Title>
            <Button 
              variant="link" 
              onClick={handleClose}
              className="text-white p-0"
              style={{ fontSize: "1.5rem" }}
            >
              <i className="fas fa-times"></i>
            </Button>
          </Modal.Header>
          
          <Modal.Body className="p-4">
            <Form>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-heading me-2 text-primary"></i>
                      Titre de l'événement *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="titre"
                      value={nouvelEvenement.titre}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Donnez un titre attractif..."
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-tag me-2 text-success"></i>
                      Type
                    </Form.Label>
                    <Form.Select
                      name="type"
                      value={nouvelEvenement.type}
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    >
                      <option value="Présentiel">Présentiel</option>
                      <option value="En ligne">En ligne</option>
                      <option value="Hybride">Hybride</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-map-marker-alt me-2 text-danger"></i>
                      Lieu *
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="lieu"
                      value={nouvelEvenement.lieu}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      placeholder="Lieu de l'événement..."
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-calendar me-2 text-primary"></i>
                      Date *
                    </Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={nouvelEvenement.date}
                      onChange={handleChange}
                      required
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-clock me-2 text-warning"></i>
                      Heure
                    </Form.Label>
                    <Form.Control
                      type="time"
                      name="heure"
                      value={nouvelEvenement.heure}
                      onChange={handleChange}
                      className="border-0 shadow-sm rounded-3 py-3"
                      style={{ background: "#f8f9fa" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-align-left me-2 text-info"></i>
                  Description *
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="description"
                  value={nouvelEvenement.description}
                  onChange={handleChange}
                  required
                  className="border-0 shadow-sm rounded-3 py-3"
                  placeholder="Décrivez votre événement..."
                  style={{ background: "#f8f9fa", resize: "none" }}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-image me-2 text-warning"></i>
                  Image illustrative
                </Form.Label>
                <Form.Control
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="border-0 shadow-sm rounded-3 py-3"
                  style={{ background: "#f8f9fa" }}
                />
              </Form.Group>

              {/* Aperçu du fichier sélectionné */}
              <FilePreviewModal file={previewFile} />
            </Form>
          </Modal.Body>
          
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={handleClose}
              className="rounded-pill px-4 py-2"
              style={{ fontWeight: "600" }}
              disabled={loading}
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button 
              variant="success" 
              onClick={editMode ? handleEdit : handleAdd}
              className="rounded-pill px-4 py-2"
              style={{
                background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
                border: "none",
                fontWeight: "600"
              }}
              disabled={loading}
            >
              {loading ? (
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
              ) : (
                <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'} me-2`}></i>
              )}
              {editMode ? "Sauvegarder" : "Créer et Envoyer"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default EvenementMembre;