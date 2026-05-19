import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Contact2, Lock, Eye, EyeOff, UserPlus, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../utils/supabase';

import Toast from 'react-native-toast-message';

const SignUpScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      return Alert.alert("Registro", "Ingresa un ID y contraseña para crear tu cuenta.");
    }
    
    setIsLoading(true);
    try {
      const normalizedEmail = email.toLowerCase().trim();
      const fullEmail = normalizedEmail.includes('@') ? normalizedEmail : `${normalizedEmail}@klino.med`;
      
      const { data, error } = await supabase.auth.signUp({
        email: fullEmail,
        password: password,
      });

      if (error) throw error;

      // CREAR PERFIL EN TABLA 'doctors' (Sincronización con BD Clínica)
      if (data.user) {
        const { error: profileError } = await supabase
          .from('doctors')
          .insert({
            id: data.user.id,
            full_name: email.split('.')[0] || 'Nuevo Médico', 
            email: fullEmail,
            whatsapp_number: `pending_${data.user.id.substring(0,8)}`, // Valor único temporal
            pin_hash: '0000', // PIN por defecto inicial (requerido por DB)
            specialty: 'Medicina General',
            subscription_tier: 'trial',
            subscription_status: 'active'
          });

        if (profileError) console.error("Error creando perfil:", profileError);
      }
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      Toast.show({
        type: 'success',
        text1: '¡Bienvenido a Klino!',
        text2: 'Tu cuenta médica ha sido creada correctamente.',
      });

      // Si Supabase hace auto-login tras el registro, vamos a tabs
      if (data.session) {
        router.replace('/(tabs)');
      } else {
        Alert.alert("Verificación", "Revisa tu correo para confirmar tu cuenta.");
        router.back();
      }
    } catch (error: any) {
      Alert.alert("Error de Registro", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-klino-card">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          className="px-8"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 py-12">
            
            <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-start justify-center mb-8">
              <X size={24} color="#5A6B7E" />
            </TouchableOpacity>

            <View className="items-center mb-10">
              <Text className="text-3xl font-black text-klino-primary tracking-[6px] mb-4">Klino</Text>
              <Text className="text-4xl font-black text-klino-text tracking-tighter mb-2 text-center">Registro Médico</Text>
              <Text className="text-klino-subtext text-center font-medium px-4 leading-5">
                Crea tu identidad digital para empezar a generar notas IA.
              </Text>
            </View>

            <View className="mt-4">
              <View className="mb-6">
                <Text className="text-xs font-semibold text-klino-subtext uppercase tracking-widest mb-2 ml-1">ID Médico Deseado</Text>
                <View className="flex-row items-center bg-klino-background border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
                  <Contact2 size={20} color="#5A6B7E" />
                  <TextInput 
                    placeholder="ej: dr.smith"
                    placeholderTextColor="#CBD5E1"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    className="flex-1 p-4 text-klino-text font-medium"
                  />
                </View>
              </View>

              <View className="mb-10">
                <Text className="text-xs font-semibold text-klino-subtext uppercase tracking-widest mb-2 ml-1">Contraseña Segura</Text>
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
                onPress={handleSignUp}
                activeOpacity={0.9}
                disabled={isLoading}
                className="bg-klino-primary p-5 rounded-2xl items-center shadow-md shadow-klino-primary/20 flex-row justify-center"
              >
                {isLoading ? <ActivityIndicator color="white" className="mr-3" /> : null}
                <Text className="text-white font-bold text-lg tracking-widest uppercase">
                  {isLoading ? 'Registrando...' : 'Crear Cuenta'}
                </Text>
              </TouchableOpacity>
            </View>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
