import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Switch } from 'react-native';
import { FolderClosed, MoreVertical, Edit2, LayoutTemplate, Trash2, Plus } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import { useRouter } from 'expo-router';
import { useProfile, IntelligenceMode } from '../context/ProfileContext';
import Toast from 'react-native-toast-message';

const ModesSettingsScreen = () => {
  const router = useRouter();
  const { intelligenceModes, updateIntelligenceMode, deleteIntelligenceMode, addIntelligenceMode } = useProfile();

  const handleToggleMode = async (id: string, currentStatus: boolean) => {
    await Haptics.selectionAsync();
    updateIntelligenceMode(id, { isActive: !currentStatus });
  };

  const handleEditMode = (mode: IntelligenceMode) => {
    Alert.prompt(
      "Editar Modo",
      `Nombre del modo para ${mode.formatName}:`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Guardar", 
          onPress: (newName) => {
            if (newName) updateIntelligenceMode(mode.id, { name: newName });
          }
        }
      ],
      "plain-text",
      mode.name
    );
  };

  const handleDeleteMode = (id: string, name: string) => {
    Alert.alert(
      "Eliminar Modo",
      `¿Estás seguro de que deseas eliminar el modo "${name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          style: "destructive",
          onPress: () => {
            deleteIntelligenceMode(id);
            Toast.show({ type: 'info', text1: 'Modo eliminado' });
          }
        }
      ]
    );
  };

  const handleAddMode = () => {
    Alert.prompt(
      "Nuevo Modo de Inteligencia",
      "Nombre de la especialidad o carpeta:",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Crear", 
          onPress: (name) => {
            if (name) {
              addIntelligenceMode({
                name,
                formatId: 'soap_std',
                formatName: 'SOAP Estándar',
                color: '#1B4F9B',
                isActive: true
              });
              Toast.show({ type: 'success', text1: 'Modo creado' });
            }
          }
        }
      ]
    );
  };

  return (
    <View className="flex-1 bg-klino-background">
      <Header title="Ajustes de Modos" showBack={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-klino-subtext font-semibold text-[11px] uppercase tracking-[1.5px] ml-1">MODOS DE INTELIGENCIA</Text>
            <TouchableOpacity onPress={handleAddMode} className="bg-klino-primary/10 px-3 py-1 rounded-full flex-row items-center">
              <Plus size={14} color="#1B4F9B" />
              <Text className="text-klino-primary font-bold text-[10px] ml-1 uppercase">Agregar</Text>
            </TouchableOpacity>
          </View>

          {intelligenceModes.map((mode) => (
            <View 
              key={mode.id}
              className={`bg-klino-card p-6 rounded-[32px] border border-klino-background shadow-sm mb-4 ${!mode.isActive ? 'opacity-50' : ''}`}
            >
              <View className="flex-row justify-between items-start mb-6">
                <View className="flex-row items-center flex-1">
                  <View 
                    style={{ backgroundColor: `${mode.color}15` }}
                    className="w-12 h-12 rounded-2xl justify-center items-center mr-4"
                  >
                    <FolderClosed size={24} color={mode.color} />
                  </View>
                  <View className="flex-1">
                    <Text className="font-black text-klino-text text-lg" numberOfLines={1}>{mode.name}</Text>
                    <View className="flex-row items-center mt-1">
                      <LayoutTemplate size={12} color="#94A3B8" />
                      <Text className="text-xs text-klino-subtext font-medium ml-1">{mode.formatName}</Text>
                    </View>
                  </View>
                </View>
                <Switch 
                  value={mode.isActive}
                  onValueChange={() => handleToggleMode(mode.id, mode.isActive)}
                  trackColor={{ false: "#E2E8F0", true: "#BEE3F8" }}
                  thumbColor={mode.isActive ? mode.color : "#F8FAFC"}
                />
              </View>

              <View className="flex-row space-x-3">
                <TouchableOpacity 
                  onPress={() => handleEditMode(mode)}
                  className="flex-1 bg-klino-background py-4 rounded-2xl flex-row items-center justify-center border border-slate-100"
                >
                  <Edit2 size={16} color="#5A6B7E" />
                  <Text className="text-klino-subtext font-bold text-xs ml-2 uppercase tracking-widest">Editar</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={() => handleDeleteMode(mode.id, mode.name)}
                  className="w-14 bg-orange-50 rounded-2xl items-center justify-center border border-orange-100"
                >
                  <Trash2 size={18} color="#E8820C" />
                </TouchableOpacity>
              </View>
            </View>
          ))}

          <View className="mt-8 p-6 bg-blue-50/50 rounded-[32px] border border-dashed border-klino-primary/20 mb-10">
            <Text className="text-klino-primary font-bold text-center text-[10px] uppercase tracking-wider leading-4">
              Los modos activos determinan las carpetas disponibles en tu dashboard y el formato de procesamiento de la IA.
            </Text>
          </View>

        </View>
      </ScrollView>
    </View>
  );
};

export default ModesSettingsScreen;