import React, { useState, useEffect } from "react";
import MembreSidebar from "../../components/MembreSidebar";
import { Card, Row, Col, Button, ListGroup, Spinner, Badge } from "react-bootstrap";
import { FaBullhorn, FaCalendarAlt, FaEnvelope, FaUsers, FaRocket, FaFileAlt } from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const C = {
  primary: "#667eea",
  secondary: "#764ba2",
  accent: "#4facfe",
  neon: "#00f2fe",
  gray: "#6c757d",
  white: "#FFFFFF",
  bg: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
  cardBg: "#FFFFFF",
};

const DashMembre = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ publications: 0, evenements: 0, messages: 0, notifications: 0 });
  const [recentData, setRecentData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [pubRes, evtRes, msgRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/membre/publications", { headers }),
          axios.get("http://127.0.0.1:8000/api/membre/evenements", { headers }),
          axios.get("http://127.0.0.1:8000/api/membre/messages", { headers }),
        ]);

        const publications = (pubRes.data.data || pubRes.data || []).map(p => ({ ...p, type: "publication", date: new Date(p.created_at), titre: p.titre }));
        const evenements = (evtRes.data.data || evtRes.data || []).map(e => ({ ...e, type: "evenement", date: new Date(e.created_at), titre: e.titre }));
        const messages = (msgRes.data.data || msgRes.data || []).map(m => ({ ...m, type: "message", date: new Date(m.created_at), sujet: m.sujet }));

        setStats({
          publications: publications.length,
          evenements: evenements.length,
          messages: messages.length,
          notifications: 5,
        });

        const all = [...publications, ...evenements, ...messages].sort((a, b) => b.date - a.date).slice(0, 5);
        setRecentData(all);

        const now = new Date();
        const year = now.getFullYear();
        const monthly = Array(12).fill(0);
        publications.forEach(p => { if (p.date.getFullYear() === year) monthly[p.date.getMonth()]++; });
        setMonthlyData(monthly.map((v, i) => ({
          month: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"][i],
          value: v
        })));
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        // Données de démonstration en cas d'erreur
        setStats({
          publications: 12,
          evenements: 5,
          messages: 8,
          notifications: 3,
        });
        setRecentData([
          { type: "publication", titre: "Publication de démonstration", date: new Date(), sujet: "" },
          { type: "evenement", titre: "Événement de démonstration", date: new Date(), sujet: "" },
          { type: "message", titre: "Message de bienvenue", date: new Date(), sujet: "Bienvenue" }
        ]);
        setMonthlyData([
          { month: "Jan", value: 2 }, { month: "Fév", value: 3 }, { month: "Mar", value: 1 },
          { month: "Avr", value: 4 }, { month: "Mai", value: 2 }, { month: "Juin", value: 3 },
          { month: "Juil", value: 5 }, { month: "Août", value: 2 }, { month: "Sep", value: 4 },
          { month: "Oct", value: 3 }, { month: "Nov", value: 2 }, { month: "Déc", value: 1 }
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Composant de graphique simplifié sans chart.js
  const SimpleChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <div style={{ height: "300px", position: "relative" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "end", 
          justifyContent: "space-between", 
          height: "250px",
          padding: "0 20px",
          borderBottom: "2px solid #e9ecef"
        }}>
          {data.map((item, index) => (
            <div key={index} style={{ textAlign: "center", width: "40px" }}>
              <div
                style={{
                  height: `${(item.value / maxValue) * 200}px`,
                  background: "linear-gradient(to top, #667eea, #764ba2)",
                  borderRadius: "4px 4px 0 0",
                  margin: "0 5px",
                  minHeight: "4px"
                }}
              />
              <div style={{ fontSize: "12px", color: C.gray, marginTop: "8px" }}>
                {item.month}
              </div>
              <div style={{ fontSize: "10px", color: C.primary, fontWeight: "bold" }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "10px", color: C.gray, fontSize: "14px" }}>
          Activité mensuelle
        </div>
      </div>
    );
  };

  return (
    <div className="min-vh-100 dash-container" style={{ background: C.bg }}>
      <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />

      <div className="main-content" style={{ marginLeft: sidebarCollapsed ? "80px" : "280px", padding: "2rem", transition: "margin 0.4s ease" }}>
        <h1 style={{ color: "#2c3e50", fontWeight: "bold" }} className="mb-4">Tableau de Bord Membre</h1>

        <Row className="g-4 mb-5">
          {[{ icon: FaBullhorn, value: stats.publications, label: "Publications", color: C.primary },
            { icon: FaCalendarAlt, value: stats.evenements, label: "Événements", color: C.secondary },
            { icon: FaEnvelope, value: stats.messages, label: "Messages", color: C.accent },
            { icon: FaUsers, value: stats.notifications, label: "Alertes", color: C.neon }
          ].map((stat, i) => (
            <Col xl={3} lg={6} key={i}>
              <div>
                <Card className="stat-card p-4 mb-4" style={{ 
                  background: C.cardBg, 
                  borderRadius: "15px", 
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  border: "none",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-5px)";
                  e.currentTarget.style.boxShadow = "0 8px 25px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 4px 15px rgba(0,0,0,0.1)";
                }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <stat.icon size={28} style={{ color: stat.color }} />
                    <h2 style={{ fontWeight: "bold", color: "#2c3e50" }}>
                      {loading ? <Spinner animation="border" size="sm" /> : stat.value}
                    </h2>
                  </div>
                  <p style={{ fontWeight: "500", color: C.gray, marginBottom: 0 }}>{stat.label}</p>
                </Card>
              </div>
            </Col>
          ))}
        </Row>

        <Row className="g-4 mb-5">
          <Col lg={8}>
            <div>
              <Card className="p-4 mb-4" style={{ 
                borderRadius: "15px", 
                background: C.cardBg,
                border: "none",
                boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
              }}>
                <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>ACTIVITÉ MENSUELLE</h4>
                {loading ? (
                  <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spinner animation="border" />
                  </div>
                ) : (
                  <SimpleChart data={monthlyData} />
                )}
              </Card>
            </div>
          </Col>

          <Col lg={4}>
            <Card className="p-4 mb-4" style={{ 
              borderRadius: "15px", 
              background: C.cardBg,
              border: "none",
              boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
            }}>
              <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>ACCÈS RAPIDE</h4>
              {[{ label: "Publications", color: C.primary, icon: FaBullhorn, route: "/pubMembre" },
                { label: "Événements", color: C.secondary, icon: FaCalendarAlt, route: "/evenementMembre" },
                { label: "Appels d'offre", color: C.neon, icon: FaFileAlt, route: "/appeloffreMembre" },
                { label: "Messages", color: C.accent, icon: FaEnvelope, route: "/messageMembre" }
              ].map((portal, i) => (
                <div key={i}>
                  <Button 
                    className="w-100 mb-3 d-flex align-items-center justify-content-between"
                    style={{ 
                      background: portal.color, 
                      color: C.white, 
                      fontWeight: "500", 
                      borderRadius: "10px",
                      border: "none",
                      padding: "12px 16px",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.03)";
                      e.target.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "none";
                    }}
                    onClick={() => navigate(portal.route)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <portal.icon /> {portal.label}
                    </div>
                    <FaRocket />
                  </Button>
                </div>
              ))}
            </Card>
          </Col>
        </Row>

        <div>
          <Card className="p-4" style={{ 
            borderRadius: "15px", 
            background: C.cardBg,
            border: "none",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>ACTIVITÉ RÉCENTE</h4>
            <ListGroup variant="flush">
              {recentData.map((item, i) => (
                <div key={i}>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center"
                    style={{ 
                      borderRadius: "8px", 
                      marginBottom: "0.3rem", 
                      background: "#f8f9fa", 
                      color: "#2c3e50",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e9ecef";
                      e.currentTarget.style.transform = "translateX(5px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8f9fa";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "500" }}>{item.titre || item.sujet}</div>
                      <div style={{ fontSize: "0.8rem", color: C.gray }}>
                        {new Date(item.date).toLocaleString("fr-FR")}
                      </div>
                    </div>
                    <Badge style={{ 
                      background: item.type === "publication" ? C.primary : item.type === "evenement" ? C.secondary : C.accent,
                      fontSize: "0.7rem"
                    }}>
                      {item.type.toUpperCase()}
                    </Badge>
                  </ListGroup.Item>
                </div>
              ))}
              {loading && (
                <div className="text-center py-3">
                  <Spinner animation="border" />
                </div>
              )}
              {!loading && recentData.length === 0 && (
                <div className="text-center py-3 text-muted">
                  Aucune activité récente
                </div>
              )}
            </ListGroup>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashMembre;