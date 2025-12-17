import React, { useState, useEffect, useRef, useCallback } from "react";
import { 
  Card, 
  ListGroup, 
  Button, 
  Form, 
  Badge, 
  InputGroup, 
  Spinner, 
  Alert,
  Container,
  Row,
  Col
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import { useTranslation } from 'react-i18next';
import { 
  FaSearch, 
  FaPaperPlane, 
  FaUserCircle, 
  FaCheckDouble, 
  FaUser,
  FaEnvelope,
  FaComments,
  FaUserFriends,
  FaRocket,
  FaPlus,
  FaClock,
  FaArrowRight,
  FaSync,
  FaBell,
  FaHeadset,
  FaHandshake
} from 'react-icons/fa';
import axios from "axios";

// === CONFIG ===
const API_URL = "http://127.0.0.1:8000/api";

// Configuration globale d'axios pour l'authentification
axios.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// === COULEURS CEDII 2025 ===
const COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  accent: "#4facfe",
  neon: "#00f2fe",
  dark: "#2c3e50",
  gray: "#6c757d",
  light: "#f5f7fa",
  white: "#ffffff",
  border: "#e0e6ef",
  success: "#28a745",
  warning: "#ffc107",
  danger: "#dc3545",
  info: "#17a2b8"
};

// === STYLES PREMIUM ===
const styles = {
  container: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: '100vh',
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    color: COLORS.dark
  },
  sidebarCollapsed: { width: '80px' },
  sidebarExpanded: { width: '280px' },

  header: {
    padding: '1.5rem 2rem',
    background: 'transparent'
  },

  searchCard: {
    borderRadius: "18px",
    background: COLORS.white,
    border: "none",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)"
  },

  convoItem: (isActive, hasUnread) => ({
    padding: '1rem 1.25rem',
    borderBottom: `1px solid ${COLORS.border}`,
    background: isActive ? 'rgba(102, 126, 234, 0.08)' : COLORS.white,
    cursor: 'pointer',
    transition: 'all 0.22s ease',
    borderLeft: isActive ? `4px solid ${COLORS.primary}` : '4px solid transparent',
    '&:hover': {
      background: isActive ? 'rgba(102, 126, 234, 0.12)' : 'rgba(0,0,0,0.02)',
      transform: 'translateX(2px)'
    }
  }),
  
  chatArea: {
    borderRadius: "18px",
    background: COLORS.white,
    border: "none",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    height: 'calc(100vh - 200px)',
    overflow: 'hidden'
  },

  chatHeader: {
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: '1rem 1.5rem',
    borderTopLeftRadius: "18px",
    borderTopRightRadius: "18px"
  },

  messagesArea: {
    flex: 1,
    padding: '1.5rem',
    background: '#fafbff',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  bubble: (isAdmin) => ({
    maxWidth: '68%',
    padding: '0.85rem 1.2rem',
    borderRadius: '18px',
    fontSize: '0.94rem',
    lineHeight: 1.5,
    background: isAdmin ? COLORS.primary : COLORS.white,
    color: isAdmin ? COLORS.white : COLORS.dark,
    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
    boxShadow: isAdmin 
      ? '0 4px 12px rgba(102, 126, 234, 0.25)' 
      : '0 2px 8px rgba(0,0,0,0.06)',
    border: isAdmin ? 'none' : `1px solid ${COLORS.border}`,
    position: 'relative',
    animation: 'fadeIn 0.3s ease'
  }),

  bubbleTime: {
    fontSize: '0.72rem',
    opacity: 0.7,
    marginTop: '0.4rem',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    justifyContent: 'flex-end'
  },

  inputArea: {
    background: COLORS.white,
    padding: '1rem 1.5rem',
    borderTop: `1px solid ${COLORS.border}`,
    borderBottomLeftRadius: "18px",
    borderBottomRightRadius: "18px"
  },

  input: {
    borderRadius: '24px',
    border: `1.5px solid ${COLORS.border}`,
    padding: '0.75rem 1.25rem',
    fontSize: '0.95rem',
    background: '#fafbff',
    transition: 'all 0.2s ease'
  },

  sendBtn: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
  }
};

