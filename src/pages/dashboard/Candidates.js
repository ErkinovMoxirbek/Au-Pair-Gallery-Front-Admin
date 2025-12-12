// src/pages/dashboard/Candidates.js
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
  ChevronLeft,
  User,
  IdCard,
  Award,
  GraduationCap,
  Maximize2, // Rasm kattalashtirish ikonkasini qo'shdik
} from "lucide-react";

import dashboardService from "../../services/dashboardService";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import CandidateModal from "../../components/shared/CandidateModal";
import Toast from "../../components/shared/Toast"; // 🔥 Toast komponenti

// --- Helpers ---

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

// 🔥 1. YANGI: Rasm kattalashtirish uchun Lightbox Modali
function ImageLightbox({ src, onClose }) {
  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <button 
        className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition"
        onClick={onClose}
      >
        <X className="w-8 h-8" />
      </button>
      <img 
        src={src} 
        alt="Full view" 
        className="max-w-full max-h-[90vh] rounded-lg shadow-2xl object-contain animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()} 
      />
    </div>
  );
}

// Avatar Component (List view)
function CandidateAvatar({ name, profileImagePath, size = "md", className = "", onZoom }) {
  const [imgError, setImgError] = useState(false);

  const sizeClasses = {
    sm: "w-20 h-16",
    md: "w-24 h-20",
    lg: "w-32 h-24",
    xl: "w-40 h-32",
  };

  const containerClass = `
    relative inline-block overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-sm group/avatar
    ${sizeClasses[size]} ${className}
  `;

  useEffect(() => {
    setImgError(false);
  }, [profileImagePath]);

  const initials = name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className={containerClass} onClick={(e) => e.stopPropagation()}> 
      {!profileImagePath || imgError ? (
        <div className="w-full h-full flex items-center justify-center text-xl font-bold text-indigo-500 bg-indigo-50">
          {initials}
        </div>
      ) : (
        <>
          <img
            src={profileImagePath}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
          {/* Zoom tugmasi */}
          <div 
            onClick={() => onZoom(profileImagePath)}
            className="absolute inset-0 bg-black/40 opacity-0 group-hover/avatar:opacity-100 flex items-center justify-center transition-opacity cursor-pointer"
          >
            <Maximize2 className="w-5 h-5 text-white drop-shadow-md" />
          </div>
        </>
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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${colors[color] || colors.gray}`}
    >
      {Icon && <Icon className="w-3.5 h-3.5" />}
      {label}
    </span>
  );
};

// Drawer Photo Carousel (Drawer view)
function CandidatePhotoCarousel({
  photos,
  activeIndex,
  setActiveIndex,
  fallbackUrl,
  name,
  onZoom 
}) {
  const hasPhotos = photos && photos.length > 0;
  const safeIndex = hasPhotos
    ? Math.min(Math.max(activeIndex, 0), photos.length - 1)
    : 0;

  const currentUrl = hasPhotos ? photos[safeIndex]?.url : fallbackUrl;

  const handlePrev = (e) => {
    e.stopPropagation();
    if (!hasPhotos) return;
    setActiveIndex((prev) => (prev <= 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    if (!hasPhotos) return;
    setActiveIndex((prev) => (prev >= photos.length - 1 ? 0 : prev + 1));
  };

  const initials = name?.charAt(0)?.toUpperCase() || "C";

  return (
    <div className="w-full mb-4 group/carousel">
      {/* Katta preview */}
      <div 
        className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gray-100 shadow-md cursor-pointer"
        onClick={() => currentUrl && onZoom(currentUrl)}
      >
        {currentUrl ? (
          <img
            src={currentUrl}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover/carousel:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-gray-300">
            {initials}
          </div>
        )}

        {/* Hover overlay with zoom icon */}
        {currentUrl && (
             <div className="absolute inset-0 bg-black/0 group-hover/carousel:bg-black/10 transition-colors flex items-center justify-center">
                 <div className="bg-white/90 p-2 rounded-full opacity-0 group-hover/carousel:opacity-100 transition-all transform scale-75 group-hover/carousel:scale-100 shadow-lg">
                    <Maximize2 className="w-6 h-6 text-gray-800" />
                 </div>
             </div>
        )}

        {hasPhotos && photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white shadow-md z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-gray-700 hover:bg-white shadow-md z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            <div className="absolute right-3 bottom-3 px-2 py-1 rounded-full bg-black/50 text-[11px] text-white z-10">
              {safeIndex + 1}/{photos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumb’lar */}
      {hasPhotos && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {photos.map((p, idx) => (
            <button
              key={p.id ?? idx}
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(idx);
              }}
              className={`relative flex-shrink-0 w-16 h-16 rounded-2xl overflow-hidden border transition-all ${
                idx === safeIndex
                  ? "border-indigo-500 ring-2 ring-indigo-300 scale-105"
                  : "border-gray-200 opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={p.url}
                alt={`${name} Foto ${idx + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// --- Main Page Component ---
export default function Candidates() {
  // State
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Toast State
  const [toast, setToast] = useState({ open: false, type: "info", message: "" });

  // Lightbox State (Zoom Image)
  const [zoomImage, setZoomImage] = useState(null);

  // Modals & Drawer
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Drawer Photos
  const [candidatePhotos, setCandidatePhotos] = useState([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  useEffect(() => {
    loadCandidates();
  }, []);

  // --- Helper: Show Toast ---
  const showToast = (type, message) => {
    setToast({ open: true, type, message });
  };

  const closeToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getCandidates();
      const list = res?.data?.content || res?.data || res || [];
      setCandidates(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Fehler beim Laden der Kandidaten:", error);
      showToast("error", "Kandidaten konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (
    candidateData,
    photosInput, 
    cvFile,
    certificateFile,
    diplomaFile,
    passportFile
  ) => {
    const photoFiles = Array.isArray(photosInput)
      ? photosInput
      : photosInput
      ? [photosInput]
      : [];

    try {
      if (editingCandidate) {
        // === UPDATE ===
        const id = editingCandidate.id;
        await dashboardService.updateCandidate(id, candidateData);

        const uploads = [];
        if (photoFiles.length > 0) uploads.push(dashboardService.uploadCandidatePhotos(id, photoFiles));
        if (cvFile) uploads.push(dashboardService.uploadCandidateCv(id, cvFile));
        if (certificateFile) uploads.push(dashboardService.uploadCandidateCertificate(id, certificateFile));
        if (diplomaFile) uploads.push(dashboardService.uploadCandidateDiploma(id, diplomaFile));
        if (passportFile) uploads.push(dashboardService.uploadCandidatePassport(id, passportFile));

        if (uploads.length > 0) await Promise.all(uploads);
        
        showToast("success", "Kandidat erfolgreich aktualisiert!");
      } else {
        // === CREATE FULL ===
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
      closeCreateModal();

      if (isDrawerOpen && editingCandidate) {
        openDrawer({ id: editingCandidate.id });
      }
    } catch (error) {
      console.error("Fehler beim Speichern:", error);
      showToast("error", "Fehler beim Speichern. Bitte überprüfen Sie die Eingaben.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Möchten Sie diesen Kandidaten wirklich löschen?")) {
      try {
        await dashboardService.deleteCandidate(id);
        closeDrawer();
        await loadCandidates();
        showToast("success", "Kandidat wurde gelöscht.");
      } catch (error) {
        console.error("Delete error:", error);
        showToast("error", "Fehler beim Löschen des Kandidaten.");
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
    setSelectedCandidate(candidate);
    setIsDrawerOpen(true);
    setDetailLoading(true);
    setCandidatePhotos([]);
    setActivePhotoIndex(0);

    try {
      const res = await dashboardService.getCandidate(candidate.id);
      const fullCandidate = res?.data || candidate;
      setSelectedCandidate(fullCandidate);

      try {
        const photosRes = await dashboardService.getCandidatePhotos(candidate.id);
        const photos = Array.isArray(photosRes) ? photosRes : photosRes?.data || [];
        setCandidatePhotos(photos || []);

        if (photos && photos.length > 0) {
          const mainUrl = fullCandidate.profileImagePath || candidate.profileImagePath;
          if (mainUrl) {
            const mainIndex = photos.findIndex((p) => p.url === mainUrl);
            setActivePhotoIndex(mainIndex >= 0 ? mainIndex : 0);
          } else {
            setActivePhotoIndex(0);
          }
        }
      } catch (err) {
        console.warn("Fotos konnten nicht geladen werden:", err);
      }
    } catch (e) {
      console.error("Fehler beim Laden der vollständigen Daten:", e);
      showToast("error", "Details konnten nicht geladen werden.");
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedCandidate(null);
      setCandidatePhotos([]);
      setActivePhotoIndex(0);
    }, 300);
  };

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
      {/* Toast Notification */}
      <Toast 
        open={toast.open} 
        type={toast.type} 
        message={toast.message} 
        onClose={closeToast} 
      />

      {/* Lightbox Modal (Rasm kattalashishi) */}
      <ImageLightbox 
        src={zoomImage} 
        onClose={() => setZoomImage(null)} 
      />

      {/* Header */}
      <header className="sticky z-30 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Kandidaten
            </h1>
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
                className="w-full sm:w-64 pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
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

      {/* Main Grid */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mx-auto mb-4">
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
                {/* Card Header (Bg) */}
                <div className="h-16 bg-gradient-to-r from-indigo-50 via-gray-50 to-gray-100 relative">
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
                      onZoom={(src) => setZoomImage(src)} // 🔥 Kartadan zoom qilish
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

      {/* Drawer */}
      <div className={`fixed inset-0 z-50 overflow-hidden ${isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"}`}>
        <div
          className={`absolute inset-0 bg-gray-900/30 backdrop-blur-sm transition-opacity duration-300 ${isDrawerOpen ? "opacity-100" : "opacity-0"}`}
          onClick={closeDrawer}
        />

        <div className={`absolute inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
          {selectedCandidate && (
            <>
              {/* Drawer Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <span>Kandidat-ID: {selectedCandidate.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openCreateModal({ ...selectedCandidate, photos: candidatePhotos })}
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

              {/* Drawer Content */}
              {detailLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <LoadingSpinner />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                  {/* Carousel */}
                  <div className="space-y-4">
                    <CandidatePhotoCarousel
                      photos={candidatePhotos}
                      activeIndex={activePhotoIndex}
                      setActiveIndex={setActivePhotoIndex}
                      fallbackUrl={selectedCandidate.profileImagePath}
                      name={selectedCandidate.name}
                      onZoom={(src) => setZoomImage(src)} // 🔥 Drawer ichidan zoom qilish
                    />

                    <div className="flex flex-col items-center text-center">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedCandidate.name} {selectedCandidate.surname}
                      </h2>
                      <p className="text-indigo-600 font-medium text-lg">
                        {selectedCandidate.professionTitle || "Beruf nicht angegeben"}
                      </p>

                      <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {selectedCandidate.phone && (
                          <a href={`tel:${selectedCandidate.phone}`} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
                            <Phone className="w-4 h-4" /> {selectedCandidate.phone}
                          </a>
                        )}
                        {selectedCandidate.email && (
                          <a href={`mailto:${selectedCandidate.email}`} className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-200 transition">
                            <Mail className="w-4 h-4" /> E-Mail
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />
                  
                  {/* Über mich & Motivation */}
                  {(selectedCandidate.aboutMe || selectedCandidate.motivation) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {selectedCandidate.aboutMe && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Über mich</h4>
                          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">{selectedCandidate.aboutMe}</div>
                        </div>
                      )}
                      {selectedCandidate.motivation && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Motivation</h4>
                          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700">{selectedCandidate.motivation}</div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Persönliche Daten & Verfügbarkeit */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <User className="w-4 h-4 text-indigo-500" /> Persönlich
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Geburtsdatum:</span>
                            <span className="font-medium">{formatDate(selectedCandidate.birthday)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Geschlecht:</span>
                            <span className="font-medium">{genderLabels[selectedCandidate.gender] || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Staatsangehörigkeit:</span>
                            <span className="font-medium">{selectedCandidate.nationality || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Adresse:</span>
                            <span className="font-medium text-right">{[selectedCandidate.street, selectedCandidate.zipCode, selectedCandidate.city, selectedCandidate.country].filter(Boolean).join(", ") || "—"}</span>
                        </div>
                      </div>
                    </div>
                    {/* Verfügbarkeit */}
                    <div className="space-y-4">
                       <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-indigo-500" /> Verfügbarkeit
                      </h4>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                         <div className="flex justify-between"><span className="text-gray-500">Verfügbar ab:</span><span className="font-medium text-green-600">{formatDate(selectedCandidate.availableFrom)}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">Verfügbar bis:</span><span className="font-medium text-red-600">{formatDate(selectedCandidate.availableUntil)}</span></div>
                         <div className="flex justify-between"><span className="text-gray-500">Taschengeld:</span><span className="font-bold text-gray-900">€{selectedCandidate.expectedPocketMoney || "0"}</span></div>
                         {selectedCandidate.desiredCountry && (
                          <div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
                            <span className="text-gray-500">Ziel-Land:</span>
                            <span className="font-medium text-indigo-600">{selectedCandidate.desiredCountry}</span>
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
                            <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Sprachen</h4>
                            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                              {selectedCandidate.languages.map((lang) => (
                                <div key={lang.id} className="flex items-center justify-between gap-3">
                                  <span className="font-medium text-gray-800">{lang.language}</span>
                                  <span className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 font-semibold">
                                    {languageLevelLabels[lang.level] || lang.level}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {(selectedCandidate.drivingLicense || selectedCandidate.smoker || selectedCandidate.petFriendly) && (
                          <div className="space-y-3">
                              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Zusätzliche Merkmale</h4>
                              <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-2 text-sm">
                                {selectedCandidate.drivingLicense && <Badge icon={Car} label="Führerschein vorhanden" color="orange" />}
                                {selectedCandidate.smoker && <Badge icon={Cigarette} label="Raucher" color="red" />}
                                {selectedCandidate.petFriendly && <Badge icon={PawPrint} label="Mag Tiere" color="green" />}
                              </div>
                          </div>
                        )}
                      </div>
                  )}

                  {/* Bildung */}
                  {selectedCandidate.educations?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Bildung</h4>
                      <div className="space-y-4">
                        {[...(selectedCandidate.educations || [])]
                          .sort((a, b) => (parseDate(b.startDate) || 0) - (parseDate(a.startDate) || 0))
                          .map((edu) => (
                            <div key={edu.id} className="bg-gray-50 rounded-xl p-4 text-sm space-y-1">
                              <div className="font-bold text-gray-900">{edu.schoolName || "Schule / Universität"}</div>
                              <div className="text-xs text-gray-500">
                                {formatDate(edu.startDate)} — {edu.endDate ? formatDate(edu.endDate) : "Bis heute"}
                              </div>
                              {edu.description && <p className="text-gray-700 mt-1">{edu.description}</p>}
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
                          .sort((a, b) => (parseDate(b.startDate) || 0) - (parseDate(a.startDate) || 0))
                          .map((exp) => (
                            <div key={exp.id} className="relative">
                              <span className="absolute -left-[31px] top-1 w-4 h-4 rounded-full bg-indigo-500 border-4 border-white"></span>
                              <h5 className="font-bold text-gray-900">{exp.positionTitle || "Position"}</h5>
                              <p className="text-sm text-indigo-600 mb-1">{exp.companyName || "Unternehmen"}
                              </p>
                              <p className="text-xs text-gray-400 mb-2">
                                {formatDate(exp.startDate)} — {exp.endDate ? formatDate(exp.endDate) : "Bis heute"}
                              </p>
                              {exp.responsibilities && <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{exp.responsibilities}</p>}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Hobbys */}
                  {selectedCandidate.hobbies?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Hobbys & Interessen</h4>
                      <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-2 text-sm">
                        {selectedCandidate.hobbies.map((hobby) => (
                          <span key={hobby.id} className="px-3 py-1 rounded-full bg-white border border-gray-200 text-gray-700">
                            {hobby.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Zertifikate */}
                  {selectedCandidate.certificates?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">Zertifikate</h4>
                      <div className="space-y-3">
                        {selectedCandidate.certificates.map((cert) => (
                          <div key={cert.id} className="bg-gray-50 rounded-xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
                            <div>
                              <div className="font-bold text-gray-900">{cert.title || "Zertifikat"}</div>
                              <div className="text-xs text-gray-500">
                                {cert.issuer && <span>{cert.issuer}</span>}
                                {cert.date && <span className="ml-2">({formatDate(cert.date)})</span>}
                              </div>
                            </div>
                            {cert.filePath && cert.filePath.trim() && (
                              <a href={cert.filePath} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition text-xs">
                                <FileText className="w-4 h-4" /> Zertifikat ansehen
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Documents Section */}
                   {(selectedCandidate.cvFilePath || selectedCandidate.certificateFilePath || selectedCandidate.diplomaFilePath || selectedCandidate.passportFilePath) && (
                      <div className="pt-6 space-y-4">
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Dokumente</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           {/* CV */}
                           {selectedCandidate.cvFilePath && (
                             <a href={selectedCandidate.cvFilePath} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gray-900 text-white flex items-center justify-center"><FileText className="w-5 h-5" /></div>
                                <div><p className="text-sm font-semibold text-gray-900">CV / Lebenslauf</p><p className="text-[11px] text-gray-500">PDF anzeigen</p></div>
                             </a>
                           )}
                           {/* Certificate */}
                           {selectedCandidate.certificateFilePath && (
                             <a href={selectedCandidate.certificateFilePath} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center"><Award className="w-5 h-5" /></div>
                                <div><p className="text-sm font-semibold text-gray-900">Zertifikat</p><p className="text-[11px] text-gray-500">Datei anzeigen</p></div>
                             </a>
                           )}
                           {/* Diploma */}
                           {selectedCandidate.diplomaFilePath && (
                             <a href={selectedCandidate.diplomaFilePath} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center"><GraduationCap className="w-5 h-5" /></div>
                                <div><p className="text-sm font-semibold text-gray-900">Diplom / Zeugnis</p><p className="text-[11px] text-gray-500">Datei anzeigen</p></div>
                             </a>
                           )}
                           {/* Passport */}
                           {selectedCandidate.passportFilePath && (
                             <a href={selectedCandidate.passportFilePath} target="_blank" rel="noreferrer" className="border border-gray-200 rounded-2xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-amber-600 text-white flex items-center justify-center"><IdCard className="w-5 h-5" /></div>
                                <div><p className="text-sm font-semibold text-gray-900">Reisepass</p><p className="text-[11px] text-gray-500">Scan anzeigen</p></div>
                             </a>
                           )}
                        </div>
                      </div>
                   )}

                  <div className="h-10"></div>
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