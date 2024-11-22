import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PackageMetadata } from './PackageMetadata.js';


@Entity('package_rating')

export class PackageRating {
    
    @PrimaryColumn()
    package_id!: number;

    @OneToOne(() => PackageMetadata)
    @JoinColumn({ name: 'package_id', referencedColumnName: 'id' })
    packageMetadata!: PackageMetadata;
    
    // Metric Scores
    @Column({ type: 'float', default: -1 })
    bus_factor!: number;

    @Column({ type: 'float', default: -1 })
    bus_factor_latency!: number;

    @Column({ type: 'float', default: -1 })
    correctness!: number;

    @Column({ type: 'float', default: -1 })
    correctness_latency!: number;

    @Column({ type: 'float', default: -1 })
    ramp_up!: number;

    @Column({ type: 'float', default: -1 })
    ramp_up_latency!: number;

    @Column({ type: 'float', default: -1 })
    responsive_maintainer!: number;

    @Column({ type: 'float', default: -1 })
    responsive_maintainer_latency!: number;

    @Column({ type: 'float', default: -1 })
    license_score!: number;

    @Column({ type: 'float', default: -1 })
    license_score_latency!: number;

    @Column({ type: 'float', default: -1 })
    good_pinning_practice!: number;

    @Column({ type: 'float', default: -1 })
    good_pinning_practice_latency!: number;

    @Column({ type: 'float', default: -1 })
    pull_request!: number;

    @Column({ type: 'float', default: -1 })
    pull_request_latency!: number;

    @Column({ type: 'float', default: -1 })
    net_score!: number;

    @Column({ type: 'float', default: -1 })
    net_score_latency!: number;

}