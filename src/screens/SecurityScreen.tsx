import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { ArrowLeft, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

export default function SecurityScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="body" style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>SEGURIDAD</KlinoText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={{ marginBottom: 32 }}>
          <KlinoText variant="h2" style={{ marginBottom: 8 }}>Privacidad y acceso</KlinoText>
          <KlinoText variant="body" color={KLINO_COLORS.gris}>Configura las reglas de protección para tus expedientes.</KlinoText>
        </View>

        <View style={{ borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
          <MenuItem 
            label="Face ID / Touch ID" 
            value="Activado" 
            onPress={() => {
              Haptics.selectionAsync();
              Alert.alert('Face ID / Touch ID', 'La autenticación biométrica está activa.');
            }} 
          />
          <MenuItem 
            label="Cambiar NIP" 
            hasChevron 
            onPress={() => {
              Alert.alert('Cambiar NIP', 'Función en desarrollo');
            }} 
          />
          <MenuItem 
            label="Dispositivos vinculados" 
            value="1 sesión activa" 
            hasChevron 
            onPress={() => {
              Alert.alert('Dispositivos', 'Solo este dispositivo está activo.');
            }} 
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const MenuItem = ({ label, value, hasChevron, onPress }: any) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={onPress}
    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline }}
  >
    <KlinoText variant="body" style={{ fontWeight: 'bold' }}>{label}</KlinoText>
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      {value && <KlinoText variant="body" color={KLINO_COLORS.gris}>{value}</KlinoText>}
      {hasChevron && <ChevronRight size={20} color={KLINO_COLORS.gris} strokeWidth={1.75} />}
    </View>
  </TouchableOpacity>
);