import { Capacitor, registerPlugin, type PluginListenerHandle } from "@capacitor/core";

// ── Ponte com o plugin nativo (só existe dentro do app Capacitor) ──────────────
export type NativeSensor = {
  type: number; name: string; vendor?: string; version?: number;
  power?: number; resolution?: number; maxRange?: number; isWakeUp?: boolean;
};
type SensorsPlugin = {
  listSensors(): Promise<{ sensors: NativeSensor[] }>;
  start(o: { type: number }): Promise<void>;
  stop(o: { type: number }): Promise<void>;
  addListener(
    event: "reading",
    cb: (r: { type: number; values: number[]; accuracy: number }) => void,
  ): Promise<PluginListenerHandle>;
};
export const SensorsNative = registerPlugin<SensorsPlugin>("Sensors");

export function isNativeSensors(): boolean {
  try { return typeof window !== "undefined" && Capacitor.isNativePlatform(); } catch { return false; }
}

// Android Sensor.TYPE_* → rótulo pt-BR + unidade.
const SENSOR_META: Record<number, { label: string; unit: string }> = {
  1: { label: "Acelerômetro", unit: "m/s²" },
  2: { label: "Campo magnético", unit: "µT" },
  4: { label: "Giroscópio", unit: "rad/s" },
  5: { label: "Luz ambiente", unit: "lx" },
  6: { label: "Pressão (barômetro)", unit: "hPa" },
  8: { label: "Proximidade", unit: "cm" },
  9: { label: "Gravidade", unit: "m/s²" },
  10: { label: "Aceleração linear", unit: "m/s²" },
  11: { label: "Vetor de rotação", unit: "" },
  12: { label: "Umidade relativa", unit: "%" },
  13: { label: "Temperatura ambiente", unit: "°C" },
  14: { label: "Campo magnético (não calib.)", unit: "µT" },
  15: { label: "Rotação de jogo", unit: "" },
  16: { label: "Giroscópio (não calib.)", unit: "rad/s" },
  17: { label: "Movimento significativo", unit: "" },
  18: { label: "Detector de passos", unit: "" },
  19: { label: "Contador de passos", unit: "passos" },
  20: { label: "Rotação geomagnética", unit: "" },
  21: { label: "Batimento cardíaco", unit: "bpm" },
  35: { label: "Ângulo de dobra", unit: "°" },
};
export const sensorMeta = (type: number, fallbackName: string) =>
  SENSOR_META[type] ?? { label: fallbackName || `Sensor ${type}`, unit: "" };

// ── Fallback web (navegador) ───────────────────────────────────────────────────
export type WebReading = { key: string; label: string; unit: string; values: number[] };

// iOS Safari 13+ exige permissão via gesto; Android/desktop é no-op.
export async function requestWebMotionPermission(): Promise<boolean> {
  const dme = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
  if (dme && typeof dme.requestPermission === "function") {
    try { return (await dme.requestPermission()) === "granted"; } catch { return false; }
  }
  return true;
}
export function webNeedsPermission(): boolean {
  const dme = (window as unknown as { DeviceMotionEvent?: { requestPermission?: () => Promise<string> } }).DeviceMotionEvent;
  return !!(dme && typeof dme.requestPermission === "function");
}

// Assina os sensores expostos ao navegador; devolve cleanup.
export function subscribeWeb(onReading: (r: WebReading) => void): () => void {
  const cleanups: Array<() => void> = [];
  const w = window as unknown as Record<string, unknown>;

  const onMotion = (e: DeviceMotionEvent) => {
    const a = e.accelerationIncludingGravity;
    if (a) onReading({ key: "accel", label: "Acelerômetro", unit: "m/s²", values: [a.x ?? 0, a.y ?? 0, a.z ?? 0] });
    const r = e.rotationRate;
    if (r) onReading({ key: "gyro", label: "Giroscópio", unit: "°/s", values: [r.alpha ?? 0, r.beta ?? 0, r.gamma ?? 0] });
  };
  window.addEventListener("devicemotion", onMotion);
  cleanups.push(() => window.removeEventListener("devicemotion", onMotion));

  const onOri = (e: DeviceOrientationEvent) =>
    onReading({ key: "orient", label: "Orientação / bússola", unit: "°", values: [e.alpha ?? 0, e.beta ?? 0, e.gamma ?? 0] });
  window.addEventListener("deviceorientation", onOri);
  cleanups.push(() => window.removeEventListener("deviceorientation", onOri));

  // Generic Sensor API (Chrome/Android), quando disponível/permitido.
  try {
    const ALS = w.AmbientLightSensor as (new (o: { frequency: number }) => { illuminance?: number; addEventListener: (e: string, cb: () => void) => void; start: () => void; stop: () => void }) | undefined;
    if (ALS) { const s = new ALS({ frequency: 4 }); s.addEventListener("reading", () => onReading({ key: "light", label: "Luz ambiente", unit: "lx", values: [s.illuminance ?? 0] })); s.start(); cleanups.push(() => s.stop()); }
  } catch { /* sem permissão/flag */ }
  try {
    const Mag = w.Magnetometer as (new (o: { frequency: number }) => { x?: number; y?: number; z?: number; addEventListener: (e: string, cb: () => void) => void; start: () => void; stop: () => void }) | undefined;
    if (Mag) { const s = new Mag({ frequency: 8 }); s.addEventListener("reading", () => onReading({ key: "mag", label: "Magnetômetro", unit: "µT", values: [s.x ?? 0, s.y ?? 0, s.z ?? 0] })); s.start(); cleanups.push(() => s.stop()); }
  } catch { /* idem */ }

  return () => cleanups.forEach((c) => { try { c(); } catch { /* ignore */ } });
}
