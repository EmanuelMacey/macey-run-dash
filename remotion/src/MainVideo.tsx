import { AbsoluteFill, useCurrentFrame, interpolate } from "remotion";
import { TransitionSeries, springTiming } from "@remotion/transitions";
import { wipe } from "@remotion/transitions/wipe";
import { slide } from "@remotion/transitions/slide";
import { fade } from "@remotion/transitions/fade";
import { Scene1Intro } from "./scenes/Scene1Intro";
import { Scene2Services } from "./scenes/Scene2Services";
import { Scene3Speed } from "./scenes/Scene3Speed";
import { Scene4Trust } from "./scenes/Scene4Trust";
import { Scene5CTA } from "./scenes/Scene5CTA";
import { COLORS } from "./colors";

const TRANSITION = 20;

export const MainVideo = () => {
  const frame = useCurrentFrame();

  // Persistent animated accent shapes
  const floatY1 = Math.sin(frame * 0.03) * 15;
  const floatY2 = Math.cos(frame * 0.025) * 20;

  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.navyDeep }}>
      {/* Persistent floating accents */}
      <div
        style={{
          position: "absolute",
          top: 80 + floatY1,
          right: 120,
          width: 300,
          height: 300,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.primary}22, transparent 70%)`,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 60 + floatY2,
          left: 80,
          width: 250,
          height: 250,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${COLORS.accent}18, transparent 70%)`,
          pointerEvents: "none",
        }}
      />

      <TransitionSeries>
        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene1Intro />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-left" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene2Services />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={slide({ direction: "from-bottom" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={110}>
          <Scene3Speed />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={120}>
          <Scene4Trust />
        </TransitionSeries.Sequence>
        <TransitionSeries.Transition
          presentation={wipe({ direction: "from-right" })}
          timing={springTiming({ config: { damping: 200 }, durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence durationInFrames={140}>
          <Scene5CTA />
        </TransitionSeries.Sequence>
      </TransitionSeries>
    </AbsoluteFill>
  );
};
