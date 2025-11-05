import axios from "axios";

const API_URL = "http://127.0.0.1:8000/api";
export const API_CONFIG = {
  BASE_URL: "http://127.0.0.1:8000/api",
  TIMEOUT: 10000,
};

// Instance axios configurée
export const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);
// --- Membres ---
export const fetchMembres = () => axios.get(`${API_URL}/membres`);

export const addMembre = (data) =>
  axios.post(`${API_URL}/membres`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateMembre = (id, data) =>
  axios.post(`${API_URL}/membres/${id}?_method=PUT`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteMembre = (id) => axios.delete(`${API_URL}/membres/${id}`);

// --- Publications ---
export const fetchPublications = () => axios.get(`${API_URL}/publications`);

export const addPublication = (data) =>
  axios.post(`${API_URL}/publications`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updatePublication = (id, data) =>
  axios.post(`${API_URL}/publications/${id}?_method=PUT`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deletePublication = (id) => axios.delete(`${API_URL}/publications/${id}`);

export const validatePublication = (id) => axios.post(`${API_URL}/publications/${id}/validate`);

// --- Événements ---
export const fetchEvenements = () => axios.get(`${API_URL}/evenements`);

export const addEvenement = (data) =>
  axios.post(`${API_URL}/evenements`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const updateEvenement = (id, data) =>
  axios.post(`${API_URL}/evenements/${id}?_method=PUT`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteEvenement = (id) => axios.delete(`${API_URL}/evenements/${id}`);

export const validateEvenement = (id) => axios.post(`${API_URL}/evenements/${id}/validate`);

// --- Appels d’offres ---
export const fetchAppelOffres = () => axios.get(`${API_URL}/appelsoffres`);

// --- Utilisateurs ---
export const fetchUtilisateurs = () => axios.get(`${API_URL}/utilisateurs`);

// --- Statistiques ---
export const fetchStatistiques = () => axios.get(`${API_URL}/statistiques`);
