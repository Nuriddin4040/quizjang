const { loadDuel, saveDuel } = require('../../_lib/store');

// Друг завершил игру — сравниваем результат
module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  let duel;
  try {
    duel = await loadDuel(id);
  } catch (e) {
    return res.status(503).json({ error: e.message });
  }
  if (!duel) return res.status(404).json({ error: 'Дуэль не найдена' });
  if (duel.playerB) return res.status(409).json({ error: 'В этой дуэли уже сыграли оба игрока' });

  const { playerId, playerName, score, correctCount } = req.body || {};
  duel.playerB = { id: playerId, name: playerName || 'Игрок 2', score, correctCount };

  const winner = duel.playerA.score === duel.playerB.score ? 'draw'
    : (duel.playerA.score > duel.playerB.score ? 'playerA' : 'playerB');

  try {
    await saveDuel(id, duel);
  } catch (e) {
    return res.status(503).json({ error: e.message });
  }

  res.json({ duelId: duel.id, playerA: duel.playerA, playerB: duel.playerB, winner });
};
