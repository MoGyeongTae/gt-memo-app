/**
 * 메모 본문은 리치 에디터(react-native-enriched-html)가 만드는 HTML 로 저장한다.
 * 형식: `<html>\n<p>첫 줄</p>\n<p>둘째 줄</p>\n</html>`
 */

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&apos;': "'",
  '&nbsp;': ' ',
};

/** 에디터는 한글을 `&#50696;` 같은 숫자 표기로 저장하므로 이름 표기와 함께 글자로 되돌린다. */
function decodeEntity(entity: string) {
  if (entity[1] !== '#') return ENTITIES[entity];
  const isHex = entity[2] === 'x' || entity[2] === 'X';
  const code = isHex ? parseInt(entity.slice(3, -1), 16) : parseInt(entity.slice(2, -1), 10);
  return code <= 0x10ffff ? String.fromCodePoint(code) : entity;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function isRichHtml(value: string) {
  return value.startsWith('<html>') && value.endsWith('</html>');
}

/** 예전 일반 텍스트 메모를 에디터 HTML 로 바꾼다. 줄마다 <p> 하나. */
export function plainTextToHtml(text: string) {
  const paragraphs = text.split('\n').map((line) => `<p>${escapeHtml(line)}</p>`);
  return `<html>\n${paragraphs.join('\n')}\n</html>`;
}

/** HTML 에서 글자만 뽑는다. 빈 메모 판단, 위젯 등 서식이 필요 없는 곳에서 쓴다. */
export function htmlToPlainText(html: string) {
  if (!isRichHtml(html)) return html;
  return html
    // 태그 사이의 줄바꿈은 HTML 소스 정렬용이라 본문에 넣지 않는다.
    .replace(/>\s*\n\s*</g, '><')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|h[1-6]|li|blockquote|codeblock)>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#[xX][0-9a-fA-F]+);/g, decodeEntity)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
