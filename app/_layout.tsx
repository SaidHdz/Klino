import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
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

import { KLINO_COLORS } from '../src/constants/theme';
import { ProfileProvider } from '../src/context/ProfileContext';
import { registerBackgroundTasks } from '../src/services/backgroundTasks';
import { KlinoAlertProvider } from '../src/context/KlinoAlertContext';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{ 
        borderLeftColor: KLINO_COLORS.verde, 
        backgroundColor: KLINO_COLORS.papel,
        height: 70,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: KLINO_COLORS.borderStrong,
        borderLeftWidth: 4,
        width: '90%',
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 14,
        fontWeight: 'bold',
        color: KLINO_COLORS.tinta,
        textTransform: 'uppercase',
      }}
      text2Style={{
        fontSize: 12,
        color: KLINO_COLORS.gris,
      }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: 'center', paddingLeft: 16 }}>
          <CheckCircle2 size={24} color={KLINO_COLORS.verde} />
        </View>
      )}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{ 
        borderLeftColor: '#E8820C', 
        backgroundColor: KLINO_COLORS.papel,
        height: 70,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: KLINO_COLORS.borderStrong,
        borderLeftWidth: 4,
        width: '90%',
      }}
      text1Style={{ fontSize: 14, fontWeight: 'bold', color: KLINO_COLORS.tinta, textTransform: 'uppercase' }}
      text2Style={{ fontSize: 12, color: KLINO_COLORS.gris }}
      renderLeadingIcon={() => (
        <View style={{ justifyContent: 'center', paddingLeft: 16 }}>
          <ShieldAlert size={24} color="#E8820C" />
        </View>
      )}
    />
  )
};

export {
  ErrorBoundary,
} from 'expo-router';

SplashScreen.preventAutoHideAsync();

const KlinoTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: KLINO_COLORS.papel,
    card: KLINO_COLORS.papel,
    text: KLINO_COLORS.tinta,
    border: KLINO_COLORS.borderHairline,
    primary: KLINO_COLORS.verde,
  },
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'FamiljenGrotesk-SemiBold': require('../assets/fonts/FamiljenGrotesk-Variable.ttf'),
    'Spectral-Regular': require('../assets/fonts/Spectral-Regular.ttf'),
    'Spectral-Medium': require('../assets/fonts/Spectral-Medium.ttf'),
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
    <KlinoAlertProvider>
      <ProfileProvider>
        <View style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
          <StatusBar style="dark" backgroundColor={KLINO_COLORS.papel} />
          <RootLayoutNav />
          <Toast config={toastConfig} />
        </View>
      </ProfileProvider>
    </KlinoAlertProvider>
  );
}

function RootLayoutNav() {
  return (
    <ThemeProvider value={KlinoTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: { backgroundColor: KLINO_COLORS.papel },
          gestureEnabled: true,
          fullScreenGestureEnabled: true,
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="edit-profile" />
        <Stack.Screen name="formats" />
        <Stack.Screen name="notifications" />
        <Stack.Screen name="notification-settings" />
        <Stack.Screen name="security" />
        <Stack.Screen name="note-review" />
        <Stack.Screen name="live-consultation" />
        <Stack.Screen name="signup" />
        <Stack.Screen name="subscription" />
        <Stack.Screen name="scanner-assign" />
        <Stack.Screen name="scanner-camera" />
        <Stack.Screen name="scanner-select" />
        <Stack.Screen name="modal" />
        <Stack.Screen name="closing-session" />
      </Stack>
    </ThemeProvider>
  );
}