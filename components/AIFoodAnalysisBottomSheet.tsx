// FILE: components/AIFoodAnalysisBottomSheet.tsx

import React, { forwardRef, useMemo, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, ActivityIndicator, Dimensions, TextInput, Keyboard, TouchableWithoutFeedback } from 'react-native';
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

type TabType = 'photo' | 'description';

export const AIFoodAnalysisBottomSheet = forwardRef<BottomSheetModal, AIFoodAnalysisBottomSheetProps>(
  ({ onFoodAnalyzed, selectedMealType, date }, ref) => {
    
    const snapPoints = useMemo(() => ['90%'], []);
    const [activeTab, setActiveTab] = useState<TabType>('photo');
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [description, setDescription] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [currentStep, setCurrentStep] = useState<'initial' | 'preview'>('initial');
    const { user } = useAuth();

    // Smart placeholder examples for food descriptions
    const placeholderExamples = [
      "1 xícara de arroz integral com 100g de frango grelhado",
      "2 maçãs médias",
      "1 prato de feijão com arroz e 150g de carne",
      "1 copo de suco de laranja natural",
      "1 salada verde com tomate e 50g de atum"
    ];
    const [currentPlaceholder, setCurrentPlaceholder] = useState(0);

    // Rotate placeholder examples
    useEffect(() => {
      const interval = setInterval(() => {
        setCurrentPlaceholder((prev) => (prev + 1) % placeholderExamples.length);
      }, 3000);
      return () => clearInterval(interval);
    }, [placeholderExamples.length]);

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
      } catch {
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
        console.log('Starting AI image analysis...');
        
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
        console.error('AI Image Analysis error:', error);
        
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

    const analyzeDescription = async () => {
      if (!description.trim() || !user?.uid) {
        Alert.alert('Erro', 'Digite uma descrição do alimento');
        return;
      }

      if (description.trim().length < 10) {
        Alert.alert('Erro', 'A descrição deve ter pelo menos 10 caracteres para uma análise precisa');
        return;
      }

      setIsAnalyzing(true);

      try {
        console.log('Starting AI description analysis...');
        
        const firebaseUser = getAuth().currentUser;
        const token = firebaseUser ? await firebaseUser.getIdToken() : '';
        
        if (!token) {
          Alert.alert('Erro', 'Token de autenticação não disponível');
          return;
        }

        const result = await api.analyzeFoodDescription(
          user.uid,
          description.trim(),
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
        console.error('AI Description Analysis error:', error);
        
        let errorMessage = 'Não foi possível analisar a descrição';
        if (error.message?.includes('timeout')) {
          errorMessage = 'A análise demorou muito tempo. Tente novamente ou seja mais específico.';
        } else if (error.message?.includes('network')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message?.includes('vaga') || error.message?.includes('específico')) {
          errorMessage = 'Descrição muito vaga. Seja mais específico sobre o alimento e quantidade.';
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('Erro na análise', errorMessage);
      } finally {
        setIsAnalyzing(false);
      }
    };

    const handleClose = () => {
      Keyboard.dismiss(); // Dismiss keyboard when closing
      setSelectedImage(null);
      setDescription('');
      setIsAnalyzing(false);
      setCurrentStep('initial');
      setActiveTab('photo');
      // @ts-ignore
      ref.current?.dismiss();
    };

    const handleTabChange = (tab: TabType) => {
      Keyboard.dismiss(); // Dismiss keyboard when switching tabs
      setActiveTab(tab);
      setCurrentStep('initial');
      setSelectedImage(null);
      setDescription('');
    };

    const dismissKeyboard = () => {
      Keyboard.dismiss();
    };

    const handleSubmitEditing = () => {
      // Submit when user presses Enter/Return key
      if (isDescriptionValid && !isAnalyzing) {
        analyzeDescription();
      }
    };

    const isDescriptionValid = description.trim().length >= 10;

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

          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'photo' && styles.activeTabButton]}
              onPress={() => handleTabChange('photo')}
            >
              <FontAwesome6 name="camera" size={16} color={activeTab === 'photo' ? '#fff' : CORAL} />
              <Text style={[styles.tabText, activeTab === 'photo' && styles.activeTabText]}>
                📷 Foto
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'description' && styles.activeTabButton]}
              onPress={() => handleTabChange('description')}
            >
              <FontAwesome6 name="pen" size={16} color={activeTab === 'description' ? '#fff' : CORAL} />
              <Text style={[styles.tabText, activeTab === 'description' && styles.activeTabText]}>
                ✍️ Descrição
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === 'photo' && (
            <>
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
                            <FontAwesome6 name="robot" size={16} color="#fff" style={{ marginRight:8 }} />
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
            </>
          )}

          {activeTab === 'description' && (
            <TouchableWithoutFeedback onPress={dismissKeyboard}>
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionTitle}>
                  Descreva o alimento que você consumiu
                </Text>
                
                <Text style={styles.descriptionSubtitle}>
                  Seja específico sobre o tipo de alimento, quantidade e preparo. Pressione "Concluído" para analisar.
                </Text>

                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.textInput}
                    placeholder={placeholderExamples[currentPlaceholder]}
                    placeholderTextColor="#94a3b8"
                    value={description}
                    onChangeText={setDescription}
                    onSubmitEditing={handleSubmitEditing}
                    multiline
                    numberOfLines={4}
                    textAlignVertical="top"
                    maxLength={500}
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                  <Text style={styles.characterCount}>
                    {description.length}/500
                  </Text>
                </View>

                <TouchableWithoutFeedback>
                  <View style={styles.helpTips}>
                    <Text style={styles.helpTitle}>💡 Dicas para uma análise melhor:</Text>
                    <Text style={styles.helpTip}>• Inclua quantidades (ex: 100g, 1 xícara, 2 unidades)</Text>
                    <Text style={styles.helpTip}>• Mencione o tipo de preparo (grelhado, frito, assado)</Text>
                    <Text style={styles.helpTip}>• Descreva acompanhamentos (arroz, salada, molho)</Text>
                  </View>
                </TouchableWithoutFeedback>

                <TouchableOpacity
                  style={[
                    styles.analyzeDescriptionButton,
                    (!isDescriptionValid || isAnalyzing) && styles.analyzeDescriptionButtonDisabled
                  ]}
                  onPress={analyzeDescription}
                  disabled={!isDescriptionValid || isAnalyzing}
                >
                  {isAnalyzing ? (
                    <>
                      <ActivityIndicator size="small" color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.analyzeDescriptionButtonText}>Analisando...</Text>
                    </>
                  ) : (
                    <>
                      <FontAwesome6 name="robot" size={16} color="#fff" style={{ marginRight: 8 }} />
                      <Text style={styles.analyzeDescriptionButtonText}>Analisar Descrição</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          )}
        </View>
      </BottomSheetModal>
    );
  }
);

// Add display name for the component
AIFoodAnalysisBottomSheet.displayName = 'AIFoodAnalysisBottomSheet';

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
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: BORDER,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  activeTabButton: {
    backgroundColor: CORAL,
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: CORAL,
  },
  activeTabText: {
    color: '#fff',
  },
  initialContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 20,
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
  descriptionContainer: {
    flex: 1,
    paddingTop: 20,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 8,
  },
  descriptionSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: TEXT,
    borderWidth: 1,
    borderColor: BORDER,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
    marginRight: 4,
  },
  helpTips: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  helpTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT,
    marginBottom: 8,
  },
  helpTip: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    lineHeight: 18,
  },
  analyzeDescriptionButton: {
    backgroundColor: CORAL,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  analyzeDescriptionButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  analyzeDescriptionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
}); 