import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Image,
  Alert,
  Badge,
  Dropdown,
} from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";
import {
  fetchMembres,
  addMembre,
  updateMembre,
  deleteMembre,
  fetchVisiteurs,
  addVisiteur,
  updateVisiteur,
  deleteVisiteur,
  fetchAbonnements,
  addAbonnement,
  checkMembreAbonnement,
} from "../../services/api";
import { useTranslation } from "react-i18next";

const MembrePage = () => {
  const { t } = useTranslation();

  const [membres, setMembres] = useState([]);
  const [membresAvecAbonnement, setMembresAvecAbonnement] = useState([]);
  const [visiteurs, setVisiteurs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAbonnementModal, setShowAbonnementModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");
  const [filterAbonnement, setFilterAbonnement] = useState("Tous");
  const [activeView, setActiveView] = useState("membres");

  const [currentMembre, setCurrentMembre] = useState({
    id: null,
    nom: "",
    prenom: "-",
    type: "membre",
    statut: "actif",
    avatar: null,
    email: "",
    password: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "",
    date_naissance: "",
    profession: "",
    site_web: "",
    linkedin: "",
    twitter: "",
    bio: "",
  });

  const [currentVisiteur, setCurrentVisiteur] = useState({
    id: null,
    name: "",
    email: "",
    password: "",
    email_verified_at: null,
    statut: "actif",
  });

  const [currentAbonnement, setCurrentAbonnement] = useState({
    membre_id: "",
    membre_nom: "",
    type_abonnement: "mensuel",
    date_debut: new Date().toISOString().split("T")[0],
    date_fin: "",
    statut: "actif",
    montant: "9.99",
    methode_paiement: "Carte",
    notes: "",
  });

  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadMembres(), loadVisiteurs()]);
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      showNotification("error", "Erreur lors du chargement des données");
    } finally {
      setLoading(false);
    }
  };

  const loadMembres = async () => {
    try {
      const res = await fetchMembres();
      const membresData = res.data?.data || res.data || [];
      
      const membresNormalises = membresData.map(m => ({
        ...m,
        nom: m.nom || "",
        prenom: m.prenom || "-",
        type: (m.type || "membre").toString().toLowerCase(),
        statut: (m.statut || "actif").toString().toLowerCase(),
        avatar: m.avatar || null,
        email: m.email || "",
      }));
      
      setMembres(membresNormalises);
      await loadAbonnementsMembres(membresNormalises);
    } catch (err) {
      console.error("Erreur chargement membres:", err);
      showNotification("error", "Erreur lors du chargement des membres");
    }
  };

  const loadVisiteurs = async () => {
    try {
      const res = await fetchVisiteurs();
      const visiteursData = res.data?.data || res.data || [];
      
      const visiteursNormalises = visiteursData.map(v => ({
        ...v,
        name: v.name || "",
        email: v.email || "",
        type: "visiteur",
        statut: (v.statut || "actif").toString().toLowerCase(),
        avatar: null, // Pas d'avatar pour les visiteurs
        created_at: v.created_at,
        updated_at: v.updated_at,
      }));
      
      setVisiteurs(visiteursNormalises);
    } catch (err) {
      console.error("Erreur chargement visiteurs:", err);
      showNotification("error", "Erreur lors du chargement des visiteurs");
    }
  };

  const loadAbonnementsMembres = async (membresList) => {
    try {
      const membresAvecInfo = await Promise.all(
        membresList.map(async (membre) => {
          try {
            const res = await checkMembreAbonnement(membre.id);
            const abonnementInfo = res.data?.data || null;
            
            return {
              ...membre,
              abonnement_info: abonnementInfo,
              has_abonnement: res.data?.has_abonnement || false,
              abonnement_valide: abonnementInfo ? 
                new Date(abonnementInfo.date_fin) > new Date() && abonnementInfo.statut === 'actif' 
                : false,
              jours_restants: abonnementInfo ? 
                Math.ceil((new Date(abonnementInfo.date_fin) - new Date()) / (1000 * 60 * 60 * 24))
                : 0,
            };
          } catch (error) {
            console.error(`Erreur chargement abonnement membre ${membre.id}:`, error);
            return {
              ...membre,
              abonnement_info: null,
              has_abonnement: false,
              abonnement_valide: false,
              jours_restants: 0,
            };
          }
        })
      );
      
      setMembresAvecAbonnement(membresAvecInfo);
    } catch (error) {
      console.error("Erreur chargement abonnements:", error);
      setMembresAvecAbonnement(membresList.map(m => ({
        ...m,
        abonnement_info: null,
        has_abonnement: false,
        abonnement_valide: false,
        jours_restants: 0,
      })));
    }
  };

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ ...showAlert, show: false }), 4000);
  };

  const openAddMembreModal = () => {
    setCurrentMembre({
      id: null,
      nom: "",
      prenom: "-",
      type: "membre",
      statut: "actif",
      avatar: null,
      email: "",
      password: "",
      telephone: "",
      adresse: "",
      ville: "",
      pays: "",
      date_naissance: "",
      profession: "",
      site_web: "",
      linkedin: "",
      twitter: "",
      bio: "",
    });
    setAvatarError("");
    setShowModal(true);
  };

  const openEditMembreModal = (m) => {
    setCurrentMembre({
      ...m,
      password: "",
    });
    setAvatarError("");
    setShowModal(true);
  };

  const openAddVisiteurModal = () => {
    setCurrentVisiteur({
      id: null,
      name: "",
      email: "",
      password: "",
      email_verified_at: null,
      statut: "actif",
    });
    setShowModal(true);
  };

  const openEditVisiteurModal = (v) => {
    setCurrentVisiteur({
      ...v,
      password: "",
    });
    setShowModal(true);
  };

  const openAbonnementModal = (membre) => {
    setCurrentAbonnement({
      membre_id: membre.id,
      membre_nom: `${membre.nom || ""} ${membre.prenom}`.trim(),
      type_abonnement: "mensuel",
      date_debut: new Date().toISOString().split("T")[0],
      date_fin: "",
      statut: "actif",
      montant: "9.99",
      methode_paiement: "Carte",
      notes: "",
    });
    calculateDatesAndPrice();
    setShowAbonnementModal(true);
  };

  const handleMembreChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files && files.length > 0) {
      const file = files[0];
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setAvatarError("L'avatar ne doit pas dépasser 2 Mo");
        e.target.value = "";
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setAvatarError("Format d'image non valide (JPEG, PNG, GIF uniquement)");
        e.target.value = "";
        return;
      }
      setAvatarError("");
      setCurrentMembre({ ...currentMembre, avatar: file });
    } else {
      setCurrentMembre({ ...currentMembre, [name]: value });
    }
  };

  const handleVisiteurChange = (e) => {
    const { name, value } = e.target;
    setCurrentVisiteur({ ...currentVisiteur, [name]: value });
  };

  const handleAbonnementChange = (e) => {
    const { name, value } = e.target;
    setCurrentAbonnement(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === "type_abonnement" || name === "date_debut") {
      calculateDatesAndPrice();
    }
  };

  const calculateDatesAndPrice = () => {
    const dateDebut = new Date(currentAbonnement.date_debut);
    let dateFin = new Date(dateDebut);
    let montant = "9.99";

    switch (currentAbonnement.type_abonnement) {
      case "mensuel":
        dateFin.setMonth(dateFin.getMonth() + 1);
        montant = "9.99";
        break;
      case "trimestriel":
        dateFin.setMonth(dateFin.getMonth() + 3);
        montant = "24.99";
        break;
      case "annuel":
        dateFin.setFullYear(dateFin.getFullYear() + 1);
        montant = "89.99";
        break;
    }

    setCurrentAbonnement(prev => ({
      ...prev,
      date_fin: dateFin.toISOString().split("T")[0],
      montant,
    }));
  };

  const handleSaveMembre = async () => {
    if (!currentMembre.nom?.trim()) {
      showNotification("error", "Le nom est requis");
      return;
    }
    if (!currentMembre.email?.trim()) {
      showNotification("error", "L'email est requis");
      return;
    }
    if (!currentMembre.id && !currentMembre.password) {
      showNotification("error", "Le mot de passe est requis pour un nouveau membre");
      return;
    }
    if (avatarError) {
      showNotification("error", avatarError);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("nom", currentMembre.nom.trim());
      formData.append("prenom", currentMembre.prenom || "-");
      formData.append("type", currentMembre.type);
      formData.append("statut", currentMembre.statut);
      formData.append("email", currentMembre.email.trim());
      if (currentMembre.password) formData.append("password", currentMembre.password);
      if (currentMembre.telephone) formData.append("telephone", currentMembre.telephone);
      if (currentMembre.adresse) formData.append("adresse", currentMembre.adresse);
      if (currentMembre.ville) formData.append("ville", currentMembre.ville);
      if (currentMembre.pays) formData.append("pays", currentMembre.pays);
      if (currentMembre.date_naissance) formData.append("date_naissance", currentMembre.date_naissance);
      if (currentMembre.profession) formData.append("profession", currentMembre.profession);
      if (currentMembre.site_web) formData.append("site_web", currentMembre.site_web);
      if (currentMembre.linkedin) formData.append("linkedin", currentMembre.linkedin);
      if (currentMembre.twitter) formData.append("twitter", currentMembre.twitter);
      if (currentMembre.bio) formData.append("bio", currentMembre.bio);
      
      // Envoi de l'avatar seulement si c'est un nouveau fichier
      if (currentMembre.avatar && typeof currentMembre.avatar !== "string") {
        formData.append("avatar", currentMembre.avatar);
      }

      let response;
      if (currentMembre.id) {
        response = await updateMembre(currentMembre.id, formData);
        showNotification("success", "Membre modifié avec succès");
      } else {
        response = await addMembre(formData);
        showNotification("success", "Membre créé avec succès");
      }
      
      console.log("Response:", response.data);
      loadMembres();
      setShowModal(false);
    } catch (err) {
      console.error("Erreur lors de la sauvegarde du membre:", err);
      const errors = err.response?.data?.errors;
      if (errors) {
        const msg = Object.values(errors).flat().join(", ");
        showNotification("error", msg);
      } else {
        showNotification("error", err.response?.data?.message || err.message || "Erreur serveur");
      }
    }
  };

  const handleSaveVisiteur = async () => {
    if (!currentVisiteur.name?.trim()) {
        showNotification("error", "Le nom est requis");
        return;
    }
    if (!currentVisiteur.email?.trim()) {
        showNotification("error", "L'email est requis");
        return;
    }
    if (!currentVisiteur.id && !currentVisiteur.password) {
        showNotification("error", "Le mot de passe est requis pour un nouveau visiteur");
        return;
    }

    try {
        // Créer un objet JSON (pas FormData)
        const userData = {
        name: currentVisiteur.name.trim(),
        email: currentVisiteur.email.trim(),
        statut: currentVisiteur.statut,
        };
        
        // Ajouter le mot de passe seulement si fourni
        if (currentVisiteur.password) {
        userData.password = currentVisiteur.password;
        }

        // Gérer email_verified_at correctement
        if (currentVisiteur.email_verified_at) {
        userData.email_verified_at = currentVisiteur.email_verified_at;
        } else {
        // Pour un nouvel utilisateur sans vérification
        userData.email_verified_at = null;
        }

        console.log("Données envoyées pour visiteur:", userData);

        let response;
        if (currentVisiteur.id) {
        response = await updateVisiteur(currentVisiteur.id, userData);
        showNotification("success", "Visiteur modifié avec succès");
        } else {
        response = await addVisiteur(userData);
        showNotification("success", "Visiteur créé avec succès");
        }
        
        console.log("Response visiteur:", response.data);
        loadVisiteurs();
        setShowModal(false);
    } catch (err) {
        console.error("Erreur complète:", err);
        console.error("Response data:", err.response?.data);
        console.error("Response status:", err.response?.status);
        
        const errors = err.response?.data?.errors;
        if (errors) {
        const msg = Object.values(errors).flat().join(", ");
        showNotification("error", msg);
        } else {
        showNotification("error", err.response?.data?.message || err.message || "Erreur serveur");
        }
    }
    };

  const handleSaveAbonnement = async () => {
    try {
      if (!currentAbonnement.membre_id) {
        showNotification("error", "Veuillez sélectionner un membre");
        return;
      }

      const abonnementData = {
        membre_id: currentAbonnement.membre_id,
        type_abonnement: currentAbonnement.type_abonnement,
        date_debut: currentAbonnement.date_debut,
        date_fin: currentAbonnement.date_fin,
        montant: currentAbonnement.montant,
        methode_paiement: currentAbonnement.methode_paiement,
        statut: currentAbonnement.statut,
        notes: currentAbonnement.notes || `Abonnement créé depuis l'admin pour ${currentAbonnement.membre_nom}`
      };

      const response = await addAbonnement(abonnementData);
      console.log("Response abonnement:", response.data);
      showNotification("success", "Abonnement créé avec succès");
      loadMembres();
      setShowAbonnementModal(false);
    } catch (error) {
      console.error("Erreur lors de la création de l'abonnement:", error);
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach(err => showNotification("error", err));
      } else {
        showNotification("error", error.response?.data?.message || error.message || "Erreur serveur");
      }
    }
  };

  const handleDeleteMembre = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce membre ?")) return;
    try {
      await deleteMembre(id);
      showNotification("success", "Membre supprimé avec succès");
      loadMembres();
    } catch (err) {
      console.error("Erreur lors de la suppression du membre:", err);
      showNotification("error", err.response?.data?.message || err.message || "Erreur lors de la suppression");
    }
  };

  const handleDeleteVisiteur = async (id) => {
    if (!window.confirm("Confirmer la suppression de ce visiteur ?")) return;
    try {
      await deleteVisiteur(id);
      showNotification("success", "Visiteur supprimé avec succès");
      loadVisiteurs();
    } catch (err) {
      console.error("Erreur lors de la suppression du visiteur:", err);
      showNotification("error", err.response?.data?.message || err.message || "Erreur lors de la suppression");
    }
  };

  const getAbonnementBadge = (membre) => {
    if (!membre.has_abonnement || !membre.abonnement_info) {
      return (
        <Badge bg="secondary" className="px-3 py-2">
          <i className="fas fa-times-circle me-2"></i> Sans abonnement
        </Badge>
      );
    }

    const now = new Date();
    const dateFin = new Date(membre.abonnement_info.date_fin);
    const isExpired = dateFin < now;
    const joursRestants = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));

    if (isExpired || membre.abonnement_info.statut !== 'actif') {
      return (
        <Badge bg="danger" className="px-3 py-2">
          <i className="fas fa-clock me-2"></i> Expiré
        </Badge>
      );
    }

    if (joursRestants <= 7) {
      return (
        <Badge bg="warning" className="px-3 py-2">
          <i className="fas fa-exclamation-triangle me-2"></i> Expire dans {joursRestants} j
        </Badge>
      );
    }

    return (
      <Badge bg="success" className="px-3 py-2">
        <i className="fas fa-check-circle me-2"></i> Valide ({joursRestants} j)
      </Badge>
    );
  };

  const getAbonnementDetails = (membre) => {
    if (!membre.has_abonnement || !membre.abonnement_info) {
      return <small className="text-muted">Aucun abonnement</small>;
    }

    const dateFin = new Date(membre.abonnement_info.date_fin);
    const formattedDate = dateFin.toLocaleDateString("fr-FR");
    
    return (
      <div>
        <small className="text-muted">
          {membre.abonnement_info.type_abonnement} - Jusqu'au {formattedDate}
        </small>
      </div>
    );
  };

  const getStatusBadge = (statut) => {
    const map = {
      actif: { label: "Actif", variant: "success", icon: "fa-check-circle" },
      inactif: { label: "Inactif", variant: "warning", icon: "fa-clock" },
      suspendu: { label: "Suspendu", variant: "danger", icon: "fa-ban" },
    };
    const s = map[statut] || { label: "Inconnu", variant: "secondary", icon: "fa-question" };
    return (
      <Badge bg={s.variant} className="px-3 py-2">
        <i className={`fas ${s.icon} me-2`}></i> {s.label}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const map = {
      admin: { label: "Admin", variant: "primary", icon: "fa-crown" },
      membre: { label: "Membre", variant: "info", icon: "fa-user" },
      moderateur: { label: "Modérateur", variant: "secondary", icon: "fa-user-shield" },
      visiteur: { label: "Visiteur", variant: "secondary", icon: "fa-user-circle" },
    };
    const tBadge = map[type] || { label: type, variant: "dark", icon: "fa-user" };
    return (
      <Badge bg={tBadge.variant} className="px-3 py-2">
        <i className={`fas ${tBadge.icon} me-2`}></i> {tBadge.label}
      </Badge>
    );
  };

  const filteredData = activeView === "membres" 
    ? membresAvecAbonnement.filter(membre => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          ((membre.nom || "").toLowerCase().includes(search) ||
           (membre.prenom || "").toLowerCase().includes(search) ||
           (membre.email || "").toLowerCase().includes(search) ||
           (membre.type || "").toLowerCase().includes(search));

        const matchesStatut =
          filterStatut === "Tous" || membre.statut === filterStatut.toLowerCase();
        
        const matchesType =
          filterType === "Tous" || membre.type === filterType.toLowerCase();

        const matchesAbonnement = filterAbonnement === "Tous" || 
          (filterAbonnement === "Avec abonnement" && membre.has_abonnement && membre.abonnement_valide) ||
          (filterAbonnement === "Sans abonnement" && !membre.has_abonnement) ||
          (filterAbonnement === "Expire" && membre.has_abonnement && !membre.abonnement_valide);

        return matchesSearch && matchesStatut && matchesType && matchesAbonnement;
      })
    : visiteurs.filter(visiteur => {
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          ((visiteur.name || "").toLowerCase().includes(search) ||
           (visiteur.email || "").toLowerCase().includes(search));

        const matchesStatut =
          filterStatut === "Tous" || visiteur.statut === filterStatut.toLowerCase();
        
        const matchesType =
          filterType === "Tous" || visiteur.type === filterType.toLowerCase();

        return matchesSearch && matchesStatut && matchesType;
      });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatut("Tous");
    setFilterType("Tous");
    setFilterAbonnement("Tous");
  };

  const removeAvatar = () => {
    setCurrentMembre({ ...currentMembre, avatar: null });
    setAvatarError("");
  };

  const statsMembres = {
    total: membres.length,
    actifs: membres.filter(m => m.statut === "actif").length,
    avec_abonnement: membresAvecAbonnement.filter(m => m.has_abonnement && m.abonnement_valide).length,
    sans_abonnement: membresAvecAbonnement.filter(m => !m.has_abonnement).length,
  };

  const statsVisiteurs = {
    total: visiteurs.length,
    actifs: visiteurs.filter(v => v.statut === "actif").length,
    inactifs: visiteurs.filter(v => v.statut === "inactif").length,
    suspendus: visiteurs.filter(v => v.statut === "suspendu").length,
    verifies: visiteurs.filter(v => v.email_verified_at).length,
    non_verifies: visiteurs.filter(v => !v.email_verified_at).length,
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {showAlert.show && (
          <Alert
            variant={showAlert.type === "success" ? "success" : "danger"}
            className="position-fixed top-3 end-3 shadow-lg"
            style={{ zIndex: 9999, minWidth: "350px" }}
            onClose={() => setShowAlert({ ...showAlert, show: false })}
            dismissible
          >
            <strong>{showAlert.type === "success" ? "Succès" : "Erreur"}</strong>
            <p className="mb-0">{showAlert.message}</p>
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2 text-gradient">
              {activeView === "membres" ? "Gestion des Membres" : "Gestion des Visiteurs"}
            </h2>
            <p className="text-muted">
              <i className="fas fa-users me-2"></i> 
              {activeView === "membres" 
                ? "Visualisez et gérez tous les membres avec abonnement" 
                : "Visualisez et gérez tous les visiteurs inscrits"}
            </p>
          </div>
          <div className="d-flex align-items-center">
            <Button 
              variant={activeView === "visiteurs" ? "primary" : "outline-primary"}
              onClick={() => setActiveView(activeView === "membres" ? "visiteurs" : "membres")}
              className="shadow me-3"
            >
              <i className={`fas ${activeView === "membres" ? "fa-user-circle" : "fa-users"} me-2`}></i>
              {activeView === "membres" ? "Voir les visiteurs" : "Voir les membres"}
            </Button>
            
            <Button 
              variant="primary" 
              onClick={activeView === "membres" ? openAddMembreModal : openAddVisiteurModal} 
              className="shadow me-2"
            >
              <i className="fas fa-user-plus me-2"></i> 
              {activeView === "membres" ? "Nouveau membre" : "Nouveau visiteur"}
            </Button>
            
            {activeView === "membres" && (
              <Button variant="success" onClick={() => openAbonnementModal({ id: "", nom: "Sélectionner un membre", prenom: "" })} className="shadow">
                <i className="fas fa-credit-card me-2"></i> Nouvel abonnement
              </Button>
            )}
          </div>
        </div>

        <Row className="mb-4">
          {activeView === "membres" ? (
            <>
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#667eea" }}>
                      <i className="fas fa-users text-white fs-4"></i>
                    </div>
                    <h4 className="mb-0">{statsMembres.total}</h4>
                    <small className="text-muted">Total membres</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#00b09b" }}>
                      <i className="fas fa-user-check text-white fs-4"></i>
                    </div>
                    <h4 className="mb-0">{statsMembres.actifs}</h4>
                    <small className="text-muted">Membres actifs</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#4cd964" }}>
                      <i className="fas fa-credit-card text-white fs-4"></i>
                    </div>
                    <h4 className="mb-0">{statsMembres.avec_abonnement}</h4>
                    <small className="text-muted">Avec abonnement</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#fd746c" }}>
                      <i className="fas fa-credit-card text-white fs-4"></i>
                    </div>
                    <h4 className="mb-0">{statsMembres.sans_abonnement}</h4>
                    <small className="text-muted">Sans abonnement</small>
                  </Card.Body>
                </Card>
              </Col>
            </>
          ) : (
            <>
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#667eea" }}>
                      <i className="fas fa-user-circle text-white fs-4"></i>
                    </div>
                    <h4 className="mb-0">{statsVisiteurs.total}</h4>
                    <small className="text-muted">Total visiteurs</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#00b09b" }}>
                      <i className="fas fa-user-check text-white fs-4"></i>
                    </div>
                    <h4 className="mb-0">{statsVisiteurs.actifs}</h4>
                    <small className="text-muted">Visiteurs actifs</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#ffc107" }}>
                      <i className="fas fa-clock text-white fs-4"></i>
                    </div>
                    <h4 className="mb-0">{statsVisiteurs.inactifs}</h4>
                    <small className="text-muted">Visiteurs inactifs</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={3}>
                <Card className="border-0 shadow-sm h-100">
                  <Card.Body className="text-center">
                    <div className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60, background: "#dc3545" }}>
                      <i className="fas fa-ban text-white fs-4"></i>
                    </div>
                    <h4 className="mb-0">{statsVisiteurs.suspendus}</h4>
                    <small className="text-muted">Visiteurs suspendus</small>
                  </Card.Body>
                </Card>
              </Col>
            </>
          )}
        </Row>

        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={activeView === "membres" ? 3 : 4}>
                <Form.Control
                  type="text"
                  placeholder={activeView === "membres" ? "Rechercher un membre..." : "Rechercher un visiteur..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={activeView === "membres" ? 2 : 3}>
                <Form.Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
                  <option value="Tous">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">Inactif</option>
                  <option value="suspendu">Suspendu</option>
                </Form.Select>
              </Col>
              <Col md={activeView === "membres" ? 2 : 3}>
                {activeView === "membres" ? (
                  <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="Tous">Tous les rôles</option>
                    <option value="admin">Admin</option>
                    <option value="membre">Membre</option>
                    <option value="moderateur">Modérateur</option>
                  </Form.Select>
                ) : (
                  <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                    <option value="Tous">Tous les types</option>
                    <option value="visiteur">Visiteur</option>
                  </Form.Select>
                )}
              </Col>
              {activeView === "membres" && (
                <Col md={2}>
                  <Form.Select value={filterAbonnement} onChange={(e) => setFilterAbonnement(e.target.value)}>
                    <option value="Tous">Tous abonnements</option>
                    <option value="Avec abonnement">Avec abonnement</option>
                    <option value="Sans abonnement">Sans abonnement</option>
                    <option value="Expire">Abonnement expiré</option>
                  </Form.Select>
                </Col>
              )}
              <Col md={activeView === "membres" ? 3 : 2}>
                <Button variant="outline-secondary" onClick={clearFilters} className="me-2">
                  Réinitialiser
                </Button>
                <Button variant="info" onClick={loadAllData}>
                  <i className="fas fa-sync-alt me-1"></i> Actualiser
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
                <p className="mt-2">Chargement...</p>
              </div>
            ) : (
              <Table hover responsive>
                <thead className={activeView === "membres" ? "bg-primary text-white" : "bg-info text-white"}>
                  <tr>
                    <th>Avatar</th>
                    <th>{activeView === "membres" ? "Membre" : "Visiteur"}</th>
                    <th>Rôle</th>
                    <th>Email</th>
                    <th>Statut</th>
                    {activeView === "membres" && <th>État abonnement</th>}
                    <th>Inscrit le</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length > 0 ? (
                    filteredData.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {activeView === "membres" ? (
                            item.avatar ? (
                              <Image 
                                src={typeof item.avatar === 'string' && item.avatar.includes('http') 
                                  ? item.avatar 
                                  : `http://127.0.0.1:8000/storage/${item.avatar}`} 
                                roundedCircle 
                                width={45} 
                                height={45} 
                                style={{ objectFit: "cover" }} 
                              />
                            ) : (
                              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: 45, height: 45 }}>
                                <i className="fas fa-user"></i>
                              </div>
                            )
                          ) : (
                            <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: 45, height: 45 }}>
                              <i className="fas fa-user-circle"></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <strong>
                            {activeView === "membres" 
                              ? `${item.nom || ""} ${item.prenom || ""}`.trim()
                              : item.name}
                          </strong>
                          {activeView === "membres" && item.telephone && (
                            <>
                              <br />
                              <small className="text-muted">{item.telephone}</small>
                            </>
                          )}
                        </td>
                        <td>{getTypeBadge(item.type)}</td>
                        <td>
                          {item.email}
                          {activeView === "visiteurs" && item.email_verified_at && (
                            <Badge bg="success" className="ms-2" size="sm">
                              <i className="fas fa-check"></i>
                            </Badge>
                          )}
                        </td>
                        <td>{getStatusBadge(item.statut)}</td>
                        {activeView === "membres" && (
                          <td>
                            {getAbonnementBadge(item)}
                            {getAbonnementDetails(item)}
                          </td>
                        )}
                        <td>
                          <small className="text-muted">
                            {new Date(item.created_at).toLocaleDateString("fr-FR")}
                          </small>
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-actions">
                              <i className="fas fa-cog"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item onClick={() => 
                                activeView === "membres" 
                                  ? openEditMembreModal(item) 
                                  : openEditVisiteurModal(item)
                              }>
                                <i className="fas fa-edit me-2"></i>
                                Modifier
                              </Dropdown.Item>
                              {activeView === "membres" && item.type !== "visiteur" && (
                                <Dropdown.Item onClick={() => openAbonnementModal(item)}>
                                  <i className="fas fa-credit-card me-2"></i>
                                  {item.has_abonnement ? "Renouveler abonnement" : "Ajouter abonnement"}
                                </Dropdown.Item>
                              )}
                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => 
                                activeView === "membres" 
                                  ? handleDeleteMembre(item.id) 
                                  : handleDeleteVisiteur(item.id)
                              } className="text-danger">
                                <i className="fas fa-trash me-2"></i>
                                Supprimer
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={activeView === "membres" ? "8" : "7"} className="text-center py-4">
                        <i className={`fas ${activeView === "membres" ? "fa-users" : "fa-user-circle"} fs-1 text-muted mb-3 d-block`}></i>
                        <h5 className="text-muted">
                          {activeView === "membres" ? "Aucun membre trouvé" : "Aucun visiteur trouvé"}
                        </h5>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton className={activeView === "membres" ? "bg-primary text-white" : "bg-info text-white"}>
            <Modal.Title>
              {activeView === "membres" 
                ? (currentMembre.id ? "Modifier un membre" : "Ajouter un membre")
                : (currentVisiteur.id ? "Modifier un visiteur" : "Ajouter un visiteur")
              }
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {activeView === "membres" ? (
              <Form>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Nom *</Form.Label><Form.Control type="text" name="nom" value={currentMembre.nom || ""} onChange={handleMembreChange} required /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Prénom</Form.Label><Form.Control type="text" name="prenom" value={currentMembre.prenom || ""} onChange={handleMembreChange} /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Rôle *</Form.Label><Form.Select name="type" value={currentMembre.type} onChange={handleMembreChange}><option value="membre">Membre</option><option value="admin">Admin</option><option value="moderateur">Modérateur</option></Form.Select></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Statut *</Form.Label><Form.Select name="statut" value={currentMembre.statut} onChange={handleMembreChange}><option value="actif">Actif</option><option value="inactif">Inactif</option><option value="suspendu">Suspendu</option></Form.Select></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" name="email" value={currentMembre.email || ""} onChange={handleMembreChange} required /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Mot de passe {currentMembre.id ? "(laisser vide pour ne pas changer)" : "*"}</Form.Label><Form.Control type="password" name="password" value={currentMembre.password || ""} onChange={handleMembreChange} required={!currentMembre.id} /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Téléphone</Form.Label><Form.Control type="text" name="telephone" value={currentMembre.telephone || ""} onChange={handleMembreChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Date de naissance</Form.Label><Form.Control type="date" name="date_naissance" value={currentMembre.date_naissance || ""} onChange={handleMembreChange} /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3"><Form.Label>Adresse</Form.Label><Form.Control type="text" name="adresse" value={currentMembre.adresse || ""} onChange={handleMembreChange} /></Form.Group>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Ville</Form.Label><Form.Control type="text" name="ville" value={currentMembre.ville || ""} onChange={handleMembreChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Pays</Form.Label><Form.Control type="text" name="pays" value={currentMembre.pays || ""} onChange={handleMembreChange} /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Profession</Form.Label><Form.Control type="text" name="profession" value={currentMembre.profession || ""} onChange={handleMembreChange} /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Avatar (max 2 Mo)</Form.Label><Form.Control type="file" name="avatar" accept="image/*" onChange={handleMembreChange} />
                    {avatarError && <small className="text-danger">{avatarError}</small>}
                    {currentMembre.avatar && (
                      <div className="mt-3 text-center position-relative d-inline-block">
                        <Image src={typeof currentMembre.avatar === "string" ? currentMembre.avatar : URL.createObjectURL(currentMembre.avatar)} roundedCircle width={100} height={100} className="border" />
                        <Button variant="danger" size="sm" className="position-absolute top-0 end-0 rounded-circle" onClick={removeAvatar}>×</Button>
                      </div>
                    )}
                  </Form.Group></Col>
                </Row>
                <Row>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>Site web</Form.Label><Form.Control type="url" name="site_web" value={currentMembre.site_web || ""} onChange={handleMembreChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>LinkedIn</Form.Label><Form.Control type="url" name="linkedin" value={currentMembre.linkedin || ""} onChange={handleMembreChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group className="mb-3"><Form.Label>Twitter</Form.Label><Form.Control type="url" name="twitter" value={currentMembre.twitter || ""} onChange={handleMembreChange} /></Form.Group></Col>
                </Row>
                <Form.Group className="mb-3"><Form.Label>Bio</Form.Label><Form.Control as="textarea" rows={3} name="bio" value={currentMembre.bio || ""} onChange={handleMembreChange} /></Form.Group>
              </Form>
            ) : (
              <Form>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Nom complet *</Form.Label><Form.Control type="text" name="name" value={currentVisiteur.name || ""} onChange={handleVisiteurChange} required /></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Email *</Form.Label><Form.Control type="email" name="email" value={currentVisiteur.email || ""} onChange={handleVisiteurChange} required /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Statut *</Form.Label><Form.Select name="statut" value={currentVisiteur.statut} onChange={handleVisiteurChange}><option value="actif">Actif</option><option value="inactif">Inactif</option><option value="suspendu">Suspendu</option></Form.Select></Form.Group></Col>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Mot de passe {currentVisiteur.id ? "(laisser vide pour ne pas changer)" : "*"}</Form.Label><Form.Control type="password" name="password" value={currentVisiteur.password || ""} onChange={handleVisiteurChange} required={!currentVisiteur.id} /></Form.Group></Col>
                </Row>
                <Row>
                  <Col md={6}><Form.Group className="mb-3"><Form.Label>Email vérifié</Form.Label><Form.Select name="email_verified_at" value={currentVisiteur.email_verified_at ? "1" : "0"} onChange={(e) => setCurrentVisiteur({...currentVisiteur, email_verified_at: e.target.value === "1" ? new Date().toISOString() : null})}><option value="0">Non vérifié</option><option value="1">Vérifié</option></Form.Select></Form.Group></Col>
                </Row>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button variant={activeView === "membres" ? "primary" : "info"} onClick={activeView === "membres" ? handleSaveMembre : handleSaveVisiteur}>
              {activeView === "membres" ? (currentMembre.id ? "Enregistrer" : "Créer") : (currentVisiteur.id ? "Enregistrer" : "Créer")}
            </Button>
          </Modal.Footer>
        </Modal>

        <Modal show={showAbonnementModal} onHide={() => setShowAbonnementModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title><i className="fas fa-credit-card me-2"></i>{currentAbonnement.membre_id ? `Abonnement pour ${currentAbonnement.membre_nom}` : "Nouvel abonnement"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Membre *</Form.Label><Form.Select name="membre_id" value={currentAbonnement.membre_id} onChange={(e) => {
                const selectedMembre = membres.find(m => m.id == e.target.value);
                setCurrentAbonnement(prev => ({...prev, membre_id: e.target.value, membre_nom: selectedMembre ? `${selectedMembre.nom || ""} ${selectedMembre.prenom || ""}`.trim() : ""}));
              }} required><option value="">Sélectionner un membre</option>{membres.map((membre) => (<option key={membre.id} value={membre.id}>{membre.nom || ""} {membre.prenom || ""} ({membre.email})</option>))}</Form.Select></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Type d'abonnement *</Form.Label><Form.Select name="type_abonnement" value={currentAbonnement.type_abonnement} onChange={handleAbonnementChange} required><option value="mensuel">Mensuel - 9.99€</option><option value="trimestriel">Trimestriel - 24.99€</option><option value="annuel">Annuel - 89.99€</option></Form.Select></Form.Group></Col>
              </Row>
              <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Date de début *</Form.Label><Form.Control type="date" name="date_debut" value={currentAbonnement.date_debut} onChange={handleAbonnementChange} required /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Date de fin *</Form.Label><Form.Control type="date" name="date_fin" value={currentAbonnement.date_fin} onChange={handleAbonnementChange} required readOnly /></Form.Group></Col>
              </Row>
              <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Montant *</Form.Label><Form.Control type="number" step="0.01" name="montant" value={currentAbonnement.montant} onChange={handleAbonnementChange} required /></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>Méthode de paiement</Form.Label><Form.Select name="methode_paiement" value={currentAbonnement.methode_paiement} onChange={handleAbonnementChange}><option value="Carte">Carte bancaire</option><option value="PayPal">PayPal</option><option value="Virement">Virement bancaire</option><option value="Espèces">Espèces</option><option value="Chèque">Chèque</option></Form.Select></Form.Group></Col>
              </Row>
              <Row><Col md={6}><Form.Group className="mb-3"><Form.Label>Statut *</Form.Label><Form.Select name="statut" value={currentAbonnement.statut} onChange={handleAbonnementChange} required><option value="actif">Actif</option><option value="expiré">Expiré</option><option value="annulé">Annulé</option></Form.Select></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-3"><Form.Label>ID Transaction</Form.Label><Form.Control type="text" name="transaction_id" value={currentAbonnement.transaction_id || ""} onChange={handleAbonnementChange} placeholder="TRX-123456" /></Form.Group></Col>
              </Row>
              <Form.Group className="mb-3"><Form.Label>Notes</Form.Label><Form.Control as="textarea" rows={3} name="notes" value={currentAbonnement.notes || ""} onChange={handleAbonnementChange} placeholder="Notes supplémentaires..." /></Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAbonnementModal(false)}>Annuler</Button>
            <Button variant="success" onClick={handleSaveAbonnement}><i className="fas fa-check me-2"></i>Créer l'abonnement</Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default MembrePage;