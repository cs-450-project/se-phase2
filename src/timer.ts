
//place this line right before a function to start the timer
var startTime = Date.now();

//function/code body goes in here





//place these 3 lines of code after a function call or body of code to stop the timer and to display the time
var elapsedTime = Date.now() - startTime;
  var time = (elapsedTime / 1000).toFixed(3);
  console.log("function took " + time + " seconds");