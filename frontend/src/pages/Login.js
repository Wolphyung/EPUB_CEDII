import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ThemeProvider, ThemeToggle, useTheme } from '../components/journuit';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './../components/LanguageSwitcher';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      if (res.data.message === t('login.success_message')) {
        const user = res.data.user;
        localStorage.setItem("user", JSON.stringify(user));
        
        if (res.data.token) {
          localStorage.setItem("token", res.data.token);
        }

        if (res.data.redirect_to) {
          navigate(res.data.redirect_to);
        } else if (user.type === "admin") {
          navigate("/dashadmin");
        } else if (user.type === "membre") {
          navigate("/dashMembre");
        } else if (user.type === "visiteur") {
          navigate("/dashvisiteur");
        } else {
          navigate("/dashboard");
        }
      } else {
        setError(t('login.unexpected_response'));
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || t('login.connection_error'));
      } else if (err.request) {
        setError(t('login.server_connection_error'));
      } else {
        setError(t('login.unexpected_error'));
      }
      console.error("Erreur de connexion:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (type) => {
    switch(type) {
      case 'admin':
        setEmail("admin@cedii.mg");
        setPassword("demo123");
        break;
      case 'membre':
        setEmail("membre@institution.mg");
        setPassword("demo123");
        break;
      case 'visiteur':
        setEmail("visiteur@demo.mg");
        setPassword("demo123");
        break;
    }
  };

  return (
    <div className={`login-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Header avec Theme Toggle et Language Switcher */}
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-text">
              <img src="/images/logo.jpg" alt="Logo" className="logo-img" />
            </span>
            <span>CEDII Messenger</span>
          </div>
          <div className="header-actions">
            <div className="language-switcher-header">
              <LanguageSwitcher />
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="split-layout">
        {/* Section Gauche - 70% */}
        <div className="left-section">
          <div className="section-content">
            {/* En-tête Hero */}
            <div className="hero-header">
              <div className="badge">
                <i className="fas fa-sign-in-alt"></i>
                <span>{t('login.secure_access')}</span>
              </div>
              <h1 className="hero-title">
                {t('login.welcome_to')}
                <span className="title-highlight">CEDII Messenger</span>
              </h1>
              <p className="hero-description">
                {t('login.hero_description')}
              </p>
            </div>

            {/* Caractéristiques principales */}
            <div className="features-showcase">
              <h2 className="section-title">
                <i className="fas fa-star"></i>
                {t('login.why_login_title')}
              </h2>
              
              <div className="features-grid">
                <div className="feature-card feature-highlight">
                  <div className="feature-icon">
                    <i className="fas fa-bolt"></i>
                  </div>
                  <div className="feature-content">
                    <h3>{t('login.feature_instant_title')}</h3>
                    <p>{t('login.feature_instant_desc')}</p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-shield-alt"></i>
                  </div>
                  <div className="feature-content">
                    <h3>{t('login.feature_security_title')}</h3>
                    <p>{t('login.feature_security_desc')}</p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  <div className="feature-content">
                    <h3>{t('login.feature_collaboration_title')}</h3>
                    <p>{t('login.feature_collaboration_desc')}</p>
                  </div>
                </div>
                
                <div className="feature-card">
                  <div className="feature-icon">
                    <i className="fas fa-chart-line"></i>
                  </div>
                  <div className="feature-content">
                    <h3>{t('login.feature_analytics_title')}</h3>
                    <p>{t('login.feature_analytics_desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Statistiques */}
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <div className="stat-label">{t('login.stats_institutions')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">99.9%</div>
                  <div className="stat-label">{t('login.stats_availability')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">24/7</div>
                  <div className="stat-label">{t('login.stats_support')}</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">≤ 10s</div>
                  <div className="stat-label">{t('login.stats_login')}</div>
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
              <span className="logo-text">
                <img src="/images/logo.jpg" alt="Logo" className="logo-img" />
              </span>
              <div className="logo-text">
                <h2>CEDII</h2>
                <p>Centre d'Échange, de Documentation et d'Information Interinstitutionnels</p>
              </div>
            </div>

            {/* Carte de connexion en pleine hauteur */}
            <div className="full-height-login-card">
              <div className="card-header">
                <h3>{t('login.login_title')}</h3>
                <p>{t('login.login_subtitle')}</p>
              </div>

              <form onSubmit={handleLogin} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    <i className="fas fa-envelope"></i>
                    {t('login.institutional_email')}
                  </label>
                  <div className="input-container">
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="nom@institution.mg"
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    <i className="fas fa-lock"></i>
                    {t('login.password')}
                  </label>
                  <div className="input-container">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                      placeholder="••••••••"
                      className="form-input"
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      tabIndex="-1"
                    >
                      <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <div className="remember-me">
                    <input type="checkbox" id="remember" />
                    <label htmlFor="remember">{t('login.remember_me')}</label>
                  </div>
                  <Link to="/forgot-password" className="forgot-link">
                    <i className="fas fa-key"></i>
                    {t('login.forgot_password')}
                  </Link>
                </div>

                {error && (
                  <div className="error-message">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading}
                  className="login-button"
                >
                  {loading ? (
                    <>
                      <div className="button-spinner"></div>
                      <span>{t('login.logging_in')}</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt"></i>
                      <span>{t('login.sign_in')}</span>
                    </>
                  )}
                </button>
              </form>

              <div className="divider">
                <span>{t('login.or')}</span>
              </div>

              {/* Quick Access */}
              <div className="login-options">
                <div className="quick-access">
                  <div className="access-title">{t('login.quick_access_title')}</div>
                  <div className="access-buttons">
                    <button 
                      onClick={() => handleQuickLogin('admin')}
                      className="access-btn admin"
                    >
                      <i className="fas fa-user-shield"></i>
                      {t('login.admin_access')}
                    </button>
                    <button 
                      onClick={() => handleQuickLogin('membre')}
                      className="access-btn member"
                    >
                      <i className="fas fa-user-tie"></i>
                      {t('login.member_access')}
                    </button>
                    <button 
                      onClick={() => handleQuickLogin('visiteur')}
                      className="access-btn visitor"
                    >
                      <i className="fas fa-user"></i>
                      {t('login.visitor_access')}
                    </button>
                  </div>
                </div>
              </div>

              {/* Redirection vers inscription */}
              <div className="register-section">
                <p className="register-text">
                  {t('login.new_institution')} <strong>{t('login.create_free_account')}</strong>
                </p>
                <Link to="/register" className="register-button">
                  <i className="fas fa-user-plus"></i>
                  <span>{t('login.register_now')}</span>
                </Link>
              </div>

              {/* Conditions d'utilisation */}
              <div className="terms-section">
                <p className="terms-text">
                  {t('login.terms_text')}
                  <Link to="/terms">{t('login.terms_of_use')}</Link> {t('login.and')}
                  <Link to="/privacy">{t('login.privacy_policy')}</Link>.
                </p>
              </div>

              {/* Footer */}
              <div className="login-footer">
                <div className="footer-links">
                  <Link to="/privacy">
                    <i className="fas fa-shield-alt"></i>
                    {t('login.privacy')}
                  </Link>
                  <Link to="/terms">
                    <i className="fas fa-file-contract"></i>
                    {t('login.terms')}
                  </Link>
                  <Link to="/support">
                    <i className="fas fa-headset"></i>
                    {t('login.support')}
                  </Link>
                </div>
                <p className="copyright">
                  © {new Date().getFullYear()} {t('login.copyright')}
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
        .login-container {
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

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .language-switcher-header {
          display: flex;
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

        /* Language Switcher in Form */
        .language-switcher-form {
          text-align: center;
          margin-bottom: 1.5rem;
          flex-shrink: 0;
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

        /* Carte de connexion en pleine hauteur */
        .full-height-login-card {
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
        .login-form {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
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

        /* Form Options */
        .form-options {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .remember-me {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-secondary);
          cursor: pointer;
        }

        .remember-me input {
          width: 16px;
          height: 16px;
          accent-color: var(--primary-color);
        }

        .forgot-link {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          color: var(--text-secondary);
          text-decoration: none;
          transition: color 0.3s ease;
        }

        .forgot-link:hover {
          color: var(--primary-color);
        }

        /* Error Message */
        .error-message {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          padding: 0.75rem 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--error-color);
          font-size: 0.75rem;
          flex-shrink: 0;
        }

        .error-message i {
          font-size: 0.875rem;
        }

        /* Login Button */
        .login-button {
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

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: var(--shadow-md);
          background: linear-gradient(135deg, var(--primary-hover), var(--primary-color));
        }

        .login-button:disabled {
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

        /* Quick Access */
        .login-options {
          flex-shrink: 0;
        }

        .quick-access {
          margin-bottom: 1rem;
        }

        .access-title {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-secondary);
          margin-bottom: 0.5rem;
          text-align: center;
        }

        .access-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .access-btn {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-sm);
          background: var(--bg-secondary);
          color: var(--text-secondary);
          font-size: 0.625rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .access-btn:hover {
          transform: translateY(-1px);
          box-shadow: var(--shadow-sm);
        }

        .access-btn.admin {
          border-color: rgba(245, 158, 11, 0.3);
          color: #f59e0b;
        }

        .access-btn.member {
          border-color: rgba(37, 99, 235, 0.3);
          color: var(--primary-color);
        }

        .access-btn.visitor {
          border-color: rgba(16, 185, 129, 0.3);
          color: var(--success-color);
        }

        /* Register Section */
        .register-section {
          text-align: center;
          margin-top: 1rem;
          flex-shrink: 0;
        }

        .register-text {
          font-size: 0.75rem;
          color: var(--text-secondary);
          margin-bottom: 0.75rem;
        }

        .register-text strong {
          color: var(--primary-color);
        }

        .register-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
          padding: 0.75rem;
          border: 2px solid var(--primary-color);
          border-radius: var(--radius-md);
          background: transparent;
          color: var(--primary-color);
          font-size: 0.75rem;
          font-weight: 600;
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .register-button:hover {
          background: var(--primary-color);
          color: white;
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

        /* Login Footer */
        .login-footer {
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
          
          .access-buttons {
            flex-direction: column;
          }
          
          .header-actions {
            gap: 0.5rem;
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
          
          .full-height-login-card {
            padding: 1.5rem;
          }
          
          .header-actions {
            flex-direction: column;
            align-items: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

// Wrapper component pour fournir le contexte du thème
const LoginWithTheme = () => (
  <ThemeProvider>
    <Login />
  </ThemeProvider>
);

export default LoginWithTheme;