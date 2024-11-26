import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PackageMetadata } from './PackageMetadata.js';


@Entity('package_data')

export class PackageData {
    
    @PrimaryColumn({ name: 'package_id' })
    packageId!: number;

    @OneToOne(() => PackageMetadata)
    @JoinColumn({ name: 'package_id', referencedColumnName: 'id' })
    packageMetadata!: PackageMetadata;
    
    @Column({ name: 'content', nullable: true })
    content?: string;

    @Column({ name: 'url', nullable: true })
    url?: string;

    @Column({ name: 'debloat', nullable: true })
    debloat?: boolean;

    @Column({ name: 'js_program', nullable: true })
    jsProgram?: string;

    
    

}