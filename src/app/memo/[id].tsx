import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { addMemo, deleteMemo, getMemo, updateMemo } from '@/lib/memo-store';

export default function MemoEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const existing = isNew ? undefined : getMemo(id);
  const [content, setContent] = useState(existing?.content ?? '');

  const save = () => {
    const trimmed = content.trim();
    if (trimmed) {
      if (existing) updateMemo(existing.id, trimmed);
      else addMemo(trimmed);
    }
    router.back();
  };

  const remove = () => {
    if (!existing) return;
    Alert.alert('메모 삭제', '이 메모를 삭제할까요?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: () => {
          deleteMemo(existing.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: isNew ? '새 메모' : '메모',
          headerRight: () => (
            <View style={styles.headerActions}>
              {existing && (
                <Pressable onPress={remove} hitSlop={8}>
                  <Text style={[styles.headerButton, styles.delete]}>삭제</Text>
                </Pressable>
              )}
              <Pressable onPress={save} hitSlop={8}>
                <Text style={styles.headerButton}>저장</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <TextInput
        style={styles.input}
        value={content}
        onChangeText={setContent}
        placeholder="메모를 입력하세요"
        placeholderTextColor="rgba(0, 0, 0, 0.35)"
        multiline
        autoFocus={isNew}
        textAlignVertical="top"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF9C4',
  },
  input: {
    flex: 1,
    padding: 20,
    fontSize: 17,
    lineHeight: 26,
    color: '#333',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  headerButton: {
    fontSize: 17,
    fontWeight: '600',
    color: '#F57F17',
  },
  delete: {
    color: '#D32F2F',
  },
});
