
import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/contexts/AuthContext';

export default function Dashboard() {
  const { user, backendUser } = useAuth();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const today = new Date();
    const dateString = today.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    setCurrentDate(dateString.charAt(0).toUpperCase() + dateString.slice(1));
  }, []);

  const StatCard = ({ icon, title, value, unit, color }: {
    icon: string;
    title: string;
    value: string | number;
    unit: string;
    color: string;
  }) => (
    <View style={styles.statCard}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon as any} size={20} color="#FFF" />
      </View>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>
        {value}
        <Text style={styles.statUnit}> {unit}</Text>
      </Text>
    </View>
  );

  const QuickAction = ({ icon, title, onPress }: {
    icon: string;
    title: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.quickAction} onPress={onPress}>
      <View style={styles.quickActionIcon}>
        <Ionicons name={icon as any} size={24} color="#FF725E" />
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, {user?.displayName || 'Usuário'}!</Text>
            <Text style={styles.date}>{currentDate}</Text>
          </View>
          <TouchableOpacity style={styles.profileButton}>
            <Ionicons name="person-circle" size={32} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Today's Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Resumo de Hoje</Text>
          <View style={styles.statsGrid}>
            <StatCard
              icon="flame"
              title="Calorias"
              value={backendUser?.calories || 0}
              unit="kcal"
              color="#FF725E"
            />
            <StatCard
              icon="fitness"
              title="Proteína"
              value={backendUser?.protein || 0}
              unit="g"
              color="#4CAF50"
            />
            <StatCard
              icon="nutrition"
              title="Carboidratos"
              value={backendUser?.carbs || 0}
              unit="g"
              color="#2196F3"
            />
            <StatCard
              icon="water"
              title="Gordura"
              value={backendUser?.fat || 0}
              unit="g"
              color="#FF9800"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações Rápidas</Text>
          <View style={styles.quickActionsGrid}>
            <QuickAction
              icon="camera"
              title="Fotografar Refeição"
              onPress={() => {
                // TODO: Implement meal photo capture
              }}
            />
            <QuickAction
              icon="add-circle"
              title="Adicionar Alimento"
              onPress={() => {
                // TODO: Implement manual food entry
              }}
            />
            <QuickAction
              icon="barbell"
              title="Registrar Treino"
              onPress={() => {
                // TODO: Implement workout logging
              }}
            />
            <QuickAction
              icon="analytics"
              title="Ver Relatórios"
              onPress={() => {
                // TODO: Navigate to reports
              }}
            />
          </View>
        </View>

        {/* Recent Meals */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Refeições Recentes</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>Ver todas</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.emptyState}>
            <Ionicons name="restaurant" size={48} color="#CCC" />
            <Text style={styles.emptyStateText}>Nenhuma refeição registrada hoje</Text>
            <Text style={styles.emptyStateSubtext}>
              Comece fotografando sua próxima refeição!
            </Text>
          </View>
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
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF8F6',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: '#FFF8F6',
    opacity: 0.8,
  },
  profileButton: {
    padding: 4,
  },
  section: {
    margin: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#FF725E',
    fontSize: 14,
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statTitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  statUnit: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    width: '48%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF8F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1F2937',
    textAlign: 'center',
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
