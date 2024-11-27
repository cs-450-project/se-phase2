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
  
  @PrimaryGeneratedColumn({ name: 'id' })
  id!: number;

  @Column({ name: 'name', nullable: false })
  name!: string;

  @Column({ name: 'version', nullable: false })
  version!: string;
  
}