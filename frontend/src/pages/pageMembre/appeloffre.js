import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Row, Col, Badge, Alert } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import axios from "axios";

// === CONFIGURATION API ===
axios.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const API_URL = "http://127.0.0.1:8000/api/appeloffres";

const AppelOffreMembre = () => {
  const [offres, setOffres] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentOffre, setCurrentOffre] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [nouvelleOffre, setNouvelleOffre] = useState({
    intitule: "", description: "", date_cloture: "", date_ouverture: "", membre: "", fichier: null,
    statut: "En attente", type: "CDI", localisation: "", salaire: "", est_urgent: false
  });

  // === INITIALISATION UTILISATEUR ===
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(user);
  }, []);

  // === FONCTIONS UTILITAIRES ===
  const showAlert = (m,t) => { 
    setAlert({show:true,message:m,type:t}); 
    setTimeout(() => setAlert({show:false}),4000); 
  };
  
  const handleClose = () => { 
    setShowModal(false); 
    setEditMode(false); 
    setCurrentOffre(null); 
  };
  
  const handleShowAdd = () => { 
    setEditMode(false); 
    setCurrentOffre(null); 
    
    // Définir automatiquement le membre connecté comme auteur
    const user = JSON.parse(localStorage.getItem('user'));
    const membreName = user?.nom_complet || user?.nom || user?.email || "Utilisateur Membre";
    
    setNouvelleOffre({
      intitule:"",
      description:"",
      date_cloture:"",
      date_ouverture: new Date().toISOString().split('T')[0], // Date du jour par défaut
      membre: membreName,
      fichier:null,
      statut:"En attente", // Statut par défaut
      type:"CDI",
      localisation:"",
      salaire:"",
      est_urgent:false
    }); 
    setShowModal(true); 
  };
  
  const handleShowEdit = o => { 
    if (!isUserAuthor(o)) {
      showAlert("Vous n'êtes pas autorisé à modifier cette offre.", "warning");
      return;
    }
    
    setEditMode(true); 
    setCurrentOffre(o); 
    setNouvelleOffre({
      intitule:o.intitule,
      description:o.description,
      date_cloture:o.date_cloture,
      date_ouverture:o.date_ouverture,
      membre:o.membre,
      fichier:null,
      statut:o.statut, // Conserver le statut actuel en édition
      type:o.type_contrat||"CDI",
      localisation:o.localisation||"",
      salaire:o.salaire_remuneration||"",
      est_urgent:!!o.est_urgent
    }); 
    setShowModal(true); 
  };

  // Vérifier si l'utilisateur est l'auteur de l'offre
  const isUserAuthor = (offre) => {
    if (!currentUser) return false;
    
    // Si l'utilisateur est admin, il peut tout modifier
    if (currentUser.type === 'admin') return true;
    
    // Comparaison par membre_id ou nom d'auteur
    if (offre.membre_id && currentUser.id) {
      return offre.membre_id === currentUser.id;
    }
    
    return offre.membre === currentUser.nom_complet || 
           offre.membre === currentUser.nom || 
           offre.membre === currentUser.email;
  };

  // Badge indicateur "Votre offre"
  const getUserBadge = (offre) => {
    if (isUserAuthor(offre)) {
      return (
        <Badge bg="info" className="ms-1 px-2 py-1" style={{ fontSize: "0.7rem" }}>
          <i className="fas fa-user me-1"></i>Votre offre
        </Badge>
      );
    }
    return null;
  };

  // Badge pour les offres anonymes
  const getAnonymeBadge = (offre) => {
    if (offre.membre === "Anonyme" || !offre.membre_id) {
      return (
        <Badge bg="secondary" className="ms-1 px-2 py-1" style={{ fontSize: "0.7rem" }}>
          <i className="fas fa-user-secret me-1"></i>Anonyme
        </Badge>
      );
    }
    return null;
  };
  
  const handleChange = e => { 
    const {name,value,type,checked,files}=e.target; 
    setNouvelleOffre(p=>({
      ...p,
      [name]:type==="file"?files[0]:type==="checkbox"?checked:value
    })); 
  };

  // Badge de statut avec icônes
  const statusBadge = (statut) => {
    const config = {
      "Validé": { color: "success", icon: "fa-check-circle", text: "Validé" },
      "En attente": { color: "warning", icon: "fa-clock", text: "En attente" },
      "Rejeté": { color: "danger", icon: "fa-times-circle", text: "Rejeté" },
      "Actif": { color: "primary", icon: "fa-play-circle", text: "Actif" },
      "Clôturé": { color: "secondary", icon: "fa-flag-checkered", text: "Clôturé" }
    };
    
    const cfg = config[statut] || config["En attente"];
    
    return (
      <Badge 
        bg={cfg.color} 
        className="d-flex align-items-center px-3 py-2" 
        style={{ borderRadius: "20px", fontSize: "0.8rem", fontWeight: "600" }}
      >
        <i className={`fas ${cfg.icon} me-1`}></i>
        {cfg.text}
      </Badge>
    );
  };

  const typeBadge = t => (
    <Badge 
      bg={{
        "CDI":"success", 
        "CDD":"warning", 
        "Stage":"info", 
        "Freelance":"primary", 
        "Alternance":"dark"
      }[t] || "secondary"} 
      className="px-3 py-2" 
      style={{borderRadius:"15px", fontSize:"0.8rem"}}
    >
      {t}
    </Badge>
  );
  
  const format = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}) : "Date NC";
  const urgent = o => o.est_urgent || (o.date_cloture && new Date(o.date_cloture).setHours(0,0,0,0) - new Date().setHours(0,0,0,0) <= 7*86400000);
  
  // === API ===
  const fetchOffres = async () => {
    setError(null);
    setLoading(true);
    try { 
      const response = await axios.get(API_URL);
      
      // Charger les statistiques pour chaque offre validée
      const offresWithStats = await Promise.all(
        response.data.map(async (offre) => {
          if (offre.statut === "Validé") {
            try {
              const statsResponse = await axios.get(`${API_URL}/${offre.id}/stats`);
              return {
                ...offre,
                stats: statsResponse.data.stats || {
                  total_views: 0,
                  total_reactions: 0,
                  reactions_by_type: {}
                }
              };
            } catch (error) {
              console.warn(`Stats non disponibles pour l'offre ${offre.id}:`, error.message);
              return {
                ...offre,
                stats: {
                  total_views: 0,
                  total_reactions: 0,
                  reactions_by_type: {}
                }
              };
            }
          }
          return offre;
        })
      );

      // Filtrer les offres selon le type d'utilisateur
      let filteredOffres = offresWithStats;
      
      if (currentUser && currentUser.type === 'membre') {
        filteredOffres = offresWithStats.filter(offre => 
          offre.membre_id === currentUser.id || 
          offre.membre === currentUser.nom_complet ||
          offre.membre === currentUser.nom ||
          offre.membre === currentUser.email
        );
      }
      
      setOffres(filteredOffres);
    }
    catch (err) { 
      console.error("Erreur chargement offres:", err);
      setError("Impossible de charger les appels d'offre. Vérifiez la connexion API."); 
    }
    finally {
      setLoading(false);
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!localStorage.getItem('token')) return showAlert("Connectez-vous d'abord.", "danger");
    setIsSubmitting(true);
    
    if (!nouvelleOffre.intitule || !nouvelleOffre.date_cloture || !nouvelleOffre.description) {
      showAlert("Champs obligatoires manquants.", "warning"); 
      setIsSubmitting(false); 
      return;
    }

    const f = new FormData();
    
    // Toujours définir le statut "En attente" pour les nouvelles offres (sauf si admin)
    let statutFinal = nouvelleOffre.statut;
    if (!editMode && currentUser?.type !== 'admin') {
      statutFinal = "En attente";
    }
    
    // Préparer les données pour l'API
    const donnees = {
      intitule: nouvelleOffre.intitule,
      description: nouvelleOffre.description,
      date_cloture: nouvelleOffre.date_cloture,
      date_ouverture: nouvelleOffre.date_ouverture,
      membre: nouvelleOffre.membre,
      statut: statutFinal,
      type_contrat: nouvelleOffre.type,
      localisation: nouvelleOffre.localisation,
      salaire_remuneration: nouvelleOffre.salaire,
      est_urgent: nouvelleOffre.est_urgent ? 1 : 0
    };

    // Ajouter les données au FormData
    Object.entries(donnees).forEach(([key, value]) => {
      f.append(key, value || "");
    });
    
    if (nouvelleOffre.fichier) f.append("fichier", nouvelleOffre.fichier);

    try {
      if (editMode && currentOffre) {
        f.append("_method","PUT");
        await axios.post(`${API_URL}/${currentOffre.id}`, f, { 
          headers: { "Content-Type": "multipart/form-data" }
        });
        showAlert("Offre modifiée avec succès !", "success");
      } else {
        await axios.post(API_URL, f, { 
          headers: { "Content-Type": "multipart/form-data" }
        });
        
        // Message différent selon le statut
        const message = statutFinal === "En attente" 
          ? "Appel d'offre créé ! En attente de validation par l'administrateur." 
          : "Appel d'offre créé avec succès !";
        
        showAlert(message, "success");
      }
      handleClose(); 
      fetchOffres();
    } catch (err) { 
      showAlert(`Erreur: ${err.response?.data?.message || "Échec de l'opération."}`, "danger"); 
    }
    finally { 
      setIsSubmitting(false); 
    }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`);
      showAlert("Offre supprimée avec succès !", "success");
      fetchOffres();
    } catch {
      showAlert("Échec de la suppression.", "danger");
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  useEffect(() => { 
    if (currentUser) {
      fetchOffres(); 
    }
  }, [currentUser]);

  // === AFFICHAGE DES STATISTIQUES ===
  const renderStats = (offre) => {
    if (!offre.stats || offre.statut !== "Validé") return null;

    const { total_views, total_reactions, reactions_by_type } = offre.stats;

    return (
      <div className="stats-container mt-3 pt-3 border-top">
        <div className="d-flex justify-content-between align-items-center">
          {/* Vues */}
          <div className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center text-muted stats-item">
              <i className="fas fa-eye me-1"></i>
              <small className="fw-semibold">{total_views || 0}</small>
              <span className="ms-1 stats-label">vues</span>
            </div>
            
            {/* Réactions */}
            {total_reactions > 0 && (
              <div className="d-flex align-items-center gap-2 reactions-container">
                {/* Like */}
                {reactions_by_type.like > 0 && (
                  <div className="d-flex align-items-center text-primary reaction-item">
                    <i className="fas fa-thumbs-up me-1"></i>
                    <small className="fw-semibold">{reactions_by_type.like}</small>
                  </div>
                )}
                
                {/* Love */}
                {reactions_by_type.love > 0 && (
                  <div className="d-flex align-items-center text-danger reaction-item">
                    <i className="fas fa-heart me-1"></i>
                    <small className="fw-semibold">{reactions_by_type.love}</small>
                  </div>
                )}
                
                {/* Wow */}
                {reactions_by_type.wow > 0 && (
                  <div className="d-flex align-items-center text-warning reaction-item">
                    <i className="fas fa-surprise me-1"></i>
                    <small className="fw-semibold">{reactions_by_type.wow}</small>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Total réactions */}
          {total_reactions > 0 && (
            <div className="d-flex align-items-center text-muted">
              <small className="fw-semibold">
                {total_reactions} réaction{total_reactions > 1 ? 's' : ''}
              </small>
            </div>
          )}
        </div>
      </div>
    );
  };

  // === CONSTRUCTION URL COMPLÈTE FICHIER ===
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    const baseUrl = "http://127.0.0.1:8000";
    const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${baseUrl}${path}`;
  };

  // === AFFICHAGE FICHIER PROFESSIONNEL ===
  const renderFile = filePath => {
    if (!filePath) return null;
    
    const fileUrl = getFileUrl(filePath);
    const fileName = filePath.split('/').pop();
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') 
      return (
        <div className="file-compact">
          <div className="file-compact-header">
            <i className="fas fa-file-pdf text-danger"></i>
            <span className="file-compact-name">{fileName}</span>
          </div>
          <div className="file-compact-preview">
            <iframe src={fileUrl} width="100%" height="280" style={{border:"none",borderRadius:"6px"}} title="PDF"/>
          </div>
          <div className="file-compact-actions">
            <Button variant="link" size="sm" href={fileUrl} target="_blank">
              <i className="fas fa-eye me-1"></i>Voir
            </Button>
            <Button variant="link" size="sm" href={fileUrl} download>
              <i className="fas fa-download me-1"></i>Télécharger
            </Button>
          </div>
        </div>
      );
      
    // ... (le reste de la fonction renderFile reste identique)
    return (
      <div className="file-compact">
        <div className="file-compact-header">
          <i className="fas fa-file-alt text-secondary"></i>
          <span className="file-compact-name">{fileName}</span>
        </div>
        <div className="file-compact-preview text-center py-3">
          <i className="fas fa-file-alt" style={{fontSize:"2.5rem",color:"#adb5bd"}}></i>
          <p className="text-muted small mb-0 mt-2">Fichier {ext.toUpperCase()}</p>
        </div>
        <div className="file-compact-actions">
          <Button variant="link" size="sm" href={fileUrl} target="_blank">
            <i className="fas fa-external-link-alt me-1"></i>Ouvrir
          </Button>
          <Button variant="link" size="sm" href={fileUrl} download>
            <i className="fas fa-download me-1"></i>Télécharger
          </Button>
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Alert variant="danger" className="shadow-lg p-4" style={{borderRadius:"15px"}}>
          <i className="fas fa-exclamation-triangle me-2"></i>
          <h4>Erreur API</h4>
          <p>{error}</p>
          <hr/>
          <p>Démarrez Laravel: <code>php artisan serve</code></p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="d-flex min-vh-100" style={{background:"linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)"}}>
      <div style={{width:sidebarCollapsed?"80px":"280px",transition:"width .3s ease",flexShrink:0}}>
        <MembreSidebar onCollapse={v=>setSidebarCollapsed(v)}/>
      </div>
      
      <div className="flex-grow-1" style={{padding:"30px",transition:"all .3s ease"}}>
        {alert.show && (
          <Alert variant={alert.type} dismissible onClose={()=>setAlert({show:false})} 
                 className="mb-4 border-0 shadow" style={{borderRadius:"15px"}}>
            <i className={`fas ${alert.type==="success"?"fa-check-circle":"fa-exclamation-triangle"} me-2`}></i>
            {alert.message}
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-2" style={{color:"#2c3e50",fontSize:"2.2rem"}}>
              {currentUser?.type === 'admin' ? 'Appels d\'Offre' : 'Mes Appels d\'Offre'}
            </h1>
            <p className="text-muted mb-0" style={{fontSize:"1.1rem"}}>
              {currentUser?.type === 'admin' 
                ? 'Gérez tous les appels d\'offre' 
                : 'Gérez vos appels d\'offre - En attente de validation par l\'administrateur'}
            </p>
          </div>
          <Button variant="primary" onClick={handleShowAdd} className="rounded-pill px-4 py-2" 
                  style={{background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",border:"none",fontWeight:"600",fontSize:"1rem"}}>
            <i className="fas fa-plus-circle me-2"></i>Nouvel Appel
          </Button>
        </div>

        {/* Statistiques Dashboard */}
        <Row className="mb-5">
          {[
            {n:offres.length, l:"Total", c:"primary", i:"briefcase"},
            {n:offres.filter(o=>o.statut==="Validé").length, l:"Validées", c:"success", i:"check-circle"},
            {n:offres.filter(o=>o.statut==="En attente").length, l:"En attente", c:"warning", i:"clock"},
            {n:offres.filter(urgent).length, l:"Urgents", c:"danger", i:"exclamation-triangle"},
            {n:offres.reduce((total, o) => total + (o.stats?.total_views || 0), 0), l:"Vues totales", c:"info", i:"eye"},
            {n:offres.reduce((total, o) => total + (o.stats?.total_reactions || 0), 0), l:"Réactions totales", c:"secondary", i:"heart"}
          ].map((s,k) => (
            <Col key={k} xl={4} lg={4} md={6} className="mb-4">
              <Card className="shadow-lg border-0 text-center p-4 h-100" style={{borderRadius:"20px"}}>
                <div className={`bg-${s.c} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} 
                     style={{width:60,height:60}}>
                  <i className={`fas fa-${s.i} text-${s.c} fs-4`}></i>
                </div>
                <h3 className={`fw-bold text-${s.c} mb-2`}>{s.n}</h3>
                <p className="text-muted mb-0">{s.l}</p>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Indicateur de statut pour les membres */}
        {currentUser?.type === 'membre' && offres.some(o => o.statut === "En attente") && (
          <Alert variant="info" className="mb-4">
            <i className="fas fa-info-circle me-2"></i>
            <strong>Information :</strong> Vos offres en attente de validation ne sont visibles que par vous. 
            Elles seront publiées après validation par l'administrateur.
          </Alert>
        )}

        {/* Liste des Appels d'Offre */}
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3 text-muted">Chargement des appels d'offre...</p>
          </div>
        ) : offres.length === 0 ? (
          <Alert variant="info" className="text-center w-100">
            <i className="fas fa-info-circle me-2"></i>
            {currentUser?.type === 'admin' 
              ? 'Aucun appel d\'offre trouvé.' 
              : 'Aucun appel d\'offre personnel trouvé. Créez votre premier appel d\'offre !'}
          </Alert>
        ) : (
          <Row>
            {offres.map(o => {
              const userIsAuthor = isUserAuthor(o);
              
              return (
                <Col key={o.id} xl={6} lg={6} className="mb-4">
                  <Card className="shadow-lg border-0 h-100" 
                        style={{
                          borderRadius:"20px",
                          transition:"all .3s ease",
                          overflow:"hidden",
                          borderLeft:`4px solid ${
                            o.est_urgent ? "#ff6b6b" : 
                            o.statut === "Validé" ? "#28a745" : 
                            o.statut === "En attente" ? "#ffc107" : 
                            o.statut === "Rejeté" ? "#dc3545" : "#6c757d"
                          }`
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow = "0 12px 35px rgba(0,0,0,.15)";
                        }} 
                        onMouseLeave={e => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,.1)";
                        }}>
                    <Card.Body className="p-4">
                      {/* En-tête avec titre et statut */}
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <Card.Title className="h5 fw-bold mb-1" style={{lineHeight:"1.3",color:"#2c3e50"}}>
                            {o.intitule}
                            {o.est_urgent && (
                              <Badge bg="danger" className="ms-2">
                                <i className="fas fa-exclamation-triangle me-1"></i>Urgent
                              </Badge>
                            )}
                          </Card.Title>
                          <div className="d-flex align-items-center flex-wrap gap-1 mt-1">
                            {o.type_contrat && typeBadge(o.type_contrat)}
                            {getUserBadge(o)}
                            {getAnonymeBadge(o)}
                          </div>
                        </div>
                        {statusBadge(o.statut)}
                      </div>

                      {/* Informations détaillées */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-user-tie text-primary me-2"></i>
                          <span className="fw-semibold">Membre: {o.membre || "NC"}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-map-marker-alt text-danger me-2"></i>
                          <span>{o.localisation || "Non spécifié"}</span>
                        </div>
                        <div className="d-flex align-items-center mb-2">
                          <i className="fas fa-money-bill-wave text-success me-2"></i>
                          <span className="fw-semibold">{o.salaire_remuneration || "À négocier"}</span>
                        </div>
                      </div>

                      {/* Description */}
                      <Card.Text className="text-muted mb-4" style={{lineHeight:"1.6",fontSize:"0.95rem"}}>
                        {o.description.length > 120 ? o.description.substring(0, 120) + "..." : o.description}
                      </Card.Text>

                      {/* Fichier */}
                      {o.fichier && <div className="mb-3">{renderFile(o.fichier)}</div>}

                      {/* Date de clôture */}
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <div className="text-end w-100">
                          <div className="fw-semibold" style={{color: urgent(o) ? "#ff6b6b" : "#6c757d"}}>
                            <i className="fas fa-clock me-1"></i>
                            Clôture: {format(o.date_cloture)}
                          </div>
                        </div>
                      </div>

                      {/* Statistiques (uniquement pour les offres validées) */}
                      {o.statut === "Validé" && renderStats(o)}

                      {/* Message pour les offres en attente */}
                      {o.statut === "En attente" && (
                        <Alert variant="warning" className="py-2 mb-3">
                          <i className="fas fa-clock me-2"></i>
                          <small>En attente de validation par l'administrateur</small>
                        </Alert>
                      )}

                      {/* Actions */}
                      <div className="mt-auto pt-3 border-top">
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-1">
                            {userIsAuthor ? (
                              <>
                                {(o.statut === "En attente" || o.statut === "Validé" || o.statut === "Rejeté") && (
                                  <Button 
                                    variant={o.statut === "En attente" ? "outline-warning" : "outline-primary"} 
                                    size="sm" 
                                    onClick={() => handleShowEdit(o)} 
                                    className="d-flex align-items-center" 
                                    style={{borderRadius:"8px"}} 
                                    title="Modifier"
                                  >
                                    <i className="fas fa-edit me-1"></i>
                                    Modifier
                                  </Button>
                                )}
                              </>
                            ) : (
                              <Badge bg="secondary" className="px-3 py-2">
                                <i className="fas fa-eye me-1"></i>Lecture seule
                              </Badge>
                            )}
                          </div>
                          <div className="d-flex gap-1">
                            {userIsAuthor && (
                              <Button 
                                variant="outline-danger" 
                                size="sm" 
                                onClick={() => confirmDelete(o.id)} 
                                className="d-flex align-items-center" 
                                style={{borderRadius:"8px"}} 
                                title="Supprimer"
                              >
                                <i className="fas fa-trash me-1"></i>
                                Supprimer
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}

        {/* Modal d'ajout/modification */}
        <Modal show={showModal} onHide={handleClose} centered size="lg" className="modern-modal">
          <Modal.Header className="border-0" 
                       style={{
                         background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
                         color:"white",
                         borderTopLeftRadius:"20px",
                         borderTopRightRadius:"20px"
                       }}>
            <Modal.Title className="fw-bold">
              <i className="fas fa-briefcase me-2"></i>
              {editMode ? "Modifier" : "Créer"} l'appel d'offre
            </Modal.Title>
            <Button variant="link" onClick={handleClose} className="text-white p-0" style={{fontSize:"1.5rem"}}>
              <i className="fas fa-times"></i>
            </Button>
          </Modal.Header>
          
          <Modal.Body className="p-4">
            {/* Indication du statut pour les nouvelles offres */}
            {!editMode && currentUser?.type !== 'admin' && (
              <Alert variant="info" className="mb-4">
                <i className="fas fa-info-circle me-2"></i>
                Votre offre sera créée avec le statut <strong>"En attente"</strong> et devra être validée par un administrateur avant publication.
              </Alert>
            )}

            <Form onSubmit={handleSave}>
              <Row>
                <Col md={8}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-heading me-2 text-primary"></i>Intitulé *
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="intitule" 
                      value={nouvelleOffre.intitule} 
                      onChange={handleChange} 
                      required 
                      className="border-0 shadow-sm rounded-3 py-3" 
                      placeholder="Ex: Développeur web fullstack..." 
                      style={{background:"#f8f9fa"}}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-tag me-2 text-success"></i>Type de contrat
                    </Form.Label>
                    <Form.Select 
                      name="type" 
                      value={nouvelleOffre.type} 
                      onChange={handleChange} 
                      className="border-0 shadow-sm rounded-3 py-3" 
                      style={{background:"#f8f9fa"}}
                    >
                      {["CDI","CDD","Stage","Freelance","Alternance"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-user-tie me-2 text-info"></i>Membre
                    </Form.Label>
                    <Form.Control type="text" name="membre" value={nouvelleOffre.membre} 
                                  onChange={handleChange} 
                                  className="border-0 shadow-sm rounded-3 py-3" 
                                  placeholder="Ministère..." 
                                  style={{background:"#f8f9fa"}}/>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-map-marker-alt me-2 text-danger"></i>Localisation
                    </Form.Label>
                    <Form.Control type="text" name="localisation" value={nouvelleOffre.localisation} 
                                  onChange={handleChange} 
                                  className="border-0 shadow-sm rounded-3 py-3" 
                                  placeholder="Ville..." 
                                  style={{background:"#f8f9fa"}}/>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-money-bill-wave me-2 text-success"></i>Salaire
                    </Form.Label>
                    <Form.Control type="text" name="salaire" value={nouvelleOffre.salaire} 
                                  onChange={handleChange} 
                                  className="border-0 shadow-sm rounded-3 py-3" 
                                  placeholder="1 500 000 Ar..." 
                                  style={{background:"#f8f9fa"}}/>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-file-upload me-2 text-warning"></i>Fichier
                    </Form.Label>
                    <Form.Control type="file" name="fichier" onChange={handleChange} 
                                  className="border-0 shadow-sm rounded-3 py-3" 
                                  style={{background:"#f8f9fa"}}/>
                    {editMode && currentOffre?.fichier && !nouvelleOffre.fichier && (
                      <Form.Text className="text-muted">
                        Fichier actuel: <a href={getFileUrl(currentOffre.fichier)} target="_blank" rel="noopener noreferrer">Voir</a>
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-calendar-alt me-2 text-info"></i>Date ouverture
                    </Form.Label>
                    <Form.Control type="date" name="date_ouverture" value={nouvelleOffre.date_ouverture} 
                                  onChange={handleChange} 
                                  className="border-0 shadow-sm rounded-3 py-3" 
                                  style={{background:"#f8f9fa"}}/>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">
                      <i className="fas fa-calendar-times me-2 text-danger"></i>Date clôture *
                    </Form.Label>
                    <Form.Control type="date" name="date_cloture" value={nouvelleOffre.date_cloture} 
                                  onChange={handleChange} required 
                                  className="border-0 shadow-sm rounded-3 py-3" 
                                  style={{background:"#f8f9fa"}}/>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">
                  <i className="fas fa-align-left me-2 text-info"></i>Description *
                </Form.Label>
                <Form.Control as="textarea" rows={5} name="description" value={nouvelleOffre.description} 
                              onChange={handleChange} required 
                              className="border-0 shadow-sm rounded-3 py-3" 
                              placeholder="Détails..." 
                              style={{background:"#f8f9fa",resize:"none"}}/>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Check type="checkbox" name="est_urgent" 
                            label="Urgent (UI)" 
                            checked={nouvelleOffre.est_urgent} 
                            onChange={handleChange} 
                            className="fw-semibold"/>
                <Form.Text className="text-muted">Mise en avant</Form.Text>
              </Form.Group>

              <Modal.Footer className="border-0 p-0 pt-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClose} 
                  className="rounded-pill px-4 py-2" 
                  style={{fontWeight:"600"}} 
                  disabled={isSubmitting}
                >
                  <i className="fas fa-times me-2"></i>Annuler
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="rounded-pill px-4 py-2" 
                  style={{
                    background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",
                    border:"none",
                    fontWeight:"600"
                  }} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner-border spinner-border-sm me-2" role="status">
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      Envoi...
                    </>
                  ) : (
                    <>
                      <i className={`fas ${editMode ? 'fa-save' : 'fa-plus'} me-2`}></i>
                      {editMode ? "Modifier" : "Créer l'offre"}
                    </>
                  )}
                </Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal>

        {/* Modal de confirmation de suppression */}
        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger">
              <i className="fas fa-exclamation-triangle me-2"></i>Confirmer
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <p className="mb-0">Supprimer cet appel d'offre ?</p>
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center">
            <Button variant="secondary" onClick={() => setShowConfirm(false)} className="px-4">
              Annuler
            </Button>
            <Button variant="danger" onClick={executeDelete} className="px-4">
              <i className="fas fa-trash me-1"></i>Supprimer
            </Button>
          </Modal.Footer>
        </Modal>

        <style>{`
          .modern-modal .modal-content {
            border-radius: 20px !important;
            border: none !important;
            box-shadow: 0 25px 50px rgba(0,0,0,.2) !important;
          }
          .form-control:focus, .form-select:focus {
            box-shadow: 0 0 0 .2rem rgba(102,126,234,.25) !important;
            border-color: #667eea !important;
            background: #fff !important;
          }
          .card {
            transition: transform .3s ease, box-shadow .3s ease;
          }
          .btn {
            transition: all .3s ease;
          }
          .btn:hover {
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </div>
  );
};

export default AppelOffreMembre;