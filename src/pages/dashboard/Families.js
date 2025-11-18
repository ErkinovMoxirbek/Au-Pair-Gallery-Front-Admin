// src/pages/dashboard/Families.js - CLEAN VIEW WITH DETAIL MODAL (German UI)
import { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Download,
  Users,
  MapPin,
  Phone,
  Mail,
  Home as HomeIcon,
  X,
  Edit,
  Trash2,
  User,
  DollarSign,
  Clock,
  Car,
  Utensils,
  Calendar,
  MessageSquare,
  Globe,
  Briefcase
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import FamilyModal from '../../components/shared/FamilyModal';

export default function Families() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFamily, setEditingFamily] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [selectedFamily, setSelectedFamily] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    loadFamilies();
  }, []);

  const loadFamilies = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getFamilies();
      let list = [];
      if (res?.data?.content) list = res.data.content;
      else if (res?.data) list = res.data;
      else if (res) list = res;
      setFamilies(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Error:', error);
      setFamilies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (familyData) => {
    try {
      if (editingFamily) {
        await dashboardService.updateFamily(editingFamily.id, familyData);
      } else {
        await dashboardService.createFamily(familyData);
      }
      await loadFamilies();
      closeModal();
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Möchten Sie wirklich löschen?')) {
      try {
        await dashboardService.deleteFamily(id);
        setShowDetailModal(false);
        await loadFamilies();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Fehler: ' + error.message);
      }
    }
  };

  const openModal = (family = null) => {
    setEditingFamily(family);
    setShowModal(true);
    setShowDetailModal(false);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingFamily(null);
  };

  const openDetailModal = (family) => {
    setSelectedFamily(family);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedFamily(null);
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Familie', 'Vater', 'Mutter', 'Adresse', 'Telefon', 'E-Mail', 'Kinder'];
    const rows = filteredFamilies.map((f) => [
      f.id,
      f.familyName || '',
      f.fatherName || '',
      f.motherName || '',
      `${f.address || ''} ${f.city || ''} ${f.country || ''}`.trim(),
      f.phone || '',
      f.email || '',
      f.childrenCount || 0
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `families_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFamilies = families.filter((f) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      (f.familyName || '').toLowerCase().includes(search) ||
      (f.fatherName || '').toLowerCase().includes(search) ||
      (f.motherName || '').toLowerCase().includes(search) ||
      (f.email || '').toLowerCase().includes(search) ||
      (f.phone || '').toLowerCase().includes(search) ||
      (f.city || '').toLowerCase().includes(search)
    );
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Familien</h1>
            <p className="text-gray-600 mt-1">{filteredFamilies.length} Familien</p>
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
              <span>Neue Familie</span>
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
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <div className="flex gap-2 bg-gray-100 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
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
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg transition ${
                viewMode === 'table' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
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
      {filteredFamilies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
            <HomeIcon className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Keine Familien gefunden</h3>
          <p className="text-gray-500">
            {searchTerm ? 'Suchbegriff anpassen' : 'Fügen Sie eine neue Familie hinzu'}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        // GRID VIEW - SIMPLE CLEAN CARDS
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredFamilies.map((family) => (
            <div
              key={family.id}
              onClick={() => openDetailModal(family)}
              className="bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg hover:border-blue-400 transition-all cursor-pointer group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition">
                  {family.familyName?.charAt(0)?.toUpperCase() || 'F'}
                </div>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-full">
                  ID: {family.id}
                </span>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-3 truncate">
                {family.familyName || 'Unbekannte Familie'}
              </h3>

              <div className="space-y-2.5">
                {(family.city || family.country) && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="truncate">
                      {[family.city, family.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}

                {family.phone && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span>{family.phone}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm font-semibold text-gray-900">
                      {family.childrenCount || 0} Kinder
                    </span>
                  </div>
                  {family.pocketMoney && (
                    <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                      <DollarSign className="w-4 h-4" />
                      {family.pocketMoney}
                    </div>
                  )}
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
        // TABLE VIEW - SIMPLE
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Familie</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Ort</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Kontakt</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase">Kinder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredFamilies.map((family) => (
                  <tr
                    key={family.id}
                    onClick={() => openDetailModal(family)}
                    className="hover:bg-blue-50 transition cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0">
                          {family.familyName?.charAt(0)?.toUpperCase() || 'F'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {family.familyName || 'Unbekannt'}
                          </p>
                          <p className="text-xs text-gray-500">ID: {family.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span>
                          {[family.city, family.country].filter(Boolean).join(', ') || '—'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {family.phone && (
                          <p className="text-sm text-gray-700 flex items-center gap-2">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {family.phone}
                          </p>
                        )}
                        {family.email && (
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {family.email}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm font-semibold rounded-lg">
                          <Users className="w-4 h-4" />
                          {family.childrenCount || 0}
                        </span>
                        {family.pocketMoney && (
                          <span className="text-sm font-semibold text-green-600">
                            €{family.pocketMoney}
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
              Insgesamt {filteredFamilies.length} Familien
            </p>
          </div>
        </div>
      )}

      {/* DETAIL MODAL - FULL INFORMATION */}
      {showDetailModal && selectedFamily && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl font-bold">
                    {selectedFamily.familyName?.charAt(0)?.toUpperCase() || 'F'}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedFamily.familyName || 'Unbekannte Familie'}
                    </h2>
                    <p className="text-blue-100">ID: {selectedFamily.id}</p>
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

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Parents Section */}
              {(selectedFamily.fatherName || selectedFamily.motherName) && (
                <div className="bg-gray-50 rounded-2xl p-5">
                  <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Eltern
                  </h3>
                  <div className="space-y-3">
                    {selectedFamily.fatherName && (
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">👨</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Vater</p>
                          <p className="font-semibold text-gray-900">
                            {selectedFamily.fatherName}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedFamily.motherName && (
                      <div className="flex items-center gap-3 bg-white p-3 rounded-xl">
                        <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                          <span className="text-xl">👩</span>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Mutter</p>
                          <p className="font-semibold text-gray-900">
                            {selectedFamily.motherName}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Section */}
              <div className="bg-gray-50 rounded-2xl p-5">
                <h3 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Kontaktdaten
                </h3>
                <div className="space-y-3">
                  {selectedFamily.phone && (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl">
                      <Phone className="w-5 h-5 text-green-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">Telefon</p>
                        <a
                          href={`tel:${selectedFamily.phone}`}
                          className="font-semibold text-gray-900 hover:text-blue-600"
                        >
                          {selectedFamily.phone}
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedFamily.email && (
                    <div className="flex items-center gap-3 bg-white p-3 rounded-xl">
                      <Mail className="w-5 h-5 text-orange-500" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500">E-Mail</p>
                        <a
                          href={`mailto:${selectedFamily.email}`}
                          className="font-semibold text-gray-900 hover:text-blue-600 break-all"
                        >
                          {selectedFamily.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {(selectedFamily.address ||
                    selectedFamily.city ||
                    selectedFamily.country) && (
                    <div className="flex items-start gap-3 bg-white p-3 rounded-xl">
                      <MapPin className="w-5 h-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 mb-1">Adresse</p>
                        <p className="font-semibold text-gray-900">
                          {[
                            selectedFamily.address,
                            selectedFamily.city,
                            selectedFamily.country
                          ]
                            .filter(Boolean)
                            .join(', ')}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Children & Work Details */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    <h4 className="font-bold text-gray-900">Kinder</h4>
                  </div>
                  <p className="text-3xl font-bold text-blue-600">
                    {selectedFamily.childrenCount || 0}
                  </p>
                  {selectedFamily.childrenAges && (
                    <p className="text-sm text-gray-600 mt-2">
                      Alter: {selectedFamily.childrenAges}
                    </p>
                  )}
                </div>

                {selectedFamily.pocketMoney && (
                  <div className="bg-green-50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <h4 className="font-bold text-gray-900">Taschengeld</h4>
                    </div>
                    <p className="text-3xl font-bold text-green-600">
                      €{selectedFamily.pocketMoney}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">pro Monat</p>
                  </div>
                )}

                {selectedFamily.workingHoursPerWeek && (
                  <div className="bg-purple-50 rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="w-5 h-5 text-purple-600" />
                      <h4 className="font-bold text-gray-900">Arbeitszeit</h4>
                    </div>
                    <p className="text-3xl font-bold text-purple-600">
                      {selectedFamily.workingHoursPerWeek}
                    </p>
                    <p className="text-sm text-gray-600 mt-2">Stunden / Woche</p>
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {(selectedFamily.duties ||
                selectedFamily.familyDescription ||
                selectedFamily.preferences ||
                selectedFamily.roomDescription) && (
                <div className="bg-gray-50 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Zusätzliche Informationen
                  </h3>

                  {selectedFamily.duties && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Aufgaben</p>
                      <p className="text-gray-900 bg-white p-3 rounded-xl">
                        {selectedFamily.duties}
                      </p>
                    </div>
                  )}

                  {selectedFamily.familyDescription && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Über die Familie</p>
                      <p className="text-gray-900 bg-white p-3 rounded-xl">
                        {selectedFamily.familyDescription}
                      </p>
                    </div>
                  )}

                  {selectedFamily.roomDescription && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Zimmerbeschreibung</p>
                      <p className="text-gray-900 bg-white p-3 rounded-xl">
                        {selectedFamily.roomDescription}
                      </p>
                    </div>
                  )}

                  {selectedFamily.preferences && (
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Präferenzen</p>
                      <p className="text-gray-900 bg-white p-3 rounded-xl">
                        {selectedFamily.preferences}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Features */}
              <div className="flex flex-wrap gap-2">
                {selectedFamily.needsDrivingLicense && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 font-semibold rounded-xl">
                    <Car className="w-4 h-4" />
                    Führerschein erforderlich
                  </span>
                )}
                {selectedFamily.mealsProvided && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 font-semibold rounded-xl">
                    <Utensils className="w-4 h-4" />
                    Verpflegung inklusive
                  </span>
                )}
                {selectedFamily.languagesSpoken && (
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-semibold rounded-xl">
                    <Globe className="w-4 h-4" />
                    {selectedFamily.languagesSpoken}
                  </span>
                )}
              </div>

              {/* Date */}
              {selectedFamily.createdAt && (
                <div className="text-center pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    Erstellt am:{' '}
                    {new Date(selectedFamily.createdAt).toLocaleDateString('de-DE', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-3xl border-t border-gray-200 flex gap-3">
              <button
                onClick={() => openModal(selectedFamily)}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold shadow-lg transition"
              >
                <Edit className="w-5 h-5" />
                Bearbeiten
              </button>
              <button
                onClick={() => handleDelete(selectedFamily.id)}
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

      {/* Edit Modal */}
      {showModal && (
        <FamilyModal
          show={showModal}
          onClose={closeModal}
          item={editingFamily}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
