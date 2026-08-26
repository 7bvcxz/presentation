/* ============================================================
   Prompter
   - index.html 과 같은 브라우저에서 열면 페이지 이동이 자동 동기화됩니다.
     (BroadcastChannel, 실패 시 localStorage 이벤트로 대체)
   - 리모컨(키보드)이 어느 창에 잡혀 있든 양쪽 모두에서 동작합니다.
   - 페이지마다 글자 크기를 화면에 꽉 차게 자동으로 키웁니다.
   ============================================================ */
(function () {
  'use strict';

  var PAGES = window.TALK || [];
  var elNum = document.getElementById('pnum');
  var elTot = document.getElementById('ptot');
  var elTitle = document.getElementById('ptitle');
  var elClicks = document.getElementById('clicks');
  var elClock = document.getElementById('clock');
  var elLink = document.getElementById('link');
  var elView = document.getElementById('view');
  var elBody = document.getElementById('body');
  var elNext = document.getElementById('next');
  var elToast = document.getElementById('toast');

  var TITLES = [];                       // deck 에서 받아 채움
  var state = { slide: 1, step: 0, maxStep: 0, total: PAGES.length };
  var shown = -1;                        // 현재 렌더된 페이지
  var scale = +(localStorage.getItem('pr-scale') || 1);
  var linked = false, linkTimer = null;

  /* ---------- 채널 ---------- */
  var CH = null;
  try { CH = new BroadcastChannel('deck-sync'); } catch (e) { CH = null; }

  function send(msg) {
    msg.from = 'prompter';
    try { if (CH) CH.postMessage(msg); } catch (e) {}
    try { localStorage.setItem('deck-nav', JSON.stringify(msg) + '|' + Math.random()); } catch (e) {}
  }
  function onMessage(m) {
    if (!m || m.from === 'prompter' || m.type !== 'state') return;
    markLinked();
    if (m.titles) TITLES = m.titles;
    state = m;
    paint();
  }
  if (CH) CH.onmessage = function (e) { onMessage(e.data); };
  window.addEventListener('storage', function (e) {
    if (e.key !== 'deck-state' || !e.newValue) return;
    try { onMessage(JSON.parse(e.newValue.split('|')[0])); } catch (err) {}
  });

  function markLinked() {
    linked = true;
    elLink.textContent = '● 슬라이드 연결됨';
    elLink.className = 'on';
    clearTimeout(linkTimer);
    linkTimer = setTimeout(function () {
      linked = false;
      elLink.textContent = '연결 끊김 — 발표 창을 확인하세요';
      elLink.className = '';
    }, 20000);
  }

  /* ---------- 대본 → HTML ---------- */
  function esc(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function render(text) {
    var out = [];
    var blocks = text.replace(/\r/g, '').trim().split(/\n\s*\n/);
    blocks.forEach(function (b) {
      var lines = b.split('\n').map(function (l) { return l.trim(); })
                   .filter(function (l) { return l.length; });
      var buf = [];
      function flush() {
        if (!buf.length) return;
        var isList = buf.every(function (l) { return /^(·|\d\d\s)/.test(l); });
        var html = buf.map(esc).join('<br>')
          .replace(/🍏/g, '<i class="cue">🍏</i>')
          .replace(/(\(\s*[^()]*쉬고\s*\))/g, '<span class="pause">$1</span>');
        out.push('<p' + (isList ? ' class="list"' : '') + '>' + html + '</p>');
        buf = [];
      }
      lines.forEach(function (l) {
        if (l.indexOf('## ') === 0) { flush(); out.push('<h3>' + esc(l.slice(3)) + '</h3>'); }
        else buf.push(l);
      });
      flush();
    });
    return out.join('');
  }

  /* ---------- 글자 크기 자동 맞춤 ---------- */
  var MIN = 20, MAX = 150, RESCUE_UNDER = 32;   // 1열이 이보다 작아질 때만 2열로 구제

  /* column-fill:auto 인 multicol 은 넘친 내용이 "가로"로 밀리므로
     높이가 아니라 폭으로 넘침을 판정해야 한다. (1열도 동일) */
  function availH() {
    var cs = getComputedStyle(elView);
    return elView.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 2;
  }
  function fits(fs, cols) {
    elBody.style.height = availH() + 'px';
    elBody.style.columnFill = 'auto';
    elBody.style.columnCount = cols;
    elBody.style.fontSize = fs + 'px';
    return elBody.scrollWidth <= elBody.clientWidth + 2;
  }
  function search(cols) {
    var lo = MIN, hi = MAX, best = 0;
    while (lo <= hi) {
      var mid = (lo + hi) >> 1;
      if (fits(mid, cols)) { best = mid; lo = mid + 1; } else { hi = mid - 1; }
    }
    return best;
  }
  function fit() {
    var one = search(1), two = 0, cols = 1, best = one;
    /* 프롬프터는 1열이 원칙. 눈이 좌우로 튀면 읽던 자리를 놓친다.
       1열로 너무 작아지는 페이지에서만 2열로 구제한다. */
    if (one < RESCUE_UNDER) {
      two = search(2);
      if (two > one) { cols = 2; best = two; }
    }
    if (!best) best = MIN;                       // 최소 크기로도 안 들어가면 스크롤 허용
    var size = Math.max(MIN, Math.round(best * scale));
    if (fits(size, cols)) {
      elView.style.overflowY = 'hidden';         // 한 화면에 전부 들어감
    } else {
      elBody.style.height = 'auto';              // 확대 등으로 넘치면 세로 스크롤
      elBody.style.columnFill = 'balance';
      elView.style.overflowY = 'auto';
    }
    elBody.dataset.fit = best + 'px/' + cols + 'col (1col ' + one + ', 2col ' + (two || '-') + ')';
  }

  /* ---------- 화면 갱신 ---------- */
  function pageOf(n) {
    for (var i = 0; i < PAGES.length; i++) if (PAGES[i].page === n) return PAGES[i];
    return null;
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }

  function paint() {
    var n = state.slide;
    elNum.textContent = pad(n);
    elTot.textContent = '/ ' + pad(state.total || PAGES.length);
    elTitle.textContent = TITLES[n - 1] || (pageOf(n) ? '' : '—');
    elClicks.innerHTML = '클릭 <b>' + state.step + '</b> / ' + state.maxStep;

    var nt = TITLES[n] ? TITLES[n] : null;
    elNext.innerHTML = nt ? '다음 · <b>' + esc(nt) + '</b>'
                          : (n >= (state.total || PAGES.length) ? '<b>마지막 페이지</b> — Q&amp;A' : '');

    if (shown !== n) {
      var p = pageOf(n);
      elBody.innerHTML = p ? render(p.body) : '<p class="list">이 페이지의 대본이 없습니다. (talk-script.js)</p>';
      shown = n;
      elView.scrollTop = 0;
      fit();
    }
    if (n > 1) startClock();
  }

  /* ---------- 타이머 ---------- */
  var t0 = 0, acc = 0, running = false, tick = null;
  function fmt(ms) {
    var s = Math.floor(ms / 1000);
    return pad(Math.floor(s / 60)) + ':' + pad(s % 60);
  }
  function paintClock() {
    var ms = acc + (running ? Date.now() - t0 : 0);
    elClock.innerHTML = '<b>' + fmt(ms) + '</b>';
    elClock.className = 'pill' + (running ? ' run' : '');
  }
  function startClock() {
    if (running) return;
    running = true; t0 = Date.now();
    tick = setInterval(paintClock, 500); paintClock();
  }
  function pauseClock() {
    if (!running) return;
    acc += Date.now() - t0; running = false;
    clearInterval(tick); paintClock();
  }
  function resetClock() { pauseClock(); acc = 0; paintClock(); }

  /* ---------- 토스트 ---------- */
  var toastTimer = null;
  function toast(msg) {
    elToast.textContent = msg;
    elToast.className = 'on';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { elToast.className = ''; }, 1100);
  }

  /* ---------- 입력 ---------- */
  function setScale(v) {
    scale = Math.min(1.8, Math.max(0.6, Math.round(v * 20) / 20));
    localStorage.setItem('pr-scale', scale);
    fit();
    toast('글자 ' + Math.round(scale * 100) + '%');
  }

  document.addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'ArrowRight' || k === ' ' || k === 'PageDown' || k === 'Enter') { e.preventDefault(); send({ type: 'nav', dir: 'next' }); }
    else if (k === 'ArrowLeft' || k === 'PageUp' || k === 'Backspace') { e.preventDefault(); send({ type: 'nav', dir: 'prev' }); }
    else if (k === 'ArrowDown') { e.preventDefault(); send({ type: 'nav', dir: 'nextSlide' }); }
    else if (k === 'ArrowUp') { e.preventDefault(); send({ type: 'nav', dir: 'prevSlide' }); }
    else if (k === 'Home') { e.preventDefault(); send({ type: 'nav', dir: 'home' }); }
    else if (k === 'End') { e.preventDefault(); send({ type: 'nav', dir: 'end' }); }
    else if (k === '+' || k === '=') setScale(scale + 0.05);
    else if (k === '-' || k === '_') setScale(scale - 0.05);
    else if (k === '0') setScale(1);
    else if (k === 's' || k === 'S') { running ? pauseClock() : startClock(); toast(running ? '타이머 시작' : '타이머 일시정지'); }
    else if (k === 'r' || k === 'R') { resetClock(); toast('타이머 리셋'); }
    else if (k === 't' || k === 'T') {
      document.body.classList.toggle('light');
      localStorage.setItem('pr-light', document.body.classList.contains('light') ? '1' : '');
      fit();
    }
    else if (k === 'f' || k === 'F') {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen();
      else document.exitFullscreen();
    }
  });
  window.addEventListener('resize', fit);

  /* ---------- 시작 ---------- */
  if (localStorage.getItem('pr-light')) document.body.classList.add('light');
  state.total = PAGES.length;
  paint();
  pauseClock(); acc = 0; paintClock();
  send({ type: 'nav', dir: 'hello' });          // 이미 열려 있는 발표 창에 현재 위치 요청
  setInterval(function () { if (!linked) send({ type: 'nav', dir: 'hello' }); }, 3000);
})();
