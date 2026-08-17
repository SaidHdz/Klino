import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { ArrowLeft, ArrowDown } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

export default function SubscriptionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="h2" style={{ fontSize: 20 }}>Suscripción</KlinoText>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        
        {/* TARJETA TU PLAN */}
        <View style={{ backgroundColor: KLINO_COLORS.verde, padding: 24, marginBottom: 40 }}>
          <KlinoText variant="label" color={KLINO_COLORS.papelHondo} style={{ letterSpacing: 2, marginBottom: 12 }}>TU PLAN</KlinoText>
          <KlinoText variant="h1" color={KLINO_COLORS.papel} style={{ fontSize: 36, marginBottom: 8 }}>Mensual</KlinoText>
          <KlinoText variant="body" color={KLINO_COLORS.papelHondo} style={{ lineHeight: 24, marginBottom: 24 }}>
            $250 al mes por médico. Siguiente cargo el 1 de septiembre.
          </KlinoText>
          
          <View style={{ height: 1, backgroundColor: 'rgba(244, 241, 234, 0.2)', marginBottom: 16 }} />
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <KlinoText variant="body" color={KLINO_COLORS.papelHondo}>Documentos de este mes</KlinoText>
            <KlinoText variant="body" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold' }}>214</KlinoText>
          </View>
        </View>

        {/* CAMBIAR */}
        <View style={{ marginBottom: 40 }}>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 16 }}>CAMBIAR</KlinoText>
          
          {/* Plan Anual */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginBottom: 16, backgroundColor: KLINO_COLORS.papelHondo }}>
            <View style={{ flex: 1 }}>
              <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Anual</KlinoText>
              <KlinoText variant="small" color={KLINO_COLORS.gris}>$2,500 al año. Dos meses libres.</KlinoText>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>CAMBIAR</KlinoText>
            </TouchableOpacity>
          </View>

          {/* Plan Consultorio */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, backgroundColor: KLINO_COLORS.papelHondo }}>
            <View style={{ flex: 1 }}>
              <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Consultorio</KlinoText>
              <KlinoText variant="small" color={KLINO_COLORS.gris}>Varios médicos, una sola factura.</KlinoText>
            </View>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>VER</KlinoText>
            </TouchableOpacity>
          </View>
        </View>

        {/* RECIBOS */}
        <View>
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 8 }}>RECIBOS</KlinoText>
          <View style={{ borderTopWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
            
            <ReceiptItem 
              date="1 de agosto"
              amount="$290 con IVA"
            />
            
            <ReceiptItem 
              date="1 de julio"
              amount="$290 con IVA"
            />

          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const ReceiptItem = ({ date, amount }: any) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}
  >
    <View style={{ flex: 1 }}>
      <KlinoText variant="body" style={{ fontSize: 18, marginBottom: 4 }}>{date}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{amount}</KlinoText>
    </View>
    <ArrowDown size={20} color={KLINO_COLORS.gris} strokeWidth={1.5} />
  </TouchableOpacity>
);
