module.exports = {
    globals: {
        google: 'readonly',
    },
    env: {
        browser: true,
        node: true,
    },
    extends: ['plugin:@typescript-eslint/recommended', 'prettier', 'prettier/@typescript-eslint'],
    rules: {
        'import/prefer-default-export': 0,
    },
    parser: '@typescript-eslint/parser',
    parserOptions: {
        tsconfigRootDir: __dirname,
        project: './tsconfig.json',
    },
    plugins: ['@typescript-eslint'],
};
