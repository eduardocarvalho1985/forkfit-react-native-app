import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert, Linking } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import { PrivacyBottomSheet } from '../../components/PrivacyBottomSheet';
import { HelpBottomSheet } from '../../components/HelpBottomSheet';
import { useAuth } from '../../contexts/AuthContext';
import { 
  getNotificationPermissionStatus, 
  requestNotificationPermissions,
  openAppSettings,
  clearNotificationData,
  updateNotificationPreferences,
  getNotificationPreferences,
  pauseNotificationsTemporarily
} from '../../services/notificationService';

const CORAL = '#FF725E';
const TEXT_DARK = '#1F2937';
const TEXT_LIGHT = '#64748b';
const BORDER_LIGHT = '#e2e8f0';

export default function SettingsScreen() {
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied' | 'blocked'>('undetermined');
  const privacyBottomSheetRef = useRef<BottomSheetModal>(null);
  const helpBottomSheetRef = useRef<BottomSheetModal>(null);
  const { signOut } = useAuth();

  // Check notification permission status and preferences on mount
  useEffect(() => {
    checkNotificationStatus();
    loadNotificationPreferences();
  }, []);

  // Refresh notification status when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      checkNotificationStatus();
    }, [])
  );

  const checkNotificationStatus = async () => {
    try {
      const status = await getNotificationPermissionStatus();
      setPermissionStatus(status.status);
      setNotificationsEnabled(status.granted);
    } catch (error) {
      console.error('Error checking notification status:', error);
    }
  };

  const loadNotificationPreferences = async () => {
    try {
      const preferences = await getNotificationPreferences();
      setDailyReminders(preferences.dailyReminders);
      setWeeklyReports(preferences.weeklyReports);
    } catch (error) {
      console.error('Error loading notification preferences:', error);
    }
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    if (enabled) {
      // Always try to request permissions when turning ON
      try {
        const status = await requestNotificationPermissions();
        if (status.granted) {
          setNotificationsEnabled(true);
          setPermissionStatus('granted');
          // Update preferences when notifications are enabled
          await updateNotificationPreferences(dailyReminders, weeklyReports);
          Alert.alert(
            'Notificações Ativadas!',
            'Agora você receberá lembretes e atualizações importantes.',
            [{ text: 'Ótimo!' }]
          );
        } else if (status.status === 'denied') {
          Alert.alert(
            'Permissões Negadas',
            'Para receber notificações, você precisa permitir o acesso nas configurações do dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configurações', onPress: () => Linking.openSettings() }
            ]
          );
        } else if (status.status === 'blocked') {
          Alert.alert(
            'Permissões Bloqueadas',
            'Para ativar notificações, você precisa permitir o acesso nas configurações do dispositivo.',
            [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Configurações', onPress: () => Linking.openSettings() }
            ]
          );
        }
        // Update the permission status in the UI
        setPermissionStatus(status.status);
      } catch (error) {
        console.error('Error requesting notification permissions:', error);
        Alert.alert(
          'Erro',
          'Não foi possível solicitar permissões de notificação. Tente novamente.',
          [{ text: 'OK' }]
        );
      }
    } else {
      setNotificationsEnabled(false);
      // Clear notification data and cancel scheduled notifications when disabling
      await clearNotificationData();
      await updateNotificationPreferences(false, false);
      // Reset permission status to undetermined so user can request again
      setPermissionStatus('undetermined');
    }
  };

  const handleDailyRemindersToggle = async (enabled: boolean) => {
    setDailyReminders(enabled);
    if (notificationsEnabled) {
      await updateNotificationPreferences(enabled, weeklyReports);
    }
  };

  const handleWeeklyReportsToggle = async (enabled: boolean) => {
    setWeeklyReports(enabled);
    if (notificationsEnabled) {
      await updateNotificationPreferences(dailyReminders, enabled);
    }
  };

  const handlePauseNotifications = async () => {
    Alert.alert(
      'Pausar Notificações',
      'Por quanto tempo você gostaria de pausar as notificações?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: '1 hora', 
          onPress: async () => {
            await pauseNotificationsTemporarily(1);
            Alert.alert('Sucesso', 'Notificações pausadas por 1 hora');
          }
        },
        { 
          text: '24 horas', 
          onPress: async () => {
            await pauseNotificationsTemporarily(24);
            Alert.alert('Sucesso', 'Notificações pausadas por 24 horas');
          }
        }
      ]
    );
  };

  const handlePrivacyPress = () => {
    privacyBottomSheetRef.current?.present();
  };

  const handleHelpPress = () => {
    helpBottomSheetRef.current?.present();
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sair da Conta',
      'Tem certeza que deseja sair?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sair', style: 'destructive', onPress: signOut }
      ]
    );
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          style={[styles.scrollView, { paddingTop: 40 }]}
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
              {/* Push Notifications Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <FontAwesome6 name="bell" size={20} color={CORAL} style={styles.settingIcon} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Notificações Push</Text>
                    <Text style={styles.settingSubtext}>
                      {permissionStatus === 'granted' 
                        ? 'Receber lembretes e atualizações importantes'
                        : permissionStatus === 'blocked'
                        ? 'Permissões bloqueadas - ative nas configurações'
                        : 'Permitir notificações para receber lembretes'
                      }
                    </Text>
                  </View>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationToggle}
                  trackColor={{ false: '#f1f5f9', true: CORAL }}
                  thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                  ios_backgroundColor="#f1f5f9"
                  disabled={permissionStatus === 'blocked'}
                />
              </View>
              
              {/* Settings Button for Blocked Permissions */}
              {permissionStatus === 'blocked' && (
                <View style={styles.settingRow}>
                  <TouchableOpacity style={styles.settingsButton} onPress={() => Linking.openSettings()}>
                    <Text style={styles.settingsButtonText}>Ir para Configurações</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Daily Reminders Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <FontAwesome6 name="clock" size={20} color={CORAL} style={styles.settingIcon} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Lembretes diários</Text>
                    <Text style={styles.settingSubtext}>Receba lembretes para registrar suas refeições</Text>
                  </View>
                </View>
                <Switch
                  value={dailyReminders}
                  onValueChange={handleDailyRemindersToggle}
                  trackColor={{ false: '#f1f5f9', true: CORAL }}
                  thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                  ios_backgroundColor="#f1f5f9"
                  disabled={!notificationsEnabled}
                />
              </View>
              
              {/* Weekly Reports Toggle */}
              {notificationsEnabled && (
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <FontAwesome6 name="chart-line" size={20} color={CORAL} style={styles.settingIcon} />
                    <View style={styles.settingText}>
                      <Text style={styles.settingLabel}>Relatórios semanais</Text>
                      <Text style={styles.settingSubtext}>Receba resumos do seu progresso semanal</Text>
                    </View>
                  </View>
                  <Switch
                    value={weeklyReports}
                    onValueChange={handleWeeklyReportsToggle}
                    trackColor={{ false: '#f1f5f9', true: CORAL }}
                    thumbColor={Platform.OS === 'android' ? '#fff' : ''}
                    ios_backgroundColor="#f1f5f9"
                  />
                </View>
              )}
              
              {/* Pause Notifications Action */}
              {notificationsEnabled && (
                <TouchableOpacity style={[styles.settingRow, styles.lastRow]} onPress={handlePauseNotifications}>
                  <FontAwesome6 name="pause" size={20} color={CORAL} style={styles.settingIcon} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Pausar Notificações</Text>
                    <Text style={styles.settingSubtext}>Pausar temporariamente</Text>
                  </View>
                  <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          {/* General Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Geral</Text>
            <View style={styles.card}>
              <TouchableOpacity style={styles.actionRow}>
                <FontAwesome6 name="globe" size={20} color={TEXT_DARK} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Idioma</Text>
                  <Text style={styles.actionValue}>Português (BR)</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionRow}>
                <FontAwesome6 name="credit-card" size={20} color={TEXT_DARK} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Gerenciar Assinatura</Text>
                  <Text style={styles.actionSubtext}>Configurar pagamentos e planos</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionRow} onPress={handlePrivacyPress}>
                <FontAwesome6 name="shield-halved" size={20} color={TEXT_DARK} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Privacidade</Text>
                  <Text style={styles.actionSubtext}>Configurações de privacidade e dados</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionRow, styles.lastRow]} onPress={handleHelpPress}>
                <FontAwesome6 name="circle-question" size={20} color={TEXT_DARK} style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Ajuda</Text>
                  <Text style={styles.actionSubtext}>Suporte e documentação</Text>
                </View>
                <FontAwesome6 name="chevron-right" size={16} color={TEXT_LIGHT} />
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Logout Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
              <FontAwesome6 name="arrow-right-from-bracket" size={20} color={CORAL} style={styles.logoutIcon} />
              <Text style={styles.logoutText}>Sair da conta</Text>
            </TouchableOpacity>
          </View>
          
          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>ForkFit</Text>
            <Text style={styles.footerVersion}>v0.1.0</Text>
            <Text style={styles.footerCopyright}>© 2025 ForkFit. Todos os direitos reservados.</Text>
          </View>
        </ScrollView>
      </View>
      
      {/* Bottom Sheets */}
      <PrivacyBottomSheet ref={privacyBottomSheetRef} />
      <HelpBottomSheet ref={helpBottomSheetRef} />
    </BottomSheetModalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
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
    marginTop: 72,
    marginBottom: 12,
    marginLeft: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
    marginBottom: 12,
    marginLeft: 16,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
  },
  
  // Plan Section Styles
  planContent: {
    padding: 16,
  },
  planHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_DARK,
  },
  planBadge: {
    backgroundColor: CORAL,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  planBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  planDescription: {
    fontSize: 14,
    color: TEXT_LIGHT,
    lineHeight: 20,
  },
  
  // Setting Row Styles
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
    width: 20,
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
    lineHeight: 18,
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
  
  // Settings Button Styles
  settingsButton: {
    backgroundColor: 'transparent',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#64748b',
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginTop: 16,
    alignSelf: 'center',
  },
  settingsButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
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
