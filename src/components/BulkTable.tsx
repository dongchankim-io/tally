import React, { useMemo, useCallback } from 'react';
import { 
  Trash2, 
  Copy, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Plus
} from 'lucide-react';
import { MoneybookEntry, EntryType } from '../types/moneybook';
import { 
  PAYMENT_METHODS, 
  guessCategory, 
  getCategoriesByType 
} from '../utils/categories';
import { CurrencyCode, CURRENCIES } from '../utils/currency';
import { Tooltip } from './Tooltip';

interface BulkTableProps {
  entries: MoneybookEntry[];
  currentDate: Date;
  currency: CurrencyCode;
  selectedIds: Set<string>;
  onSelectAll: (checked: boolean) => void;
  onToggleSelect: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<MoneybookEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onDuplicateEntry: (id: string) => void;
  onAddRow: () => void;
  onToggleReview: (id: string) => void;
  onBatchReview: (ids: string[], reviewed: boolean) => void;
}

interface BulkTableRowProps {
  entry: MoneybookEntry;
  index: number;
  isSelected: boolean;
  currConfig: any;
  onToggleSelect: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<MoneybookEntry>) => void;
  onDeleteEntry: (id: string) => void;
  onDuplicateEntry: (id: string) => void;
  onAddRow: () => void;
  onToggleReview: (id: string) => void;
  isLastRow: boolean;
}

const BulkTableRow = React.memo<BulkTableRowProps>(({
  entry,
  index,
  isSelected,
  currConfig,
  onToggleSelect,
  onUpdateEntry,
  onDeleteEntry,
  onDuplicateEntry,
  onAddRow,
  onToggleReview,
  isLastRow
}) => {
  const cats = useMemo(() => getCategoriesByType(entry.type), [entry.type]);
  const subCategories = useMemo(() => cats[entry.mainCategory] || ['기타'], [cats, entry.mainCategory]);

  const handlePayeeChange = (newPayee: string) => {
    const updates: Partial<MoneybookEntry> = { payee: newPayee };
    if (!entry.mainCategory || entry.mainCategory === '식비' || entry.mainCategory === '기타지출') {
      const guessed = guessCategory(newPayee);
      updates.mainCategory = guessed.main;
      updates.subCategory = guessed.sub;
    }
    onUpdateEntry(entry.id, updates);
  };

  const handleMainCategoryChange = (newMain: string) => {
    const defaultSubs = cats[newMain] || ['기타'];
    onUpdateEntry(entry.id, {
      mainCategory: newMain,
      subCategory: defaultSubs[0] || '기타'
    });
  };

  return (
    <tr 
      className={`content-auto hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group ${
        isSelected ? 'bg-emerald-500/5 dark:bg-emerald-500/10' : ''
      }`}
    >
      <td className="px-3 py-2 text-center">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(entry.id)}
          className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500/20"
        />
      </td>

      {/* Baselane Review Status */}
      <td className="px-2 py-1 text-center">
        <button
          onClick={() => onToggleReview(entry.id)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
            entry.reviewed
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20'
          }`}
        >
          {entry.reviewed ? (
            <>
              <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
              <span>완료</span>
            </>
          ) : (
            <>
              <Clock className="w-2.5 h-2.5 text-amber-500" />
              <span>대기</span>
            </>
          )}
        </button>
      </td>

      <td className="px-2 py-1">
        <input
          type="date"
          value={entry.date}
          onChange={(e) => onUpdateEntry(entry.id, { date: e.target.value })}
          className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500/80 rounded px-1.5 py-1 text-slate-800 dark:text-slate-200 outline-none font-mono text-[11px]"
        />
      </td>

      <td className="px-2 py-1 text-center">
        <button
          onClick={() => {
            const nextType = entry.type === 'expense' ? 'income' : 'expense';
            const defaultCats = getCategoriesByType(nextType);
            const firstMain = Object.keys(defaultCats)[0];
            onUpdateEntry(entry.id, {
              type: nextType,
              mainCategory: firstMain,
              subCategory: defaultCats[firstMain][0] || '기타'
            });
          }}
          className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            entry.type === 'expense'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
          }`}
        >
          {entry.type === 'expense' ? '지출' : '수입'}
        </button>
      </td>

      <td className="px-2 py-1">
        <select
          value={entry.mainCategory}
          onChange={(e) => handleMainCategoryChange(e.target.value)}
          className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500/80 rounded px-1 py-1 text-slate-800 dark:text-slate-200 outline-none"
        >
          {Object.keys(cats).map(cat => (
            <option key={cat} value={cat} className="dark:bg-slate-900">{cat}</option>
          ))}
        </select>
      </td>

      <td className="px-2 py-1">
        <select
          value={entry.subCategory}
          onChange={(e) => onUpdateEntry(entry.id, { subCategory: e.target.value })}
          className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500/80 rounded px-1 py-1 text-slate-800 dark:text-slate-200 outline-none"
        >
          {subCategories.map(sub => (
            <option key={sub} value={sub} className="dark:bg-slate-900">{sub}</option>
          ))}
        </select>
      </td>

      <td className="px-2 py-1">
        <select
          value={entry.paymentMethod}
          onChange={(e) => onUpdateEntry(entry.id, { paymentMethod: e.target.value })}
          className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500/80 rounded px-1 py-1 text-slate-800 dark:text-slate-200 outline-none"
        >
          {PAYMENT_METHODS.map(method => (
            <option key={method} value={method} className="dark:bg-slate-900">{method}</option>
          ))}
        </select>
      </td>

      <td className="px-2 py-1">
        <input
          type="text"
          value={entry.payee}
          placeholder="상호명"
          onChange={(e) => handlePayeeChange(e.target.value)}
          className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500/80 rounded px-1.5 py-1 text-slate-800 dark:text-slate-200 font-medium outline-none"
        />
      </td>

      <td className="px-2 py-1 text-right">
        <input
          type="text"
          value={entry.amount !== undefined ? entry.amount : ''}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value.replace(/[^0-9.]/g, '');
            const num = val ? parseFloat(val) : 0;
            onUpdateEntry(entry.id, { amount: num });
          }}
          className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500/80 rounded px-1.5 py-1 text-right text-slate-900 dark:text-slate-100 font-bold font-mono outline-none"
        />
      </td>

      <td className="px-2 py-1">
        <input
          type="text"
          value={entry.memo}
          placeholder="메모..."
          onChange={(e) => onUpdateEntry(entry.id, { memo: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Tab' && !e.shiftKey && isLastRow) {
              onAddRow();
            }
          }}
          className="w-full bg-transparent border border-transparent hover:border-slate-200 dark:hover:border-slate-700 focus:border-emerald-500/80 rounded px-1.5 py-1 text-slate-600 dark:text-slate-400 outline-none text-[11px]"
        />
      </td>

      <td className="px-2 py-1 text-center">
        <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip content="복제" position="top">
            <button
              onClick={() => onDuplicateEntry(entry.id)}
              className="p-1 hover:text-slate-900 dark:hover:text-slate-100 rounded cursor-pointer"
            >
              <Copy className="w-3 h-3" />
            </button>
          </Tooltip>
          <Tooltip content="삭제" position="top">
            <button
              onClick={() => onDeleteEntry(entry.id)}
              className="p-1 text-slate-400 hover:text-rose-500 rounded cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </Tooltip>
        </div>
      </td>
    </tr>
  );
});

