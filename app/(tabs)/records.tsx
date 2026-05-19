import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Dimensions, FlatList, Platform, Alert, ActivityIndicator, Modal, RefreshControl } from 'react-native';
import { Search, FolderClosed, Bluetooth, Eye, Download, FolderOpen, Mic, Square, Trash, Trash2, Pause, Play, ShieldCheck, Mic2, X, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MotiView, AnimatePresence } from 'moti';
import { Layout } from 'react-native-reanimated';
import Header from '../../src/components/Header';
import { useRouter, useFocusEffect } from 'expo-router';
import { useProfile } from '../../src/context/ProfileContext';
import { supabase } from '../../src/utils/supabase';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as Notifications from 'expo-notifications';
import { TimeDisplay } from '../../src/components/TimeDisplay';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = 180; 
const CARD_MARGIN = 12;

const PROFILES = [
  { id: '1', name: 'Medicina General', count: '4 notas', color: '#1B4F9B', mode: 'consulta_general' },
  { id: '2', name: 'Cirugía', count: '1 nota', color: '#2A7D6F', mode: 'nota_rapida' },
  { id: '3', name: 'Pediatría', count: '1 nota', color: '#1E5FAD', mode: 'revision_hardware' },
];

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const PatientCard = React.memo(({ id, name, specialty, status, time, profileId }: any) => {
  const router = useRouter();
  const { deleteNote } = useProfile();
  
  const handleReviewNote = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({ pathname: '/note-detail', params: { id, name } });
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar Nota',
      '¿Estás seguro de que deseas eliminar esta nota?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            deleteNote(profileId, id);
          }
        }
      ]
    );
  };

  const statusConfig = {
    pending: { bg: 'bg-orange-500', lightBg: 'bg-orange-50', textColor: 'text-orange-600', label: 'Pendiente', iconBg: 'bg-orange-50' },
    reviewed: { bg: 'bg-klino-secondary', lightBg: 'bg-green-50', textColor: 'text-klino-secondary', label: 'Revisado', iconBg: 'bg-green-50' },
    generated: { bg: 'bg-klino-primary', lightBg: 'bg-blue-50', textColor: 'text-klino-primary', label: 'IA Lista', iconBg: 'bg-blue-50' },
  };
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <MotiView 
      layout={Layout.springify().damping(25).stiffness(200).mass(0.1)}
      from={{ opacity: 0, scale: 0.9, translateY: 10 }} 
      animate={{ opacity: 1, scale: 1, translateY: 0 }} 
      exit={{ opacity: 0, scale: 0.9, transition: { type: 'timing', duration: 150 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
      className="bg-klino-card rounded-[32px] mb-4 shadow-sm border border-klino-background overflow-hidden mx-6"
    >
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={handleReviewNote}
        className="flex-row items-center p-4"
      >
        <View className={`w-14 h-14 ${config.bg} rounded-2xl items-center justify-center mr-4`}>
          <Text className="text-white font-black text-lg">{getInitials(name)}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start">
            <View className="flex-1 pr-2">
              <Text className="text-base font-black text-klino-text" numberOfLines={1}>{name}</Text>
              <Text className="text-xs text-klino-subtext font-bold" numberOfLines={1}>{specialty}</Text>
            </View>
            <View className={`${config.lightBg} px-2 py-0.5 rounded-lg border border-klino-background/50`}>
              <Text className={`${config.textColor} text-[8px] font-black uppercase`}>{config.label}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-2">
            <TimeDisplay
              time={time}
              className="text-[10px] text-slate-300 font-bold"
            />

            <View className="flex-row space-x-2">
              <View className={`w-9 h-9 rounded-full ${config.iconBg} items-center justify-center border border-klino-background/30`}>
                <Eye size={16} color="#5A6B7E" />
              </View>
              <TouchableOpacity 
                onPress={handleDelete}
                className={`w-9 h-9 rounded-full bg-orange-50 items-center justify-center border border-orange-100`}
              >
                <Trash size={16} color="#E8820C" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </MotiView>
  );
});

