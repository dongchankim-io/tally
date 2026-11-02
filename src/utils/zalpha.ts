export interface ZalphaTag {
  label: string;
  emoji: string;
  colorClass: string;
}

export function detectZalphaTag(payee: string, memo: string, subCategory: string = ''): ZalphaTag | null {
  const text = `${payee} ${memo} ${subCategory}`.toLowerCase();

  if (/마라|탕후루/.test(text)) {
    return { label: '마라/탕후루', emoji: '🍡', colorClass: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' };
  }
  if (/올리브영|올영/.test(text)) {
    return { label: '올영 세일', emoji: '💄', colorClass: 'bg-pink-500/10 text-pink-500 dark:text-pink-400 border-pink-500/20' };
  }
  if (/무신사|지그재그|에이블리|kream|크림|29cm|w컨셉|자라|zara|h&m/.test(text)) {
    return { label: 'OOTD 쇼핑', emoji: '🛍️', colorClass: 'bg-violet-500/10 text-violet-500 dark:text-violet-400 border-violet-500/20' };
  }
  if (/스타벅스|블루보틀|투썸|이디야|컴포즈|메가커피|빽다방|카페|커피|coffee|할리스|공차/.test(text)) {
    return { label: '카페인 충전', emoji: '☕', colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
  }
  if (/배달의민족|배민|요기요|쿠팡이츠|배달/.test(text)) {
    return { label: '배달 맛집', emoji: '🛵', colorClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
  }
  if (/넷플릭스|유튜브|youtube|netflix|디즈니|스포티파이|티빙|웨이브|왓챠|애플뮤직|밀리의서재/.test(text)) {
    return { label: 'OTT 구독', emoji: '🍿', colorClass: 'bg-purple-500/10 text-purple-500 dark:text-purple-400 border-purple-500/20' };
  }
  if (/편의점|gs25|cu|세븐일레븐|이마트24|씨유/.test(text)) {
    return { label: '편의점 털기', emoji: '🍙', colorClass: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
  }
  if (/다이소/.test(text)) {
    return { label: '다이소 꿀템', emoji: '🧺', colorClass: 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/20' };
  }
  if (/택시|카카오택시|우버|타다/.test(text)) {
    return { label: '택시 이동', emoji: '🚖', colorClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
  }
  if (/당근|중고나라|번개장터/.test(text)) {
    return { label: '당근 거래', emoji: '🥕', colorClass: 'bg-orange-500/10 text-orange-500 dark:text-orange-400 border-orange-500/20' };
  }
  if (/헬스|필라테스|크로스핏|클라이밍|피트니스|요가/.test(text)) {
    return { label: '오운완', emoji: '🏋️', colorClass: 'bg-cyan-500/10 text-cyan-500 dark:text-cyan-400 border-cyan-500/20' };
  }
  if (/pc방|롤|게임|스팀|steam|닌텐도|플레이스테이션/.test(text)) {
    return { label: '게임 힐링', emoji: '🎮', colorClass: 'bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border-indigo-500/20' };
  }
  if (/네이버웹툰|카카오페이지|웹툰|리디|시리즈/.test(text)) {
    return { label: '웹툰 쿠키', emoji: '🍪', colorClass: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20' };
  }
  if (/급여|월급|상여금|보너스|정산|알바비/.test(text)) {
    return { label: '갓생 월급', emoji: '💸', colorClass: 'bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 border-emerald-500/20' };
  }

  return null;
}

export interface ZalphaStatusMood {
  badge: string;
  emoji: string;
  comment: string;
  theme: 'mint' | 'pink' | 'violet' | 'amber';
}

export function getZalphaMonthlyMood(
  totalExpense: number,
  prevTotalExpense: number,
  totalIncome: number,
  reviewedPercent: number,
  totalCount: number
): ZalphaStatusMood {
  if (totalCount === 0) {
    return {
      badge: '클린 가계부 스타트',
      emoji: '✨',
      comment: '이번 달 첫 지출을 기록해보세요',
      theme: 'violet'
    };
  }

  if (reviewedPercent === 100 && totalCount > 0) {
    return {
      badge: '장부 대조 올클리어!',
      emoji: '🏆',
      comment: '모든 항목 검토 완료 퀘스트 달성',
      theme: 'violet'
    };
  }

  if (prevTotalExpense > 0) {
    const diffPercent = ((totalExpense - prevTotalExpense) / prevTotalExpense) * 100;
    if (diffPercent <= -15) {
      return {
        badge: '지출 방어 성공적!',
        emoji: '🛡️',
        comment: `전월 대비 ${Math.abs(diffPercent).toFixed(0)}% 갓생 절약 중`,
        theme: 'mint'
      };
    }
    if (diffPercent >= 20) {
      return {
        badge: '이번 달 소비 폼 미쳤다',
        emoji: '🔥',
        comment: `전월 대비 +${diffPercent.toFixed(0)}% 급증 주의 경보`,
        theme: 'pink'
      };
    }
  }

  if (totalIncome > 0 && totalExpense / totalIncome <= 0.5) {
    return {
      badge: '통장 방어율 최상위',
      emoji: '⚡',
      comment: '수입 대비 50% 이상 든든하게 세이빙 중',
      theme: 'mint'
    };
  }

  return {
    badge: '안정적인 소비 페이스',
    emoji: '🧘',
    comment: '무리 없는 균형 잡힌 지출 플로우',
    theme: 'violet'
  };
}
