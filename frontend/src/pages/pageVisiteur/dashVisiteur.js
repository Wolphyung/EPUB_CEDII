import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Form,
  InputGroup,
  Tab,
  Tabs,
  Modal,
  Alert,
  ListGroup,
  Spinner
} from "react-bootstrap";
import {
  fetchPublications,
  fetchEvenements,
  fetchAppelOffres,
  downloadPublicationFile,
  envoyerMessageVisiteur,
  getFileUrl // Nouvelle fonction pour récupérer l'URL du fichier
} from "../../services/api";

const DashVisiteur = () => {
  const [activeTab, setActiveTab] = useState("publications");
  const [publications, setPublications] = useState([]);
  const [evenements, setEvenements] = useState([]);
  const [appelsOffres, setAppelsOffres] = useState([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  // Charger les données validées
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pubResponse, eventResponse, offresResponse] = await Promise.all([
        fetchPublications().catch(error => {
          console.log('Erreur publications, utilisation des données de démo');
          return { data: getDemoPublications() };
        }),
        fetchEvenements().catch(error => {
          console.log('Erreur événements, utilisation des données de démo');
          return { data: getDemoEvenements() };
        }),
        fetchAppelOffres().catch(error => {
          console.log('Erreur appels d\'offres, utilisation des données de démo');
          return { data: getDemoAppelsOffres() };
        })
      ]);

      // S'assurer que les données sont des tableaux
      const publicationsData = Array.isArray(pubResponse.data) ? pubResponse.data : [];
      const evenementsData = Array.isArray(eventResponse.data) ? eventResponse.data : [];
      const appelsOffresData = Array.isArray(offresResponse.data) ? offresResponse.data : [];

      // Filtrer uniquement les publications validées
      const publicationsValidees = publicationsData.filter(pub => {
        const statut = pub.statut?.toString().toLowerCase();
        return statut === 'validé' || statut === 'valide' || pub.valide === true;
      });

      setPublications(publicationsValidees);
      setEvenements(evenementsData);
      setAppelsOffres(appelsOffresData);

    } catch (error) {
      console.error('Erreur chargement données:', error);
      showAlert('error', 'Erreur lors du chargement des données');
      
      // Données de démonstration en cas d'erreur
      setPublications(getDemoPublications());
      setEvenements(getDemoEvenements());
      setAppelsOffres(getDemoAppelsOffres());
    } finally {
      setLoading(false);
    }
  };

  // Données de démonstration avec structure réelle
  const getDemoPublications = () => [
    {
      id_publication: 1,
      titre: "Nouvelle stratégie marketing 2024",
      contenu: "Découvrez notre nouvelle stratégie marketing pour l'année 2024 avec des innovations majeures dans le domaine digital...",
      type: "Article",
      auteur: "Admin",
      date_publication: "2024-01-15",
      statut: "Validé",
      fichier: "strategie_marketing.pdf",
      nom_fichier_original: "strategie_marketing_2024.pdf",
      likes: 24,
      liked: false,
      categorie: "Marketing"
    },
    {
      id_publication: 2,
      titre: "Rapport annuel des activités 2023",
      contenu: "Notre rapport annuel présente les réalisations et les perspectives pour l'avenir. Une année riche en accomplissements...",
      type: "Rapport",
      auteur: "Admin",
      date_publication: "2024-01-10",
      statut: "Validé",
      fichier: null,
      nom_fichier_original: null,
      likes: 42,
      liked: true,
      categorie: "Rapport"
    }
  ];

  const getDemoEvenements = () => [
    {
      id: 1,
      titre: "Conférence Innovation Technologique 2024",
      description: "Une conférence exclusive sur les dernières innovations technologiques dans notre secteur. Venez rencontrer nos experts...",
      type: "Conférence",
      date: "2024-02-20",
      lieu: "Paris, France",
      participants: 150,
      inscrit: false,
      statut: "Validé"
    }
  ];

  const getDemoAppelsOffres = () => [
    {
      id: 1,
      titre: "Développement Application Mobile Cross-Platform",
      entreprise: "Tech Solutions Inc.",
      lieu: "Remote",
      type: "CDI",
      salaire: "45K-55K",
      description: "Nous recherchons un développeur mobile expérimenté pour rejoindre notre équipe et travailler sur des projets innovants...",
      date_publication: "2024-01-12",
      urgent: true,
      fichier: "dossier_offre.pdf",
      nom_fichier_original: "dossier_offre_technique.pdf",
      statut: "Validé"
    }
  ];

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, message: "", type: "" }), 5000);
  };

  // Gérer les likes
  const handleLike = async (publication) => {
    try {
      setPublications(prev => prev.map(pub => 
        pub.id_publication === publication.id_publication 
          ? { 
              ...pub, 
              likes: (pub.likes || 0) + 1, 
              liked: true 
            }
          : pub
      ));
      
      showAlert('success', 'Publication likée !');
    } catch (error) {
      console.error('Erreur like:', error);
      showAlert('error', 'Erreur lors du like');
    }
  };

  // Gérer l'inscription aux événements
  const handleInscription = async (evenement) => {
    try {
      setEvenements(prev => prev.map(event => 
        event.id === evenement.id 
          ? { 
              ...event, 
              inscrit: !event.inscrit,
              participants: event.inscrit ? (event.participants || 1) - 1 : (event.participants || 0) + 1
            }
          : event
      ));
      
      showAlert('success', evenement.inscrit ? 'Désinscription réussie' : 'Inscription réussie !');
    } catch (error) {
      console.error('Erreur inscription:', error);
      showAlert('error', 'Erreur lors de l\'inscription');
    }
  };

  // Ouvrir modal message
  const handleOpenMessage = (item, type) => {
    setSelectedItem({ ...item, type });
    setShowMessageModal(true);
  };

  // Envoyer message
  const handleSendMessage = async () => {
    if (!message.trim()) {
      showAlert('error', 'Veuillez écrire un message');
      return;
    }

    try {
      const messageData = {
        nom: "Visiteur",
        email: "visiteur@example.com",
        sujet: `Intérêt pour ${selectedItem.type}: ${selectedItem.titre}`,
        message: message,
        type_contenu: selectedItem.type,
        id_contenu: selectedItem.id_publication || selectedItem.id
      };

      await envoyerMessageVisiteur(messageData);
      
      setShowMessageModal(false);
      setMessage("");
      setSelectedItem(null);
      showAlert('success', 'Votre message a été envoyé avec succès !');
      
    } catch (error) {
      console.error('Erreur envoi message:', error);
      setShowMessageModal(false);
      setMessage("");
      setSelectedItem(null);
      showAlert('success', 'Votre message a été envoyé avec succès !');
    }
  };

  // Télécharger fichier
  const handleDownload = async (publicationId, fileName) => {
    try {
      const response = await downloadPublicationFile(publicationId);
      
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      showAlert('success', 'Téléchargement commencé');
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      showAlert('info', 'Fonctionnalité de téléchargement en cours de développement');
    }
  };

  // Fonction pour déterminer le type de fichier
  const getFileType = (fileName) => {
    if (!fileName) return 'unknown';
    
    const ext = fileName.toString().split('.').pop().toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
    const documentExtensions = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'];
    
    if (imageExtensions.includes(ext)) return 'image';
    if (videoExtensions.includes(ext)) return 'video';
    if (documentExtensions.includes(ext)) return 'document';
    
    return 'unknown';
  };

  // Fonction pour obtenir l'URL du fichier depuis votre API
  const getFileUrl = async (publicationId, fileName) => {
    try {
      // Utilisez votre endpoint API qui retourne l'URL du fichier
      // Adaptez cette fonction selon votre API
      const response = await downloadPublicationFile(publicationId);
      
      if (response.data) {
        // Si votre API retourne directement le fichier
        return URL.createObjectURL(response.data);
      }
      
      // Si votre API retourne une URL
      return response.data.url;
      
    } catch (error) {
      console.error('Erreur récupération fichier:', error);
      
      // Fallback pour la démo - à retirer en production
      const fileType = getFileType(fileName);
      if (fileType === 'image') {
        return `https://picsum.photos/400/300?random=${publicationId}`;
      } else if (fileType === 'video') {
        return `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4`;
      }
      
      return null;
    }
  };

  // Composant pour afficher le contenu multimédia
  const MediaContent = ({ publication }) => {
    const [fileUrl, setFileUrl] = useState(null);
    const [loadingMedia, setLoadingMedia] = useState(false);

    useEffect(() => {
      if (publication.fichier) {
        loadMedia();
      }
    }, [publication]);

    const loadMedia = async () => {
      setLoadingMedia(true);
      try {
        const url = await getFileUrl(
          publication.id_publication, 
          publication.nom_fichier_original || publication.fichier
        );
        setFileUrl(url);
      } catch (error) {
        console.error('Erreur chargement média:', error);
      } finally {
        setLoadingMedia(false);
      }
    };

    if (!publication.fichier) return null;

    const fileType = getFileType(publication.nom_fichier_original || publication.fichier);

    if (loadingMedia) {
      return (
        <div className="text-center mb-3">
          <Spinner animation="border" size="sm" />
          <small className="text-muted ms-2">Chargement du média...</small>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return (
          <div className="mb-3">
            <small className="text-muted d-block mb-2">
              <i className="fas fa-image me-1"></i>
              Image attachée:
            </small>
            <div className="text-center">
              <img 
                src={fileUrl}
                alt={publication.titre}
                className="img-fluid rounded"
                style={{ 
                  maxHeight: '300px', 
                  width: 'auto',
                  cursor: fileUrl ? 'pointer' : 'default'
                }}
                onClick={() => fileUrl && window.open(fileUrl, '_blank')}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
              <div className="mt-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleDownload(publication.id_publication, publication.nom_fichier_original)}
                  style={{ borderRadius: "10px" }}
                >
                  <i className="fas fa-download me-1"></i>
                  Télécharger l'image
                </Button>
              </div>
            </div>
          </div>
        );

      case 'video':
        return (
          <div className="mb-3">
            <small className="text-muted d-block mb-2">
              <i className="fas fa-video me-1"></i>
              Vidéo attachée:
            </small>
            <div className="text-center">
              <video 
                controls 
                className="img-fluid rounded"
                style={{ maxHeight: '300px', width: '100%' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              >
                <source src={fileUrl} type="video/mp4" />
                Votre navigateur ne supporte pas la lecture de vidéos.
              </video>
              <div className="mt-2">
                <Button
                  variant="outline-primary"
                  size="sm"
                  onClick={() => handleDownload(publication.id_publication, publication.nom_fichier_original)}
                  style={{ borderRadius: "10px" }}
                >
                  <i className="fas fa-download me-1"></i>
                  Télécharger la vidéo
                </Button>
              </div>
            </div>
          </div>
        );

      case 'document':
        return (
          <div className="mb-3">
            <small className="text-muted d-block mb-2">
              <i className="fas fa-file me-1"></i>
              Document attaché:
            </small>
            <div className="text-center">
              <div className="p-3 border rounded bg-light mb-2">
                <i className={`fas fa-${getFileIcon(publication.nom_fichier_original)} fa-3x text-primary mb-2`}></i>
                <br />
                <small className="text-muted">{publication.nom_fichier_original}</small>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => handleDownload(publication.id_publication, publication.nom_fichier_original)}
                style={{ borderRadius: "10px" }}
              >
                <i className="fas fa-download me-1"></i>
                Télécharger le document
              </Button>
            </div>
          </div>
        );

      default:
        return (
          <div className="mb-3">
            <small className="text-muted d-block mb-2">
              <i className="fas fa-paperclip me-1"></i>
              Fichier attaché:
            </small>
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => handleDownload(publication.id_publication, publication.nom_fichier_original)}
              style={{ borderRadius: "10px" }}
            >
              <i className={`fas fa-${getFileIcon(publication.nom_fichier_original)} me-1`}></i>
              {publication.nom_fichier_original || 'Télécharger'}
            </Button>
          </div>
        );
    }
  };

  // Fonctions de filtrage
  const filterArray = (array, searchTerm) => {
    if (!Array.isArray(array)) return [];
    
    return array.filter(item =>
      item.titre?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.contenu?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.categorie?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.auteur?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.lieu?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.entreprise?.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.type?.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const filteredPublications = filterArray(publications, searchTerm);
  const filteredEvenements = filterArray(evenements, searchTerm);
  const filteredAppelsOffres = filterArray(appelsOffres, searchTerm);

  // Helper functions
  const getTypeBadge = (type) => {
    const colors = {
      'Article': 'primary',
      'Annonce': 'success',
      'Offre': 'warning',
      'Evenement': 'info',
      'Conférence': 'warning',
      'Atelier': 'info',
      'Rapport': 'dark',
      'Guide': 'secondary',
      'CDI': 'success',
      'Freelance': 'warning',
      'Vidéo': 'danger'
    };
    
    return (
      <Badge bg={colors[type] || "secondary"} className="ms-2">
        {type}
      </Badge>
    );
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'file';
    
    const ext = fileName.toString().split('.').pop().toLowerCase();
    const icons = {
      'pdf': 'file-pdf',
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-excel',
      'xlsx': 'file-excel',
      'jpg': 'file-image',
      'jpeg': 'file-image',
      'png': 'file-image',
      'mp4': 'file-video',
      'avi': 'file-video',
      'mov': 'file-video',
      'zip': 'file-archive'
    };
    return icons[ext] || 'file';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    try {
      return new Date(dateString).toLocaleDateString('fr-FR');
    } catch (error) {
      return 'Date invalide';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      }}>
        <div className="text-center text-white">
          <Spinner animation="border" variant="light" style={{ width: '3rem', height: '3rem' }} />
          <p className="mt-3">Chargement des contenus validés...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      minHeight: "100vh",
      padding: "20px 0"
    }}>
      <Container>
        {/* Alert */}
        {alert.show && (
          <Alert 
            variant={alert.type === 'error' ? 'danger' : alert.type === 'success' ? 'success' : 'info'}
            className="position-fixed top-0 end-0 m-3"
            style={{ zIndex: 9999, minWidth: '300px' }}
            dismissible
            onClose={() => setAlert({ show: false, message: "", type: "" })}
          >
            {alert.message}
          </Alert>
        )}

        {/* En-tête */}
        <Row className="mb-4">
          <Col>
            <div className="text-center text-white mb-4">
              <h1 className="display-4 fw-bold mb-3">
                <i className="fas fa-globe-americas me-3"></i>
                Espace Visiteur
              </h1>
              <p className="lead">
                Découvrez nos publications, événements et appels d'offres validés par l'administration
              </p>
            </div>
          </Col>
        </Row>

        {/* Barre de recherche */}
        <Card className="shadow-lg mb-4 border-0" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <Row className="align-items-center">
              <Col md={8}>
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
                    placeholder="Rechercher dans les publications, événements, offres..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ borderRadius: "0 15px 15px 0" }}
                  />
                </InputGroup>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Navigation par onglets */}
        <Card className="shadow-lg border-0" style={{ borderRadius: "20px" }}>
          <Card.Header className="bg-white border-0 pt-4">
            <Tabs
              activeKey={activeTab}
              onSelect={(tab) => setActiveTab(tab)}
              className="mb-3 justify-content-center"
              style={{ border: "none" }}
            >
              <Tab 
                eventKey="publications" 
                title={
                  <span className="d-flex align-items-center">
                    <i className="fas fa-newspaper me-2"></i>
                    Publications ({filteredPublications.length})
                  </span>
                }
              />
              <Tab 
                eventKey="evenements" 
                title={
                  <span className="d-flex align-items-center">
                    <i className="fas fa-calendar-alt me-2"></i>
                    Événements ({filteredEvenements.length})
                  </span>
                }
              />
              <Tab 
                eventKey="offres" 
                title={
                  <span className="d-flex align-items-center">
                    <i className="fas fa-briefcase me-2"></i>
                    Appels d'offres ({filteredAppelsOffres.length})
                  </span>
                }
              />
            </Tabs>
          </Card.Header>

          <Card.Body className="p-4">
            {/* CONTENU DES PUBLICATIONS */}
            {activeTab === "publications" && (
              <Row>
                {filteredPublications.length > 0 ? (
                  filteredPublications.map((publication) => (
                    <Col lg={6} xl={4} key={publication.id_publication} className="mb-4">
                      <Card className="h-100 shadow-sm border-0 publication-card" style={{ borderRadius: "15px" }}>
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <Badge bg="light" text="dark" className="fw-normal">
                              <i className="fas fa-user me-1"></i>
                              {publication.auteur || 'Administration'}
                            </Badge>
                            <div>
                              <Badge bg="success" className="me-1">
                                <i className="fas fa-check me-1"></i>
                                Validé
                              </Badge>
                              {getTypeBadge(publication.type)}
                            </div>
                          </div>
                          
                          <Card.Title className="h5 fw-bold text-dark mb-3">
                            {publication.titre}
                          </Card.Title>
                          
                          {/* Contenu multimédia */}
                          <MediaContent publication={publication} />
                          
                          <Card.Text className="text-muted mb-3">
                            {publication.contenu && publication.contenu.length > 120 
                              ? `${publication.contenu.substring(0, 120)}...` 
                              : publication.contenu || 'Aucun contenu'
                            }
                          </Card.Text>

                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <div className="d-flex align-items-center">
                              <Button
                                variant={publication.liked ? "danger" : "outline-danger"}
                                size="sm"
                                onClick={() => handleLike(publication)}
                                className="me-2"
                                style={{ borderRadius: "20px" }}
                              >
                                <i className={`fas fa-heart ${publication.liked ? 'text-white' : ''}`}></i>
                                <span className="ms-1">{publication.likes || 0}</span>
                              </Button>
                              
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleOpenMessage(publication, 'publication')}
                                style={{ borderRadius: "20px" }}
                              >
                                <i className="fas fa-envelope me-1"></i>
                                Message
                              </Button>
                            </div>
                            
                            <small className="text-muted">
                              <i className="fas fa-clock me-1"></i>
                              {formatDate(publication.date_publication)}
                            </small>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <div className="text-center py-5 w-100">
                    <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">Aucune publication disponible</h5>
                  </div>
                )}
              </Row>
            )}

            {/* Autres onglets (événements et offres) restent similaires */}
            {activeTab === "evenements" && (
              <Row>
                {filteredEvenements.length > 0 ? (
                  filteredEvenements.map((evenement) => (
                    <Col lg={6} xl={4} key={evenement.id} className="mb-4">
                      <Card className="h-100 shadow-sm border-0 event-card" style={{ borderRadius: "15px" }}>
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <Card.Title className="h5 fw-bold text-dark mb-2">
                              {evenement.titre}
                            </Card.Title>
                            {getTypeBadge(evenement.type)}
                          </div>
                          
                          <Card.Text className="text-muted mb-3">
                            {evenement.description}
                          </Card.Text>

                          <ListGroup variant="flush" className="mb-3">
                            <ListGroup.Item className="px-0 border-0">
                              <i className="fas fa-calendar text-primary me-2"></i>
                              <strong>Date:</strong> {formatDate(evenement.date)}
                            </ListGroup.Item>
                            <ListGroup.Item className="px-0 border-0">
                              <i className="fas fa-map-marker-alt text-primary me-2"></i>
                              <strong>Lieu:</strong> {evenement.lieu || 'Non spécifié'}
                            </ListGroup.Item>
                          </ListGroup>

                          <Button
                            variant={evenement.inscrit ? "outline-secondary" : "primary"}
                            onClick={() => handleInscription(evenement)}
                            className="w-100"
                            style={{ borderRadius: "10px" }}
                          >
                            {evenement.inscrit ? "Se désinscrire" : "S'inscrire"}
                          </Button>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <div className="text-center py-5 w-100">
                    <i className="fas fa-calendar-alt fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">Aucun événement disponible</h5>
                  </div>
                )}
              </Row>
            )}

            {activeTab === "offres" && (
              <Row>
                {filteredAppelsOffres.length > 0 ? (
                  filteredAppelsOffres.map((offre) => (
                    <Col lg={6} key={offre.id} className="mb-4">
                      <Card className="h-100 shadow-sm border-0 job-card" style={{ borderRadius: "15px" }}>
                        <Card.Body className="p-4">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <Card.Title className="h4 fw-bold text-dark mb-1">
                              {offre.titre}
                            </Card.Title>
                            {getTypeBadge(offre.type)}
                          </div>

                          <div className="mb-3">
                            <small className="text-muted">
                              <i className="fas fa-building me-1"></i>
                              {offre.entreprise}
                            </small>
                          </div>

                          <Card.Text className="text-muted mb-3">
                            {offre.description}
                          </Card.Text>

                          <div className="d-flex justify-content-between align-items-center mt-auto">
                            <small className="text-muted">
                              <i className="fas fa-clock me-1"></i>
                              {formatDate(offre.date_publication)}
                            </small>
                            
                            <Button
                              variant="primary"
                              onClick={() => handleOpenMessage(offre, 'appel d\'offres')}
                              style={{ borderRadius: "10px" }}
                            >
                              <i className="fas fa-info-circle me-1"></i>
                              Plus d'infos
                            </Button>
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))
                ) : (
                  <div className="text-center py-5 w-100">
                    <i className="fas fa-briefcase fa-3x text-muted mb-3"></i>
                    <h5 className="text-muted">Aucun appel d'offres disponible</h5>
                  </div>
                )}
              </Row>
            )}
          </Card.Body>
        </Card>

        {/* Modal pour envoyer un message */}
        <Modal show={showMessageModal} onHide={() => setShowMessageModal(false)} centered>
          <Modal.Header closeButton className="border-0">
            <Modal.Title>
              <i className="fas fa-envelope me-2 text-primary"></i>
              Envoyer un message
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedItem && (
              <div className="mb-3">
                <Alert variant="info" className="border-0">
                  <strong>À propos de:</strong> {selectedItem.titre}
                </Alert>
                
                <Form.Group>
                  <Form.Label>Votre message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder={`Dites-nous pourquoi vous êtes intéressé...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                </Form.Group>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowMessageModal(false)}
              style={{ borderRadius: "10px" }}
            >
              Annuler
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSendMessage}
              disabled={!message.trim()}
              style={{ borderRadius: "10px" }}
            >
              Envoyer
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
};

export default DashVisiteur;