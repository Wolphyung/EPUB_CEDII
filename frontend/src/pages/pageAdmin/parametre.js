import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Button, Form, Alert, Card, Row, Col, ProgressBar, InputGroup } from "react-bootstrap";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const ParametreAdmin = () => {
  const [adminInfo, setAdminInfo] = useState({ 
    nom: "Admin", 
    email: "admin@cedii.com",
    telephone: "",
    poste: "Administrateur"
  });
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [pwStrength, setPwStrength] = useState(0);
  const [loading, setLoading] = useState(false);

  // Afficher messages temporairement
  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: "", message: "" });
    }, 5000);
  };

  // Charger les informations admin
  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user) {
          setAdminInfo(prev => ({
            ...prev,
            nom: user.nom || "Admin",
            email: user.email || "admin@cedii.com"
          }));
        }
      } catch (error) {
        console.error("Erreur chargement info admin:", error);
      }
    };
    fetchAdminInfo();
  }, []);

  const handleChangeInfo = (e) => {
    const { name, value } = e.target;
    setAdminInfo({ ...adminInfo, [name]: value });
  };

  const handlePasswordInput = (e) => {
    const val = e.target.value;
    setNewPassword(val);

    let score = 0;
    if (val.length >= 8) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;
    setPwStrength(score * 25);
  };

  const getPasswordStrengthColor = () => {
    if (pwStrength <= 25) return "#dc3545";
    if (pwStrength <= 50) return "#ffc107";
    if (pwStrength <= 75) return "#17a2b8";
    return "#28a745";
  };

  const getPasswordStrengthText = () => {
    if (pwStrength <= 25) return "Faible";
    if (pwStrength <= 50) return "Moyen";
    if (pwStrength <= 75) return "Bon";
    return "Fort";
  };

  // Sauvegarder les informations admin
  const handleSaveInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Simuler l'appel API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mettre à jour le localStorage
      const user = JSON.parse(localStorage.getItem("user")) || {};
      localStorage.setItem("user", JSON.stringify({ ...user, ...adminInfo }));
      
      showNotification("success", "✅ Informations mises à jour avec succès !");
    } catch (error) {
      console.error("Erreur sauvegarde info:", error);
      showNotification("error", "❌ Erreur lors de la mise à jour des informations");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      showNotification("error", "❌ Les nouveaux mots de passe ne correspondent pas !");
      setLoading(false);
      return;
    }

    if (pwStrength < 100) {
      showNotification("error", "❌ Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 chiffre et 1 caractère spécial !");
      setLoading(false);
      return;
    }

    try {
      // Simuler l'appel API pour changer le mot de passe
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      showNotification("success", "✅ Mot de passe modifié avec succès !");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setPwStrength(0);
    } catch (error) {
      console.error("Erreur changement mot de passe:", error);
      showNotification("error", "❌ Erreur lors du changement de mot de passe");
    } finally {
      setLoading(false);
    }
  };

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
              Paramètres Administrateur
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-cogs me-2"></i>
              Gérez vos préférences et paramètres de compte
            </p>
          </div>
          <div className="d-flex align-items-center">
            <div 
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{ 
                width: "50px", 
                height: "50px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                color: "white",
                fontSize: "1.2rem",
                fontWeight: "bold"
              }}
            >
              {adminInfo.nom.charAt(0).toUpperCase()}
            </div>
            <div>
              <strong className="d-block">{adminInfo.nom}</strong>
              <small className="text-muted">{adminInfo.poste}</small>
            </div>
          </div>
        </div>

        <Row className="g-4">
          {/* Informations Admin */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: "40px", 
                      height: "40px",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      color: "white"
                    }}
                  >
                    <i className="fas fa-user-cog"></i>
                  </div>
                  <div>
                    <Card.Title className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                      Informations Personnelles
                    </Card.Title>
                    <small className="text-muted">Mettez à jour vos informations de compte</small>
                  </div>
                </div>

                <Form onSubmit={handleSaveInfo}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-user me-2 text-primary"></i>
                      Nom complet
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="nom" 
                      value={adminInfo.nom} 
                      onChange={handleChangeInfo}
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Votre nom complet"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      Adresse email
                    </Form.Label>
                    <Form.Control 
                      type="email" 
                      name="email" 
                      value={adminInfo.email} 
                      onChange={handleChangeInfo}
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="votre@email.com"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-phone me-2 text-primary"></i>
                      Téléphone
                    </Form.Label>
                    <Form.Control 
                      type="tel" 
                      name="telephone" 
                      value={adminInfo.telephone} 
                      onChange={handleChangeInfo}
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="+212 6 XX XX XX XX"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-briefcase me-2 text-primary"></i>
                      Poste
                    </Form.Label>
                    <Form.Control 
                      type="text" 
                      name="poste" 
                      value={adminInfo.poste} 
                      onChange={handleChangeInfo}
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Votre poste"
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit"
                    disabled={loading}
                    className="d-flex align-items-center w-100 justify-content-center"
                    style={{ 
                      borderRadius: "10px", 
                      padding: "12px",
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      border: "none",
                      fontWeight: "600"
                    }}
                  >
                    <i className="fas fa-save me-2"></i>
                    {loading ? "Sauvegarde..." : "Sauvegarder les modifications"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Changement mot de passe */}
          <Col md={6}>
            <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: "40px", 
                      height: "40px",
                      background: "linear-gradient(135deg, #00b09b, #96c93d)",
                      color: "white"
                    }}
                  >
                    <i className="fas fa-lock"></i>
                  </div>
                  <div>
                    <Card.Title className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                      Sécurité du Compte
                    </Card.Title>
                    <small className="text-muted">Modifiez votre mot de passe</small>
                  </div>
                </div>

                <Form onSubmit={handleChangePassword}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-key me-2 text-primary"></i>
                      Mot de passe actuel
                    </Form.Label>
                    <Form.Control
                      type="password"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      required
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Entrez votre mot de passe actuel"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-key me-2 text-primary"></i>
                      Nouveau mot de passe
                    </Form.Label>
                    <InputGroup>
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={handlePasswordInput}
                        required
                        style={{ borderRadius: "10px", padding: "12px" }}
                        placeholder="Créez un nouveau mot de passe"
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ 
                          borderRadius: "10px",
                          border: "1px solid #dee2e6",
                          marginLeft: "5px"
                        }}
                      >
                        <i className={`fas ${showPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
                      </Button>
                    </InputGroup>
                    
                    {newPassword && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="fw-semibold">Force du mot de passe:</small>
                          <small style={{ color: getPasswordStrengthColor(), fontWeight: "600" }}>
                            {getPasswordStrengthText()}
                          </small>
                        </div>
                        <ProgressBar
                          now={pwStrength}
                          style={{ 
                            height: "6px",
                            borderRadius: "10px",
                            backgroundColor: "rgba(0,0,0,0.1)"
                          }}
                        >
                          <ProgressBar 
                            now={pwStrength} 
                            style={{ 
                              backgroundColor: getPasswordStrengthColor(),
                              borderRadius: "10px"
                            }} 
                          />
                        </ProgressBar>
                        <small className="text-muted mt-2 d-block">
                          <i className="fas fa-info-circle me-1"></i>
                          Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial
                        </small>
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-key me-2 text-primary"></i>
                      Confirmer le mot de passe
                    </Form.Label>
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ borderRadius: "10px", padding: "12px" }}
                      placeholder="Confirmez votre nouveau mot de passe"
                    />
                  </Form.Group>

                  <Button 
                    variant="success" 
                    type="submit"
                    disabled={loading}
                    className="d-flex align-items-center w-100 justify-content-center"
                    style={{ 
                      borderRadius: "10px", 
                      padding: "12px",
                      background: "linear-gradient(135deg, #00b09b, #96c93d)",
                      border: "none",
                      fontWeight: "600"
                    }}
                  >
                    <i className="fas fa-lock me-2"></i>
                    {loading ? "Modification..." : "Modifier le mot de passe"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Section Préférences */}
          <Col md={12}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: "20px" }}>
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <div 
                    className="rounded-circle d-flex align-items-center justify-content-center me-3"
                    style={{ 
                      width: "40px", 
                      height: "40px",
                      background: "linear-gradient(135deg, #f093fb, #f5576c)",
                      color: "white"
                    }}
                  >
                    <i className="fas fa-sliders-h"></i>
                  </div>
                  <div>
                    <Card.Title className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                      Préférences Système
                    </Card.Title>
                    <small className="text-muted">Configurez les paramètres de la plateforme</small>
                  </div>
                </div>

                <Row className="g-4">
                  <Col md={4}>
                    <div className="text-center p-3 border rounded" style={{ borderRadius: "15px" }}>
                      <i className="fas fa-bell text-primary fs-2 mb-3"></i>
                      <h6 className="fw-bold">Notifications</h6>
                      <small className="text-muted d-block mb-2">Gérer les alertes et notifications</small>
                      <Button variant="outline-primary" size="sm">
                        Configurer
                      </Button>
                    </div>
                  </Col>
                  
                  <Col md={4}>
                    <div className="text-center p-3 border rounded" style={{ borderRadius: "15px" }}>
                      <i className="fas fa-language text-success fs-2 mb-3"></i>
                      <h6 className="fw-bold">Langue</h6>
                      <small className="text-muted d-block mb-2">Français (FR)</small>
                      <Button variant="outline-success" size="sm">
                        Changer
                      </Button>
                    </div>
                  </Col>
                  
                  <Col md={4}>
                    <div className="text-center p-3 border rounded" style={{ borderRadius: "15px" }}>
                      <i className="fas fa-database text-info fs-2 mb-3"></i>
                      <h6 className="fw-bold">Sauvegarde</h6>
                      <small className="text-muted d-block mb-2">Dernière sauvegarde: Aujourd'hui</small>
                      <Button variant="outline-info" size="sm">
                        Sauvegarder
                      </Button>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ParametreAdmin;