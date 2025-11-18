<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { chords, type Chord } from '$lib/data/chords';
	import { METRONOME_CONFIG, PRACTICE_CONFIG } from '$lib/constants';
	import ChordSelector from '$lib/components/ChordSelector.svelte';
	import PracticeSession from '$lib/components/PracticeSession.svelte';
	import Settings from '$lib/components/Settings.svelte';
	import Toggle from '$lib/components/Toggle.svelte';
	import { Metronome } from '$lib/utils/metronome';
	import { storage } from '$lib/utils/storage';

	interface ChordInstance extends Chord {
		instanceId: number;
	}

	let selectedChords = $state<ChordInstance[]>([]);
	let tempo = $state<number>(METRONOME_CONFIG.DEFAULT_TEMPO);
	let isMetronomeEnabled = $state(false);
	let metronomeVolume = $state(0.8);
	let isRandomized = $state(false);
	let beatsPerChord = $state<number>(PRACTICE_CONFIG.DEFAULT_BEATS_PER_CHORD);
	let practiceDuration = $state<number>(PRACTICE_CONFIG.DEFAULT_DURATION); // Number of bars
	let nextInstanceId = $state(1);
	let startCountdown = $state<number | null>(null);
	let isActive = $state(false);
	let isPaused = $state(false);
	let currentChordIndex = $state(0);
	let currentBeat = $state(0);
	let barsCompleted = $state(0);
	let sessionStartTime = $state(0);
	let showWelcome = $state(false);
	let showCompletion = $state(false);
	let currentView = $state<'home' | 'settings'>('home');
	let visibleChordIds = $state<number[]>([]);
	let primaryColor = $state<string>('#007AFF'); // Default blue
	let isLoading = $state(true);
	let showChordSelector = $state(false);
	let showPracticeSettings = $state(false);
	let showStartButton = $state(false);
	let isDrawerOpen = $state(false);

	let metronome: Metronome | null = null;
	let beatInterval: number | null = null;
	let countdownInterval: number | null = null;
	let footerElement: HTMLElement | null = $state(null);

	// Reactive values
	let practiceChords = $derived(
		isRandomized ? generateRandomSequence(selectedChords) : selectedChords
	);
	let currentChord = $derived(practiceChords[currentChordIndex]);
	let visibleChords = $derived(chords.filter((c) => visibleChordIds.includes(c.id)));

	// Load settings from localStorage on mount
	onMount(() => {
		const savedTempo = storage.getTempo();
		if (savedTempo) tempo = savedTempo;

		isMetronomeEnabled = storage.getMetronomeEnabled();
		metronomeVolume = storage.getMetronomeVolume();
		isRandomized = storage.getRandomized();
		beatsPerChord = storage.getBeatsPerChord();
		practiceDuration = storage.getPracticeDuration();

		// Load saved primary color
		const savedColor = storage.getPrimaryColor();
		if (savedColor) {
			primaryColor = savedColor;
			applyPrimaryColor(savedColor);
		}

		// Load visible chord IDs
		const savedVisibleIds = storage.getVisibleChordIds();
		if (savedVisibleIds && savedVisibleIds.length > 0) {
			visibleChordIds = savedVisibleIds;
		} else {
			// Default to A, D, E chords for first-time users (beginner-friendly)
			visibleChordIds = [1, 4, 6]; // A, D, E
			// Save the default visible chords
			storage.setVisibleChordIds(visibleChordIds);
		}

		// Load selected chords
		const savedChordIds = storage.getSelectedChords();
		if (savedChordIds.length > 0) {
			selectedChords = savedChordIds
				.map((id) => {
					const chord = chords.find((c) => c.id === id);
					if (chord) {
						return { ...chord, instanceId: nextInstanceId++ };
					}
					return null;
				})
				.filter((c): c is ChordInstance => c !== null);
		} else {
			// Default to A, D, E chords for first-time users (beginner-friendly)
			const defaultChordIds = [1, 4, 6]; // A, D, E
			selectedChords = defaultChordIds
				.map((id) => {
					const chord = chords.find((c) => c.id === id);
					if (chord) {
						return { ...chord, instanceId: nextInstanceId++ };
					}
					return null;
				})
				.filter((c): c is ChordInstance => c !== null);
			// Save the default selection
			saveSelectedChords();
		}

		// Check if first visit
		if (storage.isFirstVisit()) {
			showWelcome = true;
		}

		// Mark loading as complete and trigger sequential animations
		setTimeout(() => {
			isLoading = false;
		}, 300); // Small delay for spinner visibility

		setTimeout(() => {
			showChordSelector = true;
		}, 500);

		setTimeout(() => {
			showPracticeSettings = true;
		}, 700);

		setTimeout(() => {
			showStartButton = true;
		}, 900);

		// Update footer height CSS variable for drawer positioning
		setTimeout(() => {
			updateFooterHeight();
		}, 1000);

		// Update on window resize
		window.addEventListener('resize', updateFooterHeight);
	});

	function generateRandomSequence(chords: ChordInstance[]): ChordInstance[] {
		if (!chords.length) return [];
		const BARS = 10;
		const sequence: ChordInstance[] = [];
		for (let i = 0; i < BARS; i++) {
			const randomIndex = Math.floor(Math.random() * chords.length);
			sequence.push(chords[randomIndex]);
		}
		return sequence;
	}

	function handleChordSelect(chord: Chord) {
		selectedChords = [
			...selectedChords,
			{
				...chord,
				instanceId: nextInstanceId
			}
		];
		nextInstanceId++;
		saveSelectedChords();
	}

	function handleChordRemove(chordInstance: ChordInstance) {
		selectedChords = selectedChords.filter((c) => c.instanceId !== chordInstance.instanceId);
		saveSelectedChords();
	}

	function handleChordRemoveAll(chord: Chord) {
		selectedChords = selectedChords.filter((c) => c.id !== chord.id);
		saveSelectedChords();
	}

	function clearAllChords() {
		selectedChords = [];
		saveSelectedChords();
	}

	// Drag and drop state
	let draggedChordIndex = $state<number | null>(null);
	let dragOverIndex = $state<number | null>(null);
	let dropPosition = $state<'before' | 'after'>('after');

	function handleDragStart(event: DragEvent, index: number) {
		draggedChordIndex = index;
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = 'move';
			event.dataTransfer.setData('text/plain', index.toString());
		}
	}

	function handleDragOver(event: DragEvent, index: number) {
		event.preventDefault();
		if (event.dataTransfer) {
			event.dataTransfer.dropEffect = 'move';
		}

		// Determine if we should insert before or after based on mouse position
		const target = event.currentTarget as HTMLElement;
		const rect = target.getBoundingClientRect();
		const midpoint = rect.left + rect.width / 2;
		const mouseX = event.clientX;

		// If mouse is on the left half, insert before; otherwise insert after
		dropPosition = mouseX < midpoint ? 'before' : 'after';

		// Only update if it's a different index
		if (dragOverIndex !== index) {
			dragOverIndex = index;
		}
	}

	function handleDragLeave(event: DragEvent) {
		// Only clear if we're leaving the wrapper entirely
		const target = event.currentTarget as HTMLElement;
		const relatedTarget = event.relatedTarget as HTMLElement;

		if (!target.contains(relatedTarget)) {
			dragOverIndex = null;
		}
	}

	function handleDrop(event: DragEvent, dropIndex: number) {
		event.preventDefault();
		event.stopPropagation();

		if (draggedChordIndex === null) {
			draggedChordIndex = null;
			dragOverIndex = null;
			return;
		}

		// Calculate the actual insertion index based on drop position
		let insertIndex = dropIndex;

		// If dropping after, increment the index
		if (dropPosition === 'after') {
			insertIndex = dropIndex + 1;
		}

		// Adjust for the fact that we're removing an item first
		if (draggedChordIndex < insertIndex) {
			insertIndex--;
		}

		// Don't do anything if we're dropping in the same position
		if (draggedChordIndex === insertIndex) {
			draggedChordIndex = null;
			dragOverIndex = null;
			return;
		}

		// Reorder the chords
		const newChords = [...selectedChords];
		const [draggedChord] = newChords.splice(draggedChordIndex, 1);
		newChords.splice(insertIndex, 0, draggedChord);

		selectedChords = newChords;
		saveSelectedChords();

		// Automatically disable random mode when user manually reorders
		if (isRandomized) {
			isRandomized = false;
			storage.setRandomized(false);
		}

		draggedChordIndex = null;
		dragOverIndex = null;
	}

	function handleDragEnd() {
		draggedChordIndex = null;
		dragOverIndex = null;
	}

	function handleSaveSettings(chordIds: number[], color: string) {
		visibleChordIds = chordIds;
		primaryColor = color;
		storage.setVisibleChordIds(chordIds);
		storage.setPrimaryColor(color);
		applyPrimaryColor(color);
		currentView = 'home';
	}

	function applyPrimaryColor(color: string) {
		document.documentElement.style.setProperty('--color-primary', color);

		// Generate lighter and darker shades for hover/active states
		const rgb = hexToRgb(color);
		if (rgb) {
			// Store RGB values as CSS variable for use with rgba()
			document.documentElement.style.setProperty(
				'--color-primary-rgb',
				`${rgb.r}, ${rgb.g}, ${rgb.b}`
			);

			// Lighter shade (for hover states) - increase brightness by 15%
			const lighter = {
				r: Math.min(255, Math.round(rgb.r + (255 - rgb.r) * 0.15)),
				g: Math.min(255, Math.round(rgb.g + (255 - rgb.g) * 0.15)),
				b: Math.min(255, Math.round(rgb.b + (255 - rgb.b) * 0.15))
			};

			// Darker shade (for active states) - decrease brightness by 15%
			const darker = {
				r: Math.round(rgb.r * 0.85),
				g: Math.round(rgb.g * 0.85),
				b: Math.round(rgb.b * 0.85)
			};

			document.documentElement.style.setProperty(
				'--color-primary-light',
				`rgb(${lighter.r}, ${lighter.g}, ${lighter.b})`
			);
			document.documentElement.style.setProperty(
				'--color-primary-dark',
				`rgb(${darker.r}, ${darker.g}, ${darker.b})`
			);

			// Calculate luminance and set contrasting text color
			const luminance = calculateLuminance(rgb);
			// If color is bright (luminance > 0.5), use dark text, otherwise use white
			const contrastColor = luminance > 0.5 ? '#000000' : '#ffffff';
			document.documentElement.style.setProperty('--color-primary-contrast', contrastColor);
		}
	}

	function calculateLuminance(rgb: { r: number; g: number; b: number }): number {
		// Convert RGB to relative luminance using WCAG formula
		const rsRGB = rgb.r / 255;
		const gsRGB = rgb.g / 255;
		const bsRGB = rgb.b / 255;

		const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
		const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
		const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

		return 0.2126 * r + 0.7152 * g + 0.0722 * b;
	}

	function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
		const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result
			? {
					r: parseInt(result[1], 16),
					g: parseInt(result[2], 16),
					b: parseInt(result[3], 16)
				}
			: null;
	}

	function saveSelectedChords() {
		storage.setSelectedChords(selectedChords.map((c) => c.id));
	}

	function handleTempoChange(newTempo: number) {
		tempo = Math.max(METRONOME_CONFIG.MIN_TEMPO, Math.min(METRONOME_CONFIG.MAX_TEMPO, newTempo));
		storage.setTempo(tempo);
		if (metronome) {
			metronome.setTempo(tempo);
		}
	}

	function handleBeatsPerChordChange(beats: number) {
		beatsPerChord = beats;
		storage.setBeatsPerChord(beats);
	}

	function handleDurationChange(duration: number) {
		practiceDuration = duration;
		storage.setPracticeDuration(duration);
	}

	function handleVolumeChange(volume: number) {
		metronomeVolume = volume;
		storage.setMetronomeVolume(volume);
		if (metronome) {
			metronome.setVolume(volume);
		}
	}

	function toggleDrawer() {
		isDrawerOpen = !isDrawerOpen;
	}

	function updateFooterHeight() {
		if (footerElement) {
			const height = footerElement.offsetHeight;
			document.documentElement.style.setProperty('--footer-height', `${height}px`);
		}
	}

	function handleCompletionClose() {
		showCompletion = false;
		currentChordIndex = 0;
		currentBeat = 0;
		barsCompleted = 0;
	}

	function handleStartClick() {
		if (selectedChords.length < 2) return;
		startCountdown = 4;

		countdownInterval = window.setInterval(() => {
			if (startCountdown !== null) {
				if (startCountdown === 1) {
					startSession();
					startCountdown = null;
					if (countdownInterval) clearInterval(countdownInterval);
				} else {
					startCountdown--;
				}
			}
		}, 1000);
	}

	function startSession() {
		currentChordIndex = 0;
		currentBeat = 0;
		barsCompleted = 0;
		isPaused = false;
		isActive = true;
		sessionStartTime = Date.now();

		metronome = new Metronome(tempo, isMetronomeEnabled, metronomeVolume, beatsPerChord);
		metronome.start();

		const beatIntervalMs = (60 / tempo) * 1000;
		beatInterval = window.setInterval(() => {
			currentBeat = (currentBeat + 1) % beatsPerChord;
			if (currentBeat === 0) {
				barsCompleted++;

				// Check if practice duration is reached
				if (barsCompleted >= practiceDuration) {
					completeSession();
					return;
				}

				currentChordIndex = (currentChordIndex + 1) % practiceChords.length;
			}
		}, beatIntervalMs);
	}

	function pauseSession() {
		isPaused = true;
		if (metronome) metronome.stop();
		if (beatInterval) clearInterval(beatInterval);
	}

	function resumeSession() {
		isPaused = false;
		if (metronome) metronome.start();

		const beatIntervalMs = (60 / tempo) * 1000;
		beatInterval = window.setInterval(() => {
			currentBeat = (currentBeat + 1) % beatsPerChord;
			if (currentBeat === 0) {
				barsCompleted++;

				// Check if practice duration is reached
				if (barsCompleted >= practiceDuration) {
					completeSession();
					return;
				}

				currentChordIndex = (currentChordIndex + 1) % practiceChords.length;
			}
		}, beatIntervalMs);
	}

	function completeSession() {
		// Calculate session stats
		const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
		const chordsCompleted = barsCompleted;

		// Update stats in localStorage
		storage.updateStats(sessionDuration, chordsCompleted);

		// Clean up
		isActive = false;
		isPaused = false;
		if (metronome) {
			metronome.destroy();
			metronome = null;
		}
		if (beatInterval) {
			clearInterval(beatInterval);
			beatInterval = null;
		}

		// Show completion modal
		showCompletion = true;
	}

	function endSession() {
		// Calculate session stats
		const sessionDuration = Math.floor((Date.now() - sessionStartTime) / 1000);
		const chordsCompleted = barsCompleted;

		// Update stats in localStorage
		storage.updateStats(sessionDuration, chordsCompleted);

		isActive = false;
		isPaused = false;
		currentChordIndex = 0;
		currentBeat = 0;
		barsCompleted = 0;
		if (metronome) {
			metronome.destroy();
			metronome = null;
		}
		if (beatInterval) {
			clearInterval(beatInterval);
			beatInterval = null;
		}
	}

	function toggleMetronome() {
		isMetronomeEnabled = !isMetronomeEnabled;
		storage.setMetronomeEnabled(isMetronomeEnabled);
		if (metronome) {
			metronome.setEnabled(isMetronomeEnabled);
		}
	}

	function toggleRandomized() {
		isRandomized = !isRandomized;
		storage.setRandomized(isRandomized);
	}

	function closeWelcome() {
		showWelcome = false;
		storage.setFirstVisitComplete();
	}

	onDestroy(() => {
		if (metronome) metronome.destroy();
		if (beatInterval) clearInterval(beatInterval);
		if (countdownInterval) clearInterval(countdownInterval);
		window.removeEventListener('resize', updateFooterHeight);
	});
