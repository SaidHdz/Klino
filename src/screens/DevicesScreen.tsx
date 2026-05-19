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
          
          <MotiView from={{ opacity: 0, translateY: -10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', duration: 600 }} className="mb-8">
            <Text className="text-3xl font-black text-klino-text tracking-tighter">Hardware</Text>
            <Text className="text-klino-subtext font-medium mt-1">Configuración y estado del dispositivo Klino</Text>
          </MotiView>

          <MotiView from={{ opacity: 0, scale: 0.95, translateY: 20 }} animate={{ opacity: 1, scale: 1, translateY: 0 }} transition={{ type: 'timing', duration: 700, delay: 300 }} className="bg-klino-card p-6 rounded-[32px] border border-klino-background shadow-sm mb-6 relative">
            <View className="flex-row justify-between items-start mb-6">
              <View className="w-20 h-20 bg-klino-text rounded-3xl justify-center items-center shadow-xl shadow-klino-text/20">
                <Cpu size={40} color="#1B4F9B" strokeWidth={1.5} />
                <View className="absolute bottom-2 right-2 w-2 h-2 rounded-full bg-klino-secondary" />
              </View>
              <View className="bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                <Text className="text-emerald-600 text-[10px] font-bold uppercase tracking-widest">En Línea</Text>
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-2xl font-black text-klino-text uppercase tracking-tighter">Prototipo Klino</Text>
              <Text className="text-[10px] text-klino-subtext font-bold uppercase tracking-[2px] mt-1">Seeed Studio XIAO ESP32-S3</Text>
              <Text className="text-klino-secondary text-[10px] font-bold uppercase mt-1 tracking-tight">Estado: Listo para grabar (Micrófono activo)</Text>
            </View>

            <View className="space-y-3">
              <TouchableOpacity 
                onPress={handleSync} 
                activeOpacity={0.7}
                className="w-full bg-klino-primary p-5 rounded-2xl items-center flex-row justify-center"
              >
                <Text className="text-white font-black text-xs uppercase tracking-widest">
                  Sincronizar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={() => handleAction("Vincular")} 
                activeOpacity={0.7}
                className="w-full bg-transparent p-5 rounded-2xl items-center border-[1.5px] border-klino-primary mt-1"
              >
                <Text className="text-klino-primary font-black text-xs uppercase tracking-widest">Vincular Nuevo Dispositivo</Text>
              </TouchableOpacity>
            </View>
            <Text className="absolute bottom-4 right-6 text-[8px] text-slate-300 font-black uppercase tracking-widest">Firmware v4.1</Text>
          </MotiView>

          <View className="space-y-4 mb-8">
            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 600 }}>
              <View className="bg-klino-card p-5 rounded-3xl border border-klino-background shadow-sm flex-row items-center mb-4">
                <View className="w-12 h-12 bg-blue-50 rounded-2xl justify-center items-center mr-4">
                  <Bluetooth size={24} color="#1B4F9B" />
                </View>
                <View className="flex-1">
                  <Text className="font-black text-klino-text text-base">Conectado</Text>
                  <Text className="text-xs text-klino-subtext font-medium">Latencia: 24ms • Canal Seguro</Text>
                </View>
              </View>
            </MotiView>

            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 750 }}>
              <View className="bg-klino-card p-5 rounded-3xl border border-klino-background shadow-sm mb-4">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <View className="w-10 h-10 bg-emerald-50 rounded-xl justify-center items-center mr-3">
                      <BatteryFull size={20} color="#2A7D6F" />
                    </View>
                    <Text className="font-black text-klino-text text-base">Batería</Text>
                  </View>
                  <Text className="font-black text-klino-secondary text-lg">87%</Text>
                </View>
                <View className="w-full h-2 bg-klino-background rounded-full overflow-hidden">
                  <MotiView from={{ width: '0%' }} animate={{ width: '87%' }} transition={{ type: 'timing', duration: 1500, delay: 900 }} className="h-full bg-klino-secondary rounded-full" />
                </View>
              </View>
            </MotiView>

            <MotiView from={{ opacity: 0, translateY: 10 }} animate={{ opacity: 1, translateY: 0 }} transition={{ delay: 900 }}>
              <View className="bg-klino-card p-5 rounded-3xl border border-klino-background shadow-sm">
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-blue-50 rounded-xl justify-center items-center mr-3">
                      <HardDrive size={20} color="#1B4F9B" />
                    </View>
                    <Text className="font-black text-klino-text text-sm flex-1" numberOfLines={1}>Alm. Local (Micro SD)</Text>
                  </View>
                  <Text className="font-black text-klino-text ml-2">14.2 GB</Text>
                </View>
                <View className="w-full h-2 bg-klino-background rounded-full overflow-hidden">
                  <MotiView from={{ width: '0%' }} animate={{ width: '45%' }} transition={{ type: 'timing', duration: 1500, delay: 1000 }} className="h-full bg-klino-primary rounded-full" />
                </View>
                <Text className="text-[9px] text-klino-subtext font-bold uppercase tracking-tight mt-3">Respaldo: ~420 horas de audio médico</Text>
              </View>
            </MotiView>
          </View>

          <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} transition={{ type: 'timing', delay: 1100 }} className="bg-klino-card p-6 rounded-[32px] border border-klino-background shadow-sm mb-24">
            <Text className="text-lg font-black text-klino-text mb-6">Registro de Conectividad</Text>
            <View>
              <View className="flex-row items-center py-4 border-b border-klino-background">
                <CheckCircle2 size={16} color="#2A7D6F" />
                <View className="ml-4 flex-1">
                  <Text className="text-klino-text font-bold text-xs">Sincronización completada</Text>
                  <Text className="text-klino-subtext text-[10px]">Hoy, 10:30 AM</Text>
                </View>
              </View>
              <View className="flex-row items-center py-4">
                <Bluetooth size={16} color="#1B4F9B" />
                <View className="ml-4 flex-1">
                  <Text className="text-klino-text font-bold text-xs">Conexión establecida</Text>
                  <Text className="text-klino-subtext text-[10px]">Hoy, 09:15 AM</Text>
                </View>
              </View>
            </View>
          </MotiView>

        </View>
      </ScrollView>

      {/* MODAL DE SINCRONIZACIÓN */}
      <Modal
        visible={showSyncModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSyncModal(false)}
      >
        <View className="flex-1 bg-klino-text/80 justify-center items-center px-6">
          <MotiView
            from={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-klino-card w-full rounded-[40px] p-8 shadow-2xl overflow-hidden"
          >
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-2xl font-black text-klino-text tracking-tighter">Sincronizar</Text>
                <Text className="text-klino-subtext text-[10px] font-bold uppercase tracking-[2px]">Buscando dispositivos</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowSyncModal(false)}
                className="w-10 h-10 bg-klino-background rounded-full items-center justify-center"
              >
                <X size={20} color="#5A6B7E" />
              </TouchableOpacity>
            </View>

            {isSearching ? (
              <View className="items-center py-12">
                <MotiView
                  from={{ rotate: '0deg' }}
                  animate={{ rotate: '360deg' }}
                  transition={{ loop: true, repeatReverse: false, duration: 2000, type: 'timing' }}
                >
                  <RefreshCw size={48} color="#1B4F9B" strokeWidth={1.5} />
                </MotiView>
                <Text className="text-klino-subtext font-bold text-xs mt-6 uppercase tracking-widest text-center">
                  Escaneando frecuencias Klino...
                </Text>
              </View>
            ) : (
              <View className="py-4">
                {foundDevices.length === 0 ? (
                  <Text className="text-klino-subtext text-center py-8">No se encontraron dispositivos cercanos</Text>
                ) : (
                  foundDevices.map((device, index) => (
                    <MotiView
                      key={device.id}
                      from={{ opacity: 0, translateX: -20 }}
                      animate={{ opacity: 1, translateX: 0 }}
                      transition={{ delay: index * 100 }}
                    >
                      <TouchableOpacity
                        onPress={() => handleConnectDevice(device)}
                        className={`flex-row items-center p-4 mb-3 rounded-2xl border ${selectedDevice === device.id ? 'border-klino-primary bg-blue-50' : 'border-klino-background bg-klino-background/30'}`}
                      >
                        <View className={`w-10 h-10 rounded-xl items-center justify-center mr-4 ${selectedDevice === device.id ? 'bg-klino-primary' : 'bg-white'}`}>
                          <Smartphone size={20} color={selectedDevice === device.id ? 'white' : '#5A6B7E'} />
                        </View>
                        <View className="flex-1">
                          <Text className="font-black text-klino-text text-sm">{device.name || 'Dispositivo Desconocido'}</Text>
                          <Text className="text-[10px] text-klino-subtext font-medium">RSSI: {device.rssi} • ID: {device.id.slice(0, 8)}</Text>
                        </View>
                        {selectedDevice === device.id && <CheckCircle2 size={18} color="#1B4F9B" />}
                      </TouchableOpacity>
                    </MotiView>
                  ))
                )}

                <TouchableOpacity 
                  onPress={handleSearchDevices}
                  className="mt-4 flex-row items-center justify-center p-4 bg-klino-background rounded-2xl"
                >
                  <Search size={16} color="#1B4F9B" />
                  <Text className="text-klino-primary font-black text-xs uppercase tracking-widest ml-2">Buscar de nuevo</Text>
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