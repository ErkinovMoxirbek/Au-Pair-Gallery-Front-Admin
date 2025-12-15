// src/pages/dashboard/Candidates.js
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useDeferredValue,
} from "react";
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
  Maximize2,
} from "lucide-react";

import dashboardService from "../../services/dashboardService";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import CandidateModal from "../../components/shared/CandidateModal";
import Toast from "../../components/shared/Toast";

/* -------------------------------- Helpers -------------------------------- */

const safeArray = (v) => (Array.isArray(v) ? v : []);
const cn = (...xs) => xs.filter(Boolean).join(" ");

const formatDate = (dateString) => {
  if (!dateString) return "—";
  try {
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("de-DE");
  } catch {
    return dateString;
  }
};

const parseDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(`${dateString}T00:00:00`);
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

/* ------------------------------ UI Primitives ----------------------------- */

function Badge({ icon: Icon, label, color = "gray" }) {
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
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium",
        colors[color] || colors.gray
      )}
    >
      {Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      {label}
    </span>
  );
}

function ImageLightbox({ src, onClose }) {
  if (!src) return null;

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onMouseDown={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={onClose}
        aria-label="Close"
        type="button"
      >
        <X className="w-8 h-8" />
      </button>

      <img
        src={src}
        alt="Full view"
        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
        onMouseDown={(e) => e.stopPropagation()}
      />
    </div>
  );
}

