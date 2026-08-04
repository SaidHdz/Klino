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

  const SettingItem = ({ icon: Icon, title, sublabel, value, onToggle, color, index, isLast }: any) => (
    <MotiView
      from={{ opacity: 0, translateY: 10 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', delay: 200 + (index * 100) }}
    >
      <View className={`bg-white dark:bg-slate-800 p-4 flex-row items-center justify-between ${!isLast ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}>
        <View className="flex-row items-center flex-1">
          <View style={{ backgroundColor: `${color}10` }} className="w-10 h-10 rounded-xl justify-center items-center mr-4 border border-slate-50 dark:border-slate-700">
            <Icon size={20} color={color} />
          </View>
          <View className="flex-1 mr-4">
            <Text className="font-semibold text-slate-900 dark:text-white text-[15px]">{title}</Text>
            <Text className="text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-4">{sublabel}</Text>
          </View>
        </View>
        <Switch 
          value={value} 
          onValueChange={onToggle}
          trackColor={{ false: "#E2E8F0", true: "#34D399" }}
          thumbColor="#FFFFFF"
          ios_backgroundColor="#E2E8F0"
        />
      </View>
    </MotiView>
  );

  return (
    <View className="flex-1 bg-klino-background dark:bg-slate-900">
      <Header title="Alertas" showBack={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 100 }}>
            <Text className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-[1.5px] mb-2 ml-1">PREFERENCIAS DE RECEPCIÓN</Text>
          </MotiView>

          <View className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden mb-6">
            <SettingItem 
              index={0}
              icon={BatteryLow} 
              title="Estado del Hardware" 
              sublabel="Batería, conexión y telemetría" 
              value={settings.hardware}
              onToggle={() => toggleSetting('hardware')}
              color="#F59E0B"
            />

            <SettingItem 
              index={1}
              icon={MessageCircle} 
              title="Pacientes" 
              sublabel="Alertas de nuevos mensajes y citas" 
              value={settings.patients}
              onToggle={() => toggleSetting('patients')}
              color="#3B82F6"
            />

            <SettingItem 
              index={2}
              icon={FileText} 
              title="Reportes Klino IA" 
              sublabel="Notificar cuando una nota esté lista" 
              value={settings.soap}
              onToggle={() => toggleSetting('soap')}
              color="#10B981"
            />

            <SettingItem 
              index={3}
              icon={ShieldCheck} 
              title="Seguridad" 
              sublabel="Inicios de sesión y cambios" 
              value={settings.security}
              onToggle={() => toggleSetting('security')}
              color="#64748B"
              isLast={true}
            />
          </View>

          <MotiView 
            from={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 700 }}
            className="p-5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <Text className="text-slate-500 dark:text-slate-400 font-medium text-center text-[11px] leading-4">
              Los ajustes se sincronizan automáticamente con tu cuenta Klino Enterprise en la nube.
            </Text>
          </MotiView>

        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsSettingsScreen;