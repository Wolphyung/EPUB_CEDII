import React, { useEffect, useState } from "react";
import { fetchPublications } from "../../services/api";



const PublicationsList = () => {
  const [publications, setPublications] = useState([]);

  useEffect(() => {
    fetchPublications()
      .then(res => setPublications(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Liste des Publications</h2>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Titre</th>
            <th>Type</th>
            <th>Statut</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {publications.map(pub => (
            <tr key={pub.id_publication}>
              <td>{pub.id_publication}</td>
              <td>{pub.titre}</td>
              <td>{pub.type}</td>
              <td>{pub.statut}</td>
              <td>{pub.date_publication}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PublicationsList;
