<script lang="ts">
	interface Props {
		diagram: [string[], string[]];
		class?: string;
	}

	let { diagram, class: className = '' }: Props = $props();

	// Make positions and fingers reactive to diagram changes
	const positions = $derived(diagram[0]);
	const fingers = $derived(diagram[1]);

	const stringCount = 6;
	const fretCount = 5;
	const width = 130;
	const height = 150;
	const padding = 16;
	const topPadding = 18;
	const totalWidth = width + padding * 2;
	const totalHeight = height + padding + topPadding;
	const xSpacing = width / (stringCount - 1);
	const ySpacing = height / (fretCount + 0.5);
	const dotRadius = 8;

	// Function to get x position for string index (0 = low E, 5 = high E)
	const getStringX = (stringIndex: number) => padding + (stringCount - 1 - stringIndex) * xSpacing;

	const getStringName = (stringIndex: number) => {
		const strings = ['Low E', 'A', 'D', 'G', 'B', 'High E'];
		return strings[stringIndex];
	};

	const getFingerName = (finger: string) => {
		if (finger === '1') return '1st (index)';
		if (finger === '2') return '2nd (middle)';
		if (finger === '3') return '3rd (ring)';
		if (finger === '4') return '4th (pinky)';
		return finger;
	};
</script>

<svg
	{width}
	{height}
	viewBox="0 0 {totalWidth} {totalHeight}"
	class="chord-diagram {className}"
>
	<defs>
		<linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
			<stop offset="0%" stop-color="#1c1c1e" />
			<stop offset="100%" stop-color="#2c2c2e" />
		</linearGradient>
		<filter id="glow">
			<feGaussianBlur stdDeviation="2" result="coloredBlur" />
			<feMerge>
				<feMergeNode in="coloredBlur" />
				<feMergeNode in="SourceGraphic" />
			</feMerge>
		</filter>
	</defs>

	<!-- Background -->
	<rect
		x="0"
		y="0"
		width={totalWidth}
		height={totalHeight}
		fill="url(#bgGradient)"
		rx="12"
		class="background"
	/>

	<!-- Nut -->
	<rect x={padding} y={topPadding} {width} height="1.5" class="nut" />

	<!-- Strings -->
	{#each Array(stringCount) as _, i}
		<line
			x1={getStringX(i)}
			y1={topPadding}
			x2={getStringX(i)}
			y2={topPadding + height}
			class="string"
			stroke-width={i < 3 ? 0.6 : 0.5}
		/>
	{/each}

	<!-- Frets -->
	{#each Array(fretCount) as _, i}
		<line
			x1={padding}
			y1={topPadding + ySpacing * (i + 1)}
			x2={padding + width}
			y2={topPadding + ySpacing * (i + 1)}
			class="fret"
			stroke-width="0.5"
		/>
	{/each}

	<!-- Position markers -->
	<g class="markers">
		{#each positions as pos, stringIndex}
			{@const x = getStringX(stringIndex)}
			{#if pos === 'x'}
				<text x={x} y={topPadding - 4} text-anchor="middle" font-size="12" class="x-marker">
					×
				</text>
			{:else if pos === 'o'}
				<circle cx={x} cy={topPadding - 6} r="2.5" class="o-marker" />
			{:else if pos !== ''}
				{@const fretNumber = parseInt(pos)}
				{@const y = topPadding + ySpacing * (fretNumber - 0.5)}
				<g class="finger-position">
					<circle cx={x} cy={y} r={dotRadius} class="dot" filter="url(#glow)" />
					<text
						x={x}
						y={y}
						text-anchor="middle"
						font-size="10"
						class="finger"
						dominant-baseline="central"
					>
						{fingers[stringIndex]}
					</text>
				</g>
			{/if}
		{/each}
	</g>
</svg>

<style>
	.chord-diagram {
		display: block;
	}

	.background {
		fill: url(#bgGradient);
	}

	.nut {
		fill: #8e8e93;
	}

	.string {
		stroke: #8e8e93;
	}

	.fret {
		stroke: #8e8e93;
	}

	.x-marker {
		fill: #ff453a;
		font-family: system-ui, -apple-system, sans-serif;
		font-weight: bold;
	}

	.o-marker {
		fill: none;
		stroke: #30d158;
		stroke-width: 2;
	}

	.dot {
		fill: var(--color-primary);
	}

	.finger {
		fill: var(--color-primary-contrast);
		font-family: system-ui, -apple-system, sans-serif;
		font-weight: 600;
		pointer-events: none;
	}
</style>

