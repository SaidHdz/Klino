import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KLINO_COLORS, KLINO_FONTS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { useProfile } from '../context/ProfileContext';
import * as Print from 'expo-print';
import { shareAsync } from 'expo-sharing';

export default function PrescriptionPreviewScreen() {
  const router = useRouter();
  const { id, profileId } = useLocalSearchParams();
  const { notes, profile, appSettings, doctorName } = useProfile();
  
  const pid = (Array.isArray(profileId) ? profileId[0] : profileId) || '1';
  const noteId = Array.isArray(id) ? id[0] : id;
  const note = (notes[pid] || []).find((n: any) => n.id === noteId);

  if (!note) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel, justifyContent: 'center', alignItems: 'center' }}>
        <KlinoText variant="body">Nota no encontrada</KlinoText>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 24 }}><KlinoText variant="label" color={KLINO_COLORS.verde}>VOLVER</KlinoText></TouchableOpacity>
      </SafeAreaView>
    );
  }

  const text = note.transcription || note.rawTranscription || '';
  let planText = '';
  
  if (note.clinicalData?.plan) {
    planText = note.clinicalData.plan;
  } else {
    const match = text.match(/(?:PLAN(?: TERAPÉUTICO)?|RECETA)(?: Y RECETA)?:\s*([\s\S]+?)(?=\n\n\*\*|\n\n[A-Z\sÁÉÍÓÚÑ]+:|$)/i);
    if (match) {
      planText = match[1].trim();
    } else {
      const parts = text.split(/PLAN:|plan:|RECETA:|receta:/i);
      planText = parts.length > 1 ? parts[1].trim() : '';
    }
  }

  // Parse plan into indications and footer text
  const indicationLines = planText.split('\n').filter(l => l.trim().length > 0);
  const medications: { main: string, sub: string }[] = [];
  const footers: string[] = [];

  indicationLines.forEach(line => {
    // Soporte para notas nuevas y viejas (remueve guiones, viñetas, asteriscos)
    const cleaned = line.replace(/^[•\-\s]+/, '').replace(/\*\*/g, '').trim();
    if (cleaned.toLowerCase().includes('cita') || cleaned.toLowerCase().includes('favor de') || (!cleaned.includes(',') && !cleaned.includes('-') && !cleaned.includes(':') && cleaned.length > 50)) {
      footers.push(cleaned);
    } else {
      // Intenta separar por ' - ', ':' o ','
      const splitChar = cleaned.includes(' - ') ? ' - ' : (cleaned.includes(':') ? ':' : ',');
      const parts = cleaned.split(splitChar);
      medications.push({ main: parts[0].trim(), sub: parts.slice(1).join(splitChar).trim() || '' });
    }
  });

  const isApproved = note.status === 'reviewed';
  const folio = note.id ? note.id.substring(0, 5).toUpperCase() : '0192';

  const generateHTML = () => `
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
          <div class="content"><strong>${note.name || 'Paciente'}</strong><br>Fecha: ${new Date(Number(note.time)).toLocaleDateString('es-MX')}</div>
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

  const handleShare = async () => {
    if (!isApproved) { Alert.alert('Receta no aprobada', 'Debes firmar la nota médica para enviar o imprimir la receta.'); return; }
    try {
      const { uri } = await Print.printToFileAsync({ html: generateHTML() });
      await shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf', dialogTitle: 'Compartir Receta' });
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar el PDF para compartir.');
    }
  };

  const handlePrint = async () => {
    if (!isApproved) { Alert.alert('Receta no aprobada', 'Debes firmar la nota médica para enviar o imprimir la receta.'); return; }
    try {
      await Print.printAsync({ html: generateHTML() });
    } catch (e) {
      Alert.alert('Error', 'No se pudo enviar al sistema de impresión.');
    }
  };

  const handlePDF = async () => {
    if (!isApproved) { Alert.alert('Receta no aprobada', 'Debes firmar la nota médica para descargar la receta.'); return; }
    try {
      const { uri } = await Print.printToFileAsync({ html: generateHTML() });
      Alert.alert('¡PDF Descargado!', 'La receta se ha generado correctamente. ¿Deseas guardarla o abrirla ahora?', [
        { text: 'Cerrar', style: 'cancel' },
        { text: 'Ver Archivo', onPress: () => shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' }) }
      ]);
    } catch (e) {
      Alert.alert('Error', 'No se pudo generar el PDF.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
          </TouchableOpacity>
          <KlinoText variant="h2" style={{ marginLeft: 16, fontSize: 20 }}>Receta</KlinoText>
        </View>
        <TouchableOpacity onPress={() => router.push({ pathname: '/note-review', params: { id: noteId, profileId: pid } })}>
          <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ letterSpacing: 1, fontWeight: 'bold' }}>EDITAR</KlinoText>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        
        {/* RECETA CARD */}
        <View style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, backgroundColor: KLINO_COLORS.papel }}>
          
          {/* DOCTOR INFO */}
          <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{doctorName || 'Dr. Médico'}</KlinoText>
              <KlinoText variant="small" color={KLINO_COLORS.gris}>{profile} · Ced. prof. {appSettings?.cedula || 'En trámite'}</KlinoText>
            </View>
            <View style={{ width: 24, height: 24, backgroundColor: KLINO_COLORS.verde, justifyContent: 'center', alignItems: 'center' }}>
              <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold', fontSize: 12 }}>K</KlinoText>
            </View>
          </View>

          {/* PACIENTE INFO */}
          <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
            <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 8 }}>PACIENTE</KlinoText>
            <KlinoText variant="body" style={{ fontSize: 18 }}>
              {note.name || 'Paciente'} · {new Date(Number(note.time)).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}
            </KlinoText>
          </View>

          {/* INDICACIONES */}
          <View style={{ padding: 24, paddingBottom: 8, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
            <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 16 }}>INDICACIONES</KlinoText>
            
            {medications.length === 0 ? (
              <View style={{ marginBottom: 16 }}>
                <KlinoText variant="body" style={{ fontSize: 18, lineHeight: 28 }}>
                  {planText.replace(/\*\*/g, '').trim()}
                </KlinoText>
              </View>
            ) : (
              medications.map((med, idx) => (
                <View key={idx} style={{ paddingBottom: idx < medications.length - 1 ? 16 : 0, marginBottom: 16, borderBottomWidth: idx < medications.length - 1 ? 1 : 0, borderColor: KLINO_COLORS.borderHairline }}>
                  <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{med.main}</KlinoText>
                  {med.sub ? <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ fontSize: 16 }}>{med.sub}</KlinoText> : null}
                </View>
              ))
            )}

            {medications.length > 0 && footers.map((footer, idx) => (
              <KlinoText key={idx} variant="body" color={KLINO_COLORS.gris} style={{ fontSize: 16, marginTop: medications.length > 0 && idx === 0 ? 16 : 0, marginBottom: 8 }}>
                {footer}
              </KlinoText>
            ))}
          </View>

          {/* APROBADA STATUS */}
          <View style={{ padding: 24, backgroundColor: KLINO_COLORS.papelHondo, flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ borderWidth: 1, borderColor: isApproved ? KLINO_COLORS.verde : KLINO_COLORS.ambar, paddingHorizontal: 12, paddingVertical: 6, marginRight: 16 }}>
              <KlinoText variant="label" color={isApproved ? KLINO_COLORS.verde : KLINO_COLORS.ambar} style={{ fontWeight: 'bold', letterSpacing: 1 }}>{isApproved ? 'APROBADA' : 'SIN APROBAR'}</KlinoText>
            </View>
            <View style={{ flex: 1 }}>
              <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ flexWrap: 'wrap' }}>Folio KL-{folio} · {new Date(Number(note.time)).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</KlinoText>
            </View>
          </View>

        </View>

        {/* BOTONES */}
        <View style={{ marginTop: 24, gap: 16 }}>
          <TouchableOpacity onPress={handleShare} style={{ backgroundColor: KLINO_COLORS.verde, paddingVertical: 16, alignItems: 'center' }}>
            <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold', letterSpacing: 1 }}>ENVIAR AL PACIENTE</KlinoText>
          </TouchableOpacity>
          
          <View style={{ flexDirection: 'row', gap: 16 }}>
            <TouchableOpacity onPress={handlePrint} style={{ flex: 1, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingVertical: 16, alignItems: 'center' }}>
              <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', letterSpacing: 1 }}>IMPRIMIR</KlinoText>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handlePDF} style={{ flex: 1, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingVertical: 16, alignItems: 'center' }}>
              <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', letterSpacing: 1 }}>PDF</KlinoText>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
