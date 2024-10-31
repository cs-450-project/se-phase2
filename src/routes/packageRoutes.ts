/**
 * @file src/routes/packageRoutes.ts
 * Defines the routes for /package and passes requests to the controller.
 */
import express from 'express';
import { Request, Response } from 'express';
import PackageController from '../controllers/PackageController.js';

const packageRouter = express.Router();

console.log('[packageRoutes] packageRouter loaded.');

// POST /package
packageRouter.post("/", PackageController.uploadPackage);

export default packageRouter;