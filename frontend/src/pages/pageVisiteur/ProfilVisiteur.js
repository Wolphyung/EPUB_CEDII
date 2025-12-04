import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

const ProfilVisiteur = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile"); // "profile" ou "password"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });
  const [passwordData, setPasswordData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("success"); // "success" or "error"

  // Récupérer le token du localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem("token");
    return token ? `Bearer ${token}` : null;
  };

  // Configurer les headers d'authentification
  const getAuthConfig = () => {
    const token = getAuthToken();
    return token ? {
      headers: {
        Authorization: token,
      },
      withCredentials: true,
    } : { withCredentials: true };
  };

  // Vérifier si l'utilisateur est connecté
  const isAuthenticated = () => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    return !!(token && userData);
  };

  // Récupérer le profil au chargement
  useEffect(() => {
    if (!isAuthenticated()) {
      showMessage("Veuillez vous connecter pour accéder à votre profil", "error");
      setLoading(false);
      return;
    }

    const config = getAuthConfig();
    
    axios
      .get("http://localhost:8000/api/profile", config)
      .then((res) => {
        if (res.data && res.data.name) {
          setUser(res.data);
          setFormData({
            name: res.data.name,
            email: res.data.email,
          });
        } else {
          showMessage("Données utilisateur invalides reçues du serveur", "error");
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur lors du chargement du profil:", err);
        
        // Si l'erreur est 401, rediriger vers la page de connexion
        if (err.response?.status === 401) {
          showMessage("Session expirée. Veuillez vous reconnecter", "error");
          // Optionnel: rediriger automatiquement après un délai
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        } else {
          showMessage(
            err.response?.data?.message || "Impossible de récupérer le profil",
            "error"
          );
        }
        setLoading(false);
      });
  }, []);

  const showMessage = (msg, type = "success") => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(""), 5000);
  };

  // Mettre à jour le profil
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      showMessage("Veuillez vous connecter pour modifier votre profil", "error");
      return;
    }

    const config = getAuthConfig();
    
    axios
      .put("http://localhost:8000/api/profile", formData, config)
      .then((res) => {
        if (res.data && res.data.user) {
          setUser(res.data.user);
          showMessage(res.data.message);
          setEditMode(false);
          // Mettre à jour le localStorage si nécessaire
          localStorage.setItem("user", JSON.stringify(res.data.user));
        } else {
          showMessage("Réponse invalide du serveur", "error");
        }
      })
      .catch((err) => {
        console.error("Erreur lors de la mise à jour:", err);
        if (err.response?.status === 401) {
          showMessage("Session expirée. Veuillez vous reconnecter", "error");
        } else {
          showMessage(
            err.response?.data?.message || "Erreur lors de la mise à jour",
            "error"
          );
        }
      });
  };

  // Changer le mot de passe
  const handleChangePassword = (e) => {
    e.preventDefault();
    
    if (!isAuthenticated()) {
      showMessage("Veuillez vous connecter pour changer votre mot de passe", "error");
      return;
    }

    const config = getAuthConfig();
    
    axios
      .put("http://localhost:8000/api/profile/password", passwordData, config)
      .then((res) => {
        showMessage(res.data.message);
        setPasswordData({
          current_password: "",
          new_password: "",
          new_password_confirmation: "",
        });
      })
      .catch((err) => {
        console.error("Erreur lors du changement de mot de passe:", err);
        if (err.response?.status === 401) {
          showMessage("Session expirée. Veuillez vous reconnecter", "error");
        } else {
          showMessage(
            err.response?.data?.message || "Erreur lors du changement de mot de passe",
            "error"
          );
        }
      });
  };

  // Récupérer les données utilisateur du localStorage
  const getUserFromLocalStorage = () => {
    try {
      const userData = localStorage.getItem("user");
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setFormData({
          name: parsedUser.name || "",
          email: parsedUser.email || "",
        });
        return true;
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des données du localStorage:", error);
    }
    return false;
  };

  if (loading) {
    return (
      <div className="bg-light min-vh-100 pt-5">
        <Navbar />
        <div className="d-flex justify-content-center align-items-center min-vh-50">
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{width: '3rem', height: '3rem'}} role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="text-muted">Chargement du profil...</p>
          </div>
        </div>
      </div>
    );
  }

  // Si user est toujours null après le chargement
  if (!user) {
    return (
      <div className="bg-light min-vh-100 pt-5">
        <Navbar />
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="card shadow-sm border-0">
                <div className="card-body text-center py-5">
                  <i className="fas fa-exclamation-triangle text-warning fa-4x mb-4"></i>
                  <h3 className="text-dark mb-3">Profil non disponible</h3>
                  <p className="text-muted mb-4">
                    {message || "Vous devez être connecté pour accéder à votre profil."}
                  </p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button 
                      className="btn btn-primary"
                      onClick={() => window.location.href = "/login"}
                    >
                      <i className="fas fa-sign-in-alt me-2"></i>
                      Se connecter
                    </button>
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={() => {
                        if (getUserFromLocalStorage()) {
                          setLoading(false);
                        }
                      }}
                    >
                      <i className="fas fa-redo me-2"></i>
                      Rafraîchir
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100">
      <Navbar />
      
      {/* Hero Section */}
      <div className="bg-primary text-white py-5 position-relative overflow-hidden">
        <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-25"></div>
        <div className="container position-relative">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">Mon Profil</h1>
              <p className="lead mb-0 opacity-75">
                Gérez vos informations personnelles et votre mot de passe
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Message d'alerte */}
            {message && (
              <div className={`alert alert-${messageType === "success" ? "success" : "danger"} alert-dismissible fade show mb-4`} role="alert">
                {message}
                <button type="button" className="btn-close" onClick={() => setMessage("")}></button>
              </div>
            )}

            <div className="card shadow-sm border-0">
              <div className="card-header bg-transparent border-0">
                <ul className="nav nav-pills nav-fill gap-2 p-1 small bg-light rounded-3" role="tablist">
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link border-0 rounded-2 ${activeTab === "profile" ? "active bg-primary text-white" : "text-dark"}`}
                      onClick={() => setActiveTab("profile")}
                      type="button"
                      role="tab"
                    >
                      <i className="fas fa-user me-2"></i>
                      Informations du profil
                    </button>
                  </li>
                  <li className="nav-item" role="presentation">
                    <button
                      className={`nav-link border-0 rounded-2 ${activeTab === "password" ? "active bg-primary text-white" : "text-dark"}`}
                      onClick={() => setActiveTab("password")}
                      type="button"
                      role="tab"
                    >
                      <i className="fas fa-lock me-2"></i>
                      Mot de passe
                    </button>
                  </li>
                </ul>
              </div>

              <div className="card-body p-4">
                {/* Tab Profil */}
                {activeTab === "profile" && (
                  <div className="tab-pane fade show active">
                    {!editMode ? (
                      <div className="row">
                        <div className="col-12">
                          <div className="d-flex align-items-center mb-4">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-4" 
                                 style={{width: '80px', height: '80px'}}>
                              <i className="fas fa-user text-primary fs-3"></i>
                            </div>
                            <div>
                              <h4 className="text-dark mb-1">{user.name || "Non spécifié"}</h4>
                              <p className="text-muted mb-0">{user.email || "Non spécifié"}</p>
                              <small className="text-muted">
                                {user.created_at ? `Membre depuis ${new Date(user.created_at).toLocaleDateString('fr-FR')}` : "Membre"}
                              </small>
                            </div>
                          </div>

                          <div className="row g-3">
                            <div className="col-md-6">
                              <label className="form-label fw-semibold text-muted">Nom complet</label>
                              <div className="form-control bg-light border-0">
                                {user.name || "Non spécifié"}
                              </div>
                            </div>
                            <div className="col-md-6">
                              <label className="form-label fw-semibold text-muted">Adresse email</label>
                              <div className="form-control bg-light border-0">
                                {user.email || "Non spécifié"}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex gap-2 mt-4">
                            <button
                              onClick={() => setEditMode(true)}
                              className="btn btn-primary"
                            >
                              <i className="fas fa-edit me-2"></i>
                              Modifier le profil
                            </button>
                            <button
                              onClick={() => {
                                localStorage.removeItem("token");
                                localStorage.removeItem("user");
                                window.location.href = "/login";
                              }}
                              className="btn btn-outline-danger"
                            >
                              <i className="fas fa-sign-out-alt me-2"></i>
                              Se déconnecter
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleProfileUpdate}>
                        <div className="row g-3">
                          <div className="col-12">
                            <div className="d-flex align-items-center mb-4">
                              <div className="bg-primary bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-4" 
                                   style={{width: '80px', height: '80px'}}>
                                <i className="fas fa-user-edit text-primary fs-3"></i>
                              </div>
                              <div>
                                <h4 className="text-dark mb-1">Modifier le profil</h4>
                                <p className="text-muted mb-0">Mettez à jour vos informations personnelles</p>
                              </div>
                            </div>
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Nom complet</label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                              }
                              className="form-control form-control-lg"
                              required
                            />
                          </div>

                          <div className="col-md-6">
                            <label className="form-label fw-semibold">Adresse email</label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                              }
                              className="form-control form-control-lg"
                              required
                            />
                          </div>

                          <div className="col-12">
                            <div className="d-flex gap-2 mt-4">
                              <button
                                type="submit"
                                className="btn btn-success"
                              >
                                <i className="fas fa-check me-2"></i>
                                Enregistrer les modifications
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditMode(false)}
                                className="btn btn-outline-secondary"
                              >
                                <i className="fas fa-times me-2"></i>
                                Annuler
                              </button>
                            </div>
                          </div>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* Tab Mot de passe */}
                {activeTab === "password" && (
                  <div className="tab-pane fade show active">
                    <div className="row">
                      <div className="col-12">
                        <div className="d-flex align-items-center mb-4">
                          <div className="bg-warning bg-opacity-10 rounded-circle d-flex align-items-center justify-content-center me-4" 
                               style={{width: '80px', height: '80px'}}>
                            <i className="fas fa-lock text-warning fs-3"></i>
                          </div>
                          <div>
                            <h4 className="text-dark mb-1">Changer le mot de passe</h4>
                            <p className="text-muted mb-0">Mettez à jour votre mot de passe de connexion</p>
                          </div>
                        </div>

                        <form onSubmit={handleChangePassword}>
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label fw-semibold">Mot de passe actuel</label>
                              <input
                                type="password"
                                value={passwordData.current_password}
                                onChange={(e) =>
                                  setPasswordData({ ...passwordData, current_password: e.target.value })
                                }
                                className="form-control form-control-lg"
                                placeholder="Entrez votre mot de passe actuel"
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Nouveau mot de passe</label>
                              <input
                                type="password"
                                value={passwordData.new_password}
                                onChange={(e) =>
                                  setPasswordData({ ...passwordData, new_password: e.target.value })
                                }
                                className="form-control form-control-lg"
                                placeholder="Entrez le nouveau mot de passe"
                                required
                              />
                            </div>

                            <div className="col-md-6">
                              <label className="form-label fw-semibold">Confirmer le nouveau mot de passe</label>
                              <input
                                type="password"
                                value={passwordData.new_password_confirmation}
                                onChange={(e) =>
                                  setPasswordData({
                                    ...passwordData,
                                    new_password_confirmation: e.target.value,
                                  })
                                }
                                className="form-control form-control-lg"
                                placeholder="Confirmez le nouveau mot de passe"
                                required
                              />
                            </div>

                            <div className="col-12">
                              <div className="d-flex gap-2 mt-4">
                                <button
                                  type="submit"
                                  className="btn btn-warning text-white"
                                >
                                  <i className="fas fa-key me-2"></i>
                                  Changer le mot de passe
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setPasswordData({
                                    current_password: "",
                                    new_password: "",
                                    new_password_confirmation: "",
                                  })}
                                  className="btn btn-outline-secondary"
                                >
                                  <i className="fas fa-eraser me-2"></i>
                                  Effacer
                                </button>
                              </div>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Informations supplémentaires */}
            <div className="card shadow-sm border-0 mt-4">
              <div className="card-header bg-transparent border-0">
                <h5 className="text-dark mb-0">
                  <i className="fas fa-info-circle me-2 text-primary"></i>
                  Informations du compte
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-calendar-plus text-muted me-3"></i>
                      <div>
                        <small className="text-muted">Date de création</small>
                        <div className="fw-semibold">
                          {user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }) : 'Non disponible'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="d-flex align-items-center">
                      <i className="fas fa-shield-alt text-muted me-3"></i>
                      <div>
                        <small className="text-muted">Statut du compte</small>
                        <div className="fw-semibold text-success">Actif</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilVisiteur;