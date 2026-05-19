import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import 'react-native-reanimated';
import Toast, { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import { StatusBar } from 'expo-status-bar';
import { CheckCircle2, AlertCircle, Info, ShieldAlert } from 'lucide-react-native';
import * as Notifications from 'expo-notifications';

import { useColorScheme } from '@/components/useColorScheme';
import { ProfileProvider } from '../src/context/ProfileContext';
import { registerBackgroundTasks } from '../src/services/backgroundTasks';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// 1. Configuración de Toasts Personalizados "PRO"
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: '#2A7D6F', 
        backgroundColor: '#FFFFFF',
        height: 70,
        borderRadius: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
        borderLeftWidth: 6,
        width: '90%',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: '900',
        color: '#1A2332',
        textTransform: 'uppercase',
        letterSpacing: 1
      }}
      text2Style={{
        fontSize: 12,
        color: '#5A6B7E',
        fontWeight: '500'
      }}
      renderLeadingIcon={() => (
        <View className="justify-center pl-4">
          <CheckCircle2 size={24} color="#2A7D6F" />
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#E8820C', 
        backgroundColor: '#FFFFFF',
        height: 70,
        borderRadius: 20,
        borderLeftWidth: 6,
        width: '90%',
      }}
      text1Style={{ fontSize: 14, fontWeight: '900', color: '#1A2332' }}
      text2Style={{ fontSize: 12, color: '#5A6B7E' }}
      renderLeadingIcon={() => (
        <View className="justify-center pl-4">
          <ShieldAlert size={24} color="#E8820C" />
        </View>
      )}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={{ 
        borderLeftColor: '#1B4F9B', 
        backgroundColor: '#FFFFFF',
        height: 70,
        borderRadius: 20,
        borderLeftWidth: 6,
        width: '90%',
      }}
      text1Style={{ fontSize: 14, fontWeight: '900', color: '#1A2332' }}
      text2Style={{ fontSize: 12, color: '#5A6B7E' }}
      renderLeadingIcon={() => (
        <View className="justify-center pl-4">
          <Info size={24} color="#1B4F9B" />
        </View>
      )}
    />
  )
};

export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
      registerBackgroundTasks();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ProfileProvider>
      <StatusBar style="dark" backgroundColor="#F4F7FB" />
      <RootLayoutNav />
      {/* 2. Pasamos la configuración personalizada */}
      <Toast config={toastConfig} />
    </ProfileProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          contentStyle: { backgroundColor: '#F4F7FB' },
          gestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="edit-profile" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="modes-settings" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="security" />
        <Stack.Screen name="note-detail" />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}