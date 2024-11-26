import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { PackageMetadata } from './PackageMetadata.js';

@Entity('package_rating')
export class PackageRating {
    @PrimaryColumn({ name: 'package_id' })
    packageId!: number;

    @OneToOne(() => PackageMetadata)
    @JoinColumn({ name: 'package_id', referencedColumnName: 'id' })
    packageMetadata!: PackageMetadata;

    @Column({ name: 'bus_factor', type: 'float', default: -1 })
    busFactor!: number;

    @Column({ name: 'bus_factor_latency', type: 'float', default: -1 })
    busFactorLatency!: number;

    @Column({ name: 'correctness', type: 'float', default: -1 })
    correctness!: number;

    @Column({ name: 'correctness_latency', type: 'float', default: -1 })
    correctnessLatency!: number;

    @Column({ name: 'ramp_up', type: 'float', default: -1 })
    rampUp!: number;

    @Column({ name: 'ramp_up_latency', type: 'float', default: -1 })
    rampUpLatency!: number;

    @Column({ name: 'responsive_maintainer', type: 'float', default: -1 })
    responsiveMaintainer!: number;

    @Column({ name: 'responsive_maintainer_latency', type: 'float', default: -1 })
    responsiveMaintainerLatency!: number;

    @Column({ name: 'license_score', type: 'float', default: -1 })
    licenseScore!: number;

    @Column({ name: 'license_score_latency', type: 'float', default: -1 })
    licenseScoreLatency!: number;

    @Column({ name: 'good_pinning_practice', type: 'float', default: -1 })
    goodPinningPractice!: number;

    @Column({ name: 'good_pinning_practice_latency', type: 'float', default: -1 })
    goodPinningPracticeLatency!: number;

    @Column({ name: 'pull_request', type: 'float', default: -1 })
    pullRequest!: number;

    @Column({ name: 'pull_request_latency', type: 'float', default: -1 })
    pullRequestLatency!: number;

    @Column({ name: 'net_score', type: 'float', default: -1 })
    netScore!: number;

    @Column({ name: 'net_score_latency', type: 'float', default: -1 })
    netScoreLatency!: number;
}