// src/pages/MessageAdmin.jsx

import React, { useState, useEffect } from "react";
import { Card, Button, Form, ListGroup, Row, Col, Badge, InputGroup, Alert, Spinner, Modal } from "react-bootstrap"; 
import AdminSidebar from "../../components/AdminSidebar";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// --- Composant Modale ---
const NewAdminMessageModalComponent = ({ show, handleClose, onMessageSent, showNotification }) => {
    const [members, setMembers] = useState([]); 
    const [recipientId, setRecipientId] = useState("");
    const [subject, setSubject] = useState("Information");
    const [content, setContent] = useState("");
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (show) {
            setLoadingMembers(true);
            axios.get(`${API_URL}/members`)
                .then(res => {
                    setMembers(res.data);
                    if (res.data.length > 0) {
                        setRecipientId(res.data[0].id); 
                    } else {
                        setRecipientId("");
                    }
                    setError(null);
                })
                .catch(err => {
                    console.error("Erreur de chargement des membres:", err);
                    setError("Impossible de charger la liste des membres. Vérifiez la route /api/members.");
                })
                .finally(() => setLoadingMembers(false));
        }
    }, [show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipientId || !content.trim()) {
            setError("Veuillez sélectionner un destinataire et écrire un message.");
            return;
        }

        setSending(true);
        setError(null);
        
        try {
            await axios.post(`${API_URL}/messages/send-to/${recipientId}`, {
                content: content,
            });

            setContent("");
            onMessageSent("success", `✅ Message envoyé au membre avec succès !`);
            handleClose();

        } catch (err) {
            console.error(err.response || err);
            const errorMsg = err.response?.data?.message || "Erreur lors de l'envoi du message.";
            setError(errorMsg);
            showNotification("error", "Erreur lors de l'envoi : " + errorMsg);
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title className="fw-bold text-primary"><i className="fas fa-paper-plane me-2"></i>Nouveau Message Admin</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Destinataire (Membre)</Form.Label>
                        <Form.Select 
                            value={recipientId} 
                            onChange={e => setRecipientId(e.target.value)} 
                            disabled={loadingMembers || sending}
                        >
                            {loadingMembers ? (
                                <option>Chargement des membres...</option>
                            ) : members.length === 0 ? (
                                <option value="">Aucun membre trouvé</option>
                            ) : (
                                members.map(member => (
                                    <option key={member.id} value={member.id}>{member.nom} ({member.email})</option>
                                ))
                            )}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Contenu du Message</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={6} 
                            value={content} 
                            onChange={e => setContent(e.target.value)} 
                            placeholder="Écrivez le message que vous souhaitez envoyer au membre..."
                            disabled={sending}
                        />
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button variant="outline-secondary" onClick={handleClose} disabled={sending}>Annuler</Button>
                        <Button variant="primary" type="submit" className="d-flex align-items-center" disabled={sending || !recipientId || !content.trim()}>
                            {sending ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    Envoi...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>Envoyer le Message
                                </>
                            )}
                        </Button>
                    </div>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

