import {
  Grid3X3,
  Layers,
  Home,
  Paintbrush,
  Hammer,
  Sofa,
  Lightbulb,
  Plug,
  Wind,
} from "lucide-react";

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
  {
    key: "wood",
    label: "목공",
    emoji: "🪚",
    icon: Hammer,
  },
  {
    key: "electric",
    label: "전기",
    emoji: "⚡",
    icon: Plug,
  },
  {
    key: "aircon",
    label: "에어컨",
    emoji: "❄️",
    icon: Wind,
  },
  {
    key: "paint",
    label: "페인트",
    emoji: "🪣",
    icon: Paintbrush,
  },
  {
    key: "wallpaper",
    label: "도배",
    emoji: "🎨",
    icon: Layers,
  },
  {
    key: "floor",
    label: "마루",
    emoji: "📦",
    icon: Home,
  },
  {
    key: "tile",
    label: "타일",
    emoji: "🧱",
    icon: Grid3X3,
  },
  {
    key: "furniture",
    label: "가구",
    emoji: "🧰",
    icon: Sofa,
  },
  {
    key: "lighting",
    label: "조명",
    emoji: "💡",
    icon: Lightbulb,
  },
];

export const wallpaperTypes = [
  {
    name: "실크벽지",
    coverage: 16.5,
  },
  {
    name: "합지벽지",
    coverage: 18,
  },
];

export const floorTypes = [
  {
    name: "강마루",
    coverage: 0.7,
  },
  {
    name: "원목마루",
    coverage: 0.65,
  },
];

export const boardTypes = [
  {
    name: "석고보드",
    area: 1.62,
  },
  {
    name: "합판",
    area: 1.62,
  },
];

export const paintTypes = [
  {
    name: "수성페인트",
    coverage: 10,
  },
  {
    name: "에폭시",
    coverage: 8,
  },
];

export const furnitureTypes = [
  {
    name: "싱크대",
  },
  {
    name: "붙박이장",
  },
  {
    name: "신발장",
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
    name: "욕실",
    lux: 180,
  },
];

export const defaultInputs = {
  tile: {
    areaMode: "pyeong",
    pyeong: 20,
    width: 5000,
    height: 4000,
    tileWidth: 600,
    tileHeight: 600,
    waste: 10,
    boxPieces: 4,
  },

  wallpaper: {
    areaMode: "pyeong",
    pyeong: 20,
    width: 5000,
    height: 4000,
    ceilingHeight: 2400,
    waste: 10,
    wallpaperType: "실크벽지",
  },

  floor: {
    areaMode: "pyeong",
    pyeong: 20,
    width: 5000,
    height: 4000,
    waste: 7,
    floorType: "강마루",
  },

  paint: {
    areaMode: "pyeong",
    pyeong: 20,
    width: 5000,
    height: 4000,
    coats: 2,
    waste: 10,
    paintType: "수성페인트",
  },

  wood: {
    areaMode: "pyeong",
    pyeong: 20,
    width: 5000,
    height: 2400,
    waste: 10,
    boardType: "석고보드",
    layers: 1,
  },

  furniture: {
    furnitureType: "싱크대",
    lowerLength: 3200,
    upperLength: 2400,
    depth: 600,
    doorWidth: 450,
  },

  lighting: {
    pyeong: 20,
    luxPreset: "거실",
  },

  electric: {
    rooms: 3,
    lights: 6,
    outlets: 12,
    switches: 5,
  },

  aircon: {
    pyeong: 20,
    sunlight: true,
    openStructure: false,
    weakInsulation: false,
  },
};