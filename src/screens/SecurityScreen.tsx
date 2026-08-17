import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform, Switch } from 'react-native';
import { ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

export default function SecurityScreen() {
  const router = useRouter();
  const [huellaAcceso, setHuellaAcceso] = useState(true);
  const [huellaEdicion, setHuellaEdicion] = useState(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="h3" style={{ fontSize: 18 }}>Seguridad</KlinoText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        
        {/* ACCESO */}
        <SectionTitle title="ACCESO" />
        
        <ToggleItem 
          title="Entrar con huella" 
          desc="Sin escribir contraseña" 
          value={huellaAcceso} 
          onToggle={() => {
            Haptics.selectionAsync();
            setHuellaAcceso(!huellaAcceso);
          }} 
        />
        
        <ToggleItem 
          title="Huella para desbloquear edición" 
          desc="Se pide al editar un documento aprobado" 
          value={huellaEdicion} 
          onToggle={() => {
            Haptics.selectionAsync();
            setHuellaEdicion(!huellaEdicion);
          }} 
        />
        
        <NavigationItem 
          title="NIP de respaldo" 
          desc="Cambiado hace 2 meses" 
          onPress={() => {}} 
        />
        
        {/* REGISTRO */}
        <View style={{ marginTop: 40 }}>
          <SectionTitle title="REGISTRO" />
          
          <NavigationItem 
            title="Dispositivos con sesión" 
            desc="Este teléfono y una tableta" 
            onPress={() => {}} 
          />
          
          <NavigationItem 
            title="Bitácora de cambios" 
            desc="Quién abrió, editó y aprobó · 90 días" 
            onPress={() => {}} 
          />
        </View>

        {/* INFO CADA EXPEDIENTE */}
        <View style={{ marginTop: 40, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, backgroundColor: KLINO_COLORS.papelHondo || KLINO_COLORS.papel, padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <ShieldCheck size={24} color={KLINO_COLORS.verde} strokeWidth={1.75} style={{ marginRight: 16 }} />
          <KlinoText variant="body" style={{ flex: 1, fontSize: 15, lineHeight: 22 }}>
            Los expedientes viajan cifrados y solo tú los abres. Cifrado AES-256.
          </KlinoText>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const SectionTitle = ({ title }: { title: string }) => (
  <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 16 }}>{title}</KlinoText>
);

const ToggleItem = ({ title, desc, value, onToggle }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
    <View style={{ flex: 1, paddingRight: 16 }}>
      <KlinoText variant="body" style={{ fontSize: 18, marginBottom: 4 }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{desc}</KlinoText>
    </View>
    <TouchableOpacity 
      activeOpacity={0.8}
      onPress={onToggle} 
      style={{ 
        width: 50, 
        height: 28, 
        backgroundColor: value ? KLINO_COLORS.verde : KLINO_COLORS.papel, 
        borderWidth: 1, 
        borderColor: KLINO_COLORS.tinta, 
        flexDirection: 'row', 
        padding: 2, 
        alignItems: 'center', 
        justifyContent: value ? 'flex-end' : 'flex-start' 
      }}
    >
      <View style={{ width: 22, height: 22, backgroundColor: KLINO_COLORS.papel, borderWidth: 1, borderColor: KLINO_COLORS.tinta }} />
    </TouchableOpacity>
  </View>
);

const NavigationItem = ({ title, desc, onPress }: any) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={onPress} 
    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}
  >
    <View style={{ flex: 1, paddingRight: 16 }}>
      <KlinoText variant="body" style={{ fontSize: 18, marginBottom: 4 }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{desc}</KlinoText>
    </View>
    <ArrowRight size={20} color={KLINO_COLORS.gris} strokeWidth={1.5} />
  </TouchableOpacity>
);