/**
 * @file index.ts
 * @description This file processes command line arguments.
 * 
 */

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

import { processURLsFromFile } from './evaluators/processURLsFromFile.js';
import { evaluateMetrics } from './evaluators/evaluateMetrics.js';

// Command line arguments
const argv = yargs(hideBin(process.argv))
  .option('url', {
    alias: 'u',
    type: 'string',
    describe: 'URL of the module to evaluate'
  })
  .option('file', {
    alias: 'f',
    type: 'string',
    describe: 'Path to the file containing the URLs'
  })
  .parseSync();

// Get file from the command line arguments, or use testing values
const file = argv.file;


if (file) {
    processURLsFromFile(file, evaluateMetrics);
}
