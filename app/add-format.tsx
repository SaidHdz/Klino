import React from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { ArrowLeft, Check, ArrowRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../src/constants/theme';
import { KlinoText } from '../src/components/common/KlinoText';

export default function AddFormatScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="h2" style={{ fontSize: 20 }}>Agregar formato</KlinoText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        {/* PASO 1 */}
        <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ letterSpacing: 1.5, marginBottom: 16 }}>
          PASO 1 · ESCANEA TU HOJA
        </KlinoText>

        <View style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, backgroundColor: KLINO_COLORS.papelHondo, padding: 20, marginBottom: 40 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 48, height: 48, backgroundColor: KLINO_COLORS.papel, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
              <Check size={24} color={KLINO_COLORS.verde} strokeWidth={2} />
            </View>
            <View style={{ flex: 1 }}>
              <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>Hoja capturada</KlinoText>
              <KlinoText variant="small" color={KLINO_COLORS.gris}>Klino encontró 9 apartados</KlinoText>
            </View>
          </View>
          <TouchableOpacity style={{ alignSelf: 'flex-start' }}>
            <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold' }}>VOLVER A ESCANEAR</KlinoText>
          </TouchableOpacity>
        </View>

        {/* PASO 2 */}
        <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ letterSpacing: 1.5, marginBottom: 8 }}>
          PASO 2 · ¿QUÉ TIPO DE FORMATO ES?
        </KlinoText>
        <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ marginBottom: 24, lineHeight: 22 }}>
          Define cómo se interpretará lo que dictes o escanees con este formato.
        </KlinoText>

        <FormatOption 
          title="Historia clínica" 
          subtitle="Ficha, antecedentes, exploración, diagnósticos"
          onPress={() => router.push('/format-fields')} 
        />
        <FormatOption 
          title="Nota de evolución" 
          subtitle="Subjetivo, objetivo, análisis, plan"
          onPress={() => router.push('/format-fields')} 
        />
        <FormatOption 
          title="Receta" 
          subtitle="Encabezado, medicamentos, indicaciones"
          onPress={() => router.push('/format-fields')} 
        />

        <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ marginTop: 8 }}>
          El formato se guarda solo en el modo Consultorio.
        </KlinoText>

      </ScrollView>
    </SafeAreaView>
  );
}

const FormatOption = ({ title, subtitle, onPress }: { title: string, subtitle: string, onPress: () => void }) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={onPress}
    style={{ 
      flexDirection: 'row', 
      alignItems: 'center', 
      borderWidth: 1, 
      borderColor: KLINO_COLORS.borderStrong, 
      padding: 20, 
      marginBottom: 16,
      backgroundColor: KLINO_COLORS.papel 
    }}
  >
    <View style={{ flex: 1, paddingRight: 16 }}>
      <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{subtitle}</KlinoText>
    </View>
    <ArrowRight size={20} color={KLINO_COLORS.gris} strokeWidth={1.5} />
  </TouchableOpacity>
);
