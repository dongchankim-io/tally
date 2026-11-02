import React, { useState } from 'react';
import { Plus, ArrowDownRight, ArrowUpRight, Calendar, CreditCard, CornerDownLeft } from 'lucide-react';
import { EntryType, MoneybookEntry } from '../types/moneybook';
import { generateId, getTodayDate } from '../utils/parser';
import { guessCategory, PAYMENT_METHODS } from '../utils/categories';
import { CurrencyCode, formatCurrency, CURRENCIES } from '../utils/currency';
import { Tooltip } from './Tooltip';

interface QuickEntryBarProps {
  onAddEntry: (entry: MoneybookEntry) => void;
  currency: CurrencyCode;
}

export const QuickEntryBar: React.FC<QuickEntryBarProps> = React.memo(({ onAddEntry, currency }) => {
  const [input, setInput] = useState('');
  const [type, setType] = useState<EntryType>('expense');
  const [date, setDate] = useState(getTodayDate());
  const [paymentMethod, setPaymentMethod] = useState('신용카드');

  const currConfig = CURRENCIES[currency] || CURRENCIES.KRW;

  const parseInput = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return { payee: '', amount: 0, cat: { main: '식비', sub: '외식' } };

    // Matches numbers with optional decimals (e.g. $12.50, 15000원, 14.99)
    const amountMatch = trimmed.match(/[$₩€¥]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)\s*(?:원|달러|usd|krw|eur|jpy)?$/i) ||
                        trimmed.match(/[$₩€¥]?\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]+)?|[0-9]+(?:\.[0-9]+)?)/);

    let amount = 0;
    let payee = trimmed;

    if (amountMatch) {
      const cleanNum = amountMatch[1].replace(/,/g, '');
      amount = parseFloat(cleanNum) || 0;
      payee = trimmed.replace(amountMatch[0], '').trim();
    }

    const cat = guessCategory(payee || '기타');
    return { payee: payee || '지출', amount, cat };
  };

  const parsed = parseInput(input);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const { payee, amount, cat } = parsed;
    if (amount <= 0 && !payee) return;

    const newEntry: MoneybookEntry = {
      id: generateId(),
      type,
      date,
      mainCategory: cat.main,
      subCategory: cat.sub,
      paymentMethod,
      payee: payee || (type === 'expense' ? '일반 지출' : '수입'),
      amount: amount || 0,
      currency,
      memo: '',
      reviewed: false,
      createdAt: Date.now()
    };

    onAddEntry(newEntry);
    setInput('');
  };

  return (
    <div className="px-6 py-2">
      <form
        onSubmit={handleSubmit}
        className="glass-panel rounded-2xl p-2 shadow-[0_8px_32px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.25)] flex flex-col md:flex-row items-center gap-2 transition-all focus-within:ring-2 focus-within:ring-black/5 dark:focus-within:ring-white/10"
      >
        {/* Type Toggle Pill */}
        <Tooltip content={type === 'expense' ? '수입으로 전환' : '지출로 전환'}>
          <button
            type="button"
            onClick={() => setType(t => t === 'expense' ? 'income' : 'expense')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold shrink-0 transition-all cursor-pointer ${
              type === 'expense'
                ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                : 'bg-[#34C759]/10 text-[#34C759]'
            }`}
          >
            {type === 'expense' ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
            <span>{type === 'expense' ? '지출' : '수입'}</span>
          </button>
        </Tooltip>

        {/* Date Selector */}
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 bg-black/[0.03] dark:bg-white/[0.05] px-2.5 py-1.5 rounded-xl border border-black/[0.02] dark:border-white/[0.04] shrink-0">
          <Calendar className="w-3 h-3 text-neutral-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none outline-none font-mono text-[11px] text-neutral-800 dark:text-neutral-200 cursor-pointer"
          />
        </div>

        {/* Payment Method Selector */}
        <div className="flex items-center gap-1 text-[11px] text-neutral-500 bg-black/[0.03] dark:bg-white/[0.05] px-2.5 py-1 rounded-xl border border-black/[0.02] dark:border-white/[0.04] shrink-0">
          <CreditCard className="w-3 h-3 text-neutral-400" />
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="bg-transparent border-none outline-none text-neutral-800 dark:text-neutral-200 text-[11px] py-0.5 cursor-pointer"
          >
            {PAYMENT_METHODS.map(m => (
              <option key={m} value={m} className="dark:bg-[#1C1C1E]">{m}</option>
            ))}
          </select>
        </div>

        {/* Input Field with Live Preview */}
        <div className="flex-1 w-full flex items-center gap-2 px-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={currency === 'USD' ? '상호명과 금액 입력 (예: Starbucks 5.50 또는 Uber 14)' : '상호명과 금액 입력 (예: 스타벅스 6,200 또는 마트 25000)'}
            className="w-full bg-transparent border-none outline-none text-xs text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 tracking-tight"
          />

          {/* Realtime Smart Capsule Tag */}
          {input.trim() && parsed.amount > 0 && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/[0.05] dark:bg-white/[0.08] text-neutral-800 dark:text-neutral-200 text-[11px] whitespace-nowrap animate-in fade-in duration-200">
              <span className="font-medium">{parsed.payee}</span>
              <span className="text-neutral-400">•</span>
              <span className="font-semibold tabular-nums">{formatCurrency(parsed.amount, currency)}</span>
              <span className="text-neutral-400">•</span>
              <span className="text-[10px] text-neutral-500 font-medium">
                {parsed.cat.main}
              </span>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <Tooltip content="내역 추가" shortcut="Enter" align="end">
          <button
            type="submit"
            disabled={!input.trim()}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,0.06)] active:scale-95"
          >
            <span>기록</span>
            <CornerDownLeft className="w-3 h-3 opacity-60" />
          </button>
        </Tooltip>
      </form>
    </div>
  );
});
