# Guitar Practice - SvelteKit Edition

A modern guitar practice app built with SvelteKit, TypeScript, and pure CSS. This is a complete rebuild of the original React app with enhanced UI/UX and modern web technologies.

## 🎸 Features

- **Chord Selection**: Choose from a library of common guitar chords
- **Interactive Practice Sessions**: Practice chord transitions with visual feedback
- **Metronome**: Built-in metronome using Web Audio API
- **Beat Tracking**: Visual beat indicators to keep you in time
- **Randomized Practice**: Option to randomize chord sequences
- **Keyboard Shortcuts**: Control your practice session with keyboard shortcuts
- **Responsive Design**: Works on desktop and mobile devices
- **Dark Theme**: Beautiful dark UI inspired by iOS design

## 🚀 Tech Stack

- **SvelteKit** - Modern web framework with excellent DX
- **TypeScript** - Type-safe development
- **Pure CSS** - No CSS frameworks, custom modern CSS
- **Motion One** - Smooth animations and transitions
- **Web Audio API** - High-quality metronome sound

## 📦 Getting Started

### Prerequisites

- Node.js 20+ or 24+
- npm or pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🎹 Keyboard Shortcuts

- **Space** - Toggle play/pause
- **M** - Toggle metronome sound
- **Esc** - End practice session

## 🏗️ Project Structure

```
guitar-svelte/
├── src/
│   ├── lib/
│   │   ├── components/      # Svelte components
│   │   ├── data/           # Chord data
│   │   ├── utils/          # Utilities (metronome, etc.)
│   │   └── constants.ts    # App constants
│   ├── routes/             # SvelteKit routes
│   ├── app.css            # Global styles
│   └── app.html           # HTML template
├── static/                 # Static assets
└── package.json
```

## 🎨 Design Philosophy

This rebuild maintains the visual aesthetic of the original app while enhancing:

- **Smoother transitions** between chords
- **Better animations** for beat indicators and UI elements
- **Improved accessibility** with proper ARIA labels
- **Enhanced mobile experience** with responsive design
- **Cleaner code** with TypeScript and Svelte's reactivity

## 📝 License

MIT

## 🙏 Acknowledgments

Built as a modern rebuild of the original React guitar practice app.

