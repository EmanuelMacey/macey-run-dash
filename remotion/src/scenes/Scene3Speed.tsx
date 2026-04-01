import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "../colors";
import { displayFont, bodyFont } from "../fonts";

export const Scene3Speed = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Big number animation
  const numProgress = interpolate(frame, [10, 50], [0, 15], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const numScale = spring({ frame: frame - 8, fps, config: { damping: 10, stiffness: 120 } });

  // "MIN" text
  const minOp = interpolate(frame, [35, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const minX = interpolate(spring({ frame: frame - 35, fps, config: { damping: 18 } }), [0, 1], [40, 0]);

  // Subtitle
  const subOp = interpolate(frame, [50, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Speed lines
  const lineProgress = interpolate(frame, [5, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pulsing ring
  const ringScale = interpolate(frame % 60, [0, 60], [0.8, 1.3]);
  const ringOp = interpolate(frame % 60, [0, 30, 60], [0.4, 0.15, 0.4]);

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.primaryDark} 60%, ${COLORS.navy} 100%)`,
      }} />

      {/* Speed lines */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{
          position: "absolute",
          top: 180 + i * 160,
          left: 0,
          width: `${lineProgress * (60 + i * 10)}%`,
          height: 2,
          background: `linear-gradient(90deg, transparent, ${COLORS.white}${i < 2 ? "30" : "15"})`,
          borderRadius: 2,
        }} />
      ))}

      {/* Pulsing ring behind number */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: `translate(-50%, -50%) scale(${ringScale})`,
        width: 500, height: 500,
        borderRadius: "50%",
        border: `3px solid ${COLORS.white}`,
        opacity: ringOp,
      }} />

      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        zIndex: 2,
        position: "relative",
      }}>
        {/* Big number */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <div style={{
            fontFamily: displayFont,
            fontSize: 260,
            fontWeight: 700,
            color: COLORS.white,
            transform: `scale(${numScale})`,
            lineHeight: 1,
          }}>
            {Math.round(numProgress)}
          </div>
          <div style={{
            opacity: minOp,
            transform: `translateX(${minX}px)`,
            fontFamily: displayFont,
            fontSize: 80,
            fontWeight: 700,
            color: COLORS.accentLight,
          }}>
            MIN
          </div>
        </div>

        <div style={{
          fontFamily: displayFont,
          fontSize: 42,
          fontWeight: 600,
          color: COLORS.white,
          opacity: minOp,
          marginTop: -10,
          letterSpacing: 6,
        }}>
          AVERAGE DELIVERY
        </div>

        <div style={{
          opacity: subOp,
          fontFamily: bodyFont,
          fontSize: 24,
          color: `${COLORS.white}BB`,
          marginTop: 30,
          fontWeight: 500,
        }}>
          The fastest runners in Georgetown — guaranteed.
        </div>
      </div>
    </AbsoluteFill>
  );
};
