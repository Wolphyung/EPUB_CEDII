import React, { useState, useEffect } from "react";
import MembreSidebar from "../../components/MembreSidebar";
import { Card, Row, Col, Button, ListGroup, Spinner, Badge } from "react-bootstrap";
import { FaBullhorn, FaCalendarAlt, FaEnvelope, FaUsers, FaRocket, FaFileAlt } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { motion, AnimatePresence } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

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

const cardMotion = {
  hover: { scale: 1.05, boxShadow: "0 15px 25px rgba(0,0,0,0.2)" },
  tap: { scale: 0.96 },
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
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
        const [pubRes, evtRes, msgRes] = await Promise.all([
          axios.get("http://127.0.0.1:8000/api/publications"),
          axios.get("http://127.0.0.1:8000/api/evenements"),
          axios.get("http://127.0.0.1:8000/api/messages"),
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
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const lineData = {
    labels: monthlyData.map(d => d.month),
    datasets: [{
      label: "Activité",
      data: monthlyData.map(d => d.value),
      fill: true,
      backgroundColor: "rgba(102,126,234,0.2)",
      borderColor: C.primary,
      borderWidth: 3,
      pointBackgroundColor: C.neon,
      pointBorderColor: "#fff",
      pointRadius: 6,
      pointHoverRadius: 8,
      tension: 0.4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(102, 126, 234, 0.1)" }, ticks: { color: C.gray } },
      x: { grid: { color: "rgba(102, 126, 234, 0.1)" }, ticks: { color: C.gray } },
    },
  };

  return (
    <div className="min-vh-100 dash-container" style={{ background: C.bg }}>
      <MembreSidebar onCollapse={setSidebarCollapsed} dark={false} />

      <div className="main-content" style={{ marginLeft: sidebarCollapsed ? "80px" : "280px", padding: "2rem", transition: "margin 0.4s ease" }}>
        <h1 style={{ color: "#2c3e50", fontWeight: "bold" }} className="mb-4">Tableau de Bord Membre</h1>

        <AnimatePresence>
          <Row className="g-4 mb-5">
            {[{ icon: FaBullhorn, value: stats.publications, label: "Publications", color: C.primary },
              { icon: FaCalendarAlt, value: stats.evenements, label: "Événements", color: C.secondary },
              { icon: FaEnvelope, value: stats.messages, label: "Messages", color: C.accent },
              { icon: FaUsers, value: stats.notifications, label: "Alertes", color: C.neon }
            ].map((stat, i) => (
              <Col xl={3} lg={6} key={i}>
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={cardMotion}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Card className="stat-card p-4 mb-4" style={{ background: C.cardBg, borderRadius: "15px", cursor: "pointer" }}>
                    <div className="d-flex justify-content-between align-items-center">
                      <stat.icon size={28} style={{ color: stat.color }} />
                      <h2 style={{ fontWeight: "bold", color: "#2c3e50" }}>{loading ? <Spinner animation="border" size="sm" /> : stat.value}</h2>
                    </div>
                    <p style={{ fontWeight: "500", color: C.gray }}>{stat.label}</p>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>
        </AnimatePresence>

        <Row className="g-4 mb-5">
          <Col lg={8}>
            <motion.div initial="hidden" animate="visible" variants={cardMotion} transition={{ duration: 0.5 }}>
              <Card className="p-4 mb-4" style={{ borderRadius: "15px", background: C.cardBg }}>
                <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>ACTIVITÉ MENSUELLE</h4>
                <div style={{ height: "300px" }}>
                  {loading ? <Spinner animation="border" /> : <Line data={lineData} options={lineOptions} />}
                </div>
              </Card>
            </motion.div>
          </Col>

          <Col lg={4}>
            <Card className="p-4 mb-4" style={{ borderRadius: "15px", background: C.cardBg }}>
              <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>ACCÈS RAPIDE</h4>
              {[{ label: "Publications", color: C.primary, icon: FaBullhorn, route: "/pubMembre" },
                { label: "Événements", color: C.secondary, icon: FaCalendarAlt, route: "/evenementMembre" },
                { label: "Appels d'offre", color: C.neon, icon: FaFileAlt, route: "/appeloffreMembre" },
                { label: "Messages", color: C.accent, icon: FaEnvelope, route: "/messageMembre" }
              ].map((portal, i) => (
                <motion.div key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} transition={{ duration: 0.2 }}>
                  <Button className="w-100 mb-3 d-flex align-items-center justify-content-between"
                    style={{ background: portal.color, color: C.white, fontWeight: "500", borderRadius: "10px" }}
                    onClick={() => navigate(portal.route)}
                  >
                    <div className="d-flex align-items-center gap-2">
                      <portal.icon /> {portal.label}
                    </div>
                    <FaRocket />
                  </Button>
                </motion.div>
              ))}
            </Card>
          </Col>
        </Row>

        <motion.div initial="hidden" animate="visible" variants={cardMotion} transition={{ duration: 0.5 }}>
          <Card className="p-4" style={{ borderRadius: "15px", background: C.cardBg }}>
            <h4 style={{ fontWeight: "600", marginBottom: "1rem", color: "#2c3e50" }}>ACTIVITÉ RÉCENTE</h4>
            <ListGroup variant="flush">
              {recentData.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <ListGroup.Item className="d-flex justify-content-between align-items-center"
                    style={{ borderRadius: "8px", marginBottom: "0.3rem", background: "#f8f9fa", color: "#2c3e50" }}>
                    <div>
                      <div style={{ fontWeight: "500" }}>{item.titre || item.sujet}</div>
                      <div style={{ fontSize: "0.8rem", color: C.gray }}>{new Date(item.date).toLocaleString("fr-FR")}</div>
                    </div>
                    <Badge style={{ background: item.type === "publication" ? C.primary : item.type === "evenement" ? C.secondary : C.accent }}>
                      {item.type.toUpperCase()}
                    </Badge>
                  </ListGroup.Item>
                </motion.div>
              ))}
              {loading && <Spinner animation="border" />}
            </ListGroup>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default DashMembre;
