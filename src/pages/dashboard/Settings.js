import { useEffect, useMemo, useState } from "react";
import { getUser, setUser } from "../../utils/tokenManager";
import dashboardService from "../../services/dashboardService";

const COOLDOWN_MINUTES = 30;

function msToHuman(ms) {
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min <= 0) return `${sec}s`;
  return `${min} Min ${sec}s`;
}

export default function Settings() {
  const localUser = getUser() || {};
  const userId = localUser?.id;

  const [profile, setProfile] = useState({
    name: localUser.name || "",
    surname: localUser.surname || "",
    email: localUser.email || "",
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  // German messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cooldown state
  const storageKey = useMemo(() => {
    // har bir user uchun alohida cooldown bo‘lsin
    const emailKey = (profile.email || "unknown").toLowerCase();
    return `forgotPwdCooldownUntil:${emailKey}`;
  }, [profile.email]);

  const [cooldownUntil, setCooldownUntil] = useState(null);
  const [now, setNow] = useState(Date.now());

  // cooldown’ni localStorage’dan o‘qish
  useEffect(() => {
    const raw = localStorage.getItem(storageKey);
    const ts = raw ? Number(raw) : null;
    if (ts && !Number.isNaN(ts)) setCooldownUntil(ts);
    else setCooldownUntil(null);
  }, [storageKey]);

  // countdown timer (UI uchun)
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const remainingMs = useMemo(() => {
    if (!cooldownUntil) return 0;
    return Math.max(0, cooldownUntil - now);
  }, [cooldownUntil, now]);

  const isCooldownActive = remainingMs > 0;

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleProfileChange = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
    clearMessages();
  };

  // ✅ Profil speichern (nur Name/Nachname)
  const handleSaveProfile = async () => {
    clearMessages();

    if (!userId) {
      setError("Benutzer nicht gefunden. Bitte erneut anmelden.");
      return;
    }

    const payload = {
      name: (profile.name || "").trim(),
      surname: (profile.surname || "").trim(),
    };

    if (!payload.name || !payload.surname) {
      setError("Bitte Vorname und Nachname vollständig ausfüllen.");
      return;
    }

    try {
      setSavingProfile(true);

      const res = await dashboardService.updateAdmin(payload);
      // ApiResponse format: { success, message, data }
      const updatedUser = res?.data ?? null;

      if (updatedUser && typeof setUser === "function") {
        setUser(updatedUser);
      } else if (typeof setUser === "function") {
        setUser({ ...localUser, ...payload });
      }

      setSuccess("Profil wurde erfolgreich gespeichert.");
    } catch (e) {
      console.error("Profile save error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Fehler beim Speichern des Profils.";
      setError(msg);
    } finally {
      setSavingProfile(false);
    }
  };

  // ✅ Forgot Password (confirm + POST + 30 min cooldown)
  const handleForgotPassword = async () => {
    clearMessages();

    const email = (profile.email || "").trim();
    if (!email) {
      setError("E-Mail ist nicht verfügbar. Bitte wenden Sie sich an den Administrator.");
      return;
    }

    if (isCooldownActive) {
      setError(
        `Sie können die E-Mail erst erneut anfordern in: ${msToHuman(remainingMs)}.`
      );
      return;
    }

    const ok = window.confirm(
      `Wir senden einen Link zum Zurücksetzen des Passworts an:\n\n${email}\n\nMöchten Sie fortfahren?`
    );
    if (!ok) return;

    try {
      setSendingReset(true);

      // service already adds header Accept-Language: uz
      const res = await dashboardService.forgotPassword({ email });

      // Backend sizda: { success: true, message: msg }
      const msgFromApi = res?.message;

      // Cooldown set (30 min)
      const until = Date.now() + COOLDOWN_MINUTES * 60 * 1000;
      localStorage.setItem(storageKey, String(until));
      setCooldownUntil(until);

      setSuccess(
        msgFromApi ||
          "Wenn die E-Mail-Adresse im System existiert, wurde ein Reset-Link gesendet. Bitte prüfen Sie Ihr Postfach (auch Spam)."
      );
    } catch (e) {
      console.error("Forgot password error:", e);
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Fehler beim Senden des Reset-Links.";
      setError(msg);
    } finally {
      setSendingReset(false);
    }
  };

  if (!userId) {
    return (
      <div className="p-6 max-w-2xl">
        <h1 className="text-2xl font-bold mb-4">Einstellungen</h1>
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
          Benutzer nicht gefunden. Bitte erneut anmelden.
        </p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Einstellungen</h1>

      <div className="bg-white shadow rounded-lg p-6 space-y-8">
        {(error || success) && (
          <div className="space-y-2">
            {error && (
              <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                {success}
              </p>
            )}
          </div>
        )}

        {/* Persönliche Daten */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">Persönliche Daten</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Vorname
            </label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => handleProfileChange("name", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nachname
            </label>
            <input
              type="text"
              value={profile.surname}
              onChange={(e) => handleProfileChange("surname", e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Email LOCK */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              E-Mail (nicht änderbar)
            </label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Wenn Sie die E-Mail ändern müssen, kontaktieren Sie bitte den Administrator.
            </p>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="mt-2 px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 text-sm"
          >
            {savingProfile ? "Wird gespeichert..." : "Profil speichern"}
          </button>
        </section>

        <hr className="border-gray-200" />

        {/* Passwort zurücksetzen */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Passwort</h2>
          <p className="text-sm text-gray-600">
            Das Passwort kann hier nicht direkt geändert werden. Sie erhalten einen Link zum Zurücksetzen per E-Mail.
          </p>

          <button
            onClick={handleForgotPassword}
            disabled={sendingReset || isCooldownActive}
            className="mt-1 px-5 py-2 bg-gray-900 text-white rounded-md hover:bg-black disabled:opacity-50 text-sm"
          >
            {sendingReset
              ? "Wird gesendet..."
              : isCooldownActive
              ? `Bitte warten: ${msToHuman(remainingMs)}`
              : "Reset-Link per E-Mail senden"}
          </button>

          {isCooldownActive && (
            <p className="text-xs text-gray-500">
              Aus Sicherheitsgründen kann der Link nur alle {COOLDOWN_MINUTES} Minuten angefordert werden.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
