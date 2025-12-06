import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { ThemeProvider, ThemeToggle, useTheme } from '../components/journuit';

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [strength, setStrength] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const { isDarkMode } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setApiError("");

    if (name === "password") {
      let score = 0;
      if (value.length >= 8) score += 1;
      if (/[A-Z]/.test(value)) score += 1;
      if (/[0-9]/.test(value)) score += 1;
      if (/[^A-Za-z0-9]/.test(value)) score += 1;
      setStrength(score);
    }
  };

  const toggleShowPw = () => setShowPw(!showPw);
  const toggleShowConfirmPw = () => setShowConfirmPw(!showConfirmPw);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Nom complet requis";
    if (!formData.email.trim()) newErrors.email = "Email requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email invalide";

    const pw = formData.password;
    if (!pw) newErrors.password = "Mot de passe requis";
    else if (pw.length < 8) newErrors.password = "Minimum 8 caractères";
    else if (!/[A-Z]/.test(pw)) newErrors.password = "Doit contenir au moins une majuscule";
    else if (!/[0-9]/.test(pw)) newErrors.password = "Doit contenir au moins un chiffre";
    else if (!/[^A-Za-z0-9]/.test(pw)) newErrors.password = "Doit contenir un caractère spécial";

    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validate();
    
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setApiError("");

    try {
      const response = await axios.post("http://localhost:8000/api/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      setSuccess("Inscription réussie ! Redirection...");
      
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      setTimeout(() => {
        navigate("/login");
      }, 2000);

    } catch (error) {
      console.error("Erreur d'inscription:", error);
      
      if (error.response) {
        const serverErrors = error.response.data.errors;
        if (serverErrors) {
          const formattedErrors = {};
          Object.keys(serverErrors).forEach(key => {
            formattedErrors[key] = serverErrors[key][0];
          });
          setErrors(formattedErrors);
        } else {
          setApiError(error.response.data.message || "Erreur lors de l'inscription");
        }
      } else if (error.request) {
        setApiError("Impossible de se connecter au serveur. Vérifiez votre connexion.");
      } else {
        setApiError("Une erreur inattendue s'est produite");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`signup-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header avec Theme Toggle */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <i className="fas fa-globe-americas"></i>
            <span>CEDII</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <div className="split-layout">
        {/* Section Gauche - 70% */}
        <div className="left-section">
          <div className="section-content">
            {/* En-tête Hero */}
            <div className="hero-header">
              <div className="badge">
                <i className="fas fa-user-plus"></i>
                <span>REJOIGNEZ NOTRE RÉSEAU</span>
              </div>
              <h1 className="hero-title">
                Créez votre compte
                <span className="title-highlight">institutionnel</span>
              </h1>
              <p className="hero-description">
                Accédez à la plateforme collaborative qui révolutionne les échanges 
                entre institutions gouvernementales et organisations.
              </p>
            </div>

            {/* Caractéristiques principales */}
            <div className="features-showcase">
              <h2 className="section-title">
                <i className="fas fa-star"></i>
                Avantages de l'inscription
              </h2>
              
              <div className="features-grid">
                <div className="feature-card feature-highlight">
                  <div className="feature-icon">
                    <i className="fas fa-network-wired"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Connexion Réseau</h3>
                    <p>Accédez à plus de 500 institutions partenaires</p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-rocket"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Démarrage Rapide</h3>
                    <p>Configuration complète en moins de 5 minutes</p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-headset"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Support Dédié</h3>
                    <p>Équipe technique disponible 24/7</p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="feature-content">
                    <h3>Sécurité Maximale</h3>
                    <p>Chiffrement de bout en bout des données</p>
                  </div>
                </div>
              </div>
            </div>

        
            {/* Statistiques */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">Institutions</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">Disponibilité</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">Support</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">≤ 5min</div>
                  <div className="stat-label">Configuration</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Éléments décoratifs */}
          <div className="decorative-elements">
            <div className="floating-circle circle-1"></div>
            <div className="floating-circle circle-2"></div>
            <div className="floating-circle circle-3"></div>
            <div className="grid-pattern"></div>
          </div>
        </div>

        {/* Section Droite - 30% avec formulaire en pleine hauteur */}
        <div className="right-section">
          <div className="full-height-form-container">
            {/* Logo CEDII */}
            <div className="cedii-logo">
              <div className="logo-circle">
                <i className="fas fa-globe-americas"></i>
              </div>
              <div className="logo-text">
                <h2>CEDII</h2>
                <p>Centre d'Échange Institutionnel</p>
              </div>
            </div>

            {/* Carte d'inscription en pleine hauteur */}
            <div className="full-height-signup-card">
              <div className="card-header">
                <h3>Créer un compte</h3>
                <p>Rejoignez notre réseau institutionnel</p>
              </div>

              <Form onSubmit={handleSubmit} className="signup-form">
                {success && (
                  <div className="success-message">
                    <i className="fas fa-check-circle"></i>
                    <span>{success}</span>
                  </div>
                )}

                {apiError && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{apiError}</span>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    <i className="fas fa-user"></i>
                    Nom complet
                  </label>
                  <div className="input-container">
                    <input
                      id="name"
                      type="text"
                      name="name"
                      placeholder="Votre nom complet"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope"></i>
                    Email Institutionnel
                  </label>
                  <div className="input-container">
                    <input
                      id="email"
                      type="email"
                      name="email"
                      placeholder="nom@institution.mg"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-input"
                    />
                  </div>
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <i className="fas fa-lock"></i>
                    Mot de passe
                  </label>
                  <div className="input-container">
                    <input
                      id="password"
                      type={showPw ? "text" : "password"}
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleShowPw}
                      tabIndex="-1"
                    >
                      <i className={`fas ${showPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.password && <div className="form-error">{errors.password}</div>}
                  
                  {/* Indicateur de force du mot de passe */}
                  <div className="password-strength">
                    <div className="strength-bar">
                      <div 
                        className={`strength-fill strength-${strength}`}
                        style={{width: `${(strength / 4) * 100}%`}}
                      ></div>
                    </div>
                    <div className="strength-labels">
                      <span className={strength >= 1 ? 'active' : ''}>Faible</span>
                      <span className={strength >= 2 ? 'active' : ''}>Moyen</span>
                      <span className={strength >= 3 ? 'active' : ''}>Fort</span>
                      <span className={strength >= 4 ? 'active' : ''}>Très fort</span>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    <i className="fas fa-lock"></i>
                    Confirmer le mot de passe
                  </label>
                  <div className="input-container">
                    <input
                      id="confirmPassword"
                      type={showConfirmPw ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirmer le mot de passe"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={loading}
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={toggleShowConfirmPw}
                      tabIndex="-1"
                    >
                      <i className={`fas ${showConfirmPw ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="signup-button"
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      <span>Inscription...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-user-plus"></i>
                      <span>Créer mon compte</span>
                    </>
                  )}
                </button>
              </Form>

              <div className="divider">
                <span>ou</span>
              </div>

              {/* Options de connexion */}
              <div className="signup-options">
                <div className="login-redirect">
                  <p>Vous avez déjà un compte ?</p>
                  <Link to="/login" className="login-link">
                    <i className="fas fa-sign-in-alt"></i>
                    <span>Se connecter</span>
                  </Link>
                </div>
              </div>

              {/* Conditions d'utilisation */}
              <div className="terms-section">
                <p className="terms-text">
                  En créant un compte, vous acceptez nos
                  <Link to="/terms"> conditions d'utilisation</Link> et notre
                  <Link to="/privacy"> politique de confidentialité</Link>.
                </p>
              </div>

              {/* Footer */}
              <div className="signup-footer">
                <div className="footer-links">
                  <Link to="/privacy">
                    <i className="fas fa-shield-alt"></i>
                    Confidentialité
                  </Link>
                  <Link to="/terms">
                    <i className="fas fa-file-contract"></i>
                    Conditions
                  </Link>
                  <Link to="/support">
                    <i className="fas fa-headset"></i>
                    Support
                  </Link>
                </div>
                <p className="copyright">
                  © {new Date().getFullYear()} CEDII Messenger v2.0
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Variables CSS */
        :root {
          --primary-color: #2563eb;
          --primary-hover: #1d4ed8;
          --secondary-color: #3b82f6;
          --accent-color: #8b5cf6;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --text-light: #94a3b8;
          --bg-primary: #ffffff;
          --bg-secondary: #f8fafc;
          --bg-tertiary: #f1f5f9;
          --border-color: #e2e8f0;
          --success-color: #10b981;
          --error-color: #ef4444;
          --warning-color: #f59e0b;
          --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.12);
          --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          --radius-sm: 0.375rem;
          --radius-md: 0.5rem;
          --radius-lg: 0.75rem;
          --radius-xl: 1rem;
          --radius-2xl: 1.5rem;
        }

        .dark-mode {
          --primary-color: #3b82f6;
          --primary-hover: #2563eb;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --text-light: #94a3b8;
          --bg-primary: #0f172a;
          --bg-secondary: #1e293b;
          --bg-tertiary: #334155;
          --border-color: #475569;
        }

        /* Base Styles */
        .signup-container {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        /* Header */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1000;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
          box-shadow: var(--shadow-sm);
        }

        .dark-mode .header {
          background: rgba(15, 23, 42, 0.95);
        }

        .header-content {
          max-width: 100%;
          margin: 0 auto;
          padding: 1rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary-color);
        }

        .logo i {
          font-size: 1.5rem;
        }

        /* Split Layout */
        .split-layout {
          display: flex;
          height: 100vh;
          padding-top: 60px;
        }

        .left-section {
          flex: 6;
          background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--bg-tertiary) 100%);
          overflow-y: auto;
          position: relative;
        }

        .right-section {
          flex: 4;
          background: var(--bg-primary);
          border-left: 1px solid var(--border-color);
          overflow: hidden;
          position: relative;
          display: flex;
        }

        /* Left Section Styles */
        .section-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem;
          position: relative;
          z-index: 2;
        }

        /* Hero Header */
        .hero-header {
          margin-bottom: 3rem;
          text-align: center;
        }

        .badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 1.5rem;
        }

        .hero-title {
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .title-highlight {
          display: block;
          color: var(--primary-color);
          -webkit-text-fill-color: var(--primary-color);
        }

        .hero-description {
          font-size: 1.25rem;
          color: var(--text-secondary);
          line-height: 1.6;
          max-width: 800px;
          margin: 0 auto;
        }

        /* Features */
        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: var(--text-primary);
        }

        .section-title i {
          color: var(--primary-color);
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .feature-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          transition: all 0.3s ease;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-lg);
          border-color: var(--primary-color);
        }

        .feature-highlight {
          background: linear-gradient(135deg, rgba(37, 99, 235, 0.1), rgba(139, 92, 246, 0.1));
          border-color: rgba(37, 99, 235, 0.2);
        }

        .feature-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          color: white;
          font-size: 1.25rem;
        }

        .feature-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .feature-content p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          line-height: 1.5;
          margin: 0;
        }

        /* Registration Steps */
        .registration-steps {
          margin-bottom: 3rem;
        }

        .steps-container {
          display: flex;
          gap: 2rem;
          justify-content: center;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          flex: 1;
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 1.125rem;
          flex-shrink: 0;
        }

        .step-content h3 {
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .step-content p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Stats */
        .stats-section {
          margin-top: 3rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: 700;
          color: var(--primary-color);
          margin-bottom: 0.25rem;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        /* Decorative Elements */
        .decorative-elements {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          overflow: hidden;
          pointer-events: none;
          z-index: 1;
        }

        .floating-circle {
          position: absolute;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--primary-color), transparent);
          opacity: 0.1;
          animation: float 20s ease-in-out infinite;
        }

        .circle-1 {
          width: 400px;
          height: 400px;
          top: -200px;
          right: -200px;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 300px;
          height: 300px;
          bottom: -150px;
          left: -150px;
          animation-delay: 7s;
        }

        .circle-3 {
          width: 200px;
          height: 200px;
          top: 50%;
          left: 30%;
          animation-delay: 14s;
        }

        .grid-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            linear-gradient(var(--border-color) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-color) 1px, transparent 1px);
          background-size: 50px 50px;
          opacity: 0.05;
        }

        /* Right Section Styles - Formulaire en pleine hauteur */
        .full-height-form-container {
          width: 100%;
          height: 100%;
          padding: 2rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        /* CEDII Logo */
        .cedii-logo {
          text-align: center;
          margin-bottom: 2rem;
          flex-shrink: 0;
        }

        .logo-circle {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 0.75rem;
          color: white;
          font-size: 1.25rem;
          box-shadow: var(--shadow-lg);
        }

        .logo-text h2 {
          font-size: 1.5rem;
          font-weight: 800;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .logo-text p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Carte d'inscription en pleine hauteur */
        .full-height-signup-card {
          background: var(--bg-primary);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-xl);
          padding: 2rem;
          box-shadow: var(--shadow-lg);
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .card-header {
          text-align: center;
          margin-bottom: 2rem;
          flex-shrink: 0;
        }

        .card-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .card-header p {
          font-size: 0.875rem;
          color: var(--text-secondary);
          margin: 0;
        }

        /* Form Styles */
        .signup-form {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Messages */
        .success-message {
          background: rgba(16, 185, 129, 0.1);
          border: 1px solid rgba(16, 185, 129, 0.2);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--success-color);
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .success-message i {
          font-size: 1rem;
        }

        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--error-color);
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .error-message i {
          font-size: 1rem;
        }

        /* Form Groups */
        .form-group {
          flex-shrink: 0;
        }

        .form-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-label i {
          font-size: 0.875rem;
        }

        .input-container {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 2.5rem 0.75rem 1rem;
          font-size: 0.875rem;
          background: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: var(--radius-md);
          color: var(--text-primary);
          transition: all 0.3s ease;
        }

        .dark-mode .form-input {
          background: var(--bg-tertiary);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          color: var(--text-light);
          cursor: pointer;
          padding: 0.25rem;
          font-size: 0.875rem;
          transition: color 0.3s ease;
        }

        .password-toggle:hover {
          color: var(--primary-color);
        }

        /* Form Errors */
        .form-error {
          color: var(--error-color);
          font-size: 0.75rem;
          margin-top: 0.25rem;
          display: block;
        }

        /* Password Strength */
        .password-strength {
          margin-top: 0.5rem;
          flex-shrink: 0;
        }

        .strength-bar {
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 0.5rem;
        }

        .strength-fill {
          height: 100%;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .strength-0 { background: #ef4444; }
        .strength-1 { background: #f97316; }
        .strength-2 { background: #eab308; }
        .strength-3 { background: #22c55e; }
        .strength-4 { background: #16a34a; }

        .strength-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.625rem;
          color: var(--text-light);
        }

        .strength-labels span.active {
          color: var(--text-primary);
          font-weight: 600;
        }

        /* Signup Button */
        .signup-button {
          width: 100%;
          padding: 0.875rem;
          background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 0.875rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: auto;
          flex-shrink: 0;
        }

        .signup-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
          background: linear-gradient(135deg, var(--primary-hover), var(--primary-color));
        }

        .signup-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Divider */
        .divider {
          text-align: center;
          position: relative;
          margin: 1rem 0;
          font-size: 0.75rem;
          color: var(--text-light);
          flex-shrink: 0;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--border-color);
        }

        .divider span {
          background: var(--bg-primary);
          padding: 0 1rem;
          position: relative;
          z-index: 1;
        }

        /* Login Redirect */
        .signup-options {
          flex-shrink: 0;
        }

        .login-redirect {
          text-align: center;
          margin-bottom: 1rem;
        }

        .login-redirect p {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
        }

        .login-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--primary-color);
          font-size: 0.875rem;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .login-link:hover {
          color: var(--primary-hover);
        }

        /* Terms Section */
        .terms-section {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .terms-text {
          font-size: 0.625rem;
          color: var(--text-light);
          text-align: center;
          line-height: 1.5;
        }

        .terms-text a {
          color: var(--primary-color);
          text-decoration: none;
          margin: 0 0.25rem;
        }

        .terms-text a:hover {
          text-decoration: underline;
        }

        /* Signup Footer */
        .signup-footer {
          text-align: center;
          margin-top: auto;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
          flex-shrink: 0;
        }

        .footer-links {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }

        .footer-links a {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-light);
          font-size: 0.625rem;
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: color 0.3s ease;
        }

        .footer-links a:hover {
          color: var(--primary-color);
        }

        .copyright {
          font-size: 0.625rem;
          color: var(--text-light);
          margin: 0;
        }

        /* Animations */
        @keyframes float {
          0%, 100% {
            transform: translate(0, 0);
          }
          33% {
            transform: translate(30px, -30px);
          }
          66% {
            transform: translate(-20px, 20px);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .hero-title {
            font-size: 2.5rem;
          }
          
          .features-grid {
            grid-template-columns: 1fr;
          }
          
          .steps-container {
            flex-direction: column;
            gap: 1.5rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .split-layout {
            flex-direction: column;
            height: auto;
          }
          
          .left-section,
          .right-section {
            flex: none;
            width: 100%;
            height: auto;
          }
          
          .right-section {
            border-left: none;
            border-top: 1px solid var(--border-color);
            height: auto;
          }
          
          .full-height-form-container {
            max-width: 600px;
            margin: 0 auto;
          }
        }

        @media (max-width: 768px) {
          .section-content {
            padding: 2rem;
          }
          
          .hero-title {
            font-size: 2rem;
          }
          
          .hero-description {
            font-size: 1rem;
          }
          
          .full-height-form-container {
            padding: 1.5rem;
          }
          
          .footer-links {
            flex-direction: column;
            gap: 0.75rem;
          }
        }

        @media (max-width: 480px) {
          .header-content {
            padding: 0.75rem 1rem;
          }
          
          .section-content {
            padding: 1.5rem;
          }
          
          .hero-title {
            font-size: 1.75rem;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .full-height-signup-card {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

// Wrapper component pour fournir le contexte du thème
const SignUpWithTheme = () => (
  <ThemeProvider>
    <SignUp />
  </ThemeProvider>
);

export default SignUpWithTheme;