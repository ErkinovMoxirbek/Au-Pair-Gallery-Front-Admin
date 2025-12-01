// src/pages/dashboard/Families.js - CLEAN VIEW WITH SLIDE-OVER DETAIL (German UI - Pro Variant)
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Users,
  MapPin,
  Phone,
  Mail,
  X,
  Edit,
  Trash2,
  User,
  DollarSign,
  Clock,
  Car,
  Utensils,
  Briefcase,
  Baby,
  List,
  Grid,
  RefreshCcw,
} from "lucide-react";

import dashboardService from "../../services/dashboardService";
import LoadingSpinner from "../../components/shared/LoadingSpinner";
import FamilyModal from "../../components/shared/FamilyModal";

// --- Helper: qiymatlarni chiroyli formatlash (No -> Ma'lumot yo'q) ---
function formatValue(value, fallback = "Maʼlumot yoʻq") {
  if (value === null || value === undefined) return fallback;

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return fallback;

    const lower = trimmed.toLowerCase();
    if (["no", "none", "n/a", "-"].includes(lower)) return fallback;

    return trimmed;
  }

  return value; // sonlar va boshqa tiplar uchun
}

// --- Oila rasmi uchun avatar ---
function FamilyAvatar({ name, size = "md" }) {
  const initial = name ? name.charAt(0).toUpperCase() : "F";
  const sizeClasses =
    size === "lg" ? "w-14 h-14 text-2xl" : "w-10 h-10 text-lg";

  return (
    <div
      className={`rounded-full flex items-center justify-center text-white font-semibold bg-indigo-500/90 ${sizeClasses}`}
    >
      {initial}
    </div>
  );
}

// --- Oila card komponenti ---
function FamilyCard({ family, onSelect, onEdit, onDelete }) {
  const statusColor =
    family.status === "ACTIVE"
      ? "bg-green-100 text-green-700"
      : "bg-red-100 text-red-700";

  return (
    <div
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 cursor-pointer hover:shadow-xl hover:border-indigo-200 transition-all duration-200 flex flex-col justify-between h-full"
      onClick={() => onSelect(family)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4 gap-3">
        {/* LEFT: avatar + name + status */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <FamilyAvatar name={family.familyName} />
          <div className="flex flex-col min-w-0">
            <h3 className="text-[16px] font-semibold text-gray-900 leading-snug break-words">
              {family.familyName}
            </h3>
            <span
              className={`mt-1 inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full w-fit ${statusColor}`}
            >
              {family.status === "ACTIVE" ? "Aktiv" : "Nofaol"}
            </span>
          </div>
        </div>

        {/* RIGHT: location */}
        <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
          <MapPin className="w-3.5 h-3.5 text-gray-400" />
          <span className="truncate max-w-[80px] text-right">
            {family.city}
          </span>
        </div>
      </div>

      {/* Body Info */}
      <div className="space-y-1 text-sm text-gray-600 border-t border-b border-gray-100 py-4 mb-4">
        <p className="flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" />
          <span>Oila a'zolari:</span>
          <span className="font-semibold">{family.members ?? "—"}</span>
        </p>
        <p className="flex items-center gap-2">
          <Baby className="w-4 h-4 text-indigo-400" />
          <span>Bolalar soni:</span>
          <span className="font-semibold">{family.childrenCount ?? 0}</span>
        </p>
        <p className="flex items-center gap-2 truncate">
          <Clock className="w-4 h-4 text-indigo-400" />
          <span>Ish soati:</span>
          <span className="font-semibold">
            {family.workingHoursPerWeek || "Nomaʼlum"} soat
          </span>
        </p>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(family);
          }}
          className="p-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
          title="Tahrirlash"
        >
          <Edit className="w-5 h-5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(family.id);
          }}
          className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
          title="O'chirish"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

