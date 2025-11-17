import type { Chord } from '$lib/data/chords';

const STORAGE_KEYS = {
	TEMPO: 'guitar-practice-tempo',
	METRONOME_ENABLED: 'guitar-practice-metronome',
	METRONOME_VOLUME: 'guitar-practice-volume',
	RANDOMIZED: 'guitar-practice-randomized',
	SELECTED_CHORDS: 'guitar-practice-selected-chords',
	BEATS_PER_CHORD: 'guitar-practice-beats-per-chord',
	PRACTICE_STATS: 'guitar-practice-stats',
	FIRST_VISIT: 'guitar-practice-first-visit',
	VISIBLE_CHORD_IDS: 'guitar-practice-visible-chords',
	PRIMARY_COLOR: 'guitar-practice-primary-color',
	PRACTICE_DURATION: 'guitar-practice-duration'
} as const;

export interface PracticeStats {
	totalSessions: number;
	totalTime: number; // in seconds
	lastPracticeDate: string;
	streak: number;
	chordsCompleted: number;
}

export const storage = {
	// Tempo
	getTempo(): number | null {
		const value = localStorage.getItem(STORAGE_KEYS.TEMPO);
		return value ? parseInt(value, 10) : null;
	},
	setTempo(tempo: number): void {
		localStorage.setItem(STORAGE_KEYS.TEMPO, tempo.toString());
	},

	// Metronome enabled
	getMetronomeEnabled(): boolean {
		const value = localStorage.getItem(STORAGE_KEYS.METRONOME_ENABLED);
		return value === 'true';
	},
	setMetronomeEnabled(enabled: boolean): void {
		localStorage.setItem(STORAGE_KEYS.METRONOME_ENABLED, enabled.toString());
	},

	// Metronome volume
	getMetronomeVolume(): number {
		const value = localStorage.getItem(STORAGE_KEYS.METRONOME_VOLUME);
		return value ? parseFloat(value) : 0.8;
	},
	setMetronomeVolume(volume: number): void {
		localStorage.setItem(STORAGE_KEYS.METRONOME_VOLUME, volume.toString());
	},

	// Randomized
	getRandomized(): boolean {
		const value = localStorage.getItem(STORAGE_KEYS.RANDOMIZED);
		return value === 'true';
	},
	setRandomized(randomized: boolean): void {
		localStorage.setItem(STORAGE_KEYS.RANDOMIZED, randomized.toString());
	},

	// Selected chords
	getSelectedChords(): number[] {
		const value = localStorage.getItem(STORAGE_KEYS.SELECTED_CHORDS);
		return value ? JSON.parse(value) : [];
	},
	setSelectedChords(chordIds: number[]): void {
		localStorage.setItem(STORAGE_KEYS.SELECTED_CHORDS, JSON.stringify(chordIds));
	},

	// Beats per chord
	getBeatsPerChord(): number {
		const value = localStorage.getItem(STORAGE_KEYS.BEATS_PER_CHORD);
		return value ? parseInt(value, 10) : 4;
	},
	setBeatsPerChord(beats: number): void {
		localStorage.setItem(STORAGE_KEYS.BEATS_PER_CHORD, beats.toString());
	},

	// Practice stats
	getStats(): PracticeStats {
		const value = localStorage.getItem(STORAGE_KEYS.PRACTICE_STATS);
		return value
			? JSON.parse(value)
			: {
					totalSessions: 0,
					totalTime: 0,
					lastPracticeDate: '',
					streak: 0,
					chordsCompleted: 0
				};
	},
	setStats(stats: PracticeStats): void {
		localStorage.setItem(STORAGE_KEYS.PRACTICE_STATS, JSON.stringify(stats));
	},

	updateStats(sessionTime: number, chordsCompleted: number): void {
		const stats = this.getStats();
		const today = new Date().toDateString();
		const lastDate = stats.lastPracticeDate;

		// Update streak
		if (lastDate) {
			const lastPracticeDate = new Date(lastDate);
			const yesterday = new Date();
			yesterday.setDate(yesterday.getDate() - 1);

			if (lastPracticeDate.toDateString() === yesterday.toDateString()) {
				stats.streak += 1;
			} else if (lastPracticeDate.toDateString() !== today) {
				stats.streak = 1;
			}
		} else {
			stats.streak = 1;
		}

		stats.totalSessions += 1;
		stats.totalTime += sessionTime;
		stats.lastPracticeDate = today;
		stats.chordsCompleted += chordsCompleted;

		this.setStats(stats);
	},

	// First visit
	isFirstVisit(): boolean {
		return !localStorage.getItem(STORAGE_KEYS.FIRST_VISIT);
	},
	setFirstVisitComplete(): void {
		localStorage.setItem(STORAGE_KEYS.FIRST_VISIT, 'true');
	},

	// Visible Chords
	getVisibleChordIds(): number[] | null {
		const stored = localStorage.getItem(STORAGE_KEYS.VISIBLE_CHORD_IDS);
		return stored ? JSON.parse(stored) : null;
	},
	setVisibleChordIds(chordIds: number[]): void {
		localStorage.setItem(STORAGE_KEYS.VISIBLE_CHORD_IDS, JSON.stringify(chordIds));
	},

	// Primary Color
	getPrimaryColor(): string | null {
		return localStorage.getItem(STORAGE_KEYS.PRIMARY_COLOR);
	},
	setPrimaryColor(color: string): void {
		localStorage.setItem(STORAGE_KEYS.PRIMARY_COLOR, color);
	},

	// Practice Duration (number of bars)
	getPracticeDuration(): number {
		const value = localStorage.getItem(STORAGE_KEYS.PRACTICE_DURATION);
		return value ? parseInt(value, 10) : 20; // Default 20 bars
	},
	setPracticeDuration(duration: number): void {
		localStorage.setItem(STORAGE_KEYS.PRACTICE_DURATION, duration.toString());
	},

	// Clear all
	clearAll(): void {
		Object.values(STORAGE_KEYS).forEach((key) => {
			localStorage.removeItem(key);
		});
	}
};

