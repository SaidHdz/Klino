import React from 'react';
import { TouchableOpacity, ActivityIndicator, TouchableOpacityProps, View } from 'react-native';
import { KLINO_COLORS } from '../../constants/theme';
import { KlinoText } from './KlinoText';

interface KlinoButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'destructive' | 'ghost';
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const KlinoButton: React.FC<KlinoButtonProps> = ({
  title,
  variant = 'primary',
  loading = false,
  fullWidth = false,
  icon,
  style,
  disabled,
  ...props
}) => {
  // Determine background color based on brand guidelines
  const getBackgroundColor = () => {
    if (disabled) return KLINO_COLORS.gris;
    switch (variant) {
      case 'primary': return KLINO_COLORS.verde;
      case 'secondary': return KLINO_COLORS.papelHondo;
      case 'accent': return KLINO_COLORS.ambar;
      case 'destructive': return KLINO_COLORS.error;
      case 'ghost': return 'transparent';
      default: return KLINO_COLORS.verde;
    }
  };

  // Determine text color based on WCAG contrast rules
  const getTextColor = () => {
    if (disabled) return KLINO_COLORS.papelHondo;
    if (variant === 'secondary' || variant === 'ghost') return KLINO_COLORS.tinta;
    if (variant === 'accent') return KLINO_COLORS.papel;
    return KLINO_COLORS.papel;
  };

  const hasBorder = variant === 'secondary' || variant === 'ghost';

  return (
    <TouchableOpacity
      disabled={disabled || loading}
      activeOpacity={0.8}
      className={`
        flex-row items-center justify-center py-4 px-6
        ${fullWidth ? 'w-full' : 'self-start'}
      `}
      style={[
        {
          backgroundColor: getBackgroundColor(),
          borderWidth: hasBorder ? 1 : 0,
          borderColor: hasBorder ? KLINO_COLORS.borderStrong : 'transparent',
          borderRadius: 0, // Strict rule: sharp corners only
          shadowColor: 'transparent', // Strict rule: no shadows
          elevation: 0, // Remove Android shadow
        },
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <View className="flex-row items-center justify-center gap-2">
          {icon}
          <KlinoText 
            variant="label" 
            color={getTextColor()}
          >
            {title}
          </KlinoText>
        </View>
      )}
    </TouchableOpacity>
  );
};
