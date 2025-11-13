import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function Families() {
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getFamilies()
      .then(setFamilies)
      .catch(() => alert('Oilalar yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Oilalar</h1>
        <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          + Yangi oila
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Oila nomi</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Manzil</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">A'zolar soni</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amallar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {families.map(family => (
              <tr key={family.id}>
                <td className="px-6 py-4 text-sm font-medium">{family.familyName}</td>
                <td className="px-6 py-4 text-sm">{family.address}</td>
                <td className="px-6 py-4 text-sm">{family.memberCount}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    family.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {family.status === 'active' ? 'Faol' : 'Kutilmoqda'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm">
                  <button className="text-blue-600 hover:underline mr-3">Ko'rish</button>
                  <button className="text-red-600 hover:underline">O'chirish</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}