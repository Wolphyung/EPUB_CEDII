import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar";

const EvenementVisiteur = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/evenements-valides")
      .then((res) => res.json())
      .then((data) => {
        const events = Array.isArray(data) ? data : data.data ?? [];
        // Ajouter les URLs complètes pour les fichiers
        const eventsWithFileUrls = events.map(event => ({
          ...event,
          fichier_url: event.fichier ? 
            (event.fichier.startsWith('http') ? event.fichier : `http://127.0.0.1:8000/storage/${event.fichier.replace(/^\//, '')}`)
            : null
        }));
        setEvenements(eventsWithFileUrls);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur :", err);
        setLoading(false);
      });
  }, []);

  const handleDownloadFile = async (fichier, fileName) => {
    try {
      if (!fichier) {
        alert("❌ Fichier non disponible");
        return;
      }
      
      const response = await fetch(fichier);
      if (!response.ok) throw new Error('Erreur de téléchargement');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'fichier';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert("❌ Erreur lors du téléchargement");
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'fa-file-pdf text-danger';
      case 'doc':
      case 'docx': return 'fa-file-word text-primary';
      case 'xls':
      case 'xlsx': return 'fa-file-excel text-success';
      case 'ppt':
      case 'pptx': return 'fa-file-powerpoint text-warning';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'bmp': return 'fa-file-image text-info';
      case 'mp4':
      case 'avi':
      case 'mov': return 'fa-file-video text-warning';
      case 'mp3':
      case 'wav': return 'fa-file-audio text-secondary';
      case 'zip':
      case 'rar': return 'fa-file-archive text-secondary';
      default: return 'fa-file text-secondary';
    }
  };

  const getFileBadgeVariant = (fileName) => {
    if (!fileName) return 'secondary';
    const extension = fileName.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf': return 'danger';
      case 'doc':
      case 'docx': return 'primary';
      case 'xls':
      case 'xlsx': return 'success';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif': return 'info';
      default: return 'secondary';
    }
  };

  const getFileName = (fichier) => {
    if (!fichier) return '';
    if (typeof fichier === 'string') return fichier.split('/').pop() || 'Fichier joint';
    return 'Fichier joint';
  };

  const FilePreviewCard = ({ fichier, fileName }) => {
    if (!fichier) return null;
    
    const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i);
    const isVideo = fileName?.match(/\.(mp4|avi|mov)$/i);

    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <div className="d-flex align-items-center">
            <i className={`fas ${getFileIcon(fileName)} me-2`}></i>
            <span className="small fw-semibold">Document joint:</span>
          </div>
          <button
            className="btn btn-outline-primary btn-sm d-flex align-items-center"
            onClick={() => handleDownloadFile(fichier, fileName)}
            style={{ borderRadius: "6px", fontSize: "0.7rem" }}
          >
            <i className="fas fa-download me-1"></i>
            Télécharger
          </button>
        </div>
        <p className="small text-muted mb-2">{fileName}</p>
        {fichier && (
          <div className="text-center">
            {isImage ? (
              <img 
                src={fichier} 
                alt="Aperçu" 
                style={{ 
                  maxWidth: '100%', 
                  maxHeight: '150px', 
                  objectFit: 'contain', 
                  borderRadius: '6px', 
                  border: '1px solid #dee2e6' 
                }} 
              />
            ) : isVideo ? (
              <div className="bg-dark rounded" style={{ padding: '10px' }}>
                <video 
                  src={fichier} 
                  controls 
                  style={{ 
                    maxWidth: '100%', 
                    maxHeight: '150px',
                    borderRadius: '4px'
                  }}
                />
              </div>
            ) : (
              <div className="py-2">
                <i className={`${getFileIcon(fileName)} fa-2x mb-2`}></i>
                <p className="small text-muted mb-0">Cliquez sur "Télécharger" pour voir le document</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleString('fr-FR', { month: 'short' }),
      year: date.getFullYear(),
      time: date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      fullDate: date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  };

  const filteredEvents = evenements.filter(event =>
    event.titre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.lieu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-light min-vh-100 pt-5">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
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
      <div className="bg-primary text-white py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25"></div>
        <div className="container position-relative">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">Événements Validés</h1>
              <p className="lead mb-0 opacity-75">
                Découvrez tous nos événements validés et rejoignez-nous pour des moments inoubliables
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section */}
      <div className="container mt-n4 position-relative z-3">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card shadow-lg border-0 rounded-3">
              <div className="card-body p-4">
                <div className="input-group input-group-lg">
                  <span className="input-group-text bg-transparent border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Rechercher un événement par titre, description ou lieu..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      <div className="container py-5">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm max-w-400 mx-auto">
              <div className="card-body py-5">
                <i className="fas fa-calendar-times display-1 text-muted mb-3"></i>
                <h3 className="h4 text-dark mb-2">Aucun événement trouvé</h3>
                <p className="text-muted mb-0">
                  {searchTerm ? "Aucun événement ne correspond à votre recherche." : "Aucun événement validé pour le moment."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Header avec compteur */}
            <div className="row align-items-center mb-4">
              <div className="col">
                <h2 className="h3 text-dark mb-0">
                  {filteredEvents.length} Événement{filteredEvents.length > 1 ? 's' : ''}
                  {searchTerm && (
                    <span className="text-muted fw-normal"> pour "{searchTerm}"</span>
                  )}
                </h2>
              </div>
            </div>

            {/* Grille des événements avec fichiers */}
            <div className="row g-4">
              {filteredEvents.map((event) => {
                const date = formatDate(event.date_heure);
                const fileName = getFileName(event.fichier);
                const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i);
                const isVideo = fileName?.match(/\.(mp4|avi|mov)$/i);

                return (
                  <div key={event.id_evenement} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
                      
                      {/* Header avec image/video ou placeholder */}
                      <div className="card-header position-relative border-0 p-0 overflow-hidden">
                        {event.fichier_url && isImage ? (
                          <img 
                            src={event.fichier_url} 
                            alt={event.titre}
                            className="w-100"
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        ) : event.fichier_url && isVideo ? (
                          <div className="bg-dark" style={{ height: '200px' }}>
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
                        ) : (
                          <div 
                            className="bg-gradient-primary text-white position-relative"
                            style={{ height: '160px', background: 'linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)' }}
                          >
                            <div className="position-absolute top-3 start-3">
                              <div className="bg-white text-dark rounded-2 text-center p-2 shadow">
                                <div className="fw-bold fs-5">{date.day}</div>
                                <div className="text-uppercase small fw-semibold">{date.month}</div>
                                <div className="small text-muted">{date.year}</div>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        {/* Badge de temps */}
                        <div className="position-absolute bottom-3 end-3">
                          <span className="badge bg-light text-dark">
                            <i className="fas fa-clock me-1"></i>
                            {date.time}
                          </span>
                        </div>
                      </div>

                      {/* Corps de la carte */}
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title text-dark mb-3 line-clamp-2">
                          {event.titre}
                        </h5>
                        
                        <p className="card-text text-muted flex-grow-1 line-clamp-3">
                          {event.description}
                        </p>

                        {/* Fichier document avec option de téléchargement */}
                        {event.fichier_url && !isImage && !isVideo && (
                          <FilePreviewCard 
                            fichier={event.fichier_url} 
                            fileName={fileName} 
                          />
                        )}

                        {/* Métadonnées de l'événement */}
                        <div className="mt-auto pt-3 border-top">
                          <div className="row g-2 text-muted small">
                            <div className="col-12">
                              <div className="d-flex align-items-center mb-2">
                                <i className="fas fa-map-marker-alt text-primary me-2"></i>
                                <span className="fw-medium">{event.lieu}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <i className="fas fa-calendar-alt text-success me-2"></i>
                                <span>{date.fullDate}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Footer avec bouton d'action */}
                      <div className="card-footer border-0 bg-transparent pt-0">
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-primary"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <i className="fas fa-info-circle me-2"></i>
                            Plus de détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal de détails de l'événement */}
            {selectedEvent && (
              <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-primary text-white">
                      <h5 className="modal-title fw-bold">
                        <i className="fas fa-calendar-alt me-2"></i>
                        {selectedEvent.titre}
                      </h5>
                      <button 
                        type="button" 
                        className="btn-close btn-close-white"
                        onClick={() => setSelectedEvent(null)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="row">
                        <div className="col-md-6">
                          <div className="mb-3">
                            <strong><i className="fas fa-map-marker-alt text-primary me-2"></i>Lieu:</strong>
                            <p className="mb-0">{selectedEvent.lieu}</p>
                          </div>
                          <div className="mb-3">
                            <strong><i className="fas fa-calendar text-success me-2"></i>Date:</strong>
                            <p className="mb-0">{formatDate(selectedEvent.date_heure).fullDate}</p>
                          </div>
                          <div className="mb-3">
                            <strong><i className="fas fa-clock text-warning me-2"></i>Heure:</strong>
                            <p className="mb-0">{formatDate(selectedEvent.date_heure).time}</p>
                          </div>
                        </div>
                        <div className="col-md-6">
                          {selectedEvent.fichier_url && (
                            <div className="text-center">
                              <strong><i className="fas fa-paperclip me-2"></i>Fichier joint:</strong>
                              <FilePreviewCard 
                                fichier={selectedEvent.fichier_url} 
                                fileName={getFileName(selectedEvent.fichier)} 
                              />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-3">
                        <strong><i className="fas fa-align-left text-info me-2"></i>Description:</strong>
                        <p className="mt-2" style={{whiteSpace: 'pre-wrap'}}>{selectedEvent.description}</p>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setSelectedEvent(null)}
                      >
                        <i className="fas fa-times me-2"></i>
                        Fermer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Pagination */}
            {filteredEvents.length > 9 && (
              <div className="row mt-5">
                <div className="col">
                  <nav aria-label="Pagination des événements">
                    <ul className="pagination justify-content-center">
                      <li className="page-item disabled">
                        <a className="page-link" href="#" tabIndex="-1" aria-disabled="true">
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
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Styles CSS */}
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
        .bg-gradient-primary {
          background: linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%) !important;
        }
        .max-w-400 {
          max-width: 400px;
        }
      `}</style>
    </div>
  );
};

export default EvenementVisiteur;