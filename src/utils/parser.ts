import { MoneybookEntry } from '../types/moneybook';
import { guessCategory } from './categories';

// Generate UUID-like ID
export function generateId(): string {
  return 'entry_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

// Format Date YYYY-MM-DD
export function getTodayDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseRawText(rawText: string): MoneybookEntry[] {
  if (!rawText || !rawText.trim()) return [];

  const entries: MoneybookEntry[] = [];
  const lines = rawText.trim().split('\n');

  // Check if it's tab-separated (e.g. copied from Excel/Sheets)
  const isTabSeparated = lines.some(l => l.includes('\t'));

  if (isTabSeparated) {
    for (const line of lines) {
      const parts = line.split('\t').map(p => p.trim());
      if (parts.length < 2) continue;

      // Handle common header skip
      if (parts[0] === '날짜' || parts[1] === '금액' || parts[0] === 'Date') continue;

      let date = getTodayDate();
      let amount = 0;
      let payee = '';
      let memo = '';
      let mainCat = '식비';
      let subCat = '외식';
      let paymentMethod = '신용카드';

      // Simple heuristic for columns:
      // Pattern 1: [날짜, 사용처, 금액, ...] or [날짜, 구분, 대분류, 소분류, 내용, 금액, ...]
      for (const part of parts) {
        // Date test
        const dateMatch = part.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
        if (dateMatch) {
          date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
          continue;
        }

        // Amount test (e.g. 15,000 or 15000원)
        const numClean = part.replace(/[,원\s]/g, '');
        if (/^-?\d+$/.test(numClean) && !amount) {
          amount = Math.abs(parseInt(numClean, 10));
          continue;
        }

        // Payee/Description
        if (!payee && part.length > 0 && isNaN(Number(part))) {
          payee = part;
        } else if (!memo && part.length > 0) {
          memo = part;
        }
      }

      if (amount > 0 || payee) {
        const cat = guessCategory(payee || '기타');
        entries.push({
          id: generateId(),
          type: 'expense',
          date,
          mainCategory: cat.main,
          subCategory: cat.sub,
          paymentMethod,
          payee: payee || '미지정',
          amount: amount || 0,
          memo: memo || '',
          reviewed: false,
          createdAt: Date.now()
        });
      }
    }

    if (entries.length > 0) return entries;
  }

  // Not tab-separated; parse as message chunks or line-by-line SMS/App pushes
  // Common blocks separated by empty lines or [Web발신]
  const blocks = rawText
    .split(/(?=\[Web발신\]|\[KB국민카드\]|\[신한카드\]|\[현대카드\]|\[삼성카드\]|\[하나카드\]|\[우리카드\]|\[롯데카드\]|\[NH농협\]|\[카카오페이\]|\[토스\]|\n\s*\n)/)
    .filter(b => b.trim().length > 0);

  for (const block of blocks) {
    const entry = parseSingleBlock(block);
    if (entry) {
      entries.push(entry);
    }
  }

  return entries;
}

function parseSingleBlock(block: string): MoneybookEntry | null {
  const text = block.trim();
  if (!text) return null;

  // Extract payment method
  let paymentMethod = '신용카드';
  if (/카카오페이/.test(text)) paymentMethod = '카카오페이';
  else if (/토스/.test(text)) paymentMethod = '토스페이';
  else if (/네이버페이/.test(text)) paymentMethod = '네이버페이';
  else if (/체크/.test(text)) paymentMethod = '체크카드';
  else if (/현금|계좌이체/.test(text)) paymentMethod = '현금';

  // Extract Amount (e.g. 24,000원 or 24000원 or 24,000 KRW)
  const amountMatch = text.match(/([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)\s*원/) || 
                      text.match(/일시불\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/) ||
                      text.match(/결제\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/) ||
                      text.match(/금액\s*([0-9]{1,3}(?:,[0-9]{3})*|[0-9]+)/);

  let amount = 0;
  if (amountMatch) {
    amount = parseInt(amountMatch[1].replace(/,/g, ''), 10);
  }

  // Extract Date
  let date = getTodayDate();
  const currentYear = new Date().getFullYear();
  // Match MM/DD or MM.DD or YYYY-MM-DD
  const fullDateMatch = text.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
  const shortDateMatch = text.match(/(\d{1,2})[/.](\d{1,2})\s+\d{1,2}:\d{2}/) || text.match(/(\d{1,2})월\s*(\d{1,2})일/);

  if (fullDateMatch) {
    date = `${fullDateMatch[1]}-${fullDateMatch[2].padStart(2, '0')}-${fullDateMatch[3].padStart(2, '0')}`;
  } else if (shortDateMatch) {
    date = `${currentYear}-${shortDateMatch[1].padStart(2, '0')}-${shortDateMatch[2].padStart(2, '0')}`;
  }

  // Extract Payee (상호명/사용처)
  // Korean card SMS typically has payee on its own line or following amount
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let payee = '';

  for (const line of lines) {
    // Skip headers & obvious noise
    if (/Web발신|승인|일시불|누적|잔액|할부|체크카드|신용카드|KRW|고객님/.test(line)) continue;
    if (line.includes('원') && line.length < 15) continue;
    if (/^\d{1,2}[/.]\d{1,2}/.test(line)) continue;

    // First plausible line is candidate payee
    const candidate = line.replace(/^사용처\s*:\s*/, '').trim();
    if (candidate.length > 1 && !payee) {
      payee = candidate;
      break;
    }
  }

  if (!payee && amountMatch) {
    // Try regex around amount
    const afterAmountMatch = text.match(/([0-9,]+원)\s+([가-힣a-zA-Z0-9\s(주)]+)/);
    if (afterAmountMatch) {
      payee = afterAmountMatch[2].trim();
    }
  }

  if (amount === 0 && !payee) {
    return null;
  }

  const category = guessCategory(payee || '기타');

  return {
    id: generateId(),
    type: 'expense',
    date,
    mainCategory: category.main,
    subCategory: category.sub,
    paymentMethod,
    payee: payee || '지출 항목',
    amount,
    memo: '',
    reviewed: false,
    createdAt: Date.now()
  };
}
