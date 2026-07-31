import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../../services/authPasswordApi";
import { useCooldown, formatMmSs } from "../../hooks/useCooldown";

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");
  const [error, setError] = useState("");

  const { secondsLeft, start } = useCooldown(0);

  const canSubmit = useMemo(() => {
    return !busy && secondsLeft === 0 && isValidEmail(email);
  }, [busy, secondsLeft, email]);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");

    const em = email.trim().toLowerCase();
    if (!isValidEmail(em)) {
      setError("Bitte geben Sie eine gültige E-Mail-Adresse ein.");
      return;
    }

    setBusy(true);
    try {
      await forgotPassword(em);
      setInfo("Falls diese E-Mail-Adresse registriert ist, haben wir Ihnen Anweisungen gesendet.");
    } catch (err) {
      if (err?.status === 429) {
        const sec = err.retryAfterSeconds ?? 60;
        start(sec);
        setError(`Zu viele Versuche. Bitte warten Sie ${formatMmSs(sec)}.`);
      } else {
        setError(err?.message || "Ein Fehler ist aufgetreten.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-sans">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-3xl bg-indigo-50 text-3xl">
            🔑
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Passwort vergessen?</h1>
          <p className="mt-3 text-slate-500 text-sm leading-relaxed">
            Kein Problem! Geben Sie Ihre E-Mail ein und wir senden Ihnen einen Link zum Zurücksetzen.
          </p>
        </div>

        {info && (
          <div className="mt-8 rounded-2xl bg-emerald-50 p-4 text-sm font-medium text-emerald-700 border border-emerald-100 animate-in fade-in duration-300">
            {info}
          </div>
        )}

        {error && (
          <div className="mt-8 rounded-2xl bg-rose-50 p-4 text-sm font-medium text-rose-700 border border-rose-100 animate-in shake-in duration-300">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-8 space-y-6">
          <div>
            <label className="block text-[11px] font-black uppercase tracking-[0.1em] text-slate-400 ml-1 mb-2">E-Mail Adresse</label>
            <input
              type="email"
              className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 placeholder:text-slate-400"
              placeholder="name@beispiel.de"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={busy}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={`w-full rounded-2xl py-4 font-black transition-all active:scale-[0.98] shadow-lg
              ${canSubmit 
                ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700" 
                : "bg-slate-100 text-slate-400 cursor-not-allowed"}`}
          >
            {busy ? "Senden..." : secondsLeft > 0 ? `Warten (${formatMmSs(secondsLeft)})` : "Link anfordern"}
          </button>
        </form>

        <div className="mt-10 text-center">
          <Link className="text-sm font-bold text-slate-400 hover:text-indigo-600 transition-colors" to="/">
            ← Zurück zum Login
          </Link>
        </div>
      </div>
    </div>
  );
}