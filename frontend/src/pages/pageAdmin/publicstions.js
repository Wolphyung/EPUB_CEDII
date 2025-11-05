import React, { useState, useEffect } from "react"; 
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
  Dropdown
} from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";
import { 
  fetchPublications, 
  addPublication, 
  updatePublication, 
  deletePublication, 
  validatePublication 
} from "../../services/api";

const Publication = () => {
  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPub, setSelectedPub] = useState(null);
  const [publications, setPublications] = useState([]);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Catégories prédéfinies
  const categories = [
    "Technologie",
    "Santé",
    "Éducation",
    "Sport",
    "Culture",
    "Économie",
    "Politique",
    "Environnement",
    "Science",
    "Voyage",
    "Mode",
    "Cuisine",
    "Automobile",
    "Immobilier",
    "Divertissement"
  ];

  const [newPub, setNewPub] = useState({
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
    id_utilisateur: null
  });

  // Charger les publications
  useEffect(() => {
    loadPublications();
  }, []);

  // Nettoyer les URLs
  useEffect(() => {
    return () => {
      publications.forEach(pub => {
        if (pub.fichier_url && pub.fichier_url.startsWith('blob:')) {
          URL.revokeObjectURL(pub.fichier_url);
        }
      });
      if (previewFile && previewFile.url.startsWith('blob:')) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [publications, previewFile]);

  const loadPublications = async () => {
    try {
      setLoading(true);
      const res = await fetchPublications();
      setPublications(res.data.data || res.data);
    } catch (err) {
      console.error("Erreur chargement publications:", err);
      showNotification("error", "Erreur lors du chargement des publications");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: "", message: "" });
    }, 4000);
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    
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

  // Changement des champs
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "fichier") {
      const file = files[0];
      setNewPub({ ...newPub, fichier: file });
      
      // Prévisualisation du fichier
      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({
          url: fileURL,
          name: file.name,
          type: file.type
        });
        
        // Déterminer automatiquement le type de fichier
        const fileType = getFileTypeFromFile(file);
        setNewPub(prev => ({ ...prev, type_fichier: fileType }));
      } else {
        setPreviewFile(null);
      }
    } else {
      setNewPub({ ...newPub, [name]: value });
    }
  };

  // Changer le type de fichier
  const handleFileTypeChange = (type) => {
    setNewPub({ ...newPub, type_fichier: type, fichier: null });
    setPreviewFile(null);
  };

  // Déterminer le type de fichier à partir du fichier
  const getFileTypeFromFile = (file) => {
    if (!file) return 'image';
    
    const fileType = file.type;
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
  };


  // Ajouter une publication
  const handleAddPublication = async () => {
    try {
      const formData = new FormData();
      formData.append("titre", newPub.titre);
      formData.append("contenu", newPub.contenu);
      formData.append("type", newPub.type);
      formData.append("date_publication", newPub.date_publication || new Date().toISOString().slice(0,10));
      formData.append("source", newPub.source || "");
      formData.append("categorie", newPub.categorie || "");
      formData.append("statut", "Validé");
      formData.append("auteur", newPub.auteur);
      formData.append("id_utilisateur", newPub.id_utilisateur || "");
      formData.append("type_fichier", newPub.type_fichier);
      
      if(newPub.fichier) {
        formData.append("fichier", newPub.fichier);
      }

      const res = await addPublication(formData);

      // CORRECTION : Créer l'objet publication avec TOUTES les données
      const addedPub = {
        ...res.data,
        // Assurer que les propriétés essentielles existent
        titre: newPub.titre,
        contenu: newPub.contenu,
        type: newPub.type,
        categorie: newPub.categorie,
        statut: "Validé",
        auteur: "Admin",
        date_publication: newPub.date_publication || new Date().toISOString().slice(0,10),
        likes: 0,
        vues: 0,
        type_fichier: newPub.type_fichier,
        // Créer l'URL temporaire pour l'affichage immédiat
        fichier_url: newPub.fichier ? URL.createObjectURL(newPub.fichier) : null,
        fichier: newPub.fichier ? newPub.fichier : null,
        nom_fichier_original: newPub.fichier ? newPub.fichier.name : null
      };
      
      // Ajouter la publication avec les données complètes
      setPublications(prev => [addedPub, ...prev]);

      // Réinitialiser le formulaire
      setNewPub({
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
        id_utilisateur: null
      });
      setPreviewFile(null);
      setShowModal(false);
      showNotification("success", "✅ Publication ajoutée avec succès !");
    } catch (err) {
      console.error("Erreur ajout publication:", err.response?.data || err.message);
      showNotification("error", "❌ Erreur lors de l'ajout : " + (err.response?.data?.message || err.message));
    }
  };

  // Supprimer
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette publication ?")) return;
    try {
      await deletePublication(id);
      setPublications(prev => prev.filter(pub => pub.id_publication !== id));
      showNotification("success", "✅ Publication supprimée avec succès !");
    } catch (err) {
      console.error("Erreur suppression:", err);
      showNotification("error", "❌ Erreur lors de la suppression");
    }
  };

  // Valider
  const handleValidate = async (id) => {
    try {
      await validatePublication(id);
      loadPublications();
      showNotification("success", "✅ Publication validée avec succès !");
    } catch (err) {
      console.error("Erreur validation:", err);
      showNotification("error", "❌ Erreur lors de la validation");
    }
  };

  // Modifier - ouvrir modal
  const handleEditShow = (pub) => {
    setSelectedPub({...pub});
    setEditModal(true);
    setPreviewFile(null);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "fichier") {
      const file = files[0];
      setSelectedPub({ ...selectedPub, fichier: file });
      
      // Prévisualisation du fichier
      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({
          url: fileURL,
          name: file.name,
          type: file.type
        });
        
        // Déterminer automatiquement le type de fichier
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
    try {
      const formData = new FormData();
      formData.append("titre", selectedPub.titre);
      formData.append("contenu", selectedPub.contenu);
      formData.append("type", selectedPub.type);
      formData.append("date_publication", selectedPub.date_publication);
      formData.append("source", selectedPub.source || "");
      formData.append("categorie", selectedPub.categorie || "");
      formData.append("statut", "Validé");
      formData.append("auteur", selectedPub.auteur);
      formData.append("id_utilisateur", selectedPub.id_utilisateur || "");
      formData.append("type_fichier", selectedPub.type_fichier);
      
      if(selectedPub.fichier) {
        formData.append("fichier", selectedPub.fichier);
      }

      const res = await updatePublication(selectedPub.id_publication, formData);

      // CORRECTION : Mettre à jour avec les données complètes
      const updatedPub = {
        ...res.data,
        // Conserver les données existantes
        titre: selectedPub.titre,
        contenu: selectedPub.contenu,
        type: selectedPub.type,
        categorie: selectedPub.categorie,
        type_fichier: selectedPub.type_fichier,
        // Créer l'URL temporaire si nouveau fichier
        fichier_url: selectedPub.fichier && selectedPub.fichier instanceof File 
          ? URL.createObjectURL(selectedPub.fichier) 
          : selectedPub.fichier_url,
        fichier: selectedPub.fichier || selectedPub.fichier,
        nom_fichier_original: selectedPub.fichier ? selectedPub.fichier.name : selectedPub.nom_fichier_original
      };

      // Mettre à jour le state
      setPublications(prev => prev.map(pub => 
        pub.id_publication === selectedPub.id_publication ? updatedPub : pub
      ));
      setEditModal(false);
      setPreviewFile(null);
      showNotification("success", "✅ Publication modifiée avec succès !");
    } catch (err) {
      console.error("Erreur modification publication:", err);
      showNotification("error", "❌ Erreur lors de la modification !");
    }
  };

  // Fonction pour obtenir la couleur du badge selon le statut
  const getStatusVariant = (statut) => {
    switch(statut) {
      case "Validé": return "success";
      case "En attente": return "warning";
      case "Brouillon": return "secondary";
      case "Rejeté": return "danger";
      default: return "primary";
    }
  };

  // Fonction pour obtenir l'icône selon le type
  const getTypeIcon = (type) => {
    switch(type) {
      case "Article": return "fa-file-alt";
      case "Annonce": return "fa-bullhorn";
      default: return "fa-file";
    }
  };

  // Fonction pour afficher le fichier correctement
  const displayFile = (pub) => {
    // Si le fichier est une URL string temporaire (nouvelle publication)
    if (pub.fichier_url && pub.fichier_url.startsWith('blob:')) {
      return pub.fichier_url;
    }
    
    // Si le fichier est une URL string de l'API
    if (pub.fichier_url && typeof pub.fichier_url === 'string') {
      return pub.fichier_url;
    }
    
    // Si le fichier est un chemin d'accès de l'API
    if (pub.fichier && typeof pub.fichier === 'string') {
      if (pub.fichier.startsWith('http')) {
        return pub.fichier;
      } else {
        // Ajouter l'URL de base de l'API si nécessaire
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
        return `${baseUrl}/storage/${pub.fichier}`;
      }
    }
    
    return null;
  };

  // Déterminer le type de fichier
  const getFileType = (pub) => {
    if (pub.type_fichier) {
      return pub.type_fichier;
    }
    
    // Deviner le type basé sur l'extension ou le contenu
    const fileUrl = displayFile(pub);
    if (!fileUrl) return null;
    
    if (typeof fileUrl === 'string') {
      if (fileUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i)) {
        return 'image';
      }
      if (fileUrl.match(/\.(mp4|avi|mov|wmv|flv|webm)$/i)) {
        return 'video';
      }
    }
    
    return 'document';
  };

  // Fonction pour obtenir l'icône du fichier
  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'fa-file-pdf';
      case 'doc':
      case 'docx':
        return 'fa-file-word';
      case 'xls':
      case 'xlsx':
        return 'fa-file-excel';
      case 'ppt':
      case 'pptx':
        return 'fa-file-powerpoint';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp':
        return 'fa-file-image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'fa-file-video';
      case 'zip':
      case 'rar':
      case '7z':
        return 'fa-file-archive';
      case 'txt':
        return 'fa-file-alt';
      default:
        return 'fa-file';
    }
  };

  // Fonction pour obtenir la couleur du badge fichier
  const getFileBadgeVariant = (fileName) => {
    if (!fileName) return 'secondary';
    
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return 'danger';
      case 'doc':
      case 'docx':
        return 'primary';
      case 'xls':
      case 'xlsx':
        return 'success';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'info';
      case 'zip':
      case 'rar':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  // Fonction pour télécharger le fichier
  const handleDownloadFile = async (pub) => {
    try {
      const fileUrl = displayFile(pub);
      if (!fileUrl) {
        showNotification("error", "❌ Fichier non disponible");
        return;
      }

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pub.nom_fichier_original || 'fichier-publication';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showNotification("success", "✅ Téléchargement commencé");
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      showNotification("error", "❌ Erreur lors du téléchargement");
    }
  };

  // Composant pour afficher la prévisualisation du fichier
  const FilePreview = ({ file }) => {
    if (!file) return null;

    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <h6 className="mb-3">
          <i className="fas fa-eye me-2"></i>
          Aperçu du fichier
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
            <p className="small text-muted">Aperçu non disponible pour ce type de fichier</p>
          </div>
        )}
      </div>
    );
  };

  // Filtrer les publications
  const filteredPubs = publications.filter((pub) => {
    const matchesSearch = pub.titre?.toLowerCase().includes(search.toLowerCase());
    const matchesStatut = filterStatut === "Tous" || pub.statut === filterStatut;
    const matchesType = filterType === "Tous" || pub.type === filterType;
    
    return matchesSearch && matchesStatut && matchesType;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterStatut("Tous");
    setFilterType("Tous");
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
                {showAlert.type === "success" ? "Succès" : "Erreur"}
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
              Gestion des Publications
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-newspaper me-2"></i>
              Gérez et publiez du contenu avec fichiers
            </p>
          </div>
          <Button 
            variant="success" 
            onClick={() => setShowModal(true)} 
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
            Nouvelle Publication
          </Button>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          {[
            { 
              title: "Total Publications", 
              count: publications.length, 
              icon: "fa-newspaper", 
              color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            { 
              title: "Avec Fichiers", 
              count: publications.filter((p) => displayFile(p)).length, 
              icon: "fa-paperclip", 
              color: "linear-gradient(135deg, #00b09b, #96c93d)"
            },
            { 
              title: "Vidéos", 
              count: publications.filter((p) => getFileType(p) === 'video').length, 
              icon: "fa-video", 
              color: "linear-gradient(135deg, #f093fb, #f5576c)"
            },
            { 
              title: "Images", 
              count: publications.filter((p) => getFileType(p) === 'image').length, 
              icon: "fa-image", 
              color: "linear-gradient(135deg, #fd746c, #ff9068)"
            }
          ].map((stat, index) => (
            <Col md={3} key={index} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2">{stat.title}</h6>
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
                    Recherche
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
                      placeholder="Rechercher par titre..."
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
                    <i className="fas fa-filter me-2"></i>
                    Statut
                  </Form.Label>
                  <Form.Select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="Tous">Tous les statuts</option>
                    <option value="Validé">Validé</option>
                    <option value="En attente">En attente</option>
                    <option value="Brouillon">Brouillon</option>
                    <option value="Rejeté">Rejeté</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-tag me-2"></i>
                    Type
                  </Form.Label>
                  <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="Tous">Tous les types</option>
                    <option value="Article">Article</option>
                    <option value="Annonce">Annonce</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    onClick={loadPublications}
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

        {/* Liste des publications */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted fw-semibold">Chargement des publications...</p>
          </div>
        ) : (
          <Row>
            {filteredPubs.map((pub) => {
              const fileUrl = displayFile(pub);
              const fileType = getFileType(pub);
              
              return (
                <Col md={6} lg={4} key={pub.id_publication} className="mb-4">
                  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px", transition: "transform 0.2s" }}>
                    {fileUrl ? (
                      <div style={{ position: "relative" }}>
                        {fileType === 'video' ? (
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
                              onError={(e) => {
                                console.error("Erreur de chargement de la vidéo:", fileUrl);
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="position-absolute top-0 start-0 m-2">
                              <Badge bg="dark" className="d-flex align-items-center">
                                <i className="fas fa-video me-1"></i>
                                Vidéo
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <Card.Img 
                            variant="top" 
                            src={fileUrl} 
                            style={{ 
                              height: "200px", 
                              objectFit: "cover",
                              borderTopLeftRadius: "20px",
                              borderTopRightRadius: "20px"
                            }} 
                            onError={(e) => {
                              console.error("Erreur de chargement de l'image:", fileUrl);
                              e.target.style.display = 'none';
                            }}
                          />
                        )}
                        <Badge 
                          bg={getStatusVariant(pub.statut)} 
                          className="position-absolute top-0 end-0 m-3 d-flex align-items-center"
                          style={{ borderRadius: "20px", padding: "6px 12px" }}
                        >
                          <i className={`fas ${
                            pub.statut === "Validé" ? "fa-check" :
                            pub.statut === "En attente" ? "fa-clock" :
                            pub.statut === "Brouillon" ? "fa-edit" : "fa-times"
                          } me-1`}></i>
                          {pub.statut}
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
                          <i className={`fas ${getTypeIcon(pub.type)} fs-1 mb-2 d-block`}></i>
                          <small>Aucun fichier</small>
                        </div>
                        <Badge 
                          bg={getStatusVariant(pub.statut)} 
                          className="position-absolute top-0 end-0 m-3 d-flex align-items-center"
                          style={{ borderRadius: "20px", padding: "6px 12px" }}
                        >
                          <i className={`fas ${
                            pub.statut === "Validé" ? "fa-check" :
                            pub.statut === "En attente" ? "fa-clock" :
                            pub.statut === "Brouillon" ? "fa-edit" : "fa-times"
                          } me-1`}></i>
                          {pub.statut}
                        </Badge>
                      </div>
                    )}
                    
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className={`fas ${getTypeIcon(pub.type)} text-primary me-2`}></i>
                          <Badge 
                            bg="light" 
                            text="dark"
                            style={{ borderRadius: "15px", fontSize: "0.7rem" }}
                          >
                            {pub.type}
                          </Badge>
                          {pub.categorie && (
                            <Badge 
                              bg="outline-primary" 
                              text="primary"
                              style={{ borderRadius: "15px", fontSize: "0.7rem", marginLeft: "5px" }}
                            >
                              {pub.categorie}
                            </Badge>
                          )}
                          {fileType === 'video' && (
                            <Badge 
                              bg="dark" 
                              style={{ borderRadius: "15px", fontSize: "0.7rem", marginLeft: "5px" }}
                            >
                              <i className="fas fa-video me-1"></i>
                              Vidéo
                            </Badge>
                          )}
                        </div>
                        <Card.Title className="h5 fw-bold" style={{ lineHeight: "1.3" }}>
                          {pub.titre}
                        </Card.Title>
                      </div>

                      <Card.Text className="text-muted flex-grow-1" style={{ lineHeight: "1.5" }}>
                        {pub.contenu?.length > 120 ? `${pub.contenu.substring(0, 120)}...` : pub.contenu}
                      </Card.Text>

                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-calendar me-1"></i>
                            <span>{formatDate(pub.date_publication)}</span>
                          </div>
                          <div className="d-flex align-items-center">
                            <i className="fas fa-user me-1"></i>
                            <span>{pub.auteur || "Admin"}</span>
                          </div>
                        </div>

                        {/* Section Fichier avec téléchargement */}
                        {fileUrl && (
                          <div className="mb-3 p-2 border rounded" style={{ background: '#f8f9fa' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <i className={`fas ${getFileIcon(pub.nom_fichier_original)} text-${getFileBadgeVariant(pub.nom_fichier_original)} me-2`}></i>
                                <span className="small">
                                  {pub.nom_fichier_original || 'Fichier joint'}
                                </span>
                              </div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleDownloadFile(pub)}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "6px", fontSize: "0.7rem" }}
                              >
                                <i className="fas fa-download me-1"></i>
                                Télécharger
                              </Button>
                            </div>
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2 text-muted small">
                            <span className="d-flex align-items-center">
                              <i className="fas fa-thumbs-up me-1"></i>
                              {pub.likes || 0}
                            </span>
                            <span className="d-flex align-items-center">
                              <i className="fas fa-eye me-1"></i>
                              {pub.vues || 0}
                            </span>
                          </div>
                          
                          <div className="d-flex gap-1">
                            {pub.statut === "En attente" && (
                              <Button 
                                variant="success" 
                                size="sm" 
                                onClick={() => handleValidate(pub.id_publication)}
                                className="d-flex align-items-center"
                                style={{ borderRadius: "8px" }}
                              >
                                <i className="fas fa-check"></i>
                              </Button>
                            )}
                            <Button 
                              variant="outline-warning" 
                              size="sm" 
                              onClick={() => handleEditShow(pub)}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px" }}
                            >
                              <i className="fas fa-edit"></i>
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              onClick={() => handleDelete(pub.id_publication)}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px" }}
                            >
                              <i className="fas fa-trash"></i>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
            
            {filteredPubs.length === 0 && (
              <Col md={12}>
                <Card className="border-0 shadow-sm text-center" style={{ borderRadius: "20px" }}>
                  <Card.Body className="py-5">
                    <i className="fas fa-newspaper fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
                    <h5 className="text-muted mb-2">Aucune publication trouvée</h5>
                    <p className="text-muted mb-3">Aucune publication ne correspond à vos critères de recherche</p>
                    <Button 
                      variant="primary" 
                      onClick={clearFilters}
                      className="d-flex align-items-center mx-auto"
                    >
                      <i className="fas fa-times me-2"></i>
                      Effacer les filtres
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* Modal Ajout */}
        <Modal show={showModal} onHide={() => { setShowModal(false); setPreviewFile(null); }} size="lg" centered>
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
              Nouvelle Publication
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-heading me-2 text-primary"></i>
                      Titre *
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="titre" 
                      value={newPub.titre} 
                      onChange={handleChange} 
                      required 
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Titre de la publication"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-chart-line me-2 text-primary"></i>
                      Statut
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      value="Validé" 
                      disabled 
                      style={{ borderRadius: "10px", padding: "12px", background: "#e9ecef" }}
                    />
                    <Form.Text className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      Les publications admin sont toujours validées
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-align-left me-2 text-primary"></i>
                  Contenu *
                </Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={5} 
                  name="contenu" 
                  value={newPub.contenu} 
                  onChange={handleChange} 
                  required 
                  style={{ borderRadius: "10px", padding: "12px" }}
                  placeholder="Contenu de la publication..."
                />
              </Form.Group>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-tag me-2 text-primary"></i>
                      Type *
                    </Form.Label>
                    <Form.Select 
                      name="type" 
                      value={newPub.type} 
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="Article">Article</option>
                      <option value="Annonce">Annonce</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-folder me-2 text-primary"></i>
                      Catégorie *
                    </Form.Label>
                    <Form.Select 
                      name="categorie" 
                      value={newPub.categorie} 
                      onChange={handleChange}
                      required
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {/* Section Fichier */}
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-paperclip me-2 text-primary"></i>
                      Type de Fichier
                    </Form.Label>
                    <div className="d-flex gap-2">
                      <Button
                        variant={newPub.type_fichier === 'image' ? 'primary' : 'outline-primary'}
                        onClick={() => handleFileTypeChange('image')}
                        className="d-flex align-items-center"
                        style={{ borderRadius: "10px" }}
                      >
                        <i className="fas fa-image me-2"></i>
                        Image
                      </Button>
                      <Button
                        variant={newPub.type_fichier === 'video' ? 'primary' : 'outline-primary'}
                        onClick={() => handleFileTypeChange('video')}
                        className="d-flex align-items-center"
                        style={{ borderRadius: "10px" }}
                      >
                        <i className="fas fa-video me-2"></i>
                        Vidéo
                      </Button>
                      <Button
                        variant={newPub.type_fichier === 'document' ? 'primary' : 'outline-primary'}
                        onClick={() => handleFileTypeChange('document')}
                        className="d-flex align-items-center"
                        style={{ borderRadius: "10px" }}
                      >
                        <i className="fas fa-file me-2"></i>
                        Document
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-calendar me-2 text-primary"></i>
                      Date de publication
                    </Form.Label>
                    <Form.Control 
                      type="date" 
                      name="date_publication" 
                      value={newPub.date_publication} 
                      onChange={handleChange} 
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className={`fas ${
                    newPub.type_fichier === 'video' ? 'fa-video' : 
                    newPub.type_fichier === 'document' ? 'fa-file' : 'fa-image'
                  } me-2 text-primary`}></i>
                  Fichier {newPub.type_fichier === 'video' ? 'Vidéo' : newPub.type_fichier === 'document' ? 'Document' : 'Image'}
                </Form.Label>
                <Form.Control 
                  type="file" 
                  name="fichier" 
                  accept={
                    newPub.type_fichier === 'video' ? "video/*" : 
                    newPub.type_fichier === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" : 
                    "image/*"
                  }
                  onChange={handleChange} 
                  style={{ borderRadius: "10px", padding: "12px" }}
                />
                <Form.Text className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  {newPub.type_fichier === 'video' 
                    ? "Formats acceptés: MP4, AVI, MOV, WMV. Taille max: 50MB" 
                    : newPub.type_fichier === 'document'
                    ? "Formats acceptés: PDF, DOC, XLS, PPT, ZIP. Taille max: 20MB"
                    : "Formats acceptés: JPG, PNG, GIF, WEBP. Taille max: 10MB"}
                </Form.Text>
              </Form.Group>

              {/* Aperçu du fichier sélectionné */}
              <FilePreview file={previewFile} />

              <Row>
                <Col md={12}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-link me-2 text-primary"></i>
                      Source
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="source" 
                      value={newPub.source} 
                      onChange={handleChange} 
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Source originale" 
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={() => { setShowModal(false); setPreviewFile(null); }}
              className="d-flex align-items-center"
              style={{ borderRadius: "10px", padding: "10px 20px" }}
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button 
              variant="primary" 
              onClick={handleAddPublication}
              className="d-flex align-items-center"
              style={{ 
                borderRadius: "10px", 
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none"
              }}
            >
              <i className="fas fa-save me-2"></i>
              Publier
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Modifier */}
        {selectedPub && (
          <Modal show={editModal} onHide={() => { setEditModal(false); setPreviewFile(null); }} size="lg" centered>
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
                Modifier la Publication
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-heading me-2 text-primary"></i>
                        Titre *
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="titre" 
                        value={selectedPub.titre} 
                        onChange={handleEditChange} 
                        required 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-chart-line me-2 text-primary"></i>
                        Statut
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        value="Validé" 
                        disabled 
                        style={{ borderRadius: "10px", padding: "12px", background: "#e9ecef" }}
                      />
                      <Form.Text className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        Les publications admin sont toujours validées
                      </Form.Text>
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className="fas fa-align-left me-2 text-primary"></i>
                    Contenu *
                  </Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={5} 
                    name="contenu" 
                    value={selectedPub.contenu} 
                    onChange={handleEditChange} 
                    required 
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-tag me-2 text-primary"></i>
                        Type *
                      </Form.Label>
                      <Form.Select 
                        name="type" 
                        value={selectedPub.type} 
                        onChange={handleEditChange}
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value="Article">Article</option>
                        <option value="Annonce">Annonce</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-folder me-2 text-primary"></i>
                        Catégorie *
                      </Form.Label>
                      <Form.Select 
                        name="categorie" 
                        value={selectedPub.categorie} 
                        onChange={handleEditChange}
                        required
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value="">Sélectionnez une catégorie</option>
                        {categories.map((cat, index) => (
                          <option key={index} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                {/* Section Fichier pour modification */}
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-paperclip me-2 text-primary"></i>
                        Type de Fichier
                      </Form.Label>
                      <div className="d-flex gap-2">
                        <Button
                          variant={selectedPub.type_fichier === 'image' ? 'primary' : 'outline-primary'}
                          onClick={() => handleEditFileTypeChange('image')}
                          className="d-flex align-items-center"
                          style={{ borderRadius: "10px" }}
                        >
                          <i className="fas fa-image me-2"></i>
                          Image
                        </Button>
                        <Button
                          variant={selectedPub.type_fichier === 'video' ? 'primary' : 'outline-primary'}
                          onClick={() => handleEditFileTypeChange('video')}
                          className="d-flex align-items-center"
                          style={{ borderRadius: "10px" }}
                        >
                          <i className="fas fa-video me-2"></i>
                          Vidéo
                        </Button>
                        <Button
                          variant={selectedPub.type_fichier === 'document' ? 'primary' : 'outline-primary'}
                          onClick={() => handleEditFileTypeChange('document')}
                          className="d-flex align-items-center"
                          style={{ borderRadius: "10px" }}
                        >
                          <i className="fas fa-file me-2"></i>
                          Document
                        </Button>
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-calendar me-2 text-primary"></i>
                        Date de publication
                      </Form.Label>
                      <Form.Control 
                        type="date" 
                        name="date_publication" 
                        value={selectedPub.date_publication} 
                        onChange={handleEditChange} 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className={`fas ${
                      selectedPub.type_fichier === 'video' ? 'fa-video' : 
                      selectedPub.type_fichier === 'document' ? 'fa-file' : 'fa-image'
                    } me-2 text-primary`}></i>
                    Fichier {selectedPub.type_fichier === 'video' ? 'Vidéo' : selectedPub.type_fichier === 'document' ? 'Document' : 'Image'}
                  </Form.Label>
                  <Form.Control 
                    type="file" 
                    name="fichier" 
                    accept={
                      selectedPub.type_fichier === 'video' ? "video/*" : 
                      selectedPub.type_fichier === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" : 
                      "image/*"
                    }
                    onChange={handleEditChange} 
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                  {selectedPub.fichier && !previewFile && (
                    <div className="mt-2">
                      <small className="text-muted d-block">
                        <i className="fas fa-file me-1"></i>
                        Fichier actuel: {selectedPub.nom_fichier_original || 'Fichier joint'}
                      </small>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleDownloadFile(selectedPub)}
                        className="d-flex align-items-center mt-1"
                        style={{ borderRadius: "6px", fontSize: "0.7rem" }}
                      >
                        <i className="fas fa-download me-1"></i>
                        Télécharger
                      </Button>
                    </div>
                  )}
                </Form.Group>

                {/* Aperçu du fichier sélectionné */}
                <FilePreview file={previewFile} />

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-link me-2 text-primary"></i>
                        Source
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="source" 
                        value={selectedPub.source} 
                        onChange={handleEditChange} 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button 
                variant="outline-secondary" 
                onClick={() => { setEditModal(false); setPreviewFile(null); }}
                className="d-flex align-items-center"
                style={{ borderRadius: "10px", padding: "10px 20px" }}
              >
                <i className="fas fa-times me-2"></i>
                Annuler
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveEdit}
                className="d-flex align-items-center"
                style={{ 
                  borderRadius: "10px", 
                  padding: "10px 20px",
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  border: "none"
                }}
              >
                <i className="fas fa-save me-2"></i>
                Sauvegarder
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Publication;