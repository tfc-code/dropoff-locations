module.exports = {
  globals: {
    google: 'readonly',
  },
  env: {
    browser: true,
    node: true,
    'jest/globals': true,
    'cypress/globals': true,
  },
  extends: [
    'plugin:@typescript-eslint/recommended',
    'airbnb-typescript',
    'prettier',
    'prettier/@typescript-eslint',
    'plugin:jest/recommended',
    'plugin:jsx-a11y/recommended',
    'plugin:cypress/recommended',
  ],
  rules: {
    'react/prop-types': 'off', // disable since we are using typescript
    'react/jsx-key': 1,
    'react/no-array-index-key': 1,
    'import/prefer-default-export': 0,
    'no-restricted-globals': 0
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: './tsconfig.json',
  },
  plugins: ['@typescript-eslint', 'jest', 'cypress'],
  overrides: [
    {
      files: ['./cypress/**/*'],
      rules: {
        'jest/expect-expect': 0,
      },
    },
  ],
  settings: {
    jest: {
      version: 26,
    },
  },
};
