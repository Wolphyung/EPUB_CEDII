import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Alert,
  Badge,
  ProgressBar,
  Modal,
  Form,
  Tab,
  Nav,
  Tabs,
  ListGroup,
  Table,
  Spinner,
  OverlayTrigger,
  Tooltip
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import {
  FaCreditCard,
  FaPaypal,
  FaMobileAlt,
  FaExchangeAlt,
  FaHistory,
  FaCheckCircle,
  FaExclamationTriangle,
  FaClock,
  FaTimesCircle,
  FaCalendarAlt,
  FaEuroSign,
  FaSyncAlt,
  FaDownload,
  FaPrint,
  FaReceipt,
  FaShieldAlt,
  FaLock,
  FaBolt
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const C = {
  primary: "#667eea",
  secondary: "#764ba2",
  success: "#28a745",
  warning: "#ffc107",
  danger: "#dc3545",
  info: "#17a2b8",
  gray: "#6c757d",
  white: "#FFFFFF",
  bg: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  cardBg: "#FFFFFF",
};

const AbonnementMembrePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("current");
  
  // État de l'abonnement actuel
  const [abonnementActuel, setAbonnementActuel] = useState(null);
  const [abonnementLoading, setAbonnementLoading] = useState(true);
  
  // Historique des abonnements
  const [historique, setHistorique] = useState([]);
  const [historiqueLoading, setHistoriqueLoading] = useState(false);
  
  // Formules d'abonnement disponibles
  const [formules, setFormules] = useState([
    {
      id: 1,
      type: "mensuel",
      nom: "Mensuel",
      prix: 9.99,
      economie: "Standard",
      duree_jours: 30,
      avantages: [
        "Accès à toutes les publications",
        "Notifications des événements",
        "Support email prioritaire",
        "5 publications maximum par mois"
      ],
      popular: false,
      bestValue: false
    },
    {
      id: 2,
      type: "trimestriel",
      nom: "Trimestriel",
      prix: 24.99,
      economie: "Économisez 15%",
      duree_jours: 90,
      avantages: [
        "Tous les avantages mensuels",
        "Publications illimitées",
        "Support chat en direct",
        "Rapport mensuel personnalisé",
        "Accès aux statistiques avancées"
      ],
      popular: true,
      bestValue: false
    },
    {
      id: 3,
      type: "annuel",
      nom: "Annuel",
      prix: 89.99,
      economie: "Économisez 25%",
      duree_jours: 365,
      avantages: [
        "Tous les avantages trimestriels",
        "Accès prioritaire au support 24/7",
        "Formation en ligne gratuite",
        "Certificat de membre premium",
        "Promotions exclusives",
        "Accès anticipé aux nouvelles fonctionnalités"
      ],
      popular: false,
      bestValue: true
    }
  ]);
  
  // Paiement
  const [selectedFormule, setSelectedFormule] = useState(null);
  const [showPaiementModal, setShowPaiementModal] = useState(false);
  const [paiementLoading, setPaiementLoading] = useState(false);
  const [paiementSuccess, setPaiementSuccess] = useState(false);
  
  // Informations de paiement
  const [paiementInfo, setPaiementInfo] = useState({
    methode: "carte",
    numeroCarte: "",
    dateExpiration: "",
    cvv: "",
    nomTitulaire: "",
    email: "",
    saveCard: false,
    coupon: ""
  });
  
  // Statistiques
  const [stats, setStats] = useState({
    totalDepense: 0,
    abonnementsActifs: 0,
    joursMoyens: 0,
    dernierRenouvellement: null
  });

  // Charger les données d'abonnement
  useEffect(() => {
    fetchAbonnementData();
  }, []);

  const fetchAbonnementData = async () => {
    try {
      setLoading(true);
      setAbonnementLoading(true);
      
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      
      if (!token || !user.id) {
        console.warn("Utilisateur non connecté");
        navigate("/login");
        return;
      }

      const headers = { Authorization: `Bearer ${token}` };
      
      // Récupérer l'abonnement actuel
      const abonnementRes = await axios.get(
        `http://127.0.0.1:8000/api/abonnements/check/${user.id}`,
        { headers }
      ).catch(error => {
        console.error("Erreur abonnement:", error);
        return { data: { success: false } };
      });

      if (abonnementRes.data.success && abonnementRes.data.data) {
        const data = abonnementRes.data.data;
        const dateFin = new Date(data.date_fin);
        const now = new Date();
        const joursRestants = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));
        
        setAbonnementActuel({
          ...data,
          jours_restants: joursRestants,
          is_expired: dateFin < now || data.statut !== 'actif',
          expire_bientot: !(dateFin < now || data.statut !== 'actif') && joursRestants <= 7,
          pourcentage: Math.max(0, Math.min(100, (joursRestants / (data.type_abonnement === "mensuel" ? 30 : 
                                      data.type_abonnement === "trimestriel" ? 90 : 365)) * 100))
        });
      } else {
        // Aucun abonnement actif
        setAbonnementActuel({
          has_abonnement: false,
          message: "Aucun abonnement actif"
        });
      }

      // Récupérer l'historique
      setHistoriqueLoading(true);
      const historiqueRes = await axios.get(
        `http://127.0.0.1:8000/api/abonnements/membre/${user.id}`,
        { headers }
      ).catch(() => ({ data: { data: [] } }));

      if (historiqueRes.data.data) {
        setHistorique(historiqueRes.data.data);
        
        // Calculer les statistiques
        const total = historiqueRes.data.data.reduce((sum, item) => sum + parseFloat(item.montant), 0);
        const actifs = historiqueRes.data.data.filter(item => 
          item.statut === 'actif' && new Date(item.date_fin) > new Date()
        ).length;
        
        setStats({
          totalDepense: total,
          abonnementsActifs: actifs,
          joursMoyens: 90, // Valeur par défaut
          dernierRenouvellement: historiqueRes.data.data.length > 0 ? 
            historiqueRes.data.data[0].created_at : null
        });
      }

    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      
      // Données de démonstration
      setAbonnementActuel({
        id: 1,
        type_abonnement: "trimestriel",
        date_debut: "2024-01-01",
        date_fin: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        statut: "actif",
        montant: 24.99,
        methode_paiement: "Carte",
        jours_restants: 45,
        is_expired: false,
        expire_bientot: false,
        pourcentage: 50
      });

      setHistorique([
        {
          id: 1,
          type_abonnement: "mensuel",
          date_debut: "2023-11-01",
          date_fin: "2023-12-01",
          statut: "expiré",
          montant: 9.99,
          methode_paiement: "PayPal"
        },
        {
          id: 2,
          type_abonnement: "trimestriel",
          date_debut: "2023-12-01",
          date_fin: "2024-03-01",
          statut: "expiré",
          montant: 24.99,
          methode_paiement: "Carte"
        },
        {
          id: 3,
          type_abonnement: "trimestriel",
          date_debut: "2024-03-01",
          date_fin: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          statut: "actif",
          montant: 24.99,
          methode_paiement: "Carte"
        }
      ]);

      setStats({
        totalDepense: 59.97,
        abonnementsActifs: 1,
        joursMoyens: 90,
        dernierRenouvellement: "2024-03-01T00:00:00"
      });

    } finally {
      setLoading(false);
      setAbonnementLoading(false);
      setHistoriqueLoading(false);
    }
  };

  // === COMPOSANT ABONNEMENT ACTUEL ===
  const CurrentSubscriptionCard = () => {
    if (abonnementLoading) {
      return (
        <Card className="shadow border-0" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-5 text-center">
            <Spinner animation="border" variant="primary" />
            <p className="mt-3 text-muted">Chargement de votre abonnement...</p>
          </Card.Body>
        </Card>
      );
    }

    if (!abonnementActuel || !abonnementActuel.id) {
      return (
        <Card className="shadow border-0" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-5 text-center">
            <div className="mb-4">
              <FaCreditCard size={60} className="text-muted" />
            </div>
            <h4 className="fw-bold mb-3">Aucun abonnement actif</h4>
            <p className="text-muted mb-4">
              Vous n'avez pas d'abonnement en cours. Souscrivez à un abonnement pour accéder à toutes les fonctionnalités premium.
            </p>
            <Button 
              variant="success" 
              size="lg"
              onClick={() => setActiveTab("plans")}
              className="px-5"
            >
              <FaCreditCard className="me-2" />
              Souscrire un abonnement
            </Button>
          </Card.Body>
        </Card>
      );
    }

    const getStatusConfig = () => {
      if (abonnementActuel.is_expired) {
        return {
          variant: "danger",
          icon: FaTimesCircle,
          label: "Expiré",
          message: "Votre abonnement a expiré"
        };
      }
      
      if (abonnementActuel.expire_bientot) {
        return {
          variant: "warning",
          icon: FaExclamationTriangle,
          label: "Expire bientôt",
          message: `Expire dans ${abonnementActuel.jours_restants} jours`
        };
      }
      
      return {
        variant: "success",
        icon: FaCheckCircle,
        label: "Actif",
        message: `Valide pour ${abonnementActuel.jours_restants} jours`
      };
    };

    const status = getStatusConfig();
    const typeLabel = abonnementActuel.type_abonnement === "mensuel" ? "Mensuel" :
                     abonnementActuel.type_abonnement === "trimestriel" ? "Trimestriel" : "Annuel";

    return (
      <Card className="shadow border-0" style={{ borderRadius: "20px" }}>
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div>
              <h4 className="fw-bold mb-1">Votre abonnement actuel</h4>
              <p className="text-muted mb-0">Gérez et renouvelez votre abonnement</p>
            </div>
            <Badge bg={status.variant} className="px-3 py-2 fs-6">
              <status.icon className="me-1" /> {status.label}
            </Badge>
          </div>

          <Row className="mb-4">
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">Type d'abonnement</small>
                <h5 className="fw-bold">{typeLabel}</h5>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Montant</small>
                <h5 className="fw-bold">{abonnementActuel.montant} €</h5>
              </div>
              <div>
                <small className="text-muted d-block">Méthode de paiement</small>
                <h5 className="fw-bold">{abonnementActuel.methode_paiement}</h5>
              </div>
            </Col>
            <Col md={6}>
              <div className="mb-3">
                <small className="text-muted d-block">Date de début</small>
                <h5 className="fw-bold">
                  {new Date(abonnementActuel.date_debut).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </h5>
              </div>
              <div className="mb-3">
                <small className="text-muted d-block">Date de fin</small>
                <h5 className="fw-bold">
                  {new Date(abonnementActuel.date_fin).toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric"
                  })}
                </h5>
              </div>
              <div>
                <small className="text-muted d-block">ID Transaction</small>
                <h5 className="fw-bold">{abonnementActuel.transaction_id || "TRX-123456"}</h5>
              </div>
            </Col>
          </Row>

          <div className="mb-4">
            <div className="d-flex justify-content-between mb-2">
              <small className="text-muted">Progression de l'abonnement</small>
              <small className="fw-bold">{abonnementActuel.jours_restants} jours restants</small>
            </div>
            <ProgressBar 
              now={abonnementActuel.pourcentage} 
              variant={status.variant}
              style={{ height: "10px", borderRadius: "5px" }}
              animated={abonnementActuel.expire_bientot}
            />
          </div>

          <div className="d-flex gap-3">
            <Button 
              variant={status.variant === "danger" ? "danger" : "primary"}
              className="flex-fill"
              onClick={() => setActiveTab("plans")}
            >
              <FaSyncAlt className="me-2" />
              {status.variant === "danger" ? "Souscrire maintenant" : "Renouveler"}
            </Button>
            
            <OverlayTrigger
              overlay={
                <Tooltip>
                  Télécharger la facture
                </Tooltip>
              }
            >
              <Button variant="outline-secondary">
                <FaDownload />
              </Button>
            </OverlayTrigger>
            
            <OverlayTrigger
              overlay={
                <Tooltip>
                  Imprimer les détails
                </Tooltip>
              }
            >
              <Button variant="outline-secondary">
                <FaPrint />
              </Button>
            </OverlayTrigger>
          </div>
        </Card.Body>
      </Card>
    );
  };

  // === COMPOSANT FORMULES D'ABONNEMENT ===
  const SubscriptionPlans = () => {
    const handleSelectPlan = (formule) => {
      setSelectedFormule(formule);
      setShowPaiementModal(true);
    };

    return (
      <div>
        <h4 className="fw-bold mb-4">Choisissez votre formule</h4>
        <p className="text-muted mb-5">
          Sélectionnez la formule qui correspond le mieux à vos besoins. Tous les abonnements incluent notre support premium.
        </p>

        <Row className="g-4">
          {formules.map((formule) => (
            <Col lg={4} key={formule.id}>
              <Card 
                className={`shadow border-0 h-100 ${formule.popular ? 'popular-card' : ''} ${formule.bestValue ? 'best-value-card' : ''}`}
                style={{ 
                  borderRadius: "20px",
                  border: formule.popular ? "2px solid #28a745" : 
                          formule.bestValue ? "2px solid #ffc107" : "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onClick={() => handleSelectPlan(formule)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-10px)";
                  e.currentTarget.style.boxShadow = "0 15px 35px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 5px 20px rgba(0,0,0,0.1)";
                }}
              >
                {formule.popular && (
                  <div className="position-absolute top-0 start-50 translate-middle mt-3">
                    <Badge bg="success" className="px-3 py-2 fs-6">
                      <FaBolt className="me-1" /> Plus populaire
                    </Badge>
                  </div>
                )}
                
                {formule.bestValue && (
                  <div className="position-absolute top-0 start-50 translate-middle mt-3">
                    <Badge bg="warning" className="px-3 py-2 fs-6 text-dark">
                      <FaShieldAlt className="me-1" /> Meilleur rapport
                    </Badge>
                  </div>
                )}

                <Card.Body className="p-4 d-flex flex-column">
                  <div className="text-center mb-4">
                    <h3 className="fw-bold">{formule.nom}</h3>
                    <div className="my-3">
                      <span className="display-4 fw-bold">{formule.prix}€</span>
                      <span className="text-muted">/{formule.type === "mensuel" ? "mois" : 
                                                     formule.type === "trimestriel" ? "3 mois" : "an"}</span>
                    </div>
                    <Badge bg="info" className="px-3 py-2">
                      {formule.economie}
                    </Badge>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Avantages inclus :</h6>
                    <ul className="list-unstyled">
                      {formule.avantages.map((avantage, index) => (
                        <li key={index} className="mb-2">
                          <FaCheckCircle className="text-success me-2" />
                          {avantage}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <Button 
                      variant={formule.popular ? "success" : formule.bestValue ? "warning" : "primary"}
                      className="w-100 py-3"
                      onClick={() => handleSelectPlan(formule)}
                    >
                      <FaCreditCard className="me-2" />
                      Choisir cette formule
                    </Button>
                    
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        <FaShieldAlt className="me-1" />
                        Garantie satisfait ou remboursé 30 jours
                      </small>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <div className="mt-5 pt-4 border-top">
          <h5 className="fw-bold mb-3">
            <FaShieldAlt className="me-2 text-primary" />
            Notre garantie
          </h5>
          <Row>
            <Col md={4}>
              <div className="text-center p-3">
                <div className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: "60px", height: "60px" }}>
                  <FaLock className="text-white fs-4" />
                </div>
                <h6>Paiement sécurisé</h6>
                <p className="text-muted small">
                  Vos informations de paiement sont cryptées et sécurisées
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3">
                <div className="rounded-circle bg-success d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: "60px", height: "60px" }}>
                  <FaExchangeAlt className="text-white fs-4" />
                </div>
                <h6>Annulation facile</h6>
                <p className="text-muted small">
                  Annulez à tout moment sans frais cachés
                </p>
              </div>
            </Col>
            <Col md={4}>
              <div className="text-center p-3">
                <div className="rounded-circle bg-warning d-inline-flex align-items-center justify-content-center mb-3" 
                     style={{ width: "60px", height: "60px" }}>
                  <FaClock className="text-white fs-4" />
                </div>
                <h6>Support 24/7</h6>
                <p className="text-muted small">
                  Notre équipe est disponible pour vous aider à tout moment
                </p>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  };

  // === COMPOSANT HISTORIQUE ===
  const SubscriptionHistory = () => {
    if (historiqueLoading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Chargement de l'historique...</p>
        </div>
      );
    }

    if (historique.length === 0) {
      return (
        <div className="text-center py-5">
          <FaHistory size={48} className="text-muted mb-3" />
          <h5 className="fw-bold">Aucun historique d'abonnement</h5>
          <p className="text-muted">Vous n'avez pas encore souscrit d'abonnement.</p>
        </div>
      );
    }

    const getStatusBadge = (statut, dateFin) => {
      const isExpired = new Date(dateFin) < new Date();
      
      if (isExpired || statut === "expiré") {
        return <Badge bg="secondary">Expiré</Badge>;
      }
      
      if (statut === "annulé") {
        return <Badge bg="danger">Annulé</Badge>;
      }
      
      return <Badge bg="success">Actif</Badge>;
    };

    const getTypeLabel = (type) => {
      switch(type) {
        case "mensuel": return "Mensuel";
        case "trimestriel": return "Trimestriel";
        case "annuel": return "Annuel";
        default: return type;
      }
    };

    return (
      <div>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h4 className="fw-bold mb-0">Historique des abonnements</h4>
            <p className="text-muted mb-0">
              {historique.length} abonnement(s) au total
            </p>
          </div>
          <Button variant="outline-primary" onClick={fetchAbonnementData}>
            <FaSyncAlt className="me-2" />
            Actualiser
          </Button>
        </div>

        <Card className="shadow border-0">
          <Card.Body className="p-0">
            <Table hover responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Type</th>
                  <th>Période</th>
                  <th>Montant</th>
                  <th>Méthode</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {historique.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{getTypeLabel(item.type_abonnement)}</strong>
                    </td>
                    <td>
                      <div>
                        <small className="d-block">
                          {new Date(item.date_debut).toLocaleDateString("fr-FR")}
                        </small>
                        <small className="text-muted">
                          au {new Date(item.date_fin).toLocaleDateString("fr-FR")}
                        </small>
                      </div>
                    </td>
                    <td>
                      <strong>{item.montant} €</strong>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {item.methode_paiement === "Carte" && <FaCreditCard className="me-2 text-primary" />}
                        {item.methode_paiement === "PayPal" && <FaPaypal className="me-2 text-info" />}
                        {item.methode_paiement === "Mobile" && <FaMobileAlt className="me-2 text-success" />}
                        {item.methode_paiement}
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(item.statut, item.date_fin)}
                    </td>
                    <td>
                      <Button size="sm" variant="outline-primary" className="me-2">
                        <FaReceipt />
                      </Button>
                      <Button size="sm" variant="outline-secondary">
                        <FaDownload />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>

        {/* Statistiques */}
        <Row className="mt-4 g-3">
          <Col md={3}>
            <Card className="border-0 bg-light">
              <Card.Body className="p-3">
                <small className="text-muted d-block">Total dépensé</small>
                <h4 className="fw-bold mb-0">{stats.totalDepense.toFixed(2)} €</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-light">
              <Card.Body className="p-3">
                <small className="text-muted d-block">Abonnements actifs</small>
                <h4 className="fw-bold mb-0">{stats.abonnementsActifs}</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-light">
              <Card.Body className="p-3">
                <small className="text-muted d-block">Durée moyenne</small>
                <h4 className="fw-bold mb-0">{stats.joursMoyens} jours</h4>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 bg-light">
              <Card.Body className="p-3">
                <small className="text-muted d-block">Dernier renouvellement</small>
                <h4 className="fw-bold mb-0">
                  {stats.dernierRenouvellement ? 
                    new Date(stats.dernierRenouvellement).toLocaleDateString("fr-FR", { month: "short" })
                    : "N/A"}
                </h4>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  };

  // === MODAL DE PAIEMENT ===
  const PaymentModal = () => {
    const handlePaiementSubmit = async (e) => {
      e.preventDefault();
      setPaiementLoading(true);

      try {
        const token = localStorage.getItem("token");
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        
        const abonnementData = {
          membre_id: user.id,
          type_abonnement: selectedFormule.type,
          montant: selectedFormule.prix,
          methode_paiement: paiementInfo.methode,
          notes: `Paiement ${paiementInfo.methode} - ${selectedFormule.nom}`,
          transaction_id: `TRX-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        };

        // Simuler un appel API
        await new Promise(resolve => setTimeout(resolve, 2000));

        // En production, utiliser l'API réelle :
        // const response = await axios.post(
        //   "http://127.0.0.1:8000/api/abonnements",
        //   abonnementData,
        //   { headers: { Authorization: `Bearer ${token}` } }
        // );

        setPaiementSuccess(true);
        setTimeout(() => {
          setShowPaiementModal(false);
          setPaiementSuccess(false);
          setPaiementLoading(false);
          fetchAbonnementData();
          setActiveTab("current");
        }, 3000);

      } catch (error) {
        console.error("Erreur lors du paiement:", error);
        alert("Une erreur est survenue lors du paiement. Veuillez réessayer.");
        setPaiementLoading(false);
      }
    };

    const handleInputChange = (e) => {
      const { name, value, type, checked } = e.target;
      setPaiementInfo(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value
      }));
    };

    if (!selectedFormule) return null;

    return (
      <Modal 
        show={showPaiementModal} 
        onHide={() => !paiementLoading && setShowPaiementModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            <FaCreditCard className="me-2" />
            Paiement - {selectedFormule.nom}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          {paiementSuccess ? (
            <div className="text-center py-5">
              <FaCheckCircle size={60} className="text-success mb-3" />
              <h4 className="fw-bold">Paiement réussi !</h4>
              <p className="text-muted">
                Votre abonnement {selectedFormule.nom} a été activé avec succès.
              </p>
              <div className="mt-4">
                <Spinner animation="border" variant="success" size="sm" className="me-2" />
                <span>Redirection vers votre tableau de bord...</span>
              </div>
            </div>
          ) : (
            <>
              {/* Récapitulatif */}
              <Card className="mb-4 border-0 bg-light">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <h6 className="fw-bold">Formule choisie</h6>
                      <h5 className="text-primary">{selectedFormule.nom}</h5>
                      <p className="mb-0 text-muted">
                        {selectedFormule.duree_jours} jours - {selectedFormule.economie}
                      </p>
                    </Col>
                    <Col md={6} className="text-end">
                      <h6 className="fw-bold">Montant à payer</h6>
                      <h2 className="text-success">{selectedFormule.prix} €</h2>
                      <small className="text-muted">TVA incluse</small>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Méthodes de paiement */}
              <h6 className="fw-bold mb-3">Méthode de paiement</h6>
              <div className="mb-4">
                <div className="btn-group w-100" role="group">
                  <Button
                    variant={paiementInfo.methode === "carte" ? "primary" : "outline-primary"}
                    onClick={() => setPaiementInfo({ ...paiementInfo, methode: "carte" })}
                  >
                    <FaCreditCard className="me-2" /> Carte bancaire
                  </Button>
                  <Button
                    variant={paiementInfo.methode === "paypal" ? "primary" : "outline-primary"}
                    onClick={() => setPaiementInfo({ ...paiementInfo, methode: "paypal" })}
                  >
                    <FaPaypal className="me-2" /> PayPal
                  </Button>
                  <Button
                    variant={paiementInfo.methode === "mobile" ? "primary" : "outline-primary"}
                    onClick={() => setPaiementInfo({ ...paiementInfo, methode: "mobile" })}
                  >
                    <FaMobileAlt className="me-2" /> Mobile Money
                  </Button>
                </div>
              </div>

              {/* Formulaire de paiement */}
              <Form onSubmit={handlePaiementSubmit}>
                {paiementInfo.methode === "carte" && (
                  <>
                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Label>Numéro de carte</Form.Label>
                        <Form.Control
                          type="text"
                          name="numeroCarte"
                          value={paiementInfo.numeroCarte}
                          onChange={handleInputChange}
                          placeholder="1234 5678 9012 3456"
                          pattern="[0-9\s]{13,19}"
                          required
                        />
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col md={6}>
                        <Form.Label>Date d'expiration</Form.Label>
                        <Form.Control
                          type="month"
                          name="dateExpiration"
                          value={paiementInfo.dateExpiration}
                          onChange={handleInputChange}
                          required
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>CVV</Form.Label>
                        <Form.Control
                          type="text"
                          name="cvv"
                          value={paiementInfo.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          pattern="[0-9]{3,4}"
                          maxLength="4"
                          required
                        />
                      </Col>
                      <Col md={3}>
                        <Form.Label>&nbsp;</Form.Label>
                        <div className="text-muted small">
                          <FaShieldAlt className="me-1" />
                          Sécurisé
                        </div>
                      </Col>
                    </Row>
                    
                    <Row className="mb-3">
                      <Col md={12}>
                        <Form.Label>Nom du titulaire</Form.Label>
                        <Form.Control
                          type="text"
                          name="nomTitulaire"
                          value={paiementInfo.nomTitulaire}
                          onChange={handleInputChange}
                          placeholder="Nom comme sur la carte"
                          required
                        />
                      </Col>
                    </Row>
                    
                    <Form.Check
                      type="checkbox"
                      name="saveCard"
                      label="Enregistrer cette carte pour les paiements futurs"
                      checked={paiementInfo.saveCard}
                      onChange={handleInputChange}
                      className="mb-4"
                    />
                  </>
                )}

                {paiementInfo.methode === "paypal" && (
                  <div className="text-center py-4">
                    <FaPaypal size={60} className="text-info mb-3" />
                    <p>Vous serez redirigé vers PayPal pour compléter votre paiement.</p>
                    <p className="text-muted small">
                      <FaLock className="me-1" />
                      Paiement sécurisé par PayPal
                    </p>
                  </div>
                )}

                {paiementInfo.methode === "mobile" && (
                  <div className="text-center py-4">
                    <FaMobileAlt size={60} className="text-success mb-3" />
                    <p>Vous recevrez une demande de paiement sur votre mobile.</p>
                    <div className="mb-3">
                      <Form.Control
                        type="email"
                        name="email"
                        value={paiementInfo.email}
                        onChange={handleInputChange}
                        placeholder="Votre email pour le reçu"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Code promo */}
                <Row className="mb-4">
                  <Col md={8}>
                    <Form.Label>Code promo (optionnel)</Form.Label>
                    <Form.Control
                      type="text"
                      name="coupon"
                      value={paiementInfo.coupon}
                      onChange={handleInputChange}
                      placeholder="Entrez votre code promo"
                    />
                  </Col>
                  <Col md={4} className="d-flex align-items-end">
                    <Button variant="outline-secondary" className="w-100">
                      Appliquer
                    </Button>
                  </Col>
                </Row>

                <div className="border-top pt-3">
                  <div className="d-flex justify-content-between mb-3">
                    <span>Sous-total</span>
                    <span>{selectedFormule.prix} €</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                    <span>TVA (20%)</span>
                    <span>{(selectedFormule.prix * 0.2).toFixed(2)} €</span>
                  </div>
                  <div className="d-flex justify-content-between fw-bold fs-5">
                    <span>Total</span>
                    <span className="text-success">
                      {(selectedFormule.prix * 1.2).toFixed(2)} €
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Form.Check
                    type="checkbox"
                    id="terms"
                    label={
                      <>
                        J'accepte les <a href="/terms">conditions générales</a> et la <a href="/privacy">politique de confidentialité</a>
                      </>
                    }
                    required
                    className="mb-3"
                  />
                  
                  <Button
                    type="submit"
                    variant="success"
                    size="lg"
                    className="w-100 py-3"
                    disabled={paiementLoading}
                  >
                    {paiementLoading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Traitement en cours...
                      </>
                    ) : (
                      <>
                        <FaLock className="me-2" />
                        Payer maintenant {(selectedFormule.prix * 1.2).toFixed(2)} €
                      </>
                    )}
                  </Button>
                  
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      <FaShieldAlt className="me-1" />
                      Paiement 100% sécurisé - Garantie remboursement sous 30 jours
                    </small>
                  </div>
                </div>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={{ background: C.bg }}>
      <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />

      <div 
        className="flex-grow-1"
        style={{ 
          marginLeft: sidebarCollapsed ? "80px" : "280px", 
          padding: "2rem", 
          transition: "margin 0.4s ease"
        }}
      >
        {/* Header */}
        <div className="mb-5">
          <h1 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
            <FaCreditCard className="me-3" />
            Gestion des abonnements
          </h1>
          <p className="text-muted">
            Gérez votre abonnement, renouvelez ou changez de formule à tout moment
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k)}
          className="mb-4"
          variant="pills"
        >
          <Nav.Item>
            <Nav.Link eventKey="current">
              <FaCreditCard className="me-2" />
              Mon abonnement
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="plans">
              <FaExchangeAlt className="me-2" />
              Formules disponibles
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="history">
              <FaHistory className="me-2" />
              Historique
            </Nav.Link>
          </Nav.Item>
        </Tabs>

        {/* Contenu des tabs */}
        <div className="mt-4">
          {activeTab === "current" && <CurrentSubscriptionCard />}
          {activeTab === "plans" && <SubscriptionPlans />}
          {activeTab === "history" && <SubscriptionHistory />}
        </div>

        {/* Informations supplémentaires */}
        <Row className="mt-5">
          <Col md={4}>
            <Card className="border-0 bg-light">
              <Card.Body>
                <h6 className="fw-bold">
                  <FaShieldAlt className="me-2 text-primary" />
                  Sécurité garantie
                </h6>
                <p className="small text-muted mb-0">
                  Tous les paiements sont cryptés et sécurisés. Nous ne stockons jamais vos informations bancaires.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 bg-light">
              <Card.Body>
                <h6 className="fw-bold">
                  <FaExchangeAlt className="me-2 text-success" />
                  Annulation facile
                </h6>
                <p className="small text-muted mb-0">
                  Annulez votre abonnement à tout moment sans frais cachés. Remboursement sous 30 jours.
                </p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="border-0 bg-light">
              <Card.Body>
                <h6 className="fw-bold">
                  <FaClock className="me-2 text-warning" />
                  Support 24/7
                </h6>
                <p className="small text-muted mb-0">
                  Notre équipe est disponible 24h/24 et 7j/7 pour vous aider avec votre abonnement.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal de paiement */}
      <PaymentModal />
    </div>
  );
};

export default AbonnementMembrePage;