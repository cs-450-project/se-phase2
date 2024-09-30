"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Calculate = void 0;
class Calculate {
    constructor() {
        this.rampUpWeight = 0.15;
        this.corrrectnessWeight = 0.1;
        this.busFactorWeight = 0.15;
        this.responsiveMaintainerWeight = 0.3;
        this.licenseWeight = 0.3;
        this.rampUpMax = 50;
        this.corrrectnessMax = 20;
        this.busFactorMax = 20;
        this.responsiveMaintainerMax = 10;
        this.licenseMax = 1;
        this.URL = "none";
        this.netScore = -1;
        this.netScoreLatency = -1;
        this.rampUp = -1;
        this.rampUpLatency = -1;
        this.correctness = -1;
        this.correctnessLatency = -1;
        this.busFactor = -1;
        this.busFactorLatency = -1;
        this.responsiveMaintainer = -1;
        this.responsiveMaintainerLatency = -1;
        this.license = -1;
        this.licenseLatency = -1;
    }
    Normalize(value, max) {
        let num = value / max;
        if (num > 1) {
            num = 1;
        }
        return num;
    }
    // Getters and Setters
    get GetURL() {
        return this.URL;
    }
    set SetURL(value) {
        this.URL = value;
    }
    get GetNetScore() {
        this.netScore = (this.rampUp * this.rampUpWeight) + (this.correctness * this.corrrectnessWeight)
            + (this.busFactor * this.busFactorWeight) + (this.responsiveMaintainer * this.responsiveMaintainerWeight)
            + (this.license * this.licenseWeight);
        if (this.netScore > 1) {
            this.netScore = 1;
        }
        return this.netScore;
    }
    get GetNetScoreLatency() {
        return this.netScoreLatency;
    }
    set SetNetScoreLatency(value) {
        this.netScoreLatency = value;
    }
    get GetRampUp() {
        return this.rampUp;
    }
    set SetRampUp(value) {
        this.rampUp = this.Normalize(value, this.rampUpMax);
    }
    get GetRampUpLatency() {
        return this.rampUpLatency;
    }
    set SetRampUpLatency(value) {
        this.rampUpLatency = value;
    }
    get GetCorrectness() {
        return this.correctness;
    }
    set SetCorrectness(value) {
        this.correctness = this.Normalize(value, this.corrrectnessMax);
    }
    get GetCorrectnessLatency() {
        return this.correctnessLatency;
    }
    set SetCorrectnessLatency(value) {
        this.correctnessLatency = value;
    }
    get GetBusFactor() {
        return this.busFactor;
    }
    set SetBusFactor(value) {
        this.busFactor = this.Normalize(value, this.busFactorMax);
    }
    get GetBusFactorLatency() {
        return this.busFactorLatency;
    }
    set SetBusFactorLatency(value) {
        this.busFactorLatency = value;
    }
    get GetResponsiveMaintainer() {
        return this.responsiveMaintainer;
    }
    set SetResponsiveMaintainer(value) {
        this.responsiveMaintainer = this.Normalize(value, this.responsiveMaintainerMax);
    }
    get GetResponsiveMaintainerLatency() {
        return this.responsiveMaintainerLatency;
    }
    set SetResponsiveMaintainerLatency(value) {
        this.responsiveMaintainerLatency = value;
    }
    get GetLicense() {
        return this.license;
    }
    set SetLicense(value) {
        this.license = this.Normalize(value, this.licenseMax);
    }
    get GetLicenseLatency() {
        return this.licenseLatency;
    }
    set SetLicenseLatency(value) {
        this.licenseLatency = value;
    }
    Clear() {
        this.URL = "none";
        this.netScore = -1;
        this.netScoreLatency = -1;
        this.rampUp = -1;
        this.rampUpLatency = -1;
        this.correctness = -1;
        this.correctnessLatency = -1;
        this.busFactor = -1;
        this.busFactorLatency = -1;
        this.responsiveMaintainer = -1;
        this.responsiveMaintainerLatency = -1;
        this.license = -1;
        this.licenseLatency = -1;
    }
}
exports.Calculate = Calculate;
//# sourceMappingURL=Ranker.js.map