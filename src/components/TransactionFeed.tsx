import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Trash2, 
  Copy, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Coffee, 
  ShoppingBag, 
  Utensils, 
  Home, 
  Car, 
  Tv, 
  HeartPulse, 
  GraduationCap, 
  Gift, 
  Coins, 
  CreditCard,
  Inbox
} from 'lucide-react';
import { MoneybookEntry } from '../types/moneybook';
import { CATEGORY_COLORS } from '../utils/categories';
import { CurrencyCode, formatCurrency } from '../utils/currency';
import { Tooltip } from './Tooltip';

interface TransactionFeedProps {
  entries: MoneybookEntry[];
  currentDate: Date;
  currency: CurrencyCode;
  onDeleteEntry: (id: string) => void;
  onDuplicateEntry: (id: string) => void;
  onUpdateEntry: (id: string, updates: Partial<MoneybookEntry>) => void;
  onToggleReview: (id: string) => void;
}

function getCategoryIcon(cat: string) {
  switch (cat) {
    case '식비': return <Utensils className="w-4 h-4" />;
    case '생활/마트': return <ShoppingBag className="w-4 h-4" />;
    case '주거/통신': return <Home className="w-4 h-4" />;
    case '교통/차량': return <Car className="w-4 h-4" />;
    case '쇼핑/패션': return <ShoppingBag className="w-4 h-4" />;
    case '문화/여가': return <Tv className="w-4 h-4" />;
    case '의료/건강': return <HeartPulse className="w-4 h-4" />;
    case '교육/학습': return <GraduationCap className="w-4 h-4" />;
    case '경조/선물': return <Gift className="w-4 h-4" />;
    case '금융/보험': return <Coins className="w-4 h-4" />;
    default: return <Coffee className="w-4 h-4" />;
  }
}

function formatDateHeader(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isToday = today.getFullYear() === year && today.getMonth() + 1 === month && today.getDate() === day;
  const isYesterday = yesterday.getFullYear() === year && yesterday.getMonth() + 1 === month && yesterday.getDate() === day;

  const dayOfWeekNames = ['일', '월', '화', '수', '목', '금', '토'];
  const dayName = dayOfWeekNames[targetDate.getDay()];

  if (isToday) return `오늘 • ${month}월 ${day}일 (${dayName})`;
  if (isYesterday) return `어제 • ${month}월 ${day}일 (${dayName})`;
  return `${month}월 ${day}일 (${dayName})`;
}

