import React from 'react';
import { Modal, View, TouchableWithoutFeedback, StyleSheet, TouchableOpacity } from 'react-native';
import { FileText, ClipboardList, Pill, Brain, X } from 'lucide-react-native';
import { KLINO_COLORS } from '../../constants/theme';
import { KlinoText } from '../common/KlinoText';

import { useRouter } from 'expo-router';

interface Props {
  visible: boolean;
  onClose: () => void;
  patientName?: string;
}

export const DictationTypeModal: React.FC<Props> = ({ visible, onClose, patientName }) => {
  const router = useRouter();

  const handleSelect = (folder: string) => {
    onClose();
    if (patientName) {
      router.push({ pathname: '/live-consultation', params: { folder, patientName } });
    } else {
      router.push({ pathname: '/live-consultation', params: { folder } });
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.header}>
                <KlinoText variant="h3">¿Qué vas a dictar?</KlinoText>
                <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                  <X size={24} color={KLINO_COLORS.tinta} strokeWidth={1.75} />
                </TouchableOpacity>
              </View>
              <KlinoText variant="small" color={KLINO_COLORS.gris} style={styles.description}>
                Con esto Klino sabe cómo interpretar lo que digas.
              </KlinoText>

              <View style={styles.optionsList}>
                <DictationOption 
                  icon={<FileText size={20} color={KLINO_COLORS.verde} strokeWidth={1.75} />}
                  title="Historia clínica"
                  description="Primera vez o expediente completo. Interrogatorio, antecedentes y exploración."
                  onPress={() => handleSelect('consulta_general')}
                />
                <DictationOption 
                  icon={<ClipboardList size={20} color={KLINO_COLORS.verde} strokeWidth={1.75} />}
                  title="Nota rápida / Evolución"
                  description="Seguimiento continuo o nota rápida sobre un expediente existente."
                  onPress={() => handleSelect('nota_rapida')}
                />
                <DictationOption 
                  icon={<Pill size={20} color={KLINO_COLORS.verde} strokeWidth={1.75} />}
                  title="Modo Pediatría"
                  description="Ajustado para pacientes pediátricos, desarrollo y dosis ponderal."
                  onPress={() => handleSelect('modo_pediatria')}
                />
                <DictationOption 
                  icon={<Brain size={20} color={KLINO_COLORS.verde} strokeWidth={1.75} />}
                  title="Salud Mental / Psicología"
                  description="Examen del estado mental, red de apoyo e hipótesis diagnóstica."
                  onPress={() => handleSelect('modo_psicologia')}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const DictationOption = ({ icon, title, description, onPress }: any) => (
  <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.optionBtn}>
    <View style={styles.optionIcon}>{icon}</View>
    <View style={styles.optionText}>
      <KlinoText variant="body" style={{ fontWeight: 'bold' }}>{title}</KlinoText>
      <KlinoText variant="small" color={KLINO_COLORS.gris}>{description}</KlinoText>
    </View>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(22, 25, 27, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: KLINO_COLORS.papel,
    width: '90%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: KLINO_COLORS.borderStrong,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeBtn: {
    padding: 4,
  },
  description: {
    marginTop: 8,
    marginBottom: 24,
  },
  optionsList: {
    gap: 16,
  },
  optionBtn: {
    flexDirection: 'row',
    padding: 16,
    borderWidth: 1,
    borderColor: KLINO_COLORS.borderHairline,
    backgroundColor: KLINO_COLORS.papelHondo,
  },
  optionIcon: {
    marginRight: 16,
    marginTop: 2,
  },
  optionText: {
    flex: 1,
  }
});
