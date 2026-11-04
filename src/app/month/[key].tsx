import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MEMO_COLUMNS, MemoRow } from '@/components/memo-row';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { chunk, monthKey, monthTitle, useMemos } from '@/lib/memo-store';

/** 한 달의 메모 전체를 보여주는 화면 */
export default function MonthScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const memos = useMemos();
  const insets = useSafeAreaInsets();

  const rows = chunk(
    memos.filter((memo) => monthKey(memo) === key).sort((a, b) => b.createdAt - a.createdAt),
    MEMO_COLUMNS,
  );

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ title: monthTitle(key) }} />
      <FlatList
        data={rows}
        keyExtractor={(row) => row.map((memo) => memo.id).join('|')}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: Spacing.four, paddingBottom: insets.bottom + Spacing.four }}
        renderItem={({ item, index }) => <MemoRow row={item} rowIndex={index} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
