import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const Dashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!(token && user));
  };

  const handleAccessDashboard = () => {
    navigate('/login');
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

  const stats = [
    { number: "500+", label: "Publications" },
    { number: "150+", label: "Événements" },
    { number: "80+", label: "Appels d'offre" },
    { number: "50+", label: "Membres Institutionnels" }
  ];

  const publicationTypes = [
    { type: "Actualités", color: "blue" },
    { type: "Événements", color: "green" },
    { type: "Appels d'offre", color: "purple" },
    { type: "Annonces", color: "orange" }
  ];

  return (
    <div className="dashboard">
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
                <span className="highlight">Inter-Institutionnelles</span>
              </h1>
              <p className="hero-description">
                La plateforme numérique de référence pour l'échange d'informations 
                institutionnelles, la documentation spécialisée et la diffusion 
                d'actualités professionnelles à Fianarantsoa.
              </p>
              <div className="hero-buttons">
                <Link to="/signup" className="btn btn-primary">
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
            {stats.map((stat, index) => (
              <div key={index} className="stat-item">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
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
            <h2>Services ePub CEDII</h2>
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
                  <span className="count">120+</span>
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
              <Link to="/signup" className="btn btn-large btn-primary">
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

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
        }

        /* Hero Section */
        .hero {
          position: relative;
          padding: 120px 0 80px;
          background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%);
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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          padding: 0.5rem 1rem;
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.2);
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
          background: linear-gradient(45deg, #3b82f6, #6366f1);
          color: white;
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(59, 130, 246, 0.6);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
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
          border: 2px solid rgba(255, 255, 255, 0.3);
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
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
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
          background: #f8fafc;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
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
          font-size: 1rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Mission Section */
        .mission-section {
          padding: 6rem 0;
          background: white;
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
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .mission-content > .mission-text > p {
          font-size: 1.2rem;
          color: #64748b;
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
          color: #1e293b;
          margin-bottom: 0.25rem;
        }

        .point-content p {
          color: #64748b;
          margin: 0;
        }

        .institution-card {
          background: #f8fafc;
          padding: 2rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
        }

        .institution-card h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }

        .institution-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .institution-item {
          padding: 0.75rem 1rem;
          background: white;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-weight: 500;
          color: #475569;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 0;
          background: #f8fafc;
        }

        .section-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .section-header h2 {
          font-size: 2.5rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .section-header p {
          font-size: 1.2rem;
          color: #64748b;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 3rem 2rem;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
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
          color: #1e293b;
          margin-bottom: 1rem;
        }

        .feature-description {
          color: #64748b;
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        .feature-badge {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #e0f2fe;
          color: #0369a1;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        /* Types Section */
        .types-section {
          padding: 6rem 0;
          background: white;
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
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
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
          background: rgba(255, 255, 255, 0.1);
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

        /* Responsive */
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
        }
      `}</style>
    </div>
  );
};

export default Dashboard;