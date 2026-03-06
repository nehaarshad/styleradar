import ConstantColors from "../utils/constants";


function MatchBadge( score: number, size?: string  ) {
  const color = score >= 95 ? ConstantColors.matchHigh : score >= 90 ? ConstantColors.matchMid : ConstantColors.textMuted;
  const fontSize = size === "lg" ? "13px" : "11px";
  const padding = size === "lg" ? "5px 10px" : "3px 8px";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",   
        gap: 4,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: 20,
        color,
        fontSize,
        fontWeight: 600,
        padding,
        letterSpacing: "0.03em",
        fontFamily: "'DM Mono', monospace",
      }}
    >
      <span style={{ fontSize: size === "lg" ? 9 : 7, lineHeight: 1 }}>◆</span>
      {score}% match
    </span>
  );
}