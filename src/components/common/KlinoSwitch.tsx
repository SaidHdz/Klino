import React, { useEffect } from 'react';
import { TouchableOpacity, Animated, View } from 'react-native';
import { KLINO_COLORS } from '../../constants/theme';

interface KlinoSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
}

export const KlinoSwitch: React.FC<KlinoSwitchProps> = ({ value, onValueChange }) => {
  const animatedValue = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  }, [value]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [KLINO_COLORS.papelHondo, KLINO_COLORS.verde],
  });

  const borderColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [KLINO_COLORS.borderStrong, 'transparent'],
  });

  const thumbColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [KLINO_COLORS.gris, KLINO_COLORS.papel],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => onValueChange(!value)}
    >
      <Animated.View
        style={{
          width: 52,
          height: 32,
          backgroundColor,
          borderWidth: 1,
          borderColor,
          justifyContent: 'center',
          paddingHorizontal: 4,
        }}
      >
        <Animated.View
          style={{
            width: 22,
            height: 22,
            backgroundColor: thumbColor,
            transform: [{ translateX }],
          }}
        />
      </Animated.View>
    </TouchableOpacity>
  );
};
