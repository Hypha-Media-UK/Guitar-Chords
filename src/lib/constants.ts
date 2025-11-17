export const METRONOME_CONFIG = {
	MIN_TEMPO: 30,
	MAX_TEMPO: 240,
	DEFAULT_TEMPO: 90,
	CLICK_FREQUENCY: 1000,
	CLICK_DURATION: 0.1
} as const;

export const PRACTICE_CONFIG = {
	COUNTDOWN_DURATION: 4,
	BEATS_PER_BAR: 4,
	MIN_PRACTICE_TIME: 60,
	BEATS_PER_CHORD_OPTIONS: [2, 4, 8, 16] as const,
	DEFAULT_BEATS_PER_CHORD: 4,
	CHANGE_WARNING_BEATS: 1, // Show warning this many beats before change
	DURATION_OPTIONS: [10, 20, 30, 50, 100] as const, // Number of bars
	DEFAULT_DURATION: 20 // Default number of bars
} as const;

export const KEYBOARD_SHORTCUTS = {
	TOGGLE_PLAY: ' ',
	NEXT_CHORD: 'ArrowRight',
	PREVIOUS_CHORD: 'ArrowLeft',
	TOGGLE_METRONOME: 'm',
	END_SESSION: 'Escape'
} as const;

