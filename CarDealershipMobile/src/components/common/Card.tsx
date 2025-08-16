import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  shadow?: 'none' | 'small' | 'medium' | 'large';
  padding?: 'none' | 'small' | 'medium' | 'large';
  margin?: 'none' | 'small' | 'medium' | 'large';
  borderRadius?: 'none' | 'small' | 'medium' | 'large';
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  contentStyle,
  shadow = 'small',
  padding = 'medium',
  margin = 'none',
  borderRadius = 'medium',
  backgroundColor = COLORS.white,
  borderColor,
  borderWidth,
  disabled = false,
}) => {
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      backgroundColor,
    };

    // Shadow styles
    const shadowStyles: Record<string, ViewStyle> = {
      none: {},
      small: SHADOWS.small,
      medium: SHADOWS.medium,
      large: SHADOWS.large,
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      small: { padding: SPACING.sm },
      medium: { padding: SPACING.md },
      large: { padding: SPACING.lg },
    };

    // Margin styles
    const marginStyles: Record<string, ViewStyle> = {
      none: {},
      small: { margin: SPACING.sm },
      medium: { margin: SPACING.md },
      large: { margin: SPACING.lg },
    };

    // Border radius styles
    const borderRadiusStyles: Record<string, ViewStyle> = {
      none: { borderRadius: 0 },
      small: { borderRadius: BORDER_RADIUS.sm },
      medium: { borderRadius: BORDER_RADIUS.md },
      large: { borderRadius: BORDER_RADIUS.lg },
    };

    // Border styles
    const borderStyles: ViewStyle = {};
    if (borderColor) {
      borderStyles.borderColor = borderColor;
      borderStyles.borderWidth = borderWidth || 1;
    }

    return {
      ...baseStyle,
      ...shadowStyles[shadow],
      ...paddingStyles[padding],
      ...marginStyles[margin],
      ...borderRadiusStyles[borderRadius],
      ...borderStyles,
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const CardComponent = onPress ? TouchableOpacity : View;

  return (
    <CardComponent
      style={[getCardStyle(), style]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={onPress ? 0.8 : 1}
    >
      <View style={contentStyle}>{children}</View>
    </CardComponent>
  );
};

export default Card;