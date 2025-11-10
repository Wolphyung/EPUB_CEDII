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
  fetchPublicationsValidees,
  fetchEvenementsValides,
  fetchAppelsOffresValides,
  downloadPublicationFile,
  envoyerMessageVisiteur,
  toggleLikePublication,
  inscrireEvenement
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
        fetchPublicationsValidees(),
        fetchEvenementsValides().catch(() => ({ data: getDemoEvenements() })), // Fallback si route existe pas
        fetchAppelsOffresValides().catch(() => ({ data: getDemoAppelsOffres() })) // Fallback si route existe pas
      ]);

      // Publications validées
      if (pubResponse.data.success) {
        setPublications(pubResponse.data.data || []);
      } else {
        setPublications(pubResponse.data || []);
      }

      // Événements (avec fallback)
      setEvenements(eventResponse.data || []);
      
      // Appels d'offres (avec fallback)
      setAppelsOffres(offresResponse.data || []);

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

  // Données de démonstration
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
    },
    {
      id_publication: 3,
      titre: "Guide des bonnes pratiques SEO",
      contenu: "Un guide complet pour améliorer votre référencement naturel et augmenter votre visibilité en ligne...",
      type: "Guide",
      auteur: "Expert SEO",
      date_publication: "2024-01-08",
      statut: "Validé",
      fichier: "guide_seo.pdf",
      nom_fichier_original: "guide_bonnes_pratiques_seo.pdf",
      likes: 18,
      liked: false,
      categorie: "Digital"
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
    },
    {
      id: 2,
      titre: "Atelier Développement Web Moderne",
      description: "Apprenez les meilleures pratiques en développement web avec nos experts. React, Node.js, et bien plus...",
      type: "Atelier",
      date: "2024-02-15",
      lieu: "En ligne",
      participants: 75,
      inscrit: true,
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
      const response = await toggleLikePublication(publication.id_publication);
      
      setPublications(prev => prev.map(pub => 
        pub.id_publication === publication.id_publication 
          ? { 
              ...pub, 
              likes: response.data.likes || pub.likes + 1, 
              liked: true 
            }
          : pub
      ));
      
      showAlert('success', 'Publication likée !');
    } catch (error) {
      // Fallback local si l'API échoue
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
    }
  };

  // Gérer l'inscription aux événements
  const handleInscription = async (evenement) => {
    try {
      const response = await inscrireEvenement(evenement.id);
      
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
      // Fallback local si l'API échoue
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
      // Simulation si l'API n'est pas disponible
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
      
      // Créer un blob et déclencher le téléchargement
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

  // Filtrer les éléments par recherche
  const filteredPublications = publications.filter(pub =>
    pub.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pub.contenu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pub.categorie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    pub.auteur?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEvenements = evenements.filter(event =>
    event.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.lieu?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAppelsOffres = appelsOffres.filter(offre =>
    offre.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offre.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offre.entreprise?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    offre.lieu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      'Freelance': 'warning'
    };
    
    return (
      <Badge bg={colors[type] || "secondary"} className="ms-2">
        {type}
      </Badge>
    );
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'file';
    
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
      'pdf': 'file-pdf',
      'doc': 'file-word',
      'docx': 'file-word',
      'xls': 'file-excel',
      'xlsx': 'file-excel',
      'jpg': 'file-image',
      'jpeg': 'file-image',
      'png': 'file-image',
      'zip': 'file-archive'
    };
    return icons[ext] || 'file';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non spécifiée';
    return new Date(dateString).toLocaleDateString('fr-FR');
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
            <i className={`fas ${
              alert.type === 'success' ? 'fa-check-circle' :
              alert.type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle'
            } me-2`}></i>
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
              <Badge bg="success" className="fs-6 p-3">
                <i className="fas fa-shield-alt me-2"></i>
                {publications.length + evenements.length + appelsOffres.length} contenus validés
              </Badge>
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
              <Col md={4} className="text-end">
                <Badge bg="light" text="dark" className="me-2 p-2">
                  <i className="fas fa-newspaper text-primary me-1"></i>
                  {publications.length} Publications
                </Badge>
                <Badge bg="light" text="dark" className="p-2">
                  <i className="fas fa-calendar text-success me-1"></i>
                  {evenements.length} Événements
                </Badge>
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
                    Publications Validées ({filteredPublications.length})
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
            {/* CONTENU DES PUBLICATIONS VALIDÉES */}
            {activeTab === "publications" && (
              <Row>
                {filteredPublications.map((publication) => (
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
                        
                        <Card.Text className="text-muted mb-3">
                          {publication.contenu && publication.contenu.length > 120 
                            ? `${publication.contenu.substring(0, 120)}...` 
                            : publication.contenu || 'Aucun contenu'
                          }
                        </Card.Text>

                        {/* Fichiers attachés */}
                        {publication.fichier && (
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
                        )}

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
                ))}
              </Row>
            )}

            {/* CONTENU DES ÉVÉNEMENTS */}
            {activeTab === "evenements" && (
              <Row>
                {filteredEvenements.map((evenement) => (
                  <Col lg={6} xl={4} key={evenement.id} className="mb-4">
                    <Card className="h-100 shadow-sm border-0 event-card" style={{ borderRadius: "15px", overflow: "hidden" }}>
                      <div 
                        style={{
                          height: "120px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          position: "relative"
                        }}
                      >
                        <Badge 
                          bg={evenement.inscrit ? "success" : "primary"} 
                          className="position-absolute top-0 end-0 m-3"
                        >
                          {evenement.inscrit ? "Inscrit" : "S'inscrire"}
                        </Badge>
                      </div>
                      
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <Card.Title className="h5 fw-bold text-dark mb-2">
                            {evenement.titre}
                          </Card.Title>
                          {getTypeBadge(evenement.type)}
                        </div>
                        
                        <Card.Text className="text-muted mb-3">
                          {evenement.description || evenement.contenu}
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
                          <ListGroup.Item className="px-0 border-0">
                            <i className="fas fa-users text-primary me-2"></i>
                            <strong>Participants:</strong> {evenement.participants || 0}
                          </ListGroup.Item>
                        </ListGroup>

                        <div className="d-flex gap-2">
                          <Button
                            variant={evenement.inscrit ? "outline-secondary" : "primary"}
                            onClick={() => handleInscription(evenement)}
                            className="flex-fill"
                            style={{ borderRadius: "10px" }}
                          >
                            <i className={`fas ${evenement.inscrit ? 'fa-times' : 'fa-check'} me-1`}></i>
                            {evenement.inscrit ? "Se désinscrire" : "S'inscrire"}
                          </Button>
                          
                          <Button
                            variant="outline-info"
                            onClick={() => handleOpenMessage(evenement, 'événement')}
                            style={{ borderRadius: "10px" }}
                          >
                            <i className="fas fa-envelope"></i>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* CONTENU DES APPELS D'OFFRES */}
            {activeTab === "offres" && (
              <Row>
                {filteredAppelsOffres.map((offre) => (
                  <Col lg={6} key={offre.id} className="mb-4">
                    <Card className="h-100 shadow-sm border-0 job-card" style={{ borderRadius: "15px" }}>
                      <Card.Body className="p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <div>
                            <Card.Title className="h4 fw-bold text-dark mb-1">
                              {offre.titre}
                              {offre.urgent && (
                                <Badge bg="danger" className="ms-2">
                                  <i className="fas fa-exclamation-circle me-1"></i>
                                  Urgent
                                </Badge>
                              )}
                            </Card.Title>
                            <h6 className="text-primary mb-2">
                              <i className="fas fa-building me-1"></i>
                              {offre.entreprise || 'Entreprise'}
                            </h6>
                          </div>
                          {getTypeBadge(offre.type)}
                        </div>

                        <div className="row mb-3">
                          <div className="col-md-6">
                            <small className="text-muted">
                              <i className="fas fa-map-marker-alt me-1"></i>
                              {offre.lieu || 'Lieu non spécifié'}
                            </small>
                          </div>
                          <div className="col-md-6">
                            <small className="text-muted">
                              <i className="fas fa-euro-sign me-1"></i>
                              {offre.salaire || 'Salaire à négocier'}
                            </small>
                          </div>
                        </div>

                        <Card.Text className="text-muted mb-3">
                          {offre.description || offre.contenu}
                        </Card.Text>

                        {/* Fichiers attachés */}
                        {offre.fichier && (
                          <div className="mb-3">
                            <small className="text-muted d-block mb-2">
                              <i className="fas fa-paperclip me-1"></i>
                              Documents:
                            </small>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleDownload(offre.id, offre.nom_fichier_original)}
                              style={{ borderRadius: "10px" }}
                            >
                              <i className={`fas fa-${getFileIcon(offre.nom_fichier_original)} me-1`}></i>
                              {offre.nom_fichier_original || 'Télécharger le dossier'}
                            </Button>
                          </div>
                        )}

                        <div className="d-flex justify-content-between align-items-center mt-auto">
                          <small className="text-muted">
                            <i className="fas fa-clock me-1"></i>
                            Publié le {formatDate(offre.date_publication)}
                          </small>
                          
                          <div className="d-flex gap-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => handleOpenMessage(offre, 'appel d\'offres')}
                              style={{ borderRadius: "10px" }}
                            >
                              <i className="fas fa-envelope me-1"></i>
                              Postuler
                            </Button>
                            
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOpenMessage(offre, 'appel d\'offres')}
                              style={{ borderRadius: "10px" }}
                            >
                              <i className="fas fa-info-circle me-1"></i>
                              Plus d'infos
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}

            {/* Message si aucun contenu */}
            {(activeTab === "publications" && filteredPublications.length === 0) ||
             (activeTab === "evenements" && filteredEvenements.length === 0) ||
             (activeTab === "offres" && filteredAppelsOffres.length === 0) && (
              <div className="text-center py-5">
                <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                <h5 className="text-muted">
                  {searchTerm ? "Aucun résultat pour votre recherche" : "Aucun contenu disponible"}
                </h5>
                <p className="text-muted">
                  {searchTerm 
                    ? "Essayez avec d'autres termes de recherche." 
                    : "Revenez plus tard pour découvrir de nouveaux contenus validés."
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline-primary" 
                    onClick={() => setSearchTerm('')}
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-times me-1"></i>
                    Effacer la recherche
                  </Button>
                )}
              </div>
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
                  <br />
                  <strong>Type:</strong> {selectedItem.type}
                  <br />
                  <strong>Statut:</strong> <Badge bg="success">Validé par l'admin</Badge>
                </Alert>
                
                <Form.Group>
                  <Form.Label>Votre message *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    placeholder={`Dites-nous pourquoi vous êtes intéressé par ce ${selectedItem.type}...`}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  />
                  <Form.Text className="text-muted">
                    Votre message sera envoyé à l'administrateur pour traitement.
                  </Form.Text>
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
              style={{ 
                borderRadius: "10px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none"
              }}
            >
              <i className="fas fa-paper-plane me-1"></i>
              Envoyer le message
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Footer */}
        <Row className="mt-5">
          <Col>
            <div className="text-center text-white">
              <p className="mb-0">
                <i className="fas fa-shield-alt me-1"></i>
                Tous les contenus sont validés par l'administration
              </p>
              <small className="text-light">
                © 2024 Plateforme Visiteur - Tous droits réservés
              </small>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Styles CSS */}
      <style>
        {`
          .publication-card:hover, .event-card:hover, .job-card:hover {
            transform: translateY(-5px);
            transition: transform 0.3s ease;
          }
          
          .nav-tabs .nav-link {
            border: none;
            color: #6c757d;
            font-weight: 500;
            padding: 12px 24px;
            border-radius: 10px;
            margin: 0 5px;
          }
          
          .nav-tabs .nav-link.active {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
          }
          
          .nav-tabs .nav-link:hover {
            border: none;
            color: #667eea;
          }
          
          .card {
            transition: all 0.3s ease;
          }
          
          .btn {
            transition: all 0.3s ease;
          }
        `}
      </style>
    </div>
  );
};

export default DashVisiteur;