const MessageAdmin = () => {
    // --- États ---
    const [membres, setMembres] = useState([]);
    const [selectedMembre, setSelectedMembre] = useState(null);
    const [conversation, setConversation] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("Tous");
    const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false); 

    // --- Fonctions Utilitaires ---

    const showNotification = (type, message) => {
        setShowAlert({ show: true, type, message });
        setTimeout(() => setShowAlert({ show: false, type: "", message: "" }), 4000);
    };

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

    const getCategoryVariant = (category) => {
        switch(category) {
            case "Support": return "primary";
            case "Technique": return "warning";
            case "Partenaire": return "success";
            case "Urgent": return "danger";
            case "Information": return "info"; 
            default: return "secondary";
        }
    };
    
    const getCategoryIcon = (category) => {
        switch(category) {
            case "Support": return "fa-headset";
            case "Technique": return "fa-tools";
            case "Partenaire": return "fa-handshake";
            case "Urgent": return "fa-exclamation-triangle";
            case "Information": return "fa-bullhorn"; 
            default: return "fa-envelope";
        }
    };

    // --- Fonctions API ---

    const fetchMembres = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/messages`);
            console.log("Membres chargés:", res.data);
            setMembres(res.data || []);
        } catch (err) {
            console.error("Erreur chargement membres:", err);
            showNotification("error", "Erreur lors du chargement des membres");
            setMembres([]);
        } finally {
            setLoading(false);
        }
    };

    // Charger la conversation avec un membre spécifique
    const fetchConversation = async (membreId) => {
        try {
            const res = await axios.get(`${API_URL}/messages/conversation/${membreId}`);
            console.log("Conversation chargée:", res.data);
            setSelectedMembre(res.data.membre);
            setConversation(res.data.messages || []);
        } catch (err) {
            console.error("Erreur chargement conversation:", err);
            showNotification("error", "Erreur lors du chargement de la conversation");
            setConversation([]);
        }
    };

    // Envoyer un message à un membre
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedMembre) {
            showNotification("error", "Veuillez écrire un message");
            return;
        }

        setSending(true);
        try {
            const res = await axios.post(`${API_URL}/messages/send-to/${selectedMembre.id}`, {
                content: newMessage
            });

            console.log("Message envoyé:", res.data);

            // Ajouter le nouveau message à la conversation
            const newMsg = {
                ...res.data,
                created_at: new Date().toISOString()
            };
            
            setConversation(prev => [...prev, newMsg]);
            setNewMessage("");
            showNotification("success", "Message envoyé avec succès");
            
            // Rafraîchir la liste des membres
            fetchMembres();
        } catch (err) {
            console.error("Erreur envoi message:", err);
            showNotification("error", "Erreur lors de l'envoi du message");
        } finally {
            setSending(false);
        }
    };

    // Répondre à un message spécifique
    const replyToMessage = async (messageId) => {
        if (!newMessage.trim()) {
            showNotification("error", "Veuillez écrire un message");
            return;
        }

        setSending(true);
        try {
            const res = await axios.post(`${API_URL}/messages/${messageId}/reply`, {
                content: newMessage
            });

            console.log("Réponse envoyée:", res.data);

            // Ajouter la réponse à la conversation
            const newReply = {
                ...res.data,
                created_at: new Date().toISOString()
            };
            
            setConversation(prev => [...prev, newReply]);
            setNewMessage("");
            showNotification("success", "Réponse envoyée avec succès");
            
            // Rafraîchir la conversation
            if (selectedMembre) {
                fetchConversation(selectedMembre.id);
            }
        } catch (err) {
            console.error("Erreur envoi réponse:", err);
            showNotification("error", "Erreur lors de l'envoi de la réponse");
        } finally {
            setSending(false);
        }
    };

    // Marquer tous les messages comme lus pour un membre
    const markAllAsRead = async (membreId) => {
        try {
            await axios.put(`${API_URL}/messages/mark-all-read/${membreId}`);
            showNotification("success", "Tous les messages marqués comme lus");
            fetchMembres();
            if (selectedMembre && selectedMembre.id === membreId) {
                fetchConversation(membreId);
            }
        } catch (err) {
            console.error("Erreur marquage comme lu:", err);
            showNotification("error", "Erreur lors de la mise à jour");
        }
    };

    // Marquer un message comme lu
    const markAsRead = async (messageId) => {
        try {
            await axios.put(`${API_URL}/messages/${messageId}/read`);
            // Mettre à jour l'état local
            setConversation(prev => 
                prev.map(msg => 
                    msg.id === messageId ? { ...msg, read: true } : msg
                )
            );
        } catch (err) {
            console.error("Erreur marquage comme lu:", err);
        }
    };

    // Supprimer un message
    const deleteMessage = async (messageId) => {
        if(!window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return;
        
        try {
            await axios.delete(`${API_URL}/messages/${messageId}`);
            showNotification("success", "Message supprimé avec succès");
            // Recharger la conversation
            if (selectedMembre) {
                fetchConversation(selectedMembre.id);
            }
        } catch (err) {
            console.error("Erreur suppression:", err);
            showNotification("error", "Erreur lors de la suppression");
        }
    };

    useEffect(() => {
        fetchMembres();
    }, []);

    // Filtrer les membres selon la recherche
    const filteredMembres = membres.filter(membre =>
        membre.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        membre.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Calculer le total des messages non lus
    const totalUnread = membres.reduce((sum, membre) => sum + (membre.unread_count || 0), 0);

    // Statistiques
    const stats = [
        { 
            title: "Total Messages", 
            count: membres.reduce((sum, m) => sum + (m.messages?.length || 0), 0), 
            icon: "fa-envelope", 
            color: "linear-gradient(135deg, #667eea, #764ba2)" 
        },
        { 
            title: "Non Lus", 
            count: totalUnread, 
            icon: "fa-bell", 
            color: "linear-gradient(135deg, #00b09b, #96c93d)" 
        },
        { 
            title: "Support", 
            count: membres.reduce((sum, m) => sum + (m.messages?.filter(msg => msg.category === "Support")?.length || 0), 0), 
            icon: "fa-headset", 
            color: "linear-gradient(135deg, #4facfe, #00f2fe)" 
        },
        { 
            title: "Partenaires", 
            count: membres.reduce((sum, m) => sum + (m.messages?.filter(msg => msg.category === "Partenaire")?.length || 0), 0), 
            icon: "fa-handshake", 
            color: "linear-gradient(135deg, #f093fb, #f5576c)" 
        }
    ];

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}>
            <AdminSidebar />
            
            <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
                
                {showAlert.show && (
                    <Alert variant={showAlert.type === "success" ? "success" : "danger"} 
                            className="d-flex align-items-center shadow-lg border-0" 
                            style={{position:"fixed",top:"20px",right:"20px",zIndex:1050,minWidth:"350px",borderRadius:"15px",
                            borderLeft:`4px solid ${showAlert.type === "success" ? "#28a745" : "#dc3545"}`,backdropFilter:"blur(10px)",backgroundColor:"rgba(255,255,255,0.95)"}}>
                        <i className={`fas ${showAlert.type==="success"?"fa-check-circle text-success":"fa-exclamation-triangle text-danger"} me-3 fs-5`}></i>
                        <div>
                            <strong className="d-block">{showAlert.type==="success"?"Succès":"Erreur"}</strong>
                            <span className="text-muted">{showAlert.message}</span>
                        </div>
                    </Alert>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-2" style={{background:"linear-gradient(135deg, #2c3e50, #34495e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>Messagerie Admin</h2>
                        <p className="text-muted mb-0 d-flex align-items-center">
                            <i className="fas fa-comments me-2"></i>
                            Communiquez avec les membres
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {totalUnread > 0 && (
                            <Badge bg="danger" className="d-flex align-items-center" style={{borderRadius:"20px",padding:"8px 12px",fontSize:"0.8rem"}}>
                                <i className="fas fa-bell me-1"></i>{totalUnread} non lu{totalUnread>1?"s":""}
                            </Badge>
                        )}
                        <Button variant="success" onClick={() => setShowNewMessageModal(true)} className="d-flex align-items-center" style={{borderRadius:"10px"}}>
                            <i className="fas fa-plus me-2"></i>Nouveau Message
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
                                            <h6 className="card-title text-muted mb-2">{stat.title}</h6>
                                            <h2 className="fw-bold mb-0" style={{background:stat.color, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>{stat.count}</h2>
                                        </div>
                                        <div className="rounded-circle d-flex align-items-center justify-content-center" style={{width:"60px",height:"60px",background:stat.color}}>
                                            <i className={`fas ${stat.icon} text-white fs-4`}></i>
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
                                    <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-search me-2"></i>Recherche</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{background:"linear-gradient(135deg, #667eea, #764ba2)",border:"none",color:"white"}}><i className="fas fa-search"></i></InputGroup.Text>
                                        <Form.Control 
                                            type="text" 
                                            placeholder="Rechercher un membre..." 
                                            value={searchTerm} 
                                            onChange={e=>setSearchTerm(e.target.value)} 
                                            style={{borderRadius:"0 10px 10px 0"}}
                                        />
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-filter me-2"></i>Catégorie</Form.Label>
                                    <Form.Select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={{borderRadius:"10px"}}>
                                        <option value="Tous">Toutes les catégories</option>
                                        <option value="Support">Support</option>
                                        <option value="Technique">Technique</option>
                                        <option value="Partenaire">Partenaire</option>
                                        <option value="Urgent">Urgent</option>
                                        <option value="Information">Admin</option>
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
                                    <i className="fas fa-times me-2"></i>Effacer
                                </Button>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                <Row>
                    {/* Sidebar des membres */}
                    <Col md={5}>
                        <Card className="border-0 shadow-sm h-100" style={{borderRadius:"20px"}}>
                            <Card.Body className="p-0">
                                <div className="p-3 border-bottom">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center">
                                        <i className="fas fa-users me-2 text-primary"></i>
                                        Membres
                                        <Badge bg="primary" className="ms-2">{filteredMembres.length}</Badge>
                                    </h5>
                                </div>
                                <div style={{maxHeight:"600px", overflowY:"auto"}}>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="text-muted mt-2">Chargement des membres...</p>
                                        </div>
                                    ) : filteredMembres.length > 0 ? (
                                        <ListGroup variant="flush">
                                            {filteredMembres.map(membre => (
                                                <ListGroup.Item 
                                                    key={membre.id}
                                                    action 
                                                    onClick={() => fetchConversation(membre.id)}
                                                    className="border-0" 
                                                    style={{
                                                        background: selectedMembre?.id === membre.id ? "linear-gradient(135deg,#667eea,#764ba2)" : "transparent",
                                                        color: selectedMembre?.id === membre.id ? "white" : "inherit",
                                                        borderLeft: selectedMembre?.id === membre.id ? "4px solid #667eea" : "4px solid transparent",
                                                        cursor: "pointer",
                                                        transition: "all 0.3s ease",
                                                        padding: "15px"
                                                    }}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start">
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                                                                style={{
                                                                    width: "45px", 
                                                                    height: "45px", 
                                                                    background: selectedMembre?.id === membre.id ? "rgba(255,255,255,0.2)" : "linear-gradient(135deg,#667eea,#764ba2)",
                                                                    color: "white",
                                                                    fontSize: "0.9rem",
                                                                    fontWeight: "bold"
                                                                }}>
                                                                {membre.nom?.charAt(0)?.toUpperCase() || 'M'}
                                                            </div>
                                                            <div>
                                                                <h6 className={`mb-1 fw-bold ${membre.unread_count > 0 && selectedMembre?.id !== membre.id ? 'text-primary' : ''}`}>
                                                                    {membre.nom || 'Membre'}
                                                                </h6>
                                                                <small className={selectedMembre?.id === membre.id ? "text-white-50" : "text-muted"}>
                                                                    {membre.email || 'Aucun email'}
                                                                </small>
                                                                {membre.messages && membre.messages.length > 0 && (
                                                                    <p className="mb-0 small mt-1" style={{
                                                                        opacity: selectedMembre?.id === membre.id ? 0.9 : 0.7,
                                                                        lineHeight: "1.3"
                                                                    }}>
                                                                        {membre.messages[0]?.content?.length > 40 
                                                                            ? `${membre.messages[0].content.substring(0, 40)}...`
                                                                            : membre.messages[0]?.content || "Aucun message"
                                                                        }
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            {membre.unread_count > 0 && (
                                                                <Badge bg="danger" className="mb-1">
                                                                    {membre.unread_count}
                                                                </Badge>
                                                            )}
                                                            <br />
                                                            <small className={selectedMembre?.id === membre.id ? "text-white-50" : "text-muted"}>
                                                                {membre.type || 'Membre'}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-user-slash fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i>
                                            <h6 className="text-muted mb-2">Aucun membre trouvé</h6>
                                            <p className="text-muted small">Aucun membre ne correspond à votre recherche</p>
                                        </div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Zone de conversation */}
                    <Col md={7}>
                        {selectedMembre ? (
                            <Card className="border-0 shadow-sm h-100" style={{borderRadius:"20px"}}>
                                <Card.Body className="d-flex flex-column p-0 h-100">
                                    {/* En-tête de la conversation */}
                                    <div className="p-3 border-bottom bg-white">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" 
                                                    style={{
                                                        width: "50px",
                                                        height: "50px", 
                                                        background: "linear-gradient(135deg,#667eea,#764ba2)", 
                                                        color: "white", 
                                                        fontSize: "1.1rem", 
                                                        fontWeight: "bold"
                                                    }}>
                                                    {selectedMembre.nom?.charAt(0)?.toUpperCase() || 'M'}
                                                </div>
                                                <div>
                                                    <h5 className="fw-bold mb-1">{selectedMembre.nom || 'Membre'}</h5>
                                                    <p className="text-muted mb-0">{selectedMembre.email || 'Aucun email'} • {selectedMembre.type || 'Membre'}</p>
                                                </div>
                                            </div>
                                            <div className="d-flex gap-2">
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => markAllAsRead(selectedMembre.id)}
                                                    className="d-flex align-items-center"
                                                    style={{borderRadius: "8px"}}
                                                >
                                                    <i className="fas fa-check-double me-2"></i>
                                                    Tout marquer comme lu
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
                                        {conversation.length > 0 ? (
                                            conversation.map((message) => (
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
                                                                {selectedMembre.nom?.charAt(0)?.toUpperCase() || 'M'}
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
                                                <h6 className="text-muted mb-2">Aucun message</h6>
                                                <p className="text-muted small">Commencez la conversation avec {selectedMembre.nom || 'ce membre'}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Zone de saisie */}
                                    <div className="p-3 border-top bg-white">
                                        <Form.Group className="mb-3">
                                            <Form.Control 
                                                as="textarea" 
                                                rows={3} 
                                                value={newMessage} 
                                                onChange={e => setNewMessage(e.target.value)} 
                                                placeholder={`Écrivez votre message à ${selectedMembre.nom || 'ce membre'}...`} 
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
                                                        Envoi...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-paper-plane me-2"></i>Envoyer
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
                                                <i className="fas fa-times me-2"></i>Effacer
                                            </Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="border-0 shadow-sm h-100 d-flex align-items-center justify-content-center" style={{borderRadius:"20px"}}>
                                <Card.Body className="text-center py-5">
                                    <i className="fas fa-comments fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i>
                                    <h5 className="text-muted mb-2">Aucune conversation sélectionnée</h5>
                                    <p className="text-muted mb-0">Sélectionnez un membre pour commencer à discuter</p>
                                </Card.Body>
                            </Card>
                        )}
                    </Col>
                </Row>
            </div>

            {/* Modale d'envoi de message Admin */}
            <NewAdminMessageModalComponent
                show={showNewMessageModal}
                handleClose={() => setShowNewMessageModal(false)}
                onMessageSent={(type, message) => {showNotification(type, message); fetchMembres();}} 
                showNotification={showNotification}
            />
        </div>
    );
};

export default MessageAdmin;