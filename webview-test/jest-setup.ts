import '@testing-library/jest-dom';

// Preact用のグローバル設定（型アサーション）
(global as any).React = require('preact/compat');

// DOM API Mock
Object.defineProperty(window, 'getSelection', {
  value: () => ({
    removeAllRanges: jest.fn(),
    addRange: jest.fn(),
    toString: () => ''
  })
});

Object.defineProperty(document, 'createRange', {
  value: () => ({
    setStart: jest.fn(),
    setEnd: jest.fn(),
    collapse: jest.fn()
  })
});

// contentEditable関連のMock
Object.defineProperty(Element.prototype, 'contentEditable', {
  set: jest.fn(),
  get: jest.fn(() => 'true')
});