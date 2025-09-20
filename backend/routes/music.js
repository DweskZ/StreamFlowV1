import express from 'express';
import { dzGet } from '../utils/deezer.js';
import {
  sanitizeQuery,
  validateLimit,
  createStandardResponse,
  createErrorResponse,
  handleAxiosError,
  serverLog
} from '../utils/helpers.js';

const router = express.Router();

/** ----- Transformación Deezer → Formato frontend ----- */
const transformDeezerTrack = (deezerTrack) => ({
  id: deezerTrack.id?.toString(),
  name: deezerTrack.title,
  duration: deezerTrack.duration ? String(deezerTrack.duration) : '0',
  artist_id: deezerTrack.artist?.id?.toString() || '',
  artist_name: deezerTrack.artist?.name || 'Unknown Artist',
  artist_idstr: deezerTrack.artist?.id?.toString() || '',
  album_id: deezerTrack.album?.id?.toString() || '',
  album_name: deezerTrack.album?.title || 'Unknown Album',
  album_image: deezerTrack.album?.cover_medium || deezerTrack.album?.cover || '',
  album_images: {
    size25: deezerTrack.album?.cover_small || '',
    size50: deezerTrack.album?.cover_small || '',
    size100: deezerTrack.album?.cover || '',
    size130: deezerTrack.album?.cover || '',
    size200: deezerTrack.album?.cover_medium || '',
    size300: deezerTrack.album?.cover_medium || '',
    size400: deezerTrack.album?.cover_big || '',
    size500: deezerTrack.album?.cover_big || '',
    size600: deezerTrack.album?.cover_xl || ''
  },
  license_ccurl: '',
  position: deezerTrack.track_position || 0,
  releasedate: deezerTrack.release_date || '',
  album_datecreated: deezerTrack.release_date || '',
  prourl: deezerTrack.link || '',
  shorturl: deezerTrack.link || '',
  shareurl: deezerTrack.link || '',
  waveform: '',
  image: deezerTrack.album?.cover_medium || deezerTrack.album?.cover || '',
  audio: deezerTrack.preview || '',
  audiodownload: deezerTrack.preview || '',
  proaudio: deezerTrack.preview || '',
  audiodlallowed: Boolean(deezerTrack.preview),
  tags: { genres: [], instruments: [], vartags: [] },
  deezer_id: deezerTrack.id,
  rank: deezerTrack.rank || 0,
  explicit_lyrics: deezerTrack.explicit_lyrics || false
});

/** =================== RUTAS =================== **/

// 1) Búsqueda de canciones
router.get('/search', async (req, res) => {
  try {
    const qRaw = req.query.q;
    if (!qRaw) {
      return res.status(400).json(createErrorResponse('Parámetro de búsqueda "q" requerido', 400));
    }
    const q = sanitizeQuery(qRaw);
    const limit = validateLimit(req.query.limit, 10, 25);

    serverLog('info', '🔍 Buscando canciones', { q, limit });

    const data = await dzGet('/search', { q, limit });
    const tracks = (data?.data || []).map(transformDeezerTrack);

    return res.json(createStandardResponse(tracks, data?.total || tracks.length));
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error en búsqueda', info);
    return res.status(info.status).json(createErrorResponse(info.message, info.status));
  }
});

// 2) Detalle de una canción
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json(createErrorResponse('ID de canción requerido', 400));

    serverLog('info', '🎵 Obteniendo canción', { id });

    const data = await dzGet(`/track/${id}`);
    if (data?.error) {
      return res.status(404).json(createErrorResponse(`No se encontró una canción con ID: ${id}`, 404));
    }

    const track = transformDeezerTrack(data);
    return res.json(createStandardResponse([track], 1));
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error al obtener canción', info);
    const code = info.status === 404 ? 404 : 500;
    return res.status(code).json(createErrorResponse(info.message, code));
  }
});

