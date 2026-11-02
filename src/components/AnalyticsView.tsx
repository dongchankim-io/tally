import React, { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Tag, 
  TrendingUp, 
  TrendingDown, 
  ArrowUpRight, 
  ArrowDownRight, 
  Sparkles, 
  Scale, 
  Wallet,
  ArrowRight,
  Minus,
  CheckCircle2
} from 'lucide-react';
import { MoneybookEntry, EntryType } from '../types/moneybook';
import { CATEGORY_COLORS } from '../utils/categories';
import { CurrencyCode, formatCurrency, CURRENCIES } from '../utils/currency';
import { NeonSplineChart } from './NeonSplineChart';
import { Tooltip } from './Tooltip';

interface AnalyticsViewProps {
  entries: MoneybookEntry[];
  currentDate: Date;
  currency: CurrencyCode;
}

type FilterMode = 'all' | 'more' | 'less';
type SortMode = 'diff-desc' | 'amount-desc' | 'percent-desc' | 'name';

interface CategoryComparisonItem {
  category: string;
  currentAmount: number;
  currentCount: number;
  prevAmount: number;
  prevCount: number;
  diff: number;
  percentDiff: number;
  status: 'increased' | 'decreased' | 'new' | 'zeroed' | 'same';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = React.memo(({ entries, currentDate, currency }) => {
  const [activeTab, setActiveTab] = useState<EntryType>('expense');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [sortMode, setSortMode] = useState<SortMode>('diff-desc');

  const currConfig = CURRENCIES[currency] || CURRENCIES.KRW;

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  // Month entries
  const currentEntries = useMemo(() => entries.filter(e => e.date.startsWith(currentMonthStr)), [entries, currentMonthStr]);
  const prevEntries = useMemo(() => entries.filter(e => e.date.startsWith(prevMonthStr)), [entries, prevMonthStr]);

  // Totals
  const currentExpense = useMemo(() => currentEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0), [currentEntries]);
  const prevExpense = useMemo(() => prevEntries.filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0), [prevEntries]);
  const expenseDiff = currentExpense - prevExpense;
  const expensePercentDiff = prevExpense > 0 ? (expenseDiff / prevExpense) * 100 : 0;

