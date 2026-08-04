import React, { useRef, useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, FlatList, Modal } from 'react-native';
import { ClipboardList, ChevronRight, FolderClosed, Mic2, Users, X, Bell } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Header from '../../src/components/Header';
import { MotiView, AnimatePresence } from 'moti';
import { useProfile } from '../../src/context/ProfileContext';
import { useRouter, useFocusEffect } from 'expo-router';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = 200;
const CARD_MARGIN = 12;
const SNAP_INTERVAL = CARD_WIDTH + CARD_MARGIN;

const PERFILES = [
  { id: '1', name: 'Medicina General', icon: FolderClosed, color: '#1B4F9B' },
  { id: '2', name: 'Cirugía', icon: FolderClosed, color: '#2A7D6F' },
  { id: '3', name: 'Pediatría', icon: FolderClosed, color: '#1E5FAD' },
];

const PENDIENTES = [
  { id: 'notas', title: 'Notas Pendientes', badge: 'Requires Action', color: '#E8820C', icon: ClipboardList, bg: 'bg-orange-50' },
  { id: 'pacientes', title: 'Pacientes Citados', badge: 'Agenda', color: '#10B981', icon: Users, bg: 'bg-emerald-50' },
];

const CITAS_MOCK = [
  { id: '1', name: 'Roberto Gómez', time: '09:00 AM', type: 'Consulta General', status: 'confirmed' },
  { id: '2', name: 'Elena Martínez', time: '10:30 AM', type: 'Seguimiento', status: 'waiting' },
  { id: '3', name: 'Julián Castro', time: '11:15 AM', type: 'Revisión Resultados', status: 'confirmed' },
];

