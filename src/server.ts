/**
 * @file src/server.ts
 * Entry point for the API.
 */

import { AppDataSource } from './data-source.js';
import express from 'express';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import packageRouter from './routes/packageRoutes.js';
import 'reflect-metadata';

dotenv.config();

const app = express();

// Middleware to parse incoming requests with JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = process.env.PORT || 3000;

// Loads the package router indicating that all routes defined in the packageRouter will be prefixed with /package
app.use('/package', packageRouter);

// Sends a 505 status code for all other routes
app.get('*', (req: Request, res: Response) => {
  res.status(505).json({ message: 'Bad Request' });
});

// Initializes the database and starts the server
AppDataSource.initialize()
  .then(async () => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
    console.log('Database has been initialized!');
  })
  .catch((error) => console.error('Database initialization error:', error));