function CandidateAvatar({
  name,
  profileImagePath,
  size = "md",
  className = "",
  onZoom,
}) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-20 h-16",
    md: "w-24 h-20",
    lg: "w-28 h-24",
    xl: "w-40 h-32",
  };

  useEffect(() => setImgError(false), [profileImagePath]);

  const initials = name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div
      className={cn(
        "relative inline-block overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm group/avatar",
        sizeClasses[size],
        className
      )}
      onClick={(e) => e.stopPropagation()}
    >
      {!profileImagePath || imgError ? (
        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-indigo-500 bg-indigo-50">
          {initials}
        </div>
      ) : (
        <>
          <img
            src={profileImagePath}
            alt={name || "Candidate"}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
            loading="lazy"
          />
          {onZoom ? (
            <button
              type="button"
              onClick={() => onZoom(profileImagePath)}
              className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
              aria-label="Zoom photo"
            >
              <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}

/* ------------------------------ Main Component ---------------------------- */

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const deferredSearch = useDeferredValue(searchTerm);

  // Toast
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  // Lightbox
  const [zoomImage, setZoomImage] = useState(null);

  // Create/Edit modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  // Detail modal
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Photos
  const [candidatePhotos, setCandidatePhotos] = useState([]);

  // If edit opened from detail: close edit => reopen detail
  const [returnToDetailId, setReturnToDetailId] = useState(null);

  // request guard (race condition oldindan)
  const detailReqIdRef = useRef(0);

  const showToast = useCallback((type, message) => {
    setToast({ open: true, type, message });
  }, []);

  const closeToast = useCallback(() => {
    setToast((p) => ({ ...p, open: false }));
  }, []);

  const loadCandidates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getCandidates();
      const list = res?.data?.content ?? res?.data ?? res ?? [];
      setCandidates(safeArray(list));
    } catch (e) {
      console.error("Fehler beim Laden der Kandidaten:", e);
      showToast("error", "Kandidaten konnten nicht geladen werden.");
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  const openCreateModal = useCallback((candidate = null) => {
    setEditingCandidate(candidate);
    setShowCreateModal(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setSelectedCandidate(null);
      setCandidatePhotos([]);
      setDetailLoading(false);
    }, 200);
  }, []);

  const openDetailModal = useCallback(
    async (candidate) => {
      if (!candidate?.id) return;

      const reqId = ++detailReqIdRef.current;

      setIsDetailModalOpen(true);
      setDetailLoading(true);
      setSelectedCandidate(candidate);
      setCandidatePhotos([]);

      try {
        const res = await dashboardService.getCandidate(candidate.id);
        if (detailReqIdRef.current !== reqId) return;

        const fullCandidate = res?.data ?? candidate;
        setSelectedCandidate(fullCandidate);

        try {
          const photosRes = await dashboardService.getCandidatePhotos(candidate.id);
          if (detailReqIdRef.current !== reqId) return;

          const photos = Array.isArray(photosRes) ? photosRes : photosRes?.data;
          setCandidatePhotos(safeArray(photos));
        } catch (err) {
          console.warn("Fotos konnten nicht geladen werden:", err);
        }
      } catch (e) {
        console.error("Fehler beim Laden der vollständigen Daten:", e);
        showToast("error", "Details konnten nicht geladen werden.");
      } finally {
        if (detailReqIdRef.current === reqId) setDetailLoading(false);
      }
    },
    [showToast]
  );

  // FIX: Edit bosilganda detail modalni yopamiz (backdrop qolmaydi)
  const handleEditFromDetail = useCallback(() => {
    if (!selectedCandidate?.id) return;

    // detailga qaytish uchun id saqlab qo'yamiz
    setReturnToDetailId(selectedCandidate.id);

    // edit uchun payload
    const payload = { ...selectedCandidate, photos: candidatePhotos };

    // 1) edit modalni ochamiz
    setEditingCandidate(payload);
    setShowCreateModal(true);

    // 2) detail modalni darhol yopamiz (orqada qolmasin)
    setIsDetailModalOpen(false);
  }, [selectedCandidate, candidatePhotos]);

  // Close create/edit modal.
  // Agar edit detail ichidan ochilgan bo'lsa — qaytib detailni ochamiz.
  const closeCreateModal = useCallback(() => {
    setShowCreateModal(false);
    setEditingCandidate(null);

    if (returnToDetailId) {
      const id = returnToDetailId;
      setReturnToDetailId(null);

      // edit yopilgach detailni qayta ochamiz
      // (minimal object with id yetarli)
      openDetailModal({ id });
    }
  }, [returnToDetailId, openDetailModal]);

  const handleSave = useCallback(
    async (candidateData, photosInput, cvFile, certificateFile, diplomaFile, passportFile) => {
      const photoFiles = Array.isArray(photosInput)
        ? photosInput
        : photosInput
        ? [photosInput]
        : [];

      try {
        if (editingCandidate?.id) {
          const id = editingCandidate.id;
          await dashboardService.updateCandidate(id, candidateData);

          const uploads = [];
          if (photoFiles.length) uploads.push(dashboardService.uploadCandidatePhotos(id, photoFiles));
          if (cvFile) uploads.push(dashboardService.uploadCandidateCv(id, cvFile));
          if (certificateFile) uploads.push(dashboardService.uploadCandidateCertificate(id, certificateFile));
          if (diplomaFile) uploads.push(dashboardService.uploadCandidateDiploma(id, diplomaFile));
          if (passportFile) uploads.push(dashboardService.uploadCandidatePassport(id, passportFile));

          if (uploads.length) await Promise.all(uploads);

          showToast("success", "Kandidat erfolgreich aktualisiert!");
        } else {
          await dashboardService.createCandidateFull(
            candidateData,
            photoFiles,
            cvFile,
            certificateFile,
            diplomaFile,
            passportFile
          );
          showToast("success", "Neuer Kandidat erfolgreich erstellt!");
        }

        await loadCandidates();

        // closeCreateModal ichida (returnToDetailId bo'lsa) detail qayta ochiladi
        closeCreateModal();
      } catch (e) {
        console.error("Fehler beim Speichern:", e);
        showToast("error", "Fehler beim Speichern. Bitte überprüfen Sie die Eingaben.");
      }
    },
    [editingCandidate, loadCandidates, showToast, closeCreateModal]
  );

  const handleDelete = useCallback(
    async (id) => {
      if (!id) return;
      if (!window.confirm("Möchten Sie diesen Kandidaten wirklich löschen?")) return;

      try {
        await dashboardService.deleteCandidate(id);
        showToast("success", "Kandidat wurde gelöscht.");
        closeDetailModal();
        await loadCandidates();
      } catch (e) {
        console.error("Delete error:", e);
        showToast("error", "Fehler beim Löschen des Kandidaten.");
      }
    },
    [closeDetailModal, loadCandidates, showToast]
  );

  const filteredCandidates = useMemo(() => {
    const list = safeArray(candidates);
    const q = (deferredSearch || "").trim().toLowerCase();
    if (!q) return list;

    return list.filter((c) => {
      const hay = [
        c?.name,
        c?.surname,
        c?.professionTitle,
        c?.city,
        c?.email,
        String(c?.id ?? ""),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }, [candidates, deferredSearch]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col">
      <Toast
        open={toast.open}
        type={toast.type}
        message={toast.message}
        onClose={closeToast}
        duration={4500}
      />

      <ImageLightbox src={zoomImage} onClose={() => setZoomImage(null)} />

      {/* Header */}
      <header className="sticky top-0 z-30 px-4 py-4 sm:px-6 lg:px-8 bg-gray-50/70 backdrop-blur border-b border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Kandidaten</h1>
            <p className="text-sm text-gray-500">
              Alle Kandidaten und Verwaltung ({safeArray(candidates).length} Stück)
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
                className="w-full sm:w-72 pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <button
              onClick={() => openCreateModal(null)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-all active:scale-95"
              type="button"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Hinzufügen</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">Keine Kandidaten gefunden</h3>
            <p className="text-gray-500 max-w-sm mx-auto mt-1">
              Fügen Sie einen neuen Kandidaten hinzu oder ändern Sie den Suchbegriff.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                onClick={() => openDetailModal(candidate)}
                className="group bg-white rounded-2xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 cursor-pointer flex flex-col overflow-hidden"
                role="button"
                tabIndex={0}
              >
                <div className="h-16 bg-gradient-to-r from-indigo-50 via-gray-50 to-gray-100 relative">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      className="p-1.5 bg-white/80 backdrop-blur rounded-full hover:bg-white text-gray-600"
                      onClick={(e) => e.stopPropagation()}
                      aria-label="More"
                      type="button"
                    >
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
                      onZoom={(src) => setZoomImage(src)}
                    />
                    <span className="text-xs font-mono text-gray-400 mb-1">#{candidate.id}</span>
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

                  <div className="flex flex-wrap gap-2 mb-4 mt-auto">
                    {candidate.drivingLicense ? <Badge icon={Car} label="FS vorhanden" color="orange" /> : null}
                    {candidate.smoker ? <Badge icon={Cigarette} label="Raucher" color="red" /> : null}
                    {candidate.petFriendly ? <Badge icon={PawPrint} label="Tierfreundlich" color="green" /> : null}
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

      {/* Detail Modal (COMPACT DESIGN) */}
      {isDetailModalOpen ? (
        <div className="fixed inset-0 z-[100] overflow-hidden flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={closeDetailModal}
          />

          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            {selectedCandidate ? (
              <>
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-20">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <span>Kandidat-ID: {selectedCandidate.id}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* FIXED EDIT BUTTON */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditFromDetail();
                      }}
                      className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      aria-label="Edit"
                      type="button"
                    >
                      <Edit className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(selectedCandidate.id);
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      aria-label="Delete"
                      type="button"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        closeDetailModal();
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                      aria-label="Close"
                      type="button"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                {detailLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <LoadingSpinner />
                  </div>
                ) : (
                  <div className="overflow-y-auto max-h-[calc(90vh-80px)] p-6 md:p-8 space-y-8">
                    {/* COMPACT TOP */}
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-3">
                        <CandidateAvatar
                          name={selectedCandidate.name}
                          profileImagePath={selectedCandidate.profileImagePath}
                          size="lg"
                          onZoom={(src) => setZoomImage(src)}
                        />

                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                          {selectedCandidate.drivingLicense ? <Badge icon={Car} label="FS" color="orange" /> : null}
                          {selectedCandidate.smoker ? <Badge icon={Cigarette} label="Raucher" color="red" /> : null}
                          {selectedCandidate.petFriendly ? <Badge icon={PawPrint} label="Tiere" color="green" /> : null}
                        </div>
                      </div>

                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {selectedCandidate.name} {selectedCandidate.surname}
                        </h2>
                        <p className="text-indigo-600 font-medium text-lg">
                          {selectedCandidate.professionTitle || "Beruf nicht angegeben"}
                        </p>

                        <div className="flex flex-wrap gap-3 mt-3">
                          {selectedCandidate.phone ? (
                            <a
                              href={`tel:${selectedCandidate.phone}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                            >
                              <Phone className="w-4 h-4" /> {selectedCandidate.phone}
                            </a>
                          ) : null}

                          {selectedCandidate.email ? (
                            <a
                              href={`mailto:${selectedCandidate.email}`}
                              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition"
                            >
                              <Mail className="w-4 h-4" /> E-Mail
                            </a>
                          ) : null}
                        </div>

                        {safeArray(candidatePhotos).length ? (
                          <div className="mt-5">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                              Fotos
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                              {candidatePhotos.map((p, idx) => (
                                <button
                                  key={p.id ?? `${p.url}-${idx}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setZoomImage(p.url);
                                  }}
                                  className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-200 hover:border-indigo-400 transition flex-shrink-0"
                                  title="Öffnen"
                                  type="button"
                                >
                                  <img src={p.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <hr className="border-gray-100" />

                    {/* About & Motivation */}
                    {selectedCandidate.aboutMe || selectedCandidate.motivation ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {selectedCandidate.aboutMe ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Über mich</h4>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                              {selectedCandidate.aboutMe}
                            </div>
                          </div>
                        ) : null}

                        {selectedCandidate.motivation ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Motivation</h4>
                            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">
                              {selectedCandidate.motivation}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Personal & Availability */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                          <User className="w-4 h-4 text-indigo-500" />
                          Persönlich
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                          <Row label="Geburtsdatum" value={formatDate(selectedCandidate.birthday)} />
                          <Row label="Geschlecht" value={genderLabels[selectedCandidate.gender] || "—"} />
                          <Row label="Staatsangehörigkeit" value={selectedCandidate.nationality || "—"} />
                          <Row
                            label="Adresse"
                            value={
                              [selectedCandidate.street, selectedCandidate.zipCode, selectedCandidate.city, selectedCandidate.country]
                                .filter(Boolean)
                                .join(", ") || "—"
                            }
                            valueClass="text-right"
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-500" />
                          Verfügbarkeit
                        </h4>
                        <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                          <Row
                            label="Verfügbar ab"
                            value={formatDate(selectedCandidate.availableFrom)}
                            valueClass="text-green-600 font-medium"
                          />
                          <Row
                            label="Verfügbar bis"
                            value={formatDate(selectedCandidate.availableUntil)}
                            valueClass="text-red-600 font-medium"
                          />
                          <Row
                            label="Taschengeld"
                            value={`€${selectedCandidate.expectedPocketMoney || "0"}`}
                            valueClass="font-bold text-gray-900"
                          />
                          {selectedCandidate.desiredCountry ? (
                            <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                              <span className="text-gray-500">Ziel-Land:</span>
                              <span className="font-medium text-indigo-600">{selectedCandidate.desiredCountry}</span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>

                    {/* Languages & Flags */}
                    {safeArray(selectedCandidate.languages).length ||
                    selectedCandidate.drivingLicense ||
                    selectedCandidate.smoker ||
                    selectedCandidate.petFriendly ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {safeArray(selectedCandidate.languages).length ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sprachen</h4>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                              {safeArray(selectedCandidate.languages).map((lang) => (
                                <div
                                  key={lang.id ?? `${lang.language}-${lang.level}`}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <span className="font-medium text-gray-800">{lang.language}</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                                    {languageLevelLabels[lang.level] || lang.level}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}

                        {selectedCandidate.drivingLicense || selectedCandidate.smoker || selectedCandidate.petFriendly ? (
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Zusätzliche Merkmale</h4>
                            <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-2 text-sm">
                              {selectedCandidate.drivingLicense ? (
                                <Badge icon={Car} label="Führerschein vorhanden" color="orange" />
                              ) : null}
                              {selectedCandidate.smoker ? (
                                <Badge icon={Cigarette} label="Raucher" color="red" />
                              ) : null}
                              {selectedCandidate.petFriendly ? (
                                <Badge icon={PawPrint} label="Mag Tiere" color="green" />
                              ) : null}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : null}

                    {/* Education */}
                    {safeArray(selectedCandidate.educations).length ? (
                      <Section title="Bildung" icon={GraduationCap}>
                        <div className="space-y-4">
                          {safeArray(selectedCandidate.educations)
                            .slice()
                            .sort((a, b) => (parseDate(b.startDate) || 0) - (parseDate(a.startDate) || 0))
                            .map((edu) => (
                              <div
                                key={edu.id ?? `${edu.schoolName}-${edu.startDate}`}
                                className="bg-gray-50 rounded-xl p-4 text-sm space-y-1"
                              >
                                <div className="font-bold text-gray-900">{edu.schoolName || "Schule / Universität"}</div>
                                <div className="text-xs text-gray-500">
                                  {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : "Bis heute"}
                                </div>
                                {edu.description ? <p className="text-gray-700 mt-1">{edu.description}</p> : null}
                              </div>
                            ))}
                        </div>
                      </Section>
                    ) : null}

                    {/* Experience */}
                    {safeArray(selectedCandidate.experiences).length ? (
                      <Section title="Erfahrung" icon={Briefcase}>
                        <div className="relative border-l-2 border-indigo-100 ml-2 space-y-6 pl-6 py-2">
                          {safeArray(selectedCandidate.experiences)
                            .slice()
                            .sort((a, b) => (parseDate(b.startDate) || 0) - (parseDate(a.startDate) || 0))
                            .map((exp) => (
                              <div key={exp.id ?? `${exp.companyName}-${exp.startDate}`} className="relative">
                                <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white" />
                                <h5 className="font-bold text-gray-900">{exp.positionTitle || "Position"}</h5>
                                <p className="text-sm text-indigo-600 mb-1">{exp.companyName || "Unternehmen"}</p>
                                <p className="text-xs text-gray-400 mb-2">
                                  {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "Bis heute"}
                                </p>
                                {exp.responsibilities ? (
                                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                    {exp.responsibilities}
                                  </p>
                                ) : null}
                              </div>
                            ))}
                        </div>
                      </Section>
                    ) : null}

                    {/* Hobbies */}
                    {safeArray(selectedCandidate.hobbies).length ? (
                      <Section title="Hobbys & Interessen">
                        <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-2 text-sm">
                          {safeArray(selectedCandidate.hobbies).map((h) => (
                            <span
                              key={h.id ?? h.name}
                              className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700"
                            >
                              {h.name}
                            </span>
                          ))}
                        </div>
                      </Section>
                    ) : null}

                    {/* Certificates */}
                    {safeArray(selectedCandidate.certificates).length ? (
                      <Section title="Zertifikate" icon={Award}>
                        <div className="space-y-3">
                          {safeArray(selectedCandidate.certificates).map((cert) => (
                            <div
                              key={cert.id ?? `${cert.title}-${cert.date}`}
                              className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm"
                            >
                              <div>
                                <div className="font-bold text-gray-900">{cert.title || "Zertifikat"}</div>
                                <div className="text-xs text-gray-500">
                                  {cert.issuer ? <span>{cert.issuer}</span> : null}
                                  {cert.date ? <span className="ml-2">({formatDate(cert.date)})</span> : null}
                                </div>
                              </div>

                              {cert.filePath?.trim() ? (
                                <a
                                  href={cert.filePath}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-xs"
                                >
                                  <FileText className="w-4 h-4" />
                                  Zertifikat ansehen
                                </a>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </Section>
                    ) : null}

                    {/* Documents */}
                    {selectedCandidate.cvFilePath ||
                    selectedCandidate.certificateFilePath ||
                    selectedCandidate.diplomaFilePath ||
                    selectedCandidate.passportFilePath ? (
                      <Section title="Dokumente">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedCandidate.cvFilePath ? (
                            <DocCard
                              href={selectedCandidate.cvFilePath}
                              title="CV / Lebenslauf"
                              subtitle="PDF anzeigen"
                              icon={<FileText className="w-5 h-5" />}
                              iconClass="bg-gray-900 text-white"
                            />
                          ) : null}

                          {selectedCandidate.certificateFilePath ? (
                            <DocCard
                              href={selectedCandidate.certificateFilePath}
                              title="Zertifikat"
                              subtitle="Datei anzeigen"
                              icon={<Award className="w-5 h-5" />}
                              iconClass="bg-indigo-600 text-white"
                            />
                          ) : null}

                          {selectedCandidate.diplomaFilePath ? (
                            <DocCard
                              href={selectedCandidate.diplomaFilePath}
                              title="Diplom / Zeugnis"
                              subtitle="Datei anzeigen"
                              icon={<GraduationCap className="w-5 h-5" />}
                              iconClass="bg-emerald-600 text-white"
                            />
                          ) : null}

                          {selectedCandidate.passportFilePath ? (
                            <DocCard
                              href={selectedCandidate.passportFilePath}
                              title="Reisepass"
                              subtitle="Scan anzeigen"
                              icon={<IdCard className="w-5 h-5" />}
                              iconClass="bg-amber-600 text-white"
                            />
                          ) : null}
                        </div>
                      </Section>
                    ) : null}

                    <div className="h-8" />
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* Create/Edit Modal */}
      {showCreateModal ? (
        <CandidateModal
          show={showCreateModal}
          onClose={closeCreateModal}
          item={editingCandidate}
          onSave={handleSave}
        />
      ) : null}
    </div>
  );
}

/* --------------------------- Small helper components ---------------------- */

function Row({ label, value, valueClass = "" }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-gray-500">{label}:</span>
      <span className={cn("font-medium", valueClass)}>{value}</span>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
        {Icon ? <Icon className="w-4 h-4 text-indigo-500" /> : null}
        {title}
      </h4>
      {children}
    </div>
  );
}

function DocCard({ href, title, subtitle, icon, iconClass }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex items-center gap-3"
    >
      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconClass)}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-[11px] text-gray-500">{subtitle}</p>
      </div>
    </a>
  );
}
