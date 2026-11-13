// Меню на мобильном
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  burger.setAttribute('aria-expanded', open);
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  burger.setAttribute('aria-expanded', 'false');
}));

// Появление при прокрутке
const io = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Способы брендирования
const methods = document.querySelectorAll('.method');
const methodImg = document.getElementById('methodImg');
methods.forEach(m => m.addEventListener('click', () => {
  methods.forEach(x => x.setAttribute('aria-selected', 'false'));
  m.setAttribute('aria-selected', 'true');
  methodImg.style.opacity = 0;
  setTimeout(() => { methodImg.src = m.dataset.img; methodImg.alt = m.dataset.alt; methodImg.style.opacity = 1; }, 200);
}));

// Квиз
const steps = [...document.querySelectorAll('.q-step')];
const bar = document.getElementById('qBar');
const count = document.getElementById('qCount');
const back = document.getElementById('qBack');
const next = document.getElementById('qNext');
const form = document.getElementById('quizForm');
const TOTAL = 5;
let cur = 1;

function show(n) {
  cur = n;
  steps.forEach(s => s.classList.toggle('on', +s.dataset.step === n));
  bar.style.width = Math.min(n, TOTAL) / TOTAL * 100 + '%';
  count.textContent = n > TOTAL ? 'Готово' : `Шаг ${n} из ${TOTAL}`;
  back.disabled = n === 1;
  next.innerHTML = n === TOTAL ? 'Получить расчёт <i class="ti ti-send"></i>' : 'Дальше <i class="ti ti-arrow-right"></i>';
  document.getElementById('qNav').style.display = n > TOTAL ? 'none' : '';
}

next.addEventListener('click', () => {
  if (cur === TOTAL) {
    const phone = form.phone.value.trim();
    if (!phone) { form.phone.focus(); form.phone.style.borderColor = 'var(--accent)'; return; }
    const d = new FormData(form);
    document.getElementById('qSummary').textContent =
      `${d.get('kind')}, тираж ${d.get('qty')} шт., нанесение: ${d.get('logo').toLowerCase()}. Менеджер свяжется с вами и пришлёт предварительный расчёт.`;
  }
  show(cur + 1);
});
back.addEventListener('click', () => show(cur - 1));

document.getElementById('tz').addEventListener('change', e => {
  const f = e.target.files[0];
  document.getElementById('tzName').textContent = f ? f.name : 'Прикрепить ТЗ, эскиз или фото образца';
});
