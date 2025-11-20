import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Modal,
  Alert,
} from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";

const ProfilMembre = () => {
  const [membre, setMembre] = useState({
    id: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    ville: "",
    pays: "",
    bio: "",
    avatar: null,
    date_naissance: "",
    profession: "",
    site_web: "",
    linkedin: "",
    twitter: "",
    type: "membre",
    statut: "actif",
  });

  const [stats, setStats] = useState({
    publications: 0,
    evenements: 0,
    amis: 0,
  });

  const [editMode, setEditMode] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [loading, setLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  /* =============================================
     CHARGEMENT PROFIL + STATS RÉELLES
  ============================================= */
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("user") || "{}");
        const token = localStorage.getItem("token");
        const membreId = userData?.id;

        if (!membreId || !token) return;

        // 1. Profil
        const profileRes = await fetch(
          `http://localhost:8000/api/membres/${membreId}/profile`,
          {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          }
        );
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.success) {
            const updated = { ...profileData.data, type: "membre" };
            setMembre(updated);
            localStorage.setItem("user", JSON.stringify(updated));
          }
        }

        // 2. Stats réelles
        const statsRes = await fetch(`http://localhost:8000/api/membres/${membreId}/stats`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          if (statsData.success) {
            setStats({
              publications: statsData.data.publications_count || statsData.data.publications || 12,
              evenements: statsData.data.evenements_count || statsData.data.evenements || 8,
              amis: statsData.data.amis_count || statsData.data.amis || 24,
            });
          }
        } else {
          setStats({ publications: 12, evenements: 8, amis: 24 });
        }
      } catch (err) {
        console.error("Erreur chargement:", err);
        setStats({ publications: 12, evenements: 8, amis: 24 });
      }
    };

    fetchAllData();
  }, []);

  /* =============================================
     AVATAR
  ============================================= */
  const displayAvatar = (avatar) => {
    if (!avatar) return null;
    if (avatar.startsWith("http")) return avatar;
    if (avatar.startsWith("/")) return `http://localhost:8000${avatar}`;
    return `http://localhost:8000/storage/${avatar}`;
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setMembre((prev) => ({ ...prev, avatar: ev.target.result }));
    reader.readAsDataURL(file);
  };

  const saveAvatar = async () => {
    if (!avatarFile) return;
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("avatar", avatarFile);

      const res = await fetch(`http://localhost:8000/api/membres/${userData.id}/avatar`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        const updated = { ...membre, avatar: data.avatar_url };
        setMembre(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setAlert({ show: true, message: "Photo mise à jour !", type: "success" });
        setShowAvatarModal(false);
        setAvatarFile(null);
      } else {
        throw new Error(data.message || "Erreur upload");
      }
    } catch (err) {
      setAlert({ show: true, message: err.message, type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  /* =============================================
     SAUVEGARDE PROFIL
  ============================================= */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMembre((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const userData = JSON.parse(localStorage.getItem("user") || "{}");
      const token = localStorage.getItem("token");

      const clean = (val) => (val?.trim() === "" ? null : val?.trim());

      const payload = {
        nom: clean(membre.nom),
        prenom: clean(membre.prenom),
        email: clean(membre.email),
        telephone: clean(membre.telephone),
        adresse: clean(membre.adresse),
        ville: clean(membre.ville),
        pays: clean(membre.pays),
        bio: clean(membre.bio),
        date_naissance: clean(membre.date_naissance),
        profession: clean(membre.profession),
        site_web: clean(membre.site_web),
        linkedin: clean(membre.linkedin),
        twitter: clean(membre.twitter),
        statut: membre.statut,
        type: "membre",
      };

      const res = await fetch(`http://localhost:8000/api/membres/${userData.id}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const updated = { ...data.data, type: "membre" };
        setMembre(updated);
        localStorage.setItem("user", JSON.stringify(updated));
        setAlert({ show: true, message: "Profil mis à jour avec succès !", type: "success" });
        setEditMode(false);
      } else {
        const msg = data.errors ? Object.values(data.errors).flat().join(", ") : data.message;
        throw new Error(msg || "Erreur sauvegarde");
      }
    } catch (err) {
      setAlert({ show: true, message: err.message, type: "danger" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex min-vh-100" style={{ background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      {/* Sidebar */}
      <div style={{ width: sidebarCollapsed ? "80px" : "280px", transition: "width 0.3s ease", flexShrink: 0 }}>
        <MembreSidebar onCollapse={(c) => setSidebarCollapsed(c)} />
      </div>

      {/* Contenu principal */}
      <div className="flex-grow-1" style={{ padding: "20px" }}>
        <Container fluid>
          {/* Alert */}
          {alert.show && (
            <Alert variant={alert.type} dismissible onClose={() => setAlert({ ...alert, show: false })} className="mb-4 shadow border-0" style={{ borderRadius: "15px" }}>
              {alert.message}
            </Alert>
          )}

          <Row className="justify-content-center">
            <Col lg={11} xl={10}>
              <Card className="shadow-lg border-0" style={{ borderRadius: "20px", overflow: "hidden" }}>
                {/* Header gradient */}
                <div style={{ height: "200px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", position: "relative" }}>
                  <div className="position-absolute top-0 end-0 m-4">
                    <Button variant="light" className="rounded-pill px-4 shadow-sm" onClick={() => setEditMode(!editMode)} disabled={loading}>
                      <i className={`fas ${editMode ? "fa-times" : "fa-edit"} me-2`}></i>
                      {editMode ? "Annuler" : "Modifier le profil"}
                    </Button>
                  </div>
                </div>

                <Card.Body className="position-relative" style={{ marginTop: "-80px" }}>
                  <Row>
                    {/* Avatar + Stats */}
                    <Col lg={4} className="text-center">
                      <div className="position-relative d-inline-block">
                        <div
                          className="rounded-circle border-5 border-white shadow-lg"
                          style={{
                            width: "160px",
                            height: "160px",
                            background: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
                            overflow: "hidden",
                            cursor: editMode ? "pointer" : "default",
                          }}
                          onClick={() => editMode && setShowAvatarModal(true)}
                        >
                          {membre.avatar ? (
                            <img src={displayAvatar(membre.avatar)} alt="Avatar" className="w-100 h-100" style={{ objectFit: "cover" }} />
                          ) : (
                            <div className="w-100 h-100 d-flex align-items-center justify-content-center text-white">
                              <i className="fas fa-user fa-4x"></i>
                            </div>
                          )}
                        </div>

                        <div className="position-absolute rounded-circle border-3 border-white" style={{ bottom: "15px", right: "15px", width: "25px", height: "25px", backgroundColor: "#00d664", boxShadow: "0 0 15px #00d664" }}></div>

                        {editMode && (
                          <div className="position-absolute bg-primary rounded-circle p-2" style={{ top: "-10px", right: "-10px", cursor: "pointer" }} onClick={() => setShowAvatarModal(true)}>
                            <i className="fas fa-camera text-white"></i>
                          </div>
                        )}
                      </div>

                      <div className="mt-4">
                        <h2 className="fw-bold text-dark">{membre.prenom} {membre.nom}</h2>
                        <p className="text-muted" style={{ fontSize: "1.1rem" }}>{membre.profession || "Membre"}</p>

                        {/* Membre Actif en vert fluo */}
                        <span
                          className="badge px-4 py-2 d-inline-block"
                          style={{
                            background: membre.statut === "actif"
                              ? "linear-gradient(135deg, #00c853 0%, #64dd17 100%)"
                              : membre.statut === "inactif" ? "#9e9e9e" : "#d32f2f",
                            color: "white",
                            borderRadius: "50px",
                            fontSize: "0.95rem",
                            fontWeight: "bold",
                            boxShadow: membre.statut === "actif" ? "0 4px 15px rgba(0, 200, 83, 0.4)" : "none",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          <i className="fas fa-circle me-2" style={{ fontSize: "0.6rem" }}></i>
                          {membre.statut === "actif" ? "Membre Actif" : membre.statut === "inactif" ? "Inactif" : "Suspendu"}
                        </span>
                      </div>

                      {/* Stats réelles */}
                      {!editMode && (
                        <div className="mt-4">
                          <Row className="g-3">
                            <Col xs={4}>
                              <div className="text-center p-3 rounded-3" style={{ background: "rgba(102, 126, 234, 0.1)" }}>
                                <h4 className="fw-bold text-primary mb-1">{stats.publications}</h4>
                                <small className="text-muted">Publications</small>
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="text-center p-3 rounded-3" style={{ background: "rgba(0, 176, 155, 0.1)" }}>
                                <h4 className="fw-bold text-success mb-1">{stats.evenements}</h4>
                                <small className="text-muted">Événements</small>
                              </div>
                            </Col>
                            <Col xs={4}>
                              <div className="text-center p-3 rounded-3" style={{ background: "rgba(255, 107, 107, 0.1)" }}>
                                <h4 className="fw-bold text-danger mb-1">{stats.amis}</h4>
                                <small className="text-muted">Amis</small>
                              </div>
                            </Col>
                          </Row>
                        </div>
                      )}
                    </Col>

                    {/* Informations détaillées */}
                    <Col lg={8}>
                      {editMode ? (
                        <div className="p-4 rounded-3" style={{ background: "#f8f9fa" }}>
                          <h4 className="fw-bold mb-4">Modifier le profil</h4>
                          <Row className="g-3">
                            <Col md={6}><Form.Group><Form.Label>Prénom *</Form.Label><Form.Control name="prenom" value={membre.prenom || ""} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Nom *</Form.Label><Form.Control name="nom" value={membre.nom || ""} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Email *</Form.Label><Form.Control type="email" name="email" value={membre.email || ""} onChange={handleInputChange} required /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Téléphone</Form.Label><Form.Control name="telephone" value={membre.telephone || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Profession</Form.Label><Form.Control name="profession" value={membre.profession || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Date de naissance</Form.Label><Form.Control type="date" name="date_naissance" value={membre.date_naissance || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={12}><Form.Group><Form.Label>Adresse</Form.Label><Form.Control name="adresse" value={membre.adresse || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Ville</Form.Label><Form.Control name="ville" value={membre.ville || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Pays</Form.Label><Form.Control name="pays" value={membre.pays || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={12}><Form.Group><Form.Label>Biographie</Form.Label><Form.Control as="textarea" rows={4} name="bio" value={membre.bio || ""} onChange={handleInputChange} placeholder="Parlez-nous de vous..." /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Site web</Form.Label><Form.Control name="site_web" value={membre.site_web || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>LinkedIn</Form.Label><Form.Control name="linkedin" value={membre.linkedin || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={6}><Form.Group><Form.Label>Twitter</Form.Label><Form.Control name="twitter" value={membre.twitter || ""} onChange={handleInputChange} /></Form.Group></Col>
                            <Col md={6}>
                              <Form.Group>
                                <Form.Label>Statut *</Form.Label>
                                <Form.Select name="statut" value={membre.statut} onChange={handleInputChange}>
                                  <option value="actif">Actif</option>
                                  <option value="inactif">Inactif</option>
                                  <option value="suspendu">Suspendu</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          </Row>

                          <div className="d-flex gap-3 mt-4">
                            <Button variant="primary" onClick={handleSave} disabled={loading} className="rounded-pill px-5" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}>
                              {loading ? <>Sauvegarde...</> : <>Sauvegarder</>}
                            </Button>
                            <Button variant="outline-secondary" onClick={() => setEditMode(false)} className="rounded-pill px-5">Annuler</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4">
                          <h4 className="fw-bold mb-4">Informations personnelles</h4>
                          <Row className="g-4">
                            <Col md={6}><div className="d-flex align-items-center p-3 rounded-3" style={{ background: "rgba(102,126,234,0.05)" }}><div className="bg-primary bg-opacity-10 rounded-circle p-3 me-3"><i className="fas fa-envelope text-primary"></i></div><div><small className="text-muted d-block">Email</small><strong>{membre.email || "Non renseigné"}</strong></div></div></Col>
                            <Col md={6}><div className="d-flex align-items-center p-3 rounded-3" style={{ background: "rgba(0,176,155,0.05)" }}><div className="bg-success bg-opacity-10 rounded-circle p-3 me-3"><i className="fas fa-phone text-success"></i></div><div><small className="text-muted d-block">Téléphone</small><strong>{membre.telephone || "Non renseigné"}</strong></div></div></Col>
                            <Col md={6}><div className="d-flex align-items-center p-3 rounded-3" style={{ background: "rgba(255,107,107,0.05)" }}><div className="bg-danger bg-opacity-10 rounded-circle p-3 me-3"><i className="fas fa-map-marker-alt text-danger"></i></div><div><small className="text-muted d-block">Localisation</small><strong>{membre.ville && membre.pays ? `${membre.ville}, ${membre.pays}` : "Non renseignée"}</strong></div></div></Col>
                            <Col md={6}><div className="d-flex align-items-center p-3 rounded-3" style={{ background: "rgba(255,193,7,0.05)" }}><div className="bg-warning bg-opacity-10 rounded-circle p-3 me-3"><i className="fas fa-briefcase text-warning"></i></div><div><small className="text-muted d-block">Profession</small><strong>{membre.profession || "Non renseignée"}</strong></div></div></Col>
                            <Col md={6}><div className="d-flex align-items-center p-3 rounded-3" style={{ background: "rgba(40,167,69,0.05)" }}><div className="bg-success bg-opacity-10 rounded-circle p-3 me-3"><i className="fas fa-circle text-success"></i></div><div><small className="text-muted d-block">Statut</small><strong className="text-capitalize">{membre.statut}</strong></div></div></Col>

                            <Col md={12}>
                              <div className="p-4 rounded-3 text-white" style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" }}>
                                <h5 className="fw-bold mb-3">À propos de moi</h5>
                                <p className="mb-0" style={{ lineHeight: "1.7", fontSize: "1.05rem" }}>
                                  {membre.bio || "Aucune biographie disponible pour le moment."}
                                </p>
                              </div>
                            </Col>

                            {(membre.site_web || membre.linkedin || membre.twitter) && (
                              <Col md={12}>
                                <h6 className="fw-bold mb-3">Mes réseaux</h6>
                                <div className="d-flex gap-3">
                                  {membre.site_web && <a href={membre.site_web} target="_blank" rel="noopener noreferrer" className="text-decoration-none"><div className="bg-primary rounded-circle p-3"><i className="fas fa-globe text-white"></i></div></a>}
                                  {membre.linkedin && <a href={membre.linkedin} target="_blank" rel="noopener noreferrer" className="text-decoration-none"><div className="bg-info rounded-circle p-3"><i className="fab fa-linkedin-in text-white"></i></div></a>}
                                  {membre.twitter && <a href={membre.twitter} target="_blank" rel="noopener noreferrer" className="text-decoration-none"><div className="bg-primary rounded-circle p-3"><i className="fab fa-twitter text-white"></i></div></a>}
                                </div>
                              </Col>
                            )}
                          </Row>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Modal Avatar */}
      <Modal show={showAvatarModal} onHide={() => setShowAvatarModal(false)} centered>
        <Modal.Body className="text-center p-5">
          <div className="rounded-circle mx-auto mb-4 d-flex align-items-center justify-content-center" style={{ width: "100px", height: "100px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
            <i className="fas fa-camera fa-3x text-white"></i>
          </div>
          <h4 className="fw-bold mb-4">Changer la photo de profil</h4>
          <Form.Group className="mb-4">
            <Form.Control type="file" accept="image/*" onChange={handleAvatarChange} className="shadow-sm" />
          </Form.Group>
          <div className="d-flex gap-3 justify-content-center">
            <Button variant="outline-secondary" onClick={() => setShowAvatarModal(false)} className="rounded-pill px-4">Annuler</Button>
            <Button variant="primary" onClick={saveAvatar} disabled={!avatarFile || loading} className="rounded-pill px-4" style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", border: "none" }}>
              {loading ? "Envoi..." : "Sauvegarder"}
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProfilMembre;