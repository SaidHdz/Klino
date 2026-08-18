import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
import * as Updates from 'expo-updates';
import { formatClinicalJson } from '../utils/formatClinicalJson';

type ProfileType = 'General' | 'Especialista';

interface AppSettings {
  notifications: {
    hardware: boolean;
    patients: boolean;
    soap: boolean;
    security: boolean;
  };
  security: {
    biometrics: boolean;
  };
  appearance: {
    glassmorphism: boolean;
    dictationButtonOrientation?: 'vertical' | 'horizontal';
  };
}

export interface AppNotification {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'hardware' | 'patient';
  icon: string;
  color: string;
  unread: boolean;
}

export interface VitalSigns {
  ta?: string; // Tensión Arterial
  fc?: string; // Frecuencia Cardíaca
  fr?: string; // Frecuencia Respiratoria
  temp?: string; // Temperatura
  sat?: string; // Saturación O2
  peso?: string;
  talla?: string;
  imc?: string;
}

export interface ClinicalNarrative {
  antecedentes_heredofamiliares?: string;
  antecedentes_personales_no_patologicos?: string;
  antecedentes_personales_patologicos?: string;
  padecimiento_actual?: string;
  exploracion_fisica?: string;
  impresion_diagnostica?: string;
  plan?: string;
}

export interface ClinicalNote {
  id: string;
  patientId?: string;
  name: string;
  specialty: string;
  statusText: string;
  status: 'pending' | 'generated' | 'reviewed';
  time: string | number;
  specialtyColor: string;
  transcription?: string; // SOAP text
  rawTranscription?: string; // Raw STT text
  clinicalData?: ClinicalNarrative;
  vitals?: VitalSigns;
  pdfUri?: string;
  signature?: string[]; 
}

export interface IntelligenceMode {
  id: string;
  name: string;
  formatId: string;
  formatName: string;
  color: string;
  isActive: boolean;
  webhookFolderKey?: string;
  promptPresetId?: string;
  customPrompt?: string;
  sections?: string[];
  templateImageUri?: string;
}

export interface PresetFormat {
  id: string;
  name: string;
  description: string;
  sections: string[];
  promptPresetId: string;
  customPrompt: string;
  webhookFolderKey: string;
}

export const PRESET_FORMATS: PresetFormat[] = [
  {
    id: 'hp_completa',
    name: 'Consulta General (H&P)',
    description: 'Estructura médica completa: Antecedentes, Padecimiento Actual, Exploración Física, Impresión Diagnóstica y Plan.',
    sections: ['ANTECEDENTES HEREDOFAMILIARES', 'ANTECEDENTES PERSONALES NO PATOLÓGICOS', 'ANTECEDENTES PERSONALES PATOLÓGICOS', 'PADECIMIENTO ACTUAL', 'EXPLORACIÓN FÍSICA', 'IMPRESIÓN DIAGNÓSTICA', 'PLAN'],
    promptPresetId: 'hp_completa',
    customPrompt: '',
    webhookFolderKey: 'consulta_general'
  },
  {
    id: 'nota_rapida',
    name: 'Nota Rápida',
    description: 'Nota continua y fluida sin subdivisiones ni formato estricto, ideal para seguimiento rápido.',
    sections: ['NOTA CLÍNICA'],
    promptPresetId: 'nota_rapida',
    customPrompt: '',
    webhookFolderKey: 'nota_rapida'
  },
  {
    id: 'pediatria_std',
    name: 'Pediatría',
    description: 'Enfoque en desarrollo infantil, antecedentes de vacunación y somatometría (peso/talla).',
    sections: ['ANTECEDENTES PERINATALES', 'SOMATOMETRÍA', 'PADECIMIENTO ACTUAL', 'EXPLORACIÓN FÍSICA', 'IMPRESIÓN DIAGNÓSTICA', 'PLAN'],
    promptPresetId: 'pediatria',
    customPrompt: '',
    webhookFolderKey: 'modo_pediatria'
  },
  {
    id: 'psicologia_std',
    name: 'Psicología',
    description: 'Análisis psicológico detallado incluyendo examen mental, afecto, discurso y plan terapéutico.',
    sections: ['MOTIVO DE CONSULTA', 'EXAMEN MENTAL', 'HISTORIA PERSONAL', 'IMPRESIÓN DIAGNÓSTICA', 'PLAN TERAPÉUTICO'],
    promptPresetId: 'psicologia',
    customPrompt: '',
    webhookFolderKey: 'modo_psicologia'
  }
];

const INITIAL_MODES: IntelligenceMode[] = [
  { 
    id: '1', 
    name: 'Consulta General', 
    formatId: 'hp_completa', 
    formatName: 'Historia Clínica H&P', 
    color: '#1B4F9B', 
    isActive: true,
    webhookFolderKey: 'consulta_general',
    promptPresetId: 'hp_completa',
    customPrompt: 'Estructura médica H&P detallada organizando antecedentes heredofamiliares, patológicos, no patológicos, padecimiento actual, exploración física, impresión diagnóstica y plan.',
    sections: ['ANTECEDENTES HEREDOFAMILIARES', 'ANTECEDENTES PERSONALES NO PATOLÓGICOS', 'ANTECEDENTES PERSONALES PATOLÓGICOS', 'PADECIMIENTO ACTUAL', 'EXPLORACIÓN FÍSICA', 'IMPRESIÓN DIAGNÓSTICA', 'PLAN']
  },
  { 
    id: '2', 
    name: 'Pediatría', 
    formatId: 'pediatria_std', 
    formatName: 'Expediente Pediátrico', 
    color: '#E8820C', 
    isActive: true,
    webhookFolderKey: 'modo_pediatria',
    promptPresetId: 'pediatria',
    customPrompt: 'Enfoque en desarrollo infantil, antecedentes de vacunación, somatometría (peso/talla) y dosis exactas por kg de peso.',
    sections: ['ANTECEDENTES PERINATALES', 'SOMATOMETRÍA', 'PADECIMIENTO ACTUAL', 'EXPLORACIÓN FÍSICA', 'IMPRESIÓN DIAGNÓSTICA', 'PLAN']
  },
  { 
    id: '3', 
    name: 'Psicología', 
    formatId: 'psicologia_std', 
    formatName: 'Nota Psicológica', 
    color: '#8B5CF6', 
    isActive: true,
    webhookFolderKey: 'modo_psicologia',
    promptPresetId: 'psicologia',
    customPrompt: 'Análisis psicológico detallado incluyendo estado mental, evaluación cognitiva, diagnóstico DSM-5 y plan terapéutico.',
    sections: ['MOTIVO DE CONSULTA', 'EXAMEN MENTAL', 'HISTORIA PERSONAL', 'IMPRESIÓN DIAGNÓSTICA DSM-5', 'PLAN TERAPÉUTICO']
  },
];

interface ProfileContextType {
  profile: ProfileType;
  toggleProfile: () => void;
  primaryColor: string;
  doctorName: string;
  setDoctorName: (name: string) => Promise<void>;
  doctorCedula: string;
  setDoctorCedula: (cedula: string) => Promise<void>;
  doctorUniversity: string;
  setDoctorUniversity: (uni: string) => Promise<void>;
  doctorAddress: string;
  setDoctorAddress: (address: string) => Promise<void>;
  profileImage: string | null;
  setProfileImage: (uri: string | null) => Promise<void>;
  dashboardProfileId: string;
  setDashboardProfileId: (id: string) => void;
  recordsProfileId: string;
  setRecordsProfileId: (id: string) => void;
  userId: string | null;
  intelligenceModes: IntelligenceMode[];
  updateIntelligenceMode: (id: string, updates: Partial<IntelligenceMode>) => void;
  deleteIntelligenceMode: (id: string) => void;
  addIntelligenceMode: (mode: Omit<IntelligenceMode, 'id'>) => void;
  notes: Record<string, ClinicalNote[]>;
  confirmNote: (profileId: string, noteId: string, signature?: string[]) => Promise<void>;
  addNote: (profileId: string, note: ClinicalNote) => Promise<void>;
  deleteNote: (profileId: string, noteId: string) => Promise<void>;
  deleteMultipleNotes: (profileId: string, noteIds: string[]) => Promise<void>;
  updateNoteContent: (profileId: string, noteId: string, content: string, name?: string) => Promise<void>;
  updatePatientName: (profileId: string, oldName: string, newName: string) => Promise<void>;
  syncWithCloud: () => Promise<void>;
  isSyncing: boolean;
  appSettings: AppSettings;
  updateSettings: (category: keyof AppSettings, key: string, value: any) => void;
  notificationsList: AppNotification[];
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id'>) => void;
  savedSignature: string[] | null;
  setSavedSignature: (sig: string[] | null) => void;
  resetProfile: () => void;
  logout: () => Promise<void>;
}

