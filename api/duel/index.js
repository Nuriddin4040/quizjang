const crypto = require('crypto');
const { pickQuestionSet } = require('../_lib/questions');
const { saveDuel } = require('../_lib/store');

// Игрок А закончил соло-игру и создаёт вызов
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { playerId, playerName, score, correctCount } = req.body || {};
  if (!playerId || score === undefined) {
    return res.status(400).json({ error: 'playerId и score обязательны' });
  }

  const duelId = crypto.randomBytes(4).toString('hex');
  const questionIds = pickQuestionSet();
  const duel = {
    id: duelId,
    questionIds,
    playerA: { id: playerId, name: playerName || 'Игрок 1', score, correctCount },
    playerB: null,
    createdAt: Date.now()
  };

  try {
    await saveDuel(duelId, duel);
  } catch (e) {
    return res.status(503).json({ error: e.message });
  }

  res.json({ duelId, questionIds });
};
