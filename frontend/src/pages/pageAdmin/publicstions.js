import React, { useState, useEffect } from "react";
import {
  Button,
  Form,
  Modal,
  Card,
  Row,
  Col,
  Badge,
  InputGroup,
  Alert
} from "react-bootstrap";
import AdminSidebar from "../../components/AdminSidebar";
import {
  fetchPublications,
  addPublication,
  updatePublication,
  deletePublication,
  validatePublication
} from "../../services/api";
import { useTranslation } from 'react-i18next';

const Publication = () => {
  const { t } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedPub, setSelectedPub] = useState({
    id_publication: null,
    titre: "",
    contenu: "",
    type: "Article",
    date_publication: "",
    source: "",
    categorie: "",
    statut: "Validé",
    fichier: null,
    type_fichier: "image",
    auteur: "Admin",
    id_utilisateur: null,
    fichier_url: null,
    nom_fichier_original: null
  });
  const [publications, setPublications] = useState([]);
  const [showAlert, setShowAlert] = useState({ show: false, type: "", message: "" });
  const [filterStatut, setFilterStatut] = useState("Tous");
  const [filterType, setFilterType] = useState("Tous");
  const [loading, setLoading] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  // Définir les catégories avec les traductions
  const categories = [
    t('Technology'), t('Health'), t('Education'), t('Sports'), t('Culture'), 
    t('Economy'), t('Politics'), t('Environment'), t('Science'), t('Travel'), 
    t('Fashion'), t('Cuisine'), t('Automobile'), t('Real Estate'), t('Entertainment')
  ];

  const [newPub, setNewPub] = useState({
    titre: "",
    contenu: "",
    type: "Article",
    date_publication: "",
    source: "",
    categorie: "",
    statut: "Validé",
    fichier: null,
    type_fichier: "image",
    auteur: "Admin",
    id_utilisateur: null
  });

  // FORMAT DATE POUR <input type="date">
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "";
      return date.toISOString().split('T')[0];
    } catch (e) {
      return dateString.split('T')[0] || "";
    }
  };

  // FORMAT DATE POUR L'API
  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return new Date().toISOString().slice(0, 10);
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
    return dateStr.split('T')[0];
  };

  useEffect(() => {
    loadPublications();
  }, []);

  useEffect(() => {
    return () => {
      if (previewFile?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(previewFile.url);
      }
      publications.forEach(pub => {
        if (pub.fichier_url?.startsWith('blob:')) {
          URL.revokeObjectURL(pub.fichier_url);
        }
      });
    };
  }, [previewFile, publications]);

  // CHARGEMENT SÉCURISÉ DES PUBLICATIONS
  const loadPublications = async () => {
    try {
      setLoading(true);
      const res = await fetchPublications();

      // index() retourne un tableau, getPublicationsValidees() retourne { data: [...] }
      const pubs = Array.isArray(res.data)
        ? res.data
        : (res.data?.data || []);

      const validPubs = pubs
        .filter(pub => pub && pub.id_publication && typeof pub.id_publication === 'number')
        .map(pub => ({
          ...pub,
          date_publication: pub.date_publication || "",
          source: pub.source || "",
          categorie: pub.categorie || "",
          type_fichier: pub.type_fichier || "image",
          fichier_url: pub.fichier_url || null,
          nom_fichier_original: pub.nom_fichier_original || null,
          total_reactions: pub.total_reactions || 0,
          vues: pub.vues || 0
        }));

      setPublications(validPubs);
    } catch (err) {
      console.error("Erreur chargement publications:", err);
      showNotification("error", t('error_load'));
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setShowAlert({ show: true, type, message });
    setTimeout(() => setShowAlert({ show: false, type: "", message: "" }), 4000);
  };

  const formatDate = (dateString) => {
    if (!dateString) return t('date_not_defined');
    try {
      const dateOnly = dateString.split(' ')[0];
      const date = new Date(dateOnly);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "fichier") {
      const file = files[0];
      setNewPub({ ...newPub, fichier: file });

      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({ url: fileURL, name: file.name, type: file.type });
        const fileType = getFileTypeFromFile(file);
        setNewPub(prev => ({ ...prev, type_fichier: fileType }));
      } else {
        setPreviewFile(null);
      }
    } else {
      setNewPub({ ...newPub, [name]: value });
    }
  };

  const handleFileTypeChange = (type) => {
    setNewPub({ ...newPub, type_fichier: type, fichier: null });
    setPreviewFile(null);
  };

  const getFileTypeFromFile = (file) => {
    if (!file) return 'image';
    const fileType = file.type;
    if (fileType.startsWith('image/')) return 'image';
    if (fileType.startsWith('video/')) return 'video';
    return 'document';
  };

  // AJOUT CORRIGÉ : res.data.data
  const handleAddPublication = async () => {
    try {
      const formData = new FormData();
      formData.append("titre", newPub.titre);
      formData.append("contenu", newPub.contenu);
      formData.append("type", newPub.type);
      formData.append("date_publication", formatDateForAPI(newPub.date_publication));
      formData.append("source", newPub.source || "");
      formData.append("categorie", newPub.categorie || "");
      formData.append("statut", "Validé");
      formData.append("auteur", newPub.auteur);
      formData.append("id_utilisateur", newPub.id_utilisateur || "");
      formData.append("type_fichier", newPub.type_fichier);

      if (newPub.fichier) formData.append("fichier", newPub.fichier);

      const res = await addPublication(formData);

      const pubData = res.data?.data;
      if (!pubData?.id_publication) {
        throw new Error("ID de publication manquant dans la réponse");
      }

      const addedPub = {
        ...pubData,
        titre: newPub.titre,
        contenu: newPub.contenu,
        type: newPub.type,
        categorie: newPub.categorie,
        statut: "Validé",
        auteur: "Admin",
        date_publication: formatDateForAPI(newPub.date_publication),
        total_reactions: pubData.total_reactions || 0,
        vues: pubData.vues || 0,
        fichier_url: newPub.fichier ? URL.createObjectURL(newPub.fichier) : pubData.fichier_url,
        nom_fichier_original: newPub.fichier?.name || pubData.nom_fichier_original
      };

      setPublications(prev => [addedPub, ...prev]);
      setNewPub({
        titre: "", contenu: "", type: "Article", date_publication: "",
        source: "", categorie: "", statut: "Validé", fichier: null,
        type_fichier: "image", auteur: "Admin", id_utilisateur: null
      });
      setPreviewFile(null);
      setShowModal(false);
      showNotification("success", t('success_add'));
    } catch (err) {
      console.error("Erreur ajout:", err.response?.data || err);
      showNotification("error", t('error_add') + ": " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('delete_confirmation'))) return;
    try {
      await deletePublication(id);
      setPublications(prev => prev.filter(pub => pub.id_publication !== id));
      showNotification("success", t('success_delete'));
    } catch (err) {
      showNotification("error", t('error_delete'));
    }
  };

  const handleValidate = async (id) => {
    try {
      await validatePublication(id);
      loadPublications();
      showNotification("success", t('success_validate'));
    } catch (err) {
      showNotification("error", t('error_validate'));
    }
  };

  const handleEditShow = (pub) => {
    if (!pub || !pub.id_publication || typeof pub.id_publication !== 'number') {
      showNotification("error", t('invalid_publication'));
      return;
    }
    setSelectedPub({
      ...pub,
      date_publication: formatDateForInput(pub.date_publication),
      source: pub.source || "",
      categorie: pub.categorie || "",
      type_fichier: pub.type_fichier || "image",
      fichier_url: pub.fichier_url || null,
      nom_fichier_original: pub.nom_fichier_original || null
    });
    setEditModal(true);
    setPreviewFile(null);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "fichier") {
      const file = files[0];
      setSelectedPub({ ...selectedPub, fichier: file });

      if (file) {
        const fileURL = URL.createObjectURL(file);
        setPreviewFile({ url: fileURL, name: file.name, type: file.type });
        const fileType = getFileTypeFromFile(file);
        setSelectedPub(prev => ({ ...prev, type_fichier: fileType }));
      } else {
        setPreviewFile(null);
      }
    } else {
      setSelectedPub({ ...selectedPub, [name]: value });
    }
  };

  const handleEditFileTypeChange = (type) => {
    setSelectedPub({ ...selectedPub, type_fichier: type, fichier: null });
    setPreviewFile(null);
  };

  const handleSaveEdit = async () => {
    if (!selectedPub?.id_publication) {
      showNotification("error", t('missing_publication_id'));
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titre", selectedPub.titre);
      formData.append("contenu", selectedPub.contenu);
      formData.append("type", selectedPub.type);
      formData.append("date_publication", formatDateForAPI(selectedPub.date_publication));
      formData.append("source", selectedPub.source || "");
      formData.append("categorie", selectedPub.categorie || "");
      formData.append("statut", "Validé");
      formData.append("auteur", selectedPub.auteur);
      formData.append("id_utilisateur", selectedPub.id_utilisateur || "");
      formData.append("type_fichier", selectedPub.type_fichier);

      if (selectedPub.fichier && selectedPub.fichier instanceof File) {
        formData.append("fichier", selectedPub.fichier);
      }

      const res = await updatePublication(selectedPub.id_publication, formData);

      const pubData = res.data?.data || res.data;
      const updatedPub = {
        ...pubData,
        id_publication: selectedPub.id_publication,
        titre: selectedPub.titre,
        contenu: selectedPub.contenu,
        type: selectedPub.type,
        categorie: selectedPub.categorie,
        type_fichier: selectedPub.type_fichier,
        fichier_url: selectedPub.fichier instanceof File
          ? URL.createObjectURL(selectedPub.fichier)
          : selectedPub.fichier_url,
        nom_fichier_original: selectedPub.fichier?.name || selectedPub.nom_fichier_original,
        date_publication: formatDateForInput(selectedPub.date_publication),
        total_reactions: pubData.total_reactions || selectedPub.total_reactions || 0,
        vues: pubData.vues || selectedPub.vues || 0
      };

      setPublications(prev => prev.map(pub =>
        pub.id_publication === selectedPub.id_publication ? updatedPub : pub
      ));

      setEditModal(false);
      setPreviewFile(null);
      showNotification("success", t('success_edit'));
    } catch (err) {
      console.error("Erreur modification:", err.response || err);
      showNotification("error", t('error_edit') + ": " + (err.response?.data?.message || err.message));
    }
  };

  const getStatusVariant = (statut) => {
    switch (statut) {
      case "Validé": return "success";
      case "En attente": return "warning";
      case "Brouillon": return "secondary";
      case "Rejeté": return "danger";
      default: return "primary";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "Article": return "fa-file-alt";
      case "Annonce": return "fa-bullhorn";
      default: return "fa-file";
    }
  };

  const displayFile = (pub) => {
    if (!pub) return null;
    if (pub.fichier_url && pub.fichier_url.startsWith('blob:')) return pub.fichier_url;
    if (pub.fichier_url && typeof pub.fichier_url === 'string') return pub.fichier_url;
    if (pub.fichier && typeof pub.fichier === 'string') {
      if (pub.fichier.startsWith('http')) return pub.fichier;
      return `/storage/${pub.fichier}`;
    }
    return null;
  };

  const getFileType = (pub) => {
    if (!pub) return 'document';
    if (pub.type_fichier) return pub.type_fichier;
    const fileUrl = displayFile(pub);
    if (!fileUrl) return 'document';
    if (/\.(jpe?g|png|gif|bmp|webp)$/i.test(fileUrl)) return 'image';
    if (/\.(mp4|webm|ogg)$/i.test(fileUrl)) return 'video';
    return 'document';
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return 'fa-file';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const icons = {
      pdf: 'fa-file-pdf', doc: 'fa-file-word', docx: 'fa-file-word',
      xls: 'fa-file-excel', xlsx: 'fa-file-excel',
      ppt: 'fa-file-powerpoint', pptx: 'fa-file-powerpoint',
      jpg: 'fa-file-image', jpeg: 'fa-file-image', png: 'fa-file-image',
      gif: 'fa-file-image', bmp: 'fa-file-image',
      mp4: 'fa-file-video', avi: 'fa-file-video', mov: 'fa-file-video',
      zip: 'fa-file-archive', rar: 'fa-file-archive',
      txt: 'fa-file-alt'
    };
    return icons[ext] || 'fa-file';
  };

  const getFileBadgeVariant = (fileName) => {
    if (!fileName) return 'secondary';
    const ext = fileName.split('.').pop()?.toLowerCase();
    const variants = { pdf: 'danger', doc: 'primary', docx: 'primary', xls: 'success', xlsx: 'success' };
    return variants[ext] || 'secondary';
  };

  const handleDownloadFile = async (pub) => {
    try {
      const fileUrl = displayFile(pub);
      if (!fileUrl) throw new Error("URL manquante");

      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = pub.nom_fichier_original || 'fichier';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification("success", t('success_download'));
    } catch (error) {
      showNotification("error", t('error_download'));
    }
  };

  const FilePreview = ({ file }) => {
    const { t } = useTranslation();
    
    if (!file) return null;
    const isImage = file.type.startsWith('image/');
    const isPDF = file.type === 'application/pdf';

    return (
      <div className="mt-3 p-3 border rounded" style={{ background: '#f8f9fa' }}>
        <h6 className="mb-3">{t('preview_file')}</h6>
        {isImage ? (
          <div className="text-center">
            <img src={file.url} alt="Aperçu" style={{ maxWidth: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '8px' }} />
            <p className="mt-2 mb-0 small text-muted">{file.name}</p>
          </div>
        ) : isPDF ? (
          <div className="text-center">
            <iframe src={file.url} title="PDF" style={{ width: '100%', height: '300px', border: 'none', borderRadius: '8px' }} />
            <p className="mt-2 mb-0 small text-muted">{file.name}</p>
          </div>
        ) : (
          <div className="text-center">
            <i className={`fas ${getFileIcon(file.name)} fa-3x text-${getFileBadgeVariant(file.name)} mb-2`}></i>
            <p className="mb-0 small text-muted">{file.name}</p>
            <p className="small text-muted">{t('preview_not_available')}</p>
          </div>
        )}
      </div>
    );
  };

  const filteredPubs = publications.filter((pub) => {
    const matchesSearch = pub.titre?.toLowerCase().includes(search.toLowerCase());
    const matchesStatut = filterStatut === "Tous" || pub.statut === filterStatut;
    const matchesType = filterType === "Tous" || pub.type === filterType;
    return matchesSearch && matchesStatut && matchesType;
  });

  const clearFilters = () => {
    setSearch("");
    setFilterStatut("Tous");
    setFilterType("Tous");
  };

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)" }}>
      <AdminSidebar />

      <div className="flex-grow-1 p-4" style={{ marginLeft: "280px" }}>
        {showAlert.show && (
          <Alert variant={showAlert.type === "success" ? "success" : "danger"} className="d-flex align-items-center shadow-lg border-0"
            style={{ position: "fixed", top: "20px", right: "20px", zIndex: 1050, minWidth: "350px", borderRadius: "15px", borderLeft: `4px solid ${showAlert.type === "success" ? "#28a745" : "#dc3545"}`, backdropFilter: "blur(10px)", backgroundColor: "rgba(255, 255, 255, 0.95)" }}>
            <i className={`fas ${showAlert.type === "success" ? "fa-check-circle text-success" : "fa-exclamation-triangle text-danger"} me-3 fs-5`}></i>
            <div>
              <strong className="d-block">{showAlert.type === "success" ? t('success') : t('error')}</strong>
              <span className="text-muted">{showAlert.message}</span>
            </div>
          </Alert>
        )}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold mb-2" style={{ background: "linear-gradient(135deg, #2c3e50, #34495e)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t('publication_management_title')}
            </h2>
            <p className="text-muted mb-0 d-flex align-items-center"><i className="fas fa-newspaper me-2"></i>{t('publication_management_subtitle')}</p>
          </div>
          <Button variant="success" onClick={() => setShowModal(true)} className="d-flex align-items-center shadow-sm"
            style={{ background: "linear-gradient(135deg, #00b09b, #96c93d)", border: "none", borderRadius: "12px", padding: "12px 24px", fontWeight: "600" }}>
            <i className="fas fa-plus me-2"></i>{t('new_publication_button')}
          </Button>
        </div>

        <Row className="mb-4">
          {[
            { id: "total", title: "total_publications", count: publications.length, icon: "fa-newspaper", color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
            { id: "files", title: "with_files", count: publications.filter(p => displayFile(p)).length, icon: "fa-paperclip", color: "linear-gradient(135deg, #00b09b, #96c93d)" },
            { id: "videos", title: "videos", count: publications.filter(p => getFileType(p) === 'video').length, icon: "fa-video", color: "linear-gradient(135deg, #f093fb, #f5576c)" },
            { id: "images", title: "images", count: publications.filter(p => getFileType(p) === 'image').length, icon: "fa-image", color: "linear-gradient(135deg, #fd746c, #ff9068)" }
          ].map((stat) => (
            <Col md={3} key={stat.id} className="mb-3">
              <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px" }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="card-title text-muted mb-2">{t(stat.title)}</h6>
                      <h2 className="fw-bold mb-0" style={{ background: stat.color, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>{stat.count}</h2>
                    </div>
                    <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: "60px", height: "60px", background: stat.color }}>
                      <i className={`fas ${stat.icon} text-white fs-4`}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "20px" }}>
          <Card.Body className="p-4">
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-search me-2"></i>{t('search')}</Form.Label>
                  <InputGroup>
                    <InputGroup.Text style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none", color: "white" }}><i className="fas fa-search"></i></InputGroup.Text>
                    <Form.Control type="text" placeholder={t('search_placeholder')} value={search} onChange={(e) => setSearch(e.target.value)} style={{ borderRadius: "0 10px 10px 0" }} />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-filter me-2"></i>{t('status_filter')}</Form.Label>
                  <Form.Select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} style={{ borderRadius: "10px" }}>
                    <option value="Tous">{t('all_status')}</option>
                    <option value="Validé">{t('Validé')}</option>
                    <option value="En attente">{t('En attente')}</option>
                    <option value="Brouillon">{t('Brouillon')}</option>
                    <option value="Rejeté">{t('Rejeté')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold text-muted mb-2"><i className="fas fa-tag me-2"></i>{t('type_filter')}</Form.Label>
                  <Form.Select value={filterType} onChange={(e) => setFilterType(e.target.value)} style={{ borderRadius: "10px" }}>
                    <option value="Tous">{t('all_types')}</option>
                    <option value="Article">{t('article')}</option>
                    <option value="Annonce">{t('announcement')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" onClick={loadPublications} style={{ borderRadius: "10px" }}><i className="fas fa-refresh"></i></Button>
                  <Button variant="outline-secondary" onClick={clearFilters} style={{ borderRadius: "10px" }}><i className="fas fa-times"></i></Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
              <span className="visually-hidden">{t('loading')}...</span>
            </div>
            <p className="text-muted fw-semibold">{t('loading_publications')}</p>
          </div>
        ) : (
          <Row>
            {filteredPubs.map((pub) => {
              const fileUrl = displayFile(pub);
              const fileType = getFileType(pub);

              return (
                <Col md={6} lg={4} key={pub.id_publication} className="mb-4">
                  <Card className="border-0 shadow-sm h-100" style={{ borderRadius: "20px", transition: "transform 0.2s" }}>
                    {fileUrl ? (
                      <div style={{ position: "relative" }}>
                        {fileType === 'image' ? (
                          <Card.Img variant="top" src={fileUrl} style={{ height: "200px", objectFit: "cover", borderTopLeftRadius: "20px", borderTopRightRadius: "20px" }}
                            onError={(e) => { e.target.style.display = 'none'; }} />
                        ) : fileType === 'video' ? (
                          <div style={{ height: "200px", background: "#000", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <video src={fileUrl} style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }} controls muted />
                          </div>
                        ) : (
                          <div style={{ height: "200px", background: "linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "20px" }}>
                            <i className={`fas ${getFileIcon(pub.nom_fichier_original)} fa-4x text-muted mb-3`}></i>
                            <p className="small text-muted text-center">{pub.nom_fichier_original || "Document"}</p>
                            <Badge bg="secondary" className="mt-2">PDF</Badge>
                          </div>
                        )}
                        <Badge bg={getStatusVariant(pub.statut)} className="position-absolute top-0 end-0 m-3" style={{ borderRadius: "20px", padding: "6px 12px" }}>
                          <i className={`fas ${pub.statut === "Validé" ? "fa-check" : pub.statut === "En attente" ? "fa-clock" : pub.statut === "Brouillon" ? "fa-edit" : "fa-times"} me-1`}></i>
                          {t(pub.statut)}
                        </Badge>
                      </div>
                    ) : (
                      <div style={{ height: "200px", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", borderTopLeftRadius: "20px", borderTopRightRadius: "20px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                        <div className="text-center text-white">
                          <i className={`fas ${getTypeIcon(pub.type)} fs-1 mb-2 d-block`}></i>
                          <small>{t('no_file')}</small>
                        </div>
                        <Badge bg={getStatusVariant(pub.statut)} className="position-absolute top-0 end-0 m-3" style={{ borderRadius: "20px", padding: "6px 12px" }}>
                          <i className={`fas ${pub.statut === "Validé" ? "fa-check" : "fa-clock"} me-1`}></i>
                          {t(pub.statut)}
                        </Badge>
                      </div>
                    )}
                    <Card.Body className="d-flex flex-column">
                      <div className="mb-3">
                        <div className="d-flex align-items-center mb-2">
                          <i className={`fas ${getTypeIcon(pub.type)} text-primary me-2`}></i>
                          <Badge bg="light" text="dark" style={{ borderRadius: "15px", fontSize: "0.7rem" }}>{t(pub.type.toLowerCase())}</Badge>
                          {pub.categorie && <Badge bg="outline-primary" text="primary" style={{ borderRadius: "15px", fontSize: "0.7rem", marginLeft: "5px" }}>{pub.categorie}</Badge>}
                        </div>
                        <Card.Title className="h5 fw-bold">{pub.titre}</Card.Title>
                      </div>
                      <Card.Text className="text-muted flex-grow-1">{pub.contenu?.length > 120 ? `${pub.contenu.substring(0, 120)}...` : pub.contenu}</Card.Text>
                      <div className="mt-auto">
                        <div className="d-flex justify-content-between align-items-center text-muted small mb-3">
                          <div><i className="fas fa-calendar me-1"></i>{formatDate(pub.date_publication)}</div>
                          <div><i className="fas fa-user me-1"></i>{pub.auteur || "Admin"}</div>
                        </div>
                        {fileUrl && (
                          <div className="mb-3 p-2 border rounded" style={{ background: '#f8f9fa' }}>
                            <div className="d-flex justify-content-between align-items-center">
                              <div className="d-flex align-items-center">
                                <i className={`fas ${getFileIcon(pub.nom_fichier_original)} text-${getFileBadgeVariant(pub.nom_fichier_original)} me-2`}></i>
                                <span className="small">{pub.nom_fichier_original || t('attached_file')}</span>
                              </div>
                              <Button variant="outline-primary" size="sm" onClick={() => handleDownloadFile(pub)} style={{ borderRadius: "6px", fontSize: "0.7rem" }}>
                                <i className="fas fa-download me-1"></i>{t('download')}
                              </Button>
                            </div>
                          </div>
                        )}
                        <div className="d-flex justify-content-between align-items-center">
                          <div className="d-flex gap-2 text-muted small">
                            <span title="Nombre de réactions">
                              <i className="fas fa-heart me-1 text-danger"></i>{pub.total_reactions || 0}
                            </span>
                            <span title="Nombre de vues">
                              <i className="fas fa-eye me-1 text-primary"></i>{pub.vues || 0}
                            </span>
                          </div>
                          <div className="d-flex gap-1">
                            {pub.statut === "En attente" && (
                              <Button variant="success" size="sm" onClick={() => handleValidate(pub.id_publication)} style={{ borderRadius: "8px" }}><i className="fas fa-check"></i></Button>
                            )}
                            <Button variant="outline-warning" size="sm" onClick={() => handleEditShow(pub)} style={{ borderRadius: "8px" }}><i className="fas fa-edit"></i></Button>
                            <Button variant="outline-danger" size="sm" onClick={() => handleDelete(pub.id_publication)} style={{ borderRadius: "8px" }}><i className="fas fa-trash"></i></Button>
                          </div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
            {filteredPubs.length === 0 && (
              <Col md={12}>
                <Card className="border-0 shadow-sm text-center" style={{ borderRadius: "20px" }}>
                  <Card.Body className="py-5">
                    <i className="fas fa-newspaper fs-1 text-muted mb-3 d-block" style={{ opacity: 0.5 }}></i>
                    <h5 className="text-muted mb-2">{t('no_publications_found')}</h5>
                    <Button variant="primary" onClick={clearFilters} className="d-flex align-items-center mx-auto">
                      <i className="fas fa-times me-2"></i>{t('clear_filters')}
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* Modal Ajout */}
        <Modal show={showModal} onHide={() => { setShowModal(false); setPreviewFile(null); }} size="lg" centered>
          <Modal.Header closeButton className="border-0" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
            <Modal.Title className="d-flex align-items-center fw-bold">
              <i className="fas fa-plus me-2"></i>{t('add_publication_modal')}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-heading me-2 text-primary"></i>{t('publication_title')}</Form.Label>
                    <Form.Control type="text" name="titre" value={newPub.titre} onChange={handleChange} required style={{ borderRadius: "10px", padding: "12px" }} placeholder={t('publication_title')} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-chart-line me-2 text-primary"></i>{t('status_label')}</Form.Label>
                    <Form.Control type="text" value={t('Validé')} disabled style={{ borderRadius: "10px", padding: "12px", background: "#e9ecef" }} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted"><i className="fas fa-align-left me-2 text-primary"></i>{t('content_label')}</Form.Label>
                <Form.Control as="textarea" rows={5} name="contenu" value={newPub.contenu} onChange={handleChange} required style={{ borderRadius: "10px", padding: "12px" }} placeholder={t('content_placeholder')} />
              </Form.Group>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-tag me-2 text-primary"></i>{t('type_label')}</Form.Label>
                    <Form.Select name="type" value={newPub.type} onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }}>
                      <option value="Article">{t('article')}</option>
                      <option value="Annonce">{t('announcement')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-folder me-2 text-primary"></i>{t('category_label')}</Form.Label>
                    <Form.Select name="categorie" value={newPub.categorie} onChange={handleChange} required style={{ borderRadius: "10px", padding: "12px" }}>
                      <option value="">{t('select_category')}</option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted">
                      <i className="fas fa-paperclip me-2 text-primary"></i>{t('file_type_label')}
                    </Form.Label>
                    <div className="d-flex gap-2">
                      {['image', 'video', 'document'].map(fileType => (
                        <Button
                          key={fileType}
                          variant={newPub.type_fichier === fileType ? 'primary' : 'outline-primary'}
                          onClick={() => handleFileTypeChange(fileType)}
                          className="d-flex align-items-center"
                          style={{ borderRadius: "10px" }}
                        >
                          <i className={`fas fa-${fileType === 'video' ? 'video' : fileType === 'document' ? 'file' : 'image'} me-2`}></i>
                          {fileType === 'image' ? t('image') : fileType === 'video' ? t('video') : t('document')}
                        </Button>
                      ))}
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold text-muted"><i className="fas fa-calendar me-2 text-primary"></i>{t('publication_date')}</Form.Label>
                    <Form.Control type="date" name="date_publication" value={newPub.date_publication} onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }} />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted">
                  <i className={`fas ${newPub.type_fichier === 'video' ? 'fa-video' : newPub.type_fichier === 'document' ? 'fa-file' : 'fa-image'} me-2 text-primary`}></i>
                  {t('file_label')} {newPub.type_fichier === 'video' ? t('video') : newPub.type_fichier === 'document' ? t('document') : t('image')}
                </Form.Label>
                <Form.Control
                  type="file"
                  name="fichier"
                  accept={newPub.type_fichier === 'video' ? "video/*" : newPub.type_fichier === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" : "image/*"}
                  onChange={handleChange}
                  style={{ borderRadius: "10px", padding: "12px" }}
                />
              </Form.Group>
              <FilePreview file={previewFile} />
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold text-muted"><i className="fas fa-link me-2 text-primary"></i>{t('source_label')}</Form.Label>
                <Form.Control type="text" name="source" value={newPub.source} onChange={handleChange} style={{ borderRadius: "10px", padding: "12px" }} placeholder={t('source_placeholder')} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer className="border-0">
            <Button variant="outline-secondary" onClick={() => { setShowModal(false); setPreviewFile(null); }} style={{ borderRadius: "10px", padding: "10px 20px" }}>
              <i className="fas fa-times me-2"></i>{t('cancel_button')}
            </Button>
            <Button variant="primary" onClick={handleAddPublication} style={{ borderRadius: "10px", padding: "10px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none" }}>
              <i className="fas fa-save me-2"></i>{t('publish_button')}
            </Button>
          </Modal.Footer>
        </Modal>

        {/* Modal Modifier */}
        {selectedPub && (
          <Modal show={editModal} onHide={() => { setEditModal(false); setPreviewFile(null); }} size="lg" centered>
            <Modal.Header closeButton className="border-0" style={{ background: "linear-gradient(135deg, #667eea, #764ba2)", color: "white" }}>
              <Modal.Title className="d-flex align-items-center fw-bold">
                <i className="fas fa-edit me-2"></i>{t('edit_publication_modal')}
              </Modal.Title>
            </Modal.Header>
            <Modal.Body className="p-4">
              <Form>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-heading me-2 text-primary"></i>{t('publication_title')}</Form.Label>
                      <Form.Control type="text" name="titre" value={selectedPub.titre} onChange={handleEditChange} required style={{ borderRadius: "10px", padding: "12px" }} />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-chart-line me-2 text-primary"></i>{t('status_label')}</Form.Label>
                      <Form.Control type="text" value={t('Validé')} disabled style={{ borderRadius: "10px", padding: "12px", background: "#e9ecef" }} />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted"><i className="fas fa-align-left me-2 text-primary"></i>{t('content_label')}</Form.Label>
                  <Form.Control as="textarea" rows={5} name="contenu" value={selectedPub.contenu} onChange={handleEditChange} required style={{ borderRadius: "10px", padding: "12px" }} />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-tag me-2 text-primary"></i>{t('type_label')}</Form.Label>
                      <Form.Select name="type" value={selectedPub.type} onChange={handleEditChange} style={{ borderRadius: "10px", padding: "12px" }}>
                        <option value="Article">{t('article')}</option>
                        <option value="Annonce">{t('announcement')}</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-folder me-2 text-primary"></i>{t('category_label')}</Form.Label>
                      <Form.Select name="categorie" value={selectedPub.categorie} onChange={handleEditChange} required style={{ borderRadius: "10px", padding: "12px" }}>
                        <option value="">{t('select_category')}</option>
                        {categories.map((cat, i) => (
                          <option key={i} value={cat}>{cat}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted">
                        <i className="fas fa-paperclip me-2 text-primary"></i>{t('file_type_label')}
                      </Form.Label>
                      <div className="d-flex gap-2">
                        {['image', 'video', 'document'].map(fileType => (
                          <Button
                            key={fileType}
                            variant={selectedPub.type_fichier === fileType ? 'primary' : 'outline-primary'}
                            onClick={() => handleEditFileTypeChange(fileType)}
                            className="d-flex align-items-center"
                            style={{ borderRadius: "10px" }}
                          >
                            <i className={`fas fa-${fileType === 'video' ? 'video' : fileType === 'document' ? 'file' : 'image'} me-2`}></i>
                            {fileType === 'image' ? t('image') : fileType === 'video' ? t('video') : t('document')}
                          </Button>
                        ))}
                      </div>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-4">
                      <Form.Label className="fw-semibold text-muted"><i className="fas fa-calendar me-2 text-primary"></i>{t('publication_date')}</Form.Label>
                      <Form.Control
                        type="date"
                        name="date_publication"
                        value={formatDateForInput(selectedPub.date_publication)}
                        onChange={handleEditChange}
                        style={{ borderRadius: "10px", padding: "12px" }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted">
                    <i className={`fas ${selectedPub.type_fichier === 'video' ? 'fa-video' : selectedPub.type_fichier === 'document' ? 'fa-file' : 'fa-image'} me-2 text-primary`}></i>
                    {t('file_label')} {selectedPub.type_fichier === 'video' ? t('video') : selectedPub.type_fichier === 'document' ? t('document') : t('image')}
                  </Form.Label>
                  <Form.Control
                    type="file"
                    name="fichier"
                    accept={selectedPub.type_fichier === 'video' ? "video/*" : selectedPub.type_fichier === 'document' ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar" : "image/*"}
                    onChange={handleEditChange}
                    style={{ borderRadius: "10px", padding: "12px" }}
                  />
                  {selectedPub.fichier && !previewFile && (
                    <div className="mt-2">
                      <small className="text-muted d-block">
                        <i className="fas fa-file me-1"></i>{t('current_file')}: {selectedPub.nom_fichier_original || t('attached_file')}
                      </small>
                      <Button variant="outline-primary" size="sm" onClick={() => handleDownloadFile(selectedPub)} style={{ borderRadius: "6px", fontSize: "0.7rem" }} className="mt-1">
                        <i className="fas fa-download me-1"></i>{t('download')}
                      </Button>
                    </div>
                  )}
                </Form.Group>
                <FilePreview file={previewFile} />
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold text-muted"><i className="fas fa-link me-2 text-primary"></i>{t('source_label')}</Form.Label>
                  <Form.Control type="text" name="source" value={selectedPub.source} onChange={handleEditChange} style={{ borderRadius: "10px", padding: "12px" }} />
                </Form.Group>
              </Form>
            </Modal.Body>
            <Modal.Footer className="border-0">
              <Button variant="outline-secondary" onClick={() => { setEditModal(false); setPreviewFile(null); }} style={{ borderRadius: "10px", padding: "10px 20px" }}>
                <i className="fas fa-times me-2"></i>{t('cancel_button')}
              </Button>
              <Button variant="primary" onClick={handleSaveEdit} style={{ borderRadius: "10px", padding: "10px 20px", background: "linear-gradient(135deg, #667eea, #764ba2)", border: "none" }}>
                <i className="fas fa-save me-2"></i>{t('save_button')}
              </Button>
            </Modal.Footer>
          </Modal>
        )}

      </div>
    </div>
  );
};

export default Publication;