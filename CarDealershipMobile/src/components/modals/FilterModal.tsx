import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  COLORS,
  FONTS,
  SPACING,
  BORDER_RADIUS,
  CAR_MAKES,
  BODY_TYPES,
  FUEL_TYPES,
  TRANSMISSION_TYPES,
  PRICE_RANGES,
  YEAR_RANGES,
  MILEAGE_RANGES,
  KENYAN_COUNTIES,
} from '../../constants';
import Button from '../common/Button';
import Card from '../common/Card';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface FilterOptions {
  make?: string;
  bodyType?: string;
  fuelType?: string;
  transmission?: string;
  priceRange?: { min: number; max: number | null };
  yearRange?: { min: number; max: number };
  mileageRange?: { min: number; max: number | null };
  location?: string;
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}) => {
  const [filters, setFilters] = useState<FilterOptions>(initialFilters);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, visible]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Filter Cars</Text>
        <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderSection = (
    title: string,
    key: string,
    options: string[] | { label: string; min: number; max: number | null }[],
    selectedValue?: string | { min: number; max: number | null },
    onSelect?: (value: any) => void
  ) => {
    const isExpanded = activeSection === key;
    const hasSelection = selectedValue !== undefined && selectedValue !== null;

    return (
      <Card style={styles.sectionCard} padding="none">
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setActiveSection(isExpanded ? null : key)}
        >
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {hasSelection && (
              <View style={styles.selectionIndicator}>
                <Text style={styles.selectionText}>1</Text>
              </View>
            )}
          </View>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={COLORS.gray}
          />
        </TouchableOpacity>
        
        {isExpanded && (
          <View style={styles.sectionContent}>
            {Array.isArray(options) && typeof options[0] === 'string' ? (
              // String options
              (options as string[]).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    selectedValue === option && styles.selectedOption,
                  ]}
                  onPress={() => onSelect?.(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      selectedValue === option && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                  {selectedValue === option && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))
            ) : (
              // Range options
              (options as { label: string; min: number; max: number | null }[]).map((option) => {
                const isSelected = 
                  selectedValue &&
                  typeof selectedValue === 'object' &&
                  selectedValue.min === option.min &&
                  selectedValue.max === option.max;
                
                return (
                  <TouchableOpacity
                    key={option.label}
                    style={[
                      styles.optionItem,
                      isSelected && styles.selectedOption,
                    ]}
                    onPress={() => onSelect?.({ min: option.min, max: option.max })}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        isSelected && styles.selectedOptionText,
                      ]}
                    >
                      {option.label}
                    </Text>
                    {isSelected && (
                      <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}
      </Card>
    );
  };

  const renderContent = () => {
    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderSection(
          'Make',
          'make',
          CAR_MAKES,
          filters.make,
          (value) => updateFilter('make', value)
        )}
        
        {renderSection(
          'Body Type',
          'bodyType',
          BODY_TYPES,
          filters.bodyType,
          (value) => updateFilter('bodyType', value)
        )}
        
        {renderSection(
          'Fuel Type',
          'fuelType',
          FUEL_TYPES,
          filters.fuelType,
          (value) => updateFilter('fuelType', value)
        )}
        
        {renderSection(
          'Transmission',
          'transmission',
          TRANSMISSION_TYPES,
          filters.transmission,
          (value) => updateFilter('transmission', value)
        )}
        
        {renderSection(
          'Price Range',
          'priceRange',
          PRICE_RANGES,
          filters.priceRange,
          (value) => updateFilter('priceRange', value)
        )}
        
        {renderSection(
          'Year Range',
          'yearRange',
          YEAR_RANGES,
          filters.yearRange,
          (value) => updateFilter('yearRange', value)
        )}
        
        {renderSection(
          'Mileage Range',
          'mileageRange',
          MILEAGE_RANGES,
          filters.mileageRange,
          (value) => updateFilter('mileageRange', value)
        )}
        
        {renderSection(
          'Location',
          'location',
          KENYAN_COUNTIES,
          filters.location,
          (value) => updateFilter('location', value)
        )}
      </ScrollView>
    );
  };

  const renderFooter = () => {
    const filterCount = Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== ''
    ).length;

    return (
      <View style={styles.footer}>
        <Button
          title={`Apply Filters${filterCount > 0 ? ` (${filterCount})` : ''}`}
          onPress={handleApply}
          variant="primary"
          size="large"
          fullWidth
        />
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {renderHeader()}
        {renderContent()}
        {renderFooter()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
  closeButton: {
    padding: SPACING.sm,
  },
  headerTitle: {
    fontSize: FONTS.sizes.lg,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  resetButton: {
    padding: SPACING.sm,
  },
  resetText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
  },
  sectionCard: {
    marginBottom: SPACING.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.medium,
    color: COLORS.text,
  },
  selectionIndicator: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: SPACING.sm,
  },
  selectionText: {
    fontSize: FONTS.sizes.xs,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  sectionContent: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  selectedOption: {
    backgroundColor: COLORS.lightGray,
  },
  optionText: {
    fontSize: FONTS.sizes.md,
    fontFamily: FONTS.regular,
    color: COLORS.text,
  },
  selectedOptionText: {
    color: COLORS.primary,
    fontFamily: FONTS.medium,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.white,
  },
});

export default FilterModal;