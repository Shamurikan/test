import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile, useVideoConfig } from "remotion";
import { Audio, Video } from "@remotion/media";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { timeline, scene as sceneOf } from "./lib/timing";
import { C } from "./lib/theme";
import { blurSwap } from "./lib/blurSwap";
import { Captions } from "./Captions";
import { SCENES } from "./scenes";

/** A HyperFrames-rendered scene, cut out of the single HyperFrames render. */
const HfClip: React.FC<{ start: number }> = ({ start }) => {
  const { fps } = useVideoConfig();
  return (
    <AbsoluteFill>
      <Video src={staticFile("hf/hf.mp4")} trimBefore={Math.round(start * fps)} muted style={{ width: 1920, height: 1080 }} />
    </AbsoluteFill>
  );
};

const SceneById: React.FC<{ id: string }> = ({ id }) => {
  const s = sceneOf(id);
  if (s.engine === "hf") return <HfClip start={s.hfStart ?? 0} />;
  const Comp = SCENES[id];
  if (!Comp) return null;
  return <Comp />;
};

const Ground: React.FC = () => <Img src={staticFile("ground.png")} style={{ position: "absolute", inset: 0, width: 1920, height: 1080 }} />;

/** The narration clips for one scene, placed at the scene's own offsets. */
const SceneAudio: React.FC<{ id: string }> = ({ id }) => {
  const { fps } = useVideoConfig();
  return (
    <>
      {sceneOf(id).parts.map((p) => (
        <Sequence key={p.key} name={`vo ${p.key}`} from={Math.round(p.start * fps)} layout="none">
          <Audio src={staticFile(`vo/${p.key}.mp3`)} />
        </Sequence>
      ))}
    </>
  );
};

export const Main: React.FC = () => {
  const n = timeline.scenes.length;
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Ground />
      <TransitionSeries>
        {timeline.scenes.flatMap((s, i) => {
          const items = [
            <TransitionSeries.Sequence key={s.id} name={`${s.id} · ${s.title}`} durationInFrames={s.durationInFrames}>
              <SceneById id={s.id} />
            </TransitionSeries.Sequence>,
          ];
          if (i < n - 1)
            items.push(
              <TransitionSeries.Transition key={`tr-${s.id}`} presentation={blurSwap()} timing={linearTiming({ durationInFrames: timeline.transition })} />,
            );
          return items;
        })}
      </TransitionSeries>
      {timeline.scenes.map((s) => (
        <Sequence key={`a-${s.id}`} name={`narration ${s.id}`} from={s.from} durationInFrames={s.durationInFrames} layout="none">
          <SceneAudio id={s.id} />
        </Sequence>
      ))}
      <Captions />
    </AbsoluteFill>
  );
};

/** One scene on its own (for previews and stills). */
export const SceneSolo: React.FC<{ id: string }> = ({ id }) => {
  const s = sceneOf(id);
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      <Ground />
      <SceneById id={id} />
      <SceneAudio id={id} />
      <Captions offsetFrames={s.from} />
    </AbsoluteFill>
  );
};
