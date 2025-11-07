import React, { useState, useEffect, useRef } from "react";
import { Card, ListGroup, Button, Form, Badge, InputGroup, Spinner } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import axios from "axios";
import { FaSearch, FaPaperPlane, FaUserCircle, FaCheckDouble, FaUser } from 'react-icons/fa';

// === CONFIG ===
const API_URL = "http://127.0.0.1:8000/api";
const getAuthenticatedMemberId = () => 123;

// === COULEURS CEDII 2025 ===
const COLORS = {
  primary: "#5B11EE",    // Violet principal
  secondary: "#0405BF",  // Bleu profond
  dark: "#02061E",       // Texte / fond sombre
  accent: "#0671B6",     // Bleu clair (accents)
  gray: "#5E5E5E",       // Texte secondaire
  light: "#f8f9fa",
  white: "#ffffff",
  border: "#e9ecef"
};

// === AVATAR FIABLE ===
const Avatar = ({ src, size = 44, alt = "Avatar" }) => {
  const placeholder = `https://placehold.co/${size}x${size}/${COLORS.secondary.replace('#', '')}/FFFFFF?text=${alt[0]}&font=roboto`;
  
  return (
    <img
      src={src || placeholder}
      alt={alt}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        objectFit: 'cover',
        border: `2.5px solid ${COLORS.primary}`,
        boxShadow: '0 2px 6px rgba(91, 17, 238, 0.15)'
      }}
      onError={(e) => { e.target.src = placeholder; }}
    />
  );
};

// === STATUT DE LECTURE ===
const ReadStatusIcon = ({ status }) => {
  const color = status === 'read' ? COLORS.primary : status === 'sent' ? COLORS.accent : COLORS.gray;
  return <FaCheckDouble size={12} style={{ color, opacity: status === 'sent' ? 0.7 : 1 }} />;
};

