import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";

const AppelOffreVisiteur = () => {
  const [appelsOffre, setAppelsOffre] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOffre, setSelectedOffre] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/api/appels-offre-valides")
      .then((res) => res.json())
      .then((data) => {
        const offres = Array.isArray(data) ? data : data.data ?? [];
        // Ajouter les URLs complètes pour les fichiers
        const offresWithFileUrls = offres.map(offre => ({
          ...offre,
          fichier_url: offre.fichier ? 
            (offre.fichier.startsWith('http') ? offre.fichier : `http://127.0.0.1:8000/storage/${offre.fichier.replace(/^\//, '')}`)
            : null
        }));
        setAppelsOffre(offresWithFileUrls);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur de chargement :", error);
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

  const filteredAppels = appelsOffre.filter(ao =>
    ao.intitule?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ao.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ao.membre?.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="bg-primary text-white py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25"></div>
        <div className="container position-relative">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">Appels d'Offre Valides</h1>
              <p className="lead mb-0 opacity-75">
                Découvrez les opportunités d'affaires et les appels d'offre actuellement disponibles
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
                    placeholder="Rechercher un appel d'offre par intitulé, description ou membre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Appels d'offre Section */}
      <div className="container py-5">
        {filteredAppels.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm max-w-400 mx-auto">
              <div className="card-body py-5">
                <i className="fas fa-file-contract display-1 text-muted mb-3"></i>
                <h3 className="h4 text-dark mb-2">Aucun appel d'offre trouvé</h3>
                <p className="text-muted mb-0">
                  {searchTerm 
                    ? "Aucun appel d'offre ne correspond à votre recherche." 
                    : "Aucun appel d'offre validé pour le moment."
                  }
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
                  {filteredAppels.length} Appel{filteredAppels.length > 1 ? 's' : ''} d'offre
                  {searchTerm && (
                    <span className="text-muted fw-normal"> pour "{searchTerm}"</span>
                  )}
                </h2>
              </div>
            </div>

            {/* Grille des appels d'offre avec fichiers */}
            <div className="row g-4">
              {filteredAppels.map((ao) => {
                const fileName = getFileName(ao.fichier);
                const isImage = fileName?.match(/\.(jpg|jpeg|png|gif|bmp)$/i);
                const isVideo = fileName?.match(/\.(mp4|avi|mov)$/i);

                return (
                  <div key={ao.id} className="col-md-6 col-lg-4">
                    <div className="card h-100 shadow-sm border-0 hover-shadow transition-all">
                      
                      {/* Header avec badge de statut et urgent */}
                      <div className="card-header position-relative border-0 p-0 overflow-hidden">
                        {ao.fichier_url && isImage ? (
                          <img 
                            src={ao.fichier_url} 
                            alt={ao.intitule}
                            className="w-100"
                            style={{ height: '200px', objectFit: 'cover' }}
                          />
                        ) : ao.fichier_url && isVideo ? (
                          <div className="bg-dark" style={{ height: '200px' }}>
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
                        ) : (
                          <div 
                            className="bg-gradient-primary text-white position-relative"
                            style={{ height: '140px', background: 'linear-gradient(135deg, #0d6efd 0%, #6f42c1 100%)' }}
                          >
                            <div className="position-absolute top-3 start-3">
                              <div className="bg-white text-dark rounded-2 text-center p-2 shadow">
                                <div className="fw-bold fs-6">AO</div>
                                <div className="text-uppercase small fw-semibold">Offre</div>
                              </div>
                            </div>
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
                        <h5 className="card-title text-dark mb-3 line-clamp-2">
                          {ao.intitule}
                        </h5>
                        
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
                                <span><strong>Ouverture:</strong> {formatDate(ao.date_ouverture)}</span>
                              </div>
                              <div className="d-flex align-items-center">
                                <i className="fas fa-calendar-check text-danger me-2"></i>
                                <span>
                                  <strong>Clôture:</strong> {formatDate(ao.date_cloture)}
                                  {isDatePassed(ao.date_cloture) && (
                                    <span className="badge bg-danger ms-2" style={{ fontSize: "0.65rem" }}>Expiré</span>
                                  )}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Fichier document avec option de téléchargement */}
                        {ao.fichier_url && !isImage && !isVideo && (
                          <FilePreviewCard 
                            fichier={ao.fichier_url} 
                            fileName={fileName} 
                          />
                        )}
                      </div>

                      {/* Footer avec bouton d'action */}
                      <div className="card-footer border-0 bg-transparent pt-0">
                        <div className="d-grid gap-2">
                          <button 
                            className="btn btn-primary"
                            onClick={() => setSelectedOffre(ao)}
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

            {/* Modal de détails de l'appel d'offre */}
            {selectedOffre && (
              <div className="modal fade show d-block" tabIndex="-1" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
                <div className="modal-dialog modal-lg modal-dialog-centered">
                  <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header bg-primary text-white">
                      <h5 className="modal-title fw-bold">
                        <i className="fas fa-file-contract me-2"></i>
                        {selectedOffre.intitule}
                      </h5>
                      <button 
                        type="button" 
                        className="btn-close btn-close-white"
                        onClick={() => setSelectedOffre(null)}
                      ></button>
                    </div>
                    <div className="modal-body">
                      <div className="row">
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
                          {selectedOffre.salaire && (
                            <div className="mb-3">
                              <strong><i className="fas fa-money-bill-wave text-warning me-2"></i>Salaire/Rémunération:</strong>
                              <p className="mb-0">{selectedOffre.salaire}</p>
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
                          <div className="mb-3">
                            <strong><i className="fas fa-chart-line text-primary me-2"></i>Statut:</strong>
                            <div className="mt-1">{getStatusBadge(selectedOffre.statut)}</div>
                          </div>
                          {selectedOffre.urgent && (
                            <div className="mb-3">
                              <strong><i className="fas fa-exclamation-triangle text-danger me-2"></i>Urgent:</strong>
                              <span className="badge bg-danger ms-2">Oui</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Fichier joint */}
                      {selectedOffre.fichier_url && (
                        <div className="mt-4 pt-3 border-top">
                          <strong><i className="fas fa-paperclip me-2"></i>Fichier joint:</strong>
                          <FilePreviewCard 
                            fichier={selectedOffre.fichier_url} 
                            fileName={getFileName(selectedOffre.fichier)} 
                          />
                        </div>
                      )}

                      {/* Description complète */}
                      <div className="mt-4 pt-3 border-top">
                        <strong><i className="fas fa-align-left text-info me-2"></i>Description:</strong>
                        <p className="mt-2" style={{whiteSpace: 'pre-wrap'}}>{selectedOffre.description}</p>
                      </div>
                    </div>
                    <div className="modal-footer">
                      <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={() => setSelectedOffre(null)}
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
            {filteredAppels.length > 9 && (
              <div className="row mt-5">
                <div className="col">
                  <nav aria-label="Pagination des appels d'offre">
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

export default AppelOffreVisiteur;