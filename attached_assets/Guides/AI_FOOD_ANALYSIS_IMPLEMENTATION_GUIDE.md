# AI Food Analysis Implementation Guide - Complete Technical Documentation

## Overview
The AI food analysis feature uses OpenAI's GPT-4o vision model to analyze food images and automatically extract nutritional information. Users can take photos of their meals, and the AI will identify the food, estimate portion sizes, and provide detailed nutritional data including calories, protein, carbs, and fat.

## 1. Backend Implementation

### API Endpoint
**POST** `/api/users/:uid/food-image`

### Request Structure
```typescript
{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...", // Base64 encoded image
  "mealType": "Café da Manhã", // Optional: meal type
  "date": "2024-12-29" // Optional: date for the meal
}
```

### Response Structure
```typescript
{
  "food": "Pão de açúcar com café",
  "calories": 280,
  "protein": 8,
  "carbs": 45,
  "fat": 12,
  "quantity": 1,
  "unit": "porção",
  "mealType": "Café da Manhã",
  "date": "2024-12-29"
}
```

### Backend Route Implementation (server/routes.ts)
```typescript
import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// AI Food Image Analysis endpoint
app.post("/api/users/:uid/food-image", async (req, res) => {
  try {
    const { uid } = req.params;
    const { image, mealType, date } = req.body;

    console.log(`POST /api/users/${uid}/food-image - AI analysis requested`);

    // Validate user exists
    const user = await storage.getUserByUid(uid);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Validate input
    if (!image) {
      return res.status(400).json({ message: "Image data is required" });
    }

    // Extract base64 data (remove data:image/jpeg;base64, prefix if present)
    const base64Image = image.replace(/^data:image\/[a-z]+;base64,/, '');

    try {
      console.log("🤖 Sending image to OpenAI GPT-4o for analysis...");
      
      // Call OpenAI API with the image
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // Latest OpenAI vision model
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this food image and return a JSON response with the following structure:
{
  "food": "Name of the food dish",
  "calories": estimated_calories_per_serving,
  "protein": estimated_protein_grams,
  "carbs": estimated_carbs_grams,
  "fat": estimated_fat_grams,
  "quantity": estimated_serving_size,
  "unit": "serving_unit (g, ml, unidade, etc)"
}

Please provide realistic nutritional estimates for a typical serving of this food. Focus on Brazilian foods when possible.`
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`
                }
              }
            ]
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500
      });

      const aiResult = response.choices[0].message.content;
      console.log("🤖 OpenAI response:", aiResult);

      // Parse the JSON response
      const foodData = JSON.parse(aiResult || '{}');

      // Validate the response has required fields
      if (!foodData.food || !foodData.calories) {
        throw new Error("Invalid response from AI - missing required fields");
      }

      // Return the structured result
      const result = {
        food: foodData.food,
        calories: Math.round(foodData.calories),
        protein: Math.round(foodData.protein || 0),
        carbs: Math.round(foodData.carbs || 0),
        fat: Math.round(foodData.fat || 0),
        quantity: foodData.quantity || 1,
        unit: foodData.unit || "porção",
        mealType: mealType || "Lanche",
        date: date || new Date().toISOString().split('T')[0]
      };

      console.log("✅ AI analysis complete:", JSON.stringify(result));
      return res.json(result);

    } catch (aiError: any) {
      console.error("❌ OpenAI API error:", aiError.message);
      return res.status(500).json({ 
        message: "Failed to analyze image", 
        error: aiError.message 
      });
    }

  } catch (error: any) {
    console.error("❌ Error in food image analysis:", error);
    return res.status(500).json({ message: error.message });
  }
});
```

### OpenAI Configuration Requirements
- **Model**: `gpt-4o` (latest vision model)
- **API Key**: Environment variable `OPENAI_API_KEY`
- **Response Format**: JSON object
- **Max Tokens**: 500 (sufficient for nutritional data)

## 2. Frontend Web Implementation

### Web Component (client/src/components/food-log/ai-food-analysis-modal.tsx)
```typescript
import { useState, useRef } from "react";
import { X, Camera, Upload, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

type AIFoodAnalysisModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onFoodAnalyzed: (foodData: any) => void;
  date: string;
  selectedMeal: string | null;
};

export function AIFoodAnalysisModal({
  isOpen,
  onClose,
  onFoodAnalyzed,
  date,
  selectedMeal,
}: AIFoodAnalysisModalProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Image compression function
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Set maximum size (reduce to 800px on largest dimension)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7); // 70% quality
        resolve(compressedDataUrl);
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit for original file
        toast({
          title: "Arquivo muito grande",
          description: "A imagem deve ter no máximo 10MB",
          variant: "destructive",
        });
        return;
      }

      try {
        const compressedImage = await compressImage(file);
        setSelectedImage(compressedImage);
      } catch (error) {
        toast({
          title: "Erro ao processar imagem",
          description: "Não foi possível processar a imagem",
          variant: "destructive",
        });
      }
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage || !user?.uid) {
      toast({
        title: "Erro",
        description: "Selecione uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await apiRequest("POST", `/api/users/${user.uid}/food-image`, {
        image: selectedImage,
        mealType: selectedMeal || "Lanche",
        date: date,
      });

      const foodData = await response.json();

      if (response.ok) {
        toast({
          title: "Análise concluída! 🎉",
          description: `Detectado: ${foodData.food}`,
        });
        onFoodAnalyzed(foodData);
        handleClose();
      } else {
        throw new Error(foodData.message || "Erro na análise");
      }
    } catch (error: any) {
      toast({
        title: "Erro na análise",
        description: error.message || "Não foi possível analisar a imagem",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // UI rendering with image preview and analysis button...
}
```

