import React from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { ArrowLeft, FileText, Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

export default function ScannerAssignScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="body" style={{ fontWeight: 'bold' }}>Asignar documento</KlinoText>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* DOCUMENT INFO */}
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <View style={{ width: 48, height: 60, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, justifyContent: 'center', alignItems: 'center', marginRight: 16, backgroundColor: KLINO_COLORS.papelHondo }}>
            <FileText size={24} color={KLINO_COLORS.gris} strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Historia clínica · 1 hoja</KlinoText>
            <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ lineHeight: 18 }}>
              Leída completa. Klino detectó nombre y fecha.
            </KlinoText>
          </View>
        </View>

        {/* PACIENTE */}
        <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 16 }}>¿A QUIÉN PERTENECE?</KlinoText>
          
          <View style={{ backgroundColor: KLINO_COLORS.papelHondo, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, padding: 20, flexDirection: 'row', alignItems: 'flex-start', marginBottom: 16 }}>
            <View style={{ width: 24, height: 24, backgroundColor: KLINO_COLORS.verde, marginTop: 2, marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Ramiro Cepeda</KlinoText>
              <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ lineHeight: 18 }}>Coincide con el nombre de la hoja · Exp. KL-0192</KlinoText>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingHorizontal: 16, paddingVertical: 16, marginBottom: 16 }}>
            <Search size={20} color={KLINO_COLORS.gris} strokeWidth={1.5} style={{ marginRight: 12 }} />
            <TextInput 
              placeholder="Buscar otro paciente"
              style={{ flex: 1, fontFamily: 'serif', fontSize: 16, color: KLINO_COLORS.tinta }}
            />
          </View>

          <TouchableOpacity style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, borderStyle: 'dashed', paddingVertical: 16, alignItems: 'center' }}>
            <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>+ CREAR PACIENTE NUEVO</KlinoText>
          </TouchableOpacity>
        </View>

        {/* DATOS LEIDOS */}
        <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 16 }}>DATOS LEÍDOS</KlinoText>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
            <KlinoText variant="body" color={KLINO_COLORS.gris}>Fecha del documento</KlinoText>
            <KlinoText variant="body">3 de marzo de 2026</KlinoText>
          </View>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16 }}>
            <KlinoText variant="body" color={KLINO_COLORS.gris}>Emitido por</KlinoText>
            <KlinoText variant="body">Lab. Cendiag</KlinoText>
          </View>
        </View>

        {/* ACCIONES */}
        <View style={{ padding: 24, gap: 16 }}>
          <TouchableOpacity 
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/records')}
            style={{ backgroundColor: KLINO_COLORS.verde, paddingVertical: 20, alignItems: 'center' }}
          >
            <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold', letterSpacing: 1 }}>GUARDAR EN EL EXPEDIENTE</KlinoText>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8}
            style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingVertical: 20, alignItems: 'center' }}
          >
            <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', letterSpacing: 1 }}>AGREGAR OTRA HOJA</KlinoText>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
