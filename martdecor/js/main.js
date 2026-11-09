(function () {
  var T = window.typo || function (s) { return s; };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };
  var tx = function (s) { return T(esc(s)); };
  var fmt = function (n) { return n.toLocaleString("ru-RU").replace(/\s/g, " "); };
  var secName = function (id) { var s = SECTIONS.find(function (x) { return x.id === id; }); return s ? s.name : ""; };
  var STATUS = { in: "В наличии", few: "Мало", order: "Под заказ" };

  function priceHtml(it) {
    return it.price ? '<span class="price">' + fmt(it.price) + " " + it.unit + "</span>" : '<span class="price ask">Цена по запросу</span>';
  }
  function secImg(it) { var x = SECTIONS.find(function (q) { return q.id === it.section; }); return it.img || (x && x.img) || ""; }
  function phHtml(it) {
    var im = secImg(it);
    return im ? '<div class="ph"><img src="' + im + '" alt="" loading="lazy"><span class="lbl">Фото раздела</span></div>' : '<div class="ph">Фото: ' + tx(it.name) + "</div>";
  }
  function card(it) {
    return '<a class="item reveal" href="item.html?id=' + it.id + '">' +
      phHtml(it) +
      '<div class="body"><span class="sec">' + tx(secName(it.section)) + "</span>" +
      "<h3>" + tx(it.name) + '</h3><p class="line">' + tx(it.line) + "</p>" +
      '<div class="bottom">' + priceHtml(it) + '<span class="status ' + it.status + '">' + STATUS[it.status] + "</span></div></div></a>";
  }

  // «открыто сейчас»: ПН-ПТ 10-19, СБ-ВС 10-17 (Ростов, UTC+3)
  function openNow() {
    var el = document.querySelectorAll("[data-open]");
    if (!el.length) return;
    var now = new Date(Date.now() + (now0() + 180) * 60000);
    function now0() { return new Date().getTimezoneOffset(); }
    var d = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
    var close = d === 0 || d === 6 ? 17 : 19, on = h >= 10 && h < close;
    el.forEach(function (e) {
      e.className = "open-now " + (on ? "on" : "off");
      e.textContent = on ? "Открыто до " + close + ":00" : "Закрыто · откроется в 10:00";
    });
  }

  // главная
  var cats = $("#cats");
  if (cats) {
    cats.innerHTML = SECTIONS.map(function (s) {
      var prices = ITEMS.filter(function (i) { return i.section === s.id && i.price; }).map(function (i) { return i.price; });
      var from = prices.length ? "от " + fmt(Math.min.apply(null, prices)) + " ₽" : "Цена по запросу";
      return '<a class="cat reveal" href="catalog.html?s=' + s.id + '"><div class="ph"><i class="ti ' + s.icon + '"></i></div>' +
        '<div class="body"><h3>' + tx(s.name) + "</h3><p>" + tx(s.fact) + '</p><div class="from">' + from + "</div></div></a>";
    }).join("");
  }
  var tiles = $("#tiles");
  if (tiles) {
    tiles.innerHTML = SECTIONS.map(function (s) {
      var prices = ITEMS.filter(function (i) { return i.section === s.id && i.price; }).map(function (i) { return i.price; });
      var from = prices.length ? '<span class="from">от ' + fmt(Math.min.apply(null, prices)) + " ₽</span>" : '<span class="from ask">по запросу</span>';
      return '<a class="tile reveal" href="catalog.html?s=' + s.id + '"><img src="' + s.img + '" alt="" loading="lazy"><div class="over"><div><h3>' + tx(s.name) + "</h3><p>" + tx(s.fact) + "</p></div>" + from + "</div></a>";
    }).join("");
  }
  // стили: вкладки
  var tabs = $("#tabs");
  if (tabs) {
    var pics = document.querySelectorAll("#stage img");
    tabs.addEventListener("click", function (e) {
      var t = e.target.closest(".tab"); if (!t || e.target.closest("a")) return;
      tabs.querySelectorAll(".tab").forEach(function (b) { b.classList.toggle("on", b === t); });
      pics.forEach(function (im, i) { im.classList.toggle("on", String(i) === t.dataset.i); });
    });
  }
  // отзывы: одна большая цитата
  var bq = $("#bigq");
  if (bq) {
    var qi = 0;
    function showQ() {
      var r = REVIEWS[qi];
      bq.innerHTML = '<div class="fade"><p>' + tx(r.text) + "</p><footer><b>" + tx(r.name) + "</b> · " + r.date + " · Яндекс Карты</footer></div>";
      $("#qcnt").textContent = (qi + 1) + " / " + REVIEWS.length;
    }
    $("#qprev").addEventListener("click", function () { qi = (qi + REVIEWS.length - 1) % REVIEWS.length; showQ(); });
    $("#qnext").addEventListener("click", function () { qi = (qi + 1) % REVIEWS.length; showQ(); });
    showQ();
  }
  // шапка над первым экраном
  var top = $("#top");
  if (top && top.classList.contains("over")) {
    var onScroll = function () { top.classList.toggle("solid", window.scrollY > 40); };
    window.addEventListener("scroll", onScroll, { passive: true }); onScroll();
  }
  var pop = $("#popular");
  if (pop) pop.innerHTML = ITEMS.filter(function (i) { return i.price; }).map(card).join("");
  var rv = $("#reviews");
  if (rv) rv.innerHTML = REVIEWS.map(function (r) {
    return '<div class="review reveal"><div class="stars">★★★★★</div><p>«' + tx(r.text) + '»</p><footer><b>' + tx(r.name) + "</b>" + r.date + " · Яндекс Карты</footer></div>";
  }).join("");
  var tips = $("#tips");
  if (tips) tips.innerHTML = ARTICLES.map(function (a) {
    return '<a class="tip reveal" href="article.html?id=' + a.id + '"><div class="ph"></div><div class="body"><h3>' + tx(a.title) + "</h3><p>" + tx(a.lead) + "</p></div></a>";
  }).join("");

  // каталог
  var grid = $("#catalog-grid");
  if (grid) {
    var params = new URLSearchParams(location.search);
    var state = { q: "", s: params.get("s") || "", priced: false, inStock: false };
    var chips = $("#sec-chips");
    chips.innerHTML = '<button class="chip" data-s="">Все</button>' + SECTIONS.map(function (s) { return '<button class="chip" data-s="' + s.id + '">' + tx(s.name) + "</button>"; }).join("");
    function render() {
      chips.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("on", c.dataset.s === state.s); });
      var q = state.q.toLowerCase();
      var list = ITEMS.filter(function (i) {
        if (state.s && i.section !== state.s) return false;
        if (state.priced && !i.price) return false;
        if (state.inStock && i.status === "order") return false;
        if (q && (i.name + " " + i.line + " " + i.tags.join(" ")).toLowerCase().indexOf(q) < 0) return false;
        return true;
      });
      $("#count").textContent = "Найдено позиций: " + list.length;
      grid.innerHTML = list.length ? list.map(card).join("") : '<div class="empty">Ничего не нашлось. Пришлите фото интерьера — подберём сами.</div>';
      reveal();
    }
    chips.addEventListener("click", function (e) { var b = e.target.closest(".chip"); if (b) { state.s = b.dataset.s; render(); } });
    $("#q").addEventListener("input", function (e) { state.q = e.target.value; render(); });
    $("#priced").addEventListener("change", function (e) { state.priced = e.target.checked; render(); });
    $("#instock").addEventListener("change", function (e) { state.inStock = e.target.checked; render(); });
    render();
  }

  // карточка
  var prod = $("#product");
  if (prod) {
    var id = new URLSearchParams(location.search).get("id");
    var it = ITEMS.find(function (i) { return i.id === id; }) || ITEMS[0];
    document.title = it.name + " — МАРТдекор";
    prod.innerHTML =
      '<div class="gallery"><div class="main">' + (secImg(it) ? '<img src="' + secImg(it) + '" alt=""><span class="lbl">Фото раздела, в работе поставим фото позиции</span>' : "Фото: " + tx(it.name)) + '</div><div class="thumbs"><div></div><div></div><div></div><div></div></div></div>' +
      '<div><a class="eyebrow" style="text-decoration:none" href="catalog.html?s=' + it.section + '">' + tx(secName(it.section)) + "</a>" +
      "<h1>" + tx(it.name) + '</h1><p class="lead">' + tx(it.line) + "</p>" +
      '<div style="display:flex;gap:14px;align-items:center;margin:20px 0">' + priceHtml(it).replace('class="price"', 'class="price" style="font-size:26px"') + '<span class="status ' + it.status + '">' + STATUS[it.status] + " · для примера</span></div>" +
      '<dl class="specs">' + it.specs.map(function (p) { return "<dt>" + tx(p[0]) + "</dt><dd>" + tx(p[1]) + "</dd>"; }).join("") + "</dl>" +
      '<ul class="plus">' + it.pluses.map(function (p) { return '<li><i class="ti ti-check"></i><span>' + tx(p) + "</span></li>"; }).join("") + "</ul>" +
      '<p class="needs"><i class="ti ti-info-circle"></i><span>' + tx(it.needs) + "</span></p>" +
      '<div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="index.html#form">Подобрать к моему интерьеру</a><a class="btn ghost" href="index.html#visit">Посмотреть образец в салоне</a></div>' +
      '<p class="src">Источник данных: ' + tx(it.source) + "</p></div>";
    var more = $("#more");
    if (more) more.innerHTML = ITEMS.filter(function (i) { return i.section === it.section && i.id !== it.id; }).concat(ITEMS.filter(function (i) { return i.section !== it.section && i.price; })).slice(0, 4).map(card).join("");
  }

  // статья
  var art = $("#article");
  if (art) {
    var aid = new URLSearchParams(location.search).get("id");
    var a = ARTICLES.find(function (x) { return x.id === aid; }) || ARTICLES[0];
    document.title = a.title + " — МАРТдекор";
    art.innerHTML = '<div class="crumbs"><a href="index.html">Главная</a> / <a href="index.html#tips-sec">Советы</a></div>' +
      '<span class="eyebrow">Совет салона</span><h1>' + tx(a.title) + '</h1><p class="lead">' + tx(a.lead) + "</p>" +
      '<div class="cover">Иллюстрация с сайта салона</div>' + a.body.map(function (p) { return "<p>" + tx(p) + "</p>"; }).join("") +
      '<p class="src">Источник: ' + tx(a.source) + '</p><p style="margin-top:28px"><a class="btn" href="index.html#form">Получить подборку</a></p>';
  }

  // форма — демо
  document.querySelectorAll("form.card").forEach(function (f) {
    f.addEventListener("submit", function (e) { e.preventDefault(); f.classList.add("sent"); });
  });

  function reveal() {
    var els = document.querySelectorAll(".reveal:not(.in)");
    if (!("IntersectionObserver" in window)) { els.forEach(function (e) { e.classList.add("in"); }); return; }
    var io = new IntersectionObserver(function (en) { en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } }); }, { threshold: .08 });
    els.forEach(function (e) { io.observe(e); });
  }
  openNow(); reveal();
})();
