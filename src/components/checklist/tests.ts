import type { TestKind } from "./Interactive";
import type { DeviceType } from "../../data/serviceOrders";

export type TestDef = { key: string; label: string; desc?: string; kind: TestKind };
export type TestSection = { id: string; title: string; items: TestDef[] };

// Grupos escolhidos: Tela & toque, Conectividade, Câmeras & áudio, Botões & sensores.
export const CHECKLIST_SECTIONS: TestSection[] = [
  {
    id: "tela",
    title: "Tela & toque",
    items: [
      { key: "tela_cores", label: "Tela e cores", desc: "Cores sólidas em tela cheia — procure pixels mortos e manchas.", kind: "screen-colors" },
      { key: "touch", label: "Touch", desc: "Varra a tela toda para conferir a resposta do toque.", kind: "touch-grid" },
    ],
  },
  {
    id: "conect",
    title: "Conectividade",
    items: [
      { key: "rede", label: "Rede / sinal", desc: "Wi-Fi/dados, online e ping à internet.", kind: "connectivity" },
    ],
  },
  {
    id: "camaudio",
    title: "Câmeras & áudio",
    items: [
      { key: "cam_front", label: "Câmera frontal", desc: "Prévia da câmera frontal.", kind: "camera-front" },
      { key: "cam_back", label: "Câmera traseira", desc: "Prévia da câmera traseira.", kind: "camera-back" },
      { key: "alto_falante", label: "Alto-falante", desc: "Toca um tom de teste.", kind: "speaker" },
      { key: "microfone", label: "Microfone", desc: "Fale e veja o nível captado.", kind: "mic" },
    ],
  },
  {
    id: "botoes",
    title: "Botões & sensores",
    items: [
      { key: "sensores", label: "Sensores", desc: "Acelerômetro, giroscópio, proximidade, luz e mais — valores ao vivo (todos no app).", kind: "sensors" },
      { key: "vibracao", label: "Vibração", desc: "Aciona a vibração do aparelho.", kind: "vibration" },
      { key: "botoes", label: "Botões (power / volume)", desc: "Confirme manualmente.", kind: "manual" },
      { key: "biometria", label: "Biometria (digital / face)", desc: "Confirme manualmente.", kind: "manual" },
      { key: "carga", label: "Carregamento", desc: "Confirme manualmente.", kind: "manual" },
    ],
  },
];

export const ALL_TEST_DEFS: TestDef[] = CHECKLIST_SECTIONS.flatMap((s) => s.items);

// Testes interativos por tipo de aparelho. celular/tablet usam a lista acima (touch/câmeras/sensores).
// notebook/desktop usam os testes que rodam no navegador do próprio aparelho (tela, áudio, mic, webcam,
// rede) + itens manuais (teclado, portas, bateria, etc.). `outro` = verificação toda manual.
const NOTEBOOK_SECTIONS: TestSection[] = [
  { id: "tela", title: "Tela & vídeo", items: [
    { key: "tela_cores", label: "Tela e imagem", desc: "Cores sólidas em tela cheia — procure pixels mortos, manchas e falhas.", kind: "screen-colors" },
  ] },
  { id: "entrada", title: "Teclado & entrada", items: [
    { key: "teclado", label: "Teclado", desc: "Teste todas as teclas.", kind: "manual" },
    { key: "touchpad", label: "Touchpad", desc: "Movimento, cliques e gestos.", kind: "manual" },
  ] },
  { id: "audiocam", title: "Áudio & câmera", items: [
    { key: "alto_falante", label: "Alto-falante", desc: "Toca um tom de teste.", kind: "speaker" },
    { key: "microfone", label: "Microfone", desc: "Fale e veja o nível captado.", kind: "mic" },
    { key: "webcam", label: "Webcam", desc: "Prévia da webcam.", kind: "camera-front" },
  ] },
  { id: "conect", title: "Conectividade", items: [
    { key: "rede", label: "Wi-Fi / rede", desc: "Wi-Fi/rede, online e ping à internet.", kind: "connectivity" },
    { key: "portas", label: "Portas (USB / HDMI)", desc: "Confirme manualmente.", kind: "manual" },
  ] },
  { id: "energia", title: "Energia & físico", items: [
    { key: "bateria", label: "Bateria", desc: "Confirme manualmente.", kind: "manual" },
    { key: "carregador", label: "Carregador / fonte", desc: "Confirme manualmente.", kind: "manual" },
    { key: "dobradica", label: "Dobradiça / carcaça", desc: "Confirme manualmente.", kind: "manual" },
    { key: "aquecimento", label: "Aquecimento / ventoinha", desc: "Confirme manualmente.", kind: "manual" },
    { key: "armazenamento", label: "Armazenamento (HD / SSD)", desc: "Confirme manualmente.", kind: "manual" },
  ] },
];

