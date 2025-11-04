// src/pages/MessageAdmin.jsx

import React, { useState, useEffect } from "react";
// Assurez-vous d'avoir tous ces imports de react-bootstrap
import { Card, Button, Form, ListGroup, Row, Col, Badge, InputGroup, Alert, Spinner, Modal } from "react-bootstrap"; 
import AdminSidebar from "../../components/AdminSidebar";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

// --- Composant Modale (intégré) ---
const NewAdminMessageModalComponent = ({ show, handleClose, onMessageSent, showNotification }) => {
    // Note: Le backend doit lister les membres via la route /api/members
    const [members, setMembers] = useState([]); 
    const [recipientId, setRecipientId] = useState("");
    const [subject, setSubject] = useState("Information");
    const [content, setContent] = useState("");
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    // 1. Récupérer la liste des membres (destinataires)
    useEffect(() => {
        if (show) {
            setLoadingMembers(true);
            axios.get(`${API_URL}/members`)
                .then(res => {
                    setMembers(res.data);
                    if (res.data.length > 0) {
                        // Le modèle Membre utilise 'nom' et non 'name'
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

    // 2. Gérer l'envoi du message
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipientId || !content.trim()) {
            setError("Veuillez sélectionner un destinataire et écrire un message.");
            return;
        }

        setSending(true);
        setError(null);
        
        try {
            await axios.post(`${API_URL}/messages/send-admin`, {
                recipient_id: recipientId,
                subject: subject,
                content: content,
            });

            setContent("");
            onMessageSent("success", `✅ Message ' ${subject} ' envoyé au membre avec succès !`);
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
                                    // Utilisation de 'nom' et 'email' du modèle Membre
                                    <option key={member.id} value={member.id}>{member.nom} ({member.email})</option>
                                ))
                            )}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">Sujet / Catégorie</Form.Label>
                        <Form.Control 
                            type="text"
                            value={subject} 
                            onChange={e => setSubject(e.target.value)} 
                            placeholder="Ex: Information importante"
                            disabled={sending}
                        />
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
// --- Fin du Composant Modale ---


const MessageAdmin = () => {
    // --- États ---
    const [messages, setMessages] = useState([]);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [reply, setReply] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filterCategory, setFilterCategory] = useState("Tous");
    const [sortOption, setSortOption] = useState("Plus récent");
    const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
    const [loading, setLoading] = useState(false);
    const [isReplying, setIsReplying] = useState(false);
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

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/messages`); 
            setMessages(res.data);
            if (selectedMessage) {
                const freshMessage = res.data.find(msg => msg.id === selectedMessage.id);
                setSelectedMessage(freshMessage || null);
            }
        } catch (err) {
            console.error(err);
            showNotification("error", "Erreur lors du chargement des messages");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const markAsRead = async (id) => {
        const messageToUpdate = messages.find(msg => msg.id === id);
        if (messageToUpdate && !messageToUpdate.read) { 
            try {
                // Appel PUT: /api/messages/{id}/read
                await axios.put(`${API_URL}/messages/${id}/read`); 
                setMessages(messages.map(msg => msg.id === id ? { ...msg, read: true } : msg));
                setSelectedMessage(prev => prev && prev.id === id ? { ...prev, read: true } : prev);
                showNotification("success", "✅ Message marqué comme lu.");
            } catch (err) {
                console.error(err);
                showNotification("error", "Erreur lors de la mise à jour");
            }
        }
    };

    const markAllAsRead = async () => {
        try {
            await axios.put(`${API_URL}/messages/mark-all-read`);
            setMessages(messages.map(msg => ({ ...msg, read: true })));
            showNotification("success", `✅ Tous les messages marqués comme lus`);
            setSelectedMessage(prev => prev ? { ...prev, read: true } : null);
        } catch (err) {
            console.error(err);
            showNotification("error", "Erreur lors de la mise à jour des messages");
        }
    };

    const deleteMessage = async (id) => {
        if(!window.confirm("Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.")) return;
        try {
            // Appel DELETE: /api/messages/{id}
            await axios.delete(`${API_URL}/messages/${id}`); 
            setMessages(messages.filter(msg => msg.id !== id));
            if (selectedMessage?.id === id) setSelectedMessage(null);
            showNotification("success", "✅ Message supprimé avec succès");
        } catch (err) {
            console.error(err);
            showNotification("error", "Erreur lors de la suppression");
        }
    };

    const handleReply = async () => {
        if (!reply.trim() || !selectedMessage) {
            showNotification("error", "❌ Veuillez écrire un message avant d'envoyer");
            return;
        }

        setIsReplying(true);
        try {
            const res = await axios.post(`${API_URL}/messages/${selectedMessage.id}/reply`, {
                content: reply, 
            });

            setMessages(messages.map(msg => msg.id === selectedMessage.id ? res.data : msg));
            setSelectedMessage(res.data); 
            
            showNotification("success", `✅ Réponse à ${selectedMessage.sender} envoyée et message marquée comme lu`);
            setReply("");
        } catch (err) {
            console.error(err);
            showNotification("error", "Erreur lors de l'envoi de la réponse");
        } finally {
            setIsReplying(false);
        }
    };

    // --- Filtres et Tri (inchangés) ---

    const filteredMessages = messages.filter(msg => {
        const matchesSearch = msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             msg.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === "Tous" || msg.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const unreadCount = messages.filter(msg => !msg.read).length;

    const sortedMessages = [...filteredMessages].sort((a, b) => {
        const dateA = new Date(a.created_at || a.date);
        const dateB = new Date(b.created_at || b.date);

        switch(sortOption) {
            case "Plus ancien":
                return dateA - dateB;
            case "Non lus d'abord":
                if (a.read === b.read) return dateB - dateA;
                return a.read ? 1 : -1; 
            case "Expéditeur":
                return a.sender.localeCompare(b.sender);
            case "Plus récent":
            default:
                return dateB - dateA;
        }
    });

    // --- Rendu ---

    return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}>
            <AdminSidebar />
            
            <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
                
                {/* Alertes de notification */}
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

                {/* En-tête et actions globales */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-2" style={{background:"linear-gradient(135deg, #2c3e50, #34495e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>Messagerie Administrateur</h2>
                        <p className="text-muted mb-0 d-flex align-items-center"><i className="fas fa-comments me-2"></i>Gérez les messages et initiez des conversations</p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {unreadCount>0 && (<Badge bg="danger" className="d-flex align-items-center" style={{borderRadius:"20px",padding:"8px 12px",fontSize:"0.8rem"}}><i className="fas fa-bell me-1"></i>{unreadCount} non lu{unreadCount>1?"s":""}</Badge>)}
                        
                        {/* BOUTON NOUVEAU MESSAGE ADMIN */}
                        <Button variant="success" onClick={() => setShowNewMessageModal(true)} className="d-flex align-items-center" style={{borderRadius:"10px"}}>
                            <i className="fas fa-plus me-2"></i>Ajouter un Message
                        </Button>
                        
                        <Button variant="outline-primary" onClick={markAllAsRead} className="d-flex align-items-center" style={{borderRadius:"10px"}}><i className="fas fa-check-double me-2"></i>Tout marquer comme lu</Button>
                    </div>
                </div>

                {/* Statistiques */}
                <Row className="mb-4">
                    {[{title:"Total Messages", count:messages.length, icon:"fa-envelope", color:"linear-gradient(135deg, #667eea, #764ba2)"},
                        {title:"Non Lus", count:unreadCount, icon:"fa-bell", color:"linear-gradient(135deg, #00b09b, #96c93d)"},
                        {title:"Support", count:messages.filter(msg=>msg.category==="Support").length, icon:"fa-headset", color:"linear-gradient(135deg, #4facfe, #00f2fe)"},
                        {title:"Partenaires", count:messages.filter(msg=>msg.category==="Partenaire").length, icon:"fa-handshake", color:"linear-gradient(135deg, #f093fb, #f5576c)"}].map((stat,index)=>(
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
                            <Col md={4}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-search me-2"></i>Recherche</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{background:"linear-gradient(135deg, #667eea, #764ba2)",border:"none",color:"white"}}><i className="fas fa-search"></i></InputGroup.Text>
                                        <Form.Control type="text" placeholder="Rechercher..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{borderRadius:"0 10px 10px 0"}}/>
                                    </InputGroup>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
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
                            <Col md={3}>
                                <Form.Group>
                                    <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-sort me-2"></i>Trier par</Form.Label>
                                    <Form.Select value={sortOption} onChange={e=>setSortOption(e.target.value)} style={{borderRadius:"10px"}}>
                                        <option>Plus récent</option>
                                        <option>Plus ancien</option>
                                        <option>Non lus d'abord</option>
                                        <option>Expéditeur</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={2}><Button variant="outline-secondary" onClick={()=>{setSearchTerm(""); setFilterCategory("Tous"); setSortOption("Plus récent");}} className="d-flex align-items-center w-100" style={{borderRadius:"10px"}}><i className="fas fa-times me-2"></i>Effacer</Button></Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Liste et détail des messages */}
                <Row>
                    <Col md={5}>
                        {/* Boîte de Réception (inchangée) */}
                        <Card className="border-0 shadow-sm h-100" style={{borderRadius:"20px"}}>
                            <Card.Body className="p-0">
                                <div className="p-4 border-bottom">
                                    <h5 className="fw-bold mb-0 d-flex align-items-center"><i className="fas fa-inbox me-2 text-primary"></i>Boîte de Réception<Badge bg="primary" className="ms-2">{sortedMessages.length}</Badge></h5>
                                </div>
                                <div style={{maxHeight:"600px", overflowY:"auto"}}>
                                    {loading ? (
                                        <div className="text-center py-5"><Spinner animation="border" variant="primary" /><p className="text-muted mt-2">Chargement...</p></div>
                                    ) : sortedMessages.length>0 ? (
                                        <ListGroup variant="flush">
                                            {sortedMessages.map(msg=>(
                                                <ListGroup.Item 
                                                    key={msg.id} 
                                                    action 
                                                    onClick={()=>{setSelectedMessage(msg); markAsRead(msg.id)}} 
                                                    className="border-0" 
                                                    style={{background:selectedMessage?.id===msg.id?"linear-gradient(135deg,#667eea,#764ba2)":"transparent", color:selectedMessage?.id===msg.id?"white":"inherit", borderLeft:selectedMessage?.id===msg.id?"4px solid #667eea":"4px solid transparent", cursor:"pointer", transition:"all 0.3s ease", padding:"20px"}}
                                                >
                                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                                        <div className="d-flex align-items-center">
                                                            <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:"40px", height:"40px", background:selectedMessage?.id===msg.id?"rgba(255,255,255,0.2)":"linear-gradient(135deg,#667eea,#764ba2)", color:"white", fontSize:"0.9rem", fontWeight:"bold"}}>{msg.sender.charAt(0).toUpperCase()}</div>
                                                            <div>
                                                                <h6 className={`mb-0 fw-bold ${!msg.read && selectedMessage?.id!==msg.id ? 'text-primary' : ''}`}>{msg.sender}</h6>
                                                                <small className={selectedMessage?.id===msg.id?"text-white-50":"text-muted"}>{msg.email}</small>
                                                            </div>
                                                        </div>
                                                        <div className="text-end">
                                                            <small className={selectedMessage?.id===msg.id?"text-white-50":"text-muted"}>{formatDate(msg.created_at || msg.date)}</small>
                                                            {!msg.read && selectedMessage?.id!==msg.id && (<div style={{width:"8px", height:"8px", borderRadius:"50%", backgroundColor:"#28a745", display:"inline-block"}} className="ms-2"></div>)}
                                                        </div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <Badge bg={getCategoryVariant(msg.category)} className="d-flex align-items-center" style={{borderRadius:"15px", fontSize:"0.7rem", padding:"4px 8px", width:"fit-content"}}><i className={`fas ${getCategoryIcon(msg.category)} me-1`}></i>{msg.category}</Badge>
                                                    </div>
                                                    <p className="mb-0 small" style={{lineHeight:"1.4", opacity:selectedMessage?.id===msg.id?0.9:0.8}}>{msg.content.length>80?`${msg.content.substring(0,80)}...`:msg.content}</p>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ):(
                                        <div className="text-center py-5"><i className="fas fa-envelope-open fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i><h6 className="text-muted mb-2">Aucun message trouvé</h6><p className="text-muted small">Aucun message ne correspond à vos critères de recherche</p></div>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>

                    {/* Panneau de Détail du Message et d'Historique (MODIFIÉ) */}
                    <Col md={7}>
                        {selectedMessage ? (
                            <Card className="border-0 shadow-sm h-100" style={{borderRadius:"20px"}}>
                                <Card.Body className="d-flex flex-column p-0">
                                    
                                    {/* En-tête du Message */}
                                    <div className="p-4 border-bottom">
                                        <div className="d-flex justify-content-between align-items-start mb-3">
                                            <div className="d-flex align-items-center">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center me-3" style={{width:"50px",height:"50px",background:"linear-gradient(135deg,#667eea,#764ba2)",color:"white",fontSize:"1.1rem",fontWeight:"bold"}}>{selectedMessage.sender.charAt(0).toUpperCase()}</div>
                                                <div>
                                                    <h5 className="fw-bold mb-1">{selectedMessage.sender}</h5>
                                                    <p className="text-muted mb-0">{selectedMessage.email}</p>
                                                </div>
                                            </div>
                                            
                                            {/* BLOC BOUTONS D'ACTION (MODIFIÉ) */}
                                            <div className="d-flex gap-2">
                                                {/* Bouton pour Marquer comme lu */}
                                                <Button 
                                                    variant={selectedMessage.read ? "outline-secondary" : "outline-success"} 
                                                    size="sm" 
                                                    onClick={() => markAsRead(selectedMessage.id)} 
                                                    className="d-flex align-items-center" 
                                                    style={{borderRadius:"8px"}}
                                                    disabled={selectedMessage.read}
                                                >
                                                    <i className={`fas ${selectedMessage.read ? "fa-eye-slash" : "fa-check-circle"} me-2`}></i>
                                                    {selectedMessage.read ? "Lu" : "Marquer comme lu"}
                                                </Button>

                                                {/* Bouton Supprimer */}
                                                <Button 
                                                    variant="outline-danger" 
                                                    size="sm" 
                                                    onClick={() => deleteMessage(selectedMessage.id)} 
                                                    className="d-flex align-items-center" 
                                                    style={{borderRadius:"8px"}}
                                                >
                                                    <i className="fas fa-trash me-2"></i>
                                                    Supprimer
                                                </Button>
                                            </div>
                                        </div>
                                        <div className="d-flex justify-content-between align-items-center">
                                            <Badge bg={getCategoryVariant(selectedMessage.category)} className="d-flex align-items-center" style={{borderRadius:"20px", padding:"6px 12px", fontSize:"0.8rem"}}><i className={`fas ${getCategoryIcon(selectedMessage.category)} me-1`}></i>{selectedMessage.category}</Badge>
                                            <small className="text-muted"><i className="fas fa-clock me-1"></i>Reçu le {formatDate(selectedMessage.created_at)}</small>
                                        </div>
                                    </div>

                                    {/* Historique des échanges (Scrollable) (inchangé) */}
                                    <div className="flex-grow-1 p-4" style={{maxHeight: '400px', overflowY: 'auto'}}>
                                        
                                        {/* Message Initial de l'utilisateur */}
                                        <div className="d-flex flex-column mb-4">
                                            <div className="d-flex align-items-center mb-2">
                                                <i className="fas fa-user-circle me-2 text-secondary fs-5"></i>
                                                <strong className="text-secondary">{selectedMessage.sender}</strong>
                                            </div>
                                            <Card className="bg-light border-0 shadow-sm" style={{borderRadius:"15px", borderLeft:"3px solid #6c757d"}}>
                                                <Card.Body className="p-3">
                                                    <p className="mb-0" style={{lineHeight:"1.6"}}>{selectedMessage.content}</p>
                                                </Card.Body>
                                            </Card>
                                        </div>

                                        {/* Réponses de l'Administrateur */}
                                        {selectedMessage.replies?.sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map((reply, index) => (
                                            <div className="d-flex flex-column mb-4 align-items-end" key={index}>
                                                <div className="d-flex align-items-center mb-2">
                                                    <strong className="text-primary me-2">Vous (Admin)</strong>
                                                    <i className="fas fa-shield-alt text-primary fs-5"></i>
                                                </div>
                                                <Card className="bg-primary text-white border-0 shadow-sm" style={{borderRadius:"15px", borderRight:"3px solid #007bff", maxWidth: '90%'}}>
                                                    <Card.Body className="p-3">
                                                        <p className="mb-0" style={{lineHeight:"1.6"}}>{reply.content}</p>
                                                        <small className="d-block text-end mt-2" style={{opacity: 0.8}}>Envoyé le {formatDate(reply.created_at)}</small>
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Formulaire de réponse (inchangé) */}
                                    <div className="p-4 border-top">
                                        <h6 className="fw-bold mb-3 d-flex align-items-center"><i className="fas fa-reply me-2 text-primary"></i>Répondre à {selectedMessage.sender}</h6>
                                        <Form.Group className="mb-3">
                                            <Form.Control 
                                                as="textarea" 
                                                rows={3} 
                                                value={reply} 
                                                onChange={e=>setReply(e.target.value)} 
                                                placeholder={`Écrivez votre réponse à ${selectedMessage.sender}...`} 
                                                style={{borderRadius:"12px", padding:"15px", border:"1px solid #e0e0e0", resize:"none"}} 
                                                disabled={isReplying}
                                            />
                                        </Form.Group>
                                        <div className="d-flex gap-2">
                                            <Button variant="primary" onClick={handleReply} className="d-flex align-items-center" style={{borderRadius:"10px", background:"linear-gradient(135deg,#667eea,#764ba2)", border:"none", padding:"10px 20px"}} disabled={isReplying}>
                                                {isReplying ? (
                                                    <>
                                                        <Spinner animation="border" size="sm" className="me-2" />
                                                        Envoi en cours...
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-paper-plane me-2"></i>Envoyer la réponse
                                                    </>
                                                )}
                                            </Button>
                                            <Button variant="outline-secondary" onClick={()=>setReply("")} className="d-flex align-items-center" style={{borderRadius:"10px"}} disabled={isReplying}><i className="fas fa-times me-2"></i>Effacer</Button>
                                        </div>
                                    </div>
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="border-0 shadow-sm h-100 d-flex align-items-center justify-content-center" style={{borderRadius:"20px"}}>
                                <Card.Body className="text-center py-5">
                                    <i className="fas fa-comments fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i>
                                    <h5 className="text-muted mb-2">Aucun message sélectionné</h5>
                                    <p className="text-muted mb-0">Sélectionnez un message dans la liste pour voir l'historique de la conversation</p>
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
                onMessageSent={(type, message) => {showNotification(type, message); fetchMessages();}} 
                showNotification={showNotification}
            />
        </div>
    );
};

export default MessageAdmin;