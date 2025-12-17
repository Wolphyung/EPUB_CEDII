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
  Alert,
  ProgressBar,
  Modal,
  OverlayTrigger,
  Tooltip,
  Dropdown
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
  FaTimesCircle,
  FaChartLine,
  FaHistory,
  FaDatabase,
  FaShieldAlt,
  FaCog,
  FaArrowUp,
  FaArrowDown,
  FaChevronRight,
  FaBell,
  FaSearch,
  FaFilter,
  FaCalendar,
  FaFileSignature,
  FaChartBar,
  FaLayerGroup,
  FaCrown,
  FaBolt,
  FaStar,
  FaTrophy,
  FaRegChartBar,
  FaUserCircle,
  FaCaretDown,
  FaSync,
  FaPlus,
  FaEye,
  FaEdit,
  FaTrash,
  FaShare,
  FaDownload,
  FaPrint,
  FaQuestionCircle,
  FaInfoCircle
} from "react-icons/fa";
import { 
  RiUserSettingsLine, 
  RiDashboardLine,
  RiNotificationLine,
  RiSettingsLine
} from "react-icons/ri";
import { 
  MdOutlineSpaceDashboard,
  MdOutlineAnalytics,
  MdOutlineTrendingUp,
  MdOutlineNotificationsActive
} from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

// Design System Ultra-Moderne
const DESIGN = {
  colors: {
    primary: {
      light: "#667eea",
      main: "#5a67d8",
      dark: "#4c51bf",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    secondary: {
      light: "#9f7aea",
      main: "#805ad5",
      dark: "#6b46c1",
      gradient: "linear-gradient(135deg, #9f7aea 0%, #ed64a6 100%)"
    },
    success: {
      light: "#68d391",
      main: "#38a169",
      dark: "#2f855a",
      gradient: "linear-gradient(135deg, #68d391 0%, #38a169 100%)"
    },
    warning: {
      light: "#f6ad55",
      main: "#ed8936",
      dark: "#dd6b20",
      gradient: "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)"
    },
    danger: {
      light: "#fc8181",
      main: "#e53e3e",
      dark: "#c53030",
      gradient: "linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)"
    },
    info: {
      light: "#76e4f7",
      main: "#0bc5ea",
      dark: "#00b5d8",
      gradient: "linear-gradient(135deg, #76e4f7 0%, #0bc5ea 100%)"
    },
    premium: {
      light: "#fbbf24",
      main: "#d69e2e",
      dark: "#b7791f",
      gradient: "linear-gradient(135deg, #fbbf24 0%, #d69e2e 100%)"
    },
    neutral: {
      50: "#f9fafb",
      100: "#f3f4f6",
      200: "#e5e7eb",
      300: "#d1d5db",
      400: "#9ca3af",
      500: "#6b7280",
      600: "#4b5563",
      700: "#374151",
      800: "#1f2937",
      900: "#111827"
    }
  },
  gradients: {
    dashboard: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    secondary: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    success: "linear-gradient(135deg, #48bb78 0%, #38a169 100%)",
    warning: "linear-gradient(135deg, #f6ad55 0%, #ed8936 100%)",
    danger: "linear-gradient(135deg, #fc8181 0%, #e53e3e 100%)",
    dark: "linear-gradient(135deg, #1f2937 0%, #111827 100%)",
    premium: "linear-gradient(135deg, #fbbf24 0%, #d69e2e 100%)",
    bg: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    glass: "linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)"
  },
  shadows: {
    subtle: "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)",
    sm: "0 2px 4px rgba(0,0,0,0.05), 0 1px 6px rgba(0,0,0,0.1)",
    md: "0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1)",
    lg: "0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.1)",
    xl: "0 20px 25px rgba(0,0,0,0.05), 0 10px 10px rgba(0,0,0,0.1)",
    "2xl": "0 25px 50px rgba(0,0,0,0.1)",
    inner: "inset 0 2px 4px 0 rgba(0,0,0,0.06)",
    glow: "0 0 20px rgba(102, 126, 234, 0.1)"
  },
  borderRadius: {
    none: "0",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
    full: "9999px"
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
      black: 900
    }
  }
};

