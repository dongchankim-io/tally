import React, { useState, useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown } from 'lucide-react';
import { MoneybookEntry } from '../types/moneybook';
import { CurrencyCode, formatCurrency } from '../utils/currency';

interface NeonSplineChartProps {
  entries: MoneybookEntry[];
  currentDate: Date;
  currency: CurrencyCode;
}

function getCubicBezierSplinePath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`;

  let d = `M ${points[0].x},${points[0].y}`;

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;

    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    d += ` C ${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2.x.toFixed(2)},${p2.y.toFixed(2)}`;
  }

  return d;
}

export const NeonSplineChart: React.FC<NeonSplineChartProps> = React.memo(({
  entries,
  currentDate,
  currency
}) => {
  const [hoveredDay, setHoveredDay] = useState<number | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;
  const currentMonthStr = `${year}-${String(month).padStart(2, '0')}`;

  const prevYear = month === 1 ? year - 1 : year;
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevMonthStr = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month;
  const daysInCurrentMonth = new Date(year, month, 0).getDate();
  const daysInPrevMonth = new Date(prevYear, prevMonth, 0).getDate();
  const maxDays = Math.max(daysInCurrentMonth, daysInPrevMonth);

  const activeDaysLimit = isCurrentMonth ? Math.min(today.getDate(), daysInCurrentMonth) : daysInCurrentMonth;

  // Calculate day-by-day cumulative expenses
  const { curCumulative, prevCumulative, maxVal } = useMemo(() => {
    const curDaily: number[] = new Array(daysInCurrentMonth + 1).fill(0);
    const prevDaily: number[] = new Array(daysInPrevMonth + 1).fill(0);

    entries.forEach(e => {
      if (e.type !== 'expense') return;
      if (e.date.startsWith(currentMonthStr)) {
        const d = parseInt(e.date.slice(8, 10), 10);
        if (d >= 1 && d <= daysInCurrentMonth) curDaily[d] += e.amount;
      } else if (e.date.startsWith(prevMonthStr)) {
        const d = parseInt(e.date.slice(8, 10), 10);
        if (d >= 1 && d <= daysInPrevMonth) prevDaily[d] += e.amount;
      }
    });

    const curCum: number[] = [0];
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      curCum[i] = curCum[i - 1] + curDaily[i];
    }

    const prevCum: number[] = [0];
    for (let i = 1; i <= daysInPrevMonth; i++) {
      prevCum[i] = prevCum[i - 1] + prevDaily[i];
    }

    const curMax = curCum[activeDaysLimit] || 0;
    const prevMax = prevCum[daysInPrevMonth] || 0;
    const peak = Math.max(curMax, prevMax, 10000);

    return {
      curCumulative: curCum,
      prevCumulative: prevCum,
      maxVal: peak * 1.15
    };
  }, [entries, currentMonthStr, prevMonthStr, daysInCurrentMonth, daysInPrevMonth, activeDaysLimit]);

  // Coordinate dimensions for SVG
  const width = 800;
  const height = 200;
  const paddingLeft = 10;
  const paddingRight = 10;
  const paddingTop = 25;
  const paddingBottom = 25;
  const chartW = width - paddingLeft - paddingRight;
  const chartH = height - paddingTop - paddingBottom;

  const getX = (day: number) => paddingLeft + ((day - 1) / (maxDays - 1)) * chartW;
  const getY = (val: number) => height - paddingBottom - (val / maxVal) * chartH;

  // Build points
  const prevPoints = useMemo(() => {
    const pts: { x: number; y: number; day: number; val: number }[] = [];
    for (let d = 1; d <= daysInPrevMonth; d++) {
      pts.push({ x: getX(d), y: getY(prevCumulative[d]), day: d, val: prevCumulative[d] });
    }
    return pts;
  }, [daysInPrevMonth, prevCumulative, maxVal]);

  const curPoints = useMemo(() => {
    const pts: { x: number; y: number; day: number; val: number }[] = [];
    for (let d = 1; d <= activeDaysLimit; d++) {
      pts.push({ x: getX(d), y: getY(curCumulative[d]), day: d, val: curCumulative[d] });
    }
    return pts;
  }, [activeDaysLimit, curCumulative, maxVal]);

  const prevSplineD = useMemo(() => getCubicBezierSplinePath(prevPoints), [prevPoints]);
  const curSplineD = useMemo(() => getCubicBezierSplinePath(curPoints), [curPoints]);

  const curAreaD = useMemo(() => {
    if (curPoints.length === 0) return '';
    const first = curPoints[0];
    const last = curPoints[curPoints.length - 1];
    const baselineY = height - paddingBottom;
    return `${curSplineD} L ${last.x},${baselineY} L ${first.x},${baselineY} Z`;
  }, [curSplineD, curPoints]);

  const activeHoverPoint = hoveredDay !== null && hoveredDay <= activeDaysLimit ? curPoints[hoveredDay - 1] : curPoints[curPoints.length - 1];
  const activeHoverPrev = hoveredDay !== null && hoveredDay <= daysInPrevMonth ? prevPoints[hoveredDay - 1] : prevPoints[Math.min(activeDaysLimit - 1, prevPoints.length - 1)];

  const curVal = activeHoverPoint?.val || 0;
  const prevVal = activeHoverPrev?.val || 0;
  const dayDiff = curVal - prevVal;
  const selectedDay = activeHoverPoint?.day || activeDaysLimit;

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-[0_4px_24px_rgba(0,0,0,0.03)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.36)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100 tracking-tight flex items-center gap-2">
              <span>일별 누적 지출 페이스</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shadow-xs">
                Neon Spline
              </span>
            </h3>
          </div>
          <p className="text-xs text-neutral-400 mt-0.5">
            지난달({prevMonth}월)과 이번달({month}월)의 누적 소비 속도를 매끄러운 곡선으로 대조합니다.
          </p>
        </div>

        {/* Live Hover / Current Status Badge */}
        <div className="flex items-center gap-2.5 bg-black/[0.03] dark:bg-white/[0.04] px-3.5 py-1.5 rounded-2xl border border-black/[0.03] dark:border-white/[0.05]">
          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400">
            {selectedDay}일 누적:
          </span>
          <span className="text-[12px] font-extrabold text-neutral-900 dark:text-neutral-50 tabular-nums">
            {formatCurrency(curVal, currency)}
          </span>
          {prevVal > 0 && (
            <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
              dayDiff > 0
                ? 'bg-[#FF2E7E]/10 text-[#FF2E7E] dark:text-[#FF4A91] border border-[#FF2E7E]/20'
                : 'bg-[#00FF85]/10 text-[#00D96C] dark:text-[#00FF85] border border-[#00FF85]/20'
            }`}>
              {dayDiff > 0 ? (
                <>
                  <TrendingUp className="w-2.5 h-2.5" />
                  <span>+{formatCurrency(dayDiff, currency)} 빠름</span>
                </>
              ) : (
                <>
                  <TrendingDown className="w-2.5 h-2.5" />
                  <span>-{formatCurrency(Math.abs(dayDiff), currency)} 절약 중</span>
                </>
              )}
            </span>
          )}
        </div>
      </div>

      {/* SVG Spline Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-44 sm:h-52 overflow-visible"
        >
          <defs>
            {/* Neon Glow Filter */}
            <filter id="neon-glow-violet" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#8B5CF6" floodOpacity="0.65" />
            </filter>
            <filter id="neon-glow-dot" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#8B5CF6" floodOpacity="0.9" />
            </filter>

            {/* Gradient Fill under spline */}
            <linearGradient id="neon-spline-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.32" />
              <stop offset="60%" stopColor="#8B5CF6" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={height - paddingBottom}
            x2={width - paddingRight}
            y2={height - paddingBottom}
            stroke="currentColor"
            className="text-black/[0.06] dark:text-white/[0.08]"
            strokeWidth="1"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + chartH / 2}
            x2={width - paddingRight}
            y2={paddingTop + chartH / 2}
            stroke="currentColor"
            className="text-black/[0.03] dark:text-white/[0.04]"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Previous Month Spline (Muted dashed line) */}
          {prevSplineD && (
            <path
              d={prevSplineD}
              fill="none"
              stroke="#9CA3AF"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.6"
              className="transition-all duration-300"
            />
          )}

          {/* Current Month Area Fill */}
          {curAreaD && (
            <path
              d={curAreaD}
              fill="url(#neon-spline-gradient)"
              className="transition-all duration-500"
            />
          )}

          {/* Current Month Spline (Glowing Hyper Violet Neon Line) */}
          {curSplineD && (
            <path
              d={curSplineD}
              fill="none"
              stroke="#8B5CF6"
              strokeWidth="2.5"
              filter="url(#neon-glow-violet)"
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          )}

          {/* Active Points & Latest Endpoint Glow */}
          {curPoints.map((pt) => {
            const isHovered = hoveredDay === pt.day;
            const isLast = pt.day === curPoints[curPoints.length - 1].day;

            if (!isHovered && !isLast) return null;

            return (
              <g key={pt.day}>
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : 4}
                  fill="#8B5CF6"
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  filter="url(#neon-glow-dot)"
                  className="transition-all duration-200"
                />
              </g>
            );
          })}

          {/* Hover detector overlay columns */}
          {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => {
            const x = getX(d);
            const colW = chartW / maxDays;
            return (
              <rect
                key={d}
                x={x - colW / 2}
                y={paddingTop}
                width={colW}
                height={chartH}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredDay(d)}
                onMouseLeave={() => setHoveredDay(null)}
              />
            );
          })}
        </svg>

        {/* Legend */}
        <div className="flex items-center justify-between text-[11px] text-neutral-400 pt-2 px-1">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-t border-dashed border-neutral-400 inline-block" />
              <span>지난달 ({prevMonth}월 누적)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-[#8B5CF6] inline-block shadow-[0_0_6px_#8B5CF6]" />
              <span className="font-semibold text-violet-600 dark:text-violet-400">이번달 ({month}월 누적)</span>
            </div>
          </div>

          <span className="text-[10px] font-mono">
            1일 ~ {maxDays}일 타임라인
          </span>
        </div>
      </div>
    </div>
  );
});
