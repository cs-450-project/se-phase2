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

  private initial;

  constructor(){
    this.initial = 0;
  }

  public start(){
    this.initial = Date.now();
  }

  public stop() {
    let time = Number(((Date.now() - this.initial) / 1000).toFixed(5));
    this.initial = 0;
    return time;
  }

} //End class Timer
