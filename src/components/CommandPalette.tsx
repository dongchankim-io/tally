import React, { useState, useEffect } from 'react';
import { 
  Search, 
  LayoutList, 
  Calendar, 
  Table2, 
  PieChart, 
  Plus, 
  Sparkles, 
  FileSpreadsheet, 
  Moon, 
  Sun,
  CheckCircle2,
  FolderOpen,
  X
} from 'lucide-react';
import { ViewMode } from '../types/moneybook';
import { CurrencyCode } from '../utils/currency';
import { Tooltip } from './Tooltip';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeViewMode: (mode: ViewMode) => void;
  currency: CurrencyCode;
  onChangeCurrency: (curr: CurrencyCode) => void;
  onAddRow: () => void;
  onOpenQuickPaste: () => void;
  onExportExcel: () => void;
  onToggleTheme: () => void;
  onOpenDataFolder?: () => void;
  onMarkAllReviewed?: () => void;
  isDark: boolean;
}

export const CommandPalette: React.FC<CommandPaletteProps> = React.memo(({
  isOpen,
  onClose,
  onChangeViewMode,
  currency,
  onChangeCurrency,
  onAddRow,
  onOpenQuickPaste,
  onExportExcel,
  onToggleTheme,
  onOpenDataFolder,
  onMarkAllReviewed,
  isDark
}) => {
  const [query, setQuery] = useState('');

  // Handle ESC key at window level when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const actions = [
    {
      category: '뷰 이동 (Navigation)',
      items: [
        { id: 'view-feed', label: '타임라인 피드 보기', icon: <LayoutList className="w-4 h-4" />, shortcut: '⌘1', run: () => onChangeViewMode('feed') },
        { id: 'view-cal', label: '월간 지출 달력 보기', icon: <Calendar className="w-4 h-4" />, shortcut: '⌘2', run: () => onChangeViewMode('calendar') },
        { id: 'view-sheet', label: '대량 스프레드시트 보기', icon: <Table2 className="w-4 h-4" />, shortcut: '⌘3', run: () => onChangeViewMode('spreadsheet') },
        { id: 'view-stats', label: '지출 인사이트 분석', icon: <PieChart className="w-4 h-4" />, shortcut: '⌘4', run: () => onChangeViewMode('analytics') },
      ]
    },
    {
      category: '통화 설정 (Currency)',
      items: [
        { id: 'curr-krw', label: '원화로 전환 (₩ KRW)', icon: <span className="font-mono font-bold text-xs">₩</span>, shortcut: currency === 'KRW' ? '✓' : '', run: () => onChangeCurrency('KRW') },
        { id: 'curr-usd', label: '미국 달러로 전환 ($ USD)', icon: <span className="font-mono font-bold text-xs">$</span>, shortcut: currency === 'USD' ? '✓' : '', run: () => onChangeCurrency('USD') },
        { id: 'curr-eur', label: '유로화로 전환 (€ EUR)', icon: <span className="font-mono font-bold text-xs">€</span>, shortcut: currency === 'EUR' ? '✓' : '', run: () => onChangeCurrency('EUR') },
        { id: 'curr-jpy', label: '일본 엔화로 전환 (¥ JPY)', icon: <span className="font-mono font-bold text-xs">¥</span>, shortcut: currency === 'JPY' ? '✓' : '', run: () => onChangeCurrency('JPY') },
      ]
    },
    {
      category: '작업 (Actions)',
      items: [
        { id: 'act-add', label: '새 지출 항목 추가', icon: <Plus className="w-4 h-4" />, shortcut: '⌘N', run: onAddRow },
        { id: 'act-paste', label: '스마트 결제 문자 붙여넣기', icon: <Sparkles className="w-4 h-4 text-[#5856D6]" />, shortcut: '⌘V', run: onOpenQuickPaste },
        { id: 'act-excel', label: '호환 엑셀 파일로 내보내기', icon: <FileSpreadsheet className="w-4 h-4 text-[#34C759]" />, shortcut: '⌘E', run: onExportExcel },
        ...(onOpenDataFolder ? [
          { id: 'act-folder', label: 'Mac 로컬 저장소 위치 열기 (Finder)', icon: <FolderOpen className="w-4 h-4 text-[#007AFF]" />, shortcut: '', run: onOpenDataFolder }
        ] : []),
        ...(onMarkAllReviewed ? [
          { id: 'act-review-all', label: '이번 달 모든 내역 검토 완료 마크 (Reconciliation)', icon: <CheckCircle2 className="w-4 h-4 text-[#34C759]" />, shortcut: '', run: onMarkAllReviewed }
        ] : []),
        { id: 'act-theme', label: isDark ? '라이트 모드로 전환' : '다크 모드로 전환', icon: isDark ? <Sun className="w-4 h-4 text-[#FF9500]" /> : <Moon className="w-4 h-4 text-[#5856D6]" />, shortcut: '⌘T', run: onToggleTheme },
      ]
    }
  ];

  const filtered = actions.map(group => ({
    ...group,
    items: group.items.filter(item => item.label.toLowerCase().includes(query.toLowerCase()))
  })).filter(group => group.items.length > 0);

  const handleSelect = (run: () => void) => {
    run();
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="glass-panel bg-white/95 dark:bg-[#1C1C1E]/95 rounded-2xl max-w-lg w-full shadow-[0_24px_64px_rgba(0,0,0,0.25)] border border-black/[0.08] dark:border-white/[0.1] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-black/[0.06] dark:border-white/[0.08]">
          <Search className="w-4 h-4 text-neutral-400 mr-3 shrink-0" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="명령어 또는 이동할 뷰를 검색하세요..."
            className="w-full bg-transparent border-none outline-none text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400"
          />
          <Tooltip content="닫기 (ESC)">
            <button
              onClick={onClose}
              className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-black/[0.05] dark:hover:bg-white/10 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </Tooltip>
        </div>

        {/* Action List */}
        <div className="max-h-80 overflow-y-auto p-2 divide-y divide-black/[0.03] dark:divide-white/[0.04]">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              일치하는 명령어가 없습니다.
            </div>
          ) : (
            filtered.map((group, gIdx) => (
              <div key={gIdx} className={gIdx > 0 ? "pt-2 mt-2" : ""}>
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-400">
                  {group.category}
                </div>
                <div className="space-y-0.5 mt-1">
                  {group.items.map(item => (
                    <button
                      key={item.id}
                      onClick={() => handleSelect(item.run)}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs hover:bg-black/[0.04] dark:hover:bg-white/[0.06] transition-colors text-left group cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 text-neutral-700 dark:text-neutral-200">
                        <span className="text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 transition-colors">
                          {item.icon}
                        </span>
                        <span className="font-medium text-[11px]">{item.label}</span>
                      </div>
                      {item.shortcut && (
                        <kbd className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/[0.04] dark:bg-white/[0.08] text-neutral-500 dark:text-neutral-400 border border-black/[0.02] dark:border-white/[0.04]">
                          {item.shortcut}
                        </kbd>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Palette Footer */}
        <div className="px-4 py-2 border-t border-black/[0.04] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between text-[10px] text-neutral-400">
          <div className="flex items-center gap-1.5">
            <span className="font-medium">Tally Command Menu</span>
          </div>
          <div className="flex items-center gap-2">
            <span>닫기</span>
            <kbd className="font-mono bg-black/[0.04] dark:bg-white/[0.08] px-1 py-0.5 rounded border border-black/[0.04] dark:border-white/[0.06]">ESC</kbd>
          </div>
        </div>
      </div>
    </div>
  );
});
