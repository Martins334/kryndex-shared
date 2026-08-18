import { useEffect, useRef, useState, useCallback } from "react";
import { useScrollLock } from "../../hooks/useScrollLock";
import { X, Check, AlertTriangle, Wifi, WifiOff, Volume2, Mic, Camera, Vibrate, GripHorizontal, Gauge } from "lucide-react";
import { SensorsTest } from "./SensorsTest";

export type TestKind =
  | "screen-colors" | "touch-grid" | "connectivity"
  | "camera-front" | "camera-back" | "speaker" | "mic" | "vibration" | "sensors" | "manual";

// Overlay full-viewport com o teste + rodapé Passou/Falhou.
export function TestOverlay({
  kind, label, onResult, onClose,
}: {
  kind: TestKind;
  label: string;
  onResult: (r: "ok" | "falha") => void;
  onClose: () => void;
}) {
  // Montado só quando o teste está aberto. Sem a trava, arrastar no teste de toque rola a
  // página do checklist por baixo.
  useScrollLock(true);
  const [touchPct, setTouchPct] = useState(0);

  // Cores e touch: tela cheia EDGE-TO-EDGE (sem barras) + balão flutuante arrastável,
  // deixando bordas e cantos livres para inspeção.
  if (kind === "screen-colors" || kind === "touch-grid") {
    return (
      <div className="fixed inset-0 z-[100] bg-black text-white">
        {kind === "screen-colors" ? <ScreenColors /> : <TouchGrid onProgress={setTouchPct} />}
        <FloatingControls
          hint={kind === "screen-colors"
            ? "Toque na tela para trocar a cor · confira cantos e bordas"
            : `${touchPct}% da tela coberta`}
          onResult={onResult}
          onClose={onClose}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black text-white">
      <div className="flex items-center justify-between px-4 py-3 bg-black/80">
        <span className="text-sm font-semibold">{label}</span>
        <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-1.5 hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex-1 overflow-hidden">
        {kind === "connectivity" && <Connectivity />}
        {(kind === "camera-front" || kind === "camera-back") && (
          <CameraView facing={kind === "camera-front" ? "user" : "environment"} />
        )}
        {kind === "speaker" && <SpeakerTest />}
        {kind === "mic" && <MicTest />}
        {kind === "vibration" && <VibrationTest />}
        {kind === "sensors" && <SensorsTest />}
      </div>
      <div className="grid grid-cols-2 gap-2 p-3 bg-black/80">
        <button type="button" onClick={() => onResult("falha")}
          className="flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 font-semibold active:bg-red-700">
          <AlertTriangle className="h-5 w-5" /> Falhou
        </button>
        <button type="button" onClick={() => onResult("ok")}
          className="flex items-center justify-center gap-2 rounded-xl bg-green-600 py-3 font-semibold active:bg-green-700">
          <Check className="h-5 w-5" /> Passou
        </button>
      </div>
    </div>
  );
}

// Balão flutuante e arrastável com Passou/Falhou/Fechar (para os testes em tela cheia).
function FloatingControls({
  hint, onResult, onClose,
}: {
  hint: string;
  onResult: (r: "ok" | "falha") => void;
  onClose: () => void;
}) {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const off = useRef<{ dx: number; dy: number } | null>(null);
  const onDown = (e: React.PointerEvent) => {
    const pill = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
    off.current = { dx: e.clientX - pill.left, dy: e.clientY - pill.top };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (!off.current) return;
    setPos({ x: e.clientX - off.current.dx, y: e.clientY - off.current.dy });
  };
  const onUp = () => { off.current = null; };
  const style: React.CSSProperties = pos
    ? { left: pos.x, top: pos.y }
    : { left: "50%", top: "50%", transform: "translate(-50%, -50%)" };

  return (
    <div className="pointer-events-auto absolute z-10 flex w-64 max-w-[86vw] flex-col gap-2 rounded-2xl border border-white/15 bg-black/70 p-2 backdrop-blur" style={style}>
      <div
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp}
        className="flex cursor-grab touch-none items-center justify-center gap-1 rounded-lg py-1 text-[10px] text-white/50 active:cursor-grabbing"
      >
        <GripHorizontal className="h-3.5 w-3.5" /> arraste para mover
      </div>
      <p className="px-1 text-center text-[11px] text-white/80">{hint}</p>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onResult("falha")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-sm font-semibold active:bg-red-700">
          <AlertTriangle className="h-4 w-4" /> Falhou
        </button>
        <button type="button" onClick={() => onResult("ok")}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-green-600 px-3 py-2.5 text-sm font-semibold active:bg-green-700">
          <Check className="h-4 w-4" /> Passou
        </button>
        <button type="button" onClick={onClose} aria-label="Fechar" className="rounded-full p-2 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// ── Tela & cores: toque cicla as cores sólidas ─────────────────────────────────
const COLORS = ["#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#7f7f7f"];
function ScreenColors() {
  const [i, setI] = useState(0);
  return (
    <button
      type="button"
      onClick={() => setI((v) => (v + 1) % COLORS.length)}
      className="absolute inset-0 h-full w-full"
      style={{ background: COLORS[i] }}
      aria-label="Trocar cor"
    />
  );
}

// ── Touch: varra a tela para acender as células ────────────────────────────────
function TouchGrid({ onProgress }: { onProgress?: (pct: number) => void }) {
  const COLS = 6, ROWS = 12;
  const total = COLS * ROWS;
  const [hit, setHit] = useState<Set<number>>(new Set());
  const mark = (e: React.PointerEvent) => {
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    const idx = el?.dataset?.cell;
    if (idx == null) return;
    setHit((s) => (s.has(+idx) ? s : new Set(s).add(+idx)));
  };
  useEffect(() => { onProgress?.(Math.round((hit.size / total) * 100)); }, [hit, total, onProgress]);
  return (
    <div
      className="absolute inset-0 grid touch-none gap-px bg-white/10"
      style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
      onPointerDown={mark}
      onPointerMove={(e) => { if (e.buttons || e.pointerType === "touch") mark(e); }}
    >
      {Array.from({ length: total }).map((_, n) => (
        <div key={n} data-cell={n} className={hit.has(n) ? "bg-green-500" : "bg-neutral-800"} />
      ))}
    </div>
  );
}

// ── Conectividade: online + tipo de conexão + ping ─────────────────────────────
function Connectivity() {
  const [online, setOnline] = useState(navigator.onLine);
  const [ping, setPing] = useState<number | null>(null);
  const [pinging, setPinging] = useState(false);
  const conn = (navigator as any).connection;

  useEffect(() => {
    const on = () => setOnline(true), off = () => setOnline(false);
    window.addEventListener("online", on); window.addEventListener("offline", off);
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off); };
  }, []);

  const [speed, setSpeed] = useState<number | null>(null);
  const [testing, setTesting] = useState(false);

  const doPing = useCallback(async () => {
    setPinging(true); setPing(null);
    const base = import.meta.env.VITE_API_URL as string | undefined;
    const t0 = performance.now();
    try {
      await fetch(`${base ?? ""}/public/plans`, { cache: "no-store" });
      setPing(Math.round(performance.now() - t0));
    } catch { setPing(-1); }
    finally { setPinging(false); }
  }, []);

  useEffect(() => { doPing(); }, [doPing]);

  // Speed test: baixa ~8 MB de um endpoint público (Cloudflare) e mede Mbps.
  const doSpeed = useCallback(async () => {
    setTesting(true); setSpeed(null);
    const bytes = 8_000_000;
    const t0 = performance.now();
    try {
      const res = await fetch(`https://speed.cloudflare.com/__down?bytes=${bytes}`, { cache: "no-store" });
      const buf = await res.arrayBuffer();
      const sec = (performance.now() - t0) / 1000;
      const mbps = (buf.byteLength * 8) / sec / 1_000_000;
      setSpeed(Math.round(mbps * 10) / 10);
    } catch { setSpeed(-1); }
    finally { setTesting(false); }
  }, []);

  const speedColor = speed == null || speed < 0 ? "text-white" : speed >= 50 ? "text-green-400" : speed >= 10 ? "text-yellow-400" : "text-red-400";
  const speedLabel = speed == null || speed < 0 ? null : speed >= 50 ? "Boa" : speed >= 10 ? "Média" : "Lenta";

  return (
    <div className="flex h-full flex-col items-center justify-start gap-4 overflow-y-auto p-6 text-center">
      <div className="flex flex-col items-center gap-1">
        {online ? <Wifi className="h-12 w-12 text-green-400" /> : <WifiOff className="h-12 w-12 text-red-400" />}
        <p className="text-lg font-semibold">{online ? "Online" : "Offline"}</p>
      </div>

      <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-center gap-1.5 text-xs text-white/60"><Gauge className="h-4 w-4" /> Velocidade de download</div>
        <p className={`mt-1 text-3xl font-bold ${speedColor}`}>
          {testing ? "medindo…" : speed == null ? "—" : speed < 0 ? "sem internet" : speed}
          {!testing && speed != null && speed > 0 && <span className="text-base font-normal text-white/60"> Mbps</span>}
        </p>
        {speedLabel && <p className={`text-xs ${speedColor}`}>{speedLabel}</p>}
        <button type="button" onClick={doSpeed} disabled={testing}
          className="mt-3 w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-60">
          {testing ? "Medindo…" : "Medir velocidade"}
        </button>
      </div>

      <div className="space-y-1 text-sm text-white/70">
        {conn?.effectiveType && <p>Tipo: <b className="text-white">{conn.effectiveType}</b></p>}
        {conn?.downlink != null && <p>Estimativa do sistema: <b className="text-white">{conn.downlink} Mbps</b></p>}
        <p>
          Ping: <b className="text-white">{pinging ? "…" : ping == null ? "—" : ping < 0 ? "sem resposta" : `${ping} ms`}</b>
          <button type="button" onClick={doPing} className="ml-2 text-primary underline">testar</button>
        </p>
      </div>
      <p className="max-w-xs text-xs text-white/50">Confirme também o SIM/sinal de operadora manualmente.</p>
    </div>
  );
}

