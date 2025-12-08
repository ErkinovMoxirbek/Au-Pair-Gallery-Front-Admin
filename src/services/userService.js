// src/services/userService.js
import api from "../config"; // MUHIM: bu yerda axios instance import qilamiz, path sendagi config'ga mos

const userService = {
  // 1) Joriy user ma'lumotini olish
  getMe: async () => {
    const res = await api.get("/users/me"); // masalan: GET /users/me
    return res.data;
  },

  // 2) Joriy user ma'lumotini yangilash
  updateMe: async (payload) => {
    const res = await api.put("/users/me", payload); // masalan: PUT /users/me
    return res.data;
  }
};

export default userService;
