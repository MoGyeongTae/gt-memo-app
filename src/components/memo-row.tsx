import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

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

/** 포스트잇 한 줄. 마지막 줄이 덜 차면 빈 칸으로 너비를 맞춘다. */
export function MemoRow({ row, rowIndex }: Props) {
  return (
    <View style={styles.row}>
      {row.map((memo, col) => (
        <StickyNote
          key={memo.id}
          memo={memo}
          index={rowIndex * MEMO_COLUMNS + col}
          onPress={() => openMemo(memo.id)}
        />
      ))}
      {Array.from({ length: MEMO_COLUMNS - row.length }, (_, i) => (
        <View key={`spacer-${i}`} style={styles.spacer} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  spacer: {
    flex: 1,
  },
});
