import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInputProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  showPasswordToggle?: boolean;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  showPasswordToggle = false,
  required = false,
  secureTextEntry,
  ...props
}) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const getContainerStyle = (): ViewStyle => {
    return {
      marginBottom: SPACING.md,
    };
  };

  const getInputContainerStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: error
        ? COLORS.error
        : isFocused
        ? COLORS.primary
        : COLORS.border,
      borderRadius: BORDER_RADIUS.md,
      backgroundColor: COLORS.white,
      paddingHorizontal: SPACING.md,
      minHeight: 48,
    };
  };

  const getInputStyle = (): TextStyle => {
    return {
      flex: 1,
      fontSize: FONTS.sizes.md,
      fontFamily: FONTS.regular,
      color: COLORS.text,
      paddingVertical: SPACING.sm,
      paddingLeft: leftIcon ? SPACING.sm : 0,
      paddingRight: (rightIcon || showPasswordToggle) ? SPACING.sm : 0,
    };
  };

  const getLabelStyle = (): TextStyle => {
    return {
      fontSize: FONTS.sizes.sm,
      fontFamily: FONTS.medium,
      color: COLORS.text,
      marginBottom: SPACING.xs,
    };
  };

  const getErrorStyle = (): TextStyle => {
    return {
      fontSize: FONTS.sizes.sm,
      fontFamily: FONTS.regular,
      color: COLORS.error,
      marginTop: SPACING.xs,
    };
  };

  const renderLeftIcon = () => {
    if (!leftIcon) return null;

    return (
      <Ionicons
        name={leftIcon}
        size={20}
        color={error ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray}
        style={styles.leftIcon}
      />
    );
  };

  const renderRightIcon = () => {
    if (showPasswordToggle && secureTextEntry !== undefined) {
      return (
        <TouchableOpacity
          onPress={togglePasswordVisibility}
          style={styles.rightIcon}
        >
          <Ionicons
            name={isPasswordVisible ? 'eye-off' : 'eye'}
            size={20}
            color={COLORS.gray}
          />
        </TouchableOpacity>
      );
    }

    if (!rightIcon) return null;

    return (
      <TouchableOpacity
        onPress={onRightIconPress}
        style={styles.rightIcon}
        disabled={!onRightIconPress}
      >
        <Ionicons
          name={rightIcon}
          size={20}
          color={error ? COLORS.error : isFocused ? COLORS.primary : COLORS.gray}
        />
      </TouchableOpacity>
    );
  };

  const renderLabel = () => {
    if (!label) return null;

    return (
      <Text style={[getLabelStyle(), labelStyle]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    );
  };

  const renderError = () => {
    if (!error) return null;

    return (
      <Text style={[getErrorStyle(), errorStyle]}>{error}</Text>
    );
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {renderLabel()}
      <View style={getInputContainerStyle()}>
        {renderLeftIcon()}
        <TextInput
          style={[getInputStyle(), inputStyle]}
          placeholderTextColor={COLORS.gray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={
            showPasswordToggle
              ? secureTextEntry && !isPasswordVisible
              : secureTextEntry
          }
          {...props}
        />
        {renderRightIcon()}
      </View>
      {renderError()}
    </View>
  );
};

const styles = StyleSheet.create({
  leftIcon: {
    marginRight: SPACING.xs,
  },
  rightIcon: {
    marginLeft: SPACING.xs,
    padding: SPACING.xs,
  },
  required: {
    color: COLORS.error,
  },
});

export default Input;