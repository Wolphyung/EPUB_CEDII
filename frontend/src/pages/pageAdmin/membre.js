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
  Dropdown,
} from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";
import {
  fetchMembres,
  addMembre,
  updateMembre,
  deleteMembre,
  fetchAbonnements,
  addAbonnement,
  fetchAbonnementsByMembre,
  checkMembreAbonnement,
} from "../../services/api";
import { useTranslation } from "react-i18next";

const MembrePage = () => {
  const { t } = useTranslation();

  const [membres, setMembres] = useState([]);
  const [membresAvecAbonnement, setMembresAvecAbonnement] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showAbonnementModal, setShowAbonnementModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");
  const [filterAbonnement, setFilterAbonnement] = useState("Tous");
  
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

  const [currentAbonnement, setCurrentAbonnement] = useState({
    membre_id: "",
    membre_nom: "",
    type_abonnement: "mensuel",
    date_debut: new Date().toISOString().split("T")[0],
    date_fin: "",
    statut: "actif",
    montant: "9.99",
    methode_paiement: "Carte",
    notes: "",
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

      // Charger les informations d'abonnement pour chaque membre
      await loadAbonnementsMembres(membresNormalises);
    } catch (err) {
      console.error("Erreur chargement membres:", err);
      showNotification("error", t("error_load_members") || t("error_load"));
    } finally {
      setLoading(false);
    }
  };

  const loadAbonnementsMembres = async (membresList) => {
    try {
      const membresAvecInfo = await Promise.all(
        membresList.map(async (membre) => {
          try {
            const res = await checkMembreAbonnement(membre.id);
            const abonnementInfo = res.data.data;
            
            return {
              ...membre,
              abonnement_info: abonnementInfo || null,
              has_abonnement: res.data.has_abonnement || false,
              abonnement_valide: abonnementInfo ? 
                new Date(abonnementInfo.date_fin) > new Date() && abonnementInfo.statut === 'actif' 
                : false,
              jours_restants: abonnementInfo ? 
                Math.ceil((new Date(abonnementInfo.date_fin) - new Date()) / (1000 * 60 * 60 * 24))
                : 0,
            };
          } catch (error) {
            console.error(`Erreur chargement abonnement membre ${membre.id}:`, error);
            return {
              ...membre,
              abonnement_info: null,
              has_abonnement: false,
              abonnement_valide: false,
              jours_restants: 0,
            };
          }
        })
      );
      
      setMembresAvecAbonnement(membresAvecInfo);
    } catch (error) {
      console.error("Erreur chargement abonnements:", error);
      setMembresAvecAbonnement(membresList.map(m => ({
        ...m,
        abonnement_info: null,
        has_abonnement: false,
        abonnement_valide: false,
        jours_restants: 0,
      })));
    }
  };

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ ...showAlert, show: false }), 4000);
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

  const openAbonnementModal = (membre) => {
    setCurrentAbonnement({
      membre_id: membre.id,
      membre_nom: `${membre.nom} ${membre.prenom}`,
      type_abonnement: "mensuel",
      date_debut: new Date().toISOString().split("T")[0],
      date_fin: "",
      statut: "actif",
      montant: "9.99",
      methode_paiement: "Carte",
      notes: "",
    });
    calculateDatesAndPrice();
    setShowAbonnementModal(true);
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

  const handleAbonnementChange = (e) => {
    const { name, value } = e.target;
    setCurrentAbonnement(prev => ({
      ...prev,
      [name]: value,
    }));

    if (name === "type_abonnement" || name === "date_debut") {
      calculateDatesAndPrice();
    }
  };

  const calculateDatesAndPrice = () => {
    const dateDebut = new Date(currentAbonnement.date_debut);
    let dateFin = new Date(dateDebut);
    let montant = "9.99";

    switch (currentAbonnement.type_abonnement) {
      case "mensuel":
        dateFin.setMonth(dateFin.getMonth() + 1);
        montant = "9.99";
        break;
      case "trimestriel":
        dateFin.setMonth(dateFin.getMonth() + 3);
        montant = "24.99";
        break;
      case "annuel":
        dateFin.setFullYear(dateFin.getFullYear() + 1);
        montant = "89.99";
        break;
    }

    setCurrentAbonnement(prev => ({
      ...prev,
      date_fin: dateFin.toISOString().split("T")[0],
      montant,
    }));
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

  const handleSaveAbonnement = async () => {
    try {
      if (!currentAbonnement.membre_id) {
        showNotification("error", "Veuillez sélectionner un membre");
        return;
      }

      const abonnementData = {
        membre_id: currentAbonnement.membre_id,
        type_abonnement: currentAbonnement.type_abonnement,
        date_debut: currentAbonnement.date_debut,
        montant: currentAbonnement.montant,
        methode_paiement: currentAbonnement.methode_paiement,
        statut: currentAbonnement.statut,
        notes: currentAbonnement.notes || `Abonnement créé depuis l'admin pour ${currentAbonnement.membre_nom}`
      };

      await addAbonnement(abonnementData);
      showNotification("success", "Abonnement créé avec succès");
      loadMembres();
      setShowAbonnementModal(false);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach(err => showNotification("error", err));
      } else {
        showNotification("error", error.response?.data?.message || "Erreur serveur");
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

  const getAbonnementBadge = (membre) => {
    if (!membre.has_abonnement || !membre.abonnement_info) {
      return (
        <Badge bg="secondary" className="px-3 py-2">
          <i className="fas fa-times-circle me-2"></i> Sans abonnement
        </Badge>
      );
    }

    const now = new Date();
    const dateFin = new Date(membre.abonnement_info.date_fin);
    const isExpired = dateFin < now;
    const joursRestants = Math.ceil((dateFin - now) / (1000 * 60 * 60 * 24));

    if (isExpired || membre.abonnement_info.statut !== 'actif') {
      return (
        <Badge bg="danger" className="px-3 py-2">
          <i className="fas fa-clock me-2"></i> Expiré
        </Badge>
      );
    }

    if (joursRestants <= 7) {
      return (
        <Badge bg="warning" className="px-3 py-2">
          <i className="fas fa-exclamation-triangle me-2"></i> Expire dans {joursRestants} j
        </Badge>
      );
    }

    return (
      <Badge bg="success" className="px-3 py-2">
        <i className="fas fa-check-circle me-2"></i> Valide ({joursRestants} j)
      </Badge>
    );
  };

  const getAbonnementDetails = (membre) => {
    if (!membre.has_abonnement || !membre.abonnement_info) {
      return <small className="text-muted">Aucun abonnement</small>;
    }

    const dateFin = new Date(membre.abonnement_info.date_fin);
    const formattedDate = dateFin.toLocaleDateString("fr-FR");
    
    return (
      <div>
        <small className="text-muted">
          {membre.abonnement_info.type_abonnement} - Jusqu'au {formattedDate}
        </small>
      </div>
    );
  };

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

  const filteredMembres = membresAvecAbonnement.filter(membre => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (membre.nom?.toLowerCase().includes(search) ||
        membre.prenom?.toLowerCase().includes(search) ||
        membre.email?.toLowerCase().includes(search) ||
        membre.type?.toLowerCase().includes(search));

    const matchesStatut =
      filterStatut === "Tous" || membre.statut === filterStatut.toLowerCase();
    
    const matchesType =
      filterType === "Tous" || membre.type === filterType.toLowerCase();

    const matchesAbonnement = filterAbonnement === "Tous" || 
      (filterAbonnement === "Avec abonnement" && membre.has_abonnement && membre.abonnement_valide) ||
      (filterAbonnement === "Sans abonnement" && !membre.has_abonnement) ||
      (filterAbonnement === "Expire" && membre.has_abonnement && !membre.abonnement_valide);

    return matchesSearch && matchesStatut && matchesType && matchesAbonnement;
  });

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatut("Tous");
    setFilterType("Tous");
    setFilterAbonnement("Tous");
  };

  const removeAvatar = () => {
    setCurrentMembre({ ...currentMembre, avatar: null });
    setAvatarError("");
  };

  // Statistiques supplémentaires pour les abonnements
  const statsAbonnements = {
    avec_abonnement: membresAvecAbonnement.filter(m => m.has_abonnement && m.abonnement_valide).length,
    sans_abonnement: membresAvecAbonnement.filter(m => !m.has_abonnement).length,
    expire: membresAvecAbonnement.filter(m => m.has_abonnement && !m.abonnement_valide).length,
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
          <div>
            <Button variant="primary" onClick={openAddModal} className="shadow me-2">
              <i className="fas fa-user-plus me-2"></i> {t("new_member_button")}
            </Button>
            <Button variant="success" onClick={() => openAbonnementModal({ id: "", nom: "Sélectionner un membre", prenom: "" })} className="shadow">
              <i className="fas fa-credit-card me-2"></i> Nouvel abonnement
            </Button>
          </div>
        </div>

        {/* Stats */}
        <Row className="mb-4">
          {[
            { title: "total", count: membres.length, icon: "fa-users", color: "#667eea" },
            { title: "active", count: membres.filter(m => m.statut === "actif").length, icon: "fa-user-check", color: "#00b09b" },
            { title: "avec_abonnement", count: statsAbonnements.avec_abonnement, icon: "fa-credit-card", color: "#4cd964" },
            { title: "sans_abonnement", count: statsAbonnements.sans_abonnement, icon: "fa-credit-card", color: "#fd746c" },
          ].map((s, i) => (
            <Col md={3} key={i}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="text-center">
                  <div className="rounded-circle mx-auto mb-3" style={{ width: 60, height: 60, background: s.color }}>
                    <i className={`fas ${s.icon} text-white fs-4`}></i>
                  </div>
                  <h4 className="mb-0">{s.count}</h4>
                  <small className="text-muted">
                    {s.title === "avec_abonnement" ? "Avec abonnement" : 
                     s.title === "sans_abonnement" ? "Sans abonnement" : 
                     t(s.title)}
                  </small>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filtres */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Control
                  type="text"
                  placeholder={t("search_member_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={2}>
                <Form.Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)}>
                  <option value="Tous">{t("all_status")}</option>
                  <option value="actif">{t("Actif")}</option>
                  <option value="inactif">{t("En attente")}</option>
                  <option value="suspendu">{t("Suspendu")}</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="Tous">{t("all_roles")}</option>
                  <option value="admin">{t("admin_label")}</option>
                  <option value="membre">{t("member_label")}</option>
                  <option value="moderateur">{t("moderator_label")}</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Form.Select value={filterAbonnement} onChange={(e) => setFilterAbonnement(e.target.value)}>
                  <option value="Tous">Tous abonnements</option>
                  <option value="Avec abonnement">Avec abonnement</option>
                  <option value="Sans abonnement">Sans abonnement</option>
                  <option value="Expire">Abonnement expiré</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button variant="outline-secondary" onClick={clearFilters} className="me-2">
                  {t("reset_filters")}
                </Button>
                <Button variant="info" onClick={loadMembres}>
                  <i className="fas fa-sync-alt me-1"></i> Actualiser
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
                    <th>{t("avatar")}</th>
                    <th>{t("member")}</th>
                    <th>{t("role")}</th>
                    <th>{t("email")}</th>
                    <th>{t("status")}</th>
                    <th>État abonnement</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMembres.map((m) => (
                    <tr key={m.id}>
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
                        <strong>{m.nom} {m.prenom}</strong>
                        <br />
                        <small className="text-muted">{t("registered_on")} {new Date(m.created_at).toLocaleDateString()}</small>
                      </td>
                      <td>{getTypeBadge(m.type)}</td>
                      <td>{m.email}</td>
                      <td>{getStatusBadge(m.statut)}</td>
                      <td>
                        {getAbonnementBadge(m)}
                        {getAbonnementDetails(m)}
                      </td>
                      <td>
                        <Dropdown>
                          <Dropdown.Toggle variant="outline-primary" size="sm" id="dropdown-actions">
                            <i className="fas fa-cog"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Item onClick={() => openEditModal(m)}>
                              <i className="fas fa-edit me-2"></i>
                              {t("edit")}
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => openAbonnementModal(m)}>
                              <i className="fas fa-credit-card me-2"></i>
                              {m.has_abonnement ? "Renouveler abonnement" : "Ajouter abonnement"}
                            </Dropdown.Item>
                            <Dropdown.Divider />
                            <Dropdown.Item onClick={() => handleDelete(m.id)} className="text-danger">
                              <i className="fas fa-trash me-2"></i>
                              {t("delete")}
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                      </td>
                    </tr>
                  ))}
                  {filteredMembres.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-4">
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

        {/* Modal Membre */}
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

        {/* Modal Abonnement */}
        <Modal show={showAbonnementModal} onHide={() => setShowAbonnementModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>
              <i className="fas fa-credit-card me-2"></i>
              {currentAbonnement.membre_id ? `Abonnement pour ${currentAbonnement.membre_nom}` : "Nouvel abonnement"}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Membre *</Form.Label>
                    <Form.Select
                      name="membre_id"
                      value={currentAbonnement.membre_id}
                      onChange={(e) => {
                        const selectedMembre = membres.find(m => m.id == e.target.value);
                        setCurrentAbonnement(prev => ({
                          ...prev,
                          membre_id: e.target.value,
                          membre_nom: selectedMembre ? `${selectedMembre.nom} ${selectedMembre.prenom}` : ""
                        }));
                      }}
                      required
                    >
                      <option value="">Sélectionner un membre</option>
                      {membres.map((membre) => (
                        <option key={membre.id} value={membre.id}>
                          {membre.nom} {membre.prenom} ({membre.email})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Type d'abonnement *</Form.Label>
                    <Form.Select
                      name="type_abonnement"
                      value={currentAbonnement.type_abonnement}
                      onChange={handleAbonnementChange}
                      required
                    >
                      <option value="mensuel">Mensuel - 9.99€</option>
                      <option value="trimestriel">Trimestriel - 24.99€</option>
                      <option value="annuel">Annuel - 89.99€</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date de début *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_debut"
                      value={currentAbonnement.date_debut}
                      onChange={handleAbonnementChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date de fin *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_fin"
                      value={currentAbonnement.date_fin}
                      onChange={handleAbonnementChange}
                      required
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Montant *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="montant"
                      value={currentAbonnement.montant}
                      onChange={handleAbonnementChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Méthode de paiement</Form.Label>
                    <Form.Select
                      name="methode_paiement"
                      value={currentAbonnement.methode_paiement}
                      onChange={handleAbonnementChange}
                    >
                      <option value="Carte">Carte bancaire</option>
                      <option value="PayPal">PayPal</option>
                      <option value="Virement">Virement bancaire</option>
                      <option value="Espèces">Espèces</option>
                      <option value="Chèque">Chèque</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Statut *</Form.Label>
                    <Form.Select
                      name="statut"
                      value={currentAbonnement.statut}
                      onChange={handleAbonnementChange}
                      required
                    >
                      <option value="actif">Actif</option>
                      <option value="expiré">Expiré</option>
                      <option value="annulé">Annulé</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ID Transaction</Form.Label>
                    <Form.Control
                      type="text"
                      name="transaction_id"
                      value={currentAbonnement.transaction_id || ""}
                      onChange={handleAbonnementChange}
                      placeholder="TRX-123456"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={currentAbonnement.notes || ""}
                  onChange={handleAbonnementChange}
                  placeholder="Notes supplémentaires..."
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAbonnementModal(false)}>
              Annuler
            </Button>
            <Button variant="success" onClick={handleSaveAbonnement}>
              <i className="fas fa-check me-2"></i>
              Créer l'abonnement
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default MembrePage;