import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { useProfile } from '../context/ProfileContext';

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const { appSettings, updateSettings } = useProfile();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="h2" style={{ fontSize: 20 }}>Avisos y recordatorios</KlinoText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Ajustes de Notificaciones */}
        <View style={{ marginTop: 16, paddingHorizontal: 24 }}>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 16 }}>AJUSTES DE AVISOS</KlinoText>
          
          <ToggleItem 
            title="Citas pendientes" 
            subtitle="Recibir avisos de citas por confirmar."
            value={true} 
            onToggle={() => {}} 
          />
          <ToggleItem 
            title="Notas por revisar" 
            subtitle="Avisarme cuando la IA termine de redactar mi nota."
            value={appSettings?.notifications?.patients ?? true} 
            onToggle={(val: boolean) => updateSettings('notifications', 'patients', val)} 
          />
          <ToggleItem 
            title="Resúmenes generales" 
            subtitle="Notificarme cuando se actualice el resumen del paciente."
            value={appSettings?.notifications?.soap ?? true} 
            onToggle={(val: boolean) => updateSettings('notifications', 'soap', val)} 
          />
          <ToggleItem 
            title="Notificaciones en general" 
            subtitle="Avisos del sistema, suscripción y novedades."
            value={appSettings?.notifications?.hardware ?? true} 
            onToggle={(val: boolean) => updateSettings('notifications', 'hardware', val)} 
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const ToggleItem = ({ title, subtitle, value, onToggle }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
    <View style={{ flex: 1, paddingRight: 16 }}>
      <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{subtitle}</KlinoText>
    </View>
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={() => onToggle(!value)}
      style={{ width: 52, height: 32, backgroundColor: value ? KLINO_COLORS.verde : KLINO_COLORS.papelHondo, borderWidth: value ? 0 : 1, borderColor: KLINO_COLORS.borderStrong, justifyContent: 'center', paddingHorizontal: 4 }}
    >
      <View style={{ width: 24, height: 24, backgroundColor: value ? KLINO_COLORS.papel : KLINO_COLORS.gris, transform: [{ translateX: value ? 20 : 0 }] }} />
    </TouchableOpacity>
  </View>
);
