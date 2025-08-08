/**
 * Firebase error message handler for authentication
 * Provides user-friendly error messages in Portuguese
 */
export const getFirebaseErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    // Password reset errors
    case 'auth/user-not-found':
      return 'Email não encontrado. Verifique se o email está correto.';
    case 'auth/invalid-email':
      return 'Email inválido. Digite um email válido.';
    case 'auth/too-many-requests':
      return 'Muitas tentativas. Tente novamente em alguns minutos.';
    case 'auth/network-request-failed':
      return 'Erro de conexão. Verifique sua internet e tente novamente.';
    
    // Login errors
    case 'auth/wrong-password':
      return 'Senha incorreta. Tente novamente.';
    case 'auth/user-disabled':
      return 'Conta desabilitada. Entre em contato com o suporte.';
    case 'auth/user-token-expired':
      return 'Sessão expirada. Faça login novamente.';
    
    // Registration errors
    case 'auth/email-already-in-use':
      return 'Este email já está em uso. Tente fazer login ou use outro email.';
    case 'auth/weak-password':
      return 'Senha muito fraca. Use pelo menos 6 caracteres.';
    case 'auth/operation-not-allowed':
      return 'Operação não permitida. Entre em contato com o suporte.';
    
    // Generic errors
    case 'auth/invalid-credential':
      return 'Credenciais inválidas. Verifique seu email e senha.';
    case 'auth/account-exists-with-different-credential':
      return 'Conta já existe com credenciais diferentes.';
    case 'auth/requires-recent-login':
      return 'Login recente necessário. Faça login novamente.';
    
    // Default fallback
    default:
      return 'Ocorreu um erro inesperado. Tente novamente.';
  }
}; 