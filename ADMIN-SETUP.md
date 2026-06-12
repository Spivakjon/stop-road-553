# הקמת מערכת הניהול (Railway + Postgres)

מדריך שלב-אחר-שלב לחיבור האתר לשרת קטן ב-Railway, כדי שתוכלו לערוך את התוכן
דרך `admin.html` עם משתמשים וסיסמאות — והשינויים יופיעו מיד לכל המבקרים.

> ⏱ זמן הקמה: ~15 דקות. צריך חשבון Railway (כבר יש לכם).

---

## הארכיטקטורה (היבריד)

```
[ דפדפן ]
   │
   ├─ הצד הקדמי (index/faq/admin)  →  GitHub Pages   (סטטי, חינם)
   │                                      │  fetch()  ↓
   └─ הנתונים (התחברות/תוכן/נרשמים) →  שרת API ב-Railway  →  Postgres
```

* **הצד הקדמי** נשאר על GitHub Pages כמו שהיה.
* **השרת** (`server/`) הוא אפליקציית Node/Express קטנה שרצה ב-Railway מול Postgres.
* גם **בלי** השרת האתר עובד במלואו עם התוכן המובנה; ממשק הניהול מופעל ברגע
  שממלאים את כתובת השרת ב-`js/api-config.js`.

---

## חלק א׳ — פריסת השרת ל-Railway

### 1. יצירת פרויקט + Postgres
1. היכנסו ל-https://railway.app → **New Project**.
2. בתוך הפרויקט: **+ New → Database → Add PostgreSQL**. (זה יוצר משתנה `DATABASE_URL`.)

### 2. פריסת השרת
**אפשרות א׳ (מומלצת) — מ-GitHub:** העלו את תיקיית `server/` לריפו (אפשר ריפו נפרד,
או תת-תיקייה). ב-Railway: **+ New → GitHub Repo** → בחרו את הריפו. אם השרת בתת-תיקייה,
הגדירו ב-Settings → **Root Directory** = `server`.

**אפשרות ב׳ — מהמחשב (Railway CLI):**
```powershell
npm i -g @railway/cli
railway login
cd server
railway link        # בוחרים את הפרויקט
railway up
```

### 3. משתני סביבה
ב-Railway → השירות (לא ה-DB) → **Variables**, הוסיפו:

| משתנה | ערך |
|-------|-----|
| `DATABASE_URL` | **Reference** → בחרו את ה-Postgres → `DATABASE_URL` |
| `JWT_SECRET` | מחרוזת אקראית ארוכה (למשל פלט של `openssl rand -hex 32`) |
| `ADMIN_EMAIL` | האימייל של המנהל הראשון |
| `ADMIN_PASSWORD` | סיסמה חזקה למנהל הראשון |
| `ADMIN_NAME` | (אופציונלי) שם המנהל |
| `CORS_ORIGIN` | (אופציונלי) `https://spivakjon.github.io` |

> בעלייה הראשונה השרת יוצר את הטבלאות **ואת המנהל הראשון** אוטומטית מהמשתנים האלה.

### 4. כתובת ציבורית
ב-Railway → Settings → **Networking → Generate Domain**. תקבלו כתובת כמו
`https://stop-road-553-api.up.railway.app`. בדקו שהיא חיה: פתחו אותה בדפדפן —
אמור להופיע `{"ok":true,...}`.

---

## חלק ב׳ — חיבור הצד הקדמי

1. פתחו את **`js/api-config.js`** והדביקו את הכתובת מהשלב הקודם:
   ```js
   export const API_BASE = 'https://stop-road-553-api.up.railway.app';
   ```
2. שמרו, בצעו commit + push ל-`website/` (GitHub Pages יתעדכן).
3. גלשו ל-**`admin.html`** (למשל `https://spivakjon.github.io/admin.html`) והתחברו
   עם האימייל והסיסמה מ-`ADMIN_EMAIL`/`ADMIN_PASSWORD`.

---

## שימוש בממשק

* **תוכן ראשי / עמוד שו"ת** — עריכת כל הטקסטים. "שמירה ופרסום" מעדכן מיד את האתר.
* **נרשמים** — צפייה בכל מי שמילא את הטופס + ייצוא ל-CSV (אקסל) + מחיקה.
* **משתמשים** — הוספת מנהלים נוספים, הסרה, ו**שינוי הסיסמה שלי**.

---

## ⚠ חשוב — תצוגה מקומית

האתר משתמש ב-JavaScript Modules. דפדפנים חוסמים מודולים כשפותחים קובץ ישירות
(`file://`). לתצוגה מקומית הריצו שרת קטן בתוך `website/`:

```powershell
python -m http.server 8000
# ואז: http://localhost:8000
```

לבדיקת השרת מקומית (אופציונלי): בתוך `server/` צרו קובץ `.env` לפי `.env.example`,
ואז `npm install` ו-`npm start`.

---

## מבנה הקבצים

```
R531/
├── website/                    הצד הקדמי (GitHub Pages)
│   ├── index.html  faq.html  admin.html
│   └── js/
│       ├── api-config.js       ★ כתובת השרת (הקובץ היחיד שעורכים)
│       ├── api.js              שכבת הנתונים (fetch ל-API)
│       ├── content-defaults.js מקור האמת לתוכן המובנה
│       ├── render-index.js  render-faq.js
└── server/                     שרת ה-API (Railway)
    ├── package.json
    ├── .env.example
    └── src/  index.js  db.js  auth.js
```

## שאלות נפוצות

**שיניתי תוכן ולא רואים באתר?** ודאו שלחצתם "שמירה ופרסום" ורעננו (Ctrl+F5).

**ההתחברות נכשלת באתר החי.** בדקו ש-`API_BASE` נכון, שהשרת חי (פתיחת הכתובת
מציגה `{"ok":true}`), ושאין חסימת CORS (אם הגדרתם `CORS_ORIGIN` — שיכלול את דומיין
ה-Pages המדויק).

**שכחתי את סיסמת המנהל היחיד.** שנו ב-Railway את `ADMIN_PASSWORD`, מחקו את השורה
מטבלת `admins` (Railway → Postgres → Data), והפעילו מחדש את השרת — הוא ייצור מנהל
מחדש מהמשתנים. (עדיף תמיד להחזיק שני מנהלים.)

**עלות.** שרת קטן + Postgres נכנסים בנוחות בשימוש הרגיל של Railway לקמפיין בקנה
מידה כזה.
