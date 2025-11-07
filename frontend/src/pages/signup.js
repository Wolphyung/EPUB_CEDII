import React, { useState } from "react";
import { Form, Button, Card, Alert, InputGroup, Spinner } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setApiError(""); // Effacer les erreurs API quand l'utilisateur tape

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
    if (!formData.nom.trim()) newErrors.nom = "Nom requis";
    if (!formData.prenom.trim()) newErrors.prenom = "Prénom requis";
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
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.confirmPassword,
      });

      // Si l'inscription réussit
      setSuccess("Inscription réussie ! Redirection...");
      
      // Stocker le token et les infos utilisateur si l'API les retourne
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      // Rediriger vers le dashboard après 2 secondes
      setTimeout(() => {
        navigate("/dashMembre");
      }, 2000);

    } catch (error) {
      console.error("Erreur d'inscription:", error);
      
      if (error.response) {
        // Erreur du serveur avec réponse
        const serverErrors = error.response.data.errors;
        if (serverErrors) {
          // Convertir les erreurs Laravel en format frontend
          const formattedErrors = {};
          Object.keys(serverErrors).forEach(key => {
            formattedErrors[key] = serverErrors[key][0];
          });
          setErrors(formattedErrors);
        } else {
          setApiError(error.response.data.message || "Erreur lors de l'inscription");
        }
      } else if (error.request) {
        // Pas de réponse du serveur
        setApiError("Impossible de se connecter au serveur. Vérifiez votre connexion.");
      } else {
        // Autre erreur
        setApiError("Une erreur inattendue s'est produite");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignUp = () => {
    // Redirection vers l'authentification Google
    window.location.href = "http://localhost:8000/api/auth/google";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #667eea, #764ba2)",
      }}
    >
      <Card className="p-4 shadow-lg" style={{ width: "420px", borderRadius: "15px" }}>
        <h2 className="text-center mb-4" style={{ color: "#333", fontWeight: "700" }}>
          Créer un compte
        </h2>

        {success && <Alert variant="success">{success}</Alert>}
        {apiError && <Alert variant="danger">{apiError}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Nom</Form.Label>
            <Form.Control
              type="text"
              name="nom"
              placeholder="Votre nom"
              value={formData.nom}
              onChange={handleChange}
              isInvalid={!!errors.nom}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">{errors.nom}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Prénom</Form.Label>
            <Form.Control
              type="text"
              name="prenom"
              placeholder="Votre prénom"
              value={formData.prenom}
              onChange={handleChange}
              isInvalid={!!errors.prenom}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">{errors.prenom}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              placeholder="Votre email"
              value={formData.email}
              onChange={handleChange}
              isInvalid={!!errors.email}
              disabled={loading}
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mot de passe</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPw ? "text" : "password"}
                name="password"
                placeholder="Mot de passe"
                value={formData.password}
                onChange={handleChange}
                isInvalid={!!errors.password}
                disabled={loading}
              />
              <Button 
                variant="outline-secondary" 
                onClick={toggleShowPw}
                disabled={loading}
              >
                {showPw ? "🙈" : "👁"}
              </Button>
            </InputGroup>
            <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
            <div className="mt-1">
              <div
                style={{
                  height: "6px",
                  background: "#ddd",
                  borderRadius: "3px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(strength / 4) * 100}%`,
                    height: "6px",
                    background:
                      strength === 1
                        ? "red"
                        : strength === 2
                        ? "orange"
                        : strength === 3
                        ? "skyblue"
                        : strength === 4
                        ? "green"
                        : "#ddd",
                  }}
                />
              </div>
              <small className="text-muted">
                {strength < 4 ? "Mot de passe faible" : "Mot de passe fort"}
              </small>
            </div>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Confirmer le mot de passe</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPw ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirmer le mot de passe"
                value={formData.confirmPassword}
                onChange={handleChange}
                isInvalid={!!errors.confirmPassword}
                disabled={loading}
              />
              <Button 
                variant="outline-secondary" 
                onClick={toggleShowConfirmPw}
                disabled={loading}
              >
                {showConfirmPw ? "🙈" : "👁"}
              </Button>
            </InputGroup>
            <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 mb-3"
            style={{ backgroundColor: "#6a11cb", border: "none" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                  className="me-2"
                />
                Inscription...
              </>
            ) : (
              "S'inscrire"
            )}
          </Button>

          <Button
            type="button"
            className="w-100 d-flex align-items-center justify-content-center"
            variant="light"
            onClick={handleGoogleSignUp}
            style={{ border: "1px solid #ddd" }}
            disabled={loading}
          >
            <FcGoogle size={24} className="me-2" /> S'inscrire avec Google
          </Button>
        </Form>

        <div className="mt-3 text-center">
          <small style={{ color: "#555" }}>
            Déjà un compte ? <a href="/login">Se connecter</a>
          </small>
        </div>
      </Card>
    </div>
  );
};

export default SignUp;