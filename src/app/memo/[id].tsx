import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useHeaderHeight } from 'expo-router/react-navigation';
import { useRef, useState } from 'react';
import { Alert, KeyboardAvoidingView, Pressable, Text, View } from 'react-native';
import { EnrichedTextInput, type EnrichedTextInputInstance } from 'react-native-enriched-html';

import {
  BASE_FONT_SIZE,
  BASE_LINE_HEIGHT,
  BASE_TEXT_COLOR,
} from '@/components/rich-editor/editor-styles';
import { type CustomStyleState, RichTextToolbar } from '@/components/rich-editor/rich-text-toolbar';
import { useMemoStore } from '@/lib/memo-store';
import { NOTE_BG_CLASS, randomNoteColor } from '@/lib/note-colors';
import { htmlToPlainText } from '@/lib/rich-text';

export default function MemoEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const existing = useMemoStore((state) =>
    isNew ? undefined : state.memos.find((memo) => memo.id === id),
  );
  const addMemo = useMemoStore((state) => state.addMemo);
  const updateMemo = useMemoStore((state) => state.updateMemo);
  const deleteMemo = useMemoStore((state) => state.deleteMemo);
  // 에디터는 비제어(uncontrolled) 컴포넌트라 내용은 state 가 아니라 ref 로 꺼낸다.
  const editorRef = useRef<EnrichedTextInputInstance>(null);
  const headerHeight = useHeaderHeight();
  const [customStyle, setCustomStyle] = useState<CustomStyleState>();
  const [focused, setFocused] = useState(isNew);
  // 화면을 연 순간의 색으로 고정한다. 기존 메모는 저장된 색, 새 메모는 랜덤 색이고,
  // 새 메모는 저장할 때 이 색을 그대로 넘겨서 목록에서도 같은 색으로 보이게 한다.
  const [color] = useState(() => existing?.color ?? randomNoteColor());

  const save = async () => {
    const html = (await editorRef.current?.getHTML()) ?? '';
    // 글자가 하나도 없으면 저장하지 않는다 (서식만 남은 빈 줄 포함).
    if (htmlToPlainText(html)) {
      if (existing) updateMemo(existing.id, html);
      else addMemo(html, color);
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
      {/* 이 화면은 헤더 아래에서 시작하므로, 헤더 높이만큼 더 올려야 툴바가 키보드에 가리지 않는다. */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={headerHeight}>
        <EnrichedTextInput
          ref={editorRef}
          defaultValue={existing?.content}
          autoFocus={isNew}
          placeholder="메모를 입력하세요"
          placeholderTextColor="rgba(0, 0, 0, 0.35)"
          cursorColor={BASE_TEXT_COLOR}
          // 메모 앱에서는 목록/링크 자동 변환이 오히려 방해가 돼서 끈다.
          textShortcuts={[]}
          linkRegex={null}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChangeState={(e) => setCustomStyle(e.nativeEvent.customStyle)}
          style={{
            flex: 1,
            padding: 20,
            fontSize: BASE_FONT_SIZE,
            lineHeight: BASE_LINE_HEIGHT,
            color: BASE_TEXT_COLOR,
          }}
        />
        {focused && <RichTextToolbar editorRef={editorRef} current={customStyle} />}
      </KeyboardAvoidingView>
    </View>
  );
}
