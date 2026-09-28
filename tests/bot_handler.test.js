// Проверка webhook-хендлера бота: не должен падать ни на одном типе апдейта,
// и должен всегда отвечать 200 (иначе Telegram будет ретраить вебхук).
function mockRes() {
  const res = { statusCode: 200, body: null };
  res.status = (code) => { res.statusCode = code; return res; };
  res.json = (obj) => { res.body = obj; return res; };
  return res;
}

async function main() {
  process.env.TELEGRAM_BOT_TOKEN = "test_token_not_real";
  const handler = require("../api/bot.js");

  const res1 = mockRes();
  await handler({ method: "POST", body: { message: { chat: { id: 111 }, text: "/start" } } }, res1);
  console.log("message /start ->", res1.statusCode, res1.body);
  if (res1.statusCode !== 200 || !res1.body?.ok) throw new Error("не ответил 200 на /start");

  const res2 = mockRes();
  await handler({ method: "POST", body: { edited_message: { chat: { id: 111 }, text: "hi" } } }, res2);
  console.log("update без message ->", res2.statusCode, res2.body);
  if (res2.statusCode !== 200) throw new Error("не ответил 200 на неизвестный тип апдейта");

  const res3 = mockRes();
  await handler({ method: "GET" }, res3);
  console.log("GET ->", res3.statusCode, res3.body);
  if (res3.statusCode !== 200) throw new Error("не ответил 200 на GET");

  console.log("\nВСЕ ПРОВЕРКИ ПРОШЛИ");
}

main().catch((e) => { console.error("ТЕСТ ПРОВАЛЕН:", e); process.exit(1); });
