import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform, StyleSheet, TextInput, BackHandler } from 'react-native';
import { ArrowLeft, Search, AlertTriangle, ChevronDown, Mic, Pencil, Lock, Check } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { useProfile } from '../context/ProfileContext';
import { DictationTypeModal } from '../components/dictation/DictationTypeModal';

import { FadingScrollContainer } from '../components/common/FadingScrollContainer';

type TabType = 'Resumen' | 'Historia clínica' | 'Notas de evolución' | 'Labs e imagen' | 'Indicaciones' | 'Referencia' | 'Recetas';

const ALL_TABS: TabType[] = ['Resumen', 'Historia clínica', 'Notas de evolución', 'Labs e imagen', 'Indicaciones', 'Referencia', 'Recetas'];

export default function PatientTimelineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialPatientName = Array.isArray(params.patientName) ? params.patientName[0] : (params.patientName || 'Paciente Nuevo');
  
  const { notes, recordsProfileId, updatePatientName } = useProfile();
  const [currentName, setCurrentName] = useState(initialPatientName);
  
  // Sync currentName when route params change (expo-router screen reuse)
  useEffect(() => {
    if (initialPatientName !== currentName) {
      setCurrentName(initialPatientName);
    }
  }, [initialPatientName]);

  const [dictationModalVisible, setDictationModalVisible] = useState(false);
  
  // Obtener todas las notas del paciente — SIEMPRE buscar en todos los perfiles para no perder notas
  const allNotes = Object.entries(notes || {}).flatMap(([pId, pNotes]) => (pNotes || []).map((n: any) => ({ ...n, profileId: pId })));
    
  const rawPatientNotes = allNotes.filter(n => (n.name || '').trim().toLowerCase() === (currentName || '').trim().toLowerCase());
  const patientNotesMap = new Map();

  rawPatientNotes.forEach(n => {
    if (!patientNotesMap.has(n.id)) {
      // Solo omitir notas vacías sin transcripción y que no estén pendientes
      const textContent = (n.transcription || n.rawTranscription || '').trim();
      if (textContent.length === 0 && n.status !== 'pending') return;

      patientNotesMap.set(n.id, n);
    }
  });
  const patientNotes = Array.from(patientNotesMap.values())
    .sort((a, b) => Number(b.time) - Number(a.time));

  const [activeTab, setActiveTab] = useState<TabType>('Resumen');
  
  const getInitials = (name: string) => {
    if (!name) return 'PT';
    const parts = name.split(' ').filter(Boolean);
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };
  
  const initials = getInitials(currentName);

  const handleNameEndEditing = async (e: any) => {
    const newName = e.nativeEvent.text.trim();
    if (newName && newName !== currentName) {
      if (recordsProfileId && recordsProfileId !== 'all') {
        await updatePatientName(recordsProfileId, currentName, newName);
      } else {
        await updatePatientName('1', currentName, newName);
      }
      setCurrentName(newName);
    }
  };

  const navigateBackToRecords = () => {
    router.replace('/(tabs)/records');
    return true; // prevent default behavior
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', navigateBackToRecords);
    return () => backHandler.remove();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={navigateBackToRecords} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
          </TouchableOpacity>
          <KlinoText variant="h3" style={{ fontSize: 18 }}>Expediente</KlinoText>
        </View>
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Search size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
      </View>

      {/* PATIENT INFO */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingBottom: 24 }}>
        <View style={{ width: 64, height: 64, backgroundColor: KLINO_COLORS.verde, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
          <KlinoText variant="h2" color={KLINO_COLORS.papel}>{initials}</KlinoText>
        </View>
        <View style={{ flex: 1 }}>
          <TextInput 
            defaultValue={currentName}
            onEndEditing={handleNameEndEditing}
            style={{
              fontFamily: 'serif', // matching variant="h2" typically
              fontSize: 24,
              color: KLINO_COLORS.tinta,
              marginBottom: 4,
              padding: 0
            }}
          />
          <KlinoText variant="small" color={KLINO_COLORS.gris}>Exp. KL-{patientNotes[0]?.id?.substring(0,4) || '0000'} · Consultorio</KlinoText>
        </View>
      </View>

      {/* TABS */}
      <View style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <FadingScrollContainer contentContainerStyle={{ paddingHorizontal: 24, paddingRight: 48, gap: 24 }}>
          {ALL_TABS.map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity 
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={{ 
                  backgroundColor: isActive ? KLINO_COLORS.verde : 'transparent',
                  paddingVertical: 12,
                  paddingHorizontal: isActive ? 16 : 0,
                }}
              >
                <KlinoText 
                  variant="label" 
                  color={isActive ? KLINO_COLORS.papel : KLINO_COLORS.gris}
                  style={{ fontWeight: 'bold' }}
                >
                  {tab}
                </KlinoText>
              </TouchableOpacity>
            )
          })}
        </FadingScrollContainer>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'Resumen' && <ResumenTab router={router} notes={patientNotes} patientName={currentName} onDictarPress={() => setDictationModalVisible(true)} />}
        {activeTab === 'Historia clínica' && <HistoriaClinicaTab notes={patientNotes} />}
        {activeTab === 'Notas de evolución' && <NotasEvolucionTab notes={patientNotes} router={router} patientName={currentName} onDictarPress={() => setDictationModalVisible(true)} />}
        {activeTab === 'Labs e imagen' && <LabsImagenTab notes={patientNotes} />}
        {activeTab === 'Indicaciones' && <IndicacionesTab notes={patientNotes} router={router} patientName={currentName} onDictarPress={() => setDictationModalVisible(true)} />}
        {activeTab === 'Referencia' && <ReferenciaTab notes={patientNotes} />}
        {activeTab === 'Recetas' && <RecetasTab notes={patientNotes} router={router} patientName={currentName} onDictarPress={() => setDictationModalVisible(true)} />}
      </ScrollView>

      <DictationTypeModal 
        visible={dictationModalVisible} 
        onClose={() => setDictationModalVisible(false)}
        patientName={currentName}
      />
    </SafeAreaView>
  );
}