// ── Câmera (frontal/traseira) ──────────────────────────────────────────────────
function CameraView({ facing }: { facing: "user" | "environment" }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("Não foi possível acessar a câmera.");
      return;
    }
    navigator.mediaDevices.getUserMedia({ video: { facingMode: facing }, audio: false })
      .then((s) => { stream = s; if (videoRef.current) { videoRef.current.srcObject = s; videoRef.current.play().catch(() => {}); } })
      .catch((e) => setErr(e?.name === "NotAllowedError" ? "Permissão da câmera negada." : "Não foi possível acessar a câmera."));
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [facing]);
  if (err) return <Centered><Camera className="h-12 w-12 text-white/40" /><p className="mt-3 text-sm text-white/70">{err}</p></Centered>;
  return <video ref={videoRef} playsInline muted className="h-full w-full object-contain bg-black" />;
}

// ── Alto-falante: tom de teste ─────────────────────────────────────────────────
function SpeakerTest() {
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const stop = useCallback(() => {
    oscRef.current?.stop(); oscRef.current?.disconnect(); oscRef.current = null;
    setPlaying(false);
  }, []);
  const toggle = () => {
    if (playing) { stop(); return; }
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = ctxRef.current ?? new Ctx();
    ctxRef.current = ctx;
    const osc = ctx.createOscillator(); const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = 440; gain.gain.value = 0.2;
    osc.connect(gain); gain.connect(ctx.destination); osc.start();
    oscRef.current = osc; setPlaying(true);
  };
  useEffect(() => () => { stop(); ctxRef.current?.close().catch(() => {}); }, [stop]);
  return (
    <Centered>
      <Volume2 className={`h-14 w-14 ${playing ? "text-green-400" : "text-white/50"}`} />
      <button type="button" onClick={toggle} className="mt-4 rounded-xl bg-white/10 px-6 py-3 font-semibold">
        {playing ? "Parar tom" : "Tocar tom de teste (440 Hz)"}
      </button>
      <p className="mt-3 max-w-xs text-xs text-white/50">Você deve ouvir um apito. Teste com e sem fone.</p>
    </Centered>
  );
}

