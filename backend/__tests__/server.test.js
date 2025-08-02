import request from 'supertest';
import app from '../server.js';

describe('Server Endpoints', () => {
  describe('GET /health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
    });
  });

  describe('GET /', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message', 'StreamFlow Backend API');
      expect(response.body).toHaveProperty('status', 'online');
      expect(response.body).toHaveProperty('endpoints');
      expect(response.body.endpoints).toHaveProperty('health');
      expect(response.body.endpoints).toHaveProperty('search');
      expect(response.body.endpoints).toHaveProperty('track');
      expect(response.body.endpoints).toHaveProperty('chart');
    });
  });

  describe('API Routes', () => {
    describe('GET /api/search', () => {
      it('should return search results', async () => {
        const response = await request(app)
          .get('/api/search?q=test')
          .expect(200);

        expect(response.body).toBeDefined();
      });

      it('should handle missing query parameter', async () => {
        const response = await request(app)
          .get('/api/search')
          .expect(400);

        expect(response.body).toHaveProperty('error');
      });
    });

    describe('GET /api/chart', () => {
      it('should return chart data', async () => {
        const response = await request(app)
          .get('/api/chart')
          .expect(200);

        expect(response.body).toBeDefined();
      });
    });

    describe('GET /api/track/:id', () => {
      it('should return track details', async () => {
        const response = await request(app)
          .get('/api/track/123456')
          .expect(200);

        expect(response.body).toBeDefined();
      });
    });
  });

  describe('Error Handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Endpoint no encontrado');
    });
  });

  describe('CORS', () => {
    it('should handle CORS preflight requests', async () => {
      await request(app)
        .options('/api/search')
        .set('Origin', 'http://localhost:5173')
        .expect(200);
    });
  });
}); 