import { useEffect, useMemo, useRef, useState } from "react";
import {
  X, Save, User, MapPin, Briefcase, Heart, Languages,
  GraduationCap, Award, FileText, Image as ImageIcon,
  Plus, Trash2, Car, Cigarette, PawPrint, Calendar, DollarSign
} from "lucide-react";

const SECTIONS = [
  { id: "personal", label: "Persönliche Daten", icon: User },
  { id: "contact", label: "Kontakt", icon: MapPin },
  { id: "professional", label: "Profession & Verfügbarkeit", icon: Briefcase },
  { id: "experience", label: "Erfahrungen", icon: Briefcase },
  { id: "languages", label: "Sprachen", icon: Languages },
  { id: "education", label: "Ausbildung", icon: GraduationCap },
  { id: "hobbies", label: "Hobbys", icon: Heart },
  { id: "certs", label: "Zertifikate", icon: Award },
  { id: "files", label: "Dateien (Foto & CV)", icon: FileText },
];

const emptyExperience = () => ({
  positionTitle: "",
  companyName: "",
  startDate: "",
  endDate: "",
  responsibilities: "",
});
const emptyLanguage = () => ({ language: "", level: "" });
const emptyEducation = () => ({ schoolName: "", startDate: "", endDate: "", description: "" });
const emptyHobby = () => ({ name: "" });
const emptyCert = () => ({ title: "", issuer: "", date: "", filePath: "" });

