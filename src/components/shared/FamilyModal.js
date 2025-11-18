// src/components/shared/FamilyModal.js - MULTI-STEP MODAL FOR FAMILY (Au Pair muddati olib tashlandi)
import { useState, useEffect } from 'react';
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  Check,
  User,
  Home,
  Briefcase,
  Heart,
} from 'lucide-react';

const STEPS = [
  { id: 1, name: "Oila ma'lumotlari", icon: User },
  { id: 2, name: 'Manzil', icon: Home },
  { id: 3, name: 'Bolalar haqida', icon: Heart },
  { id: 4, name: 'Au Pair talablari', icon: Briefcase },
];

export default function FamilyModal({ show, onClose, item, onSave }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Step 1
    familyName: '',
    fatherName: '',
    motherName: '',
    phone: '',
    email: '',
    languagesSpoken: '',
    members: 0,
    // Step 2
    address: '',
    city: '',
    country: '',
    // Step 3
    childrenCount: 0,
    childrenAges: '',
    childrenDescription: '',
    // Step 4
    duties: '',
    workingHoursPerWeek: '',
    needsDrivingLicense: false,
    pocketMoney: '',
    roomDescription: '',
    mealsProvided: true,
    familyDescription: '',
    preferences: '',
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // item kelganda formni to‘ldirish
  useEffect(() => {
    if (!show) return;

    if (item) {
      setFormData({
        familyName: item.familyName || '',
        fatherName: item.fatherName || '',
        motherName: item.motherName || '',
        phone: item.phone || '',
        email: item.email || '',
        languagesSpoken: item.languagesSpoken || '',
        members: item.members ?? 0,

        address: item.address || '',
        city: item.city || '',
        country: item.country || '',

        childrenCount: item.childrenCount ?? 0,
        childrenAges: item.childrenAges || '',
        childrenDescription: item.childrenDescription || '',

        duties: item.duties || '',
        workingHoursPerWeek: item.workingHoursPerWeek ?? '',
        needsDrivingLicense: item.needsDrivingLicense ?? false,
        pocketMoney: item.pocketMoney ?? '',
        roomDescription: item.roomDescription || '',
        mealsProvided: item.mealsProvided !== false,
        familyDescription: item.familyDescription || '',
        preferences: item.preferences || '',

        isActive: (item.status || 'ACTIVE') === 'ACTIVE',
      });
    } else {
      setFormData({
        familyName: '',
        fatherName: '',
        motherName: '',
        phone: '',
        email: '',
        languagesSpoken: '',
        members: 0,
        address: '',
        city: '',
        country: '',
        childrenCount: 0,
        childrenAges: '',
        childrenDescription: '',
        duties: '',
        workingHoursPerWeek: '',
        needsDrivingLicense: false,
        pocketMoney: '',
        roomDescription: '',
        mealsProvided: true,
        familyDescription: '',
        preferences: '',
        isActive: true,
      });
    }

    setCurrentStep(1);
    setErrors({});
  }, [item, show]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      if (!formData.familyName.trim())
        newErrors.familyName = 'Oila nomi majburiy';
      if (!formData.phone.trim())
        newErrors.phone = 'Telefon majburiy';
      if (!formData.email.trim())
        newErrors.email = 'Email majburiy';
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email formati noto'g'ri";
    }

    if (step === 2) {
      if (!formData.address.trim())
        newErrors.address = 'Manzil majburiy';
      if (!formData.city.trim())
        newErrors.city = 'Shahar majburiy';
      if (!formData.country.trim())
        newErrors.country = 'Davlat majburiy';
    }

    if (step === 3) {
      if (formData.childrenCount < 0)
        newErrors.childrenCount = "Noto'g'ri qiymat";
    }

    // Step 4: hech qanday majburiy sana yo'q
    if (step === 4) {
      // validatsiya yo'q
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        members: Number(formData.members) || 0,
        childrenCount: Number(formData.childrenCount) || 0,
        workingHoursPerWeek: formData.workingHoursPerWeek
          ? Number(formData.workingHoursPerWeek)
          : null,
        pocketMoney: formData.pocketMoney
          ? Number(formData.pocketMoney)
          : null,
        status: formData.isActive ? 'ACTIVE' : 'NOACTIVE',
      };

      delete dataToSend.isActive;

      await onSave(dataToSend);
      onClose();
    } catch (error) {
      console.error('Save error:', error);
      alert('Xato: ' + (error.response?.data?.message || error.message));
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
        className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between text-white">
          <h3 className="text-xl font-semibold">
            {item ? 'Oilani tahrirlash' : "Yangi oila qo'shish"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps indicator */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex-1 flex items-center">
                  <div className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isActive
                          ? 'bg-blue-600 text-white ring-4 ring-blue-100'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p
                        className={`text-sm font-medium ${
                          isActive
                            ? 'text-blue-600'
                            : isCompleted
                            ? 'text-green-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {step.name}
                      </p>
                    </div>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`flex-1 h-1 mx-4 transition-all ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    ></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* STEP 1: Family Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Oila a'zolari haqida ma'lumot
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oila nomi <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="familyName"
                      value={formData.familyName}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.familyName ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Müller oilasi"
                    />
                    {errors.familyName && (
                      <p className="text-red-500 text-xs mt-1">{errors.familyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ota ismi</label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Hans Müller"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ona ismi</label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Anna Müller"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.phone ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="+49 123 456789"
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="familie@example.com"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gaplashadigan tillar
                    </label>
                    <input
                      type="text"
                      name="languagesSpoken"
                      value={formData.languagesSpoken}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nemis, Ingliz, O'zbek"
                    />
                    <p className="text-xs text-gray-500 mt-1">Vergul bilan ajrating</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oila a'zolari soni
                    </label>
                    <input
                      type="number"
                      name="members"
                      value={formData.members}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="4"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: Address */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Manzil ma'lumotlari
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      To'liq manzil <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Hauptstraße 123"
                    />
                    {errors.address && (
                      <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Shahar <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.city ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="München"
                    />
                    {errors.city && (
                      <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Davlat <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.country ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="Deutschland"
                    />
                    {errors.country && (
                      <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: Children Info */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Bolalar haqida
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bolalar soni
                    </label>
                    <input
                      type="number"
                      name="childrenCount"
                      value={formData.childrenCount}
                      onChange={handleChange}
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.childrenCount ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="2"
                    />
                    {errors.childrenCount && (
                      <p className="text-red-500 text-xs mt-1">{errors.childrenCount}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bolalar yoshi
                    </label>
                    <input
                      type="text"
                      name="childrenAges"
                      value={formData.childrenAges}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5, 8, 12"
                    />
                    <p className="text-xs text-gray-500 mt-1">Vergul bilan ajrating</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bolalar haqida qo'shimcha ma'lumot
                    </label>
                    <textarea
                      name="childrenDescription"
                      value={formData.childrenDescription}
                      onChange={handleChange}
                      rows="4"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bolalarning xarakteri, sevimli mashg'ulotlari, maktab/bog'cha ma'lumotlari..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: Au Pair Requirements */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-fadeIn">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Au Pair talablari
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Vazifalar
                    </label>
                    <textarea
                      name="duties"
                      value={formData.duties}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Bolalarga qarash, maktabga olib borish, uy vazifalarida yordam berish..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Haftasiga ish soatlari
                    </label>
                    <input
                      type="number"
                      name="workingHoursPerWeek"
                      value={formData.workingHoursPerWeek}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oylik cho'ntak puli (€)
                    </label>
                    <input
                      type="number"
                      name="pocketMoney"
                      value={formData.pocketMoney}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="300"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Xona haqida
                    </label>
                    <textarea
                      name="roomDescription"
                      value={formData.roomDescription}
                      onChange={handleChange}
                      rows="2"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Alohida xona, Wi-Fi, stol..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Oila haqida qo'shimcha
                    </label>
                    <textarea
                      name="familyDescription"
                      value={formData.familyDescription}
                      onChange={handleChange}
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Oila hayot tarzi, qiziqishlari, dam olish..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Afzalliklar (qaysi davlatdan)
                    </label>
                    <input
                      type="text"
                      name="preferences"
                      value={formData.preferences}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="O'zbekiston, Qozog'iston, Ukraina..."
                    />
                  </div>

                  {/* Flags */}
                  <div className="flex items-center gap-3">
                    <input
                      id="needsDrivingLicense"
                      name="needsDrivingLicense"
                      type="checkbox"
                      checked={formData.needsDrivingLicense}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="needsDrivingLicense" className="text-sm text-gray-700">
                      Haydovchilik guvohnomasi kerak
                    </label>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      id="mealsProvided"
                      name="mealsProvided"
                      type="checkbox"
                      checked={formData.mealsProvided}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="mealsProvided" className="text-sm text-gray-700">
                      Ovqat ta'minlanadi
                    </label>
                  </div>

                  {/* Status toggle */}
                  <div className="flex items-center gap-3 md:col-span-2 mt-2">
                    <input
                      id="isActive"
                      name="isActive"
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="isActive" className="text-sm text-gray-700 select-none">
                      Status: {formData.isActive ? 'FAOL' : 'NOFAOL'}
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
            <div className="flex gap-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors"
                  disabled={loading}
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Orqaga</span>
                </button>
              )}
            </div>

            <div className="flex-1 flex justify-center">
              <p className="text-sm text-gray-600">
                {currentStep} / {STEPS.length} qadam
              </p>
            </div>

            <div className="flex gap-3">
              {currentStep < STEPS.length ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  disabled={loading}
                >
                  <span>Keyingisi</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saqlanmoqda...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>Saqlash</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}   