// === STYLES PREMIUM ===
const styles = {
  container: {
    background: COLORS.light,
    minHeight: '100vh',
    fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
    color: COLORS.dark
  },
  sidebar: { width: '280px', background: COLORS.white, borderRight: `1px solid ${COLORS.border}` },
  sidebarCollapsed: { width: '80px' },

  // Header messagerie
  header: {
    background: COLORS.secondary,
    color: COLORS.white,
    padding: '1rem 1.25rem',
    fontWeight: 600,
    fontSize: '1.1rem',
    letterSpacing: '0.3px'
  },

  // Recherche
  search: {
    background: COLORS.light,
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '0.6rem 1rem',
    fontSize: '0.925rem'
  },

  // Conversation item
  convoItem: (isActive, hasUnread) => ({
    padding: '0.9rem 1.25rem',
    borderBottom: `1px solid ${COLORS.border}`,
    background: isActive ? '#f0eaff' : COLORS.white,
    cursor: 'pointer',
    transition: 'all 0.22s ease',
    borderLeft: isActive ? `4px solid ${COLORS.primary}` : '4px solid transparent',
    position: 'relative'
  }),
  convoName: (unread) => ({
    fontWeight: unread ? 700 : 600,
    color: unread ? COLORS.primary : COLORS.dark,
    fontSize: '0.98rem'
  }),
  convoPreview: (unread) => ({
    fontSize: '0.86rem',
    color: unread ? COLORS.dark : COLORS.gray,
    fontWeight: unread ? 600 : 400,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '180px'
  }),

  // Chat header
  chatHeader: {
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: '0.85rem 1.25rem',
    fontWeight: 600,
    color: COLORS.dark
  },

  // Zone messages
  messagesArea: {
    flex: 1,
    padding: '1.25rem',
    background: COLORS.light,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

  // Bulles
  bubble: (isAdmin) => ({
    maxWidth: '68%',
    padding: '0.75rem 1.1rem',
    borderRadius: '14px',
    fontSize: '0.94rem',
    lineHeight: 1.45,
    background: isAdmin ? COLORS.primary : COLORS.white,
    color: isAdmin ? COLORS.white : COLORS.dark,
    alignSelf: isAdmin ? 'flex-end' : 'flex-start',
    boxShadow: isAdmin 
      ? '0 2px 8px rgba(91, 17, 238, 0.2)' 
      : '0 1px 4px rgba(0,0,0,0.08)',
    border: isAdmin ? 'none' : `1px solid ${COLORS.border}`,
    position: 'relative'
  }),

  bubbleTime: {
    fontSize: '0.7rem',
    opacity: 0.8,
    marginTop: '0.35rem',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    justifyContent: 'flex-end'
  },

  // Input
  inputArea: {
    background: COLORS.white,
    padding: '0.9rem 1.25rem',
    borderTop: `1px solid ${COLORS.border}`
  },
  input: {
    borderRadius: '26px',
    border: `1.5px solid ${COLORS.border}`,
    padding: '0.7rem 1.2rem',
    fontSize: '0.95rem',
    background: '#fdfdff',
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
  },
  sendBtn: {
    width: '46px',
    height: '46px',
    borderRadius: '50%',
    background: COLORS.primary,
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
    boxShadow: '0 3px 8px rgba(91, 17, 238, 0.3)'
  }
};

// === COMPOSANT PRINCIPAL ===
const MessagerieMembre = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const memberId = getAuthenticatedMemberId();

  // === CHARGEMENT DES MESSAGES ===
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/messages?member_id=${memberId}`);
      const data = res.data.map(msg => ({
        ...msg,
        nonLu: !msg.read ? 1 : 0,
        avatarUrl: msg.avatarUrl,
        replies: msg.replies || [
          { id: 1, content: "Bonjour, j'ai un problème avec ma commande.", created_at: new Date(Date.now() - 180000).toISOString(), admin_id: null, member_id: memberId, read_status: 'sent' },
          { id: 2, content: "Je prends en charge votre demande immédiatement.", created_at: new Date(Date.now() - 120000).toISOString(), admin_id: 1, member_id: null, read_status: 'read' },
          { id: 3, content: "Référence : CMD-2025-789", created_at: new Date(Date.now() - 60000).toISOString(), admin_id: null, member_id: memberId, read_status: 'sent' },
        ],
      }));
      setConversations(data);
      setSelectedConv(data[0] || null);
    } catch (err) {
      console.error("Erreur:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMessages(); }, [memberId]);

  // === SÉLECTION CONVERSATION ===
  const handleSelectConv = async (conv) => {
    if (conv.nonLu > 0) {
      await axios.post(`${API_URL}/messages/${conv.id}/mark-as-read`).catch(() => {});
    }
    const updated = { ...conv, nonLu: 0 };
    setConversations(prev => prev.map(c => c.id === conv.id ? updated : c));
    setSelectedConv(updated);
  };

  // === SCROLL AUTO ===
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv?.replies]);

  // === ENVOI MESSAGE ===
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConv) return;

    const content = newMessage.trim();
    setNewMessage("");

    const tempMsg = {
      id: Date.now(),
      content,
      created_at: new Date().toISOString(),
      member_id: memberId,
      admin_id: null,
      read_status: 'sent'
    };

    setSelectedConv(prev => ({ ...prev, replies: [...prev.replies, tempMsg] }));

    try {
      const res = await axios.post(`${API_URL}/messages/${selectedConv.id}/reply`, { content, member_id: memberId });
      setSelectedConv(res.data);
      setConversations(prev => prev.map(c => c.id === selectedConv.id ? res.data : c));
    } catch (err) {
      console.error("Erreur envoi:", err);
    }
  };

  const filtered = conversations.filter(c => c.sender.toLowerCase().includes(searchTerm.toLowerCase()));

  // === RENDU ===
  return (
    <div className="d-flex" style={styles.container}>
      {/* SIDEBAR */}
      <div style={sidebarCollapsed ? styles.sidebarCollapsed : styles.sidebar}>
        <MembreSidebar onCollapse={setSidebarCollapsed} />
      </div>

      <div className="d-flex flex-grow-1">
        {/* LISTE CONVERSATIONS */}
        <div style={{ width: '370px', background: COLORS.white, borderRight: `1px solid ${COLORS.border}` }}>
          <div style={styles.header} className="d-flex align-items-center">
            <FaUserCircle size={26} className="me-2" />
            Messagerie CEDII
          </div>

          <div className="p-3">
            <div className="d-flex align-items-center" style={styles.search}>
              <FaSearch size={15} style={{ color: COLORS.gray }} />
              <Form.Control
                placeholder="Rechercher un contact..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent shadow-none ms-2"
                style={{ fontSize: '0.92rem' }}
              />
            </div>
          </div>

          <div style={{ height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" size="sm" /> Chargement...
              </div>
            ) : filtered.length > 0 ? (
              filtered.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => handleSelectConv(conv)}
                  style={styles.convoItem(selectedConv?.id === conv.id, conv.nonLu > 0)}
                  className="d-flex align-items-center"
                >
                  <Avatar src={conv.avatarUrl} size={48} alt={conv.sender} />
                  <div className="ms-3 flex-grow-1">
                    <div style={styles.convoName(conv.nonLu > 0)}>{conv.sender}</div>
                    <div style={styles.convoPreview(conv.nonLu > 0)}>
                      {conv.replies[conv.replies.length - 1]?.content.slice(0, 38)}...
                    </div>
                  </div>
                  {conv.nonLu > 0 && (
                    <Badge
                      pill
                      style={{
                        background: COLORS.primary,
                        color: '#fff',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}
                    >
                      {conv.nonLu}
                    </Badge>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center text-muted py-5">Aucune conversation</div>
            )}
          </div>
        </div>

        {/* CHAT */}
        <div className="flex-grow-1 d-flex flex-column">
          {selectedConv ? (
            <>
              <div style={styles.chatHeader} className="d-flex align-items-center">
                <Avatar src={selectedConv.avatarUrl} size={42} alt={selectedConv.sender} />
                <div className="ms-3">
                  <div style={{ fontWeight: 600 }}>{selectedConv.sender}</div>
                  <small style={{ color: COLORS.accent, fontWeight: 500 }}>En ligne</small>
                </div>
              </div>

              <div style={styles.messagesArea}>
                {selectedConv.replies.map(msg => {
                  const isAdmin = !!msg.admin_id;
                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={styles.bubble(isAdmin)}>
                        <div>{msg.content}</div>
                        <div style={styles.bubbleTime}>
                          {new Date(msg.created_at).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                          {isAdmin && <ReadStatusIcon status={msg.read_status} />}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.inputArea}>
                <Form onSubmit={handleSendMessage}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Écrivez votre message..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      style={styles.input}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim()}
                      style={styles.sendBtn}
                      onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                      <FaPaperPlane size={19} color="#fff" />
                    </Button>
                  </InputGroup>
                </Form>
              </div>
            </>
          ) : (
            <div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center bg-white text-muted">
              <FaUserCircle size={72} className="mb-3 opacity-50" />
              <p style={{ fontSize: '1.1rem' }}>Sélectionnez une conversation</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagerieMembre;