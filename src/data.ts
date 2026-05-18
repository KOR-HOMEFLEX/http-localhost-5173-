export type CategoryKey =
  | "wood"
  | "electric"
  | "aircon"
  | "paint"
  | "wallpaper"
  | "floor"
  | "tile"
  | "furniture"
  | "lighting";

export const categories: {
  key: CategoryKey;
  label: string;
  emoji: string;
}[] = [
  { key: "wood", label: "목공", emoji: "🪚" },
  { key: "electric", label: "전기", emoji: "⚡" },
  { key: "aircon", label: "에어컨", emoji: "❄️" },
  { key: "paint", label: "페인트", emoji: "🪣" },
  { key: "wallpaper", label: "도배", emoji: "🎨" },
  { key: "floor", label: "마루", emoji: "📦" },
  { key: "tile", label: "타일", emoji: "🧱" },
  { key: "furniture", label: "가구", emoji: "🧰" },
  { key: "lighting", label: "조명", emoji: "💡" },
];

export type AreaMode = "pyeong" | "size";
export type PaintTarget = "wall" | "ceiling" | "direct";
export type TileTarget = "floor" | "wall";
export type WoodMode = "board" | "molding" | "partition";
export type AirconUse = "home" | "commercial";
export type AirconType = "stand" | "system";
export type LightInstallType = "downlight" | "main";

export interface TileInputs {
  siteName: string;
  spaceName: string;
  target: TileTarget;
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  piecesPerBox: number;
  adhesiveCoverage: number;
  groutWidth: number;
  groutDepth: number;
  siliconLength: number;
  lossRate: number;
}

export interface WallpaperInputs {
  siteName: string;
  spaceName: string;
  wallpaperType: string;
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  ceilingHeight: number;
  includeCeiling: boolean;
  lossRate: number;
}

export interface FloorInputs {
  siteName: string;
  spaceName: string;
  floorType: string;
  boxCoverage: number;
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  roomPerimeter: number;
  lossRate: number;
}

export interface PaintInputs {
  siteName: string;
  spaceName: string;
  paintType: string;
  target: PaintTarget;
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  directArea: number;
  ceilingHeight: number;
  coats: number;
  lossRate: number;
}

export interface WoodInputs {
  siteName: string;
  spaceName: string;
  mode: WoodMode;
  boardType: string;
  boardWidth: number;
  boardHeight: number;
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  boardLayers: number;
  moldingTotalLength: number;
  moldingPieceLength: number;
  partitionWidth: number;
  partitionHeight: number;
  studSpacing: number;
  studPieceLength: number;
  lossRate: number;
}

export interface FurnitureInputs {
  siteName: string;
  spaceName: string;
  furnitureType: string;
  lowerLength: number;
  upperLength: number;
  doorHeight: number;
  doorWidth: number;
  countertopWidth: number;
  includeCountertop: boolean;
  lossRate: number;
}

export interface LightingInputs {
  siteName: string;
  spaceName: string;
  spaceType: string;
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  ceilingHeight: number;
  installType: LightInstallType;
}

export interface ElectricInputs {
  siteName: string;
  spaceName: string;
  siteType: string;
  zones: number;
  lightPerZone: number;
  outletPerZone: number;
  switchPerZone: number;
  sparePoints: number;
  airconCircuit: boolean;
  inductionCircuit: boolean;
  laundryCircuit: boolean;
  bathroomCircuit: boolean;
}

export interface AirconInputs {
  siteName: string;
  spaceName: string;
  useType: AirconUse;
  commercialType: string;
  airconType: AirconType;
  coolingPyeong: number;
  sunExposure: string;
  ceilingHeight: number;
  openLivingKitchen: boolean;
  topFloorOrWeakInsulation: boolean;
}

export interface Inputs {
  wood: WoodInputs;
  electric: ElectricInputs;
  aircon: AirconInputs;
  paint: PaintInputs;
  wallpaper: WallpaperInputs;
  floor: FloorInputs;
  tile: TileInputs;
  furniture: FurnitureInputs;
  lighting: LightingInputs;
}

export const wallpaperTypes = [
  { name: "실크벽지 (폭 106cm × 길이 15.6m)", coverage: 16.5 },
  { name: "합지벽지 (폭 93cm × 길이 17.75m)", coverage: 18 },
  { name: "무늬벽지/수입벽지", coverage: 13 },
];

export const floorTypes = [
  { name: "강마루 / 강화마루", coverage: 0.7 },
  { name: "장판 / 데코타일", coverage: 1 },
  { name: "원목마루", coverage: 0.6 },
];

export const boardTypes = [
  { name: "석고보드 900 × 1800", width: 0.9, height: 1.8, area: 1.62 },
  { name: "석고보드 900 × 2400", width: 0.9, height: 2.4, area: 2.16 },
  { name: "합판 1220 × 2440", width: 1.22, height: 2.44, area: 2.98 },
  { name: "MDF 1220 × 2440", width: 1.22, height: 2.44, area: 2.98 },
];

export const paintTypes = [
  { name: "수성 페인트 (1L당 10㎡, 1회)", coverage: 10 },
  { name: "친환경 페인트 (1L당 8㎡, 1회)", coverage: 8 },
  { name: "방수/탄성 페인트 (1L당 6㎡, 1회)", coverage: 6 },
];

export const furnitureTypes = [
  { name: "싱크대" },
  { name: "붙박이장" },
  { name: "신발장" },
  { name: "수납장" },
];

export const luxPresets = [
  { name: "거실 (220 lux 기준)", lux: 220 },
  { name: "주방 (300 lux 기준)", lux: 300 },
  { name: "욕실 (180 lux 기준)", lux: 180 },
  { name: "방/침실 (150 lux 기준)", lux: 150 },
  { name: "사무실 (400 lux 기준)", lux: 400 },
];

export const defaultInputs: Inputs = {
  wood: {
    siteName: "",
    spaceName: "",
    mode: "board",
    boardType: "석고보드 900 × 1800",
    boardWidth: 0.9,
    boardHeight: 1.8,
    areaMode: "size",
    pyeong: 10,
    width: 5,
    height: 4,
    boardLayers: 1,
    moldingTotalLength: 30,
    moldingPieceLength: 2.4,
    partitionWidth: 3.6,
    partitionHeight: 2.4,
    studSpacing: 450,
    studPieceLength: 2.4,
    lossRate: 10,
  },

  electric: {
    siteName: "",
    spaceName: "",
    siteType: "주거/아파트",
    zones: 4,
    lightPerZone: 1.4,
    outletPerZone: 4,
    switchPerZone: 1.2,
    sparePoints: 2,
    airconCircuit: true,
    inductionCircuit: false,
    laundryCircuit: false,
    bathroomCircuit: false,
  },

  aircon: {
    siteName: "",
    spaceName: "",
    useType: "home",
    commercialType: "사무실",
    airconType: "stand",
    coolingPyeong: 18,
    sunExposure: "동향·일반",
    ceilingHeight: 2.4,
    openLivingKitchen: false,
    topFloorOrWeakInsulation: false,
  },

  paint: {
    siteName: "",
    spaceName: "",
    paintType: "수성 페인트 (1L당 10㎡, 1회)",
    target: "wall",
    areaMode: "pyeong",
    pyeong: 24,
    width: 5,
    height: 4,
    directArea: 30,
    ceilingHeight: 2.4,
    coats: 2,
    lossRate: 10,
  },

  wallpaper: {
    siteName: "",
    spaceName: "",
    wallpaperType: "실크벽지 (폭 106cm × 길이 15.6m)",
    areaMode: "pyeong",
    pyeong: 24,
    width: 5,
    height: 4,
    ceilingHeight: 2.4,
    includeCeiling: false,
    lossRate: 10,
  },

  floor: {
    siteName: "",
    spaceName: "",
    floorType: "강마루 / 강화마루",
    boxCoverage: 0.7,
    areaMode: "size",
    pyeong: 20,
    width: 5,
    height: 4,
    roomPerimeter: 20,
    lossRate: 7,
  },

  tile: {
    siteName: "",
    spaceName: "",
    target: "floor",
    areaMode: "size",
    pyeong: 10,
    width: 5,
    height: 4,
    tileWidth: 600,
    tileHeight: 600,
    piecesPerBox: 4,
    adhesiveCoverage: 4,
    groutWidth: 3,
    groutDepth: 6,
    siliconLength: 0,
    lossRate: 10,
  },

  furniture: {
    siteName: "",
    spaceName: "",
    furnitureType: "싱크대",
    lowerLength: 3.2,
    upperLength: 2.4,
    doorHeight: 850,
    doorWidth: 450,
    countertopWidth: 600,
    includeCountertop: true,
    lossRate: 5,
  },

  lighting: {
    siteName: "",
    spaceName: "",
    spaceType: "거실 (220 lux 기준)",
    areaMode: "pyeong",
    pyeong: 10,
    width: 5,
    height: 4,
    ceilingHeight: 2.4,
    installType: "downlight",
  },
};