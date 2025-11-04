import React, { useState, useEffect } from "react";
import { Card, Row, Col, Button, ProgressBar, Badge } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

const DashMembre = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Gérer l'état de la sidebar
  const handleSidebarCollapse = (isCollapsed) => {
    setSidebarCollapsed(isCollapsed);
  };

  // Données des statistiques
  const statsData = [
    {
      title: "Publications",
      count: 12,
      icon: "fas fa-bullhorn",
      color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      progress: 75,
      buttonVariant: "primary",
      link: "/pubMembre"
    },
    {
      title: "Événements",
      count: 5,
      icon: "fas fa-calendar-alt",
      color: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
      progress: 45,
      buttonVariant: "success",
      link: "/evenementMembre"
    },
    {
      title: "Messages",
      count: 8,
      icon: "fas fa-comments",
      color: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      progress: 60,
      buttonVariant: "info",
      link: "/messageMembre"
    },
    {
      title: "Notifications",
      count: 3,
      icon: "fas fa-bell",
      color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
      progress: 25,
      buttonVariant: "warning",
      link: "/notificationMembre"
    }
  ];

  // Activités récentes
  const activities = [
    {
      id: 1,
      title: "Nouvelle publication ajoutée",
      description: "Votre article a été publié avec succès",
      time: "21 Septembre 2025 - 10:30",
      icon: "fas fa-check-circle",
      iconColor: "#00d664",
      type: "publication"
    },
    {
      id: 2,
      title: "Participation confirmée à un événement",
      description: "Vous participez à 'Forum Innovation 2025'",
      time: "20 Septembre 2025 - 15:45",
      icon: "fas fa-calendar-check",
      iconColor: "#667eea",
      type: "evenement"
    },
    {
      id: 3,
      title: "Nouveau message reçu",
      description: "Message de la part de l'administrateur",
      time: "19 Septembre 2025 - 09:12",
      icon: "fas fa-envelope",
      iconColor: "#f5576c",
      type: "message"
    },
    {
      id: 4,
      title: "Profil mis à jour",
      description: "Vos informations ont été actualisées",
      time: "18 Septembre 2025 - 14:20",
      icon: "fas fa-user-edit",
      iconColor: "#4facfe",
      type: "profil"
    }
  ];

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
    
      </div>
