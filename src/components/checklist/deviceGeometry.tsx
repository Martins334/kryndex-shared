import type { DeviceType } from "../../data/serviceOrders";

// Geometria do mapa de avarias por tipo de aparelho — fonte única usada tanto pela
// edição (DamageMap) quanto pela visualização (ChecklistView), para vistas e desenho baterem.

// `box` = tamanho no editor (DamageMap); `boxSm` = versão compacta na visualização (ChecklistView).
export type DamageView = { id: string; label: string; box: string; boxSm: string };

const PHONE_VIEWS: DamageView[] = [
  { id: "frente", label: "Frente", box: "w-[172px] aspect-[1/2]", boxSm: "w-20 aspect-[1/2]" },
  { id: "verso", label: "Verso", box: "w-[172px] aspect-[1/2]", boxSm: "w-20 aspect-[1/2]" },
  { id: "esquerda", label: "Lateral esq.", box: "w-[54px] aspect-[1/7]", boxSm: "w-6 aspect-[1/7]" },
  { id: "direita", label: "Lateral dir.", box: "w-[54px] aspect-[1/7]", boxSm: "w-6 aspect-[1/7]" },
  { id: "topo", label: "Topo", box: "w-full max-w-[320px] aspect-[7/1]", boxSm: "w-40 aspect-[7/1]" },
  { id: "base", label: "Base", box: "w-full max-w-[320px] aspect-[7/1]", boxSm: "w-40 aspect-[7/1]" },
];

const NOTEBOOK_VIEWS: DamageView[] = [
  { id: "aberto", label: "Aberto", box: "w-[230px] aspect-[7/6]", boxSm: "w-32 aspect-[7/6]" },
  { id: "tampa", label: "Tampa", box: "w-[220px] aspect-[16/11]", boxSm: "w-28 aspect-[16/11]" },
  { id: "esquerda", label: "Lateral esq.", box: "w-full max-w-[300px] aspect-[10/1]", boxSm: "w-40 aspect-[10/1]" },
  { id: "direita", label: "Lateral dir.", box: "w-full max-w-[300px] aspect-[10/1]", boxSm: "w-40 aspect-[10/1]" },
  { id: "fundo", label: "Fundo", box: "w-[220px] aspect-[16/10]", boxSm: "w-28 aspect-[16/10]" },
];

const DESKTOP_VIEWS: DamageView[] = [
  { id: "frente", label: "Frente", box: "w-[120px] aspect-[2/3]", boxSm: "w-14 aspect-[2/3]" },
  { id: "traseira", label: "Traseira", box: "w-[120px] aspect-[2/3]", boxSm: "w-14 aspect-[2/3]" },
  { id: "esquerda", label: "Lateral esq.", box: "w-[150px] aspect-[3/2]", boxSm: "w-24 aspect-[3/2]" },
  { id: "direita", label: "Lateral dir.", box: "w-[150px] aspect-[3/2]", boxSm: "w-24 aspect-[3/2]" },
  { id: "topo", label: "Topo", box: "w-[150px] aspect-[3/2]", boxSm: "w-24 aspect-[3/2]" },
];

const OUTRO_VIEWS: DamageView[] = [
  { id: "frente", label: "Frente", box: "w-[160px] aspect-[3/4]", boxSm: "w-20 aspect-[3/4]" },
  { id: "verso", label: "Verso", box: "w-[160px] aspect-[3/4]", boxSm: "w-20 aspect-[3/4]" },
  { id: "esquerda", label: "Lateral esq.", box: "w-[54px] aspect-[1/5]", boxSm: "w-6 aspect-[1/5]" },
  { id: "direita", label: "Lateral dir.", box: "w-[54px] aspect-[1/5]", boxSm: "w-6 aspect-[1/5]" },
  { id: "topo", label: "Topo", box: "w-full max-w-[300px] aspect-[6/1]", boxSm: "w-40 aspect-[6/1]" },
  { id: "base", label: "Base", box: "w-full max-w-[300px] aspect-[6/1]", boxSm: "w-40 aspect-[6/1]" },
];

