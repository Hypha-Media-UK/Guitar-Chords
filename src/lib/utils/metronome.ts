import { METRONOME_CONFIG } from '$lib/constants';

export class Metronome {
	private audioContext: AudioContext | null = null;
	private clickBuffer: AudioBuffer | null = null;
	private accentClickBuffer: AudioBuffer | null = null;
	private scheduledClicks: Array<{ source: AudioBufferSourceNode; gainNode: GainNode }> = [];
	private schedulerInterval: number | null = null;
	private nextClickTime = 0;
	private isPlaying = false;
	private tempo: number = METRONOME_CONFIG.DEFAULT_TEMPO;
	private isEnabled = true;
	private volume = 0.8;
	private currentBeat = 0;
	private beatsPerBar = 4;
	private onBeatCallback: ((beat: number) => void) | null = null;

	constructor(
		tempo: number = METRONOME_CONFIG.DEFAULT_TEMPO,
		isEnabled: boolean = true,
		volume: number = 0.8,
		beatsPerBar: number = 4
	) {
		this.tempo = tempo;
		this.isEnabled = isEnabled;
		this.volume = volume;
		this.beatsPerBar = beatsPerBar;
	}

	private initializeAudio() {
		if (!this.audioContext) {
			this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

			// Generate regular click buffer
			if (!this.clickBuffer) {
				const sampleRate = this.audioContext.sampleRate;
				const bufferSize = sampleRate * METRONOME_CONFIG.CLICK_DURATION;
				const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
				const channelData = buffer.getChannelData(0);

				// Generate a pleasing click sound using a sine wave with exponential decay
				for (let i = 0; i < bufferSize; i++) {
					const t = i / sampleRate;
					const decay = Math.exp(-30 * t);
					channelData[i] =
						Math.sin(2 * Math.PI * METRONOME_CONFIG.CLICK_FREQUENCY * t) * decay;
				}

				this.clickBuffer = buffer;
			}

			// Generate accent click buffer (higher pitch, louder)
			if (!this.accentClickBuffer) {
				const sampleRate = this.audioContext.sampleRate;
				const bufferSize = sampleRate * METRONOME_CONFIG.CLICK_DURATION;
				const buffer = this.audioContext.createBuffer(1, bufferSize, sampleRate);
				const channelData = buffer.getChannelData(0);

				// Higher frequency for accent beat
				const accentFrequency = METRONOME_CONFIG.CLICK_FREQUENCY * 1.5;
				for (let i = 0; i < bufferSize; i++) {
					const t = i / sampleRate;
					const decay = Math.exp(-25 * t);
					channelData[i] = Math.sin(2 * Math.PI * accentFrequency * t) * decay;
				}

				this.accentClickBuffer = buffer;
			}
		}

		if (this.audioContext.state === 'suspended') {
			this.audioContext.resume();
		}
	}

	private playClick(time: number = 0, isAccent: boolean = false) {
		if (!this.isEnabled || !this.audioContext || !this.clickBuffer || !this.accentClickBuffer)
			return;

		const source = this.audioContext.createBufferSource();
		const gainNode = this.audioContext.createGain();

		// Use accent buffer for beat 1, regular for others
		source.buffer = isAccent ? this.accentClickBuffer : this.clickBuffer;
		source.connect(gainNode);
		gainNode.connect(this.audioContext.destination);

		// Accent beat is louder
		const volume = isAccent ? this.volume * 1.2 : this.volume;
		gainNode.gain.setValueAtTime(volume, time);
		source.start(time);

		// Store scheduled clicks for cleanup
		this.scheduledClicks.push({ source, gainNode });

		// Clean up completed clicks
		this.scheduledClicks = this.scheduledClicks.filter((click) => {
			if (this.audioContext && this.audioContext.currentTime >= time + 0.1) {
				click.source.disconnect();
				click.gainNode.disconnect();
				return false;
			}
			return true;
		});
	}

	private scheduleClicks() {
		if (!this.audioContext) return;

		const now = this.audioContext.currentTime;
		const clickInterval = 60 / this.tempo;
		const scheduleAheadTime = 0.1; // Schedule 100ms ahead

		while (this.nextClickTime < now + scheduleAheadTime) {
			const isAccent = this.currentBeat === 0;
			this.playClick(this.nextClickTime, isAccent);

			// Call beat callback if set
			if (this.onBeatCallback) {
				this.onBeatCallback(this.currentBeat);
			}

			this.currentBeat = (this.currentBeat + 1) % this.beatsPerBar;
			this.nextClickTime += clickInterval;
		}
	}

	start() {
		this.initializeAudio();
		this.isPlaying = true;
		this.currentBeat = 0;

		if (this.audioContext) {
			this.nextClickTime = this.audioContext.currentTime;
			this.schedulerInterval = window.setInterval(() => this.scheduleClicks(), 25);
		}
	}

	stop() {
		this.isPlaying = false;

		if (this.schedulerInterval !== null) {
			clearInterval(this.schedulerInterval);
			this.schedulerInterval = null;
		}

		// Clean up scheduled clicks
		this.scheduledClicks.forEach((click) => {
			click.source.disconnect();
			click.gainNode.disconnect();
		});
		this.scheduledClicks = [];
	}

	toggle() {
		if (this.isPlaying) {
			this.stop();
		} else {
			this.start();
		}
	}

	setTempo(newTempo: number) {
		this.tempo = newTempo;
	}

	setEnabled(enabled: boolean) {
		this.isEnabled = enabled;
	}

	setVolume(volume: number) {
		this.volume = Math.max(0, Math.min(1, volume));
	}

	setBeatsPerBar(beats: number) {
		this.beatsPerBar = beats;
		this.currentBeat = 0;
	}

	onBeat(callback: (beat: number) => void) {
		this.onBeatCallback = callback;
	}

	destroy() {
		this.stop();
		if (this.audioContext) {
			this.audioContext.close();
		}
	}
}