const DESKTOP_SECTIONS: TestSection[] = [
  { id: "video", title: "Vídeo", items: [
    { key: "video", label: "Saída de vídeo", desc: "Cores sólidas em tela cheia — procure falhas na imagem.", kind: "screen-colors" },
  ] },
  { id: "audio", title: "Áudio", items: [
    { key: "alto_falante", label: "Áudio", desc: "Toca um tom de teste.", kind: "speaker" },
    { key: "microfone", label: "Microfone", desc: "Fale e veja o nível captado.", kind: "mic" },
  ] },
  { id: "conect", title: "Conectividade", items: [
    { key: "rede", label: "Rede (LAN)", desc: "Rede, online e ping à internet.", kind: "connectivity" },
    { key: "portas", label: "Portas USB", desc: "Confirme manualmente.", kind: "manual" },
  ] },
  { id: "hardware", title: "Hardware", items: [
    { key: "fonte", label: "Fonte de alimentação", desc: "Confirme manualmente.", kind: "manual" },
    { key: "armazenamento", label: "Armazenamento (HD / SSD)", desc: "Confirme manualmente.", kind: "manual" },
    { key: "memoria", label: "Memória RAM", desc: "Confirme manualmente.", kind: "manual" },
    { key: "ventoinhas", label: "Ventoinhas / cooler", desc: "Confirme manualmente.", kind: "manual" },
    { key: "power_reset", label: "Botões power / reset", desc: "Confirme manualmente.", kind: "manual" },
  ] },
];

const OUTRO_SECTIONS: TestSection[] = [
  { id: "geral", title: "Verificação geral", items: [
    { key: "liga", label: "Liga / inicia", desc: "Confirme manualmente.", kind: "manual" },
    { key: "alimentacao", label: "Alimentação / carregamento", desc: "Confirme manualmente.", kind: "manual" },
    { key: "funcionamento", label: "Funcionamento geral", desc: "Confirme manualmente.", kind: "manual" },
    { key: "danos", label: "Danos físicos", desc: "Confirme manualmente.", kind: "manual" },
    { key: "acessorios", label: "Acessórios recebidos", desc: "Confirme manualmente.", kind: "manual" },
  ] },
];

export const CHECKLIST_SECTIONS_BY_TYPE: Record<DeviceType, TestSection[]> = {
  celular: CHECKLIST_SECTIONS,
  tablet: CHECKLIST_SECTIONS,
  notebook: NOTEBOOK_SECTIONS,
  desktop: DESKTOP_SECTIONS,
  outro: OUTRO_SECTIONS,
};

// Seções interativas do tipo (fallback celular); e a lista achatada correspondente (p/ submit/contagem).
export function interactiveTestsFor(t?: string | null): TestSection[] {
  return CHECKLIST_SECTIONS_BY_TYPE[(t as DeviceType) ?? "celular"] ?? CHECKLIST_SECTIONS;
}
export function allTestDefsFor(t?: string | null): TestDef[] {
  return interactiveTestsFor(t).flatMap((s) => s.items);
}

export type ManualChecklistItem = { key: string; label: string };

