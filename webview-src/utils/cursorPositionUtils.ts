export interface CursorPosition {
  node: Node;
  offset: number;
}

export interface LinePosition {
  isAtStart: boolean;
  element: HTMLElement | null;
}

export const checkIfAtLineStart = (range: Range): boolean => {
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

export const findTextCursorPosition = (element: HTMLElement, targetLength: number): CursorPosition => {
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

export const mergeCurrentLineWithPrevious = (
  range: Range, 
  onContentChange: () => void
): void => {
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
      const cursorPos = findTextCursorPosition(previousParagraph, originalTextLength);
      const newRange = document.createRange();
      newRange.setStart(cursorPos.node, cursorPos.offset);
      newRange.setEnd(cursorPos.node, cursorPos.offset);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(newRange);
    }
    currentParagraph.remove();
    onContentChange();
  }
};