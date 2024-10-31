/**
 * @file src/routes/packageRoutes.ts
 * Defines the routes for /package and passes requests to the controller.
 */
import express from 'express';
import { PackageController } from '../controllers/PackageController.js';

const packageRouter = express.Router();

// POST /package
packageRouter.post(
    "/",
    PackageController.uploadPackage
);

export { packageRouter };