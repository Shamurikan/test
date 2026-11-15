"""Replace scene frame ranges in the master render with re-rendered patches (video only; audio kept).
usage: python3 -I script/splice.py out/main_raw.mp4 out/main_patched.mp4 s09:5574-6149 ...
Patches are read from out/patch/<id>.mp4 (rendered with `remotion render Main --frames=a-b`)."""
import subprocess, sys
src, dst, *specs = sys.argv[1:]
patches = []
for sp in specs:
    sid, rng = sp.split(":")
    a, b = map(int, rng.split("-"))
    patches.append((a, b, f"out/patch/{sid}.mp4"))
patches.sort()
inputs = ["-i", src]
parts, cursor, n = [], 0, 0
for i, (a, b, f) in enumerate(patches, start=1):
    inputs += ["-i", f]
    parts.append(f"[0:v]trim=start_frame={cursor}:end_frame={a},setpts=PTS-STARTPTS[m{n}]"); n += 1
    parts.append(f"[{i}:v]setpts=PTS-STARTPTS[m{n}]"); n += 1
    cursor = b + 1
parts.append(f"[0:v]trim=start_frame={cursor},setpts=PTS-STARTPTS[m{n}]"); n += 1
graph = ";".join(parts) + ";" + "".join(f"[m{k}]" for k in range(n)) + f"concat=n={n}:v=1:a=0[v]"
cmd = ["ffmpeg", "-hide_banner", "-y", *inputs, "-filter_complex", graph, "-map", "[v]", "-map", "0:a",
       "-c:v", "libx264", "-preset", "veryfast", "-crf", "12", "-pix_fmt", "yuv420p", "-c:a", "copy", dst]
subprocess.run(cmd, check=True)
