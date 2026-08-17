import React from 'react';
import { View, ViewProps } from 'react-native';
import { KLINO_COLORS } from '../../constants/theme';
import { KlinoText } from './KlinoText';

interface KlinoBadgeProps extends ViewProps {
  label?: string;
  variant?: 'amber' | 'green' | 'gray';
  dotOnly?: boolean;
}

export const KlinoBadge: React.FC<KlinoBadgeProps> = ({
  label,
  variant = 'amber',
  dotOnly = false,
  style,
  ...props
}) => {
  const getBackgroundColor = () => {
    switch (variant) {
      case 'amber': return KLINO_COLORS.ambar;
      case 'green': return KLINO_COLORS.verde;
      case 'gray': return KLINO_COLORS.gris;
      default: return KLINO_COLORS.ambar;
    }
  };

  // Square dot for pending status in lists
  if (dotOnly) {
    return (
      <View 
        style={[
          { 
            backgroundColor: getBackgroundColor(), 
            width: 12, 
            height: 12, 
            borderRadius: 0 // Strict rule: sharp corners only
          }, 
          style
        ]} 
        {...props} 
      />
    );
  }

  return (
    <View 
      className="px-2 py-1 flex-row items-center justify-center"
      style={[
        { 
          backgroundColor: getBackgroundColor(),
          borderRadius: 0 // Strict rule: sharp corners only
        }, 
        style
      ]}
      {...props}
    >
      <KlinoText 
        variant="label" 
        color={variant === 'amber' ? KLINO_COLORS.tinta : KLINO_COLORS.papel}
      >
        {label}
      </KlinoText>
    </View>
  );
};
