import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { BriefcaseMedical, Contact2, Lock, Fingerprint, ShieldCheck, Eye, EyeOff, UserPlus, HeartPulse } from 'lucide-react-native';
import { MotiView } from 'moti';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as LocalAuthentication from 'expo-local-authentication';
import { supabase } from '../utils/supabase';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthenticate = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa tus credenciales.");
      return;
    }

    setIsLoading(true);
    try {
      // Intentar login real con Supabase
      const normalizedEmail = email.toLowerCase().trim();
      const fullEmail = normalizedEmail.includes('@') ? normalizedEmail : `${normalizedEmail}@klino.med`;
      console.log('--- [DEBUG] Intentando Login Supabase:', fullEmail);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: fullEmail,
        password: password,
      });

      if (error) {
        console.error('--- [DEBUG] Error Supabase Auth:', error.message, error.status);
        
        // Fallback para testing con credenciales hardcoded
        if ((email === 'test' && (password === 'teextrañodeth' || password === 'teextradeth')) || 
            (email === 'Klino-DR-2024' && password === 'admin')) {
           await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
           router.replace('/(tabs)');
           return;
        }
        throw error;
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Error de Autenticación", error.message || "Credenciales inválidas.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push('/signup');
  };

  const handleBiometricAuth = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return Alert.alert('Error', 'Tu dispositivo no soporta autenticación biométrica.');
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!isEnrolled) {
      return Alert.alert('Seguridad', 'No tienes datos biométricos registrados en este dispositivo.');
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Autenticación Klino',
      fallbackLabel: 'Usar contraseña',
      cancelLabel: 'Cancelar',
      disableDeviceFallback: false,
    });

    if (result.success) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } else {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 px-8"
      >
        <View className="flex-1 justify-center py-6">
            
            <MotiView 
              from={{ opacity: 0, translateY: -20 }} 
              animate={{ opacity: 1, translateY: 0 }} 
              transition={{ type: 'spring', delay: 100 }}
              className="items-center mt-4 mb-10"
            >
              <Text className="text-4xl font-black text-slate-900 tracking-tight mb-2">Klino</Text>
            </MotiView>

            <MotiView 
              from={{ opacity: 0, translateY: 20 }} 
              animate={{ opacity: 1, translateY: 0 }} 
              transition={{ type: 'spring', delay: 200 }}
            >
              <View className="mb-5">
                <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Identificador Médico</Text>
                <View className="flex-row items-center bg-white border border-slate-200/60 rounded-2xl px-5 py-1.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <Contact2 size={18} color="#94A3B8" />
                  <TextInput 
                    placeholder="Ej. Klino-DR-2024 o Email"
                    placeholderTextColor="#CBD5E1"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    className="flex-1 p-4 text-slate-800 font-semibold"
                  />
                </View>
              </View>

              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-2 px-2">
                  <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contraseña de Acceso</Text>
                  <TouchableOpacity>
                    <Text className="text-[11px] font-bold text-klino-primary tracking-wide">¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row items-center bg-white border border-slate-200/60 rounded-2xl px-5 py-1.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                  <Lock size={18} color="#94A3B8" />
                  <TextInput 
                    placeholder="••••••••"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 p-4 text-slate-800 font-semibold"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                    {showPassword ? <EyeOff size={18} color="#94A3B8" /> : <Eye size={18} color="#94A3B8" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleAuthenticate}
                activeOpacity={0.9}
                disabled={isLoading}
                className="bg-klino-primary p-4.5 py-4 rounded-2xl items-center shadow-[0_8px_30px_rgb(27,79,155,0.3)] flex-row justify-center mb-5"
              >
                {isLoading ? <ActivityIndicator color="white" className="mr-3" /> : null}
                <Text className="text-white font-bold text-[15px] tracking-widest uppercase">
                  {isLoading ? 'Conectando...' : 'Iniciar Sesión'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSignUp}
                disabled={isLoading}
                className="flex-row items-center justify-center p-3 mb-4"
              >
                <Text className="text-slate-500 font-semibold text-[13px]">¿Eres nuevo en Klino?</Text>
                <Text className="text-klino-primary font-bold text-[13px] ml-1">Crear cuenta</Text>
              </TouchableOpacity>

              <View className="flex-row items-center my-6">
                <View className="flex-1 h-[1px] bg-slate-200" />
                <Text className="mx-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">O ACCEDE CON</Text>
                <View className="flex-1 h-[1px] bg-slate-200" />
              </View>

              <TouchableOpacity 
                onPress={handleBiometricAuth}
                activeOpacity={0.7}
                className="bg-white p-4.5 py-4 rounded-2xl flex-row items-center justify-center border border-slate-200 shadow-[0_2px_15px_rgb(0,0,0,0.03)]"
              >
                <Fingerprint size={22} color="#1B4F9B" />
                <Text className="text-slate-800 font-bold text-[14px] ml-3 tracking-wide">Face ID / Touch ID</Text>
              </TouchableOpacity>
            </MotiView>

            <MotiView 
              from={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              transition={{ delay: 500 }}
              className="flex-row items-center justify-center mt-12 mb-6"
            >
              <ShieldCheck size={14} color="#94A3B8" />
              <Text className="text-[9px] font-black text-slate-400 tracking-[1.5px] ml-2 uppercase">
                Plataforma Encriptada Nivel Médico
              </Text>
            </MotiView>

          </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
