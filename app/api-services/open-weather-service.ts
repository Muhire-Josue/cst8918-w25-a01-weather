import { getRedis } from "../data-access/redis-connection";

const API_KEY = process.env.WEATHER_API_KEY;
const BASE_URL = "https://api.openweathermap.org/data/2.5/weather";
const TEN_MINUTES = 1000 * 60 * 10; // milliseconds

interface FetchWeatherDataParams {
  lat: number;
  lon: number;
  units: "standard" | "metric" | "imperial";
}

export async function fetchWeatherData({
  lat,
  lon,
  units,
}: FetchWeatherDataParams) {
  if (!API_KEY) {
    throw new Error("WEATHER_API_KEY is not defined");
  }

  const queryString = `lat=${lat}&lon=${lon}&units=${units}`;

  const redis = await getRedis();

  // 1️⃣ Try cache first
  const cacheEntry = await redis.get(queryString);
  if (cacheEntry) {
    return JSON.parse(cacheEntry);
  }

  // 2️⃣ Fetch from OpenWeather
  const response = await fetch(
    `${BASE_URL}?${queryString}&appid=${API_KEY}`
  );

  if (!response.ok) {
    throw new Error(
      `OpenWeather API error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.text();

  // 3️⃣ Cache result
  await redis.set(queryString, data, {
    PX: TEN_MINUTES,
  });

  return JSON.parse(data);
}
