import { h } from 'preact';
import { render, fireEvent, screen, act } from '@testing-library/preact';
import '@testing-library/jest-dom';

import { TategakiEditor } from '../../webview-src/components/TategakiEditor';

// VS Code API モック
const postMessageMock = jest.fn();
// 型アサーションで global にプロパティ追加
(global as any).acquireVsCodeApi = () => ({ postMessage: postMessageMock });

describe('TategakiEditor', () => {
  beforeEach(() => {
    postMessageMock.mockClear();
  });

  it('should render SaveIndicator and VerticalTextContainer', () => {
    // Given: 初期コンテンツ
    const initialContent = "テスト";

    // When: エディタをレンダリング
    render(<TategakiEditor initialContent={initialContent} />);

    // Then: SaveIndicatorとVerticalTextContainerが表示される
    expect(document.querySelector('.save-indicator')).toBeInTheDocument();
    expect(document.querySelector('.vertical-text-container')).toBeInTheDocument();
  });

  it('should show unsaved status when content is changed', () => {
    // Given: 初期コンテンツ
    const initialContent = "テスト";
    render(<TategakiEditor initialContent={initialContent} />);
    const editableDiv = document.querySelector('.vertical-text-container') as HTMLDivElement;

    // When: テキストエリアの内容を変更
    // テキスト内容を変更
    editableDiv.textContent = '変更後';
    // inputイベントを発火
    fireEvent.input(editableDiv);

    // Then: SaveIndicatorがunsaved状態になる
    const indicator = document.querySelector('.save-indicator');
    expect(indicator).toHaveTextContent(/未保存|unsaved/i);
  });

  it('should call save on Ctrl+S/⌘+S and send postMessage', () => {
    // Given: 初期コンテンツ
    render(<TategakiEditor initialContent="テスト" />);
    const editableDiv = document.querySelector('.vertical-text-container') as HTMLDivElement;
    fireEvent.input(editableDiv, { target: { textContent: '保存テスト' } });

    // When: Ctrl+Sを押す
    act(() => {
      fireEvent.keyDown(document, { key: 's', ctrlKey: true });
    });

    // Then: postMessageが呼ばれる
    expect(postMessageMock).toHaveBeenCalledWith({ command: 'save', content: '保存テスト' });
  });

  it('should update saveStatus on saveComplete message (success)', () => {
    // Given: 初期コンテンツ
    render(<TategakiEditor initialContent="テスト" />);

    // When: saveComplete(success)メッセージを受信
    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { command: 'saveComplete', success: true } }));
    });

    // Then: SaveIndicatorがsaved状態になる
    const indicator = document.querySelector('.save-indicator');
    expect(indicator).toHaveTextContent(/保存済み|saved/i);
  });

  it('should update saveStatus on saveComplete message (error)', () => {
    // Given: 初期コンテンツ
    render(<TategakiEditor initialContent="テスト" />);

    // When: saveComplete(error)メッセージを受信
    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { command: 'saveComplete', success: false } }));
    });

    // Then: SaveIndicatorがerror状態になる
    const indicator = document.querySelector('.save-indicator');
    expect(indicator).toHaveTextContent(/保存失敗|error/i);
  });

  it('should handle requestSave message from VS Code', () => {
    // Given: 初期コンテンツ
    render(<TategakiEditor initialContent="テスト" />);

    // When: requestSaveメッセージを受信
    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { command: 'requestSave' } }));
    });

    // Then: postMessageが呼ばれる
    expect(postMessageMock).toHaveBeenCalledWith({ command: 'save', content: 'テスト' });
  });

  it('should apply wrapped height when updateWordWrapColumn message is received', () => {
    // Given: editor starts without wrap column
    render(<TategakiEditor initialContent="テスト" wordWrapColumn={null} />);
    const editableDiv = document.querySelector('.vertical-text-container') as HTMLDivElement;
    expect(editableDiv).not.toHaveClass('wrapped');

    // When: webview receives updateWordWrapColumn with a positive number
    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { command: 'updateWordWrapColumn', wordWrapColumn: 40 } }));
    });

    // Then: wrapped class and CSS variable are applied
    const updatedDiv = document.querySelector('.vertical-text-container') as HTMLDivElement;
    expect(updatedDiv).toHaveClass('wrapped');
    expect(updatedDiv.style.getPropertyValue('--word-wrap-column')).toBe('40');
  });

  it('should clear wrapped height when updateWordWrapColumn is set to null', () => {
    // Given: editor starts with wrap column applied
    render(<TategakiEditor initialContent="テスト" wordWrapColumn={30} />);
    const editableDiv = document.querySelector('.vertical-text-container') as HTMLDivElement;
    expect(editableDiv).toHaveClass('wrapped');

    // When: webview receives updateWordWrapColumn with null
    act(() => {
      window.dispatchEvent(new MessageEvent('message', { data: { command: 'updateWordWrapColumn', wordWrapColumn: null } }));
    });

    // Then: wrapped class is removed and custom property is cleared
    const updatedDiv = document.querySelector('.vertical-text-container') as HTMLDivElement;
    expect(updatedDiv).not.toHaveClass('wrapped');
    expect(updatedDiv.style.getPropertyValue('--word-wrap-column')).toBe('');
  });
});
