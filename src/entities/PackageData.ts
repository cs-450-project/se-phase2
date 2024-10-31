import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PackageMetadata } from './PackageMetadata.js';


@Entity('package_data')

export class PackageData {
    
    @PrimaryColumn()
    package_id!: number;

    @OneToOne(() => PackageMetadata)
    @JoinColumn({ name: 'package_id', referencedColumnName: 'id' })
    packageMetadata!: PackageMetadata;
    
    @Column({ nullable: true })
    content?: string;

    @Column({ nullable: true })
    url?: string;

    @Column({ nullable: true })
    debloat?: boolean;

    @Column({ name: 'js_program', nullable: true })
    jsProgram?: string;

    
    

}