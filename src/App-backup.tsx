import { useEffect, useMemo, useState } from "react";
import type { ElementType } from "react";
import {
  Calculator,
  Copy,
  RotateCcw,
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

type CategoryKey =
  | "tile"
  | "wallpaper"
  | "floor"
  | "paint"
  | "wood"
  | "furniture"
  | "lighting"
  | "electric"
  | "aircon";

type FieldConfig = {
  key: string;
  label: string;
  suffix: string;
};

type CategoryConfig = {
  key: CategoryKey;
  label: string;
  icon: ElementType;
  description: string;
  fields: FieldConfig[];
};

type ResultData = {
  mainLabel: string;
  mainValue: string;
  helper: string;
  items: Array<[string, string]>;
};

type AllInputs = Record<CategoryKey, Record<string, number>>;

const STORAGE_KEY = "interior-material-calc-by-category-v1";

const categories: CategoryConfig[] = [
  {
    key: "tile",
    label: "타일",
    icon: Grid3X3,
    description: "타일 규격, 박스 구성, 줄눈·실리콘까지 계산합니다.",
    fields: [
      { key: "areaM2", label: "시공 면적", suffix: "㎡" },
      { key: "tileWidthMm", label: "타일 1장 가로", suffix: "mm" },
      { key: "tileHeightMm", label: "타일 1장 세로", suffix: "mm" },
      { key: "piecesPerBox", label: "박스당 장수", suffix: "장" },
      { key: "lossRate", label: "로스율", suffix: "%" },
      { key: "groutLengthM", label: "줄눈/실리콘 길이", suffix: "m" },
      { key: "siliconeCoverageM", label: "실리콘 1개 시공 길이", suffix: "m" },
    ],
  },
  {
    key: "wallpaper",
    label: "도배",
    icon: Layers,
    description: "벽 길이, 높이, 제외 면적, 롤당 시공 가능 면적으로 계산합니다.",
    fields: [
      { key: "wallLengthM", label: "벽 전체 길이", suffix: "m" },
      { key: "wallHeightM", label: "벽 높이", suffix: "m" },
      { key: "deductAreaM2", label: "창/문 제외 면적", suffix: "㎡" },
      { key: "rollCoverageM2", label: "롤당 시공 가능 면적", suffix: "㎡" },
      { key: "lossRate", label: "로스율", suffix: "%" },
    ],
  },
  {
    key: "floor",
    label: "마루",
    icon: Home,
    description: "바닥 면적과 박스당 시공 면적으로 필요 박스를 계산합니다.",
    fields: [
      { key: "floorAreaM2", label: "바닥 면적", suffix: "㎡" },
      { key: "boxCoverageM2", label: "박스당 시공 가능 면적", suffix: "㎡" },
      { key: "lossRate", label: "로스율", suffix: "%" },
    ],
  },
  {
    key: "paint",
    label: "페인트",
    icon: Paintbrush,
    description: "도장 면적, 도장 횟수, 1L당 도포 면적으로 계산합니다.",
    fields: [
      { key: "paintAreaM2", label: "도장 면적", suffix: "㎡" },
      { key: "coats", label: "도장 횟수", suffix: "회" },
      { key: "coveragePerLiterM2", label: "1L당 도포 면적", suffix: "㎡" },
      { key: "lossRate", label: "로스율", suffix: "%" },
    ],
  },
  {
    key: "wood",
    label: "목공",
    icon: Hammer,
    description: "보드 면적, 장당 면적, 레이어 수 기준으로 목공 장수를 계산합니다.",
    fields: [
      { key: "workAreaM2", label: "작업 면적", suffix: "㎡" },
      { key: "boardAreaM2", label: "보드 1장 면적", suffix: "㎡" },
      { key: "layers", label: "시공 레이어", suffix: "겹" },
      { key: "lossRate", label: "로스율", suffix: "%" },
    ],
  },
  {
    key: "furniture",
    label: "가구",
    icon: Sofa,
    description: "가구 수량과 예비율 기준으로 발주 수량을 계산합니다.",
    fields: [
      { key: "baseQty", label: "기본 수량", suffix: "개" },
      { key: "spareRate", label: "예비율", suffix: "%" },
      { key: "setCount", label: "세트 수", suffix: "세트" },
    ],
  },
  {
    key: "lighting",
    label: "조명",
    icon: Lightbulb,
    description: "공간 면적과 조명 기준 면적으로 권장 조명 수를 계산합니다.",
    fields: [
      { key: "roomAreaM2", label: "공간 면적", suffix: "㎡" },
      { key: "areaPerLightM2", label: "조명 1개당 기준 면적", suffix: "㎡" },
      { key: "extraLights", label: "추가 조명", suffix: "개" },
    ],
  },
  {
    key: "electric",
    label: "전기",
    icon: Plug,
    description: "면적, 콘센트 기준, 스위치, 회로 수를 함께 계산합니다.",
    fields: [
      { key: "roomAreaM2", label: "공간 면적", suffix: "㎡" },
      { key: "areaPerOutletM2", label: "콘센트 1개당 기준 면적", suffix: "㎡" },
      { key: "switchQty", label: "스위치 수", suffix: "개" },
      { key: "circuitQty", label: "회로 수", suffix: "회로" },
    ],
  },
  {
    key: "aircon",
    label: "에어컨",
    icon: Wind,
    description: "공간 면적, 층고, 보정률 기준으로 냉방 평형을 계산합니다.",
    fields: [
      { key: "roomAreaM2", label: "공간 면적", suffix: "㎡" },
      { key: "heightM", label: "층고", suffix: "m" },
      { key: "correctionRate", label: "상향 보정률", suffix: "%" },
    ],
  },
];

const defaultInputs: AllInputs = {
  tile: {
    areaM2: 12,
    tileWidthMm: 600,
    tileHeightMm: 600,
    piecesPerBox: 4,
    lossRate: 10,
    groutLengthM: 15,
    siliconeCoverageM: 8,
  },
  wallpaper: {
    wallLengthM: 12,
    wallHeightM: 2.4,
    deductAreaM2: 2,
    rollCoverageM2: 5,
    lossRate: 10,
  },
  floor: {
    floorAreaM2: 18,
    boxCoverageM2: 3.3,
    lossRate: 7,
  },
  paint: {
    paintAreaM2: 30,
    coats: 2,
    coveragePerLiterM2: 8,
    lossRate: 10,
  },
  wood: {
    workAreaM2: 12,
    boardAreaM2: 1.62,
    layers: 1,
    lossRate: 10,
  },
  furniture: {
    baseQty: 5,
    spareRate: 5,
    setCount: 1,
  },
  lighting: {
    roomAreaM2: 20,
    areaPerLightM2: 5,
    extraLights: 0,
  },
  electric: {
    roomAreaM2: 20,
    areaPerOutletM2: 6,
    switchQty: 2,
    circuitQty: 1,
  },
  aircon: {
    roomAreaM2: 20,
    heightM: 2.4,
    correctionRate: 10,
  },
};

function safe(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function mmToM(mm: number) {
  return safe(mm) / 1000;
}

function format(value: number, digit = 2) {
  return safe(value).toLocaleString("ko-KR", {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  });
}

function ceil(value: number) {
  return Math.ceil(safe(value)).toLocaleString("ko-KR");
}

function NumberInput({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      <div className="field-control">
        <input
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <em>{suffix}</em>
      </div>
    </label>
  );
}

export default function App() {
  const [category, setCategory] = useState<CategoryKey>("tile");
  const [inputs, setInputs] = useState<AllInputs>(defaultInputs);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<AllInputs>;
      setInputs({
        tile: { ...defaultInputs.tile, ...parsed.tile },
        wallpaper: { ...defaultInputs.wallpaper, ...parsed.wallpaper },
        floor: { ...defaultInputs.floor, ...parsed.floor },
        paint: { ...defaultInputs.paint, ...parsed.paint },
        wood: { ...defaultInputs.wood, ...parsed.wood },
        furniture: { ...defaultInputs.furniture, ...parsed.furniture },
        lighting: { ...defaultInputs.lighting, ...parsed.lighting },
        electric: { ...defaultInputs.electric, ...parsed.electric },
        aircon: { ...defaultInputs.aircon, ...parsed.aircon },
      });
    } catch {
      setInputs(defaultInputs);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const selected = categories.find((item) => item.key === category) ?? categories[0];
  const currentInputs = inputs[category];

  const update = (key: string, value: number) => {
    setInputs((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: safe(value),
      },
    }));
  };

  const resetCurrent = () => {
    setInputs((prev) => ({
      ...prev,
      [category]: { ...defaultInputs[category] },
    }));
  };

  const result: ResultData = useMemo(() => {
    const value = inputs[category];

    if (category === "tile") {
      const area = safe(value.areaM2);
      const lossRate = safe(value.lossRate);
      const tileArea = mmToM(value.tileWidthMm) * mmToM(value.tileHeightMm);
      const purePieces = tileArea > 0 ? area / tileArea : 0;
      const orderPieces = purePieces * (1 + lossRate / 100);
      const boxes = safe(value.piecesPerBox) > 0 ? orderPieces / value.piecesPerBox : 0;
      const siliconeTubes = safe(value.siliconeCoverageM) > 0 ? value.groutLengthM / value.siliconeCoverageM : 0;

      return {
        mainLabel: "발주 권장 매수",
        mainValue: `${ceil(orderPieces)} 매`,
        helper: "순수 필요량 + 로스율",
        items: [
          ["시공 면적", `${format(area)} ㎡`],
          ["순수 필요량", `${ceil(purePieces)} 매`],
          ["권장 박스 수", `${ceil(boxes)} 박스`],
          ["로스율", `${lossRate}%`],
          ["줄눈/실리콘 길이", `${format(value.groutLengthM)} m`],
          ["권장 실리콘", `${ceil(siliconeTubes)} 개`],
        ],
      };
    }

    if (category === "wallpaper") {
      const wallArea = Math.max(value.wallLengthM * value.wallHeightM - value.deductAreaM2, 0);
      const lossRate = safe(value.lossRate);
      const orderArea = wallArea * (1 + lossRate / 100);
      const pureRolls = safe(value.rollCoverageM2) > 0 ? wallArea / value.rollCoverageM2 : 0;
      const orderRolls = safe(value.rollCoverageM2) > 0 ? orderArea / value.rollCoverageM2 : 0;

      return {
        mainLabel: "발주 권장 롤 수",
        mainValue: `${ceil(orderRolls)} 롤`,
        helper: "벽면 면적 - 제외 면적 + 로스율",
        items: [
          ["벽면 면적", `${format(wallArea)} ㎡`],
          ["순수 필요량", `${ceil(pureRolls)} 롤`],
          ["로스 포함 면적", `${format(orderArea)} ㎡`],
          ["로스율", `${lossRate}%`],
        ],
      };
    }

    if (category === "floor") {
      const area = safe(value.floorAreaM2);
      const lossRate = safe(value.lossRate);
      const orderArea = area * (1 + lossRate / 100);
      const pureBoxes = safe(value.boxCoverageM2) > 0 ? area / value.boxCoverageM2 : 0;
      const orderBoxes = safe(value.boxCoverageM2) > 0 ? orderArea / value.boxCoverageM2 : 0;

      return {
        mainLabel: "발주 권장 박스 수",
        mainValue: `${ceil(orderBoxes)} 박스`,
        helper: "바닥 면적 + 로스율",
        items: [
          ["바닥 면적", `${format(area)} ㎡`],
          ["순수 필요량", `${ceil(pureBoxes)} 박스`],
          ["로스 포함 면적", `${format(orderArea)} ㎡`],
          ["로스율", `${lossRate}%`],
        ],
      };
    }

    if (category === "paint") {
      const baseArea = safe(value.paintAreaM2) * Math.max(safe(value.coats), 1);
      const lossRate = safe(value.lossRate);
      const orderArea = baseArea * (1 + lossRate / 100);
      const pureLiters = safe(value.coveragePerLiterM2) > 0 ? baseArea / value.coveragePerLiterM2 : 0;
      const orderLiters = safe(value.coveragePerLiterM2) > 0 ? orderArea / value.coveragePerLiterM2 : 0;

      return {
        mainLabel: "발주 권장 용량",
        mainValue: `${ceil(orderLiters)} L`,
        helper: "도장 면적 × 도장 횟수 + 로스율",
        items: [
          ["총 도장 면적", `${format(baseArea)} ㎡`],
          ["순수 필요량", `${format(pureLiters)} L`],
          ["로스 포함 용량", `${format(orderLiters)} L`],
          ["도장 횟수", `${format(value.coats, 0)} 회`],
        ],
      };
    }

    if (category === "wood") {
      const baseArea = safe(value.workAreaM2) * Math.max(safe(value.layers), 1);
      const lossRate = safe(value.lossRate);
      const orderArea = baseArea * (1 + lossRate / 100);
      const pureBoards = safe(value.boardAreaM2) > 0 ? baseArea / value.boardAreaM2 : 0;
      const orderBoards = safe(value.boardAreaM2) > 0 ? orderArea / value.boardAreaM2 : 0;

      return {
        mainLabel: "발주 권장 장수",
        mainValue: `${ceil(orderBoards)} 장`,
        helper: "작업 면적 × 레이어 + 로스율",
        items: [
          ["작업 면적", `${format(baseArea)} ㎡`],
          ["순수 필요량", `${ceil(pureBoards)} 장`],
          ["보드 1장 면적", `${format(value.boardAreaM2)} ㎡`],
          ["로스율", `${lossRate}%`],
        ],
      };
    }

    if (category === "furniture") {
      const baseQty = safe(value.baseQty) * Math.max(safe(value.setCount), 1);
      const orderQty = baseQty * (1 + safe(value.spareRate) / 100);

      return {
        mainLabel: "발주 권장 수량",
        mainValue: `${ceil(orderQty)} 개`,
        helper: "기본 수량 × 세트 수 + 예비율",
        items: [
          ["기본 수량", `${format(baseQty, 0)} 개`],
          ["세트 수", `${format(value.setCount, 0)} 세트`],
          ["예비율", `${safe(value.spareRate)}%`],
          ["예비 포함 수량", `${format(orderQty)} 개`],
        ],
      };
    }

    if (category === "lighting") {
      const baseUnits = safe(value.areaPerLightM2) > 0 ? value.roomAreaM2 / value.areaPerLightM2 : 0;
      const orderUnits = baseUnits + safe(value.extraLights);

      return {
        mainLabel: "권장 조명 수",
        mainValue: `${ceil(orderUnits)} 개`,
        helper: "공간 면적 ÷ 조명 기준 면적 + 추가 조명",
        items: [
          ["공간 면적", `${format(value.roomAreaM2)} ㎡`],
          ["기준 면적", `${format(value.areaPerLightM2)} ㎡당 1개`],
          ["기본 조명 수", `${ceil(baseUnits)} 개`],
          ["추가 조명", `${format(value.extraLights, 0)} 개`],
        ],
      };
    }

    if (category === "electric") {
      const outletQty = safe(value.areaPerOutletM2) > 0 ? value.roomAreaM2 / value.areaPerOutletM2 : 0;

      return {
        mainLabel: "권장 콘센트 수",
        mainValue: `${ceil(outletQty)} 개`,
        helper: "공간 면적 ÷ 콘센트 기준 면적",
        items: [
          ["공간 면적", `${format(value.roomAreaM2)} ㎡`],
          ["기준 면적", `${format(value.areaPerOutletM2)} ㎡당 1개`],
          ["스위치 수", `${format(value.switchQty, 0)} 개`],
          ["회로 수", `${format(value.circuitQty, 0)} 회로`],
        ],
      };
    }

    const pyeong = safe(value.roomAreaM2) / 3.305785;
    const heightCorrection = safe(value.heightM) > 2.4 ? value.heightM / 2.4 : 1;
    const correctedPyeong = pyeong * heightCorrection * (1 + safe(value.correctionRate) / 100);

    return {
      mainLabel: "권장 냉방 평형",
      mainValue: `${ceil(correctedPyeong)} 평형`,
      helper: "면적 평수 × 층고 보정 × 상향 보정률",
      items: [
        ["공간 면적", `${format(value.roomAreaM2)} ㎡`],
        ["평수 환산", `${format(pyeong)} 평`],
        ["층고", `${format(value.heightM)} m`],
        ["상향 보정률", `${safe(value.correctionRate)}%`],
      ],
    };
  }, [category, inputs]);

  const copyResult = async () => {
    const lines = [
      `[${selected.label} 계산 결과]`,
      `${result.mainLabel}: ${result.mainValue}`,
      ...result.items.map((item) => `${item[0]}: ${item[1]}`),
    ];

    await navigator.clipboard.writeText(lines.join(String.fromCharCode(10)));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html { background: #f4f6fb; }
        body { margin: 0; color: #172033; font-family: Arial, sans-serif; }
        input, button { font-family: inherit; }
        .page { min-height: 100vh; padding: 38px 18px 52px; background: linear-gradient(180deg, #f8fafc 0%, #eef3fb 100%); }
        .wrap { max-width: 1120px; margin: 0 auto; }
        .hero { text-align: center; padding: 20px 0 22px; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 8px 14px; border-radius: 999px; background: #eaf2ff; color: #2563eb; font-size: 14px; font-weight: 800; margin-bottom: 15px; }
        h1 { margin: 0; color: #0f172a; font-size: clamp(34px, 5.5vw, 56px); line-height: 1.08; letter-spacing: -2.4px; font-weight: 900; }
        .sub { margin: 13px 0 0; color: #64748b; font-size: 18px; line-height: 1.6; }
        .tabs { display: grid; grid-template-columns: repeat(9, minmax(0, 1fr)); gap: 10px; margin: 24px 0 22px; }
        .tab { min-height: 74px; border: 1px solid #e2e8f0; background: rgba(255,255,255,.96); color: #334155; border-radius: 18px; padding: 12px 8px; font-weight: 850; cursor: pointer; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 7px; box-shadow: 0 8px 22px rgba(15,23,42,.055); transition: transform .14s ease, border-color .14s ease, box-shadow .14s ease; }
        .tab:hover { transform: translateY(-1px); border-color: #bfdbfe; box-shadow: 0 12px 26px rgba(15,23,42,.075); }
        .tab.active { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 16px 34px rgba(37,99,235,.25); }
        .layout { display: grid; grid-template-columns: minmax(0, 1.08fr) minmax(360px, .92fr); gap: 22px; align-items: start; }
        .card { background: rgba(255,255,255,.98); border: 1px solid #e5e7eb; border-radius: 26px; padding: 25px; box-shadow: 0 18px 45px rgba(15,23,42,.085); }
        .card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 22px; }
        h2 { margin: 0; color: #0f172a; font-size: 24px; line-height: 1.25; letter-spacing: -.5px; font-weight: 900; }
        .desc { margin: 6px 0 0; color: #64748b; font-size: 14px; line-height: 1.5; }
        .form { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 15px; }
        .field-label { display: block; color: #475569; font-size: 14px; font-weight: 850; margin-bottom: 8px; }
        .field-control { height: 54px; display: flex; align-items: center; border: 1px solid #dbe3ef; background: #f8fafc; border-radius: 16px; padding: 0 14px; transition: border-color .14s ease, box-shadow .14s ease, background .14s ease; }
        .field-control:focus-within { border-color: #2563eb; background: #fff; box-shadow: 0 0 0 4px rgba(37,99,235,.09); }
        .field-control input { width: 100%; min-width: 0; border: none; outline: none; background: transparent; color: #0f172a; font-size: 18px; font-weight: 900; }
        .field-control em { color: #64748b; font-style: normal; font-size: 14px; font-weight: 850; white-space: nowrap; }
        .btn { height: 46px; border: none; border-radius: 15px; padding: 0 15px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; white-space: nowrap; }
        .btn.gray { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
        .btn.blue { background: #2563eb; color: white; box-shadow: 0 12px 24px rgba(37,99,235,.2); }
        .main-result { border-radius: 24px; padding: 27px 26px; background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; margin-bottom: 15px; box-shadow: 0 18px 32px rgba(37,99,235,.22); }
        .main-label { color: rgba(255,255,255,.78); font-size: 15px; font-weight: 850; }
        .main-value { margin-top: 8px; font-size: clamp(39px, 5.5vw, 54px); line-height: 1; font-weight: 950; letter-spacing: -2px; }
        .helper { margin-top: 10px; font-size: 14px; color: rgba(255,255,255,.76); font-weight: 800; }
        .result-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        .result-item { border: 1px solid #e5e7eb; background: #f8fafc; border-radius: 18px; padding: 17px; min-height: 86px; }
        .result-name { color: #64748b; font-size: 14px; font-weight: 850; }
        .result-value { margin-top: 8px; color: #0f172a; font-size: 21px; line-height: 1.2; font-weight: 950; letter-spacing: -.4px; }
        .notice { margin-top: 18px; padding: 15px 17px; border-radius: 18px; background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; font-size: 14px; line-height: 1.65; }
        @media (max-width: 980px) { .tabs { grid-template-columns: repeat(3, minmax(0, 1fr)); } .layout { grid-template-columns: 1fr; } }
        @media (max-width: 580px) { .page { padding: 24px 12px 38px; } .hero { padding-top: 10px; } h1 { letter-spacing: -1.6px; } .sub { font-size: 16px; } .tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 9px; } .tab { min-height: 68px; border-radius: 16px; } .card { padding: 20px; border-radius: 22px; } .card-top { flex-direction: column; align-items: stretch; margin-bottom: 18px; } .form { grid-template-columns: 1fr; } .result-grid { grid-template-columns: 1fr; } .btn { width: 100%; } .main-result { padding: 24px; } }
      `}</style>

      <main className="page notranslate" translate="no">
        <div className="wrap">
          <section className="hero">
            <div className="hero-badge">
              <Calculator size={17} /> 실무용 물량 계산기
            </div>
            <h1>현장 물량 계산 보드</h1>
            <p className="sub">자재부터 설비 권장값까지 한 화면에서 계산합니다.</p>
          </section>

          <section className="tabs">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  className={`tab ${category === item.key ? "active" : ""}`}
                  onClick={() => setCategory(item.key)}
                >
                  <Icon size={22} />
                  {item.label}
                </button>
              );
            })}
          </section>

          <section className="layout">
            <div className="card">
              <div className="card-top">
                <div>
                  <h2>입력 정보</h2>
                  <p className="desc">{selected.description}</p>
                </div>
                <button className="btn gray" onClick={resetCurrent}>
                  <RotateCcw size={17} /> 초기화
                </button>
              </div>

              <div className="form">
                {selected.fields.map((field) => (
                  <NumberInput
                    key={field.key}
                    label={field.label}
                    value={currentInputs[field.key] ?? 0}
                    suffix={field.suffix}
                    onChange={(value) => update(field.key, value)}
                  />
                ))}
              </div>
            </div>

            <div className="card">
              <div className="card-top">
                <div>
                  <h2>계산 결과</h2>
                  <p className="desc">현재 선택: {selected.label}</p>
                </div>
                <button className="btn blue" onClick={copyResult}>
                  <Copy size={17} /> {copied ? "복사됨" : "결과 복사"}
                </button>
              </div>

              <div className="main-result">
                <div className="main-label">{result.mainLabel}</div>
                <div className="main-value">{result.mainValue}</div>
                <div className="helper">{result.helper}</div>
              </div>

              <div className="result-grid">
                {result.items.map((item) => (
                  <div className="result-item" key={item[0]}>
                    <div className="result-name">{item[0]}</div>
                    <div className="result-value">{item[1]}</div>
                  </div>
                ))}
              </div>

              <div className="notice">
                실제 현장 상황에 따라 로스율 및 시공 조건이 달라질 수 있습니다. 자재 규격, 절단 방향, 파손 가능성을 고려해 최종 발주량은 조정하세요.
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
