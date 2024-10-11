import { getBusFactor } from '../../metrics/BusFactor';

describe('BusFactor', () => {
  it('should return a bus factor for a given repository', async () => {
    const owner = 'facebook';
    const repo = 'react';
    const busFactor = await getBusFactor(owner, repo);
    expect(busFactor).toBeGreaterThan(0);
  });

  it('should return 0 if the repository does not exist', async () => {
    const owner = 'non-existent-owner';
    const repo = 'non-existent-repo';
    const busFactor = await getBusFactor(owner, repo);
    expect(busFactor).toBe(0);
  });

  
});