import { useMemo, useState } from "react";
import { Calculator, Copy, RotateCcw } from "lucide-react";
import "./styles.css";

import {
  categories,
  wallpaperTypes,
  floorTypes,
  boardTypes,
  paintTypes,
  luxPresets,
  furnitureTypes,
  type CategoryKey,
} from "./data";

import {
  airconCalc,
  electricCalc,
  floorCalc,
  format,
  furnitureCalc,
  lightingCalc,
  paintCalc,
  wallpaperCalc,
  woodCalc,
} from "./calculators";

type ResultItem = {
  label: string;
  value: string;
};

type ResultView = {
  mainLabel: string;
  mainValue: string;
  helper: string;
  items: ResultItem[];
};

type Inputs = {
  wallpaper: {
    wallpaperTypeIndex: number;
    pyeong: number;
    height: number;
    ceiling: number;
    lossRate: number;
  };
  floor: {
    floorTypeIndex: number;
    pyeong: number;
    lossRate: number;
  };
  paint: {
    paintTypeIndex: number;
    pyeong: number;
    coats: number;
    lossRate: number;
  };
  wood: {
    boardTypeIndex: number;
    width: number;
    height: number;
    layers: number;
    lossRate: number;
  };
  furniture: {
    furnitureTypeIndex: number;
    lower: number;
    upper: number;
    lossRate: number;
    doorWidth: number;
  };
  lighting: {
    luxPresetIndex: number;
    pyeong: number;
  };
  electric: {
    zones: number;
    lightPerZone: number;
    outletPerZone: number;
    switchPerZone: number;
    reserve: number;
    dedicated: number;
  };
  aircon: {
    pyeong: number;
    height: number;
    correction: number;
  };
  tile: {
    area: number;
    tileWidth: number;
    tileHeight: number;
    piecesPerBox: number;
    lossRate: number;
  };
};

const defaultInputs: Inputs = {
  wallpaper: {
    wallpaperTypeIndex: 0,
    pyeong: 24,
    height: 2.4,
    ceiling: 0,
    lossRate: 0,
  },
  floor: {
    floorTypeIndex: 1,
    pyeong: 20,
    lossRate: 7,
  },
  paint: {
    paintTypeIndex: 0,
    pyeong: 24,
    coats: 2,
    lossRate: 0,
  },
  wood: {
    boardTypeIndex: 0,
    width: 5,
    height: 4,
    layers: 1,
    lossRate: 10,
  },
  furniture: {
    furnitureTypeIndex: 0,
    lower: 3.2,
    upper: 2.4,
    lossRate: 5,
    doorWidth: 0.45,
  },
  lighting: {
    luxPresetIndex: 0,
    pyeong: 10,
  },
  electric: {
    zones: 4,
    lightPerZone: 1.4,
    outletPerZone: 4,
    switchPerZone: 1.2,
    reserve: 2,
    dedicated: 1,
  },
  aircon: {
    pyeong: 18,
    height: 2.4,
    correction: 0,
  },
  tile: {
    area: 12,
    tileWidth: 600,
    tileHeight: 600,
    piecesPerBox: 4,
    lossRate: 10,
  },
};

