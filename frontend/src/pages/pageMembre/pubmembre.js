import React, { useState, useEffect } from "react";
import { Button, Form, Modal, Card, Row, Col, Badge, Alert } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import axios from "axios"; // Importation d'Axios

// ⚠️ À ADAPTER : URL de base de ton API Laravel
const API_URL = "http://localhost:8000/api/publications"; 

const PubMembre = () => {
    const [showModal, setShowModal] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: "", type: "" });
    const [publications, setPublications] = useState([]); 
    const [isSubmitting, setIsSubmitting] = useState(false); // État pour désactiver le bouton lors de la soumission/modification

    const [editingPub, setEditingPub] = useState(null); // 👈 NOUVEAU: Stocke la pub en cours d'édition
    const [newPub, setNewPub] = useState({ // Utilisé pour l'ajout ET l'édition
        titre: "",
        contenu: "",
        image: null,
        date: new Date().toISOString().split('T')[0],
        auteur: "Membre Actif", // Sera surchargé par le backend si l'authentification fonctionne
        categorie: "Actualité"
    });

    // -----------------------------------------------------
    // GESTION API (CRUD)
    // -----------------------------------------------------

    /**
     * Charge toutes les publications depuis le backend.
     */
    const fetchPublications = async () => {
        try {
            const response = await axios.get(API_URL);
            
            // Adaptation des clés du backend (id_publication, date_publication, statut 'Validé') 
            // pour correspondre au format du front (id, date, statut 'approuvé')
            const adaptedPublications = response.data.map(pub => ({
                id: pub.id_publication,
                titre: pub.titre,
                contenu: pub.contenu,
                image: pub.image ? `/storage/${pub.image}` : null, // Chemin d'accès à l'image stockée
                date: pub.date_publication ? new Date(pub.date_publication).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                auteur: pub.auteur || "Utilisateur", 
                // Assure la compatibilité des statuts avec les clés des badges
                statut: pub.statut.toLowerCase().replace(' ', '_'), 
                likes: pub.likes || 0, 
                vues: pub.vues || 0,
                commentaires: pub.commentaires || 0,
                categorie: pub.categorie,
            }));

            setPublications(adaptedPublications.reverse()); 

        } catch (error) {
            console.error("Erreur lors du chargement des publications:", error);
            showAlert("Erreur lors du chargement des publications.", "danger");
        }
    };

    /**
     * Ajoute une nouvelle publication.
     */
    const handleAddPublication = async () => {
        setIsSubmitting(true);
        try {
            const formData = createFormData();
            
            await axios.post(API_URL, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    // ⚠️ Remplacer par le jeton d'authentification réel
                    Authorization: `Bearer YOUR_AUTH_TOKEN` 
                } 
            });

            await fetchPublications();
            showAlert("Publication créée avec succès ! En attente de validation.", "success");
            handleClose();

        } catch (error) {
            console.error("Erreur lors de l'ajout:", error.response ? error.response.data : error.message);
            showAlert(`Échec de l'ajout: ${error.response?.data?.message || error.message}`, "danger"); 

        } finally {
            setIsSubmitting(false);
        }
    };
    
    /**
     * Met à jour la publication en cours d'édition.
     */
    const handleUpdatePublication = async () => {
        setIsSubmitting(true);
        const pubId = editingPub.id; 

        try {
            const formData = createFormData();
            formData.append('_method', 'PUT'); // 👈 Nécessaire pour simuler PUT avec FormData en POST
            
            // Requête POST (avec _method: PUT) vers /api/publications/{id}
            await axios.post(`${API_URL}/${pubId}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    // ⚠️ Remplacer par le jeton d'authentification réel
                    Authorization: `Bearer YOUR_AUTH_TOKEN` 
                } 
            });

            await fetchPublications();
            showAlert("Publication modifiée avec succès !", "success");
            handleClose();

        } catch (error) {
            console.error("Erreur lors de la modification:", error.response ? error.response.data : error.message);
            showAlert(`Échec de la modification: ${error.response?.data?.message || error.message}`, "danger"); 

        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Supprime une publication.
     */
    const handleDeletePublication = async (id) => {
        if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette publication ?")) {
            return;
        }

        try {
            await axios.delete(`${API_URL}/${id}`, {
                 // ⚠️ Remplacer par le jeton d'authentification réel
                headers: { Authorization: `Bearer YOUR_AUTH_TOKEN` } 
            }); 
            
            setPublications(publications.filter(pub => pub.id !== id));
            showAlert("Publication supprimée avec succès.", "success");
        } catch (error) {
            console.error("Erreur lors de la suppression:", error);
            showAlert("Erreur lors de la suppression de la publication.", "danger");
        }
    };


    // -----------------------------------------------------
    // GESTION DU FORMULAIRE ET DU MODAL
    // -----------------------------------------------------
    
    // Fonction utilitaire pour créer le FormData commun à l'ajout et l'édition
    const createFormData = () => {
        const formData = new FormData();
        formData.append('titre', newPub.titre);
        formData.append('contenu', newPub.contenu);
        formData.append('categorie', newPub.categorie);
        
        // Mappage de la catégorie front (ex: "Offre d'emploi") au type backend (ex: "Offre")
        formData.append('type', 
            newPub.categorie === "Offre d'emploi" ? 'Offre' : 
            (newPub.categorie === "Événement" ? 'Evenement' : 
            'Article') // Default pour Actualité et Formation
        ); 
        formData.append('date_publication', newPub.date || new Date().toISOString().split('T')[0]);
        
        if (newPub.image) {
            formData.append('image', newPub.image);
        }
        return formData;
    };


    /**
     * Gère la soumission du formulaire (décide si c'est Ajout ou Modification).
     */
    const handleSavePublication = () => {
        if (!newPub.titre || !newPub.contenu) {
            showAlert("Veuillez remplir le titre et le contenu.", "warning");
            return;
        }

        if (editingPub) {
            handleUpdatePublication(); 
        } else {
            handleAddPublication(); 
        }
    };
    
    // Ouvre le modal en mode ajout
    const handleShow = () => {
        setEditingPub(null); // S'assurer que le mode est 'Ajout'
        setNewPub({
            titre: "",
            contenu: "",
            image: null,
            date: new Date().toISOString().split('T')[0],
            auteur: "Membre Actif",
            categorie: "Actualité"
        });
        setShowModal(true);
    };

    // Ouvre le modal en mode édition
    const handleShowEdit = (pub) => {
        setEditingPub(pub); 
        
        // Pré-remplir le formulaire newPub avec les données actuelles de la publication
        setNewPub({
            titre: pub.titre,
            contenu: pub.contenu,
            image: null, // L'image ne peut pas être préchargée dans l'input file
            date: pub.date,
            categorie: pub.categorie,
        });

        setShowModal(true);
    };

    // Ferme le modal et réinitialise les états
    const handleClose = () => {
        setShowModal(false);
        setEditingPub(null); // Réinitialiser l'état d'édition
        setNewPub({
            titre: "",
            contenu: "",
            image: null,
            date: new Date().toISOString().split('T')[0],
            auteur: "Membre Actif",
            categorie: "Actualité"
        });
    };

    // Changement input
    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === "image") {
            setNewPub({ ...newPub, image: files[0] });
        } else {
            setNewPub({ ...newPub, [name]: value });
        }
    };
    
    // Charger les publications au montage du composant
    useEffect(() => {
        fetchPublications();
    }, []);

    // -----------------------------------------------------
    // GESTION UI (Badges, Sidebar, Alert)
    // -----------------------------------------------------

    const handleSidebarCollapse = (isCollapsed) => {
        setSidebarCollapsed(isCollapsed);
    };

    const showAlert = (message, type) => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ ...alert, show: false }), 4000);
    };

    // Statut badge coloré
    const getStatusBadge = (statut) => {
        const statusConfig = {
            approuvé: { variant: "success", text: "Approuvé", icon: "fa-check-circle" },
            validé: { variant: "success", text: "Validé", icon: "fa-check-circle" },
            en_attente: { variant: "warning", text: "En attente", icon: "fa-clock" },
            brouillon: { variant: "secondary", text: "Brouillon", icon: "fa-pencil-alt" },
            rejeté: { variant: "danger", text: "Rejeté", icon: "fa-times-circle" }
        };
        
        const config = statusConfig[statut.toLowerCase()] || statusConfig.en_attente;
        return (
            <Badge 
                bg={config.variant} 
                className="d-inline-flex align-items-center px-3 py-2"
                style={{ borderRadius: "15px", fontSize: "0.8rem" }}
            >
                <i className={`fas ${config.icon} me-1`}></i>
                {config.text}
            </Badge>
        );
    };

    // Catégorie badge
    const getCategoryBadge = (categorie) => {
        const categoryColors = {
            "Offre d'emploi": "primary",
            "Événement": "success",
            "Actualité": "info",
            "Formation": "warning"
        };
        
        return (
            <Badge 
                bg={categoryColors[categorie] || "secondary"}
                className="px-2 py-1"
                style={{ borderRadius: "10px", fontSize: "0.7rem" }}
            >
                {categorie}
            </Badge>
        );
    };

    // -----------------------------------------------------
    // RENDER (JSX)
    // -----------------------------------------------------

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
                            Mes Publications
                        </h1>
                        <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
                            Gérez et créez vos publications
                        </p>
                    </div>
                    <Button 
                        variant="success" 
                        onClick={handleShow}
                        className="rounded-pill px-4 py-2"
                        style={{
                            background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
                            border: "none",
                            fontWeight: "600",
                            fontSize: "1rem"
                        }}
                    >
                        <i className="fas fa-plus-circle me-2"></i>
                        Nouvelle Publication
                    </Button>
                </div>

                {/* Statistiques rapides */}
                <Row className="mb-5">
                    <Col xl={3} lg={6} className="mb-4">
                        <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
                            <div className="bg-primary bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                                <i className="fas fa-file-alt text-primary fs-4"></i>
                            </div>
                            <h3 className="fw-bold text-primary">{publications.length}</h3>
                            <p className="text-muted mb-0">Publications totales</p>
                        </Card>
                    </Col>
                    <Col xl={3} lg={6} className="mb-4">
                        <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
                            <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                                <i className="fas fa-check-circle text-success fs-4"></i>
                            </div>
                            <h3 className="fw-bold text-success">{publications.filter(p => p.statut === 'approuvé' || p.statut === 'validé').length}</h3>
                            <p className="text-muted mb-0">Publications approuvées</p>
                        </Card>
                    </Col>
                    <Col xl={3} lg={6} className="mb-4">
                        <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
                            <div className="bg-warning bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                                <i className="fas fa-clock text-warning fs-4"></i>
                            </div>
                            <h3 className="fw-bold text-warning">{publications.filter(p => p.statut === 'en_attente').length}</h3>
                            <p className="text-muted mb-0">En attente</p>
                        </Card>
                    </Col>
                    <Col xl={3} lg={6} className="mb-4">
                        <Card className="shadow-lg border-0 text-center p-4" style={{ borderRadius: "20px" }}>
                            <div className="bg-info bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: "60px", height: "60px" }}>
                                <i className="fas fa-eye text-info fs-4"></i>
                            </div>
                            <h3 className="fw-bold text-info">{publications.reduce((acc, pub) => acc + pub.vues, 0)}</h3>
                            <p className="text-muted mb-0">Vues totales</p>
                        </Card>
                    </Col>
                </Row>

                {/* Liste des publications */}
                <Row>
                    {publications.map((pub) => (
                        <Col xl={4} lg={6} className="mb-4" key={pub.id}>
                            <Card 
                                className="shadow-lg border-0 h-100"
                                style={{ 
                                    borderRadius: "20px",
                                    transition: "all 0.3s ease",
                                    overflow: "hidden"
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
                                {pub.image && (
                                    <Card.Img
                                        variant="top"
                                        src={pub.image.startsWith('blob:') ? pub.image : pub.image} 
                                        style={{ 
                                            height: "200px", 
                                            objectFit: "cover",
                                            borderTopLeftRadius: "20px",
                                            borderTopRightRadius: "20px"
                                        }}
                                    />
                                )}
                                <Card.Body className="p-4">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        {getCategoryBadge(pub.categorie)}
                                        {getStatusBadge(pub.statut)}
                                    </div>
                                    
                                    <Card.Title 
                                        className="fw-bold mb-3"
                                        style={{ 
                                            color: "#2c3e50",
                                            fontSize: "1.2rem",
                                            lineHeight: "1.4"
                                        }}
                                    >
                                        {pub.titre}
                                    </Card.Title>
                                    
                                    <Card.Text 
                                        className="text-muted mb-4"
                                        style={{ 
                                            lineHeight: "1.6",
                                            fontSize: "0.95rem"
                                        }}
                                    >
                                        {pub.contenu.length > 120 ? `${pub.contenu.substring(0, 120)}...` : pub.contenu}
                                    </Card.Text>

                                    {/* Métriques d'engagement */}
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex gap-3">
                                            <small className="text-muted">
                                                <i className="fas fa-heart me-1 text-danger"></i>
                                                {pub.likes}
                                            </small>
                                            <small className="text-muted">
                                                <i className="fas fa-eye me-1 text-info"></i>
                                                {pub.vues}
                                            </small>
                                            <small className="text-muted">
                                                <i className="fas fa-comment me-1 text-warning"></i>
                                                {pub.commentaires}
                                            </small>
                                        </div>
                                    </div>

                                    {/* Informations de base et Boutons d'action ajoutés */}
                                    <div className="border-top pt-3">
                                        <div className="d-flex justify-content-between align-items-center mb-2">
                                            <small className="text-muted">
                                                <i className="fas fa-calendar me-1"></i>
                                                {pub.date}
                                            </small>
                                            <small className="text-muted">
                                                <i className="fas fa-user me-1"></i>
                                                {pub.auteur}
                                            </small>
                                        </div>
                                        <div className="d-flex justify-content-end gap-2 mt-2">
                                            
                                            {/* Bouton d'édition : Appelle la fonction d'affichage en mode édition */}
                                            <Button 
                                                variant="outline-primary" 
                                                size="sm" 
                                                className="rounded-pill" 
                                                onClick={() => handleShowEdit(pub)}
                                            >
                                                <i className="fas fa-edit"></i>
                                            </Button>
                                            
                                            {/* Bouton de suppression */}
                                            <Button 
                                                variant="outline-danger" 
                                                size="sm" 
                                                className="rounded-pill" 
                                                onClick={() => handleDeletePublication(pub.id)}
                                            >
                                                <i className="fas fa-trash"></i>
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>

                {/* Modal d'ajout/modification de publication */}
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
                            {/* Titre dynamique selon le mode (Ajout ou Édition) */}
                            <i className={`fas ${editingPub ? 'fa-edit' : 'fa-plus-circle'} me-2`}></i>
                            {editingPub ? `Modifier : ${editingPub.titre}` : 'Créer une nouvelle publication'}
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
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">
                                            <i className="fas fa-heading me-2 text-primary"></i>
                                            Titre de la publication *
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            name="titre"
                                            value={newPub.titre}
                                            onChange={handleChange}
                                            required
                                            className="border-0 shadow-sm rounded-3 py-3"
                                            placeholder="Donnez un titre accrocheur..."
                                            style={{ background: "#f8f9fa" }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">
                                            <i className="fas fa-tag me-2 text-success"></i>
                                            Catégorie
                                        </Form.Label>
                                        <Form.Select
                                            name="categorie"
                                            value={newPub.categorie}
                                            onChange={handleChange}
                                            className="border-0 shadow-sm rounded-3 py-3"
                                            style={{ background: "#f8f9fa" }}
                                        >
                                            <option value="Actualité">Actualité</option>
                                            <option value="Événement">Événement</option>
                                            <option value="Offre d'emploi">Offre d'emploi</option>
                                            <option value="Formation">Formation</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>

                            <Form.Group className="mb-4">
                                <Form.Label className="fw-semibold">
                                    <i className="fas fa-align-left me-2 text-info"></i>
                                    Contenu de la publication *
                                </Form.Label>
                                <Form.Control
                                    as="textarea"
                                    rows={5}
                                    name="contenu"
                                    value={newPub.contenu}
                                    onChange={handleChange}
                                    required
                                    className="border-0 shadow-sm rounded-3 py-3"
                                    placeholder="Rédigez le contenu de votre publication..."
                                    style={{ background: "#f8f9fa", resize: "none" }}
                                    maxLength={500}
                                />
                                <Form.Text className="text-muted">
                                    {newPub.contenu.length}/500 caractères
                                </Form.Text>
                            </Form.Group>

                            <Row>
                                <Col md={6}>
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
                                        {editingPub?.image && (
                                            <small className="text-muted mt-2 d-block">
                                                Image actuelle : {editingPub.image.split('/').pop()} (Laisser vide pour garder l'ancienne)
                                            </small>
                                        )}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group className="mb-4">
                                        <Form.Label className="fw-semibold">
                                            <i className="fas fa-calendar me-2 text-danger"></i>
                                            Date de publication
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            name="date"
                                            value={newPub.date}
                                            onChange={handleChange}
                                            className="border-0 shadow-sm rounded-3 py-3"
                                            style={{ background: "#f8f9fa" }}
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </Form>
                    </Modal.Body>
                    
                    <Modal.Footer className="border-0">
                        <Button 
                            variant="outline-secondary" 
                            onClick={handleClose}
                            className="rounded-pill px-4 py-2"
                            style={{ fontWeight: "600" }}
                            disabled={isSubmitting}
                        >
                            <i className="fas fa-times me-2"></i>
                            Annuler
                        </Button>
                        <Button 
                            variant="success" 
                            onClick={handleSavePublication} // Gère l'ajout ou la modification
                            className="rounded-pill px-4 py-2"
                            style={{
                                background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
                                border: "none",
                                fontWeight: "600"
                            }}
                            disabled={isSubmitting} 
                        >
                            <i className={`fas ${isSubmitting ? 'fa-spinner fa-spin' : 'fa-paper-plane'} me-2`}></i>
                            {/* Texte dynamique du bouton */}
                            {isSubmitting ? 'Sauvegarde en cours...' : (editingPub ? 'Sauvegarder les modifications' : 'Publier')}
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>

            {/* Styles CSS supplémentaires */}
            <style>
                {`
                    .modern-modal .modal-content {
                        border-radius: 20px !important;
                        border: none !important;
                        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.2) !important;
                    }

                    .form-control:focus, .form-select:focus {
                        box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25) !important;
                        border-color: #667eea !important;
                        background: #fff !important;
                    }

                    .card {
                        transition: transform 0.3s ease, box-shadow 0.3s ease;
                    }

                    .btn {
                        transition: all 0.3s ease;
                    }

                    .btn:hover {
                        transform: translateY(-2px);
                    }
                `}
            </style>
        </div>
    );
};

export default PubMembre;