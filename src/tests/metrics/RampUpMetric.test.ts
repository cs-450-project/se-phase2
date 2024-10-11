import { displayRampupScore } from '../../metrics/RampUpMetric';

describe('RampupMetric', () => {
  it('should display the rampup score for a given repository', async () => {
    const owner = 'facebook';
    const repo = 'react';
    const rampupScore = await displayRampupScore(owner, repo);
    expect(rampupScore).toBeGreaterThan(0);
  });

  it('should return 0 if the repository does not exist', async () => {
    const owner = 'non-existent-owner';
    const repo = 'non-existent-repo';
    const rampupScore = await displayRampupScore(owner, repo);
    expect(rampupScore).toBe(0);
  });

 
});