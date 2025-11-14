import React, { useState } from "react";
import { Form, Button, Card, Alert, InputGroup, Spinner } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

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
  const [isNightMode, setIsNightMode] = useState(false);

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
    <div className={`signup-container ${isNightMode ? 'night-mode' : 'day-mode'}`}>
      {/* Background avec effets modernes */}
      <div className="background-wrapper">
        <div className="gradient-bg"></div>
        <div className="floating-shapes">
          <div className="shape shape-1"></div>
          <div className="shape shape-2"></div>
          <div className="shape shape-3"></div>
        </div>
        
        {/* Éléments jour/nuit */}
        <div className="sun"></div>
        <div className="moon"></div>
        
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
                  <p>Rejoignez notre réseau institutionnel</p>
                </div>
                
                <div className="controls">
                  <button 
                    className={`mode-btn ${!isNightMode ? 'active' : ''}`}
                    onClick={() => setIsNightMode(false)}
                  >
                    <i className="fas fa-sun"></i> Jour
                  </button>
                  <button 
                    className={`mode-btn ${isNightMode ? 'active' : ''}`}
                    onClick={() => setIsNightMode(true)}
                  >
                    <i className="fas fa-moon"></i> Nuit
                  </button>
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
                  <h3>Rejoignez Notre Réseau</h3>
                  <p>Notre oiseau messager vous accueille dans la communauté mondiale</p>
                </div>
              </div>
            </div>
          </div>

          {/* Section SignUp à Droite */}
          <div className="signup-section">
            <div className={`signup-card ${isNightMode ? 'night-card' : 'day-card'}`}>
              {/* En-tête */}
              <div className={`card-header ${isNightMode ? 'night-header' : 'day-header'}`}>
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
                  <h2 className={isNightMode ? 'night-text' : 'day-text'}>Créer un compte</h2>
                  <p className={isNightMode ? 'night-subtext' : 'day-subtext'}>Rejoignez notre plateforme institutionnelle</p>
                </div>

                {success && (
                  <div className={`success-message ${isNightMode ? 'night-success' : 'day-success'}`}>
                    <i className="fas fa-check-circle"></i>
                    {success}
                  </div>
                )}

                {apiError && (
                  <div className={`error-message ${isNightMode ? 'night-error' : 'day-error'}`}>
                    <i className="fas fa-exclamation-triangle"></i>
                    <div>
                      <strong>Erreur d'inscription</strong>
                      <span>{apiError}</span>
                    </div>
                  </div>
                )}

                <Form onSubmit={handleSubmit} className="signup-form">
                  <Form.Group className="form-group">
                    <label htmlFor="name" className={isNightMode ? 'night-label' : 'day-label'}>
                      <i className="fas fa-user"></i>
                      Nom complet
                    </label>
                    <div className="input-wrapper">
                      <Form.Control
                        id="name"
                        type="text"
                        name="name"
                        placeholder="Votre nom complet"
                        value={formData.name}
                        onChange={handleChange}
                        isInvalid={!!errors.name}
                        disabled={loading}
                        className={`form-input ${isNightMode ? 'night-input' : 'day-input'}`}
                      />
                      <div className={`input-focus ${isNightMode ? 'night-focus' : 'day-focus'}`}></div>
                    </div>
                    {errors.name && <div className="form-error">{errors.name}</div>}
                  </Form.Group>

                  <Form.Group className="form-group">
                    <label htmlFor="email" className={isNightMode ? 'night-label' : 'day-label'}>
                      <i className="fas fa-envelope"></i>
                      Email Institutionnel
                    </label>
                    <div className="input-wrapper">
                      <Form.Control
                        id="email"
                        type="email"
                        name="email"
                        placeholder="votre@institution.mg"
                        value={formData.email}
                        onChange={handleChange}
                        isInvalid={!!errors.email}
                        disabled={loading}
                        className={`form-input ${isNightMode ? 'night-input' : 'day-input'}`}
                      />
                      <div className={`input-focus ${isNightMode ? 'night-focus' : 'day-focus'}`}></div>
                    </div>
                    {errors.email && <div className="form-error">{errors.email}</div>}
                  </Form.Group>

                  <Form.Group className="form-group">
                    <label htmlFor="password" className={isNightMode ? 'night-label' : 'day-label'}>
                      <i className="fas fa-lock"></i>
                      Mot de passe
                    </label>
                    <div className="input-wrapper">
                      <InputGroup>
                        <Form.Control
                          id="password"
                          type={showPw ? "text" : "password"}
                          name="password"
                          placeholder="Votre mot de passe"
                          value={formData.password}
                          onChange={handleChange}
                          isInvalid={!!errors.password}
                          disabled={loading}
                          className={`form-input ${isNightMode ? 'night-input' : 'day-input'}`}
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={toggleShowPw}
                          disabled={loading}
                          className="password-toggle"
                        >
                          {showPw ? "🙈" : "👁"}
                        </Button>
                      </InputGroup>
                      <div className={`input-focus ${isNightMode ? 'night-focus' : 'day-focus'}`}></div>
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
                      <small className={isNightMode ? 'night-subtext' : 'day-subtext'}>
                        {strength === 0 && "Faible"}
                        {strength === 1 && "Très faible"}
                        {strength === 2 && "Moyen"}
                        {strength === 3 && "Fort"}
                        {strength === 4 && "Très fort"}
                      </small>
                    </div>
                  </Form.Group>

                  <Form.Group className="form-group">
                    <label htmlFor="confirmPassword" className={isNightMode ? 'night-label' : 'day-label'}>
                      <i className="fas fa-lock"></i>
                      Confirmer le mot de passe
                    </label>
                    <div className="input-wrapper">
                      <InputGroup>
                        <Form.Control
                          id="confirmPassword"
                          type={showConfirmPw ? "text" : "password"}
                          name="confirmPassword"
                          placeholder="Confirmer le mot de passe"
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          isInvalid={!!errors.confirmPassword}
                          disabled={loading}
                          className={`form-input ${isNightMode ? 'night-input' : 'day-input'}`}
                        />
                        <Button 
                          variant="outline-secondary" 
                          onClick={toggleShowConfirmPw}
                          disabled={loading}
                          className="password-toggle"
                        >
                          {showConfirmPw ? "🙈" : "👁"}
                        </Button>
                      </InputGroup>
                      <div className={`input-focus ${isNightMode ? 'night-focus' : 'day-focus'}`}></div>
                    </div>
                    {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                  </Form.Group>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className={`signup-button ${isNightMode ? 'night-button' : 'day-button'}`}
                  >
                    {loading ? (
                      <>
                        <div className="button-spinner"></div>
                        Inscription en cours...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus"></i>
                        S'inscrire
                      </>
                    )}
                  </Button>
                </Form>

                {/* Options supplémentaires */}
                <div className="signup-options">
                  <div className={`divider ${isNightMode ? 'night-divider' : 'day-divider'}`}>
                    <span className={isNightMode ? 'night-divider-text' : 'day-divider-text'}>ou</span>
                  </div>

                  <div className="option-links">
                    <Link to="/login" className={`option-link ${isNightMode ? 'night-link' : 'day-link'}`}>
                      <i className="fas fa-sign-in-alt"></i>
                      Déjà un compte ? Se connecter
                    </Link>
                    <Link to="/login" className={`option-link visitor ${isNightMode ? 'night-visitor' : 'day-visitor'}`}>
                      <i className="fas fa-globe"></i>
                      Accès visiteur
                    </Link>
                  </div>
                </div>

                {/* Types d'utilisateurs */}
                <div className="user-types">
                  <h4 className={isNightMode ? 'night-text' : 'day-text'}>Types de comptes</h4>
                  <div className="types-grid">
                    <div className={`type-card admin ${isNightMode ? 'night-type-card' : 'day-type-card'}`}>
                      <i className="fas fa-crown"></i>
                      <span>Administrateur</span>
                      <small>Gestion complète</small>
                    </div>
                    <div className={`type-card member ${isNightMode ? 'night-type-card' : 'day-type-card'}`}>
                      <i className="fas fa-building"></i>
                      <span>Membre</span>
                      <small>Accès institutionnel</small>
                    </div>
                    <div className={`type-card visitor ${isNightMode ? 'night-type-card' : 'day-type-card'}`}>
                      <i className="fas fa-eye"></i>
                      <span>Visiteur</span>
                      <small>Consultation limitée</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .signup-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          position: relative;
          overflow: hidden;
          transition: background 1.5s ease;
        }

        /* Modes Jour/Nuit */
        .signup-container.day-mode {
          background: linear-gradient(135deg, #1a2980, #26d0ce);
        }

        .signup-container.night-mode {
          background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
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
        }

        .day-mode .gradient-bg {
          background: linear-gradient(135deg, 
            rgba(26, 41, 128, 0.8) 0%, 
            rgba(38, 208, 206, 0.7) 100%);
        }

        .night-mode .gradient-bg {
          background: linear-gradient(135deg, 
            rgba(15, 12, 41, 0.9) 0%, 
            rgba(48, 43, 99, 0.8) 50%, 
            rgba(36, 36, 62, 0.7) 100%);
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

        .day-mode .shape {
          background: rgba(255, 255, 255, 0.1);
        }

        .night-mode .shape {
          background: rgba(255, 255, 255, 0.05);
        }

        /* Éléments Jour/Nuit */
        .sun, .moon {
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
        }

        .moon {
          width: 70px;
          height: 70px;
          background: radial-gradient(circle at 30% 30%, #F5F5F5, #C0C0C0);
          top: 60px;
          right: 90px;
          box-shadow: 0 0 40px #FFFFFF;
          opacity: 0;
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

        .night-mode .sun {
          opacity: 0;
          transform: scale(0.5);
        }

        .night-mode .moon {
          opacity: 1;
        }

        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          transition: opacity 1.5s ease;
        }

        .night-mode .stars {
          opacity: 1;
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
          background: rgba(255, 255, 255, 0.1);
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

        .controls {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-bottom: 2rem;
        }

        .mode-btn {
          padding: 0.75rem 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          backdrop-filter: blur(5px);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .mode-btn:hover {
          background: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }

        .mode-btn.active {
          background: rgba(255, 255, 255, 0.4);
          box-shadow: 0 4px 15px rgba(255, 255, 255, 0.2);
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

        /* Section SignUp */
        .signup-section {
          position: relative;
          z-index: 4;
        }

        /* Styles de la carte selon le mode */
        .signup-card {
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
          transition: all 1.5s ease;
        }

        .day-card {
          background: rgba(255, 255, 255, 0.95);
        }

        .night-card {
          background: rgba(30, 30, 60, 0.9);
        }

        /* En-tête de carte */
        .card-header {
          padding: 2.5rem 2rem;
          text-align: center;
          transition: all 1.5s ease;
        }

        .day-header {
          background: linear-gradient(135deg, #1e293b, #374151);
        }

        .night-header {
          background: linear-gradient(135deg, #0f0c29, #302b63);
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
        }

        .day-card .logo-icon {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
        }

        .night-card .logo-icon {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
        }

        .logo-icon i {
          font-size: 1.5rem;
          color: white;
        }

        .logo-text h1 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0;
        }

        .day-card .logo-text h1 {
          color: white;
        }

        .night-card .logo-text h1 {
          color: #e2e8f0;
        }

        .logo-text p {
          margin: 0;
          font-size: 0.9rem;
        }

        .day-card .logo-text p {
          color: rgba(255, 255, 255, 0.8);
        }

        .night-card .logo-text p {
          color: rgba(226, 232, 240, 0.8);
        }

        /* Corps de la carte */
        .card-body {
          padding: 2.5rem;
        }

        /* Styles de texte selon le mode */
        .day-text {
          color: #1e293b;
        }

        .night-text {
          color: #e2e8f0;
        }

        .day-subtext {
          color: #64748b;
        }

        .night-subtext {
          color: #94a3b8;
        }

        .welcome-section {
          text-align: center;
          margin-bottom: 2rem;
        }

        .welcome-section h2 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .welcome-section p {
          margin: 0;
        }

        /* Messages */
        .success-message {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          animation: slideIn 0.3s ease;
        }

        .day-success {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }

        .night-success {
          background: linear-gradient(135deg, #059669, #047857);
          color: #d1fae5;
        }

        .error-message {
          padding: 1rem 1.25rem;
          border-radius: 12px;
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
          animation: slideIn 0.3s ease;
        }

        .day-error {
          background: linear-gradient(135deg, #ef4444, #dc2626);
          color: white;
        }

        .night-error {
          background: linear-gradient(135deg, #b91c1c, #991b1b);
          color: #fecaca;
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

        /* Formulaires */
        .form-group {
          margin-bottom: 1.5rem;
        }

        .day-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #374151;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .night-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #e2e8f0;
          font-weight: 500;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
        }

        .form-group label i {
          width: 16px;
        }

        .day-label i {
          color: #4f46e5;
        }

        .night-label i {
          color: #8b5cf6;
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
          border: 2px solid;
        }

        .day-input {
          border-color: #e5e7eb;
          background: white;
          color: #1e293b;
        }

        .day-input:focus {
          outline: none;
          border-color: #4f46e5;
          box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1);
        }

        .night-input {
          border-color: #374151;
          background: rgba(30, 41, 59, 0.5);
          color: #e2e8f0;
        }

        .night-input:focus {
          outline: none;
          border-color: #8b5cf6;
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .night-input::placeholder {
          color: #64748b;
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
        }

        .day-focus {
          box-shadow: 0 0 0 2px #4f46e5;
        }

        .night-focus {
          box-shadow: 0 0 0 2px #8b5cf6;
        }

        .form-input:focus ~ .input-focus {
          opacity: 1;
        }

        .form-error {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 0.5rem;
        }

        .password-toggle {
          border: 2px solid #e5e7eb;
          background: white;
          color: #374151;
        }

        .night-card .password-toggle {
          border-color: #374151;
          background: rgba(30, 41, 59, 0.5);
          color: #e2e8f0;
        }

        /* Indicateur de force du mot de passe */
        .password-strength {
          margin-top: 0.5rem;
        }

        .strength-bar {
          height: 6px;
          background: #e5e7eb;
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .night-card .strength-bar {
          background: #374151;
        }

        .strength-fill {
          height: 100%;
          border-radius: 3px;
          transition: all 0.3s ease;
        }

        .strength-0 { background: #ef4444; }
        .strength-1 { background: #f97316; }
        .strength-2 { background: #eab308; }
        .strength-3 { background: #22c55e; }
        .strength-4 { background: #16a34a; }

        /* Boutons */
        .signup-button {
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
        }

        .day-button {
          background: linear-gradient(135deg, #4f46e5, #6366f1);
          color: white;
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
        }

        .day-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(79, 70, 229, 0.4);
        }

        .night-button {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          box-shadow: 0 8px 25px rgba(139, 92, 246, 0.3);
        }

        .night-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(139, 92, 246, 0.4);
        }

        .signup-button:disabled {
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

        /* Options d'inscription */
        .signup-options {
          margin-bottom: 2rem;
        }

        .divider {
          text-align: center;
          position: relative;
          margin: 1.5rem 0;
          font-size: 0.85rem;
        }

        .day-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #e2e8f0;
          z-index: 1;
        }

        .night-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: #374151;
          z-index: 1;
        }

        .day-divider-text {
          background: white;
          padding: 0 1rem;
          position: relative;
          z-index: 2;
          color: #94a3b8;
        }

        .night-divider-text {
          background: rgba(30, 30, 60, 0.9);
          padding: 0 1rem;
          position: relative;
          z-index: 2;
          color: #64748b;
        }

        .option-links {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          align-items: center;
        }

        .option-link {
          text-decoration: none;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .day-link {
          color: #64748b;
        }

        .day-link:hover {
          color: #4f46e5;
        }

        .night-link {
          color: #94a3b8;
        }

        .night-link:hover {
          color: #8b5cf6;
        }

        .day-visitor {
          color: #059669;
        }

        .day-visitor:hover {
          color: #047857;
        }

        .night-visitor {
          color: #10b981;
        }

        .night-visitor:hover {
          color: #34d399;
        }

        /* Types d'utilisateurs */
        .user-types {
          border-top: 1px solid #f1f5f9;
          padding-top: 1.5rem;
        }

        .day-card .user-types {
          border-top-color: #f1f5f9;
        }

        .night-card .user-types {
          border-top-color: #374151;
        }

        .user-types h4 {
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-align: center;
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
        }

        .day-type-card {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }

        .day-type-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .night-type-card {
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid #374151;
        }

        .night-type-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
        }

        .day-type-card span {
          color: #374151;
        }

        .night-type-card span {
          color: #e2e8f0;
        }

        .type-card small {
          font-size: 0.7rem;
        }

        .day-type-card small {
          color: #64748b;
        }

        .night-type-card small {
          color: #94a3b8;
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
          
          .signup-section {
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

export default SignUp;