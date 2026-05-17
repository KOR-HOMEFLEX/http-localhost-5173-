import { useEffect, useMemo, useState } from "react";
import { Calculator, Copy, RotateCcw, Grid3X3, Layers, Home, Paintbrush, Hammer, Sofa, Lightbulb, Plug, Wind } from "lucide-react";

type CategoryKey = "tile" | "wallpaper" | "floor" | "paint" | "wood" | "furniture" | "lighting" | "electric" | "aircon";

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

const STORAGE_KEY = "interior-calc-simple-v2";

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

function n(value: number) {
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function m(mm: number) {
  return n(mm) / 1000;
}

function fmt(value: number, digit = 2) {
  return n(value).toLocaleString("ko-KR", { minimumFractionDigits: digit, maximumFractionDigits: digit });
}

function ceil(value: number) {
  return Math.ceil(n(value)).toLocaleString("ko-KR");
}

function InputBox({ label, value, suffix, onChange }: { label: string; value: number; suffix: string; onChange: (v: number) => void }) {
  return (
    <label className="inputWrap">
      <span>{label}</span>
      <div className="inputBox">
        <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
        <em>{suffix}</em>
      </div>
    </label>
  );
}

function App() {
  const [category, setCategory] = useState<CategoryKey>("tile");
  const [inputs, setInputs] = useState<Inputs>(defaultInputs);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setInputs({ ...defaultInputs, ...JSON.parse(saved) });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inputs));
  }, [inputs]);

  const selected = categories.find((c) => c.key === category)!;

  const update = (key: keyof Inputs, value: number) => {
    setInputs((prev) => ({ ...prev, [key]: n(value) }));
  };

  const result = useMemo(() => {
    const widthM = m(inputs.widthMm);
    const depthM = m(inputs.depthMm);
    const heightM = m(inputs.heightMm);
    const qty = Math.max(inputs.qty, 1);
    const loss = 1 + inputs.lossRate / 100;
    const floorArea = widthM * depthM * qty;
    const wallArea = widthM * heightM * qty;
    const orderArea = floorArea * loss;

    if (category === "tile") {
      const tileArea = m(inputs.tileWidthMm) * m(inputs.tileHeightMm);
      const pieces = tileArea ? orderArea / tileArea : 0;
      const boxes = inputs.piecesPerBox ? pieces / inputs.piecesPerBox : 0;
      return [
        ["시공 면적", `${fmt(floorArea)} ㎡`, "가로 × 세로 × 수량"],
        ["로스 포함 면적", `${fmt(orderArea)} ㎡`, `${inputs.lossRate}% 손실률 반영`],
        ["필요 타일 수", `${ceil(pieces)} 장`, "타일 1장 면적 기준"],
        ["권장 박스 수", `${ceil(boxes)} 박스`, "박스 단위 올림"],
      ];
    }

    if (category === "wallpaper") {
      const rolls = inputs.rollCoverage ? (wallArea * loss) / inputs.rollCoverage : 0;
      return [["벽면 면적", `${fmt(wallArea)} ㎡`, "벽 길이 × 높이"], ["권장 롤 수", `${ceil(rolls)} 롤`, "롤 단위 올림"]];
    }

    if (category === "floor") {
      const boxes = inputs.boxCoverage ? orderArea / inputs.boxCoverage : 0;
      return [["바닥 면적", `${fmt(floorArea)} ㎡`, ""], ["권장 박스 수", `${ceil(boxes)} 박스`, "박스당 시공 가능 면적 기준"]];
    }

    if (category === "paint") {
      const liters = inputs.paintCoveragePerLiter ? (wallArea * loss) / inputs.paintCoveragePerLiter : 0;
      return [["도장 면적", `${fmt(wallArea)} ㎡`, ""], ["필요 페인트", `${fmt(liters)} L`, "1L당 도포 가능 면적 기준"], ["권장 구매량", `${ceil(liters)} L`, "리터 단위 올림"]];
    }

    if (category === "wood") {
      const boards = inputs.boardArea ? orderArea / inputs.boardArea : 0;
      return [["작업 면적", `${fmt(floorArea)} ㎡`, ""], ["보드 권장 수량", `${ceil(boards)} 장`, "합판/석고보드 기준"], ["참고", "로스율 넉넉히", "재단·파손·보강분 고려"]];
    }

    if (category === "furniture") {
      const q = qty * loss;
      return [["기본 수량", `${qty} 개`, ""], ["권장 발주 수량", `${ceil(q)} 개`, "예비율 포함"]];
    }

    if (category === "lighting") {
      const units = inputs.lightingAreaPerUnit ? floorArea / inputs.lightingAreaPerUnit : 0;
      return [["공간 면적", `${fmt(floorArea)} ㎡`, ""], ["권장 조명 수", `${ceil(units)} 개`, `${inputs.lightingAreaPerUnit}㎡당 1개 기준`]];
    }

    if (category === "electric") {
      const units = inputs.outletAreaPerUnit ? floorArea / inputs.outletAreaPerUnit : 0;
      return [["공간 면적", `${fmt(floorArea)} ㎡`, ""], ["권장 콘센트 수", `${ceil(units)} 개`, `${inputs.outletAreaPerUnit}㎡당 1개 기준`]];
    }

    const pyeong = floorArea / 3.305785;
    return [["공간 면적", `${fmt(floorArea)} ㎡`, ""], ["평수 환산", `${fmt(pyeong)} 평`, "㎡ ÷ 3.305785"], ["권장 냉방 평형", `${ceil(pyeong)} 평형`, "층고·창면적에 따라 조정"]];
  }, [category, inputs]);

  const copy = async () => {
    await navigator.clipboard.writeText(`[${selected.label} 계산 결과]
` + result.map((r) => `${r[0]}: ${r[1]}`).join("\\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        body { margin: 0; background: #10141f; color: #eef4ff; font-family: Pretendard, Arial, sans-serif; }
        .page { min-height: 100vh; padding: 32px 18px; background: radial-gradient(circle at top, #243247 0%, #10141f 46%, #0b0f17 100%); }
        .wrap { max-width: 1180px; margin: 0 auto; }
        .hero { border: 1px solid rgba(255,255,255,.12); background: linear-gradient(135deg, rgba(255,255,255,.10), rgba(255,255,255,.03)); border-radius: 30px; padding: 32px; box-shadow: 0 24px 70px rgba(0,0,0,.34); }
        .badge { display: inline-flex; gap: 8px; align-items: center; padding: 9px 14px; border-radius: 999px; background: rgba(66,211,255,.13); color: #9be8ff; font-weight: 700; margin-bottom: 16px; }
        h1 { margin: 0; font-size: clamp(40px, 7vw, 78px); letter-spacing: -4px; line-height: 1.02; }
        .sub { margin: 18px 0 0; color: #b8c4d8; font-size: 20px; line-height: 1.6; }
        .tabs { display: grid; grid-template-columns: repeat(9, 1fr); gap: 10px; margin: 22px 0; }
        .tab { border: 1px solid rgba(255,255,255,.13); background: rgba(255,255,255,.08); color: #dce8fa; border-radius: 16px; padding: 14px 8px; font-weight: 800; cursor: pointer; display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .tab.active { background: #4dd7ff; color: #07121c; border-color: #4dd7ff; box-shadow: 0 16px 32px rgba(77,215,255,.22); }
        .grid { display: grid; grid-template-columns: 1.05fr .95fr; gap: 22px; }
        .card { border: 1px solid rgba(255,255,255,.12); background: rgba(12,17,27,.78); border-radius: 28px; padding: 26px; box-shadow: 0 20px 50px rgba(0,0,0,.25); }
        .cardTop { display: flex; justify-content: space-between; gap: 12px; align-items: center; margin-bottom: 22px; }
        h2 { margin: 0; font-size: 26px; }
        .desc { margin: 6px 0 0; color: #93a2b8; }
        .form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .inputWrap span { display: block; color: #c8d4e7; font-weight: 700; margin-bottom: 8px; }
        .inputBox { display: flex; align-items: center; border: 1px solid rgba(255,255,255,.14); background: #070b12; border-radius: 16px; padding: 0 14px; height: 54px; }
        .inputBox input { width: 100%; background: transparent; border: none; outline: none; color: white; font-size: 18px; font-weight: 800; }
        .inputBox em { color: #91a0b6; font-style: normal; font-weight: 700; }
        .btn { border: none; border-radius: 15px; padding: 13px 16px; font-weight: 900; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; }
        .btn.gray { background: rgba(255,255,255,.10); color: #e8eef9; border: 1px solid rgba(255,255,255,.13); }
        .btn.white { background: white; color: #07121c; }
        .results { display: grid; gap: 14px; }
        .result { background: #070b12; border: 1px solid rgba(255,255,255,.11); border-radius: 22px; padding: 20px; }
        .resultLabel { color: #91a0b6; font-weight: 800; }
        .resultValue { color: #66ddff; font-size: 34px; font-weight: 1000; margin-top: 8px; letter-spacing: -1px; }
        .hint { color: #708098; margin-top: 8px; font-size: 14px; }
        .notice { margin-top: 18px; border: 1px solid rgba(255,211,110,.22); background: rgba(255,211,110,.10); color: #ffe3a3; border-radius: 20px; padding: 16px; line-height: 1.6; }
        @media (max-width: 900px) { .tabs { grid-template-columns: repeat(3, 1fr); } .grid { grid-template-columns: 1fr; } }
        @media (max-width: 560px) { .page { padding: 18px 12px; } .hero, .card { padding: 22px; border-radius: 24px; } .form { grid-template-columns: 1fr; } .tabs { grid-template-columns: repeat(2, 1fr); } h1 { letter-spacing: -2px; } }
      `}</style>

      <main className="page">
        <div className="wrap">
          <section className="hero">
            <div className="badge"><Calculator size={18} /> 실무용 현장 계산기</div>
            <h1>현장 물량 계산 보드</h1>
            <p className="sub">자재부터 설비 권장값까지 한 화면에서 계산합니다.<br />단위: mm, ㎡, 평 · 입력값은 자동 저장됩니다.</p>
          </section>

          <section className="tabs">
            {categories.map((item) => {
              const Icon = item.icon;
              return (
                <button key={item.key} className={`tab ${category === item.key ? "active" : ""}`} onClick={() => setCategory(item.key as CategoryKey)}>
                  <Icon size={22} /> {item.label}
                </button>
              );
            })}
          </section>

          <section className="grid">
            <div className="card">
              <div className="cardTop">
                <div>
                  <h2>입력 정보</h2>
                  <p className="desc">{selected.label} 계산에 필요한 값을 입력하세요.</p>
                </div>
                <button className="btn gray" onClick={() => setInputs(defaultInputs)}><RotateCcw size={17} /> 초기화</button>
              </div>

              <div className="form">
                <InputBox label="가로 / 길이" value={inputs.widthMm} suffix="mm" onChange={(v) => update("widthMm", v)} />
                <InputBox label="세로 / 깊이" value={inputs.depthMm} suffix="mm" onChange={(v) => update("depthMm", v)} />
                <InputBox label="높이" value={inputs.heightMm} suffix="mm" onChange={(v) => update("heightMm", v)} />
                <InputBox label="수량" value={inputs.qty} suffix="개소" onChange={(v) => update("qty", v)} />
                <InputBox label="손실률" value={inputs.lossRate} suffix="%" onChange={(v) => update("lossRate", v)} />

                {category === "tile" && <>
                  <InputBox label="타일 1장 가로" value={inputs.tileWidthMm} suffix="mm" onChange={(v) => update("tileWidthMm", v)} />
                  <InputBox label="타일 1장 세로" value={inputs.tileHeightMm} suffix="mm" onChange={(v) => update("tileHeightMm", v)} />
                  <InputBox label="박스당 장수" value={inputs.piecesPerBox} suffix="장" onChange={(v) => update("piecesPerBox", v)} />
                </>}

                {category === "wallpaper" && <InputBox label="롤당 시공 가능 면적" value={inputs.rollCoverage} suffix="㎡" onChange={(v) => update("rollCoverage", v)} />}
                {category === "floor" && <InputBox label="박스당 시공 가능 면적" value={inputs.boxCoverage} suffix="㎡" onChange={(v) => update("boxCoverage", v)} />}
                {category === "paint" && <InputBox label="1L당 도포 가능 면적" value={inputs.paintCoveragePerLiter} suffix="㎡" onChange={(v) => update("paintCoveragePerLiter", v)} />}
                {category === "wood" && <InputBox label="보드 1장 면적" value={inputs.boardArea} suffix="㎡" onChange={(v) => update("boardArea", v)} />}
                {category === "lighting" && <InputBox label="조명 1개당 기준 면적" value={inputs.lightingAreaPerUnit} suffix="㎡" onChange={(v) => update("lightingAreaPerUnit", v)} />}
                {category === "electric" && <InputBox label="콘센트 1개당 기준 면적" value={inputs.outletAreaPerUnit} suffix="㎡" onChange={(v) => update("outletAreaPerUnit", v)} />}
              </div>
            </div>

            <div className="card">
              <div className="cardTop">
                <div>
                  <h2>계산 결과</h2>
                  <p className="desc">현재 선택: {selected.label}</p>
                </div>
                <button className="btn white" onClick={copy}><Copy size={17} /> {copied ? "복사됨" : "결과 복사"}</button>
              </div>

              <div className="results">
                {result.map((r) => (
                  <div className="result" key={r[0]}>
                    <div className="resultLabel">{r[0]}</div>
                    <div className="resultValue">{r[1]}</div>
                    {r[2] && <div className="hint">{r[2]}</div>}
                  </div>
                ))}
              </div>

              <div className="notice">실제 현장 상황에 따라 손실률 및 시공 조건이 달라질 수 있습니다. 자재 규격, 절단 방향, 파손 가능성에 따라 최종 발주량은 조정하세요.</div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

export default App;
