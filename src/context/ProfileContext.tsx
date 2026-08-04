import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { supabase } from '../utils/supabase';

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
}

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
  updateNoteContent: (profileId: string, noteId: string, content: string) => Promise<void>;
  syncWithCloud: () => Promise<void>;
  isSyncing: boolean;
  appSettings: AppSettings;
  updateSettings: (category: keyof AppSettings, key: string, value: boolean) => void;
  notificationsList: AppNotification[];
  markNotificationRead: (id: string) => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addNotification: (notification: Omit<AppNotification, 'id'>) => void;
  savedSignature: string[] | null;
  setSavedSignature: (sig: string[] | null) => void;
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
  }
};

const INITIAL_MODES: IntelligenceMode[] = [
  { id: '1', name: 'Medicina General', formatId: 'soap_std', formatName: 'SOAP Estándar', color: '#1B4F9B', isActive: true },
  { id: '2', name: 'Cirugía', formatId: 'pre_op', formatName: 'Protocolo Pre-Op', color: '#2A7D6F', isActive: true },
  { id: '3', name: 'Pediatría', formatId: 'ped_hist', formatName: 'Historial Evolutivo', color: '#1E5FAD', isActive: true },
];

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

      const { data: profileData } = await supabase.from('doctors').select('full_name, specialty, clinic_name').eq('id', user.id).single();
      if (profileData) {
        if (profileData.full_name) setDoctorNameState(profileData.full_name);
        if (profileData.clinic_name) setProfileImageState(profileData.clinic_name);
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
            const note: ClinicalNote = {
              id: record.id,
              name: record.patient_name || 'Paciente Sin Nombre',
              specialty: record.specialty || 'General',
              status: record.status as any,
              statusText: record.status === 'pending' ? 'PENDIENTE' : (record.status === 'completed' ? 'NOTA GENERADA' : 'REVISADO'),
              time: new Date(record.created_at).getTime(),
              transcription: record.soap_note_text || '',
              rawTranscription: record.raw_transcription || '',
              specialtyColor: record.specialty === 'Cirugía' ? '#2A7D6F' : (record.specialty === 'Pediatría' ? '#1E5FAD' : '#1B4F9B'),
              signature: record.signature_data,
              vitals: record.vitals_data
            };
            const pId = record.folder_id || '1';
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

  const updateNoteContent = async (profileId: string, noteId: string, content: string) => {
    setNotes(prev => ({
      ...prev,
      [profileId]: (prev[profileId] || []).map(n => n.id === noteId ? { ...n, transcription: content } : n)
    }));
    try {
      await supabase.from('clinical_records').update({ soap_note_text: content }).eq('id', noteId);
    } catch (e) { console.error("Error actualizando en Supabase", e); }
  };

  const updateIntelligenceMode = (id: string, updates: Partial<IntelligenceMode>) => setIntelligenceModes(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  const deleteIntelligenceMode = (id: string) => setIntelligenceModes(prev => prev.filter(m => m.id !== id));
  const addIntelligenceMode = (mode: Omit<IntelligenceMode, 'id'>) => setIntelligenceModes(prev => [...prev, { id: Date.now().toString(), ...mode }]);
  const toggleProfile = () => setProfile(prev => prev === 'General' ? 'Especialista' : 'General');
  const setDashboardProfileId = (id: string) => setDashboardProfileIdState(id);
  const setRecordsProfileId = (id: string) => setRecordsProfileIdState(id);
  const updateSettings = (category: keyof AppSettings, key: string, value: boolean) => setAppSettings(prev => ({ ...prev, [category]: { ...prev[category], [key]: value } }));
  const markNotificationRead = (id: string) => setNotificationsList(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  const deleteNotification = (id: string) => setNotificationsList(prev => prev.filter(n => n.id !== id));
  const clearAllNotifications = () => setNotificationsList([]);
  const addNotification = (notification: Omit<AppNotification, 'id'>) => setNotificationsList(prev => [{ id: Date.now().toString(), ...notification }, ...prev]);

  const setDoctorAddress = async (address: string) => setDoctorAddressState(address);
  const setDoctorCedula = async (cedula: string) => setDoctorCedulaState(cedula);
  const setDoctorUniversity = async (uni: string) => setDoctorUniversityState(uni);

  const primaryColor = profile === 'General' ? '#1B4F9B' : '#2A7D6F';

  return (
    <ProfileContext.Provider value={{
      profile, toggleProfile, primaryColor, doctorName, setDoctorName,
      doctorCedula, setDoctorCedula, doctorUniversity, setDoctorUniversity,
      doctorAddress, setDoctorAddress,
      profileImage, setProfileImage, userId, dashboardProfileId, setDashboardProfileId,
      recordsProfileId, setRecordsProfileId, intelligenceModes, updateIntelligenceMode,
      deleteIntelligenceMode, addIntelligenceMode, notes, confirmNote, addNote,
      deleteNote, updateNoteContent, syncWithCloud, isSyncing, appSettings,
      updateSettings, notificationsList, markNotificationRead, deleteNotification,
      clearAllNotifications, addNotification, savedSignature, setSavedSignature
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
