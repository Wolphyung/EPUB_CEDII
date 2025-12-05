import React, { useState, useEffect } from "react";
import {
  Card,
  Row,
  Col,
  Table,
  Button,
  Modal,
  Form,
  Alert,
  Badge,
  Dropdown,
  ProgressBar,
  DropdownButton,
} from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";
import {
  fetchAbonnements,
  fetchMembres,
  addAbonnement,
  updateAbonnement,
  deleteAbonnement,
  getAbonnementStats,
} from "../../services/api";
import { useTranslation } from "react-i18next";

const AbonnementPage = () => {
  const { t } = useTranslation();

  const [abonnements, setAbonnements] = useState([]);
  const [membres, setMembres] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    actifs: 0,
    expires: 0,
    revenus: 0,
  });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");

  const [currentAbonnement, setCurrentAbonnement] = useState({
    id: null,
    membre_id: "",
    type_abonnement: "mensuel",
    date_debut: new Date().toISOString().split("T")[0],
    date_fin: "",
    statut: "actif",
    montant: "9.99",
    methode_paiement: "Carte",
    notes: "",
  });

  const [renewData, setRenewData] = useState({
    abonnement_id: null,
    type_abonnement: "mensuel",
    montant: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: "", message: "" }), 4000);
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [abonnementRes, membreRes, statsRes] = await Promise.all([
        fetchAbonnements(),
        fetchMembres(),
        getAbonnementStats(),
      ]);

      setAbonnements(abonnementRes.data.data || []);
      setMembres(membreRes.data || []);
      setStats(statsRes.data.data || {});
    } catch (error) {
      showNotification("error", t("error_load_data"));
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentAbonnement((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Calcul automatique de la date de fin et du montant
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

    setCurrentAbonnement((prev) => ({
      ...prev,
      date_fin: dateFin.toISOString().split("T")[0],
      montant,
    }));
  };

  const openAddModal = () => {
    setCurrentAbonnement({
      id: null,
      membre_id: "",
      type_abonnement: "mensuel",
      date_debut: new Date().toISOString().split("T")[0],
      date_fin: "",
      statut: "actif",
      montant: "9.99",
      methode_paiement: "Carte",
      notes: "",
    });
    calculateDatesAndPrice();
    setShowModal(true);
  };

  const openEditModal = (abonnement) => {
    setCurrentAbonnement({
      ...abonnement,
      date_debut: abonnement.date_debut.split("T")[0],
      date_fin: abonnement.date_fin.split("T")[0],
    });
    setShowModal(true);
  };

  const openRenewModal = (abonnement) => {
    setRenewData({
      abonnement_id: abonnement.id,
      type_abonnement: abonnement.type_abonnement,
      montant: abonnement.montant,
    });
    setShowRenewModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (!currentAbonnement.membre_id) {
        showNotification("error", t("select_member_error"));
        return;
      }

      if (currentAbonnement.id) {
        await updateAbonnement(currentAbonnement.id, currentAbonnement);
        showNotification("success", t("subscription_updated"));
      } else {
        await addAbonnement(currentAbonnement);
        showNotification("success", t("subscription_created"));
      }

      loadData();
      setShowModal(false);
    } catch (error) {
      const errors = error.response?.data?.errors;
      if (errors) {
        Object.values(errors).flat().forEach((err) => showNotification("error", err));
      } else {
        showNotification("error", error.response?.data?.message || t("server_error"));
      }
    }
  };

  const handleRenew = async () => {
    try {
      const oldAbonnement = abonnements.find(
        (a) => a.id === renewData.abonnement_id
      );

      const dateDebut = new Date();
      let dateFin = new Date();

      switch (renewData.type_abonnement) {
        case "mensuel":
          dateFin.setMonth(dateFin.getMonth() + 1);
          break;
        case "trimestriel":
          dateFin.setMonth(dateFin.getMonth() + 3);
          break;
        case "annuel":
          dateFin.setFullYear(dateFin.getFullYear() + 1);
          break;
      }

      await addAbonnement({
        membre_id: oldAbonnement.membre_id,
        type_abonnement: renewData.type_abonnement,
        date_debut: dateDebut.toISOString().split("T")[0],
        montant: renewData.montant,
        methode_paiement: "Renouvellement",
        notes: `Renouvellement depuis abonnement #${oldAbonnement.id}`,
      });

      await updateAbonnement(oldAbonnement.id, { statut: "expiré" });

      showNotification("success", t("subscription_renewed"));
      loadData();
      setShowRenewModal(false);
    } catch (error) {
      showNotification("error", t("renew_error"));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("delete_confirmation"))) return;

    try {
      await deleteAbonnement(id);
      showNotification("success", t("subscription_deleted"));
      loadData();
    } catch (error) {
      showNotification("error", t("delete_error"));
    }
  };

  // Nouvelle fonction pour changer le membre d'un abonnement
  const handleChangeMembre = async (abonnementId, newMembreId) => {
    try {
      await updateAbonnement(abonnementId, { membre_id: newMembreId });
      showNotification("success", t("member_changed_success"));
      loadData();
    } catch (error) {
      showNotification("error", t("member_change_error"));
    }
  };

  const filteredAbonnements = abonnements.filter((abonnement) => {
    const membre = membres.find((m) => m.id === abonnement.membre_id);
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (membre &&
        (membre.nom.toLowerCase().includes(search) ||
          membre.prenom.toLowerCase().includes(search) ||
          membre.email.toLowerCase().includes(search))) ||
      abonnement.type_abonnement.toLowerCase().includes(search);

    const matchesStatut =
      filterStatut === "Tous" || abonnement.statut === filterStatut;
    const matchesType =
      filterType === "Tous" || abonnement.type_abonnement === filterType;

    return matchesSearch && matchesStatut && matchesType;
  });

  const getMembreInfo = (membreId) => {
    const membre = membres.find((m) => m.id === membreId);
    return membre
      ? `${membre.nom} ${membre.prenom}`
      : t("unknown_member");
  };

  const getStatusBadge = (statut, dateFin) => {
    const isExpired = new Date(dateFin) < new Date();
    const effectiveStatut = isExpired && statut === "actif" ? "expiré" : statut;

    const badges = {
      actif: (
        <Badge bg="success" className="px-3 py-2">
          <i className="fas fa-check-circle me-2"></i> {t("active")}
        </Badge>
      ),
      expiré: (
        <Badge bg="danger" className="px-3 py-2">
          <i className="fas fa-clock me-2"></i> {t("expired")}
        </Badge>
      ),
      annulé: (
        <Badge bg="secondary" className="px-3 py-2">
          <i className="fas fa-ban me-2"></i> {t("cancelled")}
        </Badge>
      ),
    };

    return badges[effectiveStatut] || (
      <Badge bg="warning">{t("unknown_status")}</Badge>
    );
  };

  const getTypeBadge = (type) => {
    const badges = {
      mensuel: (
        <Badge bg="info" className="px-3 py-2">
          <i className="fas fa-calendar-week me-2"></i> {t("monthly")}
        </Badge>
      ),
      trimestriel: (
        <Badge bg="primary" className="px-3 py-2">
          <i className="fas fa-calendar-alt me-2"></i> {t("quarterly")}
        </Badge>
      ),
      annuel: (
        <Badge bg="success" className="px-3 py-2">
          <i className="fas fa-calendar-star me-2"></i> {t("annual")}
        </Badge>
      ),
    };

    return badges[type] || (
      <Badge bg="secondary">{type}</Badge>
    );
  };

  const calculateProgress = (dateDebut, dateFin) => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const now = new Date();

    if (now < start) return 0;
    if (now > end) return 100;

    const total = end - start;
    const elapsed = now - start;
    return Math.round((elapsed / total) * 100);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const joursRestants = (dateFin) => {
    const end = new Date(dateFin);
    const now = new Date();
    const diff = end - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div
      className="d-flex"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      }}
    >
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
            <h2 className="fw-bold mb-2 text-gradient">
              {t("subscription_management")}
            </h2>
            <p className="text-muted">
              <i className="fas fa-credit-card me-2"></i>{" "}
              {t("subscription_management_subtitle")}
            </p>
          </div>
          <Button variant="success" onClick={openAddModal} className="shadow">
            <i className="fas fa-plus-circle me-2"></i>{" "}
            {t("new_subscription")}
          </Button>
        </div>

        {/* Statistiques */}
        <Row className="mb-4">
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div
                  className="rounded-circle mx-auto mb-3"
                  style={{
                    width: 60,
                    height: 60,
                    background: "#667eea",
                  }}
                >
                  <i className="fas fa-credit-card text-white fs-4"></i>
                </div>
                <h4 className="mb-0">{stats.total}</h4>
                <small className="text-muted">{t("total_subscriptions")}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div
                  className="rounded-circle mx-auto mb-3"
                  style={{
                    width: 60,
                    height: 60,
                    background: "#00b09b",
                  }}
                >
                  <i className="fas fa-check-circle text-white fs-4"></i>
                </div>
                <h4 className="mb-0">{stats.actifs}</h4>
                <small className="text-muted">{t("active_subscriptions")}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div
                  className="rounded-circle mx-auto mb-3"
                  style={{
                    width: 60,
                    height: 60,
                    background: "#fd746c",
                  }}
                >
                  <i className="fas fa-clock text-white fs-4"></i>
                </div>
                <h4 className="mb-0">{stats.expires}</h4>
                <small className="text-muted">{t("expired_subscriptions")}</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="text-center">
                <div
                  className="rounded-circle mx-auto mb-3"
                  style={{
                    width: 60,
                    height: 60,
                    background: "#f093fb",
                  }}
                >
                  <i className="fas fa-euro-sign text-white fs-4"></i>
                </div>
                <h4 className="mb-0">{formatCurrency(stats.revenus)}</h4>
                <small className="text-muted">{t("total_revenue")}</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Filtres */}
        <Card className="shadow-sm mb-4">
          <Card.Body>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Control
                  type="text"
                  placeholder={t("search_placeholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filterStatut}
                  onChange={(e) => setFilterStatut(e.target.value)}
                >
                  <option value="Tous">{t("all_status")}</option>
                  <option value="actif">{t("active")}</option>
                  <option value="expiré">{t("expired")}</option>
                  <option value="annulé">{t("cancelled")}</option>
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="Tous">{t("all_types")}</option>
                  <option value="mensuel">{t("monthly")}</option>
                  <option value="trimestriel">{t("quarterly")}</option>
                  <option value="annuel">{t("annual")}</option>
                </Form.Select>
              </Col>
              <Col md={2}>
                <Button
                  variant="outline-secondary"
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatut("Tous");
                    setFilterType("Tous");
                  }}
                >
                  {t("reset_filters")}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Tableau des abonnements */}
        <Card className="shadow-sm">
          <Card.Body>
            {loading ? (
              <div className="text-center py-5">
                <div
                  className="spinner-border text-primary"
                  style={{ width: "3rem", height: "3rem" }}
                ></div>
                <p className="mt-2">{t("loading")}</p>
              </div>
            ) : (
              <Table hover responsive>
                <thead className="bg-primary text-white">
                  <tr>
                    <th>{t("member")}</th>
                    <th>{t("type")}</th>
                    <th>{t("period")}</th>
                    <th>{t("amount")}</th>
                    <th>{t("status")}</th>
                    <th>{t("remaining")}</th>
                    <th>{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAbonnements.map((abonnement) => {
                    const progress = calculateProgress(
                      abonnement.date_debut,
                      abonnement.date_fin
                    );
                    const jours = joursRestants(abonnement.date_fin);

                    return (
                      <tr key={abonnement.id}>
                        <td>
                          <div className="d-flex align-items-center">
                            <div className="me-3">
                              <strong>{getMembreInfo(abonnement.membre_id)}</strong>
                              <br />
                              <small className="text-muted">
                                ID: {abonnement.membre_id}
                              </small>
                            </div>
                            <DropdownButton
                              title={<i className="fas fa-exchange-alt"></i>}
                              variant="outline-secondary"
                              size="sm"
                              onSelect={(membreId) => handleChangeMembre(abonnement.id, membreId)}
                            >
                              <Dropdown.Header>Changer de membre :</Dropdown.Header>
                              {membres.map((membre) => (
                                <Dropdown.Item
                                  key={membre.id}
                                  eventKey={membre.id}
                                  active={membre.id === abonnement.membre_id}
                                >
                                  <div className="d-flex align-items-center">
                                    <div className="me-2">
                                      {membre.avatar ? (
                                        <img
                                          src={membre.avatar}
                                          alt={membre.nom}
                                          width="30"
                                          height="30"
                                          className="rounded-circle"
                                        />
                                      ) : (
                                        <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white"
                                          style={{ width: 30, height: 30 }}>
                                          <i className="fas fa-user"></i>
                                        </div>
                                      )}
                                    </div>
                                    <div>
                                      <strong>{membre.nom} {membre.prenom}</strong>
                                      <div className="text-muted small">{membre.email}</div>
                                    </div>
                                  </div>
                                </Dropdown.Item>
                              ))}
                              {membres.length === 0 && (
                                <Dropdown.Item disabled>
                                  Aucun membre disponible
                                </Dropdown.Item>
                              )}
                            </DropdownButton>
                          </div>
                        </td>
                        <td>{getTypeBadge(abonnement.type_abonnement)}</td>
                        <td>
                          <div>
                            <small>
                              {formatDate(abonnement.date_debut)} →{" "}
                              {formatDate(abonnement.date_fin)}
                            </small>
                            <ProgressBar
                              now={progress}
                              variant={
                                progress > 90
                                  ? "danger"
                                  : progress > 70
                                  ? "warning"
                                  : "success"
                              }
                              className="mt-2"
                            />
                          </div>
                        </td>
                        <td>
                          <strong>{formatCurrency(abonnement.montant)}</strong>
                          <br />
                          <small className="text-muted">
                            {abonnement.methode_paiement}
                          </small>
                        </td>
                        <td>{getStatusBadge(abonnement.statut, abonnement.date_fin)}</td>
                        <td>
                          {jours > 0 ? (
                            <Badge bg={jours < 7 ? "danger" : "warning"}>
                              {jours} {t("days")}
                            </Badge>
                          ) : (
                            <Badge bg="secondary">{t("expired")}</Badge>
                          )}
                        </td>
                        <td>
                          <Dropdown>
                            <Dropdown.Toggle
                              variant="outline-primary"
                              size="sm"
                              id="dropdown-actions"
                            >
                              <i className="fas fa-cog"></i>
                            </Dropdown.Toggle>
                            <Dropdown.Menu>
                              <Dropdown.Item
                                onClick={() => openEditModal(abonnement)}
                              >
                                <i className="fas fa-edit me-2"></i>
                                {t("edit")}
                              </Dropdown.Item>
                              <Dropdown.Item
                                onClick={() => openRenewModal(abonnement)}
                              >
                                <i className="fas fa-redo me-2"></i>
                                {t("renew")}
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                onClick={() => handleDelete(abonnement.id)}
                                className="text-danger"
                              >
                                <i className="fas fa-trash me-2"></i>
                                {t("delete")}
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredAbonnements.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        <i className="fas fa-credit-card fs-1 text-muted mb-3 d-block"></i>
                        <h5 className="text-muted">{t("no_subscriptions")}</h5>
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            )}
          </Card.Body>
        </Card>

        {/* Modal Ajout/Modification */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-primary text-white">
            <Modal.Title>
              {currentAbonnement.id
                ? t("edit_subscription")
                : t("new_subscription")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("member")} *</Form.Label>
                    <Form.Select
                      name="membre_id"
                      value={currentAbonnement.membre_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">{t("select_member")}</option>
                      {membres.map((membre) => (
                        <option key={membre.id} value={membre.id}>
                          <div className="d-flex align-items-center">
                            {membre.avatar ? (
                              <img
                                src={membre.avatar}
                                alt={membre.nom}
                                width="30"
                                height="30"
                                className="rounded-circle me-2"
                              />
                            ) : (
                              <div className="bg-secondary rounded-circle d-flex align-items-center justify-content-center text-white me-2"
                                style={{ width: 30, height: 30 }}>
                                <i className="fas fa-user"></i>
                              </div>
                            )}
                            <div>
                              <strong>{membre.nom} {membre.prenom}</strong>
                              <div className="text-muted small">{membre.email}</div>
                            </div>
                          </div>
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("subscription_type")} *</Form.Label>
                    <Form.Select
                      name="type_abonnement"
                      value={currentAbonnement.type_abonnement}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="mensuel">{t("monthly")} - 9.99€</option>
                      <option value="trimestriel">
                        {t("quarterly")} - 24.99€
                      </option>
                      <option value="annuel">{t("annual")} - 89.99€</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("start_date")} *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_debut"
                      value={currentAbonnement.date_debut}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("end_date")} *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date_fin"
                      value={currentAbonnement.date_fin}
                      onChange={handleInputChange}
                      required
                      readOnly
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("amount")} *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      name="montant"
                      value={currentAbonnement.montant}
                      onChange={handleInputChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("payment_method")}</Form.Label>
                    <Form.Select
                      name="methode_paiement"
                      value={currentAbonnement.methode_paiement}
                      onChange={handleInputChange}
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
                    <Form.Label>{t("status")} *</Form.Label>
                    <Form.Select
                      name="statut"
                      value={currentAbonnement.statut}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="actif">{t("active")}</option>
                      <option value="expiré">{t("expired")}</option>
                      <option value="annulé">{t("cancelled")}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t("transaction_id")}</Form.Label>
                    <Form.Control
                      type="text"
                      name="transaction_id"
                      value={currentAbonnement.transaction_id || ""}
                      onChange={handleInputChange}
                      placeholder="TRX-123456"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>{t("notes")}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={currentAbonnement.notes || ""}
                  onChange={handleInputChange}
                  placeholder={t("notes_placeholder")}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t("cancel")}
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              {currentAbonnement.id ? t("save") : t("create")}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Renouvellement */}
        <Modal
          show={showRenewModal}
          onHide={() => setShowRenewModal(false)}
          centered
        >
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title>
              <i className="fas fa-redo me-2"></i>
              {t("renew_subscription")}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>{t("renew_confirmation")}</p>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>{t("new_subscription_type")}</Form.Label>
                <Form.Select
                  value={renewData.type_abonnement}
                  onChange={(e) =>
                    setRenewData({
                      ...renewData,
                      type_abonnement: e.target.value,
                    })
                  }
                >
                  <option value="mensuel">{t("monthly")} - 9.99€</option>
                  <option value="trimestriel">
                    {t("quarterly")} - 24.99€
                  </option>
                  <option value="annuel">{t("annual")} - 89.99€</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>{t("amount")} *</Form.Label>
                <Form.Control
                  type="number"
                  step="0.01"
                  value={renewData.montant}
                  onChange={(e) =>
                    setRenewData({
                      ...renewData,
                      montant: e.target.value,
                    })
                  }
                  required
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowRenewModal(false)}
            >
              {t("cancel")}
            </Button>
            <Button variant="success" onClick={handleRenew}>
              <i className="fas fa-check me-2"></i>
              {t("confirm_renew")}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default AbonnementPage;