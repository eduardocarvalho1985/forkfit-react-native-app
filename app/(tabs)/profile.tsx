// app/auth/login.tsx   (repeat for register.tsx, index.tsx, _layout.tsx,
// dashboard.tsx, settings.tsx, etc.)
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { FontAwesome6 } from '@expo/vector-icons';

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
  // Profile fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState(null);
  const [openGender, setOpenGender] = useState(false);
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [profession, setProfession] = useState('');
  // Goals
  const [goal, setGoal] = useState(null);
  const [openGoal, setOpenGoal] = useState(false);
  const [targetWeight, setTargetWeight] = useState('');
  const [targetFat, setTargetFat] = useState('');
  const [activity, setActivity] = useState(null);
  const [openActivity, setOpenActivity] = useState(false);
  // Nutrition
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');

  return (
    <ScrollView style={{ flex: 1, backgroundColor: OFF_WHITE, paddingTop: 36 }} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Big Title */}
      <Text style={styles.title}>Perfil</Text>
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
        <DropDownPicker
          open={openGoal}
          value={goal}
          items={GOAL_OPTIONS}
          setOpen={setOpenGoal}
          setValue={setGoal}
          setItems={() => {}}
          placeholder="Meta: Perder Peso"
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownContainer}
          textStyle={styles.dropdownText}
          placeholderStyle={styles.dropdownPlaceholder}
          listItemLabelStyle={styles.dropdownText}
          zIndex={2000}
          zIndexInverse={1000}
        />
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
              setItems={() => {}}
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
        <Text style={styles.sectionTitle}>🍓 Metas e Objetivos</Text>
        <Text style={styles.label}>Objetivo Principal</Text>
        <DropDownPicker
          open={openGoal}
          value={goal}
          items={GOAL_OPTIONS}
          setOpen={setOpenGoal}
          setValue={setGoal}
          setItems={() => {}}
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
          setItems={() => {}}
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
        <TouchableOpacity style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Salvar Todas as Alterações</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: TEXT,
    marginTop: 72,
    marginBottom: 12,
    marginLeft: 18,
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
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});