import { describe, it, expect, vi, beforeEach, afterEach, Mock } from 'vitest';

// Mock the octokit module before importing evaluateRampUp
vi.mock('../../../src/utils/octokit', () => ({
  default: {
    repos: {
      getReadme: vi.fn(),
    },
  },
}));

// Mock the logger module
vi.mock('../../../src/utils/logger', () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    error: vi.fn(),
  },
}));

// Import the modules under test after mocking
import { evaluateRampUp } from '../../../src/services/metrics/evaluateRampUp';
import octokit from '../../../src/utils/octokit';
import logger from '../../../src/utils/logger';
import { read } from 'fs';

describe('evaluateRampUp', () => {
  const octokitMock = octokit as unknown as {
    repos: {
      getReadme: Mock;
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 0 when README has none of the required sections', async () => {
    octokitMock.repos.getReadme.mockResolvedValue({ data: { content: '' } });
    
    const readmeContent = `
      # Sample Project
      This is a sample README without the required sections.
    `;

    octokitMock.repos.getReadme.mockResolvedValueOnce({
      data: [
        { content: Buffer.from(readmeContent).toString('base64') },
      ],
    });

    const result = await evaluateRampUp(readmeContent);
    expect(result).toBe(0);
  });

  it('should return 1 when README has all required sections', async () => {
    
    const readmeContent = `
            ## License
            ## Support
            ## Getting Started
            ## Installation
            ## Usage
            ## Contributing
            ## Documentation
            ## License
            ## Contributing`;

    const result = await evaluateRampUp(readmeContent);
    expect(result).toBe(1);
  });

  it('should calculate the correct score based on present sections (0.4)', async () => {

    const readmeContent = `## 
            Introduction
            Some introduction text.

            ## Usage
            How to use the project.
            `;

    const result = await evaluateRampUp(readmeContent);
    expect(result).toBe(0.4); // 0.2 for Introduction + 0.2 for Usage
  });

  it('should calculate the correct score based on present sections and varying casing (0.8)', async () => {
    const readmeContent = `
      ## IntroDuction
      Some introduction text.

      ### InstAllation
      Installation instructions.

      #### USAGE
      How to use the project.

      ##### Contributing
      Contribution guidelines.

      ###### License
      MIT License.
    `;

    const result = await evaluateRampUp(readmeContent);
    expect(result).toBe(0.8); // 0.2 for each section found
  });

  it('should return 0 when README is not found', async () => {
    const readmeContent = '';

    const result = await evaluateRampUp(readmeContent);
    expect(result).toBe(0);
    
  });


});