const ResumenTab = ({ router, notes, patientName, onDictarPress }: any) => {
  const getLatestVital = (key: string) => {
    for (const note of notes || []) {
      if (note.vitals && (note.vitals as any)[key]) {
        return (note.vitals as any)[key];
      }
    }
    return null;
  };

  const { updateNoteVitals, recordsProfileId } = useProfile();
  const [isEditingVitals, setIsEditingVitals] = useState(false);
  
  const getLatestNoteIdWithVitals = () => {
    for (const note of notes || []) {
      return note.id; // Just return the most recent note to save vitals to
    }
    return null;
  };

  const [localVitals, setLocalVitals] = useState({
    ta: getLatestVital('ta') || '',
    fc: getLatestVital('fc') || '',
    peso: getLatestVital('peso') || '',
    imc: getLatestVital('imc') || '',
    temp: getLatestVital('temp') || '',
  });

  const toggleEditVitals = () => {
    if (isEditingVitals) {
      const noteId = getLatestNoteIdWithVitals();
      if (noteId) {
        updateNoteVitals(recordsProfileId || '1', noteId, localVitals);
      }
    }
    setIsEditingVitals(!isEditingVitals);
  };

  // Diagnósticos
  const allDiagnoses = (notes || []).map((n: any) => {
    if (n.clinicalData?.impresion_diagnostica) return n.clinicalData.impresion_diagnostica;
    const match = n.transcription?.match(/(?:ANÁLISIS|ANALISIS|DIAGNÓSTICO|DIAGNOSTICO|IMPRESIÓN DIAGNÓSTICA|IMPRESION DIAGNOSTICA)[^:]*:\s*([\s\S]+?)(?=\n\n|\*\*P|\*\* PLAN|\*\*P |\*\* P|P \(PLAN|PLAN|$)/i);
    if (match) {
      // Remove any trailing markdown formatting that might get caught
      return match[1].replace(/\*\*/g, '').trim();
    }
    return null;
  }).filter(Boolean);
  const uniqueDiagnoses = Array.from(new Set(allDiagnoses)).slice(0, 3);

  // Tratamiento actual
  let latestTreatment = null;
  for (const n of notes || []) {
    if (n.clinicalData?.plan) {
      latestTreatment = n.clinicalData.plan;
      break;
    }
    const match = n.transcription?.match(/PLAN(?: TERAPÉUTICO)?(?: Y RECETA)?:\s*([\s\S]+?)(?=\n\n\*\*|\n\n[A-Z\s]+:|$)/i);
    if (match) {
      latestTreatment = match[1].trim();
      break;
    }
  }

  // Alergias
  const allAllergies = (notes || []).map((n: any) => {
    if (n.clinicalData?.alergias) return n.clinicalData.alergias;
    const match = n.transcription?.match(/(?:ALERGIAS|ANTECEDENTES ALÉRGICOS|ALERGIA|ALERGICOS)[^:]*:\s*([\s\S]+?)(?=\n\n|\*\*|\n[A-Z])/i);
    if (match) {
      const text = match[1].replace(/\*\*/g, '').trim();
      if (text.toLowerCase() !== 'negados' && text.toLowerCase() !== 'no' && text.toLowerCase() !== 'ninguna') {
        return text;
      }
    }
    return null;
  }).filter(Boolean);
  const uniqueAllergies = Array.from(new Set(allAllergies));

  return (
    <View style={{ padding: 24 }}>
      {/* ALERGIAS (solo si hay) */}
      {uniqueAllergies.length > 0 && (
        <View style={{ marginBottom: 32, padding: 16, backgroundColor: 'rgba(176, 49, 31, 0.05)', borderWidth: 1, borderColor: KLINO_COLORS.error }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <AlertTriangle size={20} color={KLINO_COLORS.error} strokeWidth={2} style={{ marginRight: 16, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <KlinoText variant="label" color={KLINO_COLORS.error} style={{ fontWeight: 'bold', letterSpacing: 2, marginBottom: 4 }}>ALERGIAS</KlinoText>
              {uniqueAllergies.map((alergia: any, idx: number) => (
                <KlinoText key={idx} variant="body" color={KLINO_COLORS.tinta} style={{ fontSize: 16, lineHeight: 24 }}>
                  {alergia}
                </KlinoText>
              ))}
            </View>
          </View>
        </View>
      )}

      {/* SIGNOS VITALES GRID */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <SectionTitle title="SIGNOS VITALES" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginBottom: 32 }}>
        <GridCell 
          label="PRESIÓN" 
          value={localVitals.ta || '--/--'} 
          sub="última consulta" 
          isEditing={isEditingVitals}
          onChange={(val: string) => setLocalVitals({...localVitals, ta: val})}
        />
        <GridCell 
          label="FREC. CARDÍACA" 
          value={localVitals.fc || '--'} 
          sub="lpm" 
          isRight
          isEditing={isEditingVitals}
          onChange={(val: string) => setLocalVitals({...localVitals, fc: val})}
        />
        <GridCell 
          label="PESO / IMC" 
          value={localVitals.peso || '--'} 
          sub={localVitals.imc ? `IMC ${localVitals.imc}` : 'kg'} 
          isBottom 
          isEditing={isEditingVitals}
          onChange={(val: string) => setLocalVitals({...localVitals, peso: val})}
        />
        <GridCell 
          label="TEMP." 
          value={localVitals.temp || '--'} 
          sub="°C" 
          isRight
          isBottom 
          isEditing={isEditingVitals}
          onChange={(val: string) => setLocalVitals({...localVitals, temp: val})}
        />
      </View>

      {/* DIAGNÓSTICOS HISTÓRICOS */}
      <SectionTitle title="DIAGNÓSTICOS" />
      <View style={{ marginBottom: 32, paddingBottom: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
        {uniqueDiagnoses.length > 0 ? (
          uniqueDiagnoses.map((diag: any, idx: number) => (
            <View key={idx} style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: KLINO_COLORS.verde, marginTop: 8, marginRight: 12 }} />
              <KlinoText variant="body" style={{ flex: 1, fontSize: 17, lineHeight: 24 }}>{diag}</KlinoText>
            </View>
          ))
        ) : (
          <KlinoText variant="small" color={KLINO_COLORS.gris}>No hay diagnósticos registrados.</KlinoText>
        )}
      </View>

      {/* TRATAMIENTO ACTUAL */}
      <SectionTitle title="TRATAMIENTO ACTUAL" />
      <View style={{ marginBottom: 32 }}>
        {!latestTreatment ? (
          <View style={{ padding: 16, backgroundColor: KLINO_COLORS.papelHondo, borderRadius: 8 }}>
            <KlinoText variant="body" style={{ fontSize: 16, lineHeight: 24 }}>No hay tratamientos recientes registrados.</KlinoText>
          </View>
        ) : (
          <View style={{ padding: 16, backgroundColor: KLINO_COLORS.papelHondo, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
            <KlinoText variant="body" style={{ fontSize: 18, lineHeight: 28 }}>
              {latestTreatment.replace(/\*\*/g, '').trim()}
            </KlinoText>
          </View>
        )}
      </View>

      {/* ÚLTIMAS NOTAS */}
      <SectionTitle title="ÚLTIMAS NOTAS" />
      <View style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline, marginBottom: 32 }}>
        {notes?.slice(0,3).map((n: any, idx: number) => (
          <TouchableOpacity key={n.id || idx} onPress={() => router.push(`/note-review?id=${n.id}&profileId=${n.profileId || '1'}`)}>
            <ListItem 
              left={n.specialty || 'Consulta General'} 
              right={new Date(Number(n.time)).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} 
              unapproved={n.status !== 'reviewed'}
            />
          </TouchableOpacity>
        ))}
        {(!notes || notes.length === 0) && (
          <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ paddingVertical: 16 }}>No hay consultas previas.</KlinoText>
        )}
      </View>

      {/* BOTONES INFERIORES */}
      <View style={{ flexDirection: 'row', gap: 16 }}>
        <TouchableOpacity 
          onPress={() => onDictarPress()}
          style={{ flex: 1, backgroundColor: KLINO_COLORS.verde, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          <Mic size={20} color={KLINO_COLORS.papel} strokeWidth={2} />
          <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={() => router.push('/scanner-select')}
          style={{ flex: 1, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', letterSpacing: 1 }}>ESCANEAR</KlinoText>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HistoriaClinicaTab = ({ notes }: any) => {
  const latestNote = notes?.find((n: any) => n.specialty === 'Historia Clínica') || notes?.[0];
  const dateStr = latestNote?.time ? new Date(Number(latestNote.time)).toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase() : 'SIN FECHA';
  
  const { updateNoteContent, recordsProfileId } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  useEffect(() => {
    if (latestNote) {
      setEditedText(latestNote.transcription || latestNote.rawTranscription || '');
    }
  }, [latestNote]);

  const toggleEdit = () => {
    if (isEditing && latestNote) {
      // Save changes
      updateNoteContent(recordsProfileId || '1', latestNote.id, editedText);
    }
    setIsEditing(!isEditing);
  };

  return (
    <View style={{ paddingBottom: 40 }}>
      {/* AVISO EDICION BLOQUEADA */}
      <View style={{ backgroundColor: isEditing ? KLINO_COLORS.ambar + '20' : KLINO_COLORS.papelHondo, padding: 24, flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <Lock size={20} color={isEditing ? KLINO_COLORS.ambar : KLINO_COLORS.gris} style={{ marginRight: 16 }} />
        <KlinoText variant="small" color={isEditing ? KLINO_COLORS.tinta : KLINO_COLORS.gris} style={{ flex: 1, lineHeight: 20 }}>
          {isEditing ? 'Edición desbloqueada. Modifica el texto y vuelve a tocar el lápiz para guardar.' : 'Edición bloqueada. Toca el lápiz para desbloquear con tu huella.'}
        </KlinoText>
        <TouchableOpacity onPress={toggleEdit} style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, padding: 12, backgroundColor: isEditing ? KLINO_COLORS.ambar : KLINO_COLORS.papel }}>
          <Pencil size={20} color={isEditing ? KLINO_COLORS.tinta : KLINO_COLORS.verde} />
        </TouchableOpacity>
      </View>

      <View style={{ padding: 24 }}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 24 }}>HISTORIA CLÍNICA · {dateStr}</KlinoText>

        {!latestNote ? (
          <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay notas clínicas disponibles para este paciente.</KlinoText>
        ) : isEditing ? (
          <TextInput
            multiline
            value={editedText}
            onChangeText={setEditedText}
            style={{ fontSize: 17, lineHeight: 28, fontFamily: 'serif', color: KLINO_COLORS.tinta, minHeight: 300, textAlignVertical: 'top' }}
          />
        ) : (
          <View>
            <KlinoText variant="body" style={{ fontSize: 17, lineHeight: 28, fontFamily: 'serif' }}>
              {(latestNote.transcription || latestNote.rawTranscription || 'Nota vacía.').replace(/\*\*/g, '')}
            </KlinoText>
          </View>
        )}

        {latestNote && (
          <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ marginTop: 24, lineHeight: 22 }}>
            Generada el {dateStr}. Estado: {latestNote.statusText || 'Pendiente'}.
          </KlinoText>
        )}

      </View>
    </View>
  );
};

const NotasEvolucionTab = ({ notes, router, patientName, onDictarPress }: any) => {
  const evolutionNotes = notes?.filter((n: any) => n.specialty === 'Nota de Evolución' || n.specialty === 'Nota Rápida' || n.specialty === 'Historia Clínica') || [];
  
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>{evolutionNotes.length} NOTAS DE EVOLUCIÓN</KlinoText>
        <TouchableOpacity onPress={() => onDictarPress()}>
          <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
        </TouchableOpacity>
      </View>
      {evolutionNotes.map((n: any) => (
        <TouchableOpacity key={n.id} onPress={() => router.push(`/note-review?id=${n.id}&profileId=${n.profileId || '1'}`)}>
          <RecordItem 
            date={new Date(Number(n.time)).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })}
            status={n.status === 'pending' ? 'SIN APROBAR' : 'OK'}
            desc={n.specialty || 'Evolución general'}
          />
        </TouchableOpacity>
      ))}
      {evolutionNotes.length === 0 && (
        <View style={{ padding: 24 }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay notas de evolución.</KlinoText>
        </View>
      )}
    </View>
  );
};

