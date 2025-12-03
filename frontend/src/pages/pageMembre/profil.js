// src/pages/membre/ProfilMembre.jsx

import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Alert,
  Spinner,
  Badge
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import LanguageSwitcher from "../../components/LanguageSwitcher";
import { useTranslation } from 'react-i18next';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaCalendarAlt,
  FaGlobe,
  FaLinkedin,
  FaTwitter,
  FaCamera,
  FaEdit,
  FaSave,
  FaTimes,
  FaNewspaper,
  FaCalendar,
  FaUserFriends,
  FaChartLine,
  FaRocket
} from 'react-icons/fa';

// === COULEURS ===
const COLORS = {
  primary: "#667eea",
  secondary: "#764ba2",
  accent: "#4facfe",
  neon: "#00f2fe",
  dark: "#2c3e50",
  gray: "#6c757d",
  light: "#f5f7fa",
  white: "#ffffff",
  border: "#e0e6ef",
  success: "#28a745",
  warning: "#ffc107",
  danger: "#dc3545",
  info: "#17a2b8"
};

// === STYLES ===
const styles = {
  container: {
    background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
    minHeight: '100vh'
  },
  
  card: {
    borderRadius: "18px",
    background: COLORS.white,
    border: "none",
    boxShadow: "0 6px 20px rgba(0,0,0,0.05)",
    transition: "all 0.3s ease"
  },
  
  input: {
    borderRadius: "12px",
    border: `1.5px solid ${COLORS.border}`,
    padding: "0.75rem 1rem",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    '&:focus': {
      borderColor: COLORS.primary,
      boxShadow: `0 0 0 0.25rem rgba(102, 126, 234, 0.25)`
    }
  },
  
  badge: {
    borderRadius: "20px",
    fontSize: "0.8rem",
    fontWeight: "600"
  }
};

// === COMPOSANTS RÉUTILISABLES ===
const StatsCard = ({ icon: Icon, value, label, color, onClick }) => (
  <Card 
    className="border-0 shadow-sm text-center p-4 h-100"
    style={{
      borderRadius: "18px",
      background: COLORS.white,
      transition: "all 0.3s ease",
      cursor: "pointer"
    }}
    onClick={onClick}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-8px)";
      e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.15)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "translateY(0)";
      e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.1)";
    }}
  >
    <div
      className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
      style={{
        width: "60px",
        height: "60px",
        background: `rgba(${parseInt(color.slice(1, 3), 16)}, ${parseInt(color.slice(3, 5), 16)}, ${parseInt(color.slice(5, 7), 16)}, 0.1)`,
        border: `3px solid ${color}`,
      }}
    >
      <Icon size={24} style={{ color }} />
    </div>
    <h3 style={{ 
      fontWeight: "bold", 
      color: "#2c3e50", 
      fontSize: "1.8rem",
      margin: 0 
    }}>
      {value}
    </h3>
    <p style={{ 
      fontWeight: "600", 
      color: COLORS.gray, 
      margin: 0,
      fontSize: "0.9rem",
      marginTop: "0.5rem"
    }}>
      {label}
    </p>
  </Card>
);

const InfoCard = ({ icon: Icon, title, value, color, bgColor = "rgba(102,126,234,0.05)" }) => (
  <div className="d-flex align-items-center p-3 rounded-3" style={{ background: bgColor }}>
    <div className="rounded-circle p-3 me-3" style={{ 
      background: `${color}15`,
      color: color 
    }}>
      <Icon size={20} />
    </div>
    <div style={{ minWidth: 0 }}>
      <small className="text-muted d-block">{title}</small>
      <strong className="text-truncate d-block">{value || "Non renseigné"}</strong>
    </div>
  </div>
);

