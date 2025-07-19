// app/auth/login.tsx   (repeat for register.tsx, index.tsx, _layout.tsx,
// dashboard.tsx, settings.tsx, etc.)
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { FontAwesome6 } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';
import { getAuth } from '@react-native-firebase/auth';

const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#FFA28F';
const TEXT = '#1F2937';

const GENDER_OPTIONS = [
  { label: 'Masculino', value: 'male' },
  { label: 'Feminino', value: 'female' },
  { label: 'Outro', value: 'other' },
];
const GOAL_OPTIONS = [
  { label: 'Perder Peso', value: 'lose' },
  { label: 'Ganhar Massa', value: 'gain' },
  { label: 'Manter Peso', value: 'maintain' },
];
const ACTIVITY_OPTIONS = [
  { label: 'Sedentário', value: 'sedentary' },
  { label: 'Levemente ativo', value: 'light' },
  { label: 'Moderadamente ativo', value: 'moderate' },
  { label: 'Muito ativo', value: 'active' },
  { label: 'Extremamente ativo', value: 'very_active' },
];

export default function ProfileScreen() {
  const { signOut, user, syncUser } = useAuth();
  const [loading, setLoading] = useState(false);

  // Profile fields
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [gender, setGender] = useState(user?.gender || null);
  const [openGender, setOpenGender] = useState(false);
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [profession, setProfession] = useState('');
  // Goals
  const [goal, setGoal] = useState(user?.goal || null);
  const [openGoal, setOpenGoal] = useState(false);
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight?.toString() || '');
  const [targetFat, setTargetFat] = useState('');
  const [activity, setActivity] = useState(user?.activityLevel || null);
  const [openActivity, setOpenActivity] = useState(false);
  // Nutrition
  const [calories, setCalories] = useState(user?.calories?.toString() || '');
  const [protein, setProtein] = useState(user?.protein?.toString() || '');
  const [carbs, setCarbs] = useState(user?.carbs?.toString() || '');
  const [fat, setFat] = useState(user?.fat?.toString() || '');

  // Load user data when component mounts or user changes
  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setEmail(user.email || '');
      setAge(user.age?.toString() || '');
      setGender(user.gender || null);
      setHeight(user.height?.toString() || '');
      setWeight(user.weight?.toString() || '');
      setGoal(user.goal || null);
      setTargetWeight(user.targetWeight?.toString() || '');
      setActivity(user.activityLevel || null);
      setCalories(user.calories?.toString() || '');
      setProtein(user.protein?.toString() || '');
      setCarbs(user.carbs?.toString() || '');
      setFat(user.fat?.toString() || '');
    }
  }, [user]);

  const handleLogout = async () => {
    Alert.alert(
      'Sair da conta',
      'Tem certeza que deseja sair da sua conta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sair',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível sair da conta. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const token = await getAuth().currentUser?.getIdToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const userData = {
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        height: height ? parseFloat(height) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        targetWeight: targetWeight ? parseFloat(targetWeight) : undefined,
        activityLevel: activity || undefined,
        goal: goal || undefined,
        calories: calories ? parseInt(calories) : undefined,
        protein: protein ? parseInt(protein) : undefined,
        carbs: carbs ? parseInt(carbs) : undefined,
        fat: fat ? parseInt(fat) : undefined,
      };

      await api.updateUserProfile(user.uid, userData, token);
      
      // Sync user data to update the context
      await syncUser();
      
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error: any) {
      console.error('Error saving profile:', error);
      Alert.alert('Erro', 'Não foi possível salvar o perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: OFF_WHITE, paddingTop: 36 }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header with Title and Logout */}
      <View style={styles.header}>
        <Text style={styles.title}>Perfil</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <FontAwesome6 name="arrow-right-from-bracket" size={20} color={CORAL} />
        </TouchableOpacity>
      </View>
      {/* Profile Card */}
      <View style={styles.profileCard}>
        <View style={{ alignItems: 'center', marginBottom: 8 }}>
          <Image source={require('../../assets/images/partial-react-logo.png')} style={styles.avatar} />
          <Text style={styles.profileName}>{name || 'Seu nome'}</Text>
          <Text style={styles.profileSince}>Membro desde junho 2025</Text>
        </View>
        <View style={styles.profileRow}>
          <View style={styles.profileInfoBox}><Text style={styles.profileInfoText}>{height || '--'} <Text style={styles.profileInfoUnit}>cm</Text></Text></View>
          <View style={styles.profileInfoBox}><Text style={styles.profileInfoText}>{weight || '--'} <Text style={styles.profileInfoUnit}>kg</Text></Text></View>
          <View style={styles.profileInfoBox}><Text style={styles.profileInfoText}>{age || '--'} <Text style={styles.profileInfoUnit}>anos</Text></Text></View>
        </View>
        <View style={styles.goalDisplay}>
          <Text style={styles.goalText}>
            Meta: {goal ? GOAL_OPTIONS.find(g => g.value === goal)?.label || goal : 'Não definida'}
          </Text>
        </View>
      </View>
      {/* Edit Profile Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Editar Perfil</Text>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#A0AEC0" />
        <Text style={styles.label}>Email</Text>
        <TextInput style={[styles.input, { backgroundColor: '#f3f3f3', color: '#A0AEC0' }]} value={email} onChangeText={setEmail} placeholder="Seu email" placeholderTextColor="#A0AEC0" editable={false} />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Idade</Text>
            <TextInput style={styles.input} value={age} onChangeText={setAge} placeholder="Idade" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Gênero</Text>
            <DropDownPicker
              open={openGender}
              value={gender}
              items={GENDER_OPTIONS}
              setOpen={setOpenGender}
              setValue={setGender}
              setItems={() => { }}
              placeholder="Selecione"
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownContainer}
              textStyle={styles.dropdownText}
              placeholderStyle={styles.dropdownPlaceholder}
              listItemLabelStyle={styles.dropdownText}
              zIndex={1500}
              zIndexInverse={1500}
            />
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Altura (cm)</Text>
            <TextInput style={styles.input} value={height} onChangeText={setHeight} placeholder="Altura" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} placeholder="Peso" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
          </View>
        </View>
        <Text style={styles.label}>Profissão (opcional)</Text>
        <TextInput style={styles.input} value={profession} onChangeText={setProfession} placeholder="Profissão" placeholderTextColor="#A0AEC0" />
      </View>
      {/* Goals & Objectives Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>💪 Metas e Objetivos</Text>
        <Text style={styles.label}>Objetivo Principal</Text>
        <DropDownPicker
          open={openGoal}
          value={goal}
          items={GOAL_OPTIONS}
          setOpen={setOpenGoal}
          setValue={setGoal}
          setItems={() => { }}
          placeholder="Selecione seu objetivo"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          listItemLabelStyle={styles.dropdownText}
          zIndex={1200}
          zIndexInverse={1200}
        />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Peso Alvo (kg)</Text>
            <TextInput style={styles.input} value={targetWeight} onChangeText={setTargetWeight} placeholder="Peso alvo" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>% Gordura Alvo</Text>
            <TextInput style={styles.input} value={targetFat} onChangeText={setTargetFat} placeholder="% gordura" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
          </View>
        </View>
        <Text style={styles.label}>Nível de Atividade</Text>
        <DropDownPicker
          open={openActivity}
          value={activity}
          items={ACTIVITY_OPTIONS}
          setOpen={setOpenActivity}
          setValue={setActivity}
          setItems={() => { }}
          placeholder="Selecione seu nível de atividade"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          listItemLabelStyle={styles.dropdownText}
          zIndex={1100}
          zIndexInverse={1100}
        />
      </View>
      {/* Nutritional Goals Section */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>🍓 Metas Nutricionais</Text>
        <Text style={styles.label}>Calorias Diárias (kcal)</Text>
        <TextInput style={styles.input} value={calories} onChangeText={setCalories} placeholder="Calorias" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Proteína (g)</Text>
            <TextInput style={styles.input} value={protein} onChangeText={setProtein} placeholder="Proteína" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Carboidratos (g)</Text>
            <TextInput style={styles.input} value={carbs} onChangeText={setCarbs} placeholder="Carboidratos" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Gordura (g)</Text>
            <TextInput style={styles.input} value={fat} onChangeText={setFat} placeholder="Gordura" keyboardType="numeric" placeholderTextColor="#A0AEC0" />
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveProfile}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'Salvando...' : 'Salvar Todas as Alterações'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 18,
    marginTop: 72,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 18,
    alignItems: 'center',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT,
    marginBottom: 2,
  },
  profileSince: {
    color: '#64748b',
    fontSize: 14,
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 10,
  },
  profileInfoBox: {
    flex: 1,
    alignItems: 'center',
  },
  profileInfoText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: TEXT,
  },
  profileInfoUnit: {
    fontSize: 13,
    color: '#64748b',
  },
  goalDisplay: {
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BORDER,
  },
  goalText: {
    fontSize: 14,
    color: TEXT,
    textAlign: 'center',
    fontWeight: '500',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginHorizontal: 18,
    marginBottom: 18,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: CORAL,
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: TEXT,
    fontWeight: '600',
    marginBottom: 4,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    color: TEXT,
    marginBottom: 0,
    height: 44,
  },
  dropdown: {
    backgroundColor: '#fff',
    borderColor: BORDER,
    borderRadius: 10,
    minHeight: 44,
    height: 44,
    marginBottom: 0,
    paddingHorizontal: 8,
    zIndex: 1000,
  },
  dropdownContainer: {
    borderColor: BORDER,
    borderRadius: 10,
    zIndex: 1000,
  },
  dropdownText: {
    color: TEXT,
    fontSize: 15,
  },
  dropdownPlaceholder: {
    color: '#A0AEC0',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: CORAL,
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 18,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});