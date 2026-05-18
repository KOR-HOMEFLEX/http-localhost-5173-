import {
  boardTypes,
  floorTypes,
  luxPresets,
  paintTypes,
  wallpaperTypes,
  type AirconInputs,
  type ElectricInputs,
  type FloorInputs,
  type FurnitureInputs,
  type LightingInputs,
  type PaintInputs,
  type TileInputs,
  type WallpaperInputs,
  type WoodInputs,
} from "./data";

const PYEONG_TO_M2 = 3.3058;

const safeNumber = (value: number, fallback = 0) => {
  if (!Number.isFinite(value)) return fallback;
  return value;
};

const round1 = (value: number) => Math.round(value * 10) / 10;

const areaByMode = (
  areaMode: "pyeong" | "size",
  pyeong: number,
  width: number,
  height: number
) => {
  if (areaMode === "pyeong") return safeNumber(pyeong) * PYEONG_TO_M2;
  return safeNumber(width) * safeNumber(height);
};

export const formatNumber = (value: number, digits = 1) => {
  const safe = safeNumber(value);
  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: digits,
  }).format(safe);
};

export const tileCalc = (input: TileInputs) => {
  const baseArea = areaByMode(input.areaMode, input.pyeong, input.width, input.height);
  const wallFactor = input.target === "wall" ? 1.1 : 1;
  const workArea = baseArea * wallFactor;
  const lossIncludedArea = workArea * (1 + input.lossRate / 100);

  const tileArea = (input.tileWidth / 1000) * (input.tileHeight / 1000);
  const purePieces = tileArea > 0 ? workArea / tileArea : 0;
  const recommendPieces = Math.ceil(tileArea > 0 ? lossIncludedArea / tileArea : 0);

  const boxes = Math.ceil(recommendPieces / Math.max(input.piecesPerBox, 1));
  const adhesiveBags = Math.ceil(workArea / Math.max(input.adhesiveCoverage, 1));

  const groutKg =
    input.groutWidth > 0 && input.groutDepth > 0
      ? round1(workArea * 0.11 * (input.groutWidth / 3) * (input.groutDepth / 6))
      : 0;

  const siliconTubes = input.siliconLength > 0 ? Math.ceil(input.siliconLength / 8) : 0;

  return {
    mainLabel: "발주 권장 매수",
    mainValue: `${recommendPieces}`,
    mainUnit: "매",
    subText: `순수 ${Math.ceil(purePieces)}매 + 로스 ${input.lossRate}%`,
    cards: [
      { label: "박스 수", value: `${boxes}박스` },
      { label: "접착제", value: `${adhesiveBags}포` },
      { label: "메지/줄눈", value: groutKg > 0 ? `${groutKg}kg` : "제외" },
      { label: "실리콘", value: siliconTubes > 0 ? `${siliconTubes}개` : "제외" },
    ],
    note:
      "욕실·주방 등 절단이 많은 부위는 로스율 15% 이상을 권장합니다. 접착제와 메지는 제조사 소요량, 흡수율, 바탕 상태에 따라 달라집니다.",
    chips: ["박스 단위 발주", "절단 많은 구간 로스 상향", "동일 LOT 확보 확인", "압착·메지 제조사 소요량 확인"],
  };
};

export const wallpaperCalc = (input: WallpaperInputs) => {
  const type = wallpaperTypes.find((item) => item.name === input.wallpaperType) ?? wallpaperTypes[0];

  const floorArea = areaByMode(input.areaMode, input.pyeong, input.width, input.height);
  const ceilingHeight = Math.max(input.ceilingHeight, 0);
  const wallArea =
    input.areaMode === "pyeong"
      ? floorArea * 1.1 * (ceilingHeight / 2.4)
      : (input.width + input.height) * 2 * ceilingHeight;

  const ceilingArea = input.includeCeiling ? floorArea : 0;
  const totalArea = wallArea + ceilingArea;
  const lossIncludedArea = totalArea * (1 + input.lossRate / 100);
  const rolls = Math.ceil(lossIncludedArea / Math.max(type.coverage, 1));
  const glueKg = Math.ceil(totalArea / 15);

  return {
    mainLabel: "발주 권장 롤 수",
    mainValue: `${rolls}`,
    mainUnit: "롤",
    subText: `순수 ${formatNumber(totalArea / type.coverage, 1)}롤 + 로스 ${input.lossRate}%`,
    cards: [
      { label: "벽 면적", value: `${formatNumber(wallArea, 1)}㎡` },
      { label: "총 도배 면적", value: `${formatNumber(totalArea, 1)}㎡` },
      { label: "롤당 시공량", value: `${formatNumber(type.coverage, 1)}㎡` },
      { label: "예상 풀", value: `${glueKg}kg` },
    ],
    note:
      "벽 면적은 실평수와 천장 높이 기준 표준 환산식을 적용합니다. 큰 무늬 벽지는 로스율 20% 이상을 권장합니다.",
    chips: ["실내공기질 방출확인 표지 확인", "천장 포함 여부 확인", "무늬 매칭 시 로스 상향"],
  };
};

