// Хранилище дуэлей. Работает через Upstash Redis (подключается в Vercel: Storage -> Marketplace -> Upstash).
// Локально/без подключённого Redis — падает обратно на память процесса, только для разработки:
// на реальном Vercel это не сохранится между вызовами, поэтому там Redis обязателен.
const { Redis } = require('@upstash/redis');

const memoryFallback = new Map();
let warnedFallback = false;

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const TTL_SECONDS = 60 * 60 * 24 * 3; // дуэль живёт 3 дня — достаточно, чтобы друг успел ответить

async function saveDuel(id, duel) {
  const redis = getRedis();
  if (!redis) {
    if (!warnedFallback) { console.warn('[store] Redis не настроен — использую временную память процесса (только для разработки)'); warnedFallback = true; }
    memoryFallback.set(id, duel);
    return;
  }
  await redis.set(`duel:${id}`, JSON.stringify(duel), { ex: TTL_SECONDS });
}
async function loadDuel(id) {
  const redis = getRedis();
  if (!redis) return memoryFallback.get(id) || null;
  const raw = await redis.get(`duel:${id}`);
  if (!raw) return null;
  return typeof raw === 'string' ? JSON.parse(raw) : raw;
}

module.exports = { saveDuel, loadDuel };
