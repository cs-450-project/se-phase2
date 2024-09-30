"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = void 0;
class Timer {
    constructor() {
        this.elapsedTime = 0;
        this.startTime = 0;
    }
    StartTime() {
        this.startTime = Date.now();
    }
    GetTime() {
        this.elapsedTime = Date.now() - this.startTime;
        return Number((this.elapsedTime / 1000).toFixed(5));
    }
    Reset() {
        this.elapsedTime = 0;
        this.startTime = 0;
    }
} //End class Timer
exports.Timer = Timer;
//# sourceMappingURL=Timer.js.map