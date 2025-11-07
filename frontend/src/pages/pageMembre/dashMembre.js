import React, { useState, useEffect } from "react";
import MembreSidebar from "../../components/MembreSidebar";
import { Card, Row, Col, Button, ProgressBar, ListGroup, Spinner, Alert, Badge } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { FaBullhorn, FaCalendarAlt, FaEnvelope, FaUsers, FaRocket } from "react-icons/fa";
import { Line } from "react-chartjs-2";
import { motion } from "framer-motion";
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

// Enregistrement
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const API_URL = "http://127.0.0.1:8000/api";

// === PALETTE CEDII 2025 ===
const C = {
  primary: "#5B11EE",
  secondary: "#0405BF",
  dark: "#02061E",
  accent: "#0671B6",
  gray: "#5E5E5E",
  neon: "#00f5ff",
  glass: "rgba(255, 255, 255, 0.1)",
  backdrop: "rgba(2, 6, 30, 0.7)",
};

const DashMembre = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ publications: 0, evenements: 0, messages: 0, notifications: 0 });
  const [recentData, setRecentData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // === CHARGEMENT RÉEL ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pubRes, evtRes, msgRes] = await Promise.all([
          axios.get(`${API_URL}/publications`),
          axios.get(`${API_URL}/evenements`),
          axios.get(`${API_URL}/messages`)
        ]);

        const publications = (pubRes.data.data || pubRes.data || []).map(p => ({
          ...p,
          type: "publication",
          date: new Date(p.created_at),
          titre: p.titre
        }));

        const evenements = (evtRes.data.data || evtRes.data || []).map(e => ({
          ...e,
          type: "evenement",
          date: new Date(e.created_at),
          titre: e.titre
        }));

        const messages = (msgRes.data.data || msgRes.data || []).map(m => ({
          ...m,
          type: "message",
          date: new Date(m.created_at),
          sujet: m.sujet
        }));

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

        // Données mensuelles
        const now = new Date();
        const year = now.getFullYear();
        const monthly = Array(12).fill(0);
        publications.forEach(p => {
          if (p.date.getFullYear() === year) monthly[p.date.getMonth()]++;
        });
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

  // === GRAPHIQUE FUTURISTE ===
  const lineData = {
    labels: monthlyData.map(d => d.month),
    datasets: [
      {
        label: "Activité",
        data: monthlyData.map(d => d.value),
        fill: true,
        backgroundColor: "rgba(91, 17, 238, 0.3)",
        borderColor: C.primary,
        borderWidth: 3,
        pointBackgroundColor: C.neon,
        pointBorderColor: C.primary,
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 10,
        tension: 0.4,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: C.backdrop,
        titleColor: C.neon,
        bodyColor: C.white,
        cornerRadius: 12,
        borderColor: C.primary,
        borderWidth: 1,
        padding: 16,
      },
    },
    scales: {
      y: { beginAtZero: true, grid: { color: "rgba(0,255,255,0.1)" }, ticks: { color: C.neon } },
      x: { grid: { color: "rgba(0,255,255,0.1)" }, ticks: { color: C.neon } },
    },
    animation: { duration: 3000, easing: "easeInOutQuart" },
  };

  return (
    <div className="min-vh-100" style={{
      background: `linear-gradient(135deg, #0a0e27 0%, #1a1f3d 100%)`,
      color: "#fff",
      fontFamily: "'Orbitron', sans-serif",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* PARTICULES DE FOND */}
      <div className="position-absolute top-0 start-0 w-100 h-100" style={{
        background: `radial-gradient(circle at 20% 80%, rgba(0,245,255,0.15) 0%, transparent 50%),
                     radial-gradient(circle at 80% 20%, rgba(91,17,238,0.2) 0%, transparent 50%)`,
        pointerEvents: "none",
        zIndex: 0
      }}></div>

      {/* SIDEBAR */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: sidebarCollapsed ? -200 : 0 }}
        transition={{ type: "spring", stiffness: 100 }}
        style={{
          width: sidebarCollapsed ? "80px" : "280px",
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          zIndex: 1000,
          transition: "width 0.4s ease"
        }}
      >
        <MembreSidebar onCollapse={setSidebarCollapsed} />
      </motion.div>

      {/* CONTENU PRINCIPAL */}
      <div className="flex-grow-1" style={{
        marginLeft: sidebarCollapsed ? "80px" : "280px",
        padding: "2rem",
        transition: "margin 0.4s ease",
        position: "relative",
        zIndex: 1
      }}>
        {/* EN-TÊTE FUTURISTE */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-5"
        >
          <h1 className="display-4 fw-bold" style={{
            background: `linear-gradient(90deg, ${C.primary}, ${C.neon})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            textShadow: `0 0 30px ${C.primary}50`
          }}>
            CEDII • 2025
          </h1>
          <p className="text-cyan" style={{ letterSpacing: "3px" }}>
            SYSTÈME DE CONTRÔLE CENTRALISÉ
          </p>
        </motion.div>

        {/* CARTES STATISTIQUES EN VERRE */}
        <Row className="g-4 mb-5">
          {[
            { icon: FaBullhorn, value: stats.publications, label: "PUBLICATIONS", color: C.primary },
            { icon: FaCalendarAlt, value: stats.evenements, label: "ÉVÉNEMENTS", color: C.secondary },
            { icon: FaEnvelope, value: stats.messages, label: "MESSAGES", color: C.accent },
            { icon: FaUsers, value: stats.notifications, label: "ALERTES", color: C.neon },
          ].map((stat, i) => (
            <Col xl={3} lg={6} key={i}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="border-0 shadow-lg" style={{
                  background: C.glass,
                  backdropFilter: "blur(20px)",
                  border: `1px solid ${C.primary}40`,
                  borderRadius: "20px",
                  overflow: "hidden",
                  position: "relative"
                }}>
                  <Card.Body className="p-4 text-center">
                    <div className="position-absolute top-0 end-0 p-3">
                      <div style={{
                        width: "60px",
                        height: "60px",
                        background: `radial-gradient(circle, ${stat.color}40, transparent)`,
                        borderRadius: "50%",
                        filter: "blur(20px)"
                      }}></div>
                    </div>
                    <stat.icon size={40} style={{ color: stat.color, filter: `drop-shadow(0 0 10px ${stat.color})` }} />
                    <h2 className="mt-3 mb-0" style={{ color: stat.color, fontWeight: 700 }}>
                      {loading ? <Spinner size="sm" /> : stat.value}
                    </h2>
                    <p className="text-cyan small mt-1" style={{ letterSpacing: "2px" }}>{stat.label}</p>
                  </Card.Body>
                </Card>
              </motion.div>
            </Col>
          ))}
        </Row>

        {/* GRAPHIQUE IMMERSIF */}
        <Row className="mb-5">
          <Col lg={8}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border-0" style={{
                background: C.glass,
                backdropFilter: "blur(25px)",
                border: `1px solid ${C.primary}30`,
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: `0 0 40px ${C.primary}30`
              }}>
                <Card.Body className="p-5">
                  <h4 className="text-cyan mb-4" style={{ letterSpacing: "2px" }}>
                    TRAJECTOIRE D'ACTIVITÉ • 2025
                  </h4>
                  <div style={{ height: "380px" }}>
                    {loading ? (
                      <div className="d-flex justify-content-center align-items-center h-100">
                        <Spinner animation="border" style={{ color: C.neon }} />
                      </div>
                    ) : (
                      <Line data={lineData} options={lineOptions} />
                    )}
                  </div>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>

          {/* ACCÈS RAPIDE */}
          <Col lg={4}>
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="h-100 border-0" style={{
                background: `linear-gradient(135deg, ${C.dark}ee, ${C.secondary}cc)`,
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                border: `1px solid ${C.neon}40`
              }}>
                <Card.Body className="p-5 d-flex flex-column justify-content-center">
                  <h4 className="text-cyan mb-4" style={{ letterSpacing: "2px" }}>
                    PORTAILS
                  </h4>
                  {[
                    { label: "PUBLICATIONS", to: "/pubMembre", color: C.primary },
                    { label: "ÉVÉNEMENTS", to: "/evenementMembre", color: C.secondary },
                    { label: "MESSAGES", to: "/messageMembre", color: C.accent },
                  ].map((portal, i) => (
                    <motion.div key={i} whileHover={{ x: 10 }} className="mb-3">
                      <Button
                        variant="outline-light"
                        className="w-100 text-start py-3"
                        style={{
                          border: `1px solid ${portal.color}60`,
                          borderRadius: "16px",
                          color: "#fff",
                          fontWeight: 600,
                          letterSpacing: "1px",
                          transition: "all 0.3s ease"
                        }}
                        onClick={() => navigate(portal.to)}
                      >
                        <FaRocket className="me-2" style={{ color: portal.color }} />
                        {portal.label}
                      </Button>
                    </motion.div>
                  ))}
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>

        {/* ACTIVITÉ RÉCENTE */}
        <Row>
          <Col lg={12}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Card className="border-0" style={{
                background: C.glass,
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                border: `1px solid ${C.neon}30`
              }}>
                <Card.Body className="p-5">
                  <h4 className="text-cyan mb-4" style={{ letterSpacing: "2px" }}>
                    FLUX RÉCENT
                  </h4>
                  <ListGroup variant="flush">
                    {recentData.map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <ListGroup.Item className="bg-transparent border-0 py-3 d-flex justify-content-between align-items-center text-light">
                          <div>
                            <strong style={{ color: C.neon }}>{item.titre || item.sujet}</strong>
                            <br />
                            <small className="text-cyan">
                              {new Date(item.date).toLocaleString("fr-FR")}
                            </small>
                          </div>
                          <Badge bg="dark" pill style={{
                            background: `${item.type === "publication" ? C.primary : C.accent} !important`,
                            color: "#fff"
                          }}>
                            {item.type.toUpperCase()}
                          </Badge>
                        </ListGroup.Item>
                      </motion.div>
                    ))}
                  </ListGroup>
                </Card.Body>
              </Card>
            </motion.div>
          </Col>
        </Row>
      </div>

      <Outlet />

      {/* CSS FUTURISTE */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        
        .text-cyan { color: ${C.neon} !important; }
        .btn-outline-light:hover {
          background: ${C.primary}20 !important;
          border-color: ${C.primary} !important;
          box-shadow: 0 0 20px ${C.primary}40 !important;
        }
        .card {
          transition: all 0.4s ease !important;
        }
        .card:hover {
          transform: translateY(-10px) !important;
          box-shadow: 0 20px 40px rgba(91, 17, 238, 0.3) !important;
        }
      `}</style>
    </div>
  );
};

export default DashMembre;