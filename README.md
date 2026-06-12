# Tilmoch 🗣️→🌍

**Tilmoch** (Uzbek for *"interpreter"*) is a free, local-first real-time speech translator for your desktop. It captures any audio playing on your computer — YouTube videos, podcasts, online lectures, movies, or your meeting partner — transcribes it with a local Whisper model, translates it, and reads the translation aloud with a natural neural voice. In **Meeting mode** it works the other way too: you speak your language, and your Zoom/Meet partner hears theirs.

No subscriptions. No cloud lock-in. Your audio never leaves your machine unless *you* choose a cloud provider.

## Demo

<!-- DEMO GIF: docs/demo.gif joylang va quyidagi qatorni oching -->
<!-- ![Tilmoch demo — live subtitle translation over a YouTube video](docs/demo.gif) -->

> 🎬 Demo GIF coming soon — live bilingual subtitles over a YouTube video, with the cinema-style overlay.

---

## How it works

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐    ┌──────────────┐
│  System audio /  │    │  Speech-to-Text  │    │   Translation   │    │ Text-to-Speech│
│  microphone      │ →  │  faster-whisper  │ →  │  Google free /  │ →  │  Edge TTS     │
│  (driverless)    │    │  (local, GPU/CPU)│    │  Ollama / paid  │    │  (free, neural)│
└─────────────────┘    └──────────────────┘    └─────────────────┘    └──────────────┘
```

Every stage is **pluggable** — pick a provider per stage in Settings, drop in an API key for paid ones, or stay 100% free.

## Features

- ✅ **Video translation** — capture system audio with one click (no drivers), live bilingual subtitles
- ✅ **Subtitle overlay** — transparent always-on-top cinema-style subtitle window, draggable, works over fullscreen video
- ✅ **Spoken translation** — translations read aloud with neural Edge TTS voices, with echo-loop protection
- ✅ **Meeting mode** — speak your language; your partner hears theirs through a virtual cable
- ✅ **Guided VB-Cable setup** — one-click download + install from inside the app, auto-selected when detected
- ✅ **Local GPU speech-to-text** — faster-whisper with CUDA (bundled via pip wheels), CPU fallback
- ✅ **Self-managing STT server** — the app spawns, monitors, and restarts the Python server automatically
- ✅ **Pluggable pipeline** — per-stage provider/model selection, automatic Ollama model discovery
- ✅ **5 UI languages** — Uzbek, English, Russian, Japanese, Spanish (i18next)
- ✅ **Echo protection** — self-echo text filter + TTS gating prevent feedback loops
- 🔜 Packaged installer

## Requirements

| Component | Minimum | Recommended |
|---|---|---|
| OS | Windows 10+ / macOS 12.3+ / Linux (PipeWire) | Windows 11 |
| Node.js | 18+ | 20+ |
| Python | 3.10+ | 3.12+ |
| RAM | 8 GB | 16 GB |
| GPU | none (CPU fallback) | NVIDIA, 4 GB+ VRAM (CUDA 12) |
| [Ollama](https://ollama.com/download) | optional (for local translation) | latest |

## Setup

```bash
# 1. Clone and install
git clone https://github.com/SherzodkhujaNiyozov/tilmoch.git
cd tilmoch
npm install

# 2. Python STT environment (one time)
cd python
python -m venv .venv
.venv\Scripts\pip install -r requirements.txt    # Windows
cd ..

# 3. Optional: local translation model
ollama pull gemma3:4b

