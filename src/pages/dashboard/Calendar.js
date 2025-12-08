// src/pages/dashboard/AccessCalendar.js
import { useEffect, useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Users
} from "lucide-react";
import dashboardService from "../../services/dashboardService";

// Helper: bugungi sana (faqat yil-oy-kun)
const toDateOnly = (date) => {
  const d = new Date(date);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
};

// Sana bir kunni qo'shish
const addDays = (date, days) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

// Array [0..n)
const range = (n) => [...Array(n).keys()];

// Kalendar uchun kunlar (6 hafta grid shaklida)
const buildCalendar = (currentMonth) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstOfMonth = new Date(year, month, 1);
  const day = firstOfMonth.getDay(); // 0 = Sun, 1 = Mon, ...
  const startDay = day === 0 ? 7 : day; // Mon=1..Sun=7
  const startDate = addDays(firstOfMonth, -(startDay - 1)); // oyning boshidan oldingi kunlar

  return range(42).map((i) => addDays(startDate, i)); // 6 hafta = 42 kun
};

export default function AccessCalendar() {
  const [users, setUsers] = useState([]); // har doim array bo‘lishini xohlaymiz
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState(() => toDateOnly(new Date()));
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await dashboardService.getUsers(); // bu joyni sening servisingga moslashtir

      console.log("AccessCalendar users response:", res);

      let list = [];

      // Bir nechta ehtimoliy strukturalarga moslash
      if (Array.isArray(res)) {
        list = res;
      } else if (Array.isArray(res?.data)) {
        list = res.data;
      } else if (Array.isArray(res?.data?.data)) {
        // masalan: { data: [ ... ] }
        list = res.data.data;
      } else if (Array.isArray(res?.data?.content)) {
        // masalan PageResponse: { data: { content: [ ... ] } }
        list = res.data.content;
      } else if (Array.isArray(res?.data?.data?.content)) {
        // yana chuqurroq variant
        list = res.data.data.content;
      } else {
        console.warn("Users response unknown structure, using empty list");
        list = [];
      }

      setUsers(list);
    } catch (err) {
      console.error("Users fetch error:", err);
      alert("Benutzer konnten nicht geladen werden.");
      setUsers([]); // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Kalendar grididagi barcha kunlar
  const days = useMemo(() => buildCalendar(currentMonth), [currentMonth]);

  // Har bir user uchun validFrom / validUntil -> Date normalizatsiya
  const normalizedUsers = useMemo(() => {
    if (!Array.isArray(users)) {
      return [];
    }
    return users.map((u) => ({
      ...u,
      _validFrom: u.validFrom ? toDateOnly(u.validFrom) : null,
      _validUntil: u.validUntil ? toDateOnly(u.validUntil) : null
    }));
  }, [users]);

  // Berilgan kunda aktiv bo'lgan userlar
  const getActiveUsersForDate = (date) => {
    if (!Array.isArray(normalizedUsers)) return [];
    return normalizedUsers.filter((u) => {
      if (!u._validFrom || !u._validUntil) return false;
      return u._validFrom <= date && date <= u._validUntil;
    });
  };

  // Griddagi kun uchun count
  const getCountForDate = (date) => getActiveUsersForDate(date).length;

  const monthLabel = useMemo(
    () =>
      currentMonth.toLocaleDateString("de-DE", {
        month: "long",
        year: "numeric"
      }),
    [currentMonth]
  );

  const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  const isSameDay = (d1, d2) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

  const isCurrentMonth = (date) =>
    date.getFullYear() === currentMonth.getFullYear() &&
    date.getMonth() === currentMonth.getMonth();

  const handlePrevMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1)
    );
  };

  const handleNextMonth = () => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1)
    );
  };

  const activeUsersForSelected = useMemo(
    () => getActiveUsersForDate(selectedDate),
    [selectedDate, normalizedUsers]
  );

  return (
    <div className="p-6 space-y-6">
      {/* Title / header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            Zugriffs-Kalender
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Hier sehen Sie, welche Benutzer in welchem Zeitraum Zugriff auf die
            Plattform haben.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
              <span>Aktualisieren...</span>
            </>
          ) : (
            <span>Aktualisieren</span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-4">
          {/* Calendar header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-medium text-gray-900 ml-2">
                {monthLabel}
              </h2>
            </div>
            <button
              onClick={() => {
                const now = new Date();
                setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
                setSelectedDate(toDateOnly(now));
              }}
              className="px-3 py-1.5 text-xs font-medium border border-gray-300 rounded-full hover:bg-gray-50"
            >
              Heute
            </button>
          </div>

          {/* Weekday header */}
          <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-1">
            {weekdayLabels.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-1 text-sm">
            {days.map((date) => {
              const isSel = isSameDay(date, selectedDate);
              const inCurrentMonth = isCurrentMonth(date);
              const count = getCountForDate(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(toDateOnly(date))}
                  className={[
                    "relative flex flex-col items-center justify-start h-16 rounded-lg border text-xs p-1 transition-all",
                    isSel
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50",
                    !inCurrentMonth && "text-gray-400 bg-gray-50/60"
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  <span className="self-start text-[11px] font-medium">
                    {date.getDate()}
                  </span>
                  {count > 0 && (
                    <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                      <Users className="w-3 h-3" />
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Side panel: selected day detail */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500">Ausgewähltes Datum</p>
              <p className="text-sm font-semibold text-gray-900">
                {selectedDate.toLocaleDateString("de-DE", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric"
                })}
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Users className="w-4 h-4" />
              <span>{activeUsersForSelected.length} aktiv</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeUsersForSelected.length === 0 ? (
              <p className="text-xs text-gray-500">
                Für dieses Datum ist kein aktiver Zugriff hinterlegt.
              </p>
            ) : (
              <ul className="space-y-2">
                {activeUsersForSelected.map((u) => (
                  <li
                    key={u.id}
                    className="border border-gray-200 rounded-lg px-3 py-2 text-xs flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        {u.name} {u.surname}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                        {Array.isArray(u.roles) && u.roles.length > 0
                          ? u.roles[0]
                          : u.role || "—"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-[11px] text-gray-500">
                      <span>{u.email}</span>
                      {u.country && u.city && (
                        <span>
                          • {u.country}, {u.city}
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      Gültig von{" "}
                      {u.validFrom
                        ? new Date(u.validFrom).toLocaleString("de-DE")
                        : "—"}{" "}
                      bis{" "}
                      {u.validUntil
                        ? new Date(u.validUntil).toLocaleString("de-DE")
                        : "—"}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <p className="mt-3 text-[11px] text-gray-400">
            Hinweis: Es werden nur Benutzer angezeigt, deren Gültigkeitszeitraum
            (<code>validFrom</code> bis <code>validUntil</code>) den
            ausgewählten Tag einschließt.
          </p>
        </div>
      </div>
    </div>
  );
}
