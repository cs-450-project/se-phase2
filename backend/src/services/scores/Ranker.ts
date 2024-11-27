/*
 * URLParser.ts
 * 
 * Description:
 * This file takes a text file and splits each line as its own URL, performing an operation on each.
 * 
 * Author: Jacob Esparza
 * Date: 9-29-2024
 * Version: 1.1
 * 
 */

// Ranker.ts
import logger from '../../utils/logger.js'; // Adjust the import path as necessary

export class Ranker {

    private _netScore: number = -1;
    private _netScoreLatency: number = -1;

    private _rampUp: number = -1;
    private _rampUpLatency: number = -1;

    private _correctness: number = -1;
    private _correctnessLatency: number = -1;

    private _busFactor: number = -1;
    private _busFactorLatency: number = -1;

    private _responsiveMaintainers: number = -1;
    private _responsiveMaintainersLatency: number = -1;

    private _license: number = -1;
    private _licenseLatency: number = -1;

    private _dependencyPinning: number = -1;
    private _dependencyPinningLatency: number = -1;

    private _codeReview: number = -1;
    private _codeReviewLatency: number = -1;

    private roundValue(value: number): number {
        return Number(value.toFixed(3));
    }

    get netScore(): number {
        logger.debug(`Getting netScore: ${this._netScore}`);
        return this._netScore;
    }


    set netScore(value: number) {
        logger.debug(`Setting netScore from ${this._netScore} to ${value}`);
        this._netScore = this.roundValue(value);
    }

    get netScoreLatency(): number {
        logger.debug(`Getting netScoreLatency: ${this._netScoreLatency}`);
        return this._netScoreLatency;
    }

    set netScoreLatency(value: number) {
        logger.debug(`Setting netScoreLatency from ${this._netScoreLatency} to ${value}`);
        this._netScoreLatency = this.roundValue(value);
    }

    // Ramp Up
    get rampUp(): number {
        logger.debug(`Getting rampUp: ${this._rampUp}`);
        return this._rampUp;
    }

    set rampUp(value: number) {
        logger.debug(`Setting rampUp from ${this._rampUp} to ${value}`);
        this._rampUp = this.roundValue(value);
    }

    get rampUpLatency(): number {
        logger.debug(`Getting rampUpLatency: ${this._rampUpLatency}`);
        return this._rampUpLatency;
    }

    set rampUpLatency(value: number) {
        logger.debug(`Setting rampUpLatency from ${this._rampUpLatency} to ${value}`);
        this._rampUpLatency = this.roundValue(value);
    }

    // Correctness
    get correctness(): number {
        logger.debug(`Getting correctness: ${this._correctness}`);
        return this._correctness;
    }

    set correctness(value: number) {
        logger.debug(`Setting correctness from ${this._correctness} to ${value}`);
        this._correctness = this.roundValue(value);
    }

    get correctnessLatency(): number {
        logger.debug(`Getting correctnessLatency: ${this._correctnessLatency}`);
        return this._correctnessLatency;
    }

    set correctnessLatency(value: number) {
        logger.debug(`Setting correctnessLatency from ${this._correctnessLatency} to ${value}`);
        this._correctnessLatency = this.roundValue(value);
    }

    // Bus Factor
    get busFactor(): number {
        logger.debug(`Getting busFactor: ${this._busFactor}`);
        return this._busFactor;
    }

    set busFactor(value: number) {
        logger.debug(`Setting busFactor from ${this._busFactor} to ${value}`);
        this._busFactor = this.roundValue(value);
    }

    get busFactorLatency(): number {
        logger.debug(`Getting busFactorLatency: ${this._busFactorLatency}`);
        return this._busFactorLatency;
    }

    set busFactorLatency(value: number) {
        logger.debug(`Setting busFactorLatency from ${this._busFactorLatency} to ${value}`);
        this._busFactorLatency = this.roundValue(value);
    }

    // Responsive Maintainers
    get responsiveMaintainers(): number {
        logger.debug(`Getting responsiveMaintainers: ${this._responsiveMaintainers}`);
        return this._responsiveMaintainers;
    }

    set responsiveMaintainers(value: number) {
        logger.debug(`Setting responsiveMaintainers from ${this._responsiveMaintainers} to ${value}`);
        this._responsiveMaintainers = this.roundValue(value);
    }

    get responsiveMaintainersLatency(): number {
        logger.debug(`Getting responsiveMaintainersLatency: ${this._responsiveMaintainersLatency}`);
        return this._responsiveMaintainersLatency;
    }

    set responsiveMaintainersLatency(value: number) {
        logger.debug(`Setting responsiveMaintainersLatency from ${this._responsiveMaintainersLatency} to ${value}`);
        this._responsiveMaintainersLatency = this.roundValue(value);
    }

    // License
    get license(): number {
        logger.debug(`Getting license: ${this._license}`);
        return this._license;
    }

    set license(value: number) {
        logger.debug(`Setting license from ${this._license} to ${value}`);
        this._license = this.roundValue(value);
    }

    get licenseLatency(): number {
        logger.debug(`Getting licenseLatency: ${this._licenseLatency}`);
        return this._licenseLatency;
    }

    set licenseLatency(value: number) {
        logger.debug(`Setting licenseLatency from ${this._licenseLatency} to ${value}`);
        this._licenseLatency = this.roundValue(value);
    }

    // Dependency Pinning
    get dependencyPinning(): number {
        logger.debug(`Getting dependencyPinning: ${this._dependencyPinning}`);
        return this._dependencyPinning;
    }

    set dependencyPinning(value: number) {
        logger.debug(`Setting dependencyPinning from ${this._dependencyPinning} to ${value}`);
        this._dependencyPinning = this.roundValue(value);
    }

    get dependencyPinningLatency(): number {
        logger.debug(`Getting dependencyPinningLatency: ${this._dependencyPinningLatency}`);
        return this._dependencyPinningLatency;
    }

    set dependencyPinningLatency(value: number) {
        logger.debug(`Setting dependencyPinningLatency from ${this._dependencyPinningLatency} to ${value}`);
        this._dependencyPinningLatency = this.roundValue(value);
    }

    // Code Review
    get codeReview(): number {
        logger.debug(`Getting codeReview: ${this._codeReview}`);
        return this._codeReview;
    }

    set codeReview(value: number) {
        logger.debug(`Setting codeReview from ${this._codeReview} to ${value}`);
        this._codeReview = this.roundValue(value);
    }

    get codeReviewLatency(): number {
        logger.debug(`Getting codeReviewLatency: ${this._codeReviewLatency}`);
        return this._codeReviewLatency;
    }

    set codeReviewLatency(value: number) {
        logger.debug(`Setting codeReviewLatency from ${this._codeReviewLatency} to ${value}`);
        this._codeReviewLatency = this.roundValue(value);
    }

    
}