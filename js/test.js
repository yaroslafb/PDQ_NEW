// js/test.js
let currentQuestion = 0;
let answers = [];

async function loadQuestions() {
  const response = await fetch("data/questions.json");
  const questions = await response.json();
  return questions;
}

function showQuestion(questions) {
  const questionText = document.getElementById("questionText");
  const answersContainer = document.getElementById("answersContainer");
  const progress = document.getElementById("progress");
  const resultBtn = document.getElementById("resultBtn");

  const q = questions[currentQuestion];
  questionText.textContent = q.text;
  progress.textContent = `Вопрос ${currentQuestion + 1} из ${questions.length}`;

  answersContainer.innerHTML = ""; // очистим предыдущие элементы

  // --- 98 вопрос (Пограничное) ---
  if (q.id === 98) {
    const items98 = [
      "Тратил больше денег, чем имел",
      "Имел сексуальные отношения с человеком, которого едва знал",
      "Злоупотреблял алкоголем",
      "Принимал наркотики",
      "Был неумеренным в еде",
      "Безрассудно рисковал",
      "Совершал мелкие кражи в магазинах",
      "Играл в азартные игры"
    ];

    const list = document.createElement("div");
    list.style.textAlign = "left";
    list.style.margin = "12px 0";

    items98.forEach((t, i) => {
      const label = document.createElement("label");
      label.style.display = "block";
      label.style.marginBottom = "6px";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.name = "sub98";
      cb.value = i;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(" " + t));
      list.appendChild(label);
    });

    const btn = document.createElement("button");
    btn.textContent = "Продолжить";
    btn.className = "button";
    btn.onclick = () => {
      const checked = document.querySelectorAll('input[name=sub98]:checked').length;
      answers[currentQuestion] = checked >= 2;
      nextQuestion(questions);
    };

    answersContainer.appendChild(list);
    answersContainer.appendChild(btn);
    return;
  }

  // --- 99 вопрос (Антисоциальное) ---
  if (q.id === 99) {
    const items99 = [
      "Меня считали хулиганом",
      "Как правило, я начинал драться первым",
      "Я использовал в драках все средства, которые попадались мне под руку",
      "Я грабил или нападал на прохожих",
      "Я применял физическое насилие по отношению к людям",
      "Я жестоко относился к животным",
      "Я принуждал кого-либо заниматься со мной сексом",
      "Я много врал",
      "Я не приходил домой ночевать без разрешения родителей",
      "Я воровал вещи",
      "Я устраивал поджоги",
      "Я бил окна или портил чьё-либо имущество",
      "Я более одного раза убегал из дома",
      "До 13 лет я часто прогуливал школу",
      "Я забирался в чужие дома, автомобили или рабочие помещения"
    ];

    const list = document.createElement("div");
    list.style.textAlign = "left";
    list.style.margin = "12px 0";

    items99.forEach((t, i) => {
      const label = document.createElement("label");
      label.style.display = "block";
      label.style.marginBottom = "6px";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.name = "sub99";
      cb.value = i;
      label.appendChild(cb);
      label.appendChild(document.createTextNode(" " + t));
      list.appendChild(label);
    });

    const btn = document.createElement("button");
    btn.textContent = "Продолжить";
    btn.className = "button";
    btn.onclick = () => {
      const checked = document.querySelectorAll('input[name=sub99]:checked').length;
      answers[currentQuestion] = checked >= 3;
      nextQuestion(questions);
    };

    answersContainer.appendChild(list);
    answersContainer.appendChild(btn);
    return;
  }

  // --- Все остальные вопросы ---
  const yesBtn = document.createElement("button");
  yesBtn.textContent = "Да";
  yesBtn.className = "button answer";

  const noBtn = document.createElement("button");
  noBtn.textContent = "Нет";
  noBtn.className = "button answer";

  yesBtn.onclick = () => { answers[currentQuestion] = true; nextQuestion(questions); };
  noBtn.onclick = () => { answers[currentQuestion] = false; nextQuestion(questions); };

  answersContainer.appendChild(yesBtn);
  answersContainer.appendChild(noBtn);
  resultBtn.style.display = "none";
}

function nextQuestion(questions) {
  currentQuestion++;
  if (currentQuestion < questions.length) {
    showQuestion(questions);
  } else {
    localStorage.setItem("pdqAnswers", JSON.stringify(answers));
    document.getElementById("questionBox").style.display = "none";
    const resultBtn = document.getElementById("resultBtn");
    resultBtn.style.display = "block";
    resultBtn.onclick = () => { window.location.href = "results.html"; };
  }
}

loadQuestions().then((questions) => showQuestion(questions));
