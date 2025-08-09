import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView, Alert } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useProgress } from '../../contexts/ProgressContext';
import { useAuth } from '../../contexts/AuthContext';
import { calculateDateRange, PeriodKey, getCurrentDate } from '../../utils/dateUtils';
import { WeightInputModal } from '../../components/WeightInputModal';
import { WeightHistoryBottomSheet } from '../../components/WeightHistoryBottomSheet';
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
  const weightHistoryRef = useRef<BottomSheetModal>(null);
  
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
          <Text style={styles.streakLabel}>Day Streak</Text>
          
          {/* Motivational message based on streak */}
          <Text style={styles.streakMotivation}>
            {dayStreak === 0 ? 'Comece hoje!' : 
             dayStreak === 1 ? 'Ótimo começo!' :
             dayStreak < 7 ? `${dayStreak} dias seguidos!` :
             dayStreak < 30 ? `${dayStreak} dias - Continue!` :
             `${dayStreak} dias - Incrível!`}
          </Text>
          
          {/* Week dots with proper Monday-Sunday mapping */}
          <View style={styles.weekDotsContainer}>
            {(() => {
              // Create Monday-Sunday array
              // weeklyStreakData from backend: [today, yesterday, day-2, day-3, day-4, day-5, day-6]
              const today = new Date();
              const mondayToSundayData = Array(7).fill(false);
              
              // For each of the last 7 days, determine which day of week it was
              for (let i = 0; i < Math.min(7, weeklyStreakData.length); i++) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                
                let dayOfWeek = date.getDay(); // 0=Sunday, 1=Monday, ..., 6=Saturday
                // Convert to our array index where 0=Monday, 6=Sunday
                const arrayIndex = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
                
                mondayToSundayData[arrayIndex] = weeklyStreakData[i];
              }
              
              return mondayToSundayData.map((logged, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.weekDot, 
                    logged && styles.weekDotFilled
                  ]} 
                />
              ));
            })()}
          </View>
          <View style={styles.weekDaysRow}>
            <Text style={styles.weekDayText}>S</Text>
            <Text style={styles.weekDayText}>T</Text>
            <Text style={styles.weekDayText}>Q</Text>
            <Text style={styles.weekDayText}>Q</Text>
            <Text style={styles.weekDayText}>S</Text>
            <Text style={styles.weekDayText}>S</Text>
            <Text style={styles.weekDayText}>D</Text>
          </View>
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
                {(() => {
                  // Helper function to calculate dynamic max calories for all periods
                  const calculateDynamicMaxCalories = () => {
                    // Determine number of days based on period
                    const numDays = period === '7d' ? 7 : period === '30d' ? 30 : 90;
                    const today = new Date();
                    const lastDays = [];
                    
                    for (let i = numDays - 1; i >= 0; i--) {
                      const date = new Date(today);
                      date.setDate(today.getDate() - i);
                      lastDays.push(date);
                    }
                    
                    const periodData = lastDays.map(date => {
                      const dateStr = date.toISOString().split('T')[0];
                      return calorieProgress.find(entry => entry.date === dateStr);
                    }).filter(Boolean);
                    
                    const maxGoal = Math.max(
                      user?.calories || 2000,
                      ...periodData.map(entry => entry?.goal || 0)
                    );
                    
                    const maxConsumed = Math.max(
                      0,
                      ...periodData.map(entry => entry?.consumed || 0)
                    );
                    
                    const absoluteMax = Math.max(maxGoal, maxConsumed);
                    const bufferedMax = absoluteMax * 1.15; // 15% buffer
                    const roundedMax = Math.ceil(bufferedMax / 250) * 250;
                    const dynamicMax = Math.max(2500, Math.min(8000, roundedMax));
                    
                    console.log(`${period} Dynamic Scale Calculation:`, {
                      numDays,
                      maxGoal,
                      maxConsumed,
                      absoluteMax,
                      bufferedMax,
                      dynamicMax
                    });
                    
                    return dynamicMax;
                  };
                  
                  const dynamicMaxCalories = calculateDynamicMaxCalories();
                  
                  // Generate Y-axis labels based on dynamic max for all periods
                  const yAxisLabels = [
                    dynamicMaxCalories,           // 100%
                    Math.round(dynamicMaxCalories * 0.75),  // 75%
                    Math.round(dynamicMaxCalories * 0.5),   // 50%
                    Math.round(dynamicMaxCalories * 0.25),  // 25%
                    0                             // 0%
                  ];
                  
                  console.log(`${period} Dynamic Scale (Y-axis):`, {
                    period,
                    dynamicMaxCalories,
                    yAxisLabels
                  });
                  
                  return (
                    <>
                      {/* Y-axis labels */}
                      <View style={styles.yAxisLabels}>
                        {yAxisLabels.map((label, index) => (
                          <Text key={index} style={styles.yAxisLabel}>{label}</Text>
                        ))}
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
                  <View style={
                    period === '7d' ? styles.barsContainer : 
                    period === '30d' ? styles.barsContainer30 : 
                    styles.barsContainer90
                  }>
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
                        
                        const maxCalories = dynamicMaxCalories; // Use the shared calculation
                        // Use user's calorie goal or entry goal or default to 2000
                        const userGoal = user?.calories || entry?.goal || 2000;
                        const goalHeight = (userGoal / maxCalories) * 140;
                        const consumedHeight = entry ? (entry.consumed / maxCalories) * 140 : 0;
                        
                        return (
                          <View key={index} style={
                            period === '7d' ? styles.barGroup : 
                            period === '30d' ? styles.barGroup30 : 
                            styles.barGroup90
                          }>
                            {/* Goal bar (gray) - always show for every day */}
                            <View 
                              style={[
                                period === '7d' ? styles.bar : 
                                period === '30d' ? styles.bar30 : 
                                styles.bar90,
                                styles.goalBar,
                                { height: Math.max(goalHeight, period === '3m' ? 1 : 2) } // Even smaller minimum for 3-month
                              ]} 
                            />
                            {/* Consumed bar (coral) - only show if there's data */}
                            {entry && consumedHeight > 0 && (
                              <View 
                                style={[
                                  period === '7d' ? styles.bar : 
                                  period === '30d' ? styles.bar30 : 
                                  styles.bar90,
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
                    </>
                  );
                })()}
              </View>
            </View>
          ) : (
            <View style={{ height: 180, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.noWeight}>Nenhum dado de calorias disponível para este período</Text>
            </View>
          )}
        </View>
      </View>

      {/* Weight Journey Chart */}
      <TouchableOpacity 
        style={[styles.card, { paddingHorizontal: 8, overflow: 'hidden' }]}
        onPress={() => weightHistoryRef.current?.present()}
        activeOpacity={0.7}
      >
        <View style={styles.weightChartHeader}>
          <Text style={styles.cardTitle}>Peso - Meta e Histórico</Text>
          {user?.targetWeight && currentWeight && user?.weight && (
            <View style={styles.goalProgress}>
              <Text style={styles.goalProgressText}>
                {(() => {
                  const startWeight = user.weight;
                  const targetWeight = user.targetWeight;
                  const current = currentWeight;
                  const totalToLose = startWeight - targetWeight;
                  const alreadyLost = startWeight - current;
                  const progress = Math.max(0, Math.min(100, Math.round((alreadyLost / totalToLose) * 100)));
                  return `${progress}% da meta`;
                })()}
              </Text>
            </View>
          )}
        </View>
        
        <View style={{ marginTop: 12 }}>
          {loading.weight ? (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#64748b' }}>Carregando dados de peso...</Text>
            </View>
          ) : weightHistory && weightHistory.length > 0 ? (
            <View>
              {/* Weight trend chart */}
              <LineChart
                data={{
                  labels: (() => {
                    // Group by date and get the latest weight for each day
                    const groupedByDate = weightHistory.reduce((acc, entry) => {
                      const dateKey = entry.date.split('T')[0]; // Get just the date part
                      if (!acc[dateKey] || new Date(entry.createdAt || entry.date) > new Date(acc[dateKey].createdAt || acc[dateKey].date)) {
                        acc[dateKey] = entry;
                      }
                      return acc;
                    }, {} as Record<string, any>);
                    
                    // Sort by date (oldest first) and take last 10
                    const sortedEntries = Object.values(groupedByDate)
                      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                      .slice(-10);
                    
                    return sortedEntries.map(entry => {
                      const date = new Date(entry.date);
                      return `${date.getMonth() + 1}/${date.getDate()}`;
                    });
                  })(),
                  datasets: [
                    {
                      data: (() => {
                        // Group by date and get the latest weight for each day
                        const groupedByDate = weightHistory.reduce((acc, entry) => {
                          const dateKey = entry.date.split('T')[0];
                          if (!acc[dateKey] || new Date(entry.createdAt || entry.date) > new Date(acc[dateKey].createdAt || acc[dateKey].date)) {
                            acc[dateKey] = entry;
                          }
                          return acc;
                        }, {} as Record<string, any>);
                        
                        // Sort by date (oldest first) and take last 10
                        const sortedEntries = Object.values(groupedByDate)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(-10);
                        
                        return sortedEntries.map(entry => entry.weight);
                      })(),
                      color: (opacity = 1) => `rgba(255, 114, 94, ${opacity})`,
                      strokeWidth: 3,
                    },
                    // Goal line dataset - stronger horizontal line
                    ...(user?.targetWeight ? [{
                      data: (() => {
                        const groupedByDate = weightHistory.reduce((acc, entry) => {
                          const dateKey = entry.date.split('T')[0];
                          if (!acc[dateKey] || new Date(entry.createdAt || entry.date) > new Date(acc[dateKey].createdAt || acc[dateKey].date)) {
                            acc[dateKey] = entry;
                          }
                          return acc;
                        }, {} as Record<string, any>);
                        
                        const sortedEntries = Object.values(groupedByDate)
                          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                          .slice(-10);
                        
                        return Array(sortedEntries.length).fill(user.targetWeight);
                      })(),
                      color: (opacity = 1) => `rgba(59, 130, 246, ${opacity})`, // Blue color for goal
                      strokeWidth: 4, // Thicker line
                      withDots: false, // No dots on goal line
                      strokeDashArray: [0], // Solid line (not dashed)
                    }] : [])
                  ],
                }}
                width={chartCardWidth}
                height={200}
                yAxisSuffix=" kg"
                chartConfig={{
                  backgroundColor: '#ffffff',
                  backgroundGradientFrom: '#ffffff',
                  backgroundGradientTo: '#ffffff',
                  decimalPlaces: 1,
                  color: (opacity = 1) => `rgba(255, 114, 94, ${opacity})`,
                  labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  style: {
                    borderRadius: 16,
                  },
                  propsForDots: {
                    r: '4',
                    strokeWidth: '2',
                    stroke: CORAL,
                    fill: '#ffffff',
                  },
                  propsForBackgroundLines: {
                    strokeDasharray: '5,5',
                    stroke: '#e2e8f0',
                    strokeOpacity: 0.5,
                  },
                  formatYLabel: (yValue) => `${parseFloat(yValue).toFixed(1)}`,
                }}
                bezier
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={false}
                fromZero={false}
                yAxisInterval={1}
                segments={5}
              />
              
              {/* Chart Legend */}
              {user?.targetWeight && (
                <View style={styles.chartLegend}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: CORAL }]} />
                    <Text style={styles.legendText}>Peso Atual</Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#3b82f6' }]} />
                    <Text style={styles.legendText}>Meta: {user.targetWeight}kg</Text>
                  </View>
                </View>
              )}
              
              {/* Weight insight */}
              <View style={styles.weightInsightContainer}>
                {user?.targetWeight && currentWeight ? (
                  <Text style={styles.weightInsight}>
                    {(() => {
                      const diff = Math.abs(currentWeight - user.targetWeight);
                      if (currentWeight > user.targetWeight) {
                        return `Faltam ${diff.toFixed(1)} kg para atingir sua meta!`;
                      } else if (Math.abs(currentWeight - user.targetWeight) < 0.1) {
                        return '🎉 Parabéns! Você atingiu sua meta de peso!';
                      } else {
                        return `🎉 Você já passou da sua meta! Está ${diff.toFixed(1)} kg abaixo!`;
                      }
                    })()}
                  </Text>
                ) : (
                  <Text style={styles.weightInsight}>
                    {weightHistory.length > 1 ? 
                      `Sua jornada: ${weightHistory.length} registros de peso` :
                      'Continue registrando seu peso para ver o progresso!'
                    }
                  </Text>
                )}
              </View>
            </View>
          ) : (
            <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ color: '#64748b', textAlign: 'center', paddingHorizontal: 20 }}>
                Nenhum dado de peso disponível.{'\n'}Registre seu peso para ver o gráfico!
              </Text>
            </View>
          )}
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
      </TouchableOpacity>
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

      {/* Weight History Bottom Sheet */}
      <WeightHistoryBottomSheet
        ref={weightHistoryRef}
        onRefresh={refreshWeightHistory}
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
    position: 'relative',
    height: 40,
    justifyContent: 'center',
  },
  streakIcon: {
    fontSize: 40,
    position: 'absolute',
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    position: 'absolute',
    textAlign: 'center',
    width: '100%',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
    zIndex: 1,
  },
  streakLabel: {
    color: CORAL,
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  streakMotivation: {
    color: '#059669',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  weekDotsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  weekDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#e2e8f0',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  weekDotFilled: {
    backgroundColor: CORAL,
    borderColor: CORAL,
    shadowColor: CORAL,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
  weekDaysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  weekDayText: {
    color: '#64748b',
    fontSize: 10,
    textAlign: 'center',
    width: 10,
  },
  // Weight Chart Styles
  weightChartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  goalProgress: {
    backgroundColor: '#f0f9ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e7ff',
  },
  goalProgressText: {
    color: '#1e40af',
    fontSize: 12,
    fontWeight: '600',
  },
  weightInsightContainer: {
    backgroundColor: '#f0fdf4',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  weightInsight: {
    color: '#059669',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
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
  // 3-month (90-day) specific styles
  barsContainer90: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingHorizontal: 2,
  },
  barGroup90: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 3,
    height: 140,
  },
  bar90: {
    width: 2,
    borderRadius: 0.5,
    position: 'absolute',
    bottom: 0,
  },
});