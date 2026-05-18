import { useMemo, useState } from "react";
import "./styles.css";

import {
  categories,
  defaultInputs,
  wallpaperTypes,
  floorTypes,
  boardTypes,
  paintTypes,
  furnitureTypes,
  luxPresets,
  type AreaMode,
  type AirconInputs,
  type AirconType,
  type AirconUse,
  type CategoryKey,
  type ElectricInputs,
  type FloorInputs,
  type FurnitureInputs,
  type Inputs,
  type LightInstallType,
  type LightingInputs,
  type PaintInputs,
  type PaintTarget,
  type TileInputs,
  type TileTarget,
  type WallpaperInputs,
  type WoodInputs,
  type WoodMode,
} from "./data";

import {
  airconCalc,
  electricCalc,
  floorCalc,
  furnitureCalc,
  lightingCalc,
  paintCalc,
  tileCalc,
  wallpaperCalc,
  woodCalc,
} from "./calculators";

type CalcResult = {
  mainLabel: string;
  mainValue: string;
  mainUnit: string;
  subText: string;
  cards: {
    label: string;
    value: string;
  }[];
  note: string;
  chips: string[];
};

const cloneInputs = (): Inputs => JSON.parse(JSON.stringify(defaultInputs));

function NumberField({
  label,
  value,
  suffix,
  onChange,
  full = false,
}: {
  label: string;
  value: number;
  suffix?: string;
  onChange: (value: number) => void;
  full?: boolean;
}) {
  return (
    <label className={`field ${full ? "full" : ""}`}>
      <span className="field-label">{label}</span>
      <div className="field-control">
        <input
          type="number"
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        {suffix && <em>{suffix}</em>}
      </div>
    </label>
  );
}

function TextField({
  label,
  value,
  placeholder,
  onChange,
  full = false,
}: {
  label: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`field ${full ? "full" : ""}`}>
      <span className="field-label">{label}</span>
      <div className="field-control">
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  full = false,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  full?: boolean;
}) {
  return (
    <label className={`field ${full ? "full" : ""}`}>
      <span className="field-label">{label}</span>
      <div className="field-control">
        <select value={value} onChange={(event) => onChange(event.target.value)}>
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </label>
  );
}

