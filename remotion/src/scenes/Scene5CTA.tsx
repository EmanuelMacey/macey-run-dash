import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile, Img } from "remotion";
import { COLORS } from "../colors";
import { displayFont, bodyFont } from "../fonts";

export const Scene5CTA = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Logo slam
  const logoScale = spring({ frame: frame - 5, fps, config: { damping: 8, stiffness: 200 } });
  const logoOp = interpolate(frame, [5, 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Title
  const titleOp = interpolate(frame, [18, 32], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 18, fps, config: { damping: 15, stiffness: 160 } }), [0, 1], [50, 0]);

  // CTA button
  const btnScale = spring({ frame: frame - 40, fps, config: { damping: 10, stiffness: 130 } });
  const btnOp = interpolate(frame, [40, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Pulsing glow behind button
  const glowScale = 1 + Math.sin(frame * 0.08) * 0.08;
  const glowOp = 0.3 + Math.sin(frame * 0.08) * 0.15;

  // Website text
  const webOp = interpolate(frame, [60, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Closing brand flash
  const flashOp = interpolate(frame, [100, 110, 120, 130], [0, 0.15, 0.15, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${COLORS.navyDeep} 0%, ${COLORS.primaryDark} 50%, ${COLORS.navy} 100%)`,
      }} />

      {/* Radial glow center */}
      <div style={{
        position: "absolute",
        top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: 900, height: 900,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${COLORS.primary}20, transparent 70%)`,
      }} />

      {/* Closing flash */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundColor: COLORS.white,
        opacity: flashOp,
      }} />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100%", zIndex: 2, position: "relative",
      }}>
        {/* Logo */}
        <div style={{
          transform: `scale(${logoScale})`,
          opacity: logoOp,
          marginBottom: 30,
        }}>
          <Img src={staticFile("images/logo.png")} style={{ width: 120, height: 120, borderRadius: 24 }} />
        </div>

        {/* Title */}
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: displayFont,
          fontSize: 72,
          fontWeight: 700,
          color: COLORS.white,
          textAlign: "center",
          lineHeight: 1.15,
          marginBottom: 10,
        }}>
          Ready to <span style={{ color: COLORS.accent }}>Run</span>?
        </div>

        <div style={{
          opacity: titleOp,
          fontFamily: bodyFont,
          fontSize: 26,
          color: `${COLORS.white}BB`,
          textAlign: "center",
          marginBottom: 50,
          fontWeight: 500,
        }}>
          Download the app or visit us online today.
        </div>

        {/* CTA Button */}
        <div style={{ position: "relative" }}>
          {/* Glow */}
          <div style={{
            position: "absolute",
            top: "50%", left: "50%",
            transform: `translate(-50%, -50%) scale(${glowScale})`,
            width: 360, height: 80,
            borderRadius: 50,
            background: COLORS.accent,
            opacity: glowOp,
            filter: "blur(30px)",
          }} />

          <div style={{
            transform: `scale(${btnScale})`,
            opacity: btnOp,
            fontFamily: displayFont,
            fontSize: 26,
            fontWeight: 700,
            color: COLORS.white,
            background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.primary})`,
            padding: "22px 70px",
            borderRadius: 50,
            position: "relative",
            letterSpacing: 1,
          }}>
            ORDER NOW →
          </div>
        </div>

        {/* Website */}
        <div style={{
          opacity: webOp,
          fontFamily: bodyFont,
          fontSize: 20,
          color: `${COLORS.white}88`,
          marginTop: 40,
          fontWeight: 500,
          letterSpacing: 2,
        }}>
          macey-run-dash.lovable.app
        </div>
      </div>
    </AbsoluteFill>
  );
};
