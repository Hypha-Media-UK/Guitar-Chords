<script lang="ts">
	interface Props {
		isOn: boolean;
		onToggle: () => void;
		label: string;
	}

	let { isOn, onToggle, label }: Props = $props();
</script>

<div class="toggle-container">
	<span class="label">{label}</span>
	<button
		class="toggle"
		class:on={isOn}
		onclick={onToggle}
		role="switch"
		aria-checked={isOn}
		aria-label={label}
	>
		<span class="slider"></span>
	</button>
</div>

<style>
	.toggle-container {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
	}

	.label {
		font-size: var(--font-size-base);
		color: var(--color-text-primary);
		font-weight: 500;
	}

	.toggle {
		position: relative;
		width: 48px;
		height: 28px;
		background: var(--color-surface-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: all var(--transition-base);
		padding: 0;
	}

	.toggle:hover {
		border-color: var(--color-text-secondary);
	}

	.toggle.on {
		background: var(--color-primary);
		border-color: var(--color-primary);
	}

	.slider {
		position: absolute;
		top: 2px;
		left: 2px;
		width: 22px;
		height: 22px;
		background: white;
		border-radius: 50%;
		transition: transform var(--transition-base);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
	}

	.toggle.on .slider {
		transform: translateX(20px);
	}
</style>