# 4. Run — the app starts the STT server automatically
npm run dev
```

> **First run:** the Whisper model (~1.5 GB for `large-v3-turbo`) downloads automatically on first transcription. The NVIDIA CUDA runtime comes from pip wheels — no system CUDA install needed.

## Which model should I pick? (honest recommendations)

### Speech-to-Text — local Whisper (free)

| Model | VRAM (int8) | Verdict |
|---|---|---|
| **`large-v3-turbo`** ⭐ | ~2.7 GB | **Best free STT, period.** Fits 4 GB GPUs, 2.5× faster than real-time. Use this unless your hardware can't. |
| `distil-large-v3` | ~1.5 GB | Nearly as good for English-heavy content |
| `small` | ~0.5 GB | CPU-only machines; noticeably more errors |

Paid alternatives (**OpenAI** `gpt-4o-transcribe`, **Deepgram** `nova-3`) are supported via API key. They're worth it only if you have **no GPU** — on a CUDA machine, local `large-v3-turbo` matches them at zero cost. Deepgram is the latency king (~$0.0077/min) if you ever need cloud streaming.

### Translation

| Provider | Cost | Verdict |
|---|---|---|
| **Google Translate (free endpoint)** ⭐ | Free, no key | **Best free choice for low-resource languages** (Uzbek, etc.). Unofficial endpoint — may be rate-limited someday; the app falls back gracefully. |
| **Ollama `gemma3:4b`** ⭐ | Free, local | **Best fully-offline choice.** Excellent for major languages (RU/JA/ES…); mediocre for Uzbek. 140+ languages, fits 4 GB VRAM. |
| Ollama `qwen2.5:3b` / `qwen3:4b` | Free, local | Strong for Japanese/Chinese/Korean; **do not use for Uzbek** (produces garbage) |
| DeepL API | Free tier 500k chars/mo (card required) | **Best quality for European languages**; weak/no Uzbek support |
| OpenAI `gpt-4o-mini` | ~$0.15/M input tokens | **Best context-aware paid option** — understands idioms, slang, mid-sentence corrections. The pick if you pay for one thing. |

**Rule of thumb:** target language is Uzbek → Google free. Major language + want offline → `gemma3:4b`. Want the absolute best and will pay → OpenAI `gpt-4o-mini` (cheap) or `gpt-4o` (premium).

> Avoid "thinking" models (`deepseek-r1`) for translation — they reason before answering, killing real-time latency.

### Text-to-Speech

| Provider | Cost | Verdict |
|---|---|---|
| **Edge TTS** ⭐ | Free | **Best free TTS by far** — neural quality, hundreds of voices, excellent Japanese, includes Uzbek (`uz-UZ-MadinaNeural`). Needs internet; unofficial API. |
| ElevenLabs | from $5/mo | **Best paid quality + voice cloning** — keep your own voice timbre across languages. The upgrade that matters most for Meeting mode. |

## Using Meeting mode (Zoom/Google Meet)

1. Open the **Meeting** tab, pick your language and your partner's language
2. If VB-Cable isn't installed, click **Install VB-Cable** — the app downloads and launches the official installer (confirm the UAC prompt)
3. The app auto-selects **CABLE Input** as TTS output once detected
4. In Zoom/Meet, set **Microphone → CABLE Output**
5. Click **Start meeting mode** and speak — your partner hears the translation in their language
6. To understand *them*, also start **Video translation** (incoming) — their voice gets subtitled and optionally spoken to you. Wear headphones.

## Troubleshooting

| Problem | Fix |
|---|---|
| Ollama models not listed | Make sure Ollama is running (`ollama list`). If the tray app is stuck, quit it from the tray and reopen, then press **↻**. |
| STT status stuck on "connecting" | The app respawns the server automatically — wait ~5s. Check the dev console for `[stt]` logs. |
| First transcription very slow | One-time Whisper model download (~1.5 GB). |
| GPU not used | Server logs `CUDA'da yuklandi` (GPU) or `CPU'da yuklandi` (fallback) on model load. |
| CABLE Input not visible after install | Press **↻**; if still missing, restart the app (rarely, Windows needs a reboot). |
| Partner hears the original + translation | Make sure Zoom mic is **CABLE Output**, not your real microphone. |

## Tech stack

- **App**: Electron 39 + React 19 + TypeScript + electron-vite + i18next
- **Audio capture**: [`electron-audio-loopback`](https://github.com/alectrocute/electron-audio-loopback) (driverless system loopback)
- **STT**: [`faster-whisper`](https://github.com/SYSTRAN/faster-whisper) (CTranslate2) over WebSocket, auto-spawned Python server
- **Translation**: Google Translate (free endpoint) / [Ollama](https://ollama.com) / DeepL / OpenAI
- **TTS**: [`msedge-tts`](https://github.com/Migushthe2nd/MsEdgeTTS) (Microsoft Edge neural voices)
- **Design**: custom design system built with Claude Design (brand mark, tokens, motion specs)

## License

All rights reserved. This is a personal portfolio project — feel free to read the code and learn from it, but please contact the author before reusing it commercially.
