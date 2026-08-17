import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

export default function NotificationsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
          </TouchableOpacity>
          <KlinoText variant="h2" style={{ fontSize: 20 }}>Avisos</KlinoText>
        </View>
        <TouchableOpacity>
          <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ letterSpacing: 1, fontWeight: 'bold' }}>MARCAR LEÍDOS</KlinoText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* SECCIÓN HOY */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>HOY</KlinoText>
        </View>

        {/* Notificación No leída */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 20, backgroundColor: KLINO_COLORS.papelHondo, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <View style={{ width: 20, height: 20, backgroundColor: KLINO_COLORS.ambar, marginTop: 2, marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>3 documentos esperan tu aprobación</KlinoText>
            <KlinoText variant="small" color={KLINO_COLORS.gris}>Historia clínica de Said, nota de Lucía y una receta</KlinoText>
          </View>
        </View>

        {/* Notificación Leída */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 20, backgroundColor: KLINO_COLORS.papel, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <View style={{ width: 20, height: 20, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, justifyContent: 'center', alignItems: 'center', marginTop: 2, marginRight: 16 }}>
            <Check size={14} color={KLINO_COLORS.verde} strokeWidth={2.5} />
          </View>
          <View style={{ flex: 1 }}>
            <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Ramiro Cepeda confirmó su cita</KlinoText>
            <KlinoText variant="small" color={KLINO_COLORS.gris}>Hoy 16:30 · respondió por WhatsApp</KlinoText>
          </View>
        </View>

        {/* SECCIÓN DOMINGO PASADO */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 12, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>DOMINGO PASADO</KlinoText>
        </View>

        {/* Resumen Semanal Card */}
        <TouchableOpacity activeOpacity={0.9} style={{ backgroundColor: KLINO_COLORS.verde, padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <KlinoText variant="label" color={KLINO_COLORS.papelHondo} style={{ letterSpacing: 2 }}>RESUMEN SEMANAL</KlinoText>
            <ChevronRight size={20} color={KLINO_COLORS.papelHondo} strokeWidth={1.75} />
          </View>
          <KlinoText variant="h2" color={KLINO_COLORS.papel} style={{ fontSize: 28, marginBottom: 8 }}>Te ahorraste 6 h 40 m</KlinoText>
          <KlinoText variant="small" color={KLINO_COLORS.papelHondo} style={{ lineHeight: 20, marginBottom: 32 }}>74 documentos dictados · 71 aprobados · 41 s en promedio para aprobar</KlinoText>
          
          {/* Gráfico de barras simplificado */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 40 }}>
            <View style={{ flex: 1, height: 12, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 16, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 14, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 24, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 20, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 32, backgroundColor: KLINO_COLORS.ambar, marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 18, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
          </View>
        </TouchableOpacity>

        {/* Notificación Simple */}
        <View style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 20, backgroundColor: KLINO_COLORS.papel }}>
          <View style={{ width: 20, height: 20, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginTop: 2, marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Tu recibo de agosto está listo</KlinoText>
            <KlinoText variant="small" color={KLINO_COLORS.gris}>1 de agosto</KlinoText>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}