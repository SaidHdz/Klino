import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { KlinoButton } from '../components/common/KlinoButton';
import { useProfile } from '../context/ProfileContext';

export default function ProfileScreen() {
  const router = useRouter();
  const { doctorName, logout, appSettings, updateSettings } = useProfile();

  const handleLogout = () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive", 
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            await logout();
            router.replace('/');
          } 
        }
      ]
    );
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() || 'DR';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 60 : 32, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* TITULAR */}
        <View style={{ marginBottom: 24 }}>
          <KlinoText variant="h2">Tu cuenta</KlinoText>
        </View>

        {/* TARJETA DE PERFIL Y EDITAR */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, paddingVertical: 16, borderTopWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
            <View style={{ width: 64, height: 64, backgroundColor: KLINO_COLORS.verde, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
              <KlinoText variant="h3" color={KLINO_COLORS.papel}>{getInitials(doctorName)}</KlinoText>
            </View>
            <View style={{ flex: 1, paddingRight: 8 }}>
              <KlinoText variant="h3" style={{ marginBottom: 4 }}>{doctorName}</KlinoText>
              <KlinoText variant="label" color={KLINO_COLORS.gris}>MEDICINA GENERAL · CED. 7841203</KlinoText>
            </View>
          </View>
          <TouchableOpacity onPress={() => router.push('/edit-profile')}>
             <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold' }}>EDITAR</KlinoText>
          </TouchableOpacity>
        </View>

        {/* TARJETA ESTA SEMANA */}
        <TouchableOpacity activeOpacity={0.9} style={{ backgroundColor: KLINO_COLORS.verde, padding: 24, marginBottom: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <KlinoText variant="label" color={KLINO_COLORS.papelHondo} style={{ letterSpacing: 2 }}>ESTA SEMANA</KlinoText>
            <ChevronRight size={20} color={KLINO_COLORS.papelHondo} strokeWidth={1.75} />
          </View>
          <KlinoText variant="h1" color={KLINO_COLORS.papel} style={{ fontSize: 48, marginBottom: 8 }}>6 h 40 m</KlinoText>
          <KlinoText variant="body" color={KLINO_COLORS.papelHondo} style={{ lineHeight: 24 }}>que no pasaste escribiendo. 74 documentos dictados.</KlinoText>
        </TouchableOpacity>

        {/* ACCESO AL DICTADO */}
        <View style={{ marginBottom: 32 }}>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 16 }}>ACCESO AL DICTADO</KlinoText>
          
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => updateSettings('appearance', 'dictationButtonOrientation', 'vertical')}
            style={{ flexDirection: 'row', borderWidth: 1, borderColor: appSettings.appearance.dictationButtonOrientation === 'vertical' ? KLINO_COLORS.verde : KLINO_COLORS.borderStrong, backgroundColor: appSettings.appearance.dictationButtonOrientation === 'vertical' ? KLINO_COLORS.papelHondo : KLINO_COLORS.papel, padding: 16, marginBottom: 16 }}
          >
            <View style={{ width: 24, height: 24, borderWidth: appSettings.appearance.dictationButtonOrientation === 'vertical' ? 0 : 1, borderColor: KLINO_COLORS.borderStrong, backgroundColor: appSettings.appearance.dictationButtonOrientation === 'vertical' ? KLINO_COLORS.verde : 'transparent', marginRight: 16, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <KlinoText variant="body" style={{ fontWeight: 'bold', marginBottom: 4 }}>Asa en el borde</KlinoText>
              <KlinoText variant="small" color={KLINO_COLORS.gris}>Pestaña vertical pegada al lado derecho, a la altura del pulgar. No ocupa alto.</KlinoText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => updateSettings('appearance', 'dictationButtonOrientation', 'horizontal')}
            style={{ flexDirection: 'row', borderWidth: 1, borderColor: appSettings.appearance.dictationButtonOrientation === 'horizontal' ? KLINO_COLORS.verde : KLINO_COLORS.borderStrong, backgroundColor: appSettings.appearance.dictationButtonOrientation === 'horizontal' ? KLINO_COLORS.papelHondo : KLINO_COLORS.papel, padding: 16 }}
          >
            <View style={{ width: 24, height: 24, borderWidth: appSettings.appearance.dictationButtonOrientation === 'horizontal' ? 0 : 1, borderColor: KLINO_COLORS.borderStrong, backgroundColor: appSettings.appearance.dictationButtonOrientation === 'horizontal' ? KLINO_COLORS.verde : 'transparent', marginRight: 16, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <KlinoText variant="body" style={{ fontWeight: 'bold', marginBottom: 4 }}>Banda sobre la barra</KlinoText>
              <KlinoText variant="small" color={KLINO_COLORS.gris}>Barra verde de ancho completo arriba de la navegación. Imposible de no ver.</KlinoText>
            </View>
          </TouchableOpacity>
        </View>

        {/* CONSULTORIO */}
        <View style={{ marginBottom: 32 }}>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 16 }}>CONSULTORIO</KlinoText>
          <View style={{ borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
            <MenuItem title="Modos y formatos" subtitle="Consultorio y Hospital · 4 formatos" onPress={() => router.push('/formats')} />
            <MenuItem title="Avisos y recordatorios" subtitle="Pendientes, citas y resumen semanal" onPress={() => router.push('/notifications')} />
            <MenuItem title="Suscripción" subtitle="Mensual · siguiente cargo el 1 de septiembre" onPress={() => router.push('/subscription')} />
            <MenuItem title="Seguridad" subtitle="Huella, NIP y dispositivos" />
          </View>
        </View>

        {/* CERRAR SESIÓN */}
        <TouchableOpacity 
          activeOpacity={0.7} 
          onPress={handleLogout} 
          style={{ borderWidth: 1, borderColor: '#C05A3E', paddingVertical: 16, alignItems: 'center', marginBottom: 24, backgroundColor: KLINO_COLORS.papelHondo }}
        >
          <KlinoText variant="label" color="#C05A3E" style={{ fontWeight: 'bold' }}>CERRAR SESIÓN</KlinoText>
        </TouchableOpacity>

        {/* FOOTER */}
        <View style={{ alignItems: 'center', paddingBottom: 24 }}>
          <KlinoText variant="small" color={KLINO_COLORS.gris}>Klino v2.0 · Ravyn Studio</KlinoText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ title, subtitle, onPress }: any) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={onPress}
    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline }}
  >
    <View style={{ flex: 1, paddingRight: 16 }}>
      <KlinoText variant="body" style={{ fontWeight: 'bold', marginBottom: 4, fontSize: 18 }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{subtitle}</KlinoText>
    </View>
    <ChevronRight size={20} color={KLINO_COLORS.gris} strokeWidth={1.75} />
  </TouchableOpacity>
);
