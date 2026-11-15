import React from "react";
import { Composition, Folder, staticFile } from "remotion";
import { loadFont } from "@remotion/fonts";
import { Main, SceneSolo } from "./Main";
import { timeline } from "./lib/timing";

loadFont({ family: "Fraunces", url: staticFile("fonts/fraunces-latin-full-normal.woff2"), weight: "100 900", style: "normal" });
loadFont({ family: "Fraunces", url: staticFile("fonts/fraunces-latin-full-italic.woff2"), weight: "100 900", style: "italic" });
loadFont({ family: "InterVar", url: staticFile("fonts/inter-latin-wght-normal.woff2"), weight: "100 900" });
loadFont({ family: "JBMono", url: staticFile("fonts/jetbrains-mono-latin-500-normal.woff2"), weight: "500" });

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Main" component={Main} durationInFrames={timeline.totalFrames} fps={timeline.fps} width={1920} height={1080} />
    <Folder name="Scenes">
      {timeline.scenes.map((s) => (
        <Composition
          key={s.id}
          id={`Scene-${s.id}`}
          component={SceneSolo}
          defaultProps={{ id: s.id }}
          durationInFrames={s.durationInFrames}
          fps={timeline.fps}
          width={1920}
          height={1080}
        />
      ))}
    </Folder>
  </>
);