// ── Microfone: nível captado ───────────────────────────────────────────────────
function MicTest() {
  const [level, setLevel] = useState(0);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let stream: MediaStream | null = null, ctx: AudioContext | null = null, raf = 0;
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    if (!navigator.mediaDevices?.getUserMedia) {
      setErr("Não foi possível acessar o microfone.");
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(async (s) => {
        stream = s; ctx = new Ctx();
        // O AudioContext costuma nascer "suspended" fora de um gesto — retoma para captar áudio.
        if (ctx.state === "suspended") { try { await ctx.resume(); } catch { /* ignore */ } }
        const src = ctx.createMediaStreamSource(s);
        const an = ctx.createAnalyser(); an.fftSize = 512; src.connect(an);
        const buf = new Uint8Array(an.frequencyBinCount);
        const loop = () => {
          an.getByteTimeDomainData(buf);
          let peak = 0; for (const v of buf) peak = Math.max(peak, Math.abs(v - 128));
          setLevel(Math.min(100, Math.round((peak / 128) * 100)));
          raf = requestAnimationFrame(loop);
        };
        loop();
      })
      .catch((e) => setErr(e?.name === "NotAllowedError" ? "Permissão do microfone negada." : "Não foi possível acessar o microfone."));
    return () => { cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); ctx?.close().catch(() => {}); };
  }, []);
  return (
    <Centered>
      <Mic className="h-14 w-14 text-white/50" />
      {err ? <p className="mt-3 text-sm text-white/70">{err}</p> : (
        <>
          <div className="mt-4 h-4 w-56 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-green-500 transition-[width] duration-75" style={{ width: `${level}%` }} />
          </div>
          <p className="mt-3 max-w-xs text-xs text-white/50">Fale perto do aparelho — a barra deve reagir.</p>
        </>
      )}
    </Centered>
  );
}

