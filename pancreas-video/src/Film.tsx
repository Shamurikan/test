import React from 'react';
import { AbsoluteFill, getStaticFiles, Sequence, staticFile } from 'remotion';
import { Audio } from '@remotion/media';
import { chapterFrames } from './lib/timeline';
import { CHAPTERS } from './chapters';

/**
 * The full film: chapters 0–9 on one track, laid over the edited narration.
 * public/final_audio.wav is produced by pipeline/build_timeline.py from the
 * user's TTS file. Until it exists, only the Chapter 0 sample audio plays.
 */
export const Film: React.FC = () => {
  const files = getStaticFiles().map((f) => f.name);
  const hasFull = files.includes('final_audio.wav');
  const hasCh0 = files.includes('audio/ch0_sample.wav');
  return (
    <AbsoluteFill style={{ backgroundColor: '#FBF7F0' }}>
      {CHAPTERS.map((Ch, i) => (
        <Sequence key={i} name={`Chapter ${i}`} {...chapterFrames(i)}>
          <Ch />
        </Sequence>
      ))}
      {hasFull ? (
        <Audio src={staticFile('final_audio.wav')} />
      ) : hasCh0 ? (
        <Sequence name="Ch0 sample audio" durationInFrames={chapterFrames(0).durationInFrames}>
          <Audio src={staticFile('audio/ch0_sample.wav')} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};

/** one chapter on its own (for preview / per-chapter renders) */
export const ChapterComp: React.FC<{ ch: number }> = ({ ch }) => {
  const Ch = CHAPTERS[ch];
  const files = getStaticFiles().map((f) => f.name);
  const { from } = chapterFrames(ch);
  return (
    <AbsoluteFill style={{ backgroundColor: '#FBF7F0' }}>
      <Ch />
      {files.includes('final_audio.wav') ? (
        <Audio src={staticFile('final_audio.wav')} trimBefore={from} />
      ) : ch === 0 && files.includes('audio/ch0_sample.wav') ? (
        <Audio src={staticFile('audio/ch0_sample.wav')} />
      ) : null}
    </AbsoluteFill>
  );
};
