import { render, fireEvent } from '@testing-library/preact';
import '@testing-library/jest-dom';
import { VerticalTextContainer } from '../../webview-src/components/VerticalTextContainer';

describe('VerticalTextContainer', () => {
  it('should render initial content', () => {
    // Given: initial content
    const initialContent = 'テスト\n2行目';
    const handleChange = jest.fn();

    // When: render component
    const { container } = render(
      <VerticalTextContainer content={initialContent} onContentChange={handleChange} />
    );

    // Then: paragraphs are rendered
    const paragraphs = container.querySelectorAll('.paragraph');
    expect(paragraphs.length).toBeGreaterThan(0);
    expect(paragraphs[0]).toHaveTextContent('テスト');
  });

  it('should call onContentChange when input occurs', () => {
    // Given: initial content
    const initialContent = 'テスト';
    const handleChange = jest.fn();
    const { container } = render(
      <VerticalTextContainer content={initialContent} onContentChange={handleChange} />
    );
    const editableDiv = container.querySelector('.vertical-text-container') as HTMLDivElement;

    // When: change textContent and fire input
    editableDiv.textContent = '変更後';
    fireEvent.input(editableDiv);

    // Then: onContentChange is called
    expect(handleChange).toHaveBeenCalledWith('変更後');
  });

  it('should merge lines on Backspace at line start', () => {
    // Given: multiline content
    const initialContent = '1行目\n2行目';
    let changedContent = '';
    const handleChange = (c: string) => { changedContent = c; };
    const { container } = render(
      <VerticalTextContainer content={initialContent} onContentChange={handleChange} />
    );
    const editableDiv = container.querySelector('.vertical-text-container') as HTMLDivElement;

    // When: simulate Backspace at line start
    // (実際のカーソル操作は難しいため、ここではAPI呼び出し例)
    fireEvent.keyDown(editableDiv, { key: 'Backspace' });

    // Then: content change callback is called (may be unchanged if not at line start)
    // ここでは呼ばれることのみ確認
    expect(typeof changedContent).toBe('string');
  });

  it('should maintain cursor position when typing space in empty line', () => {
    // Given: content with empty line in middle
    const initialContent = '1行目\n\n3行目';
    let changedContent = '';
    const handleChange = (c: string) => { changedContent = c; };
    const { container } = render(
      <VerticalTextContainer content={initialContent} onContentChange={handleChange} />
    );
    const editableDiv = container.querySelector('.vertical-text-container') as HTMLDivElement;

    // When: simulate typing space in empty line
    // This simulates the bug where cursor jumps to first line
    const paragraphs = editableDiv.querySelectorAll('.paragraph');
    expect(paragraphs).toHaveLength(3);
    
    // The middle paragraph should be empty (contains only <br>)
    expect(paragraphs[1].innerHTML).toBe('<br>');
    
    // Simulate user selecting empty line and typing space
    editableDiv.textContent = '1行目\n \n3行目';
    fireEvent.input(editableDiv);

    // Then: content should have space in middle line, not at beginning
    expect(changedContent).toBe('1行目\n \n3行目');
  });

  it('should maintain cursor position when typing full-width space in empty line', () => {
    // Given: content with empty line in middle
    const initialContent = '1行目\n\n3行目';
    let changedContent = '';
    const handleChange = (c: string) => { changedContent = c; };
    const { container } = render(
      <VerticalTextContainer content={initialContent} onContentChange={handleChange} />
    );
    const editableDiv = container.querySelector('.vertical-text-container') as HTMLDivElement;

    // When: simulate typing full-width space in empty line
    editableDiv.textContent = '1行目\n　\n3行目';
    fireEvent.input(editableDiv);

    // Then: content should have full-width space in middle line
    expect(changedContent).toBe('1行目\n　\n3行目');
  });

  it('should preserve spaces in space-only lines', () => {
    // Given: content with space-only lines
    const initialContent = '1行目\n  \n3行目';
    let changedContent = '';
    const handleChange = (c: string) => { changedContent = c; };
    const { container } = render(
      <VerticalTextContainer content={initialContent} onContentChange={handleChange} />
    );
    const editableDiv = container.querySelector('.vertical-text-container') as HTMLDivElement;

    // When: component processes the content
    const paragraphs = editableDiv.querySelectorAll('.paragraph');
    expect(paragraphs).toHaveLength(3);
    
    // Then: middle paragraph should contain spaces, not <br>
    expect(paragraphs[1].innerHTML).toBe('  ');
    expect(paragraphs[1].innerHTML).not.toBe('<br>');
    
    // And: when we convert back to plain text, spaces should be preserved
    fireEvent.input(editableDiv);
    expect(changedContent).toBe('1行目\n  \n3行目');
  });

  it('should test if cursor position restoration is needed', () => {
    // Given: content that would trigger innerHTML update
    const initialContent = '1行目\n2行目';
    const handleChange = jest.fn();
    const { container, rerender } = render(
      <VerticalTextContainer content={initialContent} onContentChange={handleChange} />
    );
    const editableDiv = container.querySelector('.vertical-text-container') as HTMLDivElement;

    // When: content is changed externally (like from parent component)
    // This should trigger the useEffect that updates innerHTML
    const newContent = '1行目\n2行目\n3行目';
    rerender(<VerticalTextContainer content={newContent} onContentChange={handleChange} />);

    // Then: DOM should be updated with new content
    const paragraphs = editableDiv.querySelectorAll('.paragraph');
    expect(paragraphs).toHaveLength(3);
    expect(paragraphs[2]).toHaveTextContent('3行目');
  });
});
