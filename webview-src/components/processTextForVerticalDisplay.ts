// 縦中横で囲むべきか判定
function shouldWrapTateChuYoko(str: string, offset: number, match: string): boolean {
  const prevChar = str[offset - 1] || '';
  const nextChar = str[offset + match.length] || '';
  // 前後が数字なら4桁以上の一部なので囲まない
  return !/\d/.test(prevChar) && !/\d/.test(nextChar);
}

// 縦中横処理ユーティリティ
export const processTextForVerticalDisplay = (text: string): string => {
  const replaced = text.replace(/\d{2,3}/g, (match: string, offset: number, str: string) => {
    if (shouldWrapTateChuYoko(str, offset, match)) {
      return `<span class="tate-chu-yoko">${match}</span>`;
    }
    return match;
  });

  return replaced
    .split('\n')
    .map(line => line.trim() === '' ? '<div class="paragraph"><br></div>' : `<div class="paragraph">${line}</div>`)
    .join('');
};
