const ACCENT = "#E8242A";       // vivid red — equals button & tint
const OPERATOR = "#C0392B";    // deep crimson — operator buttons

const Colors = {
  light: {
    tint: ACCENT,
    tabIconDefault: "#ccc",
    tabIconSelected: ACCENT,

    gradientStart: "#FFE8E8",
    gradientMid: "#FFD0D5",
    gradientEnd: "#FFF5F5",

    glass: "rgba(255, 255, 255, 0.45)",
    glassBorder: "rgba(255, 255, 255, 0.70)",
    glassShadow: "rgba(200, 50, 50, 0.18)",

    displayText: "#3a0808",
    displaySubText: "rgba(58, 8, 8, 0.42)",

    buttonNumBg: "rgba(255, 255, 255, 0.58)",
    buttonNumText: "#3a0808",
    buttonNumBorder: "rgba(255, 255, 255, 0.82)",

    buttonOpBg: "rgba(192, 57, 43, 0.14)",
    buttonOpText: OPERATOR,
    buttonOpBorder: "rgba(192, 57, 43, 0.30)",

    buttonTopBg: "rgba(232, 36, 42, 0.10)",
    buttonTopText: "#a01818",
    buttonTopBorder: "rgba(232, 36, 42, 0.22)",

    buttonEqBg: ACCENT,
    buttonEqText: "#ffffff",
    buttonEqBorder: "#FF5555",

    buttonZeroBg: "rgba(255, 255, 255, 0.58)",
    buttonZeroText: "#3a0808",
  },
  dark: {
    tint: ACCENT,
    tabIconDefault: "#555",
    tabIconSelected: ACCENT,

    gradientStart: "#180606",
    gradientMid: "#200b0b",
    gradientEnd: "#1e1010",

    glass: "rgba(255, 255, 255, 0.07)",
    glassBorder: "rgba(255, 100, 100, 0.18)",
    glassShadow: "rgba(0, 0, 0, 0.55)",

    displayText: "#FFE8E8",
    displaySubText: "rgba(255, 232, 232, 0.40)",

    buttonNumBg: "rgba(255, 255, 255, 0.08)",
    buttonNumText: "#FFE8E8",
    buttonNumBorder: "rgba(255, 150, 150, 0.14)",

    buttonOpBg: "rgba(192, 57, 43, 0.30)",
    buttonOpText: "#FF9090",
    buttonOpBorder: "rgba(192, 57, 43, 0.50)",

    buttonTopBg: "rgba(255, 100, 100, 0.10)",
    buttonTopText: "#FF9999",
    buttonTopBorder: "rgba(255, 100, 100, 0.18)",

    buttonEqBg: ACCENT,
    buttonEqText: "#ffffff",
    buttonEqBorder: "#FF5555",

    buttonZeroBg: "rgba(255, 255, 255, 0.08)",
    buttonZeroText: "#FFE8E8",
  },
};

export default Colors;
