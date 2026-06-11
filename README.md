# Tilmoch 🗣️→🌍

**Tilmoch** (Uzbek for *"interpreter"*) is a free, local-first real-time speech translator for your desktop. It captures any audio playing on your computer — YouTube videos, podcasts, online lectures, movies — transcribes it with a local Whisper model, translates it with a local Ollama LLM, and (soon) reads the translation aloud with a natural neural voice.

No subscriptions. No cloud lock-in. Your audio never leaves your machine unless *you* choose a paid API.

> ⚠️ **Status: early development.** Audio capture + local GPU speech-to-text are working. Translation and text-to-speech stages are in progress. See the [Roadmap](#roadmap).

---

## How it works

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────┐
│  System audio    │    │  Speech-to-Text  │    │   Translation   │    │ Text-to-Speech│
│  (loopback,      │ →  │  faster-whisper  │ →  │  Ollama (local  │ →  │  Edge TTS     │
│  no drivers)     │    │  (local, GPU/CPU)│    │  LLM, your pick)│    │  (free, neural)│
└─────────────────┘    └──────────────────┘    └─────────────────┘    └──────────────┘
```

Every stage is **pluggable**. Use the free local defaults, or drop in an API key (OpenAI, Deepgram, Google, ElevenLabs) in Settings — each stage is configured independently.

### Key design decisions

- **Local-first**: the default pipeline costs $0 and works offline (except Edge TTS, which needs internet).
- **Bring your own model**: the app reads your installed Ollama models automatically (`/api/tags`) and shows them in a dropdown — whatever you have pulled, you can use. No hardcoded model names, no manual typing.
- **Driverless audio capture**: uses Electron's loopback API (WASAPI on Windows, ScreenCaptureKit on macOS) — no VB-Cable or BlackHole setup needed for the video-translation scenario.

## Features

- ✅ Capture system audio with one click (no virtual cable drivers)
- ✅ Live audio level meter
- ✅ Real-time speech-to-text with local faster-whisper (CUDA GPU accelerated, CPU fallback)
- ✅ Smart segmentation: sentences are finalized after a natural pause, with cross-segment context for better accuracy
- ✅ Per-stage provider/model selection in Settings (STT / Translation / TTS)
- ✅ Automatic Ollama model discovery
- ✅ Edge TTS voice list with target-language filtering + instant voice preview
- 🚧 Live translation of subtitles (Ollama)
- 🚧 Spoken translation (Edge TTS playback)
- 🔜 Meeting mode (Zoom/Google Meet — speak your language, they hear theirs)
- 🔜 Uzbek language support (beta)

## Requirements

| Component | Minimum | Recommended |
|---|---|---|
| OS | Windows 10+ / macOS 12.3+ / Linux (PipeWire) | Windows 11 |
| Node.js | 18+ | 20+ |
| Python | 3.10+ | 3.12+ |
| RAM | 8 GB | 16 GB |
| GPU | none (CPU fallback) | NVIDIA, 4 GB+ VRAM (CUDA 12) |
| [Ollama](https://ollama.com/download) | any recent version | latest |

## Setup

### 1. Clone and install Node dependencies

```bash
git clone https://github.com/<you>/tilmoch.git
cd tilmoch
npm install
```

### 2. Set up the Python STT server

```bash
cd python
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt    # Windows
# source .venv/bin/activate && pip install -r requirements.txt  # macOS/Linux
```

The requirements include `nvidia-cublas-cu12` / `nvidia-cudnn-cu12` so CUDA works out of the box on NVIDIA GPUs — no system-wide CUDA toolkit install needed. On machines without an NVIDIA GPU the server automatically falls back to CPU.

### 3. Install Ollama and pull a translation model

```bash
# install from https://ollama.com/download, then:
ollama pull gemma3:4b
```

### 4. Run

```bash
# Terminal 1 — STT server
cd python
.venv\Scripts\python stt_server.py

# Terminal 2 — the app
npm run dev
```

Click **Start system audio capture**, play any video, and watch the subtitles appear.

> **First run note:** the Whisper model (~1.5 GB for `large-v3-turbo`) is downloaded automatically on the first transcription. This is a one-time download.

## Recommended models

### Speech-to-Text (Whisper, runs locally)

| Model | VRAM (int8) | Quality | When to use |
|---|---|---|---|
| **`large-v3-turbo`** ⭐ | ~2.7 GB | Best | Default — fits 4 GB GPUs, 2.5× faster than real-time |
| `distil-large-v3` | ~1.5 GB | Very good (English-leaning) | Slightly faster, English-heavy content |
| `medium` | ~1.2 GB | Good | Older GPUs |
| `small` | ~0.5 GB | OK | CPU-only machines |
| `base` / `tiny` | <0.3 GB | Rough | Very weak hardware only |

### Translation (Ollama, runs locally)

| Model | Size | When to use |
|---|---|---|
| **`gemma3:4b`** ⭐ | ~3 GB | Default — strong multilingual (140+ languages), fits 4 GB VRAM |
| `qwen2.5:3b` / `qwen3:4b` | ~2 GB | Strong for Japanese/Chinese/Korean content |
| `gemma3:12b` | ~8 GB | Better quality if you have 12 GB+ VRAM |

> Avoid "thinking" models (e.g. `deepseek-r1`) for translation — they reason before answering, which kills real-time latency.

### Text-to-Speech

| Provider | Cost | Notes |
|---|---|---|
| **Edge TTS** ⭐ | Free | Neural quality, hundreds of voices, excellent Japanese, includes Uzbek (`uz-UZ-MadinaNeural`/`SardorNeural`). Needs internet. |
| ElevenLabs | Paid (API key) | Best-in-class quality + voice cloning |

## Settings

Everything is configured in the app's **Settings** panel:

- **Languages** — source (auto-detect supported) and target language
- **Per-stage provider & model** — each of STT / Translation / TTS has its own dropdown; models are discovered automatically (Ollama models, Edge TTS voices)
- **API keys** — optional; selecting a paid provider (OpenAI, Deepgram, Google, ElevenLabs) reveals an API key field

Settings persist to `settings.json` in the app's user-data folder.

## Troubleshooting

| Problem | Fix |
|---|---|
| "Ollama topilmadi" / models not listed | Make sure Ollama is running (`ollama list` in a terminal). If the tray app is stuck, quit it from the system tray and reopen. Then press **↻** in Settings. |
| STT server connection error | Check Terminal 1 — is `stt_server.py` running on port 8765? |
| First transcription is very slow | The Whisper model is downloading (one-time, ~1.5 GB). Watch the server log. |
| GPU not used (slow transcription) | Ensure `nvidia-cublas-cu12`/`nvidia-cudnn-cu12` are installed in the venv. The server logs `CUDA'da yuklandi` (GPU) or `CPU'da yuklandi` (fallback) on model load. |
| No audio captured / meter not moving | Make sure audio is actually playing; on Windows, check the app has screen-recording permission if prompted. |

## Roadmap

- [x] **Phase 1a** — system audio capture + local GPU STT + live subtitles
- [ ] **Phase 1b** — live translation via Ollama (subtitle overlay)
- [ ] **Phase 2** — spoken translation (Edge TTS playback), voice options
- [ ] **Phase 3** — meeting mode: microphone capture + translated TTS into Zoom/Meet
- [ ] **Phase 4** — Uzbek language support (beta), packaged installers

## Tech stack

- **App**: Electron 39 + React 19 + TypeScript + electron-vite
- **Audio capture**: [`electron-audio-loopback`](https://github.com/alectrocute/electron-audio-loopback) (driverless system loopback)
- **STT**: [`faster-whisper`](https://github.com/SYSTRAN/faster-whisper) (CTranslate2) over WebSocket, Python 3
- **Translation**: [Ollama](https://ollama.com) local LLMs
- **TTS**: [`msedge-tts`](https://github.com/Migushthe2nd/MsEdgeTTS) (Microsoft Edge neural voices)

## License

All rights reserved. This is a personal portfolio project — feel free to read the code and learn from it, but please contact the author before reusing it commercially.
