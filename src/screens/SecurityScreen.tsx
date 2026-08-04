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

  const SecurityItem = ({ icon: Icon, title, sublabel, onPress, isLast }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.7}
      className={`bg-white p-4 flex-row items-center justify-between ${!isLast ? 'border-b border-slate-100' : ''}`}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-10 h-10 bg-slate-50 rounded-xl justify-center items-center mr-4 border border-slate-100">
          <Icon size={20} color="#64748B" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-slate-900 text-[15px]">{title}</Text>
          <Text className="text-[12px] text-slate-500 mt-0.5 leading-4">{sublabel}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-klino-background">
      <Header title="Seguridad" showBack={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          <Text className="text-slate-500 font-semibold text-[11px] uppercase tracking-[1.5px] mb-2 ml-1">Protección de Datos Médicos</Text>

          <View className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden mb-6">
            {/* Biometría */}
            <View className="bg-white p-4 flex-row items-center justify-between border-b border-slate-100">
              <View className="flex-row items-center flex-1">
                <View className="w-10 h-10 bg-blue-50 rounded-xl justify-center items-center mr-4 border border-blue-50">
                  <Fingerprint size={20} color="#3B82F6" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-slate-900 text-[15px]">Acceso Biométrico</Text>
                  <Text className="text-[12px] text-slate-500 mt-0.5 leading-4">Requiere Face ID o Touch ID</Text>
                </View>
              </View>
              <Switch 
                value={biometrics} 
                onValueChange={toggleBiometrics}
                trackColor={{ false: "#E2E8F0", true: "#34D399" }}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#E2E8F0"
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
              isLast={true}
            />
          </View>

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