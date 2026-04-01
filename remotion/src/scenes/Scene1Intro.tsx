import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, staticFile, Img } from "remotion";
import { COLORS } from "../colors";
import { displayFont, bodyFont } from "../fonts";

export const Scene1Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Blue diagonal wipe reveal
  const wipeX = interpolate(frame, [0, 20], [-120, 0], { extrapolateRight: "clamp" });

  // Logo entrance
  const logoScale = spring({ frame: frame - 8, fps, config: { damping: 12, stiffness: 150 } });
  const logoOpacity = interpolate(frame, [8, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Title lines stagger
  const line1X = interpolate(spring({ frame: frame - 20, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [200, 0]);
  const line1Op = interpolate(frame, [20, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const line2X = interpolate(spring({ frame: frame - 28, fps, config: { damping: 18, stiffness: 180 } }), [0, 1], [200, 0]);
  const line2Op = interpolate(frame, [28, 38], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  // Subtitle
  const subOp = interpolate(frame, [42, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const subY = interpolate(spring({ frame: frame - 42, fps, config: { damping: 20 } }), [0, 1], [30, 0]);

  // Rider image
  const riderScale = spring({ frame: frame - 15, fps, config: { damping: 14, stiffness: 120 } });
  const riderFloat = Math.sin(frame * 0.06) * 8;

  // Accent bar
  const barWidth = interpolate(frame, [35, 55], [0, 280], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      {/* Background with diagonal gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${COLORS.navyDeep} 0%, ${COLORS.navy} 50%, ${COLORS.primaryDark} 100%)`,
        transform: `translateX(${wipeX}%)`,
      }} />

      {/* Geometric accent */}
      <div style={{
        position: "absolute", top: -100, right: -100,
        width: 600, height: 600,
        borderRadius: "50%",
        border: `3px solid ${COLORS.primary}30`,
        opacity: interpolate(frame, [10, 30], [0, 0.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }} />

      {/* Content */}
      <div style={{ display: "flex", height: "100%", alignItems: "center", padding: "0 100px" }}>
        {/* Left side - text */}
        <div style={{ flex: 1, zIndex: 2 }}>
          {/* Logo */}
          <div style={{
            transform: `scale(${logoScale})`,
            opacity: logoOpacity,
            marginBottom: 30,
          }}>
            <Img src={staticFile("images/logo.png")} style={{ width: 90, height: 90 }} />
          </div>

          <div style={{
            transform: `translateX(${line1X}px)`,
            opacity: line1Op,
            fontFamily: displayFont,
            fontSize: 82,
            fontWeight: 700,
            color: COLORS.white,
            lineHeight: 1.05,
          }}>
            YOUR ERRANDS.
          </div>

          <div style={{
            transform: `translateX(${line2X}px)`,
            opacity: line2Op,
            fontFamily: displayFont,
            fontSize: 82,
            fontWeight: 700,
            color: COLORS.accent,
            lineHeight: 1.05,
            marginBottom: 10,
          }}>
            OUR RUNNERS.
          </div>

          {/* Accent bar */}
          <div style={{
            width: barWidth,
            height: 5,
            background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.primary})`,
            borderRadius: 3,
            marginBottom: 25,
          }} />

          <div style={{
            opacity: subOp,
            transform: `translateY(${subY}px)`,
            fontFamily: bodyFont,
            fontSize: 28,
            color: COLORS.gray,
            fontWeight: 500,
            maxWidth: 500,
            letterSpacing: 1,
          }}>
            Fast, reliable delivery across Guyana — from groceries to documents.
          </div>
        </div>

        {/* Right side - rider */}
        <div style={{
          flex: 0.8,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 2,
        }}>
          <div style={{
            transform: `scale(${riderScale}) translateY(${riderFloat}px)`,
            filter: `drop-shadow(0 30px 60px rgba(0,0,0,0.4))`,
          }}>
            <Img src={staticFile("images/delivery-rider.png")} style={{ width: 450, height: "auto" }} />
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
