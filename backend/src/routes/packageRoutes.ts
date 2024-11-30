/**
 * @file src/routes/packageRoutes.ts
 * Defines the routes for /package and passes requests to the controller.
 */
import express from 'express';
import { PackageController } from '../controllers/PackageController.js';

const packageRouter = express.Router();

// GET /:id
packageRouter.get('/:id', PackageController.getPackage);

// POST /:id
packageRouter.post('/:id', PackageController.updatePackage);

// POST /package
packageRouter.post('/', PackageController.uploadPackage);

// GET /:id/rate
packageRouter.get('/:id/rate', PackageController.getPackageRating);

// GET /:id/cost
packageRouter.get('/:id/cost', PackageController.getPackageCost);

// GET /byRegEx handler
packageRouter.get('/byRegEx', PackageController.getPackagesByRegEx);


export default packageRouter;