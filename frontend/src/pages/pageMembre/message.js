import React, { useState, useEffect, useRef } from "react";
import { Card, ListGroup, Button, Form, Badge, InputGroup } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

const MessagerieMembre = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [conversations, setConversations] = useState([
    { 
      id: 1, 
      nom: "Jean Dupont", 
      avatar: "👨‍💼",
      statut: "en_ligne",
      dernierMessage: "Salut, comment ça va ?", 
      timestamp: "10:30",
      nonLu: 2,
      messages: [
        { id: 1, texte: "Salut, comment ça va ?", envoyeur: "autre", heure: "10:25" },
        { id: 2, texte: "Tout va bien ! Merci de demander. Et de ton côté ?", envoyeur: "moi", heure: "10:28" },
        { id: 3, texte: "Super, je travaille sur le nouveau projet. Tu as vu les dernières mises à jour ?", envoyeur: "autre", heure: "10:30" }
      ] 
    },
    { 
      id: 2, 
      nom: "Marie Martin", 
      avatar: "👩‍💻",
      statut: "hors_ligne",
      dernierMessage: "As-tu reçu le document que je t'ai envoyé ?", 
      timestamp: "Hier",
      nonLu: 0,
      messages: [
        { id: 1, texte: "As-tu reçu le document que je t'ai envoyé ?", envoyeur: "autre", heure: "16:45" },
        { id: 2, texte: "Oui, je l'ai reçu. Je le regarde cet après-midi.", envoyeur: "moi", heure: "16:50" }
      ] 
    },
    { 
      id: 3, 
      nom: "Admin CEDII", 
      avatar: "🏢",
      statut: "en_ligne",
      dernierMessage: "Nouvelle offre d'emploi disponible !", 
      timestamp: "09:15",
      nonLu: 1,
      messages: [
        { id: 1, texte: "Nouvelle offre d'emploi disponible ! Consultez-la sur votre tableau de bord.", envoyeur: "autre", heure: "09:15" }
      ] 
    },
    { 
      id: 4, 
      nom: "Pierre Lambert", 
      avatar: "👨‍🎓",
      statut: "absent",
      dernierMessage: "Merci pour ton aide sur le projet", 
      timestamp: "23/09",
      nonLu: 0,
      messages: [
        { id: 1, texte: "Merci pour ton aide sur le projet, c'était super !", envoyeur: "autre", heure: "14:20" },
        { id: 2, texte: "Avec plaisir ! N'hésite pas si tu as besoin d'aide à nouveau.", envoyeur: "moi", heure: "14:25" }
      ] 
    }
  ]);

  const [selectedConv, setSelectedConv] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  // Gérer l'état de la sidebar
  const handleSidebarCollapse = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  // Filtrer les conversations
  const filteredConversations = conversations.filter(conv =>
    conv.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sélectionner une conversation
  const handleSelectConv = (conv) => {
    // Marquer les messages comme lus
    const updatedConv = { ...conv, nonLu: 0 };
    setConversations(conversations.map(c => 
      c.id === conv.id ? updatedConv : c
    ));
    setSelectedConv(updatedConv);
  };

  // Envoyer un message
  const handleSendMessage = () => {
    if (newMessage.trim() === "") return;

    const nouveauMessage = {
      id: selectedConv.messages.length + 1,
      texte: newMessage,
      envoyeur: "moi",
      heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedConv = {
      ...selectedConv,
      messages: [...selectedConv.messages, nouveauMessage],
      dernierMessage: newMessage,
      timestamp: "Maintenant",
      nonLu: 0
    };

    setConversations(
      conversations.map((conv) =>
        conv.id === selectedConv.id ? updatedConv : conv
      )
    );

    setSelectedConv(updatedConv);
    setNewMessage("");
  };

  // Auto-scroll vers le dernier message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedConv.messages]);

  // Statut badge
  const getStatusBadge = (statut) => {
    const statusConfig = {
      en_ligne: { color: "#00d664", text: "En ligne" },
      hors_ligne: { color: "#6c757d", text: "Hors ligne" },
      absent: { color: "#ffc107", text: "Absent" }
    };
    
    const config = statusConfig[statut] || statusConfig.hors_ligne;
    return (
      <div className="d-flex align-items-center">
        <div 
          className="rounded-circle me-1"
          style={{
            width: "8px",
            height: "8px",
            backgroundColor: config.color
          }}
        ></div>
        <small style={{ color: config.color, fontSize: "0.75rem" }}>
          {config.text}
        </small>
      </div>
    );
  };

  return (
    <div className="d-flex min-vh-100" style={{ 
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
    }}>
      {/* Sidebar */}
      <div style={{ 
        width: sidebarCollapsed ? "80px" : "280px",
        transition: "width 0.3s ease",
        flexShrink: 0
      }}>
        <MembreSidebar onCollapse={handleSidebarCollapse} />
      </div>

      {/* Contenu Principal */}
      <div className="flex-grow-1" style={{ 
        padding: "20px",
        marginLeft: "0",
        transition: "all 0.3s ease"
      }}>
        <div className="d-flex h-100" style={{ gap: "20px", minHeight: "80vh" }}>
          {/* Liste des conversations */}
          <Card 
            className="shadow-lg border-0 flex-shrink-0"
            style={{ 
              width: "350px",
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)"
            }}
          >
            <Card.Header 
              className="border-0 bg-transparent py-4"
              style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
            >
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                  <i className="fas fa-comments me-2 text-primary"></i>
                  Messages
                </h4>
                <Badge 
                  bg="primary" 
                  className="px-3 py-2"
                  style={{ borderRadius: "15px", fontSize: "0.8rem" }}
                >
                  {conversations.reduce((acc, conv) => acc + conv.nonLu, 0)}
                </Badge>
              </div>
              
              {/* Barre de recherche */}
              <InputGroup className="mb-3">
                <InputGroup.Text 
                  className="border-0 bg-light"
                  style={{ borderTopLeftRadius: "15px", borderBottomLeftRadius: "15px" }}
                >
                  <i className="fas fa-search text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Rechercher une conversation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border-0 bg-light"
                  style={{ borderTopRightRadius: "15px", borderBottomRightRadius: "15px" }}
                />
              </InputGroup>
            </Card.Header>

            <ListGroup 
              variant="flush"
              className="flex-grow-1"
              style={{ overflowY: "auto" }}
            >
              {filteredConversations.map((conv) => (
                <ListGroup.Item
                  key={conv.id}
                  action
                  className="border-0 py-3 px-4"
                  style={{ 
                    background: selectedConv.id === conv.id ? 
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "transparent",
                    color: selectedConv.id === conv.id ? "white" : "inherit",
                    borderLeft: selectedConv.id === conv.id ? "4px solid #667eea" : "4px solid transparent",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  onClick={() => handleSelectConv(conv)}
                >
                  <div className="d-flex align-items-start">
                    {/* Avatar */}
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                      style={{
                        width: "50px",
                        height: "50px",
                        background: selectedConv.id === conv.id ? 
                          "rgba(255, 255, 255, 0.2)" : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        fontSize: "1.2rem"
                      }}
                    >
                      {conv.avatar}
                    </div>

                    {/* Contenu */}
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="d-flex justify-content-between align-items-start mb-1">
                        <h6 
                          className="fw-bold mb-0"
                          style={{ 
                            fontSize: "0.95rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis"
                          }}
                        >
                          {conv.nom}
                        </h6>
                        <small className={selectedConv.id === conv.id ? "text-white-50" : "text-muted"}>
                          {conv.timestamp}
                        </small>
                      </div>

                      <div className="d-flex justify-content-between align-items-center">
                        <p 
                          className="mb-0"
                          style={{ 
                            fontSize: "0.85rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            opacity: selectedConv.id === conv.id ? 0.9 : 0.7
                          }}
                        >
                          {conv.dernierMessage}
                        </p>
                        
                        {conv.nonLu > 0 && selectedConv.id !== conv.id && (
                          <Badge 
                            bg="danger" 
                            className="ms-2 flex-shrink-0"
                            style={{ borderRadius: "10px", fontSize: "0.7rem" }}
                          >
                            {conv.nonLu}
                          </Badge>
                        )}
                      </div>

                      {/* Statut */}
                      {selectedConv.id !== conv.id && (
                        <div className="mt-1">
                          {getStatusBadge(conv.statut)}
                        </div>
                      )}
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>

          {/* Fenêtre de chat */}
          <Card 
            className="shadow-lg border-0 flex-grow-1 d-flex flex-column"
            style={{ 
              borderRadius: "20px",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)"
            }}
          >
            {/* En-tête du chat */}
            <Card.Header 
              className="border-0 bg-transparent py-4"
              style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
            >
              <div className="d-flex align-items-center">
                <div 
                  className="rounded-circle d-flex align-items-center justify-content-center me-3"
                  style={{
                    width: "50px",
                    height: "50px",
                    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    fontSize: "1.2rem",
                    color: "white"
                  }}
                >
                  {selectedConv.avatar}
                </div>
                <div className="flex-grow-1">
                  <h5 className="fw-bold mb-1" style={{ color: "#2c3e50" }}>
                    {selectedConv.nom}
                  </h5>
                  {getStatusBadge(selectedConv.statut)}
                </div>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="rounded-circle"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="fas fa-phone"></i>
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="rounded-circle"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="fas fa-video"></i>
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    className="rounded-circle"
                    style={{ width: "40px", height: "40px" }}
                  >
                    <i className="fas fa-ellipsis-v"></i>
                  </Button>
                </div>
              </div>
            </Card.Header>

            {/* Corps du chat */}
            <Card.Body 
              className="flex-grow-1 p-4"
              style={{ 
                overflowY: "auto",
                background: "linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%)"
              }}
            >
              <div className="d-flex flex-column" style={{ gap: "16px" }}>
                {selectedConv.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`d-flex ${msg.envoyeur === "moi" ? "justify-content-end" : "justify-content-start"}`}
                  >
                    <div
                      className={`p-3 rounded-4 position-relative ${
                        msg.envoyeur === "moi" 
                          ? "text-white" 
                          : "bg-light text-dark"
                      }`}
                      style={{
                        maxWidth: "70%",
                        background: msg.envoyeur === "moi" 
                          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                          : "white",
                        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
                        borderBottomLeftRadius: msg.envoyeur === "moi" ? "20px" : "4px",
                        borderBottomRightRadius: msg.envoyeur === "moi" ? "4px" : "20px"
                      }}
                    >
                      <div className="mb-1">{msg.texte}</div>
                      <small 
                        className={`d-block text-end ${
                          msg.envoyeur === "moi" ? "text-white-50" : "text-muted"
                        }`}
                        style={{ fontSize: "0.75rem" }}
                      >
                        {msg.heure}
                      </small>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </Card.Body>

            {/* Pied du chat */}
            <Card.Footer className="border-0 bg-transparent py-3">
              <Form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <InputGroup>
                  <Button 
                    variant="outline-secondary" 
                    className="border-0 rounded-pill me-2"
                    style={{ width: "45px", height: "45px" }}
                  >
                    <i className="fas fa-paperclip"></i>
                  </Button>
                  <Form.Control
                    type="text"
                    placeholder="Écrire un message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="border-0 rounded-pill bg-light"
                    style={{ height: "45px" }}
                  />
                  <Button 
                    type="submit" 
                    variant="primary" 
                    className="rounded-pill ms-2 px-4"
                    disabled={!newMessage.trim()}
                    style={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      border: "none",
                      height: "45px"
                    }}
                  >
                    <i className="fas fa-paper-plane"></i>
                  </Button>
                </InputGroup>
              </Form>
            </Card.Footer>
          </Card>
        </div>
      </div>

      {/* Styles CSS supplémentaires */}
      <style>
        {`
          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .list-group-item {
            transition: all 0.3s ease;
          }
          
          .list-group-item:hover {
            background: rgba(102, 126, 234, 0.05) !important;
          }
          
          .btn {
            transition: all 0.3s ease;
          }
          
          .btn:hover {
            transform: translateY(-1px);
          }
          
          /* Scrollbar personnalisée */
          ::-webkit-scrollbar {
            width: 6px;
          }
          
          ::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.05);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(102, 126, 234, 0.3);
            border-radius: 10px;
          }
          
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(102, 126, 234, 0.5);
          }
        `}
      </style>
    </div>
  );
};

export default MessagerieMembre;