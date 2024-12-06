/**
 * @file src/routes/packageRoutes.ts
 * Defines the routes for /package and passes requests to the controller.
 */
import express from 'express';
import { PackageController } from '../controllers/PackageController.js';

const packageRouter = express.Router();

// POST /byRegEx
packageRouter.post('/byRegEx', PackageController.getPackagesByRegEx);
// POST /package
packageRouter.post('/', PackageController.uploadPackage);
// POST /:id
packageRouter.post('/:id', PackageController.updatePackage);

// GET /:id/rate
packageRouter.get('/:id/rate', PackageController.getPackageRating);
// GET /:id/cost
packageRouter.get('/:id/cost', PackageController.getPackageCost);
// GET /:id
packageRouter.get('/:id', PackageController.getPackage);

export default packageRouter;