// 3) Charts / Top canciones
router.get('/chart', async (req, res) => {
  try {
    const limit = validateLimit(req.query.limit, 10, 25);
    serverLog('info', '📈 Obteniendo chart', { limit });

    const data = await dzGet('/chart', { limit });
    const tracks = (data?.tracks?.data || []).map(transformDeezerTrack);

    return res.json(createStandardResponse(tracks, data?.tracks?.total || tracks.length));
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error al obtener chart', info);
    return res.status(info.status).json(createErrorResponse(info.message, info.status));
  }
});

// 4) Búsqueda de artistas
router.get('/artist/search', async (req, res) => {
  try {
    const qRaw = req.query.q;
    if (!qRaw) return res.status(400).json(createErrorResponse('Parámetro de búsqueda "q" requerido', 400));

    const q = sanitizeQuery(qRaw);
    const limit = validateLimit(req.query.limit, 10, 25);
    serverLog('info', '👤 Buscando artista', { q, limit });

    const data = await dzGet('/search/artist', { q, limit });
    const results = data?.data || [];

    return res.json(createStandardResponse(results, data?.total || results.length));
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error en búsqueda de artista', info);
    return res.status(info.status).json(createErrorResponse(info.message, info.status));
  }
});

// 5) Álbumes de un artista
router.get('/artist/:id/albums', async (req, res) => {
  try {
    const { id } = req.params;
    const limit = validateLimit(req.query.limit, 10, 25);
    serverLog('info', '💿 Obteniendo álbumes de artista', { id, limit });

    const data = await dzGet(`/artist/${id}/albums`, { limit });
    const results = data?.data || [];

    return res.json(createStandardResponse(results, data?.total || results.length));
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error al obtener álbumes', info);
    return res.status(info.status).json(createErrorResponse(info.message, info.status));
  }
});

// 6) Tracks de un álbum
router.get('/album/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;
    serverLog('info', '🎵 Obteniendo tracks de álbum', { id });

    const data = await dzGet(`/album/${id}/tracks`);
    const tracks = (data?.data || []).map(transformDeezerTrack);

    return res.json(createStandardResponse(tracks, data?.total || tracks.length));
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error al obtener tracks del álbum', info);
    return res.status(info.status).json(createErrorResponse(info.message, info.status));
  }
});

// 7) Recomendaciones por género
router.get('/recommendations/genre/:genre', async (req, res) => {
  try {
    const genre = sanitizeQuery(req.params.genre);
    const limit = validateLimit(req.query.limit, 10, 25);
    serverLog('info', '🎵 Recs por género', { genre, limit });

    const data = await dzGet('/search', { q: `genre:"${genre}"`, limit });
    const tracks = (data?.data || []).map(transformDeezerTrack);

    return res.json(createStandardResponse(tracks, data?.total || tracks.length));
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error en recs por género', info);
    return res.status(info.status).json(createErrorResponse(info.message, info.status));
  }
});

// 8) Recomendaciones por artista
router.get('/recommendations/artist/:artist', async (req, res) => {
  try {
    const artist = sanitizeQuery(req.params.artist);
    const limit = validateLimit(req.query.limit, 10, 25);
    serverLog('info', '🎤 Recs por artista', { artist, limit });

    const data = await dzGet('/search', { q: `artist:"${artist}"`, limit });
    const tracks = (data?.data || []).map(transformDeezerTrack);

    return res.json(createStandardResponse(tracks, data?.total || tracks.length));
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error en recs por artista', info);
    return res.status(info.status).json(createErrorResponse(info.message, info.status));
  }
});

// 9) Endpoint test
router.get('/test', async (_req, res) => {
  try {
    serverLog('info', '🧪 Endpoint de prueba llamado');
    return res.json({ status: 'success', message: 'Backend funcionando correctamente', timestamp: new Date().toISOString() });
  } catch (error) {
    const info = handleAxiosError(error);
    serverLog('error', '❌ Error en endpoint de prueba', info);
    return res.status(info.status).json(createErrorResponse(info.message, info.status));
  }
});

export default router;
