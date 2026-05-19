import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { Search, Filter, PlusCircle, FileText, Download, Eye, History, Edit3, AlertCircle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Header from '../components/Header';
import { notesService, MedicalRecord } from '../utils/notes';

const RecordsScreen = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecords = async () => {
    const data = await notesService.getRecords();
    setRecords(data);
    setIsLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const onRefresh = React.useCallback(() => {
    setIsRefreshing(true);
    fetchRecords();
  }, []);

  const handleAction = async (label: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    console.log(`Acción: ${label}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pendiente': return 'bg-klino-pending';
      case 'Nota Generada': return 'bg-klino-processed';
      case 'Revisado': return 'bg-klino-completed';
      default: return 'bg-slate-300';
    }
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Pendiente': return { bg: 'bg-orange-50', border: 'border-orange-100', text: 'text-klino-pending' };
      case 'Nota Generada': return { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-klino-processed' };
      case 'Revisado': return { bg: 'bg-green-50', border: 'border-green-100', text: 'text-klino-completed' };
      default: return { bg: 'bg-slate-50', border: 'border-slate-100', text: 'text-slate-400' };
    }
  };

  return (
    <View className="flex-1 bg-klino-background">
      <Header />
      <View className="flex-1 p-6">
        
        {/* Cabecera y Buscador */}
        <View className="mb-8">
          <Text className="text-3xl font-black text-klino-text tracking-tighter mb-6">Expedientes</Text>
          <View className="flex-row items-center">
            <View className="flex-1 flex-row items-center bg-klino-card border border-slate-200 rounded-2xl px-4 py-1 shadow-sm">
              <Search size={20} color="#5A6B7E" />
              <TextInput 
                placeholder="Buscar paciente..."
                placeholderTextColor="#CBD5E1"
                className="flex-1 p-3 text-klino-text font-medium"
              />
            </View>
            <TouchableOpacity className="w-12 h-12 bg-klino-card border border-slate-200 rounded-2xl justify-center items-center shadow-sm ml-2">
              <Filter size={20} color="#1B4F9B" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Filtros de Especialidad */}
        <View className="flex-row space-x-4 mb-8">
          <TouchableOpacity 
            onPress={() => handleAction("General")}
            className="flex-1 bg-klino-card p-4 rounded-3xl border-l-4 border-klino-primary shadow-sm"
          >
            <Text className="text-[10px] font-black text-klino-primary uppercase tracking-widest">Medicina</Text>
            <Text className="text-klino-text font-black text-lg">General</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => handleAction("Cirugía")}
            className="flex-1 bg-klino-background p-4 rounded-3xl border-l-4 border-klino-secondary opacity-60"
          >
            <Text className="text-[10px] font-bold text-klino-subtext uppercase tracking-widest">Especialidad</Text>
            <Text className="text-klino-subtext font-black text-lg">Cirugía</Text>
          </TouchableOpacity>
        </View>

        {/* Lista de Tarjetas Reales */}
        {isLoading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator color="#1B4F9B" size="large" />
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false} 
            className="flex-1"
            refreshControl={
              <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#1B4F9B']} />
            }
          >
            {records.length === 0 ? (
              <View className="items-center py-20">
                <FileText size={48} color="#CBD5E1" />
                <Text className="text-klino-subtext font-bold mt-4">No hay expedientes registrados</Text>
              </View>
            ) : (
              records.map((record) => {
                const badge = getStatusBadgeStyle(record.status);
                return (
                  <TouchableOpacity key={record.id} className="bg-klino-card rounded-[24px] mb-3 shadow-sm border border-klino-background flex-row items-center p-4">
                    <View className={`w-2 h-2 rounded-full ${getStatusColor(record.status)} mr-4`} />
                    <View className="flex-1">
                      <View className="flex-row justify-between items-center">
                        <Text className="text-base font-black text-klino-text">{record.patient_name}</Text>
                        <View className={`${badge.bg} px-2 py-0.5 rounded-full border ${badge.border}`}>
                          <Text className={`${badge.text} text-[8px] font-black uppercase`}>{record.status}</Text>
                        </View>
                      </View>
                      <Text className="text-[10px] text-klino-subtext font-bold uppercase tracking-wider mt-0.5">{record.specialty}</Text>
                      <Text className="text-[9px] text-slate-300 font-bold mt-1">
                        {new Date(record.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View className="flex-row space-x-4 ml-4">
                      <Download size={18} color="#1B4F9B" />
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
};

export default RecordsScreen;