import React, { useState, useEffect } from "react";
import MembreSidebar from "../../components/MembreSidebar";
import { 
  Card, 
  Row, 
  Col, 
  Button, 
  ListGroup, 
  Spinner, 
  Badge,
  Container,
  Footer
} from "react-bootstrap";
import { 
  FaBullhorn, 
  FaCalendarAlt, 
  FaEnvelope, 
  FaUsers, 
  FaRocket, 
  FaFileAlt 
} from "react-icons/fa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from "../../components/LanguageSwitcher";

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
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ 
    publications: 0, 
    evenements: 0, 
    messages: 0, 
    notifications: 0 
  });
  const [recentData, setRecentData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const mockData = {
    publications: [
      { id: 1, titre: "Lancement du projet 2025", created_at: "2025-11-10T10:00:00" },
      { id: 2, titre: "Réunion générale", created_at: "2025-11-08T14:30:00" }
    ],
    evenements: [
      { id: 1, titre: "Assemblée Générale", created_at: "2025-12-01T09:00:00" },
      { id: 2, titre: "Formation sécurité", created_at: "2025-11-20T13:00:00" }
    ],
    messages: [
      { id: 1, sujet: "Bienvenue !", created_at: "2025-11-12T08:15:00" },
      { id: 2, sujet: "Rappel : Réunion demain", created_at: "2025-11-11T16:45:00" }
    ]
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        const [pubRes, evtRes, msgRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/publications", { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get("http://127.0.0.1:8000/api/evenements", { headers })
            .catch(() => ({ data: { data: [] } })),
          axios.get("http://127.0.0.1:8000/api/messages", { headers })
            .catch(() => ({ data: { data: [] } }))
        ]);

        let publications = (pubRes.data.data || pubRes.data || []).map(p => ({ 
          ...p, 
          type: "publication", 
          date: new Date(p.created_at || new Date()), 
          titre: p.titre || t("sans_titre") 
        }));

        let evenements = (evtRes.data.data || evtRes.data || []).map(e => ({ 
          ...e, 
          type: "evenement", 
          date: new Date(e.created_at || new Date()), 
          titre: e.titre || t("sans_titre") 
        }));

        let messages = (msgRes.data.data || msgRes.data || []).map(m => ({ 
          ...m, 
          type: "message", 
          date: new Date(m.created_at || new Date()), 
          sujet: m.sujet || t("no_subject") 
        }));

        if (publications.length === 0 && evenements.length === 0 && messages.length === 0) {
          console.info(t("api_unavailable_message"));
          publications = mockData.publications.map(p => ({ ...p, type: "publication", date: new Date(p.created_at) }));
          evenements = mockData.evenements.map(e => ({ ...e, type: "evenement", date: new Date(e.created_at) }));
          messages = mockData.messages.map(m => ({ ...m, type: "message", date: new Date(m.created_at) }));
        }

        setStats({
          publications: publications.length,
          evenements: evenements.length,
          messages: messages.length,
          notifications: 5,
        });

        const all = [...publications, ...evenements, ...messages]
          .sort((a, b) => b.date - a.date)
          .slice(0, 5);
        setRecentData(all);

        const now = new Date();
        const year = now.getFullYear();
        const monthly = Array(12).fill(0);
        publications.forEach(p => { 
          const d = p.date;
          if (d.getFullYear() === year) monthly[d.getMonth()]++; 
        });
        setMonthlyData(monthly.map((v, i) => ({
          month: t(`months.${i}`),
          value: v
        })));

      } catch (err) {
        console.warn(t("demo_mode_activated"), err);
        const publications = mockData.publications.map(p => ({ ...p, type: "publication", date: new Date(p.created_at) }));
        const evenements = mockData.evenements.map(e => ({ ...e, type: "evenement", date: new Date(e.created_at) }));
        const messages = mockData.messages.map(m => ({ ...m, type: "message", date: new Date(m.created_at) }));

        setStats({
          publications: publications.length,
          evenements: evenements.length,
          messages: messages.length,
          notifications: 3,
        });

        setRecentData([
          ...publications,
          ...evenements,
          ...messages
        ].sort((a, b) => b.date - a.date).slice(0, 5));

        setMonthlyData([
          { month: t("months.0"), value: 2 }, { month: t("months.1"), value: 3 }, { month: t("months.2"), value: 1 },
          { month: t("months.3"), value: 4 }, { month: t("months.4"), value: 2 }, { month: t("months.5"), value: 3 },
          { month: t("months.6"), value: 5 }, { month: t("months.7"), value: 2 }, { month: t("months.8"), value: 4 },
          { month: t("months.9"), value: 3 }, { month: t("months.10"), value: 2 }, { month: t("months.11"), value: 1 }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [t]);

  const SimpleChart = ({ data }) => {
    const maxValue = Math.max(...data.map(d => d.value), 1);
    
    return (
      <div style={{ height: "300px", position: "relative", padding: "20px 0" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "end", 
          justifyContent: "space-between", 
          height: "250px",
          padding: "0 20px",
          borderBottom: "2px solid #e9ecef"
        }}>
          {data.map((item, index) => (
            <div key={index} style={{ textAlign: "center", width: "40px", position: "relative" }}>
              <div
                style={{
                  height: `${(item.value / maxValue) * 200}px`,
                  background: "linear-gradient(to top, #667eea, #764ba2)",
                  borderRadius: "6px 6px 0 0",
                  margin: "0 5px",
                  minHeight: "4px",
                  transition: "all 0.3s ease",
                  boxShadow: "0 2px 8px rgba(102, 126, 234, 0.3)"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scaleY(1.1)";
                  e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.5)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scaleY(1)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(102, 126, 234, 0.3)";
                }}
              />
              <div style={{ fontSize: "11px", color: C.gray, marginTop: "8px", fontWeight: "500" }}>
                {item.month}
              </div>
              <div style={{ 
                fontSize: "12px", 
                color: C.primary, 
                fontWeight: "bold",
                position: "absolute",
                top: `${(item.value / maxValue) * 200 - 20}px`,
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(255,255,255,0.9)",
                padding: "2px 6px",
                borderRadius: "4px",
                opacity: item.value > 0 ? 1 : 0,
                pointerEvents: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)"
              }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: "12px", color: C.gray, fontSize: "14px", fontWeight: "500" }}>
          {t('monthly_activity')}
        </div>
      </div>
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
          transition: "margin 0.4s ease",
          minHeight: "calc(100vh - 80px)"
        }}
      >
        <h1 style={{ 
          color: "#2c3e50", 
          fontWeight: "bold", 
          fontSize: "2rem",
          marginBottom: "1.5rem"
        }}>
          {t('member_dashboard_title')}
        </h1>

        {/* === CARTES STATISTIQUES === */}
        <Row className="g-4 mb-5">
          {[
            { icon: FaBullhorn, value: stats.publications, label: t("publications_total"), color: C.primary },
            { icon: FaCalendarAlt, value: stats.evenements, label: t("events_total"), color: C.secondary },
            { icon: FaEnvelope, value: stats.messages, label: t("messages"), color: C.accent },
            { icon: FaUsers, value: stats.notifications, label: t("alerts"), color: C.neon }
          ].map((stat, i) => (
            <Col xl={3} lg={6} key={i}>
              <Card 
                className="shadow-sm border-0"
                style={{ 
                  borderRadius: "18px", 
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background: C.cardBg
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-8px)";
                  e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <stat.icon size={32} style={{ color: stat.color }} />
                    </div>
                    <div className="text-end">
                      <h2 style={{ 
                        fontWeight: "bold", 
                        color: "#2c3e50", 
                        fontSize: "2rem",
                        margin: 0
                      }}>
                        {loading ? <Spinner animation="border" size="sm" /> : stat.value}
                      </h2>
                      <p style={{ 
                        fontWeight: "600", 
                        color: C.gray, 
                        margin: 0,
                        fontSize: "0.9rem"
                      }}>
                        {stat.label}
                      </p>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* === GRAPHIQUE + ACCÈS RAPIDE === */}
        <Row className="g-4 mb-5">
          <Col lg={8}>
            <Card className="shadow-sm border-0" style={{ borderRadius: "18px", background: C.cardBg }}>
              <Card.Body className="p-4">
                <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#2c3e50" }}>
                  {t('monthly_activity_chart')}
                </h4>
                {loading ? (
                  <div style={{ height: "300px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : (
                  <SimpleChart data={monthlyData} />
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            <Card className="shadow-sm border-0 h-100" style={{ borderRadius: "18px", background: C.cardBg }}>
              <Card.Body className="p-4">
                <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#2c3e50" }}>
                  {t('quick_access')}
                </h4>
                {[
                  { label: t("menu_publication"), color: C.primary, icon: FaBullhorn, route: "/pubMembre" },
                  { label: t("menu_event"), color: C.secondary, icon: FaCalendarAlt, route: "/evenementMembre" },
                  { label: t("menu_call_for_tender"), color: C.neon, icon: FaFileAlt, route: "/appeloffreMembre" },
                  { label: t("menu_messages"), color: C.accent, icon: FaEnvelope, route: "/messageMembre" }
                ].map((portal, i) => (
                  <Button 
                    key={i}
                    className="w-100 mb-3 d-flex align-items-center justify-content-between shadow-sm"
                    style={{ 
                      background: portal.color, 
                      color: C.white, 
                      fontWeight: "600", 
                      borderRadius: "12px",
                      border: "none",
                      padding: "14px 18px",
                      transition: "all 0.3s ease",
                      fontSize: "0.95rem"
                    }}
                    onClick={() => navigate(portal.route)}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.03)";
                      e.target.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                      e.target.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
                    }}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <portal.icon size={18} /> {portal.label}
                    </div>
                    <FaRocket size={16} />
                  </Button>
                ))}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* === ACTIVITÉ RÉCENTE === */}
        <Card className="shadow-sm border-0" style={{ borderRadius: "18px", background: C.cardBg }}>
          <Card.Body className="p-4">
            <h4 style={{ fontWeight: "700", marginBottom: "1.5rem", color: "#2c3e50" }}>
              {t('recent_activity')}
            </h4>
            <ListGroup variant="flush">
              {recentData.length > 0 ? (
                recentData.map((item, i) => (
                  <ListGroup.Item 
                    key={i}
                    className="d-flex justify-content-between align-items-center px-3 py-3"
                    style={{ 
                      borderRadius: "12px", 
                      marginBottom: "0.5rem", 
                      background: "#f8f9fa", 
                      color: "#2c3e50",
                      border: "none",
                      transition: "all 0.3s ease"
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#e9ecef";
                      e.currentTarget.style.transform = "translateX(8px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#f8f9fa";
                      e.currentTarget.style.transform = "translateX(0)";
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
                        {item.titre || item.sujet}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: C.gray }}>
                        {new Date(item.date).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </div>
                    </div>
                    <Badge 
                      pill
                      style={{ 
                        background: item.type === "publication" ? C.primary : 
                                   item.type === "evenement" ? C.secondary : C.accent,
                        fontSize: "0.7rem",
                        fontWeight: "600",
                        padding: "6px 10px"
                      }}
                    >
                      {item.type === "publication" ? t("pub_abbr") : 
                       item.type === "evenement" ? t("event_abbr") : t("msg_abbr")}
                    </Badge>
                  </ListGroup.Item>
                ))
              ) : loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : (
                <div className="text-center py-4 text-muted">
                  {t('no_recent_activity')}
                </div>
              )}
            </ListGroup>
          </Card.Body>
        </Card>
      </div>

      {/* === FOOTER AVEC SELECTEUR DE LANGUE === */}
      <footer style={{ 
        background: "linear-gradient(135deg, #2c3e50, #34495e)",
        color: "white",
        padding: "1.5rem 2rem",
        marginLeft: sidebarCollapsed ? "80px" : "280px",
        transition: "margin 0.4s ease",
        borderTop: "1px solid rgba(255,255,255,0.1)"
      }}>
        <Container fluid>
          <Row className="align-items-center">
            <Col md={4} className="text-center text-md-start mb-3 mb-md-0">
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-2">
                <i className="fas fa-language fs-5" style={{ color: "#667eea" }}></i>
                <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>{t('choose_language')}</span>
              </div>
            </Col>
            
            <Col md={4} className="text-center mb-3 mb-md-0">
              <LanguageSwitcher />
            </Col>
            
            <Col md={4} className="text-center text-md-end">
              <small style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                &copy; {new Date().getFullYear()} {t('platform_name')} • v2.1.0
              </small>
            </Col>
          </Row>
        </Container>
      </footer>
    </div>
  );
};

export default DashMembre;