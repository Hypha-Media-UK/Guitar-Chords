<script lang="ts">
	import { onMount } from 'svelte';
	import { animate } from 'motion';
	import type { Chord } from '$lib/data/chords';
	import { KEYBOARD_SHORTCUTS, PRACTICE_CONFIG } from '$lib/constants';
	import ChordDiagram from './ChordDiagram.svelte';

	interface Props {
		currentChord: Chord;
		currentBeat: number;
		isPaused: boolean;
		practiceChords: Array<Chord & { instanceId: number }>;
		currentChordIndex: number;
		isMetronomeEnabled: boolean;
		beatsPerChord: number;
		onPause: () => void;
		onResume: () => void;
		onEnd: () => void;
		onMetronomeToggle: () => void;
	}

	let {
		currentChord,
		currentBeat,
		isPaused,
		practiceChords,
		currentChordIndex,
		isMetronomeEnabled,
		beatsPerChord,
		onPause,
		onResume,
		onEnd,
		onMetronomeToggle
	}: Props = $props();

	let showKeyboardShortcuts = $state(false);

	const nextChord = $derived(practiceChords[(currentChordIndex + 1) % practiceChords.length]);
	const prevChord = $derived(
		practiceChords[(currentChordIndex - 1 + practiceChords.length) % practiceChords.length]
	);
	const progress = $derived(((currentChordIndex + 1) / practiceChords.length) * 100);
	const beatsRemaining = $derived(beatsPerChord - currentBeat);
	const isChangingSoon = $derived(beatsRemaining <= PRACTICE_CONFIG.CHANGE_WARNING_BEATS && beatsRemaining > 0);

	onMount(() => {
		function handleKeyPress(event: KeyboardEvent) {
			switch (event.key) {
				case KEYBOARD_SHORTCUTS.TOGGLE_PLAY:
					event.preventDefault();
					isPaused ? onResume() : onPause();
					break;
				case KEYBOARD_SHORTCUTS.TOGGLE_METRONOME:
					event.preventDefault();
					onMetronomeToggle();
					break;
				case KEYBOARD_SHORTCUTS.END_SESSION:
					event.preventDefault();
					onEnd();
					break;
			}
		}

		window.addEventListener('keydown', handleKeyPress);
		return () => window.removeEventListener('keydown', handleKeyPress);
	});
</script>

