import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, SafeAreaView, Platform, KeyboardAvoidingView, Alert } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { KlinoInput } from '../components/common/KlinoInput';
import { KlinoButton } from '../components/common/KlinoButton';
import { useProfile } from '../context/ProfileContext';
import { useKlinoAlert } from '../context/KlinoAlertContext';

export default function EditProfileScreen() {
  const router = useRouter();
  const { doctorName, setDoctorName, doctorCedula, setDoctorCedula, doctorUniversity, setDoctorUniversity, doctorAddress, setDoctorAddress } = useProfile();
  const { showAlert } = useKlinoAlert();
  
  const [name, setName] = useState(doctorName || '');
  const [specialty] = useState('Medicina General'); // Fijo por ahora, o agregamos un selector
  const [cedula, setCedula] = useState(doctorCedula || '');
  const [university, setUniversity] = useState(doctorUniversity || '');
  const [address, setAddress] = useState(doctorAddress || '');

  const handleSave = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await setDoctorName(name);
      await setDoctorCedula(cedula);
      await setDoctorUniversity(university);
      await setDoctorAddress(address);
      router.back();
    } catch (e) {
      showAlert("Error", "No se pudieron guardar los cambios.");
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      
      {/* HEADER */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="body" style={{ fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 }}>PERFIL</KlinoText>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
          
          <View style={{ marginBottom: 40 }}>
            <KlinoInput 
              label="NOMBRE COMPLETO" 
              value={name} 
              onChangeText={setName} 
            />
            <KlinoInput 
              label="ESPECIALIDAD" 
              value={specialty} 
              editable={false} 
            />
            <KlinoInput 
              label="CÉDULA PROFESIONAL" 
              value={cedula} 
              onChangeText={setCedula} 
            />
            <KlinoInput 
              label="UNIVERSIDAD (OPCIONAL)" 
              value={university} 
              onChangeText={setUniversity} 
            />
            <KlinoInput 
              label="DIRECCIÓN DE CONSULTORIO (OPCIONAL)" 
              value={address} 
              onChangeText={setAddress} 
            />
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
      
      <View style={{ padding: 24, borderTopWidth: 1, borderColor: KLINO_COLORS.borderHairline, backgroundColor: KLINO_COLORS.papel }}>
        <KlinoButton title="GUARDAR CAMBIOS" fullWidth onPress={handleSave} />
      </View>

    </SafeAreaView>
  );
}