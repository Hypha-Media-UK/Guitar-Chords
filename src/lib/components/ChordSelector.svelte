<script lang="ts">
	import { animate } from 'motion';
	import type { Chord } from '$lib/data/chords';
	import ChordDiagram from './ChordDiagram.svelte';

	interface Props {
		availableChords: Chord[];
		selectedChords: Array<Chord & { instanceId: number }>;
		onChordSelect: (chord: Chord) => void;
		onChordRemove?: (chord: Chord) => void;
		onAddMoreClick?: () => void;
	}

	let { availableChords, selectedChords, onChordSelect, onChordRemove, onAddMoreClick }: Props = $props();

	let previewChord = $state<Chord | null>(null);
	let confirmDeleteChord = $state<Chord | null>(null);

	function handleChordClick(chord: Chord) {
		onChordSelect(chord);
	}

	function handlePreviewClick(chord: Chord) {
		previewChord = chord;
	}

	function closePreview() {
		previewChord = null;
	}

	function handleRemoveClick(chord: Chord) {
		confirmDeleteChord = chord;
	}

	function confirmDelete() {
		if (confirmDeleteChord && onChordRemove) {
			onChordRemove(confirmDeleteChord);
		}
		confirmDeleteChord = null;
	}

	function cancelDelete() {
		confirmDeleteChord = null;
	}

	function isSelected(chord: Chord) {
		return selectedChords.some((selected) => selected.id === chord.id);
	}
</script>

<div class="chord-selector">
	<h2 class="title">Your Chords</h2>
	<div class="grid">
		{#each availableChords as chord (chord.id)}
			<div class="chord-item">
				<button
					class="chord-btn"
					class:selected={isSelected(chord)}
					onclick={() => handleChordClick(chord)}
				>
					{chord.name}
				</button>
				<div class="chord-actions">
					<button class="action-btn preview-btn" onclick={() => handlePreviewClick(chord)} aria-label="Preview {chord.name}">
						<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
							<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.5" />
							<path d="M14 14l-3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
					</button>
					{#if onChordRemove}
						<button class="action-btn delete-btn" onclick={() => handleRemoveClick(chord)} aria-label="Remove {chord.name}">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
								<path d="M2 4h12M5.333 4V2.667a1.333 1.333 0 011.334-1.334h2.666a1.333 1.333 0 011.334 1.334V4m2 0v9.333a1.333 1.333 0 01-1.334 1.334H4.667a1.333 1.333 0 01-1.334-1.334V4h9.334z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
							</svg>
						</button>
					{/if}
				</div>
			</div>
		{/each}

		<!-- Add More Button -->
		{#if onAddMoreClick}
			<div class="chord-item add-more-item">
				<button class="add-more-btn" onclick={onAddMoreClick}>
					<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
						<path d="M10 4v12M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					</svg>
					<span>Add More From Library</span>
				</button>
			</div>
		{/if}
	</div>
</div>

{#if previewChord}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={closePreview}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="modal" onclick={(e) => e.stopPropagation()}>
			<div class="modal-header">
				<h3>{previewChord.name} Chord</h3>
				<button class="close-btn" onclick={closePreview} aria-label="Close">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
					</svg>
				</button>
			</div>
			<div class="modal-body">
				<ChordDiagram diagram={previewChord.diagram} />
			</div>
		</div>
	</div>
{/if}

{#if confirmDeleteChord}
	<!-- svelte-ignore a11y_click_events_have_key_events -->
	<!-- svelte-ignore a11y_no_static_element_interactions -->
	<div class="modal-overlay" onclick={cancelDelete}>
		<!-- svelte-ignore a11y_click_events_have_key_events -->
		<!-- svelte-ignore a11y_no_static_element_interactions -->
		<div class="confirm-modal" onclick={(e) => e.stopPropagation()}>
			<div class="confirm-icon">
				<svg width="48" height="48" viewBox="0 0 48 48" fill="none">
					<circle cx="24" cy="24" r="22" stroke="#ff3b30" stroke-width="2" fill="rgba(255, 59, 48, 0.1)" />
					<path d="M16 18h16M19 18V16a2 2 0 012-2h6a2 2 0 012 2v2m3 0v16a2 2 0 01-2 2H18a2 2 0 01-2-2V18h16z" stroke="#ff3b30" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
				</svg>
			</div>
			<h3 class="confirm-title">Remove Chord?</h3>
			<p class="confirm-message">
				Are you sure you want to remove <strong>{confirmDeleteChord.name}</strong> from your chords?
			</p>
			<div class="confirm-actions">
				<button class="confirm-btn cancel-btn" onclick={cancelDelete}>
					Cancel
				</button>
				<button class="confirm-btn delete-btn-confirm" onclick={confirmDelete}>
					Remove
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.chord-selector {
		padding: var(--spacing-lg);
	}

	.title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		margin-bottom: var(--spacing-lg);
		color: var(--color-text-primary);
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: var(--spacing-md);
	}

	.chord-item {
		position: relative;
		display: flex;
		align-items: stretch;
		gap: var(--spacing-xs);
	}

	.chord-btn {
		flex: 1;
		padding: var(--spacing-md) var(--spacing-lg);
		background: var(--color-surface);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-base);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.chord-btn:hover {
		background: var(--color-surface-elevated);
		border-color: var(--color-primary);
	}

	.chord-btn.selected {
		background: rgba(0, 122, 255, 0.1);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.chord-actions {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.action-btn {
		padding: var(--spacing-sm);
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: var(--radius-sm);
	}

	.action-btn:hover {
		background: var(--color-surface-elevated);
		color: var(--color-primary);
	}

	.delete-btn:hover {
		background: rgba(255, 59, 48, 0.1);
		color: #ff3b30;
	}

	.add-more-item {
		grid-column: 1 / -1;
	}

	.add-more-btn {
		width: 100%;
		padding: var(--spacing-lg);
		background: transparent;
		border: 2px dashed var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-secondary);
		font-size: var(--font-size-base);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
	}

	.add-more-btn:hover {
		background: var(--color-surface-elevated);
		border-color: var(--color-primary);
		color: var(--color-primary);
	}

	.add-more-btn svg {
		flex-shrink: 0;
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

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: var(--spacing-lg);
	}

	.modal-header h3 {
		font-size: var(--font-size-xl);
		font-weight: 600;
	}

	.close-btn {
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: var(--spacing-xs);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: color var(--transition-fast);
	}

	.close-btn:hover {
		color: var(--color-text-primary);
	}

	.modal-body {
		display: flex;
		justify-content: center;
	}

	.confirm-modal {
		background: var(--color-surface);
		border-radius: var(--radius-xl);
		padding: var(--spacing-xl);
		max-width: 400px;
		width: 90%;
		animation: scaleIn var(--transition-base);
		text-align: center;
	}

	.confirm-icon {
		display: flex;
		justify-content: center;
		margin-bottom: var(--spacing-lg);
	}

	.confirm-title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		margin-bottom: var(--spacing-md);
		color: var(--color-text-primary);
	}

	.confirm-message {
		font-size: var(--font-size-base);
		color: var(--color-text-secondary);
		margin-bottom: var(--spacing-xl);
		line-height: 1.5;
	}

	.confirm-message strong {
		color: var(--color-text-primary);
		font-weight: 600;
	}

	.confirm-actions {
		display: flex;
		gap: var(--spacing-md);
	}

	.confirm-btn {
		flex: 1;
		padding: var(--spacing-md) var(--spacing-lg);
		border-radius: var(--radius-md);
		font-size: var(--font-size-base);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		border: none;
	}

	.cancel-btn {
		background: var(--color-surface-elevated);
		color: var(--color-text-primary);
	}

	.cancel-btn:hover {
		background: var(--color-border);
	}

	.delete-btn-confirm {
		background: #ff3b30;
		color: white;
	}

	.delete-btn-confirm:hover {
		background: #ff2d1f;
	}
</style>

