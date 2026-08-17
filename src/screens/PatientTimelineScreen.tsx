import React, { useState, useEffect } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform, StyleSheet, TextInput } from 'react-native';
import { ArrowLeft, Search, AlertTriangle, ChevronDown, Mic, Pencil, Lock } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { useProfile } from '../context/ProfileContext';

import { FadingScrollContainer } from '../components/common/FadingScrollContainer';

type TabType = 'Resumen' | 'Historia clínica' | 'Notas de evolución' | 'Labs e imagen' | 'Indicaciones' | 'Referencia' | 'Recetas';

const ALL_TABS: TabType[] = ['Resumen', 'Historia clínica', 'Notas de evolución', 'Labs e imagen', 'Indicaciones', 'Referencia', 'Recetas'];

export default function PatientTimelineScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const initialPatientName = Array.isArray(params.patientName) ? params.patientName[0] : (params.patientName || 'Paciente Nuevo');
  
  const { notes, recordsProfileId, updatePatientName } = useProfile();
  const [currentName, setCurrentName] = useState(initialPatientName);
  
  // Obtener todas las notas del paciente seleccionado
  const currentNotes = (recordsProfileId && recordsProfileId !== 'all') 
    ? (notes[recordsProfileId] || []).map(n => ({ ...n, profileId: recordsProfileId })) 
    : Object.entries(notes).flatMap(([pId, pNotes]) => pNotes.map(n => ({ ...n, profileId: pId })));
    
  const patientNotes = currentNotes
    .filter(n => n.name === currentName)
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/records')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
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

      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {activeTab === 'Resumen' && <ResumenTab router={router} notes={patientNotes} patientName={currentName} />}
        {activeTab === 'Historia clínica' && <HistoriaClinicaTab notes={patientNotes} />}
        {activeTab === 'Notas de evolución' && <NotasEvolucionTab notes={patientNotes} router={router} patientName={currentName} />}
        {activeTab === 'Labs e imagen' && <LabsImagenTab />}
        {activeTab === 'Indicaciones' && <IndicacionesTab />}
        {activeTab === 'Referencia' && <ReferenciaTab />}
        {activeTab === 'Recetas' && <RecetasTab notes={patientNotes} router={router} patientName={currentName} />}
      </ScrollView>

    </SafeAreaView>
  );
}

const ResumenTab = ({ router, notes, patientName }: any) => {
  const latestNote = notes && notes.length > 0 ? notes[0] : null;
  const vitals = latestNote?.vitals || {};

  return (
    <View style={{ padding: 24 }}>
      {/* SIGNOS VITALES GRID */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginBottom: 32 }}>
        <GridCell label="PRESIÓN" value={vitals.ta || '--/--'} sub="última consulta" isRight />
        <GridCell label="FREC. CARDÍACA" value={vitals.fc || '--'} sub="lpm" isBottom />
        <GridCell label="PESO / IMC" value={vitals.peso || '--'} sub={vitals.imc ? `IMC ${vitals.imc}` : 'kg'} isRight isBottom />
        <GridCell label="TEMP." value={vitals.temp || '--'} sub="°C" isBottom />
      </View>

      {/* DIAGNÓSTICOS ACTIVOS */}
      <SectionTitle title="DIAGNÓSTICOS Y NOTAS" />
      <View style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline, marginBottom: 32 }}>
        {notes?.slice(0,3).map((n: any, idx: number) => (
          <TouchableOpacity key={n.id || idx} onPress={() => router.push(`/note-review?id=${n.id}&profileId=${n.profileId || '1'}`)}>
            <ListItem 
              left={n.specialty || 'Consulta General'} 
              right={new Date(Number(n.time)).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })} 
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
          onPress={() => router.push(`/live-consultation?patientName=${encodeURIComponent(patientName)}`)}
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
  const latestNote = notes[0];
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
          <KlinoText variant="body" style={{ fontSize: 17, lineHeight: 28, fontFamily: 'serif' }}>
            {latestNote.transcription || latestNote.rawTranscription || 'Nota vacía.'}
          </KlinoText>
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

const NotasEvolucionTab = ({ notes, router, patientName }: any) => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>{notes?.length || 0} NOTAS DE EVOLUCIÓN</KlinoText>
      <TouchableOpacity onPress={() => router.push(`/live-consultation?patientName=${encodeURIComponent(patientName)}`)}>
        <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
      </TouchableOpacity>
    </View>
    {notes?.map((n: any) => (
      <TouchableOpacity key={n.id} onPress={() => router.push(`/note-review?id=${n.id}&profileId=${n.profileId || '1'}`)}>
        <RecordItem 
          date={new Date(Number(n.time)).toLocaleDateString('es-MX', { day: '2-digit', month: 'long' })}
          status={n.status === 'pending' ? 'SIN APROBAR' : 'OK'}
          desc={n.specialty || 'Evolución general'}
        />
      </TouchableOpacity>
    ))}
    {(!notes || notes.length === 0) && (
      <View style={{ padding: 24 }}>
        <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay notas de evolución.</KlinoText>
      </View>
    )}
  </View>
);

