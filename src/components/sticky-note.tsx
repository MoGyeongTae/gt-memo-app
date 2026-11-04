import { Pressable, Text, View } from 'react-native';

import type { Memo } from '@/lib/memo-store';

// Tailwind 가 클래스를 찾을 수 있도록 전체 클래스 이름을 그대로 적어둔다.
const NOTE_COLORS = [
  'bg-note-yellow',
  'bg-note-orange',
  'bg-note-green',
  'bg-note-blue',
  'bg-note-pink',
  'bg-note-purple',
];

/** 모든 메모 공통으로 보여줄 최대 줄 수. 넘치면 … 으로 잘린다. */
export const PREVIEW_LINES = 5;

type Props = {
  memo: Memo;
  index: number;
  /** 한 변의 길이. 모든 포스트잇이 같은 크기로 보이도록 부모가 계산해서 넘긴다. */
  size: number;
  onPress: () => void;
};

export function StickyNote({ memo, index, size, onPress }: Props) {
  const color = NOTE_COLORS[index % NOTE_COLORS.length];
  const date = new Date(memo.createdAt);

  return (
    <Pressable
      onPress={onPress}
      className={`${color} p-3.5 pt-5 shadow-md active:opacity-80`}
      style={{ width: size, height: size }}>
      {/* 테이프 */}
      <View className="absolute -top-2 h-4 w-14 self-center border border-black/10 bg-white/50" />
      <Text
        className="flex-1 text-[15px] leading-[21px] text-neutral-800"
        numberOfLines={PREVIEW_LINES}
        ellipsizeMode="tail">
        {memo.content}
      </Text>
      <Text className="self-end text-xs text-black/40">
        {date.getMonth() + 1}.{date.getDate()}
      </Text>
    </Pressable>
  );
}
