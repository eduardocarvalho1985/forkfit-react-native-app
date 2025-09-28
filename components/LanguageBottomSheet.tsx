import React, { forwardRef, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';

// Design system constants
const CORAL = '#FF725E';
const TEXT_DARK = '#1F2937';
const TEXT_LIGHT = '#64748b';
const BORDER_LIGHT = '#e2e8f0';
const OFF_WHITE = '#FFF8F6';

export interface LanguageBottomSheetProps {}

export const LanguageBottomSheet = forwardRef<BottomSheetModal, LanguageBottomSheetProps>(
  (props, ref) => {
    // The heights the sheet can snap to
    const snapPoints = useMemo(() => ['60%'], []);

    const handleClose = () => {
      (ref as React.RefObject<BottomSheetModal>)?.current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: BORDER_LIGHT }}
        backgroundStyle={{ backgroundColor: OFF_WHITE }}
      >
        <BottomSheetScrollView contentContainerStyle={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerContent}>
              <Text style={styles.title}>Idioma</Text>
              <Text style={styles.subtitle}>Configurações de idioma</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome6 name="xmark" size={22} color={CORAL} />
            </TouchableOpacity>
          </View>

          {/* Current Language Card */}
          <View style={styles.languageCard}>
            <View style={styles.languageContent}>
              <View style={styles.languageHeader}>
                <View style={styles.languageInfo}>
                  <FontAwesome6 name="globe" size={24} color={CORAL} />
                  <View style={styles.languageText}>
                    <Text style={styles.languageTitle}>Português (Brasil)</Text>
                    <Text style={styles.languageSubtitle}>Idioma atual</Text>
                  </View>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>ATIVO</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Information Card */}
          <View style={styles.infoCard}>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Informações sobre idiomas</Text>
              
              <Text style={styles.infoText}>
                Atualmente, o ForkFit está disponível apenas em português brasileiro. 
                Novos idiomas estarão disponíveis em breve!
              </Text>

              <View style={styles.separator} />

              <Text style={styles.infoTitle}>Language Information</Text>
              <Text style={styles.infoText}>
                Currently, ForkFit is only available in Brazilian Portuguese. 
                New languages will be available soon!
              </Text>

              <View style={styles.separator} />

              <Text style={styles.infoTitle}>Información de idiomas</Text>
              <Text style={styles.infoText}>
                Actualmente, ForkFit solo está disponible en portugués brasileño. 
                ¡Nuevos idiomas estarán disponibles pronto!
              </Text>
            </View>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingTop: 8,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: TEXT_DARK,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_LIGHT,
  },
  languageCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
    marginBottom: 16,
  },
  languageContent: {
    padding: 20,
  },
  languageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageText: {
    marginLeft: 12,
    flex: 1,
  },
  languageTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  languageSubtitle: {
    fontSize: 14,
    color: TEXT_LIGHT,
  },
  activeBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 60,
    alignItems: 'center',
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
    marginBottom: 16,
  },
  infoContent: {
    padding: 20,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: TEXT_LIGHT,
    lineHeight: 20,
    marginBottom: 16,
  },
  separator: {
    height: 1,
    backgroundColor: BORDER_LIGHT,
    marginVertical: 16,
  },
});

LanguageBottomSheet.displayName = 'LanguageBottomSheet';
