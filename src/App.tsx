import { useEffect, useMemo, useState } from "react";
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

type Inputs = {
  widthMm: number;
  depthMm: number;
  heightMm: number;
  qty: number;
  lossRate: number;
  tileWidthMm: number;
  tileHeightMm: number;
  piecesPerBox: number;
  siliconeLengthMm: number;
  siliconeCoveragePerTubeM: number;
  rollCoverage: number;
  boxCoverage: number;
  paintCoveragePerLiter: number;
  boardArea: number;
  lightingAreaPerUnit: number;
  outletAreaPerUnit: number;
};

type ResultData = {
  mainLabel: string;
  mainValue: string;
  items: Array<[string, string]>;
};

const STORAGE_KEY = "interior-material-calc-original-like-v1";

const categories: Array<{
  key: CategoryKey;
  label: string;
  icon: React.ElementType;
}> = [
  { key: "tile", label: "타일", icon: Grid3X3 },
  { key: "wallpaper", label: "도배", icon: Layers },
  { key: "floor", label: "마루", icon: Home },
  { key: "paint", label: "페인트", icon: Paintbrush },
  { key: "wood", label: "목공", icon: Hammer },
  { key: "furniture", label: "가구", icon: Sofa },
  { key: "lighting", label: "조명", icon: Lightbulb },
  { key: "electric", label: "전기", icon: Plug },
  { key: "aircon", label: "에어컨", icon: Wind },
];