<div class="practice-session">
	<header class="header">
		<div class="header-content">
			<div class="header-left">
				<h1 class="title">Practice Session</h1>
				<button class="info-btn" onclick={() => (showKeyboardShortcuts = true)} aria-label="Show keyboard shortcuts">
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
						<path d="M10 6v4M10 14h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
					</svg>
				</button>
			</div>
			<div class="header-right">
				<span class="progress-label">Progress</span>
				<span class="progress-value">{currentChordIndex + 1} / {practiceChords.length}</span>
			</div>
		</div>
		<div class="progress-bar">
			<div class="progress-fill" style="width: {progress}%"></div>
		</div>
	</header>

	<main class="main">
		<div class="practice-view">
			<!-- Previous Chord (Desktop) -->
			<div class="chord-view prev">
				<div class="chord-info">
					<p class="chord-label">Previous</p>
					<h3 class="chord-name">{prevChord?.name}</h3>
				</div>
				<ChordDiagram diagram={prevChord?.diagram} class="chord-diagram-small" />
			</div>

			<!-- Current Chord -->
			<section class="current-chord" class:changing-soon={isChangingSoon}>
				<h2 class="chord-name-large">{currentChord?.name}</h2>
				<ChordDiagram diagram={currentChord?.diagram} class="chord-diagram-large" />
				<div class="next-mobile">
					<p class="next-label">Next:</p>
					<h3 class="next-name">{nextChord?.name}</h3>
				</div>
				{#if isChangingSoon}
					<div class="change-warning">
						<span class="warning-icon">⚠️</span>
						<span class="warning-text">Next: <strong>{nextChord?.name}</strong></span>
					</div>
				{/if}
			</section>

			<!-- Next Chord (Desktop) -->
			<div class="chord-view next">
				<div class="chord-info">
					<p class="chord-label">Next</p>
					<h3 class="chord-name">{nextChord?.name}</h3>
				</div>
				<ChordDiagram diagram={nextChord?.diagram} class="chord-diagram-small" />
			</div>
		</div>
	</main>

	<footer class="footer">
		<div class="footer-content">
			<!-- Beat Indicators -->
			<div class="beats">
				{#each Array(beatsPerChord) as _, i}
					<div class="beat" class:active={i === currentBeat} class:accent={i === 0}></div>
				{/each}
			</div>

			<!-- Beats Remaining Counter -->
			<div class="beats-remaining">
				<span class="beats-count" class:warning={isChangingSoon}>{beatsRemaining}</span>
				<span class="beats-label">until next</span>
			</div>

			<!-- Controls -->
			<div class="controls">
				<button
					class="control-btn"
					class:active={isMetronomeEnabled}
					onclick={onMetronomeToggle}
					aria-label={isMetronomeEnabled ? 'Sound On' : 'Sound Off'}
				>
					{#if isMetronomeEnabled}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M11 5L6 9H2v6h4l5 4V5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
							<path d="M15.54 8.46a5 5 0 010 7.07M19.07 4.93a10 10 0 010 14.14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					{:else}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
						</svg>
					{/if}
				</button>

				<button
					class="control-btn primary"
					onclick={isPaused ? onResume : onPause}
					aria-label={isPaused ? 'Resume' : 'Pause'}
				>
					{#if isPaused}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M5 3l14 9-14 9V3z" fill="currentColor" />
						</svg>
					{:else}
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
							<path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" />
						</svg>
					{/if}
				</button>

				<button class="control-btn" onclick={onEnd} aria-label="End Practice">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
			</div>
		</div>
	</footer>
</div>

{#if showKeyboardShortcuts}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={() => (showKeyboardShortcuts = false)}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<h3>Keyboard Shortcuts</h3>
			<div class="shortcuts">
				<div class="shortcut">
					<span>Toggle Play/Pause</span>
					<kbd>Space</kbd>
				</div>
				<div class="shortcut">
					<span>Toggle Metronome</span>
					<kbd>M</kbd>
				</div>
				<div class="shortcut">
					<span>End Session</span>
					<kbd>Esc</kbd>
				</div>
			</div>
			<button class="modal-btn" onclick={() => (showKeyboardShortcuts = false)}>Got it</button>
		</div>
	</div>
{/if}

<style>
	.practice-session {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
		background: var(--color-background);
	}

	.header {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
	}

	.header-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: var(--spacing-lg);
		max-width: 1200px;
		margin: 0 auto;
	}

	.header-left {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.title {
		font-size: var(--font-size-2xl);
		font-weight: 600;
	}

	.info-btn {
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: var(--spacing-xs);
		display: flex;
		align-items: center;
		transition: color var(--transition-fast);
	}

	.info-btn:hover {
		color: var(--color-primary);
	}

	.header-right {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.progress-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.progress-value {
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-primary);
	}

	.progress-bar {
		height: 4px;
		background: var(--color-surface-elevated);
		position: relative;
	}

	.progress-fill {
		height: 100%;
		background: var(--color-primary);
		transition: width var(--transition-base);
	}

	.main {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-xl);
	}

	.practice-view {
		display: grid;
		grid-template-columns: 1fr 2fr 1fr;
		gap: var(--spacing-2xl);
		align-items: center;
		max-width: 1200px;
		width: 100%;
	}

	.chord-view {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		opacity: 0.6;
	}

	.chord-info {
		text-align: center;
	}

	.chord-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xs);
	}

	.chord-name {
		font-size: var(--font-size-xl);
		font-weight: 600;
	}

	.current-chord {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-lg);
		transition: all var(--transition-base);
		padding-top: var(--spacing-xl);
	}

	.current-chord.changing-soon {
		animation: pulse 0.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.02);
		}
	}

	.change-warning {
		position: absolute;
		top: 0;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-lg);
		background: linear-gradient(135deg, rgba(255, 149, 0, 0.95) 0%, rgba(255, 100, 0, 0.95) 100%);
		border: 2px solid rgba(255, 200, 0, 0.8);
		border-radius: var(--radius-full);
		font-size: var(--font-size-base);
		font-weight: 600;
		color: white;
		box-shadow: 0 4px 20px rgba(255, 149, 0, 0.4), 0 0 0 4px rgba(255, 149, 0, 0.1);
		animation: slideDown 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
		z-index: 10;
		white-space: nowrap;
	}

	@keyframes slideDown {
		0% {
			opacity: 0;
			transform: translateX(-50%) translateY(-20px) scale(0.8);
		}
		100% {
			opacity: 1;
			transform: translateX(-50%) translateY(0) scale(1);
		}
	}

	.warning-icon {
		font-size: var(--font-size-lg);
		animation: bounce 0.5s ease-in-out infinite;
		filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
	}

	@keyframes bounce {
		0%, 100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-4px);
		}
	}

	.warning-text {
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
	}

	.warning-text strong {
		font-weight: 800;
		font-size: 1.1em;
		letter-spacing: 0.5px;
	}

	.chord-name-large {
		font-size: var(--font-size-4xl);
		font-weight: 700;
		color: var(--color-primary);
	}

	.next-mobile {
		display: none;
		text-align: center;
		margin-top: var(--spacing-md);
	}

	.next-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
	}

	.next-name {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-primary);
	}

	.footer {
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		padding: var(--spacing-xl);
	}

	.footer-content {
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
		align-items: center;
	}

	.beats {
		display: flex;
		gap: var(--spacing-md);
		flex-wrap: wrap;
		justify-content: center;
	}

	.beat {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: var(--color-surface-elevated);
		border: 2px solid var(--color-border);
		transition: all var(--transition-fast);
	}

	.beat.active {
		background: var(--color-primary);
		border-color: var(--color-primary);
		transform: scale(1.3);
		box-shadow: 0 0 12px rgba(0, 122, 255, 0.6);
	}

	.beat.accent.active {
		background: var(--color-success);
		border-color: var(--color-success);
		box-shadow: 0 0 12px rgba(48, 209, 88, 0.6);
	}

	.beats-remaining {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
		margin-top: var(--spacing-sm);
	}

	.beats-count {
		font-size: var(--font-size-3xl);
		font-weight: 700;
		color: var(--color-primary);
		transition: all var(--transition-fast);
	}

	.beats-count.warning {
		color: #ff9500;
	}

	.beats-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.controls {
		display: flex;
		gap: var(--spacing-md);
	}

	.control-btn {
		width: 56px;
		height: 56px;
		border-radius: 50%;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		color: var(--color-text-primary);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all var(--transition-fast);
	}

	.control-btn:hover {
		background: var(--color-surface);
		border-color: var(--color-primary);
	}

	.control-btn.primary {
		background: var(--color-primary);
		border-color: var(--color-primary);
		color: var(--color-primary-contrast);
		width: 64px;
		height: 64px;
	}

	.control-btn.primary:hover {
		background: var(--color-primary-light);
	}

	.control-btn.active {
		background: rgba(0, 122, 255, 0.1);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.modal-overlay {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn var(--transition-base);
	}

	.modal {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--spacing-xl);
		max-width: 400px;
		width: 90%;
		animation: scaleIn var(--transition-base);
	}

	.modal h3 {
		font-size: var(--font-size-xl);
		margin-bottom: var(--spacing-lg);
	}

	.shortcuts {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		margin-bottom: var(--spacing-lg);
	}

	.shortcut {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	kbd {
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-family: monospace;
		font-size: var(--font-size-sm);
	}

	.modal-btn {
		width: 100%;
		padding: var(--spacing-md);
		background: var(--color-primary);
		border: none;
		border-radius: var(--radius-md);
		color: var(--color-primary-contrast);
		font-size: var(--font-size-base);
		font-weight: 600;
		cursor: pointer;
		transition: background var(--transition-fast);
	}

	.modal-btn:hover {
		background: var(--color-primary-light);
	}

	@media (max-width: 768px) {
		.practice-view {
			grid-template-columns: 1fr;
			gap: var(--spacing-lg);
		}

		.chord-view.prev,
		.chord-view.next {
			display: none;
		}

		.next-mobile {
			display: block;
		}

		.chord-name-large {
			font-size: var(--font-size-3xl);
		}
	}
</style>

