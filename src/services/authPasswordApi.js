// src/api/authPasswordApi.js
import API_BASE_URL from "../config";

// Forgot password: email qabul qiladi, success har doim bir xil ko‘rinishda (enumeration oldini olish uchun)
export async function forgotPassword(email) {
  const res = await fetch(`${API_BASE_URL}/auth/password/forgot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const text = await res.text().catch(() => "");
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!res.ok) {
    const err = new Error(json?.message || `Forgot failed: ${res.status}`);
    err.status = res.status;

    // 429 bo‘lsa retry-after seconds ni olib qo‘yamiz
    const ra = res.headers.get("retry-after");
    const retryAfterSeconds = json?.retryAfterSeconds ?? (ra ? Number(ra) : null);
    if (retryAfterSeconds != null && !Number.isNaN(retryAfterSeconds)) {
      err.retryAfterSeconds = retryAfterSeconds;
    }
    throw err;
  }

  return json || { success: true };
}

export async function resetPassword(token, password,confirmPassword) {
  const res = await fetch(`${API_BASE_URL}/auth/password/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, password, confirmPassword }),
  });

  const text = await res.text().catch(() => "");
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { /* ignore */ }

  if (!res.ok) {
    const err = new Error(json?.message || `Reset failed: ${res.status}`);
    err.status = res.status;

    const ra = res.headers.get("retry-after");
    const retryAfterSeconds = json?.retryAfterSeconds ?? (ra ? Number(ra) : null);
    if (retryAfterSeconds != null && !Number.isNaN(retryAfterSeconds)) {
      err.retryAfterSeconds = retryAfterSeconds;
    }
    throw err;
  }

  return json || { success: true };
}
