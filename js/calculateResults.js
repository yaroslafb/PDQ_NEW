import scales from '../data/scales.json' assert { type: 'json' };

// Группы особых вопросов
const RISK_ITEMS = [99, 100, 101, 102, 103, 104, 105, 106];
const CHILDHOOD_ITEMS = [107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122];

export function calculateResults(answers) {
  const results = {};

  for (const [scaleName, { questions, threshold }] of Object.entries(scales)) {
    let yesCount = 0;

    // Считаем базовые "Да"
    for (const q of questions) {
      if (answers[q] === true) yesCount++;
    }

    // --- Особый случай: Пограничное ---
    if (scaleName === 'Пограничное') {
      const riskYes = RISK_ITEMS.filter(id => answers[id]).length;
      if (riskYes >= 2) yesCount++; // вопрос 98 засчитывается, если ≥2 положительных
    }

    // --- Особый случай: Антисоциальное ---
    if (scaleName === 'Антисоциальное') {
      const childhoodYes = CHILDHOOD_ITEMS.filter(id => answers[id]).length;
      const antisocialCore = [8, 20, 33, 46, 59, 75, 94];
      const antisocialYes = antisocialCore.filter(id => answers[id]).length;

      yesCount = antisocialYes; // базовые вопросы
      if (childhoodYes >= 3) yesCount++; // "Б" = вопрос 99 засчитывается
    }

    // Определяем цвет в зависимости от расстояния до порога
    let color;
    if (yesCount >= threshold) color = 'rgba(255, 0, 0, 0.5)'; // красный
    else if (yesCount === threshold - 1) color = 'rgba(255, 200, 0, 0.5)'; // желтый
    else color = 'rgba(0, 200, 0, 0.5)'; // зеленый

    results[scaleName] = { score: yesCount, threshold, color };
  }

  return results;
}
