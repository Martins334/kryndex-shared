import { useEffect, useRef, useState } from "react";
import { Radar, Smartphone } from "lucide-react";
import type { PluginListenerHandle } from "@capacitor/core";
import {
  isNativeSensors, SensorsNative, sensorMeta, requestWebMotionPermission, subscribeWeb, webNeedsPermission,
  type NativeSensor, type WebReading,
} from "./sensors";

const fmt = (v: number) => (Number.isFinite(v) ? v.toFixed(2) : "—");

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center text-white/70">{children}</div>;
}

// Painel de sensores dentro do TestOverlay (o rodapé Passou/Falhou vem do overlay).
export function SensorsTest() {
  return isNativeSensors() ? <NativeSensors /> : <WebSensors />;
}

// ── Nativo (app Capacitor): lista TODOS os sensores do aparelho ────────────────
function NativeSensors() {
  const [sensors, setSensors] = useState<NativeSensor[]>([]);
  const [readings, setReadings] = useState<Record<number, number[]>>({});
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let handle: PluginListenerHandle | null = null;
    const started: number[] = [];
    let alive = true;
    (async () => {
      try {
        const { sensors } = await SensorsNative.listSensors();
        if (!alive) return;
        setSensors(sensors);
        handle = await SensorsNative.addListener("reading", (r) =>
          setReadings((prev) => ({ ...prev, [r.type]: r.values })));
        for (const s of sensors) {
          try { await SensorsNative.start({ type: s.type }); started.push(s.type); } catch { /* trigger/one-shot */ }
        }
      } catch { setErr("Não foi possível ler os sensores neste aparelho."); }
    })();
    return () => {
      alive = false;
      handle?.remove().catch(() => {});
      started.forEach((t) => SensorsNative.stop({ type: t }).catch(() => {}));
    };
  }, []);

  if (err) return <Centered><Radar className="h-10 w-10 text-white/40" />{err}</Centered>;
  return (
    <div className="h-full space-y-2 overflow-y-auto p-3">
      <p className="text-center text-xs text-white/60">
        {sensors.length} sensores detectados · mova, incline e aproxime a mão do aparelho para ver os valores reagirem.
      </p>
      {sensors.map((s) => {
        const meta = sensorMeta(s.type, s.name);
        const vals = readings[s.type];
        return (
          <div key={`${s.type}-${s.name}`} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold">{meta.label}</span>
              <span className="truncate text-[10px] text-white/40">{s.name}</span>
            </div>
            <p className="mt-1 font-mono text-sm text-green-400">
              {vals ? vals.map(fmt).join("   ") : "—"} <span className="text-white/40">{meta.unit}</span>
            </p>
          </div>
        );
      })}
    </div>
  );
}

// ── Web (navegador): subconjunto + convite pro app ─────────────────────────────
function WebSensors() {
  const [readings, setReadings] = useState<Record<string, WebReading>>({});
  const [needsPerm, setNeedsPerm] = useState(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  const start = async () => {
    const ok = await requestWebMotionPermission();
    if (!ok) { setNeedsPerm(true); return; }
    setNeedsPerm(false);
    cleanupRef.current = subscribeWeb((r) => setReadings((p) => ({ ...p, [r.key]: r })));
  };

  useEffect(() => {
    if (webNeedsPermission()) setNeedsPerm(true); // iOS: exige gesto
    else void start();
    return () => cleanupRef.current?.();
  }, []);

  const list = Object.values(readings);
  return (
    <div className="h-full space-y-3 overflow-y-auto p-4">
      <div className="rounded-xl border border-primary/30 bg-primary/10 p-3 text-center text-xs text-white/80">
        <Smartphone className="mx-auto mb-1 h-5 w-5 text-primary" />
        No navegador dá para ler só alguns sensores. Para testar <b>todos</b> (proximidade, luz, barômetro, magnetômetro…),
        use o app <b>Kryndex Diagnóstico</b>.
      </div>
      {needsPerm && (
        <button type="button" onClick={() => void start()}
          className="w-full rounded-xl bg-primary py-3 font-semibold text-primary-foreground">
          Permitir acesso aos sensores
        </button>
      )}
      {list.length === 0 && !needsPerm && <p className="text-center text-xs text-white/50">Mova o aparelho…</p>}
      {list.map((r) => (
        <div key={r.key} className="rounded-xl border border-white/10 bg-white/5 p-3">
          <span className="text-sm font-semibold">{r.label}</span>
          <p className="mt-1 font-mono text-sm text-green-400">{r.values.map(fmt).join("   ")} <span className="text-white/40">{r.unit}</span></p>
        </div>
      ))}
    </div>
  );
}
