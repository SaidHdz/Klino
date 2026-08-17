import React, { useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { ArrowLeft, FileText, Pencil, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

export default function FormatsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ver' | 'agregar'>('ver');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="h2" style={{ fontSize: 20 }}>Formatos</KlinoText>
      </View>

      {/* TABS */}
      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderTopWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setActiveTab('ver')}
          style={{ flex: 1, backgroundColor: activeTab === 'ver' ? KLINO_COLORS.verde : KLINO_COLORS.papel, paddingVertical: 16, alignItems: 'center', borderRightWidth: 1, borderColor: KLINO_COLORS.borderStrong }}
        >
          <KlinoText variant="label" color={activeTab === 'ver' ? KLINO_COLORS.papel : KLINO_COLORS.gris} style={{ letterSpacing: 1, fontWeight: 'bold' }}>VER FORMATOS</KlinoText>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => setActiveTab('agregar')}
          style={{ flex: 1, backgroundColor: activeTab === 'agregar' ? KLINO_COLORS.verde : KLINO_COLORS.papel, paddingVertical: 16, alignItems: 'center' }}
        >
          <KlinoText variant="label" color={activeTab === 'agregar' ? KLINO_COLORS.papel : KLINO_COLORS.gris} style={{ letterSpacing: 1, fontWeight: 'bold' }}>AGREGAR FORMATO</KlinoText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        
        {/* TEXTO DESCRIPTIVO */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ lineHeight: 24, fontSize: 16 }}>
            Formatos guardados en el modo Consultorio. Klino usa sus campos al dictar y al escanear.
          </KlinoText>
        </View>

        {/* LISTA DE FORMATOS */}
        <FormatItem 
          title="Historia clínica · Consultorio"
          subtitle="9 apartados · escaneada el 3 mar"
        />
        <FormatItem 
          title="Nota de evolución SOAP"
          subtitle="4 apartados · formato base de Klino"
        />
        <FormatItem 
          title="Receta membretada"
          subtitle="3 apartados · escaneada el 12 feb"
        />

        {/* TEXTO INFERIOR */}
        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ lineHeight: 24, fontSize: 16 }}>
            Si borras un formato, los documentos que ya se guardaron con él no se tocan.
          </KlinoText>
        </View>

      </ScrollView>

    </SafeAreaView>
  );
}

const FormatItem = ({ title, subtitle }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
    
    <View style={{ width: 40, height: 48, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, justifyContent: 'center', alignItems: 'center', marginRight: 16, backgroundColor: KLINO_COLORS.papelHondo }}>
      <FileText size={20} color={KLINO_COLORS.gris} strokeWidth={1.5} />
    </View>

    <View style={{ flex: 1, paddingRight: 16 }}>
      <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ lineHeight: 18 }}>{subtitle}</KlinoText>
    </View>

    <View style={{ flexDirection: 'row', gap: 12 }}>
      <TouchableOpacity activeOpacity={0.7} style={{ width: 40, height: 40, borderWidth: 1, borderColor: KLINO_COLORS.verde, justifyContent: 'center', alignItems: 'center' }}>
        <Pencil size={18} color={KLINO_COLORS.verde} strokeWidth={2} />
      </TouchableOpacity>
      <TouchableOpacity activeOpacity={0.7} style={{ width: 40, height: 40, borderWidth: 1, borderColor: '#DC2626', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(220, 38, 38, 0.05)' }}>
        <Trash2 size={18} color="#DC2626" strokeWidth={2} />
      </TouchableOpacity>
    </View>

  </View>
);
