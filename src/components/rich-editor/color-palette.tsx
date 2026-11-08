import { Pressable, ScrollView, Text, View } from 'react-native';

type Props = {
  colors: string[];
  /** 지금 선택 영역에 적용된 색 (없으면 빈 문자열) */
  selected: string;
  onSelect: (color: string) => void;
  /** 색을 지우는 버튼 */
  onClear: () => void;
};

export function ColorPalette({ colors, selected, onSelect, onClear }: Props) {
  return (
    <ScrollView
      horizontal
      keyboardShouldPersistTaps="always"
      showsHorizontalScrollIndicator={false}
      contentContainerClassName="items-center gap-3 px-4 py-2.5">
      <Pressable
        onPress={onClear}
        hitSlop={4}
        className="h-8 w-8 items-center justify-center rounded-full border border-black/20 bg-white">
        <Text className="text-base text-black/50">✕</Text>
      </Pressable>
      {colors.map((color) => {
        const active = selected.toLowerCase() === color.toLowerCase();
        return (
          <Pressable key={color} onPress={() => onSelect(color)} hitSlop={4}>
            <View
              className={`h-8 w-8 rounded-full ${active ? 'border-[3px] border-neutral-800' : 'border border-black/10'}`}
              style={{ backgroundColor: color }}
            />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
