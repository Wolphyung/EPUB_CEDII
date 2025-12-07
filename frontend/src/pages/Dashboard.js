import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ThemeProvider, ThemeToggle, useTheme } from '../components/journuit';
import axios from 'axios';

const API_URL = "http://127.0.0.1:8000/api";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [stats, setStats] = useState({
    evenements: 0,
    publications: 0,
    appelsOffre: 0,
    membres: 0,
    evenementsEnAttente: 0,
    publicationsEnAttente: 0,
    appelsOffreActifs: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    checkAuthStatus();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
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

      const evenementsEnAttente = events.filter(ev => ev.statut === "En attente").length;
      const publicationsEnAttente = publications.filter(pub => pub.statut === "En attente").length;
      const appelsOffreActifs = appelsOffre.filter(offre => offre.statut === "Validé").length;

      setStats({
        evenements: events.length,
        publications: publications.length,
        appelsOffre: appelsOffre.length,
        membres: membres.length,
        evenementsEnAttente,
        publicationsEnAttente,
        appelsOffreActifs
      });

    } catch (error) {
      console.error("Erreur chargement stats dashboard:", error);
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

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!(token && user));
  };

  const features = [
    {
      icon: "📰",
      title: "Actualités Multiformes",
      description: "Accédez aux actualités nationales, locales et institutionnelles du CEDII"
    },
    {
      icon: "📅",
      title: "Événements Professionnels",
      description: "Formations, conférences, séminaires et webinaires avec inscription en ligne"
    },
    {
      icon: "📢",
      title: "Appels d'Offre Stratégiques",
      description: "Opportunités publiques, appels à projets et candidatures"
    },
    {
      icon: "🏛️",
      title: "Réseau Institutionnel",
      description: "Connectez-vous avec les membres et partenaires du CEDII"
    }
  ];

  const displayStats = [
    { 
      number: loading ? "..." : `${stats.publications}+`, 
      label: "Publications",
      description: "Articles, rapports et documents"
    },
    { 
      number: loading ? "..." : `${stats.evenements}+`, 
      label: "Événements",
      description: "Conférences, formations, séminaires"
    },
    { 
      number: loading ? "..." : `${stats.appelsOffre}+`, 
      label: "Appels d'offre",
      description: "Opportunités professionnelles"
    },
    { 
      number: loading ? "..." : `${stats.membres}+`, 
      label: "Membres Institutionnels",
      description: "Organisations partenaires"
    }
  ];

  const publicationTypes = [
    { type: "Actualités", color: "blue", count: stats.publications },
    { type: "Événements", color: "green", count: stats.evenements },
    { type: "Appels d'offre", color: "purple", count: stats.appelsOffre },
    { type: "Annonces", color: "orange", count: stats.membres }
  ];

  return (
    <div className={`dashboard ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header avec navigation et Theme Toggle */}
      <header className="dashboard-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <Link to="/" className="logo">
                <span className="logo-text">
                  <img src="/images/logo.jpg" alt="Logo" className="logo-img" />
                </span>
                <span className="logo-text">CEDII</span>
              </Link>
              <span className="logo-subtitle">Centre d'Échange, de Documentation et d'Information Interinstitutionnels</span>
            </div>
            
            <div className="header-actions">
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-login">
                  Connexion
                </Link>
                <Link to="/register" className="btn btn-register">
                  Inscription
                </Link>
              </div>
              
              {/* Theme Toggle placé dans le header */}
              <div className="theme-toggle-container">
                <ThemeToggle />
              </div>
              
              {/* Menu mobile (optionnel) */}
              <button className="mobile-menu-btn">
                <span className="menu-icon">☰</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-background">
          <div className="grid-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="badge">
                <span>Plateforme Officielle CEDII</span>
              </div>
              <h1 className="hero-title">
                Centre d'Échange, de Documentation et d'Information{" "}
                <span className="highlight">Interinstitutionnels</span>
              </h1>
              <p className="hero-description">
                La plateforme numérique de référence pour l'échange d'informations 
                institutionnelles, la documentation spécialisée et la diffusion 
                d'actualités professionnelles à Fianarantsoa.
              </p>
              <div className="hero-buttons">
                <Link to="/register" className="btn btn-primary">
                  Devenir Membre
                </Link>
                <Link to="/login" className="btn btn-secondary">
                  Accéder à la Plateforme
                </Link>
              </div>
              <div className="security-badge">
                <div className="lock-icon">🔒</div>
                <span>Accès sécurisé authentifié pour les membres institutionnels</span>
              </div>
            </div>
            <div className="hero-visual">
              <div className="floating-card card-1">
                <div className="card-icon">📊</div>
                <h4>Tableaux de Bord</h4>
                <p>Analytique en temps réel</p>
              </div>
              <div className="floating-card card-2">
                <div className="card-icon">🤝</div>
                <h4>Réseautage</h4>
                <p>Institutions partenaires</p>
              </div>
              <div className="floating-card card-3">
                <div className="card-icon">📈</div>
                <h4>Reporting</h4>
                <p>Statistiques détaillées</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            {displayStats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Details Section */}
      <section className="statistics-details-section">
        <div className="container">
          <div className="section-header">
            <h2>Statistiques Détaillées CEDII</h2>
            <p>Vue d'ensemble des activités et contenus de la plateforme</p>
          </div>
          
          <div className="detailed-stats-grid">
            <div className="detailed-stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>Événements</h3>
                <div className="stat-main-value">{loading ? "..." : stats.evenements}</div>
                <div className="stat-details">
                  <div className="stat-detail-item">
                    <span className="detail-label">En attente de validation</span>
                    <span className="detail-value warning">{stats.evenementsEnAttente}</span>
                  </div>
                  <div className="stat-detail-item">
                    <span className="detail-label">Taux de validation</span>
                    <span className="detail-value">
                      {stats.evenements > 0 
                        ? `${Math.round(((stats.evenements - stats.evenementsEnAttente) / stats.evenements) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detailed-stat-card">
              <div className="stat-icon">📢</div>
              <div className="stat-content">
                <h3>Publications</h3>
                <div className="stat-main-value">{loading ? "..." : stats.publications}</div>
                <div className="stat-details">
                  <div className="stat-detail-item">
                    <span className="detail-label">En attente de validation</span>
                    <span className="detail-value warning">{stats.publicationsEnAttente}</span>
                  </div>
                  <div className="stat-detail-item">
                    <span className="detail-label">Taux de validation</span>
                    <span className="detail-value">
                      {stats.publications > 0 
                        ? `${Math.round(((stats.publications - stats.publicationsEnAttente) / stats.publications) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detailed-stat-card">
              <div className="stat-icon">📝</div>
              <div className="stat-content">
                <h3>Appels d'offre</h3>
                <div className="stat-main-value">{loading ? "..." : stats.appelsOffre}</div>
                <div className="stat-details">
                  <div className="stat-detail-item">
                    <span className="detail-label">Actuellement actifs</span>
                    <span className="detail-value success">{stats.appelsOffreActifs}</span>
                  </div>
                  <div className="stat-detail-item">
                    <span className="detail-label">Taux d'activité</span>
                    <span className="detail-value">
                      {stats.appelsOffre > 0 
                        ? `${Math.round((stats.appelsOffreActifs / stats.appelsOffre) * 100)}%`
                        : "0%"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="detailed-stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Membres</h3>
                <div className="stat-main-value">{loading ? "..." : stats.membres}</div>
                <div className="stat-details">
                  <div className="stat-detail-item">
                    <span className="detail-label">Institutions actives</span>
                    <span className="detail-value">{stats.membres}</span>
                  </div>
                  <div className="stat-detail-item">
                    <span className="detail-label">Croissance</span>
                    <span className="detail-value success">+{Math.floor(stats.membres * 0.2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <div className="mission-text">
              <h2>Notre Mission</h2>
              <p>
                Le CEDII centralise et diffuse l'information institutionnelle 
                pour renforcer la collaboration entre les acteurs publics, 
                privés et associatifs de la région Fianarantsoa.
              </p>
              <div className="mission-points">
                <div className="mission-point">
                  <div className="point-icon">🎯</div>
                  <div className="point-content">
                    <h4>Centralisation</h4>
                    <p>Point unique d'accès à l'information institutionnelle</p>
                  </div>
                </div>
                <div className="mission-point">
                  <div className="point-icon">🔗</div>
                  <div className="point-content">
                    <h4>Collaboration</h4>
                    <p>Renforcement des échanges inter-institutionnels</p>
                  </div>
                </div>
                <div className="mission-point">
                  <div className="point-icon">🌐</div>
                  <div className="point-content">
                    <h4>Accessibilité</h4>
                    <p>Information accessible à tous les publics</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mission-visual">
              <div className="institution-card">
                <h3>Membres Institutionnels</h3>
                <div className="institution-list">
                  <div className="institution-item">Secteur Public</div>
                  <div className="institution-item">ONG & Associations</div>
                  <div className="institution-item">Secteur Privé</div>
                  <div className="institution-item">Partenaires Internationaux</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Services ePub-CEDII</h2>
            <p>Une plateforme complète pour la gestion et la diffusion d'informations institutionnelles</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
                <div className="feature-badge">Accès {index < 2 ? "Public" : "Membres"}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Publication Types */}
      <section className="types-section">
        <div className="container">
          <div className="section-header">
            <h2>Types de Publications</h2>
            <p>Contenu diversifié pour tous les besoins informationnels</p>
          </div>
          <div className="types-grid">
            {publicationTypes.map((pub, index) => (
              <div key={index} className={`type-card type-${pub.color}`}>
                <h4>{pub.type}</h4>
                <div className="type-stats">
                  <span className="count">{loading ? "..." : `${pub.count}+`}</span>
                  <span className="label">publications</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Rejoignez le Réseau CEDII</h2>
            <p>
              Accédez à l'ensemble des services et devenez acteur 
              de l'écosystème informationnel institutionnel
            </p>
            <div className="cta-buttons">
              <Link to="/register" className="btn btn-large btn-primary">
                Adhérer au CEDII
              </Link>
              <Link to="/login" className="btn btn-large btn-outline">
                Se Connecter
              </Link>
            </div>
            <div className="access-info">
              <div className="access-level">
                <span className="level public">Public</span>
                <span>Consultation des actualités et événements</span>
              </div>
              <div className="access-level">
                <span className="level member">Membre</span>
                <span>Accès complet + publications personnalisées</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <div className="footer-logo">
                <span className="logo-text">
                  <img src="/images/logo.jpg" alt="Logo" className="logo-img" />
                </span>
                <span className="logo-text">CEDII</span>
              </div>
              <p className="footer-description">
                Plateforme officielle d'échange d'informations institutionnelles
              </p>
            </div>
            
            <div className="footer-section">
              <h4>Contact</h4>
              <ul className="footer-contact">
                <li>📧 cedii.fia@gmail.com</li>
                <li>📞 +261 34 03 931 91</li>
                <li>📍 Fianarantsoa, Madagascar</li>
              </ul>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>© 2025 CEDII - Tous droits réservés</p>
            <div className="footer-theme-toggle">
              <ThemeToggle variant="small" />
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          background-color: var(--bg-color);
          color: var(--text-color);
          transition: all 0.3s ease;
        }

        /* Variables CSS pour les thèmes */
        :root {
          --bg-color: #ffffff;
          --text-color: #000000;
          --header-bg: rgba(255, 255, 255, 0.95);
          --header-border: #e2e8f0;
          --nav-link-color: #4a5568;
          --nav-link-hover: #2d3748;
          --footer-bg: #f8fafc;
          --footer-text: #64748b;
          --card-bg: #ffffff;
          --card-border: #e2e8f0;
          --section-bg: #f8fafc;
          --hero-bg: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
          --stat-bg: #f8fafc;
          --mission-bg: #ffffff;
          --features-bg: #f8fafc;
          --types-bg: #ffffff;
          --cta-bg: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          --btn-primary-bg: linear-gradient(45deg, #3b82f6, #6366f1);
          --btn-secondary-bg: rgba(255, 255, 255, 0.1);
          --btn-outline-color: rgba(255, 255, 255, 0.3);
          --badge-bg: rgba(255, 255, 255, 0.1);
          --badge-border: rgba(255, 255, 255, 0.2);
          --floating-card-bg: rgba(255, 255, 255, 0.1);
          --floating-card-border: rgba(255, 255, 255, 0.2);
          --institution-card-bg: #f8fafc;
          --institution-item-bg: #ffffff;
          --feature-badge-bg: #e0f2fe;
          --feature-badge-color: #0369a1;
          --access-level-bg: rgba(255, 255, 255, 0.1);
          --warning-color: #f59e0b;
          --success-color: #10b981;
          --info-color: #3b82f6;
        }

        .dashboard.dark-mode {
          --bg-color: #0f172a;
          --text-color: #f1f5f9;
          --header-bg: rgba(15, 23, 42, 0.95);
          --header-border: #334155;
          --nav-link-color: #cbd5e1;
          --nav-link-hover: #ffffff;
          --footer-bg: #1e293b;
          --footer-text: #94a3b8;
          --card-bg: #1e293b;
          --card-border: #334155;
          --section-bg: #1e293b;
          --hero-bg: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
          --stat-bg: #1e293b;
          --mission-bg: #0f172a;
          --features-bg: #1e293b;
          --types-bg: #0f172a;
          --cta-bg: linear-gradient(135deg, #334155 0%, #1e293b 100%);
          --btn-primary-bg: linear-gradient(45deg, #6366f1, #3b82f6);
          --btn-secondary-bg: rgba(255, 255, 255, 0.2);
          --btn-outline-color: rgba(255, 255, 255, 0.5);
          --badge-bg: rgba(255, 255, 255, 0.2);
          --badge-border: rgba(255, 255, 255, 0.3);
          --floating-card-bg: rgba(255, 255, 255, 0.2);
          --floating-card-border: rgba(255, 255, 255, 0.3);
          --institution-card-bg: #1e293b;
          --institution-item-bg: #0f172a;
          --feature-badge-bg: #1e3a8a;
          --feature-badge-color: #e0f2fe;
          --access-level-bg: rgba(255, 255, 255, 0.2);
        }

        /* Header Styles */
        .dashboard-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: var(--header-bg);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--header-border);
          z-index: 1000;
          padding: 1rem 0;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
        }

        .logo-section {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          min-width: 200px;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          color: var(--text-color);
          font-weight: 700;
          font-size: 1.5rem;
        }

        .logo-img {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        .logo-subtitle {
          font-size: 0.8rem;
          color: var(--text-color);
          opacity: 0.8;
          margin-top: 0.25rem;
        }

        .nav-links {
          display: flex;
          gap: 2rem;
          align-items: center;
        }

        .nav-link {
          color: var(--nav-link-color);
          text-decoration: none;
          font-weight: 500;
          font-size: 1rem;
          padding: 0.5rem 0;
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-link:hover {
          color: var(--nav-link-hover);
        }

        .nav-link.active {
          color: var(--btn-primary-bg);
          font-weight: 600;
        }

        .nav-link.active::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          right: 0;
          height: 2px;
          background: var(--btn-primary-bg);
          border-radius: 1px;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .auth-buttons {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .btn-login {
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          background: transparent;
          color: var(--text-color);
          border: 1px solid var(--card-border);
          transition: all 0.3s ease;
        }

        .btn-login:hover {
          background: var(--card-bg);
          transform: translateY(-1px);
        }

        .btn-register {
          padding: 0.5rem 1.5rem;
          border-radius: 6px;
          text-decoration: none;
          font-weight: 500;
          background: var(--btn-primary-bg);
          color: white;
          border: none;
          transition: all 0.3s ease;
        }

        .btn-register:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
        }

        .theme-toggle-container {
          display: flex;
          align-items: center;
          margin-left: 1rem;
          padding-left: 1rem;
          border-left: 1px solid var(--card-border);
        }

        .mobile-menu-btn {
          display: none;
          background: none;
          border: none;
          color: var(--text-color);
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0.5rem;
        }

        /* Hero Section */
        .hero {
          position: relative;
          padding: 160px 0 80px;
          margin-top: 80px;
          background: var(--hero-bg);
          overflow: hidden;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: 
            radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
            radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.1) 0%, transparent 50%);
        }

        .grid-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          position: relative;
        }

        .hero-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .badge {
          display: inline-block;
          background: var(--badge-bg);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid var(--badge-border);
          margin-bottom: 2rem;
        }

        .badge span {
          color: white;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .hero-title {
          font-size: 3rem;
          font-weight: 700;
          color: white;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .highlight {
          background: linear-gradient(45deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-description {
          font-size: 1.25rem;
          color: rgba(255, 255, 255, 0.9);
          margin-bottom: 2.5rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: 1.5rem;
        }

        .security-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: rgba(255, 255, 255, 0.8);
          font-size: 0.9rem;
        }

        .lock-icon {
          font-size: 1rem;
        }

        .btn {
          padding: 0.75rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }

        .btn-primary {
          background: var(--btn-primary-bg);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
        }

        .btn-secondary {
          background: var(--btn-secondary-bg);
          color: white;
          backdrop-filter: blur(10px);
          border: 1px solid var(--badge-border);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .btn-large {
          padding: 1rem 2.5rem;
          font-size: 1.1rem;
        }

        .btn-outline {
          background: transparent;
          color: white;
          border: 2px solid var(--btn-outline-color);
        }

        .btn-outline:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.5);
        }

        .hero-visual {
          position: relative;
          height: 400px;
        }

        .floating-card {
          position: absolute;
          background: var(--floating-card-bg);
          backdrop-filter: blur(20px);
          border: 1px solid var(--floating-card-border);
          border-radius: 16px;
          padding: 1.5rem;
          text-align: center;
          color: white;
          animation: float 6s ease-in-out infinite;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .card-1 {
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .card-2 {
          top: 40%;
          right: 10%;
          animation-delay: 2s;
        }

        .card-3 {
          bottom: 10%;
          left: 20%;
          animation-delay: 4s;
        }

        .card-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        .floating-card h4 {
          margin: 0.5rem 0;
          font-size: 1.1rem;
        }

        .floating-card p {
          margin: 0;
          font-size: 0.9rem;
          opacity: 0.8;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(2deg); }
        }

        /* Stats Section */
        .stats-section {
          padding: 4rem 0;
          background: var(--stat-bg);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
          padding: 2rem;
          background: var(--card-bg);
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--card-border);
          transition: transform 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-5px);
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          background: linear-gradient(45deg, #1e3a8a, #3730a3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.1rem;
          color: var(--text-color);
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stat-description {
          font-size: 0.9rem;
          color: var(--text-color);
          opacity: 0.7;
        }

        /* Statistics Details Section */
        .statistics-details-section {
          padding: 4rem 0;
          background: var(--section-bg);
        }

        .detailed-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
          margin-top: 2rem;
        }

        @media (max-width: 768px) {
          .detailed-stats-grid {
            grid-template-columns: 1fr;
          }
        }

        .detailed-stat-card {
          background: var(--card-bg);
          border-radius: 16px;
          padding: 2rem;
          border: 1px solid var(--card-border);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
          display: flex;
          align-items: flex-start;
          gap: 1.5rem;
        }

        .detailed-stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
        }

        .stat-icon {
          font-size: 2.5rem;
          background: linear-gradient(135deg, var(--info-color), var(--success-color));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .stat-content {
          flex: 1;
        }

        .stat-content h3 {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.5rem;
        }

        .stat-main-value {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(45deg, #1e3a8a, #3730a3);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 1.5rem;
        }

        .stat-details {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .stat-detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--card-border);
        }

        .detail-label {
          font-size: 0.9rem;
          color: var(--text-color);
          opacity: 0.7;
        }

        .detail-value {
          font-weight: 600;
          font-size: 1rem;
        }

        .detail-value.warning {
          color: var(--warning-color);
        }

        .detail-value.success {
          color: var(--success-color);
        }

        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.2rem;
          color: var(--text-color);
          opacity: 0.8;
          max-width: 600px;
          margin: 0 auto;
        }

        /* Mission Section */
        .mission-section {
          padding: 6rem 0;
          background: var(--mission-bg);
        }

        .mission-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .mission-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--text-color);
          margin-bottom: 1.5rem;
        }

        .mission-content > .mission-text > p {
          font-size: 1.2rem;
          color: var(--text-color);
          opacity: 0.8;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        .mission-points {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .mission-point {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .point-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .point-content h4 {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 0.25rem;
        }

        .point-content p {
          color: var(--text-color);
          opacity: 0.8;
          margin: 0;
        }

        .institution-card {
          background: var(--institution-card-bg);
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid var(--card-border);
        }

        .institution-card h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 1.5rem;
        }

        .institution-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .institution-item {
          padding: 0.75rem 1rem;
          background: var(--institution-item-bg);
          border-radius: 8px;
          border: 1px solid var(--card-border);
          font-weight: 500;
          color: var(--text-color);
          opacity: 0.9;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 0;
          background: var(--features-bg);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .feature-card {
          background: var(--card-bg);
          padding: 3rem 2rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid var(--card-border);
          transition: all 0.3s ease;
          position: relative;
        }

        .feature-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1.5rem;
        }

        .feature-title {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--text-color);
          margin-bottom: 1rem;
        }

        .feature-description {
          color: var(--text-color);
          opacity: 0.8;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .feature-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: var(--feature-badge-bg);
          color: var(--feature-badge-color);
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Types Section */
        .types-section {
          padding: 6rem 0;
          background: var(--types-bg);
        }

        .types-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.5rem;
        }

        .type-card {
          padding: 2rem;
          border-radius: 12px;
          color: white;
          text-align: center;
          transition: transform 0.3s ease;
        }

        .type-card:hover {
          transform: translateY(-4px);
        }

        .type-blue {
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
        }

        .type-green {
          background: linear-gradient(135deg, #10b981, #047857);
        }

        .type-purple {
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
        }

        .type-orange {
          background: linear-gradient(135deg, #f59e0b, #d97706);
        }

        .type-card h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .type-stats {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .type-stats .count {
          font-size: 2rem;
          font-weight: 700;
        }

        .type-stats .label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        /* CTA Section */
        .cta-section {
          padding: 6rem 0;
          background: var(--cta-bg);
          color: white;
          text-align: center;
        }

        .cta-content h2 {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .cta-content p {
          font-size: 1.2rem;
          color: rgba(255, 255, 255, 0.8);
          margin-bottom: 2.5rem;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .cta-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-bottom: 3rem;
        }

        .access-info {
          display: flex;
          justify-content: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .access-level {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: var(--access-level-bg);
          padding: 1rem 1.5rem;
          border-radius: 8px;
          backdrop-filter: blur(10px);
        }

        .level {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .level.public {
          background: #10b981;
          color: white;
        }

        .level.member {
          background: #3b82f6;
          color: white;
        }

        /* Footer */
        .footer {
          background: var(--footer-bg);
          padding: 4rem 0 2rem;
          color: var(--footer-text);
        }

        .footer-content {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3rem;
          margin-bottom: 3rem;
        }

        .footer-section h4 {
          color: var(--text-color);
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1rem;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-color);
          font-weight: 700;
          font-size: 1.2rem;
          margin-bottom: 1rem;
        }

        .footer-description {
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .footer-contact {
          list-style: none;
          padding: 0;
          margin: 0;
          font-size: 0.9rem;
        }

        .footer-contact li {
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-top: 2rem;
          border-top: 1px solid var(--card-border);
          font-size: 0.9rem;
        }

        .footer-theme-toggle {
          opacity: 0.7;
          transition: opacity 0.3s ease;
        }

        .footer-theme-toggle:hover {
          opacity: 1;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .nav-links {
            display: none;
          }

          .mobile-menu-btn {
            display: block;
          }

          .header-content {
            gap: 1rem;
          }

          .auth-buttons {
            display: none;
          }

          .footer-content {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 968px) {
          .hero-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .mission-content {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }

          .types-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .hero-visual {
            height: 300px;
          }

          .footer-content {
            grid-template-columns: 1fr;
            text-align: center;
          }

          .footer-logo {
            justify-content: center;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .stats-grid,
          .types-grid {
            grid-template-columns: 1fr;
          }

          .hero-buttons,
          .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
          }

          .access-info {
            flex-direction: column;
            align-items: center;
          }

          .header-content {
            flex-wrap: wrap;
          }

          .logo-section {
            min-width: auto;
            width: 100%;
            text-align: center;
            margin-bottom: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

// Wrapper component pour fournir le contexte du thème
const DashboardWithTheme = () => (
  <ThemeProvider>
    <Dashboard />
  </ThemeProvider>
);

export default DashboardWithTheme;