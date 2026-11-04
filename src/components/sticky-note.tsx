import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Memo } from '@/lib/memo-store';

const NOTE_COLORS = ['#FFF59D', '#FFCC80', '#A5D6A7', '#90CAF9', '#F48FB1', '#CE93D8'];

/** 모든 메모 공통으로 보여줄 최대 줄 수. 넘치면 … 으로 잘린다. */
export const PREVIEW_LINES = 5;

type Props = {
  memo: Memo;
  index: number;
  onPress: () => void;
};

export function StickyNote({ memo, index, onPress }: Props) {
  const color = NOTE_COLORS[index % NOTE_COLORS.length];
  const date = new Date(memo.createdAt);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.note,
        { backgroundColor: color, transform: [{ scale: pressed ? 0.97 : 1 }] },
      ]}>
      <View style={styles.tape} />
      <Text style={styles.content} numberOfLines={PREVIEW_LINES} ellipsizeMode="tail">
        {memo.content}
      </Text>
      <Text style={styles.date}>
        {date.getMonth() + 1}.{date.getDate()}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  note: {
    flex: 1,
    aspectRatio: 1,
    padding: 14,
    paddingTop: 20,
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.18)',
  },
  tape: {
    position: 'absolute',
    top: -8,
    alignSelf: 'center',
    width: 54,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.08)',
  },
  content: {
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    color: '#333',
  },
  date: {
    alignSelf: 'flex-end',
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.45)',
  },
});