export const DAMAGE_VIEWS_BY_TYPE: Record<DeviceType, DamageView[]> = {
  celular: PHONE_VIEWS,
  tablet: PHONE_VIEWS,
  notebook: NOTEBOOK_VIEWS,
  desktop: DESKTOP_VIEWS,
  outro: OUTRO_VIEWS,
};

export function damageViewsFor(t?: string | null): DamageView[] {
  return DAMAGE_VIEWS_BY_TYPE[(t as DeviceType) ?? "celular"] ?? PHONE_VIEWS;
}

// Rótulo da vista para o tipo; fallback = id cru (retrocompat com avarias antigas de outro tipo).
export function damageViewLabelFor(t: string | null | undefined, viewId: string): string {
  return damageViewsFor(t).find((x) => x.id === viewId)?.label ?? viewId;
}

// Classes de tamanho (largura + aspecto) da vista; `compact` = versão menor (visualização).
// Fallback para o formato de celular.
export function damageBoxFor(t: string | null | undefined, viewId: string, compact = false): string {
  const v = damageViewsFor(t).find((x) => x.id === viewId);
  if (!v) return compact ? "w-20 aspect-[1/2]" : "w-[172px] aspect-[1/2]";
  return compact ? v.boxSm : v.box;
}

// ── Desenho (SVG) ────────────────────────────────────────────────────────────────
const BG = "hsl(var(--background))";
const SCREEN = "hsl(var(--muted))";
const CLS = "pointer-events-none absolute inset-0 h-full w-full text-foreground/45";

function Phone({ viewId }: { viewId: string }) {
  if (viewId === "esquerda" || viewId === "direita") {
    const right = viewId === "direita";
    return (
      <svg viewBox="0 0 22 150" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="4" y="3" width="14" height="144" rx="6" fill={BG} stroke="currentColor" strokeWidth="2" />
        {right ? (
          <rect x="15" y="34" width="4" height="20" rx="2" fill="currentColor" opacity="0.6" />
        ) : (
          <>
            <rect x="3" y="36" width="4" height="14" rx="2" fill="currentColor" opacity="0.6" />
            <rect x="3" y="54" width="4" height="14" rx="2" fill="currentColor" opacity="0.6" />
          </>
        )}
      </svg>
    );
  }
  if (viewId === "topo" || viewId === "base") {
    const base = viewId === "base";
    return (
      <svg viewBox="0 0 200 30" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="3" y="4" width="194" height="22" rx="10" fill={BG} stroke="currentColor" strokeWidth="2" />
        {base ? (
          <>
            <rect x="92" y="12" width="16" height="6" rx="3" fill="currentColor" opacity="0.6" />
            {[60, 70, 80, 120, 130, 140].map((cx) => <circle key={cx} cx={cx} cy="15" r="1.4" fill="currentColor" opacity="0.5" />)}
          </>
        ) : (
          <circle cx="100" cy="15" r="1.8" fill="currentColor" opacity="0.5" />
        )}
      </svg>
    );
  }
  const back = viewId === "verso";
  return (
    <svg viewBox="0 0 100 200" preserveAspectRatio="xMidYMid meet" className={CLS}>
      <rect x="3" y="3" width="94" height="194" rx="18" fill={BG} stroke="currentColor" strokeWidth="2.5" />
      {!back ? (
        <>
          <rect x="9" y="11" width="82" height="178" rx="11" fill={SCREEN} stroke="currentColor" strokeWidth="0.8" />
          <rect x="38" y="6" width="24" height="6" rx="3" fill="currentColor" opacity="0.55" />
          <rect x="35" y="182" width="30" height="3" rx="1.5" fill="currentColor" opacity="0.4" />
        </>
      ) : (
        <>
          <rect x="11" y="11" width="32" height="32" rx="8" fill={SCREEN} stroke="currentColor" strokeWidth="1.3" />
          <circle cx="20" cy="20" r="4.2" fill={BG} stroke="currentColor" strokeWidth="1.1" />
          <circle cx="33" cy="20" r="4.2" fill={BG} stroke="currentColor" strokeWidth="1.1" />
          <circle cx="20" cy="33" r="4.2" fill={BG} stroke="currentColor" strokeWidth="1.1" />
          <circle cx="33" cy="33" r="2.2" fill="currentColor" opacity="0.5" />
          <circle cx="50" cy="108" r="8" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
        </>
      )}
    </svg>
  );
}

