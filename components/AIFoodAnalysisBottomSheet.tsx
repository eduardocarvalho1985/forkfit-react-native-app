// FILE: components/AIFoodAnalysisBottomSheet.tsx

import React, { forwardRef, useMemo, useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, Dimensions } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { FontAwesome6 } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
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

    const convertImageToBase64 = async (uri: string): Promise<string> => {
      try {
        // Convert image URI to base64
        const response = await fetch(uri);
        const blob = await response.blob();
        
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = reader.result as string;
            // Remove the data:image/jpeg;base64, prefix if present
            const base64Data = base64.split(',')[1] || base64;
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error converting image to base64:', error);
        throw error;
      }
    };

    const pickImage = async () => {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
          const processedImage = await convertImageToBase64(result.assets[0].uri);
          setSelectedImage(processedImage);
          setCurrentStep('preview');
        }
      } catch (error) {
        Alert.alert('Erro', 'Não foi possível selecionar a imagem');
      }
    };

    const takePhoto = async () => {
      try {
        // Request camera permissions
        const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
        
        if (permissionResult.granted === false) {
          Alert.alert('Permissão Necessária', 'Para tirar fotos dos alimentos, é necessário permitir o acesso à câmera nas configurações do seu dispositivo.');
          return;
        }

        const result = await ImagePicker.launchCameraAsync({
          mediaTypes: ['images'],
          allowsEditing: true,
          aspect: [4, 3],
          quality: 0.7,
        });

        if (!result.canceled && result.assets[0]) {
          const processedImage = await convertImageToBase64(result.assets[0].uri);
          setSelectedImage(processedImage);
          setCurrentStep('preview');
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Erro', 'Não foi possível capturar a foto');
      }
    };

    const analyzeImage = async () => {
      if (!selectedImage || !user?.uid) {
        Alert.alert('Erro', 'Selecione uma imagem primeiro');
        return;
      }

      setIsAnalyzing(true);

      try {
        console.log('Starting AI analysis...');
        console.log('Selected image length:', selectedImage.length);
        console.log('User UID:', user.uid);
        console.log('Selected meal type:', selectedMealType);
        console.log('Date:', date);
        
        const firebaseUser = getAuth().currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken() : '';
        
        if (!token) {
          Alert.alert('Erro', 'Token de autenticação não disponível');
          return;
        }

        console.log('Auth token length:', token.length);
        console.log('Sending image data (first 100 chars):', selectedImage.substring(0, 100));

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
        console.error('AI Analysis error:', error);
        
        // Provide more specific error messages
        let errorMessage = 'Não foi possível analisar a imagem';
        if (error.message?.includes('timeout')) {
          errorMessage = 'A análise demorou muito tempo. Tente novamente ou use uma imagem mais clara.';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('Erro na análise', errorMessage);
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
              <Image source={{ uri: `data:image/jpeg;base64,${selectedImage}` }} style={styles.selectedImage} />
              
              <View style={styles.previewContent}>
                <Text style={styles.previewTitle}>Pronto para analisar este alimento?</Text>
                <Text style={styles.previewSubtitle}>
                  A IA irá identificar o alimento e calcular os valores nutricionais
                </Text>
                {isAnalyzing && (
                  <Text style={styles.analyzingText}>
                    ⏱️ A análise pode levar alguns segundos. Quase lá!
                  </Text>
                )}

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
                      <>
                        <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                        <Text style={styles.analyzeButtonText}>Analisando...</Text>
                      </>
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
              <Text style={styles.initialSubtitle}>
                Selecione uma imagem do seu alimento para análise
              </Text>
              
              <View style={styles.optionsGrid}>
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={pickImage}
                >
                  <FontAwesome6 name="image" size={32} color={CORAL} />
                  <Text style={styles.optionText}>Galeria</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.optionButton}
                  onPress={takePhoto}
                >
                  <FontAwesome6 name="camera" size={32} color={CORAL} />
                  <Text style={styles.optionText}>Câmera</Text>
                </TouchableOpacity>
              </View>
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
    marginTop: 8,
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
  analyzingText: {
    fontSize: 13,
    color: '#f97316',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
    fontStyle: 'italic',
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
}); 