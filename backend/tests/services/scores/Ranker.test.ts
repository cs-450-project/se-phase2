import { describe, it, expect, beforeEach } from 'vitest';
import { Ranker } from '../../../src/services/scores/Ranker';

describe('Ranker', () => {
    let ranker: Ranker;

    beforeEach(() => {
        ranker = new Ranker();
    });

    it('should initialize with default values', () => {
        expect(ranker.netScore).toBe(-1);
        expect(ranker.netScoreLatency).toBe(-1);
        expect(ranker.rampUp).toBe(-1);
        expect(ranker.rampUpLatency).toBe(-1);
        expect(ranker.correctness).toBe(-1);
        expect(ranker.correctnessLatency).toBe(-1);
        expect(ranker.busFactor).toBe(-1);
        expect(ranker.busFactorLatency).toBe(-1);
        expect(ranker.responsiveMaintainers).toBe(-1);
        expect(ranker.responsiveMaintainersLatency).toBe(-1);
        expect(ranker.license).toBe(-1);
        expect(ranker.licenseLatency).toBe(-1);
        expect(ranker.dependencyPinning).toBe(-1);
        expect(ranker.dependencyPinningLatency).toBe(-1);
        expect(ranker.codeReview).toBe(-1);
        expect(ranker.codeReviewLatency).toBe(-1);
    });

    it('should set and get netScore correctly', () => {
        ranker.netScore = 5.12345;
        expect(ranker.netScore).toBe(5.123);
    });

    it('should set and get netScoreLatency correctly', () => {
        ranker.netScoreLatency = 3.98765;
        expect(ranker.netScoreLatency).toBe(3.988);
    });

    it('should set and get rampUp correctly', () => {
        ranker.rampUp = 4.56789;
        expect(ranker.rampUp).toBe(4.568);
    });

    it('should set and get rampUpLatency correctly', () => {
        ranker.rampUpLatency = 2.34567;
        expect(ranker.rampUpLatency).toBe(2.346);
    });

    it('should set and get correctness correctly', () => {
        ranker.correctness = 6.78901;
        expect(ranker.correctness).toBe(6.789);
    });

    it('should set and get correctnessLatency correctly', () => {
        ranker.correctnessLatency = 1.23456;
        expect(ranker.correctnessLatency).toBe(1.235);
    });

    it('should set and get busFactor correctly', () => {
        ranker.busFactor = 7.89012;
        expect(ranker.busFactor).toBe(7.89);
    });

    it('should set and get busFactorLatency correctly', () => {
        ranker.busFactorLatency = 0.12345;
        expect(ranker.busFactorLatency).toBe(0.123);
    });

    it('should set and get responsiveMaintainers correctly', () => {
        ranker.responsiveMaintainers = 8.90123;
        expect(ranker.responsiveMaintainers).toBe(8.901);
    });

    it('should set and get responsiveMaintainersLatency correctly', () => {
        ranker.responsiveMaintainersLatency = 9.87654;
        expect(ranker.responsiveMaintainersLatency).toBe(9.877);
    });

    it('should set and get license correctly', () => {
        ranker.license = 4.32109;
        expect(ranker.license).toBe(4.321);
    });

    it('should set and get licenseLatency correctly', () => {
        ranker.licenseLatency = 5.43210;
        expect(ranker.licenseLatency).toBe(5.432);
    });

    it('should set and get dependencyPinning correctly', () => {
        ranker.dependencyPinning = 6.54321;
        expect(ranker.dependencyPinning).toBe(6.543);
    });

    it('should set and get dependencyPinningLatency correctly', () => {
        ranker.dependencyPinningLatency = 7.65432;
        expect(ranker.dependencyPinningLatency).toBe(7.654);
    });

    it('should set and get codeReview correctly', () => {
        ranker.codeReview = 8.76543;
        expect(ranker.codeReview).toBe(8.765);
    });

    it('should set and get codeReviewLatency correctly', () => {
        ranker.codeReviewLatency = 9.87654;
        expect(ranker.codeReviewLatency).toBe(9.877);
    });
});