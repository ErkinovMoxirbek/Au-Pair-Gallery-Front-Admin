// src/pages/dashboard/Overview.js — FINAL (German UI)

import { useEffect, useState } from 'react';
import {
  Users,
  Home,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function Overview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFamilies: 0,
    activeAuPairs: 0,
    pendingApplications: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  const fetchStats = async (isRetry = false) => {
    if (!isRetry) {
      setLoading(true);
      setError(null);
    }

    try {
      console.log('Dashboard-Statistiken werden abgefragt... (Versuch:', retryCount + 1 + ')');
      const response = await dashboardService.getStats();
      console.log('Roh-API-Antwort:', response);

      // === STRUKTUR-PRÜFUNG ===
      let data = null;

      // 1. axios response.data
      if (response?.data) {
        data = response.data;
      }
      // 2. direktes Objekt
      else if (response && typeof response === 'object') {
        data = response;
      }

      if (!data) throw new Error('Keine Antwortdaten');

      // 3. Verschachteltes `data` extrahieren
      const statsData = data.data || data;

      if (!statsData) throw new Error('Keine Statistikdaten in der Antwort');

      const finalStats = {
        totalUsers: Number(statsData.totalUsers) || 0,
        totalFamilies: Number(statsData.totalFamilies) || 0,
        activeAuPairs: Number(statsData.activeAuPairs) || 0,
        pendingApplications: Number(statsData.pendingApplications) || 0,
      };

      console.log('Geparste Statistiken:', finalStats);
      setStats(finalStats);
      setRetryCount(0); // Retry zurücksetzen
    } catch (err) {
      console.error('Statistik-Abfrage fehlgeschlagen:', err);

      if (retryCount < MAX_RETRIES) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
          fetchStats(true);
        }, 2000 * (retryCount + 1));
      } else {
        setError(
          'Statistiken konnten nicht geladen werden. Bitte prüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.'
        );
      }
    } finally {
      if (!isRetry || retryCount >= MAX_RETRIES) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <LoadingSpinner />
        <p className="mt-4 text-sm text-gray-600">
          {retryCount > 0
            ? `Wiederholungsversuch: ${retryCount}/${MAX_RETRIES}`
            : 'Statistiken werden geladen...'}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <button
          onClick={() => {
            setRetryCount(0);
            fetchStats();
          }}
          className="flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Erneut laden
        </button>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Gesamtzahl der Benutzer',
      value: stats.totalUsers,
      icon: Users,
      color: 'blue',
    },
    {
      title: 'Familien',
      value: stats.totalFamilies,
      icon: Home,
      color: 'green',
    },
    {
      title: 'Aktive Kandidaten',
      value: stats.activeAuPairs,
      icon: CheckCircle,
      color: 'purple',
    },
    {
      title: 'Ausstehende Bewerbungen',
      value: stats.pendingApplications,
      icon: Clock,
      color: 'orange',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Übersicht</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('de-DE', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        <button
          onClick={() => fetchStats()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Aktualisieren
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-sm font-medium text-gray-600">{card.title}</p>
                <p className={`text-3xl font-bold mt-2 text-${card.color}-600`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-lg bg-${card.color}-100`}>
                <card.icon className={`w-6 h-6 text-${card.color}-600`} />
              </div>
            </div>
            {card.value === 0 && (
              <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                Noch keine Daten
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Letzte Aktivitäten
          </h3>
          <div className="space-y-3 text-sm">
            {stats.totalUsers === 0 ? (
              <p className="text-gray-500">Noch keine Aktivität</p>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">
                    Neuer Benutzer wurde hinzugefügt
                  </span>
                </div>
                {stats.pendingApplications > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-700">
                      {stats.pendingApplications} neue Bewerbung(en)
                    </span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div
          className={`rounded-xl p-6 border ${
            stats.pendingApplications > 0
              ? 'bg-amber-50 border-amber-200'
              : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {stats.pendingApplications > 0 ? (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}
            <div>
              <h3
                className={`font-semibold ${
                  stats.pendingApplications > 0
                    ? 'text-amber-900'
                    : 'text-green-900'
                }`}
              >
                {stats.pendingApplications > 0 ? 'Achtung!' : 'Super!'}
              </h3>
              <p
                className={`text-sm mt-1 ${
                  stats.pendingApplications > 0
                    ? 'text-amber-800'
                    : 'text-green-800'
                }`}
              >
                {stats.pendingApplications > 0
                  ? `Für ${stats.pendingApplications} Bewerbung(en) steht eine Entscheidung noch aus.`
                  : 'Alle Bewerbungen sind aktuell bearbeitet!'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
