// src/pages/membre/MessagerieMembre.jsx

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
import LanguageSwitcher from "../../components/LanguageSwitcher";
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
  FaArrowRight
} from 'react-icons/fa';
import axios from "axios";

// === CONFIG ===
const API_URL = "http://127.0.0.1:8000/api";

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

// === COMPOSANT PRINCIPAL ===
const MessagerieMembre = () => {
  const { t } = useTranslation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    withSupport: 0,
    withAdmin: 0
  });
  
  const messagesEndRef = useRef(null);

  // Récupérer les infos du membre connecté
  const getCurrentUser = () => {
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
    return {
      id: 1,
      name: "Membre CEDII",
      email: "membre@cedii.com",
      type: "membre"
    };
  };

  const currentUser = getCurrentUser();

  // === INTERCEPTEUR AXIOS POUR L'AUTHENTIFICATION ===
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  // === STATISTIQUES ===
  const calculateStats = useCallback((convs) => {
    const total = convs.length;
    const unread = convs.reduce((sum, conv) => sum + (conv.nonLu || 0), 0);
    const withSupport = convs.filter(c => c.sender?.includes('Support') || c.category === 'Support').length;
    const withAdmin = convs.filter(c => c.sender?.includes('Admin') || c.category === 'Admin').length;
    
    return { total, unread, withSupport, withAdmin };
  }, []);

  // === CHARGEMENT DES CONVERSATIONS ===
  const fetchConversations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Fetching conversations for user ID:", currentUser.id);
      
      const res = await axios.get(`${API_URL}/messages/member/${currentUser.id}`);
      
      console.log("Conversations response:", res.data);
      
      if (res.data && Array.isArray(res.data)) {
        const conversationsData = res.data.map(conv => ({
          id: conv.id || Date.now(),
          sender: conv.sender || t("support_cedii", "Support CEDII"),
          avatarUrl: conv.avatarUrl || null,
          nonLu: conv.nonLu || 0,
          lastMessage: conv.lastMessage || null,
          messages: conv.messages || [],
          category: conv.category || "Support",
          updated_at: conv.updated_at || new Date().toISOString()
        }));

        setConversations(conversationsData);
        setStats(calculateStats(conversationsData));
        
        // Sélectionner la première conversation avec messages non lus, sinon la première
        const unreadConv = conversationsData.find(c => c.nonLu > 0);
        if (unreadConv) {
          setSelectedConv(unreadConv);
        } else if (conversationsData.length > 0) {
          setSelectedConv(conversationsData[0]);
        }
      } else {
        console.log("No conversations found or invalid response format");
        setConversations([]);
        setStats(calculateStats([]));
      }
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
      if (err.response?.status === 401) {
        setError(t("unauthorized_access", "Accès non autorisé. Veuillez vous reconnecter."));
      } else {
        setError(t("error_load_conversations", "Erreur lors du chargement des conversations: " + (err.message || "")));
      }
      setConversations([]);
      setStats(calculateStats([]));
    } finally {
      setLoading(false);
    }
  }, [currentUser.id, t, calculateStats]);

  useEffect(() => { 
    fetchConversations();
  }, [fetchConversations]);

  // === CHARGEMENT DÉTAILLÉ D'UNE CONVERSATION ===
  const fetchConversationDetail = async (conversationId) => {
    try {
      const res = await axios.get(`${API_URL}/messages/conversation-detail/${conversationId}`);
      return res.data;
    } catch (err) {
      console.error("Erreur chargement détail conversation:", err);
      return null;
    }
  };

  // === SÉLECTION CONVERSATION ===
  const handleSelectConv = async (conv) => {
    try {
      const conversationDetail = await fetchConversationDetail(conv.id);
      
      if (conversationDetail) {
        const updatedConv = {
          ...conv,
          messages: conversationDetail.messages || [],
          nonLu: 0
        };
        
        setSelectedConv(updatedConv);
        
        // Mettre à jour la liste des conversations
        setConversations(prev => 
          prev.map(c => c.id === conv.id ? updatedConv : c)
        );

        // Mettre à jour les stats
        setStats(prev => ({
          ...prev,
          unread: Math.max(0, prev.unread - conv.nonLu)
        }));

        // Marquer comme lu
        try {
          await axios.put(`${API_URL}/messages/${conv.id}/mark-as-read`);
        } catch (err) {
          console.error("Erreur marquage comme lu:", err);
        }
      } else {
        setSelectedConv(conv);
      }
    } catch (err) {
      console.error("Erreur sélection conversation:", err);
      setError(t("error_select_conversation", "Erreur lors de la sélection de la conversation"));
    }
  };

  // === SCROLL AUTO ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.messages]);

  // === ENVOI MESSAGE ===
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) {
      setError(t("write_message_error", "Veuillez écrire un message"));
      return;
    }

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);
    setError(null);

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
    setSelectedConv(prev => ({
      ...prev,
      messages: [...(prev.messages || []), tempMsg],
      lastMessage: { content, created_at: new Date().toISOString() }
    }));

    try {
      console.log("Sending message to conversation ID:", selectedConv.id);
      console.log("Current user ID:", currentUser.id);
      
      // Structure de données corrigée selon ce que Laravel attend
      const messageData = {
        membre_id: currentUser.id,
        sender: currentUser.name,
        email: currentUser.email,
        category: selectedConv.category || "Support",
        content: content,
        conversation_id: selectedConv.id || null,
        // Ajout des champs qui pourraient être requis par Laravel
        sujet: selectedConv.sujet || "Nouveau message",
        is_from_admin: false,
        read: false
      };

      console.log("Sending message data:", messageData);

      const res = await axios.post(`${API_URL}/messages`, messageData);

      console.log("Message sent successfully:", res.data);

      setSuccess(t("message_sent_success", "Message envoyé avec succès"));
      setTimeout(() => setSuccess(null), 3000);

      // Recharger les conversations
      await fetchConversations();

    } catch (err) {
      console.error("Erreur détaillée envoi message:", err);
      
      // Afficher les détails de l'erreur de validation
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        setError(t("validation_error", "Erreur de validation: ") + errorMessages);
      } else if (err.response?.status === 401) {
        setError(t("unauthorized_send", "Non autorisé à envoyer des messages"));
      } else {
        setError(t("message_send_error", "Erreur lors de l'envoi du message: ") + (err.message || ""));
      }
      
      // Marquer le message comme en erreur
      setSelectedConv(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === tempMsg.id 
            ? { ...msg, error: true, content: `${content} (${t("send_failed", "Échec de l'envoi")})` }
            : msg
        )
      }));
    } finally {
      setSending(false);
    }
  };

  // === NOUVELLE CONVERSATION ===
  const startNewConversation = async () => {
    try {
      setError(null);
      
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
        setSuccess(t("conversation_started_success", "Conversation démarrée avec succès"));
        await fetchConversations();
        
        // Sélectionner la nouvelle conversation
        setTimeout(() => {
          const newConv = conversations.find(c => c.id === res.data.conversation.id) || 
                         res.data.conversation;
          if (newConv) {
            setSelectedConv(newConv);
          }
        }, 500);
      }
    } catch (err) {
      console.error("Erreur détaillée démarrage conversation:", err);
      if (err.response?.status === 422) {
        const validationErrors = err.response.data.errors;
        const errorMessages = Object.values(validationErrors).flat().join(', ');
        setError(t("validation_error", "Erreur de validation: ") + errorMessages);
      } else {
        setError(t("error_start_conversation", "Erreur lors du démarrage de la conversation: ") + (err.message || ""));
      }
    }
  };

  // === FILTRAGE ===
  const filteredConversations = conversations.filter(c => 
    c.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.lastMessage?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // === STATISTIQUES ===
  const statsCards = [
    {
      icon: FaEnvelope,
      value: stats.total,
      label: t("total_messages", "Total messages"),
      color: COLORS.primary
    },
    {
      icon: FaComments,
      value: stats.unread,
      label: t("unread_messages", "Messages non lus"),
      color: COLORS.warning
    },
    {
      icon: FaUserFriends,
      value: stats.withSupport,
      label: t("with_support", "Avec support"),
      color: COLORS.success
    },
    {
      icon: FaUserCircle,
      value: stats.withAdmin,
      label: t("with_admin", "Avec admin"),
      color: COLORS.info
    }
  ];

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: styles.container.background }}>
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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 style={{ 
              color: "#2c3e50", 
              fontWeight: "bold", 
              fontSize: "2rem",
              marginBottom: "1rem"
            }}>
              {t("messages_admin_title", "Messagerie avec l'administration")}
            </h1>
            <p style={{ color: COLORS.gray, fontSize: "1rem", margin: 0 }}>
              {t("messages_admin_subtitle", "Communiquez directement avec l'équipe CEDII")}
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            <div className="text-end">
              <div style={{ fontSize: "0.9rem", color: COLORS.gray }}>{t("connected_as", "Connecté en tant que")}</div>
              <div style={{ fontWeight: "600", color: COLORS.primary }}>{currentUser.name}</div>
            </div>
            <Button
              onClick={startNewConversation}
              className="shadow-lg rounded-pill px-4 px-lg-5 py-2 py-lg-3 d-flex align-items-center"
              style={{
                background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                border: "none",
                fontWeight: "600",
                fontSize: "1rem",
                minWidth: "220px"
              }}
            >
              <FaPlus className="me-2" />
              {t("new_message_button", "Nouveau message")}
            </Button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert 
            variant="danger" 
            dismissible 
            onClose={() => setError(null)}
            className="shadow-sm border-0 mb-4"
            style={{ borderRadius: "15px" }}
          >
            <i className="fas fa-exclamation-circle me-2"></i>
            <strong>{t("error", "Erreur")}:</strong> {error}
          </Alert>
        )}

        {success && (
          <Alert 
            variant="success" 
            dismissible 
            onClose={() => setSuccess(null)}
            className="shadow-sm border-0 mb-4"
            style={{ borderRadius: "15px" }}
          >
            <i className="fas fa-check-circle me-2"></i>
            {success}
          </Alert>
        )}

        {/* Stats Cards */}
        <Row className="mb-5 g-4">
          {statsCards.map((stat, i) => (
            <Col xl={3} lg={6} md={6} key={i}>
              <StatsCard {...stat} />
            </Col>
          ))}
        </Row>

        {/* Debug Info (à retirer en production) */}
        {process.env.NODE_ENV === 'development' && (
          <Card className="mb-4 border-info">
            <Card.Body className="p-3">
              <small className="text-muted">
                <strong>Debug Info:</strong> User ID: {currentUser.id} | Conversations: {conversations.length} | 
                Token: {localStorage.getItem('token') ? 'Present' : 'Missing'}
              </small>
            </Card.Body>
          </Card>
        )}

        {/* Main Content */}
        <Row className="g-4">
          {/* Conversations List */}
          <Col lg={4}>
            <Card className="shadow-sm border-0 h-100" style={styles.chatArea}>
              <Card.Header className="border-0" style={styles.chatHeader}>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0" style={{ fontWeight: 600 }}>{t("conversations", "Conversations")}</h5>
                  <Badge pill bg="primary">
                    {filteredConversations.length}
                  </Badge>
                </div>
                <div className="mt-3">
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      background: 'transparent', 
                      borderRight: 'none',
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px'
                    }}>
                      <FaSearch size={14} style={{ color: COLORS.gray }} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder={t("search_conversations", "Rechercher des conversations...")}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                      style={{
                        borderLeft: 'none',
                        borderRadius: '0 12px 12px 0',
                        padding: '0.75rem',
                        fontSize: '0.95rem'
                      }}
                      className="border-start-0"
                    />
                  </InputGroup>
                </div>
              </Card.Header>
              
              <Card.Body className="p-0" style={{ overflowY: 'auto', height: 'calc(100vh - 400px)' }}>
                {loading ? (
                  <div className="text-center py-5">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-3 text-muted">{t("loading_conversations", "Chargement des conversations...")}</p>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <ListGroup variant="flush">
                    {filteredConversations.map(conv => {
                      const isActive = selectedConv?.id === conv.id;
                      const hasUnread = conv.nonLu > 0;
                      
                      return (
                        <ListGroup.Item 
                          key={conv.id}
                          action
                          onClick={() => handleSelectConv(conv)}
                          style={{
                            ...styles.convoItem(isActive, hasUnread),
                            backgroundColor: isActive ? 'rgba(102, 126, 234, 0.08)' : COLORS.white
                          }}
                          className="d-flex align-items-center"
                        >
                          <Avatar 
                            src={conv.avatarUrl} 
                            size={44} 
                            alt={conv.sender}
                            isOnline={conv.category === 'Support'}
                          />
                          <div className="ms-3 flex-grow-1" style={{ minWidth: 0 }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div style={{ 
                                fontWeight: conv.nonLu > 0 ? 700 : 600, 
                                color: conv.nonLu > 0 ? COLORS.primary : COLORS.dark,
                                fontSize: '0.95rem'
                              }}>
                                {conv.sender}
                              </div>
                              <small style={{ color: COLORS.gray, fontSize: '0.75rem' }}>
                                {conv.updated_at ? new Date(conv.updated_at).toLocaleDateString() : ''}
                              </small>
                            </div>
                            <div style={{ 
                              fontSize: '0.85rem',
                              color: conv.nonLu > 0 ? COLORS.dark : COLORS.gray,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              marginTop: '0.25rem'
                            }}>
                              {conv.lastMessage?.content || conv.category || t("no_messages", "Aucun message")}
                            </div>
                          </div>
                          {conv.nonLu > 0 && (
                            <Badge
                              pill
                              bg="primary"
                              style={{
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                minWidth: '20px',
                                height: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              {conv.nonLu}
                            </Badge>
                          )}
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <FaComments size={48} className="mb-3 opacity-50" />
                    <h6 className="mb-2">{t("no_conversations", "Aucune conversation")}</h6>
                    <p className="small mb-3">{t("start_first_conversation", "Commencez par démarrer votre première conversation")}</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={startNewConversation}
                      className="rounded-pill px-4"
                    >
                      <FaPlus className="me-2" />
                      {t("start_conversation", "Démarrer une conversation")}
                    </Button>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* Chat Area */}
          <Col lg={8}>
            <Card className="shadow-sm border-0 h-100" style={styles.chatArea}>
              {selectedConv ? (
                <>
                  <Card.Header className="border-0" style={styles.chatHeader}>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center">
                        <Avatar 
                          src={selectedConv.avatarUrl} 
                          size={44} 
                          alt={selectedConv.sender}
                          isOnline={selectedConv.category === 'Support'}
                        />
                        <div className="ms-3">
                          <h5 className="mb-0" style={{ fontWeight: 600 }}>{selectedConv.sender}</h5>
                          <small style={{ color: COLORS.accent, fontWeight: 500 }}>
                            {selectedConv.category} • {t("online", "En ligne")}
                          </small>
                        </div>
                      </div>
                      <div className="d-flex gap-2">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          className="rounded-pill px-3"
                          onClick={() => window.print()}
                        >
                          <i className="fas fa-print me-1"></i>
                          {t("print", "Imprimer")}
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          size="sm"
                          className="rounded-pill px-3"
                          onClick={() => {
                            const convText = selectedConv.messages
                              .map(m => `${m.sender}: ${m.content}`)
                              .join('\n');
                            navigator.clipboard.writeText(convText);
                            setSuccess(t("copied_to_clipboard", "Conversation copiée dans le presse-papier"));
                            setTimeout(() => setSuccess(null), 2000);
                          }}
                        >
                          <i className="fas fa-copy me-1"></i>
                          {t("copy", "Copier")}
                        </Button>
                      </div>
                    </div>
                  </Card.Header>

                  <div style={styles.messagesArea}>
                    {selectedConv.messages && selectedConv.messages.length > 0 ? (
                      selectedConv.messages.map(msg => {
                        const isAdmin = msg.is_from_admin;
                        const time = new Date(msg.created_at);
                        const isToday = new Date().toDateString() === time.toDateString();
                        
                        return (
                          <div key={msg.id} style={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            alignItems: isAdmin ? 'flex-end' : 'flex-start'
                          }}>
                            <div style={{
                              ...styles.bubble(isAdmin),
                              animation: 'fadeIn 0.3s ease'
                            }}>
                              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {msg.content}
                                {msg.error && (
                                  <small className="d-block mt-1" style={{ 
                                    color: isAdmin ? 'rgba(255,255,255,0.8)' : COLORS.danger,
                                    fontSize: '0.8rem'
                                  }}>
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    {t("message_not_sent", "Message non envoyé")}
                                  </small>
                                )}
                              </div>
                              <div style={styles.bubbleTime}>
                                <FaClock size={10} />
                                {isToday 
                                  ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                  : time.toLocaleDateString() + ' ' + time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                }
                                {!isAdmin && <ReadStatusIcon status={msg.read ? 'read' : 'sent'} />}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-5 text-muted flex-grow-1 d-flex flex-column justify-content-center align-items-center">
                        <FaComments size={56} className="mb-3 opacity-50" />
                        <h5 className="mb-2">{t("no_messages_in_conversation", "Aucun message dans cette conversation")}</h5>
                        <p className="mb-4">{t("send_first_message", "Envoyez le premier message pour commencer la discussion")}</p>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            className="rounded-pill px-4"
                            onClick={() => setNewMessage(t("hello_message_example", "Bonjour, j'aimerais avoir des informations sur..."))}
                          >
                            <FaArrowRight className="me-2" />
                            {t("suggest_message", "Message suggéré")}
                          </Button>
                          <Button 
                            variant="primary" 
                            className="rounded-pill px-4"
                            onClick={() => document.querySelector('input[type="text"]')?.focus()}
                          >
                            <FaPaperPlane className="me-2" />
                            {t("start_writing", "Commencer à écrire")}
                          </Button>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div style={styles.inputArea}>
                    <Form onSubmit={handleSendMessage}>
                      <InputGroup>
                        <Form.Control
                          placeholder={t("write_your_message", "Écrivez votre message...")}
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          style={{
                            ...styles.input,
                            borderColor: COLORS.border,
                            ':focus': {
                              borderColor: COLORS.primary,
                              boxShadow: `0 0 0 0.25rem rgba(102, 126, 234, 0.25)`
                            }
                          }}
                          disabled={sending}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e);
                            }
                          }}
                        />
                        <Button
                          type="submit"
                          disabled={!newMessage.trim() || sending}
                          style={{
                            ...styles.sendBtn,
                            ':hover:not(:disabled)': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
                            }
                          }}
                        >
                          {sending ? (
                            <Spinner animation="border" size="sm" color="white" />
                          ) : (
                            <FaPaperPlane size={18} color="#fff" />
                          )}
                        </Button>
                      </InputGroup>
                      <div className="d-flex justify-content-between mt-2">
                        <small className="text-muted">
                          {t("press_enter_to_send", "Appuyez sur Entrée pour envoyer")}
                        </small>
                        <small className="text-muted">
                          {newMessage.length}/1000 {t("characters", "caractères")}
                        </small>
                      </div>
                    </Form>
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center text-center h-100 py-5 text-muted">
                  <FaComments size={72} className="mb-4 opacity-50" />
                  <h4 className="mb-3">{t("no_conversation_selected", "Aucune conversation sélectionnée")}</h4>
                  <p className="mb-4" style={{ maxWidth: '400px' }}>
                    {t("select_conversation_to_start", "Sélectionnez une conversation pour commencer à discuter")}
                  </p>
                  <Button 
                    variant="primary" 
                    className="rounded-pill px-5 py-2"
                    onClick={startNewConversation}
                    style={{
                      background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
                      border: 'none'
                    }}
                  >
                    <FaRocket className="me-2" />
                    {t("start_new_conversation", "Démarrer une nouvelle conversation")}
                  </Button>
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>

      {/* Language Switcher in Footer */}
      <footer style={{ 
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.9)",
        padding: "10px",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <LanguageSwitcher />
      </footer>

      {/* Animation CSS via style tag */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
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
        `}
      </style>
    </div>
  );
};

export default MessagerieMembre;