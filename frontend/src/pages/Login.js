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

    console.log("🚀 Début de la tentative de connexion");
    console.log("Email:", email);
    console.log("URL API:", "http://127.0.0.1:8000/api/login");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });

      console.log("✅ Réponse API reçue:", res.data);

      if (res.data.message === "Connexion réussie ✅") {
        const user = res.data.user;
        console.log("👤 Données utilisateur:", user);
        
        // Sauvegarde dans localStorage
        localStorage.setItem("user", JSON.stringify(user));
        console.log("💾 Utilisateur sauvegardé dans localStorage");

        // Vérification de la redirection
        console.log("🔄 Type d'utilisateur:", user.type);
        
        if (user.type === "admin") {
          console.log("🎯 Redirection vers /dashAdmin");
          navigate("/dashAdmin", { replace: true });
        } else {
          console.log("🎯 Redirection vers /dashMembre");
          navigate("/dashMembre", { replace: true });
        }
      } else {
        console.log("❌ Réponse inattendue");
        setError("Réponse inattendue du serveur");
      }
    } catch (err) {
      console.error("💥 Erreur complète:", err);
      console.error("📡 Réponse erreur:", err.response);
      
      if (err.response) {
        setError(err.response.data.message || "Erreur de connexion");
      } else if (err.request) {
        setError("Impossible de contacter le serveur. Vérifiez que le serveur Laravel est démarré.");
      } else {
        setError("Une erreur est survenue lors de la configuration de la requête");
      }
    } finally {
      setLoading(false);
      console.log("🏁 Fin de la tentative de connexion");
    }
  };

  // Testez aussi avec un compte de test
  const fillTestAdmin = () => {
    setEmail("admin@example.com");
    setPassword("password123");
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
            
            {/* Bouton de test (à retirer en production) */}
            <button 
              onClick={fillTestAdmin}
              className="btn btn-sm btn-outline-secondary mb-3"
            >
              Remplir avec test admin
            </button>
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
                placeholder="admin@example.com"
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "12px 15px",
                  fontSize: "16px",
                  transition: "all 0.3s ease"
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
                placeholder="password123"
                style={{
                  border: "1px solid #e0e0e0",
                  borderRadius: "10px",
                  padding: "12px 15px",
                  fontSize: "16px",
                  transition: "all 0.3s ease"
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
              }}
            >
              <i className="fas fa-user-plus me-2"></i>
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}