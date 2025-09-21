# Missing React Native Route Components

## Create These Files in Your Mobile App

### 1. app/(tabs)/dashboard.tsx
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>ForkFit Dashboard</Text>
        <Text style={styles.subtitle}>Acompanhe sua nutrição</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Progresso Diário</Text>
        <View style={styles.progressContainer}>
          <Text>Calorias: 0 / 2000</Text>
          <Text>Proteína: 0g / 150g</Text>
          <Text>Carboidratos: 0g / 250g</Text>
          <Text>Gordura: 0g / 65g</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Refeições de Hoje</Text>
        <View style={styles.mealContainer}>
          <Text>Café da Manhã</Text>
          <Text>Almoço</Text>
          <Text>Lanche</Text>
          <Text>Jantar</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  progressContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  mealContainer: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
});
```

### 2. app/(tabs)/settings.tsx
```typescript
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

export default function Settings() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Perfil</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Editar Perfil</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Metas Nutricionais</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notificações</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Lembretes Diários</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Relatórios Semanais</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conta</Text>
        <TouchableOpacity style={styles.settingItem}>
          <Text style={styles.settingText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  settingItem: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
});
```

### 3. app/_layout.tsx
```typescript
import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="auth" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
```

### 4. app/(tabs)/_layout.tsx
```typescript
import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#FF725E',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
      }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Configurações',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### 5. app/auth/login.tsx
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { router } from 'expo-router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Erro', 'Email ou senha incorretos');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ForkFit</Text>
      <Text style={styles.subtitle}>Entre na sua conta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/auth/register')}>
        <Text style={styles.linkText}>Não tem conta? Cadastre-se</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FF725E',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF725E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    color: '#FF725E',
    fontSize: 16,
  },
});
```

### 6. app/auth/register.tsx
```typescript
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase.config';
import { router } from 'expo-router';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Erro', 'As senhas não coincidem');
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)/dashboard');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível criar a conta');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ForkFit</Text>
      <Text style={styles.subtitle}>Crie sua conta</Text>
      
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirmar Senha"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Cadastrar</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.linkText}>Já tem conta? Entre aqui</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#FF725E',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#FF725E',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  linkText: {
    textAlign: 'center',
    color: '#FF725E',
    fontSize: 16,
  },
});
```

### 7. app/index.tsx
```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase.config';
import { router } from 'expo-router';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(false);
      if (user) {
        router.replace('/(tabs)/dashboard');
      } else {
        router.replace('/auth/login');
      }
    });

    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loading}>Carregando ForkFit...</Text>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loading: {
    fontSize: 18,
    color: '#FF725E',
  },
});
```

### 8. firebase.config.ts (Updated)
```typescript
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

// Use getAuth to avoid AsyncStorage dependency issues
export const auth = getAuth(app);
export default app;
```

Create these files in your mobile app to resolve the missing component exports and Firebase Auth registration errors.