import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal, Dimensions } from 'react-native';
import { Cpu, Bluetooth, BatteryFull, HardDrive, CheckCircle2, Search, Smartphone, RefreshCw, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Header from '../../src/components/Header';
import { MotiView, AnimatePresence } from 'moti';
import Toast from 'react-native-toast-message';
import { bluetoothService } from '../utils/bluetooth';
import { Device } from 'react-native-ble-plx';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const DevicesScreen = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [foundDevices, setFoundDevices] = useState<Device[]>([]);

  const handleSync = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowSyncModal(true);
    handleSearchDevices();
  };

  const handleSearchDevices = async () => {
    setIsSearching(true);
    setFoundDevices([]);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    bluetoothService.startScan((device) => {
      setFoundDevices((prev) => {
        if (prev.find((d) => d.id === device.id)) return prev;
        return [...prev, device];
      });
    });

    // Detener escaneo después de 10 segundos
    setTimeout(() => {
      bluetoothService.stopScan();
      setIsSearching(false);
    }, 10000);
  };

  const handleConnectDevice = async (device: Device) => {
    setSelectedDevice(device.id);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    try {
      await bluetoothService.connectToDevice(device);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      setTimeout(() => {
        setShowSyncModal(false);
        Toast.show({
          type: 'success',
          text1: 'Dispositivo Sincronizado',
          text2: `Conectado a ${device.name || 'Klino Device'}`,
        });
      }, 1500);
    } catch (error) {
      setSelectedDevice(null);
      Alert.alert("Error de Conexión", "No se pudo establecer vínculo con el dispositivo.");
    }
  };

  const handleAction = async (label: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert('En Desarrollo', 'La vinculación de nuevos dispositivos estará disponible próximamente.');
  };

  return (
    <View className="flex-1 bg-klino-background">
      <Header />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 600 }} className="mb-6">
            <Text className="text-3xl font-bold text-slate-900 tracking-tight">Hardware</Text>
            <Text className="text-slate-500 font-medium mt-1">Configuración y estado del dispositivo Klino</Text>
          </MotiView>

          <MotiView from={{ opacity: 0, scale: 0.95, translateY: 20 }} animate={{ opacity: 1, scale: 1, translateY: 0 }} transition={{ type: 'timing', duration: 700, delay: 300 }} className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] mb-6 relative">
            <View className="flex-row justify-between items-start mb-6">
              <View className="w-16 h-16 bg-slate-50 rounded-2xl border border-slate-100 justify-center items-center shadow-sm">
                <Cpu size={32} color="#1B4F9B" strokeWidth={1.5} />
                <View className="absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
              </View>
              <View className="bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100/50">
                <Text className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">En Línea</Text>
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-[22px] font-bold text-slate-900 tracking-tight">Prototipo Klino</Text>
              <Text className="text-[11px] text-slate-400 font-medium mt-1">Seeed Studio XIAO ESP32-S3</Text>
              <Text className="text-emerald-600 text-[11px] font-bold mt-2">Estado: Listo para grabar (Micrófono activo)</Text>
            </View>

            <View className="space-y-3">
              <TouchableOpacity 
                onPress={handleSync} 
                activeOpacity={0.7}
                className="w-full bg-klino-primary py-3.5 rounded-xl items-center flex-row justify-center shadow-[0_4px_15px_rgb(27,79,155,0.2)]"
              >
                <Text className="text-white font-bold text-[13px] uppercase tracking-widest">Sincronizar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleAction("Vincular")} 
                activeOpacity={0.7}
                className="w-full bg-slate-50 py-3.5 rounded-xl items-center border border-slate-200 mt-2"
              >
                <Text className="text-slate-600 font-bold text-[12px] uppercase tracking-widest">Vincular Nuevo Dispositivo</Text>
              </TouchableOpacity>
            </View>
            <Text className="absolute bottom-4 right-5 text-[9px] text-slate-400 font-semibold uppercase tracking-widest">Firmware v4.1</Text>
          </MotiView>

          <View className="mb-6">
            <Text className="text-slate-500 font-semibold text-[11px] uppercase tracking-[1.5px] mb-2 ml-1">ESTADO DEL SISTEMA</Text>
            <View className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 600 }}>
                <View className="p-4 border-b border-slate-100 flex-row items-center">
                  <View className="w-10 h-10 bg-blue-50 rounded-xl justify-center items-center mr-4">
                    <Bluetooth size={20} color="#1B4F9B" />
                  </View>
                  <View className="flex-1">
                    <Text className="font-semibold text-slate-900 text-[15px]">Conectado</Text>
                    <Text className="text-[12px] text-slate-500 mt-0.5">Latencia: 24ms • Canal Seguro</Text>
                  </View>
                </View>
              </MotiView>

              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 700 }}>
                <View className="p-4 border-b border-slate-100">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center">
                      <View className="w-10 h-10 bg-emerald-50 rounded-xl justify-center items-center mr-4">
                        <BatteryFull size={20} color="#10B981" />
                      </View>
                      <Text className="font-semibold text-slate-900 text-[15px]">Batería</Text>
                    </View>
                    <Text className="font-bold text-emerald-600 text-base">87%</Text>
                  </View>
                  <View className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <MotiView from={{ width: '0%' }} animate={{ width: '87%' }} transition={{ type: 'timing', duration: 1500, delay: 900 }} className="h-full bg-emerald-500 rounded-full" />
                  </View>
                </View>
              </MotiView>

              <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 800 }}>
                <View className="p-4">
                  <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-blue-50 rounded-xl justify-center items-center mr-4">
                        <HardDrive size={20} color="#1B4F9B" />
                      </View>
                      <Text className="font-semibold text-slate-900 text-[15px] flex-1" numberOfLines={1}>Alm. Local (Micro SD)</Text>
                    </View>
                    <Text className="font-bold text-slate-700 ml-2">14.2 GB</Text>
                  </View>
                  <View className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                    <MotiView from={{ width: '0%' }} animate={{ width: '45%' }} transition={{ type: 'timing', duration: 1500, delay: 1000 }} className="h-full bg-klino-primary rounded-full" />
                  </View>
                  <Text className="text-[10px] text-slate-400 font-medium mt-2">Respaldo: ~420 horas de audio médico</Text>
                </View>
              </MotiView>
            </View>
          </View>

          <View className="mb-24">
            <Text className="text-slate-500 font-semibold text-[11px] uppercase tracking-[1.5px] mb-2 ml-1">REGISTRO DE CONECTIVIDAD</Text>
            <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', delay: 1100 }} className="bg-white rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)] overflow-hidden">
              <View className="flex-row items-center p-4 border-b border-slate-100">
                <View className="w-8 h-8 rounded-full bg-emerald-50 items-center justify-center mr-3">
                  <CheckCircle2 size={16} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-medium text-[14px]">Sincronización completada</Text>
                  <Text className="text-slate-400 text-[11px] mt-0.5">Hoy, 10:30 AM</Text>
                </View>
              </View>
              <View className="flex-row items-center p-4">
                <View className="w-8 h-8 rounded-full bg-blue-50 items-center justify-center mr-3">
                  <Bluetooth size={16} color="#1B4F9B" />
                </View>
                <View className="flex-1">
                  <Text className="text-slate-900 font-medium text-[14px]">Conexión establecida</Text>
                  <Text className="text-slate-400 text-[11px] mt-0.5">Hoy, 09:15 AM</Text>
                </View>
              </View>
            </MotiView>
          </View>

        </View>
      </ScrollView>

      <Modal
        visible={showSyncModal}
        transparent={true}
        animationType="none"
        onRequestClose={() => setShowSyncModal(false)}
      >
        <View className="flex-1 bg-black/40 justify-end items-center">
          <MotiView
            from={{ translateY: SCREEN_HEIGHT, opacity: 1 }}
            animate={{ translateY: 0, opacity: 1 }}
            exit={{ translateY: SCREEN_HEIGHT, opacity: 1 }}
            transition={{ type: 'timing', duration: 400 }}
            className="bg-white w-full h-[550px] rounded-t-3xl p-8 shadow-[0_-10px_40px_rgb(0,0,0,0.1)]"
          >
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-bold text-slate-900 tracking-tight">Sincronizar</Text>
                <Text className="text-slate-500 text-[11px] font-semibold mt-1">Buscando dispositivos cercanos</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowSyncModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-full items-center justify-center"
              >
                <X size={18} color="#64748B" />
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <View className="flex-1 items-center justify-center py-12">
                <MotiView
                  from={{ rotate: '0deg' }}
                  animate={{ rotate: '360deg' }}
                  transition={{ loop: true, repeatReverse: false, duration: 2000, type: 'timing' }}
                >
                  <RefreshCw size={40} color="#1B4F9B" strokeWidth={1.5} />
                </MotiView>
                <Text className="text-slate-500 font-semibold text-xs mt-6 uppercase tracking-widest text-center">
                  Escaneando frecuencias...
                </Text>
              </View>
            ) : (
              <View className="flex-1">
                {foundDevices.length === 0 ? (
                  <View className="flex-1 items-center justify-center">
                    <Text className="text-slate-400 font-medium text-center">No se encontraron dispositivos</Text>
                  </View>
                ) : (
                  <ScrollView className="flex-1 mb-4" showsVerticalScrollIndicator={false}>
                    {foundDevices.map((device, index) => (
                      <MotiView
                        key={device.id}
                        from={{ opacity: 0, translateY: 10 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        transition={{ delay: index * 100 }}
                      >
                        <TouchableOpacity
                          onPress={() => handleConnectDevice(device)}
                          className={`flex-row items-center p-4 mb-3 rounded-2xl border ${selectedDevice === device.id ? 'border-klino-primary bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-white'}`}
                        >
                          <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${selectedDevice === device.id ? 'bg-klino-primary' : 'bg-slate-50 border border-slate-200'}`}>
                            <Smartphone size={20} color={selectedDevice === device.id ? 'white' : '#64748B'} />
                          </View>
                          <View className="flex-1">
                            <Text className="font-semibold text-slate-900 text-[15px]">{device.name || 'Dispositivo Desconocido'}</Text>
                            <Text className="text-[11px] text-slate-500 mt-0.5">RSSI: {device.rssi} • ID: {device.id.slice(0, 8)}</Text>
                          </View>
                          {selectedDevice === device.id && <CheckCircle2 size={18} color="#1B4F9B" />}
                        </TouchableOpacity>
                      </MotiView>
                    ))}
                  </ScrollView>
                )}

                <TouchableOpacity 
                  onPress={handleSearchDevices}
                  className="mt-2 py-4 flex-row items-center justify-center bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <Search size={16} color="#64748B" />
                  <Text className="text-slate-600 font-bold text-[12px] uppercase tracking-widest ml-2">Buscar de nuevo</Text>
                </TouchableOpacity>
              </View>
            )}
          </MotiView>
        </View>
      </Modal>
    </View>
  );
};

export default DevicesScreen;