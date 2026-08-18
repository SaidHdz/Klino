import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform, TextInput, Alert } from 'react-native';
import { Search, ScanLine, FileText, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../../src/constants/theme';
import { KlinoText } from '../../src/components/common/KlinoText';
import { useProfile } from '../../src/context/ProfileContext';
import { useKlinoAlert } from '../../src/context/KlinoAlertContext';
import { FadingScrollContainer } from '../../src/components/common/FadingScrollContainer';

export default function RecordsScreen() {
  const router = useRouter();
  const { notes, intelligenceModes, recordsProfileId, setRecordsProfileId, deleteMultipleNotes } = useProfile();
  const { showAlert } = useKlinoAlert();
  const [searchQuery, setSearchQuery] = useState('');

  // Asegurarnos de que el ID por defecto sea el primer modo o 'all'
  useEffect(() => {
    if (!recordsProfileId) setRecordsProfileId(intelligenceModes[0]?.id || 'all');
  }, []);

  const activeModeId = recordsProfileId || 'all';

  const modes = [
    ...intelligenceModes,
    { id: 'all', name: 'Todos' }
  ];

  const currentNotes = activeModeId === 'all' 
    ? Object.values(notes).flat()
    : (notes[activeModeId] || []);

  const sortedNotes = [...currentNotes].sort((a, b) => Number(b.time) - Number(a.time));
  
  // Deduplicar pacientes por nombre (limpiando espacios)
  const uniquePatients = Array.from(
    new Map(sortedNotes.map(n => [(n.name || '').trim().toLowerCase(), { ...n, name: (n.name || '').trim() }])).values()
  );

  const filteredPatients = uniquePatients.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  // Buscar en TODOS los perfiles para contar documentos correctamente
  const allNotesFlat = Object.values(notes).flat();

  const hasPendingDocs = (patientName: string) => {
    return allNotesFlat.some(n => (n.name || '').trim().toLowerCase() === patientName.trim().toLowerCase() && n.status === 'pending');
  };

  const getDocsCount = (patientName: string) => {
    return allNotesFlat.filter(n => (n.name || '').trim().toLowerCase() === patientName.trim().toLowerCase()).length;
  };

  const handleDeletePatient = (patientName: string) => {
    showAlert(
      "Eliminar expediente",
      `¿Estás seguro de que deseas eliminar todo el expediente de ${patientName}? Esta acción borrará todas sus notas y no se puede deshacer.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
             Object.keys(notes).forEach(profileId => {
               const patientNoteIds = notes[profileId].filter(n => (n.name || '').trim().toLowerCase() === patientName.trim().toLowerCase()).map(n => n.id);
               if (patientNoteIds.length > 0) {
                 deleteMultipleNotes(profileId, patientNoteIds);
               }
             });
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      <View style={{ flex: 1, paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 60 : 32 }}>
        
        {/* ENCABEZADO */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <KlinoText variant="h2" style={{ textTransform: 'none' }}>Expedientes</KlinoText>
          <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <ScanLine size={18} color={KLINO_COLORS.verde} strokeWidth={2} />
            <KlinoText variant="label" color={KLINO_COLORS.verde}>ESCANEAR</KlinoText>
          </TouchableOpacity>
        </View>

        {/* TABS DE MODOS / CARPETAS */}
        <View style={{ marginBottom: 24 }}>
          <FadingScrollContainer contentContainerStyle={{ gap: 16, paddingRight: 40 }}>
            {modes.map(mode => {
              const isActive = activeModeId === mode.id;
              return (
                <TouchableOpacity
                  key={mode.id}
                  activeOpacity={0.8}
                  onPress={() => setRecordsProfileId(mode.id)}
                  style={{
                    paddingVertical: 6,
                    paddingHorizontal: 12,
                    backgroundColor: isActive ? KLINO_COLORS.verde : 'transparent',
                  }}
                >
                  <KlinoText 
                    variant="body" 
                    style={{ fontWeight: isActive ? 'bold' : 'normal' }}
                    color={isActive ? KLINO_COLORS.papel : KLINO_COLORS.tinta}
                  >
                    {mode.name}
                  </KlinoText>
                </TouchableOpacity>
              );
            })}
          </FadingScrollContainer>
        </View>

        {/* BUSCADOR */}
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: KLINO_COLORS.papelHondo, paddingHorizontal: 16, marginBottom: 16 }}>
          <Search size={20} color={KLINO_COLORS.gris} strokeWidth={1.75} />
          <TextInput 
            placeholder={`Buscar en ${uniquePatients.length} expedientes`}
            placeholderTextColor={KLINO_COLORS.gris}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={{ flex: 1, paddingVertical: 16, paddingHorizontal: 12, fontFamily: 'Spectral-Regular', fontSize: 17, color: KLINO_COLORS.tinta }}
          />
        </View>

        {/* ACCIONES DE FORMATO */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24, marginBottom: 32 }}>
          <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <FileText size={18} color={KLINO_COLORS.gris} strokeWidth={1.75} />
            <KlinoText variant="label" color={KLINO_COLORS.gris}>VER FORMATOS</KlinoText>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Plus size={18} color={KLINO_COLORS.gris} strokeWidth={2} />
            <KlinoText variant="label" color={KLINO_COLORS.gris}>AGREGAR FORMATO</KlinoText>
          </TouchableOpacity>
        </View>

        {/* TÍTULO DE SECCIÓN */}
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 8 }}>
          {searchQuery ? 'RESULTADOS' : `PACIENTES DE ${modes.find(m => m.id === activeModeId)?.name.toUpperCase() || 'TODOS'}`}
        </KlinoText>
        
        {/* LISTA DE PACIENTES */}
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
          {filteredPatients.map((p, i) => (
            <TouchableOpacity 
              key={p.id}
              activeOpacity={0.7}
              onPress={() => router.push({ pathname: '/patient-timeline', params: { patientName: p.name } })}
              onLongPress={() => handleDeletePatient(p.name)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: KLINO_COLORS.borderHairline
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                <View style={{ width: 40, height: 40, backgroundColor: KLINO_COLORS.verde, justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                  <KlinoText variant="small" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold' }}>{getInitials(p.name)}</KlinoText>
                </View>
                <View style={{ flex: 1 }}>
                  <KlinoText variant="body" style={{ fontWeight: 'bold', marginBottom: 2 }}>{p.name}</KlinoText>
                  <KlinoText variant="small" color={KLINO_COLORS.gris}>
                    {getDocsCount(p.name)} {getDocsCount(p.name) === 1 ? 'documento' : 'documentos'} · {new Date(Number(p.time)).toLocaleDateString()}
                  </KlinoText>
                </View>
              </View>
              
              {hasPendingDocs(p.name) && (
                <View style={{ width: 12, height: 12, backgroundColor: KLINO_COLORS.ambar, marginLeft: 16 }} />
              )}
            </TouchableOpacity>
          ))}
          
          {filteredPatients.length === 0 && (
            <View style={{ padding: 24, backgroundColor: KLINO_COLORS.papelHondo, borderWidth: 1, borderColor: KLINO_COLORS.borderHairline, marginTop: 16 }}>
              <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ textAlign: 'center' }}>No hay pacientes registrados en esta carpeta.</KlinoText>
            </View>
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
