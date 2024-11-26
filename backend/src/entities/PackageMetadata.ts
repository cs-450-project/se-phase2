import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

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