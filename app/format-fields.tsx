import React, { useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform, TextInput } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../src/constants/theme';
import { KlinoText } from '../src/components/common/KlinoText';

export default function FormatFieldsScreen() {
  const router = useRouter();

  const [fields, setFields] = useState([
    { id: '1', value: 'Ficha de identificación', status: 'LEÍDO BIEN' },
    { id: '2', value: 'Antecedentes heredofamiliares', status: 'LEÍDO BIEN' },
    { id: '3', value: 'Antecedentes personales no patológicos', status: 'LEÍDO BIEN' },
    { id: '4', value: 'Antecedentes personales patológicos', status: 'LEÍDO BIEN' },
    { id: '5', value: 'Padecimiento actual', status: 'LEÍDO BIEN' },
    { id: '6', value: 'Interrogatoro por aparatos y sistemas', status: 'REVISAR' },
    { id: '7', value: 'Exploración física', status: 'LEÍDO BIEN' },
    { id: '8', value: 'Diagnósticos', status: 'LEÍDO BIEN' },
    { id: '9', value: 'Plan y pronóstico', status: 'LEÍDO BIEN' },
  ]);

  const updateField = (index: number, text: string) => {
    const newFields = [...fields];
    newFields[index].value = text;
    setFields(newFields);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
          </TouchableOpacity>
          <KlinoText variant="h2" style={{ fontSize: 20 }}>Campos del formato</KlinoText>
        </View>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 1.5, fontSize: 12 }}>HISTORIA CLÍNICA</KlinoText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 40 }}>
        
        <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ lineHeight: 24, marginBottom: 32, fontSize: 16 }}>
          Estos son los apartados que Klino leyó de tu hoja. Corrige el nombre de cualquiera que haya quedado mal escrito.
        </KlinoText>

        {fields.map((field, index) => {
          const isWarning = field.status === 'REVISAR';
          return (
            <View key={field.id} style={{ marginBottom: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 1.5 }}>
                  APARTADO {index + 1}
                </KlinoText>
                <KlinoText variant="label" color={isWarning ? KLINO_COLORS.ambarTinta : KLINO_COLORS.gris} style={{ letterSpacing: 1.5, fontWeight: isWarning ? 'bold' : 'normal' }}>
                  {field.status}
                </KlinoText>
              </View>
              
              <TextInput
                value={field.value}
                onChangeText={(text) => updateField(index, text)}
                style={{ 
                  borderWidth: 1, 
                  borderColor: isWarning ? KLINO_COLORS.ambar : KLINO_COLORS.borderStrong, 
                  backgroundColor: isWarning ? 'rgba(224, 145, 58, 0.05)' : KLINO_COLORS.papel, 
                  padding: 16, 
                  fontSize: 16, 
                  color: KLINO_COLORS.tinta 
                }}
              />
            </View>
          );
        })}

        <TouchableOpacity 
          activeOpacity={0.7}
          style={{ 
            borderWidth: 1, 
            borderColor: KLINO_COLORS.verde, 
            borderStyle: 'dashed',
            paddingVertical: 16, 
            alignItems: 'center',
            marginBottom: 16
          }}
        >
          <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>+ AGREGAR APARTADO</KlinoText>
        </TouchableOpacity>

        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.back()} // Mock action for now
          style={{ backgroundColor: KLINO_COLORS.verde, paddingVertical: 16, alignItems: 'center' }}
        >
          <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold', letterSpacing: 1 }}>GUARDAR FORMATO</KlinoText>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
