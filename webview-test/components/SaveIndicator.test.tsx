import { h } from 'preact';
/** @jsxImportSource preact */
import { render, screen } from '@testing-library/preact';
import { SaveIndicator } from '../../webview-src/components/SaveIndicator.tsx';

describe('SaveIndicator', () => {
  test('shows "未保存" and unsaved color', () => {
    render(<SaveIndicator status="unsaved" />);
    expect(screen.getByText('未保存')).toBeInTheDocument();
    expect(screen.getByText('未保存')).toHaveStyle({color: '#d73a49'});    
  });

  test('shows "保存中..." and saving color', () => {
    render(<SaveIndicator status="saving" />);
    expect(screen.getByText('保存中...')).toBeInTheDocument();
    expect(screen.getByText('保存中...')).toHaveStyle('color: #0366d6');
  });

  test('shows "保存済み" and saved color', () => {
    render(<SaveIndicator status="saved" />);
    expect(screen.getByText('保存済み')).toBeInTheDocument();
    expect(screen.getByText('保存済み')).toHaveStyle('color: #28a745');
  });

  test('shows "保存失敗" and error color', () => {
    render(<SaveIndicator status="error" />);
    expect(screen.getByText('保存失敗')).toBeInTheDocument();
    expect(screen.getByText('保存失敗')).toHaveStyle('color: #d73a49');
  });

  test('shows nothing and default color for idle', () => {
    render(<SaveIndicator status="idle" />);
    expect(screen.getByText('保存済み')).toBeInTheDocument();
    expect(screen.getByText('保存済み')).toHaveStyle('color: #666');
  });
});