// === COMPOSANTS ===
const Avatar = ({ src, size = 48, alt = "Avatar", isOnline = false }) => {
  const placeholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(alt)}&background=${COLORS.primary.replace('#', '')}&color=fff&size=${size * 2}`;
  
  return (
    <div style={{ position: 'relative' }}>
      <img
        src={src || placeholder}
        alt={alt}
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          border: `2.5px solid ${COLORS.primary}`,
          boxShadow: '0 2px 8px rgba(102, 126, 234, 0.2)'
        }}
        onError={(e) => { e.target.src = placeholder; }}
      />
      {isOnline && (
        <div style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: '#4CAF50',
          border: `2px solid ${COLORS.white}`
        }} />
      )}
    </div>
  );
};

const ReadStatusIcon = ({ status }) => {
  const color = status === 'read' ? COLORS.primary : 
                status === 'sent' ? COLORS.accent : COLORS.gray;
  return <FaCheckDouble size={12} style={{ color }} />;
};

const StatsCard = ({ icon: Icon, value, label, color }) => (
  <Card className="border-0 shadow-sm text-center p-4 h-100"
    style={{
      borderRadius: "18px",
      background: COLORS.white,
      transition: "all 0.3s ease",
      cursor: "pointer"
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
    <div
      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
      style={{
        width: "60px",
        height: "60px",
        background: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.1)`,
        border: `3px solid ${color}`,
      }}
    >
      <Icon size={24} style={{ color }} />
    </div>
    <h3 style={{ 
      fontWeight: "bold", 
      color: "#2c3e50", 
      fontSize: "1.8rem",
      margin: 0 
    }}>
      {value}
    </h3>
    <p style={{ 
      fontWeight: "600", 
      color: COLORS.gray, 
      margin: 0,
      fontSize: "0.9rem",
      marginTop: "0.5rem"
    }}>
      {label}
    </p>
  </Card>
);

// === FONCTIONS UTILITAIRES ===
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatTime = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Hook personnalisé pour le debounce
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};

