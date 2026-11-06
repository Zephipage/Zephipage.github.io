(() => {
  'use strict';
  const papers = window.PUBLICATIONS || [];
  let language = 'en';
  let papersExpanded = false;
  const initialPaperCount = 4;
  let toastTimer;
  const $ = (selector) => document.querySelector(selector);
  const text = (en, zh) => language === 'zh' ? zh : en;
  const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeLink = (href) => /^https:\/\//.test(href) ? escape(href) : '#';
  const external = (href, label) => `<a href="${safeLink(href)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
  const displayVenue = (p) => p.venue === 'Preprint' ? `${text('Preprint', '预印本')} · ${p.year}` : escape(p.venue);
  const citation = (p) => `${p.authors} (${p.year}). ${p.title}. ${p.venue}. ${p.paper}`;
  const projectNames = {physomni: 'PhysOmni', tourphysics: 'TourPhysics', uniworld: 'UniWorld'};
  function renderSelected() {
    $('#selected-work').innerHTML = papers.filter(p => p.selected).map((p, i) => `<article class="work-card">
      <a class="work-image" href="${safeLink(p.project || p.paper)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(projectNames[p.id])}: ${text('View project', '查看研究')}"><img src="assets/${p.id}.jpg" alt="${escape(projectNames[p.id])} ${text('research overview', '研究概览')}" loading="lazy" width="680" height="380"><span class="image-arrow" aria-hidden="true">↗</span></a>
      <div class="work-meta"><span>${displayVenue(p)}</span><span>0${i + 1}</span></div>
      <h3>${external(p.project || p.paper, projectNames[p.id])}</h3>
      <p>${escape(language === 'zh' ? p.summaryZh : p.summaryEn)}</p>
      <div class="work-links">${external(p.paper, text('Paper ↗', '论文 ↗'))}${p.project ? external(p.project, text('Project ↗', '项目主页 ↗')) : ''}</div></article>`).join('');
    $('#selected-work').querySelectorAll('img').forEach(img => img.addEventListener('error', () => {
      const fallback = document.createElement('span'); fallback.className = 'visual-fallback'; fallback.textContent = img.alt.replace(/ research overview| 研究概览/, ''); img.replaceWith(fallback);
    }, {once:true}));
  }
  function renderPublications() {
    let lastYear = null;
    const visiblePapers = papersExpanded ? papers : papers.slice(0, initialPaperCount);
    $('#publication-list').innerHTML = visiblePapers.map(p => {
      const year = p.year !== lastYear ? p.year : ''; lastYear = p.year;
      const authors = escape(p.authors).replace(/Zhang, X\.|Xin Zhang/g, '<strong>$&</strong>');
      return `<article class="publication" id="paper-${p.id}"><div class="publication-year">${year}</div><div>
        <h3>${p.selected ? '<span class="selected-mark" aria-label="Selected work"></span>' : ''}${external(p.paper, escape(p.title))}</h3>
        <p class="authors">${authors}</p><div class="publication-bottom"><span class="venue">${displayVenue(p)}</span>${external(p.paper, text(p.paper.includes('scholar.google') ? 'Scholar ↗' : 'Paper ↗', p.paper.includes('scholar.google') ? '学术条目 ↗' : '论文 ↗'))}${p.project ? external(p.project, text('Project ↗', '项目主页 ↗')) : ''}<button class="cite-button" type="button" data-cite="${p.id}" aria-expanded="false" aria-controls="citation-${p.id}">${text('Cite +', '引用 +')}</button></div>
        <div class="citation-panel" id="citation-${p.id}" hidden><p>${escape(citation(p))}</p><button type="button" class="copy-citation" data-copy="${p.id}">${text('Copy citation', '复制引用')}</button></div>
      </div></article>`;
    }).join('');
    const toggle = $('#papers-toggle');
    toggle.hidden = papers.length <= initialPaperCount;
    toggle.setAttribute('aria-expanded', String(papersExpanded));
    toggle.textContent = papersExpanded
      ? text('Show less ↑', '收起 ↑')
      : text('Show more ↓', '展开更多 ↓');
  }
  function updateControls() {
    const dark = document.documentElement.dataset.theme === 'dark';
    $('#theme-toggle').setAttribute('aria-label', dark ? text('Switch to light theme','切换浅色主题') : text('Switch to dark theme','切换深色主题'));
    $('#language-toggle').textContent = text('中文','EN');
    $('#language-toggle').setAttribute('aria-label', text('切换为中文','Switch to English'));
    const open = $('#menu-toggle').getAttribute('aria-expanded') === 'true';
    $('#menu-toggle').setAttribute('aria-label', open ? text('Close navigation','收起导航') : text('Open navigation','展开导航'));
    const original = $('#portrait-reveal').getAttribute('aria-pressed') === 'true';
    $('#portrait-reveal').setAttribute('aria-label', original ? text('Show illustrated portrait','显示手绘肖像') : text('Show original portrait','显示原始照片'));
  }
  function setLanguage(value) {
    language = value;
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('[data-en][data-zh]').forEach(el => el.innerHTML = el.dataset[language]);
    updateControls(); renderSelected(); renderPublications();
    try { localStorage.setItem('xin-language', language); } catch (_) {}
  }
  function toast(message) {
    $('#toast').textContent = message; $('#toast').classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600);
  }
  $('#language-toggle').addEventListener('click', () => setLanguage(language === 'en' ? 'zh' : 'en'));
  $('#theme-toggle').addEventListener('click', () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = theme;
    document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#101715' : '#f7f7f2';
    try { localStorage.setItem('xin-theme', theme); } catch (_) {}
    updateControls();
  });
  const closeMenu = () => { $('#navigation').classList.remove('is-open'); $('#menu-toggle').setAttribute('aria-expanded','false'); updateControls(); };
  $('#menu-toggle').addEventListener('click', () => { const open = $('#navigation').classList.toggle('is-open'); $('#menu-toggle').setAttribute('aria-expanded',String(open)); updateControls(); });
  document.addEventListener('keydown', e => { if(e.key === 'Escape') closeMenu(); });
  document.querySelectorAll('nav a').forEach(a => a.addEventListener('click', closeMenu));
  $('#papers-toggle').addEventListener('click', () => {
    papersExpanded = !papersExpanded;
    renderPublications();
    if (!papersExpanded) $('#publications').scrollIntoView({behavior: 'instant', block: 'start'});
  });
  // The two portraits share one frame; only the original under the lens is revealed.
  const portrait = $('#portrait-reveal');
  const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  let pointerInside = false;
  let fullPortrait = false;
  let revealFrame = 0;
  let lens = {x: 0, y: 0, radius: 0};
  let targetLens = {x: 0, y: 0, radius: 0};
  function paintLens() {
    portrait.style.setProperty('--reveal-x', `${lens.x}px`);
    portrait.style.setProperty('--reveal-y', `${lens.y}px`);
    portrait.style.setProperty('--reveal-radius', `${lens.radius}px`);
  }
  function animateLens() {
    revealFrame = 0;
    let moving = false;
    for (const key of ['x', 'y', 'radius']) {
      const delta = targetLens[key] - lens[key];
      if (motionPreference.matches || Math.abs(delta) < .2) lens[key] = targetLens[key];
      else { lens[key] += delta * .28; moving = true; }
    }
    paintLens();
    if (moving) revealFrame = requestAnimationFrame(animateLens);
  }
  function queueLens() { if (!revealFrame) revealFrame = requestAnimationFrame(animateLens); }
  function moveLens(event) {
    if (event.pointerType === 'touch' || fullPortrait) return;
    const rect = portrait.getBoundingClientRect();
    targetLens = {
      x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
      radius: Math.min(112, rect.width * .3)
    };
    if (!pointerInside) { lens.x = targetLens.x; lens.y = targetLens.y; }
    pointerInside = true;
    portrait.classList.add('is-revealing');
    queueLens();
  }
  function hideLens() {
    pointerInside = false;
    targetLens.radius = 0;
    portrait.classList.remove('is-revealing');
    queueLens();
  }
  portrait.addEventListener('pointerenter', moveLens);
  portrait.addEventListener('pointermove', moveLens);
  portrait.addEventListener('pointerleave', hideLens);
  portrait.addEventListener('pointercancel', hideLens);
  portrait.addEventListener('click', () => {
    fullPortrait = !fullPortrait;
    portrait.classList.toggle('show-original', fullPortrait);
    portrait.setAttribute('aria-pressed', String(fullPortrait));
    hideLens();
    updateControls();
  });
  portrait.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      fullPortrait = false;
      portrait.classList.remove('show-original');
      portrait.setAttribute('aria-pressed', 'false');
      hideLens();
      updateControls();
    }
  });
  window.addEventListener('blur', hideLens);
  window.addEventListener('resize', hideLens);
  $('#publication-list').addEventListener('click', async e => {
    const citeButton = e.target.closest('[data-cite]');
    if(citeButton) {
      const panel = document.getElementById(`citation-${citeButton.dataset.cite}`);
      panel.hidden = !panel.hidden; citeButton.setAttribute('aria-expanded',String(!panel.hidden));
      citeButton.textContent = panel.hidden ? text('Cite +','引用 +') : text('Cite −','引用 −');
    }
    const copyButton = e.target.closest('[data-copy]');
    if(copyButton) {
      const paper = papers.find(p => p.id === copyButton.dataset.copy);
      try { await navigator.clipboard.writeText(citation(paper)); toast(text('Citation copied','引用已复制')); }
      catch (_) { const range = document.createRange(); range.selectNodeContents(copyButton.previousElementSibling); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); toast(text('Citation selected — press Ctrl/Cmd+C to copy','已选中引用，请按 Ctrl/Cmd+C 复制')); }
    }
  });
  if('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      for(const entry of entries) if(entry.isIntersecting) document.querySelectorAll('nav a').forEach(a => { const active = a.hash === `#${entry.target.id}`; a.classList.toggle('active',active); if(active) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current'); });
    }, {rootMargin:'-12% 0px -62% 0px'});
    document.querySelectorAll('#about,#research,#publications,#experience').forEach(section => observer.observe(section));
  }
  try { const saved = localStorage.getItem('xin-language'); if(saved === 'zh') language = saved; } catch (_) {}
  setLanguage(language);
})();
