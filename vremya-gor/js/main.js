(() => {
  document.documentElement.classList.add('js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rub = n => n.toLocaleString('ru-RU').replace(/ |\s/g, ' ') + ' ₽';
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Навигация */
  const nav = $('#nav');
  const mobCta = $('.mob-cta');
  const onScroll = () => { nav.classList.toggle('is-solid', scrollY > 40); mobCta.classList.toggle('is-shown', scrollY > innerHeight * 0.7); };
  addEventListener('scroll', onScroll, { passive: true }); onScroll();
  $('#burger').addEventListener('click', e => {
    const open = nav.classList.toggle('is-open');
    e.currentTarget.setAttribute('aria-expanded', open);
  });
  $$('.nav__links a').forEach(a => a.addEventListener('click', () => nav.classList.remove('is-open')));

  /* Контакты */
  const contacts = $('#contacts'), cBtn = $('#contactsBtn');
  const setContacts = open => { contacts.classList.toggle('is-open', open); cBtn.setAttribute('aria-expanded', open); };
  cBtn.addEventListener('click', e => { e.stopPropagation(); setContacts(!contacts.classList.contains('is-open')); });
  document.addEventListener('click', e => { if (!contacts.contains(e.target)) setContacts(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setContacts(false); });
  $('.contacts__panel .is-need').addEventListener('click', e => e.preventDefault());

  /* Появление при прокрутке, с небольшой задержкой внутри группы */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -12% 0px' });
  const groups = new Map();
  $$('[data-reveal], [data-img]').forEach(el => {
    const parent = el.parentElement;
    const i = groups.get(parent) || 0; groups.set(parent, i + 1);
    el.style.setProperty('--d', Math.min(i, 4) * 0.12 + 's');
    io.observe(el);
  });

  /* Параллакс: первый экран и баннер окрестностей */
  const heroImg = $('.hero__media'), aroundImg = $('.around__hero img'), aroundBox = $('.around__hero');
  let ticking = false;
  const parallax = () => {
    ticking = false;
    const y = scrollY;
    if (y < innerHeight * 1.2) heroImg.style.transform = `translate3d(0, ${y * 0.3}px, 0)`;
    const r = aroundBox.getBoundingClientRect();
    if (r.bottom > 0 && r.top < innerHeight) {
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      aroundImg.style.transform = `translate3d(0, ${p * -80}px, 0) scale(1.15)`;
    }
  };
  if (!calm) addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(parallax); } }, { passive: true });

  /* Искры костра: тёплые точки медленно поднимаются и гаснут */
  function embers(canvas, density) {
    if (calm) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr, parts = [], visible = false;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const spawn = fresh => ({
      x: Math.random() * w, y: fresh ? Math.random() * h : h + 10,
      r: Math.random() * 1.6 + .5, vy: Math.random() * .45 + .18, sway: Math.random() * 1.4 + .4,
      ph: Math.random() * 6.28, life: 0, max: Math.random() * 420 + 260
    });
    resize(); addEventListener('resize', resize);
    const count = () => Math.round(w * h / 1e4 * density);
    for (let i = 0; i < count(); i++) parts.push(spawn(true));
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) requestAnimationFrame(tick); }).observe(canvas);
    function tick(t) {
      if (!visible) return;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'lighter';
      parts.forEach((p, i) => {
        p.life++; p.y -= p.vy; p.x += Math.sin(t / 1400 + p.ph) * p.sway * .25;
        const k = p.life / p.max, a = Math.sin(Math.PI * Math.min(k, 1)) * .85 * (.6 + .4 * Math.sin(t / 300 + p.ph));
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 5);
        g.addColorStop(0, `rgba(255, 214, 150, ${a})`); g.addColorStop(.35, `rgba(231, 150, 70, ${a * .5})`); g.addColorStop(1, 'rgba(231,150,70,0)');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 5, 0, 6.28); ctx.fill();
        if (k >= 1 || p.y < -10) parts[i] = spawn(false);
      });
      requestAnimationFrame(tick);
    }
  }
  $$('.embers').forEach(c => embers(c, c.classList.contains('embers--band') ? 1.1 : .45));


  /* Тропа: светящаяся линия ведёт от одного момента дня к другому */
  (function trail() {
    const svg = $('#trail'); if (!svg) return;
    const wrap = svg.parentElement, base = $('#trailBase'), line = $('#trailLine'), dot = $('#trailDot'), glow = $('#trailGlow');
    const items = $$('.moment', wrap);
    let total = 0, samples = [], nodesY = [];
    const build = () => {
      if (innerWidth <= 860) return;
      const W = wrap.getBoundingClientRect(), top = W.top;
      const pts = items.map(li => {
        const fig = $('figure', li).getBoundingClientRect(), txt = $('.moment__text', li).getBoundingClientRect();
        const left = fig.left < txt.left;
        const gx = left ? (fig.right + txt.left) / 2 : (txt.right + fig.left) / 2;
        $('.moment__node', li).style.left = (gx - li.getBoundingClientRect().left) + 'px';
        return { x: gx - W.left, y: (fig.top + fig.bottom) / 2 - top, side: left ? -1 : 1, h: fig.height };
      });
      const dx = W.width * 0.36;
      let d = `M ${pts[0].x} ${pts[0].y - pts[0].h * 0.75} L ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], gap = b.y - a.y;
        d += ` C ${a.x + a.side * dx} ${a.y + gap * 0.55}, ${b.x + b.side * dx} ${b.y - gap * 0.55}, ${b.x} ${b.y}`;
      }
      const last = pts[pts.length - 1];
      d += ` L ${last.x} ${last.y + last.h * 0.6}`;
      base.setAttribute('d', d); line.setAttribute('d', d);
      total = line.getTotalLength();
      line.style.strokeDasharray = total;
      samples = [];
      for (let l = 0; l <= total; l += 6) samples.push([l, line.getPointAtLength(l).y]);
      nodesY = pts.map(p => p.y);
      update();
    };
    const update = () => {
      if (!total) return;
      const target = innerHeight * 0.6 - wrap.getBoundingClientRect().top;
      let len = 0;
      for (const [l, y] of samples) { if (y <= target) len = l; else break; }
      if (calm) len = total;
      line.style.strokeDashoffset = total - len;
      const p = line.getPointAtLength(len);
      [dot, glow].forEach(c => { c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.style.opacity = len > 0 && len < total ? 1 : 0; });
      items.forEach((li, i) => li.classList.toggle('is-lit', p.y >= nodesY[i] - 2));
    };
    let raf = 0;
    addEventListener('scroll', () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true });
    addEventListener('resize', build);
    addEventListener('load', build);
    $$('img', wrap).forEach(img => img.addEventListener('load', build, { once: true }));
    build();
  })();


  /* Видео атмосферы играют, только когда видны на экране */
  const vio = new IntersectionObserver(entries => entries.forEach(en => {
    const v = en.target;
    if (en.isIntersecting && !calm) { v.play().catch(() => {}); } else v.pause();
  }), { threshold: 0.25 });
  $$('.reel video').forEach(v => vio.observe(v));

  /* Просмотр фото и видео во весь экран */
  const lb = $('#lb'), stage = $('#lbStage');
  const media = $$('[data-lb]');
  let cur = 0;
  const show = i => {
    cur = (i + media.length) % media.length;
    const el = media[cur], src = el.dataset.lb, cap = el.dataset.cap || '';
    stage.innerHTML = src.endsWith('.mp4')
      ? `<video src="${src}" autoplay loop playsinline controls muted></video><figcaption>${cap}</figcaption>`
      : `<img src="${src}" alt="${cap}"><figcaption>${cap}</figcaption>`;
  };
  media.forEach((el, i) => el.addEventListener('click', () => { show(i); lb.showModal(); document.documentElement.classList.add('modal-open'); }));
  const closeLb = () => { lb.close(); stage.innerHTML = ''; };
  lb.addEventListener('close', () => document.documentElement.classList.remove('modal-open'));
  $('#lbClose').addEventListener('click', closeLb);
  $('#lbPrev').addEventListener('click', () => show(cur - 1));
  $('#lbNext').addEventListener('click', () => show(cur + 1));
  lb.addEventListener('click', e => { if (e.target === lb || e.target === stage) closeLb(); });
  lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') show(cur - 1); if (e.key === 'ArrowRight') show(cur + 1); });

  /* Живая карта по кнопке */
  $('#mapLive').addEventListener('click', e => {
    const box = $('#roadMap');
    box.insertAdjacentHTML('beforeend', '<iframe title="Глэмпинг «Время гор» на Яндекс Картах" src="https://yandex.ru/map-widget/v1/?ll=40.288318%2C44.200412&z=12&pt=40.288318%2C44.200412%2Cpm2rdm&oid=189997695506" allowfullscreen></iframe>');
    e.currentTarget.remove();
  });

  /* Галереи шатров */
  $$('.tent').forEach(t => {
    const main = $('.tent__main', t);
    $$('.tent__thumbs button', t).forEach(b => b.addEventListener('click', () => {
      $$('.tent__thumbs button', t).forEach(x => x.classList.remove('is-active'));
      b.classList.add('is-active');
      main.style.opacity = 0;
      setTimeout(() => { main.src = b.dataset.src; main.style.opacity = 1; }, 200);
    }));
  });

  /* Окно бронирования */
  const modal = $('#bookModal');
  const openBook = () => {
    if (modal.open) return;
    setContacts(false); nav.classList.remove('is-open');
    modal.classList.remove('is-closing');
    modal.showModal(); document.documentElement.classList.add('modal-open');
    modal.scrollTop = 0;
  };
  const closeBook = () => {
    if (!modal.open) return;
    modal.classList.add('is-closing');
    setTimeout(() => { modal.close(); modal.classList.remove('is-closing'); }, calm ? 0 : 280);
  };
  modal.addEventListener('close', () => document.documentElement.classList.remove('modal-open'));
  modal.addEventListener('cancel', e => { e.preventDefault(); closeBook(); });
  modal.addEventListener('click', e => { if (e.target === modal) closeBook(); });
  $('#bookClose').addEventListener('click', closeBook);
  $$('[data-book]').forEach(b => b.addEventListener('click', openBook));

  /* Состояние брони */
  const TENTS = { big: { name: 'Большой сафари-тент', price: 8000, long: 7000, cap: 4 }, small: { name: 'Малый сафари-тент', price: 6000, long: 6000, cap: 3 } };
  const state = { start: null, end: null, guests: 2 };
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const DAY = 864e5;
  const fmt = d => d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
  const nights = () => state.start && state.end ? Math.round((state.end - state.start) / DAY) : 0;

  // Занятые даты - для примера
  const busy = d => {
    const n = d.getFullYear() * 400 + d.getMonth() * 31 + d.getDate();
    return d > today && ((n * 7919) % 13 === 0 || (n * 104729) % 17 === 0);
  };
  const rangeFree = (a, b) => { for (let t = +a; t < +b; t += DAY) if (busy(new Date(t))) return false; return true; };

  /* Календарь на два месяца */
  const grid = $('#calGrid'), months = $('#calMonths'), prev = $('#calPrev'), next = $('#calNext');
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  const wd = ['пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'];
  const month = m => {
    const box = document.createElement('div'); box.className = 'cal__month';
    wd.forEach(w => box.insertAdjacentHTML('beforeend', `<span class="cal__wd">${w}</span>`));
    const pad = (new Date(m.getFullYear(), m.getMonth(), 1).getDay() + 6) % 7;
    for (let i = 0; i < pad; i++) box.insertAdjacentHTML('beforeend', '<span></span>');
    const len = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
    for (let d = 1; d <= len; d++) {
      const day = new Date(m.getFullYear(), m.getMonth(), d);
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'cal__day'; b.textContent = d; b.setAttribute('aria-label', fmt(day));
      const isBusy = busy(day), s = state.start, e = state.end;
      if (day < today) b.disabled = true;
      if (isBusy) { b.classList.add('is-busy'); b.disabled = true; b.setAttribute('aria-label', fmt(day) + ', занято'); }
      if (s && +day === +s) b.classList.add('is-start');
      if (s && e) b.classList.add('has-end');
      if (e && +day === +e) b.classList.add('is-end');
      if (s && e && day > s && day < e) b.classList.add('in-range');
      if (isBusy && s && !e && day > s && rangeFree(s, day)) b.disabled = false; // выезд в день чужого заезда
      b.addEventListener('click', () => pick(day));
      box.appendChild(b);
    }
    return box;
  };
  const pick = day => {
    if (!state.start || state.end || day <= state.start) { state.start = day; state.end = null; }
    else if (rangeFree(state.start, day)) state.end = day;
    else { state.start = day; state.end = null; }
    renderCal(); syncQuick(); calc();
  };
  function renderCal() {
    const m2 = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    months.innerHTML = [view, m2].map(m => `<span>${m.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}</span>`).join('');
    grid.replaceChildren(month(view), month(m2));
    prev.disabled = view <= new Date(today.getFullYear(), today.getMonth(), 1);
  }
  prev.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() - 1, 1); renderCal(); });
  next.addEventListener('click', () => { view = new Date(view.getFullYear(), view.getMonth() + 1, 1); renderCal(); });
  renderCal();

  /* Быстрая форма на первом экране открывает окно брони */
  function syncQuick() {
    $('#qbIn').value = state.start ? fmt(state.start) : '';
    $('#qbOut').value = state.end ? fmt(state.end) : '';
  }
  ['#qbIn', '#qbOut'].forEach(s => $(s).closest('label').addEventListener('click', e => { e.preventDefault(); setGuests(+$('#qbGuests').value); openBook(); }));
  $('#quickbook').addEventListener('submit', e => { e.preventDefault(); setGuests(+$('#qbGuests').value); openBook(); });

  /* Шатёр и гости */
  const tentInput = () => $('input[name=tent]:checked');
  function setGuests(n) {
    const cap = TENTS[tentInput().value].cap;
    state.guests = Math.max(1, Math.min(cap, n));
    $('#gCount').textContent = state.guests;
    $('#gMinus').disabled = state.guests <= 1; $('#gPlus').disabled = state.guests >= cap;
    $('#qbGuests').value = String(state.guests);
    calc();
  }
  $('#gMinus').addEventListener('click', () => setGuests(state.guests - 1));
  $('#gPlus').addEventListener('click', () => setGuests(state.guests + 1));
  $$('input[name=tent]').forEach(r => r.addEventListener('change', () => setGuests(state.guests)));
  $$('input[name=extra], #pet').forEach(c => c.addEventListener('change', calc));
  $$('[data-pick]').forEach(b => b.addEventListener('click', () => {
    $(`input[name=tent][value=${b.dataset.pick}]`).checked = true;
    setGuests(state.guests); openBook();
  }));

  /* Расчёт */
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; };
  function calc() {
    const n = nights(), t = TENTS[tentInput().value];
    const datesEl = $('#bkDates');
    if (!state.start) datesEl.textContent = 'Выберите дату заезда';
    else if (!state.end) datesEl.textContent = `Заезд ${fmt(state.start)} - теперь выберите дату выезда`;
    else datesEl.textContent = `${fmt(state.start)} - ${fmt(state.end)} · ${n} ${plural(n, 'ночь', 'ночи', 'ночей')}`;
    const lines = $('#bkLines');
    if (!n) { lines.innerHTML = '<p>Выберите даты, чтобы увидеть стоимость</p>'; $('#bkTotal').textContent = '-'; return 0; }
    const per = n >= 3 ? t.long : t.price;
    let total = per * n;
    const rows = [[`${t.name}, ${n} × ${rub(per)}`, rub(per * n)]];
    $$('input[name=extra]:checked').forEach(x => {
      const p = +x.dataset.price, name = x.closest('label').querySelector('strong').textContent;
      if (x.dataset.unit === 'ask') rows.push([name, 'рассчитаем']);
      else { const sum = x.dataset.unit === 'day' ? p * n : p; total += sum; rows.push([name + (x.dataset.unit === 'day' ? `, ${n} сут.` : ', 1 сеанс'), rub(sum)]); }
    });
    if ($('#pet').checked) rows.push(['Питомец', 'можно']);
    lines.innerHTML = rows.map(r => `<p><span>${r[0]}</span><span>${r[1]}</span></p>`).join('');
    const tot = $('#bkTotal');
    tot.textContent = rub(total);
    if (!calm) tot.animate([{ opacity: .3, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 450, easing: 'cubic-bezier(.16,1,.3,1)' });
    return total;
  }

  /* Отправка */
  const err = $('#bkErr');
  $('#bk').addEventListener('submit', e => {
    e.preventDefault();
    const name = $('#cName'), phone = $('#cPhone');
    [name, phone].forEach(i => i.classList.remove('is-bad'));
    if (!nights()) { err.textContent = 'Выберите даты заезда и выезда в календаре.'; $('#cal').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (!name.value.trim()) { name.classList.add('is-bad'); err.textContent = 'Напишите, как к вам обращаться.'; name.focus(); return; }
    if (phone.value.replace(/\D/g, '').length < 10) { phone.classList.add('is-bad'); err.textContent = 'Проверьте номер телефона: нужно 10-11 цифр.'; phone.focus(); return; }
    err.textContent = '';
    const total = calc();
    $('#bkDoneText').textContent = `${name.value.trim()}, ваша заявка: ${TENTS[tentInput().value].name}, ${fmt(state.start)} - ${fmt(state.end)}, ${state.guests} ${plural(state.guests, 'гость', 'гостя', 'гостей')}. Сумма - ${rub(total)}. Перезвоним на ${phone.value.trim()}.`;
    $('#bk').hidden = true; $('#bkDone').hidden = false; modal.scrollTop = 0;
  });
  $('#bkAgain').addEventListener('click', () => { $('#bk').hidden = false; $('#bkDone').hidden = true; });

  setGuests(2);
})();
