module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['dist', 'node_modules'],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    // Basic rules for code quality
    'no-unused-vars': 'warn',
    'no-console': 'warn',
    'no-debugger': 'error',
  },
}
