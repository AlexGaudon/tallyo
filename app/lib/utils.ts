import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getBestTextColor(hexColor: string): "black" | "white" {
  // Convert hex color to RGB
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Calculate the relative luminance (brightness) of the color
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

  // Determine the best text color based on luminance
  return luminance > 0.5 ? "black" : "white";
}

export function getRandomColor() {
  return Math.floor(Math.random() * 16777215).toString(16);
}

export function generateRandomPalette(paletteSize: number): string[] {
  const palette: string[] = [];

  const randomHue = Math.random() * 360; // Random starting point for hue

  for (let i = 0; i < paletteSize; i++) {
    const hue = (randomHue + i * 30) % 360; // Vary hue every 30 degrees
    const saturation = 70 + Math.random() * 20; // Vary saturation for diversity
    const lightness = 50 + Math.random() * 20; // Vary lightness for diversity

    const color = hslToHex(hue, saturation, lightness);
    palette.push(color);
  }

  return palette;
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const h = (hue / 360) * 6;
  const s = saturation / 100;
  const l = lightness / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h % 2) - 1));

  let r = 0,
    g = 0,
    b = 0;

  if (h >= 0 && h < 1) {
    [r, g, b] = [c, x, 0];
  } else if (h >= 1 && h < 2) {
    [r, g, b] = [x, c, 0];
  } else if (h >= 2 && h < 3) {
    [r, g, b] = [0, c, x];
  } else if (h >= 3 && h < 4) {
    [r, g, b] = [0, x, c];
  } else if (h >= 4 && h < 5) {
    [r, g, b] = [x, 0, c];
  } else if (h >= 5 && h < 6) {
    [r, g, b] = [c, 0, x];
  }

  const m = l - c / 2;
  const [red, green, blue] = [(r + m) * 255, (g + m) * 255, (b + m) * 255];

  return `#${Math.round(red).toString(16).padStart(2, "0")}${Math.round(green)
    .toString(16)
    .padStart(2, "0")}${Math.round(blue).toString(16).padStart(2, "0")}`;
}