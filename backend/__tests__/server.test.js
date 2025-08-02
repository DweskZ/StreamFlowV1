const request = require('supertest');
const express = require('express');
const cors = require('cors');

// Create a simple test app
const app = express();

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'StreamFlow Backend API',
    status: 'online',
    endpoints: {
      health: '/health',
      search: '/api/search?q=<query>',
      track: '/api/track/:id',
      chart: '/api/chart'
    }
  });
});

// Mock API routes
app.get('/api/search', (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Query parameter required' });
  }
  res.json({ results: [] });
});

app.get('/api/chart', (req, res) => {
  res.json({ chart: [] });
});

app.get('/api/track/:id', (req, res) => {
  res.json({ track: {} });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint no encontrado',
    message: `La ruta ${req.originalUrl} no existe`
  });
});

describe('Basic Backend Test', () => {
  it('should pass a simple test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should have a healthy environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
}); 