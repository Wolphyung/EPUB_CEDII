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

  const [newPub, setNewPub] = useState({
    titre: "",
    contenu: "",
    type: "Article",
    date_publication: "",
    source: "",
    categorie: "",
    statut: "Brouillon",
    image: null,
    auteur: "Admin",
    id_utilisateur: null
  });

  // Charger les publications
  useEffect(() => {
    loadPublications();
  }, []);

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

  // Changement des champs
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setNewPub({ ...newPub, image: files[0] });
    } else {
      setNewPub({ ...newPub, [name]: value });
    }
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
      formData.append("statut", newPub.statut || "Brouillon");
      formData.append("auteur", newPub.auteur);
      formData.append("id_utilisateur", newPub.id_utilisateur || "");
      if(newPub.image) formData.append("image", newPub.image);

      const res = await addPublication(formData);

      // Ajouter la publication directement au state pour l'affichage
      const addedPub = res.data;
      setPublications(prev => [addedPub, ...prev]);

      // Réinitialiser le formulaire
      setNewPub({
        titre: "",
        contenu: "",
        type: "Article",
        date_publication: "",
        source: "",
        categorie: "",
        statut: "Brouillon",
        image: null,
        auteur: "Admin",
        id_utilisateur: null
      });
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
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setSelectedPub({ ...selectedPub, image: files[0] });
    } else {
      setSelectedPub({ ...selectedPub, [name]: value });
    }
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
      formData.append("statut", selectedPub.statut || "Brouillon");
      formData.append("auteur", selectedPub.auteur);
      formData.append("id_utilisateur", selectedPub.id_utilisateur || "");
      if(selectedPub.image) formData.append("image", selectedPub.image);

      const res = await updatePublication(selectedPub.id_publication, formData);

      // Mettre à jour le state
      setPublications(prev => prev.map(pub => pub.id_publication === selectedPub.id_publication ? res.data : pub));
      setEditModal(false);
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
      case "Offre": return "fa-briefcase";
      case "Evenement": return "fa-calendar-alt";
      default: return "fa-file";
    }
  };

  // Fonction pour afficher l'image correctement
  const displayImage = (pub) => {
    if (pub.image_url) {
      return pub.image_url;
    }
    if (pub.image && typeof pub.image === 'string') {
      return pub.image;
    }
    if (pub.image && pub.image instanceof File) {
      return URL.createObjectURL(pub.image);
    }
    return null;
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
              Gérez et publiez du contenu sur votre plateforme
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
              title: "Validées", 
              count: publications.filter((p) => p.statut === "Validé").length, 
              icon: "fa-check-circle", 
              color: "linear-gradient(135deg, #00b09b, #96c93d)"
            },
            { 
              title: "En attente", 
              count: publications.filter((p) => p.statut === "En attente").length, 
              icon: "fa-clock", 
              color: "linear-gradient(135deg, #f093fb, #f5576c)"
            },
            { 
              title: "Brouillons", 
              count: publications.filter((p) => p.statut === "Brouillon").length, 
              icon: "fa-edit", 
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
                    <option value="Offre">Offre</option>
                    <option value="Evenement">Événement</option>
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
            {filteredPubs.map((pub) => (
              <Col md={6} lg={4} key={pub.id_publication} className="mb-4">
                <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px", transition: "transform 0.2s" }}>
                  {displayImage(pub) && (
                    <div style={{ position: "relative" }}>
                      <Card.Img 
                        variant="top" 
                        src={displayImage(pub)} 
                        style={{ 
                          height: "200px", 
                          objectFit: "cover",
                          borderTopLeftRadius: "20px",
                          borderTopRightRadius: "20px"
                        }} 
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
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
                          <span>{pub.date_publication}</span>
                        </div>
                        <div className="d-flex align-items-center">
                          <i className="fas fa-user me-1"></i>
                          <span>{pub.auteur}</span>
                        </div>
                      </div>

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
            ))}
            
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
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
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
                      Statut *
                    </Form.Label>
                    <Form.Select 
                      name="statut" 
                      value={newPub.statut} 
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="Brouillon">Brouillon</option>
                      <option value="En attente">En attente</option>
                      <option value="Validé">Validé</option>
                    </Form.Select>
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
                      <option value="Offre">Offre</option>
                      <option value="Evenement">Événement</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-folder me-2 text-primary"></i>
                      Catégorie
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="categorie" 
                      value={newPub.categorie} 
                      onChange={handleChange} 
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Ex: Technologie, Santé, Éducation..." 
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
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
                <Col md={6}>
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
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className="fas fa-image me-2 text-primary"></i>
                  Image
                </Form.Label>
                <Form.Control 
                  type="file" 
                  name="image" 
                  accept="image/*" 
                  onChange={handleChange} 
                  style={{ borderRadius: "10px", padding: "12px" }}
                />
                <Form.Text className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  Formats acceptés: JPG, PNG, GIF. Taille max: 5MB
                </Form.Text>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowModal(false)}
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
          <Modal show={editModal} onHide={() => setEditModal(false)} size="lg" centered>
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
                        Statut *
                      </Form.Label>
                      <Form.Select 
                        name="statut" 
                        value={selectedPub.statut} 
                        onChange={handleEditChange}
                        style={{ borderRadius: "10px", padding: "12px" }}
                      >
                        <option value="Brouillon">Brouillon</option>
                        <option value="En attente">En attente</option>
                        <option value="Validé">Validé</option>
                        <option value="Rejeté">Rejeté</option>
                      </Form.Select>
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
                        <option value="Offre">Offre</option>
                        <option value="Evenement">Événement</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-folder me-2 text-primary"></i>
                        Catégorie
                      </Form.Label>
                      <Form.Control 
                        type="text" 
                        name="categorie" 
                        value={selectedPub.categorie} 
                        onChange={handleEditChange} 
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Row>
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
                  <Col md={6}>
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
                
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className="fas fa-image me-2 text-primary"></i>
                    Image
                  </Form.Label>
                  <Form.Control 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleEditChange} 
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                  {displayImage(selectedPub) && (
                    <div className="mt-3 text-center">
                      <p className="small text-muted mb-2">Image actuelle:</p>
                      <img 
                        src={displayImage(selectedPub)} 
                        alt="Preview" 
                        style={{ 
                          maxHeight: "120px", 
                          maxWidth: "200px", 
                          objectFit: "cover",
                          borderRadius: "10px",
                          border: "2px solid #e9ecef"
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button 
                variant="outline-secondary" 
                onClick={() => setEditModal(false)}
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