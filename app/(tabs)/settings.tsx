import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Platform } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';

const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

export default function SettingsScreen() {
  const [dailyReminders, setDailyReminders] = useState(true);
  const [weeklyReports, setWeeklyReports] = useState(true);

  return (
    <View style={{ flex: 1, backgroundColor: OFF_WHITE }}>
      {/* Coral Bar */}
      <View style={styles.coralBar} />
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} style={{ flex: 1 }}>
        {/* Big Title */}
        <Text style={styles.title}>Ajustes</Text>
        {/* Plano Gratuito Card */}
        <View style={styles.planCard}>
          <Text style={styles.planTitle}>Plano Gratuito</Text>
          <Text style={styles.planDesc}>Ainda não lançamos nosso plano premium. Continue usando gratuitamente e fique ligado para nosso lançamento oficial.</Text>
        </View>
        {/* Notificações Section */}
        <Text style={styles.sectionTitle}>Notificações</Text>
        <View style={styles.notifyCard}>
          <View style={styles.notifyRow}>
            <FontAwesome6 name="bell" size={20} color={CORAL} style={{ marginRight: 12 }} />
            <Text style={styles.notifyLabel}>Lembretes diários</Text>
            <View style={{ flex: 1 }} />
            <Switch
              value={dailyReminders}
              onValueChange={setDailyReminders}
              trackColor={{ false: '#eee', true: CORAL }}
              thumbColor={Platform.OS === 'android' ? (dailyReminders ? '#fff' : '#ccc') : ''}
            />
          </View>
          <View style={styles.notifyRow}>
            <FontAwesome6 name="bell" size={20} color={CORAL} style={{ marginRight: 12 }} />
            <Text style={styles.notifyLabel}>Relatórios semanais</Text>
            <View style={{ flex: 1 }} />
            <Switch
              value={weeklyReports}
              onValueChange={setWeeklyReports}
              trackColor={{ false: '#eee', true: CORAL }}
              thumbColor={Platform.OS === 'android' ? (weeklyReports ? '#fff' : '#ccc') : ''}
            />
          </View>
        </View>
        {/* Geral Section */}
        <Text style={styles.sectionTitle}>Geral</Text>
        <View style={styles.generalCard}>
          <TouchableOpacity style={styles.generalRow}>
            <FontAwesome6 name="globe" size={20} color={TEXT} style={{ marginRight: 14 }} />
            <Text style={styles.generalLabel}>Idioma</Text>
            <View style={{ flex: 1 }} />
            <Text style={styles.generalValue}>Português (BR)</Text>
            <FontAwesome6 name="chevron-right" size={16} color="#A0AEC0" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.generalRow}>
            <FontAwesome6 name="credit-card" size={20} color={TEXT} style={{ marginRight: 14 }} />
            <Text style={styles.generalLabel}>Gerenciar Assinatura</Text>
            <View style={{ flex: 1 }} />
            <FontAwesome6 name="chevron-right" size={16} color="#A0AEC0" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.generalRow}>
            <FontAwesome6 name="shield-halved" size={20} color={TEXT} style={{ marginRight: 14 }} />
            <Text style={styles.generalLabel}>Privacidade</Text>
            <View style={{ flex: 1 }} />
            <FontAwesome6 name="chevron-right" size={16} color="#A0AEC0" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.generalRow}>
            <FontAwesome6 name="circle-question" size={20} color={TEXT} style={{ marginRight: 14 }} />
            <Text style={styles.generalLabel}>Ajuda</Text>
            <View style={{ flex: 1 }} />
            <FontAwesome6 name="chevron-right" size={16} color="#A0AEC0" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutRow}>
            <FontAwesome6 name="arrow-right-from-bracket" size={18} color={CORAL} style={{ marginRight: 10 }} />
            <Text style={styles.logoutText}>Sair da conta</Text>
          </TouchableOpacity>
        </View>
        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>ForkFit v0.1.0</Text>
          <Text style={styles.footerTextSmall}>© 2025 ForkFit. Todos os direitos reservados.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  coralBar: {
    height: 64,
    backgroundColor: CORAL,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT,
    marginTop: 72,
    marginBottom: 12,
    marginLeft: 18,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 16,
  },
  planTitle: {
    fontWeight: 'bold',
    color: TEXT,
    fontSize: 17,
    marginBottom: 2,
  },
  planDesc: {
    color: '#64748b',
    fontSize: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: TEXT,
    fontSize: 18,
    marginLeft: 18,
    marginBottom: 8,
  },
  notifyCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 8,
  },
  notifyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0DA',
  },
  notifyLabel: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '500',
  },
  generalCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginHorizontal: 18,
    marginBottom: 18,
    paddingVertical: 0,
  },
  generalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0DA',
  },
  generalLabel: {
    color: TEXT,
    fontSize: 16,
    fontWeight: '500',
  },
  generalValue: {
    color: '#64748b',
    fontSize: 15,
    fontWeight: '500',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
  },
  logoutText: {
    color: CORAL,
    fontWeight: 'bold',
    fontSize: 15,
  },
  footer: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  footerText: {
    color: '#A0AEC0',
    fontSize: 14,
    marginBottom: 2,
  },
  footerTextSmall: {
    color: '#A0AEC0',
    fontSize: 12,
  },
});