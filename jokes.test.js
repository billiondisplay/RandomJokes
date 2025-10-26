const request = require('supertest');
const app = require('./server/server');

describe('RandomJokes API Tests', () => {
  
  // ============================
  // Health Check Endpoint
  // ============================
  describe('GET /api/health', () => {
    it('should return healthy status', async () => {
      const response = await request(app).get('/api/health');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });

  // ============================
  // Random Joke Endpoint
  // ============================
  describe('GET /api/jokes/random', () => {
    it('should return a random joke successfully', async () => {
      const response = await request(app).get('/api/jokes/random');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('source');
      expect(response.body).toHaveProperty('data');
    });

    it('should return joke with correct structure (single type)', async () => {
      const response = await request(app).get('/api/jokes/random');
      const joke = response.body.data;
      
      expect(joke).toHaveProperty('type');
      
      if (joke.type === 'single') {
        expect(joke).toHaveProperty('joke');
        expect(typeof joke.joke).toBe('string');
      }
    });

    it('should return joke with correct structure (twopart type)', async () => {
      // Make multiple requests to potentially get a twopart joke
      let foundTwopart = false;
      
      for (let i = 0; i < 10; i++) {
        const response = await request(app).get('/api/jokes/random');
        const joke = response.body.data;
        
        if (joke.type === 'twopart') {
          expect(joke).toHaveProperty('setup');
          expect(joke).toHaveProperty('delivery');
          expect(typeof joke.setup).toBe('string');
          expect(typeof joke.delivery).toBe('string');
          foundTwopart = true;
          break;
        }
      }
      
      // Note: This test might fail if only single-type jokes exist
      expect(foundTwopart).toBe(true);
    });
  });

  // ============================
  // Get All Jokes Endpoint
  // ============================
  describe('GET /api/jokes/all', () => {
    it('should return all jokes', async () => {
      const response = await request(app).get('/api/jokes/all');
      
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('count');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return at least one joke', async () => {
      const response = await request(app).get('/api/jokes/all');
      
      expect(response.body.count).toBeGreaterThan(0);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  // ============================
  // AI Joke Endpoint
  // ============================
  describe('POST /api/jokes/ai', () => {
    it('should return 503 if OpenAI key is not configured', async () => {
      // Assuming OPENAI_API_KEY is not set in test environment
      const response = await request(app)
        .post('/api/jokes/ai')
        .send({});
      
      // Either returns joke (if key exists) or 503 (if not configured)
      if (response.statusCode === 503) {
        expect(response.body).toHaveProperty('success', false);
        expect(response.body.error).toContain('not configured');
      } else if (response.statusCode === 200) {
        expect(response.body).toHaveProperty('success', true);
        expect(response.body).toHaveProperty('source', 'ai');
      }
    });
  });

  // ============================
  // 404 Handling
  // ============================
  describe('404 Error Handling', () => {
    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app).get('/api/nonexistent');
      
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('success', false);
      expect(response.body).toHaveProperty('error');
    });
  });

  // ============================
  // Static Files
  // ============================
  describe('Static File Serving', () => {
    it('should serve the main HTML file', async () => {
      const response = await request(app).get('/');
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should serve CSS files', async () => {
      const response = await request(app).get('/styles.css');
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('text/css');
    });

    it('should serve JavaScript files', async () => {
      const response = await request(app).get('/script.js');
      
      expect(response.statusCode).toBe(200);
      expect(response.headers['content-type']).toContain('javascript');
    });
  });

  // ============================
  // Response Headers
  // ============================
  describe('Security Headers', () => {
    it('should include security headers from Helmet', async () => {
      const response = await request(app).get('/api/health');
      
      // Helmet adds various security headers
      expect(response.headers).toHaveProperty('x-dns-prefetch-control');
      expect(response.headers).toHaveProperty('x-frame-options');
    });
  });
});
