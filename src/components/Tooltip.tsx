import React, { useState, useRef, useEffect } from 'react';

export interface TooltipProps {
  content: React.ReactNode;
  shortcut?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  align?: 'center' | 'start' | 'end';
  delay?: number;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Tooltip: React.FC<TooltipProps> = React.memo(({
  content,
  shortcut,
  position = 'bottom',
  align = 'center',
  delay = 100, // Instant 100ms response (vs browser default ~800ms)
  children,
  className = '',
  style
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<any>(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delay);
  };

  const hide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Compute position classes for outer wrapper
  let positionClass = '';
  if (position === 'bottom') {
    positionClass = 'top-full mt-1.5';
    if (align === 'center') positionClass += ' left-1/2 -translate-x-1/2';
    else if (align === 'start') positionClass += ' left-0';
    else if (align === 'end') positionClass += ' right-0';
  } else if (position === 'top') {
    positionClass = 'bottom-full mb-1.5';
    if (align === 'center') positionClass += ' left-1/2 -translate-x-1/2';
    else if (align === 'start') positionClass += ' left-0';
    else if (align === 'end') positionClass += ' right-0';
  } else if (position === 'left') {
    positionClass = 'right-full mr-1.5 top-1/2 -translate-y-1/2';
  } else if (position === 'right') {
    positionClass = 'left-full ml-1.5 top-1/2 -translate-y-1/2';
  }

  return (
    <div
      className={`relative inline-flex items-center ${className}`}
      style={style}
      onMouseEnter={show}
      onMouseLeave={hide}
      onMouseDown={hide}
    >
      {children}
      {isVisible && (
        <div className={`absolute ${positionClass} z-50 pointer-events-none select-none`}>
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-neutral-900/90 dark:bg-neutral-100/95 text-white dark:text-neutral-900 text-[11px] font-medium rounded-md shadow-xl backdrop-blur-md border border-white/10 dark:border-black/10 whitespace-nowrap transition-all duration-100 ease-out">
            <span>{content}</span>
            {shortcut && (
              <kbd className="px-1 py-0.5 text-[9px] font-mono rounded bg-white/20 dark:bg-black/15 text-white/90 dark:text-neutral-800 leading-none">
                {shortcut}
              </kbd>
            )}
          </div>
        </div>
      )}
    </div>
  );
});
