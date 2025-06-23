
import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface AddMealModalProps {
  visible: boolean;
  onClose: () => void;
  mealType: 'breakfast' | 'lunch' | 'dinner';
}

export default function AddMealModal({ visible, onClose, mealType }: AddMealModalProps) {
  const [foodName, setFoodName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  const mealTitles = {
    breakfast: 'Café da Manhã',
    lunch: 'Lanche da Manhã',
    dinner: 'Almoço',
  };

  const handleSave = () => {
    if (!foodName || !quantity || !calories) {
      Alert.alert('Erro', 'Preencha todos os campos obrigatórios');
      return;
    }

    // Here you would save to your backend/Firebase
    console.log('Saving meal:', {
      mealType,
      foodName,
      quantity,
      calories,
      protein,
      carbs,
      fat,
    });

    // Reset form
    setFoodName('');
    setQuantity('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFat('');
    
    onClose();
    Alert.alert('Sucesso', 'Alimento adicionado com sucesso!');
  };

  const analyzeWithAI = async () => {
    if (!foodName) {
      Alert.alert('Erro', 'Digite o nome do alimento primeiro');
      return;
    }

    Alert.alert('IA', 'Analisando alimento com ChatGPT...');
    
    // Here you would call your ChatGPT API
    // For now, we'll simulate the response
    setTimeout(() => {
      setCalories('150');
      setProtein('8');
      setCarbs('20');
      setFat('5');
      Alert.alert('IA', 'Análise concluída! Valores estimados foram preenchidos.');
    }, 2000);
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelButton}>Cancelar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Adicionar a {mealTitles[mealType]}</Text>
          <TouchableOpacity onPress={handleSave}>
            <Text style={styles.saveButton}>Salvar</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome do Alimento *</Text>
            <TextInput
              style={styles.input}
              value={foodName}
              onChangeText={setFoodName}
              placeholder="Ex: Banana, Frango grelhado..."
            />
          </View>

          <TouchableOpacity style={styles.aiButton} onPress={analyzeWithAI}>
            <Ionicons name="sparkles" size={20} color="#FFF" />
            <Text style={styles.aiButtonText}>Analisar com IA</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Quantidade *</Text>
            <TextInput
              style={styles.input}
              value={quantity}
              onChangeText={setQuantity}
              placeholder="Ex: 100g, 1 unidade..."
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calorias (kcal) *</Text>
            <TextInput
              style={styles.input}
              value={calories}
              onChangeText={setCalories}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>Proteína (g)</Text>
              <TextInput
                style={styles.input}
                value={protein}
                onChangeText={setProtein}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>Carboidratos (g)</Text>
              <TextInput
                style={styles.input}
                value={carbs}
                onChangeText={setCarbs}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Gordura (g)</Text>
            <TextInput
              style={styles.input}
              value={fat}
              onChangeText={setFat}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelButton: {
    color: '#666',
    fontSize: 16,
  },
  saveButton: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  aiButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  aiButtonText: {
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 10,
  },
});
