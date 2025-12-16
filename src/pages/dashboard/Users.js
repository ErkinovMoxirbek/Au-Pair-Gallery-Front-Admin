// src/pages/dashboard/Users.js
import { useEffect, useMemo, useState, useCallback } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Download,
  Filter,
  RefreshCw,
  Send,
  ShieldAlert,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/UserModal';

// --- CONFIGURATION & HELPERS ---

const STATUS_CONFIG = {
  ALL: { label: 'Alle', color: 'bg-gray-100 text-gray-700' },
  PENDING: {
    label: 'Wartet auf Genehmigung',
    color: 'bg-yellow-50 text-yellow-700 ring-1 ring-yellow-600/20',
  },
  APPROVED: {
    label: 'Genehmigt',
    color: 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10',
  },
  ACTIVE: {
    label: 'Aktiv',
    color: 'bg-green-50 text-green-700 ring-1 ring-green-600/20',
  },
  NOACTIVE: {
    label: 'Inaktiv',
    color: 'bg-gray-100 text-gray-600 ring-1 ring-gray-500/10',
  },
  EXPIRED: {
    label: 'Abgelaufen',
    color: 'bg-orange-50 text-orange-700 ring-1 ring-orange-600/20',
  },
  REJECTED: {
    label: 'Abgelehnt',
    color: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
  },
  SUSPENDED: {
    label: 'Gesperrt',
    color: 'bg-red-50 text-red-700 ring-1 ring-red-600/10',
  },
};

const ROLE_LABELS = {
  ROLE_ADMIN: 'Admin',
  ROLE_SHEFF: 'Leitung',
  ROLE_AUPAIR: 'Kandidat (Au Pair)',
  ROLE_FAMILY: 'Familie',
  ADMIN: 'Admin',
  SHEFF: 'Leitung',
  AUPAIR: 'Kandidat (Au Pair)',
  FAMILY: 'Familie',
};

const isAdminUser = (user) => {
  if (!user || !Array.isArray(user.roles)) return false;
  const adminRoles = ['ROLE_ADMIN', 'ROLE_SHEFF', 'ADMIN', 'SHEFF'];
  return user.roles.some((r) => adminRoles.includes(r));
};

const getInitials = (name, surname) => {
  return `${(name?.[0] || '').toUpperCase()}${(surname?.[0] || '').toUpperCase()}`;
};

