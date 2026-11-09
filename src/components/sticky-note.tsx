import { Pressable, Text, View } from 'react-native';
import { EnrichedText } from 'react-native-enriched-html';

import { type Memo, useMemoStore } from '@/lib/memo-store';
import { NOTE_BG_CLASS } from '@/lib/note-colors';

/** 제목이 없을 때 보여줄 본문 최대 줄 수. 넘치면 … 으로 잘린다. */
export const PREVIEW_LINES = 5;

type Props = {
  memo: Memo;
  /** 한 변의 길이. 모든 포스트잇이 같은 크기로 보이도록 부모가 계산해서 넘긴다. */
  size: number;
  onPress: () => void;
  onLongPress?: () => void;
};

export function StickyNote({ memo, size, onPress, onLongPress }: Props) {
  const onWidget = useMemoStore((state) => state.widgetMemoIds.includes(memo.id));
  const date = new Date(memo.createdAt);

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className={`${NOTE_BG_CLASS[memo.color]} p-3.5 pt-5 shadow-md active:opacity-80`}
      style={{ width: size, height: size }}>
      {/* 테이프 */}
      <View className="absolute -top-2 h-4 w-14 self-center border border-black/10 bg-white/50" />
      {onWidget && <Text className="absolute right-1.5 top-1 text-[11px]">📌</Text>}
      {memo.title !== '' && (
        <Text
          className="mb-1 text-[15px] font-bold leading-[21px] text-neutral-800"
          numberOfLines={1}
          ellipsizeMode="tail">
          {memo.title}
        </Text>
      )}
      {/* 터치는 포스트잇(Pressable)이 받도록 미리보기는 터치를 통과시킨다. */}
      <View className="flex-1 overflow-hidden" pointerEvents="none">
        <EnrichedText
          // 포스트잇 크기는 고정이라, 제목이 있으면 그 한 줄만큼 본문을 줄인다.
          numberOfLines={memo.title !== '' ? PREVIEW_LINES - 1 : PREVIEW_LINES}
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
