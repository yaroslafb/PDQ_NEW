/* ========== Конфигурация ========== */

// Админ-пароль
const ADMIN_PASSWORD = "testpdq";

// Справочник городов и групп (можно редактировать)
const CITY_GROUPS = {
  "Москва": ["Группа 1", "Группа 2", "Группа 3"],
  "Санкт-Петербург": ["Группа A", "Группа B"],
  "Казань": ["Группа 1", "Группа 2", "Группа 3", "Группа 4"],
  "Другой": ["Группа 1"]
};

/* ========== Переменные состояния ========== */
let questions = [];
let currentQuestion = 0;
let answers = [];
let participant = { city: "", group: "" };
let radarChart = null;

/* ========== Элементы DOM ========== */
const el = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  // Загрузка вопросов
  fetch("questions.json")
    .then(r => r.json())
    .then(data => { questions = data; })
    .catch(err => { alert("Ошибка загрузки questions.json"); console.error(err); });

  // Инициализация селектов городов
  initCitySelects();
});

/* ========== UI навигация ========== */
function selectRole(role) {
  hideAllScreens();
  if (role === "user") {
    el("user-login").classList.remove("hidden");
  } else if (role === "admin") {
    el("admin-login").classList.remove("hidden");
  }
}

function backToHome() {
  hideAllScreens();
  // показать главную (hero) — просто скрыть все карточки
  // кнопки остаются в хедере
}

function hideAllScreens() {
  ["user-login","admin-login","test-screen","result-screen","admin-screen"].forEach(id=>{
    el(id).classList.add("hidden");
  });
}

/* ========== Город и группы ========== */
function initCitySelects() {
  const citySelect = el("citySelect");
  const adminCity = el("adminCityFilter");

  // очистка и заполнение
  Object.keys(CITY_GROUPS).forEach(city => {
    const opt = document.createElement("option"); opt.value = city; opt.textContent = city;
    citySelect.appendChild(opt);
    const opt2 = opt.cloneNode(true);
    adminCity.appendChild(opt2);
  });

  // admin groups также начальные
  populateAdminGroupFilter();
}

function onCityChange() {
  const city = el("citySelect").value;
  const groupSelect = el("groupSelect");
  groupSelect.innerHTML = "";
  if (!city) {
    const opt = document.createElement("option"); opt.value=""; opt.textContent="— Сначала выберите город —";
    groupSelect.appendChild(opt);
    return;
  }
  const groups = CITY_GROUPS[city] || ["Группа 1"];
  groups.forEach(g => {
    const opt = document.createElement("option"); opt.value=g; opt.textContent=g;
    groupSelect.appendChild(opt);
  });
}

function populateAdminGroupFilter() {
  const adminGroup = el("adminGroupFilter");
  adminGroup.innerHTML = "";
  const allOpt = document.createElement("option"); allOpt.value=""; allOpt.textContent="Все группы";
  adminGroup.appendChild(allOpt);
}

/* ========== Админ: проверка пароля ========== */
function checkAdminPassword() {
  const p = el("adminPass").value || "";
  if (p === ADMIN_PASSWORD) {
    el("admin-login").classList.add("hidden");
    el("admin-screen").classList.remove("hidden");
    renderAdminFilters(); // заполнить фильтры
    renderAdminStats();
    el("adminPass").value = "";
  } else {
    alert("Неверный пароль.");
  }
}

function logoutAdmin() {
  el("admin-screen").classList.add("hidden");
  backToHome();
}

/* ========== Запуск теста ========== */
function startTest() {
  const city = el("citySelect").value;
  const group = el("groupSelect").value;
  if (!city || !group) return alert("Пожалуйста, выберите город и группу.");
  participant = { city, group, startedAt: new Date().toISOString() };
  currentQuestion = 0;
  answers = [];
  el("user-login").classList.add("hidden");
  el("test-screen").classList.remove("hidden");
  renderQuestion();
}

