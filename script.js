/* ============================================================
   Presentation Engine
   - fixed 1920x1080 stage, uniformly scaled to viewport
   - per-slide step reveal ([data-step] / [data-out])
   - keyboard + click navigation, speaker notes, counters
   ============================================================ */
(function () {
  'use strict';

  var stage  = document.getElementById('stage');
  var deck   = document.getElementById('deck');
  var slides = Array.prototype.slice.call(stage.querySelectorAll('.slide'));
  var bar    = document.getElementById('progress');
  var pager  = document.getElementById('pager');
  var notes  = document.getElementById('notes');
  var nBody  = document.getElementById('nBody');
  var nPage  = document.getElementById('nPage');
  var help   = document.getElementById('help');

  var cur = 0, step = 0;

  /* ---------- stage scaling ---------- */
  function fit() {
    var s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = 'translate(-50%, -50%) scale(' + s + ')';
  }
  window.addEventListener('resize', fit);

  /* ---------- step model ---------- */
  function maxStep(slide) {
    var m = 0;
    slide.querySelectorAll('[data-step]').forEach(function (el) {
      m = Math.max(m, +el.dataset.step || 0);
    });
    slide.querySelectorAll('[data-out]').forEach(function (el) {
      m = Math.max(m, +el.dataset.out || 0);
    });
    return m;
  }
  var stepsOf = slides.map(maxStep);
  var totalSteps = stepsOf.reduce(function (a, b) { return a + b + 1; }, 0);

  /* stagger delays for grouped reveals */
  slides.forEach(function (sl) {
    sl.querySelectorAll('[data-stagger]').forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) {
        c.style.setProperty('--d', (i * 85) + 'ms');
      });
    });
  });

  /* ---------- counters ---------- */
  function runCounter(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    var target = +el.dataset.count, t0 = null, dur = 950;
    function tick(t) {
      if (t0 === null) t0 = t;
      var p = Math.min(1, (t - t0) / dur);
      var e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(target * e).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target.toLocaleString('en-US');
    }
    requestAnimationFrame(tick);
  }

  /* ---------- render ---------- */
  function paint(slide, st) {
    slide.querySelectorAll('[data-step]').forEach(function (el) {
      var on = st >= (+el.dataset.step);
      el.classList.toggle('on', on);
      if (on) el.querySelectorAll('.num[data-count]').forEach(runCounter);
    });
    slide.querySelectorAll('[data-out]').forEach(function (el) {
      el.classList.toggle('out', st >= (+el.dataset.out));
    });
    if (slide.dataset.darkAt) {
      slide.classList.toggle('dark', st >= (+slide.dataset.darkAt));
    }
  }

  function chrome() {
    var done = 0;
    for (var i = 0; i < cur; i++) done += stepsOf[i] + 1;
    done += step + 1;
    bar.style.width = (done / totalSteps * 100) + '%';
    pager.innerHTML = '<span class="cur">' + pad(cur + 1) + '</span> / ' + pad(slides.length);
    nPage.textContent = pad(cur + 1) + ' / ' + pad(slides.length) +
                        (stepsOf[cur] ? '  ·  STEP ' + step + '/' + stepsOf[cur] : '');
    var tpl = slides[cur].querySelector('template.notes');
    nBody.innerHTML = tpl ? tpl.innerHTML : '<p class="muted">—</p>';
    if (location.hash !== '#/' + (cur + 1)) history.replaceState(null, '', '#/' + (cur + 1));
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function show(i, st) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    st = Math.max(0, Math.min(stepsOf[i], st));
    var changed = i !== cur;
    var prev = slides[cur];
    cur = i; step = st;
    paint(slides[cur], step);
    if (changed || !slides[cur].classList.contains('active')) {
      slides.forEach(function (s) { if (s !== slides[cur]) s.classList.remove('active'); });
      slides[cur].classList.add('active');
      if (prev && prev !== slides[cur]) {
        prev.classList.add('leaving');
        setTimeout(function () { prev.classList.remove('leaving'); }, 600);
      }
    }
    document.body.classList.toggle('on-dark', slides[cur].classList.contains('dark'));
    chrome();
  }

  function next() {
    if (step < stepsOf[cur]) show(cur, step + 1);
    else if (cur < slides.length - 1) show(cur + 1, 0);
  }
  function prev() {
    if (step > 0) show(cur, step - 1);
    else if (cur > 0) show(cur - 1, stepsOf[cur - 1]);
  }
  function nextSlide() { if (cur < slides.length - 1) show(cur + 1, 0); }
  function prevSlide() { if (cur > 0) show(cur - 1, 0); }

  /* ---------- input ---------- */
  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'Escape') { notes.classList.remove('open'); help.classList.remove('open'); return; }
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); next(); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); prev(); }
    else if (k === 'ArrowDown') { e.preventDefault(); nextSlide(); }
    else if (k === 'ArrowUp') { e.preventDefault(); prevSlide(); }
    else if (k === 'Home') { e.preventDefault(); show(0, 0); }
    else if (k === 'End') { e.preventDefault(); show(slides.length - 1, stepsOf[slides.length - 1]); }
    else if (k === 'f' || k === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
    else if (k === 'n' || k === 'N') notes.classList.toggle('open');
    else if (k === '?' || k === '/') help.classList.toggle('open');
    else if (k >= '1' && k <= '9' && e.altKey) show(+k - 1, 0);
  });

  deck.addEventListener('click', function (e) { if (e.button === 0) next(); });
  deck.addEventListener('contextmenu', function (e) { e.preventDefault(); prev(); });
  help.addEventListener('click', function (e) { e.stopPropagation(); help.classList.remove('open'); });
  notes.addEventListener('click', function (e) { e.stopPropagation(); });

  /* touch */
  var tx = 0;
  deck.addEventListener('touchstart', function (e) { tx = e.changedTouches[0].clientX; }, { passive: true });
  deck.addEventListener('touchend', function (e) {
    var d = e.changedTouches[0].clientX - tx;
    if (Math.abs(d) > 60) { d < 0 ? next() : prev(); }
  }, { passive: true });

  /* ---------- optional screenshots (assets/modulo-*.png) ---------- */
  (function shots() {
    var strip = document.getElementById('shotstrip');
    if (!strip) return;
    var found = 0, pending = 0;
    ['png', 'jpg', 'jpeg', 'webp'].forEach(function (ext) {
      for (var n = 1; n <= 4; n++) {
        (function (src) {
          pending++;
          var img = new Image();
          img.onload = function () {
            if (found >= 4) return;
            found++;
            var f = document.createElement('div');
            f.className = 'shot';
            f.appendChild(img);
            strip.appendChild(f);
            strip.hidden = false;
          };
          img.onerror = function () { pending--; };
          img.src = src;
        })('assets/modulo-' + n + '.' + ext);
      }
    });
  })();

  /* ---------- boot ---------- */
  fit();
  var h = /^#\/(\d+)$/.exec(location.hash);
  show(h ? Math.min(slides.length, +h[1]) - 1 : 0, 0);
  window.addEventListener('load', fit);
})();
