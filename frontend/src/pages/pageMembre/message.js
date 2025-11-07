import React, { useState, useEffect, useRef } from "react";
import { Card, ListGroup, Button, Form, Badge, InputGroup, Spinner } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import axios from "axios";
// Ajout de FaUser pour l'avatar par défaut
import { FaSearch, FaPaperPlane, FaUserCircle, FaCheckDouble, FaUser } from 'react-icons/fa'; 

const API_URL = "http://127.0.0.1:8000/api"; 

// Fonction fictive pour récupérer l'ID utilisateur réel
const getAuthenticatedMemberId = () => {
    // REMPLACER cette fonction par votre logique d'authentification
    return 123; 
};

// --- NOUVEAU COMPOSANT : Gestion de l'affichage de l'avatar ---
const Avatar = ({ src, size = 40, alt = "Avatar" }) => {
    // Si une source d'image (src) est fournie
    if (src) {
        return (
            <img 
                src={src} 
                alt={alt} 
                style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} 
            />
        );
    }
    // Si aucune image n'est fournie, afficher l'icône par défaut
    return (
        <div style={{ 
            width: size, 
            height: size, 
            borderRadius: '50%', 
            backgroundColor: '#ccc', // Couleur de fond neutre
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center'
        }}>
            <FaUser size={size * 0.5} color="#fff" />
        </div>
    );
};
// --------------------------------------------------------------------


// Style pour l'arrière-plan du chat (simule le motif WhatsApp)
const chatBackgroundStyle = {
  backgroundImage: "url('https://www.transparenttextures.com/patterns/clean-gray-paper.png')", 
  backgroundColor: '#e5ddd5', 
  padding: '10px'
};

/**
 * Styles personnalisés pour les bulles de message (Amélioré).
 */
const messageBubbleStyle = (isAdminMessage) => ({
    backgroundColor: isAdminMessage ? '#dcf8c6' : '#ffffff', 
    borderRadius: isAdminMessage ? '7px 7px 0 7px' : '7px 7px 7px 0', 
    padding: '8px 10px 6px 10px', 
    maxWidth: '80%', 
    boxShadow: '0 1px 0.5px rgba(0, 0, 0, 0.10)',
    wordWrap: 'break-word',
    fontSize: '0.9rem',
    position: 'relative',
});

