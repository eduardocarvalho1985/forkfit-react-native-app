import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
} from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome6 } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { MacroProgress } from '../../components/MacroProgress';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { FoodEditModal } from '../../components/FoodEditModal';
import Svg, { Circle } from 'react-native-svg';

const MEAL_TYPES = [
  'Café da Manhã',
  'Lanche da Manhã',
  'Almoço',
  'Lanche da Tarde',
  'Lanche',
  'Jantar',
  'Ceia',
];

const MEAL_OPTIONS = MEAL_TYPES.map(m => ({ value: m, label: m }));

// Mock food database
const MOCK_FOOD_DATABASE = [
  { id: 1, name: 'Arroz Branco', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, category: 'Grãos' },
  { id: 2, name: 'Frango Grelhado', calories: 165, protein: 31, carbs: 0, fat: 3.6, category: 'Proteínas' },
  { id: 3, name: 'Brócolis', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, category: 'Vegetais' },
  { id: 4, name: 'Ovo Cozido', calories: 155, protein: 13, carbs: 1.1, fat: 11, category: 'Proteínas' },
  { id: 5, name: 'Aveia', calories: 389, protein: 17, carbs: 66, fat: 7, category: 'Grãos' },
  { id: 6, name: 'Banana', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, category: 'Frutas' },
  { id: 7, name: 'Leite Desnatado', calories: 42, protein: 3.4, carbs: 5, fat: 0.1, category: 'Laticínios' },
  { id: 8, name: 'Pão Integral', calories: 247, protein: 13, carbs: 41, fat: 4.2, category: 'Grãos' },
  { id: 9, name: 'Salmão', calories: 208, protein: 25, carbs: 0, fat: 12, category: 'Proteínas' },
  { id: 10, name: 'Batata Doce', calories: 86, protein: 1.6, carbs: 20, fat: 0.1, category: 'Vegetais' },
];

// Mock user data
const mockUser = {
  calories: 2000,
  protein: 150,
  carbs: 250,
  fat: 65,
};

interface FoodLog {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  mealType: string;
  date: string;
}

