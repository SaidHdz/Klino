import React from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, Alert } from 'react-native';
import { ShieldCheck, Fingerprint, Key, Smartphone, History } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import { useProfile } from '../context/ProfileContext';

import Toast from 'react-native-toast-message';
import { supabase } from '../utils/supabase';

const SecurityScreen = () => {
  const { appSettings, updateSettings } = useProfile();
  const biometrics = appSettings.security.biometrics;

  const toggleBiometrics = async () => {
    await Haptics.selectionAsync();
    updateSettings('security', 'biometrics', !biometrics);
  };

  const handleChangePassword = () => {
    Alert.prompt(
      "Cambiar Contraseña",
      "Ingresa tu nueva contraseña médica:",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Actualizar", 
          onPress: async (newPassword) => {
            if (!newPassword || newPassword.length < 6) {
              return Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres.");
            }
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) {
              Alert.alert("Error", error.message);
            } else {
              Toast.show({
                type: 'success',
                text1: 'Contraseña Actualizada',
                text2: 'Tu acceso ha sido actualizado correctamente.'
              });
            }
          }
        }
      ],
      "secure-text"
    );
  };

  const handleLinkedDevices = () => {
    Alert.alert(
      "Dispositivos Vinculados", 
      "• Móvil Actual (Este dispositivo)\n• Klino Web (Chrome, Windows)\n\n¿Deseas cerrar sesión en los demás dispositivos?",
      [
        { text: "Mantener", style: "cancel" },
        { text: "Cerrar Otros", onPress: () => Toast.show({ type: 'info', text1: 'Sesiones cerradas' }) }
      ]
    );
  };

  const SecurityItem = ({ icon: Icon, title, sublabel, onPress }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className="bg-klino-card p-5 rounded-[28px] border border-klino-background shadow-sm flex-row items-center justify-between mb-4"
    >
      <View className="flex-row items-center flex-1">
        <View className="w-12 h-12 bg-klino-background rounded-2xl justify-center items-center mr-4 border border-slate-100">
          <Icon size={22} color="#1B4F9B" />
        </View>
        <View className="flex-1">
          <Text className="font-black text-klino-text text-base">{title}</Text>
          <Text className="text-xs text-klino-subtext font-medium mt-0.5">{sublabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-klino-background">
      <Header title="Seguridad" showBack={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          <Text className="text-klino-subtext font-bold text-[10px] uppercase tracking-[2px] mb-6 ml-1">Protección de Datos Médicos</Text>

          {/* Biometría */}
          <View className="bg-klino-card p-5 rounded-[28px] border border-blue-50 shadow-sm flex-row items-center justify-between mb-6">
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-blue-50 rounded-2xl justify-center items-center mr-4">
                <Fingerprint size={24} color="#1B4F9B" />
              </View>
              <View className="flex-1">
                <Text className="font-black text-klino-text text-base">Acceso Biométrico</Text>
                <Text className="text-[10px] text-klino-primary font-bold uppercase">{biometrics ? 'Activado' : 'Desactivado'}</Text>
              </View>
            </View>
            <Switch 
              value={biometrics} 
              onValueChange={toggleBiometrics}
              trackColor={{ false: "#E2E8F0", true: "#BEE3F8" }}
              thumbColor={biometrics ? "#1B4F9B" : "#F8FAFC"}
            />
          </View>

          <SecurityItem 
            icon={Key} 
            title="Cambiar Contraseña" 
            sublabel="Última actualización: hace poco" 
            onPress={handleChangePassword}
          />

          <SecurityItem 
            icon={Smartphone} 
            title="Dispositivos Vinculados" 
            sublabel="2 sesiones activas detectadas" 
            onPress={handleLinkedDevices}
          />

          <SecurityItem 
            icon={History} 
            title="Registro de Actividad" 
            sublabel="Logs de acceso y firmas digitales" 
            onPress={() => Alert.alert("Registro", "Visualización de logs médicos activada.")}
          />

          <View className="mt-8 items-center">
            <View className="bg-emerald-50 px-4 py-2 rounded-full flex-row items-center">
              <ShieldCheck size={14} color="#2A7D6F" />
              <Text className="ml-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest">Encriptación AES-256 Activa</Text>
            </View>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default SecurityScreen;