import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { KLINO_COLORS, KLINO_FONTS } from '../../constants/theme';

interface KlinoTextProps extends TextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'subtitle' | 'body' | 'small' | 'label' | 'clinical';
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
}

export const KlinoText: React.FC<KlinoTextProps> = ({
  variant = 'body',
  color = KLINO_COLORS.tinta,
  align = 'left',
  style,
  children,
  ...props
}) => {
  return (
    <Text style={[styles[variant], { color, textAlign: align }, style]} {...props}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: KLINO_FONTS.display,
    fontSize: 52,
    lineHeight: 52 * 1.05,
    letterSpacing: -0.015 * 52,
  },
  h2: {
    fontFamily: KLINO_FONTS.display,
    fontSize: 34,
    lineHeight: 34 * 1.12,
  },
  h3: {
    fontFamily: KLINO_FONTS.display,
    fontSize: 24,
    lineHeight: 24 * 1.2,
  },
  subtitle: {
    fontFamily: KLINO_FONTS.bodyRegular,
    fontSize: 22,
    lineHeight: 22 * 1.45,
  },
  body: {
    fontFamily: KLINO_FONTS.bodyRegular,
    fontSize: 17,
    lineHeight: 17 * 1.62,
  },
  clinical: {
    fontFamily: KLINO_FONTS.bodyRegular,
    fontSize: 17,
    lineHeight: 17 * 1.62,
  },
  small: {
    fontFamily: KLINO_FONTS.bodyRegular,
    fontSize: 15,
    lineHeight: 15 * 1.55,
  },
  label: {
    fontFamily: KLINO_FONTS.display,
    fontSize: 13,
    lineHeight: 13 * 1,
    letterSpacing: 0.24 * 13,
    textTransform: 'uppercase',
  },
});
