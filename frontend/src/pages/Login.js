import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      console.log(res.data);

      if (res.data.message === "Connexion réussie ✅") {
        const user = res.data.user;
        localStorage.setItem("user", JSON.stringify(user));

        if (user.type === "admin") {
          navigate("/dashAdmin");
        } else {
          navigate("/dashMembre");
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
    <div 
      className="container-fluid min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      }}
    >
      <div 
        className="card shadow-lg border-0 rounded-3"
        style={{ 
          width: "100%", 
          maxWidth: "420px",
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(255, 255, 255, 0.95)"
        }}
      >
        <div className="card-body p-4 p-md-5">
          {/* En-tête avec icône */}
          <div className="text-center mb-4">
            <div 
              className="rounded-circle bg-primary d-inline-flex align-items-center justify-content-center mb-3"
              style={{ width: "60px", height: "60px" }}
            >
              <i className="fas fa-user-shield text-white fs-4"></i>
            </div>
            <h2 
              className="fw-bold mb-2"
              style={{ 
                color: "#2c3e50",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent"
              }}
            >
              Connexion
            </h2>
            <p className="text-muted">Accédez à votre espace personnel</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label fw-semibold" style={{ color: "#2c3e50" }}>
                <i className="fas fa-envelope me-2"></i>
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-control form-control-lg"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="votre@email.com"
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "12px 15px",
                  fontSize: "16px",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 0.2rem rgba(102, 126, 234, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            <div className="mb-4">
              <label htmlFor="password" className="form-label fw-semibold" style={{ color: "#2c3e50" }}>
                <i className="fas fa-lock me-2"></i>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                className="form-control form-control-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="Votre mot de passe"
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "12px 15px",
                  fontSize: "16px",
                  transition: "all 0.3s ease"
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#667eea";
                  e.target.style.boxShadow = "0 0 0 0.2rem rgba(102, 126, 234, 0.25)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#e0e0e0";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {error && (
              <div 
                className="alert alert-danger d-flex align-items-center"
                role="alert"
                style={{
                  borderRadius: "10px",
                  border: "none",
                  background: "linear-gradient(135deg, #ff6b6b, #ee5a52)"
                }}
              >
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            <button 
              className="btn btn-primary w-100 py-3 fw-semibold"
              type="submit"
              disabled={loading}
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                border: "none",
                borderRadius: "10px",
                fontSize: "16px",
                transition: "all 0.3s ease",
                position: "relative",
                overflow: "hidden"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
              }}
            >
              {loading ? (
                <>
                  <span 
                    className="spinner-border spinner-border-sm me-2" 
                    role="status" 
                    aria-hidden="true"
                  ></span>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Lien d'inscription */}
          <div className="text-center mt-4 pt-3" style={{ borderTop: "1px solid #e0e0e0" }}>
            <p className="text-muted mb-2">
              Vous n'avez pas de compte ?
            </p>
            <Link 
              to="/register" 
              className="btn btn-outline-primary btn-lg"
              style={{
                borderRadius: "10px",
                padding: "10px 30px",
                fontSize: "14px",
                fontWeight: "600",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.3)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              <i className="fas fa-user-plus me-2"></i>
              S'inscrire
            </Link>
          </div>

          {/* Lien mot de passe oublié */}
          <div className="text-center mt-3">
            <Link 
              to="/forgot-password" 
              className="text-decoration-none"
              style={{ 
                color: "#667eea",
                fontSize: "14px",
                transition: "color 0.3s ease"
              }}
              onMouseOver={(e) => e.target.style.color = "#764ba2"}
              onMouseOut={(e) => e.target.style.color = "#667eea"}
            >
              <i className="fas fa-key me-1"></i>
              Mot de passe oublié ?
            </Link>
          </div>
        </div>
      </div>

      {/* Styles inline pour les icônes Font Awesome */}
      <style>
        {`
          .btn:disabled {
            opacity: 0.7;
            transform: none !important;
            box-shadow: none !important;
          }
          
          .form-control:disabled {
            background-color: #f8f9fa;
            opacity: 0.7;
          }
          
          .spinner-border {
            width: 1rem;
            height: 1rem;
          }
        `}
      </style>
    </div>
  );
}