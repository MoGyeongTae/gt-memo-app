import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, Text, TextInput, View } from 'react-native';

import { useMemoStore } from '@/lib/memo-store';
import { NOTE_BG_CLASS, randomNoteColor } from '@/lib/note-colors';

export default function MemoEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const existing = useMemoStore((state) =>
    isNew ? undefined : state.memos.find((memo) => memo.id === id),
  );
  const addMemo = useMemoStore((state) => state.addMemo);
  const updateMemo = useMemoStore((state) => state.updateMemo);
  const deleteMemo = useMemoStore((state) => state.deleteMemo);
  const [content, setContent] = useState(existing?.content ?? '');
  // 화면을 연 순간의 색으로 고정한다. 기존 메모는 저장된 색, 새 메모는 랜덤 색이고,
  // 새 메모는 저장할 때 이 색을 그대로 넘겨서 목록에서도 같은 색으로 보이게 한다.
  const [color] = useState(() => existing?.color ?? randomNoteColor());

  const save = () => {
    const trimmed = content.trim();
    if (trimmed) {
      if (existing) updateMemo(existing.id, trimmed);
      else addMemo(trimmed, color);
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
    <View className={`flex-1 ${NOTE_BG_CLASS[color]}`}>
      <Stack.Screen
        options={{
          title: isNew ? '새 메모' : '메모',
          headerRight: () => (
            <View className="flex-row gap-4">
              {existing && (
                <Pressable onPress={remove} hitSlop={8}>
                  <Text className="text-[17px] font-semibold text-red-700">삭제</Text>
                </Pressable>
              )}
              <Pressable onPress={save} hitSlop={8}>
                <Text className="text-[17px] font-semibold text-accent-dark">저장</Text>
              </Pressable>
            </View>
          ),
        }}
      />
      <TextInput
        className="flex-1 p-5 text-[17px] leading-[26px] text-neutral-800"
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