const LabsImagenTab = ({ notes }: any) => {
  const docs = notes?.filter((n: any) => n.pdfUri) || [];
  
  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>LABORATORIOS E IMAGEN</KlinoText>
        <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>ESCANEAR</KlinoText>
      </View>
      
      {docs.length > 0 ? (
        docs.map((doc: any, i: number) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
            <View style={{ width: 48, height: 60, backgroundColor: KLINO_COLORS.papelHondo, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginRight: 16 }} />
            <View>
              <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Documento Adjunto</KlinoText>
              <KlinoText variant="small" color={KLINO_COLORS.gris}>{new Date(Number(doc.time)).toLocaleDateString()}</KlinoText>
            </View>
          </View>
        ))
      ) : (
        <View style={{ padding: 24 }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay documentos, laboratorios ni imágenes en este expediente.</KlinoText>
        </View>
      )}
    </View>
  );
};

const IndicacionesTab = ({ notes, router, patientName, onDictarPress }: any) => {
  const indicaciones = notes?.filter((n: any) => n.transcription && n.transcription.toUpperCase().includes('PLAN:'))
    .map((n: any) => {
      const parts = n.transcription.split(/PLAN:|plan:/i);
      const planText = parts.length > 1 ? parts[1].trim() : '';
      return {
        id: n.id,
        time: n.time,
        profileId: n.profileId,
        desc: planText.substring(0, 120) + (planText.length > 120 ? '...' : '')
      };
    }) || [];

  return (
    <View>
      <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>HOJAS DE INDICACIONES</KlinoText>
        <TouchableOpacity onPress={() => onDictarPress()}>
          <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
        </TouchableOpacity>
      </View>
      
      {indicaciones.map((ind: any) => (
        <TouchableOpacity key={ind.id} onPress={() => router.push(`/note-review?id=${ind.id}&profileId=${ind.profileId || '1'}`)}>
          <RecordItem date={new Date(Number(ind.time)).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })} status="OK" desc={ind.desc} />
        </TouchableOpacity>
      ))}

      {indicaciones.length === 0 && (
        <View style={{ padding: 24 }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay hojas de indicaciones recientes.</KlinoText>
        </View>
      )}

      <View style={{ padding: 24 }}>
        <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ lineHeight: 22 }}>
          Las hojas de indicaciones se generan de lo que dictaste en el plan y se pueden mandar al paciente.
        </KlinoText>
      </View>
    </View>
  );
};

