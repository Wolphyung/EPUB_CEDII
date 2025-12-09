import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";
import { useTranslation } from 'react-i18next'; // Import de useTranslation

const PubVisiteur = () => {
  const { t } = useTranslation(); // Utiliser le hook de traduction
  const [publications, setPublications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedPublication, setSelectedPublication] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef(null);

  // Vos couleurs
  const colors = {
    primary: "#5B11EE",
    primaryDark: "#0405BF",
    primaryDarker: "#02061E",
    secondary: "#0671B6",
    neutral: "#5E5E5E",
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    danger: "#EF4444",
    success: "#10B981"
  };

  const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  };

  useEffect(() => {
    const fetchPubs = async () => {
      try {
        const visitorId = getVisitorId();
        const res = await axios.get("http://localhost:8000/api/publications/validees", {
          headers: {
            'X-Visitor-ID': visitorId
          }
        });
        
        if(res.data.success){
          const pubs = res.data.data.map(pub => ({
            ...pub, 
            userReacted: pub.userReacted || false,
            already_viewed: pub.already_viewed || false,
            category: pub.categorie || t('general'),
            fichier_url: pub.fichier_url?.startsWith('http') 
              ? pub.fichier_url 
              : `http://localhost:8000/storage/${pub.fichier_url}`,
            type_fichier: getFileType(pub.fichier_url),
            nom_fichier_original: pub.fichier_url ? pub.fichier_url.split('/').pop() : null
          }));
          setPublications(pubs);
        }
      } catch(e){
        console.error(t('error_load'), e);
      } finally{
        setLoading(false);
      }
    };
    fetchPubs();
  }, [t]);

  // Déterminer le type de fichier
  const getFileType = (fichierUrl) => {
    if (!fichierUrl) return null;
    const fileName = fichierUrl.split('/').pop().toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) return "image";
    if (fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv|webm)$/)) return "video";
    if (fileName.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/)) return "document";
    return null;
  };

  // Formater la taille du fichier
  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Filtrer les publications
  const filteredPublications = publications.filter(pub => 
    pub.titre.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedCategory === "" || pub.category === selectedCategory)
  );

  // Calculer le nombre de pages pour le carrousel
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredPublications.length / itemsPerPage));
  
  // Obtenir les publications pour la page actuelle
  const currentPublications = filteredPublications.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  // Fonction pour naviguer avec animation
  const navigateWithAnimation = (direction) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    
    if (direction === 'next') {
      if (currentPage < totalPages - 1) {
        setCurrentPage(prev => prev + 1);
      } else {
        setCurrentPage(0);
      }
    } else {
      if (currentPage > 0) {
        setCurrentPage(prev => prev - 1);
      } else {
        setCurrentPage(totalPages - 1);
      }
    }
    
    // Réactiver les boutons après l'animation
    setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
  };

  // Réinitialiser la page quand on filtre
  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, selectedCategory]);

  const handleReact = async (pub) => {
    if(pub.userReacted) return;
    
    try{
      const visitorId = getVisitorId();
      const res = await axios.post(
        `http://localhost:8000/api/publications/${pub.id_publication}/react`, 
        {},
        {
          headers: {
            'X-Visitor-ID': visitorId
          }
        }
      );
      
      if (res.data.success) {
        setPublications(prev => prev.map(p => 
          p.id_publication === pub.id_publication 
            ? { 
                ...p, 
                total_reactions: res.data.total_reactions, 
                userReacted: true 
              }
            : p
        ));
        
        if (selectedPublication && selectedPublication.id_publication === pub.id_publication) {
          setSelectedPublication(prev => ({
            ...prev,
            total_reactions: res.data.total_reactions,
            userReacted: true
          }));
        }
      } else {
        alert(res.data.message);
      }
    } catch(e){
      console.error(t('error_operation'), e);
      if (e.response?.data?.message) {
        alert(e.response.data.message);
      }
    }
  };

  const handleView = async (pub) => {
    try{
      const visitorId = getVisitorId();
      const res = await axios.post(
        `http://localhost:8000/api/publications/${pub.id_publication}/view`,
        {},
        {
          headers: {
            'X-Visitor-ID': visitorId
          }
        }
      );
      
      if (res.data.success) {
        if (!res.data.already_viewed) {
          setPublications(prev => prev.map(p => 
            p.id_publication === pub.id_publication 
              ? { 
                  ...p, 
                  vues: res.data.vues,
                  already_viewed: true 
                }
              : p
          ));
          
          if (selectedPublication && selectedPublication.id_publication === pub.id_publication) {
            setSelectedPublication(prev => ({
              ...prev,
              vues: res.data.vues,
              already_viewed: true
            }));
          }
        }
        return res.data.already_viewed;
      }
    } catch(e){
      console.error(t('error_operation'), e);
    }
    return false;
  };

  const handleShowDetails = async (pub) => {
    try {
      const alreadyViewed = await handleView(pub);
      
      const visitorId = getVisitorId();
      const res = await axios.get(`http://localhost:8000/api/publications/${pub.id_publication}`, {
        headers: {
          'X-Visitor-ID': visitorId
        }
      });
      
      if (res.data.success) {
        setSelectedPublication({
          ...res.data.data,
          already_viewed: alreadyViewed || true,
          userReacted: pub.userReacted || false,
          category: pub.category,
          fichier_url: pub.fichier_url,
          type_fichier: pub.type_fichier,
          nom_fichier_original: pub.nom_fichier_original
        });
        setShowModal(true);
      }
    } catch (e) {
      console.error(t('error_load'), e);
      setSelectedPublication({
        ...pub,
        already_viewed: pub.already_viewed || false
      });
      setShowModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedPublication(null);
  };

  const handleDownload = (fileUrl, fileName) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'document';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = [...new Set(publications.map(pub => pub.category))];

  const getFileIcon = (fileName) => {
    if (!fileName) return "fa-file";
    const ext = fileName.split(".").pop().toLowerCase();
    const map = {
      pdf: "fa-file-pdf",
      doc: "fa-file-word",
      docx: "fa-file-word",
      xls: "fa-file-excel",
      xlsx: "fa-file-excel",
      jpg: "fa-file-image",
      jpeg: "fa-file-image",
      png: "fa-file-image",
      gif: "fa-file-image",
      mp4: "fa-file-video",
      avi: "fa-file-video",
      mov: "fa-file-video",
      zip: "fa-file-archive",
      rar: "fa-file-archive",
    };
    return map[ext] || "fa-file";
  };

  const formatDateShort = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if(loading) {
    return (
      <div className="bg-light min-vh-100 pt-5">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border" style={{color: colors.primary, width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">{t('loading')}...</span>
            </div>
            <p className="text-muted mt-3">{t('loading_publications')}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{backgroundColor: '#F8F9FA'}}>
      <Navbar />
      
      {/* Hero Section */}
      <div className="py-5" style={{
        background: `linear-gradient(135deg, ${colors.primaryDarker} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
        color: colors.white
      }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-3">{t('publications_recent_title')}</h1>
              <p className="lead mb-0 opacity-90">
                {t('publications_recent_title')} {/* Vous pouvez créer une nouvelle clé si nécessaire */}
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
              <span className="input-group-text" style={{
                backgroundColor: colors.white,
                border: `1px solid ${colors.primary}20`,
                borderRight: 'none'
              }}>
                <i className="fas fa-search" style={{color: colors.primary}}></i>
              </span>
              <input
                type="text"
                className="form-control"
                placeholder={t('search_placeholder')}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                style={{
                  border: `1px solid ${colors.primary}20`,
                  borderLeft: 'none'
                }}
              />
            </div>
          </div>

          <div className="col-md-4">
            <select 
              className="form-select form-select-lg"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{
                borderColor: `${colors.primary}20`,
                color: colors.primaryDark
              }}
            >
              <option value="">{t('all_categories')}</option>
              {categories.map(category => (
                <option key={category} value={category}>{t(category) || category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section du carrousel avec 4 publications */}
      <div className="container py-4">
        {filteredPublications.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm max-w-400 mx-auto" style={{
              backgroundColor: colors.white,
              borderRadius: '12px'
            }}>
              <div className="card-body py-5">
                <i className="fas fa-newspaper display-1 mb-3" style={{color: colors.neutral}}></i>
                <h3 className="h4 mb-2" style={{color: colors.primaryDarker}}>{t('no_publications_found')}</h3>
                <p style={{color: colors.neutral}}>
                  {searchTerm || selectedCategory 
                    ? t('no_publications_match') 
                    : t('no_publications_system')
                  }
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* En-tête avec compteur et indicateurs */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-0" style={{color: colors.primaryDarker}}>
                {filteredPublications.length} {t('publications_total')}{filteredPublications.length > 1 ? 's' : ''}
              </h2>
              
              {/* Indicateurs de pagination */}
              {totalPages > 1 && (
                <div className="d-flex align-items-center gap-3">
                  {/* Bouton précédent */}
                  <button 
                    onClick={() => navigateWithAnimation('prev')}
                    disabled={isTransitioning}
                    className="btn"
                    style={{
                      backgroundColor: isTransitioning ? `${colors.primary}70` : colors.primary,
                      color: colors.white,
                      border: 'none',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </button>
                  
                  {/* Points indicateurs */}
                  <div className="d-flex gap-2">
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          if (!isTransitioning && index !== currentPage) {
                            setIsTransitioning(true);
                            setCurrentPage(index);
                            setTimeout(() => setIsTransitioning(false), 500);
                          }
                        }}
                        disabled={isTransitioning}
                        className="btn p-0"
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          backgroundColor: currentPage === index ? colors.primary : `${colors.primary}30`,
                          border: 'none',
                          transition: 'all 0.3s ease',
                          transform: currentPage === index ? 'scale(1.1)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                  
                  {/* Bouton suivant */}
                  <button 
                    onClick={() => navigateWithAnimation('next')}
                    disabled={isTransitioning}
                    className="btn"
                    style={{
                      backgroundColor: isTransitioning ? `${colors.primary}70` : colors.primary,
                      color: colors.white,
                      border: 'none',
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: '-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background-color 0.3s ease'
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </button>
                </div>
              )}
            </div>

            {/* Conteneur du carrousel avec animation */}
            <div className="position-relative">
              {/* Flèche gauche - seulement si plus d'une page */}
              {totalPages > 1 && (
                <button 
                  onClick={() => navigateWithAnimation('prev')}
                  disabled={isTransitioning}
                  className="btn position-absolute start-0 top-50 translate-middle-y z-3 d-none d-md-flex arrow-btn"
                  style={{
                    backgroundColor: colors.white,
                    color: isTransitioning ? `${colors.primary}70` : colors.primary,
                    border: `2px solid ${isTransitioning ? `${colors.primary}70` : colors.primary}`,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    left: '-25px',
                    transition: 'all 0.3s ease',
                    opacity: isTransitioning ? 0.7 : 1
                  }}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
              )}

              {/* Zone avec 4 publications - AVEC TRANSITION */}
              <div 
                ref={scrollContainerRef}
                className="overflow-hidden"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  position: 'relative'
                }}
              >
                <div 
                  className="d-flex gap-4 pb-4"
                  style={{
                    transition: isTransitioning ? 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
                    transform: `translateX(-${currentPage * (100 / totalPages)}%)`,
                    width: `${totalPages * 100}%`,
                    willChange: isTransitioning ? 'transform' : 'auto'
                  }}
                >
                  {/* Groupes de 4 publications par page */}
                  {Array.from({ length: totalPages }).map((_, pageIndex) => (
                    <div 
                      key={pageIndex}
                      className="d-flex gap-4"
                      style={{
                        width: `${100 / totalPages}%`,
                        flexShrink: 0,
                        padding: '0 15px'
                      }}
                    >
                      {filteredPublications
                        .slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage)
                        .map((pub) => {
                          const isImage = pub.type_fichier === "image";
                          const isVideo = pub.type_fichier === "video";
                          const isDocument = pub.type_fichier === "document";

                          return (
                            <div 
                              key={pub.id_publication} 
                              className="flex-grow-1"
                              style={{flex: '1 0 25%', maxWidth: '25%'}}
                            >
                              <div className="card h-100 border-0" style={{
                                backgroundColor: colors.white,
                                borderRadius: '12px',
                                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                overflow: 'hidden'
                              }}>
                                
                                {/* Header avec fichier média */}
                                {pub.fichier_url && (isImage || isVideo) && (
                                  <div className="card-header p-0 border-0" style={{ height: '180px', overflow: 'hidden' }}>
                                    {isImage ? (
                                      <img 
                                        src={pub.fichier_url} 
                                        alt={pub.titre}
                                        className="card-img-top w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: colors.primaryDarker}}>
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
                                <div className="card-body d-flex flex-column p-3">
                                  {/* Catégorie et date */}
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="badge" style={{
                                      backgroundColor: `${colors.primary}15`,
                                      color: colors.primary,
                                      padding: '4px 8px',
                                      borderRadius: '20px',
                                      fontWeight: '500',
                                      fontSize: '0.8rem'
                                    }}>
                                      {t(pub.category) || pub.category}
                                    </span>
                                    <small style={{color: colors.neutral, fontSize: '0.8rem'}}>
                                      <i className="far fa-clock me-1"></i>
                                      {formatDateShort(pub.created_at || pub.date_publication)}
                                    </small>
                                  </div>
                                  
                                  {/* Titre */}
                                  <h5 className="card-title mb-2" style={{
                                    color: colors.primaryDarker,
                                    fontSize: '1rem',
                                    fontWeight: '600',
                                    minHeight: '48px',
                                    lineHeight: '1.4'
                                  }}>
                                    {pub.titre}
                                  </h5>
                                  
                                  {/* Contenu */}
                                  <p className="card-text flex-grow-1 mb-3" style={{
                                    color: colors.neutral,
                                    fontSize: '0.85rem',
                                    lineHeight: '1.5',
                                    minHeight: '60px'
                                  }}>
                                    {pub.contenu.length > 100 ? pub.contenu.substring(0, 100) + '...' : pub.contenu}
                                  </p>

                                  {/* Fichier document */}
                                  {isDocument && pub.fichier_url && (
                                    <div className="mb-3 p-2 border rounded" style={{
                                      backgroundColor: colors.lightGray,
                                      fontSize: '0.8rem'
                                    }}>
                                      <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                          <i className={`fas ${getFileIcon(pub.nom_fichier_original)} me-2`} style={{color: colors.secondary}}></i>
                                          <span className="text-truncate d-block" style={{
                                            maxWidth: '120px',
                                            color: colors.primaryDark,
                                            fontWeight: '500'
                                          }}>
                                            {pub.nom_fichier_original || t('document')}
                                          </span>
                                        </div>
                                        <button 
                                          className="btn btn-sm"
                                          onClick={() => handleDownload(pub.fichier_url, pub.nom_fichier_original)}
                                          style={{
                                            backgroundColor: colors.primary,
                                            color: colors.white,
                                            border: 'none',
                                            padding: '3px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.75rem'
                                          }}
                                        >
                                          <i className="fas fa-download"></i>
                                        </button>
                                      </div>
                                    </div>
                                  )}

                                  {/* Métriques d'engagement */}
                                  <div className="mt-auto pt-2 border-top">
                                    <div className="d-flex justify-content-between align-items-center">
                                      <div className="d-flex align-items-center gap-2">
                                        {/* Bouton Like */}
                                        <button 
                                          className="btn"
                                          onClick={() => handleReact(pub)}
                                          disabled={pub.userReacted}
                                          style={{
                                            backgroundColor: pub.userReacted ? colors.danger : 'transparent',
                                            color: pub.userReacted ? colors.white : colors.danger,
                                            border: `1px solid ${colors.danger}`,
                                            padding: '4px 8px',
                                            borderRadius: '6px',
                                            fontSize: '0.8rem',
                                            transition: 'all 0.3s ease'
                                          }}
                                        >
                                          <i className={`fas ${pub.userReacted ? 'fa-heart' : 'fa-heart'} me-1`}></i>
                                          {pub.total_reactions || 0}
                                        </button>

                                        {/* Vues */}
                                        <div className="d-flex align-items-center" style={{
                                          backgroundColor: pub.already_viewed ? `${colors.secondary}15` : 'transparent',
                                          color: pub.already_viewed ? colors.secondary : colors.neutral,
                                          border: `1px solid ${pub.already_viewed ? colors.secondary : '#e0e0e0'}`,
                                          padding: '4px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.8rem',
                                          transition: 'all 0.3s ease'
                                        }}>
                                          <i className={`fas ${pub.already_viewed ? 'fa-eye' : 'far fa-eye'} me-1`}></i>
                                          {pub.vues || 0}
                                        </div>
                                      </div>

                                      {/* Bouton détails */}
                                      <button 
                                        className="btn btn-sm"
                                        onClick={() => handleShowDetails(pub)}
                                        style={{
                                          backgroundColor: pub.already_viewed ? colors.success : colors.primary,
                                          color: colors.white,
                                          border: 'none',
                                          padding: '4px 12px',
                                          borderRadius: '6px',
                                          fontSize: '0.8rem',
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        <i className={`fas ${pub.already_viewed ? 'fa-check' : 'fa-eye'} me-1`}></i>
                                        {t('details') || 'Détails'}
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Flèche droite - seulement si plus d'une page */}
              {totalPages > 1 && (
                <button 
                  onClick={() => navigateWithAnimation('next')}
                  disabled={isTransitioning}
                  className="btn position-absolute end-0 top-50 translate-middle-y z-3 d-none d-md-flex arrow-btn"
                  style={{
                    backgroundColor: colors.white,
                    color: isTransitioning ? `${colors.primary}70` : colors.primary,
                    border: `2px solid ${isTransitioning ? `${colors.primary}70` : colors.primary}`,
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    right: '-25px',
                    transition: 'all 0.3s ease',
                    opacity: isTransitioning ? 0.7 : 1
                  }}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              )}
            </div>

            {/* Légende et infos */}
            <div className="row mt-4">
              <div className="col-12">
                <div className="d-flex justify-content-center gap-4 flex-wrap">
                  {/* Vous pouvez ajouter une légende ici */}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal des détails COMPLET */}
      {showModal && selectedPublication && (
        <div className="modal fade show d-block" style={{backgroundColor: 'rgba(2,6,30,0.8)'}} tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content" style={{
              border: 'none',
              borderRadius: '16px',
              overflow: 'hidden',
              animation: 'modalFadeIn 0.3s ease-out'
            }}>
              <div className="modal-header" style={{
                backgroundColor: colors.primaryDarker,
                color: colors.white,
                borderBottom: `1px solid ${colors.primary}`
              }}>
                <h5 className="modal-title fw-bold">{selectedPublication.titre}</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={handleCloseModal}
                ></button>
              </div>
              <div className="modal-body p-4">
                
                {/* En-tête avec métadonnées */}
                <div className="d-flex flex-wrap gap-3 mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center">
                    <span className="badge" style={{
                      backgroundColor: `${colors.primary}15`,
                      color: colors.primary,
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontWeight: '500'
                    }}>
                      {t(selectedPublication.category) || selectedPublication.category}
                    </span>
                  </div>
                  <div className="d-flex align-items-center" style={{color: colors.neutral}}>
                    <i className="far fa-calendar me-1"></i>
                    {formatDate(selectedPublication.created_at || selectedPublication.date_publication)}
                  </div>
                  {selectedPublication.auteur && (
                    <div className="d-flex align-items-center" style={{color: colors.neutral}}>
                      <i className="fas fa-user me-1"></i>
                      {t('author')}: {selectedPublication.auteur}
                    </div>
                  )}
                </div>

                {/* Fichier média principal */}
                {selectedPublication.fichier_url && selectedPublication.type_fichier === "image" && (
                  <div className="mb-4">
                    <img 
                      src={selectedPublication.fichier_url} 
                      alt={selectedPublication.titre}
                      className="img-fluid rounded"
                      style={{
                        maxHeight: '400px',
                        objectFit: 'contain',
                        width: '100%',
                        backgroundColor: colors.lightGray
                      }}
                    />
                  </div>
                )}

                {selectedPublication.fichier_url && selectedPublication.type_fichier === "video" && (
                  <div className="mb-4">
                    <video 
                      src={selectedPublication.fichier_url}
                      controls
                      className="w-100 rounded"
                      style={{maxHeight: '400px', backgroundColor: colors.primaryDarker}}
                    />
                  </div>
                )}

                {/* Titre et description */}
                <div className="mb-4">
                  <h3 className="h4 mb-3" style={{color: colors.primaryDarker}}>
                    {selectedPublication.titre}
                  </h3>
                  
                  <div 
                    className="publication-content"
                    style={{
                      lineHeight: '1.6',
                      color: colors.neutral,
                      backgroundColor: colors.lightGray,
                      padding: '20px',
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap',
                      fontSize: '1.05rem'
                    }}
                  >
                    {selectedPublication.contenu}
                  </div>
                </div>

                {/* Fichier document */}
                {selectedPublication.fichier_url && selectedPublication.type_fichier === "document" && (
                  <div className="mb-4 p-4 border rounded" style={{backgroundColor: colors.white}}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className={`fas ${getFileIcon(selectedPublication.nom_fichier_original)} me-3 fs-2`} style={{color: colors.secondary}}></i>
                        <div>
                          <h6 style={{color: colors.primaryDark, fontWeight: '600', marginBottom: '4px'}}>
                            {t('attached_file')}
                          </h6>
                          <p style={{color: colors.neutral, margin: 0}}>
                            {selectedPublication.nom_fichier_original || t('document')}
                          </p>
                          <small style={{color: colors.neutral, fontSize: '0.85rem'}}>
                            {selectedPublication.taille_fichier && `${t('file_size')}: ${formatFileSize(selectedPublication.taille_fichier)}`}
                          </small>
                        </div>
                      </div>
                      <button 
                        className="btn"
                        onClick={() => handleDownload(selectedPublication.fichier_url, selectedPublication.nom_fichier_original)}
                        style={{
                          backgroundColor: colors.primary,
                          color: colors.white,
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: '500'
                        }}
                      >
                        <i className="fas fa-download me-2"></i>
                        {t('download')}
                      </button>
                    </div>
                  </div>
                )}

                {/* Informations complémentaires */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                        <i className="fas fa-tag me-2"></i>{t('category')}
                      </h6>
                      <p style={{color: colors.neutral}}>{t(selectedPublication.category) || selectedPublication.category}</p>
                    </div>
                    {selectedPublication.auteur && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-user me-2"></i>{t('author')}
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedPublication.auteur}</p>
                      </div>
                    )}
                    {selectedPublication.source && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-link me-2"></i>{t('source')}
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedPublication.source}</p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                        <i className="far fa-calendar me-2"></i>{t('publication_date')}
                      </h6>
                      <p style={{color: colors.neutral}}>
                        {formatDate(selectedPublication.created_at || selectedPublication.date_publication)}
                      </p>
                    </div>
                    {selectedPublication.date_modification && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-edit me-2"></i>{t('last_modification')}
                        </h6>
                        <p style={{color: colors.neutral}}>
                          {formatDate(selectedPublication.date_modification)}
                        </p>
                      </div>
                    )}
                    {selectedPublication.mots_cles && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-hashtag me-2"></i>{t('keywords')}
                        </h6>
                        <div className="d-flex flex-wrap gap-2">
                          {selectedPublication.mots_cles.split(',').map((mot, index) => (
                            <span 
                              key={index}
                              style={{
                                backgroundColor: `${colors.primary}15`,
                                color: colors.primary,
                                padding: '4px 8px',
                                borderRadius: '4px',
                                fontSize: '0.85rem'
                              }}
                            >
                              {mot.trim()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistiques d'engagement */}
                <div className="border-top pt-4">
                  <h6 style={{color: colors.primaryDarker, fontWeight: '600', marginBottom: '16px'}}>
                    {t('statistics_title')}
                  </h6>
                  
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="d-flex flex-column align-items-center">
                        <button 
                          className={`btn mb-2 d-flex align-items-center justify-content-center`}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: selectedPublication.userReacted ? colors.danger : 'transparent',
                            color: selectedPublication.userReacted ? colors.white : colors.danger,
                            border: `2px solid ${colors.danger}`,
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => handleReact(selectedPublication)}
                          title={selectedPublication.userReacted ? t('already_reacted') : t('click_to_react')}
                        >
                          <i className={`fas fa-heart fs-5`}></i>
                        </button>
                        <small style={{color: colors.neutral}}>
                          {selectedPublication.total_reactions || 0} {t('reaction')}{selectedPublication.total_reactions !== 1 ? 's' : ''}
                        </small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex flex-column align-items-center">
                        <div className={`btn mb-2 d-flex align-items-center justify-content-center`}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: selectedPublication.already_viewed ? `${colors.secondary}15` : 'transparent',
                            border: `2px solid ${selectedPublication.already_viewed ? colors.secondary : colors.neutral}`
                          }}
                        >
                          <i className={`fas ${selectedPublication.already_viewed ? 'fa-eye' : 'far fa-eye'} fs-5`}></i>
                        </div>
                        <small style={{color: colors.neutral}}>
                          {selectedPublication.vues || 0} {t('views')}{selectedPublication.vues !== 1 ? 's' : ''}
                        </small>
                      </div>
                    </div>
                   
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{borderTop: `1px solid ${colors.lightGray}`}}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={handleCloseModal}
                  style={{
                    backgroundColor: colors.neutral,
                    color: colors.white,
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                >
                  {t('close')}
                </button>
                
                {selectedPublication.fichier_url && (
                  <button 
                    type="button" 
                    className="btn"
                    onClick={() => handleDownload(selectedPublication.fichier_url, selectedPublication.nom_fichier_original)}
                    style={{
                      backgroundColor: colors.primary,
                      color: colors.white,
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: '6px',
                      fontWeight: '500'
                    }}
                  >
                    <i className="fas fa-download me-2"></i>
                    {t('download_document')}
                  </button>
                )}
                
                <button 
                  type="button" 
                  className="btn"
                  onClick={() => {
                    const shareUrl = window.location.href;
                    const shareText = `${t('share_text')}: ${selectedPublication.titre}`;
                    
                    if (navigator.share) {
                      navigator.share({
                        title: selectedPublication.titre,
                        text: shareText,
                        url: shareUrl,
                      });
                    } else {
                      navigator.clipboard.writeText(shareUrl);
                      alert(t('link_copied'));
                    }
                  }}
                  style={{
                    backgroundColor: colors.success,
                    color: colors.white,
                    border: 'none',
                    padding: '8px 20px',
                    borderRadius: '6px',
                    fontWeight: '500'
                  }}
                >
                  <i className="fas fa-share-alt me-2"></i>
                  {t('share')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS avec animations */}
      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        /* Animation pour les flèches au hover */
        .arrow-btn:hover:not(:disabled) {
          transform: translateY(-50%) scale(1.1);
          box-shadow: 0 6px 20px rgba(91, 17, 238, 0.3) !important;
        }
        
        /* Animation pour les cartes au hover */
        .card {
          transition: all 0.3s ease;
        }
        
        .card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 28px rgba(91, 17, 238, 0.15) !important;
        }
        
        /* Animation pour les boutons like */
        .btn[disabled] {
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        /* Style pour le bouton en cours de transition */
        .btn:disabled {
          background-color: ${colors.neutral}30 !important;
          border-color: ${colors.neutral}30 !important;
          color: ${colors.neutral}70 !important;
          cursor: not-allowed;
        }
        
        /* Animation pour le changement de page */
        .carousel-transition {
          transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Scrollbar personnalisée */
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${colors.primary};
          border-radius: 4px;
          transition: background 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${colors.primaryDark};
        }
      `}</style>
    </div>
  );
};

export default PubVisiteur;