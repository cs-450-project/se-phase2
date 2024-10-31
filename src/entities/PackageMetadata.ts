import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';

@Entity('package_metadata')
@Unique(['name', 'version'])

export class PackageMetadata {
  
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  version!: string;
  
}