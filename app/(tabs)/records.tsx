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
      from={{ opacity: 0, scale: 0.95, translateY: 10 }} 
      animate={{ opacity: 1, scale: 1, translateY: 0 }} 
      exit={{ opacity: 0, scale: 0.95, transition: { type: 'timing', duration: 150 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }} 
      className="bg-white dark:bg-slate-800 rounded-2xl mb-3 shadow-[0_2px_10px_rgb(0,0,0,0.02)] border border-slate-100 dark:border-slate-700 mx-6"
    >
      <TouchableOpacity 
        activeOpacity={0.7} 
        onPress={handleReviewNote}
        className="flex-row items-center p-4"
      >
        <View className={`w-12 h-12 ${config.bg} rounded-full items-center justify-center mr-4`}>
          <Text className="text-white font-semibold text-lg">{getInitials(name)}</Text>
        </View>

        <View className="flex-1">
          <View className="flex-row justify-between items-start mb-1">
            <View className="flex-1 pr-2">
              <Text className="text-[15px] font-semibold text-slate-900 dark:text-white tracking-tight" numberOfLines={1}>{name}</Text>
              <Text className="text-[12px] text-slate-500 dark:text-slate-400 font-medium" numberOfLines={1}>{specialty}</Text>
            </View>
            <View className={`${config.lightBg} dark:bg-opacity-20 px-2 py-1 rounded-md border border-black/5`}>
              <Text className={`${config.textColor} text-[9px] font-bold uppercase tracking-wider`}>{config.label}</Text>
            </View>
          </View>

          <View className="flex-row justify-between items-center mt-1">
            <TimeDisplay
              time={time}
              className="text-[11px] text-slate-400 font-medium"
            />

            <View className="flex-row space-x-2">
              <View className={`w-8 h-8 rounded-full ${config.iconBg} dark:bg-opacity-20 items-center justify-center border border-black/5`}>
                <Eye size={14} color="#64748B" />
              </View>
              <TouchableOpacity 
                onPress={handleDelete}
                className={`w-8 h-8 rounded-full bg-red-50 dark:bg-red-900/20 items-center justify-center border border-red-100 dark:border-red-900/50`}
              >
                <Trash size={14} color="#EF4444" />
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
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } else {
      // @ts-ignore
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording, isPaused]);

  const formatRecordingTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };
  
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
      setRecordingDuration(0);
      setShowDeleteConfirm(false);
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
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setIsPaused(true); // Pausar grabación visualmente
    setShowDeleteConfirm(true);
  };

  const confirmDeleteRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    cleanupRecording();
    setShowDeleteConfirm(false);
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
        className={`p-4 px-5 rounded-2xl border flex-row items-center justify-between mr-3 ${isActive ? 'shadow-[0_4px_15px_rgb(0,0,0,0.1)]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-[0_2px_8px_rgb(0,0,0,0.02)]'}`}
        style={{ width: 160, height: 64, backgroundColor: isActive ? item.color : undefined, borderColor: isActive ? item.color : undefined }}
      >
        <View className="flex-1">
          <Text className={`font-semibold text-[13px] ${isActive ? 'text-white' : 'text-slate-800 dark:text-white'}`} numberOfLines={1}>{item.name}</Text>
          <Text className={`text-[10px] font-medium mt-0.5 uppercase tracking-wide ${isActive ? 'text-white/80' : 'text-slate-400'}`}>{noteCount} notas</Text>
        </View>
        <FolderClosed size={16} color={isActive ? '#FFF' : item.color} />
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-klino-background dark:bg-slate-900">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }} refreshControl={<RefreshControl refreshing={isSyncing} onRefresh={onRefresh} color="#1B4F9B" />}>
        <View className="p-6 pb-0">
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} className="mb-6">
            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-5">Expedientes</Text>
            <View className="flex-row items-center bg-slate-200/50 dark:bg-slate-800 rounded-[10px] px-3 py-1.5 border border-slate-200/50 dark:border-slate-700">
              <Search size={18} color="#94A3B8" />
              <TextInput placeholder="Buscar paciente..." placeholderTextColor="#94A3B8" className="flex-1 p-2 text-slate-800 dark:text-white font-medium" value={searchQuery} onChangeText={setSearchQuery} />
            </View>
          </MotiView>
          <View className="mb-5">
            <Text className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-[1.5px] mb-3 ml-1">CARPETAS DE PERFIL</Text>
            <FlatList ref={profileListRef} data={PROFILES} renderItem={renderProfileItem} keyExtractor={(item) => item.id} horizontal showsHorizontalScrollIndicator={false} snapToInterval={160 + 12} snapToAlignment="center" decelerationRate="fast" getItemLayout={(_, index) => ({ length: 160 + 12, offset: (160 + 12) * index, index })} onScrollToIndexFailed={(info) => { profileListRef.current?.scrollToOffset({ offset: info.averageItemLength * info.index, animated: true }); }} contentContainerStyle={{ paddingBottom: 10 }} />
          </View>
          <MotiView from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/50 p-3 rounded-xl flex-row items-center mb-5">
            <Bluetooth size={14} color="#1B4F9B" /><Text className="text-klino-primary dark:text-blue-400 font-semibold text-[11px] ml-2 tracking-wide">Escuchando dispositivo Klino...</Text>
          </MotiView>
        </View>
        <View>{isLoading ? (<View className="py-20 items-center"><ActivityIndicator color="#1B4F9B" /></View>) : (<AnimatePresence mode="popLayout">{filteredNotes.map((note) => (<PatientCard key={`${recordsProfileId}-${note.id}`} profileId={recordsProfileId} {...note} />))}{filteredNotes.length === 0 && (<MotiView key={`empty-${recordsProfileId}`} from={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex-1 items-center justify-center py-20"><FolderOpen size={48} color="#CBD5E1" /><Text className="text-klino-subtext font-bold mt-4 uppercase text-[10px] tracking-widest text-center">Carpeta vacía</Text></MotiView>)}</AnimatePresence>)}</View>
      </ScrollView>
      <TouchableOpacity onPress={startRecording} disabled={isProcessingAudio} className="absolute bottom-6 right-6 w-16 h-16 rounded-full bg-klino-primary items-center justify-center shadow-lg">{isProcessingAudio ? <ActivityIndicator color="#FFF" /> : <Mic size={28} color="#FFF" />}</TouchableOpacity>
      <Modal visible={isRecording} transparent animationType="none">
        <View className="flex-1 bg-black/40 justify-end items-center">
          <AnimatePresence>
            {isRecording && (
              <MotiView from={{ translateY: SCREEN_HEIGHT, opacity: 1 }} animate={{ translateY: 0, opacity: 1 }} exit={{ translateY: SCREEN_HEIGHT, opacity: 1 }} transition={{ type: 'timing', duration: 400 }} className="bg-white dark:bg-slate-900 w-full h-[400px] rounded-t-[32px] p-8 shadow-[0_-10px_40px_rgb(0,0,0,0.15)] overflow-hidden relative">
                <View className="flex-row items-center mb-6">
                  <View className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-2xl items-center justify-center mr-4 border border-blue-100 dark:border-blue-900/50 shadow-[0_4px_15px_rgb(27,79,155,0.15)]">
                    <Mic2 size={26} color="#3B82F6" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-klino-primary dark:text-blue-400 font-bold uppercase tracking-[2px] text-[10px] mb-0.5">{isPaused ? 'EN PAUSA' : 'ESCUCHANDO...'}</Text>
                    <Text className="text-slate-900 dark:text-white text-[22px] font-bold tracking-tight">Dictado Médico</Text>
                  </View>
                  <View className="bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700">
                    <Text className="text-slate-900 dark:text-white font-bold text-sm tracking-widest">{formatRecordingTime(recordingDuration)}</Text>
                  </View>
                </View>
                
                <View className="flex-1 justify-center items-center py-2">
                  <View className="w-full flex-row items-center justify-center space-x-3 mb-6">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                      <MotiView key={i} from={{ height: 10 }} animate={{ height: getWaveHeight(i) }} transition={{ type: 'timing', duration: 150 }} className="w-2.5 rounded-full bg-klino-primary shadow-[0_0_8px_rgb(27,79,155,0.4)]" />
                    ))}
                  </View>
                  <Text className="text-slate-500 font-semibold text-[13px]">{isPaused ? 'Grabación Detenida' : 'Transcribiendo audio en tiempo real...'}</Text>
                </View>

                <View className="mt-4">
                  <View className="flex-row justify-between items-center">
                    <TouchableOpacity onPress={handleDeleteRecording} className="w-14 h-14 bg-red-50 dark:bg-red-900/20 rounded-full items-center justify-center border border-red-100 dark:border-red-900/50 shadow-sm">
                      <Trash2 size={20} color="#EF4444" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={stopRecordingAndSend} className="flex-1 h-14 bg-klino-primary rounded-full items-center justify-center mx-4 shadow-[0_8px_25px_rgb(27,79,155,0.3)] flex-row">
                      <Square size={16} color="white" fill="white" />
                      <Text className="text-[13px] font-bold text-white uppercase ml-3 tracking-widest">Finalizar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handlePauseRecording} className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-full items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                      {isPaused ? <Play size={20} color="#94A3B8" fill="#94A3B8" /> : <Pause size={20} color="#94A3B8" fill="#94A3B8" />}
                    </TouchableOpacity>
                  </View>
                </View>
                
                <View className="mt-8 flex-row items-center justify-center opacity-60">
                  <ShieldCheck size={12} color="#64748B" />
                  <Text className="text-[9px] font-bold text-slate-500 uppercase tracking-widest ml-2">Encriptado de Grado Médico</Text>
                </View>

                {/* OVERLAY CONFIRMACIÓN ELIMINAR */}
                <AnimatePresence>
                  {showDeleteConfirm && (
                    <MotiView 
                      from={{ opacity: 0 }} 
                      animate={{ opacity: 1 }} 
                      exit={{ opacity: 0 }} 
                      className="absolute top-0 left-0 right-0 bottom-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md justify-center items-center px-8 z-50 rounded-t-[32px]"
                    >
                      <View className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full items-center justify-center mb-6 shadow-sm border border-red-100 dark:border-red-900/50">
                        <Trash2 size={28} color="#EF4444" />
                      </View>
                      <Text className="text-slate-900 dark:text-white font-bold text-xl mb-2 tracking-tight text-center">¿Descartar grabación?</Text>
                      <Text className="text-slate-500 dark:text-slate-400 font-medium text-[13px] text-center mb-8 px-4">El audio se eliminará permanentemente y no se procesará.</Text>
                      
                      <View className="flex-row space-x-3 w-full">
                        <TouchableOpacity onPress={() => { setShowDeleteConfirm(false); setIsPaused(false); }} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 items-center shadow-sm">
                          <Text className="text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-widest">Mantener</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={confirmDeleteRecording} className="flex-1 py-3.5 bg-red-500 rounded-xl items-center shadow-[0_4px_15px_rgb(239,68,68,0.3)]">
                          <Text className="text-white font-bold text-xs uppercase tracking-widest">Eliminar</Text>
                        </TouchableOpacity>
                      </View>
                    </MotiView>
                  )}
                </AnimatePresence>
              </MotiView>
            )}
          </AnimatePresence>
        </View>
      </Modal>
    </View>
  );
};

export default RecordsScreen;
