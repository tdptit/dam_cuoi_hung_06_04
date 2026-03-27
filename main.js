(function(){
      try {
        var cw = 575;
        var phone = 390;
        var vw = 0;
        try { vw = Math.max(0, Number(window.innerWidth || 0)); } catch(e) { vw = 0; }
        if (!cw || !vw) return;
        var sw = vw <= 480 ? vw : Math.min(phone, Math.max(0, vw - 32));
        var s = Math.min(1, sw / cw);
        document.documentElement.style.setProperty('--miu-s', String(s));
      } catch(e) {}
    })();

(function(){
  try {
    var sp = null;
    try { sp = new URLSearchParams(window.location.search || ''); } catch(e) {}
    if (sp && sp.get('muteMusic') === '1') return;
    if (window.MIU_MUTE_MUSIC) return;

    var audioRef = null;

    var getAudio = function(){
      if (audioRef && audioRef.play) return audioRef;
      var a = document.getElementById('bgAudio') || document.getElementById('musicPlayer');
      if (!a || !a.play) return null;
      audioRef = a;
      try { a.volume = typeof a.volume === 'number' ? a.volume : 0.5; } catch(e) {}
      return a;
    };

    var add = function(type, handler, options){
      try { document.addEventListener(type, handler, options); } catch(e) {
        try { document.addEventListener(type, handler, true); } catch(_) {}
      }
    };
    var remove = function(type, handler, options){
      try { document.removeEventListener(type, handler, options); } catch(e) {
        try { document.removeEventListener(type, handler, true); } catch(_) {}
      }
    };

    var started = false;
    var removeAll = function(){
      remove('pointerdown', start, true);
      remove('touchstart', start, { capture: true, passive: true });
      remove('touchend', start, { capture: true, passive: true });
      remove('keydown', start, true);
      remove('scroll', start, { capture: true, passive: true });
      remove('click', start, true);
    };

    var start = function(){
      if (started) return;
      var audio = getAudio();
      if (!audio) return;
      started = true;
      try {
        var p = audio.play();
        if (p && p.then) {
          p.then(function(){ removeAll(); }).catch(function(){ started = false; });
        } else {
          removeAll();
        }
      } catch(e) {
        started = false;
      }
    };

    add('pointerdown', start, true);
    add('touchstart', start, { capture: true, passive: true });
    add('touchend', start, { capture: true, passive: true });
    add('keydown', start, true);
    add('scroll', start, { capture: true, passive: true });
    add('click', start, true);

    // Also attempt as soon as DOM is ready (won't wait for full assets/fonts).
    var onReady = function(){ try { start(); } catch(e) {} };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onReady, { once: true });
    else onReady();
  } catch(e) {}
})();

