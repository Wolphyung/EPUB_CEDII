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
      showNotification("error", t("error_load_members") || t("error_load"));
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
        setAvatarError(t("avatar_size_error"));
        e.target.value = "";
        return;
      }
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setAvatarError(t("avatar_format_error"));
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
    if (!currentMembre.nom?.trim()) return showNotification("error", t("name_required"));
    if (!currentMembre.email?.trim()) return showNotification("error", t("email_required"));
    if (!currentMembre.id && !currentMembre.password) return showNotification("error", t("password_required"));
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
        showNotification("success", t("member_updated_success"));
      } else {
        await addMembre(formData);
        showNotification("success", t("member_created_success"));
      }
      loadMembres();
      setShowModal(false);
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) {
        const msg = Object.values(errors).flat().join(", ");
        showNotification("error", msg);
      } else {
        showNotification("error", err.response?.data?.message || t("server_error"));
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("delete_confirmation"))) return;
    try {
      await deleteMembre(id);
      showNotification("success", t("member_deleted_success"));
      loadMembres();
    } catch (err) {
      showNotification("error", t("error_delete"));
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
      actif: { label: t("Actif"), variant: "success", icon: "fa-check-circle" },
      inactif: { label: t("En attente"), variant: "warning", icon: "fa-clock" },
      suspendu: { label: t("Suspendu"), variant: "danger", icon: "fa-ban" },
    };
    const s = map[statut] || { label: t("unknown"), variant: "secondary", icon: "fa-question" };
    return (
      <Badge bg={s.variant} className="px-3 py-2">
        <i className={`fas ${s.icon} me-2`}></i> {s.label}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const map = {
      admin: { label: t("admin_label"), variant: "primary", icon: "fa-crown" },
      membre: { label: t("member_label"), variant: "info", icon: "fa-user" },
      moderateur: { label: t("moderator_label"), variant: "secondary", icon: "fa-user-shield" },
    };
    const tBadge = map[type] || { label: type, variant: "dark", icon: "fa-user" };
    return (
      <Badge bg={tBadge.variant} className="px-3 py-2">
        <i className={`fas ${tBadge.icon} me-2`}></i> {tBadge.label}
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
            <strong>{showAlert.type === "success" ? t("success") : t("error")}</strong>
            <p className="mb-0">{showAlert.message}</p>
          </Alert>
        )}

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2 text-gradient">{t("member_management_title")}</h2>
            <p className="text-muted">
              <i className="fas fa-users me-2"></i> {t("member_management_subtitle")}
            </p>
          </div>
          <Button variant="success" onClick={openAddModal} className="shadow">
            <i className="fas fa-user-plus me-2"></i> {t("new_member_button")}
          </Button>
        </div>

        {/* Stats */}
        <Row className="mb-4">
          {[
            { title: "total", count: membres.length, icon: "fa-users", color: "#667eea" },
            { title: "active", count: membres.filter(m => m.statut === "actif").length, icon: "fa-user-check", color: "#00b09b" },
            { title: "pending", count: membres.filter(m => m.statut === "inactif").length, icon: "fa-clock", color: "#f093fb" },
            { title: "suspended", count: membres.filter(m => m.statut === "suspendu").length, icon: "fa-user-slash", color: "#fd746c" },
          ].map((s, i) => (
            <Col md={3} key={i}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div className="rounded-circle mx-auto mb-3" style={{ width: 60, height: 60, background: s.color }}>
                    <i className={`fas ${s.icon} text-white fs-4`}></i>
                  </div>
                  <h4 className="mb-0">{s.count}</h4>
                  <small className="text-muted">{t(s.title)}</small>
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
                  placeholder={t("search_member_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
                  <option value="Tous">{t("all_status")}</option>
                  <option value="actif">{t("Actif")}</option>
                  <option value="inactif">{t("En attente")}</option>
                  <option value="suspendu">{t("Suspendu")}</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="Tous">{t("all_roles")}</option>
                  <option value="admin">{t("admin_label")}</option>
                  <option value="membre">{t("member_label")}</option>
                  <option value="moderateur">{t("moderator_label")}</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button variant="outline-secondary" onClick={clearFilters}>
                  {t("reset_filters")}
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
                <p className="mt-2">{t("loading")}</p>
              </div>
            ) : (
              <Table hover responsive>
                <thead className="bg-primary text-white">
                  <tr>
                    <th>#</th>
                    <th>{t("avatar")}</th>
                    <th>{t("member")}</th>
                    <th>{t("role")}</th>
                    <th>{t("email")}</th>
                    <th>{t("status")}</th>
                    <th>{t("actions")}</th>
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
                        <small className="text-muted">{t("registered_on")} {new Date(m.created_at).toLocaleDateString()}</small>
                      </td>
                      <td>{getTypeBadge(m.type)}</td>
                      <td>{m.email}</td>
                      <td>{getStatusBadge(m.statut)}</td>
                      <td>
                        <Button size="sm" variant="outline-warning" onClick={() => openEditModal(m)} className="me-2" title={t("edit")}>
                          <i className="fas fa-edit"></i>
                        </Button>
                        <Button size="sm" variant="outline-danger" onClick={() => handleDelete(m.id)} title={t("delete")}>
                          <i className="fas fa-trash"></i>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredMembres.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <i className="fas fa-users fs-1 text-muted mb-3 d-block"></i>
                        <h5 className="text-muted">{t("no_members_found")}</h5>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Modal */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              {currentMembre.id ? t("edit_member_modal") : t("add_member_modal")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("full_name")} *</Form.Label>
                    <Form.Control
                      type="text"
                      name="nom"
                      value={currentMembre.nom || ""}
                      onChange={handleChange}
                      required
                      placeholder={t("full_name_placeholder")}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("role")} *</Form.Label>
                    <Form.Select name="type" value={currentMembre.type} onChange={handleChange}>
                      <option value="membre">{t("member_label")}</option>
                      <option value="admin">{t("admin_label")}</option>
                      <option value="moderateur">{t("moderator_label")}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("email")} *</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={currentMembre.email || ""}
                      onChange={handleChange}
                      required
                      placeholder={t("email_placeholder")}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      {t("password")} {currentMembre.id ? `(${t("password_leave_blank")})` : "*"}
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={currentMembre.password || ""}
                      onChange={handleChange}
                      placeholder={t("password_placeholder")}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("status")} *</Form.Label>
                    <Form.Select name="statut" value={currentMembre.statut} onChange={handleChange}>
                      <option value="actif">{t("Actif")}</option>
                      <option value="inactif">{t("En attente")}</option>
                      <option value="suspendu">{t("Suspendu")}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("avatar")} ({t("max_2mo")})</Form.Label>
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
                        <Button variant="danger" size="sm" className="position-absolute top-0 end-0 rounded-circle" onClick={removeAvatar} title={t("remove_avatar")}>
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
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t("cancel_button")}
            </Button>
            <Button variant="primary" onClick={handleSave}>
              {currentMembre.id ? t("save_button") : t("create_button")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default MembrePage;