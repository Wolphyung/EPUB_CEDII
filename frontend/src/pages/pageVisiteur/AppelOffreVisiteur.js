import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

const AppelOffreVisiteur = () => {
  const [appelsOffre, setAppelsOffre] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [visitorId, setVisitorId] = useState("");

  // Générer un ID unique pour le visiteur
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  };

  useEffect(() => {
    const fetchAppelsOffre = async () => {
      try {
        const visitorId = getVisitorId();
        setVisitorId(visitorId);

        const res = await fetch("http://127.0.0.1:8000/api/appels-offre-valides");
        const data = await res.json();
        
        console.log("Données reçues:", data);
        
        let offres = [];
        
        if (data.success && data.data) {
          offres = data.data.map(item => ({
            ...item.appel_offre,
            stats: item.stats || {
              total_reactions: 0,
              total_views: 0,
              reactions_by_type: {},
              user_reaction: null,
              has_viewed: false
            },
            category: item.appel_offre.type || "Général",
            fichier_url: item.appel_offre.fichier ? 
              (item.appel_offre.fichier.startsWith('http') ? item.appel_offre.fichier : `http://127.0.0.1:8000/storage/${item.appel_offre.fichier.replace(/^\//, '')}`)
              : null
          }));
        } else if (Array.isArray(data)) {
          offres = data.map(offre => ({
            ...offre,
            stats: {
              total_reactions: 0,
              total_views: 0,
              reactions_by_type: {},
              user_reaction: null,
              has_viewed: false
            },
            category: offre.type || "Général",
            fichier_url: offre.fichier ? 
              (offre.fichier.startsWith('http') ? offre.fichier : `http://127.0.0.1:8000/storage/${offre.fichier.replace(/^\//, '')}`)
              : null
          }));
        }
        
        console.log("Appels d'offre traités:", offres);
        setAppelsOffre(offres);
        setLoading(false);
        
        // Charger les stats pour chaque appel d'offre
        offres.forEach(offre => {
          if (offre.id) {
            loadOffreStats(offre.id);
          }
        });
      } catch (error) {
        console.error("Erreur de chargement :", error);
        setLoading(false);
      }
    };

    fetchAppelsOffre();
  }, []);

  // Charger les statistiques d'un appel d'offre
  const loadOffreStats = async (offreId) => {
    if (!offreId || offreId === 'undefined') {
      console.error('ID d\'appel d\'offre invalide:', offreId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await fetch(`http://127.0.0.1:8000/api/appeloffres/${offreId}/stats?visitor_id=${visitorId}`);
      const data = await response.json();
      
      if (data.success) {
        setAppelsOffre(prev => prev.map(offre => 
          offre.id === offreId 
            ? { ...offre, stats: data.stats }
            : offre
        ));
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Fonction pour gérer les réactions
  const handleReaction = async (offreId, reactionType) => {
    if (!offreId || offreId === 'undefined') {
      console.error('ID d\'appel d\'offre invalide pour réaction:', offreId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await fetch(`http://127.0.0.1:8000/api/appeloffres/${offreId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          type: reactionType
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour les statistiques localement
        setAppelsOffre(prev => prev.map(offre => 
          offre.id === offreId 
            ? { ...offre, stats: data.stats }
            : offre
        ));
        
        // Mettre à jour aussi l'appel d'offre sélectionné si ouvert
        if (selectedOffre && selectedOffre.id === offreId) {
          setSelectedOffre(prev => ({
            ...prev,
            stats: data.stats
          }));
        }
      }
    } catch (error) {
      console.error('Erreur réaction:', error);
      alert("Erreur lors de l'ajout de la réaction");
    }
  };

  // Fonction pour enregistrer une vue
  const handleView = async (offreId) => {
    if (!offreId || offreId === 'undefined') {
      console.error('ID d\'appel d\'offre invalide pour vue:', offreId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await fetch(`http://127.0.0.1:8000/api/appeloffres/${offreId}/view`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: visitorId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour les statistiques localement
        setAppelsOffre(prev => prev.map(offre => 
          offre.id === offreId 
            ? { ...offre, stats: data.stats }
            : offre
        ));
        
        // Mettre à jour aussi l'appel d'offre sélectionné si ouvert
        if (selectedOffre && selectedOffre.id === offreId) {
          setSelectedOffre(prev => ({
            ...prev,
            stats: data.stats
          }));
        }
      }
    } catch (error) {
      console.error('Erreur vue:', error);
    }
  };

  const handleShowDetails = async (offre) => {
    try {
      // Enregistrer la vue si ce n'est pas déjà fait
      if (!offre.stats?.has_viewed) {
        await handleView(offre.id);
      }
      
      setSelectedOffre(offre);
      setShowModal(true);
    } catch (error) {
      console.error("Erreur chargement détails:", error);
      setSelectedOffre(offre);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedOffre(null);
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "fa-file";
    const ext = fileName.split(".").pop().toLowerCase();
    const map = {
      pdf: "fa-file-pdf text-danger",
      doc: "fa-file-word text-primary",
      docx: "fa-file-word text-primary",
      xls: "fa-file-excel text-success",
      xlsx: "fa-file-excel text-success",
      jpg: "fa-file-image text-info",
      jpeg: "fa-file-image text-info",
      png: "fa-file-image text-info",
      gif: "fa-file-image text-info",
      mp4: "fa-file-video text-warning",
      avi: "fa-file-video text-warning",
      mov: "fa-file-video text-warning",
      zip: "fa-file-archive text-secondary",
      rar: "fa-file-archive text-secondary",
    };
    return map[ext] || "fa-file text-secondary";
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      'Validé': { variant: "success", text: "Validé", icon: "fa-check-circle" },
      'en attente': { variant: "warning", text: "En attente", icon: "fa-clock" },
      'Rejeté': { variant: "danger", text: "Rejeté", icon: "fa-times-circle" },
      'Actif': { variant: "primary", text: "Actif", icon: "fa-play-circle" },
      'Clôturé': { variant: "secondary", text: "Clôturé", icon: "fa-flag-checkered" }
    };
    const config = statusConfig[statut] || statusConfig['en attente'];
    return (
      <span className={`badge bg-${config.variant} d-inline-flex align-items-center px-3 py-2`} 
            style={{ borderRadius: "15px", fontSize: "0.8rem" }}>
        <i className={`fas ${config.icon} me-1`}></i>
        {config.text}
      </span>
    );
  };

  const isDatePassed = (dateString) => {
    if (!dateString) return false;
    return new Date(dateString) < new Date();
  };

  // Filtrage combiné recherche + catégorie
  const filteredAppels = appelsOffre.filter(ao => 
    ao.intitule?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "" || ao.category === selectedCategory)
  );

  // Catégories uniques pour le filtre
  const categories = [...new Set(appelsOffre.map(ao => ao.category))];

  if (loading) {
    return (
      <div className="bg-light min-vh-100 pt-5">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted">Chargement des appels d'offre...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-primary text-white py-5">
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-3">Appels d'Offre Validés</h1>
              <p className="lead mb-0 opacity-75">
                Découvrez les opportunités d'affaires et les appels d'offre actuellement disponibles
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtres et Recherche */}
      <div className="container py-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group input-group-lg">
              <span className="input-group-text bg-white border-end-0">
                <i className="fas fa-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Rechercher un appel d'offre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <select 
              className="form-select form-select-lg"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Appels d'offre */}
      <div className="container py-4">
        {filteredAppels.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm max-w-400 mx-auto">
              <div className="card-body py-5">
                <i className="fas fa-file-contract display-1 text-muted mb-3"></i>
                <h3 className="h4 text-dark mb-2">Aucun appel d'offre trouvé</h3>
                <p className="text-muted">
                  {searchTerm || selectedCategory 
                    ? "Aucun appel d'offre ne correspond à vos critères." 
                    : "Aucun appel d'offre validé pour le moment."
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 text-dark mb-0">
                {filteredAppels.length} Appel{filteredAppels.length > 1 ? 's' : ''} d'offre
              </h2>
            </div>

            {/* Grille des appels d'offre */}
            <div className="row g-4">
              {filteredAppels.map((ao) => {
                const fileName = getFileName(ao.fichier);
                const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i);
                const isVideo = fileName?.match(/\.(mp4|avi|mov)$/i);
                const isDocument = !isImage && !isVideo && ao.fichier;

                return (
                  <div key={ao.id} className="col-lg-6 col-xl-4">
                    <div className="card h-100 shadow-sm border-0 hover-shadow">
                      
                      {/* Header avec fichier média ou placeholder */}
                      <div className="card-header p-0 border-0 position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                        {ao.fichier_url && (isImage || isVideo) ? (
                          <>
                            {isImage ? (
                              <img 
                                src={ao.fichier_url} 
                                alt={ao.intitule}
                                className="card-img-top w-100 h-100"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="bg-dark w-100 h-100 d-flex align-items-center justify-content-center">
                                <video 
                                  src={ao.fichier_url}
                                  className="w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                  muted
                                />
                                <div className="position-absolute top-50 start-50 translate-middle">
                                  <i className="fas fa-play text-white fs-1 opacity-75"></i>
                                </div>
                              </div>
                            )}
                          </>
                        ) : (
                          // Placeholder avec icône
                          <div 
                            className="bg-gradient-primary text-white w-100 h-100 d-flex align-items-center justify-content-center position-relative"
                            style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)' }}
                          >
                            <div className="position-absolute top-3 start-3">
                              <div className="bg-white text-dark rounded-2 text-center p-2 shadow">
                                <div className="fw-bold fs-6">AO</div>
                                <div className="text-uppercase small fw-semibold">Offre</div>
                              </div>
                            </div>
                            <i className="fas fa-file-contract display-4 opacity-50"></i>
                          </div>
                        )}
                        
                        {/* Badges de statut et urgent */}
                        <div className="position-absolute top-3 end-3 d-flex flex-column gap-1">
                          {ao.urgent && (
                            <span className="badge bg-danger">
                              <i className="fas fa-exclamation-triangle me-1"></i>
                              Urgent
                            </span>
                          )}
                          {getStatusBadge(ao.statut)}
                        </div>
                      </div>

                      {/* Corps de la carte */}
                      <div className="card-body d-flex flex-column">
                        {/* Catégorie et date */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {ao.category}
                          </span>
                          <small className="text-muted">
                            <i className="far fa-clock me-1"></i>
                            {formatDateShort(ao.created_at || ao.date_ouverture)}
                          </small>
                        </div>
                        
                        {/* Titre */}
                        <h5 className="card-title text-dark mb-3 line-clamp-2">
                          {ao.intitule}
                        </h5>
                        
                        {/* Description */}
                        <p className="card-text text-muted flex-grow-1 line-clamp-3">
                          {ao.description}
                        </p>

                        {/* Informations dates et membre */}
                        <div className="mb-3">
                          <div className="row g-2 text-muted small">
                            <div className="col-12">
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-building text-primary me-2"></i>
                                <span><strong>Membre:</strong> {ao.membre}</span>
                              </div>
                              {ao.localisation && (
                                <div className="d-flex align-items-center mb-2">
                                  <i className="fas fa-map-marker-alt text-success me-2"></i>
                                  <span><strong>Lieu:</strong> {ao.localisation}</span>
                                </div>
                              )}
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-calendar-plus text-warning me-2"></i>
                                <span><strong>Ouverture:</strong> {formatDateShort(ao.date_ouverture)}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <i className="fas fa-calendar-check text-danger me-2"></i>
                                <span>
                                  <strong>Clôture:</strong> {formatDateShort(ao.date_cloture)}
                                  {isDatePassed(ao.date_cloture) && (
                                    <span className="badge bg-danger ms-2" style={{ fontSize: "0.65rem" }}>Expiré</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fichier document avec option de téléchargement */}
                        {isDocument && ao.fichier_url && (
                          <div className="mb-3 p-3 border rounded bg-light">
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <i className={`fas ${getFileIcon(fileName)} me-3 fs-4`}></i>
                                <div>
                                  <small className="text-muted d-block">Document attaché</small>
                                  <span className="fw-medium small text-truncate d-block" style={{maxWidth: '200px'}}>
                                    {fileName}
                                  </span>
                                </div>
                              </div>
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleDownload(ao.fichier_url, fileName)}
                              >
                                <i className="fas fa-download me-1"></i>
                                Télécharger
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Métriques d'engagement */}
                        <div className="mt-auto pt-3 border-top">
                          <div className="row g-2 text-muted small">
                            <div className="col-12">
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-3">
                                  {/* Boutons de réaction */}
                                  <div className="d-flex gap-1">
                                    <button 
                                      className={`btn btn-sm ${
                                        ao.stats?.user_reaction === 'like' 
                                          ? 'btn-primary' 
                                          : 'btn-outline-primary'
                                      } d-flex align-items-center gap-1`}
                                      onClick={() => handleReaction(ao.id, 'like')}
                                      title="Intéressant"
                                    >
                                      <i className="fas fa-thumbs-up"></i>
                                      <span>{ao.stats?.reactions_by_type?.like || 0}</span>
                                    </button>

                                    <button 
                                      className={`btn btn-sm ${
                                        ao.stats?.user_reaction === 'love' 
                                          ? 'btn-danger' 
                                          : 'btn-outline-danger'
                                      } d-flex align-items-center gap-1`}
                                      onClick={() => handleReaction(ao.id, 'love')}
                                      title="J'adore"
                                    >
                                      <i className="fas fa-heart"></i>
                                      <span>{ao.stats?.reactions_by_type?.love || 0}</span>
                                    </button>

                                    <button 
                                      className={`btn btn-sm ${
                                        ao.stats?.user_reaction === 'wow' 
                                          ? 'btn-warning' 
                                          : 'btn-outline-warning'
                                      } d-flex align-items-center gap-1`}
                                      onClick={() => handleReaction(ao.id, 'wow')}
                                      title="Impressionnant"
                                    >
                                      <i className="fas fa-surprise"></i>
                                      <span>{ao.stats?.reactions_by_type?.wow || 0}</span>
                                    </button>
                                  </div>
                                </div>

                                {/* Vues */}
                                <div 
                                  className={`btn btn-sm ${
                                    ao.stats?.has_viewed 
                                      ? 'btn-success' 
                                      : 'btn-outline-secondary'
                                  } d-flex align-items-center gap-2`}
                                  title={ao.stats?.has_viewed ? "Vous avez déjà vu cet appel d'offre" : "Non consulté"}
                                >
                                  <i className={`fas ${ao.stats?.has_viewed ? 'fa-eye' : 'far fa-eye'}`}></i>
                                  <span>{ao.stats?.total_views || 0}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions supplémentaires */}
                      <div className="card-footer bg-transparent border-0 pt-0">
                        <div className="d-grid">
                          <button 
                            className={`btn ${ao.stats?.has_viewed ? 'btn-success' : 'btn-outline-primary'}`}
                            onClick={() => handleShowDetails(ao)}
                          >
                            <i className={`fas ${ao.stats?.has_viewed ? 'fa-check' : 'fa-expand-alt'} me-2`}></i>
                            {ao.stats?.has_viewed ? 'Déjà consulté' : 'Voir les détails'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredAppels.length > 6 && (
              <nav className="d-flex justify-content-center mt-5">
                <ul className="pagination">
                  <li className="page-item disabled">
                    <a className="page-link" href="#">
                      <i className="fas fa-chevron-left"></i>
                    </a>
                  </li>
                  <li className="page-item active"><a className="page-link" href="#">1</a></li>
                  <li className="page-item"><a className="page-link" href="#">2</a></li>
                  <li className="page-item"><a className="page-link" href="#">3</a></li>
                  <li className="page-item">
                    <a className="page-link" href="#">
                      <i className="fas fa-chevron-right"></i>
                    </a>
                  </li>
                </ul>
              </nav>
            )}
          </>
        )}
      </div>

      {/* Modal des détails */}
      {showModal && selectedOffre && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedOffre.intitule}</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body">
                
                {/* En-tête avec métadonnées */}
                <div className="d-flex flex-wrap gap-3 mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-2">{selectedOffre.category}</span>
                    {selectedOffre.urgent && (
                      <span className="badge bg-danger">Urgent</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center text-muted small">
                    <i className="far fa-calendar me-1"></i>
                    {formatDate(selectedOffre.date_ouverture)}
                  </div>
                  {selectedOffre.membre && (
                    <div className="d-flex align-items-center text-muted small">
                      <i className="fas fa-building me-1"></i>
                      Membre: {selectedOffre.membre}
                    </div>
                  )}
                </div>

                {/* Fichier média principal */}
                {selectedOffre.fichier_url && (
                  <div className="mb-4">
                    {selectedOffre.fichier_url.match(/\.(jpg|jpeg|png|gif|bmp)$/i) ? (
                      <img 
                        src={selectedOffre.fichier_url} 
                        alt={selectedOffre.intitule}
                        className="img-fluid rounded w-100"
                        style={{maxHeight: '400px', objectFit: 'contain'}}
                      />
                    ) : selectedOffre.fichier_url.match(/\.(mp4|avi|mov)$/i) ? (
                      <div className="ratio ratio-16x9">
                        <video 
                          src={selectedOffre.fichier_url}
                          controls
                          className="w-100"
                        />
                      </div>
                    ) : (
                      <div className="p-4 border rounded bg-light text-center">
                        <i className={`fas ${getFileIcon(getFileName(selectedOffre.fichier))} display-4 mb-3`}></i>
                        <div>
                          <p className="mb-2 fw-bold">{getFileName(selectedOffre.fichier) || 'Document'}</p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleDownload(selectedOffre.fichier_url, getFileName(selectedOffre.fichier))}
                          >
                            <i className="fas fa-download me-2"></i>
                            Télécharger le document
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Informations détaillées */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong><i className="fas fa-building text-primary me-2"></i>Membre émetteur:</strong>
                      <p className="mb-0">{selectedOffre.membre}</p>
                    </div>
                    {selectedOffre.localisation && (
                      <div className="mb-3">
                        <strong><i className="fas fa-map-marker-alt text-success me-2"></i>Localisation:</strong>
                        <p className="mb-0">{selectedOffre.localisation}</p>
                      </div>
                    )}
                    {selectedOffre.type && (
                      <div className="mb-3">
                        <strong><i className="fas fa-file-contract text-info me-2"></i>Type:</strong>
                        <p className="mb-0">{selectedOffre.type}</p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <strong><i className="fas fa-calendar-plus text-warning me-2"></i>Date d'ouverture:</strong>
                      <p className="mb-0">{formatDate(selectedOffre.date_ouverture)}</p>
                    </div>
                    <div className="mb-3">
                      <strong><i className="fas fa-calendar-check text-danger me-2"></i>Date de clôture:</strong>
                      <p className="mb-0">
                        {formatDate(selectedOffre.date_cloture)}
                        {isDatePassed(selectedOffre.date_cloture) && (
                          <span className="badge bg-danger ms-2">Expiré</span>
                        )}
                      </p>
                    </div>
                    {selectedOffre.salaire && (
                      <div className="mb-3">
                        <strong><i className="fas fa-money-bill-wave text-warning me-2"></i>Salaire/Rémunération:</strong>
                        <p className="mb-0">{selectedOffre.salaire}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description détaillée */}
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Description détaillée</h6>
                  <div 
                    className="offre-content"
                    style={{lineHeight: '1.6', whiteSpace: 'pre-wrap'}}
                  >
                    {selectedOffre.description}
                  </div>
                </div>

                {/* Statistiques d'engagement */}
                <div className="border-top pt-3">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="d-flex flex-column align-items-center">
                        <div className="btn btn-outline-primary mb-2">
                          <i className="fas fa-thumbs-up"></i>
                        </div>
                        <small className="text-muted">
                          {selectedOffre.stats?.reactions_by_type?.like || 0} Intéressant
                        </small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex flex-column align-items-center">
                        <div className={`btn ${
                          selectedOffre.stats?.has_viewed 
                            ? 'btn-success' 
                            : 'btn-outline-secondary'
                        } mb-2`}>
                          <i className={`fas ${selectedOffre.stats?.has_viewed ? 'fa-eye' : 'far fa-eye'}`}></i>
                        </div>
                        <small className="text-muted">
                          {selectedOffre.stats?.total_views || 0} vues
                        </small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex flex-column align-items-center">
                        <div className="btn btn-outline-info mb-2">
                          <i className="fas fa-info"></i>
                        </div>
                        <small className="text-muted">
                          {selectedOffre.stats?.has_viewed ? 'Consulté' : 'Nouveau'}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={handleCloseModal}
                >
                  Fermer
                </button>
                {selectedOffre.fichier_url && selectedOffre.fichier_url.match(/\.(pdf|doc|docx|xls|xlsx)$/i) && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => handleDownload(selectedOffre.fichier_url, getFileName(selectedOffre.fichier))}
                  >
                    <i className="fas fa-download me-2"></i>
                    Télécharger
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS pour les effets */}
      <style jsx>{`
        .hover-shadow {
          transition: all 0.3s ease;
        }
        .hover-shadow:hover {
          transform: translateY(-5px);
          box-shadow: 0 0.5rem 1.5rem rgba(0, 0, 0, 0.15) !important;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .max-w-400 {
          max-width: 400px;
        }
        .offre-content {
          font-size: 1.1rem;
          color: #333;
        }
        .bg-gradient-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%) !important;
        }
      `}</style>
    </div>
  );
};

// Fonction utilitaire pour obtenir le nom du fichier
const getFileName = (fichier) => {
  if (!fichier) return '';
  if (typeof fichier === 'string') return fichier.split('/').pop() || 'Fichier joint';
  return 'Fichier joint';
};

export default AppelOffreVisiteur;