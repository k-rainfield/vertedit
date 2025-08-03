/** @jsxImportSource preact */
import { useRef, useEffect} from 'preact/hooks';
import { processTextForVerticalDisplay } from './processTextForVerticalDisplay';
import { checkIfAtLineStart, mergeCurrentLineWithPrevious } from '../utils/cursorPositionUtils';

interface VerticalTextContainerProps {
  content: string;
  onContentChange: (content: string) => void;
}

export const VerticalTextContainer = ({ content, onContentChange }: VerticalTextContainerProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  // Convert HTML back to plain text
  const convertToPlainText = (html: string): string => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Remove tate-chu-yoko spans but keep the text content
    const tateChuYokoSpans = temp.querySelectorAll('.tate-chu-yoko');
    tateChuYokoSpans.forEach(span => {
      const textNode = document.createTextNode(span.textContent || '');
      span.parentNode?.replaceChild(textNode, span);
    });
    const paragraphs = temp.querySelectorAll('.paragraph');
    let plainText = '';
    if (paragraphs.length > 0) {
      paragraphs.forEach((p, index) => {
        if (index > 0) {
          plainText += '\n';
        }
        // Check if paragraph contains only <br> (empty line)
        if (p.innerHTML === '<br>' || p.innerHTML === '<br/>' || p.innerHTML === '<br />') {
          plainText += '';
        } else {
          plainText += p.textContent || '';
        }
      });
    } else {
      plainText = temp.textContent || '';
    }
    return plainText;
  };

  // Handle input changes
  const handleInput = () => {
    if (editorRef.current) {
      const plainText = convertToPlainText(editorRef.current.innerHTML);
      onContentChange(plainText);
    }
  };


  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed && checkIfAtLineStart(range)) {
          event.preventDefault();
          mergeCurrentLineWithPrevious(range, handleInput);
        }
      }
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  useEffect(() => {
    if (editorRef.current) {
      const processedContent = processTextForVerticalDisplay(content);
      if (editorRef.current.innerHTML !== processedContent) {
        editorRef.current.innerHTML = processedContent;
      }
    }
  }, [content]);

  return (
    <div
      ref={editorRef}
      className="vertical-text-container"
      contentEditable={true}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      dangerouslySetInnerHTML={{ __html: processTextForVerticalDisplay(content) }}
    />
  );
};