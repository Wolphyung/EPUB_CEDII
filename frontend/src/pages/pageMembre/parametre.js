import React, { useState } from "react";
import { Form, Button, Card, Container } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

const ParametreMembre = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [profile, setProfile] = useState({
    nom: "John Doe",
    email: "john@example.com",
  });

  const [password, setPassword] = useState("");
  const [pwStrength, setPwStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handlePasswordChange = (e) => {
    const val = e.target.value;
    setPassword(val);

    // Calcul de la force du mot de passe
    let score = 0;
    if (val.length >= 8) score += 1;
    if (/[A-Z]/.test(val)) score += 1;
    if (/[0-9]/.test(val)) score += 1;
    if (/[^A-Za-z0-9]/.test(val)) score += 1;
    setPwStrength(score);
  };

  const handleSubmitProfile = (e) => {
    e.preventDefault();
    alert("Profil mis à jour !");
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    if (pwStrength < 4) {
      alert("Le mot de passe doit contenir au moins 8 caractères, une majuscule, un chiffre et un caractère spécial !");
      return;
    }
    alert("Mot de passe mis à jour !");
    setPassword("");
    setPwStrength(0);
  };

  return (
    <div className={`d-flex ${darkMode ? "bg-dark text-white" : ""}`} style={{ minHeight: "100vh" }}>
      <MembreSidebar />

      <Container className="flex-grow-1 p-4" style={{ marginLeft: "220px" }}>
        <h2 className="mb-4">⚙️ Paramètres</h2>

        {/* Toggle mode clair/sombre */}
        <Form.Check 
          type="switch"
          id="darkModeSwitch"
          label="Mode sombre"
          className="mb-4"
          checked={darkMode}
          onChange={() => setDarkMode(!darkMode)}
        />

        {/* Modifier le profil */}
        <Card className="mb-4 shadow-sm p-3">
          <h5>Informations personnelles</h5>
          <Form onSubmit={handleSubmitProfile}>
            <Form.Group className="mb-3">
              <Form.Label>Nom</Form.Label>
              <Form.Control
                type="text"
                name="nom"
                value={profile.nom}
                onChange={handleProfileChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={profile.email}
                onChange={handleProfileChange}
              />
            </Form.Group>
            <Button type="submit" variant="primary">
              Enregistrer
            </Button>
          </Form>
        </Card>

        {/* Modifier le mot de passe */}
        <Card className="shadow-sm p-3">
          <h5>Changer le mot de passe</h5>
          <Form onSubmit={handleSubmitPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <div className="d-flex">
                <Form.Control
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={handlePasswordChange}
                />
                <Button
                  variant="secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  className="ms-2"
                >
                  {showPassword ? "🙈" : "👁"}
                </Button>
              </div>
            </Form.Group>
            <div className="mb-3">
              <div style={{ height: "8px", background: "#ddd", borderRadius: "4px" }}>
                <div
                  style={{
                    width: `${(pwStrength / 4) * 100}%`,
                    height: "8px",
                    borderRadius: "4px",
                    background:
                      pwStrength <= 1 ? "#ff6b6b" :
                      pwStrength === 2 ? "#ffb703" :
                      pwStrength === 3 ? "#7bd389" :
                      "#2dd4bf"
                  }}
                ></div>
              </div>
              <small>
                {pwStrength === 0 && "Entrez un mot de passe"}
                {pwStrength === 1 && "Très faible"}
                {pwStrength === 2 && "Faible"}
                {pwStrength === 3 && "Bon"}
                {pwStrength === 4 && "Très fort"}
              </small>
            </div>
            <Button type="submit" variant="success">
              Changer le mot de passe
            </Button>
          </Form>
        </Card>
      </Container>
    </div>
  );
};

export default ParametreMembre;
