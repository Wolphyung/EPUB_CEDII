import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { ThemeProvider, ThemeToggle, useTheme } from '../components/journuit';

// Composant Login principal
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

      if (res.data.message === "Connexion réussie ✅") {
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
        setError("Réponse inattendue du serveur");
      }
    } catch (err) {
      if (err.response) {
        setError(err.response.data.message || "Erreur de connexion");
      } else if (err.request) {
        setError("Impossible de contacter le serveur");
      } else {
        setError("Une erreur est survenue");
      }
      console.error("Erreur de connexion:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`login-container ${isDarkMode ? 'dark-mode' : ''}`}>
      {/* Theme Toggle Button */}
      <ThemeToggle />
      
      {/* Background avec effets modernes */}
      <div className="background-wrapper">
        <div className="gradient-bg"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        {/* Éléments jour/nuit */}
        <div className={`celestial-body ${isDarkMode ? 'moon' : 'sun'}`}></div>
        
        {isDarkMode && (
          <div className="stars">
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
            <div className="star"></div>
          </div>
        )}
      </div>

      {/* Container Principal */}
      <div className="main-content">
        <div className="content-wrapper">
          {/* Section Terre à Gauche */}
          <div className="earth-section">
            <div className="earth-container">
              <div className="earth-scene">
                <div className="scene-title">
                  <h1>CEDII Messenger</h1>
                  <p>Connecter le monde institutionnel</p>
                </div>
                
                <div className="earth-orbit-container">
                  <div className="earth"></div>
                  <div className="orbit">
                    <div className="bird-container">
                      <div className="bird">
                        <div className="body"></div>
                        <div className="head">
                          <div className="eye">
                            <div className="pupil"></div>
                          </div>
                          <div className="beak"></div>
                        </div>
                        <div className="wing left"></div>
                        <div className="wing right"></div>
                        <div className="package">
                          <div className="package-content">CEDII</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="scene-info">
                  <h3>Plateforme d'Échange Mondiale</h3>
                  <p>Notre oiseau messager relie les institutions à travers le globe</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section Login à Droite */}
          <div className="login-section">
            <div className="login-card">
              {/* En-tête */}
              <div className="card-header">
                <div className="logo-section">
                  <div className="logo-icon">
                    <i className="fas fa-exchange-alt"></i>
                  </div>
                  <div className="logo-text">
                    <h1>CEDII</h1>
                    <p>Centre d'Échange et d'Information</p>
                  </div>
                </div>
              </div>

              {/* Corps du Formulaire */}
              <div className="card-body">
                <div className="welcome-section">
                  <h2>Bienvenue</h2>
                  <p>Connectez-vous à votre espace institutionnel</p>
                </div>

                <form onSubmit={handleLogin} className="login-form">
                  <div className="form-group">
                    <label htmlFor="email">
                      <i className="fas fa-envelope"></i>
                      Email Institutionnel
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="votre@institution.mg"
                        className="form-input"
                      />
                      <div className="input-focus"></div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">
                      <i className="fas fa-lock"></i>
                      Mot de passe
                    </label>
                    <div className="input-wrapper">
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                        placeholder="Votre mot de passe"
                        className="form-input"
                      />
                      <div className="input-focus"></div>
                    </div>
                  </div>

                  {error && (
                    <div className="error-message">
                      <i className="fas fa-exclamation-triangle"></i>
                      <div>
                        <strong>Erreur de connexion</strong>
                        <span>{error}</span>
                      </div>
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
                        Connexion en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-sign-in-alt"></i>
                        Se connecter
                      </>
                    )}
                  </button>
                </form>

                {/* Options supplémentaires */}
                <div className="login-options">
                  <div className="option-links">
                    <Link to="/forgot-password" className="option-link">
                      <i className="fas fa-key"></i>
                      Mot de passe oublié ?
                    </Link>
                    <Link to="/pubvisiteur" className="option-link visitor">
                      <i className="fas fa-globe"></i>
                      Accès visiteur
                    </Link>
                  </div>

                  <div className="divider">
                    <span>ou</span>
                  </div>

                  <Link to="/register" className="register-button">
                    <i className="fas fa-user-plus"></i>
                    Créer un compte institutionnel
                  </Link>
                </div>

                {/* Types d'utilisateurs */}
                <div className="user-types">
                  <h4>Types d'accès</h4>
                  <div className="types-grid">
                    <div className="type-card admin">
                      <i className="fas fa-crown"></i>
                      <span>Administrateur</span>
                      <small>Table: admins</small>
                    </div>
                    <div className="type-card member">
                      <i className="fas fa-building"></i>
                      <span>Membre</span>
                      <small>Table: membres</small>
                    </div>
                    <div className="type-card visitor">
                      <i className="fas fa-eye"></i>
                      <span>Visiteur</span>
                      <small>Table: users</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .login-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow: hidden;
          transition: all 0.3s ease;
        }

        /* Variables CSS pour les thèmes */
        :root {
          --bg-gradient: linear-gradient(135deg, #1a2980, #26d0ce);
          --card-bg: rgba(255, 255, 255, 0.95);
          --card-header-bg: linear-gradient(135deg, #1e293b, #374151);
          --text-primary: #1e293b;
          --text-secondary: #64748b;
          --text-light: rgba(255, 255, 255, 0.9);
          --input-bg: white;
          --input-border: #e5e7eb;
          --input-focus: #4f46e5;
          --error-bg: linear-gradient(135deg, #ef4444, #dc2626);
          --button-bg: linear-gradient(135deg, #4f46e5, #6366f1);
          --button-shadow: rgba(79, 70, 229, 0.3);
          --link-color: #64748b;
          --link-hover: #4f46e5;
          --visitor-color: #059669;
          --register-border: #4f46e5;
          --register-hover: #4f46e5;
          --type-card-bg: #f8fafc;
          --type-card-border: #e2e8f0;
          --shape-bg: rgba(255, 255, 255, 0.1);
          --scene-bg: rgba(255, 255, 255, 0.1);
          --divider-bg: #e2e8f0;
          --divider-text: #94a3b8;
        }

        .login-container.dark-mode {
          --bg-gradient: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
          --card-bg: rgba(30, 30, 60, 0.9);
          --card-header-bg: linear-gradient(135deg, #0f0c29, #302b63);
          --text-primary: #e2e8f0;
          --text-secondary: #94a3b8;
          --text-light: rgba(226, 232, 240, 0.9);
          --input-bg: rgba(30, 41, 59, 0.5);
          --input-border: #374151;
          --input-focus: #8b5cf6;
          --error-bg: linear-gradient(135deg, #b91c1c, #991b1b);
          --button-bg: linear-gradient(135deg, #6366f1, #8b5cf6);
          --button-shadow: rgba(139, 92, 246, 0.3);
          --link-color: #94a3b8;
          --link-hover: #8b5cf6;
          --visitor-color: #10b981;
          --register-border: #8b5cf6;
          --register-hover: #8b5cf6;
          --type-card-bg: rgba(30, 41, 59, 0.5);
          --type-card-border: #374151;
          --shape-bg: rgba(255, 255, 255, 0.05);
          --scene-bg: rgba(255, 255, 255, 0.1);
          --divider-bg: #374151;
          --divider-text: #64748b;
        }

        /* Appliquer les variables */
        .login-container {
          background: var(--bg-gradient);
        }

        /* Background Modern */
        .background-wrapper {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          z-index: 0;
        }

        .gradient-bg {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.7;
          background: var(--bg-gradient);
        }

        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }

        .shape {
          position: absolute;
          border-radius: 50%;
          animation: float 6s ease-in-out infinite;
          background: var(--shape-bg);
        }

        .shape-1 {
          width: 200px;
          height: 200px;
          top: 10%;
          left: 5%;
          animation-delay: 0s;
        }

        .shape-2 {
          width: 150px;
          height: 150px;
          top: 60%;
          right: 10%;
          animation-delay: 2s;
        }

        .shape-3 {
          width: 100px;
          height: 100px;
          bottom: 20%;
          left: 15%;
          animation-delay: 4s;
        }

        /* Éléments Jour/Nuit */
        .celestial-body {
          position: absolute;
          border-radius: 50%;
          transition: all 1.5s ease;
        }

        .sun {
          width: 80px;
          height: 80px;
          background: radial-gradient(circle at 30% 30%, #FFD700, #FF8C00);
          top: 50px;
          right: 80px;
          box-shadow: 0 0 60px #FFA500;
          opacity: 1;
        }

        .moon {
          width: 70px;
          height: 70px;
          background: radial-gradient(circle at 30% 30%, #F5F5F5, #C0C0C0);
          top: 60px;
          right: 90px;
          box-shadow: 0 0 40px #FFFFFF;
          opacity: 1;
        }

        .moon::before {
          content: "";
          position: absolute;
          width: 15px;
          height: 15px;
          background: #D3D3D3;
          border-radius: 50%;
          top: 15px;
          left: 25px;
          box-shadow: 
            20px 10px 0 -3px #D3D3D3,
            10px 30px 0 -5px #D3D3D3,
            35px 35px 0 -4px #D3D3D3;
        }

        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }

        .star {
          position: absolute;
          background: white;
          border-radius: 50%;
          animation: twinkle 4s infinite;
        }

        .star:nth-child(1) { top: 20%; left: 10%; width: 2px; height: 2px; animation-delay: 0s; }
        .star:nth-child(2) { top: 15%; left: 20%; width: 3px; height: 3px; animation-delay: 0.5s; }
        .star:nth-child(3) { top: 25%; left: 30%; width: 2px; height: 2px; animation-delay: 1s; }
        .star:nth-child(4) { top: 10%; left: 40%; width: 3px; height: 3px; animation-delay: 1.5s; }
        .star:nth-child(5) { top: 30%; left: 50%; width: 2px; height: 2px; animation-delay: 2s; }
        .star:nth-child(6) { top: 20%; left: 60%; width: 3px; height: 3px; animation-delay: 2.5s; }
        .star:nth-child(7) { top: 15%; left: 70%; width: 2px; height: 2px; animation-delay: 3s; }
        .star:nth-child(8) { top: 25%; left: 80%; width: 3px; height: 3px; animation-delay: 3.5s; }
        .star:nth-child(9) { top: 10%; left: 90%; width: 2px; height: 2px; animation-delay: 4s; }

        /* Contenu Principal */
        .main-content {
          position: relative;
          z-index: 3;
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
          padding: 2rem;
        }

        .content-wrapper {
          display: grid;
          grid-template-columns: 1fr 440px;
          gap: 3rem;
          align-items: center;
        }

        /* Section Terre à Gauche */
        .earth-section {
          position: relative;
          z-index: 4;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .earth-container {
          width: 100%;
          max-width: 600px;
        }

        .earth-scene {
          background: var(--scene-bg);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          text-align: center;
        }

        .scene-title {
          margin-bottom: 2rem;
        }

        .scene-title h1 {
          color: white;
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);
        }

        .scene-title p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 1.1rem;
          margin: 0;
        }

        .earth-orbit-container {
          position: relative;
          width: 400px;
          height: 400px;
          margin: 0 auto;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .earth {
          position: relative;
          width: 250px;
          height: 250px;
          background: linear-gradient(135deg, #1e5799, #207cca, #2989d8, #7db9e8);
          border-radius: 50%;
          box-shadow: 
            0 0 50px rgba(0, 100, 200, 0.8),
            inset 0 0 100px rgba(255, 255, 255, 0.2);
          overflow: hidden;
        }

        .earth::before {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 30% 30%, #4a8c31 5%, transparent 10%),
            radial-gradient(circle at 70% 20%, #4a8c31 8%, transparent 13%),
            radial-gradient(circle at 20% 70%, #4a8c31 7%, transparent 12%),
            radial-gradient(circle at 80% 70%, #4a8c31 10%, transparent 15%),
            radial-gradient(circle at 40% 50%, #3a7c21 15%, transparent 20%);
          border-radius: 50%;
        }

        .earth::after {
          content: "";
          position: absolute;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(circle at 60% 40%, #a67c52 5%, transparent 10%),
            radial-gradient(circle at 30% 60%, #a67c52 8%, transparent 13%);
          border-radius: 50%;
        }

        .orbit {
          position: absolute;
          width: 350px;
          height: 350px;
          border-radius: 50%;
          animation: rotate 20s linear infinite;
        }

        .bird-container {
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 80px;
          height: 80px;
        }

        .bird {
          position: relative;
          width: 100%;
          height: 100%;
          transform: rotate(90deg);
        }

        .body {
          position: absolute;
          width: 40px;
          height: 20px;
          background: linear-gradient(135deg, #8B4513, #A0522D);
          border-radius: 50% 40% 40% 50%;
          top: 30px;
          left: 20px;
          z-index: 3;
        }

        .head {
          position: absolute;
          width: 18px;
          height: 18px;
          background: #8B4513;
          border-radius: 50%;
          top: 25px;
          left: 8px;
          z-index: 4;
        }

        .eye {
          position: absolute;
          width: 6px;
          height: 6px;
          background-color: white;
          border-radius: 50%;
          top: 5px;
          left: 5px;
        }

        .pupil {
          position: absolute;
          width: 3px;
          height: 3px;
          background-color: black;
          border-radius: 50%;
          top: 1.5px;
          left: 1.5px;
        }

        .beak {
          position: absolute;
          width: 0;
          height: 0;
          border-left: 6px solid #FFD700;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
          top: 7px;
          left: -4px;
        }

        .wing {
          position: absolute;
          width: 35px;
          height: 18px;
          background: linear-gradient(135deg, #A0522D, #8B4513);
          border-radius: 50% 50% 0 50%;
          top: 25px;
          left: 25px;
          transform-origin: top left;
          z-index: 2;
        }

        .wing.left {
          animation: flap 0.5s ease-in-out infinite alternate;
        }

        .wing.right {
          top: 32px;
          left: 20px;
          border-radius: 50% 50% 50% 0;
          transform-origin: top right;
          animation: flap 0.5s ease-in-out infinite alternate-reverse;
        }

        .package {
          position: absolute;
          width: 25px;
          height: 18px;
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          top: 35px;
          left: 45px;
          z-index: 1;
          border-radius: 3px;
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .package-content {
          color: white;
          font-size: 8px;
          font-weight: 700;
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
        }

        .scene-info {
          margin-top: 2rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 1.5rem;
          border-radius: 12px;
          backdrop-filter: blur(10px);
        }

        .scene-info h3 {
          color: white;
          font-size: 1.3rem;
          margin-bottom: 0.5rem;
        }

        .scene-info p {
          color: rgba(255, 255, 255, 0.8);
          margin: 0;
          font-size: 1rem;
        }

        /* Section Login */
        .login-section {
          position: relative;
          z-index: 4;
        }

        /* Styles de la carte */
        .login-card {
          border-radius: 24px;
          padding: 0;
          width: 100%;
          max-width: 440px;
          box-shadow: 
            0 20px 60px rgba(0, 0, 0, 0.2),
            0 0 0 1px rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          overflow: hidden;
          backdrop-filter: blur(20px);
          background: var(--card-bg);
          transition: all 0.3s ease;
        }

        /* En-tête de carte */
        .card-header {
          padding: 2.5rem 2rem;
          text-align: center;
          background: var(--card-header-bg);
          transition: all 0.3s ease;
        }

        .logo-section {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
        }

        .logo-icon {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 8px 20px rgba(79, 70, 229, 0.3);
          background: linear-gradient(135deg, #4f46e5, #6366f1);
        }

        .logo-icon i {
          font-size: 1.5rem;
          color: white;
        }

        .logo-text h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
          color: white;
        }

        .logo-text p {
          margin: 0;
          font-size: 0.9rem;
          color: rgba(255, 255, 255, 0.8);
        }

        /* Corps de la carte */
        .card-body {
          padding: 2.5rem;
        }

        /* Styles de texte */
        .welcome-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .welcome-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .welcome-section p {
          margin: 0;
          color: var(--text-secondary);
        }

        /* Formulaires */
        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-primary);
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        label i {
          width: 16px;
          color: var(--input-focus);
        }

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          border: 2px solid var(--input-border);
          background: var(--input-bg);
          color: var(--text-primary);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--input-focus);
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .form-input::placeholder {
          color: var(--text-secondary);
        }

        .input-focus {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: 12px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          box-shadow: 0 0 0 2px var(--input-focus);
        }

        .form-input:focus ~ .input-focus {
          opacity: 1;
        }

        /* Messages d'erreur */
        .error-message {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          animation: slideIn 0.3s ease;
          background: var(--error-bg);
          color: white;
        }

        .error-message i {
          font-size: 1.1rem;
          margin-top: 0.1rem;
        }

        .error-message div {
          flex: 1;
        }

        .error-message strong {
          display: block;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .error-message span {
          font-size: 0.85rem;
          opacity: 0.9;
        }

        /* Boutons */
        .login-button {
          width: 100%;
          padding: 1rem 2rem;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          transition: all 0.3s ease;
          cursor: pointer;
          margin-bottom: 1.5rem;
          background: var(--button-bg);
          color: white;
          box-shadow: 0 8px 25px var(--button-shadow);
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px var(--button-shadow);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .button-spinner {
          width: 18px;
          height: 18px;
          border: 2px solid transparent;
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Options de connexion */
        .login-options {
          margin-bottom: 2rem;
        }

        .option-links {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1.5rem;
        }

        .option-link {
          text-decoration: none;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          color: var(--link-color);
        }

        .option-link:hover {
          color: var(--link-hover);
        }

        .option-link.visitor {
          color: var(--visitor-color);
        }

        .option-link.visitor:hover {
          color: var(--visitor-color);
          opacity: 0.8;
        }

        .divider {
          text-align: center;
          position: relative;
          margin: 1.5rem 0;
          font-size: 0.85rem;
        }

        .divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--divider-bg);
          z-index: 1;
        }

        .divider span {
          background: var(--card-bg);
          padding: 0 1rem;
          position: relative;
          z-index: 2;
          color: var(--divider-text);
        }

        .register-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.875rem 2rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.3s ease;
          background: transparent;
          color: var(--register-border);
          border: 2px solid var(--register-border);
        }

        .register-button:hover {
          background: var(--register-hover);
          color: white;
          transform: translateY(-1px);
        }

        /* Types d'utilisateurs */
        .user-types {
          border-top: 1px solid var(--divider-bg);
          padding-top: 1.5rem;
        }

        .user-types h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-align: center;
          color: var(--text-primary);
        }

        .types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
        }

        .type-card {
          padding: 0.75rem;
          border-radius: 8px;
          text-align: center;
          transition: all 0.3s ease;
          background: var(--type-card-bg);
          border: 1px solid var(--type-card-border);
        }

        .type-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .type-card i {
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
          display: block;
        }

        .type-card.admin i { color: #f59e0b; }
        .type-card.member i { color: #4f46e5; }
        .type-card.visitor i { color: #059669; }

        .type-card span {
          display: block;
          font-size: 0.8rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
          color: var(--text-primary);
        }

        .type-card small {
          font-size: 0.7rem;
          color: var(--text-secondary);
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }

        @keyframes rotate {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes flap {
          0% {
            transform: rotate(-10deg);
          }
          100% {
            transform: rotate(20deg);
          }
        }

        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-10px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        /* Responsive */
        @media (max-width: 1200px) {
          .content-wrapper {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .earth-section {
            order: 2;
          }
          
          .login-section {
            order: 1;
          }
          
          .earth-container {
            max-width: 100%;
          }
        }

        @media (max-width: 768px) {
          .main-content {
            padding: 1rem;
          }
          
          .earth-orbit-container {
            width: 300px;
            height: 300px;
          }
          
          .earth {
            width: 180px;
            height: 180px;
          }
          
          .orbit {
            width: 260px;
            height: 260px;
          }
          
          .scene-title h1 {
            font-size: 1.8rem;
          }
          
          .card-body {
            padding: 2rem 1.5rem;
          }
          
          .option-links {
            flex-direction: column;
            gap: 1rem;
            align-items: center;
          }
          
          .types-grid {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .earth-orbit-container {
            width: 250px;
            height: 250px;
          }
          
          .earth {
            width: 150px;
            height: 150px;
          }
          
          .orbit {
            width: 220px;
            height: 220px;
          }
          
          .scene-title h1 {
            font-size: 1.5rem;
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