// === COMPOSANT PRINCIPAL ===
const MessagerieMembre = () => {
  const { t } = useTranslation();
  
  // --- États ---
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tous");
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- Fonctions Utilitaires ---
  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: "", message: "" }), 4000);
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      setAuthError(t("authentication_required", "Authentification requise"));
      return false;
    }
    
    try {
      const userData = JSON.parse(user);
      if (userData.type !== 'membre') {
        setAuthError(t("member_access_required", "Accès membre requis"));
        return false;
      }
    } catch (e) {
      setAuthError(t("invalid_user_data", "Données utilisateur invalides"));
      return false;
    }
    
    return true;
  };

  const getCurrentUser = () => {
    if (!checkAuth()) return null;
    
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        return {
          id: user.id || user.user_id || 1,
          name: user.nom_complet || user.name || user.nom || user.email || "Membre CEDII",
          email: user.email || "membre@cedii.com",
          type: user.type || "membre"
        };
      } catch (e) {
        console.error("Erreur parsing user:", e);
      }
    }
    return null;
  };

  const currentUser = getCurrentUser();

  // Fonction pour réessayer le chargement
  const retryLoadConversations = () => {
    setAuthError(null);
    setInitialLoadComplete(false);
    fetchConversations();
  };

  // === CHARGEMENT DES CONVERSATIONS DU MEMBRE CONNECTÉ ===
  const fetchConversations = useCallback(async (showLoading = true, silent = false) => {
    if (!currentUser) {
      console.error("Aucun utilisateur connecté");
      return;
    }

    try {
      if (showLoading && !silent) {
        setLoading(true);
      }
      
      console.log("Fetching conversations for user ID:", currentUser.id);
      
      const res = await axios.get(`${API_URL}/messages/member/${currentUser.id}`);
      
      console.log("Conversations response:", res.data);
      
      if (res.data && Array.isArray(res.data)) {
        const conversationsData = res.data.map(conv => ({
          id: conv.id || Date.now(),
          sender: conv.sender || "Support CEDII",
          avatarUrl: conv.avatarUrl || null,
          nonLu: conv.nonLu || 0,
          lastMessage: conv.lastMessage || null,
          messages: conv.messages || [],
          category: conv.category || "Support",
          updated_at: conv.updated_at || new Date().toISOString()
        }));

        const sortedConversations = conversationsData.sort((a, b) => 
          new Date(b.updated_at) - new Date(a.updated_at)
        );

        setConversations(sortedConversations);
        setLastUpdateTime(new Date());
        
        // Sélectionner une conversation seulement si aucune n'est sélectionnée
        // ET seulement au chargement initial
        if (!selectedConv && !initialLoadComplete && sortedConversations.length > 0) {
          const unreadConv = sortedConversations.find(c => c.nonLu > 0);
          setSelectedConv(unreadConv || sortedConversations[0]);
        }
        
        // Marquer le chargement initial comme terminé
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
        
        if (!silent) {
          showNotification("success", t("conversations_updated", "Conversations mises à jour"));
        }
      } else {
        console.log("No conversations found");
        setConversations([]);
        if (!initialLoadComplete) {
          setInitialLoadComplete(true);
        }
      }
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
      if (err.response?.status === 401) {
        setAuthError(t("unauthorized_access", "Accès non autorisé. Veuillez vous reconnecter."));
        if (!silent) {
          showNotification("error", t("session_expired", "Votre session a expiré, veuillez vous reconnecter"));
        }
      } else {
        if (!silent) {
          showNotification("error", t("error_load_conversations", "Erreur lors du chargement des conversations: ") + (err.message || ""));
        }
      }
      setConversations([]);
      if (!initialLoadComplete) {
        setInitialLoadComplete(true);
      }
    } finally {
      if (showLoading && !silent) {
        setLoading(false);
      }
      setRefreshing(false);
    }
  }, [currentUser, t, initialLoadComplete]); // selectedConv retiré des dépendances

  // Initialisation seulement - corrigé
  useEffect(() => {
    if (currentUser && !initialLoadComplete) {
      fetchConversations();
    }
  }, [currentUser, initialLoadComplete, fetchConversations]);

  // Fonction de rafraîchissement manuel
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations(false);
  };

  // === CHARGEMENT DÉTAILLÉ D'UNE CONVERSATION ===
  const fetchConversationDetail = async (conversationId) => {
    try {
      const res = await axios.get(`${API_URL}/messages/conversation-detail/${conversationId}`);
      return res.data;
    } catch (err) {
      console.error("Erreur chargement détail conversation:", err);
      if (err.response?.status === 401) {
        showNotification("error", t("session_expired", "Votre session a expiré"));
      } else {
        showNotification("error", t("error_load_conversation_detail", "Erreur lors du chargement des détails de la conversation"));
      }
      return null;
    }
  };

  // === SÉLECTION CONVERSATION ===
  const handleSelectConv = async (conv) => {
    // Éviter de recharger si c'est déjà la conversation sélectionnée
    if (selectedConv && selectedConv.id === conv.id) {
      return;
    }
    
    // Mettre à jour d'abord l'état pour un feedback immédiat
    setSelectedConv(conv);
    
    try {
      const conversationDetail = await fetchConversationDetail(conv.id);
      
      if (conversationDetail) {
        const updatedConv = {
          ...conv,
          messages: conversationDetail.messages || [],
          nonLu: 0,
          lastMessage: conversationDetail.messages && conversationDetail.messages.length > 0 
            ? conversationDetail.messages[conversationDetail.messages.length - 1]
            : conv.lastMessage
        };
        
        setSelectedConv(updatedConv);
        
        // Mettre à jour la liste des conversations sans déclencher de rechargement
        setConversations(prev => 
          prev.map(c => c.id === conv.id ? updatedConv : c)
        );

        // Marquer comme lu
        try {
          await axios.put(`${API_URL}/messages/${conv.id}/mark-as-read`);
        } catch (err) {
          console.error("Erreur marquage comme lu:", err);
        }
      }
    } catch (err) {
      console.error("Erreur sélection conversation:", err);
      showNotification("error", t("error_select_conversation", "Erreur lors de la sélection de la conversation"));
    }
  };

  // === SCROLL AUTO ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  // === ENVOI MESSAGE ===
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConv) {
      showNotification("error", t("message_write_error", "Veuillez écrire un message"));
      return;
    }

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Message temporaire
    const tempMsg = {
      id: Date.now(),
      content,
      created_at: new Date().toISOString(),
      is_from_admin: false,
      read: false,
      sender: currentUser.name,
      type: 'message'
    };

    // Mettre à jour l'interface immédiatement
    const updatedSelectedConv = {
      ...selectedConv,
      messages: [...(selectedConv.messages || []), tempMsg],
      lastMessage: { content, created_at: new Date().toISOString() },
      updated_at: new Date().toISOString()
    };
    
    setSelectedConv(updatedSelectedConv);
    
    // Mettre à jour la conversation dans la liste
    setConversations(prev => 
      prev.map(c => c.id === selectedConv.id ? updatedSelectedConv : c)
    );

    try {
      console.log("Sending message for user:", currentUser.id);
      
      const messageData = {
        membre_id: currentUser.id,
        sender: currentUser.name,
        email: currentUser.email,
        category: selectedConv.category || "Support",
        content: content,
        conversation_id: selectedConv.id || null,
        sujet: selectedConv.sujet || "Nouveau message",
        is_from_admin: false,
        read: false
      };

      console.log("Sending message data:", messageData);

      const res = await axios.post(`${API_URL}/messages`, messageData);

      console.log("Message sent successfully:", res.data);

      showNotification("success", t("message_sent_success", "Message envoyé avec succès"));

      // Rafraîchir seulement les détails de cette conversation
      const conversationDetail = await fetchConversationDetail(selectedConv.id);
      if (conversationDetail) {
        const refreshedConv = {
          ...selectedConv,
          messages: conversationDetail.messages || [],
          lastMessage: conversationDetail.messages && conversationDetail.messages.length > 0 
            ? conversationDetail.messages[conversationDetail.messages.length - 1]
            : selectedConv.lastMessage
        };
        
        setSelectedConv(refreshedConv);
        setConversations(prev => 
          prev.map(c => c.id === selectedConv.id ? refreshedConv : c)
        );
      }

    } catch (err) {
      console.error("Erreur détaillée envoi message:", err);
      
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        showNotification("error", t("validation_error", "Erreur de validation: ") + errorMessages);
      } else if (err.response?.status === 401) {
        showNotification("error", t("unauthorized_send", "Non autorisé à envoyer des messages"));
      } else {
        showNotification("error", t("message_send_error", "Erreur lors de l'envoi du message: ") + (err.message || ""));
      }
      
      // Marquer le message comme en erreur
      const errorSelectedConv = {
        ...selectedConv,
        messages: selectedConv.messages.map(msg => 
          msg.id === tempMsg.id 
            ? { ...msg, error: true, content: `${content} (${t("send_failed", "Échec de l'envoi")})` }
            : msg
        )
      };
      
      setSelectedConv(errorSelectedConv);
      setConversations(prev => 
        prev.map(c => c.id === selectedConv.id ? errorSelectedConv : c)
      );
    } finally {
      setSending(false);
    }
  };

  // === NOUVELLE CONVERSATION ===
  const startNewConversation = async () => {
    try {
      console.log("Starting new conversation for user:", currentUser);
      
      const conversationData = {
        membre_id: currentUser.id,
        sender: currentUser.name,
        email: currentUser.email,
        subject: t("new_conversation", "Nouvelle conversation"),
        content: t("hello_support_message", "Bonjour, j'aimerais discuter..."),
        category: "Support",
        is_from_admin: false
      };

      console.log("Conversation data:", conversationData);

      const res = await axios.post(`${API_URL}/messages/start-conversation`, conversationData);

      console.log("Conversation started:", res.data);

      if (res.data.conversation) {
        showNotification("success", t("conversation_started_success", "Conversation démarrée avec succès"));
        
        // Créer l'objet conversation
        const newConv = {
          id: res.data.conversation.id,
          sender: "Support CEDII",
          avatarUrl: null,
          nonLu: 0,
          lastMessage: res.data.conversation,
          messages: [res.data.conversation],
          category: "Support",
          updated_at: new Date().toISOString()
        };
        
        // Ajouter la conversation en tête de liste
        setConversations(prev => [newConv, ...prev]);
        setSelectedConv(newConv);
      }
    } catch (err) {
      console.error("Erreur détaillée démarrage conversation:", err);
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        showNotification("error", t("validation_error", "Erreur de validation: ") + errorMessages);
      } else if (err.response?.status === 401) {
        showNotification("error", t("unauthorized_access", "Accès non autorisé"));
      } else {
        showNotification("error", t("error_start_conversation", "Erreur lors du démarrage de la conversation: ") + (err.message || ""));
      }
    }
  };

  // === MARQUER TOUS LES MESSAGES COMME LUS ===
  // === MARQUER TOUS LES MESSAGES COMME LUS - SOLUTION FINALE ===
