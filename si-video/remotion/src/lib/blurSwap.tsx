import React from "react";
import { AbsoluteFill } from "remotion";
import type { TransitionPresentation, TransitionPresentationComponentProps } from "@remotion/transitions";

// "Blur swap on one stage" (HyperFrames motion guide): the ground never cuts;
// the outgoing scene blurs and fades, the incoming one sharpens in.
const BlurSwap: React.FC<TransitionPresentationComponentProps<Record<string, never>>> = ({ children, presentationDirection, presentationProgress }) => {
  const p = presentationProgress;
  const exiting = presentationDirection === "exiting";
  const opacity = exiting ? 1 - Math.min(1, p * 1.4) : Math.min(1, Math.max(0, (p - 0.25) / 0.75));
  const blur = exiting ? p * 10 : (1 - p) * 8;
  return <AbsoluteFill style={{ opacity, filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>{children}</AbsoluteFill>;
};

export const blurSwap = (): TransitionPresentation<Record<string, never>> => ({ component: BlurSwap, props: {} });
