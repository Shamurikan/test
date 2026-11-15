import React from 'react';
import { Composition, Folder, staticFile } from 'remotion';
import { loadFont } from '@remotion/fonts';
import { Film, ChapterComp } from './Film';
import { chapterFrames, DURATION_FRAMES, FPS } from './lib/timeline';

// Inter (OFL) bundled locally so renders never depend on system fonts
for (const [w, f] of [
  ['400', 'Inter-Regular'],
  ['500', 'Inter-Medium'],
  ['600', 'Inter-SemiBold'],
  ['700', 'Inter-Bold'],
  ['800', 'Inter-ExtraBold'],
] as const) {
  loadFont({ family: 'Inter', url: staticFile(`fonts/${f}.otf`), weight: w, format: 'opentype' });
}
loadFont({ family: 'Inter', url: staticFile('fonts/Inter-Italic.otf'), weight: '400', style: 'italic', format: 'opentype' });
loadFont({ family: 'Inter', url: staticFile('fonts/Inter-MediumItalic.otf'), weight: '500', style: 'italic', format: 'opentype' });

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition id="PancreasFilm" component={Film} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
      <Folder name="Chapters">
        <Composition id="Ch0" component={ChapterComp} durationInFrames={chapterFrames(0).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 0 }} />
        <Composition id="Ch1" component={ChapterComp} durationInFrames={chapterFrames(1).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 1 }} />
        <Composition id="Ch2" component={ChapterComp} durationInFrames={chapterFrames(2).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 2 }} />
        <Composition id="Ch3" component={ChapterComp} durationInFrames={chapterFrames(3).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 3 }} />
        <Composition id="Ch4" component={ChapterComp} durationInFrames={chapterFrames(4).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 4 }} />
        <Composition id="Ch5" component={ChapterComp} durationInFrames={chapterFrames(5).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 5 }} />
        <Composition id="Ch6" component={ChapterComp} durationInFrames={chapterFrames(6).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 6 }} />
        <Composition id="Ch7" component={ChapterComp} durationInFrames={chapterFrames(7).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 7 }} />
        <Composition id="Ch8" component={ChapterComp} durationInFrames={chapterFrames(8).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 8 }} />
        <Composition id="Ch9" component={ChapterComp} durationInFrames={chapterFrames(9).durationInFrames} fps={FPS} width={1920} height={1080} defaultProps={{ ch: 9 }} />
      </Folder>
    </>
  );
};
