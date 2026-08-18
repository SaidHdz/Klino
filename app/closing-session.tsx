import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/utils/supabase';
import { KLINO_COLORS } from '../src/constants/theme';
import { KlinoText } from '../src/components/common/KlinoText';

export default function ClosingSessionScreen() {
  const router = useRouter();

  useEffect(() => {
    const doLogout = async () => {
      // 1. Sign out from Supabase
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (e) {
        console.log('signOut error (ignorado):', e);
      }

      // 2. Nuke ALL AsyncStorage keys related to Supabase and Klino session
      try {
        const allKeys = await AsyncStorage.getAllKeys();
        const keysToRemove = allKeys.filter(k => 
          k.includes('supabase') || 
          k === '@Klino_USER_PROFILE' || 
          k === '@Klino_Appointments'
        );
        if (keysToRemove.length > 0) {
          await AsyncStorage.multiRemove(keysToRemove);
        }
      } catch (e) {
        console.log('storage cleanup error (ignorado):', e);
      }

      // 3. Set the logged-out flag so index.tsx knows not to auto-redirect
      await AsyncStorage.setItem('@Klino_LoggedOut', 'true');

      // 4. Wait a moment for Supabase internals to settle
      await new Promise(resolve => setTimeout(resolve, 800));

      // 5. Navigate to login
      if (router.canDismiss()) {
        router.dismissAll();
      }
      router.replace('/');
    };

    doLogout();
  }, []);

  return (
    <View style={{ 
      flex: 1, 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: KLINO_COLORS.papel 
    }}>
      <ActivityIndicator size="large" color={KLINO_COLORS.verde} style={{ marginBottom: 24 }} />
      <KlinoText variant="label" color={KLINO_COLORS.gris}>CERRANDO SESIÓN...</KlinoText>
    </View>
  );
}
