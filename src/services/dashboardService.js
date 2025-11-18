import axios from 'axios';
import API_URL from '../config';

const api = {
  // Users
  getUsers: () => axios.get(`${API_URL}/users`).then(res => res.data),
  getUser: (id) => axios.get(`${API_URL}/users/${id}`).then(res => res.data),
  createUser: (data) => axios.post(`${API_URL}/users`, data).then(res => res.data),
  updateUser: (id, data) => axios.put(`${API_URL}/users/${id}`, data).then(res => res.data),
  deleteUser: (id) => axios.delete(`${API_URL}/users/${id}`).then(res => res.data),

  // Families
  getFamilies: () => axios.get(`${API_URL}/families`).then(res => res.data),
  getFamily: (id) => axios.get(`${API_URL}/families/${id}`).then(res => res.data),
  createFamily: (data) => axios.post(`${API_URL}/families`, data).then(res => res.data),
  updateFamily: (id, data) => axios.put(`${API_URL}/families/${id}`, data).then(res => res.data),
  deleteFamily: (id) => axios.delete(`${API_URL}/families/${id}`).then(res => res.data),
  // Stats
  getStats: () => axios.get(`${API_URL}/stats`).then(res => res.data),

  // Applications
  getApplications: () => axios.get(`${API_URL}/applications`).then(res => res.data),
  updateApplicationStatus: (id, status) =>
    axios.patch(`${API_URL}/applications/${id}/status`, { status }).then(res => res.data),

  // Messages
  getMessages: () => axios.get(`${API_URL}/messages`).then(res => res.data),
  sendMessage: (data) => axios.post(`${API_URL}/messages`, data).then(res => res.data),

  // Events
  getEvents: () => axios.get(`${API_URL}/events`).then(res => res.data),
  createEvent: (data) => axios.post(`${API_URL}/events`, data).then(res => res.data),
};

export default api;