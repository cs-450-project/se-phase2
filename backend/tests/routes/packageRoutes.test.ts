import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import packageRouter from '../../src/routes/packageRoutes';

describe('Package Routes', () => {
    let app: express.Application;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/package', packageRouter);
    });

    it('should get a package by id', async () => {
        const response = await request(app).get('/package/1');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller logic
    });

    it('should update a package by id', async () => {
        const response = await request(app)
            .put('/package/1')
            .send({ name: 'Updated Package' });
        expect(response.status).toBe(200);
        // Add more assertions based on your controller logic
    });

    it('should upload a new package', async () => {
        const response = await request(app)
            .post('/package')
            .send({ name: 'New Package' });
        expect(response.status).toBe(201);
        // Add more assertions based on your controller logic
    });

    it('should get package rating by id', async () => {
        const response = await request(app).get('/package/1/rate');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller logic
    });

    it('should get package cost by id', async () => {
        const response = await request(app).get('/package/1/cost');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller logic
    });

    it('should get packages by regex', async () => {
        const response = await request(app).get('/package/byRegEx?pattern=test');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller logic
    });
});