  const currentIncome = useMemo(() => currentEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0), [currentEntries]);
  const prevIncome = useMemo(() => prevEntries.filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0), [prevEntries]);
  const incomeDiff = currentIncome - prevIncome;
  const incomePercentDiff = prevIncome > 0 ? (incomeDiff / prevIncome) * 100 : 0;

  const currentNet = currentIncome - currentExpense;
  const prevNet = prevIncome - prevExpense;
  const netDiff = currentNet - prevNet;

  // Build Category Comparison List for given type
  const categoryComparisonList = useMemo(() => {
    const curFiltered = currentEntries.filter(e => e.type === activeTab);
    const prevFiltered = prevEntries.filter(e => e.type === activeTab);

    const map: Record<string, { curAmt: number; curCnt: number; prevAmt: number; prevCnt: number }> = {};

    curFiltered.forEach(e => {
      if (!map[e.mainCategory]) map[e.mainCategory] = { curAmt: 0, curCnt: 0, prevAmt: 0, prevCnt: 0 };
      map[e.mainCategory].curAmt += e.amount;
      map[e.mainCategory].curCnt += 1;
    });

    prevFiltered.forEach(e => {
      if (!map[e.mainCategory]) map[e.mainCategory] = { curAmt: 0, curCnt: 0, prevAmt: 0, prevCnt: 0 };
      map[e.mainCategory].prevAmt += e.amount;
      map[e.mainCategory].prevCnt += 1;
    });

    const items: CategoryComparisonItem[] = Object.entries(map).map(([category, data]) => {
      const diff = data.curAmt - data.prevAmt;
      const percentDiff = data.prevAmt > 0 ? (diff / data.prevAmt) * 100 : 0;
      
      let status: CategoryComparisonItem['status'] = 'same';
      if (data.prevAmt === 0 && data.curAmt > 0) status = 'new';
      else if (data.prevAmt > 0 && data.curAmt === 0) status = 'zeroed';
      else if (diff > 0) status = 'increased';
      else if (diff < 0) status = 'decreased';

      return {
        category,
        currentAmount: data.curAmt,
        currentCount: data.curCnt,
        prevAmount: data.prevAmt,
        prevCount: data.prevCnt,
        diff,
        percentDiff,
        status
      };
    });

    return items;
  }, [currentEntries, prevEntries, activeTab]);

  // Filtered & Sorted items
  const displayedItems = useMemo(() => {
    let list = [...categoryComparisonList];

    // Filter
    if (filterMode === 'more') {
      list = list.filter(item => item.diff > 0);
    } else if (filterMode === 'less') {
      list = list.filter(item => item.diff < 0);
    }

    // Sort
    list.sort((a, b) => {
      if (sortMode === 'diff-desc') {
        return Math.abs(b.diff) - Math.abs(a.diff);
      }
      if (sortMode === 'amount-desc') {
        return b.currentAmount - a.currentAmount;
      }
      if (sortMode === 'percent-desc') {
        return Math.abs(b.percentDiff) - Math.abs(a.percentDiff);
      }
      if (sortMode === 'name') {
        return a.category.localeCompare(b.category);
      }
      return 0;
    });

    return list;
  }, [categoryComparisonList, filterMode, sortMode]);

  // Max value for dual bar scaling
  const maxComparisonVal = useMemo(() => {
    if (categoryComparisonList.length === 0) return 1;
    return Math.max(...categoryComparisonList.map(item => Math.max(item.currentAmount, item.prevAmount)), 1);
  }, [categoryComparisonList]);

  // Top Insights
  const topSpentMore = useMemo(() => {
    const expenses = currentEntries.filter(e => e.type === 'expense');
    const prevEx = prevEntries.filter(e => e.type === 'expense');
    const map: Record<string, number> = {};
    expenses.forEach(e => map[e.mainCategory] = (map[e.mainCategory] || 0) + e.amount);
    prevEx.forEach(e => map[e.mainCategory] = (map[e.mainCategory] || 0) - e.amount);
    const sorted = Object.entries(map).filter(([, diff]) => diff > 0).sort(([, a], [, b]) => b - a);
    return sorted.length > 0 ? { cat: sorted[0][0], diff: sorted[0][1] } : null;
  }, [currentEntries, prevEntries]);

  const topSaved = useMemo(() => {
    const expenses = currentEntries.filter(e => e.type === 'expense');
    const prevEx = prevEntries.filter(e => e.type === 'expense');
    const map: Record<string, number> = {};
    prevEx.forEach(e => map[e.mainCategory] = (map[e.mainCategory] || 0) + e.amount);
    expenses.forEach(e => map[e.mainCategory] = (map[e.mainCategory] || 0) - e.amount);
    const sorted = Object.entries(map).filter(([, saved]) => saved > 0).sort(([, a], [, b]) => b - a);
    return sorted.length > 0 ? { cat: sorted[0][0], saved: sorted[0][1] } : null;
  }, [currentEntries, prevEntries]);

  // Standard category breakdown for current month (bottom section)
  const currentCategoryMap: Record<string, { total: number; count: number }> = {};
  currentEntries.filter(e => e.type === 'expense').forEach(e => {
    if (!currentCategoryMap[e.mainCategory]) currentCategoryMap[e.mainCategory] = { total: 0, count: 0 };
    currentCategoryMap[e.mainCategory].total += e.amount;
    currentCategoryMap[e.mainCategory].count += 1;
  });
  const sortedCurrentCategories = Object.entries(currentCategoryMap).sort(([, a], [, b]) => b.total - a.total);

  // Standard payment methods breakdown
  const paymentMap: Record<string, number> = {};
  currentEntries.filter(e => e.type === 'expense').forEach(e => {
    paymentMap[e.paymentMethod] = (paymentMap[e.paymentMethod] || 0) + e.amount;
  });
  const sortedPayments = Object.entries(paymentMap).sort(([, a], [, b]) => b - a);

  const moreCount = categoryComparisonList.filter(i => i.diff > 0).length;
  const lessCount = categoryComparisonList.filter(i => i.diff < 0).length;

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1">
        <div>
          <h2 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
            <span>지난달 대비 증감 분석</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-black/[0.04] dark:bg-white/[0.08] text-neutral-500">
              MoM Analytics
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            <b>{year}년 {month}월</b>과 지난달(<b>{prevYear}년 {prevMonth}월</b>)의 수입 및 지출 변화를 대조합니다.
          </p>
        </div>

        {/* Top Insights Pills */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {topSpentMore && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FF3B30]/10 text-[#FF3B30] font-medium border border-[#FF3B30]/15">
              <TrendingUp className="w-3 h-3" />
              <span>가장 많이 증가: <b>{topSpentMore.cat}</b> (+{formatCurrency(topSpentMore.diff, currency)})</span>
            </div>
          )}
          {topSaved && (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#34C759]/10 text-[#34C759] font-medium border border-[#34C759]/15">
              <TrendingDown className="w-3 h-3" />
              <span>가장 많이 절약: <b>{topSaved.cat}</b> (-{formatCurrency(topSaved.saved, currency)})</span>
            </div>
          )}
        </div>
      </div>

      {/* 3 Top Summary MoM Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Total Expense MoM Card */}
        <div className="glass-panel rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5">
            <span className="font-medium uppercase tracking-wider text-[11px]">월간 총 지출</span>
            <span className="text-[10px] font-mono">지난달 {formatCurrency(prevExpense, currency)}</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50 tabular-nums">
              {formatCurrency(currentExpense, currency)}
            </span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">전월 대비 변화</span>
            {expenseDiff > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[#FF3B30] bg-[#FF3B30]/10 px-2 py-0.5 rounded-full text-[11px]">
                <TrendingUp className="w-3 h-3" />
                <span>+{formatCurrency(expenseDiff, currency)} (+{expensePercentDiff.toFixed(1)}%) 더 씀</span>
              </span>
            ) : expenseDiff < 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full text-[11px]">
                <TrendingDown className="w-3 h-3" />
                <span>-{formatCurrency(Math.abs(expenseDiff), currency)} (-{Math.abs(expensePercentDiff).toFixed(1)}%) 절약</span>
              </span>
            ) : (
              <span className="text-neutral-400 font-medium text-[11px]">변동 없음</span>
            )}
          </div>
        </div>

        {/* Total Income MoM Card */}
        <div className="glass-panel rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5">
            <span className="font-medium uppercase tracking-wider text-[11px]">월간 총 수입</span>
            <span className="text-[10px] font-mono">지난달 {formatCurrency(prevIncome, currency)}</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold tracking-tight text-[#34C759] tabular-nums">
              {formatCurrency(currentIncome, currency)}
            </span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">전월 대비 변화</span>
            {incomeDiff > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[#34C759] bg-[#34C759]/10 px-2 py-0.5 rounded-full text-[11px]">
                <TrendingUp className="w-3 h-3" />
                <span>+{formatCurrency(incomeDiff, currency)} (+{incomePercentDiff.toFixed(1)}%) 증가</span>
              </span>
            ) : incomeDiff < 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[#FF9500] bg-[#FF9500]/10 px-2 py-0.5 rounded-full text-[11px]">
                <TrendingDown className="w-3 h-3" />
                <span>-{formatCurrency(Math.abs(incomeDiff), currency)} (-{Math.abs(incomePercentDiff).toFixed(1)}%) 감소</span>
              </span>
            ) : (
              <span className="text-neutral-400 font-medium text-[11px]">변동 없음</span>
            )}
          </div>
        </div>

        {/* Net Savings/Balance MoM Card */}
        <div className="glass-panel rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)]">
          <div className="flex items-center justify-between text-neutral-400 text-xs mb-1.5">
            <span className="font-medium uppercase tracking-wider text-[11px]">순 잔여 (수입 - 지출)</span>
            <span className="text-[10px] font-mono">지난달 {formatCurrency(prevNet, currency)}</span>
          </div>

          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-bold tracking-tight tabular-nums ${currentNet >= 0 ? 'text-neutral-900 dark:text-neutral-50' : 'text-[#FF3B30]'}`}>
              {formatCurrency(currentNet, currency)}
            </span>
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-black/[0.04] dark:border-white/[0.06] flex items-center justify-between text-xs">
            <span className="text-neutral-400 text-[11px]">재정 수지 개선</span>
            {netDiff > 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-[#007AFF] bg-[#007AFF]/10 px-2 py-0.5 rounded-full text-[11px]">
                <span>▲</span>
                <span>+{formatCurrency(netDiff, currency)} 흑자 개선</span>
              </span>
            ) : netDiff < 0 ? (
              <span className="inline-flex items-center gap-1 font-semibold text-neutral-500 bg-black/[0.04] dark:bg-white/[0.06] px-2 py-0.5 rounded-full text-[11px]">
                <span>▼</span>
                <span>-{formatCurrency(Math.abs(netDiff), currency)}</span>
              </span>
            ) : (
              <span className="text-neutral-400 font-medium text-[11px]">변동 없음</span>
            )}
          </div>
        </div>
      </div>

      {/* Neon Spline Chart: Daily Cumulative Pace Curve */}
      <NeonSplineChart
        entries={entries}
        currentDate={currentDate}
        currency={currency}
      />

      {/* Main Section: Category-by-Category MoM Comparison */}
      <div className="glass-panel rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)] space-y-5">
        {/* Controls: Type tabs, Filter chips, and Sorting */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
          {/* Tab Selector: 지출 비교 vs 수익 비교 */}
          <div className="flex items-center gap-1 bg-black/[0.04] dark:bg-white/[0.06] p-1 rounded-2xl w-fit">
            <button
              onClick={() => setActiveTab('expense')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'expense'
                  ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
            >
              <ArrowDownRight className="w-3.5 h-3.5 text-[#FF3B30]" />
              <span>지출 항목별 비교</span>
            </button>
            <button
              onClick={() => setActiveTab('income')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                activeTab === 'income'
                  ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]'
                  : 'text-neutral-500 hover:text-neutral-800 dark:text-neutral-400'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5 text-[#34C759]" />
              <span>수익 항목별 비교</span>
            </button>
          </div>

          {/* Filter & Sort Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center bg-black/[0.03] dark:bg-white/[0.05] p-0.5 rounded-xl border border-black/[0.03] dark:border-white/[0.04] text-[11px]">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filterMode === 'all'
                    ? 'bg-white dark:bg-[#2C2C2E] text-neutral-900 dark:text-neutral-100 shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                전체 ({categoryComparisonList.length})
              </button>
              <button
                onClick={() => setFilterMode('more')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filterMode === 'more'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#FF3B30] shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                {activeTab === 'expense' ? `더 씀 (${moreCount})` : `증가 (${moreCount})`}
              </button>
              <button
                onClick={() => setFilterMode('less')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                  filterMode === 'less'
                    ? 'bg-white dark:bg-[#2C2C2E] text-[#34C759] shadow-sm font-semibold'
                    : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
              >
                {activeTab === 'expense' ? `덜 씀 / 절약 (${lessCount})` : `감소 (${lessCount})`}
              </button>
            </div>

            {/* Sort Dropdown */}
            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as SortMode)}
              className="bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.03] dark:border-white/[0.04] rounded-xl px-2.5 py-1 text-[11px] text-neutral-700 dark:text-neutral-300 outline-none cursor-pointer"
            >
              <option value="diff-desc">증감액 큰 순</option>
              <option value="amount-desc">이번 달 금액 높은 순</option>
              <option value="percent-desc">증감률(%) 순</option>
              <option value="name">카테고리명 순</option>
            </select>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 select-none px-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded-full bg-neutral-300 dark:bg-neutral-600 inline-block" />
              <span>지난달 ({prevMonth}월)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-1.5 rounded-full bg-[#007AFF] inline-block" />
              <span>이번달 ({month}월)</span>
            </span>
          </div>
          <span>총 {displayedItems.length}개 항목</span>
        </div>

        {/* Category MoM Comparison Cards List */}
        {displayedItems.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            비교할 항목이 없습니다.
          </div>
        ) : (
          <div className="space-y-3">
            {displayedItems.map((item) => {
              const color = CATEGORY_COLORS[item.category] || { hex: '#8E8E93', bg: 'bg-neutral-500/10', text: 'text-neutral-500' };
              const prevBarPercent = maxComparisonVal > 0 ? (item.prevAmount / maxComparisonVal) * 100 : 0;
              const curBarPercent = maxComparisonVal > 0 ? (item.currentAmount / maxComparisonVal) * 100 : 0;

              return (
                <div
                  key={item.category}
                  className="p-3.5 rounded-2xl bg-black/[0.015] dark:bg-white/[0.02] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] border border-black/[0.03] dark:border-white/[0.04] transition-all space-y-2.5"
                >
                  {/* Top Line: Category info & Comparison Badges */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    {/* Left: Icon & Category Name */}
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
                        style={{ backgroundColor: color.hex + '1A', color: color.hex }}
                      >
                        <Tag className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            {item.currentCount > 0 ? `이번달 ${item.currentCount}건` : '이번달 0건'}
                            {item.prevCount > 0 ? ` · 지난달 ${item.prevCount}건` : ''}
                          </span>
                        </div>
                        {/* Subline amount progression */}
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 mt-0.5">
                          <span>지난달 {formatCurrency(item.prevAmount, currency)}</span>
                          <ArrowRight className="w-2.5 h-2.5 opacity-60" />
                          <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                            이번달 {formatCurrency(item.currentAmount, currency)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Clear intuitive Status Badge */}
                    <div className="flex items-center gap-2">
                      {activeTab === 'expense' ? (
                        <>
                          {item.status === 'increased' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF3B30] bg-[#FF3B30]/10 border border-[#FF3B30]/15 px-2.5 py-1 rounded-full shadow-sm">
                              <span>▲</span>
                              <span>+{formatCurrency(item.diff, currency)} (+{item.percentDiff.toFixed(1)}%) 더 씀</span>
                            </span>
                          )}
                          {item.status === 'decreased' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/15 px-2.5 py-1 rounded-full shadow-sm">
                              <span>▼</span>
                              <span>-{formatCurrency(Math.abs(item.diff), currency)} (-{Math.abs(item.percentDiff).toFixed(1)}%) 절약</span>
                            </span>
                          )}
                          {item.status === 'new' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#AF52DE] bg-[#AF52DE]/10 border border-[#AF52DE]/15 px-2.5 py-1 rounded-full shadow-sm">
                              <Sparkles className="w-3 h-3" />
                              <span>+{formatCurrency(item.currentAmount, currency)} 신규 지출</span>
                            </span>
                          )}
                          {item.status === 'zeroed' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#007AFF] bg-[#007AFF]/10 border border-[#007AFF]/15 px-2.5 py-1 rounded-full shadow-sm">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>-{formatCurrency(item.prevAmount, currency)} 이번달 무지출</span>
                            </span>
                          )}
                          {item.status === 'same' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-full">
                              <Minus className="w-3 h-3" />
                              <span>변동 없음</span>
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          {item.status === 'increased' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/15 px-2.5 py-1 rounded-full shadow-sm">
                              <span>▲</span>
                              <span>+{formatCurrency(item.diff, currency)} (+{item.percentDiff.toFixed(1)}%) 수익 증가</span>
                            </span>
                          )}
                          {item.status === 'decreased' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#FF9500] bg-[#FF9500]/10 border border-[#FF9500]/15 px-2.5 py-1 rounded-full shadow-sm">
                              <span>▼</span>
                              <span>-{formatCurrency(Math.abs(item.diff), currency)} (-{Math.abs(item.percentDiff).toFixed(1)}%) 수익 감소</span>
                            </span>
                          )}
                          {item.status === 'new' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34C759] bg-[#34C759]/10 border border-[#34C759]/15 px-2.5 py-1 rounded-full shadow-sm">
                              <Sparkles className="w-3 h-3" />
                              <span>신규 수입 (+{formatCurrency(item.currentAmount, currency)})</span>
                            </span>
                          )}
                          {item.status === 'zeroed' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-full">
                              <span>이번달 미입금</span>
                            </span>
                          )}
                          {item.status === 'same' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-1 rounded-full">
                              <span>수입 동일</span>
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Dual Comparison Visual Bar */}
                  <div className="space-y-1 pt-1">
                    {/* Previous Month Bar (Dashed / Subdued) */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-12 text-neutral-400 font-mono text-right shrink-0">{prevMonth}월</span>
                      <div className="flex-1 bg-black/[0.03] dark:bg-white/[0.04] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-neutral-300 dark:bg-neutral-600 transition-all duration-500"
                          style={{ width: `${prevBarPercent}%` }}
                        />
                      </div>
                      <span className="w-16 font-mono text-neutral-400 text-right shrink-0">
                        {formatCurrency(item.prevAmount, currency)}
                      </span>
                    </div>

                    {/* Current Month Bar (Solid Color) */}
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="w-12 font-semibold text-neutral-700 dark:text-neutral-300 font-mono text-right shrink-0">{month}월</span>
                      <div className="flex-1 bg-black/[0.03] dark:bg-white/[0.04] h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${curBarPercent}%`,
                            backgroundColor: color.hex
                          }}
                        />
                      </div>
                      <span className="w-16 font-mono font-semibold text-neutral-900 dark:text-neutral-100 text-right shrink-0">
                        {formatCurrency(item.currentAmount, currency)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom Row: Category Share & Payment Methods Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
        {/* Category Breakdown Card */}
        <div className="glass-panel rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-4 text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">
            <Tag className="w-3.5 h-3.5 text-[#34C759]" />
            <span>{month}월 카테고리별 지출 분포</span>
          </div>

          {sortedCurrentCategories.length === 0 ? (
            <p className="text-xs text-neutral-400 py-8 text-center">지출 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3.5">
              {sortedCurrentCategories.map(([cat, data]) => {
                const percent = currentExpense > 0 ? (data.total / currentExpense) * 100 : 0;
                const color = CATEGORY_COLORS[cat] || { hex: '#8E8E93' };

                return (
                  <div key={cat} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">{cat}</span>
                        <span className="text-[10px] text-neutral-400">({data.count}건)</span>
                      </div>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(data.total, currency)}
                        </span>
                        <span className="text-[11px] text-neutral-400 w-10 text-right">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: color.hex
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Payment Method Breakdown Card */}
        <div className="glass-panel rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)]">
          <div className="flex items-center gap-2 mb-4 text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">
            <CreditCard className="w-3.5 h-3.5 text-[#5856D6]" />
            <span>{month}월 결제 수단별 비중</span>
          </div>

          {sortedPayments.length === 0 ? (
            <p className="text-xs text-neutral-400 py-8 text-center">결제 내역이 없습니다.</p>
          ) : (
            <div className="space-y-3.5">
              {sortedPayments.map(([method, amount]) => {
                const percent = currentExpense > 0 ? (amount / currentExpense) * 100 : 0;

                return (
                  <div key={method} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-neutral-800 dark:text-neutral-200">{method}</span>
                      <div className="flex items-center gap-2 tabular-nums">
                        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
                          {formatCurrency(amount, currency)}
                        </span>
                        <span className="text-[11px] text-neutral-400 w-10 text-right">
                          {percent.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-black/[0.04] dark:bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-[#5856D6] h-full rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