// Checklist manual simplificado (preenchido no painel, sem aparelho): itens essenciais
// que o atendente marca como OK / Falha / N.A. no ato da entrada.
// `celular` é a lista padrão (retrocompatível: OS antiga sem deviceType cai aqui).
export const MANUAL_CHECKLIST_ITEMS: ManualChecklistItem[] = [
  { key: "liga", label: "Liga / inicia" },
  { key: "tela_cores", label: "Tela e imagem" },
  { key: "touch", label: "Touch" },
  { key: "botoes", label: "Botões (power / volume)" },
  { key: "cam_front", label: "Câmera frontal" },
  { key: "cam_back", label: "Câmera traseira" },
  { key: "alto_falante", label: "Alto-falante" },
  { key: "microfone", label: "Microfone" },
  { key: "rede", label: "Wi-Fi / rede" },
  { key: "biometria", label: "Biometria" },
  { key: "vibracao", label: "Vibração" },
  { key: "carga", label: "Conector de carga" },
];

export const DEVICE_TYPE_LABEL: Record<DeviceType, string> = {
  celular: "Celular / Smartphone",
  tablet: "Tablet",
  notebook: "Notebook",
  desktop: "Desktop (PC)",
  outro: "Outro",
};

// Ordem dos tipos no seletor.
export const DEVICE_TYPES: DeviceType[] = ["celular", "tablet", "notebook", "desktop", "outro"];

// Template de checklist manual por tipo de aparelho.
export const MANUAL_CHECKLIST_BY_TYPE: Record<DeviceType, ManualChecklistItem[]> = {
  celular: MANUAL_CHECKLIST_ITEMS,
  tablet: [
    { key: "liga", label: "Liga / inicia" },
    { key: "tela_cores", label: "Tela e imagem" },
    { key: "touch", label: "Touch" },
    { key: "botoes", label: "Botões (power / volume)" },
    { key: "cam_front", label: "Câmera frontal" },
    { key: "cam_back", label: "Câmera traseira" },
    { key: "alto_falante", label: "Alto-falante" },
    { key: "microfone", label: "Microfone" },
    { key: "rede", label: "Wi-Fi / rede" },
    { key: "biometria", label: "Biometria" },
    { key: "carga", label: "Conector de carga" },
  ],
  notebook: [
    { key: "liga", label: "Liga / POST" },
    { key: "tela_cores", label: "Tela e imagem" },
    { key: "teclado", label: "Teclado" },
    { key: "touchpad", label: "Touchpad" },
    { key: "portas", label: "Portas (USB / HDMI)" },
    { key: "rede", label: "Wi-Fi / rede" },
    { key: "audio", label: "Áudio (alto-falante)" },
    { key: "webcam", label: "Webcam" },
    { key: "bateria", label: "Bateria" },
    { key: "carregador", label: "Carregador / fonte" },
    { key: "dobradica", label: "Dobradiça / carcaça" },
    { key: "aquecimento", label: "Aquecimento / ventoinha" },
    { key: "armazenamento", label: "Armazenamento (HD / SSD)" },
  ],
  desktop: [
    { key: "liga", label: "Liga / POST" },
    { key: "video", label: "Saída de vídeo" },
    { key: "portas", label: "Portas USB" },
    { key: "rede", label: "Rede (LAN)" },
    { key: "audio", label: "Áudio" },
    { key: "fonte", label: "Fonte de alimentação" },
    { key: "armazenamento", label: "Armazenamento (HD / SSD)" },
    { key: "memoria", label: "Memória RAM" },
    { key: "ventoinhas", label: "Ventoinhas / cooler" },
    { key: "power_reset", label: "Botões power / reset" },
  ],
  outro: [
    { key: "liga", label: "Liga / inicia" },
    { key: "alimentacao", label: "Alimentação / carregamento" },
    { key: "funcionamento", label: "Funcionamento geral" },
    { key: "danos", label: "Danos físicos" },
    { key: "acessorios", label: "Acessórios recebidos" },
  ],
};

// Retorna o template do tipo informado; fallback para `celular` (OS antiga sem deviceType).
export function manualChecklistFor(t?: string | null): ManualChecklistItem[] {
  return MANUAL_CHECKLIST_BY_TYPE[(t as DeviceType) ?? "celular"] ?? MANUAL_CHECKLIST_ITEMS;
}