const MessagerieMembre = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false); 
  const messagesEndRef = useRef(null);

  const [memberId, setMemberId] = useState(getAuthenticatedMemberId());
  const memberEmail = "membre@example.com"; 

  // Composant pour le statut de lecture (double coche)
  const ReadStatusIcon = ({ status }) => {
    if (status === 'read') {
      return <FaCheckDouble size={10} style={{ color: '#53bdeb' }} />;
    }
    if (status === 'sent') {
        return <FaCheckDouble size={10} style={{ color: '#919191' }} />;
    }
    return <FaCheckDouble size={10} style={{ color: '#919191', opacity: 0.5 }} />;
  };

  const fetchMessages = async () => {
    try {
      setLoading(true); 
      const res = await axios.get(`${API_URL}/messages?member_id=${memberId}`); 
      const userMessages = res.data.map(msg => ({
        ...msg,
        nonLu: !msg.read ? 1 : 0,
        // Simulation d'une image d'avatar pour le test
        avatarUrl: msg.avatarUrl || 'https://via.placeholder.com/150/075e54/FFFFFF?text=A',
        replies: msg.replies || [
          { id: 101, content: "J'ai un problème technique sur le site et j'aimerais obtenir de l'aide rapidement.", created_at: new Date(Date.now() - 120000).toISOString(), admin_id: null, member_id: memberId, read_status: 'sent' }, 
          { id: 102, content: "Bonjour ! Je vais regarder cela immédiatement. Pourriez-vous me fournir votre numéro de référence de commande ?", created_at: new Date(Date.now() - 60000).toISOString(), admin_id: 1, member_id: null, read_status: 'read' },
          { id: 103, content: "Le numéro est ABX-789.", created_at: new Date().toISOString(), admin_id: null, member_id: memberId, read_status: 'sent' },
        ],
      }));
      setConversations(userMessages);
      setSelectedConv(userMessages[0] || null);
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [memberId]); 

  const handleSelectConv = async (conv) => {
    try {
      if (conv.nonLu > 0) {
        await axios.post(`${API_URL}/messages/${conv.id}/mark-as-read`);
      }
      const updatedConv = { ...conv, nonLu: 0 };
      setConversations(conversations.map(c => c.id === conv.id ? updatedConv : c));
      setSelectedConv(updatedConv);
    } catch (error) {
      console.error("Erreur lors de la lecture du message:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv, selectedConv?.replies.length]); 

  const handleSendMessage = async (e) => {
    e.preventDefault(); 
    if (!newMessage.trim() || !selectedConv) return;
    
    const messageContent = newMessage;
    setNewMessage(""); 

    try {
      const tempId = Date.now();
      const tempNewMessage = { 
        id: tempId, content: messageContent, created_at: new Date().toISOString(), 
        member_id: memberId, admin_id: null, read_status: 'sent'
      };

      const updatedReplies = [...selectedConv.replies, tempNewMessage];
      const updatedConvLocal = { ...selectedConv, replies: updatedReplies };
      setSelectedConv(updatedConvLocal);
      
      const res = await axios.post(`${API_URL}/messages/${selectedConv.id}/reply`, {
        content: messageContent, member_id: memberId 
      });

      setConversations(conversations.map(conv => 
        conv.id === selectedConv.id ? res.data : conv 
      ));
      setSelectedConv(res.data);
      
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.sender.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // --- Rendu du composant ---

  return (
    <div className="d-flex min-vh-100" style={{ background: "#f0f2f5" }}> 
      <div style={{ width: sidebarCollapsed ? "80px" : "280px", transition: "width 0.3s ease" }}>
        <MembreSidebar onCollapse={setSidebarCollapsed} />
      </div>

      <div className="flex-grow-1 p-0"> 
        <div className="d-flex h-100" style={{ minHeight: "100vh" }}>
          
          {/* Liste des conversations (Côté Gauche) */}
          <Card className="shadow-sm border-end flex-shrink-0" style={{ width: "380px", borderRadius: "0", background: "#ffffff" }}>
            <Card.Header className="border-0 py-3 d-flex align-items-center bg-success text-white">
                <FaUserCircle size={30} className="me-2" />
                <h5 className="mb-0">Messagerie</h5>
            </Card.Header>
            <Card.Body className="p-2">
                <div className="p-1 bg-light rounded d-flex align-items-center mb-2">
                    <FaSearch size={14} className="text-muted ms-2 me-3" />
                    <Form.Control
                        placeholder="Rechercher un contact..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0 bg-light p-1"
                    />
                </div>
            </Card.Body>

            <ListGroup variant="flush" style={{ overflowY: "auto", maxHeight: "calc(100vh - 140px)" }}>
              {loading ? (
                <ListGroup.Item className="text-center text-muted">
                    <Spinner animation="border" size="sm" variant="success" className="me-2" />
                    Chargement...
                </ListGroup.Item>
              ) : filteredConversations.length > 0 ? (
                filteredConversations.map(conv => (
                  <ListGroup.Item
                    key={conv.id}
                    action
                    onClick={() => handleSelectConv(conv)}
                    className={`d-flex justify-content-between align-items-center py-2 px-3 ${selectedConv?.id === conv.id ? "bg-light" : "bg-white"}`}
                    style={{ borderLeft: selectedConv?.id === conv.id ? '3px solid #075e54' : 'none' }}
                  >
                    <div className="d-flex align-items-center">
                        {/* Utilisation du nouveau composant Avatar */}
                        <Avatar src={conv.avatarUrl} size={40} />
                        <div className="ms-3">
                            {/* Mise en évidence du nom si non lu */}
                            <strong className={conv.nonLu > 0 ? "text-dark" : "text-muted"}>
                                {conv.sender}
                            </strong>
                            
                            {/* Mise en évidence du dernier message si non lu */}
                            <small className={conv.nonLu > 0 ? "text-dark d-block fw-bold" : "text-muted d-block"}>
                                {conv.replies.length > 0 
                                    ? conv.replies[conv.replies.length - 1].content.slice(0, 30) + '...' 
                                    : 'Pas de message...'}
                            </small>
                        </div>
                    </div>
                    
                    <div className="d-flex flex-column align-items-end">
                        {conv.nonLu > 0 && <Badge bg="success" pill>{conv.nonLu}</Badge>}
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-center text-muted">Aucune conversation trouvée.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>

          {/* Fenêtre de chat (Côté Droit) */}
          <Card className="flex-grow-1 d-flex flex-column border-0" style={{ borderRadius: "0" }}>
            {selectedConv ? (
              <>
                <Card.Header className="d-flex align-items-center bg-white border-bottom py-2">
                    {/* Utilisation du nouveau composant Avatar dans l'entête */}
                    <Avatar src={selectedConv.avatarUrl} size={40} />
                    <h5 className="mb-0 ms-3 me-auto">Contact : {selectedConv.sender}</h5>
                </Card.Header>
                
                <Card.Body 
                    className="flex-grow-1 d-flex flex-column" 
                    style={{ overflowY: "auto", ...chatBackgroundStyle }}
                >
                  {selectedConv.replies?.map(msg => {
                    const isAdminMessage = !!msg.admin_id; 
                    const justifyContentValue = isAdminMessage ? "flex-end" : "flex-start";
                    
                    return (
                      <div 
                        key={msg.id} 
                        className="mb-2" 
                        style={{
                            display: 'flex', 
                            width: '100%', 
                            justifyContent: justifyContentValue 
                        }}
                      >
                        <div style={messageBubbleStyle(isAdminMessage)}>
                          <div className="me-5 pe-3">{msg.content}</div> 
                          
                          <div 
                            style={{ 
                                position: 'absolute', 
                                bottom: '2px', 
                                right: '8px', 
                                fontSize: "0.6rem",
                                color: isAdminMessage ? 'rgba(0,0,0,0.5)' : '#999',
                                whiteSpace: 'nowrap'
                            }}
                          >
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            
                            {isAdminMessage && (
                                <span className="ms-1">
                                    <ReadStatusIcon status={msg.read_status} />
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </Card.Body>

                <Card.Footer className="bg-light border-top py-2">
                  <Form onSubmit={handleSendMessage}>
                    <InputGroup>
                      <Form.Control
                        placeholder="Écrire un message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        style={{ borderRadius: '20px', padding: '10px 15px' }}
                      />
                      <Button 
                        type="submit" 
                        onClick={handleSendMessage} 
                        disabled={!newMessage.trim() || loading} 
                        variant="success"
                        style={{ borderRadius: '50%', width: '45px', height: '45px', padding: '0', marginLeft: '10px' }}
                      >
                        <FaPaperPlane size={18} />
                      </Button>
                    </InputGroup>
                  </Form>
                </Card.Footer>
              </>
            ) : (
              <div className="d-flex flex-grow-1 justify-content-center align-items-center bg-light">
                <p className="text-muted fs-5">Sélectionnez une conversation pour commencer.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MessagerieMembre;