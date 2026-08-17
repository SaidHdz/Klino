import React from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { KLINO_COLORS, KLINO_FONTS } from '../../constants/theme';
import { KlinoText } from './KlinoText';

interface KlinoInputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const KlinoInput: React.FC<KlinoInputProps> = ({
  label,
  error,
  style,
  ...props
}) => {
  return (
    <View className="w-full mb-4">
      {label && (
        <View className="mb-2">
          <KlinoText variant="label" color={KLINO_COLORS.tinta}>
            {label}
          </KlinoText>
        </View>
      )}
      <TextInput
        style={[
          {
            fontFamily: KLINO_FONTS.bodyRegular,
            fontSize: 17,
            color: KLINO_COLORS.tinta,
            backgroundColor: KLINO_COLORS.papel,
            borderWidth: 1,
            borderColor: error ? KLINO_COLORS.error : KLINO_COLORS.borderStrong,
            padding: 16,
            borderRadius: 0, // Strict rule: sharp corners only
          },
          style
        ]}
        placeholderTextColor={KLINO_COLORS.gris}
        {...props}
      />
      {error && (
        <View className="mt-1">
          <KlinoText variant="small" color={KLINO_COLORS.error}>
            {error}
          </KlinoText>
        </View>
      )}
    </View>
  );
};
