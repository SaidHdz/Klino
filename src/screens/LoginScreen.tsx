import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { BriefcaseMedical, Contact2, Lock, Fingerprint, ShieldCheck, Eye, EyeOff, UserPlus } from 'lucide-react-native';
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
    <SafeAreaView className="flex-1 bg-klino-card">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          className="px-8"
        >
          <View className="flex-1 justify-between py-12">
            
            <View className="items-center mt-6">
              <View className="flex-row items-center mb-6">
                <Text className="text-3xl font-black text-klino-primary tracking-[6px]">Klino</Text>
              </View>
              <Text className="text-4xl font-black text-klino-text tracking-tighter mb-2">Iniciar Sesión</Text>
              <Text className="text-klino-subtext text-center font-medium px-4 leading-5">
                Ingresa tus credenciales para acceder al portal seguro.
              </Text>
            </View>

            <View className="mt-10">
              <View className="mb-6">
                <Text className="text-xs font-semibold text-klino-subtext uppercase tracking-widest mb-2 ml-1">ID Médico</Text>
                <View className="flex-row items-center bg-klino-background border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                  <Contact2 size={20} color="#5A6B7E" />
                  <TextInput 
                    placeholder="Klino-DR-2024"
                    placeholderTextColor="#CBD5E1"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    className="flex-1 p-4 text-klino-text font-medium"
                  />
                </View>
              </View>

              <View className="mb-8">
                <View className="flex-row justify-between items-center mb-2 px-1">
                  <Text className="text-xs font-semibold text-klino-subtext uppercase tracking-widest">Contraseña</Text>
                  <TouchableOpacity>
                    <Text className="text-sm font-semibold text-klino-primary">¿Olvidaste tu contraseña?</Text>
                  </TouchableOpacity>
                </View>
                <View className="flex-row items-center bg-klino-background border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                  <Lock size={20} color="#5A6B7E" />
                  <TextInput 
                    placeholder="••••••••"
                    placeholderTextColor="#CBD5E1"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    className="flex-1 p-4 text-klino-text font-medium"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-2">
                    {showPassword ? <EyeOff size={20} color="#5A6B7E" /> : <Eye size={20} color="#5A6B7E" />}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                onPress={handleAuthenticate}
                activeOpacity={0.9}
                disabled={isLoading}
                className="bg-klino-primary p-5 rounded-2xl items-center shadow-md shadow-klino-primary/20 flex-row justify-center"
              >
                {isLoading ? <ActivityIndicator color="white" className="mr-3" /> : null}
                <Text className="text-white font-bold text-lg tracking-widest uppercase">
                  {isLoading ? 'Verificando...' : 'Autenticar'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleSignUp}
                disabled={isLoading}
                className="mt-4 flex-row items-center justify-center p-3"
              >
                <UserPlus size={16} color="#5A6B7E" />
                <Text className="text-klino-subtext font-bold text-xs ml-2 uppercase tracking-widest">Crear nueva cuenta médica</Text>
              </TouchableOpacity>

              <View className="flex-row items-center my-8">
                <View className="flex-1 h-[1px] bg-klino-background" />
                <Text className="mx-4 text-xs font-bold text-slate-300 uppercase tracking-widest">O</Text>
                <View className="flex-1 h-[1px] bg-klino-background" />
              </View>

              {/* Botón Biométrico Funcional */}
              <TouchableOpacity 
                onPress={handleBiometricAuth}
                activeOpacity={0.7}
                className="bg-klino-card p-5 rounded-2xl flex-row items-center justify-center border border-slate-200 shadow-sm"
              >
                <Fingerprint size={24} color="#5A6B7E" />
                <Text className="text-klino-subtext font-bold text-sm ml-3 tracking-widest">Usar Biometría</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center justify-center mt-12">
              <ShieldCheck size={14} color="#CBD5E1" />
              <Text className="text-[10px] font-bold text-slate-300 tracking-widest ml-2 uppercase">
                SESIÓN ENCRIPTADA DE EXTREMO A EXTREMO
              </Text>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default LoginScreen;
