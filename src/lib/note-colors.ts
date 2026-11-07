/** 포스트잇 색. 메모마다 하나씩 저장된다. */
export const NOTE_COLORS = ['yellow', 'orange', 'green', 'blue', 'pink', 'purple'] as const;

export type NoteColor = (typeof NOTE_COLORS)[number];

// Tailwind 가 클래스를 찾을 수 있도록 전체 클래스 이름을 그대로 적어둔다.
// (`bg-note-${color}` 처럼 조합하면 Tailwind 가 찾지 못해 스타일이 빠진다)
export const NOTE_BG_CLASS: Record<NoteColor, string> = {
  yellow: 'bg-note-yellow',
  orange: 'bg-note-orange',
  green: 'bg-note-green',
  blue: 'bg-note-blue',
  pink: 'bg-note-pink',
  purple: 'bg-note-purple',
};

export function randomNoteColor(): NoteColor {
  return NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)];
}

/** 저장된 값이 올바른 색이 아니면(예전 데이터 등) 랜덤 색으로 바꾼다. */
export function toNoteColor(value: unknown): NoteColor {
  return NOTE_COLORS.includes(value as NoteColor) ? (value as NoteColor) : randomNoteColor();
}
