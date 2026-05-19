import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Dimensions, FlatList, SafeAreaView, Pressable } from 'react-native';
import { CreditCard, CheckCircle2, Zap, ReceiptText, X, Plus, Trash2, Download, CreditCard as CardIcon, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react-native';
import { MotiView, AnimatePresence } from 'moti';
import Header from '../components/Header';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Ajustamos el ancho para que no se corten
const PLAN_CARD_WIDTH = SCREEN_WIDTH * 0.85; 
const PLAN_SPACING = 10;

const PLANS = [
  { id: 'personal', name: 'Personal', price: '250', color: '#1B4F9B', features: ['IA Procesamiento Ilimitada', 'Hardware Multi-link', 'Soporte 24/7'] },
  { id: 'empresarial', name: 'Empresarial', price: '???', color: '#5A6B7E', features: ['Gestión de Clínicas', 'Múltiples Usuarios', 'Próximamente...'] },
];

const SubscriptionScreen = () => {
  const [showCardModal, setShowCardModal] = useState(false);
  const [showPlansCarousel, setShowPlansCarousel] = useState(false);
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(0); 
  const [cardData, setCardData] = useState({ number: '4242 4242 4242 4242', holder: 'DR. SNUPI', expiry: '12/28', type: 'Visa', cvc: '***' });
  const [editData, setEditData] = useState({ ...cardData });
  const flatListRef = useRef<FlatList>(null);

  const handleSaveCard = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCardData({ ...editData });
    setShowCardModal(false);
    Toast.show({
      type: 'success',
      text1: 'Tarjeta Actualizada',
      text2: 'Los datos de pago se han guardado localmente.'
    });
  };

  useEffect(() => {
    if (showPlansCarousel) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: selectedPlanIndex,
          animated: false,
          viewPosition: 0.5
        });
      }, 50);
    }
  }, [showPlansCarousel]);

  const handleInDevelopment = () => {
    Alert.alert('En Desarrollo', 'Esta funcionalidad se activará en la próxima actualización.');
  };

  const handleScroll = (event: any) => {
    const slideSize = PLAN_CARD_WIDTH + PLAN_SPACING;
    const index = Math.round(event.nativeEvent.contentOffset.x / slideSize);
    if (index !== selectedPlanIndex && index >= 0 && index < PLANS.length) {
      setSelectedPlanIndex(index);
      Haptics.selectionAsync();
    }
  };

  const handleEditCard = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowCardModal(true);
  };

  const handleDownloadInvoice = async (id: string) => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Descarga de Factura', `La factura Klino-${id}0421 se ha guardado en tu dispositivo.`);
  };

  const handlePlanChange = async (index: number) => {
    await Haptics.selectionAsync();
    setSelectedPlanIndex(index);
  };

  return (
    <View className="flex-1 bg-klino-background">
      <Header title="Suscripción" showBack={true} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="p-6">
          
          <MotiView 
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-klino-primary p-8 rounded-[40px] shadow-xl shadow-klino-primary/30 mb-8 overflow-hidden"
          >
            <View className="flex-row justify-between items-start mb-8">
              <View className="flex-1">
                <Text className="text-white/70 font-bold text-[10px] uppercase tracking-[3px]">Plan Actual</Text>
                <Text className="text-white text-3xl font-black mt-1">Personal</Text>
              </View>
              <View className="bg-white/20 p-4 rounded-[24px] ml-4">
                <Zap size={28} color="white" />
              </View>
            </View>

            <View className="space-y-4">
              {['IA de procesamiento ilimitada', 'Hardware multi-link activo', 'Soporte prioritario 24/7'].map((feat, i) => (
                <View key={i} className="flex-row items-center mb-2">
                  <CheckCircle2 size={16} color="#5EEAD4" />
                  <Text className="text-white ml-3 font-semibold text-xs tracking-tight">{feat}</Text>
                </View>
              ))}
            </View>

            <View className="mt-10 pt-8 border-t border-white/10 flex-row justify-between items-end">
              <View>
                <Text className="text-white/50 text-[8px] font-black uppercase tracking-widest">Próximo Cobro</Text>
                <Text className="text-white font-bold text-sm mt-1">21 Mayo, 2026</Text>
              </View>
              <View className="items-end">
                <Text className="text-white font-black text-2xl tracking-tighter">$250.00</Text>
                <Text className="text-white/70 text-[10px] font-bold uppercase">mensual</Text>
              </View>
            </View>
          </MotiView>

          <TouchableOpacity 
            onPress={() => setShowPlansCarousel(true)}
            className="w-full bg-klino-card p-4 rounded-3xl border border-klino-background shadow-sm flex-row items-center justify-center mb-8"
          >
            <RefreshCw size={16} color="#1B4F9B" />
            <Text className="text-klino-primary font-black text-xs uppercase tracking-widest ml-2">Cambiar Plan</Text>
          </TouchableOpacity>

          <View className="mb-8">
            <View className="flex-row justify-between items-center mb-4 px-1">
              <Text className="text-klino-subtext font-bold text-[10px] uppercase tracking-[2px]">Método de Pago</Text>
              <TouchableOpacity onPress={handleInDevelopment}>
                <Plus size={16} color="#1B4F9B" />
              </TouchableOpacity>
            </View>
            <View className="bg-klino-card p-5 rounded-[28px] border border-klino-background shadow-sm flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="w-12 h-12 bg-klino-background rounded-2xl justify-center items-center mr-4 border border-slate-100">
                  <CardIcon size={24} color="#5A6B7E" />
                </View>
                <View>
                  <Text className="font-black text-klino-text text-sm">{cardData.number}</Text>
                  <Text className="text-[10px] text-klino-subtext font-bold uppercase tracking-widest">{cardData.type} Platinum</Text>
                </View>
              </View>
              <TouchableOpacity onPress={handleEditCard}>
                <Text className="text-klino-primary font-bold text-xs uppercase tracking-widest">Ver Tarjeta</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View className="mb-12">
            <Text className="text-klino-subtext font-bold text-[10px] uppercase tracking-[2px] mb-4 ml-1">Facturación Reciente</Text>
            {[
              { id: '1', date: '21 Abr 2026', amount: '$250.00' },
              { id: '2', date: '21 Mar 2026', amount: '$250.00' },
            ].map((inv) => (
              <View 
                key={inv.id}
                className="bg-klino-card p-5 rounded-[28px] border border-klino-background shadow-sm flex-row items-center justify-between mb-4"
              >
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-klino-background rounded-xl justify-center items-center mr-4">
                    <ReceiptText size={20} color="#5A6B7E" />
                  </View>
                  <View>
                    <Text className="font-black text-klino-text text-sm">Recibo Klino-{inv.id}0421</Text>
                    <Text className="text-xs text-klino-subtext font-medium">{inv.date}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleDownloadInvoice(inv.id)}>
                  <Download size={20} color="#1B4F9B" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showCardModal} transparent animationType="fade">
        <View className="flex-1 bg-klino-text/80 justify-center p-6">
          <MotiView 
            from={{ scale: 0.9, opacity: 0, rotateX: '45deg' }}
            animate={{ scale: 1, opacity: 1, rotateX: '0deg' }}
            className="bg-klino-card rounded-[40px] p-8 shadow-2xl"
          >
            <View className="flex-row justify-between items-center mb-10">
              <Text className="text-2xl font-black text-klino-text tracking-tighter">Mi Tarjeta</Text>
              <TouchableOpacity onPress={() => setShowCardModal(false)}>
                <X size={24} color="#5A6B7E" />
              </TouchableOpacity>
            </View>

            <MotiView 
              animate={{ rotateY: ['-5deg', '5deg'] }}
              transition={{ loop: true, repeatReverse: true, type: 'timing', duration: 3000 }}
              className="bg-klino-primary h-48 rounded-3xl p-6 shadow-xl shadow-klino-primary/40 relative mb-10"
              style={{ transform: [{ perspective: 1000 }] }}
            >
              <View className="flex-row justify-between items-start">
                <CardIcon size={32} color="white" />
                <Text className="text-white font-black italic">VISA</Text>
              </View>
              <View className="mt-8">
                <Text className="text-white font-bold text-xl tracking-[4px]">{cardData.number}</Text>
              </View>
              <View className="flex-row justify-between mt-auto">
                <View>
                  <Text className="text-white/50 text-[8px] font-black uppercase">Titular</Text>
                  <Text className="text-white font-bold text-xs">{cardData.holder}</Text>
                </View>
                <View className="items-end">
                  <Text className="text-white/50 text-[8px] font-black uppercase">Vence</Text>
                  <Text className="text-white font-bold text-xs">{cardData.expiry}</Text>
                </View>
              </View>
            </MotiView>

            <View className="space-y-4">
              <View>
                <Text className="text-[10px] font-black text-klino-subtext uppercase tracking-widest mb-2 ml-1">Nombre en la tarjeta</Text>
                <TextInput className="bg-klino-background p-4 rounded-2xl font-bold text-klino-text" defaultValue={cardData.holder} />
              </View>
              <View className="flex-row space-x-4">
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-klino-subtext uppercase tracking-widest mb-2 ml-1">Expiración</Text>
                  <TextInput className="bg-klino-background p-4 rounded-2xl font-bold text-klino-text" defaultValue={cardData.expiry} />
                </View>
                <View className="flex-1">
                  <Text className="text-[10px] font-black text-klino-subtext uppercase tracking-widest mb-2 ml-1">CVC</Text>
                  <TextInput className="bg-klino-background p-4 rounded-2xl font-bold text-klino-text" defaultValue="***" />
                </View>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => setShowCardModal(false)}
              className="bg-klino-primary p-5 rounded-2xl items-center mt-10"
            >
              <Text className="text-white font-black text-xs uppercase tracking-widest">Guardar Cambios</Text>
            </TouchableOpacity>

            <TouchableOpacity className="mt-4 items-center">
              <Text className="text-orange-600 font-black text-[10px] uppercase tracking-widest">Eliminar Método de Pago</Text>
            </TouchableOpacity>
          </MotiView>
        </View>
      </Modal>

      <Modal visible={showPlansCarousel} transparent animationType="slide">
        <View className="flex-1 bg-klino-text/90">
          <SafeAreaView className="flex-1">
            <View className="p-8 flex-row justify-between items-center">
              <View>
                <Text className="text-white text-3xl font-black tracking-tighter">Planes Klino</Text>
                <Text className="text-white/50 font-bold text-[10px] uppercase tracking-[2px]">Selecciona tu nivel</Text>
              </View>
              <TouchableOpacity 
                onPress={() => setShowPlansCarousel(false)}
                className="w-12 h-12 bg-white/10 rounded-full items-center justify-center border border-white/10"
              >
                <X size={24} color="white" />
              </TouchableOpacity>
            </View>

            <View className="flex-1 justify-center items-center">
              <FlatList
                ref={flatListRef}
                data={PLANS}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                snapToInterval={PLAN_CARD_WIDTH + PLAN_SPACING}
                decelerationRate="fast"
                onScroll={handleScroll}
                scrollEventThrottle={16}
                getItemLayout={(_, index) => ({
                  length: PLAN_CARD_WIDTH + PLAN_SPACING,
                  offset: (PLAN_CARD_WIDTH + PLAN_SPACING) * index,
                  index,
                })}
                contentContainerStyle={{ 
                  paddingHorizontal: (SCREEN_WIDTH - PLAN_CARD_WIDTH) / 2,
                  alignItems: 'center'
                }}
                renderItem={({ item, index }) => (
                  <MotiView
                    animate={{ 
                      scale: selectedPlanIndex === index ? 1 : 0.8,
                      opacity: selectedPlanIndex === index ? 1 : 0.4,
                      rotateY: selectedPlanIndex === index ? '0deg' : index < selectedPlanIndex ? '20deg' : '-20deg'
                    }}
                    transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                    style={{ 
                      width: PLAN_CARD_WIDTH, 
                      marginHorizontal: PLAN_SPACING / 2,
                      perspective: 1200,
                    }}
                  >
                    <Pressable 
                      onPress={() => handlePlanChange(index)}
                      className="bg-white rounded-[40px] p-8 h-[480px] shadow-2xl relative overflow-hidden"
                    >
                      {selectedPlanIndex === index && (
                        <View className="absolute top-0 right-0 p-6">
                          <CheckCircle2 size={24} color={item.color} />
                        </View>
                      )}
                      
                      <View style={{ backgroundColor: `${item.color}15` }} className="w-16 h-16 rounded-3xl items-center justify-center mb-6">
                        <Zap size={32} color={item.color} />
                      </View>
                      
                      <Text className="text-klino-text text-3xl font-black tracking-tighter mb-1">{item.name}</Text>
                      <View className="flex-row items-end mb-8">
                        <Text className="text-klino-text text-4xl font-black">
                          {item.id === 'empresarial' ? 'Próximamente' : `$${item.price}`}
                        </Text>
                        {item.id !== 'empresarial' && <Text className="text-klino-subtext font-bold mb-1.5 ml-1">/mes</Text>}
                      </View>

                      <View className="space-y-4">
                        {item.features.map((feat, i) => (
                          <View key={i} className="flex-row items-center mb-2">
                            <CheckCircle2 size={16} color={item.color} />
                            <Text className="text-klino-text ml-3 font-semibold text-xs">{feat}</Text>
                          </View>
                        ))}
                      </View>

                      <TouchableOpacity 
                        disabled={item.id === 'empresarial'}
                        className={`mt-auto p-5 rounded-2xl items-center ${item.id === 'empresarial' ? 'opacity-30' : ''}`}
                        style={{ backgroundColor: item.color }}
                      >
                        <Text className="text-white font-black text-xs uppercase tracking-widest">
                          {item.id === 'empresarial' ? 'Reservar' : 'Activar Plan'}
                        </Text>
                      </TouchableOpacity>
                    </Pressable>
                  </MotiView>
                )}
              />
            </View>

            <View className="p-8 pb-12 items-center">
              <Text className="text-white/30 text-[10px] font-bold uppercase tracking-[3px]">Desliza para explorar</Text>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
};

export default SubscriptionScreen;
