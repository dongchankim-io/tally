export type EntryType = 'expense' | 'income' | 'transfer';
export type ViewMode = 'feed' | 'calendar' | 'spreadsheet' | 'analytics';

export interface MoneybookEntry {
  id: string;
  type: EntryType;
  date: string; // YYYY-MM-DD
  mainCategory: string;
  subCategory: string;
  paymentMethod: string;
  payee: string; // 사용처/상호명
  amount: number;
  currency?: 'KRW' | 'USD' | 'EUR' | 'JPY';
  memo: string;
  reviewed?: boolean; // Baselane-style bookkeeper review status
  reviewedAt?: number;
  createdAt?: number;
}

export type TallyEntry = MoneybookEntry;

export interface CategoryTree {
  [mainCategory: string]: string[];
}

export interface StorageInfo {
  current_dir: string;
  is_custom: boolean;
  json_path: string;
  csv_path: string;
}