export const floorCalc = (input: FloorInputs) => {
  const area = areaByMode(input.areaMode, input.pyeong, input.width, input.height);
  const pyeong = area / PYEONG_TO_M2;
  const type = floorTypes.find((item) => item.name === input.floorType) ?? floorTypes[0];
  const boxCoverage = input.boxCoverage > 0 ? input.boxCoverage : type.coverage;

  const pureBoxes = area / Math.max(boxCoverage, 0.01);
  const boxes = Math.ceil(pureBoxes * (1 + input.lossRate / 100));
  const baseboardLength = input.roomPerimeter;

  return {
    mainLabel: "발주 권장 박스 수",
    mainValue: `${boxes}`,
    mainUnit: "박스",
    subText: `순수 ${formatNumber(pureBoxes, 1)}박스 + 로스 ${input.lossRate}%`,
    cards: [
      { label: "시공 면적", value: `${formatNumber(area, 2)}㎡` },
      { label: "시공 평수", value: `${formatNumber(pyeong, 2)}평` },
      { label: "발주 평수", value: `${formatNumber((boxes * boxCoverage), 1)}㎡` },
      { label: "걸레받이", value: `${formatNumber(baseboardLength, 1)}m` },
    ],
    note:
      "마루는 동일 LOT 확보를 위해 박스 단위 발주가 필수입니다. 헤링본·사선 시공은 로스율을 10% 이상 권장하세요.",
    chips: ["실내공기질 방출확인 표지 확인", "박스당 시공 평수 확인", "걸레받이는 현장 둘레 기준"],
  };
};

export const paintCalc = (input: PaintInputs) => {
  const type = paintTypes.find((item) => item.name === input.paintType) ?? paintTypes[0];

  const floorArea = areaByMode(input.areaMode, input.pyeong, input.width, input.height);
  const ceilingHeight = Math.max(input.ceilingHeight, 0);

  let workArea = 0;

  if (input.target === "direct") {
    workArea = input.directArea;
  }

  if (input.target === "ceiling") {
    workArea = input.areaMode === "pyeong" ? floorArea : input.width * input.height;
  }

  if (input.target === "wall") {
    workArea =
      input.areaMode === "pyeong"
        ? floorArea * 1.1 * (ceilingHeight / 2.4)
        : (input.width + input.height) * 2 * ceilingHeight;
  }

  const paintArea = workArea * Math.max(input.coats, 1);
  const lossIncludedArea = paintArea * (1 + input.lossRate / 100);
  const liters = lossIncludedArea / Math.max(type.coverage, 1);

  const bigPails = Math.ceil(liters / 18);
  const fourLiterCans = Math.ceil(liters / 4);

  return {
    mainLabel: "발주 권장 말통",
    mainValue: `${bigPails}`,
    mainUnit: "통",
    subText: `18L 기준 · 필요 ${formatNumber(liters, 1)}L`,
    cards: [
      { label: "시공 면적", value: `${formatNumber(workArea, 1)}㎡` },
      { label: "도장 면적", value: `${formatNumber(paintArea, 1)}㎡` },
      { label: "순수 필요량", value: `${formatNumber(liters, 1)}L` },
      { label: "4L 캔 기준", value: `${fourLiterCans}캔` },
    ],
    note:
      "1말통은 18L 기준입니다. 거친면, 진한 색상 변경, 흡수율 높은 바탕면은 로스율을 15~20%로 올려 잡으세요.",
    chips: ["실내공기질 방출확인 표지 확인", "2회 도장 기준 확인", "도장 후 환기 계획"],
  };
};

