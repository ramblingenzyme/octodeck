import type { Label } from "@/types";
import labelStyles from "./Label.module.css";

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn),
    min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return { h: 0, s: 0, l: l * 100 };
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h = 0;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return { h: h * 360, s: s * 100, l: l * 100 };
}

interface LabelListProps {
  labels: Label[];
}

export const LabelList = ({ labels }: LabelListProps) => {
  if (labels.length === 0) return null;
  return (
    <ul className={labelStyles.labelList}>
      {labels.map((l) => {
        if (!l.color) {
          return (
            <li key={l.name}>
              <span className={`${labelStyles.label} ${labelStyles.fallback}`}>{l.name}</span>
            </li>
          );
        }
        const { r, g, b } = hexToRgb(l.color);
        const { h, s, l: lum } = rgbToHsl(r, g, b);
        return (
          <li key={l.name}>
            <span
              className={`${labelStyles.label} ${labelStyles.colored}`}
              style={
                {
                  "--label-r": r,
                  "--label-g": g,
                  "--label-b": b,
                  "--label-h": h,
                  "--label-s": s,
                  "--label-l": lum,
                } as React.CSSProperties
              }
            >
              {l.name}
            </span>
          </li>
        );
      })}
    </ul>
  );
};
