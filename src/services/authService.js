import axios from 'axios';
import API_URL from '../config';

const authService = {
  login: (email, password) =>
    axios.post(`${API_URL}/auth/login`, { email, password }).then(res => res.data),

  refresh: (refreshToken) =>
    axios.post(`${API_URL}/auth/refresh`, { refreshToken }).then(res => res.data),

  logout: (refreshToken) =>
    axios.post(`${API_URL}/auth/logout`, { refreshToken }).then(res => res.data),

  me: () =>
    axios.get(`${API_URL}/auth/me`).then(res => res.data),
};

export default authService;