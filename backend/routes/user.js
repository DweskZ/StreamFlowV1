import express from 'express';
// import { createClient } from '@supabase/supabase-js';

const router = express.Router();

// Configuración de Supabase (para cuando se implemente)
// const supabase = createClient(
//   process.env.SUPABASE_URL,
//   process.env.SUPABASE_ANON_KEY
// );

// TODO: Implementar cuando se decida guardar datos de usuarios en Supabase

// Guardar canción como favorita - POST /api/user/favorites
router.post('/favorites', async (req, res) => {
  try {
    // const { userId, trackId, trackData } = req.body;
    
    // Validaciones
    // if (!userId || !trackId) {
    //   return res.status(400).json({
    //     error: 'Datos requeridos faltantes',
    //     message: 'Se requiere userId y trackId'
    //   });
    // }

    // Guardar en Supabase
    // const { data, error } = await supabase
    //   .from('user_favorites')
    //   .insert([
    //     {
    //       user_id: userId,
    //       track_id: trackId,
    //       track_data: trackData,
    //       created_at: new Date().toISOString()
    //     }
    //   ]);

    // if (error) {
    //   throw error;
    // }

    res.status(501).json({
      message: 'Funcionalidad no implementada aún',
      todo: 'Implementar guardado de favoritos en Supabase'
    });
    
  } catch (error) {
    console.error('❌ Error al guardar favorito:', error.message);
    res.status(500).json({
      error: 'Error al guardar canción favorita',
      message: error.message
    });
  }
});

// Obtener canciones favoritas del usuario - GET /api/user/favorites/:userId
router.get('/favorites/:userId', async (req, res) => {
  try {
    // const { userId } = req.params;
    
    // if (!userId) {
    //   return res.status(400).json({
    //     error: 'ID de usuario requerido'
    //   });
    // }

    // const { data, error } = await supabase
    //   .from('user_favorites')
    //   .select('*')
    //   .eq('user_id', userId)
    //   .order('created_at', { ascending: false });

    // if (error) {
    //   throw error;
    // }

    res.status(501).json({
      message: 'Funcionalidad no implementada aún',
      todo: 'Implementar obtención de favoritos desde Supabase',
      results: []
    });
    
  } catch (error) {
    console.error('❌ Error al obtener favoritos:', error.message);
    res.status(500).json({
      error: 'Error al obtener canciones favoritas',
      message: error.message
    });
  }
});

// Eliminar canción de favoritos - DELETE /api/user/favorites/:userId/:trackId
router.delete('/favorites/:userId/:trackId', async (req, res) => {
  try {
    // const { userId, trackId } = req.params;
    
    // if (!userId || !trackId) {
    //   return res.status(400).json({
    //     error: 'ID de usuario y canción requeridos'
    //   });
    // }

    // const { error } = await supabase
    //   .from('user_favorites')
    //   .delete()
    //   .eq('user_id', userId)
    //   .eq('track_id', trackId);

    // if (error) {
    //   throw error;
    // }

    res.status(501).json({
      message: 'Funcionalidad no implementada aún',
      todo: 'Implementar eliminación de favoritos en Supabase'
    });
    
  } catch (error) {
    console.error('❌ Error al eliminar favorito:', error.message);
    res.status(500).json({
      error: 'Error al eliminar canción favorita',
      message: error.message
    });
  }
});

// Crear playlist - POST /api/user/playlists
router.post('/playlists', async (req, res) => {
  try {
    // const { userId, name, description, tracks } = req.body;

    res.status(501).json({
      message: 'Funcionalidad no implementada aún',
      todo: 'Implementar creación de playlists en Supabase'
    });
    
  } catch (error) {
    console.error('❌ Error al crear playlist:', error.message);
    res.status(500).json({
      error: 'Error al crear playlist',
      message: error.message
    });
  }
});

// Obtener playlists del usuario - GET /api/user/playlists/:userId
router.get('/playlists/:userId', async (req, res) => {
  try {
    // const { userId } = req.params;

    res.status(501).json({
      message: 'Funcionalidad no implementada aún',
      todo: 'Implementar obtención de playlists desde Supabase',
      results: []
    });
    
  } catch (error) {
    console.error('❌ Error al obtener playlists:', error.message);
    res.status(500).json({
      error: 'Error al obtener playlists',
      message: error.message
    });
  }
});

export default router;
