import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome6 } from '@expo/vector-icons';
import Modal from 'react-native-modal';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomSheetModal, BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { MacroProgress } from '../../../components/MacroProgress';
import { SafeAreaView as SafeAreaViewContext } from 'react-native-safe-area-context';
import { FoodBottomSheet } from '../../../components/FoodBottomSheet';
import { SavedFoodsBottomSheet } from '../../../components/SavedFoodsBottomSheet';
import { AIFoodAnalysisBottomSheet, AIAnalysisResult } from '../../../components/AIFoodAnalysisBottomSheet';
import SearchBottomSheet, { SearchBottomSheetRef } from '../../../components/SearchBottomSheet';

import Svg, { Circle } from 'react-native-svg';
import { useAuth } from '../../../contexts/AuthContext';
import { api, FoodItem, FoodLog, SavedFood } from '../../../services/api';
import { getAuth } from '@react-native-firebase/auth';
import { formatNumber } from '../../../utils/formatters';

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

// Using FoodLog and FoodItem from services/api.ts

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
        <Text style={styles.mealCalories}>{formatNumber(calories)} kcal</Text>
      </View>

      {!foods || foods.length === 0 ? (
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
                    <Text style={styles.foodMacroValue}>{formatNumber(food.calories)}</Text>
                  </View>
                  <View style={styles.foodMacroItem}>
                    <FontAwesome6 name="drumstick-bite" size={18} color="#3b82f6" />
                    <Text style={styles.foodMacroValue}>{formatNumber(food.protein, 1)}g</Text>
                  </View>
                  <View style={styles.foodMacroItem}>
                    <FontAwesome6 name="wheat-awn" size={18} color="#FFA28F" />
                    <Text style={styles.foodMacroValue}>{formatNumber(food.carbs, 1)}g</Text>
                  </View>
                  <View style={styles.foodMacroItem}>
                    <FontAwesome6 name="bottle-droplet" size={18} color="#ef4444" />
                    <Text style={styles.foodMacroValue}>{formatNumber(food.fat, 1)}g</Text>
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
  // Create refs to control the bottom sheets
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const savedFoodsBottomSheetRef = useRef<BottomSheetModal>(null);
  const aiFoodAnalysisBottomSheetRef = useRef<BottomSheetModal>(null);
  const searchBottomSheetRef = useRef<SearchBottomSheetRef>(null);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [addFoodVisible, setAddFoodVisible] = useState(false);
  const [foodLogs, setFoodLogs] = useState<FoodLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<string>('');
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
  const [foodEditInitialData, setFoodEditInitialData] = useState<any>(null);
  const [foodBottomloading, setFoodBottomLoading] = useState(false);

  // Food database loading state
  const [loadingFoods, setLoadingFoods] = useState(false);

  // User data from auth context
  const { user } = useAuth();

  console.log('DashboardScreen: Component rendering, user:', !!user, 'user data:', user ? { 
    uid: user.uid, 
    calories: user.calories, 
    protein: user.protein, 
    carbs: user.carbs, 
    fat: user.fat 
  } : 'null');

  // Add loading state for user data
  const isLoading = !user;

  // Format date for display
  const formattedDate = format(currentDate, 'dd MMM');
  const isToday = format(currentDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const dateKey = format(currentDate, 'yyyy-MM-dd');

  // Validate date
  if (isNaN(currentDate.getTime())) {
    setCurrentDate(new Date());
  }

  // Load food logs from backend when date changes or user changes
  useEffect(() => {
    console.log('Dashboard useEffect: user?.uid:', user?.uid, 'currentDate:', currentDate);
    try {
      if (user?.uid) {
        // Add a small delay to ensure Firebase auth is fully initialized
        const timer = setTimeout(() => {
          console.log('Dashboard useEffect: Calling loadFoodLogs after delay');
          loadFoodLogs();
        }, 500);

        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.error('Error in useEffect for loading food logs:', error);
    }
  }, [currentDate, user?.uid]);

  const loadFoodLogs = async () => {
    console.log('loadFoodLogs: Starting to load food logs');
    try {
      if (!user?.uid) {
        console.log('No user.uid available for loading food logs');
        return;
      }

      setLoadingLogs(true);
      const firebaseUser = getAuth().currentUser;

      if (!firebaseUser) {
        console.log('No Firebase user found, skipping food logs load');
        setFoodLogs([]);
        return;
      }

      const token = await firebaseUser.getIdToken();

      if (!token) {
        console.log('No Firebase token available, skipping food logs load');
        setFoodLogs([]);
        return;
      }

      console.log('Loading food logs with:', {
        uid: user.uid,
        date: dateKey,
        hasToken: !!token,
        tokenLength: token?.length
      });

      const logs = await api.getFoodLogs(user.uid, dateKey, token);
      console.log('Successfully loaded food logs:', logs?.length || 0, 'items');
      setFoodLogs(logs || []);
    } catch (error: any) {
      console.error('Failed to load food logs:', error);

      // If it's a 500 error, it might be a temporary server issue
      if (error.message?.includes('500') || error.message?.includes('Internal Server Error')) {
        console.log('Server error detected, will retry in 3 seconds...');
        setTimeout(() => {
          if (user?.uid) {
            loadFoodLogs();
          }
        }, 3000);
      }

      // Keep existing logs if loading fails, but set to empty array if this is the first load
      if (foodLogs.length === 0) {
        setFoodLogs([]);
      }
    } finally {
      setLoadingLogs(false);
    }
  };

  // Calculate totals for current date
  const totals = (foodLogs || []).reduce((acc, food) => ({
    calories: acc.calories + (food.calories || 0),
    protein: acc.protein + (food.protein || 0),
    carbs: acc.carbs + (food.carbs || 0),
    fat: acc.fat + (food.fat || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  // Ensure totals are valid numbers
  if (isNaN(totals.calories)) totals.calories = 0;
  if (isNaN(totals.protein)) totals.protein = 0;
  if (isNaN(totals.carbs)) totals.carbs = 0;
  if (isNaN(totals.fat)) totals.fat = 0;

  const targets = {
    calories: user?.calories || 2000,
    protein: user?.protein || 150,
    carbs: user?.carbs || 250,
    fat: user?.fat || 65,
  };

  // Ensure targets are valid numbers
  if (!targets.calories || targets.calories <= 0) {
    targets.calories = 2000;
  }
  if (!targets.protein || targets.protein <= 0) {
    targets.protein = 150;
  }
  if (!targets.carbs || targets.carbs <= 0) {
    targets.carbs = 250;
  }
  if (!targets.fat || targets.fat <= 0) {
    targets.fat = 65;
  }

  let remainingCalories = Math.max(0, targets.calories - totals.calories);
  if (isNaN(remainingCalories)) {
    remainingCalories = 0;
  }

  // Get foods for each meal type
  const getFoodsForMeal = (mealType: string) => {
    if (!foodLogs || !Array.isArray(foodLogs)) return [];
    return foodLogs.filter(food => food.mealType === mealType) || [];
  };

  const getCaloriesForMeal = (mealType: string) => {
    const foods = getFoodsForMeal(mealType);
    const total = foods.reduce((sum, food) => sum + (food.calories || 0), 0);
    return isNaN(total) ? 0 : total;
  };

  // Navigation handlers
  const handlePreviousDay = () => {
    try {
      const newDate = new Date(currentDate);
      newDate.setDate(currentDate.getDate() - 1);
      if (!isNaN(newDate.getTime())) {
        setCurrentDate(newDate);
      }
    } catch (error) {
      console.error('Error handling previous day:', error);
    }
  };

  const handleNextDay = () => {
    try {
      if (!isToday) {
        const newDate = new Date(currentDate);
        newDate.setDate(currentDate.getDate() + 1);
        if (!isNaN(newDate.getTime())) {
          setCurrentDate(newDate);
        }
      }
    } catch (error) {
      console.error('Error handling next day:', error);
    }
  };

  // Food management handlers
  const handleOption = (option: string) => {
    try {
      setAddFoodVisible(false);

      switch (option) {
        case 'manual':
          setFoodEditInitialData({ mealType: selectedMealType || 'Almoço' });
          bottomSheetRef.current?.present();
          break;
        case 'recentes':
          Alert.alert('Refeições Recentes', 'Funcionalidade em desenvolvimento');
          break;
        case 'salvos':
          savedFoodsBottomSheetRef.current?.present();
          break;
        case 'banco':
          searchBottomSheetRef.current?.present();
          break;
        case 'ai':
          aiFoodAnalysisBottomSheetRef.current?.present();
          break;
        default:
          console.warn('Unknown option:', option);
      }
    } catch (error) {
      console.error('Error handling option:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar sua seleção. Tente novamente.');
    }
  };

  const handleAddFoodToMeal = (mealType: string) => {
    try {
      if (!mealType || typeof mealType !== 'string') {
        console.warn('Invalid meal type:', mealType);
        return;
      }
      setSelectedMealType(mealType);
      setAddFoodVisible(true);
    } catch (error) {
      console.error('Error adding food to meal:', error);
    }
  };

  const handleSearchFood = async (query: string) => {
    try {
      if (!query || typeof query !== 'string') {
        setFilteredFoods([]);
        return;
      }

      setSearchQuery(query);

      // Only search if query has at least 2 characters
      if (query.trim().length >= 2) {
        try {
          setLoadingFoods(true);
          const foods = await api.searchFoods(query);
          // Ensure foods is an array and has valid data
          if (Array.isArray(foods)) {
            setFilteredFoods(foods);
          } else {
            console.error('Search returned non-array result:', foods);
            setFilteredFoods([]);
          }
        } catch (error) {
          console.error('Failed to search foods:', error);
          setFilteredFoods([]);
        } finally {
          setLoadingFoods(false);
        }
      } else {
        setFilteredFoods([]);
      }
    } catch (error) {
      console.error('Error in handleSearchFood:', error);
      setFilteredFoods([]);
      setLoadingFoods(false);
    }
  };

  const handleSelectFood = (food: FoodItem) => {
    console.log('handleSelectFood called with:', food);
    console.log('Current selectedMealType:', selectedMealType);

    // Convert FoodItem to FoodLog format and pre-fill the FoodBottomSheet
    const foodData = {
      name: food.name,
      quantity: 100, // Default 100g
      unit: 'g',
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fat: food.fat,
      mealType: selectedMealType || 'Almoço', // Default to Almoço if not set
      date: dateKey,
    };

    setFoodEditInitialData(foodData);
    searchBottomSheetRef.current?.dismiss();
    bottomSheetRef.current?.present();
  };



  const handleEditFood = (food: FoodLog) => {
    setFoodEditInitialData(food);
    bottomSheetRef.current?.present();
  };

  // Open bottom sheet for add
  const openAddFoodModal = (mealType?: string) => {
    try {
      if (mealType && typeof mealType !== 'string') {
        console.warn('Invalid meal type for adding food:', mealType);
        return;
      }
      setSelectedMealType(mealType || 'Almoço');
      setAddFoodVisible(true);
    } catch (error) {
      console.error('Error in openAddFoodModal:', error);
    }
  };

  // Open bottom sheet for edit
  const openEditFoodModal = (food: any) => {
    try {
      if (!food || !food.name) {
        console.warn('Invalid food data for editing:', food);
        return;
      }
      setFoodEditInitialData(food);
      bottomSheetRef.current?.present();
    } catch (error) {
      console.error('Error in openEditFoodModal:', error);
    }
  };

  // Handle save (add or edit)
  const handleSaveFood = async (food: any) => {
    setFoodBottomLoading(true)
    try {
      if (!food || !food.name) {
        Alert.alert('Erro', 'Dados do alimento inválidos');
        return;
      }
      const firebaseUser = getAuth().currentUser;
      const token = firebaseUser ? await firebaseUser.getIdToken() : '';

      // Check if this is a saved food being edited
      if (foodEditInitialData && foodEditInitialData.isSavedFood) {
        // Update saved food
        const updatedSavedFood = {
          name: food.name,
          quantity: food.quantity,
          unit: food.unit,
          calories: food.calories,
          protein: food.protein,
          carbs: food.carbs,
          fat: food.fat,
        };

        if (user?.uid && token) {
          await api.updateSavedFood(user.uid, foodEditInitialData.id, updatedSavedFood, token);
        }

        Alert.alert('Sucesso!', `${food.name} atualizado nos alimentos salvos`);
      } else if (foodEditInitialData && foodEditInitialData.id) {
        // Edit mode - preserve the original ID from backend
        const updatedFoodLog = {
          ...foodEditInitialData,
          ...food,
          id: foodEditInitialData.id // Keep the original backend ID
        };

        if (user?.uid && token) {
          await api.updateFoodLog(user.uid, updatedFoodLog, token);
        }

        // Update local state
        setFoodLogs((prev: any[]) => prev.map(f => f.id === foodEditInitialData.id ? updatedFoodLog : f));
        Alert.alert('Sucesso!', `${food.name} atualizado com sucesso`);
      } else {
        // Add mode - ensure all macro values are numbers
        const newFoodLog: FoodLog = {
          id: Math.floor(Math.random() * 1000000) + 1, // Smaller ID range
          name: food.name,
          quantity: typeof food.quantity === 'string' ? parseFloat(food.quantity) : food.quantity,
          unit: food.unit,
          calories: typeof food.calories === 'string' ? parseFloat(food.calories) : food.calories,
          protein: typeof food.protein === 'string' ? parseFloat(food.protein) : food.protein,
          carbs: typeof food.carbs === 'string' ? parseFloat(food.carbs) : food.carbs,
          fat: typeof food.fat === 'string' ? parseFloat(food.fat) : food.fat,
          mealType: food.mealType,
          date: dateKey,
        };

        let createdFoodLog: FoodLog | null = null;

        if (user?.uid && token) {
          createdFoodLog = await api.createFoodLog(user.uid, newFoodLog, token);

          // If user wants to save this food for future use
          if (food.saveFood) {
            try {
              const savedFoodData = {
                name: food.name,
                quantity: food.quantity,
                unit: food.unit,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fat: food.fat,
              };

              await api.saveFood(user.uid, savedFoodData, token);
              console.log('Food saved for future use:', food.name);
            } catch (saveError) {
              console.error('Failed to save food for future use:', saveError);
              // Don't show error to user as the main food log was saved successfully
            }
          }
        }

        // Update local state
        setFoodLogs((prev: any[]) => [...prev, createdFoodLog || newFoodLog]);

        // Show success message
        if (food.saveFood) {
          Alert.alert('Sucesso!', `${food.name} adicionado com sucesso e salvo para uso futuro!`);
        } else {
          Alert.alert('Sucesso!', `${food.name} adicionado com sucesso.`);
        }
      }

      bottomSheetRef.current?.dismiss();
      setFoodEditInitialData(null);
    } catch (error) {
      console.error('Failed to save food log:', error);
      Alert.alert('Erro', 'Falha ao salvar alimento. Tente novamente.');
    } finally { setFoodBottomLoading(false) }
  };

  // Handle delete
  const handleDeleteFood = async () => {
    setFoodBottomLoading(true)
    try {
      if (foodEditInitialData && foodEditInitialData.id) {
        const firebaseUser = getAuth().currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken() : '';

        if (user?.uid && token) {
          await api.deleteFoodLog(user.uid, foodEditInitialData.id, token);
        }

        // Update local state
        setFoodLogs((prev: any[]) => prev.filter(f => f.id !== foodEditInitialData.id));
        Alert.alert('Sucesso!', `${foodEditInitialData.name} removido com sucesso`);
      }

      bottomSheetRef.current?.dismiss();
      setFoodEditInitialData(null);
    } catch (error) {
      console.error('Failed to delete food log:', error);
      Alert.alert('Erro', 'Falha ao remover alimento. Tente novamente.');
    } finally { 
      setFoodBottomLoading(false) 
    }
  };

  // Saved Foods handlers
  const handleSelectSavedFood = (savedFood: SavedFood) => {
    try {
      if (!savedFood || !savedFood.name) {
        console.warn('Invalid saved food data:', savedFood);
        return;
      }

      // Convert saved food to food log format and add to current meal
    const newFoodLog: FoodLog = {
      id: Math.floor(Math.random() * 1000000) + 1,
      name: savedFood.name,
      quantity: typeof savedFood.quantity === 'string' ? parseFloat(savedFood.quantity) : savedFood.quantity,
      unit: savedFood.unit,
      calories: typeof savedFood.calories === 'string' ? parseFloat(savedFood.calories) : savedFood.calories,
      protein: typeof savedFood.protein === 'string' ? parseFloat(savedFood.protein) : savedFood.protein,
      carbs: typeof savedFood.carbs === 'string' ? parseFloat(savedFood.carbs) : savedFood.carbs,
      fat: typeof savedFood.fat === 'string' ? parseFloat(savedFood.fat) : savedFood.fat,
      mealType: selectedMealType || 'Almoço',
      date: dateKey,
    };

    // Save to backend first, then update local state
    const saveToBackend = async () => {
      try {
        const firebaseUser = getAuth().currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken() : '';

        if (user?.uid && token) {
          const createdFoodLog = await api.createFoodLog(user.uid, newFoodLog, token);
          // Update local state with the backend response (which has the correct ID)
          setFoodLogs((prev: any[]) => [...prev, createdFoodLog]);
        } else {
          // Fallback to local state if no backend
          setFoodLogs((prev: any[]) => [...prev, newFoodLog]);
        }
      } catch (error) {
        console.error('Failed to save food log from saved food:', error);
        Alert.alert('Erro', 'Falha ao adicionar alimento. Tente novamente.');
      }
    };

    saveToBackend();
    Alert.alert('Sucesso!', `${savedFood.name} adicionado com sucesso.`);
    } catch (error) {
      console.error('Error in handleSelectSavedFood:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao processar o alimento salvo. Tente novamente.');
    }
  };

  const handleEditSavedFood = (savedFood: SavedFood) => {
    try {
      if (!savedFood || !savedFood.name) {
        console.warn('Invalid saved food data for editing:', savedFood);
        return;
      }

      // Open the food bottom sheet in edit mode with saved food data
      setFoodEditInitialData({
        ...savedFood,
        mealType: selectedMealType || 'Almoço',
        isSavedFood: true, // Flag to indicate this is a saved food being edited
      });
      savedFoodsBottomSheetRef.current?.dismiss();
      bottomSheetRef.current?.present();
    } catch (error) {
      console.error('Error in handleEditSavedFood:', error);
    }
  };

  const handleDeleteSavedFood = (foodId: number) => {
    try {
      if (!foodId || typeof foodId !== 'number') {
        console.warn('Invalid food ID for deletion:', foodId);
        return;
      }
      // This will be handled by the SavedFoodsBottomSheet component
      console.log('Saved food deleted:', foodId);
    } catch (error) {
      console.error('Error in handleDeleteSavedFood:', error);
    }
  };

  // AI Food Analysis handler
  const handleFoodAnalyzed = async (aiResult: AIAnalysisResult) => {
    try {
      if (!aiResult || !aiResult.food) {
        Alert.alert('Erro', 'Dados de análise inválidos');
        return;
      }

      const firebaseUser = getAuth().currentUser;
      const token = firebaseUser ? await firebaseUser.getIdToken() : '';

      if (!user?.uid || !token) {
        Alert.alert('Erro', 'Token de autenticação não disponível');
        return;
      }

      // Convert AI result to food log format
      const newFoodLog: FoodLog = {
        id: Math.floor(Math.random() * 1000000) + 1,
        name: aiResult.food,
        quantity: aiResult.quantity,
        unit: aiResult.unit,
        calories: aiResult.calories,
        protein: aiResult.protein,
        carbs: aiResult.carbs,
        fat: aiResult.fat,
        mealType: aiResult.mealType,
        date: aiResult.date,
      };

      // Save to backend
      const createdFoodLog = await api.createFoodLog(user.uid, newFoodLog, token);

      // Update local state with the backend response (which has the correct ID)
      setFoodLogs((prev: any[]) => [...prev, createdFoodLog]);

      Alert.alert('Sucesso!', `${aiResult.food} adicionado com sucesso.`);
    } catch (error: any) {
      console.error('Failed to save AI analyzed food:', error);
      Alert.alert('Erro', 'Falha ao adicionar alimento analisado. Tente novamente.');
    }
  };



  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF8F6' }}>
        <Text style={{ fontSize: 18, color: '#64748b', marginBottom: 16 }}>Carregando dados do usuário...</Text>
        <ActivityIndicator size="large" color="#FF725E" />
      </View>
    );
  }

  return (
    <BottomSheetModalProvider>
      <View style={{ flex: 1, backgroundColor: '#FFF8F6' }}>
        {/* Header with gradient */}
        <LinearGradient
          colors={["#FF725E", "#FF8A50"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 28,
            borderBottomLeftRadius: 24,
            borderBottomRightRadius: 24,
          }}
        >
          <SafeAreaViewContext edges={['top']} style={{ backgroundColor: 'transparent' }}>
            <View style={styles.headerContent}>
              <View style={styles.titleSection}>
                <Text style={styles.appTitle}>ForkFit</Text>
              </View>
              <View style={styles.headerButtons}>
                <TouchableOpacity style={styles.notificationButton}>
                  <Icon name="notifications-outline" size={26} color="#fff" />
                </TouchableOpacity>
              </View>
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
                  if (isNaN(percentage)) {
                    return null; // Don't render the progress ring if calculation fails
                  }
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
                    <Text style={styles.caloriesNumber}>{formatNumber(totals.calories)}</Text>
                  </View>
                  <Text style={styles.caloriesTarget}>/ {formatNumber(targets.calories)} kcal</Text>
                </View>
              </View>
              <View style={styles.restanteBadge}>
                <Text style={styles.restanteText}>
                  Restante: <Text style={styles.restanteNumber}>{formatNumber(remainingCalories)} kcal</Text>
                </Text>
              </View>
            </View>
            <View style={styles.macrosGrid}>
              <MacroProgress index={0} label="Proteína" current={totals.protein} target={targets.protein} unit="g" color="#3b82f6" iconName="drumstick-bite" />
              <MacroProgress index={1} label="Carbs" current={totals.carbs} target={targets.carbs} unit="g" color="#f97316" iconName="wheat-awn" />
              <MacroProgress index={2} label="Gordura" current={totals.fat} target={targets.fat} unit="g" color="#ef4444" iconName="bottle-droplet" />
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
              />
            </View>

            <View style={styles.searchResults}>
              <Text>Search modal loaded successfully!</Text>
              <Text>Query: {searchQuery}</Text>
              <Text>Loading: {loadingFoods ? 'Yes' : 'No'}</Text>
              <Text>Results: {(filteredFoods || []).length}</Text>
              <TouchableOpacity
                style={{ backgroundColor: '#FF725E', padding: 10, margin: 10, borderRadius: 8 }}
                onPress={() => {
                  console.log('Test button pressed');
                  Alert.alert('Test', 'Modal is working!');
                }}
              >
                <Text style={{ color: 'white', textAlign: 'center' }}>Test Button</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>





        {/* FoodBottomSheet */}
        <FoodBottomSheet
          ref={bottomSheetRef}
          initialData={foodEditInitialData}
          mealOptions={MEAL_OPTIONS}
          onSave={handleSaveFood}
          onDelete={foodEditInitialData && foodEditInitialData.id ? handleDeleteFood : undefined}
          loading={foodBottomloading}
        />

        {/* SavedFoodsBottomSheet */}
        <SavedFoodsBottomSheet
          ref={savedFoodsBottomSheetRef}
          onSelectFood={handleSelectSavedFood}
          onEditFood={handleEditSavedFood}
          onDeleteFood={handleDeleteSavedFood}
        />

        {/* AIFoodAnalysisBottomSheet */}
        <AIFoodAnalysisBottomSheet
          ref={aiFoodAnalysisBottomSheetRef}
          onFoodAnalyzed={handleFoodAnalyzed}
          selectedMealType={selectedMealType || 'Almoço'}
          date={dateKey}
        />

        {/* SearchBottomSheet */}
        <SearchBottomSheet
          ref={searchBottomSheetRef}
          onSelectFood={handleSelectFood}
          selectedMealType={selectedMealType || 'Almoço'}
        />

      </View>
    </BottomSheetModalProvider>
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
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
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
    bottom: 20,
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