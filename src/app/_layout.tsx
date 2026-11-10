import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import '@/global.css';
import { startWidgetSync } from '@/lib/widget-sync';

import { AnimatedSplashOverlay } from '@/components/splash-overlay';

// 위젯에서 메모를 바로 열어도 그 아래에 메인 화면이 있어서 뒤로 갈 수 있게 한다.
export const unstable_settings = { anchor: 'index' };

SplashScreen.preventAutoHideAsync();

// 저장소가 바뀌면 위젯도 함께 갱신되도록 앱 시작 시 한 번만 연결한다.
startWidgetSync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <AnimatedSplashOverlay />
      <Stack>
        <Stack.Screen name="index" options={{ title: '메모' }} />
        <Stack.Screen name="month/[key]" options={{ title: '' }} />
        <Stack.Screen name="memo/[id]" options={{ title: '' }} />
      </Stack>
    </ThemeProvider>
  );
}
