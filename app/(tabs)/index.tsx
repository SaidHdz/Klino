import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform, Image } from 'react-native';
import { Search, Bell, ScanLine, CheckSquare, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../../src/constants/theme';
import { KlinoText } from '../../src/components/common/KlinoText';
import { KlinoButton } from '../../src/components/common/KlinoButton';
import { KlinoBadge } from '../../src/components/common/KlinoBadge';
import { useProfile } from '../../src/context/ProfileContext';

export default function DashboardScreen() {
  const router = useRouter();
  const { doctorName, notes, notificationsList } = useProfile();
  
  // Extraer el primer nombre para el saludo
  const firstName = doctorName ? doctorName.split(' ')[0] : 'Dr/Dra';
  if (firstName.toLowerCase().startsWith('dr') && doctorName.split(' ').length > 1) {
     var nameOnly = doctorName.split(' ')[1];
  } else {
     var nameOnly = firstName;
  }

  // Extraer todas las notas pendientes guardando su respectivo profileId
  const allNotes = Object.entries(notes || {}).flatMap(([pId, pNotes]) => 
    (pNotes || []).map((n: any) => ({ ...n, profileId: pId }))
  );
  const pendingNotes = allNotes.filter(n => n.status === 'pending').sort((a, b) => Number(b.time) - Number(a.time));

  // Formato de fecha
  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Buenos días';
    if (hour >= 12 && hour < 19) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const formatTimeStr = (ts: string | number) => {
    const d = new Date(Number(ts));
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Image 
            source={require('../../assets/klino-brand-kit/logo/symbol/symbol-micro-verde.png')} 
            style={{ width: 24, height: 24, marginRight: 8 }} 
            resizeMode="contain"
          />
          <KlinoText variant="h3" style={{ fontSize: 16, letterSpacing: 2 }}>KLINO</KlinoText>
        </View>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Search size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
          </TouchableOpacity>
          <TouchableOpacity 
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} 
            style={{ position: 'relative' }}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
            {notificationsList.some((n: any) => n.unread) && <KlinoBadge dotOnly variant="amber" style={{ position: 'absolute', top: -2, right: -2 }} />}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        
        {/* ESCANEAR DOCUMENTO */}
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push('/scanner-select')}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderTopWidth: 1, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, paddingVertical: 16, marginBottom: 32 }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <ScanLine size={20} color={KLINO_COLORS.verde} strokeWidth={1.75} />
            <KlinoText variant="label" color={KLINO_COLORS.verde}>ESCANEAR DOCUMENTO</KlinoText>
          </View>
          <ChevronRight size={20} color={KLINO_COLORS.gris} strokeWidth={1.75} />
        </TouchableOpacity>

        {/* TITULAR */}
        <View style={{ marginBottom: 24 }}>
          <KlinoText variant="h2">{getGreeting()}, {nameOnly}</KlinoText>
          <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ marginTop: 4 }}>
            {getFormattedDate()}
          </KlinoText>
        </View>

        {/* PENDIENTES DE APROBAR */}
        <View style={{ backgroundColor: KLINO_COLORS.papelHondo, borderTopWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginBottom: 32 }}>
          
          <View style={{ padding: 16, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderHairline }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <View style={{ backgroundColor: pendingNotes.length > 0 ? KLINO_COLORS.ambar : KLINO_COLORS.borderStrong, padding: 2 }}>
                <CheckSquare size={12} color={KLINO_COLORS.tinta} strokeWidth={2} />
              </View>
              <KlinoText variant="label" color={pendingNotes.length > 0 ? KLINO_COLORS.ambarTinta : KLINO_COLORS.gris}>ESPERA TU APROBACIÓN</KlinoText>
            </View>
            <KlinoText variant="h3">{pendingNotes.length} {pendingNotes.length === 1 ? 'documento' : 'documentos'} sin aprobar</KlinoText>
          </View>

          {pendingNotes.slice(0, 5).map((note, idx) => (
            <PendingItem 
              key={note.id} 
              name={note.name} 
              type={note.specialty === 'General' ? 'Historia clínica' : 'Nota de evolución'} 
              time={formatTimeStr(note.time)} 
              isLast={idx === Math.min(pendingNotes.length, 5) - 1} 
              onPress={() => router.push(`/note-review?id=${note.id}&profileId=${note.profileId}`)}
            />
          ))}

          {pendingNotes.length > 0 && (
            <KlinoButton title="REVISAR Y APROBAR" fullWidth onPress={() => router.push(`/note-review?id=${pendingNotes[0].id}&profileId=${pendingNotes[0].profileId}`)} />
          )}
        </View>

        {/* AGENDA */}
        <NextAppointmentCard router={router} />

      </ScrollView>
    </SafeAreaView>
  );
}

