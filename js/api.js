// ============================================================================
//  api.js  —  שכבת הנתונים: דיבור עם שרת ה-API (Railway)
// ----------------------------------------------------------------------------
//  עוטף את ה-REST API ומספק אותו API פנימי כמו קודם (getContent, login, וכו').
//  אימות מבוסס JWT שנשמר ב-localStorage. אם השרת לא מוגדר (api-config.js) —
//  התנהגות "רכה": getContent מחזיר ברירת מחדל, פעולות כתיבה זורקות שגיאה.
// ============================================================================

import { API_BASE, API_ENABLED } from './api-config.js';
import { DEFAULT_CONTENT } from './content-defaults.js';

export { API_ENABLED, DEFAULT_CONTENT };

const TOKEN_KEY = 'r553_token';
const clone = (o) => structuredClone(o);

// ---- מצב אימות (מחקה onAuthStateChanged) ----
let _session = null;            // { token, user }
let _initPromise = null;
const _listeners = new Set();
const notify = () => _listeners.forEach((cb) => cb(_session ? _session.user : null));

// ---- עזרי fetch ----
async function request(method, path, { body, auth } = {}) {
  if (!API_ENABLED) throw new Error('השרת לא מוגדר (ראו api-config.js).');
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (auth) {
    const t = _session?.token || localStorage.getItem(TOKEN_KEY);
    if (t) headers['Authorization'] = 'Bearer ' + t;
  }
  let res;
  try {
    res = await fetch(API_BASE.replace(/\/$/, '') + path, {
      method, headers, body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new Error('אין חיבור לשרת. בדקו את הכתובת/חיבור הרשת.');
  }
  let data = null;
  try { data = await res.json(); } catch { /* no body */ }
  if (!res.ok) {
    if (res.status === 401 && auth) { _clearSession(); }
    throw new Error((data && data.error) || ('שגיאת שרת (' + res.status + ')'));
  }
  return data;
}
const apiGet = (p, auth) => request('GET', p, { auth });
const apiPost = (p, body, auth) => request('POST', p, { body, auth });
const apiPut = (p, body, auth) => request('PUT', p, { body, auth });
const apiDelete = (p, auth) => request('DELETE', p, { auth });

function _clearSession() {
  _session = null;
  try { localStorage.removeItem(TOKEN_KEY); } catch {}
}

// אתחול עצל: אם יש טוקן שמור — מאמת אותו מול /api/me.
function ensureInit() {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    if (!API_ENABLED) return;
    const t = (() => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } })();
    if (!t) return;
    try {
      _session = { token: t };
      const me = await apiGet('/api/me', true);
      _session = { token: t, user: me.user };
    } catch {
      _clearSession();
    }
  })();
  return _initPromise;
}

// =========================== תוכן ===========================
function mergeContent(stored) {
  if (!stored || typeof stored !== 'object') return clone(DEFAULT_CONTENT);
  return { ...clone(DEFAULT_CONTENT), ...stored };
}

export async function getContent() {
  if (!API_ENABLED) return clone(DEFAULT_CONTENT);
  try {
    const r = await apiGet('/api/content');
    return mergeContent(r.content);
  } catch (e) {
    console.warn('getContent נכשל, מציג ברירת מחדל:', e);
    return clone(DEFAULT_CONTENT);
  }
}

export async function saveContent(content, _editorEmail) {
  await apiPut('/api/content', { content }, true);
}

// =========================== התחברות ===========================
export async function onAuth(cb) {
  _listeners.add(cb);
  await ensureInit();
  cb(_session ? _session.user : null);
  return () => _listeners.delete(cb);
}

export async function login(email, password) {
  const r = await apiPost('/api/login', { email, password });
  _session = { token: r.token, user: r.user };
  try { localStorage.setItem(TOKEN_KEY, r.token); } catch {}
  notify();
  return r.user;
}

export async function logout() {
  _clearSession();
  notify();
}

// אין "שכחתי סיסמה" במייל; מחוברים יכולים לשנות סיסמה בעצמם (changeMyPassword),
// או שמנהל אחר ימחק ויוסיף מחדש עם סיסמה חדשה.
export async function sendReset(_email) {
  throw new Error('איפוס במייל לא זמין. התחברו ושנו סיסמה דרך "שינוי הסיסמה שלי", או בקשו ממנהל אחר.');
}

export async function changeMyPassword(currentPassword, newPassword) {
  await apiPost('/api/me/password', { currentPassword, newPassword }, true);
}

// בכל משתמש מחובר הוא מנהל (השרת מנפיק טוקן רק למנהלים).
export async function isAdmin(_uid) {
  return !!(_session && _session.user && _session.user.admin);
}

// =========================== נרשמים ===========================
export async function addSignup(data) {
  await apiPost('/api/signups', data);
}
export async function listSignups() {
  return apiGet('/api/signups', true);
}
export async function deleteSignup(id) {
  await apiDelete('/api/signups/' + encodeURIComponent(id), true);
}

// =========================== ניהול משתמשים ===========================
export async function listAdmins() {
  return apiGet('/api/users', true);
}
export async function createAdminUser(email, password, name) {
  const r = await apiPost('/api/users', { email, password, name }, true);
  return r.uid;
}
export async function removeAdmin(uid) {
  await apiDelete('/api/users/' + encodeURIComponent(uid), true);
}