const RecordsScreen = () => {
  const { userId, recordsProfileId, setRecordsProfileId, notes, addNote, syncWithCloud, isSyncing } = useProfile();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const onRefresh = useCallback(() => {
    syncWithCloud();
  }, [syncWithCloud]);
  
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [metering, setMetering] = useState(-160);
  
  const profileListRef = useRef<FlatList>(null);
  const WEBHOOK_URL = 'https://n8n.srv1574981.hstgr.cloud/webhook/Klino/upload-audio';

  const currentNotes = notes[recordsProfileId] || [];
  const filteredNotes = currentNotes.filter(note => 
    note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.specialty.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useFocusEffect(
    useCallback(() => {
      const index = PROFILES.findIndex(p => p.id === recordsProfileId);
      if (index !== -1 && profileListRef.current) {
        setTimeout(() => {
          profileListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
        }, 150);
      }
    }, [recordsProfileId])
  );

  const handleProfileChange = async (id: string, index: number) => {
    await Haptics.selectionAsync();
    setIsLoading(true);
    setSearchQuery('');
    setRecordsProfileId(id);
    if (profileListRef.current) {
      profileListRef.current?.scrollToIndex({ index, animated: true, viewPosition: 0.5 });
    }
    setTimeout(() => setIsLoading(false), 300);
  };

  const cleanupRecording = async () => {
    if (recording) {
      try { await recording.stopAndUnloadAsync(); } catch (e) {}
      setRecording(null);
    }
  };

  const startRecording = async () => {
    try {
      await cleanupRecording();
      const permission = await Audio.requestPermissionsAsync();
      if (permission.status === 'granted') {
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: newRecording } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY,
          (status) => setMetering(status.metering || -160),
          100
        );
        setRecording(newRecording);
        setIsRecording(true);
      }
    } catch (err) { Alert.alert('Error', 'No se pudo iniciar la grabación.'); }
  };

  const sendAudioToWebhook = async (uri: string) => {
    try {
      const currentDoctorId = userId || 'ANONYMOUS_DOCTOR';
      const currentFolder = PROFILES.find(p => p.id === recordsProfileId)?.mode || 'consulta_general';

      const formData = new FormData();
      // @ts-ignore
      formData.append('file', { 
        uri: Platform.OS === 'android' ? uri : uri.replace('file://', ''), 
        name: 'dictado.m4a', 
        type: 'audio/m4a' 
      });
      
      formData.append('profileId', currentDoctorId); 
      formData.append('folder', currentFolder);

      const response = await fetch(WEBHOOK_URL, { 
        method: 'POST', 
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        result = { text: responseText };
      }
      
      const data = Array.isArray(result) ? result[0] : result;
      let rawOutput = "";

      if (data?.output && Array.isArray(data.output) && data.output[0]?.content && Array.isArray(data.output[0].content)) {
        rawOutput = data.output[0].content[0]?.text || "";
      } else if (data?.payload) {
        rawOutput = typeof data.payload === 'string' ? data.payload : JSON.stringify(data.payload);
      } else if (data?.text) {
        rawOutput = data.text;
      } else {
        rawOutput = JSON.stringify(data);
      }

      if (!rawOutput) throw new Error("No se encontró texto.");

      let extractedPaciente = "Paciente Nuevo";
      let extractedNota = "";
      let cleanJson: any = null;

      try {
        const match = rawOutput.match(/\{[\s\S]*\}/);
        const jsonStr = match ? match[0] : rawOutput;
        const fixedJson = jsonStr.replace(/:\s*'/g, ': "').replace(/',\n/g, '",\n').replace(/'\n/g, '"\n').replace(/\{\s*'/g, '{ "').replace(/'\s*:/g, '" :').replace(/,\s*'/g, ', "');
        cleanJson = JSON.parse(fixedJson);
      } catch (e) {}

      if (cleanJson) {
        extractedPaciente = cleanJson.paciente || cleanJson.Paciente || "Paciente Nuevo";
        const sv = cleanJson.signos_vitales || cleanJson.Signos_Vitales;
        let extractedVitals = undefined;
        if (sv) {
          extractedVitals = {
            ta: sv.presion_arterial || '', fc: sv.frecuencia_cardiaca || '',
            fr: sv.frecuencia_respiratoria || '', temp: sv.temperatura || '',
            sat: sv.saturacion_oxigeno || '', peso: sv.peso || '',
            talla: sv.talla || '', imc: sv.imc || ''
          };
        }

        const blocks = cleanJson.nota_clinica || cleanJson.Nota_Clinica || cleanJson;
        const isProfessionalFormat = blocks.padecimiento_actual || blocks.exploracion_fisica;
        
        if (isProfessionalFormat) {
          const narrative = [
            { label: 'ANTECEDENTES HEREDOFAMILIARES', value: blocks.antecedentes_heredofamiliares },
            { label: 'ANTECEDENTES PERSONALES NO PATOLÓGICOS', value: blocks.antecedentes_personales_no_patologicos },
            { label: 'ANTECEDENTES PERSONALES PATOLÓGICOS', value: blocks.antecedentes_personales_patologicos },
            { label: 'PADECIMIENTO ACTUAL', value: blocks.padecimiento_actual },
            { label: 'EXPLORACIÓN FÍSICA', value: blocks.exploracion_fisica },
            { label: 'IMPRESIÓN DIAGNÓSTICA', value: blocks.impresion_diagnostica },
            { label: 'PLAN', value: blocks.plan }
          ];
          extractedNota = narrative.filter(b => b.value).map(b => `**${b.label}:**\n${b.value}`).join('\n\n');
        } else {
          const nl = cleanJson.nota_limpia || cleanJson.Nota_Limpia;
          if (typeof nl === 'object' && nl !== null) {
            extractedNota = Object.entries(nl).map(([key, value]) => `**${key.toUpperCase()}:**\n${value}`).join('\n\n');
          } else extractedNota = nl || "";
        }

        if (extractedNota) {
          addNote(recordsProfileId, {
            id: Date.now().toString(),
            name: extractedPaciente,
            specialty: PROFILES.find(p => p.id === recordsProfileId)?.name || 'General',
            statusText: 'PENDIENTE',
            status: 'pending',
            time: Date.now(),
            transcription: extractedNota,
            rawTranscription: rawOutput,
            vitals: extractedVitals,
            specialtyColor: PROFILES.find(p => p.id === recordsProfileId)?.color || '#1B4F9B'
          });
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      }
    } catch (e: any) { 
      console.error("Error procesando nota:", e.message);
      Alert.alert('Error IA', 'No se pudo procesar la nota médica: ' + e.message); 
    }
  };

  const stopRecordingAndSend = async () => {
    try {
      setIsRecording(false);
      setIsProcessingAudio(true);
      await recording?.stopAndUnloadAsync();
      const uri = recording?.getURI();
      if (uri) await sendAudioToWebhook(uri);
    } finally {
      setRecording(null);
      setIsProcessingAudio(false);
    }
  };

  const handlePauseRecording = async () => {
    if (!recording) return;
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isPaused) await recording.startAsync(); else await recording.pauseAsync();
    setIsPaused(!isPaused);
  };

  const handleDeleteRecording = async () => {
    Alert.alert("Eliminar", "¿Descartar audio?", [
      { text: "No" },
      { text: "Sí", style: "destructive", onPress: () => { setIsRecording(false); cleanupRecording(); }}
    ]);
  };

  const getWaveHeight = (index: number) => {
    if (isPaused) return 8;
    const factor = Math.max(0, (metering + 160) / 160);
    return 12 + (factor * 70) + Math.sin(Date.now() / 150 + index) * 15;
  };

  const renderProfileItem = ({ item, index }: any) => {
    const isActive = recordsProfileId === item.id;
    const noteCount = notes[item.id]?.length || 0;
    return (
      <TouchableOpacity 
        onPress={() => handleProfileChange(item.id, index)}
        activeOpacity={0.7}
        className={`p-4 px-6 rounded-[30px] border flex-row items-center justify-between mr-3 ${isActive ? '' : 'bg-klino-card border-klino-background'}`}
        style={{ width: 180, height: 70, backgroundColor: isActive ? item.color : '#FFFFFF', borderColor: isActive ? item.color : '#F4F7FB' }}
      >
        <View className="flex-1">
          <Text className={`font-black text-xs ${isActive ? 'text-white' : 'text-klino-text'}`} numberOfLines={1}>{item.name}</Text>
          <Text className={`text-[9px] font-bold mt-0.5 uppercase ${isActive ? 'text-white/70' : 'text-klino-subtext'}`}>{noteCount} notas</Text>
        </View>
        <FolderClosed size={18} color={isActive ? '#FFF' : item.color} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-klino-background">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }} refreshControl={<RefreshControl refreshing={isSyncing} onRefresh={onRefresh} color="#1B4F9B" />}>
        <View className="p-6 pb-0">
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} className="mb-6">
            <Text className="text-3xl font-black text-klino-text tracking-tighter mb-5">Expedientes</Text>
            <View className="flex-row items-center bg-klino-card border border-klino-background rounded-2xl px-4 py-1 shadow-sm">
              <Search size={20} color="#5A6B7E" />
              <TextInput placeholder="Buscar paciente..." placeholderTextColor="#CBD5E1" className="flex-1 p-3 text-klino-text font-medium" value={searchQuery} onChangeText={setSearchQuery} />
            </View>
          </MotiView>
          <View className="mb-5">
            <Text className="text-klino-subtext font-semibold text-[11px] uppercase tracking-[1.5px] mb-4 ml-1">CARPETAS DE PERFIL</Text>
            <FlatList ref={profileListRef} data={PROFILES} renderItem={renderProfileItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} snapToInterval={180 + 12} snapToAlignment="center" decelerationRate="fast" getItemLayout={(_, index) => ({ length: 180 + 12, offset: (180 + 12) * index, index })} onScrollToIndexFailed={(info) => { profileListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true }); }} contentContainerStyle={{ paddingBottom: 10 }} />
          </View>
          <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex-row items-center mb-6">
            <Bluetooth size={16} color="#1B4F9B" /><Text className="text-klino-primary font-bold text-[10px] ml-3">Escuchando dispositivo Klino...</Text>
          </MotiView>
        </View>
        <View>{isLoading ? (<View className="py-20 items-center"><ActivityIndicator color="#1B4F9B" /></View>) : (<AnimatePresence mode="popLayout">{filteredNotes.map((note) => (<PatientCard key={`${recordsProfileId}-${note.id}`} profileId={recordsProfileId} {...note} />))}{filteredNotes.length === 0 && (<MotiView key={`empty-${recordsProfileId}`} from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 items-center justify-center py-20"><FolderOpen size={48} color="#CBD5E1" /><Text className="text-klino-subtext font-bold mt-4 uppercase text-[10px] tracking-widest text-center">Carpeta vacía</Text></MotiView>)}</AnimatePresence>)}</View>
      </ScrollView>
      <TouchableOpacity onPress={startRecording} disabled={isProcessingAudio} className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-klino-primary items-center justify-center shadow-lg">{isProcessingAudio ? <ActivityIndicator color="#FFF" /> : <Mic size={28} color="#FFF" />}</TouchableOpacity>
      <Modal visible={isRecording} transparent animationType="none">
        <View className="flex-1 bg-black/20 justify-center items-end">
          <AnimatePresence>
            {isRecording && (
              <MotiView from={{ translateX: 400, opacity: 0 }} animate={{ translateX: 0, opacity: 1 }} exit={{ translateX: 400, opacity: 0 }} transition={{ type: 'timing', duration: 300 }} className="bg-klino-card w-[85%] h-[420px] rounded-l-[40px] p-8 shadow-2xl border-y border-l border-slate-100">
                <View className="flex-row items-center mb-6">
                  <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center mr-4"><Mic2 size={24} color="#1B4F9B" /></View>
                  <View><Text className="text-klino-primary font-black uppercase tracking-[2px] text-[10px] mb-0.5">{isPaused ? 'En Pausa' : 'Escuchando...'}</Text><Text className="text-klino-text text-xl font-black tracking-tighter">Klino AI Flow</Text></View>
                </View>
                <View className="flex-1 justify-center items-center py-4"><View className="bg-klino-background w-full p-6 rounded-3xl border border-slate-50 items-center"><Text className="text-klino-subtext font-bold text-[9px] uppercase tracking-widest mb-4">Estado de la consulta</Text><View className="flex-row items-center space-x-2">{!isPaused && (<MotiView from={{ opacity: 1, scale: 1 }} animate={{ opacity: 0.3, scale: 1.2 }} transition={{ loop: true, duration: 1000 }} className="w-3 h-3 rounded-full bg-emerald-400 mr-2" />)}<Text className="text-klino-text font-black text-lg">{isPaused ? 'Grabación Detenida' : 'Capturando Audio'}</Text></View></View></View>
                <View className="flex-row justify-between items-center mt-6"><TouchableOpacity onPress={handleDeleteRecording} className="w-14 h-14 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100"><Trash2 size={20} color="#E8820C" /></TouchableOpacity><TouchableOpacity onPress={stopRecordingAndSend} className="flex-1 h-14 bg-klino-primary rounded-2xl items-center justify-center mx-4 shadow-lg shadow-klino-primary/30 flex-row"><Square size={18} color="white" fill="white" /><Text className="text-[11px] font-black text-white uppercase ml-3 tracking-widest">Finalizar</Text></TouchableOpacity><TouchableOpacity onPress={handlePauseRecording} className="w-14 h-14 bg-blue-50 rounded-2xl items-center justify-center border border-blue-100">{isPaused ? <Play size={22} color="#1B4F9B" fill="#1B4F9B" /> : <Pause size={22} color="#1B4F9B" fill="#1B4F9B" />}</TouchableOpacity></View>
                <View className="mt-8 flex-row items-center justify-center opacity-40"><ShieldCheck size={10} color="#1B4F9B" /><Text className="text-[8px] font-bold text-klino-subtext uppercase tracking-widest ml-2">Encriptado de Grado Médico</Text></View>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      </Modal>
    </View>
  );
};

export default RecordsScreen;
