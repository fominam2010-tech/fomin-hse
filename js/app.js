(function () {
  'use strict';

  var doc = document;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- шапка ---------- */
  var header = doc.querySelector('.site-header');
  function updateHeader() {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 16);
  }

  /* ---------- меню ---------- */
  var burger = doc.getElementById('burger');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = doc.body.classList.toggle('nav-open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    doc.querySelectorAll('.nav a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 900 && link.classList.contains('nav-sub-trigger')) return;
        doc.body.classList.remove('nav-open');
        burger.setAttribute('aria-expanded', 'false');
      });
    });
    doc.querySelectorAll('.nav-sub-trigger').forEach(function (trigger) {
      trigger.addEventListener('click', function (e) {
        if (window.innerWidth > 900) return;
        e.preventDefault();
        trigger.parentNode.classList.toggle('is-open');
      });
    });
  }

  /* ---------- линия прогресса ---------- */
  var progress = doc.getElementById('progress');
  function updateProgress() {
    if (!progress) return;
    var h = doc.documentElement.scrollHeight - window.innerHeight;
    var p = h > 0 ? (window.scrollY / h) * 100 : 0;
    progress.style.width = Math.min(100, Math.max(0, p)) + '%';
  }

  /* ---------- кнопка наверх ---------- */
  var toTop = doc.getElementById('toTop');
  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    var toggleToTop = function () {
      toTop.classList.toggle('is-visible', window.scrollY > 720);
    };
    window.addEventListener('scroll', toggleToTop, { passive: true });
    toggleToTop();
  }

  /* ---------- появление блоков ---------- */
  var revealItems = doc.querySelectorAll('[data-reveal]');
  if (revealItems.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
      revealItems.forEach(function (el) { io.observe(el); });
    } else {
      revealItems.forEach(function (el) { el.classList.add('is-in'); });
    }
  }

  /* ---------- параллакс ---------- */
  var parallaxItems = doc.querySelectorAll('[data-parallax]');
  var parallaxEnabled = parallaxItems.length && !reduceMotion && window.innerWidth > 900;
  if (parallaxEnabled) {
    var raf = null;
    var applyParallax = function () {
      var y = window.scrollY;
      parallaxItems.forEach(function (el) {
        var depth = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        el.style.transform = 'translate3d(0,' + (y * depth).toFixed(2) + 'px,0)';
      });
      raf = null;
    };
    window.addEventListener('scroll', function () {
      if (raf === null) raf = window.requestAnimationFrame(applyParallax);
    }, { passive: true });
  }

  /* ---------- модальное окно заявки ---------- */
  var modal = doc.getElementById('orderModal');

  var MAIL_TO = 'fam-1981@yandex.ru';

  function sendByMail(subject, lines, copyFieldId) {
    var body = lines.filter(function (line) {
      var value = line.slice(line.indexOf(':') + 1).trim();
      return value !== '';
    }).join('\n');
    var field = copyFieldId ? doc.getElementById(copyFieldId) : null;
    if (field) field.value = subject + '\n\n' + body;
    window.location.href = 'mailto:' + MAIL_TO +
      '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
  }

  var orderForm = doc.getElementById('orderForm');
  var orderSuccess = doc.getElementById('orderSuccess');
  var courseSearch = doc.getElementById('courseSearch');
  var coursePicker = doc.getElementById('coursePicker');
  var courseValue = doc.getElementById('courseValue');
  var courseHint = doc.getElementById('courseHint');

  function pickCourse(id) {
    var items = doc.querySelectorAll('.picker-item');
    var chosen = null;
    items.forEach(function (item) {
      var match = item.getAttribute('data-id') === String(id);
      item.classList.toggle('is-selected', match);
      if (match) chosen = item;
    });
    if (chosen) {
      courseValue.value = String(id);
      courseHint.textContent = 'Выбрано: ' + chosen.getAttribute('data-title');
      courseHint.classList.add('is-set');
      if (coursePicker) coursePicker.style.display = 'none';
      if (courseSearch) courseSearch.value = chosen.getAttribute('data-title');

      var customField = doc.getElementById('customCourseField');
      var customInput = doc.getElementById('customCourse');
      var isCustom = String(id) === 'custom';
      if (customField) customField.hidden = !isCustom;
      if (customInput) {
        if (isCustom) {
          setTimeout(function () { customInput.focus(); }, 60);
        } else {
          customInput.value = '';
        }
      }
    }
  }

  function openModal(id) {
    if (!modal) return;
    doc.body.classList.remove('nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    doc.body.style.overflow = 'hidden';
    if (id) pickCourse(id);
    else if (courseSearch) {
      setTimeout(function () { courseSearch.focus({ preventScroll: true }); }, 80);
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    doc.body.style.overflow = '';
  }

  doc.addEventListener('click', function (e) {
    var opener = e.target.closest('[data-open-order]');
    if (opener) {
      e.preventDefault();
      openModal(opener.getAttribute('data-course') || null);
      return;
    }
    if (e.target.closest('[data-close-order]')) {
      e.preventDefault();
      closeModal();
    }
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) closeModal();
  });

  if (courseSearch && coursePicker) {
    courseSearch.addEventListener('focus', function () {
      coursePicker.style.display = '';
    });
    courseSearch.addEventListener('input', function () {
      var q = courseSearch.value.trim().toLowerCase();
      coursePicker.style.display = '';
      doc.querySelectorAll('.picker-item').forEach(function (item) {
        var hit = item.textContent.toLowerCase().indexOf(q) !== -1;
        item.style.display = hit ? '' : 'none';
      });
      doc.querySelectorAll('.picker-group').forEach(function (group) {
        var any = Array.prototype.some.call(
          group.parentNode.querySelectorAll('.picker-item'),
          function (item) { return item.style.display !== 'none'; }
        );
        group.style.display = any ? '' : 'none';
      });
    });
    coursePicker.addEventListener('click', function (e) {
      var item = e.target.closest('.picker-item');
      if (item) pickCourse(item.getAttribute('data-id'));
    });
  }

  if (orderForm) {
    orderForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var customInput = doc.getElementById('customCourse');
      var isCustom = courseValue.value === 'custom';
      if (!courseValue.value || (isCustom && customInput && !customInput.value.trim())) {
        courseHint.textContent = isCustom
          ? 'Напишите название курса — без этого заявку не принять'
          : 'Выберите курс из списка — без этого заявку не принять';
        courseHint.classList.remove('is-set');
        courseHint.style.color = '#e06c5a';
        if (coursePicker) coursePicker.style.display = '';
        if (isCustom && customInput) customInput.focus();
        else if (courseSearch) courseSearch.focus();
        return;
      }
      if (!orderForm.checkValidity()) {
        orderForm.reportValidity();
        return;
      }
      var selected = doc.querySelector('.picker-item.is-selected');
      var name = isCustom
        ? customInput.value.trim()
        : (selected ? selected.getAttribute('data-title') : (courseValue.value || 'курс'));
      var successText = doc.getElementById('successCourse');
      if (successText) successText.textContent = name;

      var orderData = new FormData(orderForm);
      sendByMail('Заявка на курс: ' + name, [
        'Курс: ' + name,
        'Компания: ' + (orderData.get('company') || ''),
        'Контактное лицо: ' + (orderData.get('person') || ''),
        'Телефон: ' + (orderData.get('phone') || ''),
        'Email: ' + (orderData.get('email') || ''),
        'Город: ' + (orderData.get('city') || ''),
        'Адрес проведения: ' + (orderData.get('address') || ''),
        'Дата: ' + (orderData.get('date') || ''),
        'Человек: ' + (orderData.get('people') || ''),
        'Комментарий: ' + (orderData.get('comment') || '')
      ], 'orderCopy');

      orderForm.hidden = true;
      if (orderSuccess) orderSuccess.hidden = false;
      modal.scrollTop = 0;
      var panel = modal.querySelector('.modal__panel');
      if (panel) panel.scrollTop = 0;
    });
  }

  /* повторное открытие формы, если заказ открыли после успешной отправки */
  doc.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-order]') && orderForm && orderForm.hidden) {
      orderForm.hidden = false;
      if (orderSuccess) orderSuccess.hidden = true;
    }
  });

  /* ---------- окно заявки на услугу ---------- */
  var serviceModal = doc.getElementById('serviceModal');
  var serviceForm = doc.getElementById('serviceForm');
  var serviceSuccess = doc.getElementById('serviceSuccess');

  function openService() {
    if (!serviceModal) return;
    doc.body.classList.remove('nav-open');
    if (burger) burger.setAttribute('aria-expanded', 'false');
    serviceModal.classList.add('is-open');
    serviceModal.setAttribute('aria-hidden', 'false');
    doc.body.style.overflow = 'hidden';
    if (serviceForm && serviceForm.hidden) {
      serviceForm.hidden = false;
      if (serviceSuccess) serviceSuccess.hidden = true;
    }
    var select = doc.getElementById('serviceSelect');
    if (select) setTimeout(function () { select.focus({ preventScroll: true }); }, 80);
  }

  function closeService() {
    if (!serviceModal) return;
    serviceModal.classList.remove('is-open');
    serviceModal.setAttribute('aria-hidden', 'true');
    doc.body.style.overflow = '';
  }

  doc.addEventListener('click', function (e) {
    if (e.target.closest('[data-open-service]')) {
      e.preventDefault();
      openService();
      return;
    }
    if (e.target.closest('[data-close-service]')) {
      e.preventDefault();
      closeService();
    }
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && serviceModal && serviceModal.classList.contains('is-open')) closeService();
  });

  if (serviceForm) {
    serviceForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!serviceForm.checkValidity()) {
        serviceForm.reportValidity();
        return;
      }
      var select = doc.getElementById('serviceSelect');
      var label = select && select.selectedIndex >= 0 ? select.options[select.selectedIndex].text : 'услуга';
      var out = doc.getElementById('successService');
      if (out) out.textContent = label;
      serviceForm.hidden = true;
      if (serviceSuccess) serviceSuccess.hidden = false;
      var panel = serviceModal.querySelector('.modal__panel');
      if (panel) panel.scrollTop = 0;
    });
  }

  /* ---------- каталог ---------- */
  var grid = doc.getElementById('catalogGrid');
  if (grid) {
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.course-card'));
    var counter = doc.getElementById('catalogCount');
    var empty = doc.getElementById('catalogEmpty');
    var state = { aud: 'all', cat: 'all', q: '' };

    var applyFilters = function () {
      var shown = 0;
      cards.forEach(function (card) {
        var okAud = state.aud === 'all' || card.getAttribute('data-aud') === state.aud;
        var okCat = state.cat === 'all' || card.getAttribute('data-cat') === state.cat;
        var okQ = !state.q || card.getAttribute('data-title').toLowerCase().indexOf(state.q) !== -1;
        var visible = okAud && okCat && okQ;
        card.style.display = visible ? '' : 'none';
        if (visible) shown++;
      });
      if (counter) counter.textContent = 'Показано ' + shown + ' из ' + cards.length;
      if (empty) empty.classList.toggle('is-visible', shown === 0);
    };

    var updateCatCounts = function () {
      var select = doc.getElementById('catSelect');
      if (!select) return;
      Array.prototype.forEach.call(select.options, function (option) {
        if (option.value === 'all') return;
        var count = cards.filter(function (card) {
          return card.getAttribute('data-cat') === option.value &&
            (state.aud === 'all' || card.getAttribute('data-aud') === state.aud);
        }).length;
        option.textContent = (option.getAttribute('data-name') || '') + ' · ' + count;
      });
    };

    doc.querySelectorAll('[data-aud]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        doc.querySelectorAll('[data-aud]').forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');
        state.aud = btn.getAttribute('data-aud');
        updateCatCounts();
        applyFilters();
      });
    });

    var catSelect = doc.getElementById('catSelect');
    if (catSelect) {
      catSelect.addEventListener('change', function () {
        state.cat = catSelect.value;
        applyFilters();
      });
    }

    var searchInput = doc.getElementById('catalogSearch');
    if (searchInput) {
      searchInput.addEventListener('input', function () {
        state.q = searchInput.value.trim().toLowerCase();
        applyFilters();
      });
    }

    var params = new URLSearchParams(window.location.search);
    var audParam = params.get('audience');
    if (audParam) {
      var target = doc.querySelector('[data-aud="' + audParam + '"]');
      if (target) target.click();
    }
    var catParam = params.get('category');
    if (catParam && catSelect) {
      catSelect.value = catParam;
      state.cat = catParam;
    }
    updateCatCounts();
    applyFilters();
  }

  /* ---------- прямая ссылка на форму: index.html#zayavka ---------- */
  if (window.location.hash === '#zayavka') {
    setTimeout(function () { openModal(null); }, 250);
  }

  /* ---------- подсветка меню по разделу ---------- */
  var spyMap = [];
  doc.querySelectorAll('.nav > a, .nav .nav-sub-trigger').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    var match = href.match(/^(?:index\.html)?#(.+)$/);
    var section = null;
    if (match) {
      section = doc.getElementById(match[1]);
    } else if (href === 'catalog.html') {
      section = doc.getElementById('courses');
    }
    if (section) spyMap.push({ link: link, section: section });
  });

  function updateSpy() {
    if (!spyMap.length) return;
    var pos = window.scrollY + window.innerHeight * 0.35;
    var current = null;
    spyMap.forEach(function (item) {
      if (item.section.offsetTop <= pos) current = item;
    });
    spyMap.forEach(function (item) {
      item.link.classList.toggle('is-active', current !== null && item.section === current.section);
    });
  }

  /* ---------- точная прокрутка по якорям ---------- */
  doc.addEventListener('click', function (e) {
    var link = e.target.closest('a[href*="#"]');
    if (!link) return;
    var href = link.getAttribute('href') || '';
    var hashIndex = href.indexOf('#');
    if (hashIndex === -1) return;
    var pathPart = href.slice(0, hashIndex);
    var id = href.slice(hashIndex + 1);
    if (!id) return;

    var currentFile = window.location.pathname.split('/').pop() || 'index.html';
    if (pathPart && pathPart !== currentFile) return;

    var target = doc.getElementById(id);
    if (!target) return;

    e.preventDefault();
    var headerEl = doc.querySelector('.site-header');
    var offset = headerEl ? headerEl.offsetHeight : 0;
    var top = Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset);
    var distance = Math.abs(top - window.scrollY);

    if (reduceMotion || distance > 1500) {
      var htmlEl = doc.documentElement;
      var prevBehavior = htmlEl.style.scrollBehavior;
      htmlEl.style.scrollBehavior = 'auto';
      window.scrollTo(0, top);
      htmlEl.style.scrollBehavior = prevBehavior;
    } else {
      window.scrollTo({ top: top, behavior: 'smooth' });
    }
    if (window.history && window.history.pushState) {
      window.history.pushState(null, '', '#' + id);
    }
  });

  /* ---------- нижняя панель ---------- */
  doc.querySelectorAll('.tabbar a').forEach(function (link) {
    var href = link.getAttribute('href') || '';
    if (href.indexOf('#') !== -1) return;
    var current = window.location.pathname.split('/').pop();
    if (current === href) link.classList.add('is-active');
  });



  doc.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy-order]');
    if (!btn) return;
    var target = doc.getElementById(btn.getAttribute('data-copy-target'));
    if (!target) return;
    target.select();
    var done = function () {
      var old = btn.textContent;
      btn.textContent = 'Скопировано';
      setTimeout(function () { btn.textContent = old; }, 1600);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(target.value).then(done).catch(function () { document.execCommand('copy'); done(); });
    } else {
      document.execCommand('copy');
      done();
    }
  });

  /* ---------- просмотр фото и материалов ---------- */
  var lightbox = doc.getElementById('lightbox');
  var lightboxScroll = doc.getElementById('lightboxScroll');

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    doc.body.style.overflow = '';
  }

  doc.addEventListener('click', function (e) {
    var zoom = e.target.closest('[data-zoom]');
    if (zoom && lightbox && lightboxScroll) {
      e.preventDefault();
      var pages = zoom.getAttribute('data-pages');
      var sources = pages ? pages.split(',') : [zoom.getAttribute('src')];
      lightboxScroll.innerHTML = sources.map(function (src) {
        return '<img src="' + src + '" alt="">';
      }).join('');
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      doc.body.style.overflow = 'hidden';
      return;
    }
    if (e.target.closest('[data-close-zoom]') || e.target === lightbox) {
      closeLightbox();
    }
  });

  doc.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeLightbox();
  });

  /* ---------- общий обработчик скролла ---------- */

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      updateHeader();
      updateProgress();
      updateSpy();
      ticking = false;
    });
  }, { passive: true });

  updateHeader();
  updateProgress();
  updateSpy();
})();

