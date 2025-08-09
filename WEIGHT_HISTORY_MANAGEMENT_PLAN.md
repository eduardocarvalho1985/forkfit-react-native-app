# 📊 Plano: Gestão de Histórico de Peso - Bottom Sheet Interativo

## 🎯 **Objetivo**
Implementar um sistema completo de gestão de histórico de peso que permite ao usuário visualizar, editar e excluir registros históricos através de uma interface intuitiva.

## 📋 **Análise de Recursos Disponíveis**

### ✅ **APIs Disponíveis (Confirmadas)**

#### **1. WeightEntry Interface**
```typescript
export interface WeightEntry {
  id: string;           // ✅ ID único para deleção
  weight: number;       // ✅ Peso em kg
  date: string;         // ✅ Data do registro
  createdAt: string;    // ✅ Timestamp de criação
  userId: string;       // ✅ ID do usuário
}
```

#### **2. API Methods**
```typescript
// ✅ LISTAGEM
async getWeightHistory(uid: string, token: string): Promise<WeightEntry[]>

// ✅ CRIAÇÃO  
async addWeightEntry(uid: string, weight: number, date: string, token: string): Promise<WeightEntry>

// ✅ DELEÇÃO
async deleteWeightEntry(uid: string, weightId: string, token: string): Promise<void>
```

#### **3. Context Methods**
```typescript
// ✅ Disponível no ProgressContext
refreshWeightHistory: () => Promise<void>;
addWeightEntry: (weight: number, date: string) => Promise<void>;
deleteWeightEntry: (weightId: string) => Promise<void>;
```

### ✅ **Utilitários Disponíveis**
```typescript
// ✅ Formatação de peso brasileiro
formatWeightWithUnit(weight: number): string  // "74,5 kg"
formatWeight(weight: number): string          // "74,5"
parseWeight(weightString: string): number     // 74.5
validateWeight(weight: string): { isValid: boolean; error?: string }
```

### ✅ **Componentes Base Disponíveis**
- ✅ `BottomSheetModal` - Estrutura já implementada
- ✅ `WeightInputModal` - Referência para padrões de design
- ✅ Swipe actions - Padrão implementado em outros bottom sheets

## 🏗️ **Plano de Implementação**

### **Fase 1: Tornar Card Clicável** 
```typescript
// 1. Adicionar TouchableOpacity ao card "Peso - Meta e Histórico"
// 2. Adicionar ref do BottomSheet
// 3. Implementar onPress para abrir o modal
```

### **Fase 2: Criar WeightHistoryBottomSheet Component**

#### **2.1 Estrutura Base**
```typescript
interface WeightHistoryBottomSheetProps {
  onRefresh?: () => void;
}

export const WeightHistoryBottomSheet = forwardRef<BottomSheetModal, WeightHistoryBottomSheetProps>
```

#### **2.2 Layout do Bottom Sheet**
```
┌─────────────────────────────────────┐
│ Histórico de Peso                   │
├─────────────────────────────────────┤
│ ┌───────────────────────────────────┐ │
│ │ 74,5 kg    ←swipe    📅 15/05/24 │ │ 
│ └───────────────────────────────────┘ │
│ ┌───────────────────────────────────┐ │
│ │ 75,2 kg    ←swipe    📅 10/05/24 │ │
│ └───────────────────────────────────┘ │
│ ┌───────────────────────────────────┐ │
│ │ 76,0 kg    ←swipe    📅 05/05/24 │ │
│ └───────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### **2.3 Cards com Swipe**
```typescript
// Cada card terá:
// - Peso formatado à esquerda (ex: "74,5 kg")
// - Data formatada à direita (ex: "15/05/24")
// - Swipe to delete action
// - Confirmação antes da exclusão
```

### **Fase 3: Implementar Swipe Actions**

#### **3.1 Biblioteca ou Implementação**
```typescript
// Opção 1: React Native Reanimated (já disponível)
// Opção 2: PanGestureHandler 
// Opção 3: Implementação customizada com TouchableOpacity
```

#### **3.2 Delete Action**
```typescript
const handleDelete = async (weightEntry: WeightEntry) => {
  // 1. Mostrar Alert de confirmação
  // 2. Chamar deleteWeightEntry do context
  // 3. Atualizar lista local
  // 4. Mostrar feedback de sucesso
  // 5. Refresh do gráfico principal
};
```

### **Fase 4: Estados e Loading**

#### **4.1 Estados do Component**
```typescript
const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
const [loading, setLoading] = useState(false);
const [deleting, setDeleting] = useState<string | null>(null); // ID sendo deletado
```

#### **4.2 Loading States**
- ✅ Carregando lista inicial
- ✅ Deletando item específico  
- ✅ Estados de erro

## 🎨 **Design Specifications**

### **1. Card Principal (Clicável)**
```typescript
// Adicionar indicador visual de que é clicável
// Talvez um ícone de "ver mais" ou seta
// Feedback visual no onPress
```

### **2. Bottom Sheet Header**
```
Histórico de Peso
[X registros] • [Ordenado por mais recente]
```

### **3. Weight Entry Card**
```
┌─────────────────────────────────────┐
│ 74,5 kg                 📅 15/05/24 │ ← Card normal
│                                     │
│ ← 🗑️ Deletar                        │ ← Swipe revelado
└─────────────────────────────────────┘
```

### **4. Empty State**
```
┌─────────────────────────────────────┐
│             📊                      │
│     Nenhum registro de peso         │
│                                     │
│  Adicione seu primeiro peso para    │
│     começar a acompanhar!           │
└─────────────────────────────────────┘
```

## 🔧 **Implementação Técnica**

### **1. Integração no Progress Screen**
```typescript
// No progress.tsx:
const weightHistoryRef = useRef<BottomSheetModal>(null);

