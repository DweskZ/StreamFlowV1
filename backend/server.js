import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import musicRoutes from './routes/music.js';
// import userRoutes from './routes/user.js'; // Para futuras funcionalidades

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: [
    'http://localhost:5173', // Vite dev server
    'http://localhost:3000', // React dev server (alternativo)
    'http://localhost:4173', // Vite preview
    'http://127.0.0.1:5173'  // IPv4 localhost alternativo
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Middleware adicional para headers CORS en todas las respuestas
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Responder a preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Rutas
app.use('/api', musicRoutes);
// app.use('/api/user', userRoutes); // Para futuras funcionalidades de usuario

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: 'StreamFlow Backend API',
    status: 'online',
    endpoints: {
      search: '/api/search?q=<query>',
      track: '/api/track/:id',
      chart: '/api/chart'
    }
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo salió mal!',
    message: err.message 
  });
});

// Ruta no encontrada
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📱 Frontend puede conectarse desde http://localhost:5173`);
});

export default app;
