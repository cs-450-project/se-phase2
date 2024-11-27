import { describe, it, expect } from 'vitest';
import { PackageQuery } from '../../../src/utils/types/PackageQuery';

describe('PackageQuery', () => {
    it('should have a Version property of type string', () => {
        const query: PackageQuery = { Version: '1.0.0', Name: 'example-package' };
        expect(typeof query.Version).toBe('string');
    });

    it('should have a Name property of type string', () => {
        const query: PackageQuery = { Version: '1.0.0', Name: 'example-package' };
        expect(typeof query.Name).toBe('string');
    });

    it('should create a valid PackageQuery object', () => {
        const query: PackageQuery = { Version: '1.0.0', Name: 'example-package' };
        expect(query).toEqual({ Version: '1.0.0', Name: 'example-package' });
    });
});