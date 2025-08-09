import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useProgress } from '../../contexts/ProgressContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateDateRange, PeriodKey, getCurrentDate } from '../../utils/dateUtils';
import { WeightInputModal } from '../../components/WeightInputModal';
import { formatWeightWithUnit } from '../../utils/weightUtils';
import { formatNumber } from '../../utils/formatters';

const CORAL = '#FF725E';
const TEXT_DARK = '#1F2937';
const TEXT_LIGHT = '#64748b';
const BORDER_LIGHT = '#e2e8f0';

const PERIODS = [
  { label: '7 Dias', value: '7d' },
  { label: '30 Dias', value: '30d' },
  { label: '3 Meses', value: '3m' },
];
// Real data will be fetched from the backend

export default function ProgressScreen() {
  const { user } = useAuth();
  const { 
    weightHistory, 
    calorieProgress, 
    progressSummary,
    dayStreak,
    weeklyStreakData,
    loading, 
    error,
    addWeightEntry, 
    refreshWeightHistory,
    refreshCalorieProgress, 
    refreshProgressSummary 
  } = useProgress();

  // Add error boundary state
  const [hasError, setHasError] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const weightModalRef = useRef<BottomSheetModal>(null);
  
  const [period, setPeriod] = useState<PeriodKey>('7d');
  const router = useRouter();

  // Get date range for current period
  const dateRange = calculateDateRange(period);
  
  // Get current weight - prioritize user profile weight, fallback to latest history entry
  const currentWeight = user?.weight || (weightHistory && weightHistory.length > 0 ? weightHistory[weightHistory.length - 1]?.weight : null);
  
  // Debug logging for weight display
  console.log('ProgressScreen: Current weight display:', {
    userWeight: user?.weight,
    latestHistoryWeight: weightHistory && weightHistory.length > 0 ? weightHistory[weightHistory.length - 1]?.weight : null,
    finalCurrentWeight: currentWeight,
    weightHistoryLength: weightHistory?.length
  });
  
  // Get weight data for current period
  const weights = weightHistory ? weightHistory
    .filter(entry => {
      try {
        const entryDate = new Date(entry.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return entryDate >= startDate && entryDate <= endDate;
      } catch (error) {
        console.error('Error filtering weight entry:', error);
        return false;
      }
    })
    .map(entry => entry.weight) : [];

  // Calculate daily average and days on target from real data - COMMENTED OUT FOR MVP
  // TODO: Re-enable when calorie analysis cards are implemented
  // const avg = progressSummary ? Math.round(progressSummary.averageCalories || 0) : 0;
  // const daysOnTarget = progressSummary ? progressSummary.daysOnTarget || 0 : 0;
  // const totalDays = progressSummary ? progressSummary.totalDays || 0 : 0;

  // Handle weight update from modal
  const handleUpdateWeight = async (weightValue: number) => {
    if (!user?.uid) return;

    try {
      await addWeightEntry(weightValue, getCurrentDate());
      
      // Show success message
      Alert.alert('Sucesso', 'Peso atualizado com sucesso!');
      
      // Scroll back to top to show updated weight
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 500);
    } catch (err: any) {
      Alert.alert('Erro', 'Falha ao adicionar peso: ' + err.message);
    }
  };

  // Open weight input modal
  const openWeightModal = () => {
    weightModalRef.current?.present();
  };

  // Handle period change
  const handlePeriod = async (val: PeriodKey) => {
    setPeriod(val);
    const newDateRange = calculateDateRange(val);
    
    try {
      await Promise.all([
        refreshCalorieProgress(val, newDateRange.startDate, newDateRange.endDate),
        refreshProgressSummary(val, newDateRange.startDate, newDateRange.endDate)
      ]);
    } catch (err: any) {
      console.error('Failed to refresh data for period:', err);
    }
  };

  // Load data when component mounts or period changes
  useEffect(() => {
    const loadData = async () => {
      try {
        setHasError(false);
        await Promise.all([
          refreshWeightHistory(), // Add weight history refresh
          refreshCalorieProgress(period, dateRange.startDate, dateRange.endDate),
          refreshProgressSummary(period, dateRange.startDate, dateRange.endDate)
        ]);
      } catch (err: any) {
        console.error('Failed to load progress data:', err);
        setHasError(true);
      }
    };

    if (user?.uid) {
      loadData();
    }
  }, [user?.uid, period]);

  // Chart config
  const chartConfig = {
    backgroundGradientFrom: '#fff',
    backgroundGradientTo: '#fff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 114, 94, ${opacity})`,
    labelColor: () => TEXT_DARK,
    propsForBackgroundLines: {
      stroke: '#eee',
    },
    propsForLabels: {
      fontSize: 11,
    },
  };

  const screenWidth = Dimensions.get('window').width - 36;
  const chartCardWidth = Dimensions.get('window').width - 48; // reduce more for padding

  // Error boundary - if there's a critical error, show error screen
  if (hasError) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, color: TEXT_DARK, marginBottom: 20, textAlign: 'center' }}>
          Erro ao carregar dados de progresso
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={() => {
            setHasError(false);
            const dateRange = calculateDateRange(period);
            Promise.all([
              refreshCalorieProgress(period, dateRange.startDate, dateRange.endDate),
              refreshProgressSummary(period, dateRange.startDate, dateRange.endDate)
            ]);
          }}
        >
          <Text style={styles.retryButtonText}>Tentar Novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={{ flex: 1, backgroundColor: '#fff', paddingTop: 36 }} 
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <Text style={styles.title}>Progresso</Text>
      
      {/* Error Messages */}
      {(error.calories || error.summary || error.weight) && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {error.calories || error.summary || error.weight}
          </Text>
          <TouchableOpacity 
            style={styles.retryButton} 
            onPress={() => {
              const dateRange = calculateDateRange(period);
              Promise.all([
                refreshCalorieProgress(period, dateRange.startDate, dateRange.endDate),
                refreshProgressSummary(period, dateRange.startDate, dateRange.endDate)
              ]);
            }}
          >
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Top Cards Section */}
      <View style={styles.topCardsRow}>
        {/* My Weight Card */}
        <View style={styles.topCard}>
          <Text style={styles.topCardLabel}>Meu Peso</Text>
          <Text style={styles.topCardValue}>
            {currentWeight ? formatWeightWithUnit(currentWeight) : '--'}
          </Text>
          {user?.targetWeight && currentWeight && (
            <View style={styles.progressBarContainer}>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressBarFill, 
                                      { 
                    width: `${Math.min(100, Math.max(0, ((user.weight || 0) - currentWeight) / ((user.weight || 0) - user.targetWeight) * 100))}%` 
                  }
                  ]} 
                />
              </View>
              <Text style={styles.progressBarText}>Meta {user.targetWeight} kg</Text>
            </View>
          )}
          <TouchableOpacity style={styles.logWeightButton} onPress={openWeightModal}>
            <Text style={styles.logWeightButtonText}>Registrar peso</Text>
            <Text style={styles.logWeightButtonArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Day Streak Card */}
        <View style={styles.topCard}>
          <View style={styles.streakIconContainer}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakNumber}>{formatNumber(dayStreak)}</Text>
          </View>
          <Text style={styles.streakLabel}>Sequência de Dias</Text>
          <View style={styles.weekDotsContainer}>
            {weeklyStreakData.map((logged, index) => (
              <View 
                key={index} 
                style={[
                  styles.weekDot, 
                  logged && styles.weekDotFilled
                ]} 
              />
            ))}
          </View>
          <Text style={styles.weekDaysText}>S T Q Q S S D</Text>
        </View>
      </View>

      {/* Period Tabs */}
      <View style={styles.tabsRow}>
        {PERIODS.map(p => (
          <TouchableOpacity
            key={p.value}
            style={[styles.tab, period === p.value && styles.tabActive]}
            onPress={() => handlePeriod(p.value as PeriodKey)}
          >
            <Text style={[styles.tabText, period === p.value && styles.tabTextActive]}>{p.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Goal Progress Chart */}
      <View style={[styles.card, { paddingHorizontal: 8, overflow: 'hidden' }]}>
        <Text style={styles.cardTitle}>Calorias - Meta Diária e Consumo</Text>
        
        {/* Calorie Chart */}
        <View style={{ marginTop: 12 }}>
          {loading.calories ? (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Carregando dados...</Text>
            </View>
          ) : calorieProgress && calorieProgress.length > 0 ? (
            <View>
              {/* Chart Legend */}
              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: '#e5e7eb' }]} />
                  <Text style={styles.legendText}>Meta</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: CORAL }]} />
                  <Text style={styles.legendText}>Consumido</Text>
                </View>
              </View>

              {/* Custom Calorie Bar Chart */}
              <View style={styles.customChart}>
                {/* Y-axis labels */}
                <View style={styles.yAxisLabels}>
                  <Text style={styles.yAxisLabel}>2200</Text>
                  <Text style={styles.yAxisLabel}>1650</Text>
                  <Text style={styles.yAxisLabel}>1100</Text>
                  <Text style={styles.yAxisLabel}>550</Text>
                  <Text style={styles.yAxisLabel}>0</Text>
                </View>
                
                {/* Chart area */}
                <View style={styles.chartArea}>
                  {/* Grid lines */}
                  <View style={styles.gridLines}>
                    {[0, 1, 2, 3, 4].map(i => (
                      <View key={i} style={styles.gridLine} />
                    ))}
                  </View>
                  
                  {/* Bars */}
                  <View style={period === '7d' ? styles.barsContainer : styles.barsContainer30}>
                    {(() => {
                      // Determine number of days based on period
                      const numDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
                      const today = new Date();
                      const lastDays = [];
                      
                      for (let i = numDays - 1; i >= 0; i--) {
                        const date = new Date(today);
                        date.setDate(today.getDate() - i);
                        lastDays.push(date);
                      }
                      
                      return lastDays.map((date, index) => {
                        // Find matching calorie data for this date
                        const dateStr = date.toISOString().split('T')[0];
                        const entry = calorieProgress.find(entry => entry.date === dateStr);
                        
                        const maxCalories = 2200;
                        // Use user's calorie goal or entry goal or default to 2000
                        const userGoal = user?.calories || entry?.goal || 2000;
                        const goalHeight = (userGoal / maxCalories) * 140;
                        const consumedHeight = entry ? (entry.consumed / maxCalories) * 140 : 0;
                        
                        return (
                          <View key={index} style={period === '7d' ? styles.barGroup : styles.barGroup30}>
                            {/* Goal bar (gray) - always show for every day */}
                            <View 
                              style={[
                                period === '7d' ? styles.bar : styles.bar30, 
                                styles.goalBar,
                                { height: Math.max(goalHeight, 2) } // Smaller minimum for 30-day
                              ]} 
                            />
                            {/* Consumed bar (coral) - only show if there's data */}
                            {entry && consumedHeight > 0 && (
                              <View 
                                style={[
                                  period === '7d' ? styles.bar : styles.bar30, 
                                  styles.consumedBar,
                                  { height: consumedHeight }
                                ]} 
                              />
                            )}
                          </View>
                        );
                      });
                    })()}
                  </View>
                </View>
                
                {/* X-axis labels - only show for 7-day period */}
                {period === '7d' && (
                  <View style={styles.xAxisLabels}>
                    {(() => {
                      // Create array of last 7 days ending with today
                      const today = new Date();
                      const last7Days = [];
                      for (let i = 6; i >= 0; i--) {
                        const date = new Date(today);
                        date.setDate(today.getDate() - i);
                        last7Days.push(date);
                      }
                      
                      const dayAbbreviations = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
                      
                      return last7Days.map((date, index) => (
                        <Text key={index} style={styles.xAxisLabel}>
                          {dayAbbreviations[date.getDay()]}
                        </Text>
                      ));
                    })()}
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.noWeight}>Nenhum dado de calorias disponível para este período</Text>
            </View>
          )}
        </View>
      </View>

      {/* Weekly Calorie Report */}
      <View style={[styles.card, { paddingHorizontal: 8, overflow: 'hidden' }]}>
        <Text style={styles.cardTitle}>Balanço Semanal</Text>
        {/* Calorie Chart with Placeholder Overlay */}
        <View style={{ position: 'relative', height: 180 }}>
          {loading.calories ? (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Carregando dados...</Text>
            </View>
          ) : calorieProgress && calorieProgress.length > 0 ? (
            <View style={{ position: 'relative', height: 180, width: chartCardWidth, alignSelf: 'center' }}>
              {/* Planned (background) bars */}
              <BarChart
                data={{
                  labels: dateRange.labels,
                  datasets: [
                    { data: (calorieProgress || []).map(d => d.goal || 0) },
                  ],
                }}
                width={chartCardWidth}
                height={180}
                yAxisSuffix=""
                yAxisLabel=""
                fromZero
                showBarTops={false}
                chartConfig={{
                  ...chartConfig,
                  color: () => '#FFE0DA',
                }}
                style={{ borderRadius: 16, position: 'absolute', top: 0, left: 0 }}
                withInnerLines={false}
                withHorizontalLabels={false}
                withCustomBarColorFromData={false}
                segments={5}
              />
              {/* Actual (foreground) bars */}
              <BarChart
                data={{
                  labels: dateRange.labels,
                  datasets: [
                    { data: (calorieProgress || []).map(d => d.consumed || 0) },
                  ],
                }}
                width={chartCardWidth}
                height={180}
                yAxisSuffix=""
                yAxisLabel=""
                fromZero
                showBarTops={false}
                chartConfig={{
                  ...chartConfig,
                  color: () => CORAL,
                }}
                style={{ borderRadius: 16, position: 'absolute', top: 0, left: 0 }}
                withInnerLines={false}
                withHorizontalLabels={false}
                withCustomBarColorFromData={false}
                segments={5}
              />
            </View>
          ) : (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Nenhum dado de calorias disponível</Text>
            </View>
          )}
          
          {/* Placeholder Overlay */}
          <View style={styles.chartPlaceholder}>
            <View style={styles.comingSoonBadge}>
              <Text style={styles.comingSoonText}>EM BREVE</Text>
            </View>
            <Text style={styles.placeholderTitle}>📈 Análise Detalhada</Text>
            <Text style={styles.placeholderText}>
              Gráficos avançados de calorias e macros em desenvolvimento!
            </Text>
            <Text style={styles.placeholderSubtext}>
              Em breve você terá insights mais profundos sobre sua nutrição.
            </Text>
          </View>
        </View>
        
        {/* Calorie Insight - COMMENTED OUT FOR MVP
        TODO: Re-enable when calorie analysis is fully implemented
        This provides insights about average calories and days on target */}
        {/* {progressSummary && (
          <Text style={styles.calorieInsight}>
            {progressSummary.averageCalories > 0 ? 
              `Em média, você consumiu ${Math.round(progressSummary.averageCalories)} kcal esta semana, ${progressSummary.daysOnTarget >= progressSummary.totalDays * 0.7 ? 'atingindo sua meta na maioria dos dias. Ótimo trabalho!' : 'ficando abaixo da sua meta. Continue se esforçando!'}` :
              'Comece a registrar suas refeições para ver seu progresso!'
            }
          </Text>
        )} */}
      </View>
      {/* Daily Average and Days on Target - COMMENTED OUT FOR MVP
      TODO: Re-enable when calorie tracking and analysis is fully implemented
      These cards show daily calorie average and days on target vs total days */}
      {/* <View style={styles.rowCards}>
        <View style={styles.smallCard}>
          <Text style={styles.smallCardLabel}>Média diária</Text>
          <Text style={styles.smallCardValue}>{avg} <Text style={{ fontSize: 14, color: '#64748b' }}>kcal</Text></Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.smallCardLabel}>Dias na meta</Text>
          <Text style={styles.smallCardValue}>{daysOnTarget} <Text style={{ fontSize: 14, color: '#64748b' }}>/ {totalDays} dias</Text></Text>
        </View>
      </View> */}


      {/* Weight Input Modal */}
      <WeightInputModal
        ref={weightModalRef}
        onSave={handleUpdateWeight}
        currentWeight={currentWeight || undefined}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginTop: 72,
    marginBottom: 12,
    marginLeft: 20,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9F6F5',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 4,
    alignSelf: 'flex-start',
  },
  tab: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: CORAL,
  },
  tabText: {
    color: CORAL,
    fontWeight: 'bold',
    fontSize: 15,
  },
  tabTextActive: {
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 6,
  },
  rowCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 18,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    marginRight: 10,
    padding: 16,
    alignItems: 'flex-start',
  },
  smallCardLabel: {
    color: TEXT_DARK,
    fontSize: 14,
    marginBottom: 6,
  },
  smallCardValue: {
    color: TEXT_DARK,
    fontSize: 22,
    fontWeight: 'bold',
  },
  weightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER_LIGHT,
    marginHorizontal: 16,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  weightTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginBottom: 8,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  weightValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: TEXT_DARK,
    marginRight: 12,
  },
  weightUnit: {
    fontSize: 16,
    color: '#64748b',
  },
  weightInput: {
    borderWidth: 1.5,
    borderColor: BORDER_LIGHT,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    color: TEXT_DARK,
    width: 60,
    marginRight: 8,
    backgroundColor: '#fff',
  },
  updateBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: CORAL,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  updateBtnText: {
    color: CORAL,
    fontWeight: 'bold',
    fontSize: 15,
  },
  noWeight: {
    color: '#A0AEC0',
    fontSize: 15,
    marginTop: 16,
    textAlign: 'center',
  },

  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginBottom: 8,
  },
  retryButton: {
    backgroundColor: CORAL,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'flex-start',
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  // Top Cards Styles
  topCardsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginBottom: 18,
  },
  topCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  topCardLabel: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 8,
  },
  topCardValue: {
    color: TEXT_DARK,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  topCardUnit: {
    fontSize: 16,
    color: '#64748b',
  },
  progressBarContainer: {
    marginBottom: 12,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    marginBottom: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: CORAL,
    borderRadius: 2,
  },
  progressBarText: {
    color: '#64748b',
    fontSize: 12,
  },
  logWeightButton: {
    backgroundColor: TEXT_DARK,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logWeightButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logWeightButtonArrow: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Streak Styles
  streakIconContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  streakIcon: {
    fontSize: 32,
    marginBottom: 4,
  },
  streakNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: CORAL,
    position: 'absolute',
    top: 8,
  },
  streakLabel: {
    color: CORAL,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  weekDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  weekDotFilled: {
    backgroundColor: CORAL,
  },
  weekDaysText: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
  },
  // Insight Styles
  progressInsight: {
    color: '#059669',
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    textAlign: 'center',
  },
  calorieInsight: {
    color: '#059669',
    fontSize: 14,
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#d1fae5',
    borderRadius: 8,
    textAlign: 'center',
  },
  // Placeholder Overlay Styles
  chartPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: CORAL,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    fontSize: 14,
    color: TEXT_DARK,
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 20,
  },
  placeholderSubtext: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 16,
  },
  comingSoonBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: CORAL,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  comingSoonText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: TEXT_DARK,
  },
  customChart: {
    flexDirection: 'row',
    height: 180,
    marginHorizontal: 8,
  },
  yAxisLabels: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingVertical: 20,
  },
  yAxisLabel: {
    fontSize: 11,
    color: TEXT_LIGHT,
  },
  chartArea: {
    flex: 1,
    position: 'relative',
    marginVertical: 20,
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    backgroundColor: '#f1f5f9',
  },
  barsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 12,
  },
  barGroup: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 1,
    height: 140,
  },
  bar: {
    width: 20,
    borderRadius: 2,
    position: 'absolute',
    bottom: 0,
  },
  goalBar: {
    backgroundColor: '#e5e7eb',
  },
  consumedBar: {
    backgroundColor: CORAL,
  },
  xAxisLabels: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 12,
  },
  xAxisLabel: {
    fontSize: 9,
    color: TEXT_DARK,
    textAlign: 'center',
    flex: 1,
  },
  // 30-day specific styles
  barsContainer30: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 4,
  },
  barGroup30: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 8,
    height: 140,
  },
  bar30: {
    width: 6,
    borderRadius: 1,
    position: 'absolute',
    bottom: 0,
  },
});