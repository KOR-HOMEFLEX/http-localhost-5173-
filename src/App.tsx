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
  rollCoverage: number;
  boxCoverage: number;
  paintCoveragePerLiter: number;
  boardArea: number;
  lightingAreaPerUnit: number;
  outletAreaPerUnit: number;
};

const STORAGE_KEY = "interior-material-calc-clean-v1";

const categories = [
  { key: "tile", label: "타일", icon: Grid3X3 },
  { key: "wallpaper", label: "도배", icon: Layers },
  { key: "floor", label: "마루", icon: Home },
  { key: "paint", label: "페인트", icon: Paintbrush },
  { key: "wood", label: "목공", icon: Hammer },
  { key: "furniture", label: "가구", icon: Sofa },
  { key: "lighting", label: "조명", icon: Lightbulb },
  { key: "electric", label: "전기", icon: Plug },
  { key: "aircon", label: "에어컨", icon: Wind },
] as const;

const defaultInputs: Inputs = {
  widthMm: 3000,
  depthMm: 4000,
  heightMm: 2400,
  qty: 1,
  lossRate: 10,
  tileWidthMm: 600,
  tileHeightMm: 600,
  piecesPerBox: 4,
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
    <label className="input-wrap">
      <span>{label}</span>
      <div className="input-box">
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
      setInputs({ ...defaultInputs, ...JSON.parse(saved) });
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

  const result = useMemo(() => {
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

      return {
        mainLabel: "발주 권장 매수",
        mainValue: `${ceil(orderPieces)} 장`,
        items: [
          ["시공 면적", `${format(floorArea)} ㎡`],
          ["순수 필요량", `${ceil(purePieces)} 장`],
          ["로스율", `${lossRate}%`],
          ["권장 박스 수", `${ceil(boxes)} 박스`],
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
      const liters = inputs.paintCoveragePerLiter > 0 ? orderWallArea / inputs.paintCoveragePerLiter : 0;
      const pureLiters = inputs.paintCoveragePerLiter > 0 ? wallArea / inputs.paintCoveragePerLiter : 0;

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
      result.items.map((item) => `${item[0]}: ${item[1]}`).join("
");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        html { background: #f5f7fb; }
        body { margin: 0; color: #162033; font-family: Arial, sans-serif; }
        .page { min-height: 100vh; padding: 34px 18px; background: linear-gradient(180deg, #f7f9fd 0%, #eef3fb 100%); }
        .wrap { max-width: 1160px; margin: 0 auto; }
        .hero { padding: 28px 8px 22px; text-align: center; }
        .hero-badge { display: inline-flex; align-items: center; gap: 8px; padding: 9px 14px; border-radius: 999px; background: #eaf2ff; color: #2563eb; font-weight: 800; font-size: 14px; margin-bottom: 14px; }
        h1 { margin: 0; font-size: clamp(34px, 6vw, 58px); letter-spacing: -2px; color: #111827; line-height: 1.08; }
        .sub { margin: 14px 0 0; color: #64748b; font-size: 18px; line-height: 1.6; }
        .tabs { display: grid; grid-template-columns: repeat(9, 1fr); gap: 10px; margin: 24px 0; }
        .tab { border: 1px solid #e2e8f0; background: white; color: #334155; border-radius: 18px; padding: 15px 8px; font-weight: 800; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 7px; box-shadow: 0 8px 20px rgba(15,23,42,.05); transition: .15s ease; }
        .tab:hover { transform: translateY(-1px); border-color: #bfdbfe; }
        .tab.active { background: #2563eb; color: white; border-color: #2563eb; box-shadow: 0 14px 30px rgba(37,99,235,.22); }
        .layout { display: grid; grid-template-columns: 1.05fr .95fr; gap: 22px; }
        .card { background: white; border: 1px solid #e5e7eb; border-radius: 26px; padding: 26px; box-shadow: 0 18px 45px rgba(15,23,42,.08); }
        .card-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 22px; }
        h2 { margin: 0; font-size: 24px; color: #111827; }
        .desc { margin: 6px 0 0; color: #64748b; }
        .form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .input-wrap span { display: block; color: #475569; font-size: 14px; font-weight: 800; margin-bottom: 8px; }
        .input-box { height: 54px; display: flex; align-items: center; border: 1px solid #dbe3ef; background: #f8fafc; border-radius: 16px; padding: 0 14px; }
        .input-box:focus-within { border-color: #2563eb; background: white; box-shadow: 0 0 0 4px rgba(37,99,235,.08); }
        .input-box input { width: 100%; border: none; outline: none; background: transparent; color: #111827; font-size: 18px; font-weight: 900; }
        .input-box em { color: #64748b; font-style: normal; font-weight: 800; white-space: nowrap; }
        .btn { border: none; border-radius: 15px; padding: 13px 16px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
        .btn.gray { background: #f1f5f9; color: #334155; border: 1px solid #e2e8f0; }
        .btn.blue { background: #2563eb; color: white; }
        .main-result { border-radius: 24px; padding: 28px; background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; margin-bottom: 16px; }
        .main-label { font-size: 15px; font-weight: 800; color: rgba(255,255,255,.78); }
        .main-value { margin-top: 8px; font-size: clamp(38px, 6vw, 56px); font-weight: 1000; letter-spacing: -2px; }
        .result-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
        .result-item { border: 1px solid #e5e7eb; background: #f8fafc; border-radius: 18px; padding: 18px; }
        .result-name { color: #64748b; font-size: 14px; font-weight: 800; }
        .result-value { margin-top: 8px; color: #111827; font-size: 22px; font-weight: 1000; }
        .notice { margin-top: 20px; padding: 16px 18px; border-radius: 18px; background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; font-size: 14px; line-height: 1.6; }
        @media (max-width: 960px) { .tabs { grid-template-columns: repeat(3, 1fr); } .layout { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .page { padding: 22px 12px; } .tabs { grid-template-columns: repeat(2, 1fr); } .card { padding: 20px; border-radius: 22px; } .form, .result-grid { grid-template-columns: 1fr; } .card-top { align-items: flex-start; flex-direction: column; } }
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
