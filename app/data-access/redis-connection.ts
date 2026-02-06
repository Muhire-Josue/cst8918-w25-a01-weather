import { createClient, type RedisClientType } from "redis";

const url = process.env.REDIS_URL || "redis://localhost:6379";

let client: RedisClientType | null = null;

export async function getRedis(): Promise<RedisClientType> {
  if (!client) {
    client = createClient({ url });
    client.on("error", (err) => console.error("Redis client connection error:", err));
    await client.connect();
  }
  return client;
}