export const woodCalc = (input: WoodInputs) => {
  if (input.mode === "molding") {
    const purePieces = input.moldingTotalLength / Math.max(input.moldingPieceLength, 0.01);
    const recommendPieces = Math.ceil(purePieces * (1 + input.lossRate / 100));
    const orderLength = recommendPieces * input.moldingPieceLength;

    return {
      mainLabel: "발주 권장 본수",
      mainValue: `${recommendPieces}`,
      mainUnit: "본",
      subText: `총 ${formatNumber(input.moldingTotalLength, 1)}m + 여유 ${input.lossRate}%`,
      cards: [
        { label: "발주 길이", value: `${formatNumber(orderLength, 1)}m` },
        { label: "자재 한 본", value: `${formatNumber(input.moldingPieceLength, 1)}m` },
        { label: "순수 본수", value: `${formatNumber(purePieces, 1)}본` },
        { label: "여유율", value: `${input.lossRate}%` },
      ],
      note:
        "몰딩·걸레받이는 코너와 이음이 많으면 10% 이상 여유를 권장합니다. 도장·필름 마감 여부도 함께 확인하세요.",
      chips: ["코너·이음 위치 확인", "문선·걸레받이 종류 구분", "도장·필름 마감 여부 확인"],
    };
  }

  if (input.mode === "partition") {
    const partitionArea = input.partitionWidth * input.partitionHeight;
    const verticalStudCount = Math.ceil((input.partitionWidth * 1000) / Math.max(input.studSpacing, 1)) + 1;
    const verticalLength = verticalStudCount * input.partitionHeight;
    const horizontalLength = input.partitionWidth * 2;
    const totalLength = verticalLength + horizontalLength;
    const purePieces = totalLength / Math.max(input.studPieceLength, 0.01);
    const recommendPieces = Math.ceil(purePieces * (1 + input.lossRate / 100));

    return {
      mainLabel: "발주 권장 본수",
      mainValue: `${recommendPieces}`,
      mainUnit: "본",
      subText: `가벽 ${formatNumber(input.partitionWidth, 1)}m × ${formatNumber(input.partitionHeight, 1)}m`,
      cards: [
        { label: "세로상/스터드", value: `${verticalStudCount}개` },
        { label: "가벽 면적", value: `${formatNumber(partitionArea, 1)}㎡` },
        { label: "발주 길이", value: `${formatNumber(recommendPieces * input.studPieceLength, 1)}m` },
        { label: "자재 한 본", value: `${formatNumber(input.studPieceLength, 1)}m` },
      ],
      note:
        "가벽틀은 문·창 개구부, 보강, 코너가 있으면 자재 수량이 증가합니다. 이 값은 발주 전 1차 정리용입니다.",
      chips: ["문·창 개구부 보강 확인", "석고보드 겹수 별도 산출", "방음·방수·방화 조건 확인"],
    };
  }

  const board = boardTypes.find((item) => item.name === input.boardType) ?? boardTypes[0];
  const workArea = areaByMode(input.areaMode, input.pyeong, input.width, input.height);
  const totalBoardArea = workArea * Math.max(input.boardLayers, 1);
  const pureSheets = totalBoardArea / Math.max(board.area, 0.01);
  const recommendSheets = Math.ceil(pureSheets * (1 + input.lossRate / 100));

  return {
    mainLabel: "발주 권장 장수",
    mainValue: `${recommendSheets}`,
    mainUnit: "장",
    subText: `${board.name} · ${input.boardLayers}겹 기준`,
    cards: [
      { label: "시공 면적", value: `${formatNumber(workArea, 1)}㎡` },
      { label: "보드 1장", value: `${formatNumber(board.area, 2)}㎡` },
      { label: "순수 장수", value: `${formatNumber(pureSheets, 1)}장` },
      { label: "여유율", value: `${input.lossRate}%` },
    ],
    note:
      "목공 물량은 보드 규격, 겹수, 개구부, 코너, 방수·방화 요구 조건에 따라 차이가 큽니다. 이 값은 발주 전 1차 정리용입니다.",
    chips: ["보드 규격과 겹수 확인", "개구부·절단 로스 반영", "방수·방화 보드 구분"],
  };
};

export const furnitureCalc = (input: FurnitureInputs) => {
  const totalLength = input.lowerLength + input.upperLength;
  const doors = Math.ceil((totalLength * 1000) / Math.max(input.doorWidth, 1));
  const countertopLength = input.includeCountertop ? input.lowerLength * (1 + input.lossRate / 100) : 0;
  const doorArea = (doors * input.doorWidth * input.doorHeight) / 1_000_000;

  return {
    mainLabel: "산출 기준 길이",
    mainValue: `${formatNumber(totalLength, 1)}`,
    mainUnit: "m",
    subText: `${input.furnitureType} · 본체 ${formatNumber(input.lowerLength, 1)}m + 상부 ${formatNumber(input.upperLength, 1)}m`,
    cards: [
      { label: "예상 도어", value: `${doors}개` },
      { label: "상판 길이", value: input.includeCountertop ? `${formatNumber(countertopLength, 1)}m` : "제외" },
      { label: "문짝 참고", value: `${formatNumber(doorArea, 1)}㎡` },
      { label: "깊이 기준", value: `${formatNumber(input.countertopWidth / 1000, 1)}m` },
    ],
    note:
      "제작가구는 업체별 산출 기준 차이가 큽니다. 최종 제작 전 실측·도면·철물 사양 확인이 필요합니다.",
    chips: ["최종 제작 전 실측 필수", "코너장·마감판 별도 확인", "상판 이음·타공 위치 확인"],
  };
};

