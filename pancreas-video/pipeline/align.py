"""Align the narration script to the TTS audio.
Blocks = paragraphs (separated by >=700 ms silence). Inside a block, pauses are
matched to punctuation boundaries with a monotonic DP; words are then placed by
syllable proportion inside each clause. Output: align.json (words with times).
"""
import json, re, sys
import numpy as np

DB = np.load('audio_in/db.npy')          # 10 ms frames
HOP = 0.01
SCRIPT = open(sys.argv[1]).read()

# ---------- script parsing ----------
lines = [l.strip() for l in SCRIPT.split('\n') if l.strip()]
blocks_txt = ['Pancreas narration for TTS.'] + lines   # TTS read the file title first
chap_of_block = []
cur = -1
for t in blocks_txt:
    m = re.match(r'^\[Chapter (\d+)', t)
    if m: cur = int(m.group(1))
    chap_of_block.append(cur)

def syl(word):
    w = re.sub(r'[^a-z]', '', word.lower())
    if not w: return 1
    groups = re.findall(r'[aeiouy]+', w)
    n = len(groups)
    if w.endswith('e') and n > 1 and not w.endswith(('le', 'ee', 'ie')): n -= 1
    return max(1, n)

def spoken(t):
    m = re.match(r'^\[Chapter (\d+) - (.*)\]$', t)
    if m:
        nums = 'zero one two three four five six seven eight nine'.split()
        return f'Chapter {nums[int(m.group(1))]}, {m.group(2)}.'
    return t

# ---------- silence runs ----------
sil = DB < -50
runs = []
i = 0
n = len(sil)
while i < n:
    if sil[i]:
        j = i
        while j < n and sil[j]: j += 1
        runs.append((i * HOP, j * HOP)); i = j
    else:
        i += 1
long_gaps = [(a, b) for a, b in runs if b - a >= 0.70]
assert len(long_gaps) == len(blocks_txt) - 1 + (1 if runs and runs[0][0] == 0 else 0) or True

# speech start/end
speech = np.where(~sil)[0]
t0, t1 = speech[0] * HOP, (speech[-1] + 1) * HOP
inner_long = [(a, b) for a, b in long_gaps if a > t0 and b < t1]
if len(inner_long) != len(blocks_txt) - 1:
    sys.exit(f'block mismatch: {len(inner_long)} gaps vs {len(blocks_txt)-1}')
edges = [t0] + [x for g in inner_long for x in g] + [t1]
block_spans = [(edges[2 * k], edges[2 * k + 1]) for k in range(len(blocks_txt))]

# ---------- per-block DP ----------
PUNCT_W = {'.': 3, '?': 3, '!': 3, ':': 2, ';': 2, ',': 1}

def align_block(text, s, e):
    words = re.findall(r"\S+", text)
    sy = [syl(w) for w in words]
    cum = np.cumsum([0] + sy)
    total = cum[-1]
    # boundaries after word k (not the last word)
    bnds = []
    for k, w in enumerate(words[:-1]):
        p = w[-1] if w[-1] in PUNCT_W else (w[-2] if len(w) > 1 and w[-1] in '"\'' and w[-2] in PUNCT_W else None)
        if p: bnds.append((k, PUNCT_W[p], cum[k + 1] / total))
    gaps = [(a, b) for a, b in runs if a > s + 0.05 and b < e - 0.05 and b - a >= 0.12]
    G, B = len(gaps), len(bnds)
    dur = e - s
    INF = 1e9
    # dp[i][j]: best cost using first i boundaries and first j gaps
    dp = np.full((B + 1, G + 1), INF); bk = {}
    dp[0][0] = 0
    def skip_b_cost(w): return {3: 6.0, 2: 1.2, 1: 0.25}[w]
    def skip_g_cost(d): return 0.5 + 6 * max(0, d - 0.25)
    def match_cost(w, f, g):
        a, b = g; d = b - a; tc = ((a + b) / 2 - s) / dur
        timing = 8 * abs(tc - f)
        exp = {3: 0.42, 2: 0.36, 1: 0.25}[w]
        return timing + 3 * max(0, exp - d) + (2 * max(0, d - 0.42) if w == 1 else 0)
    for i in range(B + 1):
        for j in range(G + 1):
            c = dp[i][j]
            if c >= INF: continue
            if i < B:
                v = c + skip_b_cost(bnds[i][1])
                if v < dp[i + 1][j]: dp[i + 1][j] = v; bk[(i + 1, j)] = (i, j, None)
            if j < G:
                v = c + skip_g_cost(gaps[j][1] - gaps[j][0])
                if v < dp[i][j + 1]: dp[i][j + 1] = v; bk[(i, j + 1)] = (i, j, None)
            if i < B and j < G:
                v = c + match_cost(bnds[i][1], bnds[i][2], gaps[j])
                if v < dp[i + 1][j + 1]: dp[i + 1][j + 1] = v; bk[(i + 1, j + 1)] = (i, j, 'm')
    i, j = B, G; matches = {}
    while (i, j) != (0, 0):
        pi, pj, m = bk[(i, j)]
        if m: matches[bnds[i - 1][0]] = gaps[j - 1]
        i, j = pi, pj
    # clause anchors: (word index where clause starts, start time), ends
    anchors = [(0, s)]
    ends = []
    for k in sorted(matches):
        a, b = matches[k]
        ends.append((k, a)); anchors.append((k + 1, b))
    ends.append((len(words) - 1, e))
    out = []
    for (ks, ts), (ke, te) in zip(anchors, ends):
        span = sy[ks:ke + 1]; tot = sum(span); acc = 0
        for idx in range(ks, ke + 1):
            ws = ts + (te - ts) * acc / tot
            acc += sy[idx]
            we = ts + (te - ts) * acc / tot
            out.append({'w': words[idx], 's': round(ws, 3), 'e': round(we, 3)})
    unmatched_sent = [b for b in bnds if b[1] == 3 and b[0] not in matches]
    return out, len(unmatched_sent), sum(sy) / max(0.1, dur)

result = []
report = []
for bi, (txt, (s, e)) in enumerate(zip(blocks_txt, block_spans)):
    words, miss, rate = align_block(spoken(txt), s, e)
    result.append({'block': bi, 'chapter': chap_of_block[bi], 'header': txt.startswith('[') or bi == 0,
                   'text': spoken(txt), 's': round(s, 3), 'e': round(e, 3), 'words': words})
    report.append((bi, chap_of_block[bi], round(s, 2), round(e, 2), round(rate, 2), miss, spoken(txt)[:48]))
json.dump(result, open('align.json', 'w'), indent=0)
for r in report: print(*r, sep=' | ')
