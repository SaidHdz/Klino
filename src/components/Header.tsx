import * as Haptics from 'expo-haptics';
import { useRouter, usePathname } from 'expo-router';
import { BatteryLow, Bell, BriefcaseMedical, FileText, MessageCircle, X, CheckCircle2, Trash2 } from 'lucide-react-native';
import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react';
import { Dimensions, Image, Platform, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProfile } from '../context/ProfileContext';
import { formatTimeAgo } from '../utils/time';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
// Ajuste milimétrico final para quedar al ras de la Tab Bar
const TAB_BAR_ESTIMATED_HEIGHT = 42; 

const ICON_MAP: Record<string, any> = {
  BatteryLow,
  MessageCircle,
  FileText,
  CheckCircle2
};

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  hideProfilePhoto?: boolean;
}

const Header = ({ title, showBack = false, hideProfilePhoto = false }: HeaderProps) => {
  const { primaryColor, notificationsList, clearAllNotifications, profileImage } = useProfile();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const [showNotifications, setShowNotifications] = useState(false);

  const safePaddingTop = Platform.OS === 'android' ? Math.max(insets.top, 30) : insets.top;
  const hasUnread = notificationsList.some(n => n.unread);

  const toggleNotifications = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowNotifications(!showNotifications);
  };

  // CERRAR AUTOMÁTICAMENTE AL NAVEGAR O CAMBIAR TAB (Fase 12)
  React.useEffect(() => {
    setShowNotifications(false);
  }, [pathname]);

  const handleBack = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleClearAll = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    clearAllNotifications();
  };

  return (
    <>
      <View style={{ paddingTop: safePaddingTop }} className="bg-klino-card border-b border-klino-background z-50">
        <View className="flex-row justify-between items-center px-6 py-4 h-16">
          
          {showBack ? (
            <TouchableOpacity 
              onPress={handleBack}
              activeOpacity={0.7}
              className="w-10 h-10 items-start justify-center"
            >
              <X size={24} color="#5A6B7E" style={{ transform: [{ rotate: '90deg' }] }} /> 
            </TouchableOpacity>
          ) : hideProfilePhoto ? (
            <View className="w-10 h-10" />
          ) : (
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              activeOpacity={0.7}
              className="w-10 h-10 rounded-full bg-klino-background overflow-hidden border-2 border-klino-background shadow-sm"
            >
              {profileImage ? (
                <Image 
                  key={profileImage}
                  source={{ uri: profileImage }}
                  className="w-full h-full"
                />
              ) : (
                <Image 
                  source={require('../../assets/images/fotosnupi.png')}
                  className="w-full h-full"
                />
              )}
            </TouchableOpacity>
          )}

          <View className="flex-1 flex-row items-center justify-center">
            {title ? (
              <Text className="text-base font-black text-klino-text uppercase tracking-tight">{title}</Text>
            ) : (
              <Text className="text-lg font-black text-klino-primary tracking-[4px]">Klino</Text>
            )}
          </View>

          <TouchableOpacity 
            onPress={toggleNotifications}
            activeOpacity={0.7}
            className="w-10 h-10 items-end justify-center"
          >
            <View>
              <Bell size={24} color="#5A6B7E" />
              {hasUnread && <View className="absolute -top-1 -right-1 w-3 h-3 bg-klino-accent rounded-full border-2 border-white" />}
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <AnimatePresence>
        {showNotifications && (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1000 }} pointerEvents="box-none">
            {/* Overlay */}
            <MotiView
              from={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-klino-text/40"
              style={{ height: SCREEN_HEIGHT, width: SCREEN_WIDTH }}
            >
              <Pressable className="flex-1" onPress={toggleNotifications} />
            </MotiView>

            {/* Panel Lateral Full Screen sin bordes redondeados */}
            <MotiView
              from={{ translateX: SCREEN_WIDTH }}
              animate={{ translateX: 0 }}
              exit={{ translateX: SCREEN_WIDTH }}
              transition={{ type: 'timing', duration: 300 }}
              className="absolute right-0 bg-klino-card shadow-2xl"
              style={{ 
                width: SCREEN_WIDTH, 
                top: insets.top, 
                height: SCREEN_HEIGHT - insets.top - TAB_BAR_ESTIMATED_HEIGHT, 
              }}
            >
              <View className="px-8 flex-1 pt-8 pb-4">
                <View className="flex-row justify-between items-center mb-8">
                  <View>
                    <Text className="text-2xl font-black text-klino-text tracking-tighter">Avisos</Text>
                    <Text className="text-klino-subtext text-[10px] font-bold uppercase tracking-[2px]">Notificaciones</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={toggleNotifications}
                    className="w-10 h-10 bg-klino-background rounded-full items-center justify-center border border-klino-background"
                  >
                    <X size={20} color="#5A6B7E" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                  {notificationsList.length === 0 ? (
                    <View className="items-center py-10">
                      <Bell size={40} color="#E2E8F0" />
                      <Text className="text-klino-subtext font-bold text-xs mt-4 uppercase tracking-widest">Sin notificaciones</Text>
                    </View>
                  ) : (
                    <>
                      {notificationsList.map((item, index) => {
                        const IconComponent = ICON_MAP[item.icon] || Bell;
                        return (
                          <MotiView
                            key={item.id}
                            from={{ opacity: 0, translateX: 20 }}
                            animate={{ opacity: 1, translateX: 0 }}
                            transition={{ type: 'timing', delay: 100 + (index * 80) }}
                            className={`bg-klino-card p-5 rounded-[32px] mb-4 border shadow-sm flex-row items-center ${item.unread ? 'border-klino-primary/20 bg-blue-50/20' : 'border-klino-background'}`}
                          >
                            <View style={{ backgroundColor: `${item.color}15` }} className="w-12 h-12 rounded-2xl items-center justify-center mr-4">
                              <IconComponent size={22} color={item.color} />
                            </View>
                            <View className="flex-1">
                              <View className="flex-row justify-between items-center">
                                <Text className="text-[13px] font-black text-klino-text" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-[8px] font-bold text-slate-300 uppercase">{formatTimeAgo(item.time)}</Text>
                              </View>
                              <Text className="text-[11px] text-klino-subtext font-medium mt-1 leading-4">{item.description}</Text>
                            </View>
                          </MotiView>
                        );
                      })}

                      {/* BOTÓN DE BORRAR ABAJO (Fase 12) */}
                      <TouchableOpacity 
                        onPress={handleClearAll}
                        activeOpacity={0.7}
                        className="mt-6 p-5 bg-orange-50 rounded-[28px] flex-row items-center justify-center border border-orange-100"
                      >
                        <Trash2 size={18} color="#E8820C" />
                        <Text className="text-klino-accent font-black text-xs uppercase tracking-widest ml-2">Borrar todas</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  <TouchableOpacity 
                    onPress={() => {
                      toggleNotifications();
                      router.push('/notifications');
                    }}
                    activeOpacity={0.7}
                    className="mt-4 p-5 bg-klino-background rounded-[28px] flex-row items-center justify-center border border-klino-background"
                  >
                    <Text className="text-klino-primary font-black text-xs uppercase tracking-widest">Gestionar Alertas</Text>
                  </TouchableOpacity>
                  <View className="h-10" />
                </ScrollView>

                <View className="mt-4 pt-6 border-t border-klino-background">
                  <Text className="text-center text-[10px] text-slate-300 font-bold uppercase tracking-widest">
                    Klino • Snupi Medical Identity
                  </Text>
                </View>
              </View>
            </MotiView>
          </View>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