// === COMPOSANT PRINCIPAL ===
const ProfilMembre = () => {
  const { t } = useTranslation();
  const [membre, setMembre] = useState({
    id: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "",
    bio: "",
    avatar: null,
    date_naissance: "",
    profession: "",
    site_web: "",
    linkedin: "",
    twitter: "",
    type: "membre",
    statut: "actif",
  });

  const [stats, setStats] = useState({
    publications: 0,
    evenements: 0,
    amis: 0,
    engagement: 85
  });

  const [editMode, setEditMode] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // === FONCTIONS UTILITAIRES ===
  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false }), 4000);
  };

  const displayAvatar = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/")) return `http://localhost:8000${avatar}`;
    return `http://localhost:8000/storage/${avatar}`;
  };

  // === CHARGEMENT DES DONNÉES ===
  const fetchProfileData = useCallback(async () => {
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const membreId = userData?.id;

      if (!membreId || !token) return;

      // Charger le profil
      const profileRes = await fetch(
        `http://localhost:8000/api/membres/${membreId}/profile`,
        {
          headers: { 
            Authorization: `Bearer ${token}`, 
            Accept: "application/json" 
          },
        }
      );
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          const updated = { ...profileData.data, type: "membre" };
          setMembre(updated);
          localStorage.setItem("user", JSON.stringify(updated));
        }
      }

      // Charger les statistiques
      const statsRes = await fetch(
        `http://localhost:8000/api/membres/${membreId}/stats`,
        {
          headers: { 
            Authorization: `Bearer ${token}`, 
            Accept: "application/json" 
          },
        }
      );
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setStats({
            publications: statsData.data.publications_count || 0,
            evenements: statsData.data.evenements_count || 0,
            amis: statsData.data.amis_count || 0,
            engagement: statsData.data.engagement_rate || 85
          });
        }
      }
    } catch (err) {
      console.error("Erreur chargement:", err);
      showAlert(t("error_load_profile"), "danger");
    }
  }, [t]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // === GESTION AVATAR ===
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) {
      showAlert(t("avatar_size_error"), "warning");
      return;
    }

    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
    };
    reader.readAsDataURL(file);
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setLoading(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await fetch(
        `http://localhost:8000/api/membres/${userData.id}/avatar`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        }
      );

      const data = await res.json();
      if (data.success) {
        const updated = { ...membre, avatar: data.avatar_url };
        setMembre(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        showAlert(t("avatar_updated_success"), "success");
        setShowAvatarModal(false);
        setAvatarFile(null);
        setAvatarPreview(null);
      } else {
        throw new Error(data.message || t("upload_error"));
      }
    } catch (err) {
      showAlert(err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  // === GESTION PROFIL ===
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMembre((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const clean = (val) => (val?.trim() === "" ? null : val?.trim());

      const payload = {
        nom: clean(membre.nom),
        prenom: clean(membre.prenom),
        email: clean(membre.email),
        telephone: clean(membre.telephone),
        adresse: clean(membre.adresse),
        ville: clean(membre.ville),
        pays: clean(membre.pays),
        bio: clean(membre.bio),
        date_naissance: clean(membre.date_naissance),
        profession: clean(membre.profession),
        site_web: clean(membre.site_web),
        linkedin: clean(membre.linkedin),
        twitter: clean(membre.twitter),
        statut: membre.statut,
        type: "membre",
      };

      const res = await fetch(
        `http://localhost:8000/api/membres/${userData.id}/profile`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        const updated = { ...data.data, type: "membre" };
        setMembre(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        showAlert(t("profile_updated_success"), "success");
        setEditMode(false);
      } else {
        const msg = data.errors 
          ? Object.values(data.errors).flat().join(", ") 
          : data.message;
        throw new Error(msg || t("save_error"));
      }
    } catch (err) {
      showAlert(err.message, "danger");
    } finally {
      setLoading(false);
    }
  };

  // === STATISTIQUES ===
  const statsCards = [
    {
      icon: FaNewspaper,
      value: stats.publications,
      label: t("publications_total"),
      color: COLORS.primary,
      onClick: () => window.location.href = "/pubMembre"
    },
    {
      icon: FaCalendar,
      value: stats.evenements,
      label: t("events_total"),
      color: COLORS.success,
      onClick: () => window.location.href = "/evenementMembre"
    },
    {
      icon: FaUserFriends,
      value: stats.amis,
      label: t("friends_total"),
      color: COLORS.warning,
      onClick: () => window.location.href = "/reseau"
    },
    {
      icon: FaChartLine,
      value: `${stats.engagement}%`,
      label: t("engagement_rate"),
      color: COLORS.info,
      onClick: () => window.location.href = "/statistiques"
    }
  ];

  // === BADGE DE STATUT ===
  const StatusBadge = ({ statut }) => {
    const config = {
      actif: { 
        color: "#00d664", 
        bg: "linear-gradient(135deg, #00c853 0%, #64dd17 100%)",
        text: t("active_member"),
        icon: FaUser
      },
      inactif: { 
        color: "#9e9e9e", 
        bg: "#9e9e9e",
        text: t("inactive"),
        icon: FaUser
      },
      suspendu: { 
        color: "#d32f2f", 
        bg: "#d32f2f",
        text: t("suspended"),
        icon: FaUser
      }
    };
    
    const cfg = config[statut] || config.actif;
    const Icon = cfg.icon;
    
    return (
      <Badge 
        className="px-4 py-2 d-inline-flex align-items-center"
        style={{
          background: cfg.bg,
          color: "white",
          borderRadius: "50px",
          fontSize: "0.9rem",
          fontWeight: "bold",
          boxShadow: statut === "actif" ? "0 4px 15px rgba(0, 200, 83, 0.4)" : "none",
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        <Icon size={12} className="me-2" />
        {cfg.text}
      </Badge>
    );
  };

  return (
    <div className="min-vh-100 d-flex flex-column" style={styles.container}>
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
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-5">
          <div>
            <h1 style={{ 
              color: "#2c3e50", 
              fontWeight: "bold", 
              fontSize: "2rem",
              marginBottom: "1rem"
            }}>
              {t("profile_title")}
            </h1>
            <p style={{ color: COLORS.gray, fontSize: "1rem", margin: 0 }}>
              {t("profile_subtitle")}
            </p>
          </div>
          <Button
            onClick={() => setEditMode(!editMode)}
            className="shadow-lg rounded-pill px-4 px-lg-5 py-2 py-lg-3 d-flex align-items-center"
            style={{
              background: editMode 
                ? COLORS.secondary 
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              border: "none",
              fontWeight: "600",
              fontSize: "1rem",
              minWidth: "200px"
            }}
          >
            {editMode ? (
              <>
                <FaTimes className="me-2" />
                {t("cancel_edit")}
              </>
            ) : (
              <>
                <FaEdit className="me-2" />
                {t("edit_profile")}
              </>
            )}
          </Button>
        </div>

        {/* Alert */}
        {alert.show && (
          <Alert
            variant={alert.type}
            dismissible
            onClose={() => setAlert({ show: false })}
            className="shadow-sm border-0 mb-4"
            style={{ borderRadius: "15px" }}
          >
            <i className={`fas ${
              alert.type === "success" ? "fa-check-circle" :
              alert.type === "warning" ? "fa-exclamation-triangle" :
              "fa-exclamation-circle"
            } me-2`}></i>
            {alert.message}
          </Alert>
        )}

        {/* Main Profile Card */}
        <Card className="shadow-lg border-0" style={{ borderRadius: "18px", overflow: "hidden" }}>
          {/* Header gradient */}
          <div style={{ 
            height: "180px", 
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            position: "relative" 
          }}></div>

          <Card.Body className="position-relative" style={{ marginTop: "-100px" }}>
            <Row>
              {/* Left Column - Avatar & Stats */}
              <Col lg={4} className="text-center mb-4 mb-lg-0">
                {/* Avatar */}
                <div className="position-relative d-inline-block mb-4">
                  <div
                    className="rounded-circle border-5 border-white shadow-lg"
                    style={{
                      width: "150px",
                      height: "150px",
                      overflow: "hidden",
                      cursor: editMode ? "pointer" : "default",
                      background: avatarPreview 
                        ? `url(${avatarPreview}) center/cover`
                        : membre.avatar 
                        ? `url(${displayAvatar(membre.avatar)}) center/cover`
                        : "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)"
                    }}
                    onClick={() => editMode && setShowAvatarModal(true)}
                  >
                    {!membre.avatar && !avatarPreview && (
                      <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                        <FaUser size={60} />
                      </div>
                    )}
                  </div>

                  {membre.statut === "actif" && (
                    <div 
                      className="position-absolute rounded-circle border-3 border-white"
                      style={{ 
                        bottom: "10px", 
                        right: "10px", 
                        width: "20px", 
                        height: "20px", 
                        backgroundColor: "#00d664",
                        boxShadow: "0 0 10px #00d664"
                      }}
                    ></div>
                  )}

                  {editMode && (
                    <div 
                      className="position-absolute bg-primary rounded-circle p-2 shadow"
                      style={{ 
                        top: "-10px", 
                        right: "-10px", 
                        cursor: "pointer",
                        zIndex: 10
                      }} 
                      onClick={() => setShowAvatarModal(true)}
                    >
                      <FaCamera className="text-white" size={16} />
                    </div>
                  )}
                </div>

                {/* Name & Status */}
                <div className="mb-4">
                  <h2 className="fw-bold text-dark mb-2">
                    {membre.prenom} {membre.nom}
                  </h2>
                  <p className="text-muted" style={{ fontSize: "1.1rem" }}>
                    {membre.profession || t("member")}
                  </p>
                  <StatusBadge statut={membre.statut} />
                </div>

                {/* Stats */}
                {!editMode && (
                  <Row className="g-3 mt-4">
                    {statsCards.map((stat, index) => (
                      <Col xs={6} key={index}>
                        <StatsCard {...stat} />
                      </Col>
                    ))}
                  </Row>
                )}
              </Col>

              {/* Right Column - Profile Info */}
              <Col lg={8}>
                {editMode ? (
                  <div className="p-4 rounded-3" style={{ background: "#f8f9fa" }}>
                    <h4 className="fw-bold mb-4">{t("edit_profile_title")}</h4>
                    
                    <Row className="g-3">
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("first_name")} *</Form.Label>
                          <Form.Control
                            name="prenom"
                            value={membre.prenom || ""}
                            onChange={handleInputChange}
                            required
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("last_name")} *</Form.Label>
                          <Form.Control
                            name="nom"
                            value={membre.nom || ""}
                            onChange={handleInputChange}
                            required
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("email")} *</Form.Label>
                          <Form.Control
                            type="email"
                            name="email"
                            value={membre.email || ""}
                            onChange={handleInputChange}
                            required
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("phone")}</Form.Label>
                          <Form.Control
                            name="telephone"
                            value={membre.telephone || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("profession")}</Form.Label>
                          <Form.Control
                            name="profession"
                            value={membre.profession || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("birth_date")}</Form.Label>
                          <Form.Control
                            type="date"
                            name="date_naissance"
                            value={membre.date_naissance || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>{t("address")}</Form.Label>
                          <Form.Control
                            name="adresse"
                            value={membre.adresse || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("city")}</Form.Label>
                          <Form.Control
                            name="ville"
                            value={membre.ville || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("country")}</Form.Label>
                          <Form.Control
                            name="pays"
                            value={membre.pays || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={12}>
                        <Form.Group>
                          <Form.Label>{t("bio")}</Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="bio"
                            value={membre.bio || ""}
                            onChange={handleInputChange}
                            style={{ ...styles.input, resize: "none" }}
                            placeholder={t("bio_placeholder")}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("website")}</Form.Label>
                          <Form.Control
                            name="site_web"
                            value={membre.site_web || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>LinkedIn</Form.Label>
                          <Form.Control
                            name="linkedin"
                            value={membre.linkedin || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>Twitter</Form.Label>
                          <Form.Control
                            name="twitter"
                            value={membre.twitter || ""}
                            onChange={handleInputChange}
                            style={styles.input}
                          />
                        </Form.Group>
                      </Col>
                      
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label>{t("status")} *</Form.Label>
                          <Form.Select
                            name="statut"
                            value={membre.statut}
                            onChange={handleInputChange}
                            style={styles.input}
                          >
                            <option value="actif">{t("active")}</option>
                            <option value="inactif">{t("inactive")}</option>
                            <option value="suspendu">{t("suspended")}</option>
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <div className="d-flex gap-3 mt-4">
                      <Button 
                        variant="primary" 
                        onClick={handleSave} 
                        disabled={loading}
                        className="rounded-pill px-5 py-2 shadow-lg d-flex align-items-center"
                        style={{
                          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          border: "none",
                          fontWeight: "600"
                        }}
                      >
                        {loading ? (
                          <>
                            <Spinner animation="border" size="sm" className="me-2" />
                            {t("saving")}
                          </>
                        ) : (
                          <>
                            <FaSave className="me-2" />
                            {t("save_profile")}
                          </>
                        )}
                      </Button>
                      
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setEditMode(false)}
                        className="rounded-pill px-5 py-2"
                      >
                        <FaTimes className="me-2" />
                        {t("cancel")}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <h4 className="fw-bold mb-4">{t("personal_info")}</h4>
                    
                    <Row className="g-3 mb-4">
                      <Col md={6}>
                        <InfoCard
                          icon={FaEnvelope}
                          title={t("email")}
                          value={membre.email}
                          color={COLORS.primary}
                        />
                      </Col>
                      
                      <Col md={6}>
                        <InfoCard
                          icon={FaPhone}
                          title={t("phone")}
                          value={membre.telephone}
                          color={COLORS.success}
                          bgColor="rgba(40,167,69,0.05)"
                        />
                      </Col>
                      
                      <Col md={6}>
                        <InfoCard
                          icon={FaMapMarkerAlt}
                          title={t("location")}
                          value={membre.ville && membre.pays ? `${membre.ville}, ${membre.pays}` : null}
                          color={COLORS.danger}
                          bgColor="rgba(220,53,69,0.05)"
                        />
                      </Col>
                      
                      <Col md={6}>
                        <InfoCard
                          icon={FaBriefcase}
                          title={t("profession")}
                          value={membre.profession}
                          color={COLORS.warning}
                          bgColor="rgba(255,193,7,0.05)"
                        />
                      </Col>
                      
                      <Col md={6}>
                        <InfoCard
                          icon={FaCalendarAlt}
                          title={t("birth_date")}
                          value={membre.date_naissance ? new Date(membre.date_naissance).toLocaleDateString() : null}
                          color={COLORS.info}
                          bgColor="rgba(23,162,184,0.05)"
                        />
                      </Col>
                      
                      <Col md={6}>
                        <InfoCard
                          icon={FaUser}
                          title={t("status")}
                          value={t(membre.statut)}
                          color={COLORS.secondary}
                          bgColor="rgba(118,75,162,0.05)"
                        />
                      </Col>
                    </Row>

                    {/* Bio */}
                    <div className="mb-4">
                      <h5 className="fw-bold mb-3">{t("about_me")}</h5>
                      <Card className="border-0 shadow-sm" style={{ 
                        background: "linear-gradient(135deg, #667eea10 0%, #764ba210 100%)",
                        borderRadius: "12px"
                      }}>
                        <Card.Body className="p-4">
                          <p className="mb-0" style={{ lineHeight: "1.7" }}>
                            {membre.bio || t("no_bio")}
                          </p>
                        </Card.Body>
                      </Card>
                    </div>

                    {/* Social Networks */}
                    {(membre.site_web || membre.linkedin || membre.twitter) && (
                      <div>
                        <h5 className="fw-bold mb-3">{t("social_networks")}</h5>
                        <div className="d-flex gap-3">
                          {membre.site_web && (
                            <a 
                              href={membre.site_web} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              <div 
                                className="rounded-circle p-3 shadow-sm"
                                style={{ 
                                  background: COLORS.primary,
                                  color: "white",
                                  transition: "all 0.3s ease"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                }}
                              >
                                <FaGlobe size={20} />
                              </div>
                            </a>
                          )}
                          
                          {membre.linkedin && (
                            <a 
                              href={membre.linkedin} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              <div 
                                className="rounded-circle p-3 shadow-sm"
                                style={{ 
                                  background: "#0077B5",
                                  color: "white",
                                  transition: "all 0.3s ease"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                }}
                              >
                                <FaLinkedin size={20} />
                              </div>
                            </a>
                          )}
                          
                          {membre.twitter && (
                            <a 
                              href={membre.twitter} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-decoration-none"
                            >
                              <div 
                                className="rounded-circle p-3 shadow-sm"
                                style={{ 
                                  background: "#1DA1F2",
                                  color: "white",
                                  transition: "all 0.3s ease"
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.transform = "scale(1.1)";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.transform = "scale(1)";
                                }}
                              >
                                <FaTwitter size={20} />
                              </div>
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </div>

      {/* Modal Avatar */}
      <Modal 
        show={showAvatarModal} 
        onHide={() => {
          setShowAvatarModal(false);
          setAvatarFile(null);
          setAvatarPreview(null);
        }} 
        centered
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            <FaCamera className="me-2" />
            {t("change_profile_picture")}
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="text-center p-4">
          <div 
            className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center"
            style={{ 
              width: "120px", 
              height: "120px", 
              overflow: "hidden",
              background: avatarPreview 
                ? `url(${avatarPreview}) center/cover`
                : membre.avatar 
                ? `url(${displayAvatar(membre.avatar)}) center/cover`
                : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            }}
          >
            {!avatarPreview && !membre.avatar && (
              <FaCamera size={40} className="text-white" />
            )}
          </div>
          
          <Form.Group className="mb-4">
            <Form.Control
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={styles.input}
            />
            <Form.Text className="text-muted">
              {t("avatar_formats")}
            </Form.Text>
          </Form.Group>
          
          <div className="d-flex gap-3 justify-content-center">
            <Button 
              variant="outline-secondary" 
              onClick={() => {
                setShowAvatarModal(false);
                setAvatarFile(null);
                setAvatarPreview(null);
              }} 
              className="rounded-pill px-4"
            >
              <FaTimes className="me-2" />
              {t("cancel")}
            </Button>
            
            <Button 
              variant="primary" 
              onClick={saveAvatar} 
              disabled={!avatarFile || loading}
              className="rounded-pill px-4 shadow-sm"
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none"
              }}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  {t("uploading")}
                </>
              ) : (
                <>
                  <FaSave className="me-2" />
                  {t("save")}
                </>
              )}
            </Button>
          </div>
        </Modal.Body>
      </Modal>

      {/* Language Switcher */}
      <footer style={{ 
        position: "fixed",
        bottom: "20px",
        right: "20px",
        zIndex: 1000,
        background: "rgba(255, 255, 255, 0.9)",
        padding: "10px",
        borderRadius: "10px",
        backdropFilter: "blur(5px)",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <LanguageSwitcher />
      </footer>

      {/* Custom Styles */}
      <style jsx>{`
        .modal-content {
          border-radius: 18px !important;
          border: none !important;
          box-shadow: 0 25px 50px rgba(0,0,0,0.2) !important;
        }
        
        .form-control:focus,
        .form-select:focus {
          border-color: #667eea !important;
          box-shadow: 0 0 0 0.25rem rgba(102, 126, 234, 0.25) !important;
        }
        
        a:hover {
          text-decoration: none !important;
        }
      `}</style>
    </div>
  );
};

export default ProfilMembre;