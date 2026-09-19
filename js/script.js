/* ==========================================================================
   THE SUPERKOOLS  |  js/script.js
   DONT EDIT PT 2, WEBSITE FUNCTIONALITY
   ========================================================================== */
'use strict';


/* ==========================================================================
   PART 1A: GIGS
   --------------------------------------------------------------------------
   Fields:
     date     REQUIRED. Format YYYY-MM-DD, for example "2026-10-10"
     venue    REQUIRED. Name of the venue
     city     City and state, for example "Warsaw, IN"
     time     Any text, for example "8:00 PM"
     details  Optional short description
     link     Optional. A full URL (tickets, event page, Facebook event)
     linkLabel Optional. Text for the link. Defaults to "Event details"
   ========================================================================== */
const gigs = [
  {
    date: "2026-08-22",
    venue: "Example Venue (past show)",
    city: "Warsaw, IN",
    time: "7:30 PM",
    details: "Example of a show that has already happened."
  },
  {
    date: "2026-10-10",
    venue: "Example Venue",
    city: "Warsaw, IN",
    time: "8:00 PM",
    details: "Live performance"
  },
  {
    date: "2026-10-24",
    venue: "Another Example Venue",
    city: "Fort Wayne, IN",
    time: "9:00 PM",
    details: "Replace these examples with your real shows.",
    link: "https://example.com",
    linkLabel: "Event page"
  },
  {
    date: "2026-11-07",
    venue: "Third Example Venue",
    city: "South Bend, IN",
    time: "8:30 PM"
  }
];


/* ==========================================================================
   PART 1B: PHOTO GALLERY
   --------------------------------------------------------------------------
   1. Pics live in assets/gallery/

   Fields:
     src    REQUIRED. Path to the full-size image. This is also the file
            people get when they press Download.
     title  Caption shown on hover and in the viewer
     date   Shown under the caption, for example "2026" or "June 2026"
   ========================================================================== */
const galleryImages = [
  { src: "assets/gallery/oldstyle-logansport.JPG", title: "Live at the Old Style 6th Street Lounge in Logansport, IN." },
  { src: "assets/gallery/oldstyle-logansport2.JPG", title: "Live at the Old Style 6th Street Lounge in Logansport, IN." },
  { src: "assets/gallery/oldstyle-logansport3.JPG", title: "Live at the Old Style 6th Street Lounge in Logansport, IN." },
  { src: "assets/gallery/thefrog-syracuseindiana-2026.jpg", title: "Live at The Frog Tavern in Syracuse, IN.", date: "2026" },
  { src: "assets/gallery/unknown.JPG" },
  { src: "assets/gallery/warsaw.JPG", title: "Practice in Warsaw." }
];


/* ==========================================================================
   PART 1C: CHANGING HERO BG
   --------------------------------------------------------------------------
   Pics live in assets/hero/
   ========================================================================== */
(() => {
  const heroBackground = document.querySelector(".hero__background");
  if (!heroBackground) return;

  const images = [
    "assets/hero/hero.jpg",
    "assets/hero/hero2.jpg",
    "assets/hero/hero3.jpg"
  ];

  let current = 0;
  let activeLayer = 0;

  // Create two permanent layers so one image is always visible.
  const layerA = document.createElement("div");
  const layerB = document.createElement("div");

  layerA.className = "hero__bg-layer hero__bg-layer--a";
  layerB.className = "hero__bg-layer hero__bg-layer--b";

  heroBackground.innerHTML = "";
  heroBackground.appendChild(layerA);
  heroBackground.appendChild(layerB);

  const layers = [layerA, layerB];

  const preload = (src) => new Promise((resolve) => {
    const img = new Image();

    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);

    img.src = src;
  });

  // Preload everything before the slideshow starts.
  Promise.all(images.map(preload)).then(() => {
    const firstImage = images[0];

    layers[0].style.backgroundImage = `
      linear-gradient(
        rgba(8, 7, 7, 0.62),
        rgba(8, 7, 7, 0.78)
      ),
      url("${firstImage}")
    `;

    layers[0].classList.add("is-active");

    setInterval(() => {
      current = (current + 1) % images.length;

      const nextLayer = activeLayer === 0 ? 1 : 0;
      const nextImage = images[current];

      layers[nextLayer].style.backgroundImage = `
        linear-gradient(
          rgba(8, 7, 7, 0.62),
          rgba(8, 7, 7, 0.78)
        ),
        url("${nextImage}")
      `;

      // Wait one frame so the browser has painted the new image
      // before fading the layer in.
      requestAnimationFrame(() => {
        layers[nextLayer].classList.add("is-active");
        layers[activeLayer].classList.remove("is-active");
        activeLayer = nextLayer;
      });
    }, 5000);
  });
})();

