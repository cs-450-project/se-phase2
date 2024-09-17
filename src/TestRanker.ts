export class Calculate {
    private URL: string;
    private netScore: number;
    private netScoreLatency: number;
    private rampUp: number;
    private rampUpLatency: number;
    private correctness: number;
    private correctnessLatency: number;
    private busFactor: number;
    private busFactorLatency: number;
    private responsiveMaintainer: number;
    private responsiveMaintainerLatency: number;
    private license: number;
    private licenseLatency: number;

    private rampUpWeight: number;
    
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
        this.responsiveMaintainer = -1;
        this.responsiveMaintainerLatency = -1;
        this.license = -1;
        this.licenseLatency = -1;
    }

    public Normalize(): number {
        let num: number = 0;

        
        return num;
    }

    // Getters and Setters
    get GetURL(): string {
        return this.URL;
    }

    set SetURL(value: string) {
        this.URL = value;
    }

    get GetNetScore(): number {
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

    get GetResponsiveMaintainer(): number {
        return this.responsiveMaintainer;
    }

    set SetResponsiveMaintainer(value: number) {
        this.responsiveMaintainer = value;
    }

    get GetResponsiveMaintainerLatency(): number {
        return this.responsiveMaintainerLatency;
    }

    set SetResponsiveMaintainerLatency(value: number) {
        this.responsiveMaintainerLatency = value;
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

}