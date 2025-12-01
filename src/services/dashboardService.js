import axios from 'axios';
import API_URL from '../config';

const dashboardService = {

  // ======================
  // USERS (oldingi)
  // ======================
  getUsers: () => axios.get(`${API_URL}/users`).then(res => res.data),
  getUser: (id) => axios.get(`${API_URL}/users/${id}`).then(res => res.data),
  createUser: (data) => axios.post(`${API_URL}/users`, data).then(res => res.data),
  updateUser: (id, data) => axios.put(`${API_URL}/users/${id}`, data).then(res => res.data),
  deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`).then(res => res.data),

  // ======================
  // FAMILIES (oldingi)
  // ======================
  getFamilies: () => axios.get(`${API_URL}/families`).then(res => res.data),
  getFamily: (id) => axios.get(`${API_URL}/families/${id}`).then(res => res.data),
  createFamily: (data) => axios.post(`${API_URL}/families`, data).then(res => res.data),
  updateFamily: (id, data) => axios.put(`${API_URL}/families/${id}`, data).then(res => res.data),
  deleteFamily: (id) => axios.delete(`${API_URL}/families/${id}`).then(res => res.data),

  // ======================
  // CANDIDATES  🔥 (YANGI)
  // ======================

  // List
  getCandidates: () =>
    axios.get(`${API_URL}/candidates`).then(res => res.data),

  // Get by ID (Full CV)
  getCandidate: (id) =>
    axios.get(`${API_URL}/candidates/${id}`).then(res => res.data),

  // Create (JSON)
  createCandidate: (data) =>
    axios.post(`${API_URL}/candidates`, data).then(res => res.data),

  // Update (JSON)
  updateCandidate: (id, data) =>
    axios.put(`${API_URL}/candidates/${id}`, data).then(res => res.data),

  // Delete
  deleteCandidate: (id) =>
    axios.delete(`${API_URL}/candidates/${id}`).then(res => res.data),

  // Upload PHOTO (multipart/form-data)
  uploadCandidatePhoto: (id, file) => {
    const form = new FormData();
    form.append("file", file);

    return axios.post(`${API_URL}/candidates/${id}/photo`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  // Upload CV (multipart/form-data)
  uploadCandidateCv: (id, file) => {
    const form = new FormData();
    form.append("file", file);

    return axios.post(`${API_URL}/candidates/${id}/cv`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  uploadCandidateCertificate: (id, file) => {
    const form = new FormData();
    form.append("file", file);

    return axios.post(`${API_URL}/candidates/${id}/certificate`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },uploadCandidateDiploma: (id, file) => {
    const form = new FormData();
    form.append("file", file);

    return axios.post(`${API_URL}/candidates/${id}/diploma`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },uploadCandidatePassport: (id, file) => {
    const form = new FormData();
    form.append("file", file);

    return axios.post(`${API_URL}/candidates/${id}/passport`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  // Full create: JSON + photo + cv
  createCandidateFull: async (data, photo, cv, certificate, diploma, passport) => {
    const created = await axios.post(`${API_URL}/candidates`, data).then(res => res.data);

    const id = created.data.id;

    if (photo) {
      await dashboardService.uploadCandidatePhoto(id, photo);
    }

    if (cv) {
      await dashboardService.uploadCandidateCv(id, cv);
    }
    if (certificate) {
      await dashboardService.uploadCandidateCertificate(id, certificate);
    }
    if (diploma) {
      await dashboardService.uploadCandidateDiploma(id, diploma);
    }
    if (passport) {
      await dashboardService.uploadCandidatePassport(id, passport);
    }

    return id;
  },

  // ======================
  // OTHER OLD SERVICES
  // ======================
  getStats: () => axios.get(`${API_URL}/stats`).then(res => res.data),

  getApplications: () => axios.get(`${API_URL}/applications`).then(res => res.data),
  updateApplicationStatus: (id, status) =>
    axios.patch(`${API_URL}/applications/${id}/status`, { status }).then(res => res.data),

  getMessages: () => axios.get(`${API_URL}/messages`).then(res => res.data),
  sendMessage: (data) => axios.post(`${API_URL}/messages`, data).then(res => res.data),

  getEvents: () => axios.get(`${API_URL}/events`).then(res => res.data),
  createEvent: (data) => axios.post(`${API_URL}/events`, data).then(res => res.data),

};

export default dashboardService;