(function(){
  try {
    function pad(n){ n = Math.max(0, n|0); return (n<10?'0':'')+n; }
    function parseTarget(raw){
      try {
        raw = String(raw || '').trim();
        if (!raw) return NaN;
        // timestamp (ms)
        if (/^d{10,13}$/.test(raw)) {
          var ts = parseInt(raw, 10);
          if (isFinite(ts)) return raw.length === 10 ? ts * 1000 : ts;
        }
        var t = Date.parse(raw);
        if (isFinite(t)) return t;
        // common form: YYYY-MM-DD HH:mm or YYYY-MM-DD HH:mm:ss
        if (/^d{4}-d{2}-d{2}s+d{2}:d{2}(:d{2})?$/.test(raw)) {
          t = Date.parse(raw.replace(' ', 'T'));
          if (isFinite(t)) return t;
          // assume local time -> add Z as a fallback
          t = Date.parse(raw.replace(' ', 'T') + 'Z');
          if (isFinite(t)) return t;
        }
      } catch(e) {}
      return NaN;
    }
    function tick(){
      var els = document.querySelectorAll('[data-countdown="1"]');
      var now = Date.now();
      for (var i=0;i<els.length;i++){
        var el = els[i];
        var t = parseTarget(el.getAttribute('data-target')||'');
        if (!isFinite(t)) continue;
        var diff = Math.max(0, t - now);
        var total = Math.floor(diff/1000);
        var d = Math.floor(total/86400);
        var h = Math.floor((total%86400)/3600);
        var m = Math.floor((total%3600)/60);
        var s = total%60;
        var sep = el.getAttribute('data-sep');
        if (sep == null) sep = ' : ';
        var parts = [];

        var sd = el.getAttribute('data-suf-d');
        var sh = el.getAttribute('data-suf-h');
        var sm = el.getAttribute('data-suf-m');
        var ss = el.getAttribute('data-suf-s');

        // Back-compat: infer suffix from current text content (e.g. "00d: 00h: 00m: 00s")
        if ((sd == null || sh == null || sm == null || ss == null) && el.textContent) {
          try {
            var raw = String(el.textContent || '');
            var chunks = raw.split(sep);
            var pick = function(idx){
              try {
                var c = String(chunks[idx] || '');
                return c.replace(/[0-9s]/g, '');
              } catch(e) { return ''; }
            };
            if (sd == null) sd = pick(0);
            if (sh == null) sh = pick(1);
            if (sm == null) sm = pick(2);
            if (ss == null) ss = pick(3);
          } catch(e) {}
        }
        if (sd == null) sd = '';
        if (sh == null) sh = '';
        if (sm == null) sm = '';
        if (ss == null) ss = '';

        if ((el.getAttribute('data-show-d')||'1')==='1') parts.push(pad(d) + sd);
        if ((el.getAttribute('data-show-h')||'1')==='1') parts.push(pad(h) + sh);
        if ((el.getAttribute('data-show-m')||'1')==='1') parts.push(pad(m) + sm);
        if ((el.getAttribute('data-show-s')||'0')==='1') parts.push(pad(s) + ss);
        el.textContent = parts.join(sep);
      }
    }
    tick();
    setInterval(tick, 1000);
  } catch(e) {}
})();
(function(){
  try {
    var onClick = function(e){
      try {
        var t = e && e.target;
        if (!t) return;
        var btn = (t.closest && t.closest('[data-miu-btn="1"]')) ? t.closest('[data-miu-btn="1"]') : null;
        if (!btn) return;
        var action = btn.getAttribute('data-action') || '';
        var url = btn.getAttribute('data-url') || '';
        var newTab = btn.getAttribute('data-newtab') === '1';
        var targetId = btn.getAttribute('data-target-id') || '';
        var copyValue = btn.getAttribute('data-copy') || '';
        if (action === 'link' && url) {
          if (newTab) window.open(url, '_blank', 'noopener,noreferrer');
          else window.location.href = url;
          e.preventDefault();
          return;
        }
        if (action === 'scroll' && targetId) {
          var el = document.getElementById(targetId) || document.querySelector('[data-node-id="' + targetId.replace(/"/g,'\"') + '"]');
          if (el && el.scrollIntoView) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          e.preventDefault();
          return;
        }
        if (action === 'copy' && copyValue) {
          try {
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(copyValue);
          } catch(_) {}
          e.preventDefault();
          return;
        }
      } catch(_e) {}
    };
    document.addEventListener('click', onClick, true);
  } catch(e) {}
})();
(function(){
  try {
    var stage = document.querySelector('.miu-stage');
    var canvas = document.querySelector('.miu-canvas');
    if (!stage || !canvas) return;
    var sync = function(){
      try {
        var sw = Number(stage.clientWidth || 0);
        var cw = 575;
        if (!sw || !cw) return;
        var s = Math.min(1, sw / cw);
        try { document.documentElement.style.setProperty('--miu-s', String(s)); } catch(_e) {}
      } catch(_e) {}
    };
    sync();
    window.addEventListener('resize', sync, { passive: true });
  } catch(e) {}
})();
(function(){
  try {
    function isSingleLine(el){
      try {
        var t = (el && el.textContent != null) ? String(el.textContent) : '';
        return t.indexOf('\n') === -1;
      } catch(e){ return true; }
    }

    function copyStyle(src, dst){
      try {
        var cs = window.getComputedStyle(src);
        dst.style.fontFamily = cs.fontFamily;
        dst.style.fontSize = cs.fontSize;
        dst.style.fontWeight = cs.fontWeight;
        dst.style.fontStyle = cs.fontStyle;
        dst.style.letterSpacing = cs.letterSpacing;
        dst.style.textTransform = cs.textTransform;
        dst.style.textDecoration = cs.textDecoration;
        dst.style.lineHeight = cs.lineHeight;
        // Match builder measurement: pre-wrap + max-content width
        dst.style.whiteSpace = 'pre-wrap';
        dst.style.textAlign = cs.textAlign;
      } catch(e) {}
    }

    function getCssPx(el, prop){
      try {
        var cs = window.getComputedStyle(el);
        var v = cs && cs.getPropertyValue ? cs.getPropertyValue(prop) : '';
        var n = parseFloat(String(v || ''));
        return isFinite(n) ? n : 0;
      } catch(e) { return 0; }
    }

    function measureWidth(el){
      var span = document.createElement('span');
      span.textContent = (el && el.textContent != null) ? String(el.textContent) : '';
      span.style.position = 'absolute';
      span.style.left = '-99999px';
      span.style.top = '-99999px';
      span.style.padding = '0';
      span.style.margin = '0';
      span.style.display = 'inline-block';
      span.style.width = 'max-content';
      span.style.maxWidth = 'none';
      span.style.pointerEvents = 'none';
      span.style.visibility = 'hidden';
      copyStyle(el, span);
      document.body.appendChild(span);
      var w = 0;
      try { w = Math.ceil(span.scrollWidth || span.getBoundingClientRect().width || 0); } catch(e) { w = 0; }
      try { document.body.removeChild(span); } catch(_e) {}
      return w;
    }

    function measureNoWrapWidth(el){
      var span = document.createElement('span');
      span.textContent = (el && el.textContent != null) ? String(el.textContent) : '';
      span.style.position = 'absolute';
      span.style.left = '-99999px';
      span.style.top = '-99999px';
      span.style.padding = '0';
      span.style.margin = '0';
      span.style.display = 'inline-block';
      span.style.width = 'max-content';
      span.style.maxWidth = 'none';
      span.style.pointerEvents = 'none';
      span.style.visibility = 'hidden';
      copyStyle(el, span);
      // force single-line to measure required width to avoid wrapping
      span.style.whiteSpace = 'nowrap';
      document.body.appendChild(span);
      var w = 0;
      try { w = Math.ceil(span.scrollWidth || span.getBoundingClientRect().width || 0); } catch(e) { w = 0; }
      try { document.body.removeChild(span); } catch(_e) {}
      return w;
    }

    function detectWrap(el){
      try {
        // Case 1: overflow-based (some layouts keep fixed height)
        var ch = Number(el.clientHeight || 0);
        var sh = Number(el.scrollHeight || 0);
        if (ch && sh && sh > ch + 1) return true;

        // Case 2: no overflow but actual layout is multiple lines
        // (common when height is auto/large enough)
        var t = (el && el.textContent != null) ? String(el.textContent) : '';
        if (t.indexOf('\n') !== -1) return false;

        var lh = getCssPx(el, 'line-height');
        if (!lh || !isFinite(lh)) {
          var fs = getCssPx(el, 'font-size');
          if (fs && isFinite(fs)) lh = fs * 1.2;
        }

        var h = getCssPx(el, 'height');
        if (!h || !isFinite(h)) h = Number(el.clientHeight || 0);
        if (lh && h && isFinite(lh) && isFinite(h) && h > lh + 1) return true;
      } catch(e) {}
      return false;
    }

    function fitOne(el){
      try {
        if (!el) return;
        // Builder-strict behavior: only auto-fit when not manualSized and single-line
        if (el.getAttribute('data-manual-sized') === '1') return;
        if (!isSingleLine(el)) return;

        var w = measureWidth(el);
        if (!w || !isFinite(w)) return;
        var target = w + 6;

        // Use unscaled CSS width (builder stores/uses px in schema; canvas may be scaled).
        var cur = getCssPx(el, 'width');
        if (cur && target <= cur + 1) return;

        // Preserve visual center to match builder layout expectation.
        // If we only change width, the box grows to the right and appears shifted.
        try {
          var left = getCssPx(el, 'left');
          var align = '';
          try { align = String((window.getComputedStyle(el) || {}).textAlign || ''); } catch(_e) { align = ''; }
          if (left && isFinite(left) && cur && isFinite(cur)) {
            var delta = target - cur;
            // For center-aligned text (most titles), keep the center constant.
            if (align === 'center') {
              el.style.left = String(left - delta / 2) + 'px';
            }
          }
        } catch(_e) {}

        el.style.width = String(target) + 'px';
        // ensure height is sufficient after widening
        try {
          var sh = Math.ceil(el.scrollHeight || 0);
          if (sh && isFinite(sh)) el.style.height = String(sh) + 'px';
        } catch(_e) {}
      } catch(e) {}
    }

    function run(){
      try {
        var els = document.querySelectorAll('[data-node-type="element_text"]');
        for (var i=0;i<els.length;i++) fitOne(els[i]);
      } catch(e) {}
    }

    // Wait for fonts to load so measurement matches preview.
    try {
      if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
        document.fonts.ready.then(function(){ setTimeout(run, 0); }).catch(function(){ setTimeout(run, 0); });
      } else {
        setTimeout(run, 0);
      }
    } catch(e) { setTimeout(run, 0); }
  } catch(e) {}
})();
(function(){
  try {
    var prefersReduced = false;
    try {
      prefersReduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch(e) {}

    var q = function(){
      try { return document.querySelectorAll('[data-anim-preset]'); } catch(e) { return []; }
    };

    var isInfinitePreset = function(p){
      return p === 'rotate' || p === 'flicker' || p === 'pulse' || p === 'wiggle';
    };

    var applyAnim = function(el){
      try {
        if (!el || el.__miuAnimApplied) return;
        var preset = String(el.getAttribute('data-anim-preset') || '');
        if (!preset || preset === 'none') {
          try { el.style.opacity = '1'; } catch(e) {}
          return;
        }
        var duration = Number(el.getAttribute('data-anim-duration') || '600');
        var delay = Number(el.getAttribute('data-anim-delay') || '0');
        var easing = String(el.getAttribute('data-anim-easing') || 'cubic-bezier(0.2,0.8,0.2,1)');
        var loop = String(el.getAttribute('data-anim-loop') || '0') === '1';
        var infinite = loop || isInfinitePreset(preset);
        var timing = preset === 'typewriter' ? 'steps(14,end)' : easing;
        var name = 'miu-' + preset;
        try { el.style.opacity = '1'; } catch(e) {}
        try { el.style.animation = name + ' ' + duration + 'ms ' + timing + ' ' + delay + 'ms both' + (infinite ? ' infinite' : ''); } catch(e) {}
        try { el.__miuAnimApplied = true; } catch(e) {}
      } catch(e) {
        try { if (el) el.style.opacity = '1'; } catch(_e) {}
      }
    };

    var els = q();
    if (!els || !els.length) return;

    if (prefersReduced) {
      for (var i=0;i<els.length;i++) applyAnim(els[i]);
      return;
    }

    if (!('IntersectionObserver' in window)) {
      for (var i=0;i<els.length;i++) applyAnim(els[i]);
      return;
    }

    var obs = new IntersectionObserver(function(entries){
      for (var i=0;i<entries.length;i++) {
        var e = entries[i];
        if (e && e.isIntersecting) {
          applyAnim(e.target);
          try { obs.unobserve(e.target); } catch(_e) {}
        }
      }
    }, { root: null, rootMargin: '0px 0px -12% 0px', threshold: [0.08, 0.15, 0.22] });

    for (var i=0;i<els.length;i++) {
      try { obs.observe(els[i]); } catch(e) { applyAnim(els[i]); }
    }
  } catch(e) {}
})();
(function(){
  try {
    var el = document.getElementById('miuOpening');
    var btn = document.getElementById('miuOpeningBtn');
    var cta = document.getElementById('miuOpeningCtaBtn');
    var stage = document.getElementById('miuOpeningSides');
    var mainStage = document.querySelector('.miu-stage');
    if (!el || !btn) return;
    var key = 'miu_opening_opened_' + "quang-hai-thao-trang-2026-09-30";

    var getParam = function(name){
      try {
        var qs = (window && window.location && window.location.search) ? window.location.search : '';
        if (!qs) return '';
        var sp = new URLSearchParams(qs);
        return String(sp.get(name) || '');
      } catch(e) { return ''; }
    };

    var forceOpen = getParam('opening') === '1';
    var resetOpen = getParam('openingReset') === '1';

    var remember = false;

    var clearOpened = function(){
      if (!remember) return;
      try { localStorage.removeItem(key); } catch(e) {}
      try { document.cookie = key + '=; path=/; max-age=0; samesite=lax'; } catch(e) {}
    };

    if (resetOpen) {
      try { clearOpened(); } catch(e) {}
    }
    var opened = false;
    if (remember) {
      try { opened = localStorage.getItem(key) === '1'; } catch(e) {}
      if (!opened) {
        try {
          opened = (document.cookie || '').indexOf(key + '=1') >= 0;
        } catch(e) {}
      }
    }

    var setOpen = function(v){
      try {
        el.setAttribute('data-open', v ? '1' : '0');
        try { el.style.display = v ? 'block' : 'none'; } catch(e) {}
        if (v) {
          document.documentElement.style.overflow = 'hidden';
          document.body.style.overflow = 'hidden';
        } else {
          document.documentElement.style.overflow = '';
          document.body.style.overflow = '';
        }
      } catch(e) {}
    };

    var syncStageSize = function(){
      try {
        if (!stage) return;
        var cw = 575;
        var ch = 11042;
        var phone = 390;
        try {
          if (mainStage) {
            var cs = getComputedStyle(mainStage);
            var cw2 = parseFloat((cs.getPropertyValue('--cw') || '').trim());
            var ch2 = parseFloat((cs.getPropertyValue('--ch') || '').trim());
            var phone2 = parseFloat((cs.getPropertyValue('--phone') || '').trim());
            if (isFinite(cw2) && cw2 > 0) cw = cw2;
            if (isFinite(ch2) && ch2 > 0) ch = ch2;
            if (isFinite(phone2) && phone2 > 0) phone = phone2;
          }
        } catch(e) {}

        var vw = (window && window.innerWidth) ? window.innerWidth : phone;
        var s = Math.min(1, phone / cw, vw / cw);
        if (!isFinite(s) || s <= 0) s = 1;
        stage.style.setProperty('--miu-opening-w', String(Math.round(cw * s)) + 'px');
      } catch(e) {}
    };

    if (forceOpen) {
      try { syncStageSize(); } catch(e) {}
      setOpen(true);
    } else if (!remember) {
      try { syncStageSize(); } catch(e) {}
      setOpen(true);
    } else if (!opened) {
      try { syncStageSize(); } catch(e) {}
      setOpen(true);
    }

    try {
      window.addEventListener('resize', function(){ syncStageSize(); }, { passive: true });
    } catch(e) {}

    try {
      setTimeout(function(){ try { syncStageSize(); } catch(e) {} }, 0);
      setTimeout(function(){ try { syncStageSize(); } catch(e) {} }, 250);
    } catch(e) {}

    var markOpened = function(){
      if (!remember) return;
      try { localStorage.setItem(key, '1'); } catch(e) {}
      try { document.cookie = key + '=1; path=/; max-age=' + (60*60*24*365) + '; samesite=lax'; } catch(e) {}
    };

    var runOpen = function(){
      try {
        if (!stage) return;
        try { syncStageSize(); } catch(e) {}
        // prevent double click
        try { btn.setAttribute('disabled', 'disabled'); } catch(e) {}
        try { if (cta) cta.setAttribute('disabled', 'disabled'); } catch(e) {}

        var sides = stage.querySelectorAll('.card-side');
        var done = 0;
        var finish = function(){
          try { setOpen(false); } catch(e) {}
          try { markOpened(); } catch(e) {}
          try { stage.classList.remove('_animating'); } catch(e) {}
          try { btn.removeAttribute('disabled'); } catch(e) {}
          try { if (cta) cta.removeAttribute('disabled'); } catch(e) {}
        };
        var onEnd = function(){
          done += 1;
          if (done >= 2) finish();
        };

        if (sides && sides.length) {
          // listen once per side, then start animation
          for (var i=0;i<sides.length;i++) {
            try { sides[i].addEventListener('animationend', onEnd, { once: true }); } catch(e) {}
          }
        } else {
          // fallback: if no sides found
          setTimeout(finish, 1200);
        }
        stage.classList.add('_animating');
      } catch(e) {
        try { setOpen(false); } catch(_e) {}
      }
    };

    btn.addEventListener('click', function(){
      try { runOpen(); } catch(e) {}
    }, true);
    if (cta) {
      cta.addEventListener('click', function(){
        try { runOpen(); } catch(e) {}
      }, true);
    }
  } catch(e) {}
})();
(function(){
  try {
    var btn = document.getElementById('audioToggleBtn');
    var audio = document.getElementById('bgAudio');
    if (!btn || !audio) return;
    var sync = function(){
      try {
        var playing = !!(audio && !audio.paused);
        if (playing) { btn.classList.add('playing'); btn.classList.remove('muted'); }
        else { btn.classList.remove('playing'); btn.classList.add('muted'); }
      } catch(e) {}
    };
    btn.addEventListener('click', function(){
      try {
        if (!audio) return;
        if (audio.paused) { var p = audio.play(); if (p && p.catch) p.catch(function(){}); }
        else { audio.pause(); }
      } catch(e) {}
      setTimeout(sync, 50);
    }, true);
    audio.addEventListener('play', sync);
    audio.addEventListener('pause', sync);
    audio.addEventListener('ended', sync);
    sync();
  } catch(e) {}
})();
(function(){
  try {
    var btn = document.getElementById('miuGiftBtn');
    var modal = document.getElementById('miuGiftModal');
    var closeBtn = document.getElementById('miuGiftClose');
    var backdrop = document.getElementById('miuGiftBackdrop');
    if (!btn || !modal) return;
    var setOpen = function(v){
      try {
        if (v) {
          modal.setAttribute('data-open','1');
          modal.setAttribute('aria-hidden','false');
          document.body.classList.add('miu-no-scroll');
        } else {
          modal.removeAttribute('data-open');
          modal.setAttribute('aria-hidden','true');
          document.body.classList.remove('miu-no-scroll');
        }
      } catch(e) {}
    };
    btn.addEventListener('click', function(){ setOpen(true); }, true);
    if (closeBtn) closeBtn.addEventListener('click', function(){ setOpen(false); }, true);
    if (backdrop) backdrop.addEventListener('click', function(){ setOpen(false); }, true);
    document.addEventListener('keydown', function(e){ if (e && e.key === 'Escape') setOpen(false); }, true);

    var tabs = modal.querySelectorAll('[data-miu-gift-target]');
    var imgs = modal.querySelectorAll('[data-miu-gift-img]');
    var activate = function(key){
      try {
        for (var i=0;i<tabs.length;i++){
          var t = tabs[i];
          var k = t.getAttribute('data-miu-gift-target');
          if (k === key) t.classList.add('active'); else t.classList.remove('active');
        }
        for (var j=0;j<imgs.length;j++){
          var im = imgs[j];
          var ik = im.getAttribute('data-miu-gift-img');
          im.style.display = (ik === key) ? '' : 'none';
        }
      } catch(e) {}
    };
    for (var x=0;x<tabs.length;x++){
      tabs[x].addEventListener('click', function(ev){
        try {
          var k = (ev.currentTarget && ev.currentTarget.getAttribute('data-miu-gift-target')) || '';
          if (k) activate(k);
        } catch(e) {}
      }, true);
    }
  } catch(e) {}
})();
(function(){
  try {
    var toast = function(msg, kind){
      try {
        msg = String(msg||'').trim();
        if (!msg) return;
        var wrap = document.querySelector('.miu-toast-wrap');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'miu-toast-wrap';
          document.body.appendChild(wrap);
        }
        var el = document.createElement('div');
        el.className = 'miu-toast';
        el.setAttribute('data-kind', kind || 'info');
        el.textContent = msg;
        wrap.appendChild(el);
        setTimeout(function(){ try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch(e) {} }, 2400);
      } catch(e) {}
    };

    var esc = function(s){ return String(s||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
    };
    var sections = document.querySelectorAll('[data-miu-wishes="1"]');
    if (!sections || !sections.length) return;

    var attach = function(sec){
      try {
        var id = sec.getAttribute('data-miu-wishes-id') || '';
        var slug = sec.getAttribute('data-slug') || '';
        if (!id || !slug) return;
        var listEl = sec.querySelector('[data-miu-wishes-list="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        var form = sec.querySelector('[data-miu-wishes-form="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        var moreBtn = sec.querySelector('[data-miu-wishes-more="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        var modal = sec.querySelector('[data-miu-wishes-modal="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        var modalList = sec.querySelector('[data-miu-wishes-modal-list="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        var modalMoreBtn = sec.querySelector('[data-miu-wishes-modal-more="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        var modalCloseBtns = sec.querySelectorAll('[data-miu-wishes-close="1"][data-miu-wishes-id="' + id.replace(/"/g,'\"') + '"]');
        if (!listEl || !form) return;

        var initial = parseInt(sec.getAttribute('data-initial-limit') || '3', 10);
        if (!isFinite(initial) || initial < 1) initial = 3;
        // Keep the section compact: preview max 3, full list lives in modal.
        var previewN = Math.max(1, Math.min(3, initial));
        var modalShowN = Math.max(10, initial * 4);
        var cache = null;
        var loading = false;

        var setModalOpen = function(open){
          try {
            sec.setAttribute('data-miu-modal-open', open ? '1' : '0');
            if (modal) modal.setAttribute('aria-hidden', open ? 'false' : 'true');
            if (open) document.body.classList.add('miu-no-scroll');
            else document.body.classList.remove('miu-no-scroll');
          } catch(e) {}
        };

        var renderItems = function(arr, limit){
          try {
            var out = '';
            for (var i=0;i<Math.min(limit, arr.length);i++) {
              var w = arr[i] || {};
              out += '<div class="miu-wishes-item">'
                + '<div class="miu-wishes-name">' + esc(w.fullname||'') + '</div>'
                + '<div class="miu-wishes-comment">' + esc(w.comment||'') + '</div>'
                + '</div>';
            }
            return out;
          } catch(e) {
            return '';
          }
        };

        var renderPreview = function(){
          try {
            var arr = (cache && cache.length) ? cache : [];
            if (!arr.length) {
              listEl.innerHTML = '<div class="miu-wishes-empty" style="text-align: center; color: #8a7a70; font-style: italic; padding: 20px;">Hãy là người đầu tiên gửi những lời chúc ngọt ngào và chân thành nhất đến cô dâu, chú rể nhé!</div>';
              if (moreBtn) moreBtn.style.display = 'none';
              return;
            }
            listEl.innerHTML = renderItems(arr, previewN);
            if (moreBtn) {
              moreBtn.style.display = (arr.length > 3) ? '' : 'none';
              if (sec.getAttribute('data-loadmore-text')) moreBtn.textContent = sec.getAttribute('data-loadmore-text');
            }
          } catch(e) {}
        };

        var renderModal = function(){
          try {
            if (!modalList) return;
            var arr = (cache && cache.length) ? cache : [];
            if (!arr.length) {
              modalList.innerHTML = '<div class="miu-wishes-empty" style="text-align: center; color: #8a7a70; font-style: italic; padding: 20px;">Hãy là người đầu tiên gửi những lời chúc ngọt ngào và chân thành nhất đến cô dâu, chú rể nhé!</div>';
              if (modalMoreBtn) modalMoreBtn.style.display = 'none';
              return;
            }
            modalList.innerHTML = renderItems(arr, modalShowN);
            if (modalMoreBtn) {
              modalMoreBtn.style.display = (arr.length > modalShowN) ? '' : 'none';
              if (sec.getAttribute('data-loadmore-text')) modalMoreBtn.textContent = sec.getAttribute('data-loadmore-text');
            }
          } catch(e) {}
        };

        var renderAll = function(){
          try { renderPreview(); renderModal(); } catch(e) {}
        };

        var load = function(force){
          try {
            if (loading) return;
            if (cache && !force) { renderAll(); return; }
            loading = true;
            var scriptUrl = 'https://script.google.com/macros/s/AKfycbwlaqjFVwqJ_w0o7_rLVgSPir_4XmnZ3fbBERKc1BG7VAFkawoR6niGhaU8ePKFm9jZ/exec';
            fetch(scriptUrl + '?action=getWishes')
              .then(function(res) { return res.json(); })
              .then(function(data) {
                if (data && data.status === 'success' && data.data) {
                  cache = data.data; // Mảng chứa {fullname: ..., comment: ...}
                } else {
                  if (!cache) cache = [];
                }
                renderAll();
                loading = false;
              })
              .catch(function(e) {
                console.log("Lỗi load wishes: ", e);
                if (!cache) cache = [];
                renderAll();
                loading = false;
              });
          } catch(e) {}
        };

        if (moreBtn) {
          moreBtn.addEventListener('click', function(){
            try { setModalOpen(true); renderModal(); } catch(e) {}
          }, true);
        }

        if (modalMoreBtn) {
          modalMoreBtn.addEventListener('click', function(){
            try { modalShowN = modalShowN + Math.max(5, initial); renderModal(); } catch(e) {}
          }, true);
        }

        if (modalCloseBtns && modalCloseBtns.length) {
          for (var k=0; k<modalCloseBtns.length; k++) {
          modalCloseBtns[k].addEventListener('click', function(e){
            if (e.target.hasAttribute('data-miu-wishes-close') || e.target.classList.contains('miu-wishes-backdrop')) {
              setModalOpen(false);
            }
          }, true);
        }
        // Ensure backdrop specifically works
        var bdrop = sec.querySelector('.miu-wishes-backdrop');
        if (bdrop) bdrop.addEventListener('click', function(){ setModalOpen(false); }, true);
        }

        form.addEventListener('submit', function(ev){
          try {
            ev.preventDefault();
            var fd = new FormData(form);
            var fullname = String(fd.get('fullname')||'').trim();
            var comment = String(fd.get('comment')||'').trim();
            if (!fullname) { toast('Vui lòng nhập tên', 'error'); return; }
            if (!comment) { toast('Vui lòng nhập lời chúc', 'error'); return; }
            
            // Gửi API Background (Optimistic UI)
            var dataToSend = new URLSearchParams();
            dataToSend.append('type', 'wishes');
            dataToSend.append('fullname', fullname);
            dataToSend.append('comment', comment);

            // Cập nhật giao diện ngay lập tức mà không chờ API
            var formWrap = sec.querySelector('.miu-wishes-form-wrap');
            var thanksMsg = sec.querySelector('.miu-wishes-thanks');
            if (formWrap) formWrap.style.display = 'none';
            if (thanksMsg) thanksMsg.style.display = 'block';

            if (!cache) cache = [];
            try { cache.unshift({ fullname: fullname, comment: comment }); } catch(_e) {}
            previewN = Math.max(previewN, 1);
            renderAll();

            fetch('https://script.google.com/macros/s/AKfycbwlaqjFVwqJ_w0o7_rLVgSPir_4XmnZ3fbBERKc1BG7VAFkawoR6niGhaU8ePKFm9jZ/exec', {
              method: 'POST',
              body: dataToSend
            }).catch(function(e) {
              console.log("Lỗi nền (Wishes): ", e);
            });
          } catch(e) {}
        }, true);

        setModalOpen(false);
        load(false);
      } catch(e) {}
    };

    for (var i=0;i<sections.length;i++) attach(sections[i]);
  } catch(e) {}
})();
(function(){
  try {
    var toast = function(msg, kind){
      try {
        msg = String(msg||'').trim();
        if (!msg) return;
        var wrap = document.querySelector('.miu-toast-wrap');
        if (!wrap) {
          wrap = document.createElement('div');
          wrap.className = 'miu-toast-wrap';
          document.body.appendChild(wrap);
        }
        var el = document.createElement('div');
        el.className = 'miu-toast';
        el.setAttribute('data-kind', kind || 'info');
        el.textContent = msg;
        wrap.appendChild(el);
        setTimeout(function(){ try { if (el && el.parentNode) el.parentNode.removeChild(el); } catch(e) {} }, 2400);
      } catch(e) {}
    };

    var sections = document.querySelectorAll('[data-miu-rsvp="1"]');
    if (!sections || !sections.length) return;
    var attach = function(sec){
      try {
        var id = sec.getAttribute('data-miu-rsvp-id') || '';
        var slug = sec.getAttribute('data-slug') || '';
        if (!id || !slug) return;
        var form = sec.querySelector('[data-miu-rsvp-form="1"][data-miu-rsvp-id="' + id.replace(/"/g,'\"') + '"]');
        if (!form) return;
        form.addEventListener('submit', function(ev){
          try {
            ev.preventDefault();
            var fd = new FormData(form);
            var guestName = String(fd.get('guestName')||'').trim();
            var willAttend = String(fd.get('willAttend')||'yes') === 'yes';
            var eventType = String(fd.get('eventType')||'').trim();
            var eventName = String(fd.get('eventName')||'').trim();
            var message = String(fd.get('message')||'').trim();
            if (!guestName) { toast('Vui lòng nhập họ tên', 'error'); return; }
            // Gọi API Google Sheet Background (Optimistic UI)
            var dataToSend = new URLSearchParams();
            dataToSend.append('type', 'rsvp');
            dataToSend.append('guestName', guestName);
            dataToSend.append('willAttend', willAttend ? 'Có' : 'Không');
            dataToSend.append('eventType', eventType);
            dataToSend.append('eventName', eventName);
            dataToSend.append('message', message);

            // Cập nhật giao diện nội bộ (Inline Thanks)
            var formWrap = sec.querySelector('.miu-rsvp-form-wrap');
            var thanksMsg = sec.querySelector('.miu-rsvp-thanks');
            var thanksTitle = sec.querySelector('.rsvp-thanks-title');
            
            if (formWrap) formWrap.style.display = 'none';
            if (thanksMsg) thanksMsg.style.display = 'block';
            if (thanksTitle) {
              if (guestName) thanksTitle.textContent = 'Cảm ơn ' + guestName.trim() + '!';
              else thanksTitle.textContent = 'Cảm ơn bạn!';
            }

            try { form.reset(); } catch(_e) {}

            fetch('https://script.google.com/macros/s/AKfycbwlaqjFVwqJ_w0o7_rLVgSPir_4XmnZ3fbBERKc1BG7VAFkawoR6niGhaU8ePKFm9jZ/exec', {
              method: 'POST',
              body: dataToSend
            }).catch(function(e) {
              console.log("Lỗi nền (RSVP): ", e);
            });
          } catch(e) {}
        }, true);
      } catch(e) {}
    };
    for (var i=0;i<sections.length;i++) attach(sections[i]);
  } catch(e) {}
})();
(function(){
  try {
    var dock = document.getElementById('miuFabDock');
    var t = document.getElementById('miuFabToggle');
    if (!dock || !t) return;

    try {
      var key = 'miu_fab_dock_open';
      var stored = localStorage.getItem(key);
      if (stored === '0' || stored === '1') {
        dock.setAttribute('data-open', stored);
      }
    } catch(e) {}

    t.addEventListener('click', function(){
      try {
        var open = dock.getAttribute('data-open') === '1';
        var next = open ? '0' : '1';
        dock.setAttribute('data-open', next);
        try { localStorage.setItem('miu_fab_dock_open', next); } catch(e) {}
      } catch(e) {}
    }, true);

    var showTip = function(btn){
      try {
        if (!btn) return;
        btn.classList.add('miu-tip');
        setTimeout(function(){ try{btn.classList.remove('miu-tip');}catch(e){} }, 1200);
      } catch(e) {}
    };
    dock.addEventListener('touchstart', function(e){
      try {
        var target = e && e.target ? e.target : null;
        if (!target) return;
        var btn = (target.closest && target.closest('.miu-fab-item')) ? target.closest('.miu-fab-item') : null;
        if (!btn) return;
        showTip(btn);
      } catch(err) {}
    }, {passive:true});
  } catch(e) {}
})();

(function(){
  try {
    var modalId = 'miuAlbumModal';
    var ensureModal = function(){
      var existing = document.getElementById(modalId);
      if (existing) return existing;
      var wrap = document.createElement('div');
      wrap.id = modalId;
      wrap.setAttribute('aria-hidden','true');
      wrap.style.cssText = 'position:fixed;inset:0;z-index:2147483000;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,0.78);padding:16px;opacity:0;transition:opacity 180ms ease;';
      wrap.innerHTML = ''+
        '<div data-miualbum-panel="1" style="width:min(920px,100%);max-height:min(90vh,860px);display:grid;grid-template-rows:auto 1fr;gap:10px;transform:scale(0.985);opacity:0.98;transition:transform 180ms ease, opacity 180ms ease;will-change:transform,opacity;">'+
          '<div style="display:flex;align-items:center;justify-content:space-between;color:rgba(255,255,255,0.92);font-size:13px;">'+
            '<div data-miualbum-count="1">1 / 1</div>'+
            '<button type="button" data-miualbum-close="1" style="border:0;background:transparent;color:rgba(255,255,255,0.92);font-size:26px;line-height:1;padding:6px 10px;cursor:pointer;">×</button>'+
          '</div>'+
          '<div style="position:relative;border-radius:14px;overflow:hidden;background:rgba(255,255,255,0.04);box-shadow:0 18px 60px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;min-height:320px;">'+
            '<button type="button" data-miualbum-prev="1" style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:9999px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.35);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:20;">‹</button>'+
            '<img data-miualbum-img="1" alt="" style="max-width:100%;max-height:90vh;display:block;object-fit:contain;transition:opacity 220ms ease-in-out;opacity:1;will-change:opacity;position:relative;z-index:1;pointer-events:none;" />'+
            '<button type="button" data-miualbum-next="1" style="position:absolute;right:12px;top:50%;transform:translateY(-50%);width:44px;height:44px;border-radius:9999px;border:1px solid rgba(255,255,255,0.25);background:rgba(0,0,0,0.35);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:20;">›</button>'+
          '</div>'+
        '</div>';
      document.body.appendChild(wrap);
      return wrap;
    };

    var state = { open: false, albumId: '', idx: 0, imgs: [], preloaded: {} };

    var preloadAll = function(albumId, imgs){
      try {
        if (!imgs || !imgs.length) return;
        if (!state.preloaded) state.preloaded = {};
        var key = String(albumId || '');
        if (!key) return;
        if (state.preloaded[key] === 1) return;
        state.preloaded[key] = 1;
        for (var i=0;i<imgs.length;i++) {
          try { var im = new Image(); im.decoding = 'async'; im.loading = 'eager'; im.src = imgs[i]; } catch(_e) {}
        }
      } catch(_e) {}
    };

    var setModalImage = function(modal, imgs, idx){
      try {
        var img = modal.querySelector('[data-miualbum-img="1"]');
        var count = modal.querySelector('[data-miualbum-count="1"]');
        if (!img) return;
        idx = Math.max(0, Math.min(imgs.length - 1, idx || 0));
        if (count) count.textContent = (idx + 1) + ' / ' + imgs.length;
        // fade
        try { img.style.transition = img.style.transition || 'opacity 220ms ease-in-out'; } catch(_e) {}
        try { img.style.opacity = '0'; } catch(_e) {}
        var nextSrc = imgs[idx];
        var preload = new Image();
        preload.onload = function(){
          try { img.setAttribute('src', nextSrc); } catch(_e) {}
          try { requestAnimationFrame(function(){ try { img.style.opacity = '1'; } catch(_e2) {} }); } catch(_e) { try { img.style.opacity = '1'; } catch(_e2) {} }
        };
        preload.src = nextSrc;
      } catch(_e) {}
    };

    var openAt = function(albumId, idx){
      var modal = ensureModal();
      var imgs = [];
      try {
        var nodes = document.querySelectorAll('[data-miu-album-item="1"][data-miu-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        for (var i=0;i<nodes.length;i++) {
          var s = nodes[i].getAttribute('data-src') || '';
          if (s) imgs.push(s);
        }
      } catch(e) {}
      if (!imgs.length) return;
      preloadAll(albumId, imgs);
      state.open = true;
      state.albumId = albumId;
      state.imgs = imgs;
      state.idx = Math.max(0, Math.min(imgs.length - 1, idx || 0));

      setModalImage(modal, imgs, state.idx);

      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden','false');
      try {
        modal.style.opacity = '0';
        var panel = modal.querySelector('[data-miualbum-panel="1"]');
        if (panel) { panel.style.transform = 'scale(0.985)'; panel.style.opacity = '0.98'; }
        requestAnimationFrame(function(){
          try { modal.style.opacity = '1'; } catch(_e) {}
          try { if (panel) { panel.style.transform = 'scale(1)'; panel.style.opacity = '1'; } } catch(_e) {}
        });
      } catch(_e) {}
    };

    var close = function(){
      var modal = document.getElementById(modalId);
      if (!modal) return;
      state.open = false;
      try {
        modal.style.opacity = '0';
        var panel = modal.querySelector('[data-miualbum-panel="1"]');
        if (panel) { panel.style.transform = 'scale(0.985)'; panel.style.opacity = '0.98'; }
        setTimeout(function(){
          try { modal.style.display = 'none'; } catch(_e) {}
          try { modal.setAttribute('aria-hidden','true'); } catch(_e) {}
        }, 180);
      } catch(_e) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden','true');
      }
    };

    var step = function(dir){
      var modal = document.getElementById(modalId);
      if (!modal || !state.open || !state.imgs || !state.imgs.length) return;
      state.idx = (state.idx + dir + state.imgs.length) % state.imgs.length;
      setModalImage(modal, state.imgs, state.idx);
    };

    var setSliderIdx = function(albumId, idx){
      try {
        var items = document.querySelectorAll('[data-miu-album-item="1"][data-miu-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        var src = '';
        var len = items ? items.length : 0;
        if (!len) return;
        idx = (Number(idx || 0) % len + len) % len;
        try { src = (items[idx] && items[idx].getAttribute) ? (items[idx].getAttribute('data-src') || '') : ''; } catch(_e) { src = ''; }
        if (!src) return;

        // preload whole album once
        try {
          var all = [];
          for (var ii=0;ii<len;ii++) {
            try { var ss = (items[ii] && items[ii].getAttribute) ? (items[ii].getAttribute('data-src') || '') : ''; if (ss) all.push(ss); } catch(_e) {}
          }
          preloadAll(albumId, all);
        } catch(_e) {}

        var mainImg = document.querySelector('[data-miu-album-main-img="1"][data-miu-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        if (mainImg) {
          try { mainImg.style.opacity = '0'; } catch(_e) {}
          var preload = new Image();
          preload.onload = function(){
            try { mainImg.setAttribute('src', src); } catch(_e) {}
            try { requestAnimationFrame(function(){ try { mainImg.style.opacity = '1'; } catch(_e2) {} }); } catch(_e) { try { mainImg.style.opacity = '1'; } catch(_e2) {} }
          };
          preload.src = src;
        }

        var thumbs = document.querySelectorAll('[data-miu-album-thumb="1"][data-miu-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        for (var i=0;i<thumbs.length;i++) {
          var th = thumbs[i];
          var isActive = String(th.getAttribute('data-idx')||'') === String(idx);
          try {
            if (isActive) {
              th.setAttribute('data-active','1');
              th.style.boxShadow = '0 0 0 2px rgba(236,72,153,0.95)';
            } else {
              th.removeAttribute('data-active');
              th.style.boxShadow = '0 0 0 1px rgba(0,0,0,0.08)';
            }
          } catch(_e) {}
        }

        var slider = document.querySelector('[data-miu-album-slider="1"][data-miu-album-id="' + albumId.replace(/"/g,'\"') + '"]');
        if (slider) slider.setAttribute('data-idx', String(idx));
      } catch(_e) {}
    };

    document.addEventListener('click', function(e){
      try {
        var t = e && e.target;
        if (!t) return;
        var mainBtn = t.closest ? t.closest('[data-miu-album-main="1"]') : null;
        if (mainBtn) {
          e.preventDefault();
          e.stopPropagation();
          var albumId0 = mainBtn.getAttribute('data-miu-album-id') || '';
          if (!albumId0) return;
          var slider0 = document.querySelector('[data-miu-album-slider="1"][data-miu-album-id="' + albumId0.replace(/"/g,'\"') + '"]');
          var idx0 = 0;
          try { idx0 = Number(slider0 ? (slider0.getAttribute('data-idx')||'0') : '0') || 0; } catch(_e) { idx0 = 0; }
          openAt(albumId0, idx0);
          return;
        }

        var prevBtn = t.closest ? t.closest('[data-miu-album-prev="1"]') : null;
        if (prevBtn) {
          e.preventDefault();
          e.stopPropagation();
          var aidp = prevBtn.getAttribute('data-miu-album-id') || '';
          var slp = document.querySelector('[data-miu-album-slider="1"][data-miu-album-id="' + aidp.replace(/"/g,'\"') + '"]');
          var curp = 0;
          try { curp = Number(slp ? (slp.getAttribute('data-idx')||'0') : '0') || 0; } catch(_e) { curp = 0; }
          setSliderIdx(aidp, curp - 1);
          return;
        }

        var nextBtn = t.closest ? t.closest('[data-miu-album-next="1"]') : null;
        if (nextBtn) {
          e.preventDefault();
          e.stopPropagation();
          var aidn = nextBtn.getAttribute('data-miu-album-id') || '';
          var sln = document.querySelector('[data-miu-album-slider="1"][data-miu-album-id="' + aidn.replace(/"/g,'\"') + '"]');
          var curn = 0;
          try { curn = Number(sln ? (sln.getAttribute('data-idx')||'0') : '0') || 0; } catch(_e) { curn = 0; }
          setSliderIdx(aidn, curn + 1);
          return;
        }

        var thumb = t.closest ? t.closest('[data-miu-album-thumb="1"]') : null;
        if (thumb) {
          e.preventDefault();
          e.stopPropagation();
          var aidt = thumb.getAttribute('data-miu-album-id') || '';
          var idxt = Number(thumb.getAttribute('data-idx') || '0') || 0;
          setSliderIdx(aidt, idxt);
          return;
        }

        var item = t.closest ? t.closest('[data-miu-album-item="1"]') : null;
        if (item) {
          e.preventDefault();
          e.stopPropagation();
          var albumId = item.getAttribute('data-miu-album-id') || '';
          var idx = Number(item.getAttribute('data-idx') || '0') || 0;
          if (albumId) openAt(albumId, idx);
          return;
        }
        var modal = t.closest ? t.closest('#' + modalId) : null;
        if (modal) {
          var closeBtn = (t.closest && t.closest('[data-miualbum-close="1"]')) ? t.closest('[data-miualbum-close="1"]') : null;
          if (closeBtn) { close(); return; }
          var prevBtn2 = (t.closest && t.closest('[data-miualbum-prev="1"]')) ? t.closest('[data-miualbum-prev="1"]') : null;
          if (prevBtn2) { step(-1); return; }
          var nextBtn2 = (t.closest && t.closest('[data-miualbum-next="1"]')) ? t.closest('[data-miualbum-next="1"]') : null;
          if (nextBtn2) { step(1); return; }
          // click backdrop
          if (t === modal) { close(); return; }
        }
      } catch(_e) {}
    }, true);

    document.addEventListener('keydown', function(e){
      try {
        if (!state.open) return;
        if (e.key === 'Escape') close();
        if (e.key === 'ArrowLeft') step(-1);
        if (e.key === 'ArrowRight') step(1);
      } catch(_e) {}
    }, true);

    // init sliders
    try {
      var sliders = document.querySelectorAll('[data-miu-album-slider="1"]');
      for (var i=0;i<sliders.length;i++) {
        var s = sliders[i];
        var aid = s.getAttribute('data-miu-album-id') || '';
        if (!aid) continue;
        if (!s.getAttribute('data-idx')) s.setAttribute('data-idx','0');
        setSliderIdx(aid, Number(s.getAttribute('data-idx')||'0')||0);

        // autoplay
        try {
          if (s.getAttribute('data-autoplay') !== '1') continue;
          if (s.getAttribute('data-autoplay-init') === '1') continue;
          s.setAttribute('data-autoplay-init','1');
          (function(sliderEl, albumId){
            var timer = null;
            var stop = function(){ try { if (timer) clearInterval(timer); } catch(_e) {} timer = null; };
            var start = function(){
              stop();
              timer = setInterval(function(){
                try {
                  var cur = Number(sliderEl.getAttribute('data-idx')||'0')||0;
                  setSliderIdx(albumId, cur + 1);
                } catch(_e) {}
              }, 2500);
            };
            sliderEl.addEventListener('pointerdown', stop, true);
            sliderEl.addEventListener('touchstart', stop, { passive: true, capture: true });
            sliderEl.addEventListener('mouseenter', stop, { passive: true });
            sliderEl.addEventListener('mouseleave', start, { passive: true });
            start();
          })(s, aid);
        } catch(_e) {}
      }
    } catch(_e) {}
  } catch(e) {}
})();
(function(){
  try {
    window.showThankYouModal = function(name) {
      var modal = document.getElementById('miuThankYouModal');
      var sheet = document.getElementById('miuThankYouSheet');
      var title = document.getElementById('miuThankYouTitle');
      if (title) {
        if (name) {
          title.textContent = 'Cảm ơn ' + name.trim() + '!';
        } else {
          title.textContent = 'Cảm ơn bạn rất nhiều!';
        }
      }
      if (modal) {
        modal.style.display = 'flex';
        modal.setAttribute('aria-hidden', 'false');
        setTimeout(function(){
          modal.style.opacity = '1';
          if (sheet) sheet.style.transform = 'translateY(0)';
        }, 10);
      }
    };

    window.hideThankYouModal = function() {
      var modal = document.getElementById('miuThankYouModal');
      var sheet = document.getElementById('miuThankYouSheet');
      if (modal) {
        modal.style.opacity = '0';
        if (sheet) sheet.style.transform = 'translateY(20px)';
        modal.setAttribute('aria-hidden', 'true');
        setTimeout(function(){
          modal.style.display = 'none';
        }, 300);
      }
    };

    var cBtn = document.getElementById('miuThankYouClose');
    var bgBtn = document.getElementById('miuThankYouBackdrop');
    if (cBtn) cBtn.addEventListener('click', window.hideThankYouModal, true);
    if (bgBtn) bgBtn.addEventListener('click', window.hideThankYouModal, true);
  } catch(e) {}
})();