function Notebook({ viewId }: { viewId: string }) {
  if (viewId === "esquerda" || viewId === "direita") {
    const right = viewId === "direita";
    return (
      <svg viewBox="0 0 300 30" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="3" y="8" width="294" height="14" rx="4" fill={BG} stroke="currentColor" strokeWidth="2" />
        {right ? (
          <>
            <rect x="60" y="12" width="18" height="6" rx="1.5" fill="currentColor" opacity="0.55" />
            <rect x="90" y="12" width="18" height="6" rx="1.5" fill="currentColor" opacity="0.55" />
            <circle cx="140" cy="15" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
          </>
        ) : (
          <>
            <rect x="40" y="11" width="10" height="8" rx="1.5" fill="currentColor" opacity="0.55" />
            <rect x="70" y="12" width="18" height="6" rx="1.5" fill="currentColor" opacity="0.55" />
            <rect x="100" y="12" width="22" height="6" rx="1.5" fill="currentColor" opacity="0.55" />
            <rect x="200" y="12" width="16" height="6" rx="1.5" fill="currentColor" opacity="0.55" />
          </>
        )}
      </svg>
    );
  }
  if (viewId === "tampa") {
    return (
      <svg viewBox="0 0 160 110" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="6" y="6" width="148" height="98" rx="9" fill={BG} stroke="currentColor" strokeWidth="2.5" />
        <circle cx="80" cy="55" r="10" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      </svg>
    );
  }
  if (viewId === "fundo") {
    return (
      <svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="5" y="5" width="150" height="90" rx="8" fill={BG} stroke="currentColor" strokeWidth="2.5" />
        <rect x="30" y="20" width="100" height="26" rx="3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {[40, 55, 70, 85, 100, 115].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="44" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />)}
        {[[20, 84], [140, 84], [20, 16], [140, 16]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r="3" fill="currentColor" opacity="0.4" />)}
      </svg>
    );
  }
  // aberto (padrão) — clamshell aberto: tela em cima + deck/teclado em perspectiva embaixo.
  return (
    <svg viewBox="0 0 200 172" preserveAspectRatio="xMidYMid meet" className={CLS}>
      {/* Tela */}
      <rect x="34" y="6" width="132" height="92" rx="6" fill={BG} stroke="currentColor" strokeWidth="2.5" />
      <rect x="40" y="12" width="120" height="80" rx="3" fill={SCREEN} stroke="currentColor" strokeWidth="0.8" />
      <circle cx="100" cy="9.5" r="1.6" fill="currentColor" opacity="0.6" />
      {/* Dobradiça */}
      <line x1="34" y1="100" x2="166" y2="100" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      {/* Deck / base (trapézio em perspectiva) */}
      <path d="M36 104 H164 L184 160 H16 Z" fill={BG} stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
      {/* Teclado */}
      <path d="M50 110 H150 L162 140 H38 Z" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
      {[117, 124, 131, 138].map((y) => <line key={y} x1="44" y1={y} x2="156" y2={y} stroke="currentColor" strokeWidth="0.7" opacity="0.3" />)}
      {/* Touchpad */}
      <rect x="86" y="146" width="28" height="10" rx="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function Desktop({ viewId }: { viewId: string }) {
  if (viewId === "frente" || viewId === "traseira") {
    const back = viewId === "traseira";
    return (
      <svg viewBox="0 0 80 120" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="6" y="4" width="68" height="112" rx="6" fill={BG} stroke="currentColor" strokeWidth="2.5" />
        {back ? (
          <>
            <rect x="14" y="12" width="52" height="20" rx="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
            <rect x="14" y="38" width="52" height="26" rx="2" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.55" />
            {[72, 82, 92, 102].map((y) => <line key={y} x1="16" y1={y} x2="64" y2={y} stroke="currentColor" strokeWidth="1" opacity="0.4" />)}
          </>
        ) : (
          <>
            <circle cx="40" cy="16" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.3" opacity="0.6" />
            <rect x="18" y="30" width="44" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
            <rect x="18" y="44" width="44" height="8" rx="1.5" fill="none" stroke="currentColor" strokeWidth="0.9" opacity="0.5" />
            {[26, 34].map((cx) => <circle key={cx} cx={cx} cy="66" r="1.6" fill="currentColor" opacity="0.5" />)}
            <rect x="46" y="63" width="8" height="6" rx="1" fill="currentColor" opacity="0.45" />
          </>
        )}
      </svg>
    );
  }
  if (viewId === "topo") {
    return (
      <svg viewBox="0 0 150 100" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="5" y="6" width="140" height="88" rx="7" fill={BG} stroke="currentColor" strokeWidth="2.5" />
        <rect x="30" y="20" width="90" height="46" rx="3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
        {[40, 52, 64, 76, 88, 100].map((x) => <line key={x} x1={x} y1="22" x2={x} y2="64" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />)}
        <circle cx="120" cy="80" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.6" />
      </svg>
    );
  }
  // esquerda / direita (painel lateral)
  const mesh = viewId === "direita";
  return (
    <svg viewBox="0 0 150 100" preserveAspectRatio="xMidYMid meet" className={CLS}>
      <rect x="5" y="5" width="140" height="90" rx="6" fill={BG} stroke="currentColor" strokeWidth="2.5" />
      {mesh ? (
        <>
          <rect x="20" y="18" width="110" height="64" rx="3" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.45" />
          {[30, 42, 54, 66, 78].map((y) => <line key={y} x1="24" y1={y} x2="126" y2={y} stroke="currentColor" strokeWidth="0.7" opacity="0.35" />)}
        </>
      ) : (
        <rect x="18" y="16" width="114" height="68" rx="4" fill={SCREEN} stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
      )}
    </svg>
  );
}

function Generic({ viewId }: { viewId: string }) {
  if (viewId === "esquerda" || viewId === "direita") {
    return (
      <svg viewBox="0 0 22 110" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="4" y="3" width="14" height="104" rx="5" fill={BG} stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  if (viewId === "topo" || viewId === "base") {
    return (
      <svg viewBox="0 0 200 30" preserveAspectRatio="xMidYMid meet" className={CLS}>
        <rect x="3" y="5" width="194" height="20" rx="8" fill={BG} stroke="currentColor" strokeWidth="2" />
      </svg>
    );
  }
  // frente / verso
  return (
    <svg viewBox="0 0 120 160" preserveAspectRatio="xMidYMid meet" className={CLS}>
      <rect x="6" y="6" width="108" height="148" rx="12" fill={BG} stroke="currentColor" strokeWidth="2.5" />
      <rect x="18" y="18" width="84" height="124" rx="7" fill={SCREEN} stroke="currentColor" strokeWidth="0.7" opacity="0.5" />
    </svg>
  );
}

// Desenho do aparelho por (tipo, vista). Fica atrás dos pinos e não captura toques.
export function DeviceGraphic({ deviceType, viewId }: { deviceType?: string | null; viewId: string }) {
  switch ((deviceType as DeviceType) ?? "celular") {
    case "notebook": return <Notebook viewId={viewId} />;
    case "desktop": return <Desktop viewId={viewId} />;
    case "outro": return <Generic viewId={viewId} />;
    case "tablet":
    case "celular":
    default: return <Phone viewId={viewId} />;
  }
}
