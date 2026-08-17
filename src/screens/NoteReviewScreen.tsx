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
          <KlinoText variant="body" style={{ fontWeight: 'bold' }}>Historia clínica</KlinoText>
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

        <TextInput
          multiline
          value={text}
          onChangeText={setText}
          editable={!approved}
          style={{
            fontFamily: KLINO_FONTS.bodyRegular,
            fontSize: 17,
            lineHeight: 17 * 1.62,
            color: KLINO_COLORS.tinta,
            marginBottom: 32,
            textAlignVertical: 'top',
          }}
        />

        {/* BLOQUE DE RECETA VINCULADA */}
        {(() => {
          const parts = text.split(/PLAN:|plan:/i);
          const planText = parts.length > 1 ? parts[1].trim() : '';
          
          const generatePDF = async () => {
            const html = `
              <html>
                <head>
                  <style>
                    body { font-family: 'Helvetica', sans-serif; color: #1E1F1A; padding: 40px; }
                    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #2A7D6F; padding-bottom: 20px; margin-bottom: 40px; }
                    .logo { font-size: 24px; font-weight: bold; color: #2A7D6F; letter-spacing: 2px; }
                    .dr-info { text-align: right; font-size: 14px; color: #737365; }
                    h1 { font-size: 20px; font-weight: bold; margin-bottom: 24px; }
                    .section { margin-bottom: 30px; }
                    .label { font-size: 12px; color: #737365; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 8px; }
                    .content { font-size: 16px; line-height: 1.6; white-space: pre-wrap; }
                    .footer { margin-top: 50px; border-top: 1px solid #DFDBD3; padding-top: 20px; font-size: 12px; color: #737365; text-align: center; }
                    .signature-box { width: 200px; border-bottom: 1px solid #1E1F1A; margin: 40px auto 10px; }
                  </style>
                </head>
                <body>
                  <div class="header">
                    <div class="logo">KLINO</div>
                    <div class="dr-info">
                      <strong>${doctorName || 'Dr. Médico'}</strong><br>
                      ${appSettings?.cedula ? 'Cédula: ' + appSettings.cedula : 'Cédula profesional en trámite'}<br>
                    </div>
                  </div>
                  
                  <div class="section">
                    <div class="label">PACIENTE</div>
                    <div class="content"><strong>${note?.name || 'Paciente'}</strong><br>Fecha: ${new Date().toLocaleDateString('es-MX')}</div>
                  </div>
                  
                  <div class="section">
                    <div class="label">PLAN E INDICACIONES MÉDICAS</div>
                    <div class="content">${planText}</div>
                  </div>
                  
                  <div class="signature-box"></div>
                  <div style="text-align: center; font-size: 14px;">Firma del Médico</div>
                  
                  <div class="footer">
                    Documento generado por Klino - Cumplimiento NOM-004-SSA3-2012
                  </div>
                </body>
              </html>
            `;
            try {
              const { uri } = await Print.printToFileAsync({ html });
              await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
            } catch (e) {
              console.error(e);
              Alert.alert('Error', 'No se pudo generar el PDF');
            }
          };

          return planText ? (
            <TouchableOpacity 
              onPress={generatePDF}
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