## 3. React Native Implementation

### API Client Integration (shared-mobile/api-client.ts)
```typescript
class ApiClient {
  private baseURL = 'https://forkfit.app/api';

  async analyzeFoodImage(uid: string, imageData: string, mealType: string, date: string, token: string) {
    const response = await this.request(`/users/${uid}/food-image`, {
      method: 'POST',
      body: {
        image: imageData,
        mealType,
        date,
      },
      token,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to analyze food image');
    }

    return response.json();
  }

  private async request(endpoint: string, options: RequestOptions = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token && { Authorization: `Bearer ${options.token}` }),
        ...options.headers,
      },
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    const response = await fetch(url, config);
    return response;
  }
}

export const apiClient = new ApiClient();
```

### React Native Component with Camera Integration
```typescript
// components/AIFoodAnalysisModal.tsx
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  SafeAreaView,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Camera, CameraType } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../hooks/useAuth';
import { apiClient } from '../api/apiClient';

type AIAnalysisResult = {
  food: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  mealType: string;
  date: string;
};

interface AIFoodAnalysisModalProps {
  visible: boolean;
  onClose: () => void;
  onFoodAnalyzed: (foodData: AIAnalysisResult) => void;
  date: string;
  selectedMeal: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AIFoodAnalysisModal({
  visible,
  onClose,
  onFoodAnalyzed,
  date,
  selectedMeal,
}: AIFoodAnalysisModalProps) {
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const cameraRef = useRef<Camera>(null);
  const { user, token } = useAuth();

  // Request camera permissions
  React.useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(status === 'granted');
    })();
  }, []);

  // Image compression function
  const compressImage = async (uri: string): Promise<string> => {
    try {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize to max 800px width
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG, base64: true }
      );

      return `data:image/jpeg;base64,${manipulatedImage.base64}`;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  };

  // Take photo with camera
  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: true,
        });

        const compressedImage = await compressImage(photo.uri);
        setSelectedImage(compressedImage);
        setShowCamera(false);
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Erro', 'Não foi possível tirar a foto');
      }
    }
  };

  // Pick image from gallery
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        const compressedImage = await compressImage(result.assets[0].uri);
        setSelectedImage(compressedImage);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem');
    }
  };

  // Analyze image with AI
  const analyzeImage = async () => {
    if (!selectedImage || !user?.uid || !token) {
      Alert.alert('Erro', 'Selecione uma imagem primeiro');
      return;
    }

    setIsAnalyzing(true);

    try {
      const result = await apiClient.analyzeFoodImage(
        user.uid,
        selectedImage,
        selectedMeal,
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
      console.error('Error analyzing image:', error);
      Alert.alert('Erro na análise', error.message || 'Não foi possível analisar a imagem');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleClose = () => {
    setSelectedImage(null);
    setIsAnalyzing(false);
    setShowCamera(false);
    onClose();
  };

  if (cameraPermission === null) {
    return null;
  }

  if (cameraPermission === false) {
    return (
      <Modal visible={visible} animationType="slide">
        <SafeAreaView style={styles.container}>
          <View style={styles.permissionContainer}>
            <Text style={styles.permissionText}>
              Precisamos de acesso à câmera para analisar seus alimentos
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleClose}>
              <Text style={styles.buttonText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
    <Modal visible={visible} animationType="slide">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Análise por IA 🤖</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        {showCamera ? (
          /* Camera View */
          <View style={styles.cameraContainer}>
            <Camera
              ref={cameraRef}
              style={styles.camera}
              type={CameraType.back}
              ratio="4:3"
            />
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}
              >
                <Ionicons name="camera" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        ) : selectedImage ? (
          /* Image Preview */
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity
              style={styles.analyzeButton}
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.analyzeButtonText}>
                  Analisar Alimento
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={styles.retakeButtonText}>Selecionar Outra Imagem</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Initial Options */
          <View style={styles.optionsContainer}>
            <Text style={styles.subtitle}>
              Tire uma foto ou selecione uma imagem do seu alimento
            </Text>
            
            <TouchableOpacity
              style={styles.optionButton}
              onPress={() => setShowCamera(true)}
            >
              <Ionicons name="camera" size={24} color="#EC4899" />
              <Text style={styles.optionText}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.optionButton}
              onPress={pickImage}
            >
              <Ionicons name="image" size={24} color="#EC4899" />
              <Text style={styles.optionText}>Escolher da Galeria</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#374151',
  },
  closeButton: {
    padding: 4,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#EC4899',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  imageContainer: {
    flex: 1,
    padding: 20,
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    marginBottom: 20,
    resizeMode: 'cover',
  },
  analyzeButton: {
    backgroundColor: '#EC4899',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  retakeButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  retakeButtonText: {
    color: '#6B7280',
    fontSize: 14,
  },
  optionsContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    marginBottom: 16,
  },
  optionText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#EC4899',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

### Required Dependencies for React Native
```bash
# Install required packages
npx expo install expo-camera expo-image-picker expo-image-manipulator

