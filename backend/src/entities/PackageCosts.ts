import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { PackageMetadata } from './PackageMetadata.js';

/**
 * Represents the stored cost calculations for a package.
 * Includes both standalone cost and dependency information.
 */
@Entity('package_costs')
export class PackageCosts {
    @PrimaryColumn({ name: 'package_id' })
    packageId!: string;

    @OneToOne(() => PackageMetadata, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'package_id', referencedColumnName: 'id' })
    packageMetadata!: PackageMetadata;

    @Column('decimal', { name: 'standalone_cost', precision: 10, scale: 2, nullable: false })
    standaloneCost!: number;

    @Column('decimal', { name: 'total_cost', precision: 10, scale: 2, nullable: false })
    totalCost!: number;

    @Column('jsonb', { name: 'dependency_costs', nullable: true })
    dependencyCosts?: {
        [dependencyId: string]: {
            standaloneCost: number;
            totalCost: number;
        };
    };

}