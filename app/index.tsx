import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/utils/supabase';
import LoginScreen from '../src/screens/LoginScreen';
import { KLINO_COLORS } from '../src/constants/theme';

export default function Entry() {
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.replace('/(tabs)');
      } else {
        setCheckingSession(false);
      }
    };

    checkSession();
  }, []);

  if (checkingSession) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: KLINO_COLORS.papel }}>
        <ActivityIndicator size="large" color={KLINO_COLORS.verde} />
      </View>
    );
  }

  return <LoginScreen />;
}