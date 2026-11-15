"""Edit the narration into the final soundtrack and map every word to final time.
Writes: final_audio.wav, timeline.json
"""
import json, subprocess
import numpy as np
from scipy.io import wavfile

SR = 24000
al = json.load(open('align.json'))
src = np.frombuffer(subprocess.run(
    ['ffmpeg', '-v', 'error', '-i', 'audio_in/narration.m4a', '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'],
    capture_output=True, check=True).stdout, dtype=np.int16)

B = {b['block']: b for b in al}
by_ch = {}
for b in al:
    if b['chapter'] >= 0: by_ch.setdefault(b['chapter'], []).append(b)

def sent_end_times(block):
    """end time of each sentence in a block (source time)"""
    out = []
    for w in block['words']:
        if w['w'][-1] in '.?!': out.append(w['e'])
    return out

# ---- edit decision list: list of ('seg', a, b, tag) or ('sil', dur, tag) ----
edl = [('sil', 0.6, 'lead-in')]
ch0 = by_ch[0]
edl.append(('seg', ch0[1]['s'] - 0.25, ch0[-1]['e'] + 0.35, 'ch0'))   # skip title + "Chapter zero"
edl.append(('sil', 3.6, 'main-title'))
for c in range(1, 10):
    blocks = by_ch[c]
    a = blocks[0]['s'] - 0.30
    b = blocks[-1]['e'] + 0.35
    cuts = []
    if c == 8:  # reference card hold after "The duodenum controls its own input."
        cuts.append((B[82]['e'] + 0.30, 4.5, 'ref-card'))
    if c == 9:  # recall question holds
        ends = sent_end_times(B[89])
        for k, t in enumerate(ends[2:5]):
            cuts.append((t + 0.30, 7.5, f'q{k+1}-hold'))
    pos = a
    for (t, dur, tag) in cuts:
        edl.append(('seg', pos, t, f'ch{c}'))
        edl.append(('sil', dur, tag))
        pos = t
    edl.append(('seg', pos, b, f'ch{c}'))
    edl.append(('sil', 0.9 if c < 9 else 3.0, 'gap' if c < 9 else 'tail'))

# ---- assemble audio + time map ----
pieces, tmap, t = [], [], 0.0
for op in edl:
    if op[0] == 'sil':
        pieces.append(np.zeros(int(round(op[1] * SR)), np.int16))
        tmap.append({'kind': 'sil', 'tag': op[2], 't0': round(t, 3), 't1': round(t + op[1], 3)})
        t += op[1]
    else:
        _, a, b, tag = op
        ia, ib = int(round(a * SR)), min(len(src), int(round(b * SR)))
        if ib - ia < 480: continue
        seg = src[ia:ib].astype(np.float32)
        f = int(0.01 * SR)  # 10 ms micro-fades at cuts
        seg[:f] *= np.linspace(0, 1, f); seg[-f:] *= np.linspace(1, 0, f)
        pieces.append(seg.astype(np.int16))
        tmap.append({'kind': 'seg', 'tag': tag, 'src0': a, 'src1': b, 't0': round(t, 3), 't1': round(t + (ib - ia) / SR, 3)})
        t += (ib - ia) / SR
audio = np.concatenate(pieces)
wavfile.write('final_audio.wav', SR, audio)

def to_final(ts):
    for m in tmap:
        if m['kind'] == 'seg' and m['src0'] - 1e-6 <= ts <= m['src1'] + 1e-6:
            return round(m['t0'] + ts - m['src0'], 3)
    return None

blocks_out = []
for b in al:
    if b['block'] <= 1: continue
    ws = [{'w': w['w'], 's': to_final(w['s']), 'e': to_final(w['e'])} for w in b['words']]
    blocks_out.append({'block': b['block'], 'chapter': b['chapter'], 'header': b['header'],
                       's': ws[0]['s'], 'e': ws[-1]['e'], 'text': b['text'], 'words': ws})

# chapter spans in final time: chapter starts at the silence before its header (title card)
chap = []
for c in range(10):
    segs = [m for m in tmap if m['kind'] == 'seg' and m['tag'] == f'ch{c}']
    chap.append({'chapter': c, 't0': segs[0]['t0'], 't1': segs[-1]['t1']})
# hand chapter boundaries to the middle of the inter-chapter gap
for c in range(10):
    if c == 0: chap[c]['t0'] = 0.0
    if c < 9:
        gap_end = chap[c + 1]['t0']
        chap[c]['t1'] = round(gap_end - 0.15, 3)
        chap[c + 1]['t0'] = chap[c]['t1']
    else:
        chap[c]['t1'] = round(t, 3)
# Chapter 0 also owns the main title hold
json.dump({'duration': round(t, 3), 'chapters': chap, 'edl': tmap, 'blocks': blocks_out},
          open('timeline.json', 'w'), indent=0)
print('final duration', round(t, 2))
for c in chap: print(c)
print([m for m in tmap if m['kind'] == 'sil'])
