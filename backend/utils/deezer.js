// backend/utils/deezer.js
import axios from 'axios';

const USE_RAPIDAPI = process.env.USE_RAPIDAPI === 'true';

const baseURL = USE_RAPIDAPI
  ? (process.env.RAPIDAPI_BASE_URL || 'https://deezerdevs-deezer.p.rapidapi.com')
  : (process.env.DEEZER_API_BASE_URL || 'https://api.deezer.com');

export const deezer = axios.create({
  baseURL,
  timeout: Number(process.env.DEEZER_TIMEOUT || 12000),
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json,text/plain,*/*',
    'Accept-Language': 'es-EC,es;q=0.9,en;q=0.8',
    ...(USE_RAPIDAPI ? {
      'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
      'X-RapidAPI-Host': (process.env.RAPIDAPI_HOST || 'deezerdevs-deezer.p.rapidapi.com'),
    } : {})
  },
  params: { output: 'json' }, // fuerza JSON, evita JSONP
});

// Wrapper con reintentos para 403/429/5xx
export async function dzGet(url, params = {}, attempts = 3) {
  let lastErr;
  for (let i = 0; i < attempts; i++) {
    try {
      const res = await deezer.get(url, { params });
      return res.data;
    } catch (e) {
      lastErr = e;
      const code = e?.response?.status ?? 0;
      if (![403,429,502,503,504].includes(code) || i === attempts - 1) break;
      await new Promise(r => setTimeout(r, 800 * (i + 1)));
    }
  }
  throw lastErr;
}