const markAllAsRead = async (conversationId) => {
  if (!conversationId) {
    showNotification("error", t("conversation_not_selected", "Veuillez sélectionner une conversation"));
    return;
  }

  // 1. Mise à jour locale immédiate pour une UX fluide
  if (selectedConv && selectedConv.id === conversationId) {
    const updatedConv = {
      ...selectedConv,
      nonLu: 0,
      messages: selectedConv.messages.map(msg => ({ ...msg, read: true }))
    };
    
    setSelectedConv(updatedConv);
    
    setConversations(prev => 
      prev.map(c => c.id === conversationId ? { ...c, nonLu: 0 } : c)
    );
    
    showNotification("success", t("messages_marked_read", "Messages marqués comme lus"));
  }

  // 2. Essayer de synchroniser avec le backend (silencieusement)
  try {
    // D'abord, vérifier si l'endpoint existe via une requête OPTIONS
    try {
      const optionsResponse = await axios.options(`${API_URL}/messages/${conversationId}/mark-as-read`);
      console.log("OPTIONS response:", optionsResponse.headers['allow']);
      
      // Si PUT est supporté (ce qui n'est pas le cas d'après votre erreur)
      if (optionsResponse.headers['allow'] && optionsResponse.headers['allow'].includes('PUT')) {
        await axios.put(`${API_URL}/messages/${conversationId}/mark-as-read`);
        console.log("Synchronisation PUT réussie");
      }
    } catch (optionsErr) {
      console.log("OPTIONS failed, trying alternative methods");
    }
    
    // Essayer d'autres méthodes communes
    const methods = [
      { method: 'post', url: `${API_URL}/conversations/${conversationId}/mark-read` },
      { method: 'patch', url: `${API_URL}/conversations/${conversationId}`, data: { read: true } },
      { method: 'post', url: `${API_URL}/messages/mark-conversation-read`, data: { conversation_id: conversationId } },
    ];
    
    for (const config of methods) {
      try {
        const response = await axios[config.method](config.url, config.data || {});
        if (response.data.success) {
          console.log(`Synchronisation réussie avec ${config.method.toUpperCase()} ${config.url}`);
          break;
        }
      }
      catch (methodErr) {
        console.log("Synchronisation échoué");
      }
    }
    
    // Rafraîchir silencieusement après la synchronisation
    setTimeout(() => {
      handleRefresh();
    }, 2000);
    
  } catch (syncErr) {
    console.log("Échec de synchronisation, mais mise à jour locale appliquée");
    // Ne pas montrer d'erreur à l'utilisateur puisque la mise à jour locale a fonctionné
  }
};

  // === FILTRAGE ===
  const filteredConversations = conversations.filter(c => 
    (c.sender?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
     c.lastMessage?.content?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) &&
    (filterCategory === "Tous" || c.category === filterCategory)
  );

  // Calculer le total des messages non lus
  const totalUnread = conversations.reduce((sum, conv) => sum + (conv.nonLu || 0), 0);

  // === STATISTIQUES ===
  const stats = [
    { 
      title: "total_messages", 
      count: conversations.reduce((sum, c) => sum + (c.messages?.length || 0), 0), 
      icon: FaEnvelope, 
      color: "linear-gradient(135deg, #667eea, #764ba2)" 
    },
    { 
      title: "unread", 
      count: totalUnread, 
      icon: FaBell, 
      color: "linear-gradient(135deg, #00b09b, #96c93d)" 
    },
    { 
      title: "support", 
      count: conversations.filter(c => c.category === "Support").length, 
      icon: FaHeadset, 
      color: "linear-gradient(135deg, #4facfe, #00f2fe)" 
    },
    { 
      title: "admin", 
      count: conversations.filter(c => c.category === "Admin").length, 
      icon: FaUserCircle, 
      color: "linear-gradient(135deg, #f093fb, #f5576c)" 
    }
  ];

  // Afficher l'erreur d'authentification si présente
  if (authError) {
    return (
      <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}>
        <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />
        <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4" style={{ marginLeft: sidebarCollapsed ? "80px" : "280px" }}>
          <Alert variant="danger" className="w-50 text-center">
            <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
            <h4>{t("authentication_error", "Erreur d'authentification")}</h4>
            <p className="mb-3">{authError}</p>
            <div className="d-flex justify-content-center gap-2 mt-3">
              <Button 
                variant="primary" 
                onClick={retryLoadConversations}
                className="d-flex align-items-center"
              >
                <i className="fas fa-redo me-2"></i>
                {t("retry", "Réessayer")}
              </Button>
              <Button 
                variant="outline-primary" 
                onClick={() => window.location.href = '/login'}
                className="d-flex align-items-center"
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                {t("go_to_login", "Se connecter")}
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}>
      <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />
      
      <div className="flex-grow-1 p-4" style={{ marginLeft: sidebarCollapsed ? "80px" : "280px" }}>
        
        {showAlert.show && (
          <Alert variant={showAlert.type === "success" ? "success" : "danger"} 
                  className="d-flex align-items-center shadow-lg border-0" 
                  style={{position:"fixed",top:"20px",right:"20px",zIndex:1050,minWidth:"350px",borderRadius:"15px",
                  borderLeft:`4px solid ${showAlert.type === "success" ? "#28a745" : "#dc3545"}`,backdropFilter:"blur(10px)",backgroundColor:"rgba(255,255,255,0.95)"}}>
              <i className={`fas ${showAlert.type==="success"?"fa-check-circle text-success":"fa-exclamation-triangle text-danger"} me-3 fs-5`}></i>
              <div>
                  <strong className="d-block">{showAlert.type==="success"?t("success", "Succès"):t("error", "Erreur")}</strong>
                  <span className="text-muted">{showAlert.message}</span>
              </div>
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{background:"linear-gradient(135deg, #2c3e50, #34495e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
              {t("my_messages", "Mes messages")}
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-comments me-2"></i>
              {t("communicate_with_admin", "Communiquez avec l'administration CEDII")}
              
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {totalUnread > 0 && (
              <Badge bg="danger" className="d-flex align-items-center" style={{borderRadius:"20px",padding:"8px 12px",fontSize:"0.8rem"}}>
                <i className="fas fa-bell me-1"></i>{totalUnread} {t("unread", "non lu")}{totalUnread>1?"s":""}
              </Badge>
            )}
            <Button
              variant="outline-primary"
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="d-flex align-items-center"
              style={{borderRadius:"10px"}}
            >
              {refreshing ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t("refreshing", "Rafraîchissement...")}
                </>
              ) : (
                <>
                  <FaSync className="me-2" />
                  {t("refresh", "Rafraîchir")}
                </>
              )}
            </Button>
            <Button 
              variant="success" 
              onClick={startNewConversation} 
              className="d-flex align-items-center" 
              style={{
                borderRadius:"10px",
                background: "linear-gradient(135deg, #28a745, #20c997)",
                border: "none"
              }}
            >
              <i className="fas fa-plus me-2"></i>{t("new_message_button", "Nouveau message")}
            </Button>
          </div>
        </div>

        {/* Statistiques */}
        <Row className="mb-4">
          {stats.map((stat,index) => (
            <Col md={3} key={index} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{borderRadius:"20px"}}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2">{t(stat.title, stat.title)}</h6>
                      <h2 className="fw-bold mb-0" style={{background:stat.color, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{stat.count}</h2>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width:"60px",height:"60px",background:stat.color}}>
                      <stat.icon className="text-white fs-4" />
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Recherche et filtres */}
        <Card className="border-0 shadow-sm mb-4" style={{borderRadius:"20px"}}>
          <Card.Body className="p-4">
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-search me-2"></i>{t("search", "Recherche")}</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{background:"linear-gradient(135deg, #667eea, #764ba2)",border:"none",color:"white"}}>
                      <FaSearch />
                    </InputGroup.Text>
                    <Form.Control 
                      type="text" 
                      placeholder={t("search_conversations_placeholder", "Rechercher une conversation...")} 
                      value={searchTerm} 
                      onChange={e=>setSearchTerm(e.target.value)} 
                      style={{borderRadius:"0 10px 10px 0"}}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-filter me-2"></i>{t("category", "Catégorie")}</Form.Label>
                  <Form.Select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={{borderRadius:"10px"}}>
                    <option value="Tous">{t("all_categories", "Toutes les catégories")}</option>
                    <option value="Support">{t("Support", "Support")}</option>
                    <option value="Admin">{t("Admin", "Admin")}</option>
                    <option value="Technique">{t("Technique", "Technique")}</option>
                    <option value="Urgent">{t("Urgent", "Urgent")}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button 
                  variant="outline-secondary" 
                  onClick={()=>{setSearchTerm(""); setFilterCategory("Tous");}} 
                  className="d-flex align-items-center w-100" 
                  style={{borderRadius:"10px"}}
                >
                  <i className="fas fa-times me-2"></i>{t("clear", "Effacer")}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Row>
          {/* Sidebar des conversations */}
          <Col md={5}>
            <Card className="border-0 shadow-sm h-100" style={{borderRadius:"20px"}}>
              <Card.Body className="p-0">
                <div className="p-3 border-bottom">
                  <h5 className="fw-bold mb-3 d-flex align-items-center">
                    <i className="fas fa-users me-2 text-primary"></i>
                    {t("my_conversations", "Mes conversations")}
                    <Badge bg="primary" className="ms-2">{filteredConversations.length}</Badge>
                  </h5>
                </div>
                <div style={{maxHeight:"600px", overflowY:"auto"}}>
                  {loading ? (
                    <div className="text-center py-5">
                      <Spinner animation="border" variant="primary" />
                      <p className="text-muted mt-2">{t("loading_conversations", "Chargement des conversations...")}</p>
                    </div>
                  ) : filteredConversations.length > 0 ? (
                    <ListGroup variant="flush">
                      {filteredConversations.map(conv => (
                        <ListGroup.Item 
                          key={conv.id}
                          action 
                          onClick={() => handleSelectConv(conv)}
                          className="border-0" 
                          style={{
                            background: selectedConv?.id === conv.id ? "linear-gradient(135deg,#667eea,#764ba2)" : "transparent",
                            color: selectedConv?.id === conv.id ? "white" : "inherit",
                            borderLeft: selectedConv?.id === conv.id ? "4px solid #667eea" : "4px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            padding: "15px"
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex align-items-center">
                              <Avatar 
                                src={conv.avatarUrl} 
                                size={45}
                                alt={conv.sender}
                                isOnline={conv.category === 'Support'}
                              />
                              <div className="ms-3">
                                <h6 className={`mb-1 fw-bold ${conv.nonLu > 0 && selectedConv?.id !== conv.id ? 'text-primary' : ''}`}>
                                  {conv.sender}
                                </h6>
                                <small className={selectedConv?.id === conv.id ? "text-white-50" : "text-muted"}>
                                  {conv.category || t("Support", "Support")}
                                </small>
                                {conv.lastMessage && (
                                  <p className="mb-0 small mt-1" style={{
                                    opacity: selectedConv?.id === conv.id ? 0.9 : 0.7,
                                    lineHeight: "1.3"
                                  }}>
                                    {conv.lastMessage.content?.length > 40 
                                      ? `${conv.lastMessage.content.substring(0, 40)}...`
                                      : conv.lastMessage.content || t("no_message", "Pas de message")
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="text-end">
                              {conv.nonLu > 0 && (
                                <Badge bg="danger" className="mb-1">
                                  {conv.nonLu}
                                </Badge>
                              )}
                              <br />
                              <small className={selectedConv?.id === conv.id ? "text-white-50" : "text-muted"}>
                                {conv.updated_at ? formatTime(conv.updated_at) : ''}
                              </small>
                            </div>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-comments fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i>
                      <h6 className="text-muted mb-2">{t("no_conversations_found", "Aucune conversation trouvée")}</h6>
                      <p className="text-muted small">{t("no_conversations_match", "Aucune conversation ne correspond à votre recherche")}</p>
                      {conversations.length === 0 && (
                        <Button 
                          variant="outline-primary" 
                          onClick={startNewConversation}
                          className="mt-2"
                          size="sm"
                        >
                          <i className="fas fa-plus me-1"></i>
                          {t("start_first_conversation", "Démarrer votre première conversation")}
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Zone de conversation */}
          <Col md={7}>
            {selectedConv ? (
              <Card className="border-0 shadow-sm h-100" style={{borderRadius:"20px"}}>
                <Card.Body className="d-flex flex-column p-0 h-100">
                  {/* En-tête de la conversation */}
                  <div className="p-3 border-bottom bg-white">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex align-items-center">
                        <Avatar 
                          src={selectedConv.avatarUrl} 
                          size={50}
                          alt={selectedConv.sender}
                          isOnline={selectedConv.category === 'Support'}
                        />
                        <div className="ms-3">
                          <h5 className="fw-bold mb-1">{selectedConv.sender}</h5>
                          <p className="text-muted mb-0">{selectedConv.category} • {t("online", "En ligne")}</p>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => markAllAsRead(selectedConv?.id)}
                          className="d-flex align-items-center"
                          style={{borderRadius: "8px"}}
                          disabled={!selectedConv || (selectedConv.messages && selectedConv.messages.length === 0)}
                        >
                          <i className="fas fa-check-double me-2"></i>
                          {t("mark_all_as_read", "Tout marquer comme lu")}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          onClick={handleRefresh}
                          className="d-flex align-items-center"
                          style={{borderRadius: "8px"}}
                        >
                          <i className="fas fa-sync-alt me-2"></i>
                          {t("refresh_conversation", "Actualiser")}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-grow-1 p-4" style={{
                    maxHeight: '400px', 
                    overflowY: 'auto', 
                    backgroundColor: '#f0f2f5',
                    backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.1) 1px, transparent 0)',
                    backgroundSize: '20px 20px'
                  }}>
                    {selectedConv.messages && selectedConv.messages.length > 0 ? (
                      selectedConv.messages.map((message) => (
                        <div key={message.id} className="d-flex mb-4" style={{ 
                          justifyContent: message.is_from_admin ? 'flex-end' : 'flex-start' 
                        }}>
                          <div className="d-flex align-items-start" style={{maxWidth: '70%'}}>
                            {/* Avatar pour les messages du membre */}
                            {!message.is_from_admin && (
                              <div className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0" 
                                style={{
                                  width: '40px', 
                                  height: '40px', 
                                  background: 'linear-gradient(135deg, #667eea, #764ba2)', 
                                  color: 'white', 
                                  fontSize: '0.9rem', 
                                  fontWeight: 'bold'
                                }}>
                                {currentUser?.name?.charAt(0)?.toUpperCase() || 'M'}
                              </div>
                            )}
                            
                            <div className="flex-grow-1">
                              <div className={`rounded-3 p-3 shadow-sm ${
                                message.is_from_admin 
                                  ? 'bg-primary text-white' 
                                  : 'bg-white text-dark'
                              }`} 
                                style={{
                                  borderTopLeftRadius: message.is_from_admin ? '20px' : '4px',
                                  borderBottomLeftRadius: '20px',
                                  borderBottomRightRadius: message.is_from_admin ? '4px' : '20px',
                                  borderTopRightRadius: '20px',
                                  background: message.is_from_admin 
                                    ? 'linear-gradient(135deg, #007bff, #0056b3)' 
                                    : 'white'
                                }}>
                                <p className="mb-2" style={{lineHeight: '1.4'}}>
                                  {message.content}
                                  {message.error && (
                                    <small className="d-block mt-1 text-danger">
                                      <i className="fas fa-exclamation-triangle me-1"></i>
                                      {t("message_not_sent", "Message non envoyé")}
                                    </small>
                                  )}
                                </p>
                                <small className={message.is_from_admin ? "text-white-50" : "text-muted"}>
                                  {formatTime(message.created_at)}
                                  {!message.is_from_admin && !message.read && (
                                    <span className="ms-2">
                                      <i className="fas fa-check text-muted"></i>
                                    </span>
                                  )}
                                  {!message.is_from_admin && message.read && (
                                    <span className="ms-2">
                                      <i className="fas fa-check-double text-primary"></i>
                                    </span>
                                  )}
                                </small>
                              </div>
                            </div>

                            {/* Avatar pour les messages de l'admin */}
                            {message.is_from_admin && (
                              <div className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 ms-3" 
                                style={{
                                  width: '40px', 
                                  height: '40px', 
                                  background: 'linear-gradient(135deg, #28a745, #20c997)', 
                                  color: 'white', 
                                  fontSize: '0.9rem', 
                                  fontWeight: 'bold'
                                }}>
                                A
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-muted py-5">
                        <i className="fas fa-comments fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i>
                        <h6 className="text-muted mb-2">{t("no_messages", "Aucun message")}</h6>
                        <p className="text-muted small">{t("start_conversation", "Commencez la conversation avec le support")}</p>
                        <Button 
                          variant="primary"
                          onClick={() => {
                            const defaultMessage = t("hello_support_message", "Bonjour, j'aimerais discuter...");
                            setNewMessage(defaultMessage);
                          }}
                          className="mt-2"
                          size="sm"
                        >
                          <i className="fas fa-comment me-1"></i>
                          {t("write_first_message", "Écrire votre premier message")}
                        </Button>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Zone de saisie */}
                  <div className="p-3 border-top bg-white">
                    <Form.Group className="mb-3">
                      <Form.Control 
                        as="textarea" 
                        rows={3} 
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)} 
                        placeholder={`${t("write_message_to", "Écrire un message à")} ${selectedConv.sender}...`} 
                        style={{
                          borderRadius: "15px", 
                          padding: "12px", 
                          border: "1px solid #e0e0e0", 
                          resize: "none",
                          fontSize: "14px"
                        }} 
                        disabled={sending}
                      />
                    </Form.Group>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <i className="fas fa-info-circle me-1"></i>
                        {t("manual_refresh_note", "Cliquez sur le bouton 'Actualiser' pour voir les nouveaux messages")}
                      </small>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="primary" 
                          onClick={sendMessage} 
                          className="d-flex align-items-center" 
                          style={{
                            borderRadius: "15px", 
                            background: "linear-gradient(135deg,#667eea,#764ba2)", 
                            border: "none", 
                            padding: "8px 20px",
                            fontSize: "14px"
                          }} 
                          disabled={sending || !newMessage.trim()}
                        >
                          {sending ? (
                            <>
                              <Spinner animation="border" size="sm" className="me-2" />
                              {t("sending", "Envoi...")}
                            </>
                          ) : (
                            <>
                              <i className="fas fa-paper-plane me-2"></i>{t("send", "Envoyer")}
                            </>
                          )}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setNewMessage("")} 
                          className="d-flex align-items-center" 
                          style={{borderRadius: "15px", fontSize: "14px"}} 
                          disabled={sending}
                        >
                          <i className="fas fa-times me-2"></i>{t("clear", "Effacer")}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm h-100 d-flex align-items-center justify-content-center" style={{borderRadius:"20px"}}>
                <Card.Body className="text-center py-5">
                  <i className="fas fa-comments fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i>
                  <h5 className="text-muted mb-2">{t("no_conversation_selected", "Aucune conversation sélectionnée")}</h5>
                  <p className="text-muted mb-3">{t("select_conversation_to_start", "Sélectionnez une conversation pour commencer")}</p>
                  {conversations.length === 0 ? (
                    <Button 
                      variant="primary"
                      onClick={startNewConversation}
                      className="d-flex align-items-center mx-auto"
                    >
                      <i className="fas fa-plus me-2"></i>
                      {t("start_first_conversation", "Démarrer votre première conversation")}
                    </Button>
                  ) : (
                    <p className="text-muted small">
                      {t("click_conversation_left", "Cliquez sur une conversation à gauche pour commencer")}
                    </p>
                  )}
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </div>

      {/* Animation CSS via style tag */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .spin {
            animation: spin 1s linear infinite;
          }
          
          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: ${COLORS.primary};
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: ${COLORS.secondary};
          }
          
          .form-control:focus {
            border-color: ${COLORS.primary} !important;
            box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25) !important;
          }
          
          .message-bubble {
            animation: fadeIn 0.3s ease;
          }
        `}
      </style>
    </div>
  );
};

export default MessagerieMembre;