const DashMembre = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    publications: 0, 
    evenements: 0, 
    messages: 0, 
    notifications: 0,
    tenders: 0
  });
  const [recentData, setRecentData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  // États améliorés
  const [userProfile, setUserProfile] = useState(null);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [showProfileAlert, setShowProfileAlert] = useState(true);
  const [incompleteFields, setIncompleteFields] = useState([]);
  const [abonnementInfo, setAbonnementInfo] = useState(null);
  const [abonnementLoading, setAbonnementLoading] = useState(true);
  const [showRenewModal, setShowRenewModal] = useState(false);
  
  // Nouvelles données
  const [trendData, setTrendData] = useState({
    publications: "+12%",
    evenements: "+8%",
    messages: "-3%",
    tenders: "+15%"
  });
  const [quickStats, setQuickStats] = useState({
    today: 5,
    week: 42,
    month: 156
  });
  const [performance, setPerformance] = useState(87);
  
  // Nouveaux états pour l'année automatique
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [availableYears, setAvailableYears] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const mockData = {
    publications: [
      { id: 1, titre: "Lancement du projet 2025", created_at: "2025-11-10T10:00:00", category: "Innovation", priority: "high" },
      { id: 2, titre: "Réunion générale trimestrielle", created_at: "2025-11-08T14:30:00", category: "Général", priority: "medium" }
    ],
    evenements: [
      { id: 1, titre: "Assemblée Générale Annuelle", created_at: "2025-12-01T09:00:00", location: "Salle Principale", status: "upcoming" },
      { id: 2, titre: "Formation Sécurité Avancée", created_at: "2025-11-20T13:00:00", location: "Room B", status: "completed" }
    ],
    messages: [
      { id: 1, sujet: "Bienvenue dans votre espace premium !", created_at: "2025-11-12T08:15:00", sender: "Support Technique", priority: "high" },
      { id: 2, sujet: "Confirmation de votre participation", created_at: "2025-11-11T16:45:00", sender: "Administration", priority: "medium" }
    ]
  };

  // Fonction pour calculer les données mensuelles à partir des données réelles
  const calculateMonthlyDataFromRealData = (publications, evenements, messages, year) => {
    const monthly = Array(12).fill(0);
    
    // Comptabiliser les publications
    publications.forEach(p => { 
      if (p.date && p.date.getFullYear() === year) {
        monthly[p.date.getMonth()]++; 
      }
    });
    
    // Comptabiliser les événements
    evenements.forEach(e => { 
      if (e.date && e.date.getFullYear() === year) {
        monthly[e.date.getMonth()]++; 
      }
    });
    
    // Comptabiliser les messages
    messages.forEach(m => { 
      if (m.date && m.date.getFullYear() === year) {
        monthly[m.date.getMonth()]++; 
      }
    });
    
    return monthly.map((v, i) => ({
      month: t(`months.${i}`),
      value: v
    }));
  };

  // Fonction pour extraire les années disponibles des données
  const extractAvailableYears = (publications, evenements, messages) => {
    const allDates = [
      ...publications.map(p => p.date),
      ...evenements.map(e => e.date),
      ...messages.map(m => m.date)
    ].filter(date => date instanceof Date && !isNaN(date));
    
    const years = [...new Set(allDates.map(date => date.getFullYear()))]
      .sort((a, b) => b - a);
    
    return years.length > 0 ? years : [new Date().getFullYear()];
  };

  const calculateProfileCompletion = (profile) => {
    if (!profile) return { percentage: 0, missingFields: [] };
    
    const requiredFields = ['nom', 'email', 'telephone', 'adresse', 'ville', 'pays', 'profession', 'bio'];
    const optionalFields = ['date_naissance', 'site_web', 'linkedin', 'twitter', 'avatar'];
    
    let completedCount = 0;
    let totalWeight = requiredFields.length + (optionalFields.length * 0.5);
    
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
    
    const percentage = Math.min(Math.round((completedCount / totalWeight) * 100), 100);
    const missingFields = requiredFields.filter(field => 
      !profile[field] || profile[field].toString().trim() === ''
    );
    
    return { percentage, missingFields };
  };

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
      
      const abonnementRes = await axios.get(
        `http://127.0.0.1:8000/api/abonnements/check/${userData.id}`,
        { headers }
      ).catch(() => ({ data: { success: false } }));
      
      if (abonnementRes.data?.success) {
        const data = abonnementRes.data.data;
        
        if (data) {
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
          setAbonnementInfo({ has_abonnement: false, message: "Aucun abonnement actif" });
        }
      } else {
        // Données démo
        const mockAbonnement = {
          id: 1,
          type_abonnement: "premium",
          date_debut: "2024-01-01",
          date_fin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          statut: "actif",
          montant: 29.99,
          methode_paiement: "Carte Visa",
          features: ["Support 24/7", "Stockage 50GB", "Analytics", "Backup auto"]
        };
        
        const dateFin = new Date(mockAbonnement.date_fin);
        const now = new Date();
        const joursRestants = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));
        
        setAbonnementInfo({
          ...mockAbonnement,
          jours_restants: joursRestants,
          is_expired: false,
          expire_bientot: joursRestants <= 7
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'abonnement:", error);
    } finally {
      setAbonnementLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token || !userData.id) return;

      const headers = { Authorization: `Bearer ${token}` };
      
      const profileRes = await axios.get(
        `http://127.0.0.1:8000/api/membres/${userData.id}/profile`,
        { headers }
      ).catch(() => ({ data: { success: false } }));
      
      if (profileRes.data?.success) {
        const profile = profileRes.data.data;
        setUserProfile(profile);
        
        const { percentage, missingFields } = calculateProfileCompletion(profile);
        setProfileCompletion(percentage);
        setIncompleteFields(missingFields);
        
        if (percentage < 80) {
          setShowProfileAlert(true);
        }
        
        const statsRes = await axios.get(
          `http://127.0.0.1:8000/api/membres/${userData.id}/stats`,
          { headers }
        ).catch(() => ({ data: { success: false } }));
        
        if (statsRes.data?.success) {
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

  // Fonction pour rafraîchir les données mensuelles
  const refreshMonthlyData = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const [pubRes, evtRes, msgRes] = await Promise.all([
        axios.get("http://127.0.0.1:8000/api/publications", { headers })
          .catch(() => ({ data: { data: [] } })),
        axios.get("http://127.0.0.1:8000/api/evenements", { headers })
          .catch(() => ({ data: { data: [] } })),
        axios.get("http://127.0.0.1:8000/api/messages", { headers })
          .catch(() => ({ data: { data: [] } }))
      ]);

      let publications = (pubRes.data.data || []).map(p => ({ 
        ...p, 
        type: "publication", 
        date: new Date(p.created_at || new Date()), 
        titre: p.titre || t("sans_titre") 
      }));
      let evenements = (evtRes.data.data || []).map(e => ({ 
        ...e, 
        type: "evenement", 
        date: new Date(e.created_at || new Date()), 
        titre: e.titre || t("sans_titre") 
      }));
      let messages = (msgRes.data.data || []).map(m => ({ 
        ...m, 
        type: "message", 
        date: new Date(m.created_at || new Date()), 
        sujet: m.sujet || t("no_subject") 
      }));

      if (publications.length === 0 && evenements.length === 0 && messages.length === 0) {
        publications = mockData.publications.map(p => ({ ...p, type: "publication", date: new Date(p.created_at) }));
        evenements = mockData.evenements.map(e => ({ ...e, type: "evenement", date: new Date(e.created_at) }));
        messages = mockData.messages.map(m => ({ ...m, type: "message", date: new Date(m.created_at) }));
      }

      // Extraire les années disponibles
      const years = extractAvailableYears(publications, evenements, messages);
      setAvailableYears(years);
      
      // Si l'année sélectionnée n'est pas dans les années disponibles, utiliser la plus récente
      if (!years.includes(selectedYear)) {
        setSelectedYear(years[0]);
      }

      // Calculer les données mensuelles
      const monthlyData = calculateMonthlyDataFromRealData(
        publications, 
        evenements, 
        messages, 
        selectedYear
      );
      
      setMonthlyData(monthlyData);

      // Mettre à jour les statistiques
      setStats(prev => ({
        ...prev,
        publications: publications.length,
        evenements: evenements.length,
        messages: messages.length,
      }));

      // Mettre à jour les activités récentes
      const all = [...publications, ...evenements, ...messages]
        .sort((a, b) => b.date - a.date)
        .slice(0, 5);
      setRecentData(all);

    } catch (error) {
      console.error("Erreur lors du rafraîchissement des données:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        await Promise.all([fetchUserProfile(), fetchAbonnementInfo()]);

        const [pubRes, evtRes, msgRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/publications", { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get("http://127.0.0.1:8000/api/evenements", { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get("http://127.0.0.1:8000/api/messages", { headers })
            .catch(() => ({ data: { data: [] } }))
        ]);

        let publications = (pubRes.data.data || []).map(p => ({ 
          ...p, 
          type: "publication", 
          date: new Date(p.created_at || new Date()), 
          titre: p.titre || t("sans_titre") 
        }));
        let evenements = (evtRes.data.data || []).map(e => ({ 
          ...e, 
          type: "evenement", 
          date: new Date(e.created_at || new Date()), 
          titre: e.titre || t("sans_titre") 
        }));
        let messages = (msgRes.data.data || []).map(m => ({ 
          ...m, 
          type: "message", 
          date: new Date(m.created_at || new Date()), 
          sujet: m.sujet || t("no_subject") 
        }));

        if (publications.length === 0 && evenements.length === 0 && messages.length === 0) {
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
          tenders: 8
        }));

        const all = [...publications, ...evenements, ...messages]
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);
        setRecentData(all);

        // Extraire les années disponibles
        const years = extractAvailableYears(publications, evenements, messages);
        setAvailableYears(years);
        
        // Si l'année sélectionnée n'est pas dans les années disponibles, utiliser la plus récente
        if (!years.includes(selectedYear)) {
          setSelectedYear(years[0]);
        }

        // Calculer les données mensuelles avec les données réelles
        const monthlyData = calculateMonthlyDataFromRealData(
          publications, 
          evenements, 
          messages, 
          selectedYear
        );
        
        setMonthlyData(monthlyData);

        setQuickStats({
          today: Math.floor(Math.random() * 10) + 3,
          week: Math.floor(Math.random() * 50) + 30,
          month: Math.floor(Math.random() * 200) + 100
        });

      } catch (err) {
        console.warn(t("demo_mode_activated"), err);
        
        // Données de démo
        const currentYear = new Date().getFullYear();
        setAvailableYears([currentYear, currentYear - 1]);
        setSelectedYear(currentYear);
        
        setStats({
          publications: 12,
          evenements: 8,
          messages: 24,
          notifications: 5,
          tenders: 8
        });
        
        setRecentData(mockData.publications.map(p => ({ ...p, type: "publication", date: new Date(p.created_at) })));
        
        setMonthlyData([
          { month: "Jan", value: 12 }, { month: "Fév", value: 18 }, { month: "Mar", value: 15 },
          { month: "Avr", value: 22 }, { month: "Mai", value: 25 }, { month: "Jun", value: 30 },
          { month: "Jul", value: 28 }, { month: "Aoû", value: 32 }, { month: "Sep", value: 35 },
          { month: "Oct", value: 38 }, { month: "Nov", value: 42 }, { month: "Déc", value: 45 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchAbonnementInfo, 60000);
    return () => clearInterval(interval);
  }, [t]);

  // Rafraîchir les données mensuelles quand l'année change
  useEffect(() => {
    if (!loading) {
      refreshMonthlyData();
    }
  }, [selectedYear]);

  // === COMPOSANT EN-TÊTE AMÉLIORÉ ===
  const DashboardHeader = () => (
    <div className="mb-6">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="fw-black mb-2" style={{ 
            fontSize: '2.5rem',
            background: DESIGN.gradients.dashboard,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            <MdOutlineSpaceDashboard className="me-3" />
            {t('member_dashboard_title')}
          </h1>
          <p className="text-muted fs-5 mb-0">
            Bonjour <span className="fw-semibold text-primary">{userProfile?.nom || "Membre"}</span>, voici votre tableau de bord personnel
          </p>
        </div>
        <div className="d-flex gap-3">
          <Button 
            variant="outline-secondary" 
            className="d-flex align-items-center gap-2 px-4 py-2"
            style={{ borderRadius: DESIGN.borderRadius.lg }}
            onClick={refreshMonthlyData}
            disabled={refreshing}
          >
            <FaSync className={refreshing ? "fa-spin" : ""} />
            {refreshing ? "Actualisation..." : "Actualiser"}
          </Button>
          <Dropdown>
            <Dropdown.Toggle 
              variant="primary" 
              className="d-flex align-items-center gap-2 px-4 py-2"
              style={{ borderRadius: DESIGN.borderRadius.lg }}
            >
              <FaUserCircle />
              Mon compte
              <FaCaretDown className="ms-1" />
            </Dropdown.Toggle>
            <Dropdown.Menu style={{ borderRadius: DESIGN.borderRadius.lg }}>
              <Dropdown.Item onClick={() => navigate("/profilMembre")}>
                <RiUserSettingsLine className="me-2" />
                Mon profil
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate("/parametres")}>
                <RiSettingsLine className="me-2" />
                Paramètres
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item className="text-danger">
                <FaTimesCircle className="me-2" />
                Déconnexion
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </div>
      
      {/* Barre de recherche et filtres */}
      <div className="d-flex gap-3 mb-4">
        <div className="flex-grow-1">
          <div className="input-group" style={{ borderRadius: DESIGN.borderRadius.lg }}>
            <span className="input-group-text bg-white border-end-0">
              <FaSearch className="text-muted" />
            </span>
            <input 
              type="text" 
              className="form-control border-start-0 ps-0" 
              placeholder="Rechercher dans le tableau de bord..."
              style={{ borderColor: DESIGN.colors.neutral[200] }}
            />
          </div>
        </div>
        <Button variant="outline-primary" className="d-flex align-items-center gap-2">
          <FaFilter />
          Filtres
        </Button>
        <Button variant="outline-primary" className="d-flex align-items-center gap-2">
          <FaDownload />
          Exporter
        </Button>
      </div>
    </div>
  );

  // === CARTE STATISTIQUE ULTRA-MODERNE ===
  const ModernStatCard = ({ icon: Icon, value, label, trend, color, gradient, onClick, badge }) => {
    const isPositive = trend?.startsWith('+');
    
    return (
      <Card 
        className="border-0 position-relative overflow-hidden"
        style={{ 
          borderRadius: DESIGN.borderRadius.xl,
          background: 'white',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '100%'
        }}
        onClick={onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
          e.currentTarget.style.boxShadow = DESIGN.shadows["2xl"];
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0) scale(1)';
          e.currentTarget.style.boxShadow = DESIGN.shadows.lg;
        }}
      >
        {/* Effet de fond décoratif */}
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '150px',
          height: '150px',
          background: gradient,
          opacity: 0.1,
          borderRadius: '50%',
          transition: 'all 0.4s ease'
        }} />
        
        <Card.Body className="p-5 position-relative" style={{ zIndex: 1 }}>
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <div style={{
                width: '56px',
                height: '56px',
                borderRadius: DESIGN.borderRadius.lg,
                background: gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: 'white',
                boxShadow: `0 4px 12px ${color}40`
              }}>
                <Icon size={24} />
              </div>
              <h2 className="fw-black mb-2" style={{ 
                fontSize: '3rem',
                color: DESIGN.colors.neutral[900]
              }}>
                {loading ? <Spinner animation="border" size="sm" /> : value}
              </h2>
              <p className="mb-0 fs-5 fw-medium" style={{ 
                color: DESIGN.colors.neutral[600]
              }}>
                {label}
              </p>
            </div>
            
            {badge && (
              <Badge 
                bg="light"
                text="dark"
                className="px-3 py-2"
                style={{ 
                  borderRadius: DESIGN.borderRadius.full,
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  border: `1px solid ${DESIGN.colors.neutral[200]}`
                }}
              >
                {badge}
              </Badge>
            )}
          </div>
          
          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            <div className="d-flex align-items-center">
              {trend && (
                <Badge 
                  bg={isPositive ? 'success' : 'danger'}
                  className="px-3 py-2 me-3"
                  style={{ 
                    borderRadius: DESIGN.borderRadius.full,
                    fontSize: '0.875rem',
                    fontWeight: 600
                  }}
                >
                  {isPositive ? <FaArrowUp className="me-1" /> : <FaArrowDown className="me-1" />}
                  {trend}
                </Badge>
              )}
              <small className="text-muted">Détails</small>
            </div>
            <FaChevronRight className="text-muted" />
          </div>
        </Card.Body>
      </Card>
    );
  };

  // === CARTE ABONNEMENT PREMIUM ===
  const PremiumAbonnementCard = () => {
    if (abonnementLoading) {
      return (
        <Card className="border-0 h-100" style={{ 
          borderRadius: DESIGN.borderRadius.xl,
          background: DESIGN.gradients.dark,
          color: 'white',
          overflow: 'hidden'
        }}>
          <Card.Body className="p-5 d-flex align-items-center justify-content-center">
            <div className="text-center">
              <Spinner animation="border" variant="light" size="lg" />
              <p className="mt-3 text-light opacity-75 fw-medium">Chargement de l'abonnement...</p>
            </div>
          </Card.Body>
        </Card>
      );
    }

    if (!abonnementInfo || !abonnementInfo.id) {
      return (
        <Card className="border-0 h-100" style={{ 
          borderRadius: DESIGN.borderRadius.xl,
          background: DESIGN.gradients.dark,
          color: 'white',
          overflow: 'hidden'
        }}>
          <Card.Body className="p-5 d-flex flex-column">
            <div className="text-center mb-4">
              <div style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: DESIGN.gradients.premium,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 20px",
                color: "white"
              }}>
                <FaCrown size={32} />
              </div>
              <h5 className="fw-bold mb-2">Accès Standard</h5>
              <p className="opacity-75 mb-4">
                Passez au premium pour débloquer toutes les fonctionnalités
              </p>
            </div>
            
            <Button 
              variant="light" 
              className="w-100 mt-auto fw-bold py-3"
              onClick={() => navigate("/souscrire-abonnement")}
              style={{ 
                borderRadius: DESIGN.borderRadius.lg,
                fontSize: '1rem'
              }}
            >
              <FaRocket className="me-2" />
              Découvrir les offres Premium
            </Button>
          </Card.Body>
        </Card>
      );
    }

    const status = abonnementInfo.is_expired ? 'expired' : 
                   abonnementInfo.expire_bientot ? 'expiring' : 'active';
    
    const statusConfig = {
      active: {
        color: DESIGN.colors.success.main,
        icon: FaCheckCircle,
        label: 'Actif',
        gradient: DESIGN.gradients.success
      },
      expiring: {
        color: DESIGN.colors.warning.main,
        icon: FaExclamationTriangle,
        label: 'Expire bientôt',
        gradient: DESIGN.gradients.warning
      },
      expired: {
        color: DESIGN.colors.danger.main,
        icon: FaTimesCircle,
        label: 'Expiré',
        gradient: DESIGN.gradients.danger
      }
    };

    const { color, icon: Icon, label, gradient } = statusConfig[status];

    return (
      <Card className="border-0 h-100" style={{ 
        borderRadius: DESIGN.borderRadius.xl,
        background: DESIGN.gradients.dark,
        color: 'white',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Effet de brillance */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: gradient
        }} />
        
        <Card.Body className="p-5 d-flex flex-column">
          <div className="d-flex justify-content-between align-items-start mb-5">
            <div>
              <div className="d-flex align-items-center mb-3">
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: DESIGN.borderRadius.lg,
                  background: gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px',
                  color: 'white'
                }}>
                  <FaCrown size={20} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0">Abonnement Premium</h5>
                  <Badge 
                    style={{ 
                      background: color,
                      color: 'white',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      padding: '6px 12px',
                      borderRadius: DESIGN.borderRadius.full,
                      marginTop: '4px'
                    }}
                  >
                    <Icon className="me-1" /> {label}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-end">
              <div className="fs-2 fw-black mb-1">{abonnementInfo.montant} AR</div>
              <small className="opacity-75">/ mois</small>
            </div>
          </div>

          <div className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span className="opacity-75">Jours restants</span>
              <div className="d-flex align-items-center">
                <FaHistory className="me-2" />
                <span className="fw-bold fs-4">{abonnementInfo.jours_restants} jours</span>
              </div>
            </div>
            
            <ProgressBar 
              now={abonnementInfo.jours_restants} 
              max={30}
              variant={status === 'active' ? 'success' : status === 'expiring' ? 'warning' : 'danger'}
              className="mb-4"
              style={{ 
                height: '8px', 
                borderRadius: DESIGN.borderRadius.full,
                background: 'rgba(255,255,255,0.1)'
              }}
            />
          </div>

          <div className="mt-auto">
            <Button 
              variant={status === 'expired' ? 'danger' : status === 'expiring' ? 'warning' : 'primary'}
              className="w-100 mb-3 py-3 fw-bold"
              onClick={() => navigate("/abonnementmembre")}
              style={{ 
                borderRadius: DESIGN.borderRadius.lg,
                fontSize: '1rem'
              }}
            >
              <FaCog className="me-2" />
              {status === 'expired' ? 'Renouveler maintenant' : 
               status === 'expiring' ? 'Renouveler l\'abonnement' : 
               'Gérer l\'abonnement'}
            </Button>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // === GRAPHIQUE 3D MODERNE ===
  const Modern3DChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <div style={{ height: "320px", position: "relative" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "flex-end", 
          justifyContent: "space-between", 
          height: "220px",
          padding: "0 30px",
          position: 'relative'
        }}>
          {/* Grille de fond */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'grid',
            gridTemplateRows: 'repeat(5, 1fr)',
            zIndex: 0
          }}>
            {[...Array(5)].map((_, i) => (
              <div key={i} style={{
                borderBottom: `1px solid ${DESIGN.colors.neutral[200]}`,
                opacity: 0.2
              }} />
            ))}
          </div>
          
          {data.map((item, index) => {
            const height = (item.value / maxValue) * 180;
            return (
              <div key={index} style={{ 
                textAlign: "center", 
                width: "50px", 
                position: "relative",
                zIndex: 1 
              }}>
                <OverlayTrigger
                  placement="top"
                  overlay={
                    <Tooltip style={{ borderRadius: DESIGN.borderRadius.md }}>
                      <div className="fw-bold">{item.value} activités</div>
                      <div className="text-success small">{item.month} {selectedYear}</div>
                    </Tooltip>
                  }
                >
                  <div
                    style={{
                      height: `${height}px`,
                      background: DESIGN.gradients.primary,
                      borderRadius: `${DESIGN.borderRadius.md} ${DESIGN.borderRadius.md} 0 0`,
                      margin: "0 5px",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      position: 'relative',
                      boxShadow: `0 4px 12px ${DESIGN.colors.primary.main}30`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scaleY(1.15)";
                      e.currentTarget.style.boxShadow = `0 8px 24px ${DESIGN.colors.primary.main}50`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scaleY(1)";
                      e.currentTarget.style.boxShadow = `0 4px 12px ${DESIGN.colors.primary.main}30`;
                    }}
                  >
                    {/* Effet 3D */}
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '4px',
                      background: 'rgba(255,255,255,0.3)',
                      borderRadius: `${DESIGN.borderRadius.md} ${DESIGN.borderRadius.md} 0 0`
                    }} />
                  </div>
                </OverlayTrigger>
                <div style={{ 
                  fontSize: "0.875rem", 
                  color: DESIGN.colors.neutral[700], 
                  marginTop: "12px", 
                  fontWeight: 600,
                  textTransform: "uppercase"
                }}>
                  {item.month}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Légende et statistiques */}
        <div className="d-flex justify-content-between align-items-center mt-6">
          <div>
            <h6 className="fw-bold mb-2">Activité mensuelle</h6>
            <div className="d-flex align-items-center gap-3">
              <div className="d-flex align-items-center">
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: DESIGN.gradients.primary,
                  borderRadius: '2px',
                  marginRight: '8px'
                }} />
                <small className="text-muted">Publications</small>
              </div>
              <div className="d-flex align-items-center">
                <div style={{
                  width: '12px',
                  height: '12px',
                  background: DESIGN.gradients.secondary,
                  borderRadius: '2px',
                  marginRight: '8px'
                }} />
                <small className="text-muted">Événements</small>
              </div>
            </div>
          </div>
          <div className="text-end">
            <div className="d-flex align-items-center justify-content-end mb-1">
              <FaArrowUp className="text-success me-2" />
              <span className="fw-bold text-success">+24%</span>
            </div>
            <small className="text-muted">vs mois dernier</small>
          </div>
        </div>
      </div>
    );
  };

  // === ACTIVITÉ RÉCENTE AMÉLIORÉE ===
  const EnhancedRecentActivity = () => (
    <Card className="border-0" style={{ 
      borderRadius: DESIGN.borderRadius.xl,
      background: 'white',
      boxShadow: DESIGN.shadows.lg,
      height: '100%'
    }}>
      <Card.Body className="p-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1 d-flex align-items-center">
              <FaBolt className="me-2" style={{ color: DESIGN.colors.primary.main }} />
              Activité récente
            </h5>
            <small className="text-muted">Dernières activités sur la plateforme</small>
          </div>
        </div>
        
        <ListGroup variant="flush">
          {recentData.length > 0 ? recentData.map((item, i) => {
            const typeConfig = {
              publication: { icon: FaBullhorn, color: DESIGN.colors.primary.main, bg: `${DESIGN.colors.primary.main}15` },
              evenement: { icon: FaCalendarAlt, color: DESIGN.colors.secondary.main, bg: `${DESIGN.colors.secondary.main}15` },
              message: { icon: FaEnvelope, color: DESIGN.colors.info.main, bg: `${DESIGN.colors.info.main}15` }
            }[item.type];
            
            return (
              <ListGroup.Item 
                key={i}
                className="border-0 px-0 py-4"
                style={{ 
                  borderBottom: i < recentData.length - 1 ? `1px solid ${DESIGN.colors.neutral[100]}` : 'none'
                }}
              >
                <div className="d-flex align-items-center">
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: DESIGN.borderRadius.lg,
                    background: typeConfig.bg,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: '16px',
                    flexShrink: 0
                  }}>
                    <typeConfig.icon size={20} style={{ color: typeConfig.color }} />
                  </div>
                  <div className="flex-grow-1">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="fw-bold mb-0" style={{ fontSize: '1rem' }}>
                        {item.titre || item.sujet}
                      </h6>
                      <Badge 
                        bg="light"
                        text="dark"
                        className="px-3 py-2"
                        style={{ 
                          fontSize: '0.75rem',
                          borderRadius: DESIGN.borderRadius.full,
                          fontWeight: 600
                        }}
                      >
                        {item.type === "publication" ? t("pub_abbr") : 
                         item.type === "evenement" ? t("event_abbr") : t("msg_abbr")}
                      </Badge>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <FaClock className="me-1" />
                        {new Date(item.date).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </small>
                      <div className="d-flex gap-2">
                        <Button size="sm" variant="outline-primary">
                          <FaEye size={12} />
                        </Button>
                        <Button size="sm" variant="outline-secondary">
                          <FaShare size={12} />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            );
          }) : loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <div className="text-center py-5 text-muted">
              <FaFileAlt size={48} className="mb-3 opacity-25" />
              <p className="mb-0">Aucune activité récente</p>
            </div>
          )}
        </ListGroup>
      </Card.Body>
    </Card>
  );

  // === PERFORMANCE WIDGET ===
  const PerformanceWidget = () => (
    <Card className="border-0" style={{ 
      borderRadius: DESIGN.borderRadius.xl,
      background: 'white',
      boxShadow: DESIGN.shadows.lg,
      height: '100%'
    }}>
      <Card.Body className="p-5">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h5 className="fw-bold mb-1 d-flex align-items-center">
              <FaChartBar className="me-2" style={{ color: DESIGN.colors.success.main }} />
              Performance
            </h5>
            <small className="text-muted">Votre activité cette semaine</small>
          </div>
          <Badge bg="light" text="success" className="px-3 py-2 fw-bold">
            <FaArrowUp className="me-1" />
            +12%
          </Badge>
        </div>
        
        <div className="text-center mb-4">
          <div style={{ position: 'relative', width: '140px', height: '140px', margin: '0 auto' }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: '2.5rem',
              fontWeight: '800',
              background: DESIGN.gradients.success,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>
              {performance}%
            </div>
            <svg width="140" height="140" viewBox="0 0 36 36" className="circular-chart">
              <path className="circle-bg"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="3"
              />
              <path className="circle"
                d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="3"
                strokeDasharray={`${performance}, 100`}
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#48bb78" />
                  <stop offset="100%" stopColor="#38a169" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
        
        <div className="row text-center">
          <Col xs={4}>
            <div className="fw-bold fs-3">{quickStats.today}</div>
            <small className="text-muted">Aujourd'hui</small>
          </Col>
          <Col xs={4}>
            <div className="fw-bold fs-3">{quickStats.week}</div>
            <small className="text-muted">Cette semaine</small>
          </Col>
          <Col xs={4}>
            <div className="fw-bold fs-3">{quickStats.month}</div>
            <small className="text-muted">Ce mois</small>
          </Col>
        </div>
      </Card.Body>
    </Card>
  );

  // === QUICK ACTIONS ===
  const QuickActions = () => (
    <Card className="border-0" style={{ 
      borderRadius: DESIGN.borderRadius.xl,
      background: 'white',
      boxShadow: DESIGN.shadows.lg,
      height: '100%'
    }}>
      <Card.Body className="p-5">
        <h5 className="fw-bold mb-4 d-flex align-items-center">
          <FaRocket className="me-2" style={{ color: DESIGN.colors.primary.main }} />
          Actions rapides
        </h5>
        
        <div className="row g-3">
          {[
            { label: "Nouvelle publication", icon: FaBullhorn, color: DESIGN.colors.primary.main, route: "/pubMembre/nouveau" },
            { label: "Créer un événement", icon: FaCalendarAlt, color: DESIGN.colors.secondary.main, route: "/evenementMembre/nouveau" },
            { label: "Envoyer un message", icon: FaEnvelope, color: DESIGN.colors.info.main, route: "/messageMembre/nouveau" },
            { label: "Appel d'offres", icon: FaFileSignature, color: DESIGN.colors.success.main, route: "/appeloffreMembre/nouveau" },
            { label: "Voir les statistiques", icon: FaRegChartBar, color: DESIGN.colors.warning.main, route: "/statistiques" },
            { label: "Gérer l'abonnement", icon: FaCreditCard, color: DESIGN.colors.premium.main, route: "/abonnementmembre" }
          ].map((action, i) => (
            <Col xs={6} key={i}>
              <Button 
                className="w-100 d-flex flex-column align-items-center justify-content-center p-4 border-0"
                style={{ 
                  background: `${action.color}10`,
                  color: action.color,
                  borderRadius: DESIGN.borderRadius.lg,
                  transition: 'all 0.3s ease',
                  height: '120px'
                }}
                onClick={() => navigate(action.route)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = action.color;
                  e.currentTarget.style.color = 'white';
                  e.currentTarget.style.transform = 'translateY(-4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = `${action.color}10`;
                  e.currentTarget.style.color = action.color;
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <action.icon size={24} className="mb-3" />
                <small className="fw-semibold text-center">{action.label}</small>
              </Button>
            </Col>
          ))}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="min-vh-100 d-flex" style={{ 
      background: DESIGN.gradients.bg,
      fontFamily: DESIGN.typography.fontFamily
    }}>
      <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />

      <main 
        className="flex-grow-1"
        style={{ 
          marginLeft: sidebarCollapsed ? "80px" : "280px", 
          padding: "2.5rem",
          transition: "margin 0.4s ease",
          minHeight: "calc(100vh - 80px)",
          maxWidth: '100%',
          overflowX: 'hidden'
        }}
      >
        <DashboardHeader />

        {/* Section principale avec statistiques */}
        <Row className="g-4 mb-5">
          <Col xl={9}>
            <Row className="g-4">
              <Col xl={3} lg={6}>
                <ModernStatCard 
                  icon={FaBullhorn}
                  value={stats.publications}
                  label={t("publications_total")}
                  trend={trendData.publications}
                  color={DESIGN.colors.primary.main}
                  gradient={DESIGN.gradients.primary}
                  onClick={() => navigate("/pubMembre")}
                  badge="Nouveau"
                />
              </Col>
              <Col xl={3} lg={6}>
                <ModernStatCard 
                  icon={FaCalendarAlt}
                  value={stats.evenements}
                  label={t("events_total")}
                  trend={trendData.evenements}
                  color={DESIGN.colors.secondary.main}
                  gradient={DESIGN.gradients.secondary}
                  onClick={() => navigate("/evenementMembre")}
                />
              </Col>
              <Col xl={3} lg={6}>
                <ModernStatCard 
                  icon={FaEnvelope}
                  value={stats.messages}
                  label={t("messages")}
                  trend={trendData.messages}
                  color={DESIGN.colors.info.main}
                  gradient={DESIGN.gradients.secondary}
                  onClick={() => navigate("/messageMembre")}
                />
              </Col>
              <Col xl={3} lg={6}>
                <ModernStatCard 
                  icon={FaFileAlt}
                  value={stats.tenders}
                  label="Appels d'offres"
                  trend={trendData.tenders}
                  color={DESIGN.colors.success.main}
                  gradient={DESIGN.gradients.success}
                  onClick={() => navigate("/appeloffreMembre")}
                  badge="Hot"
                />
              </Col>
            </Row>
          </Col>
          
          <Col xl={3}>
            <PremiumAbonnementCard />
          </Col>
        </Row>

        {/* Section graphique et performance */}
        <Row className="g-4 mb-5">
          <Col lg={8}>
            <Card className="border-0" style={{ 
              borderRadius: DESIGN.borderRadius.xl,
              background: 'white',
              boxShadow: DESIGN.shadows.lg
            }}>
              <Card.Body className="p-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div>
                    <h5 className="fw-bold mb-1 d-flex align-items-center">
                      <MdOutlineTrendingUp className="me-2" style={{ color: DESIGN.colors.primary.main }} />
                      Activité mensuelle
                    </h5>
                    <small className="text-muted">
                      Analyse de vos activités sur 12 mois • Année: {selectedYear}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      className="d-flex align-items-center"
                      onClick={refreshMonthlyData}
                      disabled={refreshing}
                    >
                      <FaSync className={refreshing ? "fa-spin me-2" : "me-2"} />
                      {refreshing ? "Rafraîchissement..." : "Rafraîchir"}
                    </Button>
                    <Dropdown>
                      <Dropdown.Toggle variant="light" size="sm">
                        {selectedYear} <FaCaretDown className="ms-2" />
                      </Dropdown.Toggle>
                      <Dropdown.Menu>
                        {availableYears.map(year => (
                          <Dropdown.Item 
                            key={year}
                            onClick={() => setSelectedYear(year)}
                            active={year === selectedYear}
                          >
                            {year}
                          </Dropdown.Item>
                        ))}
                      </Dropdown.Menu>
                    </Dropdown>
                  </div>
                </div>
                {loading || refreshing ? (
                  <div style={{ height: "320px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <Modern3DChart data={monthlyData} />
                )}
                <div className="mt-3 text-center small text-muted">
                  <FaInfoCircle className="me-1" />
                  Données basées sur vos publications, événements et messages
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <PerformanceWidget />
          </Col>
        </Row>

        {/* Section activité récente et actions rapides */}
        <Row className="g-4 mb-5">
          <Col lg={8}>
            <EnhancedRecentActivity />
          </Col>
          <Col lg={4}>
            <QuickActions />
          </Col>
        </Row>

        {/* Pied de page amélioré */}
        <div className="mt-6 pt-5 border-top">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-4">
              <small className="text-muted">
                © 2025 Plateforme Membre Premium. Tous droits réservés.
              </small>
              <div className="d-flex gap-3">
                <Button variant="link" className="text-muted p-0">
                  <small>Confidentialité</small>
                </Button>
                <Button variant="link" className="text-muted p-0">
                  <small>Conditions</small>
                </Button>
                <Button variant="link" className="text-muted p-0">
                  <small>Aide</small>
                </Button>
              </div>
            </div>
            <div className="d-flex align-items-center gap-3">
              <small className="text-muted d-flex align-items-center">
                <FaShieldAlt className="me-2" />
                Sécurisé
              </small>
              <small className="text-muted d-flex align-items-center">
                <FaSync className="me-2" />
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </small>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashMembre;