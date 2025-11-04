import scales from '../data/scales.json' assert { type: 'json' };

const RISK_ITEMS = [99,100,101,102,103,104,105,106];
const CHILDHOOD_ITEMS = [107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122];

export function calculateResults(answers) {
  const results = {};
  for (const [scaleName, obj] of Object.entries(scales)) {
    const { questions, threshold } = obj;
    let yesCount = 0;

    // базовые
    for (const q of questions) {
      if (answers[q] === true) yesCount++;
    }

    // Пограничное: вопрос 98 засчитывается при >=2 из 99-106
    if (scaleName === 'Пограничное') {
      const riskYes = RISK_ITEMS.filter(id => answers[id]).length;
      if (riskYes >= 2) yesCount++; // добавляем за 98
    }

    // Антисоциальное: "Б" (99) = да при >=3 из 107-122; плюс нужно >=3 из ядра
    if (scaleName === 'Антисоциальное') {
      const childhoodYes = CHILDHOOD_ITEMS.filter(id => answers[id]).length;
      const antisocialCore = [8,20,33,46,59,75,94];
      const antisocialYes = antisocialCore.filter(id => answers[id]).length;
      yesCount = antisocialYes + (childhoodYes >= 3 ? 1 : 0);
    }

    // Цвет по расстоянию до порога
    let color;
    if (yesCount >= threshold) color = 'rgba(255,0,0,0.35)';
    else if (yesCount === threshold - 1) color = 'rgba(255,200,0,0.35)';
    else color = 'rgba(0,200,0,0.35)';

    results[scaleName] = { score: yesCount, threshold, color };
  }
  return results;
}
