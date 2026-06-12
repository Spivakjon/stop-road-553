// ============================================================================
//  render-faq.js  —  מציג את עמוד השאלות והתשובות (faq.html) מתוך התוכן
//  התשובות, ה-highlight, ה-heartstrip וה-CTA תומכים ב-HTML (תוכן מהמערכת).
// ============================================================================

import { getContent } from './api.js';

const $ = (s, r = document) => r.querySelector(s);
function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderHero(p) {
  const h = p.hero;
  $('#faqHero').innerHTML = `
    <span class="eyebrow">${esc(h.eyebrow)}</span>
    <h1>${esc(h.titleLine1)}<br><span class="y">${esc(h.titleLine2)}</span></h1>
    <p class="sub">${esc(h.sub)}</p>
    <p class="tagline">${esc(h.tagline)}</p>`;
}

function renderHighlight(p) {
  const hl = p.highlight;
  $('#faqHighlight').innerHTML = `
    <div class="ic">${esc(hl.icon)}</div>
    <div>
      <h2>${esc(hl.title)}</h2>
      <p>${hl.html}</p>
    </div>`;
}

function renderChips(p) {
  $('#faqChips').innerHTML = p.categories
    .map((cat) => `<a href="#${esc(cat.id)}">${esc(cat.title)}</a>`).join('\n');
}

function renderCategories(p) {
  $('#faqCats').innerHTML = p.categories.map((cat) => `
    <section class="cat" id="${esc(cat.id)}">
      <div class="cat-head"><span class="badge">${esc(cat.icon)}</span><h2>${esc(cat.title)}</h2></div>
      ${cat.items.map((it) => `
        <div class="qa">
          <button class="q" type="button">${esc(it.q)}<span class="plus">+</span></button>
          <div class="a"><div class="a-inner">${it.a}</div></div>
        </div>`).join('')}
    </section>`).join('');
}

function renderHeart(p) {
  const hs = p.heartstrip;
  $('#faqHeart').innerHTML = `
    <p class="big">${hs.html}</p>
    <p class="tagline" style="margin-top:.5rem;">${esc(hs.tagline)}</p>`;
}

function renderCta(p) {
  const cta = p.cta;
  $('#faqCta').innerHTML = `
    <h2>${cta.title}</h2>
    <p>${esc(cta.text)}</p>
    <div class="cta-btns">
      <a href="index.html#signup" class="btn btn-dark">✍ הצטרפו למאבק</a>
      <a href="index.html" class="btn btn-out">← לאתר הקמפיין</a>
    </div>`;
}

function initAccordion() {
  document.querySelectorAll('.qa .q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.qa');
      const ans = item.querySelector('.a');
      const isOpen = item.classList.toggle('open');
      ans.style.maxHeight = isOpen ? (ans.scrollHeight + 40) + 'px' : '0';
    });
  });
}

function openFromHash() {
  const id = location.hash.replace('#', '');
  if (!id) return;
  const sec = document.getElementById(id);
  if (sec && sec.classList.contains('cat')) {
    const first = sec.querySelector('.qa');
    if (first && !first.classList.contains('open')) first.querySelector('.q').click();
    sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function initThemeSwitch() {
  const KEY = 'faq553_theme';
  const btns = document.querySelectorAll('.theme-switch button');
  function setTheme(t) {
    document.body.setAttribute('data-theme', t);
    try { localStorage.setItem(KEY, t); } catch (e) {}
    btns.forEach((b) => b.classList.toggle('active', b.dataset.set === t));
    document.querySelectorAll('.qa.open .a').forEach((a) => { a.style.maxHeight = (a.scrollHeight + 40) + 'px'; });
  }
  btns.forEach((b) => b.addEventListener('click', () => setTheme(b.dataset.set)));
  let saved = 'brand';
  try { saved = localStorage.getItem(KEY) || 'brand'; } catch (e) {}
  setTheme(saved);
}

(async function init() {
  initThemeSwitch();
  let content;
  try { content = await getContent(); } catch (e) { content = (await import('./content-defaults.js')).DEFAULT_CONTENT; }
  const p = content.faqPage;
  renderHero(p);
  renderHighlight(p);
  renderChips(p);
  renderCategories(p);
  renderHeart(p);
  renderCta(p);
  initAccordion();
  window.addEventListener('hashchange', openFromHash);
  openFromHash();
})();
