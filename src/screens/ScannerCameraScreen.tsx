import React from 'react';
import { View, SafeAreaView, TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

export default function ScannerCameraScreen() {
  const router = useRouter();

  const handleCapture = () => {
    // Navigate to assignment screen
    router.push('/scanner-assign');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.tinta }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.papel} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="label" color={KLINO_COLORS.ambar} style={{ letterSpacing: 2 }}>HISTORIA CLÍNICA</KlinoText>
        <View style={{ width: 24 }} /> {/* Espaciador para centrar el título */}
      </View>

      {/* VIEWPORT SIMULADO DE CÁMARA */}
      <View style={{ flex: 1, marginHorizontal: 24, marginTop: 16, marginBottom: 32, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
        
        {/* Esquinas Naranjas */}
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />

        {/* Dummy Graphic de texto */}
        <View style={{ width: '80%', gap: 16 }}>
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', width: '100%' }} />
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', width: '80%' }} />
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', width: '90%' }} />
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', width: '60%' }} />
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', width: '85%' }} />
          <View style={{ height: 8, backgroundColor: 'rgba(255,255,255,0.2)', width: '70%' }} />
        </View>

      </View>

      {/* TEXTO Y BOTONES */}
      <View style={{ paddingHorizontal: 24, paddingBottom: Platform.OS === 'android' ? 40 : 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <KlinoText variant="body" color={KLINO_COLORS.ambar} style={{ textAlign: 'center', lineHeight: 24 }}>
            Encuadra la hoja completa. Si son varias, se van agregando.
          </KlinoText>
        </View>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleCapture}
          style={{ backgroundColor: KLINO_COLORS.papel, paddingVertical: 20, alignItems: 'center', marginBottom: 16 }}
        >
          <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', letterSpacing: 1 }}>CAPTURAR HOJA</KlinoText>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          style={{ borderWidth: 1, borderColor: KLINO_COLORS.papel, paddingVertical: 20, alignItems: 'center' }}
        >
          <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold', letterSpacing: 1 }}>ELEGIR DE LA GALERÍA</KlinoText>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  corner: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderColor: KLINO_COLORS.ambar,
  },
  topLeft: {
    top: 24,
    left: 24,
    borderTopWidth: 2,
    borderLeftWidth: 2,
  },
  topRight: {
    top: 24,
    right: 24,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  bottomLeft: {
    bottom: 24,
    left: 24,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
  },
  bottomRight: {
    bottom: 24,
    right: 24,
    borderBottomWidth: 2,
    borderRightWidth: 2,
  }
});
