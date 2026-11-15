// Generates narration with Fish Audio TTS, then transcribes each clip with
// Fish Audio ASR to get word-level timestamps.
// The network proxy injects credentials for api.fish.audio.
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const VOICE = "bf322df2096a46f18c579d0baa36f41d"; // "Adrian", a steady narrator voice
const SPEED = 1.1;
const scenes = JSON.parse(fs.readFileSync(path.join(ROOT, "script/scenes.json"), "utf8"));
const voDir = path.join(ROOT, "remotion/public/vo");
const asrDir = path.join(ROOT, "script/asr");
fs.mkdirSync(voDir, { recursive: true });
fs.mkdirSync(asrDir, { recursive: true });

export const sayText = (t) => t.replace(/\{([^|}]+)\|([^}]+)\}/g, "$2");

const jobs = [];
for (const s of scenes) {
  s.parts.forEach((p, i) => {
    const key = p.id ? `${s.id}_${p.id}` : s.parts.length > 1 ? `${s.id}_${i}` : s.id;
    jobs.push({ key, say: sayText(p.text) });
  });
}

async function tts({ key, say }) {
  const out = path.join(voDir, `${key}.mp3`);
  if (fs.existsSync(out) && fs.statSync(out).size > 1000) return;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch("https://api.fish.audio/v1/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json", model: "s1" },
      body: JSON.stringify({
        text: say,
        reference_id: VOICE,
        format: "mp3",
        mp3_bitrate: 192,
        normalize: true,
        prosody: { speed: SPEED },
      }),
    });
    if (res.ok) {
      fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
      console.log("tts", key);
      return;
    }
    console.warn("tts retry", key, res.status, await res.text());
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  throw new Error("tts failed " + key);
}

async function asr({ key }) {
  const out = path.join(asrDir, `${key}.json`);
  if (fs.existsSync(out)) return;
  const buf = fs.readFileSync(path.join(voDir, `${key}.mp3`));
  for (let attempt = 0; attempt < 4; attempt++) {
    const fd = new FormData();
    fd.append("audio", new Blob([buf], { type: "audio/mpeg" }), `${key}.mp3`);
    fd.append("language", "en");
    fd.append("ignore_timestamps", "false");
    const res = await fetch("https://api.fish.audio/v1/asr", { method: "POST", body: fd });
    if (res.ok) {
      fs.writeFileSync(out, JSON.stringify(await res.json(), null, 1));
      console.log("asr", key);
      return;
    }
    console.warn("asr retry", key, res.status, await res.text());
    await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
  }
  throw new Error("asr failed " + key);
}

async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) await fn(items[i++]);
    }),
  );
}

await pool(jobs, 4, tts);
await pool(jobs, 4, asr);
console.log("done", jobs.length);
