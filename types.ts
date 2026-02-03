export enum TimerStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED',
}

export interface TimeConfig {
  hours: number;
  minutes: number;
  seconds: number;
}

export interface AlertConfig {
  id: string;
  remainingSeconds: number;
  beepCount: number;
}

export interface TimerState {
  totalSeconds: number;
  remainingSeconds: number;
  warningThresholdSeconds: number;
  status: TimerStatus;
}