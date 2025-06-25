import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';
import { router } from 'expo-router';

export default function Settings() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  /** Logout handler -------------------------------------------------- */
  const handleLogout = useCallback(() => {
    if (loading) return; // avoid double-tap

    Alert.alert('Sair', 'Tem certeza que deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            await signOut(); // <- Firebase sign-out in AuthContext

            /*  Clear the whole navigation stack so Back-gesture won’t
                bring the user to a protected route, then push login.   */
            router.reset({
              index: 0,
              routes: [{ name: '/auth/login' }], // <- adjust to your login route
            });
          } catch (err) {
            console.error('logout error →', err);
            Alert.alert('Erro', 'Não foi possível sair da conta.');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  }, [loading, signOut]);

  /** ---------------------------------------------------------------- */
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollArea}>
        {/* HEADER */}
        <View style={styles.header}>
          <Text style={styles.title}>Ajustes</Text>
          <Text style={styles.subtitle}>Configurações da conta</Text>
        </View>

        {/* ACCOUNT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>

          <View style={styles.userInfo}>
            <Ionicons name="person-circle-outline" size={24} color="#666" />
            <View style={styles.userDetails}>
              <Text style={styles.userEmail}>{user?.email ?? '—'}</Text>
              <Text style={styles.userStatus}>Conta ativa</Text>
            </View>
          </View>

          <MenuItem icon="person-outline" label="Editar Perfil" />
          <MenuItem icon="notifications-outline" label="Notificações" />
          <MenuItem icon="lock-closed-outline" label="Privacidade" />
        </View>

        {/* SUPPORT SECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          <MenuItem icon="help-circle-outline" label="Central de Ajuda" />
          <MenuItem icon="mail-outline" label="Fale Conosco" />
        </View>

        {/* LOG-OUT */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FF6B6B" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
                <Text style={styles.logoutText}>Sair da Conta</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.version}>ForkFit v1.0.0</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- tiny helper for the menu rows ---------- */
function MenuItem({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <TouchableOpacity style={styles.menuItem}>
      <Ionicons name={icon} size={20} color="#666" />
      <Text style={styles.menuText}>{label}</Text>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );
}

/* ---------- styles ---------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scrollArea: { paddingBottom: 32 },
  header: { padding: 20, paddingTop: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 },
  subtitle: { fontSize: 16, color: '#666' },

  section: {
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },

  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  userDetails: { marginLeft: 12, flex: 1 },
  userEmail: { fontSize: 16, fontWeight: '500', color: '#1F2937' },
  userStatus: { fontSize: 14, color: '#10B981', marginTop: 2 },

  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuText: { fontSize: 16, color: '#1F2937', marginLeft: 12, flex: 1 },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    justifyContent: 'center',
  },
  logoutText: {
    fontSize: 16,
    color: '#FF6B6B',
    fontWeight: '500',
    marginLeft: 8,
  },

  footer: { alignItems: 'center', paddingVertical: 20 },
  version: { fontSize: 14, color: '#999' },
});
