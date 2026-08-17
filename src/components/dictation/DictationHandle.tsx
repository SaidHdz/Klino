import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Mic } from 'lucide-react-native';
import { KLINO_COLORS } from '../../constants/theme';
import { KlinoText } from '../common/KlinoText';
import { DictationTypeModal } from './DictationTypeModal';
import { useProfile } from '../../context/ProfileContext';

export const DictationHandle: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const { appSettings } = useProfile();
  const orientation = appSettings.appearance.dictationButtonOrientation || 'vertical';

  const isHorizontal = orientation === 'horizontal';

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => setModalVisible(true)}
        style={isHorizontal ? styles.handleHorizontal : styles.handleVertical}
      >
        <Mic size={isHorizontal ? 20 : 24} color={KLINO_COLORS.papel} strokeWidth={isHorizontal ? 2 : 1.75} style={isHorizontal ? { marginRight: 8 } : undefined} />
        
        {isHorizontal ? (
          <KlinoText variant="label" color={KLINO_COLORS.papel}>
            DICTAR CONSULTA
          </KlinoText>
        ) : (
          <View style={styles.verticalTextContainer}>
             <KlinoText variant="label" color={KLINO_COLORS.papel} style={styles.verticalText}>
               DICTAR
             </KlinoText>
          </View>
        )}
      </TouchableOpacity>

      <DictationTypeModal 
        visible={modalVisible} 
        onClose={() => setModalVisible(false)} 
      />
    </>
  );
};

const styles = StyleSheet.create({
  handleHorizontal: {
    position: 'absolute',
    left: 24,
    right: 24,
    bottom: 80, // A ras de la navbar (la navbar mide aprox 65)
    height: 56,
    backgroundColor: KLINO_COLORS.verde,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  handleVertical: {
    position: 'absolute',
    right: 0,
    bottom: 80, 
    width: 48,
    height: 120,
    backgroundColor: KLINO_COLORS.verde,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  verticalTextContainer: {
    marginTop: 24,
    transform: [{ rotate: '-90deg' }],
  },
  verticalText: {
    width: 80,
    textAlign: 'center',
  }
});
