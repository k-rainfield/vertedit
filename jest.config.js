module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  
  // ファイル拡張子
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  
  // テスト対象ディレクトリ
  roots: ['<rootDir>/webview-src', '<rootDir>/webview-test'],
  
  // テストファイルパターンを拡張
  testMatch: [
    // '**/__tests__/**/*.{test,spec}.{ts,tsx}',
    '**/webview-test/**/*.{test,spec}.{ts,tsx}',
 //   '**/?(*.)(test|spec).{ts,tsx}'
  ],
  
  // TypeScript変換
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
        jsxImportSource: 'preact'
      }
    }]
  },
  
  // Preactのモジュール解決
  moduleNameMapper: {
    '^preact/jsx-runtime$': 'preact/jsx-runtime',
    '^preact/hooks$': 'preact/hooks',
    '^preact$': 'preact',
    '^htm/preact$': 'htm/preact'
  },
  
  // ES Modulesを変換対象に含める
  transformIgnorePatterns: [
    'node_modules/(?!(preact|htm|@testing-library)/)'
  ],
  
  // セットアップファイル
  setupFilesAfterEnv: ['<rootDir>/webview-test/jest-setup.ts'],
  
  // カバレッジ設定
  collectCoverageFrom: [
    'webview-src/**/*.{ts,tsx}',
    '!webview-src/**/*.d.ts',
    '!webview-src/main.tsx',
    '!webview-src/**/__tests__/**',
  ],
  
  // Preact向けの追加設定
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons']
  }
};