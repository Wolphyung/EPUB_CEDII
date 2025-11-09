import React, { useState, useEffect, useRef } from "react";
import { Card, ListGroup, Button, Form, Badge, InputGroup, Spinner, Alert } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import axios from "axios";
import { FaSearch, FaPaperPlane, FaUserCircle, FaCheckDouble, FaUser } from 'react-icons/fa';

// === CONFIG ===
const API_URL = "http://127.0.0.1:8000/api";
const getAuthenticatedMemberId = () => {
  return localStorage.getItem('member_id') || 1; // Utiliser un ID valide
};

const getAuthenticatedMemberName = () => {
  return localStorage.getItem('member_name') || "Membre CEDII";
};

// === COULEURS CEDII 2025 ===
const COLORS = {
  primary: "#5B11EE",
  secondary: "#0405BF",
  dark: "#02061E",
  accent: "#0671B6",
  gray: "#5E5E5E",
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

  header: {
    background: COLORS.secondary,
    color: COLORS.white,
    padding: '1rem 1.25rem',
    fontWeight: 600,
    fontSize: '1.1rem',
    letterSpacing: '0.3px'
  },

  search: {
    background: COLORS.light,
    border: `1.5px solid ${COLORS.border}`,
    borderRadius: '12px',
    padding: '0.6rem 1rem',
    fontSize: '0.925rem'
  },

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

  chatHeader: {
    background: COLORS.white,
    borderBottom: `1px solid ${COLORS.border}`,
    padding: '0.85rem 1.25rem',
    fontWeight: 600,
    color: COLORS.dark
  },

  messagesArea: {
    flex: 1,
    padding: '1.25rem',
    background: COLORS.light,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },

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
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  
  const memberId = getAuthenticatedMemberId();
  const memberName = getAuthenticatedMemberName();

  // === CHARGEMENT DES CONVERSATIONS ===
  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Chargement des conversations pour le membre:", memberId);
      
      const res = await axios.get(`${API_URL}/messages/member/${memberId}`);
      console.log("Données reçues:", res.data);
      
      if (res.data && Array.isArray(res.data)) {
        const conversationsData = res.data.map(conv => ({
          id: conv.id || Date.now(),
          sender: conv.sender || "Support CEDII",
          avatarUrl: conv.avatarUrl || null,
          nonLu: conv.nonLu || 0,
          lastMessage: conv.lastMessage || null,
          messages: conv.messages || []
        }));

        setConversations(conversationsData);
        
        // Sélectionner la première conversation par défaut
        if (conversationsData.length > 0) {
          setSelectedConv(conversationsData[0]);
          console.log("Conversation sélectionnée:", conversationsData[0]);
        }
      } else {
        setConversations([]);
        console.log("Aucune conversation trouvée");
      }
    } catch (err) {
      console.error("Erreur chargement conversations:", err);
      setError("Erreur lors du chargement des conversations");
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // === CHARGEMENT DÉTAILLÉ D'UNE CONVERSATION ===
  const fetchConversationDetail = async (conversationId) => {
    try {
      console.log("Chargement détail conversation:", conversationId);
      const res = await axios.get(`${API_URL}/messages/conversation-detail/${conversationId}`);
      console.log("Détail conversation:", res.data);
      return res.data;
    } catch (err) {
      console.error("Erreur chargement détail conversation:", err);
      return null;
    }
  };

  useEffect(() => { 
    fetchConversations(); 
  }, [memberId]);

  // === SÉLECTION CONVERSATION ===
  const handleSelectConv = async (conv) => {
    try {
      console.log("Sélection conversation:", conv.id);
      
      // Charger les messages détaillés de la conversation
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

        // Marquer comme lu si nécessaire
        if (conv.nonLu > 0) {
          try {
            await axios.put(`${API_URL}/messages/${conv.id}/mark-as-read`);
          } catch (err) {
            console.error("Erreur marquage comme lu:", err);
          }
        }
      } else {
        // Si pas de détail, utiliser les messages de base
        setSelectedConv(conv);
      }
    } catch (err) {
      console.error("Erreur sélection conversation:", err);
      setError("Erreur lors de la sélection de la conversation");
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
      setError("Veuillez écrire un message");
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
      sender: memberName,
      type: 'message'
    };

    // Mettre à jour l'interface immédiatement
    setSelectedConv(prev => ({
      ...prev,
      messages: [...(prev.messages || []), tempMsg]
    }));

    try {
      console.log("Envoi message:", { memberId, memberName, content });
      
      // Envoyer le message au backend
      const res = await axios.post(`${API_URL}/messages`, {
        membre_id: parseInt(memberId),
        sender: memberName,
        email: `${memberId}@cedii.com`,
        category: "Support",
        content: content
      });

      console.log("Message envoyé avec succès:", res.data);

      // Recharger les conversations pour avoir les données fraîches
      await fetchConversations();

    } catch (err) {
      console.error("Erreur envoi message:", err.response || err);
      setError("Erreur lors de l'envoi du message");
      
      // En cas d'erreur, marquer le message temporaire comme erreur
      setSelectedConv(prev => ({
        ...prev,
        messages: prev.messages.map(msg => 
          msg.id === tempMsg.id 
            ? { ...msg, error: true, content: `${content} (Échec de l'envoi)` }
            : msg
        )
      }));
    } finally {
      setSending(false);
    }
  };

  // === DÉMARRER UNE NOUVELLE CONVERSATION ===
  const startNewConversation = async () => {
    try {
      setError(null);
      console.log("Démarrage nouvelle conversation pour:", memberId);
      
      const res = await axios.post(`${API_URL}/messages/start-conversation`, {
        membre_id: parseInt(memberId),
        subject: "Nouvelle conversation",
        content: "Bonjour, j'aimerais obtenir de l'aide."
      });

      console.log("Nouvelle conversation créée:", res.data);

      if (res.data.conversation) {
        // Recharger les conversations
        await fetchConversations();
      }
    } catch (err) {
      console.error("Erreur démarrage conversation:", err.response || err);
      setError("Erreur lors du démarrage de la conversation");
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <div style={styles.header} className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <FaUserCircle size={26} className="me-2" />
              Messagerie CEDII
            </div>
            <Button 
              variant="light" 
              size="sm"
              onClick={startNewConversation}
              style={{
                background: COLORS.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '0.3rem 0.8rem',
                fontSize: '0.8rem'
              }}
            >
              Nouveau
            </Button>
          </div>

          <div className="p-3">
            <div className="d-flex align-items-center" style={styles.search}>
              <FaSearch size={15} style={{ color: COLORS.gray }} />
              <Form.Control
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="border-0 bg-transparent shadow-none ms-2"
                style={{ fontSize: '0.92rem' }}
              />
            </div>
          </div>

          {error && (
            <Alert variant="danger" className="m-3">
              {error}
            </Alert>
          )}

          <div style={{ height: 'calc(100vh - 150px)', overflowY: 'auto' }}>
            {loading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" size="sm" /> Chargement...
              </div>
            ) : filteredConversations.length > 0 ? (
              filteredConversations.map(conv => (
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
                      {conv.lastMessage?.content?.slice(0, 38) || "Aucun message"}...
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
              <div className="text-center text-muted py-5">
                <FaUserCircle size={32} className="mb-2 opacity-50" />
                <div>Aucune conversation</div>
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="mt-2"
                  onClick={startNewConversation}
                >
                  Démarrer une conversation
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* ZONE DE CHAT */}
        <div className="flex-grow-1 d-flex flex-column">
          {selectedConv ? (
            <>
              <div style={styles.chatHeader} className="d-flex align-items-center">
                <Avatar src={selectedConv.avatarUrl} size={42} alt={selectedConv.sender} />
                <div className="ms-3">
                  <div style={{ fontWeight: 600 }}>{selectedConv.sender}</div>
                  <small style={{ color: COLORS.accent, fontWeight: 500 }}>
                    Support CEDII
                  </small>
                </div>
              </div>

              <div style={styles.messagesArea}>
                {selectedConv.messages && selectedConv.messages.length > 0 ? (
                  selectedConv.messages.map(msg => {
                    const isAdmin = msg.is_from_admin;
                    return (
                      <div key={msg.id} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                        <div style={styles.bubble(isAdmin)}>
                          <div>{msg.content}</div>
                          <div style={styles.bubbleTime}>
                            {new Date(msg.created_at).toLocaleTimeString('fr', { hour: '2-digit', minute: '2-digit' })}
                            {!isAdmin && <ReadStatusIcon status={msg.read ? 'read' : 'sent'} />}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted py-5">
                    <FaUserCircle size={48} className="mb-3 opacity-50" />
                    <div>Aucun message dans cette conversation</div>
                    <div className="small">Envoyez le premier message !</div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div style={styles.inputArea}>
                <Form onSubmit={handleSendMessage}>
                  <InputGroup>
                    <Form.Control
                      placeholder="Écrivez votre message au support..."
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      style={styles.input}
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      style={{
                        ...styles.sendBtn,
                        opacity: (!newMessage.trim() || sending) ? 0.6 : 1
                      }}
                      onMouseEnter={e => {
                        if (newMessage.trim() && !sending) {
                          e.target.style.transform = 'scale(1.05)';
                        }
                      }}
                      onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                    >
                      {sending ? (
                        <Spinner animation="border" size="sm" />
                      ) : (
                        <FaPaperPlane size={19} color="#fff" />
                      )}
                    </Button>
                  </InputGroup>
                </Form>
              </div>
            </>
          ) : (
            <div className="d-flex flex-column flex-grow-1 justify-content-center align-items-center bg-white text-muted">
              <FaUserCircle size={72} className="mb-3 opacity-50" />
              <p style={{ fontSize: '1.1rem' }}>Sélectionnez une conversation</p>
              <Button 
                variant="primary" 
                onClick={startNewConversation}
                className="mt-2"
              >
                Démarrer une nouvelle conversation
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagerieMembre;