
<old_str>import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function Settings() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>App settings screen</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});</old_str>
<new_str>import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  ScrollView,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function Settings() {
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace('/auth/login');
            } catch (error) {
              console.error('Erro ao sair:', error);
              Alert.alert('Erro', 'Não foi possível sair da conta');
            }
          },
        },
      ]
    );
  };

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    showArrow = true,
    destructive = false 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    destructive?: boolean;
  }) => (
    <TouchableOpacity 
      style={styles.settingsItem} 
      onPress={onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.iconContainer, destructive && styles.iconContainerDestructive]}>
          <Ionicons 
            name={icon as any} 
            size={20} 
            color={destructive ? '#FF3B30' : '#666'} 
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.settingsTitle, destructive && styles.destructiveText]}>
            {title}
          </Text>
          {subtitle && (
            <Text style={styles.settingsSubtitle}>{subtitle}</Text>
          )}
        </View>
      </View>
      {showArrow && (
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color="#999" 
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Ajustes</Text>
        </View>

        {/* User Info */}
        <View style={styles.section}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={24} color="#666" />
            </View>
            <View style={styles.userDetails}>
              <Text style={styles.userName}>
                {user?.displayName || 'Usuário'}
              </Text>
              <Text style={styles.userEmail}>
                {user?.email}
              </Text>
            </View>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          <SettingsItem
            icon="person-outline"
            title="Perfil"
            subtitle="Editar informações pessoais"
            onPress={() => {
              // TODO: Navigate to profile edit screen
              Alert.alert('Em breve', 'Funcionalidade em desenvolvimento');
            }}
          />
          <SettingsItem
            icon="lock-closed-outline"
            title="Privacidade"
            subtitle="Configurações de privacidade"
            onPress={() => {
              Alert.alert('Em breve', 'Funcionalidade em desenvolvimento');
            }}
          />
        </View>

        {/* App Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aplicativo</Text>
          <SettingsItem
            icon="notifications-outline"
            title="Notificações"
            subtitle="Gerenciar notificações"
            onPress={() => {
              Alert.alert('Em breve', 'Funcionalidade em desenvolvimento');
            }}
          />
          <SettingsItem
            icon="language-outline"
            title="Idioma"
            subtitle="Português (Brasil)"
            onPress={() => {
              Alert.alert('Em breve', 'Funcionalidade em desenvolvimento');
            }}
          />
          <SettingsItem
            icon="help-outline"
            title="Ajuda e Suporte"
            subtitle="Central de ajuda"
            onPress={() => {
              Alert.alert('Em breve', 'Funcionalidade em desenvolvimento');
            }}
          />
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <SettingsItem
            icon="log-out-outline"
            title="Sair"
            onPress={handleLogout}
            showArrow={false}
            destructive={true}
          />
        </View>

        {/* App Version */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>ForkFit v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF725E',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF8F6',
  },
  section: {
    marginTop: 20,
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
    marginTop: 16,
    marginHorizontal: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  iconContainerDestructive: {
    backgroundColor: '#FFE5E5',
  },
  textContainer: {
    flex: 1,
  },
  settingsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 2,
  },
  destructiveText: {
    color: '#FF3B30',
  },
  settingsSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  versionSection: {
    padding: 20,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
  },
});</new_str>
