import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants';
import Button from './Button';

interface EmptyStateProps {
  icon?: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  descriptionStyle?: TextStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionText,
  onAction,
  style,
  titleStyle,
  descriptionStyle,
}) => {
  const getContainerStyle = (): ViewStyle => {
    return {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: SPACING.xl,
      paddingVertical: SPACING.xxl,
    };
  };

  const getTitleStyle = (): TextStyle => {
    return {
      fontSize: FONTS.sizes.xl,
      fontFamily: FONTS.bold,
      color: COLORS.text,
      textAlign: 'center',
      marginBottom: SPACING.sm,
    };
  };

  const getDescriptionStyle = (): TextStyle => {
    return {
      fontSize: FONTS.sizes.md,
      fontFamily: FONTS.regular,
      color: COLORS.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: SPACING.xl,
    };
  };

  const renderIcon = () => {
    if (!icon) return null;

    return (
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={64}
          color={COLORS.gray}
        />
      </View>
    );
  };

  const renderAction = () => {
    if (!actionText || !onAction) return null;

    return (
      <Button
        title={actionText}
        onPress={onAction}
        variant="primary"
        size="medium"
      />
    );
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {renderIcon()}
      <Text style={[getTitleStyle(), titleStyle]}>{title}</Text>
      {description && (
        <Text style={[getDescriptionStyle(), descriptionStyle]}>
          {description}
        </Text>
      )}
      {renderAction()}
    </View>
  );
};

const styles = StyleSheet.create({
  iconContainer: {
    marginBottom: SPACING.lg,
  },
});

export default EmptyState;