// ── Vibração ───────────────────────────────────────────────────────────────────
function VibrationTest() {
  const supported = typeof navigator.vibrate === "function";
  const [buzzed, setBuzzed] = useState(false);
  const buzz = () => {
    // Chamada direta e simples no gesto do toque (valor único é o mais compatível).
    try { navigator.vibrate?.(700); } catch { /* ignore */ }
    setBuzzed(true);
    window.setTimeout(() => setBuzzed(false), 1200);
  };

  if (!supported) {
    return (
      <Centered>
        <Vibrate className="h-14 w-14 text-white/40" />
        <p className="mt-3 max-w-xs text-sm text-white/80">Este aparelho não permite vibração pelo navegador.</p>
        <p className="mt-1 max-w-xs text-xs text-white/50">
          iPhone/Safari não expõem essa função na web — é limitação do próprio aparelho. Sinta a vibração manualmente (uma ligação/mensagem) e marque <b>OK</b> ou <b>Falha</b> abaixo.
        </p>
      </Centered>
    );
  }
  return (
    <Centered>
      <Vibrate className={`h-14 w-14 ${buzzed ? "animate-pulse text-green-400" : "text-white/50"}`} />
      <button type="button" onClick={buzz} className="mt-4 rounded-xl bg-white/10 px-8 py-4 text-lg font-semibold active:bg-white/20">
        Vibrar
      </button>
      <p className="mt-3 max-w-xs text-xs text-white/50">
        Toque em <b>Vibrar</b> — o aparelho deve vibrar. Se não vibrar, verifique se está em <b>silencioso</b>, <b>Não perturbe</b> ou <b>economia de bateria</b>. Em computador não há vibração.
      </p>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex h-full flex-col items-center justify-center p-6 text-center">{children}</div>;
}
