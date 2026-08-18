import React, { useState, useRef } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, TextInput, Platform, Animated, Alert } from 'react-native';
import { ArrowLeft, ArrowRight } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';
import { KLINO_COLORS, KLINO_FONTS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { KlinoBadge } from '../components/common/KlinoBadge';
import { useProfile } from '../context/ProfileContext';

export default function NoteReviewScreen() {
  const router = useRouter();
  const { id, profileId } = useLocalSearchParams();
  const { notes, confirmNote, doctorName, appSettings, updateNoteContent } = useProfile();
  
  const note = React.useMemo(() => {
    if (!id || !profileId || !notes[profileId as string]) return null;
    return notes[profileId as string].find(n => n.id === id);
  }, [id, profileId, notes]);

  const [approved, setApproved] = useState(note?.status === 'reviewed');
  const fillAnim = useRef(new Animated.Value(0)).current;

  const [text, setText] = useState(note?.transcription || 'Sin contenido transcrito.');
  const [patientName, setPatientName] = useState(note?.name || 'Paciente');

  // Sincronizar el texto si la nota cambia (por primera carga)
  React.useEffect(() => {
    if (note?.transcription) {
      setText(note.transcription);
      setPatientName(note.name || 'Paciente');
      setApproved(note.status === 'reviewed');
    }
  }, [note]);

  const handleApprove = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setApproved(true);
    if (note && profileId) {
      await updateNoteContent(profileId as string, note.id, text, patientName);
      confirmNote(profileId as string, note.id);
    }
  };

  const handlePressIn = () => {
    if (approved) return;
    Animated.timing(fillAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        handleApprove();
      }
    });
  };

  const handlePressOut = () => {
    if (approved) return;
    Animated.timing(fillAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const widthInterpolate = fillAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%']
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* ENCABEZADO */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
          </TouchableOpacity>
          <KlinoText variant="body" style={{ fontWeight: 'bold' }}>{note?.specialty || 'Consulta general'}</KlinoText>
        </View>
        {!approved && <KlinoBadge label="SIN APROBAR" variant="amber" />}
        {approved && <KlinoBadge label="FIRMADA" variant="green" />}
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 24, paddingBottom: 150 }} showsVerticalScrollIndicator={false}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 16 }}>HOY · {note?.time ? new Date(Number(note.time)).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '16:30'}</KlinoText>
        <TextInput 
          value={patientName}
          onChangeText={setPatientName}
          editable={!approved}
          style={{
            fontFamily: KLINO_FONTS.headingBold,
            fontSize: 28,
            color: KLINO_COLORS.tinta,
            marginBottom: 4,
            padding: 0
          }}
        />
        <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ marginBottom: 32 }}>
          Exp. KL-{note?.id?.slice(0,4) || '0192'} · Consultorio · {approved ? 'Aprobada' : 'toca el texto para corregir'}
        </KlinoText>

        <View style={{ marginBottom: 32 }}>
          {!approved ? (
            <TextInput
              multiline
              value={text}
              onChangeText={setText}
              style={{
                fontSize: 17, 
                lineHeight: 17 * 1.62, 
                fontFamily: KLINO_FONTS.bodyRegular,
                color: KLINO_COLORS.tinta,
                minHeight: 300,
                textAlignVertical: 'top'
              }}
            />
          ) : (
            <KlinoText variant="body" style={{ fontSize: 17, lineHeight: 17 * 1.62, fontFamily: KLINO_FONTS.bodyRegular }}>
              {text.replace(/\*\*/g, '')}
            </KlinoText>
          )}
        </View>

        {/* BLOQUE DE RECETA VINCULADA */}
        {(() => {
          let planText = '';
          if (text.toUpperCase().includes('RECETA:')) {
            planText = text.split(/RECETA:/i)[1]?.trim() || '';
          } else if (text.toUpperCase().includes('PLAN:')) {
            planText = text.split(/PLAN:/i)[1]?.trim() || '';
          }
          
          return planText ? (
            <TouchableOpacity 
              onPress={() => router.push(`/prescription-preview?id=${note?.id}&profileId=${profileId}`)}
              style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, padding: 16, backgroundColor: KLINO_COLORS.papelHondo }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <KlinoText variant="label" color={KLINO_COLORS.gris}>RECETA / PLAN (TOCA PARA IMPRIMIR PDF)</KlinoText>
                <ArrowRight size={16} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
              </View>
              <KlinoText variant="small">
                {planText.length > 80 ? planText.substring(0, 80) + '...' : planText}
              </KlinoText>
            </TouchableOpacity>
          ) : null;
        })()}

      </ScrollView>

      {/* BOTÓN DE APROBACIÓN (GESTO DELIBERADO ANIMADO) */}
      <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: 24, backgroundColor: KLINO_COLORS.papel, borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
        {!approved ? (
          <TouchableOpacity 
            activeOpacity={1}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={{
              borderWidth: 1,
              borderColor: KLINO_COLORS.borderStrong,
              backgroundColor: KLINO_COLORS.papelHondo,
              paddingVertical: 20,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
             <Animated.View style={{
               position: 'absolute',
               left: 0, top: 0, bottom: 0,
               backgroundColor: KLINO_COLORS.verde,
               width: widthInterpolate
             }} />
             <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ zIndex: 1 }}>
               MANTÉN PRESIONADO PARA APROBAR
             </KlinoText>
          </TouchableOpacity>
        ) : (
          <View style={{
            backgroundColor: KLINO_COLORS.papelHondo,
            paddingVertical: 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: KLINO_COLORS.borderStrong,
          }}>
             <KlinoText variant="label" color={KLINO_COLORS.tinta}>SELLO, FOLIO Y CÉDULA</KlinoText>
          </View>
        )}
      </View>

    </SafeAreaView>
  );
}
