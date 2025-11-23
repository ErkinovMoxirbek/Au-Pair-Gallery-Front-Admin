// src/pages/dashboard/Candidates.js - CLEAN VIEW WITH DETAIL MODAL (German UI)
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Download,
  MapPin,
  Phone,
  Mail,
  X,
  Edit,
  Trash2,
  User,
  Calendar,
  Globe,
  Briefcase,
  Car,
  Cigarette,
  PawPrint,
  FileText,
  Languages,
  GraduationCap,
  Heart,
  Award,
  DollarSign
} from "lucide-react";

import dashboardService from "../../services/dashboardService";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import CandidateModal from "../../components/shared/CandidateModal";

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);

  const [viewMode, setViewMode] = useState("grid");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadCandidates();
  }, []);

  const loadCandidates = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getCandidates();
      let list = [];
      if (res?.data?.content) list = res.data.content;
      else if (res?.data) list = res.data;
      else if (res) list = res;
      setCandidates(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("Error:", error);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (candidateData, photoFile, cvFile) => {
    try {
      if (editingCandidate) {
        // update json
        await dashboardService.updateCandidate(editingCandidate.id, candidateData);

        // optional uploads
        if (photoFile) await dashboardService.uploadCandidatePhoto(editingCandidate.id, photoFile);
        if (cvFile) await dashboardService.uploadCandidateCv(editingCandidate.id, cvFile);
      } else {
        // full create (json + optional uploads)
        await dashboardService.createCandidateFull(candidateData, photoFile, cvFile);
      }

      await loadCandidates();
      closeModal();
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Möchten Sie wirklich löschen?")) {
      try {
        await dashboardService.deleteCandidate(id);
        setShowDetailModal(false);
        await loadCandidates();
      } catch (error) {
        console.error("Delete error:", error);
        alert("Fehler: " + error.message);
      }
    }
  };

  const openModal = (candidate = null) => {
    setEditingCandidate(candidate);
    setShowModal(true);
    setShowDetailModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCandidate(null);
  };

  const openDetailModal = async (candidate) => {
    try {
      // Full CV ma'lumotlarini olish (getById)
      const res = await dashboardService.getCandidate(candidate.id);
      const full = res?.data || res;
      setSelectedCandidate(full || candidate);
      setShowDetailModal(true);
    } catch (e) {
      console.error(e);
      setSelectedCandidate(candidate);
      setShowDetailModal(true);
    }
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedCandidate(null);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Name",
      "Nachname",
      "Land",
      "Stadt",
      "Telefon",
      "Email",
      "Beruf",
      "Führerschein",
      "Raucher",
      "Tierfreundlich"
    ];

    const rows = filteredCandidates.map((c) => [
      c.id,
      c.name || "",
      c.surname || "",
      c.country || "",
      c.city || "",
      c.phone || "",
      c.email || "",
      c.professionTitle || "",
      c.drivingLicense ? "Ja" : "Nein",
      c.smoker ? "Ja" : "Nein",
      c.petFriendly ? "Ja" : "Nein"
    ]);

    const csv = [headers.join(","), ...rows.map((r) => r.map((x) => `"${x}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `candidates_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredCandidates = candidates.filter((c) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(search) ||
      (c.surname || "").toLowerCase().includes(search) ||
      (c.email || "").toLowerCase().includes(search) ||
      (c.phone || "").toLowerCase().includes(search) ||
      (c.city || "").toLowerCase().includes(search) ||
      (c.country || "").toLowerCase().includes(search) ||
      (c.professionTitle || "").toLowerCase().includes(search)
    );
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Kandidaten</h1>
            <p className="text-gray-600 mt-1">{filteredCandidates.length} Kandidaten</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 shadow-sm transition"
            >
              <Download className="w-4 h-4" />
              <span>Exportieren</span>
            </button>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition"
            >
              <Plus className="w-5 h-5" />
              <span>Neuer Kandidat</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search & View Toggle */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-10 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === "grid" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === "table" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredCandidates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <User className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Kandidaten gefunden</h3>
          <p className="text-gray-500">
            {searchTerm ? "Suchbegriff anpassen" : "Fügen Sie einen neuen Kandidaten hinzu"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        // GRID VIEW
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredCandidates.map((c) => (
            <div
              key={c.id}
              onClick={() => openDetailModal(c)}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                {/* Photo / Initial */}
                {c.profileImagePath ? (
                  <img
                    src={c.profileImagePath}
                    alt="profile"
                    className="w-12 h-12 rounded-xl object-cover group-hover:scale-110 transition"
                    onError={(e) => (e.currentTarget.style.display = "none")}
                  />
                ) : (
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition">
                    {c.name?.charAt(0)?.toUpperCase() || "C"}
                  </div>
                )}

                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                  ID: {c.id}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                {c.name} {c.surname}
              </h3>
              <p className="text-sm text-gray-500 mb-3 truncate">
                {c.professionTitle || "—"}
              </p>

              <div className="space-y-2.5">
                {(c.city || c.country) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {[c.city, c.country].filter(Boolean).join(", ")}
                    </span>
                  </div>
                )}

                {c.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{c.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex gap-2">
                    {c.drivingLicense && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-orange-700 bg-orange-50 px-2 py-1 rounded-lg">
                        <Car className="w-3 h-3" /> DL
                      </span>
                    )}
                    {c.smoker && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-50 px-2 py-1 rounded-lg">
                        <Cigarette className="w-3 h-3" /> Smoker
                      </span>
                    )}
                    {c.petFriendly && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded-lg">
                        <PawPrint className="w-3 h-3" /> Pet
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-center text-gray-500 group-hover:text-blue-600 transition">
                  Zum Anzeigen klicken →
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // TABLE VIEW
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Kandidat</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Ort</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Kontakt</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Features</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCandidates.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => openDetailModal(c)}
                    className="hover:bg-blue-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {c.profileImagePath ? (
                          <img
                            src={c.profileImagePath}
                            alt="profile"
                            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                            {c.name?.charAt(0)?.toUpperCase() || "C"}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-gray-900">
                            {c.name} {c.surname}
                          </p>
                          <p className="text-xs text-gray-500">ID: {c.id}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>{[c.city, c.country].filter(Boolean).join(", ") || "—"}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {c.phone && (
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {c.phone}
                          </p>
                        )}
                        {c.email && (
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {c.email}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {c.drivingLicense && (
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-lg">
                            DL
                          </span>
                        )}
                        {c.smoker && (
                          <span className="px-2 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-lg">
                            Smoker
                          </span>
                        )}
                        {c.petFriendly && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-lg">
                            Pet
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-gray-100 px-6 py-4 bg-gray-50">
            <p className="text-sm text-gray-600 font-medium">
              Insgesamt {filteredCandidates.length} Kandidaten
            </p>
          </div>
        </div>
      )}

      {/* DETAIL MODAL */}
      {showDetailModal && selectedCandidate && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {selectedCandidate.profileImagePath ? (
                    <img
                      src={selectedCandidate.profileImagePath}
                      alt="profile"
                      className="w-16 h-16 rounded-2xl object-cover bg-white/20"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold">
                      {selectedCandidate.name?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedCandidate.name} {selectedCandidate.surname}
                    </h2>
                    <p className="text-blue-100">ID: {selectedCandidate.id}</p>
                  </div>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="p-2 hover:bg-white/20 rounded-xl transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">

              {/* Basic info */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                  <User className="w-4 h-4" /> Persönliche Daten
                </h3>

                <div className="grid md:grid-cols-2 gap-3">
                  {selectedCandidate.birthday && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>
                        {new Date(selectedCandidate.birthday).toLocaleDateString("de-DE")}
                      </span>
                    </div>
                  )}
                  {selectedCandidate.gender && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{selectedCandidate.gender}</span>
                    </div>
                  )}
                  {selectedCandidate.nationality && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl">
                      <Globe className="w-4 h-4 text-gray-400" />
                      <span>{selectedCandidate.nationality}</span>
                    </div>
                  )}
                  {selectedCandidate.professionTitle && (
                    <div className="flex items-center gap-2 text-sm text-gray-700 bg-white p-3 rounded-xl">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span>{selectedCandidate.professionTitle}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4" /> Kontaktdaten
                </h3>

                <div className="space-y-3">
                  {selectedCandidate.phone && (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl">
                      <Phone className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Telefon</p>
                        <a href={`tel:${selectedCandidate.phone}`} className="font-semibold text-gray-900 hover:text-blue-600">
                          {selectedCandidate.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {selectedCandidate.email && (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl">
                      <Mail className="w-5 h-5 text-orange-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">E-Mail</p>
                        <a href={`mailto:${selectedCandidate.email}`} className="font-semibold text-gray-900 hover:text-blue-600 break-all">
                          {selectedCandidate.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {(selectedCandidate.street || selectedCandidate.city || selectedCandidate.country) && (
                    <div className="flex items-start gap-3 bg-white p-3 rounded-xl">
                      <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Adresse</p>
                        <p className="font-semibold text-gray-900">
                          {[selectedCandidate.street, selectedCandidate.city, selectedCandidate.country]
                            .filter(Boolean).join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Availability + money */}
              {(selectedCandidate.availableFrom || selectedCandidate.availableUntil || selectedCandidate.expectedPocketMoney) && (
                <div className="grid md:grid-cols-3 gap-4">
                  {selectedCandidate.availableFrom && (
                    <div className="bg-blue-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <h4 className="font-bold text-gray-900">Verfügbar ab</h4>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
                        {new Date(selectedCandidate.availableFrom).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  )}

                  {selectedCandidate.availableUntil && (
                    <div className="bg-purple-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-5 h-5 text-purple-600" />
                        <h4 className="font-bold text-gray-900">Verfügbar bis</h4>
                      </div>
                      <p className="text-lg font-bold text-purple-600">
                        {new Date(selectedCandidate.availableUntil).toLocaleDateString("de-DE")}
                      </p>
                    </div>
                  )}

                  {selectedCandidate.expectedPocketMoney && (
                    <div className="bg-green-50 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <h4 className="font-bold text-gray-900">Taschengeld</h4>
                      </div>
                      <p className="text-lg font-bold text-green-600">
                        €{selectedCandidate.expectedPocketMoney}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* About / Motivation */}
              {(selectedCandidate.aboutMe || selectedCandidate.motivation) && (
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2">
                    <Heart className="w-4 h-4" /> Über mich
                  </h3>

                  {selectedCandidate.aboutMe && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">About me</p>
                      <p className="text-gray-900 bg-white p-3 rounded-xl">
                        {selectedCandidate.aboutMe}
                      </p>
                    </div>
                  )}

                  {selectedCandidate.motivation && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Motivation</p>
                      <p className="text-gray-900 bg-white p-3 rounded-xl">
                        {selectedCandidate.motivation}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Child lists */}
              <div className="grid md:grid-cols-2 gap-4">

                {/* Experiences */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Erfahrungen
                  </h3>
                  {selectedCandidate.experiences?.length ? (
                    <div className="space-y-2">
                      {selectedCandidate.experiences.map((ex) => (
                        <div key={ex.id} className="bg-white p-3 rounded-xl">
                          <p className="font-semibold text-gray-900">{ex.positionTitle}</p>
                          <p className="text-sm text-gray-600">{ex.companyName}</p>
                          {(ex.startDate || ex.endDate) && (
                            <p className="text-xs text-gray-500 mt-1">
                              {ex.startDate} – {ex.endDate || "Present"}
                            </p>
                          )}
                          {ex.responsibilities && (
                            <p className="text-sm text-gray-700 mt-2">{ex.responsibilities}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Keine Erfahrungen</p>
                  )}
                </div>

                {/* Languages */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <Languages className="w-4 h-4" /> Sprachen
                  </h3>
                  {selectedCandidate.languages?.length ? (
                    <div className="space-y-2">
                      {selectedCandidate.languages.map((l) => (
                        <div key={l.id} className="bg-white p-3 rounded-xl flex justify-between">
                          <span className="font-semibold text-gray-900">{l.language}</span>
                          <span className="text-sm text-gray-600">{l.level}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Keine Sprachen</p>
                  )}
                </div>

                {/* Educations */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" /> Ausbildung
                  </h3>
                  {selectedCandidate.educations?.length ? (
                    <div className="space-y-2">
                      {selectedCandidate.educations.map((ed) => (
                        <div key={ed.id} className="bg-white p-3 rounded-xl">
                          <p className="font-semibold text-gray-900">{ed.schoolName}</p>
                          {(ed.startDate || ed.endDate) && (
                            <p className="text-xs text-gray-500">
                              {ed.startDate} – {ed.endDate || "Present"}
                            </p>
                          )}
                          {ed.description && (
                            <p className="text-sm text-gray-700 mt-1">{ed.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Keine Ausbildung</p>
                  )}
                </div>

                {/* Certificates */}
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                    <Award className="w-4 h-4" /> Zertifikate
                  </h3>
                  {selectedCandidate.certificates?.length ? (
                    <div className="space-y-2">
                      {selectedCandidate.certificates.map((c) => (
                        <div key={c.id} className="bg-white p-3 rounded-xl">
                          <p className="font-semibold text-gray-900">{c.title}</p>
                          <p className="text-sm text-gray-600">{c.issuer}</p>
                          {c.date && (
                            <p className="text-xs text-gray-500 mt-1">{c.date}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Keine Zertifikate</p>
                  )}
                </div>
              </div>

              {/* Hobbies */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                  <Heart className="w-4 h-4" /> Hobbys
                </h3>
                {selectedCandidate.hobbies?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {selectedCandidate.hobbies.map((h) => (
                      <span key={h.id} className="px-3 py-1 bg-white rounded-lg text-sm font-semibold text-gray-800">
                        {h.name}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Keine Hobbys</p>
                )}
              </div>

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {selectedCandidate.drivingLicense && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 font-semibold rounded-xl">
                    <Car className="w-4 h-4" /> Führerschein
                  </span>
                )}
                {selectedCandidate.smoker && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-xl">
                    <Cigarette className="w-4 h-4" /> Raucher
                  </span>
                )}
                {selectedCandidate.petFriendly && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 font-semibold rounded-xl">
                    <PawPrint className="w-4 h-4" /> Tierfreundlich
                  </span>
                )}
              </div>

              {/* CV Link */}
              {selectedCandidate.cvFilePath && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <a
                    href={selectedCandidate.cvFilePath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 shadow-lg transition"
                  >
                    <FileText className="w-5 h-5" />
                    CV öffnen (PDF)
                  </a>
                  <p className="text-xs text-gray-500 mt-2">
                    Link ist zeitlich begrenzt (Presigned URL)
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-3xl border-t border-gray-200 flex gap-3">
              <button
                onClick={() => openModal(selectedCandidate)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg transition"
              >
                <Edit className="w-5 h-5" />
                Bearbeiten
              </button>
              <button
                onClick={() => handleDelete(selectedCandidate.id)}
                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold transition"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={closeDetailModal}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 font-semibold transition"
              >
                Schließen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit/Create Modal */}
      {showModal && (
        <CandidateModal
          show={showModal}
          onClose={closeModal}
          item={editingCandidate}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
