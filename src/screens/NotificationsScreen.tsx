import React from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { useProfile } from '../context/ProfileContext';

export default function NotificationsScreen() {
  const router = useRouter();
  const { notificationsList = [], markNotificationRead, clearAllNotifications } = useProfile();

  const handleClear = () => {
    clearAllNotifications();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
            <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
          </TouchableOpacity>
          <KlinoText variant="h2" style={{ fontSize: 20 }}>Avisos</KlinoText>
        </View>
        <TouchableOpacity onPress={handleClear}>
          <KlinoText variant="label" color={KLINO_COLORS.verde} style={{ letterSpacing: 1, fontWeight: 'bold' }}>LIMPIAR TODO</KlinoText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {notificationsList.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center', marginTop: 40 }}>
            <KlinoText variant="body" color={KLINO_COLORS.gris}>No tienes avisos nuevos.</KlinoText>
          </View>
        ) : (
          notificationsList.map((notif: any) => (
            <TouchableOpacity 
              key={notif.id}
              activeOpacity={0.8}
              onPress={() => markNotificationRead(notif.id)}
              style={{ flexDirection: 'row', paddingHorizontal: 24, paddingVertical: 20, backgroundColor: notif.unread ? KLINO_COLORS.papelHondo : KLINO_COLORS.papel, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}
            >
              {notif.unread ? (
                <View style={{ width: 20, height: 20, backgroundColor: KLINO_COLORS.ambar, marginTop: 2, marginRight: 16 }} />
              ) : (
                <View style={{ width: 20, height: 20, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, justifyContent: 'center', alignItems: 'center', marginTop: 2, marginRight: 16 }}>
                  <Check size={14} color={KLINO_COLORS.verde} strokeWidth={2.5} />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 4 }}>{notif.title}</KlinoText>
                <KlinoText variant="small" color={KLINO_COLORS.gris}>{notif.message}</KlinoText>
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* Resumen Semanal Card (Static for now) */}
        <TouchableOpacity activeOpacity={0.9} style={{ backgroundColor: KLINO_COLORS.verde, padding: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong, marginTop: 32 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <KlinoText variant="label" color={KLINO_COLORS.papelHondo} style={{ letterSpacing: 2 }}>RESUMEN SEMANAL</KlinoText>
            <ChevronRight size={20} color={KLINO_COLORS.papelHondo} strokeWidth={1.75} />
          </View>
          <KlinoText variant="h2" color={KLINO_COLORS.papel} style={{ fontSize: 28, marginBottom: 8 }}>Te ahorraste 6 h 40 m</KlinoText>
          <KlinoText variant="small" color={KLINO_COLORS.papelHondo} style={{ lineHeight: 20, marginBottom: 32 }}>74 documentos dictados · 71 aprobados · 41 s en promedio para aprobar</KlinoText>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 40 }}>
            <View style={{ flex: 1, height: 12, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 16, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 14, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 24, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 20, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 32, backgroundColor: KLINO_COLORS.ambar, marginHorizontal: 2 }} />
            <View style={{ flex: 1, height: 18, backgroundColor: 'rgba(244, 241, 234, 0.4)', marginHorizontal: 2 }} />
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}