export default function CandidateModal({ show, onClose, item, onSave }) {
  const [saving, setSaving] = useState(false);

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

  // files
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cvFile, setCvFile] = useState(null);

  // section refs for smooth scroll
  const sectionRefs = useRef({});
  const containerRef = useRef(null);
  const [activeSection, setActiveSection] = useState("personal");

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
  }, [item]);

  useEffect(() => {
    if (!show) return;
    // reset files each open if creating new
    if (!item) {
      setPhotoFile(null);
      setPhotoPreview(null);
      setCvFile(null);
    }
  }, [show, item]);

  const scrollTo = (id) => {
    const el = sectionRefs.current[id];
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // observe active section during scroll
  useEffect(() => {
    if (!show) return;
    const root = containerRef.current;
    if (!root) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.dataset?.section) {
          setActiveSection(visible.target.dataset.section);
        }
      },
      { root, threshold: [0.2, 0.5, 0.8] }
    );

    SECTIONS.forEach((s) => {
      const el = sectionRefs.current[s.id];
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [show]);

  const update = (field, value) =>
    setFormData((p) => ({ ...p, [field]: value }));

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

  const handlePhotoChange = (file) => {
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleCvChange = (file) => {
    if (!file) return;
    setCvFile(file);
  };

  const validate = () => {
    const errs = [];
    if (!formData.name?.trim()) errs.push("Vorname ist erforderlich");
    if (!formData.surname?.trim()) errs.push("Nachname ist erforderlich");
    if (!formData.phone?.trim()) errs.push("Telefon ist erforderlich");
    if (!formData.email?.trim()) errs.push("E-Mail ist erforderlich");
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email))
      errs.push("E-Mail Format ist ungültig");
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (errs.length) {
      alert(errs.join("\n"));
      return;
    }
    try {
      setSaving(true);
      await onSave(formData, photoFile, cvFile);
    } finally {
      setSaving(false);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-6xl rounded-3xl shadow-2xl overflow-hidden">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-white/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
              {item ? "E" : "N"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {item ? "Kandidat bearbeiten" : "Neuen Kandidaten erstellen"}
              </h2>
              <p className="text-sm text-gray-500">
                Alle Informationen in einem Formular
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition"
          >
            <X className="w-6 h-6 text-gray-700" />
          </button>
        </div>

        {/* Body */}
        <div className="flex">
          {/* Left nav */}
          <aside className="hidden md:block w-72 border-r bg-gray-50 p-4">
            <nav className="space-y-1">
              {SECTIONS.map((s) => {
                const Icon = s.icon;
                const active = activeSection === s.id;
                return (
                  <button
                    key={s.id}
                    onClick={() => scrollTo(s.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-semibold transition
                      ${active ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-white"}
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {s.label}
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Form scroll area */}
          <main
            ref={containerRef}
            className="flex-1 max-h-[75vh] overflow-y-auto p-6 space-y-8"
          >
            {/* PERSONAL */}
            <Section id="personal" title="Persönliche Daten" icon={User} sectionRefs={sectionRefs}>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Vorname *">
                  <input
                    className="input"
                    value={formData.name}
                    onChange={(e) => update("name", e.target.value)}
                    placeholder="z.B. Ali"
                  />
                </Field>
                <Field label="Nachname *">
                  <input
                    className="input"
                    value={formData.surname}
                    onChange={(e) => update("surname", e.target.value)}
                    placeholder="z.B. Karimov"
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Geburtsdatum">
                  <input
                    type="date"
                    className="input"
                    value={formData.birthday || ""}
                    onChange={(e) => update("birthday", e.target.value)}
                  />
                </Field>
                <Field label="Geschlecht">
                  <select
                    className="input"
                    value={formData.gender || ""}
                    onChange={(e) => update("gender", e.target.value)}
                  >
                    <option value="">—</option>
                    <option value="MALE">Männlich</option>
                    <option value="FEMALE">Weiblich</option>
                    <option value="OTHER">Andere</option>
                  </select>
                </Field>
                <Field label="Nationalität">
                  <input
                    className="input"
                    value={formData.nationality || ""}
                    onChange={(e) => update("nationality", e.target.value)}
                    placeholder="z.B. Uzbek"
                  />
                </Field>
              </div>
            </Section>

            {/* CONTACT */}
            <Section id="contact" title="Kontakt & Adresse" icon={MapPin} sectionRefs={sectionRefs}>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Telefon *">
                  <input
                    className="input"
                    value={formData.phone}
                    onChange={(e) => update("phone", e.target.value)}
                    placeholder="+998 90 123 45 67"
                  />
                </Field>
                <Field label="E-Mail *">
                  <input
                    className="input"
                    value={formData.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="email@mail.com"
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Land">
                  <input
                    className="input"
                    value={formData.country || ""}
                    onChange={(e) => update("country", e.target.value)}
                  />
                </Field>
                <Field label="Stadt">
                  <input
                    className="input"
                    value={formData.city || ""}
                    onChange={(e) => update("city", e.target.value)}
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Straße">
                  <input
                    className="input"
                    value={formData.street || ""}
                    onChange={(e) => update("street", e.target.value)}
                  />
                </Field>
                <Field label="PLZ">
                  <input
                    className="input"
                    value={formData.zipCode || ""}
                    onChange={(e) => update("zipCode", e.target.value)}
                  />
                </Field>
              </div>
            </Section>

            {/* PROFESSIONAL */}
            <Section id="professional" title="Profession & Verfügbarkeit" icon={Briefcase} sectionRefs={sectionRefs}>
              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Beruf / Titel">
                  <input
                    className="input"
                    value={formData.professionTitle || ""}
                    onChange={(e) => update("professionTitle", e.target.value)}
                    placeholder="z.B. Au Pair / Babysitter"
                  />
                </Field>

                <Field label="Wunschland">
                  <input
                    className="input"
                    value={formData.desiredCountry || ""}
                    onChange={(e) => update("desiredCountry", e.target.value)}
                    placeholder="z.B. Deutschland"
                  />
                </Field>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <Field label="Verfügbar ab">
                  <input
                    type="date"
                    className="input"
                    value={formData.availableFrom || ""}
                    onChange={(e) => update("availableFrom", e.target.value)}
                  />
                </Field>
                <Field label="Verfügbar bis">
                  <input
                    type="date"
                    className="input"
                    value={formData.availableUntil || ""}
                    onChange={(e) => update("availableUntil", e.target.value)}
                  />
                </Field>
                <Field label="Taschengeld (€/Monat)">
                  <input
                    type="number"
                    className="input"
                    value={formData.expectedPocketMoney || ""}
                    onChange={(e) => update("expectedPocketMoney", e.target.value)}
                    placeholder="280"
                  />
                </Field>
              </div>

              <div className="flex flex-wrap gap-3">
                <Toggle
                  icon={Car}
                  label="Führerschein"
                  checked={!!formData.drivingLicense}
                  onChange={(v) => update("drivingLicense", v)}
                />
                <Toggle
                  icon={Cigarette}
                  label="Raucher"
                  checked={!!formData.smoker}
                  onChange={(v) => update("smoker", v)}
                />
                <Toggle
                  icon={PawPrint}
                  label="Tierfreundlich"
                  checked={!!formData.petFriendly}
                  onChange={(v) => update("petFriendly", v)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Über mich">
                  <textarea
                    rows={4}
                    className="input"
                    value={formData.aboutMe || ""}
                    onChange={(e) => update("aboutMe", e.target.value)}
                    placeholder="Kurzbeschreibung…"
                  />
                </Field>
                <Field label="Motivation">
                  <textarea
                    rows={4}
                    className="input"
                    value={formData.motivation || ""}
                    onChange={(e) => update("motivation", e.target.value)}
                    placeholder="Warum möchten Sie Au Pair sein?"
                  />
                </Field>
              </div>
            </Section>

            {/* EXPERIENCES */}
            <Section id="experience" title="Erfahrungen" icon={Briefcase} sectionRefs={sectionRefs}
              action={<AddButton onClick={() => add("experiences", emptyExperience)} />}
            >
              {formData.experiences?.length ? (
                <div className="space-y-4">
                  {formData.experiences.map((ex, i) => (
                    <Card key={i}>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Position">
                          <input
                            className="input"
                            value={ex.positionTitle || ""}
                            onChange={(e) => updateList("experiences", i, "positionTitle", e.target.value)}
                          />
                        </Field>
                        <Field label="Firma / Familie">
                          <input
                            className="input"
                            value={ex.companyName || ""}
                            onChange={(e) => updateList("experiences", i, "companyName", e.target.value)}
                          />
                        </Field>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Start">
                          <input
                            type="date"
                            className="input"
                            value={ex.startDate || ""}
                            onChange={(e) => updateList("experiences", i, "startDate", e.target.value)}
                          />
                        </Field>
                        <Field label="Ende">
                          <input
                            type="date"
                            className="input"
                            value={ex.endDate || ""}
                            onChange={(e) => updateList("experiences", i, "endDate", e.target.value)}
                          />
                        </Field>
                      </div>

                      <Field label="Aufgaben / Verantwortung">
                        <textarea
                          rows={3}
                          className="input"
                          value={ex.responsibilities || ""}
                          onChange={(e) => updateList("experiences", i, "responsibilities", e.target.value)}
                        />
                      </Field>

                      <RemoveButton onClick={() => remove("experiences", i)} />
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyHint text="Noch keine Erfahrungen hinzugefügt." />
              )}
            </Section>

            {/* LANGUAGES */}
            <Section id="languages" title="Sprachen" icon={Languages} sectionRefs={sectionRefs}
              action={<AddButton onClick={() => add("languages", emptyLanguage)} />}
            >
              {formData.languages?.length ? (
                <div className="space-y-3">
                  {formData.languages.map((l, i) => (
                    <Card key={i} compact>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Sprache">
                          <input
                            className="input"
                            value={l.language || ""}
                            onChange={(e) => updateList("languages", i, "language", e.target.value)}
                            placeholder="Deutsch"
                          />
                        </Field>
                        <Field label="Niveau">
                          <input
                            className="input"
                            value={l.level || ""}
                            onChange={(e) => updateList("languages", i, "level", e.target.value)}
                            placeholder="A2 / B1 / C1"
                          />
                        </Field>
                      </div>
                      <RemoveButton onClick={() => remove("languages", i)} />
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyHint text="Keine Sprachen eingetragen." />
              )}
            </Section>

            {/* EDUCATION */}
            <Section id="education" title="Ausbildung" icon={GraduationCap} sectionRefs={sectionRefs}
              action={<AddButton onClick={() => add("educations", emptyEducation)} />}
            >
              {formData.educations?.length ? (
                <div className="space-y-4">
                  {formData.educations.map((ed, i) => (
                    <Card key={i}>
                      <Field label="Schule / Institut">
                        <input
                          className="input"
                          value={ed.schoolName || ""}
                          onChange={(e) => updateList("educations", i, "schoolName", e.target.value)}
                        />
                      </Field>

                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Start">
                          <input
                            type="date"
                            className="input"
                            value={ed.startDate || ""}
                            onChange={(e) => updateList("educations", i, "startDate", e.target.value)}
                          />
                        </Field>
                        <Field label="Ende">
                          <input
                            type="date"
                            className="input"
                            value={ed.endDate || ""}
                            onChange={(e) => updateList("educations", i, "endDate", e.target.value)}
                          />
                        </Field>
                      </div>

                      <Field label="Beschreibung">
                        <textarea
                          rows={3}
                          className="input"
                          value={ed.description || ""}
                          onChange={(e) => updateList("educations", i, "description", e.target.value)}
                        />
                      </Field>

                      <RemoveButton onClick={() => remove("educations", i)} />
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyHint text="Keine Ausbildung hinzugefügt." />
              )}
            </Section>

            {/* HOBBIES */}
            <Section id="hobbies" title="Hobbys" icon={Heart} sectionRefs={sectionRefs}
              action={<AddButton onClick={() => add("hobbies", emptyHobby)} />}
            >
              {formData.hobbies?.length ? (
                <div className="flex flex-wrap gap-3">
                  {formData.hobbies.map((h, i) => (
                    <div key={i} className="bg-white border rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                      <input
                        className="outline-none text-sm"
                        placeholder="Hobby"
                        value={h.name || ""}
                        onChange={(e) => updateList("hobbies", i, "name", e.target.value)}
                      />
                      <button onClick={() => remove("hobbies", i)} className="text-gray-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyHint text="Keine Hobbys." />
              )}
            </Section>

            {/* CERTIFICATES */}
            <Section id="certs" title="Zertifikate" icon={Award} sectionRefs={sectionRefs}
              action={<AddButton onClick={() => add("certificates", emptyCert)} />}
            >
              {formData.certificates?.length ? (
                <div className="space-y-4">
                  {formData.certificates.map((c, i) => (
                    <Card key={i}>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Field label="Titel">
                          <input
                            className="input"
                            value={c.title || ""}
                            onChange={(e) => updateList("certificates", i, "title", e.target.value)}
                          />
                        </Field>
                        <Field label="Aussteller">
                          <input
                            className="input"
                            value={c.issuer || ""}
                            onChange={(e) => updateList("certificates", i, "issuer", e.target.value)}
                          />
                        </Field>
                      </div>

                      <Field label="Datum">
                        <input
                          type="date"
                          className="input"
                          value={c.date || ""}
                          onChange={(e) => updateList("certificates", i, "date", e.target.value)}
                        />
                      </Field>

                      <RemoveButton onClick={() => remove("certificates", i)} />
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyHint text="Keine Zertifikate." />
              )}
            </Section>

            {/* FILES */}
            <Section id="files" title="Dateien" icon={FileText} sectionRefs={sectionRefs}>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Photo dropzone */}
                <Dropzone
                  title="Profilfoto"
                  subtitle="PNG/JPG, max 5MB"
                  icon={ImageIcon}
                  preview={photoPreview}
                  accept="image/*"
                  onPick={handlePhotoChange}
                />

                {/* CV dropzone */}
                <Dropzone
                  title="CV (PDF)"
                  subtitle="PDF, max 10MB"
                  icon={FileText}
                  accept="application/pdf"
                  onPick={handleCvChange}
                  fileName={cvFile?.name || (item?.cvFilePath ? "Vorhanden" : "")}
                />
              </div>
            </Section>
          </main>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t bg-white">
          <p className="text-sm text-gray-500">
            * Pflichtfelder
          </p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
              disabled={saving}
            >
              Abbrechen
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg transition inline-flex items-center gap-2"
              disabled={saving}
            >
              <Save className="w-4 h-4" />
              {saving ? "Speichern..." : "Speichern"}
            </button>
          </div>
        </div>
      </div>

      {/* Tailwind utils */}
      <style jsx>{`
        .input {
          width: 100%;
          border: 1px solid #e5e7eb;
          background: white;
          padding: 0.7rem 0.9rem;
          border-radius: 0.9rem;
          outline: none;
          transition: 0.15s;
          font-size: 0.95rem;
        }
        .input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
        }
      `}</style>
    </div>
  );
}

/* ---------------- UI helpers ---------------- */

function Section({ id, title, icon: Icon, action, children, sectionRefs }) {
  return (
    <section
      ref={(el) => (sectionRefs.current[id] = el)}
      data-section={id}
      className="scroll-mt-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">
        {children}
      </div>
    </section>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="text-xs font-bold text-gray-600 uppercase mb-2">{label}</div>
      {children}
    </label>
  );
}

function Card({ children, compact }) {
  return (
    <div className={`border border-gray-200 rounded-2xl p-4 bg-gray-50/40 ${compact ? "" : "space-y-3"}`}>
      {children}
    </div>
  );
}

function AddButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 shadow transition"
      type="button"
    >
      <Plus className="w-4 h-4" />
      Hinzufügen
    </button>
  );
}

function RemoveButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      type="button"
      className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
    >
      <Trash2 className="w-4 h-4" />
      Entfernen
    </button>
  );
}

function EmptyHint({ text }) {
  return <p className="text-sm text-gray-500">{text}</p>;
}

function Toggle({ icon: Icon, label, checked, onChange }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition
      ${checked ? "bg-blue-600 text-white border-blue-600 shadow" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"}`}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

function Dropzone({ title, subtitle, icon: Icon, accept, onPick, preview, fileName }) {
  const inputRef = useRef(null);

  const pick = () => inputRef.current?.click();

  const onFile = (e) => {
    const file = e.target.files?.[0];
    if (file) onPick(file);
  };

  return (
    <div className="border border-dashed border-gray-300 rounded-2xl p-5 bg-white hover:border-blue-400 transition">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-gray-500" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-500">{subtitle}</p>

          {preview && (
            <img
              src={preview}
              alt="preview"
              className="mt-3 w-32 h-32 rounded-xl object-cover border"
            />
          )}

          {fileName && !preview && (
            <p className="mt-3 text-sm font-semibold text-gray-700">
              Datei: {fileName}
            </p>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              onClick={pick}
              className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold text-sm transition"
            >
              Datei wählen
            </button>
          </div>

          <input
            ref={inputRef}
            hidden
            type="file"
            accept={accept}
            onChange={onFile}
          />
        </div>
      </div>
    </div>
  );
}