/* ==========================================================================
   PART 2: SITE CODE
   ========================================================================== */

/* ---------- Small helpers ---------- */
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const pad = (n) => String(n).padStart(2, '0');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const esc = (value) =>
  String(value == null ? '' : value).replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));


/* Restart a CSS animation by toggling a class */
function retrigger(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
}

/* Runs a callback once an image has loaded or failed, even if that already happened */
function watchImage(img, onMissing, onLoaded) {
  if (img.complete) {
    (img.naturalWidth > 0 ? onLoaded : onMissing) && (img.naturalWidth > 0 ? onLoaded : onMissing)();
    return;
  }
  img.addEventListener('load', () => onLoaded && onLoaded(), { once: true });
  img.addEventListener('error', () => onMissing && onMissing(), { once: true });
}

/* ---------- Placeholder handling for logo + member photos ---------- */
function initAssetPlaceholders() {
  $$('[data-asset-wrap]').forEach((wrap) => {
    const img = $('img[data-asset]', wrap);
    if (!img) return;
    watchImage(
      img,
      () => wrap.setAttribute('data-state', 'missing'),
      () => wrap.setAttribute('data-state', 'loaded')
    );
  });
}

const SECTION_BACKGROUNDS_ENABLED = true;

document.documentElement.classList.toggle(
  'section-backgrounds',
  SECTION_BACKGROUNDS_ENABLED
);

/* ---------- Header, mobile menu, active link ---------- */
function initNavigation() {
  const header = $('.site-header');
  const nav = $('#site-nav');
  const toggle = $('.menu-toggle');
  if (!header || !nav || !toggle) return;

  const label = $('.menu-toggle__label', toggle);
  const mq = window.matchMedia('(max-width: 900px)');

  function setMenu(open) {
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    if (label) label.textContent = open ? 'Close' : 'Menu';
    document.body.classList.toggle('menu-open', open && mq.matches);
  }

  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  mq.addEventListener('change', () => setMenu(false));

  /* Thin divider under the header once the page scrolls */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Highlight the link for the section currently in view */
  const links = $$('.nav__list a[href^="#"]');
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((a) => a.removeAttribute('aria-current'));
      const link = byId.get(entry.target.id);
      if (link) link.setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  ['top', 'about', 'band', 'gigs', 'music', 'gallery', 'contact'].forEach((id) => {
    const section = document.getElementById(id);
    if (section) observer.observe(section);
  });
}


/* ==========================================================================
   GIGS CALENDAR
   ========================================================================== */
