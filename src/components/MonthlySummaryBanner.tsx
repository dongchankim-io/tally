import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { MoneybookEntry } from '../types/moneybook';
import { CATEGORY_COLORS } from '../utils/categories';
import { CurrencyCode, formatCurrency, CURRENCIES } from '../utils/currency';
import { Tooltip } from './Tooltip';

interface MonthlySummaryBannerProps {
  entries: MoneybookEntry[];
  currentDate: Date;
  currency: CurrencyCode;
}

export const MonthlySummaryBanner: React.FC<MonthlySummaryBannerProps> = React.memo(({
  entries,
  currentDate,
  currency
}) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const monthStr = `${year}-${String(month).padStart(2, '0')}`;

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  const monthEntries = entries.filter(e => e.date.startsWith(monthStr));
  const prevMonthEntries = entries.filter(e => e.date.startsWith(prevMonthStr));

  const totalExpense = monthEntries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const prevTotalExpense = prevMonthEntries
    .filter(e => e.type === 'expense')
    .reduce((sum, e) => sum + e.amount, 0);

  const totalIncome = monthEntries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const prevTotalIncome = prevMonthEntries
    .filter(e => e.type === 'income')
    .reduce((sum, e) => sum + e.amount, 0);

  const expenseDiff = totalExpense - prevTotalExpense;
  const expenseDiffPercent = prevTotalExpense > 0 ? (expenseDiff / prevTotalExpense) * 100 : 0;

  // Category ranking
  const catTotals: Record<string, number> = {};
  monthEntries.filter(e => e.type === 'expense').forEach(e => {
    catTotals[e.mainCategory] = (catTotals[e.mainCategory] || 0) + e.amount;
  });

  const sortedCats = Object.entries(catTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const daysPassed = isCurrentMonth ? today.getDate() : 30;
  const dailyAverage = daysPassed > 0 ? (totalExpense / daysPassed) : 0;
  const currConfig = CURRENCIES[currency] || CURRENCIES.KRW;

  // Baselane-style Reconciliation Stats
  const totalCount = monthEntries.length;
  const reviewedCount = monthEntries.filter(e => e.reviewed).length;
  const unreviewedCount = totalCount - reviewedCount;
  const reviewPercent = totalCount > 0 ? Math.round((reviewedCount / totalCount) * 100) : 100;

  return (
    <div className="px-6 pt-5 pb-2">
      <div className="glass-panel rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_32px_rgba(0,0,0,0.2)]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Large Expense Block */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-black/[0.04] dark:border-white/[0.06] pb-4 md:pb-0 md:pr-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                {month}월 총 지출 ({currency})
              </span>
              <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                일평균 {formatCurrency(dailyAverage, currency)}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-semibold text-neutral-400 dark:text-neutral-500">
                {currConfig.symbol}
              </span>
              <span className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-neutral-900 dark:text-neutral-50 tabular-nums">
                {totalExpense.toLocaleString(undefined, {
                  minimumFractionDigits: currConfig.decimals,
                  maximumFractionDigits: currConfig.decimals
                })}
              </span>
            </div>

            {/* MoM Comparison Pill */}
            {prevTotalExpense > 0 && (
              <div className="mt-2 flex items-center gap-1.5">
                {expenseDiff > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF3B30] bg-[#FF3B30]/10 px-2.5 py-0.5 rounded-full">
                    <span>▲</span>
                    <span>지난달 대비 +{formatCurrency(expenseDiff, currency)} ({expenseDiffPercent > 0 ? `+${expenseDiffPercent.toFixed(1)}%` : ''}) 더 씀</span>
                  </span>
                ) : expenseDiff < 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#34C759] bg-[#34C759]/10 px-2.5 py-0.5 rounded-full">
                    <span>▼</span>
                    <span>지난달 대비 -{formatCurrency(Math.abs(expenseDiff), currency)} (-{Math.abs(expenseDiffPercent).toFixed(1)}%) 절약</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-400 bg-black/[0.04] dark:bg-white/[0.06] px-2.5 py-0.5 rounded-full">
                    <span>지난달과 지출 동일</span>
                  </span>
                )}
              </div>
            )}

            {/* Income & Balance */}
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-black/[0.03] dark:border-white/[0.04] text-[11px]">
              <div className="flex items-center gap-1 text-[#34C759] font-medium">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>수입 {formatCurrency(totalIncome, currency)}</span>
              </div>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">
                잔여 {formatCurrency(totalIncome - totalExpense, currency)}
              </span>
            </div>
          </div>

          {/* Top Category Spending Breakdown */}
          <div className="md:col-span-7">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                카테고리별 지출 비중
              </span>
              <span className="text-[11px] text-neutral-400 font-medium">
                총 {monthEntries.length}건
              </span>
            </div>

            {sortedCats.length === 0 ? (
              <p className="text-xs text-neutral-400 italic py-2">이번 달 등록된 지출 내역이 없습니다.</p>
            ) : (
              <div className="space-y-2">
                <div className="w-full h-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden flex gap-0.5 p-0.5">
                  {sortedCats.map(([cat, amount]) => {
                    const percent = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
                    const color = CATEGORY_COLORS[cat] || { hex: '#8E8E93' };
                    return (
                      <Tooltip
                        key={cat}
                        content={`${cat}: ${formatCurrency(amount, currency)} (${percent.toFixed(1)}%)`}
                        position="top"
                        className="h-full"
                        style={{ width: `${percent}%` }}
                      >
                        <div
                          className="w-full h-full rounded-full transition-all duration-500"
                          style={{
                            backgroundColor: color.hex
                          }}
                        />
                      </Tooltip>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1.5">
                  {sortedCats.map(([cat, amount]) => {
                    const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
                    const color = CATEGORY_COLORS[cat] || { hex: '#8E8E93' };
                    return (
                      <div
                        key={cat}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-black/[0.03] dark:bg-white/[0.05] border border-black/[0.02] dark:border-white/[0.04]"
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color.hex }} />
                        <span className="font-medium text-neutral-800 dark:text-neutral-200">{cat}</span>
                        <span className="text-neutral-400 dark:text-neutral-500 font-medium">
                          {formatCurrency(amount, currency)} ({percent}%)
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Baselane-Style Reconciliation Progress Section */}
        <div className="mt-5 pt-3.5 border-t border-black/[0.04] dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-2 rounded-full ${unreviewedCount > 0 ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
            <span className="text-[12px] font-semibold text-neutral-800 dark:text-neutral-200">
              장부 대조 &amp; 검토 진행률
            </span>
            {unreviewedCount > 0 ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                <span>{unreviewedCount}건 검토 대기</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full">
                <span>✓ {month}월 전 항목 검토 완료</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-32 sm:w-44 h-1.5 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${reviewPercent}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400 tabular-nums">
              {reviewPercent}% ({reviewedCount}/{totalCount}건)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});
