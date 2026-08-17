import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';
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

const INITIAL_NOTES: Record<string, ClinicalNote[]> = {
  '1': [
    {
      id: 'mock-said-1',
      name: 'Said Hernandez',
      specialty: 'Medicina General',
      status: 'pending',
      statusText: 'PENDIENTE',
      time: Date.now(),
      specialtyColor: '#1B4F9B',
      vitals: {
        ta: '120/80',
        fc: '75',
        fr: '16',
        temp: '36.5',
        sat: '98%',
        peso: '80',
        talla: '1.78',
        imc: '25.2'
      },
      transcription: "**ANTECEDENTES PERSONALES PATOLÓGICOS:**\nNiega enfermedades crónico degenerativas previas. Sin alergias conocidas. Traumatismos negados.\n\n**PADECIMIENTO ACTUAL:**\nPaciente masculino que acude por presentar cefalea de intensidad moderada a severa (7/10) de 3 días de evolución, localizada en región occipital, que cede parcialmente con analgésicos comunes.\n\n**EXPLORACIÓN FÍSICA:**\nPaciente consciente, orientado. Pupilas isocóricas normorreflécticas. Exploración neurológica sin alteraciones. Cuello sin rigidez.\n\n**IMPRESIÓN DIAGNÓSTICA:**\nCefalea tensional por estrés laboral.\n\n**PLAN:**\n1. Reposo relativo.\n2. Paracetamol 500mg cada 8 hrs por 3 días.\n3. Cita abierta a urgencias en caso de no presentar mejoría o agregar signos de alarma."
    },
    {
      id: 'mock-prueba-1',
      name: 'Paciente de Prueba',
      specialty: 'Medicina General',
      status: 'reviewed',
      statusText: 'FIRMADA',
      time: Date.now() - 86400000 * 3, // Hace 3 días
      specialtyColor: '#1F5F4B',
      vitals: {
        ta: '135/88',
        fc: '82',
        fr: '18',
        temp: '37.1',
        sat: '96%',
        peso: '88.5',
        talla: '1.72',
        imc: '29.9'
      },
      transcription: "**FICHA DE IDENTIFICACIÓN:**\nPaciente masculino de 58 años de edad, originario de Monterrey, empleado administrativo.\n\n**ANTECEDENTES HEREDOFAMILIARES:**\nPadre finado por complicaciones de Diabetes Mellitus tipo 2. Madre viva con hipertensión arterial en control.\n\n**ANTECEDENTES PERSONALES PATOLÓGICOS:**\nHipertensión arterial sistémica diagnosticada hace 5 años, en tratamiento con Losartán 50mg cada 24 horas. Niega alergias.\n\n**PADECIMIENTO ACTUAL:**\nAcude a consulta de seguimiento refiriendo malestar general y mareos ocasionales matutinos. Refiere falta de apego a dieta en el último mes.\n\n**EXPLORACIÓN FÍSICA:**\nPaciente consciente, alerta. Mucosas orales semi-hidratadas. Cardiopulmonar sin alteraciones. Abdomen globoso a expensas de panículo adiposo, blando, depresible, sin megalias. Extremidades sin edema, pulsos distales presentes.\n\n**IMPRESIÓN DIAGNÓSTICA:**\nHipertensión Arterial Sistémica descontrolada. Sobrepeso (IMC 29.9).\n\n**PLAN:**\n1. Continuar Losartán 50mg cada 24 hrs.\n2. Iniciar bitácora de presión arterial por 14 días.\n3. Restricción estricta de sodio en dieta.\n4. Cita de revaloración en 2 semanas con resultados de bitácora y Química Sanguínea de 6 elementos."
    },
    {
      id: 'mock-prueba-2',
      name: 'Paciente de Prueba',
      specialty: 'Medicina General',
      status: 'pending',
      statusText: 'PENDIENTE',
      time: Date.now(), // Hoy
      specialtyColor: '#1F5F4B',
      vitals: {
        ta: '128/82',
        fc: '74',
        peso: '87.0',
        imc: '29.4'
      },
      transcription: "**PADECIMIENTO ACTUAL:**\nAcude a revisión de bitácora de presión tras dos semanas de ajuste dietético. Refiere sentirse mucho mejor, niega cefaleas o mareos recientes. Trae bitácora con promedios matutinos de 125/80 mmHg.\n\n**EXPLORACIÓN FÍSICA:**\nPaciente con buen estado de hidratación, ruidos cardíacos rítmicos de buen tono e intensidad. Pulmones limpios. TA en consultorio 128/82 mmHg.\n\n**IMPRESIÓN DIAGNÓSTICA:**\nHipertensión Arterial Sistémica en adecuado control actual.\n\n**PLAN:**\n1. Mantener dosis actual de Losartán 50mg.\n2. Felicitar por apego a dieta y reducción de 1.5kg de peso.\n3. Cita abierta o en 3 meses para seguimiento rutinario."
    }
  ],
  '2': [],
  '3': [],
};

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
  const [doctorName, setDoctorNameState] = useState('Dr. Snupi');
  const [doctorCedula, setDoctorCedulaState] = useState('12345678');
  const [doctorUniversity, setDoctorUniversityState] = useState('Universidad Nacional Autónoma de México');
  const [doctorAddress, setDoctorAddressState] = useState('Av. Insurgentes Sur 123, CDMX');
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
        .select('*')
        .eq('doctor_id', user.id)
        .order('created_at', { ascending: false });

      if (dbRecords && !error) {
        setNotes(prev => {
          const syncedNotes = { ...prev };
          dbRecords.forEach(record => {
            // Formatear soap_note_text si es JSON crudo
            let formattedTranscription = '';
            let formattedVitals: any = undefined;
            let formattedPatientName = record.patient_name || 'Paciente Sin Nombre';

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

            const note: ClinicalNote = {
              id: record.id,
              name: formattedPatientName,
              specialty: record.specialty || 'General',
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
            const existingIdx = syncedNotes[pId].findIndex(n => n.id === note.id);
            if (existingIdx === -1) syncedNotes[pId] = [note, ...syncedNotes[pId]];
            else syncedNotes[pId][existingIdx] = note;
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
            // Forzar inyección de nota de prueba si está vacío
            if (!parsed.notes['1'] || parsed.notes['1'].length === 0) {
              parsed.notes['1'] = INITIAL_NOTES['1'];
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        console.log('--- [DEBUG Auth State] Usuario autenticado activo en Supabase:', session.user.id);
        setUserId(session.user.id);
        // Sincronizar notas de la nube al iniciar sesión (nuevo dispositivo o re-login)
        if (_event === 'SIGNED_IN') {
          console.log('--- [DEBUG Auth State] Evento SIGNED_IN detectado. Sincronizando notas...');
          syncWithCloud();
        }
      } else {
        console.log('--- [DEBUG Auth State] Sin sesión activa en Supabase');
        setUserId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
        const { data: insertedData, error } = await supabase.from('clinical_records').insert({
          doctor_id: user.id, 
          patient_name: note.name,
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

  const updatePatientName = async (profileId: string, oldName: string, newName: string) => {
    setNotes(prev => ({
      ...prev,
      [profileId]: (prev[profileId] || []).map(n => n.name === oldName ? { ...n, name: newName } : n)
    }));
    try {
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
    setDoctorNameState('Dr. Snupi');
    setDoctorCedulaState('12345678');
    setDoctorUniversityState('Universidad Nacional Autónoma de México');
    setDoctorAddressState('Av. Insurgentes Sur 123, CDMX');
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
      await supabase.auth.signOut();
      await AsyncStorage.removeItem(STORAGE_KEY);
      resetProfile();
      console.log('--- [DEBUG] Sesión cerrada y datos limpiados correctamente');
    } catch (e) {
      console.error('Error en logout:', e);
    }
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
      deleteNote, deleteMultipleNotes, updateNoteContent, updatePatientName, syncWithCloud, isSyncing, appSettings,
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
