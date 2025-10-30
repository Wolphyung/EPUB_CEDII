import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Modal, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import MembreSidebar from "../../components/MembreSidebar";

const ProfilMembre = () => {
  const navigate = useNavigate();
  const [membre, setMembre] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "",
    bio: "",
    avatar: null,
    date_naissance: "",
    profession: "",
    site_web: "",
    linkedin: "",
    twitter: ""
  });
  
  const [editMode, setEditMode] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Charger les données du membre
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("user"));
    if (userData) {
      setMembre({
        nom: userData.nom || "",
        prenom: userData.prenom || "",
        email: userData.email || "",
        telephone: userData.telephone || "",
        adresse: userData.adresse || "",
        ville: userData.ville || "",
        pays: userData.pays || "",
        bio: userData.bio || "Aucune biographie disponible",
        avatar: userData.avatar || null,
        date_naissance: userData.date_naissance || "",
        profession: userData.profession || "",
        site_web: userData.site_web || "",
        linkedin: userData.linkedin || "",
        twitter: userData.twitter || ""
      });
    }
  }, []);

  // Fonction pour afficher l'avatar
  const displayAvatar = (avatar) => {
    if (!avatar) return null;
    
    if (avatar.startsWith("http")) {
      return avatar;
    } else if (avatar.startsWith("/")) {
      return `http://localhost:8000${avatar}`;
    } else {
      return `http://localhost:8000/storage/${avatar}`;
    }
  };

  // Gérer les changements de formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMembre(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Sauvegarder les modifications
  const handleSave = async () => {
    setLoading(true);
    
    try {
      // Simuler une requête API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour le localStorage
      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), ...membre };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setAlert({
        show: true,
        message: "Profil mis à jour avec succès!",
        type: "success"
      });
      
      setEditMode(false);
    } catch (error) {
      setAlert({
        show: true,
        message: "Erreur lors de la mise à jour du profil",
        type: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer le changement d'avatar
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      
      // Prévisualisation de l'image
      const reader = new FileReader();
      reader.onload = (e) => {
        setMembre(prev => ({
          ...prev,
          avatar: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Sauvegarder le nouvel avatar
  const saveAvatar = async () => {
    if (!avatarFile) return;
    
    setLoading(true);
    try {
      // Simuler l'upload
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mettre à jour le localStorage
      const updatedUser = { ...JSON.parse(localStorage.getItem("user")), avatar: URL.createObjectURL(avatarFile) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      setAlert({
        show: true,
        message: "Photo de profil mise à jour avec succès!",
        type: "success"
      });
      
      setShowAvatarModal(false);
      setAvatarFile(null);
    } catch (error) {
      setAlert({
        show: true,
        message: "Erreur lors du changement de photo",
        type: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  // Gérer l'état de la sidebar
  const handleSidebarCollapse = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
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
        padding: "20px",
        marginLeft: sidebarCollapsed ? "0" : "0",
        transition: "margin-left 0.3s ease"
      }}>
        <Container fluid>
          {/* Alert */}
          {alert.show && (
            <Alert 
              variant={alert.type} 
              dismissible 
              onClose={() => setAlert({ ...alert, show: false })}
              className="mb-4 border-0 shadow"
              style={{ borderRadius: "15px" }}
            >
              {alert.message}
            </Alert>
          )}

          <Row className="justify-content-center">
            <Col lg={11} xl={10}>
              {/* Carte Principale */}
              <Card className="shadow-lg border-0" style={{ borderRadius: "20px", overflow: "hidden" }}>
                {/* En-tête avec background gradient */}
                <div 
                  style={{
                    height: "200px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    position: "relative"
                  }}
                >
                  <div className="position-absolute top-0 end-0 m-4">
                    <Button
                      variant="light"
                      className="rounded-pill px-4"
                      onClick={() => setEditMode(!editMode)}
                      disabled={loading}
                    >
                      <i className={`fas ${editMode ? "fa-times" : "fa-edit"} me-2`}></i>
                      {editMode ? "Annuler" : "Modifier le profil"}
                    </Button>
                  </div>
                </div>

                {/* Section Avatar et Informations */}
                <Card.Body className="position-relative" style={{ marginTop: "-80px" }}>
                  <Row>
                    {/* Colonne Avatar et Actions */}
                    <Col lg={4} className="text-center">
                      {/* Avatar */}
                      <div className="position-relative d-inline-block">
                        <div 
                          className="rounded-circle border-5 border-white shadow-lg"
                          style={{
                            width: "160px",
                            height: "160px",
                            background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
                            cursor: editMode ? "pointer" : "default",
                            overflow: "hidden"
                          }}
                          onClick={() => editMode && setShowAvatarModal(true)}
                        >
                          {membre.avatar ? (
                            <img
                              src={displayAvatar(membre.avatar)}
                              alt={`${membre.prenom} ${membre.nom}`}
                              className="w-100 h-100"
                              style={{ objectFit: "cover" }}
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                              <i className="fas fa-user fa-4x"></i>
                            </div>
                          )}
                        </div>
                        
                        {/* Badge en ligne */}
                        <div 
                          className="position-absolute rounded-circle border-3 border-white"
                          style={{
                            bottom: "15px",
                            right: "15px",
                            width: "25px",
                            height: "25px",
                            backgroundColor: "#00d664",
                            boxShadow: "0 0 15px #00d664"
                          }}
                        ></div>
                        
                        {/* Bouton changer photo en mode édition */}
                        {editMode && (
                          <div 
                            className="position-absolute top-0 end-0 bg-primary rounded-circle p-2 cursor-pointer"
                            style={{ transform: "translate(10px, -10px)" }}
                            onClick={() => setShowAvatarModal(true)}
                          >
                            <i className="fas fa-camera text-white"></i>
                          </div>
                        )}
                      </div>

                      {/* Nom et Profession */}
                      <div className="mt-4">
                        <h2 className="fw-bold text-dark mb-1">
                          {membre.prenom} {membre.nom}
                        </h2>
                        <p className="text-muted mb-3" style={{ fontSize: "1.1rem" }}>
                          {membre.profession || "Membre"}
                        </p>
                        
                        {/* Badge Statut */}
                        <span 
                          className="badge bg-success bg-opacity-20 text-success px-4 py-2 mb-3"
                          style={{ 
                            borderRadius: "20px",
                            fontSize: "0.9rem",
                            border: "1px solid rgba(0, 176, 155, 0.3)"
                          }}
                        >
                          <i className="fas fa-circle me-1" style={{ fontSize: "0.6rem" }}></i>
                          Membre Actif
                        </span>
                      </div>

                      {/* Statistiques */}
                      {!editMode && (
                        <div className="mt-4">
                          <Row className="g-3">
                            <Col xs={4}>
                              <div className="text-center p-3 rounded-3" style={{ background: "rgba(102, 126, 234, 0.1)" }}>
                                <h4 className="fw-bold text-primary mb-1">12</h4>
                                <small className="text-muted">Publications</small>
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="text-center p-3 rounded-3" style={{ background: "rgba(0, 176, 155, 0.1)" }}>
                                <h4 className="fw-bold text-success mb-1">8</h4>
                                <small className="text-muted">Événements</small>
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="text-center p-3 rounded-3" style={{ background: "rgba(255, 107, 107, 0.1)" }}>
                                <h4 className="fw-bold text-danger mb-1">24</h4>
                                <small className="text-muted">Amis</small>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Col>

                    {/* Colonne Informations */}
                    <Col lg={8}>
                      {editMode ? (
                        // Mode Édition
                        <div className="p-4 rounded-3" style={{ background: "#f8f9fa" }}>
                          <h4 className="fw-bold text-dark mb-4">
                            <i className="fas fa-user-edit me-2 text-primary"></i>
                            Modifier le profil
                          </h4>
                          
                          <Row className="g-3">
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Prénom</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="prenom"
                                  value={membre.prenom}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="Votre prénom"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Nom</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="nom"
                                  value={membre.nom}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="Votre nom"
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  name="email"
                                  value={membre.email}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="votre@email.com"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Téléphone</Form.Label>
                                <Form.Control
                                  type="tel"
                                  name="telephone"
                                  value={membre.telephone}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="+33 1 23 45 67 89"
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Profession</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="profession"
                                  value={membre.profession}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="Votre profession"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Date de naissance</Form.Label>
                                <Form.Control
                                  type="date"
                                  name="date_naissance"
                                  value={membre.date_naissance}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Adresse</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="adresse"
                                  value={membre.adresse}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="Votre adresse"
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Ville</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="ville"
                                  value={membre.ville}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="Votre ville"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Pays</Form.Label>
                                <Form.Control
                                  type="text"
                                  name="pays"
                                  value={membre.pays}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="Votre pays"
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={12}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Biographie</Form.Label>
                                <Form.Control
                                  as="textarea"
                                  rows={4}
                                  name="bio"
                                  value={membre.bio}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="Parlez-nous de vous..."
                                />
                              </Form.Group>
                            </Col>
                            
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">Site web</Form.Label>
                                <Form.Control
                                  type="url"
                                  name="site_web"
                                  value={membre.site_web}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="https://votre-site.com"
                                />
                              </Form.Group>
                            </Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label className="fw-semibold">LinkedIn</Form.Label>
                                <Form.Control
                                  type="url"
                                  name="linkedin"
                                  value={membre.linkedin}
                                  onChange={handleInputChange}
                                  className="border-0 shadow-sm rounded-3 py-3"
                                  placeholder="https://linkedin.com/in/votre-profil"
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                          
                          <div className="d-flex gap-3 mt-4">
                            <Button
                              variant="primary"
                              onClick={handleSave}
                              disabled={loading}
                              className="rounded-pill px-4 py-2"
                              style={{
                                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                                border: "none"
                              }}
                            >
                              {loading ? (
                                <>
                                  <i className="fas fa-spinner fa-spin me-2"></i>
                                  Sauvegarde...
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-save me-2"></i>
                                  Sauvegarder
                                </>
                              )}
                            </Button>
                            
                            <Button
                              variant="outline-secondary"
                              onClick={() => setEditMode(false)}
                              className="rounded-pill px-4 py-2"
                            >
                              <i className="fas fa-times me-2"></i>
                              Annuler
                            </Button>
                          </div>
                        </div>
                      ) : (
                        // Mode Consultation
                        <div className="p-4">
                          <h4 className="fw-bold text-dark mb-4">
                            <i className="fas fa-info-circle me-2 text-primary"></i>
                            Informations personnelles
                          </h4>
                          
                          <Row className="g-4">
                            {/* Informations de contact */}
                            <Col md={6}>
                              <div className="d-flex align-items-center mb-3 p-3 rounded-3" style={{ background: "rgba(102, 126, 234, 0.05)" }}>
                                <div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3">
                                  <i className="fas fa-envelope text-primary"></i>
                                </div>
                                <div>
                                  <small className="text-muted d-block">Email</small>
                                  <strong>{membre.email}</strong>
                                </div>
                              </div>
                            </Col>
                            
                            <Col md={6}>
                              <div className="d-flex align-items-center mb-3 p-3 rounded-3" style={{ background: "rgba(0, 176, 155, 0.05)" }}>
                                <div className="bg-success bg-opacity-10 rounded-circle p-3 me-3">
                                  <i className="fas fa-phone text-success"></i>
                                </div>
                                <div>
                                  <small className="text-muted d-block">Téléphone</small>
                                  <strong>{membre.telephone || "Non renseigné"}</strong>
                                </div>
                              </div>
                            </Col>
                            
                            {/* Localisation */}
                            <Col md={6}>
                              <div className="d-flex align-items-center mb-3 p-3 rounded-3" style={{ background: "rgba(255, 107, 107, 0.05)" }}>
                                <div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3">
                                  <i className="fas fa-map-marker-alt text-danger"></i>
                                </div>
                                <div>
                                  <small className="text-muted d-block">Localisation</small>
                                  <strong>
                                    {membre.ville && membre.pays 
                                      ? `${membre.ville}, ${membre.pays}`
                                      : "Non renseignée"
                                    }
                                  </strong>
                                </div>
                              </div>
                            </Col>
                            
                            <Col md={6}>
                              <div className="d-flex align-items-center mb-3 p-3 rounded-3" style={{ background: "rgba(255, 193, 7, 0.05)" }}>
                                <div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3">
                                  <i className="fas fa-briefcase text-warning"></i>
                                </div>
                                <div>
                                  <small className="text-muted d-block">Profession</small>
                                  <strong>{membre.profession || "Non renseignée"}</strong>
                                </div>
                              </div>
                            </Col>
                            
                            {/* Biographie */}
                            <Col md={12}>
                              <div className="p-4 rounded-3" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                                <h5 className="text-white mb-3">
                                  <i className="fas fa-quote-left me-2"></i>
                                  À propos de moi
                                </h5>
                                <p className="text-white mb-0" style={{ lineHeight: "1.6" }}>
                                  {membre.bio}
                                </p>
                              </div>
                            </Col>
                            
                            {/* Liens sociaux */}
                            {(membre.site_web || membre.linkedin || membre.twitter) && (
                              <Col md={12}>
                                <h6 className="fw-bold text-dark mb-3">Mes réseaux</h6>
                                <div className="d-flex gap-3">
                                  {membre.site_web && (
                                    <a href={membre.site_web} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                      <div className="bg-primary rounded-circle p-3">
                                        <i className="fas fa-globe text-white"></i>
                                      </div>
                                    </a>
                                  )}
                                  {membre.linkedin && (
                                    <a href={membre.linkedin} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                      <div className="bg-info rounded-circle p-3">
                                        <i className="fab fa-linkedin-in text-white"></i>
                                      </div>
                                    </a>
                                  )}
                                  {membre.twitter && (
                                    <a href={membre.twitter} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                      <div className="bg-primary rounded-circle p-3">
                                        <i className="fab fa-twitter text-white"></i>
                                      </div>
                                    </a>
                                  )}
                                </div>
                              </Col>
                            )}
                          </Row>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal pour changer l'avatar */}
      <Modal 
        show={showAvatarModal} 
        onHide={() => setShowAvatarModal(false)} 
        centered
        size="sm"
      >
        <Modal.Body className="text-center p-4" style={{ borderRadius: "20px" }}>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
            style={{
              width: "80px",
              height: "80px",
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              color: "white"
            }}
          >
            <i className="fas fa-camera fs-2"></i>
          </div>
          
          <h4 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
            Changer la photo
          </h4>
          
          <Form.Group className="mb-4">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="border-0 shadow-sm rounded-3 py-3"
            />
          </Form.Group>
          
          <div className="d-flex gap-3 justify-content-center">
            <Button
              variant="outline-secondary"
              onClick={() => setShowAvatarModal(false)}
              className="rounded-pill px-4"
            >
              <i className="fas fa-times me-2"></i>
              Annuler
            </Button>
            <Button
              variant="primary"
              onClick={saveAvatar}
              disabled={!avatarFile || loading}
              className="rounded-pill px-4"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none"
              }}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin me-2"></i>
                  Envoi...
                </>
              ) : (
                <>
                  <i className="fas fa-check me-2"></i>
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Styles CSS supplémentaires */}
      <style>
        {`
          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .card:hover {
            transform: translateY(-5px);
          }
          
          .rounded-3 {
            border-radius: 15px !important;
          }
          
          .border-5 {
            border-width: 5px !important;
          }
          
          .cursor-pointer {
            cursor: pointer;
          }
          
          /* Animation pour les éléments au survol */
          .d-flex.align-items-center.mb-3 {
            transition: all 0.3s ease;
          }
          
          .d-flex.align-items-center.mb-3:hover {
            transform: translateX(5px);
            background: rgba(102, 126, 234, 0.1) !important;
          }
          
          /* Style pour les inputs en mode édition */
          .form-control:focus {
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
            border-color: #667eea !important;
          }

          /* Ajustements pour la sidebar */
          .min-vh-100 {
            min-height: 100vh;
          }

          .flex-grow-1 {
            flex-grow: 1;
          }
        `}
      </style>
    </div>
  );
};

export default ProfilMembre;