import React, { useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  LayoutList, 
  Calendar as CalendarIcon,
  Table2, 
  PieChart, 
  Sparkles, 
  FileSpreadsheet,
  Upload,
  Command,
  Sun,
  Moon,
  FolderOpen
} from 'lucide-react';
import { ViewMode } from '../types/moneybook';
import { CurrencyCode } from '../utils/currency';
import { Tooltip } from './Tooltip';

interface HeaderProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onResetMonth: () => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  currency: CurrencyCode;
  onChangeCurrency: (curr: CurrencyCode) => void;
  onOpenQuickPaste: () => void;
  onExportExcel: () => void;
  onImportExcel: (file: File) => void;
  onOpenCommandPalette: () => void;
  onToggleTheme: () => void;
  onOpenDataFolder?: () => void;
  onOpenStorageSettings?: () => void;
  isDark: boolean;
}

export const Header: React.FC<HeaderProps> = React.memo(({
  currentDate,
  onPrevMonth,
  onNextMonth,
  onResetMonth,
  viewMode,
  onChangeViewMode,
  currency,
  onChangeCurrency,
  onOpenQuickPaste,
  onExportExcel,
  onImportExcel,
  onOpenCommandPalette,
  onToggleTheme,
  onOpenDataFolder,
  onOpenStorageSettings,
  isDark
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const isCurrentMonth = () => {
    const now = new Date();
    return now.getFullYear() === year && now.getMonth() + 1 === month;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImportExcel(file);
      e.target.value = '';
    }
  };

  return (
    <header className="titlebar-drag bg-white/70 dark:bg-[#161618]/70 backdrop-blur-2xl border-b border-black/[0.04] dark:border-white/[0.06] px-5 py-3 sticky top-0 z-30 select-none">
      <div className="flex items-center justify-between">
        {/* Left: Traffic light safe spacer (84px) + App Name & Month Segment */}
        <div className="flex items-center gap-3 pl-[84px] shrink-0">
          <span className="text-[13px] font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Tally
          </span>

          {/* Month Segment Pill */}
          <div className="titlebar-no-drag flex items-center bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-full border border-black/[0.03] dark:border-white/[0.04]">
            <Tooltip content="이전 달">
              <button
                onClick={onPrevMonth}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
            <Tooltip content="이번 달로 이동">
              <button
                onClick={onResetMonth}
                className={`px-2.5 py-0.5 text-[11px] tracking-tight font-medium rounded-full transition-all cursor-pointer ${
                  isCurrentMonth()
                    ? 'text-neutral-800 dark:text-neutral-200'
                    : 'text-[#34C759] font-semibold'
                }`}
              >
                {year}년 {month}월
              </button>
            </Tooltip>
            <Tooltip content="다음 달">
              <button
                onClick={onNextMonth}
                className="w-5 h-5 flex items-center justify-center rounded-full hover:bg-white dark:hover:bg-white/10 text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-all cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </Tooltip>
          </div>
        </div>

        {/* Center: 4 Pure Core View Modes */}
        <div className="titlebar-no-drag flex items-center bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-full border border-black/[0.03] dark:border-white/[0.04] shrink-0">
          <Tooltip content="타임라인 피드" shortcut="⌘1">
            <button
              onClick={() => onChangeViewMode('feed')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                viewMode === 'feed'
                  ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <LayoutList className="w-3 h-3" />
              <span>피드</span>
            </button>
          </Tooltip>
          <Tooltip content="월간 달력" shortcut="⌘2">
            <button
              onClick={() => onChangeViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                viewMode === 'calendar'
                  ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <CalendarIcon className="w-3 h-3" />
              <span>달력</span>
            </button>
          </Tooltip>
          <Tooltip content="대량 입력 시트" shortcut="⌘3">
            <button
              onClick={() => onChangeViewMode('spreadsheet')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                viewMode === 'spreadsheet'
                  ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <Table2 className="w-3 h-3" />
              <span>시트</span>
            </button>
          </Tooltip>
          <Tooltip content="지출 인사이트 통계" shortcut="⌘4">
            <button
              onClick={() => onChangeViewMode('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium rounded-full transition-all cursor-pointer ${
                viewMode === 'analytics'
                  ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              <PieChart className="w-3 h-3" />
              <span>인사이트</span>
            </button>
          </Tooltip>
        </div>

        {/* Right: Currency Switcher, Command Palette, Theme, Actions & Local Storage */}
        <div className="titlebar-no-drag flex items-center gap-2 shrink-0">
          {/* Multi-Currency Toggle Segment */}
          <div className="flex items-center bg-black/[0.04] dark:bg-white/[0.06] p-0.5 rounded-full border border-black/[0.03] dark:border-white/[0.04] text-[10px] font-mono">
            <Tooltip content="원화 (KRW) 표시">
              <button
                onClick={() => onChangeCurrency('KRW')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  currency === 'KRW'
                    ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-bold'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                ₩ KRW
              </button>
            </Tooltip>
            <Tooltip content="미국 달러 (USD) 표시">
              <button
                onClick={() => onChangeCurrency('USD')}
                className={`px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                  currency === 'USD'
                    ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-[0_1px_2px_rgba(0,0,0,0.06)] font-bold'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                $ USD
              </button>
            </Tooltip>
          </div>

          {/* Command Palette Button (⌘K) */}
          <Tooltip content="커맨드 팔레트" shortcut="⌘K">
            <button
              onClick={onOpenCommandPalette}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-neutral-600 dark:text-neutral-300 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Command className="w-3 h-3 text-neutral-500" />
              <span className="font-mono text-[10px] text-neutral-400">⌘K</span>
            </button>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip content={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'} shortcut="⌘T">
            <button
              onClick={onToggleTheme}
              className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isDark ? <Sun className="w-3.5 h-3.5 text-[#FF9500]" /> : <Moon className="w-3.5 h-3.5 text-[#5856D6]" />}
            </button>
          </Tooltip>

          {/* Smart Paste Pill Button */}
          <Tooltip content="문자/알림 스마트 파싱" shortcut="⌘V">
            <button
              onClick={onOpenQuickPaste}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-neutral-700 dark:text-neutral-200 bg-white/80 dark:bg-white/10 hover:bg-white dark:hover:bg-white/15 border border-black/[0.04] dark:border-white/[0.06] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all cursor-pointer active:scale-95"
            >
              <Sparkles className="w-3 h-3 text-[#5856D6]" />
              <span>스마트 붙여넣기</span>
            </button>
          </Tooltip>

          {/* Import Excel Trigger */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".xls,.xlsx,.csv"
            className="hidden"
          />
          <Tooltip content="엑셀 파일 가져오기">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Export Excel Button */}
          <Tooltip content="엑셀 파일 내보내기">
            <button
              onClick={onExportExcel}
              className="w-7 h-7 flex items-center justify-center rounded-full text-neutral-600 dark:text-neutral-300 hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </button>
          </Tooltip>

          {/* Local Storage & CSV Settings Button */}
          {onOpenStorageSettings && (
            <>
              <div className="h-3 w-[1px] bg-black/[0.08] dark:bg-white/[0.1] mx-0.5" />
              <Tooltip content="로컬 저장소 폴더 및 엑셀(CSV) 설정">
                <button
                  onClick={onOpenStorageSettings}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium text-neutral-600 dark:text-neutral-300 bg-black/[0.03] dark:bg-white/[0.05] hover:bg-black/[0.06] dark:hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <FolderOpen className="w-3 h-3 text-[#007AFF]" />
                  <span className="hidden sm:inline">저장소 & 엑셀</span>
                </button>
              </Tooltip>
            </>
          )}
        </div>
      </div>
    </header>
  );
});
