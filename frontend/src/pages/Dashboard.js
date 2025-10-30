import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Dashboard = () => {
  const features = [
    {
      icon: "📊",
      title: "Publications Expertes",
      description: "Accédez à des contenus spécialisés rédigés par nos experts du secteur."
    },
    {
      icon: "📅",
      title: "Événements Exclusifs",
      description: "Participez à des événements professionnels et réseautez avec les leaders."
    },
    {
      icon: "🎯",
      title: "Appels d'Offre Stratégiques",
      description: "Ne manquez aucune opportunité business avec nos alertes personnalisées."
    },
    {
      icon: "🔗",
      title: "Réseautage Intelligent",
      description: "Connectez-vous directement avec les créateurs de contenu."
    }
  ];

  const stats = [
    { number: "500+", label: "Publications" },
    { number: "150+", label: "Événements" },
    { number: "80+", label: "Appels d'offre" },
    { number: "2K+", label: "Membres" }
  ];

  return (
    <div className="dashboard">
      <Navbar />
      
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Votre Portail vers l'<span className="highlight">Excellence</span> Professionnelle
            </h1>
            <p className="hero-description">
              Rejoignez une communauté d'experts et accédez à un contenu premium 
              qui propulsera votre carrière et votre entreprise.
            </p>
            <div className="hero-buttons">
              {!localStorage.getItem("token") ? (
                <>
                  <Link to="/signup" className="btn btn-primary">
                    Créer un Compte Gratuit
                  </Link>
                  <Link to="/login" className="btn btn-secondary">
                    Se Connecter
                  </Link>
                </>
              ) : (
                <Link to="/actualite" className="btn btn-primary">
                  Explorer le Contenu
                </Link>
              )}
            </div>
          </div>
          <div className="hero-visual">
            <div className="floating-card card-1">
              <div className="card-icon">📈</div>
              <h4>Croissance</h4>
            </div>
            <div className="floating-card card-2">
              <div className="card-icon">🔗</div>
              <h4>Réseau</h4>
            </div>
            <div className="floating-card card-3">
              <div className="card-icon">💼</div>
              <h4>Opportunités</h4>
            </div>
          </div>
        </div>
        <div className="hero-background"></div>
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

      {/* Value Proposition */}
      <section className="value-section">
        <div className="container">
          <div className="section-header">
            <h2>Pourquoi Rejoindre Notre Plateforme ?</h2>
            <p>Une expérience unique conçue pour les professionnels exigeants</p>
          </div>
          
          <div className="value-content">
            <div className="value-text">
              <div className="value-point">
                <div className="point-icon">👥</div>
                <div className="point-content">
                  <h3>Relations Directes</h3>
                  <p>
                    Créez un compte pour établir des relations privilégiées avec 
                    les créateurs de publications, d'événements et d'appels d'offre.
                  </p>
                </div>
              </div>
              
              <div className="value-point">
                <div className="point-icon">🔔</div>
                <div className="point-content">
                  <h3>Suivi Personnalisé</h3>
                  <p>
                    Suivez les contenus qui vous intéressent et recevez des 
                    notifications en temps réel sur les nouvelles opportunités.
                  </p>
                </div>
              </div>
              
              <div className="value-point">
                <div className="point-icon">💬</div>
                <div className="point-content">
                  <h3>Interactions Enrichies</h3>
                  <p>
                    Échangez directement avec les auteurs, posez des questions 
                    et participez aux discussions professionnelles.
                  </p>
                </div>
              </div>
              
              <div className="value-point">
                <div className="point-icon">📱</div>
                <div className="point-content">
                  <h3>Accès Multicanaux</h3>
                  <p>
                    Consultez vos publications suivies, événements favoris et 
                    appels d'offre depuis n'importe quel appareil.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="value-visual">
              <div className="visual-card">
                <div className="card-header">
                  <div className="user-avatar">👤</div>
                  <div className="user-info">
                    <div className="user-name">Marie Lambert</div>
                    <div className="user-role">Expert Sectoriel</div>
                  </div>
                </div>
                <div className="card-content">
                  <h4>Publication Suivie</h4>
                  <p>Nouvelles tendances du marché 2024</p>
                  <div className="engagement-stats">
                    <span>📊 245 vues</span>
                    <span>💬 45 commentaires</span>
                  </div>
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
            <h2>Ce Que Vous Obtenez</h2>
            <p>Des fonctionnalités conçues pour votre succès</p>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Prêt à Transformer Votre Expérience Professionnelle ?</h2>
            <p>
              Rejoignez dès aujourd'hui notre communauté d'experts et accédez 
              à un monde d'opportunités exclusives.
            </p>
            {!localStorage.getItem("token") ? (
              <div className="cta-buttons">
                <Link to="/signup" className="btn btn-large btn-primary">
                  Commencer Maintenant
                </Link>
                <Link to="/apropos" className="btn btn-large btn-outline">
                  En Savoir Plus
                </Link>
              </div>
            ) : (
              <div className="cta-buttons">
                <Link to="/publication" className="btn btn-large btn-primary">
                  Explorer les Publications
                </Link>
                <Link to="/evenement" className="btn btn-large btn-outline">
                  Voir les Événements
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
        }

        /* Hero Section */
        .hero {
          position: relative;
          padding: 120px 0 80px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          overflow: hidden;
        }

        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 700;
          color: white;
          line-height: 1.1;
          margin-bottom: 1.5rem;
        }

        .highlight {
          background: linear-gradient(45deg, #f093fb, #f5576c);
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
        }

        .btn {
          padding: 0.75rem 2rem;
          border-radius: 12px;
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
          background: linear-gradient(45deg, #10b981, #059669);
          color: white;
          box-shadow: 0 4px 15px rgba(16, 185, 129, 0.4);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(16, 185, 129, 0.6);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.1);
          color: white;
          backdrop-filter: blur(10px);
          border: 2px solid rgba(255, 255, 255, 0.2);
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
        }

        .card-1 {
          top: 20%;
          left: 10%;
          animation-delay: 0s;
        }

        .card-2 {
          top: 50%;
          right: 10%;
          animation-delay: 2s;
        }

        .card-3 {
          bottom: 20%;
          left: 30%;
          animation-delay: 4s;
        }

        .card-icon {
          font-size: 2rem;
          margin-bottom: 0.5rem;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        /* Stats Section */
        .stats-section {
          padding: 4rem 0;
          background: #f8fafc;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 3rem;
          font-weight: 700;
          background: linear-gradient(45deg, #667eea, #764ba2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1.1rem;
          color: #64748b;
          font-weight: 500;
        }

        /* Value Section */
        .value-section {
          padding: 6rem 0;
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
        }

        .value-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: start;
        }

        .value-point {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .point-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .point-content h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .point-content p {
          color: #64748b;
          line-height: 1.6;
        }

        .visual-card {
          background: white;
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid #e2e8f0;
        }

        .card-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          background: linear-gradient(45deg, #667eea, #764ba2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .user-name {
          font-weight: 600;
          color: #1e293b;
        }

        .user-role {
          color: #64748b;
          font-size: 0.9rem;
        }

        .card-content h4 {
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .engagement-stats {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          font-size: 0.9rem;
          color: #64748b;
        }

        /* Features Section */
        .features-section {
          padding: 6rem 0;
          background: #f8fafc;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }

        .feature-card {
          background: white;
          padding: 3rem 2rem;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-10px);
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

          .value-content {
            grid-template-columns: 1fr;
          }

          .features-grid {
            grid-template-columns: 1fr;
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

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .hero-buttons, .cta-buttons {
            flex-direction: column;
            align-items: center;
          }

          .btn {
            width: 100%;
            max-width: 300px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;