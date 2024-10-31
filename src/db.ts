import { DataSource } from 'typeorm';
import 'reflect-metadata';


// Initialize DataSource
export const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
    username: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'mypassword',
    database: process.env.POSTGRES_NAME || 'package_registry',
    entities: ["out/entities/*.js"],
    synchronize: true,
    logging: false,
  });