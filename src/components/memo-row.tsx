import { router } from 'expo-router';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { StickyNote } from '@/components/sticky-note';
import { Spacing } from '@/constants/theme';
import type { Memo } from '@/lib/memo-store';

export const MEMO_COLUMNS = 2;

export function openMemo(id: string) {
  router.push({ pathname: '/memo/[id]', params: { id } });
}

type Props = {
  row: Memo[];
  rowIndex: number;
};

/** 포스트잇 한 줄. 줄에 몇 개가 있든 포스트잇 크기는 항상 화면 너비 기준으로 같다. */
export function MemoRow({ row, rowIndex }: Props) {
  const { width } = useWindowDimensions();
  const size = (width - ROW_PADDING * 2 - NOTE_GAP * (MEMO_COLUMNS - 1)) / MEMO_COLUMNS;

  return (
    <View style={styles.row}>
      {row.map((memo, col) => (
        <StickyNote
          key={memo.id}
          memo={memo}
          index={rowIndex * MEMO_COLUMNS + col}
          size={size}
          onPress={() => openMemo(memo.id)}
        />
      ))}
    </View>
  );
}

const ROW_PADDING = Spacing.four;
const NOTE_GAP = Spacing.three;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: ROW_PADDING,
    gap: NOTE_GAP,
    marginBottom: Spacing.four,
  },
});
