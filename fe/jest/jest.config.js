module.exports = {
  rootDir: '../',
  setupFilesAfterEnv: ['<rootDir>/jest/__setup__/setup.ts'],
  collectCoverageFrom: ['<rootDir>/src/*/**/*.t{s,sx}'],
  coveragePathIgnorePatterns: [
    '<rootDir>/src/pages',
    '<rootDir>/src/containers/index.ts',
    '<rootDir>/src/containers/Home/components/index.ts',
    '<rootDir>/src/contexts/index.ts',
    '<rootDir>/src/i18n',
    '<rootDir>/src/utils/index.ts',
    'types.ts',
  ],
  testPathIgnorePatterns: ['<rootDir>/node_modules', '<rootDir>/.next', '<rootDir>/cypress'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/test/__mocks__/file-mock.js',
    '\\.(css|less)$': '<rootDir>/test/__mocks__/style-mock.js',
    '@/components': ['<rootDir>/src/components/index'],
    '@/contexts': ['<rootDir>/src/contexts/index'],
    '@/containers': ['<rootDir>/src/containers/index'],
    '@/i18n': ['<rootDir>/src/i18n/index'],
    '@/utils': ['<rootDir>/src/utils/index'],
    '@/api/src/types': ['<rootDir>/__mocks__/types.ts'],
  },
};