const STORAGE_KEY = '@Klino_USER_PROFILE';

const INITIAL_NOTES: Record<string, ClinicalNote[]> = {};

const INITIAL_SETTINGS: AppSettings = {
  notifications: {
    hardware: true,
    patients: true,
    soap: true,
    security: true,
  },
  security: {
    biometrics: true,
  },
  appearance: {
    glassmorphism: false,
    dictationButtonOrientation: 'vertical',
  }
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider = ({ children }: { children: ReactNode }) => {
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState<ProfileType>('General');
  const [doctorName, setDoctorNameState] = useState('');
  const [doctorCedula, setDoctorCedulaState] = useState('');
  const [doctorUniversity, setDoctorUniversityState] = useState('');
  const [doctorAddress, setDoctorAddressState] = useState('');
  const [profileImage, setProfileImageState] = useState<string | null>(null);
  const [dashboardProfileId, setDashboardProfileIdState] = useState('1');
  const [recordsProfileId, setRecordsProfileIdState] = useState('1');
  const [userId, setUserId] = useState<string | null>(null);
  const [intelligenceModes, setIntelligenceModes] = useState<IntelligenceMode[]>(INITIAL_MODES);
  const [notes, setNotes] = useState<Record<string, ClinicalNote[]>>(INITIAL_NOTES);
  const [appSettings, setAppSettings] = useState<AppSettings>(INITIAL_SETTINGS);
  const [notificationsList, setNotificationsList] = useState<AppNotification[]>([]);
  const [savedSignature, setSavedSignature] = useState<string[] | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const syncWithCloud = async () => {
    if (isSyncing) return;
    try {
      setIsSyncing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: profileData } = await supabase.from('doctors').select('full_name, specialty, clinic_name').eq('id', user.id).maybeSingle();
      if (profileData) {
        if (profileData.full_name) setDoctorNameState(profileData.full_name);
        if (profileData.clinic_name) setProfileImageState(profileData.clinic_name);
      } else {
        console.log("--- [DEBUG] Doctor no encontrado en 'doctors' durante syncWithCloud. Creando registro...");
        const userEmail = user.email || 'doctor@klino.med';
        const defaultName = userEmail.split('@')[0] || 'Dr. Klino';
        await supabase.from('doctors').upsert({
          id: user.id,
          full_name: defaultName,
          email: userEmail,
          whatsapp_number: `pending_${user.id.substring(0, 8)}`,
          pin_hash: '0000',
          specialty: 'Medicina General',
          subscription_tier: 'trial',
          subscription_status: 'active'
        }, { onConflict: 'id' });
      }

      const { data: dbRecords, error } = await supabase
        .from('clinical_records')
        .select('*, patients(full_name)')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });

      if (dbRecords && !error) {
        setNotes(prev => {
          const syncedNotes = { ...prev };
          dbRecords.forEach(record => {
            // Formatear soap_note_text si es JSON crudo
            let formattedTranscription = '';
            let formattedVitals: any = undefined;
            let dbPatientName = record.patients ? record.patients.full_name : record.patient_name;
            let formattedPatientName = dbPatientName || 'Paciente Sin Nombre';

            const soapSource = record.soap_note_text || record.soap_note || '';
            if (soapSource && typeof soapSource === 'string' && soapSource.trim()) {
              const parsed = formatClinicalJson(soapSource);
              formattedTranscription = parsed.transcription;
              formattedVitals = parsed.vitals || record.vitals_data;
              if (parsed.paciente && parsed.paciente !== 'Paciente Nuevo') {
                formattedPatientName = parsed.paciente;
              }
            } else {
              formattedTranscription = soapSource;
              formattedVitals = record.vitals_data;
            }

            let resolvedSpecialty = record.specialty || 'General';
            if (record.folder_id === 'nota_rapida') {
              resolvedSpecialty = 'Nota rápida';
            }

            const note: ClinicalNote = {
              id: record.id,
              patientId: record.patient_id,
              name: formattedPatientName,
              specialty: resolvedSpecialty,
              status: record.status as any,
              statusText: record.status === 'pending' ? 'PENDIENTE' : (record.status === 'completed' ? 'NOTA GENERADA' : 'REVISADO'),
              time: new Date(record.created_at).getTime(),
              transcription: formattedTranscription,
              rawTranscription: record.raw_transcription || '',
              specialtyColor: record.specialty === 'Cirugía' ? '#2A7D6F' : (record.specialty === 'Pediatría' ? '#1E5FAD' : '#1B4F9B'),
              signature: record.signature_data,
              vitals: formattedVitals
            };
            // Mapear folder_id correctamente: puede ser ID numérico ('1','2','3') o webhookFolderKey ('consulta_general','modo_pediatria')
            let pId = record.folder_id || '1';
            // Si el folder_id es un webhookFolderKey, mapearlo al ID numérico correcto
            const folderKeyMap: Record<string, string> = {
              'consulta_general': '1',
              'modo_pediatria': '2',
              'modo_psicologia': '3',
              'nota_rapida': '1',
            };
            if (folderKeyMap[pId]) {
              pId = folderKeyMap[pId];
            }
            if (!syncedNotes[pId]) syncedNotes[pId] = [];

            // Buscar si ya existe localmente esta nota (por ID) en CUALQUIER perfil
            let existingIdx = syncedNotes[pId].findIndex(n => n.id === note.id);
            let existingPId = pId;
            if (existingIdx === -1) {
              // Buscar en todos los perfiles por si el folder_id difiere
              for (const [otherPId, otherNotes] of Object.entries(syncedNotes)) {
                const idx = (otherNotes as any[]).findIndex((n: any) => n.id === note.id);
                if (idx !== -1) {
                  existingIdx = idx;
                  existingPId = otherPId;
                  break;
                }
              }
            }

            if (existingIdx !== -1) {
              // Si la nota ya existe, PRESERVAR el nombre local para no crear duplicados
              const localName = (syncedNotes[existingPId] as any[])[existingIdx].name;
              note.name = localName;
              (syncedNotes[existingPId] as any[])[existingIdx] = note;
            } else {
              // Nota nueva de Supabase: buscar si hay un paciente local con nombre similar
              // para agrupar correctamente (evitar "Fernando Salas" vs "Fernando Salas García")
              const allLocalNames = Object.values(syncedNotes).flat().map((n: any) => (n.name || '').trim());
              const matchedName = allLocalNames.find(
                localName => localName.toLowerCase() === formattedPatientName.trim().toLowerCase()
                  || localName.toLowerCase().startsWith(formattedPatientName.trim().toLowerCase())
                  || formattedPatientName.trim().toLowerCase().startsWith(localName.toLowerCase())
              );
              if (matchedName) {
                note.name = matchedName;
              }
              syncedNotes[pId] = [note, ...syncedNotes[pId]];
            }
          });
          return syncedNotes;
        });
      }
    } catch (e) {
      console.error("Error en sincronización con la nube:", e);
    } finally {
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    const loadPersistedData = async () => {
      try {
        const savedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedData) {
          const parsed = JSON.parse(savedData);
          if (parsed.profile) setProfile(parsed.profile);
          if (parsed.doctorName) setDoctorNameState(parsed.doctorName);
          if (parsed.profileImage) setProfileImageState(parsed.profileImage);
          if (parsed.dashboardProfileId) setDashboardProfileIdState(parsed.dashboardProfileId);
          if (parsed.recordsProfileId) setRecordsProfileIdState(parsed.recordsProfileId);
          if (parsed.intelligenceModes) setIntelligenceModes(parsed.intelligenceModes);
          if (parsed.appSettings) setAppSettings(parsed.appSettings);
          if (parsed.notificationsList) setNotificationsList(parsed.notificationsList);
          if (parsed.savedSignature) setSavedSignature(parsed.savedSignature);
          if (parsed.notes) {
            // Inicializar vacío si no existe
            if (!parsed.notes['1']) {
              parsed.notes['1'] = [];
            }
            setNotes(parsed.notes);
          }
        }
        await syncWithCloud();
      } catch (e) {
        console.error("Error cargando persistencia Klino", e);
      } finally {
        setIsReady(true);
      }
    };
    loadPersistedData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Check if user just logged out — ignore any stale session events
      const loggedOut = await AsyncStorage.getItem('@Klino_LoggedOut');
      if (loggedOut === 'true') {
        setUserId(null);
        return;
      }

      if (session?.user) {
        setUserId(session.user.id);
        if (_event === 'SIGNED_IN' || _event === 'INITIAL_SESSION') {
          console.log(`--- [DEBUG] Auth event ${_event} - calling syncWithCloud`);
          syncWithCloud();
        }
      } else {
        setUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Supabase Realtime Subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase.channel('custom-all-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'clinical_records', filter: `doctor_id=eq.${userId}` },
        (payload) => {
          console.log('Realtime change received!', payload);
          // Si cambia a completed u ocurre un update/insert importante, recargamos
          syncWithCloud();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  useEffect(() => {
    if (isReady) {
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({
        profile, doctorName, profileImage, dashboardProfileId,
        recordsProfileId, intelligenceModes, notes, appSettings,
        notificationsList, savedSignature
      })).catch(e => console.error("Error guardando persistencia", e));
    }
  }, [isReady, profile, doctorName, profileImage, dashboardProfileId, recordsProfileId, intelligenceModes, notes, appSettings, notificationsList, savedSignature]);

  const setDoctorName = async (name: string) => {
    setDoctorNameState(name);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from('doctors').update({ full_name: name }).eq('id', user.id);
    } catch (e) { console.error("Error BD Nombre:", e); }
  };

  const setProfileImage = async (uri: string | null) => {
    setProfileImageState(uri);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) await supabase.from('doctors').update({ clinic_name: uri }).eq('id', user.id);
    } catch (e) { console.error("Error BD Imagen:", e); }
  };

  const addNote = async (profileId: string, note: ClinicalNote) => {
    setNotes(prev => ({ ...prev, [profileId]: [note, ...(prev[profileId] || [])] }));
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        let currentPatientId = note.patientId;
        
        // Si no viene con patientId, buscar o crear al paciente por nombre
        if (!currentPatientId && note.name) {
          const cleanName = note.name.trim();
          const { data: existingPatient } = await supabase
            .from('patients')
            .select('id')
            .eq('doctor_id', user.id)
            .ilike('full_name', cleanName)
            .maybeSingle();

          if (existingPatient) {
            currentPatientId = existingPatient.id;
          } else {
            // Crear paciente nuevo
            const { data: newPatient } = await supabase
              .from('patients')
              .insert({ doctor_id: user.id, full_name: cleanName })
              .select('id')
              .single();
            if (newPatient) currentPatientId = newPatient.id;
          }
        }

        // Add the patientId to local state
        if (currentPatientId) {
          setNotes(prev => ({
            ...prev,
            [profileId]: (prev[profileId] || []).map(n => n.id === note.id ? { ...n, patientId: currentPatientId } : n)
          }));
        }

        const { data: insertedData, error } = await supabase.from('clinical_records').insert({
          doctor_id: user.id, 
          patient_id: currentPatientId || null,
          patient_name: note.name, // Por retrocompatibilidad
          specialty: note.specialty, 
          status: 'pending',
          raw_transcription: note.rawTranscription || '',
          soap_note_text: note.transcription || '',
          folder_id: profileId,
          vitals_data: note.vitals, 
          created_at: new Date(note.time).toISOString()
        }).select().single();

        if (!error && insertedData) {
          setNotes(prev => ({
            ...prev,
            [profileId]: (prev[profileId] || []).map(n => n.id === note.id ? { ...n, id: insertedData.id } : n)
          }));
        }
      }
    } catch (e) { console.error("Error guardando nota en Supabase", e); }

    // Generar notificación al agregar nota
    if (appSettings.notifications.patients) {
      const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const tipoNota = note.specialty || 'Nota General';
      
      let extraInfo = '';
      if (note.clinicalData?.impresion_diagnostica) {
        extraInfo = `Diagnóstico: ${note.clinicalData.impresion_diagnostica}`;
      } else if (note.vitals?.peso) {
        extraInfo = `Peso: ${note.vitals.peso}kg, Temp: ${note.vitals.temp}°C`;
      }

      addNotification({
        title: `Nueva ${tipoNota} - ${hora}`,
        description: `Paciente: ${note.name || 'Paciente Nuevo'}`,
        time: new Date().toISOString(),
        type: 'patient',
        icon: 'FileText',
        color: profile === 'General' ? '#1B4F9B' : '#2A7D6F',
        unread: true,
        message: extraInfo || 'Lista para revisión y firma.'
      });
    }
  };

  const confirmNote = async (profileId: string, noteId: string, signature?: string[]) => {
    setNotes(prev => ({
      ...prev,
      [profileId]: (prev[profileId] || []).map(n => n.id === noteId ? { ...n, status: 'reviewed', statusText: 'REVISADO', signature: signature || n.signature } : n)
    }));
    try {
      await supabase.from('clinical_records').update({ status: 'reviewed', signature_data: signature }).eq('id', noteId);
    } catch (e) { console.error("Error confirmando en Supabase", e); }
  };

  const deleteNote = async (profileId: string, noteId: string) => {
    setNotes(prev => ({ ...prev, [profileId]: (prev[profileId] || []).filter(n => n.id !== noteId) }));
    try {
      await supabase.from('clinical_records').delete().eq('id', noteId);
    } catch (e) { console.error("Error borrando en Supabase", e); }
  };

  const deleteMultipleNotes = async (profileId: string, noteIds: string[]) => {
    const idsSet = new Set(noteIds);
    setNotes(prev => ({ ...prev, [profileId]: (prev[profileId] || []).filter(n => !idsSet.has(n.id)) }));
    try {
      await supabase.from('clinical_records').delete().in('id', noteIds);
    } catch (e) { console.error("Error borrando grupo de notas en Supabase", e); }
  };

  const updateNoteContent = async (profileId: string, noteId: string, content: string, name?: string) => {
    setNotes(prev => ({
      ...prev,
      [profileId]: (prev[profileId] || []).map(n => n.id === noteId ? { ...n, transcription: content, ...(name ? { name } : {}) } : n)
    }));
    try {
      const updates: any = { soap_note_text: content };
      if (name) updates.patient_name = name;
      await supabase.from('clinical_records').update(updates).eq('id', noteId);
    } catch (e) { console.error("Error actualizando en Supabase", e); }
  };

  const updateNoteVitals = async (profileId: string, noteId: string, vitals: any) => {
    setNotes(prev => ({
      ...prev,
      [profileId]: (prev[profileId] || []).map(n => n.id === noteId ? { ...n, vitals } : n)
    }));
    try {
      await supabase.from('clinical_records').update({ vitals_data: vitals }).eq('id', noteId);
    } catch (e) { console.error("Error actualizando vitals en Supabase", e); }
  };

  const updatePatientName = async (profileId: string, oldName: string, newName: string) => {
    setNotes(prev => {
      const newNotes = { ...prev };
      for (const pId in newNotes) {
        newNotes[pId] = newNotes[pId].map(n => n.name === oldName ? { ...n, name: newName } : n);
      }
      return newNotes;
    });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: patients } = await supabase.from('patients').select('id').eq('doctor_id', user.id).ilike('full_name', oldName);
      if (patients && patients.length > 0) {
        for (const p of patients) {
          await supabase.from('patients').update({ full_name: newName }).eq('id', p.id);
        }
      }
      
      await supabase.from('clinical_records').update({ patient_name: newName }).eq('patient_name', oldName);
    } catch (e) { console.error("Error actualizando nombre de paciente en Supabase", e); }
  };

  const updateIntelligenceMode = (id: string, updates: Partial<IntelligenceMode>) => setIntelligenceModes(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const deleteIntelligenceMode = (id: string) => setIntelligenceModes(prev => prev.filter(m => m.id !== id));
  const addIntelligenceMode = (mode: Omit<IntelligenceMode, 'id'>) => setIntelligenceModes(prev => [...prev, { id: Date.now().toString(), ...mode }]);
  const toggleProfile = () => setProfile(prev => prev === 'General' ? 'Especialista' : 'General');
  const setDashboardProfileId = (id: string) => setDashboardProfileIdState(id);
  const setRecordsProfileId = (id: string) => setRecordsProfileIdState(id);
  const updateSettings = (category: keyof AppSettings, key: string, value: any) => setAppSettings(prev => ({ ...prev, [category]: { ...prev[category], [key]: value } }));
  const markNotificationRead = (id: string) => setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const deleteNotification = (id: string) => setNotificationsList(prev => prev.filter(n => n.id !== id));
  const clearAllNotifications = () => setNotificationsList([]);
  const addNotification = (notification: Omit<AppNotification, 'id'>) => setNotificationsList(prev => [{ id: Date.now().toString(), ...notification }, ...prev]);

  const setDoctorAddress = async (address: string) => setDoctorAddressState(address);
  const setDoctorCedula = async (cedula: string) => setDoctorCedulaState(cedula);
  const setDoctorUniversity = async (uni: string) => setDoctorUniversityState(uni);

  const resetProfile = () => {
    setProfile('General');
    setDoctorNameState('');
    setDoctorCedulaState('');
    setDoctorUniversityState('');
    setDoctorAddressState('');
    setProfileImageState(null);
    setDashboardProfileIdState('1');
    setRecordsProfileIdState('1');
    setUserId(null);
    setIntelligenceModes(INITIAL_MODES);
    setNotes(INITIAL_NOTES);
    setAppSettings(INITIAL_SETTINGS);
    setNotificationsList([]);
    setSavedSignature(null);
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (e) {
      console.error('Error supabase signout:', e);
    }
    
    try {
      await AsyncStorage.setItem('@Klino_LoggedOut', 'true');
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem('@Klino_Appointments');
      const allKeys = await AsyncStorage.getAllKeys();
      const supabaseKeys = allKeys.filter(k => k.includes('supabase'));
      if (supabaseKeys.length > 0) {
        await AsyncStorage.multiRemove(supabaseKeys);
      }
    } catch (e) {
      console.error('Error cleaning storage:', e);
    }

    resetProfile();
  };

  const primaryColor = profile === 'General' ? '#1B4F9B' : '#2A7D6F';

  return (
    <ProfileContext.Provider value={{
      profile, toggleProfile, primaryColor, doctorName, setDoctorName,
      doctorCedula, setDoctorCedula, doctorUniversity, setDoctorUniversity,
      doctorAddress, setDoctorAddress,
      profileImage, setProfileImage, userId, dashboardProfileId, setDashboardProfileId,
      recordsProfileId, setRecordsProfileId, intelligenceModes, updateIntelligenceMode,
      deleteIntelligenceMode, addIntelligenceMode, notes, confirmNote, addNote,
      deleteNote, deleteMultipleNotes, updateNoteContent, updateNoteVitals, updatePatientName, syncWithCloud, isSyncing, appSettings,
      updateSettings, notificationsList, markNotificationRead, deleteNotification,
      clearAllNotifications, addNotification, savedSignature, setSavedSignature,
      resetProfile, logout
    }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) throw new Error('useProfile debe usarse dentro de un ProfileProvider');
  return context;
};
