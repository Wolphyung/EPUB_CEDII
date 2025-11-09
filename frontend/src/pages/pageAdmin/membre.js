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
} from "../../services/api";
import { useTranslation } from 'react-i18next';

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
    type: "",
    statut: "Actif",
    avatar: null,
    email: "",
    password: "",
  });

  // Charger les membres depuis Laravel
  useEffect(() => {
    loadMembres();
  }, []);

  const loadMembres = async () => {
    try {
      setLoading(true);
      const res = await fetchMembres();
      console.log("🔍 Membres chargés :", res.data);
      setMembres(res.data);
    } catch (err) {
      console.error("Erreur chargement membres:", err);
      showNotification("error", t('error_load_members'));
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => {
      setShowAlert({ show: false, type: "", message: "" });
    }, 4000);
  };

  const openAddModal = () => {
    setCurrentMembre({
      id: null,
      nom: "",
      type: "",
      statut: "Actif",
      avatar: null,
      email: "",
      password: "",
    });
    setShowModal(true);
  };

  const openEditModal = (m) => {
    setCurrentMembre({
      ...m,
      password: "" // Ne pas afficher le mot de passe existant
    });
    setShowModal(true);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "avatar" && files.length > 0) {
      setCurrentMembre({ ...currentMembre, avatar: files[0] });
    } else {
      setCurrentMembre({ ...currentMembre, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("nom", currentMembre.nom);
      formData.append("type", currentMembre.type);
      formData.append("statut", currentMembre.statut);
      formData.append("email", currentMembre.email);
      
      if (currentMembre.password) {
        formData.append("password", currentMembre.password);
      }

      if (currentMembre.avatar && typeof currentMembre.avatar !== "string") {
        formData.append("avatar", currentMembre.avatar);
      }

      if (currentMembre.id) {
        await updateMembre(currentMembre.id, formData);
        showNotification("success", t('success_edit_member'));
      } else {
        await addMembre(formData);
        showNotification("success", t('success_add_member'));
      }

      loadMembres();
      setShowModal(false);
    } catch (err) {
      console.error("Erreur sauvegarde membre:", err.response?.data || err.message);
      showNotification("error", t('error_save_member') + ": " + 
        (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_member_confirmation'))) return;
    try {
      await deleteMembre(id);
      showNotification("success", t('success_delete_member'));
      loadMembres();
    } catch (err) {
      console.error("Erreur suppression:", err);
      showNotification("error", t('error_delete_member'));
    }
  };

  // Filtrer les membres selon la recherche et les filtres
  const filteredMembres = membres.filter(membre => {
    const matchesSearch = 
      membre.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membre.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      membre.type.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatut = filterStatut === "Tous" || membre.statut === filterStatut;
    const matchesType = filterType === "Tous" || membre.type === filterType;
    
    return matchesSearch && matchesStatut && matchesType;
  });

  const getStatusBadge = (statut) => {
    const variants = {
      "Actif": "success",
      "En attente": "warning",
      "Suspendu": "danger"
    };
    return (
      <Badge 
        bg={variants[statut]} 
        className="d-flex align-items-center"
        style={{ 
          borderRadius: "20px",
          padding: "6px 12px",
          fontSize: "0.75rem",
          fontWeight: "600"
        }}
      >
        <i className={`fas ${
          statut === "Actif" ? "fa-check-circle" :
          statut === "En attente" ? "fa-clock" : "fa-ban"
        } me-1`}></i>
        {t(statut)}
      </Badge>
    );
  };

  const getTypeBadge = (type) => {
    const variants = {
      "admin": "primary",
      "membre": "info",
      "moderateur": "secondary"
    };
    const icons = {
      "admin": "fa-crown",
      "membre": "fa-user",
      "moderateur": "fa-user-shield"
    };
    return (
      <Badge 
        bg={variants[type] || "dark"} 
        className="d-flex align-items-center"
        style={{ 
          borderRadius: "20px",
          padding: "6px 12px",
          fontSize: "0.75rem",
          fontWeight: "600"
        }}
      >
        <i className={`fas ${icons[type] || "fa-user"} me-1`}></i>
        {t(type)}
      </Badge>
    );
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatut("Tous");
    setFilterType("Tous");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {/* Alert Notification */}
        {showAlert.show && (
          <Alert 
            variant={showAlert.type === "success" ? "success" : "danger"}
            className="d-flex align-items-center shadow-lg border-0"
            style={{
              position: "fixed",
              top: "20px",
              right: "20px",
              zIndex: 1050,
              minWidth: "350px",
              borderRadius: "15px",
              borderLeft: `4px solid ${showAlert.type === "success" ? "#28a745" : "#dc3545"}`,
              backdropFilter: "blur(10px)",
              backgroundColor: "rgba(255, 255, 255, 0.95)"
            }}
          >
            <i className={`fas ${
              showAlert.type === "success" ? "fa-check-circle text-success" : "fa-exclamation-triangle text-danger"
            } me-3 fs-5`}></i>
            <div>
              <strong className="d-block">
                {showAlert.type === "success" ? t('success') : t('error')}
              </strong>
              <span className="text-muted">{showAlert.message}</span>
            </div>
          </Alert>
        )}

        {/* En-tête de page */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ 
              background: "linear-gradient(135deg, #2c3e50, #34495e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent"
            }}>
              {t('member_management_title')}
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center">
              <i className="fas fa-users me-2"></i>
              {t('member_management_subtitle')}
            </p>
          </div>
          <Button 
            variant="success" 
            onClick={openAddModal} 
            className="d-flex align-items-center shadow-sm"
            style={{
              background: "linear-gradient(135deg, #00b09b, #96c93d)",
              border: "none",
              borderRadius: "12px",
              padding: "12px 24px",
              fontWeight: "600"
            }}
          >
            <i className="fas fa-user-plus me-2"></i>
            {t('new_member_button')}
          </Button>
        </div>

        {/* Cartes de statistiques */}
        <Row className="mb-4">
          {[
            { 
              title: "total_members", 
              count: membres.length, 
              icon: "fa-users", 
              color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              bg: "primary"
            },
            { 
              title: "active_members", 
              count: membres.filter((m) => m.statut === "Actif").length, 
              icon: "fa-user-check", 
              color: "linear-gradient(135deg, #00b09b, #96c93d)",
              bg: "success"
            },
            { 
              title: "pending_members", 
              count: membres.filter((m) => m.statut === "En attente").length, 
              icon: "fa-clock", 
              color: "linear-gradient(135deg, #f093fb, #f5576c)",
              bg: "warning"
            },
            { 
              title: "suspended_members", 
              count: membres.filter((m) => m.statut === "Suspendu").length, 
              icon: "fa-user-slash", 
              color: "linear-gradient(135deg, #fd746c, #ff9068)",
              bg: "danger"
            }
          ].map((stat, index) => (
            <Col md={3} key={index} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2">{t(stat.title)}</h6>
                      <h2 className="fw-bold mb-0" style={{ 
                        background: stat.color,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent"
                      }}>
                        {stat.count}
                      </h2>
                    </div>
                    <div 
                      className="rounded-circle d-flex align-items-center justify-content-center"
                      style={{ 
                        width: "60px", 
                        height: "60px",
                        background: stat.color
                      }}
                    >
                      <i className={`fas ${stat.icon} text-white fs-4`}></i>
                    </div>
                  </div>
                  <div className="mt-3">
                    <small className="text-muted">
                      <i className="fas fa-chart-line me-1"></i>
                      {Math.round((stat.count / Math.max(membres.length, 1)) * 100)}% {t('of_total')}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Barre de recherche et filtres */}
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-search me-2"></i>
                    {t('search')}
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ 
                      background: "linear-gradient(135deg, #667eea, #764ba2)",
                      border: "none",
                      color: "white"
                    }}>
                      <i className="fas fa-search"></i>
                    </InputGroup.Text>
                    <Form.Control
                      type="text"
                      placeholder={t('search_member_placeholder')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{ borderRadius: "0 10px 10px 0" }}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-filter me-2"></i>
                    {t('status_filter')}
                  </Form.Label>
                  <Form.Select
                    value={filterStatut}
                    onChange={(e) => setFilterStatut(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="Tous">{t('all_status')}</option>
                    <option value="Actif">{t('Actif')}</option>
                    <option value="En attente">{t('En attente')}</option>
                    <option value="Suspendu">{t('Suspendu')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2">
                    <i className="fas fa-tag me-2"></i>
                    {t('type_filter')}
                  </Form.Label>
                  <Form.Select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    style={{ borderRadius: "10px" }}
                  >
                    <option value="Tous">{t('all_types')}</option>
                    <option value="admin">{t('admin')}</option>
                    <option value="membre">{t('membre')}</option>
                    <option value="moderateur">{t('moderateur')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              
              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button 
                    variant="outline-primary" 
                    onClick={loadMembres}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-refresh"></i>
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    className="d-flex align-items-center"
                    style={{ borderRadius: "10px" }}
                  >
                    <i className="fas fa-times"></i>
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Table des membres */}
        <Card className="border-0 shadow-sm" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <div>
                <h5 className="fw-bold mb-1">{t('members_list_title')}</h5>
                <span className="text-muted d-flex align-items-center">
                  <i className="fas fa-info-circle me-2"></i>
                  {filteredMembres.length} {t('members_found', { count: filteredMembres.length })}
                </span>
              </div>
              <Dropdown>
                <Dropdown.Toggle 
                  variant="outline-primary" 
                  className="d-flex align-items-center"
                  style={{ borderRadius: "10px" }}
                >
                  <i className="fas fa-download me-2"></i>
                  {t('export')}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item>
                    <i className="fas fa-file-excel me-2 text-success"></i>
                    {t('excel')}
                  </Dropdown.Item>
                  <Dropdown.Item>
                    <i className="fas fa-file-pdf me-2 text-danger"></i>
                    {t('pdf')}
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
                  <span className="visually-hidden">{t('loading')}...</span>
                </div>
                <p className="text-muted fw-semibold">{t('loading_members')}</p>
              </div>
            ) : (
              <div className="table-responsive">
                <Table hover className="align-middle mb-0">
                  <thead style={{ 
                    background: "linear-gradient(135deg, #667eea, #764ba2)",
                    color: "white"
                  }}>
                    <tr>
                      <th style={{ border: "none", padding: "15px", fontWeight: "600" }}>#ID</th>
                      <th style={{ border: "none", padding: "15px", fontWeight: "600" }}>{t('avatar')}</th>
                      <th style={{ border: "none", padding: "15px", fontWeight: "600" }}>{t('member')}</th>
                      <th style={{ border: "none", padding: "15px", fontWeight: "600" }}>{t('type')}</th>
                      <th style={{ border: "none", padding: "15px", fontWeight: "600" }}>{t('contact')}</th>
                      <th style={{ border: "none", padding: "15px", fontWeight: "600" }}>{t('status')}</th>
                      <th style={{ border: "none", padding: "15px", fontWeight: "600", textAlign: "center" }}>{t('actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembres.map((m) => (
                      <tr key={m.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td style={{ padding: "15px" }}>
                          <span className="text-muted fw-semibold">#{m.id}</span>
                        </td>
                        <td style={{ padding: "15px" }}>
                          {m.avatar ? (
                            <Image
                              src={m.avatar.startsWith("http") ? m.avatar : `http://localhost:8000${m.avatar}`}
                              roundedCircle
                              width={50}
                              height={50}
                              alt="Avatar"
                              className="border shadow-sm"
                              style={{ objectFit: "cover" }}
                            />
                          ) : (
                            <div 
                              className="rounded-circle d-flex align-items-center justify-content-center shadow-sm"
                              style={{ 
                                width: "50px", 
                                height: "50px",
                                background: "linear-gradient(135deg, #667eea, #764ba2)",
                                color: "white"
                              }}
                            >
                              <i className="fas fa-user fs-6"></i>
                            </div>
                          )}
                        </td>
                        <td style={{ padding: "15px" }}>
                          <div>
                            <strong className="d-block">{m.nom}</strong>
                            <small className="text-muted">
                              {t('registered_on')} {new Date().toLocaleDateString()}
                            </small>
                          </div>
                        </td>
                        <td style={{ padding: "15px" }}>{getTypeBadge(m.type)}</td>
                        <td style={{ padding: "15px" }}>
                          <div>
                            <div className="d-flex align-items-center mb-1">
                              <i className="fas fa-envelope text-muted me-2"></i>
                              <span>{m.email}</span>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: "15px" }}>{getStatusBadge(m.statut)}</td>
                        <td style={{ padding: "15px", textAlign: "center" }}>
                          <div className="d-flex gap-2 justify-content-center">
                            <Button
                              variant="outline-warning"
                              size="sm"
                              onClick={() => openEditModal(m)}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px" }}
                            >
                              <i className="fas fa-edit me-1"></i>
                              {t('edit')}
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDelete(m.id)}
                              className="d-flex align-items-center"
                              style={{ borderRadius: "8px" }}
                            >
                              <i className="fas fa-trash me-1"></i>
                              {t('delete')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredMembres.length === 0 && (
                      <tr>
                        <td colSpan="7" className="text-center py-5">
                          <div className="py-4">
                            <i className="fas fa-users fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
                            <h5 className="text-muted mb-2">{t('no_members_found')}</h5>
                            <p className="text-muted mb-3">{t('no_members_match')}</p>
                            <Button variant="primary" onClick={clearFilters}>
                              <i className="fas fa-times me-2"></i>
                              {t('clear_filters')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        {/* Modal ajout/modif */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header 
            closeButton 
            className="border-0"
            style={{ 
              background: "linear-gradient(135deg, #667eea, #764ba2)",
              color: "white"
            }}
          >
            <Modal.Title className="d-flex align-items-center fw-bold">
              <i className={`fas ${currentMembre.id ? "fa-edit" : "fa-user-plus"} me-2`}></i>
              {currentMembre.id ? t('edit_member_modal') : t('add_member_modal')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-user me-2 text-primary"></i>
                      {t('full_name')}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="nom"
                      value={currentMembre.nom}
                      onChange={handleChange}
                      placeholder={t('full_name_placeholder')}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-tag me-2 text-primary"></i>
                      {t('type_label')}
                    </Form.Label>
                    <Form.Select
                      name="type"
                      value={currentMembre.type}
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="">{t('select_type')}</option>
                      <option value="admin">{t('admin')}</option>
                      <option value="membre">{t('membre')}</option>
                      <option value="moderateur">{t('moderateur')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-envelope me-2 text-primary"></i>
                      {t('email')}
                    </Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={currentMembre.email}
                      onChange={handleChange}
                      placeholder={t('email_placeholder')}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-lock me-2 text-primary"></i>
                      {t('password')}
                    </Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={currentMembre.password}
                      onChange={handleChange}
                      placeholder={currentMembre.id ? t('password_edit_placeholder') : t('password_placeholder')}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-chart-line me-2 text-primary"></i>
                      {t('status_label')}
                    </Form.Label>
                    <Form.Select
                      name="statut"
                      value={currentMembre.statut}
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      <option value="Actif">{t('Actif')}</option>
                      <option value="En attente">{t('En attente')}</option>
                      <option value="Suspendu">{t('Suspendu')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-camera me-2 text-primary"></i>
                      {t('avatar')}
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="avatar"
                      accept="image/*"
                      onChange={handleChange}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    />
                    {currentMembre.avatar && (
                      <div className="mt-3 text-center">
                        <Image
                          src={
                            typeof currentMembre.avatar === "string"
                              ? currentMembre.avatar
                              : URL.createObjectURL(currentMembre.avatar)
                          }
                          roundedCircle
                          width={80}
                          height={80}
                          className="border shadow-sm"
                          style={{ objectFit: "cover" }}
                        />
                      </div>
                    )}
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button 
              variant="outline-secondary" 
              onClick={() => setShowModal(false)}
              className="d-flex align-items-center"
              style={{ borderRadius: "10px", padding: "10px 20px" }}
            >
              <i className="fas fa-times me-2"></i>
              {t('cancel_button')}
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              className="d-flex align-items-center"
              style={{ 
                borderRadius: "10px", 
                padding: "10px 20px",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                border: "none"
              }}
            >
              <i className="fas fa-save me-2"></i>
              {currentMembre.id ? t('edit_button') : t('add_button')}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
};

export default MembrePage;