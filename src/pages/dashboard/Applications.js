import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';
import Modal from '../../components/shared/UserModal';

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dashboardService.getApplications()
      .then(setApplications)
      .catch(() => alert('Arizalar yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await dashboardService.updateApplicationStatus(id, status);
      setApplications(prev => prev.map(app => 
        app.id === id ? { ...app, status } : app
      ));
      setIsModalOpen(false);
    } catch (err) {
      alert('Status yangilanmadi');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Arizalar</h1>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ariza beruvchi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oila</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sana</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {applications.map(app => (
              <tr key={app.id}>
                <td className="px-6 py-4 text-sm">{app.applicantName}</td>
                <td className="px-6 py-4 text-sm">{app.familyName}</td>
                <td className="px-6 py-4 text-sm">{new Date(app.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    app.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    app.status === 'approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {app.status === 'pending' ? 'Kutilmoqda' : 
                     app.status === 'approved' ? 'Tasdiqlangan' : 'Rad etilgan'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button 
                    onClick={() => { setSelectedApp(app); setIsModalOpen(true); }}
                    className="text-blue-600 hover:underline"
                  >
                    Boshqarish
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Ariza holatini o'zgartirish">
        {selectedApp && (
          <div className="space-y-4">
            <p><strong>Ariza beruvchi:</strong> {selectedApp.applicantName}</p>
            <p><strong>Oila:</strong> {selectedApp.familyName}</p>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => updateStatus(selectedApp.id, 'approved')}
                className="flex-1 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Tasdiqlash
              </button>
              <button 
                onClick={() => updateStatus(selectedApp.id, 'rejected')}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Rad etish
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}