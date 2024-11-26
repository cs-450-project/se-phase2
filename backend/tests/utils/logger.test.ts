import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import pino from 'pino';
import testLogger from '../../src/utils/logger';

describe('Logger Utility', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeEach(() => {
        originalEnv = { ...process.env };
    });

    afterEach(() => {
        process.env = originalEnv;
    });

    it('should use "silent" level if LOG_LEVEL is not set', () => {
        process.env.LOG_LEVEL = undefined;
        expect(testLogger.level).toBe('silent');
    });

    it('should log to console if LOG_FILE is not set', () => {
        process.env.LOG_FILE = undefined;
        expect(testLogger[pino.symbols.streamSym].path).toBe(undefined);
    });
});