// js/calculateResults.mjs
export async function calculateResults(answers) {
  const response = await fetch("data/scales.json");
  const scales = await response.json();

  const results = {};

  for (const [scaleName, scaleData] of Object.entries(scales)) {
    let score = 0;

    // базовый подсчёт положительных ответов
    for (const q of scaleData.questions) {
      const idx = q - 1;
      if (answers[idx]) score++;
    }

    // Специальная логика для антисоциальной черты:
    // учитываем шкалу только если 99-й = "Да" и есть ≥3 других "Да"
    if (scaleName === "Антисоциальное") {
      const q99 = answers[98]; // индекс 99-го вопроса
      const otherYes = scaleData.questions.filter(q => q !== 99 && answers[q - 1]).length;
      if (!(q99 && otherYes >= 3)) {
        score = 0; // условие не выполнено — шкала не считается
      }
    }

    results[scaleName] = { score, threshold: scaleData.threshold };
  }

  return results;
}
