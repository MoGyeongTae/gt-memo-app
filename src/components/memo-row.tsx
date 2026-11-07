import { router } from 'expo-router';
import { useWindowDimensions, View } from 'react-native';

import { StickyNote } from '@/components/sticky-note';
import type { Memo } from '@/lib/memo-store';

export const MEMO_COLUMNS = 2;

// 아래 className 의 px-6(24) / gap-4(16) 과 같은 값이어야 한다.
const ROW_PADDING = 24;
const NOTE_GAP = 16;

export function openMemo(id: string) {
  router.push({ pathname: '/memo/[id]', params: { id } });
}

type Props = {
  row: Memo[];
};

/** 포스트잇 한 줄. 줄에 몇 개가 있든 포스트잇 크기는 항상 화면 너비 기준으로 같다. */
export function MemoRow({ row }: Props) {
  const { width } = useWindowDimensions();
  const size = (width - ROW_PADDING * 2 - NOTE_GAP * (MEMO_COLUMNS - 1)) / MEMO_COLUMNS;

  return (
    <View className="mb-6 flex-row gap-4 px-6">
      {row.map((memo) => (
        <StickyNote
          key={memo.id}
          memo={memo}
          size={size}
          onPress={() => openMemo(memo.id)}
        />
      ))}
    </View>
  );
}
