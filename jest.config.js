module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  roots: ['<rootDir>/webview-src', '<rootDir>/webview-test'],
  
  testMatch: [
    '**/webview-test/**/*.{test,spec}.{ts,tsx}',
  ],
  
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        jsxImportSource: 'preact'
      }
    }]
  },
  
  // Preact module aliasing
  moduleNameMapper: {
    '^preact/jsx-runtime$': 'preact/jsx-runtime',
    '^preact/hooks$': 'preact/hooks',
    '^preact$': 'preact',
    '^htm/preact$': 'htm/preact'
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(preact|htm|@testing-library)/)'
  ],
  
  setupFilesAfterEnv: ['<rootDir>/webview-test/jest-setup.ts'],
  
  collectCoverageFrom: [
    'webview-src/**/*.{ts,tsx}',
    '!webview-src/**/*.d.ts',
    '!webview-src/main.tsx',
    '!webview-src/**/__tests__/**',
  ],
  
  // Preact and Jest compatibility settings
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
};