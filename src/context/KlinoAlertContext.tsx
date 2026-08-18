import React, { createContext, useContext, useState, ReactNode } from 'react';
import { View, Modal, TouchableOpacity, StyleSheet } from 'react-native';
import { KLINO_COLORS } from '../constants/theme';
import { KlinoText } from '../components/common/KlinoText';

interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

interface AlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
}

interface KlinoAlertContextType {
  showAlert: (title: string, message?: string, buttons?: AlertButton[]) => void;
  hideAlert: () => void;
}

const KlinoAlertContext = createContext<KlinoAlertContextType | undefined>(undefined);

export const useKlinoAlert = () => {
  const context = useContext(KlinoAlertContext);
  if (!context) throw new Error('useKlinoAlert must be used within a KlinoAlertProvider');
  return context;
};

export const KlinoAlertProvider = ({ children }: { children: ReactNode }) => {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
  });

  const showAlert = (title: string, message?: string, buttons?: AlertButton[]) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons: buttons || [{ text: 'OK' }],
    });
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  return (
    <KlinoAlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Modal
        visible={alertState.visible}
        transparent
        animationType="fade"
        onRequestClose={hideAlert}
      >
        <View style={styles.overlay}>
          <View style={styles.alertBox}>
            <KlinoText variant="h3" color={KLINO_COLORS.tinta} style={styles.title}>
              {alertState.title}
            </KlinoText>
            
            {!!alertState.message && (
              <KlinoText variant="body" color={KLINO_COLORS.gris} style={styles.message}>
                {alertState.message}
              </KlinoText>
            )}

            <View style={styles.buttonContainer}>
              {alertState.buttons?.map((btn, index) => {
                const isDestructive = btn.style === 'destructive';
                const isCancel = btn.style === 'cancel';
                const textColor = isDestructive ? KLINO_COLORS.error : (isCancel ? KLINO_COLORS.gris : KLINO_COLORS.tinta);
                const borderColor = isDestructive ? KLINO_COLORS.error : (isCancel ? 'transparent' : KLINO_COLORS.borderStrong);
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.button, { borderColor }]}
                    onPress={() => {
                      hideAlert();
                      if (btn.onPress) btn.onPress();
                    }}
                  >
                    <KlinoText variant="label" color={textColor}>
                      {btn.text.toUpperCase()}
                    </KlinoText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </KlinoAlertContext.Provider>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertBox: {
    backgroundColor: KLINO_COLORS.papel,
    width: '100%',
    padding: 24,
    borderWidth: 1,
    borderColor: KLINO_COLORS.borderStrong,
    borderRadius: 0, // NO REDONDOS
  },
  title: {
    marginBottom: 8,
  },
  message: {
    marginBottom: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  }
});
