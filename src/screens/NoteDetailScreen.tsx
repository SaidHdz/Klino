import React, { useState, useRef, useEffect, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Platform, Alert, Modal, Dimensions, LayoutChangeEvent } from 'react-native';
import { Share2, FileCheck, Calendar, User, Clock, Download, CheckCircle2, ShieldCheck, PenTool, X, Trash2, Check, Save } from 'lucide-react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { MotiView, AnimatePresence } from 'moti';
import Header from '../components/Header';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useProfile } from '../context/ProfileContext';
import { formatTimeAgo } from '../utils/time';
import Svg, { Path } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// CONSTANTES DE DIMENSIÓN DE FIRMA
const SIG_CANVAS_WIDTH = 300;
const SIG_CANVAS_HEIGHT = 150;

// COMPONENTE MEMOIZADO PARA SECCIONES CLÍNICAS
const ClinicalSection = memo(({ block, idx, isPrimary, isConfirmed, onBlockChange }: any) => {
  return (
    <View className={`${isPrimary ? 'mb-8' : 'mb-4 opacity-70'}`}>
      <View className="flex-row items-center mb-2 px-1">
        <View style={{ backgroundColor: block.color }} className={`${isPrimary ? 'w-2 h-5' : 'w-1 h-3'} rounded-full mr-3`} />
        <Text style={{ color: block.color, fontSize: isPrimary ? 12 : 10 }} className="font-black uppercase tracking-widest">{block.title}</Text>
        {isPrimary && <View className="ml-2 bg-slate-100 px-2 py-0.5 rounded-md"><Text className="text-[7px] font-bold text-slate-400 uppercase">Prioridad Médica</Text></View>}
      </View>
      <TextInput 
        multiline 
        defaultValue={block.content.replace(/\[INAUDIBLE\]/gi, '[... dato no audible ...]') } 
        onEndEditing={(e) => onBlockChange(idx, e.nativeEvent.text)}
        className={`text-klino-text leading-6 font-medium bg-slate-50/50 p-4 rounded-2xl border border-slate-50 ${isPrimary ? 'text-[16px]' : 'text-[14px]'}`} 
        editable={!isConfirmed} 
        scrollEnabled={false}
        placeholderTextColor="#94A3B8"
      />
    </View>
  );
});

const NoteDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { notes, recordsProfileId, confirmNote, updateNoteContent, doctorName, savedSignature, setSavedSignature } = useProfile();
  
  const [isAllReviewed, setIsAllReviewed] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  
  const [canvasLayout, setCanvasLayout] = useState({ width: 0, height: 0 });

  // Buscar la nota actual
  const currentNote = notes[recordsProfileId]?.find(n => n.id === params.id);
  const isConfirmed = currentNote?.status === 'reviewed';

  const [paths, setPaths] = useState<string[]>(currentNote?.signature || []);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [points, setPoints] = useState<{x: number, y: number}[]>([]);
  const [textContent, setTextContent] = useState(currentNote?.transcription || "Sin texto disponible.");
  
  // NUEVO ESTADO PARA SIGNOS VITALES
  const [vitals, setVitals] = useState(currentNote?.vitals || {
    ta: '', fc: '', fr: '', temp: '', sat: '', peso: '', talla: '', imc: ''
  });

  // NUEVO ESTADO PARA BLOQUES CLÍNICOS
  const [parsedBlocks, setParsedBlocks] = useState<any[] | null>(null);

  const parseClinicalNote = (text: string) => {
    const professionalRegex = /\*\*(ANTECEDENTES HEREDOFAMILIARES|ANTECEDENTES PERSONALES NO PATOLÓGICOS|ANTECEDENTES PERSONALES PATOLÓGICOS|PADECIMIENTO ACTUAL|EXPLORACIÓN FÍSICA|IMPRESIÓN DIAGNÓSTICA|PLAN):\*\*/gi;
    if (professionalRegex.test(text)) {
      const parts = text.split(professionalRegex);
      const blocks = [];
      let preamble = parts[0].trim();
      if (preamble) blocks.push({ title: 'Nota General', content: preamble, color: '#5A6B7E', bg: 'bg-slate-50', rawHeader: '' });
      for (let i = 1; i < parts.length; i += 2) {
        const header = parts[i].trim();
        const content = parts[i + 1] ? parts[i + 1].trim() : '';
        let title = header;
        let color = '#5A6B7E';
        let bg = 'bg-slate-50';
        const hUpper = header.toUpperCase();
        if (hUpper.includes('ANTECEDENTES')) { color = '#1B4F9B'; bg = 'bg-blue-50'; }
        else if (hUpper.includes('PADECIMIENTO')) { color = '#E8820C'; bg = 'bg-orange-50'; }
        else if (hUpper.includes('EXPLORACIÓN')) { color = '#2A7D6F'; bg = 'bg-emerald-50'; }
        else if (hUpper.includes('DIAGNÓSTICA')) { color = '#E11D48'; bg = 'bg-rose-50'; }
        else if (hUpper.includes('PLAN')) { color = '#8B5CF6'; bg = 'bg-purple-50'; }
        blocks.push({ title, content, color, bg, rawHeader: header });
      }
      return blocks.length > 0 ? blocks : null;
    }
    const cleanText = text.replace(/\*\*(S:|Subjetivo:|O:|Objetivo:|A:|Análisis:|Assessment:|P:|Plan:)\*\*/gi, '$1');
    const soapRegex = /(S:|Subjetivo:|O:|Objetivo:|A:|Análisis:|Assessment:|P:|Plan:)/gi;
    const parts = cleanText.split(soapRegex);
    if (parts.length <= 1) return null;
    const blocks = [];
    let preamble = parts[0].trim();
    if (preamble) blocks.push({ title: 'Nota General', content: preamble, color: '#5A6B7E', bg: 'bg-slate-50', rawHeader: '' });
    for (let i = 1; i < parts.length; i += 2) {
      const header = parts[i].trim();
      const content = parts[i + 1] ? parts[i + 1].trim() : '';
      let title = 'Sección';
      let color = '#5A6B7E';
      let bg = 'bg-slate-50';
      const hUpper = header.toUpperCase();
      if (hUpper.includes('S:') || hUpper.includes('SUBJETIVO')) { title = 'Subjetivo'; color = '#1B4F9B'; bg = 'bg-blue-50'; }
      else if (hUpper.includes('O:') || hUpper.includes('OBJETIVO')) { title = 'Objetivo'; color = '#2A7D6F'; bg = 'bg-emerald-50'; }
      else if (hUpper.includes('A:') || hUpper.includes('ANÁLISIS') || hUpper.includes('ASSESSMENT')) { title = 'Análisis'; color = '#E8820C'; bg = 'bg-orange-50'; }
      else if (hUpper.includes('P:') || hUpper.includes('PLAN')) { title = 'Plan'; color = '#8B5CF6'; bg = 'bg-purple-50'; }
      blocks.push({ title, content, color, bg, rawHeader: header });
    }
    return blocks.length > 0 ? blocks : null;
  };

  useEffect(() => {
    if (textContent && !parsedBlocks) setParsedBlocks(parseClinicalNote(textContent));
  }, [textContent]);

  const handleBlockChange = (index: number, newContent: string) => {
    if (!parsedBlocks) return;
    const newBlocks = [...parsedBlocks];
    newBlocks[index].content = newContent;
    setParsedBlocks(newBlocks);
    let newText = '';
    newBlocks.forEach(b => {
      if (b.rawHeader) newText += `**${b.rawHeader}:**\n${b.content}\n\n`;
      else if (b.content) newText += `${b.content}\n\n`;
    });
    newText = newText.replace(/\*\*([^:]+):\*\*:/g, '**$1:**');
    setTextContent(newText.trim());
    updateNoteContent(recordsProfileId, params.id as string, newText.trim());
  };

  useEffect(() => {
    if (currentNote) setPaths(currentNote.signature || []);
  }, [currentNote?.id]);

  const handleConfirm = async () => {
    if (!isAllReviewed && !isConfirmed) {
      Alert.alert("Revisión Pendiente", "Por favor marca la sección como revisada antes de confirmar.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    confirmNote(recordsProfileId, params.id as string, paths);
    router.back();
  };

  const handleTextChange = (text: string) => {
    setTextContent(text);
    updateNoteContent(recordsProfileId, params.id as string, text);
  };

  const useGlobalSignature = async () => {
    if (!savedSignature) return Alert.alert("Firma", "No tienes una firma guardada.");
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setPaths(savedSignature);
  };

  const handleSaveGlobalSignature = async () => {
    if (paths.length === 0) return Alert.alert("Firma", "No hay nada que guardar.");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setSavedSignature(paths);
    Alert.alert("Éxito", "Tu firma ha sido guardada.");
  };

  const handlePDF = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const signatureSvg = paths.length > 0 ? `<svg width="180" height="90" viewBox="0 0 ${SIG_CANVAS_WIDTH} ${SIG_CANVAS_HEIGHT}" style="display: block; margin: 0 auto;">${paths.map(p => `<path d="${p}" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`).join('')}</svg>` : '<div style="height: 90px;"></div>';
    const vitalsHtml = Object.entries({ ta: 'T.A.', fc: 'F.C.', fr: 'F.R.', temp: 'Temp.', sat: 'Sat. O2', peso: 'Peso', talla: 'Talla', imc: 'IMC' }).map(([key, label]) => {
      const val = (vitals as any)[key];
      if (!val) return '';
      return `<div style="margin-bottom: 12px;"><div style="font-size: 9px; font-weight: bold; color: #5A6B7E; text-transform: uppercase;">${label}</div><div style="font-size: 13px; font-weight: 900; color: #1A2332;">${val}</div></div>`;
    }).join('');
    const html = `<html><head><style>body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 0; margin: 0; color: #1A2332; background: #fff; }.header { background: #1B4F9B; color: white; padding: 25px 40px; }.header-title { margin: 0; font-weight: 900; font-size: 24px; letter-spacing: 1px; text-transform: uppercase; }.header-subtitle { margin: 5px 0 0 0; font-size: 12px; opacity: 0.8; }.container { display: flex; min-height: 800px; }.sidebar { width: 25%; background: #F8FAFC; border-right: 1px solid #E2E8F0; padding: 30px; }.content { width: 75%; padding: 30px 40px; }.info-block { margin-bottom: 20px; }.info-label { font-size: 9px; font-weight: bold; color: #5A6B7E; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px; }.info-value { font-size: 13px; font-weight: bold; color: #1A2332; }.vitals-section { margin-top: 40px; border-top: 2px solid #E2E8F0; padding-top: 20px; }.clinical-content { white-space: pre-wrap; font-size: 12px; line-height: 1.6; }.signature-box { margin-top: 60px; text-align: center; width: 250px; margin-left: auto; margin-right: auto; }.signature-line { border-top: 1.5px solid #1A2332; width: 100%; margin-top: -15px; }</style></head><body><div class="header"><h1 class="header-title">NOTA CLINICA</h1><p class="header-subtitle">Documento Médico Legal • Klino AI Flow</p></div><div class="container"><div class="sidebar"><div class="info-block"><div class="info-label">Paciente</div><div class="info-value">${params.name || 'Paciente'}</div></div><div class="info-block"><div class="info-label">Fecha</div><div class="info-value">${new Date(currentNote?.time || Date.now()).toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div></div><div class="info-block"><div class="info-label">Especialidad</div><div class="info-value">${currentNote?.specialty || 'General'}</div></div><div class="info-block"><div class="info-label">Médico</div><div class="info-value">Dr. ${doctorName}</div></div>${vitalsHtml ? `<div class="vitals-section"><div class="info-label" style="margin-bottom: 15px; color: #1B4F9B;">Signos Vitales</div>${vitalsHtml}</div>` : ''}</div><div class="content"><h3 style="color: #1B4F9B; font-size: 14px; text-transform: uppercase; margin-top: 0; margin-bottom: 20px; letter-spacing: 1px; border-bottom: 2px solid #1B4F9B; padding-bottom: 5px; display: inline-block;">Nota de Evolución</h3><div class="clinical-content">${textContent}</div><div class="signature-box"><div>${signatureSvg}</div><div class="signature-line"></div><p style="margin-top: 8px; font-weight: 900; font-size: 13px; color: #1A2332;">Dr. ${doctorName}</p></div></div></div></body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri);
  };

  const getCoordinates = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const width = canvasLayout.width || (SCREEN_WIDTH - 80);
    const height = canvasLayout.height || 200;
    const x = (locationX / width) * SIG_CANVAS_WIDTH;
    const y = (locationY / height) * SIG_CANVAS_HEIGHT;
    return { x: Math.floor(x), y: Math.floor(y) };
  };

  const pathBuffer = useRef<string[]>(paths);
  const onTouchStart = (event: any) => {
    if (isConfirmed) return;
    const point = getCoordinates(event);
    setPoints([point]);
    setCurrentPath(`M ${point.x},${point.y}`);
  };

  const onTouchMove = (event: any) => {
    if (isConfirmed) return;
    const point = getCoordinates(event);
    setPoints(prevPoints => {
      const newPoints = [...prevPoints, point];
      if (newPoints.length > 1) {
        let d = `M ${newPoints[0].x},${newPoints[0].y}`;
        for (let i = 1; i < newPoints.length - 1; i++) {
          const midX = (newPoints[i].x + newPoints[i+1].x) / 2;
          const midY = (newPoints[i].y + newPoints[i+1].y) / 2;
          d += ` Q ${newPoints[i].x},${newPoints[i].y} ${midX},${midY}`;
        }
        const last = newPoints[newPoints.length - 1];
        d += ` L ${last.x},${last.y}`;
        setCurrentPath(d);
      }
      return newPoints;
    });
  };

  const onTouchEnd = () => {
    if (isConfirmed) return;
    if (currentPath.length > 10) { // Mayor tolerancia para evitar puntos accidentales
      pathBuffer.current = [...pathBuffer.current, currentPath];
      setPaths(pathBuffer.current);
    }
    // LIMPIEZA INMEDIATA PARA EVITAR "RAYONES"
    setCurrentPath('');
    setPoints([]);
  };

  const handleManualSave = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // Forzar actualización en Context y Supabase
    updateNoteContent(recordsProfileId, params.id as string, textContent);
    Alert.alert("Éxito", "Los cambios han sido guardados localmente y en la nube.");
  };

  const onCanvasLayout = (event: LayoutChangeEvent) => setCanvasLayout({ width: event.nativeEvent.layout.width, height: event.nativeEvent.layout.height });
  const clearSignature = () => { pathBuffer.current = []; setPaths([]); setCurrentPath(''); setPoints([]); };
  const saveSignature = async () => {
    if (paths.length === 0) return Alert.alert("Firma", "Por favor ingresa una firma.");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowSignatureModal(false);
  };

  return (
    <View className="flex-1 bg-white">
      <Header title="NOTA CLINICA" showBack={true} />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false} removeClippedSubviews={true}>
        <View className="p-6">
          <View className="flex-row justify-between items-center mb-8 border-b border-slate-50 pb-6">
            <View className="flex-1 mr-4">
              <Text className="text-[20px] font-black text-klino-text tracking-tighter" numberOfLines={1}>{params.name || 'Paciente'}</Text>
              <View className="flex-row items-center mt-1">
                <Calendar size={10} color="#94A3B8" /><Text className="text-[10px] font-bold text-slate-400 ml-1 uppercase">{formatTimeAgo(currentNote?.time)}</Text>
                <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" /><Text className="text-[10px] font-bold text-slate-400 uppercase">ID: {params.id?.toString().slice(-4)}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => !isConfirmed && (Haptics.selectionAsync(), setIsAllReviewed(!isAllReviewed))}
              className={`px-4 py-2.5 rounded-xl flex-row items-center border ${isConfirmed || isAllReviewed ? 'bg-klino-secondary border-klino-secondary' : 'bg-white border-slate-200'}`}
            >
              <CheckCircle2 size={14} color={isConfirmed || isAllReviewed ? 'white' : '#94A3B8'} /><Text className={`text-[10px] font-black ml-2 uppercase ${isConfirmed || isAllReviewed ? 'text-white' : 'text-slate-400'}`}>{isConfirmed || isAllReviewed ? 'Revisado' : 'Pendiente'}</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-10 bg-slate-50/50 p-5 rounded-[28px] border border-slate-100">
            <View className="flex-row justify-between items-center mb-4 px-1"><Text className="text-[10px] font-black text-slate-400 uppercase tracking-[2px]">Somatometría y Vitales</Text><Clock size={12} color="#CBD5E1" /></View>
            <View className="flex-row flex-wrap justify-between">
              {Object.entries({ ta: 'T.A.', fc: 'F.C.', fr: 'F.R.', temp: 'Temp.', sat: 'Sat.', peso: 'Peso', talla: 'Talla', imc: 'IMC' }).map(([key, label]) => (
                <View key={key} className="w-[23%] mb-3">
                  <TextInput value={(vitals as any)[key]} onChangeText={(val) => !isConfirmed && setVitals({ ...vitals, [key]: val })} editable={!isConfirmed} placeholder="--" textAlign="center" className="bg-white border border-slate-100 rounded-xl py-2 text-klino-text font-black text-xs shadow-sm" />
                  <Text className="text-[8px] font-bold text-slate-400 uppercase text-center mt-1.5 tracking-tighter">{label}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="mb-4">
            {parsedBlocks ? (
              <View>{parsedBlocks.map((block, idx) => (
                <ClinicalSection key={idx} block={block} idx={idx} isPrimary={block.title.includes('PADECIMIENTO') || block.title.includes('DIAGNÓSTICA')} isConfirmed={isConfirmed} onBlockChange={handleBlockChange} />
              ))}</View>
            ) : (
              <View>
                <Text className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Nota de Evolución</Text>
                <TextInput multiline value={textContent} onChangeText={handleTextChange} className="text-klino-text text-[15px] leading-7 font-medium bg-slate-50/30 p-6 rounded-[32px] border border-slate-50" style={{ minHeight: 300, textAlignVertical: 'top' }} editable={!isConfirmed} scrollEnabled={false} />
              </View>
            )}
          </View>

          <View className="mt-8 items-center border-t border-slate-50 pt-10">
            {!isConfirmed && (
              <TouchableOpacity onPress={useGlobalSignature} className="bg-white px-5 py-2.5 rounded-full border border-slate-100 flex-row items-center shadow-sm mb-8">
                <Check size={14} color="#1B4F9B" /><Text className="text-klino-primary font-black text-[9px] uppercase ml-2 tracking-widest">Usar firma guardada</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => !isConfirmed && setShowSignatureModal(true)} className={`w-72 h-36 border-2 border-dashed ${paths.length > 0 ? 'border-klino-secondary bg-klino-secondary/5' : 'border-slate-100 bg-slate-50/30'} rounded-[32px] items-center justify-center overflow-hidden`} activeOpacity={0.8}>
              {paths.length > 0 ? (<View style={{ width: '100%', height: '100%' }}><Svg height="100%" width="100%" viewBox={`0 0 ${SIG_CANVAS_WIDTH} ${SIG_CANVAS_HEIGHT}`}>{paths.map((d, i) => (<Path key={i} d={d} fill="none" stroke="#2A7D6F" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />))}</Svg></View>) : (<View className="items-center opacity-30"><PenTool size={24} color="#5A6B7E" /><Text className="text-[10px] font-black text-slate-400 uppercase mt-3 tracking-[2px]">Firma Médica</Text></View>)}
            </TouchableOpacity>
            <View className="w-48 h-[1px] bg-slate-100 mt-4" /><Text className="text-klino-text font-black text-[12px] uppercase mt-3 tracking-widest">Dr. {doctorName}</Text>
          </View>

          <View className="mt-12 mb-20 px-2">
            {!isConfirmed && (
              <TouchableOpacity 
                onPress={handleManualSave} 
                activeOpacity={0.8} 
                className="bg-white border border-slate-200 p-4 rounded-2xl flex-row items-center justify-center mb-4 shadow-sm"
              >
                <Save size={18} color="#1B4F9B" />
                <Text className="text-klino-primary font-black text-xs uppercase ml-2 tracking-wider">Guardar Nota</Text>
              </TouchableOpacity>
            )}
            
            {!isConfirmed ? (
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={handleConfirm} activeOpacity={0.9} className={`flex-1 p-5 rounded-[22px] items-center shadow-lg ${isAllReviewed ? 'bg-klino-secondary shadow-klino-secondary/20' : 'bg-klino-primary shadow-klino-primary/20'}`}>
                  <Text className="text-white font-black text-xs uppercase tracking-[2px]">Finalizar y Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handlePDF} className="w-16 bg-slate-50 rounded-[22px] items-center justify-center border border-slate-100"><Download size={22} color="#1B4F9B" /></TouchableOpacity>
              </View>
            ) : (
              <View className="space-y-4">
                <View className="bg-emerald-50 p-4 rounded-2xl flex-row items-center justify-center border border-emerald-100"><ShieldCheck size={16} color="#2A7D6F" /><Text className="text-klino-secondary font-black text-[11px] uppercase ml-3 tracking-wider">CERTIFICADO Y RESGUARDADO</Text></View>
                <TouchableOpacity onPress={handlePDF} activeOpacity={0.8} className="bg-klino-primary p-5 rounded-[22px] flex-row items-center justify-center shadow-xl shadow-klino-primary/30">
                  <Download size={20} color="white" />
                  <Text className="text-white font-black text-xs uppercase ml-3 tracking-[2px]">Descargar NOTA CLINICA PDF</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <Modal visible={showSignatureModal} transparent animationType="slide">
        <View className="flex-1 bg-black/80 justify-center items-center p-6">
          <MotiView from={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full rounded-[40px] p-6 shadow-2xl">
            <View className="flex-row justify-between items-center mb-6 px-2">
              <View><Text className="text-xl font-black text-klino-text tracking-tighter">Firma Médica</Text><Text className="text-klino-subtext text-[9px] font-bold uppercase tracking-widest">Trazo fluido de alta precisión</Text></View>
              <TouchableOpacity onPress={() => setShowSignatureModal(false)}><X size={24} color="#5A6B7E" /></TouchableOpacity>
            </View>
            <View className="bg-slate-50 border-2 border-slate-100 rounded-3xl overflow-hidden mb-6" style={{ height: 200 }} onLayout={onCanvasLayout} onStartShouldSetResponder={() => true} onResponderStart={onTouchStart} onResponderMove={onTouchMove} onResponderRelease={onTouchEnd}>
              <Svg height="100%" width="100%" viewBox={`0 0 ${SIG_CANVAS_WIDTH} ${SIG_CANVAS_HEIGHT}`}>{paths.map((d, i) => (<Path key={i} d={d} fill="none" stroke="#1A2332" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />))}{currentPath.length > 0 && (<Path d={currentPath} fill="none" stroke="#1A2332" strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />)}</Svg>
            </View>
            <View className="space-y-3">
              <TouchableOpacity onPress={handleSaveGlobalSignature} className="bg-blue-50 p-4 rounded-2xl flex-row items-center justify-center border border-blue-100 shadow-sm">
                <Save size={18} color="#1B4F9B" />
                <Text className="ml-2 text-klino-primary font-black text-xs uppercase">Guardar como mi firma</Text>
              </TouchableOpacity>
              <View className="flex-row space-x-3">
                <TouchableOpacity onPress={clearSignature} className="flex-1 p-4 bg-orange-50 rounded-2xl flex-row items-center justify-center border border-orange-100"><Trash2 size={16} color="#E8820C" /><Text className="ml-2 text-klino-accent font-bold text-xs uppercase">Limpiar</Text></TouchableOpacity>
                <TouchableOpacity onPress={saveSignature} className="flex-[2] p-4 bg-klino-primary rounded-2xl items-center justify-center"><Text className="text-white font-black text-xs uppercase">Confirmar Trazo</Text></TouchableOpacity>
              </View>
            </View>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
};

export default NoteDetailScreen;
