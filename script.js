const themeButton = document.querySelector("#theme-toggle");

// 原生 button 支援滑鼠、Enter 與空白鍵，不需要額外鍵盤事件。
themeButton.addEventListener("click", () => {
  const isLight = document.documentElement.dataset.theme !== "light";
  document.documentElement.dataset.theme = isLight ? "light" : "dark";
  themeButton.setAttribute("aria-pressed", String(isLight));
  themeButton.textContent = isLight ? "切換為深色" : "切換為淺色";
}); (function () {
  'use strict';

  /* ---------- localStorage 安全包裝 ---------- */
  function load(key, fallback) {
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : v;
    } catch (e) {
      return fallback;
    }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* 忽略 */ }
  }

  var root = document.documentElement;

  /* ---------- 深淺色切換 ---------- */
  var toggle = null;
  var media = window.matchMedia('(prefers-color-scheme: dark)');

  function currentTheme() {
    var saved = root.getAttribute('data-theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return media.matches ? 'dark' : 'light';
  }

  function renderToggle() {
    if (!toggle) return;
    var isDark = currentTheme() === 'dark';
    toggle.setAttribute('aria-pressed', String(isDark));
    toggle.querySelector('.theme-icon').textContent = isDark ? '☀️' : '🌙';
    toggle.querySelector('.theme-label').textContent = isDark ? '淺色模式' : '深色模式';
    toggle.setAttribute('aria-label', isDark ? '切換為淺色模式' : '切換為深色模式');
  }

  var savedTheme = load('et-theme', '');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    root.setAttribute('data-theme', savedTheme);
  }

  function init() {
    toggle = document.getElementById('theme-toggle');
    if (toggle) {
      // <button> 原生支援 Enter / Space 鍵盤操作
      toggle.addEventListener('click', function () {
        var next = currentTheme() === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', next);
        save('et-theme', next);
        renderToggle();
      });
      renderToggle();
    }
    media.addEventListener && media.addEventListener('change', renderToggle);

    initShape();
    initCrimes();

    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------- 成形進度 ---------- */
  function initShape() {
    var meter = document.getElementById('shape-meter');
    var value = document.getElementById('shape-value');
    var msg = document.getElementById('shape-msg');
    var feed = document.getElementById('feed-btn');
    var reset = document.getElementById('reset-btn');
    var svg = document.getElementById('cat-svg');
    if (!meter || !feed || !reset) return;

    var level = parseInt(load('et-shape', '60'), 10);
    if (isNaN(level) || level < 0 || level > 100) level = 60;

    function message(n) {
      if (n >= 100) return 'ET 已達完全體：圓得像一顆湯圓，沙發被壓出凹洞。';
      if (n >= 80) return 'ET 看起來已經快要滾動前進了。';
      if (n >= 60) return 'ET 的肚子開始有存在感。';
      if (n >= 30) return 'ET 還算輕盈，但潛力無限。';
      return 'ET 目前還是一隻苗條的貓（這很罕見）。';
    }

    function render() {
      meter.value = level;
      meter.textContent = level + '%';
      value.textContent = level + '%';
      msg.textContent = message(level);
      if (svg) {
        // 身體水平放大：0% → 0.85 倍，100% → 1.25 倍
        svg.style.setProperty('--fat', (0.85 + (level / 100) * 0.4).toFixed(3));
        var body = svg.querySelector('#cat-body');
        if (body) body.style.setProperty('--fat', (0.85 + (level / 100) * 0.4).toFixed(3));
      }
      feed.disabled = level >= 100;
      save('et-shape', String(level));
    }

    feed.addEventListener('click', function () {
      level = Math.min(100, level + 5);
      render();
    });
    reset.addEventListener('click', function () {
      level = 60;
      render();
    });
    render();
  }

  /* ---------- 作惡清單計數 ---------- */
  function initCrimes() {
    var items = document.querySelectorAll('.crime');
    var totalEl = document.getElementById('total-count');
    var counts = {};

    try {
      counts = JSON.parse(load('et-crimes', '{}')) || {};
    } catch (e) {
      counts = {};
    }

    function render() {
      var total = 0;
      items.forEach(function (li) {
        var id = li.getAttribute('data-crime');
        var n = Number(counts[id]) || 0;
        li.querySelector('.count').textContent = n;
        total += n;
      });
      if (totalEl) totalEl.textContent = total;
    }

    items.forEach(function (li) {
      var btn = li.querySelector('.add-crime');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var id = li.getAttribute('data-crime');
        counts[id] = (Number(counts[id]) || 0) + 1;
        save('et-crimes', JSON.stringify(counts));
        render();
      });
    });

    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
