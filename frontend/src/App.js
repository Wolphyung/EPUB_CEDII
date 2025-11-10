import { BrowserRouter, Routes, Route } from "react-router-dom";

import Signup from "./pages/signup";
import PublicationsList from "./pages/Publications/PublicationsList";
import MembresList from "./pages/MembresList";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashAdmin from "./pages/pageAdmin/dashAdmin"
import PubAdmin from "./pages/pageAdmin/publicstions"
import AppeloffreAdmin from "./pages/pageAdmin/appeloffre"
import MembreAdmin from "./pages/pageAdmin/membre"
import ParametreAdmin from "./pages/pageAdmin/parametre"
import MessageAdmin from "./pages/pageAdmin/message"
import NotificationgeAdmin from "./pages/pageAdmin/notification"
import AdminEv from "./pages/pageAdmin/Evenement"


import DashVisiteur from "./pages/pageVisiteur/dashVisiteur"


import DashMembre from "./pages/pageMembre/dashMembre"
import PubMembre from "./pages/pageMembre/pubmembre"
import AppeloffreMembre from "./pages/pageMembre/appeloffre"
import EvenementMembre from "./pages/pageMembre/evenement"
import MessageMembre from "./pages/pageMembre/message"
import ProfilMembre from "./pages/pageMembre/profil"
import ParametreMembre from "./pages/pageMembre/parametre"
import NoticficationMembre from "./pages/pageMembre/notification"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/dashvisiteur" element={<DashVisiteur />} />
         <Route path="/signup" element={<Signup />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/publications" element={<PublicationsList />} />
        <Route path="/membres" element={<MembresList />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashAdmin" element={<DashAdmin />} />
         <Route path="/adminEv" element={<AdminEv />} />
         <Route path="/pubAdmin" element={<PubAdmin />} />
         <Route path="/appeloffreAdmin" element={<AppeloffreAdmin />} />
         <Route path="/membreAdmin" element={<MembreAdmin />} />
         <Route path="/parametreAdmin" element={<ParametreAdmin />} />
         <Route path="/messageAdmin" element={<MessageAdmin />} />
         <Route path="/notificationAdmin" element={<NotificationgeAdmin />} />

         <Route path="/dashMembre" element={<DashMembre />} />
            <Route path="/pubMembre" element={<PubMembre />} />
            <Route path="/appeloffreMembre" element={<AppeloffreMembre />} />
            <Route path="/evenementMembre" element={<EvenementMembre />} />
            <Route path="/messageMembre" element={<MessageMembre />} />
            <Route path="/profilMembre" element={<ProfilMembre />} />
            <Route path="/parametreMembre" element={<ParametreMembre />} />
            <Route path="/notificationMembre" element={<NoticficationMembre />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;