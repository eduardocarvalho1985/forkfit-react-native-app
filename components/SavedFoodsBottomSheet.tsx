// FILE: components/SavedFoodsBottomSheet.tsx (Saved Foods Selection & Management)

import React, { forwardRef, useMemo, useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, FlatList, RefreshControl } from 'react-native';
import { BottomSheetModal, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';
import { api, SavedFood } from '../services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useAuth } from '../contexts/AuthContext';
import { formatNumber } from '../utils/formatters';

// Define your constants
const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#e2e8f0';
const TEXT = '#1e293b';

export interface SavedFoodsBottomSheetProps {
  onSelectFood: (food: SavedFood) => void;
  onEditFood?: (food: SavedFood) => void;
  onDeleteFood?: (foodId: number) => void;
}

// We use forwardRef so the parent screen can control this component
export const SavedFoodsBottomSheet = forwardRef<BottomSheetModal, SavedFoodsBottomSheetProps>(
  ({ onSelectFood, onEditFood, onDeleteFood }, ref) => {
    
    // The heights the sheet can snap to
    const snapPoints = useMemo(() => ['90%'], []);

    // State
    const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingFood, setEditingFood] = useState<SavedFood | null>(null);
    const [deletingFood, setDeletingFood] = useState<SavedFood | null>(null);

    // User data from auth context
    const { user } = useAuth();

    // Filter foods based on search
    const filteredFoods = searchTerm.trim() === '' 
      ? savedFoods
      : savedFoods.filter((food) => 
          food.name?.toLowerCase().includes(searchTerm.toLowerCase())
        );

    // Load saved foods
    const loadSavedFoods = async () => {
      if (!user?.uid) return;
      
      try {
        setLoading(true);
        const firebaseUser = getAuth().currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken() : '';
        
        if (!token) {
          console.log('No Firebase token available for loading saved foods');
          return;
        }
        
        const foods = await api.getSavedFoods(user.uid, token);
        console.log('Successfully loaded saved foods:', foods?.length || 0, 'items');
        setSavedFoods(foods || []);
      } catch (error: any) {
        console.error('Failed to load saved foods:', error);
        Alert.alert('Erro', 'Não foi possível carregar os alimentos salvos');
      } finally {
        setLoading(false);
      }
    };

    // Delete food handler
    const handleDeleteFood = async (food: SavedFood) => {
      if (!user?.uid) return;

      Alert.alert(
        'Confirmar exclusão',
        `Deseja remover "${food.name}" dos seus alimentos salvos?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Remover',
            style: 'destructive',
            onPress: async () => {
              try {
                const firebaseUser = getAuth().currentUser;
                const token = firebaseUser ? await firebaseUser.getIdToken() : '';
                
                if (!token) {
                  Alert.alert('Erro', 'Token de autenticação não disponível');
                  return;
                }
                
                await api.deleteSavedFood(user.uid, food.id!, token);
                setSavedFoods(prev => prev.filter(f => f.id !== food.id));
                Alert.alert('Sucesso!', `${food.name} removido dos alimentos salvos`);
                
                // Call parent delete handler if provided
                if (onDeleteFood) {
                  onDeleteFood(food.id!);
                }
              } catch (error: any) {
                console.error('Failed to delete saved food:', error);
                Alert.alert('Erro', 'Não foi possível remover o alimento');
              }
            }
          }
        ]
      );
    };

    // Edit food handler
    const handleEditFood = (food: SavedFood) => {
      if (onEditFood) {
        onEditFood(food);
      }
    };

    // Select food handler
    const handleSelectFood = (food: SavedFood) => {
      onSelectFood(food);
      // Close the bottom sheet
      // @ts-ignore
      ref.current?.dismiss();
    };

    // Load saved foods when component mounts and when user changes
    useEffect(() => {
      loadSavedFoods();
    }, [user?.uid]);

    // Handle bottom sheet presentation to refresh data
    const handleSheetChanges = (index: number) => {
      if (index === 0) {
        // Bottom sheet is presented, refresh saved foods
        loadSavedFoods();
      }
    };

    const handleClose = () => {
      // A way to programmatically close the sheet if needed
      // @ts-ignore
      ref.current?.dismiss();
    };

    const renderFoodItem = ({ item }: { item: SavedFood }) => (
      <TouchableOpacity 
        style={styles.foodItem}
        onPress={() => handleSelectFood(item)}
        activeOpacity={0.7}
      >
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{item.name}</Text>
          <Text style={styles.foodDetails}>
            {formatNumber(item.quantity)}{item.unit} • {formatNumber(item.calories)} kcal
          </Text>
          <Text style={styles.macros}>
            P: {formatNumber(item.protein, 1)}g • C: {formatNumber(item.carbs, 1)}g • G: {formatNumber(item.fat, 1)}g
          </Text>
        </View>
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => handleEditFood(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome6 name="pen" size={16} color={CORAL} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteFood(item)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <FontAwesome6 name="trash" size={16} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: '#e2e8f0' }}
        backgroundStyle={{ backgroundColor: OFF_WHITE }}
        onChange={handleSheetChanges}
      >
        <View style={styles.contentContainer}>
          {/* Header */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>Alimentos Salvos</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <FontAwesome6 name="xmark" size={22} color={CORAL} />
            </TouchableOpacity>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <FontAwesome6 name="magnifying-glass" size={16} color="#A0AEC0" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar alimentos..."
              placeholderTextColor="#A0AEC0"
              value={searchTerm}
              onChangeText={setSearchTerm}
            />
          </View>

          {/* Foods List */}
          <View style={styles.listContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Carregando alimentos salvos...</Text>
              </View>
            ) : filteredFoods.length === 0 ? (
              <View style={styles.emptyContainer}>
                <FontAwesome6 name="bookmark" size={48} color="#A0AEC0" />
                <Text style={styles.emptyTitle}>
                  {searchTerm ? 'Nenhum alimento encontrado' : 'Nenhum alimento salvo'}
                </Text>
                <Text style={styles.emptyText}>
                  {searchTerm 
                    ? 'Tente ajustar sua busca'
                    : 'Os alimentos que você salvar aparecerão aqui para uso rápido'
                  }
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredFoods}
                keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
                renderItem={renderFoodItem}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                refreshControl={
                  <RefreshControl
                    refreshing={loading}
                    onRefresh={loadSavedFoods}
                    colors={[CORAL]}
                    tintColor={CORAL}
                  />
                }
              />
            )}
          </View>
        </View>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 12,
    marginBottom: 20,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: TEXT,
  },
  listContainer: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    padding: 16,
    marginBottom: 12,
  },
  foodInfo: {
    flex: 1,
    marginRight: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  foodDetails: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 2,
  },
  macros: {
    fontSize: 12,
    color: '#94a3b8',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: CORAL,
  },
  deleteButton: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
}); 