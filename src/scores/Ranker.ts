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
    }

    // Getters and Setters
    get GetURL(): string {
        return this.URL;
    }

    set SetURL(value: string) {
        this.URL = value;
    }

    get GetNetScore(): number {
        this.netScore = (this.rampUp * this.rampUpWeight) + 
                        (this.correctness * this.corrrectnessWeight) + 
                        (this.busFactor * this.busFactorWeight) + 
                        ((this.responsiveMaintainers) * this.responsiveMaintainersWeight) + 
                        (this.license * this.licenseWeight)
                        
        if(this.netScore > 1){
            this.netScore = 1;
        }
        return this.netScore;
    }

    get GetNetScoreLatency(): number {
        return this.netScoreLatency;
    }

    set SetNetScoreLatency(value: number) {
        this.netScoreLatency = value;
    }

    get GetRampUp(): number {
        return this.rampUp;
    }

    set SetRampUp(value: number) {
        this.rampUp = value;
    }

    get GetRampUpLatency(): number {
        return this.rampUpLatency;
    }

    set SetRampUpLatency(value: number) {
        this.rampUpLatency = value;
    }

    get GetCorrectness(): number {
        return this.correctness;
    }

    set SetCorrectness(value: number) {
        this.correctness = value;
    }

    get GetCorrectnessLatency(): number {
        return this.correctnessLatency;
    }

    set SetCorrectnessLatency(value: number) {
        this.correctnessLatency = value;
    }

    get GetBusFactor(): number {
        return this.busFactor;
    }

    set SetBusFactor(value: number) {
        this.busFactor = value;
    }

    get GetBusFactorLatency(): number {
        return this.busFactorLatency;
    }

    set SetBusFactorLatency(value: number) {
        this.busFactorLatency = value;
    }

    get GetResponsiveMaintainers(): number {
        return  this.responsiveMaintainers;
    }

    set SetResponsiveMaintainers(value: number) {
        this.responsiveMaintainers = value;
    }

    get GetResponsiveMaintainersLatency(): number {
        return this.responsiveMaintainersLatency;
    }

    set SetResponsiveMaintainersLatency(value: number) {
        this.responsiveMaintainersLatency = value;
    }

    get GetLicense(): number {
        return this.license;
    }

    set SetLicense(value: number) {
        this.license = value;
    }

    get GetLicenseLatency(): number {
        return this.licenseLatency;
    }

    set SetLicenseLatency(value: number) {
        this.licenseLatency = value;
    }

    public Clear(){
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
