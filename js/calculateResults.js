import scales from '../data/scales.json';

// Вспомогательные группы для особых шкал
const RISK_ITEMS = [99, 100, 101, 102, 103, 104, 105, 106];
const CHILDHOOD_ITEMS = [107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122];

export function calculateResults(answers) {
  const results = {};

  for (const [scale, questions] of Object.entries(scales)) {
    let count = 0;

    // базовый подсчет по шкале
    questions.forEach(q => {
      if (answers[q] === true) count++;
    });

    // Особая обработка Пограничного
    if (scale.includes('Пограничное')) {
      const riskYes = RISK_ITEMS.filter(id => answers[id]).length;
      if (riskYes >= 2) count++; // 98 засчитывается как положительный
    }

    // Особая обработка Антисоциального
    if (scale.includes('Антисоциальное')) {
      const childhoodYes = CHILDHOOD_ITEMS.filter(id => answers[id]).length;
      const antisocialCore = [8, 20, 33, 46, 59, 75, 94];
      const antisocialYes = antisocialCore.filter(id => answers[id]).length;
      results[scale] = (childhoodYes >= 3 && antisocialYes >= 3) ? 1 : 0;
      continue;
    }

    results[scale] = count;
  }

  return results;
}