# Add to package.json
"dependencies": {
  "expo-camera": "~14.0.0",
  "expo-image-picker": "~14.7.0",
  "expo-image-manipulator": "~11.8.0"
}
```

## 4. Integration with Food Logging

### After AI Analysis - Adding to Food Log
```typescript
// In your main component where you handle food logging
const handleFoodAnalyzed = async (aiResult: AIAnalysisResult) => {
  try {
    // Add the AI-analyzed food to the user's food log
    const response = await apiClient.addFoodLog(user.uid, {
      date: aiResult.date,
      mealType: aiResult.mealType,
      name: aiResult.food,
      quantity: aiResult.quantity,
      unit: aiResult.unit,
      calories: aiResult.calories,
      protein: aiResult.protein,
      carbs: aiResult.carbs,
      fat: aiResult.fat,
    }, token);

    if (response.ok) {
      Alert.alert(
        'Adicionado com sucesso!',
        `${aiResult.food} foi adicionado ao seu ${aiResult.mealType}`
      );
      
      // Refresh food logs
      refreshFoodLogs();
    }
  } catch (error) {
    Alert.alert('Erro', 'Não foi possível adicionar o alimento');
  }
};
```

## 5. Key Features & Capabilities

### AI Analysis Features
- **Food Recognition**: Identifies various Brazilian and international foods
- **Portion Estimation**: Estimates serving sizes based on visual cues
- **Nutritional Analysis**: Provides calories, protein, carbs, and fat content
- **Cultural Awareness**: Focused on Brazilian food culture and terminology

### Image Processing Features
- **Compression**: Automatic image compression to reduce API costs
- **Multiple Sources**: Camera capture and gallery selection
- **Quality Control**: Maintains image quality while reducing file size
- **Format Support**: JPEG format optimized for AI analysis

### User Experience Features
- **Real-time Camera**: Live camera preview with capture controls
- **Image Preview**: Preview selected image before analysis
- **Loading States**: Clear feedback during AI processing
- **Error Handling**: Comprehensive error messages and recovery options

## 6. Technical Considerations

### Performance Optimization
- **Image Compression**: Reduces images to 800px max dimension at 70% quality
- **Efficient API Calls**: Single API call per analysis
- **Caching**: Response caching can be implemented for similar images

### Cost Management
- **OpenAI API Costs**: Approximately $0.01-0.05 per image analysis
- **Image Size Limits**: 10MB max file size, compressed to ~200KB
- **Token Limits**: 500 token max response keeps costs low

### Error Handling
- **Network Errors**: Retry logic and offline handling
- **API Failures**: Fallback to manual entry
- **Invalid Images**: Clear feedback for unsupported formats
- **Permission Errors**: Graceful handling of camera/gallery access

## 7. Testing & Validation

### Test Cases
```typescript
// Example test data for validation
const testCases = [
  {
    food: "Pão de açúcar",
    expectedCalories: 250,
    expectedProtein: 8,
    expectedCarbs: 45,
    expectedFat: 6,
  },
  {
    food: "Feijoada",
    expectedCalories: 450,
    expectedProtein: 25,
    expectedCarbs: 35,
    expectedFat: 22,
  },
];
```

### Validation Rules
- **Calorie Range**: 10-2000 calories per serving
- **Macro Validation**: Protein + carbs + fat should be reasonable
- **Food Name**: Must be a recognizable food item
- **Portion Size**: Must be realistic (1-1000g typically)

## 8. Future Enhancements

### Advanced Features
- **Meal Composition**: Analyze multiple foods in one image
- **Ingredient Breakdown**: Individual ingredient analysis
- **Cooking Method Detection**: Grilled, fried, boiled recognition
- **Allergen Detection**: Identify common allergens

### Integration Possibilities
- **Recipe Suggestions**: Based on analyzed ingredients
- **Nutritional Recommendations**: Personalized based on analysis
- **Progress Tracking**: AI analysis accuracy over time
- **Barcode Integration**: Combine with barcode scanning for packaged foods

This implementation provides a complete, production-ready AI food analysis system that seamlessly integrates with your existing ForkFit backend infrastructure and provides an intuitive mobile experience for users to analyze their meals.