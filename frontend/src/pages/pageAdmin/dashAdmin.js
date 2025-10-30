import React, { useState, useEffect } from "react";
import AdminSidebar from "../../components/AdminSidebar";
import { Card, Row, Col, Button, ProgressBar, Badge } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarAlt, FaFileAlt, FaBullhorn, FaChartLine, FaEye, FaPlus, FaArrowRight } from "react-icons/fa";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    evenements: 0,
    publications: 0,
    appelsOffre: 0,
    membres: 0,
    evenementsEnAttente: 0,
    publicationsEnAttente: 0,
    appelsOffreActifs: 0
  });
  
  const [recentData, setRecentData] = useState({
    publications: [],
    evenements: [],
    appelsOffre: []
  });
  
  const [loading, setLoading] = useState(true);

  // Charger les statistiques
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Récupérer les données de chaque endpoint
        const [eventsRes, pubsRes, offresRes, membresRes] = await Promise.all([
          axios.get(`${API_URL}/evenements`),
          axios.get(`${API_URL}/publications`),
          axios.get(`${API_URL}/appeloffres`),
          axios.get(`${API_URL}/membres`)
        ]);

        const events = eventsRes.data.data || eventsRes.data || [];
        const publications = pubsRes.data.data || pubsRes.data || [];
        const appelsOffre = offresRes.data?.data || offresRes.data || [];
        const membres = membresRes.data || [];

        // Calculer les statistiques
        const evenementsEnAttente = events.filter(ev => ev.statut === "En attente").length;
        const publicationsEnAttente = publications.filter(pub => pub.statut === "En attente").length;
        const appelsOffreActifs = appelsOffre.filter(offre => offre.statut === "Actif").length;

        setStats({
          evenements: events.length,
          publications: publications.length,
          appelsOffre: appelsOffre.length,
          membres: membres.length,
          evenementsEnAttente,
          publicationsEnAttente,
          appelsOffreActifs
        });

        // Données récentes pour les sections
        setRecentData({
          publications: publications.slice(0, 3),
          evenements: events.slice(0, 3),
          appelsOffre: appelsOffre.slice(0, 3)
        });

      } catch (error) {
        console.error("Erreur chargement stats:", error);
        // Valeurs par défaut en cas d'erreur
        setStats({
          evenements: 0,
          publications: 0,
          appelsOffre: 0,
          membres: 0,
          evenementsEnAttente: 0,
          publicationsEnAttente: 0,
          appelsOffreActifs: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusVariant = (statut) => {
    switch(statut) {
      case "Validé": return "success";
      case "En attente": return "warning";
      case "Actif": return "primary";
      case "Brouillon": return "secondary";
      case "Rejeté": return "danger";
      default: return "secondary";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const StatCard = ({ title, value, icon, color, subtitle, progress, onClick }) => (
    <Card 
      className="border-0 shadow-sm h-100" 
      style={{ 
        borderRadius: "20px",
        cursor: onClick ? "pointer" : "default",
        transition: "transform 0.2s, box-shadow 0.2s"
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-5px)";
          e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
        }
      }}
      onClick={onClick}
    >
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="text-muted mb-2 fw-semibold">{title}</h6>
            <h2 className="fw-bold mb-0" style={{ 
              background: color,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: "2.5rem"
            }}>
              {loading ? (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
              ) : (
                value
              )}
            </h2>
            {subtitle && (
              <p className="text-muted small mb-0 mt-2">{subtitle}</p>
            )}
          </div>
          <div 
            className="rounded-circle d-flex align-items-center justify-content-center"
            style={{ 
              width: "60px", 
              height: "60px",
              background: color
            }}
          >
            {icon}
          </div>
        </div>
        {progress && (
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-muted">Progression</small>
              <small className="fw-semibold">{progress}%</small>
            </div>
            <ProgressBar 
              now={progress} 
              style={{ 
                height: "6px",
                borderRadius: "10px",
                backgroundColor: "rgba(0,0,0,0.1)"
              }}
            />
          </div>
        )}
      </Card.Body>
    </Card>
  );

  const QuickSection = ({ title, data, type, emptyMessage, onAdd, onViewAll }) => (
    <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
      <Card.Body className="p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>{title}</h6>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              size="sm" 
              onClick={onAdd}
              className="d-flex align-items-center"
              style={{ borderRadius: "10px", padding: "4px 8px" }}
            >
              <FaPlus size={12} />
            </Button>
            <Button 
              variant="outline-secondary" 
              size="sm" 
              onClick={onViewAll}
              className="d-flex align-items-center"
              style={{ borderRadius: "10px", padding: "4px 8px" }}
            >
              <FaArrowRight size={12} />
            </Button>
          </div>
        </div>

        <div className="flex-grow-1">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Chargement...</span>
              </div>
            </div>
          ) : data.length > 0 ? (
            data.map((item, index) => (
              <div 
                key={index} 
                className="d-flex justify-content-between align-items-center py-2 border-bottom border-light"
                style={{ cursor: "pointer" }}
                onClick={() => navigate(`/${type}Admin`)}
              >
                <div className="flex-grow-1">
                  <div className="d-flex align-items-center mb-1">
                    <span className="fw-semibold text-dark small" style={{ lineHeight: "1.3" }}>
                      {item.titre || item.nom || "Sans titre"}
                    </span>
                  </div>
                  <div className="d-flex align-items-center gap-3">
                    <small className="text-muted">
                      {type === 'evenements' && item.date_heure && (
                        <><FaCalendarAlt className="me-1" />{formatDate(item.date_heure)}</>
                      )}
                      {type === 'publications' && (
                        <><FaBullhorn className="me-1" />{item.type}</>
                      )}
                      {type === 'appeloffres' && (
                        <><FaFileAlt className="me-1" />{item.categorie || "Général"}</>
                      )}
                    </small>
                    <Badge 
                      bg={getStatusVariant(item.statut)} 
                      className="d-flex align-items-center"
                      style={{ 
                        borderRadius: "15px",
                        fontSize: "0.65rem",
                        padding: "2px 8px"
                      }}
                    >
                      {item.statut}
                    </Badge>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <div className="text-muted mb-2">
                {type === 'evenements' && <FaCalendarAlt size={24} />}
                {type === 'publications' && <FaBullhorn size={24} />}
                {type === 'appeloffres' && <FaFileAlt size={24} />}
              </div>
              <p className="text-muted small mb-0">{emptyMessage}</p>
            </div>
          )}
        </div>
      </Card.Body>
    </Card>
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* En-tête de page */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ 
              background: "linear-gradient(135deg, #2c3e50, #34495e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              Tableau de Bord Administrateur
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <FaChartLine className="me-2" />
              Aperçu complet de votre plateforme
            </p>
          </div>
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              className="d-flex align-items-center"
              style={{ borderRadius: "10px" }}
              onClick={() => window.location.reload()}
            >
              <FaArrowRight className="me-2" />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <StatCard
              title="Événements"
              value={stats.evenements}
              icon={<FaCalendarAlt size={24} className="text-white" />}
              color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              subtitle={`${stats.evenementsEnAttente} en attente`}
              progress={stats.evenements > 0 ? Math.round((stats.evenementsEnAttente / stats.evenements) * 100) : 0}
              onClick={() => navigate("/adminEv")}
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Publications"
              value={stats.publications}
              icon={<FaBullhorn size={24} className="text-white" />}
              color="linear-gradient(135deg, #00b09b, #96c93d)"
              subtitle={`${stats.publicationsEnAttente} en attente`}
              progress={stats.publications > 0 ? Math.round((stats.publicationsEnAttente / stats.publications) * 100) : 0}
              onClick={() => navigate("/pubAdmin")}
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Appels d'offre"
              value={stats.appelsOffre}
              icon={<FaFileAlt size={24} className="text-white" />}
              color="linear-gradient(135deg, #4facfe, #00f2fe)"
              subtitle={`${stats.appelsOffreActifs} actifs`}
              progress={stats.appelsOffre > 0 ? Math.round((stats.appelsOffreActifs / stats.appelsOffre) * 100) : 0}
              onClick={() => navigate("/appeloffreAdmin")}
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Membres"
              value={stats.membres}
              icon={<FaUsers size={24} className="text-white" />}
              color="linear-gradient(135deg, #f093fb, #f5576c)"
              subtitle="Total membres"
              progress={100}
              onClick={() => navigate("/membreAdmin")}
            />
          </Col>
        </Row>

        {/* Sections rapides */}
        <Row className="g-3 mb-4">
          <Col md={4}>
            <QuickSection
              title="📅 Événements à venir"
              data={recentData.evenements}
              type="evenements"
              emptyMessage="Aucun événement planifié"
              onAdd={() => navigate("/adminEv")}
              onViewAll={() => navigate("/adminEv")}
            />
          </Col>
          <Col md={4}>
            <QuickSection
              title="📢 Dernières publications"
              data={recentData.publications}
              type="publications"
              emptyMessage="Aucune publication récente"
              onAdd={() => navigate("/pubAdmin")}
              onViewAll={() => navigate("/pubAdmin")}
            />
          </Col>
          <Col md={4}>
            <QuickSection
              title="📂 Appels d'offre récents"
              data={recentData.appelsOffre}
              type="appeloffres"
              emptyMessage="Aucun appel d'offre actif"
              onAdd={() => navigate("/appeloffreAdmin")}
              onViewAll={() => navigate("/appeloffreAdmin")}
            />
          </Col>
        </Row>

        {/* Section activité récente */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                📈 Activité Récente
              </h6>
              <Badge bg="primary" className="d-flex align-items-center">
                <FaEye className="me-1" />
                Vue d'ensemble
              </Badge>
            </div>
            <Row className="text-center">
              <Col md={3}>
                <div className="border-end border-light py-3">
                  <h4 className="fw-bold text-primary mb-1">{stats.evenements}</h4>
                  <small className="text-muted">Événements total</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="border-end border-light py-3">
                  <h4 className="fw-bold text-success mb-1">{stats.publications}</h4>
                  <small className="text-muted">Publications total</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="border-end border-light py-3">
                  <h4 className="fw-bold text-info mb-1">{stats.appelsOffre}</h4>
                  <small className="text-muted">Appels d'offre total</small>
                </div>
              </Col>
              <Col md={3}>
                <div className="py-3">
                  <h4 className="fw-bold text-warning mb-1">{stats.membres}</h4>
                  <small className="text-muted">Membres inscrits</small>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Sous-pages (Outlet) */}
        <div className="mt-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;