const request = require('supertest');
const app = require('./server');  // Adjust to your actual server file path

describe('GET /api/joke', () => {
    it('should return a random joke', async () => {
        const response = await request(app).get('/api/joke');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('type');
    });
});
