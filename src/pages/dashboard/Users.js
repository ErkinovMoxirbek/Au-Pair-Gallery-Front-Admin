// src/pages/dashboard/Users.js - FIXED VERSION (Admin-Schutz + Deutsche Texte)
import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Download, UserPlus } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/Modal';

// Rollen-Bezeichnungen
const roleLabels = {
  'ROLE_ADMIN': 'Admin',
  'ROLE_SHEFF': 'Admin',
  'ROLE_AUPAIR': 'Kandidat',
  'ROLE_FAMILY': 'Familie',
};

// Status-Bezeichnungen
const statusLabels = {
  ACTIVE: 'Aktiv',
  NOACTIVE: 'Inaktiv',
  INACTIVE: 'In Bearbeitung',
};

// Helper: Prüfen, ob Benutzer Admin ist
const isAdminUser = (user) => {
  if (!user || !Array.isArray(user.roles)) return false;
  return user.roles.includes('ROLE_ADMIN') || user.roles.includes('ROLE_SHEFF');
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
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
      alert('Fehler beim Laden der Benutzer: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (userData) => {
    // Admin-Rolle bei neuem Benutzer verbieten
    const rawRoles = Array.isArray(userData.roles)
      ? userData.roles
      : userData.role
      ? [userData.role]
      : [];

    const hasAdminRole =
      rawRoles.includes('ROLE_ADMIN') || rawRoles.includes('ROLE_SHEFF');

    // Neuer Benutzer mit Admin-Rolle ist nicht erlaubt
    if (!editingUser && hasAdminRole) {
      alert('Das Anlegen eines Benutzers mit Admin-Rolle ist nicht erlaubt.');
      throw new Error('Admin creation not allowed');
    }

    // Bearbeiten eines Admin-Benutzers verbieten
    if (editingUser && isAdminUser(editingUser)) {
      alert('Das Bearbeiten eines Admin-Benutzers ist nicht erlaubt.');
      throw new Error('Admin edit not allowed');
    }

    try {
      if (editingUser) {
        await dashboardService.updateUser(editingUser.id, userData);
      } else {
        await dashboardService.createUser(userData);
      }
      await loadUsers();
      closeModal();
    } catch (error) {
      console.error('Save error:', error);
      throw error;
    }
  };

  const handleDelete = async (id) => {
    const userToDelete = users.find((u) => u.id === id);

    // Admin darf nicht gelöscht werden
    if (userToDelete && isAdminUser(userToDelete)) {
      alert('Das Löschen eines Admin-Benutzers ist nicht erlaubt.');
      return;
    }

    if (window.confirm('Möchten Sie diesen Benutzer wirklich löschen?')) {
      try {
        await dashboardService.deleteUser(id);
        await loadUsers();
      } catch (error) {
        console.error('Delete error:', error);
        alert('Fehler beim Löschen: ' + error.message);
      }
    }
  };

  const openModal = (user = null) => {
    // Modal für Admin-User nicht öffnen
    if (user && isAdminUser(user)) {
      alert('Das Bearbeiten eines Admin-Benutzers ist nicht erlaubt.');
      return;
    }
    setEditingUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'E-Mail', 'Rollen', 'Status'];
    const rows = filteredUsers.map((user) => [
      `${user.name ?? ''} ${user.surname ?? ''}`.trim(),
      user.email,
      Array.isArray(user.roles)
        ? user.roles.map((r) => roleLabels[r] || r).join(', ')
        : '',
      statusLabels[user.status] || user.status,
    ]);

    const csv = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'benutzer.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Benutzer filtern
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.surname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole =
      filterRole === 'all' ||
      (Array.isArray(user.roles) && user.roles.includes(filterRole));

    return matchesSearch && matchesRole;
  });

  // Benutzer sortieren
  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];

    if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Benutzer</h1>
          <p className="text-gray-600 mt-1">
            Insgesamt {filteredUsers.length} Benutzer
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exportieren</span>
          </button>
          {/* Hinzufügen-Button bleibt, Admin-Erstellung wird in handleSave blockiert */}
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Benutzer hinzufügen</span>
          </button>
        </div>
      </div>

      {/* Such- & Filter-Leiste */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Nach Name oder E-Mail suchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Alle Rollen</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_AUPAIR">Kandidat</option>
              <option value="ROLE_FAMILY">Familie</option>
            </select>
          </div>
        </div>

        {/* Aktive Filter */}
        {(searchTerm || filterRole !== 'all') && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Aktive Filter:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                Suche: {searchTerm}
                <button
                  onClick={() => setSearchTerm('')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {filterRole !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                Rolle: {roleLabels[filterRole] || filterRole}
                <button
                  onClick={() => setFilterRole('all')}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterRole('all');
              }}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Alle Filter zurücksetzen
            </button>
          </div>
        )}
      </div>

      {/* Benutzer-Tabelle */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    NAME
                    {sortConfig.key === 'name' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('email')}
                >
                  <div className="flex items-center gap-2">
                    E-MAIL
                    {sortConfig.key === 'email' && (
                      <span>{sortConfig.direction === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  ROLLEN
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                  STATUS
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase tracking-wider">
                  AKTIONEN
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">
                      Keine Benutzer gefunden
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      {searchTerm || filterRole !== 'all'
                        ? 'Passen Sie die Filter an oder setzen Sie sie zurück.'
                        : 'Fügen Sie einen neuen Benutzer hinzu.'}
                    </p>
                  </td>
                </tr>
              ) : (
                sortedUsers.map((user) => {
                  const admin = isAdminUser(user);
                  return (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                              {user.surname?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user.name || 'Unbekannt'}{' '}
                              {user.surname || 'Unbekannt'}
                            </p>
                            <p className="text-xs text-gray-500">
                              ID: {user.id}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1">
                          {Array.isArray(user.roles) && user.roles.length > 0 ? (
                            user.roles.map((role, i) => (
                              <span
                                key={i}
                                className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  role === 'ROLE_ADMIN' || role === 'ROLE_SHEFF'
                                    ? 'bg-purple-100 text-purple-700'
                                    : role === 'ROLE_AUPAIR'
                                    ? 'bg-blue-100 text-blue-700'
                                    : role === 'ROLE_FAMILY'
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-700'
                                }`}
                              >
                                {roleLabels[role] || role}
                              </span>
                            ))
                          ) : (
                            <span className="text-gray-400 text-xs">
                              Keine Rolle
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-700'
                              : user.status === 'NOACTIVE'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}
                        >
                          {statusLabels[user.status] || user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(user)}
                            className={`p-2 rounded-lg transition-colors ${
                              admin
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-blue-600 hover:bg-blue-50'
                            }`}
                            title={
                              admin
                                ? 'Admin-Benutzer können nicht bearbeitet werden.'
                                : 'Bearbeiten'
                            }
                            disabled={admin}
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(user.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              admin
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-red-600 hover:bg-red-50'
                            }`}
                            title={
                              admin
                                ? 'Admin-Benutzer können nicht gelöscht werden.'
                                : 'Löschen'
                            }
                            disabled={admin}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Tabellen-Fußzeile */}
        {sortedUsers.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Insgesamt{' '}
                <span className="font-medium">{sortedUsers.length}</span>{' '}
                Ergebnis(se)
              </p>
            </div>
          </div>
        )}
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
