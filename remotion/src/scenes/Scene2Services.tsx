import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { COLORS } from "../colors";
import { displayFont, bodyFont } from "../fonts";

const services = [
  { emoji: "🛒", title: "Groceries", desc: "Fresh from the market" },
  { emoji: "💊", title: "Pharmacy", desc: "Medications delivered" },
  { emoji: "📄", title: "Documents", desc: "Secure handling" },
  { emoji: "🛍️", title: "Retail", desc: "Shop anywhere" },
];

export const Scene2Services = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Section title
  const titleScale = spring({ frame: frame - 5, fps, config: { damping: 15, stiffness: 200 } });
  const titleOp = interpolate(frame, [5, 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(160deg, ${COLORS.white} 0%, ${COLORS.offWhite} 100%)`,
      }} />

      {/* Decorative diagonal */}
      <div style={{
        position: "absolute", top: 0, right: 0,
        width: "45%", height: "100%",
        background: `linear-gradient(135deg, ${COLORS.primary}08, ${COLORS.primary}15)`,
        clipPath: "polygon(20% 0, 100% 0, 100% 100%, 0% 100%)",
      }} />

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", padding: "0 80px" }}>
        {/* Title */}
        <div style={{
          transform: `scale(${titleScale})`,
          opacity: titleOp,
          fontFamily: displayFont,
          fontSize: 56,
          fontWeight: 700,
          color: COLORS.navy,
          marginBottom: 12,
        }}>
          We Deliver <span style={{ color: COLORS.accent }}>Everything</span>
        </div>
        <div style={{
          opacity: titleOp,
          fontFamily: bodyFont,
          fontSize: 22,
          color: COLORS.gray,
          marginBottom: 60,
        }}>
          From errands to essentials — we've got you covered.
        </div>

        {/* Cards grid */}
        <div style={{ display: "flex", gap: 32 }}>
          {services.map((s, i) => {
            const delay = 20 + i * 12;
            const cardScale = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 180 } });
            const cardOp = interpolate(frame, [delay, delay + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
            const cardY = interpolate(spring({ frame: frame - delay, fps, config: { damping: 15 } }), [0, 1], [60, 0]);

            return (
              <div key={i} style={{
                transform: `scale(${cardScale}) translateY(${cardY}px)`,
                opacity: cardOp,
                background: "white",
                borderRadius: 24,
                padding: "48px 36px",
                width: 260,
                textAlign: "center",
                boxShadow: `0 20px 50px ${COLORS.primary}12`,
                border: `1px solid ${COLORS.primary}15`,
              }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>{s.emoji}</div>
                <div style={{
                  fontFamily: displayFont,
                  fontSize: 26,
                  fontWeight: 700,
                  color: COLORS.navy,
                  marginBottom: 8,
                }}>{s.title}</div>
                <div style={{
                  fontFamily: bodyFont,
                  fontSize: 16,
                  color: COLORS.gray,
                  fontWeight: 500,
                }}>{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
