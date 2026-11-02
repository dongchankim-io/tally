import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Header } from './components/Header';
import { MonthlySummaryBanner } from './components/MonthlySummaryBanner';
import { QuickEntryBar } from './components/QuickEntryBar';
import { TransactionFeed } from './components/TransactionFeed';
import { CalendarView } from './components/CalendarView';
import { BulkTable } from './components/BulkTable';
import { AnalyticsView } from './components/AnalyticsView';
import { QuickPasteModal } from './components/QuickPasteModal';
import { CommandPalette } from './components/CommandPalette';
import { StorageSettingsModal } from './components/StorageSettingsModal';
import { MoneybookEntry, ViewMode, StorageInfo } from './types/moneybook';
import { generateId, getTodayDate } from './utils/parser';
import { exportToExcel } from './utils/excelExporter';
import { parseExcelFile } from './utils/excelImporter';
import { CurrencyCode } from './utils/currency';

declare global {
  interface Window {
    tallyAPI?: {
      loadData: () => Promise<{
        success: boolean;
        data: MoneybookEntry[] | null;
        filePath?: string;
        csvPath?: string;
        storageInfo?: StorageInfo;
      }>;
      saveData: (data: MoneybookEntry[]) => Promise<{
        success: boolean;
        filePath?: string;
        csvPath?: string;
        storageInfo?: StorageInfo;
      }>;
      openDataFolder: () => Promise<{ success: boolean; filePath?: string }>;
      openCsvFile: () => Promise<boolean>;
      getStorageInfo: () => Promise<StorageInfo | null>;
      chooseFolderDialog: () => Promise<string | null>;
      setStorageFolder: (folder: string | null) => Promise<{
        success: boolean;
        data: MoneybookEntry[] | null;
        filePath?: string;
        csvPath?: string;
        storageInfo?: StorageInfo;
      }>;
      openExternal: (url: string) => Promise<boolean>;
    };
  }
}

const STORAGE_KEY = 'tally_local_entries_v1';
const THEME_KEY = 'tally_theme_mode';
const CURRENCY_KEY = 'tally_currency_mode';

function getInitialDemoEntries(): MoneybookEntry[] {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const py = prevDate.getFullYear();
  const pm = String(prevDate.getMonth() + 1).padStart(2, '0');

  return [
    // 이번 달 내역
    {
      id: generateId(),
      type: 'expense',
      date: `${y}-${m}-02`,
      mainCategory: '식비',
      subCategory: '카페/간식',
      paymentMethod: '신용카드',
      payee: '스타벅스 강남점',
      amount: 6200,
      memo: '아메리카노 & 베이글',
      reviewed: false
    },
    {
      id: generateId(),
      type: 'expense',
      date: `${y}-${m}-02`,
      mainCategory: '생활/마트',
      subCategory: '편의점',
      paymentMethod: '네이버페이',
      payee: 'GS25 역삼역점',
      amount: 4800,
      memo: '생수, 단백질 음료',
      reviewed: false
    },
    {
      id: generateId(),
      type: 'expense',
      date: `${y}-${m}-02`,
      mainCategory: '문화/여가',
      subCategory: '도서/음악',
      paymentMethod: '체크카드',
      payee: '교보문고 강남점',
      amount: 22000,
      memo: '개발 서적 구입',
      reviewed: true,
      reviewedAt: Date.now() - 3600000
    },
    {
      id: generateId(),
      type: 'expense',
      date: `${y}-${m}-01`,
      mainCategory: '식비',
      subCategory: '외식',
      paymentMethod: '체크카드',
      payee: '백소정 강남본점',
      amount: 14500,
      memo: '마제소바 돈카츠 세트',
      reviewed: true,
      reviewedAt: Date.now() - 86400000
    },
    {
      id: generateId(),
      type: 'expense',
      date: `${y}-${m}-01`,
      mainCategory: '교통/차량',
      subCategory: '택시',
      paymentMethod: '카카오페이',
      payee: '카카오 T 택시',
      amount: 11200,
      memo: '야근 귀가',
      reviewed: false
    },
    {
      id: generateId(),
      type: 'income',
      date: `${y}-${m}-01`,
      mainCategory: '급여',
      subCategory: '월급/본업',
      paymentMethod: '계좌이체',
      payee: `${Number(m)}월 급여 입금`,
      amount: 3850000,
      memo: '본봉 + 직무수당',
      reviewed: true,
      reviewedAt: Date.now() - 86400000
    },

    // 지난 달 내역 (전월 대비 비교용)
    {
      id: generateId(),
      type: 'expense',
      date: `${py}-${pm}-28`,
      mainCategory: '식비',
      subCategory: '외식',
      paymentMethod: '신용카드',
      payee: '아웃백 스테이크하우스',
      amount: 58000,
      memo: `${Number(pm)}월 회식`,
      reviewed: true,
      reviewedAt: Date.now() - 86400000 * 5
    },
    {
      id: generateId(),
      type: 'expense',
      date: `${py}-${pm}-25`,
      mainCategory: '교통/차량',
      subCategory: '택시',
      paymentMethod: '카카오페이',
      payee: '카카오 T 택시',
      amount: 32000,
      memo: '공항 이동 택시',
      reviewed: true,
      reviewedAt: Date.now() - 86400000 * 8
    },
    {
      id: generateId(),
      type: 'expense',
      date: `${py}-${pm}-20`,
      mainCategory: '쇼핑/패션',
      subCategory: '의류',
      paymentMethod: '신용카드',
      payee: '무신사 스토어',
      amount: 79000,
      memo: '가을 셔츠 & 니트',
      reviewed: true,
      reviewedAt: Date.now() - 86400000 * 12
    },
    {
      id: generateId(),
      type: 'expense',
      date: `${py}-${pm}-15`,
      mainCategory: '생활/마트',
      subCategory: '마트/슈퍼',
      paymentMethod: '네이버페이',
      payee: '이마트 역삼점',
      amount: 35000,
      memo: '생필품 장보기',
      reviewed: true,
      reviewedAt: Date.now() - 86400000 * 16
    },
    {
      id: generateId(),
      type: 'expense',
      date: `${py}-${pm}-10`,
      mainCategory: '문화/여가',
      subCategory: 'OTT/구독',
      paymentMethod: '신용카드',
      payee: '넷플릭스',
      amount: 17000,
      memo: '월간 구독료',
      reviewed: true,
      reviewedAt: Date.now() - 86400000 * 20
    },
    {
      id: generateId(),
      type: 'income',
      date: `${py}-${pm}-01`,
      mainCategory: '급여',
      subCategory: '월급/본업',
      paymentMethod: '계좌이체',
      payee: `${Number(pm)}월 급여 입금`,
      amount: 3700000,
      memo: '본봉',
      reviewed: true,
      reviewedAt: Date.now() - 86400000 * 30
    },
    {
      id: generateId(),
      type: 'income',
      date: `${py}-${pm}-10`,
      mainCategory: '부수입',
      subCategory: '이자/배당',
      paymentMethod: '계좌이체',
      payee: '토스뱅크 이자 입금',
      amount: 28000,
      memo: '파킹통장 이자',
      reviewed: true,
      reviewedAt: Date.now() - 86400000 * 21
    }
  ];
}

