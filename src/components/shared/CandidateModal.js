import { useState, useEffect } from "react";
import {
  X,
  Save,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Briefcase,
  FileText,
  Image,
  Plus,
  Trash2,
  Languages,
  GraduationCap,
  Heart,
  Award
} from "lucide-react";

const STEPS = [
  { id: 1, name: "Persönliche Daten", icon: User },
  { id: 2, name: "Adresse", icon: MapPin },
  { id: 3, name: "Profession", icon: Briefcase },
  { id: 4, name: "Details & Listen", icon: Heart },
  { id: 5, name: "Dateien (Foto & CV)", icon: FileText },
];

export default function CandidateModal({ show, onClose, item, onSave }) {
  const [currentStep, setCurrentStep] = useState(1);

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

  // Load item when editing
  useEffect(() => {
    if (item) {
      setFormData({
        ...formData,
        ...item,
      });
      if (item.profileImagePath) setPhotoPreview(item.profileImagePath);
    }
  }, [item]);

  const update = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addToList = (listName, emptyObject) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: [...prev[listName], emptyObject],
    }));
  };

  const removeFromList = (listName, i) => {
    setFormData((prev) => ({
      ...prev,
      [listName]: prev[listName].filter((_, idx) => idx !== i),
    }));
  };

  const updateListValue = (listName, index, field, value) => {
    setFormData((prev) => {
      const clone = [...prev[listName]];
      clone[index][field] = value;
      return { ...prev, [listName]: clone };
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    setPhotoFile(file);
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  const handleCvChange = (e) => {
    const file = e.target.files[0];
    setCvFile(file);
  };

  const handleSave = () => {
    onSave(formData, photoFile, cvFile);
  };

  if (!show) return null;

  const StepIcon = STEPS.find((s) => s.id === currentStep)?.icon;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        {/* HEADER */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <StepIcon className="w-6 h-6" />
            <h2 className="text-xl font-bold">{STEPS[currentStep - 1].name}</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-xl">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-6 space-y-6">
          {/* STEP 1 PERSONAL */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  className="field"
                  placeholder="Vorname"
                  value={formData.name}
                  onChange={(e) => update("name", e.target.value)}
                />
                <input
                  className="field"
                  placeholder="Nachname"
                  value={formData.surname}
                  onChange={(e) => update("surname", e.target.value)}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="date"
                  className="field"
                  value={formData.birthday}
                  onChange={(e) => update("birthday", e.target.value)}
                />
                <input
                  className="field"
                  placeholder="Geschlecht"
                  value={formData.gender}
                  onChange={(e) => update("gender", e.target.value)}
                />
              </div>

              <input
                className="field"
                placeholder="Nationalität"
                value={formData.nationality}
                onChange={(e) => update("nationality", e.target.value)}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  className="field"
                  placeholder="Telefon"
                  value={formData.phone}
                  onChange={(e) => update("phone", e.target.value)}
                />
                <input
                  className="field"
                  placeholder="E-Mail"
                  value={formData.email}
                  onChange={(e) => update("email", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 2 ADDRESS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <input
                className="field"
                placeholder="Land"
                value={formData.country}
                onChange={(e) => update("country", e.target.value)}
              />
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  className="field"
                  placeholder="Stadt"
                  value={formData.city}
                  onChange={(e) => update("city", e.target.value)}
                />
                <input
                  className="field"
                  placeholder="Postleitzahl"
                  value={formData.zipCode}
                  onChange={(e) => update("zipCode", e.target.value)}
                />
              </div>
              <input
                className="field"
                placeholder="Straße"
                value={formData.street}
                onChange={(e) => update("street", e.target.value)}
              />
            </div>
          )}

          {/* STEP 3 PROFESSION */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <input
                className="field"
                placeholder="Beruf / Profession"
                value={formData.professionTitle}
                onChange={(e) => update("professionTitle", e.target.value)}
              />

              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="date"
                  className="field"
                  value={formData.availableFrom}
                  onChange={(e) => update("availableFrom", e.target.value)}
                />
                <input
                  type="date"
                  className="field"
                  value={formData.availableUntil}
                  onChange={(e) => update("availableUntil", e.target.value)}
                />
              </div>

              <input
                className="field"
                placeholder="Gewünschtes Land"
                value={formData.desiredCountry}
                onChange={(e) => update("desiredCountry", e.target.value)}
              />

              <input
                className="field"
                placeholder="Taschengeld (optional)"
                value={formData.expectedPocketMoney}
                onChange={(e) => update("expectedPocketMoney", e.target.value)}
              />

              <textarea
                className="field"
                placeholder="Über mich"
                value={formData.aboutMe}
                onChange={(e) => update("aboutMe", e.target.value)}
              />

              <textarea
                className="field"
                placeholder="Motivation"
                value={formData.motivation}
                onChange={(e) => update("motivation", e.target.value)}
              />
            </div>
          )}

          {/* STEP 4 LISTS */}
          {currentStep === 4 && (
            <div className="space-y-8">
              {/* Experiences */}
              <div>
                <h3 className="section-title flex items-center gap-2">
                  <Briefcase className="w-4 h-4" /> Erfahrungen
                </h3>
                <button
                  className="btn-add"
                  onClick={() =>
                    addToList("experiences", {
                      positionTitle: "",
                      companyName: "",
                      startDate: "",
                      endDate: "",
                      responsibilities: "",
                    })
                  }
                >
                  <Plus /> Hinzufügen
                </button>

                <div className="space-y-4 mt-3">
                  {formData.experiences.map((ex, i) => (
                    <div key={i} className="item-box">
                      <input
                        className="field"
                        placeholder="Position"
                        value={ex.positionTitle}
                        onChange={(e) =>
                          updateListValue("experiences", i, "positionTitle", e.target.value)
                        }
                      />
                      <input
                        className="field"
                        placeholder="Firma"
                        value={ex.companyName}
                        onChange={(e) =>
                          updateListValue("experiences", i, "companyName", e.target.value)
                        }
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          className="field"
                          value={ex.startDate}
                          onChange={(e) =>
                            updateListValue("experiences", i, "startDate", e.target.value)
                          }
                        />
                        <input
                          type="date"
                          className="field"
                          value={ex.endDate}
                          onChange={(e) =>
                            updateListValue("experiences", i, "endDate", e.target.value)
                          }
                        />
                      </div>
                      <textarea
                        className="field"
                        placeholder="Aufgaben"
                        value={ex.responsibilities}
                        onChange={(e) =>
                          updateListValue("experiences", i, "responsibilities", e.target.value)
                        }
                      />
                      <button className="btn-delete" onClick={() => removeFromList("experiences", i)}>
                        <Trash2 className="w-4 h-4" />
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Languages */}
              <div>
                <h3 className="section-title flex items-center gap-2">
                  <Languages className="w-4 h-4" /> Sprachen
                </h3>
                <button
                  className="btn-add"
                  onClick={() => addToList("languages", { language: "", level: "" })}
                >
                  <Plus /> Hinzufügen
                </button>

                <div className="space-y-4 mt-3">
                  {formData.languages.map((l, i) => (
                    <div key={i} className="item-box">
                      <input
                        className="field"
                        placeholder="Sprache"
                        value={l.language}
                        onChange={(e) =>
                          updateListValue("languages", i, "language", e.target.value)
                        }
                      />
                      <input
                        className="field"
                        placeholder="Niveau (A1, B2...)"
                        value={l.level}
                        onChange={(e) =>
                          updateListValue("languages", i, "level", e.target.value)
                        }
                      />
                      <button className="btn-delete" onClick={() => removeFromList("languages", i)}>
                        <Trash2 className="w-4 h-4" />
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Education */}
              <div>
                <h3 className="section-title flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" /> Ausbildung
                </h3>
                <button
                  className="btn-add"
                  onClick={() =>
                    addToList("educations", {
                      schoolName: "",
                      startDate: "",
                      endDate: "",
                      description: "",
                    })
                  }
                >
                  <Plus /> Hinzufügen
                </button>

                <div className="space-y-4 mt-3">
                  {formData.educations.map((ed, i) => (
                    <div key={i} className="item-box">
                      <input
                        className="field"
                        placeholder="Schule"
                        value={ed.schoolName}
                        onChange={(e) =>
                          updateListValue("educations", i, "schoolName", e.target.value)
                        }
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <input
                          type="date"
                          className="field"
                          value={ed.startDate}
                          onChange={(e) =>
                            updateListValue("educations", i, "startDate", e.target.value)
                          }
                        />
                        <input
                          type="date"
                          className="field"
                          value={ed.endDate}
                          onChange={(e) =>
                            updateListValue("educations", i, "endDate", e.target.value)
                          }
                        />
                      </div>
                      <textarea
                        className="field"
                        placeholder="Beschreibung"
                        value={ed.description}
                        onChange={(e) =>
                          updateListValue("educations", i, "description", e.target.value)
                        }
                      />
                      <button className="btn-delete" onClick={() => removeFromList("educations", i)}>
                        <Trash2 className="w-4 h-4" />
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hobbies */}
              <div>
                <h3 className="section-title flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Hobbys
                </h3>
                <button
                  className="btn-add"
                  onClick={() => addToList("hobbies", { name: "" })}
                >
                  <Plus /> Hinzufügen
                </button>

                <div className="space-y-3 mt-3">
                  {formData.hobbies.map((h, i) => (
                    <div key={i} className="item-box flex items-center gap-3">
                      <input
                        className="field flex-1"
                        placeholder="Hobby"
                        value={h.name}
                        onChange={(e) =>
                          updateListValue("hobbies", i, "name", e.target.value)
                        }
                      />
                      <button className="btn-delete" onClick={() => removeFromList("hobbies", i)}>
                        <Trash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Certificates */}
              <div>
                <h3 className="section-title flex items-center gap-2">
                  <Award className="w-4 h-4" /> Zertifikate
                </h3>
                <button
                  className="btn-add"
                  onClick={() =>
                    addToList("certificates", {
                      title: "",
                      issuer: "",
                      date: "",
                      filePath: "",
                    })
                  }
                >
                  <Plus /> Hinzufügen
                </button>

                <div className="space-y-4 mt-3">
                  {formData.certificates.map((c, i) => (
                    <div key={i} className="item-box">
                      <input
                        className="field"
                        placeholder="Titel"
                        value={c.title}
                        onChange={(e) =>
                          updateListValue("certificates", i, "title", e.target.value)
                        }
                      />
                      <input
                        className="field"
                        placeholder="Ausgegeben von"
                        value={c.issuer}
                        onChange={(e) =>
                          updateListValue("certificates", i, "issuer", e.target.value)
                        }
                      />
                      <input
                        type="date"
                        className="field"
                        value={c.date}
                        onChange={(e) =>
                          updateListValue("certificates", i, "date", e.target.value)
                        }
                      />

                      <button className="btn-delete" onClick={() => removeFromList("certificates", i)}>
                        <Trash2 />
                        Entfernen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 5 FILES */}
          {currentStep === 5 && (
            <div className="space-y-6">
              {/* Photo */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Image className="w-4 h-4" /> Profilfoto
                </h3>
                <input type="file" accept="image/*" onChange={handlePhotoChange} />

                {photoPreview && (
                  <img
                    src={photoPreview}
                    className="w-32 h-32 rounded-xl mt-3 object-cover"
                  />
                )}
              </div>

              {/* CV */}
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> CV (PDF)
                </h3>
                <input type="file" accept="application/pdf" onChange={handleCvChange} />

                {cvFile && <p className="text-sm mt-2">Ausgewählt: {cvFile.name}</p>}
              </div>
            </div>
          )}
        </div>

        {/* FOOTER (NAVIGATION) */}
        <div className="sticky bottom-0 p-6 bg-gray-100 flex justify-between rounded-b-3xl">
          {currentStep > 1 ? (
            <button
              className="btn-secondary"
              onClick={() => setCurrentStep((s) => s - 1)}
            >
              <ChevronLeft /> Zurück
            </button>
          ) : (
            <div />
          )}

          {currentStep < STEPS.length ? (
            <button
              className="btn-primary"
              onClick={() => setCurrentStep((s) => s + 1)}
            >
              Weiter <ChevronRight />
            </button>
          ) : (
            <button className="btn-save" onClick={handleSave}>
              <Save className="w-5 h-5" /> Speichern
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
