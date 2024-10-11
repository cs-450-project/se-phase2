/*
 * Timer.ts
 * 
 * Description:
 * This file will start a timer and return the time elapsed. 
 * 
 * Author: Kameran Parker
 * Date: 9-29-2024
 * Version: 1.0
 * 
 */

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