interface FoodItem {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

function MealSection({ 
  title, 
  calories, 
  foods, 
  onAddFood, 
  onEditFood 
}: { 
  title: string; 
  calories: number; 
  foods: FoodLog[]; 
  onAddFood: () => void;
  onEditFood: (food: FoodLog) => void;
}) {
  return (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <Text style={styles.mealTitle}>{title}</Text>
        <Text style={styles.mealCalories}>{calories} kcal</Text>
      </View>
      
      {foods.length === 0 ? (
        <Text style={styles.noFoodText}>Nenhum alimento registrado</Text>
      ) : (
        <View style={styles.foodList}>
          {foods.map((food) => (
            <TouchableOpacity 
              key={food.id} 
              style={styles.foodMiniCard}
              onPress={() => onEditFood(food)}
              activeOpacity={0.85}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.foodMiniCardName}>{food.name}</Text>
                <Text style={styles.foodMiniCardQty}>{food.quantity} {food.unit}</Text>
                <View style={styles.foodMiniCardMacrosRow}>
                  <View style={styles.foodMacroItem}>
                    <FontAwesome6 name="fire-flame-curved" size={18} color="#FF725E" />
                    <Text style={styles.foodMacroValue}>{food.calories}</Text>
                  </View>
                  <View style={styles.foodMacroItem}>
                    <FontAwesome6 name="drumstick-bite" size={18} color="#3b82f6" />
                    <Text style={styles.foodMacroValue}>{food.protein}g</Text>
                  </View>
                  <View style={styles.foodMacroItem}>
                    <FontAwesome6 name="wheat-awn" size={18} color="#FFA28F" />
                    <Text style={styles.foodMacroValue}>{food.carbs}g</Text>
                  </View>
                  <View style={styles.foodMacroItem}>
                    <FontAwesome6 name="bottle-droplet" size={18} color="#ef4444" />
                    <Text style={styles.foodMacroValue}>{food.fat}g</Text>
                  </View>
                </View>
              </View>
              <Icon name="chevron-forward" size={22} color="#A0AEC0" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          ))}
        </View>
      )}
      
      <TouchableOpacity style={styles.addFoodButton} onPress={onAddFood}>
        <Icon name="add" size={16} color="#64748b" />
        <Text style={styles.addFoodText}>Adicionar alimento</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function DashboardScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [addFoodVisible, setAddFoodVisible] = useState(false);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([
    // Sample data for testing
    {
      id: '1',
      name: 'Aveia',
      quantity: 50,
      unit: 'g',
      calories: 195,
      protein: 8.5,
      carbs: 33,
      fat: 3.5,
      mealType: 'Café da Manhã',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
    {
      id: '2',
      name: 'Banana',
      quantity: 100,
      unit: 'g',
      calories: 89,
      protein: 1.1,
      carbs: 23,
      fat: 0.3,
      mealType: 'Café da Manhã',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
    {
      id: '3',
      name: 'Frango Grelhado',
      quantity: 150,
      unit: 'g',
      calories: 248,
      protein: 46.5,
      carbs: 0,
      fat: 5.4,
      mealType: 'Almoço',
      date: format(new Date(), 'yyyy-MM-dd'),
    },
  ]);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [quantityModalVisible, setQuantityModalVisible] = useState(false);
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [foodQuantity, setFoodQuantity] = useState('100');
  const [foodUnit, setFoodUnit] = useState('g');
  const [foodEditModalVisible, setFoodEditModalVisible] = useState(false);
  const [foodEditInitialData, setFoodEditInitialData] = useState<any>(null);

  // Format date for display
  const formattedDate = format(currentDate, 'dd MMM');
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Calculate totals for current date
  const totals = foodLogs.reduce((acc, food) => ({
    calories: acc.calories + food.calories,
    protein: acc.protein + food.protein,
    carbs: acc.carbs + food.carbs,
    fat: acc.fat + food.fat,
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const targets = {
    calories: mockUser.calories,
    protein: mockUser.protein,
    carbs: mockUser.carbs,
    fat: mockUser.fat,
  };
  
  const remainingCalories = targets.calories - totals.calories;

  // Get foods for each meal type
  const getFoodsForMeal = (mealType: string) => {
    return foodLogs.filter(food => food.mealType === mealType);
  };

  const getCaloriesForMeal = (mealType: string) => {
    return getFoodsForMeal(mealType).reduce((sum, food) => sum + food.calories, 0);
  };

  // Navigation handlers
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

  // Food management handlers
  const handleOption = (option: string) => {
    setAddFoodVisible(false);
    
    switch (option) {
      case 'manual':
        Alert.alert('Entrada Manual', 'Funcionalidade em desenvolvimento');
        break;
      case 'recentes':
        Alert.alert('Refeições Recentes', 'Funcionalidade em desenvolvimento');
        break;
      case 'salvos':
        Alert.alert('Alimentos Salvos', 'Funcionalidade em desenvolvimento');
        break;
      case 'banco':
        setSearchModalVisible(true);
        break;
      case 'ai':
        Alert.alert('Análise por IA', 'Funcionalidade em desenvolvimento');
        break;
    }
  };

  const handleAddFoodToMeal = (mealType: string) => {
    setSelectedMealType(mealType);
    setAddFoodVisible(true);
  };

  const handleSearchFood = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = MOCK_FOOD_DATABASE.filter(food =>
        food.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredFoods(filtered);
    } else {
      setFilteredFoods([]);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setSearchModalVisible(false);
    setQuantityModalVisible(true);
  };

  const handleConfirmQuantity = () => {
    if (!selectedFood || !selectedMealType) return;

    const quantity = parseFloat(foodQuantity);
    const unit = foodUnit;
    
    // Calculate macros based on quantity (assuming 100g base)
    const multiplier = quantity / 100;
    
    const newFoodLog: FoodLog = {
      id: Date.now().toString(),
      name: selectedFood.name,
      quantity: quantity,
      unit: unit,
      calories: Math.round(selectedFood.calories * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carbs: Math.round(selectedFood.carbs * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * multiplier * 10) / 10,
      mealType: selectedMealType,
      date: dateKey,
    };

    setFoodLogs(prev => [...prev, newFoodLog]);
    setQuantityModalVisible(false);
    setSelectedFood(null);
    setFoodQuantity('100');
    setFoodUnit('g');
    
    Alert.alert('Sucesso!', `${selectedFood.name} adicionado ao ${selectedMealType}`);
  };

  const handleEditFood = (food: FoodLog) => {
    Alert.alert(
      'Editar Alimento',
      `Deseja editar ou remover "${food.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Remover', 
          style: 'destructive',
          onPress: () => {
            setFoodLogs(prev => prev.filter(f => f.id !== food.id));
            Alert.alert('Removido', 'Alimento removido com sucesso');
          }
        },
        { 
          text: 'Editar', 
          onPress: () => {
            // For now, just show current values
            Alert.alert(
              'Editar Alimento',
              `Nome: ${food.name}\nQuantidade: ${food.quantity} ${food.unit}\nCalorias: ${food.calories} kcal\nProteína: ${food.protein}g\nCarboidratos: ${food.carbs}g\nGordura: ${food.fat}g`
            );
          }
        }
      ]
    );
  };

  // Open modal for add
  const openAddFoodModal = (mealType?: string) => {
    setFoodEditInitialData(mealType ? { mealType } : null);
    setFoodEditModalVisible(true);
  };

  // Open modal for edit
  const openEditFoodModal = (food: any) => {
    setFoodEditInitialData(food);
    setFoodEditModalVisible(true);
  };

  // Handle save (add or edit)
  const handleSaveFood = (food: any) => {
    if (foodEditInitialData && foodEditInitialData.id) {
      // Edit mode
      setFoodLogs((prev: any[]) => prev.map(f => f.id === foodEditInitialData.id ? { ...f, ...food } : f));
    } else {
      // Add mode
      setFoodLogs((prev: any[]) => [
        ...prev,
        { ...food, id: Date.now().toString(), date: dateKey },
      ]);
    }
    setFoodEditModalVisible(false);
    setFoodEditInitialData(null);
  };

  // Handle delete
  const handleDeleteFood = () => {
    if (foodEditInitialData && foodEditInitialData.id) {
      setFoodLogs((prev: any[]) => prev.filter(f => f.id !== foodEditInitialData.id));
    }
    setFoodEditModalVisible(false);
    setFoodEditInitialData(null);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
      {/* Header with gradient */}
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
              {/* SVG ring for calories fill */}
              {(() => {
                const radius = 75;
                const stroke = 10;
                const circumference = 2 * Math.PI * radius;
                const percentage = Math.min((totals.calories / (targets.calories || 1)) * 100, 100);
                const strokeDashoffset = circumference - (percentage / 100) * circumference;
                return (
                  <Svg width={radius * 2} height={radius * 2}>
                    {/* Background Circle */}
                    <Circle
                      cx={radius}
                      cy={radius}
                      r={radius - stroke / 2}
                      stroke="#f1f5f9"
                      strokeWidth={stroke}
                      fill="none"
                    />
                    {/* Progress Circle */}
                    <Circle
                      cx={radius}
                      cy={radius}
                      r={radius - stroke / 2}
                      stroke="#f97316"
                      strokeWidth={stroke}
                      fill="none"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                    />
                  </Svg>
                );
              })()}
              <View style={styles.caloriesCenter}>
                <View style={styles.caloriesRow}>
                  <FontAwesome6 name="fire-flame-curved" size={30} color="#f97316" />
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
            <MacroProgress label="Proteína" current={totals.protein} target={targets.protein} unit="g" color="#3b82f6" iconName="drumstick-bite" />
            <MacroProgress label="Carbs" current={totals.carbs} target={targets.carbs} unit="g" color="#f97316" iconName="wheat-awn" />
            <MacroProgress label="Gordura" current={totals.fat} target={targets.fat} unit="g" color="#ef4444" iconName="bottle-droplet" />
          </View>
        </View>

        {/* Meals Section */}
        <View style={styles.mealsContainer}>
          <Text style={styles.mealsTitle}>Refeições de {isToday ? 'Hoje' : format(currentDate, "dd 'de' MMMM")}</Text>
          {MEAL_TYPES.map((mealType, idx) => (
            <React.Fragment key={mealType}>
              <MealSection
                title={mealType}
                calories={getCaloriesForMeal(mealType)}
                foods={getFoodsForMeal(mealType)}
                onAddFood={() => openAddFoodModal(mealType)}
                onEditFood={openEditFoodModal}
              />
              {idx < MEAL_TYPES.length - 1 && (
                <View style={styles.mealDivider} />
              )}
            </React.Fragment>
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
            <Text style={styles.sheetTitle}>
              {selectedMealType ? `Adicionar ao ${selectedMealType}` : 'Adicionar Alimento'}
            </Text>
            <TouchableOpacity onPress={() => setAddFoodVisible(false)}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <View style={styles.sheetOptionsGrid}>
            <TouchableOpacity style={styles.sheetOption} onPress={() => openAddFoodModal()}>
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

      {/* Food Search Modal */}
      <Modal
        isVisible={searchModalVisible}
        onBackdropPress={() => setSearchModalVisible(false)}
        style={styles.modal}
        backdropOpacity={0.4}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Buscar Alimento</Text>
            <TouchableOpacity onPress={() => setSearchModalVisible(false)}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome do alimento..."
              value={searchQuery}
              onChangeText={handleSearchFood}
              autoFocus
            />
          </View>

          <ScrollView style={styles.searchResults}>
            {filteredFoods.map((food) => (
              <TouchableOpacity
                key={food.id}
                style={styles.searchResultItem}
                onPress={() => handleSelectFood(food)}
              >
                <View style={styles.searchResultInfo}>
                  <Text style={styles.searchResultName}>{food.name}</Text>
                  <Text style={styles.searchResultCategory}>{food.category}</Text>
                </View>
                <View style={styles.searchResultMacros}>
                  <Text style={styles.searchResultCalories}>{food.calories} kcal</Text>
                  <Text style={styles.searchResultMacroDetails}>
                    P: {food.protein}g | C: {food.carbs}g | G: {food.fat}g
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Modal>

      {/* Quantity Modal */}
      <Modal
        isVisible={quantityModalVisible}
        onBackdropPress={() => setQuantityModalVisible(false)}
        style={styles.modal}
        backdropOpacity={0.4}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Quantidade</Text>
            <TouchableOpacity onPress={() => setQuantityModalVisible(false)}>
              <Icon name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>
          
          {selectedFood && (
            <View style={styles.quantityContent}>
              <Text style={styles.quantityFoodName}>{selectedFood.name}</Text>
              
              <View style={styles.quantityInputContainer}>
                <TextInput
                  style={styles.quantityInput}
                  value={foodQuantity}
                  onChangeText={setFoodQuantity}
                  keyboardType="numeric"
                  placeholder="100"
                />
                <Text style={styles.quantityUnit}>{foodUnit}</Text>
              </View>
              
              <View style={styles.quantityMacros}>
                <Text style={styles.quantityMacroText}>
                  Calorias: {Math.round(selectedFood.calories * parseFloat(foodQuantity || '0') / 100)} kcal
                </Text>
                <Text style={styles.quantityMacroText}>
                  Proteína: {Math.round(selectedFood.protein * parseFloat(foodQuantity || '0') / 100 * 10) / 10}g
                </Text>
                <Text style={styles.quantityMacroText}>
                  Carboidratos: {Math.round(selectedFood.carbs * parseFloat(foodQuantity || '0') / 100 * 10) / 10}g
                </Text>
                <Text style={styles.quantityMacroText}>
                  Gordura: {Math.round(selectedFood.fat * parseFloat(foodQuantity || '0') / 100 * 10) / 10}g
                </Text>
              </View>
              
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleConfirmQuantity}
              >
                <Text style={styles.confirmButtonText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>

      {/* Food Edit Modal */}
      <FoodEditModal
        visible={foodEditModalVisible}
        onClose={() => { setFoodEditModalVisible(false); setFoodEditInitialData(null); }}
        onSave={handleSaveFood}
        onDelete={foodEditInitialData && foodEditInitialData.id ? handleDeleteFood : undefined}
        initialData={foodEditInitialData}
        mealOptions={MEAL_OPTIONS}
      />
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
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  caloriesCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
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
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 18,
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
  foodList: {
    marginBottom: 12,
  },
  foodMiniCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#F1F1F1',
  },
  foodMiniCardName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 2,
  },
  foodMiniCardQty: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 6,
  },
  foodMiniCardMacrosRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  foodMacroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  foodMacroValue: {
    fontSize: 15,
    color: '#1F2937',
    marginLeft: 4,
    fontWeight: '500',
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  searchResults: {
    maxHeight: 300,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  searchResultCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  searchResultMacros: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultCalories: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  searchResultMacroDetails: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  quantityContent: {
    padding: 20,
  },
  quantityFoodName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 12,
  },
  quantityInput: {
    flex: 1,
    fontSize: 16,
    color: '#1e293b',
  },
  quantityUnit: {
    fontSize: 14,
    color: '#64748b',
    marginLeft: 8,
  },
  quantityMacros: {
    marginBottom: 12,
  },
  quantityMacroText: {
    fontSize: 14,
    color: '#64748b',
  },
  confirmButton: {
    backgroundColor: '#FF725E',
    borderRadius: 8,
    alignItems: 'center',
    padding: 12,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mealDivider: {
    height: 1,
    backgroundColor: '#f1f1f1',
    marginTop: 4,
    marginBottom: 24,
    marginHorizontal: 20,
  },
});