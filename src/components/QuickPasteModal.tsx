import React, { useState, useEffect } from 'react';
import { X, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { MoneybookEntry } from '../types/moneybook';
import { parseRawText } from '../utils/parser';

interface QuickPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (entries: MoneybookEntry[]) => void;
}

export const QuickPasteModal: React.FC<QuickPasteModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [text, setText] = useState('');
  const [parsedPreview, setParsedPreview] = useState<MoneybookEntry[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);
    const parsed = parseRawText(val);
    setParsedPreview(parsed);
  };

  const handleConfirm = () => {
    if (parsedPreview.length > 0) {
      onImport(parsedPreview);
      setText('');
      setParsedPreview([]);
      onClose();
    }
  };

  const totalAmount = parsedPreview.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                스마트 벌크 붙여넣기
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                카드 승인 문자, 카카오페이/토스 결제 내역, 엑셀 텍스트를 그대로 붙여넣으세요.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div>
            <textarea
              autoFocus
              value={text}
              onChange={handleTextChange}
              rows={6}
              placeholder={`예시 1 (카드 문자):
[Web발신]
신한카드 승인
김*수님
10/24 13:45
스타벅스코리아
12,500원 일시불

예시 2 (엑셀/스프레드시트 행 복사):
2026-10-24\t맥도날드\t8,500
2026-10-24\tGS25\t4,200`}
              className="w-full text-xs font-mono p-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 focus:border-naver-green focus:bg-white dark:focus:bg-slate-900 outline-none transition-all placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Parsed Preview Section */}
          {parsedPreview.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  {parsedPreview.length}개 항목 자동 감지됨
                </span>
                <span>합계: {totalAmount.toLocaleString()}원</span>
              </div>

              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {parsedPreview.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-900/60">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] text-slate-400">{item.date}</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{item.payee}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {item.mainCategory} &gt; {item.subCategory}
                      </span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {item.amount.toLocaleString()}원
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : text.trim() ? (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200/60 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>텍스트에서 결제 금액이나 상호명을 찾지 못했습니다. 카드 문자나 엑셀 텍스트 형식을 확인해주세요.</span>
            </div>
          ) : null}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2 bg-slate-50/50 dark:bg-slate-800/30">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleConfirm}
            disabled={parsedPreview.length === 0}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold bg-naver-green text-white hover:bg-naver-hover disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
          >
            <span>가계부 목록에 {parsedPreview.length > 0 ? `${parsedPreview.length}개 ` : ''}추가</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
