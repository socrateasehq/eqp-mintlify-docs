// Make sidebar categories (ATS, Assessments, ...) collapsible.
// Mintlify renders top-level groups as static headings, so the toggle is added here.
// Defaults: the category holding the current page is open, the rest are closed, which
// keeps a 112-article sidebar scannable. Only explicit clicks persist (sessionStorage).
(function () {
  var OPENED = 'eqpOpened';
  var CLOSED = 'eqpClosed';

  function load(key) {
    try {
      return JSON.parse(sessionStorage.getItem(key)) || [];
    } catch (e) {
      return [];
    }
  }

  function store(key, list) {
    try {
      sessionStorage.setItem(key, JSON.stringify(list));
    } catch (e) {
      /* private mode: defaults still work, they just do not persist */
    }
  }

  function remember(key, name, add) {
    var list = load(key);
    var i = list.indexOf(name);
    if (add && i === -1) list.push(name);
    if (!add && i !== -1) list.splice(i, 1);
    store(key, list);
  }

  function chevron() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '2.5');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('class', 'eqp-chevron');
    svg.style.cssText =
      'width:0.75rem;height:0.75rem;margin-left:auto;flex-shrink:0;opacity:0.45;transition:transform .18s ease;';
    var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M6 9l6 6 6-6');
    svg.appendChild(path);
    return svg;
  }

  function wire(title) {
    var header = title.parentElement;
    if (!header || header.dataset.eqpCollapsible) return;

    var list = header.nextElementSibling;
    if (!list || list.tagName !== 'UL') return;

    var name = (title.textContent || '').trim();
    header.dataset.eqpCollapsible = '1';
    header.style.cursor = 'pointer';
    header.style.userSelect = 'none';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.appendChild(chevron());

    var open = false;

    function render(isOpen, animate) {
      open = isOpen;
      var arrow = header.querySelector('.eqp-chevron');
      list.style.overflow = 'hidden';
      list.style.transition = animate ? 'max-height .2s ease, opacity .15s ease' : 'none';
      list.style.maxHeight = isOpen ? list.scrollHeight + 'px' : '0px';
      list.style.opacity = isOpen ? '1' : '0';
      if (arrow) arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(-90deg)';
      if (isOpen) {
        // Release the cap so nested subcategories can expand freely afterwards.
        setTimeout(
          function () {
            if (open) list.style.maxHeight = 'none';
          },
          animate ? 220 : 0
        );
      }
    }

    // Recomputed on every page load: active category wins unless the user closed it.
    function defaultOpen() {
      var hasActive = !!list.querySelector('a[aria-current="page"]');
      if (load(OPENED).indexOf(name) !== -1) return true;
      if (load(CLOSED).indexOf(name) !== -1) return false;
      return hasActive;
    }

    render(defaultOpen(), false);
    header.dataset.eqpSync = '1';

    header.addEventListener('click', function () {
      var next = !open;
      if (next) list.style.maxHeight = list.scrollHeight + 'px';
      render(next, true);
      remember(OPENED, name, next);
      remember(CLOSED, name, !next);
    });

    // Re-evaluate once the active link is marked, in case we ran before hydration.
    header._eqpRefresh = function () {
      if (!header.dataset.eqpTouched) render(defaultOpen(), false);
    };
    header.addEventListener('click', function () {
      header.dataset.eqpTouched = '1';
    });
  }

  function setup() {
    var titles = document.querySelectorAll('h3.sidebar-title');
    if (!titles.length) return false;
    titles.forEach(wire);
    return true;
  }

  // "What's Equip?" link plus a home icon beside the sidebar logo.
  function logoRowLinks() {
    var logo = document.querySelector('img.nav-logo');
    if (!logo || !logo.parentElement) return;
    var row = logo.parentElement.parentElement;
    if (!row || row.querySelector('.eqp-links')) return;

    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.justifyContent = 'space-between';
    row.style.gap = '0.375rem';
    row.style.overflow = 'visible';

    var wrap = document.createElement('div');
    wrap.className = 'eqp-links';
    wrap.style.cssText = 'display:flex;align-items:center;gap:0.375rem;flex-shrink:0;';

    function hover(el) {
      el.onmouseenter = function () {
        this.style.color = '#1F3B88';
      };
      el.onmouseleave = function () {
        this.style.color = '#6b7280';
      };
    }

    var intro = document.createElement('a');
    intro.href = '/what-is-equip';
    intro.textContent = "What's Equip?";
    intro.title = 'Equip in 10 Sentences';
    intro.style.cssText =
      'color:#6b7280;font-size:0.6875rem;font-weight:500;white-space:nowrap;text-decoration:none;' +
      'transition:color .15s;line-height:1;';
    hover(intro);

    var home = document.createElement('a');
    home.href = 'https://equip.co';
    home.target = '_blank';
    home.rel = 'noopener noreferrer';
    home.title = 'Go to equip.co';
    home.setAttribute('aria-label', 'Go to equip.co');
    home.style.cssText =
      'color:#6b7280;display:flex;align-items:center;flex-shrink:0;transition:color .15s;';
    home.innerHTML =
      '<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" ' +
      'stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V9.5z"/></svg>';
    hover(home);

    wrap.appendChild(intro);
    wrap.appendChild(home);
    row.appendChild(wrap);
  }

  function refresh() {
    document.querySelectorAll('h3.sidebar-title').forEach(function (t) {
      var h = t.parentElement;
      if (h && h._eqpRefresh) h._eqpRefresh();
    });
  }

  var attempts = 0;
  var timer = setInterval(function () {
    setup();
    refresh();
    logoRowLinks();
    if (++attempts > 25) clearInterval(timer);
  }, 200);

  new MutationObserver(function () {
    setup();
    refresh();
    logoRowLinks();
  }).observe(document.body, { childList: true, subtree: true });
})();