export function App() {
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('feed');
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem(CURRENCY_KEY) as CurrencyCode) || 'KRW';
  });
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem(THEME_KEY) === 'dark';
  });

  const [entries, setEntries] = useState<MoneybookEntry[]>(() => {
    // Initial sync load from localStorage if available
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch (e) {
        console.error('Failed to parse storage:', e);
      }
    }
    return getInitialDemoEntries();
  });

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isQuickPasteOpen, setIsQuickPasteOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isStorageSettingsOpen, setIsStorageSettingsOpen] = useState(false);
  const [storageInfo, setStorageInfo] = useState<StorageInfo | null>(null);

  // Initial load from Mac Local Storage
  const reloadData = useCallback(() => {
    if (window.tallyAPI) {
      window.tallyAPI.loadData().then(res => {
        if (res.success) {
          if (Array.isArray(res.data) && res.data.length > 0) {
            setEntries(res.data);
          }
          if (res.storageInfo) {
            setStorageInfo(res.storageInfo);
          }
        }
      }).catch(err => {
        console.error('Failed to load local file data:', err);
      });
    }
  }, []);

  useEffect(() => {
    reloadData();
  }, [reloadData]);

  // Theme & Currency Sync
  useEffect(() => {
    localStorage.setItem(CURRENCY_KEY, currency);
  }, [currency]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDark]);

  const handleToggleTheme = useCallback(() => setIsDark(prev => !prev), []);

  // Debounced save to Mac Local JSON File & localStorage (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Save to browser/web cache
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        // Save to native Mac Application Data file
        if (window.tallyAPI) {
          window.tallyAPI.saveData(entries);
        }
      } catch (err) {
        console.error('Failed to save entries to local storage:', err);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [entries]);

  // Flush save on beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
        if (window.tallyAPI) {
          window.tallyAPI.saveData(entries);
        }
      } catch (e) {}
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [entries]);

  // Global Keyboard Shortcuts (⌘K, ⌘1~4, ⌘N, ⌘E, ⌘T)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmd = e.metaKey || e.ctrlKey;
      if (!isCmd) return;

      if (e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      } else if (e.key === '1') {
        e.preventDefault();
        setViewMode('feed');
      } else if (e.key === '2') {
        e.preventDefault();
        setViewMode('calendar');
      } else if (e.key === '3') {
        e.preventDefault();
        setViewMode('spreadsheet');
      } else if (e.key === '4') {
        e.preventDefault();
        setViewMode('analytics');
      } else if (e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleAddRow();
      } else if (e.key.toLowerCase() === 'e') {
        e.preventDefault();
        handleExportExcel();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleToggleTheme();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [entries]);

  // Date navigation
  const handlePrevMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  }, []);

  const handleNextMonth = useCallback(() => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  }, []);

  const handleResetMonth = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // CRUD Handlers
  const handleAddEntry = useCallback((newEntry: MoneybookEntry) => {
    setEntries(prev => [newEntry, ...prev]);
  }, []);

  const handleAddRow = useCallback(() => {
    setCurrentDate(curr => {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      const day = String(new Date().getDate()).padStart(2, '0');
      const newEntry: MoneybookEntry = {
        id: generateId(),
        type: 'expense',
        date: `${year}-${month}-${day}`,
        mainCategory: '식비',
        subCategory: '외식',
        paymentMethod: '신용카드',
        payee: '',
        amount: 0,
        memo: '',
        reviewed: false
      };
      setEntries(prev => [newEntry, ...prev]);
      return curr;
    });
  }, []);

  const handleUpdateEntry = useCallback((id: string, updates: Partial<MoneybookEntry>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const handleDeleteEntry = useCallback((id: string) => {
    setEntries(prev => prev.filter(e => e.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleDuplicateEntry = useCallback((id: string) => {
    setEntries(prev => {
      const targetIndex = prev.findIndex(e => e.id === id);
      if (targetIndex === -1) return prev;
      const target = prev[targetIndex];
      const duplicated: MoneybookEntry = {
        ...target,
        id: generateId(),
        reviewed: false,
        reviewedAt: undefined
      };
      return [
        ...prev.slice(0, targetIndex + 1),
        duplicated,
        ...prev.slice(targetIndex + 1)
      ];
    });
  }, []);

  // Baselane-style Review (Reconciliation) handlers
  const handleToggleReview = useCallback((id: string) => {
    setEntries(prev => prev.map(e => {
      if (e.id === id) {
        const nextReviewed = !e.reviewed;
        return {
          ...e,
          reviewed: nextReviewed,
          reviewedAt: nextReviewed ? Date.now() : undefined
        };
      }
      return e;
    }));
  }, []);

  const handleBatchReview = useCallback((ids: string[], reviewed: boolean) => {
    const idSet = new Set(ids);
    const now = Date.now();
    setEntries(prev => prev.map(e => {
      if (idSet.has(e.id)) {
        return {
          ...e,
          reviewed,
          reviewedAt: reviewed ? now : undefined
        };
      }
      return e;
    }));
  }, []);

  const handleMarkAllMonthReviewed = useCallback(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const now = Date.now();
    setEntries(prev => prev.map(e => {
      if (e.date.startsWith(monthStr)) {
        return { ...e, reviewed: true, reviewedAt: now };
      }
      return e;
    }));
  }, [currentDate]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (checked) {
      setEntries(prev => {
        setSelectedIds(new Set(prev.map(e => e.id)));
        return prev;
      });
    } else {
      setSelectedIds(new Set());
    }
  }, []);

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleImportParsed = useCallback((newEntries: MoneybookEntry[]) => {
    setEntries(prev => [...newEntries, ...prev]);
  }, []);

  const handleExportExcel = useCallback(() => {
    setCurrentDate(curr => {
      const year = curr.getFullYear();
      const month = String(curr.getMonth() + 1).padStart(2, '0');
      setEntries(currEntries => {
        const monthEntries = currEntries.filter(e => e.date.startsWith(`${year}-${month}`));
        exportToExcel(monthEntries.length > 0 ? monthEntries : currEntries);
        return currEntries;
      });
      return curr;
    });
  }, []);

  const handleImportExcel = useCallback(async (file: File) => {
    try {
      const parsed = await parseExcelFile(file);
      if (parsed.length === 0) return;
      setEntries(prev => {
        const existingKeys = new Set(prev.map(e => `${e.date}_${e.payee}_${e.amount}`));
        const newItems = parsed.filter(e => !existingKeys.has(`${e.date}_${e.payee}_${e.amount}`));
        return [...newItems, ...prev];
      });
    } catch (err: any) {
      console.error('Failed to parse excel:', err);
    }
  }, []);

  const handleOpenDataFolder = useCallback(async () => {
    if (window.tallyAPI) {
      await window.tallyAPI.openDataFolder();
    } else {
      alert('브라우저 환경에서는 로컬 웹 저장소(localStorage)에 데이터가 안전하게 보관됩니다.');
    }
  }, []);

  const handleOpenCsvFile = useCallback(async () => {
    if (window.tallyAPI) {
      const ok = await window.tallyAPI.openCsvFile();
      if (!ok) {
        alert('엑셀(CSV) 파일이 아직 생성되지 않았습니다. 장부 내역이 저장되면 자동으로 생성됩니다.');
      }
    } else {
      alert('데스크톱 앱 환경에서 지원되는 기능입니다.');
    }
  }, []);

  return (
    <div className="flex flex-col h-full bg-[#F5F5F7] dark:bg-[#0A0A0C] font-sans text-neutral-900 dark:text-neutral-100 antialiased selection:bg-neutral-900 selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Top Header with traffic light safe spacing */}
      <Header
        currentDate={currentDate}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onResetMonth={handleResetMonth}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        currency={currency}
        onChangeCurrency={setCurrency}
        onOpenQuickPaste={() => setIsQuickPasteOpen(true)}
        onExportExcel={handleExportExcel}
        onImportExcel={handleImportExcel}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onToggleTheme={handleToggleTheme}
        onOpenDataFolder={handleOpenDataFolder}
        onOpenStorageSettings={() => setIsStorageSettingsOpen(true)}
        isDark={isDark}
      />

      {/* Monthly Summary & Quick Entry Bar */}
      <MonthlySummaryBanner
        entries={entries}
        currentDate={currentDate}
        currency={currency}
      />

      <QuickEntryBar
        onAddEntry={handleAddEntry}
        currency={currency}
      />

      {/* 4 Pure Distraction-free View Modes */}
      {viewMode === 'feed' && (
        <TransactionFeed
          entries={entries}
          currentDate={currentDate}
          currency={currency}
          onDeleteEntry={handleDeleteEntry}
          onDuplicateEntry={handleDuplicateEntry}
          onUpdateEntry={handleUpdateEntry}
          onToggleReview={handleToggleReview}
        />
      )}

      {viewMode === 'calendar' && (
        <CalendarView
          entries={entries}
          currentDate={currentDate}
          currency={currency}
        />
      )}

      {viewMode === 'spreadsheet' && (
        <BulkTable
          entries={entries}
          currentDate={currentDate}
          currency={currency}
          selectedIds={selectedIds}
          onSelectAll={handleSelectAll}
          onToggleSelect={handleToggleSelect}
          onUpdateEntry={handleUpdateEntry}
          onDeleteEntry={handleDeleteEntry}
          onDuplicateEntry={handleDuplicateEntry}
          onAddRow={handleAddRow}
          onToggleReview={handleToggleReview}
          onBatchReview={handleBatchReview}
        />
      )}

      {viewMode === 'analytics' && (
        <AnalyticsView
          entries={entries}
          currentDate={currentDate}
          currency={currency}
        />
      )}

      {/* Raycast-style Command Palette (⌘K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onChangeViewMode={setViewMode}
        currency={currency}
        onChangeCurrency={setCurrency}
        onAddRow={handleAddRow}
        onOpenQuickPaste={() => setIsQuickPasteOpen(true)}
        onExportExcel={handleExportExcel}
        onToggleTheme={handleToggleTheme}
        onOpenDataFolder={handleOpenDataFolder}
        onOpenStorageSettings={() => setIsStorageSettingsOpen(true)}
        onOpenCsvFile={handleOpenCsvFile}
        onMarkAllReviewed={handleMarkAllMonthReviewed}
        isDark={isDark}
      />

      {/* Quick Paste Modal */}
      <QuickPasteModal
        isOpen={isQuickPasteOpen}
        onClose={() => setIsQuickPasteOpen(false)}
        onImport={handleImportParsed}
      />

      {/* Storage Settings & CSV Modal */}
      <StorageSettingsModal
        isOpen={isStorageSettingsOpen}
        onClose={() => setIsStorageSettingsOpen(false)}
        storageInfo={storageInfo}
        onStorageInfoChange={setStorageInfo}
        onReloadEntries={reloadData}
      />

      {/* Clean Open-Source Footer Status Bar */}
      <footer className="px-6 py-2 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-[11px] text-neutral-400 select-none">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsStorageSettingsOpen(true)}
            className="flex items-center gap-1.5 font-medium hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
            <span>{storageInfo?.is_custom ? 'Custom Storage (CSV Live Sync)' : '100% Mac Local Storage (CSV Sync)'}</span>
          </button>
          <span>•</span>
          <span>Zero Network Tracking</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span><b>⌘K</b> 커맨드 메뉴</span>
          <span>•</span>
          <span><b>⌘1~4</b> 뷰 전환</span>
          <span>•</span>
          <span><b>⌘N</b> 새 지출</span>
          <span>•</span>
          <span><b>⌘E</b> 엑셀 내보내기</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