const defaultInputs: Inputs = {
  widthMm: 3000,
  depthMm: 4000,
  heightMm: 2400,
  qty: 1,
  lossRate: 10,
  tileWidthMm: 600,
  tileHeightMm: 600,
  piecesPerBox: 4,
  siliconeLengthMm: 12000,
  siliconeCoveragePerTubeM: 8,
  rollCoverage: 5,
  boxCoverage: 3.3,
  paintCoveragePerLiter: 8,
  boardArea: 1.62,
  lightingAreaPerUnit: 5,
  outletAreaPerUnit: 6,
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

function InputBox({
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
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <em>{suffix}</em>
      </div>
    </label>
  );
}

export default function App() {
  const [category, setCategory] = useState<CategoryKey>("tile");
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved) as Partial<Inputs>;
      setInputs({ ...defaultInputs, ...parsed });
    } catch {
      setInputs(defaultInputs);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const selected = categories.find((item) => item.key === category) ?? categories[0];

  const update = (key: keyof Inputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: safe(value) }));
  };

  const result: ResultData = useMemo(() => {
    const widthM = mmToM(inputs.widthMm);
    const depthM = mmToM(inputs.depthMm);
    const heightM = mmToM(inputs.heightMm);
    const qty = Math.max(inputs.qty, 1);
    const lossRate = safe(inputs.lossRate);
    const loss = 1 + lossRate / 100;

    const floorArea = widthM * depthM * qty;
    const wallArea = widthM * heightM * qty;
    const orderArea = floorArea * loss;

    if (category === "tile") {
      const tileArea = mmToM(inputs.tileWidthMm) * mmToM(inputs.tileHeightMm);
      const purePieces = tileArea > 0 ? floorArea / tileArea : 0;
      const orderPieces = tileArea > 0 ? orderArea / tileArea : 0;
      const boxes = inputs.piecesPerBox > 0 ? orderPieces / inputs.piecesPerBox : 0;
      const siliconeLengthM = mmToM(inputs.siliconeLengthMm) * qty;
      const siliconeOrderLengthM = siliconeLengthM * loss;
      const siliconeTubes =
        inputs.siliconeCoveragePerTubeM > 0
          ? siliconeOrderLengthM / inputs.siliconeCoveragePerTubeM
          : 0;

      return {
        mainLabel: "발주 권장 매수",
        mainValue: `${ceil(orderPieces)} 장`,
        items: [
          ["시공 면적", `${format(floorArea)} ㎡`],
          ["순수 필요량", `${ceil(purePieces)} 장`],
          ["권장 박스 수", `${ceil(boxes)} 박스`],
          ["로스율", `${lossRate}%`],
          ["실리콘 길이", `${format(siliconeOrderLengthM)} m`],
          ["권장 실리콘", `${ceil(siliconeTubes)} 개`],
        ],
      };
    }

    if (category === "wallpaper") {
      const orderWallArea = wallArea * loss;
      const rolls = inputs.rollCoverage > 0 ? orderWallArea / inputs.rollCoverage : 0;
      const pureRolls = inputs.rollCoverage > 0 ? wallArea / inputs.rollCoverage : 0;

      return {
        mainLabel: "발주 권장 롤 수",
        mainValue: `${ceil(rolls)} 롤`,
        items: [
          ["벽면 면적", `${format(wallArea)} ㎡`],
          ["순수 필요량", `${ceil(pureRolls)} 롤`],
          ["로스 포함 면적", `${format(orderWallArea)} ㎡`],
          ["로스율", `${lossRate}%`],
        ],
      };
    }

    if (category === "floor") {
      const boxes = inputs.boxCoverage > 0 ? orderArea / inputs.boxCoverage : 0;
      const pureBoxes = inputs.boxCoverage > 0 ? floorArea / inputs.boxCoverage : 0;

      return {
        mainLabel: "발주 권장 박스 수",
        mainValue: `${ceil(boxes)} 박스`,
        items: [
          ["바닥 면적", `${format(floorArea)} ㎡`],
          ["순수 필요량", `${ceil(pureBoxes)} 박스`],
          ["로스 포함 면적", `${format(orderArea)} ㎡`],
          ["로스율", `${lossRate}%`],
        ],
      };
    }

    if (category === "paint") {
      const orderWallArea = wallArea * loss;
      const liters =
        inputs.paintCoveragePerLiter > 0
          ? orderWallArea / inputs.paintCoveragePerLiter
          : 0;
      const pureLiters =
        inputs.paintCoveragePerLiter > 0 ? wallArea / inputs.paintCoveragePerLiter : 0;

      return {
        mainLabel: "발주 권장 용량",
        mainValue: `${ceil(liters)} L`,
        items: [
          ["도장 면적", `${format(wallArea)} ㎡`],
          ["순수 필요량", `${format(pureLiters)} L`],
          ["로스 포함 용량", `${format(liters)} L`],
          ["로스율", `${lossRate}%`],
        ],
      };
    }

    if (category === "wood") {
      const boards = inputs.boardArea > 0 ? orderArea / inputs.boardArea : 0;
      const pureBoards = inputs.boardArea > 0 ? floorArea / inputs.boardArea : 0;

      return {
        mainLabel: "발주 권장 장수",
        mainValue: `${ceil(boards)} 장`,
        items: [
          ["작업 면적", `${format(floorArea)} ㎡`],
          ["순수 필요량", `${ceil(pureBoards)} 장`],
          ["보드 1장 면적", `${format(inputs.boardArea)} ㎡`],
          ["로스율", `${lossRate}%`],
        ],
      };
    }

    if (category === "furniture") {
      const orderQty = qty * loss;

      return {
        mainLabel: "발주 권장 수량",
        mainValue: `${ceil(orderQty)} 개`,
        items: [
          ["기본 수량", `${qty.toLocaleString("ko-KR")} 개`],
          ["예비 포함 수량", `${format(orderQty)} 개`],
          ["로스율", `${lossRate}%`],
          ["계산 기준", "개수 기준"],
        ],
      };
    }

    if (category === "lighting") {
      const units = inputs.lightingAreaPerUnit > 0 ? floorArea / inputs.lightingAreaPerUnit : 0;

      return {
        mainLabel: "권장 조명 수",
        mainValue: `${ceil(units)} 개`,
        items: [
          ["공간 면적", `${format(floorArea)} ㎡`],
          ["기준 면적", `${format(inputs.lightingAreaPerUnit)} ㎡당 1개`],
          ["수량", `${qty.toLocaleString("ko-KR")} 개소`],
          ["참고", "용도와 조도에 따라 조정"],
        ],
      };
    }

    if (category === "electric") {
      const units = inputs.outletAreaPerUnit > 0 ? floorArea / inputs.outletAreaPerUnit : 0;

      return {
        mainLabel: "권장 콘센트 수",
        mainValue: `${ceil(units)} 개`,
        items: [
          ["공간 면적", `${format(floorArea)} ㎡`],
          ["기준 면적", `${format(inputs.outletAreaPerUnit)} ㎡당 1개`],
          ["수량", `${qty.toLocaleString("ko-KR")} 개소`],
          ["참고", "가전 배치에 따라 추가"],
        ],
      };
    }

    const pyeong = floorArea / 3.305785;

    return {
      mainLabel: "권장 냉방 평형",
      mainValue: `${ceil(pyeong)} 평형`,
      items: [
        ["공간 면적", `${format(floorArea)} ㎡`],
        ["평수 환산", `${format(pyeong)} 평`],
        ["계산식", "㎡ ÷ 3.305785"],
        ["참고", "층고·창면적에 따라 조정"],
      ],
    };
  }, [category, inputs]);

  const copyResult = async () => {
    const text =
      `[${selected.label} 계산 결과]
` +
      `${result.mainLabel}: ${result.mainValue}
` +
      result.items.map((item) => `${item[0]}: ${item[1]}`).join("\\n");

    await navigator.clipboard.writeText(text);
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
            <p className="sub">아직 부족한게 많고 최종버전이 아닙니다. 11기 최정훈</p>
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
                  <p className="desc">{selected.label} 계산에 필요한 값을 입력하세요.</p>
                </div>
                <button className="btn gray" onClick={() => setInputs(defaultInputs)}>
                  <RotateCcw size={17} /> 초기화
                </button>
              </div>

              <div className="form">
                <InputBox label="가로 / 길이" value={inputs.widthMm} suffix="mm" onChange={(value) => update("widthMm", value)} />
                <InputBox label="세로 / 깊이" value={inputs.depthMm} suffix="mm" onChange={(value) => update("depthMm", value)} />
                <InputBox label="높이" value={inputs.heightMm} suffix="mm" onChange={(value) => update("heightMm", value)} />
                <InputBox label="수량" value={inputs.qty} suffix="개소" onChange={(value) => update("qty", value)} />
                <InputBox label="로스율" value={inputs.lossRate} suffix="%" onChange={(value) => update("lossRate", value)} />

                {category === "tile" && (
                  <>
                    <InputBox label="타일 1장 가로" value={inputs.tileWidthMm} suffix="mm" onChange={(value) => update("tileWidthMm", value)} />
                    <InputBox label="타일 1장 세로" value={inputs.tileHeightMm} suffix="mm" onChange={(value) => update("tileHeightMm", value)} />
                    <InputBox label="박스당 장수" value={inputs.piecesPerBox} suffix="장" onChange={(value) => update("piecesPerBox", value)} />
                    <InputBox label="실리콘 시공 길이" value={inputs.siliconeLengthMm} suffix="mm" onChange={(value) => update("siliconeLengthMm", value)} />
                    <InputBox label="실리콘 1개당 시공 길이" value={inputs.siliconeCoveragePerTubeM} suffix="m" onChange={(value) => update("siliconeCoveragePerTubeM", value)} />
                  </>
                )}

                {category === "wallpaper" && <InputBox label="롤당 시공 가능 면적" value={inputs.rollCoverage} suffix="㎡" onChange={(value) => update("rollCoverage", value)} />}
                {category === "floor" && <InputBox label="박스당 시공 가능 면적" value={inputs.boxCoverage} suffix="㎡" onChange={(value) => update("boxCoverage", value)} />}
                {category === "paint" && <InputBox label="1L당 도포 가능 면적" value={inputs.paintCoveragePerLiter} suffix="㎡" onChange={(value) => update("paintCoveragePerLiter", value)} />}
                {category === "wood" && <InputBox label="보드 1장 면적" value={inputs.boardArea} suffix="㎡" onChange={(value) => update("boardArea", value)} />}
                {category === "lighting" && <InputBox label="조명 1개당 기준 면적" value={inputs.lightingAreaPerUnit} suffix="㎡" onChange={(value) => update("lightingAreaPerUnit", value)} />}
                {category === "electric" && <InputBox label="콘센트 1개당 기준 면적" value={inputs.outletAreaPerUnit} suffix="㎡" onChange={(value) => update("outletAreaPerUnit", value)} />}
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
