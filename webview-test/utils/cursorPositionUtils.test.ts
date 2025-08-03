import { 
  checkIfAtLineStart, 
  findTextCursorPosition, 
  mergeCurrentLineWithPrevious,
  CursorPosition 
} from '../../webview-src/utils/cursorPositionUtils';

// Helper function to create mock Range
const createMockRange = (startContainer: Node, startOffset: number, collapsed: boolean = true): Range => {
  const range = {
    startContainer,
    startOffset,
    collapsed,
    setStart: jest.fn(),
    setEnd: jest.fn(),
    collapse: jest.fn()
  } as unknown as Range;
  return range;
};

describe('cursorPositionUtils', () => {
  let mockDocument: Document;
  let container: HTMLElement;

  beforeEach(() => {
    mockDocument = document;
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    jest.clearAllMocks();
  });

  describe('checkIfAtLineStart', () => {
    it('should return true when cursor is at start of text node in paragraph', () => {
      // Given
      const paragraph = document.createElement('div');
      paragraph.className = 'paragraph';
      const textNode = document.createTextNode('Hello World');
      paragraph.appendChild(textNode);
      container.appendChild(paragraph);

      const range = createMockRange(textNode, 0);

      // When
      const result = checkIfAtLineStart(range);

      // Then
      expect(result).toBe(true);
    });

    it('should return false when cursor is not at start of text node', () => {
      // Given
      const paragraph = document.createElement('div');
      paragraph.className = 'paragraph';
      const textNode = document.createTextNode('Hello World');
      paragraph.appendChild(textNode);
      container.appendChild(paragraph);

      const range = createMockRange(textNode, 5);

      // When
      const result = checkIfAtLineStart(range);

      // Then
      expect(result).toBe(false);
    });

    it('should return true when cursor is at start of paragraph element', () => {
      // Given
      const paragraph = document.createElement('div');
      paragraph.className = 'paragraph';
      const textNode = document.createTextNode('Hello');
      paragraph.appendChild(textNode);
      container.appendChild(paragraph);

      const range = createMockRange(paragraph, 0);

      // When
      const result = checkIfAtLineStart(range);

      // Then
      expect(result).toBe(true);
    });

    it('should return false when cursor is not in paragraph element', () => {
      // Given
      const div = document.createElement('div');
      div.className = 'not-paragraph';
      const textNode = document.createTextNode('Hello');
      div.appendChild(textNode);
      container.appendChild(div);

      const range = createMockRange(div, 0);

      // When
      const result = checkIfAtLineStart(range);

      // Then
      expect(result).toBe(false);
    });

    it('should return false when text node is not first child of paragraph', () => {
      // Given
      const paragraph = document.createElement('div');
      paragraph.className = 'paragraph';
      const span = document.createElement('span');
      const textNode = document.createTextNode('Hello');
      paragraph.appendChild(span);
      paragraph.appendChild(textNode);
      container.appendChild(paragraph);

      const range = createMockRange(textNode, 0);

      // When
      const result = checkIfAtLineStart(range);

      // Then
      expect(result).toBe(false);
    });
  });

  describe('findTextCursorPosition', () => {
    it('should find cursor position in single text node', () => {
      // Given
      const element = document.createElement('div');
      const textNode = document.createTextNode('Hello World');
      element.appendChild(textNode);
      container.appendChild(element);

      // When
      const result = findTextCursorPosition(element, 5);

      // Then
      expect(result.node).toBe(textNode);
      expect(result.offset).toBe(5);
    });

    it('should find cursor position across multiple text nodes', () => {
      // Given
      const element = document.createElement('div');
      const textNode1 = document.createTextNode('Hello ');
      const textNode2 = document.createTextNode('World');
      element.appendChild(textNode1);
      element.appendChild(textNode2);
      container.appendChild(element);

      // When
      const result = findTextCursorPosition(element, 8);

      // Then
      expect(result.node).toBe(textNode2);
      expect(result.offset).toBe(2);
    });

    it('should return end position when target length exceeds total text length', () => {
      // Given
      const element = document.createElement('div');
      const textNode = document.createTextNode('Hello');
      element.appendChild(textNode);
      container.appendChild(element);

      // When
      const result = findTextCursorPosition(element, 100);

      // Then
      expect(result.node).toBe(textNode);
      expect(result.offset).toBe(5);
    });

    it('should handle element with no text nodes', () => {
      // Given
      const element = document.createElement('div');
      const spanElement = document.createElement('span');
      element.appendChild(spanElement);
      container.appendChild(element);

      // When
      const result = findTextCursorPosition(element, 5);

      // Then
      expect(result.node).toBe(element);
      expect(result.offset).toBe(0);
    });

    it('should handle mixed content with elements and text nodes', () => {
      // Given
      const element = document.createElement('div');
      const textNode1 = document.createTextNode('Start ');
      const span = document.createElement('span');
      const spanText = document.createTextNode('middle ');
      const textNode2 = document.createTextNode('end');
      
      span.appendChild(spanText);
      element.appendChild(textNode1);
      element.appendChild(span);
      element.appendChild(textNode2);
      container.appendChild(element);

      // When
      const result = findTextCursorPosition(element, 10);

      // Then
      expect(result.node).toBe(spanText);
      expect(result.offset).toBe(4);
    });
  });

  describe('mergeCurrentLineWithPrevious', () => {
    let mockOnContentChange: jest.Mock;
    let mockSelection: any;

    beforeEach(() => {
      mockOnContentChange = jest.fn();
      
      // Mock window.getSelection
      mockSelection = {
        removeAllRanges: jest.fn(),
        addRange: jest.fn()
      };
      Object.defineProperty(window, 'getSelection', {
        value: jest.fn(() => mockSelection),
        writable: true
      });
    });

    it('should merge with empty previous paragraph', () => {
      // Given
      const previousParagraph = document.createElement('div');
      previousParagraph.className = 'paragraph';
      previousParagraph.innerHTML = '<br>';
      
      const currentParagraph = document.createElement('div');
      currentParagraph.className = 'paragraph';
      const textNode = document.createTextNode('Current text');
      currentParagraph.appendChild(textNode);
      
      container.appendChild(previousParagraph);
      container.appendChild(currentParagraph);

      const range = createMockRange(textNode, 0);

      // When
      mergeCurrentLineWithPrevious(range, mockOnContentChange);

      // Then
      expect(previousParagraph.innerHTML).toBe('Current text');
      expect(currentParagraph.parentNode).toBeNull();
      expect(mockOnContentChange).toHaveBeenCalled();
      expect(mockSelection.removeAllRanges).toHaveBeenCalled();
      expect(mockSelection.addRange).toHaveBeenCalled();
    });

    it('should merge with non-empty previous paragraph and position cursor correctly', () => {
      // Given
      const previousParagraph = document.createElement('div');
      previousParagraph.className = 'paragraph';
      const prevTextNode = document.createTextNode('Previous ');
      previousParagraph.appendChild(prevTextNode);
      
      const currentParagraph = document.createElement('div');
      currentParagraph.className = 'paragraph';
      const currTextNode = document.createTextNode('current');
      currentParagraph.appendChild(currTextNode);
      
      container.appendChild(previousParagraph);
      container.appendChild(currentParagraph);

      const range = createMockRange(currTextNode, 0);

      // When
      mergeCurrentLineWithPrevious(range, mockOnContentChange);

      // Then
      expect(previousParagraph.textContent).toBe('Previous current');
      expect(currentParagraph.parentNode).toBeNull();
      expect(mockOnContentChange).toHaveBeenCalled();
    });

    it('should handle different <br> tag variations in empty paragraph', () => {
      // Given - Test with <br/>
      const previousParagraph1 = document.createElement('div');
      previousParagraph1.className = 'paragraph';
      previousParagraph1.innerHTML = '<br/>';
      
      const currentParagraph1 = document.createElement('div');
      currentParagraph1.className = 'paragraph';
      const textNode1 = document.createTextNode('Text');
      currentParagraph1.appendChild(textNode1);
      
      container.appendChild(previousParagraph1);
      container.appendChild(currentParagraph1);

      const range1 = createMockRange(textNode1, 0);

      // When
      mergeCurrentLineWithPrevious(range1, mockOnContentChange);

      // Then
      expect(previousParagraph1.innerHTML).toBe('Text');
      expect(currentParagraph1.parentNode).toBeNull();
    });

    it('should not merge when no previous paragraph exists', () => {
      // Given
      const currentParagraph = document.createElement('div');
      currentParagraph.className = 'paragraph';
      const textNode = document.createTextNode('Only paragraph');
      currentParagraph.appendChild(textNode);
      
      container.appendChild(currentParagraph);

      const range = createMockRange(textNode, 0);

      // When
      mergeCurrentLineWithPrevious(range, mockOnContentChange);

      // Then
      expect(currentParagraph.parentNode).toBe(container);
      expect(mockOnContentChange).not.toHaveBeenCalled();
    });

    it('should handle range starting from element node', () => {
      // Given
      const previousParagraph = document.createElement('div');
      previousParagraph.className = 'paragraph';
      previousParagraph.innerHTML = '<br>';
      
      const currentParagraph = document.createElement('div');
      currentParagraph.className = 'paragraph';
      const textNode = document.createTextNode('Text');
      currentParagraph.appendChild(textNode);
      
      container.appendChild(previousParagraph);
      container.appendChild(currentParagraph);

      const range = createMockRange(currentParagraph, 0);

      // When
      mergeCurrentLineWithPrevious(range, mockOnContentChange);

      // Then
      expect(previousParagraph.innerHTML).toBe('Text');
      expect(currentParagraph.parentNode).toBeNull();
      expect(mockOnContentChange).toHaveBeenCalled();
    });
  });
});