const ReferenciaTab = ({ notes }: any) => {
  const referencias = notes?.filter((n: any) => n.transcription && n.transcription.toUpperCase().includes('REFERENCIA')) || [];

  return (
    <View>
      <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>NOTAS DE REFERENCIA</KlinoText>
      </View>
      {referencias.length > 0 ? (
        referencias.map((ref: any, i: number) => (
          <RecordItem key={i} date={new Date(Number(ref.time)).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} status="OK" desc={ref.name + ' - Referencia'} />
        ))
      ) : (
        <View style={{ padding: 24 }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay hojas de referencia en este expediente.</KlinoText>
        </View>
      )}
    </View>
  );
};

const RecetasTab = ({ notes, router, patientName, onDictarPress }: any) => {
  // Extract "PLAN" or "RECETA" sections from notes, or include notes of specialty 'Receta'
  const recetas = notes?.filter((n: any) => n.specialty === 'Receta' || (n.transcription && (n.transcription.toUpperCase().includes('RECETA:') || n.transcription.toUpperCase().includes('PLAN:'))))
    .map((n: any) => {
      let planText = n.transcription || '';
      if (planText.toUpperCase().includes('RECETA:')) {
        planText = planText.split(/RECETA:/i)[1]?.trim() || '';
      } else if (planText.toUpperCase().includes('PLAN:')) {
        planText = planText.split(/PLAN:/i)[1]?.trim() || '';
      }
      return {
        id: n.id,
        time: n.time,
        profileId: n.profileId,
        desc: planText.substring(0, 100) + (planText.length > 100 ? '...' : '')
      };
    }) || [];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>RECETAS</KlinoText>
        <TouchableOpacity onPress={() => onDictarPress()}>
          <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
        </TouchableOpacity>
      </View>
      {recetas.map((r: any) => (
        <TouchableOpacity key={r.id} onPress={() => router.push(`/prescription-preview?id=${r.id}&profileId=${r.profileId || '1'}`)}>
          <RecordItem date={new Date(Number(r.time)).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })} status="OK" desc={r.desc} />
        </TouchableOpacity>
      ))}
      {recetas.length === 0 && (
        <View style={{ padding: 24 }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay recetas ni planes indicados.</KlinoText>
        </View>
      )}
    </View>
  );
};

