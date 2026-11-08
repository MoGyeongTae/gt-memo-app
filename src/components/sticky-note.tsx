import { Pressable, Text, View } from 'react-native';
import { EnrichedText } from 'react-native-enriched-html';

import type { Memo } from '@/lib/memo-store';
import { NOTE_BG_CLASS } from '@/lib/note-colors';

/** 모든 메모 공통으로 보여줄 최대 줄 수. 넘치면 … 으로 잘린다. */
export const PREVIEW_LINES = 5;

type Props = {
  memo: Memo;
  /** 한 변의 길이. 모든 포스트잇이 같은 크기로 보이도록 부모가 계산해서 넘긴다. */
  size: number;
  onPress: () => void;
};

export function StickyNote({ memo, size, onPress }: Props) {
  const date = new Date(memo.createdAt);

  return (
    <Pressable
      onPress={onPress}
      className={`${NOTE_BG_CLASS[memo.color]} p-3.5 pt-5 shadow-md active:opacity-80`}
      style={{ width: size, height: size }}>
      {/* 테이프 */}
      <View className="absolute -top-2 h-4 w-14 self-center border border-black/10 bg-white/50" />
      {/* 터치는 포스트잇(Pressable)이 받도록 미리보기는 터치를 통과시킨다. */}
      <View className="flex-1" pointerEvents="none">
        <EnrichedText
          numberOfLines={PREVIEW_LINES}
          ellipsizeMode="tail"
          style={{ fontSize: 15, lineHeight: 21, color: '#262626' }}>
          {memo.content}
        </EnrichedText>
      </View>
      <Text className="self-end text-xs text-black/40">
        {date.getMonth() + 1}.{date.getDate()}
      </Text>
    </Pressable>
  );
}
