import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Bell, BatteryLow, MessageCircle, FileText, CheckCircle2, Trash, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { MotiView, AnimatePresence } from 'moti';
import Header from '../components/Header';
import { useProfile } from '../context/ProfileContext';
import { formatTimeAgo } from '../utils/time';

const ICON_MAP: Record<string, any> = {
  BatteryLow,
  MessageCircle,
  FileText,
  CheckCircle2
};

const NotificationsScreen = () => {
  const { notificationsList, markNotificationRead, deleteNotification, clearAllNotifications } = useProfile();
  const [filter, setFilter] = useState('all');

  const filteredNotifications = filter === 'all' 
    ? notificationsList 
    : notificationsList.filter(n => n.type === filter);

  const handlePressNotification = async (id: string, unread: boolean) => {
    if (unread) {
      await Haptics.selectionAsync();
      markNotificationRead(id);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Eliminar', '¿Borrar esta notificación?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        deleteNotification(id);
      }}
    ]);
  };

  const handleClearAll = () => {
    Alert.alert('Limpiar Todo', '¿Estás seguro de que deseas borrar TODAS las notificaciones?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Limpiar', style: 'destructive', onPress: async () => {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        clearAllNotifications();
      }}
    ]);
  };

  return (
    <View className="flex-1 bg-klino-background">
      <Header title="Notificaciones" showBack={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          {/* Filtros */}
          <View className="flex-row items-center mb-6">
            <View className="flex-row flex-1 bg-klino-card p-1.5 rounded-2xl border border-klino-background">
              {['all', 'hardware', 'patient'].map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setFilter(f);
                  }}
                  className={`flex-1 py-2 rounded-xl items-center ${filter === f ? 'bg-klino-background shadow-sm' : ''}`}
                >
                  <Text className={`text-[10px] font-black uppercase tracking-widest ${filter === f ? 'text-klino-primary' : 'text-klino-subtext'}`}>
                    {f === 'all' ? 'Todas' : f === 'hardware' ? 'Hardware' : 'Pacientes'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            {notificationsList.length > 0 && (
              <TouchableOpacity 
                onPress={handleClearAll}
                className="w-10 h-10 bg-orange-50 rounded-xl items-center justify-center ml-3 border border-orange-100"
              >
                <Trash2 size={18} color="#E8820C" />
              </TouchableOpacity>
            )}
          </View>

          {/* Lista */}
          <AnimatePresence>
            {filteredNotifications.map((noti, index) => {
              const IconComponent = ICON_MAP[noti.icon] || Bell;
              return (
                <MotiView
                  key={noti.id}
                  from={{ opacity: 0, scale: 0.95, translateY: 10 }}
                  animate={{ opacity: 1, scale: 1, translateY: 0 }}
                  transition={{ type: 'timing', delay: index * 50 }}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handlePressNotification(noti.id, noti.unread)}
                    className={`bg-klino-card p-5 rounded-[28px] mb-4 border shadow-sm flex-row items-center relative ${noti.unread ? 'border-klino-primary/20 bg-blue-50/20' : 'border-klino-background'}`}
                  >
                    {noti.unread && (
                      <View className="absolute top-5 right-5 w-2 h-2 rounded-full bg-klino-primary" />
                    )}
                    
                    <View 
                      style={{ backgroundColor: `${noti.color}15` }}
                      className="w-12 h-12 rounded-2xl justify-center items-center mr-4"
                    >
                      <IconComponent size={22} color={noti.color} />
                    </View>

                    <View className="flex-1">
                      <View className="flex-row justify-between items-start pr-4">
                        <Text className={`font-black text-[13px] ${noti.unread ? 'text-klino-text' : 'text-klino-subtext'}`} numberOfLines={1}>{noti.title}</Text>
                        <Text className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">{formatTimeAgo(noti.time)}</Text>
                      </View>
                      <Text className="text-[11px] text-klino-subtext font-medium mt-1 leading-4" numberOfLines={2}>
                        {noti.description}
                      </Text>
                    </View>
                    
                    <TouchableOpacity 
                      onPress={() => handleDelete(noti.id)} 
                      className="p-2 ml-1"
                    >
                      <Trash size={16} color="#CBD5E1" />
                    </TouchableOpacity>

                  </TouchableOpacity>
                </MotiView>
              );
            })}
          </AnimatePresence>

          {filteredNotifications.length === 0 && (
            <View className="flex-1 items-center justify-center py-20">
              <Bell size={48} color="#CBD5E1" strokeWidth={1} />
              <Text className="text-klino-subtext font-bold text-sm uppercase mt-4 tracking-widest">No hay notificaciones</Text>
            </View>
          )}

        </View>
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;