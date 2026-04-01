import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "../colors";
import { displayFont, bodyFont } from "../fonts";

const stats = [
  { value: "500+", label: "Deliveries Done", color: COLORS.primary },
  { value: "4.9★", label: "Customer Rating", color: COLORS.accent },
  { value: "24/7", label: "Live Support", color: COLORS.primary },
];

export const Scene4Trust = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleOp = interpolate(frame, [5, 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const titleY = interpolate(spring({ frame: frame - 5, fps, config: { damping: 18 } }), [0, 1], [40, 0]);

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(160deg, ${COLORS.navyDeep} 0%, ${COLORS.navy} 100%)`,
      }} />

      {/* Grid pattern overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(${COLORS.white}06 1px, transparent 1px), linear-gradient(90deg, ${COLORS.white}06 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
        opacity: 0.5,
      }} />

      <div style={{
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        height: "100%", padding: "0 80px", zIndex: 2, position: "relative",
      }}>
        <div style={{
          opacity: titleOp,
          transform: `translateY(${titleY}px)`,
          fontFamily: displayFont,
          fontSize: 52,
          fontWeight: 700,
          color: COLORS.white,
          marginBottom: 16,
          textAlign: "center",
        }}>
          Trusted Across <span style={{ color: COLORS.accent }}>Guyana</span>
        </div>

        <div style={{
          opacity: titleOp,
          fontFamily: bodyFont,
          fontSize: 22,
          color: COLORS.gray,
          marginBottom: 70,
          textAlign: "center",
        }}>
          Real numbers. Real trust. Real service.
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: 60 }}>
          {stats.map((s, i) => {
            const delay = 25 + i * 15;
            const scale = spring({ frame: frame - delay, fps, config: { damping: 10, stiffness: 150 } });
            const op = interpolate(frame, [delay, delay + 15], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

            // Counter pulse
            const pulse = 1 + Math.sin((frame - delay) * 0.08) * 0.02;

            return (
              <div key={i} style={{
                transform: `scale(${scale})`,
                opacity: op,
                textAlign: "center",
                padding: "50px 60px",
                borderRadius: 28,
                background: `${COLORS.white}08`,
                border: `1px solid ${COLORS.white}15`,
                backdropFilter: "none",
              }}>
                <div style={{
                  fontFamily: displayFont,
                  fontSize: 72,
                  fontWeight: 700,
                  color: s.color,
                  transform: `scale(${pulse})`,
                  lineHeight: 1.1,
                }}>{s.value}</div>
                <div style={{
                  fontFamily: bodyFont,
                  fontSize: 18,
                  color: `${COLORS.white}AA`,
                  marginTop: 10,
                  fontWeight: 500,
                  letterSpacing: 1,
                }}>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* Trust badges */}
        <div style={{
          display: "flex", gap: 30, marginTop: 50,
          opacity: interpolate(frame, [70, 85], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          {["🛡️ Insured Packages", "💳 Cash or Card", "📍 Real-Time Tracking"].map((badge, i) => (
            <div key={i} style={{
              fontFamily: bodyFont,
              fontSize: 16,
              color: `${COLORS.white}CC`,
              padding: "10px 20px",
              borderRadius: 40,
              border: `1px solid ${COLORS.white}20`,
              fontWeight: 500,
            }}>{badge}</div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
