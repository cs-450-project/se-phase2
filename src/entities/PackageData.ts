import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PackageMetadata } from './PackageMetadata.js';
import { P } from 'pino';

@Entity('package_data')

export class PackageData {

    @PrimaryColumn()
    package_id!: string;

    @OneToOne(() => PackageMetadata)
    @JoinColumn({ name: 'package_id' })
    packageMetadata!: PackageMetadata;
    
    @Column({ type: 'bytea', nullable: true })
    content?: Buffer;

    @Column({ nullable: true })
    url?: string;

    @Column({ nullable: true })
    debloat?: boolean;

    @Column({ name: 'js_program', nullable: true })
    jsProgram?: string;
    
}