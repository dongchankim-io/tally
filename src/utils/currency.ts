export type CurrencyCode = 'KRW' | 'USD' | 'EUR' | 'JPY';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
  decimals: number;
  rateToKRW: number; // Reference exchange rate to KRW
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  KRW: {
    code: 'KRW',
    symbol: '₩',
    name: '원화 (KRW)',
    decimals: 0,
    rateToKRW: 1
  },
  USD: {
    code: 'USD',
    symbol: '$',
    name: '달러 (USD)',
    decimals: 2,
    rateToKRW: 1400
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    name: '유로 (EUR)',
    decimals: 2,
    rateToKRW: 1520
  },
  JPY: {
    code: 'JPY',
    symbol: '¥',
    name: '엔화 (JPY)',
    decimals: 0,
    rateToKRW: 9.3
  }
};

/**
 * Format currency with appropriate decimals and symbol
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'KRW'): string {
  const config = CURRENCIES[currency] || CURRENCIES.KRW;

  const formattedNum = amount.toLocaleString(undefined, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals
  });

  return `${config.symbol}${formattedNum}`;
}

/**
 * Convert amount to KRW for Naver Moneybook compatibility
 */
export function convertToKRW(amount: number, currency: CurrencyCode): number {
  if (currency === 'KRW') return Math.round(amount);
  const rate = CURRENCIES[currency]?.rateToKRW || 1;
  return Math.round(amount * rate);
}
