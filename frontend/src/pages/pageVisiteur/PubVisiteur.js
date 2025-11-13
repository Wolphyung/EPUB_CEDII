import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const PubVisiteur = () => {
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  useEffect(() => {
    const fetchPubs = async () => {
      try {
        const res = await axios.get("http://localhost:8000/api/publications/validees");
        if(res.data.success){
          const pubs = res.data.data.map(pub => ({
            ...pub, 
            userReacted: false,
            category: pub.categorie || "Général",
            // Assurer que les URLs des fichiers sont complètes
            fichier_url: pub.fichier_url?.startsWith('http') 
              ? pub.fichier_url 
              : `http://localhost:8000/storage/${pub.fichier_url}`
          }));
          setPublications(pubs);
        }
      } catch(e){
        console.error(e);
      } finally{
        setLoading(false);
      }
    };
    fetchPubs();
  },[]);

  const handleReact = async (pub) => {
    if(pub.userReacted) return;
    try{
      const token = localStorage.getItem("token");
      const res = await axios.post(`http://localhost:8000/api/publications/${pub.id_publication}/react`,{},{
        headers:{Authorization:`Bearer ${token}`}
      });
      
      setPublications(prev => prev.map(p => 
        p.id_publication === pub.id_publication 
          ? { ...p, total_reactions: res.data.total_reactions, userReacted: true }
          : p
      ));
    }catch(e){
      console.error(e);
    }
  };

  const handleView = async (pub) => {
    try{
      const res = await axios.post(`http://localhost:8000/api/publications/${pub.id_publication}/view`);
      setPublications(prev => prev.map(p => 
        p.id_publication === pub.id_publication 
          ? { ...p, vues: res.data.vues }
          : p
      ));
    }catch(e){
      console.error(e);
    }
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtrage combiné recherche + catégorie
  const filteredPublications = publications.filter(pub => 
    pub.titre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "" || pub.category === selectedCategory)
  );

  // Catégories uniques pour le filtre
  const categories = [...new Set(publications.map(pub => pub.category))];

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
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  if(loading) {
    return (
      <div className="bg-light min-vh-100 pt-5">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted">Chargement des publications...</p>
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
              <h1 className="display-5 fw-bold mb-3">Publications Validées</h1>
              <p className="lead mb-0 opacity-75">
                Découvrez les dernières publications validées par notre communauté
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
                placeholder="Rechercher une publication..."
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

      {/* Publications */}
      <div className="container py-4">
        {filteredPublications.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm max-w-400 mx-auto">
              <div className="card-body py-5">
                <i className="fas fa-newspaper display-1 text-muted mb-3"></i>
                <h3 className="h4 text-dark mb-2">Aucune publication trouvée</h3>
                <p className="text-muted">
                  {searchTerm || selectedCategory 
                    ? "Aucune publication ne correspond à vos critères." 
                    : "Aucune publication validée pour le moment."
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 text-dark mb-0">
                {filteredPublications.length} Publication{filteredPublications.length > 1 ? 's' : ''}
              </h2>
            </div>

            {/* Grille des publications avec design similaire à PubMembre */}
            <div className="row g-4">
              {filteredPublications.map((pub) => {
                const isImage = pub.type_fichier === "image";
                const isVideo = pub.type_fichier === "video";
                const isDocument = pub.type_fichier === "document";

                return (
                  <div key={pub.id_publication} className="col-lg-6 col-xl-4">
                    <div className="card h-100 shadow-sm border-0 hover-shadow">
                      
                      {/* Header avec fichier média */}
                      {pub.fichier_url && (isImage || isVideo) && (
                        <div className="card-header p-0 border-0" style={{ height: '200px', overflow: 'hidden' }}>
                          {isImage ? (
                            <img 
                              src={pub.fichier_url} 
                              alt={pub.titre}
                              className="card-img-top w-100 h-100"
                              style={{ objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="bg-dark w-100 h-100 d-flex align-items-center justify-content-center">
                              <video 
                                src={pub.fichier_url}
                                controls
                                className="w-100 h-100"
                                style={{ objectFit: 'contain' }}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {/* Corps de la carte */}
                      <div className="card-body d-flex flex-column">
                        {/* Catégorie et date */}
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <span className="badge bg-primary bg-opacity-10 text-primary">
                            {pub.category}
                          </span>
                          <small className="text-muted">
                            <i className="far fa-clock me-1"></i>
                            {formatDate(pub.created_at || pub.date_publication)}
                          </small>
                        </div>
                        
                        {/* Titre */}
                        <h5 className="card-title text-dark mb-3 line-clamp-2">
                          {pub.titre}
                        </h5>
                        
                        {/* Contenu */}
                        <p className="card-text text-muted flex-grow-1 line-clamp-3">
                          {pub.contenu}
                        </p>

                        {/* Fichier document avec option de téléchargement */}
                        {isDocument && pub.fichier_url && (
                          <div className="mb-3 p-3 border rounded bg-light">
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center">
                                <i className={`fas ${getFileIcon(pub.nom_fichier_original)} me-3 fs-4`}></i>
                                <div>
                                  <small className="text-muted d-block">Document attaché</small>
                                  <span className="fw-medium small text-truncate d-block" style={{maxWidth: '200px'}}>
                                    {pub.nom_fichier_original || 'Document'}
                                  </span>
                                </div>
                              </div>
                              <button 
                                className="btn btn-outline-primary btn-sm"
                                onClick={() => handleDownload(pub.fichier_url, pub.nom_fichier_original)}
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
                                  {/* Bouton Like */}
                                  <button 
                                    className={`btn btn-sm ${
                                      pub.userReacted 
                                        ? 'btn-danger' 
                                        : 'btn-outline-danger'
                                    } d-flex align-items-center gap-2`}
                                    onClick={() => handleReact(pub)}
                                    disabled={pub.userReacted}
                                  >
                                    <i className={`fas ${
                                      pub.userReacted ? 'fa-heart' : 'fa-heart'
                                    }`}></i>
                                    <span>{pub.total_reactions || 0}</span>
                                  </button>

                                  {/* Bouton Vues */}
                                  <button 
                                    className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2"
                                    onClick={() => handleView(pub)}
                                  >
                                    <i className="far fa-eye"></i>
                                    <span>{pub.vues || 0}</span>
                                  </button>
                                </div>

                                {/* Auteur */}
                                {pub.auteur && (
                                  <small className="text-muted">
                                    <i className="fas fa-user me-1"></i>
                                    {pub.auteur}
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Actions supplémentaires */}
                      <div className="card-footer bg-transparent border-0 pt-0">
                        <div className="d-grid">
                          <button className="btn btn-outline-primary">
                            <i className="fas fa-expand-alt me-2"></i>
                            Voir les détails
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {filteredPublications.length > 6 && (
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
      `}</style>
    </div>
  );
};

export default PubVisiteur;