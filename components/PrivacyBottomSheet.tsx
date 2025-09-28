import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';

const CORAL = '#FF725E';
const TEXT = '#1F2937';

interface PrivacyBottomSheetProps { }

export const PrivacyBottomSheet = forwardRef<BottomSheetModal, PrivacyBottomSheetProps>(
  (props, ref) => {
    const snapPoints = useMemo(() => ['75%', '90%'], []);

    const handleSheetChanges = useCallback((index: number) => {
      console.log('PrivacyBottomSheet handleSheetChanges', index);
    }, []);

    const handleClose = useCallback(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

    const handleOpenPrivacyPolicy = useCallback(async () => {
      try {
        await Linking.openURL('https://forkfit.app/politica-de-privacidade');
      } catch (error) {
        console.error('Error opening privacy policy:', error);
      }
    }, []);

    const handleOpenTermsOfUse = useCallback(async () => {
      try {
        await Linking.openURL('https://forkfit.app/termos-de-uso');
      } catch (error) {
        console.error('Error opening terms of use:', error);
      }
    }, []);

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        onChange={handleSheetChanges}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Privacidade e Termos</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FontAwesome6 name="xmark" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Privacy Policy Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.emoji}>📄</Text>
              <Text style={styles.sectionTitle}>Política de Privacidade</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Como protegemos seus dados</Text>
            <Text style={styles.sectionContent}>
              Levamos sua privacidade a sério. Coletamos apenas o essencial para oferecer uma boa experiência no ForkFit — como nome, e-mail e suas escolhas alimentares. Tudo é armazenado com segurança e nunca será compartilhado sem seu consentimento.
            </Text>
            <TouchableOpacity onPress={handleOpenPrivacyPolicy} style={styles.linkButton}>
              <Text style={styles.linkText}>Saiba mais aqui</Text>
            </TouchableOpacity>
          </View>

          {/* Terms of Use Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.emoji}>⚖️</Text>
              <Text style={styles.sectionTitle}>Termos de Uso</Text>
            </View>
            <Text style={styles.sectionSubtitle}>Uso responsável do ForkFit</Text>
            <Text style={styles.sectionContent}>
              Ao usar o ForkFit, você concorda em registrar informações reais e usar o app apenas para fins pessoais. Não nos responsabilizamos por decisões médicas — sempre consulte um profissional de saúde.
            </Text>
            <TouchableOpacity onPress={handleOpenTermsOfUse} style={styles.linkButton}>
              <Text style={styles.linkText}>Saiba mais aqui</Text>
            </TouchableOpacity>
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Dúvidas sobre privacidade?</Text>
            <Text style={styles.contactText}>
              Entre em contato conosco em{' '}
              <Text style={styles.contactEmail}>info@forkfit.app</Text>
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>ForkFit © 2025</Text>
            <Text style={styles.footerSubtext}>Todos os direitos reservados</Text>
          </View>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  handleIndicator: {
    backgroundColor: '#ddd',
    width: 40,
    height: 4,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORAL,
    textAlign: 'center',
    flex: 1,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1, // 🔑 makes content scrollable
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 24,
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT,
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: CORAL,
    marginBottom: 12,
    marginLeft: 36, // Align with content after emoji
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
    marginLeft: 36, // Align with content after emoji
    marginBottom: 12,
  },
  linkButton: {
    marginLeft: 36, // Align with content after emoji
    marginTop: 4,
  },
  linkText: {
    fontSize: 14,
    color: CORAL,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  contactSection: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: CORAL,
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  contactEmail: {
    color: CORAL,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#999',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#ccc',
  },
});
