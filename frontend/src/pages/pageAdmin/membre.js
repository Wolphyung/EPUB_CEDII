import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Image,
  Alert,
  Badge,
  InputGroup,
} from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";
import {
  fetchMembres,
  addMembre,
  updateMembre,
  deleteMembre,
} from "../../services/api";
import { useTranslation } from "react-i18next";

const MembrePage = () => {
  const { t } = useTranslation();

  const [membres, setMembres] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");
  const [currentMembre, setCurrentMembre] = useState({
    id: null,
    nom: "",
    prenom: "-",
    type: "membre",
    statut: "actif",
    avatar: null,
    email: "",
    password: "",
  });
  const [avatarError, setAvatarError] = useState("");

  useEffect(() => {
    loadMembres();
  }, []);

  const loadMembres = async () => {
    try {
      setLoading(true);
      const res = await fetchMembres();
      const membresNormalises = res.data.map(m => ({
        ...m,
        statut: (m.statut || "actif").toString().toLowerCase(),
        type: (m.type || "membre").toString().toLowerCase(),
        prenom: m.prenom || "-",
        avatar: m.avatar || null,
      }));
      setMembres(membresNormalises);
    } catch (err) {
      console.error("Erreur chargement membres:", err);
      showNotification("error", t("error_load_members") || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: "", message: "" }), 4000);
  };

  const openAddModal = () => {
    setCurrentMembre({
      id: null,
      nom: "",
      prenom: "-",
      type: "membre",
      statut: "actif",
      avatar: null,
      email: "",
      password: "",
    });
    setAvatarError("");
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setCurrentMembre({
      ...m,
      password: "",
      statut: (m.statut || "actif").toString().toLowerCase(),
      type: (m.type || "membre").toString().toLowerCase(),
    });
    setAvatarError("");
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "avatar" && files.length > 0) {
      const file = files[0];
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setAvatarError("L'image ne doit pas dépasser 2 Mo");
        e.target.value = "";
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setAvatarError("Format non supporté (JPEG, PNG, GIF)");
        e.target.value = "";
        return;
      }
      setAvatarError("");
      setCurrentMembre({ ...currentMembre, avatar: file });
    } else {
      setCurrentMembre({ ...currentMembre, [name]: value });
    }
  };

  const handleSave = async () => {
    if (!currentMembre.nom?.trim()) return showNotification("error", "Le nom est requis");
    if (!currentMembre.email?.trim()) return showNotification("error", "L'email est requis");
    if (!currentMembre.id && !currentMembre.password) return showNotification("error", "Mot de passe requis");
    if (avatarError) return showNotification("error", avatarError);

    try {
      const formData = new FormData();
      formData.append("nom", currentMembre.nom.trim());
      formData.append("prenom", currentMembre.prenom || "-");
      formData.append("type", currentMembre.type);
      formData.append("statut", currentMembre.statut);
      formData.append("email", currentMembre.email.trim());
      if (currentMembre.password) formData.append("password", currentMembre.password);
      if (currentMembre.avatar && typeof currentMembre.avatar !== "string") {
        formData.append("avatar", currentMembre.avatar);
      }

      if (currentMembre.id) {
        await updateMembre(currentMembre.id, formData);
        showNotification("success", "Membre modifié avec succès");
      } else {
        await addMembre(formData);
        showNotification("success", "Membre créé avec succès");
      }
      loadMembres();
      setShowModal(false);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const msg = Object.values(errors).flat().join(", ");
        showNotification("error", msg);
      } else {
        showNotification("error", err.response?.data?.message || "Erreur serveur");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer ce membre ?")) return;
    try {
      await deleteMembre(id);
      showNotification("success", "Membre supprimé");
      loadMembres();
    } catch (err) {
      showNotification("error", "Erreur lors de la suppression");
    }
  };

  const filteredMembres = membres.filter(membre => {
    const search = searchTerm.toLowerCase();
    return (
      (membre.nom?.toLowerCase().includes(search) ||
        membre.prenom?.toLowerCase().includes(search) ||
        membre.email?.toLowerCase().includes(search) ||
        membre.type?.toLowerCase().includes(search)) &&
      (filterStatut === "Tous" || membre.statut === filterStatut.toLowerCase()) &&
      (filterType === "Tous" || membre.type === filterType.toLowerCase())
    );
  });

  const getStatusBadge = (statut) => {
    const map = {
      actif: { label: "Actif", variant: "success", icon: "fa-check-circle" },
      inactif: { label: "En attente", variant: "warning", icon: "fa-clock" },
      suspendu: { label: "Suspendu", variant: "danger", icon: "fa-ban" },
    };
    const s = map[statut] || { label: "Inconnu", variant: "secondary", icon: "fa-question" };
    return (
      <Badge bg={s.variant} className="px-3 py-2">
        <i className={`fas ${s.icon} me-2`}></i> {s.label}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const map = {
      admin: { label: "Admin", variant: "primary", icon: "fa-crown" },
      membre: { label: "Membre", variant: "info", icon: "fa-user" },
      moderateur: { label: "Modérateur", variant: "secondary", icon: "fa-user-shield" },
    };
    const t = map[type] || { label: type, variant: "dark", icon: "fa-user" };
    return (
      <Badge bg={t.variant} className="px-3 py-2">
        <i className={`fas ${t.icon} me-2`}></i> {t.label}
      </Badge>
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatut("Tous");
    setFilterType("Tous");
  };

  const removeAvatar = () => {
    setCurrentMembre({ ...currentMembre, avatar: null });
    setAvatarError("");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* Notification */}
        {showAlert.show && (
          <Alert
            variant={showAlert.type === "success" ? "success" : "danger"}
            className="position-fixed top-3 end-3 shadow-lg"
            style={{ zIndex: 9999, minWidth: "350px" }}
            onClose={() => setShowAlert({ ...showAlert, show: false })}
            dismissible
          >
            <strong>{showAlert.type === "success" ? "Succès" : "Erreur"}</strong>
            <p className="mb-0">{showAlert.message}</p>
          </Alert>
        )}

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2 text-gradient">Gestion des membres</h2>
            <p className="text-muted">
              <i className="fas fa-users me-2"></i> Administration complète des utilisateurs
            </p>
          </div>
          <Button variant="success" onClick={openAddModal} className="shadow">
            <i className="fas fa-user-plus me-2"></i> Nouveau membre
          </Button>
        </div>

        {/* Stats */}
        <Row className="mb-4">
          {[
            { title: "Total", count: membres.length, icon: "fa-users", color: "#667eea" },
            { title: "Actifs", count: membres.filter(m => m.statut === "actif").length, icon: "fa-user-check", color: "#00b09b" },
            { title: "En attente", count: membres.filter(m => m.statut === "inactif").length, icon: "fa-clock", color: "#f093fb" },
            { title: "Suspendus", count: membres.filter(m => m.statut === "suspendu").length, icon: "fa-user-slash", color: "#fd746c" },
          ].map((s, i) => (
            <Col md={3} key={i}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div className="rounded-circle mx-auto mb-3" style={{ width: 60, height: 60, background: s.color }}>
                    <i className={`fas ${s.icon} text-white fs-4`}></i>
                  </div>
                  <h4 className="mb-0">{s.count}</h4>
                  <small className="text-muted">{s.title}</small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filtres */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder="Rechercher un membre..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
                  <option value="Tous">Tous les statuts</option>
                  <option value="actif">Actif</option>
                  <option value="inactif">En attente</option>
                  <option value="suspendu">Suspendu</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="Tous">Tous les rôles</option>
                  <option value="admin">Admin</option>
                  <option value="membre">Membre</option>
                  <option value="moderateur">Modérateur</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button variant="outline-secondary" onClick={clearFilters}>
                  Réinitialiser
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tableau */}
        <Card className="shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" style={{ width: "3rem", height: "3rem" }}></div>
              </div>
            ) : (
              <Table hover responsive>
                <thead className="bg-primary text-white">
                  <tr>
                    <th>#</th>
                    <th>Avatar</th>
                    <th>Membre</th>
                    <th>Rôle</th>
                    <th>Email</th>
                    <th>Statut</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembres.map((m) => (
                    <tr key={m.id}>
                      <td>{m.id}</td>
                      <td>
                        {m.avatar ? (
                          <Image src={m.avatar} roundedCircle width={45} height={45} style={{ objectFit: "cover" }} />
                        ) : (
                          <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white" style={{ width: 45, height: 45 }}>
                            <i className="fas fa-user"></i>
                          </div>
                        )}
                      </td>
                      <td>
                        <strong>{m.nom}</strong>
                        <br />
                        <small className="text-muted">Inscrit le {new Date(m.created_at).toLocaleDateString()}</small>
                      </td>
                      <td>{getTypeBadge(m.type)}</td>
                      <td>{m.email}</td>
                      <td>{getStatusBadge(m.statut)}</td>
                      <td>
                        <Button size="sm" variant="outline-warning" onClick={() => openEditModal(m)} className="me-2">
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(m.id)}>
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              {currentMembre.id ? "Modifier le membre" : "Nouveau membre"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Nom complet *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom"
                      value={currentMembre.nom || ""}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Rôle *</Form.Label>
                    <Form.Select name="type" value={currentMembre.type} onChange={handleChange}>
                      <option value="membre">Membre</option>
                      <option value="admin">Administrateur</option>
                      <option value="moderateur">Modérateur</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={currentMembre.email || ""}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mot de passe {currentMembre.id ? "(laisser vide si inchangé)" : "*"}</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={currentMembre.password || ""}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Statut *</Form.Label>
                    <Form.Select name="statut" value={currentMembre.statut} onChange={handleChange}>
                      <option value="actif">Actif</option>
                      <option value="inactif">En attente</option>
                      <option value="suspendu">Suspendu</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Avatar (max 2 Mo)</Form.Label>
                    <Form.Control type="file" name="avatar" accept="image/*" onChange={handleChange} />
                    {avatarError && <small className="text-danger">{avatarError}</small>}
                    {currentMembre.avatar && (
                      <div className="mt-3 text-center position-relative d-inline-block">
                        <Image
                          src={typeof currentMembre.avatar === "string" ? currentMembre.avatar : URL.createObjectURL(currentMembre.avatar)}
                          roundedCircle
                          width={100}
                          height={100}
                          className="border"
                        />
                        <Button variant="danger" size="sm" className="position-absolute top-0 end-0 rounded-circle" onClick={removeAvatar}>
                          ×
                        </Button>
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleSave}>
              {currentMembre.id ? "Enregistrer" : "Créer"}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default MembrePage;