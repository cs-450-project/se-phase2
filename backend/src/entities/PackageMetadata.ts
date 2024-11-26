import 'reflect-metadata';
import express from 'express';
import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

/**
 * Represents the metadata for a package.
 * 
 * @decorator `@Entity('package_metadata')`
 * @decorator `@Unique(['name', 'version'])`
 */
@Entity('package_metadata')
@Unique(['name', 'version'])

export class PackageMetadata {
  
  @PrimaryGeneratedColumn()
  id!: number;

  @Column('varchar')
  name!: string;

  @Column('varchar')
  version!: string;
  
}