function ToggleGroup<T extends string>({
  label,
  value,
  options,
  onChange,
  full = false,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
  full?: boolean;
}) {
  return (
    <div className={`field ${full ? "full" : ""}`}>
      <span className="field-label">{label}</span>
      <div className="toggle-row">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            className={`toggle-btn ${value === option.value ? "active" : ""}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function CheckToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      className={`toggle-btn ${checked ? "active" : ""}`}
      onClick={() => onChange(!checked)}
    >
      {label}
    </button>
  );
}

export default function App() {
  const [category, setCategory] = useState<CategoryKey>("wood");
  const [inputs, setInputs] = useState<Inputs>(() => cloneInputs());
  const [copied, setCopied] = useState(false);

  const selectedCategory =
    categories.find((item) => item.key === category) ?? categories[0];

  const updateGroup = <T extends CategoryKey>(
    group: T,
    patch: Partial<Inputs[T]>
  ) => {
    setInputs((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        ...patch,
      },
    }));
  };

  const resetCurrent = () => {
    setInputs((prev) => ({
      ...prev,
      [category]: cloneInputs()[category],
    }));
  };

  const result: CalcResult = useMemo(() => {
    if (category === "wood") return woodCalc(inputs.wood);
    if (category === "electric") return electricCalc(inputs.electric);
    if (category === "aircon") return airconCalc(inputs.aircon);
    if (category === "paint") return paintCalc(inputs.paint);
    if (category === "wallpaper") return wallpaperCalc(inputs.wallpaper);
    if (category === "floor") return floorCalc(inputs.floor);
    if (category === "tile") return tileCalc(inputs.tile);
    if (category === "furniture") return furnitureCalc(inputs.furniture);
    return lightingCalc(inputs.lighting);
  }, [category, inputs]);

  const copyResult = async () => {
    const lines = [
      `[${selectedCategory.label} 계산 결과]`,
      `${result.mainLabel}: ${result.mainValue}${result.mainUnit}`,
      ...result.cards.map((card) => `${card.label}: ${card.value}`),
      `메모: ${result.note}`,
    ];

    await navigator.clipboard.writeText(lines.join(String.fromCharCode(10)));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const commonFields = (group: CategoryKey) => {
    const current = inputs[group] as { siteName: string; spaceName: string };

    return (
      <>
        <TextField
          label="현장명"
          value={current.siteName}
          placeholder="예: HOMEFLEX 현장"
          onChange={(value) =>
            updateGroup(group, { siteName: value } as Partial<Inputs[typeof group]>)
          }
        />
        <TextField
          label="공간명"
          value={current.spaceName}
          placeholder="예: 거실 / 욕실 / 주방"
          onChange={(value) =>
            updateGroup(group, { spaceName: value } as Partial<Inputs[typeof group]>)
          }
        />
      </>
    );
  };

  const renderWoodForm = () => {
    const value: WoodInputs = inputs.wood;

    return (
      <>
        {commonFields("wood")}

        <ToggleGroup<WoodMode>
          label="산출 종류"
          value={value.mode}
          full
          options={[
            { label: "보드", value: "board" },
            { label: "몰딩/걸레받이", value: "molding" },
            { label: "가벽틀", value: "partition" },
          ]}
          onChange={(mode) => updateGroup("wood", { mode })}
        />

        {value.mode === "board" && (
          <>
            <SelectField
              label="보드 규격"
              value={value.boardType}
              options={boardTypes.map((item) => item.name)}
              onChange={(boardType) => {
                const board = boardTypes.find((item) => item.name === boardType);
                updateGroup("wood", {
                  boardType,
                  boardWidth: board?.width ?? value.boardWidth,
                  boardHeight: board?.height ?? value.boardHeight,
                });
              }}
            />

            <ToggleGroup<AreaMode>
              label="면적 입력 방식"
              value={value.areaMode}
              options={[
                { label: "평수", value: "pyeong" },
                { label: "가로 × 세로", value: "size" },
              ]}
              onChange={(areaMode) => updateGroup("wood", { areaMode })}
            />

            {value.areaMode === "pyeong" ? (
              <NumberField
                label="시공 평수"
                value={value.pyeong}
                suffix="평"
                onChange={(pyeong) => updateGroup("wood", { pyeong })}
              />
            ) : (
              <>
                <NumberField
                  label="가로"
                  value={value.width}
                  suffix="m"
                  onChange={(width) => updateGroup("wood", { width })}
                />
                <NumberField
                  label="세로"
                  value={value.height}
                  suffix="m"
                  onChange={(height) => updateGroup("wood", { height })}
                />
              </>
            )}

            <NumberField
              label="겹수"
              value={value.boardLayers}
              suffix="겹"
              onChange={(boardLayers) => updateGroup("wood", { boardLayers })}
            />
            <NumberField
              label="여유율"
              value={value.lossRate}
              suffix="%"
              onChange={(lossRate) => updateGroup("wood", { lossRate })}
            />
          </>
        )}

        {value.mode === "molding" && (
          <>
            <NumberField
              label="총 길이"
              value={value.moldingTotalLength}
              suffix="m"
              onChange={(moldingTotalLength) =>
                updateGroup("wood", { moldingTotalLength })
              }
            />
            <NumberField
              label="자재 한 본 길이"
              value={value.moldingPieceLength}
              suffix="m"
              onChange={(moldingPieceLength) =>
                updateGroup("wood", { moldingPieceLength })
              }
            />
            <NumberField
              label="여유율"
              value={value.lossRate}
              suffix="%"
              onChange={(lossRate) => updateGroup("wood", { lossRate })}
            />
          </>
        )}

        {value.mode === "partition" && (
          <>
            <NumberField
              label="가벽 폭"
              value={value.partitionWidth}
              suffix="m"
              onChange={(partitionWidth) =>
                updateGroup("wood", { partitionWidth })
              }
            />
            <NumberField
              label="가벽 높이"
              value={value.partitionHeight}
              suffix="m"
              onChange={(partitionHeight) =>
                updateGroup("wood", { partitionHeight })
              }
            />
            <NumberField
              label="스터드 간격"
              value={value.studSpacing}
              suffix="mm"
              onChange={(studSpacing) => updateGroup("wood", { studSpacing })}
            />
            <NumberField
              label="자재 한 본 길이"
              value={value.studPieceLength}
              suffix="m"
              onChange={(studPieceLength) =>
                updateGroup("wood", { studPieceLength })
              }
            />
            <NumberField
              label="여유율"
              value={value.lossRate}
              suffix="%"
              onChange={(lossRate) => updateGroup("wood", { lossRate })}
            />
          </>
        )}
      </>
    );
  };

  const renderElectricForm = () => {
    const value: ElectricInputs = inputs.electric;

    return (
      <>
        {commonFields("electric")}

        <SelectField
          label="현장 유형"
          value={value.siteType}
          options={["주거/아파트", "상가/사무실", "숙박/상업공간"]}
          onChange={(siteType) => updateGroup("electric", { siteType })}
        />
        <NumberField
          label="공간/구역 수"
          value={value.zones}
          suffix="구역"
          onChange={(zones) => updateGroup("electric", { zones })}
        />
        <NumberField
          label="조명 / 구역"
          value={value.lightPerZone}
          suffix="개"
          onChange={(lightPerZone) => updateGroup("electric", { lightPerZone })}
        />
        <NumberField
          label="콘센트 / 구역"
          value={value.outletPerZone}
          suffix="개"
          onChange={(outletPerZone) =>
            updateGroup("electric", { outletPerZone })
          }
        />
        <NumberField
          label="스위치 / 구역"
          value={value.switchPerZone}
          suffix="개"
          onChange={(switchPerZone) =>
            updateGroup("electric", { switchPerZone })
          }
        />
        <NumberField
          label="예비 포인트"
          value={value.sparePoints}
          suffix="개"
          onChange={(sparePoints) => updateGroup("electric", { sparePoints })}
        />

        <div className="field full">
          <span className="field-label">전용회로 후보</span>
          <div className="toggle-row">
            <CheckToggle
              label="에어컨"
              checked={value.airconCircuit}
              onChange={(airconCircuit) =>
                updateGroup("electric", { airconCircuit })
              }
            />
            <CheckToggle
              label="인덕션/오븐"
              checked={value.inductionCircuit}
              onChange={(inductionCircuit) =>
                updateGroup("electric", { inductionCircuit })
              }
            />
            <CheckToggle
              label="세탁·건조기"
              checked={value.laundryCircuit}
              onChange={(laundryCircuit) =>
                updateGroup("electric", { laundryCircuit })
              }
            />
            <CheckToggle
              label="욕실 고정기기"
              checked={value.bathroomCircuit}
              onChange={(bathroomCircuit) =>
                updateGroup("electric", { bathroomCircuit })
              }
            />
          </div>
        </div>
      </>
    );
  };

  const renderAirconForm = () => {
    const value: AirconInputs = inputs.aircon;

    return (
      <>
        {commonFields("aircon")}

        <ToggleGroup<AirconUse>
          label="사용 목적"
          value={value.useType}
          options={[
            { label: "가정용", value: "home" },
            { label: "상업용", value: "commercial" },
          ]}
          onChange={(useType) => updateGroup("aircon", { useType })}
        />

        <ToggleGroup<AirconType>
          label="에어컨 종류"
          value={value.airconType}
          options={[
            { label: "스탠드", value: "stand" },
            { label: "시스템", value: "system" },
          ]}
          onChange={(airconType) => updateGroup("aircon", { airconType })}
        />

        {value.useType === "commercial" && (
          <SelectField
            label="상업공간 종류"
            value={value.commercialType}
            options={["사무실", "매장", "식당/카페", "학원/병원"]}
            onChange={(commercialType) =>
              updateGroup("aircon", { commercialType })
            }
          />
        )}

        <NumberField
          label="냉방 면적"
          value={value.coolingPyeong}
          suffix="평"
          onChange={(coolingPyeong) =>
            updateGroup("aircon", { coolingPyeong })
          }
        />

        <SelectField
          label="햇빛 노출"
          value={value.sunExposure}
          options={["북향·약함", "동향·일반", "남향·보통", "서향·강함"]}
          onChange={(sunExposure) => updateGroup("aircon", { sunExposure })}
        />

        <NumberField
          label="천장 높이"
          value={value.ceilingHeight}
          suffix="m"
          onChange={(ceilingHeight) =>
            updateGroup("aircon", { ceilingHeight })
          }
        />

        <div className="field full">
          <span className="field-label">보정 조건</span>
          <div className="toggle-row">
            <CheckToggle
              label="거실+주방 오픈형"
              checked={value.openLivingKitchen}
              onChange={(openLivingKitchen) =>
                updateGroup("aircon", { openLivingKitchen })
              }
            />
            <CheckToggle
              label="탑층 또는 단열취약"
              checked={value.topFloorOrWeakInsulation}
              onChange={(topFloorOrWeakInsulation) =>
                updateGroup("aircon", { topFloorOrWeakInsulation })
              }
            />
          </div>
        </div>
      </>
    );
  };

  const renderPaintForm = () => {
    const value: PaintInputs = inputs.paint;

    return (
      <>
        {commonFields("paint")}

        <SelectField
          label="페인트 종류"
          value={value.paintType}
          options={paintTypes.map((item) => item.name)}
          onChange={(paintType) => updateGroup("paint", { paintType })}
        />

        <ToggleGroup<PaintTarget>
          label="시공 부위"
          value={value.target}
          options={[
            { label: "벽", value: "wall" },
            { label: "천장", value: "ceiling" },
            { label: "직접 면적", value: "direct" },
          ]}
          onChange={(target) => updateGroup("paint", { target })}
        />

        {value.target !== "direct" && (
          <ToggleGroup<AreaMode>
            label="면적 입력 방식"
            value={value.areaMode}
            options={[
              { label: "평수", value: "pyeong" },
              { label: "가로 × 세로", value: "size" },
            ]}
            onChange={(areaMode) => updateGroup("paint", { areaMode })}
          />
        )}

        {value.target === "direct" ? (
          <NumberField
            label="직접 입력 면적"
            value={value.directArea}
            suffix="㎡"
            onChange={(directArea) => updateGroup("paint", { directArea })}
          />
        ) : value.areaMode === "pyeong" ? (
          <NumberField
            label="실 평수"
            value={value.pyeong}
            suffix="평"
            onChange={(pyeong) => updateGroup("paint", { pyeong })}
          />
        ) : (
          <>
            <NumberField
              label="가로"
              value={value.width}
              suffix="m"
              onChange={(width) => updateGroup("paint", { width })}
            />
            <NumberField
              label="세로"
              value={value.height}
              suffix="m"
              onChange={(height) => updateGroup("paint", { height })}
            />
          </>
        )}

        <NumberField
          label="천장 높이"
          value={value.ceilingHeight}
          suffix="m"
          onChange={(ceilingHeight) =>
            updateGroup("paint", { ceilingHeight })
          }
        />
        <NumberField
          label="도장 횟수"
          value={value.coats}
          suffix="회"
          onChange={(coats) => updateGroup("paint", { coats })}
        />
        <NumberField
          label="로스율"
          value={value.lossRate}
          suffix="%"
          onChange={(lossRate) => updateGroup("paint", { lossRate })}
        />
      </>
    );
  };

  const renderWallpaperForm = () => {
    const value: WallpaperInputs = inputs.wallpaper;

    return (
      <>
        {commonFields("wallpaper")}

        <SelectField
          label="벽지 종류"
          value={value.wallpaperType}
          options={wallpaperTypes.map((item) => item.name)}
          onChange={(wallpaperType) =>
            updateGroup("wallpaper", { wallpaperType })
          }
        />

        <ToggleGroup<AreaMode>
          label="면적 입력 방식"
          value={value.areaMode}
          options={[
            { label: "평수", value: "pyeong" },
            { label: "가로 × 세로", value: "size" },
          ]}
          onChange={(areaMode) => updateGroup("wallpaper", { areaMode })}
        />

        {value.areaMode === "pyeong" ? (
          <NumberField
            label="시공 평수"
            value={value.pyeong}
            suffix="평"
            onChange={(pyeong) => updateGroup("wallpaper", { pyeong })}
          />
        ) : (
          <>
            <NumberField
              label="가로"
              value={value.width}
              suffix="m"
              onChange={(width) => updateGroup("wallpaper", { width })}
            />
            <NumberField
              label="세로"
              value={value.height}
              suffix="m"
              onChange={(height) => updateGroup("wallpaper", { height })}
            />
          </>
        )}

        <NumberField
          label="천장 높이"
          value={value.ceilingHeight}
          suffix="m"
          onChange={(ceilingHeight) =>
            updateGroup("wallpaper", { ceilingHeight })
          }
        />

        <div className="field">
          <span className="field-label">천장 도배 포함</span>
          <div className="toggle-row">
            <CheckToggle
              label="천장 포함"
              checked={value.includeCeiling}
              onChange={(includeCeiling) =>
                updateGroup("wallpaper", { includeCeiling })
              }
            />
          </div>
        </div>

        <NumberField
          label="로스율"
          value={value.lossRate}
          suffix="%"
          onChange={(lossRate) => updateGroup("wallpaper", { lossRate })}
        />
      </>
    );
  };

  const renderFloorForm = () => {
    const value: FloorInputs = inputs.floor;

    return (
      <>
        {commonFields("floor")}

        <SelectField
          label="마루 종류"
          value={value.floorType}
          options={floorTypes.map((item) => item.name)}
          onChange={(floorType) => {
            const floor = floorTypes.find((item) => item.name === floorType);
            updateGroup("floor", {
              floorType,
              boxCoverage: floor?.coverage ?? value.boxCoverage,
            });
          }}
        />

        <NumberField
          label="박스당 면적"
          value={value.boxCoverage}
          suffix="평"
          onChange={(boxCoverage) => updateGroup("floor", { boxCoverage })}
        />

        <ToggleGroup<AreaMode>
          label="면적 입력 방식"
          value={value.areaMode}
          options={[
            { label: "평수", value: "pyeong" },
            { label: "가로 × 세로", value: "size" },
          ]}
          onChange={(areaMode) => updateGroup("floor", { areaMode })}
        />

        {value.areaMode === "pyeong" ? (
          <NumberField
            label="시공 평수"
            value={value.pyeong}
            suffix="평"
            onChange={(pyeong) => updateGroup("floor", { pyeong })}
          />
        ) : (
          <>
            <NumberField
              label="가로"
              value={value.width}
              suffix="m"
              onChange={(width) => updateGroup("floor", { width })}
            />
            <NumberField
              label="세로"
              value={value.height}
              suffix="m"
              onChange={(height) => updateGroup("floor", { height })}
            />
          </>
        )}

        <NumberField
          label="실 둘레"
          value={value.roomPerimeter}
          suffix="m"
          onChange={(roomPerimeter) =>
            updateGroup("floor", { roomPerimeter })
          }
        />
        <NumberField
          label="로스율"
          value={value.lossRate}
          suffix="%"
          onChange={(lossRate) => updateGroup("floor", { lossRate })}
        />
      </>
    );
  };

  const renderTileForm = () => {
    const value: TileInputs = inputs.tile;

    return (
      <>
        {commonFields("tile")}

        <ToggleGroup<TileTarget>
          label="시공 부위"
          value={value.target}
          options={[
            { label: "바닥", value: "floor" },
            { label: "벽", value: "wall" },
          ]}
          onChange={(target) => updateGroup("tile", { target })}
        />

        <ToggleGroup<AreaMode>
          label="면적 입력 방식"
          value={value.areaMode}
          options={[
            { label: "평수", value: "pyeong" },
            { label: "가로 × 세로", value: "size" },
          ]}
          onChange={(areaMode) => updateGroup("tile", { areaMode })}
        />

        {value.areaMode === "pyeong" ? (
          <NumberField
            label="시공 평수"
            value={value.pyeong}
            suffix="평"
            onChange={(pyeong) => updateGroup("tile", { pyeong })}
          />
        ) : (
          <>
            <NumberField
              label="가로"
              value={value.width}
              suffix="m"
              onChange={(width) => updateGroup("tile", { width })}
            />
            <NumberField
              label="세로"
              value={value.height}
              suffix="m"
              onChange={(height) => updateGroup("tile", { height })}
            />
          </>
        )}

        <NumberField
          label="타일 가로"
          value={value.tileWidth}
          suffix="mm"
          onChange={(tileWidth) => updateGroup("tile", { tileWidth })}
        />
        <NumberField
          label="타일 세로"
          value={value.tileHeight}
          suffix="mm"
          onChange={(tileHeight) => updateGroup("tile", { tileHeight })}
        />
        <NumberField
          label="박스당 매수"
          value={value.piecesPerBox}
          suffix="매"
          onChange={(piecesPerBox) =>
            updateGroup("tile", { piecesPerBox })
          }
        />
        <NumberField
          label="접착제 1포/통 시공량"
          value={value.adhesiveCoverage}
          suffix="㎡"
          onChange={(adhesiveCoverage) =>
            updateGroup("tile", { adhesiveCoverage })
          }
        />
        <NumberField
          label="메지 폭"
          value={value.groutWidth}
          suffix="mm"
          onChange={(groutWidth) => updateGroup("tile", { groutWidth })}
        />
        <NumberField
          label="메지 깊이"
          value={value.groutDepth}
          suffix="mm"
          onChange={(groutDepth) => updateGroup("tile", { groutDepth })}
        />
        <NumberField
          label="실리콘 길이"
          value={value.siliconLength}
          suffix="m"
          onChange={(siliconLength) =>
            updateGroup("tile", { siliconLength })
          }
        />
        <NumberField
          label="로스율"
          value={value.lossRate}
          suffix="%"
          onChange={(lossRate) => updateGroup("tile", { lossRate })}
        />
      </>
    );
  };

  const renderFurnitureForm = () => {
    const value: FurnitureInputs = inputs.furniture;

    return (
      <>
        {commonFields("furniture")}

        <SelectField
          label="가구 종류"
          value={value.furnitureType}
          options={furnitureTypes.map((item) => item.name)}
          onChange={(furnitureType) =>
            updateGroup("furniture", { furnitureType })
          }
        />
        <NumberField
          label="하부/본체 길이"
          value={value.lowerLength}
          suffix="m"
          onChange={(lowerLength) =>
            updateGroup("furniture", { lowerLength })
          }
        />
        <NumberField
          label="상부장 길이"
          value={value.upperLength}
          suffix="m"
          onChange={(upperLength) =>
            updateGroup("furniture", { upperLength })
          }
        />
        <NumberField
          label="도어 기준 폭"
          value={value.doorWidth}
          suffix="mm"
          onChange={(doorWidth) =>
            updateGroup("furniture", { doorWidth })
          }
        />
        <NumberField
          label="도어 높이"
          value={value.doorHeight}
          suffix="mm"
          onChange={(doorHeight) =>
            updateGroup("furniture", { doorHeight })
          }
        />
        <NumberField
          label="상판 깊이"
          value={value.countertopWidth}
          suffix="mm"
          onChange={(countertopWidth) =>
            updateGroup("furniture", { countertopWidth })
          }
        />

        <div className="field">
          <span className="field-label">상판 산출</span>
          <div className="toggle-row">
            <CheckToggle
              label="상판 포함"
              checked={value.includeCountertop}
              onChange={(includeCountertop) =>
                updateGroup("furniture", { includeCountertop })
              }
            />
          </div>
        </div>

        <NumberField
          label="여유율"
          value={value.lossRate}
          suffix="%"
          onChange={(lossRate) => updateGroup("furniture", { lossRate })}
        />
      </>
    );
  };

  const renderLightingForm = () => {
    const value: LightingInputs = inputs.lighting;

    return (
      <>
        {commonFields("lighting")}

        <SelectField
          label="공간 종류"
          value={value.spaceType}
          options={luxPresets.map((item) => item.name)}
          onChange={(spaceType) => updateGroup("lighting", { spaceType })}
        />

        <ToggleGroup<AreaMode>
          label="면적 입력 방식"
          value={value.areaMode}
          options={[
            { label: "평수", value: "pyeong" },
            { label: "가로 × 세로", value: "size" },
          ]}
          onChange={(areaMode) => updateGroup("lighting", { areaMode })}
        />

        {value.areaMode === "pyeong" ? (
          <NumberField
            label="시공 평수"
            value={value.pyeong}
            suffix="평"
            onChange={(pyeong) => updateGroup("lighting", { pyeong })}
          />
        ) : (
          <>
            <NumberField
              label="가로"
              value={value.width}
              suffix="m"
              onChange={(width) => updateGroup("lighting", { width })}
            />
            <NumberField
              label="세로"
              value={value.height}
              suffix="m"
              onChange={(height) => updateGroup("lighting", { height })}
            />
          </>
        )}

        <NumberField
          label="천장 높이"
          value={value.ceilingHeight}
          suffix="m"
          onChange={(ceilingHeight) =>
            updateGroup("lighting", { ceilingHeight })
          }
        />

        <ToggleGroup<LightInstallType>
          label="시공 방식"
          value={value.installType}
          options={[
            { label: "다운라이트 중심", value: "downlight" },
            { label: "메인등 병행", value: "main" },
          ]}
          onChange={(installType) =>
            updateGroup("lighting", { installType })
          }
        />
      </>
    );
  };

  const renderForm = () => {
    if (category === "wood") return renderWoodForm();
    if (category === "electric") return renderElectricForm();
    if (category === "aircon") return renderAirconForm();
    if (category === "paint") return renderPaintForm();
    if (category === "wallpaper") return renderWallpaperForm();
    if (category === "floor") return renderFloorForm();
    if (category === "tile") return renderTileForm();
    if (category === "furniture") return renderFurnitureForm();
    return renderLightingForm();
  };

  return (
    <main className="page notranslate" translate="no">
      <div className="wrap">
        <section className="hero">
          <div className="hero-badge">INTERIOR CALCULATOR</div>
          <h1>현장 물량 계산 보드</h1>
          <p className="sub">
            자재부터 설비 권장값까지 한 화면에서 계산합니다. 입력값을 바꾸면 결과가 즉시 갱신됩니다.
          </p>
        </section>

        <section className="tabs">
          {categories.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`tab ${category === item.key ? "active" : ""}`}
              onClick={() => setCategory(item.key)}
            >
              <span className="tab-emoji">{item.emoji}</span>
              <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </section>

        <section className="layout">
          <div className="card">
            <div className="card-top">
              <div>
                <h2>입력</h2>
                <p className="desc">{selectedCategory.label} 산출에 필요한 값을 입력하세요.</p>
              </div>
              <button type="button" className="btn gray" onClick={resetCurrent}>
                초기화
              </button>
            </div>

            <div className="form">{renderForm()}</div>
          </div>

          <div className="result-panel">
            <div className="card">
              <div className="card-top">
                <div>
                  <h2>결과</h2>
                  <p className="desc">현재 선택: {selectedCategory.label}</p>
                </div>
                <button type="button" className="btn blue" onClick={copyResult}>
                  {copied ? "복사됨" : "결과 복사"}
                </button>
              </div>

              <div className="main-result">
                <div className="main-label">{result.mainLabel}</div>
                <div className="main-value-row">
                  <div className="main-value">{result.mainValue}</div>
                  <div className="main-unit">{result.mainUnit}</div>
                </div>
                <div className="helper">{result.subText}</div>
              </div>

              <div className="result-grid">
                {result.cards.map((card) => (
                  <div className="result-item" key={card.label}>
                    <div className="result-name">{card.label}</div>
                    <div className="result-value">{card.value}</div>
                  </div>
                ))}
              </div>

              <div className="notice">
                <div className="notice-title">현장 메모</div>
                <div className="notice-text">{result.note}</div>
                <div className="chips">
                  {result.chips.map((chip) => (
                    <span className="chip" key={chip}>
                      {chip}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}