import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Image, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Camera, User, BadgeCheck, Mail, FileText } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import { useProfile } from '../context/ProfileContext';
import { supabase } from '../utils/supabase';

const InputField = ({ label, icon: Icon, placeholder, value, onChangeText, editable = true }: any) => (
  <View className="mb-6">
    <Text className="text-[10px] font-bold text-klino-subtext uppercase tracking-widest mb-2 ml-1">{label}</Text>
    <View className="flex-row items-center border-b border-klino-background py-1">
      <Icon size={18} color="#5A6B7E" />
      <TextInput 
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        editable={editable}
        placeholderTextColor="#CBD5E1"
        className={`flex-1 px-4 py-2 text-klino-text font-medium text-base ${!editable ? 'opacity-50' : ''}`}
      />
    </View>
  </View>
);

import * as ImagePicker from 'expo-image-picker';

const EditProfileScreen = () => {
  const router = useRouter();
  const { doctorName, setDoctorName, profileImage, setProfileImage } = useProfile();
  const [tempName, setTempName] = React.useState(doctorName);
  const [userEmail, setUserEmail] = React.useState('medico@klino.med');

  React.useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setUserEmail(user.email);
    };
    fetchUser();
  }, []);

  const handleSave = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setDoctorName(tempName);
      router.back();
    } catch (e) {
      Alert.alert("Error", "No se pudieron guardar los cambios en la nube.");
    }
  };

  const handleChangePhoto = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permisos', 'Necesitamos acceso a tu galería para cambiar la foto.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      await setProfileImage(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 bg-klino-background">
      <Header title="Editar Perfil" showBack={true} />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          <View className="p-6">
            
            <View className="items-center my-8">
              <View className="relative">
                <View className="w-32 h-32 rounded-full border-4 border-white overflow-hidden shadow-sm bg-slate-200 justify-center items-center">
                  {profileImage ? (
                    <Image source={{ uri: profileImage }} className="w-full h-full" />
                  ) : (
                    <Image source={require('../../assets/images/fotosnupi.png')} className="w-full h-full" />
                  )}
                </View>
                <TouchableOpacity onPress={handleChangePhoto} activeOpacity={0.9} className="absolute bottom-0 right-0 bg-klino-primary w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-lg">
                  <Camera size={18} color="white" />
                </TouchableOpacity>
              </View>
              <Text className="mt-4 text-klino-subtext text-[10px] font-black uppercase tracking-[2px]">Cambiar fotografía</Text>
            </View>

            <View className="mb-10 px-2">
              <InputField label="Nombre Completo" icon={User} value={tempName} onChangeText={setTempName} />
              <InputField label="Especialidad Médica" icon={BadgeCheck} value="Cardiólogo Especialista" editable={false} />
              <InputField label="Correo Electrónico" icon={Mail} value={userEmail} editable={false} />
              <InputField label="Cédula Profesional" icon={FileText} placeholder="PROF-992384-X" value="PROF-992384-X" editable={false} />
            </View>

            <TouchableOpacity onPress={handleSave} activeOpacity={0.8} className="bg-klino-primary p-5 rounded-3xl items-center shadow-xl shadow-klino-primary/20 mb-20">
              <Text className="text-white font-black text-sm uppercase tracking-widest">Guardar Cambios</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default EditProfileScreen;