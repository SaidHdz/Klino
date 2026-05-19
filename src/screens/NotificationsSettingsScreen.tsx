import React from 'react';
import { View, Text, ScrollView, Switch } from 'react-native';
import { BatteryLow, MessageCircle, FileText, ShieldCheck } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import Header from '../components/Header';
import { useProfile } from '../context/ProfileContext';

const NotificationsSettingsScreen = () => {
  const { appSettings, updateSettings } = useProfile();
  const settings = appSettings.notifications;

  const toggleSetting = async (key: keyof typeof settings) => {
    await Haptics.selectionAsync();
    updateSettings('notifications', key, !settings[key]);
  };

  const SettingItem = ({ icon: Icon, title, sublabel, value, onToggle, color, index }: any) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', delay: 200 + (index * 100) }}
    >
      <View className="bg-klino-card p-5 rounded-[28px] border border-klino-background shadow-sm flex-row items-center justify-between mb-4">
        <View className="flex-row items-center flex-1">
          <View style={{ backgroundColor: `${color}15` }} className="w-12 h-12 rounded-2xl justify-center items-center mr-4 border border-slate-100">
            <Icon size={22} color={color} />
          </View>
          <View className="flex-1">
            <Text className="font-black text-klino-text text-base">{title}</Text>
            <Text className="text-[11px] text-klino-subtext font-medium mt-0.5 leading-4">{sublabel}</Text>
          </View>
        </View>
        <Switch 
          value={value} 
          onValueChange={onToggle}
          trackColor={{ false: "#E2E8F0", true: "#BEE3F8" }}
          thumbColor={value ? "#1B4F9B" : "#F8FAFC"}
        />
      </View>
    </MotiView>
  );

  return (
    <View className="flex-1 bg-klino-background">
      <Header title="Alertas" showBack={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 100 }}>
            <Text className="text-klino-subtext font-bold text-[10px] uppercase tracking-[2px] mb-6 ml-1">Configura tus preferencias de recepción</Text>
          </MotiView>

          <SettingItem 
            index={0}
            icon={BatteryLow} 
            title="Estado del Hardware" 
            sublabel="Avisos de batería, conexión y telemetría" 
            value={settings.hardware}
            onToggle={() => toggleSetting('hardware')}
            color="#E8820C"
          />

          <SettingItem 
            index={1}
            icon={MessageCircle} 
            title="Pacientes" 
            sublabel="Alertas de nuevos mensajes y citas" 
            value={settings.patients}
            onToggle={() => toggleSetting('patients')}
            color="#1B4F9B"
          />

          <SettingItem 
            index={2}
            icon={FileText} 
            title="Reportes Klino IA" 
            sublabel="Notificar cuando una nota esté procesada" 
            value={settings.soap}
            onToggle={() => toggleSetting('soap')}
            color="#2A7D6F"
          />

          <SettingItem 
            index={3}
            icon={ShieldCheck} 
            title="Alertas de Seguridad" 
            sublabel="Inicios de sesión y cambios de credenciales" 
            value={settings.security}
            onToggle={() => toggleSetting('security')}
            color="#5A6B7E"
          />

          <MotiView 
            from={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 700 }}
            className="mt-8 p-6 bg-blue-50/50 rounded-[32px] border border-dashed border-klino-primary/20"
          >
            <Text className="text-klino-primary font-bold text-center text-[10px] leading-4 uppercase tracking-wider">
              Los ajustes se sincronizan con tu cuenta Klino Enterprise.
            </Text>
          </MotiView>

        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsSettingsScreen;