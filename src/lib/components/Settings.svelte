<script lang="ts">
	import { chords, type Chord } from '$lib/data/chords';
	import ChordDiagram from './ChordDiagram.svelte';

	interface Props {
		visibleChordIds: number[];
		primaryColor: string;
		onClose: () => void;
		onSave: (chordIds: number[], primaryColor: string) => void;
	}

	let { visibleChordIds, primaryColor, onClose, onSave }: Props = $props();

	let selectedIds = $state<number[]>([...visibleChordIds]);
	let selectedColor = $state<string>(primaryColor);

	function toggleChord(chordId: number) {
		if (selectedIds.includes(chordId)) {
			selectedIds = selectedIds.filter((id) => id !== chordId);
		} else {
			selectedIds = [...selectedIds, chordId];
		}
	}

	function selectAll() {
		selectedIds = chords.map((c) => c.id);
	}

	function deselectAll() {
		selectedIds = [];
	}

	function handleSave() {
		onSave(selectedIds, selectedColor);
		onClose();
	}

	function updatePreview() {
		// Apply the color immediately to preview
		applyColorWithShades(selectedColor);
	}

	function applyColorWithShades(color: string) {
		// Set the primary color
		document.documentElement.style.setProperty('--color-primary', color);

		// Generate lighter and darker shades
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

	function isSelected(chordId: number) {
		return selectedIds.includes(chordId);
	}

	// Group chords by type
	const majorChords = $derived(chords.filter((c) => /^[A-G]$/.test(c.name)));
	const minorChords = $derived(chords.filter((c) => /^[A-G]m$/.test(c.name)));
	const seventhChords = $derived(chords.filter((c) => /7/.test(c.name)));
	const otherChords = $derived(
		chords.filter(
			(c) =>
				!/^[A-G]$/.test(c.name) && !/^[A-G]m$/.test(c.name) && !/7/.test(c.name)
		)
	);
</script>

<div class="settings-screen">
	<header class="settings-header">
		<button class="back-btn" onclick={onClose} aria-label="Back to home">
			<svg width="24" height="24" viewBox="0 0 24 24" fill="none">
				<path
					d="M19 12H5M5 12l7 7M5 12l7-7"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
				/>
			</svg>
			<span>Back</span>
		</button>
		<h1>Chord Library</h1>
	</header>

	<div class="settings-content">
		<!-- Color Theme Section -->
		<section class="settings-section">
			<h2 class="section-title">Color Theme</h2>
			<p class="section-description">Choose your preferred accent color</p>

			<div class="custom-color-picker">
				<label for="color-input" class="color-input-label">
					<span class="label-text">Accent Color</span>
					<div class="color-input-wrapper">
						<input
							id="color-input"
							type="color"
							bind:value={selectedColor}
							class="color-input"
						/>
						<span class="color-value">{selectedColor.toUpperCase()}</span>
					</div>
				</label>
				<button class="preview-btn" onclick={updatePreview}>
					Update Preview
				</button>
			</div>
		</section>

		<!-- Chord Library Section -->
		<section class="settings-section">
			<h2 class="section-title">Chord Library</h2>
			<div class="settings-info">
				<p>Select which chords to display in the chord selector</p>
				<div class="selection-count">
					{selectedIds.length} of {chords.length} chords selected
				</div>
			</div>

			<div class="quick-actions">
				<button class="action-btn" onclick={selectAll}>Select All</button>
				<button class="action-btn" onclick={deselectAll}>Deselect All</button>
			</div>
		</section>

		<div class="chord-groups">
				{#if majorChords.length > 0}
					<div class="chord-group">
						<h3 class="group-title">Major Chords</h3>
						<div class="chord-grid">
							{#each majorChords as chord (chord.id)}
								<button
									class="chord-item"
									class:selected={isSelected(chord.id)}
									onclick={() => toggleChord(chord.id)}
								>
									<span class="chord-name">{chord.name}</span>
									<ChordDiagram diagram={chord.diagram} class="chord-diagram-tiny" />
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if minorChords.length > 0}
					<div class="chord-group">
						<h3 class="group-title">Minor Chords</h3>
						<div class="chord-grid">
							{#each minorChords as chord (chord.id)}
								<button
									class="chord-item"
									class:selected={isSelected(chord.id)}
									onclick={() => toggleChord(chord.id)}
								>
									<span class="chord-name">{chord.name}</span>
									<ChordDiagram diagram={chord.diagram} class="chord-diagram-tiny" />
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if seventhChords.length > 0}
					<div class="chord-group">
						<h3 class="group-title">7th Chords</h3>
						<div class="chord-grid">
							{#each seventhChords as chord (chord.id)}
								<button
									class="chord-item"
									class:selected={isSelected(chord.id)}
									onclick={() => toggleChord(chord.id)}
								>
									<span class="chord-name">{chord.name}</span>
									<ChordDiagram diagram={chord.diagram} class="chord-diagram-tiny" />
								</button>
							{/each}
						</div>
					</div>
				{/if}

				{#if otherChords.length > 0}
					<div class="chord-group">
						<h3 class="group-title">Other Chords</h3>
						<div class="chord-grid">
							{#each otherChords as chord (chord.id)}
								<button
									class="chord-item"
									class:selected={isSelected(chord.id)}
									onclick={() => toggleChord(chord.id)}
								>
									<span class="chord-name">{chord.name}</span>
									<ChordDiagram diagram={chord.diagram} class="chord-diagram-tiny" />
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

	<footer class="settings-footer">
		<button class="save-btn" onclick={handleSave}>Save Changes</button>
	</footer>
</div>

<style>
	.settings-screen {
		position: fixed;
		inset: 0;
		background: var(--color-background);
		z-index: 1000;
		display: flex;
		flex-direction: column;
		animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
	}

	@keyframes slideInRight {
		from {
			opacity: 0;
			transform: translateX(20px);
		}
		to {
			opacity: 1;
			transform: translateX(0);
		}
	}

	.settings-header {
		background: var(--color-surface);
		border-bottom: 1px solid var(--color-border);
		padding: var(--spacing-lg) var(--spacing-xl);
		display: flex;
		align-items: center;
		gap: var(--spacing-lg);
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.back-btn {
		background: none;
		border: none;
		color: var(--color-text-secondary);
		font-size: var(--font-size-base);
		font-weight: 600;
		cursor: pointer;
		padding: var(--spacing-sm) var(--spacing-md);
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		transition: all var(--transition-fast);
		border-radius: var(--radius-md);
	}

	.back-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--color-primary);
	}

	.settings-header h1 {
		font-size: var(--font-size-2xl);
		font-weight: 700;
		color: var(--color-text);
		margin: 0;
	}

	.settings-content {
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-xl);
		max-width: 1200px;
		margin: 0 auto;
		width: 100%;
	}

	.settings-section {
		margin-bottom: var(--spacing-2xl);
	}

	.section-title {
		font-size: var(--font-size-lg);
		font-weight: 700;
		color: var(--color-text);
		margin: 0 0 var(--spacing-xs) 0;
	}

	.section-description {
		color: var(--color-text-secondary);
		font-size: var(--font-size-sm);
		margin: 0 0 var(--spacing-lg) 0;
	}

	.custom-color-picker {
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		padding: var(--spacing-lg);
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.color-input-label {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.label-text {
		font-weight: 600;
		color: var(--color-text);
		font-size: var(--font-size-base);
	}

	.color-input-wrapper {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.color-input {
		width: 80px;
		height: 80px;
		border: 3px solid var(--color-border);
		border-radius: var(--radius-lg);
		cursor: pointer;
		background: transparent;
		transition: all var(--transition-fast);
	}

	.color-input:hover {
		border-color: var(--color-primary);
		transform: scale(1.05);
	}

	.color-input::-webkit-color-swatch-wrapper {
		padding: 0;
	}

	.color-input::-webkit-color-swatch {
		border: none;
		border-radius: var(--radius-md);
	}

	.color-input::-moz-color-swatch {
		border: none;
		border-radius: var(--radius-md);
	}

	.color-value {
		font-family: 'SF Mono', 'Monaco', 'Courier New', monospace;
		font-size: var(--font-size-lg);
		font-weight: 600;
		color: var(--color-text);
		background: rgba(255, 255, 255, 0.05);
		padding: var(--spacing-sm) var(--spacing-md);
		border-radius: var(--radius-md);
		border: 1px solid var(--color-border);
	}

	.preview-btn {
		background: var(--color-primary);
		color: var(--color-primary-contrast);
		border: none;
		border-radius: var(--radius-lg);
		padding: var(--spacing-md) var(--spacing-lg);
		font-weight: 600;
		font-size: var(--font-size-base);
		cursor: pointer;
		transition: all var(--transition-fast);
		align-self: flex-start;
	}

	.preview-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}

	.preview-btn:active {
		transform: translateY(0);
	}

	.settings-info {
		margin-bottom: var(--spacing-lg);
	}

	.settings-info p {
		color: var(--color-text-secondary);
		margin: 0 0 var(--spacing-sm) 0;
	}

	.selection-count {
		font-size: var(--font-size-sm);
		color: var(--color-primary);
		font-weight: 600;
	}

	.quick-actions {
		display: flex;
		gap: var(--spacing-sm);
		margin-bottom: var(--spacing-xl);
	}

	.action-btn {
		padding: var(--spacing-sm) var(--spacing-md);
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text);
		font-size: var(--font-size-sm);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.action-btn:hover {
		background: rgba(255, 255, 255, 0.15);
		border-color: var(--color-primary);
	}

	.chord-groups {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.chord-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.group-title {
		font-size: var(--font-size-base);
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin: 0;
	}

	.chord-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: var(--spacing-md) var(--spacing-lg);
	}

	.chord-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-sm);
		background: rgba(255, 255, 255, 0.05);
		border: 2px solid transparent;
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-fast);
	}

	.chord-item:hover {
		background: rgba(255, 255, 255, 0.1);
		border-color: rgba(255, 255, 255, 0.2);
	}

	.chord-item.selected {
		background: rgba(0, 122, 255, 0.2);
		border-color: var(--color-primary);
	}

	.chord-name {
		font-size: var(--font-size-sm);
		font-weight: 600;
		color: var(--color-text);
	}

	.settings-footer {
		background: var(--color-surface);
		border-top: 1px solid var(--color-border);
		padding: var(--spacing-lg) var(--spacing-xl);
		display: flex;
		justify-content: center;
		position: sticky;
		bottom: 0;
		z-index: 10;
	}

	.save-btn {
		padding: var(--spacing-md) var(--spacing-2xl);
		border-radius: var(--radius-lg);
		font-size: var(--font-size-base);
		font-weight: 600;
		cursor: pointer;
		transition: all var(--transition-fast);
		background: var(--color-primary);
		border: none;
		color: var(--color-primary-contrast);
		min-width: 200px;
	}

	.save-btn:hover {
		background: var(--color-primary-light);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(0, 122, 255, 0.3);
	}

	/* Tablet Portrait - 3 columns */
	@media (min-width: 600px) {
		.chord-grid {
			grid-template-columns: repeat(3, 1fr);
		}
	}

	/* Tablet Landscape - 4 columns */
	@media (min-width: 900px) {
		.chord-grid {
			grid-template-columns: repeat(4, 1fr);
		}
	}

	/* Desktop - 5 columns */
	@media (min-width: 1200px) {
		.chord-grid {
			grid-template-columns: repeat(5, 1fr);
		}
	}

	/* Large Desktop - 6 columns max */
	@media (min-width: 1400px) {
		.chord-grid {
			grid-template-columns: repeat(6, 1fr);
		}
	}

	/* Mobile adjustments */
	@media (max-width: 600px) {
		.settings-header h1 {
			font-size: var(--font-size-xl);
		}

		.settings-content {
			padding: var(--spacing-md);
		}
	}

	/* Tablet and up - horizontal layout for color picker */
	@media (min-width: 768px) {
		.custom-color-picker {
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
		}

		.color-input-label {
			flex-direction: row;
			align-items: center;
			gap: var(--spacing-lg);
		}

		.label-text {
			min-width: 120px;
		}
	}
</style>

