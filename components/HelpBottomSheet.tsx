import React, { forwardRef, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';

const CORAL = '#FF725E';
const TEXT = '#1F2937';

interface HelpBottomSheetProps { }

export const HelpBottomSheet = forwardRef<BottomSheetModal, HelpBottomSheetProps>(
  (props, ref) => {
    const snapPoints = useMemo(() => ['80%', '95%'], []);

    const handleSheetChanges = useCallback((index: number) => {
      console.log('HelpBottomSheet handleSheetChanges', index);
    }, []);

    const handleClose = useCallback(() => {
      if (ref && 'current' in ref && ref.current) {
        ref.current.dismiss();
      }
    }, [ref]);

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
          <Text style={styles.title}>Ajuda e Suporte</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <FontAwesome6 name="xmark" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        <BottomSheetScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>

          {/* FAQ Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.emoji}>❓</Text>
              <Text style={styles.sectionTitle}>FAQ – Perguntas Frequentes</Text>
            </View>

            {/* FAQ Item 1 */}
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Como registrar minha alimentação?</Text>
              <Text style={styles.faqAnswer}>
                Use a câmera ou escreva os alimentos manualmente. Vamos ajudar a identificar os macros automaticamente.
              </Text>
            </View>

            {/* FAQ Item 2 */}
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Como usar a análise de alimentos por IA?</Text>
              <Text style={styles.faqAnswer}>
                Tire uma foto do seu prato. Nossa IA analisa e estimamos os nutrientes com base na imagem.
              </Text>
            </View>

            {/* FAQ Item 3 */}
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Como definir minhas metas nutricionais?</Text>
              <Text style={styles.faqAnswer}>
                Na aba de perfil, toque em "Metas" e personalize seus objetivos diários de calorias, proteínas, carboidratos e gorduras.
              </Text>
            </View>

            {/* FAQ Item 4 */}
            <View style={styles.faqItem}>
              <Text style={styles.faqQuestion}>Como visualizar meu progresso?</Text>
              <Text style={styles.faqAnswer}>
                Acesse a aba "Progresso" para ver gráficos e relatórios semanais sobre sua alimentação e metas atingidas.
              </Text>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.contactSection}>
            <Text style={styles.contactTitle}>Precisa de mais ajuda?</Text>
            <Text style={styles.contactText}>
              Nosso time está aqui para você! Envie um email para{' '}
              <Text style={styles.contactEmail}>info@forkfit.app</Text>
              {' '}com sua dúvida e nosso time te responde rapidinho 🧡
            </Text>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>ForkFit © 2025</Text>
            <Text style={styles.footerSubtext}>Estamos aqui para ajudar você</Text>
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
    marginBottom: 24,
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
  faqItem: {
    marginBottom: 20,
    marginLeft: 36, // Align with content after emoji
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: CORAL,
    marginBottom: 8,
    lineHeight: 22,
  },
  faqAnswer: {
    fontSize: 15,
    lineHeight: 22,
    color: '#666',
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
