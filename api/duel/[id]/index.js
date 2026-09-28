const { loadDuel } = require('../../_lib/store');

// Друг открывает вызов по ссылке — получает те же вопросы и видит, кого догоняет
module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  let duel;
  try {
    duel = await loadDuel(id);
  } catch (e) {
    return res.status(503).json({ error: e.message });
  }
  if (!duel) return res.status(404).json({ error: 'Дуэль не найдена' });

  res.json({
    duelId: duel.id,
    questionIds: duel.questionIds,
    playerA: duel.playerA,
    playerB: duel.playerB,
    status: duel.playerB ? 'finished' : 'waiting_for_opponent'
  });
};