const NextAppointmentCard = ({ router }: any) => {
  const [nextApp, setNextApp] = React.useState<any>(null);

  React.useEffect(() => {
    const fetchNextApp = async () => {
      try {
        const data = await import('@react-native-async-storage/async-storage').then(m => m.default.getItem('@Klino_Appointments'));
        if (data) {
          const apps = JSON.parse(data);
          const dateStr = `${new Date().getFullYear()}-${new Date().getMonth()}-${new Date().getDate()}`;
          const todayApps = apps.filter((a: any) => a.dateStr === dateStr && a.status !== 'atendida' && a.status !== 'pendiente_aprobacion');
          if (todayApps.length > 0) {
            // Asumimos que están ordenadas o tomamos la primera
            const sorted = todayApps.sort((a: any, b: any) => a.time.localeCompare(b.time));
            // Buscar la próxima cita después de la hora actual
            const nowTime = `${new Date().getHours().toString().padStart(2, '0')}:${new Date().getMinutes().toString().padStart(2, '0')}`;
            const next = sorted.find((a: any) => a.time >= nowTime) || sorted[0];
            setNextApp(next);
          }
        }
      } catch (e) {}
    };
    fetchNextApp();
  }, []);

  if (!nextApp) {
    return (
      <View>
        <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 12 }}>SIGUE EN TU AGENDA</KlinoText>
        <View style={{ padding: 24, borderTopWidth: 1, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, alignItems: 'center' }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay más citas para el día de hoy.</KlinoText>
        </View>
      </View>
    );
  }

  return (
    <View>
      <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ marginBottom: 12 }}>SIGUE EN TU AGENDA</KlinoText>
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)/agenda')}
        style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderTopWidth: 1, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}
      >
        <View style={{ marginRight: 16 }}>
          <KlinoText variant="h3" color={KLINO_COLORS.verde}>{nextApp.time}</KlinoText>
        </View>
        <View style={{ flex: 1 }}>
          <KlinoText variant="body" style={{ fontWeight: 'bold' }}>{nextApp.patientName}</KlinoText>
          <KlinoText variant="small" color={KLINO_COLORS.gris}>{nextApp.type} · {nextApp.status === 'confirmada' ? 'confirmada' : 'sin confirmar'}</KlinoText>
        </View>
        <ChevronRight size={20} color={KLINO_COLORS.gris} strokeWidth={1.75} />
      </TouchableOpacity>
    </View>
  );
};

const PendingItem = ({ name, type, time, isLast = false, onPress }: any) => (
  <TouchableOpacity 
    activeOpacity={0.7}
    onPress={onPress}
    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: isLast ? 0 : 1, borderColor: KLINO_COLORS.borderHairline }}
  >
    <View>
      <KlinoText variant="body" style={{ fontWeight: 'bold', marginBottom: 2 }}>{name}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{type} · {time}</KlinoText>
    </View>
    <ChevronRight size={20} color={KLINO_COLORS.gris} strokeWidth={1.75} />
  </TouchableOpacity>
);
