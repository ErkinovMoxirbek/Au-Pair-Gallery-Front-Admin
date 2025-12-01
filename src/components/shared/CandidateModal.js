// src/components/shared/CandidateModal.js - MODERN REDESIGN (MULTI FILE UPLOAD + VALIDATION)
import { useEffect, useRef, useState } from "react";
import {
  X,
  Save,
  User,
  MapPin,
  Briefcase,
  Heart,
  Languages,
  GraduationCap,
  Award,
  FileText,
  Image as ImageIcon,
  Plus,
  Trash2,
  Car,
  Cigarette,
  PawPrint,
  CheckCircle2,
  Calendar,
} from "lucide-react";

// Navigatsiya bo'limlari
const SECTIONS = [
  { id: "personal", label: "Persönliche", icon: User },
  { id: "contact", label: "Kontakt", icon: MapPin },
  { id: "professional", label: "Profession", icon: Briefcase },
  { id: "experience", label: "Erfahrungen", icon: Briefcase },
  { id: "languages", label: "Sprachen", icon: Languages },
  { id: "education", label: "Ausbildung", icon: GraduationCap },
  { id: "hobbies", label: "Hobbys", icon: Heart },
  { id: "certs", label: "Zertifikate", icon: Award },
  { id: "files", label: "Dateien", icon: FileText },
];

// Language level enum (backend bilan mos)
const LANGUAGE_LEVELS = ["A1", "A2", "B1", "B2", "C1", "C2", "NATIVE"];

// Bo'sh obyektlar (Factories)
const emptyExperience = () => ({
  positionTitle: "",
  companyName: "",
  startDate: "",
  endDate: "",
  responsibilities: "",
});
const emptyLanguage = () => ({ language: "", level: "" });
const emptyEducation = () => ({
  schoolName: "",
  startDate: "",
  endDate: "",
  description: "",
});
const emptyHobby = () => ({ name: "" });
const emptyCert = () => ({ title: "", issuer: "", date: "", filePath: "" });

