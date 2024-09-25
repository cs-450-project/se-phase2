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

/*
//place this line right before a function to start the timer
var startTime = Date.now();

//place these 3 lines of code after a function call or body of code to stop the timer and to display the time
var elapsedTime = Date.now() - startTime;
var time = (elapsedTime / 1000).toFixed(3);
console.log("function took " + time + " seconds");
*/