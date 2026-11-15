"""Align Fish ASR word timings to the script's display tokens.

Writes remotion/src/data/vo.json:
  { key: { "duration": seconds, "words": [{"t": display, "s": start, "e": end}] } }
and prints a per-clip match report so mispronunciations can be caught.
"""
import difflib
import json
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
scenes = json.loads((ROOT / "script/scenes.json").read_text())
MARK = re.compile(r"\{([^|}]+)\|([^}]+)\}")


def norm(w: str) -> str:
    w = w.lower().replace("’", "'")
    w = re.sub(r"[^a-z0-9']", "", w)
    return w


def tokens(text: str):
    """Return display tokens, each with the list of 'say' words it is spoken as."""
    out = []
    pos = 0
    for m in MARK.finditer(text):
        for w in text[pos:m.start()].split():
            out.append((w, [w]))
        disp, say = m.group(1), m.group(2)
        # glue trailing punctuation that follows the markup to the display token
        out.append((disp, say.split()))
        pos = m.end()
    for w in text[pos:].split():
        out.append((w, [w]))
    # attach punctuation-only tokens to previous
    merged = []
    for d, s in out:
        if merged and not norm(d) and d.strip():
            pd, ps = merged[-1]
            merged[-1] = (pd + d, ps)
        else:
            merged.append((d, s))
    return merged


def duration(p: Path) -> float:
    r = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)],
        capture_output=True, text=True, check=True)
    return float(r.stdout.strip())


result = {}
report = []
for s in scenes:
    for i, p in enumerate(s["parts"]):
        key = f'{s["id"]}_{p["id"]}' if p.get("id") else (f'{s["id"]}_{i}' if len(s["parts"]) > 1 else s["id"])
        asr = json.loads((ROOT / f"script/asr/{key}.json").read_text())
        aw = [(norm(x["text"]), x["start"], x["end"]) for x in asr.get("segments", [])]
        aw = [x for x in aw if x[0]]
        toks = tokens(p["text"])
        say = []  # (norm word, token index)
        for ti, (_, sw) in enumerate(toks):
            for w in sw:
                n = norm(w)
                if n:
                    say.append((n, ti))
        sm = difflib.SequenceMatcher(a=[x[0] for x in say], b=[x[0] for x in aw], autojunk=False)
        times = [None] * len(say)
        for a0, b0, size in sm.get_matching_blocks():
            for k in range(size):
                times[a0 + k] = (aw[b0 + k][1], aw[b0 + k][2])
        # also map "replace" opcodes of equal length one-to-one, and spread unequal ones
        for tag, a0, a1, b0, b1 in sm.get_opcodes():
            if tag == "replace":
                bs, be = aw[b0][1], aw[b1 - 1][2]
                n = a1 - a0
                for k in range(n):
                    times[a0 + k] = (bs + (be - bs) * k / n, bs + (be - bs) * (k + 1) / n)
        # interpolate any remaining gaps
        dur = duration(ROOT / f"remotion/public/vo/{key}.mp3")
        for k in range(len(times)):
            if times[k] is None:
                prev_e = next((times[j][1] for j in range(k - 1, -1, -1) if times[j]), 0.0)
                nxt = next(((j, times[j][0]) for j in range(k + 1, len(times)) if times[j]), (len(times), dur))
                span = (nxt[1] - prev_e) / max(1, (nxt[0] - k + 1))
                times[k] = (prev_e, prev_e + span)
        words = []
        for ti, (disp, _) in enumerate(toks):
            ts = [times[j] for j, (_, t) in enumerate(say) if t == ti]
            if not ts:
                continue
            words.append({"t": disp, "s": round(ts[0][0], 3), "e": round(ts[-1][1], 3)})
        result[key] = {"duration": round(dur, 3), "words": words}
        ratio = sm.ratio()
        if ratio < 0.97:
            diff = [op for op in sm.get_opcodes() if op[0] != "equal"]
            details = []
            for tag, a0, a1, b0, b1 in diff:
                details.append(f'{tag}: "{" ".join(x[0] for x in say[a0:a1])}" -> "{" ".join(x[0] for x in aw[b0:b1])}"')
            report.append(f"{key} ratio={ratio:.3f} " + " | ".join(details))

out = ROOT / "remotion/src/data/vo.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(result, indent=1))
total = sum(v["duration"] for v in result.values())
print(f"clips={len(result)} total_audio={total:.1f}s")
print("\n".join(report) if report else "all clips match")
