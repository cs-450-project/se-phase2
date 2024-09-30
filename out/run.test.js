"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const { exec } = require('child_process');
const run = require('./run');
describe('run.js', () => {
    it('should run the install command', () => __awaiter(void 0, void 0, void 0, function* () {
        const output = yield new Promise((resolve, reject) => {
            exec('node run.js install', () => {
            });
        });
        expect(output).toContain('Successfully ran Install.js');
    }));
    it('should run the test command', () => __awaiter(void 0, void 0, void 0, function* () {
        const output = yield new Promise((resolve, reject) => {
            exec('node run.js test', () => {
            });
        });
        expect(output).toContain('Successfully ran TestRun.js');
    }));
    it('should run the master command with a URL', () => __awaiter(void 0, void 0, void 0, function* () {
        const output = yield new Promise((resolve, reject) => {
            exec('node run.js https://www.npmjs.com/package/express', () => {
            });
        });
        expect(output).toContain('running subprogram Master.js to test https://www.npmjs.com/package/express');
    }));
});
//# sourceMappingURL=run.test.js.map