import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

const EvenementVisiteur = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
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
    const fetchEvents = async () => {
      try {
        const visitorId = getVisitorId();
        setVisitorId(visitorId);

        const res = await fetch("http://127.0.0.1:8000/api/evenements-valides");
        const data = await res.json();
        
        console.log("Données reçues:", data);
        
        let events = [];
        
        if (data.success && data.data) {
          events = data.data.map(event => ({
            ...event,
            stats: event.stats || {
              total_reactions: 0,
              total_views: 0,
              reactions_by_type: {},
              user_reaction: null,
              has_viewed: false
            },
            fichier_url: event.fichier ? 
              (event.fichier.startsWith('http') ? event.fichier : `http://127.0.0.1:8000/storage/${event.fichier.replace(/^\//, '')}`)
              : null,
            type: event.type || "Général"
          }));
        }
        
        console.log("Événements traités:", events);
        setEvenements(events);
        setLoading(false);
        
        // Charger les stats pour chaque événement
        events.forEach(event => {
          const eventId = event.id || event.id_evenement;
          if (eventId) {
            loadEventStats(eventId);
          }
        });
      } catch (err) {
        console.error("Erreur :", err);
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Charger les statistiques d'un événement
  const loadEventStats = async (eventId) => {
    if (!eventId || eventId === 'undefined') {
      console.error('ID d\'événement invalide:', eventId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await fetch(`http://127.0.0.1:8000/api/evenements/${eventId}/stats?visitor_id=${visitorId}`);
      const data = await response.json();
      
      if (data.success) {
        setEvenements(prev => prev.map(event => 
          (event.id === eventId || event.id_evenement === eventId)
            ? { ...event, stats: data.stats }
            : event
        ));
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Fonction pour gérer les réactions (uniquement "J'adore")
  const handleReaction = async (eventId) => {
    if (!eventId || eventId === 'undefined') {
      console.error('ID d\'événement invalide pour réaction:', eventId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await fetch(`http://127.0.0.1:8000/api/evenements/${eventId}/react`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitor_id: visitorId,
          type: 'love' // Seule réaction disponible
        })
      });

      const data = await response.json();
      
      if (data.success) {
        // Mettre à jour les statistiques localement
        setEvenements(prev => prev.map(event => 
          (event.id === eventId || event.id_evenement === eventId)
            ? { ...event, stats: data.stats }
            : event
        ));
        
        // Mettre à jour aussi l'événement sélectionné si ouvert
        if (selectedEvent && (selectedEvent.id === eventId || selectedEvent.id_evenement === eventId)) {
          setSelectedEvent(prev => ({
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
  const handleView = async (eventId) => {
    if (!eventId || eventId === 'undefined') {
      console.error('ID d\'événement invalide pour vue:', eventId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await fetch(`http://127.0.0.1:8000/api/evenements/${eventId}/view`, {
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
        setEvenements(prev => prev.map(event => 
          (event.id === eventId || event.id_evenement === eventId)
            ? { ...event, stats: data.stats }
            : event
        ));
        
        // Mettre à jour aussi l'événement sélectionné si ouvert
        if (selectedEvent && (selectedEvent.id === eventId || selectedEvent.id_evenement === eventId)) {
          setSelectedEvent(prev => ({
            ...prev,
            stats: data.stats
          }));
        }
      }
    } catch (error) {
      console.error('Erreur vue:', error);
    }
  };

  const handleShowDetails = async (event) => {
    try {
      // Enregistrer la vue si ce n'est pas déjà fait
      const eventId = event.id || event.id_evenement;
      if (!event.stats?.has_viewed) {
        await handleView(eventId);
      }
      
      setSelectedEvent(event);
      setShowModal(true);
    } catch (error) {
      console.error("Erreur chargement détails:", error);
      setSelectedEvent(event);
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
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
    if (!dateString) return 'Date non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateShort = (dateString) => {
    if (!dateString) return 'Date non disponible';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getTimeFromDate = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrage combiné recherche + type
  const filteredEvents = evenements.filter(event => 
    event.titre?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedType === "" || event.type === selectedType)
  );

  // Types uniques pour le filtre
  const types = [...new Set(evenements.map(event => event.type))];

  if (loading) {
    return (
      <div className="bg-light min-vh-100 pt-5">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted">Chargement des événements...</p>
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
              <h1 className="display-5 fw-bold mb-3">Événements Validés</h1>
              <p className="lead mb-0 opacity-75">
                Découvrez tous nos événements validés et rejoignez-nous pour des moments inoubliables
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
                placeholder="Rechercher un événement par titre, description ou lieu..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="col-md-4">
            <select 
              className="form-select form-select-lg"
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
            >
              <option value="">Tous les types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Événements */}
      <div className="container py-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm max-w-400 mx-auto">
              <div className="card-body py-5">
                <i className="fas fa-calendar-times display-1 text-muted mb-3"></i>
                <h3 className="h4 text-dark mb-2">Aucun événement trouvé</h3>
                <p className="text-muted">
                  {searchTerm || selectedType 
                    ? "Aucun événement ne correspond à vos critères." 
                    : "Aucun événement validé pour le moment."
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 text-dark mb-0">
                {filteredEvents.length} Événement{filteredEvents.length > 1 ? 's' : ''}
              </h2>
            </div>

            {/* Grille des événements */}
            <div className="row g-4">
              {filteredEvents.map((event) => {
                const eventId = event.id || event.id_evenement;
                const fileName = event.fichier ? event.fichier.split('/').pop() || 'Fichier joint' : '';
                const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i);
                const isVideo = fileName?.match(/\.(mp4|avi|mov)$/i);
                const isDocument = !isImage && !isVideo && event.fichier;

                return (
                  <div key={eventId} className="col-lg-6 col-xl-4">
                    <div className="card h-100 shadow-sm border-0 hover-shadow">
                      
                      {/* Header avec fichier média ou placeholder */}
                      <div className="card-header p-0 border-0 position-relative" style={{ height: '200px', overflow: 'hidden' }}>
                        {event.fichier_url && (isImage || isVideo) ? (
                          <>
                            {isImage ? (
                              <img 
                                src={event.fichier_url} 
                                alt={event.titre}
                                className="card-img-top w-100 h-100"
                                style={{ objectFit: 'cover' }}
                              />
                            ) : (
                              <div className="bg-dark w-100 h-100 d-flex align-items-center justify-content-center">
                                <video 
                                  src={event.fichier_url}
                                  className="w-100 h-100"
                                  style={{ objectFit: 'cover' }}
                                  muted
                                />
                                <div className="position-absolute top-50 start-50 translate-middle">
                                  <i className="fas fa-play text-white fs-1 opacity-75"></i>
                                </div>
                              </div>
                            )}
                            {/* Badge de date sur l'image */}
                            <div className="position-absolute top-3 start-3">
                              <div className="bg-white text-dark rounded-2 text-center p-2 shadow">
                                <div className="fw-bold fs-6">{new Date(event.date_heure).getDate()}</div>
                                <div className="text-uppercase small fw-semibold">
                                  {new Date(event.date_heure).toLocaleString('fr-FR', { month: 'short' })}
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          // Placeholder avec date
                          <div 
                            className="bg-gradient-primary text-white w-100 h-100 d-flex align-items-center justify-content-center position-relative"
                            style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)' }}
                          >
                            <div className="position-absolute top-3 start-3">
                              <div className="bg-white text-dark rounded-2 text-center p-2 shadow">
                                <div className="fw-bold fs-6">{new Date(event.date_heure).getDate()}</div>
                                <div className="text-uppercase small fw-semibold">
                                  {new Date(event.date_heure).toLocaleString('fr-FR', { month: 'short' })}
                                </div>
                                <div className="small text-muted">{new Date(event.date_heure).getFullYear()}</div>
                              </div>
                            </div>
                            <i className="fas fa-calendar-alt display-4 opacity-50"></i>
                          </div>
                        )}
                        
                        {/* Badge de temps */}
                        <div className="position-absolute bottom-3 end-3">
                          <span className="badge bg-light text-dark">
                            <i className="fas fa-clock me-1"></i>
                            {getTimeFromDate(event.date_heure)}
                          </span>
                        </div>
                      </div>

                      {/* Corps de la carte */}
                      <div className="card-body d-flex flex-column">
                        {/* Type et lieu */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {event.type}
                          </span>
                          <small className="text-muted">
                            <i className="fas fa-map-marker-alt me-1"></i>
                            {event.lieu}
                          </small>
                        </div>
                        
                        {/* Titre */}
                        <h5 className="card-title text-dark mb-3 line-clamp-2">
                          {event.titre || 'Titre non disponible'}
                        </h5>
                        
                        {/* Description */}
                        <p className="card-text text-muted flex-grow-1 line-clamp-3">
                          {event.description || 'Description non disponible'}
                        </p>

                        {/* Fichier document avec option de téléchargement */}
                        {isDocument && event.fichier_url && (
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
                                onClick={() => handleDownload(event.fichier_url, fileName)}
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
                                {/* Bouton "J'adore" seulement */}
                                <div className="d-flex gap-1">
                                  <button 
                                    className={`btn btn-sm ${
                                      event.stats?.user_reaction === 'love' 
                                        ? 'btn-danger' 
                                        : 'btn-outline-danger'
                                    } d-flex align-items-center gap-2`}
                                    onClick={() => handleReaction(eventId)}
                                    title={event.stats?.user_reaction === 'love' ? "Vous aimez déjà cet événement" : "Cliquez pour ajouter aux favoris"}
                                  >
                                    <i className={`fas ${event.stats?.user_reaction === 'love' ? 'fa-heart' : 'far fa-heart'}`}></i>
                                    <span>
                                      {event.stats?.user_reaction === 'love' ? 'J\'adore' : 'J\'adore'}
                                      <span className="ms-1">({event.stats?.reactions_by_type?.love || 0})</span>
                                    </span>
                                  </button>
                                </div>

                                {/* Vues */}
                                <div 
                                  className={`btn btn-sm ${
                                    event.stats?.has_viewed 
                                      ? 'btn-success' 
                                      : 'btn-outline-secondary'
                                  } d-flex align-items-center gap-2`}
                                  title={event.stats?.has_viewed ? "Vous avez déjà vu cet événement" : "Non consulté"}
                                >
                                  <i className={`fas ${event.stats?.has_viewed ? 'fa-eye' : 'far fa-eye'}`}></i>
                                  <span>{event.stats?.total_views || 0}</span>
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
                            className={`btn ${event.stats?.has_viewed ? 'btn-success' : 'btn-outline-primary'}`}
                            onClick={() => handleShowDetails(event)}
                          >
                            <i className={`fas ${event.stats?.has_viewed ? 'fa-check' : 'fa-expand-alt'} me-2`}></i>
                            {event.stats?.has_viewed ? 'Déjà consulté' : 'Voir les détails'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredEvents.length > 6 && (
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
      {showModal && selectedEvent && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{selectedEvent.titre || 'Titre non disponible'}</h5>
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
                    <span className="badge bg-primary me-2">{selectedEvent.type}</span>
                    <span className="badge bg-secondary">{selectedEvent.statut}</span>
                  </div>
                  <div className="d-flex align-items-center text-muted small">
                    <i className="far fa-calendar me-1"></i>
                    {formatDate(selectedEvent.date_heure)}
                  </div>
                  <div className="d-flex align-items-center text-muted small">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    {selectedEvent.lieu || 'Lieu non spécifié'}
                  </div>
                  {selectedEvent.auteur && (
                    <div className="d-flex align-items-center text-muted small">
                      <i className="fas fa-user me-1"></i>
                      Par: {selectedEvent.auteur}
                    </div>
                  )}
                </div>

                {/* Fichier média principal */}
                {selectedEvent.fichier_url && (
                  <div className="mb-4">
                    {selectedEvent.fichier_url.match(/\.(jpg|jpeg|png|gif|bmp)$/i) ? (
                      <img 
                        src={selectedEvent.fichier_url} 
                        alt={selectedEvent.titre}
                        className="img-fluid rounded w-100"
                        style={{maxHeight: '400px', objectFit: 'contain'}}
                      />
                    ) : selectedEvent.fichier_url.match(/\.(mp4|avi|mov)$/i) ? (
                      <div className="ratio ratio-16x9">
                        <video 
                          src={selectedEvent.fichier_url}
                          controls
                          className="w-100"
                        />
                      </div>
                    ) : (
                      <div className="p-4 border rounded bg-light text-center">
                        <i className={`fas ${getFileIcon(selectedEvent.fichier)} display-4 mb-3`}></i>
                        <div>
                          <p className="mb-2 fw-bold">{selectedEvent.fichier?.split('/').pop() || 'Document'}</p>
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleDownload(selectedEvent.fichier_url, selectedEvent.fichier?.split('/').pop())}
                          >
                            <i className="fas fa-download me-2"></i>
                            Télécharger le document
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Description détaillée */}
                <div className="mb-4">
                  <h6 className="text-muted mb-3">Description détaillée</h6>
                  <div 
                    className="event-content"
                    style={{lineHeight: '1.6', whiteSpace: 'pre-wrap'}}
                  >
                    {selectedEvent.description || 'Description non disponible'}
                  </div>
                </div>

                {/* Statistiques d'engagement */}
                <div className="border-top pt-3">
                  <div className="row text-center">
                    <div className="col-6">
                      <div className="d-flex flex-column align-items-center">
                        <button 
                          className={`btn ${
                            selectedEvent.stats?.user_reaction === 'love' 
                              ? 'btn-danger' 
                              : 'btn-outline-danger'
                          } mb-2 d-flex align-items-center justify-content-center`}
                          style={{width: '60px', height: '60px', borderRadius: '50%'}}
                          onClick={() => handleReaction(selectedEvent.id || selectedEvent.id_evenement)}
                          title={selectedEvent.stats?.user_reaction === 'love' ? "Vous aimez cet événement" : "Ajouter aux favoris"}
                        >
                          <i className={`fas ${
                            selectedEvent.stats?.user_reaction === 'love' 
                              ? 'fa-heart' 
                              : 'far fa-heart'
                          } fs-5`}></i>
                        </button>
                        <small className="text-muted">
                          {selectedEvent.stats?.reactions_by_type?.love || 0} favoris
                        </small>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="d-flex flex-column align-items-center">
                        <div className={`btn ${
                          selectedEvent.stats?.has_viewed 
                            ? 'btn-success' 
                            : 'btn-outline-secondary'
                        } mb-2 d-flex align-items-center justify-content-center`}
                          style={{width: '60px', height: '60px', borderRadius: '50%'}}
                        >
                          <i className={`fas ${selectedEvent.stats?.has_viewed ? 'fa-eye' : 'far fa-eye'} fs-5`}></i>
                        </div>
                        <small className="text-muted">
                          {selectedEvent.stats?.total_views || 0} vues
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
                {selectedEvent.fichier_url && selectedEvent.fichier_url.match(/\.(pdf|doc|docx|xls|xlsx)$/i) && (
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    onClick={() => handleDownload(selectedEvent.fichier_url, selectedEvent.fichier?.split('/').pop())}
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
      <style>{`
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
        .event-content {
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

export default EvenementVisiteur;