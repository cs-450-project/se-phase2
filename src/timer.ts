export class Timer {

  private elapsedTime;
  private startTime;

  constructor(){
    this.elapsedTime = 0;
    this.startTime = 0;
  }

  public StartTime(){
    this.startTime = Date.now();
  }

  public GetTime(): number{
    this.elapsedTime = Date.now() - this.startTime;
    return Number((this.elapsedTime / 1000).toFixed(5));
  }

  public Reset(){
    this.elapsedTime = 0;
    this.startTime = 0;
  }

} //End class Timer