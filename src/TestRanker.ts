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

    private rampUpWeight: number = 0.15;
    private corrrectnessWeight: number = 0.1;
    private busFactorWeight: number = 0.15;
    private responsiveMaintainerWeight: number = 0.3;
    private licenseWeight: number = 0.3;

    private rampUpMax: number = 50;
    private corrrectnessMax: number = 20;
    private busFactorMax: number = 20;
    private responsiveMaintainerMax: number = 10;
    private licenseMax: number = 1;



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

    private Normalize(value: number, max: number): number {
        let num: number = value/max;
        if(num > 1){
            num = 1;
        }
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
        this.netScore = (this.rampUp * this.rampUpWeight) + (this.correctness * this.corrrectnessWeight) 
        + (this.busFactor * this.busFactorWeight) + (this.responsiveMaintainer * this.responsiveMaintainerWeight) 
        + (this.license * this.licenseWeight)
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
        this.rampUp = this.Normalize(value, this.rampUpMax);
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
        this.correctness = this.Normalize(value, this.corrrectnessMax);
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
        this.busFactor = this.Normalize(value, this.busFactorMax);
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
        this.responsiveMaintainer = this.Normalize(value, this.responsiveMaintainerMax);
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
        this.license = this.Normalize(value, this.licenseMax);
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
        this.responsiveMaintainer = -1;
        this.responsiveMaintainerLatency = -1;
        this.license = -1;
        this.licenseLatency = -1;
    }

}
