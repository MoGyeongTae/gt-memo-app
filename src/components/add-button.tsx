import { Pressable, StyleSheet, Text } from 'react-native';

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
      style={({ pressed }) => [
        styles.button,
        { width: size, height: size, borderRadius: size / 2, opacity: pressed ? 0.8 : 1 },
      ]}>
      <Text style={[styles.plus, { fontSize: size * 0.55, lineHeight: size * 0.65 }]}>+</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#F9A825',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
  },
  plus: {
    color: '#fff',
    fontWeight: '600',
  },
});