/* ========== Вопросы: показ и навигация ========== */
function renderQuestion() {
  if (!questions.length) {
    el("question-text").textContent = "Вопросы ещё не загружены.";
    return;
  }
  const q = questions[currentQuestion];
  el("question-text").textContent = q.text;
  el("progressLabel").textContent = `Вопрос ${currentQuestion+1} / ${questions.length}`;
  el("participantLabel").textContent = `${participant.city} — ${participant.group}`;

  const form = el("answers-form");
  form.innerHTML = "";
  // Лайкерт 1..5 с метками (1 — совсем не согласен, 5 — полностью согласен)
  const scaleLabels = ["1","2","3","4","5"];
  scaleLabels.forEach(val => {
    const lbl = document.createElement("label");
    lbl.innerHTML = `<input type="radio" name="answer" value="${val}"> ${val}`;
    form.appendChild(lbl);
  });

  // если уже отвечали — отмечаем
  if (answers[currentQuestion] && answers[currentQuestion].value) {
    const sel = form.querySelector(`input[value="${answers[currentQuestion].value}"]`);
    if (sel) sel.checked = true;
  }

  // prev button visibility
  el("prevBtn").disabled = currentQuestion === 0;
}

function nextQuestion() {
  const checked = document.querySelector('input[name="answer"]:checked');
  if (!checked) return alert("Выберите вариант ответа (1–5).");
  answers[currentQuestion] = {
    ...questions[currentQuestion],
    value: Number(checked.value)
  };
  if (currentQuestion < questions.length - 1) {
    currentQuestion++;
    renderQuestion();
  } else {
    finishTest();
  }
}

function prevQuestion() {
  if (currentQuestion === 0) return;
  currentQuestion--;
  renderQuestion();
}

/* ========== Завершение теста и результат ========== */
function finishTest() {
  el("test-screen").classList.add("hidden");
  el("result-screen").classList.remove("hidden");

  // Собираем средние по шкалам
  const scales = {};
  answers.forEach(a => {
    if (!scales[a.scale]) scales[a.scale] = [];
    scales[a.scale].push(a.value);
  });
  const labels = Object.keys(scales);
  const dataset = labels.map(k => {
    const arr = scales[k];
    const avg = arr.reduce((s,x)=>s+x,0)/arr.length;
    // округлим до 2х знаков
    return Math.round(avg * 100) / 100;
  });

  // Рендер диаграммы
  const ctx = el("radarChart").getContext("2d");
  if (radarChart) radarChart.destroy();
  radarChart = new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: "Ваш профиль",
        data: dataset,
        borderColor: "rgba(0,113,227,0.9)",
        backgroundColor: "rgba(0,113,227,0.18)",
        pointRadius:4,
        borderWidth:2
      }]
    },
    options: {
      scales: {
        r: {
          suggestedMin: 1,
          suggestedMax: 5,
          beginAtZero: false,
          ticks: { stepSize: 1 }
        }
      },
      responsive: true,
      maintainAspectRatio: false
    }
  });

  // Текст интерпретации (простой пример)
  let interp = "<strong>Средние значения по шкалам:</strong><br>";
  labels.forEach((lab,i)=>{
    interp += `${lab}: ${dataset[i]}<br>`;
  });
  el("interpretation").innerHTML = interp;

  // Сохраняем в localStorage
  const all = JSON.parse(localStorage.getItem("pdq_results_v1") || "[]");
  all.push({
    participant,
    timestamp: new Date().toISOString(),
    answers,
    scales // массивы значений по шкалам
  });
  localStorage.setItem("pdq_results_v1", JSON.stringify(all));
}

