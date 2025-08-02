import express from 'express';
import axios from 'axios';

const router = express.Router();
const DEEZER_BASE_URL = process.env.DEEZER_API_BASE_URL || 'https://api.deezer.com';

// Función para transformar datos de Deezer al formato esperado por el frontend
const transformDeezerTrack = (deezerTrack) => {
  return {
    id: deezerTrack.id.toString(),
    name: deezerTrack.title,
    duration: deezerTrack.duration ? deezerTrack.duration.toString() : "0",
    artist_id: deezerTrack.artist?.id?.toString() || "",
    artist_name: deezerTrack.artist?.name || "Unknown Artist",
    artist_idstr: deezerTrack.artist?.id?.toString() || "",
    album_id: deezerTrack.album?.id?.toString() || "",
    album_name: deezerTrack.album?.title || "Unknown Album",
    album_image: deezerTrack.album?.cover_medium || deezerTrack.album?.cover || "",
    album_images: {
      "size25": deezerTrack.album?.cover_small || "",
      "size50": deezerTrack.album?.cover_small || "",
      "size100": deezerTrack.album?.cover || "",
      "size130": deezerTrack.album?.cover || "",
      "size200": deezerTrack.album?.cover_medium || "",
      "size300": deezerTrack.album?.cover_medium || "",
      "size400": deezerTrack.album?.cover_big || "",
      "size500": deezerTrack.album?.cover_big || "",
      "size600": deezerTrack.album?.cover_xl || ""
    },
    license_ccurl: "",
    position: deezerTrack.track_position || 0,
    releasedate: deezerTrack.release_date || "",
    album_datecreated: deezerTrack.release_date || "",
    prourl: deezerTrack.link || "",
    shorturl: deezerTrack.link || "",
    shareurl: deezerTrack.link || "",
    waveform: "",
    image: deezerTrack.album?.cover_medium || deezerTrack.album?.cover || "",
    audio: deezerTrack.preview || "",
    audiodownload: deezerTrack.preview || "",
    proaudio: deezerTrack.preview || "",
    audiodlallowed: Boolean(deezerTrack.preview),
    tags: {
      genres: [],
      instruments: [],
      vartags: []
    },
    // Campos adicionales de Deezer que pueden ser útiles
    deezer_id: deezerTrack.id,
    rank: deezerTrack.rank || 0,
    explicit_lyrics: deezerTrack.explicit_lyrics || false
  };
};

// 1. Búsqueda de canciones - GET /api/search?q=query
router.get('/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Parámetro de búsqueda requerido',
        message: 'Debes proporcionar el parámetro "q" con el término de búsqueda'
      });
    }

    console.log(`🔍 Buscando: "${q}" en Deezer`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/search`, {
      params: {
        q,
        limit: Math.min(parseInt(limit), 25) // Límite máximo de 25
      }
    });

    const transformedTracks = response.data.data.map(transformDeezerTrack);

    // Formato compatible con el frontend existente
    const result = {
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: response.data.total || transformedTracks.length
      },
      results: transformedTracks
    };

    res.json(result);
    
  } catch (error) {
    console.error('❌ Error en búsqueda:', error.message);
    res.status(500).json({
      error: 'Error al buscar canciones',
      message: error.message,
      headers: {
        status: "error",
        code: 500,
        error_message: error.message,
        warnings: "",
        results_fullcount: 0
      },
      results: []
    });
  }
});

// 2. Detalles de una canción - GET /api/track/:id
router.get('/track/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        error: 'ID de canción requerido',
        message: 'Debes proporcionar un ID válido'
      });
    }

    console.log(`🎵 Obteniendo detalles de la canción ID: ${id}`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/track/${id}`);
    
    if (response.data.error) {
      return res.status(404).json({
        error: 'Canción no encontrada',
        message: `No se encontró una canción con ID: ${id}`,
        details: response.data.error
      });
    }

    const transformedTrack = transformDeezerTrack(response.data);

    res.json({
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: 1
      },
      results: [transformedTrack]
    });
    
  } catch (error) {
    console.error('❌ Error al obtener canción:', error.message);
    
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Canción no encontrada',
        message: `No se encontró una canción con ID: ${req.params.id}`
      });
    }
    
    res.status(500).json({
      error: 'Error al obtener detalles de la canción',
      message: error.message
    });
  }
});

