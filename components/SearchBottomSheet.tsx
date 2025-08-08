import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';
import { api, FoodItem } from '../services/api';
import { formatNumber } from '../utils/formatters';

const CORAL = '#FF725E';
const OFF_WHITE = '#FDF6F3';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

interface SearchBottomSheetProps {
  onSelectFood: (food: FoodItem) => void;
  selectedMealType: string;
}

export interface SearchBottomSheetRef {
  present: () => void;
  dismiss: () => void;
}

const SearchBottomSheet = forwardRef<SearchBottomSheetRef, SearchBottomSheetProps>(
  ({ onSelectFood, selectedMealType }, ref) => {
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFoods, setFilteredFoods] = useState<FoodItem[]>([]);
    const [loadingFoods, setLoadingFoods] = useState(false);
    const [searchTimeoutRef, setSearchTimeoutRef] = useState<ReturnType<typeof setTimeout> | null>(null);

    useImperativeHandle(ref, () => ({
      present: () => bottomSheetRef.current?.present(),
      dismiss: () => bottomSheetRef.current?.dismiss(),
    }));

    const handleSearchFood = async (query: string) => {
      if (!query.trim()) {
        setFilteredFoods([]);
        return;
      }

      setLoadingFoods(true);
      try {
        console.log('Searching for food:', query);
        const foods = await api.searchFoods(query);
        console.log('Search results:', foods);
        setFilteredFoods(foods);
      } catch (error) {
        console.error('Error searching foods:', error);
        setFilteredFoods([]);
      } finally {
        setLoadingFoods(false);
      }
    };

    const handleSelectFood = (food: FoodItem) => {
      onSelectFood(food);
      bottomSheetRef.current?.dismiss();
    };

    const handleTextChange = (text: string) => {
      setSearchQuery(text);
      
      // Clear previous timeout
      if (searchTimeoutRef) {
        clearTimeout(searchTimeoutRef);
      }
      
      // Set new timeout for debounced search
      const timeout = setTimeout(() => {
        handleSearchFood(text);
      }, 500);
      
      setSearchTimeoutRef(timeout);
    };



    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={['80%']}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Buscar Alimentos</Text>
            <Text style={styles.subtitle}>Encontre alimentos no banco de dados</Text>
          </View>



          {/* Search Input */}
          <View style={styles.searchContainer}>
            <FontAwesome6 name="search" size={16} color="#64748b" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Digite o nome do alimento..."
              placeholderTextColor="#64748b"
              value={searchQuery}
              onChangeText={handleTextChange}
              autoFocus={true}
            />
            {loadingFoods && <ActivityIndicator size="small" color={CORAL} style={styles.loadingIcon} />}
          </View>

          {/* Search Results */}
          {searchQuery.trim() && (
            <View style={styles.resultsContainer}>
              {loadingFoods ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={CORAL} />
                  <Text style={styles.loadingText}>Buscando alimentos...</Text>
                </View>
              ) : filteredFoods.length > 0 ? (
                <FlatList
                  data={filteredFoods}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.foodItem}
                      onPress={() => handleSelectFood(item)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.foodInfo}>
                        <Text style={styles.foodName}>{item.name}</Text>
                        <Text style={styles.foodCategory}>{item.category}</Text>
                      </View>
                      <View style={styles.foodMacros}>
                        <Text style={styles.macroText}>{formatNumber(item.calories)} kcal</Text>
                        <Text style={styles.macroText}>P: {formatNumber(item.protein, 1)}g</Text>
                        <Text style={styles.macroText}>C: {formatNumber(item.carbs, 1)}g</Text>
                        <Text style={styles.macroText}>G: {formatNumber(item.fat, 1)}g</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <FontAwesome6 name="search" size={48} color="#CBD5E0" />
                  <Text style={styles.emptyText}>Nenhum alimento encontrado</Text>
                  <Text style={styles.emptySubtext}>Tente uma busca diferente</Text>
                </View>
              )}
            </View>
          )}

          {/* Initial State */}
          {!searchQuery.trim() && (
            <View style={styles.initialContainer}>
              <FontAwesome6 name="database" size={48} color="#CBD5E0" />
              <Text style={styles.initialText}>Digite para buscar alimentos</Text>
              <Text style={styles.initialSubtext}>Encontre alimentos no banco de dados</Text>
            </View>
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: OFF_WHITE,
  },
  handleIndicator: {
    backgroundColor: BORDER,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: TEXT,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: TEXT,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  resultsContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#64748b',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  foodCategory: {
    fontSize: 14,
    color: '#64748b',
  },
  foodMacros: {
    alignItems: 'flex-end',
  },
  macroText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginTop: 16,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#64748b',
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialText: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginTop: 16,
    marginBottom: 4,
  },
  initialSubtext: {
    fontSize: 14,
    color: '#64748b',
  },
});

SearchBottomSheet.displayName = 'SearchBottomSheet';

export default SearchBottomSheet; 