const LabsImagenTab = () => (
  <View>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>LABORATORIOS E IMAGEN</KlinoText>
      <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>ESCANEAR</KlinoText>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <View style={{ width: 48, height: 60, backgroundColor: KLINO_COLORS.papelHondo, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginRight: 16 }} />
      <View>
        <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Química sanguínea</KlinoText>
        <KlinoText variant="small" color={KLINO_COLORS.gris}>18 abr · escaneado · 2 hojas</KlinoText>
      </View>
    </View>
    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <View style={{ width: 48, height: 60, backgroundColor: KLINO_COLORS.tinta, marginRight: 16 }} />
      <View>
        <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>Radiografía de tórax</KlinoText>
        <KlinoText variant="small" color={KLINO_COLORS.gris}>3 mar · sin hallazgos</KlinoText>
      </View>
    </View>
    
    <View style={{ padding: 24 }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2, marginBottom: 24 }}>TENDENCIA DE HBA1C</KlinoText>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 120, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingHorizontal: 16 }}>
        <Bar value="7.8" height={100} />
        <Bar value="7.4" height={80} />
        <Bar value="7.1" height={70} />
        <Bar value="6.9" height={60} active />
      </View>
    </View>
  </View>
);

const Bar = ({ value, height, active }: any) => (
  <View style={{ alignItems: 'center' }}>
    <View style={{ width: 60, height, backgroundColor: active ? KLINO_COLORS.verde : KLINO_COLORS.papelHondo, borderWidth: active ? 0 : 1, borderColor: KLINO_COLORS.borderStrong }} />
    <KlinoText variant="small" color={active ? KLINO_COLORS.verde : KLINO_COLORS.gris} style={{ marginTop: 8 }}>{value}</KlinoText>
  </View>
);

const IndicacionesTab = () => (
  <View>
    <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>HOJAS DE INDICACIONES</KlinoText>
    </View>
    <RecordItem date="Cuidados en casa · 14 ago" status="OK" desc="Medir presión dos veces al día. Dieta baja en sodio. Caminar 30 minutos." />
    <RecordItem date="Preparación de laboratorio · 10 abr" status="OK" desc="Ayuno de 8 horas. Suspender metformina la noche previa." />
    <View style={{ padding: 24 }}>
      <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ lineHeight: 22 }}>
        Las hojas de indicaciones se generan de lo que dictaste en el plan y se pueden mandar al paciente.
      </KlinoText>
    </View>
  </View>
);

const ReferenciaTab = () => (
  <View>
    <View style={{ padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>NOTAS DE REFERENCIA</KlinoText>
    </View>
    <RecordItem date="Cardiología" status="2 jul" desc="Envío para valoración de hipertensión de difícil control. Dr. Iván Rueda." />
    <RecordItem date="Nutrición" status="18 abr" desc="Plan de alimentación para diabetes tipo 2. Contrarreferencia recibida." />
  </View>
);

const RecetasTab = ({ notes, router, patientName }: any) => {
  // Extract "PLAN" sections from notes
  const recetas = notes?.filter((n: any) => n.transcription && n.transcription.toUpperCase().includes('PLAN:'))
    .map((n: any) => {
      const parts = n.transcription.split(/PLAN:|plan:/i);
      const planText = parts.length > 1 ? parts[1].trim() : '';
      return {
        id: n.id,
        time: n.time,
        profileId: n.profileId,
        desc: planText.substring(0, 80) + (planText.length > 80 ? '...' : '')
      };
    }) || [];

  return (
    <View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>RECETAS</KlinoText>
        <TouchableOpacity onPress={() => router.push(`/live-consultation?patientName=${encodeURIComponent(patientName)}`)}>
          <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
        </TouchableOpacity>
      </View>
      {recetas.map((r: any) => (
        <TouchableOpacity key={r.id} onPress={() => router.push(`/note-review?id=${r.id}&profileId=${r.profileId || '1'}`)}>
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

const GridCell = ({ label, value, sub, isRight, isBottom }: any) => (
  <View style={{ width: '50%', padding: 16, borderRightWidth: isRight ? 0 : 1, borderBottomWidth: isBottom ? 0 : 1, borderColor: KLINO_COLORS.borderStrong }}>
    <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 1, marginBottom: 8 }}>{label}</KlinoText>
    <KlinoText variant="h2" style={{ fontSize: 28, marginBottom: 4 }}>{value}</KlinoText>
    <KlinoText variant="small" color={KLINO_COLORS.gris}>{sub}</KlinoText>
  </View>
);

const ListItem = ({ left, right }: { left: string, right: string }) => (
  <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
    <KlinoText variant="body" style={{ fontSize: 18 }}>{left}</KlinoText>
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