// Tornar card clicável:
<TouchableOpacity onPress={() => weightHistoryRef.current?.present()}>
  {/* Existing card content */}
</TouchableOpacity>

// Adicionar BottomSheet:
<WeightHistoryBottomSheet ref={weightHistoryRef} onRefresh={refreshWeightHistory} />
```

### **2. Data Flow**
```
[Card Click] 
    ↓
[Open BottomSheet] 
    ↓
[Load weightHistory from ProgressContext]
    ↓
[Display cards with swipe actions]
    ↓
[User swipes → Delete confirmation]
    ↓
[Delete via API → Update context → Refresh chart]
```

### **3. Error Handling**
```typescript
try {
  await deleteWeightEntry(weightId);
  // Success feedback
} catch (error) {
  Alert.alert('Erro', 'Não foi possível excluir o registro. Tente novamente.');
}
```

## 📅 **Formatação de Datas**

### **Brazilian Date Format**
```typescript
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit', 
    year: '2-digit'
  }); // "15/05/24"
};

const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }); // "15/05/2024 às 14:30"
};
```

## ✅ **Checklist de Implementação**

### **APIs e Context**
- [x] ✅ `getWeightHistory` - Disponível
- [x] ✅ `deleteWeightEntry` - Disponível  
- [x] ✅ `WeightEntry` interface - Completa
- [x] ✅ Context methods - Implementados

### **Components Needed**
- [ ] `WeightHistoryBottomSheet` - Criar
- [ ] `WeightEntryCard` - Criar  
- [ ] Swipe actions - Implementar
- [ ] Delete confirmation - Implementar

### **UX Features**
- [ ] Card clicável - Implementar
- [ ] Lista ordenada (newest first) - Implementar
- [ ] Swipe to delete - Implementar
- [ ] Loading states - Implementar
- [ ] Empty state - Implementar
- [ ] Error handling - Implementar

## 🎯 **Resultado Esperado**

### **Funcionalidades Completas:**
1. ✅ **Card clicável** abre bottom sheet
2. ✅ **Lista completa** de todos os registros
3. ✅ **Ordenação** newest → oldest  
4. ✅ **Swipe to delete** com confirmação
5. ✅ **Atualização automática** do gráfico
6. ✅ **Feedback visual** apropriado
7. ✅ **Estados de loading** e erro

### **Benefícios para o Usuário:**
- ✅ **Correção de erros** em registros passados
- ✅ **Gestão completa** do histórico
- ✅ **Interface intuitiva** e familiar
- ✅ **Controle total** sobre os dados

## 🚀 **Conclusão**

**✅ VIABILIDADE: ALTA**

Todos os recursos necessários estão disponíveis:
- ✅ APIs completas para CRUD operations
- ✅ Context já implementado  
- ✅ Padrões de design estabelecidos
- ✅ Utilitários de formatação prontos

**Pronto para implementação!** 🎉