/* ========== Экспорт отдельного результата ========== */
function downloadResult() {
  // сформируем CSV: заголовок, город, группа, шкалы со средним
  const data = JSON.parse(localStorage.getItem("pdq_results_v1") || "[]");
  if (!data.length) return alert("Нет данных для скачивания.");
  const last = data[data.length-1];
  const scales = {};
  last.answers.forEach(a => {
    if (!scales[a.scale]) scales[a.scale] = [];
    scales[a.scale].push(a.value);
  });
  const rows = [["PDQ-4 Result"]];
  rows.push(["Город", last.participant.city]);
  rows.push(["Группа", last.participant.group]);
  rows.push(["Дата", last.timestamp]);
  rows.push([]);
  rows.push(["Шкала","Среднее"]);
  Object.keys(scales).forEach(k=>{
    const avg = (scales[k].reduce((s,x)=>s+x,0)/scales[k].length).toFixed(2);
    rows.push([k, avg]);
  });
  const csv = rows.map(r=>r.map(cell=>`"${String(cell).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PDQ4_result_${last.participant.city}_${last.participant.group}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ========== Админ: статистика и экспорт ========== */
function renderAdminFilters() {
  // заполним фильтр групп на основании всех результатов
  const all = JSON.parse(localStorage.getItem("pdq_results_v1") || "[]");
  const cities = new Set();
  const groups = new Set();
  all.forEach(r=>{
    cities.add(r.participant.city);
    groups.add(r.participant.group);
  });

  const citySel = el("adminCityFilter");
  citySel.innerHTML = `<option value="">Все города</option>`;
  Array.from(cities).sort().forEach(c => {
    const o = document.createElement("option"); o.value=c; o.textContent=c; citySel.appendChild(o);
  });

  const groupSel = el("adminGroupFilter");
  groupSel.innerHTML = `<option value="">Все группы</option>`;
  Array.from(groups).sort().forEach(g => {
    const o = document.createElement("option"); o.value=g; o.textContent=g; groupSel.appendChild(o);
  });
}

function renderAdminStats() {
  const cityFilter = el("adminCityFilter").value;
  const groupFilter = el("adminGroupFilter").value;
  const all = JSON.parse(localStorage.getItem("pdq_results_v1") || "[]");
  let filtered = all;
  if (cityFilter) filtered = filtered.filter(r => r.participant.city === cityFilter);
  if (groupFilter) filtered = filtered.filter(r => r.participant.group === groupFilter);

  if (!filtered.length) {
    el("admin-output").textContent = "Нет сохранённых результатов для выбранных фильтров.";
    return;
  }

  // Соберём средние по шкалам (агрегируем)
  const agg = {}; // scale -> [values...]
  filtered.forEach(rec => {
    rec.answers.forEach(a => {
      if (!agg[a.scale]) agg[a.scale] = [];
      agg[a.scale].push(a.value);
    });
  });
  let out = `Найдено записей: ${filtered.length}\n\n`;
  out += "Средние по шкалам (по выбранным записям):\n";
  Object.keys(agg).forEach(k=>{
    const arr = agg[k];
    const avg = (arr.reduce((s,x)=>s+x,0)/arr.length).toFixed(2);
    out += `  ${k}: ${avg}\n`;
  });

  // Список записей (коротко)
  out += "\nЗаписи:\n";
  filtered.slice().reverse().forEach(rec=>{
    out += `• ${rec.timestamp} — ${rec.participant.city} / ${rec.participant.group}\n`;
  });

  el("admin-output").textContent = out;
}

function exportAllResults() {
  const all = JSON.parse(localStorage.getItem("pdq_results_v1") || "[]");
  if (!all.length) return alert("Нет данных.");
  // Сделаем CSV с детальной записью по каждому ответу (каждая строка = запись участника)
  const header = ["timestamp","city","group","scale","avg"];
  const rows = [header];
  all.forEach(rec=>{
    // среднее по шкале
    const scales = {};
    rec.answers.forEach(a => {
      if (!scales[a.scale]) scales[a.scale] = [];
      scales[a.scale].push(a.value);
    });
    Object.keys(scales).forEach(s => {
      const avg = (scales[s].reduce((sum,x)=>sum+x,0)/scales[s].length).toFixed(2);
      rows.push([rec.timestamp, rec.participant.city, rec.participant.group, s, avg]);
    });
  });
  const csv = rows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(",")).join("\n");
  const blob = new Blob([csv], {type:"text/csv;charset=utf-8;"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `PDQ4_all_results.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
