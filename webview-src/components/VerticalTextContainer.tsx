///** @_jsx h */
/** @jsxImportSource preact */
//import { h } from 'preact';
import { useRef, useEffect, useCallback } from 'preact/hooks';
import { processTextForVerticalDisplay } from './processTextForVerticalDisplay';

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

  // Check if cursor is at the start of a line
  const isAtLineStart = (range: Range): boolean => {
    const container = range.startContainer;
    if (container.nodeType === Node.TEXT_NODE && range.startOffset === 0) {
      const paragraph = container.parentElement?.closest('.paragraph');
      if (paragraph && paragraph.firstChild === container) {
        return true;
      }
    }
    if (container.nodeType === Node.ELEMENT_NODE && range.startOffset === 0) {
      const element = container as Element;
      if (element.classList.contains('paragraph')) {
        return true;
      }
    }
    return false;
  };

  // Merge current line with previous line
  const mergeWithPreviousLine = (range: Range) => {
    const container = range.startContainer;
    const currentParagraph = container.nodeType === Node.TEXT_NODE 
      ? container.parentElement?.closest('.paragraph') as HTMLElement
      : (container as HTMLElement).closest('.paragraph') as HTMLElement;
    const previousParagraph = currentParagraph?.previousElementSibling as HTMLElement;
    if (previousParagraph && currentParagraph) {
      const isEmpty = previousParagraph.innerHTML.trim() === '<br>' || 
                     previousParagraph.innerHTML.trim() === '<br/>' || 
                     previousParagraph.innerHTML.trim() === '<br />';
      if (isEmpty) {
        previousParagraph.innerHTML = '';
        while (currentParagraph.firstChild) {
          previousParagraph.appendChild(currentParagraph.firstChild);
        }
        const newRange = document.createRange();
        if (previousParagraph.firstChild) {
          if (previousParagraph.firstChild.nodeType === Node.TEXT_NODE) {
            newRange.setStart(previousParagraph.firstChild, 0);
            newRange.setEnd(previousParagraph.firstChild, 0);
          } else {
            newRange.setStartBefore(previousParagraph.firstChild);
            newRange.setEndBefore(previousParagraph.firstChild);
          }
        } else {
          newRange.setStart(previousParagraph, 0);
          newRange.setEnd(previousParagraph, 0);
        }
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      } else {
        const originalTextLength = previousParagraph.textContent?.length || 0;
        while (currentParagraph.firstChild) {
          previousParagraph.appendChild(currentParagraph.firstChild);
        }
        const findCursorPosition = (element: HTMLElement, targetLength: number) => {
          const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null
          );
          let currentLength = 0;
          while (walker.nextNode()) {
            const textNode = walker.currentNode as Text;
            const nodeLength = textNode.textContent?.length || 0;
            if (currentLength + nodeLength >= targetLength) {
              const offsetInNode = targetLength - currentLength;
              return { node: textNode, offset: offsetInNode };
            }
            currentLength += nodeLength;
          }
          const textNodes = Array.from(element.childNodes).filter(
            node => node.nodeType === Node.TEXT_NODE
          );
          const lastTextNode = textNodes[textNodes.length - 1] as Text;
          if (lastTextNode) {
            return { 
              node: lastTextNode, 
              offset: lastTextNode.textContent?.length || 0 
            };
          }
          return { node: element, offset: 0 };
        };
        const cursorPos = findCursorPosition(previousParagraph, originalTextLength);
        const newRange = document.createRange();
        newRange.setStart(cursorPos.node, cursorPos.offset);
        newRange.setEnd(cursorPos.node, cursorPos.offset);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(newRange);
      }
      currentParagraph.remove();
      handleInput();
    }
  };

  // Handle keyboard events
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        if (range.collapsed && isAtLineStart(range)) {
          event.preventDefault();
          mergeWithPreviousLine(range);
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