export default function CandidateModal({ show, onClose, item, onSave }) {
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("personal");

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    birthday: "",
    gender: "",
    nationality: "",
    phone: "",
    email: "",
    country: "",
    city: "",
    street: "",
    zipCode: "",
    professionTitle: "",
    drivingLicense: false,
    smoker: false,
    petFriendly: false,
    availableFrom: "",
    availableUntil: "",
    expectedPocketMoney: "",
    desiredCountry: "",
    aboutMe: "",
    motivation: "",
    experiences: [],
    languages: [],
    educations: [],
    hobbies: [],
    certificates: [],
  });

  // Files
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cvFile, setCvFile] = useState(null);

  // YANGI fayl state'lar
  const [certificateFile, setCertificateFile] = useState(null);
  const [diplomaFile, setDiplomaFile] = useState(null);
  const [passportFile, setPassportFile] = useState(null);

  // Refs for scroll handling
  const sectionRefs = useRef({});
  const containerRef = useRef(null);

  // Initialize Data
  useEffect(() => {
    if (!item) return;
    setFormData((p) => ({
      ...p,
      ...item,
      experiences: item.experiences || [],
      languages: item.languages || [],
      educations: item.educations || [],
      hobbies: item.hobbies || [],
      certificates: item.certificates || [],
    }));
    if (item.profileImagePath) setPhotoPreview(item.profileImagePath);

    // mavjud fayl pathlar bo'lsa, yangi fayl tanlanmaguncha null bo'lib turadi
    setCvFile(null);
    setCertificateFile(null);
    setDiplomaFile(null);
    setPassportFile(null);
  }, [item]);

  // Reset on Open (yangi candidate)
  useEffect(() => {
    if (!show) return;
    if (!item) {
      setFormData({
        name: "",
        surname: "",
        birthday: "",
        gender: "",
        nationality: "",
        phone: "",
        email: "",
        country: "",
        city: "",
        street: "",
        zipCode: "",
        professionTitle: "",
        drivingLicense: false,
        smoker: false,
        petFriendly: false,
        availableFrom: "",
        availableUntil: "",
        expectedPocketMoney: "",
        desiredCountry: "",
        aboutMe: "",
        motivation: "",
        experiences: [],
        languages: [],
        educations: [],
        hobbies: [],
        certificates: [],
      });
      setPhotoFile(null);
      setPhotoPreview(null);
      setCvFile(null);
      setCertificateFile(null);
      setDiplomaFile(null);
      setPassportFile(null);
    }
  }, [show, item]);

  // Scroll Spy Logic
  useEffect(() => {
    if (!show) return;
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting);
        if (visible?.target?.dataset?.section) {
          setActiveSection(visible.target.dataset.section);
        }
      },
      { root, threshold: 0.3, rootMargin: "-100px 0px -50% 0px" }
    );

    SECTIONS.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [show]);

  const scrollTo = (id) => {
    setActiveSection(id);
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // === FAYL VALIDATSIYA HELPERI ===
  const validateFile = (file, options) => {
    const { allowedMimePrefixes = [], allowedExtensions = [], fieldLabel, maxSizeMB } = options;

    if (!file) return false;

    const mime = file.type || "";
    const name = file.name?.toLowerCase() || "";

    // 1) Hajmni tekshirish (ixtiyoriy)
    if (maxSizeMB && file.size > maxSizeMB * 1024 * 1024) {
      alert(
        `${fieldLabel} uchun fayl hajmi ${maxSizeMB} MB dan oshmasligi kerak. Tanlagan fayl: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)} MB`
      );
      return false;
    }

    // 2) MIME turi bo‘yicha
    const mimeOk =
      allowedMimePrefixes.length === 0 ||
      allowedMimePrefixes.some((p) => mime.startsWith(p));

    // 3) Kengaytma bo‘yicha
    const extOk =
      allowedExtensions.length === 0 ||
      allowedExtensions.some((ext) => name.endsWith(ext));

    if (!mimeOk || !extOk) {
      alert(
        `${fieldLabel} uchun ushbu fayl turi ruxsat etilmagan.\nRuxsat etilgan formatlar: ${[
          ...allowedExtensions,
        ]
          .map((e) => e.replace(".", "").toUpperCase())
          .join(", ")}`
      );
      return false;
    }

    return true;
  };

  // State Helpers
  const update = (field, value) =>
    setFormData((p) => ({
      ...p,
      [field]: value,
    }));
  const add = (listName, factory) =>
    setFormData((p) => ({ ...p, [listName]: [...p[listName], factory()] }));
  const remove = (listName, idx) =>
    setFormData((p) => ({
      ...p,
      [listName]: p[listName].filter((_, i) => i !== idx),
    }));
  const updateList = (listName, idx, field, value) =>
    setFormData((p) => {
      const next = [...p[listName]];
      next[idx] = { ...next[idx], [field]: value };
      return { ...p, [listName]: next };
    });

  // Handlers + Fayl validatsiyasi

  const handlePhotoChange = (file) => {
    if (!file) return;

    const ok = validateFile(file, {
      fieldLabel: "Profilfoto",
      maxSizeMB: 5,
      allowedMimePrefixes: ["image/"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    });

    if (!ok) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleCvChange = (file) => {
    if (!file) return;

    const ok = validateFile(file, {
      fieldLabel: "Lebenslauf (CV)",
      maxSizeMB: 10,
      allowedMimePrefixes: ["application/pdf"],
      allowedExtensions: [".pdf"],
    });

    if (!ok) return;

    setCvFile(file);
  };

  const handleCertificateChange = (file) => {
    if (!file) return;

    const ok = validateFile(file, {
      fieldLabel: "Zertifikat",
      maxSizeMB: 10,
      allowedMimePrefixes: ["application/pdf", "image/"],
      allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    });

    if (!ok) return;

    setCertificateFile(file);
  };

  const handleDiplomaChange = (file) => {
    if (!file) return;

    const ok = validateFile(file, {
      fieldLabel: "Diplom / Übersetzung",
      maxSizeMB: 10,
      allowedMimePrefixes: ["application/pdf", "image/"],
      allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    });

    if (!ok) return;

    setDiplomaFile(file);
  };

  const handlePassportChange = (file) => {
    if (!file) return;

    const ok = validateFile(file, {
      fieldLabel: "Reisepass",
      maxSizeMB: 10,
      allowedMimePrefixes: ["application/pdf", "image/"],
      allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    });

    if (!ok) return;

    setPassportFile(file);
  };

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.surname?.trim()) {
      alert("Bitte Vor- und Nachnamen eingeben.");
      return;
    }
    try {
      setSaving(true);
      await onSave(
        formData,
        photoFile,
        cvFile,
        certificateFile,
        diplomaFile,
        passportFile
      );
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative bg-white w-full max-w-5xl h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* 1. Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-20">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {item ? `Kandidat bearbeiten: ${item.name}` : "Neuen Kandidaten erstellen"}
            </h2>
            <p className="text-sm text-gray-500">
              Bitte füllen Sie alle erforderlichen Felder aus
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* 2. Horizontal Sticky Nav */}
        <div className="border-b border-gray-100 bg-gray-50/50 overflow-x-auto no-scrollbar">
          <div className="flex px-6 items-center gap-1 min-w-max p-2">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border
                    ${
                      isActive
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200"
                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-indigo-100" : "text-gray-400"
                    }`}
                  />
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Main Content (Scrollable) */}
        <div
          ref={containerRef}
          className="flex-1 overflow-y-auto p-6 md:p-8 bg-white scroll-smooth"
        >
          <div className="max-w-4xl mx-auto space-y-12 pb-20">
            {/* PERSONAL */}
            <Section
              id="personal"
              title="Persönliche Daten"
              icon={User}
              sectionRefs={sectionRefs}
            >
              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Vorname *"
                  value={formData.name}
                  onChange={(v) => update("name", v)}
                />
                <Input
                  label="Nachname *"
                  value={formData.surname}
                  onChange={(v) => update("surname", v)}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Geburtsdatum"
                    value={formData.birthday}
                    onChange={(v) => update("birthday", v)}
                  />
                  <Select
                    label="Geschlecht"
                    value={formData.gender}
                    onChange={(v) => update("gender", v)}
                  >
                    <option value="">—</option>
                    <option value="MALE">Männlich</option>
                    <option value="FEMALE">Weiblich</option>
                    <option value="OTHER">Andere</option>
                  </Select>
                </div>
                <Input
                  label="Nationalität"
                  value={formData.nationality}
                  onChange={(v) => update("nationality", v)}
                />
              </div>
            </Section>

            {/* CONTACT */}
            <Section
              id="contact"
              title="Kontakt & Adresse"
              icon={MapPin}
              sectionRefs={sectionRefs}
            >
              <div className="grid md:grid-cols-2 gap-5">
                <Input
                  label="Telefon *"
                  value={formData.phone}
                  onChange={(v) => update("phone", v)}
                  placeholder="+998..."
                />
                <Input
                  label="E-Mail *"
                  value={formData.email}
                  onChange={(v) => update("email", v)}
                  placeholder="name@example.com"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="col-span-1 md:col-span-2">
                  <Input
                    label="Straße"
                    value={formData.street}
                    onChange={(v) => update("street", v)}
                  />
                </div>
                <Input
                  label="PLZ"
                  value={formData.zipCode}
                  onChange={(v) => update("zipCode", v)}
                />
                <Input
                  label="Stadt"
                  value={formData.city}
                  onChange={(v) => update("city", v)}
                />
              </div>
              <div className="mt-4">
                <Input
                  label="Land"
                  value={formData.country}
                  onChange={(v) => update("country", v)}
                />
              </div>
            </Section>

            {/* PROFESSIONAL */}
            <Section
              id="professional"
              title="Profession & Verfügbarkeit"
              icon={Briefcase}
              sectionRefs={sectionRefs}
            >
              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <Input
                  label="Beruf / Titel"
                  value={formData.professionTitle}
                  onChange={(v) => update("professionTitle", v)}
                  placeholder="z.B. Au Pair"
                />
                <Input
                  label="Wunschland"
                  value={formData.desiredCountry}
                  onChange={(v) => update("desiredCountry", v)}
                />
              </div>

              <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100 mb-5">
                <h4 className="text-sm font-bold text-indigo-900 mb-3 flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Zeitraum & Geld
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <Input
                    type="date"
                    label="Verfügbar ab"
                    value={formData.availableFrom}
                    onChange={(v) => update("availableFrom", v)}
                    bg="bg-white"
                  />
                  <Input
                    type="date"
                    label="Verfügbar bis"
                    value={formData.availableUntil}
                    onChange={(v) => update("availableUntil", v)}
                    bg="bg-white"
                  />
                  <Input
                    type="number"
                    label="Taschengeld (€)"
                    value={formData.expectedPocketMoney}
                    onChange={(v) => update("expectedPocketMoney", v)}
                    bg="bg-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-5">
                <FeatureToggle
                  icon={Car}
                  label="Führerschein"
                  checked={formData.drivingLicense}
                  onChange={(v) => update("drivingLicense", v)}
                />
                <FeatureToggle
                  icon={Cigarette}
                  label="Raucher"
                  checked={formData.smoker}
                  onChange={(v) => update("smoker", v)}
                />
                <FeatureToggle
                  icon={PawPrint}
                  label="Tierfreundlich"
                  checked={formData.petFriendly}
                  onChange={(v) => update("petFriendly", v)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <TextArea
                  label="Über mich"
                  value={formData.aboutMe}
                  onChange={(v) => update("aboutMe", v)}
                  rows={4}
                />
                <TextArea
                  label="Motivation"
                  value={formData.motivation}
                  onChange={(v) => update("motivation", v)}
                  rows={4}
                />
              </div>
            </Section>

            {/* EXPERIENCE */}
            <Section
              id="experience"
              title="Erfahrungen"
              icon={Briefcase}
              sectionRefs={sectionRefs}
              action={<AddButton onClick={() => add("experiences", emptyExperience)} />}
            >
              {formData.experiences.length === 0 && (
                <EmptyState text="Keine Erfahrungen hinzugefügt" />
              )}
              <div className="space-y-4">
                {formData.experiences.map((ex, i) => (
                  <Card
                    key={i}
                    onRemove={() => remove("experiences", i)}
                    title={`Position #${i + 1}`}
                  >
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <Input
                        label="Position"
                        value={ex.positionTitle}
                        onChange={(v) =>
                          updateList("experiences", i, "positionTitle", v)
                        }
                      />
                      <Input
                        label="Firma"
                        value={ex.companyName}
                        onChange={(v) =>
                          updateList("experiences", i, "companyName", v)
                        }
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <Input
                        type="date"
                        label="Start"
                        value={ex.startDate}
                        onChange={(v) =>
                          updateList("experiences", i, "startDate", v)
                        }
                      />
                      <Input
                        type="date"
                        label="Ende"
                        value={ex.endDate}
                        onChange={(v) =>
                          updateList("experiences", i, "endDate", v)
                        }
                      />
                    </div>
                    <TextArea
                      label="Aufgaben"
                      value={ex.responsibilities}
                      onChange={(v) =>
                        updateList("experiences", i, "responsibilities", v)
                      }
                      rows={2}
                      maxLength={255}
                    />
                  </Card>
                ))}
              </div>
            </Section>

            {/* LANGUAGES & HOBBIES */}
            <div className="grid md:grid-cols-2 gap-8">
              <Section
                id="languages"
                title="Sprachen"
                icon={Languages}
                sectionRefs={sectionRefs}
                action={<AddButton onClick={() => add("languages", emptyLanguage)} small />}
              >
                {formData.languages.length === 0 && (
                  <EmptyState text="Keine Sprachen" />
                )}
                <div className="space-y-3">
                  {formData.languages.map((l, i) => (
                    <div key={i} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Input
                          placeholder="Sprache (z.B. Deutsch)"
                          value={l.language}
                          onChange={(v) =>
                            updateList("languages", i, "language", v)
                          }
                        />
                      </div>
                      <div className="w-32">
                        <Select
                          label=""
                          value={l.level}
                          onChange={(v) =>
                            updateList("languages", i, "level", v)
                          }
                        >
                          <option value="">Level wählen</option>
                          {LANGUAGE_LEVELS.map((lvl) => (
                            <option key={lvl} value={lvl}>
                              {lvl}
                            </option>
                          ))}
                        </Select>
                      </div>
                      <button
                        onClick={() => remove("languages", i)}
                        className="p-3 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl mb-0.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </Section>

              <Section
                id="hobbies"
                title="Hobbys"
                icon={Heart}
                sectionRefs={sectionRefs}
                action={<AddButton onClick={() => add("hobbies", emptyHobby)} small />}
              >
                <div className="flex flex-wrap gap-2">
                  {formData.hobbies.map((h, i) => (
                    <div
                      key={i}
                      className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg"
                    >
                      <input
                        className="bg-transparent border-none outline-none text-sm text-indigo-900 placeholder-indigo-300 w-24"
                        placeholder="Hobby..."
                        value={h.name}
                        onChange={(e) =>
                          updateList("hobbies", i, "name", e.target.value)
                        }
                      />
                      <button
                        onClick={() => remove("hobbies", i)}
                        className="text-indigo-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {formData.hobbies.length === 0 && (
                    <span className="text-sm text-gray-400 italic">
                      Keine Hobbys
                    </span>
                  )}
                </div>
              </Section>
            </div>

            {/* EDUCATION */}
            <Section
              id="education"
              title="Ausbildung"
              icon={GraduationCap}
              sectionRefs={sectionRefs}
              action={<AddButton onClick={() => add("educations", emptyEducation)} />}
            >
              {formData.educations.length === 0 && (
                <EmptyState text="Keine Ausbildung" />
              )}
              <div className="space-y-4">
                {formData.educations.map((ed, i) => (
                  <Card key={i} onRemove={() => remove("educations", i)}>
                    <Input
                      label="Schule / Institut"
                      value={ed.schoolName}
                      onChange={(v) =>
                        updateList("educations", i, "schoolName", v)
                      }
                      className="mb-3"
                    />
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <Input
                        type="date"
                        label="Start"
                        value={ed.startDate}
                        onChange={(v) =>
                          updateList("educations", i, "startDate", v)
                        }
                      />
                      <Input
                        type="date"
                        label="Ende"
                        value={ed.endDate}
                        onChange={(v) =>
                          updateList("educations", i, "endDate", v)
                        }
                      />
                    </div>
                    <TextArea
                      label="Beschreibung"
                      value={ed.description}
                      onChange={(v) =>
                        updateList("educations", i, "description", v)
                      }
                      rows={2}
                      maxLength={255}
                    />
                  </Card>
                ))}
              </div>
            </Section>

            {/* CERTIFICATES (meta ma'lumotlar, fayl alohida files bo'limida) */}
            <Section
              id="certs"
              title="Zertifikate"
              icon={Award}
              sectionRefs={sectionRefs}
              action={<AddButton onClick={() => add("certificates", emptyCert)} />}
            >
              {formData.certificates.length === 0 && (
                <EmptyState text="Keine Zertifikate" />
              )}
              <div className="space-y-4">
                {formData.certificates.map((c, i) => (
                  <Card key={i} onRemove={() => remove("certificates", i)}>
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <Input
                        label="Titel"
                        value={c.title}
                        onChange={(v) =>
                          updateList("certificates", i, "title", v)
                        }
                      />
                      <Input
                        label="Aussteller"
                        value={c.issuer}
                        onChange={(v) =>
                          updateList("certificates", i, "issuer", v)
                        }
                      />
                    </div>
                    <Input
                      type="date"
                      label="Datum"
                      value={c.date}
                      onChange={(v) =>
                        updateList("certificates", i, "date", v)
                      }
                    />
                  </Card>
                ))}
              </div>
            </Section>

            {/* FILES */}
            <Section
              id="files"
              title="Dateien (Uploads)"
              icon={FileText}
              sectionRefs={sectionRefs}
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <FileUpload
                  label="Profilfoto"
                  accept="image/*"
                  icon={ImageIcon}
                  preview={photoPreview}
                  onChange={handlePhotoChange}
                  info="JPG, PNG, WEBP max 5MB"
                />
                <FileUpload
                  label="Lebenslauf (CV)"
                  accept="application/pdf"
                  icon={FileText}
                  fileName={
                    cvFile?.name || (item?.cvFilePath ? "CV ist vorhanden" : null)
                  }
                  onChange={handleCvChange}
                  info="Nur PDF, max 10MB"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <FileUpload
                  label="Zertifikat"
                  accept="application/pdf,image/*"
                  icon={Award}
                  fileName={
                    certificateFile?.name ||
                    (item?.certificateFilePath ? "Zertifikat vorhanden" : null)
                  }
                  onChange={handleCertificateChange}
                  info="PDF / JPG / PNG / WEBP max 10MB"
                />
                <FileUpload
                  label="Übersetzung von Zertifikaten/Diplomen"
                  accept="application/pdf,image/*"
                  icon={FileText}
                  fileName={
                    diplomaFile?.name ||
                    (item?.diplomaFilePath ? "Diplomübersetzung verfügbar" : null)
                  }
                  onChange={handleDiplomaChange}
                  info="PDF / JPG / PNG / WEBP max 10MB"
                />
                <FileUpload
                  label="Reisepass (optional)"
                  accept="application/pdf,image/*"
                  icon={FileText}
                  fileName={
                    passportFile?.name ||
                    (item?.passportFilePath ? "Reisepass vorhanden" : null)
                  }
                  onChange={handlePassportChange}
                  info="Optional, PDF / JPG / PNG / WEBP max 10MB"
                />
              </div>
            </Section>
          </div>
        </div>

        {/* 4. Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3 z-20">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-white hover:shadow-sm transition"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            <span>Speichern</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS FOR CLEANER CODE ---

const Section = ({ id, title, icon: Icon, action, children, sectionRefs }) => (
  <section
    ref={(el) => (sectionRefs.current[id] = el)}
    data-section={id}
    className="scroll-mt-24 group"
  >
    <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-2">
      <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
          <Icon className="w-5 h-5" />
        </div>
        {title}
      </h3>
      {action}
    </div>
    <div>{children}</div>
  </section>
);

const Input = ({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  className = "",
  bg = "bg-gray-50",
}) => (
  <div className={`flex flex-col gap-1.5 ${className}`}>
    {label && (
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
        {label}
      </label>
    )}
    <input
      type={type}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full px-4 py-2.5 rounded-xl border border-gray-200 ${bg} focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-800 text-sm`}
    />
  </div>
);

const Select = ({ label, value, onChange, children }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
        {label}
      </label>
    )}
    <div className="relative">
      <select
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full appearance-none px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-800 text-sm"
      >
        {children}
      </select>
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

// TextArea – maxLength va counter bilan
const TextArea = ({ label, value, onChange, rows = 3, maxLength }) => (
  <div className="flex flex-col gap-1.5">
    {label && (
      <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">
        {label}
      </label>
    )}
    <textarea
      rows={rows}
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      maxLength={maxLength}
      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-gray-800 text-sm resize-none"
    />
    {maxLength && (
      <div className="text-[11px] text-gray-400 text-right mt-1">
        {(value?.length || 0)}/{maxLength}
      </div>
    )}
  </div>
);

const Card = ({ children, onRemove, title }) => (
  <div className="relative p-5 rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow group">
    {title && (
      <div className="text-xs font-bold text-gray-400 uppercase mb-3">
        {title}
      </div>
    )}
    <button
      onClick={onRemove}
      className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition opacity-0 group-hover:opacity-100"
    >
      <Trash2 className="w-5 h-5" />
    </button>
    {children}
  </div>
);

const FeatureToggle = ({ icon: Icon, label, checked, onChange }) => (
  <button
    onClick={() => onChange(!checked)}
    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all
         ${
           checked
             ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-200"
             : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
         }
      `}
  >
    <Icon className="w-4 h-4" />
    {label}
    {checked && <CheckCircle2 className="w-4 h-4 ml-1" />}
  </button>
);

const AddButton = ({ onClick, small }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 rounded-lg font-medium transition-colors text-indigo-600 bg-indigo-50 hover:bg-indigo-100
         ${small ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm"}
      `}
  >
    <Plus className="w-4 h-4" /> Hinzufügen
  </button>
);

const EmptyState = ({ text }) => (
  <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/50">
    <p className="text-gray-400 text-sm">{text}</p>
  </div>
);

const FileUpload = ({ label, accept, icon: Icon, preview, fileName, onChange, info }) => {
  const inputRef = useRef(null);
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className="cursor-pointer group relative flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-200 hover:border-indigo-400 rounded-2xl bg-gray-50 hover:bg-indigo-50/30 transition-all text-center"
    >
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0])}
      />

      {preview ? (
        <img
          src={preview}
          alt="preview"
          className="w-24 h-24 object-cover rounded-full shadow-md mb-2"
        />
      ) : (
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 transition-colors ${
            fileName
              ? "bg-green-100 text-green-600"
              : "bg-indigo-100 text-indigo-600 group-hover:scale-110"
          }`}
        >
          {fileName ? (
            <CheckCircle2 className="w-7 h-7" />
          ) : (
            <Icon className="w-7 h-7" />
          )}
        </div>
      )}

      <div className="font-bold text-gray-700 mb-1">{label}</div>
      <div className="text-xs text-gray-400">{fileName || info}</div>
      {fileName && !preview && (
        <div className="mt-2 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
          Datei ausgewählt
        </div>
      )}
    </div>
  );
};
