import React from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { X, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

export default function ScannerSelectScreen() {
  const router = useRouter();

  const handleSelect = () => {
    router.push('/scanner-camera');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <X size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="body" style={{ fontWeight: 'bold' }}>Escanear documento</KlinoText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingVertical: 32, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        <View style={{ marginBottom: 32 }}>
          <KlinoText variant="h2" style={{ fontSize: 28, marginBottom: 12 }}>¿Qué estás escaneando?</KlinoText>
          <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ lineHeight: 24 }}>
            Klino lo lee y lo acomoda en el apartado correcto del expediente.
          </KlinoText>
        </View>

        <View style={{ gap: 16 }}>
          <ScannerOption 
            title="Historia clínica" 
            subtitle="Hoja completa de primera vez" 
            onPress={handleSelect}
          />
          <ScannerOption 
            title="Nota de evolución" 
            subtitle="Seguimiento escrito a mano" 
            onPress={handleSelect}
          />
          <ScannerOption 
            title="Receta" 
            subtitle="Medicamentos e indicaciones" 
            onPress={handleSelect}
          />
          <ScannerOption 
            title="Laboratorios" 
            subtitle="Resultados impresos del laboratorio" 
            onPress={handleSelect}
          />
          <ScannerOption 
            title="Estudio de imagen" 
            subtitle="Radiografía, ultrasonido, tomografía" 
            onPress={handleSelect}
          />
          <ScannerOption 
            title="Nota de referencia" 
            subtitle="Envío o contrarreferencia de otro médico" 
            onPress={handleSelect}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const ScannerOption = ({ title, subtitle, onPress }: any) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={onPress}
    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, backgroundColor: KLINO_COLORS.papel }}
  >
    <View style={{ flex: 1, paddingRight: 16 }}>
      <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{subtitle}</KlinoText>
    </View>
    <ArrowRight size={20} color={KLINO_COLORS.gris} strokeWidth={1.5} />
  </TouchableOpacity>
);
