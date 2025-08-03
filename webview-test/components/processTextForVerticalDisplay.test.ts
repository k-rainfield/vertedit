import { processTextForVerticalDisplay } from '../../webview-src/components/processTextForVerticalDisplay';

describe('Tate-chu-yoko conversion', () => {
  describe('Given: text with 2-3 digit numbers', () => {
    describe('When: processTextForVerticalDisplay is called', () => {
      test('Then: 2-digit numbers are wrapped in tate-chu-yoko span', () => {
        // Given
        const givenText = '彼の生まれは平成14年です';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).toContain('<span class="tate-chu-yoko">14</span>');
        expect(result).toContain('彼の生まれは平成');
        expect(result).toContain('年です');
      });

      test('Then: 3-digit numbers are wrapped in tate-chu-yoko span', () => {
        // Given
        const givenText = '西暦600年の出来事';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).toContain('<span class="tate-chu-yoko">600</span>');
        expect(result).toContain('西暦');
        expect(result).toContain('の出来事');
      });

      test('Then: 2-digit numbers at start of sentence are wrapped in tate-chu-yoko span', () => {
        // Given
        const givenText = '型式Ｘ50';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).toContain('<span class="tate-chu-yoko">50</span>');
        expect(result).toContain('型式Ｘ');
      });

      test('Then: 2-digit numbers at end of sentence are wrapped in tate-chu-yoko span', () => {
        // Given
        const givenText = '10番目の問題';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).toContain('<span class="tate-chu-yoko">10</span>');
        expect(result).toContain('番目の問題');
      });
    });
  });

  describe('Given: text with 1-digit numbers', () => {
    describe('When: processTextForVerticalDisplay is called', () => {
      test('Then: 1-digit numbers are not wrapped in tate-chu-yoko span', () => {
        // Given
        const givenText = '私は5歳です';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).not.toContain('<span class="tate-chu-yoko">');
        expect(result).toContain('私は5歳です');
      });
    });
  });

  describe('Given: text with 4-digit numbers', () => {
    describe('When: processTextForVerticalDisplay is called', () => {
      test('Then: 4-digit numbers are not wrapped in tate-chu-yoko span', () => {
        // Given
        const givenText = '西暦1234年';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).not.toContain('<span class="tate-chu-yoko">1234</span>');
        expect(result).toContain('西暦1234年');
      });
    });
  });

  describe('Given: multi-line text', () => {
    describe('When: processTextForVerticalDisplay is called', () => {
      test('Then: each line is wrapped in a paragraph div', () => {
        // Given
        const givenText = '第1行目\n第2行目\n第3行目';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        const paragraphMatches = result.match(/<div class="paragraph">/g);
        expect(paragraphMatches).toHaveLength(3);
        expect(result).toContain('第1行目');
        expect(result).toContain('第2行目');
        expect(result).toContain('第3行目');
      });
    });
  });

  describe('Given: text with empty lines', () => {
    describe('When: processTextForVerticalDisplay is called', () => {
      test('Then: empty lines are represented by br tag', () => {
        // Given
        const givenText = '第1行目\n\n第3行目';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).toContain('<div class="paragraph"><br></div>');
        const paragraphMatches = result.match(/<div class="paragraph">/g);
        expect(paragraphMatches).toHaveLength(3);
      });
    });
  });

  describe('Given: text with space-only lines', () => {
    describe('When: processTextForVerticalDisplay is called', () => {
      test('Then: space-only lines preserve their spaces', () => {
        // Given
        const givenText = '第1行目\n \n第3行目';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).toContain('<div class="paragraph"> </div>');
        expect(result).not.toContain('<div class="paragraph"><br></div>');
        const paragraphMatches = result.match(/<div class="paragraph">/g);
        expect(paragraphMatches).toHaveLength(3);
      });

      test('Then: multiple space lines preserve their spaces', () => {
        // Given
        const givenText = '第1行目\n  \n第3行目';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).toContain('<div class="paragraph">  </div>');
        expect(result).not.toContain('<div class="paragraph"><br></div>');
      });

      test('Then: full-width space lines preserve their spaces', () => {
        // Given
        const givenText = '第1行目\n　\n第3行目';
        // When
        const result = processTextForVerticalDisplay(givenText);
        // Then
        expect(result).toContain('<div class="paragraph">　</div>');
        expect(result).not.toContain('<div class="paragraph"><br></div>');
      });
    });
  });
});