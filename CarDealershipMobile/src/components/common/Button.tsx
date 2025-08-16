import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, SPACING, BORDER_RADIUS, SHADOWS } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: BORDER_RADIUS.md,
      ...SHADOWS.small,
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: {
        paddingHorizontal: SPACING.md,
        paddingVertical: SPACING.sm,
        minHeight: 36,
      },
      medium: {
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        minHeight: 44,
      },
      large: {
        paddingHorizontal: SPACING.xl,
        paddingVertical: SPACING.lg,
        minHeight: 52,
      },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: disabled ? COLORS.gray : COLORS.primary,
      },
      secondary: {
        backgroundColor: disabled ? COLORS.lightGray : COLORS.secondary,
      },
      outline: {
        backgroundColor: COLORS.transparent,
        borderWidth: 1,
        borderColor: disabled ? COLORS.gray : COLORS.primary,
      },
      ghost: {
        backgroundColor: COLORS.transparent,
        ...SHADOWS.small,
        shadowOpacity: 0,
        elevation: 0,
      },
      danger: {
        backgroundColor: disabled ? COLORS.gray : COLORS.error,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.6 }),
    };
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontFamily: FONTS.medium,
      textAlign: 'center',
    };

    // Size styles
    const sizeStyles: Record<string, TextStyle> = {
      small: {
        fontSize: FONTS.sizes.sm,
      },
      medium: {
        fontSize: FONTS.sizes.md,
      },
      large: {
        fontSize: FONTS.sizes.lg,
      },
    };

    // Variant styles
    const variantStyles: Record<string, TextStyle> = {
      primary: {
        color: COLORS.white,
      },
      secondary: {
        color: COLORS.white,
      },
      outline: {
        color: disabled ? COLORS.gray : COLORS.primary,
      },
      ghost: {
        color: disabled ? COLORS.gray : COLORS.primary,
      },
      danger: {
        color: COLORS.white,
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
    };
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost'
              ? COLORS.primary
              : COLORS.white
          }
        />
      );
    }

    const textElement = (
      <Text style={[getTextStyle(), textStyle]}>{title}</Text>
    );

    if (!icon) {
      return textElement;
    }

    return (
      <>
        {iconPosition === 'left' && (
          <>
            {icon}
            <Text style={styles.iconSpacing} />
          </>
        )}
        {textElement}
        {iconPosition === 'right' && (
          <>
            <Text style={styles.iconSpacing} />
            {icon}
          </>
        )}
      </>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  iconSpacing: {
    width: SPACING.sm,
  },
});

export default Button;