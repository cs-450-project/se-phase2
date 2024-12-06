/**
 * @file src/server.ts
 * Entry point for the API.
 */

import dotenv from 'dotenv';
import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import { errorHandler } from './utils/middleware/errorHandler.js';

import { AppDataSource } from './data-source.js';
import packageRouter from './routes/packageRoutes.js';
import { PackageController } from './controllers/PackageController.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(cors({ origin: 'http://localhost:4200' }));

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 3000;

console.log('Starting server...');

// Loads the package router indicating that all routes defined in the packageRouter will be prefixed with /package
app.use('/package', packageRouter);

// Routes that do not start with /package

app.post('/packages', PackageController.getPackagesFromQueries);

app.delete('/reset', PackageController.resetRegistry);

// Sends a 505 status code for all other routes
app.get('*', (req: Request, res: Response) => {
  res.status(505).json({ message: 'Bad Request' });
});

app.use(errorHandler);

// Initializes the database and starts the server
AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    console.log('Database has been initialized!');
  })
  .catch((error) => console.error('Database initialization error:', error));

export default app;