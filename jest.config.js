module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
        global: {
            lines: 80, // Set minimum coverage for lines
            functions: 80, // Set minimum coverage for functions
            branches: 80, // Set minimum coverage for branches
            statements: 80, // Set minimum coverage for statements
        },
    },
};