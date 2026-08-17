import React, { useState } from 'react';
import { View, TouchableOpacity, SafeAreaView, Platform, Alert, Image, StatusBar, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../utils/supabase';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { KlinoButton } from '../components/common/KlinoButton';
import { KlinoInput } from '../components/common/KlinoInput';
import Toast from 'react-native-toast-message';

export default function SignUpScreen() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedMode, setSelectedMode] = useState('Medicina general');
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleNext = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < 4) {
      setStep(step + 1);
    } else {
      await handleFinish();
    }
  };

  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStep(4);
  };

  const handleFinish = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Por favor ingresa un correo y contraseña");
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (error) throw error;

      if (data.user) {
        await supabase.from('doctors').insert({
          id: data.user.id,
          full_name: 'Dr. Nuevo', 
          email: email,
          whatsapp_number: `pending_${data.user.id.substring(0,8)}`, 
          pin_hash: '0000', 
          specialty: selectedMode,
          subscription_tier: 'trial',
          subscription_status: 'active'
        });
      }
      
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const modes = ['Medicina general', 'Pediatría', 'Ginecología', 'Urgencias'];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.verde }}>
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 60 : 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        
        {/* HEADER */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 64 }}>
          <Image 
            source={require('../../assets/klino-brand-kit/logo/symbol/symbol-papel.png')} 
            style={{ width: 20, height: 20 }} 
            resizeMode="contain"
          />
          <TouchableOpacity onPress={handleSkip}>
            <KlinoText variant="label" color={KLINO_COLORS.papel}>SALTAR</KlinoText>
          </TouchableOpacity>
        </View>

        {/* PROGRESS */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => (
            <View 
              key={i} 
              style={{ 
                width: 32, 
                height: 2, 
                backgroundColor: step === i ? KLINO_COLORS.papel : 'rgba(255,255,255,0.3)' 
              }} 
            />
          ))}
        </View>

        <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ marginBottom: 16 }}>
          PASO {step} DE 4
        </KlinoText>

        <View style={{ flex: 1 }}>
          {step === 1 && (
            <View>
              <KlinoText variant="h1" color={KLINO_COLORS.papel} style={{ marginBottom: 16, fontSize: 36, lineHeight: 40 }}>
                Tú atiendes.{'\n'}La historia clínica se{'\n'}escribe sola.
              </KlinoText>
              <KlinoText variant="body" color={KLINO_COLORS.papel} style={{ opacity: 0.9, fontSize: 18, lineHeight: 24 }}>
                Klino escucha la consulta y arma el documento conforme a la NOM-004. Tú lo revisas y lo apruebas.
              </KlinoText>
            </View>
          )}

          {step === 2 && (
            <View>
              <KlinoText variant="h1" color={KLINO_COLORS.papel} style={{ marginBottom: 16, fontSize: 36, lineHeight: 40 }}>
                Tu aprobación es tu{'\n'}firma
              </KlinoText>
              <KlinoText variant="body" color={KLINO_COLORS.papel} style={{ opacity: 0.9, fontSize: 18, lineHeight: 24 }}>
                Mantienes presionado un segundo y el documento queda guardado a tu nombre. Nada se guarda antes.
              </KlinoText>
            </View>
          )}

          {step === 3 && (
            <View>
              <KlinoText variant="h1" color={KLINO_COLORS.papel} style={{ marginBottom: 16, fontSize: 36, lineHeight: 40 }}>
                ¿Qué atiendes?
              </KlinoText>
              <KlinoText variant="body" color={KLINO_COLORS.papel} style={{ opacity: 0.9, fontSize: 18, lineHeight: 24, marginBottom: 32 }}>
                Con esto armamos tu primer modo. Puedes cambiarlo o agregar más cuando quieras.
              </KlinoText>
              
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                {modes.map(mode => {
                  const isSelected = selectedMode === mode;
                  return (
                    <TouchableOpacity
                      key={mode}
                      activeOpacity={0.8}
                      onPress={() => setSelectedMode(mode)}
                      style={{
                        paddingVertical: 12,
                        paddingHorizontal: 20,
                        backgroundColor: isSelected ? KLINO_COLORS.papel : 'transparent',
                        borderWidth: 1,
                        borderColor: KLINO_COLORS.papel,
                      }}
                    >
                      <KlinoText 
                        variant="body" 
                        color={isSelected ? KLINO_COLORS.verde : KLINO_COLORS.papel}
                        style={{ fontWeight: isSelected ? 'bold' : 'normal' }}
                      >
                        {mode}
                      </KlinoText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {step === 4 && (
            <View>
              <KlinoText variant="h1" color={KLINO_COLORS.papel} style={{ marginBottom: 16, fontSize: 36, lineHeight: 40 }}>
                Crea tu cuenta
              </KlinoText>
              <KlinoText variant="body" color={KLINO_COLORS.papel} style={{ opacity: 0.9, fontSize: 18, lineHeight: 24, marginBottom: 32 }}>
                Ingresa tu correo y contraseña para empezar a usar Klino.
              </KlinoText>
              
              <KlinoInput 
                placeholder="ejemplo@correo.com"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: KLINO_COLORS.tinta }}
              />
              <KlinoInput 
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', color: KLINO_COLORS.tinta }}
              />
            </View>
          )}
        </View>

        {/* FOOTER ACTION */}
        <View>
          <TouchableOpacity 
            activeOpacity={0.9}
            onPress={handleNext}
            disabled={isLoading}
            style={{
              backgroundColor: KLINO_COLORS.papel,
              paddingVertical: 18,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}
          >
            <KlinoText variant="label" color={KLINO_COLORS.verde}>
              {isLoading ? 'CARGANDO...' : step === 1 ? 'EMPEZAR' : step === 2 ? 'ENTENDIDO' : step === 3 ? 'SIGUIENTE' : 'CREAR CUENTA'}
            </KlinoText>
          </TouchableOpacity>
          <KlinoText variant="small" color={KLINO_COLORS.papel} style={{ textAlign: 'center', opacity: 0.8 }}>
            Puedes cambiar todo esto después.
          </KlinoText>
        </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
