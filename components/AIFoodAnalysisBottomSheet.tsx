// FILE: components/AIFoodAnalysisBottomSheet.tsx

import React, { forwardRef, useMemo, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, Dimensions } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';
// Temporarily disabled due to native module issues
// import * as ImagePicker from 'expo-image-picker';
// import * as ImageManipulator from 'expo-image-manipulator';
import { api } from '../services/api';
import { getAuth } from '@react-native-firebase/auth';
import { useAuth } from '../contexts/AuthContext';

const CORAL = '#FF725E';
const OFF_WHITE = '#FFF8F6';
const BORDER = '#e2e8f0';
const TEXT = '#1e293b';

const { width: screenWidth } = Dimensions.get('window');

export interface AIAnalysisResult {
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  mealType: string;
  date: string;
}

export interface AIFoodAnalysisBottomSheetProps {
  onFoodAnalyzed: (foodData: AIAnalysisResult) => void;
  selectedMealType: string;
  date: string;
}

export const AIFoodAnalysisBottomSheet = forwardRef<BottomSheetModal, AIFoodAnalysisBottomSheetProps>(
  ({ onFoodAnalyzed, selectedMealType, date }, ref) => {
    
    const snapPoints = useMemo(() => ['90%'], []);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState<'initial' | 'preview'>('initial');
    const { user } = useAuth();

    const pickImage = async () => {
      Alert.alert(
        'Funcionalidade Temporariamente Indisponível',
        'A análise por IA requer uma nova versão do app. Por favor, use a entrada manual por enquanto.',
        [
          { text: 'OK', onPress: handleClose }
        ]
      );
    };

    const analyzeImage = async () => {
      if (!selectedImage || !user?.uid) {
        Alert.alert('Erro', 'Selecione uma imagem primeiro');
        return;
      }

      setIsAnalyzing(true);

      try {
        const firebaseUser = getAuth().currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken() : '';
        
        if (!token) {
          Alert.alert('Erro', 'Token de autenticação não disponível');
          return;
        }

        const result = await api.analyzeFoodImage(
          user.uid,
          selectedImage,
          selectedMealType,
          date,
          token
        );

        Alert.alert(
          'Análise concluída! 🎉',
          `Detectado: ${result.food}\n${result.calories} kcal`,
          [
            {
              text: 'OK',
              onPress: () => {
                onFoodAnalyzed(result);
                handleClose();
              },
            },
          ]
        );
      } catch (error: any) {
        Alert.alert('Erro na análise', error.message || 'Não foi possível analisar a imagem');
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleClose = () => {
      setSelectedImage(null);
      setIsAnalyzing(false);
      setCurrentStep('initial');
      // @ts-ignore
      ref.current?.dismiss();
    };

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: '#e2e8f0' }}
        backgroundStyle={{ backgroundColor: OFF_WHITE }}
      >
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>Análise por IA 🤖</Text>
            <TouchableOpacity onPress={handleClose}>
              <FontAwesome6 name="xmark" size={22} color={CORAL} />
            </TouchableOpacity>
          </View>

          {currentStep === 'preview' && selectedImage && (
            <View style={styles.previewContainer}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              
              <View style={styles.previewContent}>
                <Text style={styles.previewTitle}>Pronto para analisar este alimento?</Text>
                <Text style={styles.previewSubtitle}>
                  A IA irá identificar o alimento e calcular os valores nutricionais
                </Text>

                <View style={styles.previewButtons}>
                  <TouchableOpacity
                    style={styles.changePhotoButton}
                    onPress={() => setCurrentStep('initial')}
                  >
                    <Text style={styles.changePhotoText}>Trocar Foto</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.analyzeButton}
                    onPress={analyzeImage}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <FontAwesome6 name="robot" size={16} color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.analyzeButtonText}>Analisar</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {currentStep === 'initial' && (
            <View style={styles.initialContainer}>
              <FontAwesome6 name="robot" size={48} color="#A0AEC0" />
              <Text style={styles.initialTitle}>
                Análise por IA
              </Text>
              <Text style={styles.initialSubtitle}>
                Funcionalidade em desenvolvimento
              </Text>
              <Text style={styles.initialDescription}>
                A análise por IA de alimentos requer uma nova versão do app com suporte a câmera e galeria. Por favor, use a entrada manual por enquanto.
              </Text>
              
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={pickImage}
              >
                <FontAwesome6 name="info-circle" size={24} color={CORAL} />
                <Text style={styles.galleryButtonText}>Mais Informações</Text>
              </TouchableOpacity>
            </View>
          )}
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
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: TEXT,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  initialSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  initialDescription: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  optionsGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  optionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: (screenWidth - 80) / 2,
    height: 120,
    borderWidth: 1.5,
    borderColor: BORDER,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
    marginTop: 12,
  },
  previewContainer: {
    flex: 1,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 20,
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  previewButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  changePhotoButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderWidth: 1.5,
    borderColor: CORAL,
    alignItems: 'center',
  },
  changePhotoText: {
    color: CORAL,
    fontWeight: 'bold',
    fontSize: 15,
  },
  analyzeButton: {
    flex: 1,
    backgroundColor: CORAL,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  galleryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1.5,
    borderColor: BORDER,
    flexDirection: 'row',
    gap: 12,
  },
  galleryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: TEXT,
  },
}); 