/* ============================================================
   ОТЗЫВЫ И РЕЙТИНГ
   ============================================================ */
(function () {
  var KEY = 'fomin_reviews_v1';


  var PROFANITY_ROOTS = [
    'хуй', 'хуе', 'хуя', 'хуи', 'пизд', 'бляд', 'блят', 'ебат', 'ебал', 'ебан',
    'ебуч', 'залуп', 'мудозвон', 'пидор', 'педик', 'гандон', 'долбое', 'охуе'
  ];
  var HOMOGLYPHS = { a: 'а', e: 'е', o: 'о', p: 'р', c: 'с', x: 'х', y: 'у', k: 'к', m: 'м', t: 'т', h: 'н', b: 'в' };

  function normalizeText(value) {
    return (value || '')
      .toLowerCase()
      .split('')
      .map(function (ch) { return HOMOGLYPHS[ch] || ch; })
      .join('')
      .replace(/[^а-яё]/g, '');
  }

  function hasProfanity(value) {
    var clean = normalizeText(value);
    return PROFANITY_ROOTS.some(function (root) { return clean.indexOf(root) !== -1; });
  }

  function all() {
    try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { return []; }
  }
  function save(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) {}
  }
  function avgFor(list, course) {
    var items = list.filter(function (r) { return r.course === course; });
    if (!items.length) return null;
    var sum = items.reduce(function (acc, r) { return acc + Number(r.rating || 0); }, 0);
    return { avg: sum / items.length, count: items.length };
  }
  function starsText(n) {
    var full = Math.round(n);
    return '★★★★★'.slice(0, full) + '☆☆☆☆☆'.slice(0, 5 - full);
  }

  function paintRatings() {
    var list = all();
    document.querySelectorAll('[data-rate-for]').forEach(function (el) {
      var stat = avgFor(list, el.getAttribute('data-rate-for'));
      if (!stat) return;
      el.hidden = false;
      el.textContent = '★ ' + stat.avg.toFixed(1) + ' · ' + stat.count + ' отз.';
    });
  }

  function renderList() {
    var box = document.getElementById('reviewsList');
    if (!box) return;
    var list = all().slice().sort(function (a, b) { return (b.ts || 0) - (a.ts || 0); });
    var empty = document.getElementById('reviewsEmpty');

    if (!list.length) {
      box.innerHTML = '';
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;

    box.innerHTML = list.map(function (r) {
      var date = r.date ? new Date(r.date) : null;
      var dateText = date && !isNaN(date) ? date.toLocaleDateString('ru-RU') : '';
      return '<article class="review-card">' +
        '<div class="review-card__head">' +
          '<span class="review-card__name">' + (r.name || 'Участник') + '</span>' +
          '<span class="review-card__stars">' + starsText(Number(r.rating || 0)) + '</span>' +
        '</div>' +
        '<div class="review-card__course">' + (r.course || '') + '</div>' +
        '<div class="review-card__meta">' + [r.company, dateText].filter(Boolean).join(' · ') + '</div>' +
        (r.text ? '<p class="review-card__text">' + r.text + '</p>' : '') +
      '</article>';
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', function () {
    paintRatings();

    var form = document.getElementById('reviewForm');
    if (!form) return;

    var openBtn = document.querySelector('[data-open-review]');
    var closeBtn = document.querySelector('[data-close-review]');
    if (openBtn) openBtn.addEventListener('click', function () {
      form.hidden = false;
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    if (closeBtn) closeBtn.addEventListener('click', function () { form.hidden = true; });

    var ratingInput = form.querySelector('input[name="rating"]');
    var starButtons = form.querySelectorAll('[data-star]');

    function setStars(value) {
      ratingInput.value = value;
      starButtons.forEach(function (btn) {
        btn.classList.toggle('is-on', Number(btn.getAttribute('data-star')) <= value);
      });
    }
    starButtons.forEach(function (btn) {
      btn.addEventListener('click', function () { setStars(Number(btn.getAttribute('data-star'))); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var rating = Number(ratingInput.value);
      if (!rating) { setStars(5); rating = 5; }

      var name = (data.get('name') || '').toString();
      var company = (data.get('company') || '').toString();
      var comment = (data.get('text') || '').toString();
      var error = document.getElementById('reviewError');
      if (hasProfanity(name) || hasProfanity(company) || hasProfanity(comment)) {
        if (error) {
          error.hidden = false;
          error.textContent = 'Уберите, пожалуйста, нецензурные выражения — и отправьте снова.';
        }
        return;
      }
      if (error) error.hidden = true;

      var list = all();
      list.push({
        name: (data.get('name') || '').toString().trim(),
        company: (data.get('company') || '').toString().trim(),
        course: (data.get('course') || '').toString().trim(),
        date: (data.get('date') || '').toString(),
        text: (data.get('text') || '').toString().trim(),
        rating: rating,
        ts: Date.now()
      });
      save(list);
      form.reset();
      setStars(0);
      form.hidden = true;
      renderList();
      paintRatings();
    });

    renderList();
  });
})();
