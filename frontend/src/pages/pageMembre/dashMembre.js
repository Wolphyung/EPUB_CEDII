import React, { useState, useEffect } from "react";
import MembreSidebar from "../../components/MembreSidebar";
import { Card, Row, Col, Button, ProgressBar, Badge, ListGroup } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { FaUsers, FaCalendarAlt, FaBullhorn, FaEnvelope, FaChartLine, FaEye, FaPlus, FaArrowRight } from "react-icons/fa";
import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";

const DashMembre = () => {
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    publications: 0,
    evenements: 0,
    messages: 0,
    notifications: 0,
    publicationsEnAttente: 0,
    evenementsEnAttente: 0,
    messagesNonLus: 0
  });

  const [recentData, setRecentData] = useState({
    publications: [],
    evenements: [],
    messages: []
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);

        const [pubRes, evtRes, msgRes] = await Promise.all([
          axios.get(`${API_URL}/publications`),
          axios.get(`${API_URL}/evenements`),
          axios.get(`${API_URL}/messages`)
        ]);

        const publications = pubRes.data.data || pubRes.data || [];
        const evenements = evtRes.data.data || evtRes.data || [];
        const messages = msgRes.data.data || msgRes.data || [];

        setStats({
          publications: publications.length,
          evenements: evenements.length,
          messages: messages.length,
          notifications: 3,
          publicationsEnAttente: publications.filter(pub => pub.statut === "En attente").length,
          evenementsEnAttente: evenements.filter(evt => evt.statut === "En attente").length,
          messagesNonLus: messages.filter(msg => !msg.read).length
        });

        setRecentData({
          publications: publications.slice(0, 3),
          evenements: evenements.slice(0, 3),
          messages: messages.slice(0, 3)
        });

      } catch (err) {
        console.error("Erreur chargement stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const StatCard = ({ title, value, icon, color, subtitle, progress, onClick }) => (
    <Card 
      className="border-0 shadow-sm h-100"
      style={{ borderRadius: "20px", cursor: onClick ? "pointer" : "default" }}
      onClick={onClick}
      onMouseEnter={e => onClick && (e.currentTarget.style.transform = "translateY(-5px)")}
      onMouseLeave={e => onClick && (e.currentTarget.style.transform = "translateY(0)")}
    >
      <Card.Body className="p-4">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h6 className="text-muted mb-2 fw-semibold">{title}</h6>
            <h2 className="fw-bold mb-0" style={{ background: color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {loading ? <div className="spinner-border spinner-border-sm text-primary" role="status"></div> : value}
            </h2>
            {subtitle && <p className="text-muted small mb-0 mt-2">{subtitle}</p>}
          </div>
          <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", background: color }}>
            {icon}
          </div>
        </div>
        {progress !== undefined && (
          <div className="mt-3">
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small className="text-muted">Progression</small>
              <small className="fw-semibold">{progress}%</small>
            </div>
            <ProgressBar now={progress} style={{ height: "6px", borderRadius: "10px", backgroundColor: "rgba(0,0,0,0.1)" }} />
          </div>
        )}
      </Card.Body>
    </Card>
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <MembreSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ background: "linear-gradient(135deg, #2c3e50, #34495e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              Tableau de Bord
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center"><FaChartLine className="me-2" />Bienvenue dans votre espace membre</p>
          </div>
          <Button variant="outline-primary" onClick={() => window.location.reload()}><FaArrowRight className="me-2" />Actualiser</Button>
        </div>

        {/* Statistiques */}
        <Row className="mb-4 g-3">
          <Col md={3}>
            <StatCard
              title="Publications"
              value={stats.publications}
              icon={<FaBullhorn size={24} className="text-white" />}
              color="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
              subtitle={`En attente: ${stats.publicationsEnAttente}`}
              progress={stats.publications > 0 ? Math.round((stats.publicationsEnAttente / stats.publications) * 100) : 0}
              onClick={() => navigate("/pubMembre")}
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Événements"
              value={stats.evenements}
              icon={<FaCalendarAlt size={24} className="text-white" />}
              color="linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
              subtitle={`En attente: ${stats.evenementsEnAttente}`}
              progress={stats.evenements > 0 ? Math.round((stats.evenementsEnAttente / stats.evenements) * 100) : 0}
              onClick={() => navigate("/evenementMembre")}
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Messages"
              value={stats.messages}
              icon={<FaEnvelope size={24} className="text-white" />}
              color="linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
              subtitle={`Non lus: ${stats.messagesNonLus}`}
              progress={stats.messages > 0 ? Math.round((stats.messagesNonLus / stats.messages) * 100) : 0}
              onClick={() => navigate("/messageMembre")}
            />
          </Col>
          <Col md={3}>
            <StatCard
              title="Notifications"
              value={stats.notifications}
              icon={<FaUsers size={24} className="text-white" />}
              color="linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)"
              progress={100}
              onClick={() => navigate("/notificationMembre")}
            />
          </Col>
        </Row>

        {/* Accès rapide */}
        <Card className="mb-4 shadow-sm" style={{ borderRadius: "20px" }}>
          <Card.Body>
            <h5 className="fw-bold mb-3">Accès rapide</h5>
            <Row className="g-2">
              <Col md={3}><Button className="w-100" onClick={() => navigate("/pubMembre")}><FaBullhorn className="me-2" />Publications</Button></Col>
              <Col md={3}><Button className="w-100" onClick={() => navigate("/evenementMembre")}><FaCalendarAlt className="me-2" />Événements</Button></Col>
              <Col md={3}><Button className="w-100" onClick={() => navigate("/messageMembre")}><FaEnvelope className="me-2" />Messages</Button></Col>
              <Col md={3}><Button className="w-100" onClick={() => navigate("/notificationMembre")}><FaUsers className="me-2" />Notifications</Button></Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Activité récente */}
        <Row className="mb-4">
          <Col md={6}>
            <Card className="shadow-sm" style={{ borderRadius: "20px" }}>
              <Card.Body>
                <h5 className="fw-bold mb-3">Activité récente</h5>
                <ListGroup variant="flush">
                  {recentData.publications.map((pub, idx) => (
                    <ListGroup.Item key={idx}>
                      <strong>{pub.titre}</strong> - {pub.statut}
                    </ListGroup.Item>
                  ))}
                  {recentData.evenements.map((evt, idx) => (
                    <ListGroup.Item key={idx}>
                      <strong>{evt.titre}</strong> - {evt.statut}
                    </ListGroup.Item>
                  ))}
                  {recentData.messages.map((msg, idx) => (
                    <ListGroup.Item key={idx}>
                      <strong>{msg.sujet}</strong> - {msg.read ? "Lu" : "Non lu"}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>

          {/* Objectif du mois */}
          <Col md={6}>
            <Card className="shadow-sm" style={{ borderRadius: "20px" }}>
              <Card.Body>
                <h5 className="fw-bold mb-3">Objectif du mois</h5>
                <p>Atteindre 20 publications</p>
                <ProgressBar now={stats.publications / 20 * 100} label={`${Math.round(stats.publications / 20 * 100)}%`} style={{ height: "25px", borderRadius: "12px" }} />
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Outlet />
      </div>
    </div>
  );
};

export default DashMembre;
