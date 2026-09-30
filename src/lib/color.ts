/* Colors for the sidebar's band. */

/** "#10365c", "10365C", "#136" or "rgb(16, 54, 92)" -> "#10365C", and "" for
    anything else. */
export function hex(value: string | null | undefined): string {
  const text = String(value ?? "").trim();
  const rgb = text.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (rgb) {
    return (
      "#" +
      rgb
        .slice(1, 4)
        .map(n => Math.min(255, Number(n)).toString(16).padStart(2, "0"))
        .join("")
        .toUpperCase()
    );
  }
  const digits = (text.match(/^#?([0-9a-f]{3}|[0-9a-f]{6})$/i) || [])[1];
  if (!digits) return "";
  return "#" + (digits.length === 3 ? digits.replace(/./g, c => c + c) : digits).toUpperCase();
}

/** The colors on offer, Navy first because it is the template's own. Each
    keeps the rail's faintest text at 4.5:1 or better; a test holds them to it. */
export const BAND_COLORS: { name: string; color: string }[] = [
  { name: "Navy", color: "#10365C" },
  { name: "Cobalt", color: "#1F4A94" },
  { name: "Petrol", color: "#0F4A5A" },
  { name: "Forest", color: "#1E4A35" },
  { name: "Burgundy", color: "#6B1E2E" },
  { name: "Plum", color: "#472A5C" },
  { name: "Charcoal", color: "#25282D" },
];

/** WCAG asks 4.5:1 of text this small. */
export const MIN_CONTRAST = 4.5;

function luminance(rgb: number[]): number {
  const [r, g, b] = rgb.map(c => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** The contrast of the rail's faintest text, the role under the name, which
    prints white at 78% over the band. If that line passes, every line does. */
export function railContrast(color: string): number {
  const value = hex(color);
  if (!value) return 0;
  const band = [1, 3, 5].map(i => parseInt(value.slice(i, i + 2), 16));
  const role = band.map(c => 0.78 * 255 + 0.22 * c);
  const [dark, light] = [luminance(band), luminance(role)].sort((a, b) => a - b);
  return (light + 0.05) / (dark + 0.05);
}