export default function DashboardScreen() {
  const router = useRouter();
  const { dashboardProfileId, setDashboardProfileId, doctorName, notes } = useProfile();
  const [calendarFilter, setCalendarFilter] = useState<'Hoy' | 'Semana' | 'Mes'>('Hoy');
  const [isAgendaVisible, setIsAgendaVisible] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const totalPendingNotes = Object.values(notes).flat().filter((n: any) => n.status === 'pending').length;

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    return `Hoy es ${dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}`;
  };

  useFocusEffect(
    useCallback(() => {
      const index = PERFILES.findIndex(p => p.id === dashboardProfileId);
      if (index !== -1) {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index,
            animated: true,
            viewPosition: 0.5
          });
        }, 100);
      }
    }, [dashboardProfileId])
  );

  const handleProfileChange = async (id: string, index: number) => {
    await Haptics.selectionAsync();
    setDashboardProfileId(id);
    flatListRef.current?.scrollToIndex({
      index,
      animated: true,
      viewPosition: 0.5
    });
  };

  const handleCalendarFilter = async (filter: 'Hoy' | 'Semana' | 'Mes') => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCalendarFilter(filter);
  };

  const handleTrayPress = async (id: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === 'notas') {
      router.push('/records');
    } else if (id === 'pacientes') {
      setIsAgendaVisible(true);
    }
  };

  const renderProfileItem = ({ item, index }: { item: typeof PERFILES[0], index: number }) => {
    const isActive = dashboardProfileId === item.id;
    return (
      <MotiView
        animate={{ scale: isActive ? 1.05 : 0.95, opacity: isActive ? 1 : 0.6 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{ width: CARD_WIDTH, marginRight: CARD_MARGIN, paddingVertical: 5 }}
      >
        <TouchableOpacity 
          onPress={() => handleProfileChange(item.id, index)}
          activeOpacity={0.7}
          className={`p-4 px-6 rounded-[30px] border flex-row items-center justify-between ${isActive ? '' : 'bg-klino-card border-klino-background shadow-sm'}`}
          style={{ height: 80, backgroundColor: isActive ? item.color : '#FFF', borderColor: isActive ? item.color : '#F1F5F9' }}
        >
          <View className="flex-1">
            <Text className={`font-black text-sm mt-1 leading-4 ${isActive ? 'text-white' : 'text-klino-text'}`}>{item.name}</Text>
            <View className="flex-row items-center mt-1">
              <View className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-blue-300' : 'bg-klino-background'} mr-1.5`} />
              <Text className={`text-[8px] font-black uppercase tracking-widest ${isActive ? 'text-blue-100' : 'text-klino-subtext'}`}>{isActive ? 'Activo' : 'Inactivo'}</Text>
            </View>
          </View>
          <item.icon size={20} color={isActive ? '#FFF' : '#5A6B7E'} />
        </TouchableOpacity>
      </MotiView>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-klino-background dark:bg-slate-900">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} className="mb-8">
            <Text className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Buenos días, {doctorName.split(' ')[1] || doctorName}</Text>
            <View className="mt-1">
              <Text className="text-slate-500 dark:text-slate-400 text-sm font-medium">{getFormattedDate()}</Text>
              {totalPendingNotes > 0 && (
                <Text className="text-xs font-semibold mt-1 text-klino-primary">
                  Tienes {totalPendingNotes} {totalPendingNotes === 1 ? 'nota pendiente' : 'notas pendientes'} de revisión
                </Text>
              )}
            </View>
          </MotiView>

          {/* Klino Device Status - 3D Effect */}
          <MotiView 
            from={{ opacity: 0, translateY: 20, rotateX: '10deg' }}
            animate={{ opacity: 1, translateY: 0, rotateX: '0deg' }}
            transition={{ type: 'spring', damping: 20 }}
            className="bg-klino-primary p-6 rounded-3xl shadow-[0_15px_35px_rgb(27,79,155,0.3)] dark:shadow-[0_15px_35px_rgb(0,0,0,0.5)] mb-8 overflow-hidden border border-blue-400/20 dark:border-slate-800"
            style={{ transform: [{ perspective: 1000 }] }}
          >
            <View className="flex-row items-center">
              <View className="w-14 h-14 justify-center items-center mr-5 shadow-[0_0_20px_rgb(255,255,255,0.2)]">
                {[1, 2, 3].map((idx) => (
                  <MotiView
                    key={idx}
                    from={{ opacity: 0.6, scale: 1 }}
                    animate={{ opacity: 0, scale: 2.2 }}
                    transition={{ type: 'timing', duration: 2000, loop: true, delay: idx * 400, repeatReverse: false }}
                    className="absolute w-10 h-10 rounded-full bg-blue-400"
                  />
                ))}
                <View className="w-12 h-12 rounded-full bg-white/20 items-center justify-center backdrop-blur-md border border-white/30">
                  <Mic2 size={24} color="white" />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-xl tracking-tight">Prototipo Klino</Text>
                <View className="flex-row items-center mt-1.5">
                  <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-[0_0_10px_rgb(52,211,153,1)] border border-emerald-200" />
                  <Text className="text-emerald-300 text-[11px] font-bold uppercase tracking-widest">En Línea y Grabando</Text>
                </View>
              </View>
            </View>
          </MotiView>

          {/* Bandeja de Notas */}
          <View className="mb-10">
            <Text className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-[1.5px] mb-3 ml-1">PORTAL MÉDICO</Text>
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500, delay: 300 }}>
              <View className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/60 dark:border-slate-700 shadow-[0_4px_20px_rgb(0,0,0,0.03)] overflow-hidden">
                {PENDIENTES.map((item, index) => (
                  <TouchableOpacity 
                    key={item.id}
                    onPress={() => handleTrayPress(item.id)}
                    activeOpacity={0.7} 
                    className={`p-5 flex-row items-center justify-between ${index !== PENDIENTES.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''}`}
                  >
                    <View className="flex-row items-center flex-1">
                      <View className={`w-12 h-12 ${item.bg} dark:bg-slate-700/50 rounded-2xl justify-center items-center mr-4 relative border border-${item.id === 'notas' ? 'orange' : 'emerald'}-100 dark:border-slate-600`}>
                        <item.icon size={22} color={item.color} />
                        {item.id === 'notas' && totalPendingNotes > 0 && (
                          <MotiView 
                            from={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 800 }}
                            className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 bg-red-500 rounded-full border-2 border-white items-center justify-center shadow-[0_2px_5px_rgb(239,68,68,0.5)] px-1"
                          >
                            <Text className="text-white text-[10px] font-black">{totalPendingNotes}</Text>
                          </MotiView>
                        )}
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold text-slate-800 dark:text-white text-[16px]">{item.title}</Text>
                        <Text className="text-slate-500 dark:text-slate-400 text-[12px] font-medium mt-0.5">
                          {item.id === 'notas' ? 'Requieren tu firma electrónica' : (item.id === 'pacientes' ? 'Revisa tu agenda médica de hoy' : 'Hoy')}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color="#CBD5E1" />
                  </TouchableOpacity>
                ))}
                
                {/* Nuevo Portal Rápido de Alertas */}
                <TouchableOpacity 
                  onPress={() => router.push('/notifications')}
                  activeOpacity={0.7} 
                  className="p-5 flex-row items-center justify-between border-t border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-12 h-12 bg-blue-50 dark:bg-slate-700/50 rounded-2xl justify-center items-center mr-4 border border-blue-100 dark:border-slate-600 relative">
                      <View className="w-3 h-3 rounded-full bg-blue-500 absolute -top-1 -right-1 border-2 border-white dark:border-slate-800 shadow-sm" />
                      <Bell size={22} color="#1B4F9B" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-800 dark:text-white text-[16px]">Ajustes de Alertas</Text>
                      <Text className="text-slate-500 dark:text-slate-400 text-[12px] font-medium mt-0.5">Controla cómo te avisa Klino</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#CBD5E1" />
                </TouchableOpacity>

              </View>
            </MotiView>
          </View>

          {/* Modal de Agenda */}
            <Modal
              animationType="slide"
              transparent={true}
              visible={isAgendaVisible}
              onRequestClose={() => setIsAgendaVisible(false)}
            >
              <View className="flex-1 justify-end bg-black/40">
                <MotiView 
                  from={{ translateY: SCREEN_HEIGHT }}
                  animate={{ translateY: 0 }}
                  className="bg-white dark:bg-slate-900 rounded-t-[24px] p-6 pb-12 shadow-[0_-10px_40px_rgb(0,0,0,0.1)]"
                  style={{ height: SCREEN_HEIGHT * 0.85 }}
                >
                  <View className="flex-row justify-between items-center mb-6">
                    <View>
                      <Text className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Pacientes Citados</Text>
                      <Text className="text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase tracking-[1.5px] mt-1">AGENDA MÉDICA</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setIsAgendaVisible(false)}
                      className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center"
                    >
                      <X size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700 mb-6">
                    {(['Hoy', 'Semana', 'Mes'] as const).map((f) => (
                      <TouchableOpacity 
                        key={f} 
                        onPress={() => handleCalendarFilter(f)}
                        className={`flex-1 py-2.5 rounded-lg items-center ${calendarFilter === f ? 'bg-white dark:bg-slate-700 shadow-sm' : ''}`}
                      >
                        <Text className={`text-[12px] font-semibold tracking-wide ${calendarFilter === f ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View className="space-y-4">
                      {CITAS_MOCK.map((cita, idx) => (
                        <MotiView 
                          key={cita.id} 
                          from={{ opacity: 0, scale: 0.95 }} 
                          animate={{ opacity: 1, scale: 1 }} 
                          transition={{ type: 'spring', delay: 100 + (idx * 50) }}
                          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-[0_4px_15px_rgb(0,0,0,0.03)] flex-row items-center mb-3"
                        >
                          <View className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-2xl items-center justify-center mr-4 border border-slate-100 dark:border-slate-600 shadow-sm">
                            <Text className="text-klino-primary font-black text-[10px] uppercase tracking-widest">{cita.time.split(' ')[1]}</Text>
                            <Text className="text-slate-900 dark:text-white font-bold text-xl -mt-1">{cita.time.split(' ')[0]}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="font-bold text-slate-900 dark:text-white text-[16px]">{cita.name}</Text>
                            <Text className="text-[12px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider mt-1">{cita.type}</Text>
                          </View>
                          <View className={`px-2 py-1 rounded-md border ${cita.status === 'confirmed' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-800' : 'bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800'}`}>
                            <Text className={`text-[9px] font-black uppercase tracking-widest ${cita.status === 'confirmed' ? 'text-emerald-600 dark:text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`}>
                              {cita.status === 'confirmed' ? 'Confirmado' : 'En Sala'}
                            </Text>
                          </View>
                        </MotiView>
                      ))}
                    </View>
                  </ScrollView>
                </MotiView>
              </View>
            </Modal>

          {/* Perfiles - Eliminados por solicitud de usuario */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
