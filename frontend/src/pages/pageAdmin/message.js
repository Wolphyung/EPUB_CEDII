import React, { useState, useEffect } from "react";
import { Card, Button, Form, ListGroup, Row, Col, Badge, InputGroup, Alert } from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";

const MessageAdmin = () => {
  const [messages, setMessages] = useState([
    { 
      id: 1, 
      sender: "Jean Dupont", 
      email: "jean.dupont@email.com",
      content: "Bonjour, j'ai besoin d'aide concernant mon compte et les fonctionnalités disponibles sur la plateforme.", 
      date: "2025-09-20", 
      read: false,
      category: "Support"
    },
    { 
      id: 2, 
      sender: "Entreprise A", 
      email: "contact@entreprise-a.com",
      content: "Merci pour l'approbation de notre demande. Nous souhaiterions avoir plus d'informations sur les prochaines étapes.", 
      date: "2025-09-21", 
      read: true,
      category: "Partenaire"
    },
    { 
      id: 3, 
      sender: "Marie Martin", 
      email: "marie.martin@email.com",
      content: "Je rencontre un problème technique lors de l'upload de mes documents. Pouvez-vous m'aider ?", 
      date: "2025-09-22", 
      read: false,
      category: "Technique"
    },
    { 
      id: 4, 
      sender: "SARL Tech Solutions", 
      email: "info@techsolutions.com",
      content: "Nous sommes intéressés par un partenariat stratégique avec votre organisation.", 
      date: "2025-09-22", 
      read: false,
      category: "Partenaire"
    },
  ]);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [reply, setReply] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("Tous");
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });

  // Afficher messages temporairement
  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: "", message: "" });
    }, 4000);
  };

  const markAsRead = (id) => {
    setMessages(
      messages.map((msg) =>
        msg.id === id ? { ...msg, read: true } : msg
      )
    );
  };

  const markAllAsRead = () => {
    setMessages(messages.map(msg => ({ ...msg, read: true })));
    showNotification("success", "✅ Tous les messages marqués comme lus");
  };

  const deleteMessage = (id) => {
    setMessages(messages.filter(msg => msg.id !== id));
    if (selectedMessage && selectedMessage.id === id) {
      setSelectedMessage(null);
    }
    showNotification("success", "✅ Message supprimé avec succès");
  };

  const handleReply = () => {
    if (!reply.trim()) {
      showNotification("error", "❌ Veuillez écrire un message avant d'envoyer");
      return;
    }
    
    // Simuler l'envoi du message
    showNotification("success", "✅ Réponse envoyée avec succès");
    setReply("");
    
    // Marquer comme lu et traité
    if (selectedMessage) {
      setMessages(messages.map(msg => 
        msg.id === selectedMessage.id ? { ...msg, read: true } : msg
      ));
    }
  };

  const getCategoryVariant = (category) => {
    switch(category) {
      case "Support": return "primary";
      case "Technique": return "warning";
      case "Partenaire": return "success";
      case "Urgent": return "danger";
      default: return "secondary";
    }
  };

  const getCategoryIcon = (category) => {
    switch(category) {
      case "Support": return "fa-headset";
      case "Technique": return "fa-tools";
      case "Partenaire": return "fa-handshake";
      case "Urgent": return "fa-exclamation-triangle";
      default: return "fa-envelope";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filtrer les messages
  const filteredMessages = messages.filter(msg => {
    const matchesSearch = msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "Tous" || msg.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* Alert Notification */}
        {showAlert.show && (
          <Alert 
            variant={showAlert.type === "success" ? "success" : "danger"}
            className="d-flex align-items-center shadow-lg border-0"
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1050,
              minWidth: "350px",
              borderRadius: "15px",
              borderLeft: `4px solid ${showAlert.type === "success" ? "#28a745" : "#dc3545"}`,
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.95)"
            }}
          >
            <i className={`fas ${
              showAlert.type === "success" ? "fa-check-circle text-success" : "fa-exclamation-triangle text-danger"
            } me-3 fs-5`}></i>
            <div>
              <strong className="d-block">
                {showAlert.type === "success" ? "Succès" : "Erreur"}
              </strong>
              <span className="text-muted">{showAlert.message}</span>
            </div>
          </Alert>
        )}

        {/* En-tête de page */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ 
              background: "linear-gradient(135deg, #2c3e50, #34495e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Messagerie Administrateur
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-comments me-2"></i>
              Gérez les messages et répondez aux demandes
            </p>
          </div>
          <div className="d-flex align-items-center gap-3">
            {unreadCount > 0 && (
              <Badge 
                bg="danger" 
                className="d-flex align-items-center"
                style={{ 
                  borderRadius: "20px", 
                  padding: "8px 12px",
                  fontSize: "0.8rem"
                }}
              >
                <i className="fas fa-bell me-1"></i>
                {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
              </Badge>
            )}
            <Button 
              variant="outline-primary" 
              onClick={markAllAsRead}
              className="d-flex align-items-center"
              style={{ borderRadius: "10px" }}
            >
              <i className="fas fa-check-double me-2"></i>
              Tout marquer comme lu
            </Button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          {[
            { 
              title: "Total Messages", 
              count: messages.length, 
              icon: "fa-envelope", 
              color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            },
            { 
              title: "Non Lus", 
              count: unreadCount, 
              icon: "fa-bell", 
              color: "linear-gradient(135deg, #00b09b, #96c93d)"
            },
            { 
              title: "Support", 
              count: messages.filter(msg => msg.category === "Support").length, 
              icon: "fa-headset", 
              color: "linear-gradient(135deg, #4facfe, #00f2fe)"
            },
            { 
              title: "Partenaires", 
              count: messages.filter(msg => msg.category === "Partenaire").length, 
              icon: "fa-handshake", 
              color: "linear-gradient(135deg, #f093fb, #f5576c)"
            }
          ].map((stat, index) => (
            <Col md={3} key={index} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2">{stat.title}</h6>
                      <h2 className="fw-bold mb-0" style={{ 
                        background: stat.color,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}>
                        {stat.count}
                      </h2>
                    </div>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: "60px", 
                        height: "60px",
                        background: stat.color
                      }}
                    >
                      <i className={`fas ${stat.icon} text-white fs-4`}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Barre de recherche et filtres */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-search me-2"></i>
                    Recherche
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      border: "none",
                      color: "white"
                    }}>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder="Rechercher par expéditeur, email ou contenu..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: "0 10px 10px 0" }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-filter me-2"></i>
                    Catégorie
                  </Form.Label>
                  <Form.Select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="Tous">Toutes les catégories</option>
                    <option value="Support">Support</option>
                    <option value="Technique">Technique</option>
                    <option value="Partenaire">Partenaire</option>
                    <option value="Urgent">Urgent</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-sort me-2"></i>
                    Trier par
                  </Form.Label>
                  <Form.Select style={{ borderRadius: "10px" }}>
                    <option>Plus récent</option>
                    <option>Plus ancien</option>
                    <option>Non lus d'abord</option>
                    <option>Expéditeur</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2}>
                <Button 
                  variant="outline-secondary" 
                  onClick={() => { setSearchTerm(""); setFilterCategory("Tous"); }}
                  className="d-flex align-items-center w-100"
                  style={{ borderRadius: "10px" }}
                >
                  <i className="fas fa-times me-2"></i>
                  Effacer
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Row>
          {/* Liste des messages */}
          <Col md={5}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
              <Card.Body className="p-0">
                <div className="p-4 border-bottom">
                  <h5 className="fw-bold mb-0 d-flex align-items-center">
                    <i className="fas fa-inbox me-2 text-primary"></i>
                    Messages Reçus
                    <Badge bg="primary" className="ms-2">
                      {filteredMessages.length}
                    </Badge>
                  </h5>
                </div>
                
                <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                  {filteredMessages.length > 0 ? (
                    <ListGroup variant="flush">
                      {filteredMessages.map((msg) => (
                        <ListGroup.Item
                          key={msg.id}
                          action
                          onClick={() => {
                            setSelectedMessage(msg);
                            markAsRead(msg.id);
                          }}
                          className="border-0"
                          style={{
                            background: selectedMessage?.id === msg.id ? 
                              "linear-gradient(135deg, #667eea, #764ba2)" : 
                              "transparent",
                            color: selectedMessage?.id === msg.id ? "white" : "inherit",
                            borderLeft: selectedMessage?.id === msg.id ? "4px solid #667eea" : "4px solid transparent",
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            padding: "20px"
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="d-flex align-items-center">
                              <div 
                                className="rounded-circle d-flex align-items-center justify-content-center me-3"
                                style={{ 
                                  width: "40px", 
                                  height: "40px",
                                  background: selectedMessage?.id === msg.id ? 
                                    "rgba(255,255,255,0.2)" : 
                                    "linear-gradient(135deg, #667eea, #764ba2)",
                                  color: selectedMessage?.id === msg.id ? "white" : "white",
                                  fontSize: "0.9rem",
                                  fontWeight: "bold"
                                }}
                              >
                                {msg.sender.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h6 className="mb-0 fw-bold">{msg.sender}</h6>
                                <small className={selectedMessage?.id === msg.id ? "text-white-50" : "text-muted"}>
                                  {msg.email}
                                </small>
                              </div>
                            </div>
                            <div className="text-end">
                              <small className={selectedMessage?.id === msg.id ? "text-white-50" : "text-muted"}>
                                {formatDate(msg.date)}
                              </small>
                              {!msg.read && selectedMessage?.id !== msg.id && (
                                <div 
                                  className="mt-1"
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: "#28a745",
                                    display: "inline-block"
                                  }}
                                ></div>
                              )}
                            </div>
                          </div>
                          
                          <div className="mb-2">
                            <Badge 
                              bg={getCategoryVariant(msg.category)} 
                              className="d-flex align-items-center"
                              style={{ 
                                borderRadius: "15px",
                                fontSize: "0.7rem",
                                padding: "4px 8px",
                                width: "fit-content"
                              }}
                            >
                              <i className={`fas ${getCategoryIcon(msg.category)} me-1`}></i>
                              {msg.category}
                            </Badge>
                          </div>
                          
                          <p className="mb-0 small" style={{ 
                            lineHeight: "1.4",
                            opacity: selectedMessage?.id === msg.id ? 0.9 : 0.8
                          }}>
                            {msg.content.length > 80 ? `${msg.content.substring(0, 80)}...` : msg.content}
                          </p>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  ) : (
                    <div className="text-center py-5">
                      <i className="fas fa-envelope-open fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
                      <h6 className="text-muted mb-2">Aucun message trouvé</h6>
                      <p className="text-muted small">Aucun message ne correspond à vos critères de recherche</p>
                    </div>
                  )}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Détail du message */}
          <Col md={7}>
            {selectedMessage ? (
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                <Card.Body className="d-flex flex-column p-0">
                  {/* En-tête du message */}
                  <div className="p-4 border-bottom">
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div className="d-flex align-items-center">
                        <div 
                          className="rounded-circle d-flex align-items-center justify-content-center me-3"
                          style={{ 
                            width: "50px", 
                            height: "50px",
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            color: "white",
                            fontSize: "1.1rem",
                            fontWeight: "bold"
                          }}
                        >
                          {selectedMessage.sender.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h5 className="fw-bold mb-1">{selectedMessage.sender}</h5>
                          <p className="text-muted mb-0">{selectedMessage.email}</p>
                        </div>
                      </div>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => deleteMessage(selectedMessage.id)}
                        className="d-flex align-items-center"
                        style={{ borderRadius: "8px" }}
                      >
                        <i className="fas fa-trash"></i>
                      </Button>
                    </div>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge 
                        bg={getCategoryVariant(selectedMessage.category)} 
                        className="d-flex align-items-center"
                        style={{ 
                          borderRadius: "20px",
                          padding: "6px 12px",
                          fontSize: "0.8rem"
                        }}
                      >
                        <i className={`fas ${getCategoryIcon(selectedMessage.category)} me-1`}></i>
                        {selectedMessage.category}
                      </Badge>
                      <small className="text-muted">
                        <i className="fas fa-clock me-1"></i>
                        {formatDate(selectedMessage.date)}
                      </small>
                    </div>
                  </div>

                  {/* Contenu du message */}
                  <div className="p-4 flex-grow-1">
                    <div className="bg-light rounded p-4 mb-4">
                      <p className="mb-0" style={{ lineHeight: "1.6" }}>
                        {selectedMessage.content}
                      </p>
                    </div>

                    {/* Formulaire de réponse */}
                    <div>
                      <h6 className="fw-bold mb-3 d-flex align-items-center">
                        <i className="fas fa-reply me-2 text-primary"></i>
                        Répondre à {selectedMessage.sender}
                      </h6>
                      
                      <Form.Group className="mb-3">
                        <Form.Control
                          as="textarea"
                          rows={5}
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                          placeholder={`Écrivez votre réponse à ${selectedMessage.sender}...`}
                          style={{ 
                            borderRadius: "12px", 
                            padding: "15px",
                            border: "1px solid #e0e0e0",
                            resize: "none"
                          }}
                        />
                      </Form.Group>
                      
                      <div className="d-flex gap-2">
                        <Button 
                          variant="primary" 
                          onClick={handleReply}
                          className="d-flex align-items-center"
                          style={{ 
                            borderRadius: "10px",
                            background: "linear-gradient(135deg, #667eea, #764ba2)",
                            border: "none",
                            padding: "10px 20px"
                          }}
                        >
                          <i className="fas fa-paper-plane me-2"></i>
                          Envoyer la réponse
                        </Button>
                        <Button 
                          variant="outline-secondary" 
                          onClick={() => setReply("")}
                          className="d-flex align-items-center"
                          style={{ borderRadius: "10px" }}
                        >
                          <i className="fas fa-times me-2"></i>
                          Effacer
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Card className="border-0 shadow-sm h-100 d-flex align-items-center justify-content-center" style={{ borderRadius: "20px" }}>
                <Card.Body className="text-center py-5">
                  <i className="fas fa-comments fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
                  <h5 className="text-muted mb-2">Aucun message sélectionné</h5>
                  <p className="text-muted mb-0">Sélectionnez un message dans la liste pour voir son contenu</p>
                </Card.Body>
              </Card>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default MessageAdmin;