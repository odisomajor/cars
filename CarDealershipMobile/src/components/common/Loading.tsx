import React from 'react';
import {
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants';

interface LoadingProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const Loading: React.FC<LoadingProps> = ({
  size = 'large',
  color = COLORS.primary,
  text,
  overlay = false,
  style,
  textStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      justifyContent: 'center',
      alignItems: 'center',
    };

    if (overlay) {
      return {
        ...baseStyle,
        ...StyleSheet.absoluteFillObject,
        backgroundColor: COLORS.overlay,
        zIndex: 1000,
      };
    }

    return {
      ...baseStyle,
      flex: 1,
    };
  };

  const getTextStyle = (): TextStyle => {
    return {
      fontSize: FONTS.sizes.md,
      fontFamily: FONTS.regular,
      color: overlay ? COLORS.white : COLORS.text,
      marginTop: SPACING.md,
      textAlign: 'center',
    };
  };

  return (
    <View style={[getContainerStyle(), style]}>
      <ActivityIndicator size={size} color={color} />
      {text && (
        <Text style={[getTextStyle(), textStyle]}>{text}</Text>
      )}
    </View>
  );
};

export default Loading;