// --- Main component ---
export default function Families() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid / list
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadFamilies();
  }, []);

  // API dan oilalarni yuklash
  const loadFamilies = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getFamilies();
      console.log("Families API response:", res);

      let list = [];
      const payload = res?.data;

      if (Array.isArray(payload)) {
        list = payload;
      } else if (Array.isArray(payload?.data)) {
        list = payload.data;
      } else if (Array.isArray(payload?.data?.content)) {
        list = payload.data.content;
      } else if (Array.isArray(payload?.content)) {
        list = payload.content;
      } else {
        list = [];
      }

      setFamilies(list);
    } catch (error) {
      console.error("Oilalarni yuklashda xatolik:", error);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setSelectedFamily(null);
    setShowDetailModal(false);
  };

  const safeFamilies = Array.isArray(families) ? families : [];

  const filteredFamilies = safeFamilies.filter(
    (family) =>
      family.familyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      family.city?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openModal = (family = null) => {
    setEditingFamily(family);
    setShowModal(true);
    closeDetailModal();
  };

  // 🔥 MUHIM: YANGI / ESKI OILA SAQLASH
  const handleSaveFamily = async (data) => {
    try {
      if (data.id) {
        // EDIT mode
        await dashboardService.updateFamily(data.id, data);
      } else {
        // CREATE mode
        await dashboardService.createFamily(data);
      }
      await loadFamilies();
    } catch (err) {
      console.error("Family saqlashda xatolik:", err);
      alert("Family saqlashda xatolik yuz berdi");
    }
  };

  // 🔥 MUHIM: O‘CHIRISH
  const handleDelete = async (id) => {
    if (!window.confirm("Rostdan ham bu oilani o'chirmoqchimisiz?")) return;
    try {
      await dashboardService.deleteFamily(id);
      closeDetailModal();
      await loadFamilies();
    } catch (err) {
      console.error("Family o'chirishda xatolik:", err);
      alert("Family o'chirishda xatolik yuz berdi");
    }
  };

  const openDetailModal = (family) => {
    setSelectedFamily(family);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setSelectedFamily(null);
    setShowDetailModal(false);
  };

  const isDetailOpen = showDetailModal && selectedFamily;

  return (
    <div className="p-6 md:p-10 min-h-screen bg-gray-50 relative">
      <div className="max-w-7xl mx-auto">
        {/* Header and Controls */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Oila Ro'yxati ({safeFamilies.length})
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Oila yoki shahar bo'yicha qidirish..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full sm:w-64 pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white shadow-sm focus:ring-indigo-500 focus:border-indigo-500 transition"
              />
            </div>

            <button
              onClick={loadFamilies}
              className="px-4 py-2.5 text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-100 transition shadow-sm flex items-center justify-center gap-2"
              title="Yangilash"
            >
              <RefreshCcw className="w-5 h-5" />
            </button>
            <button
              onClick={() => openModal()}
              className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-200 transition flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yangi oila
            </button>
          </div>
        </div>

        {/* View Mode and Status */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-600">
            {filteredFamilies.length} ta oila topildi.
          </span>
          <div className="flex gap-2 p-1 bg-white border border-gray-200 rounded-xl shadow-sm">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition ${
                viewMode === "grid"
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition ${
                viewMode === "list"
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Family List */}
        {loading ? (
          <LoadingSpinner />
        ) : filteredFamilies.length === 0 ? (
          <div className="text-center p-20 bg-white rounded-3xl border border-dashed border-gray-300">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p className="text-xl font-semibold text-gray-700">
              Hech qanday oila topilmadi
            </p>
            <p className="text-gray-500">
              Qidiruv shartlarini tekshiring yoki yangi oila qo'shing.
            </p>
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              viewMode === "grid"
                ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                : "grid-cols-1"
            }`}
          >
            {filteredFamilies.map((family) => (
              <FamilyCard
                key={family.id}
                family={family}
                onSelect={openDetailModal}
                onEdit={openModal}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit/Create Modal */}
      {showModal && (
        <FamilyModal
          show={showModal}
          onClose={() => setShowModal(false)}
          item={editingFamily}
          onSave={handleSaveFamily}
        />
      )}

      {/* Detail Panel (Slide-over Drawer) */}
      <FamilyDetailDrawer
        show={isDetailOpen}
        onClose={closeDetailModal}
        family={selectedFamily}
        onEdit={openModal}
        onDelete={handleDelete}
      />
    </div>
  );
}

// --- Family Detail Drawer Component ---
function FamilyDetailDrawer({ show, onClose, family, onEdit, onDelete }) {
  if (!show || !family) return null;

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    onDelete(family.id);
    onClose();
  };

  const statusColor =
    family.status === "ACTIVE" ? "bg-green-500" : "bg-red-500";
  const statusText = family.status === "ACTIVE" ? "Faol" : "Nofaol";

  return (
    <div
      className={`fixed inset-0 z-50 overflow-hidden transition-opacity duration-300 ${
        show ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/40" onClick={onClose} />

      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 max-w-full flex transition-transform duration-300 transform ${
          show ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="w-screen max-w-lg">
          <div className="h-full flex flex-col bg-white shadow-2xl rounded-l-3xl overflow-y-auto">
            {/* Header */}
            <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-200 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <FamilyAvatar name={family.familyName} size="lg" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 leading-tight">
                    {family.familyName} Oila
                  </h2>
                  <p className="text-sm text-gray-500">
                    {formatValue(family.city, "-")},{" "}
                    {formatValue(family.country, "-")}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Status & Contact Info */}
            <div className="px-8 py-4 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0 sticky top-[77px] z-10 shadow-sm">
              <div className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-full ${statusColor}`} />
                <span className="text-sm font-semibold text-gray-700">
                  {statusText}
                </span>
              </div>
              <div className="flex gap-4">
                <a
                  href={`tel:${family.phone}`}
                  className="text-indigo-600 hover:text-indigo-700 transition"
                  title="Qo'ng'iroq"
                >
                  <Phone className="w-5 h-5" />
                </a>
                <a
                  href={`mailto:${family.email}`}
                  className="text-indigo-600 hover:text-indigo-700 transition"
                  title="Email yuborish"
                >
                  <Mail className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Detail Content */}
            <div className="flex-1 p-6 md:p-8 space-y-8 overflow-y-auto">
              {/* General */}
              <DetailSection icon={User} title="Asosiy Ma'lumotlar">
                <DetailItem
                  label="Ota/Ona ismi"
                  value={`${formatValue(family.fatherName, "-")} / ${formatValue(
                    family.motherName,
                    "-"
                  )}`}
                />
                <DetailItem
                  label="A'zolar soni"
                  value={`${family.members ?? "—"} kishi`}
                />
                <DetailItem
                  label="So'zlashadigan tillar"
                  value={formatValue(family.languagesSpoken)}
                />
                <DetailItem
                  label="Ro'yxatga olingan sana"
                  value={
                    family.createdAt
                      ? new Date(family.createdAt).toLocaleDateString("de-DE")
                      : "-"
                  }
                />
              </DetailSection>

              {/* Address */}
              <DetailSection icon={MapPin} title="Manzil">
                <DetailItem
                  label="Davlat/Shahar"
                  value={`${formatValue(family.country, "-")}, ${formatValue(
                    family.city,
                    "-"
                  )}`}
                />
                <DetailItem
                  label="To'liq manzil"
                  value={formatValue(family.address)}
                  type="long"
                />
              </DetailSection>

              {/* Children */}
              <DetailSection icon={Baby} title="Bolalar Haqida">
                <DetailItem
                  label="Bolalar soni"
                  value={`${family.childrenCount ?? 0} ta`}
                />
                <DetailItem
                  label="Yoshlari"
                  value={formatValue(family.childrenAges)}
                  type="long"
                />
                <DetailItem
                  label="Tavsif"
                  value={formatValue(family.childrenDescription)}
                  type="long"
                />
              </DetailSection>

              {/* Au Pair Requirements */}
              <DetailSection icon={Briefcase} title="Talablar & Shartlar">
                <DetailItem
                  icon={Clock}
                  label="Haftalik ish soati"
                  value={`${family.workingHoursPerWeek || "-"} soat`}
                />
                <DetailItem
                  icon={DollarSign}
                  label="Cho'ntak puli"
                  value={
                    family.pocketMoney !== null &&
                    family.pocketMoney !== undefined
                      ? `${family.pocketMoney} €`
                      : "-"
                  }
                />
                <DetailItem
                  icon={Car}
                  label="Haydovchilik shart"
                  value={family.needsDrivingLicense ? "Ha" : "Yo'q"}
                />
                <DetailItem
                  icon={Utensils}
                  label="Ovqat bilan ta'minlash"
                  value={family.mealsProvided ? "Ha" : "Yo'q"}
                />
                <DetailItem
                  label="Vazifalar"
                  value={formatValue(family.duties)}
                  type="long"
                />
                <DetailItem
                  label="Xona sharoitlari"
                  value={formatValue(family.roomDescription)}
                  type="long"
                />
                <DetailItem
                  label="Afzalliklar"
                  value={formatValue(family.preferences)}
                  type="long"
                />
              </DetailSection>
            </div>

            {/* Footer Actions */}
            <div className="sticky bottom-0 bg-gray-50 p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => onEdit(family)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-semibold shadow-lg shadow-indigo-200 transition"
              >
                <Edit className="w-5 h-5" />
                Tahrirlash
              </button>
              <button
                onClick={handleDeleteClick}
                className="px-6 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-semibold transition flex items-center gap-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Detail Helper Components ---
function DetailSection({ icon: Icon, title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-2 flex items-center gap-3">
        <Icon className="w-5 h-5 text-indigo-500" />
        {title}
      </h3>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value, type = "short" }) {
  const displayValue =
    type === "short" ? formatValue(value, "-") : formatValue(value, "Maʼlumot yoʻq");

  return (
    <div
      className={`flex ${
        type === "short" ? "justify-between items-start" : "flex-col gap-1"
      }`}
    >
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {Icon && <Icon className="w-4 h-4 text-indigo-400" />}
        <span className="font-medium">{label}:</span>
      </div>

      {type === "short" ? (
        <span className="text-sm font-semibold text-gray-700 max-w-[60%] text-right">
          {displayValue}
        </span>
      ) : (
        <p className="text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg w-full mt-1">
          {displayValue}
        </p>
      )}
    </div>
  );
}
