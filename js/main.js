// js/main.js

const participantBtn = document.getElementById("participantBtn");
const adminBtn = document.getElementById("adminBtn");
const formContainer = document.getElementById("formContainer");
const startBtn = document.getElementById("startBtn");

let role = null;

participantBtn.onclick = () => {
  role = "participant";
  formContainer.style.display = "block";
};

adminBtn.onclick = () => {
  const pass = prompt("Введите пароль администратора:");
  if (pass === "testpdq") {
    alert("Вход выполнен. Открывается статистика (в будущем).");
    // позже здесь можно будет добавить переход на admin.html
  } else {
    alert("Неверный пароль");
  }
};

startBtn.onclick = () => {
  const city = document.getElementById("cityInput").value.trim();
  const group = document.getElementById("groupInput").value.trim();

  if (!city || !group) {
    alert("Пожалуйста, заполните город и группу");
    return;
  }

  // сохраняем данные участника
  localStorage.setItem("pdqCity", city);
  localStorage.setItem("pdqGroup", group);

  window.location.href = "test.html";
};
