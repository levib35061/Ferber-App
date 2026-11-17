import json, sys
from faster_whisper import WhisperModel
import subprocess, numpy as np
def load(p):
    raw=subprocess.run(["ffmpeg","-v","error","-i",p,"-f","s16le","-ac","1","-ar","16000","-"],capture_output=True).stdout
    return np.frombuffer(raw,np.int16).astype(np.float32)/32768
m = WhisperModel("base.en", device="cpu", compute_type="int8")
for n in ("a1","a2","a3"):
    segs, _ = m.transcribe(load(n + ".mp3"), word_timestamps=True, beam_size=1)
    words = [{"w": w.word, "s": round(w.start, 2), "e": round(w.end, 2)} for s in segs for w in s.words]
    json.dump(words, open(n + ".words.json", "w"))
    print(n, len(words), " ".join(x["w"] for x in words)[:160])
