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
      <View style={{ paddingTop: safePaddingTop }} className="bg-white dark:bg-slate-900 border-b border-slate-200/60 dark:border-slate-800 z-50">
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
              className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-white dark:border-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.15)]"
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
              <Text className="text-base font-bold text-slate-800 dark:text-white tracking-tight">{title}</Text>
            ) : (
              <Text className="text-lg font-bold text-klino-primary tracking-tight">Klino</Text>
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

            <MotiView
              from={{ translateX: SCREEN_WIDTH }}
              animate={{ translateX: 0 }}
              exit={{ translateX: SCREEN_WIDTH }}
              transition={{ type: 'timing', duration: 300 }}
              className="absolute right-0 bg-white dark:bg-slate-900 shadow-[-10px_0_30px_rgb(0,0,0,0.1)] dark:shadow-[0_0_30px_rgba(0,0,0,0.5)] rounded-l-3xl border-l border-slate-200/60 dark:border-slate-800"
              style={{ 
                width: SCREEN_WIDTH * 0.9, // Make it look like a slide-over instead of full screen
                top: insets.top, 
                height: SCREEN_HEIGHT - insets.top - TAB_BAR_ESTIMATED_HEIGHT, 
              }}
            >
              <View className="px-8 flex-1 pt-8 pb-4">
                <View className="flex-row justify-between items-center mb-8">
                  <View>
                    <Text className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Avisos</Text>
                    <Text className="text-slate-500 dark:text-slate-400 text-[10px] font-semibold uppercase tracking-widest mt-1">Notificaciones</Text>
                  </View>
                  <TouchableOpacity 
                    onPress={toggleNotifications}
                    className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full items-center justify-center"
                  >
                    <X size={20} color="#64748B" />
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
                            className={`bg-white dark:bg-slate-800 p-4 rounded-2xl mb-3 border flex-row items-center ${item.unread ? 'border-klino-primary/30 dark:border-klino-primary/50 shadow-[0_4px_20px_rgb(27,79,155,0.08)]' : 'border-slate-100 dark:border-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'}`}
                          >
                            <View style={{ backgroundColor: `${item.color}15` }} className="w-10 h-10 rounded-xl items-center justify-center mr-4">
                              <IconComponent size={22} color={item.color} />
                            </View>
                            <View className="flex-1">
                              <View className="flex-row justify-between items-center mb-1">
                                <Text className="text-[14px] font-semibold text-slate-900 dark:text-white" numberOfLines={1}>{item.title}</Text>
                                <Text className="text-[10px] font-medium text-slate-400 dark:text-slate-500">{formatTimeAgo(item.time)}</Text>
                              </View>
                              <Text className="text-[12px] text-slate-500 dark:text-slate-400 font-normal leading-5">{item.description}</Text>
                            </View>
                          </MotiView>
                        );
                      })}

                      {/* BOTÓN DE BORRAR ABAJO (Fase 12) */}
                      <TouchableOpacity 
                        onPress={handleClearAll}
                        activeOpacity={0.7}
                        className="mt-4 py-3 bg-red-50/50 dark:bg-red-900/20 rounded-xl flex-row items-center justify-center border border-red-100/50 dark:border-red-900/50"
                      >
                        <Trash2 size={16} color="#EF4444" />
                        <Text className="text-red-500 font-semibold text-xs ml-2">Borrar todas</Text>
                      </TouchableOpacity>
                    </>
                  )}
                  
                  <TouchableOpacity 
                    onPress={() => {
                      toggleNotifications();
                      router.push('/notifications');
                    }}
                    activeOpacity={0.7}
                    className="mt-4 py-4 bg-slate-50 dark:bg-slate-800 rounded-2xl flex-row items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm"
                  >
                    <Text className="text-slate-700 dark:text-slate-300 font-semibold text-[13px] tracking-wide">Gestionar Alertas</Text>
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
