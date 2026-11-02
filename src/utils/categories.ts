import { CategoryTree, EntryType } from '../types/moneybook';

export const EXPENSE_CATEGORIES: CategoryTree = {
  '식비': ['외식', '카페/간식', '배달/포장', '주식/부식', '술/유흥', '기타'],
  '생활/마트': ['편의점', '마트/슈퍼', '생필품', '생활잡화', '가전/가구', '기타'],
  '주거/통신': ['관리비', '공과금', '월세', '휴대폰요금', '인터넷/TV', '기타'],
  '교통/차량': ['대중교통', '택시', '주유', '주차/통행료', '차량정비', '기타'],
  '쇼핑/패션': ['의류', '패션잡화', '화장품/미용', '온라인쇼핑', '기타'],
  '문화/여가': ['OTT/구독', '도서/음악', '영화/공연', '여행/숙박', '운동/헬스', '취미', '기타'],
  '의료/건강': ['병원/의원', '약국', '건강검진', '영양제', '기타'],
  '교육/학습': ['학원/강의', '교재', '시험/응시료', '기타'],
  '경조/선물': ['경조사비', '선물', '회비/모임', '기타'],
  '금융/보험': ['보험료', '대출이자', '세금/공과금', '투자/저축', '기타'],
  '기타지출': ['기타']
};

export const INCOME_CATEGORIES: CategoryTree = {
  '급여': ['월급/본업', '상여금/보너스', '야근/특근', '기타'],
  '부수입': ['이자/배당', '중고거래/당근', '프리랜서/알바', '포인트/캐시백', '기타'],
  '용돈/기타': ['용돈', '환급금', '상금', '기타']
};

// Apple iOS System Palette
export const CATEGORY_COLORS: Record<string, { bg: string; text: string; hex: string; symbolBg: string }> = {
  '식비': { bg: 'bg-[#FF9500]/10', text: 'text-[#FF9500]', hex: '#FF9500', symbolBg: 'bg-[#FF9500]' },
  '생활/마트': { bg: 'bg-[#30B0C7]/10', text: 'text-[#30B0C7]', hex: '#30B0C7', symbolBg: 'bg-[#30B0C7]' },
  '주거/통신': { bg: 'bg-[#5856D6]/10', text: 'text-[#5856D6]', hex: '#5856D6', symbolBg: 'bg-[#5856D6]' },
  '교통/차량': { bg: 'bg-[#007AFF]/10', text: 'text-[#007AFF]', hex: '#007AFF', symbolBg: 'bg-[#007AFF]' },
  '쇼핑/패션': { bg: 'bg-[#FF2D55]/10', text: 'text-[#FF2D55]', hex: '#FF2D55', symbolBg: 'bg-[#FF2D55]' },
  '문화/여가': { bg: 'bg-[#AF52DE]/10', text: 'text-[#AF52DE]', hex: '#AF52DE', symbolBg: 'bg-[#AF52DE]' },
  '의료/건강': { bg: 'bg-[#FF3B30]/10', text: 'text-[#FF3B30]', hex: '#FF3B30', symbolBg: 'bg-[#FF3B30]' },
  '교육/학습': { bg: 'bg-[#00C7BE]/10', text: 'text-[#00C7BE]', hex: '#00C7BE', symbolBg: 'bg-[#00C7BE]' },
  '경조/선물': { bg: 'bg-[#A2845E]/10', text: 'text-[#A2845E]', hex: '#A2845E', symbolBg: 'bg-[#A2845E]' },
  '금융/보험': { bg: 'bg-[#34C759]/10', text: 'text-[#34C759]', hex: '#34C759', symbolBg: 'bg-[#34C759]' },
  '기타지출': { bg: 'bg-[#8E8E93]/10', text: 'text-[#8E8E93]', hex: '#8E8E93', symbolBg: 'bg-[#8E8E93]' },
  '급여': { bg: 'bg-[#34C759]/10', text: 'text-[#34C759]', hex: '#34C759', symbolBg: 'bg-[#34C759]' },
  '부수입': { bg: 'bg-[#30B0C7]/10', text: 'text-[#30B0C7]', hex: '#30B0C7', symbolBg: 'bg-[#30B0C7]' },
  '용돈/기타': { bg: 'bg-[#FF9500]/10', text: 'text-[#FF9500]', hex: '#FF9500', symbolBg: 'bg-[#FF9500]' }
};

export const PAYMENT_METHODS = [
  '신용카드',
  '체크카드',
  '네이버페이',
  'Apple Pay',
  '카카오페이',
  '토스페이',
  '계좌이체',
  '현금',
  '기타'
];

export function getCategoriesByType(type: EntryType): CategoryTree {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
}

export function guessCategory(payee: string): { main: string; sub: string } {
  const p = payee.toLowerCase();

  if (/스타벅스|메가커피|컴포즈|투썸|이디야|빽다방|블루보틀|커피|카페|cafe|coffee|할리스|공차|디저트|베이커리|파리바게뜨|뚜레쥬르/.test(p)) {
    return { main: '식비', sub: '카페/간식' };
  }
  if (/배달의민족|배민|요기요|쿠팡이츠|배달/.test(p)) {
    return { main: '식비', sub: '배달/포장' };
  }
  if (/gs25|cu|세븐일레븐|이마트24|미니스톱|씨유|편의점/.test(p)) {
    return { main: '생활/마트', sub: '편의점' };
  }
  if (/이마트|홈플러스|롯데마트|하나로마트|노브랜드|마켓컬리|코스트코|슈퍼|마트|오아시스/.test(p)) {
    return { main: '생활/마트', sub: '마트/슈퍼' };
  }
  if (/다이소|올리브영|무인양품|모던하우스|이케아/.test(p)) {
    return { main: '생활/마트', sub: '생필품' };
  }
  if (/식당|맥도날드|버거킹|롯데리아|서브웨이|김밥|국밥|치킨|피자|스시|갈비|고기|삼겹|면옥|우동|짜장|짬뽕|탕수육|분식|돈까스/.test(p)) {
    return { main: '식비', sub: '외식' };
  }
  if (/택시|카카오택시|티머니|코레일|srt|지하철|버스|하이패스/.test(p)) {
    return { main: '교통/차량', sub: /택시/.test(p) ? '택시' : '대중교통' };
  }
  if (/주유소|gs칼텍스|sk에너지|s-oil|오일/.test(p)) {
    return { main: '교통/차량', sub: '주유' };
  }
  if (/쿠팡|네이버페이|11번가|g마켓|옥션|ssg|무신사|지그재그|에이블리|kream|크림/.test(p)) {
    return { main: '쇼핑/패션', sub: '온라인쇼핑' };
  }
  if (/넷플릭스|유튜브|youtube|netflix|디즈니|스포티파이|애플|apple|icloud|구독|밀리의서재|리디북스/.test(p)) {
    return { main: '문화/여가', sub: 'OTT/구독' };
  }
  if (/약국|병원|의원|내과|이비인후과|치과|안과|정형외과|피부과|한의원/.test(p)) {
    return { main: '의료/건강', sub: /약국/.test(p) ? '약국' : '병원/의원' };
  }
  if (/급여|월급|상여금|보너스/.test(p)) {
    return { main: '급여', sub: '월급/본업' };
  }

  return { main: '식비', sub: '외식' };
}
