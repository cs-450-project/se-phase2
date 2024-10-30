import { Entity, PrimaryColumn, Column, Unique } from 'typeorm';

@Entity('package_metadata')
@Unique(['name', 'version'])

export class PackageMetadata {
  
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  version!: string;
  
}