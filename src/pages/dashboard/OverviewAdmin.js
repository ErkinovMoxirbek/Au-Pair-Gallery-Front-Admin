// src/pages/dashboard/Overview.js — FINAL (German UI) — backend: GET /api/v1/dashboard/stats

import { useEffect, useState } from 'react';
import { Users, Home, Clock, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import dashboardService from '../../services/dashboardService';
import LoadingSpinner from '../../components/shared/LoadingSpinner';

export default function Overview() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalFamilies: 0,
    activeAuPairs: 0,
    pendingApplications: 0,
    breakdown: {
      userStatus: {},
      familyStatus: {},
      candidateStatus: {},
    },
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const MAX_RETRIES = 3;

  // Tailwind-safe (dynamic class muammosini oldini oladi)
  const colorMap = {
    blue: { text: 'text-blue-600', bg: 'bg-blue-100', icon: 'text-blue-600' },
    green: { text: 'text-green-600', bg: 'bg-green-100', icon: 'text-green-600' },
    purple: { text: 'text-purple-600', bg: 'bg-purple-100', icon: 'text-purple-600' },
    orange: { text: 'text-orange-600', bg: 'bg-orange-100', icon: 'text-orange-600' },
  };

  const fetchStats = async (attempt = 1) => {
    if (attempt === 1) {
      setLoading(true);
      setError(null);
      setRetryCount(0);
    }

    try {
      console.log(`Dashboard-Statistiken werden abgefragt... (Versuch: ${attempt})`);
      const response = await dashboardService.getStats();
      console.log('Roh-API-Antwort:', response);

      // axios response.data yoki direct object
      const data = response?.data ?? response;

      if (!data || typeof data !== 'object') {
        throw new Error('Keine gültigen Antwortdaten');
      }

      const finalStats = {
        totalUsers: Number(data.totalUsers) || 0,
        totalFamilies: Number(data.totalFamilies) || 0,
        activeAuPairs: Number(data.activeAuPairs) || 0,
        pendingApplications: Number(data.pendingApplications) || 0,
        breakdown: {
          userStatus: data.breakdown?.userStatus || {},
          familyStatus: data.breakdown?.familyStatus || {},
          candidateStatus: data.breakdown?.candidateStatus || {},
        },
      };

      console.log('Geparste Statistiken:', finalStats);
      setStats(finalStats);
      setLoading(false);
    } catch (err) {
      console.error('Statistik-Abfrage fehlgeschlagen:', err);

      if (attempt < MAX_RETRIES) {
        setRetryCount(attempt);
        setTimeout(() => fetchStats(attempt + 1), 2000 * attempt);
      } else {
        setError(
          'Statistiken konnten nicht geladen werden. Bitte prüfen Sie Ihre Internetverbindung oder versuchen Sie es später erneut.'
        );
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchStats(1);
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
          onClick={() => fetchStats(1)}
          className="flex items-center gap-2 mt-4 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <RefreshCw className="w-4 h-4" />
          Erneut laden
        </button>
      </div>
    );
  }

  // breakdown’dan real qiymatlar
  const pendingUsers = Number(stats.breakdown.userStatus?.PENDING) || 0;
  const pendingCandidates = Number(stats.breakdown.candidateStatus?.PENDING) || 0;

  const statCards = [
    { title: 'Gesamtzahl der Benutzer', value: stats.totalUsers, icon: Users, color: 'blue' },
    { title: 'Familien', value: stats.totalFamilies, icon: Home, color: 'green' },
    { title: 'Aktive Kandidaten', value: stats.activeAuPairs, icon: CheckCircle, color: 'purple' },
    // Application yo‘q => backend pendingApplications = Candidate PENDING
    { title: 'Ausstehende Bewerbungen', value: stats.pendingApplications, icon: Clock, color: 'orange' },
  ];

  const isActionRequired = stats.pendingApplications > 0;

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
          onClick={() => fetchStats(1)}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Aktualisieren
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, i) => {
          const cm = colorMap[card.color] || colorMap.blue;

          return (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className={`text-3xl font-bold mt-2 ${cm.text}`}>{card.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${cm.bg}`}>
                  <card.icon className={`w-6 h-6 ${cm.icon}`} />
                </div>
              </div>

              {card.value === 0 ? (
                <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  Noch keine Daten
                </span>
              ) : (
                // Qo‘shimcha micro-info (ixtiyoriy, lekin foydali)
                card.title === 'Gesamtzahl der Benutzer' && pendingUsers > 0 ? (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-800 rounded-full">
                    {pendingUsers} wartend (Ausstehend)
                  </span>
                ) : card.title === 'Aktive Kandidaten' && pendingCandidates > 0 ? (
                  <span className="inline-block mt-2 px-2 py-1 text-xs font-medium bg-amber-50 text-amber-800 rounded-full">
                    {pendingCandidates} Kandidat(en) wartend
                  </span>
                ) : null
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Letzte Aktivitäten</h3>

          <div className="space-y-3 text-sm">
            {stats.totalUsers === 0 && stats.totalFamilies === 0 && stats.activeAuPairs === 0 ? (
              <p className="text-gray-500">Noch keine Aktivität</p>
            ) : (
              <>
                {stats.totalUsers > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Benutzerdaten wurden aktualisiert</span>
                  </div>
                )}

                {pendingUsers > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-700">{pendingUsers} Benutzer warten auf Freigabe (Ausstehend)</span>
                  </div>
                )}

                {pendingCandidates > 0 && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-700">{pendingCandidates} Kandidat(en) warten auf Prüfung</span>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div
          className={`rounded-xl p-6 border ${
            isActionRequired ? 'bg-amber-50 border-amber-200' : 'bg-green-50 border-green-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {isActionRequired ? (
              <AlertCircle className="w-6 h-6 text-amber-600" />
            ) : (
              <CheckCircle className="w-6 h-6 text-green-600" />
            )}

            <div>
              <h3 className={`font-semibold ${isActionRequired ? 'text-amber-900' : 'text-green-900'}`}>
                {isActionRequired ? 'Achtung!' : 'Super!'}
              </h3>

              <p className={`text-sm mt-1 ${isActionRequired ? 'text-amber-800' : 'text-green-800'}`}>
                {isActionRequired
                  ? `Für ${stats.pendingApplications} Bewerbung(en) steht eine Entscheidung noch aus.`
                  : 'Alle Bewerbungen sind aktuell bearbeitet!'}
              </p>

              {/* Agar keyin route bo‘lsa, CTA qo‘shib ketishingiz mumkin */}
              {/* <a href="/dashboard/candidates?status=PENDING" className="inline-block mt-3 text-sm font-medium underline">
                Zu wartenden Kandidaten
              </a> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
