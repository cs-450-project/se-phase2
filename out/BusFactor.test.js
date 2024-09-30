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
Object.defineProperty(exports, "__esModule", { value: true });
const BusFactor_1 = require("./BusFactor");
describe('BusFactor', () => {
    it('should return a bus factor for a given repository', () => __awaiter(void 0, void 0, void 0, function* () {
        const owner = 'facebook';
        const repo = 'react';
        const busFactor = yield (0, BusFactor_1.getBusFactor)(owner, repo);
        expect(busFactor).toBeGreaterThan(0);
    }));
    it('should return 0 if the repository does not exist', () => __awaiter(void 0, void 0, void 0, function* () {
        const owner = 'non-existent-owner';
        const repo = 'non-existent-repo';
        const busFactor = yield (0, BusFactor_1.getBusFactor)(owner, repo);
        expect(busFactor).toBe(0);
    }));
});
//# sourceMappingURL=BusFactor.test.js.map