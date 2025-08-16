import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, BORDER_RADIUS } from '../../constants';
import { debounce } from '../../utils';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  onSearch?: (text: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  showFilterButton?: boolean;
  onFilterPress?: () => void;
  autoFocus?: boolean;
  editable?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  debounceDelay?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search cars...',
  value = '',
  onChangeText,
  onSearch,
  onFocus,
  onBlur,
  onClear,
  showFilterButton = false,
  onFilterPress,
  autoFocus = false,
  editable = true,
  style,
  inputStyle,
  debounceDelay = 300,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [searchText, setSearchText] = useState(value);

  // Debounced search function
  const debouncedSearch = debounce((text: string) => {
    if (onSearch) {
      onSearch(text);
    }
  }, debounceDelay);

  const handleChangeText = (text: string) => {
    setSearchText(text);
    if (onChangeText) {
      onChangeText(text);
    }
    debouncedSearch(text);
  };

  const handleFocus = () => {
    setIsFocused(true);
    if (onFocus) {
      onFocus();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    if (onBlur) {
      onBlur();
    }
  };

  const handleClear = () => {
    setSearchText('');
    if (onChangeText) {
      onChangeText('');
    }
    if (onClear) {
      onClear();
    }
    if (onSearch) {
      onSearch('');
    }
  };

  const handleSearchPress = () => {
    if (onSearch) {
      onSearch(searchText);
    }
  };

  const getContainerStyle = (): ViewStyle => {
    return {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: COLORS.white,
      borderRadius: BORDER_RADIUS.md,
      borderWidth: 1,
      borderColor: isFocused ? COLORS.primary : COLORS.border,
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
      marginLeft: SPACING.sm,
      marginRight: SPACING.sm,
    };
  };

  const renderSearchIcon = () => {
    return (
      <TouchableOpacity
        onPress={handleSearchPress}
        style={styles.iconButton}
        disabled={!onSearch}
      >
        <Ionicons
          name="search"
          size={20}
          color={isFocused ? COLORS.primary : COLORS.gray}
        />
      </TouchableOpacity>
    );
  };

  const renderClearButton = () => {
    if (!searchText) return null;

    return (
      <TouchableOpacity
        onPress={handleClear}
        style={styles.iconButton}
      >
        <Ionicons
          name="close-circle"
          size={20}
          color={COLORS.gray}
        />
      </TouchableOpacity>
    );
  };

  const renderFilterButton = () => {
    if (!showFilterButton) return null;

    return (
      <TouchableOpacity
        onPress={onFilterPress}
        style={[styles.iconButton, styles.filterButton]}
      >
        <Ionicons
          name="options"
          size={20}
          color={COLORS.primary}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={[getContainerStyle(), style]}>
      {renderSearchIcon()}
      <TextInput
        style={[getInputStyle(), inputStyle]}
        placeholder={placeholder}
        placeholderTextColor={COLORS.gray}
        value={searchText}
        onChangeText={handleChangeText}
        onFocus={handleFocus}
        onBlur={handleBlur}
        autoFocus={autoFocus}
        editable={editable}
        returnKeyType="search"
        onSubmitEditing={handleSearchPress}
      />
      {renderClearButton()}
      {renderFilterButton()}
    </View>
  );
};

const styles = StyleSheet.create({
  iconButton: {
    padding: SPACING.xs,
  },
  filterButton: {
    marginLeft: SPACING.xs,
    borderLeftWidth: 1,
    borderLeftColor: COLORS.border,
    paddingLeft: SPACING.sm,
  },
});

export default SearchBar;