export default function Users() {
  // --- STATE ---
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null); // ID of user being processed

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // Replaces filterStatus dropdown
  const [filterRole, setFilterRole] = useState('all');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // --- DATA LOADING ---
  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getUsers();
      const list = Array.isArray(res?.data?.content)
        ? res.data.content
        : Array.isArray(res?.data)
        ? res.data
        : [];
      setUsers(list);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Fehler beim Laden der Benutzer');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // --- ACTIONS ---
  const handleSave = async (userData) => {
    try {
      if (editingUser) {
        await dashboardService.updateUser(editingUser.id, userData);
        toast.success('Daten wurden aktualisiert');
      } else {
        const res = await dashboardService.createUser(userData);
        if (res?.data?.status === 'PENDING') {
          toast.success('Erstellt! Sie können den Benutzer jetzt genehmigen.', { icon: '⏳' });
        } else {
          toast.success('Benutzer erfolgreich erstellt');
        }
      }
      closeModal();
      loadUsers();
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Es ist ein Fehler aufgetreten');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Möchten Sie diesen Benutzer wirklich löschen?')) return;
    try {
      await dashboardService.deleteUser(id);
      toast.success('Gelöscht');
      loadUsers();
    } catch (error) {
      toast.error('Fehler beim Löschen');
    }
  };

  const handleApprove = async (userId) => {
    if (!window.confirm('Möchten Sie den Benutzer für 3 Monate genehmigen?')) return;
    setProcessingId(userId);
    try {
      await dashboardService.approveUser(userId, 3);
      toast.success('Genehmigt und E-Mail wurde gesendet');
      loadUsers();
    } catch (error) {
      toast.error('Fehler bei der Genehmigung');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResendEmail = async (userId) => {
    setProcessingId(userId);
    try {
      await dashboardService.resendActivationEmail(userId);
      toast.success('E-Mail wurde erneut gesendet');
    } catch (error) {
      toast.error('Es ist ein Fehler aufgetreten');
    } finally {
      setProcessingId(null);
    }
  };

  const openModal = (user = null) => {
    if (user && isAdminUser(user)) {
      toast.error('Ein Benutzer mit Admin-Rechten kann nicht bearbeitet werden.');
      return;
    }
    setEditingUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  // --- FILTERING LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // 1. Search
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        (user.name || '').toLowerCase().includes(search) ||
        (user.surname || '').toLowerCase().includes(search) ||
        (user.email || '').toLowerCase().includes(search);

      // 2. Tab Filter (Status)
      const matchesStatus = activeTab === 'ALL' || user.status === activeTab;

      // 3. Role Filter
      let matchesRole = true;
      if (filterRole !== 'all') {
        if (filterRole === 'ADMIN') {
          matchesRole = isAdminUser(user);
        } else {
          matchesRole = user.roles?.some((r) => r === filterRole || r === `ROLE_${filterRole}`);
        }
      }

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [users, searchTerm, activeTab, filterRole]);

  // Derived Stats
  const stats = useMemo(
    () => ({
      total: users.length,
      pending: users.filter((u) => u.status === 'PENDING').length,
      approved: users.filter((u) => u.status === 'APPROVED').length,
    }),
    [users]
  );

  // Export CSV
  const exportCSV = () => {
    const header = ['Vorname', 'Nachname', 'E-Mail', 'Rolle', 'Status'];
    const rows = filteredUsers.map((u) => [u.name, u.surname, u.email, (u.roles || []).join(', '), u.status]);
    const csvContent = [header, ...rows].map((e) => e.join(',')).join('\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([csvContent], { type: 'text/csv;charset=utf-8;' }));
    link.download = 'users_export.csv';
    link.click();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-gray-50/50 p-6 space-y-6">
      {/* --- HEADER SECTION --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Benutzer</h1>
          <p className="text-sm text-gray-500 mt-1">
            Insgesamt {stats.total} Benutzer, davon warten {stats.pending} auf Genehmigung.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
          <button
            onClick={() => openModal()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 active:bg-blue-800 transition-all shadow-sm shadow-blue-200"
          >
            <Plus className="w-4 h-4" />
            Neu hinzufügen
          </button>
        </div>
      </div>

      {/* --- FILTERS & TABS CARD --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        {/* Top: Status Tabs */}
        <div className="border-b border-gray-100 overflow-x-auto">
          <div className="flex items-center px-2">
            {[
              { id: 'ALL', label: 'Alle' },
              { id: 'PENDING', label: 'Wartet', count: stats.pending, color: 'text-yellow-600 bg-yellow-50' },
              { id: 'APPROVED', label: 'Genehmigt', count: stats.approved, color: 'text-blue-600 bg-blue-50' },
              { id: 'ACTIVE', label: 'Aktive' },
              { id: 'NOACTIVE', label: 'Inaktive' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  relative px-4 py-4 text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-2
                  ${activeTab === tab.id ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}
                `}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${tab.color}`}>
                    {tab.count}
                  </span>
                )}
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-t-full" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom: Search & Role Filter */}
        <div className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/30">
          <div className="relative w-full sm:max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Suche nach Name oder E-Mail..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 sm:text-sm transition-shadow"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg bg-white"
            >
              <option value="all">Alle Rollen</option>
              <option value="ADMIN">Admins</option>
              <option value="FAMILY">Familien</option>
              <option value="AUPAIR">Kandidaten</option>
            </select>
          </div>
        </div>
      </div>

      {/* --- TABLE SECTION --- */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Benutzer
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rolle
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Registriert am
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Aktionen</span>
                </th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <Search className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-base font-medium text-gray-900">Keine Treffer</p>
                      <p className="text-sm mt-1">
                        Ändern Sie den Suchbegriff oder setzen Sie die Filter zurück.
                      </p>
                      <button
                        onClick={() => {
                          setSearchTerm('');
                          setFilterRole('all');
                          setActiveTab('ALL');
                        }}
                        className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        Filter zurücksetzen
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const isAdmin = isAdminUser(user);
                  const statusInfo = STATUS_CONFIG[user.status] || STATUS_CONFIG.NOACTIVE;
                  const isProcessing = processingId === user.id;

                  return (
                    <tr key={user.id} className="group hover:bg-gray-50/80 transition-colors">
                      {/* Name & Avatar */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div
                              className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${
                                isAdmin
                                  ? 'bg-gradient-to-br from-purple-600 to-indigo-600'
                                  : 'bg-gradient-to-br from-blue-500 to-cyan-500'
                              }`}
                            >
                              {getInitials(user.name, user.surname)}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center gap-1">
                              {user.name} {user.surname}
                              {isAdmin && (
                                <ShieldAlert className="w-3.5 h-3.5 text-indigo-500" title="Admin" />
                              )}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {(user.roles || []).map((role, idx) => (
                            <span
                              key={idx}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200"
                            >
                              {ROLE_LABELS[role] || role}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                              user.status === 'ACTIVE' ? 'bg-green-500' : 'bg-current opacity-60'
                            }`}
                          ></span>
                          {statusInfo.label}
                        </span>
                      </td>

                      {/* Date (Mocked or Real if available) */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {/* Falls Backend Datum liefert: {new Date(user.createdAt).toLocaleDateString()} */}
                        <span className="text-gray-400">-</span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          {/* 1. APPROVE ACTION */}
                          {user.status === 'PENDING' && (
                            <button
                              onClick={() => handleApprove(user.id)}
                              disabled={isProcessing || isAdmin}
                              className="text-green-600 hover:bg-green-50 p-1.5 rounded-lg border border-transparent hover:border-green-200 transition-all"
                              title="Genehmigen"
                            >
                              {isProcessing ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* 2. RESEND EMAIL */}
                          {user.status === 'APPROVED' && (
                            <button
                              onClick={() => handleResendEmail(user.id)}
                              disabled={isProcessing || isAdmin}
                              className="text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg border border-transparent hover:border-blue-200 transition-all"
                              title="E-Mail erneut senden"
                            >
                              {isProcessing ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Send className="w-4 h-4" />
                              )}
                            </button>
                          )}

                          {/* 3. EDIT & DELETE */}
                          {isAdmin ? (
                            <div className="p-1.5 text-gray-300 cursor-not-allowed" title="Admin kann nicht bearbeitet werden">
                              <Lock className="w-4 h-4" />
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => openModal(user)}
                                className="text-gray-500 hover:text-blue-600 hover:bg-blue-50 p-1.5 rounded-lg transition-colors"
                                title="Bearbeiten"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(user.id)}
                                className="text-gray-500 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                                title="Löschen"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Stats */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
            Gesamt: {filteredUsers.length} Ergebnis(se)
          </span>
          {/* Pagination buttons here if backend supports */}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <Modal
          show={showModal}
          onClose={closeModal}
          type="user"
          item={editingUser}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
