// src/components/shared/FamilyModal.js - MODERN WIZARD DESIGN (SCROLL FIX, DE VERSION)
import { useState, useEffect } from "react";
import {
   X,
   Save,
   ChevronLeft,
   ChevronRight,
   Check,
   User,
   Home,
   Briefcase,
   Baby,
   Users,
   MapPin,
   Clock,
   DollarSign,
   Car,
   Utensils,
   ToggleLeft,
   ToggleRight,
   Globe,
   Phone,
   Mail,
} from "lucide-react";

const STEPS = [
   {
      id: 1,
      name: "Stammdaten",
      subtitle: "Familienmitglieder & Kontakt",
      icon: User,
   },
   { id: 2, name: "Adresse", subtitle: "Wohnort", icon: MapPin },
   {
      id: 3,
      name: "Kinder",
      subtitle: "Informationen zu den Kindern",
      icon: Baby,
   },
   {
      id: 4,
      name: "Bedingungen",
      subtitle: "Anforderungen für Au-pair",
      icon: Briefcase,
   },
];

export default function FamilyModal({ show, onClose, item, onSave }) {
   const [currentStep, setCurrentStep] = useState(1);
   const [loading, setLoading] = useState(false);
   const [errors, setErrors] = useState({});

   const [formData, setFormData] = useState({
      // Step 1
      familyName: "",
      fatherName: "",
      motherName: "",
      phone: "",
      email: "",
      languagesSpoken: "",
      members: 2,
      // Step 2
      address: "",
      city: "",
      country: "",
      // Step 3
      childrenCount: 1,
      childrenAges: "",
      childrenDescription: "",
      // Step 4
      duties: "",
      workingHoursPerWeek: "",
      needsDrivingLicense: false,
      pocketMoney: "",
      roomDescription: "",
      mealsProvided: true,
      familyDescription: "",
      preferences: "",
      isActive: true,
   });

   // Load Data
   useEffect(() => {
      if (!show) return;
      if (item) {
         setFormData({
            ...item,
            members: item.members ?? 2,
            childrenCount: item.childrenCount ?? 1,
            mealsProvided: item.mealsProvided !== false,
            isActive: (item.status || "ACTIVE") === "ACTIVE",
            childrenAges: item.childrenAges || "",
         });
      } else {
         setFormData({
            familyName: "",
            fatherName: "",
            motherName: "",
            phone: "",
            email: "",
            languagesSpoken: "",
            members: 2,
            address: "",
            city: "",
            country: "",
            childrenCount: 1,
            childrenAges: "",
            childrenDescription: "",
            duties: "",
            workingHoursPerWeek: "",
            needsDrivingLicense: false,
            pocketMoney: "",
            roomDescription: "",
            mealsProvided: true,
            familyDescription: "",
            preferences: "",
            isActive: true,
         });
      }
      setCurrentStep(1);
      setErrors({});
   }, [item, show]);

   // Helpers
   const update = (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
   };

   const validateStep = (step) => {
      const newErrors = {};
      if (step === 1) {
         if (!formData.familyName.trim())
            newErrors.familyName = "Familienname ist erforderlich";
         if (!formData.phone.trim())
            newErrors.phone = "Telefonnummer ist erforderlich";
         if (!formData.email.trim())
            newErrors.email = "E-Mail ist erforderlich";
      }
      if (step === 2) {
         if (!formData.address.trim())
            newErrors.address = "Adresse ist erforderlich";
         if (!formData.city.trim()) newErrors.city = "Stadt ist erforderlich";
         if (!formData.country.trim()) newErrors.country = "Land ist erforderlich";
      }
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   const handleNext = () => {
      if (validateStep(currentStep))
         setCurrentStep((p) => Math.min(p + 1, STEPS.length));
   };

   const handlePrev = () => {
      setCurrentStep((p) => Math.max(p - 1, 1));
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      if (!validateStep(currentStep)) return;
      setLoading(true);
      try {
         const payload = {
            ...formData,
            members: Number(formData.members),
            childrenCount: Number(formData.childrenCount),
            workingHoursPerWeek: formData.workingHoursPerWeek
               ? Number(formData.workingHoursPerWeek)
               : null,
            pocketMoney: formData.pocketMoney
               ? Number(formData.pocketMoney)
               : null,
            status: formData.isActive ? "ACTIVE" : "NOACTIVE",
         };
         delete payload.isActive;
         await onSave(payload);
         onClose();
      } catch (error) {
         alert("Fehler: " + error.message);
      } finally {
         setLoading(false);
      }
   };

   if (!show) return null;

   const CurrentIcon = STEPS[currentStep - 1].icon;

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
         <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity"
            onClick={onClose}
         />

         {/* Scrollable Modal Container */}
         <div className="relative bg-white w-full max-w-5xl h[90vh] md:h-[90vh] rounded-3xl shadow-2xl flex flex-row overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* LEFT SIDEBAR (Desktop) */}
            <div className="hidden md:flex w-72 bg-gray-50 border-r border-gray-200 flex-col p-6">
               <div className="mb-8 flex items-center gap-3 text-indigo-600">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                     <Home className="w-6 h-6" />
                  </div>
                  <div>
                     <h2 className="font-bold text-gray-900 leading-tight">
                        Familien-
                        <br />
                        Manager
                     </h2>
                  </div>
               </div>

               <div className="space-y-2 relative flex-1">
                  {/* Vertical Progress Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 -z-10" />

                  {STEPS.map((s) => {
                     const isActive = currentStep === s.id;
                     const isCompleted = currentStep > s.id;

                     return (
                        <div
                           key={s.id}
                           className="flex items-center gap-4 py-3 group"
                        >
                           <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10
                          ${isActive
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : isCompleted
                                       ? "bg-green-500 border-green-500 text-white"
                                       : "bg-white border-gray-300 text-gray-400"
                                 }
                       `}
                           >
                              {isCompleted ? (
                                 <Check className="w-5 h-5" />
                              ) : (
                                 <s.icon className="w-5 h-5" />
                              )}
                           </div>
                           <div>
                              <p
                                 className={`text-sm font-bold transition-colors ${isActive ? "text-gray-900" : "text-gray-500"
                                    }`}
                              >
                                 {s.name}
                              </p>
                              <p className="text-xs text-gray-400">{s.subtitle}</p>
                           </div>
                        </div>
                     );
                  })}
               </div>

               <div className="mt-auto pt-6 border-t border-gray-200">
                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                     <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                        {formData.familyName ? formData.familyName.charAt(0) : "F"}
                     </div>
                     <div className="overflow-hidden">
                        <p className="text-sm font-bold text-gray-900 truncate">
                           {formData.familyName || "Neue Familie"}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                           {item ? "Bearbeitungsmodus" : "Erstellungsmodus"}
                        </p>
                     </div>
                  </div>
               </div>
            </div>

            {/* RIGHT MAIN CONTENT */}
            <div className="flex-1 flex flex-col h-full bg-white">
               {/* Mobile Header */}
               <div className="md:hidden p-4 border-b flex items-center justify-between bg-gray-50 flex-shrink-0">
                  <div className="flex items-center gap-2">
                     <span className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">
                        {currentStep}
                     </span>
                     <span className="font-bold text-gray-700">
                        {STEPS[currentStep - 1].name}
                     </span>
                  </div>
                  <button
                     onClick={onClose}
                     className="p-2 bg-white rounded-lg border"
                  >
                     <X className="w-5 h-5" />
                  </button>
               </div>

               {/* Close Button Desktop */}
               <button
                  onClick={onClose}
                  className="hidden md:block absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition z-10 flex-shrink-0"
               >
                  <X className="w-6 h-6" />
               </button>

               {/* Form Area */}
               <div className="flex-1 overflow-y-auto p-6 md:p-10">
                  <form
                     id="family-form"
                     onSubmit={handleSubmit}
                     className="max-w-3xl mx-auto space-y-6"
                  >
                     <div className="mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                           <CurrentIcon className="w-8 h-8 text-indigo-500" />
                           {STEPS[currentStep - 1].name}
                        </h1>
                        <p className="text-gray-500">
                           {STEPS[currentStep - 1].subtitle}
                        </p>
                     </div>

                     {/* STEP 1 */}
                     {currentStep === 1 && (
                        <div className="space-y-6 animate-fadeIn">
                           <Input
                              label="Familienname *"
                              value={formData.familyName}
                              onChange={(v) => update("familyName", v)}
                              error={errors.familyName}
                              placeholder="Müller"
                           />

                           <div className="grid md:grid-cols-2 gap-5">
                              <Input
                                 label="Name Vater"
                                 value={formData.fatherName}
                                 onChange={(v) => update("fatherName", v)}
                                 placeholder="Hans"
                              />
                              <Input
                                 label="Name Mutter"
                                 value={formData.motherName}
                                 onChange={(v) => update("motherName", v)}
                                 placeholder="Greta"
                              />
                           </div>

                           <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100 grid md:grid-cols-2 gap-5">
                              <Input
                                 icon={Phone}
                                 label="Telefon *"
                                 value={formData.phone}
                                 onChange={(v) => update("phone", v)}
                                 error={errors.phone}
                                 placeholder="+49..."
                                 bg="bg-white"
                              />
                              <Input
                                 icon={Mail}
                                 label="E-Mail *"
                                 value={formData.email}
                                 onChange={(v) => update("email", v)}
                                 error={errors.email}
                                 placeholder="mail@example.com"
                                 bg="bg-white"
                              />
                           </div>

                           <div className="grid md:grid-cols-2 gap-5">
                              <Input
                                 icon={Globe}
                                 label="Gesprochene Sprachen"
                                 value={formData.languagesSpoken}
                                 onChange={(v) => update("languagesSpoken", v)}
                                 placeholder="Deutsch, Englisch..."
                              />
                              <Counter
                                 label="Anzahl Familienmitglieder"
                                 value={formData.members}
                                 onChange={(v) => update("members", v)}
                                 icon={Users}
                              />
                           </div>
                        </div>
                     )}

                     {/* STEP 2 */}
                     {currentStep === 2 && (
                        <div className="space-y-6 animate-fadeIn">
                           <div className="bg-indigo-50 p-6 rounded-3xl flex flex-col items-center justify-center text-center mb-6">
                              <MapPin className="w-12 h-12 text-indigo-500 mb-3" />
                              <h3 className="text-indigo-900 font-bold">
                                 Standort festlegen
                              </h3>
                              <p className="text-indigo-600 text-sm">
                                 Wo wohnt die Familie?
                              </p>
                           </div>

                           <Input
                              label="Vollständige Adresse *"
                              value={formData.address}
                              onChange={(v) => update("address", v)}
                              error={errors.address}
                              placeholder="Straße und Hausnummer"
                           />

                           <div className="grid md:grid-cols-2 gap-5">
                              <Input
                                 label="Stadt *"
                                 value={formData.city}
                                 onChange={(v) => update("city", v)}
                                 error={errors.city}
                              />
                              <Input
                                 label="Land *"
                                 value={formData.country}
                                 onChange={(v) => update("country", v)}
                                 error={errors.country}
                              />
                           </div>
                        </div>
                     )}

                     {/* STEP 3 */}
                     {currentStep === 3 && (
                        <div className="space-y-8 animate-fadeIn">
                           <div className="flex justify-center">
                              <Counter
                                 label="Anzahl der Kinder"
                                 value={formData.childrenCount}
                                 onChange={(v) => update("childrenCount", v)}
                                 icon={Baby}
                                 large
                              />
                           </div>

                           <div className="grid md:grid-cols-1 gap-5">
                              <Input
                                 label="Alter der Kinder (durch Komma getrennt)"
                                 value={formData.childrenAges}
                                 onChange={(v) => update("childrenAges", v)}
                                 placeholder="z.B.: 2, 5, 8"
                              />
                              <TextArea
                                 label="Zusätzliche Infos zu den Kindern"
                                 value={formData.childrenDescription}
                                 onChange={(v) => update("childrenDescription", v)}
                                 placeholder="Charakter, Interessen, Kindergarten- / Schulzeiten..."
                              />
                           </div>
                        </div>
                     )}

                     {/* STEP 4 */}
                     {currentStep === 4 && (
                        <div className="space-y-6 animate-fadeIn">
                           <div className="grid md:grid-cols-2 gap-5">
                              <Input
                                 icon={Clock}
                                 type="number"
                                 label="Wöchentliche Arbeitsstunden"
                                 value={formData.workingHoursPerWeek}
                                 onChange={(v) => update("workingHoursPerWeek", v)}
                                 placeholder="30"
                              />
                              <Input
                                 icon={DollarSign}
                                 type="number"
                                 label="Taschengeld (€)"
                                 value={formData.pocketMoney}
                                 onChange={(v) => update("pocketMoney", v)}
                                 placeholder="280"
                              />
                           </div>

                           <div className="grid md:grid-cols-2 gap-4">
                              <ToggleCard
                                 icon={Car}
                                 label="Führerschein erforderlich"
                                 checked={formData.needsDrivingLicense}
                                 onChange={(v) => update("needsDrivingLicense", v)}
                              />
                              <ToggleCard
                                 icon={Utensils}
                                 label="Verpflegung wird gestellt"
                                 checked={formData.mealsProvided}
                                 onChange={(v) => update("mealsProvided", v)}
                              />
                           </div>

                           <TextArea
                              label="Aufgaben im Alltag"
                              value={formData.duties}
                              onChange={(v) => update("duties", v)}
                              placeholder="Kinder in die Schule bringen, spielen, leichte Hausarbeiten..."
                           />

                           <div className="grid md:grid-cols-2 gap-5">
                              <TextArea
                                 label="Zimmerbeschreibung"
                                 value={formData.roomDescription}
                                 onChange={(v) => update("roomDescription", v)}
                                 rows={2}
                              />
                              <TextArea
                                 label="Über die Familie (Interessen)"
                                 value={formData.familyDescription}
                                 onChange={(v) => update("familyDescription", v)}
                                 rows={2}
                              />
                           </div>

                           <Input
                              label="Bevorzugte Nationalitäten"
                              value={formData.preferences}
                              onChange={(v) => update("preferences", v)}
                              placeholder="z.B. Usbekisch, Türkisch..."
                           />

                           <div className="border-t pt-4 flex items-center justify-between">
                              <span className="font-bold text-gray-700">
                                 Familienstatus
                              </span>
                              <button
                                 type="button"
                                 onClick={() => update("isActive", !formData.isActive)}
                                 className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${formData.isActive
                                    ? "bg-green-100 text-green-700"
                                    : "bg-gray-100 text-gray-500"
                                    }`}
                              >
                                 {formData.isActive ? (
                                    <ToggleRight className="w-6 h-6" />
                                 ) : (
                                    <ToggleLeft className="w-6 h-6" />
                                 )}
                                 {formData.isActive ? "AKTIV" : "INAKTIV"}
                              </button>
                           </div>
                        </div>
                     )}
                  </form>
               </div>

               {/* Footer Navigation */}
               <div className="p-6 border-t border-gray-100 bg-gray-50 flex items-center justify-between flex-shrink-0">
                  {currentStep > 1 ? (
                     <button
                        type="button"
                        onClick={handlePrev}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-gray-600 hover:bg-white hover:shadow-sm transition font-medium"
                     >
                        <ChevronLeft className="w-5 h-5" /> Zurück
                     </button>
                  ) : (
                     <div />
                  )}

                  {currentStep < STEPS.length ? (
                     <button
                        type="button"
                        onClick={handleNext}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition font-bold"
                     >
                        Weiter <ChevronRight className="w-5 h-5" />
                     </button>
                  ) : (
                     <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-2.5 rounded-xl bg-green-600 text-white shadow-lg shadow-green-200 hover:bg-green-700 transition font-bold disabled:opacity-70"
                     >
                        {loading ? "Wird gespeichert..." : "Speichern"}
                        <Save className="w-5 h-5" />
                     </button>
                  )}
               </div>
            </div>
         </div>
      </div>
   );
}

// --- SUB-COMPONENTS (Modern UI Kit) ---

function Input({
   label,
   value,
   onChange,
   type = "text",
   placeholder,
   error,
   icon: Icon,
   bg = "bg-gray-50",
}) {
   return (
      <div className="w-full">
         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
            {label}
         </label>
         <div className="relative group">
            {Icon && (
               <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
            )}
            <input
               type={type}
               value={value || ""}
               onChange={(e) => onChange(e.target.value)}
               placeholder={placeholder}
               className={`w-full ${Icon ? "pl-11" : "pl-4"
                  } pr-4 py-3 rounded-xl border ${error ? "border-red-300 bg-red-50" : `border-gray-200 ${bg}`
                  } focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-800 font-medium`}
            />
         </div>
         {error && (
            <p className="text-red-500 text-xs mt-1 ml-1">{error}</p>
         )}
      </div>
   );
}

function TextArea({ label, value, onChange, rows = 3, placeholder }) {
   return (
      <div className="w-full">
         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5 ml-1">
            {label}
         </label>
         <textarea
            rows={rows}
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-gray-800 font-medium resize-none"
         />
      </div>
   );
}

function Counter({ label, value, onChange, icon: Icon, large }) {
   return (
      <div className={`flex flex-col ${large ? "items-center" : "items-start"}`}>
         <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">
            {label}
         </label>
         <div
            className={`flex items-center gap-4 bg-gray-50 rounded-2xl border border-gray-200 p-2 ${large ? "px-8 py-4" : ""
               }`}
         >
            <button
               type="button"
               onClick={() => onChange(Math.max(0, value - 1))}
               className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-indigo-600 active:scale-95 transition"
            >
               -
            </button>
            <div
               className={`font-bold text-gray-900 flex items-center gap-2 ${large ? "text-2xl" : "text-lg"
                  }`}
            >
               {Icon && (
                  <Icon
                     className={
                        large
                           ? "w-6 h-6 text-indigo-500"
                           : "w-5 h-5 text-gray-400"
                     }
                  />
               )}
               {value}
            </div>
            <button
               type="button"
               onClick={() => onChange(Number(value) + 1)}
               className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-100 hover:text-indigo-600 active:scale-95 transition"
            >
               +
            </button>
         </div>
      </div>
   );
}

function ToggleCard({ icon: Icon, label, checked, onChange }) {
   return (
      <div
         onClick={() => onChange(!checked)}
         className={`cursor-pointer flex items-center gap-3 p-4 rounded-xl border-2 transition-all
            ${checked
               ? "border-indigo-500 bg-indigo-50/50"
               : "border-gray-200 bg-white hover:border-gray-300"
            }
         `}
      >
         <div
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${checked ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-400"
               }`}
         >
            <Icon className="w-5 h-5" />
         </div>
         <div className="flex-1">
            <p
               className={`font-bold text-sm ${checked ? "text-indigo-900" : "text-gray-700"
                  }`}
            >
               {label}
            </p>
            <p className="text-xs text-gray-500">
               {checked ? "Vorhanden" : "Nicht vorhanden"}
            </p>
         </div>
         {checked && <Check className="w-5 h-5 text-indigo-600" />}
      </div>
   );
}
