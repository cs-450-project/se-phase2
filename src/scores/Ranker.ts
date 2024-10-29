/*
 * URLParser.ts
 * 
 * Description:
 * This file takes a text file and splits each line as it's own URL. Then it performs an operation on each one
 * 
 * Author: Jacob Esparza
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

import logger from '../logger.js';

export class Ranker {

    private URL: string;
    private netScore: number;
    private netScoreLatency: number;
    private rampUp: number;
    private rampUpLatency: number;
    private correctness: number;
    private correctnessLatency: number;
    private busFactor: number;
    private busFactorLatency: number;
    private responsiveMaintainers: number;
    private responsiveMaintainersLatency: number;
    private license: number;
    private licenseLatency: number;

    private rampUpWeight: number = 0.15;
    private corrrectnessWeight: number = 0.1;
    private busFactorWeight: number = 0.15;
    private responsiveMaintainersWeight: number = 0.3;
    private licenseWeight: number = 0.3;

    constructor(){
        this.URL = "none";
        this.netScore = -1;
        this.netScoreLatency = -1;
        this.rampUp = -1;
        this.rampUpLatency = -1;
        this.correctness = -1;
        this.correctnessLatency = -1;
        this.busFactor = -1;
        this.busFactorLatency = -1;
        this.responsiveMaintainers = -1;
        this.responsiveMaintainersLatency = -1;
        this.license = -1;
        this.licenseLatency = -1;
        logger.info('Ranker instance created with default values.');
    }

    // Getters and Setters
    get GetURL(): string {
        logger.debug(`Getting URL: ${this.URL}`);
        return this.URL;
    }

    set SetURL(value: string) {
        logger.debug(`Setting URL from ${this.URL} to ${value}`);
        this.URL = value;
    }

    get GetNetScore(): number {
        this.netScore = (this.rampUp * this.rampUpWeight) + 
                        (this.correctness * this.corrrectnessWeight) + 
                        (this.busFactor * this.busFactorWeight) + 
                        ((this.responsiveMaintainers) * this.responsiveMaintainersWeight) + 
                        (this.license * this.licenseWeight);
                        
        if(this.netScore > 1){
            this.netScore = 1;
        }
        logger.debug(`Calculated netScore: ${this.netScore}`);
        return this.netScore;
    }

    get GetNetScoreLatency(): number {
        logger.debug(`Getting netScoreLatency: ${this.netScoreLatency}`);
        return this.netScoreLatency;
    }

    set SetNetScoreLatency(value: number) {
        logger.debug(`Setting netScoreLatency from ${this.netScoreLatency} to ${value}`);
        this.netScoreLatency = value;
    }

    get GetRampUp(): number {
        logger.debug(`Getting rampUp: ${this.rampUp}`);
        return this.rampUp;
    }

    set SetRampUp(value: number) {
        logger.debug(`Setting rampUp from ${this.rampUp} to ${value}`);
        this.rampUp = value;
    }

    get GetRampUpLatency(): number {
        logger.debug(`Getting rampUpLatency: ${this.rampUpLatency}`);
        return this.rampUpLatency;
    }

    set SetRampUpLatency(value: number) {
        logger.debug(`Setting rampUpLatency from ${this.rampUpLatency} to ${value}`);
        this.rampUpLatency = value;
    }

    get GetCorrectness(): number {
        logger.debug(`Getting correctness: ${this.correctness}`);
        return this.correctness;
    }

    set SetCorrectness(value: number) {
        logger.debug(`Setting correctness from ${this.correctness} to ${value}`);
        this.correctness = value;
    }

    get GetCorrectnessLatency(): number {
        logger.debug(`Getting correctnessLatency: ${this.correctnessLatency}`);
        return this.correctnessLatency;
    }

    set SetCorrectnessLatency(value: number) {
        logger.debug(`Setting correctnessLatency from ${this.correctnessLatency} to ${value}`);
        this.correctnessLatency = value;
    }

    get GetBusFactor(): number {
        logger.debug(`Getting busFactor: ${this.busFactor}`);
        return this.busFactor;
    }

    set SetBusFactor(value: number) {
        logger.debug(`Setting busFactor from ${this.busFactor} to ${value}`);
        this.busFactor = value;
    }

    get GetBusFactorLatency(): number {
        logger.debug(`Getting busFactorLatency: ${this.busFactorLatency}`);
        return this.busFactorLatency;
    }

    set SetBusFactorLatency(value: number) {
        logger.debug(`Setting busFactorLatency from ${this.busFactorLatency} to ${value}`);
        this.busFactorLatency = value;
    }

    get GetResponsiveMaintainers(): number {
        logger.debug(`Getting responsiveMaintainers: ${this.responsiveMaintainers}`);
        return  this.responsiveMaintainers;
    }

    set SetResponsiveMaintainers(value: number) {
        logger.debug(`Setting responsiveMaintainers from ${this.responsiveMaintainers} to ${value}`);
        this.responsiveMaintainers = value;
    }

    get GetResponsiveMaintainersLatency(): number {
        logger.debug(`Getting responsiveMaintainersLatency: ${this.responsiveMaintainersLatency}`);
        return this.responsiveMaintainersLatency;
    }

    set SetResponsiveMaintainersLatency(value: number) {
        logger.debug(`Setting responsiveMaintainersLatency from ${this.responsiveMaintainersLatency} to ${value}`);
        this.responsiveMaintainersLatency = value;
    }

    get GetLicense(): number {
        logger.debug(`Getting license: ${this.license}`);
        return this.license;
    }

    set SetLicense(value: number) {
        logger.debug(`Setting license from ${this.license} to ${value}`);
        this.license = value;
    }

    get GetLicenseLatency(): number {
        logger.debug(`Getting licenseLatency: ${this.licenseLatency}`);
        return this.licenseLatency;
    }

    set SetLicenseLatency(value: number) {
        logger.debug(`Setting licenseLatency from ${this.licenseLatency} to ${value}`);
        this.licenseLatency = value;
    }

    public Clear(){
        logger.info('Clearing all values to default.');
        this.URL = "none";
        this.netScore = -1;
        this.netScoreLatency = -1;
        this.rampUp = -1;
        this.rampUpLatency = -1;
        this.correctness = -1;
        this.correctnessLatency = -1;
        this.busFactor = -1;
        this.busFactorLatency = -1;
        this.responsiveMaintainers = -1;
        this.responsiveMaintainersLatency = -1;
        this.license = -1;
        this.licenseLatency = -1;
    }

}
