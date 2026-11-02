import React from 'react';
import { ArrowUpRight, Flame, ShieldCheck, Trophy, Sparkles } from 'lucide-react';
import { MoneybookEntry } from '../types/moneybook';
import { CATEGORY_COLORS } from '../utils/categories';
import { CurrencyCode, formatCurrency, CURRENCIES } from '../utils/currency';
import { getZalphaMonthlyMood } from '../utils/zalpha';
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

  // Zalpha Witty Mood & Gamification Status
  const mood = getZalphaMonthlyMood(totalExpense, prevTotalExpense, totalIncome, reviewPercent, totalCount);

  // Saving Quest Budget & Defense Rate
  const budgetTarget = prevTotalExpense > 0
    ? prevTotalExpense
    : (totalIncome > 0 ? totalIncome * 0.75 : Math.max(totalExpense * 1.25, 1000000));
  const budgetSpentPercent = budgetTarget > 0 ? Math.round((totalExpense / budgetTarget) * 100) : 0;

  let questBadge = 'Lv.1 세이빙 방어 🛡️';
  let questColor = 'from-violet-500 via-fuchsia-500 to-pink-500';
  if (budgetSpentPercent <= 60) {
    questBadge = 'Lv.1 여유로운 방어 🛡️';
    questColor = 'from-violet-500 via-emerald-400 to-[#00FF85]';
  } else if (budgetSpentPercent <= 85) {
    questBadge = 'Lv.2 세이프존 유지 ⚡';
    questColor = 'from-violet-500 via-amber-400 to-amber-500';
  } else if (budgetSpentPercent <= 100) {
    questBadge = 'Lv.3 한계 돌파 직전 ⚠️';
    questColor = 'from-violet-500 via-fuchsia-500 to-[#FF2E7E]';
  } else {
    questBadge = '버짓 오버 경고 🚨';
    questColor = 'from-pink-600 via-rose-500 to-red-500';
  }

  return (
    <div className="px-6 pt-5 pb-2">
      <div className="glass-panel rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] transition-all">
        {/* Zalpha Witty Status Micro-Pill Banner */}
        <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold tracking-tight shadow-sm ${
              mood.theme === 'mint'
                ? 'bg-[#00FF85]/10 text-[#00D96C] dark:text-[#00FF85] border border-[#00FF85]/25 shadow-[0_0_14px_rgba(0,255,133,0.2)]'
                : mood.theme === 'pink'
                ? 'bg-[#FF2E7E]/10 text-[#FF2E7E] dark:text-[#FF4A91] border border-[#FF2E7E]/25 shadow-[0_0_14px_rgba(255,46,126,0.2)]'
                : 'bg-[#8B5CF6]/10 text-[#7C3AED] dark:text-[#A78BFA] border border-[#8B5CF6]/25 shadow-[0_0_14px_rgba(139,92,246,0.2)]'
            }`}>
              <span className="text-xs">{mood.emoji}</span>
              <span>{mood.badge}</span>
            </span>
            <span className="text-[12px] text-neutral-500 dark:text-neutral-400 font-medium hidden sm:inline">
              {mood.comment}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
              {month}월 Zalpha Workspace
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Main Large Expense Block */}
          <div className="md:col-span-5 border-b md:border-b-0 md:border-r border-black/[0.04] dark:border-white/[0.06] pb-4 md:pb-0 md:pr-6">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                {month}월 총 지출 ({currency})
              </span>
              <span className="text-[11px] font-medium text-neutral-400 dark:text-neutral-500">
                일평균 {formatCurrency(dailyAverage, currency)}
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="text-sm font-bold text-neutral-400 dark:text-neutral-500">
                {currConfig.symbol}
              </span>
              <span className="text-3xl sm:text-4xl font-extrabold tracking-[-0.03em] text-neutral-900 dark:text-neutral-50 tabular-nums">
                {totalExpense.toLocaleString(undefined, {
                  minimumFractionDigits: currConfig.decimals,
                  maximumFractionDigits: currConfig.decimals
                })}
              </span>
            </div>

            {/* MoM Comparison Pill */}
            {prevTotalExpense > 0 && (
              <div className="mt-2.5 flex items-center gap-1.5">
                {expenseDiff > 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#FF2E7E] dark:text-[#FF4A91] bg-[#FF2E7E]/10 border border-[#FF2E7E]/15 px-2.5 py-0.5 rounded-full shadow-xs">
                    <span>▲</span>
                    <span>지난달 대비 +{formatCurrency(expenseDiff, currency)} ({expenseDiffPercent > 0 ? `+${expenseDiffPercent.toFixed(1)}%` : ''}) 더 씀</span>
                  </span>
                ) : expenseDiff < 0 ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#00D96C] dark:text-[#00FF85] bg-[#00FF85]/10 border border-[#00FF85]/20 px-2.5 py-0.5 rounded-full shadow-xs">
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
              <div className="flex items-center gap-1 text-[#00D96C] dark:text-[#00FF85] font-semibold">
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

        {/* Zalpha Gamification HUD: Dual Quests (Reconciliation & Saving) */}
        <div className="mt-5 pt-4 border-t border-black/[0.04] dark:border-white/[0.06] grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Quest 1: Baselane Reconciliation (Inbox Zero) */}
          <div className="flex items-center justify-between gap-3 bg-black/[0.02] dark:bg-white/[0.03] px-3.5 py-2.5 rounded-2xl border border-black/[0.03] dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${unreviewedCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-[#00FF85] shadow-[0_0_8px_rgba(0,255,133,0.8)]'}`} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    장부 대조 퀘스트
                  </span>
                  {unreviewedCount === 0 && totalCount > 0 && (
                    <span className="text-[10px] text-[#00D96C] dark:text-[#00FF85] font-bold">
                      CLEAR 🏆
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">
                  {unreviewedCount > 0 ? `${unreviewedCount}건 미검토 대기` : '모든 거래 검토 완료'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-24 sm:w-28 h-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden p-0.5">
                <div 
                  className="h-full bg-gradient-to-r from-emerald-500 to-[#00FF85] rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(0,255,133,0.3)]"
                  style={{ width: `${reviewPercent}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 tabular-nums">
                {reviewPercent}%
              </span>
            </div>
          </div>

          {/* Quest 2: Monthly Saving Quest (Weekly/Monthly Budget Defense) */}
          <div className="flex items-center justify-between gap-3 bg-black/[0.02] dark:bg-white/[0.03] px-3.5 py-2.5 rounded-2xl border border-black/[0.03] dark:border-white/[0.04]">
            <div className="flex items-center gap-2">
              <Flame className="w-3.5 h-3.5 text-violet-500 dark:text-violet-400" />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
                    세이빙 퀘스트
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20">
                    {questBadge}
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 font-medium">
                  예산 대비 지출 {budgetSpentPercent}%
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-24 sm:w-28 h-2 rounded-full bg-black/[0.04] dark:bg-white/[0.06] overflow-hidden p-0.5">
                <div 
                  className={`h-full bg-gradient-to-r ${questColor} rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(139,92,246,0.4)]`}
                  style={{ width: `${Math.min(budgetSpentPercent, 100)}%` }}
                />
              </div>
              <span className="text-[11px] font-mono font-bold text-neutral-600 dark:text-neutral-300 tabular-nums">
                {budgetSpentPercent}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
