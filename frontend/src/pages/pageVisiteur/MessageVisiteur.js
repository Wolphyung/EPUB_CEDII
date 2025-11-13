import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import axios from "axios";

const MessageVisiteur = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [newMessage, setNewMessage] = useState({ recipientId: '', subject: '', content: '' });
  const [contacts, setContacts] = useState([]);
  const [activeTab, setActiveTab] = useState("inbox"); // "inbox" ou "compose"

  // 🔹 Charger les messages du visiteur
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get("/api/messages-visiteur");
        setMessages(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des messages:", error);
      }
    };

    fetchMessages();
  }, []);

  // 🔹 Charger les contacts (membres + admin)
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const res = await axios.get("/api/contacts-visiteur");
        setContacts(res.data);
      } catch (error) {
        console.error("Erreur lors du chargement des contacts:", error);
      }
    };

    fetchContacts();
  }, []);

  const markAsRead = (id) => {
    setMessages(messages.map(msg =>
      msg.id === id ? { ...msg, read: true } : msg
    ));
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.recipientId) {
      alert("Veuillez sélectionner un destinataire !");
      return;
    }

    try {
      const payload = {
        recipient_id: newMessage.recipientId,
        subject: newMessage.subject,
        content: newMessage.content,
      };
      await axios.post("/api/messages-visiteur", payload);

      alert("Message envoyé avec succès !");
      setNewMessage({ recipientId: '', subject: '', content: '' });
      setActiveTab("inbox");
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      alert("Erreur lors de l'envoi du message !");
    }
  };

  const unreadCount = messages.filter(m => !m.read).length;

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      
      {/* Hero Section - Même style */}
      <div className="bg-primary text-white py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25"></div>
        <div className="container position-relative">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">Messagerie</h1>
              <p className="lead mb-0 opacity-75">
                Gérez vos communications avec les membres et l'administration
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container py-5">
        <div className="row g-4">
          {/* Sidebar - Liste des messages */}
          <div className="col-lg-4">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-header bg-transparent border-0 pb-0">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="h4 text-dark mb-0">Boîte de réception</h2>
                  <span className="badge bg-primary">
                    {unreadCount} non lu{unreadCount > 1 ? 's' : ''}
                  </span>
                </div>

                {/* Bouton Nouveau Message */}
                <button 
                  className={`btn w-100 mb-4 ${activeTab === "compose" ? "btn-primary" : "btn-outline-primary"}`}
                  onClick={() => setActiveTab("compose")}
                >
                  <i className="fas fa-plus me-2"></i>
                  Nouveau Message
                </button>

                {/* Filtres */}
                <div className="d-flex gap-2 mb-4">
                  <button 
                    className={`btn btn-sm ${activeTab === "inbox" ? "btn-primary" : "btn-outline-primary"}`}
                    onClick={() => setActiveTab("inbox")}
                  >
                    Tous
                  </button>
                  <button className="btn btn-sm btn-outline-primary">
                    Non lus
                  </button>
                </div>
              </div>

              {/* Liste des messages */}
              <div className="card-body p-0">
                <div className="list-group list-group-flush">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`list-group-item list-group-item-action border-0 py-3 px-4 cursor-pointer ${
                        !message.read ? 'bg-light bg-opacity-50' : ''
                      } ${selectedMessage?.id === message.id ? 'bg-primary bg-opacity-10' : ''}`}
                      onClick={() => {
                        setSelectedMessage(message);
                        markAsRead(message.id);
                        setActiveTab("inbox");
                      }}
                    >
                      <div className="d-flex align-items-start mb-2">
                        <div className="flex-grow-1">
                          <div className="d-flex justify-content-between align-items-start">
                            <h6 className={`mb-1 ${!message.read ? 'fw-bold text-dark' : 'text-dark'}`}>
                              {message.sender}
                            </h6>
                            {message.important && (
                              <i className="fas fa-star text-warning"></i>
                            )}
                          </div>
                          <p className={`mb-1 ${!message.read ? 'fw-semibold' : 'text-muted'}`}>
                            {message.subject}
                          </p>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center">
                        <small className="text-muted">{message.date}</small>
                        {!message.read && (
                          <span className="badge bg-primary rounded-circle p-1">
                            <span className="visually-hidden">Non lu</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {messages.length === 0 && (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox display-1 text-muted mb-3"></i>
                    <p className="text-muted">Aucun message</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content - Détails du message ou nouveau message */}
          <div className="col-lg-8">
            {activeTab === "inbox" && selectedMessage ? (
              /* Détails du message sélectionné */
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-transparent border-0">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h3 className="h4 text-dark mb-2">{selectedMessage.subject}</h3>
                      <div className="d-flex flex-wrap gap-3 text-muted small">
                        <span>
                          <i className="fas fa-user me-1"></i>
                          De: {selectedMessage.sender}
                        </span>
                        <span>
                          <i className="fas fa-calendar me-1"></i>
                          Le: {selectedMessage.date}
                        </span>
                        {selectedMessage.time && (
                          <span>
                            <i className="fas fa-clock me-1"></i>
                            À: {selectedMessage.time}
                          </span>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setSelectedMessage(null)}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="border-top pt-4">
                    <p className="text-dark leading-relaxed" style={{whiteSpace: 'pre-wrap'}}>
                      {selectedMessage.content}
                    </p>
                  </div>
                  
                  <div className="border-top pt-4 mt-4">
                    <div className="d-flex gap-2">
                      <button className="btn btn-primary">
                        <i className="fas fa-reply me-2"></i>
                        Répondre
                      </button>
                      <button className="btn btn-outline-secondary">
                        <i className="fas fa-share me-2"></i>
                        Transférer
                      </button>
                      <button className="btn btn-outline-danger ms-auto">
                        <i className="fas fa-trash me-2"></i>
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : activeTab === "compose" ? (
              /* Formulaire de nouveau message */
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-transparent border-0">
                  <div className="d-flex justify-content-between align-items-center">
                    <h3 className="h4 text-dark mb-0">Nouveau Message</h3>
                    <button 
                      onClick={() => setActiveTab("inbox")}
                      className="btn btn-outline-secondary btn-sm"
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Retour
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSendMessage} className="card-body">
                  <div className="row g-4">
                    {/* Destinataire */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Destinataire</label>
                      <select
                        value={newMessage.recipientId}
                        onChange={(e) => setNewMessage({...newMessage, recipientId: e.target.value})}
                        className="form-select form-select-lg"
                        required
                      >
                        {contacts.length === 0 ? (
                          <option value="">Support CEDII (Admin)</option>
                        ) : (
                          <>
                            <option value="">-- Sélectionnez un destinataire --</option>
                            {contacts.map(c => (
                              <option key={c.id} value={c.id}>
                                {c.nom} ({c.type})
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                    </div>

                    {/* Sujet */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Sujet</label>
                      <input
                        type="text"
                        value={newMessage.subject}
                        onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                        className="form-control form-control-lg"
                        placeholder="Objet de votre message"
                        required
                      />
                    </div>

                    {/* Message */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">Message</label>
                      <textarea
                        value={newMessage.content}
                        onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                        rows="8"
                        className="form-control"
                        placeholder="Tapez votre message ici..."
                        required
                      ></textarea>
                    </div>

                    {/* Actions */}
                    <div className="col-12">
                      <div className="border-top pt-4">
                        <div className="d-flex gap-2 justify-content-end">
                          <button 
                            type="button" 
                            className="btn btn-outline-secondary"
                            onClick={() => {
                              setNewMessage({ recipientId: '', subject: '', content: '' });
                              setActiveTab("inbox");
                            }}
                          >
                            <i className="fas fa-times me-2"></i>
                            Annuler
                          </button>
                          <button type="submit" className="btn btn-primary">
                            <i className="fas fa-paper-plane me-2"></i>
                            Envoyer le message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            ) : (
              /* État vide - Aucun message sélectionné */
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column align-items-center justify-content-center text-center py-5">
                  <i className="fas fa-envelope-open display-1 text-muted mb-3"></i>
                  <h4 className="text-dark mb-2">Aucun message sélectionné</h4>
                  <p className="text-muted mb-4">
                    Sélectionnez un message dans votre boîte de réception ou composez un nouveau message.
                  </p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => setActiveTab("compose")}
                  >
                    <i className="fas fa-plus me-2"></i>
                    Nouveau Message
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageVisiteur;