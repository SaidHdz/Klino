import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, SafeAreaView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { Contact2, Lock, Eye, EyeOff, UserPlus, X } from 'lucide-react-native';
import { MotiView } from 'moti';
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
    <SafeAreaView className="flex-1 bg-slate-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1 px-8"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View className="flex-1 py-12 justify-center">
            
          <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-start justify-center mb-8 absolute top-8 left-0 z-10">
            <X size={24} color="#94A3B8" />
          </TouchableOpacity>

          <MotiView 
            from={{ opacity: 0, translateY: -20 }} 
            animate={{ opacity: 1, translateY: 0 }} 
            transition={{ type: 'spring', delay: 100 }}
            className="items-center mb-10 mt-12"
          >
            <Text className="text-4xl font-black text-slate-900 tracking-tight mb-2 text-center">Registro Médico</Text>
          </MotiView>

          <MotiView 
            from={{ opacity: 0, translateY: 20 }} 
            animate={{ opacity: 1, translateY: 0 }} 
            transition={{ type: 'spring', delay: 200 }}
            className="mt-2"
          >
            <View className="mb-5">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">ID Médico Deseado</Text>
              <View className="flex-row items-center bg-white border border-slate-200/60 rounded-2xl px-5 py-1.5 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
                <Contact2 size={18} color="#94A3B8" />
                <TextInput 
                  placeholder="ej: dr.smith"
                  placeholderTextColor="#CBD5E1"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  className="flex-1 p-4 text-slate-800 font-semibold"
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 ml-2">Contraseña Segura</Text>
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
              onPress={handleSignUp}
              activeOpacity={0.9}
              disabled={isLoading}
              className="bg-klino-primary p-4.5 py-4 rounded-2xl items-center shadow-[0_8px_30px_rgb(27,79,155,0.3)] flex-row justify-center"
            >
              {isLoading ? <ActivityIndicator color="white" className="mr-3" /> : null}
              <Text className="text-white font-bold text-[15px] tracking-widest uppercase">
                {isLoading ? 'Registrando...' : 'Crear Cuenta'}
              </Text>
            </TouchableOpacity>
          </MotiView>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SignUpScreen;
