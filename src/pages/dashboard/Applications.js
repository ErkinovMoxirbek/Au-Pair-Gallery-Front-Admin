// src/pages/dashboard/Applications.js
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  Download,
  ChevronRight,
  User,
  Loader2,
  Edit,
  Calendar,
  GraduationCap,
  Globe,
  Award,
  BookOpen,
  Heart,
} from "lucide-react";
import dashboardService from "../../services/dashboardService";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import CandidateModal from "../../components/shared/CandidateModal"; // ⬅️ YANGI IMPORT

// --- Helpers ---

// Datum in DD.MM.YYYY-Format umwandeln
const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    const iso = dateString.includes("T") ? dateString : `${dateString}T00:00:00`;
    return new Date(iso).toLocaleDateString("de-DE");
  } catch (error) {
    return dateString;
  }
};

// Status Badge
const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    ACTIVE: "bg-emerald-100 text-emerald-700 border-emerald-200",
    REJECTED: "bg-rose-100 text-rose-700 border-rose-200",
  };
  const icons = {
    PENDING: <Clock className="w-3 h-3 mr-1" />,
    ACTIVE: <CheckCircle2 className="w-3 h-3 mr-1" />,
    REJECTED: <XCircle className="w-3 h-3 mr-1" />,
  };
  const label =
    status === "PENDING"
      ? "Ausstehend"
      : status === "ACTIVE"
      ? "Angenommen"
      : status === "REJECTED"
      ? "Abgelehnt"
      : status;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
        styles[status] || styles.PENDING
      }`}
    >
      {icons[status]}
      {label}
    </span>
  );
};

// Avatar
const Avatar = ({ url, name, size = "md" }) => {
  const sizeClass =
    size === "lg" ? "w-20 h-20 text-2xl" : "w-12 h-12 text-lg";
  const initial = name?.charAt(0).toUpperCase() || "C";

  return (
    <div
      className={`relative rounded-full overflow-hidden flex-shrink-0 bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm ${sizeClass}`}
    >
      {url ? (
        <img src={url} alt={name} className="w-full h-full object-cover" />
      ) : (
        initial
      )}
    </div>
  );
};

// --- HAUPTKOMPONENTE ---
export default function Applications() {
  // Listen-States
  const [applications, setApplications] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("PENDING");
  const [searchTerm, setSearchTerm] = useState("");

  // Detail-States
  const [selectedId, setSelectedId] = useState(null);
  const [fullCandidate, setFullCandidate] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Reject modal
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectSubmitting, setRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState("");

  // EDIT modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // ⬅️ YANGI

  // Liste laden – mit useCallback stabilisiert
  const fetchList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await dashboardService.getCandidatesByStatus(activeTab);
      const list = res?.data?.content || res?.data || res || [];
      setApplications(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("List error:", error);
      setApplications([]);
    } finally {
      setListLoading(false);
    }
  }, [activeTab]);

  // 1. Beim Statuswechsel Liste neu laden
  useEffect(() => {
    fetchList();
    setSelectedId(null);
    setFullCandidate(null);
  }, [activeTab, fetchList]);

  // 2. Beim ID-Wechsel vollständige Kandidaten-Daten laden
  useEffect(() => {
    if (!selectedId) return;

    const fetchDetail = async () => {
      setDetailLoading(true);
      setFullCandidate(null);
      try {
        const res = await dashboardService.getCandidate(selectedId);
        const candidate = res?.data || res;
        setFullCandidate(candidate || null);
      } catch (error) {
        console.error("Detail error:", error);
      } finally {
        setDetailLoading(false);
      }
    };

    fetchDetail();
  }, [selectedId]);

  // Kandidatni qabul qilish (ACTIVE)
  const handleAccept = async () => {
    if (!fullCandidate) return;

    if (
      !window.confirm(
        `Sind Sie sicher, dass Sie diesen Kandidaten annehmen möchten?`
      )
    ) {
      return;
    }

    try {
      await dashboardService.updateCandidateStatus(
        fullCandidate.id,
        "ACTIVE",
        null
      );

      setApplications((prev) =>
        prev.filter((app) => app.id !== fullCandidate.id)
      );
      setSelectedId(null);
      setFullCandidate(null);
    } catch (error) {
      console.error("Status update error", error);
      alert("Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut.");
    }
  };

  // Reject modal
  const openRejectModal = () => {
    setRejectReason("");
    setRejectError("");
    setIsRejectModalOpen(true);
  };

  const closeRejectModal = () => {
    if (rejectSubmitting) return;
    setIsRejectModalOpen(false);
    setRejectReason("");
    setRejectError("");
  };

  const handleConfirmReject = async () => {
    if (!fullCandidate) return;

    if (!rejectReason.trim()) {
      setRejectError("Bitte geben Sie einen Ablehnungsgrund ein.");
      return;
    }

    setRejectSubmitting(true);
    setRejectError("");

    try {
      await dashboardService.updateCandidateStatus(
        fullCandidate.id,
        "REJECTED",
        rejectReason.trim()
      );

      setApplications((prev) =>
        prev.filter((app) => app.id !== fullCandidate.id)
      );
      setSelectedId(null);
      setFullCandidate(null);

      setIsRejectModalOpen(false);
      setRejectReason("");
    } catch (error) {
      console.error("Reject error", error);
      setRejectError(
        "Es ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut."
      );
    } finally {
      setRejectSubmitting(false);
    }
  };

  // EDIT: modalni ochish
  const handleEdit = () => {
    if (!fullCandidate) return;
    setIsEditModalOpen(true);
  };

  // EDIT: saqlash (CandidateModal -> backend)
  const handleSaveCandidate = async (
    formData,
    photoFile,
    cvFile,
    certificateFile,
    diplomaFile,
    passportFile
  ) => {
    if (!fullCandidate) return;

    try {
      // API chaqirish – formData + fayllar
      const updated = await dashboardService.updateCandidate(
        fullCandidate.id,
        formData,
        {
          photoFile,
          cvFile,
          certificateFile,
          diplomaFile,
          passportFile,
        }
      );

      // detail va listni yangilash
      const candidateData = updated?.data || updated;

      setFullCandidate(candidateData || formData);
      setApplications((prev) =>
        prev.map((c) => (c.id === fullCandidate.id ? { ...c, ...candidateData } : c))
      );

      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Candidate update error:", error);
      alert(
        "Die Änderungen konnten nicht gespeichert werden. Bitte versuchen Sie es erneut."
      );
      throw error; // CandidateModal ichidagi spinner to‘g‘ri ishlashi uchun
    }
  };

  // Suchfilter
  const filteredList = applications.filter((app) => {
    const term = searchTerm.toLowerCase();
    return (
      (app.name && app.name.toLowerCase().includes(term)) ||
      (app.surname && app.surname.toLowerCase().includes(term))
    );
  });

  // Interessen-Liste in einen String umwandeln
  const hobbiesString = useMemo(
    () =>
      fullCandidate?.hobbies?.map((h) => h.name ?? h).join(", ") ||
      "Keine Angaben",
    [fullCandidate]
  );

  return (
    <div className="h-[calc(100vh-64px)] bg-gray-50 flex flex-col md:flex-row overflow-hidden">
      {/* 1. LINKE SEITE: LISTE */}
      <div className="w-full md:w-[400px] lg:w-[450px] bg-white border-r border-gray-200 flex flex-col h-full z-10 shadow-lg md:shadow-none flex-shrink-0">
        {/* Header & Tabs & Suche */}
        <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-20">
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Bewerbungen
          </h2>

          <div className="flex p-1 bg-gray-100 rounded-lg mb-4">
            {["PENDING", "ACTIVE", "REJECTED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === tab
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab === "PENDING"
                  ? "Neu"
                  : tab === "ACTIVE"
                  ? "Angenommen"
                  : "Abgelehnt"}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Nach Name suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
        </div>

        {/* Listen-Elemente */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {listLoading ? (
            <div className="py-10 flex justify-center">
              <LoadingSpinner />
            </div>
          ) : filteredList.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <User className="w-12 h-12 mb-2 opacity-20" />
              <p className="text-sm">Keine Bewerbungen gefunden</p>
            </div>
          ) : (
            filteredList.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedId(app.id)}
                className={`group flex items-start gap-3 p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedId === app.id
                    ? "bg-indigo-50/60 border-l-4 border-l-indigo-600"
                    : "border-l-4 border-l-transparent"
                }`}
              >
                <Avatar
                  url={app.profileImagePath}
                  name={app.name}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-sm font-bold truncate ${
                        selectedId === app.id
                          ? "text-indigo-900"
                          : "text-gray-900"
                      }`}
                    >
                      {app.name} {app.surname}
                    </h3>
                  </div>
                  <p className="text-xs text-indigo-600 font-medium truncate mb-1">
                    {app.professionTitle || "Kein Beruf angegeben"}
                  </p>
                  <p className="text-xs text-gray-500 truncate flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {app.city || "Stadt"},{" "}
                    {app.country || "Land nicht angegeben"}
                  </p>
                </div>
                <ChevronRight
                  className={`w-4 h-4 self-center text-gray-300 transition-transform ${
                    selectedId === app.id
                      ? "text-indigo-500 translate-x-1"
                      : ""
                  }`}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* 2. RECHTE SEITE: DETAILS */}
      <div className="flex-1 bg-gray-50 flex flex-col h-full overflow-hidden relative">
        {!selectedId ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Briefcase className="w-8 h-8 opacity-40" />
            </div>
            <h3 className="text-lg font-medium text-gray-600">
              Kein Kandidat ausgewählt
            </h3>
            <p className="text-sm max-w-xs text-center mt-2">
              Wählen Sie einen Kandidaten aus der linken Liste aus, um Details
              zu sehen.
            </p>
          </div>
        ) : detailLoading || !fullCandidate ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              <p className="text-sm text-gray-500">Daten werden geladen...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Detail-Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar
                  url={fullCandidate.profileImagePath}
                  name={fullCandidate.name}
                  size="lg"
                />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                    {fullCandidate.name} {fullCandidate.surname}
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm font-medium text-indigo-600">
                      {fullCandidate.professionTitle}
                    </span>
                    <span className="text-gray-300">•</span>
                    <StatusBadge status={fullCandidate.status || "PENDING"} />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 p-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100 font-semibold transition text-sm"
                >
                  <Edit className="w-4 h-4" />
                  Bearbeiten
                </button>
                {activeTab === "PENDING" && (
                  <>
                    <button
                      onClick={openRejectModal}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-semibold transition text-sm"
                    >
                      <XCircle className="w-4 h-4" />
                      Ablehnen
                    </button>
                    <button
                      onClick={handleAccept}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 font-semibold transition text-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Annehmen
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Scrollbarer Inhalt */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
              {/* Kontakte & Hauptinfos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500">Telefon</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {fullCandidate.phone || "—"}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500">E-Mail</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {fullCandidate.email || "—"}
                    </p>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs text-gray-500">Adresse</p>
                    <p className="font-semibold text-gray-900 truncate">
                      {fullCandidate.city || "—"},{" "}
                      {fullCandidate.country || "—"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Hauptinfos */}
                <div className="lg:col-span-2 space-y-8">
                  {/* Über mich */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <User className="w-5 h-5 text-gray-400" /> Über mich
                    </h3>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-gray-700 leading-relaxed shadow-sm whitespace-pre-wrap">
                      {fullCandidate.aboutMe || "Keine Angaben gemacht."}
                    </div>
                  </section>

                  {/* Motivation */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-gray-400" /> Motivation
                    </h3>
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 text-gray-700 leading-relaxed shadow-sm whitespace-pre-wrap">
                      {fullCandidate.motivation || "Keine Angaben gemacht."}
                    </div>
                  </section>

                  {/* Berufserfahrung */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <Briefcase className="w-5 h-5 text-gray-400" />{" "}
                      Berufserfahrung (
                      {fullCandidate.experiences?.length || 0})
                    </h3>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {fullCandidate.experiences?.length > 0 ? (
                        fullCandidate.experiences.map((exp, idx) => (
                          <div
                            key={idx}
                            className="p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="font-bold text-gray-900">
                                {exp.positionTitle}
                              </h4>
                              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg flex-shrink-0 ml-4">
                                {formatDate(exp.startDate)} -{" "}
                                {exp.endDate
                                  ? formatDate(exp.endDate)
                                  : "Aktuell"}
                              </span>
                            </div>
                            <p className="text-sm text-indigo-600 font-medium mb-2">
                              {exp.companyName}
                            </p>
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {exp.responsibilities}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 text-gray-500 italic">
                          Keine Berufserfahrung angegeben
                        </div>
                      )}
                    </div>
                  </section>

                  {/* Ausbildung */}
                  <section>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-gray-400" />{" "}
                      Ausbildung (
                      {fullCandidate.educations?.length || 0})
                    </h3>
                    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                      {fullCandidate.educations?.length > 0 ? (
                        fullCandidate.educations.map((edu, idx) => (
                          <div
                            key={idx}
                            className="p-5 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition"
                          >
                            <div className="flex justify_between items-start mb-1">
                              <h4 className="font-bold text-gray-900">
                                {edu.degree}
                              </h4>
                              <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded-lg flex-shrink-0 ml-4">
                                {formatDate(edu.startDate)} -{" "}
                                {edu.endDate
                                  ? formatDate(edu.endDate)
                                  : "Aktuell"}
                              </span>
                            </div>
                            <p className="text-sm text-indigo-600 font-medium mb-2">
                              {edu.institutionName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {edu.description}
                            </p>
                          </div>
                        ))
                      ) : (
                        <div className="p-5 text-gray-500 italic">
                          Keine Bildungsangaben gemacht
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* Zusätzliche Informationen */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4">
                      Zusätzliche Informationen
                    </h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <dt className="text-gray-500 flex items-center gap-1">
                          <Calendar className="w-4 h-4" /> Geburtsdatum
                        </dt>
                        <dd className="font-medium">
                          {formatDate(fullCandidate.birthday)}
                        </dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <dt className="text-gray-500 flex items-center gap-1">
                          <Heart className="w-4 h-4" /> Interessen
                        </dt>
                        <dd className="font-medium text-right max-w-[50%]">
                          {hobbiesString}
                        </dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <dt className="text-gray-500">Geschlecht</dt>
                        <dd className="font-medium">
                          {fullCandidate.gender || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <dt className="text-gray-500">Nationalität</dt>
                        <dd className="font-medium">
                          {fullCandidate.nationality || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <dt className="text-gray-500">Raucher</dt>
                        <dd className="font-medium">
                          {fullCandidate.smoker ? "Ja" : "Nein"}
                        </dd>
                      </div>
                      <div className="flex justify-between border-b border-gray-50 pb-2">
                        <dt className="text-gray-500">Haustierfreundlich</dt>
                        <dd className="font-medium">
                          {fullCandidate.petFriendly ? "Ja" : "Nein"}
                        </dd>
                      </div>
                      <div className="flex justify-between pt-1">
                        <dt className="text-gray-500">Führerschein</dt>
                        <dd className="font-medium">
                          {fullCandidate.drivingLicense
                            ? "Vorhanden"
                            : "Nicht vorhanden"}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  {/* Sprachkenntnisse */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Globe className="w-5 h-5 text-gray-400" /> Sprachkenntnisse (
                      {fullCandidate.languages?.length || 0})
                    </h3>
                    <div className="space-y-2">
                      {fullCandidate.languages?.length > 0 ? (
                        fullCandidate.languages.map((lang, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between py-1 border-b border-gray-50 last:border-0"
                          >
                            <span className="text-sm font-medium text-gray-700">
                              {lang.language}
                            </span>
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {lang.level}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-xs text-gray-400 italic">
                          Keine Sprachangaben gemacht
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Dokumente */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
                    <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Download className="w-5 h-5 text-gray-400" /> Dokumente
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "Lebenslauf", file: fullCandidate.cvFilePath },
                        { label: "Diplom", file: fullCandidate.diplomaFilePath },
                        {
                          label: "Zertifikat",
                          file: fullCandidate.certificateFilePath,
                          icon: Award,
                        },
                        { label: "Reisepass", file: fullCandidate.passportFilePath },
                      ]
                        .filter((doc) => !!doc.file)
                        .map((doc, i) => (
                          <a
                            key={i}
                            href={doc.file}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100 hover:bg-indigo-50 hover:border-indigo-200 transition group"
                          >
                            <span className="text-sm font-medium text-gray-700 group-hover:text-indigo-700">
                              {doc.label}
                            </span>
                            <Download className="w-4 h-4 text-gray-400 group-hover:text-indigo-500" />
                          </a>
                        ))}
                      {!fullCandidate.cvFilePath &&
                        !fullCandidate.diplomaFilePath &&
                        !fullCandidate.certificateFilePath &&
                        !fullCandidate.passportFilePath && (
                          <p className="text-xs text-gray-400">
                            Keine Dokumente hochgeladen
                          </p>
                        )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="h-10" />
            </div>
          </>
        )}
      </div>

      {/* REJECT MODAL */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              Bewerbung ablehnen
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Bitte geben Sie kurz an, warum diese Bewerbung abgelehnt wird.
              Dieser Text wird dem Kandidaten per E-Mail mitgeteilt.
            </p>

            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ablehnungsgrund
            </label>
            <textarea
              rows={5}
              className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
              placeholder="z. B. Deutschkenntnisse reichen für die Stelle aktuell nicht aus, unvollständige Unterlagen, Profil passt nicht zu den Anforderungen, ..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                setRejectError("");
              }}
            />
            {rejectError && (
              <p className="mt-2 text-xs text-rose-600">{rejectError}</p>
            )}

            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={closeRejectModal}
                disabled={rejectSubmitting}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={rejectSubmitting}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 text-white text-sm font-semibold hover:bg-rose-700 shadow-sm disabled:opacity-60"
              >
                {rejectSubmitting && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Ablehnung bestätigen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL – CandidateModal bilan integratsiya */}
      {fullCandidate && (
        <CandidateModal
          show={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          item={fullCandidate}
          onSave={handleSaveCandidate}
        />
      )}
    </div>
  );
}