</script>

<svelte:head>
	<title>Guitar Practice</title>
</svelte:head>

{#if isActive}
	<PracticeSession
		{currentChord}
		{currentBeat}
		{isPaused}
		practiceChords={practiceChords}
		{currentChordIndex}
		{isMetronomeEnabled}
		{beatsPerChord}
		onPause={pauseSession}
		onResume={resumeSession}
		onEnd={endSession}
		onMetronomeToggle={toggleMetronome}
	/>
{:else}
	<!-- Settings Screen -->
	{#if currentView === 'settings'}
		<Settings
			{visibleChordIds}
			{primaryColor}
			onClose={() => (currentView = 'home')}
			onSave={handleSaveSettings}
		/>
	{:else}
		<!-- Home Screen -->
		<div class="app">
			<nav class="app-nav">
			<div class="app-nav__content">
				<div class="app-nav__logo">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="app-nav__icon">
						<path
							d="M9 18V5l12-2v13M9 18c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3zm12-2c0 1.657-1.343 3-3 3s-3-1.343-3-3 1.343-3 3-3 3 1.343 3 3z"
							stroke="currentColor"
							stroke-width="2"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
					<h1 class="app-nav__title">Guitar Practice</h1>
				</div>
				<button class="settings-btn" onclick={() => (currentView = 'settings')} aria-label="Settings">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path
							d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
						<path
							d="M16.25 12.5a1.25 1.25 0 00.25.85l.05.05a1.515 1.515 0 010 2.15 1.515 1.515 0 01-2.15 0l-.05-.05a1.25 1.25 0 00-.85-.25 1.25 1.25 0 00-1.25 1.25v.15a1.5 1.5 0 01-3 0v-.08a1.25 1.25 0 00-.82-1.17 1.25 1.25 0 00-.85.25l-.05.05a1.515 1.515 0 01-2.15 0 1.515 1.515 0 010-2.15l.05-.05a1.25 1.25 0 00.25-.85 1.25 1.25 0 00-1.25-1.25h-.15a1.5 1.5 0 010-3h.08a1.25 1.25 0 001.17-.82 1.25 1.25 0 00-.25-.85l-.05-.05a1.515 1.515 0 010-2.15 1.515 1.515 0 012.15 0l.05.05a1.25 1.25 0 00.85.25h.06a1.25 1.25 0 001.25-1.25v-.15a1.5 1.5 0 013 0v.08a1.25 1.25 0 001.25 1.17h.06a1.25 1.25 0 00.85-.25l.05-.05a1.515 1.515 0 012.15 0 1.515 1.515 0 010 2.15l-.05.05a1.25 1.25 0 00-.25.85v.06a1.25 1.25 0 001.25 1.25h.15a1.5 1.5 0 010 3h-.08a1.25 1.25 0 00-1.17 1.25z"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						/>
					</svg>
				</button>
			</div>
		</nav>

		<main class="app-main">
			<div class="app-main__content">

				{#if isLoading}
					<!-- Loading Spinner -->
					<div class="loading-container">
						<div class="spinner"></div>
						<p class="loading-text">Loading your chords...</p>
					</div>
				{:else}
					{#if showChordSelector}
						<div class="fade-in">
							<ChordSelector
								availableChords={visibleChords}
								{selectedChords}
								onChordSelect={handleChordSelect}
								onChordRemove={handleChordRemoveAll}
								onAddMoreClick={() => (currentView = 'settings')}
							/>

							<!-- Selected Chords Section -->
							{#if selectedChords.length > 0}
								<div class="selected-chords-section">
									<h3 class="selected-chords-title">Selected Chords ({selectedChords.length})</h3>

									<div class="chord-selector__selected-chords">
										{#each selectedChords as chord, index (chord.instanceId)}
											<div
												class="selected-chord-wrapper"
												class:dragging={draggedChordIndex === index}
												class:drag-over={dragOverIndex === index}
												class:drop-after={dragOverIndex === index && dropPosition === 'after'}
												ondragover={(e) => handleDragOver(e, index)}
												ondragleave={(e) => handleDragLeave(e)}
												ondrop={(e) => handleDrop(e, index)}
								role="listitem"
											>
												<!-- Delete button with trash can icon -->
												<button
													onclick={() => handleChordRemove(chord)}
													class="delete-chord-btn"
													aria-label="Remove {chord.name}"
												>
													<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
														<path
															d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z"
															stroke="currentColor"
															stroke-width="1.5"
															stroke-linecap="round"
															stroke-linejoin="round"
														/>
													</svg>
												</button>

												<!-- Chord name pill (draggable area) -->
												<div
													class="selected-chord-pill"
													draggable="true"
													ondragstart={(e) => handleDragStart(e, index)}
													ondragend={handleDragEnd}
													role="button"
													tabindex="0"
												>
													<span class="chord-name">{chord.name}</span>

													<!-- Drag handle icon -->
													<div class="drag-handle" aria-label="Drag to reorder">
														<svg width="12" height="16" viewBox="0 0 12 16" fill="none">
															<circle cx="3" cy="4" r="1.5" fill="currentColor" />
															<circle cx="9" cy="4" r="1.5" fill="currentColor" />
															<circle cx="3" cy="8" r="1.5" fill="currentColor" />
															<circle cx="9" cy="8" r="1.5" fill="currentColor" />
															<circle cx="3" cy="12" r="1.5" fill="currentColor" />
															<circle cx="9" cy="12" r="1.5" fill="currentColor" />
														</svg>
													</div>
												</div>
											</div>
										{/each}
									</div>

									{#if selectedChords.length > 1}
										<p class="drag-hint">💡 Drag chords to reorder • Random mode will be disabled</p>
									{/if}
								</div>
							{:else}
								<div class="selected-chords-prompt">
									<p>Select chords above to get started...</p>
								</div>
							{/if}
						</div>
					{/if}
				{/if}
			</div>
		</main>

		<!-- Practice Session Drawer -->
		{#if showPracticeSettings}
			<!-- Session summary tab (floating above footer) -->
			<button
				class="settings-tab"
				class:open={isDrawerOpen}
				onclick={toggleDrawer}
				aria-label="Toggle practice session settings"
			>
				<span class="settings-tab-label">Session</span>
				<span class="settings-tab-summary">
					{tempo} BPM · {beatsPerChord} beats · {practiceDuration} bars
					{#if isMetronomeEnabled}
						· metronome
					{/if}
					{#if isRandomized}
						· random
					{/if}
				</span>
			</button>

			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="settings-drawer" class:open={isDrawerOpen} onclick={(e) => e.stopPropagation()}>
				<div class="drawer-handle" onclick={toggleDrawer}>
					<div class="drawer-handle-bar"></div>
				</div>
				<div class="drawer-content">
					<h2 class="drawer-title">Practice Settings</h2>

					<div class="drawer-settings-grid">
						<!-- Tempo Control -->
						<div class="setting-group">
							<label class="setting-label" for="tempo-input">Tempo (BPM)</label>
							<div class="tempo-control">
								<button
									onclick={() => handleTempoChange(tempo - 5)}
									class="tempo-btn"
									aria-label="Decrease tempo"
								>
									-
								</button>
								<input
									id="tempo-input"
									type="number"
									min={METRONOME_CONFIG.MIN_TEMPO}
									max={METRONOME_CONFIG.MAX_TEMPO}
									value={tempo}
									oninput={(e) => handleTempoChange(Number(e.currentTarget.value))}
									class="tempo-input"
									aria-label="Tempo"
								/>
								<button
									onclick={() => handleTempoChange(tempo + 5)}
									class="tempo-btn"
									aria-label="Increase tempo"
								>
									+
								</button>
							</div>
						</div>

						<!-- Beats Per Chord -->
						<div class="setting-group">
							<span class="setting-label">Beats Per Chord</span>
							<div class="beats-selector">
								{#each PRACTICE_CONFIG.BEATS_PER_CHORD_OPTIONS as option}
									<button
										class="beats-btn"
										class:active={beatsPerChord === option}
										onclick={() => handleBeatsPerChordChange(option)}
									>
										{option}
									</button>
								{/each}
							</div>
						</div>

						<!-- Practice Duration -->
						<div class="setting-group">
							<span class="setting-label">Practice Duration (Bars)</span>
							<div class="beats-selector">
								{#each PRACTICE_CONFIG.DURATION_OPTIONS as option}
									<button
										class="beats-btn"
										class:active={practiceDuration === option}
										onclick={() => handleDurationChange(option)}
									>
										{option}
									</button>
								{/each}
							</div>
						</div>
					</div>

					<div class="practice-options">
						<Toggle
							isOn={isMetronomeEnabled}
							onToggle={toggleMetronome}
							label="Metronome"
						/>

						<Toggle
							isOn={isRandomized}
							onToggle={toggleRandomized}
							label="Random order"
						/>

						<!-- Volume Control -->
						{#if isMetronomeEnabled}
							<div class="volume-control">
								<label class="volume-label" for="volume-input">
									Volume: {Math.round(metronomeVolume * 100)}%
								</label>
								<input
									id="volume-input"
									type="range"
									min="0"
									max="1"
									step="0.1"
									value={metronomeVolume}
									oninput={(e) => handleVolumeChange(Number(e.currentTarget.value))}
									class="volume-slider"
								/>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/if}

		{#if showStartButton}
			<footer class="app-footer fade-in" bind:this={footerElement}>
				<div class="app-footer__content">
					<button
						onclick={handleStartClick}
						disabled={selectedChords.length < 2 || startCountdown !== null}
						class="start-button"
						class:disabled={selectedChords.length < 2 || startCountdown !== null}
						aria-label={startCountdown ? `Starting in ${startCountdown}` : 'Start Practice'}
					>
						{#if startCountdown === null}
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="start-icon">
								<path d="M5 3l14 9-14 9V3z" fill="currentColor" />
							</svg>
							<span>Start Practice</span>
						{:else}
							<span class="countdown">{startCountdown}</span>
						{/if}
					</button>
				</div>
			</footer>
		{/if}
	</div>

	<!-- Welcome Modal for First-Time Users -->
	{#if showWelcome}
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal-overlay" onclick={closeWelcome}>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="welcome-modal" onclick={(e) => e.stopPropagation()}>
				<div class="welcome-header">
					<h2>🎸 Welcome to Guitar Practice!</h2>
				</div>
				<div class="welcome-body">
					<p class="welcome-intro">Perfect for beginners learning chord transitions!</p>

					<div class="welcome-steps">
						<div class="welcome-step">
							<span class="step-number">1</span>
							<div class="step-content">
								<h3>Choose Chords</h3>
								<p>Pick the chords you want to practice</p>
							</div>
						</div>
						<div class="welcome-step">
							<span class="step-number">2</span>
							<div class="step-content">
								<h3>Adjust Settings</h3>
								<p>Set your tempo and beats per chord</p>
							</div>
						</div>
						<div class="welcome-step">
							<span class="step-number">3</span>
							<div class="step-content">
								<h3>Start Practicing!</h3>
								<p>Hit the start button and follow along</p>
							</div>
						</div>
					</div>

					<div class="welcome-tip">
						<strong>💡 Tip:</strong> Start with 2-3 chords at 60 BPM!
					</div>
				</div>
				<button class="welcome-btn" onclick={closeWelcome}>Let's Go!</button>
			</div>
		</div>
	{/if}

	<!-- Completion Modal -->
	{#if showCompletion}
		<div class="modal-overlay">
			<div class="completion-modal">
				<div class="completion-icon">
					<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
						<circle cx="40" cy="40" r="38" stroke="var(--color-primary)" stroke-width="4" fill="rgba(var(--color-primary-rgb), 0.1)" />
						<path d="M25 40L35 50L55 30" stroke="var(--color-primary)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
				<h2 class="completion-title">Practice Complete! 🎉</h2>
				<p class="completion-message">
					Great job! You completed <strong>{barsCompleted} bars</strong> of practice.
				</p>
				<div class="completion-stats">
					<div class="stat-item">
						<span class="stat-value">{Math.floor((Date.now() - sessionStartTime) / 60000)}:{String(Math.floor(((Date.now() - sessionStartTime) % 60000) / 1000)).padStart(2, '0')}</span>
						<span class="stat-label">Time</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{tempo}</span>
						<span class="stat-label">BPM</span>
					</div>
					<div class="stat-item">
						<span class="stat-value">{selectedChords.length}</span>
						<span class="stat-label">Chords</span>
					</div>
				</div>
				<button class="completion-btn" onclick={handleCompletionClose}>
					Back to Start
				</button>
			</div>
		</div>
	{/if}
	{/if}
{/if}

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--color-background);
	}

	.app-nav {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		position: sticky;
		top: 0;
		z-index: 100;
	}

	.app-nav__content {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing-lg);
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.app-nav__logo {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.settings-btn {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-sm);
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.settings-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.app-nav__icon {
		color: var(--color-primary);
	}

	.app-nav__title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text-primary);
		letter-spacing: 0.02em;
	}

	.app-main {
		flex: 1;
		overflow-y: auto;
	}

	.app-main__content {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing-xl);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}


	/* Practice session drawer - sheet that slides up above the footer */
	.settings-drawer {
		position: fixed;
		left: 0;
		right: 0;
		bottom: var(--footer-height, 0px);
		background: var(--color-surface-elevated);
		border-radius: var(--radius-xl) var(--radius-xl) 0 0;
		max-height: 70vh;
		overflow-y: auto;
		transform: translateY(100%);
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		z-index: 98; /* Below footer (z:100) */
		box-shadow: 0 -8px 24px rgba(0, 0, 0, 0.4);
	}

	.settings-drawer.open {
		transform: translateY(0);
	}

	/* Session summary tab - floating above footer */
	.settings-tab {
		position: fixed;
		left: 50%;
		bottom: calc(var(--footer-height, 0px) + env(safe-area-inset-bottom) + var(--spacing-sm));
		transform: translateX(-50%);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		height: 36px;
		padding: 0 var(--spacing-lg);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: 999px;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
		z-index: 101;
		font-size: var(--font-size-xs);
	}

	.settings-tab.open {
		background: var(--color-surface);
		color: var(--color-text-primary);
	}

	.settings-tab-label {
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.settings-tab-summary {
		color: var(--color-text-secondary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.settings-tab:hover {
		background: var(--color-surface);
		color: var(--color-text-primary);
	}

	.drawer-handle {
		padding: var(--spacing-md);
		display: flex;
		justify-content: center;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
	}

	.drawer-handle-bar {
		width: 40px;
		height: 4px;
		background: var(--color-border);
		border-radius: var(--radius-full);
		transition: background var(--transition-fast);
	}

	.drawer-handle:hover .drawer-handle-bar {
		background: var(--color-text-secondary);
	}

	.drawer-content {
		padding: 0 var(--spacing-xl) var(--spacing-xl);
		padding-bottom: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
	}

	.drawer-title {
		font-size: var(--font-size-lg);
		font-weight: 600;
		margin-bottom: var(--spacing-md);
		color: var(--color-text-primary);
	}

	.drawer-settings-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-md);
	}

	.setting-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.setting-label {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.tempo-control {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.tempo-btn {
		width: 40px;
		height: 40px;
		border-radius: var(--radius-md);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		font-size: var(--font-size-xl);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.tempo-btn:hover {
		background: var(--color-surface);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.tempo-input {
		flex: 1;
		padding: var(--spacing-md);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-lg);
		font-weight: 600;
		text-align: center;
		transition: all var(--transition-fast);
	}

	.tempo-input:focus {
		outline: none;
		border-color: var(--color-primary);
	}

	.beats-selector {
		display: flex;
		gap: var(--spacing-sm);
	}

	.beats-btn {
		flex: 1;
		padding: var(--spacing-md);
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-base);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.beats-btn:hover {
		background: var(--color-surface);
		border-color: var(--color-primary);
	}

	.beats-btn.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-primary-contrast);
	}

	.volume-slider {
		width: 100%;
		height: 6px;
		border-radius: var(--radius-full);
		background: var(--color-surface-elevated);
		outline: none;
		-webkit-appearance: none;
		appearance: none;
	}

	.volume-slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.volume-slider::-webkit-slider-thumb:hover {
		transform: scale(1.2);
	}

	.volume-slider::-moz-range-thumb {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--color-primary);
		cursor: pointer;
		border: none;
		transition: all var(--transition-fast);
	}

	.volume-slider::-moz-range-thumb:hover {
		transform: scale(1.2);
	}

	.practice-options {
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		padding-top: var(--spacing-md);
	}

	.volume-control {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		flex: 1;
		max-width: 300px;
	}

	.volume-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		white-space: nowrap;
		min-width: 80px;
	}

	.app-footer {
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		position: sticky;
		bottom: 0;
		z-index: 100;
	}

	.app-footer__content {
		max-width: 1200px;
		margin: 0 auto;
		padding: var(--spacing-xl) var(--spacing-lg);
		padding-bottom: calc(var(--spacing-xl) + env(safe-area-inset-bottom));
		display: flex;
		justify-content: center;
		align-items: center;
	}


	.chord-selector__selected-chords {
		display: flex;
		flex-wrap: wrap;
		gap: var(--spacing-sm);
		align-items: center;
	}

	.selected-chord-wrapper {
		animation: scaleIn var(--transition-base);
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		transition: all var(--transition-fast);
		position: relative;
		padding: 2px;
		flex: 1 1 260px;
		max-width: 100%;
	}

	.selected-chord-wrapper.dragging {
		opacity: 0.6;
		transform: scale(0.97);
	}

	.selected-chord-wrapper.drag-over {
		background: rgba(var(--color-primary-rgb), 0.08);
		border-radius: var(--radius-full);
	}

	/* Visual indicator for drop position */
	.selected-chord-wrapper.drag-over::before {
		content: '';
		position: absolute;
		top: 0;
		bottom: 0;
		width: 3px;
		background: var(--color-primary);
		border-radius: var(--radius-sm);
		left: -6px;
	}

	.selected-chord-wrapper.drag-over.drop-after::before {
		left: auto;
		right: -6px;
	}

	/* Delete button (trash can icon on the left) */
	.delete-chord-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-sm);
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.delete-chord-btn:hover {
		background: rgba(255, 59, 48, 0.1);
		color: #ff3b30;
	}

	/* Chord pill (draggable area) */
	.selected-chord-pill {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-xl);
		background: var(--color-primary);
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-lg);
		color: var(--color-primary-contrast);
		font-size: var(--font-size-base);
		font-weight: 600;
		cursor: grab;
		transition: all var(--transition-fast);
		user-select: none;
		box-shadow: 0 4px 12px rgba(0, 122, 255, 0.35);
	}

	.selected-chord-pill:hover {
		background: var(--color-primary-light);
		transform: translateY(-2px);
	}

	.selected-chord-pill:active {
		cursor: grabbing;
	}

	.chord-name {
		flex: 1;
	}

	/* Drag handle (6 dots on the right inside the pill) */
	.drag-handle {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--color-primary-contrast);
		opacity: 0.9;
		transition: opacity var(--transition-fast);
		padding: 0 var(--spacing-xs);
		cursor: grab;
		flex-shrink: 0;
	}

	.selected-chord-pill:hover .drag-handle {
		opacity: 1;
	}

	.selected-chord-pill:active .drag-handle {
		cursor: grabbing;
	}


	/* Selected Chords Section in Main Area */
	.selected-chords-section {
		margin-top: var(--spacing-2xl);
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--color-border);
		background: transparent;
		border-radius: 0;
	}

	.selected-chords-title {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.16em;
		margin-bottom: var(--spacing-lg);
		text-align: center;
	}

	.selected-chords-prompt {
		margin-top: var(--spacing-xl);
		text-align: center;
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		font-style: italic;
		background: transparent;
		border: none;
		padding: 0;
	}

	.drag-hint {
		color: var(--color-primary-contrast);
		font-size: var(--font-size-xs);
		text-align: center;
		margin-top: var(--spacing-md);
		padding: var(--spacing-xs) var(--spacing-md);
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		background: rgba(var(--color-primary-rgb), 0.35);
		border-radius: 999px;
		line-height: 1.4;
		margin-left: auto;
		margin-right: auto;
	}

	.start-button {
		width: 100%;
		padding: var(--spacing-lg);
		background: var(--color-primary);
		border: none;
		border-radius: var(--radius-lg);
		color: var(--color-primary-contrast);
		font-size: var(--font-size-lg);
		font-weight: 700;
		cursor: pointer;
		transition: all var(--transition-base);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-md);
	}

	.start-button:hover:not(.disabled) {
		background: var(--color-primary-light);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 122, 255, 0.3);
	}

	.start-button.disabled {
		background: var(--color-surface-elevated);
		color: var(--color-text-secondary);
		cursor: not-allowed;
	}

	.start-icon {
		width: 24px;
		height: 24px;
	}

	.countdown {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		animation: pulse 1s infinite;
	}

	/* Welcome Modal */
	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.9);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		animation: fadeIn var(--transition-base);
		padding: var(--spacing-lg);
	}

	.welcome-modal {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--spacing-2xl);
		max-width: 500px;
		width: 100%;
		animation: scaleIn var(--transition-base);
		border: 1px solid var(--color-border);
	}

	.welcome-header h2 {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		margin-bottom: var(--spacing-lg);
		text-align: center;
	}

	.welcome-intro {
		text-align: center;
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
	}

	.welcome-steps {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		margin-bottom: var(--spacing-xl);
	}

	.welcome-step {
		display: flex;
		gap: var(--spacing-md);
		align-items: flex-start;
	}

	.step-number {
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-primary);
		color: var(--color-primary-contrast);
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 700;
		flex-shrink: 0;
	}

	.step-content h3 {
		font-size: var(--font-size-base);
		font-weight: 600;
		margin-bottom: var(--spacing-xs);
	}

	.step-content p {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.welcome-tip {
		background: rgba(0, 122, 255, 0.1);
		border: 1px solid var(--color-primary);
		border-radius: var(--radius-md);
		padding: var(--spacing-md);
		font-size: var(--font-size-sm);
		margin-bottom: var(--spacing-lg);
	}

	.welcome-btn {
		width: 100%;
		padding: var(--spacing-lg);
		background: var(--color-primary);
		border: none;
		border-radius: var(--radius-lg);
		color: var(--color-primary-contrast);
		font-size: var(--font-size-lg);
		font-weight: 700;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.welcome-btn:hover {
		background: var(--color-primary-light);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(0, 122, 255, 0.3);
	}

	/* Completion Modal */
	.completion-modal {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--spacing-2xl);
		max-width: 500px;
		width: 100%;
		animation: scaleIn var(--transition-base);
		text-align: center;
	}

	.completion-icon {
		margin-bottom: var(--spacing-lg);
		display: flex;
		justify-content: center;
	}

	.completion-title {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text-primary);
		margin-bottom: var(--spacing-md);
	}

	.completion-message {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
		line-height: 1.6;
	}

	.completion-message strong {
		color: var(--color-primary);
		font-weight: 700;
	}

	.completion-stats {
		display: flex;
		gap: var(--spacing-lg);
		justify-content: center;
		margin-bottom: var(--spacing-xl);
		padding: var(--spacing-lg);
		background: var(--color-surface-elevated);
		border-radius: var(--radius-lg);
	}

	.stat-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.stat-value {
		font-size: var(--font-size-xl);
		font-weight: 700;
		color: var(--color-primary);
	}

	.stat-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.completion-btn {
		width: 100%;
		padding: var(--spacing-lg);
		background: var(--color-primary);
		border: none;
		border-radius: var(--radius-lg);
		color: var(--color-primary-contrast);
		font-size: var(--font-size-lg);
		font-weight: 700;
		cursor: pointer;
		transition: all var(--transition-base);
	}

	.completion-btn:hover {
		background: var(--color-primary-light);
		transform: translateY(-2px);
		box-shadow: 0 8px 16px rgba(var(--color-primary-rgb), 0.3);
	}

	/* Loading Spinner */
	.loading-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		gap: var(--spacing-lg);
	}

	.spinner {
		width: 48px;
		height: 48px;
		border: 4px solid rgba(var(--color-primary-rgb), 0.2);
		border-top-color: var(--color-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.loading-text {
		color: var(--color-text-secondary);
		font-size: var(--font-size-base);
		font-weight: 500;
	}

	/* Fade-in Animation */
	.fade-in {
		animation: fadeIn 0.5s ease-in-out;
	}

	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

		/* Home start screen refinements */
		.app-main__content {
			max-width: 1200px;
			margin: 0 auto;
			padding: var(--spacing-xl);
			display: flex;
			flex-direction: column;
			gap: var(--spacing-2xl);
		}

	@media (max-width: 768px) {
		.app-nav__content {
			padding: var(--spacing-md);
			justify-content: center;
		}

		.app-nav__logo {
			flex: 1;
			justify-content: center;
		}

		.settings-btn {
			position: absolute;
			right: var(--spacing-md);
		}

		.app-nav__title {
			font-size: var(--font-size-xl);
		}

		.app-main__content {
			padding: var(--spacing-md);
			padding-bottom: var(--spacing-sm);
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.practice-options {
			flex-direction: column;
			align-items: stretch;
			gap: var(--spacing-md);
		}

		.volume-control {
			max-width: 100%;
		}

		/* Drawer mobile styles */
		.drawer-content {
			padding: 0 var(--spacing-md) var(--spacing-md);
			padding-bottom: calc(var(--spacing-md) + env(safe-area-inset-bottom));
		}

		.drawer-title {
			font-size: var(--font-size-lg);
			margin-bottom: var(--spacing-md);
			text-align: center;
		}

		.settings-tab-summary {
			display: none;
		}

		.drawer-settings-grid {
			grid-template-columns: 1fr;
			gap: var(--spacing-md);
		}

		.setting-group {
			align-items: center;
			text-align: center;
		}

		.setting-label {
			text-align: center;
		}

		.tempo-control {
			justify-content: center;
		}

		.beats-selector {
			justify-content: center;
		}

		.practice-options {
			align-items: center;
		}

		.settings-drawer {
			max-height: 80vh;
		}

		.tempo-btn {
			width: 36px;
			height: 36px;
		}

		.tempo-input {
			padding: var(--spacing-sm);
			font-size: var(--font-size-base);
		}

		/* Compact footer for mobile */
		.app-footer__content {
			padding: var(--spacing-lg) var(--spacing-md);
			padding-bottom: calc(var(--spacing-lg) + env(safe-area-inset-bottom));
		}

		.selected-chords-section {
			margin-top: var(--spacing-md);
			padding: var(--spacing-md);
			width: 100%;
			max-width: 100%;
		}

		.selected-chords-title {
			font-size: var(--font-size-base);
		}

		.chord-selector__selected-chords {
			justify-content: center;
		}

		.selected-chords-prompt {
			margin-top: var(--spacing-md);
			padding: var(--spacing-md);
		}

		.drag-hint {
			text-align: center;
		}

		.settings-tab {
			padding: var(--spacing-xs) var(--spacing-md);
			font-size: var(--font-size-xs);
		}

		.settings-tab span {
			display: none;
		}


		.selected-chord-pill {
			padding: var(--spacing-xs) var(--spacing-sm);
			font-size: var(--font-size-sm);
		}

		.delete-chord-btn {
			padding: var(--spacing-xs);
		}

		.delete-chord-btn svg {
			width: 16px;
			height: 16px;
		}

		.drag-handle svg {
			width: 14px;
			height: 14px;
		}

		.drag-hint {
			font-size: 0.625rem;
			padding: var(--spacing-xs);
			margin-top: var(--spacing-sm);
		}

		.start-button {
			padding: var(--spacing-md);
			font-size: var(--font-size-base);
		}

		.welcome-modal {
			padding: var(--spacing-lg);
			max-width: 95%;
		}

		.welcome-header h2 {
			font-size: var(--font-size-xl);
		}

		.completion-modal {
			padding: var(--spacing-lg);
		}

		.completion-title {
			font-size: var(--font-size-xl);
		}

		.completion-stats {
			flex-direction: column;
			gap: var(--spacing-md);
		}

	}
</style>

