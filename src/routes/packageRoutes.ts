import express from 'express';
import multer from 'multer';
import { PackageController } from '../controllers/PackageController.js';

// multer serves as middleware for handling file uploads
const upload = multer();
// PackageRouter defines the routes for /package
const packageRouter = express.Router();

packageRouter.post(
    "/",
    upload.single("Content"),
    PackageController.uploadPackage
);

export { packageRouter };