<MembreSidebar/>
      {/* Contenu Principal */}
      <div className="flex-grow-1" style={{ 
        padding: "30px",
        marginLeft: "0",
        transition: "all 0.3s ease",
        overflowX: "hidden"
      }}>
        {/* En-tête */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h1 className="fw-bold mb-2" style={{ 
              color: "#2c3e50",
              fontSize: "2.2rem"
            }}>
              Tableau de Bord
            </h1>
            <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
              Bienvenue dans votre espace membre
            </p>
          </div>
          <div className="d-flex align-items-center">
            <Badge 
              bg="light" 
              text="dark" 
              className="px-3 py-2 me-3"
              style={{ 
                borderRadius: "20px",
                fontSize: "0.9rem",
                border: "1px solid #dee2e6"
              }}
            >
              <i className="fas fa-circle text-success me-2" style={{ fontSize: "0.6rem" }}></i>
              En ligne
            </Badge>
            <Button 
              variant="outline-primary" 
              className="rounded-pill px-4"
              style={{ 
                border: "2px solid #667eea",
                fontWeight: "600"
              }}
            >
              <i className="fas fa-sync-alt me-2"></i>
              Actualiser
            </Button>
          </div>
        </div>

        {/* Cartes de Statistiques */}
        <Row className="mb-5">
          {statsData.map((stat, index) => (
            <Col xl={3} lg={6} md={6} className="mb-4" key={index}>
              <Card 
                className="shadow-lg border-0 h-100"
                style={{ 
                  borderRadius: "20px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  background: "rgba(255, 255, 255, 0.95)",
                  backdropFilter: "blur(10px)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 35px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.1)";
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                      <h6 
                        className="text-uppercase mb-2 fw-semibold"
                        style={{ 
                          color: "#6c757d",
                          fontSize: "0.8rem",
                          letterSpacing: "0.5px"
                        }}
                      >
                        {stat.title}
                      </h6>
                      <h2 
                        className="fw-bold mb-0"
                        style={{ 
                          background: stat.color,
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          fontSize: "2.5rem"
                        }}
                      >
                        {stat.count}
                      </h2>
                    </div>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{
                        width: "60px",
                        height: "60px",
                        background: stat.color,
                        color: "white",
                        fontSize: "1.5rem"
                      }}
                    >
                      <i className={stat.icon}></i>
                    </div>
                  </div>

                  {/* Barre de progression */}
                  <div className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <small className="text-muted">Progression</small>
                      <small className="fw-semibold" style={{ color: "#667eea" }}>
                        {stat.progress}%
                      </small>
                    </div>
                    <ProgressBar 
                      now={stat.progress} 
                      style={{ 
                        height: "6px",
                        borderRadius: "10px",
                        backgroundColor: "rgba(108, 117, 125, 0.2)"
                      }}
                    >
                      <ProgressBar 
                        now={stat.progress}
                        style={{
                          background: stat.color,
                          borderRadius: "10px"
                        }}
                      />
                    </ProgressBar>
                  </div>

                  <Button 
                    variant={stat.buttonVariant}
                    className="w-100 rounded-pill py-2"
                    style={{ 
                      border: "none",
                      fontWeight: "600",
                      fontSize: "0.9rem"
                    }}
                    onClick={() => window.location.href = stat.link}
                  >
                    <i className="fas fa-arrow-right me-2"></i>
                    Voir les détails
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row>
          {/* Activités Récentes */}
          <Col lg={8} className="mb-4">
            <Card 
              className="shadow-lg border-0 h-100"
              style={{ 
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)"
              }}
            >
              <Card.Header 
                className="border-0 bg-transparent py-4"
                style={{ borderBottom: "1px solid rgba(0, 0, 0, 0.05)" }}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <h4 className="fw-bold mb-0" style={{ color: "#2c3e50" }}>
                    <i className="fas fa-history me-2 text-primary"></i>
                    Activités Récentes
                  </h4>
                  <Badge 
                    bg="primary" 
                    className="px-3 py-2"
                    style={{ 
                      borderRadius: "15px",
                      fontSize: "0.8rem"
                    }}
                  >
                    {activities.length} nouvelles
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {activities.map((activity, index) => (
                  <div 
                    key={activity.id}
                    className={`p-4 ${index !== activities.length - 1 ? 'border-bottom' : ''}`}
                    style={{ 
                      borderColor: "rgba(0, 0, 0, 0.05) !important",
                      transition: "all 0.3s ease",
                      cursor: "pointer"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(102, 126, 234, 0.03)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                    }}
                  >
                    <div className="d-flex align-items-start">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center me-3 flex-shrink-0"
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: `${activity.iconColor}15`,
                          color: activity.iconColor,
                          fontSize: "1.2rem"
                        }}
                      >
                        <i className={activity.icon}></i>
                      </div>
                      <div className="flex-grow-1">
                        <h6 className="fw-semibold mb-1" style={{ color: "#2c3e50" }}>
                          {activity.title}
                        </h6>
                        <p className="text-muted mb-2" style={{ fontSize: "0.9rem" }}>
                          {activity.description}
                        </p>
                        <small 
                          className="text-muted"
                          style={{ fontSize: "0.8rem" }}
                        >
                          <i className="fas fa-clock me-1"></i>
                          {activity.time}
                        </small>
                      </div>
                      <Badge 
                        bg="light" 
                        text="dark"
                        className="ms-2"
                        style={{ 
                          borderRadius: "12px",
                          fontSize: "0.7rem",
                          textTransform: "capitalize"
                        }}
                      >
                        {activity.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </Card.Body>
              <Card.Footer 
                className="border-0 bg-transparent py-3 text-center"
                style={{ borderTop: "1px solid rgba(0, 0, 0, 0.05)" }}
              >
                <Button 
                  variant="outline-primary" 
                  className="rounded-pill px-4"
                  style={{ 
                    border: "2px solid #667eea",
                    fontWeight: "600"
                  }}
                >
                  <i className="fas fa-list me-2"></i>
                  Voir toutes les activités
                </Button>
              </Card.Footer>
            </Card>
          </Col>

          {/* Actions Rapides */}
          <Col lg={4}>
            <Card 
              className="shadow-lg border-0 h-100"
              style={{ 
                borderRadius: "20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white"
              }}
            >
              <Card.Header 
                className="border-0 bg-transparent py-4"
                style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.2)" }}
              >
                <h4 className="fw-bold mb-0">
                  <i className="fas fa-bolt me-2"></i>
                  Actions Rapides
                </h4>
              </Card.Header>
              <Card.Body className="p-4">
                <div className="d-grid gap-3">
                  <Button 
                    variant="light" 
                    className="rounded-pill py-3 text-start"
                    style={{ fontWeight: "600" }}
                  >
                    <i className="fas fa-plus-circle me-2 text-primary"></i>
                    Nouvelle Publication
                  </Button>
                  <Button 
                    variant="light" 
                    className="rounded-pill py-3 text-start"
                    style={{ fontWeight: "600" }}
                  >
                    <i className="fas fa-calendar-plus me-2 text-success"></i>
                    Créer un Événement
                  </Button>
                  <Button 
                    variant="light" 
                    className="rounded-pill py-3 text-start"
                    style={{ fontWeight: "600" }}
                  >
                    <i className="fas fa-edit me-2 text-info"></i>
                    Modifier le Profil
                  </Button>
                  <Button 
                    variant="light" 
                    className="rounded-pill py-3 text-start"
                    style={{ fontWeight: "600" }}
                  >
                    <i className="fas fa-cog me-2 text-warning"></i>
                    Paramètres
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Section Objectifs */}
        <Row className="mt-4">
          <Col md={12}>
            <Card 
              className="shadow-lg border-0"
              style={{ 
                borderRadius: "20px",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)"
              }}
            >
              <Card.Body className="p-4">
                <h5 className="fw-bold mb-3" style={{ color: "#2c3e50" }}>
                  <i className="fas fa-trophy me-2 text-warning"></i>
                  Vos Objectifs du Mois
                </h5>
                <Row>
                  <Col md={4}>
                    <div className="text-center p-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          fontSize: "1.5rem"
                        }}
                      >
                        <i className="fas fa-bullhorn"></i>
                      </div>
                      <h6 className="fw-semibold">Publications</h6>
                      <h4 className="fw-bold text-primary">3/5</h4>
                      <small className="text-muted">Objectif mensuel</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
                          color: "white",
                          fontSize: "1.5rem"
                        }}
                      >
                        <i className="fas fa-users"></i>
                      </div>
                      <h6 className="fw-semibold">Réseautage</h6>
                      <h4 className="fw-bold text-success">12/20</h4>
                      <small className="text-muted">Nouveaux contacts</small>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="text-center p-3">
                      <div 
                        className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                        style={{
                          width: "80px",
                          height: "80px",
                          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
                          color: "white",
                          fontSize: "1.5rem"
                        }}
                      >
                        <i className="fas fa-star"></i>
                      </div>
                      <h6 className="fw-semibold">Engagement</h6>
                      <h4 className="fw-bold text-info">85%</h4>
                      <small className="text-muted">Taux de participation</small>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Styles CSS supplémentaires */}
      <style>
        {`
          .card {
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }
          
          .btn {
            transition: all 0.3s ease;
          }
          
          .btn:hover {
            transform: translateY(-2px);
          }
          
          /* Animation pour les badges */
          .badge {
            transition: all 0.3s ease;
          }
          
          /* Style personnalisé pour les progress bars */
          .progress {
            overflow: hidden;
          }
          
          /* Effet de brillance sur les cartes */
          .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
            transition: left 0.5s;
          }
          
          .card:hover::before {
            left: 100%;
          }
        `}
      </style>
    </div>
  );
};

export default DashMembre;