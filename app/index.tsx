import React, { useEffect, useState, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../src/utils/supabase';
import LoginScreen from '../src/screens/LoginScreen';
import { KLINO_COLORS } from '../src/constants/theme';

const LOGGED_OUT_KEY = '@Klino_LoggedOut';

export default function Entry() {
  const [showLogin, setShowLogin] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    const checkAuth = async () => {
      // First check if user just logged out
      const loggedOut = await AsyncStorage.getItem(LOGGED_OUT_KEY);
      if (loggedOut === 'true') {
        // User explicitly logged out — stay on login, don't check session
        await AsyncStorage.removeItem(LOGGED_OUT_KEY);
        setShowLogin(true);
        setChecking(false);
        return;
      }

      // Otherwise check if there's a valid session
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && !hasNavigated.current) {
          hasNavigated.current = true;
          router.replace('/(tabs)');
        } else {
          setShowLogin(true);
          setChecking(false);
        }
      } catch {
        setShowLogin(true);
        setChecking(false);
      }
    };

    checkAuth();
  }, []);

  if (checking && !showLogin) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: KLINO_COLORS.papel }}>
        <ActivityIndicator size="large" color={KLINO_COLORS.verde} />
      </View>
    );
  }

  return <LoginScreen />;
}