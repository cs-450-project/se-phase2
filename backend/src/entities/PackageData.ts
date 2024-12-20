import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PackageMetadata } from './PackageMetadata.js';


@Entity('package_data')

export class PackageData {
    
    @PrimaryColumn({ name: 'package_id' })
    packageId!: string;

    @OneToOne(() => PackageMetadata, { onDelete: 'CASCADE'})
    @JoinColumn({ name: 'package_id', referencedColumnName: 'id' })
    packageMetadata!: PackageMetadata;
    
    @Column({ name: 'content', type: 'bytea', nullable: true })
    content?: Buffer;

    @Column({ name: 'content_size', type: 'integer', nullable: true })
    contentSize?: number;

    @Column({ name: 'url', nullable: true })
    url?: string;

    @Column({ name: 'debloat', nullable: true })
    debloat?: boolean;

    @Column({ name: 'js_program', nullable: true })
    jsProgram?: string;

    @Column({ name: 'readme', nullable: true, type: 'text' })
    readme?: string;

    @Column({ name: 'package_json', type: 'jsonb', nullable: true })
    packageJson?: Record<string, any>;
    
}