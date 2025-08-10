import React, { forwardRef, useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  FlatList,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';
import { formatWeightWithUnit } from '../utils/weightUtils';
import { useProgress } from '../contexts/ProgressContext';
import { WeightEntry } from '../services/api';

// Define your constants
const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#e2e8f0';
const TEXT = '#1e293b';
const GRAY = '#64748b';
const RED = '#ef4444';
const SUCCESS = '#10b981';

export interface WeightHistoryBottomSheetProps {
  onRefresh?: () => void;
}

interface WeightEntryCardProps {
  entry: WeightEntry;
  onDelete: (entry: WeightEntry) => void;
  isDeleting: boolean;
}

const WeightEntryCard: React.FC<WeightEntryCardProps> = ({ entry, onDelete, isDeleting }) => {
  const translateX = useMemo(() => new Animated.Value(0), []);
  const [isRevealed, setIsRevealed] = useState(false);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  };

  const formatDateTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX } }],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    const { state, translationX } = event.nativeEvent;

    if (state === State.END) {
      const threshold = -100; // Swipe left threshold
      
      if (translationX < threshold && !isRevealed) {
        // Reveal delete button
        setIsRevealed(true);
        Animated.spring(translateX, {
          toValue: -120,
          useNativeDriver: false,
        }).start();
      } else if (translationX > -50 && isRevealed) {
        // Hide delete button
        setIsRevealed(false);
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: false,
        }).start();
      } else {
        // Snap back to current state
        Animated.spring(translateX, {
          toValue: isRevealed ? -120 : 0,
          useNativeDriver: false,
        }).start();
      }
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Registro',
      `Tem certeza que deseja excluir o registro de ${formatWeightWithUnit(entry.weight)} do dia ${formatDateTime(entry.date)}?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => onDelete(entry),
        },
      ]
    );
  };

  return (
    <View style={styles.cardContainer}>
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
        activeOffsetX={[-10, 10]}
      >
        <Animated.View style={[styles.cardWrapper, { transform: [{ translateX }] }]}>
          <View style={styles.card}>
            <View style={styles.cardContent}>
              <Text style={styles.weightText}>
                {formatWeightWithUnit(entry.weight)}
              </Text>
              <View style={styles.dateContainer}>
                <FontAwesome6 name="calendar" size={14} color={GRAY} />
                <Text style={styles.dateText}>
                  {formatDate(entry.date)}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
      
      {/* Delete button - positioned behind the card */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={handleDelete}
        disabled={isDeleting}
      >
        {isDeleting ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <FontAwesome6 name="trash" size={16} color="white" />
            <Text style={styles.deleteButtonText}>Excluir</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

export const WeightHistoryBottomSheet = forwardRef<BottomSheetModal, WeightHistoryBottomSheetProps>(
  ({ onRefresh }, ref) => {
    const snapPoints = useMemo(() => ['85%'], []);
    const { weightHistory, deleteWeightEntry, refreshWeightHistory } = useProgress();
    
    const [loading, setLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    // Manual refresh function
    const handleManualRefresh = async () => {
      setLoading(true);
      try {
        await refreshWeightHistory();
        onRefresh?.();
      } catch (error) {
        console.error('Failed to refresh weight history:', error);
        Alert.alert(
          'Erro',
          'Não foi possível atualizar a lista. Verifique sua conexão.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoading(false);
      }
    };

    // Sort weight history by date (newest first)
    const sortedWeightHistory = useMemo(() => {
      return [...weightHistory].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
    }, [weightHistory]);

    const handleDelete = async (entry: WeightEntry) => {
      try {
        setDeletingId(entry.id);
        await deleteWeightEntry(entry.id);
        await refreshWeightHistory();
        onRefresh?.();
      } catch (error) {
        console.error('Failed to delete weight entry:', error);
        
        // Check if it's a 404 error specifically
        const errorMessage = error instanceof Error ? error.message : String(error);
        const isNotFound = errorMessage.includes('not found') || errorMessage.includes('404');
        
        if (isNotFound) {
          // For 404 errors, automatically refresh and remove from local state
          Alert.alert(
            'Registro Não Encontrado',
            'Este registro não existe mais no servidor. A lista será atualizada automaticamente.',
            [{ 
              text: 'OK',
              onPress: async () => {
                await refreshWeightHistory();
                onRefresh?.();
              }
            }]
          );
        } else {
          Alert.alert(
            'Erro ao Excluir',
            'Não foi possível excluir o registro. Verifique sua conexão e tente novamente.',
            [{ text: 'OK' }]
          );
        }
      } finally {
        setDeletingId(null);
      }
    };

    const renderWeightEntry = ({ item }: { item: WeightEntry }) => (
      <WeightEntryCard
        entry={item}
        onDelete={handleDelete}
        isDeleting={deletingId === item.id}
      />
    );

    const renderEmptyState = () => (
      <View style={styles.emptyContainer}>
        <FontAwesome6 name="weight-scale" size={48} color={GRAY} />
        <Text style={styles.emptyTitle}>Nenhum registro de peso</Text>
        <Text style={styles.emptySubtitle}>
          Adicione seu primeiro peso para começar a acompanhar sua jornada!
        </Text>
      </View>
    );

    const renderHeader = () => (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Histórico de Peso</Text>
            <Text style={styles.headerSubtitle}>
              {sortedWeightHistory.length} registro{sortedWeightHistory.length !== 1 ? 's' : ''} • Ordenado por mais recente
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={handleManualRefresh}
            disabled={loading}
          >
            <FontAwesome6 
              name="arrow-rotate-right" 
              size={16} 
              color={loading ? GRAY : CORAL} 
            />
          </TouchableOpacity>
        </View>
      </View>
    );

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        backgroundStyle={styles.bottomSheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <BottomSheetView style={styles.container}>
          {renderHeader()}
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={CORAL} />
              <Text style={styles.loadingText}>Carregando histórico...</Text>
            </View>
          ) : sortedWeightHistory.length === 0 ? (
            renderEmptyState()
          ) : (
            <FlatList
              data={sortedWeightHistory}
              renderItem={renderWeightEntry}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OFF_WHITE,
  },
  bottomSheetBackground: {
    backgroundColor: OFF_WHITE,
  },
  handleIndicator: {
    backgroundColor: BORDER,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: GRAY,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: OFF_WHITE,
    borderWidth: 1,
    borderColor: BORDER,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  cardContainer: {
    position: 'relative',
    height: 70,
  },
  cardWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: 'white',
    zIndex: 1,
  },
  card: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  weightText: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dateText: {
    fontSize: 14,
    color: GRAY,
  },
  deleteButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 120,
    height: '100%',
    backgroundColor: RED,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  separator: {
    height: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: GRAY,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: GRAY,
    marginTop: 12,
  },
});