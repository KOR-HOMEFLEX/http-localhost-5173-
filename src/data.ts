export type CategoryKey =
  | "tile"
  | "wallpaper"
  | "floor"
  | "paint"
  | "wood"
  | "furniture"
  | "lighting"
  | "electric"
  | "aircon";

export const categories = [
  { key: "tile", label: "타일", emoji: "🧱" },
  { key: "wallpaper", label: "도배", emoji: "🎨" },
  { key: "floor", label: "마루", emoji: "📦" },
  { key: "paint", label: "페인트", emoji: "🪣" },
  { key: "wood", label: "목공", emoji: "🪚" },
  { key: "furniture", label: "가구", emoji: "🧰" },
  { key: "lighting", label: "조명", emoji: "💡" },
  { key: "electric", label: "전기", emoji: "⚡" },
  { key: "aircon", label: "에어컨", emoji: "❄️" },
] as const;

export const wallpaperTypes = [
  {
    name: "실크벽지",
    width: 1.06,
    length: 15.6,
    coverage: 16.5,
  },
  {
    name: "합지벽지",
    width: 0.93,
    length: 17.75,
    coverage: 16.5,
  },
];

export const floorTypes = [
  {
    name: "강마루 0.5평",
    area: 0.5,
  },
  {
    name: "강마루 0.7평",
    area: 0.7,
  },
  {
    name: "강마루 1평",
    area: 1,
  },
];

export const boardTypes = [
  {
    name: "석고보드 900x1800",
    area: 1.62,
  },
  {
    name: "석고보드 900x2400",
    area: 2.16,
  },
  {
    name: "합판 1220x2440",
    area: 2.97,
  },
];

export const paintTypes = [
  {
    name: "수성 페인트",
    coverage: 10,
  },
  {
    name: "친환경 페인트",
    coverage: 8,
  },
];

export const luxPresets = [
  {
    name: "거실",
    lux: 220,
  },
  {
    name: "주방",
    lux: 300,
  },
  {
    name: "침실",
    lux: 150,
  },
  {
    name: "욕실",
    lux: 250,
  },
];

export const furnitureTypes = [
  {
    name: "싱크대",
    depth: 600,
  },
  {
    name: "붙박이장",
    depth: 650,
  },
];