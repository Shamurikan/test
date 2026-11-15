"""Step 1. audio_in/narration.m4a -> audio_in/db.npy
10 ms RMS loudness envelope (dB) of the narration, decoded to 16 kHz mono.
align.py uses it to find pauses (silence threshold -50 dB)."""
import subprocess, sys
import numpy as np
src = sys.argv[1] if len(sys.argv) > 1 else 'audio_in/narration.m4a'
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', src, '-ac', '1', '-ar', '16000', '-f', 's16le', '-'],
                     capture_output=True, check=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768
hop = 160
n = len(x) // hop
e = np.sqrt((x[:n * hop].reshape(n, hop) ** 2).mean(1))
np.save('audio_in/db.npy', 20 * np.log10(e + 1e-9))
print('duration', round(len(x) / 16000, 3), 's; frames', n)
