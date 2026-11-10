(function () {
  var T = window.typo || function (s) { return s; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var tx = function (s) { return T(esc(s)); };
  var fmt = function (n) { return n.toLocaleString("ru-RU").replace(/\s/g, " "); };
  var secName = function (id) { var s = SECTIONS.find(function (x) { return x.id === id; }); return s ? s.name : ""; };
  var STATUS = { in: "В наличии", few: "Мало", order: "Под заказ" };
  var ARROW = '<i class="ti ti-arrow-right" aria-hidden="true"></i>';

  function priceHtml(it) {
    return it.price ? '<span class="price">' + fmt(it.price) + " " + it.unit + "</span>" : '<span class="price ask">Цена по запросу</span>';
  }
  function secImg(it) { var x = SECTIONS.find(function (q) { return q.id === it.section; }); return it.img || (x && x.img) || ""; }
  function card(it) {
    var im = secImg(it);
    return '<a class="item reveal" href="item.html?id=' + it.id + '">' +
      '<div class="ph">' + (im ? '<img src="' + im + '" alt="" loading="lazy"><span class="lbl">Фото раздела</span>' : "") + "</div>" +
      '<div class="body"><span class="sec">' + tx(secName(it.section)) + "</span>" +
      "<h3>" + tx(it.name) + '</h3><p class="line">' + tx(it.line) + "</p>" +
      '<div class="bottom">' + priceHtml(it) + '<span class="status ' + it.status + '">' + STATUS[it.status] + "</span></div></div></a>";
  }

  // шапка: тень при прокрутке и меню на телефоне
  var top = $("#top");
  if (top) {
    var onScroll = function () { top.classList.toggle("solid", window.scrollY > 10); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  var burger = $("#burger"), nav = $("#nav");
  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open);
      burger.setAttribute("aria-label", open ? "Закрыть меню" : "Открыть меню");
      burger.innerHTML = '<i class="ti ' + (open ? "ti-x" : "ti-menu-2") + '" aria-hidden="true"></i>';
    };
    burger.addEventListener("click", function () { setMenu(!nav.classList.contains("open")); });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { setMenu(false); burger.focus(); } });
  }

  // подсветка раздела в шапке при прокрутке главной
  var spy = $$('.nav > a[href^="#"]');
  if (spy.length && "IntersectionObserver" in window) {
    var secs = spy.map(function (a) { return document.querySelector(a.getAttribute("href")); }).filter(Boolean);
    var sio = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (!x.isIntersecting) return;
        spy.forEach(function (a) { var on = a.getAttribute("href") === "#" + x.target.id; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    secs.forEach(function (sec) { sio.observe(sec); });
  }
  // в каталоге и карточке подсвечиваем пункт «Каталог»
  if (/catalog\.html|item\.html/.test(location.pathname)) { var db = $(".dd-btn"); if (db) db.classList.add("on"); }

  // «открыто сейчас»: Пн–Пт 10–19, Сб–Вс 10–17 (Ростов, UTC+3)
  function openNow() {
    var el = $$("[data-open]");
    if (!el.length) return;
    var now = new Date(Date.now() + (new Date().getTimezoneOffset() + 180) * 60000);
    var d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var close = d === 0 || d === 6 ? 17 : 19, on = h >= 10 && h < close;
    el.forEach(function (e) {
      e.className = "open-now " + (on ? "on" : "off");
      e.textContent = on ? "Открыто до " + close + ":00" : "Сейчас закрыто · откроется в 10:00";
    });
  }

  // главная: разделы каталога
  var tiles = $("#tiles");
  if (tiles) {
    tiles.innerHTML = SECTIONS.map(function (s) {
      var prices = ITEMS.filter(function (i) { return i.section === s.id && i.price; }).map(function (i) { return i.price; });
      var from = prices.length ? '<span class="from">от ' + fmt(Math.min.apply(null, prices)) + " ₽</span>" : '<span class="from ask">по запросу</span>';
      return '<a class="tile reveal" href="catalog.html?s=' + s.id + '"><div class="im"><img src="' + s.img + '" alt="" loading="lazy"></div><div class="over"><div><h3>' + tx(s.name) + "</h3><p>" + tx(s.fact) + "</p></div>" + from + "</div></a>";
    }).join("");
  }

  // главная: стили — вкладки с раскрытием
  var tabs = $("#tabs");
  if (tabs) {
    var tabEls = $$('[role="tab"]', tabs);
    var select = function (t, focus) {
      tabEls.forEach(function (b) {
        var on = b === t;
        b.setAttribute("aria-selected", on);
        b.tabIndex = on ? 0 : -1;
        var p = document.getElementById(b.getAttribute("aria-controls"));
        p.hidden = !on;
        if (on) { p.classList.remove("in"); void p.offsetWidth; p.classList.add("in"); }
      });
      if (focus) t.focus();
    };
    tabs.addEventListener("click", function (e) {
      var t = e.target.closest('[role="tab"]'); if (!t) return;
      select(t);
      var p = document.getElementById(t.getAttribute("aria-controls"));
      var r = p.getBoundingClientRect();
      if (r.top > window.innerHeight * 0.8) p.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
    tabs.addEventListener("keydown", function (e) {
      var i = tabEls.indexOf(document.activeElement); if (i < 0) return;
      var n = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
      if (n) { e.preventDefault(); select(tabEls[(i + n + tabEls.length) % tabEls.length], true); }
      if (e.key === "Home") { e.preventDefault(); select(tabEls[0], true); }
      if (e.key === "End") { e.preventDefault(); select(tabEls[tabEls.length - 1], true); }
    });
  }

  // главная: позиции с ценой
  var pop = $("#popular");
  if (pop) pop.innerHTML = ITEMS.filter(function (i) { return i.price; }).map(card).join("");

  // главная: шесть отзывов сразу
  var rg = $("#reviews-grid");
  if (rg) {
    var YA = "https://yandex.ru/maps/org/martdekor/192527386082/reviews/";
    var STARS = '<div class="stars" aria-label="5 из 5">' + new Array(6).join('<i class="ti ti-star-filled" aria-hidden="true"></i>') + "</div>";
    rg.innerHTML = REVIEWS.map(function (r) {
      return '<article class="rcard reveal">' + STARS + "<p>«" + tx(r.text) + "»</p><footer><b>" + tx(r.name) + "</b>" + r.date + ' · Яндекс Карты</footer><a href="' + YA + '" target="_blank" rel="noopener">Читать на&nbsp;Яндекс Картах <i class="ti ti-external-link" aria-hidden="true"></i></a></article>';
    }).join("");
  }

  // каталог
  var grid = $("#catalog-grid");
  if (grid) {
    var STYLES = { modern: "Современный минимализм", classic: "Мягкая классика", nature: "Природные фактуры", accent: "Акцентная стена" };
    var params = new URLSearchParams(location.search);
    var s0 = params.get("s") || "", st0 = params.get("st") || "";
    if (s0 && !SECTIONS.some(function (s) { return s.id === s0; })) s0 = "";
    if (st0 && !STYLES[st0]) st0 = "";
    var blank = function () { return { q: "", s: "", st: "", avail: [], price: "", sort: "" }; };
    var state = blank(); state.s = s0; state.st = st0;
    var chips = $("#sec-chips");
    chips.innerHTML = '<button class="chip" data-s="">Все</button>' + SECTIONS.map(function (s) {
      var n = ITEMS.filter(function (i) { return i.section === s.id; }).length;
      return '<button class="chip" data-s="' + s.id + '">' + tx(s.name) + " · " + n + "</button>";
    }).join("");
    var syncUrl = function () {
      var u = new URL(location.href);
      ["s", "st"].forEach(function (k) { if (state[k]) u.searchParams.set(k, state[k]); else u.searchParams.delete(k); });
      history.replaceState(null, "", u);
    };
    var syncForm = function () {
      $("#q").value = state.q;
      $$('input[name="st"]').forEach(function (r) { r.checked = r.value === state.st; });
      $$('input[name="avail"]').forEach(function (c) { c.checked = state.avail.indexOf(c.value) >= 0; });
      $$('input[name="price"]').forEach(function (r) { r.checked = r.value === state.price; });
      $("#sort").value = state.sort;
    };
    var reset = function () { state = blank(); syncForm(); syncUrl(); render(); };
    var render = function () {
      $$(".chip", chips).forEach(function (c) { var on = c.dataset.s === state.s; c.classList.toggle("on", on); c.setAttribute("aria-pressed", on); });
      var q = state.q.trim().toLowerCase();
      var list = ITEMS.filter(function (i) {
        if (state.s && i.section !== state.s) return false;
        if (state.st && (i.styles || []).indexOf(state.st) < 0) return false;
        if (state.avail.length && state.avail.indexOf(i.status) < 0) return false;
        if (state.price === "priced" && !i.price) return false;
        if (state.price === "ask" && i.price) return false;
        if (q && (i.name + " " + i.line + " " + i.tags.join(" ") + " " + secName(i.section)).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      if (state.sort === "up" || state.sort === "down") {
        var d = state.sort === "up" ? 1 : -1;
        list = list.slice().sort(function (a, b) { if (!a.price) return 1; if (!b.price) return -1; return (a.price - b.price) * d; });
      } else if (state.sort === "name") {
        list = list.slice().sort(function (a, b) { return a.name.localeCompare(b.name, "ru"); });
      }
      var bits = [];
      if (state.s) bits.push(secName(state.s));
      if (state.st) bits.push(STYLES[state.st]);
      $("#count").textContent = (bits.length ? bits.join(" · ") + " · " : "") + "Найдено позиций: " + list.length;
      grid.innerHTML = list.length ? list.map(card).join("") :
        '<div class="empty"><h3>Ничего не&nbsp;нашлось</h3><p>Измените условия или&nbsp;пришлите фото интерьера&nbsp;— подберём сами.</p><div class="row"><button class="btn ghost" type="button" id="reset">Сбросить фильтры</button><a class="btn" href="index.html#form" data-form>Прислать фото на&nbsp;подбор</a></div></div>';
      var rb = $("#reset"); if (rb) rb.addEventListener("click", reset);
      reveal();
    };
    chips.addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) { state.s = b.dataset.s; syncUrl(); render(); } });
    $("#q").addEventListener("input", function (e) { state.q = e.target.value; render(); });
    $$('input[name="st"]').forEach(function (r) { r.addEventListener("change", function () { state.st = r.value; syncUrl(); render(); }); });
    $$('input[name="avail"]').forEach(function (c) { c.addEventListener("change", function () { state.avail = $$('input[name="avail"]:checked').map(function (x) { return x.value; }); render(); }); });
    $$('input[name="price"]').forEach(function (r) { r.addEventListener("change", function () { state.price = r.value; render(); }); });
    $("#sort").addEventListener("change", function (e) { state.sort = e.target.value; render(); });
    $("#reset-all").addEventListener("click", reset);
    var ft = $("#ftoggle");
    if (ft) ft.addEventListener("click", function () { var o = $("#filters").classList.toggle("open"); ft.setAttribute("aria-expanded", o); });
    syncForm(); render();
  }

  // карточка материала
  var prod = $("#product");
  if (prod) {
    var id = new URLSearchParams(location.search).get("id");
    var it = ITEMS.find(function (i) { return i.id === id; });
    if (!it) {
      document.title = "Позиция не найдена — МАРТдекор";
      prod.outerHTML = '<div class="notfound"><h1>Такой позиции нет</h1><p>Возможно, ссылка устарела или&nbsp;позицию сняли с&nbsp;продажи. Посмотрите каталог или&nbsp;пришлите фото&nbsp;— найдём замену.</p><div class="acts" style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="catalog.html">Перейти в&nbsp;каталог ' + ARROW + '</a><a class="btn ghost" href="index.html#form">Найти замену</a></div></div>';
      var ms = $("#more-sec"); if (ms) ms.remove();
      var cr0 = $("#crumb-sec"); if (cr0) cr0.textContent = "Позиция не найдена";
    } else {
      document.title = it.name + " — МАРТдекор";
      var cr = $("#crumb-sec"); if (cr) cr.innerHTML = '<a href="catalog.html?s=' + it.section + '">' + tx(secName(it.section)) + "</a> / " + tx(it.name);
      var im = secImg(it);
      var shots = [im, "img/style-classic.jpg", "img/style-nature.jpg", "img/sec-plaster.jpg"].filter(function (x, k, a) { return x && a.indexOf(x) === k; }).slice(0, 4);
      prod.innerHTML =
        '<div class="gallery"><div class="main"><img id="gmain" src="' + shots[0] + '" alt="' + esc(it.name) + '"><span class="lbl">Фото раздела, в работе поставим фото позиции</span></div>' +
        '<div class="thumbs">' + shots.map(function (s, k) { return '<button type="button" class="' + (k ? "" : "on") + '" data-src="' + s + '" aria-label="Фото ' + (k + 1) + '"><img src="' + s + '" alt=""></button>'; }).join("") + "</div></div>" +
        '<div class="info"><span class="eyebrow">' + tx(secName(it.section)) + "</span>" +
        "<h1>" + tx(it.name) + '</h1><p class="lead">' + tx(it.line) + "</p>" +
        '<div class="buy">' + priceHtml(it) + '<span class="status ' + it.status + '">' + STATUS[it.status] + " · для примера</span></div>" +
        '<dl class="specs">' + it.specs.map(function (p) { return "<dt>" + tx(p[0]) + "</dt><dd>" + tx(p[1]) + "</dd>"; }).join("") + "</dl>" +
        '<ul class="plus">' + it.pluses.map(function (p) { return '<li><i class="ti ti-check" aria-hidden="true"></i><span>' + tx(p) + "</span></li>"; }).join("") + "</ul>" +
        '<p class="needs"><i class="ti ti-info-circle" aria-hidden="true"></i><span>' + tx(it.needs) + "</span></p>" +
        '<div class="acts"><a class="btn" href="index.html#form">Подобрать комплект ' + ARROW + '</a><a class="btn ghost" href="https://wa.me/79094200420?text=' + encodeURIComponent("Здравствуйте! Интересует: " + it.name) + '" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp" aria-hidden="true"></i> Написать в WhatsApp</a></div>' +
        '<p class="src">Источник данных: ' + tx(it.source) + "</p></div>";
      $(".thumbs", prod).addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        $("#gmain").src = b.dataset.src;
        $$(".thumbs button", prod).forEach(function (x) { x.classList.toggle("on", x === b); });
      });
      var more = $("#more");
      if (more) more.innerHTML = ITEMS.filter(function (i) { return i.section === it.section && i.id !== it.id; }).concat(ITEMS.filter(function (i) { return i.section !== it.section && i.price; })).slice(0, 4).map(card).join("");
    }
  }

  // статья
  var art = $("#article");
  if (art) {
    var aid = new URLSearchParams(location.search).get("id");
    var a = ARTICLES.find(function (x) { return x.id === aid; }) || ARTICLES[0];
    document.title = a.title + " — МАРТдекор";
    var cover = a.id === "veneer" ? "img/sec-colorpanels.jpg" : "img/sec-walls.jpg";
    art.innerHTML = '<div class="crumbs"><a href="index.html">Главная</a> / Советы салона</div>' +
      '<span class="eyebrow">Совет салона</span><h1>' + tx(a.title) + '</h1><p class="lead">' + tx(a.lead) + "</p>" +
      '<div class="cover"><img src="' + cover + '" alt=""><span class="lbl">Иллюстрация с сайта салона</span></div>' + a.body.map(function (p) { return "<p>" + tx(p) + "</p>"; }).join("") +
      '<p class="src">Источник: ' + tx(a.source) + '</p><p style="margin-top:32px"><a class="btn" href="index.html#form">Получить подборку ' + ARROW + "</a></p>";
  }

  // окно заявки: создаём на любой странице
  var FORM_HTML = function (id) {
    return '<form class="form" id="' + id + '" novalidate><h3>Заявка на&nbsp;подбор</h3>' +
      '<label class="field"><span>Имя</span><input name="name" autocomplete="name" required placeholder="Как к вам обращаться"><em class="err">Напишите, как к&nbsp;вам обращаться</em></label>' +
      '<label class="field"><span>Телефон</span><input name="phone" type="tel" autocomplete="tel" inputmode="tel" required placeholder="+7 (___) ___-__-__"><em class="err">Нужен номер, чтобы&nbsp;прислать подборку</em></label>' +
      '<label class="field"><span>Что&nbsp;подбираем</span><select name="task"><option>Материалы для всей комнаты</option><option>Акцентную стену</option><option>Лепной декор</option><option>Ищу материал, снятый с производства</option></select></label>' +
      '<label class="file"><i class="ti ti-paperclip" aria-hidden="true"></i><span>Прикрепить фото или&nbsp;проект</span><span class="name"></span><input type="file" name="file" accept="image/*,.pdf"></label>' +
      '<label class="agree-box"><input type="checkbox" name="agree" required><span>Согласен на&nbsp;обработку персональных данных по&nbsp;<a href="https://martdecor.online/privacy-policy/" target="_blank" rel="noopener">политике конфиденциальности</a></span></label>' +
      '<em class="err agree-err">Отметьте согласие, чтобы&nbsp;отправить заявку</em>' +
      '<button class="btn" type="submit">Получить подборку ' + ARROW + '</button><div class="result" role="status" aria-live="polite"></div></form>';
  };
  var dlg = document.createElement("dialog");
  dlg.className = "fdlg"; dlg.id = "fdlg"; dlg.setAttribute("aria-label", "Заявка на подбор");
  dlg.innerHTML = '<button class="fdlg-x" type="button" aria-label="Закрыть"><i class="ti ti-x" aria-hidden="true"></i></button>' + FORM_HTML("form-modal");
  document.body.appendChild(dlg);
  var mf = $("#form-modal", dlg);
  mf.querySelector("h3").insertAdjacentHTML("afterend", '<p class="sub">Пришлите фото комнаты или&nbsp;проект&nbsp;— подборка займёт не&nbsp;больше 6&nbsp;часов.</p>');
  var lastFocus = null;
  var openForm = function () {
    lastFocus = document.activeElement;
    if (nav && nav.classList.contains("open") && burger) burger.click();
    if (typeof dlg.showModal === "function") { dlg.showModal(); document.body.classList.add("lock"); setTimeout(function () { mf.name.focus(); }, 30); }
    else location.href = "index.html#form";
  };
  var closeForm = function () { dlg.close(); };
  dlg.addEventListener("close", function () { document.body.classList.remove("lock"); if (lastFocus) lastFocus.focus(); });
  $(".fdlg-x", dlg).addEventListener("click", closeForm);
  dlg.addEventListener("click", function (e) { if (e.target === dlg) closeForm(); });
  document.addEventListener("click", function (e) {
    var a = e.target.closest("[data-form], a[href$='#form']");
    if (!a || dlg.contains(a)) return;
    e.preventDefault(); openForm();
  });

  // заявка: проверка полей. Отправка с сайта не подключена — честно ведём в мессенджер.
  $$("form.form").forEach(function (f) {
    var file = $('input[type="file"]', f), fname = $(".file .name", f), agree = f.agree;
    if (file) file.addEventListener("change", function () { fname.textContent = file.files[0] ? file.files[0].name : ""; });
    $$(".field input", f).forEach(function (inp) {
      inp.addEventListener("input", function () { inp.closest(".field").classList.remove("bad"); inp.removeAttribute("aria-invalid"); });
    });
    if (agree) agree.addEventListener("change", function () { f.classList.remove("bad-agree"); });
    f.addEventListener("submit", function (e) {
      e.preventDefault();
      var bad = null;
      $$(".field input[required]", f).forEach(function (inp) {
        var v = inp.value.trim(), ok = inp.type === "tel" ? v.replace(/\D/g, "").length >= 10 : v.length > 0;
        inp.closest(".field").classList.toggle("bad", !ok);
        if (!ok) { inp.setAttribute("aria-invalid", "true"); bad = bad || inp; } else inp.removeAttribute("aria-invalid");
      });
      if (agree && !agree.checked) { f.classList.add("bad-agree"); bad = bad || agree; }
      if (bad) { bad.focus(); return; }
      var msg = "Здравствуйте! Хочу подбор материалов.\nИмя: " + f.name.value.trim() + "\nТелефон: " + f.phone.value.trim() + "\nЧто подбираем: " + f.task.value + (file && file.files[0] ? "\nФото пришлю в этом чате." : "");
      $(".result", f).innerHTML = "Отправка заявок с&nbsp;сайта пока не&nbsp;подключена. Нажмите кнопку&nbsp;— откроется чат с&nbsp;вашими данными, фото можно прикрепить там." +
        '<div class="row"><a class="btn sm" href="https://wa.me/79094200420?text=' + encodeURIComponent(msg) + '" target="_blank" rel="noopener"><i class="ti ti-brand-whatsapp" aria-hidden="true"></i> WhatsApp</a><a class="btn ghost sm" href="https://t.me/martdecorrostov" target="_blank" rel="noopener"><i class="ti ti-brand-telegram" aria-hidden="true"></i> Telegram</a></div>';
      f.classList.add("sent");
    });
  });

  function reveal() {
    var els = $$(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
  }
  openNow(); reveal();
})();
