export function ceil(value: number) {
  return Math.ceil(value);
}

export function format(value: number, digit = 1) {
  return value.toLocaleString("ko-KR", {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  });
}

export function pyeongToM2(value: number) {
  return value * 3.3058;
}

export function wallpaperCalc({
  pyeong,
  height,
  ceiling,
  lossRate,
  coverage,
}: {
  pyeong: number;
  height: number;
  ceiling: boolean;
  lossRate: number;
  coverage: number;
}) {
  const floorArea = pyeongToM2(pyeong);

  const wallArea = floorArea * 1.1 * (height / 2.4);

  const totalArea = ceiling
    ? wallArea + floorArea
    : wallArea;

  const lossArea =
    totalArea * (1 + lossRate / 100);

  const rolls = ceil(lossArea / coverage);

  return {
    floorArea,
    wallArea,
    totalArea,
    lossArea,
    rolls,
  };
}

export function floorCalc({
  pyeong,
  boxArea,
  lossRate,
}: {
  pyeong: number;
  boxArea: number;
  lossRate: number;
}) {
  const area = pyeongToM2(pyeong);

  const orderPyeong =
    pyeong * (1 + lossRate / 100);

  const boxes = ceil(orderPyeong / boxArea);

  return {
    area,
    orderPyeong,
    boxes,
  };
}

export function paintCalc({
  pyeong,
  coats,
  coverage,
  lossRate,
}: {
  pyeong: number;
  coats: number;
  coverage: number;
  lossRate: number;
}) {
  const wallArea =
    pyeongToM2(pyeong) * 1.65;

  const paintArea =
    wallArea * coats;

  const lossArea =
    paintArea * (1 + lossRate / 100);

  const liters =
    lossArea / coverage;

  const cans = ceil(liters / 18);

  return {
    wallArea,
    paintArea,
    liters,
    cans,
  };
}

export function woodCalc({
  width,
  height,
  boardArea,
  layers,
  lossRate,
}: {
  width: number;
  height: number;
  boardArea: number;
  layers: number;
  lossRate: number;
}) {
  const area = width * height;

  const layerArea =
    area * layers;

  const boards =
    layerArea / boardArea;

  const orderBoards =
    ceil(boards * (1 + lossRate / 100));

  return {
    area,
    layerArea,
    boards,
    orderBoards,
  };
}

export function furnitureCalc({
  lower,
  upper,
  lossRate,
  doorWidth,
}: {
  lower: number;
  upper: number;
  lossRate: number;
  doorWidth: number;
}) {
  const total =
    lower + upper;

  const order =
    total * (1 + lossRate / 100);

  const doors =
    ceil(order / doorWidth);

  return {
    total,
    order,
    doors,
  };
}

export function lightingCalc({
  pyeong,
  lux,
}: {
  pyeong: number;
  lux: number;
}) {
  const area = pyeongToM2(pyeong);

  const lumen =
    area * lux;

  const watt =
    lumen / 90;

  const led7 =
    ceil(watt / 7);

  const led10 =
    ceil(watt / 10);

  return {
    area,
    lumen,
    watt,
    led7,
    led10,
  };
}

export function electricCalc({
  zones,
  lightPerZone,
  outletPerZone,
  switchPerZone,
  reserve,
  dedicated,
}: {
  zones: number;
  lightPerZone: number;
  outletPerZone: number;
  switchPerZone: number;
  reserve: number;
  dedicated: number;
}) {
  const lights =
    ceil(zones * lightPerZone);

  const outlets =
    ceil(zones * outletPerZone);

  const switches =
    ceil(zones * switchPerZone);

  const total =
    lights +
    outlets +
    switches +
    reserve +
    dedicated;

  return {
    lights,
    outlets,
    switches,
    total,
  };
}

export function airconCalc({
  pyeong,
  height,
  correction,
}: {
  pyeong: number;
  height: number;
  correction: number;
}) {
  const heightRate =
    height > 2.4
      ? height / 2.4
      : 1;

  const result =
    pyeong *
    heightRate *
    (1 + correction / 100);

  return {
    result,
  };
}