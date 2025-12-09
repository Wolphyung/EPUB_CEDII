import React, { useState, useEffect } from "react";
import { Card, Button, Form, ListGroup, Row, Col, Badge, InputGroup, Alert, Spinner, Modal } from "react-bootstrap"; 
import AdminSidebar from "../../components/AdminSidebar";
import axios from "axios";
import { useTranslation } from 'react-i18next';

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
      // Rediriger vers la page de login si non authentifié
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Composant Modale ---
const NewAdminMessageModalComponent = ({ show, handleClose, onMessageSent, showNotification }) => {
    const { t } = useTranslation();
    const [members, setMembers] = useState([]); 
    const [recipientId, setRecipientId] = useState("");
    const [subject, setSubject] = useState("Information");
    const [content, setContent] = useState("");
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [sending, setSending] = useState(false);
    const [error, setError] = useState(null);

    const fetchMembres = async () => {
      setLoadingMembers(true);
      try {
        const res = await axios.get(`${API_URL}/messages/members`);
        setMembers(res.data);
        if (res.data.length > 0) {
          setRecipientId(res.data[0].id);
        }
        setError(null);
      } catch (err) {
        console.error("Erreur détaillée chargement membres:", err);
        if (err.response?.status === 401) {
          setError(t("unauthorized_access", "Accès non autorisé. Veuillez vous reconnecter."));
        } else {
          setError(t("error_load_members_list", "Erreur lors du chargement de la liste des membres"));
        }
      } finally {
        setLoadingMembers(false);
      }
    };

    useEffect(() => {
        if (show) {
          fetchMembres();
        }
    }, [show, t]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!recipientId || !content.trim()) {
            setError(t("message_validation_error", "Veuillez sélectionner un destinataire et écrire un message"));
            return;
        }

        setSending(true);
        setError(null);
        
        try {
            await axios.post(`${API_URL}/messages/send-to/${recipientId}`, {
                content: content,
            });

            setContent("");
            onMessageSent("success", t("message_sent_success", "Message envoyé avec succès"));
            handleClose();

        } catch (err) {
            console.error(err.response || err);
            const errorMsg = err.response?.data?.message || t("message_send_error", "Erreur lors de l'envoi du message");
            setError(errorMsg);
            showNotification("error", t("message_send_error_prefix", "Erreur: ") + errorMsg);
        } finally {
            setSending(false);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered size="lg">
            <Modal.Header closeButton style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
                <Modal.Title className="fw-bold"><i className="fas fa-paper-plane me-2"></i>{t("new_admin_message", "Nouveau message Admin")}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger" dismissible onClose={() => setError(null)}>{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">{t("recipient", "Destinataire")}</Form.Label>
                        <Form.Select 
                            value={recipientId} 
                            onChange={e => setRecipientId(e.target.value)} 
                            disabled={loadingMembers || sending}
                            className="border-primary"
                        >
                            {loadingMembers ? (
                                <option>{t("loading_members", "Chargement des membres...")}</option>
                            ) : members.length === 0 ? (
                                <option value="">{t("no_members_found", "Aucun membre trouvé")}</option>
                            ) : (
                                members.map(member => (
                                    <option key={member.id} value={member.id}>
                                        {member.nom || member.name || "Membre"} ({member.email || "pas d'email"})
                                    </option>
                                ))
                            )}
                        </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label className="fw-semibold">{t("message_content", "Contenu du message")}</Form.Label>
                        <Form.Control 
                            as="textarea" 
                            rows={6} 
                            value={content} 
                            onChange={e => setContent(e.target.value)} 
                            placeholder={t("message_content_placeholder", "Écrivez votre message ici...")}
                            disabled={sending}
                            className="border-primary"
                            style={{ minHeight: "150px" }}
                        />
                        <Form.Text className="text-muted">
                            {content.length}/2000 {t("characters", "caractères")}
                        </Form.Text>
                    </Form.Group>

                    <div className="d-flex justify-content-end gap-2 mt-4">
                        <Button 
                          variant="outline-secondary" 
                          onClick={handleClose} 
                          disabled={sending}
                          style={{ borderRadius: "10px", padding: "8px 20px" }}
                        >
                          {t("cancel_button", "Annuler")}
                        </Button>
                        <Button 
                          variant="primary" 
                          type="submit" 
                          className="d-flex align-items-center" 
                          disabled={sending || !recipientId || !content.trim()}
                          style={{ 
                            borderRadius: "10px", 
                            padding: "8px 20px",
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            border: "none"
                          }}
                        >
                            {sending ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" />
                                    {t("sending", "Envoi...")}
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-paper-plane me-2"></i>{t("send_message", "Envoyer le message")}
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
    const { t } = useTranslation();
    
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
    const [authError, setAuthError] = useState(null);

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

    // Vérifier l'authentification
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        setAuthError(t("authentication_required", "Authentification requise"));
        return false;
      }
      
      try {
        const userData = JSON.parse(user);
        if (userData.type !== 'admin') {
          setAuthError(t("admin_access_required", "Accès administrateur requis"));
          return false;
        }
      } catch (e) {
        setAuthError(t("invalid_user_data", "Données utilisateur invalides"));
        return false;
      }
      
      return true;
    };

    // --- Fonctions API ---
    const fetchMembres = async () => {
      if (!checkAuth()) {
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setAuthError(null);
      try {
        console.log("Fetching messages from API...");
        const res = await axios.get(`${API_URL}/messages`);
        console.log("API response:", res.data);
        setMembres(res.data || []);
      } catch (err) {
        console.error("Erreur détaillée chargement membres:", err);
        if (err.response?.status === 401) {
          setAuthError(t("unauthorized_access", "Accès non autorisé. Veuillez vous reconnecter."));
          showNotification("error", t("session_expired", "Votre session a expiré, veuillez vous reconnecter"));
        } else {
          showNotification("error", t("error_load_members", "Erreur lors du chargement des membres") + ": " + (err.message || ""));
        }
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
            if (err.response?.status === 401) {
              showNotification("error", t("session_expired", "Votre session a expiré"));
            } else {
              showNotification("error", t("error_load_conversation", "Erreur lors du chargement de la conversation"));
            }
            setConversation([]);
        }
    };

    // Envoyer un message à un membre
    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedMembre) {
            showNotification("error", t("message_write_error", "Veuillez écrire un message"));
            return;
        }

        setSending(true);
        try {
            const res = await axios.post(`${API_URL}/messages/send-to/${selectedMembre.id}`, {
                content: newMessage
            });

            const newMsg = {
                ...res.data,
                created_at: new Date().toISOString()
            };

            setConversation(prev => [...prev, newMsg]);
            setNewMessage("");
            showNotification("success", t("message_sent_success", "Message envoyé avec succès"));

            // Rafraîchir la conversation
            fetchConversation(selectedMembre.id);
            fetchMembres();
        } catch (err) {
            console.error("Erreur envoi message:", err);
            if (err.response?.status === 401) {
              showNotification("error", t("session_expired", "Votre session a expiré"));
            } else {
              showNotification("error", t("message_send_error", "Erreur lors de l'envoi du message"));
            }
        } finally {
            setSending(false);
        }
    };

    // Marquer tous les messages comme lus pour un membre
    const markAllAsRead = async (membreId) => {
        try {
            await axios.put(`${API_URL}/messages/mark-all-read/${membreId}`);
            showNotification("success", t("all_messages_marked_read", "Tous les messages marqués comme lus"));
            fetchMembres();
            if (selectedMembre && selectedMembre.id === membreId) {
                fetchConversation(membreId);
            }
        } catch (err) {
            console.error("Erreur marquage comme lu:", err);
            showNotification("error", t("update_error", "Erreur lors de la mise à jour"));
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
        if(!window.confirm(t("delete_confirmation", "Êtes-vous sûr de vouloir supprimer ce message ?"))) return;
        
        try {
            await axios.delete(`${API_URL}/messages/${messageId}`);
            showNotification("success", t("message_deleted_success", "Message supprimé avec succès"));
            // Recharger la conversation
            if (selectedMembre) {
                fetchConversation(selectedMembre.id);
            }
        } catch (err) {
            console.error("Erreur suppression:", err);
            showNotification("error", t("delete_error", "Erreur lors de la suppression"));
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
            title: "total_messages", 
            count: membres.reduce((sum, m) => sum + (m.messages?.length || 0), 0), 
            icon: "fa-envelope", 
            color: "linear-gradient(135deg, #667eea, #764ba2)" 
        },
        { 
            title: "unread", 
            count: totalUnread, 
            icon: "fa-bell", 
            color: "linear-gradient(135deg, #00b09b, #96c93d)" 
        },
        { 
            title: "support", 
            count: membres.reduce((sum, m) => sum + (m.messages?.filter(msg => msg.category === "Support")?.length || 0), 0), 
            icon: "fa-headset", 
            color: "linear-gradient(135deg, #4facfe, #00f2fe)" 
        },
        { 
            title: "partners", 
            count: membres.reduce((sum, m) => sum + (m.messages?.filter(msg => msg.category === "Partenaire")?.length || 0), 0), 
            icon: "fa-handshake", 
            color: "linear-gradient(135deg, #f093fb, #f5576c)" 
        }
    ];

    // Afficher l'erreur d'authentification si présente
    if (authError) {
      return (
        <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa, #c3cfe2)" }}>
          <AdminSidebar />
          <div className="flex-grow-1 d-flex align-items-center justify-content-center p-4" style={{ marginLeft: "280px" }}>
            <Alert variant="danger" className="w-50 text-center">
              <i className="fas fa-exclamation-triangle fa-3x mb-3"></i>
              <h4>{t("authentication_error", "Erreur d'authentification")}</h4>
              <p className="mb-3">{authError}</p>
              <Button 
                variant="primary" 
                onClick={() => window.location.href = '/login'}
                className="mt-2"
              >
                <i className="fas fa-sign-in-alt me-2"></i>
                {t("go_to_login", "Aller à la page de connexion")}
              </Button>
            </Alert>
          </div>
        </div>
      );
    }

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
                            <strong className="d-block">{showAlert.type==="success"?t("success", "Succès"):t("error", "Erreur")}</strong>
                            <span className="text-muted">{showAlert.message}</span>
                        </div>
                    </Alert>
                )}

                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-2" style={{background:"linear-gradient(135deg, #2c3e50, #34495e)", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent"}}>
                            {t("messages_admin_title", "Messages Administrateur")}
                        </h2>
                        <p className="text-muted mb-0 d-flex align-items-center">
                            <i className="fas fa-comments me-2"></i>
                            {t("messages_admin_subtitle", "Gérez les conversations avec les membres")}
                        </p>
                    </div>
                    <div className="d-flex align-items-center gap-3">
                        {totalUnread > 0 && (
                            <Badge bg="danger" className="d-flex align-items-center" style={{borderRadius:"20px",padding:"8px 12px",fontSize:"0.8rem"}}>
                                <i className="fas fa-bell me-1"></i>{totalUnread} {t("unread", "non lu")}{totalUnread>1?"s":""}
                            </Badge>
                        )}
                        <Button 
                          variant="success" 
                          onClick={() => setShowNewMessageModal(true)} 
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
                                    <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-search me-2"></i>{t("search", "Recherche")}</Form.Label>
                                    <InputGroup>
                                        <InputGroup.Text style={{background:"linear-gradient(135deg, #667eea, #764ba2)",border:"none",color:"white"}}><i className="fas fa-search"></i></InputGroup.Text>
                                        <Form.Control 
                                            type="text" 
                                            placeholder={t("search_member_placeholder", "Rechercher un membre...")} 
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
                                        <option value="Technique">{t("Technique", "Technique")}</option>
                                        <option value="Partenaire">{t("Partenaire", "Partenaire")}</option>
                                        <option value="Urgent">{t("Urgent", "Urgent")}</option>
                                        <option value="Information">{t("Admin", "Admin")}</option>
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
                    {/* Sidebar des membres */}
                    <Col md={5}>
                        <Card className="border-0 shadow-sm h-100" style={{borderRadius:"20px"}}>
                            <Card.Body className="p-0">
                                <div className="p-3 border-bottom">
                                    <h5 className="fw-bold mb-3 d-flex align-items-center">
                                        <i className="fas fa-users me-2 text-primary"></i>
                                        {t("members", "Membres")}
                                        <Badge bg="primary" className="ms-2">{filteredMembres.length}</Badge>
                                    </h5>
                                </div>
                                <div style={{maxHeight:"600px", overflowY:"auto"}}>
                                    {loading ? (
                                        <div className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="text-muted mt-2">{t("loading_members", "Chargement des membres...")}</p>
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
                                                                    {membre.nom || t("member", "Membre")}
                                                                </h6>
                                                                <small className={selectedMembre?.id === membre.id ? "text-white-50" : "text-muted"}>
                                                                    {membre.email || t("no_email", "Pas d'email")}
                                                                </small>
                                                                {membre.messages && membre.messages.length > 0 && (
                                                                    <p className="mb-0 small mt-1" style={{
                                                                        opacity: selectedMembre?.id === membre.id ? 0.9 : 0.7,
                                                                        lineHeight: "1.3"
                                                                    }}>
                                                                        {membre.messages[0]?.content?.length > 40 
                                                                            ? `${membre.messages[0].content.substring(0, 40)}...`
                                                                            : membre.messages[0]?.content || t("no_message", "Pas de message")
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
                                                                {membre.type || t("member", "Membre")}
                                                            </small>
                                                        </div>
                                                    </div>
                                                </ListGroup.Item>
                                            ))}
                                        </ListGroup>
                                    ) : (
                                        <div className="text-center py-5">
                                            <i className="fas fa-user-slash fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i>
                                            <h6 className="text-muted mb-2">{t("no_members_found", "Aucun membre trouvé")}</h6>
                                            <p className="text-muted small">{t("no_members_match", "Aucun membre ne correspond à votre recherche")}</p>
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
                                                    <h5 className="fw-bold mb-1">{selectedMembre.nom || t("member", "Membre")}</h5>
                                                    <p className="text-muted mb-0">{selectedMembre.email || t("no_email", "Pas d'email")} • {selectedMembre.type || t("member", "Membre")}</p>
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
                                                    {t("mark_all_as_read", "Tout marquer comme lu")}
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
                                                <h6 className="text-muted mb-2">{t("no_messages", "Aucun message")}</h6>
                                                <p className="text-muted small">{t("start_conversation", "Commencez la conversation avec")} {selectedMembre.nom || t("this_member", "ce membre")}</p>
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
                                                placeholder={`${t("write_message_to", "Écrire un message à")} ${selectedMembre.nom || t("this_member", "ce membre")}...`} 
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
                                </Card.Body>
                            </Card>
                        ) : (
                            <Card className="border-0 shadow-sm h-100 d-flex align-items-center justify-content-center" style={{borderRadius:"20px"}}>
                                <Card.Body className="text-center py-5">
                                    <i className="fas fa-comments fs-1 text-muted mb-3 d-block" style={{opacity:0.5}}></i>
                                    <h5 className="text-muted mb-2">{t("no_conversation_selected", "Aucune conversation sélectionnée")}</h5>
                                    <p className="text-muted mb-0">{t("select_member_to_start", "Sélectionnez un membre pour commencer")}</p>
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