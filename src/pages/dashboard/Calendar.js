import { useEffect, useState } from 'react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function Calendar() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardService.getEvents()
      .then(setEvents)
      .catch(() => alert('Voqealar yuklanmadi'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Kalendar</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-7 gap-4 text-center font-medium text-gray-700 mb-4">
          {['Du', 'Se', 'Chor', 'Pay', 'Ju', 'Sha', 'Ya'].map(day => (
            <div key={day}>{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-4">
          {Array.from({ length: 35 }, (_, i) => {
            const day = i - 3; // 1-kun
            const dayEvents = events.filter(e => 
              new Date(e.date).getDate() === day && new Date(e.date).getMonth() === new Date().getMonth()
            );

            return (
              <div 
                key={i} 
                className={`min-h-20 p-2 border rounded-lg ${day > 0 && day <= 31 ? 'bg-gray-50' : 'bg-gray-100'}`}
              >
                {day > 0 && day <= 31 && (
                  <>
                    <div className="text-sm font-medium">{day}</div>
                    {dayEvents.map((ev, idx) => (
                      <div key={idx} className="text-xs bg-blue-100 text-blue-800 p-1 mt-1 rounded">
                        {ev.title}
                      </div>
                    ))}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}