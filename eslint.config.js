module.exports = {
    env: {
      node: true,
      es2021: true,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
      ecmaVersion: 12,
      sourceType: 'module',
    },
    plugins: ['@typescript-eslint'],
    extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended'],
    rules: {
      '@typescript-eslint/no-unused-vars': 'error',
    },
    ignorePatterns: ['dist/', 'node_modules/'],
    overrides: [
      {
        files: ['**/*.ts'],
        parser: '@typescript-eslint/parser',
        plugins: ['@typescript-eslint'],
        extends: ['plugin:@typescript-eslint/recommended'],
      }
    ],
  };
  