export const lightingCalc = (input: LightingInputs) => {
  const preset = luxPresets.find((item) => item.name === input.spaceType) ?? luxPresets[0];

  const area = areaByMode(input.areaMode, input.pyeong, input.width, input.height);
  const heightFactor = input.ceilingHeight > 2.4 ? input.ceilingHeight / 2.4 : 1;
  const totalWatt = Math.ceil((area * preset.lux * heightFactor) / 90);

  const led7 = Math.ceil(totalWatt / 7);
  const led10 = Math.ceil(totalWatt / 10);

  return {
    mainLabel: "권장 총 와트수",
    mainValue: `${totalWatt}`,
    mainUnit: "W",
    subText: `${preset.lux} lux 기준 · LED 90 lm/W`,
    cards: [
      { label: "권장 조도", value: `${preset.lux} lux` },
      { label: "시공 면적", value: `${formatNumber(area, 2)}㎡` },
      { label: "LED 7W", value: `${led7}개` },
      { label: "LED 10W", value: `${led10}개` },
    ],
    note:
      "메인등과 다운라이트를 함께 쓰면 다운라이트 수량은 계산값의 50~70% 수준으로 조정하는 경우가 많습니다.",
    chips: ["작업면 기준 조도", "눈부심 생기면 위치 조정", "전등 노후·먼지 관리"],
  };
};

export const electricCalc = (input: ElectricInputs) => {
  const lights = Math.ceil(input.zones * input.lightPerZone);
  const outlets = Math.ceil(input.zones * input.outletPerZone);
  const switches = Math.ceil(input.zones * input.switchPerZone);

  const dedicatedCandidates = [
    input.airconCircuit,
    input.inductionCircuit,
    input.laundryCircuit,
    input.bathroomCircuit,
  ].filter(Boolean).length;

  const total = lights + outlets + switches + input.sparePoints + dedicatedCandidates;

  return {
    mainLabel: "예상 전기 포인트",
    mainValue: `${total}`,
    mainUnit: "개",
    subText: `${input.siteType} · ${input.zones}구역 기준`,
    cards: [
      { label: "조명 포인트", value: `${lights}개` },
      { label: "콘센트 포인트", value: `${outlets}개` },
      { label: "스위치 포인트", value: `${switches}개` },
      { label: "전용회로 후보", value: `${dedicatedCandidates}개` },
    ],
    note:
      "전기는 안전 기준과 현장 부하 조건 확인이 필수입니다. 이 계산은 포인트 수량과 전용회로 후보 체크용이며 전선 굵기·차단기 용량을 확정하지 않습니다.",
    chips: ["전선 굵기·차단기 용량 별도 설계", "접지·누전차단기 확인", "고부하 기기 전용회로 검토"],
  };
};

export const airconCalc = (input: AirconInputs) => {
  let recommendPyeong = input.coolingPyeong;

  if (input.useType === "commercial") recommendPyeong *= 1.15;
  if (input.airconType === "system") recommendPyeong *= 1.05;
  if (input.sunExposure.includes("강함") || input.sunExposure.includes("서향")) recommendPyeong *= 1.1;
  if (input.ceilingHeight > 2.4) recommendPyeong *= input.ceilingHeight / 2.4;
  if (input.openLivingKitchen) recommendPyeong *= 1.1;
  if (input.topFloorOrWeakInsulation) recommendPyeong *= 1.1;

  const roundedPyeong = Math.ceil(recommendPyeong);
  const kw = round1(roundedPyeong * 0.45);
  const indoorUnits = input.airconType === "system" ? Math.max(1, Math.ceil(roundedPyeong / 7)) : 1;

  return {
    mainLabel: "권장 냉방 평형",
    mainValue: `${roundedPyeong}`,
    mainUnit: "평형",
    subText: `실내기 ${indoorUnits}대 · ${formatNumber(kw, 1)}kW급`,
    cards: [
      { label: "실내기 수", value: `${indoorUnits}대` },
      { label: "냉방 능력", value: `${formatNumber(kw, 1)}kW` },
      { label: "냉방 면적", value: `${input.coolingPyeong}평` },
      { label: "보조 벽걸이", value: "0대" },
    ],
    note:
      "냉방 능력은 단열, 창호, 층수, 서향 여부에 따라 크게 달라집니다. 탑층이나 오픈형 거실은 한 단계 위 평형을 검토하세요.",
    chips: ["실외기 통풍 공간 확보", "필터 주기 세척", "권장 운전 26℃ 참고"],
  };
};