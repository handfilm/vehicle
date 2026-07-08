/* ============================================================
   RAWX MOTION LAB — APP ENGINE
   Loads assets/manifest.json (auto-generated from filenames in
   /assets by generate-manifest.js — see README.md), then handles
   routing, search/sort, pin board, and the lightbox.
   Naming convention: <kind>-<slug>[-n].<ext>
     kind: signature | core | hook | elegance
     ext:  jpg/jpeg/png/webp/gif = image, mp4/webm/mov = video
============================================================ */
(function () {
  'use strict';

  var VIDEO_EXT = ['mp4', 'webm', 'mov', 'm4v'];
  var KIND_ORDER = ['signature', 'core', 'hook', 'elegance'];

  var PROTOCOLS = {
    signature: {
      index: '01',
      tag: 'Flagship Protocol',
      title: 'Lingerie Motion AI',
      desc: "This is the apex of the RAWX engine. Celebrating this means celebrating the conquest of AI's ultimate stress test: flawless fabric-to-skin interaction. Lingerie and shapewear demand absolute precision in tension, shadow, and material physics \u2014 variables where standard AI completely fails. This protocol proves we don't just generate media; we engineer cinematic, Hasselblad-level realism that shatters algorithmic limits."
    },
    core: {
      index: '02',
      tag: 'Brand Infrastructure',
      title: 'RAWX Brand AI Infrastructure',
      desc: 'This is the spine of the RAWX aesthetic. We celebrate the Core because it represents the death of the chaotic mood board and the birth of a strict, brutalist visual language. Void-black environments, tactical concrete, and uncompromising industrial aesthetics. It proves that absolute control over a brand\u2019s DNA can be coded and deployed autonomously without losing its raw, physical edge.'
    },
    hook: {
      index: '03',
      tag: 'Anatomy & Tension',
      title: 'Anatomy & Tension Dynamics',
      desc: 'The Hook is celebrated for mastering the raw physics of the human form. Standard generative AI creates plastic, weightless bodies; this protocol forces the engine to calculate true biomechanics, muscle tension, and structural weight. It commands immediate visual authority \u2014 not through cheap aesthetics, but through hyper-detailed anatomical truth.'
    },
    elegance: {
      index: '04',
      tag: 'Facial Architecture',
      title: 'Micro-Expressions',
      desc: 'We celebrate Elegance because it conquers the "uncanny valley." The hardest thing to extract from a machine is a soul. This protocol bypasses the dead-eyed, static stare of typical AI generations, forcing the engine to render cinematic subtlety \u2014 the exact depth of a gaze, the slight shift of a jaw \u2014 injecting genuine, undeniable life into the digital architecture.'
    }
  };

  var state = {
    all: [],
    filtered: [],
    route: '/',
    search: '',
    sort: 'default',
    pinned: loadPinned(),
    visibleCount: 24
  };

  /* ---------------- Manifest loading ---------------- */
  function titleFromSlug(slug) {
    return slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, function (c) { return c.toUpperCase(); });
  }

  // Fallback parser: if manifest.json is missing, try to build the
  // registry directly from a plain filename list at assets/files.json
  // (one filename per array entry — no metadata needed).
  function parseFilename(filename) {
    var m = filename.match(/^([a-z]+)-(.+)\.([a-z0-9]+)$/i);
    if (!m) return null;
    var kind = m[1].toLowerCase();
    if (KIND_ORDER.indexOf(kind) === -1) return null;
    var slug = m[2];
    var ext = m[3].toLowerCase();
    return {
      kind: kind,
      slug: slug,
      title: titleFromSlug(slug),
      src: 'assets/' + filename,
      isVideo: VIDEO_EXT.indexOf(ext) !== -1
    };
  }

  function fetchJSON(url) {
    return fetch(url, { cache: 'no-store' }).then(function (r) {
      if (!r.ok) throw new Error('not found: ' + url);
      return r.json();
    });
  }

  function loadRegistry() {
    setBootStatus('READING /assets/manifest.json…');
    return fetchJSON('assets/manifest.json')
      .then(function (data) {
        state.all = data.map(function (item, i) {
          item.id = i;
          if (item.title === undefined) item.title = titleFromSlug(item.slug || '');
          return item;
        });
        document.getElementById('stat-source').textContent = 'manifest.json';
        return state.all;
      })
      .catch(function () {
        // Fallback: plain filename list, no build step required at all.
        setBootStatus('manifest.json missing — trying assets/files.json…');
        return fetchJSON('assets/files.json')
          .then(function (files) {
            state.all = files
              .map(parseFilename)
              .filter(Boolean)
              .map(function (item, i) { item.id = i; return item; });
            document.getElementById('stat-source').textContent = 'files.json';
            return state.all;
          })
          .catch(function () {
            setBootStatus('NO REGISTRY FOUND — run generate-manifest.js');
            document.getElementById('stat-source').textContent = 'NONE';
            state.all = [];
            return state.all;
          });
      });
  }

  function setBootStatus(text) {
    var el = document.getElementById('boot-status');
    if (el) el.textContent = text;
  }

  /* ---------------- Pin persistence ---------------- */
  function loadPinned() {
    try { return JSON.parse(localStorage.getItem('rawx_pinned') || '[]'); }
    catch (e) { return []; }
  }
  function savePinned() {
    try { localStorage.setItem('rawx_pinned', JSON.stringify(state.pinned)); } catch (e) {}
  }
  function isPinned(item) {
    return state.pinned.indexOf(item.src) !== -1;
  }
  function togglePin(item) {
    var idx = state.pinned.indexOf(item.src);
    if (idx === -1) { state.pinned.push(item.src); }
    else { state.pinned.splice(idx, 1); }
    savePinned();
    renderPinCounts();
  }
  function renderPinCounts() {
    document.getElementById('stat-pinned').textContent = state.pinned.length;
    document.getElementById('side-board-count').textContent = state.pinned.length;
  }

  /* ---------------- Routing ---------------- */
  function currentKind() {
    var r = state.route.replace(/^\//, '');
    return KIND_ORDER.indexOf(r) !== -1 ? r : null;
  }

  function applyRoute() {
    var kind = currentKind();
    document.getElementById('view-home').hidden = !!kind;
    document.getElementById('ml-brief').hidden = !kind;

    document.querySelectorAll('.side-link').forEach(function (a) {
      a.classList.toggle('active', a.dataset.route === state.route);
    });

    if (kind) {
      document.getElementById('topbar-crumb').textContent = '/ ' + kind.toUpperCase();
      var p = PROTOCOLS[kind];
      document.getElementById('brief-index').textContent = p.index;
      document.getElementById('brief-tag').textContent = p.tag;
      document.getElementById('brief-title').textContent = p.title;
      document.getElementById('brief-desc').textContent = p.desc;
      document.getElementById('grid-title').textContent = kind.charAt(0).toUpperCase() + kind.slice(1);
    } else {
      document.getElementById('topbar-crumb').textContent = '/ HOME';
      document.getElementById('grid-title').textContent = 'Full Registry';
    }

    state.visibleCount = 24;
    renderGrid();
    closeSidebarMobile();
  }

  function navigate(route) {
    window.location.hash = '#' + route;
  }

  /* ---------------- Grid rendering ---------------- */
  function computeFiltered() {
    var kind = currentKind();
    var list = kind ? state.all.filter(function (p) { return p.kind === kind; }) : state.all.slice();

    var q = state.search.trim().toLowerCase();
    if (q) {
      list = list.filter(function (p) {
        return p.title.toLowerCase().indexOf(q) !== -1 || p.kind.indexOf(q) !== -1;
      });
    }

    if (state.sort === 'az') {
      list.sort(function (a, b) { return a.title.localeCompare(b.title); });
    } else if (state.sort === 'za') {
      list.sort(function (a, b) { return b.title.localeCompare(a.title); });
    }

    return list;
  }

  function renderGrid() {
    state.filtered = computeFiltered();
    var grid = document.getElementById('asset-grid');
    var empty = document.getElementById('grid-empty');
    var loadMoreBtn = document.getElementById('load-more-btn');
    grid.innerHTML = '';

    document.getElementById('grid-count').textContent = state.filtered.length + ' asset' + (state.filtered.length === 1 ? '' : 's');

    if (!state.filtered.length) {
      empty.hidden = false;
      loadMoreBtn.hidden = true;
      return;
    }
    empty.hidden = true;

    var visible = state.filtered.slice(0, state.visibleCount);
    var frag = document.createDocumentFragment();

    visible.forEach(function (p) {
      var card = document.createElement('div');
      card.className = 'asset-card';
      card.dataset.id = p.id;

      var media = p.isVideo
        ? '<video src="' + p.src + '" muted loop playsinline preload="metadata"></video>'
        : '<img src="' + p.src + '" alt="' + p.title + '" loading="lazy">';

      card.innerHTML = media +
        '<div class="asset-card-label"><span>' + p.title + '</span><span class="asset-card-kind">' + p.kind + '</span></div>' +
        '<button class="asset-card-pin' + (isPinned(p) ? ' pinned' : '') + '" title="Pin">' + (isPinned(p) ? '\u2713' : '+') + '</button>';

      if (p.isVideo) {
        var v = card.querySelector('video');
        card.addEventListener('mouseenter', function () { v.play().catch(function () {}); });
        card.addEventListener('mouseleave', function () { v.pause(); });
      }

      card.querySelector('.asset-card-pin').addEventListener('click', function (e) {
        e.stopPropagation();
        togglePin(p);
        this.classList.toggle('pinned');
        this.textContent = isPinned(p) ? '\u2713' : '+';
      });

      card.addEventListener('click', function () { openLightbox(p.id); });
      frag.appendChild(card);
    });

    grid.appendChild(frag);
    loadMoreBtn.hidden = state.filtered.length <= state.visibleCount;
    if (!loadMoreBtn.hidden) {
      document.getElementById('load-more-count').textContent =
        '(' + (state.filtered.length - state.visibleCount) + ' MORE)';
    }
  }

  /* ---------------- Lightbox ---------------- */
  var lbIndex = -1;

  function openLightbox(id) {
    lbIndex = state.filtered.findIndex(function (p) { return p.id === id; });
    if (lbIndex === -1) return;
    renderLightbox();
    document.getElementById('lightbox').classList.add('open');
    document.getElementById('lightbox').setAttribute('aria-hidden', 'false');
  }

  function renderLightbox() {
    var p = state.filtered[lbIndex];
    if (!p) return;
    var stage = document.getElementById('lb-media');
    stage.innerHTML = p.isVideo
      ? '<video src="' + p.src + '" controls autoplay loop></video>'
      : '<img src="' + p.src + '" alt="' + p.title + '">';

    document.getElementById('lb-title').textContent = p.title.toUpperCase() + ' \u2014 ' + (lbIndex + 1) + ' / ' + state.filtered.length;
    document.getElementById('lb-character').textContent = p.title;
    document.getElementById('lb-pillar').textContent = p.kind.charAt(0).toUpperCase() + p.kind.slice(1);
    document.getElementById('lb-set-count').textContent = state.all.filter(function (x) { return x.kind === p.kind; }).length + ' assets';

    var pinBtn = document.getElementById('lb-pin-btn');
    pinBtn.classList.toggle('pinned', isPinned(p));
    pinBtn.textContent = isPinned(p) ? 'PINNED' : 'PIN';
  }

  function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.getElementById('lightbox').setAttribute('aria-hidden', 'true');
    document.getElementById('lb-media').innerHTML = '';
  }

  function lbStep(dir) {
    if (!state.filtered.length) return;
    lbIndex = (lbIndex + dir + state.filtered.length) % state.filtered.length;
    renderLightbox();
  }

  /* ---------------- Board / Inquiry ---------------- */
  function renderBoard() {
    var thumbs = document.getElementById('board-thumbs');
    var emptyEl = document.getElementById('modal-body-empty');
    thumbs.innerHTML = '';

    var pinnedItems = state.all.filter(function (p) { return isPinned(p); });
    emptyEl.hidden = pinnedItems.length > 0;

    pinnedItems.forEach(function (p) {
      var thumb = document.createElement('div');
      thumb.className = 'board-thumb';
      thumb.innerHTML = (p.isVideo
        ? '<video src="' + p.src + '" muted></video>'
        : '<img src="' + p.src + '" alt="' + p.title + '">') +
        '<button title="Remove">\u2715</button>';
      thumb.querySelector('button').addEventListener('click', function () {
        togglePin(p);
        renderBoard();
        renderGrid();
      });
      thumbs.appendChild(thumb);
    });
  }

  function openBoard() {
    renderBoard();
    document.getElementById('board-modal-overlay').classList.add('open');
  }
  function closeBoard() {
    document.getElementById('board-modal-overlay').classList.remove('open');
  }

  function showToast(msg) {
    var t = document.getElementById('toast');
    t.textContent = msg;
    t.classList.add('show');
    setTimeout(function () { t.classList.remove('show'); }, 2600);
  }

  /* ---------------- Mobile sidebar ---------------- */
  function closeSidebarMobile() {
    document.getElementById('sidebar').classList.remove('open');
  }

  /* ---------------- Init ---------------- */
  function bindEvents() {
    document.querySelectorAll('[data-route]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        navigate(el.dataset.route);
      });
    });

    window.addEventListener('hashchange', function () {
      state.route = window.location.hash.replace(/^#/, '') || '/';
      applyRoute();
    });

    document.getElementById('grid-search').addEventListener('input', function (e) {
      state.search = e.target.value;
      state.visibleCount = 24;
      renderGrid();
    });
    document.getElementById('grid-sort').addEventListener('change', function (e) {
      state.sort = e.target.value;
      renderGrid();
    });
    document.getElementById('load-more-btn').addEventListener('click', function () {
      state.visibleCount += 24;
      renderGrid();
    });

    document.getElementById('lb-close').addEventListener('click', closeLightbox);
    document.getElementById('lb-prev').addEventListener('click', function () { lbStep(-1); });
    document.getElementById('lb-next').addEventListener('click', function () { lbStep(1); });
    document.getElementById('lb-pin-btn').addEventListener('click', function () {
      togglePin(state.filtered[lbIndex]);
      renderLightbox();
      renderGrid();
    });
    document.getElementById('lightbox').addEventListener('click', function (e) {
      if (e.target.id === 'lightbox') closeLightbox();
    });

    document.getElementById('open-board-btn').addEventListener('click', openBoard);
    document.getElementById('board-modal-close').addEventListener('click', closeBoard);
    document.getElementById('board-modal-overlay').addEventListener('click', function (e) {
      if (e.target.id === 'board-modal-overlay') closeBoard();
    });

    document.getElementById('inquiry-form').addEventListener('submit', function (e) {
      e.preventDefault();
      var company = document.getElementById('inq-company').value;
      var email = document.getElementById('inq-email').value;
      var notes = document.getElementById('inq-notes').value;
      var pinnedItems = state.all.filter(function (p) { return isPinned(p); });
      var refList = pinnedItems.map(function (p) { return p.title + ' (' + p.kind + ')'; }).join(', ') || 'None pinned';

      var subject = encodeURIComponent('B2B Inquiry — ' + company);
      var body = encodeURIComponent(
        'Company: ' + company + '\nEmail: ' + email + '\nNotes: ' + notes + '\nReferenced assets: ' + refList
      );
      window.location.href = 'mailto:hello@handfilm.com?subject=' + subject + '&body=' + body;

      showToast('INQUIRY DRAFTED — CHECK YOUR MAIL CLIENT');
      closeBoard();
      e.target.reset();
    });

    document.getElementById('menu-toggle').addEventListener('click', function () {
      document.getElementById('sidebar').classList.toggle('open');
    });

    document.addEventListener('keydown', function (e) {
      if (document.getElementById('lightbox').classList.contains('open')) {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') lbStep(-1);
        if (e.key === 'ArrowRight') lbStep(1);
      }
    });
  }

  function updateGlobalStats() {
    document.getElementById('stat-total').textContent = state.all.length;
    document.getElementById('hero-stat-total').textContent = state.all.length;
    document.getElementById('hero-stat-chars').textContent = KIND_ORDER.filter(function (k) {
      return state.all.some(function (p) { return p.kind === k; });
    }).length;
    renderPinCounts();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var bar = document.getElementById('boot-bar-fill');
    bar.style.width = '30%';

    bindEvents();

    loadRegistry().then(function () {
      bar.style.width = '100%';
      updateGlobalStats();
      document.getElementById('status-text').textContent = 'LIVE';

      state.route = window.location.hash.replace(/^#/, '') || '/';
      applyRoute();

      setTimeout(function () {
        document.getElementById('boot').classList.add('hidden');
      }, 350);
    });
  });
})();
