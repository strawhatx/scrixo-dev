export type TextFontFamily = "helvetica" | "times" | "courier";
export type TextAlign = "left" | "center" | "right";

export const TEXT_FONT_STACK: Record<TextFontFamily, string> = {
  helvetica: "Helvetica, Arial, sans-serif",
  times: '"Times New Roman", Times, serif',
  courier: '"Courier New", Courier, monospace',
};