// 3. Charts/Top canciones - GET /api/chart
router.get('/chart', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    console.log(`📈 Obteniendo top canciones (chart)`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/chart`, {
      params: {
        limit: Math.min(parseInt(limit), 25)
      }
    });

    const transformedTracks = response.data.tracks.data.map(transformDeezerTrack);

    const result = {
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: response.data.tracks.total || transformedTracks.length
      },
      results: transformedTracks
    };

    res.json(result);
    
  } catch (error) {
    console.error('❌ Error al obtener chart:', error.message);
    res.status(500).json({
      error: 'Error al obtener top canciones',
      message: error.message,
      headers: {
        status: "error",
        code: 500,
        error_message: error.message,
        warnings: "",
        results_fullcount: 0
      },
      results: []
    });
  }
});

// 4. Endpoints adicionales que podrían ser útiles

// Búsqueda de artistas - GET /api/artist/search?q=query
router.get('/artist/search', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({
        error: 'Parámetro de búsqueda requerido'
      });
    }

    console.log(`👤 Buscando artista: "${q}"`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/search/artist`, {
      params: { q, limit: Math.min(parseInt(limit), 25) }
    });

    res.json({
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: response.data.total || response.data.data.length
      },
      results: response.data.data
    });
    
  } catch (error) {
    console.error('❌ Error en búsqueda de artista:', error.message);
    res.status(500).json({
      error: 'Error al buscar artista',
      message: error.message
    });
  }
});

// Álbumes de un artista - GET /api/artist/:id/albums
router.get('/artist/:id/albums', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 10 } = req.query;
    
    console.log(`💿 Obteniendo álbumes del artista ID: ${id}`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/artist/${id}/albums`, {
      params: { limit: Math.min(parseInt(limit), 25) }
    });

    res.json({
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: response.data.total || response.data.data.length
      },
      results: response.data.data
    });
    
  } catch (error) {
    console.error('❌ Error al obtener álbumes:', error.message);
    res.status(500).json({
      error: 'Error al obtener álbumes del artista',
      message: error.message
    });
  }
});

// Canciones de un álbum - GET /api/album/:id/tracks
router.get('/album/:id/tracks', async (req, res) => {
  try {
    const { id } = req.params;
    
    console.log(`🎵 Obteniendo canciones del álbum ID: ${id}`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/album/${id}/tracks`);

    const transformedTracks = response.data.data.map(transformDeezerTrack);

    res.json({
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: response.data.total || transformedTracks.length
      },
      results: transformedTracks
    });
    
  } catch (error) {
    console.error('❌ Error al obtener canciones del álbum:', error.message);
    res.status(500).json({
      error: 'Error al obtener canciones del álbum',
      message: error.message
    });
  }
});

// ===== ENDPOINTS PARA RECOMENDACIONES =====

// Búsqueda por género - GET /api/recommendations/genre/:genre
router.get('/recommendations/genre/:genre', async (req, res) => {
  try {
    const { genre } = req.params;
    const { limit = 10 } = req.query;
    
    console.log(`🎵 Buscando canciones de género: ${genre}`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/search`, {
      params: {
        q: `genre:"${genre}"`,
        limit: Math.min(parseInt(limit), 25)
      }
    });

    const transformedTracks = response.data.data.map(transformDeezerTrack);

    res.json({
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: response.data.total || transformedTracks.length
      },
      results: transformedTracks
    });
    
  } catch (error) {
    console.error(`❌ Error buscando género ${req.params.genre}:`, error.message);
    res.status(500).json({
      error: 'Error al buscar canciones por género',
      message: error.message
    });
  }
});

// Búsqueda por artista - GET /api/recommendations/artist/:artist
router.get('/recommendations/artist/:artist', async (req, res) => {
  try {
    const { artist } = req.params;
    const { limit = 10 } = req.query;
    
    console.log(`🎤 Buscando canciones del artista: ${artist}`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/search`, {
      params: {
        q: `artist:"${artist}"`,
        limit: Math.min(parseInt(limit), 25)
      }
    });

    const transformedTracks = response.data.data.map(transformDeezerTrack);

    res.json({
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: response.data.total || transformedTracks.length
      },
      results: transformedTracks
    });
    
  } catch (error) {
    console.error(`❌ Error buscando artista ${req.params.artist}:`, error.message);
    res.status(500).json({
      error: 'Error al buscar canciones del artista',
      message: error.message
    });
  }
});

// Tendencias globales - GET /api/recommendations/trending
router.get('/recommendations/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    console.log(`📈 Obteniendo tendencias globales`);
    
    const response = await axios.get(`${DEEZER_BASE_URL}/chart/0/tracks`, {
      params: {
        limit: Math.min(parseInt(limit), 25)
      }
    });

    const transformedTracks = response.data.data.map(transformDeezerTrack);

    res.json({
      headers: {
        status: "success",
        code: 200,
        error_message: "",
        warnings: "",
        results_fullcount: response.data.total || transformedTracks.length
      },
      results: transformedTracks
    });
    
  } catch (error) {
    console.error('❌ Error obteniendo tendencias:', error.message);
    res.status(500).json({
      error: 'Error al obtener tendencias',
      message: error.message
    });
  }
});

export default router;
