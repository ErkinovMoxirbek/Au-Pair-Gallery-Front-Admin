// src/pages/dashboard/Candidates.js - MODERN REDESIGN (Erweiterte Version)
import { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  MapPin,
  Phone,
  Mail,
  X,
  Edit,
  Trash2,
  Briefcase,
  Car,
  Cigarette,
  PawPrint,
  FileText,
  Calendar,
  MoreHorizontal,
  ChevronRight,
  User,
  IdCard,
  Award,
  GraduationCap,
} from "lucide-react";

import dashboardService from "../../services/dashboardService";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import CandidateModal from "../../components/shared/CandidateModal";

// --- Helpers ---

// Datum richtig formatieren (DD.MM.YYYY)
const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(dateString + "T00:00:00").toLocaleDateString("de-DE");
  } catch (error) {
    return dateString;
  }
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString + "T00:00:00");
  } catch {
    return null;
  }
};

const genderLabels = {
  MALE: "Männlich",
  FEMALE: "Weiblich",
  OTHER: "Divers",
};

const languageLevelLabels = {
  NATIVE: "Muttersprache",
  C2: "C2 (Profi)",
  C1: "C1 (Fortgeschritten)",
  B2: "B2 (Obere Mittelstufe)",
  B1: "B1 (Mittelstufe)",
  A2: "A2 (Grundstufe)",
  A1: "A1 (Anfänger)",
};

// --- Sub-components ---

