// Проверка serverless-хендлеров напрямую (без реального Vercel-роутера) —
// имитируем req/res, чтобы убедиться, что бизнес-логика работает после переноса в /api.
function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.body = obj; return res; };
  return res;
}

async function main() {
  const createHandler = require('../api/duel/index.js');
  const getHandler = require('../api/duel/[id]/index.js');
  const completeHandler = require('../api/duel/[id]/complete.js');

  // 1. Игрок А создаёт дуэль
  const resCreate = mockRes();
  await createHandler({ method: 'POST', body: { playerId: 'tg_111', playerName: 'Нурик', score: 540, correctCount: 8 } }, resCreate);
  console.log('CREATE ->', resCreate.statusCode, resCreate.body);
  if (resCreate.statusCode !== 200) throw new Error('create failed');
  const duelId = resCreate.body.duelId;

  // 2. Друг открывает по id
  const resGet = mockRes();
  await getHandler({ method: 'GET', query: { id: duelId } }, resGet);
  console.log('GET ->', resGet.statusCode, resGet.body);
  if (resGet.statusCode !== 200 || resGet.body.status !== 'waiting_for_opponent') throw new Error('get failed');

  // 3. Друг завершает игру
  const resComplete = mockRes();
  await completeHandler({ method: 'POST', query: { id: duelId }, body: { playerId: 'tg_222', playerName: 'Друг', score: 610, correctCount: 9 } }, resComplete);
  console.log('COMPLETE ->', resComplete.statusCode, resComplete.body);
  if (resComplete.statusCode !== 200 || resComplete.body.winner !== 'playerB') throw new Error('complete/winner logic failed');

  // 4. Повторное завершение той же дуэли — должно быть 409
  const resDup = mockRes();
  await completeHandler({ method: 'POST', query: { id: duelId }, body: { playerId: 'tg_333', score: 1, correctCount: 0 } }, resDup);
  console.log('DUPLICATE COMPLETE ->', resDup.statusCode, resDup.body);
  if (resDup.statusCode !== 409) throw new Error('duplicate-complete guard failed');

  // 5. Несуществующая дуэль
  const resMissing = mockRes();
  await getHandler({ method: 'GET', query: { id: 'doesnotexist' } }, resMissing);
  console.log('MISSING ->', resMissing.statusCode, resMissing.body);
  if (resMissing.statusCode !== 404) throw new Error('missing-duel guard failed');

  console.log('\nВСЕ ПРОВЕРКИ ПРОШЛИ');
}

main().catch(e => { console.error('ТЕСТ ПРОВАЛЕН:', e); process.exit(1); });
