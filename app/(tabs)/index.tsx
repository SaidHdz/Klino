import React, { useRef, useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions, FlatList, Modal } from 'react-native';
import { ClipboardList, ChevronRight, FolderClosed, Mic2, Users, X } from 'lucide-react-native';
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
  { id: 'pacientes', title: 'Pacientes Citados', badge: 'Agenda', color: '#1B4F9B', icon: Users, bg: 'bg-blue-50' },
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
    <SafeAreaView className="flex-1 bg-klino-background">
      <Header />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} className="mb-6">
            <Text className="text-4xl font-black text-klino-text tracking-tighter">Buenos días {doctorName}</Text>
            <View className="mt-1">
              <Text className="text-klino-subtext text-base font-medium">{getFormattedDate()}</Text>
              <Text className="text-sm font-bold mt-0.5 text-klino-accent">
                {totalPendingNotes === 1 ? 'Tienes 1 nota pendiente de revisión' : `Tienes ${totalPendingNotes} notas pendientes de revisión`}
              </Text>
            </View>
          </MotiView>

          {/* Klino Device Status */}
          <MotiView 
            from={{ opacity: 0, translateY: 20 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="bg-klino-primary p-6 rounded-[32px] shadow-lg shadow-klino-primary/20 mb-8 overflow-hidden"
          >
            <View className="flex-row items-center">
              <View className="w-12 h-12 justify-center items-center mr-4">
                {[1, 2, 3].map((idx) => (
                  <MotiView
                    key={idx}
                    from={{ opacity: 0.5, scale: 1 }}
                    animate={{ opacity: 0, scale: 2 }}
                    transition={{ type: 'timing', duration: 2000, loop: true, delay: idx * 400, repeatReverse: false }}
                    className="absolute w-8 h-8 rounded-full bg-blue-400"
                  />
                ))}
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center">
                  <Mic2 size={20} color="white" />
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-white font-black text-lg tracking-tight">Klino Device</Text>
                <View className="flex-row items-center mt-0.5">
                  <View className="w-2 h-2 rounded-full bg-emerald-400 mr-2 shadow-sm shadow-emerald-400" />
                  <Text className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest">En Línea y Escuchando</Text>
                </View>
              </View>
            </View>
          </MotiView>

          {/* Bandeja de Notas */}
          <View className="mb-8">
            <Text className="text-klino-subtext font-semibold text-[11px] uppercase tracking-[1.5px] mb-4 ml-1">BANDEJA DE ACCIÓN</Text>
            {PENDIENTES.map((item, index) => (
              <MotiView key={item.id} from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 500, delay: 500 + (index * 150) }}>
                <TouchableOpacity 
                  onPress={() => handleTrayPress(item.id)}
                  activeOpacity={0.7} 
                  className="bg-klino-card p-5 rounded-[28px] border border-klino-background shadow-sm flex-row items-center justify-between mb-4"
                >
                  <View className="flex-row items-center flex-1">
                    <View className={`w-12 h-12 ${item.bg} rounded-2xl justify-center items-center mr-4 relative`}>
                      <item.icon size={24} color={item.color} />
                      {item.id === 'notas' && totalPendingNotes > 0 && (
                        <View className="absolute -top-1 -right-1 w-5 h-5 bg-klino-accent rounded-full border-2 border-white items-center justify-center shadow-sm">
                          <Text className="text-white text-[10px] font-black">{totalPendingNotes}</Text>
                        </View>
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="font-black text-klino-text text-base">{item.title}</Text>
                      <View className="bg-klino-background px-2.5 py-0.5 rounded-md self-start mt-1">
                        <Text className="text-klino-subtext text-[8px] font-black uppercase tracking-tighter">
                          {item.id === 'notas' ? 'PENDIENTE DE REVISIÓN' : (item.id === 'pacientes' ? 'AGENDA MÉDICA' : 'HOY')}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#CBD5E1" />
                </TouchableOpacity>
              </MotiView>
            ))}
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
                  className="bg-klino-background rounded-t-[40px] p-6 pb-12 shadow-2xl"
                  style={{ height: SCREEN_HEIGHT * 0.85 }}
                >
                  <View className="flex-row justify-between items-center mb-8">
                    <View>
                      <Text className="text-klino-subtext font-semibold text-[11px] uppercase tracking-[1.5px] mb-1">AGENDA MÉDICA</Text>
                      <Text className="text-3xl font-black text-klino-text tracking-tight">Pacientes Citados</Text>
                    </View>
                    <TouchableOpacity 
                      onPress={() => setIsAgendaVisible(false)}
                      className="w-10 h-10 bg-slate-100 rounded-full items-center justify-center"
                    >
                      <X size={20} color="#5A6B7E" />
                    </TouchableOpacity>
                  </View>

                  <View className="flex-row bg-klino-card p-1 rounded-2xl border border-slate-100 mb-6">
                    {(['Hoy', 'Semana', 'Mes'] as const).map((f) => (
                      <TouchableOpacity 
                        key={f} 
                        onPress={() => handleCalendarFilter(f)}
                        className={`flex-1 py-3 rounded-xl items-center ${calendarFilter === f ? 'bg-klino-primary shadow-sm' : ''}`}
                      >
                        <Text className={`text-[11px] font-black uppercase tracking-wider ${calendarFilter === f ? 'text-white' : 'text-klino-subtext'}`}>{f}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                    <View className="space-y-4">
                      {CITAS_MOCK.map((cita, idx) => (
                        <MotiView 
                          key={cita.id} 
                          from={{ opacity: 0, translateX: -20 }} 
                          animate={{ opacity: 1, translateX: 0 }} 
                          transition={{ delay: 100 + (idx * 100) }}
                          className="bg-klino-card p-5 rounded-[32px] border border-klino-background shadow-sm flex-row items-center mb-4"
                        >
                          <View className="w-16 h-16 bg-klino-background rounded-2xl items-center justify-center mr-4">
                            <Text className="text-klino-primary font-black text-[10px] uppercase">{cita.time.split(' ')[1]}</Text>
                            <Text className="text-klino-text font-black text-xl -mt-1">{cita.time.split(' ')[0]}</Text>
                          </View>
                          <View className="flex-1">
                            <Text className="font-black text-klino-text text-lg">{cita.name}</Text>
                            <Text className="text-[11px] text-klino-subtext font-bold uppercase tracking-wider">{cita.type}</Text>
                          </View>
                          <View className={`w-3 h-3 rounded-full ${cita.status === 'confirmed' ? 'bg-emerald-400' : 'bg-orange-400'} mr-2`} />
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