function initGigs() {
  const app = $('#gigs-app');
  if (!app) return;

  const els = {
    title:    $('[data-cal-title]', app),
    body:     $('[data-cal-body]', app),
    view:     $('[data-cal-viewport]', app),
    empty:    $('[data-cal-empty]', app),
    detail:   $('[data-gig-detail]', app),
    upcoming: $('[data-upcoming]', app),
    more:     $('[data-upcoming-more]', app),
    pastWrap: $('[data-past-wrap]', app),
    past:     $('[data-past]', app),
    today:    $('[data-cal-today]', app),
    prev:     $('[data-cal-prev]', app),
    next:     $('[data-cal-next]', app)
  };

  /* --- Date utilities (dates are handled as local "YYYY-MM-DD" text to avoid timezone bugs) --- */
  const toISO = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`;
  const parseISO = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
  const ymOf = (iso) => { const [y, m] = iso.split('-').map(Number); return [y, m - 1]; };

  const fmtMonth = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
  const fmtLong  = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const fmtDow   = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
  const fmtMon   = new Intl.DateTimeFormat('en-US', { month: 'short' });
  const fmtShort = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });

  const now = new Date();
  const TODAY = toISO(now.getFullYear(), now.getMonth(), now.getDate());

  /* --- Clean, sorted data --- */
  const allGigs = gigs
    .filter((g) => {
      const ok = g && typeof g.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(g.date);
      if (!ok) console.warn('Skipping a gig with an invalid date. Use the format YYYY-MM-DD:', g);
      return ok;
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  const upcoming = allGigs.filter((g) => g.date >= TODAY);
  const past = allGigs.filter((g) => g.date < TODAY).reverse();

  const byDate = new Map();
  allGigs.forEach((g) => {
    if (!byDate.has(g.date)) byDate.set(g.date, []);
    byDate.get(g.date).push(g);
  });

  /* --- State --- */
  let viewY = now.getFullYear();
  let viewM = now.getMonth();
  let selected = null;
  let showAll = false;
  const LIST_LIMIT = 5;
  const stacked = window.matchMedia('(max-width: 960px)');

  if (upcoming.length) {
    [viewY, viewM] = ymOf(upcoming[0].date);
    selected = upcoming[0].date;
  }

  /* --- Markup builders --- */
  function safeLink(url) {
    return typeof url === 'string' && /^(https?:\/\/|mailto:)/i.test(url) ? url : null;
  }

  function cardHTML(g) {
    const d = parseISO(g.date);
    const isPast = g.date < TODAY;
    const status = g.date === TODAY ? 'Tonight' : isPast ? 'Past show' : 'Upcoming show';
    const mapsUrl = 'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent([g.venue, g.city].filter(Boolean).join(', '));
    const link = safeLink(g.link);

    const meta = [
      `<dt>Date</dt><dd>${esc(fmtLong.format(d))}</dd>`,
      g.time ? `<dt>Time</dt><dd>${esc(g.time)}</dd>` : '',
      g.city ? `<dt>Location</dt><dd>${esc(g.city)}</dd>` : ''
    ].join('');

    return `
      <article class="gig-card${isPast ? ' is-past' : ''}">
        <div class="gig-card__date" aria-hidden="true">
          <span class="gig-card__dow">${esc(fmtDow.format(d))}</span>
          <span class="gig-card__day">${d.getDate()}</span>
          <span class="gig-card__mon">${esc(fmtMon.format(d))} ${d.getFullYear()}</span>
        </div>
        <div class="gig-card__body">
          <p class="gig-card__status">${status}</p>
          <h4 class="gig-card__venue">${esc(g.venue || 'Venue to be announced')}</h4>
          <dl class="gig-card__meta">${meta}</dl>
          ${g.details ? `<p class="gig-card__desc">${esc(g.details)}</p>` : ''}
          <div class="gig-card__actions">
            ${g.venue ? `<a href="${esc(mapsUrl)}" target="_blank" rel="noopener">Get directions</a>` : ''}
            ${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">${esc(g.linkLabel || 'Event details')}</a>` : ''}
          </div>
        </div>
      </article>`;
  }

  function rowHTML(g) {
    const d = parseISO(g.date);
    const tag = g.date === TODAY ? '<span class="gig-row__tag">Tonight</span>' : '';
    return `
      <li>
        <button type="button" class="gig-row" data-date="${esc(g.date)}">
          <span class="gig-row__date" aria-hidden="true">
            <span class="gig-row__mon">${esc(fmtMon.format(d))}</span>
            <span class="gig-row__day">${d.getDate()}</span>
          </span>
          <span class="gig-row__info">
            ${tag}
            <span class="gig-row__venue">${esc(g.venue || 'Venue to be announced')}</span>
            ${g.city ? `<span class="gig-row__city">${esc(g.city)}</span>` : ''}
            <span class="sr-only">${esc(fmtLong.format(d))}</span>
          </span>
          ${g.time ? `<span class="gig-row__time">${esc(g.time)}</span>` : ''}
        </button>
      </li>`;
  }

  /* --- Calendar grid --- */
  function renderCalendar(direction) {
    const monthName = fmtMonth.format(new Date(viewY, viewM, 1));
    els.title.textContent = monthName;

    const startDow = new Date(viewY, viewM, 1).getDay();
    const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
    const weeks = Math.ceil((startDow + daysInMonth) / 7);

    let html = '';
    let day = 1 - startDow;
    for (let w = 0; w < weeks; w++) {
      html += '<tr>';
      for (let c = 0; c < 7; c++, day++) {
        if (day < 1 || day > daysInMonth) { html += '<td></td>'; continue; }

        const iso = toISO(viewY, viewM, day);
        const list = byDate.get(iso);
        const cls = ['cal__cell'];
        if (iso === TODAY) cls.push('is-today');
        if (iso < TODAY) cls.push('is-past');

        if (list) {
          cls.push('has-gig');
          const when = fmtLong.format(new Date(viewY, viewM, day));
          const venues = list.map((g) => g.venue).filter(Boolean).join(' and ');
          const count = list.length > 1 ? `${list.length} shows` : (iso < TODAY ? 'past show' : 'show');
          const label = `${when}: ${count}${venues ? ', ' + venues : ''}`;
          html += `<td><button type="button" class="${cls.join(' ')}" data-date="${iso}" aria-pressed="false" aria-label="${esc(label)}">${day}</button></td>`;
        } else {
          html += `<td><span class="${cls.join(' ')}">${day}</span></td>`;
        }
      }
      html += '</tr>';
    }
    els.body.innerHTML = html;

    /* "Back to today" only when you are looking at a different month */
    const onCurrent = viewY === now.getFullYear() && viewM === now.getMonth();
    els.today.style.visibility = onCurrent ? 'hidden' : 'visible';
    els.today.tabIndex = onCurrent ? -1 : 0;

    /* Slide animation in the direction of travel */
    if (direction) {
      els.view.dataset.dir = direction;
      retrigger(els.view, 'is-sliding');
    }

    /* Clean "no shows this month" state */
    const prefix = `${viewY}-${pad(viewM + 1)}-`;
    const hasGigs = allGigs.some((g) => g.date.startsWith(prefix));
    if (hasGigs) {
      els.empty.hidden = true;
      els.empty.innerHTML = '';
    } else {
      let msg = `<p class="cal__empty-title">No shows in ${esc(monthName)}.</p>`;
      if (upcoming.length) {
        const n = upcoming[0];
        msg += `<p>The next show is ${esc(fmtShort.format(parseISO(n.date)))}${n.venue ? ' at ' + esc(n.venue) : ''}.</p>` +
               `<button type="button" class="text-link" data-jump="${esc(n.date)}">Go to the next show</button>`;
      } else {
        msg += '<p>No shows are on the calendar right now. Check back soon, or <a href="#contact">get in touch</a>.</p>';
      }
      els.empty.innerHTML = msg;
      els.empty.hidden = false;
    }

    updateSelection();
  }

  /* --- Detail panel --- */
  function renderDetail() {
    const list = selected ? byDate.get(selected) : null;
    if (list && list.length) {
      els.detail.innerHTML = list.map(cardHTML).join('');
    } else if (!allGigs.length) {
      els.detail.innerHTML = `
        <div class="gig-empty">
          <p class="gig-empty__title">No shows yet.</p>
          <p>New dates will appear here as soon as they are on the calendar. Want us at your event? <a href="#contact">Get in touch</a>.</p>
        </div>`;
    } else if (!upcoming.length) {
      els.detail.innerHTML = `
        <div class="gig-empty">
          <p class="gig-empty__title">No upcoming shows right now.</p>
          <p>Check back soon, or <a href="#contact">get in touch</a> about a show. Select a past date on the calendar to see where we have played.</p>
        </div>`;
    } else {
      els.detail.innerHTML = `
        <div class="gig-empty">
          <p class="gig-empty__title">Pick a date.</p>
          <p>Select a highlighted date on the calendar or a show in the list to see the details.</p>
        </div>`;
    }
    retrigger(els.detail, 'is-swapping');
  }

  /* --- Lists --- */
  function renderLists() {
    const items = showAll ? upcoming : upcoming.slice(0, LIST_LIMIT);
    els.upcoming.innerHTML = items.length
      ? items.map(rowHTML).join('')
      : '<li class="gig-list__empty">No upcoming shows right now. Check back soon.</li>';

    els.more.hidden = upcoming.length <= LIST_LIMIT;
    els.more.textContent = showAll ? 'Show fewer' : `Show all ${upcoming.length} upcoming shows`;

    els.pastWrap.hidden = past.length === 0;
    els.past.innerHTML = past.map(rowHTML).join('');
  }

  /* Update highlight state without rebuilding (keeps keyboard focus in place) */
  function updateSelection() {
    $$('[data-date]', app).forEach((el) => {
      const on = el.dataset.date === selected;
      el.classList.toggle('is-selected', on);
      if (el.classList.contains('cal__cell')) el.setAttribute('aria-pressed', String(on));
    });
  }

  function select(iso) {
    selected = iso;
    updateSelection();
    renderDetail();
  }

  function goTo(iso, scrollToDetail) {
    const [y, m] = ymOf(iso);
    const dir = (y * 12 + m) >= (viewY * 12 + viewM) ? 'next' : 'prev';
    const changed = y !== viewY || m !== viewM;
    viewY = y;
    viewM = m;
    if (changed) renderCalendar(dir);
    select(iso);
    if (scrollToDetail && stacked.matches) {
      els.detail.scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'nearest' });
    }
  }

  function shiftMonth(delta) {
    const d = new Date(viewY, viewM + delta, 1);
    viewY = d.getFullYear();
    viewM = d.getMonth();
    renderCalendar(delta > 0 ? 'next' : 'prev');
  }

  /* --- Events --- */
  els.prev.addEventListener('click', () => shiftMonth(-1));
  els.next.addEventListener('click', () => shiftMonth(1));
  els.today.addEventListener('click', () => {
    const goingForward = (now.getFullYear() * 12 + now.getMonth()) > (viewY * 12 + viewM);
    viewY = now.getFullYear();
    viewM = now.getMonth();
    renderCalendar(goingForward ? 'next' : 'prev');
  });

  app.addEventListener('click', (e) => {
    const jump = e.target.closest('[data-jump]');
    if (jump) { goTo(jump.dataset.jump, false); return; }

    const cell = e.target.closest('button.cal__cell[data-date]');
    if (cell) { select(cell.dataset.date); return; }

    const row = e.target.closest('.gig-row[data-date]');
    if (row) goTo(row.dataset.date, true);
  });

  els.more.addEventListener('click', () => {
    showAll = !showAll;
    renderLists();
    updateSelection();
  });

  /* --- First paint --- */
  renderCalendar();
  renderLists();
  updateSelection();
  renderDetail();
  els.detail.setAttribute('aria-live', 'polite');   /* announce changes only after the first render */
}


/* ==========================================================================
   PHOTO GALLERY + LIGHTBOX
   ========================================================================== */
function initGallery() {
  const grid = $('[data-gallery]');
  const dlg = $('#lightbox');
  if (!grid || !dlg) return;

  const items = galleryImages.filter((g) => g && g.src);
  if (!items.length) {
    grid.outerHTML = '<p class="gallery__empty">Photos are coming soon.</p>';
    return;
  }

  /* --- Build the grid --- */
  grid.innerHTML = items.map((item, i) => {
    const title = item.title || 'Photo';
    return `
      <li class="masonry__item">
        <button type="button" class="tile" data-index="${i}" aria-haspopup="dialog">
          <img src="${esc(item.thumb || item.src)}" alt="${esc(item.alt || title)}" loading="lazy" decoding="async">
          <span class="tile__missing" aria-hidden="true">
            <span class="tile__missing-title">${esc(title)}</span>
            <span class="asset-missing__path">${esc(item.src)}</span>
          </span>
          <span class="tile__cap" aria-hidden="true">
            <span class="tile__title">${esc(title)}</span>
            ${item.date ? `<span class="tile__date">${esc(item.date)}</span>` : ''}
          </span>
        </button>
      </li>`;
  }).join('');

  $$('.tile img', grid).forEach((img) => {
    watchImage(img, () => {
      const tile = img.closest('.tile');
      tile.classList.add('is-missing');
      tile.setAttribute('aria-label', img.alt + ' (image file not found yet)');
    });
  });

  /* --- Lightbox --- */
  const media   = $('[data-lb-media]', dlg);
  const lbImg   = $('[data-lb-img]', dlg);
  const lbPath  = $('[data-lb-path]', dlg);
  const lbTitle = $('[data-lb-title]', dlg);
  const lbMeta  = $('[data-lb-meta]', dlg);
  const lbCount = $('[data-lb-count]', dlg);
  const lbDl    = $('[data-lb-download]', dlg);

  let index = 0;
  let opener = null;

  dlg.classList.toggle('is-single', items.length < 2);

  function fileName(src) {
    const clean = src.split('?')[0].split('#')[0];
    return decodeURIComponent(clean.substring(clean.lastIndexOf('/') + 1)) || 'photo.jpg';
  }

  function show(direction) {
    const item = items[index];
    const title = item.title || 'Photo';

    media.classList.remove('is-missing');
    lbImg.onload = () => media.classList.remove('is-missing');
    lbImg.onerror = () => media.classList.add('is-missing');
    lbImg.src = item.src;
    lbImg.alt = item.alt || title;
    lbPath.textContent = item.src;

    lbTitle.textContent = title;
    lbMeta.textContent = item.date || '';
    lbCount.textContent = `${index + 1} of ${items.length}`;

    /* Download the original file, not the grid thumbnail */
    lbDl.href = item.src;
    lbDl.setAttribute('download', fileName(item.src));

    lbImg.classList.remove('from-left', 'from-right');
    if (direction) {
      void lbImg.offsetWidth;
      lbImg.classList.add(direction > 0 ? 'from-right' : 'from-left');
    }

    /* Warm the cache for neighbors so next/previous feels instant */
    [1, -1].forEach((step) => {
      const n = items[(index + step + items.length) % items.length];
      const pre = new Image();
      pre.src = n.src;
    });
  }

  function open(i, trigger) {
    index = i;
    opener = trigger;
    show(0);
    dlg.classList.remove('is-closing');
    if (!dlg.open) dlg.showModal();
    document.body.classList.add('lb-open');
  }

  function step(delta) {
    if (items.length < 2) return;
    index = (index + delta + items.length) % items.length;
    show(delta);
  }

  function close() {
    if (!dlg.open || dlg.classList.contains('is-closing')) return;
    dlg.classList.add('is-closing');
    const finish = () => { dlg.classList.remove('is-closing'); dlg.close(); };
    if (reduceMotion.matches) finish(); else setTimeout(finish, 180);
  }

  grid.addEventListener('click', (e) => {
    const tile = e.target.closest('.tile');
    if (tile) open(Number(tile.dataset.index), tile);
  });

  $('[data-lb-close]', dlg).addEventListener('click', close);
  $('[data-lb-prev]', dlg).addEventListener('click', () => step(-1));
  $('[data-lb-next]', dlg).addEventListener('click', () => step(1));

  /* Click the dark area outside the photo to close */
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.matches('[data-lb-stage]')) close();
  });

  /* Esc is handled natively, but we intercept it so the close animation plays */
  dlg.addEventListener('cancel', (e) => { e.preventDefault(); close(); });
  dlg.addEventListener('close', () => {
    document.body.classList.remove('lb-open');
    if (opener && document.contains(opener)) opener.focus();
  });

  dlg.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    else if (e.key === 'Home') { e.preventDefault(); index = 0; show(-1); }
    else if (e.key === 'End') { e.preventDefault(); index = items.length - 1; show(1); }
  });

  /* Swipe left or right on touch screens */
  let startX = null;
  let startY = null;
  dlg.addEventListener('touchstart', (e) => {
    startX = e.changedTouches[0].clientX;
    startY = e.changedTouches[0].clientY;
  }, { passive: true });
  dlg.addEventListener('touchend', (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    startX = startY = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) step(dx < 0 ? 1 : -1);
  }, { passive: true });
}


/* ==========================================================================
   CONTACT FORM (Formspree)
   The endpoint lives in the form's action attribute in index.html.
   Search index.html for "FORMSPREE SETUP".
   ========================================================================== */
function initContactForm() {
  const form = $('#contact-form');
  const status = $('#form-status');
  if (!form || !status) return;

  const button = $('button[type="submit"]', form);

  function say(message, type) {
    status.textContent = message;
    status.className = 'form__status' + (type ? ' is-' + type : '');
  }

  form.addEventListener('submit', async (e) => {
    const endpoint = form.getAttribute('action') || '';

    /* Not configured yet: be honest instead of pretending to send */
    if (!endpoint || endpoint.includes('YOUR_FORM_ID')) {
      e.preventDefault();
      say('This form is not connected yet, so your message was not sent. Please email ianglin92@yahoo.com or call (574) 373-6452.', 'error');
      return;
    }

    /* Configured: send in the background so the visitor stays on the page */
    e.preventDefault();
    button.disabled = true;
    say('Sending...', '');

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (response.ok) {
        form.reset();
        say('Thanks. Your message was sent.', 'success');
      } else {
        say('Something went wrong and your message was not sent. Please email ianglin92@yahoo.com instead.', 'error');
      }
    } catch (err) {
      say('Could not reach the server. Check your connection, or email ianglin92@yahoo.com instead.', 'error');
    } finally {
      button.disabled = false;
    }
  });
}

/* ==========================================================================
   SITE LOCK
   ========================================================================== */

const SITE_LOCKED = false;
const SITE_PASSWORD = "roamer6";

(() => {
  const lock = document.getElementById("site-lock");
  const form = document.getElementById("site-lock-form");
  const input = document.getElementById("site-lock-password");
  const error = document.getElementById("site-lock-error");

  if (!lock || !form) return;

  if (!SITE_LOCKED) {
    lock.remove();
    return;
  }

  document.body.classList.add("site-locked");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (input.value === SITE_PASSWORD) {
      error.classList.remove("is-visible", "is-shaking");

      lock.classList.add("is-unlocked");
      document.body.classList.remove("site-locked");

      setTimeout(() => {
        lock.remove();
      }, 600);

      return;
    }

    input.value = "";
    input.focus();

    error.classList.remove("is-shaking");
    void error.offsetWidth;
    error.classList.add("is-visible", "is-shaking");
  });

  input.addEventListener("input", () => {
    error.classList.remove("is-visible");
  });

  requestAnimationFrame(() => {
    input.focus();
  });
})();

/* ---------- Footer year + start everything ---------- */
function init() {
  const year = $('[data-year]');
  if (year) year.textContent = new Date().getFullYear();

  initAssetPlaceholders();
  initNavigation();
  initGigs();
  initGallery();
  initContactForm();
}

init();