BulkTableRow.displayName = 'BulkTableRow';

export const BulkTable: React.FC<BulkTableProps> = React.memo(({
  entries,
  currentDate,
  currency,
  selectedIds,
  onSelectAll,
  onToggleSelect,
  onUpdateEntry,
  onDeleteEntry,
  onDuplicateEntry,
  onAddRow,
  onToggleReview,
  onBatchReview
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const currentMonthEntries = useMemo(() => entries.filter(e => e.date.startsWith(monthStr)), [entries, monthStr]);
  const isAllSelected = useMemo(() => currentMonthEntries.length > 0 && currentMonthEntries.every(e => selectedIds.has(e.id)), [currentMonthEntries, selectedIds]);
  const currConfig = CURRENCIES[currency] || CURRENCIES.KRW;

  return (
    <div className="flex-1 overflow-auto bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800/70 rounded-2xl mx-6 mb-6 flex flex-col shadow-2xs">
      <div className="min-w-[1020px] flex-1">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-800/60 sticky top-0 z-10 border-b border-slate-200/60 dark:border-slate-700/60 backdrop-blur">
            <tr className="text-slate-500 dark:text-slate-400 font-semibold select-none">
              <th className="w-10 px-3 py-2.5 text-center">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={(e) => onSelectAll(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600 text-emerald-600 focus:ring-emerald-500/20"
                />
              </th>
              <th className="w-16 px-2 py-2.5 text-center">검토</th>
              <th className="w-32 px-3 py-2.5">날짜</th>
              <th className="w-20 px-2 py-2.5 text-center">구분</th>
              <th className="w-28 px-2 py-2.5">대분류</th>
              <th className="w-28 px-2 py-2.5">소분류</th>
              <th className="w-28 px-2 py-2.5">결제수단</th>
              <th className="w-48 px-3 py-2.5">사용처 (상호명)</th>
              <th className="w-36 px-3 py-2.5 text-right">금액 ({currConfig.symbol})</th>
              <th className="px-3 py-2.5">메모</th>
              <th className="w-16 px-2 py-2.5 text-center">관리</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
            {currentMonthEntries.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-20 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      {month}월에 작성된 항목이 없습니다.
                    </p>
                    <button
                      onClick={onAddRow}
                      className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      새 항목 추가
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              currentMonthEntries.map((entry, index) => (
                <BulkTableRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  isSelected={selectedIds.has(entry.id)}
                  currConfig={currConfig}
                  onToggleSelect={onToggleSelect}
                  onUpdateEntry={onUpdateEntry}
                  onDeleteEntry={onDeleteEntry}
                  onDuplicateEntry={onDuplicateEntry}
                  onAddRow={onAddRow}
                  onToggleReview={onToggleReview}
                  isLastRow={index === currentMonthEntries.length - 1}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800/60 p-2.5 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 font-mono text-[11px]">
            선택된 항목: <b>{selectedIds.size}</b>개 / 이번 달 전체: <b>{currentMonthEntries.length}</b>개
          </span>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-700 pl-3">
              <button
                onClick={() => onBatchReview(Array.from(selectedIds), true)}
                className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25 font-semibold rounded-lg text-xs transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>검토 완료 ({selectedIds.size}개)</span>
              </button>
              <button
                onClick={() => onBatchReview(Array.from(selectedIds), false)}
                className="flex items-center gap-1 px-2.5 py-1 text-slate-500 hover:text-slate-800 dark:text-slate-400 hover:bg-black/5 dark:hover:bg-white/5 font-medium rounded-lg text-xs transition-colors cursor-pointer"
              >
                <span>검토 취소</span>
              </button>
            </div>
          )}
        </div>
        <button
          onClick={onAddRow}
          className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>항목 추가 (⌘N)</span>
        </button>
      </div>
    </div>
  );
});

BulkTable.displayName = 'BulkTable';
