import React, { useState, useEffect, useRef } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform, Modal, TextInput, KeyboardAvoidingView, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import { KLINO_COLORS } from '../../src/constants/theme';
import { KlinoText } from '../../src/components/common/KlinoText';
import { X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { FadingScrollContainer } from '../../src/components/common/FadingScrollContainer';

interface Appointment {
  id: string;
  patientName: string;
  time: string;
  type: string;
  status: 'atendida' | 'pendiente_aprobacion' | 'confirmada' | 'sin_confirmar';
  dateStr: string;
}

const STORAGE_KEY = '@Klino_Appointments';

export default function AgendaScreen() {
  const router = useRouter();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isModalVisible, setModalVisible] = useState(false);
  const [isCalendarModalVisible, setCalendarModalVisible] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  
  // New appointment form state
  const [newPatientName, setNewPatientName] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newType, setNewType] = useState('Consulta');

  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [newStatus, setNewStatus] = useState<Appointment['status']>('sin_confirmar');

  useEffect(() => {
    loadAppointments();
  }, []);

  // Resetear a "hoy" al entrar a la pestaña, y hacer auto-scroll
  useFocusEffect(
    React.useCallback(() => {
      const today = new Date();
      setSelectedDate(today);
      
      // Delay corto para asegurar que el layout está listo
      setTimeout(() => {
        if (scrollRef.current) {
          const itemWidth = 80;
          const index = today.getDate(); 
          const offset = (index * itemWidth) - (Dimensions.get('window').width / 2) + (itemWidth / 2);
          scrollRef.current.scrollTo({ x: Math.max(0, offset), animated: true });
        }
      }, 100);
      loadAppointments(); // Recargar en caso de que cambie en otra pantalla
    }, [])
  );

  // Auto-scroll cuando el usuario selecciona una fecha diferente (manual)
  useEffect(() => {
    if (scrollRef.current) {
      setTimeout(() => {
        const itemWidth = 80;
        const index = selectedDate.getDate(); 
        const offset = (index * itemWidth) - (Dimensions.get('window').width / 2) + (itemWidth / 2);
        scrollRef.current?.scrollTo({ x: Math.max(0, offset), animated: true });
      }, 50);
    }
  }, [selectedDate]);

  const loadAppointments = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (data) {
        setAppointments(JSON.parse(data));
      } else {
        const mock: Appointment[] = [];
        setAppointments(mock);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
      }
    } catch (e) { console.error(e); }
  };

  const saveAppointment = async () => {
    if (!newPatientName) return;
    
    let updated;
    if (editingAppId) {
      updated = appointments.map(app => 
        app.id === editingAppId 
          ? { ...app, patientName: newPatientName, time: newTime, type: newType, status: newStatus }
          : app
      );
    } else {
      const newApp: Appointment = {
        id: Math.random().toString(),
        patientName: newPatientName,
        time: newTime,
        type: newType,
        status: newStatus,
        dateStr: formatDateId(selectedDate)
      };
      updated = [...appointments, newApp];
    }
    
    setAppointments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setModalVisible(false);
  };

  const deleteAppointment = async () => {
    if (!editingAppId) return;
    const updated = appointments.filter(app => app.id !== editingAppId);
    setAppointments(updated);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setModalVisible(false);
  };

  const openEditModal = (app?: Appointment) => {
    if (app) {
      setEditingAppId(app.id);
      setNewPatientName(app.patientName);
      setNewTime(app.time);
      setNewType(app.type);
      setNewStatus(app.status);
    } else {
      setEditingAppId(null);
      setNewPatientName('');
      setNewTime('09:00');
      setNewType('Consulta');
      setNewStatus('sin_confirmar');
    }
    setModalVisible(true);
  };

  const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
  const monthDays = Array.from({ length: daysInMonth }).map((_, i) => {
    return new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
  });

  const handlePrevMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 1));
  };

  const daysMap = ['DO', 'LU', 'MA', 'MI', 'JU', 'VI', 'SA'];
  const monthsMap = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  const fullDaysMap = ['DOMINGO', 'LUNES', 'MARTES', 'MIÉRCOLES', 'JUEVES', 'VIERNES', 'SÁBADO'];

  function formatDateId(d: Date) {
    return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
  }

  const selectedDateId = formatDateId(selectedDate);
  const todaysAppointments = appointments.filter(a => a.dateStr === selectedDateId).sort((a, b) => a.time.localeCompare(b.time));
  const unconfirmedCount = todaysAppointments.filter(a => a.status === 'sin_confirmar').length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <KlinoText variant="h2" style={{ fontSize: 24 }}>Agenda</KlinoText>
        <View style={{ flexDirection: 'row', gap: 24 }}>
          <TouchableOpacity onPress={() => setCalendarModalVisible(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ fontWeight: 'bold', letterSpacing: 1 }}>CALENDARIO</KlinoText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openEditModal()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', letterSpacing: 1 }}>+ CITA</KlinoText>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ borderBottomWidth: 1, borderTopWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <FadingScrollContainer scrollRef={scrollRef} contentContainerStyle={{ paddingHorizontal: 0 }}>
          
          <TouchableOpacity onPress={handlePrevMonth} style={{ width: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: KLINO_COLORS.papelHondo }}>
            <ChevronLeft color={KLINO_COLORS.gris} size={24} />
          </TouchableOpacity>

          {monthDays.map((d, i) => {
            const isSelected = formatDateId(d) === selectedDateId;
            return (
              <TouchableOpacity 
                key={i} 
                onPress={() => setSelectedDate(d)} 
                style={{ width: 80, alignItems: 'center', paddingVertical: 12, backgroundColor: isSelected ? KLINO_COLORS.verde : 'transparent' }}
              >
                <KlinoText variant="small" color={isSelected ? KLINO_COLORS.papel : KLINO_COLORS.tinta}>{daysMap[d.getDay()]}</KlinoText>
                <KlinoText variant="body" color={isSelected ? KLINO_COLORS.papel : KLINO_COLORS.tinta} style={{ fontWeight: 'bold', marginTop: 4 }}>{d.getDate()}</KlinoText>
              </TouchableOpacity>
            )
          })}

          <TouchableOpacity onPress={handleNextMonth} style={{ width: 80, alignItems: 'center', justifyContent: 'center', backgroundColor: KLINO_COLORS.papelHondo }}>
            <ChevronRight color={KLINO_COLORS.gris} size={24} />
          </TouchableOpacity>

        </FadingScrollContainer>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16 }}>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 2 }}>{`${fullDaysMap[selectedDate.getDay()]} ${selectedDate.getDate()} DE ${monthsMap[selectedDate.getMonth()].toUpperCase()}`}</KlinoText>
        <KlinoText variant="small" color={KLINO_COLORS.gris}>{todaysAppointments.length} citas · {unconfirmedCount} sin confirmar</KlinoText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        {todaysAppointments.length === 0 ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay citas para este día.</KlinoText>
          </View>
        ) : (
          todaysAppointments.map((app, index) => {
            const isPending = app.status === 'pendiente_aprobacion';
            return (
              <TouchableOpacity key={app.id} onPress={() => openEditModal(app)} activeOpacity={0.8} style={{ borderTopWidth: 1, borderBottomWidth: index === todaysAppointments.length - 1 ? 1 : 0, borderColor: KLINO_COLORS.borderStrong, flexDirection: 'row', backgroundColor: isPending ? KLINO_COLORS.papelHondo : KLINO_COLORS.papel }}>
                <View style={{ padding: 24, width: 100 }}>
                  <KlinoText variant="body" color={KLINO_COLORS.verde} style={{ fontWeight: 'bold', fontSize: 18 }}>{app.time}</KlinoText>
                </View>
                <View style={{ paddingVertical: 24, paddingRight: 24, flex: 1 }}>
                  <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{app.patientName}</KlinoText>
                  
                  {app.status === 'atendida' && <KlinoText variant="small" color={KLINO_COLORS.gris}>{app.type} · atendida</KlinoText>}
                  {app.status === 'sin_confirmar' && <KlinoText variant="small" color={KLINO_COLORS.gris}>{app.type} · sin confirmar</KlinoText>}
                  {app.status === 'confirmada' && <KlinoText variant="small" color={KLINO_COLORS.gris}>{app.type} · confirmada</KlinoText>}
                  {app.status === 'pendiente_aprobacion' && <KlinoText variant="small" color={KLINO_COLORS.gris}>Atendida · la historia clínica espera tu aprobación</KlinoText>}
                  
                  {app.status === 'pendiente_aprobacion' && (
                    <TouchableOpacity onPress={() => router.push('/(tabs)')} style={{ backgroundColor: KLINO_COLORS.ambar, paddingVertical: 12, paddingHorizontal: 24, alignSelf: 'flex-start', marginTop: 16 }}>
                      <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', letterSpacing: 1 }}>APROBAR</KlinoText>
                    </TouchableOpacity>
                  )}
                  {app.status === 'confirmada' && (
                    <TouchableOpacity onPress={() => router.push('/live-consultation')} style={{ borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, backgroundColor: KLINO_COLORS.papel, paddingVertical: 12, paddingHorizontal: 24, alignSelf: 'flex-start', marginTop: 16 }}>
                      <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold', letterSpacing: 1 }}>DICTAR</KlinoText>
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* MODAL PARA NUEVA CITA / EDITAR */}
      <Modal visible={isModalVisible} animationType="slide" transparent={true}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <View style={{ backgroundColor: KLINO_COLORS.papel, padding: 24, borderTopLeftRadius: 0, borderTopRightRadius: 0, height: '85%' }}>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <KlinoText variant="h2">{editingAppId ? 'Editar Cita' : 'Nueva Cita'}</KlinoText>
              <TouchableOpacity onPress={() => setModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 8 }}>NOMBRE DEL PACIENTE</KlinoText>
              <TextInput 
                style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, fontSize: 18, paddingVertical: 12, marginBottom: 24, fontFamily: 'serif' }}
                value={newPatientName}
                onChangeText={setNewPatientName}
                placeholder="Ej. Juan Pérez"
              />

              <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 8 }}>HORA (HH:MM)</KlinoText>
              <TextInput 
                style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, fontSize: 18, paddingVertical: 12, marginBottom: 24, fontFamily: 'serif' }}
                value={newTime}
                onChangeText={setNewTime}
                placeholder="09:00"
                keyboardType="numbers-and-punctuation"
              />

              <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 8 }}>TIPO DE CITA</KlinoText>
              <TextInput 
                style={{ borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, fontSize: 18, paddingVertical: 12, marginBottom: 32, fontFamily: 'serif' }}
                value={newType}
                onChangeText={setNewType}
                placeholder="Consulta, Seguimiento, etc."
              />

              <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 8 }}>ESTADO DE LA CITA</KlinoText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 40 }}>
                {(['sin_confirmar', 'confirmada', 'atendida', 'pendiente_aprobacion'] as Appointment['status'][]).map(status => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => setNewStatus(status)}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      borderWidth: 1,
                      borderColor: newStatus === status ? KLINO_COLORS.verde : KLINO_COLORS.borderStrong,
                      backgroundColor: newStatus === status ? KLINO_COLORS.verde : KLINO_COLORS.papel,
                      borderRadius: 4
                    }}
                  >
                    <KlinoText variant="small" color={newStatus === status ? KLINO_COLORS.papel : KLINO_COLORS.tinta} style={{ fontWeight: 'bold' }}>
                      {status === 'sin_confirmar' ? 'SIN CONFIRMAR' : status === 'confirmada' ? 'CONFIRMADA' : status === 'atendida' ? 'ATENDIDA' : 'PENDIENTE'}
                    </KlinoText>
                  </TouchableOpacity>
                ))}
              </View>

              {editingAppId && (newStatus === 'confirmada' || newStatus === 'sin_confirmar') && (
                <TouchableOpacity onPress={() => { setModalVisible(false); router.push('/live-consultation'); }} style={{ backgroundColor: KLINO_COLORS.papelHondo, paddingVertical: 16, alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
                  <KlinoText variant="label" color={KLINO_COLORS.tinta} style={{ fontWeight: 'bold' }}>ABRIR CONSULTA (DICTAR)</KlinoText>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={saveAppointment} style={{ backgroundColor: KLINO_COLORS.verde, paddingVertical: 16, alignItems: 'center', marginBottom: 12 }}>
                <KlinoText variant="label" color={KLINO_COLORS.papel} style={{ fontWeight: 'bold' }}>GUARDAR CAMBIOS</KlinoText>
              </TouchableOpacity>

              {editingAppId && (
                <TouchableOpacity onPress={deleteAppointment} style={{ paddingVertical: 16, alignItems: 'center', marginBottom: 24 }}>
                  <KlinoText variant="label" color={KLINO_COLORS.ambar} style={{ fontWeight: 'bold' }}>ELIMINAR CITA</KlinoText>
                </TouchableOpacity>
              )}
            </ScrollView>

          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* MODAL DE CALENDARIO COMPLETO */}
      <Modal visible={isCalendarModalVisible} animationType="fade" transparent={true}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: KLINO_COLORS.papel, padding: 24 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <KlinoText variant="h2">{monthsMap[selectedDate.getMonth()].toUpperCase()} {selectedDate.getFullYear()}</KlinoText>
              <TouchableOpacity onPress={() => setCalendarModalVisible(false)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <X size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
              </TouchableOpacity>
            </View>
            
            <View style={{ flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingBottom: 8 }}>
              {daysMap.map(d => (
                <View key={d} style={{ flex: 1, alignItems: 'center' }}>
                  <KlinoText variant="label" color={KLINO_COLORS.gris}>{d}</KlinoText>
                </View>
              ))}
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {/* Calendario simplificado para el mes actual */}
              {Array.from({ length: 31 }).map((_, i) => {
                const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i + 1);
                // Si el mes cambia, no renderizar (simplificación)
                if (dayDate.getMonth() !== selectedDate.getMonth()) return null;
                const isSelected = dayDate.getDate() === selectedDate.getDate();
                const colOffset = i === 0 ? dayDate.getDay() : 0;

                return (
                  <View key={i} style={{ width: '14.28%', marginLeft: colOffset ? `${colOffset * 14.28}%` : 0, aspectRatio: 1, padding: 2 }}>
                    <TouchableOpacity 
                      onPress={() => {
                        setSelectedDate(dayDate);
                        setCalendarModalVisible(false);
                      }}
                      style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: isSelected ? KLINO_COLORS.verde : KLINO_COLORS.papelHondo, borderWidth: 1, borderColor: isSelected ? KLINO_COLORS.verde : KLINO_COLORS.borderStrong }}
                    >
                      <KlinoText variant="body" color={isSelected ? KLINO_COLORS.papel : KLINO_COLORS.tinta} style={{ fontWeight: 'bold' }}>{i + 1}</KlinoText>
                    </TouchableOpacity>
                  </View>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}
