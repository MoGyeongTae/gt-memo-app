import { router } from 'expo-router';
import { Pressable, SectionList, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AddButton } from '@/components/add-button';
import { MEMO_COLUMNS, MemoRow, openMemo } from '@/components/memo-row';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { groupByMonth, useMemos } from '@/lib/memo-store';

/** 메인 화면에서 년/월 분류마다 보여줄 최대 메모 수 */
const PREVIEW_PER_MONTH = 6;

export default function MemoListScreen() {
  const memos = useMemos();
  const insets = useSafeAreaInsets();
  const sections = groupByMonth(memos, MEMO_COLUMNS, PREVIEW_PER_MONTH);

  if (memos.length === 0) {
    return (
      <ThemedView style={styles.empty}>
        <AddButton size={72} onPress={() => openMemo('new')} />
        <ThemedText themeColor="textSecondary">첫 메모를 추가해보세요</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(row) => row.map((memo) => memo.id).join('|')}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        stickySectionHeadersEnabled={false}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <ThemedText type="smallBold" style={styles.sectionTitle}>
              {section.title}
            </ThemedText>
            {section.total > PREVIEW_PER_MONTH && (
              <Pressable
                hitSlop={8}
                onPress={() => router.push({ pathname: '/month/[key]', params: { key: section.key } })}>
                <ThemedText type="small" themeColor="textSecondary">
                  전체보기 ({section.total}) ›
                </ThemedText>
              </Pressable>
            )}
          </View>
        )}
        renderItem={({ item: row, index }) => <MemoRow row={row} rowIndex={index} />}
      />
      <View style={[styles.fab, { bottom: insets.bottom + Spacing.four }]}>
        <AddButton onPress={() => openMemo('new')} />
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 18,
  },
  fab: {
    position: 'absolute',
    right: Spacing.four,
  },
});
