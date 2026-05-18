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

export type AreaMode = "pyeong" | "size";

export type TileInputs = {
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  tileWidth: number;
  tileHeight: number;
  waste: number;
  boxPieces: number;
};

export type WallpaperInputs = {
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  ceilingHeight: number;
  waste: number;
};

export type FlooringInputs = {
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  boxCoverage: number;
  waste: number;
};

export type PaintInputs = {
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  coats: number;
  waste: number;
};

export type WoodInputs = {
  areaMode: AreaMode;
  pyeong: number;
  width: number;
  height: number;
  boardArea: number;
  layers: number;
  waste: number;
};

export type FurnitureInputs = {
  lowerLength: number;
  upperLength: number;
  depth: number;
  doorWidth: number;
};

export type LightingInputs = {
  pyeong: number;
  lux: number;
};

export type ElectricInputs = {
  rooms: number;
  lights: number;
  outlets: number;
  switches: number;
};

export type AirconInputs = {
  pyeong: number;
  sunlight: boolean;
  openStructure: boolean;
  weakInsulation: boolean;
};