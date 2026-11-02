import React, { useState, useMemo, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { MoneybookEntry } from '../types/moneybook';
import { CATEGORY_COLORS } from '../utils/categories';
import { CurrencyCode, formatCurrency } from '../utils/currency';

interface CalendarViewProps {
  entries: MoneybookEntry[];
  currentDate: Date;
  currency: CurrencyCode;
}

export const CalendarView: React.FC<CalendarViewProps> = React.memo(({ entries, currentDate, currency }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthPadded = String(month + 1).padStart(2, '0');

  const todayStr = `${year}-${monthPadded}-${String(new Date().getDate()).padStart(2, '0')}`;
  const [activeDate, setActiveDate] = useState<string>(todayStr);

  // Keep activeDate in sync when user navigates to previous/next month
  useEffect(() => {
    const monthPrefix = `${year}-${monthPadded}`;
    if (!activeDate.startsWith(monthPrefix)) {
      const today = new Date();
      if (today.getFullYear() === year && today.getMonth() === month) {
        setActiveDate(`${year}-${monthPadded}-${String(today.getDate()).padStart(2, '0')}`);
      } else {
        setActiveDate(`${year}-${monthPadded}-01`);
      }
    }
  }, [year, month, monthPadded, activeDate]);

  const dailyTotals = useMemo(() => {
    const totals: Record<number, { expense: number; income: number; items: MoneybookEntry[] }> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      totals[d] = { expense: 0, income: 0, items: [] };
    }

    entries.forEach(e => {
      if (e.date.startsWith(`${year}-${monthPadded}`)) {
        const day = parseInt(e.date.split('-')[2], 10);
        if (totals[day]) {
          if (e.type === 'expense') totals[day].expense += e.amount;
          else if (e.type === 'income') totals[day].income += e.amount;
          totals[day].items.push(e);
        }
      }
    });

    return totals;
  }, [entries, year, monthPadded, daysInMonth]);

  const selectedDayItems = useMemo(() => {
    return activeDate ? entries.filter(e => e.date === activeDate) : [];
  }, [entries, activeDate]);

  const selectedDayExpense = useMemo(() => {
    return selectedDayItems.filter(e => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  }, [selectedDayItems]);

  const noSpendCount = useMemo(() => {
    return Object.values(dailyTotals).filter(d => d.expense === 0 && d.items.length === 0).length;
  }, [dailyTotals]);

  return (
    <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col lg:flex-row gap-6">
      {/* Calendar Grid Surface */}
      <div className="flex-1 glass-panel rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-black/[0.04] dark:border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
              {year}년 {month + 1}월 지출 달력
            </span>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#FF9500]/10 text-[#FF9500]">
              <Flame className="w-3 h-3" />
              <span>무지출 데이 {noSpendCount}일 달성</span>
            </div>
          </div>
          <span className="text-xs text-neutral-400">날짜를 클릭하면 상세 내역을 볼 수 있습니다</span>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-neutral-400 pb-2">
          <span className="text-[#FF3B30]">일</span>
          <span>월</span>
          <span>화</span>
          <span>수</span>
          <span>목</span>
          <span>금</span>
          <span className="text-[#007AFF]">토</span>
        </div>

        {/* Calendar Grid Cells */}
        <div className="grid grid-cols-7 gap-1.5 flex-1 auto-rows-fr">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2 min-h-[64px] rounded-2xl bg-black/[0.01] dark:bg-white/[0.01]" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dayPadded = String(day).padStart(2, '0');
            const dateStr = `${year}-${monthPadded}-${dayPadded}`;
            const data = dailyTotals[day];
            const isSelected = activeDate === dateStr;

            return (
              <button
                key={day}
                onClick={() => setActiveDate(dateStr)}
                className={`p-2 min-h-[68px] rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  isSelected
                    ? 'border-neutral-900 dark:border-white bg-black/[0.03] dark:bg-white/[0.08] shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
                    : 'border-black/[0.02] dark:border-white/[0.04] bg-white/40 dark:bg-white/[0.02] hover:bg-black/[0.02] dark:hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-[11px] font-semibold ${
                    isSelected ? 'text-neutral-900 dark:text-neutral-100' : 'text-neutral-600 dark:text-neutral-400'
                  }`}>
                    {day}
                  </span>
                  {data.expense === 0 && data.items.length > 0 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />
                  )}
                </div>

                <div className="space-y-0.5 text-right w-full">
                  {data.expense > 0 && (
                    <span className="block text-[10px] font-semibold text-[#FF3B30] tabular-nums tracking-tight">
                      -{formatCurrency(data.expense, currency)}
                    </span>
                  )}
                  {data.income > 0 && (
                    <span className="block text-[9px] font-semibold text-[#34C759] tabular-nums tracking-tight">
                      +{formatCurrency(data.income, currency)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Side Sheet */}
      <div className="w-full lg:w-80 glass-panel rounded-3xl p-5 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col">
        <div className="pb-3 border-b border-black/[0.04] dark:border-white/[0.06] mb-3">
          <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">
            선택한 일자 내역
          </span>
          <h4 className="text-base font-bold text-neutral-900 dark:text-neutral-100 tracking-tight mt-0.5">
            {activeDate}
          </h4>
          <span className="text-xs font-semibold text-neutral-500 tabular-nums">
            총 지출 {formatCurrency(selectedDayExpense, currency)}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {selectedDayItems.length === 0 ? (
            <div className="py-16 text-center text-xs text-neutral-400">
              <p>해당 일자에 등록된 지출이 없습니다.</p>
              <p className="text-[11px] text-[#34C759] mt-1 font-semibold">🎉 무지출 데이 달성!</p>
            </div>
          ) : (
            selectedDayItems.map(item => {
              const color = CATEGORY_COLORS[item.mainCategory] || { hex: '#8E8E93' };
              const itemCurr = item.currency || currency;

              return (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.02] dark:border-white/[0.04] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color.hex }} />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-neutral-900 dark:text-neutral-100 truncate">
                        {item.payee}
                      </p>
                      <p className="text-[10px] text-neutral-400">
                        {item.mainCategory} • {item.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 tabular-nums shrink-0">
                    {formatCurrency(item.amount, itemCurr)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
});
