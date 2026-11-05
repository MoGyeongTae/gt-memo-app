import { Stack, useLocalSearchParams } from 'expo-router';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MEMO_COLUMNS, MemoRow } from '@/components/memo-row';
import { chunk, monthKey, monthTitle, useMemoStore } from '@/lib/memo-store';

/** 한 달의 메모 전체를 보여주는 화면 */
export default function MonthScreen() {
  const { key } = useLocalSearchParams<{ key: string }>();
  const memos = useMemoStore((state) => state.memos);
  const insets = useSafeAreaInsets();

  const rows = chunk(
    memos.filter((memo) => monthKey(memo) === key).sort((a, b) => b.createdAt - a.createdAt),
    MEMO_COLUMNS,
  );

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ title: monthTitle(key) }} />
      <FlatList
        data={rows}
        keyExtractor={(row) => row.map((memo) => memo.id).join('|')}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: insets.bottom + 24 }}
        renderItem={({ item, index }) => <MemoRow row={item} rowIndex={index} />}
      />
    </View>
  );
}
