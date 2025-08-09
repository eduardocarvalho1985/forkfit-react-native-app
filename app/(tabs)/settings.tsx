import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { PrivacyBottomSheet } from '../../components/PrivacyBottomSheet';
import { HelpBottomSheet } from '../../components/HelpBottomSheet';

const CORAL = '#FF725E';
const TEXT_DARK = '#1F2937';
const TEXT_LIGHT = '#64748b';
const BORDER_LIGHT = '#e2e8f0';

export default function SettingsScreen() {
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const privacyBottomSheetRef = useRef<BottomSheetModal>(null);
  const helpBottomSheetRef = useRef<BottomSheetModal>(null);

  const handlePrivacyPress = () => {
    privacyBottomSheetRef.current?.present();
  };

  const handleHelpPress = () => {
    helpBottomSheetRef.current?.present();
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title - Left aligned and lower */}
          <Text style={styles.mainTitle}>Ajustes</Text>
          
          {/* Plan Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Plano Atual</Text>
            <View style={styles.card}>
              <View style={styles.planContent}>
                <View style={styles.planHeader}>
                  <Text style={styles.planTitle}>Plano Gratuito</Text>
                  <View style={styles.planBadge}>
                    <Text style={styles.planBadgeText}>ATIVO</Text>
                  </View>
                </View>
                <Text style={styles.planDescription}>
                  Ainda não lançamos nosso plano premium. Continue usando gratuitamente e fique ligado para nosso lançamento oficial.
                </Text>
              </View>
            </View>
          </View>
          
          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notificações</Text>
            <View style={styles.card}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <FontAwesome6 name="bell" size={20} color={CORAL} style={styles.settingIcon} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Lembretes diários</Text>
                    <Text style={styles.settingSubtext}>Receba lembretes para registrar suas refeições</Text>
                  </View>
                </View>
                <Switch
                  value={dailyReminders}
                  onValueChange={setDailyReminders}
                  trackColor={{ false: '#f1f5f9', true: CORAL }}
                  thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                  ios_backgroundColor="#f1f5f9"
                />
              </View>
              
              <View style={[styles.settingRow, styles.lastRow]}>
                <View style={styles.settingInfo}>
                  <FontAwesome6 name="chart-line" size={20} color={CORAL} style={styles.settingIcon} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Relatórios semanais</Text>
                    <Text style={styles.settingSubtext}>Receba resumos do seu progresso semanal</Text>
                  </View>
                </View>
                <Switch
                  value={weeklyReports}
                  onValueChange={setWeeklyReports}
                  trackColor={{ false: '#f1f5f9', true: CORAL }}
                  thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                  ios_backgroundColor="#f1f5f9"
                />
              </View>
            </View>
          </View>
          
          {/* General Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Geral</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.actionRow}>
                <FontAwesome6 name="globe" size={20} color={TEXT_LIGHT} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Idioma</Text>
                  <Text style={styles.actionValue}>Português (BR)</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionRow}>
                <FontAwesome6 name="credit-card" size={20} color={TEXT_LIGHT} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Gerenciar Assinatura</Text>
                  <Text style={styles.actionSubtext}>Planos e pagamentos</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionRow} onPress={handlePrivacyPress}>
                <FontAwesome6 name="shield-halved" size={20} color={TEXT_LIGHT} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Privacidade</Text>
                  <Text style={styles.actionSubtext}>Política de privacidade e termos</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionRow, styles.lastRow]} onPress={handleHelpPress}>
                <FontAwesome6 name="circle-question" size={20} color={TEXT_LIGHT} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Ajuda</Text>
                  <Text style={styles.actionSubtext}>FAQ e suporte</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Logout Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutCard}>
              <FontAwesome6 name="arrow-right-from-bracket" size={20} color={CORAL} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>ForkFit</Text>
            <Text style={styles.footerVersion}>Versão 1.0.0</Text>
            <Text style={styles.footerCopyright}>© 2025 ForkFit. Todos os direitos reservados.</Text>
          </View>
        </ScrollView>

        {/* Bottom Sheets */}
        <PrivacyBottomSheet ref={privacyBottomSheetRef} />
        <HelpBottomSheet ref={helpBottomSheetRef} />
      </View>
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginTop: 70,
    marginBottom: 24,
    marginLeft: 20,
    textAlign: 'left',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: CORAL,
    marginLeft: 20,
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
  },
  
  // Plan Section Styles - Fixed overflow
  planContent: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: TEXT_DARK,
    flex: 1,
    marginRight: 12,
  },
  planBadge: {
    backgroundColor: CORAL,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  planDescription: {
    fontSize: 15,
    color: TEXT_LIGHT,
    lineHeight: 22,
  },
  
  // Settings Row Styles
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    marginRight: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  settingSubtext: {
    fontSize: 13,
    color: TEXT_LIGHT,
  },
  
  // Action Row Styles
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  actionIcon: {
    marginRight: 12,
    width: 20,
  },
  actionText: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: TEXT_DARK,
    marginBottom: 2,
  },
  actionValue: {
    fontSize: 14,
    color: CORAL,
    fontWeight: '500',
  },
  actionSubtext: {
    fontSize: 13,
    color: TEXT_LIGHT,
  },
  
  // Last row in sections
  lastRow: {
    borderBottomWidth: 0,
  },
  
  // Logout Section
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
  },
  logoutIcon: {
    marginRight: 12,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: CORAL,
  },
  
  // Footer
  footer: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  footerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CORAL,
    marginBottom: 4,
  },
  footerVersion: {
    fontSize: 14,
    color: TEXT_LIGHT,
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 12,
    color: TEXT_LIGHT,
    textAlign: 'center',
  },
});
