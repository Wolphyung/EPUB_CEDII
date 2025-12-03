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
    transition: 'all 0.2s ease',
    '&:focus': {
      borderColor: COLORS.primary,
      boxShadow: `0 0 0 0.25rem rgba(102, 126, 234, 0.25)`
    }
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
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    '&:hover:not(:disabled)': {
      transform: 'scale(1.05)',
      boxShadow: '0 6px 16px rgba(102, 126, 234, 0.4)'
    }
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
        return JSON.parse(userStr);
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
      
      const res = await axios.get(`${API_URL}/messages/member/${currentUser.id}`);
      
      if (res.data && Array.isArray(res.data)) {
        const conversationsData = res.data.map(conv => ({
          id: conv.id || Date.now(),
          sender: conv.sender || t("support_cedii"),
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
        setConversations([]);
        setStats(calculateStats([]));
      }
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
      setError(t("error_load_conversations"));
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
      setError(t("error_select_conversation"));
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
      setError(t("write_message_error"));
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
      const res = await axios.post(`${API_URL}/messages`, {
        membre_id: parseInt(currentUser.id),
        sender: currentUser.name,
        email: currentUser.email,
        category: selectedConv.category || "Support",
        content: content,
        conversation_id: selectedConv.id
      });

      setSuccess(t("message_sent_success"));
      setTimeout(() => setSuccess(null), 3000);

      // Recharger les conversations
      await fetchConversations();

    } catch (err) {
      console.error("Erreur envoi message:", err.response || err);
      setError(t("message_send_error"));
      
      setSelectedConv(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === tempMsg.id 
            ? { ...msg, error: true, content: `${content} (${t("send_failed")})` }
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
      
      const res = await axios.post(`${API_URL}/messages/start-conversation`, {
        membre_id: parseInt(currentUser.id),
        subject: t("new_conversation"),
        content: t("hello_support_message"),
        category: "Support"
      });

      if (res.data.conversation) {
        setSuccess(t("conversation_started_success"));
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
      console.error("Erreur démarrage conversation:", err);
      setError(t("error_start_conversation"));
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
      label: t("total_messages"),
      color: COLORS.primary
    },
    {
      icon: FaComments,
      value: stats.unread,
      label: t("unread_messages"),
      color: COLORS.warning
    },
    {
      icon: FaUserFriends,
      value: stats.withSupport,
      label: t("with_support"),
      color: COLORS.success
    },
    {
      icon: FaUserCircle,
      value: stats.withAdmin,
      label: t("with_admin"),
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
              {t("messages_admin_title")}
            </h1>
            <p style={{ color: COLORS.gray, fontSize: "1rem", margin: 0 }}>
              {t("messages_admin_subtitle")}
            </p>
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
            {t("new_message_button")}
          </Button>
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
            {error}
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

        {/* Main Content */}
        <Row className="g-4">
          {/* Conversations List */}
          <Col lg={4}>
            <Card className="shadow-sm border-0 h-100" style={styles.chatArea}>
              <Card.Header className="border-0" style={styles.chatHeader}>
                <div className="d-flex align-items-center justify-content-between">
                  <h5 className="mb-0" style={{ fontWeight: 600 }}>{t("conversations")}</h5>
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
                      placeholder={t("search_conversations")}
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
                    <p className="mt-3 text-muted">{t("loading_conversations")}</p>
                  </div>
                ) : filteredConversations.length > 0 ? (
                  <ListGroup variant="flush">
                    {filteredConversations.map(conv => (
                      <ListGroup.Item 
                        key={conv.id}
                        action
                        onClick={() => handleSelectConv(conv)}
                        style={styles.convoItem(selectedConv?.id === conv.id, conv.nonLu > 0)}
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
                              {new Date(conv.updated_at).toLocaleDateString()}
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
                            {conv.lastMessage?.content || t("no_messages")}
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
                    ))}
                  </ListGroup>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <FaComments size={48} className="mb-3 opacity-50" />
                    <h6 className="mb-2">{t("no_conversations")}</h6>
                    <p className="small mb-3">{t("start_first_conversation")}</p>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={startNewConversation}
                      className="rounded-pill px-4"
                    >
                      <FaPlus className="me-2" />
                      {t("start_conversation")}
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
                            {selectedConv.category} • {t("online")}
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
                          {t("print")}
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
                            setSuccess(t("copied_to_clipboard"));
                            setTimeout(() => setSuccess(null), 2000);
                          }}
                        >
                          <i className="fas fa-copy me-1"></i>
                          {t("copy")}
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
                            <div style={styles.bubble(isAdmin)}>
                              <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                {msg.content}
                                {msg.error && (
                                  <small className="d-block mt-1" style={{ 
                                    color: isAdmin ? 'rgba(255,255,255,0.8)' : COLORS.danger,
                                    fontSize: '0.8rem'
                                  }}>
                                    <i className="fas fa-exclamation-triangle me-1"></i>
                                    {t("message_not_sent")}
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
                        <h5 className="mb-2">{t("no_messages_in_conversation")}</h5>
                        <p className="mb-4">{t("send_first_message")}</p>
                        <div className="d-flex gap-2">
                          <Button 
                            variant="outline-primary" 
                            className="rounded-pill px-4"
                            onClick={() => setNewMessage(t("hello_message_example"))}
                          >
                            <FaArrowRight className="me-2" />
                            {t("suggest_message")}
                          </Button>
                          <Button 
                            variant="primary" 
                            className="rounded-pill px-4"
                            onClick={() => document.querySelector('input[type="text"]')?.focus()}
                          >
                            <FaPaperPlane className="me-2" />
                            {t("start_writing")}
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
                          placeholder={t("write_your_message")}
                          value={newMessage}
                          onChange={e => setNewMessage(e.target.value)}
                          style={styles.input}
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
                          style={styles.sendBtn}
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
                          {t("press_enter_to_send")}
                        </small>
                        <small className="text-muted">
                          {newMessage.length}/1000 {t("characters")}
                        </small>
                      </div>
                    </Form>
                  </div>
                </>
              ) : (
                <div className="d-flex flex-column justify-content-center align-items-center text-center h-100 py-5 text-muted">
                  <FaComments size={72} className="mb-4 opacity-50" />
                  <h4 className="mb-3">{t("no_conversation_selected")}</h4>
                  <p className="mb-4" style={{ maxWidth: '400px' }}>
                    {t("select_conversation_to_start")}
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
                    {t("start_new_conversation")}
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

      {/* Custom CSS */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .list-group-item:hover {
          background-color: rgba(0,0,0,0.02) !important;
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
      `}</style>
    </div>
  );
};

export default MessagerieMembre;