import { Pressable, Text, View } from 'react-native';

import { NOTE_BG_CLASS, NOTE_COLORS, type NoteColor } from '@/lib/note-colors';

const NOTE_COLOR_LABEL: Record<NoteColor, string> = {
  yellow: '노랑',
  orange: '주황',
  green: '초록',
  blue: '파랑',
  pink: '분홍',
  purple: '보라',
};

/** 헤더에 들어가는 버튼. 지금 메모 색을 보여주고, 누르면 드롭다운을 연다. */
export function NoteColorButton({ color, onPress }: { color: NoteColor; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel="메모 색 변경">
      <View className={`h-6 w-6 rounded-full border border-black/30 ${NOTE_BG_CLASS[color]}`} />
    </Pressable>
  );
}

type MenuProps = {
  selected: NoteColor;
  onSelect: (color: NoteColor) => void;
  onClose: () => void;
};

/** 헤더 바로 아래 오른쪽에 펼쳐지는 드롭다운. 바깥을 누르면 닫힌다. */
export function NoteColorMenu({ selected, onSelect, onClose }: MenuProps) {
  return (
    <>
      <Pressable className="absolute inset-0" onPress={onClose} />
      <View className="absolute right-3 top-1 w-32 border border-black/10 bg-white shadow-lg">
        {NOTE_COLORS.map((color) => (
          <Pressable
            key={color}
            onPress={() => {
              onSelect(color);
              onClose();
            }}
            className="h-11 flex-row items-center gap-2.5 px-3 active:bg-black/5">
            <View className={`h-5 w-5 rounded-full border border-black/20 ${NOTE_BG_CLASS[color]}`} />
            <Text className="flex-1 text-[15px] text-neutral-800">{NOTE_COLOR_LABEL[color]}</Text>
            {color === selected && <Text className="text-[15px] text-neutral-800">✓</Text>}
          </Pressable>
        ))}
      </View>
    </>
  );
}
