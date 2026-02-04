import React, { useMemo, useState, useEffect } from 'react';
import { TimerStatus } from '../types';

interface DialProps {
  totalSeconds: number;
  remainingSeconds: number;
  warningThreshold: number;
  status: TimerStatus;
}

const Dial: React.FC<DialProps> = ({ totalSeconds, remainingSeconds, warningThreshold, status }) => {
  const radius = 120;
  const stroke = 12;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  
  const [glitchText, setGlitchText] = useState<string | null>(null);

  const strokeDashoffset = useMemo(() => {
    if (totalSeconds === 0) return 0;
    const progress = (totalSeconds - remainingSeconds) / totalSeconds;
    return circumference - progress * circumference;
  }, [remainingSeconds, totalSeconds, circumference]);

  // Determine color state
  const isWarning = remainingSeconds <= warningThreshold && remainingSeconds > 0;
  const isFinished = status === TimerStatus.FINISHED;
  
  let colorClass = "stroke-emerald-500";
  let bgGlow = "shadow-[0_0_30px_rgba(16,185,129,0.2)]"; // Green glow

  if (isFinished) {
    colorClass = "stroke-red-600";
    bgGlow = "shadow-[0_0_60px_rgba(220,38,38,0.6)]"; // Strong red
  } else if (isWarning) {
    colorClass = "stroke-amber-500";
    bgGlow = "shadow-[0_0_40px_rgba(245,158,11,0.4)]"; // Amber glow
  }

  // Format time for display
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  const displayTime = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Glitch Effect Logic
  useEffect(() => {
    if (!isWarning || status !== TimerStatus.RUNNING) {
        setGlitchText(null);
        return;
    }

    // Urgency factor: 0 (start of warning) -> 1 (near zero)
    // Helps increase glitch frequency as time runs out
    const urgency = Math.max(0, Math.min(1, 1 - (remainingSeconds / warningThreshold)));
    
    // Check for glitch trigger more frequently
    const intervalId = setInterval(() => {
        // Base probability 10%, scales up to 40% with urgency
        const probability = 0.1 + (urgency * 0.3);
        
        if (Math.random() < probability) {
            const chars = "0123456789!@#$%^&*?><";
            const len = displayTime.length;
            let randomized = "";
            for (let i = 0; i < len; i++) {
                if (displayTime[i] === ':' && Math.random() > 0.3) {
                    randomized += ":"; // Mostly keep colons
                } else {
                    randomized += chars[Math.floor(Math.random() * chars.length)];
                }
            }
            setGlitchText(randomized);

            // Clear glitch very quickly (50-150ms)
            setTimeout(() => {
                setGlitchText(null);
            }, 50 + Math.random() * 100);
        }
    }, 200); // Try to glitch every 200ms

    return () => clearInterval(intervalId);
  }, [isWarning, status, remainingSeconds, warningThreshold, displayTime]);

  const finalDisplayText = isFinished 
    ? '給我滾下台' 
    : (glitchText || displayTime);

  return (
    <div className={`relative flex items-center justify-center rounded-full transition-all duration-500 ${bgGlow} ${isWarning && status === TimerStatus.RUNNING ? 'animate-pulse-fast' : ''} ${isFinished ? 'animate-shake' : ''}`}>
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] overflow-visible"
      >
        {/* Background Ring */}
        <circle
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={stroke}
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        {/* Progress Ring */}
        <circle
          className={`${colorClass} transition-[stroke-dashoffset] duration-1000 ease-linear`}
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center w-[180px] text-center">
        <span className={`font-bold tracking-wider tabular-nums drop-shadow-md transition-all duration-300 ${
            isFinished ? 'text-red-500 text-4xl leading-tight' : 'text-white text-5xl font-mono'
        } ${glitchText ? 'text-amber-300' : ''}`}>
          {finalDisplayText}
        </span>
        <span className={`text-xs uppercase tracking-[0.2em] mt-2 font-semibold ${isWarning ? 'text-amber-400' : 'text-gray-400'}`}>
          {status === TimerStatus.FINISHED ? 'TIME UP' : isWarning ? 'WARNING' : 'REMAINING'}
        </span>
      </div>
    </div>
  );
};

export default Dial;