export const TransactionFeed: React.FC<TransactionFeedProps> = React.memo(({
  entries,
  currentDate,
  currency,
  onDeleteEntry,
  onDuplicateEntry,
  onUpdateEntry,
  onToggleReview
}) => {
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [reviewFilter, setReviewFilter] = useState<'ALL' | 'UNREVIEWED' | 'REVIEWED'>('ALL');

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const unreviewedTotal = useMemo(() => {
    return entries.filter(e => e.date.startsWith(monthStr) && !e.reviewed).length;
  }, [entries, monthStr]);

  const reviewedTotal = useMemo(() => {
    return entries.filter(e => e.date.startsWith(monthStr) && e.reviewed).length;
  }, [entries, monthStr]);

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      if (!e.date.startsWith(monthStr)) return false;
      if (search && !e.payee.toLowerCase().includes(search.toLowerCase()) && !e.memo.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCat !== 'ALL' && e.mainCategory !== selectedCat) return false;
      if (reviewFilter === 'UNREVIEWED' && e.reviewed) return false;
      if (reviewFilter === 'REVIEWED' && !e.reviewed) return false;
      return true;
    });
  }, [entries, monthStr, search, selectedCat, reviewFilter]);

  const grouped = useMemo(() => {
    const groups: Record<string, MoneybookEntry[]> = {};
    const sorted = [...filteredEntries].sort((a, b) => b.date.localeCompare(a.date));
    sorted.forEach(entry => {
      if (!groups[entry.date]) groups[entry.date] = [];
      groups[entry.date].push(entry);
    });
    return groups;
  }, [filteredEntries]);

  const uniqueCats = useMemo(() => {
    const set = new Set<string>();
    entries.forEach(e => {
      if (e.date.startsWith(monthStr)) set.add(e.mainCategory);
    });
    return Array.from(set);
  }, [entries, monthStr]);

  const datesList = Object.keys(grouped);

  return (
    <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 py-3 border-b border-black/[0.04] dark:border-white/[0.05]">
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <div className="relative w-full sm:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="상호명, 메모 검색..."
              className="w-full bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.02] dark:border-white/[0.04] rounded-full pl-8 pr-3 py-1 text-[11px] text-neutral-800 dark:text-neutral-200 outline-none focus:bg-white dark:focus:bg-[#2C2C2E] transition-all placeholder:text-neutral-400"
            />
          </div>

          {/* Baselane Review Status Filters */}
          <div className="flex items-center gap-1 bg-black/[0.03] dark:bg-white/[0.05] p-0.5 rounded-full shrink-0">
            <button
              onClick={() => setReviewFilter('ALL')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                reviewFilter === 'ALL'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setReviewFilter('UNREVIEWED')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                reviewFilter === 'UNREVIEWED'
                  ? 'bg-amber-500 text-white shadow-xs font-semibold'
                  : 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Clock className="w-3 h-3" />
              <span>검토 필요</span>
              {unreviewedTotal > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  reviewFilter === 'UNREVIEWED' ? 'bg-white/30 text-white' : 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                }`}>
                  {unreviewedTotal}
                </span>
              )}
            </button>
            <button
              onClick={() => setReviewFilter('REVIEWED')}
              className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                reviewFilter === 'REVIEWED'
                  ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                  : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10'
              }`}
            >
              <CheckCircle2 className="w-3 h-3" />
              <span>검토 완료</span>
              {reviewedTotal > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  reviewFilter === 'REVIEWED' ? 'bg-white/30 text-white' : 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300'
                }`}>
                  {reviewedTotal}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0">
          <button
            onClick={() => setSelectedCat('ALL')}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              selectedCat === 'ALL'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 bg-black/[0.03] dark:bg-white/[0.05]'
            }`}
          >
            전체
          </button>
          {uniqueCats.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                selectedCat === cat
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200 bg-black/[0.03] dark:bg-white/[0.05]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Pure Distraction-free Feed */}
      <div className="flex-1 overflow-y-auto pt-4 space-y-6 pr-1">
        {datesList.length === 0 ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 rounded-2xl bg-black/[0.03] dark:bg-white/[0.05] flex items-center justify-center text-neutral-400 mx-auto mb-3">
              <Inbox className="w-5 h-5" />
            </div>
            <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">기록된 내역이 없습니다</p>
            <p className="text-xs text-neutral-400 mt-1">상단의 빠른 입력창으로 지출을 추가하거나 네이버에서 불러와보세요.</p>
          </div>
        ) : (
          datesList.map((date) => {
            const items = grouped[date];
            const dayExpense = items
              .filter(i => i.type === 'expense')
              .reduce((s, i) => s + i.amount, 0);

            return (
              <div key={date} className="space-y-2">
                <div className="flex items-center justify-between text-xs px-2 select-none sticky top-0 bg-[#F5F5F7]/90 dark:bg-[#0A0A0C]/90 backdrop-blur py-1 z-10">
                  <span className="font-semibold text-neutral-500 dark:text-neutral-400 text-[11px] tracking-tight">
                    {formatDateHeader(date)}
                  </span>
                  <span className="text-[11px] font-medium text-neutral-400 tabular-nums">
                    {dayExpense > 0 ? `${formatCurrency(dayExpense, currency)}` : ''}
                  </span>
                </div>

                <div className="glass-panel rounded-2xl divide-y divide-black/[0.03] dark:divide-white/[0.04] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
                  {items.map(item => {
                    const color = CATEGORY_COLORS[item.mainCategory] || {
                      hex: '#8E8E93',
                      symbolBg: 'bg-neutral-500'
                    };

                    const itemCurr = item.currency || currency;

                    return (
                      <div
                        key={item.id}
                        className="content-auto px-4 py-3 flex items-center justify-between hover:bg-black/[0.02] dark:hover:bg-white/[0.03] transition-colors group"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white shrink-0 shadow-xs"
                            style={{ backgroundColor: color.hex }}
                          >
                            {getCategoryIcon(item.mainCategory)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[13px] font-semibold text-neutral-900 dark:text-neutral-100 tracking-tight truncate">
                                {item.payee}
                              </span>
                              {item.memo && (
                                <span className="text-[11px] text-neutral-400 truncate max-w-[200px]">
                                  • {item.memo}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-neutral-400">
                              <span>{item.mainCategory} &gt; {item.subCategory}</span>
                              <span>•</span>
                              <span className="flex items-center gap-0.5 text-neutral-500">
                                <CreditCard className="w-2.5 h-2.5" />
                                {item.paymentMethod}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Baselane Review Status Toggle Pill */}
                          <Tooltip
                            content={item.reviewed ? "검토 완료 (클릭 시 미검토로 변경)" : "미검토 내역 (클릭하여 검토 완료 마크)"}
                            position="top"
                          >
                            <button
                              onClick={() => onToggleReview(item.id)}
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium transition-all cursor-pointer ${
                                item.reviewed
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
                                  : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 border border-amber-500/25'
                              }`}
                            >
                              {item.reviewed ? (
                                <>
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                                  <span>검토됨</span>
                                </>
                              ) : (
                                <>
                                  <Clock className="w-2.5 h-2.5 text-amber-500" />
                                  <span className="font-semibold">검토 필요</span>
                                </>
                              )}
                            </button>
                          </Tooltip>

                          <div className="text-right">
                            <span className={`text-[13px] font-semibold tabular-nums tracking-tight ${
                              item.type === 'expense'
                                ? 'text-neutral-900 dark:text-neutral-100'
                                : 'text-[#34C759]'
                            }`}>
                              {item.type === 'expense' ? '-' : '+'}{formatCurrency(item.amount, itemCurr)}
                            </span>
                          </div>

                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip content="복제" position="top">
                              <button
                                onClick={() => onDuplicateEntry(item.id)}
                                className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-full hover:bg-black/[0.04] transition-colors cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            </Tooltip>
                            <Tooltip content="삭제" position="top">
                              <button
                                onClick={() => onDeleteEntry(item.id)}
                                className="p-1 text-neutral-400 hover:text-[#FF3B30] rounded-full hover:bg-[#FF3B30]/10 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
});