// Avatar (modernisiert mit Status-Punkt Platzhalter)
function CandidateAvatar({ name, profileImagePath, size = "md", className = "" }) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-10 h-10 text-xs",
    md: "w-14 h-14 text-lg",
    lg: "w-24 h-24 text-3xl",
    xl: "w-32 h-32 text-4xl",
  };

  const containerClass = `relative inline-block ${className}`;
  const imgClass = `${sizeClasses[size]} rounded-full object-cover border-4 border-white shadow-sm`;
  const fallbackClass = `${sizeClasses[size]} rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 font-bold border-4 border-white shadow-sm`;

  useEffect(() => {
    // Wenn sich der Bildpfad ändert, Fehlerstatus zurücksetzen
    setImgError(false);
  }, [profileImagePath]);

  return (
    <div className={containerClass}>
      {!profileImagePath || imgError ? (
        <div className={fallbackClass}>{name?.charAt(0)?.toUpperCase() || "C"}</div>
      ) : (
        <img
          src={profileImagePath}
          alt={name}
          className={imgClass}
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}

// Badge Component
const Badge = ({ icon: Icon, label, color = "gray" }) => {
  const colors = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-rose-50 text-rose-700",
    orange: "bg-amber-50 text-amber-700",
    indigo: "bg-indigo-50 text-indigo-700",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
        colors[color] || colors.gray
      }`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
};

export default function Candidates() {
  // State
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals & Drawer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  // Drawer State (rechte Seite)
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      // API-Call (Pagination/Sort optional – hier Standardwerte)
      const res = await dashboardService.getCandidates(0, 50, "id", "desc");
      const list = res?.data?.content || res?.data || res || [];
      setCandidates(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Fehler beim Laden der Kandidaten:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Aktualisiertes handleSave:
   * Nimmt alle Dateien vom CandidateModal entgegen:
   * (candidateData, photoFile, cvFile, certificateFile, diplomaFile, passportFile)
   */
  const handleSave = async (
    candidateData,
    photoFile,
    cvFile,
    certificateFile,
    diplomaFile,
    passportFile
  ) => {
    try {
      if (editingCandidate) {
        // === UPDATE ===
        const id = editingCandidate.id;

        // 1) JSON-Daten aktualisieren
        await dashboardService.updateCandidate(id, candidateData);

        // 2) Dateien an separate Endpoints schicken (falls vorhanden)
        const uploads = [];

        if (photoFile) {
          uploads.push(dashboardService.uploadCandidatePhoto(id, photoFile));
        }
        if (cvFile) {
          uploads.push(dashboardService.uploadCandidateCv(id, cvFile));
        }
        if (certificateFile) {
          uploads.push(dashboardService.uploadCandidateCertificate(id, certificateFile));
        }
        if (diplomaFile) {
          uploads.push(dashboardService.uploadCandidateDiploma(id, diplomaFile));
        }
        if (passportFile) {
          uploads.push(dashboardService.uploadCandidatePassport(id, passportFile));
        }

        if (uploads.length > 0) {
          await Promise.all(uploads);
        }
      } else {
        // === CREATE ===
        const newCandidateRes = await dashboardService.createCandidate(candidateData);
        const created = newCandidateRes?.data || newCandidateRes;
        const newCandidateId = created?.id;

        if (newCandidateId) {
          const uploads = [];

          if (photoFile) {
            uploads.push(
              dashboardService.uploadCandidatePhoto(newCandidateId, photoFile)
            );
          }
          if (cvFile) {
            uploads.push(
              dashboardService.uploadCandidateCv(newCandidateId, cvFile)
            );
          }
          if (certificateFile) {
            uploads.push(
              dashboardService.uploadCandidateCertificate(
                newCandidateId,
                certificateFile
              )
            );
          }
          if (diplomaFile) {
            uploads.push(
              dashboardService.uploadCandidateDiploma(newCandidateId, diplomaFile)
            );
          }
          if (passportFile) {
            uploads.push(
              dashboardService.uploadCandidatePassport(newCandidateId, passportFile)
            );
          }

          if (uploads.length > 0) {
            await Promise.all(uploads);
          }
        }
      }

      await loadCandidates(); // Liste aktualisieren
      closeCreateModal();

      // Wenn der Detail-Drawer offen ist und wir gerade editiert haben, Details neu laden
      if (isDrawerOpen && editingCandidate) {
        openDrawer({ id: editingCandidate.id });
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      alert("Beim Speichern ist ein Fehler aufgetreten. Bitte Konsole prüfen.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Möchten Sie wirklich löschen?")) {
      try {
        await dashboardService.deleteCandidate(id);
        closeDrawer();
        await loadCandidates();
      } catch (error) {
        alert("Fehler beim Löschen: " + error.message);
        console.error("Delete error:", error);
      }
    }
  };

  // --- Actions ---
  const openCreateModal = (candidate = null) => {
    setEditingCandidate(candidate);
    setShowCreateModal(true);
  };

  const closeCreateModal = () => {
    setShowCreateModal(false);
    setEditingCandidate(null);
  };

  const openDrawer = async (candidate) => {
    if (!candidate) return;
    // Sofort grobe Infos anzeigen
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
    setDetailLoading(true);
    try {
      // Vollständige Daten laden (inkl. Presigned-URLs)
      const res = await dashboardService.getCandidate(candidate.id);
      setSelectedCandidate(res?.data || candidate);
    } catch (e) {
      console.error("Fehler beim Laden der vollständigen Daten:", e);
      alert("Beim Laden der Kandidatendetails ist ein Fehler aufgetreten.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    // Nach Animation aufräumen
    setTimeout(() => setSelectedCandidate(null), 300);
  };

  // --- Filterung ---
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    const s = searchTerm.toLowerCase();
    return candidates.filter((c) => {
      return (
        c.name?.toLowerCase().includes(s) ||
        c.surname?.toLowerCase().includes(s) ||
        c.professionTitle?.toLowerCase().includes(s) ||
        c.city?.toLowerCase().includes(s) ||
        c.email?.toLowerCase().includes(s) ||
        String(c.id).includes(s)
      );
    });
  }, [candidates, searchTerm]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      {/* 1. Top Navigation / Action Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kandidaten</h1>
            <p className="text-sm text-gray-500">
              Alle Kandidaten und Verwaltung ({candidates.length} Stück)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white border focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 rounded-lg text-sm w-full sm:w-64 transition-all"
              />
            </div>

            <button
              onClick={() => openCreateModal()}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Hinzufügen</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Content (Grid) */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              Keine Kandidaten gefunden
            </h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-1">
              Fügen Sie einen neuen Kandidaten hinzu oder ändern Sie den Suchbegriff.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => openDrawer(candidate)}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
              >
                {/* Card Header (Bg + Avatar) */}
                <div className="h-20 bg-gradient-to-r from-gray-100 to-gray-200 relative">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1.5 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-600">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="px-5 pb-5 flex-1 flex flex-col">
                  <div className="-mt-10 mb-3 flex justify-between items-end">
                    <CandidateAvatar
                      name={candidate.name}
                      profileImagePath={candidate.profileImagePath}
                      size="md"
                    />
                    <span className="text-xs font-mono text-gray-400 mb-1">
                      #{candidate.id}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors truncate">
                      {candidate.name} {candidate.surname}
                    </h3>
                    <p className="text-sm font-medium text-indigo-500 mb-1 truncate">
                      {candidate.professionTitle || "Beruf nicht angegeben"}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">
                        {[candidate.city, candidate.country].filter(Boolean).join(", ") ||
                          "Adresse nicht vorhanden"}
                      </span>
                    </div>
                  </div>

                  {/* Feature Tags */}
                  <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    {candidate.drivingLicense && (
                      <Badge icon={Car} label="FS vorhanden" color="orange" />
                    )}
                    {candidate.smoker && (
                      <Badge icon={Cigarette} label="Raucher" color="red" />
                    )}
                    {candidate.petFriendly && (
                      <Badge icon={PawPrint} label="Tierfreundlich" color="green" />
                    )}
                    {!candidate.drivingLicense &&
                      !candidate.smoker &&
                      !candidate.petFriendly && (
                        <span className="text-xs text-gray-400 italic">
                          Keine zusätzlichen Merkmale
                        </span>
                      )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                    <span className="text-gray-500">Details anzeigen</span>
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* 3. Slide-over Drawer (Detailansicht) */}
      <div
        className={`fixed inset-0 z-50 overflow-hidden ${
          isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity duration-300 ${
            isDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeDrawer}
        />

        {/* Panel */}
        <div
          className={`absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
            isDrawerOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {selectedCandidate && (
            <>
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>Kandidat-ID: {selectedCandidate.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      openCreateModal(selectedCandidate); // Für Bearbeitung Modal öffnen
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(selectedCandidate.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={closeDrawer}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Drawer Content (Scrollable) */}
              {detailLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                  {/* Hero Section */}
                  <div className="flex flex-col items-center text-center">
                    <CandidateAvatar
                      name={selectedCandidate.name}
                      profileImagePath={selectedCandidate.profileImagePath}
                      size="xl"
                      className="mb-4"
                    />
                    <h2 className="text-2xl font-bold text-gray-900">
                      {selectedCandidate.name} {selectedCandidate.surname}
                    </h2>
                    <p className="text-indigo-600 font-medium text-lg">
                      {selectedCandidate.professionTitle || "Beruf nicht angegeben"}
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                      {selectedCandidate.phone && (
                        <a
                          href={`tel:${selectedCandidate.phone}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                        >
                          <Phone className="w-4 h-4" /> {selectedCandidate.phone}
                        </a>
                      )}
                      {selectedCandidate.email && (
                        <a
                          href={`mailto:${selectedCandidate.email}`}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                        >
                          <Mail className="w-4 h-4" /> E-Mail
                        </a>
                      )}
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* Über mich & Motivation */}
                  {(selectedCandidate.aboutMe || selectedCandidate.motivation) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCandidate.aboutMe && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Über mich
                          </h4>
                          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                            {selectedCandidate.aboutMe}
                          </div>
                        </div>
                      )}
                      {selectedCandidate.motivation && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Motivation
                          </h4>
                          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                            {selectedCandidate.motivation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Persönliche Daten & Verfügbarkeit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Persönlich */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-500" /> Persönlich
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Geburtsdatum:</span>
                          <span className="font-medium">
                            {formatDate(selectedCandidate.birthday)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Geschlecht:</span>
                          <span className="font-medium">
                            {genderLabels[selectedCandidate.gender] || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Staatsangehörigkeit:</span>
                          <span className="font-medium">
                            {selectedCandidate.nationality || "—"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Adresse:</span>
                          <span className="font-medium text-right">
                            {[
                              selectedCandidate.street,
                              selectedCandidate.zipCode,
                              selectedCandidate.city,
                              selectedCandidate.country,
                            ]
                              .filter(Boolean)
                              .join(", ") || "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Verfügbarkeit */}
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" /> Verfügbarkeit
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Verfügbar ab:</span>
                          <span className="font-medium text-green-600">
                            {formatDate(selectedCandidate.availableFrom)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Verfügbar bis:</span>
                          <span className="font-medium text-red-600">
                            {formatDate(selectedCandidate.availableUntil)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Erwartetes Taschengeld:</span>
                          <span className="font-bold text-gray-900">
                            €{selectedCandidate.expectedPocketMoney || "0"}
                          </span>
                        </div>
                        {selectedCandidate.desiredCountry && (
                          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-500">Ziel-Land:</span>
                            <span className="font-medium text-indigo-600">
                              {selectedCandidate.desiredCountry}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Sprachen & Zusatzmerkmale */}
                  {(selectedCandidate.languages?.length > 0 ||
                    selectedCandidate.drivingLicense ||
                    selectedCandidate.smoker ||
                    selectedCandidate.petFriendly) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCandidate.languages?.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Sprachen
                          </h4>
                          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                            {selectedCandidate.languages.map((lang) => (
                              <div
                                key={lang.id}
                                className="flex items-center justify-between gap-3"
                              >
                                <span className="font-medium text-gray-800">
                                  {lang.language}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                                  {languageLevelLabels[lang.level] || lang.level}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(selectedCandidate.drivingLicense ||
                        selectedCandidate.smoker ||
                        selectedCandidate.petFriendly) && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                            Zusätzliche Merkmale
                          </h4>
                          <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-2 text-sm">
                            {selectedCandidate.drivingLicense && (
                              <Badge
                                icon={Car}
                                label="Führerschein vorhanden"
                                color="orange"
                              />
                            )}
                            {selectedCandidate.smoker && (
                              <Badge icon={Cigarette} label="Raucher" color="red" />
                            )}
                            {selectedCandidate.petFriendly && (
                              <Badge
                                icon={PawPrint}
                                label="Mag Tiere"
                                color="green"
                              />
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Bildung */}
                  {selectedCandidate.educations?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Bildung
                      </h4>
                      <div className="space-y-4">
                        {[...(selectedCandidate.educations || [])]
                          .sort(
                            (a, b) =>
                              (parseDate(b.startDate) || 0) -
                              (parseDate(a.startDate) || 0)
                          )
                          .map((edu) => (
                            <div
                              key={edu.id}
                              className="bg-gray-50 rounded-xl p-4 text-sm space-y-1"
                            >
                              <div className="font-bold text-gray-900">
                                {edu.schoolName || "Schule / Universität"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {formatDate(edu.startDate)} —{" "}
                                {edu.endDate ? formatDate(edu.endDate) : "Bis heute"}
                              </div>
                              {edu.description && (
                                <p className="text-gray-700 mt-1">
                                  {edu.description}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Berufserfahrung */}
                  {selectedCandidate.experiences?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-indigo-500" /> Erfahrung
                      </h4>
                      <div className="relative border-l-2 border-indigo-100 ml-2 space-y-6 pl-6 py-2">
                        {[...(selectedCandidate.experiences || [])]
                          .sort(
                            (a, b) =>
                              (parseDate(b.startDate) || 0) -
                              (parseDate(a.startDate) || 0)
                          )
                          .map((exp) => (
                            <div key={exp.id} className="relative">
                              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white"></span>
                              <h5 className="font-bold text-gray-900">
                                {exp.positionTitle || "Position"}
                              </h5>
                              <p className="text-sm text-indigo-600 mb-1">
                                {exp.companyName || "Unternehmen"}
                              </p>
                              <p className="text-xs text-gray-400 mb-2">
                                {formatDate(exp.startDate)} —{" "}
                                {exp.endDate ? formatDate(exp.endDate) : "Bis heute"}
                              </p>
                              {exp.responsibilities && (
                                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                  {exp.responsibilities}
                                </p>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Hobbys */}
                  {selectedCandidate.hobbies?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Hobbys & Interessen
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-2 text-sm">
                        {selectedCandidate.hobbies.map((hobby) => (
                          <span
                            key={hobby.id}
                            className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700"
                          >
                            {hobby.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zertifikate (aus Liste) */}
                  {selectedCandidate.certificates?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
                        Zertifikate
                      </h4>
                      <div className="space-y-3">
                        {selectedCandidate.certificates.map((cert) => (
                          <div
                            key={cert.id}
                            className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm"
                          >
                            <div>
                              <div className="font-bold text-gray-900">
                                {cert.title || "Zertifikat"}
                              </div>
                              <div className="text-xs text-gray-500">
                                {cert.issuer && <span>{cert.issuer}</span>}
                                {cert.date && (
                                  <span className="ml-2">
                                    ({formatDate(cert.date)})
                                  </span>
                                )}
                              </div>
                            </div>
                            {cert.filePath && cert.filePath.trim() && (
                              <a
                                href={cert.filePath}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-xs"
                              >
                                <FileText className="w-4 h-4" />
                                Zertifikat ansehen
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* DOKUMENTE (CV, Zertifikat, Diplom, Pass) */}
                  {(
                    selectedCandidate.cvFilePath ||
                    selectedCandidate.certificateFilePath ||
                    selectedCandidate.diplomaFilePath ||
                    selectedCandidate.passportFilePath
                  ) && (
                    <div className="pt-6 space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Dokumente
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* CV */}
                        {selectedCandidate.cvFilePath && (
                          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center">
                                <FileText className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  Lebenslauf (CV)
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  PDF-Dokument
                                </p>
                              </div>
                            </div>
                            <a
                              href={selectedCandidate.cvFilePath}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline self-start"
                            >
                              Ansehen →
                            </a>
                          </div>
                        )}

                        {/* Zertifikat (einzelne Datei) */}
                        {selectedCandidate.certificateFilePath && (
                          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                                <Award className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  Zertifikat
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  Sprach- / Kurszertifikat
                                </p>
                              </div>
                            </div>
                            <a
                              href={selectedCandidate.certificateFilePath}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline self-start"
                            >
                              Ansehen →
                            </a>
                          </div>
                        )}

                        {/* Diplom / Zeugnis */}
                        {selectedCandidate.diplomaFilePath && (
                          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                                <GraduationCap className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  Diplom / Zeugnis
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  Bildungsdokument
                                </p>
                              </div>
                            </div>
                            <a
                              href={selectedCandidate.diplomaFilePath}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline self-start"
                            >
                              Ansehen →
                            </a>
                          </div>
                        )}

                        {/* Reisepass */}
                        {selectedCandidate.passportFilePath && (
                          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex flex-col gap-3">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center">
                                <IdCard className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">
                                  Reisepass
                                </p>
                                <p className="text-[11px] text-gray-500">
                                  Reisepass-Scan
                                </p>
                              </div>
                            </div>
                            <a
                              href={selectedCandidate.passportFilePath}
                              target="_blank"
                              rel="noreferrer"
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline self-start"
                            >
                              Ansehen →
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="h-10"></div> {/* Bottom spacer */}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit/Create Modal */}
      {showCreateModal && (
        <CandidateModal
          show={showCreateModal}
          onClose={closeCreateModal}
          item={editingCandidate}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
