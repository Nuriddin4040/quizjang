const fs = require('fs');
const path = require('path');

let BANK = null;
function getBank() {
  if (!BANK) {
    const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'questions_bank.json'), 'utf8');
    BANK = JSON.parse(raw).questions;
  }
  return BANK;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Фиксированный набор вопросов для дуэли: 5 средних + 5 сложных, одинаковый для обоих игроков.
function pickQuestionSet() {
  const bank = getBank();
  const medium = bank.filter(q => q.difficulty === 'medium');
  const hard = bank.filter(q => q.difficulty === 'hard');
  shuffle(medium); shuffle(hard);
  return medium.slice(0, 5).concat(hard.slice(0, 5)).map(q => q.id);
}

module.exports = { getBank, pickQuestionSet };
