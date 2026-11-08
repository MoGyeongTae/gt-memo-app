/** 메모 본문 기본 글자 크기 / 줄 간격. 에디터와 포스트잇 미리보기가 같은 값을 쓴다. */
export const BASE_FONT_SIZE = 17;
export const BASE_LINE_HEIGHT = 26;
export const BASE_TEXT_COLOR = '#262626';

/** 글자색 */
export const TEXT_COLORS = ['#262626', '#D32F2F', '#F57C00', '#388E3C', '#1976D2', '#7B1FA2'];

/** 글자 배경색(형광펜). 포스트잇 위에서도 보이도록 진한 편으로 골랐다. */
export const HIGHLIGHT_COLORS = ['#FFEB3B', '#FF8A65', '#81C784', '#64B5F6', '#F06292', '#BA68C8'];

/** 글자 크기 단계. 나중에 단계나 값을 바꿔도 이미 저장된 메모는 저장된 크기 그대로 보인다. */
export const FONT_SIZES = [
  { label: '작게', value: 14 },
  { label: '보통', value: BASE_FONT_SIZE },
  { label: '크게', value: 22 },
  { label: '아주 크게', value: 28 },
];
