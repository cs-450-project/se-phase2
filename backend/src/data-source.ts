/**
 * @file data-source.ts
 * Configurations for the database connection.
 * 
 */
import 'reflect-metadata';
import { DataSource } from 'typeorm';

import dotenv from 'dotenv';
dotenv.config();

const { DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_DATABASE, NODE_ENV } = process.env;

// Initialize DataSource to connect to the database
export const AppDataSource = new DataSource({
    type: "postgres",
    host: DB_HOST,
    port: parseInt(DB_PORT || "5432"),
    username: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_DATABASE,

    // 'resets' the database schema every time the application starts
    dropSchema: NODE_ENV === "development" ? true : true,
    // true: tells TypeORM to automatically synchronize the database schema with the entities
    // creates the table if it does not exist
    // false: tells TypeORM to not synchronize the database schema with the entities
    // should be used in production
    synchronize: NODE_ENV === "development" ? true : true,
    logging: NODE_ENV === "development" ? false : false,
    entities: ["dist/entities/*.js"],
    // Database connection timeout to handle larger data
    maxQueryExecutionTime: 30000,
    extra: {
        max: 30
    }
});
