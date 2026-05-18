export function format(value: number, digit = 2) {
  return Number(value || 0).toLocaleString("ko-KR", {
    minimumFractionDigits: digit,
    maximumFractionDigits: digit,
  });
}

export function pyeongToMeter(pyeong: number) {
  return Number(pyeong || 0) * 3.3058;
}

function getArea(data: any) {
  if (data.areaMode === "pyeong") {
    return pyeongToMeter(Number(data.pyeong || 0));
  }

  return (Number(data.width || 0) * Number(data.height || 0)) / 1_000_000;
}

export function wallpaperCalc(data: any) {
  const floorArea = getArea(data);
  const wallArea = floorArea * 2.2 * (Number(data.ceilingHeight || 2400) / 2400);
  const totalArea = wallArea;
  const lossArea = totalArea * (1 + Number(data.waste || 0) / 100);
  const rolls = Math.ceil(lossArea / 16.5);

  return {
    floorArea,
    wallArea,
    totalArea,
    lossArea,
    rolls,
  };
}

export function floorCalc(data: any) {
  const area = getArea(data);
  const orderArea = area * (1 + Number(data.waste || 0) / 100);
  const orderPyeong = orderArea / 3.3058;
  const boxes = Math.ceil(orderPyeong / 0.7);

  return {
    area,
    orderArea,
    orderPyeong,
    boxes,
  };
}

export function paintCalc(data: any) {
  const baseArea = getArea(data);
  const wallArea = baseArea * 1.65;
  const coats = Number(data.coats || data.coat || 1);
  const paintArea = wallArea * coats;
  const lossArea = paintArea * (1 + Number(data.waste || 0) / 100);
  const liters = lossArea / 10;
  const cans = Math.ceil(liters / 18);

  return {
    wallArea,
    paintArea,
    liters,
    cans,
  };
}

export function woodCalc(data: any) {
  const area = getArea(data);
  const layers = Number(data.layers || data.layer || 1);
  const layerArea = area * layers;
  const boards = layerArea / 1.62;
  const orderBoards = Math.ceil(boards * (1 + Number(data.waste || 0) / 100));

  return {
    area,
    layerArea,
    boards,
    orderBoards,
  };
}

export function furnitureCalc(data: any) {
  const lower = Number(data.lower || data.lowerLength || 0);
  const upper = Number(data.upper || data.upperLength || 0);
  const doorWidth = Number(data.doorWidth || 450) / 1000;
  const total = lower + upper;
  const order = total * (1 + Number(data.lossRate || data.waste || 5) / 100);
  const doors = Math.ceil(order / doorWidth);

  return {
    total,
    order,
    doors,
  };
}

export function lightingCalc(data: any) {
  const area = pyeongToMeter(Number(data.pyeong || 0));
  const lux = Number(data.lux || 220);
  const lumen = area * lux;
  const watt = lumen / 90;
  const led7 = Math.ceil(watt / 7);
  const led10 = Math.ceil(watt / 10);

  return {
    area,
    lumen,
    watt,
    led7,
    led10,
  };
}

export function electricCalc(data: any) {
  const zones = Number(data.zones || data.rooms || 1);
  const lightPerZone = Number(data.lightPerZone || 1.4);
  const outletPerZone = Number(data.outletPerZone || 4);
  const switchPerZone = Number(data.switchPerZone || 1.2);
  const reserve = Number(data.reserve || 2);
  const dedicated = Number(data.dedicated || 1);

  const lights = Math.ceil(zones * lightPerZone);
  const outlets = Math.ceil(zones * outletPerZone);
  const switches = Math.ceil(zones * switchPerZone);
  const total = lights + outlets + switches + reserve + dedicated;

  return {
    lights,
    outlets,
    switches,
    total,
  };
}

export function airconCalc(data: any) {
  const pyeong = Number(data.pyeong || 0);
  const height = Number(data.height || 2.4);
  const correction = Number(data.correction || 0);

  const heightRate = height > 2.4 ? height / 2.4 : 1;
  const result = pyeong * heightRate * (1 + correction / 100);

  return {
    area: pyeongToMeter(pyeong),
    pyeong,
    result,
  };
}