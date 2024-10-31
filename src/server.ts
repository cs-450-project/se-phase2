// src/server.ts

import express from 'express';
import multer from 'multer';
import { AppDataSource } from './data-source.js';
import { PackageMetadata } from './entities/PackageMetadata.js';
import { PackageData } from './entities/PackageData.js';
import AdmZip from 'adm-zip';
import 'reflect-metadata';

const upload = multer();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post('/api/packages', upload.single('Content'), async (req, res) => {
  await AppDataSource.initialize();
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // Parse and validate metadata
    const { metadata, data } = req.body;
    if (!metadata) {
      throw new Error('Metadata is required.');
    }

    const parsedMetadata = JSON.parse(metadata);
    const { Name, Version, ID } = parsedMetadata;
    if (!Name || !Version || !ID) {
      throw new Error('Name, Version, and ID are required in metadata.');
    }

    // Validate ID pattern
    if (!/^[a-zA-Z0-9\-]+$/.test(ID)) {
      throw new Error('ID does not match the required pattern.');
    }

    // Parse and validate data
    const parsedData = JSON.parse(data);
    const { URL, debloat, JSProgram } = parsedData;
    let contentBuffer: Buffer | null = null;

    // Handle Content (from file upload)
    if (req.file) {
      contentBuffer = req.file.buffer;
    }

    // Validation: Either Content or URL should be set, but not both
    if ((contentBuffer && URL) || (!contentBuffer && !URL)) {
      throw new Error('Either Content or URL should be set, but not both.');
    }

    // If debloat is true and content is provided
    if (debloat && contentBuffer) {
      const zip = new AdmZip(contentBuffer);

      // Remove unnecessary files or folders
      const unnecessaryFiles = ['test/', 'docs/', 'examples/'];
      unnecessaryFiles.forEach((file) => {
        const entry = zip.getEntry(file);
        if (entry) {
          zip.deleteFile(entry);
        }
      });

      // Get the updated zip content
      contentBuffer = zip.toBuffer();
    }

    // Create repositories
    const metadataRepository = AppDataSource.getRepository(PackageMetadata);
    const dataRepository = AppDataSource.getRepository(PackageData);

    // Save PackageMetadata
    const packageMetadata = metadataRepository.create({
      id: ID,
      name: Name,
      version: Version,
    });

    await metadataRepository.save(packageMetadata);

    // Save PackageData
    const packageData = dataRepository.create({
      content: contentBuffer || undefined,
      url: URL || undefined,
      debloat: debloat || false,
      jsProgram: JSProgram || undefined,
      packageMetadata: packageMetadata,
    });

    await dataRepository.save(packageData);

    // Commit the transaction
    await queryRunner.commitTransaction();
    res.status(200).json({ message: 'Package uploaded successfully.' });
  } catch (error) {
    // Rollback the transaction in case of error
    await queryRunner.rollbackTransaction();
    console.error('Upload error:', error);
    res.status(400).json({ error: (error as Error).message });
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