const RecordItem = ({ date, status, desc }: any) => (
  <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
      <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18 }}>{date}</KlinoText>
      {status === 'SIN APROBAR' ? (
        <View style={{ backgroundColor: KLINO_COLORS.ambar, paddingHorizontal: 12, paddingVertical: 4 }}>
          <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold' }}>SIN APROBAR</KlinoText>
        </View>
      ) : status === 'OK' ? (
        <KlinoText variant="body" color={KLINO_COLORS.verde}>✓</KlinoText>
      ) : (
        <KlinoText variant="small" color={KLINO_COLORS.gris}>{status}</KlinoText>
      )}
    </View>
    <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ lineHeight: 24, fontSize: 18 }}>{desc}</KlinoText>
  </View>
);

const SectionTitle = ({ title }: { title: string }) => (
  <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 16 }}>{title}</KlinoText>
);

const GridCell = ({ label, value, sub, isRight, isBottom, isEditing, onChange }: any) => (
  <View style={{ width: '50%', padding: 16, borderRightWidth: isRight ? 0 : 1, borderBottomWidth: isBottom ? 0 : 1, borderColor: KLINO_COLORS.borderStrong }}>
    <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 1, marginBottom: 8 }}>{label}</KlinoText>
    {isEditing ? (
      <TextInput
        value={value === '--' || value === '--/--' ? '' : value}
        onChangeText={onChange}
        keyboardType={label === 'PRESIÓN' ? 'default' : 'numeric'}
        placeholder={value}
        style={{ fontSize: 28, marginBottom: 4, fontFamily: 'serif', color: KLINO_COLORS.tinta, padding: 0, borderBottomWidth: 1, borderColor: KLINO_COLORS.verde }}
      />
    ) : (
      <KlinoText variant="h2" style={{ fontSize: 28, marginBottom: 4 }}>{value}</KlinoText>
    )}
    <KlinoText variant="small" color={KLINO_COLORS.gris}>{sub}</KlinoText>
  </View>
);

const ListItem = ({ left, right, unapproved }: { left: string, right: string, unapproved?: boolean }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
      <KlinoText variant="body" style={{ fontSize: 18 }}>{left}</KlinoText>
      {unapproved && (
        <View style={{ backgroundColor: KLINO_COLORS.ambar, paddingHorizontal: 6, paddingVertical: 2, marginLeft: 12 }}>
          <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', fontSize: 10 }}>SIN APROBAR</KlinoText>
        </View>
      )}
    </View>
    <KlinoText variant="small" color={KLINO_COLORS.gris}>{right}</KlinoText>
  </View>
);

const BoxItem = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <View style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, borderBottomWidth: 0, padding: 16, backgroundColor: KLINO_COLORS.papel }}>
    <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{title}</KlinoText>
    <KlinoText variant="small" color={KLINO_COLORS.gris}>{subtitle}</KlinoText>
  </View>
);

const TextSection = ({ title, children }: any) => (
  <View style={{ marginBottom: 24 }}>
    <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 1, marginBottom: 8 }}>{title}</KlinoText>
    <KlinoText variant="body" style={{ fontSize: 18, lineHeight: 28 }}>{children}</KlinoText>
  </View>
);

const styles = StyleSheet.create({});
