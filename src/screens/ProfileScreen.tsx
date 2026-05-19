import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { Settings, Sliders, Bell, CreditCard, ShieldCheck, LogOut, Mail, ChevronRight } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView } from 'moti';
import Header from '../components/Header';
import { useProfile } from '../context/ProfileContext';
import { supabase } from '../utils/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OPTIONS = [
  { icon: Settings, label: 'Editar Perfil', sublabel: 'Nombre, especialidad y fotografía' },
  { icon: Sliders, label: 'Ajustes de Modos', sublabel: 'IA, formatos SOAP y hardware' },
  { icon: Bell, label: 'Alertas', sublabel: 'Notificaciones y recordatorios' },
  { icon: CreditCard, label: 'Suscripción', sublabel: 'Plan actual y facturación' },
  { icon: ShieldCheck, label: 'Seguridad', sublabel: 'Autenticación biométrica y encriptación' },
];

const ProfileScreen = () => {
  const router = useRouter();
  const { doctorName, profileImage } = useProfile();
  const [isLoading, setIsLoading] = React.useState(true);
  const [userEmail, setUserEmail] = React.useState('medico@klino.med');


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
          onPress: async () => {
            try {
              await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              // 1. Limpiar sesión en Supabase
              const { error } = await supabase.auth.signOut();
              if (error) throw error;

              // 2. Limpiar datos locales persistentes (Opcional: puedes decidir si borrar todo o solo la sesión)
              await AsyncStorage.removeItem('@Klino_USER_PROFILE');

              // 3. Redirigir de forma atómica a la raíz
              router.replace('/');
            } catch (error) {
              console.error("Error crítico cerrando sesión:", error);
              // Fallback forzoso: aunque falle la red, sacamos al usuario
              router.replace('/');
            }
          } 
        }
      ]
    );
  };

  const SkeletonItem = () => (
    <View className="bg-klino-card p-5 rounded-[28px] border border-klino-background shadow-sm flex-row items-center mb-4">
      <MotiView
        from={{ opacity: 0.3 }}
        animate={{ opacity: 0.6 }}
        transition={{ type: 'timing', duration: 1000, loop: true }}
        className="w-12 h-12 bg-klino-background rounded-2xl mr-4"
      />
      <View className="flex-1">
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ type: 'timing', duration: 1000, loop: true }}
          className="h-4 bg-klino-background rounded-full w-3/4 mb-2"
        />
        <MotiView
          from={{ opacity: 0.3 }}
          animate={{ opacity: 0.6 }}
          transition={{ type: 'timing', duration: 1000, loop: true }}
          className="h-3 bg-klino-background rounded-full w-1/2"
        />
      </View>
    </View>
  );

  const OptionItem = ({ icon: Icon, label, sublabel, index }: any) => (
    <MotiView
      from={{ opacity: 0, translateY: 20 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 500, delay: index * 100 }}
    >
      <TouchableOpacity 
        onPress={() => handleOptionPress(label)}
        activeOpacity={0.7}
        className="bg-klino-card p-5 rounded-[28px] border border-klino-background shadow-sm flex-row items-center justify-between mb-4"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 bg-klino-background rounded-2xl justify-center items-center mr-4 border border-slate-100">
            <Icon size={22} color="#1B4F9B" />
          </View>
          <View className="flex-1">
            <Text className="font-black text-klino-text text-base">{label}</Text>
            <Text className="text-xs text-klino-subtext font-medium mt-0.5">{sublabel}</Text>
          </View>
        </View>
        <ChevronRight size={18} color="#CBD5E1" />
      </TouchableOpacity>
    </MotiView>
  );

  return (
    <View className="flex-1 bg-klino-background">
      <Header hideProfilePhoto={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          {isLoading ? (
            <MotiView 
              from={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              className="bg-klino-card p-8 rounded-[40px] border border-klino-background shadow-sm items-center mb-10"
            >
              <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.6 }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
                className="w-32 h-32 rounded-full bg-klino-background mb-6"
              />
              <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.6 }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
                className="h-6 bg-klino-background rounded-full w-1/2 mb-4"
              />
              <MotiView
                from={{ opacity: 0.3 }}
                animate={{ opacity: 0.6 }}
                transition={{ type: 'timing', duration: 1000, loop: true }}
                className="h-3 bg-klino-background rounded-full w-1/3"
              />
            </MotiView>
          ) : (
            <MotiView
              from={{ opacity: 0, scale: 0.9, translateY: 10 }}
              animate={{ opacity: 1, scale: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 600 }}
              className="bg-klino-card p-8 rounded-[40px] border border-klino-background shadow-sm items-center mb-10"
            >
              <View className="w-32 h-32 rounded-full border-4 border-klino-background overflow-hidden mb-6 shadow-md">
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
              <Text className="text-2xl font-black text-klino-text uppercase tracking-tighter">{doctorName}</Text>
              <Text className="text-klino-primary font-black uppercase tracking-[2px] text-[10px] mt-1.5">
                Cardiólogo Especialista
              </Text>
              
              <View className="flex-row items-center mt-6">
                <View className="flex-row items-center bg-klino-background px-4 py-2 rounded-full border border-slate-100">
                  <Mail size={12} color="#5A6B7E" />
                  <Text className="ml-2 text-[10px] text-klino-subtext font-bold uppercase tracking-wider">{userEmail}</Text>
                </View>
              </View>
            </MotiView>
          )}

          <View className="mb-8">
            <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 300 }}>
              <Text className="text-klino-subtext font-semibold text-[11px] uppercase tracking-[1.5px] mb-2 ml-1">CONFIGURACIÓN DEL PORTAL</Text>
            </MotiView>
            
            {isLoading ? (
              <>
                <SkeletonItem />
                <SkeletonItem />
                <SkeletonItem />
              </>
            ) : (
              OPTIONS.map((item, index) => (
                <OptionItem key={item.label} {...item} index={index} />
              ))
            )}
          </View>

          {!isLoading && (
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 600, delay: 500 }}>
              <TouchableOpacity onPress={handleLogout} className="flex-row items-center justify-center p-6 bg-orange-50 rounded-[32px] border border-orange-100 mb-24" activeOpacity={0.7}>
                <LogOut size={20} color="#E8820C" />
                <Text className="ml-3 text-klino-accent font-black uppercase tracking-widest text-sm">Cerrar Sesión Segura</Text>
              </TouchableOpacity>
            </MotiView>
          )}

        </View>
      </ScrollView>
    </View>
  );
};

export default ProfileScreen;
