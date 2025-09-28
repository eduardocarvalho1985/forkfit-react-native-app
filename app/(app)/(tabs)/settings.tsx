import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FontAwesome6 } from '@expo/vector-icons';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { useFocusEffect } from '@react-navigation/native';
import * as Application from 'expo-application';
import { PrivacyBottomSheet } from '../../../components/PrivacyBottomSheet';
import { HelpBottomSheet } from '../../../components/HelpBottomSheet';
import { SubscriptionBottomSheet } from '../../../components/SubscriptionBottomSheet';
import { LanguageBottomSheet } from '../../../components/LanguageBottomSheet';
import { useAuth } from '../../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissions,
  clearNotificationData,
  updateNotificationPreferences,
  getNotificationPreferences,
  pauseNotificationsTemporarily
} from '../../../services/notificationService';
import { EmailAuthProvider, getAuth, GoogleAuthProvider, OAuthProvider, reauthenticateWithCredential } from '@react-native-firebase/auth';
import prompt from 'react-native-prompt-android';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { appleAuth } from '../../../services/appleAuth';
import { api } from '../../../services/api';

const CORAL = '#FF725E';
const TEXT_DARK = '#1F2937';
const TEXT_LIGHT = '#64748b';
const BORDER_LIGHT = '#e2e8f0';

// Design system constants
const ICON_SIZE = 24;
const ICON_COLOR_DEFAULT = '#1F2937';
const ICON_COLOR_ACCENT = '#FF725E';
const ROW_HEIGHT = 64;
const CARD_RADIUS = 12;
const CARD_PADDING = 16;
const DIVIDER_INSET = 52;

// Feature flags for MVP launch
// Weekly reports and daily reminders features are temporarily disabled to simplify the MVP launch
// This allows us to focus on core functionality while preserving the code for future releases
// To re-enable: change the respective flags to true
const ENABLE_WEEKLY_REPORTS = false; // Disabled for MVP - can be re-enabled in future releases
const ENABLE_DAILY_REMINDERS = false; // Disabled for MVP - can be re-enabled in future releases

// Unified Icon component with design system defaults
const Icon = ({ name, size = ICON_SIZE, color = ICON_COLOR_DEFAULT, style }: {
  name: keyof typeof Ionicons.glyphMap;
  size?: number;
  color?: string;
  style?: any;
}) => (
  <Ionicons name={name} size={size} color={color} style={style} />
);

export default function SettingsScreen() {
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'undetermined' | 'granted' | 'denied' | 'blocked'>('undetermined');
  const privacyBottomSheetRef = useRef<BottomSheetModal>(null);
  const helpBottomSheetRef = useRef<BottomSheetModal>(null);
  const subscriptionBottomSheetRef = useRef<BottomSheetModal>(null);
  const languageBottomSheetRef = useRef<BottomSheetModal>(null);
  const { signOut } = useAuth();
  const router = useRouter();

  // Version display logic
  const getVersionInfo = () => {
    const appVersion = Application.nativeApplicationVersion || '1.0.0';
    const buildVersion = Application.nativeBuildVersion || '1';
    
    // Determine build environment based on app name or bundle identifier
    const appName = Application.applicationName || '';
    const bundleId = Application.applicationId || '';
    
    let buildTag = '';
    let buildType = 'production';
    
    // Check for development builds
    if (appName.includes('Dev') || bundleId.includes('dev')) {
      buildTag = 'DEV';
      buildType = 'development';
    }
    // Check for preview builds  
    else if (appName.includes('Preview') || bundleId.includes('preview')) {
      buildTag = 'PREVIEW';
      buildType = 'preview';
    }
    
    return {
      appVersion,
      buildVersion,
      buildTag,
      buildType,
      displayVersion: buildTag ? `${buildTag} v${appVersion}` : `v${appVersion}`
    };
  };

  const versionInfo = getVersionInfo();


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
      // Daily reminders disabled for MVP - always set to false
      setDailyReminders(ENABLE_DAILY_REMINDERS ? preferences.dailyReminders : false);
      // Weekly reports disabled for MVP - always set to false
      setWeeklyReports(ENABLE_WEEKLY_REPORTS ? preferences.weeklyReports : false);
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
          // Daily reminders and weekly reports disabled for MVP - always pass false
          await updateNotificationPreferences(
            ENABLE_DAILY_REMINDERS ? dailyReminders : false, 
            ENABLE_WEEKLY_REPORTS ? weeklyReports : false
          );
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
    // Daily reminders disabled for MVP - this function is preserved for future use
    if (!ENABLE_DAILY_REMINDERS) return;
    
    setDailyReminders(enabled);
    if (notificationsEnabled) {
      // Weekly reports disabled for MVP - always pass false
      await updateNotificationPreferences(enabled, ENABLE_WEEKLY_REPORTS ? weeklyReports : false);
    }
  };

  const handleWeeklyReportsToggle = async (enabled: boolean) => {
    // Weekly reports disabled for MVP - this function is preserved for future use
    if (!ENABLE_WEEKLY_REPORTS) return;
    
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

  const handleDebugPress = () => {
    router.push('/(app)/debug');
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

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Excluir Conta',
      'Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão perdidos.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              // Primeiro, reautenticar o usuário
              const user = getAuth().currentUser;
              if (user) {
                // Verificar o provedor de autenticação do usuário
                const provider = user.providerData[0]?.providerId;

                if (provider === 'password') {
                  // Para autenticação por email/senha, solicitar senha novamente
                  prompt(
                    'Confirmar senha',
                    'Por favor, digite sua senha para confirmar a exclusão da conta',
                    [
                      { text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                      {
                        text: 'OK', onPress: async (password) => {
                          if (password) {
                            try {
                              // Criar credencial de email/senha
                              const credential = EmailAuthProvider.credential(
                                user.email || '',
                                password
                              );
                              // Reautenticar
                              await user.reauthenticateWithCredential(credential);
                              // Agora excluir a conta
                              const response = await api.deleteUserAccount(user.uid);
                              console.log("res==========>>>>>", response);
                              await user.delete();
                              Alert.alert('Sucesso', 'Sua conta foi excluída com sucesso.');
                            } catch (error) {
                              console.error('Erro na reautenticação:', error);
                              Alert.alert('Erro', 'Senha incorreta ou erro na autenticação. Tente novamente.');
                            }
                          }
                        },
                      },
                    ],


                    {
                      type: 'secure-text',
                      cancelable: true,
                      placeholder: 'password'
                    }
                  );
                } else if (provider === 'google.com') {
                  // Para autenticação Google, redirecionar para login Google
                  Alert.alert(
                    'Reautenticação necessária',
                    'Para excluir sua conta, você precisa fazer login novamente com Google.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Continuar',
                        onPress: async () => {
                          try {
                            await GoogleSignin.signOut();
                            const { data } = await GoogleSignin.signIn();
                            const credential = GoogleAuthProvider.credential(data?.idToken);
                            await reauthenticateWithCredential(user, credential);
                            const response = await api.deleteUserAccount(user.uid);
                            console.log("res==========>>>>>", response);
                            await user.delete();
                            Alert.alert('Sucesso', 'Conta Google excluída do Firebase.');
                          } catch (err) {
                            console.error(err);
                            Alert.alert('Erro', 'Não foi possível reautenticar com Google. Faça login novamente e tente.');
                          }
                        }
                      }
                    ]
                  );
                } else if (Platform.OS === 'ios') {
                  // Para outros provedores (Apple) - apenas no iOS
                  Alert.alert(
                    'Reautenticação necessária',
                    'Para excluir sua conta, você precisa fazer login novamente com Apple.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Continuar',
                        onPress: async () => {
                          try {
                            if (!appleAuth) {
                              Alert.alert('Erro', 'Apple Sign-In não está disponível nesta plataforma.');
                              return;
                            }
                            
                            // Start Apple sign-in request
                            const appleAuthRequestResponse = await appleAuth.performRequest({
                              requestedOperation: appleAuth.Operation.LOGIN,
                              requestedScopes: [appleAuth.Scope.FULL_NAME, appleAuth.Scope.EMAIL],
                            });

                            if (!appleAuthRequestResponse.identityToken) {
                              Alert.alert('Erro', 'Não foi possível obter token de login do Apple.');
                              return;
                            }

                            // Get token + nonce
                            const { identityToken, nonce } = appleAuthRequestResponse;

                            // Create Firebase credential
                            const provider = new OAuthProvider("apple.com");
                            const credential = provider.credential({
                              idToken: identityToken,
                              rawNonce: nonce, // optional but recommended
                            });

                            const user = getAuth().currentUser;
                            if (!user) return;

                            // Reauthenticate with Apple
                            await reauthenticateWithCredential(user, credential);

                            const response = await api.deleteUserAccount(user.uid);
                            console.log("res==========>>>>>", response);
                            // Delete account
                            await user.delete();

                            Alert.alert('Sucesso', 'Conta Apple excluída do Firebase.');
                          } catch (err) {
                            console.error("Erro Apple delete:", err);
                            Alert.alert(
                              'Erro',
                              'Não foi possível reautenticar com Apple. Faça login novamente e tente.'
                            );
                          }
                        }
                      }
                    ]
                  );
                } else {
                  // Para outras plataformas que não suportam Apple Sign-In
                  Alert.alert(
                    'Reautenticação necessária',
                    'Para excluir sua conta, você precisa fazer login novamente.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      {
                        text: 'Continuar',
                        onPress: async () => {
                          Alert.alert('Erro', 'Esta funcionalidade não está disponível nesta plataforma.');
                        }
                      }
                    ]
                  );
                }
              }
            } catch (error) {
              console.error('Erro ao excluir conta:', error);
              Alert.alert(
                'Erro',
                'Não foi possível excluir sua conta. Por favor, faça login novamente e tente outra vez.',
                [{ text: 'OK' }]
              );
            }
          }
        }
      ]
    );
  };

  return (
    <BottomSheetModalProvider>
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          style={[styles.scrollView, { paddingTop: Platform.OS === 'android' ? 0 : 40 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Main Title - Left aligned and lower */}
          <Text style={styles.mainTitle}>Ajustes</Text>


          {/* Notifications Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notificações</Text>
            <View style={styles.card}>
              {/* Push Notifications Toggle */}
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <Icon name="notifications-outline" style={styles.settingIcon} />
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

              {/* Daily Reminders Toggle - HIDDEN FOR MVP */}
              {/* TODO: Re-enable when daily reminders feature is ready for production */}
              {ENABLE_DAILY_REMINDERS && (
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
              )}

              {/* Weekly Reports Toggle - HIDDEN FOR MVP */}
              {/* TODO: Re-enable when weekly reports feature is ready for production */}
              {ENABLE_WEEKLY_REPORTS && notificationsEnabled && (
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
                  <Icon name="pause-circle-outline" style={styles.settingIcon} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingLabel}>Pausar Notificações</Text>
                    <Text style={styles.settingSubtext}>Pausar temporariamente</Text>
                  </View>
                  <Icon name="chevron-forward" size={16} color="rgba(31,41,55,0.35)" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* General Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Geral</Text>
            <View style={styles.card}>
              <TouchableOpacity 
                style={styles.actionRow}
                onPress={() => languageBottomSheetRef.current?.present()}
              >
                <Icon name="globe-outline" style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Idioma</Text>
                  <Text style={styles.actionValue}>Português (BR)</Text>
                </View>
                <Icon name="chevron-forward" size={16} color="rgba(31,41,55,0.35)" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.actionRow}
                onPress={() => subscriptionBottomSheetRef.current?.present()}
              >
                <Icon name="card-outline" style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Gerenciar Assinatura</Text>
                  <Text style={styles.actionSubtext}>Configurar pagamentos e planos</Text>
                </View>
                <Icon name="chevron-forward" size={16} color="rgba(31,41,55,0.35)" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={handlePrivacyPress}>
                <Icon name="shield-outline" style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Privacidade</Text>
                  <Text style={styles.actionSubtext}>Configurações de privacidade e dados</Text>
                </View>
                <Icon name="chevron-forward" size={16} color="rgba(31,41,55,0.35)" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionRow} onPress={handleHelpPress}>
                <Icon name="help-circle-outline" style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Ajuda</Text>
                  <Text style={styles.actionSubtext}>Suporte e documentação</Text>
                </View>
                <Icon name="chevron-forward" size={16} color="rgba(31,41,55,0.35)" />
              </TouchableOpacity>

              {/* 
              TODO: Re-enable with Firebase Remote Config feature flag after launch
              Debug Screen - Available for testing backend connectivity 
              <TouchableOpacity style={styles.actionRow} onPress={handleDebugPress}>
                <Icon name="bug-outline" style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={styles.actionLabel}>Debug Backend</Text>
                  <Text style={styles.actionSubtext}>Diagnosticar problemas de conectividade</Text>
                </View>
                <Icon name="chevron-forward" size={16} color="rgba(31,41,55,0.35)" />
              </TouchableOpacity>
              */}

              <TouchableOpacity style={[styles.actionRow, styles.lastRow]} onPress={handleLogout}>
                <Icon name="log-out-outline" style={styles.actionIcon} />
                <View style={styles.actionText}>
                  <Text style={[styles.actionLabel, styles.logoutText]}>Sair da conta</Text>
                  <Text style={styles.actionSubtext}>Fazer logout da sua conta</Text>
                </View>
                <Icon name="chevron-forward" size={16} color="rgba(31,41,55,0.35)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Delete Account Section */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.deleteAccountCard} onPress={handleDeleteAccount}>
              <Icon name="trash-outline" color="#FF3B30" style={styles.deleteIcon} />
              <Text style={styles.deleteAccountText}>Excluir conta</Text>
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerTitle}>ForkFit</Text>
            <View style={styles.versionContainer}>
              {versionInfo.buildTag && (
                <View style={[
                  styles.buildTag,
                  versionInfo.buildType === 'development' ? styles.devTag : styles.previewTag
                ]}>
                  <Text style={styles.buildTagText}>{versionInfo.buildTag}</Text>
                </View>
              )}
              <Text style={styles.footerVersion}>{versionInfo.displayVersion}</Text>
            </View>
            <Text style={styles.footerBuildNumber}>Build: {versionInfo.buildVersion}</Text>
            <Text style={styles.footerCopyright}>© 2025 ForkFit. Todos os direitos reservados.</Text>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Sheets */}
      <PrivacyBottomSheet ref={privacyBottomSheetRef} />
      <HelpBottomSheet ref={helpBottomSheetRef} />
      <SubscriptionBottomSheet ref={subscriptionBottomSheetRef} />
      <LanguageBottomSheet ref={languageBottomSheetRef} />
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
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },


  // Setting Row Styles
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CARD_PADDING,
    minHeight: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31,41,55,0.08)',
    marginLeft: 0,
  },
  settingInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 12,
    width: ICON_SIZE,
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
    padding: CARD_PADDING,
    minHeight: ROW_HEIGHT,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(31,41,55,0.08)',
    marginLeft: 0,
  },
  actionIcon: {
    marginRight: 12,
    width: ICON_SIZE,
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
  logoutText: {
    color: ICON_COLOR_ACCENT,
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

  // Delete Account Section
  deleteAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    padding: CARD_PADDING,
    minHeight: ROW_HEIGHT,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  deleteIcon: {
    marginRight: 12,
    width: ICON_SIZE,
  },
  deleteAccountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
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
  versionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  buildTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  devTag: {
    backgroundColor: '#FF6B6B', // Red for dev
  },
  previewTag: {
    backgroundColor: '#4ECDC4', // Teal for preview
  },
  buildTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  footerVersion: {
    fontSize: 14,
    color: TEXT_LIGHT,
  },
  footerBuildNumber: {
    fontSize: 12,
    color: TEXT_LIGHT,
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 12,
    color: TEXT_LIGHT,
    textAlign: 'center',
  },
});
