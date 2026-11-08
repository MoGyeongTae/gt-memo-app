import { type RefObject, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import type { EnrichedTextInputInstance, OnChangeStateEvent } from 'react-native-enriched-html';

import { ColorPalette } from '@/components/rich-editor/color-palette';
import {
  BASE_FONT_SIZE,
  FONT_SIZES,
  HIGHLIGHT_COLORS,
  TEXT_COLORS,
} from '@/components/rich-editor/editor-styles';

export type CustomStyleState = OnChangeStateEvent['customStyle'];

type Panel = 'color' | 'size' | 'highlight' | null;

type Props = {
  editorRef: RefObject<EnrichedTextInputInstance | null>;
  /** 커서/선택 영역에 지금 적용된 스타일. 에디터의 onChangeState 로 받는다. */
  current: CustomStyleState | undefined;
};

/**
 * 리치 에디터 툴바. 에디터와 분리된 컴포넌트라 화면 어디에든 붙일 수 있다.
 * 선택한 글자에 적용하고, 선택이 없으면 이어서 입력할 글자에 적용된다.
 */
export function RichTextToolbar({ editorRef, current }: Props) {
  const [panel, setPanel] = useState<Panel>(null);
  const editor = () => editorRef.current;

  const textColor = current?.foregroundColor ?? '';
  const highlight = current?.backgroundColor ?? '';
  const fontSize = current?.fontSize || BASE_FONT_SIZE;

  const toggle = (next: Panel) => setPanel((open) => (open === next ? null : next));

  return (
    <View className="border-t border-black/10 bg-white/90">
      {panel === 'color' && (
        <ColorPalette
          colors={TEXT_COLORS}
          selected={textColor}
          onSelect={(color) => editor()?.setStyle({ foregroundColor: color })}
          onClear={() => editor()?.setStyle({ foregroundColor: null })}
        />
      )}
      {panel === 'highlight' && (
        <ColorPalette
          colors={HIGHLIGHT_COLORS}
          selected={highlight}
          onSelect={(color) => editor()?.setStyle({ backgroundColor: color })}
          onClear={() => editor()?.setStyle({ backgroundColor: null })}
        />
      )}
      {panel === 'size' && (
        <ScrollView
          horizontal
          keyboardShouldPersistTaps="always"
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="items-center gap-2 px-4 py-2.5">
          {FONT_SIZES.map((size) => {
            const active = size.value === fontSize;
            return (
              <Pressable
                key={size.value}
                onPress={() =>
                  // 기본 크기는 스타일을 지워서 저장되는 HTML 을 가볍게 유지한다.
                  editor()?.setStyle({ fontSize: size.value === BASE_FONT_SIZE ? null : size.value })
                }
                className={`rounded-full px-3.5 py-1.5 ${active ? 'bg-neutral-800' : 'bg-black/5'}`}>
                <Text className={`text-sm font-medium ${active ? 'text-white' : 'text-neutral-800'}`}>
                  {size.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <View className="flex-row items-center justify-around py-1.5">
        <ToolButton active={panel === 'color'} onPress={() => toggle('color')}>
          <Text className="text-lg font-bold text-neutral-800">A</Text>
          <View className="h-1 w-5" style={{ backgroundColor: textColor || '#262626' }} />
        </ToolButton>
        <ToolButton active={panel === 'size'} onPress={() => toggle('size')}>
          <Text className="font-bold text-neutral-800">
            <Text className="text-xs">가</Text>
            <Text className="text-lg">가</Text>
          </Text>
        </ToolButton>
        <ToolButton active={panel === 'highlight'} onPress={() => toggle('highlight')}>
          <Text
            className="px-1 text-lg font-bold text-neutral-800"
            style={{ backgroundColor: highlight || HIGHLIGHT_COLORS[0] }}>
            A
          </Text>
        </ToolButton>
        <ToolButton
          onPress={() =>
            editor()?.setStyle({ foregroundColor: null, backgroundColor: null, fontSize: null })
          }>
          <Text className="text-sm font-medium text-neutral-600">서식 지우기</Text>
        </ToolButton>
      </View>
    </View>
  );
}

function ToolButton({
  active = false,
  onPress,
  children,
}: {
  active?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={4}
      className={`h-11 min-w-11 items-center justify-center rounded-lg px-2 active:bg-black/10 ${active ? 'bg-black/10' : ''}`}>
      {children}
    </Pressable>
  );
}
