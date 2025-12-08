// src/pages/dashboard/Settings.js
import { useState } from "react";
import api from "../../config";
import { getUser } from "../../utils/tokenManager";

export default function Settings() {
  const localUser = getUser() || {};

  // Profil formasi
  const [profile, setProfile] = useState({
    name: localUser.name || "",
    surname: localUser.surname || "",
    email: localUser.email || ""
  });

  // Parol formasi
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profil inputlari
  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  // Parol inputlari
  const handlePasswordChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
    setError("");
    setSuccess("");
  };

  // Profilni saqlash
  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true);
      setError("");
      setSuccess("");

      const payload = {
        name: profile.name.trim(),
        surname: profile.surname.trim(),
        email: profile.email.trim()
      };

      await api.put(`/users/${localUser.id}`, payload);

      setSuccess("Profil ma'lumotlari saqlandi.");
    } catch (e) {
      console.error("Profile save error:", e);
      const msg =
        e.response?.data?.message ||
        e.message ||
        "Profilni saqlashda xatolik yuz berdi.";
      setError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // Parolni o‘zgartirish
  const handleChangePassword = async () => {
    setError("");
    setSuccess("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setError("Joriy va yangi parolni kiriting.");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setError("Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak.");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("Yangi parol va tasdiqlash paroli mos emas.");
      return;
    }

    try {
      setSavingPassword(true);

      const payload = {
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      };

      // ❗ BU URL’NI BACKENDINGGA MOSLASHTIR:
      // masalan: PUT /users/{id}/password
      await api.put(`/users/${localUser.id}/password`, payload);

      setSuccess("Parol muvaffaqiyatli o‘zgartirildi.");
      // formani tozalab qo‘yish
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
    } catch (e) {
      console.error("Password change error:", e);
      const msg =
        e.response?.data?.message ||
        e.message ||
        "Parolni o‘zgartirishda xatolik yuz berdi.";
      setError(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Sozlamalar</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-8">
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-300 rounded-md px-3 py-2">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-300 rounded-md px-3 py-2">
            {success}
          </p>
        )}

        {/* Shaxsiy ma'lumotlar */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Shaxsiy ma'lumotlar</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ism
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange("name", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Familiya
            </label>
            <input
              type="text"
              value={profile.surname}
              onChange={(e) => handleProfileChange("surname", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileChange("email", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {savingProfile ? "Saqlanmoqda..." : "Profilni saqlash"}
          </button>
        </section>

        <hr className="border-gray-200" />

        {/* Parolni o'zgartirish */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Parolni o‘zgartirish</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Joriy parol
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                handlePasswordChange("currentPassword", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yangi parol
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                handlePasswordChange("newPassword", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Yangi parolni tasdiqlash
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                handlePasswordChange("confirmPassword", e.target.value)
              }
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={handleChangePassword}
            disabled={savingPassword}
            className="mt-2 px-5 py-2 bg-gray-800 text-white rounded-md hover:bg-black disabled:opacity-50 text-sm"
          >
            {savingPassword ? "O‘zgartirilmoqda..." : "Parolni o‘zgartirish"}
          </button>
        </section>
      </div>
    </div>
  );
}
