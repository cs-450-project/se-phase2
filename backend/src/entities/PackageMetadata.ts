import 'reflect-metadata';
import { Entity, PrimaryColumn, Column, Unique, BeforeInsert } from 'typeorm';
import { createHash } from 'crypto';

/**
 * Represents the metadata for a package.
 * 
 * @decorator `@Entity('package_metadata')`
 * @decorator `@Unique(['name', 'version'])`
 */
@Entity('package_metadata')
@Unique(['name', 'version'])

export class PackageMetadata {
  
  @PrimaryColumn({ name: 'id' })
  id!: string;

  @Column({ name: 'base_id', nullable: false })
  baseId!: string;

  @Column({ name: 'name', nullable: false })
  name!: string;

  @Column({ name: 'version', nullable: false })
  version!: string;

  @BeforeInsert()
  generateIds() {
    // Generate baseId from package name (stays consistent across versions)
    this.baseId = createHash('sha256')
      .update(this.name)
      .digest('hex')
      .slice(0, 12);

      // Generate unique id from name and version combination
      this.id = createHash('sha256')
        .update(`${this.name}-${this.version}`)
        .digest('hex')
        .slice(0, 12);
  }
  
}