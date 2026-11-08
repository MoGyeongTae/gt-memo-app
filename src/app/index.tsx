import { router } from 'expo-router';
import { Pressable, SectionList, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddButton } from '@/components/add-button';
import { MEMO_COLUMNS, MemoRow, openMemo } from '@/components/memo-row';
import { groupByMonth, useMemoStore } from '@/lib/memo-store';

/** 메인 화면에서 년/월 분류마다 보여줄 최대 메모 수 */
const PREVIEW_PER_MONTH = 6;

export default function MemoListScreen() {
  const memos = useMemoStore((state) => state.memos);
  const insets = useSafeAreaInsets();
  const sections = groupByMonth(memos, MEMO_COLUMNS, PREVIEW_PER_MONTH);

  if (memos.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-white dark:bg-black">
        <AddButton size={64} onPress={() => openMemo('new')} />
        <Text className="w-full text-center text-base font-medium text-neutral-500 dark:text-neutral-400">
          첫 메모를 추가해보세요
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <SectionList
        sections={sections}
        keyExtractor={(row) => row.map((memo) => memo.id).join('|')}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View className="flex-row items-center justify-between px-6 pb-4 pt-6">
            <Text className="text-lg font-bold text-black dark:text-white">{section.title}</Text>
            {section.total > PREVIEW_PER_MONTH && (
              <Pressable
                hitSlop={8}
                onPress={() => router.push({ pathname: '/month/[key]', params: { key: section.key } })}>
                <Text className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  전체보기 ({section.total}) ›
                </Text>
              </Pressable>
            )}
          </View>
        )}
        renderItem={({ item: row }) => <MemoRow row={row} />}
      />
      <View className="absolute right-6" style={{ bottom: insets.bottom + 24 }}>
        <AddButton onPress={() => openMemo('new')} />
      </View>
    </View>
  );
}
