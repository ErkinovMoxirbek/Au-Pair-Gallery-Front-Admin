import { useState } from 'react';
import { getUser } from '../../utils/tokenManager';

export default function Settings() {
  const user = getUser();
  const [form, setForm] = useState({
    name: user.name || '',
    email: user.email || '',
    notifications: true,
    language: 'uz'
  });

  const handleSave = () => {
    alert('Sozlamalar saqlandi!');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Sozlamalar</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold mb-4">Shaxsiy ma'lumotlar</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Xabarnomalar</h2>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={form.notifications}
              onChange={(e) => setForm({ ...form, notifications: e.target.checked })}
              className="mr-2"
            />
            <span>Email orqali xabarnoma olish</span>
          </label>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Til</h2>
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="uz">O'zbekcha</option>
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>

        <div className="pt-4">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Saqlash
          </button>
        </div>
      </div>
    </div>
  );
}