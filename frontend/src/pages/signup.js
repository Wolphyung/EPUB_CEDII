import React, { useState } from "react";
import { Form, Button, Card, Alert, InputGroup } from "react-bootstrap";
import { FcGoogle } from "react-icons/fc";
import { useNavigate } from "react-router-dom";

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      // Calcul de la force du mot de passe
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

  const getStrengthColor = () => {
    switch (strength) {
      case 0:
      case 1:
        return "danger";
      case 2:
        return "warning";
      case 3:
        return "info";
      case 4:
        return "success";
      default:
        return "danger";
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validate();
    if (Object.keys(formErrors).length > 0) setErrors(formErrors);
    else {
      setErrors({});
      setSuccess("Inscription réussie !");
      console.log("Données envoyées:", formData);
      setTimeout(() => navigate("/login"), 2000);
    }
  };

  const handleGoogleSignUp = () => {
    alert("Connexion avec Google (simulé) !");
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
            />
            <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
          </Form.Group>

          {/* Mot de passe avec visibilité */}
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
              />
              <Button variant="outline-secondary" onClick={toggleShowPw}>
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

          {/* Confirmer mot de passe */}
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
              />
              <Button variant="outline-secondary" onClick={toggleShowConfirmPw}>
                {showConfirmPw ? "🙈" : "👁"}
              </Button>
            </InputGroup>
            <Form.Control.Feedback type="invalid">{errors.confirmPassword}</Form.Control.Feedback>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 mb-3"
            style={{ backgroundColor: "#6a11cb", border: "none" }}
          >
            S'inscrire
          </Button>

          <Button
            type="button"
            className="w-100 d-flex align-items-center justify-content-center"
            variant="light"
            onClick={handleGoogleSignUp}
            style={{ border: "1px solid #ddd" }}
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
