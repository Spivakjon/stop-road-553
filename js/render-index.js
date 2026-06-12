// ============================================================================
//  render-index.js  —  מציג את העמוד הראשי מתוך התוכן (שרת/ברירת מחדל)
//  ומחבר את כל הלוגיקה של העמוד: בורר ערכות צבע, אקורדיון, טופס הצטרפות.
// ============================================================================

import { getContent, addSignup, API_ENABLED } from './api.js';

const $ = (sel, root = document) => root.querySelector(sel);

// בריחת תווים בטוחה לבנייה דרך innerHTML (כל שדות העמוד הראשי הם טקסט רגיל).
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ----------------------------- רינדור -----------------------------

function renderHero(c) {
  const h = c.hero;
  $('#heroContent').innerHTML = `
    <div class="hero-badge">${esc(h.badge)}</div>
    <h1>${esc(h.titleLine1)}<span>${esc(h.titleLine2)}</span></h1>
    <p class="subtitle">${esc(h.subtitle)}</p>
    <div class="hero-cta">
      <a href="#signup" class="btn btn-primary">${esc(h.ctaPrimary)}</a>
      <a href="#what" class="btn btn-outline">${esc(h.ctaSecondary)}</a>
    </div>`;
}

function renderStats(c) {
  $('#statsContainer').innerHTML = c.stats.map((s) => `
    <div class="stat-item">
      <h3>${esc(s.value)}</h3>
      <p>${esc(s.label)}</p>
    </div>`).join('');
}

function sectionTitle(title, subtitle) {
  return `
    <div class="section-title fade-in">
      <h2>${esc(title)}</h2>
      <div class="line"></div>
      ${subtitle ? `<p>${esc(subtitle)}</p>` : ''}
    </div>`;
}

function renderWhat(c) {
  const w = c.what;
  $('#whatContainer').innerHTML = sectionTitle(w.title, w.subtitle) + `
    <div class="what-grid">
      ${w.cards.map((card) => `
        <div class="what-card fade-in">
          <div class="icon">${esc(card.icon)}</div>
          <h3>${esc(card.title)}</h3>
          <p>${esc(card.text)}</p>
        </div>`).join('')}
    </div>`;
}

function renderImpact(c) {
  const im = c.impact;
  $('#impactContainer').innerHTML = sectionTitle(im.title, im.subtitle) + `
    <div class="impact-list">
      ${im.items.map((it, i) => `
        <div class="impact-item fade-in">
          <div class="num">${i + 1}</div>
          <div>
            <h4>${esc(it.title)}</h4>
            <p>${esc(it.text)}</p>
          </div>
        </div>`).join('')}
    </div>`;
}

function renderArguments(c) {
  const a = c.arguments;
  $('#argumentsContainer').innerHTML = sectionTitle(a.title, a.subtitle) + `
    <div class="arg-grid">
      ${a.cards.map((card) => `
        <div class="arg-card fade-in">
          <div class="tag">${esc(card.tag)}</div>
          <h3>${esc(card.title)}</h3>
          <p>${esc(card.text)}</p>
          ${card.source ? `<div class="source">${esc(card.source)}</div>` : ''}
        </div>`).join('')}
    </div>`;
}

function renderQuotes(c) {
  const q = c.quotes;
  $('#quotesContainer').innerHTML = sectionTitle(q.title, '') + `
    <div class="quotes-grid">
      ${q.items.map((it) => `
        <div class="quote-card fade-in">
          <p>${esc(it.text)}</p>
          <div class="author">${esc(it.author)}</div>
          <div class="role">${esc(it.role)}</div>
        </div>`).join('')}
    </div>`;
}

function renderTimeline(c) {
  const t = c.timeline;
  $('#timelineContainer').innerHTML = sectionTitle(t.title, t.subtitle) + `
    <div class="timeline">
      ${t.items.map((it) => `
        <div class="timeline-item fade-in">
          <div class="date">${esc(it.date)}</div>
          <h4>${esc(it.title)}</h4>
          <p>${esc(it.text)}</p>
        </div>`).join('')}
    </div>`;
}

