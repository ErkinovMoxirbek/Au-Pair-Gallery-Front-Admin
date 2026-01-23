// src/services/dashboardService.js
import axios from 'axios';
import API_URL from '../config';

const dashboardService = {

  // ======================
  // USERS
  // ======================
  getUsers: (params = {}) => axios.get(`${API_URL}/users`, { params }),
  getUser: (id) => axios.get(`${API_URL}/users/${id}`).then(res => res.data),
  createUser: (data) => axios.post(`${API_URL}/users`, data).then(res => res.data),
  updateUser: (id, data) => axios.put(`${API_URL}/users/${id}`, data).then(res => res.data),
  deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`).then(res => res.data),

  // ======================
  // FAMILIES
  // ======================
  getFamilies: () => axios.get(`${API_URL}/families`).then(res => res.data),
  getFamily: (id) => axios.get(`${API_URL}/families/${id}`).then(res => res.data),
  createFamily: (data) => axios.post(`${API_URL}/families`, data).then(res => res.data),
  updateFamily: (id, data) => axios.put(`${API_URL}/families/${id}`, data).then(res => res.data),
  deleteFamily: (id) => axios.delete(`${API_URL}/families/${id}`).then(res => res.data),

  // ======================
  // CANDIDATES 🔥
  // ======================

  // Barcha kandidatlar ro'yxati
  getCandidates: () =>
    axios.get(`${API_URL}/candidates`).then(res => res.data),

  // ID bo'yicha olish (Full CV uchun)
  getCandidate: (id) =>
    axios.get(`${API_URL}/candidates/${id}`).then(res => res.data),

  // Status bo‘yicha filter (PENDING, ACTIVE, REJECTED, ...)
  getCandidatesByStatus: (status) => {
    const url = status
      ? `${API_URL}/candidates/by/status?status=${status}`
      : `${API_URL}/candidates/by/status`;
    return axios.get(url).then(res => res.data);
  },

  // Yangi kandidat yaratish (faqat JSON, faylsiz)
  createCandidate: (data) =>
    axios.post(`${API_URL}/candidates`, data).then(res => res.data),

  // To'liq update qilish (faqat JSON, faylsiz)
  updateCandidate: (id, data) =>
    axios.put(`${API_URL}/candidates/${id}`, data).then(res => res.data),

  // Statusni yangilash (message optional)
  updateCandidateStatus: (id, status, message) =>
    axios
      .patch(
        `${API_URL}/candidates/${id}/status`,
        null,
        {
          params: { status, message },
        }
      )
      .then((res) => res.data),

  // O'chirish
  deleteCandidate: (id) =>
    axios.delete(`${API_URL}/candidates/${id}`).then(res => res.data),


  getCandidatePhotos: (id) =>
    axios.get(`${API_URL}/candidates/${id}/photos`).then(res => res.data),

  uploadCandidatePhotos: (id, files = []) => {
    const form = new FormData();
    (files || []).forEach((file) => {
      if (file) {
        form.append("files", file);
      }
    });

    return axios.post(`${API_URL}/candidates/${id}/photos`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  setCandidateMainPhoto: (id, photoId) =>
    axios
      .patch(`${API_URL}/candidates/${id}/photos/${photoId}/main`)
      .then(res => res.data),

  deleteCandidatePhoto: (id, photoId) =>
    axios
      .delete(`${API_URL}/candidates/${id}/photos/${photoId}`)
      .then(res => res.data),

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
  },

  uploadCandidateDiploma: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return axios.post(`${API_URL}/candidates/${id}/diploma`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  uploadCandidatePassport: (id, file) => {
    const form = new FormData();
    form.append("file", file);
    return axios.post(`${API_URL}/candidates/${id}/passport`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then(res => res.data);
  },

  createCandidateFull: async (data, photoFiles = [], cv, certificate, diploma, passport) => {
    // 1. JSON ni yaratamiz
    const created = await axios
      .post(`${API_URL}/candidates`, data)
      .then(res => res.data);

    const id = created?.data?.id ?? created?.id;

    if (!id) {
      console.error("createCandidateFull: Kandidat ID topilmadi", created);
      throw new Error("Kandidat yaratildi, lekin ID aniqlanmadi");
    }

    // 2. Fayllarni birin-ketin yuklaymiz
    const uploadPromises = [];

    // Multi photos (agar bo'lsa)
    if (photoFiles && photoFiles.length > 0) {
      uploadPromises.push(
        dashboardService.uploadCandidatePhotos(id, photoFiles)
      );
    }

    if (cv) {
      uploadPromises.push(dashboardService.uploadCandidateCv(id, cv));
    }
    if (certificate) {
      uploadPromises.push(dashboardService.uploadCandidateCertificate(id, certificate));
    }
    if (diploma) {
      uploadPromises.push(dashboardService.uploadCandidateDiploma(id, diploma));
    }
    if (passport) {
      uploadPromises.push(dashboardService.uploadCandidatePassport(id, passport));
    }

    if (uploadPromises.length > 0) {
      await Promise.all(uploadPromises);
    }

    // Tashqariga senga oldingidek ID qaytaramiz
    return id;
  },

  // ======================
  // OTHER SERVICES
  // ======================
  getStats: () => axios.get(`${API_URL}/dashboard/stats`).then(res => res.data),

  getApplications: () => axios.get(`${API_URL}/applications`).then(res => res.data),

  updateAdmin: (payload) =>
    axios.put(`${API_URL}/users/admin`, payload).then((res) => res.data),

  forgotPassword: ({ email }) =>
    axios
      .post(
        `${API_URL}/auth/password/forgot`,
        { email },
        { headers: { "Accept-Language": "uz" } }
      )
      .then((res) => res.data),
  updateApplicationStatus: (id, status) =>
    axios.patch(`${API_URL}/applications/${id}/status`, { status }).then(res => res.data),

  getMessages: () => axios.get(`${API_URL}/messages`).then(res => res.data),
  sendMessage: (data) => axios.post(`${API_URL}/messages`, data).then(res => res.data),

  getEvents: () => axios.get(`${API_URL}/events`).then(res => res.data),
  createEvent: (data) => axios.post(`${API_URL}/events`, data).then(res => res.data),
  approveUser: async (userId, payload) => {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/approve`, payload);
      return response.data;
    } catch (error) {
      console.error('Approve user error:', error);
      throw error;
    }
  }, resendActivationEmail: async (userId) => {
    try {
      const response = await axios.post(`${API_URL}/users/${userId}/resend-activation`);
      return response.data;
    } catch (error) {
      console.error('Resend activation error:', error);
      throw error;
    }
  }, validateToken: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users/activate/validate/${token}`);
      return response.data;
    } catch (error) {
      console.error('Validate token error:', error);
      throw error;
    }
  }, setPassword: async (data) => {
    try {
      const response = await axios.post(`${API_URL}/users/activate/set-password`, data);
      return response.data;
    } catch (error) {
      console.error('Set password error:', error);
      throw error;
    }
  },
};

export default dashboardService;
