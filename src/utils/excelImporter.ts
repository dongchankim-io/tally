import { MoneybookEntry, EntryType } from '../types/moneybook';
import { generateId, getTodayDate } from './parser';
import { guessCategory } from './categories';

export async function parseExcelFile(file: File): Promise<MoneybookEntry[]> {
  const XLSX = await import('xlsx');
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { type: 'array' });

  // Read first sheet
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];

  // Convert to 2D array of rows
  const rawRows: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  if (rawRows.length < 2) return [];

  const entries: MoneybookEntry[] = [];

  // Find header row (usually contains '날짜' or '일자' or '내용' or '금액')
  let headerIndex = -1;
  let dateCol = -1;
  let assetCol = -1;
  let mainCatCol = -1;
  let subCatCol = -1;
  let payeeCol = -1;
  let amountCol = -1;
  let memoCol = -1;

  for (let r = 0; r < Math.min(rawRows.length, 10); r++) {
    const row = rawRows[r].map(c => String(c || '').trim());
    const dIdx = row.findIndex(c => /날짜|일자|거래일/i.test(c));
    const aIdx = row.findIndex(c => /금액|지출|수입|거래금액/i.test(c));

    if (dIdx !== -1 && aIdx !== -1) {
      headerIndex = r;
      dateCol = dIdx;
      amountCol = aIdx;

      // Find other columns
      assetCol = row.findIndex(c => /자산|결제수단|카드|계좌/i.test(c));
      mainCatCol = row.findIndex(c => /대분류|분류|카테고리/i.test(c));
      subCatCol = row.findIndex(c => /소분류/i.test(c));
      payeeCol = row.findIndex(c => /내용|사용처|가맹점|상호명|적요/i.test(c));
      memoCol = row.findIndex(c => /메모|비고/i.test(c));
      break;
    }
  }

  // If standard Naver format without headers or default fallback
  const startRow = headerIndex !== -1 ? headerIndex + 1 : 0;

  for (let r = startRow; r < rawRows.length; r++) {
    const row = rawRows[r];
    if (!row || row.length === 0) continue;

    const rawDate = String(dateCol !== -1 ? row[dateCol] : row[0] || '').trim();
    const rawAmount = row[amountCol !== -1 ? amountCol : 5];
    const rawPayee = String(payeeCol !== -1 ? row[payeeCol] : row[4] || '').trim();

    if (!rawDate && !rawAmount && !rawPayee) continue;

    // Parse date YYYY-MM-DD
    let date = getTodayDate();
    const dateMatch = rawDate.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})/);
    if (dateMatch) {
      date = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
    }

    // Parse amount
    let numAmount = 0;
    if (typeof rawAmount === 'number') {
      numAmount = rawAmount;
    } else if (rawAmount) {
      const clean = String(rawAmount).replace(/[,원\s]/g, '');
      numAmount = parseInt(clean, 10) || 0;
    }

    const type: EntryType = numAmount < 0 ? 'expense' : (numAmount > 0 ? 'income' : 'expense');
    const absAmount = Math.abs(numAmount);

    const asset = String(assetCol !== -1 ? row[assetCol] : row[1] || '신용카드').trim();
    let mainCat = String(mainCatCol !== -1 ? row[mainCatCol] : row[2] || '').trim();
    let subCat = String(subCatCol !== -1 ? row[subCatCol] : row[3] || '').trim();
    const memo = String(memoCol !== -1 ? row[memoCol] : row[6] || '').trim();

    if (!mainCat) {
      const guessed = guessCategory(rawPayee);
      mainCat = guessed.main;
      subCat = guessed.sub;
    }

    entries.push({
      id: generateId(),
      type,
      date,
      mainCategory: mainCat || '식비',
      subCategory: subCat || '외식',
      paymentMethod: asset || '신용카드',
      payee: rawPayee || '지출 항목',
      amount: absAmount,
      memo,
      reviewed: true
    });
  }

  return entries;
}
