# YouTube video builder

Builds the videos in `docs/VIDEO_SCRIPTS.md` from the ElevenLabs narration.
Not part of the app. Run from this folder, with `a1.mp3`, `a2.mp3`, `a3.mp3`
(video 1, 2, 3 narration) and `icon.png`, `chart-sheet.png`, `web-timer.png` beside it.

1. `pip install faster-whisper` then `python3 asr.py`: word timings (`a1.words.json` …)
2. `python3 align.py`: matches each script line to its time (`timing.json`)
3. `node render.js a1 --preview 3,40,100`: check single frames
4. `node render.js a1`: renders `a1.mp4` (1920×1080, 30 fps)
5. `python3 captions.py`: YouTube caption files `video1.srt` …

Scenes live in `scenes.js`, one per script line; `data-at="w:word"` makes
something appear when that word is spoken.
