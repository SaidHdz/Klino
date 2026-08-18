import React, { useState } from 'react';
import { View, SafeAreaView, TouchableOpacity, ScrollView, Platform, TextInput, Alert } from 'react-native';
import { ArrowLeft, FileText, Pencil, Trash2 } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';
import { useProfile, IntelligenceMode } from '../context/ProfileContext';
import { useKlinoAlert } from '../context/KlinoAlertContext';

export default function FormatsScreen() {
  const router = useRouter();
  const { intelligenceModes, addIntelligenceMode, deleteIntelligenceMode, updateIntelligenceMode } = useProfile();
  const { showAlert } = useKlinoAlert();
  
  const [activeTab, setActiveTab] = useState<'ver' | 'agregar'>('ver');
  const [editingModeId, setEditingModeId] = useState<string | null>(null);

  // Form state for add/edit
  const [modeName, setModeName] = useState('');
  const [modeFormat, setModeFormat] = useState('');
  const [modePrompt, setModePrompt] = useState('');
  
  const handleEdit = (mode: IntelligenceMode) => {
    setEditingModeId(mode.id);
    setModeName(mode.name);
    setModeFormat(mode.formatName);
    setModePrompt(mode.customPrompt || '');
    setActiveTab('agregar');
  };

  const handleDelete = (id: string) => {
    showAlert('Eliminar Formato', '¿Estás seguro de que deseas eliminar este formato? Las notas existentes no se verán afectadas.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: () => deleteIntelligenceMode(id) }
    ]);
  };

  const handleSave = () => {
    if (!modeName || !modeFormat) {
      showAlert('Faltan datos', 'Por favor llena el nombre del modo y el formato.');
      return;
    }

    if (editingModeId) {
      updateIntelligenceMode(editingModeId, {
        name: modeName,
        formatName: modeFormat,
        customPrompt: modePrompt
      });
      showAlert('Éxito', 'Formato actualizado correctamente.');
    } else {
      addIntelligenceMode({
        name: modeName,
        formatId: modeName.toLowerCase().replace(/\s+/g, '_'),
        formatName: modeFormat,
        color: '#1B4F9B',
        isActive: true,
        customPrompt: modePrompt,
        sections: []
      });
      showAlert('Éxito', 'Formato agregado correctamente.');
    }

    setEditingModeId(null);
    setModeName('');
    setModeFormat('');
    setModePrompt('');
    setActiveTab('ver');
  };

  const handleCancel = () => {
    setEditingModeId(null);
    setModeName('');
    setModeFormat('');
    setModePrompt('');
    setActiveTab('ver');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: KLINO_COLORS.papel }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: Platform.OS === 'android' ? 40 : 16, paddingBottom: 24 }}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ marginRight: 16 }}>
          <ArrowLeft size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
        </TouchableOpacity>
        <KlinoText variant="h2" style={{ fontSize: 20 }}>Formatos</KlinoText>
      </View>

      <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderTopWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={handleCancel}
          style={{ flex: 1, backgroundColor: activeTab === 'ver' ? KLINO_COLORS.verde : KLINO_COLORS.papel, paddingVertical: 16, alignItems: 'center', borderRightWidth: 1, borderColor: KLINO_COLORS.borderStrong, justifyContent: 'center' }}
        >
          <KlinoText variant="label" color={activeTab === 'ver' ? KLINO_COLORS.papel : KLINO_COLORS.gris} style={{ letterSpacing: 0.5, fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>FORMATOS</KlinoText>
        </TouchableOpacity>
        <TouchableOpacity 
          activeOpacity={0.8}
          onPress={() => router.push('/add-format')}
          style={{ flex: 1, backgroundColor: KLINO_COLORS.papel, paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          <KlinoText variant="label" color={KLINO_COLORS.gris} style={{ letterSpacing: 0.5, fontWeight: 'bold', fontSize: 12, textAlign: 'center' }}>NUEVO FORMATO</KlinoText>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
        <View style={{ paddingHorizontal: 24, paddingVertical: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ lineHeight: 24, fontSize: 16 }}>
            Formatos guardados en el modo Consultorio. Klino usa sus campos al dictar y al escanear.
          </KlinoText>
        </View>

        {intelligenceModes.map(mode => (
          <FormatItem 
            key={mode.id}
            title={mode.name}
            subtitle={`${mode.formatName} · ${mode.sections?.length || 0} apartados`}
            onEdit={() => handleEdit(mode)}
            onDelete={() => handleDelete(mode.id)}
          />
        ))}

        {intelligenceModes.length === 0 && (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <KlinoText variant="body" color={KLINO_COLORS.gris}>No hay formatos configurados.</KlinoText>
          </View>
        )}

        <View style={{ paddingHorizontal: 24, paddingVertical: 24 }}>
          <KlinoText variant="body" color={KLINO_COLORS.gris} style={{ lineHeight: 24, fontSize: 16 }}>
            Si borras un formato, los documentos que ya se guardaron con él no se tocan.
          </KlinoText>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const FormatItem = ({ title, subtitle, onEdit, onDelete }: any) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 24, borderBottomWidth: 1, borderColor: KLINO_COLORS.borderStrong }}>
    <View style={{ width: 40, height: 48, borderWidth: 1, borderColor: KLINO_COLORS.borderStrong, justifyContent: 'center', alignItems: 'center', marginRight: 16, backgroundColor: KLINO_COLORS.papelHondo }}>
      <FileText size={20} color={KLINO_COLORS.gris} strokeWidth={1.5} />
    </View>
    <View style={{ flex: 1, paddingRight: 16 }}>
      <KlinoText variant="body" style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 4 }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris} style={{ lineHeight: 18 }}>{subtitle}</KlinoText>
    </View>
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <TouchableOpacity onPress={onEdit} activeOpacity={0.7} style={{ width: 40, height: 40, borderWidth: 1, borderColor: KLINO_COLORS.verde, justifyContent: 'center', alignItems: 'center' }}>
        <Pencil size={18} color={KLINO_COLORS.verde} strokeWidth={2} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={{ width: 40, height: 40, borderWidth: 1, borderColor: '#DC2626', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(220, 38, 38, 0.05)' }}>
        <Trash2 size={18} color="#DC2626" strokeWidth={2} />
      </TouchableOpacity>
    </View>
  </View>
);
