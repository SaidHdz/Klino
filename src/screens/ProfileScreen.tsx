import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Settings, Sliders, Bell, CreditCard, ShieldCheck, LogOut, Mail, ChevronRight, Moon } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import { useColorScheme } from 'nativewind';
import Header from '../components/Header';
import { useProfile } from '../context/ProfileContext';
import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SECTIONS = [
  {
    title: 'PERSONAL Y PAGOS',
    data: [
      { icon: Settings, label: 'Editar Perfil', sublabel: 'Nombre, especialidad y fotografía' },
      { icon: CreditCard, label: 'Suscripción', sublabel: 'Plan actual y facturación' },
    ]
  },
  {
    title: 'SISTEMA Y HARDWARE',
    data: [
      { icon: Sliders, label: 'Ajustes de Modos', sublabel: 'IA, formatos SOAP y hardware' },
      { icon: Bell, label: 'Alertas', sublabel: 'Notificaciones y recordatorios' },
      { icon: Moon, label: 'Modo Oscuro', sublabel: 'Cambiar apariencia de la app' },
    ]
  },
  {
    title: 'PRIVACIDAD Y SEGURIDAD',
    data: [
      { icon: ShieldCheck, label: 'Seguridad', sublabel: 'Autenticación biométrica y encriptación' },
    ]
  }
];

const ProfileScreen = () => {
  const router = useRouter();
  const { doctorName, profileImage } = useProfile();
  const [isLoading, setIsLoading] = React.useState(true);
  const [userEmail, setUserEmail] = React.useState('medico@klino.med');
  const { colorScheme, toggleColorScheme } = useColorScheme();


  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
      setIsLoading(false);
    };
    fetchUser();
  }, []);

  const handleOptionPress = async (label: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    switch (label) {
      case 'Editar Perfil': router.push('/edit-profile'); break;
      case 'Ajustes de Modos': router.push('/modes-settings'); break;
      case 'Alertas': router.push('/notifications'); break;
      case 'Suscripción': router.push('/subscription'); break;
      case 'Seguridad': router.push('/security'); break;
      case 'Modo Oscuro': toggleColorScheme(); break;
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que deseas salir del portal?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive", 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            
            // Redirigir de forma atómica a la raíz inmediatamente
            router.replace('/');

            // Limpiar sesión en background sin bloquear la UI
            setTimeout(async () => {
              try {
                await supabase.auth.signOut();
                await AsyncStorage.removeItem('@Klino_USER_PROFILE');
              } catch (e) {
                console.log('Logout error', e);
              }
            }, 100);
          } 
        }
      ]
    );
  };

  const SkeletonItem = () => (
    <View className="flex-row items-center py-4 border-b border-slate-100">
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 0.6 }}
        transition={{ type: 'timing', duration: 1000, loop: true }}
        className="w-8 h-8 bg-slate-100 rounded-lg mr-4"
      />
      <View className="flex-1">
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ type: 'timing', duration: 1000, loop: true }}
          className="h-4 bg-slate-100 rounded-full w-3/4 mb-2"
        />
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ type: 'timing', duration: 1000, loop: true }}
          className="h-3 bg-slate-100 rounded-full w-1/2"
        />
      </View>
    </View>
  );

  const OptionItem = ({ icon: Icon, label, sublabel, index, isLast }: any) => (
    <TouchableOpacity 
      onPress={() => handleOptionPress(label)}
      activeOpacity={0.7}
      className={`p-4 flex-row items-center justify-between bg-white dark:bg-slate-800 ${isLast ? '' : 'border-b border-slate-100 dark:border-slate-700'}`}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-8 h-8 bg-blue-50/50 rounded-lg justify-center items-center mr-4 border border-blue-100/50">
          <Icon size={18} color="#1B4F9B" />
        </View>
        <View className="flex-1">
          <Text className="font-semibold text-slate-900 dark:text-white text-[15px]">{label}</Text>
          <Text className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">{sublabel}</Text>
        </View>
      </View>
      <ChevronRight size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-klino-background dark:bg-slate-900">
      <Header hideProfilePhoto={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          {isLoading ? (
            <MotiView 
              from={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)] items-center mb-8"
            >
              <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.6 }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
                className="w-28 h-28 rounded-full bg-slate-100 mb-6"
              />
              <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.6 }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
                className="h-6 bg-slate-100 rounded-full w-1/2 mb-4"
              />
              <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.6 }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
                className="h-3 bg-slate-100 rounded-full w-1/3"
              />
            </MotiView>
          ) : (
            <MotiView
              from={{ opacity: 0, scale: 0.95, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 500 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200/50 dark:border-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)] items-center mb-8"
            >
              <View className="w-28 h-28 rounded-full border border-slate-200 dark:border-slate-600 overflow-hidden mb-5 shadow-sm">
                {profileImage ? (
                  <Image 
                    source={{ uri: profileImage }}
                    className="w-full h-full"
                  />
                ) : (
                  <Image 
                    source={require('../../assets/images/fotosnupi.png')}
                    className="w-full h-full"
                  />
                )}
              </View>
              <Text className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{doctorName}</Text>
              <Text className="text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-widest text-[10px] mt-1.5">
                Cardiólogo Especialista
              </Text>
              
              <View className="flex-row items-center mt-5">
                <View className="flex-row items-center bg-slate-100/50 dark:bg-slate-700/50 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-600">
                  <Mail size={12} color="#64748B" />
                  <Text className="ml-2 text-[11px] text-slate-500 dark:text-slate-300 font-semibold">{userEmail}</Text>
                </View>
              </View>
            </MotiView>
          )}

          {isLoading ? (
            <View className="mb-8">
              <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 100 }}>
                <Text className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-[1.5px] mb-2 ml-2">CARGANDO...</Text>
              </MotiView>
              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 200 }}>
                <View className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden px-4">
                  <SkeletonItem />
                  <SkeletonItem />
                  <SkeletonItem />
                </View>
              </MotiView>
            </View>
          ) : (
            SECTIONS.map((section, sIndex) => (
              <View key={section.title} className="mb-8">
                <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 100 + (sIndex * 100) }}>
                  <Text className="text-slate-500 dark:text-slate-400 font-semibold text-[11px] uppercase tracking-[1.5px] mb-2 ml-2">{section.title}</Text>
                </MotiView>
                
                <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 200 + (sIndex * 100) }}>
                  <View className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
                    {section.data.map((item, index) => (
                      <OptionItem key={item.label} {...item} index={index} isLast={index === section.data.length - 1} />
                    ))}
                  </View>
                </MotiView>
              </View>
            ))
          )}

          {!isLoading && (
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 400, delay: 300 }}>
              <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center py-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6" activeOpacity={0.7}>
                <LogOut size={18} color="#EF4444" />
                <Text className="ml-2 text-red-500 dark:text-red-400 font-semibold text-[15px]">Cerrar Sesión Segura</Text>
              </TouchableOpacity>
            </MotiView>
          )}

        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
