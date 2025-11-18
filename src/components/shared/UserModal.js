// src/components/shared/UserModal.js
import { useState, useEffect } from 'react';
import { X, Save, Calendar, Clock } from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'ROLE_AUPAIR', label: 'Kandidat' },
  { value: 'ROLE_FAMILY', label: 'Familie' }
];

export default function UserModal({ show, onClose, item, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phone: '',
    country: '',
    city: '',
    age: '',
    role: '',
    isActive: true,
    // LocalDateTime fields (ISO: YYYY-MM-DDThh:mm)
    validFrom: '',
    validUntil: ''
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const showValidityPeriod =
    formData.role === 'ROLE_FAMILY' || formData.role === 'ROLE_AUPAIR';

  // Modal ochilganda formani to‘ldirish / reset qilish
  useEffect(() => {
    if (!show) return;

    if (item) {
      setFormData({
        name: item.name || '',
        surname: item.surname || '',
        email: item.email || '',
        password: '', // tahrirlashda passwordni qayta ko‘rsatmaymiz
        phone: item.phone || '',
        country: item.country || '',
        city: item.city || '',
        age: item.age || '',
        role: Array.isArray(item.roles)
          ? item.roles[0] || ''
          : item.role || '',
        isActive: (item.status || 'ACTIVE') === 'ACTIVE',
        validFrom: item.validFrom ? item.validFrom.slice(0, 16) : '',
        validUntil: item.validUntil ? item.validUntil.slice(0, 16) : ''
      });
    } else {
      setFormData({
        name: '',
        surname: '',
        email: '',
        password: '',
        phone: '',
        country: '',
        city: '',
        age: '',
        role: '',
        isActive: true,
        validFrom: '',
        validUntil: ''
      });
    }
    setErrors({});
  }, [item, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name ist erforderlich.';

    if (!formData.email.trim()) newErrors.email = 'E-Mail ist erforderlich.';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Das E-Mail-Format ist ungültig.';

    // create paytida password majburiy
    if (!item && !formData.password)
      newErrors.password = 'Passwort ist erforderlich.';
    else if (!item && formData.password.length < 6)
      newErrors.password = 'Das Passwort muss mindestens 6 Zeichen lang sein.';

    if (!formData.role) newErrors.role = 'Bitte wählen Sie eine Rolle aus.';

    if (showValidityPeriod) {
      if (!formData.validFrom) {
        newErrors.validFrom = 'Startzeitpunkt ist erforderlich.';
      }
      if (!formData.validUntil) {
        newErrors.validUntil = 'Endzeitpunkt ist erforderlich.';
      }
      if (formData.validFrom && formData.validUntil) {
        if (formData.validFrom >= formData.validUntil) {
          newErrors.validUntil =
            'Der Endzeitpunkt muss nach dem Startzeitpunkt liegen.';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const dataToSend = {
        name: formData.name.trim(),
        surname: formData.surname?.trim() || null,
        email: formData.email.trim(),
        phone: formData.phone?.trim() || null,
        country: formData.country?.trim() || null,
        city: formData.city?.trim() || null,
        age: formData.age?.trim() || null,
        status: formData.isActive ? 'ACTIVE' : 'NOACTIVE',
        // validFrom/validUntil faqat kerak bo'lsa qoladi
        validFrom: showValidityPeriod ? formData.validFrom || null : null,
        validUntil: showValidityPeriod ? formData.validUntil || null : null
      };

      // role -> roles / role
      if (item && Array.isArray(item.roles)) {
        dataToSend.roles = formData.role ? [formData.role] : [];
      } else {
        dataToSend.role = formData.role;
      }

      // password faqat kerak bo‘lganda
      if (formData.password) {
        dataToSend.password = formData.password;
      } else if (item) {
        // tahrirlashda bo‘sh bo‘lsa passwordni umuman yubormaymiz
        // (demak o‘zgarmaydi)
      }

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Fehler: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold text-gray-900">
            {item ? 'Bearbeiten – Benutzer' : 'Neuer Benutzer hinzufügen'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Vorname <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Max"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>

              {/* Nachname */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nachname
                </label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Mustermann"
                />
              </div>

              {/* E-Mail */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-Mail <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="max@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              {/* Passwort */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Passwort{' '}
                  {item ? (
                    <span className="text-gray-400 text-xs">(optional)</span>
                  ) : (
                    <span className="text-red-500">*</span>
                  )}
                </label>
                <input
                  type="text"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.password ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="••••••"
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Rolle */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rolle <span className="text-red-500">*</span>
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.role ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">— Bitte wählen —</option>
                  {ROLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                {errors.role && (
                  <p className="text-red-500 text-xs mt-1">{errors.role}</p>
                )}
              </div>

              {/* Gültigkeitszeitraum (ROLE_AUPAIR / ROLE_FAMILY) */}
              {showValidityPeriod && (
                <div className="md:col-span-2 p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                  <p className="text-sm font-semibold text-amber-800 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Gültigkeitszeitraum
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Von <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          name="validFrom"
                          value={formData.validFrom}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.validFrom
                              ? 'border-red-300'
                              : 'border-gray-300'
                          }`}
                        />
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.validFrom && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.validFrom}
                        </p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bis <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="datetime-local"
                          name="validUntil"
                          value={formData.validUntil}
                          onChange={handleChange}
                          min={formData.validFrom}
                          className={`w-full px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.validUntil
                              ? 'border-red-300'
                              : 'border-gray-300'
                          }`}
                        />
                        <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                      {errors.validUntil && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.validUntil}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-3 md:col-span-2">
                <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="isActive"
                  className="text-sm text-gray-700 select-none"
                >
                  Status: {formData.isActive ? 'AKTIV' : 'INAKTIV'}
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Speichern...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Speichern</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