function renderFaqHome(c) {
  const f = c.faqHome;
  $('#faqContainer').innerHTML = sectionTitle(f.title, '') + `
    <div class="faq-list">
      ${f.items.map((it) => `
        <div class="faq-item">
          <div class="faq-question">${esc(it.q)}</div>
          <div class="faq-answer">${esc(it.a)}</div>
        </div>`).join('')}
    </div>
    <div style="text-align:center; margin-top:2.5rem;">
      <a href="faq.html" class="btn btn-primary">❓ לעמוד השאלות והתשובות המלא</a>
    </div>`;

  // אקורדיון
  document.querySelectorAll('#faqContainer .faq-item').forEach((item) => {
    item.querySelector('.faq-question').addEventListener('click', () => item.classList.toggle('active'));
  });
}

function renderFooter(c) {
  const f = c.footer;
  $('#siteFooter').innerHTML = `
    <p><strong>${esc(f.line1.split('|')[0].trim())}</strong>${f.line1.includes('|') ? ' | ' + esc(f.line1.split('|').slice(1).join('|').trim()) : ''}</p>
    <p style="margin-top: 0.5rem;">${esc(f.line2)}</p>
    <div class="footer-links">
      <a href="#home">ראשי</a>
      <a href="#what">מה קורה?</a>
      <a href="#arguments">מה אומרים המומחים</a>
      <a href="faq.html">שאלות ותשובות</a>
      <a href="#signup">הצטרפות</a>
    </div>
    <div style="margin-top:1rem;">
      <a href="admin.html" style="opacity:.5;font-size:.78rem;text-decoration:none;color:var(--band-ink-soft);">🔒 ניהול</a>
    </div>`;
}

function renderAll(c) {
  renderHero(c);
  renderStats(c);
  renderWhat(c);
  renderImpact(c);
  renderArguments(c);
  renderQuotes(c);
  renderTimeline(c);
  renderFaqHome(c);
  renderFooter(c);
}

// ----------------------------- אינטראקציות -----------------------------

function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
  }, { threshold: 0.1 });
  document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
}

function initSmoothScroll() {
  // האזנה מואצלת — עובד גם על עוגנים שנוצרו דינמית
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
}

function initThemeSwitch() {
  const KEY = 'faq553_theme';
  const btns = document.querySelectorAll('.theme-switch button');
  function setTheme(t) {
    document.body.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    btns.forEach((b) => b.classList.toggle('active', b.dataset.set === t));
  }
  btns.forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.set)));
  let saved = 'brand';
  try { saved = localStorage.getItem(KEY) || 'brand'; } catch (e) {}
  setTheme(saved);
}

function initForm() {
  const form = $('#contactForm');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('.submit-btn');
    const formData = new FormData(form);
    const data = {};
    formData.forEach((v, k) => { data[k] = v; });
    data.help = [];
    form.querySelectorAll('input[type="checkbox"]:checked').forEach((cb) => data.help.push(cb.id));

    if (btn) { btn.disabled = true; btn.textContent = 'שולח…'; }
    try {
      if (API_ENABLED) {
        await addSignup(data);
      } else {
        // מצב ללא שרת — שמירה מקומית כגיבוי
        const subs = JSON.parse(localStorage.getItem('r553_signups') || '[]');
        subs.push({ ...data, timestamp: new Date().toISOString() });
        localStorage.setItem('r553_signups', JSON.stringify(subs));
      }
      form.style.display = 'none';
      $('#successMessage').style.display = 'block';
    } catch (err) {
      console.error('שמירת הרשמה נכשלה:', err);
      alert('אופס, משהו השתבש בשליחה. נסו שוב בעוד רגע.');
      if (btn) { btn.disabled = false; btn.textContent = '💪 אני רוצה להצטרף'; }
    }
  });
}

// ----------------------------- אתחול -----------------------------

(async function init() {
  initThemeSwitch();
  initSmoothScroll();
  let content;
  try { content = await getContent(); } catch (e) { content = (await import('./content-defaults.js')).DEFAULT_CONTENT; }
  renderAll(content);
  initForm();
  initScrollAnimations();
})();
