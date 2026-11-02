import { MoneybookEntry } from '../types/moneybook';

export async function exportToExcel(entries: MoneybookEntry[]): Promise<void> {
  // Dynamically import heavy XLSX library only when user exports
  const XLSX = await import('xlsx');

  // Headers: 날짜 | 구분 | 대분류 | 소분류 | 결제수단 | 내용(사용처) | 금액 | 검토상태 | 메모
  const headers = ['날짜', '구분', '대분류', '소분류', '결제수단', '내용(사용처)', '금액', '검토상태', '메모'];

  const rows = entries.map(entry => {
    const formattedDate = entry.date.replace(/-/g, '.');
    const amountVal = entry.type === 'expense' ? -Math.abs(entry.amount) : Math.abs(entry.amount);

    return [
      formattedDate,
      entry.type === 'expense' ? '지출' : '수입',
      entry.mainCategory,
      entry.subCategory,
      entry.paymentMethod,
      entry.payee,
      amountVal,
      entry.reviewed ? '검토 완료' : '미검토',
      entry.memo
    ];
  });

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  worksheet['!cols'] = [
    { wch: 12 }, // 날짜
    { wch: 8 },  // 구분
    { wch: 12 }, // 대분류
    { wch: 12 }, // 소분류
    { wch: 12 }, // 결제수단
    { wch: 22 }, // 내용
    { wch: 12 }, // 금액
    { wch: 10 }, // 검토상태
    { wch: 25 }, // 메모
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Tally_장부');

  const today = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(workbook, `Tally_가계부_${today}.xlsx`);
}

// Backwards compatibility alias
export const exportToNaverExcel = exportToExcel;
