import { Pressable, Text } from 'react-native';

type Props = {
  onPress: () => void;
  size?: number;
};

export function AddButton({ onPress, size = 60 }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="메모 추가"
      onPress={onPress}
      className="items-center justify-center rounded-full bg-accent shadow-lg active:opacity-80"
      style={{ width: size, height: size }}>
      <Text
        className="font-semibold text-white"
        style={{ fontSize: size * 0.55, lineHeight: size * 0.65 }}>
        +
      </Text>
    </Pressable>
  );
}
