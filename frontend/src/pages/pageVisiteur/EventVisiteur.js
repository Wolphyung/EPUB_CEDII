import React, { useState, useEffect, useRef } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";

const EvenementVisiteur = () => {
  const [evenements, setEvenements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const scrollContainerRef = useRef(null);

  // Vos couleurs identiques à AppelOffreVisiteur
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

  // Fonction pour sauvegarder les vues localement
  const saveViewedEventsToLocalStorage = (eventIds) => {
    const visitorId = getVisitorId();
    const key = `viewed_events_${visitorId}`;
    const viewedEvents = JSON.parse(localStorage.getItem(key) || '[]');
    
    // Ajouter les nouveaux événements vus
    eventIds.forEach(eventId => {
      if (!viewedEvents.includes(eventId)) {
        viewedEvents.push(eventId);
      }
    });
    
    // Sauvegarder dans localStorage
    localStorage.setItem(key, JSON.stringify(viewedEvents));
    return viewedEvents;
  };

  // Fonction pour récupérer les événements vus
  const getViewedEventsFromLocalStorage = () => {
    const visitorId = getVisitorId();
    const key = `viewed_events_${visitorId}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  };

  // Fonction pour vérifier si un événement a été vu
  const isEventViewed = (eventId) => {
    const viewedEvents = getViewedEventsFromLocalStorage();
    return viewedEvents.includes(eventId);
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const visitorId = getVisitorId();
        const res = await axios.get("http://127.0.0.1:8000/api/evenements-valides", {
          headers: {
            'X-Visitor-ID': visitorId
          }
        });
        
        console.log("Données reçues:", res.data);
        
        let events = [];
        const viewedEvents = getViewedEventsFromLocalStorage();
        
        if (res.data.success && res.data.data) {
          events = res.data.data.map(event => ({
            ...event,
            stats: event.stats || {
              total_reactions: 0,
              total_views: 0,
              reactions_by_type: { love: 0 },
              user_reaction: null,
              has_viewed: false
            },
            category: event.type || "Général",
            fichier_url: event.fichier ? 
              (event.fichier.startsWith('http') ? 
                event.fichier : 
                `http://127.0.0.1:8000/storage/${event.fichier.replace(/^\//, '')}`)
              : null,
            type_fichier: getFileType(event.fichier),
            nom_fichier_original: event.fichier ? event.fichier.split('/').pop() : null,
            total_reactions: event.stats?.reactions_by_type?.love || 0,
            userReacted: event.stats?.user_reaction === 'love',
            vues: event.stats?.total_views || 0,
            // Vérifier d'abord localStorage, puis les données de l'API
            already_viewed: viewedEvents.includes(event.id) || event.stats?.has_viewed || false,
            is_past: isDatePassed(event.date_heure)
          }));
        } else if (Array.isArray(res.data)) {
          events = res.data.map(event => ({
            ...event,
            stats: {
              total_reactions: 0,
              total_views: 0,
              reactions_by_type: { love: 0 },
              user_reaction: null,
              has_viewed: false
            },
            category: event.type || "Général",
            fichier_url: event.fichier ? 
              (event.fichier.startsWith('http') ? event.fichier : `http://127.0.0.1:8000/storage/${event.fichier.replace(/^\//, '')}`)
              : null,
            type_fichier: getFileType(event.fichier),
            nom_fichier_original: event.fichier ? event.fichier.split('/').pop() : null,
            total_reactions: 0,
            userReacted: false,
            vues: 0,
            // Vérifier dans localStorage
            already_viewed: viewedEvents.includes(event.id) || false,
            is_past: isDatePassed(event.date_heure)
          }));
        }
        
        console.log("Événements traités:", events);
        setEvenements(events);
        setLoading(false);
        
        // Charger les stats pour chaque événement
        events.forEach(event => {
          if (event.id) {
            loadEventStats(event.id);
          }
        });
      } catch (error) {
        console.error("Erreur de chargement :", error);
        setLoading(false);
      }
    };

    fetchEvents();
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

  // Charger les statistiques d'un événement
  const loadEventStats = async (eventId) => {
    if (!eventId || eventId === 'undefined') {
      console.error('ID d\'événement invalide:', eventId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      const response = await axios.get(`http://127.0.0.1:8000/api/evenements/${eventId}/stats`, {
        headers: {
          'X-Visitor-ID': visitorId
        }
      });
      
      if (response.data.success) {
        // Vérifier si l'événement a été vu dans localStorage
        const viewedInLocalStorage = isEventViewed(eventId);
        
        setEvenements(prev => prev.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                stats: response.data.stats,
                total_reactions: response.data.stats?.reactions_by_type?.love || 0,
                userReacted: response.data.stats?.user_reaction === 'love',
                vues: response.data.stats?.total_views || 0,
                // Priorité: localStorage > API
                already_viewed: viewedInLocalStorage || response.data.stats?.has_viewed || false
              }
            : event
        ));
      }
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  };

  // Fonction pour gérer les réactions "J'adore"
  const handleReaction = async (eventId) => {
    if (!eventId || eventId === 'undefined') {
      console.error('ID d\'événement invalide pour réaction:', eventId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      console.log("Envoi de réaction avec visitorId:", visitorId);
      
      const response = await axios.post(
        `http://127.0.0.1:8000/api/evenements/${eventId}/react`,
        { 
          type: 'love',
          visitor_id: visitorId
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
        setEvenements(prev => prev.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                stats: data.stats,
                total_reactions: data.stats?.reactions_by_type?.love || 0,
                userReacted: data.stats?.user_reaction === 'love'
              }
            : event
        ));
        
        // Mettre à jour aussi l'événement sélectionné si ouvert
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(prev => ({
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

  // Fonction pour enregistrer une vue
  const handleView = async (eventId) => {
    if (!eventId || eventId === 'undefined') {
      console.error('ID d\'événement invalide pour vue:', eventId);
      return;
    }

    try {
      const visitorId = getVisitorId();
      
      // Sauvegarder localement d'abord
      saveViewedEventsToLocalStorage([eventId]);
      
      // Ensuite, envoyer à l'API
      const response = await axios.post(
        `http://127.0.0.1:8000/api/evenements/${eventId}/view`,
        {
          visitor_id: visitorId
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
        setEvenements(prev => prev.map(event => 
          event.id === eventId 
            ? { 
                ...event, 
                stats: data.stats,
                vues: data.stats?.total_views || 0,
                already_viewed: true // Toujours true car sauvegardé localement
              }
            : event
        ));
        
        // Mettre à jour aussi l'événement sélectionné si ouvert
        if (selectedEvent && selectedEvent.id === eventId) {
          setSelectedEvent(prev => ({
            ...prev,
            stats: data.stats,
            vues: data.stats?.total_views || 0,
            already_viewed: true
          }));
        }
        return true;
      }
    } catch (error) {
      console.error('Erreur vue API:', error);
      // Même en cas d'erreur API, marquer comme vu localement
      setEvenements(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              already_viewed: true
            }
          : event
      ));
      return true;
    }
    return false;
  };

  const handleShowDetails = async (event) => {
    try {
      console.log("Ouverture des détails pour l'événement:", event.id, event.titre);
      
      // Enregistrer la vue (locale + API)
      await handleView(event.id);
      
      // Récupérer les détails complets
      try {
        const visitorId = getVisitorId();
        const res = await axios.get(`http://127.0.0.1:8000/api/evenements/${event.id}`, {
          headers: {
            'X-Visitor-ID': visitorId
          },
          timeout: 5000
        });
        
        console.log("Réponse API détails:", res.data);
        
        if (res.data.success) {
          setSelectedEvent({
            ...res.data.data,
            // Conserver les données de stats et l'état "vu"
            stats: event.stats || res.data.data.stats,
            already_viewed: true, // Forcer à true car on vient de le voir
            userReacted: event.userReacted || false,
            category: event.category || res.data.data.type || "Général",
            fichier_url: event.fichier_url || res.data.data.fichier_url,
            type_fichier: event.type_fichier || getFileType(res.data.data.fichier),
            nom_fichier_original: event.nom_fichier_original || (res.data.data.fichier ? res.data.data.fichier.split('/').pop() : null),
            is_past: isDatePassed(res.data.data.date_heure || event.date_heure)
          });
        } else {
          // Si l'API ne retourne pas success, utiliser les données locales
          setSelectedEvent({
            ...event,
            already_viewed: true, // Forcer à true
            is_past: isDatePassed(event.date_heure)
          });
        }
      } catch (apiError) {
        console.error("Erreur API détails:", apiError);
        // En cas d'erreur API, utiliser les données locales
        setSelectedEvent({
          ...event,
          already_viewed: true, // Forcer à true
          is_past: isDatePassed(event.date_heure)
        });
      }
      
      // Afficher le modal
      setShowModal(true);
      
    } catch (error) {
      console.error("Erreur générale chargement détails:", error);
      // Utiliser les données locales en cas d'erreur
      setSelectedEvent({
        ...event,
        already_viewed: true, // Forcer à true
        is_past: isDatePassed(event.date_heure)
      });
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

  const getTimeFromDate = (dateString) => {
    if (!dateString) return '--:--';
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (statut) => {
    const statusConfig = {
      'Validé': { color: colors.success, text: "Validé", icon: "fa-check-circle" },
      'en attente': { color: "#F59E0B", text: "En attente", icon: "fa-clock" },
      'Rejeté': { color: colors.danger, text: "Rejeté", icon: "fa-times-circle" },
      'Actif': { color: colors.primary, text: "Actif", icon: "fa-play-circle" },
      'Terminé': { color: colors.neutral, text: "Terminé", icon: "fa-flag-checkered" }
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

  // Filtrage combiné recherche + type
  const filteredEvents = evenements.filter(event => 
    event.titre?.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedType === "" || event.category === selectedType)
  );

  // Types uniques pour le filtre
  const types = [...new Set(evenements.map(event => event.category))];

  // Carrousel configuration - 4 éléments par page
  const itemsPerPage = 4;
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / itemsPerPage));
  
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
  }, [searchTerm, selectedType]);

  if (loading) {
    return (
      <div className="min-vh-100" style={{backgroundColor: colors.lightGray}}>
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border" style={{color: colors.primary, width: '3rem', height: '3rem'}}>
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted mt-3">Chargement des événements...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{backgroundColor: colors.lightGray}}>
      <Navbar />
      
      {/* Hero Section identique à AppelOffreVisiteur */}
      <div className="py-5" style={{
        background: `linear-gradient(135deg, ${colors.primaryDarker} 0%, ${colors.primary} 50%, ${colors.secondary} 100%)`,
        color: colors.white
      }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-5 fw-bold mb-3">Événements Validés</h1>
              <p className="lead mb-0 opacity-90">
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
                placeholder="Rechercher un événement par titre, description ou lieu..."
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
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              style={{
                borderColor: `${colors.primary}20`,
                color: colors.primaryDark
              }}
            >
              <option value="">Tous les types</option>
              {types.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Section du carrousel avec 4 éléments par page */}
      <div className="container py-4">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-5">
            <div className="card border-0 shadow-sm max-w-400 mx-auto" style={{
              backgroundColor: colors.white,
              borderRadius: '12px'
            }}>
              <div className="card-body py-5">
                <i className="fas fa-calendar-times display-1 mb-3" style={{color: colors.neutral}}></i>
                <h3 className="h4 mb-2" style={{color: colors.primaryDarker}}>Aucun événement trouvé</h3>
                <p style={{color: colors.neutral}}>
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
            {/* En-tête avec compteur et indicateurs */}
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h4 mb-0" style={{color: colors.primaryDarker}}>
                {filteredEvents.length} Événement{filteredEvents.length > 1 ? 's' : ''}
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

              {/* Zone avec 4 événements - AVEC TRANSITION */}
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
                  {/* Groupes de 4 événements par page */}
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
                      {filteredEvents
                        .slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage)
                        .map((event) => {
                          const isImage = event.type_fichier === "image";
                          const isVideo = event.type_fichier === "video";
                          const isDocument = event.type_fichier === "document";

                          return (
                            <div 
                              key={event.id} 
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
                                {event.fichier_url && (isImage || isVideo) ? (
                                  <div className="card-header p-0 border-0" style={{ height: '180px', overflow: 'hidden', position: 'relative' }}>
                                    {isImage ? (
                                      <img 
                                        src={event.fichier_url} 
                                        alt={event.titre}
                                        className="card-img-top w-100 h-100"
                                        style={{ objectFit: 'cover' }}
                                      />
                                    ) : (
                                      <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{backgroundColor: colors.primaryDarker}}>
                                        <video 
                                          src={event.fichier_url}
                                          controls
                                          className="w-100 h-100"
                                          style={{ objectFit: 'contain' }}
                                        />
                                      </div>
                                    )}
                                    
                                    {/* Badge de date sur l'image */}
                                    <div className="position-absolute top-3 start-3">
                                      <div className="text-center" style={{
                                        backgroundColor: colors.white,
                                        borderRadius: '8px',
                                        padding: '6px',
                                        minWidth: '50px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                      }}>
                                        <div className="fw-bold" style={{color: colors.primaryDark, fontSize: '1.1rem'}}>
                                          {new Date(event.date_heure).getDate()}
                                        </div>
                                        <div className="text-uppercase" style={{
                                          color: colors.neutral,
                                          fontSize: '0.7rem',
                                          fontWeight: '600'
                                        }}>
                                          {new Date(event.date_heure).toLocaleString('fr-FR', { month: 'short' })}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Badges de statut */}
                                    <div className="position-absolute top-3 end-3 d-flex flex-column gap-1">
                                      {getStatusBadge(event.statut)}
                                      {event.is_past && (
                                        <span style={{
                                          backgroundColor: colors.neutral,
                                          color: colors.white,
                                          padding: '4px 8px',
                                          borderRadius: '12px',
                                          fontWeight: '600',
                                          fontSize: '0.7rem',
                                          display: 'flex',
                                          alignItems: 'center',
                                          gap: '4px'
                                        }}>
                                          <i className="fas fa-clock"></i>
                                          Passé
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  // Placeholder sans image
                                  <div className="card-header p-0 border-0" style={{ 
                                    height: '180px', 
                                    overflow: 'hidden', 
                                    position: 'relative',
                                    backgroundColor: colors.primaryDarker
                                  }}>
                                    <div className="w-100 h-100 d-flex align-items-center justify-content-center">
                                      <i className="fas fa-calendar-alt" style={{color: colors.white, fontSize: '3rem', opacity: 0.5}}></i>
                                    </div>
                                    
                                    {/* Badge de date */}
                                    <div className="position-absolute top-3 start-3">
                                      <div className="text-center" style={{
                                        backgroundColor: colors.white,
                                        borderRadius: '8px',
                                        padding: '6px',
                                        minWidth: '50px',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                      }}>
                                        <div className="fw-bold" style={{color: colors.primaryDark, fontSize: '1.1rem'}}>
                                          {new Date(event.date_heure).getDate()}
                                        </div>
                                        <div className="text-uppercase" style={{
                                          color: colors.neutral,
                                          fontSize: '0.7rem',
                                          fontWeight: '600'
                                        }}>
                                          {new Date(event.date_heure).toLocaleString('fr-FR', { month: 'short' })}
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {/* Badge de temps */}
                                    <div className="position-absolute bottom-3 end-3">
                                      <span style={{
                                        backgroundColor: colors.white,
                                        color: colors.primaryDark,
                                        padding: '4px 8px',
                                        borderRadius: '12px',
                                        fontWeight: '600',
                                        fontSize: '0.7rem',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}>
                                        <i className="fas fa-clock"></i>
                                        {getTimeFromDate(event.date_heure)}
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Corps de la carte */}
                                <div className="card-body d-flex flex-column p-3">
                                  {/* Type et lieu */}
                                  <div className="d-flex justify-content-between align-items-start mb-2">
                                    <span className="badge" style={{
                                      backgroundColor: `${colors.primary}15`,
                                      color: colors.primary,
                                      padding: '4px 8px',
                                      borderRadius: '20px',
                                      fontWeight: '500',
                                      fontSize: '0.8rem'
                                    }}>
                                      {event.category}
                                    </span>
                                    <small style={{color: colors.neutral, fontSize: '0.8rem'}}>
                                      <i className="fas fa-map-marker-alt me-1"></i>
                                      {event.lieu?.length > 15 ? event.lieu.substring(0, 15) + '...' : event.lieu}
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
                                    {event.titre}
                                  </h5>
                                  
                                  {/* Contenu */}
                                  <p className="card-text flex-grow-1 mb-3" style={{
                                    color: colors.neutral,
                                    fontSize: '0.85rem',
                                    lineHeight: '1.5',
                                    minHeight: '60px'
                                  }}>
                                    {event.description && event.description.length > 100 ? 
                                      event.description.substring(0, 100) + '...' : 
                                      event.description || "Aucune description disponible"}
                                  </p>

                                  {/* Informations dates */}
                                  <div className="mb-3">
                                    <div className="row g-2 text-muted small">
                                      <div className="col-12">
                                        {event.date_heure && (
                                          <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-calendar text-primary me-2" style={{fontSize: '0.8rem'}}></i>
                                            <span style={{fontSize: '0.8rem'}}>
                                              <strong>Date:</strong> {formatDateShort(event.date_heure)}
                                            </span>
                                          </div>
                                        )}
                                        {event.auteur && (
                                          <div className="d-flex align-items-center mb-2">
                                            <i className="fas fa-user text-secondary me-2" style={{fontSize: '0.8rem'}}></i>
                                            <span style={{fontSize: '0.8rem'}}>
                                              <strong>Organisateur:</strong> {event.auteur.length > 20 ? event.auteur.substring(0, 20) + '...' : event.auteur}
                                            </span>
                                          </div>
                                        )}
                                        {event.date_heure && (
                                          <div className="d-flex align-items-center">
                                            <i className="fas fa-clock text-success me-2" style={{fontSize: '0.8rem'}}></i>
                                            <span style={{fontSize: '0.8rem'}}>
                                              <strong>Heure:</strong> {getTimeFromDate(event.date_heure)}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Fichier document */}
                                  {isDocument && event.fichier_url && (
                                    <div className="mb-3 p-2 border rounded" style={{
                                      backgroundColor: colors.lightGray,
                                      fontSize: '0.8rem'
                                    }}>
                                      <div className="d-flex align-items-center justify-content-between">
                                        <div className="d-flex align-items-center">
                                          <i className={`fas ${getFileIcon(event.nom_fichier_original)} me-2`} style={{color: colors.secondary}}></i>
                                          <span className="text-truncate d-block" style={{
                                            maxWidth: '120px',
                                            color: colors.primaryDark,
                                            fontWeight: '500'
                                          }}>
                                            {event.nom_fichier_original || 'Document'}
                                          </span>
                                        </div>
                                        <button 
                                          className="btn btn-sm"
                                          onClick={() => handleDownload(event.fichier_url, event.nom_fichier_original)}
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
                                        {/* Bouton "J'adore" */}
                                        <button 
                                          className="btn p-1"
                                          onClick={() => handleReaction(event.id)}
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
                                          title={event.userReacted ? "Vous avez déjà aimé cet événement" : "Cliquez pour ajouter aux favoris"}
                                        >
                                          <i 
                                            className={`fas fa-heart fs-6`}
                                            style={{
                                              color: event.userReacted ? colors.darkGray : colors.neutral,
                                              transition: 'all 0.3s ease',
                                              filter: event.userReacted ? 'brightness(0.7)' : 'none'
                                            }}
                                          ></i>
                                          <span 
                                            className="ms-1"
                                            style={{
                                              color: event.userReacted ? colors.darkGray : colors.neutral,
                                              fontSize: '0.85rem',
                                              fontWeight: '500'
                                            }}
                                          >
                                            {event.total_reactions || 0}
                                          </span>
                                        </button>

                                        {/* Vues */}
                                        <div className="d-flex align-items-center ms-2" style={{
                                          padding: '2px 8px',
                                          borderRadius: '6px',
                                          fontSize: '0.85rem',
                                          transition: 'all 0.3s ease'
                                        }}>
                                          <i className={`fas ${event.already_viewed ? 'fa-eye' : 'far fa-eye'} me-1`} 
                                             style={{color: event.already_viewed ? colors.secondary : colors.neutral}}></i>
                                          <span style={{color: event.already_viewed ? colors.secondary : colors.neutral}}>
                                            {event.vues || 0}
                                          </span>
                                        </div>
                                      </div>

                                      {/* Bouton détails - MODIFIÉ POUR RESTER VERT */}
                                      <button 
                                        className="btn btn-sm"
                                        onClick={() => handleShowDetails(event)}
                                        style={{
                                          backgroundColor: event.already_viewed ? colors.success : colors.primary,
                                          color: colors.white,
                                          border: 'none',
                                          padding: '4px 12px',
                                          borderRadius: '6px',
                                          fontSize: '0.8rem',
                                          transition: 'all 0.3s ease'
                                        }}
                                      >
                                        <i className={`fas ${event.already_viewed ? 'fa-check' : 'fa-eye'} me-1`}></i>
                                        {event.already_viewed ? 'Déjà vu' : 'Détails'}
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
          </>
        )}
      </div>

      {/* Modal des détails */}
      {showModal && selectedEvent && (
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
                <h5 className="modal-title fw-bold">{selectedEvent.titre}</h5>
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
                      {selectedEvent.category}
                    </span>
                    {getStatusBadge(selectedEvent.statut)}
                    {selectedEvent.is_past && (
                      <span style={{
                        backgroundColor: colors.neutral,
                        color: colors.white,
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontWeight: '500',
                        marginLeft: '8px'
                      }}>
                        <i className="fas fa-clock me-1"></i>
                        Événement passé
                      </span>
                    )}
                  </div>
                  <div className="d-flex align-items-center" style={{color: colors.neutral}}>
                    <i className="far fa-calendar me-1"></i>
                    {formatDate(selectedEvent.date_heure)}
                  </div>
                  {selectedEvent.auteur && (
                    <div className="d-flex align-items-center" style={{color: colors.neutral}}>
                      <i className="fas fa-user me-1"></i>
                      Organisateur: {selectedEvent.auteur}
                    </div>
                  )}
                </div>

                {/* Fichier média principal */}
                {selectedEvent.fichier_url && selectedEvent.type_fichier === "image" && (
                  <div className="mb-4">
                    <img 
                      src={selectedEvent.fichier_url} 
                      alt={selectedEvent.titre}
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

                {selectedEvent.fichier_url && selectedEvent.type_fichier === "video" && (
                  <div className="mb-4">
                    <video 
                      src={selectedEvent.fichier_url}
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
                        <i className="fas fa-user me-2"></i>Organisateur
                      </h6>
                      <p style={{color: colors.neutral}}>{selectedEvent.auteur}</p>
                    </div>
                    {selectedEvent.lieu && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-map-marker-alt me-2"></i>Lieu
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedEvent.lieu}</p>
                      </div>
                    )}
                    {selectedEvent.type && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-tag me-2"></i>Type d'événement
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedEvent.type}</p>
                      </div>
                    )}
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                        <i className="fas fa-calendar-day me-2"></i>Date et heure
                      </h6>
                      <p style={{color: colors.neutral}}>
                        {formatDate(selectedEvent.date_heure)}
                      </p>
                    </div>
                    {selectedEvent.capacite && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-users me-2"></i>Capacité
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedEvent.capacite} personnes</p>
                      </div>
                    )}
                    {selectedEvent.prix && selectedEvent.prix > 0 && (
                      <div className="mb-3">
                        <h6 style={{color: colors.primaryDark, fontWeight: '600'}}>
                          <i className="fas fa-money-bill-wave me-2"></i>Prix
                        </h6>
                        <p style={{color: colors.neutral}}>{selectedEvent.prix} €</p>
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
                    {selectedEvent.description || "Aucune description disponible"}
                  </div>
                </div>

                {/* Fichier document dans modal */}
                {selectedEvent.fichier_url && selectedEvent.type_fichier === "document" && (
                  <div className="mb-4 p-4 border rounded" style={{backgroundColor: colors.white}}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <i className={`fas ${getFileIcon(selectedEvent.nom_fichier_original)} me-3 fs-2`} style={{color: colors.secondary}}></i>
                        <div>
                          <h6 style={{color: colors.primaryDark, fontWeight: '600', marginBottom: '4px'}}>
                            Document attaché
                          </h6>
                          <p style={{color: colors.neutral, margin: 0}}>
                            {selectedEvent.nom_fichier_original || 'Document'}
                          </p>
                        </div>
                      </div>
                      <button 
                        className="btn"
                        onClick={() => handleDownload(selectedEvent.fichier_url, selectedEvent.nom_fichier_original)}
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
                            border: `2px solid ${selectedEvent.userReacted ? colors.darkGray : colors.neutral}`,
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => handleReaction(selectedEvent.id)}
                          title={selectedEvent.userReacted ? "Vous avez déjà aimé cet événement" : "Cliquez pour ajouter aux favoris"}
                        >
                          <i className={`fas fa-heart fs-5`} style={{
                            color: selectedEvent.userReacted ? colors.darkGray : colors.neutral
                          }}></i>
                        </button>
                        <small style={{color: colors.neutral}}>
                          {selectedEvent.total_reactions || 0} J'adore
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
                            backgroundColor: selectedEvent.already_viewed ? `${colors.secondary}15` : 'transparent',
                            border: `2px solid ${selectedEvent.already_viewed ? colors.secondary : colors.neutral}`
                          }}
                        >
                          <i className={`fas ${selectedEvent.already_viewed ? 'fa-eye' : 'far fa-eye'} fs-5`}></i>
                        </div>
                        <small style={{color: colors.neutral}}>
                          {selectedEvent.vues || 0} vue{selectedEvent.vues !== 1 ? 's' : ''}
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
                          {selectedEvent.statut}
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
                {selectedEvent.fichier_url && (
                  <button 
                    type="button" 
                    className="btn"
                    onClick={() => handleDownload(selectedEvent.fichier_url, selectedEvent.nom_fichier_original)}
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

export default EvenementVisiteur;