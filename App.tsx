import React, { useState, useEffect, useCallback, useRef } from 'react';
import Dial from './components/Dial';
import ConfigPanel from './components/ConfigPanel';
import { TimerStatus, TimeConfig, AlertConfig } from './types';
import { audioService } from './services/audioService';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

const App: React.FC = () => {
  // Config State
  const [duration, setDuration] = useState<TimeConfig>({ hours: 0, minutes: 1, seconds: 0 });
  const [warningSeconds, setWarningSeconds] = useState<number>(10);
  const [alerts, setAlerts] = useState<AlertConfig[]>([
    { id: 'default-1', remainingSeconds: 30, beepCount: 1 },
    { id: 'default-2', remainingSeconds: 15, beepCount: 2 }
  ]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Timer State
  const [status, setStatus] = useState<TimerStatus>(TimerStatus.IDLE);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(60);
  const [totalSeconds, setTotalSeconds] = useState<number>(60);

  // Refs for interval
  const timerRef = useRef<number | null>(null);

  // Calculations
  const calculateTotalSeconds = useCallback(() => {
    return duration.hours * 3600 + duration.minutes * 60 + duration.seconds;
  }, [duration]);

  // Effects
  useEffect(() => {
    if (status === TimerStatus.IDLE) {
      const total = calculateTotalSeconds();
      setTotalSeconds(total);
      setRemainingSeconds(total);
    }
  }, [duration, calculateTotalSeconds, status]);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleFinish = useCallback(() => {
    setStatus(TimerStatus.FINISHED);
    stopTimer();
    if (soundEnabled) {
      // Play alarm sequence
      audioService.playAlarm();
      const interval = setInterval(() => audioService.playAlarm(), 1500);
      // Auto stop alarm after 5 seconds to not be annoying
      setTimeout(() => clearInterval(interval), 4500); 
    }
  }, [soundEnabled]);

  const tick = useCallback(() => {
    setRemainingSeconds((prev) => {
      const next = prev - 1;
      let alertPlayed = false;
      
      // 1. Check Custom Alerts
      if (soundEnabled) {
        const matchingAlert = alerts.find(a => a.remainingSeconds === next);
        if (matchingAlert) {
            audioService.playSequence(matchingAlert.beepCount);
            alertPlayed = true;
        }
      }

      // 2. Check Continuous Warning (Visual Zone)
      // Play tick sound every second during warning zone, UNLESS we just played a custom alert
      if (soundEnabled && !alertPlayed && next > 0 && next <= warningSeconds) {
        // We delay it slightly so it doesn't clash perfectly with other sounds
        setTimeout(() => audioService.playWarning(), 100); 
      }

      if (next <= 0) {
        handleFinish();
        return 0;
      }
      return next;
    });
  }, [warningSeconds, soundEnabled, handleFinish, alerts]);

  const startTimer = () => {
    if (status === TimerStatus.FINISHED || remainingSeconds === 0) {
      resetTimer(); // If starting from finished, reset first implicitly? Or just start.
      const total = calculateTotalSeconds();
       if (total === 0) return;
       setTotalSeconds(total);
       setRemainingSeconds(total);
    }
    
    // Resume or Start
    if (status !== TimerStatus.RUNNING) {
      if (remainingSeconds === 0 && status !== TimerStatus.FINISHED) {
          // Prevent starting 0 timer
           const total = calculateTotalSeconds();
           if(total === 0) return;
      }

      setStatus(TimerStatus.RUNNING);
      audioService.playTick(); // Initialize audio context on user interaction
      
      timerRef.current = window.setInterval(tick, 1000);
    }
  };

  const pauseTimer = () => {
    setStatus(TimerStatus.PAUSED);
    stopTimer();
  };

  const resetTimer = () => {
    stopTimer();
    setStatus(TimerStatus.IDLE);
    const total = calculateTotalSeconds();
    setTotalSeconds(total);
    setRemainingSeconds(total);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => stopTimer();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative font-sans text-gray-100">
      
      {/* Background Gradient Spotlights */}
      <div className={`fixed top-0 left-0 w-full h-full pointer-events-none transition-colors duration-1000 ${
        status === TimerStatus.FINISHED ? 'bg-red-900/20' : 
        remainingSeconds <= warningSeconds && status === TimerStatus.RUNNING ? 'bg-amber-900/20' : 'bg-transparent'
      }`}>
        <div className="absolute top-[-20%] left-[-20%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-20%] w-[50%] h-[50%] rounded-full bg-emerald-600/10 blur-[100px]" />
      </div>

      <header className="mb-8 z-10 text-center">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400 mb-2">
          長官!還要講多久~
        </h1>
        <p className="text-gray-500 text-sm">Focus. Warning. Action.</p>
      </header>

      <main className="z-10 flex flex-col items-center w-full max-w-5xl gap-12 md:flex-row md:justify-center md:items-start">
        
        {/* Left Side: Visual */}
        <div className="flex flex-col items-center gap-8 flex-1">
            <Dial 
                totalSeconds={totalSeconds} 
                remainingSeconds={remainingSeconds} 
                warningThreshold={warningSeconds}
                status={status}
            />

            {/* Controls */}
            <div className="flex items-center gap-4">
                {status === TimerStatus.RUNNING ? (
                     <button
                     onClick={pauseTimer}
                     className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gray-800 border border-gray-600 text-white hover:bg-gray-700 hover:border-gray-500 transition-all active:scale-95 shadow-lg shadow-black/50"
                     title="Pause"
                   >
                     <Pause size={28} className="fill-current" />
                   </button>
                ) : (
                    <button
                    onClick={startTimer}
                    className="group relative flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white hover:brightness-110 hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all active:scale-95 shadow-lg shadow-black/50"
                    title="Start"
                  >
                    <Play size={28} className="fill-current ml-1" />
                  </button>
                )}

                <button
                    onClick={resetTimer}
                    className="group flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-700 transition-all active:scale-95"
                    title="Reset"
                >
                    <RotateCcw size={20} />
                </button>

                <button 
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    className={`group flex items-center justify-center w-12 h-12 rounded-full bg-gray-800 border border-gray-700 transition-all active:scale-95 ${soundEnabled ? 'text-blue-400' : 'text-gray-600'}`}
                >
                    {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                </button>
            </div>
        </div>

        {/* Right Side: Config */}
        <div className="w-full md:w-auto flex justify-center flex-1">
            <ConfigPanel 
                duration={duration} 
                setDuration={setDuration}
                warningSeconds={warningSeconds}
                setWarningSeconds={setWarningSeconds}
                alerts={alerts}
                setAlerts={setAlerts}
                disabled={status === TimerStatus.RUNNING || status === TimerStatus.PAUSED}
            />
        </div>

      </main>

      <footer className="mt-12 text-gray-600 text-xs z-10">
        <p>Timer App © {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;