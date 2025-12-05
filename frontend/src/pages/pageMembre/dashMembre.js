import React, { useState, useEffect } from "react";
import MembreSidebar from "../../components/MembreSidebar";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  ListGroup, 
  Spinner, 
  Badge,
  Container,
  Alert,
  ProgressBar,
  Modal,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import { 
  FaBullhorn, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaUsers, 
  FaRocket, 
  FaFileAlt,
  FaExclamationCircle,
  FaCheckCircle,
  FaUser,
  FaCreditCard,
  FaClock,
  FaExclamationTriangle,
  FaTimesCircle
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "../../components/LanguageSwitcher";

const C = {
  primary: "#667eea",
  secondary: "#764ba2",
  accent: "#4facfe",
  neon: "#00f2fe",
  gray: "#6c757d",
  white: "#FFFFFF",
  bg: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  cardBg: "#FFFFFF",
};

const DashMembre = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    publications: 0, 
    evenements: 0, 
    messages: 0, 
    notifications: 0 
  });
  const [recentData, setRecentData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // === NOUVEAU ÉTATS POUR LE PROFIL ===
  const [userProfile, setUserProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showProfileAlert, setShowProfileAlert] = useState(false);
  const [incompleteFields, setIncompleteFields] = useState([]);
  
  // === NOUVEAU ÉTATS POUR L'ABONNEMENT ===
  const [abonnementInfo, setAbonnementInfo] = useState(null);
  const [abonnementLoading, setAbonnementLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(false);

  const mockData = {
    publications: [
      { id: 1, titre: "Lancement du projet 2025", created_at: "2025-11-10T10:00:00" },
      { id: 2, titre: "Réunion générale", created_at: "2025-11-08T14:30:00" }
    ],
    evenements: [
      { id: 1, titre: "Assemblée Générale", created_at: "2025-12-01T09:00:00" },
      { id: 2, titre: "Formation sécurité", created_at: "2025-11-20T13:00:00" }
    ],
    messages: [
      { id: 1, sujet: "Bienvenue !", created_at: "2025-11-12T08:15:00" },
      { id: 2, sujet: "Rappel : Réunion demain", created_at: "2025-11-11T16:45:00" }
    ]
  };

  // === FONCTION POUR CALCULER LE POURCENTAGE DE COMPLÉTION ===
  const calculateProfileCompletion = (profile) => {
    if (!profile) return 0;
    
    const requiredFields = [
      'nom',
      'email',
      'telephone',
      'adresse',
      'ville',
      'pays',
      'profession',
      'bio'
    ];
    
    const optionalFields = [
      'date_naissance',
      'site_web',
      'linkedin',
      'twitter',
      'avatar'
    ];
    
    let completedCount = 0;
    let totalFields = requiredFields.length + (optionalFields.length * 0.5);
    
    requiredFields.forEach(field => {
      if (profile[field] && profile[field].toString().trim() !== '') {
        completedCount += 1;
      }
    });
    
    optionalFields.forEach(field => {
      if (profile[field] && profile[field].toString().trim() !== '') {
        completedCount += 0.5;
      }
    });
    
    const percentage = Math.min(Math.round((completedCount / totalFields) * 100), 100);
    
    const missingFields = requiredFields.filter(field => 
      !profile[field] || profile[field].toString().trim() === ''
    );
    
    return { percentage, missingFields };
  };

  // === CHARGER LES DONNÉES DE L'ABONNEMENT ===
  const fetchAbonnementInfo = async () => {
    try {
      setAbonnementLoading(true);
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token || !userData.id) {
        console.warn("Aucun utilisateur connecté trouvé");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // Récupérer les informations d'abonnement
      const abonnementRes = await axios.get(
        `http://127.0.0.1:8000/api/abonnements/check/${userData.id}`,
        { headers }
      ).catch(error => {
        console.error("Erreur lors de la récupération de l'abonnement:", error);
        return { data: { success: false } };
      });
      
      if (abonnementRes.data && abonnementRes.data.success) {
        const data = abonnementRes.data.data;
        
        if (data) {
          // Calculer les jours restants
          const dateFin = new Date(data.date_fin);
          const now = new Date();
          const joursRestants = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));
          const isExpired = dateFin < now || data.statut !== 'actif';
          
          setAbonnementInfo({
            ...data,
            jours_restants: joursRestants,
            is_expired: isExpired,
            expire_bientot: !isExpired && joursRestants <= 7
          });
        } else {
          // Aucun abonnement trouvé
          setAbonnementInfo({
            has_abonnement: false,
            message: "Aucun abonnement actif"
          });
        }
      } else {
        // Données simulées pour le développement
        const mockAbonnement = {
          id: 1,
          type_abonnement: "mensuel",
          date_debut: "2024-01-01",
          date_fin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 jours plus tard
          statut: "actif",
          montant: 9.99,
          methode_paiement: "Carte",
          created_at: "2024-01-01T00:00:00"
        };
        
        const dateFin = new Date(mockAbonnement.date_fin);
        const now = new Date();
        const joursRestants = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));
        
        setAbonnementInfo({
          ...mockAbonnement,
          jours_restants: joursRestants,
          is_expired: false,
          expire_bientot: joursRestants <= 7,
          message: "Données de démonstration"
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'abonnement:", error);
    } finally {
      setAbonnementLoading(false);
    }
  };

  // === CHARGER LES DONNÉES DU PROFIL ===
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token || !userData.id) {
        console.warn("Aucun utilisateur connecté trouvé");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // Récupérer le profil complet
      const profileRes = await axios.get(
        `http://127.0.0.1:8000/api/membres/${userData.id}/profile`,
        { headers }
      ).catch(() => ({ data: { success: false } }));
      
      if (profileRes.data && profileRes.data.success) {
        const profile = profileRes.data.data;
        
        const userWithoutPrenom = { ...profile };
        delete userWithoutPrenom.prenom;
        
        setUserProfile(userWithoutPrenom);
        
        const { percentage, missingFields } = calculateProfileCompletion(profile);
        setProfileCompletion(percentage);
        setIncompleteFields(missingFields);
        
        if (percentage < 80) {
          setShowProfileAlert(true);
          setTimeout(() => {
            setShowProfileAlert(false);
          }, 30000);
        }
        
        // Mettre à jour les statistiques du profil
        const statsRes = await axios.get(
          `http://127.0.0.1:8000/api/membres/${userData.id}/stats`,
          { headers }
        ).catch(() => ({ data: { success: false } }));
        
        if (statsRes.data.success) {
          setStats(prev => ({
            ...prev,
            publications: statsRes.data.data.publications_count || 0,
            evenements: statsRes.data.data.evenements_count || 0,
          }));
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement du profil:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Charger le profil utilisateur et l'abonnement en parallèle
        await Promise.all([
          fetchUserProfile(),
          fetchAbonnementInfo()
        ]);

        const [pubRes, evtRes, msgRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/publications", { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get("http://127.0.0.1:8000/api/evenements", { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get("http://127.0.0.1:8000/api/messages", { headers })
            .catch(() => ({ data: { data: [] } }))
        ]);

        let publications = (pubRes.data.data || pubRes.data || []).map(p => ({ 
          ...p, 
          type: "publication", 
          date: new Date(p.created_at || new Date()), 
          titre: p.titre || t("sans_titre") 
        }));

        let evenements = (evtRes.data.data || evtRes.data || []).map(e => ({ 
          ...e, 
          type: "evenement", 
          date: new Date(e.created_at || new Date()), 
          titre: e.titre || t("sans_titre") 
        }));

        let messages = (msgRes.data.data || msgRes.data || []).map(m => ({ 
          ...m, 
          type: "message", 
          date: new Date(m.created_at || new Date()), 
          sujet: m.sujet || t("no_subject") 
        }));

        if (publications.length === 0 && evenements.length === 0 && messages.length === 0) {
          console.info(t("api_unavailable_message"));
          publications = mockData.publications.map(p => ({ ...p, type: "publication", date: new Date(p.created_at) }));
          evenements = mockData.evenements.map(e => ({ ...e, type: "evenement", date: new Date(e.created_at) }));
          messages = mockData.messages.map(m => ({ ...m, type: "message", date: new Date(m.created_at) }));
        }

        setStats(prev => ({
          ...prev,
          publications: publications.length,
          evenements: evenements.length,
          messages: messages.length,
          notifications: incompleteFields.length > 0 ? incompleteFields.length : 5,
        }));

        const all = [...publications, ...evenements, ...messages]
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);
        setRecentData(all);

        const now = new Date();
        const year = now.getFullYear();
        const monthly = Array(12).fill(0);
        publications.forEach(p => { 
          const d = p.date;
          if (d.getFullYear() === year) monthly[d.getMonth()]++; 
        });
        setMonthlyData(monthly.map((v, i) => ({
          month: t(`months.${i}`),
          value: v
        })));

      } catch (err) {
        console.warn(t("demo_mode_activated"), err);
        const publications = mockData.publications.map(p => ({ ...p, type: "publication", date: new Date(p.created_at) }));
        const evenements = mockData.evenements.map(e => ({ ...e, type: "evenement", date: new Date(e.created_at) }));
        const messages = mockData.messages.map(m => ({ ...m, type: "message", date: new Date(m.created_at) }));

        setStats({
          publications: publications.length,
          evenements: evenements.length,
          messages: messages.length,
          notifications: incompleteFields.length > 0 ? incompleteFields.length : 3,
        });

        setRecentData([
          ...publications,
          ...evenements,
          ...messages
        ].sort((a, b) => b.date - a.date).slice(0, 5));

        setMonthlyData([
          { month: t("months.0"), value: 2 }, { month: t("months.1"), value: 3 }, { month: t("months.2"), value: 1 },
          { month: t("months.3"), value: 4 }, { month: t("months.4"), value: 2 }, { month: t("months.5"), value: 3 },
          { month: t("months.6"), value: 5 }, { month: t("months.7"), value: 2 }, { month: t("months.8"), value: 4 },
          { month: t("months.9"), value: 3 }, { month: t("months.10"), value: 2 }, { month: t("months.11"), value: 1 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Rafraîchir les informations d'abonnement toutes les minutes
    const interval = setInterval(fetchAbonnementInfo, 60000);
    
    return () => clearInterval(interval);
  }, [t]);

  // === COMPOSANT CARTE ABONNEMENT ===
  const AbonnementCard = () => {
    if (abonnementLoading) {
      return (
        <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "18px", background: C.cardBg }}>
          <Card.Body className="p-4">
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Chargement de l'abonnement...</p>
            </div>
          </Card.Body>
        </Card>
      );
    }

    if (!abonnementInfo) {
      return (
        <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "18px", background: C.cardBg }}>
          <Card.Body className="p-4">
            <div className="text-center py-4">
              <FaCreditCard size={40} className="text-muted mb-3" />
              <h5 className="fw-bold">Aucune information d'abonnement</h5>
              <p className="text-muted">Impossible de charger les informations d'abonnement</p>
            </div>
          </Card.Body>
        </Card>
      );
    }

    const getAbonnementStatus = () => {
      if (!abonnementInfo.id) {
        return {
          variant: "secondary",
          icon: FaTimesCircle,
          title: "Sans abonnement",
          message: "Vous n'avez pas d'abonnement actif",
          color: "#6c757d"
        };
      }

      if (abonnementInfo.is_expired) {
        return {
          variant: "danger",
          icon: FaExclamationCircle,
          title: "Abonnement expiré",
          message: "Votre abonnement a expiré",
          color: "#dc3545"
        };
      }

      if (abonnementInfo.expire_bientot) {
        return {
          variant: "warning",
          icon: FaExclamationTriangle,
          title: "Expire bientôt",
          message: `Expire dans ${abonnementInfo.jours_restants} jours`,
          color: "#ffc107"
        };
      }

      return {
        variant: "success",
        icon: FaCheckCircle,
        title: "Abonnement actif",
        message: `Valide pour ${abonnementInfo.jours_restants} jours`,
        color: "#28a745"
      };
    };

    const status = getAbonnementStatus();
    const IconComponent = status.icon;
    const dateFin = abonnementInfo.date_fin ? new Date(abonnementInfo.date_fin) : null;

    const formatDate = (date) => {
      return date ? date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }) : "N/A";
    };

    const getTypeLabel = (type) => {
      switch(type) {
        case "mensuel": return "Mensuel";
        case "trimestriel": return "Trimestriel";
        case "annuel": return "Annuel";
        default: return type;
      }
    };

    return (
      <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "18px", background: C.cardBg }}>
        <Card.Body className="p-4 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">
              <FaCreditCard className="me-2" />
              État de l'abonnement
            </h5>
            <Badge bg={status.variant} className="px-3 py-2">
              <IconComponent className="me-1" /> {status.title}
            </Badge>
          </div>

          {abonnementInfo.id ? (
            <>
              <div className="mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Type:</span>
                  <span className="fw-bold">{getTypeLabel(abonnementInfo.type_abonnement)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Montant:</span>
                  <span className="fw-bold">{abonnementInfo.montant} €</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Méthode:</span>
                  <span className="fw-bold">{abonnementInfo.methode_paiement}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Date début:</span>
                  <span className="fw-bold">
                    {abonnementInfo.date_debut ? new Date(abonnementInfo.date_debut).toLocaleDateString("fr-FR") : "N/A"}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted">Date fin:</span>
                  <span className="fw-bold">{formatDate(dateFin)}</span>
                </div>
              </div>

              {status.variant === "danger" || status.variant === "warning" ? (
                <Alert variant={status.variant} className="mt-2">
                  <div className="d-flex align-items-center">
                    <IconComponent className="me-2" />
                    <div>
                      <strong>{status.title}</strong>
                      <p className="mb-0 small">{status.message}</p>
                    </div>
                  </div>
                </Alert>
              ) : (
                <Alert variant="success" className="mt-2">
                  <div className="d-flex align-items-center">
                    <FaCheckCircle className="me-2" />
                    <div>
                      <strong>Abonnement valide</strong>
                      <p className="mb-0 small">{status.message}</p>
                    </div>
                  </div>
                </Alert>
              )}

              <div className="mt-auto">
                <ProgressBar 
                  now={abonnementInfo.jours_restants} 
                  max={abonnementInfo.type_abonnement === "mensuel" ? 30 : 
                       abonnementInfo.type_abonnement === "trimestriel" ? 90 : 365}
                  variant={status.variant}
                  className="mb-3"
                  style={{ height: "8px", borderRadius: "4px" }}
                />
                
                <Button 
                  variant={status.variant === "danger" ? "danger" : "primary"}
                  className="w-100"
                  onClick={() => navigate("/renouveler-abonnement")}
                >
                  <FaCreditCard className="me-2" />
                  {status.variant === "danger" ? "Renouveler maintenant" : 
                   status.variant === "warning" ? "Renouveler l'abonnement" : 
                   "Voir les détails"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center py-4">
                <FaCreditCard size={48} className="text-muted mb-3" />
                <h6 className="fw-bold">Aucun abonnement actif</h6>
                <p className="text-muted small">
                  Vous n'avez pas d'abonnement en cours. Souscrivez à un abonnement pour accéder à toutes les fonctionnalités.
                </p>
              </div>
              
              <Button 
                variant="success" 
                className="w-100 mt-auto"
                onClick={() => navigate("/souscrire-abonnement")}
              >
                <FaCreditCard className="me-2" />
                Souscrire un abonnement
              </Button>
            </>
          )}
        </Card.Body>
      </Card>
    );
  };

  // === MODAL DE RENOUVELLEMENT ===
  const RenewModal = () => {
    return (
      <Modal show={showRenewModal} onHide={() => setShowRenewModal(false)} centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <FaCreditCard className="me-2" />
            Renouveler l'abonnement
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Votre abonnement {abonnementInfo?.type_abonnement} expire le {
            abonnementInfo?.date_fin ? new Date(abonnementInfo.date_fin).toLocaleDateString("fr-FR") : "bientôt"
          }.</p>
          
          <div className="mb-3">
            <h6>Choisissez une nouvelle formule :</h6>
            <div className="list-group">
              <button className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Mensuel</h6>
                  <span className="fw-bold">9.99€</span>
                </div>
                <small className="text-muted">Renouvellement automatique chaque mois</small>
              </button>
              <button className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Trimestriel</h6>
                  <span className="fw-bold">24.99€</span>
                </div>
                <small className="text-muted">Économisez 15%</small>
              </button>
              <button className="list-group-item list-group-item-action">
                <div className="d-flex w-100 justify-content-between">
                  <h6 className="mb-1">Annuel</h6>
                  <span className="fw-bold">89.99€</span>
                </div>
                <small className="text-muted">Économisez 25% - Meilleur rapport</small>
              </button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRenewModal(false)}>
            Annuler
          </Button>
          <Button variant="success" onClick={() => {
            setShowRenewModal(false);
            navigate("/paiement-abonnement");
          }}>
            <FaCreditCard className="me-2" />
            Procéder au paiement
          </Button>
        </Modal.Footer>
      </Modal>
    );
  };

  // === COMPOSANT PROGRESS NOTIFICATION ===
  const ProfileCompletionAlert = () => {
    if (!showProfileAlert || profileCompletion >= 100) return null;

    const getProgressColor = () => {
      if (profileCompletion < 30) return "danger";
      if (profileCompletion < 60) return "warning";
      if (profileCompletion < 80) return "info";
      return "success";
    };

    const getIcon = () => {
      if (profileCompletion < 30) return <FaExclamationCircle className="me-2" />;
      if (profileCompletion < 80) return <FaExclamationCircle className="me-2" />;
      return <FaCheckCircle className="me-2" />;
    };

    return (
      <Alert 
        variant={getProgressColor()} 
        onClose={() => setShowProfileAlert(false)} 
        dismissible
        className="shadow-lg border-0 mb-4"
        style={{ 
          borderRadius: "15px",
          borderLeft: `5px solid ${getProgressColor() === "danger" ? "#dc3545" : 
                        getProgressColor() === "warning" ? "#ffc107" : 
                        getProgressColor() === "info" ? "#17a2b8" : "#28a745"}`
        }}
      >
        <div className="d-flex align-items-center mb-2">
          {getIcon()}
          <h5 className="mb-0 fw-bold">
            {t('profile_completion')}: {profileCompletion}%
          </h5>
        </div>
        
        <ProgressBar 
          now={profileCompletion} 
          variant={getProgressColor()}
          className="mb-3"
          style={{ height: "10px", borderRadius: "5px" }}
          animated={profileCompletion < 100}
        />
        
        <p className="mb-2">
          {profileCompletion < 50 
            ? t('profile_low_completion')
            : profileCompletion < 80
            ? t('profile_medium_completion')
            : t('profile_high_completion')
          }
        </p>
        
        {incompleteFields.length > 0 && (
          <div className="mt-2">
            <small className="fw-bold d-block mb-1">{t('missing_fields')}:</small>
            <div className="d-flex flex-wrap gap-2">
              {incompleteFields.map((field, index) => (
                <Badge 
                  key={index} 
                  bg="secondary"
                  className="px-3 py-1"
                  style={{ borderRadius: "15px", fontSize: "0.8rem" }}
                >
                  {t(field)}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline-primary" 
          size="sm" 
          className="mt-3"
          onClick={() => navigate("/profilMembre")}
          style={{ borderRadius: "20px", padding: "5px 20px" }}
        >
          <FaUser className="me-2" />
          {t('complete_profile')}
        </Button>
      </Alert>
    );
  };

  // === SIMPLE CHART ===
  const SimpleChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <div style={{ height: "300px", position: "relative", padding: "20px 0" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "end", 
          justifyContent: "space-between", 
          height: "250px",
          padding: "0 20px",
          borderBottom: "2px solid #e9ecef"
        }}>
          {data.map((item, index) => (
            <div key={index} style={{ textAlign: "center", width: "40px", position: "relative" }}>
              <div
                style={{
                  height: `${(item.value / maxValue) * 200}px`,
                  background: "linear-gradient(to top, #667eea, #764ba2)",
                  borderRadius: "6px 6px 0 0",
                  margin: "0 5px",
                  minHeight: "4px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scaleY(1.1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scaleY(1)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
                }}
              />
              <div style={{ fontSize: "11px", color: C.gray, marginTop: "8px", fontWeight: "500" }}>
                {item.month}
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: C.primary, 
                fontWeight: "bold",
                position: "absolute",
                top: `${(item.value / maxValue) * 200 - 20}px`,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.9)",
                padding: "2px 6px",
                borderRadius: "4px",
                opacity: item.value > 0 ? 1 : 0,
                pointerEvents: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "12px", color: C.gray, fontSize: "14px", fontWeight: "500" }}>
          {t('monthly_activity')}
        </div>
      </div>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: C.bg }}>
      <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />

      <div 
        className="flex-grow-1"
        style={{ 
          marginLeft: sidebarCollapsed ? "80px" : "280px", 
          padding: "2rem", 
          transition: "margin 0.4s ease",
          minHeight: "calc(100vh - 80px)"
        }}
      >
        <h1 style={{ 
          color: "#2c3e50", 
          fontWeight: "bold", 
          fontSize: "2rem",
          marginBottom: "1.5rem"
        }}>
          {t('member_dashboard_title')}
        </h1>

        {/* === NOTIFICATION DE COMPLÉTION DU PROFIL === */}
        <ProfileCompletionAlert />

        {/* === CARTES STATISTIQUES + ABONNEMENT === */}
        <Row className="g-4 mb-5">
          <Col xl={9}>
            <Row className="g-4">
              {[
                { icon: FaBullhorn, value: stats.publications, label: t("publications_total"), color: C.primary },
                { icon: FaCalendarAlt, value: stats.evenements, label: t("events_total"), color: C.secondary },
                { icon: FaEnvelope, value: stats.messages, label: t("messages"), color: C.accent },
                { icon: FaUsers, value: stats.notifications, label: t("alerts"), color: C.neon }
              ].map((stat, i) => (
                <Col xl={3} lg={6} key={i}>
                  <Card 
                    className="shadow-sm border-0"
                    style={{ 
                      borderRadius: "18px", 
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      background: C.cardBg
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                    }}
                  >
                    <Card.Body className="p-4">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <stat.icon size={32} style={{ color: stat.color }} />
                        </div>
                        <div className="text-end">
                          <h2 style={{ 
                            fontWeight: "bold", 
                            color: "#2c3e50", 
                            fontSize: "2rem",
                            margin: 0
                          }}>
                            {loading ? <Spinner animation="border" size="sm" /> : stat.value}
                          </h2>
                          <p style={{ 
                            fontWeight: "600", 
                            color: C.gray, 
                            margin: 0,
                            fontSize: "0.9rem"
                          }}>
                            {stat.label}
                          </p>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </Col>
          
          {/* === CARTE ABONNEMENT === */}
          <Col xl={3}>
            <AbonnementCard />
          </Col>
        </Row>

        {/* === GRAPHIQUE + ACCÈS RAPIDE === */}
        <Row className="g-4 mb-5">
          <Col lg={8}>
            <Card className="shadow-sm border-0" style={{ borderRadius: "18px", background: C.cardBg }}>
              <Card.Body className="p-4">
                <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#2c3e50" }}>
                  {t('monthly_activity_chart')}
                </h4>
                {loading ? (
                  <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <SimpleChart data={monthlyData} />
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "18px", background: C.cardBg }}>
              <Card.Body className="p-4">
                <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#2c3e50" }}>
                  {t('quick_access')}
                </h4>
                {[
                  { label: t("menu_publication"), color: C.primary, icon: FaBullhorn, route: "/pubMembre" },
                  { label: t("menu_event"), color: C.secondary, icon: FaCalendarAlt, route: "/evenementMembre" },
                  { label: t("menu_call_for_tender"), color: C.neon, icon: FaFileAlt, route: "/appeloffreMembre" },
                  { label: t("menu_messages"), color: C.accent, icon: FaEnvelope, route: "/messageMembre" },
                  // Ajout d'un accès rapide à la gestion d'abonnement
                  { label: "Gérer l'abonnement", color: "#28a745", icon: FaCreditCard, route: "/gestion-abonnement" }
                ].map((portal, i) => (
                  <Button 
                    key={i}
                    className="w-100 mb-3 d-flex align-items-center justify-content-between shadow-sm"
                    style={{ 
                      background: portal.color, 
                      color: C.white, 
                      fontWeight: "600", 
                      borderRadius: "12px",
                      border: "none",
                      padding: "14px 18px",
                      transition: "all 0.3s ease",
                      fontSize: "0.95rem"
                    }}
                    onClick={() => navigate(portal.route)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.03)";
                      e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <portal.icon size={18} /> {portal.label}
                    </div>
                    <FaRocket size={16} />
                  </Button>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* === ACTIVITÉ RÉCENTE === */}
        <Card className="shadow-sm border-0" style={{ borderRadius: "18px", background: C.cardBg }}>
          <Card.Body className="p-4">
            <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#2c3e50" }}>
              {t('recent_activity')}
            </h4>
            <ListGroup variant="flush">
              {recentData.length > 0 ? (
                recentData.map((item, i) => (
                  <ListGroup.Item 
                    key={i}
                    className="d-flex justify-content-between align-items-center px-3 py-3"
                    style={{ 
                      borderRadius: "12px", 
                      marginBottom: "0.5rem", 
                      background: "#f8f9fa", 
                      color: "#2c3e50",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e9ecef";
                      e.currentTarget.style.transform = "translateX(8px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8f9fa";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                        {item.titre || item.sujet}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: C.gray }}>
                        {new Date(item.date).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <Badge 
                      pill
                      style={{ 
                        background: item.type === "publication" ? C.primary : 
                                   item.type === "evenement" ? C.secondary : C.accent,
                        fontSize: "0.7rem",
                        fontWeight: "600",
                        padding: "6px 10px"
                      }}
                    >
                      {item.type === "publication" ? t("pub_abbr") : 
                       item.type === "evenement" ? t("event_abbr") : t("msg_abbr")}
                    </Badge>
                  </ListGroup.Item>
                ))
              ) : loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  {t('no_recent_activity')}
                </div>
              )}
            </ListGroup>
          </Card.Body>
        </Card>
      </div>

      {/* === MODAL DE RENOUVELLEMENT === */}
      <RenewModal />

      {/* === FOOTER MINIMALISTE AVEC SELECTEUR DE LANGUE === */}
      <footer style={{ 
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0)",
        padding: "10px",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <LanguageSwitcher />
      </footer>
    </div>
  );
};

export default DashMembre;