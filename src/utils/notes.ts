import { supabase } from './supabase';

export interface MedicalRecord {
  id: string;
  patient_name: string;
  specialty: string;
  status: 'Pendiente' | 'Nota Generada' | 'Revisado';
  created_at: string;
  content?: string;
  doctor_id: string;
}

export const notesService = {
  /**
   * Obtiene todos los expedientes del médico actual
   */
  async getRecords() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('medical_records')
      .select('*')
      .eq('doctor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching records:', error.message);
      return [];
    }

    return data as MedicalRecord[];
  },

  /**
   * Crea un nuevo expediente médico
   */
  async createRecord(patientName: string, specialty: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No hay sesión activa');

    const { data, error } = await supabase
      .from('medical_records')
      .insert([
        { 
          patient_name: patientName, 
          specialty: specialty, 
          status: 'Pendiente',
          doctor_id: user.id 
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data as MedicalRecord;
  },

  /**
   * Actualiza el contenido de una nota IA
   */
  async updateNoteContent(id: string, content: string) {
    const { error } = await supabase
      .from('medical_records')
      .update({ content: content, status: 'Nota Generada' })
      .eq('id', id);

    if (error) throw error;
  }
};
