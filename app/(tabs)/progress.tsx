import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, TextInput, ScrollView } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';

const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

const PERIODS = [
  { label: '7 Dias', value: '7d' },
  { label: '30 Dias', value: '30d' },
  { label: '3 Meses', value: '3m' },
];

// Mocked calorie and weight data
type PeriodKey = '7d' | '30d' | '3m';
const MOCK_CALORIES: Record<PeriodKey, { labels: string[]; goal: number[]; consumed: number[] }> = {
  '7d': {
    labels: ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'],
    goal: [1800, 1800, 1800, 1800, 1800, 1800, 1800],
    consumed: [1700, 1800, 1800, 450, 1800, 600, 1350],
  },
  '30d': {
    labels: Array.from({ length: 30 }, (_, i) => `${i + 1}`),
    goal: Array(30).fill(1800),
    consumed: Array(30).fill(0).map(() => Math.floor(1200 + Math.random() * 800)),
  },
  '3m': {
    labels: Array.from({ length: 12 }, (_, i) => `Sem ${i + 1}`),
    goal: Array(12).fill(1800),
    consumed: Array(12).fill(0).map(() => Math.floor(1200 + Math.random() * 800)),
  },
};

const MOCK_WEIGHTS: Record<PeriodKey, number[]> = {
  '7d': [71.3, 71.2, 71.1, 71.0, 70.9, 70.8, 70.7],
  '30d': Array(30).fill(0).map((_, i) => 71.3 - i * 0.05),
  '3m': Array(12).fill(0).map((_, i) => 71.3 - i * 0.2),
};

export default function ProgressScreen() {
  const [period, setPeriod] = useState<PeriodKey>('7d');
  const [weight, setWeight] = useState('');
  const [weights, setWeights] = useState<number[]>(MOCK_WEIGHTS[period]);
  const [latestWeight, setLatestWeight] = useState<number | ''>(weights[weights.length - 1] || '');
  const router = useRouter();

  // Calculate daily average and days on target
  const calories = MOCK_CALORIES[period];
  const avg = Math.round(calories.consumed.reduce((a: number, b: number) => a + b, 0) / calories.consumed.length);
  const daysOnTarget = calories.consumed.filter((c: number, i: number) => c <= calories.goal[i]).length;

  // Handle weight update
  const handleUpdateWeight = () => {
    if (!weight) return;
    const newWeights = [...weights, parseFloat(weight)];
    setWeights(newWeights);
    setLatestWeight(parseFloat(weight));
    setWeight('');
  };

  // Handle period change
  const handlePeriod = (val: PeriodKey) => {
    setPeriod(val);
    setWeights(MOCK_WEIGHTS[val]);
    setLatestWeight(MOCK_WEIGHTS[val][MOCK_WEIGHTS[val].length - 1] || '');
  };

  // Chart config
  const chartConfig = {
    backgroundGradientFrom: OFF_WHITE,
    backgroundGradientTo: OFF_WHITE,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 114, 94, ${opacity})`,
    labelColor: () => TEXT,
    propsForBackgroundLines: {
      stroke: '#eee',
    },
    propsForLabels: {
      fontSize: 11,
    },
  };

  const screenWidth = Dimensions.get('window').width - 36;
  const chartCardWidth = Dimensions.get('window').width - 48; // reduce more for padding

  return (
    <ScrollView style={{ flex: 1, backgroundColor: OFF_WHITE, paddingTop: 36 }} contentContainerStyle={{ paddingBottom: 32 }}>
      <Text style={styles.title}>Progresso</Text>
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
      {/* Calories Chart Card */}
      <View style={[styles.card, { paddingHorizontal: 8, overflow: 'hidden' }]}>
        <Text style={styles.cardTitle}>Calorias</Text>
        <View style={{ position: 'relative', height: 180, width: chartCardWidth, alignSelf: 'center' }}>
          {/* Planned (background) bars */}
          <BarChart
            data={{
              labels: calories.labels,
              datasets: [
                { data: calories.goal },
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
              labels: calories.labels,
              datasets: [
                { data: calories.consumed },
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
      </View>
      {/* Daily Average and Days on Target */}
      <View style={styles.rowCards}>
        <View style={styles.smallCard}>
          <Text style={styles.smallCardLabel}>Média diária</Text>
          <Text style={styles.smallCardValue}>{avg} <Text style={{ fontSize: 14, color: '#64748b' }}>kcal</Text></Text>
        </View>
        <View style={styles.smallCard}>
          <Text style={styles.smallCardLabel}>Dias na meta</Text>
          <Text style={styles.smallCardValue}>{daysOnTarget} <Text style={{ fontSize: 14, color: '#64748b' }}>/ {calories.labels.length} dias</Text></Text>
        </View>
      </View>
      {/* Weight Card */}
      <View style={styles.weightCard}>
        <Text style={styles.weightTitle}>Peso</Text>
        <View style={styles.weightRow}>
          <Text style={styles.weightValue}>{latestWeight ? latestWeight.toFixed(1) : '--'} <Text style={styles.weightUnit}>kg</Text></Text>
          <TextInput
            style={styles.weightInput}
            value={weight}
            onChangeText={setWeight}
            placeholder="kg"
            keyboardType="numeric"
            placeholderTextColor="#A0AEC0"
          />
          <TouchableOpacity style={styles.updateBtn} onPress={handleUpdateWeight}>
            <Text style={styles.updateBtnText}>Atualizar</Text>
          </TouchableOpacity>
        </View>
        {/* Weight Chart */}
        {weights && weights.length > 1 ? (
          <LineChart
            data={{
              labels: calories.labels,
              datasets: [{ data: weights }],
            }}
            width={screenWidth - 24}
            height={120}
            yAxisSuffix="kg"
            yAxisLabel=""
            chartConfig={{
              ...chartConfig,
              color: () => CORAL,
              propsForDots: { r: '3', strokeWidth: '2', stroke: CORAL },
            }}
            bezier
            style={{ marginTop: 12, borderRadius: 12 }}
            withInnerLines={false}
            withHorizontalLabels={false}
          />
        ) : (
          <Text style={styles.noWeight}>Nenhum dado de peso disponível</Text>
        )}
      </View>
      {/* Back Button */}
      <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)/dashboard')}>
        <Text style={styles.backBtnText}>Voltar para o Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: TEXT,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 18,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: '#F9F6F5',
    borderRadius: 12,
    marginHorizontal: 18,
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
    borderRadius: 16,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: TEXT,
    marginBottom: 6,
  },
  rowCards: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginBottom: 18,
  },
  smallCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: BORDER,
    marginRight: 10,
    padding: 16,
    alignItems: 'flex-start',
  },
  smallCardLabel: {
    color: TEXT,
    fontSize: 14,
    marginBottom: 6,
  },
  smallCardValue: {
    color: TEXT,
    fontSize: 22,
    fontWeight: 'bold',
  },
  weightCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: BORDER,
    marginHorizontal: 18,
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
    color: TEXT,
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
    color: TEXT,
    marginRight: 12,
  },
  weightUnit: {
    fontSize: 16,
    color: '#64748b',
  },
  weightInput: {
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 16,
    color: TEXT,
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
  backBtn: {
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: CORAL,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignSelf: 'center',
    marginTop: 8,
  },
  backBtnText: {
    color: CORAL,
    fontWeight: 'bold',
    fontSize: 15,
  },
});