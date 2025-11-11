import React, { useState, useEffect } from "react";
import { Card, Button, Modal, Form, Row, Col, Badge, Alert } from "react-bootstrap";
import MembreSidebar from "../../components/MembreSidebar";
import axios from "axios";

// === CONFIGURATION API ===
axios.interceptors.request.use(c => {
  const t = localStorage.getItem('token');
  if (t) c.headers.Authorization = `Bearer ${t}`;
  return c;
});

const API_URL = "http://127.0.0.1:8000/api/appeloffres";

const AppelOffreMembre = () => {
  const [offres, setOffres] = useState([]);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });
  const [editMode, setEditMode] = useState(false);
  const [currentOffre, setCurrentOffre] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [nouvelleOffre, setNouvelleOffre] = useState({
    intitule: "", description: "", date_cloture: "", date_ouverture: "", membre: "", fichier: null,
    statut: "En attente", type: "CDI", localisation: "", salaire: "", est_urgent: false
  });

  // === FONCTIONS UTILITAIRES ===
  const showAlert = (m,t) => { setAlert({show:true,message:m,type:t}); setTimeout(() => setAlert({show:false}),4000); };
  const handleClose = () => { setShowModal(false); setEditMode(false); setCurrentOffre(null); };
  
  const handleShowAdd = () => { 
    setEditMode(false); 
    setCurrentOffre(null); 
    setNouvelleOffre({
      intitule:"",description:"",date_cloture:"",date_ouverture:"",membre:"",fichier:null,
      statut:"En attente",type:"CDI",localisation:"",salaire:"",est_urgent:false
    }); 
    setShowModal(true); 
  };
  
  const handleShowEdit = o => { 
    setEditMode(true); 
    setCurrentOffre(o); 
    setNouvelleOffre({
      intitule:o.intitule,description:o.description,date_cloture:o.date_cloture,
      date_ouverture:o.date_ouverture,membre:o.membre,fichier:null,statut:o.statut,
      type:o.type_contrat||"CDI",localisation:o.localisation||"",
      salaire:o.salaire_remuneration||"",est_urgent:!!o.est_urgent
    }); 
    setShowModal(true); 
  };
  
  const handleChange = e => { const {name,value,type,checked,files}=e.target; setNouvelleOffre(p=>({...p,[name]:type==="file"?files[0]:type==="checkbox"?checked:value})); };

  const badge = (s,c,i) => <Badge bg={c} className="d-flex align-items-center" style={{borderRadius:"20px",padding:"6px 12px",fontSize:"0.75rem",fontWeight:"600"}}><i className={`fas ${i} me-1`}></i>{s}</Badge>;
  const statusBadge = s => badge(s, {Validé:"success","En attente":"warning",Rejeté:"danger",Actif:"primary",Clôturé:"secondary"}[s]||"secondary", {Validé:"fa-check-circle","En attente":"fa-clock",Rejeté:"fa-times-circle",Actif:"fa-play-circle",Clôturé:"fa-flag-checkered"}[s]||"fa-question-circle");
  const typeBadge = t => <Badge bg={{CDI:"success",CDD:"warning",Stage:"info",Freelance:"primary",Alternance:"dark"}[t]||"secondary"} className="px-3 py-2" style={{borderRadius:"15px",fontSize:"0.8rem"}}>{t}</Badge>;
  const format = d => d ? new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'long',year:'numeric'}) : "Date NC";
  const urgent = o => o.est_urgent || (o.date_cloture && new Date(o.date_cloture).setHours(0,0,0,0) - new Date().setHours(0,0,0,0) <= 7*86400000);
  
  // === API ===
  const fetchOffres = async () => {
    setError(null);
    try { setOffres((await axios.get(API_URL)).data); }
    catch { setError("Impossible de charger les appels d'offre. Vérifiez la connexion API."); }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!localStorage.getItem('token')) return showAlert("Connectez-vous d'abord.", "danger");
    setIsSubmitting(true);
    if (!nouvelleOffre.intitule || !nouvelleOffre.date_cloture || !nouvelleOffre.description) {
      showAlert("Champs obligatoires manquants.", "warning"); setIsSubmitting(false); return;
    }

    const f = new FormData();
    ["intitule","description","date_cloture","date_ouverture","membre","statut","type","localisation","salaire"]
      .forEach(k => {
        const apiKey = k === "type" ? "type_contrat" : k === "salaire" ? "salaire_remuneration" : k;
        f.append(apiKey, nouvelleOffre[k] || (k === "membre" ? "Utilisateur Membre" : ""));
      });
    f.append("est_urgent", +nouvelleOffre.est_urgent);
    if (nouvelleOffre.fichier) f.append("fichier", nouvelleOffre.fichier);

    try {
      if (editMode && currentOffre) {
        f.append("_method","PUT");
        await axios.post(`${API_URL}/${currentOffre.id}`, f, { headers: { "Content-Type": "multipart/form-data" }});
        showAlert("Modifié avec succès !", "success");
      } else {
        await axios.post(API_URL, f, { headers: { "Content-Type": "multipart/form-data" }});
        showAlert("Appel d'offre créé !", "success");
      }
      handleClose(); fetchOffres();
    } catch (err) { showAlert(`Erreur: ${err.response?.data?.message || "Échec de l'opération."}`, "danger"); }
    finally { setIsSubmitting(false); }
  };

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const executeDelete = async () => {
    try {
      await axios.delete(`${API_URL}/${deleteId}`);
      showAlert("Supprimé !", "success");
      fetchOffres();
    } catch {
      showAlert("Échec de la suppression.", "danger");
    }
    setShowConfirm(false);
    setDeleteId(null);
  };

  useEffect(() => { fetchOffres(); }, []);
  
  // === CONSTRUCTION URL COMPLÈTE FICHIER ===
  const getFileUrl = (filePath) => {
    if (!filePath) return null;
    // Si c'est déjà une URL complète, la retourner telle quelle
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
      return filePath;
    }
    // Sinon construire l'URL complète
    const baseUrl = "http://127.0.0.1:8000";
    // Ajouter un slash si nécessaire
    const path = filePath.startsWith('/') ? filePath : `/${filePath}`;
    return `${baseUrl}${path}`;
  };

  // === AFFICHAGE FICHIER PROFESSIONNEL (TAILLE COMPACTE) ===
  const renderFile = filePath => {
    if (!filePath) return null;
    
    const fileUrl = getFileUrl(filePath);
    const fileName = filePath.split('/').pop();
    const ext = fileName.split('.').pop().toLowerCase();
    
    if (ext === 'pdf') 
      return (
        <div className="file-compact">
          <div className="file-compact-header">
            <i className="fas fa-file-pdf text-danger"></i>
            <span className="file-compact-name">{fileName}</span>
          </div>
          <div className="file-compact-preview">
            <iframe src={fileUrl} width="100%" height="280" style={{border:"none",borderRadius:"6px"}} title="PDF"/>
          </div>
          <div className="file-compact-actions">
            <Button variant="link" size="sm" href={fileUrl} target="_blank">
              <i className="fas fa-eye me-1"></i>Voir
            </Button>
            <Button variant="link" size="sm" href={fileUrl} download>
              <i className="fas fa-download me-1"></i>Télécharger
            </Button>
          </div>
        </div>
      );
      
    if (['jpg','jpeg','png','gif','webp','svg'].includes(ext)) 
      return (
        <div className="file-compact">
          <div className="file-compact-header">
            <i className="fas fa-image text-info"></i>
            <span className="file-compact-name">{fileName}</span>
          </div>
          <div className="file-compact-preview text-center">
            <img 
              src={fileUrl} 
              alt={fileName} 
              style={{maxHeight:"220px",width:"100%",objectFit:"contain",borderRadius:"6px",cursor:"pointer"}}
              onClick={() => window.open(fileUrl, '_blank')}
            />
          </div>
          <div className="file-compact-actions">
            <Button variant="link" size="sm" onClick={() => window.open(fileUrl, '_blank')}>
              <i className="fas fa-search-plus me-1"></i>Agrandir
            </Button>
            <Button variant="link" size="sm" href={fileUrl} download>
              <i className="fas fa-download me-1"></i>Télécharger
            </Button>
          </div>
        </div>
      );
      
    if (['mp4','webm','ogg','mov'].includes(ext)) 
      return (
        <div className="file-compact">
          <div className="file-compact-header">
            <i className="fas fa-video text-success"></i>
            <span className="file-compact-name">{fileName}</span>
          </div>
          <div className="file-compact-preview">
            <video controls width="100%" style={{maxHeight:"280px",borderRadius:"6px"}}>
              <source src={fileUrl} type={`video/${ext}`}/>
            </video>
          </div>
          <div className="file-compact-actions">
            <Button variant="link" size="sm" href={fileUrl} download>
              <i className="fas fa-download me-1"></i>Télécharger
            </Button>
          </div>
        </div>
      );
      
    if (['doc','docx','xls','xlsx','ppt','pptx'].includes(ext)) {
      const iconMap = {doc:'word',docx:'word',xls:'excel',xlsx:'excel',ppt:'powerpoint',pptx:'powerpoint'};
      const icon = iconMap[ext] || 'file';
      return (
        <div className="file-compact">
          <div className="file-compact-header">
            <i className={`fas fa-file-${icon} text-primary`}></i>
            <span className="file-compact-name">{fileName}</span>
          </div>
          <div className="file-compact-preview text-center py-3">
            <i className={`fas fa-file-${icon}`} style={{fontSize:"2.5rem",color:"#adb5bd"}}></i>
            <p className="text-muted small mb-0 mt-2">Document {ext.toUpperCase()}</p>
          </div>
          <div className="file-compact-actions">
            <Button variant="link" size="sm" href={fileUrl} target="_blank">
              <i className="fas fa-external-link-alt me-1"></i>Ouvrir
            </Button>
            <Button variant="link" size="sm" href={fileUrl} download>
              <i className="fas fa-download me-1"></i>Télécharger
            </Button>
          </div>
        </div>
      );
    }
      
    return (
      <div className="file-compact">
        <div className="file-compact-header">
          <i className="fas fa-file-alt text-secondary"></i>
          <span className="file-compact-name">{fileName}</span>
        </div>
        <div className="file-compact-preview text-center py-3">
          <i className="fas fa-file-alt" style={{fontSize:"2.5rem",color:"#adb5bd"}}></i>
          <p className="text-muted small mb-0 mt-2">Fichier {ext.toUpperCase()}</p>
        </div>
        <div className="file-compact-actions">
          <Button variant="link" size="sm" href={fileUrl} target="_blank">
            <i className="fas fa-external-link-alt me-1"></i>Ouvrir
          </Button>
          <Button variant="link" size="sm" href={fileUrl} download>
            <i className="fas fa-download me-1"></i>Télécharger
          </Button>
        </div>
      </div>
    );
  };

  if (error) return <div className="d-flex justify-content-center align-items-center min-vh-100"><Alert variant="danger" className="shadow-lg p-4" style={{borderRadius:"15px"}}><i className="fas fa-exclamation-triangle me-2"></i><h4>Erreur API</h4><p>{error}</p><hr/><p>Démarrez Laravel: <code>php artisan serve</code></p></Alert></div>;

  return (
    <div className="d-flex min-vh-100" style={{background:"linear-gradient(135deg,#f5f7fa 0%,#c3cfe2 100%)"}}>
      <div style={{width:sidebarCollapsed?"80px":"280px",transition:"width .3s ease",flexShrink:0}}><MembreSidebar onCollapse={v=>setSidebarCollapsed(v)}/></div>
      <div className="flex-grow-1" style={{padding:"30px",transition:"all .3s ease"}}>
        {alert.show && <Alert variant={alert.type} dismissible onClose={()=>setAlert({show:false})} className="mb-4 border-0 shadow" style={{borderRadius:"15px"}}><i className={`fas ${alert.type==="success"?"fa-check-circle":"fa-exclamation-triangle"} me-2`}></i>{alert.message}</Alert>}

        <div className="d-flex justify-content-between align-items-center mb-4">
          <div><h1 className="fw-bold mb-2" style={{color:"#2c3e50",fontSize:"2.2rem"}}>Appels d'Offre</h1><p className="text-muted mb-0" style={{fontSize:"1.1rem"}}>Gérez vos appels d'offre</p></div>
          <Button variant="primary" onClick={handleShowAdd} className="rounded-pill px-4 py-2" style={{background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",border:"none",fontWeight:"600",fontSize:"1rem"}}><i className="fas fa-plus-circle me-2"></i>Nouvel Appel</Button>
        </div>

        <Row className="mb-5">
          {[{n:offres.length,l:"Total",c:"primary",i:"briefcase"},{n:offres.filter(o=>o.statut==="Validé").length,l:"Validées",c:"success",i:"check-circle"},{n:offres.filter(o=>o.statut==="En attente").length,l:"En attente",c:"warning",i:"clock"},{n:offres.filter(urgent).length,l:"Urgents",c:"danger",i:"exclamation-triangle"}].map((s,k)=>
            <Col key={k} xl={3} lg={6} className="mb-4"><Card className="shadow-lg border-0 text-center p-4" style={{borderRadius:"20px"}}><div className={`bg-${s.c} bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3`} style={{width:60,height:60}}><i className={`fas fa-${s.i} text-${s.c} fs-4`}></i></div><h3 className={`fw-bold text-${s.c}`}>{s.n}</h3><p className="text-muted mb-0">{s.l}</p></Card></Col>
          )}
        </Row>

        <Row>
          {offres.length===0 ? <Alert variant="info" className="text-center w-100"><i className="fas fa-info-circle me-2"></i>Aucun appel d'offre trouvé.</Alert> : offres.map(o=>(
            <Col key={o.id} xl={6} lg={6} className="mb-4">
              <Card className="shadow-lg border-0 h-100" style={{borderRadius:"20px",transition:"all .3s ease",overflow:"hidden",borderLeft:`4px solid ${o.est_urgent?"#ff6b6b":o.statut==="Validé"?"#28a745":o.statut==="En attente"?"#ffc107":o.statut==="Rejeté"?"#dc3545":"#6c757d"}`}}
                onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-8px)";e.currentTarget.style.boxShadow="0 12px 35px rgba(0,0,0,.15)"}} onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.boxShadow="0 8px 25px rgba(0,0,0,.1)"}}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <div className="flex-grow-1">
                      <Card.Title className="h5 fw-bold mb-1" style={{lineHeight:"1.3",color:"#2c3e50"}}>{o.intitule}{o.est_urgent&&<Badge bg="danger" className="ms-2"><i className="fas fa-exclamation-triangle me-1"></i>Urgent</Badge>}</Card.Title>
                      {o.type_contrat && typeBadge(o.type_contrat)}
                    </div>
                    {statusBadge(o.statut)}
                  </div>
                  <div className="mb-3">
                    <div className="d-flex align-items-center mb-2"><i className="fas fa-user-tie text-primary me-2"></i><span className="fw-semibold">Membre: {o.membre||"NC"}</span></div>
                    <div className="d-flex align-items-center mb-2"><i className="fas fa-map-marker-alt text-danger me-2"></i><span>{o.localisation||"Non spécifié"}</span></div>
                    <div className="d-flex align-items-center mb-2"><i className="fas fa-money-bill-wave text-success me-2"></i><span className="fw-semibold">{o.salaire_remuneration||"À négocier"}</span></div>
                  </div>
                  <Card.Text className="text-muted mb-4" style={{lineHeight:"1.6",fontSize:"0.95rem"}}>{o.description.length>120?o.description.substring(0,120)+"...":o.description}</Card.Text>

                  {o.fichier && <div className="mb-3">{renderFile(o.fichier)}</div>}

                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="text-end">
                      <div className="fw-semibold" style={{color:urgent(o)?"#ff6b6b":"#6c757d"}}><i className="fas fa-clock me-1"></i>Clôture: {format(o.date_cloture)}</div>
                    </div>
                  </div>

                  <div className="mt-auto pt-3 border-top">
                    <div className="d-flex justify-content-between align-items-center">
                      <div className="d-flex gap-1">
                        {(o.statut==="En attente"||o.statut==="Validé"||o.statut==="Rejeté") && <Button variant={o.statut==="En attente"?"outline-success":"outline-primary"} size="sm" onClick={()=>handleShowEdit(o)} className="d-flex align-items-center" style={{borderRadius:"8px"}} title="Modifier"><i className="fas fa-edit"></i></Button>}
                      </div>
                      <div className="d-flex gap-1">
                        <Button variant="outline-danger" size="sm" onClick={() => confirmDelete(o.id)} className="d-flex align-items-center" style={{borderRadius:"8px"}} title="Supprimer"><i className="fas fa-trash"></i></Button>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Modal show={showModal} onHide={handleClose} centered size="lg" className="modern-modal">
          <Modal.Header className="border-0" style={{background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",color:"white",borderTopLeftRadius:"20px",borderTopRightRadius:"20px"}}>
            <Modal.Title className="fw-bold"><i className="fas fa-briefcase me-2"></i>{editMode?"Modifier":"Créer"} l'appel d'offre</Modal.Title>
            <Button variant="link" onClick={handleClose} className="text-white p-0" style={{fontSize:"1.5rem"}}><i className="fas fa-times"></i></Button>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Form onSubmit={handleSave}>
              <Row>
                <Col md={8}><Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-heading me-2 text-primary"></i>Intitulé *</Form.Label><Form.Control type="text" name="intitule" value={nouvelleOffre.intitule} onChange={handleChange} required className="border-0 shadow-sm rounded-3 py-3" placeholder="Ex: Construction..." style={{background:"#f8f9fa"}}/></Form.Group></Col>
                <Col md={4}><Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-tag me-2 text-success"></i>Type</Form.Label><Form.Select name="type" value={nouvelleOffre.type} onChange={handleChange} className="border-0 shadow-sm rounded-3 py-3" style={{background:"#f8f9fa"}}>{["CDI","CDD","Stage","Freelance","Alternance"].map(t=><option key={t}>{t}</option>)}</Form.Select></Form.Group></Col>
              </Row>
              <Row>
                <Col md={6}><Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-user-tie me-2 text-info"></i>Membre</Form.Label><Form.Control type="text" name="membre" value={nouvelleOffre.membre} onChange={handleChange} className="border-0 shadow-sm rounded-3 py-3" placeholder="Ministère..." style={{background:"#f8f9fa"}}/></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-map-marker-alt me-2 text-danger"></i>Localisation</Form.Label><Form.Control type="text" name="localisation" value={nouvelleOffre.localisation} onChange={handleChange} className="border-0 shadow-sm rounded-3 py-3" placeholder="Ville..." style={{background:"#f8f9fa"}}/></Form.Group></Col>
              </Row>
              <Row>
                <Col md={6}><Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-money-bill-wave me-2 text-success"></i>Salaire</Form.Label><Form.Control type="text" name="salaire" value={nouvelleOffre.salaire} onChange={handleChange} className="border-0 shadow-sm rounded-3 py-3" placeholder="1 500 000 Ar..." style={{background:"#f8f9fa"}}/></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-file-upload me-2 text-warning"></i>Fichier</Form.Label><Form.Control type="file" name="fichier" onChange={handleChange} className="border-0 shadow-sm rounded-3 py-3" style={{background:"#f8f9fa"}}/>{editMode&&currentOffre?.fichier&&!nouvelleOffre.fichier&&<Form.Text className="text-muted">Fichier actuel: <a href={getFileUrl(currentOffre.fichier)} target="_blank" rel="noopener noreferrer">Voir</a></Form.Text>}</Form.Group></Col>
              </Row>
              <Row>
                <Col md={6}><Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-calendar-alt me-2 text-info"></i>Date ouverture</Form.Label><Form.Control type="date" name="date_ouverture" value={nouvelleOffre.date_ouverture} onChange={handleChange} className="border-0 shadow-sm rounded-3 py-3" style={{background:"#f8f9fa"}}/></Form.Group></Col>
                <Col md={6}><Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-calendar-times me-2 text-danger"></i>Date clôture *</Form.Label><Form.Control type="date" name="date_cloture" value={nouvelleOffre.date_cloture} onChange={handleChange} required className="border-0 shadow-sm rounded-3 py-3" style={{background:"#f8f9fa"}}/></Form.Group></Col>
              </Row>
              <Form.Group className="mb-4"><Form.Label className="fw-semibold"><i className="fas fa-align-left me-2 text-info"></i>Description *</Form.Label><Form.Control as="textarea" rows={5} name="description" value={nouvelleOffre.description} onChange={handleChange} required className="border-0 shadow-sm rounded-3 py-3" placeholder="Détails..." style={{background:"#f8f9fa",resize:"none"}}/></Form.Group>
              <Form.Group className="mb-4"><Form.Check type="checkbox" name="est_urgent" label="Urgent (UI)" checked={nouvelleOffre.est_urgent} onChange={handleChange} className="fw-semibold"/><Form.Text className="text-muted">Mise en avant</Form.Text></Form.Group>
              <Modal.Footer className="border-0 p-0 pt-4">
                <Button variant="outline-secondary" onClick={handleClose} className="rounded-pill px-4 py-2" style={{fontWeight:"600"}} disabled={isSubmitting}><i className="fas fa-times me-2"></i>Annuler</Button>
                <Button type="submit" variant="primary" className="rounded-pill px-4 py-2" style={{background:"linear-gradient(135deg,#667eea 0%,#764ba2 100%)",border:"none",fontWeight:"600"}} disabled={isSubmitting}><i className={`fas ${editMode?'fa-save':'fa-plus'} me-2`}></i>{isSubmitting?'Envoi...':(editMode?"Modifier":"Créer")}</Button>
              </Modal.Footer>
            </Form>
          </Modal.Body>
        </Modal>

        <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered size="sm">
          <Modal.Header closeButton className="border-0">
            <Modal.Title className="fw-bold text-danger"><i className="fas fa-exclamation-triangle me-2"></i>Confirmer</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center py-4">
            <p className="mb-0">Supprimer cet appel d'offre ?</p>
          </Modal.Body>
          <Modal.Footer className="border-0 justify-content-center">
            <Button variant="secondary" onClick={() => setShowConfirm(false)} className="px-4">Annuler</Button>
            <Button variant="danger" onClick={executeDelete} className="px-4"><i className="fas fa-trash me-1"></i>Supprimer</Button>
          </Modal.Footer>
        </Modal>

        <style>{`
          .modern-modal .modal-content{border-radius:20px!important;border:none!important;box-shadow:0 25px 50px rgba(0,0,0,.2)!important}
          .form-control:focus,.form-select:focus{box-shadow:0 0 0 .2rem rgba(102,126,234,.25)!important;border-color:#667eea!important;background:#fff!important}
          .card{transition:transform .3s ease,box-shadow .3s ease}
          .btn{transition:all .3s ease}
          .btn:hover{transform:translateY(-2px)}
          
          .file-compact{background:#fff;border:1px solid #dee2e6;border-radius:8px;overflow:hidden;margin-top:8px}
          .file-compact-header{display:flex;align-items:center;gap:8px;padding:8px 12px;background:#f8f9fa;border-bottom:1px solid #dee2e6;font-size:0.85rem;font-weight:600}
          .file-compact-header i{font-size:1rem}
          .file-compact-name{flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
          .file-compact-preview{padding:10px;background:#fafbfc}
          .file-compact-actions{display:flex;gap:4px;justify-content:center;padding:8px;background:#f8f9fa;border-top:1px solid #dee2e6}
          .file-compact-actions .btn{font-size:0.8rem;padding:4px 10px}
        `}</style>
      </div>
    </div>
  );
};

export default AppelOffreMembre;