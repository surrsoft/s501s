export type TimeOfDayId = 'day' | 'sunset' | 'night';

export interface TimeColors {
  skyTopOverride?: string;
  skyBottomOverride?: string;
  ambientAlpha: number;   // 0 = no tint, 0.4 = strong tint
  ambientColor: string;
  starsVisible: boolean;
  moonVisible: boolean;
  sunVisible: boolean;
}

export const TIME_OF_DAY: Record<TimeOfDayId, TimeColors> = {
  day: {
    ambientAlpha: 0,
    ambientColor: 'transparent',
    starsVisible: false,
    moonVisible: false,
    sunVisible: true,
  },
  sunset: {
    skyTopOverride: '#ff6b35',
    skyBottomOverride: '#ffb347',
    ambientAlpha: 0.15,
    ambientColor: '#ff6600',
    starsVisible: false,
    moonVisible: false,
    sunVisible: true,
  },
  night: {
    skyTopOverride: '#0a0a1a',
    skyBottomOverride: '#1a1a3e',
    ambientAlpha: 0.55,
    ambientColor: '#000022',
    starsVisible: true,
    moonVisible: true,
    sunVisible: false,
  },
};

// Durations in ms for auto cycling
export const TIME_CYCLE_MS = 2 * 60 * 1000; // 2 min per phase
export const TIME_ORDER: TimeOfDayId[] = ['day', 'sunset', 'night'];
