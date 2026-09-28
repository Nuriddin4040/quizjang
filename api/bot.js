// Webhook Telegram-бота. Отвечает на любое сообщение (в первую очередь /start)
// кнопкой запуска мини-приложения — чтобы бот не выглядел "мёртвым", если
// написать ему напрямую, а не по ссылке-вызову.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(200).json({ ok: true });

  const update = req.body || {};
  const msg = update.message;
  if (!msg || !msg.chat || !msg.chat.id) return res.status(200).json({ ok: true });

  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    console.warn("[bot] TELEGRAM_BOT_TOKEN не задан в переменных окружения");
    return res.status(200).json({ ok: true });
  }

  const text =
    "Привет! 👋 QuizJang — дуэль на знания, 10 вопросов, RU/UZ.\n\n" +
    "Жми «Играть», проходи вопросы и бросай вызов друзьям — кто быстрее и точнее.";

  const payload = {
    chat_id: msg.chat.id,
    text,
    reply_markup: {
      inline_keyboard: [[{ text: "🎮 Играть", web_app: { url: "https://quizjang.vercel.app/" } }]],
    },
  };

  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error("[bot] sendMessage не удался", e);
  }

  res.status(200).json({ ok: true });
};
