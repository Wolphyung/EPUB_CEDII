import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";

const AppelOffreVisiteur = () => {
  const [appelsOffre, setAppelsOffre] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedOffre, setSelectedOffre] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef(null);

  // Vos couleurs identiques à PubVisiteur
  const colors = {
    primary: "#5B11EE",
    primaryDark: "#0405BF",
    primaryDarker: "#02061E",
    secondary: "#0671B6",
    neutral: "#5E5E5E",
    white: "#FFFFFF",
    lightGray: "#F8F9FA",
    danger: "#EF4444",
    success: "#10B981",
    darkGray: "#374151"
  };

  // Générer un ID unique pour le visiteur
  const getVisitorId = () => {
    let visitorId = localStorage.getItem('visitorId');
    if (!visitorId) {
      visitorId = 'vis_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('visitorId', visitorId);
    }
    return visitorId;
  };

  useEffect(() => {
    const fetchAppelsOffre = async () => {
      try {
        const visitorId = getVisitorId();
        const res = await axios.get("http://127.0.0.1:8000/api/appels-offre-valides", {
          headers: {
            'X-Visitor-ID': visitorId
          }
        });
        
        console.log("Données reçues:", res.data);
        
        let offres = [];
        
        if (res.data.success && res.data.data) {
          offres = res.data.data.map(item => ({
            ...item.appel_offre,
            stats: item.stats || {
              total_reactions: 0,
              total_views: 0,
              reactions_by_type: { love: 0 },
              user_reaction: null,
              has_viewed: false
            },
            category: item.appel_offre.type || "Général",
            fichier_url: item.appel_offre.fichier ? 
              (item.appel_offre.fichier.startsWith('http') ? 
                item.appel_offre.fichier : 
                `http://127.0.0.1:8000/storage/${item.appel_offre.fichier.replace(/^\//, '')}`)
              : null,
            type_fichier: getFileType(item.appel_offre.fichier),
            nom_fichier_original: item.appel_offre.fichier ? item.appel_offre.fichier.split('/').pop() : null,
            total_reactions: item.stats?.reactions_by_type?.love || 0,
            userReacted: item.stats?.user_reaction === 'love',
            vues: item.stats?.total_views || 0,
            already_viewed: item.stats?.has_viewed || false
          }));
        } else if (Array.isArray(res.data)) {
          offres = res.data.map(offre => ({
            ...offre,
            stats: {
              total_reactions: 0,
              total_views: 0,
              reactions_by_type: { love: 0 },
              user_reaction: null,
              has_viewed: false
            },
            category: offre.type || "Général",
            fichier_url: offre.fichier ? 
              (offre.fichier.startsWith('http') ? offre.fichier : `http://127.0.0.1:8000/storage/${offre.fichier.replace(/^\//, '')}`)
              : null,
            type_fichier: getFileType(offre.fichier),
            nom_fichier_original: offre.fichier ? offre.fichier.split('/').pop() : null,
            total_reactions: 0,
            userReacted: false,
            vues: 0,
            already_viewed: false
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

  // Déterminer le type de fichier
  const getFileType = (fichier) => {
    if (!fichier) return null;
    const fileName = fichier.split('/').pop().toLowerCase();
    if (fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) return "image";
    if (fileName.match(/\.(mp4|avi|mov|wmv|flv|mkv|webm)$/)) return "video";
    if (fileName.match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/)) return "document";
    return "document";
  };

  // Charger les statistiques d'un appel d'offre
  const loadOffreStats = async (offreId) => {
    if (!offreId || offreId === 'undefined') {
      console.error('ID d\'appel d\'offre invalide:', offreId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await axios.get(`http://127.0.0.1:8000/api/appeloffres/${offreId}/stats`, {
        headers: {
          'X-Visitor-ID': visitorId
        }
      });
      
      if (response.data.success) {
        setAppelsOffre(prev => prev.map(offre => 
          offre.id === offreId 
            ? { 
                ...offre, 
                stats: response.data.stats,
                total_reactions: response.data.stats?.reactions_by_type?.love || 0,
                userReacted: response.data.stats?.user_reaction === 'love',
                vues: response.data.stats?.total_views || 0,
                already_viewed: response.data.stats?.has_viewed || false
              }
            : offre
        ));
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Fonction pour gérer les réactions "J'adore" - CORRIGÉE
  const handleReaction = async (offreId) => {
    if (!offreId || offreId === 'undefined') {
      console.error('ID d\'appel d\'offre invalide pour réaction:', offreId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      console.log("Envoi de réaction avec visitorId:", visitorId);
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/appeloffres/${offreId}/react`,
        { 
          type: 'love',
          visitor_id: visitorId  // Ajouté dans le corps de la requête
        },
        {
          headers: {
            'X-Visitor-ID': visitorId,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      console.log("Réponse de l'API:", data);
      
      if (data.success) {
        // Mettre à jour les statistiques localement
        setAppelsOffre(prev => prev.map(offre => 
          offre.id === offreId 
            ? { 
                ...offre, 
                stats: data.stats,
                total_reactions: data.stats?.reactions_by_type?.love || 0,
                userReacted: data.stats?.user_reaction === 'love'
              }
            : offre
        ));
        
        // Mettre à jour aussi l'appel d'offre sélectionné si ouvert
        if (selectedOffre && selectedOffre.id === offreId) {
          setSelectedOffre(prev => ({
            ...prev,
            stats: data.stats,
            total_reactions: data.stats?.reactions_by_type?.love || 0,
            userReacted: data.stats?.user_reaction === 'love'
          }));
        }
        
       
      } else {
        console.error("Réponse API non réussie:", data);
        alert(data.message || "Erreur lors de l'ajout de la réaction");
      }
    } catch (error) {
      console.error('Erreur réaction:', error.response?.data || error);
      const errorMessage = error.response?.data?.message || "Erreur lors de l'ajout de la réaction";
      alert(errorMessage);
    }
  };

  // Fonction pour enregistrer une vue - CORRIGÉE AUSSI
  const handleView = async (offreId) => {
    if (!offreId || offreId === 'undefined') {
      console.error('ID d\'appel d\'offre invalide pour vue:', offreId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await axios.post(
        `http://127.0.0.1:8000/api/appeloffres/${offreId}/view`,
        {
          visitor_id: visitorId  // Ajouté dans le corps
        },
        {
          headers: {
            'X-Visitor-ID': visitorId,
            'Content-Type': 'application/json'
          }
        }
      );

      const data = response.data;
      
      if (data.success) {
        // Mettre à jour les statistiques localement
        setAppelsOffre(prev => prev.map(offre => 
          offre.id === offreId 
            ? { 
                ...offre, 
                stats: data.stats,
                vues: data.stats?.total_views || 0,
                already_viewed: data.stats?.has_viewed || false
              }
            : offre
        ));
        
        // Mettre à jour aussi l'appel d'offre sélectionné si ouvert
        if (selectedOffre && selectedOffre.id === offreId) {
          setSelectedOffre(prev => ({
            ...prev,
            stats: data.stats,
            vues: data.stats?.total_views || 0,
            already_viewed: data.stats?.has_viewed || false
          }));
        }
        return data.stats?.has_viewed || false;
      }
    } catch (error) {
      console.error('Erreur vue:', error);
    }
    return false;
  };

  const handleShowDetails = async (offre) => {
    try {
      const alreadyViewed = await handleView(offre.id);
      
      const visitorId = getVisitorId();
      const res = await axios.get(`http://127.0.0.1:8000/api/appeloffres/${offre.id}`, {
        headers: {
          'X-Visitor-ID': visitorId
        }
      });
      
      if (res.data.success) {
        setSelectedOffre({
          ...res.data.data,
          already_viewed: alreadyViewed || true,
          userReacted: offre.userReacted || false,
          stats: offre.stats,
          category: offre.category,
          fichier_url: offre.fichier_url,
          type_fichier: offre.type_fichier,
          nom_fichier_original: offre.nom_fichier_original
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error("Erreur chargement détails:", error);
      setSelectedOffre({
        ...offre,
        already_viewed: offre.already_viewed || false
      });
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
      'Validé': { color: colors.success, text: "Validé", icon: "fa-check-circle" },
      'en attente': { color: "#F59E0B", text: "En attente", icon: "fa-clock" },
      'Rejeté': { color: colors.danger, text: "Rejeté", icon: "fa-times-circle" },
      'Actif': { color: colors.primary, text: "Actif", icon: "fa-play-circle" },
      'Clôturé': { color: colors.neutral, text: "Clôturé", icon: "fa-flag-checkered" }
    };
    const config = statusConfig[statut] || statusConfig['en attente'];
    return (
      <span style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
        padding: '4px 8px',
        borderRadius: '20px',
        fontWeight: '500',
        fontSize: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '4px'
      }}>
        <i className={`fas ${config.icon}`}></i>
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

  // Carrousel configuration - 4 éléments par page
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredAppels.length / itemsPerPage));
  
  // Obtenir les offres pour la page actuelle
  const currentOffres = filteredAppels.slice(
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

  if (loading) {
    return (
      <div className="min-vh-100" style={{backgroundColor: colors.lightGray}}>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border" style={{color: colors.primary, width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted mt-3">Chargement des appels d'offre...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{backgroundColor: colors.lightGray}}>
      <Navbar />
      
      {/* Hero Section identique à PubVisiteur */}
      <div className="py-5" style={{
        background: `linear-gradient(135deg, ${colors.primaryDarker} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
        color: colors.white
      }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-3">Appels d'Offre Validés</h1>
              <p className="lead mb-0 opacity-90">
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
                placeholder="Rechercher un appel d'offre..."
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
              <option value="">Toutes les catégories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section du carrousel avec 4 éléments par page */}
      <div className="container py-4">
        {filteredAppels.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm max-w-400 mx-auto" style={{
              backgroundColor: colors.white,
              borderRadius: '12px'
            }}>
              <div className="card-body py-5">
                <i className="fas fa-file-contract display-1 mb-3" style={{color: colors.neutral}}></i>
                <h3 className="h4 mb-2" style={{color: colors.primaryDarker}}>Aucun appel d'offre trouvé</h3>
                <p style={{color: colors.neutral}}>
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
            {/* En-tête avec compteur et indicateurs */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-0" style={{color: colors.primaryDarker}}>
                {filteredAppels.length} Appel{filteredAppels.length > 1 ? 's' : ''} d'offre
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
                      display: 'flex',
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

              {/* Zone avec 4 offres - AVEC TRANSITION */}
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
                  {/* Groupes de 4 offres par page */}
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
                      {filteredAppels
                        .slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage)
                        .map((ao) => {
                          const isImage = ao.type_fichier === "image";
                          const isVideo = ao.type_fichier === "video";
                          const isDocument = ao.type_fichier === "document";

                          return (
                            <div 
                              key={ao.id} 
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
                                {ao.fichier_url && (isImage || isVideo) && (
                                  <div className="card-header p-0 border-0" style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                                    {isImage ? (
                                      <img 
                                        src={ao.fichier_url} 
                                        alt={ao.intitule}
                                        className="card-img-top w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: colors.primaryDarker}}>
                                        <video 
                                          src={ao.fichier_url}
                                          controls
                                          className="w-100 h-100"
                                          style={{ objectFit: 'contain' }}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Badges de statut et urgent */}
                                    <div className="position-absolute top-3 end-3 d-flex flex-column gap-1">
                                      {ao.urgent && (
                                        <span style={{
                                          backgroundColor: colors.danger,
                                          color: colors.white,
                                          padding: '4px 8px',
                                          borderRadius: '12px',
                                          fontWeight: '600',
                                          fontSize: '0.7rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}>
                                          <i className="fas fa-exclamation-triangle"></i>
                                          Urgent
                                        </span>
                                      )}
                                      {getStatusBadge(ao.statut)}
                                    </div>
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
                                      {ao.category}
                                    </span>
                                    <small style={{color: colors.neutral, fontSize: '0.8rem'}}>
                                      <i className="far fa-clock me-1"></i>
                                      {formatDateShort(ao.created_at || ao.date_ouverture)}
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
                                    {ao.intitule}
                                  </h5>
                                  
                                  {/* Contenu */}
                                  <p className="card-text flex-grow-1 mb-3" style={{
                                    color: colors.neutral,
                                    fontSize: '0.85rem',
                                    lineHeight: '1.5',
                                    minHeight: '60px'
                                  }}>
                                    {ao.description && ao.description.length > 100 ? 
                                      ao.description.substring(0, 100) + '...' : 
                                      ao.description || "Aucune description disponible"}
                                  </p>

                                  {/* Informations dates */}
                                  <div className="mb-3">
                                    <div className="row g-2 text-muted small">
                                      <div className="col-12">
                                        {ao.date_cloture && (
                                          <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-calendar-check text-danger me-2" style={{fontSize: '0.8rem'}}></i>
                                            <span style={{fontSize: '0.8rem'}}>
                                              <strong>Clôture:</strong> {formatDateShort(ao.date_cloture)}
                                              {isDatePassed(ao.date_cloture) && (
                                                <span style={{
                                                  backgroundColor: colors.danger,
                                                  color: colors.white,
                                                  padding: '2px 6px',
                                                  borderRadius: '4px',
                                                  fontSize: '0.65rem',
                                                  marginLeft: '4px'
                                                }}>Expiré</span>
                                              )}
                                            </span>
                                          </div>
                                        )}
                                        {ao.membre && (
                                          <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-building text-primary me-2" style={{fontSize: '0.8rem'}}></i>
                                            <span style={{fontSize: '0.8rem'}}>
                                              <strong>Membre:</strong> {ao.membre.length > 20 ? ao.membre.substring(0, 20) + '...' : ao.membre}
                                            </span>
                                          </div>
                                        )}
                                        {ao.localisation && (
                                          <div className="d-flex align-items-center">
                                            <i className="fas fa-map-marker-alt text-success me-2" style={{fontSize: '0.8rem'}}></i>
                                            <span style={{fontSize: '0.8rem'}}>
                                              <strong>Lieu:</strong> {ao.localisation.length > 25 ? ao.localisation.substring(0, 25) + '...' : ao.localisation}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Fichier document */}
                                  {isDocument && ao.fichier_url && (
                                    <div className="mb-3 p-2 border rounded" style={{
                                      backgroundColor: colors.lightGray,
                                      fontSize: '0.8rem'
                                    }}>
                                      <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                          <i className={`fas ${getFileIcon(ao.nom_fichier_original)} me-2`} style={{color: colors.secondary}}></i>
                                          <span className="text-truncate d-block" style={{
                                            maxWidth: '120px',
                                            color: colors.primaryDark,
                                            fontWeight: '500'
                                          }}>
                                            {ao.nom_fichier_original || 'Document'}
                                          </span>
                                        </div>
                                        <button 
                                          className="btn btn-sm"
                                          onClick={() => handleDownload(ao.fichier_url, ao.nom_fichier_original)}
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
                                        {/* Bouton "J'adore" - JUSTE UN CŒUR avec compteur */}
                                        <button 
                                          className="btn p-1"
                                          onClick={() => handleReaction(ao.id)}
                                          style={{
                                            backgroundColor: 'transparent',
                                            border: 'none',
                                            padding: '2px',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            transition: 'all 0.3s ease',
                                            minWidth: '32px',
                                            minHeight: '32px'
                                          }}
                                          title={ao.userReacted ? "Vous avez déjà aimé cet appel d'offre" : "Cliquez pour ajouter aux favoris"}
                                        >
                                          <i 
                                            className={`fas fa-heart fs-6`}
                                            style={{
                                              color: ao.userReacted ? colors.darkGray : colors.neutral,
                                              transition: 'all 0.3s ease',
                                              filter: ao.userReacted ? 'brightness(0.7)' : 'none'
                                            }}
                                          ></i>
                                          <span 
                                            className="ms-1"
                                            style={{
                                              color: ao.userReacted ? colors.darkGray : colors.neutral,
                                              fontSize: '0.85rem',
                                              fontWeight: '500'
                                            }}
                                          >
                                            {ao.total_reactions || 0}
                                          </span>
                                        </button>

                                        {/* Vues - Style simplifié */}
                                        <div className="d-flex align-items-center ms-2" style={{
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.85rem',
                                          transition: 'all 0.3s ease'
                                        }}>
                                          <i className={`fas ${ao.already_viewed ? 'fa-eye' : 'far fa-eye'} me-1`} 
                                             style={{color: ao.already_viewed ? colors.secondary : colors.neutral}}></i>
                                          <span style={{color: ao.already_viewed ? colors.secondary : colors.neutral}}>
                                            {ao.vues || 0}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Bouton détails */}
                                      <button 
                                        className="btn btn-sm"
                                        onClick={() => handleShowDetails(ao)}
                                        style={{
                                          backgroundColor: ao.already_viewed ? colors.success : colors.primary,
                                          color: colors.white,
                                          border: 'none',
                                          padding: '4px 12px',
                                          borderRadius: '6px',
                                          fontSize: '0.8rem',
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        <i className={`fas ${ao.already_viewed ? 'fa-check' : 'fa-eye'} me-1`}></i>
                                        Détails
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
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: `${colors.primary}30`,
                      transition: 'all 0.3s ease'
                    }}></div>
                    <small style={{color: colors.neutral}}>Page disponible</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: colors.primary,
                      transition: 'all 0.3s ease',
                      animation: 'pulse 2s infinite'
                    }}></div>
                    <small style={{color: colors.neutral}}>Page active</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center" style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: colors.darkGray,
                      fontSize: '8px',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="fas fa-heart text-white"></i>
                    </div>
                    <small style={{color: colors.neutral}}>J'adore (activé)</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="d-flex align-items-center justify-content-center" style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      border: `1px solid ${colors.secondary}`,
                      color: colors.secondary,
                      fontSize: '8px',
                      transition: 'all 0.3s ease'
                    }}>
                      <i className="fas fa-eye"></i>
                    </div>
                    <small style={{color: colors.neutral}}>Consulté</small>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Modal des détails */}
      {showModal && selectedOffre && (
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
                <h5 className="modal-title fw-bold">{selectedOffre.intitule}</h5>
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
                      {selectedOffre.category}
                    </span>
                    {selectedOffre.urgent && (
                      <span style={{
                        backgroundColor: colors.danger,
                        color: colors.white,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontWeight: '500',
                        marginLeft: '8px'
                      }}>
                        <i className="fas fa-exclamation-triangle me-1"></i>
                        Urgent
                      </span>
                    )}
                    {getStatusBadge(selectedOffre.statut)}
                  </div>
                  <div className="d-flex align-items-center" style={{color: colors.neutral}}>
                    <i className="far fa-calendar me-1"></i>
                    {formatDate(selectedOffre.date_ouverture)}
                  </div>
                  {selectedOffre.membre && (
                    <div className="d-flex align-items-center" style={{color: colors.neutral}}>
                      <i className="fas fa-building me-1"></i>
                      Membre: {selectedOffre.membre}
                    </div>
                  )}
                </div>

                {/* Fichier média principal */}
                {selectedOffre.fichier_url && selectedOffre.type_fichier === "image" && (
                  <div className="mb-4">
                    <img 
                      src={selectedOffre.fichier_url} 
                      alt={selectedOffre.intitule}
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

                {selectedOffre.fichier_url && selectedOffre.type_fichier === "video" && (
                  <div className="mb-4">
                    <video 
                      src={selectedOffre.fichier_url}
                      controls
                      className="w-100 rounded"
                      style={{maxHeight: '400px', backgroundColor: colors.primaryDarker}}
                    />
                  </div>
                )}

                {/* Informations détaillées */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                        <i className="fas fa-building me-2"></i>Membre émetteur
                      </h6>
                      <p style={{color: colors.neutral}}>{selectedOffre.membre}</p>
                    </div>
                    {selectedOffre.localisation && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-map-marker-alt me-2"></i>Localisation
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedOffre.localisation}</p>
                      </div>
                    )}
                    {selectedOffre.type && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-file-contract me-2"></i>Type
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedOffre.type}</p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                        <i className="fas fa-calendar-plus me-2"></i>Date d'ouverture
                      </h6>
                      <p style={{color: colors.neutral}}>{formatDate(selectedOffre.date_ouverture)}</p>
                    </div>
                    <div className="mb-3">
                      <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                        <i className="fas fa-calendar-check me-2"></i>Date de clôture
                      </h6>
                      <p style={{color: colors.neutral}}>
                        {formatDate(selectedOffre.date_cloture)}
                        {isDatePassed(selectedOffre.date_cloture) && (
                          <span style={{
                            backgroundColor: colors.danger,
                            color: colors.white,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            fontSize: '0.75rem',
                            marginLeft: '8px',
                            fontWeight: '500'
                          }}>
                            Expiré
                          </span>
                        )}
                      </p>
                    </div>
                    {selectedOffre.salaire && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-money-bill-wave me-2"></i>Salaire/Rémunération
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedOffre.salaire}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description détaillée */}
                <div className="mb-4">
                  <h6 style={{color: colors.primaryDarker, fontWeight: '600', marginBottom: '16px'}}>Description détaillée</h6>
                  <div 
                    style={{
                      lineHeight: '1.6',
                      color: colors.neutral,
                      backgroundColor: colors.lightGray,
                      padding: '20px',
                      borderRadius: '8px',
                      whiteSpace: 'pre-wrap'
                    }}
                  >
                    {selectedOffre.description || "Aucune description disponible"}
                  </div>
                </div>

                {/* Fichier document dans modal */}
                {selectedOffre.fichier_url && selectedOffre.type_fichier === "document" && (
                  <div className="mb-4 p-4 border rounded" style={{backgroundColor: colors.white}}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className={`fas ${getFileIcon(selectedOffre.nom_fichier_original)} me-3 fs-2`} style={{color: colors.secondary}}></i>
                        <div>
                          <h6 style={{color: colors.primaryDark, fontWeight: '600', marginBottom: '4px'}}>
                            Document attaché
                          </h6>
                          <p style={{color: colors.neutral, margin: 0}}>
                            {selectedOffre.nom_fichier_original || 'Document'}
                          </p>
                        </div>
                      </div>
                      <button 
                        className="btn"
                        onClick={() => handleDownload(selectedOffre.fichier_url, selectedOffre.nom_fichier_original)}
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
                        Télécharger
                      </button>
                    </div>
                  </div>
                )}

                {/* Statistiques d'engagement */}
                <div className="border-top pt-4">
                  <div className="row text-center">
                    <div className="col-4">
                      <div className="d-flex flex-column align-items-center">
                        <button 
                          className={`btn mb-2 d-flex align-items-center justify-content-center`}
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            border: `2px solid ${selectedOffre.userReacted ? colors.darkGray : colors.neutral}`,
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => handleReaction(selectedOffre.id)}
                          title={selectedOffre.userReacted ? "Vous avez déjà aimé cet appel d'offre" : "Cliquez pour ajouter aux favoris"}
                        >
                          <i className={`fas fa-heart fs-5`} style={{
                            color: selectedOffre.userReacted ? colors.darkGray : colors.neutral
                          }}></i>
                        </button>
                        <small style={{color: colors.neutral}}>
                          {selectedOffre.total_reactions || 0} J'adore
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
                            backgroundColor: selectedOffre.already_viewed ? `${colors.secondary}15` : 'transparent',
                            border: `2px solid ${selectedOffre.already_viewed ? colors.secondary : colors.neutral}`
                          }}
                        >
                          <i className={`fas ${selectedOffre.already_viewed ? 'fa-eye' : 'far fa-eye'} fs-5`}></i>
                        </div>
                        <small style={{color: colors.neutral}}>
                          {selectedOffre.vues || 0} vue{selectedOffre.vues !== 1 ? 's' : ''}
                        </small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="d-flex flex-column align-items-center">
                        <div className="btn mb-2 d-flex align-items-center justify-content-center"
                          style={{
                            width: '60px',
                            height: '60px',
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            color: colors.neutral,
                            border: `2px solid ${colors.neutral}`
                          }}
                        >
                          <i className="fas fa-info fs-5"></i>
                        </div>
                        <small style={{color: colors.neutral}}>
                          {selectedOffre.statut}
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
                  Fermer
                </button>
                {selectedOffre.fichier_url && (
                  <button 
                    type="button" 
                    className="btn"
                    onClick={() => handleDownload(selectedOffre.fichier_url, selectedOffre.nom_fichier_original)}
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
                    Télécharger
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Styles CSS */}
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
        
        /* Animation pour le bouton cœur au hover */
        .card .btn:hover:not(:disabled) .fa-heart {
          transform: scale(1.2);
          color: ${colors.danger} !important;
        }
        
        .card .btn:hover:not(:disabled) span {
          color: ${colors.danger} !important;
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
        
        .max-w-400 {
          max-width: 400px;
        }
      `}</style>
    </div>
  );
};

export default AppelOffreVisiteur;