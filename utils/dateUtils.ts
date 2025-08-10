export type PeriodKey = '7d' | '30d' | '3m';

export interface DateRange {
  startDate: string;
  endDate: string;
  labels: string[];
}

export const calculateDateRange = (period: PeriodKey): DateRange => {
  const today = new Date();
  const endDate = new Date(today);
  endDate.setHours(23, 59, 59, 999); // End of today

  let startDate: Date;
  let labels: string[];

  switch (period) {
    case '7d':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6); // 7 days including today
      startDate.setHours(0, 0, 0, 0);
      
      labels = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
      break;

    case '30d':
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 29); // 30 days including today
      startDate.setHours(0, 0, 0, 0);
      
      labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`);
      break;

    case '3m':
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 2); // 3 months including current
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
      
      labels = Array.from({ length: 12 }, (_, i) => `Sem ${i + 1}`);
      break;

    default:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
      labels = ['segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado', 'domingo'];
  }

  return {
    startDate: startDate.toISOString().split('T')[0], // YYYY-MM-DD format
    endDate: endDate.toISOString().split('T')[0],
    labels,
  };
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
  });
};

export const getCurrentDate = (): string => {
  return new Date().toISOString().split('T')[0];
}; 