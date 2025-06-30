import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/Ionicons';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { MacroProgress } from '../../components/MacroProgress';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';

const MEAL_TYPES = [
  'Café da Manhã',
  'Lanche da Manhã',
  'Almoço',
  'Lanche da Tarde',
  'Lanche',
  'Jantar',
  'Ceia',
];

// Mock user and food logs for now
const mockUser = {
  calories: 1673,
  protein: 142,
  carbs: 225,
  fat: 48,
};
const mockFoodLogs: any[] = [];

function MealSection({ title, calories, foods, onAddFood }: { title: string; calories: number; foods: any[]; onAddFood: () => void }) {
  return (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealCalories}>{calories} kcal</Text>
      </View>
      {foods.length === 0 && (
        <Text style={styles.noFoodText}>Nenhum alimento registrado</Text>
      )}
      <TouchableOpacity style={styles.addFoodButton} onPress={onAddFood}>
        <Icon name="add" size={16} color="#64748b" />
        <Text style={styles.addFoodText}>Adicionar alimento</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.aiButton}>
        <Text style={styles.aiButtonText}>🤖 Análise por IA</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DashboardScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addFoodVisible, setAddFoodVisible] = useState(false);
  // For now, use mock data
  const user = mockUser;
  const foodLogs = mockFoodLogs;

  // Workaround: use only (date, formatString) for now
  const formattedDate = format(currentDate, 'dd MMM');
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  // Calculate totals (mock)
  const totals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const targets = {
    calories: user.calories,
    protein: user.protein,
    carbs: user.carbs,
    fat: user.fat,
  };
  const remainingCalories = targets.calories - totals.calories;

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  const handleNextDay = () => {
    if (!isToday) {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() + 1);
      setCurrentDate(newDate);
    }
  };

  // Handlers for modal options (mock for now)
  const handleOption = (option: string) => {
    setAddFoodVisible(false);
    // TODO: Open respective sub-modal or screen
    alert(`Selecionado: ${option}`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      {/* Header with gradient, covering safe area */}
      <LinearGradient
        colors={["#FF725E", "#FF8A50"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 16,
          paddingTop: 0,
          paddingBottom: 28,
          borderBottomLeftRadius: 24,
          borderBottomRightRadius: 24,
          minHeight: 120,
        }}
      >
        <SafeAreaViewContext edges={['top']} style={{ backgroundColor: 'transparent' }}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text style={styles.appTitle}>ForkFit</Text>
              <Icon name="restaurant" size={22} color="#fff" style={styles.titleIcon} />
            </View>
            <TouchableOpacity style={styles.notificationButton}>
              <Icon name="notifications-outline" size={26} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaViewContext>
      </LinearGradient>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Date Selector */}
        <View style={[styles.dateCard, { marginTop: 16 }]}>
          <TouchableOpacity onPress={handlePreviousDay} style={styles.dateButton}>
            <Icon name="chevron-back" size={22} color="#FF725E" />
          </TouchableOpacity>
          <View style={styles.dateInfo}>
            <Text style={styles.dayText}>{isToday ? 'Hoje' : format(currentDate, 'EEEE')}</Text>
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <TouchableOpacity onPress={handleNextDay} style={[styles.dateButton, isToday && styles.disabledButton]} disabled={isToday}>
            <Icon name="chevron-forward" size={22} color={isToday ? '#ccc' : '#FF725E'} />
          </TouchableOpacity>
        </View>
        {/* Progress Summary */}
        <View style={styles.progressCard}>
          <Text style={styles.cardTitle}>Resumo Diário</Text>
          <View style={styles.caloriesSection}>
            <View style={styles.progressRing}>
              <View style={styles.caloriesCenter}>
                <View style={styles.caloriesRow}>
                  <Icon name="flame" size={30} color="#f97316" />
                  <Text style={styles.caloriesNumber}>{totals.calories}</Text>
                </View>
                <Text style={styles.caloriesTarget}>/ {targets.calories} kcal</Text>
              </View>
            </View>
            <View style={styles.restanteBadge}>
              <Text style={styles.restanteText}>
                Restante: <Text style={styles.restanteNumber}>{remainingCalories} kcal</Text>
              </Text>
            </View>
          </View>
          <View style={styles.macrosGrid}>
            <MacroProgress label="Proteína" current={totals.protein} target={targets.protein} unit="g" color="#3b82f6" />
            <MacroProgress label="Carbs" current={totals.carbs} target={targets.carbs} unit="g" color="#f97316" />
            <MacroProgress label="Gordura" current={totals.fat} target={targets.fat} unit="g" color="#ef4444" />
          </View>
        </View>
        {/* Meals Section */}
        <View style={styles.mealsContainer}>
          <Text style={styles.mealsTitle}>Refeições de {isToday ? 'Hoje' : format(currentDate, "dd 'de' MMMM")}</Text>
          {MEAL_TYPES.map((mealType) => (
            <MealSection
              key={mealType}
              title={mealType}
              calories={0}
              foods={[]}
              onAddFood={() => {}}
            />
          ))}
        </View>
      </ScrollView>
      {/* Floating Add Button */}
      <TouchableOpacity style={styles.fab} onPress={() => setAddFoodVisible(true)}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
      {/* Add Food Bottom Sheet Modal */}
      <Modal
        isVisible={addFoodVisible}
        onBackdropPress={() => setAddFoodVisible(false)}
        onSwipeComplete={() => setAddFoodVisible(false)}
        swipeDirection={["down"]}
        style={styles.bottomModal}
        backdropOpacity={0.4}
      >
        <View style={styles.sheetContainer}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Adicionar Alimento</Text>
            <TouchableOpacity onPress={() => setAddFoodVisible(false)}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.sheetOptionsGrid}>
            <TouchableOpacity style={styles.sheetOption} onPress={() => handleOption('manual')}>
              <Icon name="create-outline" size={32} color="#FF725E" />
              <Text style={styles.sheetOptionText}>Entrada manual</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={() => handleOption('recentes')}>
              <Icon name="time-outline" size={32} color="#FF725E" />
              <Text style={styles.sheetOptionText}>Refeições recentes</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={() => handleOption('salvos')}>
              <Icon name="star-outline" size={32} color="#FF725E" />
              <Text style={styles.sheetOptionText}>Alimentos salvos</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sheetOption} onPress={() => handleOption('banco')}>
              <Icon name="search-outline" size={32} color="#FF725E" />
              <Text style={styles.sheetOptionText}>Banco de alimentos</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.sheetAIButton} onPress={() => handleOption('ai')}>
            <Text style={styles.sheetAIButtonText}>🤖 Análise por IA</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8F6',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 28,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  titleIcon: {
    marginLeft: 4,
  },
  notificationButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
  },
  dateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 18,
    marginHorizontal: 18,
    marginTop: -32,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  dateButton: {
    padding: 8,
    borderRadius: 20,
  },
  disabledButton: {
    opacity: 0.5,
  },
  dateInfo: {
    alignItems: 'center',
  },
  dayText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textTransform: 'capitalize',
  },
  dateText: {
    fontSize: 15,
    color: '#64748b',
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 18,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#1e293b',
  },
  caloriesSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  progressRing: {
    width: 170,
    height: 170,
    borderRadius: 85,
    borderWidth: 10,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  caloriesCenter: {
    alignItems: 'center',
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  caloriesNumber: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#1e293b',
    marginLeft: 8,
  },
  caloriesTarget: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  restanteBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 14,
    marginTop: 6,
  },
  restanteText: {
    fontSize: 16,
    color: '#475569',
  },
  restanteNumber: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#1e293b',
  },
  macrosGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  mealsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mealsTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#1e293b',
  },
  mealSection: {
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  mealCalories: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  noFoodText: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 8,
  },
  addFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  addFoodText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  aiButton: {
    paddingVertical: 12,
    backgroundColor: '#FF725E',
    borderRadius: 8,
    alignItems: 'center',
  },
  aiButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FF725E',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  sheetContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  sheetOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  sheetOption: {
    width: '47%',
    backgroundColor: '#FFF8F6',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sheetOptionText: {
    marginTop: 8,
    fontSize: 15,
    color: '#1e293b',
    fontWeight: '500',
    textAlign: 'center',
  },
  sheetAIButton: {
    backgroundColor: '#FF725E',
    borderRadius: 8,
    alignItems: 'center',
    paddingVertical: 14,
    marginTop: 8,
  },
  sheetAIButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});