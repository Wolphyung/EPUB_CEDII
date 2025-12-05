// services/api.js
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

// Intercepteur pour ajouter le token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour les erreurs
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// --- Authentification ---
export const loginUser = (credentials) => apiClient.post('/login', credentials);
export const registerUser = (userData) => apiClient.post('/register', userData);
export const getCurrentUser = () => apiClient.get('/user');

// --- Publications ---
export const fetchPublications = () => apiClient.get('/publications');
export const fetchPublicationsValidees = () => apiClient.get('/publications/validees');
export const addPublication = (data) => apiClient.post('/publications', data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const updatePublication = (id, data) => apiClient.post(`/publications/${id}?_method=PUT`, data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deletePublication = (id) => apiClient.delete(`/publications/${id}`);
export const validatePublication = (id) => apiClient.post(`/publications/${id}/validate`);
export const downloadPublicationFile = (id) => apiClient.get(`/publications/${id}/download`, { responseType: 'blob' });

// --- Événements ---
export const fetchEvenements = () => apiClient.get('/evenements');
export const fetchEvenementsValides = () => apiClient.get('/evenements/valides');
export const addEvenement = (data) => apiClient.post('/evenements', data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const updateEvenement = (id, data) => apiClient.post(`/evenements/${id}?_method=PUT`, data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteEvenement = (id) => apiClient.delete(`/evenements/${id}`);
export const validateEvenement = (id) => apiClient.post(`/evenements/${id}/validate`);

// --- Appels d'offres ---
export const fetchAppelOffres = () => apiClient.get('/appeloffres');
export const fetchAppelsOffresValides = () => apiClient.get('/appeloffres/valides');

// --- Messages ---
export const envoyerMessageVisiteur = (data) => apiClient.post('/messages', data);

// --- Fonctions de simulation ---
export const toggleLikePublication = (publicationId) => {
  return Promise.resolve({
    data: { success: true, likes: Math.floor(Math.random() * 100) + 1 }
  });
};

export const inscrireEvenement = (evenementId) => {
  return Promise.resolve({
    data: { success: true, inscrit: true }
  });
};

// --- Membres ---
export const fetchMembres = () => apiClient.get('/membres');
export const addMembre = (data) => apiClient.post('/membres', data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const updateMembre = (id, data) => apiClient.post(`/membres/${id}?_method=PUT`, data, {
  headers: { "Content-Type": "multipart/form-data" },
});
export const deleteMembre = (id) => apiClient.delete(`/membres/${id}`);

// --- Abonnements ---
export const fetchAbonnements = () => {
  return apiClient.get('/abonnements');
};

export const fetchAbonnementById = (id) => {
  return apiClient.get(`/abonnements/${id}`);
};

export const addAbonnement = (data) => {
  return apiClient.post('/abonnements', data);
};

export const updateAbonnement = (id, data) => {
  return apiClient.post(`/abonnements/${id}?_method=PUT`, data);
};

export const deleteAbonnement = (id) => {
  return apiClient.delete(`/abonnements/${id}`);
};

export const getAbonnementStats = () => {
  return apiClient.get('/abonnements/stats');
};

export const checkMembreAbonnement = (membreId) => {
  return apiClient.get(`/abonnements/check/${membreId}`);
};


// Export par défaut pour une utilisation directe
export default apiClient;