function safeNumber(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: string[];
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <div className="field-control">
        <select value={value} onChange={(event) => onChange(Number(event.target.value))}>
          {options.map((option, index) => (
            <option key={option} value={index}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function NumberField({
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
    <label>
      <span className="field-label">{label}</span>
      <div className="field-control">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(safeNumber(Number(event.target.value)))}
        />
        <em>{suffix}</em>
      </div>
    </label>
  );
}

function ToggleField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label>
      <span className="field-label">{label}</span>
      <div className="field-control">
        <select value={value} onChange={(event) => onChange(Number(event.target.value))}>
          <option value={0}>미포함</option>
          <option value={1}>포함</option>
        </select>
      </div>
    </label>
  );
}

export default function App() {
  const [category, setCategory] = useState<CategoryKey>("wallpaper");
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [copied, setCopied] = useState(false);

  const selectedCategory = categories.find((item) => item.key === category) ?? categories[1];

  const update = <T extends keyof Inputs>(
    group: T,
    key: keyof Inputs[T],
    value: number
  ) => {
    setInputs((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };

  const resetCurrent = () => {
    setInputs((prev) => ({
      ...prev,
      [category]: defaultInputs[category],
    }));
  };

  void resetCurrent;

  const result: ResultView = useMemo(() => {
    if (category === "wallpaper") {
      const value = inputs.wallpaper;
      const type = wallpaperTypes[value.wallpaperTypeIndex] ?? wallpaperTypes[0];

      const calc = wallpaperCalc({
        pyeong: value.pyeong,
        height: value.height,
        ceiling: value.ceiling === 1,
        lossRate: value.lossRate,
        coverage: type.coverage,
      });

      return {
        mainLabel: "발주 권장 롤 수",
        mainValue: `${calc.rolls} 롤`,
        helper: "벽면 면적 기준으로 필요한 벽지 롤 수를 계산합니다.",
        items: [
          { label: "벽지 종류", value: type.name },
          { label: "바닥 면적", value: `${format(calc.floorArea)} ㎡` },
          { label: "벽면 면적", value: `${format(calc.wallArea)} ㎡` },
          { label: "총 도배 면적", value: `${format(calc.totalArea)} ㎡` },
          { label: "로스 포함 면적", value: `${format(calc.lossArea)} ㎡` },
          { label: "롤당 시공 면적", value: `${format(type.coverage)} ㎡` },
        ],
      };
    }

    if (category === "floor") {
      const value = inputs.floor;
      const type = floorTypes[value.floorTypeIndex] ?? floorTypes[1];

      const calc = floorCalc({
        pyeong: value.pyeong,
        boxArea: type.coverage,
        lossRate: value.lossRate,
      });

      return {
        mainLabel: "발주 권장 박스 수",
        mainValue: `${calc.boxes} 박스`,
        helper: "시공 평수에 로스율을 반영해 박스 수를 계산합니다.",
        items: [
          { label: "마루 종류", value: type.name },
          { label: "시공 면적", value: `${format(calc.area)} ㎡` },
          { label: "시공 평수", value: `${format(value.pyeong)} 평` },
          { label: "발주 평수", value: `${format(calc.orderPyeong)} 평` },
          { label: "박스당 면적", value: `${format(type.coverage)} 평` },
          { label: "로스율", value: `${format(value.lossRate, 0)}%` },
        ],
      };
    }

    if (category === "paint") {
      const value = inputs.paint;
      const type = paintTypes[value.paintTypeIndex] ?? paintTypes[0];

      const calc = paintCalc({
        pyeong: value.pyeong,
        coats: value.coats,
        coverage: type.coverage,
        lossRate: value.lossRate,
      });

      return {
        mainLabel: "발주 권장 말통 수",
        mainValue: `${calc.cans} 통`,
        helper: "도장 면적과 도장 횟수를 기준으로 필요한 페인트 용량을 계산합니다.",
        items: [
          { label: "페인트 종류", value: type.name },
          { label: "시공 면적", value: `${format(calc.wallArea)} ㎡` },
          { label: "총 도장 면적", value: `${format(calc.paintArea)} ㎡` },
          { label: "필요 리터", value: `${format(calc.liters)} L` },
          { label: "도장 횟수", value: `${format(value.coats, 0)} 회` },
          { label: "1L 도포 면적", value: `${format(type.coverage)} ㎡` },
        ],
      };
    }

    if (category === "wood") {
      const value = inputs.wood;
      const type = boardTypes[value.boardTypeIndex] ?? boardTypes[0];

      const calc = woodCalc({
        width: value.width,
        height: value.height,
        boardArea: type.area,
        layers: value.layers,
        lossRate: value.lossRate,
      });

      return {
        mainLabel: "발주 권장 장수",
        mainValue: `${calc.orderBoards} 장`,
        helper: "작업 면적과 보드 규격, 겹수, 로스율을 반영합니다.",
        items: [
          { label: "보드 종류", value: type.name },
          { label: "작업 면적", value: `${format(calc.area)} ㎡` },
          { label: "레이어 반영 면적", value: `${format(calc.layerArea)} ㎡` },
          { label: "순수 필요량", value: `${format(calc.boards)} 장` },
          { label: "보드 1장 면적", value: `${format(type.area)} ㎡` },
          { label: "로스율", value: `${format(value.lossRate, 0)}%` },
        ],
      };
    }

    if (category === "furniture") {
      const value = inputs.furniture;
      const type = furnitureTypes[value.furnitureTypeIndex] ?? furnitureTypes[0];

      const calc = furnitureCalc({
        lower: value.lower,
        upper: value.upper,
        lossRate: value.lossRate,
        doorWidth: value.doorWidth,
      });

      return {
        mainLabel: "발주 권장 길이",
        mainValue: `${format(calc.order)} m`,
        helper: "하부장과 상부장 길이에 여유율을 반영합니다.",
        items: [
          { label: "가구 종류", value: type.name },
          { label: "기본 길이", value: `${format(calc.total)} m` },
          { label: "발주 길이", value: `${format(calc.order)} m` },
          { label: "도어 예상 수", value: `${calc.doors} 개` },
          { label: "도어 폭", value: `${format(value.doorWidth)} m` },
          { label: "여유율", value: `${format(value.lossRate, 0)}%` },
        ],
      };
    }

    if (category === "lighting") {
      const value = inputs.lighting;
      const preset = luxPresets[value.luxPresetIndex] ?? luxPresets[0];

      const calc = lightingCalc({
        pyeong: value.pyeong,
        lux: preset.lux,
      });

      return {
        mainLabel: "권장 LED 용량",
        mainValue: `${Math.ceil(calc.watt)} W`,
        helper: "공간 면적과 권장 조도를 기준으로 LED 용량을 계산합니다.",
        items: [
          { label: "공간 용도", value: preset.name },
          { label: "공간 면적", value: `${format(calc.area)} ㎡` },
          { label: "권장 조도", value: `${format(preset.lux, 0)} lux` },
          { label: "필요 광량", value: `${format(calc.lumen, 0)} lm` },
          { label: "7W LED 수량", value: `${calc.led7} 개` },
          { label: "10W LED 수량", value: `${calc.led10} 개` },
        ],
      };
    }

    if (category === "electric") {
      const value = inputs.electric;

      const calc = electricCalc({
        zones: value.zones,
        lightPerZone: value.lightPerZone,
        outletPerZone: value.outletPerZone,
        switchPerZone: value.switchPerZone,
        reserve: value.reserve,
        dedicated: value.dedicated,
      });

      return {
        mainLabel: "총 전기 포인트",
        mainValue: `${calc.total} 개`,
        helper: "구역 수를 기준으로 조명, 콘센트, 스위치 포인트를 계산합니다.",
        items: [
          { label: "조명 포인트", value: `${calc.lights} 개` },
          { label: "콘센트 포인트", value: `${calc.outlets} 개` },
          { label: "스위치 포인트", value: `${calc.switches} 개` },
          { label: "예비 포인트", value: `${format(value.reserve, 0)} 개` },
          { label: "전용 회로", value: `${format(value.dedicated, 0)} 개` },
          { label: "구역 수", value: `${format(value.zones, 0)} 구역` },
        ],
      };
    }

    if (category === "aircon") {
      const value = inputs.aircon;

      const calc = airconCalc({
        pyeong: value.pyeong,
        height: value.height,
        correction: value.correction,
      });

      return {
        mainLabel: "권장 냉방 평형",
        mainValue: `${Math.ceil(calc.result)} 평형`,
        helper: "기본 평수에 층고와 보정률을 반영합니다.",
        items: [
          { label: "기본 면적", value: `${format(value.pyeong)} 평` },
          { label: "층고", value: `${format(value.height)} m` },
          { label: "상향 보정률", value: `${format(value.correction, 0)}%` },
          { label: "계산 결과", value: `${format(calc.result)} 평형` },
        ],
      };
    }

    const value = inputs.tile;
    const tileArea = (value.tileWidth / 1000) * (value.tileHeight / 1000);
    const purePieces = tileArea > 0 ? value.area / tileArea : 0;
    const orderPieces = purePieces * (1 + value.lossRate / 100);
    const boxes = value.piecesPerBox > 0 ? Math.ceil(orderPieces / value.piecesPerBox) : 0;

    return {
      mainLabel: "발주 권장 매수",
      mainValue: `${Math.ceil(orderPieces)} 매`,
      helper: "시공 면적과 타일 규격, 로스율을 반영합니다.",
      items: [
        { label: "시공 면적", value: `${format(value.area)} ㎡` },
        { label: "타일 1장 면적", value: `${format(tileArea)} ㎡` },
        { label: "순수 필요량", value: `${format(purePieces)} 매` },
        { label: "권장 박스 수", value: `${boxes} 박스` },
        { label: "박스당 장수", value: `${format(value.piecesPerBox, 0)} 장` },
        { label: "로스율", value: `${format(value.lossRate, 0)}%` },
      ],
    };
  }, [category, inputs]);

  const copyResult = async () => {
    const lines = [
      `[${selectedCategory.label} 계산 결과]`,
      `${result.mainLabel}: ${result.mainValue}`,
      ...result.items.map((item) => `${item.label}: ${item.value}`),
    ];

    await navigator.clipboard.writeText(lines.join(String.fromCharCode(10)));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <main className="page notranslate" translate="no">
      <div className="wrap">
        <section className="hero">
          <div className="hero-badge">
            <Calculator size={17} />
            실무용 물량 계산기
          </div>
          <h1>현장 물량 계산 보드</h1>
          <p className="sub">자재부터 설비 권장값까지 한 화면에서 계산합니다.</p>
        </section>

        <section className="tabs">
          {categories.map((item) => (
            <button
              key={item.key}
              className={`tab ${category === item.key ? "active" : ""}`}
              onClick={() => setCategory(item.key as CategoryKey)}
            >
              <span>{item.emoji}</span>
              {item.label}
            </button>
          ))}
        </section>

        <section className="layout">
          <div className="card">
            <div className="card-top">
              <div>
                <h2>입력 정보</h2>
                <p className="desc">{selectedCategory.label} 계산에 필요한 값을 입력하세요.</p>
              </div>
              <button
                className="btn gray"
                onClick={() =>
                  setInputs((prev) => ({
                    ...prev,
                    [category]: defaultInputs[category],
                  }))
                }
              >
                <RotateCcw size={17} />
                초기화
              </button>
            </div>

            <div className="form">
              {category === "tile" && (
                <>
                  <NumberField label="시공 면적" value={inputs.tile.area} suffix="㎡" onChange={(v) => update("tile", "area", v)} />
                  <NumberField label="타일 1장 가로" value={inputs.tile.tileWidth} suffix="mm" onChange={(v) => update("tile", "tileWidth", v)} />
                  <NumberField label="타일 1장 세로" value={inputs.tile.tileHeight} suffix="mm" onChange={(v) => update("tile", "tileHeight", v)} />
                  <NumberField label="박스당 장수" value={inputs.tile.piecesPerBox} suffix="장" onChange={(v) => update("tile", "piecesPerBox", v)} />
                  <NumberField label="로스율" value={inputs.tile.lossRate} suffix="%" onChange={(v) => update("tile", "lossRate", v)} />
                </>
              )}

              {category === "wallpaper" && (
                <>
                  <SelectField
                    label="벽지 종류"
                    value={inputs.wallpaper.wallpaperTypeIndex}
                    options={wallpaperTypes.map((item) => item.name)}
                    onChange={(v) => update("wallpaper", "wallpaperTypeIndex", v)}
                  />
                  <NumberField label="평수" value={inputs.wallpaper.pyeong} suffix="평" onChange={(v) => update("wallpaper", "pyeong", v)} />
                  <NumberField label="천장 높이" value={inputs.wallpaper.height} suffix="m" onChange={(v) => update("wallpaper", "height", v)} />
                  <ToggleField label="천장 도배" value={inputs.wallpaper.ceiling} onChange={(v) => update("wallpaper", "ceiling", v)} />
                  <NumberField label="로스율" value={inputs.wallpaper.lossRate} suffix="%" onChange={(v) => update("wallpaper", "lossRate", v)} />
                </>
              )}

              {category === "floor" && (
                <>
                  <SelectField
                    label="마루 종류"
                    value={inputs.floor.floorTypeIndex}
                    options={floorTypes.map((item) => item.name)}
                    onChange={(v) => update("floor", "floorTypeIndex", v)}
                  />
                  <NumberField label="시공 평수" value={inputs.floor.pyeong} suffix="평" onChange={(v) => update("floor", "pyeong", v)} />
                  <NumberField label="로스율" value={inputs.floor.lossRate} suffix="%" onChange={(v) => update("floor", "lossRate", v)} />
                </>
              )}

              {category === "paint" && (
                <>
                  <SelectField
                    label="페인트 종류"
                    value={inputs.paint.paintTypeIndex}
                    options={paintTypes.map((item) => item.name)}
                    onChange={(v) => update("paint", "paintTypeIndex", v)}
                  />
                  <NumberField label="평수" value={inputs.paint.pyeong} suffix="평" onChange={(v) => update("paint", "pyeong", v)} />
                  <NumberField label="도장 횟수" value={inputs.paint.coats} suffix="회" onChange={(v) => update("paint", "coats", v)} />
                  <NumberField label="로스율" value={inputs.paint.lossRate} suffix="%" onChange={(v) => update("paint", "lossRate", v)} />
                </>
              )}

              {category === "wood" && (
                <>
                  <SelectField
                    label="보드 종류"
                    value={inputs.wood.boardTypeIndex}
                    options={boardTypes.map((item) => item.name)}
                    onChange={(v) => update("wood", "boardTypeIndex", v)}
                  />
                  <NumberField label="가로" value={inputs.wood.width} suffix="m" onChange={(v) => update("wood", "width", v)} />
                  <NumberField label="세로" value={inputs.wood.height} suffix="m" onChange={(v) => update("wood", "height", v)} />
                  <NumberField label="겹수" value={inputs.wood.layers} suffix="겹" onChange={(v) => update("wood", "layers", v)} />
                  <NumberField label="로스율" value={inputs.wood.lossRate} suffix="%" onChange={(v) => update("wood", "lossRate", v)} />
                </>
              )}

              {category === "furniture" && (
                <>
                  <SelectField
                    label="가구 종류"
                    value={inputs.furniture.furnitureTypeIndex}
                    options={furnitureTypes.map((item) => item.name)}
                    onChange={(v) => update("furniture", "furnitureTypeIndex", v)}
                  />
                  <NumberField label="하부장 길이" value={inputs.furniture.lower} suffix="m" onChange={(v) => update("furniture", "lower", v)} />
                  <NumberField label="상부장 길이" value={inputs.furniture.upper} suffix="m" onChange={(v) => update("furniture", "upper", v)} />
                  <NumberField label="여유율" value={inputs.furniture.lossRate} suffix="%" onChange={(v) => update("furniture", "lossRate", v)} />
                  <NumberField label="도어 폭" value={inputs.furniture.doorWidth} suffix="m" onChange={(v) => update("furniture", "doorWidth", v)} />
                </>
              )}

              {category === "lighting" && (
                <>
                  <SelectField
                    label="공간 용도"
                    value={inputs.lighting.luxPresetIndex}
                    options={luxPresets.map((item) => item.name)}
                    onChange={(v) => update("lighting", "luxPresetIndex", v)}
                  />
                  <NumberField label="평수" value={inputs.lighting.pyeong} suffix="평" onChange={(v) => update("lighting", "pyeong", v)} />
                </>
              )}

              {category === "electric" && (
                <>
                  <NumberField label="구역 수" value={inputs.electric.zones} suffix="구역" onChange={(v) => update("electric", "zones", v)} />
                  <NumberField label="구역당 조명" value={inputs.electric.lightPerZone} suffix="개" onChange={(v) => update("electric", "lightPerZone", v)} />
                  <NumberField label="구역당 콘센트" value={inputs.electric.outletPerZone} suffix="개" onChange={(v) => update("electric", "outletPerZone", v)} />
                  <NumberField label="구역당 스위치" value={inputs.electric.switchPerZone} suffix="개" onChange={(v) => update("electric", "switchPerZone", v)} />
                  <NumberField label="예비 포인트" value={inputs.electric.reserve} suffix="개" onChange={(v) => update("electric", "reserve", v)} />
                  <NumberField label="전용 회로" value={inputs.electric.dedicated} suffix="개" onChange={(v) => update("electric", "dedicated", v)} />
                </>
              )}

              {category === "aircon" && (
                <>
                  <NumberField label="평수" value={inputs.aircon.pyeong} suffix="평" onChange={(v) => update("aircon", "pyeong", v)} />
                  <NumberField label="층고" value={inputs.aircon.height} suffix="m" onChange={(v) => update("aircon", "height", v)} />
                  <NumberField label="상향 보정률" value={inputs.aircon.correction} suffix="%" onChange={(v) => update("aircon", "correction", v)} />
                </>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-top">
              <div>
                <h2>계산 결과</h2>
                <p className="desc">현재 선택: {selectedCategory.label}</p>
              </div>
              <button className="btn blue" onClick={copyResult}>
                <Copy size={17} />
                {copied ? "복사됨" : "결과 복사"}
              </button>
            </div>

            <div className="main-result">
              <div className="main-label">{result.mainLabel}</div>
              <div className="main-value">{result.mainValue}</div>
              <div className="helper">{result.helper}</div>
            </div>

            <div className="result-grid">
              {result.items.map((item) => (
                <div className="result-item" key={item.label}>
                  <div className="result-name">{item.label}</div>
                  <div className="result-value">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="notice">
              실제 현장 상황에 따라 로스율 및 시공 조건이 달라질 수 있습니다.
              자재 규격, 절단 방향, 파손 가능성을 고려해 최종 발주량은 조정하세요.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}