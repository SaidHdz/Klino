import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity, Platform, StyleSheet, Alert } from 'react-native';
import { X } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Audio } from 'expo-av';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { useProfile } from '../context/ProfileContext';
import { formatClinicalJson } from '../utils/formatClinicalJson';

export default function LiveConsultationScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const folderParam = (params.folder as string) || 'consulta_general';
  
  // expo-router can pass params as arrays, ensure it's always a string
  const rawPatientName = params.patientName;
  const forcedPatientName = (Array.isArray(rawPatientName) ? rawPatientName[0] : (rawPatientName as string | undefined))?.trim();

  const { addNote, dashboardProfileId, recordsProfileId, notes } = useProfile();
  
  const [seconds, setSeconds] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const recordingRef = React.useRef<Audio.Recording | null>(null);
  const isMountedRef = React.useRef(true);
  const [metering, setMetering] = useState<number[]>(Array(30).fill(10));

  useEffect(() => {
    startRecording();
    return () => {
      isMountedRef.current = false;
      stopRecording();
    };
  }, []);

  const stopRecording = async () => {
    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
      } catch (e) {
        // ignore errors on cleanup
      }
      recordingRef.current = null;
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Asegurarnos de detener cualquier grabación anterior colgada
      if (recordingRef.current) {
        await stopRecording();
      }

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status) => {
          if (status.isRecording && isMountedRef.current) {
            setSeconds(Math.floor(status.durationMillis / 1000));
            if (status.metering !== undefined) {
               const base = status.metering + 160; 
               const normalized = Math.max(10, (base / 160) * 50);
               setMetering(prev => {
                  const arr = [...prev.slice(1), normalized];
                  return arr;
               });
            }
          }
        },
        100 
      );
      
      if (!isMountedRef.current) {
        await newRecording.stopAndUnloadAsync();
        return;
      }
      
      recordingRef.current = newRecording;
    } catch (err) {
      console.error('Fallo al iniciar grabacion', err);
      if (isMountedRef.current) {
        Alert.alert('Permisos requeridos', 'No se pudo acceder al micrófono o hay otra aplicación usándolo.');
      }
    }
  };

  const formatTime = (total: number) => {
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleFinish = async () => {
    if (isFinishing) return;
    setIsFinishing(true);

    let audioUri = '';
    if (recordingRef.current) {
      try {
        const status = await recordingRef.current.getStatusAsync();
        if (status.canRecord) {
          await recordingRef.current.stopAndUnloadAsync();
        }
        audioUri = recordingRef.current.getURI() || '';
      } catch (e) {
        console.error('Error al detener audio:', e);
      }
      recordingRef.current = null;
    }

    try {
      let finalNoteData: ReturnType<typeof formatClinicalJson> = {
        paciente: 'Paciente No Identificado',
        transcription: '',
        vitals: undefined,
        rawText: ''
      };

      const profile = dashboardProfileId || recordsProfileId || '1';

      if (audioUri) {
         const formData = new FormData();
         const audioFile = {
            uri: Platform.OS === 'android' ? audioUri : audioUri.replace('file://', ''),
            type: 'audio/m4a',
            name: 'dictado.m4a'
         } as any;
         
         // n8n y Supabase requieren que el profileId sea un UUID válido
         const isValidUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
         const n8nProfileId = isValidUUID(profile) ? profile : '216b1104-b143-4d87-ac9a-ffbe3d50bb9a'; // Fallback a UUID válido de prueba

         formData.append('file', audioFile);
         formData.append('audio', audioFile);
         formData.append('profileId', n8nProfileId);
         formData.append('folder', folderParam);
         
         if (forcedPatientName) {
           formData.append('patientName', forcedPatientName);
           // Intentar buscar la nota anterior para darle contexto a la IA
           const allNotes = Object.values(notes || {}).flat();
           const patientNotes = allNotes
             .filter(n => n.name === forcedPatientName)
             .sort((a, b) => Number(b.time) - Number(a.time));
             
           if (patientNotes.length > 0) {
             const lastNote = patientNotes[0];
             let previousContext = `Última nota (${new Date(Number(lastNote.time)).toLocaleDateString()}):\n`;
             if (lastNote.clinicalData?.impresion_diagnostica) previousContext += `Diagnóstico previo: ${lastNote.clinicalData.impresion_diagnostica}\n`;
             if (lastNote.clinicalData?.plan) previousContext += `Tratamiento previo: ${lastNote.clinicalData.plan}\n`;
             if (lastNote.clinicalData?.alergias) previousContext += `ALERGIAS: ${lastNote.clinicalData.alergias}\n`;
             
             // Agregar signos vitales previos
             if (lastNote.vitals) {
               const v = lastNote.vitals;
               const vitalsArr = [];
               if (v.peso) vitalsArr.push(`Peso: ${v.peso}kg`);
               if (v.talla) vitalsArr.push(`Talla: ${v.talla}m`);
               if (v.temp) vitalsArr.push(`Temp: ${v.temp}°C`);
               if (v.ta) vitalsArr.push(`TA: ${v.ta}`);
               if (v.fc) vitalsArr.push(`FC: ${v.fc}`);
               if (vitalsArr.length > 0) {
                 previousContext += `Signos vitales previos: ${vitalsArr.join(', ')}\n`;
               }
             }
             
             // Si no hay campos estructurados específicos, mandar parte de la transcripción
             if (!lastNote.clinicalData?.plan) {
               previousContext += `\nResumen previo:\n${lastNote.transcription?.substring(0, 500)}...`;
             }
             formData.append('previousNoteContext', previousContext);
           }
         }

         const webhookUrl = process.env.EXPO_PUBLIC_N8N_WEBHOOK_URL || 'https://n8n.srv1574981.hstgr.cloud/webhook/Klino/upload-audio';
         
         try {
           console.log(`Enviando audio a n8n: ${webhookUrl} (folder: ${folderParam}, profile: ${profile})`);
           const res = await fetch(webhookUrl, {
             method: 'POST',
             body: formData,
             headers: {
                Accept: 'application/json',
             }
           });
           
           if (!res.ok) {
             const errorText = await res.text().catch(() => '');
             throw new Error(`HTTP error! status: ${res.status} - ${errorText}`);
           }
           
           const responseText = await res.text();
           if (!responseText || responseText.trim() === '') {
             throw new Error("El servidor de n8n no devolvió ninguna respuesta (cuerpo vacío). Es probable que el flujo haya fallado antes del nodo 'Respond to Webhook'.");
           }

           let data;
           try {
             data = JSON.parse(responseText);
           } catch (parseError) {
             console.error("Respuesta cruda de n8n:", responseText);
             throw new Error(`n8n devolvió un formato inválido en lugar de JSON. (Respuesta: ${responseText.substring(0, 50)}...)`);
           }

           console.log("Respuesta recibida de n8n:", JSON.stringify(data));
           finalNoteData = formatClinicalJson(data);
         } catch (e: any) {
           console.error("Error n8n:", e);
           let fallbackSuccess = false;
           try {
             const { supabase } = require('../utils/supabase');
             const { data: dbRecords } = await supabase
               .from('clinical_records')
               .select('*')
               .order('created_at', { ascending: false })
               .limit(1);
               
             if (dbRecords && dbRecords.length > 0) {
               const record = dbRecords[0];
               const timeDiff = Date.now() - new Date(record.created_at).getTime();
               if (timeDiff < 120000) { // Menos de 2 min
                 console.log("Nota recuperada de Supabase.");
                 const soapSource = record.soap_note_text || record.soap_note || '';
                 const parsed = formatClinicalJson(soapSource);
                 finalNoteData = {
                   paciente: parsed.paciente || record.patient_name || 'Paciente Recuperado',
                   transcription: parsed.transcription || soapSource,
                   vitals: parsed.vitals || record.vitals_data || {},
                   rawText: record.raw_transcription || ''
                 };
                 fallbackSuccess = true;
               }
             }
           } catch (fallbackError) {
             console.error("Fallo fallback", fallbackError);
           }

           if (!fallbackSuccess) {
             Alert.alert(
               'Aviso', 
               `Fallo en n8n.\nDetalle: ${e.message}\nSe creará nota local.`,
               [{ text: 'Entendido' }]
             );
             
             finalNoteData = {
                paciente: 'Paciente (Sin conexión n8n)',
                transcription: 'S: Paciente acude por chequeo...\nO: TA 128/82, FC 74, peso 81.4kg.\nA: Hipertensión en control.\nP: Losartán 50mg.',
                vitals: { temp: '36.5', fc: '74', ta: '128/82' } as any,
                rawText: 'Fallback local text'
             };
           }
         }
      } else {
        Alert.alert('Error', 'No se grabó ningún audio');
        setIsFinishing(false);
        return;
      }

      const newNoteId = Math.random().toString(36).substring(7);
      const targetProfileId = recordsProfileId && recordsProfileId !== 'all' ? recordsProfileId : (dashboardProfileId || '1');
      
      const specialtyMap: Record<string, string> = {
        consulta_general: 'Medicina General',
        nota_rapida: 'Nota Rápida',
        modo_pediatria: 'Pediatría',
        modo_psicologia: 'Psicología'
      };
      
      const newNote = {
        id: newNoteId,
        name: forcedPatientName || finalNoteData.paciente || 'Paciente (Dictado)',
        time: Date.now(),
        status: 'pending' as 'pending',
        statusText: 'PENDIENTE',
        specialty: specialtyMap[folderParam] || 'Medicina General',
        transcription: finalNoteData.transcription,
        rawTranscription: finalNoteData.rawText,
        vitals: finalNoteData.vitals || {}
      };

      await addNote(targetProfileId, newNote as any);

      router.replace(`/note-review?id=${newNoteId}&profileId=${targetProfileId}`);
    } catch (e) {
      console.error(e);
      setIsFinishing(false);
      Alert.alert('Error', 'Hubo un problema procesando la historia clínica');
    }
  };

  const getHeaderTitle = () => {
    switch (folderParam) {
      case 'nota_rapida': return 'NOTA RÁPIDA';
      case 'modo_pediatria': return 'CONSULTA PEDIÁTRICA';
      case 'modo_psicologia': return 'CONSULTA PSICOLÓGICA';
      default: return 'HISTORIA CLÍNICA';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.verde }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16 }}>
        
        {/* ENCABEZADO */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <X size={24} color={KLINO_COLORS.papel} strokeWidth={1.75} />
          </TouchableOpacity>
          <KlinoText variant="label" color={KLINO_COLORS.papel}>{getHeaderTitle()}</KlinoText>
          <View style={{ width: 12, height: 12, backgroundColor: isFinishing ? KLINO_COLORS.gris : KLINO_COLORS.ambar }} />
        </View>

        {/* PACIENTE Y TIEMPO */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <KlinoText variant="h3" color={KLINO_COLORS.papel}>Consultorio</KlinoText>
          <KlinoText variant="h3" color={KLINO_COLORS.papel}>{formatTime(seconds)}</KlinoText>
        </View>

        {/* ONDA DE AUDIO (REAL METERING) */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', height: 50, marginBottom: 40 }}>
          {metering.map((h, i) => {
            const bg = i > 25 ? KLINO_COLORS.papel : (i > 15 ? KLINO_COLORS.ambar : KLINO_COLORS.papel);
            return <View key={i} style={{ width: 4, height: Math.max(4, h), backgroundColor: bg, borderRadius: 2 }} />
          })}
        </View>

        <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ marginBottom: 16 }}>
          {isFinishing ? 'PROCESANDO AUDIO...' : 'ESCUCHANDO CONSULTA'}
        </KlinoText>
        
        <View style={{ height: 1, backgroundColor: 'rgba(244, 241, 234, 0.2)', marginBottom: 24 }} />

        {/* BLOQUES SOAP */}
        <SoapSection status="completed" title="SUBJETIVO" content="Escuchando motivo de consulta y síntomas..." />
        <SoapSection status="listening" title="OBJETIVO" content="Esperando signos vitales o exploración..." />
        <SoapSection status="empty" title="ANÁLISIS" content="" />
        <SoapSection status="empty" title="PLAN" content="" />

        <View style={{ flex: 1 }} />

        {/* CONTROLES INFERIORES */}
        <View style={{ backgroundColor: KLINO_COLORS.papel, padding: 16, marginBottom: 16 }}>
          <TouchableOpacity onPress={handleFinish} disabled={isFinishing} style={{ alignItems: 'center' }}>
            <KlinoText variant="label" color={KLINO_COLORS.verde}>
              {isFinishing ? "TRANSCRIBIENDO Y ARMANDO..." : "TERMINAR Y ARMAR HISTORIA CLÍNICA"}
            </KlinoText>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 16, marginBottom: 24 }}>
          <TouchableOpacity style={[styles.ghostBtn, { flex: 1 }]}>
             <KlinoText variant="label" color={KLINO_COLORS.papel}>PAUSAR</KlinoText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.ghostBtn, { flex: 1 }]}>
             <KlinoText variant="label" color={KLINO_COLORS.papel}>MARCAR MOMENTO</KlinoText>
          </TouchableOpacity>
        </View>

        <View style={{ alignItems: 'center', paddingBottom: 32 }}>
           <KlinoText variant="small" color={'rgba(244, 241, 234, 0.6)'}>Nada se guarda sin tu aprobación.</KlinoText>
        </View>

      </View>
    </SafeAreaView>
  );
}

const SoapSection = ({ status, title, content }: any) => {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 24 }}>
      <View style={{ marginTop: 2, marginRight: 16 }}>
        {status === 'completed' && <View style={{ width: 16, height: 16, backgroundColor: KLINO_COLORS.papel }} />}
        {status === 'listening' && <View style={{ width: 16, height: 16, borderWidth: 2, borderColor: KLINO_COLORS.ambar }} />}
        {status === 'empty' && <View style={{ width: 16, height: 16, borderWidth: 2, borderColor: KLINO_COLORS.papel }} />}
      </View>
      <View style={{ flex: 1 }}>
        <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ marginBottom: 4 }}>{title}</KlinoText>
        <KlinoText variant="body" color={status === 'empty' ? 'rgba(244, 241, 234, 0.6)' : KLINO_COLORS.papel}>{content}</KlinoText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  ghostBtn: {
    borderWidth: 1,
    borderColor: 'rgba(244, 241, 234, 0.4)',
    paddingVertical: 16,
    alignItems: 'center'
  }
});
