let questions = [];
let currentQuestion = 0;
let answers = [];
let userData = { city: "", group: "" };

// Загружаем вопросы
fetch("questions.json")
  .then(res => res.json())
  .then(data => { questions = data; });

// Выбор роли
function selectRole(role) {
  document.getElementById("role-screen").classList.add("hidden");
  if (role === "user") {
    document.getElementById("user-login").classList.remove("hidden");
  } else {
    document.getElementById("admin-screen").classList.remove("hidden");
  }
}

// Начало теста
function startTest() {
  const city = document.getElementById("city").value.trim();
  const group = document.getElementById("group").value.trim();
  if (!city || !group) return alert("Введите город и номер группы!");
  userData = { city, group };
  currentQuestion = 0;
  answers = [];
  document.getElementById("user-login").classList.add("hidden");
  document.getElementById("test-screen").classList.remove("hidden");
  showQuestion();
}

// Показать вопрос
function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById("question-text").textContent = q.text;
  const form = document.getElementById("answers-form");
  form.innerHTML = "";
  for (let i = 1; i <= 5; i++) {
    const label = document.createElement("label");
    label.innerHTML = `<input type="radio" name="answer" value="${i}"> ${i}`;
    form.appendChild(label);
  }
}

// Следующий вопрос
function nextQuestion() {
  const checked = document.querySelector('input[name="answer"]:checked');
  if (!checked) return alert("Выберите вариант!");
  answers.push({ ...questions[currentQuestion], value: Number(checked.value) });
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion();
  } else {
    showResult();
  }
}

// Показать результат
function showResult() {
  document.getElementById("test-screen").classList.add("hidden");
  document.getElementById("result-screen").classList.remove("hidden");

  const scales = {};
  answers.forEach(a => {
    if (!scales[a.scale]) scales[a.scale] = [];
    scales[a.scale].push(a.value);
  });
  const labels = Object.keys(scales);
  const data = labels.map(k => {
    const arr = scales[k];
    return arr.reduce((s, x) => s + x, 0) / arr.length;
  });

  const ctx = document.getElementById("radarChart").getContext("2d");
  new Chart(ctx, {
    type: "radar",
    data: {
      labels,
      datasets: [{
        label: "Ваш профиль",
        data,
        borderColor: "rgba(44,123,229,0.8)",
        backgroundColor: "rgba(44,123,229,0.3)"
      }]
    },
    options: {
      scales: { r: { suggestedMin: 1, suggestedMax: 5 } }
    }
  });

  // Сохраняем результат в браузере
  const allResults = JSON.parse(localStorage.getItem("results") || "[]");
  allResults.push({ ...userData, scales });
  localStorage.setItem("results", JSON.stringify(allResults));
}

function restart() {
  document.getElementById("result-screen").classList.add("hidden");
  document.getElementById("role-screen").classList.remove("hidden");
}

function showStats() {
  const results = JSON.parse(localStorage.getItem("results") || "[]");
  if (results.length === 0) {
    document.getElementById("stats-output").textContent = "Нет данных.";
    return;
  }
  let text = "";
  results.forEach(r => {
    text += `Город: ${r.city}, Группа: ${r.group}\n`;
    for (let scale in r.scales) {
      const avg = (r.scales[scale].reduce((s,x)=>s+x,0)/r.scales[scale].length).toFixed(1);
      text += `  ${scale}: ${avg}\n`;
    }
    text += "\n";
  });
  document.getElementById("stats-output").textContent = text;
}