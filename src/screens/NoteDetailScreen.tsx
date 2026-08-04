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
    <View className={`mb-4 bg-white border ${isPrimary ? 'border-red-200 shadow-[0_4px_15px_rgb(225,29,72,0.1)]' : 'border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)]'} rounded-2xl overflow-hidden ${!isConfirmed && !isPrimary ? 'opacity-90' : ''}`}>
      <View className={`flex-row items-center px-4 py-3 border-b ${isPrimary ? 'bg-red-50/30 border-red-100' : 'bg-slate-50/50 border-slate-100'}`}>
        <View style={{ backgroundColor: block.color }} className="w-2 h-2 rounded-full mr-2" />
        <Text style={{ color: '#1E293B' }} className="font-semibold text-xs tracking-wider uppercase flex-1 mr-2 flex-wrap">{block.title}</Text>
        {isPrimary && (
          <View className="bg-red-100 px-2 py-1 rounded-md border border-red-200 shrink-0">
            <Text className="text-[9px] font-black text-red-600 uppercase tracking-widest text-center">Prioridad</Text>
          </View>
        )}
      </View>
      <TextInput 
        multiline 
        defaultValue={block.content.replace(/\[INAUDIBLE\]/gi, '[... dato no audible ...]') } 
        onEndEditing={(e) => onBlockChange(idx, e.nativeEvent.text)}
        className="text-slate-700 leading-relaxed font-medium p-4 text-[14px]" 
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
  const { 
    notes, recordsProfileId, confirmNote, updateNoteContent, 
    doctorName, doctorCedula, doctorUniversity, doctorAddress,
    savedSignature, setSavedSignature 
  } = useProfile();
  
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

  const handlePrescriptionPDF = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    
    // Extraer el plan de tratamiento de los bloques parseados
    let treatmentPlan = '';
    if (parsedBlocks) {
      const planBlock = parsedBlocks.find(b => b.title.toUpperCase().includes('PLAN'));
      if (planBlock) treatmentPlan = planBlock.content;
    }
    
    // Si no hay bloques o no se encontró el plan, usar el texto completo
    if (!treatmentPlan) {
      treatmentPlan = textContent;
    }

    const signatureSvg = paths.length > 0 ? `<svg width="180" height="90" viewBox="0 0 ${SIG_CANVAS_WIDTH} ${SIG_CANVAS_HEIGHT}" style="display: block; margin: 0 auto;">${paths.map(p => `<path d="${p}" fill="none" stroke="black" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />`).join('')}</svg>` : '<div style="height: 90px;"></div>';
    
    const html = `
    <html>
    <head>
      <style>
        @page { margin: 0; }
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 50px 60px; color: #1A2332; background: #fff; line-height: 1.5; margin: 0; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #1B4F9B; padding-bottom: 25px; margin-bottom: 30px; }
        .doctor-info { flex: 2; }
        .clinic-info { flex: 1; text-align: right; }
        .doctor-name { font-size: 26px; font-weight: 900; color: #1B4F9B; margin: 0 0 5px 0; text-transform: uppercase; letter-spacing: -0.5px; }
        .doctor-meta { font-size: 11px; color: #5A6B7E; font-weight: bold; margin: 3px 0; text-transform: uppercase; letter-spacing: 0.5px; }
        .patient-box { background: #F8FAFC; padding: 25px; border-radius: 12px; margin-bottom: 35px; border: 1px solid #E2E8F0; }
        .patient-grid { display: flex; flex-wrap: wrap; }
        .patient-item { width: 50%; margin-bottom: 15px; }
        .label { font-size: 9px; font-weight: 800; color: #94A3B8; text-transform: uppercase; margin-bottom: 3px; letter-spacing: 0.5px; }
        .value { font-size: 14px; font-weight: bold; color: #1A2332; }
        .rx-container { display: flex; gap: 20px; }
        .rx-symbol { font-size: 55px; font-weight: 900; color: #1B4F9B; line-height: 0.8; font-family: 'Georgia', serif; font-style: italic; }
        .treatment-content { flex: 1; min-height: 400px; font-size: 15px; white-space: pre-wrap; padding-top: 10px; line-height: 1.8; color: #334155; }
        .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; }
        .signature-box { width: 280px; text-align: center; }
        .signature-line { border-top: 1.5px solid #1A2332; width: 100%; margin-top: -15px; }
        .qr-placeholder { width: 80px; height: 80px; border: 2px dashed #CBD5E1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #94A3B8; text-align: center; }
        .address-footer { font-size: 9px; color: #94A3B8; margin-top: 40px; text-align: center; text-transform: uppercase; letter-spacing: 1px; border-top: 1px solid #F1F5F9; padding-top: 15px; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="doctor-info">
          <h1 class="doctor-name">Dr. ${doctorName}</h1>
          <p class="doctor-meta">${currentNote?.specialty || 'Medicina General'}</p>
          <p class="doctor-meta">${doctorUniversity}</p>
          <p class="doctor-meta">Cédula Profesional: ${doctorCedula}</p>
        </div>
        <div class="clinic-info">
          <p class="doctor-meta" style="color: #1A2332;">Klino Medical Center</p>
          <p class="doctor-meta" style="font-size: 9px; opacity: 0.7;">RECETA MÉDICA</p>
        </div>
      </div>

      <div class="patient-box">
        <div class="patient-grid">
          <div class="patient-item">
            <div class="label">Paciente</div>
            <div class="value">${params.name || 'Paciente'}</div>
          </div>
          <div class="patient-item">
            <div class="label">Fecha de Expedición</div>
            <div class="value">${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
          <div class="patient-item" style="margin-bottom: 0;">
            <div class="label">Edad / Sexo</div>
            <div class="value">-- Años / --</div>
          </div>
          <div class="patient-item" style="margin-bottom: 0;">
            <div class="label">Peso / Talla / Temp</div>
            <div class="value">${(vitals as any).peso || '--'} kg / ${(vitals as any).talla || '--'} m / ${(vitals as any).temp || '--'} °C</div>
          </div>
        </div>
      </div>

      <div class="rx-container">
        <div class="rx-symbol">Rx</div>
        <div class="treatment-content">${treatmentPlan}</div>
      </div>

      <div class="footer">
        <div class="qr-placeholder">
          VALIDACIÓN<br/>DIGITAL
        </div>
        <div class="signature-box">
          <div>${signatureSvg}</div>
          <div class="signature-line"></div>
          <p style="margin-top: 8px; font-weight: 900; font-size: 13px; color: #1A2332;">Dr. ${doctorName}</p>
          <p style="font-size: 9px; color: #5A6B7E; text-transform: uppercase; margin-top: -5px;">Firma del Médico</p>
        </div>
      </div>

      <div class="address-footer">
        ${doctorAddress} • Generado por Klino AI
      </div>
    </body>
    </html>
    `;

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
    setCurrentPath(prev => `${prev} L ${point.x},${point.y}`);
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
          <View className="flex-row justify-between items-center mb-8 border-b border-slate-200/60 pb-5">
            <View className="flex-1 mr-4">
              <Text className="text-2xl font-bold text-slate-900 tracking-tight" numberOfLines={1}>{params.name || 'Paciente'}</Text>
              <View className="flex-row items-center mt-1.5">
                <Calendar size={12} color="#64748B" /><Text className="text-[11px] font-medium text-slate-500 ml-1">{formatTimeAgo(currentNote?.time)}</Text>
                <View className="w-1 h-1 rounded-full bg-slate-300 mx-2" /><Text className="text-[11px] font-medium text-slate-500">ID: {params.id?.toString().slice(-4)}</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => !isConfirmed && (Haptics.selectionAsync(), setIsAllReviewed(!isAllReviewed))}
              className={`px-3 py-2 rounded-lg flex-row items-center border ${isConfirmed || isAllReviewed ? 'bg-emerald-50 border-emerald-100' : 'bg-white border-slate-200 shadow-sm'}`}
            >
              <CheckCircle2 size={14} color={isConfirmed || isAllReviewed ? '#10B981' : '#94A3B8'} /><Text className={`text-[10px] font-bold ml-1.5 uppercase tracking-wide ${isConfirmed || isAllReviewed ? 'text-emerald-600' : 'text-slate-500'}`}>{isConfirmed || isAllReviewed ? 'Revisado' : 'Pendiente'}</Text>
            </TouchableOpacity>
          </View>

          <View className="mb-8 bg-white p-5 rounded-2xl border border-slate-200/60 shadow-[0_2px_10px_rgb(0,0,0,0.02)]">
            <View className="flex-row justify-between items-center mb-4"><Text className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">Somatometría y Vitales</Text><Clock size={14} color="#94A3B8" /></View>
            <View className="flex-row flex-wrap justify-between">
              {Object.entries({ ta: 'T.A.', fc: 'F.C.', fr: 'F.R.', temp: 'Temp.', sat: 'Sat.', peso: 'Peso', talla: 'Talla', imc: 'IMC' }).map(([key, label]) => (
                <View key={key} className="w-[23%] mb-3">
                  <TextInput value={(vitals as any)[key]} onChangeText={(val) => !isConfirmed && setVitals({ ...vitals, [key]: val })} editable={!isConfirmed} placeholder="--" textAlign="center" className="bg-slate-50 border border-slate-100 rounded-lg py-2 text-slate-800 font-bold text-xs" />
                  <Text className="text-[9px] font-medium text-slate-400 uppercase text-center mt-1.5 tracking-wide">{label}</Text>
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

          <View className="mt-8 items-center border-t border-slate-200/60 pt-8">
            {!isConfirmed && (
              <TouchableOpacity onPress={useGlobalSignature} className="bg-white px-5 py-2.5 rounded-full border border-slate-200 flex-row items-center shadow-[0_2px_10px_rgb(0,0,0,0.03)] mb-6">
                <Check size={14} color="#1B4F9B" /><Text className="text-klino-primary font-semibold text-[10px] uppercase ml-2 tracking-widest">Usar firma guardada</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => !isConfirmed && setShowSignatureModal(true)} className={`w-72 h-36 border ${paths.length > 0 ? 'border-klino-primary/20 bg-blue-50/10' : 'border-slate-200 bg-white'} rounded-2xl items-center justify-center overflow-hidden shadow-sm`} activeOpacity={0.8}>
              {paths.length > 0 ? (<View style={{ width: '100%', height: '100%' }}><Svg height="100%" width="100%" viewBox={`0 0 ${SIG_CANVAS_WIDTH} ${SIG_CANVAS_HEIGHT}`}>{paths.map((d, i) => (<Path key={i} d={d} fill="none" stroke="#1B4F9B" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />))}</Svg></View>) : (<View className="items-center opacity-40"><PenTool size={20} color="#64748B" /><Text className="text-[11px] font-semibold text-slate-500 uppercase mt-2 tracking-widest">Firma Médica</Text></View>)}
            </TouchableOpacity>
            <View className="w-48 h-[1px] bg-slate-200 mt-4" /><Text className="text-slate-800 font-bold text-[12px] uppercase mt-3 tracking-widest">Dr. {doctorName}</Text>
          </View>

          <View className="mt-12 mb-20 px-2">
            {!isConfirmed && (
              <TouchableOpacity 
                onPress={handleManualSave} 
                activeOpacity={0.8} 
                className="bg-white border border-slate-200/60 p-4 rounded-xl flex-row items-center justify-center mb-4 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
              >
                <Save size={16} color="#1B4F9B" />
                <Text className="text-klino-primary font-bold text-[12px] uppercase ml-2 tracking-widest">Guardar Cambios Locales</Text>
              </TouchableOpacity>
            )}
            
            {!isConfirmed ? (
              <>
                <View className="flex-row space-x-3 mt-2">
                  <TouchableOpacity onPress={handleConfirm} activeOpacity={0.9} className={`flex-1 py-4 rounded-xl items-center justify-center shadow-[0_4px_15px_rgb(27,79,155,0.2)] ${isAllReviewed ? 'bg-klino-primary' : 'bg-klino-primary/90'}`}>
                    <Text className="text-white font-bold text-[12px] uppercase tracking-widest">Finalizar y Guardar</Text>
                  </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                  onPress={handlePrescriptionPDF} 
                  activeOpacity={0.8} 
                  className="mt-4 bg-white py-4 rounded-xl flex-row items-center justify-center border border-slate-200 shadow-[0_2px_10px_rgb(0,0,0,0.02)]"
                >
                  <FileCheck size={18} color="#1B4F9B" />
                  <Text className="text-klino-primary font-bold text-[12px] uppercase ml-2 tracking-widest">Imprimir Receta Médica</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View className="space-y-3 mt-2">
                <View className="bg-emerald-50/80 p-3 rounded-xl flex-row items-center justify-center border border-emerald-100/50"><ShieldCheck size={14} color="#10B981" /><Text className="text-emerald-700 font-bold text-[11px] uppercase ml-2 tracking-widest">Certificado y Resguardado</Text></View>
                <TouchableOpacity onPress={handlePDF} activeOpacity={0.8} className="bg-klino-primary py-4 rounded-xl flex-row items-center justify-center shadow-[0_4px_15px_rgb(27,79,155,0.2)]">
                  <Download size={18} color="white" />
                  <Text className="text-white font-bold text-[12px] uppercase ml-2 tracking-widest">Descargar Nota (PDF)</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  onPress={handlePrescriptionPDF} 
                  activeOpacity={0.8} 
                  className="bg-white py-4 rounded-xl flex-row items-center justify-center border border-slate-200 shadow-sm"
                >
                  <FileCheck size={18} color="#1B4F9B" />
                  <Text className="text-klino-primary font-bold text-[12px] uppercase ml-2 tracking-widest">Generar Receta Médica</Text>
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
